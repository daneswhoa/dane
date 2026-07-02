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
      const userExist = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      const orgName = userExist[0]?.organizationName || null;

      if (!args.tenantEmail && !args.tenantId && !args.unitId) {
        return { success: false, error: 'Must provide tenantEmail, tenantId, or unitId to fetch invoices.' };
      }

      let conditions: any[] = [
        orgName
          ? eq(schema.invoices.organizationName, orgName)
          : eq(schema.invoices.ownerId, userId)
      ];

      if (args.tenantId) {
        conditions.push(eq(schema.invoices.tenantId, args.tenantId));
      } else if (args.tenantEmail) {
        conditions.push(eq(schema.invoices.tenantEmail, args.tenantEmail));
      } else if (args.unitId) {
        conditions.push(eq(schema.invoices.unitId, args.unitId));
      }

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
