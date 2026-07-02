import { eq, and, or } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { checkToolPermission } from './permissions';

export interface AddInvoiceArgs {
  propertyId?: string;
  unitIdOrLabel?: string;
  tenantEmail?: string;
  amount: number;
  description: string;
  dueDateStr?: string;
  type?: string;
}

export class AddInvoiceTool {
  static async execute(
    args: AddInvoiceArgs,
    context: { db: any; userId: string; userRole: string; user?: any }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId, user } = context;

    // Check permissions
    if (user && !checkToolPermission(user, 'Finance', 'Process Payments')) {
      return { success: false, error: 'Access Denied: You do not have permission to issue invoices/payments.' };
    }

    const { propertyId, unitIdOrLabel, tenantEmail, amount, description, dueDateStr, type = 'Fee' } = args;

    try {
      const userExist = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      const orgName = userExist[0]?.organizationName || null;

      let tenantUser = null;
      let targetUnit = null;
      let targetProperty = null;

      // Scenario 1: Specific unit
      if (propertyId && unitIdOrLabel) {
        const propList = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
        if (propList.length > 0) targetProperty = propList[0];

        const unitList = await db
          .select()
          .from(schema.units)
          .where(
            and(
              eq(schema.units.propertyId, propertyId),
              or(eq(schema.units.id, unitIdOrLabel), eq(schema.units.label, unitIdOrLabel))
            )
          )
          .limit(1);

        if (unitList.length > 0) {
          targetUnit = unitList[0];
          if (targetUnit.status !== 'occupied' || !targetUnit.tenantId) {
            return { success: false, error: `Unit '${unitIdOrLabel}' is not occupied. Cannot add an invoice to a vacant unit.` };
          }
          const userList = await db.select().from(schema.users).where(eq(schema.users.id, targetUnit.tenantId)).limit(1);
          if (userList.length > 0) {
            tenantUser = userList[0];
          }
        } else {
          return { success: false, error: `Unit '${unitIdOrLabel}' not found.` };
        }
      } 
      // Scenario 2: Tenant Email directly
      else if (tenantEmail) {
        const userList = await db.select().from(schema.users).where(eq(schema.users.email, tenantEmail.toLowerCase())).limit(1);
        if (userList.length > 0) {
          tenantUser = userList[0];
        } else {
          return { success: false, error: `Tenant with email '${tenantEmail}' not found.` };
        }

        if (propertyId) {
          const propList = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
          if (propList.length > 0) targetProperty = propList[0];
        }
      } else {
        return { success: false, error: `Must provide either a specific unit (propertyId + unitIdOrLabel) or a tenantEmail to attach the invoice to.` };
      }

      if (!tenantUser) {
        return { success: false, error: 'Could not identify a tenant to assign the invoice to.' };
      }

      const dueDate = dueDateStr ? new Date(dueDateStr) : new Date();
      const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
      const invNum = `INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

      await db.insert(schema.invoices).values({
        id: invId,
        invoiceNumber: invNum,
        type,
        tenantId: tenantUser.id,
        tenantEmail: tenantUser.email,
        tenantName: tenantUser.name,
        unitId: targetUnit ? targetUnit.id : null,
        propertyId: targetProperty ? targetProperty.id : null,
        ownerId: userId,
        organizationName: orgName,
        amount,
        amountPaid: 0,
        description,
        status: 'unpaid',
        dueDate,
      });

      // Add audit log
      await db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: userId,
        organizationName: orgName,
        actorName: 'Sophia AI',
        actorEmail: 'sophia@landlord.nl',
        actorInitials: 'SA',
        categoryIconName: 'FileText',
        categoryLabel: 'Invoices',
        description: `Sophia created an invoice for ${tenantUser.name} - ${description} ($${amount}).`,
        severity: 'info',
        status: 'success',
        ip: '127.0.0.1',
        location: 'Sophia AI Workspace',
      });

      return {
        success: true,
        message: `Successfully generated invoice ${invNum} for tenant ${tenantUser.name}.`,
        invoice: {
          id: invId,
          invoiceNumber: invNum,
          amount,
          description,
          dueDate: dueDate.toISOString(),
          tenantName: tenantUser.name,
          tenantEmail: tenantUser.email,
        }
      };

    } catch (err: any) {
      return {
        success: false,
        error: `Failed to add invoice: ${err.message}`,
      };
    }
  }
}
