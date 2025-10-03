import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { generatedImages, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Image-based generation API called');
    
    const user = await getUser();
    console.log('User:', user ? 'authenticated' : 'not authenticated');
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((user.credits || 0) <= 0) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { prompt, modelUrl, poseUrl, garmentUrl, environmentUrl, cameraView, lensAngle, aspectRatio } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build enhanced prompt with image references
    let enhancedPrompt = prompt;
    
    // Add specific instructions for image-based generation
    if (modelUrl) {
      enhancedPrompt += `, using this character as reference: ${modelUrl}`;
    }
    if (poseUrl) {
      enhancedPrompt += `, using this pose as reference: ${poseUrl}`;
    }
    if (garmentUrl) {
      enhancedPrompt += `, wearing this garment: ${garmentUrl}`;
    }
    if (environmentUrl) {
      enhancedPrompt += `, in this environment: ${environmentUrl}`;
    }
    
    // Add camera and lens settings
    if (cameraView) {
      enhancedPrompt += `, ${cameraView.toLowerCase()}`;
    }
    if (lensAngle) {
      enhancedPrompt += `, ${lensAngle.toLowerCase()}`;
    }
    
    // Add aspect ratio context
    if (aspectRatio) {
      const ratioMap: Record<string, string> = {
        '1:1': 'square format',
        '9:16': 'portrait format',
        '16:9': 'landscape format',
        '3:2': 'classic photography format',
        '2:3': 'vertical format'
      };
      enhancedPrompt += `, ${ratioMap[aspectRatio] || aspectRatio}`;
    }
    
    // Add professional photography terms
    enhancedPrompt += ', professional photography, high quality, detailed, fashion photography';
    
    console.log('Enhanced prompt with image references:', enhancedPrompt);
    
    // Use Pollinations with image references
    let imageUrl: string;
    
    try {
      // Build Pollinations URL with image references
      let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=640&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
      
      // Add image references as parameters
      if (modelUrl) {
        pollinationsUrl += `&image=${encodeURIComponent(modelUrl)}`;
      }
      if (poseUrl) {
        pollinationsUrl += `&pose=${encodeURIComponent(poseUrl)}`;
      }
      if (garmentUrl) {
        pollinationsUrl += `&garment=${encodeURIComponent(garmentUrl)}`;
      }
      if (environmentUrl) {
        pollinationsUrl += `&environment=${encodeURIComponent(environmentUrl)}`;
      }
      
      imageUrl = pollinationsUrl;
      console.log('Pollinations URL with references:', imageUrl);
      
    } catch (error) {
      console.log('Pollinations failed, using basic fallback:', error);
      // Basic fallback without image references
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=640&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
      console.log('Basic fallback image URL:', imageUrl);
    }

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
      message: 'Image generated with references!' 
    });

  } catch (error) {
    console.error('Error generating image with references:', error);
    return NextResponse.json({ error: 'Failed to generate image with references' }, { status: 500 });
  }
}
