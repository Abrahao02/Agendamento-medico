# 📚 Documentação Completa - Hooks do Projeto

> **Versão:** 1.0  
> **Última atualização:** Janeiro 2026  
> **Total de Hooks:** 12 hooks

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Auth Hooks](#-auth-hooks)
3. [Dashboard Hooks](#-dashboard-hooks)
4. [Agenda Hooks](#-agenda-hooks)
5. [Appointments Hooks](#-appointments-hooks)
6. [Patients Hooks](#-patients-hooks)
7. [Settings Hooks](#-settings-hooks)
8. [Common Hooks](#-common-hooks)
9. [Guia de Uso](#-guia-de-uso)

---

## 🎯 Visão Geral

### Arquitetura

```
src/hooks/
├── auth/
│   ├── useLogin.js
│   └── useRegister.js
├── dashboard/
│   └── useDashboard.js
├── agenda/
│   ├── useAgenda.js
│   └── useAllAppointments.js
├── appointments/
│   ├── useAvailability.js
│   └── usePublicSchedule.js
├── patients/
│   └── usePatients.js
├── settings/
│   └── useSettings.js
└── common/
    ├── useDashboardLayout.js
    ├── useLandingPage.js
    └── useSmoothScroll.js
```

### Padrão de Retorno

Todos os hooks seguem o padrão de retornar um objeto com:
- Estados (loading, error, data)
- Handlers (funções de ação)
- Setters (funções para atualizar estado)

---

## 🔐 Auth Hooks

### `useLogin()`

**Arquivo:** `src/hooks/auth/useLogin.js`

Hook para gerenciar login e recuperação de senha.

#### **Uso**

```javascript
import { useLogin } from "@/hooks/auth/useLogin";

function Login() {
  const {
    form,
    error,
    resetError,
    resetEmailSent,
    showPassword,
    handleChange,
    toggleShowPassword,
    handleLogin,
    handleForgotPassword,
  } = useLogin();

  return (
    <form onSubmit={handleLogin}>
      {/* ... campos do formulário ... */}
    </form>
  );
}
```

#### **Estados Retornados**

```typescript
{
  form: {
    email: string,
    password: string
  },
  error: string,
  resetError: string,
  resetEmailSent: boolean,
  showPassword: boolean
}
```

#### **Handlers**

- `handleChange(e)`: Atualiza campos do formulário
- `toggleShowPassword()`: Alterna visibilidade da senha
- `handleLogin(e)`: Processa login do usuário
- `handleForgotPassword()`: Envia email de recuperação de senha

#### **Comportamento**

- ✅ Valida email e senha antes de fazer login
- ✅ Verifica se email está verificado
- ✅ Redireciona para `/dashboard` após login bem-sucedido
- ✅ Valida email antes de enviar recuperação de senha
- ✅ Usa `validateFormField` para validações

---

### `useRegister()`

**Arquivo:** `src/hooks/auth/useRegister.js`

Hook para gerenciar registro de novos médicos.

#### **Uso**

```javascript
import { useRegister } from "@/hooks/auth/useRegister";

function Register() {
  const {
    form,
    errors,
    passwordCriteria,
    handleChange,
    handleSubmit,
  } = useRegister();

  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos do formulário ... */}
    </form>
  );
}
```

#### **Estados Retornados**

```typescript
{
  form: {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    whatsapp: string
  },
  errors: {
    name?: string,
    email?: string,
    password?: string,
    confirmPassword?: string,
    whatsapp?: string
  },
  passwordCriteria: {
    length: boolean,
    uppercase: boolean,
    lowercase: boolean,
    number: boolean,
    symbol: boolean
  }
}
```

#### **Handlers**

- `handleChange(e)`: Atualiza campos do formulário (formata WhatsApp automaticamente)
- `handleSubmit(e)`: Processa registro do médico

#### **Comportamento**

- ✅ Valida todos os campos obrigatórios
- ✅ Valida força da senha (critérios)
- ✅ Valida confirmação de senha
- ✅ Formata WhatsApp automaticamente
- ✅ Cria usuário no Firebase Auth
- ✅ Cria documento do médico no Firestore
- ✅ Redireciona para `/dashboard` após registro bem-sucedido
- ✅ Usa `validateFormField` e `validatePassword` para validações

---

## 📊 Dashboard Hooks

### `useDashboard()`

**Arquivo:** `src/hooks/dashboard/useDashboard.js`

Hook para gerenciar dados do dashboard principal.

#### **Uso**

```javascript
import { useDashboard } from "@/hooks/dashboard/useDashboard";

function Dashboard() {
  const {
    loading,
    doctorSlug,
    stats,
    statusSummary,
    chartData,
    upcomingAppointments,
    selectedDateFrom,
    selectedDateTo,
    selectedMonth,
    selectedYear,
    availableYears,
    setSelectedDateFrom,
    setSelectedDateTo,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
  } = useDashboard();

  // ...
}
```

#### **Estados Retornados**

```typescript
{
  loading: boolean,
  doctorSlug: string,
  stats: {
    totalAppointments: number,
    newPatients: number,
    slotsOpen: number,
    conversionRate: number,
    totalRevenue: number,
    averageTicket: number,
    appointmentsComparison: number,
    newPatientsComparison: number
  },
  statusSummary: {
    confirmed: number,
    pending: number,
    cancelled: number,
    percentages: {
      confirmed: number,
      pending: number,
      cancelled: number
    }
  },
  chartData: Array,
  upcomingAppointments: Array,
  selectedDateFrom: string,
  selectedDateTo: string,
  selectedMonth: number,
  selectedYear: number,
  availableYears: number[]
}
```

#### **Handlers**

- `setSelectedDateFrom(date)`: Define data inicial do filtro
- `setSelectedDateTo(date)`: Define data final do filtro
- `setSelectedMonth(month)`: Define mês do filtro
- `setSelectedYear(year)`: Define ano do filtro
- `resetFilters()`: Reseta todos os filtros para valores padrão

#### **Comportamento**

- ✅ Busca dados do médico, appointments, availability e patients em paralelo
- ✅ Calcula estatísticas automaticamente
- ✅ Filtra appointments por período selecionado
- ✅ Gera dados para gráficos
- ✅ Calcula comparação com período anterior
- ✅ Usa `useMemo` para otimizar cálculos

---

## 📅 Agenda Hooks

### `useAgenda(currentDate)`

**Arquivo:** `src/hooks/agenda/useAgenda.js`

Hook para gerenciar agenda do dia específico.

#### **Uso**

```javascript
import useAgenda from "@/hooks/agenda/useAgenda";

function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    appointments,
    statusUpdates,
    referenceNames,
    patientStatus,
    whatsappConfig,
    hasUnsavedChanges,
    lockedAppointments,
    handleStatusChange,
    handleAddPatient,
    handleSendWhatsapp,
  } = useAgenda(currentDate);

  // ...
}
```

#### **Parâmetros**

- `currentDate` (Date): Data do dia a visualizar

#### **Estados Retornados**

```typescript
{
  appointments: Array<Appointment>,
  statusUpdates: { [appointmentId]: string },
  referenceNames: { [appointmentId]: string },
  patientStatus: { [appointmentId]: string },
  whatsappConfig: {
    intro: string,
    body: string,
    footer: string,
    showValue: boolean
  },
  hasUnsavedChanges: boolean,
  lockedAppointments: Set<string>,
}
```

#### **Handlers**

- `handleStatusChange(appointmentId, status)`: Atualiza status do appointment
- `handleAddPatient(appointmentData)`: Adiciona novo paciente ao appointment
- `handleSendWhatsapp(appointmentId)`: Abre WhatsApp com mensagem formatada

#### **Comportamento**

- ✅ Busca appointments do dia selecionado
- ✅ Carrega configurações do WhatsApp do médico
- ✅ Identifica appointments bloqueados (com conflitos)
- ✅ Gerencia mudanças não salvas
- ✅ Ordena appointments por horário
- ✅ Formata mensagens WhatsApp automaticamente

---

### `useAllAppointments(user)`

**Arquivo:** `src/hooks/agenda/useAllAppointments.js`

Hook para gerenciar todos os appointments com filtros avançados.

#### **Uso**

```javascript
import useAllAppointments from "@/hooks/agenda/useAllAppointments";

function AllAppointments() {
  const user = auth.currentUser;

  const {
    patientsData,
    loadingData,
    statusFilter,
    searchTerm,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    setStatusFilter,
    setSearchTerm,
    setStartDate,
    setEndDate,
    setSelectedMonth,
    setSelectedYear,
    resetFilters,
    availableYears,
    expandedPatients,
    togglePatient,
    toggleAll,
    changedIds,
    saving,
    handleStatusChange,
    handleSave,
    stats,
    lockedAppointments,
  } = useAllAppointments(user);

  // ...
}
```

#### **Parâmetros**

- `user` (User): Usuário autenticado do Firebase

#### **Estados Retornados**

```typescript
{
  patientsData: Array<Patient>,
  loadingData: boolean,
  statusFilter: string,
  searchTerm: string,
  startDate: string,
  endDate: string,
  selectedMonth: number,
  selectedYear: number,
  availableYears: number[],
  expandedPatients: Set<string>,
  changedIds: Set<string>,
  saving: boolean,
  stats: {
    totalAppointments: number,
    totalValue: number,
    totalPatients: number
  },
  lockedAppointments: Set<string>
}
```

#### **Handlers**

- `setStatusFilter(status)`: Define filtro de status
- `setSearchTerm(term)`: Define termo de busca
- `setStartDate(date)`: Define data inicial
- `setEndDate(date)`: Define data final
- `setSelectedMonth(month)`: Define mês
- `setSelectedYear(year)`: Define ano
- `resetFilters()`: Reseta todos os filtros
- `togglePatient(whatsapp)`: Expande/contrai paciente
- `toggleAll(expand)`: Expande/contrai todos
- `handleStatusChange(appointmentId, status)`: Atualiza status
- `handleSave()`: Salva todas as mudanças

#### **Comportamento**

- ✅ Agrupa appointments por paciente
- ✅ Aplica múltiplos filtros simultaneamente
- ✅ Identifica appointments bloqueados (com conflitos)
- ✅ Rastreia mudanças não salvas
- ✅ Calcula estatísticas agregadas
- ✅ Suporta expansão/colapso de pacientes
- ✅ Usa `useMemo` para otimizar filtros

---

## 📆 Appointments Hooks

### `useAvailability()`

**Arquivo:** `src/hooks/appointments/useAvailability.js`

Hook para gerenciar disponibilidade e appointments no calendário.

#### **Uso**

```javascript
import { useAvailability } from "@/hooks/appointments/useAvailability";

function Availability() {
  const {
    loading,
    error,
    patients,
    selectedDate,
    calendarValue,
    handleSelectDate,
    handleAddSlot,
    handleRemoveSlot,
    handleBookAppointment,
    deleteAppointment,
    markAsCancelled,
    getAvailabilityForDate,
    getAllSlotsForDate,
    getAppointmentsForDate,
    getCalendarTileData,
  } = useAvailability();

  // ...
}
```

#### **Estados Retornados**

```typescript
{
  loading: boolean,
  error: string | null,
  patients: Array<Patient>,
  selectedDate: string,
  calendarValue: Date
}
```

#### **Handlers**

- `handleSelectDate(date)`: Seleciona data no calendário
- `handleAddSlot(date, time)`: Adiciona slot de disponibilidade
- `handleRemoveSlot(date, time)`: Remove slot de disponibilidade
- `handleBookAppointment(appointmentData)`: Cria novo appointment
- `deleteAppointment(appointmentId)`: Deleta appointment
- `markAsCancelled(appointmentId)`: Marca appointment como cancelado

#### **Getters**

- `getAvailabilityForDate(date)`: Retorna slots disponíveis de uma data
- `getAllSlotsForDate(date)`: Retorna todos os slots de uma data
- `getAppointmentsForDate(date)`: Retorna appointments de uma data
- `getCalendarTileData(date)`: Retorna dados para badges do calendário

#### **Comportamento**

- ✅ Carrega disponibilidade, appointments e patients
- ✅ Valida conflitos antes de criar appointments
- ✅ Atualiza calendário em tempo real
- ✅ Identifica slots ocupados vs livres
- ✅ Considera apenas appointments ativos para conflitos

---

### `usePublicSchedule(slug)`

**Arquivo:** `src/hooks/appointments/usePublicSchedule.js`

Hook para gerenciar agendamento público.

#### **Uso**

```javascript
import { usePublicSchedule } from "@/hooks/appointments/usePublicSchedule";

function PublicSchedule() {
  const { slug } = useParams();

  const {
    doctor,
    availability,
    loading,
    error,
    limitReached,
    selectedDay,
    selectedSlot,
    handleDaySelect,
    handleSlotSelect,
    createAppointment,
  } = usePublicSchedule(slug);

  // ...
}
```

#### **Parâmetros**

- `slug` (string): Slug do médico (da URL)

#### **Estados Retornados**

```typescript
{
  doctor: Doctor | null,
  availability: Array<Availability>,
  loading: boolean,
  error: string | null,
  limitReached: boolean,
  selectedDay: Day | null,
  selectedSlot: Slot | null
}
```

#### **Handlers**

- `handleDaySelect(day)`: Seleciona dia na disponibilidade
- `handleSlotSelect(day, time)`: Seleciona slot específico
- `createAppointment(formData)`: Cria novo appointment

#### **Comportamento**

- ✅ Busca médico por slug
- ✅ Carrega disponibilidade futura validada
- ✅ Filtra slots já agendados
- ✅ Valida dados do formulário antes de criar
- ✅ Envia email de notificação ao médico
- ✅ Verifica limite de appointments do médico

---

## 👥 Patients Hooks

### `usePatients(user)`

**Arquivo:** `src/hooks/patients/usePatients.js`

Hook para gerenciar pacientes e suas estatísticas.

#### **Uso**

```javascript
import { usePatients } from "@/hooks/patients/usePatients";

function Patients() {
  const user = auth.currentUser;

  const {
    loading,
    saving,
    newPatient,
    error,
    patientsList,
    patientsCount,
    updateNewPatientField,
    handleWhatsappChange,
    isWhatsappDuplicate,
    updatePatientPrice,
    updatePatientReferenceName,
    savePatient,
    addPatient,
    enableEditPatient,
    editingPatients,
    formatWhatsappDisplay,
    setError,
  } = usePatients(user);

  // ...
}
```

#### **Parâmetros**

- `user` (User): Usuário autenticado do Firebase

#### **Estados Retornados**

```typescript
{
  loading: boolean,
  saving: string | null,
  newPatient: {
    name: string,
    referenceName: string,
    whatsapp: string,
    price: number
  },
  error: string,
  patientsList: Array<Patient>,
  patientsCount: number,
  editingPatients: { [whatsapp]: boolean }
}
```

#### **Handlers**

- `updateNewPatientField(field, value)`: Atualiza campo do novo paciente
- `handleWhatsappChange(value)`: Atualiza WhatsApp (formata automaticamente)
- `isWhatsappDuplicate(whatsapp)`: Verifica se WhatsApp já existe
- `updatePatientPrice(whatsapp, value)`: Atualiza preço do paciente
- `updatePatientReferenceName(whatsapp, value)`: Atualiza nome de referência
- `savePatient(patient)`: Salva alterações do paciente
- `addPatient()`: Adiciona novo paciente
- `enableEditPatient(whatsapp)`: Habilita edição do paciente
- `formatWhatsappDisplay(whatsapp)`: Formata WhatsApp para exibição

#### **Comportamento**

- ✅ Carrega pacientes e appointments
- ✅ Calcula estatísticas por paciente
- ✅ Formata WhatsApp automaticamente
- ✅ Valida duplicatas antes de adicionar
- ✅ Gerencia estado de edição por paciente
- ✅ Calcula total de consultas por paciente

---

## ⚙️ Settings Hooks

### `useSettings(user)`

**Arquivo:** `src/hooks/settings/useSettings.js`

Hook para gerenciar configurações do médico.

#### **Uso**

```javascript
import { useSettings } from "@/hooks/settings/useSettings";

function Settings() {
  const user = auth.currentUser;

  const {
    loading,
    saving,
    defaultValueSchedule,
    whatsappConfig,
    setDefaultValueSchedule,
    updateWhatsappField,
    saveSettings,
    generatePreview,
  } = useSettings(user);

  // ...
}
```

#### **Parâmetros**

- `user` (User): Usuário autenticado do Firebase

#### **Estados Retornados**

```typescript
{
  loading: boolean,
  saving: boolean,
  defaultValueSchedule: string,
  whatsappConfig: {
    intro: string,
    body: string,
    footer: string,
    showValue: boolean
  }
}
```

#### **Handlers**

- `setDefaultValueSchedule(value)`: Define valor padrão da consulta
- `updateWhatsappField(field, value)`: Atualiza campo da configuração WhatsApp
- `saveSettings()`: Salva todas as configurações
- `generatePreview(patientName, date, time)`: Gera preview da mensagem WhatsApp

#### **Comportamento**

- ✅ Carrega configurações do médico
- ✅ Gera preview da mensagem WhatsApp em tempo real
- ✅ Valida dados antes de salvar
- ✅ Atualiza documento do médico no Firestore

---

## 🎨 Common Hooks

### `useDashboardLayout()`

**Arquivo:** `src/hooks/common/useDashboardLayout.js`

Hook para gerenciar layout do dashboard (sidebar e dados do usuário).

#### **Uso**

```javascript
import { useDashboardLayout } from "@/hooks/common/useDashboardLayout";

function DashboardLayout() {
  const {
    sidebarOpen,
    isDesktop,
    toggleSidebar,
    closeSidebar,
    doctorName,
    plan,
    appointmentsThisMonth,
    isLimitReached,
    loading,
    handleLogout,
  } = useDashboardLayout();

  // ...
}
```

#### **Estados Retornados**

```typescript
{
  sidebarOpen: boolean,
  isDesktop: boolean,
  doctorName: string,
  plan: string,
  appointmentsThisMonth: number,
  isLimitReached: boolean,
  loading: boolean
}
```

#### **Handlers**

- `toggleSidebar()`: Alterna visibilidade da sidebar
- `closeSidebar()`: Fecha a sidebar
- `handleLogout()`: Realiza logout do usuário

#### **Comportamento**

- ✅ Gerencia estado responsivo da sidebar
- ✅ Carrega dados do médico e plano
- ✅ Calcula appointments do mês atual
- ✅ Verifica limite de appointments do plano
- ✅ Responsivo (mobile/desktop)

---

### `useLandingPage()`

**Arquivo:** `src/hooks/common/useLandingPage.js`

Hook para gerenciar página inicial.

#### **Uso**

```javascript
import { useLandingPage } from "@/hooks/common/useLandingPage";

function LandingPage() {
  const {
    user,
    loading,
    handleProClick,
    scrollToPlans,
  } = useLandingPage();

  // ...
}
```

#### **Estados Retornados**

```typescript
{
  user: User | null,
  loading: boolean
}
```

#### **Handlers**

- `handleProClick()`: Abre link de upgrade para plano PRO
- `scrollToPlans()`: Faz scroll suave para seção de planos

#### **Comportamento**

- ✅ Detecta usuário autenticado
- ✅ Gerencia scroll para seção de planos
- ✅ Abre link de pagamento em nova aba

---

### `useSmoothScroll(options)`

**Arquivo:** `src/hooks/common/useSmoothScroll.js`

Hook para scroll suave para elementos.

#### **Uso**

```javascript
import useSmoothScroll from "@/hooks/common/useSmoothScroll";

function Component() {
  const { scrollTo } = useSmoothScroll({
    offset: 80,
    behavior: "smooth",
    closeMenu: setMenuOpen,
  });

  return <button onClick={() => scrollTo("section-id")}>Scroll</button>;
}
```

#### **Parâmetros**

```typescript
{
  offset?: number,        // Offset do scroll (default: 0)
  behavior?: string,      // Comportamento (default: "smooth")
  closeMenu?: function    // Função para fechar menu (opcional)
}
```

#### **Retorna**

```typescript
{
  scrollTo: (id: string) => void
}
```

#### **Comportamento**

- ✅ Faz scroll suave para elemento
- ✅ Aplica offset configurável
- ✅ Fecha menu após scroll (opcional)

---

## 📖 Guia de Uso

### Exemplo Completo: Dashboard

```javascript
import { useDashboard } from "@/hooks/dashboard/useDashboard";

function Dashboard() {
  const {
    loading,
    stats,
    chartData,
    upcomingAppointments,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useDashboard();

  if (loading) return <Loading />;

  return (
    <div>
      <StatsCards stats={stats} />
      <Chart data={chartData} />
      <AppointmentsList appointments={upcomingAppointments} />
      
      <Filters
        month={selectedMonth}
        year={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
    </div>
  );
}
```

### Exemplo Completo: Agenda

```javascript
import useAgenda from "@/hooks/agenda/useAgenda";

function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    appointments,
    statusUpdates,
    lockedAppointments,
    handleStatusChange,
    handleSendWhatsapp,
  } = useAgenda(currentDate);

  return (
    <div>
      {appointments.map(appt => (
        <AppointmentItem
          key={appt.id}
          appointment={appt}
          status={statusUpdates[appt.id]}
          isLocked={lockedAppointments.has(appt.id)}
          onStatusChange={(status) => handleStatusChange(appt.id, status)}
          onSendWhatsapp={() => handleSendWhatsapp(appt.id)}
        />
      ))}
    </div>
  );
}
```

### Exemplo Completo: Login

```javascript
import { useLogin } from "@/hooks/auth/useLogin";

function Login() {
  const {
    form,
    error,
    showPassword,
    handleChange,
    toggleShowPassword,
    handleLogin,
    handleForgotPassword,
  } = useLogin();

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
      />
      
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={form.password}
        onChange={handleChange}
      />
      
      <button type="button" onClick={toggleShowPassword}>
        {showPassword ? "Ocultar" : "Mostrar"}
      </button>

      {error && <p>{error}</p>}

      <button type="submit">Entrar</button>
      
      <button type="button" onClick={handleForgotPassword}>
        Esqueci minha senha
      </button>
    </form>
  );
}
```

---

## 🎓 Conclusão

### Pontos Fortes

- ✅ Hooks bem organizados e reutilizáveis
- ✅ Separação clara de responsabilidades
- ✅ Uso eficiente de hooks do React (useState, useEffect, useMemo, useCallback)
- ✅ Validações robustas
- ✅ Tratamento de erros consistente

### Melhores Práticas

1. **Sempre verificar autenticação** antes de fazer chamadas ao Firebase
2. **Usar useMemo/useCallback** para otimizar performance
3. **Gerar estados de loading** para melhor UX
4. **Validar dados** antes de fazer operações
5. **Tratar erros** adequadamente

---

**Documentação criada por:** Assistente IA  
**Data:** Janeiro 2026  
**Versão:** 1.0
