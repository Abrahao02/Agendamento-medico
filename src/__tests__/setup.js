// ============================================
// 📁 src/__tests__/setup.js
// Configuração global para testes
// ============================================

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Limpar após cada teste
afterEach(() => {
  cleanup();
});
