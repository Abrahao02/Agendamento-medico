import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook para gerenciar lógica de item de paciente
 * @param {Object} params - Parâmetros do hook
 * @param {boolean} params.isEditing - Se o paciente está em modo de edição
 * @param {Function} params.onEdit - Callback para entrar em modo de edição
 * @param {Function} params.onSave - Callback para salvar alterações
 * @param {Function} params.onCancel - Callback para cancelar edição
 * @param {React.RefObject} params.itemRef - Ref do elemento do item
 * @returns {Object} Estado e handlers
 */
export const usePatientItem = ({ isEditing, onEdit, onSave, onCancel, itemRef }) => {
  // Inicializar isExpanded baseado em isEditing
  const [isExpanded, setIsExpanded] = useState(isEditing);
  const prevIsEditingRef = useRef(isEditing);
  const prevIsExpandedRef = useRef(isExpanded);

  // Função para centralizar o item na viewport com offset superior
  const scrollToCenter = useCallback(() => {
    if (!itemRef?.current) return;
    
    const element = itemRef.current;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const offsetTop = viewportHeight * 0.2; // 20% do topo
    const targetPosition = rect.top + window.scrollY - offsetTop;
    
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });
  }, [itemRef]);

  // Quando entrar em modo de edição, expandir automaticamente
  useEffect(() => {
    if (isEditing) {
      // Sempre expandir quando estiver em modo de edição
      setIsExpanded(true);
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing]);

  // Scroll quando expandir ou entrar em modo de edição
  useEffect(() => {
    const wasExpanded = prevIsExpandedRef.current;
    const wasEditing = prevIsEditingRef.current;
    
    // Scroll quando expandir pela primeira vez ou entrar em modo de edição
    if ((!wasExpanded && isExpanded) || (!wasEditing && isEditing)) {
      // Aguardar um frame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToCenter();
        }, 50); // Pequeno delay para garantir que a expansão começou
      });
    }
    
    prevIsExpandedRef.current = isExpanded;
  }, [isExpanded, isEditing, scrollToCenter]);

  const toggleExpand = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    // Fazer scroll quando expandir (não quando colapsar)
    if (willExpand) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToCenter();
        }, 100);
      });
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Comportamento igual a clicar no item: primeiro expandir
    // Se não estiver expandido, expandir primeiro (igual ao toggleExpand)
    if (!isExpanded) {
    setIsExpanded(true);
      // Fazer scroll quando expandir (igual ao comportamento de clicar no item)
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToCenter();
          // Depois de expandir e fazer scroll, aguardar um pouco e entrar em modo de edição
          setTimeout(() => {
            onEdit();
          }, 100); // Delay adicional para a animação de expansão completar
        }, 100);
      });
    } else {
      // Se já estiver expandido, apenas entrar em modo de edição e fazer scroll
    onEdit();
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToCenter();
        }, 50);
      });
    }
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
    // Não fazer toggle se clicou em botões, inputs, SVGs ou paths
    if (
      e.target.closest('button') || 
      e.target.closest('input') || 
      e.target.closest('.patient-item-edit-icon-btn') || 
      e.target.closest('.patient-item-expand-btn') ||
      e.target.closest('svg') ||
      e.target.tagName === 'svg' ||
      e.target.tagName === 'path'
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
