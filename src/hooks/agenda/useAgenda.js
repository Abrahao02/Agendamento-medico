import { useState, useEffect, useRef, useMemo } from "react";
import { auth, db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";

// Services
import * as PatientService from "../../services/firebase/patients.service";
import { getAvailability, removeAvailability } from "../../services/firebase/availability.service";

// Constants
import { APPOINTMENT_STATUS, STATUS_GROUPS, isStatusInGroup } from "../../constants/appointmentStatus";

// Utils
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { sortAppointments } from "../../utils/filters/appointmentFilters";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";
import formatDate from "../../utils/formatter/formatDate";
import { hasAppointmentConflict } from "../../utils/appointments/hasConflict";
import { getAgendaStats, getActiveAppointments, getOccupancyRate } from "../../utils/appointments/appointmentMetrics";
import { canChangeAppointmentStatus, getLockedAppointmentIds } from "../../utils/appointments/lockedAppointments";
import { getFreeSlotTimesForDate } from "../../utils/availability/availabilityMetrics";
import { combineSlotTimes } from "../../utils/availability/slotUtils";
import { generateWhatsappLink } from "../../utils/whatsapp/generateWhatsappLink";
import { logError, logWarning } from "../../utils/logger/logger";

export default function useAgenda(currentDate) {
  const user = auth.currentUser;

  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [referenceNames, setReferenceNames] = useState({});
  const [patientStatus, setPatientStatus] = useState({});
  const [whatsappConfig, setWhatsappConfig] = useState(null);
  const [lockedAppointments, setLockedAppointments] = useState(new Set());
  const [availability, setAvailability] = useState([]);

  const hasUnsavedChanges = useRef(false);
  const currentDateStr = formatDateToQuery(currentDate);

  // ------------------------------
  // Buscar config do médico
  // ------------------------------
  useEffect(() => {
    if (!user) return;

    const fetchDoctorConfig = async () => {
      const snap = await getDoc(doc(db, "doctors", user.uid));
      if (snap.exists()) {
        setWhatsappConfig(
          snap.data().whatsappConfig || {
            intro: "Olá",
            body: "Sua sessão está agendada",
            footer: "",
            showValue: false,
          }
        );
      }
    };

    fetchDoctorConfig();
  }, [user]);

  // ------------------------------
  // Buscar availability
  // ------------------------------
  useEffect(() => {
    if (!user) return;

    const fetchAvailability = async () => {
      try {
        const result = await getAvailability(user.uid);
        if (result.success) {
          setAvailability(result.data || []);
        }
      } catch (err) {
        logError("Erro ao buscar disponibilidade:", err);
      }
    };

    fetchAvailability();
  }, [user]);

  // ------------------------------
  // Buscar agendamentos
  // ------------------------------
  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid),
          where("date", "==", currentDateStr)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const sorted = sortAppointments(data);
        setAppointments(sorted);

        const initialStatus = {};
        data.forEach((a) => {
          initialStatus[a.id] = a.status || APPOINTMENT_STATUS.PENDING;
        });
        setStatusUpdates(initialStatus);
        hasUnsavedChanges.current = false;

        identifyLockedAppointments(data);

        await loadPatientData(data);
      } catch (err) {
        logError("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  const identifyLockedAppointments = (appointmentsList) => {
    setLockedAppointments(getLockedAppointmentIds(appointmentsList));
  };

  // ------------------------------
  // Carregar dados dos pacientes
  // ------------------------------
  const loadPatientData = async (appointmentsList) => {
    const names = {};
    const status = {};

    await Promise.all(
      appointmentsList.map(async (appt) => {
        try {
          const cleanNumber = cleanWhatsapp(appt.patientWhatsapp);
          const result = await PatientService.getPatient(user.uid, cleanNumber);

          if (result.success) {
            names[appt.id] =
              result.data.referenceName || result.data.name || appt.patientName;
            status[appt.id] = "existing";
          } else {
            names[appt.id] = appt.patientName;
            status[appt.id] = "new";
          }
        } catch (error) {
          logError("Erro ao buscar dados do paciente:", error);
          names[appt.id] = appt.patientName;
          status[appt.id] = "new";
        }
      })
    );

    setReferenceNames(names);
    setPatientStatus(status);
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

  // ------------------------------
  // Adicionar paciente
  // ------------------------------
  const handleAddPatient = async (appt) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const cleanNumber = cleanWhatsapp(appt.patientWhatsapp);

      const result = await PatientService.createPatient(user.uid, {
        name: appt.patientName || "Paciente",
        referenceName: appt.patientName || "",
        whatsapp: cleanNumber,
        price: appt.value || 0,
        status: "active",
      });

      if (!result.success) throw new Error(result.error);

      setPatientStatus((prev) => ({ ...prev, [appt.id]: "existing" }));
      return result;
    } catch (err) {
      logError("Erro ao adicionar paciente:", err);
      return { success: false, error: err.message };
    }
  };

  // ------------------------------
  // Enviar WhatsApp
  // ------------------------------
  const handleSendWhatsapp = (appt) => {
    if (!whatsappConfig) return;

    const { intro, body, footer, showValue } = whatsappConfig;

    // Usa o nome preferencial (referenceName) se disponível, senão usa o nome do appointment
    const patientDisplayName = referenceNames[appt.id] || appt.patientName;

    let message = `${intro || "Olá"} ${patientDisplayName},\n\n${body || "Sua sessão está agendada"}\n\nData: ${formatDate(appt.date)}\nHorário: ${appt.time}`;

    if (showValue && appt.value) {
      message += `\nValor: R$ ${appt.value}`;
    }

    if (footer) {
      // Adiciona quebra de linha antes do footer
      // Se não houver valor, adiciona apenas uma quebra de linha
      const hasValue = showValue && appt.value;
      message += hasValue ? `\n\n${footer}` : `\n${footer}`;
    }

    const url = generateWhatsappLink(appt.patientWhatsapp, message.trim());
    window.open(url, "whatsappWindow");

    // Atualiza status para "Msg enviada" automaticamente
    handleStatusChange(appt.id, APPOINTMENT_STATUS.MESSAGE_SENT);
  };

  // ------------------------------
  // Remover slot livre
  // ------------------------------
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
      const availabilityResult = await getAvailability(user.uid);
      if (availabilityResult.success) {
        setAvailability(availabilityResult.data || []);
      }

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

  // ✅ CORRIGIDO: Calcula totalSlots igual ao DayManagement (combina slots + appointments ativos)
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