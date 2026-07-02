import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { RealtimeGateway } from './realtime.gateway';
import { EmailService } from '../email.service';
import * as schema from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class RealtimeService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly gateway: RealtimeGateway,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Send a notification to a specific user.
   * Persists it to the database, emits via WebSocket, and optionally sends an email.
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    link?: string,
    important: boolean = false
  ) {
    const notificationId = randomUUID();

    try {
      // 1. Persist to DB
      await this.db.insert(schema.notifications).values({
        id: notificationId,
        userId,
        title,
        message,
        link: link || null,
        isRead: false,
      });

      // 2. Emit via WebSocket
      this.gateway.sendToUser(userId, 'notification', {
        id: notificationId,
        title,
        message,
        link,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // 3. Send email if important
      if (important) {
        // Fetch target user's email
        const userResult = await this.db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .limit(1);

        if (userResult.length > 0 && userResult[0].email) {
          const user = userResult[0];
          const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #f43f5e; margin-bottom: 10px;">${title}</h2>
              <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">${message}</p>
              ${
                link
                  ? `<a href="http://localhost:3000${link}" style="background-color: #f43f5e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 12px; display: inline-block;">View Details</a>`
                  : ''
              }
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="font-size: 10px; color: #64748b;">This is an automated notification from Dane Properties. You received this because email notifications are enabled for important events.</p>
            </div>
          `;
          await this.emailService.sendEmail(user.email, `[Dane Properties] ${title}`, emailHtml);
        }
      }
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
    }
  }

  /**
   * Helper to retrieve all authorized manager IDs for a property,
   * including the property owner and any associated managers who have access.
   */
  async getAuthorizedManagersForProperty(propertyId: string): Promise<string[]> {
    try {
      // 1. Get the property to identify owner
      const propRes = await this.db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.id, propertyId))
        .limit(1);

      if (propRes.length === 0) return [];
      const ownerId = propRes[0].ownerId;
      const authorizedIds = new Set<string>([ownerId]);

      // 2. Query team relations linked to this owner
      const relations = await this.db
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.ownerId, ownerId));

      if (relations.length > 0) {
        const managerIds = relations.map((r: any) => r.managerId);
        // Fetch managers profiles to check allowedProperties
        for (const id of managerIds) {
          const uRes = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .limit(1);

          if (uRes.length > 0) {
            const user = uRes[0];
            const allowed = user.allowedProperties;
            if (!allowed || allowed === 'all') {
              authorizedIds.add(id);
            } else {
              const ids = allowed.split(',');
              if (ids.includes(propertyId)) {
                authorizedIds.add(id);
              }
            }
          }
        }
      }

      return Array.from(authorizedIds);
    } catch (err) {
      console.error('Error fetching authorized managers:', err);
      return [];
    }
  }

  /**
   * Send a property-scoped notification to all authorized managers.
   */
  async sendPropertyNotification(
    propertyId: string,
    title: string,
    message: string,
    link?: string,
    important: boolean = false
  ) {
    const managerIds = await this.getAuthorizedManagersForProperty(propertyId);
    for (const managerId of managerIds) {
      await this.sendNotification(managerId, title, message, link, important);
    }
  }
}
