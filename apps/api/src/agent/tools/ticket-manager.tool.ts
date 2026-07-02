import { eq, and, desc, inArray } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { checkToolPermission } from './permissions';

export interface ManageTicketsArgs {
  action: 'fetch' | 'create' | 'update_status' | 'close_and_rate' | 'reject';
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
  message?: string; // For rejection message
}

export class TicketManagerTool {
  static async execute(
    args: ManageTicketsArgs,
    context: { db: any; userId: string; userRole: string; user?: any }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId, user } = context;

    // Check permissions if manager/landlord
    if (user && (user.role === 'manager' || user.role === 'landlord')) {
      if (!checkToolPermission(user, 'Maintenance', 'View Tickets')) {
        return { success: false, error: 'Access Denied: You do not have permission to view or manage maintenance tickets.' };
      }
    }

    const { action } = args;

    try {
      const userExist = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      const orgName = userExist[0]?.organizationName || null;

      if (action === 'fetch') {
        const conditions = [
          orgName
            ? eq(schema.tickets.organizationName, orgName)
            : eq(schema.tickets.ownerId, userId)
        ];
        if (args.status) conditions.push(eq(schema.tickets.status, args.status));
        if (args.urgency) conditions.push(eq(schema.tickets.urgency, args.urgency));
        if (args.propertyId) conditions.push(eq(schema.tickets.propertyId, args.propertyId));

        const list = await db
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
          .leftJoin(schema.units, eq(schema.tickets.unitId, schema.units.id))
          .where(and(...conditions))
          .orderBy(desc(schema.tickets.createdAt))
          .limit(20);

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

        const enrichedList = list.map((item: any) => ({
          ...item,
          tenantName: item.tenantId ? (usersMap[item.tenantId] || 'Resident') : 'N/A',
          contractorName: item.contractorId ? (usersMap[item.contractorId] || 'Contractor') : null,
        }));

        return { success: true, tickets: enrichedList, message: `Found ${enrichedList.length} tickets.` };
      }

      if (action === 'create') {
        let propertyId = args.propertyId;
        let unitId = args.unitId;
        let tenantId = null;
        let tenantEmail = null;

        // Auto-detect propertyId and unitId if caller is a tenant
        if (context.userRole === 'tenant' && context.userId) {
          const unitList = await db.select().from(schema.units).where(eq(schema.units.tenantId, context.userId)).limit(1);
          if (unitList.length > 0) {
            propertyId = unitList[0].propertyId;
            unitId = unitList[0].id;
            tenantId = context.userId;
          }
        }

        // Fallback for general lookup if propertyId is missing
        if (!propertyId && context.userId) {
          const unitList = await db.select().from(schema.units).where(eq(schema.units.tenantId, context.userId)).limit(1);
          if (unitList.length > 0) {
            propertyId = unitList[0].propertyId;
            unitId = unitList[0].id;
          }
        }

        if (!args.description || !args.urgency || !propertyId) {
          return { success: false, error: 'description, urgency, and propertyId are required for creation.' };
        }
        
        // Find correct landlord (ownerId) from property
        let ownerId = userId; // Default fallback
        const propList = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
        if (propList.length > 0 && propList[0].ownerId) {
          ownerId = propList[0].ownerId;
        }

        if (unitId && !tenantId) {
          const unitList = await db.select().from(schema.units).where(eq(schema.units.id, unitId)).limit(1);
          if (unitList.length > 0 && unitList[0].tenantId) {
            tenantId = unitList[0].tenantId;
          }
        }

        if (tenantId) {
          const userList = await db.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
          if (userList.length > 0) tenantEmail = userList[0].email;
        }

        const id = 'tkt-' + Math.random().toString(36).substring(2, 9);
        await db.insert(schema.tickets).values({
          id,
          ownerId: ownerId,
          organizationName: orgName,
          title: args.title || 'Maintenance Request',
          description: args.description,
          urgency: args.urgency,
          category: args.category || 'General',
          status: 'open',
          propertyId: propertyId,
          unitId: unitId,
          tenantId,
          tenantEmail,
        });

        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: ownerId,
          organizationName: orgName,
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
        
        const tList = await db.select().from(schema.tickets).where(eq(schema.tickets.id, args.ticketId)).limit(1);
        if (tList.length === 0) return { success: false, error: 'Ticket not found.' };
        const ticket = tList[0];

        if (ticket.organizationName !== orgName) {
          return { success: false, error: 'Access denied.' };
        }

        if (args.newStatus === 'assigned') {
          if (!ticket.contractorId) {
            return { success: false, error: 'Cannot set ticket status to assigned directly without a contractor. Please assign a contractor first using the DispatchEngineTool.' };
          }
        }

        await db.update(schema.tickets).set({ status: args.newStatus }).where(eq(schema.tickets.id, args.ticketId));
        return { success: true, message: `Ticket ${args.ticketId} status updated to ${args.newStatus}.` };
      }

      if (action === 'close_and_rate') {
        if (!args.ticketId || !args.rating) return { success: false, error: 'ticketId and rating required.' };

        const tList = await db.select().from(schema.tickets).where(eq(schema.tickets.id, args.ticketId)).limit(1);
        if (tList.length === 0) return { success: false, error: 'Ticket not found.' };
        if (tList[0].organizationName !== orgName) return { success: false, error: 'Access denied.' };

        await db.update(schema.tickets).set({
          status: 'closed',
          rating: args.rating,
          ratingComment: args.ratingComment,
        }).where(eq(schema.tickets.id, args.ticketId));
        
        // Audit
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          organizationName: orgName,
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

      if (action === 'reject') {
        if (!args.ticketId || !args.message) {
          return { success: false, error: 'ticketId and message are required for rejection.' };
        }

        const tList = await db.select().from(schema.tickets).where(eq(schema.tickets.id, args.ticketId)).limit(1);
        if (tList.length === 0) return { success: false, error: 'Ticket not found.' };
        const ticket = tList[0];

        if (ticket.organizationName !== orgName) {
          return { success: false, error: 'Access denied.' };
        }

        await db.update(schema.tickets).set({ status: 'rejected' }).where(eq(schema.tickets.id, args.ticketId));

        if (ticket.tenantId) {
          await db.insert(schema.notifications).values({
            id: 'notif-' + Math.random().toString(36).substring(2, 9),
            userId: ticket.tenantId,
            title: 'Maintenance Request Rejected',
            message: args.message,
            link: `/portal/maintenance/${args.ticketId}`,
          });
        }

        // Audit
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          organizationName: orgName,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Tool',
          categoryLabel: 'Maintenance',
          description: `Sophia rejected maintenance ticket ${args.ticketId}: "${args.message}"`,
          severity: 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        return { success: true, message: `Ticket ${args.ticketId} successfully rejected and tenant was notified.` };
      }

      return { success: false, error: 'Unknown action.' };
    } catch (err: any) {
      return { success: false, error: `Ticket action failed: ${err.message}` };
    }
  }
}
