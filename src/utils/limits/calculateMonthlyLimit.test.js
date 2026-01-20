// ============================================
// 📁 src/utils/limits/calculateMonthlyLimit.test.js
// Testes para cálculo de limites mensais
// ============================================

import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyAppointmentsCount,
  checkLimitReached,
  FREE_PLAN_MONTHLY_LIMIT
} from './calculateMonthlyLimit';
import { APPOINTMENT_STATUS } from '../../constants/appointmentStatus';
import { PLAN_TYPES } from '../../constants/plans';

describe('calculateMonthlyAppointmentsCount', () => {
  it('deve retornar 0 quando não há agendamentos', () => {
    const appointments = [];
    expect(calculateMonthlyAppointmentsCount(appointments)).toBe(0);
  });

  it('deve contar apenas agendamentos confirmados do mês atual', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const appointments = [
      {
        id: '1',
        date: `${year}-${month}-15`,
        status: APPOINTMENT_STATUS.CONFIRMED
      },
      {
        id: '2',
        date: `${year}-${month}-20`,
        status: APPOINTMENT_STATUS.CONFIRMED
      },
      {
        id: '3',
        date: `${year}-${month}-25`,
        status: APPOINTMENT_STATUS.PENDING // Não deve contar
      }
    ];

    expect(calculateMonthlyAppointmentsCount(appointments)).toBe(2);
  });

  it('não deve contar agendamentos de meses anteriores', () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-15`;
    
    const appointments = [
      {
        id: '1',
        date: lastMonthStr,
        status: APPOINTMENT_STATUS.CONFIRMED
      }
    ];

    expect(calculateMonthlyAppointmentsCount(appointments)).toBe(0);
  });

  it('não deve contar agendamentos cancelados', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const appointments = [
      {
        id: '1',
        date: `${year}-${month}-15`,
        status: APPOINTMENT_STATUS.CONFIRMED
      },
      {
        id: '2',
        date: `${year}-${month}-20`,
        status: APPOINTMENT_STATUS.CANCELLED
      }
    ];

    expect(calculateMonthlyAppointmentsCount(appointments)).toBe(1);
  });

  it('deve contar agendamentos no primeiro dia do mês', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const appointments = [
      {
        id: '1',
        date: `${year}-${month}-01`,
        status: APPOINTMENT_STATUS.CONFIRMED
      }
    ];

    expect(calculateMonthlyAppointmentsCount(appointments)).toBe(1);
  });

  it('deve contar agendamentos no último dia do mês', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const appointments = [
      {
        id: '1',
        date: `${year}-${month}-31`,
        status: APPOINTMENT_STATUS.CONFIRMED
      }
    ];

    expect(calculateMonthlyAppointmentsCount(appointments)).toBe(1);
  });
});

describe('checkLimitReached', () => {
  it('deve retornar false para plano PRO independente da contagem', () => {
    expect(checkLimitReached(PLAN_TYPES.PRO, 0)).toBe(false);
    expect(checkLimitReached(PLAN_TYPES.PRO, 100)).toBe(false);
    expect(checkLimitReached(PLAN_TYPES.PRO, 1000)).toBe(false);
  });

  it('deve retornar false para plano FREE quando abaixo do limite', () => {
    const count = FREE_PLAN_MONTHLY_LIMIT - 1;
    expect(checkLimitReached(PLAN_TYPES.FREE, count)).toBe(false);
  });

  it('deve retornar true para plano FREE quando no limite', () => {
    const count = FREE_PLAN_MONTHLY_LIMIT;
    expect(checkLimitReached(PLAN_TYPES.FREE, count)).toBe(true);
  });

  it('deve retornar true para plano FREE quando acima do limite', () => {
    const count = FREE_PLAN_MONTHLY_LIMIT + 1;
    expect(checkLimitReached(PLAN_TYPES.FREE, count)).toBe(true);
  });

  it('deve usar limite customizado quando fornecido', () => {
    const customLimit = 5;
    expect(checkLimitReached(PLAN_TYPES.FREE, 4, customLimit)).toBe(false);
    expect(checkLimitReached(PLAN_TYPES.FREE, 5, customLimit)).toBe(true);
    expect(checkLimitReached(PLAN_TYPES.FREE, 6, customLimit)).toBe(true);
  });

  it('deve retornar false para plano FREE com contagem zero', () => {
    expect(checkLimitReached(PLAN_TYPES.FREE, 0)).toBe(false);
  });
});
