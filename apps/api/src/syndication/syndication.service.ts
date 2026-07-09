import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '../db/schema';
import { DATABASE_CONNECTION } from '../db/database.module';

export interface ListedUnitData {
  unitId: string;
  label: string;
  rent: number;
  deposit: number;
  moveInFees: number;
  moveInFeeDetails?: string;
  recurringFees: number;
  recurringFeeDetails?: string;
  images?: string;
  floor: string;
  unitType: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  county?: string;
  subcounty?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string;
  rules?: string;
}

export interface ListPayload {
  propertyId: string;
  unitIds: string[];
  rent: number;
  deposit: number;
  moveInFees: number;
  moveInFeeDetails?: string;
  recurringFees: number;
  recurringFeeDetails?: string;
  images?: string[];
  county: string;
  subcounty: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  rules: string[];
}

@Injectable()
export class SyndicationService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  // Helper to verify property belongs to user/organization
  private async verifyPropertyOwnership(propertyId: string, orgId: string | null, userId: string) {
    const propList = await this.db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.id, propertyId))
      .limit(1);

    if (propList.length === 0) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    const prop = propList[0];
    if (orgId) {
      if (prop.organizationId !== orgId) {
        throw new BadRequestException('Access denied: Property does not belong to your organization');
      }
    } else {
      if (prop.ownerId !== userId) {
        throw new BadRequestException('Access denied: You do not own this property');
      }
    }
  }

  // Helper to verify unit belongs to user/organization
  private async verifyUnitOwnership(unitId: string, orgId: string | null, userId: string): Promise<string> {
    const unitList = await this.db
      .select({ propertyId: schema.units.propertyId })
      .from(schema.units)
      .where(eq(schema.units.id, unitId))
      .limit(1);

    if (unitList.length === 0) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }

    const { propertyId } = unitList[0];
    await this.verifyPropertyOwnership(propertyId, orgId, userId);
    return propertyId;
  }

  // Get all listed units across the landlord's properties
  async getListedUnits(orgId: string | null, userId: string): Promise<ListedUnitData[]> {
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
      })
      .from(schema.units)
      .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
      .where(
        and(
          eq(schema.units.isListed, true),
          orgId
            ? eq(schema.properties.organizationId, orgId)
            : eq(schema.properties.ownerId, userId)
        )
      );

    return list.map((u: any) => ({
      unitId: u.unitId,
      label: u.label,
      rent: Number(u.rent || 0),
      deposit: Number(u.deposit || 0),
      moveInFees: Number(u.moveInFees || 0),
      moveInFeeDetails: u.moveInFeeDetails || '',
      recurringFees: Number(u.recurringFees || 0),
      recurringFeeDetails: u.recurringFeeDetails || '',
      images: u.images || '',
      floor: u.floor || 'G',
      unitType: u.unitType || 'Standard',
      propertyId: u.propertyId,
      propertyName: u.propertyName,
      propertyAddress: u.propertyAddress,
      county: u.county || '',
      subcounty: u.subcounty || '',
      latitude: u.latitude ? Number(u.latitude) : 0,
      longitude: u.longitude ? Number(u.longitude) : 0,
      amenities: u.amenities || '',
      rules: u.rules || '',
    }));
  }

  // Create a new listing / syndicate properties & units
  async listUnits(payload: ListPayload, orgId: string | null, userId: string): Promise<{ success: boolean; count: number }> {
    await this.verifyPropertyOwnership(payload.propertyId, orgId, userId);

    // Verify all units belong to the same property
    if (payload.unitIds.length > 0) {
      const unitsList = await this.db
        .select({ id: schema.units.id })
        .from(schema.units)
        .where(
          and(
            eq(schema.units.propertyId, payload.propertyId),
            inArray(schema.units.id, payload.unitIds)
          )
        );
      if (unitsList.length !== payload.unitIds.length) {
        throw new BadRequestException('Some specified units do not exist on this property.');
      }
    }

    // 1. Update the property location, amenities, rules and isListed flag
    await this.db
      .update(schema.properties)
      .set({
        county: payload.county,
        subcounty: payload.subcounty,
        latitude: payload.latitude,
        longitude: payload.longitude,
        amenities: JSON.stringify(payload.amenities),
        rules: JSON.stringify(payload.rules),
        isListed: true,
      })
      .where(eq(schema.properties.id, payload.propertyId));

    // 2. Update the chosen units to set isListed = true and update pricing
    if (payload.unitIds.length > 0) {
      await this.db
        .update(schema.units)
        .set({
          isListed: true,
          rent: payload.rent,
          deposit: payload.deposit,
          moveInFees: payload.moveInFees,
          moveInFeeDetails: payload.moveInFeeDetails || null,
          recurringFees: payload.recurringFees,
          recurringFeeDetails: payload.recurringFeeDetails || null,
          images: payload.images ? JSON.stringify(payload.images) : null,
        })
        .where(
          and(
            eq(schema.units.propertyId, payload.propertyId),
            inArray(schema.units.id, payload.unitIds)
          )
        );
    }

    return {
      success: true,
      count: payload.unitIds.length,
    };
  }

  async updateListedUnit(unitId: string, payload: any, orgId: string | null, userId: string): Promise<{ success: boolean }> {
    const propertyId = await this.verifyUnitOwnership(unitId, orgId, userId);

    const unitUpdate: any = {
      rent: payload.rent,
      deposit: payload.deposit,
      moveInFees: payload.moveInFees,
      moveInFeeDetails: payload.moveInFeeDetails || null,
      recurringFees: payload.recurringFees,
      recurringFeeDetails: payload.recurringFeeDetails || null,
      images: payload.images ? JSON.stringify(payload.images) : null,
    };
    await this.db
      .update(schema.units)
      .set(unitUpdate)
      .where(eq(schema.units.id, unitId));

    const propertyUpdate: any = {};
    if (payload.county) propertyUpdate.county = payload.county;
    if (payload.subcounty) propertyUpdate.subcounty = payload.subcounty;
    if (payload.latitude !== undefined) propertyUpdate.latitude = String(payload.latitude);
    if (payload.longitude !== undefined) propertyUpdate.longitude = String(payload.longitude);
    if (payload.amenities) propertyUpdate.amenities = JSON.stringify(payload.amenities);
    if (payload.rules) propertyUpdate.rules = JSON.stringify(payload.rules);

    if (Object.keys(propertyUpdate).length > 0) {
      await this.db
        .update(schema.properties)
        .set(propertyUpdate)
        .where(eq(schema.properties.id, propertyId));
    }

    return { success: true };
  }

  // Unlist a single unit
  async unlistUnit(unitId: string, orgId: string | null, userId: string): Promise<{ success: boolean }> {
    await this.verifyUnitOwnership(unitId, orgId, userId);

    await this.db
      .update(schema.units)
      .set({ isListed: false })
      .where(eq(schema.units.id, unitId));

    return { success: true };
  }

  // Unlist an entire property (unlists all its units and flips property flag)
  async unlistProperty(propertyId: string, orgId: string | null, userId: string): Promise<{ success: boolean }> {
    await this.verifyPropertyOwnership(propertyId, orgId, userId);

    await this.db
      .update(schema.properties)
      .set({ isListed: false })
      .where(eq(schema.properties.id, propertyId));

    await this.db
      .update(schema.units)
      .set({ isListed: false })
      .where(eq(schema.units.propertyId, propertyId));

    return { success: true };
  }

  // Backwards compatibility getter (settings structure)
  async getSyndication(propertyId: string, orgId: string | null, userId: string): Promise<any> {
    await this.verifyPropertyOwnership(propertyId, orgId, userId);

    const propertyList = await this.db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.id, propertyId));

    const prop = propertyList[0];
    let data: any = {};
    if (prop.settings) {
      try {
        const parsed = JSON.parse(prop.settings);
        if (parsed.syndication) data = parsed.syndication;
      } catch (e) {}
    }

    return {
      photos: data.photos || [],
      utilities: data.utilities || [],
      conditions: {
        leaseType: data.conditions?.leaseType || 'rent',
        rentAmount: data.conditions?.rentAmount || 0,
        depositAmount: data.conditions?.depositAmount || 0,
        minLeaseMonths: data.conditions?.minLeaseMonths || 12,
        petsAllowed: data.conditions?.petsAllowed ?? false,
        smokingAllowed: data.conditions?.smokingAllowed ?? false,
      },
      location: {
        lat: Number(prop.latitude) || data.location?.lat || -1.2921,
        lng: Number(prop.longitude) || data.location?.lng || 36.8219,
        address: prop.address || '',
        notes: data.location?.notes || '',
      },
      published: prop.isListed || data.published || false,
    };
  }

  // Backwards compatibility updater (settings structure)
  async updateSyndication(propertyId: string, payload: any, orgId: string | null, userId: string): Promise<any> {
    await this.verifyPropertyOwnership(propertyId, orgId, userId);

    const propertyList = await this.db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.id, propertyId));

    const prop = propertyList[0];
    let settingsObj: Record<string, any> = {};

    if (prop.settings) {
      try {
        settingsObj = JSON.parse(prop.settings);
      } catch (e) {}
    }

    const currentSyndication = settingsObj.syndication || {};
    const updatedSyndication = {
      ...currentSyndication,
      ...payload,
    };

    settingsObj.syndication = updatedSyndication;

    await this.db
      .update(schema.properties)
      .set({
        settings: JSON.stringify(settingsObj),
        latitude: payload.location?.lat ? String(payload.location.lat) : prop.latitude,
        longitude: payload.location?.lng ? String(payload.location.lng) : prop.longitude,
        isListed: payload.published ?? prop.isListed,
      })
      .where(eq(schema.properties.id, propertyId));

    return updatedSyndication;
  }

  async publishSyndication(propertyId: string, status: boolean, orgId: string | null, userId: string): Promise<any> {
    return this.updateSyndication(propertyId, { published: status }, orgId, userId);
  }
}
