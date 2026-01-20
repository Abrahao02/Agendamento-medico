// src/services/email.service.js
import { logError, logWarning } from "../../utils/logger/logger";
import { APPOINTMENT_TYPE_LABELS } from "../../constants/appointmentType";

export const sendAppointmentEmail = async ({
  doctor,
  patientName,
  whatsappNumbers,
  date,
  time,
  value,
  location,
  appointmentType,
}) => {
  try {
    const formData = new URLSearchParams();

    formData.append("to", doctor.email);
    formData.append(
      "subject",
      `Novo agendamento com ${patientName}`
    );

    // Build body text with optional fields
    let bodyText = `Olá ${doctor.name},

Você tem um novo agendamento:

Paciente: ${patientName}
WhatsApp: ${whatsappNumbers}
Data: ${date}
Hora: ${time}`;

    if (appointmentType) {
      const typeLabel = APPOINTMENT_TYPE_LABELS[appointmentType] || appointmentType;
      bodyText += `\nTipo de atendimento: ${typeLabel}`;
    }

    if (location) {
      bodyText += `\nLocal: ${location}`;
    }

    bodyText += `\nValor: R$ ${value}

Não esqueça de entrar em contato com o paciente para confirmar a consulta!`;

    formData.append("body", bodyText);

    // Build HTML body with optional fields
    const appointmentTypeLabel = appointmentType 
      ? (APPOINTMENT_TYPE_LABELS[appointmentType] || appointmentType)
      : null;

    let htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1D4ED8;">Novo agendamento!</h2>
        <p>Olá <b>${doctor.name}</b>,</p>

        <p>Você tem um novo agendamento:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 1em 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Paciente</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${patientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>WhatsApp</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${whatsappNumbers}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Data</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Hora</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${time}</td>
          </tr>`;

    if (appointmentTypeLabel) {
      htmlBody += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Tipo de atendimento</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${appointmentTypeLabel}</td>
          </tr>`;
    }

    if (location) {
      htmlBody += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Local</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${location}</td>
          </tr>`;
    }

    htmlBody += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><b>Valor</b></td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #16A34A;">
              <b>R$ ${value}</b>
            </td>
          </tr>
        </table>

        <p style="background-color: #FEF3C7; padding: 10px; border-left: 5px solid #F59E0B;">
          ⚠️ Não esqueça de entrar em contato com o paciente para confirmar a consulta!
        </p>

        <p>
          Atenciosamente,<br/>
          <b>Equipe MedSchedule</b>
        </p>
      </div>
    `;

    formData.append("htmlBody", htmlBody);

    const emailEndpoint = import.meta.env.VITE_APPS_SCRIPT_URL;

    if (!emailEndpoint) {
      logWarning("Endpoint de e-mail não configurado");
      return;
    }

    await fetch(emailEndpoint, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    logError("Erro ao enviar email:", error);
    // ⚠️ Não quebra o fluxo de agendamento
  }
};
