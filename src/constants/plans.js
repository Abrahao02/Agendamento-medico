// ============================================
// 📁 src/constants/plans.js
// Centralized plan constants
// ============================================

/**
 * Plan types available in the system
 */
export const PLAN_TYPES = {
  FREE: 'free',
  PRO: 'pro',
};

/**
 * Plan limits and configuration
 */
export const PLAN_LIMITS = {
  [PLAN_TYPES.FREE]: {
    MONTHLY_APPOINTMENTS: 10,
    PATIENT_LIMIT: 10,
    NAME: 'Gratuito',
    LABEL: 'Plano Gratuito',
  },
  [PLAN_TYPES.PRO]: {
    MONTHLY_APPOINTMENTS: Infinity,
    PATIENT_LIMIT: Infinity,
    NAME: 'PRO',
    LABEL: 'Plano PRO',
  },
};

/**
 * Default values for new doctors
 */
export const DEFAULT_DOCTOR_CONFIG = {
  PLAN: PLAN_TYPES.FREE,
  PATIENT_LIMIT: PLAN_LIMITS[PLAN_TYPES.FREE].PATIENT_LIMIT,
  DEFAULT_VALUE_SCHEDULE: 0,
};
