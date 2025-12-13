import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { getDiagnosesCollection } from '@/lib/mongodb';
import { Diagnosis } from '@/types';
import { Document, Filter } from 'mongodb';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const diagnoses = await getDiagnosesCollection();

    const query: Filter<Document> = { userId: session.user.id };

    if (search) {
      query.$or = [
        { symptoms: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } },
      ];
    }

    const allDiagnoses = await diagnoses
      .find<Diagnosis>(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await diagnoses.countDocuments(query);

    return NextResponse.json({
      diagnoses: allDiagnoses,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

