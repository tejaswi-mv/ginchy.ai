import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userUploadedImages } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Fetch user's uploaded images
    const images = await db
      .select()
      .from(userUploadedImages)
      .where(eq(userUploadedImages.userId, userResult.id))
      .orderBy(desc(userUploadedImages.uploadedAt));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching user images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
