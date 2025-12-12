'use client';

import { ChatMessage } from '@/types';
import { formatDate } from '@/lib/utils';
import { Markdown } from '../Markdown';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full mb-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`rounded-lg px-4 py-2 ${
          isUser
            ? 'max-w-[80%] sm:max-w-[70%] bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 border border-gray-200'
        }`}
      >
        <Markdown>
          {message.content}
        </Markdown>
        {message.attachment && (
          <div className="mt-2">
            {message.attachment.type === 'image' && (
              <img
                src={message.attachment.url}
                alt="Attachment"
                className="max-w-full h-auto rounded-md mt-2"
              />
            )}
            {message.attachment.type === 'audio' && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l11-2v13"
                      />
                      <circle cx="6" cy="18" r="3" strokeWidth={2} stroke="currentColor" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    {message.attachment.filename && (
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {message.attachment.filename}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Audio message
                    </p>
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <audio
                    controls
                    className="w-full rounded-md"
                    preload="metadata"
                  >
                    <source src={message.attachment.url} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </div>
            )}
          </div>
        )}
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {formatDate(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

