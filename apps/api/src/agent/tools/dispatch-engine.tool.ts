import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';

export interface DispatchTicketArgs {
  action: 'assign' | 'request_quote' | 'approve_and_settle' | 'notify_tenant';
  ticketId: string;
  contractorId?: string;
  maxAuthorization?: number;
  settleAction?: 'pay_now' | 'approve_quote_only' | 'pay_and_bill_tenant' | 'bill_tenant_only';
  amount?: number;
  message?: string;
}

export class DispatchEngineTool {
  static async execute(
    args: DispatchTicketArgs,
    context: { db: any; userId: string; userRole: string }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId } = context;
    const { action, ticketId } = args;

    try {
      const ticketList = await db.select().from(schema.tickets).where(eq(schema.tickets.id, ticketId)).limit(1);
      if (ticketList.length === 0) return { success: false, error: 'Ticket not found.' };
      const ticket = ticketList[0];

      if (action === 'assign') {
        if (!args.contractorId) return { success: false, error: 'contractorId is required to assign.' };
        
        await db.update(schema.tickets).set({
          contractorId: args.contractorId,
          status: 'assigned',
          maxAuthorization: args.maxAuthorization ? String(args.maxAuthorization) : null,
        }).where(eq(schema.tickets.id, ticketId));

        return { success: true, message: `Ticket successfully assigned to contractor.` };
      }

      if (action === 'request_quote') {
        if (!args.contractorId) return { success: false, error: 'contractorId is required to request quote.' };

        await db.update(schema.tickets).set({
          contractorId: args.contractorId,
          quoteStatus: 'requested',
        }).where(eq(schema.tickets.id, ticketId));

        return { success: true, message: `Quote requested from contractor successfully.` };
      }

      if (action === 'approve_and_settle') {
        if (!args.settleAction || !args.amount) {
          return { success: false, error: 'settleAction and amount are required.' };
        }

        const amt = args.amount;
        let finalMessage = `Successfully processed settlement action: ${args.settleAction}`;

        if (args.settleAction === 'approve_quote_only') {
          await db.update(schema.tickets).set({ quoteStatus: 'approved', quoteAmount: String(amt) }).where(eq(schema.tickets.id, ticketId));
          finalMessage = `Quote for €${amt} approved successfully.`;
        } else if (args.settleAction === 'pay_now') {
          await db.update(schema.tickets).set({ status: 'completed', amount: String(amt) }).where(eq(schema.tickets.id, ticketId));
          // Log financial audit
          await db.insert(schema.financialAudits).values({
            userId,
            action: 'contractor_payment',
            amount: amt,
            status: 'completed',
            referenceId: ticketId,
          });
          finalMessage = `Paid contractor €${amt} immediately.`;
        } else if (args.settleAction === 'pay_and_bill_tenant' || args.settleAction === 'bill_tenant_only') {
          if (!ticket.tenantId) {
            return { success: false, error: 'Cannot bill tenant because ticket has no tenantId assigned.' };
          }

          if (args.settleAction === 'pay_and_bill_tenant') {
            await db.update(schema.tickets).set({ status: 'completed', amount: String(amt) }).where(eq(schema.tickets.id, ticketId));
            await db.insert(schema.financialAudits).values({
              userId,
              action: 'contractor_payment_reimbursable',
              amount: amt,
              status: 'completed',
              referenceId: ticketId,
            });
          }

          // Generate invoice for tenant
          const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const invNum = `INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
          await db.insert(schema.invoices).values({
            id: invId,
            invoiceNumber: invNum,
            type: 'Maintenance',
            tenantId: ticket.tenantId,
            tenantEmail: ticket.tenantEmail || 'unknown@example.com',
            tenantName: 'Tenant', // We'd ideally join for exact name, but simplified here
            unitId: ticket.unitId,
            propertyId: ticket.propertyId,
            ownerId: userId,
            amount: amt,
            description: `Maintenance charge for ticket: ${ticket.title}`,
            status: 'unpaid',
          });

          finalMessage = `Processed settlement. Billed tenant €${amt} via Invoice ${invNum}.`;
        }

        // Add audit log
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
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
