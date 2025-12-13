'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { ChatMessage, Attachment } from '@/types';

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  diagnosisId?: string;
}

export function ChatInterface({
  initialMessages = [],
  diagnosisId,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (
    messageText: string,
    attachment?: { type: 'image' | 'audio'; file: File }
  ) => {
    if (!messageText.trim() && !attachment) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText || 'Sent an attachment',
      timestamp: new Date(),
      attachment: attachment
        ? {
            type: attachment.type,
            url: URL.createObjectURL(attachment.file),
            filename: attachment.file.name,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Upload attachment if present
      let attachmentUrl: string | undefined;
      if (attachment) {
        const formData = new FormData();
        formData.append('file', attachment.file);
        formData.append('type', attachment.type);

        const uploadResponse = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(`Failed to upload ${attachment.type}: ${errorData.error || 'Unknown error'}`);
        }

        const uploadData = await uploadResponse.json();
        attachmentUrl = uploadData.url;
      }

      // Send message to API
      const response = await fetch('/api/chat/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          attachment: attachmentUrl
            ? {
                type: attachment?.type,
                url: attachmentUrl,
              }
            : undefined,
          diagnosisId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get diagnosis');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update diagnosisId if this is a new conversation
      if (data.diagnosisId && !diagnosisId) {
        window.history.replaceState(
          {},
          '',
          `/chat?diagnosisId=${data.diagnosisId}`
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content:
          'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium mb-2">
              Welcome to Health Chat
            </p>
            <p className="text-sm">
              Describe your symptoms, and I&apos;ll help provide preliminary
              information. Remember to consult with healthcare professionals for
              proper diagnosis.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <InputArea onSend={handleSend} disabled={loading} />
    </div>
  );
}

