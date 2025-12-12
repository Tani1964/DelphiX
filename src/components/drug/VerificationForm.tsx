'use client';

import { useState } from 'react';
import { VerificationResult } from './VerificationResult';
import { DrugVerification } from '@/types';

type VerificationMethod = 'code' | 'image' | 'text';

export default function VerificationForm() {
  const [method, setMethod] = useState<VerificationMethod>('code');
  const [nafdacCode, setNafdacCode] = useState('');
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DrugVerification | null>(null);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('method', method);

      if (method === 'code') {
        if (!nafdacCode.trim()) {
          setError('Please enter a NAFDAC code');
          setLoading(false);
          return;
        }
        formData.append('nafdacCode', nafdacCode);
      } else if (method === 'text') {
        if (!textInput.trim()) {
          setError('Please enter drug information');
          setLoading(false);
          return;
        }
        formData.append('text', textInput);
      } else if (method === 'image') {
        if (!imageFile) {
          setError('Please select an image');
          setLoading(false);
          return;
        }
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/drug/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Drug Verification
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Verification Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMethod('code');
                  setResult(null);
                  setError('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  method === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                NAFDAC Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('image');
                  setResult(null);
                  setError('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  method === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Image Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('text');
                  setResult(null);
                  setError('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  method === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Text Search
              </button>
            </div>
          </div>

          {/* Input Fields */}
          {method === 'code' && (
            <div>
              <label
                htmlFor="nafdacCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                NAFDAC Code
              </label>
              <input
                id="nafdacCode"
                type="text"
                value={nafdacCode}
                onChange={(e) => setNafdacCode(e.target.value)}
                placeholder="e.g., 04-1234"
                className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {method === 'text' && (
            <div>
              <label
                htmlFor="textInput"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Drug Information
              </label>
              <textarea
                id="textInput"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter drug name, manufacturer, or description"
                rows={4}
                className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {method === 'image' && (
            <div>
              <label
                htmlFor="imageInput"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Drug Image
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-contain rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Drug'}
          </button>
        </form>

        {result && <VerificationResult result={result} />}
      </div>
    </div>
  );
}

