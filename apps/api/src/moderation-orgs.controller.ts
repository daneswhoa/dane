import { Controller, Get, Post, Body, Req, UseGuards, Inject, Query, Param, NotFoundException, Delete } from '@nestjs/common';
import { eq, desc, and, or, ilike, sql, ne } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { UpstashRedisService } from './redis/redis.service';

@Controller('dashboard/security')
@UseGuards(SessionGuard)
export class ModerationOrgsController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly redisService: UpstashRedisService,
  ) {}

  @Get('organizations')
  async getOrganizations(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
    @Query('tier') tier?: string,
    @Query('status') status?: string
  ) {
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);
    const offset = (page - 1) * limit;
    const db = this.db;

    // Load all organizations from the master organizations table
    const allOrgsList = await db
      .select()
      .from(schema.organizations);

    const orgs = [];
    const redis = this.redisService.getClient();

    for (const org of allOrgsList) {
      const orgId = org.id;
      const orgName = org.name;

      const foundedDate = org.createdAt
        ? new Date(org.createdAt).toISOString().split('T')[0]
        : '2024-01-01';

      const propCountRes = await db
        .select({ count: sql<number>`count(*)::integer` })
        .from(schema.properties)
        .where(eq(schema.properties.organizationId, orgId));
      const propertiesCount = propCountRes[0]?.count || 0;

      const memberCountRes = await db
        .select({ count: sql<number>`count(*)::integer` })
        .from(schema.users)
        .where(eq(schema.users.organizationId, orgId));
      const membersCount = memberCountRes[0]?.count || 0;

      const warningsCountRes = await db
        .select({ count: sql<number>`count(*)::integer` })
        .from(schema.auditLogs)
        .where(and(
          eq(schema.auditLogs.organizationId, orgId),
          sql`${schema.auditLogs.severity} IN ('warning', 'critical')`
        ));
      const warningsCount = warningsCountRes[0]?.count || 0;

      const billingTier = propertiesCount > 10 ? 'Enterprise Premium Plan' : 'Growth Scale Plan';

      let verification: 'Verified' | 'Suspended' = 'Verified';
      if (redis) {
        const isSuspended = await redis.get('org:suspended:' + orgId);
        const isSuspendedByName = await redis.get('org:suspended:' + orgName);
        if (isSuspended === 'true' || isSuspendedByName === 'true') {
          verification = 'Suspended';
        }
      }

      if (search) {
        const searchLower = search.toLowerCase();
        if (!orgName.toLowerCase().includes(searchLower) && !orgId.toLowerCase().includes(searchLower)) {
          continue;
        }
      }

      if (tier && tier !== 'All') {
        if (tier === 'Enterprise' && billingTier !== 'Enterprise Premium Plan') continue;
        if (tier === 'Growth' && billingTier !== 'Growth Scale Plan') continue;
      }

      if (status && status !== 'All') {
        if (status === 'Active' && verification !== 'Verified') continue;
        if (status === 'Suspended' && verification !== 'Suspended') continue;
      }

      orgs.push({
        id: orgId,
        name: orgName,
        logo: orgName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'OG',
        billingTier,
        paymentStatus: verification === 'Suspended' ? 'Subscription Suspended' : 'Paid (Current)',
        warningsCount,
        foundedDate,
        businessLicense: 'LIC-' + (orgName.length * 12) + '09',
        taxId: 'TX-' + (orgName.length * 31) + '-88',
        hqAddress: 'Metropolitan Area',
        verification,
        propertiesCount,
        membersCount
      });
    }

    const total = orgs.length;
    const paginatedOrgs = orgs.slice(offset, offset + limit);

    const totalPropertiesRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.properties);
    
    const pendingInvitesRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.invitations)
      .where(and(
        eq(schema.invitations.used, false),
        sql`${schema.invitations.expiresAt} > NOW()`
      ));

    let suspendedOrgsCount = 0;
    if (redis) {
      for (const org of allOrgsList) {
        const isSuspended = await redis.get('org:suspended:' + org.id);
        const isSuspendedByName = await redis.get('org:suspended:' + org.name);
        if (isSuspended === 'true' || isSuspendedByName === 'true') {
          suspendedOrgsCount++;
        }
      }
    }

    const stats = {
      totalOrgs: allOrgsList.length,
      totalProperties: totalPropertiesRes[0]?.count || 0,
      totalPendingInvites: pendingInvitesRes[0]?.count || 0,
      suspendedCount: suspendedOrgsCount
    };

    return {
      organizations: paginatedOrgs,
      total,
      stats
    };
  }

  @Get('organizations/:name')
  async getOrganizationDetail(@Param('name') name: string) {
    const db = this.db;
    
    // Resolve organization by ID or Name
    const orgList = await db
      .select()
      .from(schema.organizations)
      .where(or(
        eq(schema.organizations.id, name),
        eq(schema.organizations.name, name)
      ))
      .limit(1);

    if (orgList.length === 0) {
      throw new NotFoundException('Organization not found.');
    }

    const org = orgList[0];
    const orgId = org.id;
    const orgName = org.name;

    const orgProperties = await db
      .select({
        id: schema.properties.id,
        name: schema.properties.name,
        address: schema.properties.address,
        unitsCount: schema.properties.unitsCount
      })
      .from(schema.properties)
      .where(eq(schema.properties.organizationId, orgId));
    
    const formattedProperties = [];
    for (const prop of orgProperties) {
      const occupiedRes = await db
        .select({ count: sql<number>`count(*)::integer` })
        .from(schema.units)
        .where(and(
          eq(schema.units.propertyId, prop.id),
          sql`${schema.units.tenantId} IS NOT NULL`
        ));
      
      const ticketsRes = await db
        .select({ count: sql<number>`count(*)::integer` })
        .from(schema.tickets)
        .where(and(
          eq(schema.tickets.propertyId, prop.id),
          ne(schema.tickets.status, 'completed')
        ));
      
      const revenueRes = await db
        .select({ sum: sql<number>`COALESCE(sum(${schema.invoices.amountPaid}), 0)::integer` })
        .from(schema.invoices)
        .where(and(
          eq(schema.invoices.propertyId, prop.id),
          eq(schema.invoices.status, 'paid')
        ));
      
      formattedProperties.push({
        name: prop.name,
        address: prop.address,
        units: prop.unitsCount || 0,
        occupied: occupiedRes[0]?.count || 0,
        maintenanceTickets: ticketsRes[0]?.count || 0,
        grossRevenue: revenueRes[0]?.sum || 0
      });
    }

    const orgMembers = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
        permissions: schema.users.permissions
      })
      .from(schema.users)
      .where(eq(schema.users.organizationId, orgId));
    
    const formattedMembers = orgMembers.map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role === 'owner' ? 'Owner' : (m.role === 'manager' ? 'Admin' : 'Member'),
      joinedDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A',
      permissions: m.permissions || {
        manageProperties: true,
        syndicateListings: true,
        viewBilling: true,
        inviteStaff: true,
        modifyBankAccounts: m.role === 'owner',
        editApiKeys: m.role === 'owner'
      }
    }));

    const pendingInv = await db
      .select({
        email: schema.invitations.email,
        targetRole: schema.invitations.targetRole,
        createdAt: schema.invitations.createdAt,
        expiresAt: schema.invitations.expiresAt,
        ownerId: schema.invitations.ownerId
      })
      .from(schema.invitations)
      .where(and(
        eq(schema.invitations.organizationId, orgId),
        eq(schema.invitations.used, false),
        sql`${schema.invitations.expiresAt} > NOW()`
      ));
    
    const formattedInvites = pendingInv.map((inv: any) => ({
      email: inv.email || 'N/A',
      roleOffered: inv.targetRole || 'Member',
      dateSent: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A',
      dateExpiring: inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : 'N/A',
      referrer: 'System Referral',
      status: 'Pending' as const
    }));

    let verification = 'Verified';
    try {
      const redis = this.redisService.getClient();
      if (redis) {
        const isSuspended = await redis.get('org:suspended:' + orgId);
        const isSuspendedByName = await redis.get('org:suspended:' + orgName);
        if (isSuspended === 'true' || isSuspendedByName === 'true') {
          verification = 'Suspended';
        }
      }
    } catch (e) {
      console.error(e);
    }

    const billingTier = formattedProperties.length > 10 ? 'Enterprise Premium Plan' : 'Growth Scale Plan';

    return {
      id: orgId,
      name: orgName,
      logo: orgName.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() || 'OG',
      billingTier,
      paymentStatus: verification === 'Suspended' ? 'Subscription Suspended' : 'Paid (Current)',
      warningsCount: 0,
      foundedDate: '2024-01-01',
      businessLicense: 'LIC-' + (orgName.length * 12) + '09',
      taxId: 'TX-' + (orgName.length * 31) + '-88',
      hqAddress: formattedProperties[0]?.address || 'Metropolitan Area',
      verification,
      properties: formattedProperties,
      members: formattedMembers,
      pastMembers: [],
      pendingInvites: formattedInvites
    };
  }

  @Post('organizations/:name/suspend')
  async suspendOrganization(@Param('name') name: string) {
    const db = this.db;

    // Resolve organization by ID or Name
    const orgList = await db
      .select()
      .from(schema.organizations)
      .where(or(
        eq(schema.organizations.id, name),
        eq(schema.organizations.name, name)
      ))
      .limit(1);

    if (orgList.length === 0) {
      throw new NotFoundException('Organization not found.');
    }

    const org = orgList[0];
    const orgId = org.id;

    const redis = this.redisService.getClient();
    if (redis) {
      await redis.set('org:suspended:' + orgId, 'true');
      await redis.set('org:suspended:' + org.name, 'true');
    }

    await db
      .update(schema.users)
      .set({ role: 'suspended_manager' })
      .where(and(
        eq(schema.users.organizationId, orgId),
        sql`${schema.users.role} IN ('manager', 'owner')`
      ));

    return { success: true };
  }

  @Delete('organizations/:name')
  async deleteOrganization(@Param('name') name: string) {
    const db = this.db;

    // Resolve organization by ID or Name
    const orgList = await db
      .select()
      .from(schema.organizations)
      .where(or(
        eq(schema.organizations.id, name),
        eq(schema.organizations.name, name)
      ))
      .limit(1);

    if (orgList.length === 0) {
      throw new NotFoundException('Organization not found.');
    }

    const org = orgList[0];
    const orgId = org.id;

    const redis = this.redisService.getClient();
    if (redis) {
      await redis.del('org:suspended:' + orgId);
      await redis.del('org:suspended:' + org.name);
    }

    await db
      .delete(schema.properties)
      .where(eq(schema.properties.organizationId, orgId));
    
    await db
      .delete(schema.users)
      .where(eq(schema.users.organizationId, orgId));

    await db
      .delete(schema.organizations)
      .where(eq(schema.organizations.id, orgId));

    return { success: true };
  }
}
