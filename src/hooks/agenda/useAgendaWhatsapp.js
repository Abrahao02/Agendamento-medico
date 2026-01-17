// ============================================
// 📁 src/hooks/agenda/useAgendaWhatsapp.js
// Responsabilidade: Lógica de WhatsApp
// ============================================

import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import formatDate from "../../utils/formatter/formatDate";
import { generateWhatsappLink } from "../../utils/whatsapp/generateWhatsappLink";

export const useAgendaWhatsapp = ({
  whatsappConfig,
  referenceNames,
  handleStatusChange,
}) => {
  const handleSendWhatsapp = (appt) => {
    if (!whatsappConfig) return;

    const { intro, body, footer, showValue } = whatsappConfig;

    // Usa o nome preferencial (referenceName) se disponível, senão usa o nome do appointment
    const patientDisplayName = referenceNames[appt.id] || appt.patientName;

    let message = `${intro || "Olá"} ${patientDisplayName},\n\n${body || "Sua sessão está agendada"}\n\nData: ${formatDate(appt.date)}\nHorário: ${appt.time}`;

    if (showValue && appt.value) {
      message += `\nValor: R$ ${appt.value}`;
    }

    if (footer) {
      // Adiciona quebra de linha antes do footer
      // Se não houver valor, adiciona apenas uma quebra de linha
      const hasValue = showValue && appt.value;
      message += hasValue ? `\n\n${footer}` : `\n${footer}`;
    }

    const url = generateWhatsappLink(appt.patientWhatsapp, message.trim());
    window.open(url, "whatsappWindow");

    // Atualiza status para "Msg enviada" automaticamente
    handleStatusChange(appt.id, APPOINTMENT_STATUS.MESSAGE_SENT);
  };

  return {
    handleSendWhatsapp,
  };
};
