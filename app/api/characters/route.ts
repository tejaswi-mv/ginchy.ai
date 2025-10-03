import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { assets } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's character assets
    const characters = await db
      .select()
      .from(assets)
      .where(
        and(
          eq(assets.userId, user.id),
          eq(assets.type, 'characters')
        )
      )
      .orderBy(assets.createdAt);

    // Parse metadata for each character
    const charactersWithMetadata = characters.map(character => ({
      ...character,
      metadata: character.metadata ? JSON.parse(character.metadata) : {}
    }));

    return NextResponse.json({ characters: charactersWithMetadata });

  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}
