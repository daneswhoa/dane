import { Controller, Get, Delete, Post, Param, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/auth.guard';
import { AgentMemoryService } from './agent-memory.service';

@Controller('agent')
@UseGuards(SessionGuard)
export class AgentController {
  constructor(private readonly memoryService: AgentMemoryService) {}

  @Get('threads')
  async getAllConversations(@Req() req: any) {
    const userId = req.user.id;
    const threads = await this.memoryService.loadAllConversations(userId);
    return { success: true, threads };
  }

  @Post('threads')
  async startNewConversation(@Req() req: any) {
    const userId = req.user.id;
    // Save an empty history array to generate a new thread row and return its ID
    const newId = await this.memoryService.saveConversationHistory(userId, [], undefined);
    return { success: true, conversationId: newId };
  }

  @Get('threads/:id')
  async getConversationHistory(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const list = await this.memoryService.loadConversationHistory(userId, Number(id));
    return { success: true, history: list };
  }

  @Delete('threads/:id')
  async deleteConversation(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    await this.memoryService.deleteConversation(userId, Number(id));
    return { success: true, message: 'Conversation deleted.' };
  }

  @Get('history')
  async getChatHistory(@Req() req: any) {
    const userId = req.user.id;
    const list = await this.memoryService.loadConversationHistory(userId);
    return { success: true, history: list };
  }

  @Delete('history')
  async clearChatHistory(@Req() req: any) {
    const userId = req.user.id;
    await this.memoryService.clearConversationHistory(userId);
    return { success: true, message: 'Chat history cleared.' };
  }

  @Get('memory')
  async getUserMemory(@Req() req: any) {
    const userId = req.user.id;
    const memory = await this.memoryService.loadMemory(userId);
    return { success: true, memory };
  }

  @Delete('memory')
  async clearUserMemory(@Req() req: any) {
    const userId = req.user.id;
    await this.memoryService.clearAllMemory(userId);
    return { success: true, message: 'Long-term memory cleared.' };
  }
}
