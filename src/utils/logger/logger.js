// ============================================
// 📁 src/utils/logger/logger.js
// Centralized logging utility (removes logs in production)
// ============================================

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Logs message only in development
 */
export function log(...args) {
  if (isDevelopment) {
    console.log(...args);
  }
}

/**
 * Logs error (always logs in production for error tracking)
 */
export function logError(...args) {
  if (isDevelopment) {
    console.error(...args);
  } else {
    // In production, you could send to error tracking service
    // Example: Sentry.captureException(...args)
    console.error(...args); // Keep for now, replace with error tracking
  }
}

/**
 * Logs warning only in development
 */
export function logWarning(...args) {
  if (isDevelopment) {
    console.warn(...args);
  }
}

/**
 * Logs info only in development
 */
export function logInfo(...args) {
  if (isDevelopment) {
    console.info(...args);
  }
}

/**
 * Logs debug information only in development
 */
export function logDebug(...args) {
  if (isDevelopment) {
    console.debug(...args);
  }
}

/**
 * Logs grouped information (for better organization)
 */
export function logGroup(label, ...args) {
  if (isDevelopment) {
    console.group(label);
    console.log(...args);
    console.groupEnd();
  }
}

/**
 * Logs table data (useful for debugging)
 */
export function logTable(data) {
  if (isDevelopment) {
    console.table(data);
  }
}

/**
 * Safe logger that sanitizes sensitive data before logging
 */
export function logSafe(message, data = {}) {
  if (!isDevelopment) return;

  // Sanitize sensitive fields
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  console.log(message, sanitized);
}
