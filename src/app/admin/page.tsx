'use client';

import { useState, useEffect } from 'react';
import { StatsCards, StatsCardsProps } from '@/components/admin/StatsCards';
import { Charts } from '@/components/admin/Charts';
import { UserTable } from '@/components/admin/UserTable';
import { DrugRegistration } from '@/components/admin/DrugRegistration';
import { DefaultAdminSetup } from '@/components/admin/DefaultAdminSetup';

export default function AdminPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Analytics Dashboard
      </h1>

      <StatsCards stats={stats as StatsCardsProps['stats']} />

      <Charts
        diagnosisTrends={stats.diagnoses.trends || []}
        commonSymptoms={stats.diagnoses.commonSymptoms || []}
        drugVerificationStats={stats.drugVerifications}
      />

      <div className="mb-8">
        <DefaultAdminSetup />
      </div>

      <div className="mb-8">
        <DrugRegistration />
      </div>

      <UserTable />
    </div>
  );
}

