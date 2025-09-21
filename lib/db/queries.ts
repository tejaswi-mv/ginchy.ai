import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  try {
    const sessionCookie = (await cookies()).get('session');
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const sessionData = await verifyToken(sessionCookie.value);
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      return null;
    }

    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Database error in getUser:', error);
    return null;
  }
}

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
        teamId: teamMembers.teamId
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
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

export async function getTeamForUser() {
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
    console.error('Database error in getTeamForUser:', error);
    return null;
  }
}
