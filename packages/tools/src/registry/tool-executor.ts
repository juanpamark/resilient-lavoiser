import { ZodError } from 'zod';
import type { ToolExecutionContext, ToolExecutionResult } from '../types/tool.interface.js';
import { ToolRegistry } from './tool-registry.js';

export class ToolExecutor {
  private registry: ToolRegistry;

  constructor(registry?: ToolRegistry) {
    this.registry = registry || ToolRegistry.getInstance();
  }

  async execute(
    toolName: string,
    rawArgs: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // 1. Resolve tool definition
    const tool = this.registry.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool "${toolName}" is not registered in the system.`,
        durationMs: Date.now() - startTime,
      };
    }

    // 2. Security Defense: Strip any model-injected tenant or security identifiers
    const sanitizedArgs = { ...rawArgs };
    delete sanitizedArgs['businessId'];
    delete sanitizedArgs['business_id'];
    delete sanitizedArgs['tenantId'];
    delete sanitizedArgs['tenant_id'];

    // 3. Schema validation with Zod
    let validatedArgs: unknown;
    try {
      validatedArgs = tool.schema.parse(sanitizedArgs);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const validationIssues = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        return {
          success: false,
          error: `Invalid parameters for tool "${toolName}": ${validationIssues}`,
          durationMs: Date.now() - startTime,
        };
      }
      return {
        success: false,
        error: `Parameter validation error in tool "${toolName}".`,
        durationMs: Date.now() - startTime,
      };
    }

    // 4. Execute tool logic with verified backend context injected
    try {
      const result = await tool.execute(validatedArgs as Record<string, unknown>, context);
      return {
        success: true,
        result,
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown tool execution error';
      return {
        success: false,
        error: `Execution error in "${toolName}": ${errorMsg}`,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
