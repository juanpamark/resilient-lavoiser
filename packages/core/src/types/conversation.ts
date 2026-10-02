/**
 * Conversation and Message definitions
 */

export type ConversationStatus = 'active' | 'waiting_for_human' | 'human_active' | 'closed';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'human_agent';

export type ContentType = 'text' | 'image' | 'audio' | 'document' | 'interactive';

export interface ToolCallItem {
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResultItem {
  tool_call_id?: string;
  name: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface Conversation {
  id: string; // UUID v7
  business_id: string; // UUID v7
  agent_id: string; // UUID v7
  customer_id: string; // UUID v7
  channel_type: string;
  status: ConversationStatus;
  assigned_to: string | null; // UUID of business staff when handed off
  metadata: Record<string, unknown>;
  started_at: string;
  last_message_at: string;
  closed_at: string | null;
  created_at: string;
}

export interface Message {
  id: string; // UUID v7
  conversation_id: string; // UUID v7
  business_id: string; // UUID v7
  role: MessageRole;
  content_type: ContentType;
  content: string;
  tool_calls: ToolCallItem[] | null;
  tool_results: ToolResultItem[] | null;
  channel_metadata: Record<string, unknown> | null;
  external_message_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  model_used: string | null;
  created_at: string;
}
