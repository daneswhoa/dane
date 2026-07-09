import { Controller, Get, Post, Body, Query, Param, Req, InternalServerErrorException, BadRequestException, UseGuards, Inject } from '@nestjs/common';
import { eq, desc, inArray, and } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { EmailService } from './email.service';
import { RealtimeService } from './realtime/realtime.service';

@Controller('dashboard')
@UseGuards(SessionGuard)
export class TenantsController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly emailService: EmailService,
    private readonly realtimeService: RealtimeService
  ) {}
  @Get('tenants')
  async getTenants(@Req() req: any) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied. Tenants cannot view tenant lists.');
    }

    try {
      const list = await this.db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          phone: schema.users.phone,
          idNumber: schema.users.idNumber,
          leaseStart: schema.users.leaseStart,
          leaseEnd: schema.users.leaseEnd,
          kinDetails: schema.users.kinDetails,
          unitId: schema.units.id,
          unitName: schema.units.label,
          floor: schema.units.floor,
          unitType: schema.units.unitType,
          rent: schema.units.rent,
          deposit: schema.units.deposit,
          moveInFees: schema.units.moveInFees,
          recurringFees: schema.units.recurringFees,
          arrears: schema.units.arrears,
          status: schema.units.status,
          propertyName: schema.properties.name,
        })
        .from(schema.users)
        .innerJoin(schema.units, eq(schema.users.id, schema.units.tenantId))
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(
          and(
            eq(schema.users.role, 'tenant'),
            eq(schema.properties.organizationId, req.user.organizationId || '')
          )
        );

      return list.map((t: any) => {
        let kinsList = [];
        if (t.kinDetails) {
          if (typeof t.kinDetails === 'object') {
            kinsList = t.kinDetails;
          } else {
            try {
              kinsList = JSON.parse(t.kinDetails);
            } catch (e) {}
          }
        }
        return {
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone || '',
          idNumber: t.idNumber || '',
          propertyName: t.propertyName || 'Residential Roster',
          unitId: t.unitId || 'N/A',
          unitName: t.unitName || 'N/A',
          floor: t.floor || '1',
          unitType: t.unitType || 'Residential',
          rent: Number(t.rent || 0),
          deposit: Number(t.deposit || 0),
          moveInFees: Number(t.moveInFees || 0),
          recurringFees: Number(t.recurringFees || 0),
          arrears: Number(t.arrears || 0),
          status: t.arrears && Number(t.arrears) > 0 ? 'LATE' : (t.status === 'occupied' ? 'ACTIVE' : 'MOVE-IN PREP'),
          leaseStart: t.leaseStart ? new Date(t.leaseStart).toISOString().split('T')[0] : '',
          leaseEnd: t.leaseEnd ? new Date(t.leaseEnd).toISOString().split('T')[0] : '',
          kins: kinsList,
        };
      });
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve tenants: ${err.message}`);
    }
  }

  @Get('tenant/profile')
  async getTenantProfile(@Req() req: any, @Query('userId') userId?: string) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    const targetUserId = userId || callerId;
    if (callerRole === 'tenant' && targetUserId !== callerId) {
      throw new BadRequestException('Access denied. Tenants can only retrieve their own profile.');
    }

    try {
      const userList = await this.db.select().from(schema.users).where(eq(schema.users.id, targetUserId)).limit(1);
      if (userList.length === 0) {
        return null;
      }
      const user = userList[0];

      const unitList = await this.db
        .select({
          unitId: schema.units.id,
          unitLabel: schema.units.label,
          rent: schema.units.rent,
          deposit: schema.units.deposit,
          moveInFees: schema.units.moveInFees,
          recurringFees: schema.units.recurringFees,
          floor: schema.units.floor,
          unitType: schema.units.unitType,
          propertyId: schema.properties.id,
          propertyName: schema.properties.name,
          propertyAddress: schema.properties.address,
          ownerId: schema.properties.ownerId,
          currency: schema.properties.currency,
        })
        .from(schema.units)
        .leftJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(eq(schema.units.tenantId, targetUserId))
        .limit(1);

      const hasUnit = unitList.length > 0;
      const unitInfo = hasUnit ? unitList[0] : null;

      let emergencyContacts = [];
      let nextOfKin = [];
      if (user.kinDetails) {
        try {
          const parsed = typeof user.kinDetails === 'object' ? user.kinDetails : JSON.parse(user.kinDetails);
          if (parsed && typeof parsed === 'object') {
            emergencyContacts = parsed.emergencyContacts || [];
            nextOfKin = parsed.nextOfKin || [];
          }
        } catch (e) {
          try {
            const arr = typeof user.kinDetails === 'object' ? user.kinDetails : JSON.parse(user.kinDetails);
            if (Array.isArray(arr)) {
              emergencyContacts = arr;
            }
          } catch (_) {}
        }
      }

      let managerName = 'Property Manager';
      let managerEmail = 'manager@landlord.nl';
      let managerPhone = '';

      if (unitInfo && unitInfo.ownerId) {
        const ownerList = await this.db.select().from(schema.users).where(eq(schema.users.id, unitInfo.ownerId)).limit(1);
        if (ownerList.length > 0) {
          managerName = ownerList[0].name || managerName;
          managerEmail = ownerList[0].email || managerEmail;
          managerPhone = ownerList[0].phone || managerPhone;
        }
      }

      const unpaidInvoices = await this.db.select()
        .from(schema.invoices)
        .where(
          and(
            eq(schema.invoices.tenantId, targetUserId),
            eq(schema.invoices.status, 'unpaid')
          )
        );

      let owedAmount = 0;
      let rentDueDate = '';

      unpaidInvoices.forEach((inv: any) => {
        owedAmount += Number(inv.amount) || 0;
        if (!rentDueDate && inv.dueDate) {
          rentDueDate = new Date(inv.dueDate).toISOString();
        } else if (inv.dueDate && rentDueDate) {
          if (new Date(inv.dueDate) < new Date(rentDueDate)) {
            rentDueDate = new Date(inv.dueDate).toISOString();
          }
        }
      });

      const ticketsList = await this.db.select()
        .from(schema.tickets)
        .where(eq(schema.tickets.tenantId, targetUserId))
        .orderBy(desc(schema.tickets.createdAt));
      
      const tickets = ticketsList.map((t: any) => ({
        id: t.id,
        title: t.title || 'Untitled Ticket',
        description: t.description,
        status: t.status,
        urgency: t.urgency || 'medium',
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : '',
      }));

      const latestTicket = tickets.length > 0 ? tickets[0] : null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        idNumber: user.idNumber || '',
        photoUrl: user.image || '',
        unit: unitInfo ? `Unit ${unitInfo.unitLabel}` : '',
        unitId: unitInfo ? unitInfo.unitId : '',
        unitName: unitInfo ? unitInfo.unitLabel : '',
        floor: unitInfo ? unitInfo.floor || '1' : '1',
        unitType: unitInfo ? unitInfo.unitType || 'Residential' : 'Residential',
        rent: unitInfo ? Number(unitInfo.rent || 0) : 0,
        deposit: unitInfo ? Number(unitInfo.deposit || 0) : 0,
        moveInFees: unitInfo ? Number(unitInfo.moveInFees || 0) : 0,
        recurringFees: unitInfo ? Number(unitInfo.recurringFees || 0) : 0,
        building: unitInfo ? unitInfo.propertyName : '',
        propertyName: unitInfo ? unitInfo.propertyName : 'Residential Roster',
        propertyAddress: unitInfo ? unitInfo.propertyAddress : '',
        propertyId: unitInfo ? unitInfo.propertyId : '',
        ownerId: unitInfo ? unitInfo.ownerId : '',
        currency: unitInfo ? unitInfo.currency || 'USD' : 'USD',
        moveInDate: user.leaseStart ? new Date(user.leaseStart).toISOString().split('T')[0] : '',
        leaseStart: user.leaseStart ? new Date(user.leaseStart).toISOString().split('T')[0] : '',
        leaseEnd: user.leaseEnd ? new Date(user.leaseEnd).toISOString().split('T')[0] : '',
        autopayEnabled: false,
        emergencyContacts,
        nextOfKin,
        kins: emergencyContacts.concat(nextOfKin),
        managerName,
        managerEmail,
        managerPhone,
        owedAmount,
        arrears: owedAmount,
        rentDueDate,
        latestTicket,
        tickets,
      };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve tenant profile: ${err.message}`);
    }
  }

  @Post('tenant/profile/update')
  async updateTenantProfile(@Req() req: any, @Body() body: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    emergencyContacts?: any[];
    nextOfKin?: any[];
  }) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    const targetUserId = body.id || callerId;
    if (callerRole === 'tenant' && targetUserId !== callerId) {
      throw new BadRequestException('Access denied. Tenants can only update their own profile.');
    }

    try {
      const kinDetailsObj = {
        emergencyContacts: body.emergencyContacts || [],
        nextOfKin: body.nextOfKin || [],
      };

      await this.db
        .update(schema.users)
        .set({
          name: body.name,
          email: body.email,
          phone: body.phone,
          image: body.photoUrl,
          kinDetails: kinDetailsObj,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, targetUserId));

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to update profile: ${err.message}`);
    }
  }

  @Post('invites')
  async createInvite(
    @Req() req: any,
    @Body() body: {
      ownerId?: string;
      propertyId: string;
      unitId: string;
      email?: string;
    }
  ) {
    const ownerId = req.user?.id || body.ownerId || 'current-user-id';
    if (!body.propertyId || !body.unitId) {
      throw new BadRequestException('propertyId and unitId are required.');
    }
    try {
      // Verify unit is vacant
      const unitCheck = await this.db.select().from(schema.units).where(eq(schema.units.id, body.unitId)).limit(1);
      if (unitCheck.length === 0) {
        throw new BadRequestException('Associated unit not found.');
      }
      if (unitCheck[0].status !== 'vacant') {
        throw new BadRequestException('This unit is not vacant. You can only invite tenants to vacant units.');
      }

      const inviteCode = `LNL-${body.propertyId.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await this.db.insert(schema.invitations).values({
        id: inviteCode,
        ownerId,
        organizationId: req.user.organizationId || null,
        organizationName: req.user.organizationName || null,
        propertyId: body.propertyId,
        unitId: body.unitId,
        email: body.email || null,
        targetRole: 'tenant',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        used: false,
      });

      // Send brand email if email is provided
      if (body.email) {
        const ownerUser = await this.db.select().from(schema.users).where(eq(schema.users.id, ownerId)).limit(1);
        const orgName = ownerUser[0]?.organizationName || 'Dane Properties';
        
        const propCheck = await this.db.select({ name: schema.properties.name }).from(schema.properties).where(eq(schema.properties.id, body.propertyId)).limit(1);
        const propName = propCheck[0]?.name || 'your new home';

        const inviteLink = `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001'}/invite?code=${inviteCode}`;
        const subject = `Your invitation to join ${orgName}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #f43f5e; font-size: 20px; font-weight: bold; margin-bottom: 16px;">Welcome to ${orgName}</h2>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
              You have been invited to move into <strong>${propName}</strong> (Unit ${unitCheck[0].label}).
            </p>
            <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6; text-align: center;">
              <p style="font-size: 12px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin: 0 0 8px 0; letter-spacing: 0.05em;">Your Invitation Code</p>
              <code style="font-size: 22px; font-family: monospace; font-weight: bold; color: #e11d48; letter-spacing: 0.1em;">${inviteCode}</code>
            </div>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
              Please accept this invitation and complete your setup using the button below:
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${inviteLink}" style="background-color: #f43f5e; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block;">Accept Invitation</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
            <p style="font-size: 11px; color: #9ca3af; line-height: 1.4; text-align: center;">
              If the button above does not work, copy and paste this link into your browser:<br/>
              <a href="${inviteLink}" style="color: #f43f5e;">${inviteLink}</a>
            </p>
          </div>
        `;
        await this.emailService.sendEmail(body.email, subject, html);
      }

      return { success: true, code: inviteCode };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to create invite: ${err.message}`);
    }
  }

  @Post(['invites/verify', 'tenants/invites/verify'])
  async verifyInvite(@Body() body: { code: string }) {
    if (!body.code) {
      throw new BadRequestException('code is required.');
    }
    try {
      const inviteList = await this.db
        .select()
        .from(schema.invitations)
        .where(eq(schema.invitations.id, body.code.toUpperCase().trim()))
        .limit(1);

      if (inviteList.length === 0) {
        throw new BadRequestException('Invalid invite code.');
      }

      const invite = inviteList[0];
      if (invite.used) {
        const unitList = await this.db.select().from(schema.units).where(eq(schema.units.id, invite.unitId || '')).limit(1);
        if (unitList.length > 0 && unitList[0].status === 'vacant') {
          // Self-heal: allow reuse
        } else {
          throw new BadRequestException('Invite code has already been used.');
        }
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        throw new BadRequestException('Invite code has expired.');
      }

      if (invite.targetRole === 'tenant') {
        const prop = await this.db.select().from(schema.properties).where(eq(schema.properties.id, invite.propertyId || '')).limit(1);
        const unit = await this.db.select().from(schema.units).where(eq(schema.units.id, invite.unitId || '')).limit(1);

        if (prop.length === 0 || unit.length === 0) {
          throw new BadRequestException('Invite references an invalid property or unit.');
        }

        const owner = await this.db.select().from(schema.users).where(eq(schema.users.id, invite.ownerId)).limit(1);

        let recurringDetails = [];
        let moveInDetails = [];
        try { if (unit[0].recurringFeeDetails) recurringDetails = JSON.parse(unit[0].recurringFeeDetails as string); } catch(e){}
        try { if (unit[0].moveInFeeDetails) moveInDetails = JSON.parse(unit[0].moveInFeeDetails as string); } catch(e){}

        return {
          email: invite.email,
          targetRole: 'tenant',
          propertyName: prop[0].name,
          managerName: owner.length > 0 ? owner[0].name : 'Sophia AI Management',
          unitDetails: `Unit ${unit[0].label} (${unit[0].unitType || 'Residential'})`,
          rentNum: Number(unit[0].rent || 0),
          monthlyRent: `$${Number(unit[0].rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          depositNum: Number(unit[0].deposit || 0),
          recurringTotal: Number(unit[0].recurringFees || 0),
          moveInTotal: Number(unit[0].moveInFees || 0),
          recurringDetails,
          moveInDetails,
          nextInvoiceDate: 'Next Month (1st)',
          propertyId: invite.propertyId,
          unitId: invite.unitId,
        };
      } else {
        const owner = await this.db.select().from(schema.users).where(eq(schema.users.id, invite.ownerId)).limit(1);
        return {
          email: invite.email,
          targetRole: invite.targetRole || 'Team Member',
          propertyName: owner.length > 0 ? (owner[0].organizationName || 'Dane Properties') : 'Dane Properties',
          managerName: owner.length > 0 ? owner[0].name : 'Sophia AI Management',
          unitDetails: `Team Access - ${invite.targetRole}`,
          monthlyRent: 'N/A',
          nextInvoiceDate: 'N/A',
          propertyId: null,
          unitId: null,
        };
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to verify invite: ${err.message}`);
    }
  }

  @Post(['invites/accept', 'tenants/invites/accept'])
  async acceptInvite(@Req() req: any, @Body() body: { code: string; tenantId?: string }) {
    if (!body.code) {
      throw new BadRequestException('code is required.');
    }
    const callerId = req.user.id;
    const callerRole = req.user.role;
    
    let tenantId = body.tenantId || callerId;
    if (callerRole === 'tenant' && tenantId !== callerId) {
      throw new BadRequestException('Access denied. You can only accept invites on your own account.');
    }

    try {
      return await this.db.transaction(async (tx: any) => {
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
          const unitList = await tx.select().from(schema.units).where(eq(schema.units.id, invite.unitId || '')).limit(1);
          if (unitList.length > 0 && unitList[0].status === 'vacant') {
            // Self-heal
          } else {
            throw new BadRequestException('Invite code has already been used.');
          }
        }

        if (req.user.email.toLowerCase() !== invite.email.toLowerCase()) {
          throw new BadRequestException('This invite code was issued to a different email address.');
        }

        if (invite.expiresAt < new Date()) {
          throw new BadRequestException('Invite code has expired.');
        }

        const unitList = await tx.select().from(schema.units).where(eq(schema.units.id, invite.unitId || '')).limit(1);
        if (unitList.length === 0) {
          throw new BadRequestException('Associated unit not found.');
        }
        const unit = unitList[0];

        const userExist = await tx.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
        if (userExist.length === 0) {
          const emailExist = await tx.select().from(schema.users).where(eq(schema.users.email, req.user.email)).limit(1);
          if (emailExist.length > 0) {
            tenantId = emailExist[0].id;
          } else {
            await tx.insert(schema.users).values({
              id: tenantId,
              name: req.user.name || 'Resident Tenant',
              email: req.user.email,
              role: 'tenant',
            });
          }
        }

        const activeUnits = await tx.select().from(schema.units).where(eq(schema.units.tenantId, tenantId)).limit(1);
        if (activeUnits.length > 0) {
          throw new BadRequestException('You are already registered to a property. You must leave your current property first.');
        }

        await tx.update(schema.invitations).set({ used: true }).where(eq(schema.invitations.id, invite.id));

        await tx
          .update(schema.units)
          .set({
            status: 'occupied',
            tenantId: tenantId,
          })
          .where(eq(schema.units.id, invite.unitId || ''));

        const leaseStart = new Date();
        const leaseEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await tx
          .update(schema.users)
          .set({
            role: 'tenant',
            leaseStart,
            leaseEnd,
          })
          .where(eq(schema.users.id, tenantId));

        const leaseId = 'lease-' + Math.random().toString(36).substring(2, 9);
        await tx.insert(schema.leases).values({
          id: leaseId,
          tenantId: tenantId,
          propertyId: invite.propertyId,
          unitId: invite.unitId,
          startDate: leaseStart,
          endDate: leaseEnd,
          status: 'active',
        });

        const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
        const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
        
        const tenantUser = await tx.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
        const tenantName = tenantUser.length > 0 ? tenantUser[0].name : 'Resident Tenant';
        const tenantEmail = tenantUser.length > 0 ? tenantUser[0].email : 'tenant@example.com';

        let invoiceDescription = `Rent: $${Number(unit.rent)}\n`;
        let totalAmount = Number(unit.rent) || 0;
        
        let recurringDetails = [];
        let moveInDetails = [];
        try { if (unit.recurringFeeDetails) recurringDetails = JSON.parse(unit.recurringFeeDetails as string); } catch(e){}
        try { if (unit.moveInFeeDetails) moveInDetails = JSON.parse(unit.moveInFeeDetails as string); } catch(e){}

        if (recurringDetails.length > 0) {
          recurringDetails.forEach((f: any) => {
            invoiceDescription += `${f.name}: $${f.amount}\n`;
            totalAmount += Number(f.amount);
          });
        }
        
        const depositAmt = Number(unit.deposit) || 0;
        if (depositAmt > 0) {
          invoiceDescription += `Security Deposit: $${depositAmt}\n`;
          totalAmount += depositAmt;
        }
        if (moveInDetails.length > 0) {
          invoiceDescription += `\n--- Move-in Fees ---\n`;
          moveInDetails.forEach((f: any) => {
            invoiceDescription += `${f.name}: $${f.amount}\n`;
            totalAmount += Number(f.amount);
          });
        }

        await tx.insert(schema.invoices).values({
          id: invoiceId,
          invoiceNumber: invoiceNum,
          type: 'Rent & Initial Fees',
          tenantId: tenantId,
          tenantEmail,
          tenantName,
          unitId: invite.unitId,
          propertyId: invite.propertyId,
          ownerId: invite.ownerId,
          organizationId: invite.organizationId || null,
          organizationName: invite.organizationName || null,
          amount: totalAmount,
          description: invoiceDescription.trim(),
          status: 'PENDING',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // Notify managers about tenant joining
        await this.realtimeService.sendPropertyNotification(
          invite.propertyId,
          'Tenant Joined Unit',
          `${tenantName} has joined Unit ${unit.label}.`,
          `/tenants`,
          true
        );

        // Notify tenant about joining and initial invoice
        await this.realtimeService.sendNotification(
          tenantId,
          'Welcome to your new home!',
          `You have successfully joined Unit ${unit.label}. An initial invoice ${invoiceNum} for $${totalAmount} has been generated.`,
          `/tenant/payments`,
          true
        );

        return { success: true };
      });
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to accept invite: ${err.message}`);
    }
  }

  @Post('tenant/leave/request')
  async requestLeave(@Req() req: any, @Body() body: { userId?: string }) {
    const callerId = req.user.id;
    const callerRole = req.user.role;
    
    const targetUserId = body.userId || callerId;
    if (callerRole === 'tenant' && targetUserId !== callerId) {
      throw new BadRequestException('Access denied.');
    }

    try {
      const code = `LAVE-${Math.floor(1000 + Math.random() * 9000)}`;
      const verificationId = `leave-${targetUserId}`;
      
      const existing = await this.db.select().from(schema.verifications).where(eq(schema.verifications.id, verificationId)).limit(1);
      if (existing.length > 0) {
        await this.db.update(schema.verifications)
          .set({
            value: code,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            updatedAt: new Date()
          })
          .where(eq(schema.verifications.id, verificationId));
      } else {
        await this.db.insert(schema.verifications).values({
          id: verificationId,
          identifier: targetUserId,
          value: code,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });
      }

      return { success: true, code };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to generate leave code: ${err.message}`);
    }
  }

  @Post('tenants/move')
  async moveTenant(@Req() req: any, @Body() body: { tenantId: string; unitId: string }) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied. Tenants cannot move other tenants.');
    }

    if (!body.tenantId || !body.unitId) {
      throw new BadRequestException('tenantId and unitId are required.');
    }

    try {
      return await this.db.transaction(async (tx: any) => {
        // 1. Verify destination unit exists
        const destUnitList = await tx
          .select({
            id: schema.units.id,
            status: schema.units.status,
            label: schema.units.label,
            rent: schema.units.rent,
            arrears: schema.units.arrears,
            tenantId: schema.units.tenantId,
            propertyId: schema.units.propertyId,
            propertyName: schema.properties.name,
            ownerId: schema.properties.ownerId,
          })
          .from(schema.units)
          .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
          .where(eq(schema.units.id, body.unitId))
          .limit(1);

        if (destUnitList.length === 0) {
          throw new BadRequestException('Destination unit not found.');
        }

        const destUnit = destUnitList[0];

        // 2. Enforce permission: manager owns/manages property of destUnit
        let targetOwnerId = callerId;
        const relation = await tx
          .select()
          .from(schema.managerRelations)
          .where(eq(schema.managerRelations.managerId, callerId))
          .limit(1);
        if (relation.length > 0) {
          targetOwnerId = relation[0].ownerId;
        }

        if (destUnit.ownerId !== targetOwnerId) {
          throw new BadRequestException('Access denied. You do not manage the property of the destination unit.');
        }

        // 3. Find source tenant
        const tenantList = await tx
          .select()
          .from(schema.users)
          .where(and(eq(schema.users.id, body.tenantId), eq(schema.users.role, 'tenant')))
          .limit(1);

        if (tenantList.length === 0) {
          throw new BadRequestException('Tenant not found.');
        }

        const tenant = tenantList[0];

        // 4. Find source tenant's former unit
        const formerUnitList = await tx
          .select({
            id: schema.units.id,
            label: schema.units.label,
            rent: schema.units.rent,
            arrears: schema.units.arrears,
            tenantId: schema.units.tenantId,
            propertyId: schema.units.propertyId,
            propertyName: schema.properties.name,
          })
          .from(schema.units)
          .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
          .where(eq(schema.units.tenantId, body.tenantId))
          .limit(1);

        const formerUnit = formerUnitList[0] || null;

        // Check if destination is occupied -> SWAP
        const isSwap = destUnit.tenantId !== null && destUnit.tenantId !== body.tenantId;

        if (isSwap) {
          if (!formerUnit) {
            throw new BadRequestException('Cannot swap because the source tenant is not currently assigned to a unit.');
          }

          const destTenantId = destUnit.tenantId!;
          const destTenantList = await tx
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, destTenantId))
            .limit(1);

          if (destTenantList.length === 0) {
            throw new BadRequestException('Occupant of destination unit not found.');
          }
          const destTenant = destTenantList[0];

          // Swap tenants on units
          await tx.update(schema.units)
            .set({ tenantId: destTenantId, status: 'occupied', arrears: destUnit.arrears })
            .where(eq(schema.units.id, formerUnit.id));

          await tx.update(schema.units)
            .set({ tenantId: body.tenantId, status: 'occupied', arrears: formerUnit.arrears })
            .where(eq(schema.units.id, destUnit.id));

          // Update unpaid invoices
          await tx.update(schema.invoices)
            .set({ unitId: destUnit.id, propertyId: destUnit.propertyId })
            .where(and(eq(schema.invoices.tenantId, body.tenantId), eq(schema.invoices.status, 'unpaid')));

          await tx.update(schema.invoices)
            .set({ unitId: formerUnit.id, propertyId: formerUnit.propertyId })
            .where(and(eq(schema.invoices.tenantId, destTenantId), eq(schema.invoices.status, 'unpaid')));

          // Swap leases
          await tx.update(schema.leases)
            .set({ status: 'ended', endDate: new Date() })
            .where(and(eq(schema.leases.tenantId, body.tenantId), eq(schema.leases.status, 'active')));

          await tx.update(schema.leases)
            .set({ status: 'ended', endDate: new Date() })
            .where(and(eq(schema.leases.tenantId, destTenantId), eq(schema.leases.status, 'active')));

          await tx.insert(schema.leases).values({
            id: 'lease-' + Math.random().toString(36).substring(2, 9),
            tenantId: body.tenantId,
            propertyId: destUnit.propertyId,
            unitId: destUnit.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'active',
          });

          await tx.insert(schema.leases).values({
            id: 'lease-' + Math.random().toString(36).substring(2, 9),
            tenantId: destTenantId,
            propertyId: formerUnit.propertyId,
            unitId: formerUnit.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'active',
          });

          // Rent difference billing on upgrades
          let tenantDiffInvoiceCode = '';
          const destRent = Number(destUnit.rent || 0);
          const formerRent = Number(formerUnit.rent || 0);

          if (destRent > formerRent) {
            const diff = destRent - formerRent;
            const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
            tenantDiffInvoiceCode = 'INV-' + Math.floor(100000 + Math.random() * 900000);

            await tx.insert(schema.invoices).values({
              id: invoiceId,
              invoiceNumber: tenantDiffInvoiceCode,
              type: 'Rent Difference (Upgrade)',
              tenantId: body.tenantId,
              tenantEmail: tenant.email,
              tenantName: tenant.name,
              unitId: destUnit.id,
              propertyId: destUnit.propertyId,
              ownerId: targetOwnerId,
              organizationId: tenant.organizationId || null,
              organizationName: tenant.organizationName || null,
              amount: diff,
              description: `Rent difference for upgrading from Unit ${formerUnit.label} ($${formerRent}/mo) to Unit ${destUnit.label} ($${destRent}/mo).`,
              status: 'unpaid',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const newArrears = Number(formerUnit.arrears || 0) + diff;
            await tx.update(schema.units)
              .set({ arrears: newArrears })
              .where(eq(schema.units.id, destUnit.id));
          }

          let destTenantDiffInvoiceCode = '';
          if (formerRent > destRent) {
            const diff = formerRent - destRent;
            const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
            destTenantDiffInvoiceCode = 'INV-' + Math.floor(100000 + Math.random() * 900000);

            await tx.insert(schema.invoices).values({
              id: invoiceId,
              invoiceNumber: destTenantDiffInvoiceCode,
              type: 'Rent Difference (Upgrade)',
              tenantId: destTenantId,
              tenantEmail: destTenant.email,
              tenantName: destTenant.name,
              unitId: formerUnit.id,
              propertyId: formerUnit.propertyId,
              ownerId: targetOwnerId,
              organizationId: destTenant.organizationId || null,
              organizationName: destTenant.organizationName || null,
              amount: diff,
              description: `Rent difference for upgrading from Unit ${destUnit.label} ($${destRent}/mo) to Unit ${formerUnit.label} ($${formerRent}/mo).`,
              status: 'unpaid',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const newArrears = Number(destUnit.arrears || 0) + diff;
            await tx.update(schema.units)
              .set({ arrears: newArrears })
              .where(eq(schema.units.id, formerUnit.id));
          }

          // Realtime Notifications
          await this.realtimeService.sendNotification(
            body.tenantId,
            'Unit Swapped!',
            `You have been swapped to Unit ${destUnit.label}. Your lease, arrears, and unpaid invoices have been transferred.${tenantDiffInvoiceCode ? ` An upgrade invoice ${tenantDiffInvoiceCode} has been generated for the rent difference.` : ''}`,
            `/tenant/payments`,
            true
          );

          await this.realtimeService.sendNotification(
            destTenantId,
            'Unit Swapped!',
            `You have been swapped to Unit ${formerUnit.label}. Your lease, arrears, and unpaid invoices have been transferred.${destTenantDiffInvoiceCode ? ` An upgrade invoice ${destTenantDiffInvoiceCode} has been generated for the rent difference.` : ''}`,
            `/tenant/payments`,
            true
          );

          // Audit Log
          await tx.insert(schema.auditLogs).values({
            id: 'audit-' + Math.random().toString(36).substring(2, 9),
            ownerId: targetOwnerId,
            actorName: req.user.name || 'Owner',
            actorEmail: req.user.email,
            actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            categoryIconName: 'UserCheck',
            categoryLabel: 'Tenants',
            description: `Swapped tenants: "${tenant.name}" moved to Unit ${destUnit.label} & "${destTenant.name}" moved to Unit ${formerUnit.label}.`,
            severity: 'info',
            status: 'success',
            ip: req.ip || 'Unknown',
            location: 'Unknown',
          });

          return {
            success: true,
            message: `Swapped tenant ${tenant.name} to Unit ${destUnit.label} and tenant ${destTenant.name} to Unit ${formerUnit.label} successfully.`
          };
        } else {
          // NORMAL MOVE (Vacant Destination)
          if (formerUnit) {
            // Vacate former unit
            await tx.update(schema.units)
              .set({ tenantId: null, status: 'vacant', arrears: 0 })
              .where(eq(schema.units.id, formerUnit.id));

            // Set new unit, transferring arrears
            const targetArrears = Number(formerUnit.arrears || 0);
            await tx.update(schema.units)
              .set({ tenantId: body.tenantId, status: 'occupied', arrears: targetArrears })
              .where(eq(schema.units.id, destUnit.id));

            // Update unpaid invoices
            await tx.update(schema.invoices)
              .set({ unitId: destUnit.id, propertyId: destUnit.propertyId })
              .where(and(eq(schema.invoices.tenantId, body.tenantId), eq(schema.invoices.status, 'unpaid')));

            // End active lease and start new one
            await tx.update(schema.leases)
              .set({ status: 'ended', endDate: new Date() })
              .where(and(eq(schema.leases.tenantId, body.tenantId), eq(schema.leases.status, 'active')));

            await tx.insert(schema.leases).values({
              id: 'lease-' + Math.random().toString(36).substring(2, 9),
              tenantId: body.tenantId,
              propertyId: destUnit.propertyId,
              unitId: destUnit.id,
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              status: 'active',
            });

            // Rent difference billing on upgrades
            let diffInvoiceCode = '';
            const destRent = Number(destUnit.rent || 0);
            const formerRent = Number(formerUnit.rent || 0);

            if (destRent > formerRent) {
              const diff = destRent - formerRent;
              const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
              diffInvoiceCode = 'INV-' + Math.floor(100000 + Math.random() * 900000);

              await tx.insert(schema.invoices).values({
                id: invoiceId,
                invoiceNumber: diffInvoiceCode,
                type: 'Rent Difference (Upgrade)',
                tenantId: body.tenantId,
                tenantEmail: tenant.email,
                tenantName: tenant.name,
                unitId: destUnit.id,
                propertyId: destUnit.propertyId,
                ownerId: targetOwnerId,
                organizationId: tenant.organizationId || null,
                organizationName: tenant.organizationName || null,
                amount: diff,
                description: `Rent difference for upgrading from Unit ${formerUnit.label} ($${formerRent}/mo) to Unit ${destUnit.label} ($${destRent}/mo).`,
                status: 'unpaid',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              });

              await tx.update(schema.units)
                .set({ arrears: targetArrears + diff })
                .where(eq(schema.units.id, destUnit.id));
            }

            // Realtime Notification
            await this.realtimeService.sendNotification(
              body.tenantId,
              'Unit Reassigned!',
              `You have been moved to Unit ${destUnit.label}. Your lease, arrears, and unpaid invoices have been transferred.${diffInvoiceCode ? ` An upgrade invoice ${diffInvoiceCode} has been generated for the rent difference.` : ''}`,
              `/tenant/payments`,
              true
            );
          } else {
            // First time assigning a tenant to a unit (unassigned tenant)
            await tx.update(schema.units)
              .set({ tenantId: body.tenantId, status: 'occupied' })
              .where(eq(schema.units.id, destUnit.id));

            await tx.insert(schema.leases).values({
              id: 'lease-' + Math.random().toString(36).substring(2, 9),
              tenantId: body.tenantId,
              propertyId: destUnit.propertyId,
              unitId: destUnit.id,
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              status: 'active',
            });

            await this.realtimeService.sendNotification(
              body.tenantId,
              'Unit Assigned!',
              `You have been assigned to Unit ${destUnit.label}.`,
              `/tenant/payments`,
              true
            );
          }

          // Audit Log
          await tx.insert(schema.auditLogs).values({
            id: 'audit-' + Math.random().toString(36).substring(2, 9),
            ownerId: targetOwnerId,
            actorName: req.user.name || 'Owner',
            actorEmail: req.user.email,
            actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            categoryIconName: 'UserCheck',
            categoryLabel: 'Tenants',
            description: `Moved tenant "${tenant.name}" to property "${destUnit.propertyName}" Unit ${destUnit.label}.`,
            severity: 'info',
            status: 'success',
            ip: req.ip || 'Unknown',
            location: 'Unknown',
          });

          return {
            success: true,
            message: `Tenant ${tenant.name} moved to Unit ${destUnit.label} successfully.`
          };
        }
      });
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to move tenant: ${err.message}`);
    }
  }

  @Post('tenant/leave/confirm')
  async confirmLeave(@Req() req: any, @Body() body: { userId?: string; code: string }) {
    if (!body.code) {
      throw new BadRequestException('code is required.');
    }
    const callerId = req.user.id;
    const callerRole = req.user.role;
    
    const targetUserId = body.userId || callerId;
    if (callerRole === 'tenant' && targetUserId !== callerId) {
      throw new BadRequestException('Access denied.');
    }

    try {
      const verificationId = `leave-${targetUserId}`;
      const record = await this.db.select().from(schema.verifications).where(eq(schema.verifications.id, verificationId)).limit(1);
      
      if (record.length === 0 || record[0].value !== body.code.toUpperCase().trim()) {
        throw new BadRequestException('Invalid verification code.');
      }
      
      if (record[0].expiresAt < new Date()) {
        throw new BadRequestException('Verification code has expired.');
      }

      await this.db.transaction(async (tx: any) => {
        await tx.update(schema.units)
          .set({ tenantId: null, status: 'vacant' })
          .where(eq(schema.units.tenantId, targetUserId));

        await tx.update(schema.users)
          .set({ leaseStart: null, leaseEnd: null })
          .where(eq(schema.users.id, targetUserId));

        await tx.update(schema.leases)
          .set({ status: 'ended', endDate: new Date() })
          .where(and(eq(schema.leases.tenantId, targetUserId), eq(schema.leases.status, 'active')));

        await tx.delete(schema.verifications).where(eq(schema.verifications.id, verificationId));
      });

      return { success: true };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to confirm leave: ${err.message}`);
    }
  }

  @Post('tenants/:tenantId/email')
  async sendTenantEmail(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: { subject: string; message: string }
  ) {
    if (req.user.role === 'tenant') {
      throw new BadRequestException('Access denied.');
    }
    if (!body.subject || !body.message) {
      throw new BadRequestException('subject and message are required.');
    }

    try {
      const tUser = await this.db.select().from(schema.users).where(eq(schema.users.id, tenantId)).limit(1);
      if (tUser.length === 0) {
        throw new BadRequestException('Tenant not found.');
      }
      
      const tenant = tUser[0];
      const senderName = req.user.name || 'Property Manager';
      const senderOrg = req.user.organizationName || 'Dane Properties';

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #f43f5e; font-size: 18px; font-weight: bold; margin-bottom: 16px;">Notice from ${senderOrg}</h2>
          <p style="font-size: 14px; color: #1f2937; white-space: pre-wrap; line-height: 1.5; margin-bottom: 24px;">
            ${body.message}
          </p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; line-height: 1.4;">
            Best regards,<br/>
            <strong>${senderName}</strong><br/>
            ${senderOrg} Management Team
          </p>
        </div>
      `;

      await this.emailService.sendEmail(tenant.email, body.subject, emailHtml);
      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to send email notice: ${err.message}`);
    }
  }

  @Post('tenants/add-direct')
  async addDirectTenant(
    @Req() req: any,
    @Body() body: {
      unitId: string;
      name: string;
      email: string;
      phone: string;
      idNumber?: string;
      moveInDate?: string;
      arrears?: number;
      kins?: Array<{ name: string; relation: string; phone: string }>;
      deposit?: number;
      createInvoices?: boolean;
    }
  ) {
    const db = this.db;
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied. Tenants cannot add other tenants.');
    }

    if (!body.unitId || !body.name || !body.email || !body.phone) {
      throw new BadRequestException('unitId, name, email, and phone are required.');
    }

    try {
      return await db.transaction(async (tx: any) => {
        // 1. Verify unit exists and is vacant
        const unitList = await tx
          .select()
          .from(schema.units)
          .where(eq(schema.units.id, body.unitId))
          .limit(1);

        if (unitList.length === 0) {
          throw new BadRequestException('Unit not found.');
        }

        const unit = unitList[0];
        if (unit.status !== 'vacant') {
          throw new BadRequestException('Unit is not vacant.');
        }

        // 2. Find or create the user
        let tenantUser = null;
        const normalizedEmail = body.email.toLowerCase().trim();
        const userList = await tx
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, normalizedEmail))
          .limit(1);

        if (userList.length > 0) {
          tenantUser = userList[0];
          // update user details
          await tx
            .update(schema.users)
            .set({
              name: body.name,
              phone: body.phone,
              idNumber: body.idNumber || tenantUser.idNumber,
              kinDetails: body.kins || tenantUser.kinDetails,
            })
            .where(eq(schema.users.id, tenantUser.id));
        } else {
          const newUserId = 'usr-' + Math.random().toString(36).substring(2, 9);
          await tx.insert(schema.users).values({
            id: newUserId,
            email: normalizedEmail,
            name: body.name,
            phone: body.phone,
            role: 'tenant',
            idNumber: body.idNumber || null,
            kinDetails: body.kins || null,
          });
          tenantUser = { id: newUserId, email: normalizedEmail, name: body.name };
        }

        // 3. Update unit fields
        // Calculate the target arrears. Start with body.arrears (default 0).
        let targetArrears = Number(body.arrears || 0);

        // If createInvoices is true, we will generate invoices.
        // Unpaid invoices are added to the unit arrears.
        if (body.createInvoices) {
          if (body.deposit !== undefined && Number(body.deposit) > 0) {
            targetArrears += Number(body.deposit);
          }
          if (Number(unit.rent) > 0) {
            targetArrears += Number(unit.rent);
          }
          if (Number(unit.moveInFees) > 0) {
            targetArrears += Number(unit.moveInFees);
          }
          if (Number(unit.recurringFees) > 0) {
            targetArrears += Number(unit.recurringFees);
          }
        }

        const depositVal = body.deposit !== undefined ? Number(body.deposit) : Number(unit.rent || 0);

        await tx
          .update(schema.units)
          .set({
            tenantId: tenantUser.id,
            status: 'occupied',
            arrears: targetArrears,
            deposit: depositVal,
          })
          .where(eq(schema.units.id, unit.id));

        // 4. Create active lease
        await tx.insert(schema.leases).values({
          id: 'lease-' + Math.random().toString(36).substring(2, 9),
          tenantId: tenantUser.id,
          propertyId: unit.propertyId,
          unitId: unit.id,
          startDate: body.moveInDate ? new Date(body.moveInDate) : new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: 'active',
        });

        // 5. Generate invoices
        const orgId = req.user.organizationId || null;
        const orgName = req.user.organizationName || 'Dane Properties';
        const invoiceDueDate = body.moveInDate ? new Date(body.moveInDate) : new Date();

        // 5.1 If starting arrears > 0, generate an Arrears invoice
        if (Number(body.arrears || 0) > 0) {
          const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
          const invNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
          await tx.insert(schema.invoices).values({
            id: invId,
            invoiceNumber: invNum,
            type: 'Arrears',
            tenantId: tenantUser.id,
            tenantEmail: normalizedEmail,
            tenantName: body.name,
            unitId: unit.id,
            propertyId: unit.propertyId,
            ownerId: callerId,
            organizationId: orgId,
            organizationName: orgName,
            amount: Number(body.arrears),
            description: 'Outstanding arrears balance imported on tenant move-in',
            status: 'unpaid',
            dueDate: invoiceDueDate,
          });
        }

        // 5.2 If createInvoices is true, generate invoices for deposit, rent, etc.
        if (body.createInvoices) {
          if (body.deposit !== undefined && Number(body.deposit) > 0) {
            const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
            const invNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
            await tx.insert(schema.invoices).values({
              id: invId,
              invoiceNumber: invNum,
              type: 'Deposit',
              tenantId: tenantUser.id,
              tenantEmail: normalizedEmail,
              tenantName: body.name,
              unitId: unit.id,
              propertyId: unit.propertyId,
              ownerId: callerId,
              organizationId: orgId,
              organizationName: orgName,
              amount: Number(body.deposit),
              description: 'Security Deposit',
              status: 'unpaid',
              dueDate: invoiceDueDate,
            });
          }
          if (Number(unit.rent) > 0) {
            const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
            const invNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
            await tx.insert(schema.invoices).values({
              id: invId,
              invoiceNumber: invNum,
              type: 'Rent',
              tenantId: tenantUser.id,
              tenantEmail: normalizedEmail,
              tenantName: body.name,
              unitId: unit.id,
              propertyId: unit.propertyId,
              ownerId: callerId,
              organizationId: orgId,
              organizationName: orgName,
              amount: Number(unit.rent),
              description: 'First Month Rent',
              status: 'unpaid',
              dueDate: invoiceDueDate,
            });
          }
          if (Number(unit.moveInFees) > 0) {
            const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
            const invNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
            await tx.insert(schema.invoices).values({
              id: invId,
              invoiceNumber: invNum,
              type: 'Fee',
              tenantId: tenantUser.id,
              tenantEmail: normalizedEmail,
              tenantName: body.name,
              unitId: unit.id,
              propertyId: unit.propertyId,
              ownerId: callerId,
              organizationId: orgId,
              organizationName: orgName,
              amount: Number(unit.moveInFees),
              description: 'Move-in Fees',
              status: 'unpaid',
              dueDate: invoiceDueDate,
            });
          }
          if (Number(unit.recurringFees) > 0) {
            const invId = 'inv-' + Math.random().toString(36).substring(2, 9);
            const invNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
            await tx.insert(schema.invoices).values({
              id: invId,
              invoiceNumber: invNum,
              type: 'Fee',
              tenantId: tenantUser.id,
              tenantEmail: normalizedEmail,
              tenantName: body.name,
              unitId: unit.id,
              propertyId: unit.propertyId,
              ownerId: callerId,
              organizationId: orgId,
              organizationName: orgName,
              amount: Number(unit.recurringFees),
              description: 'First Month Recurring Fees',
              status: 'unpaid',
              dueDate: invoiceDueDate,
            });
          }
        }

        // 6. Audit Log
        await tx.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: callerId,
          actorName: req.user.name || 'Owner',
          actorEmail: req.user.email,
          actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          categoryIconName: 'UserCheck',
          categoryLabel: 'Tenants',
          description: `Directly added tenant "${body.name}" and assigned to Unit ${unit.label}.`,
          severity: 'info',
          status: 'success',
          ip: req.ip || 'Unknown',
          location: 'Unknown',
        });

        return {
          success: true,
          message: `Successfully added and assigned tenant ${body.name} to Unit ${unit.label}.`,
        };
      });
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to add tenant: ${err.message}`);
    }
  }
}
