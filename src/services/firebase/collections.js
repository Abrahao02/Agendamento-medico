// src/services/firebase/collections.js

export const COLLECTIONS = {
  DOCTORS: "doctors",
  PATIENTS: "patients",
  AVAILABILITY: "availability",
  APPOINTMENTS: "appointments",
};

export function getAvailabilityId(doctorId, date) {
  return `${doctorId}_${date}`;
}

export function getPatientId(doctorId, whatsapp) {
  // Remove caracteres especiais do whatsapp
  const cleanWhatsapp = whatsapp.replace(/\D/g, "");
  return `${doctorId}_${cleanWhatsapp}`;
}

export const validators = {
  // Valida data no formato YYYY-MM-DD
  date: (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      return false;
    }
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
      return false;
    }
    
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  },

  // Valida horário no formato HH:mm
  time: (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") {
      return false;
    }
    
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeStr);
  },

  // Valida WhatsApp (apenas números, 10-15 dígitos)
  whatsapp: (whatsappStr) => {
    if (!whatsappStr || typeof whatsappStr !== "string") {
      return false;
    }
    
    const cleanWhatsapp = whatsappStr.replace(/\D/g, "");
    return cleanWhatsapp.length >= 10 && cleanWhatsapp.length <= 15;
  },
};