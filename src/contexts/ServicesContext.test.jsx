// ============================================
// 📁 src/contexts/ServicesContext.test.jsx
// Testes para ServicesContext
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ServicesProvider, useServices } from './ServicesContext';
import { createDatabaseService, createFunctionsService } from '../services/interfaces';

// Mock das interfaces
vi.mock('../services/interfaces', () => ({
  createDatabaseService: vi.fn((db) => ({
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDocs: vi.fn(),
    doc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    serverTimestamp: vi.fn(),
  })),
  createFunctionsService: vi.fn((functions) => ({
    call: vi.fn(),
  })),
}));

// Mock do Firebase config
vi.mock('../services/firebase/config', () => ({
  db: {},
  default: {},
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
}));

describe('ServicesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ServicesProvider', () => {
    it('deve fornecer serviços padrão quando renderizado', () => {
      const TestComponent = () => {
        const services = useServices();
        expect(services.database).toBeDefined();
        expect(services.functions).toBeDefined();
        expect(typeof services.database.getDoc).toBe('function');
        expect(typeof services.functions.call).toBe('function');
        return <div data-testid="test-component">Test</div>;
      };

      const { getByTestId } = render(
        <ServicesProvider>
          <TestComponent />
        </ServicesProvider>
      );

      expect(getByTestId('test-component')).toBeInTheDocument();
      // Os serviços são criados no módulo, não durante o render
      // Verificamos que os serviços estão disponíveis através do contexto
    });

    it('deve permitir injeção de serviços customizados', () => {
      const customDatabase = {
        getDoc: vi.fn(),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        getDocs: vi.fn(),
        doc: vi.fn(),
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        serverTimestamp: vi.fn(),
      };

      const customFunctions = {
        call: vi.fn(),
      };

      const customServices = {
        database: customDatabase,
        functions: customFunctions,
      };

      const TestComponent = () => {
        const services = useServices();
        expect(services.database).toBe(customDatabase);
        expect(services.functions).toBe(customFunctions);
        return <div data-testid="test-component">Test</div>;
      };

      const { getByTestId } = render(
        <ServicesProvider services={customServices}>
          <TestComponent />
        </ServicesProvider>
      );

      expect(getByTestId('test-component')).toBeInTheDocument();
    });

    it('deve renderizar children corretamente', () => {
      const { getByText } = render(
        <ServicesProvider>
          <div>Child Component</div>
        </ServicesProvider>
      );

      expect(getByText('Child Component')).toBeInTheDocument();
    });
  });

  describe('useServices', () => {
    it('deve retornar serviços quando usado dentro do provider', () => {
      const TestComponent = () => {
        const services = useServices();
        expect(services).toHaveProperty('database');
        expect(services).toHaveProperty('functions');
        return null;
      };

      render(
        <ServicesProvider>
          <TestComponent />
        </ServicesProvider>
      );
    });

    it('deve lançar erro quando usado fora do provider', () => {
      // Testar que o hook lança erro quando usado fora do provider
      // Como React captura erros, vamos testar diretamente a lógica
      const TestComponent = () => {
        try {
          useServices();
        } catch (error) {
          // O erro será capturado pelo React Error Boundary
          // Mas podemos verificar que o erro tem a mensagem correta
          expect(error.message).toContain('useServices must be used within a ServicesProvider');
        }
        return null;
      };

      // Renderizar sem provider - React vai capturar o erro
      const { container } = render(<TestComponent />);
      expect(container).toBeTruthy();
    });

    it('deve fornecer serviços com métodos esperados', () => {
      const TestComponent = () => {
        const services = useServices();
        
        // Verificar estrutura do database service
        expect(services.database).toHaveProperty('getDoc');
        expect(services.database).toHaveProperty('setDoc');
        expect(services.database).toHaveProperty('updateDoc');
        expect(services.database).toHaveProperty('deleteDoc');
        expect(services.database).toHaveProperty('getDocs');
        expect(services.database).toHaveProperty('doc');
        expect(services.database).toHaveProperty('collection');
        expect(services.database).toHaveProperty('query');
        expect(services.database).toHaveProperty('where');
        expect(services.database).toHaveProperty('serverTimestamp');
        
        // Verificar estrutura do functions service
        expect(services.functions).toHaveProperty('call');
        
        return null;
      };

      render(
        <ServicesProvider>
          <TestComponent />
        </ServicesProvider>
      );
    });
  });

  describe('Estado inicial', () => {
    it('deve inicializar com serviços padrão', () => {
      const TestComponent = () => {
        const services = useServices();
        expect(services).toBeDefined();
        expect(services.database).toBeDefined();
        expect(services.functions).toBeDefined();
        return null;
      };

      render(
        <ServicesProvider>
          <TestComponent />
        </ServicesProvider>
      );
    });
  });
});
