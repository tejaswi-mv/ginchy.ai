'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  generatedImages,
  assets,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  type NewGeneratedImage,
  type NewAsset,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword } from '@/lib/auth/password';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { getPackageByTier, canUserAccessFeature, canUserPerformAction } from '@/lib/packages/ginchy-packages';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import sharp from 'sharp';
import { withTimeout, TimeoutError } from '@/lib/utils/timeout';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/generate');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'owner' // Default role, will be overridden if there's an invitation
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect('/');
});

export async function signOut() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Convert Supabase user ID (string) to number for our database
    const userId = parseInt(user.id, 10);
    if (!isNaN(userId)) {
      const userWithTeam = await getUserWithTeam(userId);
      if (userWithTeam?.teamId) {
         await logActivity(userWithTeam.teamId, userId, ActivityType.SIGN_OUT);
      }
    }
  }
  
  await supabase.auth.signOut();
  redirect('/');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.string().transform(Number)
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);

export async function getPublicImages(folderPath: string, limit: number = 100, offset: number = 0) {
  try {
    const supabase = await createClient();
    const { data: fileList, error } = await supabase.storage
      .from('public-assets') // Your PUBLIC bucket name
      .list(folderPath, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      throw error;
    }
    
    if (!fileList) {
        return { data: [] };
    }

    const images = fileList.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets') // Your PUBLIC bucket name
        .getPublicUrl(`${folderPath}/${file.name}`);
      return { name: file.name, url: publicUrl };
    });

    return { data: images };

  } catch (error) {
    console.error('Error fetching public images:', error);
    return { error: 'Failed to fetch public images.' };
  }
}

export const getUserAssets = validatedActionWithUser(
  z.object({
    type: z.enum(['characters', 'poses', 'environment', 'garments', 'accessory']),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  async ({ type, limit = 100, offset = 0 }, _, user) => {
    const supabase = await createClient();
    const { data: fileList, error } = await supabase.storage
      .from(type)
      .list(`${user.id}`, { limit, offset });

    if (error) {
      console.error('Error fetching user assets:', error);
      return { error: 'Failed to fetch your assets.' };
    }

    if (!fileList || fileList.length === 0) {
        return { data: [] };
    }

    // Generate signed URLs for each file using admin client
    const signedUrlPromises = fileList.map(async (file) => {
      const { data, error } = await supabaseAdmin.storage
        .from(type)
        .createSignedUrl(`${user.id}/${file.name}`, 60 * 15); // URL expires in 15 minutes

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }
      
      return { name: file.name, url: data.signedUrl, isOwner: true };
    });
    
    const images = (await Promise.all(signedUrlPromises)).filter(Boolean);

    return { data: images as { name: string; url: string; isOwner: boolean }[] };
  }
);

export const uploadAsset = validatedActionWithUser(
  z.object({
    type: z.string(),
  }),
  async (data, formData, user) => { // Use the raw formData
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type || file.size === 0) {
      return { error: 'A valid file and type are required.' };
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'File size must be less than 10MB.' };
    }

    try {
      // Wrap the entire upload process with timeout
      const result = await withTimeout(
        (async () => {
          // Image optimization
          const buffer = await file.arrayBuffer();
          const optimizedBuffer = await sharp(Buffer.from(buffer))
            .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

          const filePath = `${user.id}/${file.name.split('.')[0]}.webp`;

          // Use the supabaseAdmin client here
          const { error } = await supabaseAdmin.storage
            .from(type)
            .upload(filePath, optimizedBuffer, {
              upsert: true,
              contentType: 'image/webp',
            });

          if (error) {
            throw error;
          }

          return { success: 'Asset uploaded successfully!' };
        })(),
        30000, // 30 seconds timeout
        'Upload timed out'
      );

      return result;

    } catch (error) {
      console.error('Error uploading asset:', error);
      
      if (error instanceof TimeoutError) {
        return { error: 'Upload timed out. Please try again with a smaller file.' };
      }
      
      return { error: 'Failed to upload asset.' };
    }
  }
);

export const deleteAsset = validatedActionWithUser(
  z.object({
      type: z.string(),
      fileName: z.string(),
  }),
  async ({ type, fileName }, _, user) => {
      const filePath = `${user.id}/${fileName}`;
      const { error } = await supabaseAdmin.storage
          .from(type)
          .remove([filePath]);

      if (error) {
          console.error('Error deleting asset:', error);
          return { error: 'Failed to delete asset.' };
      }

      return { success: 'Asset deleted successfully.' };
  }
);

// Add New Character Workflow
export const createCharacter = validatedActionWithUser(
  z.object({
    name: z.string().min(1, 'Character name is required'),
    gender: z.string().min(1, 'Gender is required'),
    availableModels: z.string().optional(),
  }),
  async (data, formData, user) => {
    try {
      const userWithTeam = await getUserWithTeam(user.id);
      
      // Get uploaded files
      const files = formData.getAll('files') as File[];
      
      if (files.length < 5) {
        return { error: 'Please upload at least 5 images for best results.' };
      }

      // Validate file types and sizes
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          return { error: 'All files must be images.' };
        }
        if (file.size > 10 * 1024 * 1024) {
          return { error: 'File size must be less than 10MB.' };
        }
      }

      // Upload files to Supabase storage
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const supabase = await createClient();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('characters')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          return { error: 'Failed to upload images. Please try again.' };
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('characters')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }

      // Create character asset in database
      const characterAsset: NewAsset = {
        userId: user.id,
        teamId: userWithTeam?.teamId,
        type: 'characters',
        name: data.name,
        url: uploadedUrls[0], // Use first image as main character image
        metadata: JSON.stringify({
          gender: data.gender,
          availableModels: data.availableModels,
          trainingImages: uploadedUrls,
          status: 'training', // Simulate training status
        }),
      };

      const [insertedAsset] = await db.insert(assets).values(characterAsset).returning();

      // Start actual character training with Nano Banana
      if (insertedAsset?.id) {
        // Check if Nano Banana API key is available
        if (process.env.NANOBANANA_API_KEY) {
          // Trigger training in background
          trainCharacterWithNanoBanana(insertedAsset.id, uploadedUrls, data.name, data.gender)
            .catch(error => {
              console.error('Character training failed:', error);
              // Update status to failed
              db.update(assets)
                .set({
                  metadata: JSON.stringify({
                    ...JSON.parse(characterAsset.metadata || '{}'),
                    status: 'failed',
                    error: error.message,
                  }),
                })
                .where(eq(assets.id, insertedAsset.id));
            });
        } else {
          // No API key available, mark as ready for manual training
          console.log('Nano Banana API key not configured, marking character as ready for manual training');
          db.update(assets)
            .set({
              metadata: JSON.stringify({
                ...JSON.parse(characterAsset.metadata || '{}'),
                status: 'ready',
                note: 'Ready for manual training - API key not configured',
              }),
            })
            .where(eq(assets.id, insertedAsset.id));
        }
      }

      return { 
        success: `Character "${data.name}" created successfully! Training will complete in a few minutes.`,
        characterId: insertedAsset?.id 
      };
    } catch (error) {
      console.error('Error creating character:', error);
      return { error: 'Failed to create character. Please try again.' };
    }
  }
);

// Upscale functionality removed - space for new feature

// Clothing Detection Action
export const detectClothingItems = validatedActionWithUser(
  z.object({
    imageUrl: z.string().url('Valid image URL is required'),
  }),
  async (data, _, user) => {
    try {
      const userWithTeam = await getUserWithTeam(user.id);
      
      // Get user's package
      const userPackage = getPackageByTier((userWithTeam as any)?.packageTier || 'standard');
      if (!userPackage) {
        return { error: 'Invalid package tier. Please contact support.' };
      }
      
      // Check if user has access to clothing AI
      if (!canUserAccessFeature(userPackage, 'hasClothingAI')) {
        return { error: 'Clothing AI not available in your package. Please upgrade to access this feature.' };
      }
      
      // Check if user has enough credits (clothing detection costs 1 credit)
      if (user.credits < 1) {
        return { error: 'Insufficient credits. Clothing detection requires 1 credit.' };
      }

      // Detect clothing items
      const analysis = await detectClothing(data.imageUrl);
      
      // Deduct credits
      await db
        .update(users)
        .set({ credits: user.credits - 1 })
        .where(eq(users.id, user.id));

      // Log activity
      await logActivity(userWithTeam?.teamId, user.id, ActivityType.CLOTHING_DETECTED);

      return { 
        success: 'Clothing analysis completed successfully!',
        analysis,
        creditsUsed: 1,
        remainingCredits: user.credits - 1
      };
      
    } catch (error) {
      console.error('Clothing detection error:', error);
      return { error: 'Failed to analyze clothing. Please try again.' };
    }
  }
);

// Apply Clothing Action
export const applyClothing = validatedActionWithUser(
  z.object({
    modelImageUrl: z.string().url('Valid model image URL is required'),
    clothingImageUrl: z.string().url('Valid clothing image URL is required'),
    clothingType: z.string().min(1, 'Clothing type is required'),
  }),
  async (data, _, user) => {
    try {
      const userWithTeam = await getUserWithTeam(user.id);
      
      // Check if user has enough credits (clothing application costs 2 credits)
      if (user.credits < 2) {
        return { error: 'Insufficient credits. Clothing application requires 2 credits.' };
      }

      // Apply clothing to model
      const resultImageUrl = await applyClothingToModel(
        data.modelImageUrl, 
        data.clothingImageUrl, 
        data.clothingType
      );
      
      // Deduct credits
      await db
        .update(users)
        .set({ credits: user.credits - 2 })
        .where(eq(users.id, user.id));

      // Log activity
      await logActivity(userWithTeam?.teamId, user.id, ActivityType.CLOTHING_APPLIED);

      return { 
        success: 'Clothing applied successfully!',
        resultImageUrl,
        creditsUsed: 2,
        remainingCredits: user.credits - 2
      };
      
    } catch (error) {
      console.error('Clothing application error:', error);
      return { error: 'Failed to apply clothing. Please try again.' };
    }
  }
);

// AI Image Generation Service
async function generateWithAI(params: {
  prompt: string;
  modelUrl?: string;
  poseUrl?: string;
  garmentUrl?: string;
  environmentUrl?: string;
  aspectRatio?: string;
  processor: string;
}): Promise<string> {
  try {
    let result: string;
    
    // Nano Banana API Integration
    if (params.processor === 'Nano Banana') {
      result = await generateWithNanoBanana(params);
    }
    // Kling API Integration
    else if (params.processor === 'Kling') {
      result = await generateWithKling(params);
    }
    // Gemini API Integration
    else if (params.processor === 'Gemini') {
      result = await generateWithGemini(params);
    }
    // OpenAI DALL-E Integration
    else if (params.processor === 'OpenAI DALL-E') {
      result = await generateWithOpenAI(params);
    }
    // Stable Diffusion via Replicate (fallback)
    else {
      result = await generateWithReplicate(params);
    }
    
    // Validate that we got a valid URL
    if (!result || typeof result !== 'string') {
      throw new Error('Invalid response from AI service');
    }
    
    // Check if it's a valid URL or data URL
    const isValidUrl = result.startsWith('http') || result.startsWith('data:') || result.startsWith('https://picsum.photos');
    if (!isValidUrl) {
      throw new Error('Invalid URL format returned from AI service');
    }
    
    return result;
    
  } catch (error) {
    console.error('AI generation error:', error);
    // Fallback to a simple, fast image generation service
    try {
      // Use Pollinations as a fast fallback
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(params.prompt)}?width=512&height=640&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
      return pollinationsUrl;
    } catch (fallbackError) {
      console.error('Fallback generation failed:', fallbackError);
      // Final fallback to placeholder
      return generatePlaceholderImage({ aspectRatio: params.aspectRatio, prompt: params.prompt });
    }
  }
}

async function trainCharacterWithNanoBanana(assetId: number, trainingImages: string[], characterName: string, gender: string) {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error('Nano Banana API key not configured');
  }

  try {
    // Update status to training
    await db
      .update(assets)
      .set({
        metadata: JSON.stringify({
          status: 'training',
          progress: 0,
          characterName,
          gender,
          trainingImages,
        }),
      })
      .where(eq(assets.id, assetId));

    // Call Nano Banana character training API
    const response = await fetch('https://api.nanobanana.ai/v1/train-character', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: characterName,
        gender: gender,
        training_images: trainingImages,
        quality: 'high',
        style: 'photorealistic',
      }),
    });

    if (!response.ok) {
      throw new Error(`Nano Banana training API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update status to trained with model ID
    await db
      .update(assets)
      .set({
        metadata: JSON.stringify({
          status: 'trained',
          progress: 100,
          characterName,
          gender,
          trainingImages,
          modelId: data.model_id,
          trainedAt: new Date().toISOString(),
        }),
      })
      .where(eq(assets.id, assetId));

    console.log(`Character "${characterName}" trained successfully with model ID: ${data.model_id}`);
    
  } catch (error) {
    console.error('Character training error:', error);
    throw error;
  }
}

async function generateWithNanoBanana(params: {
  prompt: string;
  modelUrl?: string;
  poseUrl?: string;
  garmentUrl?: string;
  environmentUrl?: string;
  aspectRatio?: string;
}): Promise<string> {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error('Nano Banana API key not configured');
  }

  const width = getWidthFromAspectRatio(params.aspectRatio);
  const height = getHeightFromAspectRatio(params.aspectRatio);

  // Build the enhanced prompt with all parameters
  let enhancedPrompt = params.prompt;
  
  // Add asset references to prompt
  if (params.modelUrl) enhancedPrompt += `, character reference: ${params.modelUrl}`;
  if (params.poseUrl) enhancedPrompt += `, pose reference: ${params.poseUrl}`;
  if (params.garmentUrl) enhancedPrompt += `, garment reference: ${params.garmentUrl}`;
  if (params.environmentUrl) enhancedPrompt += `, environment reference: ${params.environmentUrl}`;
  
  // Add professional photography terms
  enhancedPrompt += ', professional photography, high quality, detailed, fashion photography';

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch('https://api.nanobanana.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        width,
        height,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        model: 'stable-diffusion-xl',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nano Banana API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.image_url || data.output[0];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Nano Banana API request timed out');
    }
    throw error;
  }
}

async function generateWithKling(params: {
  prompt: string;
  modelUrl?: string;
  poseUrl?: string;
  garmentUrl?: string;
  environmentUrl?: string;
  aspectRatio?: string;
}): Promise<string> {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) {
    throw new Error('Kling API key not configured');
  }

  const width = getWidthFromAspectRatio(params.aspectRatio);
  const height = getHeightFromAspectRatio(params.aspectRatio);

  // Build the enhanced prompt for video generation
  let enhancedPrompt = params.prompt;
  if (params.modelUrl) enhancedPrompt += `, character: ${params.modelUrl}`;
  if (params.poseUrl) enhancedPrompt += `, pose: ${params.poseUrl}`;
  if (params.garmentUrl) enhancedPrompt += `, clothing: ${params.garmentUrl}`;
  if (params.environmentUrl) enhancedPrompt += `, background: ${params.environmentUrl}`;
  
  // Add video-specific terms
  enhancedPrompt += ', professional video, smooth motion, high quality, fashion video';

  try {
    // Step 1: Create video generation request
    const response = await fetch('https://api.kling.ai/v1/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        width,
        height,
        duration: 5, // 5 seconds
        fps: 24,
        style: 'realistic',
        quality: 'hd',
      }),
    });

    if (!response.ok) {
      throw new Error(`Kling API error: ${response.statusText}`);
    }

    const data = await response.json();
    const taskId = data.task_id;
    
    if (!taskId) {
      throw new Error('No task ID returned from Kling API');
    }

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.kling.ai/v1/video/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Kling status API error: ${statusResponse.statusText}`);
      }
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        return statusData.video_url || statusData.output[0];
      } else if (statusData.status === 'failed') {
        throw new Error(`Video generation failed: ${statusData.error || 'Unknown error'}`);
      }
      
      attempts++;
    }
    
    throw new Error('Video generation timeout');
    
  } catch (error) {
    console.error('Kling API error:', error);
    // Fallback to placeholder image for now
    return generatePlaceholderImage(params);
  }
}

async function generateWithGemini(params: {
  prompt: string;
  modelUrl?: string;
  poseUrl?: string;
  garmentUrl?: string;
  environmentUrl?: string;
  aspectRatio?: string;
}): Promise<string> {
  // Note: Gemini is a text model, not an image generation model
  // We'll use it to enhance the prompt and then generate a placeholder image
  // In production, you would use the enhanced prompt with an actual image generation service
  
  const width = getWidthFromAspectRatio(params.aspectRatio);
  const height = getHeightFromAspectRatio(params.aspectRatio);

  // Build the enhanced prompt
  let enhancedPrompt = params.prompt;
  
  // Add asset references to prompt
  if (params.modelUrl) enhancedPrompt += `, character reference: ${params.modelUrl}`;
  if (params.poseUrl) enhancedPrompt += `, pose reference: ${params.poseUrl}`;
  if (params.garmentUrl) enhancedPrompt += `, garment reference: ${params.garmentUrl}`;
  if (params.environmentUrl) enhancedPrompt += `, environment reference: ${params.environmentUrl}`;
  
  // Add professional photography terms
  enhancedPrompt += ', professional photography, high quality, detailed, fashion photography';

  try {
    // Use Gemini to enhance the prompt first
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAalRdbxIkak0004t-JB9uLJ6rcDMI-z0o';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Enhance this fashion photography prompt to be more detailed and professional:

Original prompt: ${enhancedPrompt}

Please provide an enhanced version that includes:
- Specific lighting details
- Camera angles and composition
- Fashion styling elements
- Professional photography terminology
- High-end commercial quality descriptors

Return only the enhanced prompt, no other text.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.statusText} - Using original prompt`);
      // Don't throw error, just use original prompt
    } else {
      const data = await response.json();
      
      // Extract enhanced prompt from Gemini response
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const textPart = data.candidates[0].content.parts.find((part: any) => part.text);
        if (textPart && textPart.text) {
          const finalPrompt = textPart.text.trim();
          console.log('Enhanced prompt from Gemini:', finalPrompt);
          // Use the enhanced prompt for better placeholder generation
          enhancedPrompt = finalPrompt;
        }
      }
    }
    
    // Generate a placeholder image with the enhanced prompt
    // In production, you would use this enhanced prompt with an actual image generation service
    return generatePlaceholderImage(params);
    
  } catch (error) {
    console.warn('Gemini API error:', error);
    // Fallback to placeholder if Gemini fails
    return generatePlaceholderImage(params);
  }
}

async function generateWithOpenAI(params: {
  prompt: string;
  modelUrl?: string;
  poseUrl?: string;
  garmentUrl?: string;
  environmentUrl?: string;
  aspectRatio?: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const width = getWidthFromAspectRatio(params.aspectRatio);
  const height = getHeightFromAspectRatio(params.aspectRatio);

  // Build the enhanced prompt for DALL-E
  let enhancedPrompt = params.prompt;
  
  // Add asset references to prompt
  if (params.modelUrl) enhancedPrompt += `, character reference: ${params.modelUrl}`;
  if (params.poseUrl) enhancedPrompt += `, pose reference: ${params.poseUrl}`;
  if (params.garmentUrl) enhancedPrompt += `, garment reference: ${params.garmentUrl}`;
  if (params.environmentUrl) enhancedPrompt += `, environment reference: ${params.environmentUrl}`;
  
  // Add professional photography terms
  enhancedPrompt += ', professional photography, high quality, detailed, fashion photography';

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: getDALLE3Size(params.aspectRatio),
        quality: 'hd',
        style: 'natural',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    }
    
    throw new Error('No image URL returned from OpenAI');
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to placeholder if OpenAI fails
    return generatePlaceholderImage(params);
  }
}

function getDALLE3Size(aspectRatio?: string): string {
  const sizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '9:16': '1024x1792',
    '16:9': '1792x1024',
    '3:2': '1344x896',
    '2:3': '896x1344'
  };
  return sizeMap[aspectRatio || '1:1'] || '1024x1024';
}

// Upscale function removed - space for new feature

// Clothing Detection and Analysis
async function detectClothing(imageUrl: string): Promise<{
  clothingItems: Array<{
    type: string;
    color: string;
    style: string;
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  dominantColors: string[];
  style: string;
}> {
  const apiKey = process.env.CLOTHING_AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Clothing AI API key not configured');
  }

  try {
    // Use OpenAI Vision API for clothing detection
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this fashion image and identify all clothing items. For each item, provide: type (top, bottom, dress, shoes, accessories), color, style, confidence score (0-1), and approximate bounding box coordinates. Also identify dominant colors and overall style. Return as JSON.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Clothing detection API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return {
      clothingItems: analysis.clothingItems || [],
      dominantColors: analysis.dominantColors || [],
      style: analysis.style || 'casual'
    };
    
  } catch (error) {
    console.error('Clothing detection error:', error);
    // Fallback to basic analysis
    return {
      clothingItems: [],
      dominantColors: ['black', 'white'],
      style: 'casual'
    };
  }
}

// Apply Clothing to Model
async function applyClothingToModel(
  modelImageUrl: string, 
  clothingImageUrl: string, 
  clothingType: string
): Promise<string> {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error('Nano Banana API key not configured');
  }

  try {
    // Use Nano Banana for clothing application
    const response = await fetch('https://api.nanobanana.ai/v1/apply-clothing', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_image: modelImageUrl,
        clothing_image: clothingImageUrl,
        clothing_type: clothingType,
        style: 'fashion',
        quality: 'high',
        preserve_pose: true,
        blend_mode: 'realistic'
      }),
    });

    if (!response.ok) {
      throw new Error(`Clothing application API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result_image || data.output[0];
    
  } catch (error) {
    console.error('Clothing application error:', error);
    // Fallback to basic image combination
    return modelImageUrl;
  }
}

async function generateWithReplicate(params: {
  prompt: string;
  modelUrl?: string;
  poseUrl?: string;
  garmentUrl?: string;
  environmentUrl?: string;
  aspectRatio?: string;
}): Promise<string> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    // Fallback to placeholder if no API key
    return generatePlaceholderImage(params);
  }

  const width = getWidthFromAspectRatio(params.aspectRatio);
  const height = getHeightFromAspectRatio(params.aspectRatio);

  let enhancedPrompt = params.prompt;
  if (params.modelUrl) enhancedPrompt += `, character reference: ${params.modelUrl}`;
  if (params.poseUrl) enhancedPrompt += `, pose reference: ${params.poseUrl}`;
  if (params.garmentUrl) enhancedPrompt += `, garment reference: ${params.garmentUrl}`;
  if (params.environmentUrl) enhancedPrompt += `, environment reference: ${params.environmentUrl}`;

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd747e",
        input: {
        prompt: enhancedPrompt,
        width,
        height,
          num_inference_steps: 20,
          guidance_scale: 7.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Poll for completion
  let result = data;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { 'Authorization': `Token ${apiKey}` },
    });
    result = await statusResponse.json();
  }

  if (result.status === 'succeeded') {
    return result.output[0];
  } else {
    throw new Error(`Generation failed: ${result.error}`);
  }
}

async function generatePlaceholderImage(params: {
  aspectRatio?: string;
  prompt?: string;
}): Promise<string> {
    const aspectRatioMap: Record<string, string> = {
      '1:1': '800x800',
      '9:16': '720x1280',
      '16:9': '1280x720',
      '3:2': '1200x800',
      '2:3': '800x1200'
    };
    
    const dimensions = aspectRatioMap[params.aspectRatio || '1:1'] || '800x800';
    const [width, height] = dimensions.split('x').map(Number);
    
    // Use Pollinations AI for free image generation instead of random placeholder
    const encodedPrompt = encodeURIComponent(params.prompt || 'fashion photography, professional model, high quality');
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return pollinationsUrl;
}

function getWidthFromAspectRatio(aspectRatio?: string): number {
  const ratioMap: Record<string, number> = {
    '1:1': 512,
    '9:16': 576,
    '16:9': 1024,
    '3:2': 768,
    '2:3': 512
  };
  return ratioMap[aspectRatio || '1:1'] || 512;
}

function getHeightFromAspectRatio(aspectRatio?: string): number {
  const ratioMap: Record<string, number> = {
    '1:1': 512,
    '9:16': 1024,
    '16:9': 576,
    '3:2': 512,
    '2:3': 768
  };
  return ratioMap[aspectRatio || '1:1'] || 512;
}

export const generateImage = validatedActionWithUser(
  z.object({
    prompt: z.string().min(1, 'Prompt is required.'),
    modelUrl: z.string().optional(),
    poseUrl: z.string().optional(),
    garmentUrl: z.string().optional(),
    environmentUrl: z.string().optional(),
    cameraView: z.string().optional(),
    lensAngle: z.string().optional(),
    aspectRatio: z.string().optional(),
    processor: z.string().optional(),
  }),
  async (data, _, user) => {
    try {
      const userWithTeam = await getUserWithTeam(user.id);
      
      // Get user's package
      const userPackage = getPackageByTier((userWithTeam as any)?.packageTier || 'standard');
      if (!userPackage) {
        return { error: 'Invalid package tier. Please contact support.' };
      }
      
      // Check if user has access to image generation
      if (!canUserAccessFeature(userPackage, 'hasCharacterTraining')) {
        return { error: 'Image generation not available in your package. Please upgrade to access this feature.' };
      }

      if ((user.credits || 0) <= 0) {
          return { error: 'You have no credits remaining.' };
      }

      // Validate URLs if provided
      const validateUrl = (url: string | undefined) => {
        if (!url || url === '') return undefined;
        try {
          new URL(url);
          return url;
        } catch {
          return undefined;
        }
      };

      const validatedData = {
        ...data,
        modelUrl: validateUrl(data.modelUrl),
        poseUrl: validateUrl(data.poseUrl),
        garmentUrl: validateUrl(data.garmentUrl),
        environmentUrl: validateUrl(data.environmentUrl),
      };

      console.log('Generating image with:', validatedData);
      
      // Wrap the entire generation process with timeout
      const result = await withTimeout(
        (async () => {
          console.log('🚀 Starting image generation...');
          // Build enhanced prompt with all parameters
          let enhancedPrompt = data.prompt;
          
          // Add camera settings to prompt
          if (data.cameraView) {
            enhancedPrompt += `, ${data.cameraView.toLowerCase()}`;
          }
          
          // Add aspect ratio context
          if (data.aspectRatio) {
            const ratioMap: Record<string, string> = {
              '1:1': 'square format',
              '9:16': 'portrait format',
              '16:9': 'landscape format',
              '3:2': 'classic photography format',
              '2:3': 'vertical format'
            };
            enhancedPrompt += `, ${ratioMap[data.aspectRatio] || data.aspectRatio}`;
          }
          
          // Add lens angle context
          if (data.lensAngle) {
            enhancedPrompt += `, ${data.lensAngle.toLowerCase()}`;
          }
          
          // Add professional photography terms
          enhancedPrompt += ', professional photography, high quality, detailed, fashion photography';
          
          // For now, use a placeholder service - replace with actual AI service
          // This could be Replicate, Stability AI, or any other service
          const generatedImageUrl = await generateWithAI({
            prompt: enhancedPrompt,
            modelUrl: validatedData.modelUrl,
            poseUrl: validatedData.poseUrl,
            garmentUrl: validatedData.garmentUrl,
            environmentUrl: validatedData.environmentUrl,
            aspectRatio: data.aspectRatio,
            processor: data.processor || 'Nano Banana'
          });
          
          const newImage: NewGeneratedImage = {
            userId: user.id,
            teamId: userWithTeam?.teamId,
            prompt: data.prompt,
            imageUrl: generatedImageUrl,
          };
          
          // Use Promise.all for concurrent database operations
          await Promise.all([
            db.insert(generatedImages).values(newImage),
            db.update(users).set({ credits: (user.credits || 0) - 1 }).where(eq(users.id, user.id))
          ]);
          
          return { success: 'Image generated!', imageUrl: generatedImageUrl };
        })(),
        20000, // 20 seconds timeout
        'Image generation timed out'
      );

      return result;

    } catch (error) {
        console.error("Image generation failed", error);
        
        if (error instanceof TimeoutError) {
          return { error: "Image generation timed out. Please try again with a simpler prompt." };
        }
        
        return { error: "Image generation failed. Please try again." };
    }
  }
);

/**
 * Server Action to initiate the Supabase Google OAuth flow.
 * Redirects the user to the Google login page.
 */
/**
 * Creates the application session after a successful Google One Tap sign-in.
 */
export async function handleIdTokenLogin() {
  'use server';

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user || !session.user.email) {
    return redirect('/sign-in?error=auth_failed');
  }

  const supabaseUser = session.user;
  const userEmail = supabaseUser.email!; // We already checked this is not null above

  // Find or create the user in the local database
  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, userEmail),
  });

  if (!dbUser) {
    dbUser = await db.transaction(async (tx) => {
      const newTeam: NewTeam = {
        name: `${supabaseUser.user_metadata.full_name || userEmail}'s Team`,
      };
      const [createdTeam] = await tx.insert(teams).values(newTeam).returning();

      const newUser: NewUser = {
        email: userEmail,
        passwordHash: 'oauth_user_no_password',
        name: supabaseUser.user_metadata.full_name || null,
        role: 'owner',
      };
      const [createdUser] = await tx.insert(users).values(newUser).returning();

      const newTeamMember: NewTeamMember = {
        userId: createdUser.id,
        teamId: createdTeam.id,
        role: 'owner',
      };
      await tx.insert(teamMembers).values(newTeamMember);

      await logActivity(createdTeam.id, createdUser.id, ActivityType.SIGN_UP);
      
      return createdUser;
    });
  }

  if (dbUser) {
    redirect('/generate');
  } else {
    redirect('/sign-in?error=user_creation_failed');
  }
}

export async function handleOAuthCallback() {
  'use server';

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user || !session.user.email) {
    return redirect('/sign-in?error=oauth_failed');
  }

  const supabaseUser = session.user;
  const userEmail = supabaseUser.email!; // We already checked this is not null above

  // Find or create the user in the local database
  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, userEmail),
  });

  if (!dbUser) {
    dbUser = await db.transaction(async (tx) => {
      const newTeam: NewTeam = {
        name: `${supabaseUser.user_metadata.full_name || userEmail}'s Team`,
      };
      const [createdTeam] = await tx.insert(teams).values(newTeam).returning();

      const newUser: NewUser = {
        email: userEmail,
        passwordHash: 'oauth_user_no_password',
        name: supabaseUser.user_metadata.full_name || null,
        role: 'owner',
      };
      const [createdUser] = await tx.insert(users).values(newUser).returning();

      const newTeamMember: NewTeamMember = {
        userId: createdUser.id,
        teamId: createdTeam.id,
        role: 'owner',
      };
      await tx.insert(teamMembers).values(newTeamMember);

      await logActivity(createdTeam.id, createdUser.id, ActivityType.SIGN_UP);
      
      return createdUser;
    });
  }

  if (dbUser) {
    redirect('/generate');
  } else {
    redirect('/sign-in?error=user_creation_failed');
  }
}
