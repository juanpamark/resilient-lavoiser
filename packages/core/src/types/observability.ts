/**
 * Observability, Logging and Metrics type definitions (1:1 with Migration 009)
 */

export type WebhookEventStatus = 'received' | 'processing' | 'processed' | 'failed';

export interface WebhookEvent {
  id: string; // UUID v7 / v4
  channel_type: string;
  external_message_id: string;
  business_id: string | null; // UUID
  status: WebhookEventStatus;
  raw_payload: Record<string, unknown>;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface AIUsageLog {
  id: string; // UUID v7 / v4
  business_id: string; // UUID
  conversation_id: string; // UUID
  message_id: string | null; // UUID
  provider: string; // 'gemini' | 'openai' | 'anthropic'
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  tool_calls_count: number;
  latency_ms: number;
  created_at: string;
}

export interface ToolExecutionLog {
  id: string; // UUID v7 / v4
  business_id: string; // UUID
  conversation_id: string; // UUID
  message_id: string | null; // UUID
  tool_name: string;
  input_params: Record<string, unknown>;
  result_success: boolean;
  result_data: Record<string, unknown> | null;
  execution_time_ms: number;
  error_message: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string; // UUID v7 / v4
  business_id: string | null; // UUID (null for platform-level actions)
  user_id: string | null; // UUID
  action: string;
  resource_type: string;
  resource_id: string | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
