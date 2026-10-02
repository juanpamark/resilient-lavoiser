import { test, expect } from '@playwright/test';

test.describe('E2E: AI Agent Configuration (/business/agent)', () => {
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

  test('renders AI agent configuration panel with modular prompt builder', async ({ page }) => {
    await page.goto('/business/agent');

    // Header and model badge
    await expect(page.locator('h2')).toContainText('Calibración del Agente de IA');
    await expect(page.locator('text=Gemini 2.5 Flash')).toBeVisible();

    // Section 1: Identity & Instructions
    await expect(page.locator('text=1. Identidad e Instrucciones Maestras')).toBeVisible();
    const systemPromptInput = page.locator('textarea').first();
    await expect(systemPromptInput).toBeVisible();

    // Section 2: Authorized Tools
    await expect(page.locator('text=2. Herramientas de Negocio Autorizadas')).toBeVisible();
    await expect(page.locator('text=search_products')).toBeVisible();
    await expect(page.locator('text=calculate_order')).toBeVisible();

    // Section 3: FAQs
    await expect(page.locator('text=3. Preguntas Frecuentes del Negocio (FAQs)')).toBeVisible();
  });

  test('edits agent settings and saves configuration successfully', async ({ page }) => {
    await page.goto('/business/agent');

    // Change system prompt content
    const systemPromptInput = page.locator('textarea').first();
    await systemPromptInput.fill(
      'Eres el asistente virtual oficial de "La Casona Gourmet" por WhatsApp. Responde con rapidez, amabilidad y precisión en todos los pedidos.'
    );

    // Click Save Changes button
    const saveBtn = page.locator('button:has-text("Guardar Cambios")');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify success banner notification appears
    const successBanner = page.locator('text=¡Configuración guardada exitosamente!');
    await expect(successBanner).toBeVisible();
  });
});
