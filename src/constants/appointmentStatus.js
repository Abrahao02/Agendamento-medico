// ============================================
// 📁 src/constants/appointmentStatus.js - NOVO
// Sistema centralizado de status
// ============================================

/**
 * Status principais de agendamento
 */
export const APPOINTMENT_STATUS = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendente",
  MESSAGE_SENT: "Msg enviada",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não Compareceu",
};

/**
 * Grupos de status para filtros e análises
 */
export const STATUS_GROUPS = {
  CONFIRMED: [APPOINTMENT_STATUS.CONFIRMED],
  PENDING: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.MESSAGE_SENT],
  CANCELLED: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
  ACTIVE: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.MESSAGE_SENT],
};

/**
 * Configuração de cores e ícones por status
 */
export const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.CONFIRMED]: {
    color: "success",
    label: "Confirmado",
    icon: "CheckCircle",
    cssClass: "confirmed",
    chartColor: "#16a34a",
  },
  [APPOINTMENT_STATUS.PENDING]: {
    color: "warning",
    label: "Pendente",
    icon: "Clock",
    cssClass: "pending",
    chartColor: "#f59e0b",
  },
  [APPOINTMENT_STATUS.MESSAGE_SENT]: {
    color: "info",
    label: "Msg enviada",
    icon: "MessageCircle",
    cssClass: "message-sent",
    chartColor: "#3b82f6",
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    color: "danger",
    label: "Cancelado",
    icon: "XCircle",
    cssClass: "cancelled",
    chartColor: "#ef4444",
  },
  [APPOINTMENT_STATUS.NO_SHOW]: {
    color: "danger",
    label: "Não Compareceu",
    icon: "XOctagon",
    cssClass: "no-show",
    chartColor: "#dc2626",
  },
};

/**
 * Obtém configuração de um status
 */
export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG[APPOINTMENT_STATUS.PENDING];
};

/**
 * Verifica se status está em um grupo
 */
export const isStatusInGroup = (status, group) => {
  return STATUS_GROUPS[group]?.includes(status) || false;
};