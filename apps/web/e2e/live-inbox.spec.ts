import { test, expect } from '@playwright/test';

test.describe('E2E: Live Inbox & Human Handoff (/business/inbox)', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'sb-e2e-role',
        value: 'business_admin',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('renders live inbox with conversation list and initial chat', async ({ page }) => {
    await page.goto('/business/inbox');

    // Header and Realtime connection badge
    await expect(page.locator('h2')).toContainText('Bandeja en Vivo');
    await expect(page.locator('text=Realtime Activo')).toBeVisible();

    // Conversation items
    await expect(page.locator('text=Santiago Gómez').first()).toBeVisible();
    await expect(page.locator('text=Mariana Duarte').first()).toBeVisible();
    await expect(page.locator('text=Carlos Ruiz').first()).toBeVisible();

    // Filter pill buttons
    await expect(page.locator('button:has-text("Todos")')).toBeVisible();
    await expect(page.locator('button:has-text("Espera")')).toBeVisible();
    await expect(page.locator('button:has-text("Humano")')).toBeVisible();
    await expect(page.locator('button:has-text("IA (")')).toBeVisible();
  });

  test('switches conversation and displays message thread', async ({ page }) => {
    await page.goto('/business/inbox');

    // Click on Mariana Duarte in conversation list
    await page.locator('span.font-semibold:has-text("Mariana Duarte")').first().click();

    // Verify chat header updates
    await expect(page.locator('h3:has-text("Mariana Duarte")')).toBeVisible();
    await expect(page.locator('text=+57 301 222 3344').first()).toBeVisible();
    await expect(page.locator('text=⚠️ Espera de Asesor')).toBeVisible();
  });

  test('allows human operator to take control (human_active) and release back to AI bot (active)', async ({
    page,
  }) => {
    await page.goto('/business/inbox');

    // Select active AI conversation
    await page.locator('text=Santiago Gómez').click();
    await expect(page.locator('text=🤖 IA Activa')).toBeVisible();

    // Click "Tomar Control" button
    const takeControlBtn = page.locator('button:has-text("Tomar Control")');
    await expect(takeControlBtn).toBeVisible();
    await takeControlBtn.click();

    // Verify conversation state transitions to human_active
    await expect(page.locator('text=👤 Asesor Humano (Bot Silenciado)')).toBeVisible();
    await expect(page.locator('text=Bot Silenciado: Estás atendiendo manualmente')).toBeVisible();

    // Verify "Devolver a IA" button appears
    const releaseBtn = page.locator('button:has-text("Devolver a IA")').first();
    await expect(releaseBtn).toBeVisible();
    await releaseBtn.click();

    // Verify conversation state returns to active AI
    await expect(page.locator('text=🤖 IA Activa')).toBeVisible();
  });
});
