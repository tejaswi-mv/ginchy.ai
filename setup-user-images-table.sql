-- Create user_uploaded_images table
CREATE TABLE IF NOT EXISTS user_uploaded_images (
  id serial PRIMARY KEY NOT NULL,
  user_id integer NOT NULL,
  file_name varchar(255) NOT NULL,
  original_name varchar(255) NOT NULL,
  image_url text NOT NULL,
  file_size integer,
  mime_type varchar(100),
  uploaded_at timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_uploaded_images_user_id_idx 
ON user_uploaded_images USING btree (user_id);

CREATE INDEX IF NOT EXISTS user_uploaded_images_uploaded_at_idx 
ON user_uploaded_images USING btree (uploaded_at);

CREATE INDEX IF NOT EXISTS user_uploaded_images_user_uploaded_idx 
ON user_uploaded_images USING btree (user_id, uploaded_at);

-- Add foreign key constraint
ALTER TABLE user_uploaded_images 
ADD CONSTRAINT IF NOT EXISTS user_uploaded_images_user_id_users_id_fk 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE no action ON UPDATE no action;
