ALTER TABLE "announcements" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "automations" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "organization_name" varchar(255);--> statement-breakpoint
CREATE INDEX "announcements_organization_name_idx" ON "announcements" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "audit_logs_organization_name_idx" ON "audit_logs" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "automations_organization_name_idx" ON "automations" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "campaigns_organization_name_idx" ON "campaigns" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "email_templates_organization_name_idx" ON "email_templates" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "invitations_owner_id_idx" ON "invitations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "invitations_organization_name_idx" ON "invitations" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "invoices_organization_name_idx" ON "invoices" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "properties_organization_name_idx" ON "properties" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "tickets_organization_name_idx" ON "tickets" USING btree ("organization_name");