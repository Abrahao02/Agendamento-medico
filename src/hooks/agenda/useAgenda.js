// ============================================
// 📁 src/hooks/agenda/useAgenda.js
// Hook principal que orquestra os hooks especializados
// ============================================

import { useMemo, useEffect } from "react";
import { useAgendaData } from "./useAgendaData";
import { useAgendaPatients } from "./useAgendaPatients";
import { useAgendaStatus } from "./useAgendaStatus";
import { useAgendaWhatsapp } from "./useAgendaWhatsapp";
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { hasAppointmentConflict } from "../../utils/appointments/hasConflict";
import { getAgendaStats, getActiveAppointments, getOccupancyRate } from "../../utils/appointments/appointmentMetrics";
import { getFreeSlotTimesForDate } from "../../utils/availability/availabilityMetrics";
import { combineSlotTimes } from "../../utils/availability/slotUtils";
import { removeAvailability } from "../../services/firebase/availability.service";
import { auth } from "../../services/firebase/config";
import { logError } from "../../utils/logger/logger";

export default function useAgenda(currentDate) {
  const user = auth.currentUser;
  const currentDateStr = formatDateToQuery(currentDate);

  // Fetch de dados
  const {
    appointments,
    setAppointments,
    availability,
    setAvailability,
    whatsappConfig,
    refreshAvailability,
  } = useAgendaData(currentDate);

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
    isAppointmentLocked,
    totalSlots,
    freeSlots,
    stats,
    occupancyRate,
    activeAppointments,
  };
}
