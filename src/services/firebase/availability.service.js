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
  arrayRemove,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS, getAvailabilityId, validators } from "./collections";

/* ==============================
   CREATE / ADD SLOT
================================= */
export async function saveAvailability(doctorId, date, slot) {
  try {
    if (!validators.date(date)) throw new Error("Data inválida");
    if (!validators.time(slot)) throw new Error("Horário inválido");

    const docId = getAvailabilityId(doctorId, date);
    const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, docId);
    const docSnap = await getDoc(availabilityRef);

    if (docSnap.exists()) {
      const existingSlots = docSnap.data().slots || [];
      const updatedSlots = [...new Set([...existingSlots, slot])].sort();
      await updateDoc(availabilityRef, { slots: updatedSlots });
    } else {
      await setDoc(availabilityRef, { doctorId, date, slots: [slot] });
    }

    return { success: true };
  } catch (error) {
    console.error("saveAvailability error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   REMOVE SINGLE SLOT
================================= */
export async function removeAvailability(doctorId, date, slot) {
  try {
    if (!validators.date(date)) throw new Error("Data inválida");
    if (!validators.time(slot)) throw new Error("Horário inválido");

    const docId = getAvailabilityId(doctorId, date);
    const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, docId);

    await updateDoc(availabilityRef, { slots: arrayRemove(slot) });

    const docSnap = await getDoc(availabilityRef);
    if (docSnap.exists() && docSnap.data().slots.length === 0) {
      await deleteDoc(availabilityRef);
    }

    return { success: true };
  } catch (error) {
    console.error("removeAvailability error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   GET AVAILABILITY
================================= */
export async function getAvailability(doctorId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.AVAILABILITY),
      where("doctorId", "==", doctorId)
    );

    const snapshot = await getDocs(q);
    const availability = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: availability };
  } catch (error) {
    console.error("getAvailability error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   SET FULL DAY AVAILABILITY
================================= */
export async function setDayAvailability(doctorId, date, slots) {
  try {
    if (!validators.date(date)) throw new Error("Data inválida");
    for (const slot of slots) {
      if (!validators.time(slot)) throw new Error(`Horário inválido: ${slot}`);
    }

    const docId = getAvailabilityId(doctorId, date);
    const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, docId);

    if (slots.length === 0) {
      await deleteDoc(availabilityRef);
    } else {
      await setDoc(availabilityRef, { doctorId, date, slots: [...new Set(slots)].sort() });
    }

    return { success: true };
  } catch (error) {
    console.error("setDayAvailability error:", error);
    return { success: false, error: error.message };
  }
}
