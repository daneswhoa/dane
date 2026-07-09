import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class AgentMemoryService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  /**
   * Loads all key-value memory preferences stored for a specific user.
   */
  async loadMemory(userId: string): Promise<Record<string, string>> {
    const list = await this.db
      .select()
      .from(schema.agentMemory)
      .where(eq(schema.agentMemory.userId, userId));

    const memory: Record<string, string> = {};
    for (const item of list) {
      memory[item.key] = item.value;
    }
    return memory;
  }

  /**
   * Saves or updates a key-value preference key for a user.
   */
  async saveMemory(userId: string, key: string, value: string): Promise<void> {
    const existing = await this.db
      .select()
      .from(schema.agentMemory)
      .where(and(eq(schema.agentMemory.userId, userId), eq(schema.agentMemory.key, key)))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(schema.agentMemory)
        .set({ value })
        .where(and(eq(schema.agentMemory.userId, userId), eq(schema.agentMemory.key, key)));
    } else {
      await this.db.insert(schema.agentMemory).values({
        userId,
        key,
        value,
      });
    }
  }

  /**
   * Clear all memories for a user
   */
  async clearAllMemory(userId: string): Promise<void> {
    await this.db
      .delete(schema.agentMemory)
      .where(eq(schema.agentMemory.userId, userId));
  }

  /**
   * Loads the active conversation history log from the database.
   */
  async loadConversationHistory(userId: string, conversationId?: number): Promise<any[]> {
    let query = this.db.select().from(schema.agentConversations);

    if (conversationId !== undefined) {
      query = query.where(
        and(
          eq(schema.agentConversations.userId, userId),
          eq(schema.agentConversations.id, conversationId)
        )
      );
    } else {
      query = query.where(eq(schema.agentConversations.userId, userId))
        .orderBy(schema.agentConversations.updatedAt)
        .limit(1);
    }

    const records = await query;
    if (records.length === 0) return [];
    const msgs = records[0].messages;
    if (!msgs) return [];
    if (typeof msgs === 'object') {
      return Array.isArray(msgs) ? msgs : [msgs];
    }
    try {
      return JSON.parse(msgs);
    } catch {
      return [];
    }
  }

  /**
   * Saves the entire list of active messages for a user's thread.
   */
  async saveConversationHistory(userId: string, messages: any[], conversationId?: number): Promise<number> {
    if (conversationId !== undefined) {
      const existing = await this.db
        .select()
        .from(schema.agentConversations)
        .where(
          and(
            eq(schema.agentConversations.userId, userId),
            eq(schema.agentConversations.id, conversationId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        const targetId = existing[0].id;
        await this.db
          .update(schema.agentConversations)
          .set({
            messages: messages,
            updatedAt: new Date(),
          })
          .where(eq(schema.agentConversations.id, targetId));
        return targetId;
      }
    }

    const inserted = await this.db.insert(schema.agentConversations).values({
      userId,
      messages: messages,
    }).returning({ id: schema.agentConversations.id });
    return inserted[0]?.id;
  }

  /**
   * Loads a brief list of all threads for a user.
   */
  async loadAllConversations(userId: string) {
    const list = await this.db
      .select({
        id: schema.agentConversations.id,
        messages: schema.agentConversations.messages,
        createdAt: schema.agentConversations.createdAt,
        updatedAt: schema.agentConversations.updatedAt,
      })
      .from(schema.agentConversations)
      .where(eq(schema.agentConversations.userId, userId))
      .orderBy(schema.agentConversations.updatedAt);

    return list.map((record: any) => {
      let title = 'New Conversation';
      const msgs = typeof record.messages === 'object' ? record.messages : (() => {
        try {
          return JSON.parse(record.messages || '[]');
        } catch {
          return [];
        }
      })();
      if (Array.isArray(msgs)) {
        const firstUserMsg = msgs.find((m: any) => m.sender === 'user' || m.role === 'user');
        if (firstUserMsg) {
          const rawText = firstUserMsg.text || firstUserMsg.content || '';
          title = rawText.substring(0, 45) + (rawText.length > 45 ? '...' : '');
        }
      }
      return {
        id: record.id,
        title,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    });
  }

  /**
   * Delete a specific conversation thread.
   */
  async deleteConversation(userId: string, conversationId: number): Promise<void> {
    await this.db
      .delete(schema.agentConversations)
      .where(
        and(
          eq(schema.agentConversations.userId, userId),
          eq(schema.agentConversations.id, conversationId)
        )
      );
  }

  /**
   * Clear chat log for a user (deprecated - use deleteConversation)
   */
  async clearConversationHistory(userId: string): Promise<void> {
    await this.db
      .delete(schema.agentConversations)
      .where(eq(schema.agentConversations.userId, userId));
  }
}
