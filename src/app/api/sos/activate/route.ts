import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { activateSOS } from '@/lib/sos';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sosEvent = await activateSOS(session.user.id);

    return NextResponse.json({
      success: true,
      sosEvent,
    });
  } catch (error) {
    console.error('SOS activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate SOS' },
      { status: 500 }
    );
  }
}

