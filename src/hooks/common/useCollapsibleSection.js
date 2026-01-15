import { useState } from "react";

/**
 * Hook genérico para gerenciar seções colapsáveis/expansíveis
 * @param {boolean} defaultExpanded - Estado inicial de expansão (padrão: true)
 * @returns {Object} Estado e handlers
 */
export const useCollapsibleSection = (defaultExpanded = true) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  return {
    state: {
      isExpanded,
    },
    handlers: {
      toggleExpanded,
      setIsExpanded,
    },
  };
};
