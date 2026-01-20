import { useState, useEffect, useRef } from "react";
import { PatientService, AppointmentService } from "../../services/firebase";
import { subscribeToPatients } from "../../services/firebase/patients.service";
import { formatWhatsapp } from "../../utils/formatter/formatWhatsapp";
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";
import { validateWhatsappLength } from "../../utils/whatsapp/validateWhatsappLength";
import { validateFormField } from "../../utils/validators/formValidation";
import { calculatePatientStats } from "../../utils/patients/calculatePatientStats";
import { logError } from "../../utils/logger/logger";

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
  
  // Referência para o unsubscribe do listener
  const unsubscribeRef = useRef(null);
  
  // Carregar consultas uma vez e manter atualizadas
  useEffect(() => {
    if (!user) {
      setAppointments([]);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const appointmentsResult = await AppointmentService.getAppointmentsByDoctor(user.uid);
        const appointmentsData = appointmentsResult.success ? appointmentsResult.data : [];
        setAppointments(appointmentsData);
      } catch (err) {
        logError("Erro ao carregar consultas:", err);
      }
    };

    fetchAppointments();
  }, [user]);

  // Listener em tempo real para pacientes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setPatients({});
      return;
    }

    setLoading(true);

    // Limpar listener anterior se existir
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Configurar listener em tempo real
    const unsubscribe = subscribeToPatients(user.uid, (patientsResult) => {
      if (patientsResult.success) {
        // Usar o estado appointments já existente em vez de buscar novamente
        setPatients((prevPatients) => {
          const patientsMap = {};
          
          patientsResult.data.forEach((patient) => {
            const stats = calculatePatientStats(appointments, patient.whatsapp);
            const prevPatient = prevPatients[patient.whatsapp];
            const isEditing = editingPatients[patient.whatsapp];
            
            // Se está editando, preservar alterações locais (exceto se não existir no estado anterior)
            if (isEditing && prevPatient) {
              patientsMap[patient.whatsapp] = {
                ...prevPatient,
                id: patient.id,
                totalConsultas: stats.total,
                confirmed: stats.confirmed,
                pending: stats.pending,
                noShow: stats.noShow,
              };
            } else {
              // Se não está editando, sempre aplicar dados do Firestore
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
            }
          });
          return patientsMap;
        });
        setLoading(false);
      } else {
        logError("Erro no listener de pacientes:", patientsResult.error);
        setLoading(false);
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup: desinscrever quando o componente desmontar ou user mudar
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user, appointments, editingPatients]);

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

  const updatePatientName = (whatsapp, value) => {
    setPatients((prev) => ({
      ...prev,
      [whatsapp]: { ...prev[whatsapp], name: value },
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

      // O listener em tempo real irá atualizar automaticamente os dados
      // Não precisamos atualizar manualmente o estado aqui

      return result;
    } catch (err) {
      logError("Erro ao salvar paciente:", err);
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
      logError("Erro ao adicionar paciente:", err);
      setError("Erro ao cadastrar paciente.");
      return { success: false, error: err.message };
    }
  };

  // Edição de paciente
  const enableEditPatient = (whatsapp) => {
    setEditingPatients((prev) => ({ ...prev, [whatsapp]: true }));
  };
  
  const disableEditPatient = (whatsapp) => {
    setEditingPatients((prev) => {
      const newState = { ...prev };
      delete newState[whatsapp];
      return newState;
    });
    
    // Forçar atualização dos dados do Firestore ao cancelar edição
    // Recarregar dados do paciente específico para garantir sincronização
    if (user) {
      PatientService.getPatient(user.uid, whatsapp)
        .then((result) => {
          if (result.success) {
            AppointmentService.getAppointmentsByDoctor(user.uid)
              .then((apptsResult) => {
                const appointmentsData = apptsResult.success ? apptsResult.data : [];
                const stats = calculatePatientStats(appointmentsData, whatsapp);
                
                setPatients((prevPatients) => {
                  const updatedPatients = { ...prevPatients };
                  updatedPatients[whatsapp] = {
                    id: result.data.id,
                    name: result.data.name,
                    referenceName: result.data.referenceName || "",
                    whatsapp: result.data.whatsapp,
                    price: result.data.price || 0,
                    totalConsultas: stats.total,
                    confirmed: stats.confirmed,
                    pending: stats.pending,
                    noShow: stats.noShow,
                  };
                  return updatedPatients;
                });
              })
              .catch((err) => {
                logError("Erro ao recarregar dados ao cancelar edição:", err);
              });
          }
        })
        .catch((err) => {
          logError("Erro ao recarregar paciente ao cancelar edição:", err);
        });
    }
  };

  // Função para forçar refresh manual dos dados
  const refreshPatients = async () => {
    if (!user) return;
    
    try {
      const patientsResult = await PatientService.getPatients(user.uid);
      if (patientsResult.success) {
        const appointmentsResult = await AppointmentService.getAppointmentsByDoctor(user.uid);
        const appointmentsData = appointmentsResult.success ? appointmentsResult.data : [];
        
        setPatients((prevPatients) => {
          const patientsMap = {};
          
          patientsResult.data.forEach((patient) => {
            const stats = calculatePatientStats(appointmentsData, patient.whatsapp);
            const prevPatient = prevPatients[patient.whatsapp];
            const isEditing = editingPatients[patient.whatsapp];
            
            if (isEditing && prevPatient) {
              patientsMap[patient.whatsapp] = {
                ...prevPatient,
                id: patient.id,
                totalConsultas: stats.total,
                confirmed: stats.confirmed,
                pending: stats.pending,
                noShow: stats.noShow,
              };
            } else {
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
            }
          });
          return patientsMap;
        });
      }
    } catch (err) {
      logError("Erro ao forçar refresh de pacientes:", err);
    }
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
    updatePatientName,
    savePatient,
    addPatient,
    enableEditPatient,
    disableEditPatient,
    formatWhatsappDisplay,
    setError,
    refreshPatients,
  };
}
