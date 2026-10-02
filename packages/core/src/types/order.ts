/**
 * Order definitions
 */

export type OrderStatus = 'pending' | 'confirmed' | 'in_preparation' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string; // UUID v7
  order_id: string; // UUID v7
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customizations?: Record<string, unknown>;
}

export interface Order {
  id: string; // UUID v7
  business_id: string; // UUID v7
  customer_id: string; // UUID v7
  conversation_id: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  delivery_info: Record<string, unknown> | null;
  notes: string | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}
