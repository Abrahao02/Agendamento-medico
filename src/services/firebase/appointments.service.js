import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";
import { COLLECTIONS, validators } from "./collections";

/* ==============================
   CREATE APPOINTMENT
   (Simples - sem validação de availability)
================================ */
export async function createAppointment(data) {
  try {
    console.log("📥 createAppointment - dados recebidos:", data);

    const required = [
      "doctorId",
      "patientId",
      "patientName",
      "patientWhatsapp",
      "date",
      "time",
    ];

    for (const field of required) {
      if (!data[field]) {
        console.error(`❌ Campo obrigatório faltando: ${field}`);
        console.error("Dados recebidos:", data);
        throw new Error(`Campo obrigatório: ${field}`);
      }
    }

    // Valida formato de data e hora (STRINGS!)
    console.log("🔍 Validando data:", data.date, "tipo:", typeof data.date);
    if (typeof data.date !== "string" || !validators.date(data.date)) {
      throw new Error("Data inválida. Use formato YYYY-MM-DD");
    }

    console.log("🔍 Validando hora:", data.time, "tipo:", typeof data.time);
    if (typeof data.time !== "string" || !validators.time(data.time)) {
      throw new Error("Horário inválido. Use formato HH:mm");
    }

    const value = Number(data.value) || 0;

    // Cria documento com ID automático
    const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS);
    const newAppointmentRef = doc(appointmentsRef);

    await setDoc(newAppointmentRef, {
      doctorId: data.doctorId,
      patientId: data.patientId,
      patientName: data.patientName,
      patientWhatsapp: data.patientWhatsapp,
      date: data.date,           // STRING: "2026-01-16"
      time: data.time,           // STRING: "18:00"
      value,
      status: data.status || "Pendente",
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      appointmentId: newAppointmentRef.id,
    };
  } catch (error) {
    console.error("createAppointment error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/* ==============================
   UPDATE APPOINTMENT
================================ */
export async function updateAppointment(appointmentId, data) {
  try {
    if (!appointmentId) {
      throw new Error("appointmentId não informado");
    }

    const allowedFields = [
      "date",
      "time",
      "value",
      "status",
      "patientName",
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nenhum campo válido para atualização");
    }

    // Valida data se estiver sendo atualizada
    if (updateData.date && !validators.date(updateData.date)) {
      throw new Error("Data inválida");
    }

    // Valida horário se estiver sendo atualizado
    if (updateData.time && !validators.time(updateData.time)) {
      throw new Error("Horário inválido");
    }

    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);

    await updateDoc(appointmentRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("updateAppointment error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   DELETE APPOINTMENT
================================ */
export async function deleteAppointment(appointmentId) {
  try {
    if (!appointmentId) {
      throw new Error("appointmentId não informado");
    }

    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    await deleteDoc(appointmentRef);

    return { success: true };
  } catch (error) {
    console.error("deleteAppointment error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   GET APPOINTMENTS BY DOCTOR
================================ */
export async function getAppointmentsByDoctor(doctorId) {
  try {
    if (!doctorId) {
      throw new Error("doctorId não informado");
    }

    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("doctorId", "==", doctorId)
    );

    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: appointments };
  } catch (error) {
    console.error("getAppointmentsByDoctor error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   GET APPOINTMENTS BY DATE
================================ */
export async function getAppointmentsByDate(doctorId, date) {
  try {
    if (!doctorId || !date) {
      throw new Error("Parâmetros inválidos");
    }

    if (!validators.date(date)) {
      throw new Error("Data inválida");
    }

    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("doctorId", "==", doctorId),
      where("date", "==", date)
    );

    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: appointments };
  } catch (error) {
    console.error("getAppointmentsByDate error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   GET APPOINTMENTS BY PATIENT
================================ */
export async function getAppointmentsByPatient(doctorId, patientId) {
  try {
    if (!doctorId || !patientId) {
      throw new Error("Parâmetros inválidos");
    }

    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where("doctorId", "==", doctorId),
      where("patientId", "==", patientId)
    );

    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: appointments };
  } catch (error) {
    console.error("getAppointmentsByPatient error:", error);
    return { success: false, error: error.message };
  }
}