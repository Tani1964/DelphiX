'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Diagnosis, ChatMessage } from '@/types';
import Link from 'next/link';
import { Markdown } from '@/components/Markdown';

export default function DiagnosisDetailPage() {
  const params = useParams();
  const diagnosisId = (params?.id as string) || '';
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (diagnosisId) {
      fetchDiagnosis();
    }
  }, [diagnosisId]);

  const fetchDiagnosis = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/history/${diagnosisId}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch diagnosis');
      }

      setDiagnosis(data.diagnosis);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading diagnosis...</p>
        </div>
      </div>
    );
  }

  if (error || !diagnosis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Diagnosis not found'}</p>
          <Link
            href="/history"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/history"
          className="text-blue-600 hover:text-blue-700 mb-6 inline-block"
        >
          ← Back to History
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Diagnosis Details
          </h1>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">
                Symptoms:
              </span>
              <div className="text-gray-900">
                <Markdown>{diagnosis.symptoms}</Markdown>
              </div>
            </div>

            {diagnosis.diagnosis && (
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Diagnosis:
                </span>
                <div className="text-gray-900">
                  <Markdown>{diagnosis.diagnosis}</Markdown>
                </div>
              </div>
            )}

            {diagnosis.recommendations && (
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Recommendations:
                </span>
                <div className="text-gray-900">
                  <Markdown>{diagnosis.recommendations}</Markdown>
                </div>
              </div>
            )}

            {diagnosis.createdAt && (
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Date:
                </span>
                <p className="text-gray-900">
                  {new Date(diagnosis.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Chat History
          </h2>

          <div className="space-y-4">
            {diagnosis.chatHistory && diagnosis.chatHistory.length > 0 ? (
              diagnosis.chatHistory.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={{
                    ...message,
                    timestamp: new Date(message.timestamp),
                  }}
                />
              ))
            ) : (
              <p className="text-gray-500">No chat history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

