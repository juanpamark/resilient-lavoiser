/**
 * Customer definitions
 */

export interface Customer {
  id: string; // UUID v7
  business_id: string; // UUID v7
  external_id: string; // Channel unique identifier (e.g. WhatsApp phone number)
  channel_type: string;
  display_name: string | null;
  phone: string | null;
  profile: Record<string, unknown>;
  metadata: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
}
