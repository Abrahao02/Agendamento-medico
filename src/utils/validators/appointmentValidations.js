// src/validations/appointment.validation.js

export const validatePatientName = (name) => {
  if (!name || !name.trim()) {
    throw new Error("Preencha seu nome completo.");
  }

  return name.trim();
};

export const validateWhatsapp = (whatsapp) => {
  const numbers = whatsapp.replace(/\D/g, "");

  if (numbers.length !== 11) {
    throw new Error(
      "Informe um número de WhatsApp válido com 11 dígitos."
    );
  }

  return numbers;
};

export const validateSelectedSlot = (slot) => {
  if (!slot) {
    throw new Error("Selecione um horário.");
  }
};
