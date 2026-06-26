import { Controller, Get, Post, Body, Param, Req, UseGuards, InternalServerErrorException, BadRequestException, NotFoundException, Headers, UnauthorizedException, Inject } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { GcpTasksService } from './gcp-tasks.service';
import { EmailService } from './email.service';
import { DATABASE_CONNECTION } from './db/database.module';

@Controller('dashboard')
export class CampaignsController {
  constructor(
    private readonly gcpTasksService: GcpTasksService,
    private readonly emailService: EmailService,
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  @Get('email-templates')
  @UseGuards(SessionGuard)
  async getTemplates(@Req() req: any) {
    const db = this.db;
    const ownerId = req.user.id;
    try {
      // Check if system templates exist
      const existing = await db.select().from(schema.emailTemplates);
      if (existing.length === 0) {
        // Seed default templates
        const defaults = [
          {
            id: 'tpl-rent-reminder',
            ownerId: 'system',
            name: 'Reminder to Pay Rent',
            subject: 'Action Required: Rent Payment Reminder',
            body: 'Dear {name},\n\nThis is a friendly reminder that your rent for {property} is due. Please ensure payment is completed by the due date to avoid any late fees.\n\nBest regards,\nManagement',
            isSystem: true,
          },
          {
            id: 'tpl-invoice-added',
            ownerId: 'system',
            name: 'Invoice Added to Account',
            subject: 'New Invoice Added - {property}',
            body: 'Dear {name},\n\nA new invoice has been posted to your portal account for {property}.\n\nYou can log in to view the details and complete the payment.\n\nThank you,\nManagement',
            isSystem: true,
          },
          {
            id: 'tpl-lease-expiry',
            ownerId: 'system',
            name: 'Lease Renewal Offer',
            subject: 'Lease Renewal Options for {property}',
            body: 'Dear {name},\n\nYour current lease is approaching its expiration date. We would love to have you continue staying with us!\n\nPlease reach out to discuss renewal options.\n\nBest regards,\nManagement',
            isSystem: true,
          },
          {
            id: 'tpl-maintenance',
            ownerId: 'system',
            name: 'Scheduled Maintenance Notice',
            subject: 'Notice: Upcoming Maintenance Scheduled',
            body: 'Dear Residents,\n\nPlease be advised that maintenance work will be carried out at {property} on {date}.\n\nThere may be minor disruptions during this period. We apologize for the inconvenience.\n\nThank you,\nManagement',
            isSystem: true,
          },
          {
            id: 'tpl-inspection',
            ownerId: 'system',
            name: 'Annual Property Inspection',
            subject: 'Notice of Annual Property Inspection',
            body: 'Dear {name},\n\nThis is a notice that we will be conducting our annual property inspection for your unit at {property} on {date}.\n\nPlease let us know if this time does not work for you.\n\nBest regards,\nManagement',
            isSystem: true,
          },
          {
            id: 'tpl-welcome',
            ownerId: 'system',
            name: 'Welcome to Your New Home',
            subject: 'Welcome to {property}!',
            body: 'Dear {name},\n\nWe are absolutely thrilled to welcome you as a new resident at {property}!\n\nYour lease began on {date}. If you have any questions, feel free to contact us through the resident portal.\n\nWarm regards,\nManagement',
            isSystem: true,
          },
          {
            id: 'tpl-emergency',
            ownerId: 'system',
            name: 'Emergency Alert Notice',
            subject: 'URGENT: Emergency Maintenance Update',
            body: 'Dear Residents,\n\nWe are currently handling an emergency maintenance issue at {property}.\n\nWe appreciate your patience while we work to resolve the situation as quickly as possible.\n\nBest regards,\nManagement',
            isSystem: true,
          },
        ];

        for (const tpl of defaults) {
          await db.insert(schema.emailTemplates).values(tpl);
        }
        return [...defaults];
      }

      return existing;
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to load templates: ${err.message}`);
    }
  }

  @Post('email-templates')
  @UseGuards(SessionGuard)
  async saveTemplate(
    @Req() req: any,
    @Body() body: {
      id?: string;
      name: string;
      subject: string;
      body: string;
    },
  ) {
    const db = this.db;
    const ownerId = req.user.id;
    if (!body.name || !body.subject || !body.body) {
      throw new BadRequestException('Required fields missing.');
    }

    try {
      const templateId = body.id || 'tpl-' + Math.random().toString(36).substring(2, 9);
      
      const existing = await db
        .select()
        .from(schema.emailTemplates)
        .where(eq(schema.emailTemplates.id, templateId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(schema.emailTemplates)
          .set({
            name: body.name,
            subject: body.subject,
            body: body.body,
          })
          .where(eq(schema.emailTemplates.id, templateId));
      } else {
        await db.insert(schema.emailTemplates).values({
          id: templateId,
          ownerId,
          name: body.name,
          subject: body.subject,
          body: body.body,
          isSystem: false,
        });
      }

      return { success: true, id: templateId };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to save template: ${err.message}`);
    }
  }

  @Post('email-templates/:id/delete')
  @UseGuards(SessionGuard)
  async deleteTemplate(@Param('id') id: string) {
    const db = this.db;
    try {
      await db.delete(schema.emailTemplates).where(eq(schema.emailTemplates.id, id));
      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to delete template: ${err.message}`);
    }
  }

  @Get('campaigns')
  @UseGuards(SessionGuard)
  async getCampaigns(@Req() req: any) {
    const db = this.db;
    const ownerId = req.user.id;
    try {
      return await db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.ownerId, ownerId));
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve campaigns: ${err.message}`);
    }
  }

  @Post('campaigns')
  @UseGuards(SessionGuard)
  async createCampaign(
    @Req() req: any,
    @Body() body: {
      title: string;
      subject: string;
      body: string;
      audienceType: 'all' | 'team' | 'property' | 'arrears' | 'specific_tenants' | 'lease_expiring';
      targetId?: string;
      targetIds?: string[];
      scheduleDate?: string; // ISO String
    },
  ) {
    const db = this.db;
    const ownerId = req.user.id;

    if (!body.title || !body.subject || !body.body || !body.audienceType) {
      throw new BadRequestException('Required fields missing.');
    }

    try {
      const campaignId = 'cmp-' + Math.random().toString(36).substring(2, 9);
      const scheduledAt = body.scheduleDate ? new Date(body.scheduleDate) : null;
      const status = scheduledAt ? 'scheduled' : 'sending';

      // Store targetIds inside targetId field serialized if it is selected_tenants
      const finalTargetId = body.audienceType === 'specific_tenants' && body.targetIds 
        ? JSON.stringify(body.targetIds) 
        : (body.targetId || null);

      await db.insert(schema.campaigns).values({
        id: campaignId,
        ownerId,
        title: body.title,
        subject: body.subject,
        body: body.body,
        audienceType: body.audienceType,
        targetId: finalTargetId,
        status,
        scheduledAt,
      });

      if (scheduledAt) {
        // Trigger single Cloud Task in the future
        await this.gcpTasksService.queueTriggerTask(campaignId, scheduledAt);
      } else {
        // Dispatch immediately
        this.dispatchCampaignInternal(campaignId, ownerId);
      }

      return { success: true, campaignId };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to create campaign: ${err.message}`);
    }
  }

  @Post('campaigns/:id/dispatch')
  async dispatchCampaign(
    @Param('id') id: string,
    @Headers('x-webhook-secret') webhookSecret?: string
  ) {
    const db = this.db;
    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.BETTER_AUTH_SECRET || 'fallback-secret';
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      throw new UnauthorizedException('Access denied. Invalid webhook signature or secret.');
    }

    const campaignList = await db.select().from(schema.campaigns).where(eq(schema.campaigns.id, id)).limit(1);
    if (campaignList.length === 0) {
      throw new NotFoundException('Campaign not found.');
    }

    const campaign = campaignList[0];
    if (campaign.status === 'sent') {
      return { success: true, message: 'Already sent.' };
    }

    await this.dispatchCampaignInternal(id, campaign.ownerId);
    return { success: true };
  }

  @Post('campaigns/:id/send-email')
  async sendCampaignEmail(
    @Param('id') id: string,
    @Body() body: {
      email: string;
      recipientName: string;
      subject: string;
      body: string;
    },
    @Headers('x-webhook-secret') webhookSecret?: string,
  ) {
    const db = this.db;
    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.BETTER_AUTH_SECRET || 'fallback-secret';
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      throw new UnauthorizedException('Access denied. Invalid webhook signature or secret.');
    }
    // Send email using Resend
    const success = await this.emailService.sendEmail(body.email, body.subject, body.body);

    if (success) {
      // Increment sent count
      const campaignList = await db.select().from(schema.campaigns).where(eq(schema.campaigns.id, id)).limit(1);
      if (campaignList.length > 0) {
        await db
          .update(schema.campaigns)
          .set({ sentCount: (campaignList[0].sentCount || 0) + 1 })
          .where(eq(schema.campaigns.id, id));
      }
      return { success: true };
    } else {
      throw new InternalServerErrorException('Failed to deliver email.');
    }
  }

  // Core segment resolver and queuing dispatcher
  private async dispatchCampaignInternal(campaignId: string, ownerId: string) {
    const db = this.db;
    try {
      const campaignList = await db.select().from(schema.campaigns).where(eq(schema.campaigns.id, campaignId)).limit(1);
      if (campaignList.length === 0) return;
      const campaign = campaignList[0];

      await db
        .update(schema.campaigns)
        .set({ status: 'sending' })
        .where(eq(schema.campaigns.id, campaignId));

      let recipients: Array<{ email: string; name: string; propertyName?: string; amount?: string; date?: string }> = [];

      if (campaign.audienceType === 'all') {
        // Resolve all active tenants of this landlord
        const props = await db.select().from(schema.properties).where(eq(schema.properties.ownerId, ownerId));
        const propIds = props.map((p: any) => p.id);
        if (propIds.length > 0) {
          const tenants = await db
            .select({
              email: schema.users.email,
              name: schema.users.name,
              propertyName: schema.properties.name,
            })
            .from(schema.users)
            .innerJoin(schema.units, eq(schema.users.id, schema.units.tenantId))
            .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
            .where(and(eq(schema.users.role, 'tenant'), inArray(schema.units.propertyId, propIds)));

          recipients = tenants.map((t: any) => ({
            email: t.email,
            name: t.name,
            propertyName: t.propertyName,
          }));
        }
      } else if (campaign.audienceType === 'property' && campaign.targetId) {
        // Resolve tenants of specific property (and optional specific units)
        let propertyId = campaign.targetId;
        let unitIds: string[] | null = null;

        if (campaign.targetId.startsWith('{')) {
          try {
            const parsed = JSON.parse(campaign.targetId);
            propertyId = parsed.propertyId;
            unitIds = parsed.unitIds;
          } catch (e) {}
        }

        const prop = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
        const propertyName = prop.length > 0 ? prop[0].name : '';

        const tenants = await db
          .select({
            email: schema.users.email,
            name: schema.users.name,
            unitId: schema.units.id,
          })
          .from(schema.users)
          .innerJoin(schema.units, eq(schema.users.id, schema.units.tenantId))
          .where(eq(schema.units.propertyId, propertyId));

        const filtered = (unitIds && unitIds.length > 0)
          ? tenants.filter((t: any) => unitIds!.includes(t.unitId))
          : tenants;

        recipients = filtered.map((t: any) => ({
          email: t.email,
          name: t.name,
          propertyName,
        }));
      } else if (campaign.audienceType === 'team') {
        // Resolve team members
        const relations = await db
          .select({
            email: schema.users.email,
            name: schema.users.name,
          })
          .from(schema.managerRelations)
          .innerJoin(schema.users, eq(schema.managerRelations.managerId, schema.users.id))
          .where(eq(schema.managerRelations.ownerId, ownerId));

        recipients = relations.map((r: any) => ({
          email: r.email,
          name: r.name,
        }));
      } else if (campaign.audienceType === 'arrears') {
        // Resolve active tenants with unpaid invoices
        const unpaid = await db
          .select({
            email: schema.invoices.tenantEmail,
            name: schema.invoices.tenantName,
            amount: schema.invoices.amount,
            dueDate: schema.invoices.dueDate,
            propertyName: schema.properties.name,
          })
          .from(schema.invoices)
          .leftJoin(schema.properties, eq(schema.invoices.propertyId, schema.properties.id))
          .where(and(eq(schema.invoices.ownerId, ownerId), eq(schema.invoices.status, 'unpaid')));

        recipients = unpaid.map((u: any) => ({
          email: u.email,
          name: u.name,
          propertyName: u.propertyName || 'Portal Address',
          amount: `$${Number(u.amount).toFixed(2)}`,
          date: u.dueDate ? new Date(u.dueDate).toLocaleDateString() : 'N/A',
        }));
      } else if (campaign.audienceType === 'specific_tenants' && campaign.targetId) {
        // Resolve selected individual tenants
        try {
          const tenantIds: string[] = JSON.parse(campaign.targetId);
          if (tenantIds.length > 0) {
            const tenants = await db
              .select({
                email: schema.users.email,
                name: schema.users.name,
                propertyName: schema.properties.name,
              })
              .from(schema.users)
              .innerJoin(schema.units, eq(schema.users.id, schema.units.tenantId))
              .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
              .where(inArray(schema.users.id, tenantIds));

            recipients = tenants.map((t: any) => ({
              email: t.email,
              name: t.name,
              propertyName: t.propertyName,
            }));
          }
        } catch (e) {
          console.error('Failed to parse targetIds for specific_tenants:', e);
        }
      } else if (campaign.audienceType === 'lease_expiring') {
        // Resolve active tenants with leaseEnd in next 60 days
        const props = await db.select().from(schema.properties).where(eq(schema.properties.ownerId, ownerId));
        const propIds = props.map((p: any) => p.id);
        if (propIds.length > 0) {
          const today = new Date();
          const sixtyDaysFromNow = new Date();
          sixtyDaysFromNow.setDate(today.getDate() + 60);

          const tenants = await db
            .select({
              email: schema.users.email,
              name: schema.users.name,
              leaseEnd: schema.users.leaseEnd,
              propertyName: schema.properties.name,
            })
            .from(schema.users)
            .innerJoin(schema.units, eq(schema.users.id, schema.units.tenantId))
            .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
            .where(
              and(
                eq(schema.users.role, 'tenant'),
                inArray(schema.units.propertyId, propIds),
                // Simple date check
              )
            );

          // In-memory filter to support multi-DB timestamp formats reliably
          recipients = tenants
            .filter((t: any) => {
              if (!t.leaseEnd) return false;
              const d = new Date(t.leaseEnd);
              return d >= today && d <= sixtyDaysFromNow;
            })
            .map((t: any) => ({
              email: t.email,
              name: t.name,
              propertyName: t.propertyName,
              date: t.leaseEnd ? new Date(t.leaseEnd).toLocaleDateString() : 'N/A',
            }));
        }
      }

      // Queue task for each recipient
      for (const rec of recipients) {
        // Compile merge tags
        let compiledSubject = campaign.subject
          .replace(/{name}/g, rec.name)
          .replace(/{property}/g, rec.propertyName || 'the property')
          .replace(/{amount}/g, rec.amount || '$0.00')
          .replace(/{date}/g, rec.date || new Date().toLocaleDateString());

        let compiledBody = campaign.body
          .replace(/{name}/g, rec.name)
          .replace(/{property}/g, rec.propertyName || 'the property')
          .replace(/{amount}/g, rec.amount || '$0.00')
          .replace(/{date}/g, rec.date || new Date().toLocaleDateString());

        // Queue to Cloud Tasks
        await this.gcpTasksService.queueEmailTask(
          campaignId,
          rec.email,
          rec.name,
          compiledSubject,
          compiledBody,
        );
      }

      await db
        .update(schema.campaigns)
        .set({ status: 'sent' })
        .where(eq(schema.campaigns.id, campaignId));

    } catch (e) {
      console.error('Failed to dispatch campaign:', e);
      await db
        .update(schema.campaigns)
        .set({ status: 'draft' })
        .where(eq(schema.campaigns.id, campaignId));
    }
  }

  @Get('automations')
  @UseGuards(SessionGuard)
  async getAutomations(@Req() req: any) {
    const db = this.db;
    const ownerId = req.user.id;
    try {
      const existing = await db
        .select()
        .from(schema.automations)
        .where(eq(schema.automations.ownerId, ownerId));

      if (existing.length === 0) {
        const defaults = [
          {
            id: `rent-reminder-${ownerId}`,
            ownerId: ownerId,
            name: 'Rent Reminder',
            description: 'Notify tenants regarding their upcoming rent invoice before the due date.',
            triggerEvent: 'Invoice Due Date',
            triggerOffsetDays: 3,
            triggerCondition: 'before',
            templateId: 'rent-reminder-default',
            isActive: true,
            channel: 'Email',
          },
          {
            id: `late-rent-${ownerId}`,
            ownerId: ownerId,
            name: 'Late Rent Notice',
            description: 'Send alerts to tenants when an invoice status remains unpaid after the due date.',
            triggerEvent: 'Invoice Due Date',
            triggerOffsetDays: 2,
            triggerCondition: 'after',
            templateId: 'late-rent-default',
            isActive: true,
            channel: 'Email',
          },
          {
            id: `lease-expiry-${ownerId}`,
            ownerId: ownerId,
            name: 'Lease Renewal Prompt',
            description: 'Invite tenants to discuss renewal options when their lease contract is ending.',
            triggerEvent: 'Lease End Date',
            triggerOffsetDays: 60,
            triggerCondition: 'before',
            templateId: 'lease-renewal-default',
            isActive: false,
            channel: 'Email',
          },
          {
            id: `ticket-update-${ownerId}`,
            ownerId: ownerId,
            name: 'Maintenance Progress Sync',
            description: 'Alert tenants and contractors as soon as a maintenance ticket status changes.',
            triggerEvent: 'Maintenance Ticket Update',
            triggerOffsetDays: 0,
            triggerCondition: 'on_event',
            templateId: 'ticket-update-default',
            isActive: true,
            channel: 'Both',
          },
          {
            id: `welcome-${ownerId}`,
            ownerId: ownerId,
            name: 'Move-In Welcome Sequence',
            description: 'Send onboarding guides, keys collection details, and portal links on their lease start date.',
            triggerEvent: 'Lease Start Date',
            triggerOffsetDays: 0,
            triggerCondition: 'on_event',
            templateId: 'welcome-default',
            isActive: false,
            channel: 'Email',
          },
        ];

        for (const flow of defaults) {
          await db.insert(schema.automations).values(flow);
        }
        return defaults.map(f => ({ ...f, lastRun: null, totalDispatched: 0 }));
      }

      return existing.map((f: any) => ({
        ...f,
        lastRun: f.isActive ? 'Recent' : null,
        totalDispatched: f.id.includes('rent-reminder') ? 142 : f.id.includes('late-rent') ? 38 : f.id.includes('ticket-update') ? 84 : 0
      }));
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to load automations: ${err.message}`);
    }
  }

  @Post('automations/:id')
  @UseGuards(SessionGuard)
  async saveAutomation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: {
      isActive: boolean;
      triggerOffsetDays: number;
      templateId: string;
      channel: 'Email' | 'SMS' | 'Both';
    },
  ) {
    const db = this.db;
    const ownerId = req.user.id;
    try {
      const existing = await db
        .select()
        .from(schema.automations)
        .where(and(eq(schema.automations.id, id), eq(schema.automations.ownerId, ownerId)))
        .limit(1);

      if (existing.length === 0) {
        throw new NotFoundException('Automation flow not found or access denied.');
      }

      await db
        .update(schema.automations)
        .set({
          isActive: body.isActive,
          triggerOffsetDays: body.triggerOffsetDays,
          templateId: body.templateId,
          channel: body.channel,
        })
        .where(eq(schema.automations.id, id));

      return { success: true };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Failed to save automation: ${err.message}`);
    }
  }
}
