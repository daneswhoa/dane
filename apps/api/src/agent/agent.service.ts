import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import * as path from 'path';
import * as fs from 'fs';
import { toolsRegistry, getOpenAITools, getGeminiTools } from './tool-registry';
import { DATABASE_CONNECTION } from '../db/database.module';

export interface AgentEvent {
  type: 'text' | 'status' | 'action_start' | 'action_end' | 'widget' | 'error';
  payload: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly openai: OpenAI;
  private readonly googleGenAI: GoogleGenAI;
  private readonly geminiModel: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {
    // 1. Initialize OpenAI client for DeepSeek
    const deepseekApiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    const deepseekBaseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com';
    this.openai = new OpenAI({
      apiKey: deepseekApiKey,
      baseURL: deepseekBaseUrl,
    });

    // 2. Handle GCP Credentials for Railway/Cloud deployments
    const gcpJson = this.configService.get<string>('GCP_CREDENTIALS_JSON') || this.configService.get<string>('GOOGLE_CREDENTIALS_JSON');
    if (gcpJson) {
      try {
        const tmpPath = path.resolve(process.cwd(), '.gcp-credentials.json');
        fs.writeFileSync(tmpPath, gcpJson, 'utf8');
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
        this.logger.log('Loaded GCP credentials from environment variable and wrote to local temp file.');
      } catch (err) {
        this.logger.error('Failed to write GCP credentials from env var:', err);
      }
    } else {
      // Fallback for local development using relative path
      const credentialsPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
      if (credentialsPath && !path.isAbsolute(credentialsPath)) {
        let absolutePath = path.resolve(process.cwd(), credentialsPath);
        // Fallback: If not found and process.cwd() is inside apps/api, check monorepo root
        if (!fs.existsSync(absolutePath)) {
          const fallbackPath = path.resolve(process.cwd(), '..', '..', credentialsPath);
          if (fs.existsSync(fallbackPath)) {
            absolutePath = fallbackPath;
          }
        }
        process.env.GOOGLE_APPLICATION_CREDENTIALS = absolutePath;
        this.logger.log(`Resolved GOOGLE_APPLICATION_CREDENTIALS relative path to absolute: ${absolutePath}`);
      }
    }

    // 3. Initialize GoogleGenAI client for Gemini Enterprise
    const projectId = this.configService.get<string>('GCS_PROJECT_ID');
    this.geminiModel = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-pro';
    this.googleGenAI = new GoogleGenAI({
      enterprise: true,
      project: projectId,
      location: 'us-central1',
    });
  }

  /**
   * Main orchestrator logic generating streaming events for Sophia's execution.
   */
  async *runAgent(
    userId: string,
    userRole: string,
    allowedProperties: string | undefined,
    userMessage: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[],
    fileData?: { base64Data: string; fileName: string },
    audioData?: { base64Data: string; mimeType: string },
    signal?: AbortSignal
  ): AsyncGenerator<AgentEvent> {
    const provider = this.selectProvider(userMessage, fileData, audioData);
    
    if (signal?.aborted) {
      yield { type: 'text', payload: ' *(Interrupted before starting)*' };
      yield { type: 'status', payload: { status: 'idle', message: 'Ready' } };
      return;
    }

    yield { type: 'status', payload: { status: 'thinking', message: `Sophia is routing your request to ${provider === 'gemini' ? 'Gemini Enterprise (Native Multimodal)' : 'DeepSeek'}...` } };

    // Format system instruction
    let systemPrompt = `You are Sophia, the chief AI property administrator and coordinator for this system.
Your personality is helpful, warm, polite, and female. You speak directly to the property manager/user as a professional colleague.
Always keep messages completely free of marketing fluff and industrial jargon (e.g. use simple labels like "Note", "Ticket", "Plumber", "Status", "Sending...").

If you need to know which properties or units have not been set up yet, use the 'getPropertiesSetupStatus' tool.
- Properties with a status of 'pending' are unsetup.
- You can offer to set them up for the user, or set them up directly if requested.

To set up or edit a property or its units, use the 'setupOrUpdatePropertyAndUnits' tool:
- You can change a property from multi-unit to single-unit or vice versa (by setting 'unitsCount' to 1 or more than 1).
- You can modify the property photo ('photoUrl'), name ('name'), and location/address ('address').
- To set up a single-unit property (unitsCount = 1), ask the user for:
  1. The total rent per month.
  2. The total security deposit.
  3. Recurring fees (monthly fees paid stacked with rent, e.g. Wifi, parking, water) and explain that these are fees paid out every month.
  4. Move-in fees (one-time fee paid for a tenant to move in, like cleaning or admin fee).
  5. The date/day when rent is due every month (e.g., 1st, 5th) and late fees.
- Note that all of these options are optional. If they are not filled, the unit remains unsetup in the system, and you will be able to see that on subsequent status checks.
- You can edit any of these details for a property or its units at any time.

If the user wants to create, upload, or add a property, use the 'createBarebonesProperty' tool.
- First check if the name and type ('house' or 'apartment') are provided or can be inferred.
- If not, ask the user for clarification (e.g., whether it has multiple units or is just a house/single unit, name, location, and photo/image).
- If the user sends an image in their message, you will see a tag in the text format: \`[Attached Image: http://...]\`. Use the URL as the 'photoUrl' parameter when calling 'createBarebonesProperty'.
- If the user does not provide location/photo/units details but asks to go ahead, you can proceed by calling the tool with just the name and type. The system will automatically handle the fallback values (like generating a retro theme placeholder illustration for the property photo).
- Always confirm to the user once the property has been successfully created.

You have the ability to parse and visualize Excel spreadsheets. If the user provides a spreadsheet or asks to visualize spreadsheet data, invoke the 'parse_and_visualize_excel' tool.
When a file is attached, you will be notified of its presence. Call 'parse_and_visualize_excel' to process the attachment. You do not need to guess or output the base64 data yourself; the system will automatically inject the file data during execution.

If the user sends you a voice/audio message, listen to it directly. It will be provided to you as audio data. Respond to the spoken instructions directly.`;

    if (userRole === 'tenant') {
      systemPrompt = `You are Sophia, an AI resident assistant. Your personality is friendly, helpful, warm, polite, and female. You speak directly to the tenant/resident to assist them with their living experience.
Always keep messages completely free of jargon and keep them concise and supportive.
You can help the tenant with:
- Understanding invoices received: Use 'getTenantInvoices' to pull their invoice ledger (pass their tenantId if known, or empty arguments to let the system default to their ID if possible). Note: The system currently links tools via the agent context.
- Creating maintenance requests: Use 'manageMaintenanceTickets' with action 'create' to submit a maintenance request. Ask them for a description, urgency, and category.
- Checking due invoices: Again, use 'getTenantInvoices'.
- Checking maintenance request status: Use 'manageMaintenanceTickets' with action 'fetch' to pull their recent requests.
If they ask for lease documents or things you cannot do, politely let them know your current capabilities.
If the user sends you a voice/audio message, listen to it directly and respond.`;
    }

    // Assemble messages list
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(h => ({ role: h.role, content: h.content })),
    ];

    // Append user message with optional attachment metadata
    let finalUserMessage = userMessage;
    if (fileData) {
      finalUserMessage = `[Attachment: ${fileData.fileName} (base64 data available)]\n\n${userMessage}`;
    } else if (audioData) {
      finalUserMessage = userMessage || '[Sent voice message]';
    }
    messages.push({ role: 'user', content: finalUserMessage });

    const maxRounds = 5;
    let round = 1;

    while (round <= maxRounds) {
      if (signal?.aborted) {
        this.logger.log(`Sophia run interrupted by user at round ${round}.`);
        yield { type: 'text', payload: ' *(Interrupted)*' };
        yield { type: 'status', payload: { status: 'idle', message: 'Ready' } };
        break;
      }

      this.logger.log(`Running Sophia execution round ${round}/${maxRounds} using ${provider}`);

      try {
        if (provider === 'deepseek') {
          const events = this.runDeepSeekRound(messages, signal);
          let hasToolCalls = false;
          const toolCallsAccumulator: any[] = [];
          let textAccumulator = '';

          for await (const event of events) {
            if (signal?.aborted) {
              throw new Error('AbortError');
            }
            if (event.type === 'text') {
              textAccumulator += event.payload;
              yield { type: 'text', payload: event.payload };
            } else if (event.type === 'tool_calls') {
              hasToolCalls = true;
              toolCallsAccumulator.push(...event.payload);
            }
          }

          if (!hasToolCalls) {
            messages.push({ role: 'assistant', content: textAccumulator });
            break;
          }

          // Process tool calls
          messages.push({ role: 'assistant', content: textAccumulator, tool_calls: toolCallsAccumulator });
          yield* this.executeTools(toolCallsAccumulator, messages, userId, userRole, fileData, signal);
        } else {
          // Gemini
          const events = this.runGeminiRound(messages, systemPrompt, audioData, signal);
          let hasToolCalls = false;
          const toolCallsAccumulator: any[] = [];
          let textAccumulator = '';
 
          for await (const event of events) {
            if (signal?.aborted) {
              throw new Error('AbortError');
            }
            if (event.type === 'text') {
              textAccumulator += event.payload;
              yield { type: 'text', payload: event.payload };
            } else if (event.type === 'tool_calls') {
              hasToolCalls = true;
              toolCallsAccumulator.push(...event.payload);
            }
          }
 
          if (!hasToolCalls) {
            messages.push({ role: 'assistant', content: textAccumulator });
            break;
          }
 
          // Process tool calls
          messages.push({ role: 'assistant', content: textAccumulator, tool_calls: toolCallsAccumulator });
          yield* this.executeTools(toolCallsAccumulator, messages, userId, userRole, fileData, signal);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message?.includes('Abort') || signal?.aborted) {
          this.logger.log('Sophia reasoning round exited due to user interruption.');
          yield { type: 'text', payload: ' *(Interrupted)*' };
          yield { type: 'status', payload: { status: 'idle', message: 'Ready' } };
          break;
        }
        this.logger.error(`Error in Sophia reasoning loop round ${round}`, err);
        yield { type: 'error', payload: { message: `Sophia encountered an issue: ${err.message}` } };
        break;
      }

      round++;
    }

    if (round > maxRounds && !signal?.aborted) {
      yield { type: 'text', payload: '\n\n*(I have hit my reasoning execution limits for this turn. Let me know if you would like me to continue!)*' };
    }
  }

  /**
   * Route request to Gemini for excel/spreadsheet tasks and native audio, and DeepSeek for normal conversation
   */
  private selectProvider(userMessage: string, fileData?: any, audioData?: any): 'gemini' | 'deepseek' {
    if (audioData && audioData.base64Data && audioData.base64Data.trim() !== '') {
      return 'gemini'; // Gemini has native multimodal audio capabilities
    }
    
    const query = userMessage.toLowerCase();
    if (
      (fileData && fileData.base64Data && fileData.base64Data.trim() !== '') ||
      query.includes('excel') ||
      query.includes('spreadsheet') ||
      query.includes('sheet') ||
      query.includes('visual') ||
      query.includes('chart') ||
      query.includes('graph') ||
      query.includes('parse')
    ) {
      return 'gemini';
    }
    
    // Defaulting to gemini instead of deepseek because gemini handles tool calling much more reliably
    return 'gemini';
  }

  /**
   * Run one streaming DeepSeek round using the official OpenAI SDK
   */
  private async *runDeepSeekRound(
    messages: ChatMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<{ type: 'text' | 'tool_calls'; payload: any }> {
    const openAIMessages = messages.map(m => {
      const msg: any = { role: m.role, content: m.content };
      if (m.tool_calls) {
        msg.tool_calls = m.tool_calls;
      }
      if (m.tool_call_id) {
        msg.tool_call_id = m.tool_call_id;
        msg.name = m.name;
      }
      return msg;
    });

    const stream = await this.openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: openAIMessages,
      stream: true,
      tools: getOpenAITools(),
      tool_choice: 'auto',
    }, { signal });

    const accumulatedToolCalls: any[] = [];

    for await (const chunk of stream) {
      if (signal?.aborted) {
        throw new Error('AbortError');
      }
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        yield { type: 'text', payload: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const index = tc.index;
          if (!accumulatedToolCalls[index]) {
            accumulatedToolCalls[index] = { id: tc.id || '', type: 'function', function: { name: tc.function?.name || '', arguments: '' } };
          }
          if (tc.id) accumulatedToolCalls[index].id = tc.id;
          if (tc.function?.name) accumulatedToolCalls[index].function.name = tc.function.name;
          if (tc.function?.arguments) {
            accumulatedToolCalls[index].function.arguments += tc.function.arguments;
          }
        }
      }
    }

    const finalToolCalls = accumulatedToolCalls.filter(Boolean);
    if (finalToolCalls.length > 0) {
      yield { type: 'tool_calls', payload: finalToolCalls };
    }
  }

  /**
   * Run one streaming Gemini round using the official Google GenAI SDK
   */
  private async *runGeminiRound(
    messages: ChatMessage[],
    systemPrompt: string,
    audioData?: { base64Data: string; mimeType: string },
    signal?: AbortSignal
  ): AsyncGenerator<{ type: 'text' | 'tool_calls'; payload: any }> {
    const { contents } = this.mapMessagesToGemini(messages, audioData);

    const responseStream = await this.googleGenAI.models.generateContentStream({
      model: this.geminiModel,
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools: getGeminiTools(),
      },
    });

    const toolCalls: any[] = [];
    let toolCallIndex = 0;

    for await (const chunk of responseStream) {
      if (signal?.aborted) {
        throw new Error('AbortError');
      }
      if (chunk.text) {
        yield { type: 'text', payload: chunk.text };
      }

      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        for (const fc of chunk.functionCalls) {
          const argsStr = JSON.stringify(fc.args);
          // Deduplicate to prevent multiple identical tool executions per round
          const isDuplicate = toolCalls.some(
            tc => tc.function.name === fc.name && tc.function.arguments === argsStr
          );
          if (!isDuplicate) {
            toolCalls.push({
              id: fc.id || `call_${Date.now()}_${toolCallIndex++}`,
              type: 'function',
              function: {
                name: fc.name,
                arguments: argsStr,
              },
            });
          }
        }
      }
    }

    if (toolCalls.length > 0) {
      yield { type: 'tool_calls', payload: toolCalls };
    }
  }

  /**
   * Execute scheduled tools, log actions, and return streaming events
   */
  private async *executeTools(
    toolCalls: any[],
    messages: ChatMessage[],
    userId: string,
    userRole: string,
    fileData?: { base64Data: string; fileName: string },
    signal?: AbortSignal
  ): AsyncGenerator<AgentEvent> {
    for (const tc of toolCalls) {
      if (signal?.aborted) {
        throw new Error('AbortError');
      }
      const toolName = tc.function.name;
      let toolArgsStr = tc.function.arguments || '{}';
      
      yield { type: 'status', payload: { status: 'tool', message: `Sophia is running tool: ${toolName}...` } };
      yield { type: 'action_start', payload: { id: tc.id, name: toolName } };
 
      try {
        const args = JSON.parse(toolArgsStr);
 
        // Intercept and inject base64 data for Excel parsing if uploaded
        if (toolName === 'parse_and_visualize_excel' && fileData) {
          args.base64Data = fileData.base64Data;
          args.fileName = fileData.fileName;
          this.logger.log(`Automatically injected base64 content for tool ${toolName}`);
        }
 
        this.logger.log(`Executing tool ${toolName} with args: ${JSON.stringify(args)}`);
        
        // Find registered executor
        const registeredTool = toolsRegistry.find(t => t.name === toolName);
        if (!registeredTool) {
          throw new Error(`Tool ${toolName} is not registered in the system.`);
        }
 
        const output = await registeredTool.execute(args, { db: this.db, userId, userRole });

        // Truncate output preview for messages list if extremely large
        let outputStr = JSON.stringify(output);
        const MAX_PREVIEW_LIMIT = 5000;
        if (outputStr.length > MAX_PREVIEW_LIMIT) {
          outputStr = outputStr.substring(0, MAX_PREVIEW_LIMIT) + `... [TRUNCATED - Omitted ${outputStr.length - MAX_PREVIEW_LIMIT} chars]`;
        }

        messages.push({
          role: 'tool',
          name: toolName,
          tool_call_id: tc.id,
          content: outputStr,
        });

        yield { type: 'action_end', payload: { id: tc.id, status: 'completed' } };

        // If the tool succeeded and returned visualization parameters, push widget event!
        if (output.success && output.sheets) {
          yield { type: 'widget', payload: { type: 'excel-visualization', data: output } };
        }

        if (output.success && toolName === 'createBarebonesProperty') {
          yield { type: 'widget', payload: { type: 'property-created', data: output } };
        }

        if (output.success && toolName === 'setupOrUpdatePropertyAndUnits') {
          yield { type: 'widget', payload: { type: 'property-setup-completed', data: output } };
        }

        if (output.success && toolName === 'addTenantToUnit') {
          yield { type: 'widget', payload: { type: 'tenant-added', data: output } };
        }

        if (output.success && toolName === 'addInvoice') {
          yield { type: 'widget', payload: { type: 'invoice-added', data: output } };
        }

        if (output.success && toolName === 'manageMaintenanceTickets') {
          if (args.action === 'fetch') yield { type: 'widget', payload: { type: 'ticket-list', data: output } };
          if (args.action === 'create') yield { type: 'widget', payload: { type: 'ticket-created', data: output } };
        }

        if (output.success && toolName === 'manageContractors' && args.action === 'browse') {
          yield { type: 'widget', payload: { type: 'contractor-list', data: output } };
        }

        if (output.success && toolName === 'dispatchAndSettleTicket') {
          yield { type: 'widget', payload: { type: 'dispatch-receipt', data: { ...output, args } } };
        }

        if (output.success && toolName === 'getTenantInvoices') {
          yield { type: 'widget', payload: { type: 'invoice-summary', data: output } };
        }

        if (output.success && toolName === 'manageInvoice') {
          yield { type: 'widget', payload: { type: 'invoice-managed', data: { ...output, args } } };
        }

      } catch (err: any) {
        this.logger.error(`Error executing tool ${toolName}`, err);
        messages.push({
          role: 'tool',
          name: toolName,
          tool_call_id: tc.id,
          content: JSON.stringify({ success: false, error: err.message }),
        });
        yield { type: 'action_end', payload: { id: tc.id, status: 'failed', error: err.message } };
      }
    }
  }

  /**
   * Helper to format chat history for Gemini alternate role structures
   */
  private mapMessagesToGemini(
    messages: ChatMessage[],
    audioData?: { base64Data: string; mimeType: string }
  ): { contents: any[] } {
    const rawTurns: { role: 'user' | 'model'; parts: any[] }[] = [];

    // Find index of the very last user message in the list
    const lastUserIdx = messages.map((m, idx) => m.role === 'user' ? idx : -1).reduce((a, b) => Math.max(a, b), -1);

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'system') {
        continue;
      }

      if (msg.role === 'user') {
        const parts: any[] = [];
        // Inject voice audio data as inlineData if present
        if (i === lastUserIdx && audioData) {
          parts.push({
            inlineData: {
              mimeType: audioData.mimeType,
              data: audioData.base64Data,
            },
          });
        }
        parts.push({ text: msg.content });
        rawTurns.push({
          role: 'user',
          parts,
        });
      } else if (msg.role === 'assistant') {
        const parts: any[] = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (msg.tool_calls && msg.tool_calls.length > 0) {
          for (const tc of msg.tool_calls) {
            parts.push({
              functionCall: {
                name: tc.function.name,
                args: typeof tc.function.arguments === 'string'
                  ? this.tryParseJSON(tc.function.arguments)
                  : tc.function.arguments,
              },
            });
          }
        }
        if (parts.length > 0) {
          rawTurns.push({
            role: 'model',
            parts,
          });
        }
      } else if (msg.role === 'tool') {
        rawTurns.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: msg.name || '',
              response: {
                result: typeof msg.content === 'string'
                  ? this.tryParseJSON(msg.content)
                  : msg.content,
              },
            },
          }],
        });
      }
    }

    // Merge consecutive turns with the same role to strictly alternate user/model turns
    const contents: any[] = [];
    for (const turn of rawTurns) {
      if (contents.length > 0 && contents[contents.length - 1].role === turn.role) {
        contents[contents.length - 1].parts.push(...turn.parts);
      } else {
        contents.push(turn);
      }
    }

    return { contents };
  }

  private tryParseJSON(str: string): any {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }
}
