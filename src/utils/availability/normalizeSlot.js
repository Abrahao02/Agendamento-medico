// ============================================
// Slot Normalization Utilities
// Handles backward compatibility between legacy string slots and new object format
// ============================================
import { logError } from "../logger/logger";

/**
 * Check if a slot is in legacy format (string)
 * @param {string|object} slot - Slot in either format
 * @returns {boolean}
 */
export function isLegacySlot(slot) {
  return typeof slot === "string";
}

/**
 * Normalize a single slot to object format
 * @param {string|object} slot - Slot in legacy or new format
 * @param {object} doctorConfig - Doctor configuration (optional, for defaults)
 * @returns {object} Normalized slot object
 */
export function normalizeSlot(slot, doctorConfig = null) {
  // If already an object with time property, return as is (might need validation)
  if (typeof slot === "object" && slot !== null && slot.time) {
    return {
      time: slot.time,
      appointmentType: slot.appointmentType || "presencial",
      allowedLocationIds: Array.isArray(slot.allowedLocationIds) 
        ? slot.allowedLocationIds 
        : [],
      price: slot.price || undefined,
    };
  }

  // Legacy format: simple string
  if (typeof slot === "string") {
    // Try to infer appointment type from doctor config
    const appointmentType = doctorConfig?.appointmentTypeConfig?.mode === "fixed"
      ? doctorConfig.appointmentTypeConfig.fixedType
      : "presencial";

    // For legacy slots, if doctor has only one location, auto-assign it
    let allowedLocationIds = [];
    if (appointmentType === "presencial" && doctorConfig?.appointmentTypeConfig?.locations) {
      const locations = doctorConfig.appointmentTypeConfig.locations;
      if (locations.length === 1) {
        allowedLocationIds = [locations[0].name];
      } else if (locations.length > 1) {
        // For multiple locations, include all (legacy behavior: all locations allowed)
        allowedLocationIds = locations.map(loc => loc.name);
      }
    }

    return {
      time: slot,
      appointmentType,
      allowedLocationIds,
    };
  }

  // Invalid format, return minimal object
  throw new Error(`Formato de slot inválido: ${typeof slot}`);
}

/**
 * Normalize entire slots array
 * @param {Array<string|object>} slots - Array of slots
 * @param {object} doctorConfig - Doctor configuration
 * @returns {Array<object>} Normalized slots array
 */
export function normalizeSlotsArray(slots, doctorConfig = null) {
  if (!Array.isArray(slots)) {
    return [];
  }

  return slots.map(slot => {
    try {
      return normalizeSlot(slot, doctorConfig);
    } catch (error) {
      logError("Erro ao normalizar slot:", error, slot);
      // Return minimal valid slot for error recovery
      return typeof slot === "string" 
        ? { time: slot, appointmentType: "presencial", allowedLocationIds: [] }
        : { time: "00:00", appointmentType: "presencial", allowedLocationIds: [] };
    }
  });
}

/**
 * Get display information for a slot
 * @param {string|object} slot - Slot in any format
 * @param {object} doctorConfig - Doctor configuration
 * @returns {object} Display information
 */
export function getSlotDisplayInfo(slot, doctorConfig = null) {
  const normalized = normalizeSlot(slot, doctorConfig);
  const locations = [];

  if (normalized.allowedLocationIds.length > 0 && doctorConfig?.appointmentTypeConfig?.locations) {
    normalized.allowedLocationIds.forEach(locationId => {
      const location = doctorConfig.appointmentTypeConfig.locations.find(
        loc => loc.name === locationId
      );
      if (location) {
        locations.push({
          id: location.name,
          name: location.name,
          price: location.defaultValue,
        });
      }
    });
  }

  return {
    time: normalized.time,
    appointmentType: normalized.appointmentType,
    locations,
    hasLocation: locations.length > 0,
    isOnline: normalized.appointmentType === "online",
  };
}
