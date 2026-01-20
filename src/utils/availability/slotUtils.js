export const getSlotTime = (slot) => {
  if (typeof slot === "string") return slot;
  if (slot && typeof slot === "object" && slot.time) return slot.time;
  return null;
};

export const getSlotTimes = (slots = []) => slots.map(getSlotTime).filter(Boolean);

export const uniqueSlotTimes = (times = []) => Array.from(new Set(times));

export const sortSlotTimes = (times = []) => [...times].sort((a, b) => a.localeCompare(b));

export const combineSlotTimes = (slots = [], appointments = []) => {
  const slotTimes = getSlotTimes(slots);
  const appointmentTimes = appointments.map((appt) => appt.time).filter(Boolean);
  return sortSlotTimes(uniqueSlotTimes([...slotTimes, ...appointmentTimes]));
};

export const sortSlotsByTime = (slots = []) =>
  [...slots].sort((a, b) => {
    const timeA = getSlotTime(a) || "";
    const timeB = getSlotTime(b) || "";
    return timeA.localeCompare(timeB);
  });
