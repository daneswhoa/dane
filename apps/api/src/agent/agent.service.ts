import { Injectable, Logger } from '@nestjs/common';
import { AIAdapterService, ChatMessage } from './ai-adapter.service';
import { AgentToolsService, SecurityContext } from './agent-tools.service';
import { AgentMemoryService } from './agent-memory.service';
import { Socket } from 'socket.io';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly aiAdapter: AIAdapterService,
    private readonly toolsService: AgentToolsService,
    private readonly memoryService: AgentMemoryService
  ) {}

  /**
   * Main orchestrator method triggered via WebSocket when a user messages Sophia.
   */
  async handleUserRequest(
    userId: string,
    role: string,
    allowedProperties: string | undefined,
    userMessage: string,
    client: Socket,
    navigationHistory?: any[],
    conversationId?: number
  ) {
    const context: SecurityContext = { userId, role, allowedProperties };
    
    try {
      // 1. Load context, memory & conversation history
      const memory = await this.memoryService.loadMemory(userId);
      const history = await this.memoryService.loadConversationHistory(userId, conversationId);

      // Assemble system prompt with memory context
      const memoryString = Object.entries(memory)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');

      const navHistoryString = navigationHistory && navigationHistory.length > 0
        ? navigationHistory.map((h: any) => `- Visited path "${h.path}" at ${new Date(h.timestamp).toLocaleTimeString()}`).join('\n')
        : '(No recent page visit history logged)';

      const systemPrompt = `You are Sophia, the chief AI property administrator and coordinator for this system.
Your personality is helpful, warm, polite, and female. You speak directly to the property manager/user as a professional colleague.
Always keep messages completely free of marketing fluff and industrial jargon (e.g. use simple labels like "Note", "Ticket", "Plumber", "Status", "Sending...").

CRITICAL TOOL USAGE RULES:
1. NEVER guess, assume, or hallucinate properties, property counts, unit details, or names (e.g. "Sunset Apartments", "Maple Lofts", "Harbor Condos", "Mau's Appartmen").
2. To check what properties the user manages or owns, you MUST call the 'get_properties' tool. Never answer without running 'get_properties' first if the query is about their properties list.
3. To check portfolio metrics (number of vacant/occupied units, rents, deposits, etc.), you MUST call the 'get_portfolio_summary' tool.
4. If a tool execution fails, tell the user the tool failed and guide them on how to navigate manually using the guide below.

Dashboard Navigation & Structural Guide:
Use this directory guide to instruct users how to navigate manually if a tool fails or if they ask for instructions:
1. **Overview ('/overview')**: General landlord dashboard summarizing portfolios, active tickets, and properties.
2. **Properties ('/properties')**: List of all buildings. Clicking a building takes the user to:
   - Details Page ('/properties/[id]'): View unit registers and specific edit parameters.
   - Onboard Setup Workspace ('/properties/[id]/setup'): Excel spreadsheet importer or batch unit generator page.
3. **Tenants ('/tenants')**: Tenant ledger listing lease durations, deposits, rent rates, and Kin contacts.
4. **Finance Section**:
   - Payments & Expenses ('/finance/expenses'): General transaction ledgers. Offers filter menus.
   - Invoices ('/finance/invoices'): View, generate, or cancel invoices for occupants or vacant property upkeep.
   - Wallet ('/finance/wallet'): Manage Stripe links and payments.
5. **Operations Section**:
   - Maintenance Hub ('/maintenance'): Open/closed maintenance tasks. Inspect tickets, review quotes, or assign technicians.
   - Contractors ('/contractors'): Marketplace directory. Filter specialists (Plumbers, Electricians) and contract them.
6. **Communication Section**:
   - Inbox ('/communication/inbox'): Core messaging log for landlord-tenant chat.
   - Email Broadcasts ('/communication/broadcasts'): Create newsletters or late rent announcements.
   - Automations ('/communication/automations'): Setup event-based automated alerts.
   - Templates ('/communication/templates'): Custom HTML drafts library.
7. **Analytics ('/analytics')**: Real-time yields and earnings graphs.
8. **Security & Audit ('/security')**: Audit trail log tracking account actions.
9. **Team / Organization ('/team')**: Setup org name, upload corporate logo, configure coworker permissions.

Your Core Priorities:
1. **Prioritize Cost-Saving**: When assigning contractors to tickets, search for the cheapest options, lowball contractor rates by proposing a negotiated lower price (e.g. 15-20% discount on their standard rate), and bookmark preferred contractors in the marketplace.
2. **Negligence Billing**: If a maintenance ticket describes damage caused by tenant mistakes or ridiculous requests (e.g. clogged toilet from toys, broken glass from playing ball, lost keys), charge them directly using the 'create_tenant_invoice' tool.
3. **Ask Before Redirecting**: You must ALWAYS ask the user for permission before triggering a navigation page redirect (e.g., "Would you like me to take you to the setup workspace?").
4. **Escalate Recurrent Issues**: If a tool fails or you hit errors repeatedly, log the error. If you notice a recurrent issue, notify the manager by saying "I have escalated the error," and email the developer (mark.mainac@gmail.com).
5. **Enforce Permissions**: If you hit a permission issue or a tool reports that the user is unauthorized, state clearly: "You do not have permission to do that action."
6. **Tenant Move and Rent Adjustments**: You can move tenants using the 'move_tenant' tool, adjust portfolio rent programmatically (e.g., in response to market research or optimization requests) using the 'adjust_portfolio_rent' tool, modify property names using 'update_property_details', and mark units as vacant using 'mark_unit_vacant'. Always explain your calculations and adjustments clearly to the user.


Recent User Browser Navigation Logs (LocalStorage):
${navHistoryString}

Current User Memory & Preferences:
${memoryString || '(No preferences saved yet)'}

Remember to enforce security implicitly. Do not attempt to run tools outside of the manager's portfolio parameters.`;

      // 2. Add new user message to history
      const newMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: userMessage },
      ];

      // 3. Initiate agent thinking loop
      await this.runAgentLoop(newMessages, context, client, 1, 0, 0, conversationId);

    } catch (err: any) {
      this.logger.error('Error handling agent execution loop', err);
      client.emit('sophia-error', { message: 'Something went wrong inside my reasoning loop.' });
    }
  }

  /**
   * Executes the autonomous reasoning and tool-calling loop (max 5 rounds)
   */
   private async runAgentLoop(
    messages: ChatMessage[],
    context: SecurityContext,
    client: Socket,
    round: number = 1,
    successCount: number = 0,
    failureCount: number = 0,
    conversationId?: number
  ): Promise<void> {
    if (round > 15) {
      client.emit('sophia-token', { text: '\n\n*(I have hit my limit of operations (15 steps) for this request. Let me know what you want to do next!)*' });
      client.emit('sophia-token-metrics', { successCount, failureCount });
      await this.saveHistory(context.userId, messages, conversationId, client);
      return;
    }

    this.logger.log(`Starting Sophia agent loop round ${round}...`);
    client.emit('sophia-status', { status: 'thinking', message: 'Sophia is thinking...' });

    const tools = this.toolsService.getToolsDeclarations();
    
    // Request stream from DeepSeek
    const stream = await this.aiAdapter.generateStream(messages, tools);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    let textResult = '';
    
    const toolCallsMap = new Map<number, { id: string; name: string; arguments: string }>();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned) continue;
        if (cleaned === 'data: [DONE]') continue;
        if (cleaned.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(cleaned.substring(6));
            const choice = parsed.choices[0];
            const delta = choice?.delta;
            
            if (!delta) continue;

            if (delta.content) {
              textResult += delta.content;
              client.emit('sophia-token', { text: delta.content });
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index;
                if (!toolCallsMap.has(idx)) {
                  toolCallsMap.set(idx, { id: tc.id || '', name: tc.function?.name || '', arguments: '' });
                }
                const activeTc = toolCallsMap.get(idx)!;
                if (tc.id) activeTc.id = tc.id;
                if (tc.function?.name) activeTc.name = tc.function.name;
                if (tc.function?.arguments) {
                  activeTc.arguments += tc.function.arguments;
                }
              }
            }
          } catch (e) {
            // Silence JSON parsing errors
          }
        }
      }
    }

    const toolCalls = Array.from(toolCallsMap.values());

    if (toolCalls.length > 0) {
      messages.push({
        role: 'assistant',
        content: textResult || '',
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: tc.arguments }
        }))
      });

      let nextSuccessCount = successCount;
      let nextFailureCount = failureCount;

      for (const tc of toolCalls) {
        client.emit('sophia-status', { status: 'tool', message: `Consulting subagent details (${tc.name})...` });
        
        // Generate an action tracking ID
        const actionId = 'act-' + Math.random().toString(36).substring(2, 9);
        client.emit('sophia-action-start', {
          id: actionId,
          name: tc.name,
          details: `Arguments: ${tc.arguments}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        try {
          const args = JSON.parse(tc.arguments || '{}');
          this.logger.log(`Sophia calling tool: ${tc.name} with args: ${JSON.stringify(args)}`);

          let toolOutput: any;

          switch (tc.name) {
            case 'calculate_formula':
              toolOutput = await this.toolsService.calculateFormula(context, args);
              break;
            case 'get_portfolio_summary':
              toolOutput = await this.toolsService.getPortfolioSummary(context);
              break;
            case 'get_properties':
              toolOutput = await this.toolsService.getProperties(context);
              break;
            case 'add_property':
              toolOutput = await this.toolsService.addProperty(context, args);
              break;
            case 'upload_property_setup':
              toolOutput = await this.toolsService.uploadPropertySetup(context, args);
              break;
            case 'update_property_image':
              toolOutput = await this.toolsService.updatePropertyImage(context, args);
              break;
            case 'create_maintenance_ticket':
              toolOutput = await this.toolsService.createMaintenanceTicket(context, args);
              break;
            case 'find_contractors':
              toolOutput = await this.toolsService.findContractors(args.specialty);
              break;
            case 'bookmark_contractor':
              toolOutput = await this.toolsService.bookmarkContractor(context, args);
              break;
            case 'assign_contractor_to_ticket':
              toolOutput = await this.toolsService.assignContractorToTicket(context, args);
              break;
            case 'check_job_status':
              toolOutput = await this.toolsService.checkJobStatus(context, args);
              break;
            case 'save_user_note':
              toolOutput = await this.toolsService.saveUserNote(context, args);
              await this.memoryService.saveMemory(context.userId, args.title, args.content);
              break;
            case 'get_invoices':
              toolOutput = await this.toolsService.getInvoices(context, args);
              break;
            case 'create_tenant_invoice':
              toolOutput = await this.toolsService.createTenantInvoice(context, args);
              break;
            case 'create_vacancy_invoice':
              toolOutput = await this.toolsService.createVacancyInvoice(context, args);
              break;
            case 'filter_records':
              toolOutput = await this.toolsService.filterRecords(context, args);
              break;
            case 'create_email_campaign':
              toolOutput = await this.toolsService.createEmailCampaign(context, args);
              break;
            case 'save_email_template':
              toolOutput = await this.toolsService.saveEmailTemplate(context, args);
              break;
            case 'get_notifications':
              toolOutput = await this.toolsService.getNotifications(context);
              break;
            case 'undo_action':
              toolOutput = await this.toolsService.undoAction(context, args);
              break;
            case 'view_company_finances':
              toolOutput = await this.toolsService.viewCompanyFinances(context);
              break;
            case 'toggle_theme':
              client.emit('sophia-action', { type: 'theme', theme: args.theme });
              client.to(`user:${context.userId}`).emit('sophia-action', { type: 'theme', theme: args.theme });
              toolOutput = { success: true, theme: args.theme };
              break;
            case 'toggle_sidebar':
              client.emit('sophia-action', { type: 'sidebar', action: args.action });
              client.to(`user:${context.userId}`).emit('sophia-action', { type: 'sidebar', action: args.action });
              toolOutput = { success: true, sidebarState: args.action };
              break;
            case 'log_agent_error':
              toolOutput = await this.toolsService.logAgentError(context, args);
              break;
            case 'check_recent_errors':
              toolOutput = await this.toolsService.checkRecentErrors(context, args);
              break;
             case 'send_escalation_email':
              toolOutput = await this.toolsService.sendEscalationEmail(context, args);
              break;
            case 'move_tenant':
              toolOutput = await this.toolsService.moveTenant(context, args);
              break;
            case 'adjust_portfolio_rent':
              toolOutput = await this.toolsService.adjustPortfolioRent(context, args);
              break;
            case 'update_property_details':
              toolOutput = await this.toolsService.updatePropertyDetails(context, args);
              break;
            case 'mark_unit_vacant':
              toolOutput = await this.toolsService.markUnitVacant(context, args);
              break;
            default:
              toolOutput = { error: `Tool ${tc.name} is not recognized by subagents.` };
          }

          nextSuccessCount++;
          client.emit('sophia-action-end', { id: actionId, status: 'completed' });

          messages.push({
            role: 'tool',
            name: tc.name,
            tool_call_id: tc.id,
            content: JSON.stringify(toolOutput)
          });

          if (tc.name === 'get_portfolio_summary') {
            client.emit('sophia-widget', { type: 'portfolio', data: toolOutput });
          } else if (tc.name === 'create_maintenance_ticket') {
            client.emit('sophia-widget', { type: 'ticket', data: toolOutput });
          } else if (tc.name === 'find_contractors') {
            client.emit('sophia-widget', { type: 'contractors', data: toolOutput });
          } else if (tc.name === 'get_invoices') {
            client.emit('sophia-widget', { type: 'invoices', data: toolOutput });
          } else if (tc.name === 'save_user_note') {
            client.emit('sophia-widget', { type: 'note', data: toolOutput, title: args.title, content: args.content });
          } else if (tc.name === 'filter_records') {
            client.emit('sophia-widget', { type: 'filter', dataset: args.dataset, data: toolOutput });
          } else if (tc.name === 'add_property' || tc.name === 'upload_property_setup') {
            client.emit('sophia-widget', { type: 'property', data: toolOutput });
          } else if (tc.name === 'view_company_finances') {
            client.emit('sophia-widget', { type: 'finances', data: toolOutput });
          } else if (tc.name === 'get_notifications') {
            client.emit('sophia-widget', { type: 'notifications', data: toolOutput });
          }

        } catch (err: any) {
          nextFailureCount++;
          client.emit('sophia-action-end', { id: actionId, status: 'failed' });
          this.logger.error(`Error executing tool ${tc.name}`, err);
          
          const isForbidden = err.status === 403 || err.message?.toLowerCase().includes('denied') || err.message?.toLowerCase().includes('permission');
          if (isForbidden) {
            client.emit('sophia-token', { text: '\n\n**You do not have permission to do that action.**' });
            messages.push({
              role: 'tool',
              name: tc.name,
              tool_call_id: tc.id,
              content: JSON.stringify({ error: 'You do not have permission to do that action.' })
            });
            continue;
          }

          const errorName = err.name || 'ToolExecutionError';
          const errorMessage = err.message || 'Unknown crash occurred during tool call';
          const taskContext = `Attempted to call ${tc.name} with arguments: ${tc.arguments}`;
          
          await this.toolsService.logAgentError(context, { errorName, errorMessage, taskContext });

          const recentLogs = await this.toolsService.checkRecentErrors(context, { errorName });
          if (recentLogs.occurrenceCount >= 3) {
            client.emit('sophia-token', { text: '\n\n**I have escalated the error.**' });
            await this.toolsService.sendEscalationEmail(context, {
              errorDetails: `Error: ${errorName}\nMessage: ${errorMessage}\nOccurrences: ${recentLogs.occurrenceCount}\nContext: ${taskContext}`
            });
          }

          messages.push({
            role: 'tool',
            name: tc.name,
            tool_call_id: tc.id,
            content: JSON.stringify({ error: 'An unexpected execution issue occurred. Sophia has escalated this issue.' })
          });
        }
      }

      await this.runAgentLoop(messages, context, client, round + 1, nextSuccessCount, nextFailureCount, conversationId);

    } else {
      if (textResult) {
        messages.push({ role: 'assistant', content: textResult });
      }
      client.emit('sophia-status', { status: 'idle', message: 'Ready' });
      client.emit('sophia-token-metrics', { successCount, failureCount });
      await this.saveHistory(context.userId, messages, conversationId, client);
    }
  }

  private async saveHistory(userId: string, messages: ChatMessage[], conversationId?: number, client?: Socket) {
    const filtered = messages
      .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
      .map(m => ({
        sender: m.role === 'user' ? 'user' : 'sophia',
        text: m.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

    const slice = filtered.slice(-40);
    const savedId = await this.memoryService.saveConversationHistory(userId, slice, conversationId);
    if (client && savedId && savedId !== conversationId) {
      client.emit('sophia-thread-sync', { conversationId: savedId });
    }
  }
}
