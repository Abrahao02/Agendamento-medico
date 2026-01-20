// ============================================
// 📁 src/hooks/agenda/useAgendaData.js
// Responsabilidade: Fetch de appointments, availability e whatsapp config
// ============================================

import { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAvailability } from "../../services/firebase/availability.service";
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { sortAppointments } from "../../utils/filters/appointmentFilters";
import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { logError } from "../../utils/logger/logger";

export const useAgendaData = (currentDate) => {
  const user = auth.currentUser;
  const currentDateStr = formatDateToQuery(currentDate);

  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [whatsappConfig, setWhatsappConfig] = useState(null);

  // Buscar config do médico
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

  // Buscar availability
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

  // Buscar agendamentos
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
      } catch (err) {
        logError("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  const refreshAvailability = async () => {
    if (!user) return;
    try {
      const result = await getAvailability(user.uid);
      if (result.success) {
        setAvailability(result.data || []);
      }
    } catch (err) {
      logError("Erro ao atualizar disponibilidade:", err);
    }
  };

  return {
    appointments,
    setAppointments,
    availability,
    setAvailability,
    whatsappConfig,
    refreshAvailability,
  };
};
