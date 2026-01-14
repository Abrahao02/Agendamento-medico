// ============================================
// 📁 src/services/common/errorHandler.service.js
// Centralized error handling service
// ============================================
import { logError as loggerError } from "../../utils/logger/logger";

/**
 * Standard error response format
 */
export function createErrorResponse(error, context = {}) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Erro desconhecido';
  const errorCode = error?.code || 'UNKNOWN_ERROR';

  return {
    success: false,
    error: errorMessage,
    code: errorCode,
    context,
  };
}

/**
 * Standard success response format
 */
export function createSuccessResponse(data = null, message = null) {
  const response = {
    success: true,
  };

  if (data !== null) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * Wraps an async function with standardized error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error messages
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context = 'Operation') {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      return createErrorResponse(error, { context, args });
    }
  };
}

/**
 * Maps Firebase/Firestore error codes to user-friendly messages
 */
export function mapFirebaseError(error) {
  if (typeof error === 'string') {
    return error;
  }

  const code = error?.code || '';
  const message = error?.message || '';

  // Firebase Auth errors
  const authErrorMap = {
    'auth/email-already-in-use': 'Este email já está cadastrado',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/user-disabled': 'Conta desabilitada. Entre em contato com o suporte',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/requires-recent-login': 'Por segurança, faça login novamente',
  };

  // Firestore errors
  const firestoreErrorMap = {
    'permission-denied': 'Você não tem permissão para esta operação',
    'not-found': 'Dados não encontrados',
    'already-exists': 'Já existe um registro com estes dados',
    'unavailable': 'Serviço temporariamente indisponível. Tente novamente',
    'deadline-exceeded': 'Tempo limite excedido. Tente novamente',
    'unauthenticated': 'Você precisa estar logado para esta operação',
    'failed-precondition': 'Operação não pode ser realizada no momento',
    'aborted': 'Operação cancelada',
    'out-of-range': 'Valor fora do intervalo permitido',
    'unimplemented': 'Funcionalidade não implementada',
    'internal': 'Erro interno. Tente novamente mais tarde',
    'data-loss': 'Erro ao processar dados',
  };

  // Check auth errors first
  if (code.startsWith('auth/')) {
    return authErrorMap[code] || message || 'Erro de autenticação';
  }

  // Check Firestore errors
  if (firestoreErrorMap[code]) {
    return firestoreErrorMap[code];
  }

  // Return original message if no mapping found
  return message || 'Ocorreu um erro inesperado';
}

/**
 * Handles errors and returns standardized response
 * @param {Error|string} error - Error object or message
 * @param {Object} options - Options
 * @param {string} options.context - Context for error
 * @param {boolean} options.logError - Whether to log error (default: true)
 * @returns {Object} Standardized error response
 */
export function handleError(error, options = {}) {
  const { context = 'Operation', logError = true } = options;

  // Log error in development
  if (logError) {
    loggerError(`[${context}]`, error);
  }

  const userMessage = mapFirebaseError(error);

  return createErrorResponse(userMessage, { context });
}
