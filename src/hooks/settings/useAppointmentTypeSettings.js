// ============================================
// 📁 src/hooks/settings/useAppointmentTypeSettings.js
// Responsabilidade: Configurações de tipo de atendimento
// ============================================

import { useState, useRef, useMemo } from "react";
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

  const savedConfigRef = useRef(initialConfig);

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
    savedConfigRef.current = config;
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
    if (!savedConfigRef.current) return false;
    const saved = savedConfigRef.current;
    const currentSelection = appointmentTypeConfig.selection || modeToSelection(appointmentTypeConfig.mode, appointmentTypeConfig.fixedType);
    const savedSelection = saved.selection || modeToSelection(saved.mode, saved.fixedType);

    return (
      currentSelection !== savedSelection ||
      saved.defaultValueOnline !== appointmentTypeConfig.defaultValueOnline ||
      saved.defaultValuePresencial !== appointmentTypeConfig.defaultValuePresencial ||
      JSON.stringify(saved.locations || []) !== JSON.stringify(appointmentTypeConfig.locations || [])
    );
  }, [appointmentTypeConfig]);

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
    savedConfigRef.current = { ...appointmentTypeConfig };
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
