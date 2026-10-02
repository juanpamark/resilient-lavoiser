-- ==============================================================================
-- Migration 011: Strict Multi-Tenant Row Level Security (RLS) Policies
-- ==============================================================================

-- Helper expression for Tenant Isolation via InitPlan caching:
-- (SELECT (auth.jwt() ->> 'business_id')::uuid)
-- (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true

-- ------------------------------------------------------------------------------
-- 1. Table: businesses
-- ------------------------------------------------------------------------------
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses FORCE ROW LEVEL SECURITY;

CREATE POLICY "businesses_select_own_or_admin" ON public.businesses
  FOR SELECT TO authenticated
  USING (
    id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "businesses_update_owner_or_admin" ON public.businesses
  FOR UPDATE TO authenticated
  USING (
    (id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- ------------------------------------------------------------------------------
-- 2. Table: platform_admins
-- ------------------------------------------------------------------------------
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins FORCE ROW LEVEL SECURITY;

CREATE POLICY "platform_admins_select" ON public.platform_admins
  FOR SELECT TO authenticated
  USING ((SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true);

-- ------------------------------------------------------------------------------
-- 3. Table: memberships
-- ------------------------------------------------------------------------------
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY "memberships_select_tenant_or_self" ON public.memberships
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR user_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "memberships_insert_tenant_owner_admin" ON public.memberships
  FOR INSERT TO authenticated
  WITH CHECK (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "memberships_update_tenant_owner_admin" ON public.memberships
  FOR UPDATE TO authenticated
  USING (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- ------------------------------------------------------------------------------
-- 4. Tables: agents & agent_configs
-- ------------------------------------------------------------------------------
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents FORCE ROW LEVEL SECURITY;

CREATE POLICY "agents_select" ON public.agents
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "agents_insert" ON public.agents
  FOR INSERT TO authenticated
  WITH CHECK (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "agents_update" ON public.agents
  FOR UPDATE TO authenticated
  USING (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- agent_configs
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configs FORCE ROW LEVEL SECURITY;

CREATE POLICY "agent_configs_select" ON public.agent_configs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agents a
      WHERE a.id = agent_id
        AND (a.business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true)
    )
  );

CREATE POLICY "agent_configs_insert" ON public.agent_configs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents a
      WHERE a.id = agent_id
        AND ((a.business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
             OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true)
    )
  );

-- ------------------------------------------------------------------------------
-- 5. Table: channel_connections (WhatsApp / Meta Cloud API)
-- ------------------------------------------------------------------------------
ALTER TABLE public.channel_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_connections FORCE ROW LEVEL SECURITY;

CREATE POLICY "channel_connections_select" ON public.channel_connections
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "channel_connections_modify" ON public.channel_connections
  FOR ALL TO authenticated
  USING (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- ------------------------------------------------------------------------------
-- 6. Table: customers
-- ------------------------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

CREATE POLICY "customers_select" ON public.customers
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "customers_insert" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "customers_update" ON public.customers
  FOR UPDATE TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- ------------------------------------------------------------------------------
-- 7. Tables: conversations & messages
-- ------------------------------------------------------------------------------
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "conversations_update" ON public.conversations
  FOR UPDATE TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- ------------------------------------------------------------------------------
-- 8. Table: products
-- ------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON public.products
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "products_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "products_update" ON public.products
  FOR UPDATE TO authenticated
  USING (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "products_delete" ON public.products
  FOR DELETE TO authenticated
  USING (
    (business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) AND (SELECT auth.jwt() ->> 'user_role') IN ('owner', 'admin'))
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- ------------------------------------------------------------------------------
-- 9. Tables: orders & order_items
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

CREATE POLICY "orders_select" ON public.orders
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  )
  WITH CHECK (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

-- order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid) OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true)
    )
  );

-- ------------------------------------------------------------------------------
-- 10. Observability Tables (ai_usage_logs, tool_execution_logs, audit_logs)
-- ------------------------------------------------------------------------------
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_logs_select" ON public.ai_usage_logs
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

ALTER TABLE public.tool_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_execution_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "tool_execution_logs_select" ON public.tool_execution_logs
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events FORCE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_select" ON public.webhook_events
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    business_id = (SELECT (auth.jwt() ->> 'business_id')::uuid)
    OR (SELECT (auth.jwt() ->> 'is_platform_admin')::boolean) = true
  );
