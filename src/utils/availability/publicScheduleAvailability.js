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

    const cancelledSlotsNotInAvailability = cancelledAppointmentsForDay
      .map((appt) => appt.time)
      .filter((time) => {
        if (bookedTimes.includes(time)) return false;
        if (isSlotInPast(day.date, time, now)) return false;
        return !(day.slots || []).some((slot) => getSlotTime(slot) === time);
      });

    const allSlots = [...(day.slots || []), ...cancelledSlotsNotInAvailability];

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
        .map((appt) => appt.time)
        .filter((time) => {
          if (bookedTimes.includes(time)) return false;
          return !isSlotInPast(date, time, now);
        })
        .sort();

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
      const combinedSlots = sortSlotsByTime(
        [...new Set([...(existing.slots || []), ...(day.slots || [])])]
      );
      return acc.map((d) => (d.date === day.date ? { ...d, slots: combinedSlots } : d));
    }
    return [...acc, day];
  }, []);

  return uniqueDays
    .filter((day) => (day.slots || []).length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
};
