'use client';

import { DrugVerification } from '@/types';
import { formatDate } from '@/lib/utils';
import { VerificationSource } from '@/lib/drug-verification';

interface VerificationResultProps {
  result: DrugVerification & {
    verificationSource?: VerificationSource;
    ipfsCID?: string;
  };
}

export function VerificationResult({ result }: VerificationResultProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'unverified':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'expired':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getSourceLabel = (source?: VerificationSource) => {
    switch (source) {
      case 'external_api':
        return { label: 'External API (EMDEX)', color: 'bg-purple-100 text-purple-800' };
      case 'ipfs':
        return { label: 'IPFS (Decentralized)', color: 'bg-blue-100 text-blue-800' };
      case 'database':
        return { label: 'Local Database', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: 'Unknown Source', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const sourceInfo = getSourceLabel(result.verificationSource);

  return (
    <div className="mt-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Verification Result
        </h3>
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(
            result.result
          )}`}
        >
          {getStatusIcon(result.result)}
          <span className="font-medium capitalize">{result.result}</span>
        </div>
      </div>

      {/* Verification Source Badge */}
      {result.verificationSource && (
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${sourceInfo.color}`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Verified via: {sourceInfo.label}
          </span>
        </div>
      )}

      {result.drugInfo && (
        <div className="space-y-3">
          {result.drugInfo.name && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Drug Name:
              </span>
              <p className="text-gray-900">{result.drugInfo.name}</p>
            </div>
          )}

          {result.drugInfo.manufacturer && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Manufacturer:
              </span>
              <p className="text-gray-900">{result.drugInfo.manufacturer}</p>
            </div>
          )}

          {result.drugInfo.batchNumber && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Batch Number:
              </span>
              <p className="text-gray-900">{result.drugInfo.batchNumber}</p>
            </div>
          )}

          {result.drugInfo.expiryDate && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Expiry Date:
              </span>
              <p className="text-gray-900">
                {new Date(result.drugInfo.expiryDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {result.nafdacCode && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                NAFDAC Code:
              </span>
              <p className="text-gray-900">{result.nafdacCode}</p>
            </div>
          )}

          {result.createdAt && (
            <div>
              <span className="text-sm font-medium text-gray-600">
                Verified On:
              </span>
              <p className="text-gray-900">{formatDate(result.createdAt)}</p>
            </div>
          )}

          {/* IPFS CID Display */}
          {result.ipfsCID && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Registered on IPFS (Decentralized Storage)
                  </p>
                  <p className="text-xs text-blue-600 font-mono break-all">
                    CID: {result.ipfsCID}
                  </p>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${result.ipfsCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                  >
                    View on IPFS →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {result.result === 'expired' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            ⚠️ This drug has expired. Please do not use it.
          </p>
        </div>
      )}

      {result.result === 'unverified' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ This drug could not be verified. Please verify with a
            healthcare professional before use.
          </p>
        </div>
      )}
    </div>
  );
}
