import { SecurityContext } from '../agent-tools.service';
import * as schema from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

export async function createMaintenanceTicketImpl(
  service: any,
  context: SecurityContext,
  params: { propertyId: string; unitId: string; description: string; urgency: string; category?: string }
) {
  await service.logActivity(context.userId, 'create_maintenance_ticket', `Created ticket for unit ${params.unitId}`);
  const ownerId = await service.checkPropertyAccess(params.propertyId, context);

  const unitList = await service.db
    .select()
    .from(schema.units)
    .where(and(eq(schema.units.id, params.unitId), eq(schema.units.propertyId, params.propertyId)))
    .limit(1);

  if (unitList.length === 0) {
    throw new BadRequestException(`Unit ${params.unitId} does not belong to property ${params.propertyId}.`);
  }

  const unit = unitList[0];
  const ticketId = 'ticket-' + randomUUID().substring(0, 8);

  await service.db.insert(schema.tickets).values({
    id: ticketId,
    ownerId,
    propertyId: params.propertyId,
    unitId: params.unitId,
    description: params.description,
    urgency: params.urgency,
    category: params.category || 'general',
    status: 'open',
    tenantId: unit.tenantId || null,
  });

  return {
    success: true,
    ticketId,
    message: 'Maintenance ticket created successfully.',
  };
}

export async function findContractorsImpl(service: any, specialty: string) {
  const list = await service.db
    .select()
    .from(schema.contractors)
    .where(eq(schema.contractors.specialty, specialty));

  return list.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    specialty: c.specialty,
    hourlyRate: c.hourlyRate,
    status: c.status,
  }));
}

export async function bookmarkContractorImpl(
  service: any, 
  context: SecurityContext, 
  params: { contractorId: string }
) {
  await service.logActivity(context.userId, 'bookmark_contractor', `Bookmarked contractor: ${params.contractorId}`);

  if (context.role === 'tenant') {
    throw new ForbiddenException('Tenants cannot bookmark contractors.');
  }

  const existing = await service.db
    .select()
    .from(schema.contractorBookmarks)
    .where(and(eq(schema.contractorBookmarks.userId, context.userId), eq(schema.contractorBookmarks.contractorId, params.contractorId)))
    .limit(1);

  if (existing.length > 0) {
    return { success: true, message: 'Contractor is already bookmarked.' };
  }

  await service.db.insert(schema.contractorBookmarks).values({
    id: 'bmark-' + randomUUID().substring(0, 8),
    userId: context.userId,
    contractorId: params.contractorId,
  });

  return {
    success: true,
    message: 'Contractor bookmarked successfully.',
  };
}

export async function assignContractorToTicketImpl(
  service: any,
  context: SecurityContext,
  params: { ticketId: string; contractorId: string; proposedHourlyRate?: number; proposedAmount?: number }
) {
  await service.logActivity(context.userId, 'assign_contractor_to_ticket', `Assigned contractor ${params.contractorId} to ticket ${params.ticketId}`);

  // Verify ticket ownership/manager access
  const ticketList = await service.db
    .select()
    .from(schema.tickets)
    .where(eq(schema.tickets.id, params.ticketId))
    .limit(1);

  if (ticketList.length === 0) {
    throw new BadRequestException(`Ticket ${params.ticketId} not found.`);
  }

  const ticket = ticketList[0];
  await service.checkPropertyAccess(ticket.propertyId, context);

  // Update ticket state to assigned
  await service.db
    .update(schema.tickets)
    .set({
      contractorId: params.contractorId,
      status: 'assigned',
      hourlyRate: params.proposedHourlyRate ? String(params.proposedHourlyRate) : null,
      amount: params.proposedAmount ? String(params.proposedAmount) : null,
      quoteStatus: 'pending',
    })
    .where(eq(schema.tickets.id, params.ticketId));

  return {
    success: true,
    message: 'Contractor assigned successfully. Awaiting contract approval or quote acceptance.',
  };
}

export async function checkJobStatusImpl(service: any, context: SecurityContext, params: { ticketId: string }) {
  const ticketList = await service.db
    .select()
    .from(schema.tickets)
    .where(eq(schema.tickets.id, params.ticketId))
    .limit(1);

  if (ticketList.length === 0) {
    throw new BadRequestException(`Ticket ${params.ticketId} not found.`);
  }

  const ticket = ticketList[0];
  await service.checkPropertyAccess(ticket.propertyId, context);

  return {
    ticketId: ticket.id,
    status: ticket.status, // open, assigned, completed, cancelled
    quoteStatus: ticket.quoteStatus, // pending, accepted, rejected
    contractorMessage: ticket.contractorMessage,
  };
}
