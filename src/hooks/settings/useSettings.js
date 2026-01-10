// ============================================
// 📁 src/hooks/useSettings.js - REFATORADO
// ============================================
import { useState, useEffect } from "react";
import { DoctorService } from "../../services/firebase";
import { generateWhatsappMessage } from "../../utils/message/generateWhatsappMessage";

/**
 * Hook para gerenciar configurações do médico
 * @param {Object} user - Usuário autenticado do Firebase
 * @returns {Object} Estado e funções para gerenciar configurações
 */
export function useSettings(user) {
  // 🔄 Estados de loading
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 💰 Configurações financeiras
  const [defaultValueSchedule, setDefaultValueSchedule] = useState("");

  // 💬 Configurações do WhatsApp
  const [whatsappConfig, setWhatsappConfig] = useState({
    intro: "Olá",
    body: "Sua sessão está agendada",
    footer:
      "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!",
    showValue: true,
  });

  // 📥 Buscar configurações do médico
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      setLoading(true);

      try {
        const result = await DoctorService.getDoctor(user.uid);

        if (result.success) {
          const data = result.data;

          // 💰 Valor padrão da consulta
          setDefaultValueSchedule(data.defaultValueSchedule || "");

          // 💬 Configuração WhatsApp
          setWhatsappConfig({
            intro: data.whatsappConfig?.intro || "Olá",
            body:
              data.whatsappConfig?.body || "Sua sessão está agendada",
            footer:
              data.whatsappConfig?.footer ||
              "Caso não possa comparecer, por favor avisar com antecedência. Obrigado!",
            showValue: data.whatsappConfig?.showValue ?? true,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // 💾 Salvar configurações
  const saveSettings = async () => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      setSaving(true);

      return await DoctorService.updateDoctor(user.uid, {
        defaultValueSchedule: Number(defaultValueSchedule) || 0,
        whatsappConfig: {
          intro: whatsappConfig.intro,
          body: whatsappConfig.body,
          footer: whatsappConfig.footer,
          showValue: whatsappConfig.showValue,
        },
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  // 🔄 Atualizar campo do WhatsApp
  const updateWhatsappField = (field, value) => {
    setWhatsappConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ 📝 Gerar preview da mensagem - USA UTIL
  const generatePreview = (
    patientName = "João",
    date = "07/01/2026",
    time = "12:00"
  ) => {
    return generateWhatsappMessage({
      intro: whatsappConfig.intro,
      body: whatsappConfig.body,
      footer: whatsappConfig.footer,
      patientName,
      date,
      time,
      value: Number(defaultValueSchedule) || 0,
      showValue: whatsappConfig.showValue,
    });
  };

  return {
    // Estados
    loading,
    saving,
    defaultValueSchedule,
    whatsappConfig,

    // Setters
    setDefaultValueSchedule,
    updateWhatsappField,

    // Funções
    saveSettings,
    generatePreview,
  };
}