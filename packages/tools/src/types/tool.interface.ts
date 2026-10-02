import { z } from 'zod';

export interface ToolExecutionContext {
  businessId: string;
  conversationId: string;
  customerId?: string;
  channelType?: string;
  // Database or repository service abstractions can be injected here
  dbClient?: unknown;
}

export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  durationMs: number;
}

export interface ToolDefinition<TArgs = any, TResult = any> {
  name: string;
  description: string;
  schema: z.ZodType<TArgs, any, any>;
  execute: (args: TArgs, context: ToolExecutionContext) => Promise<TResult>;
  category?: 'business' | 'catalog' | 'order' | 'support' | 'appointment';
}
