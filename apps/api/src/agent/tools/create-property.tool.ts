import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { checkToolPermission } from './permissions';

export interface CreatePropertyArgs {
  name: string;
  type: 'house' | 'apartment';
  address?: string;
  unitsCount?: number;
  photoUrl?: string;
}

export class CreatePropertyTool {
  static async execute(
    args: CreatePropertyArgs,
    context: { db: any; userId: string; userRole: string; user?: any }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId, user } = context;

    // Check permissions
    if (user && !checkToolPermission(user, 'Properties', 'List New')) {
      return { success: false, error: 'Access Denied: You do not have permission to list new properties.' };
    }

    const name = args.name;
    const address = args.address || 'Address not specified';
    const unitsCount = args.unitsCount || 1;
    const photoUrl = args.photoUrl || null;

    if (!name) {
      return { success: false, error: 'Property name is required.' };
    }

    try {
      const userExist = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      const orgName = userExist[0]?.organizationName || null;

      const propertyId = 'prop-' + Math.random().toString(36).substring(2, 9);
      await db.insert(schema.properties).values({
        id: propertyId,
        name,
        address,
        ownerId: userId,
        organizationName: orgName,
        unitsCount,
        status: 'pending',
        photoUrl,
      });

      // Insert audit log
      await db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: userId,
        organizationName: orgName,
        actorName: 'Sophia AI',
        actorEmail: 'sophia@landlord.nl',
        actorInitials: 'SA',
        categoryIconName: 'Building2',
        categoryLabel: 'Properties',
        description: `Sophia added pending property "${name}" at ${address}.`,
        severity: 'info',
        status: 'success',
        ip: '127.0.0.1',
        location: 'Sophia AI Workspace',
      });

      return {
        success: true,
        message: `Successfully created property "${name}".`,
        propertyId,
        name,
        address,
        unitsCount,
        photoUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Database error: ${err.message}`,
      };
    }
  }
}
