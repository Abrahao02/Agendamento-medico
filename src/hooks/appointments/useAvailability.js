// ============================================
// 📁 src/hooks/appointments/useAvailability.js
// ✅ ATUALIZADO: removeSlot agora considera apenas appointments ATIVOS
// ============================================

import { useEffect, useState, useCallback } from "react";
import { auth } from "../../services/firebase";

// Services
import { getDoctor } from "../../services/firebase/doctors.service";
import { getAvailability, saveAvailability, removeAvailability } from "../../services/firebase/availability.service";
import { getAppointmentsByDoctor, createAppointment, deleteAppointment as deleteAppointmentService, updateAppointment } from "../../services/firebase/appointments.service";
import { getPatients } from "../../services/firebase/patients.service";

// Utils
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { validateAvailability } from "../../utils/filters/availabilityFilters";
import { getBookedSlotsForDate } from "../../utils/appointments/getBookedSlots";
import { hasAppointmentConflict } from "../../utils/appointments/hasConflict";
import { sortAppointments } from "../../utils/filters/appointmentFilters";

// Constants
import { APPOINTMENT_STATUS, STATUS_GROUPS } from "../../constants/appointmentStatus";

export const useAvailability = () => {
  const user = auth.currentUser;

  if (!user) {
    console.warn("useAvailability usado sem usuário autenticado");
  }

  // ==============================
  // ESTADO
  // ==============================
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarValue, setCalendarValue] = useState(new Date());

  /* ==============================
     HELPERS INTERNOS
  ============================== */

  const formatLocalDate = useCallback((date) => {
    if (!date) return "";
    return formatDateToQuery(date);
  }, []);

  useEffect(() => {
    const today = new Date();
    setSelectedDate(formatLocalDate(today));
    setCalendarValue(today);
  }, [formatLocalDate]);

  /* ==============================
     LOAD INITIAL DATA
  ============================== */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [doctorResult, availResult, appointmentsResult, patientsResult] = await Promise.all([
          getDoctor(user.uid),
          getAvailability(user.uid),
          getAppointmentsByDoctor(user.uid),
          getPatients(user.uid),
        ]);

        if (doctorResult.success) setDoctor(doctorResult.data);

        if (availResult.success) {
          const validAvailability = validateAvailability(availResult.data, false);
          setAvailability(validAvailability);
        }

        if (appointmentsResult.success) {
          const sortedAppointments = sortAppointments(appointmentsResult.data);
          setAppointments(sortedAppointments);
        }

        if (patientsResult.success) setPatients(patientsResult.data);

      } catch (err) {
        console.error("Erro ao carregar disponibilidade:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  /* ==============================
     GETTERS - AVAILABILITY
  ============================== */

  const getAvailabilityForDate = useCallback((date) => {
    const dayAvailability = availability.find(a => a.date === date);
    if (!dayAvailability || !dayAvailability.slots) return [];

    // ✅ getBookedSlotsForDate já filtra apenas appointments ativos
    const bookedSlots = getBookedSlotsForDate(appointments, date);

    return dayAvailability.slots
      .filter(slot => !bookedSlots.includes(slot))
      .sort();
  }, [availability, appointments]);

  const getAllSlotsForDate = useCallback((date) => {
    const dayAvailability = availability.find(a => a.date === date);
    return dayAvailability?.slots || [];
  }, [availability]);

  const getAppointmentsForDate = useCallback((date) => {
    return appointments
      .filter(apt => apt.date === date)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [appointments]);

  const getBookedSlotsForDateCached = useCallback((date) => {
    return getBookedSlotsForDate(appointments, date);
  }, [appointments]);

  const isSlotAvailable = useCallback((date, time) => {
    const dayAvailability = availability.find(a => a.date === date);
    if (!dayAvailability) return false;

    // ✅ hasAppointmentConflict já filtra apenas appointments ativos
    return dayAvailability.slots.includes(time) &&
      !hasAppointmentConflict(appointments, date, time);
  }, [availability, appointments]);

  /**
   * Dados para renderizar badges no calendário
   * ✅ CORRIGIDO: Considera apenas appointments ATIVOS
   */
  const getCalendarTileData = useCallback((dateStr) => {
    const dayAvailability = availability.find(a => a.date === dateStr) || { slots: [] };

    // ✅ FILTRA apenas appointments ATIVOS para essa data
    const activeAppointmentsForDate = appointments.filter(a =>
      a.date === dateStr && STATUS_GROUPS.ACTIVE.includes(a.status)
    );

    // ✅ Slots ocupados = apenas appointments ativos
    const bookedTimes = getBookedSlotsForDate(appointments, dateStr);

    // ✅ Slots livres = slots cadastrados - appointments ativos
    const freeSlotsArray = dayAvailability.slots.filter(slot => !bookedTimes.includes(slot));

    return {
      hasFreeSlots: freeSlotsArray.length > 0,
      hasBookedSlots: activeAppointmentsForDate.length > 0, // ✅ MUDANÇA PRINCIPAL
      freeCount: freeSlotsArray.length,
      bookedCount: activeAppointmentsForDate.length, // ✅ MUDANÇA PRINCIPAL
      totalCount: dayAvailability.slots.length,
    };
  }, [availability, appointments]);

  /* ==============================
     ACTIONS - AVAILABILITY
  ============================== */

  const addSlot = async (date, slot) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const dayAvailability = availability.find(a => a.date === date);
      if (dayAvailability?.slots?.includes(slot)) {
        throw new Error("Este horário já está cadastrado");
      }

      const result = await saveAvailability(user.uid, date, slot);
      if (!result.success) throw new Error(result.error);

      setAvailability(prev => {
        const existing = prev.find(a => a.date === date);
        if (existing) {
          return prev.map(a =>
            a.date === date
              ? { ...a, slots: [...a.slots, slot].sort() }
              : a
          );
        } else {
          return [
            ...prev,
            { id: `${user.uid}_${date}`, doctorId: user.uid, date, slots: [slot] }
          ].sort((a, b) => a.date.localeCompare(b.date));
        }
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Remove um slot de disponibilidade
   * ✅ ATUALIZADO: Valida apenas contra appointments ATIVOS
   */
  const removeSlot = async (date, slot) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      // ✅ MUDANÇA: hasAppointmentConflict já filtra apenas ativos
      if (hasAppointmentConflict(appointments, date, slot)) {
        throw new Error("Não é possível remover um horário com agendamento ativo. Cancele o agendamento primeiro.");
      }

      const result = await removeAvailability(user.uid, date, slot);
      if (!result.success) throw new Error(result.error);

      setAvailability(prev => prev
        .map(a => a.date === date ? { ...a, slots: a.slots.filter(s => s !== slot) } : a)
        .filter(a => a.slots.length > 0)
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /* ==============================
     ACTIONS - APPOINTMENTS
  ============================== */

  /**
   * Cria um novo agendamento
   * ✅ Cria o slot automaticamente se não existir
   */
  const bookAppointment = async ({ patientId, date, time }) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      // ✅ hasAppointmentConflict já filtra apenas ativos
      if (hasAppointmentConflict(appointments, date, time)) {
        throw new Error("Já existe um agendamento ativo neste horário");
      }

      const patient = patients.find(p => p.id === patientId);
      if (!patient) throw new Error("Paciente não encontrado");

      // ✅ Verifica se o slot existe, se não, cria automaticamente
      const dayAvailability = availability.find(a => a.date === date);
      const slotExists = dayAvailability?.slots?.includes(time);

      if (!slotExists) {
        const slotResult = await saveAvailability(user.uid, date, time);

        if (!slotResult.success) {
          throw new Error(`Erro ao criar slot: ${slotResult.error}`);
        }

        setAvailability(prev => {
          const existing = prev.find(a => a.date === date);
          if (existing) {
            return prev.map(a =>
              a.date === date
                ? { ...a, slots: [...a.slots, time].sort() }
                : a
            );
          } else {
            return [
              ...prev,
              { id: `${user.uid}_${date}`, doctorId: user.uid, date, slots: [time] }
            ].sort((a, b) => a.date.localeCompare(b.date));
          }
        });
      }

      const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
        defaultValueOnline: 0,
        defaultValuePresencial: 0,
      };

      const appointmentValue = patient.price || appointmentTypeConfig.defaultValueOnline || 0;

      const appointmentData = {
        doctorId: user.uid,
        patientId: patient.id,
        patientName: patient.name,
        patientWhatsapp: patient.whatsapp,
        date,
        time,
        value: appointmentValue,
        status: APPOINTMENT_STATUS.CONFIRMED,
      };

      const result = await createAppointment(appointmentData);
      if (!result.success) throw new Error(result.error);

      const newAppointment = { id: result.appointmentId, ...appointmentData };
      setAppointments(prev => sortAppointments([...prev, newAppointment]));

      return { success: true, appointmentId: result.appointmentId };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Deleta um agendamento (remove completamente)
   * ✅ Mantém o slot na availability
   */
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const result = await deleteAppointmentService(appointmentId);
      if (!result.success) throw new Error(result.error);

      setAppointments(prev => prev.filter(a => a.id !== appointmentId));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Marca agendamento como cancelado (apenas status)
   * ✅ Mantém o slot ocupado no banco, mas libera na interface
   */
  const markAsCancelled = async (appointmentId) => {
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) throw new Error("Agendamento não encontrado");

      const result = await updateAppointment(appointmentId, {
        status: APPOINTMENT_STATUS.CANCELLED
      });
      if (!result.success) throw new Error(result.error);

      // ✅ Atualiza estado local - o slot será automaticamente liberado
      // porque os getters filtram por STATUS_GROUPS.ACTIVE
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId
          ? { ...a, status: APPOINTMENT_STATUS.CANCELLED }
          : a
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /* ==============================
     UI HANDLERS
  ============================== */

  const handleSelectDate = useCallback((date) => {
    const dateStr = formatLocalDate(date);
    setSelectedDate(dateStr);
    setCalendarValue(date);
  }, [formatLocalDate]);

  const handleAddSlot = useCallback(async (slot) => {
    if (!selectedDate) {
      return { success: false, error: "Nenhuma data selecionada" };
    }
    return await addSlot(selectedDate, slot);
  }, [selectedDate]);

  const handleRemoveSlot = useCallback(async (slot) => {
    if (!selectedDate) {
      return { success: false, error: "Nenhuma data selecionada" };
    }
    return await removeSlot(selectedDate, slot);
  }, [selectedDate]);

  const handleBookAppointment = useCallback(async (patientId, time) => {
    if (!selectedDate) {
      return { success: false, error: "Nenhuma data selecionada" };
    }
    return await bookAppointment({
      patientId,
      date: selectedDate,
      time,
    });
  }, [selectedDate, bookAppointment]);

  return {
    // Estado
    loading,
    error,
    doctor,
    availability,
    appointments,
    patients,

    // Estado da UI
    selectedDate,
    calendarValue,

    // Handlers de UI
    handleSelectDate,
    handleAddSlot,
    handleRemoveSlot,
    handleBookAppointment,

    // Ações diretas
    deleteAppointment: handleDeleteAppointment,
    markAsCancelled,

    // Getters
    getAvailabilityForDate,
    getAllSlotsForDate,
    getAppointmentsForDate,
    getBookedSlotsForDate: getBookedSlotsForDateCached,
    isSlotAvailable,
    getCalendarTileData,

    // Helpers
    formatLocalDate,
  };
};