import { APPOINTMENT_STATUS, STATUS_GROUPS, isStatusInGroup } from "../../constants/appointmentStatus";

export const getActiveAppointments = (appointments = []) =>
  appointments.filter((appt) => STATUS_GROUPS.ACTIVE.includes(appt.status));

export const countByStatusGroup = (appointments = [], group) =>
  appointments.filter((appt) => isStatusInGroup(appt.status, group)).length;

export const countByStatus = (appointments = [], status) =>
  appointments.filter((appt) => appt.status === status).length;

export const getOccupancyRate = (activeCount, totalSlots) => {
  if (!totalSlots) return 0;
  return Math.round((activeCount / totalSlots) * 100);
};

export const getDayStats = ({ appointments = [], activeAppointments = [], totalSlots = 0 }) => {
  const confirmed = countByStatusGroup(appointments, "CONFIRMED");
  const pending = countByStatusGroup(appointments, "PENDING");
  const occupancyRate = getOccupancyRate(activeAppointments.length, totalSlots);
  return { confirmed, pending, occupancyRate };
};

export const getAgendaStats = ({ appointments = [], freeSlots = [] }) => {
  const confirmed = countByStatusGroup(appointments, "CONFIRMED");
  const pending = countByStatusGroup(appointments, "PENDING");
  const cancelled = countByStatus(appointments, APPOINTMENT_STATUS.CANCELLED);
  return {
    confirmed,
    pending,
    cancelled,
    free: freeSlots.length,
  };
};
