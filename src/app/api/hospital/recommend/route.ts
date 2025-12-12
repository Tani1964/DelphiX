import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { findNearbyHospitals } from '@/lib/maps';
import { getHospitalRecommendationsCollection, getUsersCollection } from '@/lib/mongodb';
import { HospitalRecommendation } from '@/types';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symptoms, lat, lng, radius } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Location coordinates required' },
        { status: 400 }
      );
    }

    // Find nearby hospitals
    const hospitals = await findNearbyHospitals(
      lat,
      lng,
      radius || 10000,
      symptoms
    );

    // Save recommendation to database
    const recommendations = await getHospitalRecommendationsCollection();
    const recommendation: Omit<HospitalRecommendation, '_id'> = {
      userId: session.user.id,
      symptoms: symptoms || '',
      recommendedHospitals: hospitals,
      createdAt: new Date(),
    };

    const result = await recommendations.insertOne(recommendation);

    // Update user location
    const users = await getUsersCollection();
    await users.updateOne(
      { _id: session.user.id },
      {
        $set: {
          location: {
            lat,
            lng,
            address: '', // Could be geocoded if needed
          },
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      hospitals,
      recommendationId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Hospital recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to get hospital recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const symptoms = searchParams.get('symptoms') || '';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Location coordinates required' },
        { status: 400 }
      );
    }

    const hospitals = await findNearbyHospitals(lat, lng, 10000, symptoms);

    return NextResponse.json({ hospitals });
  } catch (error) {
    console.error('Hospital recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to get hospital recommendations' },
      { status: 500 }
    );
  }
}

