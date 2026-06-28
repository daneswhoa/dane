import { Controller, Get, Post, Body, Param, Req, InternalServerErrorException, UseGuards, BadRequestException, Inject, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from './db/schema';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';

@Controller('dashboard')
@UseGuards(SessionGuard)
export class PropertiesController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  @Get('properties')
  async getProperties(@Req() req: any) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied. Tenants cannot view property lists.');
    }

    let targetOwnerId = callerId;
    if (callerRole !== 'manager') {
      const relation = await this.db
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.managerId, callerId))
        .limit(1);
      if (relation.length > 0) {
        targetOwnerId = relation[0].ownerId;
      }
    }

    try {
      let list = await this.db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.ownerId, targetOwnerId))
        .orderBy(desc(schema.properties.createdAt));

      if (callerRole !== 'manager' && req.user.allowedProperties && req.user.allowedProperties !== 'all') {
        const allowedIds = req.user.allowedProperties.split(',');
        list = list.filter((p: any) => allowedIds.includes(p.id));
      }

      const allUnits = await this.db
        .select({
          propertyId: schema.units.propertyId,
          rent: schema.units.rent,
          status: schema.units.status
        })
        .from(schema.units)
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(eq(schema.properties.ownerId, targetOwnerId));

      const unitsByProp = allUnits.reduce((acc: any, u: any) => {
        if (!acc[u.propertyId]) acc[u.propertyId] = [];
        acc[u.propertyId].push(u);
        return acc;
      }, {} as Record<string, typeof allUnits>);

      return list.map((prop: any) => {
        const pUnits = unitsByProp[prop.id] || [];
        const totalRent = pUnits.reduce((sum: number, u: any) => sum + (Number(u.rent) || 0), 0);
        const avgRent = pUnits.length > 0 ? Math.round(totalRent / pUnits.length) : 0;
        const occupiedCount = pUnits.filter((u: any) => u.status === 'occupied').length;
        const occupancyRate = pUnits.length > 0 ? Math.round((occupiedCount / pUnits.length) * 100) : (prop.unitsCount > 0 ? 0 : 100);

        return {
          id: prop.id,
          name: prop.name,
          address: prop.address || 'No Address',
          type: 'Multi-Family',
          avgRent: `$${avgRent.toLocaleString()}/mo Avg`,
          image: prop.photoUrl || (prop.unitsCount > 1 ? '/default_apartment.png' : '/default_house.png'),
          units: prop.unitsCount || 0,
          occupancy: `${occupancyRate}%`,
          tickets: 0,
          status: prop.status || 'active',
        };
      });
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve properties: ${err.message}`);
    }
  }

  @Post('properties/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPropertyPhoto(
    @Req() req: any,
    @UploadedFile() file: any
  ) {
    const callerRole = req.user.role;
    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const bucketName = process.env.GCS_BUCKET_NAME || 'landlordnl-assets';
    let photoUrl = '';

    try {
      const { Storage } = require('@google-cloud/storage');
      let storage;
      if (process.env.GCP_CREDENTIALS) {
        try {
          storage = new Storage({ credentials: JSON.parse(process.env.GCP_CREDENTIALS) });
        } catch (e) {
          console.error('Failed to parse GCS credentials from GCP_CREDENTIALS env:', e);
          storage = new Storage();
        }
      } else {
        storage = new Storage();
      }
      const bucket = storage.bucket(bucketName);
      const fileName = `properties/${req.user.id}-${Date.now()}-${file.originalname}`;
      const blob = bucket.file(fileName);
      
      await blob.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
      });
      
      photoUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    } catch (error) {
      console.log('GCS Upload Error (falling back to local storage):', error);
      try {
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
        console.log(`[Photo Upload Fallback] Target local directory: ${uploadsDir}`);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        // Normalize filename to prevent special character issues in URL pathing
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const localFileName = `${req.user.id}-${Date.now()}-${safeName}`;
        const localFilePath = path.join(uploadsDir, localFileName);
        
        fs.writeFileSync(localFilePath, file.buffer);
        console.log(`[Photo Upload Fallback] Successfully saved file locally at: ${localFilePath}`);
        
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:4000';
        photoUrl = `${protocol}://${host}/uploads/${localFileName}`;
        console.log(`[Photo Upload Fallback] Generated local photoUrl: ${photoUrl}`);
      } catch (fsErr) {
        console.error('Failed to write file locally:', fsErr);
        throw new InternalServerErrorException('Photo upload failed on both cloud and local fallback.');
      }
    }

    return { success: true, photoUrl };
  }

  @Post('properties')
  async createProperty(@Req() req: any, @Body() body: { name: string, address: string, photoUrl?: string, unitsCount?: number }) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied. Tenants cannot add properties.');
    }

    if (!body.name || !body.address) {
      throw new BadRequestException('Name and address are required.');
    }

    try {
      const propertyId = 'prop-' + Math.random().toString(36).substring(2, 9);
      await this.db.insert(schema.properties).values({
        id: propertyId,
        name: body.name,
        address: body.address,
        ownerId: callerId,
        unitsCount: body.unitsCount || 1,
        status: 'pending',
        photoUrl: body.photoUrl || null,
      });

      // Insert audit log
      await this.db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: callerId,
        actorName: req.user.name || 'Owner',
        actorEmail: req.user.email,
        actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        categoryIconName: 'Building2',
        categoryLabel: 'Properties',
        description: `Added pending property "${body.name}" at ${body.address}.`,
        severity: 'info',
        status: 'success',
        ip: req.ip || 'Unknown',
        location: 'Unknown',
      });

      return { success: true, propertyId };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to create property: ${err.message}`);
    }
  }

  @Get('properties/:id')
  async getProperty(@Req() req: any, @Param('id') id: string) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    try {
      const prop = await this.db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.id, id))
        .limit(1);

      if (prop.length === 0) {
        throw new BadRequestException('Property not found.');
      }

      // Fetch units matching this property
      const propUnits = await this.db
        .select({
          id: schema.units.id,
          label: schema.units.label,
          rent: schema.units.rent,
          status: schema.units.status,
          tenantId: schema.units.tenantId,
          tenantName: schema.users.name,
          tenantEmail: schema.users.email,
        })
        .from(schema.units)
        .leftJoin(schema.users, eq(schema.units.tenantId, schema.users.id))
        .where(eq(schema.units.propertyId, id));

      return {
        property: prop[0],
        units: propUnits,
      };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve property: ${err.message}`);
    }
  }

  @Post('properties/:id/setup')
  async setupProperty(
    @Req() req: any, 
    @Param('id') id: string, 
    @Body() payload: { 
      units: any[],
      feeSettings: Record<string, { deposit: number, moveInFees: any[], recurringFees: any[] }>,
      propertySettings: { rentDueDate: number, lateFeePenalty: number },
      teamAccess: string[] 
    }
  ) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    try {
      // 1. Verify property exists
      const propList = await this.db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.id, id))
        .limit(1);

      if (propList.length === 0) {
        throw new BadRequestException('Property not found.');
      }

      const property = propList[0];

      // 2. Insert units & handle tenants
      for (const unit of payload.units) {
        const unitId = 'unit-' + Math.random().toString(36).substring(2, 9);
        let tenantUserId: string | null = null;
        
        const uType = unit.unitType?.trim() || 'Standard';
        const feeData = payload.feeSettings?.[uType] || { deposit: 0, moveInFees: [], recurringFees: [] };
        const depositAmt = Number(feeData.deposit) || 0;
        const totalRecurring = feeData.recurringFees.reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
        const totalMoveIn = feeData.moveInFees.reduce((sum: number, f: any) => sum + (Number(f.amount) || 0), 0);
        const recurringFeeDetailsStr = JSON.stringify(feeData.recurringFees);
        const moveInFeeDetailsStr = JSON.stringify(feeData.moveInFees);

        if (unit.status === 'occupied' && unit.tenantName) {
          const tenantEmailStr = unit.tenantEmail?.toLowerCase().trim() || `tenant-${unitId}@landlord.nl`;
          
          // Check if user already exists
          const existingUser = await this.db
            .select({ id: schema.users.id })
            .from(schema.users)
            .where(eq(schema.users.email, tenantEmailStr))
            .limit(1);

          if (existingUser.length > 0) {
            tenantUserId = existingUser[0].id;
          } else {
            tenantUserId = 'user-' + Math.random().toString(36).substring(2, 9);
            const kinDetailsObj = unit.kinDetails && unit.kinDetails.length > 0 
              ? (typeof unit.kinDetails === 'string' ? JSON.parse(unit.kinDetails) : unit.kinDetails)
              : null;
            await this.db.insert(schema.users).values({
              id: tenantUserId,
              name: unit.tenantName,
              email: tenantEmailStr,
              role: 'tenant',
              phone: unit.tenantPhone || null,
              leaseStart: unit.leaseStart ? new Date(unit.leaseStart) : null,
              leaseEnd: unit.leaseEnd ? new Date(unit.leaseEnd) : null,
              kinDetails: kinDetailsObj,
            });
          }
        }

        // Insert the unit first to satisfy foreign key constraints
        await this.db.insert(schema.units).values({
          id: unitId,
          propertyId: id,
          label: unit.label || 'Unit',
          rent: Number(unit.rent) || 0,
          status: unit.status || 'vacant',
          tenantId: tenantUserId,
          deposit: depositAmt,
          recurringFees: totalRecurring,
          moveInFees: totalMoveIn,
          recurringFeeDetails: recurringFeeDetailsStr,
          moveInFeeDetails: moveInFeeDetailsStr,
          floor: unit.floor ? String(unit.floor) : null,
          unitType: uType,
          arrears: Number(unit.arrears) || 0,
        });

        // Insert lease record if occupied
        if (unit.status === 'occupied' && tenantUserId) {
          const lStart = unit.leaseStart ? new Date(unit.leaseStart) : new Date();
          const lEnd = unit.leaseEnd ? new Date(unit.leaseEnd) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          
          await this.db.update(schema.users).set({
            leaseStart: lStart,
            leaseEnd: lEnd,
          }).where(eq(schema.users.id, tenantUserId));

          const leaseId = 'lease-' + Math.random().toString(36).substring(2, 9);
          await this.db.insert(schema.leases).values({
            id: leaseId,
            tenantId: tenantUserId,
            propertyId: id,
            unitId: unitId,
            startDate: lStart,
            endDate: lEnd,
            status: 'active',
          });
        }

        // Now if occupied, insert the invoices that reference the unit
        if (unit.status === 'occupied' && tenantUserId) {
          const tenantEmailStr = unit.tenantEmail?.toLowerCase().trim() || `tenant-${unitId}@landlord.nl`;
          const invoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
          
          let invoiceDescription = `Rent: $${Number(unit.rent)}\n`;
          if (feeData.recurringFees.length > 0) {
            feeData.recurringFees.forEach((f: any) => {
              invoiceDescription += `${f.name}: $${f.amount}\n`;
            });
          }
          if (depositAmt > 0) {
            invoiceDescription += `Security Deposit: $${depositAmt}\n`;
          }
          if (feeData.moveInFees.length > 0) {
            invoiceDescription += `\n--- Move-in Fees ---\n`;
            feeData.moveInFees.forEach((f: any) => {
              invoiceDescription += `${f.name}: $${f.amount}\n`;
            });
          }
          const totalInvoiceAmount = Number(unit.rent) + totalRecurring + totalMoveIn + depositAmt;

          await this.db.insert(schema.invoices).values({
            id: invoiceId,
            invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000).toString(),
            tenantId: tenantUserId,
            tenantEmail: tenantEmailStr,
            tenantName: unit.tenantName,
            propertyId: id,
            unitId: unitId,
            ownerId: callerId,
            amount: totalInvoiceAmount,
            type: 'Rent & Initial Fees',
            status: 'PENDING',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            description: invoiceDescription.trim(),
          });

          // Create invoice for carried-over arrears if they exist
          if (Number(unit.arrears) > 0) {
            const arrearsInvoiceId = 'inv-' + Math.random().toString(36).substring(2, 9);
            await this.db.insert(schema.invoices).values({
              id: arrearsInvoiceId,
              invoiceNumber: 'ARR-' + Math.floor(100000 + Math.random() * 900000).toString(),
              tenantId: tenantUserId,
              tenantEmail: tenantEmailStr,
              tenantName: unit.tenantName,
              propertyId: id,
              unitId: unitId,
              ownerId: callerId,
              amount: Number(unit.arrears),
              type: 'Arrears',
              status: 'PENDING',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              description: 'Initial carried-over arrears balance on setup.',
            });
          }
        }
      }

      // 3. Update team access permissions
      if (Array.isArray(payload.teamAccess) && payload.teamAccess.length > 0) {
        for (const memberId of payload.teamAccess) {
          const memberList = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, memberId))
            .limit(1);

          if (memberList.length > 0) {
            const member = memberList[0];
            let newAllowed: string;
            
            if (!member.allowedProperties || member.allowedProperties === 'all') {
              newAllowed = id;
            } else {
              const currentArr = member.allowedProperties.split(',');
              if (!currentArr.includes(id)) {
                currentArr.push(id);
              }
              newAllowed = currentArr.join(',');
            }

            await this.db
              .update(schema.users)
              .set({ allowedProperties: newAllowed })
              .where(eq(schema.users.id, memberId));
          }
        }
      }

      // 4. Update property status & settings
      await this.db
        .update(schema.properties)
        .set({ 
          status: 'active',
          unitsCount: payload.units.length,
          settings: JSON.stringify(payload.propertySettings)
        })
        .where(eq(schema.properties.id, id));

      // 5. Audit Log setup action
      await this.db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: callerId,
        actorName: req.user.name || 'Owner',
        actorEmail: req.user.email,
        actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        categoryIconName: 'Building2',
        categoryLabel: 'Properties',
        description: `Completed setup for property "${property.name}" with ${payload.units.length} units configured.`,
        severity: 'info',
        status: 'success',
        ip: req.ip || 'Unknown',
        location: 'Unknown',
      });

      return { success: true };
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to complete setup: ${err.message}`);
    }
  }

  @Get('units')
  async getUnits(@Req() req: any) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied. Tenants cannot view units.');
    }

    let targetOwnerId = callerId;
    if (callerRole !== 'manager') {
      const relation = await this.db
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.managerId, callerId))
        .limit(1);
      if (relation.length > 0) {
        targetOwnerId = relation[0].ownerId;
      }
    }

    try {
      let list = await this.db
        .select({
          id: schema.units.id,
          propertyId: schema.units.propertyId,
          label: schema.units.label,
          status: schema.units.status,
          tenantId: schema.units.tenantId,
          tenantName: schema.users.name,
          tenantEmail: schema.users.email,
          propertyName: schema.properties.name,
        })
        .from(schema.units)
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .leftJoin(schema.users, eq(schema.units.tenantId, schema.users.id))
        .where(eq(schema.properties.ownerId, targetOwnerId));

      if (callerRole !== 'manager' && req.user.allowedProperties && req.user.allowedProperties !== 'all') {
        const allowedIds = req.user.allowedProperties.split(',');
        list = list.filter((u: any) => allowedIds.includes(u.propertyId));
      }

      return list;
    } catch (err: any) {
      throw new InternalServerErrorException(`Failed to retrieve units: ${err.message}`);
    }
  }

  @Post('properties/:id/update')
  async updateProperty(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; address?: string; photoUrl?: string }
  ) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    try {
      const propList = await this.db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.id, id))
        .limit(1);

      if (propList.length === 0) {
        throw new BadRequestException('Property not found.');
      }

      const property = propList[0];
      
      let targetOwnerId = callerId;
      if (callerRole !== 'manager') {
        const relation = await this.db
          .select()
          .from(schema.managerRelations)
          .where(eq(schema.managerRelations.managerId, callerId))
          .limit(1);
        if (relation.length > 0) {
          targetOwnerId = relation[0].ownerId;
        }
      }

      if (property.ownerId !== targetOwnerId) {
        throw new BadRequestException('Access denied. You do not manage this property.');
      }

      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl;

      if (Object.keys(updateData).length > 0) {
        await this.db
          .update(schema.properties)
          .set(updateData)
          .where(eq(schema.properties.id, id));

        await this.db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: targetOwnerId,
          actorName: req.user.name || 'Owner',
          actorEmail: req.user.email,
          actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          categoryIconName: 'Building2',
          categoryLabel: 'Properties',
          description: `Updated details for property "${body.name || property.name}".`,
          severity: 'info',
          status: 'success',
          ip: req.ip || 'Unknown',
          location: 'Unknown',
        });
      }

      return { success: true };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to update property: ${err.message}`);
    }
  }

  @Post('properties/:id/adjust-rent')
  async adjustRent(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { percentage?: number; amount?: number }
  ) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    if (body.percentage === undefined && body.amount === undefined) {
      throw new BadRequestException('Either percentage or amount must be specified.');
    }

    try {
      const propList = await this.db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.id, id))
        .limit(1);

      if (propList.length === 0) {
        throw new BadRequestException('Property not found.');
      }

      const property = propList[0];
      
      let targetOwnerId = callerId;
      if (callerRole !== 'manager') {
        const relation = await this.db
          .select()
          .from(schema.managerRelations)
          .where(eq(schema.managerRelations.managerId, callerId))
          .limit(1);
        if (relation.length > 0) {
          targetOwnerId = relation[0].ownerId;
        }
      }

      if (property.ownerId !== targetOwnerId) {
        throw new BadRequestException('Access denied. You do not manage this property.');
      }

      const propUnits = await this.db
        .select()
        .from(schema.units)
        .where(eq(schema.units.propertyId, id));

      let adjustmentCount = 0;
      await this.db.transaction(async (tx: any) => {
        for (const unit of propUnits) {
          let currentRent = Number(unit.rent) || 0;
          let newRent = currentRent;

          if (body.percentage !== undefined) {
            newRent = Math.round(currentRent * (1 + body.percentage / 100));
          } else if (body.amount !== undefined) {
            newRent = currentRent + body.amount;
          }

          if (newRent < 0) newRent = 0;

          await tx
            .update(schema.units)
            .set({ rent: newRent })
            .where(eq(schema.units.id, unit.id));
            
          adjustmentCount++;
        }

        const descStr = body.percentage !== undefined
          ? `Adjusted rent for property "${property.name}" by ${body.percentage}% across ${adjustmentCount} units.`
          : `Adjusted rent for property "${property.name}" by $${body.amount} across ${adjustmentCount} units.`;

        await tx.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: targetOwnerId,
          actorName: req.user.name || 'Owner',
          actorEmail: req.user.email,
          actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          categoryIconName: 'DollarSign',
          categoryLabel: 'Finance',
          description: descStr,
          severity: 'info',
          status: 'success',
          ip: req.ip || 'Unknown',
          location: 'Unknown',
        });
      });

      return { success: true, adjustedUnits: adjustmentCount };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to adjust rent: ${err.message}`);
    }
  }

  @Post('units/:id/update')
  async updateUnit(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { rent?: number; status?: string; label?: string; deposit?: number }
  ) {
    const callerId = req.user.id;
    const callerRole = req.user.role;

    if (callerRole === 'tenant') {
      throw new BadRequestException('Access denied.');
    }

    try {
      const unitList = await this.db
        .select({
          id: schema.units.id,
          label: schema.units.label,
          propertyId: schema.units.propertyId,
          rent: schema.units.rent,
          status: schema.units.status,
          tenantId: schema.units.tenantId,
          propertyName: schema.properties.name,
          ownerId: schema.properties.ownerId,
        })
        .from(schema.units)
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(eq(schema.units.id, id))
        .limit(1);

      if (unitList.length === 0) {
        throw new BadRequestException('Unit not found.');
      }

      const unit = unitList[0];

      let targetOwnerId = callerId;
      if (callerRole !== 'manager') {
        const relation = await this.db
          .select()
          .from(schema.managerRelations)
          .where(eq(schema.managerRelations.managerId, callerId))
          .limit(1);
        if (relation.length > 0) {
          targetOwnerId = relation[0].ownerId;
        }
      }

      if (unit.ownerId !== targetOwnerId) {
        throw new BadRequestException('Access denied. You do not manage the property of this unit.');
      }

      const updateData: any = {};
      if (body.rent !== undefined) updateData.rent = body.rent;
      if (body.label !== undefined) updateData.label = body.label;
      if (body.deposit !== undefined) updateData.deposit = body.deposit;
      if (body.status !== undefined) {
        updateData.status = body.status;
        if (body.status === 'vacant') {
          updateData.tenantId = null;
        }
      }

      await this.db
        .update(schema.units)
        .set(updateData)
        .where(eq(schema.units.id, id));

      await this.db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: targetOwnerId,
        actorName: req.user.name || 'Owner',
        actorEmail: req.user.email,
        actorInitials: (req.user.name || 'OW').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        categoryIconName: 'Home',
        categoryLabel: 'Properties',
        description: `Updated unit "${body.label || unit.label}" of property "${unit.propertyName}".`,
        severity: 'info',
        status: 'success',
        ip: req.ip || 'Unknown',
        location: 'Unknown',
      });

      return { success: true };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to update unit: ${err.message}`);
    }
  }
}
