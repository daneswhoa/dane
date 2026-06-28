import { eq, inArray } from 'drizzle-orm';
import * as schema from '../../db/schema';

export interface UnitConfig {
  unitId?: string;
  label?: string;
  rent?: number;
  deposit?: number;
  recurringFeeDetails?: { name: string; amount: number }[];
  moveInFeeDetails?: { name: string; amount: number }[];
  floor?: string;
  unitType?: string;
}

export interface SetupOrUpdatePropertyArgs {
  propertyId: string;
  name?: string;
  address?: string;
  photoUrl?: string;
  unitsCount?: number;
  namingConvention?: string;
  settings?: {
    dueDate?: number | string;
    lateFees?: number | string;
  };
  status?: 'pending' | 'active';
  units?: UnitConfig[];
}

function generateUnitsFromConvention(unitsCount: number, convention?: string): { label: string; floor?: string }[] {
  const result: { label: string; floor?: string }[] = [];
  
  if (!convention) {
    // Default system assigned names and floors
    for (let i = 1; i <= unitsCount; i++) {
      result.push({ 
        label: `Apt ${i}`, 
        floor: '1st Floor'
      });
    }
    return result;
  }

  // Parse comma-separated parts like: "A1-A10, B1-B10" or "101-110, 201-210"
  const normalized = convention.toLowerCase().replace(/\s*to\s*/g, '-').trim();
  const parts = normalized.split(',').map(p => p.trim());
  
  for (const part of parts) {
    if (result.length >= unitsCount) break;
    
    // Pattern: A1-A10 or B1-B10
    const alphaRangeMatch = part.match(/^([a-z]+)(\d+)-([a-z]+)(\d+)$/i);
    if (alphaRangeMatch) {
      const startLetter = alphaRangeMatch[1].toUpperCase();
      const startNum = parseInt(alphaRangeMatch[2]);
      const endLetter = alphaRangeMatch[3].toUpperCase();
      const endNum = parseInt(alphaRangeMatch[4]);
      
      if (startLetter === endLetter) {
        let floorName = `${startLetter} Floor`;
        if (startLetter === 'A') floorName = 'Ground Floor';
        else if (startLetter === 'B') floorName = '1st Floor';
        else if (startLetter === 'C') floorName = '2nd Floor';
        else if (startLetter === 'D') floorName = '3rd Floor';
        
        for (let n = startNum; n <= endNum; n++) {
          if (result.length >= unitsCount) break;
          result.push({
            label: `${startLetter}${n}`,
            floor: floorName
          });
        }
      }
      continue;
    }
    
    // Pattern: 101-110 or 201-210
    const numericRangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (numericRangeMatch) {
      const startNum = parseInt(numericRangeMatch[1]);
      const endNum = parseInt(numericRangeMatch[2]);
      for (let n = startNum; n <= endNum; n++) {
        if (result.length >= unitsCount) break;
        const floorNum = Math.floor(n / 100);
        let floorName = `${floorNum}st Floor`;
        if (floorNum === 0) floorName = 'Ground Floor';
        else if (floorNum === 1) floorName = '1st Floor';
        else if (floorNum === 2) floorName = '2nd Floor';
        else if (floorNum === 3) floorName = '3rd Floor';
        else if (floorNum > 3) floorName = `${floorNum}th Floor`;
        
        result.push({
          label: String(n),
          floor: floorName
        });
      }
      continue;
    }

    // Pattern: single unit like "Penthouse" or "A1"
    if (part) {
      const label = part.toUpperCase();
      result.push({
        label,
        floor: '1st Floor'
      });
    }
  }

  // Fallback if the convention didn't produce enough units
  if (result.length < unitsCount) {
    const remaining = unitsCount - result.length;
    const startIndex = result.length + 1;
    for (let i = 0; i < remaining; i++) {
      result.push({ 
        label: `Apt ${startIndex + i}`, 
        floor: '1st Floor'
      });
    }
  }

  return result;
}

export class PropertySetupTool {
  static async getPropertiesSetupStatus(
    args: {},
    context: { db: any; userId: string; userRole: string }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId } = context;

    try {
      const props = await db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.ownerId, userId));

      const result = [];

      for (const prop of props) {
        const propUnits = await db
          .select()
          .from(schema.units)
          .where(eq(schema.units.propertyId, prop.id));

        const tenantIds = propUnits.filter((u: any) => u.tenantId).map((u: any) => u.tenantId);
        let tenantsMap: Record<string, any> = {};
        
        if (tenantIds.length > 0) {
          const tenantUsers = await db
            .select()
            .from(schema.users)
            .where(inArray(schema.users.id, tenantIds));
            
          for (const user of tenantUsers) {
            tenantsMap[user.id] = { name: user.name, email: user.email };
          }
        }

        let settingsObj: any = {};
        if (prop.settings) {
          try {
            settingsObj = JSON.parse(prop.settings);
            // Remove 'units' from settings to prevent confusing Sophia with outdated setup snapshot data
            if (settingsObj.units) {
              delete settingsObj.units;
            }
          } catch (e) {
            settingsObj = { raw: prop.settings };
          }
        }

        result.push({
          propertyId: prop.id,
          name: prop.name,
          address: prop.address,
          photoUrl: prop.photoUrl,
          unitsCount: prop.unitsCount,
          status: prop.status, // 'pending' = unsetup, 'active' = setup
          settings: settingsObj,
          units: propUnits.map((u: any) => {
            let recDetails = [];
            let moveInDetails = [];
            try { recDetails = u.recurringFeeDetails ? JSON.parse(u.recurringFeeDetails) : []; } catch (e) {}
            try { moveInDetails = u.moveInFeeDetails ? JSON.parse(u.moveInFeeDetails) : []; } catch (e) {}
            return {
              unitId: u.id,
              label: u.label,
              rent: u.rent,
              deposit: u.deposit,
              recurringFees: u.recurringFees,
              recurringFeeDetails: recDetails,
              moveInFees: u.moveInFees,
              moveInFeeDetails: moveInDetails,
              status: u.status,
              tenantId: u.tenantId,
              tenantName: u.tenantId ? tenantsMap[u.tenantId]?.name : undefined,
              tenantEmail: u.tenantId ? tenantsMap[u.tenantId]?.email : undefined,
              arrears: u.arrears,
              floor: u.floor,
              unitType: u.unitType,
            };
          }),
        });
      }

      return {
        success: true,
        properties: result,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to inspect portfolio: ${err.message}`,
      };
    }
  }

  static async setupOrUpdatePropertyAndUnits(
    args: SetupOrUpdatePropertyArgs,
    context: { db: any; userId: string; userRole: string }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId } = context;
    const { propertyId, name, address, photoUrl, unitsCount, settings, status, units: unitConfigs, namingConvention } = args;

    try {
      const propList = await db
        .select()
        .from(schema.properties)
        .where(eq(schema.properties.id, propertyId))
        .limit(1);

      if (propList.length === 0) {
        return { success: false, error: `Property with ID ${propertyId} not found.` };
      }

      const property = propList[0];
      if (property.ownerId !== userId) {
        return { success: false, error: 'Access denied. You do not own this property.' };
      }

      const propUpdate: any = {};
      if (name !== undefined) propUpdate.name = name;
      if (address !== undefined) propUpdate.address = address;
      if (photoUrl !== undefined) propUpdate.photoUrl = photoUrl;
      
      let finalUnitsCount = property.unitsCount;
      if (unitsCount !== undefined) {
        propUpdate.unitsCount = unitsCount;
        finalUnitsCount = unitsCount;
      }

      let currentSettings: any = {};
      if (property.settings) {
        try {
          currentSettings = JSON.parse(property.settings);
        } catch (e) {}
      }
      if (settings !== undefined) {
        currentSettings = { ...currentSettings, ...settings };
        propUpdate.settings = JSON.stringify(currentSettings);
      }

      if (Object.keys(propUpdate).length > 0) {
        await db.update(schema.properties).set(propUpdate).where(eq(schema.properties.id, propertyId));
      }

      const existingUnits = await db
        .select()
        .from(schema.units)
        .where(eq(schema.units.propertyId, propertyId));

      if (finalUnitsCount === 1) {
        let targetUnit = existingUnits[0];
        const unitConfig = unitConfigs?.[0];

        const rentVal = unitConfig?.rent !== undefined ? Number(unitConfig.rent) : (targetUnit ? Number(targetUnit.rent) : 0);
        const depositVal = unitConfig?.deposit !== undefined ? Number(unitConfig.deposit) : (targetUnit ? Number(targetUnit.deposit) : 0);

        let recurringFeeDetailsStr = targetUnit ? targetUnit.recurringFeeDetails : '[]';
        let totalRecurring = targetUnit ? Number(targetUnit.recurringFees) : 0;
        if (unitConfig?.recurringFeeDetails !== undefined) {
          recurringFeeDetailsStr = JSON.stringify(unitConfig.recurringFeeDetails);
          totalRecurring = unitConfig.recurringFeeDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        }

        let moveInFeeDetailsStr = targetUnit ? targetUnit.moveInFeeDetails : '[]';
        let totalMoveIn = targetUnit ? Number(targetUnit.moveInFees) : 0;
        if (unitConfig?.moveInFeeDetails !== undefined) {
          moveInFeeDetailsStr = JSON.stringify(unitConfig.moveInFeeDetails);
          totalMoveIn = unitConfig.moveInFeeDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        }

        const labelVal = unitConfig?.label || (targetUnit ? targetUnit.label : 'Main Unit');
        const floorVal = unitConfig?.floor || (targetUnit ? targetUnit.floor : '1st Floor');
        const typeVal = unitConfig?.unitType || (targetUnit ? targetUnit.unitType : 'House');

        if (targetUnit) {
          await db
            .update(schema.units)
            .set({
              label: labelVal,
              rent: rentVal,
              deposit: depositVal,
              recurringFees: totalRecurring,
              recurringFeeDetails: recurringFeeDetailsStr,
              moveInFees: totalMoveIn,
              moveInFeeDetails: moveInFeeDetailsStr,
              floor: floorVal,
              unitType: typeVal,
            })
            .where(eq(schema.units.id, targetUnit.id));

          if (existingUnits.length > 1) {
            for (let i = 1; i < existingUnits.length; i++) {
              await db.delete(schema.units).where(eq(schema.units.id, existingUnits[i].id));
            }
          }
        } else {
          // Normal system ID assignment
          const newUnitId = 'unit-' + Math.random().toString(36).substring(2, 9);
          await db.insert(schema.units).values({
            id: newUnitId,
            propertyId,
            label: labelVal,
            rent: rentVal,
            deposit: depositVal,
            recurringFees: totalRecurring,
            recurringFeeDetails: recurringFeeDetailsStr,
            moveInFees: totalMoveIn,
            moveInFeeDetails: moveInFeeDetailsStr,
            status: 'vacant',
            floor: floorVal,
            unitType: typeVal,
          });
        }

      } else if (finalUnitsCount > 1) {
        const generatedList = generateUnitsFromConvention(finalUnitsCount, namingConvention);

        // Delete excess units if needed
        const currentCount = existingUnits.length;
        if (currentCount > finalUnitsCount) {
          const toDeleteCount = currentCount - finalUnitsCount;
          let deleted = 0;
          for (const u of existingUnits) {
            if (deleted >= toDeleteCount) break;
            if (u.status === 'vacant') {
              await db.delete(schema.units).where(eq(schema.units.id, u.id));
              deleted++;
            }
          }
        }

        // Fetch refreshed list of units
        const refreshedUnits = await db
          .select()
          .from(schema.units)
          .where(eq(schema.units.propertyId, propertyId));

        for (let i = 0; i < finalUnitsCount; i++) {
          const gen = generatedList[i];
          const targetUnit = refreshedUnits[i];

          // Check for explicit configs override
          const explicitConfig = unitConfigs?.find(uc => 
            (uc.unitId && targetUnit && uc.unitId === targetUnit.id) || 
            (uc.label && uc.label.toLowerCase() === gen.label.toLowerCase())
          ) || unitConfigs?.[i];

          const labelVal = explicitConfig?.label || gen.label;
          const floorVal = explicitConfig?.floor || gen.floor || '1st Floor';
          const typeVal = explicitConfig?.unitType || 'Apartment';
          const rentVal = explicitConfig?.rent !== undefined ? Number(explicitConfig.rent) : (targetUnit ? Number(targetUnit.rent) : 0);
          const depositVal = explicitConfig?.deposit !== undefined ? Number(explicitConfig.deposit) : (targetUnit ? Number(targetUnit.deposit) : 0);

          let recurringFeeDetailsStr = targetUnit ? targetUnit.recurringFeeDetails : '[]';
          let totalRecurring = targetUnit ? Number(targetUnit.recurringFees) : 0;
          if (explicitConfig?.recurringFeeDetails !== undefined) {
            recurringFeeDetailsStr = JSON.stringify(explicitConfig.recurringFeeDetails);
            totalRecurring = explicitConfig.recurringFeeDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          }

          let moveInFeeDetailsStr = targetUnit ? targetUnit.moveInFeeDetails : '[]';
          let totalMoveIn = targetUnit ? Number(targetUnit.moveInFees) : 0;
          if (explicitConfig?.moveInFeeDetails !== undefined) {
            moveInFeeDetailsStr = JSON.stringify(explicitConfig.moveInFeeDetails);
            totalMoveIn = explicitConfig.moveInFeeDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          }

          if (targetUnit) {
            await db
              .update(schema.units)
              .set({
                label: labelVal,
                floor: floorVal,
                unitType: typeVal,
                rent: rentVal,
                deposit: depositVal,
                recurringFees: totalRecurring,
                recurringFeeDetails: recurringFeeDetailsStr,
                moveInFees: totalMoveIn,
                moveInFeeDetails: moveInFeeDetailsStr,
              })
              .where(eq(schema.units.id, targetUnit.id));
          } else {
            // Unique and readable ID naming matching the label
            const cleanLabel = labelVal.toLowerCase().replace(/[^a-z0-9]/g, '');
            const newUnitId = `unit-${propertyId.replace('prop-', '')}-${cleanLabel}`;
            await db.insert(schema.units).values({
              id: newUnitId,
              propertyId,
              label: labelVal,
              floor: floorVal,
              unitType: typeVal,
              rent: rentVal,
              deposit: depositVal,
              recurringFees: totalRecurring,
              recurringFeeDetails: recurringFeeDetailsStr,
              moveInFees: totalMoveIn,
              moveInFeeDetails: moveInFeeDetailsStr,
              status: 'vacant',
            });
          }
        }
      }

      let finalStatus = status || property.status;
      if (!status) {
        const checkUnits = await db
          .select()
          .from(schema.units)
          .where(eq(schema.units.propertyId, propertyId));
        
        const hasRentConfigured = checkUnits.some((u: any) => Number(u.rent) > 0);
        if (hasRentConfigured) {
          finalStatus = 'active';
        } else {
          finalStatus = 'pending';
        }
      }

      await db
        .update(schema.properties)
        .set({ status: finalStatus })
        .where(eq(schema.properties.id, propertyId));

      await db.insert(schema.auditLogs).values({
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        ownerId: userId,
        actorName: 'Sophia AI',
        actorEmail: 'sophia@landlord.nl',
        actorInitials: 'SA',
        categoryIconName: 'Settings',
        categoryLabel: 'Properties',
        description: `Sophia updated settings/configuration for property "${name || property.name}". Setup status set to "${finalStatus}".`,
        severity: 'info',
        status: 'success',
        ip: '127.0.0.1',
        location: 'Sophia AI Workspace',
      });

      const allUnits = await db
        .select()
        .from(schema.units)
        .where(eq(schema.units.propertyId, propertyId));

      return {
        success: true,
        message: `Successfully updated property configurations. Setup status is "${finalStatus}".`,
        propertyId,
        propertyName: name || property.name,
        status: finalStatus,
        units: allUnits
      };

    } catch (err: any) {
      return {
        success: false,
        error: `Failed to configure property: ${err.message}`,
      };
    }
  }
}
