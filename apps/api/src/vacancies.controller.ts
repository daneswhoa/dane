import { Controller, Get, Post, Body, Inject, Param, BadRequestException } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import * as schema from './db/schema';
import { DATABASE_CONNECTION } from './db/database.module';
import { randomUUID } from 'crypto';

@Controller('vacancies')
export class VacanciesController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  @Get()
  async getVacancies() {
    try {
      // Fetch all units where isListed = true, joined with properties
      const list = await this.db
        .select({
          unitId: schema.units.id,
          label: schema.units.label,
          rent: schema.units.rent,
          deposit: schema.units.deposit,
          moveInFees: schema.units.moveInFees,
          moveInFeeDetails: schema.units.moveInFeeDetails,
          recurringFees: schema.units.recurringFees,
          recurringFeeDetails: schema.units.recurringFeeDetails,
          images: schema.units.images,
          floor: schema.units.floor,
          unitType: schema.units.unitType,
          propertyId: schema.properties.id,
          propertyName: schema.properties.name,
          propertyAddress: schema.properties.address,
          county: schema.properties.county,
          subcounty: schema.properties.subcounty,
          latitude: schema.properties.latitude,
          longitude: schema.properties.longitude,
          amenities: schema.properties.amenities,
          rules: schema.properties.rules,
          ownerId: schema.properties.ownerId,
        })
        .from(schema.units)
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(eq(schema.units.isListed, true));

      const ownerIds = Array.from(new Set(list.map((u: any) => u.ownerId).filter(Boolean))) as string[];
      const owners = (ownerIds.length > 0
        ? await this.db.select().from(schema.users).where(inArray(schema.users.id, ownerIds))
        : []) as any[];

      const ownerMap = new Map<string, any>(owners.map((o: any) => [o.id, o]));

      return list.map((u: any) => {
        const owner = ownerMap.get(u.ownerId);
        
        // Parse amenities and rules if they are JSON strings
        let parsedAmenities: string[] = [];
        let parsedRules: string[] = [];
        try {
          if (u.amenities) {
            parsedAmenities = typeof u.amenities === 'string' ? JSON.parse(u.amenities) : u.amenities;
          }
        } catch (e) {
          parsedAmenities = typeof u.amenities === 'string' ? u.amenities.split(',').map((a: string) => a.trim()) : [];
        }

        try {
          if (u.rules) {
            parsedRules = typeof u.rules === 'string' ? JSON.parse(u.rules) : u.rules;
          }
        } catch (e) {
          parsedRules = typeof u.rules === 'string' ? u.rules.split(',').map((r: string) => r.trim()) : [];
        }

        // Parse images
        let imagesList: string[] = [];
        if (u.images) {
          try {
            imagesList = JSON.parse(u.images);
          } catch (e) {
            imagesList = u.images.split(',').map((img: string) => img.trim());
          }
        }

        return {
          id: u.unitId,
          unitId: u.unitId,
          label: u.label,
          rent: Number(u.rent || 0),
          deposit: Number(u.deposit || 0),
          moveInFees: Number(u.moveInFees || 0),
          moveInFeeDetails: u.moveInFeeDetails || '',
          recurringFees: Number(u.recurringFees || 0),
          recurringFeeDetails: u.recurringFeeDetails || '',
          images: imagesList,
          floor: u.floor || 'G',
          unitType: u.unitType || 'Standard',
          propertyId: u.propertyId,
          propertyName: u.propertyName,
          propertyAddress: u.propertyAddress,
          county: u.county || '',
          subcounty: u.subcounty || '',
          latitude: u.latitude ? Number(u.latitude) : 0,
          longitude: u.longitude ? Number(u.longitude) : 0,
          amenities: parsedAmenities,
          rules: parsedRules,
          agent: {
            name: owner?.name || 'Landlord.nl Resident Team',
            email: owner?.email || 'support@landlord.nl',
            phone: owner?.phone || '+31 20 123 4567',
            image: owner?.image || '',
          }
        };
      });
    } catch (error: any) {
      throw new BadRequestException(`Failed to retrieve vacancies: ${error.message}`);
    }
  }

  @Get(':id')
  async getVacancy(@Param('id') id: string) {
    try {
      const list = await this.db
        .select({
          unitId: schema.units.id,
          label: schema.units.label,
          rent: schema.units.rent,
          deposit: schema.units.deposit,
          moveInFees: schema.units.moveInFees,
          moveInFeeDetails: schema.units.moveInFeeDetails,
          recurringFees: schema.units.recurringFees,
          recurringFeeDetails: schema.units.recurringFeeDetails,
          images: schema.units.images,
          floor: schema.units.floor,
          unitType: schema.units.unitType,
          propertyId: schema.properties.id,
          propertyName: schema.properties.name,
          propertyAddress: schema.properties.address,
          county: schema.properties.county,
          subcounty: schema.properties.subcounty,
          latitude: schema.properties.latitude,
          longitude: schema.properties.longitude,
          amenities: schema.properties.amenities,
          rules: schema.properties.rules,
          ownerId: schema.properties.ownerId,
        })
        .from(schema.units)
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(eq(schema.units.id, id))
        .limit(1);

      if (list.length === 0) {
        throw new BadRequestException('Vacancy not found.');
      }

      const u = list[0];
      const ownerIds = [u.ownerId].filter(Boolean) as string[];
      const owners = (ownerIds.length > 0
        ? await this.db.select().from(schema.users).where(inArray(schema.users.id, ownerIds))
        : []) as any[];

      const owner = owners[0];

      let parsedAmenities: string[] = [];
      let parsedRules: string[] = [];
      try {
        if (u.amenities) {
          parsedAmenities = typeof u.amenities === 'string' ? JSON.parse(u.amenities) : u.amenities;
        }
      } catch (e) {
        parsedAmenities = typeof u.amenities === 'string' ? u.amenities.split(',').map((a: string) => a.trim()) : [];
      }

      try {
        if (u.rules) {
          parsedRules = typeof u.rules === 'string' ? JSON.parse(u.rules) : u.rules;
        }
      } catch (e) {
        parsedRules = typeof u.rules === 'string' ? u.rules.split(',').map((r: string) => r.trim()) : [];
      }

      let imagesList: string[] = [];
      if (u.images) {
        try {
          imagesList = JSON.parse(u.images);
        } catch (e) {
          imagesList = u.images.split(',').map((img: string) => img.trim());
        }
      }

      return {
        id: u.unitId,
        unitId: u.unitId,
        label: u.label,
        rent: Number(u.rent || 0),
        deposit: Number(u.deposit || 0),
        moveInFees: Number(u.moveInFees || 0),
        moveInFeeDetails: u.moveInFeeDetails || '',
        recurringFees: Number(u.recurringFees || 0),
        recurringFeeDetails: u.recurringFeeDetails || '',
        images: imagesList,
        floor: u.floor || 'G',
        unitType: u.unitType || 'Standard',
        propertyId: u.propertyId,
        propertyName: u.propertyName,
        propertyAddress: u.propertyAddress,
        county: u.county || '',
        subcounty: u.subcounty || '',
        latitude: u.latitude ? Number(u.latitude) : 0,
        longitude: u.longitude ? Number(u.longitude) : 0,
        amenities: parsedAmenities,
        rules: parsedRules,
        agent: {
          name: owner?.name || 'Landlord.nl Resident Team',
          email: owner?.email || 'support@landlord.nl',
          phone: owner?.phone || '+31 20 123 4567',
          image: owner?.image || '',
        }
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to retrieve vacancy: ${error.message}`);
    }
  }

  @Post('inquire')
  async inquire(
    @Body() payload: {
      unitId: string;
      type: 'tour' | 'message';
      tourDate?: string;
      tourTime?: string;
      message?: string;
      tenantId: string;
      tenantName: string;
      tenantEmail: string;
    }
  ) {
    try {
      // Find unit and its property owner
      const unitRec = await this.db
        .select({
          unitLabel: schema.units.label,
          propertyId: schema.properties.id,
          propertyName: schema.properties.name,
          ownerId: schema.properties.ownerId,
        })
        .from(schema.units)
        .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
        .where(eq(schema.units.id, payload.unitId))
        .limit(1);

      if (unitRec.length === 0) {
        throw new BadRequestException('Unit not found.');
      }

      const unit = unitRec[0];

      let title = '';
      let message = '';

      if (payload.type === 'tour') {
        title = `New Tour Request for ${unit.propertyName} (Unit ${unit.unitLabel})`;
        message = `Tenant ${payload.tenantName} (${payload.tenantEmail}) requested a tour on ${payload.tourDate} at ${payload.tourTime}.`;
      } else {
        title = `New Inquiry for ${unit.propertyName} (Unit ${unit.unitLabel})`;
        message = `Tenant ${payload.tenantName} (${payload.tenantEmail}) sent an inquiry:\n"${payload.message}"`;
      }

      // Insert notification for the owner/landlord
      await this.db.insert(schema.notifications).values({
        id: randomUUID(),
        userId: unit.ownerId,
        title,
        message,
        link: `/properties/${unit.propertyId}`,
        isRead: false,
      });

      return { success: true, message: payload.type === 'tour' ? 'Tour request submitted successfully!' : 'Inquiry message sent successfully!' };
    } catch (error: any) {
      throw new BadRequestException(`Inquiry failed: ${error.message}`);
    }
  }
}
