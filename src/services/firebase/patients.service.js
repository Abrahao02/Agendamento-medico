// ============================================
// patients.service.js (FINAL)
// ============================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";
import { COLLECTIONS, getPatientId } from "./collections";

/* ==============================
   CREATE PATIENT (SAFE)
================================ */
export async function createPatient(doctorId, patientData) {
  try {
    if (!doctorId || !patientData?.whatsapp || !patientData?.name) {
      throw new Error("Dados obrigatórios não informados");
    }

    const patientId = getPatientId(doctorId, patientData.whatsapp);
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);

    const patientSnap = await getDoc(patientRef);

    // 🔒 Não sobrescreve paciente existente
    if (patientSnap.exists()) {
      return {
        success: true,
        id: patientId,
        alreadyExists: true,
      };
    }

    await setDoc(patientRef, {
      doctorId,
      name: patientData.name.trim(),
      whatsapp: patientData.whatsapp,
      referenceName: patientData.referenceName || null,
      price: patientData.price || 0,
      status: patientData.status || "pending",
      createdAt: patientData.createdAt || new Date(), // evita erro de permissão
    });



    return {
      success: true,
      id: patientId,
      alreadyExists: false,
    };
  } catch (error) {
    console.error("createPatient error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   GET SINGLE PATIENT
================================ */
export async function getPatient(doctorId, whatsapp) {
  try {
    if (!doctorId || !whatsapp) {
      throw new Error("Parâmetros inválidos");
    }

    const patientId = getPatientId(doctorId, whatsapp);
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
    const docSnap = await getDoc(patientRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Paciente não encontrado" };
    }

    return {
      success: true,
      data: {
        id: docSnap.id,
        ...docSnap.data(),
      },
    };
  } catch (error) {
    console.error("getPatient error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   GET ALL PATIENTS (BY DOCTOR)
================================ */
export async function getPatients(doctorId) {
  try {
    if (!doctorId) {
      throw new Error("doctorId não informado");
    }

    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      where("doctorId", "==", doctorId)
    );

    const snapshot = await getDocs(q);

    const patients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: patients };
  } catch (error) {
    console.error("getPatients error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   UPDATE PATIENT (SAFE FIELDS)
================================ */
export async function updatePatient(doctorId, whatsapp, data) {
  try {
    if (!doctorId || !whatsapp || !data) {
      throw new Error("Parâmetros inválidos");
    }

    const patientId = getPatientId(doctorId, whatsapp);
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);

    const allowedFields = [
      "name",
      "referenceName",
      "price",
      "status",
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

    await updateDoc(patientRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("updatePatient error:", error);
    return { success: false, error: error.message };
  }
}
