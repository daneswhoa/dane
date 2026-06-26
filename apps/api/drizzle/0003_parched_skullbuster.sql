ALTER TABLE "tickets" ALTER COLUMN "tenant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "tenant_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "category" varchar(100);