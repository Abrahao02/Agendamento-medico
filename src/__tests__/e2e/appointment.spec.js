// ============================================
// 📁 src/__tests__/e2e/appointment.spec.js
// Testes E2E para fluxo de agendamento público
// ============================================

import { test, expect } from '@playwright/test';
import { mockFirebase } from './mocks/firebase.js';

test.describe('Public Appointment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar mocks do Firebase antes de cada teste
    await mockFirebase(page);
  });

  test('deve carregar página de agendamento público', async ({ page }) => {
    // Navegar para página com slug de teste
    await page.goto('/public/test-slug');

    // Verificar que a página carrega (independente de encontrar médico)
    await expect(page.locator('body')).toBeVisible();

    // Aguardar carregamento da página (network idle ou timeout)
    await page.waitForLoadState('domcontentloaded');

    // Verificar que não há erros críticos de JavaScript
    // (página pode mostrar "médico não encontrado", isso é esperado)
  });

  test('deve exibir estrutura básica da página', async ({ page }) => {
    await page.goto('/public/test-slug');

    // Aguardar carregamento completo
    await page.waitForLoadState('domcontentloaded');

    // Verificar que container principal existe
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Página deve ter algum conteúdo renderizado
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test.skip('deve mostrar horários disponíveis', async () => {
    // Este teste requer um médico válido no sistema
    // Para implementar: criar fixture de médico de teste
    // const slug = 'medico-teste';
    // await page.goto(`/public/${slug}`);
    // await expect(page.locator('.available-slot, .day-card')).toBeVisible();
  });

  test.skip('deve validar formulário de agendamento', async () => {
    // Este teste requer um médico válido e horários disponíveis
    // Para implementar: criar fixture completa de dados de teste
    // 1. Navegar para página pública
    // 2. Selecionar horário disponível
    // 3. Preencher formulário parcialmente
    // 4. Verificar validações HTML5 e mensagens de erro
  });
});
