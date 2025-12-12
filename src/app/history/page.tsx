'use client';

import { useState, useEffect } from 'react';
import { HistoryCard } from '@/components/history/HistoryCard';
import { Diagnosis } from '@/types';

export default function HistoryPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [search]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/history${query}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch history');
      }

      setDiagnoses(data.diagnoses || []);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Diagnosis History
          </h1>

          <div className="bg-white rounded-lg shadow-md p-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by symptoms or diagnosis..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        ) : diagnoses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {search
                ? 'No diagnoses found matching your search.'
                : 'No diagnosis history yet. Start a chat to get your first diagnosis.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnoses.map((diagnosis) => (
              <HistoryCard
                key={diagnosis._id}
                diagnosis={diagnosis as Diagnosis}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

