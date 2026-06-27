import { SecurityContext } from '../agent-tools.service';
import * as schema from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

export async function moveTenantImpl(
  service: any, 
  context: SecurityContext, 
  params: { tenantId: string; unitId: string }
) {
  await service.logActivity(context.userId, 'move_tenant', `Moving tenant ${params.tenantId} to unit ${params.unitId}`);

  if (context.role === 'tenant') {
    throw new ForbiddenException('Tenants cannot move other tenants.');
  }

  return await service.db.transaction(async (tx: any) => {
    // 1. Verify destination unit exists
    const destUnitList = await tx
      .select({
        id: schema.units.id,
        status: schema.units.status,
        label: schema.units.label,
        propertyId: schema.units.propertyId,
        propertyName: schema.properties.name,
        ownerId: schema.properties.ownerId,
      })
      .from(schema.units)
      .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
      .where(eq(schema.units.id, params.unitId))
      .limit(1);

    if (destUnitList.length === 0) {
      throw new BadRequestException('Destination unit not found.');
    }

    const destUnit = destUnitList[0];

    // 2. Enforce permission: manager owns/manages property of destUnit
    let targetOwnerId = context.userId;
    if (context.role !== 'manager') {
      const relation = await tx
        .select()
        .from(schema.managerRelations)
        .where(eq(schema.managerRelations.managerId, context.userId))
        .limit(1);
      if (relation.length > 0) {
        targetOwnerId = relation[0].ownerId;
      }
    }

    if (destUnit.ownerId !== targetOwnerId) {
      throw new ForbiddenException('Access denied. You do not manage the property of the destination unit.');
    }

    if (destUnit.status !== 'vacant') {
      throw new BadRequestException('Destination unit is not vacant.');
    }

    // 3. Find tenant
    const tenantList = await tx
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.id, params.tenantId), eq(schema.users.role, 'tenant')))
      .limit(1);

    if (tenantList.length === 0) {
      throw new BadRequestException('Tenant not found.');
    }

    const tenant = tenantList[0];

    // 4. Set former unit of tenant to vacant
    const formerUnitList = await tx
      .select({
        id: schema.units.id,
      })
      .from(schema.units)
      .where(eq(schema.units.tenantId, params.tenantId));

    for (const u of formerUnitList) {
      await tx
        .update(schema.units)
        .set({ tenantId: null, status: 'vacant' })
        .where(eq(schema.units.id, u.id));
    }

    // 5. Set new unit of tenant to occupied
    await tx
        .update(schema.units)
        .set({ tenantId: params.tenantId, status: 'occupied' })
        .where(eq(schema.units.id, params.unitId));

    // 6. Log audit log
    await tx.insert(schema.auditLogs).values({
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      ownerId: targetOwnerId,
      actorName: 'Sophia AI Assistant',
      actorEmail: 'sophia@landlord.nl',
      actorInitials: 'SP',
      categoryIconName: 'UserCheck',
      categoryLabel: 'Tenants',
      description: `Sophia moved tenant "${tenant.name}" to property "${destUnit.propertyName}" Unit ${destUnit.label}.`,
      severity: 'info',
      status: 'success',
      ip: '127.0.0.1',
      location: 'Local Loopback',
    });

    return {
      success: true,
      message: `Tenant ${tenant.name} moved to ${destUnit.propertyName} Unit ${destUnit.label} successfully.`
    };
  });
}

export async function getInvoicesImpl(
  service: any, 
  context: SecurityContext, 
  params?: { status?: string }
) {
  await service.logActivity(context.userId, 'get_invoices', 'Listed invoices');

  if (context.role === 'tenant') {
    const list = await service.db.select().from(schema.invoices).where(eq(schema.invoices.tenantId, context.userId));
    return params?.status ? list.filter((i: any) => i.status.toLowerCase() === params.status?.toLowerCase()) : list;
  }

  let targetOwnerId = context.userId;
  if (context.role !== 'manager') {
    const relation = await service.db
      .select()
      .from(schema.managerRelations)
      .where(eq(schema.managerRelations.managerId, context.userId))
      .limit(1);
    if (relation.length > 0) {
      targetOwnerId = relation[0].ownerId;
    }
  }

  let list = await service.db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.ownerId, targetOwnerId));

  if (context.role !== 'manager' && context.allowedProperties && context.allowedProperties !== 'all') {
    const allowedIds = context.allowedProperties.split(',');
    list = list.filter((i: any) => allowedIds.includes(i.propertyId));
  }

  if (params?.status) {
    list = list.filter((i: any) => i.status.toLowerCase() === params.status?.toLowerCase());
  }

  return list.map((i: any) => ({
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    amount: i.amount,
    amountPaid: i.amountPaid,
    status: i.status,
    type: i.type,
    tenantName: i.tenantName,
    dueDate: i.dueDate,
  }));
}

export async function createTenantInvoiceImpl(
  service: any,
  context: SecurityContext,
  params: { tenantId: string; propertyId: string; amount: number; description: string; type?: string; dueDateDays?: number }
) {
  await service.logActivity(context.userId, 'create_tenant_invoice', `Billing tenant ${params.tenantId} amount: ${params.amount}`);
  const ownerId = await service.checkPropertyAccess(params.propertyId, context);

  const tenantList = await service.db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, params.tenantId))
    .limit(1);

  if (tenantList.length === 0) {
    throw new BadRequestException('Tenant not found.');
  }

  const tenant = tenantList[0];
  const invoiceId = 'inv-' + randomUUID().substring(0, 8);
  const invoiceNum = 'INV-' + Date.now().toString().substring(8);
  const due = new Date();
  due.setDate(due.getDate() + (params.dueDateDays || 14));

  await service.db.insert(schema.invoices).values({
    id: invoiceId,
    invoiceNumber: invoiceNum,
    type: params.type || 'Rent',
    tenantId: params.tenantId,
    tenantEmail: tenant.email,
    tenantName: tenant.name,
    propertyId: params.propertyId,
    ownerId,
    amount: String(params.amount),
    amountPaid: '0',
    description: params.description,
    status: 'unpaid',
    dueDate: due,
  });

  return {
    success: true,
    invoiceId,
    invoiceNumber: invoiceNum,
    message: 'Tenant invoice created successfully.',
  };
}

export async function createVacancyInvoiceImpl(
  service: any,
  context: SecurityContext,
  params: { propertyId: string; amount: number; description: string; type: string }
) {
  await service.logActivity(context.userId, 'create_vacancy_invoice', `Billing vacant house invoice for property: ${params.propertyId}`);
  const ownerId = await service.checkPropertyAccess(params.propertyId, context);

  // Get owner user email and name for invoice records since tenant is null
  const owner = await service.db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, ownerId))
    .limit(1);

  const email = owner[0]?.email || 'finance@landlord.nl';
  const name = owner[0]?.name || 'Owner Corporate Account';

  const invoiceId = 'inv-vac-' + randomUUID().substring(0, 8);
  const invoiceNum = 'VAC-' + Date.now().toString().substring(8);
  const due = new Date();
  due.setDate(due.getDate() + 7);

  // Charge the invoice back to the owner as system tenant to satisfy Drizzle constraint
  await service.db.insert(schema.invoices).values({
    id: invoiceId,
    invoiceNumber: invoiceNum,
    type: params.type,
    tenantId: ownerId,
    tenantEmail: email,
    tenantName: `${name} (Vacant House Upkeep)`,
    propertyId: params.propertyId,
    ownerId,
    amount: String(params.amount),
    amountPaid: '0',
    description: params.description,
    status: 'unpaid',
    dueDate: due,
  });

  return {
    success: true,
    invoiceId,
    invoiceNumber: invoiceNum,
    message: 'Vacant house upkeep invoice filed successfully.',
  };
}
