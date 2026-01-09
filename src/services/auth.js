import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth"
import { auth } from "./firebase"

export async function registerUser(email, password) {
  const userCredential =
    await createUserWithEmailAndPassword(auth, email, password)

  await sendEmailVerification(userCredential.user)
  return userCredential.user
}
