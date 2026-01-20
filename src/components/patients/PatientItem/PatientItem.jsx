// src/components/patients/PatientItem/PatientItem.jsx
import React from "react";
import Button from "../../common/Button";
import { Edit, Save, X, ChevronDown, ChevronUp, Phone, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "../../../utils/formatter/formatCurrency";
import { usePatientItem } from "../../../hooks/patients/usePatientItem";
import "./PatientItem.css";

function PatientItem({
  patient,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  formatWhatsappDisplay,
}) {
  const { state, handlers } = usePatientItem({
    isEditing,
    onEdit,
    onSave,
    onCancel,
  });

  return (
    <div className="patient-item" onClick={handlers.handleItemClick}>
      <div className="patient-item-content">
        {/* Header com nome, WhatsApp e ações */}
        <div className="patient-item-header">
          <div className="patient-item-header-info">
            <div className="patient-item-name-display">
              <input
                type="text"
                value={patient.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                disabled={!isEditing}
                className="patient-item-input patient-item-input-name"
                placeholder="Nome completo"
                onClick={(e) => {
                  if (isEditing) {
                    e.stopPropagation();
                  }
                }}
              />
              {!state.isExpanded && (
                <span className="patient-item-whatsapp-badge">
                  {formatWhatsappDisplay(patient.whatsapp)}
                </span>
              )}
            </div>
          </div>
          
          {/* Botões de ação no cabeçalho */}
          <div className="patient-item-header-actions">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handlers.handleEditClick}
                  className="patient-item-edit-icon-btn"
                  aria-label="Editar paciente"
                >
                  <Edit size={18} />
                </button>
                <button
                  type="button"
                  onClick={handlers.toggleExpand}
                  className="patient-item-expand-btn"
                  aria-label={state.isExpanded ? "Recolher" : "Expandir"}
                >
                  {state.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </>
            ) : (
              <div className="patient-item-edit-actions-header">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlers.handleSaveClick}
                  disabled={isSaving}
                  loading={isSaving}
                  leftIcon={!isSaving ? <Save size={16} /> : null}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlers.handleCancelClick}
                  disabled={isSaving}
                  leftIcon={<X size={16} />}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo colapsável */}
        {state.isExpanded && (
          <div className="patient-item-details-wrapper">
            <div className="patient-item-details">
              <div className="patient-item-field">
                <label>Nome de referência</label>
                <input
                  type="text"
                  value={patient.referenceName || ""}
                  onChange={(e) => onFieldChange("referenceName", e.target.value)}
                  disabled={!isEditing}
                  className="patient-item-input"
                  placeholder="Nome preferido"
                />
              </div>

              <div className="patient-item-field">
                <label>WhatsApp</label>
                <div className="patient-item-whatsapp">
                  <Phone size={16} />
                  {formatWhatsappDisplay(patient.whatsapp)}
                </div>
              </div>

              <div className="patient-item-field">
                <label>Valor da consulta</label>
                {!isEditing ? (
                  <div className="patient-item-price-display">
                    <DollarSign size={16} />
                    {formatCurrency(patient.price || 0)}
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={patient.price || 0}
                    onChange={(e) => onFieldChange("price", e.target.value)}
                    className="patient-item-input patient-item-input-price"
                    placeholder="0.00"
                  />
                )}
              </div>

              <div className="patient-item-field">
                <label>Total de consultas</label>
                <div className="patient-item-total">
                  <Calendar size={16} />
                  {patient.totalConsultas || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(PatientItem);