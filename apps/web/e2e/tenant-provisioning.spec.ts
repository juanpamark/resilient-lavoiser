import { test, expect } from '@playwright/test';

test.describe('E2E: Tenant Provisioning (/platform/businesses)', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'sb-e2e-role',
        value: 'platform_admin',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('renders platform tenant management table and provisioning controls', async ({ page }) => {
    await page.goto('/platform/businesses');

    // Title and subheader
    await expect(page.locator('h2')).toContainText('Gestión de Inquilinos');
    await expect(page.locator('text=Aprovisiona nuevos clientes')).toBeVisible();

    // Provisioning CTA button
    const provisionBtn = page.locator('button:has-text("Aprovisionar Nuevo Inquilino")');
    await expect(provisionBtn).toBeVisible();

    // Search bar
    const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
    await expect(searchInput).toBeVisible();

    // Table columns and pilot tenant
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Restaurante Gourmet La Casona')).toBeVisible();
    await expect(page.locator('text=Meta Directa (client_direct_meta)').first()).toBeVisible();
  });

  test('filters businesses when typing in search input', async ({ page }) => {
    await page.goto('/platform/businesses');

    const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
    await searchInput.fill('La Casona');
    await expect(page.locator('text=Restaurante Gourmet La Casona')).toBeVisible();
  });
});
