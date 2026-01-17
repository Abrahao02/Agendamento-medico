// ============================================
// 📁 src/__tests__/e2e/login.spec.js
// Testes E2E para fluxo de login
// ============================================

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página de login antes de cada teste
    await page.goto('/login');
  });

  test('deve renderizar página de login', async ({ page }) => {
    // Verificar elementos principais da página
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve mostrar erro para email inválido', async ({ page }) => {
    // Preencher formulário com dados inválidos
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    // Verificar mensagem de erro
    await expect(page.locator('.error')).toBeVisible();
  });

  test('deve mostrar erro para campos vazios', async ({ page }) => {
    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Verificar validação HTML5
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('deve alternar visibilidade da senha', async ({ page }) => {
    // Preencher senha
    await page.fill('input[name="password"]', 'senha123');

    // Verificar que senha está oculta inicialmente
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');

    // Clicar no botão de mostrar senha
    const toggleButton = page.locator('button[aria-label*="senha"]');
    await toggleButton.click();

    // Verificar que senha está visível
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text');
  });

  test('deve navegar para página de registro', async ({ page }) => {
    // Clicar no botão de registro
    const registerButton = page.locator('button:has-text("Registrar-se")');
    await registerButton.click();

    // Verificar redirecionamento
    await expect(page).toHaveURL(/.*register/);
  });

  test('deve mostrar link de esqueci minha senha', async ({ page }) => {
    // Verificar presença do link
    const forgotLink = page.locator('text=Esqueci minha senha');
    await expect(forgotLink).toBeVisible();
  });
});
