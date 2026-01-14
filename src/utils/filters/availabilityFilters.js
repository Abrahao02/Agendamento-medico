// ============================================
// 📁 src/utils/filters/availabilityFilters.js
// ============================================

import { getTodayString } from "./dateFilters";
import { STATUS_GROUPS } from "../../constants/appointmentStatus";

/**
 * Helper to extract time from slot (handles both string and object formats)
 */
function getSlotTime(slot) {
  if (typeof slot === "string") return slot;
  if (typeof slot === "object" && slot?.time) return slot.time;
  return null;
}

/**
 * Remove slots já agendados da disponibilidade
 */
export const filterAvailableSlots = (availability, appointments) => {
  if (!Array.isArray(availability) || !Array.isArray(appointments)) {
    return [];
  }

  return availability
    .map(day => {
      const bookedSlots = appointments
        .filter(a => 
          a.date === day.date && 
          STATUS_GROUPS.ACTIVE.includes(a.status)
        )
        .map(a => a.time);

      // Retorna apenas slots livres (handles both string and object formats)
      return {
        ...day,
        slots: (day.slots || []).filter(slot => {
          const slotTime = getSlotTime(slot);
          return slotTime && !bookedSlots.includes(slotTime);
        })
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