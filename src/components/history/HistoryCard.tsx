'use client';

import { Diagnosis } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface HistoryCardProps {
  diagnosis: Diagnosis;
}

export function HistoryCard({ diagnosis }: HistoryCardProps) {
  const preview = diagnosis.chatHistory
    ?.find((msg) => msg.role === 'user')
    ?.content?.substring(0, 100) || diagnosis.symptoms;

  return (
    <Link href={`/history/${diagnosis._id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {diagnosis.symptoms.substring(0, 50)}
            {diagnosis.symptoms.length > 50 ? '...' : ''}
          </h3>
          {diagnosis.createdAt && (
            <span className="text-sm text-gray-500">
              {formatDate(diagnosis.createdAt)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{preview}</p>

        {diagnosis.diagnosis && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-700 line-clamp-2">
              {diagnosis.diagnosis.substring(0, 150)}
              {diagnosis.diagnosis.length > 150 ? '...' : ''}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {diagnosis.chatHistory?.length || 0} messages
          </span>
          <span className="text-blue-600 font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  );
}

