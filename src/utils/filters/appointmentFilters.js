// ============================================
// 📁 src/utils/filters/appointmentFilters.js
// ============================================

import { isDateInRange, isDateInMonthYear, isFutureDate } from "./dateFilters";
import { STATUS_GROUPS } from "../../constants/appointmentStatus";

/**
 * Configuração de filtros para appointments
 * @typedef {Object} AppointmentFilterConfig
 * @property {string} [statusFilter] - Status a filtrar ("Todos" ignora)
 * @property {string} [searchTerm] - Termo de busca (nome ou telefone)
 * @property {string} [startDate] - Data inicial (YYYY-MM-DD)
 * @property {string} [endDate] - Data final (YYYY-MM-DD)
 * @property {number} [selectedMonth] - Mês selecionado (1-12)
 * @property {number} [selectedYear] - Ano selecionado
 * @property {boolean} [futureOnly] - Apenas datas futuras
 * @property {string} [specificDate] - Data específica (YYYY-MM-DD)
 */

/**
 * Filtra appointments ativos (status em STATUS_GROUPS.ACTIVE)
 * @param {Array} appointments - Lista de appointments
 * @returns {Array} Appointments ativos
 * @example
 * const active = filterActiveAppointments(appointments);
 */
export function filterActiveAppointments(appointments) {
  if (!Array.isArray(appointments)) return [];
  
  return appointments.filter(appointment => 
    STATUS_GROUPS.ACTIVE.includes(appointment.status)
  );
}

/**
 * Filtra appointments com base em múltiplos critérios
 * @param {Array} appointments - Lista de appointments
 * @param {AppointmentFilterConfig} config - Configuração de filtros
 * @returns {Array} Appointments filtrados
 */
export const filterAppointments = (appointments, config = {}) => {
  if (!Array.isArray(appointments)) return [];

  const {
    statusFilter,
    searchTerm,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    futureOnly = false,
    specificDate
  } = config;

  return appointments.filter((appointment) => {
    // 1. Filtro de Status
    if (statusFilter && statusFilter !== "Todos" && appointment.status !== statusFilter) {
      return false;
    }

    // 2. Filtro de Data Específica (prioridade máxima)
    if (specificDate) {
      return appointment.date === specificDate;
    }

    // 3. Filtro de Range de Datas
    if (startDate && endDate) {
      if (!isDateInRange(appointment.date, startDate, endDate)) {
        return false;
      }
    } 
    // 4. Filtro de Mês/Ano (se não houver range)
    else if (selectedMonth && selectedYear) {
      if (!isDateInMonthYear(appointment.date, selectedMonth, selectedYear)) {
        return false;
      }
    }

    // 5. Filtro de Datas Futuras
    if (futureOnly && !isFutureDate(appointment.date)) {
      return false;
    }

    // 6. Filtro de Busca (nome ou telefone)
    if (searchTerm) {
      const search = searchTerm.toLowerCase().trim();
      if (!search) return true;

      const name = (appointment.referenceName || appointment.patientName || "").toLowerCase();
      const phone = (appointment.patientWhatsapp || "").toLowerCase();

      if (!name.includes(search) && !phone.includes(search)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Ordena appointments por data e hora
 * @param {Array} appointments - Lista de appointments
 * @param {boolean} ascending - Ordem ascendente (true) ou descendente (false)
 * @returns {Array} Appointments ordenados
 */
export const sortAppointments = (appointments, ascending = true) => {
  if (!Array.isArray(appointments)) return [];

  return [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
    const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};
