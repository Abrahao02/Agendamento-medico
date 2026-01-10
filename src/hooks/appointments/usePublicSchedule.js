// src/hooks/usePublicSchedule.js
import { useEffect, useState } from "react";

// Services
import { getDoctorBySlug } from "../../services/firebase/doctors.service";
import { getAvailability } from "../../services/firebase/availability.service";
import { 
  getAppointmentsByDoctor, 
  createAppointment 
} from "../../services/firebase/appointments.service";

// API externa (email)
import { sendAppointmentEmail } from "../../services/api/email.service";

// Validações
import {
  validatePatientName,
  validateWhatsapp,
  validateSelectedSlot,
} from "../../utils/validators/appointmentValidations";

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

        // 2. Verifica limite (opcional - você pode remover se não usar mais)
        // Mantive aqui caso você queira controlar limite de agendamentos públicos
        setAttendedPatientsCount(0);
        setLimitReached(false);

        // 3. Carrega disponibilidade
        const availResult = await getAvailability(doctorData.id);
        
        if (availResult.success) {
          const today = new Date().toISOString().split("T")[0];
          
          // Filtra apenas datas futuras e com slots válidos
          const validAvailability = availResult.data
            .filter(day => 
              day.date &&
              typeof day.date === "string" &&
              Array.isArray(day.slots) &&
              day.slots.length > 0 &&
              day.date >= today
            )
            .sort((a, b) => a.date.localeCompare(b.date));
          
          setAvailability(validAvailability);
        }

        // 4. Carrega agendamentos
        const appointmentsResult = await getAppointmentsByDoctor(doctorData.id);
        
        if (appointmentsResult.success) {
          const today = new Date().toISOString().split("T")[0];
          
          // Filtra apenas futuros e confirmados/pendentes
          const futureAppointments = appointmentsResult.data.filter(a => 
            a.date >= today && 
            (a.status === "Pendente" || a.status === "Confirmado")
          );
          
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
     FILTRA SLOTS DISPONÍVEIS
     (Remove horários já agendados)
  ============================== */
  const filteredAvailability = availability.map(day => {
    // Busca horários já agendados nessa data
    const bookedSlots = appointments
      .filter(a => a.date === day.date)
      .map(a => a.time);

    // Retorna apenas slots livres
    return {
      ...day,
      slots: day.slots.filter(slot => !bookedSlots.includes(slot)),
    };
  }).filter(day => day.slots.length > 0);

  /* ==============================
     UI HANDLERS
  ============================== */
  const handleDaySelect = (day) => {
    setSelectedDay(selectedDay?.id === day.id ? null : day);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (day, time) => {
    console.log("═══════════════════════════════════════");
    console.log("🔍 handleSlotSelect - INÍCIO");
    console.log("📥 Parâmetros recebidos:");
    console.log("  - day:", day);
    console.log("  - time:", time, "| tipo:", typeof time);
    
    // ✅ VALIDAÇÃO 1: Verifica se day existe e tem estrutura correta
    if (!day || !day.date) {
      console.error("❌ ERRO: day inválido ou sem date");
      console.error("  - day recebido:", day);
      return;
    }
    
    // ✅ VALIDAÇÃO 2: Verifica se time é uma string
    if (typeof time !== "string") {
      console.error("❌ ERRO: time não é string");
      console.error("  - time recebido:", time, "| tipo:", typeof time);
      return;
    }
    
    // ✅ VALIDAÇÃO 3: Verifica formato de date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(day.date)) {
      console.error("❌ ERRO: day.date não está no formato YYYY-MM-DD");
      console.error("  - day.date recebido:", day.date);
      return;
    }
    
    // ✅ VALIDAÇÃO 4: Verifica formato de time (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      console.error("❌ ERRO: time não está no formato HH:mm");
      console.error("  - time recebido:", time);
      console.error("  - esperado: formato 00:00 a 23:59");
      return;
    }
    
    // ✅ VALIDAÇÃO 5: Garante que não está confundindo date com time
    if (time.includes('-')) {
      console.error("❌ ERRO CRÍTICO: time contém '-', parece ser uma data!");
      console.error("  - time recebido:", time);
      console.error("  - Você provavelmente passou day.date ao invés do horário");
      return;
    }
    
    const slotData = { 
      dayId: day.id,
      date: day.date,  // ✅ Formato: "2026-01-16"
      time              // ✅ Formato: "18:00"
    };
    
    console.log("✅ Validações OK! Setando selectedSlot:");
    console.log("  - dayId:", slotData.dayId);
    console.log("  - date:", slotData.date, "(YYYY-MM-DD)");
    console.log("  - time:", slotData.time, "(HH:mm)");
    console.log("═══════════════════════════════════════\n");
    
    setSelectedSlot(slotData);
  };

  /* ==============================
     CREATE APPOINTMENT
     ✅ SEM CRIAR PACIENTE - apenas appointment
  ============================== */
  const createPublicAppointment = async (formData) => {
    try {
      console.log("\n🚀 ═══════════════════════════════════════");
      console.log("📤 createPublicAppointment - INÍCIO");
      console.log("📋 formData:", formData);
      console.log("🎯 selectedSlot:", selectedSlot);

      if (!doctor) {
        throw new Error("Médico não carregado.");
      }

      // ✅ VALIDAÇÃO CRÍTICA: Verifica selectedSlot ANTES de prosseguir
      if (!selectedSlot) {
        throw new Error("Nenhum horário selecionado.");
      }

      if (!selectedSlot.date || !selectedSlot.time) {
        console.error("❌ selectedSlot incompleto:", selectedSlot);
        throw new Error("Dados do horário selecionado estão incompletos.");
      }

      // ✅ Valida formatos ANTES de enviar
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

      if (!dateRegex.test(selectedSlot.date)) {
        console.error("❌ selectedSlot.date formato inválido:", selectedSlot.date);
        throw new Error("Data em formato inválido. Esperado: YYYY-MM-DD");
      }

      if (!timeRegex.test(selectedSlot.time)) {
        console.error("❌ selectedSlot.time formato inválido:", selectedSlot.time);
        throw new Error("Horário em formato inválido. Esperado: HH:mm");
      }

      console.log("✅ Formatos validados:");
      console.log("  - date:", selectedSlot.date, "(YYYY-MM-DD) ✓");
      console.log("  - time:", selectedSlot.time, "(HH:mm) ✓");

      const { patientName, patientWhatsapp } = formData;

      // Validações básicas
      validatePatientName(patientName);
      const whatsapp = validateWhatsapp(patientWhatsapp);
      validateSelectedSlot(selectedSlot);

      console.log("✅ Validações OK - whatsapp limpo:", whatsapp);

      // Valor padrão
      const appointmentValue = doctor.defaultValueSchedule || 0;

      // ✅ CRIA APENAS O APPOINTMENT (sem criar paciente)
      // O patientId será gerado no formato: doctorId_whatsapp
      const patientId = `${doctor.id}_${whatsapp}`;

      const appointmentData = {
        doctorId: doctor.id,
        patientId: patientId,              // ID temporário até médico adicionar
        patientName: patientName.trim(),
        patientWhatsapp: whatsapp,
        date: selectedSlot.date,           // ✅ STRING: "2026-01-16"
        time: selectedSlot.time,           // ✅ STRING: "18:00"
        value: appointmentValue,
        status: "Pendente",                // Médico vai confirmar depois
      };

      console.log("📤 DADOS FINAIS para createAppointment:");
      console.log("  - doctorId:", appointmentData.doctorId);
      console.log("  - patientId:", appointmentData.patientId);
      console.log("  - patientName:", appointmentData.patientName);
      console.log("  - patientWhatsapp:", appointmentData.patientWhatsapp);
      console.log("  - date:", appointmentData.date, "| tipo:", typeof appointmentData.date);
      console.log("  - time:", appointmentData.time, "| tipo:", typeof appointmentData.time);
      console.log("  - value:", appointmentData.value);
      console.log("  - status:", appointmentData.status);

      const result = await createAppointment(appointmentData);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log("✅ Agendamento criado com sucesso!");
      console.log("═══════════════════════════════════════\n");

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
      console.error("❌ Erro ao criar agendamento:", err);
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