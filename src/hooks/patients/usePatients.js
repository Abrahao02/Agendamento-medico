// ============================================
// 📁 src/hooks/usePatients.js - REFATORADO
// ============================================
import { useState, useEffect } from "react";
import { PatientService, AppointmentService } from "../../services/firebase";

// ✅ Imports de utils
import { formatWhatsapp } from "../../utils/formatter/formatWhatsapp";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";
import { validateWhatsappLength } from "../../utils/whatsapp/validateWhatsappLength";
import { generatePatientId } from "../../utils/patients/generatePatientId";
import { calculatePatientStats } from "../../utils/patients/calculatePatientStats";
import { validateFormField } from "../../utils/validators/formValidation";

/**
 * Hook para gerenciar pacientes e suas consultas
 * @param {Object} user - Usuário autenticado do Firebase
 * @returns {Object} Estado e funções para gerenciar pacientes
 */
export function usePatients(user) {
  // 🔄 Estados de loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  // 📊 Dados
  const [patients, setPatients] = useState({});
  const [appointments, setAppointments] = useState([]);

  // 📝 Formulário de novo paciente
  const [newPatient, setNewPatient] = useState({
    name: "",
    referenceName: "",
    whatsapp: "",
    price: "",
  });
  const [error, setError] = useState("");

  // 📥 Carregar dados iniciais
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        // 1. Buscar appointments
        const apptsResult = await AppointmentService.getAppointmentsByDoctor(
          user.uid
        );
        const appointmentsData = apptsResult.success ? apptsResult.data : [];
        setAppointments(appointmentsData);

        // 2. Buscar pacientes
        const patientsResult = await PatientService.getPatients(user.uid);

        if (patientsResult.success) {
          // Criar mapa de pacientes
          const patientsMap = {};

          patientsResult.data.forEach((patient) => {
            // ✅ Usa util para calcular estatísticas do paciente
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
              totalValue: stats.totalValue,
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

  // 🔄 Atualizar campo do novo paciente
  const updateNewPatientField = (field, value) => {
    setNewPatient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ 📱 Handler de WhatsApp - USA UTIL
  const handleWhatsappChange = (value) => {
    const formatted = formatWhatsapp(value);
    updateNewPatientField("whatsapp", formatted);
  };

  // ✅ Verificar se WhatsApp já existe - USA UTIL
  const isWhatsappDuplicate = (formattedWhatsapp) => {
    const numbers = cleanWhatsapp(formattedWhatsapp);
    return patients[numbers] !== undefined;
  };

  // 💰 Atualizar preço de paciente existente
  const updatePatientPrice = (whatsapp, value) => {
    setPatients((prev) => ({
      ...prev,
      [whatsapp]: {
        ...prev[whatsapp],
        price: Number(value) || 0,
      },
    }));
  };

  // 🏷️ Atualizar nome de referência
  const updatePatientReferenceName = (whatsapp, value) => {
    setPatients((prev) => ({
      ...prev,
      [whatsapp]: {
        ...prev[whatsapp],
        referenceName: value,
      },
    }));
  };

  // 💾 Salvar paciente existente
  const savePatient = async (patient) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    setSaving(patient.whatsapp);

    try {
      const result = await PatientService.updatePatient(
        user.uid,
        patient.whatsapp,
        {
          name: patient.name,
          referenceName: patient.referenceName || "",
          price: patient.price,
        }
      );

      return result;
    } catch (err) {
      console.error("Erro ao salvar paciente:", err);
      return { success: false, error: err.message };
    } finally {
      setSaving(null);
    }
  };

  // ✅ ➕ Adicionar novo paciente - USA UTILS
  const addPatient = async () => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    setError("");

    // ✅ Validação usando util
    const nameValidation = validateFormField("name", newPatient.name, { required: true });
    if (!nameValidation.valid) {
      setError(nameValidation.error);
      return { success: false, error: nameValidation.error };
    }

    const name = newPatient.name.trim();
    const referenceName = newPatient.referenceName.trim();
    const price = Number(newPatient.price || 0);

    // ✅ Limpa e valida WhatsApp usando utils
    const cleanedWhatsapp = cleanWhatsapp(newPatient.whatsapp);
    const whatsappValidation = validateWhatsappLength(cleanedWhatsapp);

    if (!whatsappValidation.valid) {
      setError(whatsappValidation.message);
      return { success: false, error: whatsappValidation.message };
    }

    // ✅ Verifica duplicação
    if (isWhatsappDuplicate(newPatient.whatsapp)) {
      setError("WhatsApp já cadastrado.");
      return { success: false, error: "WhatsApp duplicado" };
    }

    // Valida preço
    if (isNaN(price) || price < 0) {
      setError("Preço inválido.");
      return { success: false, error: "Preço inválido" };
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
        // Atualizar estado local
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
            totalValue: 0,
          },
        }));

        // Limpar formulário
        setNewPatient({ name: "", referenceName: "", whatsapp: "", price: "" });
        setError("");
      }

      return result;
    } catch (err) {
      console.error("Erro ao adicionar paciente:", err);
      setError("Erro ao cadastrar paciente.");
      return { success: false, error: err.message };
    }
  };

  // 📊 Obter lista ordenada de pacientes
  const getPatientsList = () => {
    return Object.values(patients).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  // ✅ 📱 Formatar WhatsApp para exibição - USA UTIL
  const formatWhatsappDisplay = (whatsapp) => {
    return formatWhatsapp(whatsapp);
  };

  return {
    // Estados
    loading,
    saving,
    patients,
    appointments,
    newPatient,
    error,

    // Listas computadas
    patientsList: getPatientsList(),
    patientsCount: Object.keys(patients).length,

    // Funções de formulário
    updateNewPatientField,
    handleWhatsappChange,
    isWhatsappDuplicate,
    setError,

    // Funções de edição
    updatePatientPrice,
    updatePatientReferenceName,

    // Funções de CRUD
    savePatient,
    addPatient,

    // Helpers
    formatWhatsappDisplay,
  };
}