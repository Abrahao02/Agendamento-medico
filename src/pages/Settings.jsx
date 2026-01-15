import React from "react";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useSettings } from "../hooks/settings/useSettings";
import PlanSection from "../components/settings/PlanSection";
import WhatsAppSection from "../components/settings/WhatsAppSection";
import PublicScheduleSection from "../components/settings/PublicScheduleSection";
import AppointmentTypeSection from "../components/settings/AppointmentTypeSection";
import Button from "../components/common/Button";
import ContentLoading from "../components/common/ContentLoading";
import PageHeader from "../components/common/PageHeader";
import { Save, LogOut } from "lucide-react";
import { logError } from "../utils/logger/logger";
import { useToast } from "../components/common/Toast";

import "./Settings.css";

export default function Settings() {
  const user = auth.currentUser;
  const toast = useToast();

  const {
    loading,
    saving,
    doctor,
    isPro,
    whatsappConfig,
    publicScheduleConfig,
    appointmentTypeConfig,
    subscriptionEndDate,
    updateLocation,
    removeLocation,
    newLocationName,
    newLocationValue,
    cancelLoading,
    cancelError,
    reactivateLoading,
    reactivateError,
    hasUnsavedChanges,
    updateWhatsappField,
    updatePublicScheduleField,
    updateAppointmentTypeField,
    setNewLocationName,
    setNewLocationValue,
    handleAddLocation,
    handleCancelSubscription,
    handleReactivateSubscription,
    saveSettings,
    generatePreview,
  } = useSettings(user);

  const handleSave = async () => {
    const result = await saveSettings();

    if (result.success) {
      toast.success("Configurações salvas com sucesso!");
    } else {
      toast.error(`Erro ao salvar: ${result.error || "Tente novamente"}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      logError("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <ContentLoading message="Carregando configurações..." />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <PageHeader
        label="Configurações"
        title="Configurações"
        description="Gerencie suas preferências e plano"
      />

      <PlanSection
        isPro={isPro}
        doctor={doctor}
        subscriptionEndDate={subscriptionEndDate}
        onCancel={handleCancelSubscription}
        onReactivate={handleReactivateSubscription}
        cancelLoading={cancelLoading}
        reactivateLoading={reactivateLoading}
        cancelError={cancelError}
        reactivateError={reactivateError}
      />

      <PublicScheduleSection
        publicScheduleConfig={publicScheduleConfig}
        onUpdateField={updatePublicScheduleField}
      />

      <AppointmentTypeSection
        appointmentTypeConfig={appointmentTypeConfig}
        onUpdateField={updateAppointmentTypeField}
        onAddLocation={handleAddLocation}
        onUpdateLocation={updateLocation}
        onRemoveLocation={removeLocation}
        newLocationName={newLocationName}
        newLocationValue={newLocationValue}
        onNewLocationNameChange={setNewLocationName}
        onNewLocationValueChange={setNewLocationValue}
      />

      <WhatsAppSection
        whatsappConfig={whatsappConfig}
        onUpdateField={updateWhatsappField}
        preview={generatePreview()}
      />

      {hasUnsavedChanges && (
        <div className={`settings-footer ${hasUnsavedChanges ? 'sticky' : ''}`}>
          <Button
            onClick={handleSave}
            disabled={saving}
            loading={saving}
            variant="primary"
            leftIcon={!saving ? <Save size={18} /> : null}
            className="save-btn"
          >
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
          <p className="footer-note">
            Você tem alterações não salvas. Salve para aplicar as configurações.
          </p>
        </div>
      )}

      {/* Botão de Logout */}
      <div className="settings-logout-section">
        <Button
          onClick={handleLogout}
          variant="ghost"
          leftIcon={<LogOut size={18} />}
          className="logout-button"
        >
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
