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
}) => {
  const [mode, setMode] = useState("add");
  const [slotTime, setSlotTime] = useState("12:00");
  const [slotAppointmentType, setSlotAppointmentType] = useState(APPOINTMENT_TYPE.ONLINE);
  const [slotLocationIds, setSlotLocationIds] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [bookAppointmentType, setBookAppointmentType] = useState(APPOINTMENT_TYPE.ONLINE);
  const [bookLocationId, setBookLocationId] = useState("");
  const [priceMode, setPriceMode] = useState("patient");
  const [dealValue, setDealValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const formSectionRef = useRef(null);

  useEffect(() => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
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

  const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
    mode: APPOINTMENT_TYPE_MODE.DISABLED,
    fixedType: APPOINTMENT_TYPE.ONLINE,
    locations: [],
  };

  const locations = appointmentTypeConfig.locations || [];

  useEffect(() => {
    if (appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED) {
      setSlotAppointmentType(appointmentTypeConfig.fixedType);
      setBookAppointmentType(appointmentTypeConfig.fixedType);
    }
  }, [appointmentTypeConfig]);

  useEffect(() => {
    if (bookAppointmentType === APPOINTMENT_TYPE.PRESENCIAL && locations.length === 1) {
      if (!bookLocationId) {
        setBookLocationId(locations[0].name);
      }
    } else if (bookAppointmentType === APPOINTMENT_TYPE.ONLINE) {
      setBookLocationId("");
    }
  }, [bookAppointmentType, locations, bookLocationId]);

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
      setSelectedTime("");
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
