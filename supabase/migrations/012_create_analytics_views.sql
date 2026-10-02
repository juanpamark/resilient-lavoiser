-- ==============================================================================
-- Migration 012: Analytics Views for Platform & Business Observability
-- Note: Views use WITH (security_invoker = true) so PostgreSQL enforces
-- the underlying tables' Row Level Security (RLS) automatically per tenant!
-- ==============================================================================

-- 1. Monthly AI Usage and Cost Summary
CREATE OR REPLACE VIEW public.v_monthly_ai_usage
WITH (security_invoker = true) AS
SELECT
  business_id,
  DATE_TRUNC('month', created_at) AS month,
  provider,
  model,
  SUM(input_tokens)::BIGINT AS total_input_tokens,
  SUM(output_tokens)::BIGINT AS total_output_tokens,
  SUM(input_tokens + output_tokens)::BIGINT AS total_tokens,
  SUM(estimated_cost_usd)::NUMERIC(10, 6) AS total_cost_usd,
  SUM(tool_calls_count)::BIGINT AS total_tool_calls,
  ROUND(AVG(latency_ms), 0)::INTEGER AS avg_latency_ms,
  COUNT(*)::BIGINT AS total_requests
FROM public.ai_usage_logs
GROUP BY business_id, DATE_TRUNC('month', created_at), provider, model;

-- 2. Agent Performance & Automation Rate Metrics
CREATE OR REPLACE VIEW public.v_agent_performance_metrics
WITH (security_invoker = true) AS
WITH conv_stats AS (
  SELECT
    c.business_id,
    COUNT(c.id)::BIGINT AS total_conversations,
    COUNT(c.id) FILTER (WHERE c.status = 'active')::BIGINT AS active_ai_conversations,
    COUNT(c.id) FILTER (WHERE c.status IN ('waiting_for_human', 'human_active') OR c.assigned_to IS NOT NULL)::BIGINT AS human_handled_conversations,
    COUNT(c.id) FILTER (WHERE c.status = 'closed')::BIGINT AS closed_conversations
  FROM public.conversations c
  GROUP BY c.business_id
),
order_stats AS (
  SELECT
    o.business_id,
    COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0.00 END), 0.00)::NUMERIC(12, 2) AS total_sales_revenue,
    COUNT(DISTINCT CASE WHEN o.status != 'cancelled' THEN o.id ELSE NULL END)::BIGINT AS total_orders_confirmed
  FROM public.orders o
  GROUP BY o.business_id
)
SELECT
  b.id AS business_id,
  COALESCE(cs.total_conversations, 0)::BIGINT AS total_conversations,
  COALESCE(cs.active_ai_conversations, 0)::BIGINT AS active_ai_conversations,
  COALESCE(cs.human_handled_conversations, 0)::BIGINT AS human_handled_conversations,
  COALESCE(cs.closed_conversations, 0)::BIGINT AS closed_conversations,
  CASE
    WHEN COALESCE(cs.total_conversations, 0) > 0 THEN
      ROUND(
        ((cs.total_conversations - cs.human_handled_conversations)::NUMERIC / cs.total_conversations::NUMERIC) * 100.0,
        1
      )
    ELSE 100.0
  END AS automation_rate_pct,
  COALESCE(os.total_sales_revenue, 0.00)::NUMERIC(12, 2) AS total_sales_revenue,
  COALESCE(os.total_orders_confirmed, 0)::BIGINT AS total_orders_confirmed
FROM public.businesses b
LEFT JOIN conv_stats cs ON cs.business_id = b.id
LEFT JOIN order_stats os ON os.business_id = b.id;

-- 3. Hourly Traffic Distribution (for Peak Hours Heatmap)
CREATE OR REPLACE VIEW public.v_hourly_message_distribution
WITH (security_invoker = true) AS
SELECT
  business_id,
  EXTRACT(HOUR FROM created_at)::INTEGER AS hour_of_day,
  COUNT(*)::BIGINT AS total_messages,
  COUNT(*) FILTER (WHERE role = 'user')::BIGINT AS customer_messages,
  COUNT(*) FILTER (WHERE role = 'assistant')::BIGINT AS ai_messages,
  COUNT(*) FILTER (WHERE role = 'human_agent')::BIGINT AS human_agent_messages
FROM public.messages
GROUP BY business_id, EXTRACT(HOUR FROM created_at);

-- Grant SELECT permissions on views to authenticated users
GRANT SELECT ON public.v_monthly_ai_usage TO authenticated;
GRANT SELECT ON public.v_agent_performance_metrics TO authenticated;
GRANT SELECT ON public.v_hourly_message_distribution TO authenticated;
