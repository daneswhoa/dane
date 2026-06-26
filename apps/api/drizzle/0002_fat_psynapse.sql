ALTER TABLE "invoices" ADD COLUMN "invoice_number" varchar(100);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "type" varchar(100) DEFAULT 'Rent';--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "floor" varchar(50);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "unit_type" varchar(255);--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "deposit" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "move_in_fees" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "recurring_fees" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "arrears" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "id_number" varchar(100);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lease_start" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lease_end" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "kin_details" text;