import { eq, and, or } from 'drizzle-orm';
import * as schema from '../../db/schema';

export interface AddTenantArgs {
  propertyId: string;
  unitIdOrLabel: string;
  tenantName: string;
  tenantEmail: string;
}

export class AddTenantTool {
  static async execute(
    args: AddTenantArgs,
    context: { db: any; userId: string; userRole: string }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId } = context;
    const { propertyId, unitIdOrLabel, tenantName, tenantEmail } = args;

    try {
      // Find property
      const propList = await db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.id, propertyId))
        .limit(1);

      if (propList.length === 0) {
        return { success: false, error: `Property not found.` };
      }
      const property = propList[0];

      // Find unit
      const unitList = await db
        .select()
        .from(schema.units)
        .where(
          and(
            eq(schema.units.propertyId, propertyId),
            or(
              eq(schema.units.id, unitIdOrLabel),
              eq(schema.units.label, unitIdOrLabel)
            )
          )
        )
        .limit(1);

      if (unitList.length === 0) {
        return { success: false, error: `Unit '${unitIdOrLabel}' not found in this property.` };
      }

      const unit = unitList[0];

      if (unit.status !== 'vacant') {
        return { success: false, error: `Unit '${unit.label}' is not vacant (currently ${unit.status}).` };
      }

      // Check if tenant user exists
      let tenantUser = null;
      const userList = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, tenantEmail.toLowerCase()))
        .limit(1);

      if (userList.length > 0) {
        tenantUser = userList[0];
      } else {
        // Create new tenant user
        const newUserId = 'usr-' + Math.random().toString(36).substring(2, 9);
        await db.insert(schema.users).values({
          id: newUserId,
          email: tenantEmail.toLowerCase(),
          name: tenantName,
          role: 'tenant',
        });
        tenantUser = { id: newUserId, email: tenantEmail.toLowerCase(), name: tenantName };
      }

      // Update unit
      await db.update(schema.units).set({
        status: 'occupied',
        tenantId: tenantUser.id,
      }).where(eq(schema.units.id, unit.id));

      // Generate Move-in Invoices
      const generatedInvoices: any[] = [];
      const dueDate = new Date(); // Due immediately for move-in

      const createInvoice = async (type: string, amount: number, desc: string) => {
        if (amount <= 0) return null;
        const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
        const invNum = `INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        await db.insert(schema.invoices).values({
          id: invId,
          invoiceNumber: invNum,
          type,
          tenantId: tenantUser.id,
          tenantEmail: tenantUser.email,
          tenantName: tenantUser.name,
          unitId: unit.id,
          propertyId,
          ownerId: userId,
          amount,
          amountPaid: 0,
          description: desc,
          status: 'unpaid',
          dueDate,
        });
        generatedInvoices.push({ id: invId, type, amount, description: desc });
      };

      // 1. Security Deposit
      if (Number(unit.deposit) > 0) {
        await createInvoice('Deposit', Number(unit.deposit), 'Security Deposit');
      }

      // 2. Rent
      if (Number(unit.rent) > 0) {
        await createInvoice('Rent', Number(unit.rent), 'First Month Rent');
      }

      // 3. Move-in Fees
      if (Number(unit.moveInFees) > 0) {
        await createInvoice('Fee', Number(unit.moveInFees), 'Move-in Fees');
      }

      // 4. First Month Recurring Fees
      if (Number(unit.recurringFees) > 0) {
        await createInvoice('Fee', Number(unit.recurringFees), 'First Month Recurring Fees');
      }

      // Add audit log
      await db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: userId,
        actorName: 'Sophia AI',
        actorEmail: 'sophia@landlord.nl',
        actorInitials: 'SA',
        categoryIconName: 'Users',
        categoryLabel: 'Tenants',
        description: `Sophia added tenant ${tenantName} to unit ${unit.label} at ${property.name}.`,
        severity: 'info',
        status: 'success',
        ip: '127.0.0.1',
        location: 'Sophia AI Workspace',
      });

      return {
        success: true,
        message: `Successfully added tenant ${tenantName} to unit ${unit.label}.`,
        tenant: {
          id: tenantUser.id,
          name: tenantUser.name,
          email: tenantUser.email,
        },
        unit: {
          id: unit.id,
          label: unit.label,
        },
        invoices: generatedInvoices,
      };

    } catch (err: any) {
      return {
        success: false,
        error: `Failed to add tenant: ${err.message}`,
      };
    }
  }
}
