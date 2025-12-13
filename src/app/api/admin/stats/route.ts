import { NextResponse } from 'next/server';
import {
  getUsersCollection,
  getDiagnosesCollection,
  getDrugVerificationsCollection,
  getSOSEventsCollection,
  getHospitalRecommendationsCollection,
} from '@/lib/mongodb';
import { auth } from '@/lib/auth-config';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getUsersCollection();
    const diagnoses = await getDiagnosesCollection();
    const drugVerifications = await getDrugVerificationsCollection();
    const sosEvents = await getSOSEventsCollection();
    const hospitalRecommendations = await getHospitalRecommendationsCollection();

    // User stats
    const totalUsers = await users.countDocuments();
    const adminUsers = await users.countDocuments({ role: 'admin' });
    const regularUsers = totalUsers - adminUsers;

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSignups = await users.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Diagnosis stats
    const totalDiagnoses = await diagnoses.countDocuments();
    const diagnosesLast30Days = await diagnoses.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Common symptoms (top 10)
    const symptomCounts: Record<string, number> = {};
    const allDiagnoses = await diagnoses.find({}).toArray();
    allDiagnoses.forEach((diagnosis) => {
      const symptoms = diagnosis.symptoms?.toLowerCase() || '';
      const words = symptoms.split(/\s+/).filter((w: string) => w.length > 3);
      words.forEach((word: string) => {
        symptomCounts[word] = (symptomCounts[word] || 0) + 1;
      });
    });

    const commonSymptoms = Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([symptom, count]) => ({ symptom, count }));

    // Diagnosis trends (last 7 days)
    const diagnosisTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await diagnoses.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });

      diagnosisTrends.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    // Drug verification stats
    const totalVerifications = await drugVerifications.countDocuments();
    const verifiedDrugs = await drugVerifications.countDocuments({
      result: 'verified',
    });
    const expiredDrugs = await drugVerifications.countDocuments({
      result: 'expired',
    });
    const unverifiedDrugs = await drugVerifications.countDocuments({
      result: 'unverified',
    });

    // SOS stats
    const totalSOSEvents = await sosEvents.countDocuments();
    const activeSOSEvents = await sosEvents.countDocuments({ status: 'active' });
    const resolvedSOSEvents = await sosEvents.countDocuments({
      status: 'resolved',
    });

    // Hospital recommendation stats
    const totalRecommendations = await hospitalRecommendations.countDocuments();

    return NextResponse.json({
      users: {
        total: totalUsers,
        admin: adminUsers,
        regular: regularUsers,
        recentSignups,
      },
      diagnoses: {
        total: totalDiagnoses,
        last30Days: diagnosesLast30Days,
        commonSymptoms,
        trends: diagnosisTrends,
      },
      drugVerifications: {
        total: totalVerifications,
        verified: verifiedDrugs,
        expired: expiredDrugs,
        unverified: unverifiedDrugs,
      },
      sos: {
        total: totalSOSEvents,
        active: activeSOSEvents,
        resolved: resolvedSOSEvents,
      },
      hospitalRecommendations: {
        total: totalRecommendations,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

