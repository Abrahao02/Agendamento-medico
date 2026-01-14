/**
 * Normaliza um valor de horário para o formato 24 horas (HH:mm)
 * @param {string} timeValue - Valor do horário a ser normalizado
 * @returns {string} Horário no formato HH:mm ou string vazia se inválido
 */
export function normalizeTo24Hour(timeValue) {
  if (!timeValue) return "";
  
  // Se já está no formato HH:mm, retorna como está
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (timeRegex.test(timeValue)) {
    return timeValue;
  }
  
  // Tenta extrair horas e minutos
  const parts = timeValue.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    
    // Garante que está no range 0-23
    if (hours >= 0 && hours <= 23) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0').substring(0, 2)}`;
    }
  }
  
  return timeValue;
}
