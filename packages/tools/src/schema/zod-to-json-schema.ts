import { z } from 'zod';

export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  // Unwrap optionals, defaults, and effects
  let unwrapped: z.ZodTypeAny = schema;
  while (
    unwrapped instanceof z.ZodOptional ||
    unwrapped instanceof z.ZodNullable ||
    unwrapped instanceof z.ZodDefault
  ) {
    if (unwrapped instanceof z.ZodOptional || unwrapped instanceof z.ZodNullable) {
      unwrapped = unwrapped.unwrap();
    } else if (unwrapped instanceof z.ZodDefault) {
      unwrapped = unwrapped._def.innerType;
    }
  }

  if (unwrapped instanceof z.ZodString) {
    const res: Record<string, unknown> = { type: 'string' };
    if (unwrapped.description) res.description = unwrapped.description;
    return res;
  }

  if (unwrapped instanceof z.ZodNumber) {
    const res: Record<string, unknown> = { type: 'number' };
    if (unwrapped.description) res.description = unwrapped.description;
    return res;
  }

  if (unwrapped instanceof z.ZodBoolean) {
    const res: Record<string, unknown> = { type: 'boolean' };
    if (unwrapped.description) res.description = unwrapped.description;
    return res;
  }

  if (unwrapped instanceof z.ZodEnum) {
    const res: Record<string, unknown> = {
      type: 'string',
      enum: unwrapped._def.values,
    };
    if (unwrapped.description) res.description = unwrapped.description;
    return res;
  }

  if (unwrapped instanceof z.ZodArray) {
    const res: Record<string, unknown> = {
      type: 'array',
      items: zodToJsonSchema(unwrapped.element),
    };
    if (unwrapped.description) res.description = unwrapped.description;
    return res;
  }

  if (unwrapped instanceof z.ZodObject) {
    const shape = unwrapped.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, propSchema] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(propSchema as z.ZodTypeAny);

      // Check if required (not optional or nullable)
      const isOptional =
        propSchema instanceof z.ZodOptional || propSchema instanceof z.ZodDefault;
      if (!isOptional) {
        required.push(key);
      }
    }

    const res: Record<string, unknown> = {
      type: 'object',
      properties,
    };
    if (required.length > 0) {
      res.required = required;
    }
    if (unwrapped.description) {
      res.description = unwrapped.description;
    }
    return res;
  }

  return { type: 'string' };
}
