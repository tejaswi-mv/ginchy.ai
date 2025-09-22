ALTER TABLE "assets" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credits" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
CREATE INDEX "assets_user_id_idx" ON "assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assets_type_idx" ON "assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "assets_user_type_idx" ON "assets" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "assets_created_at_idx" ON "assets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "generated_images_user_id_idx" ON "generated_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generated_images_created_at_idx" ON "generated_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "generated_images_user_created_idx" ON "generated_images" USING btree ("user_id","created_at");