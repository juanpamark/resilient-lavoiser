'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../supabase/server';
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
      // Query membership
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

  // Fallback to default demo business ID if running in preview
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
      .select('id, name, sku, category, price, description, is_active')
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
      sku: p.sku || `SKU-${p.id.substring(0, 6).toUpperCase()}`,
      category: p.category || 'General',
      price: Number(p.price) || 0,
      description: p.description || '',
      isAvailable: Boolean(p.is_active),
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
        sku,
        category: input.category || 'General',
        price: Number(input.price) || 0,
        description: input.description?.trim() || '',
        is_active: true,
      })
      .select('id, name, sku, category, price, description, is_active')
      .single();

    if (error) {
      console.error('[createProductAction] Error inserting product:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/business/catalog');
    revalidatePath('/business/agent');

    return {
      success: true,
      data: {
        id: inserted.id,
        name: inserted.name,
        sku: inserted.sku,
        category: inserted.category,
        price: Number(inserted.price),
        description: inserted.description,
        isAvailable: inserted.is_active,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear el producto';
    return { success: false, error: message };
  }
}

/**
 * Toggle availability of a product (active/inactive).
 */
export async function toggleProductAvailabilityAction(
  productId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  try {
    const { supabase, businessId, isPlatformAdmin } = await resolveAuthContext();

    let query = supabase
      .from('products')
      .update({ is_active: isAvailable })
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
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido al eliminar el producto';
    return { success: false, error: message };
  }
}
