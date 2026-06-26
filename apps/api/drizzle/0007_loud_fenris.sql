CREATE TABLE "audit_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"actor_name" varchar(255) NOT NULL,
	"actor_email" varchar(255) NOT NULL,
	"actor_initials" varchar(50) NOT NULL,
	"category_icon_name" varchar(100) NOT NULL,
	"category_label" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"ip" varchar(45) NOT NULL,
	"location" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "rent" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "deposit" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "move_in_fees" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "recurring_fees" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "arrears" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_owner_id_idx" ON "audit_logs" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "campaigns_owner_id_idx" ON "campaigns" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "email_templates_owner_id_idx" ON "email_templates" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_idx" ON "invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "invoices_property_id_idx" ON "invoices" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "invoices_owner_id_idx" ON "invoices" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "manager_relations_manager_id_idx" ON "manager_relations" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "manager_relations_owner_id_idx" ON "manager_relations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "properties_owner_id_idx" ON "properties" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "tickets_tenant_id_idx" ON "tickets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tickets_property_id_idx" ON "tickets" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "tickets_owner_id_idx" ON "tickets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "units_property_id_idx" ON "units" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "units_tenant_id_idx" ON "units" USING btree ("tenant_id");