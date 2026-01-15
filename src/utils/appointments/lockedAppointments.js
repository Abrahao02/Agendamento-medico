import { STATUS_GROUPS } from "../../constants/appointmentStatus";

export const getLockedAppointmentIds = (appointments = []) => {
  const locked = new Set();
  const slotMap = new Map();

  appointments.forEach((appt) => {
    const slotKey = `${appt.date || ""}_${appt.time || ""}`;
    if (!slotMap.has(slotKey)) {
      slotMap.set(slotKey, []);
    }
    slotMap.get(slotKey).push(appt);
  });

  slotMap.forEach((appointmentsInSlot) => {
    const hasActiveInSlot = appointmentsInSlot.some((appt) =>
      STATUS_GROUPS.ACTIVE.includes(appt.status)
    );

    if (hasActiveInSlot) {
      appointmentsInSlot.forEach((appt) => {
        if (!STATUS_GROUPS.ACTIVE.includes(appt.status)) {
          locked.add(appt.id);
        }
      });
    }
  });

  return locked;
};

export const canChangeAppointmentStatus = (appointments = [], appointmentId, nextStatus) => {
  const currentAppointment = appointments.find((appt) => appt.id === appointmentId);
  if (!currentAppointment) {
    return { allowed: false, error: "Agendamento não encontrado" };
  }

  if (STATUS_GROUPS.ACTIVE.includes(nextStatus)) {
    return { allowed: true };
  }

  const hasActiveInSameSlot = appointments.some(
    (other) =>
      other.id !== appointmentId &&
      other.date === currentAppointment.date &&
      other.time === currentAppointment.time &&
      STATUS_GROUPS.ACTIVE.includes(other.status)
  );

  if (hasActiveInSameSlot) {
    return {
      allowed: false,
      error: "Este horário já foi reagendado. Não é possível cancelar.",
    };
  }

  return { allowed: true };
};
