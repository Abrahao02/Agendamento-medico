import formatDate from "../../utils/formatter/formatDate";
import { formatCurrency } from "../../utils/formatter/formatCurrency";

/**
 * Hook para gerenciar lógica do cartão de paciente
 * @param {Object} params - Parâmetros do hook
 * @param {Object} params.patient - Dados do paciente
 * @param {Function} params.onToggle - Callback para toggle de expansão
 * @param {Function} params.onSendWhatsapp - Callback para enviar WhatsApp
 * @returns {Object} Handlers
 */
export const usePatientCard = ({ patient, onToggle, onSendWhatsapp }) => {
  const handleSendReport = (e) => {
    e.stopPropagation();
    
    // Calcular o total
    const total = patient.appointments.reduce((sum, app) => sum + (app.value || 0), 0);
    
    const messages = patient.appointments.map(
      (app) =>
        `${formatDate(app.date)} às ${app.time} - ${formatCurrency(app.value || 0)}`
    );
    
    const text = `Seguem as datas e valores de suas consultas:\n${messages.join("\n")}\n\n*Total: ${formatCurrency(total)}*`;
    
    onSendWhatsapp(patient.whatsapp, text);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(patient.name);
  };

  const handleContainerClick = (e) => {
    // Não fazer toggle se clicou no botão do WhatsApp
    if (e.target.closest('.btn-whatsapp')) {
      return;
    }
    onToggle(patient.name);
  };

  return {
    handlers: {
      handleSendReport,
      handleToggle,
      handleContainerClick,
    },
  };
};