import { eq, or } from 'drizzle-orm';
import * as schema from '../../db/schema';

export interface GetTenantInvoicesArgs {
  tenantEmail?: string;
  tenantId?: string;
  unitId?: string;
}

export class GetTenantInvoicesTool {
  static async execute(
    args: GetTenantInvoicesArgs,
    context: { db: any; userId: string; userRole: string }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId } = context;

    try {
      if (!args.tenantEmail && !args.tenantId && !args.unitId) {
        return { success: false, error: 'Must provide tenantEmail, tenantId, or unitId to fetch invoices.' };
      }

      let conditions: any[] = [eq(schema.invoices.ownerId, userId)];

      if (args.tenantId) {
        conditions.push(eq(schema.invoices.tenantId, args.tenantId));
      } else if (args.tenantEmail) {
        conditions.push(eq(schema.invoices.tenantEmail, args.tenantEmail));
      } else if (args.unitId) {
        conditions.push(eq(schema.invoices.unitId, args.unitId));
      }

      // If we provided multiple, we'd need 'and' logic, but usually it's one of them.
      // We will just use the first one matched above.
      const condition = conditions.length === 2 ? conditions[1] : conditions[1]; // We always want the filter plus ownerId. Wait, better to use and().
      
      const invoicesList = await db
        .select()
        .from(schema.invoices)
        .where(
          conditions.length === 2 
            ? require('drizzle-orm').and(conditions[0], conditions[1])
            : conditions[0]
        );

      // Find tenant details
      let tenantName = 'Unknown Tenant';
      let unitLabel = '';
      if (invoicesList.length > 0) {
        tenantName = invoicesList[0].tenantName;
        if (invoicesList[0].unitId) {
          const unit = await db.select().from(schema.units).where(eq(schema.units.id, invoicesList[0].unitId)).limit(1);
          if (unit.length > 0) unitLabel = unit[0].label;
        }
      }

      const totalAmount = invoicesList.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
      const totalPaid = invoicesList.reduce((acc: number, curr: any) => acc + Number(curr.amountPaid || 0), 0);
      const balance = totalAmount - totalPaid;

      return {
        success: true,
        tenantName,
        unitLabel,
        invoices: invoicesList,
        summary: {
          totalAmount,
          totalPaid,
          balance,
        },
        message: `Found ${invoicesList.length} invoices.`,
      };
    } catch (err: any) {
      return { success: false, error: `Failed to fetch invoices: ${err.message}` };
    }
  }
}
