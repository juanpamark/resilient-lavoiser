import { describe, it, expect } from 'vitest';
import { ToolRegistry } from '../registry/tool-registry.js';
import { registerDefaultTools } from '../registry/default-tools.js';

describe('ToolRegistry', () => {
  it('should register and retrieve all default MVP tools', () => {
    const registry = new ToolRegistry();
    registerDefaultTools(registry);

    expect(registry.has('get_business_information')).toBe(true);
    expect(registry.has('search_products')).toBe(true);
    expect(registry.has('get_product_details')).toBe(true);
    expect(registry.has('calculate_order')).toBe(true);
    expect(registry.has('create_order')).toBe(true);
    expect(registry.has('transfer_to_human')).toBe(true);

    const tools = registry.list();
    expect(tools.length).toBe(6);
  });

  it('should export valid JSON Schema declarations for enabled tools', () => {
    const registry = new ToolRegistry();
    registerDefaultTools(registry);

    const declarations = registry.exportDeclarations(['search_products', 'calculate_order']);
    expect(declarations).toHaveLength(2);

    const searchDecl = declarations.find(d => d.name === 'search_products');
    expect(searchDecl).toBeDefined();
    expect(searchDecl?.description).toContain('Busca productos');
    expect(searchDecl?.parameters.type).toBe('object');
    expect(searchDecl?.parameters.properties).toHaveProperty('query');

    const calcDecl = declarations.find(d => d.name === 'calculate_order');
    expect(calcDecl).toBeDefined();
    expect(calcDecl?.parameters.properties).toHaveProperty('items');
  });
});
