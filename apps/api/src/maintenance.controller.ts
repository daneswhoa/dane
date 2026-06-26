import { Controller, Get, Post, Body, Param, Query, InternalServerErrorException, BadRequestException, UseGuards, Inject } from '@nestjs/common';
import { eq, desc, inArray } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { RealtimeService } from './realtime/realtime.service';

@Controller('dashboard')
@UseGuards(SessionGuard)
export class MaintenanceController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly realtimeService: RealtimeService
  ) {}

  @Get('maintenance')
  async getMaintenance(@Query('tenantId') tenantId?: string) {
    const db = this.db;
    try {
      let query = db
        .select({
          id: schema.tickets.id,
          title: schema.tickets.title,
          description: schema.tickets.description,
          urgency: schema.tickets.urgency,
          category: schema.tickets.category,
          status: schema.tickets.status,
          tenantId: schema.tickets.tenantId,
          tenantEmail: schema.tickets.tenantEmail,
          propertyId: schema.tickets.propertyId,
          unitId: schema.tickets.unitId,
          ownerId: schema.tickets.ownerId,
          contractorId: schema.tickets.contractorId,
          amount: schema.tickets.amount,
          hourlyRate: schema.tickets.hourlyRate,
          maxAuthorization: schema.tickets.maxAuthorization,
          photoUrl: schema.tickets.photoUrl,
          rating: schema.tickets.rating,
          ratingComment: schema.tickets.ratingComment,
          scheduledAt: schema.tickets.scheduledAt,
          quoteAmount: schema.tickets.quoteAmount,
          quoteStatus: schema.tickets.quoteStatus,
          contractorMessage: schema.tickets.contractorMessage,
          proofPhotoUrl: schema.tickets.proofPhotoUrl,
          createdAt: schema.tickets.createdAt,
          propertyName: schema.properties.name,
          unitLabel: schema.units.label,
        })
        .from(schema.tickets)
        .leftJoin(schema.properties, eq(schema.tickets.propertyId, schema.properties.id))
        .leftJoin(schema.units, eq(schema.tickets.unitId, schema.units.id));

      if (tenantId) {
        query = query.where(eq(schema.tickets.tenantId, tenantId));
      }

      const list = await query.orderBy(desc(schema.tickets.createdAt));

      const userIds = list.map((item: any) => [item.tenantId, item.contractorId]).flat().filter(Boolean) as string[];
      const usersMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const userList = await db
          .select({ id: schema.users.id, name: schema.users.name })
          .from(schema.users)
          .where(inArray(schema.users.id, userIds));
        userList.forEach((u: any) => {
          usersMap[u.id] = u.name;
        });
      }

      return list.map((item: any) => ({
        ...item,
        tenantName: item.tenantId ? (usersMap[item.tenantId] || 'Resident') : 'N/A',
        contractorName: item.contractorId ? (usersMap[item.contractorId] || 'Contractor') : null,
      }));
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve maintenance tickets: ${err.message}`);
    }
  }

  @Post('maintenance')
  async createTicket(@Body() body: {
    title?: string;
    description: string;
    urgency: string;
    category?: string;
    propertyId?: string;
    unitId?: string;
    ownerId: string;
    tenantId?: string;
    contractorId?: string;
    hourlyRate?: number;
    maxAuthorization?: number;
  }) {
    const db = this.db;
    if (!body.description || !body.urgency || !body.ownerId) {
      throw new BadRequestException('description, urgency, and ownerId are required fields.');
    }
    if (body.title && body.title.length > 150) {
      throw new BadRequestException('Title cannot exceed 150 characters.');
    }
    if (body.description.length > 1000) {
      throw new BadRequestException('Description cannot exceed 1000 characters.');
    }

    try {
      const ticketId = 'tkt-' + Math.random().toString(36).substring(2, 9);
      
      let tenantEmail: string | null = null;
      if (body.tenantId) {
        const tUser = await db.select().from(schema.users).where(eq(schema.users.id, body.tenantId)).limit(1);
        if (tUser.length > 0) {
          tenantEmail = tUser[0].email;
        }
      }

      if (body.unitId && !body.tenantId) {
        const unitRec = await db.select().from(schema.units).where(eq(schema.units.id, body.unitId)).limit(1);
        if (unitRec.length > 0 && unitRec[0].tenantId) {
          const tenantId = unitRec[0].tenantId;
          const tUser = await db.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
          if (tUser.length > 0) {
            body.tenantId = tenantId;
            tenantEmail = tUser[0].email;
          }
        }
      }

      await db.insert(schema.tickets).values({
        id: ticketId,
        title: body.title || body.description.slice(0, 50),
        description: body.description,
        urgency: body.urgency,
        category: body.category || 'General',
        status: body.contractorId ? 'assigned' : 'open',
        tenantId: body.tenantId || null,
        tenantEmail: tenantEmail || null,
        propertyId: body.propertyId || null,
        unitId: body.unitId || null,
        ownerId: body.ownerId,
        contractorId: body.contractorId || null,
        hourlyRate: body.hourlyRate || null,
        maxAuthorization: body.maxAuthorization || null,
      });

      if (body.propertyId) {
        let tenantNameStr = 'Resident';
        if (body.tenantId) {
          const tUser = await db.select({ name: schema.users.name }).from(schema.users).where(eq(schema.users.id, body.tenantId)).limit(1);
          if (tUser.length > 0) tenantNameStr = tUser[0].name;
        }
        await this.realtimeService.sendPropertyNotification(
          body.propertyId,
          'New Maintenance Request',
          `${tenantNameStr} submitted a request: "${body.title || body.description.slice(0, 50)}".`,
          `/maintenance`,
          true
        );
      }

      return { success: true, ticketId };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to create maintenance ticket: ${err.message}`);
    }
  }

  @Post('maintenance/:id/assign')
  async assignContractor(
    @Param('id') id: string,
    @Body() body: { contractorId: string; hourlyRate?: number; maxAuthorization?: number }
  ) {
    const db = this.db;
    if (!body.contractorId) {
      throw new BadRequestException('contractorId is a required parameter.');
    }
    try {
      const tktList = await db.select().from(schema.tickets).where(eq(schema.tickets.id, id)).limit(1);
      if (tktList.length === 0) {
        throw new BadRequestException('Ticket not found.');
      }
      const tkt = tktList[0];

      await db
        .update(schema.tickets)
        .set({
          contractorId: body.contractorId,
          hourlyRate: body.hourlyRate || null,
          maxAuthorization: body.maxAuthorization || null,
          status: 'assigned',
        })
        .where(eq(schema.tickets.id, id));

      // Notify contractor
      await this.realtimeService.sendNotification(
        body.contractorId,
        'New Job Assigned',
        `You have been assigned to: "${tkt.title || tkt.description.slice(0, 50)}".`,
        '/contractor/jobs',
        true
      );

      // Notify tenant
      if (tkt.tenantId) {
        await this.realtimeService.sendNotification(
          tkt.tenantId,
          'Contractor Assigned',
          `A contractor has been assigned to your request: "${tkt.title || tkt.description.slice(0, 50)}".`,
          '/tenant/maintenance',
          false
        );
      }

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to assign contractor: ${err.message}`);
    }
  }

  @Post('maintenance/:id/status')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: {
      status?: string;
      amount?: number;
      notes?: string;
      scheduledAt?: string;
      quoteAmount?: string;
      quoteStatus?: string;
      contractorMessage?: string;
      proofPhotoUrl?: string;
      rating?: number;
      ratingComment?: string;
    }
  ) {
    const db = this.db;
    try {
      const tktList = await db.select().from(schema.tickets).where(eq(schema.tickets.id, id)).limit(1);
      if (tktList.length === 0) {
        throw new BadRequestException('Ticket not found.');
      }
      const tkt = tktList[0];

      const updateData: any = {};
      if (body.status !== undefined) {
        updateData.status = body.status;
      }
      if (body.amount !== undefined) {
        updateData.amount = body.amount;
      }
      if (body.notes !== undefined) {
        updateData.contractorMessage = body.notes;
      }
      if (body.contractorMessage !== undefined) {
        updateData.contractorMessage = body.contractorMessage;
      }
      if (body.scheduledAt !== undefined) {
        updateData.scheduledAt = body.scheduledAt;
      }
      if (body.quoteAmount !== undefined) {
        updateData.quoteAmount = body.quoteAmount;
      }
      if (body.quoteStatus !== undefined) {
        updateData.quoteStatus = body.quoteStatus;
      }
      if (body.proofPhotoUrl !== undefined) {
        updateData.proofPhotoUrl = body.proofPhotoUrl;
      }
      if (body.rating !== undefined) {
        updateData.rating = body.rating;
      }
      if (body.ratingComment !== undefined) {
        updateData.ratingComment = body.ratingComment;
      }
      
      if (body.status === 'open') {
        updateData.contractorId = null;
        updateData.quoteStatus = null;
        updateData.quoteAmount = null;
        updateData.scheduledAt = null;
      }
      
      await db.update(schema.tickets).set(updateData).where(eq(schema.tickets.id, id));

      if (body.status === 'paid') {
        if (tkt.amount || body.amount) {
          const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const invoiceNum = 'EXP-' + Math.floor(100000 + Math.random() * 900000);
          
          let cName = 'Contractor Services';
          const contractorId = tkt.contractorId;
          if (contractorId) {
            const cUser = await db.select().from(schema.users).where(eq(schema.users.id, contractorId)).limit(1);
            if (cUser.length > 0) {
              cName = cUser[0].name;

              const stripeAccountId = cUser[0].stripeAccountId;
              if (stripeAccountId) {
                const Stripe = require('stripe');
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TlIGlEniOjmW1hm...', { apiVersion: '2023-10-16' });
                try {
                  await stripe.transfers.create({
                    amount: Math.round(Number(tkt.amount || body.amount) * 100),
                    currency: 'usd',
                    destination: stripeAccountId,
                    description: `Payment for Maintenance Ticket #${tkt.id}`,
                  });

                  await db.insert(schema.financialAudits).values({
                    userId: contractorId,
                    action: 'payout_initiated',
                    amount: Number(tkt.amount || body.amount),
                    currency: 'usd',
                    referenceId: tkt.id,
                    status: 'succeeded',
                  });
                } catch (stripeErr: any) {
                  console.error('Stripe transfer failed:', stripeErr.message);
                }
              }
            }
          }

          await db.insert(schema.invoices).values({
            id: invoiceId,
            invoiceNumber: invoiceNum,
            type: 'Maintenance Expense',
            tenantId: tkt.contractorId || tkt.ownerId,
            tenantEmail: 'contractor@landlord.hu',
            tenantName: cName,
            unitId: tkt.unitId || null,
            propertyId: tkt.propertyId || null,
            ownerId: tkt.ownerId,
            amount: tkt.amount || body.amount,
            description: `Settled billing for Maintenance Ticket #${tkt.id.toUpperCase()}: ${tkt.title || tkt.description}`,
            status: 'PAID',
            paidAt: new Date(),
            dueDate: new Date(),
          });
        }
      }

      // ── Dispatch Realtime Notifications ──

      // 1. Rating Notification
      if (body.rating !== undefined && tkt.rating === null && tkt.contractorId) {
        await this.realtimeService.sendNotification(
          tkt.contractorId,
          'Job Rated',
          `You received a ${body.rating}-star rating for job: "${tkt.title || tkt.description.slice(0, 50)}".`,
          '/contractor/earnings',
          false
        );
      }

      // 2. Quote Notifications
      if (body.quoteAmount !== undefined && tkt.quoteAmount !== body.quoteAmount && tkt.propertyId) {
        await this.realtimeService.sendPropertyNotification(
          tkt.propertyId,
          'New Quote Submitted',
          `A contractor submitted a quote of $${body.quoteAmount} for "${tkt.title || tkt.description.slice(0, 50)}".`,
          '/maintenance',
          false
        );
      }

      if (body.quoteStatus !== undefined && tkt.quoteStatus !== body.quoteStatus && tkt.contractorId) {
        if (body.quoteStatus === 'accepted') {
          await this.realtimeService.sendNotification(
            tkt.contractorId,
            'Quote Accepted',
            `Your quote of $${tkt.quoteAmount || body.quoteAmount} for "${tkt.title || tkt.description.slice(0, 50)}" was accepted.`,
            '/contractor/jobs',
            true
          );
        } else if (body.quoteStatus === 'declined') {
          await this.realtimeService.sendNotification(
            tkt.contractorId,
            'Quote Declined',
            `Your quote of $${tkt.quoteAmount || body.quoteAmount} for "${tkt.title || tkt.description.slice(0, 50)}" was declined.`,
            '/contractor/jobs',
            false
          );
        }
      }

      // 3. Status Change Notifications
      if (body.status !== undefined && tkt.status !== body.status) {
        if (body.status === 'open' && tkt.status === 'assigned' && tkt.propertyId) {
          // Contractor declined assignment
          await this.realtimeService.sendPropertyNotification(
            tkt.propertyId,
            'Job Assignment Declined',
            `Contractor declined assignment for: "${tkt.title || tkt.description.slice(0, 50)}".`,
            '/maintenance',
            true
          );
        } else if (body.status === 'completed') {
          // Job completed
          if (tkt.tenantId) {
            await this.realtimeService.sendNotification(
              tkt.tenantId,
              'Maintenance Job Completed',
              `Contractor marked your maintenance request "${tkt.title || tkt.description.slice(0, 50)}" as completed.`,
              '/tenant/maintenance',
              false
            );
          }
          if (tkt.propertyId) {
            await this.realtimeService.sendPropertyNotification(
              tkt.propertyId,
              'Job Marked Completed',
              `Contractor completed the job: "${tkt.title || tkt.description.slice(0, 50)}". Please review payout.`,
              '/maintenance',
              true
            );
          }
        } else if (body.status === 'paid' && tkt.contractorId) {
          // Payout processed
          await this.realtimeService.sendNotification(
            tkt.contractorId,
            'Job Payment Received',
            `Payment of $${tkt.amount || body.amount} for "${tkt.title || tkt.description.slice(0, 50)}" has been processed.`,
            '/contractor/earnings',
            true
          );
        } else {
          // Other status changes
          if (tkt.tenantId) {
            await this.realtimeService.sendNotification(
              tkt.tenantId,
              'Maintenance Status Updated',
              `Your maintenance request "${tkt.title || tkt.description.slice(0, 50)}" is now "${body.status}".`,
              '/tenant/maintenance',
              false
            );
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to update ticket status: ${err.message}`);
    }
  }
}
