// ============================================
// 📁 src/hooks/settings/useAppointmentTypeSettings.js
// Responsabilidade: Configurações de tipo de atendimento
// ============================================

import { useState, useMemo } from "react";
import { modeToSelection, selectionToMode, APPOINTMENT_TYPE_SELECTION } from "../../constants/appointmentType";

export const useAppointmentTypeSettings = (initialConfig = null) => {
  const [appointmentTypeConfig, setAppointmentTypeConfig] = useState({
    selection: APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY,
    mode: "disabled",
    fixedType: "online",
    defaultValueOnline: 0,
    defaultValuePresencial: 0,
    locations: [],
  });

  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationValue, setNewLocationValue] = useState("");

  // Usar estado ao invés de ref para permitir reatividade no useMemo
  const [savedConfig, setSavedConfig] = useState(initialConfig);

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

  const initializeAppointmentTypeConfig = (data) => {
    // Converter mode + fixedType para selection (compatibilidade retroativa)
    const mode = data?.mode || "disabled";
    const fixedType = data?.fixedType || "online";
    const selection = data?.selection || modeToSelection(mode, fixedType);

    const config = {
      selection,
      mode: data?.mode || "disabled",
      fixedType: data?.fixedType || "online",
      defaultValueOnline: data?.defaultValueOnline || 0,
      defaultValuePresencial: data?.defaultValuePresencial || 0,
      locations: data?.locations || [],
    };
    setAppointmentTypeConfig(config);
    setSavedConfig(config);
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

  const hasUnsavedChanges = useMemo(() => {
    if (!savedConfig) return false;
    const currentSelection = appointmentTypeConfig.selection || modeToSelection(appointmentTypeConfig.mode, appointmentTypeConfig.fixedType);
    const savedSelection = savedConfig.selection || modeToSelection(savedConfig.mode, savedConfig.fixedType);

    return (
      currentSelection !== savedSelection ||
      savedConfig.defaultValueOnline !== appointmentTypeConfig.defaultValueOnline ||
      savedConfig.defaultValuePresencial !== appointmentTypeConfig.defaultValuePresencial ||
      JSON.stringify(savedConfig.locations || []) !== JSON.stringify(appointmentTypeConfig.locations || [])
    );
  }, [appointmentTypeConfig, savedConfig]);

  const getConfigForSave = () => {
    const selection = appointmentTypeConfig.selection || APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY;
    const { mode, fixedType } = selectionToMode(selection);

    return {
      selection,
      mode,
      fixedType,
      defaultValueOnline: Number(appointmentTypeConfig.defaultValueOnline) || 0,
      defaultValuePresencial: Number(appointmentTypeConfig.defaultValuePresencial) || 0,
      locations: appointmentTypeConfig.locations || [],
    };
  };

  const markAsSaved = () => {
    setSavedConfig({ ...appointmentTypeConfig });
  };

  return {
    appointmentTypeConfig,
    newLocationName,
    newLocationValue,
    updateAppointmentTypeField,
    initializeAppointmentTypeConfig,
    addLocation,
    updateLocation,
    removeLocation,
    setNewLocationName,
    setNewLocationValue,
    handleAddLocation,
    hasUnsavedChanges,
    getConfigForSave,
    markAsSaved,
  };
};
