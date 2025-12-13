'use client';

import { useState } from 'react';

export function DefaultAdminSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const createDefaultAdmin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/create-default-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          setMessage({
            type: 'info',
            text: `Default admin already exists: ${data.email}`,
          });
        } else {
          setMessage({
            type: 'success',
            text: `Default admin created successfully! Email: ${data.email}. Please change the password after first login.`,
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to create default admin',
        });
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred while creating the default admin',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Default Admin Setup</h3>
          <p className="text-sm text-gray-600 mt-1">
            Create the default admin user if it doesn&apos;t exist
          </p>
        </div>
        <button
          onClick={createDefaultAdmin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Default Admin'}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : message.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
          {message.type === 'success' && (
            <div className="mt-2 text-xs text-green-700">
              <p className="font-semibold">Default credentials:</p>
              <p>Email: admin@delphi.health (or check your .env file)</p>
              <p>Password: admin123 (or check your .env file)</p>
              <p className="mt-2 font-semibold text-red-600">
                ⚠️ Please change the password after first login!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

