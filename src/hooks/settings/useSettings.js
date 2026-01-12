import { useState, useEffect } from "react";
import * as DoctorService from "../../services/firebase/doctors.service";
import { generateWhatsappMessage } from "../../utils/message/generateWhatsappMessage";

export function useSettings(user) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);
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

  const generatePreview = (
    patientName = "João",
    date = "07/01/2026",
    time = "12:00"
  ) => {
    const defaultValue = appointmentTypeConfig.defaultValueOnline || 0;
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
    whatsappConfig,
    publicScheduleConfig,
    appointmentTypeConfig,
    updateWhatsappField,
    updatePublicScheduleField,
    updateAppointmentTypeField,
    addLocation,
    updateLocation,
    removeLocation,
    saveSettings,
    generatePreview,
  };
}