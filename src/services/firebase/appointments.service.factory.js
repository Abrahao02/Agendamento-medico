// ============================================
// 📁 src/services/firebase/appointments.service.factory.js
// Factory para criar appointment service com injeção de dependências (DIP)
// ============================================

import { COLLECTIONS, validators, getAvailabilityId } from "./collections";
import { validateAppointmentLimit } from "../appointments/limitValidation.service";
import { validateAppointmentAgainstSlot } from "../appointments/locationValidation.service";
import { normalizeSlot } from "../../utils/availability/normalizeSlot";
import { logError, logWarning } from "../../utils/logger/logger";
import { APPOINTMENT_STATUS } from "../../constants/appointmentStatus";

/**
 * Cria um serviço de appointments com injeção de dependências
 * @param {Object} dependencies - Dependências injetadas
 * @param {Object} dependencies.database - Serviço de banco de dados
 * @param {Function} dependencies.getDoctor - Função para obter médico
 * @returns {Object} Serviço de appointments
 */
export const createAppointmentService = ({ database, getDoctor }) => {
  const createAppointment = async (data) => {
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
        const availabilityRef = database.doc(COLLECTIONS.AVAILABILITY, getAvailabilityId(data.doctorId, data.date));
        const availabilityDoc = await database.getDoc(availabilityRef);
        
        if (availabilityDoc.exists()) {
          const slots = availabilityDoc.data().slots || [];
          const slot = slots.find(s => {
            if (typeof s === "string") return s === data.time;
            if (typeof s === "object" && s.time) return s.time === data.time;
            return false;
          });

          if (slot) {
            const doctorResult = await getDoctor(data.doctorId);
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
        logWarning("Erro ao validar agendamento contra slot:", validationError);
      }

      const value = Number(data.value) || 0;

      // Cria documento com ID automático
      const appointmentsRef = database.collection(COLLECTIONS.APPOINTMENTS);
      const newAppointmentRef = database.doc(COLLECTIONS.APPOINTMENTS);

      await database.setDoc(newAppointmentRef, {
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
        createdAt: database.serverTimestamp(),
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
  };

  const updateAppointment = async (appointmentId, data) => {
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

      if (updateData.date && !validators.date(updateData.date)) {
        throw new Error("Data inválida");
      }

      if (updateData.time && !validators.time(updateData.time)) {
        throw new Error("Horário inválido");
      }

      const appointmentRef = database.doc(COLLECTIONS.APPOINTMENTS, appointmentId);

      await database.updateDoc(appointmentRef, {
        ...updateData,
        updatedAt: database.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      logError("updateAppointment error:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      if (!appointmentId) {
        throw new Error("appointmentId não informado");
      }

      const appointmentRef = database.doc(COLLECTIONS.APPOINTMENTS, appointmentId);
      await database.deleteDoc(appointmentRef);

      return { success: true };
    } catch (error) {
      logError("deleteAppointment error:", error);
      return { success: false, error: error.message };
    }
  };

  const getAppointmentsByDoctor = async (doctorId) => {
    try {
      if (!doctorId) {
        throw new Error("doctorId não informado");
      }

      const appointmentsRef = database.collection(COLLECTIONS.APPOINTMENTS);
      const q = database.query(
        appointmentsRef,
        database.where("doctorId", "==", doctorId)
      );

      const snapshot = await database.getDocs(q);

      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: appointments };
    } catch (error) {
      logError("getAppointmentsByDoctor error:", error);
      return { success: false, error: error.message };
    }
  };

  const getAppointmentsByDate = async (doctorId, date) => {
    try {
      if (!doctorId || !date) {
        throw new Error("Parâmetros inválidos");
      }

      if (!validators.date(date)) {
        throw new Error("Data inválida");
      }

      const appointmentsRef = database.collection(COLLECTIONS.APPOINTMENTS);
      const q = database.query(
        appointmentsRef,
        database.where("doctorId", "==", doctorId),
        database.where("date", "==", date)
      );

      const snapshot = await database.getDocs(q);

      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: appointments };
    } catch (error) {
      logError("getAppointmentsByDate error:", error);
      return { success: false, error: error.message };
    }
  };

  const getAppointmentsByPatient = async (doctorId, patientId) => {
    try {
      if (!doctorId || !patientId) {
        throw new Error("Parâmetros inválidos");
      }

      const appointmentsRef = database.collection(COLLECTIONS.APPOINTMENTS);
      const q = database.query(
        appointmentsRef,
        database.where("doctorId", "==", doctorId),
        database.where("patientId", "==", patientId)
      );

      const snapshot = await database.getDocs(q);

      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: appointments };
    } catch (error) {
      logError("getAppointmentsByPatient error:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDoctor,
    getAppointmentsByDate,
    getAppointmentsByPatient,
  };
};
