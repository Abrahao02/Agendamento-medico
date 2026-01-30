// ============================================
// 📁 src/__tests__/e2e/login.spec.js
// Testes E2E para fluxo de login
// ============================================

import { test, expect } from '@playwright/test';
import { mockFirebase, mockFirebaseAuthError } from './mocks/firebase.js';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar mocks do Firebase antes de navegar
    await mockFirebase(page);
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

  test('deve mostrar erro para credenciais inválidas', async ({ page }) => {
    // Sobrescrever mock para retornar erro de autenticação
    await mockFirebaseAuthError(page);

    // Preencher formulário
    await page.fill('input[name="email"]', 'teste@email.com');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    // Verificar mensagem de erro (aguardar resposta do Firebase mockado)
    await expect(page.locator('.error')).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar campos de email e senha', async ({ page }) => {
    // Verificar que campos existem e são preenchíveis
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verificar tipo correto dos inputs
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('deve alternar visibilidade da senha', async ({ page }) => {
    // Preencher senha
    await page.fill('input[name="password"]', 'senha123');

    // Verificar que senha está oculta inicialmente
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');

    // Clicar no botão de mostrar senha (usando aria-label em português)
    const toggleButton = page.locator('button[aria-label="Mostrar senha"]');
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
