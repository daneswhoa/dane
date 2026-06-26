import { Controller, Get, Patch, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './db/database.module';
import { SessionGuard } from './auth/auth.guard';
import * as schema from './db/schema';
import { eq, and, desc } from 'drizzle-orm';

@Controller('notifications')
@UseGuards(SessionGuard)
export class NotificationsController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  @Get()
  async getNotifications(@Req() req: any) {
    const userId = req.user.id;
    return this.db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.notifications.id, id),
          eq(schema.notifications.userId, userId)
        )
      );
    return { success: true };
  }

  @Post('read-all')
  async readAll(@Req() req: any) {
    const userId = req.user.id;
    await this.db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.userId, userId));
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.db
      .delete(schema.notifications)
      .where(
        and(
          eq(schema.notifications.id, id),
          eq(schema.notifications.userId, userId)
        )
      );
    return { success: true };
  }

  @Post('dismiss-all')
  async dismissAll(@Req() req: any) {
    const userId = req.user.id;
    await this.db
      .delete(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, userId),
          eq(schema.notifications.isRead, true)
        )
      );
    return { success: true };
  }
}
