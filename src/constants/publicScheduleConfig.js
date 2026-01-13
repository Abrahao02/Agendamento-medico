// ============================================
// 📁 src/constants/publicScheduleConfig.js
// Constantes para configuração de período de disponibilidade pública
// ============================================

/**
 * Opções de período para exibição de disponibilidade no agendamento público
 */
export const PUBLIC_SCHEDULE_PERIOD = {
  ALL_FUTURE: "all_future",              // Todos os horários futuros (padrão atual)
  CURRENT_WEEK: "current_week",          // Só da semana atual
  CURRENT_MONTH: "current_month",        // Só do mês atual
  NEXT_7_DAYS: "next_7_days",            // Próximos 7 dias
  NEXT_14_DAYS: "next_14_days",          // Próximos 14 dias
  NEXT_30_DAYS: "next_30_days",          // Próximos 30 dias
  ONE_EXTRA_DAY: "one_extra_day",        // Sempre mostrar um dia a mais (até amanhã)
};

/**
 * Configurações das opções de período
 */
export const PERIOD_CONFIG = {
  [PUBLIC_SCHEDULE_PERIOD.ALL_FUTURE]: {
    label: "Todos os horários futuros",
    description: "Exibe todos os horários disponíveis a partir de hoje",
    value: PUBLIC_SCHEDULE_PERIOD.ALL_FUTURE
  },
  [PUBLIC_SCHEDULE_PERIOD.CURRENT_WEEK]: {
    label: "Semana atual",
    description: "Exibe apenas horários da semana atual (até domingo)",
    value: PUBLIC_SCHEDULE_PERIOD.CURRENT_WEEK
  },
  [PUBLIC_SCHEDULE_PERIOD.CURRENT_MONTH]: {
    label: "Mês atual",
    description: "Exibe apenas horários do mês atual",
    value: PUBLIC_SCHEDULE_PERIOD.CURRENT_MONTH
  },
  [PUBLIC_SCHEDULE_PERIOD.NEXT_7_DAYS]: {
    label: "Próximos 7 dias",
    description: "Exibe horários dos próximos 7 dias",
    value: PUBLIC_SCHEDULE_PERIOD.NEXT_7_DAYS
  },
  [PUBLIC_SCHEDULE_PERIOD.NEXT_14_DAYS]: {
    label: "Próximos 14 dias",
    description: "Exibe horários dos próximos 14 dias",
    value: PUBLIC_SCHEDULE_PERIOD.NEXT_14_DAYS
  },
  [PUBLIC_SCHEDULE_PERIOD.NEXT_30_DAYS]: {
    label: "Próximos 30 dias",
    description: "Exibe horários dos próximos 30 dias",
    value: PUBLIC_SCHEDULE_PERIOD.NEXT_30_DAYS
  },
  [PUBLIC_SCHEDULE_PERIOD.ONE_EXTRA_DAY]: {
    label: "Sempre um dia a mais (até amanhã)",
    description: "Exibe apenas horários de hoje e amanhã",
    value: PUBLIC_SCHEDULE_PERIOD.ONE_EXTRA_DAY
  },
};

/**
 * Retorna todas as opções de período formatadas para selects
 * @returns {Array<{value: string, label: string, description: string}>}
 */
export function getPeriodOptions() {
  return Object.values(PERIOD_CONFIG);
}

/**
 * Retorna a configuração de um período específico
 * @param {string} period - Valor do período
 * @returns {Object} Configuração do período
 */
export function getPeriodConfig(period) {
  return PERIOD_CONFIG[period] || PERIOD_CONFIG[PUBLIC_SCHEDULE_PERIOD.ALL_FUTURE];
}
