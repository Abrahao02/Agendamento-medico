// ============================================
// 📁 src/utils/validators/appointmentValidations.test.js
// Testes para validações de agendamento
// ============================================

import { describe, it, expect } from 'vitest';
import {
  validatePatientName,
  validateWhatsapp,
  validateSelectedSlot
} from './appointmentValidations';

describe('validatePatientName', () => {
  it('deve aceitar nome válido', () => {
    expect(validatePatientName('João Silva')).toBe('João Silva');
  });

  it('deve remover espaços extras', () => {
    expect(validatePatientName('  João  Silva  ')).toBe('João Silva');
  });

  it('deve lançar erro para nome vazio', () => {
    expect(() => validatePatientName('')).toThrow('Preencha seu nome completo.');
  });

  it('deve lançar erro para nome apenas com espaços', () => {
    expect(() => validatePatientName('   ')).toThrow('Preencha seu nome completo.');
  });

  it('deve lançar erro para nome null', () => {
    expect(() => validatePatientName(null)).toThrow('Preencha seu nome completo.');
  });

  it('deve lançar erro para nome undefined', () => {
    expect(() => validatePatientName(undefined)).toThrow('Preencha seu nome completo.');
  });

  it('deve aceitar nome com acentos e caracteres especiais', () => {
    expect(validatePatientName('José da Silva')).toBe('José da Silva');
    expect(validatePatientName('Maria José')).toBe('Maria José');
  });
});

describe('validateWhatsapp', () => {
  it('deve aceitar número válido com 11 dígitos', () => {
    expect(validateWhatsapp('11987654321')).toBe('11987654321');
  });

  it('deve aceitar número com formatação e remover formatação', () => {
    expect(validateWhatsapp('(11) 98765-4321')).toBe('11987654321');
  });

  it('deve aceitar número com espaços e remover espaços', () => {
    expect(validateWhatsapp('11 9 8765 4321')).toBe('11987654321');
  });

  it('deve aceitar número com hífen e remover hífen', () => {
    expect(validateWhatsapp('11-98765-4321')).toBe('11987654321');
  });

  it('deve lançar erro para número com menos de 11 dígitos', () => {
    expect(() => validateWhatsapp('123')).toThrow('Informe um número de WhatsApp válido com 11 dígitos.');
  });

  it('deve lançar erro para número com mais de 11 dígitos', () => {
    expect(() => validateWhatsapp('119876543210')).toThrow('Informe um número de WhatsApp válido com 11 dígitos.');
  });

  it('deve lançar erro para número apenas com letras', () => {
    expect(() => validateWhatsapp('abc')).toThrow('Informe um número de WhatsApp válido com 11 dígitos.');
  });

  it('deve extrair apenas números de string mista', () => {
    expect(validateWhatsapp('abc11987654321xyz')).toBe('11987654321');
  });

  it('deve lançar erro se extrair menos de 11 dígitos de string mista', () => {
    expect(() => validateWhatsapp('abc123xyz')).toThrow('Informe um número de WhatsApp válido com 11 dígitos.');
  });
});

describe('validateSelectedSlot', () => {
  it('deve aceitar slot válido', () => {
    expect(() => validateSelectedSlot('10:00')).not.toThrow();
    expect(() => validateSelectedSlot({ time: '10:00' })).not.toThrow();
  });

  it('deve lançar erro para slot null', () => {
    expect(() => validateSelectedSlot(null)).toThrow('Selecione um horário.');
  });

  it('deve lançar erro para slot undefined', () => {
    expect(() => validateSelectedSlot(undefined)).toThrow('Selecione um horário.');
  });

  it('deve lançar erro para slot vazio', () => {
    expect(() => validateSelectedSlot('')).toThrow('Selecione um horário.');
  });
});
