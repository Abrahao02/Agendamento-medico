// ============================================
// Location Validation Service
// Validates location associations with slots and appointments
// ============================================
import * as DoctorService from "../firebase/doctors.service";
import { validateLocationExists, getLocationPrice } from "../../utils/locations/locationHelpers";
import { normalizeSlot } from "../../utils/availability/normalizeSlot";
import { logError } from "../../utils/logger/logger";

/**
 * Validate slot locations against doctor configuration
 * @param {string} doctorId - Doctor ID
 * @param {object} slotData - Slot data object
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateSlotLocations(doctorId, slotData) {
  try {
    // Get doctor config
    const doctorResult = await DoctorService.getDoctor(doctorId);
    if (!doctorResult.success) {
      return { valid: false, error: "Médico não encontrado" };
    }

    const doctorConfig = doctorResult.data;

    // Validate slot structure
    if (!slotData.time) {
      return { valid: false, error: "Horário do slot é obrigatório" };
    }

    // Validate appointment type
    const validTypes = ["online", "presencial"];
    if (slotData.appointmentType && !validTypes.includes(slotData.appointmentType)) {
      return { valid: false, error: "Tipo de atendimento inválido" };
    }

    // For online slots, locationIds should be empty
    if (slotData.appointmentType === "online") {
      if (slotData.allowedLocationIds && slotData.allowedLocationIds.length > 0) {
        return { valid: false, error: "Slots online não devem ter locais associados" };
      }
      return { valid: true };
    }

    // For presencial slots, validate locations
    if (slotData.appointmentType === "presencial" || !slotData.appointmentType) {
      const locations = doctorConfig.appointmentTypeConfig?.locations || [];

      // If no locations configured, cannot create presencial slot
      if (locations.length === 0) {
        return { 
          valid: false, 
          error: "Nenhum local configurado. Configure locais nas configurações primeiro." 
        };
      }

      // If locationIds provided, validate each one
      if (slotData.allowedLocationIds && Array.isArray(slotData.allowedLocationIds)) {
        for (const locationId of slotData.allowedLocationIds) {
          if (!validateLocationExists(locationId, doctorConfig)) {
            return { 
              valid: false, 
              error: `Local "${locationId}" não existe na configuração do médico` 
            };
          }
        }

        // If multiple locations exist but none selected, require at least one
        if (locations.length > 1 && slotData.allowedLocationIds.length === 0) {
          return { 
            valid: false, 
            error: "Selecione pelo menos um local para este horário" 
          };
        }
      } else {
        // No locationIds provided
        if (locations.length > 1) {
          return { 
            valid: false, 
            error: "Múltiplos locais configurados. Selecione pelo menos um local." 
          };
        }
        // Single location - will be auto-assigned
      }
    }

    return { valid: true };
  } catch (error) {
    logError("Erro ao validar locais do slot:", error);
    return { valid: false, error: error.message };
  }
}

/**
 * Get location price for a location ID
 * @param {string} doctorId - Doctor ID
 * @param {string} locationId - Location name/ID
 * @returns {Promise<number>} Location price
 */
export async function getLocationPriceForDoctor(doctorId, locationId) {
  try {
    const doctorResult = await DoctorService.getDoctor(doctorId);
    if (!doctorResult.success) {
      return 0;
    }

    return getLocationPrice(locationId, doctorResult.data);
  } catch (error) {
    logError("Erro ao obter preço do local:", error);
    return 0;
  }
}

/**
 * Validate appointment location against slot constraints
 * @param {object} appointmentData - Appointment data
 * @param {object} slot - Slot object (normalized)
 * @param {object} doctorConfig - Doctor configuration
 * @returns {{valid: boolean, error?: string}}
 */
export function validateAppointmentAgainstSlot(appointmentData, slot, doctorConfig) {
  try {
    // Normalize slot if needed
    const normalizedSlot = normalizeSlot(slot, doctorConfig);

    // If slot has location restrictions, validate
    if (normalizedSlot.allowedLocationIds.length > 0) {
      // Slot requires specific location(s)
      if (!appointmentData.location) {
        return { 
          valid: false, 
          error: "Este horário requer seleção de um local específico" 
        };
      }

      if (!normalizedSlot.allowedLocationIds.includes(appointmentData.location)) {
        return { 
          valid: false, 
          error: "Local selecionado não disponível para este horário" 
        };
      }
    }

    // Validate appointment type matches slot type
    if (normalizedSlot.appointmentType && appointmentData.appointmentType) {
      if (normalizedSlot.appointmentType !== appointmentData.appointmentType) {
        return { 
          valid: false, 
          error: `Tipo de atendimento deve ser ${normalizedSlot.appointmentType === "online" ? "online" : "presencial"}` 
        };
      }
    }

    // Validate location exists in doctor config
    if (appointmentData.location) {
      if (!validateLocationExists(appointmentData.location, doctorConfig)) {
        return { 
          valid: false, 
          error: "Local selecionado não existe na configuração" 
        };
      }
    }

    return { valid: true };
  } catch (error) {
    logError("Erro ao validar agendamento contra slot:", error);
    return { valid: false, error: error.message };
  }
}

/**
 * Migrate legacy slot to new format
 * @param {string|object} slot - Slot in legacy or new format
 * @param {object} doctorConfig - Doctor configuration
 * @returns {object} Migrated slot object
 */
export function migrateLegacySlot(slot, doctorConfig) {
  return normalizeSlot(slot, doctorConfig);
}
