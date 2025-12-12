'use client';

import { useState, useEffect } from 'react';
import { SOSModal } from './SOSModal';

export function SOSButton() {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if SOS is already active
    fetch('/api/sos/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setIsActive(true);
          startActivityMonitoring();
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isActive) {
      startActivityMonitoring();
    }
  }, [isActive]);

  const startActivityMonitoring = () => {
    // Send heartbeat every 30 seconds
    const interval = setInterval(() => {
      fetch('/api/sos/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartbeat: true }),
      }).catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sos/activate', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsActive(true);
        setShowModal(false);
        startActivityMonitoring();
      } else {
        alert(data.error || 'Failed to activate SOS');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sos/resolve', {
        method: 'POST',
      });

      if (response.ok) {
        setIsActive(false);
      }
    } catch (error) {
      console.error('Error deactivating SOS:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => (isActive ? handleDeactivate() : setShowModal(true))}
        disabled={isLoading}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg transition-all ${
          isActive
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : 'bg-red-500 hover:bg-red-600'
        } disabled:opacity-50`}
        title={isActive ? 'Deactivate SOS' : 'Activate SOS'}
      >
        {isActive ? 'SOS' : 'SOS'}
      </button>

      {showModal && (
        <SOSModal
          onConfirm={handleActivate}
          onCancel={() => setShowModal(false)}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

