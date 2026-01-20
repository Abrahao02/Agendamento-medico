import { useState, useEffect, useMemo } from "react";
import { formatWhatsapp } from "../../utils/formatter/formatWhatsapp";
import {
  APPOINTMENT_TYPE,
  APPOINTMENT_TYPE_MODE,
} from "../../constants/appointmentType";
import { normalizeSlot } from "../../utils/availability/normalizeSlot";

/**
 * Hook para gerenciar lógica do formulário de agendamento público
 * @param {Object} params - Parâmetros do hook
 * @param {Object} params.selectedSlot - Slot selecionado
 * @param {Object} params.doctor - Dados do médico
 * @param {Function} params.onSubmit - Callback para submit
 * @returns {Object} Estado, configurações e handlers
 */
export const useAppointmentForm = ({ selectedSlot, doctor, onSubmit }) => {
  const [patientName, setPatientName] = useState("");
  const [patientWhatsapp, setPatientWhatsapp] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [location, setLocation] = useState("");
  const [shake, setShake] = useState(false);

  const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
    mode: APPOINTMENT_TYPE_MODE.DISABLED,
    fixedType: APPOINTMENT_TYPE.ONLINE,
    locations: [],
  };

  // Get slot constraints
  const slotData = selectedSlot?.slotData;
  const normalizedSlot = slotData && doctor ? normalizeSlot(slotData, doctor) : null;
  const slotAllowedLocationIds = normalizedSlot?.allowedLocationIds || [];
  const slotAppointmentType = normalizedSlot?.appointmentType;

  // Filter available locations based on slot constraints
  const availableLocations = useMemo(() => {
    if (slotAllowedLocationIds.length > 0) {
      return appointmentTypeConfig.locations.filter(loc => 
        slotAllowedLocationIds.includes(loc.name)
      );
    }
    return appointmentTypeConfig.locations;
  }, [slotAllowedLocationIds, appointmentTypeConfig.locations]);

  const showAppointmentType = appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED;
  const isFixed = appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED;
  
  // If slot has appointment type constraint, use it
  const effectiveAppointmentType = slotAppointmentType || 
    (isFixed ? appointmentTypeConfig.fixedType : appointmentType);
  
  const showLocation = showAppointmentType && 
    effectiveAppointmentType === APPOINTMENT_TYPE.PRESENCIAL &&
    availableLocations.length > 0;

  // Get showPrice setting from doctor config (default: true)
  const showPrice = doctor?.publicScheduleConfig?.showPrice ?? true;

  useEffect(() => {
    // Pre-select appointment type from slot if available
    if (slotAppointmentType) {
      setAppointmentType(slotAppointmentType);
    } else if (isFixed) {
      setAppointmentType(appointmentTypeConfig.fixedType);
    } else if (showAppointmentType && !appointmentType) {
      setAppointmentType(APPOINTMENT_TYPE.ONLINE);
    }
    
    // Pre-select location if slot has only one allowed location
    if (slotAllowedLocationIds.length === 1 && availableLocations.length === 1) {
      setLocation(availableLocations[0].name);
    } else if (!location || (availableLocations.length > 0 && !availableLocations.some(loc => loc.name === location))) {
      // Only reset if location is empty or if current location is not in available locations
      setLocation("");
    }
  }, [
    slotAppointmentType, 
    slotAllowedLocationIds, 
    isFixed, 
    appointmentTypeConfig.fixedType, 
    showAppointmentType, 
    appointmentType, 
    availableLocations,
    location
  ]);

  const handleWhatsappChange = (e) => {
    const numbers = e.target.value.replace(/\D/g, "");

    if (numbers.length > 11) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }

    setPatientWhatsapp(numbers);
  };

  const handleWhatsappBlur = () => {
    setPatientWhatsapp(formatWhatsapp(patientWhatsapp));
  };

  const handleAppointmentTypeChange = (value) => {
    setAppointmentType(value);
    setLocation("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      patientName,
      patientWhatsapp,
    };

    if (showAppointmentType) {
      formData.appointmentType = isFixed ? appointmentTypeConfig.fixedType : appointmentType;
      
      if (showLocation && location) {
        formData.location = location;
      }
    }

    onSubmit(formData);
  };

  return {
    formState: {
      patientName,
      patientWhatsapp,
      appointmentType,
      location,
      shake,
    },
    config: {
      appointmentTypeConfig,
      availableLocations,
      showAppointmentType,
      isFixed,
      showLocation,
      showPrice,
      slotAllowedLocationIds,
    },
    computed: {
      effectiveAppointmentType,
      slotAppointmentType,
    },
    handlers: {
      setPatientName,
      setPatientWhatsapp,
      setAppointmentType,
      setLocation,
      handleWhatsappChange,
      handleWhatsappBlur,
      handleAppointmentTypeChange,
      handleSubmit,
    },
  };
};
