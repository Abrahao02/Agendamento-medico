// ============================================
// 📁 src/contexts/ServicesContext.jsx
// Context para injeção de dependências (DIP)
// ============================================

import { createContext, useContext } from "react";
import { db } from "../services/firebase/config";
import { getFunctions } from "firebase/functions";
import app from "../services/firebase/config";
import { createDatabaseService, createFunctionsService } from "../services/interfaces";

// Criar instâncias dos serviços
const databaseService = createDatabaseService(db);
const functionsService = createFunctionsService(getFunctions(app));

// Valor padrão do context
const defaultServices = {
  database: databaseService,
  functions: functionsService,
};

// Criar context
const ServicesContext = createContext(defaultServices);

/**
 * Provider de serviços
 * Permite injeção de dependências para facilitar testes
 */
export const ServicesProvider = ({ children, services = defaultServices }) => {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

/**
 * Hook para acessar serviços injetados
 * @returns {Object} Serviços disponíveis
 */
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};
