// src/hooks/usePublicSchedule.js - REFATORADO
import { useEffect, useState } from "react";

// Services
import { getDoctorBySlug } from "../../services/firebase/doctors.service";
import { getAvailability } from "../../services/firebase/availability.service";
import { 
  getAppointmentsByDoctor, 
  createAppointment 
} from "../../services/firebase/appointments.service";
import { sendAppointmentEmail } from "../../services/api/email.service";

// ✅ UTILS - Validações
import {
  validatePatientName,
  validateWhatsapp,
  validateSelectedSlot,
} from "../../utils/validators/appointmentValidations";

// ✅ UTILS - Availability
import {
  validateAvailability,
  filterAvailableSlots
} from "../../utils/filters/availabilityFilters";

// ✅ UTILS - Appointments
import { filterAppointments } from "../../utils/filters/appointmentFilters";

// ✅ UTILS - Patients
import { generatePatientId } from "../../utils/patients/generatePatientId";

// ✅ UTILS - WhatsApp
import { cleanWhatsapp } from "../../utils/whatsapp/cleanWhatsapp";

export const usePublicSchedule = (slug) => {
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [attendedPatientsCount, setAttendedPatientsCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

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

        // 2. Verifica limite (opcional)
        setAttendedPatientsCount(0);
        setLimitReached(false);

        // 3. ✅ Carrega e valida disponibilidade com util
        const availResult = await getAvailability(doctorData.id);
        
        if (availResult.success) {
          // ✅ USA validateAvailability - filtra futuras e válidas
          const validAvailability = validateAvailability(availResult.data, true);
          setAvailability(validAvailability);
        }

        // 4. ✅ Carrega e filtra agendamentos com util
        const appointmentsResult = await getAppointmentsByDoctor(doctorData.id);
        
        if (appointmentsResult.success) {
          // ✅ USA filterAppointments - apenas futuros e ativos
          const futureAppointments = filterAppointments(appointmentsResult.data, {
            futureOnly: true,
            statusFilter: "Todos" // Confirmado e Pendente
          }).filter(a => a.status === "Pendente" || a.status === "Confirmado");
          
          setAppointments(futureAppointments);
        }

      } catch (err) {
        console.error("Erro ao carregar agenda pública:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      load();
    }
  }, [slug]);

  /* ==============================
     ✅ FILTRA SLOTS DISPONÍVEIS
     USA filterAvailableSlots util
  ============================== */
  const filteredAvailability = filterAvailableSlots(availability, appointments);

  /* ==============================
     UI HANDLERS
  ============================== */
  const handleDaySelect = (day) => {
    setSelectedDay(selectedDay?.id === day.id ? null : day);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (day, time) => {
    // Validações
    if (!day || !day.date) {
      console.error("handleSlotSelect: day inválido ou sem date");
      return;
    }
    
    if (typeof time !== "string") {
      console.error("handleSlotSelect: time não é string");
      return;
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day.date)) {
      console.error("handleSlotSelect: day.date formato inválido:", day.date);
      return;
    }
    
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      console.error("handleSlotSelect: time formato inválido:", time);
      return;
    }
    
    if (time.includes('-')) {
      console.error("handleSlotSelect: time contém '-', parece ser uma data!");
      return;
    }
    
    const slotData = { 
      dayId: day.id,
      date: day.date,
      time
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

      // ✅ Validações com utils existentes
      validatePatientName(patientName);
      const whatsapp = validateWhatsapp(patientWhatsapp);
      validateSelectedSlot(selectedSlot);

      // Valor padrão
      const appointmentValue = doctor.defaultValueSchedule || 0;

      // ✅ USA generatePatientId util
      const patientId = generatePatientId(doctor.id, whatsapp);

      const appointmentData = {
        doctorId: doctor.id,
        patientId: patientId,
        patientName: patientName.trim(),
        patientWhatsapp: whatsapp,
        date: selectedSlot.date,
        time: selectedSlot.time,
        value: appointmentValue,
        status: "Pendente",
      };

      const result = await createAppointment(appointmentData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Atualiza lista local
      setAppointments(prev => [...prev, appointmentData]);

      // Limpa seleção
      setSelectedDay(null);
      setSelectedSlot(null);

      // Envia email (opcional)
      sendAppointmentEmail({
        doctor,
        patientName: patientName.trim(),
        whatsapp,
        date: selectedSlot.date,
        time: selectedSlot.time,
        value: appointmentValue,
      }).catch(err => console.error("Erro ao enviar email:", err));

      return { 
        success: true, 
        data: { 
          name: patientName, 
          date: selectedSlot.date, 
          time: selectedSlot.time 
        } 
      };

    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
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
    loading,
    error,

    attendedPatientsCount,
    limitReached,

    selectedDay,
    selectedSlot,

    handleDaySelect,
    handleSlotSelect,
    createAppointment: createPublicAppointment,
  };
};