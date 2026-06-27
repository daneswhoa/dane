import { SecurityContext } from '../agent-tools.service';
import * as schema from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

export async function getPropertiesImpl(service: any, context: SecurityContext) {
  await service.logActivity(context.userId, 'get_properties', 'Fetched properties list');

  if (context.role === 'tenant') {
    throw new ForbiddenException('You do not have permission to list properties.');
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
    .from(schema.properties)
    .where(eq(schema.properties.ownerId, targetOwnerId));

  if (context.role !== 'manager' && context.allowedProperties && context.allowedProperties !== 'all') {
    const allowedIds = context.allowedProperties.split(',');
    list = list.filter((p: any) => allowedIds.includes(p.id));
  }

  return list.map((p: any) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    unitsCount: p.unitsCount,
    status: p.status,
    photoUrl: p.photoUrl,
  }));
}

export async function addPropertyImpl(
  service: any, 
  context: SecurityContext, 
  params: { name: string; address: string; unitsCount?: number; photoUrl?: string }
) {
  await service.logActivity(context.userId, 'add_property', `Added new property: ${params.name}`);

  if (context.role === 'tenant') {
    throw new ForbiddenException('You do not have permission to add properties.');
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

  const propertyId = 'prop-' + randomUUID().substring(0, 8);
  const count = params.unitsCount || 1;

  await service.db.insert(schema.properties).values({
    id: propertyId,
    name: params.name,
    address: params.address,
    ownerId: targetOwnerId,
    unitsCount: count,
    status: 'active',
    photoUrl: params.photoUrl || null,
  });

  // Automatically create default units for this property
  for (let i = 1; i <= count; i++) {
    await service.db.insert(schema.units).values({
      id: `unit-${propertyId}-${i}`,
      propertyId,
      label: `Unit ${i}`,
      status: 'vacant',
      rent: 0,
      arrears: 0,
    });
  }

  return {
    success: true,
    propertyId,
    message: `Property ${params.name} created successfully with ${count} vacant units.`,
  };
}

export async function uploadPropertySetupImpl(
  service: any, 
  context: SecurityContext, 
  params: { fileName: string; rowCount: number }
) {
  await service.logActivity(context.userId, 'upload_property_setup', `Simulated setup file import: ${params.fileName}`);

  // Create a mock onboarding property representing the spreadsheet content
  const propertyParams = {
    name: 'Imported Building ' + randomUUID().substring(0, 4).toUpperCase(),
    address: '77 SpreadSheet Lane, Amsterdam',
    unitsCount: Math.min(params.rowCount, 10),
  };

  return addPropertyImpl(service, context, propertyParams);
}

export async function updatePropertyImageImpl(
  service: any, 
  context: SecurityContext, 
  params: { propertyId: string; photoUrl: string }
) {
  await service.checkPropertyAccess(params.propertyId, context);
  await service.logActivity(context.userId, 'update_property_image', `Updated property image: ${params.propertyId}`);

  await service.db
    .update(schema.properties)
    .set({ photoUrl: params.photoUrl })
    .where(eq(schema.properties.id, params.propertyId));

  return {
    success: true,
    photoUrl: params.photoUrl,
    message: `Property cover image updated successfully.`,
  };
}

export async function adjustPortfolioRentImpl(
  service: any, 
  context: SecurityContext, 
  params: { propertyId: string; percentage?: number; amount?: number }
) {
  await service.logActivity(context.userId, 'adjust_portfolio_rent', `Adjusting rent for property ${params.propertyId}`);

  if (context.role === 'tenant') {
    throw new ForbiddenException('Tenants cannot adjust portfolio rents.');
  }

  if (params.percentage === undefined && params.amount === undefined) {
    throw new BadRequestException('Either percentage or amount must be specified.');
  }

  const propList = await service.db
    .select()
    .from(schema.properties)
    .where(eq(schema.properties.id, params.propertyId))
    .limit(1);

  if (propList.length === 0) {
    throw new BadRequestException('Property not found.');
  }

  const property = propList[0];
  await service.checkPropertyAccess(params.propertyId, context);

  // Count units for reporting
  const [countResult] = await service.db
    .select({ total: sql<number>`count(*)::int` })
    .from(schema.units)
    .where(eq(schema.units.propertyId, params.propertyId));
  const adjustmentCount = countResult?.total || 0;

  // Bulk update all rents in a single query
  if (params.percentage !== undefined) {
    await service.db
      .update(schema.units)
      .set({ rent: sql`greatest(round(${schema.units.rent} * (1 + ${params.percentage} / 100.0)), 0)` })
      .where(eq(schema.units.propertyId, params.propertyId));
  } else if (params.amount !== undefined) {
    await service.db
      .update(schema.units)
      .set({ rent: sql`greatest(${schema.units.rent} + ${params.amount}, 0)` })
      .where(eq(schema.units.propertyId, params.propertyId));
  }

  const descStr = params.percentage !== undefined
    ? `Sophia adjusted rent for property "${property.name}" by ${params.percentage}% across ${adjustmentCount} units.`
    : `Sophia adjusted rent for property "${property.name}" by $${params.amount} across ${adjustmentCount} units.`;

  await service.db.insert(schema.auditLogs).values({
    id: 'audit-' + Math.random().toString(36).substring(2, 9),
    ownerId: property.ownerId,
    actorName: 'Sophia AI Assistant',
    actorEmail: 'sophia@landlord.nl',
    actorInitials: 'SP',
    categoryIconName: 'DollarSign',
    categoryLabel: 'Finance',
    description: descStr,
    severity: 'info',
    status: 'success',
    ip: '127.0.0.1',
    location: 'Local Loopback',
  });

  return {
    success: true,
    adjustedUnits: adjustmentCount,
    message: `Rent for property ${property.name} adjusted successfully across ${adjustmentCount} units.`
  };
}

export async function updatePropertyDetailsImpl(
  service: any, 
  context: SecurityContext, 
  params: { propertyId: string; name?: string; address?: string }
) {
  await service.logActivity(context.userId, 'update_property_details', `Updating details for property ${params.propertyId}`);

  if (context.role === 'tenant') {
    throw new ForbiddenException('Tenants cannot modify properties.');
  }

  const propList = await service.db
    .select()
    .from(schema.properties)
    .where(eq(schema.properties.id, params.propertyId))
    .limit(1);

  if (propList.length === 0) {
    throw new BadRequestException('Property not found.');
  }

  const property = propList[0];
  await service.checkPropertyAccess(params.propertyId, context);

  const updateData: any = {};
  if (params.name !== undefined) updateData.name = params.name;
  if (params.address !== undefined) updateData.address = params.address;

  if (Object.keys(updateData).length > 0) {
    await service.db
      .update(schema.properties)
      .set(updateData)
      .where(eq(schema.properties.id, params.propertyId));

    await service.db.insert(schema.auditLogs).values({
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      ownerId: property.ownerId,
      actorName: 'Sophia AI Assistant',
      actorEmail: 'sophia@landlord.nl',
      actorInitials: 'SP',
      categoryIconName: 'Building2',
      categoryLabel: 'Properties',
      description: `Sophia updated details for property "${params.name || property.name}".`,
      severity: 'info',
      status: 'success',
      ip: '127.0.0.1',
      location: 'Local Loopback',
    });
  }

  return {
    success: true,
    message: `Property details updated successfully.`
  };
}

export async function markUnitVacantImpl(service: any, context: SecurityContext, params: { unitId: string }) {
  await service.logActivity(context.userId, 'mark_unit_vacant', `Marking unit ${params.unitId} vacant`);

  if (context.role === 'tenant') {
    throw new ForbiddenException('Tenants cannot modify units.');
  }

  const unitList = await service.db
    .select({
      id: schema.units.id,
      label: schema.units.label,
      propertyId: schema.units.propertyId,
      propertyName: schema.properties.name,
      ownerId: schema.properties.ownerId,
    })
    .from(schema.units)
    .innerJoin(schema.properties, eq(schema.units.propertyId, schema.properties.id))
    .where(eq(schema.units.id, params.unitId))
    .limit(1);

  if (unitList.length === 0) {
    throw new BadRequestException('Unit not found.');
  }

  const unit = unitList[0];
  await service.checkPropertyAccess(unit.propertyId, context);

  await service.db
    .update(schema.units)
    .set({ status: 'vacant', tenantId: null })
    .where(eq(schema.units.id, params.unitId));

  await service.db.insert(schema.auditLogs).values({
    id: 'audit-' + Math.random().toString(36).substring(2, 9),
    ownerId: unit.ownerId,
    actorName: 'Sophia AI Assistant',
    actorEmail: 'sophia@landlord.nl',
    actorInitials: 'SP',
    categoryIconName: 'Home',
    categoryLabel: 'Properties',
    description: `Sophia marked unit "${unit.label}" of property "${unit.propertyName}" as vacant.`,
    severity: 'info',
    status: 'success',
    ip: '127.0.0.1',
    location: 'Local Loopback',
  });

  return {
    success: true,
    message: `Unit ${unit.label} marked as vacant.`
  };
}
