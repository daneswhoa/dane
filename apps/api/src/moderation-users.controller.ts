import { Controller, Get, Post, Body, Req, UseGuards, Inject, Query, Param, NotFoundException, BadRequestException, Delete } from '@nestjs/common';
import { eq, desc, and, or, ilike, sql, ne } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { CreditLedgerService } from './agent/credit-ledger.service';

@Controller('dashboard/security')
@UseGuards(SessionGuard)
export class ModerationUsersController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly creditLedgerService: CreditLedgerService,
  ) {}

  // --- Managers ---

  @Get('managers')
  async getManagers(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string
  ) {
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);
    const offset = (page - 1) * limit;
    const db = this.db;

    // Subquery to count properties per user
    const propertiesCountSub = db
      .select({
        ownerId: schema.properties.ownerId,
        count: sql<number>`count(*)::integer`.as('properties_count')
      })
      .from(schema.properties)
      .groupBy(schema.properties.ownerId)
      .as('p_count');

    // Subquery to sum units count per user
    const unitsCountSub = db
      .select({
        ownerId: schema.properties.ownerId,
        count: sql<number>`sum(${schema.properties.unitsCount})::integer`.as('units_count')
      })
      .from(schema.properties)
      .groupBy(schema.properties.ownerId)
      .as('u_count');

    // Subquery to count active listings per user
    const listingsCountSub = db
      .select({
        ownerId: schema.properties.ownerId,
        count: sql<number>`count(*)::integer`.as('listings_count')
      })
      .from(schema.units)
      .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
      .where(eq(schema.units.isListed, true))
      .groupBy(schema.properties.ownerId)
      .as('l_count');

    let conditions = [sql`${schema.users.role} IN ('landlord', 'manager', 'suspended', 'suspended_manager')`];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.users.email, searchPattern) as any,
          ilike(schema.users.name, searchPattern) as any
        ) as any
      );
    }

    const whereClause = and(...conditions);

    // Total Count
    const totalCountRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(whereClause);
    const total = totalCountRes[0]?.count || 0;

    // Sorting Logic
    let orderByClause: any = desc(schema.users.createdAt);
    if (sort === 'properties_desc') {
      orderByClause = desc(sql`COALESCE(${propertiesCountSub.count}, 0)`);
    } else if (sort === 'properties_asc') {
      orderByClause = sql`COALESCE(${propertiesCountSub.count}, 0) ASC`;
    } else if (sort === 'units_desc') {
      orderByClause = desc(sql`COALESCE(${unitsCountSub.count}, 0)`);
    } else if (sort === 'units_asc') {
      orderByClause = sql`COALESCE(${unitsCountSub.count}, 0) ASC`;
    } else if (sort === 'recent_asc') {
      orderByClause = schema.users.createdAt;
    } else if (sort === 'recent_desc') {
      orderByClause = desc(schema.users.createdAt);
    }

    const managers = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
        organizationId: schema.users.organizationId,
        organizationName: schema.users.organizationName,
        createdAt: schema.users.createdAt,
        propertiesCount: sql<number>`COALESCE(${propertiesCountSub.count}, 0)`,
        unitsCount: sql<number>`COALESCE(${unitsCountSub.count}, 0)`,
        activeListingsCount: sql<number>`COALESCE(${listingsCountSub.count}, 0)`
      })
      .from(schema.users)
      .leftJoin(propertiesCountSub, eq(schema.users.id, propertiesCountSub.ownerId))
      .leftJoin(unitsCountSub, eq(schema.users.id, unitsCountSub.ownerId))
      .leftJoin(listingsCountSub, eq(schema.users.id, listingsCountSub.ownerId))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Global stats across all managers
    const totalManagersRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('landlord', 'manager', 'suspended', 'suspended_manager')`);
    
    const activeManagersRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('landlord', 'manager')`);

    const suspendedManagersRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('suspended', 'suspended_manager')`);

    const totalPropertiesRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.properties);

    const stats = {
      totalManagers: totalManagersRes[0]?.count || 0,
      activeCount: activeManagersRes[0]?.count || 0,
      suspendedCount: suspendedManagersRes[0]?.count || 0,
      totalProperties: totalPropertiesRes[0]?.count || 0,
    };

    return {
      managers,
      total,
      page,
      limit,
      stats
    };
  }

  @Get('managers/:id')
  async getManagerDetail(@Param('id') id: string) {
    const db = this.db;

    const userRes = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    const user = userRes[0];
    if (!user) {
      throw new NotFoundException('Manager profile not found');
    }

    const propertiesList = await db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.ownerId, id));

    const activeListings = await db
      .select({
        id: schema.units.id,
        label: schema.units.label,
        rent: schema.units.rent,
        status: schema.units.status,
        unitType: schema.units.unitType,
        propertyName: schema.properties.name,
        propertyId: schema.properties.id
      })
      .from(schema.units)
      .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
      .where(and(
        eq(schema.properties.ownerId, id),
        eq(schema.units.isListed, true)
      ));

    return {
      user,
      properties: propertiesList,
      activeListings
    };
  }

  @Post('managers/:id/suspend')
  async suspendManager(@Param('id') id: string, @Body() body: { reason?: string }) {
    const db = this.db;
    await db
      .update(schema.users)
      .set({ role: 'suspended_manager' })
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  @Delete('managers/:id')
  async deleteManager(@Param('id') id: string) {
    const db = this.db;
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  // --- Tenants ---

  @Get('tenants')
  async getTenants(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string
  ) {
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);
    const offset = (page - 1) * limit;
    const db = this.db;

    let conditions = [sql`${schema.users.role} IN ('tenant', 'suspended_tenant')`];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.users.email, searchPattern) as any,
          ilike(schema.users.name, searchPattern) as any,
          ilike(schema.properties.name, searchPattern) as any
        ) as any
      );
    }

    const whereClause = and(...conditions);

    // Total Count
    const totalCountRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .leftJoin(schema.leases, eq(schema.leases.tenantId, schema.users.id))
      .leftJoin(schema.properties, eq(schema.properties.id, schema.leases.propertyId))
      .where(whereClause);
    const total = totalCountRes[0]?.count || 0;

    // Sorting Logic
    let orderByClause: any = desc(schema.users.createdAt);
    if (sort === 'recent_asc') {
      orderByClause = schema.users.createdAt;
    } else if (sort === 'recent_desc') {
      orderByClause = desc(schema.users.createdAt);
    } else if (sort === 'rent_desc') {
      orderByClause = desc(sql`COALESCE(${schema.units.rent}, 0)`);
    } else if (sort === 'rent_asc') {
      orderByClause = sql`COALESCE(${schema.units.rent}, 0) ASC`;
    }

    const tenants = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
        createdAt: schema.users.createdAt,
        role: schema.users.role,
        propertyName: schema.properties.name,
        unitLabel: schema.units.label,
        rent: schema.units.rent,
        lastSeen: schema.users.updatedAt
      })
      .from(schema.users)
      .leftJoin(schema.leases, eq(schema.leases.tenantId, schema.users.id))
      .leftJoin(schema.properties, eq(schema.properties.id, schema.leases.propertyId))
      .leftJoin(schema.units, eq(schema.units.id, schema.leases.unitId))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Global stats across all tenants
    const totalTenantsRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('tenant', 'suspended_tenant')`);
    
    const activeTenantsRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(eq(schema.users.role, 'tenant'));

    const suspendedTenantsRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(eq(schema.users.role, 'suspended_tenant'));

    const stats = {
      totalTenants: totalTenantsRes[0]?.count || 0,
      activeSessions: activeTenantsRes[0]?.count || 0,
      restrictedCount: suspendedTenantsRes[0]?.count || 0,
      warningsIssued: 4
    };

    return {
      tenants,
      total,
      page,
      limit,
      stats
    };
  }

  @Get('tenants/:id')
  async getTenantDetail(@Param('id') id: string) {
    const db = this.db;

    const userRes = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    const user = userRes[0];
    if (!user) {
      throw new NotFoundException('Tenant profile not found');
    }

    const leasesList = await db
      .select({
        propertyName: schema.properties.name,
        unitLabel: schema.units.label,
        startDate: schema.leases.startDate,
        endDate: schema.leases.endDate,
        status: schema.leases.status
      })
      .from(schema.leases)
      .leftJoin(schema.properties, eq(schema.properties.id, schema.leases.propertyId))
      .leftJoin(schema.units, eq(schema.units.id, schema.leases.unitId))
      .where(eq(schema.leases.tenantId, id));

    const invoicesList = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.tenantId, id))
      .orderBy(desc(schema.invoices.createdAt));

    const maintenanceTickets = await db
      .select()
      .from(schema.tickets)
      .where(eq(schema.tickets.tenantId, id))
      .orderBy(desc(schema.tickets.createdAt));

    return {
      user,
      leases: leasesList,
      invoices: invoicesList,
      maintenance: maintenanceTickets
    };
  }

  @Post('tenants/:id/suspend')
  async suspendTenant(@Param('id') id: string, @Body() body: { reason?: string }) {
    const db = this.db;
    await db
      .update(schema.users)
      .set({ role: 'suspended_tenant' })
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  @Delete('tenants/:id')
  async deleteTenant(@Param('id') id: string) {
    const db = this.db;
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  // --- Contractors ---

  @Get('contractors')
  async getContractors(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
    @Query('specialty') specialty?: string,
    @Query('status') status?: string
  ) {
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);
    const offset = (page - 1) * limit;
    const db = this.db;

    let conditions = [sql`${schema.users.role} IN ('contractor', 'suspended_contractor')`];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.users.email, searchPattern) as any,
          ilike(schema.users.name, searchPattern) as any,
          ilike(schema.contractors.specialty, searchPattern) as any
        ) as any
      );
    }

    if (specialty && specialty !== 'All') {
      conditions.push(eq(schema.contractors.specialty, specialty));
    }

    if (status && status !== 'All') {
      const targetRole = status === 'Active' ? 'contractor' : 'suspended_contractor';
      conditions.push(eq(schema.users.role, targetRole));
    }

    const whereClause = and(...conditions);

    // Total Count
    const totalCountRes = await db
      .select({ count: sql<number>`count(distinct ${schema.users.id})::integer` })
      .from(schema.users)
      .leftJoin(schema.contractors, eq(schema.contractors.userId, schema.users.id))
      .where(whereClause);
    const total = totalCountRes[0]?.count || 0;

    const contractorsList = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
        role: schema.users.role,
        joined: schema.users.createdAt,
        lastActive: schema.users.updatedAt,
        specialty: schema.contractors.specialty,
        company: schema.contractors.bio,
        rating: sql<number>`COALESCE(avg(${schema.tickets.rating}), 4.8)`,
        completedJobs: sql<number>`SUM(CASE WHEN ${schema.tickets.status} = 'completed' THEN 1 ELSE 0 END)::integer`,
        activeJobs: sql<number>`SUM(CASE WHEN ${schema.tickets.status} != 'completed' THEN 1 ELSE 0 END)::integer`
      })
      .from(schema.users)
      .leftJoin(schema.contractors, eq(schema.contractors.userId, schema.users.id))
      .leftJoin(schema.tickets, eq(schema.tickets.contractorId, schema.users.id))
      .where(whereClause)
      .groupBy(
        schema.users.id,
        schema.users.name,
        schema.users.email,
        schema.users.phone,
        schema.users.role,
        schema.users.createdAt,
        schema.users.updatedAt,
        schema.contractors.specialty,
        schema.contractors.bio
      )
      .limit(limit)
      .offset(offset);

    // Stats
    const totalContractorsRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('contractor', 'suspended_contractor')`);
    
    const activeCountRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(eq(schema.users.role, 'contractor'));

    const suspendedCountRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(eq(schema.users.role, 'suspended_contractor'));

    const activeTicketsRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.tickets)
      .where(ne(schema.tickets.status, 'completed'));

    const stats = {
      totalContractors: totalContractorsRes[0]?.count || 0,
      activeCount: activeCountRes[0]?.count || 0,
      suspendedCount: suspendedCountRes[0]?.count || 0,
      activeDispatches: activeTicketsRes[0]?.count || 0
    };

    return {
      contractors: contractorsList,
      total,
      page,
      limit,
      stats
    };
  }

  @Get('contractors/:id')
  async getContractorDetail(@Param('id') id: string) {
    const db = this.db;

    const userRes = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    const user = userRes[0];
    if (!user) {
      throw new NotFoundException('Contractor profile not found');
    }

    const contractorDetails = await db
      .select()
      .from(schema.contractors)
      .where(eq(schema.contractors.userId, id))
      .limit(1);

    const activeTickets = await db
      .select()
      .from(schema.tickets)
      .where(and(
        eq(schema.tickets.contractorId, id),
        ne(schema.tickets.status, 'completed')
      ));

    const jobHistory = await db
      .select()
      .from(schema.tickets)
      .where(and(
        eq(schema.tickets.contractorId, id),
        eq(schema.tickets.status, 'completed')
      ));

    return {
      user,
      contractor: contractorDetails[0],
      activeTickets,
      jobHistory
    };
  }

  @Post('contractors/:id/suspend')
  async suspendContractor(@Param('id') id: string) {
    const db = this.db;
    await db
      .update(schema.users)
      .set({ role: 'suspended_contractor' })
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  @Delete('contractors/:id')
  async deleteContractor(@Param('id') id: string) {
    const db = this.db;
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  // --- Moderators ---

  @Get('moderators')
  async getModerators(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);
    const offset = (page - 1) * limit;
    const db = this.db;

    let conditions = [sql`${schema.users.role} IN ('moderator', 'admin', 'suspended_moderator')`];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(schema.users.email, searchPattern) as any,
          ilike(schema.users.name, searchPattern) as any
        ) as any
      );
    }

    if (status && status !== 'All') {
      if (status === 'Active') {
        conditions.push(sql`${schema.users.role} IN ('moderator', 'admin')`);
      } else {
        conditions.push(eq(schema.users.role, 'suspended_moderator'));
      }
    }

    const whereClause = and(...conditions);

    // Actions subquery
    const actionsSub = db
      .select({
        actorEmail: schema.auditLogs.actorEmail,
        count: sql<number>`count(*)::integer`.as('actions_count')
      })
      .from(schema.auditLogs)
      .groupBy(schema.auditLogs.actorEmail)
      .as('actions_sub');

    // Total Count
    const totalCountRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(whereClause);
    const total = totalCountRes[0]?.count || 0;

    const moderatorsList = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
        role: schema.users.role,
        joined: schema.users.createdAt,
        lastActive: schema.users.updatedAt,
        actionsTaken: sql<number>`COALESCE(${actionsSub.count}, 0)`
      })
      .from(schema.users)
      .leftJoin(actionsSub, eq(actionsSub.actorEmail, schema.users.email))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Global stats across all moderators
    const totalModeratorsRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('moderator', 'admin', 'suspended_moderator')`);
    
    const activeCountRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(sql`${schema.users.role} IN ('moderator', 'admin')`);

    const suspendedCountRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.users)
      .where(eq(schema.users.role, 'suspended_moderator'));

    const totalLogsRes = await db
      .select({ count: sql<number>`count(*)::integer` })
      .from(schema.auditLogs);

    const stats = {
      totalModerators: totalModeratorsRes[0]?.count || 0,
      activeCount: activeCountRes[0]?.count || 0,
      suspendedCount: suspendedCountRes[0]?.count || 0,
      totalLogs: totalLogsRes[0]?.count || 0
    };

    return {
      moderators: moderatorsList,
      total,
      page,
      limit,
      stats
    };
  }

  @Get('moderators/:id')
  async getModeratorDetail(@Param('id') id: string) {
    const db = this.db;

    const userRes = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    const user = userRes[0];
    if (!user) {
      throw new NotFoundException('Moderator profile not found');
    }

    const logs = await db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.actorEmail, user.email))
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(100);

    return {
      user,
      logs
    };
  }

  @Post('moderators/:id/suspend')
  async suspendModerator(@Param('id') id: string) {
    const db = this.db;
    await db
      .update(schema.users)
      .set({ role: 'suspended_moderator' })
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  @Delete('moderators/:id')
  async deleteModerator(@Param('id') id: string) {
    const db = this.db;
    await db
      .delete(schema.users)
      .where(eq(schema.users.id, id));
    return { success: true };
  }

  // --- Mod Dashboard Credit & Pricing Controls ---

  @Get('credits/reserve-info')
  async getReserveInfo(@Req() req: any) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }
    const db = this.db;
    const reserveBalance = await this.creditLedgerService.resolveBalance('RESERVE');
    const spentBalance = await this.creditLedgerService.resolveBalance('RESERVE_SPENT');

    // Fetch dynamic configs
    const configs = await db.select().from(schema.systemConfigs);
    const emailBroadcastCost = parseInt(configs.find((c: any) => c.key === 'price_email_broadcast')?.value || '2', 10);
    const sophiaChatCost = parseInt(configs.find((c: any) => c.key === 'price_sophia_chat')?.value || '1', 10);
    const sophiaToolCost = parseInt(configs.find((c: any) => c.key === 'price_sophia_tool')?.value || '5', 10);

    // Fetch Mint History (SYSTEM -> RESERVE)
    const mintHistory = await db
      .select()
      .from(schema.creditTransactions)
      .where(and(
        eq(schema.creditTransactions.senderUsername, 'SYSTEM'),
        eq(schema.creditTransactions.receiverUsername, 'RESERVE')
      ))
      .orderBy(desc(schema.creditTransactions.timestamp))
      .limit(50);

    // Fetch Recent Purchases (Users buying credits)
    const recentPurchases = await db
      .select()
      .from(schema.creditTransactions)
      .where(or(
        eq(schema.creditTransactions.transactionType, 'purchase'),
        ilike(schema.creditTransactions.description, '%Refill%')
      ))
      .orderBy(desc(schema.creditTransactions.timestamp))
      .limit(10);

    return {
      reserveBalance,
      spentBalance,
      pricing: {
        emailBroadcastCost,
        sophiaChatCost,
        sophiaToolCost
      },
      mintHistory,
      recentPurchases
    };
  }

  @Get('credits/resolve-user')
  async resolveUser(@Req() req: any, @Query('query') queryStr: string) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }
    if (!queryStr) {
      throw new BadRequestException('Query parameter is required');
    }

    const db = this.db;
    const searchPattern = `%${queryStr}%`;
    const userRes = await db
      .select()
      .from(schema.users)
      .where(or(
        eq(schema.users.username, queryStr),
        eq(schema.users.email, queryStr),
        eq(schema.users.organizationId, queryStr),
        ilike(schema.users.organizationName, searchPattern)
      ))
      .limit(5);

    const results = [];
    for (const u of userRes) {
      const balance = await this.creditLedgerService.resolveBalance(u.email);
      results.push({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        organizationId: u.organizationId,
        organizationName: u.organizationName,
        role: u.role,
        balance
      });
    }

    return results;
  }

  @Get('credits/validate-chain')
  async validateChain(@Req() req: any) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }
    const db = this.db;
    const txs = await db
      .select()
      .from(schema.creditTransactions)
      .orderBy(schema.creditTransactions.timestamp);

    let isValid = true;
    const discrepancies = [];

    for (let i = 1; i < txs.length; i++) {
      const current = txs[i];
      const previous = txs[i - 1];
      if (current.previousTxid !== previous.id) {
        isValid = false;
        discrepancies.push({
          blockId: current.id,
          expectedPrevious: previous.id,
          actualPrevious: current.previousTxid,
          timestamp: current.timestamp
        });
      }
    }

    return {
      isValid,
      totalBlocks: txs.length,
      discrepancies
    };
  }

  @Post('credits/mint')
  async mintReserveCredits(@Req() req: any, @Body() body: { amount: number, description?: string }) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    const tx = await this.creditLedgerService.mintCredits(body.amount, body.description || 'Manual moderator mint');
    return { success: true, tx };
  }

  @Post('credits/adjust')
  async adjustUserCredits(@Req() req: any, @Body() body: { username: string, amount: number, action: 'credit' | 'debit' }) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }
    if (!body.username || !body.amount || body.amount <= 0) {
      throw new BadRequestException('Username and valid positive amount are required');
    }

    const db = this.db;
    const searchPattern = `%${body.username}%`;
    const userRes = await db
      .select()
      .from(schema.users)
      .where(or(
        eq(schema.users.username, body.username),
        eq(schema.users.email, body.username),
        eq(schema.users.organizationId, body.username),
        ilike(schema.users.organizationName, searchPattern)
      ))
      .limit(1);

    const targetUser = userRes[0];
    if (!targetUser) {
      throw new NotFoundException(`Target organization/user profile not found matching query: "${body.username}"`);
    }

    const userEmail = targetUser.email;

    if (body.action === 'credit') {
      const reserveBalance = await this.creditLedgerService.resolveBalance('RESERVE');
      if (reserveBalance < body.amount) {
        throw new BadRequestException('Insufficient credits in central RESERVE to complete this transfer');
      }
      const tx = await this.creditLedgerService.transferCredits(
        'RESERVE',
        userEmail,
        body.amount,
        'transfer',
        'manual_adjust',
        `Moderator manual credit adjustment: credit to ${targetUser.username} (${targetUser.organizationName || 'No Org'})`
      );
      return { success: true, tx };
    } else {
      const userBalance = await this.creditLedgerService.resolveBalance(userEmail);
      if (userBalance < body.amount) {
        throw new BadRequestException(`Target user balance (${userBalance} tokens) is less than request debit amount`);
      }
      const tx = await this.creditLedgerService.transferCredits(
        userEmail,
        'RESERVE',
        body.amount,
        'transfer',
        'manual_adjust',
        `Moderator manual credit adjustment: debit from ${targetUser.username} (${targetUser.organizationName || 'No Org'})`
      );
      return { success: true, tx };
    }
  }

  @Get('credits/verify-tx/:txid')
  async verifyTransaction(@Req() req: any, @Param('txid') txid: string) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }
    const db = this.db;
    const txRes = await db
      .select()
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.id, txid))
      .limit(1);
    const tx = txRes[0];
    if (!tx) {
      throw new NotFoundException('Transaction block ID not found');
    }
    return tx;
  }

  @Post('credits/reverse-tx')
  async reverseTransaction(@Req() req: any, @Body() body: { txid: string }) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }
    const db = this.db;
    const txRes = await db
      .select()
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.id, body.txid))
      .limit(1);
    const tx = txRes[0];
    if (!tx) {
      throw new NotFoundException('Transaction block ID not found');
    }

    if (tx.senderUsername === 'SYSTEM' && tx.receiverUsername === 'RESERVE') {
      throw new BadRequestException('Genesis mint transactions are not reversible');
    }

    // Perform verification reversal: transfer back from receiver to sender
    const receiverBalance = await this.creditLedgerService.resolveBalance(tx.receiverUsername);
    if (receiverBalance < tx.amount) {
      throw new BadRequestException(`Cannot reverse: receiver (${tx.receiverUsername}) only has ${receiverBalance} tokens`);
    }

    const reverseTx = await this.creditLedgerService.transferCredits(
      tx.receiverUsername,
      tx.senderUsername,
      tx.amount,
      'transfer',
      'manual_adjust',
      `Reversal block entry for TXID: ${tx.id}`
    );

    return { success: true, reverseTx };
  }

  @Post('credits/pricing')
  async configurePricing(
    @Req() req: any,
    @Body() body: { emailBroadcastCost: number, sophiaChatCost: number, sophiaToolCost: number }
  ) {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
      throw new BadRequestException('Unauthorized role');
    }

    const db = this.db;
    const items = [
      { key: 'price_email_broadcast', value: String(body.emailBroadcastCost) },
      { key: 'price_sophia_chat', value: String(body.sophiaChatCost) },
      { key: 'price_sophia_tool', value: String(body.sophiaToolCost) }
    ];

    for (const item of items) {
      await db
        .insert(schema.systemConfigs)
        .values({
          key: item.key,
          value: item.value,
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: schema.systemConfigs.key,
          set: { value: item.value, updatedAt: new Date() }
        });
    }

    return { success: true };
  }
}
