# Supabase Storage Setup for User Images

## 🗂️ **Storage Bucket Configuration**

You need to create a Supabase Storage bucket called `user-uploads` to store user uploaded images.

### 1. **Create Storage Bucket**

In your Supabase Dashboard:

1. Go to **Storage** section
2. Click **"New bucket"**
3. Set bucket name: `user-uploads`
4. Set as **Public bucket** (so images can be accessed via URL)
5. Click **"Create bucket"**

### 2. **Set Bucket Policies**

You need to set up Row Level Security (RLS) policies:

#### **Policy 1: Allow users to upload their own files**
```sql
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Policy 2: Allow users to view their own files**
```sql
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Policy 3: Allow users to delete their own files**
```sql
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. **File Structure**

Images will be stored with this structure:
```
user-uploads/
├── user-1/
│   ├── model_1_1234567890_abc123.jpg
│   ├── garment_1_1234567891_def456.png
│   └── ...
├── user-2/
│   ├── model_2_1234567892_ghi789.jpg
│   └── ...
└── ...
```

### 4. **Database Table Setup**

Run the SQL from `setup-user-images-table.sql` to create the database table.

## 🔧 **How It Works**

1. **Upload**: User uploads image → Stored in `user-uploads/user-{userId}/filename`
2. **Database**: Metadata saved to `user_uploaded_images` table
3. **Access**: User can view/download their images via My Images page
4. **Delete**: Removes both file from storage and database record

## 📊 **Features**

- ✅ **Secure**: Users can only access their own files
- ✅ **Scalable**: Uses Supabase Storage (not local filesystem)
- ✅ **Persistent**: Images survive server restarts
- ✅ **Count Display**: Shows number of uploaded images in sidebar
- ✅ **Full CRUD**: Upload, view, download, delete

## 🚀 **Testing**

1. Upload an image in the Generate page
2. Check "My Images" in the sidebar (should show count)
3. Click "My Images" to see uploaded images
4. Test download and delete functionality
