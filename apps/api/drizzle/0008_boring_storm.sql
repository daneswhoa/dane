CREATE TABLE "automations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"trigger_event" varchar(255) NOT NULL,
	"trigger_offset_days" integer DEFAULT 0 NOT NULL,
	"trigger_condition" varchar(50) NOT NULL,
	"template_id" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"channel" varchar(50) DEFAULT 'Email' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"amount" numeric NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"stripe_transaction_id" varchar(255),
	"reference_id" varchar(255),
	"status" varchar(50) NOT NULL,
	"metadata" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "allowed_properties" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "permissions" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "settings" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "scheduled_at" varchar(255);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "quote_amount" varchar(255);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "quote_status" varchar(50);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "contractor_message" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "proof_photo_url" varchar(512);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "recurring_fee_details" text;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "move_in_fee_details" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "allowed_properties" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "permissions" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_account_id" varchar(255);--> statement-breakpoint
ALTER TABLE "automations" ADD CONSTRAINT "automations_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_audits" ADD CONSTRAINT "financial_audits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "automations_owner_id_idx" ON "automations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "audits_user_id_idx" ON "financial_audits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audits_reference_id_idx" ON "financial_audits" USING btree ("reference_id");