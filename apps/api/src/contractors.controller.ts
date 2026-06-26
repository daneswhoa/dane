import { Controller, Get, Post, Body, Query, Param, InternalServerErrorException, BadRequestException, UseGuards, Inject } from '@nestjs/common';
import { eq, desc, inArray } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';

@Controller('dashboard')
@UseGuards(SessionGuard)
export class ContractorsController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  @Get('contractors')
  async getContractors() {
    const db = this.db;
    try {
      const list = await db
        .select()
        .from(schema.contractors)
        .orderBy(desc(schema.contractors.createdAt));
      return list;
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve contractors: ${err.message}`);
    }
  }

  @Get('contractor/profile')
  async getContractorProfile(@Query('userId') userId: string) {
    const db = this.db;
    if (!userId) {
      throw new BadRequestException('userId is required.');
    }
    try {
      const profile = await db
        .select({
          id: schema.contractors.id,
          userId: schema.contractors.userId,
          name: schema.contractors.name,
          email: schema.contractors.email,
          phone: schema.contractors.phone,
          specialty: schema.contractors.specialty,
          bio: schema.contractors.bio,
          hourlyRate: schema.contractors.hourlyRate,
          photoUrl: schema.contractors.photoUrl,
          locationName: schema.contractors.locationName,
          status: schema.contractors.status,
          stripeAccountId: schema.users.stripeAccountId,
        })
        .from(schema.contractors)
        .leftJoin(schema.users, eq(schema.users.id, schema.contractors.userId))
        .where(eq(schema.contractors.userId, userId))
        .limit(1);
      if (profile.length === 0) {
        return null;
      }
      return profile[0];
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve contractor profile: ${err.message}`);
    }
  }

  @Post('contractor/profile')
  async saveContractorProfile(
    @Body() body: {
      userId: string;
      name: string;
      phone?: string;
      specialty: string;
      bio?: string;
      hourlyRate?: number;
      locationName?: string;
      photoUrl?: string;
    }
  ) {
    const db = this.db;
    if (!body.userId || !body.name || !body.specialty) {
      throw new BadRequestException('userId, name and specialty are required.');
    }
    if (body.bio && body.bio.length > 500) {
      throw new BadRequestException('Bio cannot exceed 500 characters.');
    }

    try {
      const profile = await db
        .select()
        .from(schema.contractors)
        .where(eq(schema.contractors.userId, body.userId))
        .limit(1);

      const updateData = {
        name: body.name,
        phone: body.phone || null,
        specialty: body.specialty,
        bio: body.bio || null,
        hourlyRate: body.hourlyRate || null,
        locationName: body.locationName || null,
        photoUrl: body.photoUrl || null,
      };

      if (profile.length > 0) {
        await db
          .update(schema.contractors)
          .set(updateData)
          .where(eq(schema.contractors.userId, body.userId));
      } else {
        const contractorId = 'contractor-' + Math.random().toString(36).substring(2, 9);
        const u = await db.select().from(schema.users).where(eq(schema.users.id, body.userId)).limit(1);
        const email = u.length > 0 ? u[0].email : 'contractor@landlord.hu';

        await db.insert(schema.contractors).values({
          id: contractorId,
          userId: body.userId,
          email,
          ...updateData
        });
      }

      await db.update(schema.users).set({
        name: body.name,
        image: body.photoUrl || null,
      }).where(eq(schema.users.id, body.userId));

      // Global Audit Log for Profile Update
      await db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: body.userId,
        actorName: body.name,
        actorEmail: profile.length > 0 ? profile[0].email : 'contractor@landlord.nl',
        actorInitials: body.name.substring(0, 2).toUpperCase(),
        categoryIconName: 'UserCog',
        categoryLabel: 'Contractor Settings',
        description: `Contractor updated their profile settings and service rates.`,
        ip: '127.0.0.1',
        location: 'Contractor Portal',
        status: 'success',
        severity: 'low',
      });

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to save contractor profile: ${err.message}`);
    }
  }

  @Get('contractor/jobs')
  async getContractorJobs(@Query('userId') userId: string) {
    const db = this.db;
    if (!userId) {
      throw new BadRequestException('userId is required.');
    }
    try {
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
          scheduledAt: schema.tickets.scheduledAt,
          quoteAmount: schema.tickets.quoteAmount,
          quoteStatus: schema.tickets.quoteStatus,
          contractorMessage: schema.tickets.contractorMessage,
          proofPhotoUrl: schema.tickets.proofPhotoUrl,
          rating: schema.tickets.rating,
          ratingComment: schema.tickets.ratingComment,
          createdAt: schema.tickets.createdAt,
          propertyName: schema.properties.name,
          unitLabel: schema.units.label,
        })
        .from(schema.tickets)
        .leftJoin(schema.properties, eq(schema.tickets.propertyId, schema.properties.id))
        .leftJoin(schema.units, eq(schema.tickets.unitId, schema.units.id))
        .where(eq(schema.tickets.contractorId, userId))
        .orderBy(desc(schema.tickets.createdAt));

      const userIds = list.map((item: any) => item.tenantId).filter(Boolean) as string[];
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

      return list.map((item: any) => ({
        ...item,
        tenantName: item.tenantId ? (usersMap[item.tenantId] || 'Resident') : 'N/A',
      }));
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve contractor jobs: ${err.message}`);
    }
  }
}
