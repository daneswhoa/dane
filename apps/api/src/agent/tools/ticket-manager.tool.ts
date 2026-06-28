import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../../db/schema';

export interface ManageTicketsArgs {
  action: 'fetch' | 'create' | 'update_status' | 'close_and_rate';
  status?: string;
  urgency?: string;
  propertyId?: string;
  title?: string;
  description?: string;
  category?: string;
  unitId?: string;
  ticketId?: string;
  newStatus?: string;
  rating?: number;
  ratingComment?: string;
}

export class TicketManagerTool {
  static async execute(
    args: ManageTicketsArgs,
    context: { db: any; userId: string; userRole: string }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId } = context;
    const { action } = args;

    try {
      if (action === 'fetch') {
        const conditions = [eq(schema.tickets.ownerId, userId)];
        if (args.status) conditions.push(eq(schema.tickets.status, args.status));
        if (args.urgency) conditions.push(eq(schema.tickets.urgency, args.urgency));
        if (args.propertyId) conditions.push(eq(schema.tickets.propertyId, args.propertyId));

        const list = await db
          .select()
          .from(schema.tickets)
          .where(and(...conditions))
          .orderBy(desc(schema.tickets.createdAt))
          .limit(20);

        return { success: true, tickets: list, message: `Found ${list.length} tickets.` };
      }

      if (action === 'create') {
        if (!args.description || !args.urgency || !args.propertyId) {
          return { success: false, error: 'description, urgency, and propertyId are required for creation.' };
        }
        
        let tenantId = null;
        let tenantEmail = null;
        
        if (args.unitId) {
          const unitList = await db.select().from(schema.units).where(eq(schema.units.id, args.unitId)).limit(1);
          if (unitList.length > 0 && unitList[0].tenantId) {
            tenantId = unitList[0].tenantId;
            const userList = await db.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
            if (userList.length > 0) tenantEmail = userList[0].email;
          }
        }

        const id = 'tkt-' + Math.random().toString(36).substring(2, 9);
        await db.insert(schema.tickets).values({
          id,
          ownerId: userId,
          title: args.title || 'Maintenance Request',
          description: args.description,
          urgency: args.urgency,
          category: args.category || 'General',
          status: 'open',
          propertyId: args.propertyId,
          unitId: args.unitId,
          tenantId,
          tenantEmail,
        });

        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Tool',
          categoryLabel: 'Maintenance',
          description: `Sophia created a new ${args.urgency} ticket: ${args.title || 'Maintenance Request'}.`,
          severity: args.urgency === 'emergency' ? 'high' : 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        const newTicket = await db.select().from(schema.tickets).where(eq(schema.tickets.id, id)).limit(1);
        return { success: true, message: `Ticket ${id} created successfully.`, ticket: newTicket[0] };
      }

      if (action === 'update_status') {
        if (!args.ticketId || !args.newStatus) return { success: false, error: 'ticketId and newStatus required.' };
        
        await db.update(schema.tickets).set({ status: args.newStatus }).where(eq(schema.tickets.id, args.ticketId));
        return { success: true, message: `Ticket ${args.ticketId} status updated to ${args.newStatus}.` };
      }

      if (action === 'close_and_rate') {
        if (!args.ticketId || !args.rating) return { success: false, error: 'ticketId and rating required.' };

        await db.update(schema.tickets).set({
          status: 'closed',
          rating: args.rating,
          ratingComment: args.ratingComment,
        }).where(eq(schema.tickets.id, args.ticketId));
        
        // Audit
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Tool',
          categoryLabel: 'Maintenance',
          description: `Sophia closed ticket ${args.ticketId} and left a ${args.rating}-star rating.`,
          severity: 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        return { success: true, message: `Ticket ${args.ticketId} closed successfully with a rating.` };
      }

      return { success: false, error: 'Unknown action.' };
    } catch (err: any) {
      return { success: false, error: `Ticket action failed: ${err.message}` };
    }
  }
}
