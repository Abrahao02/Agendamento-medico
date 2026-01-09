// src/hooks/usePublicSchedule.js
import { useEffect, useState } from "react";

// Services
import { getDoctorBySlug } from "../../services/firebase/doctors.service";
import { getAvailability } from "../../services/firebase/availability.service";
import { getAppointmentsByDoctor, createAppointment } from "../../services/firebase/appointments.service";

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
        // Carrega médico
        const doctorResult = await getDoctorBySlug(slug);
        if (!doctorResult.success) throw new Error(doctorResult.error);
        const doctorData = doctorResult.data;
        setDoctor(doctorData);

        // Carrega disponibilidade
        const today = new Date().toISOString().split("T")[0];
        const availResult = await getAvailability(doctorData.id, { minDate: today });
        if (availResult.success) {
          setAvailability(
            availResult.data.filter(day => Array.isArray(day.slots) && day.slots.length > 0)
          );
        }

        // Carrega agendamentos
        const appointmentsResult = await getAppointmentsByDoctor(doctorData.id);
        if (appointmentsResult.success) {
          // filtra apenas agendamentos futuros
          const futureAppointments = appointmentsResult.data.filter(a => a.date >= today);
          setAppointments(futureAppointments);
        }

        // Verifica limite do plano
        const limit = doctorData.patientLimit || 10;
        setLimitReached(doctorData.plan === "free" && attendedPatientsCount >= limit);

      } catch (err) {
        console.error("Erro ao carregar agenda pública:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    if (slug) load();
  }, [slug, attendedPatientsCount]);

  /* ==============================
     FILTRA SLOTS DISPONÍVEIS
  ============================== */
  const filteredAvailability = availability.map(day => {
    const bookedSlots = appointments
      .filter(a => a.date === day.date && (a.status === "Pendente" || a.status === "Aprovado"))
      .map(a => a.time);

    return {
      ...day,
      slots: day.slots.filter(slot => !bookedSlots.includes(slot)),
    };
  });

  /* ==============================
     UI HANDLERS
  ============================== */
  const handleDaySelect = (day) => {
    setSelectedDay(selectedDay?.id === day.id ? null : day);
  };

  const handleSlotSelect = (day, time) => {
    setSelectedSlot({ date: day.date, time });
  };

  /* ==============================
     CREATE APPOINTMENT
  ============================== */
  const createPublicAppointment = async (formData) => {
    try {
      if (!doctor) throw new Error("Médico não carregado.");
      if (doctor.plan === "free" && limitReached)
        throw new Error("Limite de pacientes do plano gratuito atingido.");

      const { patientName, patientWhatsapp } = formData;
      validatePatientName(patientName);
      const whatsapp = validateWhatsapp(patientWhatsapp);
      validateSelectedSlot(selectedSlot);

      // Cria agendamento no Firebase
      const result = await createAppointment({
        doctorId: doctor.id,
        doctorSlug: doctor.slug,
        patientId: whatsapp,
        patientName: patientName.trim(),
        patientWhatsapp: whatsapp,
        date: selectedSlot.date,
        time: selectedSlot.time,
        value: doctor.defaultValueSchedule || 0,
        status: "Pendente",
      });

      if (!result.success) throw new Error(result.error);

      // Atualiza lista local
      setAppointments(prev => [
        ...prev,
        {
          doctorId: doctor.id,
          patientId: whatsapp,
          patientName,
          patientWhatsapp: whatsapp,
          date: selectedSlot.date,
          time: selectedSlot.time,
          value: doctor.defaultValueSchedule || 0,
          status: "Pendente",
        },
      ]);

      // Envia email
      sendAppointmentEmail({
        doctor,
        patientName,
        whatsapp,
        date: selectedSlot.date,
        time: selectedSlot.time,
        value: doctor.defaultValueSchedule || 0,
      }).catch(err => console.error("Erro ao enviar email:", err));

      setSelectedDay(null);
      setSelectedSlot(null);

      return { success: true, data: { name: patientName, date: selectedSlot.date, time: selectedSlot.time } };
    } catch (err) {
      console.error("🔥 Erro ao criar agendamento:", err);
      return { success: false, error: err.message || "Erro ao agendar." };
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
