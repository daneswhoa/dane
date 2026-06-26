import { Controller, Get, Post, Body, Req, UnauthorizedException, BadRequestException, InternalServerErrorException, UseGuards, Inject } from '@nestjs/common';
import * as schema from './db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { EmailService } from './email.service';

@Controller('dashboard/team')
@UseGuards(SessionGuard)
export class TeamController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly emailService: EmailService
  ) {}
  
  @Get()
  async getTeamRoster(@Req() req: any) {
    const db = this.db;
    const ownerId = req.user?.id || 'current-user-id'; // using mock fallback if not logged in
    
    try {
      // Get actual users who are managers/owners (simplified)
      // Since we don't have a formal organization table yet, we find users who share this owner's org name or are tied to them.
      const teamUsers = await db.select().from(schema.users).where(
        eq(schema.users.role, 'landlord') // Simplified for demo
      );

      // Get pending invites
      const pendingInvites = await db.select().from(schema.invitations).where(
        and(eq(schema.invitations.ownerId, ownerId), eq(schema.invitations.used, false))
      );

      return {
        members: teamUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          initials: u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        })),
        invites: pendingInvites.map((i: any) => ({
          id: i.id,
          email: i.email,
          role: i.targetRole,
          expiresAt: i.expiresAt,
        }))
      };
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Post('invites')
  async createTeamInvite(@Req() req: any, @Body() body: { email: string, role: string, allowedProperties: string[] | string, permissions: any }) {
    const db = this.db;
    const ownerId = req.user?.id || 'current-user-id';
    
    if (!body.email || !body.role) {
      throw new BadRequestException('Email and role are required.');
    }

    try {
      const inviteCode = `LNL-TEAM-${randomBytes(4).toString('hex').toUpperCase()}`;
      
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7); // 7 days

      const allowedPropertiesStr = body.allowedProperties === 'all' 
        ? 'all' 
        : Array.isArray(body.allowedProperties) 
          ? body.allowedProperties.join(',') 
          : '';
      const permissionsStr = body.permissions ? JSON.stringify(body.permissions) : '';

      await db.insert(schema.invitations).values({
        id: inviteCode,
        ownerId,
        email: body.email,
        targetRole: body.role,
        allowedProperties: allowedPropertiesStr,
        permissions: permissionsStr,
        used: false,
        expiresAt: expireDate,
      });

      // Get owner details to find organization Name
      const owner = await db.select().from(schema.users).where(eq(schema.users.id, ownerId)).limit(1);
      const orgName = owner[0]?.organizationName || 'Landlord.nl';

      // Construct invite link
      const inviteLink = `http://localhost:3000/invite?code=${inviteCode}`;

      try {
        await this.emailService.sendEmail(
          body.email,
          `Invitation to join ${orgName}`,
          `
            <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="color: #111; margin-bottom: 16px;">Join ${orgName} on landlord.hu</h2>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                You have been invited by <strong>${owner[0]?.name || 'a team member'}</strong> to join their workspace on landlord.hu as a <strong>${body.role}</strong>.
              </p>
              <div style="margin: 24px 0;">
                <a href="${inviteLink}" style="background-color: #f05252; color: white; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #999; font-size: 11px; margin-top: 32px; border-top: 1px solid #eaeaea; padding-top: 16px;">
                If the button above does not work, copy and paste this link in your browser:<br/>
                <a href="${inviteLink}" style="color: #f05252;">${inviteLink}</a>
              </p>
            </div>
          `
        );
      } catch (emailErr) {
        console.error('Failed to send team invite email:', emailErr);
      }

      return { success: true, code: inviteCode };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to create team invite: ${err.message}`);
    }
  }

  @Get('org-stats')
  async getOrgStats(@Req() req: any) {
    const db = this.db;
    const ownerId = req.user.id;

    try {
      const props = await db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.ownerId, ownerId));

      const propIds = props.map((p: any) => p.id);

      let totalUnits = 0;
      let occupiedUnits = 0;
      let totalMonthlyRent = 0;
      const cityMap: Record<string, { units: number; revenue: number; status: string }> = {};

      let allUnits: any[] = [];
      if (propIds.length > 0) {
        allUnits = await db
          .select({
            id: schema.units.id,
            propertyId: schema.units.propertyId,
            rent: schema.units.rent,
            status: schema.units.status,
          })
          .from(schema.units)
          .where(inArray(schema.units.propertyId, propIds));
      }

      totalUnits = allUnits.length;
      occupiedUnits = allUnits.filter((u: any) => u.status === 'occupied').length;
      totalMonthlyRent = allUnits.reduce((sum: number, u: any) => sum + (Number(u.rent) || 0), 0);

      props.forEach((prop: any) => {
        const propUnits = allUnits.filter((u: any) => u.propertyId === prop.id);
        const unitsCount = propUnits.length;
        const revenue = propUnits.reduce((sum: number, u: any) => sum + (Number(u.rent) || 0), 0);

        let city = 'Other';
        if (prop.address) {
          const parts = prop.address.split(',');
          if (parts.length > 1) {
            city = parts[parts.length - 1].trim();
          } else {
            city = prop.address.trim();
          }
        }
        
        if (city.toLowerCase().includes('amsterdam')) city = 'Amsterdam, NH';
        else if (city.toLowerCase().includes('rotterdam')) city = 'Rotterdam, ZH';
        else if (city.toLowerCase().includes('utrecht')) city = 'Utrecht, UT';
        else if (city.toLowerCase().includes('den haag') || city.toLowerCase().includes('hague')) city = 'Den Haag, ZH';

        if (!cityMap[city]) {
          cityMap[city] = { units: 0, revenue: 0, status: 'Stable' };
        }
        cityMap[city].units += unitsCount;
        cityMap[city].revenue += revenue;
      });

      const geography = Object.keys(cityMap).map((city) => {
        const item = cityMap[city];
        const occupancy = item.units > 0 ? (item.units / totalUnits) * 100 : 0;
        let status = 'Stable';
        if (occupancy > 80) status = 'Healthy';
        else if (occupancy > 50) status = 'Growing';
        return {
          region: city,
          units: item.units,
          revenue: `$${Math.round(item.revenue).toLocaleString()}/mo`,
          status
        };
      });

      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0;
      const aumValue = (totalMonthlyRent * 12) * 15;
      let aumFormatted = `$${(aumValue / 1000000).toFixed(1)}M`;
      if (aumValue < 1000000) {
        aumFormatted = `$${Math.round(aumValue / 100).toLocaleString()}k`;
      }

      return {
        totalUnits,
        activeTenants: occupiedUnits,
        occupancyRate: `${occupancyRate}%`,
        aumValue: aumFormatted,
        geography
      };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to load org stats: ${err.message}`);
    }
  }

  @Post('org-identity')
  async updateOrgIdentity(
    @Req() req: any,
    @Body() body: { organizationName: string; username: string },
  ) {
    const db = this.db;
    const ownerId = req.user.id;

    if (!body.organizationName || !body.username) {
      throw new BadRequestException('Organization name and username are required.');
    }

    try {
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, body.username));

      if (existingUser.length > 0 && existingUser[0].id !== ownerId) {
        throw new BadRequestException('Username is already taken by another organization.');
      }

      await db
        .update(schema.users)
        .set({
          organizationName: body.organizationName,
          username: body.username,
        })
        .where(eq(schema.users.id, ownerId));

      return { success: true, message: 'Organization identity updated successfully.' };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to update organization: ${err.message}`);
    }
  }

  @Post('invites/accept')
  async acceptTeamInvite(@Req() req: any, @Body() body: { code: string }) {
    const db = this.db;
    const callerId = req.user.id;

    if (!body.code) {
      throw new BadRequestException('Code is required.');
    }

    try {
      return await db.transaction(async (tx: any) => {
        const inviteList = await tx
          .select()
          .from(schema.invitations)
          .where(eq(schema.invitations.id, body.code.toUpperCase().trim()))
          .limit(1);

        if (inviteList.length === 0) {
          throw new BadRequestException('Invalid invite code.');
        }

        const invite = inviteList[0];
        if (invite.used) {
          throw new BadRequestException('Invite code has already been used.');
        }

        if (invite.expiresAt < new Date()) {
          throw new BadRequestException('Invite code has expired.');
        }

        // Get owner details to find organization Name
        const owner = await tx.select().from(schema.users).where(eq(schema.users.id, invite.ownerId)).limit(1);
        const orgName = owner[0]?.organizationName || 'Landlord.nl';

        // Update user's role and organizationName in database
        await tx
          .update(schema.users)
          .set({
            role: 'landlord', // Team members share the landlord role or we can set it based on targetRole
            organizationName: orgName,
            allowedProperties: invite.allowedProperties,
            permissions: invite.permissions,
          })
          .where(eq(schema.users.id, callerId));

        // Mark invite as used
        await tx
          .update(schema.invitations)
          .set({ used: true })
          .where(eq(schema.invitations.id, invite.id));

        return { success: true, message: 'Joined organization successfully!' };
      });
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to accept team invite: ${err.message}`);
    }
  }
}
