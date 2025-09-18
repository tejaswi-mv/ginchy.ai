// saas-starter/app/(dashboard)/actions.ts
'use server';

import { z } from 'zod';
import { validatedAction } from '@/lib/auth/middleware';
import { getPublicImages } from '../(login)/actions';
import { supabase } from '@/lib/supabase/client';

const askQuestionSchema = z.object({
  email: z.string().email().min(3).max(255),
  question: z.string().min(10).max(1000)
});

export const askQuestion = validatedAction(askQuestionSchema, async (data) => {
  console.log('New question submitted:');
  console.log('Email:', data.email);
  console.log('Question:', data.question);

  // Here you would typically send an email, save to a database, etc.
  return {
    success: 'Your question has been submitted successfully!'
  };
});

/**
 * Fetches public character models from the 'characters' folder in Supabase Storage.
 */
export async function getPublicCharacters() {
  // This action fetches images from the 'characters' directory in your public bucket.
  // It reuses the getPublicImages function for efficiency.
  const { data: fileList } = await supabase.storage
    .from('public-assets')
    .list('characters');

  if (!fileList) {
    return { data: [] };
  }

  const images = fileList
    .filter((file) => file.id !== null) // Filter out folders/non-files
    .map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(`characters/${file.name}`);
      return { name: file.name, url: publicUrl };
    });

  return { data: images };
}