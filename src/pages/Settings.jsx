// ============================================
// 📁 src/pages/Settings.jsx - REFATORADO
// ============================================
import React from "react";
import { auth } from "../services/firebase";
import { useSettings } from "../hooks/settings/useSettings";

import "./Settings.css";

export default function Settings() {
  const user = auth.currentUser;

  const {
    loading,
    saving,
    defaultValueSchedule,
    whatsappConfig,
    setDefaultValueSchedule,
    updateWhatsappField,
    saveSettings,
    generatePreview,
  } = useSettings(user);

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

  return (
    <div className="settings-page">
      <h1>Configurações</h1>

      {/* 💰 Valor padrão */}
      <section className="settings-card">
        <h2>Valor padrão da consulta</h2>
        <input
          type="number"
          placeholder="Ex: 100"
          value={defaultValueSchedule}
          onChange={(e) => setDefaultValueSchedule(e.target.value)}
        />
        <p className="helper-text">
          Este valor será usado para novos pacientes vindos do agendamento
          público.
        </p>
      </section>

      {/* 💬 WhatsApp */}
      <section className="settings-card">
        <h2>Mensagem padrão do WhatsApp</h2>

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

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </div>
  );
}