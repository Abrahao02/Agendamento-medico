import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAhzetVUIHtkci9jhmMHR1uiQYlKjEFI9w",
  authDomain: "etna-agendamento-medico.firebaseapp.com",
  projectId: "etna-agendamento-medico",
  storageBucket: "etna-agendamento-medico.firebasestorage.app",
  messagingSenderId: "964723242874",
  appId: "1:964723242874:web:823a65f95dabfd298c88c3",
  measurementId: "G-70R1QEWMSK"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
