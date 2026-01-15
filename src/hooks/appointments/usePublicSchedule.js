// src/hooks/usePublicSchedule.js - REFATORADO
import { useEffect, useState, useMemo, useCallback } from "react";

// Services
import { getDoctorBySlug } from "../../services/firebase/doctors.service";
import { getAvailability } from "../../services/firebase/availability.service";
import { 
  getAppointmentsByDoctor
} from "../../services/firebase/appointments.service";
import { createPublicAppointment as createPublicAppointmentService } from "../../services/appointments/publicAppointment.service";
import { sendAppointmentEmail } from "../../services/api/email.service";

import {
  validatePatientName,
  validateWhatsapp,
  validateSelectedSlot,
} from "../../utils/validators/appointmentValidations";

import {
  validateAvailability,
  filterAvailableSlots
} from "../../utils/filters/availabilityFilters";
import { filterByPeriodConfig } from "../../utils/filters/publicScheduleFilters";

// ✅ UTILS - Appointments
import { filterAppointments } from "../../utils/filters/appointmentFilters";

// ✅ UTILS - WhatsApp
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";

// ✅ CONSTANTS
import { STATUS_GROUPS, APPOINTMENT_STATUS } from "../../constants/appointmentStatus";
import { logError } from "../../utils/logger/logger";
import {
  calculateMonthlyAppointmentsCount,
  checkLimitReached,
} from "../../utils/limits/calculateMonthlyLimit";

import { filterSlotsByLocation } from "../../utils/filters/slotFilters";
import { getAvailableLocationsWithInfo } from "../../utils/locations/locationHelpers";
import { normalizeSlotsArray } from "../../utils/availability/normalizeSlot";
import { buildPublicScheduleAvailability } from "../../utils/availability/publicScheduleAvailability";

export const usePublicSchedule = (slug) => {
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // ✅ Todos os appointments (incluindo cancelados)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [attendedPatientsCount, setAttendedPatientsCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  /* ==============================
     LOAD INITIAL DATA
  ============================== */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Carrega médico
        const doctorResult = await getDoctorBySlug(slug);
        if (!doctorResult.success) {
          throw new Error(doctorResult.error);
        }
        
        const doctorData = doctorResult.data;
        setDoctor(doctorData);

        // 3. ✅ Carrega e valida disponibilidade com util
        const availabilityResult = await getAvailability(doctorData.id);
        
        if (availabilityResult.success) {
          const validAvailability = validateAvailability(availabilityResult.data, true);
          
          const periodConfig = doctorData.publicScheduleConfig?.period || "all_future";
          const filteredByPeriod = filterByPeriodConfig(validAvailability, periodConfig);
          
          setAvailability(filteredByPeriod);
        }

        const appointmentsResult = await getAppointmentsByDoctor(doctorData.id);
        
        if (appointmentsResult.success) {
          // ✅ Carrega TODOS os appointments futuros (incluindo cancelados para mostrar slots livres)
          const futureAppointments = filterAppointments(appointmentsResult.data, {
            futureOnly: true,
            statusFilter: "Todos"
          });
          
          // ✅ Para validações, usa apenas ACTIVE
          const activeAppointments = futureAppointments.filter(a => STATUS_GROUPS.ACTIVE.includes(a.status));
          setAppointments(activeAppointments);
          
          // ✅ Guarda todos os appointments (incluindo cancelados) para incluir slots cancelados
          setAllAppointments(futureAppointments);

          // Calculate limit
          const plan = doctorData.plan || "free";
          const count = calculateMonthlyAppointmentsCount(appointmentsResult.data);
          setAttendedPatientsCount(count);
          setLimitReached(checkLimitReached(plan, count));
        }

      } catch (err) {
        logError("Erro ao carregar agenda pública:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      load();
    }
  }, [slug]);

  const availableSlots = useMemo(
    () =>
      buildPublicScheduleAvailability({
        availability,
        activeAppointments: appointments,
        allAppointments,
        now: new Date(),
      }),
    [availability, appointments, allAppointments]
  );

  /* ==============================
     FILTER BY LOCATION
     Filters availability by selected location
  ============================== */
  const filteredAvailability = useMemo(() => {
    if (!selectedLocation) {
      return availableSlots;
    }

    return availableSlots.map(day => {
      // Normalize slots to handle both formats
      const normalizedSlots = normalizeSlotsArray(day.slots || [], doctor);
      
      // Filter slots by location
      const filteredSlots = filterSlotsByLocation(normalizedSlots, selectedLocation, doctor);
      
      return {
        ...day,
        slots: filteredSlots.map(s => s.time || s), // Convert back to original format for display
      };
    }).filter(day => day.slots.length > 0);
  }, [availableSlots, selectedLocation, doctor]);

  /* ==============================
     GET AVAILABLE LOCATIONS
     Extract unique locations from available slots
  ============================== */
  const availableLocations = useMemo(() => {
    if (!doctor || !availableSlots.length) return [];
    
    // Collect all slots from all days
    const allSlots = availableSlots.flatMap(day => day.slots || []);
    const normalizedSlots = normalizeSlotsArray(allSlots, doctor);
    
    return getAvailableLocationsWithInfo(normalizedSlots, doctor);
  }, [availableSlots, doctor]);

  /* ==============================
     UI HANDLERS
  ============================== */
  const handleDaySelect = (day) => {
    setSelectedDay(selectedDay?.id === day.id ? null : day);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (day, slot) => {
    if (!day || !day.date) return;
    
    // Extract time from slot (handles both string and object formats)
    const slotTime = typeof slot === "string" ? slot : (slot?.time || null);
    if (!slotTime) return;
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day.date)) return;
    
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(slotTime)) return;
    if (slotTime.includes('-')) return;
    
    // Find the actual slot object from day.slots
    const actualSlot = typeof slot === "object" && slot.time 
      ? slot 
      : (day.slots || []).find(s => {
          const sTime = typeof s === "string" ? s : (s?.time || null);
          return sTime === slotTime;
        });
    
    const slotData = { 
      dayId: day.id,
      date: day.date,
      time: slotTime,
      slotData: actualSlot, // Include full slot object
    };
    
    setSelectedSlot(slotData);
  };

  /* ==============================
     ✅ CREATE APPOINTMENT
     Usa utils de validação e geração de ID
  ============================== */
  const createPublicAppointment = async (formData) => {
    try {
      if (!doctor) {
        throw new Error("Médico não carregado.");
      }

      if (limitReached) {
        throw new Error("Atenção: você chegou ao limite permitido de consultas atendidas no mês.");
      }

      if (!selectedSlot || !selectedSlot.date || !selectedSlot.time) {
        throw new Error("Nenhum horário selecionado.");
      }

      // Valida formatos
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

      if (!dateRegex.test(selectedSlot.date)) {
        throw new Error("Data em formato inválido. Esperado: YYYY-MM-DD");
      }

      if (!timeRegex.test(selectedSlot.time)) {
        throw new Error("Horário em formato inválido. Esperado: HH:mm");
      }

      const { patientName, patientWhatsapp } = formData;

      validatePatientName(patientName);
      validateWhatsapp(patientWhatsapp);
      validateSelectedSlot(selectedSlot);
      
      // Clean WhatsApp for email (backend will also clean it)
      const cleanWhatsappNumber = cleanWhatsapp(patientWhatsapp);

      // All validation happens server-side
      const result = await createPublicAppointmentService({
        doctorSlug: doctor.slug,
        date: selectedSlot.date,
        time: selectedSlot.time,
        patientName: patientName.trim(),
        patientWhatsapp: patientWhatsapp, // Service will clean it
        appointmentType: formData.appointmentType || null,
        location: formData.location || null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Atualiza lista local (opcional - dados podem ser recarregados)
      // Note: We don't have the full appointment data here since it's created server-side

      // Limpa seleção
      setSelectedDay(null);
      setSelectedSlot(null);

      // Envia email (opcional - value is calculated server-side, so we send without it)
      sendAppointmentEmail({
        doctor,
        patientName: patientName.trim(),
        whatsapp: cleanWhatsappNumber,
        date: selectedSlot.date,
        time: selectedSlot.time,
        value: 0, // Value calculated server-side, not available here
      }).catch(err => logError("Erro ao enviar email:", err));

      return { 
        success: true, 
        data: { 
          name: patientName, 
          date: selectedSlot.date, 
          time: selectedSlot.time 
        } 
      };

    } catch (err) {
      logError("Erro ao criar agendamento:", err);
      return { 
        success: false, 
        error: err.message || "Erro ao agendar." 
      };
    }
  };

  /* ==============================
     RETURN
  ============================== */
  return {
    doctor,
    availability: filteredAvailability,
    availableLocations,
    loading,
    error,

    attendedPatientsCount,
    limitReached,

    selectedDay,
    selectedSlot,
    selectedLocation,

    handleDaySelect,
    handleSlotSelect,
    setSelectedLocation,
    createAppointment: createPublicAppointment,
  };
};