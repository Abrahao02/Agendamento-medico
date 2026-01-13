// ============================================
// 📁 src/utils/filters/availabilityFilters.js
// ✅ ATUALIZADO: Considera apenas appointments ATIVOS
// ============================================

import { getTodayString } from "./dateFilters";
import { STATUS_GROUPS } from "../../constants/appointmentStatus";

/**
 * Remove slots já agendados da disponibilidade
 * ✅ ATUALIZADO: Considera apenas appointments ATIVOS como ocupados
 */
export const filterAvailableSlots = (availability, appointments) => {
  if (!Array.isArray(availability) || !Array.isArray(appointments)) {
    return [];
  }

  return availability
    .map(day => {
      // ✅ Busca apenas horários ATIVOS agendados nessa data
      const bookedSlots = appointments
        .filter(a => 
          a.date === day.date && 
          STATUS_GROUPS.ACTIVE.includes(a.status) // ✅ MUDANÇA PRINCIPAL
        )
        .map(a => a.time);

      // Retorna apenas slots livres
      return {
        ...day,
        slots: (day.slots || []).filter(slot => !bookedSlots.includes(slot))
      };
    })
    .filter(day => day.slots.length > 0); // Remove dias sem slots
};

/**
 * Valida e filtra availability com critérios de qualidade
 */
export const validateAvailability = (availability, futureOnly = true) => {
  if (!Array.isArray(availability)) return [];

  const today = getTodayString();

  return availability
    .filter(day => 
      day.date &&
      typeof day.date === "string" &&
      Array.isArray(day.slots) &&
      day.slots.length > 0 &&
      (!futureOnly || day.date >= today)
    )
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Conta total de slots disponíveis
 */
export const countAvailableSlots = (availability) => {
  if (!Array.isArray(availability)) return 0;
  
  return availability.reduce(
    (sum, day) => sum + (day.slots?.length || 0), 
    0
  );
};

/**
 * Obtém slots disponíveis para uma data específica
 * ✅ ATUALIZADO: Considera apenas appointments ATIVOS
 */
export const getAvailableSlotsForDate = (availability, appointments, date) => {
  if (!date) return [];

  const dayAvailability = availability.find(a => a.date === date);
  if (!dayAvailability || !Array.isArray(dayAvailability.slots)) {
    return [];
  }

  // ✅ Busca apenas appointments ATIVOS
  const bookedSlots = appointments
    .filter(a => 
      a.date === date && 
      STATUS_GROUPS.ACTIVE.includes(a.status)
    )
    .map(a => a.time);

  return dayAvailability.slots
    .filter(slot => !bookedSlots.includes(slot))
    .sort();
};