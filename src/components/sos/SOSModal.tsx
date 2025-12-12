'use client';

interface SOSModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SOSModal({ onConfirm, onCancel, isLoading }: SOSModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Activate SOS Mode
        </h2>

        <p className="text-gray-600 text-center mb-6">
          SOS mode will monitor your activity. If you become inactive for 2
          minutes, emergency contacts and nearby hospitals will be notified
          automatically.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Only activate this if you are in a genuine
            emergency situation.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Activating...' : 'Activate SOS'}
          </button>
        </div>
      </div>
    </div>
  );
}

