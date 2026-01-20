import { APPOINTMENT_STATUS, STATUS_GROUPS } from "../../constants/appointmentStatus";
import { getBookedSlotsForDate } from "../appointments/getBookedSlots";
import { getSlotTime, getSlotTimes, sortSlotTimes } from "./slotUtils";

export const getAvailableSlotTimesForDate = ({ slots = [], appointments = [], date }) => {
  if (!date) return [];
  const bookedSlots = getBookedSlotsForDate(appointments, date);
  return sortSlotTimes(
    getSlotTimes(slots).filter((time) => !bookedSlots.includes(time))
  );
};

export const getCancelledAppointmentsForDate = ({ appointments = [], date }) =>
  appointments.filter(
    (appt) => appt.date === date && appt.status === APPOINTMENT_STATUS.CANCELLED && appt.time
  );

export const getCancelledSlotTimesNotInAvailability = ({
  appointments = [],
  date,
  slots = [],
}) => {
  if (!date) return [];
  const cancelledTimes = getCancelledAppointmentsForDate({ appointments, date }).map(
    (appt) => appt.time
  );
  return cancelledTimes.filter((time) =>
    !(slots || []).some((slot) => getSlotTime(slot) === time)
  );
};

export const getFreeSlotTimesForDate = ({ slots = [], appointments = [], date }) => {
  const freeSlotsInAvailability = getAvailableSlotTimesForDate({ slots, appointments, date });
  const cancelledSlotsNotInAvailability = getCancelledSlotTimesNotInAvailability({
    appointments,
    date,
    slots,
  });
  return sortSlotTimes([...freeSlotsInAvailability, ...cancelledSlotsNotInAvailability]);
};

export const getCalendarTileDataForDate = ({ slots = [], appointments = [], date }) => {
  const activeAppointmentsForDate = appointments.filter(
    (appt) => appt.date === date && STATUS_GROUPS.ACTIVE.includes(appt.status)
  );
  const freeSlots = getFreeSlotTimesForDate({ slots, appointments, date });
  const cancelledSlotsNotInAvailability = getCancelledSlotTimesNotInAvailability({
    appointments,
    date,
    slots,
  });
  const totalSlotsCount = (slots || []).length + cancelledSlotsNotInAvailability.length;

  return {
    hasFreeSlots: freeSlots.length > 0,
    hasBookedSlots: activeAppointmentsForDate.length > 0,
    freeCount: freeSlots.length,
    bookedCount: activeAppointmentsForDate.length,
    totalCount: totalSlotsCount,
  };
};
