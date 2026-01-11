import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";

// Services
import * as PatientService from "../../services/firebase/patients.service";

// Constants
import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";

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
          // Usa status padrão se não existir
          initialStatus[a.id] = a.status || APPOINTMENT_STATUS.PENDING;
        });
        setStatusUpdates(initialStatus);
        hasUnsavedChanges.current = false;

        await loadPatientData(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

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
  // Atualizar status
  // ------------------------------
  const handleStatusChange = async (id, value) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: value }));
    hasUnsavedChanges.current = true;

    try {
      await updateDoc(doc(db, "appointments", id), { status: value });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: value } : a))
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
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
    handleStatusChange,
    handleAddPatient,
    handleSendWhatsapp,
  };
}