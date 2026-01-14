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
import { COLLECTIONS, validators } from "./collections";
import { logError, logWarning } from "../../utils/logger/logger";


function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(baseSlug) {
  const q = query(
    collection(db, COLLECTIONS.DOCTORS),
    where("slug", ">=", baseSlug),
    where("slug", "<=", `${baseSlug}\uf8ff`)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return baseSlug;
  }

  // Coleta slugs existentes
  const existingSlugs = snapshot.docs.map(doc => doc.data().slug);

  let suffix = 2;
  let newSlug = `${baseSlug}-${suffix}`;

  while (existingSlugs.includes(newSlug)) {
    suffix++;
    newSlug = `${baseSlug}-${suffix}`;
  }

  return newSlug;
}


export async function createDoctor({ uid, name, email, whatsapp }) {
  try {
    const baseSlug = generateSlug(name);
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    await setDoc(doc(db, COLLECTIONS.DOCTORS, uid), {
      uid,
      name,
      email,
      whatsapp,
      slug: uniqueSlug,
      plan: "free",
      patientLimit: 10,
      defaultValueSchedule: 0,
      whatsappConfig: {
        intro: "Olá",
        body: "Sua sessão está agendada",
        footer: "Caso não possa comparecer, avise com antecedência.",
        showValue: true,
      },
      publicScheduleConfig: {
        period: "all_future",
        showPrice: true,
      },
      appointmentTypeConfig: {
        mode: "disabled",
        fixedType: "online",
        defaultValueOnline: 0,
        defaultValuePresencial: 0,
        locations: [],
      },
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logError("createDoctor error:", error);
    return { success: false, error: error.message };
  }
}



export async function getDoctor(doctorId) {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.DOCTORS, doctorId));

    if (!docSnap.exists()) {
      return { success: false, error: "Médico não encontrado" };
    }

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export async function getDoctorBySlug(slug) {
  try {
    if (!slug) {
      throw new Error("Slug não informado");
    }

    const q = query(
      collection(db, COLLECTIONS.DOCTORS),
      where("slug", "==", slug)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: "Médico não encontrado" };
    }

    if (snapshot.docs.length > 1) {
      logWarning("Slug duplicado encontrado:", slug);
    }

    const docSnap = snapshot.docs[0];

    return {
      success: true,
      data: { id: docSnap.id, ...docSnap.data() },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDoctor(doctorId, data) {
  try {
    const allowedFields = [
      "name",
      "whatsapp",
      "defaultValueSchedule",
      "whatsappConfig",
      "patientLimit",
      "publicScheduleConfig",
      "appointmentTypeConfig",
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (key in data) {
        updateData[key] = data[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nenhum campo válido para atualização");
    }

    /* ==============================
       VALIDAR whatsappConfig
    ================================ */
    if (updateData.whatsappConfig) {
      const allowedWhatsappKeys = [
        "intro",
        "body",
        "footer",
        "showValue",
      ];

      for (const key of Object.keys(updateData.whatsappConfig)) {
        if (!allowedWhatsappKeys.includes(key)) {
          throw new Error(
            `Campo inválido em whatsappConfig: ${key}`
          );
        }
      }

      if (
        typeof updateData.whatsappConfig.showValue !== "boolean"
      ) {
        throw new Error(
          "whatsappConfig.showValue deve ser boolean"
        );
      }
    }

    if (updateData.publicScheduleConfig) {
      const allowedPublicScheduleKeys = ["period", "showPrice"];

      for (const key of Object.keys(updateData.publicScheduleConfig)) {
        if (!allowedPublicScheduleKeys.includes(key)) {
          throw new Error(
            `Campo inválido em publicScheduleConfig: ${key}`
          );
        }
      }

      if (
        updateData.publicScheduleConfig.showPrice !== undefined &&
        typeof updateData.publicScheduleConfig.showPrice !== "boolean"
      ) {
        throw new Error(
          "publicScheduleConfig.showPrice deve ser boolean"
        );
      }
    }

    if (updateData.appointmentTypeConfig) {
      const allowedAppointmentTypeKeys = [
        "mode",
        "fixedType",
        "selection",
        "defaultValueOnline",
        "defaultValuePresencial",
        "locations",
      ];

      for (const key of Object.keys(updateData.appointmentTypeConfig)) {
        if (!allowedAppointmentTypeKeys.includes(key)) {
          throw new Error(
            `Campo inválido em appointmentTypeConfig: ${key}`
          );
        }
      }

      // Validar selection se fornecido
      if (updateData.appointmentTypeConfig.selection) {
        const validSelections = ["online_only", "presencial_only", "both"];
        if (!validSelections.includes(updateData.appointmentTypeConfig.selection)) {
          throw new Error(
            `Valor inválido para selection: ${updateData.appointmentTypeConfig.selection}. Deve ser um de: ${validSelections.join(", ")}`
          );
        }
      }

      if (updateData.appointmentTypeConfig.locations) {
        if (!Array.isArray(updateData.appointmentTypeConfig.locations)) {
          throw new Error("appointmentTypeConfig.locations deve ser um array");
        }

        for (const location of updateData.appointmentTypeConfig.locations) {
          if (!location.name || typeof location.name !== "string") {
            throw new Error("Cada local deve ter um nome válido");
          }
          if (location.defaultValue === undefined) {
            throw new Error("Cada local deve ter um defaultValue");
          }
        }
      }
    }

    await updateDoc(doc(db, COLLECTIONS.DOCTORS, doctorId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logError("updateDoctor error:", error);
    return { success: false, error: error.message };
  }
}

