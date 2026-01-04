import { doc, setDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Salva um horário de disponibilidade para um médico
 * @param {string} doctorId - UID do médico
 * @param {string} date - YYYY-MM-DD
 * @param {string} slot - horário (ex: "09:00")
 */
export async function saveAvailability(doctorId, date, slot) {
  try {
    const docId = `${doctorId}_${date}`;
    const availabilityRef = doc(db, "availability", docId);

    const docSnap = await getDoc(availabilityRef);

    if (docSnap.exists()) {
      // Documento já existe → adiciona slot ao array
      await setDoc(
        availabilityRef,
        { slots: arrayUnion(slot) },
        { merge: true } // merge = não sobrescreve campos existentes
      );
    } else {
      // Documento não existe → cria novo
      await setDoc(availabilityRef, {
        doctorId,
        date,
        slots: [slot],
      });
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar disponibilidade:", error);
    return false;
  }
}
