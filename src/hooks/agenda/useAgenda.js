import { useState, useEffect, useRef } from "react";
import { db } from "../../services/firebase/config";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function useAgenda(user, currentDate) {
  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [referenceNames, setReferenceNames] = useState({});
  const [patientStatus, setPatientStatus] = useState({});
  const hasUnsavedChanges = useRef(false);

  const formatDateForQuery = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentDateStr = formatDateForQuery(currentDate);

  // 🔹 Busca agendamentos
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
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => a.time.localeCompare(b.time));
        setAppointments(data);

        // Status inicial
        const initialStatus = {};
        data.forEach(a => initialStatus[a.id] = a.status || "Pendente");
        setStatusUpdates(initialStatus);
        hasUnsavedChanges.current = false;

        // 🔹 Paciente novo ou existente
        const names = {};
        const status = {};
        await Promise.all(
          data.map(async (appt) => {
            try {
              const cleanNumber = appt.patientWhatsapp.replace(/\D/g, "");
              const patientId = `${user.uid}_${cleanNumber}`;
              const snap = await getDoc(doc(db, "patients", patientId));
              if (snap.exists()) {
                names[appt.id] = snap.data().referenceName || appt.patientName;
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

      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
      }
    };

    fetchAppointments();
  }, [user, currentDateStr]);

  const handleStatusChange = async (id, value) => {
    setStatusUpdates(prev => ({ ...prev, [id]: value }));
    hasUnsavedChanges.current = true;
    try {
      await updateDoc(doc(db, "appointments", id), { status: value });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: value } : a));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleAddPatient = async (appt) => {
    try {
      const cleanNumber = appt.patientWhatsapp.replace(/\D/g, "");
      const patientId = `${user.uid}_${cleanNumber}`;

      // Preencher campos extras
      await setDoc(doc(db, "patients", patientId), {
        name: appt.patientName || appt.referenceName || "Paciente",
        referenceName: appt.patientName || appt.referenceName || "Paciente",
        whatsapp: appt.patientWhatsapp,
        doctorId: user.uid,
        price: appt.value || 0, // se tiver um valor definido no agendamento
        createdAt: new Date()
      });

      setPatientStatus(prev => ({ ...prev, [appt.id]: "existing" }));
      alert("✅ Paciente adicionado com sucesso!");
    } catch (err) {
      console.error("Erro ao adicionar paciente:", err);
      alert("❌ Erro ao adicionar paciente!");
    }
  };

  return {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    hasUnsavedChanges,
    handleStatusChange,
    handleAddPatient
  };
}
