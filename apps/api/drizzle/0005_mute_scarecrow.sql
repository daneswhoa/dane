ALTER TABLE "invitation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitation_permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member_permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "invitation" CASCADE;--> statement-breakpoint
DROP TABLE "invitation_permissions" CASCADE;--> statement-breakpoint
DROP TABLE "member" CASCADE;--> statement-breakpoint
DROP TABLE "member_permissions" CASCADE;--> statement-breakpoint
DROP TABLE "organization" CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS "tickets_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "units" DROP COLUMN "organization_id";