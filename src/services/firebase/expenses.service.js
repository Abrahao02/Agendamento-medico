// ============================================
// 📁 src/services/firebase/expenses.service.js
// CRUD de gastos do médico
// ============================================

import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";
import { COLLECTIONS, validators } from "./collections";
import { logError } from "../../utils/logger/logger";

/**
 * Criar novo gasto
 * @param {Object} data - { doctorId, description, value, date, location }
 * @returns {Promise<{success: boolean, expenseId?: string, error?: string}>}
 */
export async function createExpense(data) {
  try {
    const required = ["doctorId", "description", "value", "date", "location"];
    for (const field of required) {
      if (!data[field] && data[field] !== 0) {
        throw new Error(`Campo obrigatório: ${field}`);
      }
    }

    if (!validators.date(data.date)) {
      throw new Error("Data inválida. Use formato YYYY-MM-DD");
    }

    const value = Number(data.value);
    if (isNaN(value) || value < 0) {
      throw new Error("Valor deve ser um número maior ou igual a zero");
    }

    if (typeof data.description !== "string" || data.description.trim().length === 0) {
      throw new Error("Descrição é obrigatória");
    }

    const expensesRef = collection(db, COLLECTIONS.EXPENSES);
    const newExpenseRef = doc(expensesRef);

    await setDoc(newExpenseRef, {
      doctorId: data.doctorId,
      description: data.description.trim(),
      value,
      date: data.date,
      location: data.location,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      expenseId: newExpenseRef.id,
    };
  } catch (error) {
    logError("createExpense error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Atualizar gasto existente
 * @param {string} expenseId - ID do gasto
 * @param {Object} data - Campos a atualizar (description, value, date, location)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateExpense(expenseId, data) {
  try {
    if (!expenseId) {
      throw new Error("expenseId não informado");
    }

    const allowedFields = ["description", "value", "date", "location"];
    const updateData = {};

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nenhum campo válido para atualização");
    }

    // Validações
    if (updateData.date && !validators.date(updateData.date)) {
      throw new Error("Data inválida");
    }

    if (updateData.value !== undefined) {
      const value = Number(updateData.value);
      if (isNaN(value) || value < 0) {
        throw new Error("Valor deve ser um número maior ou igual a zero");
      }
      updateData.value = value;
    }

    if (updateData.description !== undefined) {
      if (typeof updateData.description !== "string" || updateData.description.trim().length === 0) {
        throw new Error("Descrição não pode ser vazia");
      }
      updateData.description = updateData.description.trim();
    }

    const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);

    await updateDoc(expenseRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logError("updateExpense error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deletar gasto
 * @param {string} expenseId - ID do gasto
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteExpense(expenseId) {
  try {
    if (!expenseId) {
      throw new Error("expenseId não informado");
    }

    const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
    await deleteDoc(expenseRef);

    return { success: true };
  } catch (error) {
    logError("deleteExpense error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Buscar gastos de um médico
 * @param {string} doctorId - ID do médico
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function getExpensesByDoctor(doctorId) {
  try {
    if (!doctorId) {
      throw new Error("doctorId não informado");
    }

    const q = query(
      collection(db, COLLECTIONS.EXPENSES),
      where("doctorId", "==", doctorId),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);

    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: expenses };
  } catch (error) {
    logError("getExpensesByDoctor error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Listener em tempo real para gastos de um médico
 * @param {string} doctorId - ID do médico
 * @param {Function} callback - Callback chamado com {success, data, error}
 * @returns {Function} Unsubscribe function
 */
export function subscribeToExpenses(doctorId, callback) {
  if (!doctorId) {
    callback({ success: false, error: "doctorId não informado" });
    return () => {};
  }

  const q = query(
    collection(db, COLLECTIONS.EXPENSES),
    where("doctorId", "==", doctorId),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      callback({ success: true, data: expenses });
    },
    (error) => {
      logError("subscribeToExpenses error:", error);
      callback({ success: false, error: error.message });
    }
  );

  return unsubscribe;
}
