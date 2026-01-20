// ============================================
// Slot Filtering Utilities
// ============================================
import { normalizeSlot } from "../availability/normalizeSlot";
import { logError } from "../logger/logger";

/**
 * Filter slots by location ID
 * @param {Array<string|object>} slots - Array of slots
 * @param {string} locationId - Location ID to filter by
 * @param {object} doctorConfig - Doctor configuration
 * @returns {Array<object>} Filtered slots
 */
export function filterSlotsByLocation(slots, locationId, doctorConfig = null) {
  if (!locationId || !Array.isArray(slots)) {
    return slots;
  }

  return slots.filter(slot => {
    try {
      const normalized = normalizeSlot(slot, doctorConfig);
      return normalized.allowedLocationIds.includes(locationId);
    } catch (error) {
      logError("Erro ao filtrar slot por localização:", error);
      return false;
    }
  });
}

/**
 * Filter slots by appointment type
 * @param {Array<string|object>} slots - Array of slots
 * @param {string} appointmentType - Appointment type ("online" | "presencial")
 * @param {object} doctorConfig - Doctor configuration
 * @returns {Array<object>} Filtered slots
 */
export function filterSlotsByAppointmentType(slots, appointmentType, doctorConfig = null) {
  if (!appointmentType || !Array.isArray(slots)) {
    return slots;
  }

  return slots.filter(slot => {
    try {
      const normalized = normalizeSlot(slot, doctorConfig);
      return normalized.appointmentType === appointmentType;
    } catch (error) {
      logError("Erro ao filtrar slot por tipo:", error);
      return false;
    }
  });
}

/**
 * Extract unique location IDs from slots
 * @param {Array<string|object>} slots - Array of slots
 * @param {object} doctorConfig - Doctor configuration
 * @returns {Array<string>} Unique location IDs
 */
export function getUniqueLocationsFromSlots(slots, doctorConfig = null) {
  if (!Array.isArray(slots)) {
    return [];
  }

  const locationIds = new Set();

  slots.forEach(slot => {
    try {
      const normalized = normalizeSlot(slot, doctorConfig);
      normalized.allowedLocationIds.forEach(id => locationIds.add(id));
    } catch (error) {
      // Skip invalid slots
    }
  });

  return Array.from(locationIds);
}

/**
 * Filter slots that are available (not booked)
 * Combines location and appointment type filtering
 * @param {Array<string|object>} slots - Array of slots
 * @param {object} filters - Filter object
 * @param {object} doctorConfig - Doctor configuration
 * @returns {Array<object>} Filtered slots
 */
export function filterSlots(slots, filters = {}, doctorConfig = null) {
  let filtered = Array.isArray(slots) ? [...slots] : [];

  if (filters.locationId) {
    filtered = filterSlotsByLocation(filtered, filters.locationId, doctorConfig);
  }

  if (filters.appointmentType) {
    filtered = filterSlotsByAppointmentType(filtered, filters.appointmentType, doctorConfig);
  }

  return filtered;
}
