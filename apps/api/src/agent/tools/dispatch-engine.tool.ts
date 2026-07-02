import { eq, and } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { checkToolPermission } from './permissions';

export interface DispatchTicketArgs {
  action: 'assign' | 'request_quote' | 'approve_and_settle' | 'notify_tenant';
  ticketId: string;
  contractorId?: string;
  hourlyRate?: number; // Added hourlyRate parameter
  maxAuthorization?: number;
  settleAction?: 'pay_now' | 'approve_quote_only' | 'pay_and_bill_tenant' | 'bill_tenant_only' | 'pay_at_company_expense' | 'pay_and_charge_tenant' | 'finalize_without_paying';
  amount?: number;
  message?: string;
}

async function createContractorPayout(db: any, ticket: any, amount: number, userId: string, orgName: string | null) {
  const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
  const invoiceNum = 'EXP-' + Math.floor(100000 + Math.random() * 900000);
  
  let cName = 'Contractor Services';
  const contractorId = ticket.contractorId;
  if (contractorId) {
    const cUser = await db.select().from(schema.users).where(eq(schema.users.id, contractorId)).limit(1);
    if (cUser.length > 0) {
      cName = cUser[0].name;

      const stripeAccountId = cUser[0].stripeAccountId;
      if (stripeAccountId) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (stripeKey) {
          const Stripe = require('stripe');
          const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
          try {
            await stripe.transfers.create({
              amount: Math.round(amount * 100),
              currency: 'usd',
              destination: stripeAccountId,
              description: `Payment for Maintenance Ticket #${ticket.id}`,
            });

            await db.insert(schema.financialAudits).values({
              userId: contractorId,
              action: 'payout_initiated',
              amount: amount,
              currency: 'usd',
              referenceId: ticket.id,
              status: 'succeeded',
            });
          } catch (stripeErr: any) {
            console.error('Stripe transfer failed:', stripeErr.message);
          }
        }
      }
    }
  }

  await db.insert(schema.invoices).values({
    id: invoiceId,
    invoiceNumber: invoiceNum,
    type: 'Maintenance Expense',
    tenantId: ticket.contractorId || ticket.ownerId || userId,
    tenantEmail: 'contractor@landlord.hu',
    tenantName: cName,
    unitId: ticket.unitId || null,
    propertyId: ticket.propertyId || null,
    ownerId: ticket.ownerId || userId,
    organizationName: orgName,
    amount: amount,
    description: `Settled billing for Maintenance Ticket #${ticket.id.toUpperCase()}: ${ticket.title || ticket.description}`,
    status: 'PAID',
    paidAt: new Date(),
    dueDate: new Date(),
  });
}

export class DispatchEngineTool {
  static async execute(
    args: DispatchTicketArgs,
    context: { db: any; userId: string; userRole: string; user?: any }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId, user } = context;
    const { action, ticketId } = args;

    // Check permissions
    if (user) {
      if (['assign', 'request_quote', 'notify_tenant'].includes(action) && !checkToolPermission(user, 'Maintenance', 'Assign Contractor')) {
        return { success: false, error: 'Access Denied: You do not have permission to assign contractors to maintenance tickets.' };
      }
      if (action === 'approve_and_settle' && !checkToolPermission(user, 'Maintenance', 'Approve Invoices')) {
        return { success: false, error: 'Access Denied: You do not have permission to approve/settle contractor invoices.' };
      }
    }

    try {
      const userExist = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      const orgName = userExist[0]?.organizationName || null;

      const ticketList = await db.select().from(schema.tickets).where(eq(schema.tickets.id, ticketId)).limit(1);
      if (ticketList.length === 0) return { success: false, error: 'Ticket not found.' };
      const ticket = ticketList[0];

      if (ticket.organizationName !== orgName) {
        return { success: false, error: 'Access denied.' };
      }

      // Resolve contractorId to contractor's user_id if it starts with 'contractor-'
      let resolvedContractorUserId = args.contractorId;
      if (args.contractorId && args.contractorId.startsWith('contractor-')) {
        const cRec = await db.select().from(schema.contractors).where(eq(schema.contractors.id, args.contractorId)).limit(1);
        if (cRec.length === 0) {
          return { success: false, error: `Contractor not found with ID: ${args.contractorId}` };
        }
        if (!cRec[0].userId) {
          return { success: false, error: `Contractor ${cRec[0].name} has no associated user account.` };
        }
        resolvedContractorUserId = cRec[0].userId;
      }

      if (action === 'assign') {
        if (!args.contractorId) return { success: false, error: 'contractorId is required to assign.' };
        
        await db.update(schema.tickets).set({
          contractorId: resolvedContractorUserId,
          status: 'assigned',
          hourlyRate: args.hourlyRate ? String(args.hourlyRate) : null,
          maxAuthorization: args.maxAuthorization ? String(args.maxAuthorization) : null,
        }).where(eq(schema.tickets.id, ticketId));

        return { success: true, message: `Ticket successfully assigned to contractor.` };
      }

      if (action === 'request_quote') {
        if (!args.contractorId) return { success: false, error: 'contractorId is required to request quote.' };

        await db.update(schema.tickets).set({
          contractorId: resolvedContractorUserId,
          quoteStatus: 'requested',
        }).where(eq(schema.tickets.id, ticketId));

        return { success: true, message: `Quote requested from contractor successfully.` };
      }

      if (action === 'approve_and_settle') {
        if (!args.settleAction) {
          return { success: false, error: 'settleAction is required.' };
        }

        const amt = args.amount || 0;
        let finalMessage = `Successfully processed settlement action: ${args.settleAction}`;

        if (args.settleAction === 'approve_quote_only') {
          await db.update(schema.tickets).set({ quoteStatus: 'approved', quoteAmount: String(amt) }).where(eq(schema.tickets.id, ticketId));
          finalMessage = `Quote for €${amt} approved successfully.`;
        } else if (args.settleAction === 'pay_now' || args.settleAction === 'pay_at_company_expense') {
          await db.update(schema.tickets).set({ status: 'paid', amount: String(amt) }).where(eq(schema.tickets.id, ticketId));
          // Log financial audit
          await db.insert(schema.financialAudits).values({
            userId,
            action: 'contractor_payment',
            amount: amt,
            status: 'completed',
            referenceId: ticketId,
          });

          await createContractorPayout(db, ticket, amt, userId, orgName);
          finalMessage = `Paid contractor €${amt} immediately at company expense.`;
        } else if (args.settleAction === 'pay_and_bill_tenant' || args.settleAction === 'pay_and_charge_tenant') {
          if (!ticket.unitId) {
            return { success: false, error: 'Cannot charge tenant: Ticket is not associated with a specific unit (general request).' };
          }
          // Fetch unit to see if it is occupied
          const unitList = await db.select().from(schema.units).where(eq(schema.units.id, ticket.unitId)).limit(1);
          if (unitList.length === 0 || !unitList[0].tenantId) {
            return { success: false, error: 'Cannot charge tenant: The unit associated with this work order is currently vacant.' };
          }
          const tenantId = unitList[0].tenantId;

          // Fetch tenant user to get email and name
          const tenantUserList = await db.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
          const tenantEmail = tenantUserList.length > 0 ? tenantUserList[0].email : (ticket.tenantEmail || 'tenant@landlord.nl');
          const tenantName = tenantUserList.length > 0 ? tenantUserList[0].name : 'Tenant';

          // Mark ticket as paid & record amount
          await db.update(schema.tickets).set({ status: 'paid', amount: String(amt), tenantId }).where(eq(schema.tickets.id, ticketId));

          await db.insert(schema.financialAudits).values({
            userId,
            action: 'contractor_payment_reimbursable',
            amount: amt,
            status: 'completed',
            referenceId: ticketId,
          });

          await createContractorPayout(db, ticket, amt, userId, orgName);

          // Generate invoice for tenant
          const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const invNum = `INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
          await db.insert(schema.invoices).values({
            id: invId,
            invoiceNumber: invNum,
            type: 'Maintenance Charge',
            tenantId,
            tenantEmail,
            tenantName,
            unitId: ticket.unitId,
            propertyId: ticket.propertyId,
            ownerId: userId,
            organizationName: orgName,
            amount: amt,
            description: `Recharge for Maintenance: ${ticket.title || ticket.description || 'Maintenance Work'}`,
            status: 'unpaid',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days due
          });

          finalMessage = `Processed settlement. Billed tenant ${tenantName} €${amt} via Invoice ${invNum}.`;
        } else if (args.settleAction === 'finalize_without_paying') {
          await db.update(schema.tickets).set({ status: 'paid' }).where(eq(schema.tickets.id, ticketId));
          finalMessage = `Work order finalized without payment.`;
        } else if (args.settleAction === 'bill_tenant_only') {
          if (!ticket.tenantId) {
            return { success: false, error: 'Cannot bill tenant because ticket has no tenantId assigned.' };
          }
          const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const invNum = `INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
          await db.insert(schema.invoices).values({
            id: invId,
            invoiceNumber: invNum,
            type: 'Maintenance',
            tenantId: ticket.tenantId,
            tenantEmail: ticket.tenantEmail || 'unknown@example.com',
            tenantName: 'Tenant',
            unitId: ticket.unitId,
            propertyId: ticket.propertyId,
            ownerId: userId,
            organizationName: orgName,
            amount: amt,
            description: `Maintenance charge for ticket: ${ticket.title}`,
            status: 'unpaid',
          });
          finalMessage = `Billed tenant €${amt} via Invoice ${invNum}.`;
        }

        // Add audit log
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          organizationName: orgName,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Tool',
          categoryLabel: 'Maintenance',
          description: `Sophia processed settlement for ticket ${ticketId}: ${finalMessage}`,
          severity: 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        return { success: true, message: finalMessage };
      }

      if (action === 'notify_tenant') {
        if (!ticket.tenantId || !args.message) {
          return { success: false, error: 'Ticket must have tenantId and a message is required.' };
        }

        await db.insert(schema.notifications).values({
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          userId: ticket.tenantId,
          title: 'Maintenance Update',
          message: args.message,
          link: `/portal/maintenance/${ticketId}`,
        });

        return { success: true, message: `Notification sent to tenant successfully.` };
      }

      return { success: false, error: 'Unknown action.' };
    } catch (err: any) {
      return { success: false, error: `Dispatch engine failed: ${err.message}` };
    }
  }
}
