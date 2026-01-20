// ============================================
// 📁 src/hooks/agenda/useAgendaStatus.js
// Responsabilidade: Gerenciamento de status
// ============================================

import { useState, useRef } from "react";
import { db } from "../../services/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { canChangeAppointmentStatus, getLockedAppointmentIds } from "../../utils/appointments/lockedAppointments";
import { logError, logWarning } from "../../utils/logger/logger";

export const useAgendaStatus = (appointments, setAppointments) => {
  const [statusUpdates, setStatusUpdates] = useState({});
  const [lockedAppointments, setLockedAppointments] = useState(new Set());
  const hasUnsavedChanges = useRef(false);

  const identifyLockedAppointments = (appointmentsList) => {
    setLockedAppointments(getLockedAppointmentIds(appointmentsList));
  };

  const handleStatusChange = async (id, value) => {
    // Bloqueia se o appointment está travado
    if (lockedAppointments.has(id)) {
      logWarning("Este agendamento não pode ter o status alterado pois o horário já foi reagendado");
      return {
        success: false,
        error: "Horário já foi reagendado. Status não pode ser alterado."
      };
    }

    const statusCheck = canChangeAppointmentStatus(appointments, id, value);
    if (!statusCheck.allowed) {
      logWarning(statusCheck.error);
      return {
        success: false,
        error: statusCheck.error,
      };
    }

    setStatusUpdates((prev) => ({ ...prev, [id]: value }));
    hasUnsavedChanges.current = true;

    try {
      await updateDoc(doc(db, "appointments", id), { status: value });
      
      setAppointments((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, status: value } : a));
        
        identifyLockedAppointments(updated);
        
        return updated;
      });

      return { success: true };
    } catch (err) {
      logError("Erro ao atualizar status:", err);
      return { success: false, error: err.message };
    }
  };

  const isAppointmentLocked = (appointmentId) => {
    return lockedAppointments.has(appointmentId);
  };

  const initializeStatus = (appointmentsList) => {
    const initialStatus = {};
    appointmentsList.forEach((a) => {
      initialStatus[a.id] = a.status || "Pendente";
    });
    setStatusUpdates(initialStatus);
    hasUnsavedChanges.current = false;
    identifyLockedAppointments(appointmentsList);
  };

  // Expor função para identificar locked appointments externamente
  const updateLockedAppointments = (appointmentsList) => {
    identifyLockedAppointments(appointmentsList);
  };

  return {
    statusUpdates,
    lockedAppointments,
    hasUnsavedChanges,
    handleStatusChange,
    isAppointmentLocked,
    initializeStatus,
    updateLockedAppointments,
  };
};
