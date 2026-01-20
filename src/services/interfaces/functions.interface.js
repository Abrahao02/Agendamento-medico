// ============================================
// 📁 src/services/interfaces/functions.interface.js
// Interface/abstração para Firebase Functions
// ============================================

/**
 * Cria um serviço de functions abstrato
 * Permite injeção de dependências e facilita testes
 * 
 * @param {Object} functions - Instância do Firebase Functions
 * @returns {Object} Serviço de functions
 */
export const createFunctionsService = (functions) => {
  if (!functions) {
    throw new Error("Functions instance is required");
  }

  return {
    /**
     * Chama uma função callable
     * @param {string} name - Nome da função
     * @param {Object} data - Dados para enviar
     * @returns {Promise<Object>} Resultado da função
     */
    call: async (name, data) => {
      const { httpsCallable } = await import("firebase/functions");
      const callableFunction = httpsCallable(functions, name);
      return callableFunction(data);
    },
  };
};
