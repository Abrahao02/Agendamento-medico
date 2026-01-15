export const isSlotInPast = (date, time, now = new Date()) => {
  if (!date || !time) return true;

  const todayStr = now.toISOString().split("T")[0];

  if (date < todayStr) return true;
  if (date > todayStr) return false;

  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return true;

  const slotTime = new Date(now);
  slotTime.setHours(hours, minutes, 0, 0);
  return slotTime < now;
};
