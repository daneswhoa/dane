import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import { EmailService } from '../email.service';
import * as schema from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import {
  getPropertiesImpl,
  addPropertyImpl,
  uploadPropertySetupImpl,
  updatePropertyImageImpl,
  adjustPortfolioRentImpl,
  updatePropertyDetailsImpl,
  markUnitVacantImpl,
} from './tools/properties';

import {
  moveTenantImpl,
  getInvoicesImpl,
  createTenantInvoiceImpl,
  createVacancyInvoiceImpl,
} from './tools/tenants';

import {
  createMaintenanceTicketImpl,
  findContractorsImpl,
  bookmarkContractorImpl,
  assignContractorToTicketImpl,
  checkJobStatusImpl,
} from './tools/maintenance';

export interface SecurityContext {
  userId: string;
  role: string;
  allowedProperties?: string;
}

@Injectable()
export class AgentToolsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Helper to verify property access permissions for the caller.
   */
  private async checkPropertyAccess(propertyId: string, context: SecurityContext): Promise<string> {
    if (context.role === 'tenant') {
      throw new ForbiddenException('Access denied. Tenants do not have permission to modify properties.');
    }

    let targetOwnerId = context.userId;
    if (context.role !== 'manager') {
      const relation = await this.db
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.managerId, context.userId))
        .limit(1);
      if (relation.length > 0) {
        targetOwnerId = relation[0].ownerId;
      }
    }

    const prop = await this.db
      .select()
      .from(schema.properties)
      .where(and(eq(schema.properties.id, propertyId), eq(schema.properties.ownerId, targetOwnerId)))
      .limit(1);

    if (prop.length === 0) {
      throw new ForbiddenException('Access denied. You do not have permission for this property.');
    }

    if (context.role !== 'manager' && context.allowedProperties && context.allowedProperties !== 'all') {
      const allowedIds = context.allowedProperties.split(',');
      if (!allowedIds.includes(propertyId)) {
        throw new ForbiddenException('Access denied. You do not have permission for this property.');
      }
    }

    return targetOwnerId;
  }

  async logActivity(userId: string, action: string, details?: string) {
    try {
      await this.db.insert(schema.agentActivityLog).values({
        userId,
        action,
        description: details || `Executed ${action} tool`,
        toolName: action,
        status: 'success'
      });
    } catch (e) {
      console.error('Failed to log agent activity:', e);
    }
  }

  /**
   * Tool: calculate_formula
   */
  async calculateFormula(context: SecurityContext, params: { formula: string }) {
    await this.logActivity(context.userId, 'calculate_formula', `Calculated expression: ${params.formula}`);

    // Safely evaluate simple math formulas (only allow numbers, +, -, *, /, (, ), .)
    const cleanFormula = params.formula.replace(/[^0-9+\-*/().\s]/g, '');
    try {
      const result = new Function(`return (${cleanFormula})`)();
      return { success: true, formula: params.formula, result };
    } catch (e) {
      throw new BadRequestException('Invalid mathematical formula expression.');
    }
  }

  /**
   * Tool: move_tenant
   */
  async moveTenant(context: SecurityContext, params: { tenantId: string; unitId: string }) {
    return moveTenantImpl(this, context, params);
  }

  /**
   * Tool: adjust_portfolio_rent
   */
  async adjustPortfolioRent(context: SecurityContext, params: { propertyId: string; percentage?: number; amount?: number }) {
    return adjustPortfolioRentImpl(this, context, params);
  }

  /**
   * Tool: update_property_details
   */
  async updatePropertyDetails(context: SecurityContext, params: { propertyId: string; name?: string; address?: string }) {
    return updatePropertyDetailsImpl(this, context, params);
  }

  /**
   * Tool: mark_unit_vacant
   */
  async markUnitVacant(context: SecurityContext, params: { unitId: string }) {
    return markUnitVacantImpl(this, context, params);
  }

  /**
   * Tool: get_portfolio_summary
   */
  async getPortfolioSummary(context: SecurityContext) {
    await this.logActivity(context.userId, 'get_portfolio_summary', 'Requested landlord portfolio summary metrics');
    
    if (context.role === 'tenant') {
      throw new ForbiddenException('You do not have permission to view portfolio summaries.');
    }

    let targetOwnerId = context.userId;
    if (context.role !== 'manager') {
      const relation = await this.db
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.managerId, context.userId))
        .limit(1);
      if (relation.length > 0) {
        targetOwnerId = relation[0].ownerId;
      }
    }

    let props = await this.db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.ownerId, targetOwnerId));

    if (context.role !== 'manager' && context.allowedProperties && context.allowedProperties !== 'all') {
      const allowedIds = context.allowedProperties.split(',');
      props = props.filter((p: any) => allowedIds.includes(p.id));
    }

    const propertyIds = props.map((p: any) => p.id);
    if (propertyIds.length === 0) {
      return { totalProperties: 0, totalUnits: 0, occupancyRate: '0%', outstandingArrears: 0, activeTickets: 0 };
    }

    const allUnits = await this.db
      .select()
      .from(schema.units)
      .where(sql`${schema.units.propertyId} IN ${propertyIds}`);

    const activeTickets = await this.db
      .select()
      .from(schema.tickets)
      .where(and(sql`${schema.tickets.propertyId} IN ${propertyIds}`, eq(schema.tickets.status, 'open')));

    const totalUnits = allUnits.length;
    const occupiedUnits = allUnits.filter((u: any) => u.status === 'occupied').length;
    const occupancyRate = totalUnits > 0 ? `${Math.round((occupiedUnits / totalUnits) * 100)}%` : '100%';
    const totalArrears = allUnits.reduce((sum: number, u: any) => sum + (Number(u.arrears) || 0), 0);

    return {
      totalProperties: props.length,
      totalUnits,
      occupancyRate,
      outstandingArrears: totalArrears,
      activeTickets: activeTickets.length,
    };
  }

  /**
   * Tool: get_properties
   */
  async getProperties(context: SecurityContext) {
    return getPropertiesImpl(this, context);
  }

  /**
   * Tool: add_property
   */
  async addProperty(context: SecurityContext, params: { name: string; address: string; unitsCount?: number; photoUrl?: string }) {
    return addPropertyImpl(this, context, params);
  }

  /**
   * Tool: upload_property_setup
   */
  async uploadPropertySetup(context: SecurityContext, params: { fileName: string; rowCount: number }) {
    return uploadPropertySetupImpl(this, context, params);
  }

  /**
   * Tool: update_property_image
   */
  async updatePropertyImage(context: SecurityContext, params: { propertyId: string; photoUrl: string }) {
    return updatePropertyImageImpl(this, context, params);
  }

  /**
   * Tool: create_maintenance_ticket
   */
  async createMaintenanceTicket(
    context: SecurityContext,
    params: { propertyId: string; unitId: string; description: string; urgency: string; category?: string }
  ) {
    return createMaintenanceTicketImpl(this, context, params);
  }

  /**
   * Tool: find_contractors
   */
  async findContractors(specialty: string) {
    return findContractorsImpl(this, specialty);
  }

  /**
   * Tool: bookmark_contractor
   */
  async bookmarkContractor(context: SecurityContext, params: { contractorId: string }) {
    return bookmarkContractorImpl(this, context, params);
  }

  /**
   * Tool: assign_contractor_to_ticket
   */
  async assignContractorToTicket(
    context: SecurityContext,
    params: { ticketId: string; contractorId: string; proposedHourlyRate?: number; proposedAmount?: number }
  ) {
    return assignContractorToTicketImpl(this, context, params);
  }

  /**
   * Tool: check_job_status
   */
  async checkJobStatus(context: SecurityContext, params: { ticketId: string }) {
    return checkJobStatusImpl(this, context, params);
  }

  /**
   * Tool: save_user_note
   */
  async saveUserNote(context: SecurityContext, params: { title: string; content: string }) {
    await this.logActivity(context.userId, 'save_user_note', `Saved note: ${params.title}`);
    const noteId = 'note-' + randomUUID().substring(0, 8);

    await this.db.insert(schema.userNotes).values({
      id: noteId,
      userId: context.userId,
      title: params.title,
      content: params.content,
    });

    return {
      success: true,
      noteId,
      message: 'Note saved successfully to database.',
    };
  }

  /**
   * Tool: get_invoices
   */
  async getInvoices(context: SecurityContext, params?: { status?: string }) {
    return getInvoicesImpl(this, context, params);
  }

  /**
   * Tool: create_tenant_invoice
   */
  async createTenantInvoice(
    context: SecurityContext,
    params: { tenantId: string; propertyId: string; amount: number; description: string; type?: string; dueDateDays?: number }
  ) {
    return createTenantInvoiceImpl(this, context, params);
  }

  /**
   * Tool: create_vacancy_invoice
   */
  async createVacancyInvoice(
    context: SecurityContext,
    params: { propertyId: string; amount: number; description: string; type: string }
  ) {
    return createVacancyInvoiceImpl(this, context, params);
  }

  /**
   * Tool: filter_records
   * Filters and retrieves information across tenants, invoices, expenses, audits, or tickets.
   */
  async filterRecords(
    context: SecurityContext,
    params: { dataset: 'tenants' | 'invoices' | 'expenses' | 'tickets' | 'audits'; filterTerm?: string; status?: string }
  ) {
    await this.logActivity(context.userId, 'filter_records', `Filtered ${params.dataset} with term ${params.filterTerm}`);
    
    if (context.role === 'tenant' && params.dataset !== 'invoices' && params.dataset !== 'tickets') {
      throw new ForbiddenException('Permission denied.');
    }

    let targetOwnerId = context.userId;
    if (context.role !== 'manager' && context.role !== 'tenant') {
      const relation = await this.db
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.managerId, context.userId))
        .limit(1);
      if (relation.length > 0) {
        targetOwnerId = relation[0].ownerId;
      }
    }

    if (params.dataset === 'tenants') {
      const list = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.role, 'tenant'));
      return list.filter((u: any) => 
        (!params.filterTerm || u.name.toLowerCase().includes(params.filterTerm.toLowerCase()) || u.email.toLowerCase().includes(params.filterTerm.toLowerCase()))
      );
    }

    if (params.dataset === 'invoices') {
      const list = await this.getInvoices(context, { status: params.status });
      return list.filter((i: any) => 
        (!params.filterTerm || i.tenantName.toLowerCase().includes(params.filterTerm.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(params.filterTerm.toLowerCase()))
      );
    }

    if (params.dataset === 'expenses') {
      // Invoices that are NOT type 'Rent' act as system expenses (like Repairs, Capital upkeep, Taxes)
      let list = await this.db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.ownerId, targetOwnerId));
      
      const expenses = list.filter((i: any) => i.type !== 'Rent');
      return expenses.filter((e: any) =>
        (!params.filterTerm || e.description.toLowerCase().includes(params.filterTerm.toLowerCase()) || e.type.toLowerCase().includes(params.filterTerm.toLowerCase()))
      );
    }

    if (params.dataset === 'tickets') {
      const list = await this.db
        .select()
        .from(schema.tickets)
        .where(eq(schema.tickets.ownerId, targetOwnerId));
      return list.filter((t: any) =>
        (!params.status || t.status === params.status) &&
        (!params.filterTerm || t.description.toLowerCase().includes(params.filterTerm.toLowerCase()) || (t.category && t.category.toLowerCase().includes(params.filterTerm.toLowerCase())))
      );
    }

    if (params.dataset === 'audits') {
      const list = await this.db
        .select()
        .from(schema.agentActivityLog)
        .where(eq(schema.agentActivityLog.userId, context.userId));
      return list.filter((a: any) =>
        (!params.filterTerm || a.action.toLowerCase().includes(params.filterTerm.toLowerCase()) || (a.details && a.details.toLowerCase().includes(params.filterTerm.toLowerCase())))
      );
    }

    return [];
  }

  /**
   * Tool: create_email_campaign
   */
  async createEmailCampaign(
    context: SecurityContext,
    params: { targetSegment: 'all' | 'arrears' | 'specific'; tenantEmails?: string[]; subject: string; messageBody: string }
  ) {
    await this.logActivity(context.userId, 'create_email_campaign', `Dispatched email campaign: ${params.subject}`);

    if (context.role === 'tenant') {
      throw new ForbiddenException('Tenants cannot dispatch email campaigns.');
    }

    let targetEmails: string[] = [];

    if (params.targetSegment === 'specific' && params.tenantEmails) {
      targetEmails = params.tenantEmails;
    } else if (params.targetSegment === 'all') {
      const tenants = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.role, 'tenant'));
      targetEmails = tenants.map((t: any) => t.email);
    } else if (params.targetSegment === 'arrears') {
      const arrearsUnits = await this.db
        .select()
        .from(schema.units)
        .where(sql`${schema.units.arrears} > 0`);
      
      const tenantIds = arrearsUnits.map((u: any) => u.tenantId).filter(Boolean);
      if (tenantIds.length > 0) {
        const usersInArrears = await this.db
          .select()
          .from(schema.users)
          .where(sql`${schema.users.id} IN ${tenantIds}`);
        targetEmails = usersInArrears.map((u: any) => u.email);
      }
    }

    if (targetEmails.length === 0) {
      return { success: false, message: 'No recipients matched the segment selection.' };
    }

    // Incorporate landlord.nl branding styling
    const headerHtml = `
      <div style="background-color: #1A2E3B; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; font-family: 'Outfit', sans-serif;">
        <span style="color: #FF5A5F; font-size: 24px; font-weight: bold; letter-spacing: 1px;">landlord.nl</span>
      </div>
    `;

    const bodyHtml = `
      <html>
        <head>
          <style>
            body { font-family: 'Outfit', 'Inter', sans-serif; background-color: #FAFAFA; color: #2D3748; margin: 0; padding: 20px; }
            .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .content { padding: 30px; line-height: 1.6; }
            .footer { background-color: #F7FAFC; padding: 15px; text-align: center; font-size: 12px; color: #A0AEC0; border-radius: 0 0 6px 6px; }
          </style>
        </head>
        <body>
          <div class="card">
            ${headerHtml}
            <div class="content">
              ${params.messageBody.replace(/\n/g, '<br/>')}
            </div>
            <div class="footer">
              This is an automated campaign notification from landlord.nl
            </div>
          </div>
        </body>
      </html>
    `;

    // Dispatch emails sequentially
    for (const email of targetEmails) {
      await this.emailService.sendEmail(email, params.subject, bodyHtml);
    }

    return {
      success: true,
      recipientsCount: targetEmails.length,
      message: 'Campaign emails dispatched successfully.',
    };
  }

  /**
   * Tool: save_email_template
   */
  async saveEmailTemplate(context: SecurityContext, params: { name: string; subject: string; body: string }) {
    await this.logActivity(context.userId, 'save_email_template', `Saved email template: ${params.name}`);
    
    // Store in general memory as template categories for Sophia to access
    const templateKey = `template:${params.name.toLowerCase().replace(/\s+/g, '_')}`;
    const value = JSON.stringify({ subject: params.subject, body: params.body });
    
    await this.db.insert(schema.agentMemory).values({
      userId: context.userId,
      key: templateKey,
      value,
    });

    return {
      success: true,
      message: `Template ${params.name} saved successfully.`,
    };
  }

  /**
   * Tool: get_notifications
   */
  async getNotifications(context: SecurityContext) {
    await this.logActivity(context.userId, 'get_notifications', 'Queried list of user notifications');
    const list = await this.db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, context.userId));

    return list.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  /**
   * Tool: undo_action
   */
  async undoAction(context: SecurityContext, params: { actionType: 'cancel_invoice' | 'unbookmark_contractor'; targetId: string }) {
    await this.logActivity(context.userId, 'undo_action', `Reverted action ${params.actionType} for id ${params.targetId}`);

    if (params.actionType === 'unbookmark_contractor') {
      await this.db
        .delete(schema.contractorBookmarks)
        .where(
          and(
            eq(schema.contractorBookmarks.userId, context.userId),
            eq(schema.contractorBookmarks.contractorId, params.targetId)
          )
        );
      return { success: true, message: 'Contractor bookmark removed.' };
    }

    if (params.actionType === 'cancel_invoice') {
      // Re-enable invoice status back to unpaid
      await this.db
        .update(schema.invoices)
        .set({ status: 'unpaid' })
        .where(eq(schema.invoices.id, params.targetId));
      return { success: true, message: 'Invoice restored to unpaid status.' };
    }

    return { success: false, message: 'Action not supported.' };
  }

  /**
   * Tool: view_company_finances
   */
  async viewCompanyFinances(context: SecurityContext) {
    await this.logActivity(context.userId, 'view_company_finances', 'Analyzed total company balance sheets');

    if (context.role === 'tenant') {
      throw new ForbiddenException('Tenant users cannot access total corporate finances.');
    }

    let targetOwnerId = context.userId;
    if (context.role !== 'manager') {
      const relation = await this.db
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.managerId, context.userId))
        .limit(1);
      if (relation.length > 0) {
        targetOwnerId = relation[0].ownerId;
      }
    }

    const invoicesList = await this.db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.ownerId, targetOwnerId));

    // Calculate revenue vs expenses
    let totalRentCollected = 0;
    let totalArrears = 0;
    let totalExpenses = 0;

    for (const inv of invoicesList) {
      const amount = Number(inv.amount) || 0;
      const paid = Number(inv.amountPaid) || 0;
      if (inv.type === 'Rent') {
        totalRentCollected += paid;
        totalArrears += (amount - paid);
      } else {
        // Maintenance, capital charges, utility expenses
        totalExpenses += amount;
      }
    }

    const netOperatingIncome = totalRentCollected - totalExpenses;

    return {
      grossCollections: totalRentCollected,
      totalExpenses,
      outstandingArrears: totalArrears,
      netOperatingIncome,
      currency: 'EUR',
    };
  }

  /**
   * Tool: log_agent_error
   */
  async logAgentError(context: SecurityContext, params: { errorName: string; errorMessage: string; taskContext: string }) {
    const errorId = 'err-' + randomUUID().substring(0, 8);
    try {
      await this.db.insert(schema.agentErrors).values({
        id: errorId,
        userId: context.userId,
        errorName: params.errorName,
        errorMessage: params.errorMessage,
        taskContext: params.taskContext,
        occurredAt: new Date(),
      });
      return { success: true, errorId };
    } catch (e) {
      console.error('Failed to log agent error to database:', e);
      return { success: false, message: 'Friction writing error log.' };
    }
  }

  /**
   * Tool: check_recent_errors
   */
  async checkRecentErrors(context: SecurityContext, params: { errorName: string }) {
    // Query errors matching the name occurred in past 7 days
    const recent = await this.db
      .select()
      .from(schema.agentErrors)
      .where(and(eq(schema.agentErrors.userId, context.userId), eq(schema.agentErrors.errorName, params.errorName)));

    return {
      occurrenceCount: recent.length,
      history: recent.map((r: any) => ({
        id: r.id,
        occurredAt: r.occurredAt,
        taskContext: r.taskContext,
      })),
    };
  }

  /**
   * Tool: send_escalation_email
   */
  async sendEscalationEmail(context: SecurityContext, params: { errorDetails: string }) {
    const subject = `CRITICAL: Sophia AI Error Escalation`;
    const bodyHtml = `
      <h3>Sophia Agent System Alert</h3>
      <p>The agent operating under user ID <strong>${context.userId}</strong> has encountered a recurring crash or block during execution.</p>
      <p><strong>Error Details:</strong></p>
      <pre style="background: #F7FAFC; padding: 15px; border-radius: 4px; border: 1px solid #E2E8F0;">${params.errorDetails}</pre>
      <hr/>
      <p>Reported automatically by Sophia Agent Infrastructure.</p>
    `;

    await this.emailService.sendEmail('mark.mainac@gmail.com', subject, bodyHtml);
    return { success: true, message: 'System escalation email has been dispatched to developer.' };
  }

  /**
   * Complete function schema declarations
   */
  getToolsDeclarations() {
    return [
      {
        type: 'function',
        function: {
          name: 'calculate_formula',
          description: 'Performs mathematical computations, lease rate calculators, and corporate balance sheet totals.',
          parameters: {
            type: 'object',
            properties: {
              formula: { type: 'string', description: 'Mathematical expression (e.g. 2500 * 12 - 450)' }
            },
            required: ['formula']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_portfolio_summary',
          description: 'Get summary metrics of properties, units, occupancy, active tickets, and outstanding arrears.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_properties',
          description: 'List details of owned or managed properties.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'add_property',
          description: 'Add a new property to the portfolio and automatically create default vacant units.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name of the building' },
              address: { type: 'string', description: 'Street address' },
              unitsCount: { type: 'number', description: 'Number of units to generate defaults' },
              photoUrl: { type: 'string', description: 'Optional property photo URL' },
            },
            required: ['name', 'address'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'upload_property_setup',
          description: 'Simulates property batch loading by importing an Excel/CSV onboarding setup file.',
          parameters: {
            type: 'object',
            properties: {
              fileName: { type: 'string', description: 'Excel spreadsheet file name' },
              rowCount: { type: 'number', description: 'Number of rows to import' },
            },
            required: ['fileName', 'rowCount'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'update_property_image',
          description: 'Upload and assign a main cover photo for a property.',
          parameters: {
            type: 'object',
            properties: {
              propertyId: { type: 'string', description: 'Target property ID' },
              photoUrl: { type: 'string', description: 'Image asset link URL' },
            },
            required: ['propertyId', 'photoUrl'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_maintenance_ticket',
          description: 'Create a maintenance ticket for a specific property and unit.',
          parameters: {
            type: 'object',
            properties: {
              propertyId: { type: 'string' },
              unitId: { type: 'string' },
              description: { type: 'string' },
              urgency: { type: 'string', enum: ['critical', 'medium', 'low'] },
              category: { type: 'string' },
            },
            required: ['propertyId', 'unitId', 'description', 'urgency'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'find_contractors',
          description: 'Retrieve contractors matching a specific specialty.',
          parameters: {
            type: 'object',
            properties: { specialty: { type: 'string' } },
            required: ['specialty'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'bookmark_contractor',
          description: 'Add a contractor to your preferred bookmarks in the marketplace.',
          parameters: {
            type: 'object',
            properties: { contractorId: { type: 'string' } },
            required: ['contractorId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'assign_contractor_to_ticket',
          description: 'Assign a contractor to handle a ticket and specify a proposed rate (useful for cost negotiation).',
          parameters: {
            type: 'object',
            properties: {
              ticketId: { type: 'string' },
              contractorId: { type: 'string' },
              proposedHourlyRate: { type: 'number', description: 'Target hourly wage' },
              proposedAmount: { type: 'number', description: 'Fixed price budget' },
            },
            required: ['ticketId', 'contractorId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'check_job_status',
          description: 'Check if a job was rejected, accepted, or completed by the assigned contractor.',
          parameters: {
            type: 'object',
            properties: { ticketId: { type: 'string' } },
            required: ['ticketId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'save_user_note',
          description: 'Saves a personal reminder note to the database.',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['title', 'content'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_invoices',
          description: 'Retrieve invoices.',
          parameters: {
            type: 'object',
            properties: { status: { type: 'string', enum: ['paid', 'unpaid', 'pending'] } },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_tenant_invoice',
          description: 'Create an invoice charged to a tenant (e.g. charging them rent or for maintenance damage caused by their mistake).',
          parameters: {
            type: 'object',
            properties: {
              tenantId: { type: 'string' },
              propertyId: { type: 'string' },
              amount: { type: 'number' },
              description: { type: 'string', description: 'Detailed reason for invoice' },
              type: { type: 'string', enum: ['Rent', 'Maintenance Charge', 'Deposit', 'Late Fee'] },
              dueDateDays: { type: 'number' },
            },
            required: ['tenantId', 'propertyId', 'amount', 'description'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_vacancy_invoice',
          description: 'Create an invoice on a vacant building itself for trackable upkeep expenses.',
          parameters: {
            type: 'object',
            properties: {
              propertyId: { type: 'string' },
              amount: { type: 'number' },
              description: { type: 'string' },
              type: { type: 'string', enum: ['Cleaning', 'Audit Fee', 'Utilities', 'Maintenance Upkeep'] },
            },
            required: ['propertyId', 'amount', 'description', 'type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'filter_records',
          description: 'Filter dataset records like tenants, invoices, expenses, tickets, or audit logs.',
          parameters: {
            type: 'object',
            properties: {
              dataset: { type: 'string', enum: ['tenants', 'invoices', 'expenses', 'tickets', 'audits'] },
              filterTerm: { type: 'string', description: 'Search keywords' },
              status: { type: 'string', description: 'Dataset specific status filter' },
            },
            required: ['dataset'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_email_campaign',
          description: 'Sends custom html styled emails to target tenant segments (all, specific, or arrears).',
          parameters: {
            type: 'object',
            properties: {
              targetSegment: { type: 'string', enum: ['all', 'arrears', 'specific'] },
              tenantEmails: { type: 'array', items: { type: 'string' } },
              subject: { type: 'string' },
              messageBody: { type: 'string' },
            },
            required: ['targetSegment', 'subject', 'messageBody'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'save_email_template',
          description: 'Adds custom email layout configurations into the templates library.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              subject: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['name', 'subject', 'body'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_notifications',
          description: 'Fetch all read, unread, and hidden notifications for the active user session.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'undo_action',
          description: 'Undo a previous action such as unbookmarking a contractor or restoring a cancelled/unpaid invoice.',
          parameters: {
            type: 'object',
            properties: {
              actionType: { type: 'string', enum: ['cancel_invoice', 'unbookmark_contractor'] },
              targetId: { type: 'string', description: 'ID of the invoice or contractor' }
            },
            required: ['actionType', 'targetId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'view_company_finances',
          description: 'Retrieves corporate balance sheets, rent collections, upkeep expenditures, and total operating margins.',
          parameters: { type: 'object', properties: {} }
        }
      },
      {
        type: 'function',
        function: {
          name: 'toggle_theme',
          description: 'Toggle the user interface theme between dark mode and light mode.',
          parameters: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['dark', 'light'] }
            },
            required: ['theme']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'toggle_sidebar',
          description: 'Expand or collapse the main navigation sidebar dashboard layout.',
          parameters: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['expand', 'collapse'] }
            },
            required: ['action']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'log_agent_error',
          description: 'Log an execution error to help developers fix Sophia.',
          parameters: {
            type: 'object',
            properties: {
              errorName: { type: 'string' },
              errorMessage: { type: 'string' },
              taskContext: { type: 'string', description: 'What task Sophia was executing when error happened' },
            },
            required: ['errorName', 'errorMessage', 'taskContext'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'check_recent_errors',
          description: 'Analyze how many times an error happened recently.',
          parameters: {
            type: 'object',
            properties: { errorName: { type: 'string' } },
            required: ['errorName'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'send_escalation_email',
          description: 'Escalate a repeated/recurring bug by sending alert details to mark.mainac@gmail.com.',
          parameters: {
            type: 'object',
            properties: { errorDetails: { type: 'string' } },
            required: ['errorDetails'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'move_tenant',
          description: 'Move a tenant to a vacant unit in a property.',
          parameters: {
            type: 'object',
            properties: {
              tenantId: { type: 'string' },
              unitId: { type: 'string', description: 'The ID of the vacant unit to move the tenant into' },
            },
            required: ['tenantId', 'unitId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'adjust_portfolio_rent',
          description: 'Adjust the rent for all units of a property programmatically (e.g. increase by a percentage or flat amount).',
          parameters: {
            type: 'object',
            properties: {
              propertyId: { type: 'string' },
              percentage: { type: 'number', description: 'Percentage to adjust rent, e.g. 5 for +5% or -3 for -3%' },
              amount: { type: 'number', description: 'Flat amount to adjust rent, e.g. 50 for +$50' },
            },
            required: ['propertyId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'update_property_details',
          description: 'Update the name and address of a property.',
          parameters: {
            type: 'object',
            properties: {
              propertyId: { type: 'string' },
              name: { type: 'string', optional: true },
              address: { type: 'string', optional: true },
            },
            required: ['propertyId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'mark_unit_vacant',
          description: 'Mark a unit as vacant, removing any active tenant reference.',
          parameters: {
            type: 'object',
            properties: {
              unitId: { type: 'string' },
            },
            required: ['unitId'],
          },
        },
      },
    ];
  }
}
