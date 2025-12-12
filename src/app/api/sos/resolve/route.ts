import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { resolveSOS } from '@/lib/sos';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await resolveSOS(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SOS resolve error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve SOS' },
      { status: 500 }
    );
  }
}

