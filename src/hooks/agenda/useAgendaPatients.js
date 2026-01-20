// ============================================
// 📁 src/hooks/agenda/useAgendaPatients.js
// Responsabilidade: Gerenciamento de pacientes
// ============================================

import { useState } from "react";
import { auth } from "../../services/firebase/config";
import * as PatientService from "../../services/firebase/patients.service";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";
import { logError } from "../../utils/logger/logger";

export const useAgendaPatients = () => {
  const user = auth.currentUser;
  const [referenceNames, setReferenceNames] = useState({});
  const [patientStatus, setPatientStatus] = useState({});

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

  return {
    referenceNames,
    patientStatus,
    loadPatientData,
    handleAddPatient,
  };
};
