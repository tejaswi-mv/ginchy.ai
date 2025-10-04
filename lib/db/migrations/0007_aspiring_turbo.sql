CREATE TABLE "user_uploaded_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_uploaded_images" ADD CONSTRAINT "user_uploaded_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_uploaded_images_user_id_idx" ON "user_uploaded_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_uploaded_images_uploaded_at_idx" ON "user_uploaded_images" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "user_uploaded_images_user_uploaded_idx" ON "user_uploaded_images" USING btree ("user_id","uploaded_at");