import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { updateSOSActivity, checkSOSInactivity } from '@/lib/sos';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { heartbeat, check } = await request.json();

    if (heartbeat) {
      // Update activity timestamp
      await updateSOSActivity(session.user.id);
      return NextResponse.json({ success: true });
    }

    if (check) {
      // Check for inactive SOS events (called by service worker)
      await checkSOSInactivity();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('SOS check error:', error);
    return NextResponse.json(
      { error: 'Failed to check SOS' },
      { status: 500 }
    );
  }
}

