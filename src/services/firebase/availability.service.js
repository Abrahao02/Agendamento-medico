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
  arrayUnion,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS, getAvailabilityId, validators } from "./collections";
import { validateSlotLocations } from "../appointments/locationValidation.service";
import { logError } from "../../utils/logger/logger";

/**
 * Helper to extract time from slot (handles both string and object formats)
 */
function getSlotTime(slot) {
  if (typeof slot === "string") return slot;
  if (typeof slot === "object" && slot.time) return slot.time;
  throw new Error("Formato de slot inválido");
}

/**
 * Helper to check if two slots are the same (by time)
 */
function isSameSlot(slot1, slot2) {
  try {
    return getSlotTime(slot1) === getSlotTime(slot2);
  } catch {
    return false;
  }
}

/* ==============================
   CREATE / ADD SLOT
   Now supports both string (legacy) and object (new) formats
================================= */
export async function saveAvailability(doctorId, date, slot) {
  try {
    if (!validators.date(date)) throw new Error("Data inválida");
    
    // Handle both legacy (string) and new (object) formats
    let slotData = slot;
    if (typeof slot === "string") {
      // Legacy format - validate time
      if (!validators.time(slot)) throw new Error("Horário inválido");
      slotData = slot;
    } else if (typeof slot === "object" && slot.time) {
      // New format - validate time and structure
      if (!validators.time(slot.time)) throw new Error("Horário inválido");
      
      // Validate slot locations if provided
      if (doctorId) {
        const validation = await validateSlotLocations(doctorId, slot);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }
      
      slotData = slot;
    } else {
      throw new Error("Formato de slot inválido. Deve ser string (horário) ou objeto com propriedade 'time'");
    }

    const docId = getAvailabilityId(doctorId, date);
    const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, docId);
    const docSnap = await getDoc(availabilityRef);

    if (docSnap.exists()) {
      const existingSlots = docSnap.data().slots || [];
      
      // Check if slot with same time already exists
      const exists = existingSlots.some(s => isSameSlot(s, slotData));
      
      if (exists) {
        // Update existing slot if it's an object format
        if (typeof slotData === "object") {
          const updatedSlots = existingSlots.map(s => 
            isSameSlot(s, slotData) ? slotData : s
          );
          await updateDoc(availabilityRef, { slots: updatedSlots });
        } else {
          // Legacy format - slot already exists, no change needed
        }
      } else {
        // Add new slot
        await updateDoc(availabilityRef, { 
          slots: arrayUnion(slotData)
        });
      }
    } else {
      await setDoc(availabilityRef, { doctorId, date, slots: [slotData] });
    }

    return { success: true };
  } catch (error) {
    logError("saveAvailability error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   REMOVE SINGLE SLOT
   Handles both string and object formats
================================= */
export async function removeAvailability(doctorId, date, slot) {
  try {
    if (!validators.date(date)) throw new Error("Data inválida");
    
    // Extract time for validation
    const slotTime = getSlotTime(slot);
    if (!validators.time(slotTime)) throw new Error("Horário inválido");

    const docId = getAvailabilityId(doctorId, date);
    const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, docId);
    const docSnap = await getDoc(availabilityRef);

    if (!docSnap.exists()) {
      return { success: true }; // Already removed
    }

    const existingSlots = docSnap.data().slots || [];
    
    // Find the slot to remove (match by time)
    const slotToRemove = existingSlots.find(s => isSameSlot(s, slot));
    
    if (slotToRemove) {
      // Remove using arrayRemove (works with exact match)
      await updateDoc(availabilityRef, { slots: arrayRemove(slotToRemove) });
    }

    // Check if document is now empty
    const updatedSnap = await getDoc(availabilityRef);
    if (updatedSnap.exists()) {
      const remainingSlots = updatedSnap.data().slots || [];
      if (remainingSlots.length === 0) {
        await deleteDoc(availabilityRef);
      }
    }

    return { success: true };
  } catch (error) {
    logError("removeAvailability error:", error);
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
    logError("getAvailability error:", error);
    return { success: false, error: error.message };
  }
}

/* ==============================
   SET FULL DAY AVAILABILITY
   Handles both string and object formats
================================= */
export async function setDayAvailability(doctorId, date, slots) {
  try {
    if (!validators.date(date)) throw new Error("Data inválida");
    
    // Validate all slots
    for (const slot of slots) {
      const slotTime = getSlotTime(slot);
      if (!validators.time(slotTime)) {
        throw new Error(`Horário inválido: ${slotTime}`);
      }
      
      // Validate object slots if doctorId provided
      if (typeof slot === "object" && slot.time && doctorId) {
        const validation = await validateSlotLocations(doctorId, slot);
        if (!validation.valid) {
          throw new Error(`Slot ${slot.time}: ${validation.error}`);
        }
      }
    }

    const docId = getAvailabilityId(doctorId, date);
    const availabilityRef = doc(db, COLLECTIONS.AVAILABILITY, docId);

    if (slots.length === 0) {
      await deleteDoc(availabilityRef);
    } else {
      // Remove duplicates based on time
      const uniqueSlots = [];
      const seenTimes = new Set();
      
      for (const slot of slots) {
        const time = getSlotTime(slot);
        if (!seenTimes.has(time)) {
          seenTimes.add(time);
          uniqueSlots.push(slot);
        }
      }
      
      // Sort by time
      uniqueSlots.sort((a, b) => {
        const timeA = getSlotTime(a);
        const timeB = getSlotTime(b);
        return timeA.localeCompare(timeB);
      });
      
      await setDoc(availabilityRef, { doctorId, date, slots: uniqueSlots });
    }

    return { success: true };
  } catch (error) {
    logError("setDayAvailability error:", error);
    return { success: false, error: error.message };
  }
}
