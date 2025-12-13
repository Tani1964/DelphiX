import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getActiveSOS } from '@/lib/sos';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeSOS = await getActiveSOS(session.user.id);

    return NextResponse.json({
      active: !!activeSOS,
      sosEvent: activeSOS,
    });
  } catch (error) {
    console.error('SOS status error:', error);
    return NextResponse.json(
      { error: 'Failed to get SOS status' },
      { status: 500 }
    );
  }
}

