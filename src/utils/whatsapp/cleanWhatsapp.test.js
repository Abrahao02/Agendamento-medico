// ============================================
// 📁 src/utils/whatsapp/cleanWhatsapp.test.js
// Testes para limpeza de números WhatsApp
// ============================================

import { describe, it, expect } from 'vitest';
import { cleanWhatsapp } from './cleanWhatsapp';

describe('cleanWhatsapp', () => {
  it('deve remover formatação de número com parênteses e hífen', () => {
    expect(cleanWhatsapp('(11) 98765-4321')).toBe('11987654321');
  });

  it('deve remover espaços', () => {
    expect(cleanWhatsapp('11 9 8765 4321')).toBe('11987654321');
  });

  it('deve remover apenas caracteres não numéricos', () => {
    expect(cleanWhatsapp('abc11987xyz')).toBe('11987');
  });

  it('deve retornar string vazia para valor vazio', () => {
    expect(cleanWhatsapp('')).toBe('');
  });

  it('deve retornar string vazia para null', () => {
    expect(cleanWhatsapp(null)).toBe('');
  });

  it('deve retornar string vazia para undefined', () => {
    expect(cleanWhatsapp(undefined)).toBe('');
  });

  it('deve converter número para string', () => {
    expect(cleanWhatsapp(11987654321)).toBe('11987654321');
  });

  it('deve remover múltiplos caracteres especiais', () => {
    expect(cleanWhatsapp('+55 (11) 98765-4321')).toBe('5511987654321');
  });

  it('deve manter apenas números válidos', () => {
    expect(cleanWhatsapp('11.98765.4321')).toBe('11987654321');
  });

  it('deve lidar com string apenas com caracteres não numéricos', () => {
    expect(cleanWhatsapp('abc-xyz')).toBe('');
  });
});
