/**
 * Business (Tenant) definitions
 */

export type BusinessStatus = 'active' | 'suspended' | 'trial' | 'archived';

export interface BusinessHours {
  timezone: string;
  days: {
    [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']?: {
      open: string; // "09:00"
      close: string; // "18:00"
      closed: boolean;
    };
  };
}

export interface BusinessLocation {
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Business {
  id: string; // UUID v7
  name: string;
  description: string | null;
  status: BusinessStatus;
  timezone: string;
  business_hours: BusinessHours | null;
  location: BusinessLocation | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string; // UUID v7
  user_id: string; // UUID v7 (Supabase auth.users)
  business_id: string; // UUID v7
  role: 'owner' | 'admin' | 'staff';
  is_active: boolean;
  created_at: string;
}
