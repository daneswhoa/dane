import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

@Injectable()
export class AIAdapterService {
  private readonly logger = new Logger(AIAdapterService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com';
  }

  /**
   * Generates a non-streaming completion from DeepSeek.
   */
  async generateCompletion(messages: ChatMessage[], tools?: any[]): Promise<any> {
    const url = `${this.baseUrl}/v1/chat/completions`;
    
    const body: any = {
      model: 'deepseek-chat',
      messages,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
        throw new Error(`DeepSeek API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message;
    } catch (error) {
      this.logger.error('Failed to generate completion from DeepSeek', error);
      throw error;
    }
  }

  /**
   * Initiates a streaming completion request.
   * Returns the raw readable stream from the HTTP response.
   */
  async generateStream(messages: ChatMessage[], tools?: any[]): Promise<ReadableStream<Uint8Array>> {
    const url = `${this.baseUrl}/v1/chat/completions`;

    const body: any = {
      model: 'deepseek-chat',
      messages,
      stream: true,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepSeek Streaming API error: ${response.statusText} - ${errorText}`);
        throw new Error(`DeepSeek Streaming API failed: ${response.statusText}`);
      }

      return response.body as ReadableStream<Uint8Array>;
    } catch (error) {
      this.logger.error('Failed to initiate DeepSeek stream', error);
      throw error;
    }
  }
}
