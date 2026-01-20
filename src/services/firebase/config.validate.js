// ============================================
// 📁 src/services/firebase/config.validate.js
// Validates required environment variables
// ============================================
import { logError, logWarning } from "../../utils/logger/logger";

/**
 * Required Firebase environment variables
 */
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
export function validateFirebaseConfig() {
  const missing = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file and ensure all Firebase config variables are set.`
    );
  }
}

/**
 * Validates environment variables on app startup
 * Only runs in development to catch missing vars early
 */
if (import.meta.env.DEV) {
  try {
    validateFirebaseConfig();
  } catch (error) {
    logError('Firebase Configuration Error:', error.message);
    logWarning('App may not work correctly without proper Firebase configuration.');
  }
}
