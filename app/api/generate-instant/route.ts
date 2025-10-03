import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { generatedImages, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((user.credits || 0) <= 0) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 400 });
    }

    const body = await request.json();
    const { prompt, modelUrl, processor = 'Nano Banana' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate image URL instantly using Pollinations
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=640&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;

    // Save to database
    const newImage = {
      userId: user.id,
      prompt: prompt,
      imageUrl: imageUrl,
    };

    // Update credits and save image
    await Promise.all([
      db.insert(generatedImages).values(newImage),
      db.update(users).set({ credits: (user.credits || 0) - 1 }).where(eq(users.id, user.id))
    ]);

    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      message: 'Image generated instantly!' 
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
