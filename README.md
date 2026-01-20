# 🩺 Sistema de Agendamento Médico — Plataforma SaaS

Uma **plataforma SaaS de agendamento médico online**, desenvolvida para automatizar a gestão de consultas, reduzir faltas e simplificar a comunicação entre médicos e clientes.

O sistema permite que profissionais de saúde gerenciem sua agenda de forma inteligente, enquanto clientes realizam agendamentos de maneira rápida, segura e totalmente online.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Tecnologias](#-tecnologias)
4. [Arquitetura](#-arquitetura)
5. [Instalação e Configuração](#-instalação-e-configuração)
6. [Estrutura do Projeto](#-estrutura-do-projeto)
7. [Documentação](#-documentação)
8. [Deploy](#-deploy)
9. [Limitações Conhecidas](#-limitações-conhecidas)
10. [Avaliação Técnica](#-avaliação-técnica)

---

## 🎯 Visão Geral

### Problema que Resolve

Clínicas e profissionais de saúde enfrentam desafios com:
- ⏱️ Agendamentos manuais e demorados
- 📅 Falta de controle de horários
- 📞 Confirmações feitas individualmente
- 🚫 Clientes que esquecem consultas

### Solução

Este sistema oferece uma **experiência digital completa**, moderna e escalável, pronta para uso em produção como um produto SaaS, com:

- ✅ Agendamento online público (sem login necessário)
- ✅ Gestão completa de agenda para médicos
- ✅ Sistema de planos (FREE e PRO) com integração Stripe
- ✅ Validação server-side robusta
- ✅ Interface moderna e responsiva

---

## 🚀 Funcionalidades

### 👨‍⚕️ Para Médicos

#### Autenticação e Segurança
- Cadastro e login com Firebase Authentication
- Verificação de e-mail
- Recuperação de senha
- Proteção de rotas privadas

#### Gerenciamento de Disponibilidade
- Definição de horários livres por dia
- Slots customizáveis (ex.: 09:30, 10:00, 14:15)
- Visualização em calendário mensal
- Bloqueio automático de horários já agendados
- Suporte a múltiplos locais de atendimento
- Configuração de tipos de atendimento (online/presencial)

#### Agenda Inteligente
- Visualização diária da agenda
- Navegação entre dias (anterior / próximo / hoje)
- Atualização de status das consultas:
  - Pendente
  - Confirmada
  - Msg enviada
  - Não compareceu
  - Cancelado
- Proteção de status em horários reagendados

#### Dashboard
- Visão geral das consultas do mês
- Estatísticas de consultas por status
- Gráficos de receita e agendamentos
- Indicadores operacionais em tempo real
- Comparação mensal de performance

#### Gestão de Pacientes
- Cadastro e edição de pacientes
- Histórico de consultas por paciente
- Preços personalizados por paciente
- Busca e filtros avançados

#### Configurações
- Personalização de mensagens WhatsApp
- Configuração de link público de agendamento
- Gestão de tipos de atendimento e locais
- Gerenciamento de assinatura (cancelar/reativar)

#### Sistema de Planos
- **Plano FREE**: 10 consultas confirmadas por mês
- **Plano PRO**: Ilimitado (R$ 49/mês via Stripe)
- Validação automática de limites
- Upgrade/downgrade de planos

### 🧑‍🤝‍🧑 Para Clientes (Agendamento Público)

#### Agendamento Online
- Acesso público sem necessidade de login
- Visualização apenas de horários disponíveis
- Interface simples e intuitiva
- Seleção de tipo de atendimento (se configurado)
- Seleção de local (se presencial)
- Confirmação instantânea

#### Validações
- Prevenção de double-booking
- Validação de disponibilidade em tempo real
- Verificação de limites de plano
- Validação server-side completa

---

## 🛠️ Tecnologias

### Frontend

- **React 19** - Biblioteca UI moderna
- **React Router DOM 7** - Roteamento
- **Vite 7** - Build tool e dev server
- **Lucide React** - Ícones
- **React Icons** - Ícones adicionais
- **React Calendar** - Componente de calendário
- **Recharts** - Gráficos e visualizações
- **CSS Modules** - Estilização modular

### Backend & Infraestrutura

- **Firebase Authentication** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL
- **Firebase Hosting** - Hospedagem estática
- **Firebase Functions v2** - Serverless functions
- **TypeScript** - Type safety no backend

### Integrações

- **Stripe** - Processamento de pagamentos
  - Checkout Sessions
  - Subscriptions
  - Webhooks

### DevOps & Qualidade

- **ESLint** - Linting de código
- **Git** - Controle de versão
- **Firebase CLI** - Deploy e gerenciamento

---

## 🧩 Arquitetura

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Páginas    │  │  Componentes │  │    Hooks     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Services  │  │    Utils     │  │  Constants   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│              Firebase Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Auth        │  │  Firestore   │  │  Functions   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↕ Webhooks
┌─────────────────────────────────────────────────────────┐
│                    Stripe API                           │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Comunicação

#### Frontend ↔ Backend

1. **Firebase Services (SDK)**
   - Autenticação: `firebase/auth`
   - Firestore: `firebase/firestore`
   - Direto do cliente para Firebase

2. **Firebase Functions (Callable)**
   - Operações sensíveis (criação de agendamentos públicos)
   - Validação de limites
   - Operações do Stripe

3. **Firebase Functions (HTTP)**
   - Webhooks do Stripe
   - Processamento assíncrono de eventos

### Separação de Responsabilidades

- **Frontend**: UI/UX, validações client-side, gerenciamento de estado
- **Firebase Services**: CRUD básico, autenticação
- **Firebase Functions**: Validações críticas, integrações externas, lógica de negócio complexa
- **Firestore**: Armazenamento de dados com regras de segurança

---

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ (recomendado: Node.js 20+)
- npm ou yarn
- Conta Firebase
- Conta Stripe (para funcionalidades de pagamento)

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd agendamento-medico
```

### 2. Instale as Dependências

```bash
# Dependências do frontend
npm install

# Dependências do backend (functions)
cd functions
npm install
cd ..
```

### 3. Configure Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (Opcional - apenas se usar pagamentos)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_ID=price_...

# Email Service (Opcional)
VITE_APPS_SCRIPT_URL=https://script.google.com/...
```

**Onde encontrar as credenciais do Firebase:**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em "Configurações do projeto" > "Seus apps"
4. Copie as credenciais do app web

### 4. Configure Firebase Functions Secrets

```bash
cd functions

# Configure secrets do Stripe (se usar pagamentos)
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

### 5. Configure Firestore

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em "Firestore Database"
3. Configure as regras de segurança (veja `firestore.rules`)
4. Configure os índices (veja `firestore.indexes.json`)

### 6. Execute o Projeto

```bash
# Desenvolvimento (frontend)
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### 7. Deploy (Opcional)

```bash
# Deploy do frontend
firebase deploy --only hosting

# Deploy das functions
cd functions
npm run build
firebase deploy --only functions
```

---

## 📁 Estrutura do Projeto

```
agendamento-medico/
├── functions/                    # Firebase Functions (Backend)
│   ├── src/
│   │   ├── appointments/        # Functions de agendamentos
│   │   │   ├── createPublicAppointment.ts
│   │   │   └── validateAppointmentLimit.ts
│   │   ├── stripe/              # Functions do Stripe
│   │   │   ├── createCheckoutSession.ts
│   │   │   ├── cancelSubscription.ts
│   │   │   ├── reactivateSubscription.ts
│   │   │   ├── webhook.ts
│   │   │   ├── helpers.ts
│   │   │   └── types.ts
│   │   └── index.ts             # Export central
│   ├── package.json
│   └── tsconfig.json
│
├── src/                          # Frontend (React)
│   ├── components/              # Componentes React
│   │   ├── agenda/             # Componentes da agenda
│   │   ├── allAppointments/    # Componentes de todos os agendamentos
│   │   ├── availability/       # Componentes de disponibilidade
│   │   ├── common/             # Componentes reutilizáveis
│   │   ├── dashboard/          # Componentes do dashboard
│   │   ├── layout/             # Componentes de layout
│   │   ├── patients/          # Componentes de pacientes
│   │   ├── publicSchedule/     # Componentes de agendamento público
│   │   └── settings/           # Componentes de configurações
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── agenda/             # Hooks da agenda
│   │   ├── appointments/      # Hooks de agendamentos
│   │   ├── auth/              # Hooks de autenticação
│   │   ├── common/            # Hooks comuns
│   │   ├── dashboard/         # Hooks do dashboard
│   │   ├── patients/         # Hooks de pacientes
│   │   ├── settings/         # Hooks de configurações
│   │   └── stripe/           # Hooks do Stripe
│   │
│   ├── pages/                 # Páginas da aplicação
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Agenda.jsx
│   │   ├── Availability.jsx
│   │   ├── AllAppointments.jsx
│   │   ├── Patients.jsx
│   │   ├── Settings.jsx
│   │   └── PublicSchedule.jsx
│   │
│   ├── services/              # Serviços e APIs
│   │   ├── firebase/          # Serviços Firebase
│   │   │   ├── config.js
│   │   │   ├── auth.service.js
│   │   │   ├── doctors.service.js
│   │   │   ├── patients.service.js
│   │   │   ├── appointments.service.js
│   │   │   └── availability.service.js
│   │   ├── api/               # APIs externas
│   │   │   └── email.service.js
│   │   └── stripe/            # Serviços Stripe
│   │       └── stripe.service.js
│   │
│   ├── utils/                  # Funções utilitárias
│   │   ├── appointments/     # Utils de agendamentos
│   │   ├── availability/     # Utils de disponibilidade
│   │   ├── date/             # Utils de data
│   │   ├── filters/          # Utils de filtros
│   │   ├── formatter/        # Utils de formatação
│   │   ├── limits/           # Utils de limites
│   │   ├── locations/        # Utils de locais
│   │   ├── logger/           # Utils de logging
│   │   ├── stats/            # Utils de estatísticas
│   │   ├── time/             # Utils de tempo
│   │   └── whatsapp/         # Utils de WhatsApp
│   │
│   ├── constants/            # Constantes
│   │   ├── appointmentStatus.js
│   │   ├── appointmentType.js
│   │   ├── months.js
│   │   └── plans.js
│   │
│   ├── routes/               # Configuração de rotas
│   │   ├── AppRoutes.jsx
│   │   └── PrivateRoute.jsx
│   │
│   ├── styles/               # Estilos globais
│   │   └── variables.css
│   │
│   ├── docs/                 # Documentação técnica
│   │   ├── README.md
│   │   ├── DocumentacaoBackend.md
│   │   ├── DocumentacaoComponents.md
│   │   ├── DocumentacaoHooks.md
│   │   ├── DocumentacaoPages.md
│   │   ├── DocumentacaoServices.md
│   │   ├── DocumentacaoStripe.md
│   │   └── DocumentacaoUtils.MD
│   │
│   └── main.jsx              # Entry point
│
├── public/                    # Arquivos estáticos
│   └── favicon.png
│
├── firestore.rules           # Regras de segurança do Firestore
├── firestore.indexes.json    # Índices do Firestore
├── vite.config.js            # Configuração do Vite
├── package.json              # Dependências do projeto
└── README.md                 # Este arquivo
```

---

## 📚 Documentação

A documentação completa está disponível em `src/docs/`:

### Documentações Disponíveis

- **[DocumentacaoBackend.md](src/docs/DocumentacaoBackend.md)** - Documentação completa do backend (Firebase Functions)
- **[DocumentacaoServices.md](src/docs/DocumentacaoServices.md)** - Documentação dos serviços Firebase
- **[DocumentacaoHooks.md](src/docs/DocumentacaoHooks.md)** - Documentação de todos os hooks
- **[DocumentacaoPages.md](src/docs/DocumentacaoPages.md)** - Documentação de todas as páginas
- **[DocumentacaoComponents.md](src/docs/DocumentacaoComponents.md)** - Documentação dos componentes
- **[DocumentacaoStripe.md](src/docs/DocumentacaoStripe.md)** - Documentação da integração Stripe
- **[DocumentacaoUtils.MD](src/docs/DocumentacaoUtils.MD)** - Documentação das funções utilitárias

### Guia Rápido

1. **Começando?** Leia o [README da documentação](src/docs/README.md)
2. **Trabalhando com backend?** Consulte [DocumentacaoBackend.md](src/docs/DocumentacaoBackend.md)
3. **Entendendo a arquitetura?** Veja [DocumentacaoServices.md](src/docs/DocumentacaoServices.md)
4. **Desenvolvendo features?** Veja [DocumentacaoHooks.md](src/docs/DocumentacaoHooks.md) e [DocumentacaoComponents.md](src/docs/DocumentacaoComponents.md)

---

## 🚀 Deploy

### Deploy do Frontend

```bash
# Build
npm run build

# Deploy para Firebase Hosting
firebase deploy --only hosting
```

### Deploy das Functions

```bash
cd functions

# Build TypeScript
npm run build

# Deploy
firebase deploy --only functions

# Deploy de uma function específica
firebase deploy --only functions:createPublicAppointment
```

### Deploy Completo

```bash
# Frontend + Functions
firebase deploy
```

### Configuração de Domínio Customizado

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em "Hosting"
3. Clique em "Adicionar domínio customizado"
4. Siga as instruções de DNS
🔗 **Aplicação em produção:**  
> [Link da aplicação](https://etna-agendamento-medico.web.app/)

---

## ⚠️ Limitações Conhecidas

### Funcionalidades

1. **Email Service**
   - Atualmente comentado/desabilitado
   - Requer configuração de Google Apps Script

2. **Paginação**
   - Listas grandes não têm paginação implementada
   - Pode impactar performance com muitos registros

3. **Cache**
   - Não há cache local implementado
   - Todas as consultas vão direto ao Firestore

4. **Retry Logic**
   - Operações críticas não têm retry automático
   - Falhas de rede podem requerer retry manual

### Performance

1. **Queries Complexas**
   - Algumas queries podem ser lentas com muitos dados
   - Índices do Firestore devem ser configurados corretamente

2. **Bundle Size**
   - Bundle do frontend pode ser otimizado
   - Code splitting pode ser melhorado

### Segurança

1. **Rate Limiting**
   - Não há rate limiting implementado nas functions
   - Pode ser vulnerável a abuso

2. **Validação de Input**
   - Algumas validações dependem apenas do frontend
   - Backend valida operações críticas, mas não todas

---

## 🎓 Avaliação Técnica

### Pontos Fortes

#### Arquitetura
- ✅ **Separação clara de responsabilidades** - Frontend, Services, Functions bem organizados
- ✅ **Arquitetura escalável** - Serverless permite crescimento horizontal
- ✅ **Type safety** - TypeScript no backend garante menos erros
- ✅ **Padrões consistentes** - Código segue padrões estabelecidos

#### Código
- ✅ **Organização excelente** - Estrutura de pastas clara e lógica
- ✅ **Documentação completa** - Todas as partes do sistema documentadas
- ✅ **Reutilização** - Hooks e componentes bem reutilizáveis
- ✅ **Validações robustas** - Validação server-side em operações críticas

#### Segurança
- ✅ **Autenticação robusta** - Firebase Authentication bem implementado
- ✅ **Regras de segurança** - Firestore rules configuradas
- ✅ **Validação server-side** - Operações críticas validadas no backend
- ✅ **Secrets management** - Secrets gerenciados via Firebase Secret Manager

#### Funcionalidades
- ✅ **Sistema completo** - Todas as funcionalidades principais implementadas
- ✅ **Integração Stripe** - Pagamentos funcionando corretamente
- ✅ **UX moderna** - Interface responsiva e intuitiva
- ✅ **Performance razoável** - Sistema funciona bem para uso normal

### Áreas de Melhoria

#### Performance
- ⚠️ **Implementar paginação** - Listas grandes podem ser lentas
- ⚠️ **Adicionar cache** - Reduzir chamadas ao Firestore
- ⚠️ **Code splitting** - Melhorar carregamento inicial
- ⚠️ **Otimizar queries** - Algumas queries podem ser otimizadas

#### Testes
- ⚠️ **Falta de testes** - Não há testes unitários ou de integração
- ⚠️ **Testes E2E** - Testes end-to-end seriam valiosos
- ⚠️ **Testes de functions** - Backend não tem testes

#### Monitoramento
- ⚠️ **Métricas** - Falta sistema de métricas e alertas
- ⚠️ **Error tracking** - Não há sistema de rastreamento de erros (Sentry, etc.)
- ⚠️ **Analytics** - Falta analytics de uso

#### Segurança
- ⚠️ **Rate limiting** - Implementar rate limiting nas functions
- ⚠️ **Validação completa** - Algumas validações só no frontend
- ⚠️ **Auditoria** - Falta log de auditoria para operações críticas

#### Manutenibilidade
- ⚠️ **Testes automatizados** - CI/CD com testes
- ⚠️ **Linting mais rigoroso** - Configurar mais regras do ESLint
- ⚠️ **TypeScript no frontend** - Migrar para TypeScript

### Pronto para Produção?

#### ✅ Sim, com ressalvas:

**Pronto para:**
- ✅ Uso em produção com volume moderado
- ✅ Deploy imediato para usuários reais
- ✅ Expansão gradual de funcionalidades

**Recomendações antes de escala:**
1. Implementar testes básicos
2. Adicionar monitoramento (Sentry, Firebase Analytics)
3. Implementar rate limiting
4. Otimizar queries e adicionar paginação
5. Configurar alertas e métricas

**Não recomendado para:**
- ❌ Alto volume sem otimizações (milhares de usuários simultâneos)
- ❌ Aplicações críticas sem testes
- ❌ Compliance rigoroso (LGPD, HIPAA) sem auditoria

### Visão Geral

Este é um **projeto de alta qualidade** com arquitetura sólida, código bem organizado e documentação excelente. Está pronto para uso em produção com volume moderado, mas se beneficiaria de melhorias em testes, monitoramento e otimizações de performance antes de escalar significativamente.

**Nota:** 8.5/10 - Excelente projeto com potencial para ser 10/10 com as melhorias sugeridas.

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT**, permitindo uso comercial e personalizações.

---

## 👨‍💻 Autor

Desenvolvido por **Eduardo de Sá Abrahão**  
Projeto com foco em qualidade, escalabilidade e experiência do usuário.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email do autor.

---

## 🌐 Links Úteis

- 🔗 **Aplicação em produção:** [Link da aplicação](https://etna-agendamento-medico.web.app/login)
- 📚 **Documentação completa:** [src/docs/](src/docs/)
- 🔥 **Firebase Console:** [console.firebase.google.com](https://console.firebase.google.com/)
- 💳 **Stripe Dashboard:** [dashboard.stripe.com](https://dashboard.stripe.com/)

---

⭐ Se este projeto chamou sua atenção, considere deixar uma estrela no repositório.
