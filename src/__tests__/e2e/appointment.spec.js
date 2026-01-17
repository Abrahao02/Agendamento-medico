// ============================================
// 📁 src/__tests__/e2e/appointment.spec.js
// Testes E2E para fluxo de agendamento público
// ============================================

import { test, expect } from '@playwright/test';

test.describe('Public Appointment Flow', () => {
  // Nota: Estes testes requerem um médico válido no sistema
  // Em produção, você deve criar fixtures ou usar dados de teste

  test.skip('deve carregar página de agendamento público', async ({ page }) => {
    // Este teste será implementado quando houver dados de teste configurados
    // const slug = 'medico-teste';
    // await page.goto(`/public/${slug}`);
    // await expect(page.locator('h1')).toBeVisible();
  });

  test.skip('deve mostrar horários disponíveis', async ({ page }) => {
    // Verificar que horários são exibidos
    // await expect(page.locator('.available-slot')).toBeVisible();
  });

  test.skip('deve validar formulário de agendamento', async ({ page }) => {
    // Selecionar horário
    // Preencher formulário parcialmente
    // Verificar validações
  });
});
