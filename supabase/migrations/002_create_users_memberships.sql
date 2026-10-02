-- ==============================================================================
-- Migration 002: Create Platform Admins and Business Memberships
-- ==============================================================================

-- Table: platform_admins (Global agency administrators)
CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: memberships (Tenant users, associating auth.users to businesses)
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_membership_user_business UNIQUE (user_id, business_id)
);

-- Indices for rapid tenant lookups & auth hook execution
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_business_id ON public.memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_memberships_active_lookup ON public.memberships(user_id, is_active);
