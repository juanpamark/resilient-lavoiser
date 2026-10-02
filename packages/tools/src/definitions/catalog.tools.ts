import { z } from 'zod';
import type { ToolDefinition } from '../types/tool.interface.js';

// --- Tool 1: search_products ---
export const SearchProductsSchema = z.object({
  query: z.string().optional().describe('Término de búsqueda o palabra clave (ej: "hamburguesa", "gaseosa")'),
  category: z.string().optional().describe('Filtrar por categoría (ej: "Hamburguesas", "Bebidas", "Acompañamientos")'),
  only_available: z.boolean().default(true).describe('Filtrar únicamente productos disponibles para la venta'),
});

export type SearchProductsArgs = z.infer<typeof SearchProductsSchema>;

export const searchProductsTool: ToolDefinition<SearchProductsArgs> = {
  name: 'search_products',
  description: 'Busca productos en el catálogo del negocio por nombre, palabra clave o categoría. Retorna nombres, precios y disponibilidad.',
  schema: SearchProductsSchema,
  category: 'catalog',
  async execute(args, context) {
    // In production, queries the database table products using context.businessId
    return {
      searched_for: {
        query: args.query || null,
        category: args.category || null,
        only_available: args.only_available,
      },
      tenant_scope: context.businessId,
      products: [
        {
          id: 'prod-001',
          name: 'Hamburguesa Clásica Artesanal',
          price: 24900,
          category: 'Hamburguesas',
          is_available: true,
          description: 'Carne angus 150g, queso cheddar madurado, lechuga, tomate y salsa especial en pan brioche.',
        },
        {
          id: 'prod-002',
          name: 'Hamburguesa Doble Trufada',
          price: 35900,
          category: 'Hamburguesas',
          is_available: true,
          description: 'Doble carne angus 300g, doble queso gouda, tocineta ahumada y mayonesa de trufa negra.',
        },
        {
          id: 'prod-003',
          name: 'Papas Rústicas con Romero',
          price: 9900,
          category: 'Acompañamientos',
          is_available: true,
          description: 'Papas cortadas a mano con sal marina, romero fresco y alioli de ajo asado.',
        },
      ],
    };
  },
};

// --- Tool 2: get_product_details ---
export const GetProductDetailsSchema = z.object({
  product_id: z.string().optional().describe('ID único del producto si se conoce'),
  product_name: z.string().optional().describe('Nombre del producto a consultar'),
});

export type GetProductDetailsArgs = z.infer<typeof GetProductDetailsSchema>;

export const getProductDetailsTool: ToolDefinition<GetProductDetailsArgs> = {
  name: 'get_product_details',
  description: 'Obtiene la ficha técnica completa de un producto específico, incluyendo precio exacto, ingredientes y opciones.',
  schema: GetProductDetailsSchema,
  category: 'catalog',
  async execute(args, context) {
    return {
      product: {
        id: args.product_id || 'prod-001',
        name: args.product_name || 'Hamburguesa Clásica Artesanal',
        price: 24900,
        currency: 'COP',
        is_available: true,
        business_id: context.businessId,
        customizations_available: ['Sin cebolla', 'Término de la carne (medio / tres cuartos / bien asado)', 'Salsa adicional'],
      },
    };
  },
};
