'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import type { CustomJwtPayload } from '@platform/core';

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  isAvailable: boolean;
}

export interface PublicMenuData {
  business: {
    id: string;
    name: string;
    description: string;
    location?: {
      address?: string;
      city?: string;
      country?: string;
      phone?: string;
    };
    business_hours?: Record<string, unknown>;
  };
  categories: string[];
  products: CatalogProduct[];
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Helper to resolve the authenticated business ID and admin status.
 */
async function resolveAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase.auth as any).getUser();

  let businessId: string | null = null;
  let isPlatformAdmin = false;

  if (user) {
    const { data: sessionData } = await (supabase.auth as any).getSession();
    if (sessionData.session?.access_token) {
      try {
        const payloadBase64 = sessionData.session.access_token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString('utf-8')
          ) as CustomJwtPayload;
          businessId = decoded.business_id || null;
          isPlatformAdmin = !!decoded.is_platform_admin;
        }
      } catch {
        // Fallback
      }
    }

    if (!businessId) {
      const { data: membership } = await supabase
        .from('memberships')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (membership?.business_id) {
        businessId = membership.business_id;
      }
    }
  }

  // Fallback to default demo business ID (Restaurante Santa Cruz)
  if (!businessId) {
    businessId = '00000000-0000-0000-0000-000000000001';
  }

  return { supabase, user, businessId, isPlatformAdmin };
}

/**
 * Fetch all catalog products for the current business from Supabase.
 */
export async function getProductsAction(): Promise<ActionResult<CatalogProduct[]>> {
  try {
    const { supabase, businessId } = await resolveAuthContext();

    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('id, name, category, price, description, is_active, is_available, metadata')
      .eq('business_id', businessId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('[getProductsAction] Supabase error:', error);
      return { success: false, error: error.message };
    }

    const formatted: CatalogProduct[] = (dbProducts || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.metadata?.sku || p.sku || `SKU-${p.id.substring(0, 6).toUpperCase()}`,
      category: p.category || 'General',
      price: Number(p.price) || 0,
      description: p.description || '',
      isAvailable: p.is_available !== undefined ? Boolean(p.is_available) : Boolean(p.is_active),
    }));

    return { success: true, data: formatted };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener el catálogo';
    return { success: false, error: message };
  }
}

/**
 * Create a new product in the catalog for the current business.
 */
export async function createProductAction(input: {
  name: string;
  sku?: string;
  category: string;
  price: number;
  description: string;
}): Promise<ActionResult<CatalogProduct>> {
  try {
    const { supabase, businessId } = await resolveAuthContext();

    if (!input.name || !input.name.trim()) {
      return { success: false, error: 'El nombre del producto es obligatorio.' };
    }

    const sku = input.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    const { data: inserted, error } = await supabase
      .from('products')
      .insert({
        business_id: businessId,
        name: input.name.trim(),
        category: input.category || 'General',
        price: Number(input.price) || 0,
        description: input.description?.trim() || '',
        is_active: true,
        is_available: true,
        metadata: { sku },
      })
      .select('id, name, category, price, description, is_active, is_available, metadata')
      .single();

    if (error) {
      console.error('[createProductAction] Error inserting product:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/business/catalog');
    revalidatePath('/business/agent');
    revalidatePath('/menu/restaurante-santa-cruz');

    return {
      success: true,
      data: {
        id: inserted.id,
        name: inserted.name,
        sku: inserted.metadata?.sku || sku,
        category: inserted.category,
        price: Number(inserted.price),
        description: inserted.description,
        isAvailable: inserted.is_available ?? inserted.is_active ?? true,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear el producto';
    return { success: false, error: message };
  }
}

/**
 * Update an existing product in the catalog.
 */
export async function updateProductAction(
  productId: string,
  input: {
    name: string;
    price: number;
    category: string;
    description: string;
    sku?: string;
    isAvailable?: boolean;
  }
): Promise<ActionResult<CatalogProduct>> {
  try {
    const { supabase, businessId, isPlatformAdmin } = await resolveAuthContext();

    if (!input.name || !input.name.trim()) {
      return { success: false, error: 'El nombre del producto es obligatorio.' };
    }

    const updatePayload: Record<string, any> = {
      name: input.name.trim(),
      category: input.category || 'General',
      price: Number(input.price) || 0,
      description: input.description?.trim() || '',
    };

    if (input.isAvailable !== undefined) {
      updatePayload.is_available = input.isAvailable;
      updatePayload.is_active = input.isAvailable;
    }

    if (input.sku) {
      updatePayload.metadata = { sku: input.sku.trim() };
    }

    let query = supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId);

    if (!isPlatformAdmin && businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data: updated, error } = await query
      .select('id, name, category, price, description, is_active, is_available, metadata')
      .single();

    if (error) {
      console.error('[updateProductAction] Error updating product:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/business/catalog');
    revalidatePath('/business/agent');
    revalidatePath('/menu/restaurante-santa-cruz');

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        sku: updated.metadata?.sku || input.sku || `SKU-${updated.id.substring(0, 6).toUpperCase()}`,
        category: updated.category,
        price: Number(updated.price),
        description: updated.description,
        isAvailable: updated.is_available ?? updated.is_active ?? true,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar el producto';
    return { success: false, error: message };
  }
}

/**
 * Toggle availability of a product (Disponible / Agotado).
 */
export async function toggleProductAvailabilityAction(
  productId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  try {
    const { supabase, businessId, isPlatformAdmin } = await resolveAuthContext();

    let query = supabase
      .from('products')
      .update({ is_available: isAvailable, is_active: isAvailable })
      .eq('id', productId);

    if (!isPlatformAdmin && businessId) {
      query = query.eq('business_id', businessId);
    }

    const { error } = await query;
    if (error) {
      console.error('[toggleProductAvailabilityAction] Error updating:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/business/catalog');
    revalidatePath('/business/agent');
    revalidatePath('/menu/restaurante-santa-cruz');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar disponibilidad';
    return { success: false, error: message };
  }
}

/**
 * Delete a product from the catalog.
 */
export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const { supabase, businessId, isPlatformAdmin } = await resolveAuthContext();

    let query = supabase.from('products').delete().eq('id', productId);
    if (!isPlatformAdmin && businessId) {
      query = query.eq('business_id', businessId);
    }

    const { error } = await query;
    if (error) {
      console.error('[deleteProductAction] Error deleting product:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/business/catalog');
    revalidatePath('/business/agent');
    revalidatePath('/menu/restaurante-santa-cruz');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido al eliminar el producto';
    return { success: false, error: message };
  }
}

/**
 * Public action to retrieve the full digital menu for diners visiting the restaurant's website.
 * No login required.
 */
export async function getPublicMenuAction(slugOrId?: string): Promise<ActionResult<PublicMenuData>> {
  try {
    const admin = createAdminClient();
    const targetBusinessId = '00000000-0000-0000-0000-000000000001';

    // 1. Fetch business info
    const { data: biz, error: bizError } = await admin
      .from('businesses')
      .select('id, name, description, location, business_hours, settings')
      .eq('id', targetBusinessId)
      .maybeSingle();

    if (bizError) {
      console.warn('[getPublicMenuAction] Error fetching business:', bizError);
    }

    const business = {
      id: biz?.id || targetBusinessId,
      name: biz?.name || 'Restaurante Santa Cruz',
      description: biz?.description || 'Especialistas en carnes a la brasa, cortes madurados, gastronomía típica y eventos familiares.',
      location: biz?.location || {
        address: 'Sede Campestre Km 4 Vía Principal',
        city: 'Santa Cruz',
        country: 'Colombia',
        phone: '+57 300 123 4567',
      },
      business_hours: biz?.business_hours || {},
    };

    // 2. Fetch all products (including both available and out-of-stock items)
    const { data: dbProducts, error: prodError } = await admin
      .from('products')
      .select('id, name, category, price, description, is_active, is_available, metadata')
      .eq('business_id', business.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (prodError) {
      console.error('[getPublicMenuAction] Error fetching products:', prodError);
      return { success: false, error: prodError.message };
    }

    const products: CatalogProduct[] = (dbProducts || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.metadata?.sku || p.sku || `SKU-${p.id.substring(0, 6).toUpperCase()}`,
      category: p.category || 'Parrilla & Carnes',
      price: Number(p.price) || 0,
      description: p.description || '',
      isAvailable: p.is_available !== undefined ? Boolean(p.is_available) : Boolean(p.is_active),
    }));

    const categories = Array.from(new Set(products.map((p) => p.category)));

    return {
      success: true,
      data: {
        business,
        categories,
        products,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al cargar el menú público';
    return { success: false, error: message };
  }
}
