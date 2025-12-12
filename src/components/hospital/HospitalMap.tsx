'use client';

import { useEffect, useRef, useState } from 'react';
import { Hospital } from '@/types';

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation?: { lat: number; lng: number };
  selectedHospital?: Hospital;
}

// Type definitions for Google Maps (loaded dynamically)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

export function HospitalMap({
  hospitals,
  userLocation,
  selectedHospital,
}: HospitalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      // Defer state update to avoid cascading renders
      setTimeout(() => setIsScriptLoaded(true), 0);
      return;
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);

    return () => {
      // Only remove script if we're the one who added it
      const scriptToRemove = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );
      if (scriptToRemove && scriptToRemove === script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize map only after script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !window.google || !mapRef.current) {
      return;
    }

    // Initialize map
    const center = userLocation || {
      lat: hospitals[0]?.lat || 6.5244,
      lng: hospitals[0]?.lng || 3.3792,
    };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
    });

    mapInstanceRef.current = map;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Your Location',
      });
      markersRef.current.push(userMarker);
    }

    // Add hospital markers
    hospitals.forEach((hospital) => {
      const marker = new window.google.maps.Marker({
        position: { lat: hospital.lat, lng: hospital.lng },
        map,
        title: hospital.name,
        icon: {
          url: selectedHospital?.placeId === hospital.placeId
            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${hospital.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${hospital.address}</p>
            ${hospital.rating ? `<p style="margin: 4px 0 0 0; font-size: 12px;">⭐ ${hospital.rating.toFixed(1)}</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [hospitals, userLocation, selectedHospital, isScriptLoaded]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-64 sm:h-96 rounded-lg border border-gray-300"
    />
  );
}

