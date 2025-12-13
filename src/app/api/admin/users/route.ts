import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getUsersCollection } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getUsersCollection();
    const allUsers = await users
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

