// ============================================
// 📁 src/services/interfaces/database.interface.js
// Interface/abstração para operações de banco de dados
// ============================================

/**
 * Cria um serviço de banco de dados abstrato
 * Permite injeção de dependências e facilita testes
 * 
 * @param {Object} db - Instância do Firestore
 * @returns {Object} Serviço de banco de dados
 */
export const createDatabaseService = (db) => {
  if (!db) {
    throw new Error("Database instance is required");
  }

  return {
    /**
     * Obtém um documento
     * @param {Object} ref - Referência do documento
     * @returns {Promise<Object>} Dados do documento
     */
    getDoc: async (ref) => {
      const { getDoc: getDocFn } = await import("firebase/firestore");
      return getDocFn(ref);
    },

    /**
     * Cria ou atualiza um documento
     * @param {Object} ref - Referência do documento
     * @param {Object} data - Dados do documento
     * @returns {Promise<void>}
     */
    setDoc: async (ref, data) => {
      const { setDoc: setDocFn } = await import("firebase/firestore");
      return setDocFn(ref, data);
    },

    /**
     * Atualiza um documento
     * @param {Object} ref - Referência do documento
     * @param {Object} data - Dados para atualizar
     * @returns {Promise<void>}
     */
    updateDoc: async (ref, data) => {
      const { updateDoc: updateDocFn } = await import("firebase/firestore");
      return updateDocFn(ref, data);
    },

    /**
     * Deleta um documento
     * @param {Object} ref - Referência do documento
     * @returns {Promise<void>}
     */
    deleteDoc: async (ref) => {
      const { deleteDoc: deleteDocFn } = await import("firebase/firestore");
      return deleteDocFn(ref);
    },

    /**
     * Obtém documentos de uma coleção
     * @param {Object} query - Query do Firestore
     * @returns {Promise<Array>} Array de documentos
     */
    getDocs: async (query) => {
      const { getDocs: getDocsFn } = await import("firebase/firestore");
      return getDocsFn(query);
    },

    /**
     * Cria uma referência de documento
     * @param {string} collectionPath - Caminho da coleção
     * @param {string} docPath - Caminho do documento (opcional)
     * @returns {Object} Referência do documento
     */
    doc: (collectionPath, docPath) => {
      // Importação dinâmica síncrona usando import() não é possível
      // Usar importação estática
      const { doc: docFn } = require("firebase/firestore");
      if (docPath !== undefined) {
        return docFn(db, collectionPath, docPath);
      }
      return docFn(db, collectionPath);
    },

    /**
     * Cria uma referência de coleção
     * @param {string} collectionPath - Caminho da coleção
     * @returns {Object} Referência da coleção
     */
    collection: (collectionPath) => {
      const { collection: collectionFn } = require("firebase/firestore");
      return collectionFn(db, collectionPath);
    },

    /**
     * Cria uma query
     * @param {Object} collectionRef - Referência da coleção
     * @param {...Object} queryConstraints - Constraints da query
     * @returns {Object} Query
     */
    query: (collectionRef, ...queryConstraints) => {
      const { query: queryFn } = require("firebase/firestore");
      return queryFn(collectionRef, ...queryConstraints);
    },

    /**
     * Helper para criar where constraint
     * @param {string} field - Campo
     * @param {string} operator - Operador
     * @param {*} value - Valor
     * @returns {Object} Where constraint
     */
    where: (field, operator, value) => {
      const { where: whereFn } = require("firebase/firestore");
      return whereFn(field, operator, value);
    },

    /**
     * Obtém timestamp do servidor
     * @returns {Object} Timestamp
     */
    serverTimestamp: () => {
      const { serverTimestamp } = require("firebase/firestore");
      return serverTimestamp();
    },
  };
};
