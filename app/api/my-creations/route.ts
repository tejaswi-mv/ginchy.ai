import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { generatedImages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser, getCreationsForUser } from '@/lib/db/queries';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use optimized query with proper indexing
    const images = await getCreationsForUser(user.id, 100);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching user creations:', error);
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json({ images: [] });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Delete the image
    await db
      .delete(generatedImages)
      .where(
        and(eq(generatedImages.id, imageId), eq(generatedImages.userId, user.id))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
