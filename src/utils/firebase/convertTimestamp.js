/**
 * Converte timestamp do Firestore para objeto Date
 * Suporta múltiplos formatos:
 * - Timestamp do Firestore (com método toDate)
 * - Objeto Date
 * - String ISO
 * - Número (milliseconds)
 * - Objeto com propriedade seconds (Timestamp serializado)
 * 
 * @param {any} timestamp - Timestamp em qualquer formato suportado
 * @returns {Date | null} Objeto Date ou null se não conseguir converter
 * @example
 * // Timestamp do Firestore
 * convertTimestampToDate(firestoreTimestamp);
 * 
 * // String ISO
 * convertTimestampToDate("2026-01-15T10:30:00Z");
 * 
 * // Timestamp serializado
 * convertTimestampToDate({ seconds: 1705315800 });
 */
export function convertTimestampToDate(timestamp) {
  if (!timestamp) {
    return null;
  }

  // Se for Timestamp do Firestore (tem método toDate)
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Se já for Date
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Se for objeto com seconds (Timestamp do Firestore serializado)
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }

  // Se for string ou número, tenta converter
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}
