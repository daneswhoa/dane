import { pgTable, varchar, text, integer, numeric, boolean, timestamp, serial, index, customType } from 'drizzle-orm/pg-core';

export const numericNumber = customType<{ data: number; driverData: string }>({
  dataType() {
    return 'numeric';
  },
  toDriver(value: number): string {
    return String(value);
  },
  fromDriver(value: string): number {
    return Number(value || 0);
  },
});

// ── Users (managed by Better Auth, but we define the shape for Drizzle) ──

export const users = pgTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('tenant'),
  image: varchar('image', { length: 512 }),
  emailVerified: boolean('email_verified').default(false),
  organizationName: varchar('organization_name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  idNumber: varchar('id_number', { length: 100 }),
  leaseStart: timestamp('lease_start'),
  leaseEnd: timestamp('lease_end'),
  kinDetails: text('kin_details'),
  allowedProperties: text('allowed_properties'),
  permissions: text('permissions'),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Better Auth session table
export const sessions = pgTable('session', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  token: varchar('token', { length: 512 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Better Auth account table (for OAuth providers)
export const accounts = pgTable('account', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('access_token_expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Better Auth verification table
export const verifications = pgTable('verification', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});



// ── Properties ──

export const properties = pgTable('properties', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => users.id),
  unitsCount: integer('units_count').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  photoUrl: varchar('photo_url', { length: 512 }),
  settings: text('settings'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('properties_owner_id_idx').on(table.ownerId),
]);

// ── Units ──

export const units = pgTable('units', {
  id: varchar('id', { length: 255 }).primaryKey(),
  propertyId: varchar('property_id', { length: 255 }).notNull().references(() => properties.id),
  label: varchar('label', { length: 100 }).notNull(),
  rent: numericNumber('rent').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('vacant'),
  tenantId: varchar('tenant_id', { length: 255 }).references(() => users.id),
  floor: varchar('floor', { length: 50 }),
  unitType: varchar('unit_type', { length: 255 }),
  deposit: numericNumber('deposit').notNull().default(0),
  moveInFees: numericNumber('move_in_fees').notNull().default(0),
  recurringFees: numericNumber('recurring_fees').notNull().default(0),
  recurringFeeDetails: text('recurring_fee_details'),
  moveInFeeDetails: text('move_in_fee_details'),
  arrears: numericNumber('arrears').notNull().default(0),
}, (table) => [
  index('units_property_id_idx').on(table.propertyId),
  index('units_tenant_id_idx').on(table.tenantId),
]);

// ── Invoices ──

export const invoices = pgTable('invoices', {
  id: varchar('id', { length: 255 }).primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  type: varchar('type', { length: 100 }).default('Rent'),
  tenantId: varchar('tenant_id', { length: 255 }).notNull().references(() => users.id),
  tenantEmail: varchar('tenant_email', { length: 255 }).notNull(),
  tenantName: varchar('tenant_name', { length: 255 }).notNull(),
  unitId: varchar('unit_id', { length: 255 }).references(() => units.id),
  propertyId: varchar('property_id', { length: 255 }).references(() => properties.id),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => users.id),
  amount: numericNumber('amount').notNull(),
  amountPaid: numericNumber('amount_paid').notNull().default(0),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('unpaid'),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('invoices_tenant_id_idx').on(table.tenantId),
  index('invoices_property_id_idx').on(table.propertyId),
  index('invoices_owner_id_idx').on(table.ownerId),
]);

// ── Tickets (Maintenance) ──

export const tickets = pgTable('tickets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }),
  description: text('description').notNull(),
  urgency: varchar('urgency', { length: 50 }).notNull(),
  category: varchar('category', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  tenantId: varchar('tenant_id', { length: 255 }).references(() => users.id),
  tenantEmail: varchar('tenant_email', { length: 255 }),
  propertyId: varchar('property_id', { length: 255 }).references(() => properties.id),
  unitId: varchar('unit_id', { length: 255 }).references(() => units.id),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => users.id),
  contractorId: varchar('contractor_id', { length: 255 }).references(() => users.id),
  amount: numericNumber('amount'),
  hourlyRate: numericNumber('hourly_rate'),
  maxAuthorization: numericNumber('max_authorization'),
  photoUrl: varchar('photo_url', { length: 512 }),
  rating: integer('rating'),
  ratingComment: text('rating_comment'),
  scheduledAt: varchar('scheduled_at', { length: 255 }),
  quoteAmount: varchar('quote_amount', { length: 255 }),
  quoteStatus: varchar('quote_status', { length: 50 }),
  contractorMessage: text('contractor_message'),
  proofPhotoUrl: varchar('proof_photo_url', { length: 512 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('tickets_tenant_id_idx').on(table.tenantId),
  index('tickets_property_id_idx').on(table.propertyId),
  index('tickets_owner_id_idx').on(table.ownerId),
]);

// ── Contractors ──

export const contractors = pgTable('contractors', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).unique().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 50 }),
  specialty: varchar('specialty', { length: 255 }).notNull(),
  bio: text('bio'),
  hourlyRate: numericNumber('hourly_rate'),
  photoUrl: varchar('photo_url', { length: 512 }),
  status: varchar('status', { length: 50 }).default('available'),
  locationName: varchar('location_name', { length: 255 }),
  latitude: numericNumber('latitude'),
  longitude: numericNumber('longitude'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Agent ──

export const agentConversations = pgTable('agent_conversations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  messages: text('messages').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentMemory = pgTable('agent_memory', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Financial Audits ──

export const financialAudits = pgTable('financial_audits', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  amount: numericNumber('amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('usd'),
  stripeTransactionId: varchar('stripe_transaction_id', { length: 255 }),
  referenceId: varchar('reference_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull(),
  metadata: text('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('audits_user_id_idx').on(table.userId),
  index('audits_reference_id_idx').on(table.referenceId),
]);

export const agentActivityLog = pgTable('agent_activity_log', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  description: text('description').notNull(),
  toolName: varchar('tool_name', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('success'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Invitations ──

export const invitations = pgTable('invitations', {
  id: varchar('id', { length: 255 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  targetRole: varchar('target_role', { length: 50 }).notNull().default('tenant'),
  propertyId: varchar('property_id', { length: 255 }),
  unitId: varchar('unit_id', { length: 255 }),
  allowedProperties: text('allowed_properties'),
  permissions: text('permissions'),
  used: boolean('used').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Manager Relations ──

export const managerRelations = pgTable('manager_relations', {
  id: serial('id').primaryKey(),
  managerId: varchar('manager_id', { length: 255 }).notNull().references(() => users.id),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('manager_relations_manager_id_idx').on(table.managerId),
  index('manager_relations_owner_id_idx').on(table.ownerId),
]);

// ── Email Templates ──

export const emailTemplates = pgTable('email_templates', {
  id: varchar('id', { length: 255 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('email_templates_owner_id_idx').on(table.ownerId),
]);

// ── Campaigns ──

export const campaigns = pgTable('campaigns', {
  id: varchar('id', { length: 255 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  audienceType: varchar('audience_type', { length: 50 }).notNull(), // 'all' | 'team' | 'property' | 'arrears'
  targetId: varchar('target_id', { length: 255 }), // e.g. propertyId if type is 'property'
  status: varchar('status', { length: 50 }).notNull().default('draft'), // 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduledAt: timestamp('scheduled_at'),
  sentCount: integer('sent_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('campaigns_owner_id_idx').on(table.ownerId),
]);

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => users.id),
  actorName: varchar('actor_name', { length: 255 }).notNull(),
  actorEmail: varchar('actor_email', { length: 255 }).notNull(),
  actorInitials: varchar('actor_initials', { length: 50 }).notNull(),
  categoryIconName: varchar('category_icon_name', { length: 100 }).notNull(),
  categoryLabel: varchar('category_label', { length: 100 }).notNull(),
  description: text('description').notNull(),
  ip: varchar('ip', { length: 45 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => [
  index('audit_logs_owner_id_idx').on(table.ownerId),
]);

export const automations = pgTable('automations', {
  id: varchar('id', { length: 255 }).primaryKey(),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  triggerEvent: varchar('trigger_event', { length: 255 }).notNull(),
  triggerOffsetDays: integer('trigger_offset_days').notNull().default(0),
  triggerCondition: varchar('trigger_condition', { length: 50 }).notNull(), // 'before', 'after', 'on_event'
  templateId: varchar('template_id', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  channel: varchar('channel', { length: 50 }).notNull().default('Email'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('automations_owner_id_idx').on(table.ownerId),
]);

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  link: varchar('link', { length: 500 }),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('notifications_user_id_idx').on(table.userId),
]);

export const userNotes = pgTable('user_notes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('user_notes_user_id_idx').on(table.userId),
]);

export const agentErrors = pgTable('agent_errors', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  errorName: varchar('error_name', { length: 255 }).notNull(),
  errorMessage: text('error_message').notNull(),
  taskContext: text('task_context').notNull(),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
});

export const contractorBookmarks = pgTable('contractor_bookmarks', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  contractorId: varchar('contractor_id', { length: 255 }).primaryKey(), // Using contractorId as primary key
  createdAt: timestamp('created_at').defaultNow().notNull(),
});




