import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { checkToolPermission } from './permissions';

export interface ManageInvoiceArgs {
  invoiceId: string;
  action: 'mark_paid' | 'cancel' | 'adjust_amount';
  newAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

export class ManageInvoiceTool {
  static async execute(
    args: ManageInvoiceArgs,
    context: { db: any; userId: string; userRole: string; user?: any }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId, user } = context;

    // Check permissions
    if (user && !checkToolPermission(user, 'Finance', 'Process Payments')) {
      return { success: false, error: 'Access Denied: You do not have permission to manage/update invoices.' };
    }

    const { invoiceId, action } = args;

    try {
      const invoiceList = await db.select().from(schema.invoices).where(eq(schema.invoices.id, invoiceId)).limit(1);
      if (invoiceList.length === 0) return { success: false, error: 'Invoice not found.' };
      const invoice = invoiceList[0];

      if (action === 'mark_paid') {
        await db.update(schema.invoices).set({
          status: 'paid',
          amountPaid: invoice.amount,
          paidAt: new Date(),
        }).where(eq(schema.invoices.id, invoiceId));

        await db.insert(schema.financialAudits).values({
          userId,
          action: 'invoice_payment_received',
          amount: invoice.amount,
          status: 'completed',
          referenceId: invoiceId,
          metadata: args.notes || 'Marked as paid by Sophia',
        });

        return { success: true, message: `Invoice ${invoice.invoiceNumber || invoiceId} successfully marked as PAID.` };
      }

      if (action === 'cancel') {
        await db.update(schema.invoices).set({
          status: 'cancelled',
        }).where(eq(schema.invoices.id, invoiceId));

        return { success: true, message: `Invoice ${invoice.invoiceNumber || invoiceId} has been CANCELLED/WAIVED.` };
      }

      if (action === 'adjust_amount') {
        if (args.newAmount === undefined) return { success: false, error: 'newAmount is required to adjust amount.' };
        
        await db.update(schema.invoices).set({
          amount: String(args.newAmount),
        }).where(eq(schema.invoices.id, invoiceId));

        return { success: true, message: `Invoice ${invoice.invoiceNumber || invoiceId} amount adjusted to €${args.newAmount}.` };
      }

      return { success: false, error: 'Unknown action.' };
    } catch (err: any) {
      return { success: false, error: `Manage invoice failed: ${err.message}` };
    }
  }
}
