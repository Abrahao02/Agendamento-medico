# 📚 Documentação de Testes

## Visão Geral

Este projeto implementa testes automatizados seguindo uma abordagem incremental e focada em valor real. Os testes estão organizados em três níveis: unitários, integração e E2E.

## Estrutura de Testes

```
src/
├── __tests__/
│   ├── setup.js                    # Configuração global dos testes
│   ├── mocks/
│   │   └── handlers.js            # Handlers MSW (futuro)
│   └── README.md                   # Esta documentação
├── components/
│   └── common/
│       └── Button/
│           └── Button.test.jsx     # Testes do componente Button
├── utils/
│   └── validators/
│       └── appointmentValidations.test.js  # Testes de validação
├── hooks/
│   └── auth/
│       └── useLogin.test.js        # Testes do hook useLogin
└── services/
    └── firebase/
        └── auth.service.test.js    # Testes do serviço de auth
```

## Tipos de Testes

### 1. Testes Unitários

Testam funções puras e componentes isolados.

**Arquivos testados:**
- `src/utils/validators/appointmentValidations.js`
- `src/utils/limits/calculateMonthlyLimit.js`
- `src/utils/whatsapp/cleanWhatsapp.js`
- `src/components/common/Button/Button.jsx`
- `src/components/common/Badge/Badge.jsx`
- `src/components/common/Input/Input.jsx`

**Exemplo:**
```javascript
// appointmentValidations.test.js
describe('validatePatientName', () => {
  it('deve aceitar nome válido', () => {
    expect(validatePatientName('João Silva')).toBe('João Silva');
  });
});
```

### 2. Testes de Serviços

Testam integrações com APIs externas usando mocks.

**Arquivos testados:**
- `src/services/firebase/auth.service.js`

**Exemplo:**
```javascript
// auth.service.test.js
describe('registerUser', () => {
  it('deve registrar usuário com sucesso', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    const result = await registerUser('test@test.com', 'password123');
    expect(result.success).toBe(true);
  });
});
```

### 3. Testes de Hooks

Testam hooks customizados do React.

**Arquivos testados:**
- `src/hooks/auth/useLogin.js`

**Exemplo:**
```javascript
// useLogin.test.js
describe('useLogin', () => {
  it('deve fazer login com sucesso', async () => {
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.handleLogin({ preventDefault: vi.fn() });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
```

### 4. Testes de Componentes

Testam componentes React focando em comportamento do usuário.

**Arquivos testados:**
- `src/components/publicSchedule/AppointmentForm/AppointmentForm.jsx`
- `src/components/patients/AddPatientModal/AddPatientModal.jsx`

**Exemplo:**
```javascript
// AppointmentForm.test.jsx
describe('AppointmentForm', () => {
  it('deve renderizar formulário com slot selecionado', () => {
    render(<AppointmentForm {...defaultProps} />);
    expect(screen.getByText('Solicitar agendamento')).toBeInTheDocument();
  });
});
```

## Como Executar os Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm test
# Pressione 'a' para rodar todos os testes
# Pressione 'f' para rodar apenas testes que falharam
# Pressione 'q' para sair
```

### Executar testes com UI interativa
```bash
npm run test:ui
```

### Executar testes e gerar relatório de cobertura
```bash
npm run test:coverage
```

### Executar testes uma vez (sem watch)
```bash
npm run test:run
```

### Executar testes E2E (Playwright)
```bash
npm run test:e2e
```

## Cobertura de Código

### Meta de Cobertura

- **Etapa 1 (Atual)**: 20-30% - Utils e componentes simples
- **Etapa 2**: 40-50% - Hooks e formulários
- **Etapa 3**: 60-70% - E2E e otimização

### Verificar Cobertura

Após executar `npm run test:coverage`, um relatório HTML será gerado em `coverage/index.html`.

## Convenções de Testes

### Nomenclatura

- Arquivos de teste: `*.test.js` ou `*.test.jsx`
- Localização: Ao lado do arquivo testado
- Descrever comportamentos, não implementação

### Estrutura de um Teste

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('NomeDoComponente', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  it('deve fazer algo específico', () => {
    // Arrange
    const input = 'valor';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('esperado');
  });
});
```

### Boas Práticas

1. **Teste comportamento, não implementação**
   ```javascript
   // ❌ Ruim - testa implementação
   expect(component.state.isOpen).toBe(true);
   
   // ✅ Bom - testa comportamento
   expect(screen.getByText('Modal aberto')).toBeInTheDocument();
   ```

2. **Use queries acessíveis**
   ```javascript
   // ❌ Ruim
   screen.getByTestId('submit-button');
   
   // ✅ Bom
   screen.getByRole('button', { name: /enviar/i });
   ```

3. **Isole dependências externas**
   ```javascript
   // Mock de serviços externos
   vi.mock('../../services/firebase/auth.service');
   ```

4. **Um teste, uma responsabilidade**
   ```javascript
   // ❌ Ruim - testa múltiplas coisas
   it('deve fazer login e navegar e mostrar erro', () => { ... });
   
   // ✅ Bom - testes separados
   it('deve fazer login com sucesso', () => { ... });
   it('deve navegar para dashboard após login', () => { ... });
   it('deve mostrar erro quando login falha', () => { ... });
   ```

## Testes E2E com Playwright

### Configuração

Os testes E2E estão configurados em `playwright.config.js` (a ser criado).

### Executar E2E

```bash
# Instalar browsers
npx playwright install

# Executar testes
npm run test:e2e

# Executar em modo UI
npx playwright test --ui
```

### Fluxos Testados

1. **Login → Dashboard** (fluxo básico)
2. **Agendamento público** (fluxo de receita)
3. **Criar paciente → Agendar consulta** (fluxo médico)

## CI/CD

Os testes são executados automaticamente no GitHub Actions em:
- Push para `main` ou `develop`
- Pull Requests para `main` ou `develop`

Arquivo de configuração: `.github/workflows/test.yml`

## Troubleshooting

### Testes falhando após mudanças

1. Verifique se os mocks estão atualizados
2. Verifique se as dependências foram instaladas: `npm install`
3. Limpe o cache: `rm -rf node_modules/.vite`

### Erros com Firebase mocks

Certifique-se de que os mocks estão configurados corretamente:
```javascript
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  // ...
}));
```

### Problemas com React Testing Library

Certifique-se de que `@testing-library/jest-dom` está importado no `setup.js`:
```javascript
import '@testing-library/jest-dom';
```

## Próximos Passos

1. ✅ Configuração inicial - **Concluído**
2. ✅ Testes de validators - **Concluído**
3. ✅ Testes de componentes comuns - **Concluído**
4. ✅ Testes de serviços - **Concluído**
5. ✅ Testes de hooks - **Concluído**
6. ✅ Testes de formulários - **Concluído**
7. ⏳ Configurar Playwright E2E - **Em progresso**
8. ⏳ Aumentar cobertura para 40-50%
9. ⏳ Adicionar testes de acessibilidade
10. ⏳ Otimizar suíte de testes

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
