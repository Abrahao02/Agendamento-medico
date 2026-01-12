import React, { useState } from "react";
import { auth } from "../services/firebase";
import { useSettings } from "../hooks/settings/useSettings";
import { getPeriodOptions } from "../constants/publicScheduleConfig";
import {
  getAppointmentTypeModeOptions,
  getAppointmentTypeOptions,
  APPOINTMENT_TYPE,
  APPOINTMENT_TYPE_MODE,
} from "../constants/appointmentType";
import { Check, Crown, Zap } from "lucide-react";

import "./Settings.css";

export default function Settings() {
  const user = auth.currentUser;

  const {
    loading,
    saving,
    doctor,
    whatsappConfig,
    publicScheduleConfig,
    appointmentTypeConfig,
    updateWhatsappField,
    updatePublicScheduleField,
    updateAppointmentTypeField,
    addLocation,
    updateLocation,
    removeLocation,
    saveSettings,
    generatePreview,
  } = useSettings(user);

  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationValue, setNewLocationValue] = useState("");

  const handleSave = async () => {
    const result = await saveSettings();

    if (result.success) {
      alert("Configurações salvas com sucesso!");
    } else {
      alert(`Erro ao salvar: ${result.error || "Tente novamente"}`);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <p>Carregando configurações...</p>
      </div>
    );
  }

  const currentPlan = doctor?.plan || "free";
  const isPro = currentPlan === "pro";

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Configurações</h1>
        <p className="settings-subtitle">Gerencie suas preferências e plano</p>
      </div>

      {!isPro && (
        <section className="settings-card plan-upgrade-card">
          <div className="plan-upgrade-header">
            <div className="plan-upgrade-icon">
              <Crown size={24} />
            </div>
            <div>
              <h2>Upgrade para PRO</h2>
              <p className="helper-text">
                Desbloqueie recursos ilimitados e funcionalidades avançadas
              </p>
            </div>
          </div>
          <div className="plan-features-grid">
            <div className="plan-feature">
              <Check size={18} />
              <span>Consultas ilimitadas</span>
            </div>
            <div className="plan-feature">
              <Check size={18} />
              <span>Controle avançado</span>
            </div>
            <div className="plan-feature">
              <Check size={18} />
              <span>Relatórios detalhados</span>
            </div>
            <div className="plan-feature">
              <Check size={18} />
              <span>Suporte prioritário</span>
            </div>
          </div>
          <a
            href="https://mpago.la/1TYVDfE"
            target="_blank"
            rel="noopener noreferrer"
            className="upgrade-btn"
          >
            <Zap size={18} />
            Assinar PRO - R$ 49/mês
          </a>
        </section>
      )}

      {isPro && (
        <section className="settings-card plan-active-card">
          <div className="plan-active-header">
            <Crown size={20} />
            <div>
              <h2>Plano PRO Ativo</h2>
              <p className="helper-text">Você está aproveitando todos os recursos</p>
            </div>
          </div>
        </section>
      )}

      <section className="settings-card">
        <h2>Mensagem do WhatsApp</h2>
        <p className="helper-text" style={{ marginBottom: "1rem" }}>
          Personalize a mensagem enviada automaticamente aos pacientes após o agendamento.
        </p>

        <label>Início da mensagem</label>
        <input
          type="text"
          value={whatsappConfig.intro}
          onChange={(e) => updateWhatsappField("intro", e.target.value)}
        />

        <label>Texto principal</label>
        <textarea
          rows={3}
          value={whatsappConfig.body}
          onChange={(e) => updateWhatsappField("body", e.target.value)}
        />

        <label>Texto final</label>
        <textarea
          rows={3}
          value={whatsappConfig.footer}
          onChange={(e) => updateWhatsappField("footer", e.target.value)}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={whatsappConfig.showValue}
            onChange={(e) => updateWhatsappField("showValue", e.target.checked)}
          />
          Incluir valor da consulta na mensagem
        </label>

        <div className="whatsapp-preview">
          <h4>Preview da mensagem:</h4>
          <div className="preview-box">
            {generatePreview().split("\n").map((line, index) => (
              <p key={index}>{line || <br />}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-card">
        <h2>Agendamento Público</h2>
        <p className="helper-text" style={{ marginBottom: "1rem" }}>
          Configure como sua agenda pública será exibida para os pacientes.
        </p>

        <label>Período de exibição</label>

        <select
          value={publicScheduleConfig.period}
          onChange={(e) => updatePublicScheduleField("period", e.target.value)}
        >
          {getPeriodOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <p className="helper-text">
          {getPeriodOptions().find(opt => opt.value === publicScheduleConfig.period)?.description}
        </p>
      </section>

      <section className="settings-card">
        <h2>Tipo de Atendimento</h2>
        <p className="helper-text" style={{ marginBottom: "1rem" }}>
          Configure como os pacientes podem escolher entre atendimento online ou presencial.
        </p>

        <label>Modo de exibição</label>
        <select
          value={appointmentTypeConfig.mode}
          onChange={(e) => updateAppointmentTypeField("mode", e.target.value)}
        >
          {getAppointmentTypeModeOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {appointmentTypeConfig.mode === APPOINTMENT_TYPE_MODE.FIXED && (
          <>
            <label>Tipo fixo</label>
            <select
              value={appointmentTypeConfig.fixedType}
              onChange={(e) => updateAppointmentTypeField("fixedType", e.target.value)}
            >
              {getAppointmentTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        )}

        <div className="values-section">
          <h3 className="section-subtitle">Valores Padrão</h3>
          <p className="helper-text" style={{ marginBottom: "1rem" }}>
            Defina os valores que serão usados automaticamente para cada tipo de atendimento.
          </p>
          
          <label>Valor padrão para Online (R$)</label>
          <input
            type="number"
            placeholder="Ex: 100"
            value={appointmentTypeConfig.defaultValueOnline}
            onChange={(e) => updateAppointmentTypeField("defaultValueOnline", e.target.value)}
          />

          <label>Valor padrão para Presencial (R$)</label>
          <input
            type="number"
            placeholder="Ex: 150"
            value={appointmentTypeConfig.defaultValuePresencial}
            onChange={(e) => updateAppointmentTypeField("defaultValuePresencial", e.target.value)}
          />
        </div>

        {appointmentTypeConfig.mode !== APPOINTMENT_TYPE_MODE.DISABLED && (
          <div className="locations-section">
            <h3 className="section-subtitle">Locais de Atendimento Presencial</h3>
            <p className="helper-text" style={{ marginBottom: "1rem" }}>
              Adicione diferentes locais para atendimento presencial, cada um com seu próprio valor padrão.
            </p>

            {appointmentTypeConfig.locations.length > 0 && (
              <div className="locations-list">
                {appointmentTypeConfig.locations.map((location, index) => (
                  <div key={index} className="location-item">
                    <input
                      type="text"
                      placeholder="Nome do local"
                      value={location.name}
                      onChange={(e) => updateLocation(index, { ...location, name: e.target.value })}
                      className="location-name-input"
                    />
                    <input
                      type="number"
                      placeholder="Valor (R$)"
                      value={location.defaultValue}
                      onChange={(e) => updateLocation(index, { ...location, defaultValue: Number(e.target.value) || 0 })}
                      className="location-value-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="remove-location-btn"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="add-location-form">
              <input
                type="text"
                placeholder="Nome do novo local"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="location-name-input"
              />
              <input
                type="number"
                placeholder="Valor (R$)"
                value={newLocationValue}
                onChange={(e) => setNewLocationValue(e.target.value)}
                className="location-value-input"
              />
              <button
                type="button"
                onClick={() => {
                  if (newLocationName.trim() && newLocationValue) {
                    addLocation({
                      name: newLocationName.trim(),
                      defaultValue: Number(newLocationValue) || 0,
                    });
                    setNewLocationName("");
                    setNewLocationValue("");
                  }
                }}
                className="add-location-btn"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="settings-footer">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
        <p className="footer-note">
          As configurações são salvas automaticamente no Firebase e aplicadas imediatamente.
        </p>
      </div>
    </div>
  );
}