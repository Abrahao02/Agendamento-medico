import { APPOINTMENT_STATUS, STATUS_GROUPS } from "../../constants/appointmentStatus";
import { filterAvailableSlots } from "../filters/availabilityFilters";
import { isSlotInPast } from "../time/isSlotInPast";
import { getSlotTime, sortSlotsByTime } from "./slotUtils";

export const buildPublicScheduleAvailability = ({
  availability = [],
  activeAppointments = [],
  allAppointments = [],
  now = new Date(),
}) => {
  const baseAvailableSlots = filterAvailableSlots(availability, activeAppointments);

  const slotsWithCancelled = baseAvailableSlots.map((day) => {
    const cancelledAppointmentsForDay = allAppointments.filter(
      (appt) =>
        appt.date === day.date &&
        appt.status === APPOINTMENT_STATUS.CANCELLED &&
        appt.time
    );

    const bookedTimes = activeAppointments
      .filter((appt) => appt.date === day.date && STATUS_GROUPS.ACTIVE.includes(appt.status))
      .map((appt) => appt.time);

    // Atualiza slots existentes para restringir localização quando há appointment cancelado
    const updatedSlots = (day.slots || []).map((slot) => {
      const slotTime = getSlotTime(slot);
      const cancelledAppt = cancelledAppointmentsForDay.find((appt) => appt.time === slotTime);
      
      if (cancelledAppt && !bookedTimes.includes(slotTime)) {
        // Se há appointment cancelado neste slot, restringe ao local do appointment cancelado
        const appointmentType = cancelledAppt.appointmentType || 'presencial';
        const allowedLocationIds = (appointmentType === 'presencial' && cancelledAppt.location) 
          ? [cancelledAppt.location] 
          : [];
        
        // Se slot já é objeto, atualiza; se é string, converte para objeto
        if (typeof slot === 'object' && slot !== null) {
          return {
            ...slot,
            appointmentType,
            allowedLocationIds,
          };
        } else {
          return {
            time: slot,
            appointmentType,
            allowedLocationIds,
          };
        }
      }
      return slot;
    });

    const cancelledSlotsNotInAvailability = cancelledAppointmentsForDay
      .filter((appt) => {
        if (bookedTimes.includes(appt.time)) return false;
        if (isSlotInPast(day.date, appt.time, now)) return false;
        return !updatedSlots.some((slot) => getSlotTime(slot) === appt.time);
      })
      .map((appt) => {
        // Cria objeto de slot preservando informações de localização do appointment cancelado
        const appointmentType = appt.appointmentType || 'presencial';
        const allowedLocationIds = (appointmentType === 'presencial' && appt.location) 
          ? [appt.location] 
          : [];
        
        return {
          time: appt.time,
          appointmentType,
          allowedLocationIds,
        };
      });

    const allSlots = [...updatedSlots, ...cancelledSlotsNotInAvailability];

    const validSlots = allSlots.filter((slot) => {
      const slotTime = getSlotTime(slot);
      if (!slotTime) return false;
      return !isSlotInPast(day.date, slotTime, now);
    });

    return {
      ...day,
      slots: sortSlotsByTime(validSlots),
    };
  });

  const cancelledDates = new Set();
  allAppointments.forEach((appt) => {
    if (appt.status !== APPOINTMENT_STATUS.CANCELLED || !appt.date || !appt.time) return;
    if (isSlotInPast(appt.date, appt.time, now)) return;

    const dayInAvailability = availability.find((av) => av.date === appt.date);
    const hasActiveInSlot = activeAppointments.some(
      (active) =>
        active.date === appt.date &&
        active.time === appt.time &&
        STATUS_GROUPS.ACTIVE.includes(active.status)
    );

    if (!dayInAvailability && !hasActiveInSlot) {
      cancelledDates.add(appt.date);
    }
  });

  const cancelledDays = Array.from(cancelledDates)
    .map((date) => {
      const cancelledForDate = allAppointments.filter(
        (appt) =>
          appt.date === date &&
          appt.status === APPOINTMENT_STATUS.CANCELLED &&
          appt.time
      );

      const bookedTimes = activeAppointments
        .filter((appt) => appt.date === date && STATUS_GROUPS.ACTIVE.includes(appt.status))
        .map((appt) => appt.time);

      const cancelledSlots = cancelledForDate
        .filter((appt) => {
          if (bookedTimes.includes(appt.time)) return false;
          return !isSlotInPast(date, appt.time, now);
        })
        .map((appt) => {
          // Cria objeto de slot preservando informações de localização do appointment cancelado
          const appointmentType = appt.appointmentType || 'presencial';
          const allowedLocationIds = (appointmentType === 'presencial' && appt.location) 
            ? [appt.location] 
            : [];
          
          return {
            time: appt.time,
            appointmentType,
            allowedLocationIds,
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      if (cancelledSlots.length > 0) {
        return {
          id: `cancelled_${date}`,
          date,
          slots: cancelledSlots,
        };
      }

      return null;
    })
    .filter(Boolean);

  const allDays = [...slotsWithCancelled, ...cancelledDays];

  const uniqueDays = allDays.reduce((acc, day) => {
    const existing = acc.find((d) => d.date === day.date);
    if (existing) {
      // Combina slots preservando restrições de localização
      const slotsMap = new Map();
      
      // Adiciona slots existentes
      (existing.slots || []).forEach((slot) => {
        const time = getSlotTime(slot);
        if (time) {
          slotsMap.set(time, typeof slot === 'object' && slot !== null ? slot : { time });
        }
      });
      
      // Combina com novos slots, preservando restrições mais restritivas
      (day.slots || []).forEach((slot) => {
        const time = getSlotTime(slot);
        if (!time) return;
        
        const existingSlot = slotsMap.get(time);
        if (existingSlot) {
          // Se ambos são objetos, combina allowedLocationIds (interseção)
          const newSlot = typeof slot === 'object' && slot !== null ? slot : { time };
          const existingAllowed = Array.isArray(existingSlot.allowedLocationIds) 
            ? existingSlot.allowedLocationIds 
            : [];
          const newAllowed = Array.isArray(newSlot.allowedLocationIds) 
            ? newSlot.allowedLocationIds 
            : [];
          
          // Se ambos têm restrições, faz interseção; se um não tem, mantém o que tem
          let combinedAllowed = [];
          if (existingAllowed.length > 0 && newAllowed.length > 0) {
            combinedAllowed = existingAllowed.filter(id => newAllowed.includes(id));
          } else if (existingAllowed.length > 0) {
            combinedAllowed = existingAllowed;
          } else if (newAllowed.length > 0) {
            combinedAllowed = newAllowed;
          }
          
          slotsMap.set(time, {
            time,
            appointmentType: newSlot.appointmentType || existingSlot.appointmentType || 'presencial',
            allowedLocationIds: combinedAllowed,
          });
        } else {
          slotsMap.set(time, typeof slot === 'object' && slot !== null ? slot : { time });
        }
      });
      
      const combinedSlots = sortSlotsByTime(Array.from(slotsMap.values()));
      return acc.map((d) => (d.date === day.date ? { ...d, slots: combinedSlots } : d));
    }
    return [...acc, day];
  }, []);

  return uniqueDays
    .filter((day) => (day.slots || []).length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
};
