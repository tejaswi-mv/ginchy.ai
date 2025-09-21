import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    return Response.json(user);
  } catch (error) {
    console.error('Error in /api/user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
