// ============================================
// 📁 src/hooks/useAgenda.js 
// ============================================
import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase/config";

// ✅ Services
import * as PatientService from "../../services/firebase/patients.service";

// ✅ Utils
import { formatDateToQuery } from "../../utils/filters/dateFilters";
import { sortAppointments } from "../../utils/filters/appointmentFilters";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";

export default function useAgenda(user, currentDate) {
  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [referenceNames, setReferenceNames] = useState({});
  const [patientStatus, setPatientStatus] = useState({});
  const hasUnsavedChanges = useRef(false);

  const currentDateStr = formatDateToQuery(currentDate);

  /* ==============================
     🔄 BUSCAR AGENDAMENTOS
  ============================== */
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
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const sorted = sortAppointments(data);
        setAppointments(sorted);

        // Status inicial
        const initialStatus = {};
        data.forEach((a) => {
          initialStatus[a.id] = a.status || "Pendente";
        });
        setStatusUpdates(initialStatus);
        hasUnsavedChanges.current = false;

        // Carregar dados dos pacientes
        await loadPatientData(data);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  /* ==============================
     👤 CARREGAR DADOS DOS PACIENTES
  ============================== */
  const loadPatientData = async (appointmentsList) => {
    const names = {};
    const status = {};

    await Promise.all(
      appointmentsList.map(async (appt) => {
        try {
          const cleanNumber = cleanWhatsapp(appt.patientWhatsapp);

          const result = await PatientService.getPatient(
            user.uid,
            cleanNumber
          );

          if (result.success) {
            names[appt.id] =
              result.data.referenceName ||
              result.data.name ||
              appt.patientName;

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

  /* ==============================
     🔁 ATUALIZAR STATUS CONSULTA
  ============================== */
  const handleStatusChange = async (id, value) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: value }));
    hasUnsavedChanges.current = true;

    try {
      await updateDoc(doc(db, "appointments", id), {
        status: value,
      });

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: value } : a
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  /* ==============================
     ➕ ADICIONAR PACIENTE
  ============================== */
  const handleAddPatient = async (appt) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      const cleanNumber = cleanWhatsapp(appt.patientWhatsapp);

      const result = await PatientService.createPatient(user.uid, {
        name: appt.patientName || "Paciente",
        referenceName: appt.patientName || "",
        whatsapp: cleanNumber,
        price: appt.value || 0,
        status: "active",
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setPatientStatus((prev) => ({
        ...prev,
        [appt.id]: "existing",
      }));

      return result;
    } catch (err) {
      console.error("Erro ao adicionar paciente:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    hasUnsavedChanges,
    handleStatusChange,
    handleAddPatient,
  };
}
