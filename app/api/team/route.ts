import { getTeamForUser } from '@/lib/db/queries';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  const team = await getTeamForUser();
  return Response.json(team);
}
