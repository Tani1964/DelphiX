/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hospital } from '@/types';
import { calculateDistance } from './utils';

export async function findNearbyHospitals(
  lat: number,
  lng: number,
  radius: number = 5000,
  symptoms?: string
): Promise<Hospital[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    // Use Google Places API to find hospitals
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hospitals');
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const hospitals: Hospital[] = (data.results || []).map((place: { geometry: { location: { lat: number; lng: number; }; }; name: any; vicinity: any; formatted_address: any; rating: any; place_id: any; }) => {
      const distance = calculateDistance(
        lat,
        lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      return {
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distance,
        rating: place.rating,
        placeId: place.place_id,
      };
    });

    // Sort by distance
    hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return hospitals;
  } catch (error) {
    console.error('Error finding hospitals:', error);
    // Return mock data if API fails (for development)
    return getMockHospitals(lat, lng);
  }
}

export async function getHospitalDetails(placeId: string): Promise<Partial<Hospital>> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,rating&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hospital details');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const place = data.result;
    return {
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      rating: place.rating,
    };
  } catch (error) {
    console.error('Error fetching hospital details:', error);
    return {};
  }
}

function getMockHospitals(lat: number, lng: number): Hospital[] {
  // Mock hospitals for development/testing
  return [
    {
      name: 'Lagos University Teaching Hospital',
      address: 'Idi-Araba, Surulere, Lagos',
      lat: lat + 0.01,
      lng: lng + 0.01,
      distance: 1200,
      rating: 4.5,
      phone: '+234-1-123-4567',
    },
    {
      name: 'National Hospital Abuja',
      address: 'Central Business District, Abuja',
      lat: lat + 0.02,
      lng: lng + 0.02,
      distance: 2400,
      rating: 4.7,
      phone: '+234-9-123-4567',
    },
    {
      name: 'Eko Hospital',
      address: '31 Mobolaji Bank Anthony Way, Ikeja, Lagos',
      lat: lat - 0.01,
      lng: lng + 0.015,
      distance: 1800,
      rating: 4.3,
      phone: '+234-1-234-5678',
    },
  ];
}

export function getMapUrl(lat: number, lng: number, hospitals: Hospital[]): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return '';

  const markers = hospitals
    .map(
      (h) =>
        `markers=color:red|label:${h.name.charAt(0)}|${h.lat},${h.lng}`
    )
    .join('&');

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=12&size=600x400&${markers}&key=${apiKey}`;
}

