CREATE TABLE "announcements" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"audience_type" varchar(50) NOT NULL,
	"target_property_id" varchar(255),
	"arrears_filter" varchar(50) NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_target_property_id_properties_id_fk" FOREIGN KEY ("target_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_owner_id_idx" ON "announcements" USING btree ("owner_id");