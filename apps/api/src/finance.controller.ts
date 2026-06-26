import { Controller, Get, Post, Body, Param, Query, InternalServerErrorException, BadRequestException, UseGuards, Req, Inject } from '@nestjs/common';
import { eq, desc, and, inArray, sql } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TlIGlEniOjmW1hm...', { apiVersion: '2023-10-16' as any });
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { RealtimeService } from './realtime/realtime.service';
import { EmailService } from './email.service';

interface UnitOnboard {
  unitId: string;
  floor?: string;
  unitType: string;
  rent: number;
  deposit: number;
  moveInFees: number;
  recurringFees: number;
  arrears: number;
  occupied: boolean;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  tenantIdNumber?: string;
  leaseStart?: string;
  leaseEnd?: string;
  kins?: Array<{ name: string; phone: string; relation: string }>;
}

interface OnboardPayload {
  ownerId: string;
  propertyName: string;
  propertyAddress: string;
  photoUrl?: string;
  units: UnitOnboard[];
}

@Controller('dashboard')
@UseGuards(SessionGuard)
export class FinanceController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly realtimeService: RealtimeService,
    private readonly emailService: EmailService
  ) {}

  @Get('invoices')
  async getInvoices(@Req() req: any, @Query('tenantId') tenantId?: string) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;

    try {
      let baseQuery = db
        .select({
          id: schema.invoices.id,
          invoiceNumber: schema.invoices.invoiceNumber,
          tenantId: schema.invoices.tenantId,
          tenantName: schema.invoices.tenantName,
          unitId: schema.invoices.unitId,
          amount: schema.invoices.amount,
          type: schema.invoices.type,
          status: schema.invoices.status,
          createdAt: schema.invoices.createdAt,
          dueDate: schema.invoices.dueDate,
          description: schema.invoices.description,
          propertyName: schema.properties.name,
        })
        .from(schema.invoices)
        .leftJoin(schema.properties, eq(schema.properties.id, schema.invoices.propertyId));

      let list;
      if (callerRole === 'tenant') {
        // Tenants can only see their own invoices
        list = await baseQuery
          .where(eq(schema.invoices.tenantId, callerId))
          .orderBy(desc(schema.invoices.createdAt));
      } else {
        // Managers see invoices for their owned properties
        if (tenantId) {
          list = await baseQuery
            .where(
              and(
                eq(schema.invoices.tenantId, tenantId),
                eq(schema.properties.ownerId, callerId)
              )
            )
            .orderBy(desc(schema.invoices.createdAt));
        } else {
          list = await baseQuery
            .where(eq(schema.properties.ownerId, callerId))
            .orderBy(desc(schema.invoices.createdAt));
        }
      }

      return list.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || 'INV-TEMP',
        tenantId: inv.tenantId,
        tenantName: inv.tenantName,
        propertyName: inv.propertyName || 'Residential Roster',
        unitId: inv.unitId || 'N/A',
        amount: Number(inv.amount),
        type: inv.type || 'Rent',
        status: inv.status,
        issueDate: inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : '',
        dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
        description: inv.description,
      }));
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve invoices: ${err.message}`);
    }
  }

  @Get('billing-properties')
  async getProperties(@Req() req: any) {
    const db = this.db;
    const callerId = req.user.id;
    try {
      const props = await db.select().from(schema.properties).where(eq(schema.properties.ownerId, callerId));
      const units = await db.select().from(schema.units);
      
      const result = props.map((p: any) => {
        const propUnits = units.filter((u: any) => u.propertyId === p.id);
        return {
          id: p.id,
          name: p.name,
          units: propUnits.map((u: any) => ({
            id: u.id,
            label: u.label,
            status: u.status,
            tenantId: u.tenantId
          }))
        };
      });
      return result;
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('invoices')
  async createInvoice(@Req() req: any, @Body() payload: any) {
    const db = this.db;
    const callerId = req.user.id;
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Tenants cannot create invoices.');
    }
    
    try {
      const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
      const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
      
      let tenantEmail = payload.tenantEmail || 'billing@landlord.nl';
      let tenantName = payload.tenantName || 'Property Resident';
      let tenantId = payload.tenantId || null;

      if (payload.unitId && !tenantId) {
        const unitList = await db.select().from(schema.units).where(eq(schema.units.id, payload.unitId)).limit(1);
        if (unitList.length > 0 && unitList[0].tenantId) {
          tenantId = unitList[0].tenantId;
          const tUser = await db.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
          if (tUser.length > 0) {
            tenantName = tUser[0].name;
            tenantEmail = tUser[0].email;
          }
        }
      }

      await db.insert(schema.invoices).values({
        id: invoiceId,
        invoiceNumber: invoiceNum,
        type: payload.type || 'Custom Invoice',
        tenantId: tenantId || callerId, // fallback to caller if vacant to satisfy DB notNull
        tenantEmail,
        tenantName,
        unitId: payload.unitId || null,
        propertyId: payload.propertyId,
        ownerId: callerId,
        amount: Number(payload.amount),
        description: payload.description || `Custom ${payload.type || 'Fee'} Invoice`,
        status: 'PENDING',
        dueDate: payload.dueDate ? new Date(payload.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      if (tenantId) {
        await this.realtimeService.sendNotification(
          tenantId,
          'New Invoice Received',
          `You have received a new invoice ${invoiceNum} for $${payload.amount}.`,
          `/tenant/payments`,
          true
        );
      }

      return { success: true, id: invoiceId };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }



  @Post('stripe/connect')
  async createStripeConnect(@Req() req: any) {
    const db = this.db;
    const userId = req.user.id;
    try {
      const userData = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      const user = userData[0];

      let accountId = user.stripeAccountId;
      
      if (!accountId) {
        // Create a new connected account
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          business_type: 'individual',
          capabilities: {
            transfers: { requested: true },
          },
        });
        accountId = account.id;
        
        await db.update(schema.users)
          .set({ stripeAccountId: accountId })
          .where(eq(schema.users.id, userId));
      }

      const isManager = user.role === 'manager';
      const returnUrl = isManager 
        ? 'http://localhost:3000/finance?stripe=success' 
        : 'http://localhost:3001/contractor/earnings?stripe=success';
      const refreshUrl = isManager 
        ? 'http://localhost:3000/finance?stripe=refresh' 
        : 'http://localhost:3001/contractor/earnings?stripe=refresh';

      // Create an account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return { url: accountLink.url };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('stripe/payout')
  async initiatePayout(@Req() req: any, @Body() body: { amount: number }) {
    const db = this.db;
    const userId = req.user.id;
    try {
      const userList = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      const user = userList[0];
      if (!user.stripeAccountId) {
        throw new BadRequestException('No Stripe Connect account linked.');
      }

      const amountInCents = Math.round(Number(body.amount) * 100);
      const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: 'usd',
        destination: user.stripeAccountId,
        description: `Contractor payout withdrawal for ${user.name}`,
      });

      await db.insert(schema.financialAudits).values({
        userId: userId,
        action: 'payout_initiated',
        amount: Number(body.amount),
        currency: 'usd',
        stripeTransactionId: transfer.id,
        referenceId: transfer.id,
        status: 'succeeded',
      });

      try {
        await stripe.payouts.create({
          amount: amountInCents,
          currency: 'usd',
        }, {
          stripeAccount: user.stripeAccountId,
        });
      } catch (payoutErr: any) {
        console.log('Direct payout creation deferred/failed:', payoutErr.message);
      }

      await db.update(schema.tickets)
        .set({ status: 'paid' })
        .where(and(eq(schema.tickets.contractorId, userId), eq(schema.tickets.status, 'completed')));

      // Notify contractor
      await this.realtimeService.sendNotification(
        userId,
        'Payout Processed Successfully',
        `Your payout withdrawal of $${body.amount} was processed successfully to your connected Stripe account.`,
        '/contractor/earnings',
        true
      );

      return { success: true, transferId: transfer.id };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const db = this.db;
    const userId = req.user.id;
    try {
      const u = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      if (u.length === 0) throw new BadRequestException('User not found.');
      return {
        id: u[0].id,
        name: u[0].name,
        email: u[0].email,
        role: u[0].role,
        stripeAccountId: u[0].stripeAccountId,
      };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('withdrawals')
  async getWithdrawals(@Req() req: any) {
    const db = this.db;
    const userId = req.user.id;
    try {
      const list = await db
        .select()
        .from(schema.financialAudits)
        .where(
          and(
            eq(schema.financialAudits.userId, userId),
            inArray(schema.financialAudits.action, ['payout_initiated'])
          )
        )
        .orderBy(desc(schema.financialAudits.createdAt));
      return list;
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('summary')
  async getFinanceSummary(@Req() req: any) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;
    
    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    try {
      // Get total revenue (paid invoices)
      const paidInvoices = await db
        .select({ amount: schema.invoices.amount })
        .from(schema.invoices)
        .where(
          and(
            inArray(schema.invoices.status, ['PAID', 'paid']),
            eq(schema.invoices.ownerId, callerId)
          )
        );

      const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

      // Get total expenses (completed tickets)
      const completedTickets = await db
        .select({ amount: schema.tickets.amount })
        .from(schema.tickets)
        .where(
          and(
            inArray(schema.tickets.status, ['completed', 'COMPLETED']),
            eq(schema.tickets.ownerId, callerId)
          )
        );

      const totalExpenses = completedTickets.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      return {
        totalRevenue,
        totalExpenses,
        netOperatingIncome: totalRevenue - totalExpenses,
        cashBalance: totalRevenue - totalExpenses // Simple calculation for now
      };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to fetch financial summary: ${err.message}`);
    }
  }

  @Get('ledger')
  async getLedgerTransactions(@Req() req: any) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;
    
    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    try {
      // Get paid invoices (Revenue)
      const paidInvoices = await db
        .select({
          id: schema.invoices.id,
          date: schema.invoices.paidAt,
          ref: schema.invoices.invoiceNumber,
          details: schema.invoices.description,
          payee: schema.invoices.tenantName,
          account: schema.invoices.type,
          propertyId: schema.invoices.propertyId,
          amount: schema.invoices.amount,
          type: sql<string>`'revenue'`
        })
        .from(schema.invoices)
        .where(
          and(
            inArray(schema.invoices.status, ['PAID', 'paid']),
            eq(schema.invoices.ownerId, callerId)
          )
        );
 
      // Get completed tickets (Expenses)
      const completedTickets = await db
        .select({
          id: schema.tickets.id,
          date: schema.tickets.createdAt,
          ref: schema.tickets.id,
          details: schema.tickets.title,
          payee: sql<string>`'Contractor'`,
          account: schema.tickets.category,
          propertyId: schema.tickets.propertyId,
          amount: schema.tickets.amount,
          type: sql<string>`'expense'`
        })
        .from(schema.tickets)
        .where(
          and(
            inArray(schema.tickets.status, ['completed', 'COMPLETED']),
            eq(schema.tickets.ownerId, callerId)
          )
        );

      // Combine and format
      let allTransactions = [];
      
      for (const inv of paidInvoices) {
        let propName = 'Unknown Property';
        if (inv.propertyId) {
           const prop = await db.select({ name: schema.properties.name }).from(schema.properties).where(eq(schema.properties.id, inv.propertyId)).limit(1);
           if (prop.length > 0) propName = prop[0].name;
        }
        allTransactions.push({
          id: inv.id,
          date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          ref: inv.ref || 'SYS-INV',
          details: inv.details || 'Income',
          payee: inv.payee || 'Resident',
          account: `4000 - ${inv.account || 'Income'}`,
          property: propName,
          debit: null,
          credit: Number(inv.amount),
          rawDate: inv.date ? new Date(inv.date).getTime() : 0
        });
      }

      for (const t of completedTickets) {
        let propName = 'Unknown Property';
        if (t.propertyId) {
           const prop = await db.select({ name: schema.properties.name }).from(schema.properties).where(eq(schema.properties.id, t.propertyId)).limit(1);
           if (prop.length > 0) propName = prop[0].name;
        }
        allTransactions.push({
          id: t.id,
          date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          ref: t.ref || 'SYS-TKT',
          details: t.details || 'Maintenance Expense',
          payee: t.payee || 'Contractor',
          account: `5100 - ${t.account || 'Maintenance'}`,
          property: propName,
          debit: Number(t.amount),
          credit: null,
          rawDate: t.date ? new Date(t.date).getTime() : 0
        });
      }

      // Sort by date descending
      allTransactions.sort((a, b) => b.rawDate - a.rawDate);

      return allTransactions;
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to fetch ledger: ${err.message}`);
    }
  }

  @Get('invoices/:id')
  async getInvoiceById(@Req() req: any, @Param('id') id: string) {
    const db = this.db;
    const callerId = req.user.id;
    
    try {
      const invoiceList = await db
        .select({
          id: schema.invoices.id,
          invoiceNumber: schema.invoices.invoiceNumber,
          tenantId: schema.invoices.tenantId,
          tenantName: schema.invoices.tenantName,
          tenantEmail: schema.invoices.tenantEmail,
          unitId: schema.invoices.unitId,
          propertyId: schema.invoices.propertyId,
          amount: schema.invoices.amount,
          type: schema.invoices.type,
          status: schema.invoices.status,
          dueDate: schema.invoices.dueDate,
          createdAt: schema.invoices.createdAt,
          description: schema.invoices.description,
          propertyName: schema.properties.name,
        })
        .from(schema.invoices)
        .leftJoin(schema.properties, eq(schema.properties.id, schema.invoices.propertyId))
        .where(eq(schema.invoices.id, id))
        .limit(1);

      if (invoiceList.length === 0) {
        throw new BadRequestException('Invoice not found.');
      }

      const inv = invoiceList[0];
      
      // Verify access: either tenant is the caller, or manager/owner has access
      if (req.user.role === 'tenant' && inv.tenantId !== callerId) {
        throw new BadRequestException('Access denied.');
      }

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || 'INV-TEMP',
        tenantId: inv.tenantId,
        tenantName: inv.tenantName,
        tenantEmail: inv.tenantEmail || '',
        propertyName: inv.propertyName || 'Residential Roster',
        unitId: inv.unitId || 'N/A',
        amount: Number(inv.amount),
        type: inv.type || 'Rent',
        status: inv.status,
        issueDate: inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : '',
        dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
        description: inv.description,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to retrieve invoice details: ${err.message}`);
    }
  }

  @Post('invoices/:id/reconcile')
  async reconcileInvoice(@Req() req: any, @Param('id') id: string) {
    const db = this.db;
    const callerId = req.user.id;
    
    // Role / Permission Check
    const hasPermission = (permissionKey: string) => {
      if (req.user.role === 'manager') return true;
      const permissionsRaw = req.user.permissions;
      if (!permissionsRaw) return false;
      try {
        const parsed = JSON.parse(permissionsRaw);
        if (typeof parsed === 'object' && parsed !== null) {
          return !!parsed[permissionKey] || !!parsed.all;
        }
      } catch (e) {}
      return permissionsRaw.includes(permissionKey) || permissionsRaw.includes('all');
    };

    if (!hasPermission('reconcile') && !hasPermission('reconcile_invoices')) {
      throw new BadRequestException('Access denied. You do not have permission to reconcile invoices.');
    }

    try {
      const invoiceList = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).limit(1);
      if (invoiceList.length === 0) {
        throw new BadRequestException('Invoice not found.');
      }
      const invoice = invoiceList[0];

      await db
        .update(schema.invoices)
        .set({
          status: 'RECONCILED',
          paidAt: new Date(),
        })
        .where(eq(schema.invoices.id, id));

      // Log to security/audit logs
      const initials = req.user.name ? req.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'SYS';
      await db.insert(schema.auditLogs).values({
        id: `log_${Math.random().toString(36).substring(2, 11)}`,
        ownerId: req.user.role === 'manager' ? callerId : (invoice.ownerId || callerId),
        actorName: req.user.name || 'System',
        actorEmail: req.user.email || 'system@landlord.nl',
        actorInitials: initials,
        categoryIconName: 'ShieldCheck',
        categoryLabel: 'Reconciliation',
        description: `Manually reconciled invoice #${invoice.invoiceNumber || invoice.id} for $${Number(invoice.amount).toFixed(2)}.`,
        ip: req.ip || '127.0.0.1',
        location: 'Dashboard Portal',
        status: 'success',
        severity: 'warning',
        timestamp: new Date(),
      });

      return { success: true, message: 'Invoice marked as reconciled.' };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to reconcile invoice: ${err.message}`);
    }
  }

  @Post('invoices/:id/cancel')
  async cancelInvoice(@Req() req: any, @Param('id') id: string) {
    const db = this.db;
    const callerId = req.user.id;
    
    // Role / Permission Check
    const hasPermission = (permissionKey: string) => {
      if (req.user.role === 'manager') return true;
      const permissionsRaw = req.user.permissions;
      if (!permissionsRaw) return false;
      try {
        const parsed = JSON.parse(permissionsRaw);
        if (typeof parsed === 'object' && parsed !== null) {
          return !!parsed[permissionKey] || !!parsed.all;
        }
      } catch (e) {}
      return permissionsRaw.includes(permissionKey) || permissionsRaw.includes('all');
    };

    if (!hasPermission('cancel') && !hasPermission('cancel_invoices') && !hasPermission('delete_invoices')) {
      throw new BadRequestException('Access denied. You do not have permission to cancel invoices.');
    }

    try {
      const invoiceList = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).limit(1);
      if (invoiceList.length === 0) {
        throw new BadRequestException('Invoice not found.');
      }
      const invoice = invoiceList[0];

      await db
        .update(schema.invoices)
        .set({
          status: 'CANCELLED',
        })
        .where(eq(schema.invoices.id, id));

      // Log to security/audit logs
      const initials = req.user.name ? req.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'SYS';
      await db.insert(schema.auditLogs).values({
        id: `log_${Math.random().toString(36).substring(2, 11)}`,
        ownerId: req.user.role === 'manager' ? callerId : (invoice.ownerId || callerId),
        actorName: req.user.name || 'System',
        actorEmail: req.user.email || 'system@landlord.nl',
        actorInitials: initials,
        categoryIconName: 'AlertTriangle',
        categoryLabel: 'Cancellation',
        description: `Manually cancelled invoice #${invoice.invoiceNumber || invoice.id} for $${Number(invoice.amount).toFixed(2)}.`,
        ip: req.ip || '127.0.0.1',
        location: 'Dashboard Portal',
        status: 'success',
        severity: 'critical',
        timestamp: new Date(),
      });

      return { success: true, message: 'Invoice successfully cancelled.' };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to cancel invoice: ${err.message}`);
    }
  }

  @Post('invoices/:id/pay')
  async payInvoice(@Req() req: any, @Param('id') id: string, @Body() body: { amount?: number }) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;

    try {
      const invList = await db
        .select()
        .from(schema.invoices)
        .leftJoin(schema.properties, eq(schema.properties.id, schema.invoices.propertyId))
        .where(eq(schema.invoices.id, id))
        .limit(1);

      if (invList.length === 0) {
        throw new BadRequestException('Invoice not found.');
      }
      
      const inv = invList[0].invoices;
      const prop = invList[0].properties;

      if (callerRole === 'tenant' && inv.tenantId !== callerId) {
        throw new BadRequestException('Access denied. You cannot pay other users\' invoices.');
      }
      if (callerRole === 'manager' && prop?.ownerId !== callerId) {
        throw new BadRequestException('Access denied. You cannot pay invoices of other portfolios.');
      }

      const totalAmount = Number(inv.amount || 0);
      const prevAmountPaid = Number(inv.amountPaid || 0);
      const outstanding = Math.max(0, totalAmount - prevAmountPaid);

      let payAmount = outstanding;
      if (body.amount !== undefined) {
        payAmount = Number(body.amount);
        if (isNaN(payAmount) || payAmount <= 0) {
          throw new BadRequestException('Payment amount must be a positive number.');
        }
        if (payAmount > outstanding) {
          throw new BadRequestException(`Payment amount $${payAmount} exceeds outstanding balance $${outstanding}.`);
        }
      }

      const newAmountPaid = prevAmountPaid + payAmount;
      const newStatus = newAmountPaid >= totalAmount ? 'PAID' : 'PARTIAL';

      await db
        .update(schema.invoices)
        .set({ 
          status: newStatus, 
          amountPaid: newAmountPaid,
          paidAt: newStatus === 'PAID' ? new Date() : null 
        })
        .where(eq(schema.invoices.id, id));

      if (inv.unitId) {
        const unitList = await db.select().from(schema.units).where(eq(schema.units.id, inv.unitId)).limit(1);
        if (unitList.length > 0) {
          const currentArrears = unitList[0].arrears || 0;
          const newArrears = Math.max(0, currentArrears - payAmount);
          await db
            .update(schema.units)
            .set({ arrears: newArrears })
            .where(eq(schema.units.id, inv.unitId));
        }
      }

      // Notify managers
      if (inv.propertyId) {
        await this.realtimeService.sendPropertyNotification(
          inv.propertyId,
          'Tenant Paid Invoice',
          `Invoice ${inv.invoiceNumber} for $${inv.amount} has been paid by ${inv.tenantName}.`,
          `/finance`,
          true
        );
      }

      // Notify tenant
      if (inv.tenantId) {
        await this.realtimeService.sendNotification(
          inv.tenantId,
          'Payment Confirmed',
          `Your payment of $${inv.amount} for invoice ${inv.invoiceNumber} has been received.`,
          `/tenant/payments`,
          false
        );
      }

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to pay invoice: ${err.message}`);
    }
  }

  @Post('onboard')
  async onboardProperty(@Req() req: any, @Body() payload: OnboardPayload) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied. Tenants cannot onboard properties.');
    }

    if (!payload.propertyName || !payload.units) {
      throw new BadRequestException('propertyName and units are required fields.');
    }

    // Force ownerId to be the callerId to prevent BOLA/spoofing
    const targetOwnerId = callerId;

    try {
      const existingOwner = await db.select().from(schema.users).where(eq(schema.users.id, targetOwnerId)).limit(1);
      if (existingOwner.length === 0) {
        await db.insert(schema.users).values({
          id: targetOwnerId,
          name: 'System Default Owner',
          email: `owner-${targetOwnerId}@landlord.nl`,
          role: 'owner',
        });
      }

      const propertyId = 'prop-' + Math.random().toString(36).substring(2, 9);
      await db.insert(schema.properties).values({
        id: propertyId,
        name: payload.propertyName,
        address: payload.propertyAddress || 'No Address Pin',
        ownerId: targetOwnerId,
        unitsCount: payload.units.length,
        status: 'active',
        photoUrl: payload.photoUrl || null,
      });

      for (const unit of payload.units) {
        let tenantUserId: string | null = null;
        if (unit.occupied && unit.tenantEmail) {
          const existingUser = await db
            .select({ id: schema.users.id })
            .from(schema.users)
            .where(eq(schema.users.email, unit.tenantEmail.toLowerCase().trim()))
            .limit(1);

          if (existingUser.length > 0) {
            tenantUserId = existingUser[0].id;
          } else {
            tenantUserId = 'user-' + Math.random().toString(36).substring(2, 9);
            await db.insert(schema.users).values({
              id: tenantUserId,
              name: unit.tenantName || 'Resident Tenant',
              email: unit.tenantEmail.toLowerCase().trim(),
              role: 'tenant',
              phone: unit.tenantPhone || null,
              idNumber: unit.tenantIdNumber || null,
              leaseStart: unit.leaseStart ? new Date(unit.leaseStart) : null,
              leaseEnd: unit.leaseEnd ? new Date(unit.leaseEnd) : null,
              kinDetails: unit.kins ? JSON.stringify(unit.kins) : null,
            });
          }
        }

        const unitRecordId = 'unit-' + Math.random().toString(36).substring(2, 9);
        await db.insert(schema.units).values({
          id: unitRecordId,
          propertyId,
          label: unit.unitId,
          rent: unit.rent,
          status: unit.occupied ? 'occupied' : 'vacant',
          tenantId: tenantUserId,
          floor: unit.floor || '1',
          unitType: unit.unitType,
          deposit: unit.deposit,
          moveInFees: unit.moveInFees,
          recurringFees: unit.recurringFees,
          arrears: unit.arrears,
        });

        if (unit.arrears > 0 && tenantUserId) {
          const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
          await db.insert(schema.invoices).values({
            id: invoiceId,
            invoiceNumber: invoiceNum,
            type: 'Arrears',
            tenantId: tenantUserId,
            tenantEmail: unit.tenantEmail!.toLowerCase().trim(),
            tenantName: unit.tenantName || 'Resident Tenant',
            unitId: unitRecordId,
            propertyId,
            ownerId: targetOwnerId,
            amount: unit.arrears,
            description: 'Outstanding arrears balance imported during onboarding',
            status: 'OVERDUE',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }

        if (unit.occupied && tenantUserId) {
          const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
          await db.insert(schema.invoices).values({
            id: invoiceId,
            invoiceNumber: invoiceNum,
            type: 'Rent',
            tenantId: tenantUserId,
            tenantEmail: unit.tenantEmail!.toLowerCase().trim(),
            tenantName: unit.tenantName || 'Resident Tenant',
            unitId: unitRecordId,
            propertyId,
            ownerId: targetOwnerId,
            amount: unit.rent,
            description: 'Monthly rent charge',
            status: 'PENDING',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });

          if (unit.moveInFees > 0) {
            const mInvoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
            const mInvoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
            await db.insert(schema.invoices).values({
              id: mInvoiceId,
              invoiceNumber: mInvoiceNum,
              type: 'Move-in Fees',
              tenantId: tenantUserId,
              tenantEmail: unit.tenantEmail!.toLowerCase().trim(),
              tenantName: unit.tenantName || 'Resident Tenant',
              unitId: unitRecordId,
              propertyId,
              ownerId: targetOwnerId,
              amount: unit.moveInFees,
              description: 'One-time move-in fees (security deposit & setup charges)',
              status: 'PENDING',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            });
          }
        }
      }

      return { success: true, propertyId };
    } catch (err: any) {
      const dbError = err.detail || err.code ? ` (Code: ${err.code}, Detail: ${err.detail})` : '';
      throw new InternalServerErrorException(`Failed to complete onboarding: ${err.message}${dbError}`);
    }
  }

  @Post('payments/create-intent')
  async createPaymentIntent(@Req() req: any, @Body() body: { invoiceId: string; amount?: number }) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (!body.invoiceId) {
      throw new BadRequestException('invoiceId is required.');
    }
    try {
      const invoiceList = await db
        .select()
        .from(schema.invoices)
        .leftJoin(schema.properties, eq(schema.properties.id, schema.invoices.propertyId))
        .where(eq(schema.invoices.id, body.invoiceId))
        .limit(1);

      if (invoiceList.length === 0) {
        throw new BadRequestException('Invoice not found.');
      }

      const invoice = invoiceList[0].invoices;
      const prop = invoiceList[0].properties;

      if (callerRole === 'tenant' && invoice.tenantId !== callerId) {
        throw new BadRequestException('Access denied. You cannot generate a payment intent for another user\'s invoice.');
      }
      if (callerRole === 'manager' && prop?.ownerId !== callerId) {
        throw new BadRequestException('Access denied. You cannot generate a payment intent for an invoice outside your portfolio.');
      }

      if (invoice.status.toUpperCase() === 'PAID') {
        throw new BadRequestException('Invoice is already paid.');
      }

      const Stripe = require('stripe');
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        throw new InternalServerErrorException('Stripe API secret key is missing in configuration.');
      }
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });

      const totalAmount = Number(invoice.amount || 0);
      const prevAmountPaid = Number(invoice.amountPaid || 0);
      const outstanding = Math.max(0, totalAmount - prevAmountPaid);

      let payAmount = outstanding;
      if (body.amount !== undefined) {
        payAmount = Number(body.amount);
        if (isNaN(payAmount) || payAmount <= 0) {
          throw new BadRequestException('Payment amount must be a positive number.');
        }
        if (payAmount > outstanding) {
          throw new BadRequestException(`Payment amount $${payAmount} exceeds outstanding balance $${outstanding}.`);
        }
      }

      const amountInCents = Math.round(payAmount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: { invoiceId: body.invoiceId },
      });

      await db.insert(schema.financialAudits).values({
        userId: invoice.tenantId,
        action: 'charge_attempt',
        amount: amountInCents / 100,
        currency: 'usd',
        stripeTransactionId: paymentIntent.id,
        referenceId: invoice.id,
        status: 'pending',
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to create Stripe payment intent: ${err.message}`);
    }
  }

  @Post('payments/confirm')
  async confirmPayment(@Req() req: any, @Body() body: { invoiceId: string; paymentIntentId: string }) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (!body.invoiceId || !body.paymentIntentId) {
      throw new BadRequestException('invoiceId and paymentIntentId are required.');
    }
    try {
      const invoiceList = await db
        .select()
        .from(schema.invoices)
        .leftJoin(schema.properties, eq(schema.properties.id, schema.invoices.propertyId))
        .leftJoin(schema.units, eq(schema.units.id, schema.invoices.unitId))
        .where(eq(schema.invoices.id, body.invoiceId))
        .limit(1);

      if (invoiceList.length === 0) {
        throw new BadRequestException('Invoice not found.');
      }

      const invoice = invoiceList[0].invoices;
      const prop = invoiceList[0].properties;
      const unit = invoiceList[0].units;

      if (callerRole === 'tenant' && invoice.tenantId !== callerId) {
        throw new BadRequestException('Access denied. You cannot confirm payment for another user\'s invoice.');
      }
      if (callerRole === 'manager' && prop?.ownerId !== callerId) {
        throw new BadRequestException('Access denied. You cannot confirm payment for an invoice outside your portfolio.');
      }

      const Stripe = require('stripe');
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        throw new InternalServerErrorException('Stripe API secret key is missing in configuration.');
      }
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });

      const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException(`Payment intent has not succeeded (status: ${paymentIntent.status}).`);
      }

       const amountPaidThisTime = paymentIntent.amount / 100;
       const totalAmount = Number(invoice.amount || 0);
       const prevAmountPaid = Number(invoice.amountPaid || 0);
       const newAmountPaid = prevAmountPaid + amountPaidThisTime;
       const newStatus = newAmountPaid >= totalAmount ? 'PAID' : 'PARTIAL';

       await db
         .update(schema.invoices)
         .set({
           status: newStatus,
           amountPaid: newAmountPaid,
           paidAt: newStatus === 'PAID' ? new Date() : null,
         })
         .where(eq(schema.invoices.id, body.invoiceId));

       if (invoice.unitId) {
         const unitList = await db.select().from(schema.units).where(eq(schema.units.id, invoice.unitId)).limit(1);
         if (unitList.length > 0) {
           const currentArrears = unitList[0].arrears || 0;
           const newArrears = Math.max(0, currentArrears - amountPaidThisTime);
           await db
             .update(schema.units)
             .set({ arrears: newArrears })
             .where(eq(schema.units.id, invoice.unitId));
         }
       }

       await db.insert(schema.financialAudits).values({
         userId: callerId,
         action: 'charge_success',
         amount: amountPaidThisTime,
         currency: 'usd',
         stripeTransactionId: paymentIntent.id,
         referenceId: body.invoiceId,
         status: 'succeeded',
       });

      // Send a confirmation email to the tenant
      if (invoice.tenantEmail) {
        const redactPropertyName = (name: string): string => {
          if (!name || name.length <= 3) return '***';
          return name.substring(0, 3) + '*'.repeat(name.length - 3);
        };

        const propRedacted = prop ? redactPropertyName(prop.name) : 'Redacted Property';
        const unitLabel = unit ? unit.label : 'N/A';

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px;">
              <h1 style="color: #f43f5e; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">landlord.nl</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Payment Confirmed</p>
            </div>
            <p style="font-size: 15px; font-weight: 600; color: #0f172a;">Dear ${invoice.tenantName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              We are pleased to confirm that we have successfully received your payment of <strong>$${Number(amountPaidThisTime).toFixed(2)}</strong> for invoice <strong>#${invoice.invoiceNumber || invoice.id}</strong>.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h4 style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; font-weight: 700;">Lease & Location Details</h4>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #334155;">
                <strong>Property:</strong> ${propRedacted}
              </p>
              <p style="margin: 0; font-size: 13px; color: #334155;">
                <strong>Unit:</strong> ${unitLabel}
              </p>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 24px;">
              Your account has been credited. You can log in to your Landlord.nl portal to view and download the full PDF receipt at any time.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 10px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.4;">
              This is a secure automated receipt from Landlord.nl. If you did not make this transaction or have billing questions, please reach out to your property manager.
            </p>
          </div>
        `;

        try {
          await this.emailService.sendEmail(
            invoice.tenantEmail,
            `[Landlord.nl] Payment Receipt - #${invoice.invoiceNumber || invoice.id}`,
            emailHtml
          );
        } catch (emailErr) {
          console.error('Failed to send payment receipt email:', emailErr);
        }
      }

      // Emit notifications to all authorized managers for this property
      if (invoice.propertyId) {
        try {
          const managers = await this.realtimeService.getAuthorizedManagersForProperty(invoice.propertyId);
          for (const managerId of managers) {
            await this.realtimeService.sendNotification(
              managerId,
              'Payment Received',
              `${invoice.tenantName} paid $${Number(invoice.amount).toFixed(2)} for invoice #${invoice.invoiceNumber || invoice.id}.`,
              `/finance/expenses`,
              true // important
            );
          }
        } catch (notifErr) {
          console.error('Failed to send manager payment notification:', notifErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to confirm payment: ${err.message}`);
    }
  }

  @Get('sidebar-metrics')
  async getSidebarMetrics(@Req() req: any) {
    const db = this.db;
    const callerId = req.user.id;
    try {
      // 1. Properties
      const props = await db.select().from(schema.properties).where(eq(schema.properties.ownerId, callerId));
      const totalProperties = props.length;
      const hasPendingProperties = props.some((p: any) => p.status === 'pending');

      // 2. Tenants (unique tenant IDs in units inside properties owned by this landlord)
      const tenantCountRes = await db
        .select({ count: sql<number>`count(distinct ${schema.units.tenantId})` })
        .from(schema.units)
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(eq(schema.properties.ownerId, callerId));
      const totalTenants = Number(tenantCountRes[0]?.count || 0);

      // 3. Invoices
      const invs = await db.select().from(schema.invoices).where(eq(schema.invoices.ownerId, callerId));
      const totalInvoices = invs.length;
      const hasOverdueInvoices = invs.some((i: any) => {
        const isUnpaid = i.status && i.status.toLowerCase() === 'unpaid';
        const isOverdue = i.status && i.status.toLowerCase() === 'overdue';
        const isPastDue = i.dueDate && new Date(i.dueDate) < new Date();
        return isOverdue || (isUnpaid && isPastDue);
      });

      // 4. Maintenance
      const tkts = await db.select().from(schema.tickets).where(eq(schema.tickets.ownerId, callerId));
      // "total maintenance request that arent completed": status is not 'completed' AND status is not 'paid'
      const uncompletedTickets = tkts.filter((t: any) => t.status !== 'completed' && t.status !== 'paid').length;
      // "a yellow dot if any non reviewed": status is 'open'
      const hasNonReviewedTickets = tkts.some((t: any) => t.status === 'open');
      // "additional red dot for those completed but not paid out": status is 'completed'
      const hasCompletedUnpaidTickets = tkts.some((t: any) => t.status === 'completed');

      return {
        properties: {
          count: totalProperties,
          hasPending: hasPendingProperties,
        },
        tenants: {
          count: totalTenants,
        },
        invoices: {
          count: totalInvoices,
          hasOverdue: hasOverdueInvoices,
        },
        maintenance: {
          count: uncompletedTickets,
          hasNonReviewed: hasNonReviewedTickets,
          hasCompletedUnpaid: hasCompletedUnpaidTickets,
        }
      };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
