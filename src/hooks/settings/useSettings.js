import { useState, useEffect, useMemo } from "react";
import * as DoctorService from "../../services/firebase/doctors.service";
import { generateWhatsappMessage } from "../../utils/message/generateWhatsappMessage";
import { useCancelSubscription } from "../stripe/useCancelSubscription";
import { useReactivateSubscription } from "../stripe/useReactivateSubscription";

export function useSettings(user) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationValue, setNewLocationValue] = useState("");
  
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
  });

  const [appointmentTypeConfig, setAppointmentTypeConfig] = useState({
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
          });

          setAppointmentTypeConfig({
            mode: data.appointmentTypeConfig?.mode || "disabled",
            fixedType: data.appointmentTypeConfig?.fixedType || "online",
            defaultValueOnline: data.appointmentTypeConfig?.defaultValueOnline || 0,
            defaultValuePresencial: data.appointmentTypeConfig?.defaultValuePresencial || 0,
            locations: data.appointmentTypeConfig?.locations || [],
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
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

      return await DoctorService.updateDoctor(user.uid, {
        whatsappConfig: {
          intro: whatsappConfig.intro,
          body: whatsappConfig.body,
          footer: whatsappConfig.footer,
          showValue: whatsappConfig.showValue,
        },
        publicScheduleConfig: {
          period: publicScheduleConfig.period,
        },
        appointmentTypeConfig: {
          mode: appointmentTypeConfig.mode,
          fixedType: appointmentTypeConfig.fixedType,
          defaultValueOnline: Number(appointmentTypeConfig.defaultValueOnline) || 0,
          defaultValuePresencial: Number(appointmentTypeConfig.defaultValuePresencial) || 0,
          locations: appointmentTypeConfig.locations,
        },
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
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
    setAppointmentTypeConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        alert('Assinatura cancelada com sucesso! Você continuará com acesso PRO até o final do período pago.');
        window.location.reload();
      } else {
        alert(`Erro ao cancelar: ${result.error || 'Tente novamente'}`);
      }
    }
  };

  const handleReactivateSubscription = async () => {
    if (confirm('Tem certeza que deseja reativar sua assinatura? Ela continuará sendo cobrada normalmente.')) {
      const result = await handleReactivate();
      if (result.success) {
        alert('Assinatura reativada com sucesso!');
        window.location.reload();
      } else {
        alert(`Erro ao reativar: ${result.error || 'Tente novamente'}`);
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
      console.error('Erro ao calcular data:', error);
      return null;
    }
  }, [doctor?.planUpdatedAt]);

  const isPro = useMemo(() => {
    return doctor?.plan === "pro";
  }, [doctor?.plan]);

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