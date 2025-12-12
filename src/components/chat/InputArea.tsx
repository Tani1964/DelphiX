'use client';

import { useState, useRef } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { ImageUpload } from './ImageUpload';

interface InputAreaProps {
  onSend: (message: string, attachment?: { type: 'image' | 'audio'; file: File }) => void;
  disabled?: boolean;
}

export function InputArea({ onSend, disabled }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAudioComplete = async (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], 'recording.webm', {
      type: 'audio/webm',
    });
    onSend('', { type: 'audio', file: audioFile });
    setShowAudioRecorder(false);
  };

  const handleImageSelect = (file: File) => {
    onSend('', { type: 'image', file });
    setShowImageUpload(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {showAudioRecorder && (
        <div className="mb-4">
          <AudioRecorder
            onRecordingComplete={handleAudioComplete}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </div>
      )}

      {showImageUpload && (
        <div className="mb-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            onCancel={() => setShowImageUpload(false)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms..."
            rows={1}
            disabled={disabled}
            className="w-full text-gray-900 placeholder:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setShowImageUpload(!showImageUpload);
              setShowAudioRecorder(false);
            }}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Upload Image"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAudioRecorder(!showAudioRecorder);
              setShowImageUpload(false);
            }}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Record Audio"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

