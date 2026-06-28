import { eq, and, lte, ilike } from 'drizzle-orm';
import * as schema from '../../db/schema';

export interface ManageContractorsArgs {
  action: 'browse' | 'bookmark';
  specialty?: string;
  maxHourlyRate?: number;
  locationName?: string;
  contractorId?: string;
}

export class ContractorMarketplaceTool {
  static async execute(
    args: ManageContractorsArgs,
    context: { db: any; userId: string; userRole: string }
  ) {
    if (!context || !context.db) {
      return { success: false, error: 'Database context not available' };
    }

    const { db, userId } = context;
    const { action } = args;

    try {
      if (action === 'browse') {
        const conditions: any[] = [];
        if (args.specialty) conditions.push(ilike(schema.contractors.specialty, `%${args.specialty}%`));
        if (args.maxHourlyRate) conditions.push(lte(schema.contractors.hourlyRate, args.maxHourlyRate));
        if (args.locationName) conditions.push(ilike(schema.contractors.locationName, `%${args.locationName}%`));
        
        // We only show available contractors
        conditions.push(eq(schema.contractors.status, 'available'));

        const q = db.select().from(schema.contractors);
        const list = conditions.length > 0 ? await q.where(and(...conditions)).limit(20) : await q.limit(20);

        return { 
          success: true, 
          contractors: list, 
          message: `Found ${list.length} available contractors matching the criteria.` 
        };
      }

      if (action === 'bookmark') {
        if (!args.contractorId) return { success: false, error: 'contractorId required to bookmark.' };

        // Verify contractor exists
        const cList = await db.select().from(schema.contractors).where(eq(schema.contractors.id, args.contractorId)).limit(1);
        if (cList.length === 0) return { success: false, error: 'Contractor not found.' };

        const id = 'bmk-' + Math.random().toString(36).substring(2, 9);
        await db.insert(schema.contractorBookmarks).values({
          id,
          userId,
          contractorId: args.contractorId,
        });

        return { success: true, message: `Successfully bookmarked contractor ${cList[0].name}.` };
      }

      return { success: false, error: 'Unknown action.' };
    } catch (err: any) {
      return { success: false, error: `Contractor tool failed: ${err.message}` };
    }
  }
}
