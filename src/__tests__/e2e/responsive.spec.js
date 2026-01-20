// src/__tests__/e2e/responsive.spec.js - Testes de Responsividade

import { test, expect } from '@playwright/test';

const viewports = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 12' },
  { width: 430, height: 932, name: 'iPhone 14 Pro Max' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1280, height: 720, name: 'Desktop' },
];

viewports.forEach(({ width, height, name }) => {
  test.describe(`${name} (${width}x${height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height });
    });

    test('não deve ter scroll horizontal', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = width;
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });

    test('elementos não devem estourar viewport', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const overflowingElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        return Array.from(elements).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.right > window.innerWidth || rect.left < 0;
        }).length;
      });
      
      expect(overflowingElements).toBe(0);
    });

    test('textos devem ser legíveis (tamanho mínimo 12px)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const smallTexts = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, span, div, a, button, input, label');
        return Array.from(elements).filter(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          // Ignorar elementos ocultos ou sem conteúdo visível
          if (style.display === 'none' || style.visibility === 'hidden' || fontSize === 0) {
            return false;
          }
          return fontSize < 12; // Mínimo recomendado
        }).length;
      });
      
      expect(smallTexts).toBe(0);
    });

    test('botões devem ter área clicável adequada (mínimo 44x44px em mobile)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const smallButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a.btn, .btn');
        return Array.from(buttons).filter(btn => {
          const rect = btn.getBoundingClientRect();
          const style = window.getComputedStyle(btn);
          // Ignorar botões ocultos
          if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
          }
          // Em mobile, área mínima recomendada é 44x44px
          return rect.width < 44 || rect.height < 44;
        }).length;
      });
      
      // Permitir alguns botões pequenos (como ícones), mas não muitos
      expect(smallButtons).toBeLessThan(5);
    });

    test('inputs não devem ser cortados', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const cutInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, textarea, select');
        return Array.from(inputs).filter(input => {
          const rect = input.getBoundingClientRect();
          const style = window.getComputedStyle(input);
          // Ignorar inputs ocultos
          if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
          }
          // Verificar se está dentro da viewport
          return rect.right > window.innerWidth || rect.left < 0 || rect.bottom > window.innerHeight || rect.top < 0;
        }).length;
      });
      
      expect(cutInputs).toBe(0);
    });

    test('imagens não devem ultrapassar containers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const overflowingImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).filter(img => {
          const rect = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          // Ignorar imagens ocultas
          if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
          }
          // Verificar se ultrapassa viewport ou container pai
          const parent = img.parentElement;
          if (parent) {
            const parentRect = parent.getBoundingClientRect();
            return rect.width > parentRect.width + 10; // 10px de tolerância
          }
          return rect.width > window.innerWidth;
        }).length;
      });
      
      expect(overflowingImages).toBe(0);
    });
  });
});
