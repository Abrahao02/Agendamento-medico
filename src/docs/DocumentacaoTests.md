# Documentação de Testes

> **Versão:** 1.0  
> **Última atualização:** Janeiro 2026

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Testes Unitários](#testes-unitários)
4. [Testes E2E](#testes-e2e)
5. [Configuração](#configuração)
6. [Como Executar](#como-executar)
7. [Cobertura de Código](#cobertura-de-código)
8. [Boas Práticas](#boas-práticas)
9. [Próximos Passos](#próximos-passos)

---

## Visão Geral

Este projeto implementa testes automatizados seguindo uma abordagem incremental e focada em valor real. Os testes estão organizados em três níveis:

- **Testes Unitários**: Funções puras, validadores e utilitários
- **Testes de Integração**: Hooks e serviços com mocks
- **Testes E2E**: Fluxos completos de usuário com Playwright

### Ferramentas Utilizadas

- **Vitest**: Framework de testes unitários e integração
- **React Testing Library**: Testes de componentes React
- **Playwright**: Testes end-to-end em múltiplos browsers
- **jsdom**: Ambiente DOM para testes unitários

---

## Estrutura de Testes

```
src/
├── __tests__/
│   ├── setup.js                    # Configuração global dos testes
│   ├── mocks/
│   │   └── handlers.js            # Handlers MSW (futuro)
│   └── e2e/
│       ├── login.spec.js          # Testes E2E de login
│       ├── appointment.spec.js    # Testes E2E de agendamento
│       └── responsive.spec.js     # Testes E2E de responsividade
├── utils/
│   ├── validators/
│   │   └── appointmentValidations.test.js
│   ├── whatsapp/
│   │   └── cleanWhatsapp.test.js
│   └── limits/
│       └── calculateMonthlyLimit.test.js
├── hooks/
│   └── auth/
│       └── useLogin.test.js
└── services/
    └── firebase/
        └── auth.service.test.js
```

---

## Testes Unitários

### Validators

#### `src/utils/validators/appointmentValidations.test.js`

Testa as funções de validação de agendamento público.

**Funções testadas:**
- `validatePatientName(name)` - Valida e normaliza nome do paciente
- `validateWhatsapp(whatsapp)` - Valida e limpa número WhatsApp
- `validateSelectedSlot(slot)` - Valida seleção de horário

**Casos de teste:**

**validatePatientName:**
- ✅ Aceita nome válido
- ✅ Remove espaços extras no início e fim
- ✅ Remove espaços duplos entre palavras
- ✅ Lança erro para nome vazio
- ✅ Lança erro para nome apenas com espaços
- ✅ Lança erro para nome null/undefined
- ✅ Aceita nome com acentos e caracteres especiais

**validateWhatsapp:**
- ✅ Aceita número válido com 11 dígitos
- ✅ Remove formatação (parênteses, hífen, espaços)
- ✅ Extrai apenas números de string mista
- ✅ Lança erro para número com menos de 11 dígitos
- ✅ Lança erro para número com mais de 11 dígitos
- ✅ Lança erro para string apenas com letras

**validateSelectedSlot:**
- ✅ Aceita slot válido (string ou objeto)
- ✅ Lança erro para slot null/undefined
- ✅ Lança erro para slot vazio

**Total:** ~15 casos de teste

---

### Utils - WhatsApp

#### `src/utils/whatsapp/cleanWhatsapp.test.js`

Testa a função de limpeza de números WhatsApp.

**Função testada:**
- `cleanWhatsapp(value)` - Remove formatação e retorna apenas números

**Casos de teste:**
- ✅ Remove formatação com parênteses e hífen
- ✅ Remove espaços
- ✅ Remove apenas caracteres não numéricos
- ✅ Retorna string vazia para valor vazio/null/undefined
- ✅ Converte número para string
- ✅ Remove múltiplos caracteres especiais
- ✅ Mantém apenas números válidos
- ✅ Lida com string apenas com caracteres não numéricos

**Total:** ~10 casos de teste

---

### Utils - Limits

#### `src/utils/limits/calculateMonthlyLimit.test.js`

Testa o cálculo de limites mensais de agendamentos.

**Funções testadas:**
- `calculateMonthlyAppointmentsCount(appointments)` - Conta agendamentos confirmados do mês atual
- `checkLimitReached(planType, count, customLimit)` - Verifica se limite foi atingido

**Casos de teste:**

**calculateMonthlyAppointmentsCount:**
- ✅ Retorna 0 quando não há agendamentos
- ✅ Conta apenas agendamentos confirmados do mês atual
- ✅ Não conta agendamentos de meses anteriores
- ✅ Não conta agendamentos cancelados
- ✅ Conta agendamentos no primeiro dia do mês
- ✅ Conta agendamentos no último dia do mês

**checkLimitReached:**
- ✅ Retorna false para plano PRO (sem limite)
- ✅ Retorna false para plano FREE quando abaixo do limite
- ✅ Retorna true para plano FREE quando no limite
- ✅ Retorna true para plano FREE quando acima do limite
- ✅ Usa limite customizado quando fornecido
- ✅ Retorna false para plano FREE com contagem zero

**Total:** ~12 casos de teste

---

### Hooks

#### `src/hooks/auth/useLogin.test.js`

Testa o hook de login usando React Testing Library.

**Hook testado:**
- `useLogin()` - Gerencia estado e lógica de login

**Funcionalidades testadas:**

**handleChange:**
- ✅ Atualiza email no form
- ✅ Atualiza password no form

**toggleShowPassword:**
- ✅ Alterna visibilidade da senha

**handleLogin:**
- ✅ Faz login com sucesso e navega para dashboard
- ✅ Mostra erro quando email não é verificado
- ✅ Mostra erro quando login falha
- ✅ Valida formulário antes de fazer login
- ✅ Limpa erro quando form muda

**handleForgotPassword:**
- ✅ Envia email de redefinição com sucesso
- ✅ Mostra erro quando email é inválido
- ✅ Mostra erro quando resetPassword falha

**Total:** ~10 casos de teste

---

### Services

#### `src/services/firebase/auth.service.test.js`

Testa o serviço de autenticação Firebase com mocks.

**Funções testadas:**
- `registerUser(email, password)` - Registra novo usuário
- `loginUser(email, password)` - Faz login
- `logoutUser()` - Faz logout
- `resetPassword(email)` - Envia email de redefinição

**Casos de teste:**

**registerUser:**
- ✅ Registra usuário com sucesso
- ✅ Retorna erro para email já cadastrado
- ✅ Retorna erro para email inválido
- ✅ Retorna erro para senha fraca
- ✅ Retorna mensagem genérica para erro desconhecido

**loginUser:**
- ✅ Faz login com sucesso
- ✅ Retorna erro para usuário não encontrado
- ✅ Retorna erro para senha incorreta
- ✅ Retorna erro para email inválido

**logoutUser:**
- ✅ Faz logout com sucesso
- ✅ Retorna erro quando logout falha

**resetPassword:**
- ✅ Envia email de redefinição com sucesso
- ✅ Retorna erro quando email não existe
- ✅ Retorna erro para email inválido

**Total:** ~15 casos de teste

---

## Testes E2E

Os testes E2E são executados com Playwright em múltiplos browsers (Chromium, Firefox, WebKit).

### Login Flow

#### `src/__tests__/e2e/login.spec.js`

Testa o fluxo completo de login do usuário.

**Casos de teste:**
- ✅ Renderiza página de login com elementos principais
- ✅ Mostra erro para email inválido
- ✅ Mostra erro para campos vazios (validação HTML5)
- ✅ Alterna visibilidade da senha
- ✅ Navega para página de registro
- ✅ Mostra link de "Esqueci minha senha"

**Total:** 6 casos de teste

---

### Appointment Flow

#### `src/__tests__/e2e/appointment.spec.js`

Testa o fluxo de agendamento público.

**Status:** ⚠️ Testes atualmente com `test.skip()` - precisam de dados de teste configurados

**Casos de teste (planejados):**
- ⏸️ Carrega página de agendamento público
- ⏸️ Mostra horários disponíveis
- ⏸️ Valida formulário de agendamento

**Total:** 3 casos (todos skip)

**Nota:** Estes testes requerem um médico válido no sistema. Em produção, devem usar fixtures ou dados de teste.

---

### Responsive Tests

#### `src/__tests__/e2e/responsive.spec.js`

Testa responsividade em múltiplos viewports.

**Viewports testados:**
- iPhone SE (375x667)
- iPhone 12 (390x844)
- iPhone 14 Pro Max (430x932)
- iPad (768x1024)
- Desktop (1280x720)

**Casos de teste (por viewport):**
- ✅ Não deve ter scroll horizontal
- ✅ Elementos não devem estourar viewport
- ✅ Textos devem ser legíveis (tamanho mínimo 12px)
- ✅ Botões devem ter área clicável adequada (mínimo 44x44px em mobile)
- ✅ Inputs não devem ser cortados
- ✅ Imagens não devem ultrapassar containers

**Total:** 30 casos de teste (6 testes × 5 viewports)

**Validações realizadas:**
- Verifica `scrollWidth <= viewportWidth` para prevenir scroll horizontal
- Verifica elementos não ultrapassam limites da viewport
- Valida tamanho mínimo de fonte (12px) para legibilidade
- Valida área mínima de toque em botões (44x44px) para acessibilidade
- Verifica inputs completamente visíveis na viewport
- Verifica imagens respeitam largura do container pai

---

## Configuração

### Vitest

**Arquivo:** `vite.config.js`

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/__tests__/setup.js',
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/e2e/**',
    '**/*.e2e.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}' // Excluir specs do Playwright
  ],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'src/__tests__/',
      '**/*.config.js',
      '**/dist/**',
      '**/*.test.{js,jsx}',
      '**/dataconnect-generated/**',
      '**/e2e/**'
    ]
  }
}
```

**Características:**
- Ambiente jsdom para simular DOM
- Setup global em `src/__tests__/setup.js`
- Cobertura com V8
- Exclui testes E2E do Vitest

---

### Playwright

**Arquivo:** `playwright.config.js`

```javascript
export default defineConfig({
  testDir: './src/__tests__/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Características:**
- Testa em 3 browsers (Chromium, Firefox, WebKit)
- Execução paralela
- Retry automático no CI
- Screenshots apenas em falhas
- Inicia servidor de desenvolvimento automaticamente

---

### Setup Global

**Arquivo:** `src/__tests__/setup.js`

```javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**Funcionalidades:**
- Importa matchers customizados do jest-dom
- Limpa DOM após cada teste
- Configuração global para todos os testes unitários

---

## Como Executar

### Testes Unitários

**Executar todos os testes (modo watch):**
```bash
npm test
```

**Executar testes uma vez (sem watch):**
```bash
npm run test:run
```

**Executar com UI interativa:**
```bash
npm run test:ui
```

**Executar e gerar cobertura:**
```bash
npm run test:coverage
```

Após gerar cobertura, um relatório HTML será criado em `coverage/index.html`.

---

### Testes E2E

**Instalar browsers (primeira vez):**
```bash
npx playwright install
```

**Executar todos os testes E2E:**
```bash
npm run test:e2e
```

**Executar em modo UI:**
```bash
npm run test:e2e:ui
```

**Executar apenas em Chromium:**
```bash
npx playwright test --project=chromium
```

**Executar teste específico:**
```bash
npx playwright test src/__tests__/e2e/login.spec.js
```

**Ver relatório HTML:**
```bash
npx playwright show-report
```

---

## Cobertura de Código

### Metas de Cobertura

O projeto segue uma abordagem incremental:

- **Etapa 1 (Atual)**: 20-30% - Utils e componentes simples
- **Etapa 2**: 40-50% - Hooks e formulários
- **Etapa 3**: 60-70% - E2E e otimização

### Áreas Cobertas

**✅ Coberto:**
- Validators (appointmentValidations)
- Utils (WhatsApp, Limits)
- Hook de autenticação (useLogin)
- Serviço de autenticação (auth.service)
- Testes E2E de login
- Testes E2E de responsividade

**⏳ Parcialmente coberto:**
- Componentes (alguns têm testes, outros não)
- Hooks (apenas useLogin)
- Serviços (apenas auth.service)

**❌ Não coberto:**
- Maioria dos componentes
- Maioria dos hooks
- Maioria dos serviços
- Fluxos E2E completos (agendamento público)

### Verificar Cobertura

```bash
npm run test:coverage
```

O relatório será gerado em `coverage/index.html`. Abra no navegador para visualizar:

- Cobertura por arquivo
- Linhas não cobertas
- Branches não cobertas
- Funções não cobertas

---

## Boas Práticas

### Nomenclatura

- Arquivos de teste: `*.test.js` ou `*.test.jsx`
- Arquivos E2E: `*.spec.js`
- Localização: Ao lado do arquivo testado ou em `__tests__/e2e/`

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

### Teste Comportamento, Não Implementação

```javascript
// ❌ Ruim - testa implementação
expect(component.state.isOpen).toBe(true);

// ✅ Bom - testa comportamento
expect(screen.getByText('Modal aberto')).toBeInTheDocument();
```

### Use Queries Acessíveis

```javascript
// ❌ Ruim
screen.getByTestId('submit-button');

// ✅ Bom
screen.getByRole('button', { name: /enviar/i });
```

### Isole Dependências Externas

```javascript
// Mock de serviços externos
vi.mock('../../services/firebase/auth.service');
```

### Um Teste, Uma Responsabilidade

```javascript
// ❌ Ruim - testa múltiplas coisas
it('deve fazer login e navegar e mostrar erro', () => { ... });

// ✅ Bom - testes separados
it('deve fazer login com sucesso', () => { ... });
it('deve navegar para dashboard após login', () => { ... });
it('deve mostrar erro quando login falha', () => { ... });
```

---

## Próximos Passos

### Curto Prazo

1. ✅ Configuração inicial - **Concluído**
2. ✅ Testes de validators - **Concluído**
3. ✅ Testes de serviços - **Concluído**
4. ✅ Testes de hooks - **Concluído**
5. ✅ Testes E2E de login - **Concluído**
6. ✅ Testes E2E de responsividade - **Concluído**
7. ⏳ Implementar testes E2E de agendamento (precisa fixtures)
8. ⏳ Adicionar testes de componentes faltantes
9. ⏳ Adicionar testes de hooks faltantes

### Médio Prazo

1. ⏳ Aumentar cobertura para 40-50%
2. ⏳ Adicionar testes de acessibilidade
3. ⏳ Configurar MSW para mocks de API
4. ⏳ Adicionar testes de performance
5. ⏳ Otimizar suíte de testes

### Longo Prazo

1. ⏳ Aumentar cobertura para 60-70%
2. ⏳ Implementar testes de regressão visual
3. ⏳ Adicionar testes de carga
4. ⏳ Integrar testes no CI/CD completo

---

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
  signInWithEmailAndPassword: vi.fn(),
  // ...
}));
```

### Problemas com React Testing Library

Certifique-se de que `@testing-library/jest-dom` está importado no `setup.js`:

```javascript
import '@testing-library/jest-dom';
```

### Playwright não encontra elementos

1. Verifique se o servidor está rodando: `npm run dev`
2. Aumente o timeout se necessário
3. Use `page.waitForSelector()` para elementos assíncronos

---

## Recursos

### Documentação Oficial

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Artigos Úteis

- [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)

---

**Documentação criada por:** Assistente IA  
**Data:** Janeiro 2026  
**Versão:** 1.0
