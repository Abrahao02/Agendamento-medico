import { useState, useEffect } from "react";
import { PatientService, AppointmentService } from "../../services/firebase";
import { formatWhatsapp } from "../../utils/formatter/formatWhatsapp";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";
import { validateWhatsappLength } from "../../utils/whatsapp/validateWhatsappLength";
import { validateFormField } from "../../utils/validators/formValidation";
import { calculatePatientStats } from "../../utils/patients/calculatePatientStats";

/**
 * Hook para gerenciar pacientes e suas consultas
 * @param {Object} user - Usuário autenticado do Firebase
 * @returns {Object} Estado e funções para gerenciar pacientes
 */
export function usePatients(user) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const [patients, setPatients] = useState({});
  const [appointments, setAppointments] = useState([]);

  const [newPatient, setNewPatient] = useState({
    name: "",
    referenceName: "",
    whatsapp: "",
    price: 0,
  });

  const [error, setError] = useState("");

  // Estado de edição por paciente
  const [editingPatients, setEditingPatients] = useState({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const apptsResult = await AppointmentService.getAppointmentsByDoctor(user.uid);
        const appointmentsData = apptsResult.success ? apptsResult.data : [];
        setAppointments(appointmentsData);

        const patientsResult = await PatientService.getPatients(user.uid);
        if (patientsResult.success) {
          const patientsMap = {};
          patientsResult.data.forEach((patient) => {
            const stats = calculatePatientStats(appointmentsData, patient.whatsapp);
            patientsMap[patient.whatsapp] = {
              id: patient.id,
              name: patient.name,
              referenceName: patient.referenceName || "",
              whatsapp: patient.whatsapp,
              price: patient.price || 0,
              totalConsultas: stats.total,
              confirmed: stats.confirmed,
              pending: stats.pending,
              noShow: stats.noShow,
            };
          });
          setPatients(patientsMap);
        }
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const updateNewPatientField = (field, value) => {
    setNewPatient((prev) => ({ ...prev, [field]: value }));
  };

  const handleWhatsappChange = (value) => {
    const formatted = formatWhatsapp(value);
    updateNewPatientField("whatsapp", formatted);
  };

  const isWhatsappDuplicate = (formattedWhatsapp) => {
    const numbers = cleanWhatsapp(formattedWhatsapp);
    return patients[numbers] !== undefined;
  };

  const updatePatientPrice = (whatsapp, value) => {
    setPatients((prev) => ({
      ...prev,
      [whatsapp]: { ...prev[whatsapp], price: Number(value) || 0 },
    }));
  };

  const updatePatientReferenceName = (whatsapp, value) => {
    setPatients((prev) => ({
      ...prev,
      [whatsapp]: { ...prev[whatsapp], referenceName: value },
    }));
  };

  const savePatient = async (patient) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };
    setSaving(patient.whatsapp);

    try {
      const result = await PatientService.updatePatient(user.uid, patient.whatsapp, {
        name: patient.name,
        referenceName: patient.referenceName || "",
        price: patient.price,
      });

      // Desabilita edição ao salvar
      disableEditPatient(patient.whatsapp);

      return result;
    } catch (err) {
      console.error("Erro ao salvar paciente:", err);
      return { success: false, error: err.message };
    } finally {
      setSaving(null);
    }
  };

  const addPatient = async () => {
    if (!user) return { success: false, error: "Usuário não autenticado" };
    setError("");

    const nameValidation = validateFormField("name", newPatient.name, { required: true });
    if (!nameValidation.valid) {
      setError(nameValidation.error);
      return { success: false, error: nameValidation.error };
    }

    const name = newPatient.name.trim();
    const referenceName = newPatient.referenceName.trim();
    const price = Number(newPatient.price || 0);

    const cleanedWhatsapp = cleanWhatsapp(newPatient.whatsapp);
    const whatsappValidation = validateWhatsappLength(cleanedWhatsapp);
    if (!whatsappValidation.valid) {
      setError(whatsappValidation.message);
      return { success: false, error: whatsappValidation.message };
    }

    if (isWhatsappDuplicate(newPatient.whatsapp)) {
      setError("WhatsApp já cadastrado.");
      return { success: false, error: "WhatsApp duplicado" };
    }

    try {
      const result = await PatientService.createPatient(user.uid, {
        name,
        referenceName,
        whatsapp: cleanedWhatsapp,
        price,
        status: "active",
      });

      if (result.success) {
        setPatients((prev) => ({
          ...prev,
          [cleanedWhatsapp]: {
            id: result.id,
            name,
            referenceName,
            whatsapp: cleanedWhatsapp,
            price,
            totalConsultas: 0,
            confirmed: 0,
            pending: 0,
            noShow: 0,
          },
        }));

        setNewPatient({ name: "", referenceName: "", whatsapp: "", price: 0 });
        setError("");
      }

      return result;
    } catch (err) {
      console.error("Erro ao adicionar paciente:", err);
      setError("Erro ao cadastrar paciente.");
      return { success: false, error: err.message };
    }
  };

  // Edição de paciente
  const enableEditPatient = (whatsapp) => {
    setEditingPatients((prev) => ({ ...prev, [whatsapp]: true }));
  };
  const disableEditPatient = (whatsapp) => {
    setEditingPatients((prev) => ({ ...prev, [whatsapp]: false }));
  };

  const getPatientsList = () => Object.values(patients).sort((a, b) => a.name.localeCompare(b.name));
  const formatWhatsappDisplay = (whatsapp) => formatWhatsapp(whatsapp);

  return {
    loading,
    saving,
    patients,
    appointments,
    newPatient,
    error,
    editingPatients,
    patientsList: getPatientsList(),
    patientsCount: Object.keys(patients).length,
    updateNewPatientField,
    handleWhatsappChange,
    isWhatsappDuplicate,
    updatePatientPrice,
    updatePatientReferenceName,
    savePatient,
    addPatient,
    enableEditPatient,
    disableEditPatient,
    formatWhatsappDisplay,
    setError,
  };
}
