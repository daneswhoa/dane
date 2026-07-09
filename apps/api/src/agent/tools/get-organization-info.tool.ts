import { eq, and } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { getToolPermissionError } from './permissions';
import { randomUUID } from 'crypto';

export class GetOrganizationInfoTool {
  static async execute(
    args: {},
    context: { db: any; userId: string; userRole: string; user?: any }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId, user } = context;

    // Check permissions
    if (user) {
      const permError = getToolPermissionError(user, 'Organization', 'View Team');
      if (permError) return { success: false, error: permError };
    }

    try {
      // Get calling user to resolve organizationId
      const userExist = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      if (userExist.length === 0) {
        return { success: false, error: 'Caller user profile not found.' };
      }

      let orgId = userExist[0].organizationId;
      const orgName = userExist[0].organizationName;

      // Self-healing: if orgId is not set, but orgName is set, resolve or create the organization record
      if (!orgId && orgName) {
        let orgRecord = await db.select().from(schema.organizations).where(eq(schema.organizations.name, orgName)).limit(1);
        if (orgRecord.length === 0) {
          const newOrgId = randomUUID();
          await db.insert(schema.organizations).values({
            id: newOrgId,
            name: orgName,
          });
          orgId = newOrgId;
        } else {
          orgId = orgRecord[0].id;
        }
        // Update user to link organizationId
        await db.update(schema.users).set({ organizationId: orgId }).where(eq(schema.users.id, userId));
      }

      if (!orgId) {
        return { success: false, error: 'Caller is not currently associated with an organization.' };
      }

      // Fetch organization record
      const orgList = await db.select().from(schema.organizations).where(eq(schema.organizations.id, orgId)).limit(1);
      if (orgList.length === 0) {
        return { success: false, error: 'Organization record not found.' };
      }
      const org = orgList[0];

      // Fetch members
      const members = await db.select().from(schema.users).where(eq(schema.users.organizationId, orgId));

      // Fetch pending invitations
      const invites = await db.select().from(schema.invitations).where(
        and(
          eq(schema.invitations.organizationId, orgId),
          eq(schema.invitations.used, false)
        )
      );

      // Find organization owner: manager/landlord/owner with empty custom permissions
      let owner = members.find((m: any) => {
        const isManagerRole = m.role === 'owner' || m.role === 'landlord' || m.role === 'manager';
        if (!isManagerRole) return false;

        let isPermEmpty = true;
        if (m.permissions) {
          try {
            const parsed = typeof m.permissions === 'string' ? JSON.parse(m.permissions) : m.permissions;
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              isPermEmpty = false;
            }
          } catch (e) {}
        }
        return isPermEmpty;
      }) || null;

      if (!owner) {
        owner = members.find((m: any) => m.role === 'owner' || m.role === 'landlord' || m.role === 'manager') || null;
      }

      // Format members
      const formattedMembers = members.map((m: any) => {
        let permissionsParsed = {};
        if (m.permissions) {
          try {
            permissionsParsed = typeof m.permissions === 'string' ? JSON.parse(m.permissions) : m.permissions;
          } catch (e) {
            permissionsParsed = { raw: m.permissions };
          }
        }
        return {
          id: m.id,
          name: m.name || 'N/A',
          email: m.email,
          role: m.role,
          permissions: permissionsParsed,
          joinedAt: m.createdAt,
        };
      });

      // Format invites
      const formattedInvites = invites.map((i: any) => ({
        id: i.id,
        email: i.email,
        roleOffered: i.targetRole,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      }));

      return {
        success: true,
        organization: {
          id: org.id,
          name: org.name,
          createdAt: org.createdAt,
          owner: owner ? { name: owner.name, email: owner.email } : null,
          members: formattedMembers,
          pendingInvites: formattedInvites,
        }
      };

    } catch (err: any) {
      return {
        success: false,
        error: `Failed to retrieve organization info: ${err.message}`,
      };
    }
  }
}
