import { db } from "./firebase"
import { doc, setDoc, getDoc, collection, getDocs, addDoc, query, where } from "firebase/firestore"

// Criar doctor
export const createDoctor = async ({ uid, name, email, whatsapp, slug }) => {
  await setDoc(doc(db, "doctors", uid), { name, email, whatsapp, slug })
}

// Verificar slug disponível
export const isSlugAvailable = async (slug) => {
  const doctorsRef = collection(db, "doctors")
  const q = query(doctorsRef, where("slug", "==", slug))
  const snapshot = await getDocs(q)
  return snapshot.empty
}

// Definir disponibilidade
export const setAvailability = async (uid, availability) => {
  const availRef = collection(db, "doctors", uid, "availability")
  for (const day of Object.keys(availability)) {
    await setDoc(doc(availRef, day), { slots: availability[day] })
  }
}

// Buscar disponibilidade
export const getAvailability = async (uid) => {
  const availRef = collection(db, "doctors", uid, "availability")
  const snapshot = await getDocs(availRef)
  const data = {}
  snapshot.forEach(doc => data[doc.id] = doc.data().slots)
  return data
}

// Criar agendamento
export const createAppointment = async (uid, appointment) => {
  await addDoc(collection(db, "doctors", uid, "appointments"), appointment)
}

// Busca todos os agendamentos de um médico
export async function getAppointments(doctorId) {
  const appointmentsRef = collection(db, "doctors", doctorId, "appointments");
  const snapshot = await getDocs(appointmentsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
