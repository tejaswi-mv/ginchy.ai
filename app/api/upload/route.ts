import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { userUploadedImages } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${user.id}_${timestamp}_${randomString}.${fileExtension}`;

    // Try Supabase Storage first, fallback to local storage
    let publicUrl: string;
    let uploadSuccess = false;

    try {
      const supabase = await createClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(`user-${user.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.warn('Supabase upload failed, falling back to local storage:', uploadError);
        throw new Error('Supabase bucket not available');
      }

      // Get public URL from Supabase Storage
      const { data: { publicUrl: supabaseUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(`user-${user.id}/${fileName}`);
      
      publicUrl = supabaseUrl;
      uploadSuccess = true;
    } catch (supabaseError) {
      console.log('Using local storage fallback');
      
      // Fallback to local storage
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, ignore error
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to public/uploads directory
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      // Generate public URL
      publicUrl = `/uploads/${fileName}`;
      uploadSuccess = true;
    }

    // Save image information to database
    try {
      await db.insert(userUploadedImages).values({
        userId: user.id,
        fileName: fileName,
        originalName: file.name,
        imageUrl: publicUrl,
        fileSize: file.size,
        mimeType: file.type,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // If database save fails, try to delete the uploaded file
      await supabase.storage
        .from('user-uploads')
        .remove([`user-${user.id}/${fileName}`]);
      return NextResponse.json({ error: 'Failed to save image metadata' }, { status: 500 });
    }

    // For model photos, we could trigger NanoBanana model training here
    if (type === 'model') {
      // TODO: Integrate with NanoBanana API to train custom model
      console.log('Model photo uploaded, ready for training:', publicUrl);
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName,
      type: type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
