// ============================================
// 📁 src/hooks/settings/useWhatsappSettings.js
// Responsabilidade: Configurações de WhatsApp
// ============================================

import { useState, useMemo } from "react";
import { generateWhatsappMessage } from "../../utils/message/generateWhatsappMessage";

export const useWhatsappSettings = (initialConfig = null) => {
  const [whatsappConfig, setWhatsappConfig] = useState({
    intro: "Olá",
    body: "Sua sessão está agendada",
    footer: "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!",
    showValue: true,
  });

  // Usar estado ao invés de ref para permitir reatividade no useMemo
  const [savedConfig, setSavedConfig] = useState(initialConfig);

  const updateWhatsappField = (field, value) => {
    setWhatsappConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const initializeWhatsappConfig = (data) => {
    const config = {
      intro: data?.intro || "Olá",
      body: data?.body || "Sua sessão está agendada",
      footer: data?.footer || "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!",
      showValue: data?.showValue ?? true,
    };
    setWhatsappConfig(config);
    setSavedConfig(config);
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!savedConfig) return false;
    return (
      savedConfig.intro !== whatsappConfig.intro ||
      savedConfig.body !== whatsappConfig.body ||
      savedConfig.footer !== whatsappConfig.footer ||
      savedConfig.showValue !== whatsappConfig.showValue
    );
  }, [whatsappConfig, savedConfig]);

  const generatePreview = (
    patientName = "João",
    date = "07/01/2026",
    time = "12:00",
    value = 150
  ) => {
    return generateWhatsappMessage({
      intro: whatsappConfig.intro,
      body: whatsappConfig.body,
      footer: whatsappConfig.footer,
      patientName,
      date,
      time,
      value,
      showValue: whatsappConfig.showValue,
    });
  };

  const getConfigForSave = () => ({
    intro: whatsappConfig.intro,
    body: whatsappConfig.body,
    footer: whatsappConfig.footer,
    showValue: whatsappConfig.showValue,
  });

  const markAsSaved = () => {
    setSavedConfig({ ...whatsappConfig });
  };

  return {
    whatsappConfig,
    updateWhatsappField,
    initializeWhatsappConfig,
    hasUnsavedChanges,
    generatePreview,
    getConfigForSave,
    markAsSaved,
  };
};
