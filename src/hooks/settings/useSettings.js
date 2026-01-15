import { useState, useEffect, useMemo, useRef } from "react";
import * as DoctorService from "../../services/firebase/doctors.service";
import { generateWhatsappMessage } from "../../utils/message/generateWhatsappMessage";
import { useCancelSubscription } from "../stripe/useCancelSubscription";
import { useReactivateSubscription } from "../stripe/useReactivateSubscription";
import { modeToSelection, selectionToMode, APPOINTMENT_TYPE_SELECTION } from "../../constants/appointmentType";
import { logError } from "../../utils/logger/logger";
import { useToast } from "../../components/common/Toast";

export function useSettings(user) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationValue, setNewLocationValue] = useState("");
  
  // Store initial saved state for comparison
  const savedStateRef = useRef({
    whatsappConfig: null,
    publicScheduleConfig: null,
    appointmentTypeConfig: null,
  });
  
  // Subscription hooks
  const { handleCancel, loading: cancelLoading, error: cancelError } = useCancelSubscription();
  const { handleReactivate, loading: reactivateLoading, error: reactivateError } = useReactivateSubscription();
  const [whatsappConfig, setWhatsappConfig] = useState({
    intro: "Olá",
    body: "Sua sessão está agendada",
    footer:
      "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!",
    showValue: true,
  });

  const [publicScheduleConfig, setPublicScheduleConfig] = useState({
    period: "all_future",
    showPrice: true,
  });

  const [appointmentTypeConfig, setAppointmentTypeConfig] = useState({
    selection: APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY,
    mode: "disabled",
    fixedType: "online",
    defaultValueOnline: 0,
    defaultValuePresencial: 0,
    locations: [],
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      setLoading(true);

      try {
        const result = await DoctorService.getDoctor(user.uid);

        if (result.success) {
          const data = result.data;

          setDoctor(data);

          setWhatsappConfig({
            intro: data.whatsappConfig?.intro || "Olá",
            body: data.whatsappConfig?.body || "Sua sessão está agendada",
            footer: data.whatsappConfig?.footer ||
              "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!",
            showValue: data.whatsappConfig?.showValue ?? true,
          });

          setPublicScheduleConfig({
            period: data.publicScheduleConfig?.period || "all_future",
            showPrice: data.publicScheduleConfig?.showPrice ?? true,
          });

          // Converter mode + fixedType para selection (compatibilidade retroativa)
          const mode = data.appointmentTypeConfig?.mode || "disabled";
          const fixedType = data.appointmentTypeConfig?.fixedType || "online";
          const selection = data.appointmentTypeConfig?.selection || modeToSelection(mode, fixedType);

          setAppointmentTypeConfig({
            selection,
            mode: data.appointmentTypeConfig?.mode || "disabled",
            fixedType: data.appointmentTypeConfig?.fixedType || "online",
            defaultValueOnline: data.appointmentTypeConfig?.defaultValueOnline || 0,
            defaultValuePresencial: data.appointmentTypeConfig?.defaultValuePresencial || 0,
            locations: data.appointmentTypeConfig?.locations || [],
          });

          // Store saved state for comparison
          savedStateRef.current = {
            whatsappConfig: {
              intro: data.whatsappConfig?.intro || "Olá",
              body: data.whatsappConfig?.body || "Sua sessão está agendada",
              footer: data.whatsappConfig?.footer ||
                "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!",
              showValue: data.whatsappConfig?.showValue ?? true,
            },
            publicScheduleConfig: {
              period: data.publicScheduleConfig?.period || "all_future",
              showPrice: data.publicScheduleConfig?.showPrice ?? true,
            },
            appointmentTypeConfig: {
              selection: data.appointmentTypeConfig?.selection || modeToSelection(
                data.appointmentTypeConfig?.mode || "disabled",
                data.appointmentTypeConfig?.fixedType || "online"
              ),
              mode: data.appointmentTypeConfig?.mode || "disabled",
              fixedType: data.appointmentTypeConfig?.fixedType || "online",
              defaultValueOnline: data.appointmentTypeConfig?.defaultValueOnline || 0,
              defaultValuePresencial: data.appointmentTypeConfig?.defaultValuePresencial || 0,
              locations: data.appointmentTypeConfig?.locations || [],
            },
          };
        }
      } catch (error) {
        logError("Erro ao buscar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // 💾 Salvar configurações
  const saveSettings = async () => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      setSaving(true);

      // Converter selection para mode + fixedType antes de salvar (compatibilidade)
      const selection = appointmentTypeConfig.selection || APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY;
      const { mode, fixedType } = selectionToMode(selection);

      const newConfig = {
        whatsappConfig: {
          intro: whatsappConfig.intro,
          body: whatsappConfig.body,
          footer: whatsappConfig.footer,
          showValue: whatsappConfig.showValue,
        },
        publicScheduleConfig: {
          period: publicScheduleConfig.period,
          showPrice: publicScheduleConfig.showPrice ?? true,
        },
        appointmentTypeConfig: {
          selection, // Salvar novo campo
          mode, // Salvar para compatibilidade
          fixedType, // Salvar para compatibilidade
          defaultValueOnline: Number(appointmentTypeConfig.defaultValueOnline) || 0,
          defaultValuePresencial: Number(appointmentTypeConfig.defaultValuePresencial) || 0,
          locations: appointmentTypeConfig.locations || [],
        },
      };

      const result = await DoctorService.updateDoctor(user.uid, newConfig);

      // Update saved state after successful save
      if (result.success) {
        savedStateRef.current = {
          whatsappConfig: { ...newConfig.whatsappConfig },
          publicScheduleConfig: { ...newConfig.publicScheduleConfig },
          appointmentTypeConfig: { ...newConfig.appointmentTypeConfig },
        };
      }

      return result;
    } catch (error) {
      logError("Erro ao salvar configurações:", error);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const updateWhatsappField = (field, value) => {
    setWhatsappConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePublicScheduleField = (field, value) => {
    setPublicScheduleConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAppointmentTypeField = (field, value) => {
    setAppointmentTypeConfig((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Se selection foi alterado, converter para mode + fixedType automaticamente
      if (field === "selection") {
        const { mode, fixedType } = selectionToMode(value);
        updated.mode = mode;
        updated.fixedType = fixedType;
      }

      return updated;
    });
  };

  const addLocation = (location) => {
    setAppointmentTypeConfig((prev) => ({
      ...prev,
      locations: [...prev.locations, location],
    }));
  };

  const updateLocation = (index, location) => {
    setAppointmentTypeConfig((prev) => ({
      ...prev,
      locations: prev.locations.map((loc, i) => i === index ? location : loc),
    }));
  };

  const removeLocation = (index) => {
    setAppointmentTypeConfig((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const handleAddLocation = () => {
    if (newLocationName.trim() && newLocationValue) {
      addLocation({
        name: newLocationName.trim(),
        defaultValue: Number(newLocationValue) || 0,
      });
      setNewLocationName("");
      setNewLocationValue("");
    }
  };

  const handleCancelSubscription = async () => {
    if (confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso PRO até o final do período pago.')) {
      const result = await handleCancel();
      if (result.success) {
        toast.success('Assinatura cancelada com sucesso. Você continuará com acesso PRO até o final do período pago.');
        window.location.reload();
      } else {
        toast.error(`Erro ao cancelar: ${result.error || 'Tente novamente'}`);
      }
    }
  };

  const handleReactivateSubscription = async () => {
    if (confirm('Tem certeza que deseja reativar sua assinatura? Ela continuará sendo cobrada normalmente.')) {
      const result = await handleReactivate();
      if (result.success) {
        toast.success('Assinatura reativada com sucesso.');
        window.location.reload();
      } else {
        toast.error(`Erro ao reativar: ${result.error || 'Tente novamente'}`);
      }
    }
  };

  const handleUpdateLocation = (index, location) => {
    updateLocation(index, location);
  };

  const handleRemoveLocation = (index) => {
    removeLocation(index);
  };

  // Calcular data de término da assinatura
  const subscriptionEndDate = useMemo(() => {
    if (!doctor?.planUpdatedAt) return null;
    try {
      const startDate = doctor.planUpdatedAt?.toDate 
        ? doctor.planUpdatedAt.toDate() 
        : doctor.planUpdatedAt?.seconds 
        ? new Date(doctor.planUpdatedAt.seconds * 1000)
        : new Date(doctor.planUpdatedAt);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      return endDate;
    } catch (error) {
      logError('Erro ao calcular data:', error);
      return null;
    }
  }, [doctor?.planUpdatedAt]);

  const isPro = useMemo(() => {
    return doctor?.plan === "pro";
  }, [doctor?.plan]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!savedStateRef.current.whatsappConfig) return false;

    const saved = savedStateRef.current;
    
    // Compare WhatsApp config
    const whatsappChanged = 
      saved.whatsappConfig.intro !== whatsappConfig.intro ||
      saved.whatsappConfig.body !== whatsappConfig.body ||
      saved.whatsappConfig.footer !== whatsappConfig.footer ||
      saved.whatsappConfig.showValue !== whatsappConfig.showValue;

    // Compare public schedule config
    const publicScheduleChanged = 
      saved.publicScheduleConfig.period !== publicScheduleConfig.period ||
      (saved.publicScheduleConfig.showPrice ?? true) !== (publicScheduleConfig.showPrice ?? true);

    // Compare appointment type config
    const appointmentTypeChanged = 
      (saved.appointmentTypeConfig.selection || modeToSelection(saved.appointmentTypeConfig.mode, saved.appointmentTypeConfig.fixedType)) !== 
      (appointmentTypeConfig.selection || modeToSelection(appointmentTypeConfig.mode, appointmentTypeConfig.fixedType)) ||
      saved.appointmentTypeConfig.defaultValueOnline !== appointmentTypeConfig.defaultValueOnline ||
      saved.appointmentTypeConfig.defaultValuePresencial !== appointmentTypeConfig.defaultValuePresencial ||
      JSON.stringify(saved.appointmentTypeConfig.locations || []) !== JSON.stringify(appointmentTypeConfig.locations || []);

    return whatsappChanged || publicScheduleChanged || appointmentTypeChanged;
  }, [whatsappConfig, publicScheduleConfig, appointmentTypeConfig]);

  const generatePreview = (
    patientName = "João",
    date = "07/01/2026",
    time = "12:00"
  ) => {
    // Usa o valor configurado ou um valor padrão para demonstração
    const defaultValue = appointmentTypeConfig.defaultValueOnline || 
                        appointmentTypeConfig.defaultValuePresencial || 
                        150; // Valor padrão para preview
    return generateWhatsappMessage({
      intro: whatsappConfig.intro,
      body: whatsappConfig.body,
      footer: whatsappConfig.footer,
      patientName,
      date,
      time,
      value: defaultValue,
      showValue: whatsappConfig.showValue,
    });
  };

  return {
    loading,
    saving,
    doctor,
    isPro,
    whatsappConfig,
    publicScheduleConfig,
    appointmentTypeConfig,
    subscriptionEndDate,
    newLocationName,
    newLocationValue,
    cancelLoading,
    cancelError,
    reactivateLoading,
    reactivateError,
    hasUnsavedChanges,
    updateWhatsappField,
    updatePublicScheduleField,
    updateAppointmentTypeField,
    addLocation,
    setNewLocationName,
    setNewLocationValue,
    handleAddLocation,
    updateLocation: handleUpdateLocation,
    removeLocation: handleRemoveLocation,
    handleCancelSubscription,
    handleReactivateSubscription,
    saveSettings,
    generatePreview,
  };
}