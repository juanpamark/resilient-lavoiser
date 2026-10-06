/**
 * Canonical, vendor-agnostic interfaces for AI Providers
 */

export type CanonicalRole = 'system' | 'user' | 'assistant' | 'tool_result';

export interface TextPart {
  type: 'text';
  text: string;
}

export interface FunctionCallPart {
  type: 'function_call';
  id?: string;
  name: string;
  args: Record<string, unknown>;
  thoughtSignature?: string;
}

export interface FunctionResponsePart {
  type: 'function_response';
  callId?: string;
  name: string;
  response: Record<string, unknown>;
}

export type CanonicalPart = TextPart | FunctionCallPart | FunctionResponsePart;

export interface CanonicalMessage {
  role: CanonicalRole;
  parts: CanonicalPart[];
}

export interface ToolDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
}

export interface GenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
}

export interface GenerateRequest {
  model: string;
  systemInstruction?: string;
  messages: CanonicalMessage[];
  tools?: ToolDeclaration[];
  config?: GenerationConfig;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export type FinishReason = 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'TOOL_CALLS' | 'OTHER';

export interface GenerateResponse {
  text: string | null;
  toolCalls?: FunctionCallPart[];
  usage: TokenUsage;
  modelUsed: string;
  finishReason: FinishReason;
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'usage';
  textDelta?: string;
  toolCallDelta?: FunctionCallPart;
  usage?: TokenUsage;
}

export interface AIProvider {
  readonly name: string;
  generate(request: GenerateRequest): Promise<GenerateResponse>;
  generateStream?(request: GenerateRequest): AsyncIterable<StreamChunk>;
}
