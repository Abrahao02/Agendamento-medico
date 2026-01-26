// ============================================
// 📁 src/hooks/agenda/useAgenda.js
// Hook principal que orquestra os hooks especializados
// ============================================

import { useMemo, useEffect, useState, useCallback } from "react";
import { useAgendaData } from "./useAgendaData";
import { useAgendaPatients } from "./useAgendaPatients";
import { useAgendaStatus } from "./useAgendaStatus";
import { useAgendaWhatsapp } from "./useAgendaWhatsapp";
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { hasAppointmentConflict } from "../../utils/appointments/hasConflict";
import { getAgendaStats, getActiveAppointments, getOccupancyRate } from "../../utils/appointments/appointmentMetrics";
import { getFreeSlotTimesForDate } from "../../utils/availability/availabilityMetrics";
import { combineSlotTimes } from "../../utils/availability/slotUtils";
import { removeAvailability, saveAvailability, getAvailability } from "../../services/firebase/availability.service";
import { deleteAppointment, createAppointment, updateAppointment } from "../../services/firebase/appointments.service";
import { getDoctor } from "../../services/firebase/doctors.service";
import { getPatients } from "../../services/firebase/patients.service";
import { validateAvailability } from "../../utils/filters/availabilityFilters";
import { sortAppointments } from "../../utils/filters/appointmentFilters";
import { APPOINTMENT_STATUS, STATUS_GROUPS } from "../../constants/appointmentStatus";
import { auth } from "../../services/firebase/config";
import { logError } from "../../utils/logger/logger";

export default function useAgenda(currentDate) {
  const user = auth.currentUser;
  const currentDateStr = formatDateToQuery(currentDate);

  // Estado para doctor e patients
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);

  // Fetch de dados
  const {
    appointments,
    setAppointments,
    availability,
    setAvailability,
    whatsappConfig,
    refreshAvailability,
  } = useAgendaData(currentDate);

  // Carregar doctor e patients
  useEffect(() => {
    if (!user) return;

    const loadDoctorAndPatients = async () => {
      try {
        const [doctorResult, patientsResult] = await Promise.all([
          getDoctor(user.uid),
          getPatients(user.uid),
        ]);

        if (doctorResult.success) setDoctor(doctorResult.data);
        if (patientsResult.success) setPatients(patientsResult.data || []);
      } catch (err) {
        logError("Erro ao carregar doctor e patients:", err);
      }
    };

    loadDoctorAndPatients();
  }, [user]);

  // Gerenciamento de pacientes
  const {
    referenceNames,
    patientStatus,
    loadPatientData,
    handleAddPatient,
  } = useAgendaPatients(appointments);

  // Gerenciamento de status
  const {
    statusUpdates,
    setStatusUpdates,
    lockedAppointments,
    hasUnsavedChanges,
    handleStatusChange,
    isAppointmentLocked,
    initializeStatus,
  } = useAgendaStatus(appointments, setAppointments);

  // Lógica de WhatsApp
  const { handleSendWhatsapp } = useAgendaWhatsapp({
    whatsappConfig,
    referenceNames,
    handleStatusChange,
  });

  // Carregar dados dos pacientes quando appointments mudarem
  useEffect(() => {
    if (appointments.length > 0) {
      loadPatientData(appointments);
      initializeStatus(appointments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments.length]);

  // Remover slot livre
  const handleRemoveSlot = async (slotTime) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      // Verifica se há agendamento ativo no horário
      if (hasAppointmentConflict(appointments, currentDateStr, slotTime)) {
        throw new Error("Não é possível remover um horário com agendamento ativo. Cancele o agendamento primeiro.");
      }

      const result = await removeAvailability(user.uid, currentDateStr, slotTime);
      if (!result.success) throw new Error(result.error);

      // Atualiza a disponibilidade
      await refreshAvailability();

      return { success: true };
    } catch (err) {
      logError("Erro ao remover slot:", err);
      return { success: false, error: err.message };
    }
  };

  const dayAvailability = useMemo(() => {
    return availability.find(a => a.date === currentDateStr) || { slots: [] };
  }, [availability, currentDateStr]);

  const activeAppointments = useMemo(
    () => getActiveAppointments(appointments),
    [appointments]
  );

  // Calcula totalSlots igual ao DayManagement (combina slots + appointments ativos)
  const totalSlots = useMemo(
    () => combineSlotTimes(dayAvailability.slots || [], activeAppointments).length,
    [dayAvailability, activeAppointments]
  );

  const freeSlots = useMemo(() => {
    if (!totalSlots) return [];
    return getFreeSlotTimesForDate({
      slots: dayAvailability.slots || [],
      appointments,
      date: currentDateStr,
    });
  }, [dayAvailability, appointments, currentDateStr, totalSlots]);

  const stats = useMemo(
    () => getAgendaStats({ appointments, freeSlots }),
    [appointments, freeSlots]
  );

  const occupancyRate = useMemo(
    () => getOccupancyRate(activeAppointments.length, totalSlots),
    [activeAppointments.length, totalSlots]
  );

  // Adicionar slot de disponibilidade
  const handleAddSlot = useCallback(async (slot) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const result = await saveAvailability(user.uid, currentDateStr, slot);
      if (!result.success) throw new Error(result.error);

      // Atualiza a disponibilidade
      await refreshAvailability();

      return { success: true };
    } catch (err) {
      logError("Erro ao adicionar slot:", err);
      return { success: false, error: err.message };
    }
  }, [user, currentDateStr, refreshAvailability]);

  // Marcar consulta
  const handleBookAppointment = useCallback(async ({ patientId, time, appointmentType, location, customValue }) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      if (hasAppointmentConflict(appointments, currentDateStr, time)) {
        throw new Error("Já existe um agendamento ativo neste horário");
      }

      const patient = patients.find(p => p.id === patientId);
      if (!patient) throw new Error("Paciente não encontrado");

      // Verifica se o slot existe, se não, cria automaticamente
      const dayAvailability = availability.find(a => a.date === currentDateStr);
      const slotTime = typeof time === "string" ? time : (time?.time || null);
      const slotExists = dayAvailability?.slots?.some(s => {
        const sTime = typeof s === "string" ? s : (s?.time || null);
        return sTime === slotTime;
      });

      if (!slotExists) {
        const slotResult = await saveAvailability(user.uid, currentDateStr, time);
        if (!slotResult.success) {
          throw new Error(`Erro ao criar slot: ${slotResult.error}`);
        }

        // Atualiza a disponibilidade localmente
        const availabilityResult = await getAvailability(user.uid);
        if (availabilityResult.success) {
          const validAvailability = validateAvailability(availabilityResult.data, false);
          setAvailability(validAvailability);
        }
      }

      const appointmentTypeConfig = doctor?.appointmentTypeConfig || {
        defaultValueOnline: 0,
        defaultValuePresencial: 0,
      };

      const hasCustomValue = customValue !== null && customValue !== undefined;
      const appointmentValue = hasCustomValue
        ? customValue
        : (patient.price || appointmentTypeConfig.defaultValueOnline || 0);

      const appointmentData = {
        doctorId: user.uid,
        patientId: patient.id,
        patientName: patient.name,
        patientWhatsapp: patient.whatsapp,
        date: currentDateStr,
        time: slotTime,
        value: appointmentValue,
        status: APPOINTMENT_STATUS.CONFIRMED,
        appointmentType: appointmentType || null,
        location: location || null,
      };

      const result = await createAppointment(appointmentData);
      if (!result.success) throw new Error(result.error);

      const newAppointment = { id: result.appointmentId, ...appointmentData };
      setAppointments(prev => sortAppointments([...prev, newAppointment]));

      return { success: true, appointmentId: result.appointmentId };
    } catch (err) {
      logError("Erro ao marcar consulta:", err);
      return { success: false, error: err.message };
    }
  }, [user, currentDateStr, appointments, patients, availability, doctor, setAvailability, setAppointments]);

  // Deletar consulta
  const handleDeleteAppointment = useCallback(async (appointmentId) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      // Verificar se appointment está bloqueado
      if (lockedAppointments.has(appointmentId)) {
        return { success: false, error: "Não é possível excluir uma consulta bloqueada" };
      }

      const result = await deleteAppointment(appointmentId);
      if (!result.success) throw new Error(result.error);

      setAppointments(prev => prev.filter(a => a.id !== appointmentId));

      return { success: true };
    } catch (err) {
      logError("Erro ao deletar consulta:", err);
      return { success: false, error: err.message };
    }
  }, [user, lockedAppointments, setAppointments]);

  // Marcar consulta como cancelada
  const handleMarkAsCancelled = useCallback(async (appointmentId) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) throw new Error("Agendamento não encontrado");

      const result = await updateAppointment(appointmentId, {
        status: APPOINTMENT_STATUS.CANCELLED
      });
      if (!result.success) throw new Error(result.error);

      // Atualiza o estado local - o horário aparecerá como livre porque os getters filtram por STATUS_GROUPS.ACTIVE
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId
          ? { ...a, status: APPOINTMENT_STATUS.CANCELLED }
          : a
      ));

      // Atualiza o statusUpdates para que o select mostre o status correto
      setStatusUpdates(prev => ({ ...prev, [appointmentId]: APPOINTMENT_STATUS.CANCELLED }));

      return { success: true };
    } catch (err) {
      logError("Erro ao marcar como cancelado:", err);
      return { success: false, error: err.message };
    }
  }, [user, appointments, setAppointments, setStatusUpdates]);

  return {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    whatsappConfig,
    hasUnsavedChanges,
    lockedAppointments,
    handleStatusChange,
    handleAddPatient,
    handleSendWhatsapp,
    handleRemoveSlot,
    handleAddSlot,
    handleBookAppointment,
    handleDeleteAppointment,
    handleMarkAsCancelled,
    isAppointmentLocked,
    totalSlots,
    freeSlots,
    stats,
    occupancyRate,
    activeAppointments,
    doctor,
    patients,
  };
}
