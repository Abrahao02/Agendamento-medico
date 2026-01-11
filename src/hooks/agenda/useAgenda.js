import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";

// Services
import * as PatientService from "../../services/firebase/patients.service";

// Constants
import { APPOINTMENT_STATUS, STATUS_GROUPS } from "../../constants/appointmentStatus";

// Utils
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { sortAppointments } from "../../utils/filters/appointmentFilters";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";
import formatDate from "../../utils/formatter/formatDate";

// 📱 Formata WhatsApp padrão BR
const formatWhatsappNumber = (number) => {
  let clean = number.replace(/\D/g, "");
  if (!clean.startsWith("55")) clean = "55" + clean;
  return clean;
};

export default function useAgenda(currentDate) {
  const user = auth.currentUser;

  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [referenceNames, setReferenceNames] = useState({});
  const [patientStatus, setPatientStatus] = useState({});
  const [whatsappConfig, setWhatsappConfig] = useState(null);
  const [lockedAppointments, setLockedAppointments] = useState(new Set()); // ✅ NOVO

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

        // ✅ NOVO: Identifica appointments que não podem mais mudar de status
        identifyLockedAppointments(data);

        await loadPatientData(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  // ✅ NOVA FUNÇÃO: Identifica appointments bloqueados
  const identifyLockedAppointments = (appointmentsList) => {
    const locked = new Set();

    // Para cada appointment cancelado, verifica se o horário foi reagendado
    appointmentsList.forEach((appt) => {
      if (!STATUS_GROUPS.ACTIVE.includes(appt.status)) {
        // É cancelado ou não compareceu
        
        // Busca se existe outro appointment ATIVO no mesmo horário
        const hasActiveInSameSlot = appointmentsList.some(
          other => 
            other.id !== appt.id &&
            other.time === appt.time &&
            STATUS_GROUPS.ACTIVE.includes(other.status)
        );

        if (hasActiveInSameSlot) {
          // Horário foi reagendado → Bloqueia o cancelado
          locked.add(appt.id);
        }
      }
    });

    setLockedAppointments(locked);
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
        } catch {
          names[appt.id] = appt.patientName;
          status[appt.id] = "new";
        }
      })
    );

    setReferenceNames(names);
    setPatientStatus(status);
  };

  // ------------------------------
  // ✅ ATUALIZADO: Atualizar status com validação
  // ------------------------------
  const handleStatusChange = async (id, value) => {
    // ❌ Bloqueia se o appointment está travado
    if (lockedAppointments.has(id)) {
      console.warn("⚠️ Este agendamento não pode ter o status alterado pois o horário já foi reagendado");
      return {
        success: false,
        error: "Horário já foi reagendado. Status não pode ser alterado."
      };
    }

    const currentAppointment = appointments.find(a => a.id === id);
    
    // ✅ Se está mudando PARA cancelado/não compareceu, verifica conflito
    if (!STATUS_GROUPS.ACTIVE.includes(value)) {
      const hasActiveInSameSlot = appointments.some(
        other => 
          other.id !== id &&
          other.time === currentAppointment.time &&
          STATUS_GROUPS.ACTIVE.includes(other.status)
      );

      if (hasActiveInSameSlot) {
        console.warn("⚠️ Não é possível cancelar: horário já foi reagendado");
        return {
          success: false,
          error: "Este horário já foi reagendado. Não é possível cancelar."
        };
      }
    }

    // ✅ Atualização permitida
    setStatusUpdates((prev) => ({ ...prev, [id]: value }));
    hasUnsavedChanges.current = true;

    try {
      await updateDoc(doc(db, "appointments", id), { status: value });
      
      setAppointments((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, status: value } : a));
        
        // ✅ Recalcula appointments bloqueados após atualização
        identifyLockedAppointments(updated);
        
        return updated;
      });

      return { success: true };
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      return { success: false, error: err.message };
    }
  };

  // ------------------------------
  // ✅ NOVA FUNÇÃO: Verifica se appointment está bloqueado
  // ------------------------------
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
      console.error("Erro ao adicionar paciente:", err);
      return { success: false, error: err.message };
    }
  };

  // ------------------------------
  // Enviar WhatsApp
  // ------------------------------
  const handleSendWhatsapp = (appt) => {
    if (!whatsappConfig) return;

    const { intro, body, footer, showValue } = whatsappConfig;

    let message = `${intro || "Olá"} ${appt.patientName},

${body || "Sua sessão está agendada"}

Data: ${formatDate(appt.date)}
Horário: ${appt.time}`;

    if (showValue && appt.value) {
      message += `\nValor: R$ ${appt.value}`;
    }

    if (footer) {
      message += `\n\n${footer}`;
    }

    const phone = formatWhatsappNumber(appt.patientWhatsapp);

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message.trim())}`,
      "whatsappWindow"
    );

    // Atualiza status para "Msg enviada" automaticamente
    handleStatusChange(appt.id, APPOINTMENT_STATUS.MESSAGE_SENT);
  };

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
    isAppointmentLocked,
  };
}