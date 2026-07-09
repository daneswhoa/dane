import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { getToolPermissionError } from './permissions';

export interface SyndicationArgs {
  action: 'get_listings' | 'list' | 'update' | 'unlist_unit' | 'unlist_property';
  propertyId?: string;
  unitIds?: string[];
  unitId?: string;
  rent?: number;
  deposit?: number;
  moveInFees?: number;
  moveInFeeDetails?: string;
  recurringFees?: number;
  recurringFeeDetails?: string;
  images?: string[];
  county?: string;
  subcounty?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  rules?: string[];
}

export class SyndicationTool {
  static async execute(
    args: SyndicationArgs,
    context: { db: any; userId: string; userRole: string; user?: any }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId, user } = context;

    // Check permissions - Syndication falls under the "Properties" section
    if (user) {
      const permError = getToolPermissionError(user, 'Properties', 'Edit');
      if (permError) return { success: false, error: permError };
    }

    const orgId = user?.organizationId || null;

    const verifyPropertyOwnership = (property: any) => {
      if (orgId) {
        if (property.organizationId !== orgId) {
          throw new Error('Access denied: Property does not belong to your organization.');
        }
      } else {
        if (property.ownerId !== userId) {
          throw new Error('Access denied: You do not own this property.');
        }
      }
    };

    const { action } = args;

    try {
      if (action === 'get_listings') {
        const list = await db
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

        const formatted = list.map((u: any) => ({
          unitId: u.unitId,
          label: u.label,
          rent: Number(u.rent || 0),
          deposit: Number(u.deposit || 0),
          moveInFees: Number(u.moveInFees || 0),
          moveInFeeDetails: u.moveInFeeDetails || '',
          recurringFees: Number(u.recurringFees || 0),
          recurringFeeDetails: u.recurringFeeDetails || '',
          images: u.images ? JSON.parse(u.images) : [],
          floor: u.floor || 'G',
          unitType: u.unitType || 'Standard',
          propertyId: u.propertyId,
          propertyName: u.propertyName,
          propertyAddress: u.propertyAddress,
          county: u.county || '',
          subcounty: u.subcounty || '',
          latitude: u.latitude ? Number(u.latitude) : 0,
          longitude: u.longitude ? Number(u.longitude) : 0,
          amenities: u.amenities ? JSON.parse(u.amenities) : [],
          rules: u.rules ? JSON.parse(u.rules) : [],
        }));

        return { success: true, listings: formatted };
      }

      if (action === 'list') {
        const { propertyId, unitIds, rent, deposit, moveInFees, moveInFeeDetails, recurringFees, recurringFeeDetails, images, county, subcounty, latitude, longitude, amenities, rules } = args;

        if (!propertyId) {
          return { success: false, error: 'propertyId is required for listing units.' };
        }
        if (!unitIds || unitIds.length === 0) {
          return { success: false, error: 'unitIds is required for listing units.' };
        }

        // Fetch property info for logs
        const propList = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
        if (propList.length === 0) return { success: false, error: 'Property not found.' };
        const property = propList[0];
        verifyPropertyOwnership(property);

        await db
          .update(schema.properties)
          .set({
            county: county || property.county,
            subcounty: subcounty || property.subcounty,
            latitude: latitude !== undefined ? String(latitude) : property.latitude,
            longitude: longitude !== undefined ? String(longitude) : property.longitude,
            amenities: amenities ? JSON.stringify(amenities) : property.amenities,
            rules: rules ? JSON.stringify(rules) : property.rules,
            isListed: true,
          })
          .where(eq(schema.properties.id, propertyId));

        await db
          .update(schema.units)
          .set({
            isListed: true,
            rent: rent !== undefined ? rent : 0,
            deposit: deposit !== undefined ? deposit : 0,
            moveInFees: moveInFees !== undefined ? moveInFees : 0,
            moveInFeeDetails: moveInFeeDetails || null,
            recurringFees: recurringFees !== undefined ? recurringFees : 0,
            recurringFeeDetails: recurringFeeDetails || null,
            images: images ? JSON.stringify(images) : null,
          })
          .where(
            and(
              eq(schema.units.propertyId, propertyId),
              inArray(schema.units.id, unitIds)
            )
          );

        // Add Audit Log
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          organizationId: property.organizationId || null,
          organizationName: property.organizationName,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Globe',
          categoryLabel: 'Syndication',
          description: `Sophia syndicated ${unitIds.length} units from property "${property.name}".`,
          severity: 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        return { success: true, message: `Successfully listed/syndicated ${unitIds.length} units for property "${property.name}".` };
      }

      if (action === 'update') {
        const { unitId } = args;
        if (!unitId) return { success: false, error: 'unitId is required for update action.' };

        const unitList = await db
          .select({ propertyId: schema.units.propertyId, label: schema.units.label })
          .from(schema.units)
          .where(eq(schema.units.id, unitId))
          .limit(1);

        if (unitList.length === 0) return { success: false, error: `Unit not found.` };
        const { propertyId, label } = unitList[0];

        const propList = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
        if (propList.length === 0) return { success: false, error: 'Property not found.' };
        const property = propList[0];
        verifyPropertyOwnership(property);

        const unitUpdate: any = {};
        if (args.rent !== undefined) unitUpdate.rent = args.rent;
        if (args.deposit !== undefined) unitUpdate.deposit = args.deposit;
        if (args.moveInFees !== undefined) unitUpdate.moveInFees = args.moveInFees;
        if (args.moveInFeeDetails !== undefined) unitUpdate.moveInFeeDetails = args.moveInFeeDetails || null;
        if (args.recurringFees !== undefined) unitUpdate.recurringFees = args.recurringFees;
        if (args.recurringFeeDetails !== undefined) unitUpdate.recurringFeeDetails = args.recurringFeeDetails || null;
        if (args.images !== undefined) unitUpdate.images = args.images ? JSON.stringify(args.images) : null;

        if (Object.keys(unitUpdate).length > 0) {
          await db.update(schema.units).set(unitUpdate).where(eq(schema.units.id, unitId));
        }

        const propertyUpdate: any = {};
        if (args.county !== undefined) propertyUpdate.county = args.county;
        if (args.subcounty !== undefined) propertyUpdate.subcounty = args.subcounty;
        if (args.latitude !== undefined) propertyUpdate.latitude = String(args.latitude);
        if (args.longitude !== undefined) propertyUpdate.longitude = String(args.longitude);
        if (args.amenities !== undefined) propertyUpdate.amenities = JSON.stringify(args.amenities);
        if (args.rules !== undefined) propertyUpdate.rules = JSON.stringify(args.rules);

        if (Object.keys(propertyUpdate).length > 0) {
          await db.update(schema.properties).set(propertyUpdate).where(eq(schema.properties.id, propertyId));
        }

        // Add Audit Log
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          organizationId: property.organizationId || null,
          organizationName: property.organizationName,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Edit',
          categoryLabel: 'Syndication',
          description: `Sophia updated syndicated listing details for unit "${label}" of property "${property.name}".`,
          severity: 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        return { success: true, message: `Successfully updated listing for unit "${label}" of property "${property.name}".` };
      }

      if (action === 'unlist_unit') {
        const { unitId } = args;
        if (!unitId) return { success: false, error: 'unitId is required for unlisting.' };

        const unitList = await db
          .select({ propertyId: schema.units.propertyId, label: schema.units.label })
          .from(schema.units)
          .where(eq(schema.units.id, unitId))
          .limit(1);

        if (unitList.length === 0) return { success: false, error: 'Unit not found.' };
        const { propertyId, label } = unitList[0];

        const propList = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
        if (propList.length === 0) return { success: false, error: 'Property not found.' };
        const property = propList[0];
        verifyPropertyOwnership(property);

        await db
          .update(schema.units)
          .set({ isListed: false })
          .where(eq(schema.units.id, unitId));

        // Add Audit Log
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          organizationId: property.organizationId || null,
          organizationName: property.organizationName,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Trash',
          categoryLabel: 'Syndication',
          description: `Sophia unlisted/removed unit "${label}" of property "${property.name}" from public listing.`,
          severity: 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        return { success: true, message: `Successfully removed listing for unit "${label}" of property "${property.name}".` };
      }

      if (action === 'unlist_property') {
        const { propertyId } = args;
        if (!propertyId) return { success: false, error: 'propertyId is required for unlisting property.' };

        const propList = await db.select().from(schema.properties).where(eq(schema.properties.id, propertyId)).limit(1);
        if (propList.length === 0) return { success: false, error: 'Property not found.' };
        const property = propList[0];
        verifyPropertyOwnership(property);

        await db
          .update(schema.properties)
          .set({ isListed: false })
          .where(eq(schema.properties.id, propertyId));

        await db
          .update(schema.units)
          .set({ isListed: false })
          .where(eq(schema.units.propertyId, propertyId));

        // Add Audit Log
        await db.insert(schema.auditLogs).values({
          id: 'audit-' + Math.random().toString(36).substring(2, 9),
          ownerId: userId,
          organizationId: property.organizationId || null,
          organizationName: property.organizationName,
          actorName: 'Sophia AI',
          actorEmail: 'sophia@landlord.nl',
          actorInitials: 'SA',
          categoryIconName: 'Trash',
          categoryLabel: 'Syndication',
          description: `Sophia unlisted/removed entire property "${property.name}" and all of its units from public listing.`,
          severity: 'info',
          status: 'success',
          ip: '127.0.0.1',
          location: 'Sophia AI Workspace',
        });

        return { success: true, message: `Successfully removed all listings for property "${property.name}".` };
      }

      return { success: false, error: 'Unknown syndication action.' };
    } catch (err: any) {
      return { success: false, error: `Syndication command failed: ${err.message}` };
    }
  }
}
