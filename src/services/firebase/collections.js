// src/services/firebase/collections.js

export const COLLECTIONS = {
  DOCTORS: "doctors",
  PATIENTS: "patients",
  AVAILABILITY: "availability",
  APPOINTMENTS: "appointments",
};

/* ==============================
   ID GENERATORS
================================ */
export function getAvailabilityId(doctorId, date) {
  return `${doctorId}_${date}`;
}

export function getPatientId(doctorId, whatsapp) {
  // Remove caracteres especiais do whatsapp
  const cleanWhatsapp = whatsapp.replace(/\D/g, "");
  return `${doctorId}_${cleanWhatsapp}`;
}

/* ==============================
   VALIDATORS
================================ */
export const validators = {
  // Valida data no formato YYYY-MM-DD
  date: (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      console.error("❌ validators.date - valor inválido:", dateStr);
      return false;
    }
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
      console.error("❌ validators.date - formato inválido:", dateStr);
      return false;
    }
    
    // Valida se é uma data real
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    
    const isValid = 
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
    
    if (!isValid) {
      console.error("❌ validators.date - data inválida:", dateStr);
    }
    
    return isValid;
  },

  // Valida horário no formato HH:mm
  time: (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") {
      console.error("❌ validators.time - valor inválido:", timeStr);
      return false;
    }
    
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(timeStr)) {
      console.error("❌ validators.time - formato inválido:", timeStr);
      return false;
    }
    
    return true;
  },

  // Valida WhatsApp (apenas números, 10-15 dígitos)
  whatsapp: (whatsappStr) => {
    if (!whatsappStr || typeof whatsappStr !== "string") {
      console.error("❌ validators.whatsapp - valor inválido:", whatsappStr);
      return false;
    }
    
    const cleanWhatsapp = whatsappStr.replace(/\D/g, "");
    const isValid = cleanWhatsapp.length >= 10 && cleanWhatsapp.length <= 15;
    
    if (!isValid) {
      console.error("❌ validators.whatsapp - tamanho inválido:", whatsappStr);
    }
    
    return isValid;
  },
};