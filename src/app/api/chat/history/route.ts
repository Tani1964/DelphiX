import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getDiagnosesCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const diagnosisId = searchParams.get('diagnosisId');

    if (!diagnosisId) {
      return NextResponse.json(
        { error: 'Diagnosis ID required' },
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

    return NextResponse.json({
      chatHistory: diagnosis.chatHistory || [],
    });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

