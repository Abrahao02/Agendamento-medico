// ============================================
// 📁 src/utils/filters/availabilityFilters.js
// ============================================

// ✅ IMPORTAR getTodayString
import { getTodayString } from "./dateFilters";

/**
 * Remove slots já agendados da disponibilidade
 * @param {Array} availability - Lista de disponibilidades
 * @param {Array} appointments - Lista de appointments
 * @returns {Array} Availability com slots livres
 */
export const filterAvailableSlots = (availability, appointments) => {
  if (!Array.isArray(availability) || !Array.isArray(appointments)) {
    return [];
  }

  return availability
    .map(day => {
      // Busca horários já agendados nessa data
      const bookedSlots = appointments
        .filter(a => a.date === day.date)
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
 * @param {Array} availability - Lista de disponibilidades
 * @param {boolean} futureOnly - Apenas datas futuras
 * @returns {Array} Availability válida e ordenada
 */
export const validateAvailability = (availability, futureOnly = true) => {
  if (!Array.isArray(availability)) return [];

  const today = getTodayString(); // ✅ Agora está importada

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
 * @param {Array} availability - Lista de disponibilidades
 * @returns {number} Total de slots
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
 * @param {Array} availability - Lista de disponibilidades
 * @param {Array} appointments - Lista de appointments
 * @param {string} date - Data a buscar (YYYY-MM-DD)
 * @returns {Array} Lista de horários disponíveis
 */
export const getAvailableSlotsForDate = (availability, appointments, date) => {
  if (!date) return [];

  const dayAvailability = availability.find(a => a.date === date);
  if (!dayAvailability || !Array.isArray(dayAvailability.slots)) {
    return [];
  }

  const bookedSlots = appointments
    .filter(a => a.date === date)
    .map(a => a.time);

  return dayAvailability.slots
    .filter(slot => !bookedSlots.includes(slot))
    .sort();
};