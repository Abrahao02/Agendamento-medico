// ============================================
// appointments.service.js
// ============================================

import { doc, collection, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS, getAvailabilityId, validators } from "./collections";

export async function createAppointment(data) {
  try {
    // valida campos obrigatórios
    const required = ["doctorId","doctorSlug","patientId","patientName","patientWhatsapp","date","time"];
    for (const field of required) {
      if (!data[field]) throw new Error(`Campo obrigatório: ${field}`);
    }

    if (!validators.date(data.date)) throw new Error("Data inválida");
    if (!validators.time(data.time)) throw new Error("Horário inválido");

    const value = Number(data.value) || 0;

    const availabilityId = getAvailabilityId(data.doctorId, data.date);
    const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, availabilityId);
    const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS);

    let appointmentId = null;

    // transaction para remover slot e criar appointment
    await runTransaction(db, async (transaction) => {
      const availabilitySnap = await transaction.get(availabilityRef);
      if (!availabilitySnap.exists()) throw new Error("Horário indisponível");

      const availability = availabilitySnap.data();
      if (!availability.slots.includes(data.time)) throw new Error("Horário já reservado");

      // remove slot
      const updatedSlots = availability.slots.filter(slot => slot !== data.time);
      if (updatedSlots.length === 0) {
        transaction.delete(availabilityRef);
      } else {
        transaction.update(availabilityRef, { slots: updatedSlots });
      }

      // cria appointment
      const appointmentRef = doc(appointmentsRef);
      appointmentId = appointmentRef.id;

      transaction.set(appointmentRef, {
        doctorId: data.doctorId,
        doctorSlug: data.doctorSlug,
        patientId: data.patientId,
        patientName: data.patientName,
        patientWhatsapp: data.patientWhatsapp,
        date: data.date,
        time: data.time,
        value,
        status: data.status || "Pendente",
        createdAt: serverTimestamp(),
      });
    });

    return { success: true, appointmentId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAppointmentsByDoctor(doctorId) {
  try {
    // busca simples, sem filtros complexos
    const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS);
    const snap = await getDocs(appointmentsRef);
    const data = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => a.doctorId === doctorId); // filtro no front
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return { success: false, error: error.message || "Erro ao buscar agendamentos" };
  }
}
