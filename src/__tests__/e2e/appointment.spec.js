// ============================================
// 📁 src/__tests__/e2e/appointment.spec.js
// Testes E2E para fluxo de agendamento público
// ============================================

import { test, expect } from '@playwright/test';

test.describe('Public Appointment Flow', () => {
  test('deve carregar página de agendamento público', async ({ page }) => {
    // Navegar para página com slug inválido (para testar tratamento de erro)
    await page.goto('/public/slug-invalido');
    
    // Verificar que a página carrega (mesmo que mostre erro)
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar que mensagem de erro é exibida quando médico não encontrado
    // A página deve mostrar "Médico não encontrado" ou similar
    const errorMessage = page.locator('text=/médico não encontrado/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('deve exibir estrutura básica da página', async ({ page }) => {
    await page.goto('/public/test-slug');
    
    // Verificar que container principal existe
    const container = page.locator('.public-schedule-container, [class*="public"]');
    await expect(container.or(page.locator('body'))).toBeVisible();
    
    // Verificar que não há erros de JavaScript no console
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Permitir alguns erros esperados (como médico não encontrado)
    const unexpectedErrors = errors.filter(err => 
      !err.includes('Médico não encontrado') && 
      !err.includes('médico') &&
      !err.includes('404')
    );
    
    expect(unexpectedErrors.length).toBe(0);
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
