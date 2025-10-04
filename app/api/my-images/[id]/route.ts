import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userUploadedImages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const userResult = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, user.email!),
    });

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const imageId = parseInt(params.id);
    if (isNaN(imageId)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    // Get the image record first to get the file path
    const imageRecord = await db
      .select()
      .from(userUploadedImages)
      .where(
        and(
          eq(userUploadedImages.id, imageId),
          eq(userUploadedImages.userId, userResult.id)
        )
      )
      .limit(1);

    if (imageRecord.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const image = imageRecord[0];

    // Delete the image from database
    await db
      .delete(userUploadedImages)
      .where(
        and(
          eq(userUploadedImages.id, imageId),
          eq(userUploadedImages.userId, userResult.id)
        )
      );

    // Delete the file from storage (Supabase or local)
    try {
      const supabase = await createClient();
      await supabase.storage
        .from('user-uploads')
        .remove([`user-${userResult.id}/${image.fileName}`]);
    } catch (storageError) {
      console.log('Supabase storage deletion failed, trying local file deletion');
      
      // Fallback: try to delete local file
      try {
        const { unlink } = await import('fs/promises');
        const { join } = await import('path');
        const filePath = join(process.cwd(), 'public', 'uploads', image.fileName);
        await unlink(filePath);
      } catch (localError) {
        console.error('Error deleting local file:', localError);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
