// ============================================
// 📁 src/contexts/ServicesContext.jsx
// Context para injeção de dependências (DIP)
// ============================================

import { createContext } from "react";
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
export const ServicesContext = createContext(defaultServices);

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
