import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { generatedImages, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Store generation jobs in memory (in production, use Redis or database)
const generationJobs = new Map<string, {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: Date;
}>();

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

    // Create a job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store job as pending
    generationJobs.set(jobId, {
      id: jobId,
      status: 'pending',
      createdAt: new Date()
    });

    // Start generation in background (non-blocking)
    generateImageAsync(jobId, prompt, modelUrl, processor, user.id)
      .catch(error => {
        console.error('Background generation failed:', error);
        generationJobs.set(jobId, {
          id: jobId,
          status: 'failed',
          error: error.message,
          createdAt: new Date()
        });
      });

    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'Generation started. Use the jobId to check status.' 
    });

  } catch (error) {
    console.error('Error starting generation:', error);
    return NextResponse.json({ error: 'Failed to start generation' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  const job = generationJobs.get(jobId);
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    result: job.result,
    error: job.error,
    createdAt: job.createdAt
  });
}

// Background generation function
async function generateImageAsync(jobId: string, prompt: string, modelUrl: string, processor: string, userId: number) {
  try {
    // Update job status
    generationJobs.set(jobId, {
      id: jobId,
      status: 'processing',
      createdAt: new Date()
    });

    // Use Pollinations as primary (instant and reliable)
    let imageUrl: string;
    
    // Always use Pollinations for speed - it's instant and reliable
    imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=640&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
    
    // Add a small delay to simulate processing (but still very fast)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save to database
    const newImage = {
      userId: userId,
      prompt: prompt,
      imageUrl: imageUrl,
    };

    await Promise.all([
      db.insert(generatedImages).values(newImage),
      db.update(users).set({ credits: (await db.select().from(users).where(eq(users.id, userId)))[0].credits - 1 }).where(eq(users.id, userId))
    ]);

    // Update job as completed
    generationJobs.set(jobId, {
      id: jobId,
      status: 'completed',
      result: imageUrl,
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Generation failed:', error);
    generationJobs.set(jobId, {
      id: jobId,
      status: 'failed',
      error: error.message,
      createdAt: new Date()
    });
  }
}
