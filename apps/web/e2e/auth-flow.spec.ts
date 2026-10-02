import { test, expect } from '@playwright/test';

test.describe('E2E: Authentication Flow (/login)', () => {
  test('renders login page with credentials form', async ({ page }) => {
    await page.goto('/login');

    // Verify header and description
    await expect(page.locator('h1')).toContainText('Platform Access');
    await expect(page.locator('text=Inicia sesión para gestionar tus agentes')).toBeVisible();

    // Verify form elements
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Iniciar Sesión');
  });

  test('displays error alert when URL contains error parameter', async ({ page }) => {
    await page.goto('/login?error=missing_credentials');

    const errorAlert = page.locator('text=Por favor ingresa tu correo y contraseña.');
    await expect(errorAlert).toBeVisible();
  });

  test('validates required fields on client submission attempt', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('required', '');

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });
});
