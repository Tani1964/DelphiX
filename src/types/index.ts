// User Types
export interface User {
  _id?: string;
  email: string;
  password?: string;
  name: string;
  role: 'user' | 'admin';
  emergencyContacts?: EmergencyContact[];
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  _id?: string;
}

// Diagnosis Types
export interface Diagnosis {
  _id?: string;
  userId: string;
  symptoms: string;
  diagnosis: string;
  recommendations?: string;
  chatHistory: ChatMessage[];
  attachments?: Attachment[];
  createdAt?: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachment?: Attachment;
}

export interface Attachment {
  type: 'image' | 'audio';
  url: string;
  filename?: string;
}

// Drug Verification Types
export interface DrugVerification {
  _id?: string;
  userId: string;
  nafdacCode?: string;
  verificationMethod: 'code' | 'image' | 'text';
  drugInfo: {
    name?: string;
    manufacturer?: string;
    status?: 'verified' | 'unverified' | 'expired';
    expiryDate?: string;
    batchNumber?: string;
  };
  imageUrl?: string;
  result: 'verified' | 'unverified' | 'expired' | 'invalid';
  createdAt?: Date;
}

// SOS Types
export interface SOSEvent {
  _id?: string;
  userId: string;
  activatedAt: Date;
  status: 'active' | 'resolved';
  lastActivityCheck?: Date;
  helpRequestedAt?: Date;
  emergencyContactsNotified?: string[];
  hospitalsNotified?: string[];
  resolvedAt?: Date;
}

// Hospital Recommendation Types
export interface HospitalRecommendation {
  _id?: string;
  userId: string;
  symptoms: string;
  recommendedHospitals: Hospital[];
  selectedHospital?: string;
  createdAt?: Date;
}

export interface Hospital {
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  rating?: number;
  phone?: string;
  placeId?: string;
}

