/**
 * Platform and Business Role definitions & JWT Claims
 */

export type PlatformRole = 'platform_admin';

export interface PlatformAdmin {
  user_id: string; // UUID v7 / v4
  created_at: string;
}

export type BusinessRole = 'owner' | 'admin' | 'staff';

export interface CustomJwtPayload {
  sub: string; // Auth User UUID
  email?: string;
  is_platform_admin?: boolean;
  business_id?: string; // Active Tenant UUID
  user_role?: BusinessRole; // Role within the active tenant
  iat?: number;
  exp?: number;
}

export type PlatformPermission =
  | 'platform:manage_businesses'
  | 'platform:view_analytics'
  | 'platform:manage_settings'
  | 'platform:manage_admins';

export type BusinessPermission =
  | 'business:manage_settings'
  | 'business:manage_agents'
  | 'business:manage_products'
  | 'business:view_conversations'
  | 'business:manage_conversations'
  | 'business:manage_orders'
  | 'business:manage_customers'
  | 'business:manage_channels'
  | 'business:view_analytics'
  | 'business:manage_team';

export const BUSINESS_ROLE_PERMISSIONS: Record<BusinessRole, BusinessPermission[]> = {
  owner: [
    'business:manage_settings',
    'business:manage_agents',
    'business:manage_products',
    'business:view_conversations',
    'business:manage_conversations',
    'business:manage_orders',
    'business:manage_customers',
    'business:manage_channels',
    'business:view_analytics',
    'business:manage_team',
  ],
  admin: [
    'business:manage_settings',
    'business:manage_agents',
    'business:manage_products',
    'business:view_conversations',
    'business:manage_conversations',
    'business:manage_orders',
    'business:manage_customers',
    'business:manage_channels',
    'business:view_analytics',
  ],
  staff: [
    'business:view_conversations',
    'business:manage_conversations',
    'business:manage_orders',
    'business:manage_customers',
  ],
};
