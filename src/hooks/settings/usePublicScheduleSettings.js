// ============================================
// 📁 src/hooks/settings/usePublicScheduleSettings.js
// Responsabilidade: Configurações de agendamento público
// ============================================

import { useState, useRef, useMemo } from "react";

export const usePublicScheduleSettings = (initialConfig = null) => {
  const [publicScheduleConfig, setPublicScheduleConfig] = useState({
    period: "all_future",
    showPrice: true,
  });

  const savedConfigRef = useRef(initialConfig);

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
    savedConfigRef.current = config;
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!savedConfigRef.current) return false;
    const saved = savedConfigRef.current;
    return (
      saved.period !== publicScheduleConfig.period ||
      (saved.showPrice ?? true) !== (publicScheduleConfig.showPrice ?? true)
    );
  }, [publicScheduleConfig]);

  const getConfigForSave = () => ({
    period: publicScheduleConfig.period,
    showPrice: publicScheduleConfig.showPrice ?? true,
  });

  const markAsSaved = () => {
    savedConfigRef.current = { ...publicScheduleConfig };
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
