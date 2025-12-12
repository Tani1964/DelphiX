'use client';

import { useState, useEffect } from 'react';
import { HospitalCard } from '@/components/hospital/HospitalCard';
import { HospitalMap } from '@/components/hospital/HospitalMap';
import { Hospital } from '@/types';

export default function HospitalsPage() {
  const [symptoms, setSymptoms] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Default to Lagos, Nigeria if geolocation fails
          setUserLocation({ lat: 6.5244, lng: 3.3792 });
        }
      );
    } else {
      // Default to Lagos, Nigeria
      setUserLocation({ lat: 6.5244, lng: 3.3792 });
    }
  }, []);

  const handleSearch = async () => {
    if (!userLocation) {
      setError('Please enable location access');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hospital/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 10000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find hospitals');
      }

      setHospitals(data.hospitals || []);
    } catch (err) {
      setError((err as Error)?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Find Hospitals
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="symptoms"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Describe your symptoms (optional)
              </label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., chest pain, fever, headache..."
                rows={3}
                className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !userLocation}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find Nearby Hospitals'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {hospitals.length > 0 && (
          <>
            <div className="mb-6">
              <HospitalMap
                hospitals={hospitals}
                userLocation={userLocation || undefined}
                selectedHospital={selectedHospital || undefined}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map((hospital, index) => (
                <HospitalCard
                  key={hospital.placeId || index}
                  hospital={hospital}
                  onSelect={setSelectedHospital}
                />
              ))}
            </div>
          </>
        )}

        {!loading && hospitals.length === 0 && userLocation && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">Enter symptoms and click &quot;Find Nearby Hospitals&quot; to get recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
}

