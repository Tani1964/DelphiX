'use client';

import { useState } from 'react';
import { DrugVerification } from '@/types';

export function DrugRegistration() {
  const [nafdacCode, setNafdacCode] = useState('');
  const [drugName, setDrugName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ cid: string; nafdacCode: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/drugs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nafdacCode,
          drugInfo: {
            name: drugName,
            manufacturer,
            status: 'verified',
            expiryDate: expiryDate || undefined,
            batchNumber: batchNumber || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register drug');
      }

      setSuccess({ cid: data.ipfsCID, nafdacCode });
      
      // Reset form
      setNafdacCode('');
      setDrugName('');
      setManufacturer('');
      setExpiryDate('');
      setBatchNumber('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Register Drug to IPFS
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <p className="text-sm text-green-800 font-medium mb-2">
              Drug registered successfully!
            </p>
            <p className="text-xs text-green-700">
              NAFDAC Code: {success.nafdacCode}
            </p>
            <p className="text-xs text-green-700 font-mono break-all">
              IPFS CID: {success.cid}
            </p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${success.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-800 underline mt-1 inline-block"
            >
              View on IPFS →
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="nafdacCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              NAFDAC Code *
            </label>
            <input
              id="nafdacCode"
              type="text"
              required
              value={nafdacCode}
              onChange={(e) => setNafdacCode(e.target.value)}
              placeholder="e.g., 04-1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="drugName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Drug Name *
            </label>
            <input
              id="drugName"
              type="text"
              required
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              placeholder="e.g., Paracetamol 500mg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="manufacturer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Manufacturer *
            </label>
            <input
              id="manufacturer"
              type="text"
              required
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g., Emzor Pharmaceuticals"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="batchNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Batch Number
            </label>
            <input
              id="batchNumber"
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g., BATCH-2024-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Expiry Date
            </label>
            <input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register to IPFS'}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Only admins can register drugs to IPFS. 
          This creates a permanent, decentralized record of the drug verification.
        </p>
      </div>
    </div>
  );
}

