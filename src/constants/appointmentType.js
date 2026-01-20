export const APPOINTMENT_TYPE = {
  ONLINE: "online",
  PRESENCIAL: "presencial",
};

export const APPOINTMENT_TYPE_MODE = {
  DISABLED: "disabled",
  FIXED: "fixed",
  CHOICE: "choice",
};

export const APPOINTMENT_TYPE_LABELS = {
  [APPOINTMENT_TYPE.ONLINE]: "Online",
  [APPOINTMENT_TYPE.PRESENCIAL]: "Presencial",
};

export const APPOINTMENT_TYPE_MODE_LABELS = {
  [APPOINTMENT_TYPE_MODE.DISABLED]: "Desabilitado",
  [APPOINTMENT_TYPE_MODE.FIXED]: "Fixo",
  [APPOINTMENT_TYPE_MODE.CHOICE]: "Permitir escolha",
};

// Nova constante para seleção simplificada
export const APPOINTMENT_TYPE_SELECTION = {
  ONLINE_ONLY: "online_only",
  PRESENCIAL_ONLY: "presencial_only",
  BOTH: "both",
};

export const APPOINTMENT_TYPE_SELECTION_LABELS = {
  [APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY]: "Online",
  [APPOINTMENT_TYPE_SELECTION.PRESENCIAL_ONLY]: "Presencial",
  [APPOINTMENT_TYPE_SELECTION.BOTH]: "Online e Presencial",
};

export const getAppointmentTypeOptions = () => [
  { value: APPOINTMENT_TYPE.ONLINE, label: APPOINTMENT_TYPE_LABELS[APPOINTMENT_TYPE.ONLINE] },
  { value: APPOINTMENT_TYPE.PRESENCIAL, label: APPOINTMENT_TYPE_LABELS[APPOINTMENT_TYPE.PRESENCIAL] },
];

export const getAppointmentTypeModeOptions = () => [
  { value: APPOINTMENT_TYPE_MODE.DISABLED, label: APPOINTMENT_TYPE_MODE_LABELS[APPOINTMENT_TYPE_MODE.DISABLED] },
  { value: APPOINTMENT_TYPE_MODE.FIXED, label: APPOINTMENT_TYPE_MODE_LABELS[APPOINTMENT_TYPE_MODE.FIXED] },
  { value: APPOINTMENT_TYPE_MODE.CHOICE, label: APPOINTMENT_TYPE_MODE_LABELS[APPOINTMENT_TYPE_MODE.CHOICE] },
];

// Nova função para opções de seleção simplificada
export const getAppointmentTypeSelectionOptions = () => [
  { 
    value: APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY, 
    label: APPOINTMENT_TYPE_SELECTION_LABELS[APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY] 
  },
  { 
    value: APPOINTMENT_TYPE_SELECTION.PRESENCIAL_ONLY, 
    label: APPOINTMENT_TYPE_SELECTION_LABELS[APPOINTMENT_TYPE_SELECTION.PRESENCIAL_ONLY] 
  },
  { 
    value: APPOINTMENT_TYPE_SELECTION.BOTH, 
    label: APPOINTMENT_TYPE_SELECTION_LABELS[APPOINTMENT_TYPE_SELECTION.BOTH] 
  },
];

/**
 * Converte selection para mode + fixedType (compatibilidade)
 */
export function selectionToMode(selection) {
  if (selection === APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY) {
    return { mode: APPOINTMENT_TYPE_MODE.FIXED, fixedType: APPOINTMENT_TYPE.ONLINE };
  }
  if (selection === APPOINTMENT_TYPE_SELECTION.PRESENCIAL_ONLY) {
    return { mode: APPOINTMENT_TYPE_MODE.FIXED, fixedType: APPOINTMENT_TYPE.PRESENCIAL };
  }
  if (selection === APPOINTMENT_TYPE_SELECTION.BOTH) {
    return { mode: APPOINTMENT_TYPE_MODE.CHOICE, fixedType: null };
  }
  // Fallback para compatibilidade
  return { mode: APPOINTMENT_TYPE_MODE.DISABLED, fixedType: APPOINTMENT_TYPE.ONLINE };
}

/**
 * Converte mode + fixedType para selection (compatibilidade)
 */
export function modeToSelection(mode, fixedType) {
  if (mode === APPOINTMENT_TYPE_MODE.FIXED && fixedType === APPOINTMENT_TYPE.ONLINE) {
    return APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY;
  }
  if (mode === APPOINTMENT_TYPE_MODE.FIXED && fixedType === APPOINTMENT_TYPE.PRESENCIAL) {
    return APPOINTMENT_TYPE_SELECTION.PRESENCIAL_ONLY;
  }
  if (mode === APPOINTMENT_TYPE_MODE.CHOICE) {
    return APPOINTMENT_TYPE_SELECTION.BOTH;
  }
  // Fallback
  return APPOINTMENT_TYPE_SELECTION.ONLINE_ONLY;
}
