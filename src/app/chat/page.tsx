'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ChatMessage } from '@/types';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const diagnosisId = searchParams?.get('diagnosisId');
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(!!diagnosisId);

  useEffect(() => {
    if (diagnosisId) {
      // Load existing chat history
      fetch(`/api/chat/history?diagnosisId=${diagnosisId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.chatHistory) {
            setInitialMessages(
              data.chatHistory.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }))
            );
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [diagnosisId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Health Chat
        </h1>
        <ChatInterface
          initialMessages={initialMessages}
          diagnosisId={diagnosisId || undefined}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chat...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

