import { useState, useEffect } from "react";

/**
 * Hook para gerenciar lógica de item de paciente
 * @param {Object} params - Parâmetros do hook
 * @param {boolean} params.isEditing - Se o paciente está em modo de edição
 * @param {Function} params.onEdit - Callback para entrar em modo de edição
 * @param {Function} params.onSave - Callback para salvar alterações
 * @param {Function} params.onCancel - Callback para cancelar edição
 * @returns {Object} Estado e handlers
 */
export const usePatientItem = ({ isEditing, onEdit, onSave, onCancel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Quando entrar em modo de edição, expandir automaticamente
  useEffect(() => {
    if (isEditing) {
      setIsExpanded(true);
    }
  }, [isEditing]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsExpanded(true);
    onEdit();
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave();
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    onCancel();
  };

  const handleItemClick = (e) => {
    // Não fazer toggle se clicou em botões ou inputs
    if (
      e.target.closest('button') || 
      e.target.closest('input') || 
      e.target.closest('.patient-item-edit-icon-btn') || 
      e.target.closest('.patient-item-expand-btn')
    ) {
      return;
    }
    // Não colapsar se estiver em modo de edição
    if (isEditing) {
      return;
    }
    toggleExpand();
  };

  return {
    state: {
      isExpanded,
    },
    handlers: {
      toggleExpand,
      handleEditClick,
      handleSaveClick,
      handleCancelClick,
      handleItemClick,
    },
  };
};
