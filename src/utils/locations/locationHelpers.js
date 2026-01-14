// ============================================
// Location Helper Utilities
// ============================================

/**
 * Get location object by ID (name)
 * @param {string} locationId - Location name/ID
 * @param {object} doctorConfig - Doctor configuration
 * @returns {object|null} Location object or null
 */
export function getLocationById(locationId, doctorConfig) {
  if (!locationId || !doctorConfig?.appointmentTypeConfig?.locations) {
    return null;
  }

  return doctorConfig.appointmentTypeConfig.locations.find(
    loc => loc.name === locationId
  ) || null;
}

/**
 * Get price for a location
 * @param {string} locationId - Location name/ID
 * @param {object} doctorConfig - Doctor configuration
 * @returns {number} Location price or 0
 */
export function getLocationPrice(locationId, doctorConfig) {
  const location = getLocationById(locationId, doctorConfig);
  return location?.defaultValue || 0;
}

/**
 * Validate that a location exists in doctor config
 * @param {string} locationId - Location name/ID to validate
 * @param {object} doctorConfig - Doctor configuration
 * @returns {boolean} True if location exists
 */
export function validateLocationExists(locationId, doctorConfig) {
  return getLocationById(locationId, doctorConfig) !== null;
}

/**
 * Extract unique location IDs from slots array
 * @param {Array<string|object>} slots - Array of slots
 * @param {object} doctorConfig - Doctor configuration
 * @returns {Array<string>} Unique location IDs
 */
export function getAvailableLocationsFromSlots(slots, doctorConfig) {
  if (!Array.isArray(slots) || !doctorConfig?.appointmentTypeConfig?.locations) {
    return [];
  }

  const locationIds = new Set();

  slots.forEach(slot => {
    // Handle both legacy and new formats
    if (typeof slot === "object" && slot.allowedLocationIds) {
      slot.allowedLocationIds.forEach(id => locationIds.add(id));
    } else if (typeof slot === "string") {
      // Legacy slot - if presencial, all locations might be available
      // We'll include all locations for legacy slots
      doctorConfig.appointmentTypeConfig.locations.forEach(loc => {
        locationIds.add(loc.name);
      });
    }
  });

  // Filter to only locations that actually exist in config
  const validLocationIds = Array.from(locationIds).filter(id =>
    validateLocationExists(id, doctorConfig)
  );

  return validLocationIds;
}

/**
 * Get all available locations with their info
 * @param {Array<string|object>} slots - Array of slots
 * @param {object} doctorConfig - Doctor configuration
 * @returns {Array<object>} Array of location objects with id, name, price
 */
export function getAvailableLocationsWithInfo(slots, doctorConfig) {
  const locationIds = getAvailableLocationsFromSlots(slots, doctorConfig);
  
  return locationIds.map(id => {
    const location = getLocationById(id, doctorConfig);
    return {
      id: location.name,
      name: location.name,
      price: location.defaultValue,
    };
  });
}
