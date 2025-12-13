import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getDiagnosesCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Unwrap params since it's a Promise (see Next.js dynamic route API docs)
    const params = await context.params;
    const diagnosisId = params.id;

    if (!ObjectId.isValid(diagnosisId)) {
      return NextResponse.json(
        { error: 'Invalid diagnosis ID' },
        { status: 400 }
      );
    }

    const diagnoses = await getDiagnosesCollection();
    const diagnosis = await diagnoses.findOne({
      _id: new ObjectId(diagnosisId),
      userId: session.user.id,
    });

    if (!diagnosis) {
      return NextResponse.json(
        { error: 'Diagnosis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error('Diagnosis fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diagnosis' },
      { status: 500 }
    );
  }
}
