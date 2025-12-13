import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth-config';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || (role !== 'user' && role !== 'admin')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "admin"' },
        { status: 400 }
      );
    }

    // Prevent users from removing their own admin status
    if (role === 'user' && session.user.id === userId) {
      return NextResponse.json(
        { error: 'You cannot remove your own admin status' },
        { status: 400 }
      );
    }

    const users = await getUsersCollection();
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User role updated successfully', role },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

