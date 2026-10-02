/**
 * Product and Catalog definitions
 */

export interface Product {
  id: string; // UUID v7
  business_id: string; // UUID v7
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  is_available: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
