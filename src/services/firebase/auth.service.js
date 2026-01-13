// ============================================
// auth.service.js
// ============================================
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";

export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
}

export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.code };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.code };
  }
}

function getAuthErrorMessage(errorCode) {
  const messages = {
    "auth/email-already-in-use": "Este email já está cadastrado",
    "auth/invalid-email": "Email inválido",
    "auth/weak-password": "Senha muito fraca",
    "auth/user-not-found": "Usuário não encontrado",
    "auth/wrong-password": "Senha incorreta",
  };
  return messages[errorCode] || "Erro ao processar autenticação";
}
