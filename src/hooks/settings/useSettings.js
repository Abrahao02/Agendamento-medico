// ============================================
// 📁 src/hooks/settings/useSettings.js
// Hook principal que orquestra os hooks especializados
// ============================================

import { useState, useEffect, useMemo } from "react";
import * as DoctorService from "../../services/firebase/doctors.service";
import { useCancelSubscription } from "../stripe/useCancelSubscription";
import { useReactivateSubscription } from "../stripe/useReactivateSubscription";
import { useWhatsappSettings } from "./useWhatsappSettings";
import { usePublicScheduleSettings } from "./usePublicScheduleSettings";
import { useAppointmentTypeSettings } from "./useAppointmentTypeSettings";
import { logError } from "../../utils/logger/logger";
import { useToast } from "../../components/common/Toast";

export function useSettings(user) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);

  // Subscription hooks
  const { handleCancel, loading: cancelLoading, error: cancelError } = useCancelSubscription();
  const { handleReactivate, loading: reactivateLoading, error: reactivateError } = useReactivateSubscription();

  // Settings hooks
  const whatsappSettings = useWhatsappSettings();
  const publicScheduleSettings = usePublicScheduleSettings();
  const appointmentTypeSettings = useAppointmentTypeSettings();

  // Fetch settings
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
          setDoctor(data);

          // Initialize all settings
          whatsappSettings.initializeWhatsappConfig(data.whatsappConfig);
          publicScheduleSettings.initializePublicScheduleConfig(data.publicScheduleConfig);
          appointmentTypeSettings.initializeAppointmentTypeConfig(data.appointmentTypeConfig);
        }
      } catch (error) {
        logError("Erro ao buscar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save settings
  const saveSettings = async () => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      setSaving(true);

      const newConfig = {
        whatsappConfig: whatsappSettings.getConfigForSave(),
        publicScheduleConfig: publicScheduleSettings.getConfigForSave(),
        appointmentTypeConfig: appointmentTypeSettings.getConfigForSave(),
      };

      const result = await DoctorService.updateDoctor(user.uid, newConfig);

      // Update saved state after successful save
      if (result.success) {
        whatsappSettings.markAsSaved();
        publicScheduleSettings.markAsSaved();
        appointmentTypeSettings.markAsSaved();
      }

      return result;
    } catch (error) {
      logError("Erro ao salvar configurações:", error);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso PRO até o final do período pago.')) {
      const result = await handleCancel();
      if (result.success) {
        toast.success('Assinatura cancelada com sucesso. Você continuará com acesso PRO até o final do período pago.');
        window.location.reload();
      } else {
        toast.error(`Erro ao cancelar: ${result.error || 'Tente novamente'}`);
      }
    }
  };

  const handleReactivateSubscription = async () => {
    if (confirm('Tem certeza que deseja reativar sua assinatura? Ela continuará sendo cobrada normalmente.')) {
      const result = await handleReactivate();
      if (result.success) {
        toast.success('Assinatura reativada com sucesso.');
        window.location.reload();
      } else {
        toast.error(`Erro ao reativar: ${result.error || 'Tente novamente'}`);
      }
    }
  };

  // Calcular data de término da assinatura
  const subscriptionEndDate = useMemo(() => {
    if (!doctor?.planUpdatedAt) return null;
    try {
      const startDate = doctor.planUpdatedAt?.toDate 
        ? doctor.planUpdatedAt.toDate() 
        : doctor.planUpdatedAt?.seconds 
        ? new Date(doctor.planUpdatedAt.seconds * 1000)
        : new Date(doctor.planUpdatedAt);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      return endDate;
    } catch (error) {
      logError('Erro ao calcular data:', error);
      return null;
    }
  }, [doctor?.planUpdatedAt]);

  const isPro = useMemo(() => {
    return doctor?.plan === "pro";
  }, [doctor?.plan]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      whatsappSettings.hasUnsavedChanges ||
      publicScheduleSettings.hasUnsavedChanges ||
      appointmentTypeSettings.hasUnsavedChanges
    );
  }, [
    whatsappSettings.hasUnsavedChanges,
    publicScheduleSettings.hasUnsavedChanges,
    appointmentTypeSettings.hasUnsavedChanges,
  ]);

  const generatePreview = (
    patientName = "João",
    date = "07/01/2026",
    time = "12:00"
  ) => {
    const defaultValue = appointmentTypeSettings.appointmentTypeConfig.defaultValueOnline || 
                        appointmentTypeSettings.appointmentTypeConfig.defaultValuePresencial || 
                        150;
    return whatsappSettings.generatePreview(patientName, date, time, defaultValue);
  };

  return {
    loading,
    saving,
    doctor,
    isPro,
    whatsappConfig: whatsappSettings.whatsappConfig,
    publicScheduleConfig: publicScheduleSettings.publicScheduleConfig,
    appointmentTypeConfig: appointmentTypeSettings.appointmentTypeConfig,
    subscriptionEndDate,
    newLocationName: appointmentTypeSettings.newLocationName,
    newLocationValue: appointmentTypeSettings.newLocationValue,
    cancelLoading,
    cancelError,
    reactivateLoading,
    reactivateError,
    hasUnsavedChanges,
    updateWhatsappField: whatsappSettings.updateWhatsappField,
    updatePublicScheduleField: publicScheduleSettings.updatePublicScheduleField,
    updateAppointmentTypeField: appointmentTypeSettings.updateAppointmentTypeField,
    setNewLocationName: appointmentTypeSettings.setNewLocationName,
    setNewLocationValue: appointmentTypeSettings.setNewLocationValue,
    handleAddLocation: appointmentTypeSettings.handleAddLocation,
    updateLocation: appointmentTypeSettings.updateLocation,
    removeLocation: appointmentTypeSettings.removeLocation,
    handleCancelSubscription,
    handleReactivateSubscription,
    saveSettings,
    generatePreview,
  };
}
