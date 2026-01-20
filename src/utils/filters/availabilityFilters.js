// ============================================
// 📁 src/utils/filters/availabilityFilters.js
// ============================================

import { getTodayString } from "./dateFilters";
import { STATUS_GROUPS, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { isSlotInPast } from "../time/isSlotInPast";

/**
 * Helper to extract time from slot (handles both string and object formats)
 */
function getSlotTime(slot) {
  if (typeof slot === "string") return slot;
  if (typeof slot === "object" && slot?.time) return slot.time;
  return null;
}

/**
 * Remove slots já agendados da disponibilidade
 * ✅ IMPORTANTE: Considera apenas appointments ATIVOS (exclui "Cancelado" que libera o slot)
 */
export const filterAvailableSlots = (availability, appointments) => {
  if (!Array.isArray(availability) || !Array.isArray(appointments)) {
    return [];
  }

  return availability
    .map(day => {
      const bookedSlots = appointments
        .filter(a => 
          a.date === day.date && 
          a.status !== APPOINTMENT_STATUS.CANCELLED && // ✅ Exclui explicitamente "Cancelado"
          STATUS_GROUPS.ACTIVE.includes(a.status)
        )
        .map(a => a.time);

      // Retorna apenas slots livres (handles both string and object formats)
      return {
        ...day,
        slots: (day.slots || []).filter(slot => {
          const slotTime = getSlotTime(slot);
          return slotTime && !bookedSlots.includes(slotTime);
        })
      };
    })
    .filter(day => day.slots.length > 0); // Remove dias sem slots
};

/**
 * Valida e filtra availability com critérios de qualidade
 */
export const validateAvailability = (availability, futureOnly = true) => {
  if (!Array.isArray(availability)) return [];

  const today = getTodayString();

  return availability
    .filter(day => 
      day.date &&
      typeof day.date === "string" &&
      Array.isArray(day.slots) &&
      day.slots.length > 0 &&
      (!futureOnly || day.date >= today)
    )
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Conta total de slots disponíveis
 */
export const countAvailableSlots = (availability) => {
  if (!Array.isArray(availability)) return 0;
  
  return availability.reduce(
    (sum, day) => sum + (day.slots?.length || 0), 
    0
  );
};

/**
 * Conta total de slots disponíveis incluindo slots cancelados
 * ✅ Similar à lógica do publicSchedule: inclui slots cancelados que liberam horários
 */
export const countAvailableSlotsIncludingCancelled = (availability, appointments, now = new Date()) => {
  if (!Array.isArray(availability) || !Array.isArray(appointments)) return 0;
  
  // Filtra appointments ativos (exclui cancelados)
  const activeAppointments = appointments.filter(a => 
    a.status !== APPOINTMENT_STATUS.CANCELLED && 
    STATUS_GROUPS.ACTIVE.includes(a.status)
  );
  
  // Slots base disponíveis (já exclui ocupados por ativos)
  const baseAvailableSlots = filterAvailableSlots(availability, activeAppointments);
  
  // Conta slots base
  let totalCount = countAvailableSlots(baseAvailableSlots);
  
  // Adiciona slots cancelados que não estão na disponibilidade base
  appointments.forEach(appt => {
    if (
      appt.status === APPOINTMENT_STATUS.CANCELLED &&
      appt.date &&
      appt.time &&
      !isSlotInPast(appt.date, appt.time, now) // ✅ Apenas slots futuros
    ) {
      // Verifica se já existe slot ativo neste horário
      const hasActiveInSlot = activeAppointments.some(
        active => active.date === appt.date && active.time === appt.time
      );
      
      if (!hasActiveInSlot) {
        // Verifica se o slot cancelado já está na disponibilidade base (já foi contado)
        const dayInBase = baseAvailableSlots.find(d => d.date === appt.date);
        const slotExistsInBase = dayInBase?.slots?.some(slot => {
          const slotTime = getSlotTime(slot);
          return slotTime === appt.time;
        });
        
        // Se não está na disponibilidade base, verifica se estava na disponibilidade original
        // Se estava na original, já foi contado. Se não estava, adiciona (slot cancelado que libera horário)
        if (!slotExistsInBase) {
          const dayInOriginal = availability.find(d => d.date === appt.date);
          const slotExistsInOriginal = dayInOriginal?.slots?.some(slot => {
            const slotTime = getSlotTime(slot);
            return slotTime === appt.time;
          });
          
          // Se não estava na disponibilidade original, adiciona ao contador
          // (slot cancelado que libera um horário que não estava na disponibilidade)
          if (!slotExistsInOriginal) {
            totalCount++;
          }
        }
      }
    }
  });
  
  return totalCount;
};

/**
 * Retorna slots disponíveis incluindo slots cancelados (similar a countAvailableSlotsIncludingCancelled)
 * ✅ Similar à lógica do publicSchedule: inclui slots cancelados que liberam horários
 */
export const getAvailableSlotsIncludingCancelled = (availability, appointments, now = new Date()) => {
  if (!Array.isArray(availability) || !Array.isArray(appointments)) return [];
  
  // Filtra appointments ativos (exclui cancelados)
  const activeAppointments = appointments.filter(a => 
    a.status !== APPOINTMENT_STATUS.CANCELLED && 
    STATUS_GROUPS.ACTIVE.includes(a.status)
  );
  
  // Slots base disponíveis (já exclui ocupados por ativos)
  const baseAvailableSlots = filterAvailableSlots(availability, activeAppointments);
  
  // Mapa para rastrear slots adicionados de cancelados
  const cancelledSlotsMap = {};
  
  // Adiciona slots cancelados que não estão na disponibilidade base
  appointments.forEach(appt => {
    if (
      appt.status === APPOINTMENT_STATUS.CANCELLED &&
      appt.date &&
      appt.time &&
      !isSlotInPast(appt.date, appt.time, now) // ✅ Apenas slots futuros
    ) {
      // Verifica se já existe slot ativo neste horário
      const hasActiveInSlot = activeAppointments.some(
        active => active.date === appt.date && active.time === appt.time
      );
      
      if (!hasActiveInSlot) {
        // Verifica se o slot cancelado já está na disponibilidade base (já foi contado)
        const dayInBase = baseAvailableSlots.find(d => d.date === appt.date);
        const slotExistsInBase = dayInBase?.slots?.some(slot => {
          const slotTime = getSlotTime(slot);
          return slotTime === appt.time;
        });
        
        // Se não está na disponibilidade base, verifica se estava na disponibilidade original
        if (!slotExistsInBase) {
          const dayInOriginal = availability.find(d => d.date === appt.date);
          const slotExistsInOriginal = dayInOriginal?.slots?.some(slot => {
            const slotTime = getSlotTime(slot);
            return slotTime === appt.time;
          });
          
          // Se não estava na disponibilidade original, adiciona (slot cancelado que libera horário)
          if (!slotExistsInOriginal) {
            const dateKey = appt.date;
            if (!cancelledSlotsMap[dateKey]) {
              cancelledSlotsMap[dateKey] = [];
            }
            cancelledSlotsMap[dateKey].push(appt.time);
          }
        }
      }
    }
  });
  
  // Combina slots base com slots cancelados
  const result = [...baseAvailableSlots];
  
  // Adiciona dias com slots cancelados que não existem no base
  Object.entries(cancelledSlotsMap).forEach(([date, times]) => {
    const existingDay = result.find(d => d.date === date);
    if (existingDay) {
      // Adiciona os horários cancelados ao dia existente (remove duplicatas)
      const existingTimes = (existingDay.slots || []).map(slot => getSlotTime(slot)).filter(Boolean);
      const newTimes = times.filter(time => !existingTimes.includes(time));
      if (newTimes.length > 0) {
        existingDay.slots = [...(existingDay.slots || []), ...newTimes];
      }
    } else {
      // Cria novo dia com slots cancelados
      result.push({
        date,
        slots: times,
      });
    }
  });
  
  return result;
};

/**
 * Obtém slots disponíveis para uma data específica
 * ✅ ATUALIZADO: Considera apenas appointments ATIVOS (exclui "Cancelado" que libera o slot)
 */
export const getAvailableSlotsForDate = (availability, appointments, date) => {
  if (!date) return [];

  const dayAvailability = availability.find(a => a.date === date);
  if (!dayAvailability || !Array.isArray(dayAvailability.slots)) {
    return [];
  }

  const bookedSlots = appointments
    .filter(a => 
      a.date === date && 
      a.status !== APPOINTMENT_STATUS.CANCELLED && // ✅ Exclui explicitamente "Cancelado"
      STATUS_GROUPS.ACTIVE.includes(a.status)
    )
    .map(a => a.time);

  return dayAvailability.slots
    .filter(slot => !bookedSlots.includes(slot))
    .sort();
};