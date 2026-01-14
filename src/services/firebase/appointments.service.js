import {
  doc,
  getDoc,
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
import { COLLECTIONS, validators, getAvailabilityId } from "./collections";
import { validateAppointmentLimit } from "../appointments/limitValidation.service";
import { validateAppointmentAgainstSlot } from "../appointments/locationValidation.service";
import { normalizeSlot } from "../../utils/availability/normalizeSlot";
import * as DoctorService from "./doctors.service";
import { logError, logWarning } from "../../utils/logger/logger";
import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";

export async function createAppointment(data) {
  try {
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
        throw new Error(`Campo obrigatório: ${field}`);
      }
    }

    if (typeof data.date !== "string" || !validators.date(data.date)) {
      throw new Error("Data inválida. Use formato YYYY-MM-DD");
    }

    if (typeof data.time !== "string" || !validators.time(data.time)) {
      throw new Error("Horário inválido. Use formato HH:mm");
    }

    // Validate limit before creating appointment
    const limitValidation = await validateAppointmentLimit(data.doctorId);
    if (!limitValidation.allowed) {
      return {
        success: false,
        error: "Atenção: você chegou ao limite permitido de consultas atendidas no mês.",
      };
    }

    // Validate appointment against slot constraints (if slot exists)
    try {
      const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, getAvailabilityId(data.doctorId, data.date));
      const availabilityDoc = await getDoc(availabilityRef);
      
      if (availabilityDoc.exists()) {
        const slots = availabilityDoc.data().slots || [];
        const slot = slots.find(s => {
          // Handle both string and object formats
          if (typeof s === "string") return s === data.time;
          if (typeof s === "object" && s.time) return s.time === data.time;
          return false;
        });

        if (slot) {
          // Get doctor config for validation
          const doctorResult = await DoctorService.getDoctor(data.doctorId);
          if (doctorResult.success) {
            const normalizedSlot = normalizeSlot(slot, doctorResult.data);
            const validation = validateAppointmentAgainstSlot(data, normalizedSlot, doctorResult.data);
            
            if (!validation.valid) {
              return {
                success: false,
                error: validation.error,
              };
            }
          }
        }
      }
    } catch (validationError) {
      // Don't block appointment creation on validation errors
      // This allows backward compatibility and graceful degradation
      logWarning("Erro ao validar agendamento contra slot:", validationError);
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
      date: data.date,
      time: data.time,
      value,
      status: data.status || APPOINTMENT_STATUS.PENDING,
      appointmentType: data.appointmentType || null,
      location: data.location || null,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      appointmentId: newAppointmentRef.id,
    };
  } catch (error) {
    logError("createAppointment error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

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
      "appointmentType",
      "location",
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
    logError("updateAppointment error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAppointment(appointmentId) {
  try {
    if (!appointmentId) {
      throw new Error("appointmentId não informado");
    }

    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    await deleteDoc(appointmentRef);

    return { success: true };
  } catch (error) {
    logError("deleteAppointment error:", error);
    return { success: false, error: error.message };
  }
}

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
    logError("getAppointmentsByDoctor error:", error);
    return { success: false, error: error.message };
  }
}

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
    logError("getAppointmentsByDate error:", error);
    return { success: false, error: error.message };
  }
}

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
    logError("getAppointmentsByPatient error:", error);
    return { success: false, error: error.message };
  }
}