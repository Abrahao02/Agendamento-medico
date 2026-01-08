import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import "./Settings.css";

export default function Settings() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [loadingSave, setLoadingSave] = useState(false);

  // 💰 Valor padrão
  const [defaultValueSchedule, setDefaultValueSchedule] = useState("");

  // 💬 WhatsApp config
  const [whatsappIntro, setWhatsappIntro] = useState("Olá");
  const [whatsappBody, setWhatsappBody] = useState(
    "Sua sessão está agendada"
  );
  const [whatsappFooter, setWhatsappFooter] = useState(
    "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!"
  );
  const [whatsappShowValue, setWhatsappShowValue] = useState(true);

  // 🔐 Auth
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // 📥 Buscar dados do médico
  useEffect(() => {
    if (!user) return;

    const fetchDoctor = async () => {
      const snap = await getDoc(doc(db, "doctors", user.uid));
      if (snap.exists()) {
        const data = snap.data();

        setDefaultValueSchedule(data.defaultValueSchedule || "");
        setWhatsappIntro(data.whatsappConfig?.intro || "Olá");
        setWhatsappBody(
          data.whatsappConfig?.body || "Sua sessão está agendada"
        );
        setWhatsappFooter(
          data.whatsappConfig?.footer ||
            "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!"
        );
        setWhatsappShowValue(
          data.whatsappConfig?.showValue ?? true
        );
      }
    };

    fetchDoctor();
  }, [user]);

  // 💾 Salvar configurações
  const handleSave = async () => {
    if (!user) return;

    try {
      setLoadingSave(true);

      await updateDoc(doc(db, "doctors", user.uid), {
        defaultValueSchedule: Number(defaultValueSchedule),
        whatsappConfig: {
          intro: whatsappIntro,
          body: whatsappBody,
          footer: whatsappFooter,
          showValue: whatsappShowValue,
        },
      });

      alert("Configurações salvas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar configurações");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

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
          value={whatsappIntro}
          onChange={(e) => setWhatsappIntro(e.target.value)}
        />

        <label>Texto principal</label>
        <textarea
          rows={3}
          value={whatsappBody}
          onChange={(e) => setWhatsappBody(e.target.value)}
        />

        <label>Texto final</label>
        <textarea
          rows={3}
          value={whatsappFooter}
          onChange={(e) => setWhatsappFooter(e.target.value)}
        />

        {/* ✅ Mostrar valor */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={whatsappShowValue}
            onChange={(e) =>
              setWhatsappShowValue(e.target.checked)
            }
          />
          Incluir valor da consulta na mensagem
        </label>

        {/* 👁 Preview */}
        <div className="whatsapp-preview">
          <h4>Preview, exemplo:</h4>
          <div className="preview-box">
            <p>
              <strong>{whatsappIntro} João</strong>
            </p>
            <p>{whatsappBody}</p>
            <p>
              Data: 07/01/2026 <br />
              Horário: 12:00 <br />
              {whatsappShowValue && (
                <>Valor: R$ {defaultValueSchedule}</>
              )}
            </p>
            <p>{whatsappFooter}</p>
          </div>
        </div>
      </section>

      <button
        className="save-btn"
        onClick={handleSave}
        disabled={loadingSave}
      >
        {loadingSave ? "Salvando..." : "Salvar configurações"}
      </button>
    </div>
  );
}
