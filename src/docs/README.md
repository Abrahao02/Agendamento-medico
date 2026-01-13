# 📚 Documentação do Projeto

> **Versão:** 1.0  
> **Última atualização:** Janeiro 2026

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Documentações Disponíveis](#-documentações-disponíveis)
3. [Sugestões de Melhorias](#-sugestões-de-melhorias)
4. [Como Usar](#-como-usar)

---

## 🎯 Visão Geral

Esta pasta contém toda a documentação técnica do projeto, organizada por categorias para facilitar a navegação e manutenção.

### Estrutura

```
src/docs/
├── README.md                        # Este arquivo
├── SugestoesMelhorias.md            # Sugestões para melhorias das documentações existentes
├── DocumentacaoServices.md          # Documentação dos Services (referência)
├── DocumentacaoUtils.MD             # Documentação dos Utils (referência)
├── DocumentacaoHooks.md             # ✨ Documentação completa dos Hooks
├── DocumentacaoPages.md             # ✨ Documentação completa das Pages
├── DocumentacaoComponents.md        # ✨ Documentação completa dos Components
└── DocumentacaoStripe.md            # ✨ NOVO - Documentação completa da integração Stripe
```

---

## 📚 Documentações Disponíveis

### 1. **DocumentacaoServices.md**
**Localização:** `src/services/DocumentacaoServices.md`

Documentação completa dos serviços Firebase:
- Auth Service
- Doctor Service
- Patient Service
- Appointment Service
- Availability Service
- Email Service

**Status:** ✅ Completa e revisada

---

### 2. **DocumentacaoUtils.MD**
**Localização:** `src/utils/DocumentacaoUtils.MD`

Documentação completa das funções utilitárias:
- WhatsApp Utils
- Formatação
- Validações
- Filtros de Data
- Filtros de Appointments
- Filtros de Availability
- Estatísticas
- Helpers

**Status:** ✅ Completa e revisada

---

### 3. **DocumentacaoHooks.md** ✨ NOVO
**Localização:** `src/docs/DocumentacaoHooks.md`

Documentação completa de todos os hooks do projeto:

- **Auth Hooks**
  - `useLogin()` - Gerenciamento de login
  - `useRegister()` - Gerenciamento de registro

- **Dashboard Hooks**
  - `useDashboard()` - Dados do dashboard principal

- **Agenda Hooks**
  - `useAgenda(currentDate)` - Agenda do dia
  - `useAllAppointments(user)` - Todos os appointments

- **Appointments Hooks**
  - `useAvailability()` - Gerenciamento de disponibilidade
  - `usePublicSchedule(slug)` - Agendamento público

- **Patients Hooks**
  - `usePatients(user)` - Gerenciamento de pacientes

- **Settings Hooks**
  - `useSettings(user)` - Configurações do médico

- **Common Hooks**
  - `useDashboardLayout()` - Layout do dashboard
  - `useLandingPage()` - Página inicial
  - `useSmoothScroll(options)` - Scroll suave

**Status:** ✅ Completa e nova

---

### 4. **DocumentacaoPages.md** ✨ NOVO
**Localização:** `src/docs/DocumentacaoPages.md`

Documentação completa de todas as páginas do projeto:

- **Páginas Públicas**
  - `LandingPage` - Página inicial
  - `PublicSchedule` - Agendamento público
  - `PublicScheduleSuccess` - Confirmação de agendamento

- **Páginas de Autenticação**
  - `Login` - Login de médicos
  - `Register` - Registro de médicos

- **Páginas do Dashboard**
  - `Dashboard` - Página principal
  - `Agenda` - Agenda do dia
  - `Availability` - Disponibilidade mensal
  - `AllAppointments` - Todos os appointments
  - `Patients` - Gestão de pacientes
  - `Settings` - Configurações

- **Layout Pages**
  - `DashboardLayout` - Layout do dashboard

**Status:** ✅ Completa e nova

---

### 5. **DocumentacaoComponents.md** ✨ NOVO
**Localização:** `src/docs/DocumentacaoComponents.md`

Documentação dos principais componentes reutilizáveis:

- **Common Components**
  - `Badge` - Badges e tags
  - `Button` - Botões
  - `Card` - Cards
  - `Input` - Campos de input
  - `PageHeader` - Cabeçalho de página
  - `Filters` - Filtros avançados
  - `ContentLoading` - Loading de conteúdo
  - `LoadingFallback` - Loading de lazy loading
  - `PasswordInput` - Input de senha
  - `PasswordChecklist` - Checklist de senha

- **Dashboard Components**
  - `StatsCard` - Cards de estatística
  - `StatusSummary` - Resumo por status
  - `AppointmentsChart` - Gráfico de appointments
  - `UpcomingAppointments` - Próximos appointments
  - `PublicLinkCard` - Card com link público

- **Layout Components**
  - `Header` - Cabeçalho da landing
  - `Sidebar` - Barra lateral

- **Agenda Components**
  - `DateNavigation` - Navegação de datas
  - `AppointmentList` - Lista de appointments
  - `AppointmentItem` - Item de appointment

- **Availability Components**
  - `CalendarWrapper` - Wrapper do calendário
  - `DayManagement` - Gerenciamento de dia

- **Landing Components**
  - `HeroSection` - Seção hero
  - `ProblemSection` - Seção de problemas
  - `FeaturesSection` - Seção de funcionalidades
  - `PricingSection` - Seção de planos
  - `Footer` - Rodapé

**Status:** ✅ Completa e nova

---

## 📖 Como Usar

### Para Desenvolvedores

1. **Comece pela documentação específica:**
   - Precisa entender um hook? → `DocumentacaoHooks.md`
   - Precisa entender uma página? → `DocumentacaoPages.md`
   - Precisa entender um componente? → `DocumentacaoComponents.md`

2. **Consulte as documentações de referência:**
   - Trabalhando com services? → `DocumentacaoServices.md`
   - Trabalhando com utils? → `DocumentacaoUtils.MD`

3. **Melhore as documentações:**
   - Verifique `SugestoesMelhorias.md` para ideias
   - Atualize as documentações quando adicionar novos recursos
   - Mantenha os exemplos atualizados

### Para Novos Membros da Equipe

1. **Leia esta documentação primeiro** (README.md)
2. **Entenda a arquitetura geral:**
   - Leia `DocumentacaoServices.md` para entender os serviços
   - Leia `DocumentacaoHooks.md` para entender a lógica de negócio
   - Leia `DocumentacaoPages.md` para entender as páginas
   - Leia `DocumentacaoComponents.md` para entender os componentes

3. **Pratique com exemplos:**
   - Todos os documentos têm exemplos práticos
   - Siga os padrões estabelecidos

---

## 🎓 Boas Práticas

### Ao Adicionar Novos Recursos

1. **Documente imediatamente:**
   - Adicione hooks em `DocumentacaoHooks.md`
   - Adicione páginas em `DocumentacaoPages.md`
   - Adicione componentes em `DocumentacaoComponents.md`

2. **Siga os padrões:**
   - Use o mesmo formato das documentações existentes
   - Inclua exemplos de código
   - Documente todas as props/parâmetros

3. **Mantenha atualizado:**
   - Atualize as documentações quando mudar comportamento
   - Remova documentação de recursos deprecados
   - Adicione notas de breaking changes

### Ao Revisar Documentações

1. **Verifique se está completo:**
   - Todas as funções/hooks/páginas/componentes estão documentados?
   - Os exemplos estão atualizados?
   - As referências estão corretas?

2. **Verifique se está claro:**
   - A linguagem está clara?
   - Os exemplos são úteis?
   - A organização faz sentido?

3. **Sugira melhorias:**
   - Adicione sugestões em `SugestoesMelhorias.md`
   - Crie issues para melhorias importantes
   - Discuta com a equipe

---

## 📊 Status das Documentações

| Documentação | Status | Versão | Última Atualização |
|--------------|--------|--------|-------------------|
| DocumentacaoServices.md | ✅ Completa | 1.0 | Janeiro 2026 |
| DocumentacaoUtils.MD | ✅ Completa | 2.1 | Janeiro 2026 |
| DocumentacaoHooks.md | ✅ Completa | 1.1 | Janeiro 2026 |
| DocumentacaoPages.md | ✅ Completa | 1.1 | Janeiro 2026 |
| DocumentacaoComponents.md | ✅ Completa | 1.1 | Janeiro 2026 |
| DocumentacaoStripe.md | ✅ Completa | 1.0 | Janeiro 2026 |
| SugestoesMelhorias.md | ✅ Completa | 1.0 | Janeiro 2026 |
| SugestoesOrganizacao.md | ✅ Completa | 1.0 | Janeiro 2026 |

---

## 🔗 Links Úteis

### Documentações de Referência

- [DocumentacaoServices.md](../services/DocumentacaoServices.md) - Services Firebase
- [DocumentacaoUtils.MD](../utils/DocumentacaoUtils.MD) - Utils do projeto

### Documentações Novas

- [DocumentacaoHooks.md](./DocumentacaoHooks.md) - Hooks do projeto
- [DocumentacaoPages.md](./DocumentacaoPages.md) - Pages do projeto
- [DocumentacaoComponents.md](./DocumentacaoComponents.md) - Components do projeto
- [DocumentacaoStripe.md](./DocumentacaoStripe.md) - ✨ NOVO - Integração Stripe
- [SugestoesMelhorias.md](./SugestoesMelhorias.md) - Sugestões de melhorias
- [SugestoesOrganizacao.md](./SugestoesOrganizacao.md) - Sugestões de organização

---

## 📝 Notas

- **Todas as documentações estão em Markdown** para facilitar leitura e edição
- **Exemplos de código** estão em JavaScript/React
- **TypeScript types** são incluídos onde relevante (usando sintaxe TypeScript em comentários)
- **Links entre documentações** são relativos para funcionar localmente

---

## 🤝 Contribuindo

Para melhorar as documentações:

1. **Leia** as documentações existentes
2. **Identifique** áreas de melhoria
3. **Documente** seguindo os padrões
4. **Revise** antes de fazer commit
5. **Atualize** o status em `SugestoesMelhorias.md`

---

**Documentação criada por:** Assistente IA  
**Data:** Janeiro 2026  
**Versão:** 1.1
