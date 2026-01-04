function pad(n){
  return n < 10 ? '0' + n : String(n);
}

/**
 * Recebe uma `Date` ou string e retorna `DD-MM-YYYY`.
 * Aceita strings no formato `YYYY-MM-DD`, ISO ou timestamps.
 */
export default function formatDate(input){
  if(!input && input !== 0) return '';

  // Se for string no formato YYYY-MM-DD
  if(typeof input === 'string'){
    const isoDateOnly = input.match(/^\d{4}-\d{2}-\d{2}$/);
    if(isoDateOnly){
      const [y,m,d] = input.split('-');
      return `${d}-${m}-${y}`;
    }
    // Tenta criar Date a partir da string (para ISO com hora)
    const dt = new Date(input);
    if(!isNaN(dt)){
      return `${pad(dt.getDate())}-${pad(dt.getMonth()+1)}-${dt.getFullYear()}`;
    }
    return input;
  }

  // Se for objeto Date
  if(input instanceof Date){
    return `${pad(input.getDate())}-${pad(input.getMonth()+1)}-${input.getFullYear()}`;
  }

  // Se for number (timestamp)
  if(typeof input === 'number'){
    const dt = new Date(input);
    if(!isNaN(dt)){
      return `${pad(dt.getDate())}-${pad(dt.getMonth()+1)}-${dt.getFullYear()}`;
    }
  }

  return String(input);
}
