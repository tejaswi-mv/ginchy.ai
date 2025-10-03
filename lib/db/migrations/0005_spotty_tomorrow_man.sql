ALTER TABLE "teams" ADD COLUMN "package_tier" varchar(20) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "monthly_credits" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "max_models" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "max_videos" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "has_upscaling" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "has_batch_processing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "has_api" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "has_priority_support" boolean DEFAULT false NOT NULL;