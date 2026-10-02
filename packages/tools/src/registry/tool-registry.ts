import type { ToolDefinition } from '../types/tool.interface.js';
import { zodToJsonSchema } from '../schema/zod-to-json-schema.js';

export interface ToolDeclarationExport {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  exportDeclarations(enabledNames?: string[]): ToolDeclarationExport[] {
    const list = enabledNames
      ? enabledNames.map(name => this.tools.get(name)).filter((t): t is ToolDefinition => Boolean(t))
      : Array.from(this.tools.values());

    return list.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.schema),
    }));
  }

  clear(): void {
    this.tools.clear();
  }
}
