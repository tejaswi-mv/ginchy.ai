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

      // Simulate model training process
      // In production, this would trigger actual AI model training
      setTimeout(async () => {
        // Update status to trained
        if (insertedAsset?.id) {
          await db
            .update(assets)
            .set({
              metadata: JSON.stringify({
                ...JSON.parse(characterAsset.metadata || '{}'),
                status: 'trained',
              }),
            })
            .where(eq(assets.id, insertedAsset.id));
        }
      }, 10000); // 10 seconds simulation

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
    // For now, return a placeholder image
    // In production, integrate with Replicate, Stability AI, or another service
    
    // Example Replicate integration (uncomment and configure):
    /*
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    const output = await replicate.run(
      "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd747e",
      {
        input: {
          prompt: params.prompt,
          width: getWidthFromAspectRatio(params.aspectRatio),
          height: getHeightFromAspectRatio(params.aspectRatio),
          num_inference_steps: 20,
          guidance_scale: 7.5,
        }
      }
    );
    
    return output[0] as string;
    */
    
    // Placeholder implementation
    const aspectRatioMap: Record<string, string> = {
      '1:1': '800x800',
      '9:16': '720x1280',
      '16:9': '1280x720',
      '3:2': '1200x800',
      '2:3': '800x1200'
    };
    
    const dimensions = aspectRatioMap[params.aspectRatio || '1:1'] || '800x800';
    const [width, height] = dimensions.split('x').map(Number);
    
    // Generate a placeholder image URL with the correct dimensions
    const placeholderUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return placeholderUrl;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
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
    modelUrl: z.string().url().optional(),
    poseUrl: z.string().url().optional(),
    garmentUrl: z.string().url().optional(),
    environmentUrl: z.string().url().optional(),
    cameraView: z.string().optional(),
    lensAngle: z.string().optional(),
    aspectRatio: z.string().optional(),
    processor: z.string().optional(),
  }),
  async (data, _, user) => {
    try {
      const userWithTeam = await getUserWithTeam(user.id);

      if ((user.credits || 0) <= 0) {
          return { error: 'You have no credits remaining.' };
      }

      console.log('Generating image with:', data);
      
      // Wrap the entire generation process with timeout
      const result = await withTimeout(
        (async () => {
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
            modelUrl: data.modelUrl,
            poseUrl: data.poseUrl,
            garmentUrl: data.garmentUrl,
            environmentUrl: data.environmentUrl,
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
        30000, // 30 seconds timeout
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
