// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/__tests__/e2e',
  
  /* Máximo de tempo que um teste pode levar */
  timeout: 30 * 1000,
  
  expect: {
    /* Máximo de tempo para expect() aguardar */
    timeout: 5000
  },
  
  /* Executar testes em paralelo */
  fullyParallel: true,
  
  /* Falhar o build no CI se você deixar test.only no código */
  forbidOnly: !!process.env.CI,
  
  /* Retry no CI apenas */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers no CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter para usar */
  reporter: 'html',
  
  /* Opções compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em ações como await page.goto('/') */
    baseURL: 'http://localhost:5173',
    
    /* Coletar trace quando retentar o teste falho */
    trace: 'on-first-retry',
    
    /* Screenshot apenas quando falhar */
    screenshot: 'only-on-failure',
  },

  /* Configurar projetos para múltiplos browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Servidor de desenvolvimento local */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
