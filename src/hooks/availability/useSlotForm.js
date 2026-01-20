import { useState, useEffect, useMemo } from "react";
import { APPOINTMENT_TYPE, APPOINTMENT_TYPE_MODE } from "../../constants/appointmentType";

/**
 * Hook para gerenciar lógica do formulário de slot
 * @param {Object} params - Parâmetros do hook
 * @param {string} params.appointmentType - Tipo de atendimento
 * @param {Array} params.locations - Locais disponíveis
 * @param {Array} params.selectedLocationIds - IDs dos locais selecionados
 * @param {Function} params.onLocationIdsChange - Callback para mudança de locais
 * @param {string} params.time - Horário do slot
 * @param {Function} params.onSubmit - Callback para submit
 * @param {Object} params.appointmentTypeConfig - Configuração de tipos de atendimento
 * @returns {Object} Estado, computed e handlers
 */
export const useSlotForm = ({
  appointmentType,
  locations = [],
  selectedLocationIds,
  onLocationIdsChange,
  time,
  onSubmit,
  appointmentTypeConfig,
}) => {
  const [localError, setLocalError] = useState(null);

  // Determine if location selection is required
  const requiresLocation = useMemo(
    () => appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 1,
    [appointmentType, locations.length]
  );

  const showLocationSelector = useMemo(
    () => appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 0,
    [appointmentType, locations.length]
  );

  // If appointment type mode is fixed, use the fixed type
  const effectiveAppointmentType = useMemo(
    () => appointmentTypeConfig?.mode === APPOINTMENT_TYPE_MODE.FIXED
      ? appointmentTypeConfig.fixedType
      : appointmentType,
    [appointmentTypeConfig, appointmentType]
  );

  // Auto-select single location if only one exists
  useEffect(() => {
    if (appointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length === 1) {
      if (!selectedLocationIds.includes(locations[0].name)) {
        onLocationIdsChange([locations[0].name]);
      }
    } else if (appointmentType === APPOINTMENT_TYPE.ONLINE) {
      // Clear locations for online appointments
      if (selectedLocationIds.length > 0) {
        onLocationIdsChange([]);
      }
    }
  }, [appointmentType, locations, selectedLocationIds, onLocationIdsChange]);

  const handleToggleLocation = (locationId) => {
    if (selectedLocationIds.includes(locationId)) {
      onLocationIdsChange(selectedLocationIds.filter(id => id !== locationId));
    } else {
      onLocationIdsChange([...selectedLocationIds, locationId]);
    }
    setLocalError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!time) {
      setLocalError("Selecione um horário");
      return;
    }

    if (!appointmentType) {
      setLocalError("Selecione o tipo de atendimento");
      return;
    }

    if (requiresLocation && selectedLocationIds.length === 0) {
      setLocalError("Selecione pelo menos um local para atendimento presencial");
      return;
    }

    onSubmit({
      time,
      appointmentType,
      allowedLocationIds: appointmentType === APPOINTMENT_TYPE.ONLINE ? [] : selectedLocationIds,
    });
  };

  return {
    state: {
      localError,
    },
    computed: {
      requiresLocation,
      showLocationSelector,
      effectiveAppointmentType,
    },
    handlers: {
      setLocalError,
      handleToggleLocation,
      handleSubmit,
    },
  };
};
