'use client';

import { Hospital } from '@/types';
import { formatDistance } from '@/lib/utils';

interface HospitalCardProps {
  hospital: Hospital;
  onSelect?: (hospital: Hospital) => void;
}

export function HospitalCard({ hospital, onSelect }: HospitalCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {hospital.name}
        </h3>
        {hospital.rating && (
          <div className="flex items-center space-x-1">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {hospital.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>

      {hospital.distance !== undefined && (
        <p className="text-sm text-blue-600 font-medium mb-3">
          {formatDistance(hospital.distance)} away
        </p>
      )}

      {hospital.phone && (
        <p className="text-sm text-gray-600 mb-4">
          📞 {hospital.phone}
        </p>
      )}

      <div className="flex space-x-2">
        {hospital.placeId && (
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${hospital.placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View on Maps
          </a>
        )}
        {onSelect && (
          <button
            onClick={() => onSelect(hospital)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Select
          </button>
        )}
      </div>
    </div>
  );
}

