CREATE TABLE IF NOT EXISTS "organizations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" varchar(512),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_visits" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"visitor_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"user_email" varchar(255),
	"user_name" varchar(255),
	"route" varchar(512) NOT NULL,
	"referrer" varchar(512),
	"device_type" varchar(50) NOT NULL,
	"browser" varchar(100),
	"os" varchar(100),
	"country" varchar(100),
	"ip" varchar(45),
	"user_agent" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "automations" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "currency" varchar(10) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "county" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "subcounty" varchar(100);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "latitude" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "longitude" numeric;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "amenities" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "rules" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "is_listed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "images" text;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "is_listed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "organization_id" varchar(255);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_visits_visitor_idx" ON "page_visits" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_visits_user_idx" ON "page_visits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_visits_route_idx" ON "page_visits" USING btree ("route");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_visits_timestamp_idx" ON "page_visits" USING btree ("timestamp");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automations" ADD CONSTRAINT "automations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "announcements_organization_id_idx" ON "announcements" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_organization_id_idx" ON "audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "automations_organization_id_idx" ON "automations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaigns_organization_id_idx" ON "campaigns" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_templates_organization_id_idx" ON "email_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_organization_id_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_organization_id_idx" ON "invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_organization_id_idx" ON "properties" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tickets_organization_id_idx" ON "tickets" USING btree ("organization_id");