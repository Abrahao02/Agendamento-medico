// ============================================
// 📁 src/utils/filters/publicScheduleFilters.js
// Filtros específicos para agendamento público baseado em configuração
// ============================================

import { getTodayString } from "./dateFilters";
import { PUBLIC_SCHEDULE_PERIOD } from "../../constants/publicScheduleConfig";

/**
 * Filtra disponibilidade baseado na configuração de período do médico
 * @param {Array} availability - Array de disponibilidade
 * @param {string} periodConfig - Configuração de período (PUBLIC_SCHEDULE_PERIOD)
 * @returns {Array} Disponibilidade filtrada
 * 
 * @example
 * filterByPeriodConfig(availability, PUBLIC_SCHEDULE_PERIOD.CURRENT_WEEK)
 */
export function filterByPeriodConfig(availability, periodConfig = PUBLIC_SCHEDULE_PERIOD.ALL_FUTURE) {
  if (!Array.isArray(availability)) return [];
  if (!periodConfig || periodConfig === PUBLIC_SCHEDULE_PERIOD.ALL_FUTURE) {
    // Se for "all_future" ou não especificado, retorna tudo (já vem filtrado como futuro do validateAvailability)
    return availability;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayStr = getTodayString();

  return availability.filter(day => {
    const dayDate = new Date(day.date + 'T00:00:00');
    
    switch (periodConfig) {
      case PUBLIC_SCHEDULE_PERIOD.CURRENT_WEEK: {
        // Semana atual: de hoje até domingo desta semana
        const sunday = new Date(today);
        const dayOfWeek = today.getDay(); // 0 = domingo, 6 = sábado
        sunday.setDate(today.getDate() + (7 - dayOfWeek)); // Próximo domingo
        sunday.setHours(23, 59, 59, 999);
        return dayDate >= today && dayDate <= sunday;
      }

      case PUBLIC_SCHEDULE_PERIOD.CURRENT_MONTH: {
        // Mês atual: de hoje até o último dia do mês
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        lastDayOfMonth.setHours(23, 59, 59, 999);
        return dayDate >= today && dayDate <= lastDayOfMonth;
      }

      case PUBLIC_SCHEDULE_PERIOD.NEXT_7_DAYS: {
        // Próximos 7 dias (incluindo hoje)
        const next7Days = new Date(today);
        next7Days.setDate(today.getDate() + 7);
        next7Days.setHours(23, 59, 59, 999);
        return dayDate >= today && dayDate <= next7Days;
      }

      case PUBLIC_SCHEDULE_PERIOD.NEXT_14_DAYS: {
        // Próximos 14 dias (incluindo hoje)
        const next14Days = new Date(today);
        next14Days.setDate(today.getDate() + 14);
        next14Days.setHours(23, 59, 59, 999);
        return dayDate >= today && dayDate <= next14Days;
      }

      case PUBLIC_SCHEDULE_PERIOD.NEXT_30_DAYS: {
        // Próximos 30 dias (incluindo hoje)
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);
        next30Days.setHours(23, 59, 59, 999);
        return dayDate >= today && dayDate <= next30Days;
      }

      case PUBLIC_SCHEDULE_PERIOD.ONE_EXTRA_DAY: {
        // Até amanhã (hoje + 1 dia)
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        return dayDate >= today && dayDate <= tomorrow;
      }

      default:
        // Por padrão, retorna tudo (comportamento atual)
        return day.date >= todayStr;
    }
  });
}
