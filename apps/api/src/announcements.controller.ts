import { Controller, Get, Post, Body, Req, UseGuards, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './db/database.module';
import { SessionGuard } from './auth/auth.guard';
import { RealtimeService } from './realtime/realtime.service';
import * as schema from './db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

@Controller('announcements')
@UseGuards(SessionGuard)
export class AnnouncementsController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly realtimeService: RealtimeService
  ) {}

  @Post()
  async createAnnouncement(
    @Req() req: any,
    @Body() body: {
      title: string;
      content: string;
      audienceType: 'all' | 'property';
      targetPropertyId?: string;
      arrearsFilter: 'all' | 'with_arrears' | 'with_arrears_due_date' | 'without_arrears';
    }
  ) {
    const ownerId = req.user.id;
    const callerOrg = req.user.organizationName || '';

    // 1. Query matching tenants
    const conditions = [
      eq(schema.users.role, 'tenant'),
      eq(schema.properties.organizationName, callerOrg)
    ];

    if (body.audienceType === 'property' && body.targetPropertyId) {
      conditions.push(eq(schema.units.propertyId, body.targetPropertyId));
    }

    if (body.arrearsFilter === 'with_arrears') {
      conditions.push(sql`${schema.units.arrears} > 0`);
    } else if (body.arrearsFilter === 'without_arrears') {
      conditions.push(sql`(${schema.units.arrears} <= 0 OR ${schema.units.arrears} IS NULL)`);
    }

    let matchingTenants = await this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
      })
      .from(schema.users)
      .innerJoin(schema.units, eq(schema.units.tenantId, schema.users.id))
      .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
      .where(and(...conditions));

    // Handle "with arrears due date" filter if needed
    if (body.arrearsFilter === 'with_arrears_due_date') {
      const overdueInvoices = await this.db
        .select({
          tenantId: schema.invoices.tenantId,
        })
        .from(schema.invoices)
        .where(
          and(
            eq(schema.invoices.status, 'unpaid'),
            sql`${schema.invoices.dueDate} < NOW()`
          )
        );

      const overdueTenantIds = new Set(overdueInvoices.map((inv: any) => inv.tenantId));
      matchingTenants = matchingTenants.filter((t: any) => overdueTenantIds.has(t.id));
    }

    // 2. Insert announcement history record
    const announcementId = 'ann-' + Math.random().toString(36).substring(2, 9);
    await this.db.insert(schema.announcements).values({
      id: announcementId,
      ownerId,
      organizationName: callerOrg || null,
      title: body.title,
      content: body.content,
      audienceType: body.audienceType,
      targetPropertyId: body.targetPropertyId || null,
      arrearsFilter: body.arrearsFilter,
      sentCount: matchingTenants.length,
    });

    // 3. Dispatch notifications and Socket messages
    for (const tenant of matchingTenants) {
      await this.realtimeService.sendNotification(
        tenant.id,
        body.title,
        body.content,
        '/tenant/announcements',
        false // purely in-app
      );
    }

    // 4. Log the audit activity
    await this.db.insert(schema.auditLogs).values({
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      ownerId,
      organizationName: callerOrg || null,
      actorName: req.user.name || 'Owner',
      actorEmail: req.user.email,
      actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      categoryIconName: 'Megaphone',
      categoryLabel: 'Announcements',
      description: `Broadcasted in-app announcement "${body.title}" to ${matchingTenants.length} tenants.`,
      severity: 'info',
      status: 'success',
      ip: req.ip || 'Unknown',
      location: 'Unknown',
    });

    return { success: true, sentCount: matchingTenants.length };
  }

  @Get()
  async getAnnouncements(@Req() req: any) {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'tenant') {
      // 1. Fetch tenant's unit & property details
      const unitRecs = await this.db
        .select()
        .from(schema.units)
        .where(eq(schema.units.tenantId, userId))
        .limit(1);

      if (unitRecs.length === 0) {
        return []; // Not assigned to any unit, no announcements
      }

      const unit = unitRecs[0];
      const hasArrears = unit.arrears > 0;

      // 2. Fetch if they have any overdue unpaid invoices
      const overdueInvoices = await this.db
        .select()
        .from(schema.invoices)
        .where(
          and(
            eq(schema.invoices.tenantId, userId),
            eq(schema.invoices.status, 'unpaid'),
            sql`${schema.invoices.dueDate} < NOW()`
          )
        )
        .limit(1);
      const hasOverdue = overdueInvoices.length > 0;

      // 3. Fetch all announcements
      const allAnnouncements = await this.db
        .select()
        .from(schema.announcements)
        .orderBy(desc(schema.announcements.createdAt));

      // 4. Filter according to tenant context
      return allAnnouncements.filter((ann: any) => {
        // Check property restriction
        if (ann.audienceType === 'property' && ann.targetPropertyId !== unit.propertyId) {
          return false;
        }

        // Check arrears restriction
        if (ann.arrearsFilter === 'with_arrears' && !hasArrears) {
          return false;
        }
        if (ann.arrearsFilter === 'without_arrears' && hasArrears) {
          return false;
        }
        if (ann.arrearsFilter === 'with_arrears_due_date' && !hasOverdue) {
          return false;
        }

        return true;
      });
    } else {
      // Manager/Owner sees their organization's sent history
      return this.db
        .select()
        .from(schema.announcements)
        .where(eq(schema.announcements.organizationName, req.user.organizationName || ''))
        .orderBy(desc(schema.announcements.createdAt));
    }
  }
}
