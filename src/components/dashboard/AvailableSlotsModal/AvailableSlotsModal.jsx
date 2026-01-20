// ============================================
// 📁 src/components/dashboard/AvailableSlotsModal/AvailableSlotsModal.jsx
// Modal para exibir horários disponíveis agrupados por data
// ============================================
import { createPortal } from 'react-dom';
import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import formatDate from '../../../utils/formatter/formatDate';
import './AvailableSlotsModal.css';

export default function AvailableSlotsModal({
  isOpen,
  onClose,
  availableSlots = [],
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fecha modal ao clicar no backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fecha modal com tecla ESC
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Agrupar slots por data
  const groupedSlots = React.useMemo(() => {
    if (!Array.isArray(availableSlots)) return [];
    
    const grouped = {};
    
    availableSlots.forEach(day => {
      if (!day || !day.date) return;
      
      const dateKey = day.date;
      
      // Se day.slots existe e é um array, processar normalmente
      if (Array.isArray(day.slots) && day.slots.length > 0) {
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: dateKey,
            slots: [],
          };
        }
        
        // Extrair horários dos slots (pode ser string ou objeto)
        const times = day.slots.map(slot => {
          if (typeof slot === 'string') return slot;
          if (typeof slot === 'object' && slot?.time) return slot.time;
          return null;
        }).filter(Boolean);
        
        grouped[dateKey].slots.push(...times);
      }
    });
    
    // Ordenar por data e remover duplicatas de horários dentro de cada grupo
    return Object.values(grouped)
      .map(group => ({
        ...group,
        slots: [...new Set(group.slots)].sort((a, b) => a.localeCompare(b)),
      }))
      .filter(group => group.slots.length > 0) // Remove grupos vazios
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [availableSlots]);

  const totalSlots = groupedSlots.reduce((sum, group) => sum + group.slots.length, 0);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="available-slots-modal__overlay" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="available-slots-modal-title"
    >
      <div className="available-slots-modal__container">
        {/* Header */}
        <div className="available-slots-modal__header">
          <button 
            className="available-slots-modal__close" 
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 id="available-slots-modal-title" className="available-slots-modal__title">
            Horários disponíveis ({totalSlots})
          </h2>
        </div>

        {/* Body - Grupos por data */}
        <div className="available-slots-modal__body">
          {groupedSlots.length > 0 ? (
            groupedSlots.map((group, groupIndex) => (
              <div key={group.date || groupIndex} className="slots-group">
                <div className="slots-group__header">
                  <div className="slots-group__icon">
                    <Calendar size={20} />
                  </div>
                  <h3 className="slots-group__title">
                    {formatDate(group.date)} ({group.slots.length} horário{group.slots.length !== 1 ? 's' : ''})
                  </h3>
                </div>
                <div className="slots-group__times">
                  {group.slots.map((time, index) => (
                    <div key={`${group.date}-${time}-${index}`} className="slot-time">
                      <Clock size={16} />
                      <span>{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="slots-empty">
              <p>Não há horários disponíveis no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
