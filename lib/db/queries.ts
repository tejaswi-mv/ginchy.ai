import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, generatedImages } from './schema';
import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

// 1. Rename original function logic to an internal implementation
const getUserImpl = async () => {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser || !supabaseUser.email) {
      return null;
    }

    // Now that we have the authenticated user from Supabase,
    // find the corresponding user in our own Drizzle database.
    const userResult = await db
      .select()
      .from(users)
      .where(and(eq(users.email, supabaseUser.email), isNull(users.deletedAt)))
      .limit(1);

    if (userResult.length === 0) {
      return null;
    }

    return userResult[0];
  } catch (error) {
    console.error('Database error in getUser:', error);
    return null;
  }
}

// 2. Export the cached version. All subsequent calls in the same request will be instant.
export const getUser = cache(getUserImpl);

// 3. Export uncached version for when we need fresh data
export const getUserUncached = getUserImpl;

export async function getTeamByStripeCustomerId(customerId: string) {
  try {
    const result = await db
      .select()
      .from(teams)
      .where(eq(teams.stripeCustomerId, customerId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Database error in getTeamByStripeCustomerId:', error);
    return null;
  }
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  try {
    await db
      .update(teams)
      .set({
        ...subscriptionData,
        updatedAt: new Date()
      })
      .where(eq(teams.id, teamId));
  } catch (error) {
    console.error('Database error in updateTeamSubscription:', error);
    throw error;
  }
}

export async function getUserWithTeam(userId: number) {
  try {
    const result = await db
      .select({
        user: users,
        teamId: teamMembers.teamId,
        packageTier: teams.packageTier,
        monthlyCredits: teams.monthlyCredits,
        maxModels: teams.maxModels,
        maxVideos: teams.maxVideos,
        hasUpscaling: teams.hasUpscaling,
        hasBatchProcessing: teams.hasBatchProcessing,
        hasAPI: teams.hasAPI,
        hasPrioritySupport: teams.hasPrioritySupport,
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(users.id, userId))
      .limit(1);

    return result[0];
  } catch (error) {
    console.error('Database error in getUserWithTeam:', error);
    return null;
  }
}

export async function getActivityLogs() {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        timestamp: activityLogs.timestamp,
        ipAddress: activityLogs.ipAddress,
        userName: users.name
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.userId, user.id))
      .orderBy(desc(activityLogs.timestamp))
      .limit(10);
  } catch (error) {
    console.error('Database error in getActivityLogs:', error);
    return [];
  }
}

// Add optimized query for user's generated images
export async function getCreationsForUser(userId: number, limit: number = 50) {
  try {
    return await db
      .select({
        id: generatedImages.id,
        prompt: generatedImages.prompt,
        imageUrl: generatedImages.imageUrl,
        createdAt: generatedImages.createdAt,
      })
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Database error in getCreationsForUser:', error);
    return [];
  }
}

// Add optimized query for recent creations across all users
export async function getRecentCreations(limit: number = 20) {
  try {
    return await db
      .select({
        id: generatedImages.id,
        prompt: generatedImages.prompt,
        imageUrl: generatedImages.imageUrl,
        createdAt: generatedImages.createdAt,
        userName: users.name,
      })
      .from(generatedImages)
      .leftJoin(users, eq(generatedImages.userId, users.id))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Database error in getRecentCreations:', error);
    return [];
  }
}

export async function getTeamForUser() {
  try {
    // Authentication must still happen first (costs ~542ms), but the second query must be instant.
    const user = await getUser();
    if (!user) {
      return null;
    }

    // ⚡️ OPTIMIZATION: Use a direct Drizzle select and innerJoin
    // This bypasses ORM relational overhead and fetches the team in one efficient DB request.
    const result = await db
      .select({
        team: teams, // Select all columns from the teams table
      })
      .from(teams)
      .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    return result.length > 0 ? result[0].team : null;

  } catch (error) {
    console.error('Database error in getTeamForUser:', error);
    return null;
  }
}

// Function for when we need the full team data with members (for middleware)
export async function getTeamForUserWithMembers() {
  try {
    const user = await getUser();
    if (!user) {
      return null;
    }

    const result = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, user.id),
      with: {
        team: {
          with: {
            teamMembers: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return result?.team || null;
  } catch (error) {
    console.error('Database error in getTeamForUserWithMembers:', error);
    return null;
  }
}
