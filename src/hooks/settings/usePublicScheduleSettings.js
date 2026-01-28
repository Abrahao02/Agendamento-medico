// ============================================
// 📁 src/hooks/settings/usePublicScheduleSettings.js
// Responsabilidade: Configurações de agendamento público
// ============================================

import { useState, useMemo } from "react";

export const usePublicScheduleSettings = (initialConfig = null) => {
  const [publicScheduleConfig, setPublicScheduleConfig] = useState({
    period: "all_future",
    showPrice: true,
  });

  // Usar estado ao invés de ref para permitir reatividade no useMemo
  const [savedConfig, setSavedConfig] = useState(initialConfig);

  const updatePublicScheduleField = (field, value) => {
    setPublicScheduleConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const initializePublicScheduleConfig = (data) => {
    const config = {
      period: data?.period || "all_future",
      showPrice: data?.showPrice ?? true,
    };
    setPublicScheduleConfig(config);
    setSavedConfig(config);
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!savedConfig) return false;
    return (
      savedConfig.period !== publicScheduleConfig.period ||
      (savedConfig.showPrice ?? true) !== (publicScheduleConfig.showPrice ?? true)
    );
  }, [publicScheduleConfig, savedConfig]);

  const getConfigForSave = () => ({
    period: publicScheduleConfig.period,
    showPrice: publicScheduleConfig.showPrice ?? true,
  });

  const markAsSaved = () => {
    setSavedConfig({ ...publicScheduleConfig });
  };

  return {
    publicScheduleConfig,
    updatePublicScheduleField,
    initializePublicScheduleConfig,
    hasUnsavedChanges,
    getConfigForSave,
    markAsSaved,
  };
};
