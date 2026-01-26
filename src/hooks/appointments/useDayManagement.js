import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { STATUS_GROUPS } from "../../constants/appointmentStatus";
import {
  APPOINTMENT_TYPE,
  APPOINTMENT_TYPE_MODE,
} from "../../constants/appointmentType";
import { combineSlotTimes, getSlotTime } from "../../utils/availability/slotUtils";
import { getDayStats } from "../../utils/appointments/appointmentMetrics";

export const useDayManagement = ({
  allSlots = [],
  appointments = [],
  patients = [],
  doctor,
  onAddSlot,
  onRemoveSlot,
  onBookAppointment,
  onDeleteAppointment,
  onMarkAsCancelled,
  isLimitReached = false,
  initialMode = null,
  onModeChange = null,
}) => {
  const [mode, setMode] = useState(initialMode || null);
  const [slotTime, setSlotTime] = useState("12:00");
  // Calcular valor inicial baseado em appointmentTypeConfig (será atualizado após primeiro render)
  const [slotAppointmentType, setSlotAppointmentType] = useState(() => {
    const config = doctor?.appointmentTypeConfig;
    if (config?.mode === APPOINTMENT_TYPE_MODE.FIXED) {
      return config.fixedType;
    }
    return APPOINTMENT_TYPE.ONLINE;
  });
  const [slotLocationIds, setSlotLocationIds] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [bookAppointmentType, setBookAppointmentType] = useState(() => {
    const config = doctor?.appointmentTypeConfig;
    if (config?.mode === APPOINTMENT_TYPE_MODE.FIXED) {
      return config.fixedType;
    }
    return APPOINTMENT_TYPE.ONLINE;
  });
  const [bookLocationId, setBookLocationId] = useState("");
  const [priceMode, setPriceMode] = useState("patient");
  const [dealValue, setDealValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const formSectionRef = useRef(null);

  // Sincronizar mode com initialMode quando mudar externamente
  useEffect(() => {
    if (initialMode !== null && initialMode !== mode) {
      setMode(initialMode);
    } else if (initialMode === null && mode !== null && onModeChange) {
      // Se initialMode for null e há controle externo, resetar o mode
      setMode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode, onModeChange]);

  // Notificar mudança de modo para componente pai (apenas quando mudar internamente)
  const prevModeRef = useRef(mode);
  useEffect(() => {
    if (onModeChange && prevModeRef.current !== mode) {
      // Só notifica se a mudança não veio de initialMode
      if (initialMode === null || initialMode === mode) {
        onModeChange(mode);
      }
      prevModeRef.current = mode;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, onModeChange]);

  useEffect(() => {
    if (formSectionRef.current) {
      // Delay para garantir que o DOM foi atualizado
      setTimeout(() => {
      formSectionRef.current.scrollIntoView({
        behavior: "smooth",
          block: "center",
          inline: "nearest",
      });
      }, 100);
    }
  }, [mode]);

  const activeAppointments = useMemo(
    () => appointments.filter((appt) => STATUS_GROUPS.ACTIVE.includes(appt.status)),
    [appointments]
  );

  const combinedSlots = useMemo(
    () => combineSlotTimes(allSlots, appointments),
    [allSlots, appointments]
  );

  // Memoizar appointmentTypeConfig e locations para evitar recriação
  const appointmentTypeConfig = useMemo(() => 
    doctor?.appointmentTypeConfig || {
    mode: APPOINTMENT_TYPE_MODE.DISABLED,
    fixedType: APPOINTMENT_TYPE.ONLINE,
    locations: [],
    },
    [doctor?.appointmentTypeConfig]
  );

  const locations = useMemo(() => 
    appointmentTypeConfig.locations || [],
    [appointmentTypeConfig.locations]
  );

  // Calcular valores derivados baseados em appointmentTypeConfig
  const derivedAppointmentType = useMemo(() => {
    if (appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED) {
      return appointmentTypeConfig.fixedType;
    }
    return null; // Não forçar mudança se não for FIXED
  }, [appointmentTypeConfig.mode, appointmentTypeConfig.fixedType]);

  // Sincronizar appointmentType quando appointmentTypeConfig mudar (usando ref para evitar loop)
  const prevAppointmentTypeConfigRef = useRef(appointmentTypeConfig);
  useEffect(() => {
    if (derivedAppointmentType !== null) {
      const prevConfig = prevAppointmentTypeConfigRef.current;
      const configChanged = 
        prevConfig.mode !== appointmentTypeConfig.mode ||
        prevConfig.fixedType !== appointmentTypeConfig.fixedType;
      
      if (configChanged) {
        setSlotAppointmentType(derivedAppointmentType);
        setBookAppointmentType(derivedAppointmentType);
        prevAppointmentTypeConfigRef.current = appointmentTypeConfig;
      }
    }
  }, [derivedAppointmentType, appointmentTypeConfig]);

  // Calcular bookLocationId sugerido baseado em bookAppointmentType e locations
  const suggestedLocationId = useMemo(() => {
    if (bookAppointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length === 1) {
      return locations[0].name;
      }
    if (bookAppointmentType === APPOINTMENT_TYPE.ONLINE) {
      return "";
    }
    return null; // Não sugerir mudança
  }, [bookAppointmentType, locations]);

  // Aplicar sugestão apenas quando necessário (usando ref para evitar loop)
  const prevSuggestedLocationRef = useRef(suggestedLocationId);
  useEffect(() => {
    if (suggestedLocationId !== null && 
        suggestedLocationId !== prevSuggestedLocationRef.current &&
        bookLocationId !== suggestedLocationId) {
      setBookLocationId(suggestedLocationId);
      prevSuggestedLocationRef.current = suggestedLocationId;
    }
  }, [suggestedLocationId, bookLocationId]);

  const showAppointmentType = appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED;
  const isFixed = appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED;
  const showLocationSelector =
    bookAppointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 0;
  const requiresLocation =
    bookAppointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length > 1;

  const getAppointmentBySlot = useCallback(
    (slot) => {
      const slotTime = getSlotTime(slot);
      if (!slotTime) return null;
      const active = appointments.find(
        (appt) => appt.time === slotTime && STATUS_GROUPS.ACTIVE.includes(appt.status)
      );
      if (active) return active;
      return appointments.find((appt) => appt.time === slotTime);
    },
    [appointments]
  );

  const handleAddSlotSubmit = async (slotData) => {
    const slotTimeValue = slotData.time;
    const slotExists = combinedSlots.includes(slotTimeValue);
    if (slotExists) {
      setError("Este horário já existe");
      return;
    }

    setLoading(true);
    setError("");

    const slot = {
      time: slotTimeValue,
      appointmentType: slotData.appointmentType,
      allowedLocationIds: slotData.allowedLocationIds || [],
    };

    const result = await onAddSlot(slot);

    if (result.success) {
      setSlotTime("12:00");
      setSlotAppointmentType(
        appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED
          ? appointmentTypeConfig.fixedType
          : APPOINTMENT_TYPE.ONLINE
      );
      setSlotLocationIds([]);
    } else {
      setError(result.error || "Erro ao adicionar horário");
    }

    setLoading(false);
  };

  const handleRemoveSlot = async (slot) => {
    setLoading(true);
    const slotToRemove = getSlotTime(slot) || slot;
    const result = await onRemoveSlot(slotToRemove);
    if (!result.success) {
      setError(result.error || "Erro ao remover horário");
    }
    setLoading(false);
  };

  const handleOpenModal = (slot) => {
    const appointment = getAppointmentBySlot(slot);
    if (!appointment) return;

    const patient = patients.find((p) => p.id === appointment.patientId);
    const displayName = patient?.referenceName || appointment.patientName;

    setSelectedAppointment({
      ...appointment,
      displayName,
    });
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    const result = await onDeleteAppointment(selectedAppointment.id);

    if (result.success) {
      setModalOpen(false);
      setSelectedAppointment(null);
    } else {
      setError(result.error || "Erro ao excluir consulta");
    }

    setLoading(false);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    const result = await onMarkAsCancelled(selectedAppointment.id);

    if (result.success) {
      setModalOpen(false);
      setSelectedAppointment(null);
    } else {
      setError(result.error || "Erro ao marcar como cancelado");
    }

    setLoading(false);
  };

  const isTimeBooked = (time) => activeAppointments.map((appt) => appt.time).includes(time);

  const handleBookAppointment = async () => {
    if (!selectedPatient || !selectedTime) {
      setError("Selecione paciente e horário");
      return;
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(selectedTime)) {
      setError("Horário inválido. Use o formato HH:mm (ex: 14:30)");
      return;
    }

    if (isTimeBooked(selectedTime)) {
      setError("Este horário já está ocupado. Selecione outro horário.");
      return;
    }

    if (requiresLocation && !bookLocationId) {
      setError("Selecione pelo menos um local para atendimento presencial");
      return;
    }

    let customValue = null;
    if (priceMode === "deal") {
      if (!dealValue.trim()) {
        setError("Informe o valor do acordo");
        return;
      }
      const normalizedDealValue = dealValue.replace(",", ".");
      const parsedValue = Number(normalizedDealValue);
      if (Number.isNaN(parsedValue) || parsedValue < 0) {
        setError("Valor inválido. Use 0,00 ou maior.");
        return;
      }
      customValue = parsedValue;
    }

    setLoading(true);
    setError("");

    const result = await onBookAppointment(
      selectedPatient,
      selectedTime,
      bookAppointmentType,
      bookLocationId || null,
      customValue
    );

    if (result.success) {
      setSelectedPatient("");
      setSelectedTime("12:00"); // Sempre resetar para 12:00 para facilitar o uso
      const resetAppointmentType = isFixed
        ? appointmentTypeConfig.fixedType
        : bookAppointmentType;
      setBookAppointmentType(resetAppointmentType);
      if (resetAppointmentType === APPOINTMENT_TYPE.ONLINE) {
        setBookLocationId("");
      }
      setPriceMode("patient");
      setDealValue("");
    } else {
      setError(result.error || "Erro ao marcar consulta");
    }

    setLoading(false);
  };

  const sortedPatients = useMemo(
    () =>
      [...patients].sort((a, b) => {
        const nameA = (a.referenceName || a.name).toLowerCase();
        const nameB = (b.referenceName || b.name).toLowerCase();
        return nameA.localeCompare(nameB);
      }),
    [patients]
  );

  const dayStats = useMemo(
    () =>
      getDayStats({
        appointments,
        activeAppointments,
        totalSlots: combinedSlots.length,
      }),
    [appointments, activeAppointments, combinedSlots.length]
  );

  return {
    state: {
      mode,
      slotTime,
      slotAppointmentType,
      slotLocationIds,
      selectedPatient,
      selectedTime,
      bookAppointmentType,
      bookLocationId,
      priceMode,
      dealValue,
      error,
      loading,
      modalOpen,
      selectedAppointment,
    },
    refs: {
      formSectionRef,
    },
    data: {
      combinedSlots,
      activeAppointments,
      sortedPatients,
      appointmentTypeConfig,
      locations,
      showAppointmentType,
      isFixed,
      showLocationSelector,
      requiresLocation,
      dayStats,
    },
    handlers: {
      setMode,
      setSlotTime,
      setSlotAppointmentType,
      setSlotLocationIds,
      setSelectedPatient,
      setSelectedTime,
      setBookAppointmentType,
      setBookLocationId,
      setPriceMode,
      setDealValue,
      setModalOpen,
      setSelectedAppointment,
      setError,
      handleAddSlotSubmit,
      handleRemoveSlot,
      handleOpenModal,
      handleConfirmDelete,
      handleConfirmCancel,
      handleBookAppointment,
      getAppointmentBySlot,
    },
    flags: {
      isLimitReached,
    },
  };
};
