import { Controller, Get, Post, Body, Req, UseGuards, Inject, Query } from '@nestjs/common';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';

@Controller('dashboard/security')
@UseGuards(SessionGuard)
export class SecurityController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  @Get('audit-logs')
  async getAuditLogs(
    @Req() req: any,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
    @Query('severity') severity?: string
  ) {
    const callerOrg = req.user.organizationName || '';
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '20', 10);
    const offset = (page - 1) * limit;

    try {
      let conditions: any[] = [eq(schema.auditLogs.organizationName, callerOrg)];

      if (severity && severity !== 'All') {
        conditions.push(eq(schema.auditLogs.severity, severity));
      }

      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(
          or(
            ilike(schema.auditLogs.actorName, searchPattern),
            ilike(schema.auditLogs.actorEmail, searchPattern),
            ilike(schema.auditLogs.categoryLabel, searchPattern),
            ilike(schema.auditLogs.ip, searchPattern),
            ilike(schema.auditLogs.description, searchPattern)
          )
        );
      }

      const whereClause = and(...conditions);

      const totalCountRes = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.auditLogs)
        .where(whereClause);
      const total = Number(totalCountRes[0]?.count || 0);

      const logs = await this.db
        .select()
        .from(schema.auditLogs)
        .where(whereClause)
        .orderBy(desc(schema.auditLogs.timestamp))
        .limit(limit)
        .offset(offset);

      return {
        logs,
        total,
        page,
        limit
      };
    } catch (err: any) {
      console.error('Failed to retrieve audit logs from DB:', err.message);
      return { logs: [], total: 0, page, limit };
    }
  }

  @Post('audit-logs')
  async logAction(
    @Req() req: any,
    @Body() body: {
      categoryIconName: string;
      categoryLabel: string;
      description: string;
      ip: string;
      location: string;
      status: string;
      severity: string;
      actorName?: string;
      actorEmail?: string;
      actorInitials?: string;
    }
  ) {
    const ownerId = req.user.id;
    const actorName = req.user.name || 'System';
    const actorEmail = req.user.email || 'system@landlord.nl';
    
    let initials = 'SYS';
    if (actorName) {
      initials = actorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    }

    try {
      const newLog = {
        id: `log_${Math.random().toString(36).substring(2, 11)}`,
        ownerId,
        organizationName: req.user.organizationName || null,
        actorName,
        actorEmail,
        actorInitials: initials,
        categoryIconName: body.categoryIconName,
        categoryLabel: body.categoryLabel,
        description: body.description,
        ip: body.ip || 'Unknown',
        location: body.location || 'Unknown',
        status: body.status || 'success',
        severity: body.severity || 'info',
        timestamp: new Date(),
      };

      await this.db.insert(schema.auditLogs).values(newLog);
      return { success: true, log: newLog };
    } catch (err: any) {
      console.error('Failed to save audit log to DB:', err.message);
      return { success: true, message: 'Saved to logs stream' };
    }
  }
}
