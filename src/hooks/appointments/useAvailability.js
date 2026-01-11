import { useEffect, useState, useCallback } from "react";
import { auth } from "../../services/firebase";

// Services
import { getDoctor } from "../../services/firebase/doctors.service";
import { getAvailability, saveAvailability, removeAvailability } from "../../services/firebase/availability.service";
import { getAppointmentsByDoctor, createAppointment, deleteAppointment } from "../../services/firebase/appointments.service";
import { getPatients } from "../../services/firebase/patients.service";

export const useAvailability = () => {
  // ==============================
  // AUTH (garantido pelo PrivateRoute)
  // ==============================
  const user = auth.currentUser;

  if (!user) {
    console.warn("useAvailability usado sem usuário autenticado");
  }

  // ==============================
  // ESTADO
  // ==============================
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ==============================
     LOAD INITIAL DATA
  ============================== */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [doctorResult, availResult, appointmentsResult, patientsResult] = await Promise.all([
          getDoctor(user.uid),
          getAvailability(user.uid),
          getAppointmentsByDoctor(user.uid),
          getPatients(user.uid),
        ]);

        if (doctorResult.success) setDoctor(doctorResult.data);

        if (availResult.success) {
          const validAvailability = availResult.data
            .filter(day => day.date && Array.isArray(day.slots))
            .sort((a, b) => a.date.localeCompare(b.date));
          setAvailability(validAvailability);
        }

        if (appointmentsResult.success) setAppointments(appointmentsResult.data);
        if (patientsResult.success) setPatients(patientsResult.data);

      } catch (err) {
        console.error("Erro ao carregar disponibilidade:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  /* ==============================
     GET AVAILABILITY FOR DATE
  ============================== */
  const getAvailabilityForDate = useCallback((date) => {
    const dayAvailability = availability.find(a => a.date === date);
    if (!dayAvailability || !dayAvailability.slots) return [];

    const bookedSlots = appointments
      .filter(apt => apt.date === date)
      .map(apt => apt.time);

    return dayAvailability.slots.filter(slot => !bookedSlots.includes(slot)).sort();
  }, [availability, appointments]);

  const getAllSlotsForDate = useCallback((date) => {
    const dayAvailability = availability.find(a => a.date === date);
    return dayAvailability?.slots || [];
  }, [availability]);

  const getAppointmentsForDate = useCallback((date) => {
    return appointments
      .filter(apt => apt.date === date)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [appointments]);

  const getBookedSlotsForDate = useCallback((date) => {
    return appointments
      .filter(apt => apt.date === date)
      .map(apt => apt.time);
  }, [appointments]);

  const isSlotAvailable = useCallback((date, time) => {
    const dayAvailability = availability.find(a => a.date === date);
    if (!dayAvailability) return false;

    return dayAvailability.slots.includes(time) &&
      !appointments.some(a => a.date === date && a.time === time);
  }, [availability, appointments]);

  /* ==============================
     ADD SLOT
  ============================== */
  const addSlot = async (date, slot) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const dayAvailability = availability.find(a => a.date === date);
      if (dayAvailability?.slots?.includes(slot)) {
        throw new Error("Este horário já está cadastrado");
      }

      const result = await saveAvailability(user.uid, date, slot);
      if (!result.success) throw new Error(result.error);

      setAvailability(prev => {
        const existing = prev.find(a => a.date === date);
        if (existing) {
          return prev.map(a => 
            a.date === date 
              ? { ...a, slots: [...a.slots, slot].sort() } 
              : a
          );
        } else {
          return [
            ...prev, 
            { id: `${user.uid}_${date}`, doctorId: user.uid, date, slots: [slot] }
          ].sort((a, b) => a.date.localeCompare(b.date));
        }
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /* ==============================
     REMOVE SLOT
  ============================== */
  const removeSlot = async (date, slot) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const hasAppointment = appointments.some(a => a.date === date && a.time === slot);
      if (hasAppointment) {
        throw new Error("Não é possível remover um horário com agendamento. Cancele o agendamento primeiro.");
      }

      const result = await removeAvailability(user.uid, date, slot);
      if (!result.success) throw new Error(result.error);

      setAvailability(prev => prev
        .map(a => a.date === date ? { ...a, slots: a.slots.filter(s => s !== slot) } : a)
        .filter(a => a.slots.length > 0)
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /* ==============================
     BOOK APPOINTMENT
  ============================== */
  const bookAppointment = async ({ patientId, date, time }) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };

    try {
      const hasAppointment = appointments.some(a => a.date === date && a.time === time);
      if (hasAppointment) throw new Error("Já existe um agendamento neste horário");

      const patient = patients.find(p => p.id === patientId);
      if (!patient) throw new Error("Paciente não encontrado");

      const appointmentData = {
        doctorId: user.uid,
        patientId: patient.id,
        patientName: patient.name,
        patientWhatsapp: patient.whatsapp,
        date,
        time,
        value: patient.price || doctor?.defaultValueSchedule || 0,
        status: "Confirmado",
      };

      const result = await createAppointment(appointmentData);
      if (!result.success) throw new Error(result.error);

      setAppointments(prev => [...prev, { id: result.appointmentId, ...appointmentData }]);

      return { success: true, appointmentId: result.appointmentId };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /* ==============================
     CANCEL APPOINTMENT (DELETE)
  ============================== */
  const cancelAppointment = async (appointmentId) => {
    try {
      const result = await deleteAppointment(appointmentId);
      if (!result.success) throw new Error(result.error);

      setAppointments(prev => prev.filter(a => a.id !== appointmentId));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /* ==============================
     MARK AS CANCELLED (UPDATE STATUS)
  ============================== */
  const markAsCancelled = async (appointmentId) => {
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) throw new Error("Agendamento não encontrado");

      // Importar updateAppointment do service
      const { updateAppointment } = await import("../../services/firebase/appointments.service");
      
      const result = await updateAppointment(appointmentId, { status: "Cancelado" });
      if (!result.success) throw new Error(result.error);

      setAppointments(prev => prev.map(a => 
        a.id === appointmentId 
          ? { ...a, status: "Cancelado" } 
          : a
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /* ==============================
     CALENDAR TILE DATA
  ============================== */
  const getCalendarTileData = useCallback((dateStr) => {
    const dayAvailability = availability.find(a => a.date === dateStr) || { slots: [] };
    const dayAppointments = appointments.filter(a => a.date === dateStr);

    const bookedTimes = dayAppointments.map(a => a.time);
    const freeSlotsArray = dayAvailability.slots.filter(slot => !bookedTimes.includes(slot));

    return {
      hasFreeSlots: freeSlotsArray.length > 0,
      hasBookedSlots: dayAppointments.length > 0,
      freeCount: freeSlotsArray.length,
      bookedCount: dayAppointments.length,
      totalCount: dayAvailability.slots.length,
    };
  }, [availability, appointments]);

  return {
    loading,
    error,
    doctor,
    availability,
    appointments,
    patients,
    addSlot,
    removeSlot,
    bookAppointment,
    cancelAppointment,
    markAsCancelled,
    getAvailabilityForDate,
    getAllSlotsForDate,
    getAppointmentsForDate,
    getBookedSlotsForDate,
    isSlotAvailable,
    getCalendarTileData,
  };
};