import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, activityLogs, type NewUser, type NewTeam, type NewTeamMember, ActivityType } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const supabaseUser = data.user;
      const userEmail = supabaseUser.email;

      if (!userEmail) {
        // Handle case where user has no email
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_email`);
      }

      // Find or create the user in your Drizzle database
      let dbUser = await db.query.users.findFirst({
        where: eq(users.email, userEmail),
      });

      if (!dbUser) {
        console.log('Creating new user in database...');
        dbUser = await db.transaction(async (tx) => {
          const newTeam: NewTeam = {
            name: `${supabaseUser.user_metadata?.full_name || userEmail}'s Team`,
          };
          const [createdTeam] = await tx.insert(teams).values(newTeam).returning();

          const newUser: NewUser = {
            email: userEmail,
            passwordHash: 'oauth_user_no_password',
            name: supabaseUser.user_metadata?.full_name || null,
            role: 'owner',
          };
          const [createdUser] = await tx.insert(users).values(newUser).returning();

          const newTeamMember: NewTeamMember = {
            userId: createdUser.id,
            teamId: createdTeam.id,
            role: 'owner',
          };
          await tx.insert(teamMembers).values(newTeamMember);

          await tx.insert(activityLogs).values({
            teamId: createdTeam.id,
            userId: createdUser.id,
            action: ActivityType.SIGN_UP,
          });
          
          return createdUser;
        });
      }
      
      // The Supabase session is already set by exchangeCodeForSession.
      // We no longer need a custom session.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  console.error("Error exchanging code for session or no code found.");
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=code_exchange_failed`);
}
