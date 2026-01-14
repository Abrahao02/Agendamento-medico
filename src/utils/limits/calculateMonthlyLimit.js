// ============================================
// 📁 src/utils/limits/calculateMonthlyLimit.js
// Centralized utility for calculating monthly appointment limits
// ============================================

import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { PLAN_LIMITS, PLAN_TYPES } from "../../constants/plans";

/**
 * Monthly limit for Free plan users
 * @deprecated Use PLAN_LIMITS[PLAN_TYPES.FREE].MONTHLY_APPOINTMENTS instead
 */
export const FREE_PLAN_MONTHLY_LIMIT = PLAN_LIMITS[PLAN_TYPES.FREE].MONTHLY_APPOINTMENTS;

/**
 * Calculate the number of confirmed appointments in the current month
 * @param {Array} appointments - Array of appointment objects
 * @returns {number} - Count of confirmed appointments in current month
 */
export function calculateMonthlyAppointmentsCount(appointments) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  const confirmedThisMonth = appointments.filter(
    (appointment) =>
      appointment.status === APPOINTMENT_STATUS.CONFIRMED &&
      appointment.date >= startDate &&
      appointment.date <= endDate
  ).length;

  return confirmedThisMonth;
}

/**
 * Check if the limit has been reached for a given plan
 * @param {string} plan - User plan ('free' | 'pro')
 * @param {number} count - Current count of appointments
 * @param {number} limit - Limit value (defaults to FREE_PLAN_MONTHLY_LIMIT)
 * @returns {boolean} - True if limit is reached
 */
export function checkLimitReached(plan, count, limit = FREE_PLAN_MONTHLY_LIMIT) {
  if (plan !== PLAN_TYPES.FREE) {
    return false; // PRO users have no limit
  }
  return count >= limit;
}
