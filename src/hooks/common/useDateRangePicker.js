import { useState, useEffect } from "react";
import { formatDateToQuery } from "../../utils/filters/dateFilters";

/**
 * Função helper para converter string YYYY-MM-DD para Date local (sem timezone)
 */
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Hook para gerenciar lógica do seletor de range de datas
 * @param {Object} params - Parâmetros do hook
 * @param {string} params.dateFrom - Data inicial
 * @param {string} params.dateTo - Data final
 * @param {boolean} params.isOpen - Se o picker está aberto
 * @param {Function} params.onDateRangeChange - Callback para mudança de range
 * @param {Function} params.onClose - Callback para fechar
 * @returns {Object} Estado, handlers e utils
 */
export const useDateRangePicker = ({
  dateFrom,
  dateTo,
  isOpen,
  onDateRangeChange,
  onClose,
}) => {
  const [dateRange, setDateRange] = useState([
    parseLocalDate(dateFrom),
    parseLocalDate(dateTo)
  ]);

  // Atualiza o estado quando props mudam ou quando abre
  useEffect(() => {
    if (isOpen) {
      // Quando o calendário abre, limpa a seleção se as datas estiverem vazias
      if (!dateFrom && !dateTo) {
        setDateRange([null, null]);
      } else {
        setDateRange([
          parseLocalDate(dateFrom),
          parseLocalDate(dateTo)
        ]);
      }
    }
  }, [dateFrom, dateTo, isOpen]);

  const handleDateChange = (value) => {
    setDateRange(value);
    // Quando um range completo é selecionado (2 datas)
    if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
      // Usa formatDateToQuery para evitar problemas de timezone
      const fromStr = formatDateToQuery(value[0]);
      const toStr = formatDateToQuery(value[1]);
      onDateRangeChange(fromStr, toStr);
      onClose();
    }
  };

  return {
    state: {
      dateRange,
    },
    handlers: {
      handleDateChange,
    },
    utils: {
      parseLocalDate,
    },
  };
};
