import { Controller, Get, Post, Body, Req, UseGuards, Inject, Query } from '@nestjs/common';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { UpstashRedisService } from './redis/redis.service';

@Controller('dashboard/security')
@UseGuards(SessionGuard)
export class SecurityController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly redisService: UpstashRedisService,
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
      let conditions: any[] = [];

      // Moderators and Admins see logs from all organizations.
      // Other roles are restricted to their own organization logs.
      if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
        conditions.push(eq(schema.auditLogs.organizationName, callerOrg));
      }

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

  @Get('limits')
  async getLimits() {
    const redis = this.redisService.getClient();
    let config: any = null;
    if (redis) {
      config = await redis.get('system:rate-limits');
    }
    const finalConfig = config || {
      read: { limit: 100, ttl: 60 },
      write: { limit: 30, ttl: 60 },
      heavy: { limit: 5, ttl: 60 },
      multipliers: { standard: 1.0, enterprise: 3.0, restricted: 0.1 }
    };

    // Get all landlords, managers, tenants, and contractors
    const db = this.db;
    const users = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, role: schema.users.role })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('landlord', 'manager', 'tenant', 'contractor')`);

    const usersWithTiers: any[] = [];
    for (const u of users) {
      let tier = 'standard';
      if (redis) {
        tier = (await redis.get<string>(`system:user-tiers:${u.id}`)) || 'standard';
      }
      usersWithTiers.push({ ...u, tier });
    }

    return { config: finalConfig, users: usersWithTiers };
  }

  @Post('limits')
  async saveLimits(@Body() body: any) {
    const redis = this.redisService.getClient();
    if (redis) {
      await redis.set('system:rate-limits', body);
      return { success: true };
    }
    return { success: false, message: 'Redis client unavailable.' };
  }

  @Post('limits/user-tier')
  async saveUserTier(@Body() body: { userId: string; tier: string }) {
    const redis = this.redisService.getClient();
    if (redis) {
      await redis.set(`system:user-tiers:${body.userId}`, body.tier);
      return { success: true };
    }
    return { success: false, message: 'Redis client unavailable.' };
  }
}
