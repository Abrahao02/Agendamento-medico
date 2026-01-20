# 📚 Documentação Completa - Pages do Projeto

> **Versão:** 1.0  
> **Última atualização:** Janeiro 2026  
> **Total de Pages:** 12 páginas

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Páginas Públicas](#-páginas-públicas)
3. [Páginas de Autenticação](#-páginas-de-autenticação)
4. [Páginas do Dashboard](#-páginas-do-dashboard)
5. [Layout Pages](#-layout-pages)
6. [Guia de Uso](#-guia-de-uso)

---

## 🎯 Visão Geral

### Arquitetura

```
src/pages/
├── Públicas/
│   ├── LandingPage.jsx
│   ├── PublicSchedule.jsx
│   └── PublicScheduleSuccess.jsx
├── Autenticação/
│   ├── Login.jsx
│   └── Register.jsx
├── Dashboard/
│   ├── Dashboard.jsx
│   ├── Agenda.jsx
│   ├── Availability.jsx
│   ├── AllAppointments.jsx
│   ├── Patients.jsx
│   └── Settings.jsx
└── Layout/
    └── DashboardLayout.jsx
```

### Padrão de Estrutura

Todas as páginas seguem o padrão:
1. Importações
2. Hook customizado (se aplicável)
3. Handlers locais
4. Renderização condicional (loading/error)
5. JSX principal

---

## 🌐 Páginas Públicas

### `LandingPage`

**Arquivo:** `src/pages/LandingPage.jsx`  
**Rota:** `/`

Página inicial pública do sistema.

#### **Estrutura**

```javascript
import { useLandingPage } from "../hooks/common/useLandingPage";
import Header from "../components/layout/Header/Header";
import HeroSection from "../components/landing/HeroSection";
import ProblemSection from "../components/landing/ProblemSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import PricingSection from "../components/landing/PricingSection";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  const { user, loading, handleProClick, scrollToPlans } = useLandingPage();

  return (
    <div className="landing-page">
      <Header user={user} />
      <HeroSection onScrollToPlans={scrollToPlans} />
      <ProblemSection />
      <FeaturesSection />
      <PricingSection 
        user={user}
        loading={loading}
        onProClick={handleProClick}
        onNavigateToRegister={() => navigate("/register")}
      />
      <Footer />
    </div>
  );
}
```

#### **Componentes Utilizados**

- `Header`: Cabeçalho com navegação
- `HeroSection`: Seção hero principal
- `ProblemSection`: Seção de problemas/soluções
- `FeaturesSection`: Seção de funcionalidades
- `PricingSection`: Seção de planos/preços
- `Footer`: Rodapé

#### **Hooks Utilizados**

- `useLandingPage()`: Gerencia estado e handlers da página

#### **Funcionalidades**

- ✅ Exibe conteúdo público
- ✅ Detecta usuário autenticado
- ✅ ✨ NOVO: Busca plano do usuário no Firestore
- ✅ ✨ NOVO: Verifica se usuário já é PRO antes de checkout
- ✅ ✨ NOVO: Integra com Stripe Checkout para assinatura
- ✅ ✨ NOVO: Redireciona para settings se usuário já é PRO
- ✅ Scroll suave para seção de planos
- ✅ Links para registro/login

---

### `PublicSchedule`

**Arquivo:** `src/pages/PublicSchedule.jsx`  
**Rota:** `/public/:slug`

Página pública de agendamento por slug do médico.

#### **Estrutura**

```javascript
import { usePublicSchedule } from "../hooks/appointments/usePublicSchedule";
import DayCard from "../components/publicSchedule/DayCard";
import AppointmentForm from "../components/publicSchedule/AppointmentForm/AppointmentForm";
import PublicScheduleHeader from "../components/publicSchedule/PublicScheduleHeader/PublicScheduleHeader";
import IntroCard from "../components/publicSchedule/IntroCard/IntroCard";
import LimitReachedBanner from "../components/publicSchedule/LimitReachedBanner/LimitReachedBanner";
import EmptyState from "../components/publicSchedule/EmptyState/EmptyState";

export default function PublicSchedule() {
  const { slug } = useParams();
  const { doctor, availability, loading, error, limitReached, ... } = usePublicSchedule(slug);

  // ...
}
```

#### **Parâmetros de Rota**

- `slug` (string): Slug único do médico

#### **Componentes Utilizados**

- `PublicScheduleHeader`: Cabeçalho com dados do médico
- `IntroCard`: Card introdutório
- `LimitReachedBanner`: Banner de limite atingido
- `DayCard`: Card de dia com slots disponíveis
- `AppointmentForm`: Formulário de agendamento
- `EmptyState`: Estado vazio

#### **Hooks Utilizados**

- `usePublicSchedule(slug)`: Gerencia estado e handlers do agendamento público

#### **Funcionalidades**

- ✅ Busca médico por slug
- ✅ Exibe disponibilidade futura
- ✅ Filtra slots já agendados
- ✅ Permite seleção de dia e horário
- ✅ Formulário de agendamento
- ✅ Validação de dados
- ✅ Verifica limite de appointments
- ✅ Redireciona para página de sucesso após agendamento

#### **Estados**

- `loading`: Carregando dados
- `error`: Erro ao carregar
- `limitReached`: Limite de appointments atingido
- `selectedDay`: Dia selecionado
- `selectedSlot`: Slot selecionado
- `submitting`: Enviando formulário

---

### `PublicScheduleSuccess`

**Arquivo:** `src/pages/PublicScheduleSuccess.jsx`  
**Rota:** `/public/:slug/success`

Página de confirmação após agendamento bem-sucedido.

#### **Estrutura**

```javascript
import { useLocation, useNavigate } from "react-router-dom";

export default function PublicScheduleSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, date, time } = location.state || {};

  useEffect(() => {
    if (!name) {
      setTimeout(() => navigate("/", { replace: true }), 3000);
    }
  }, [name, navigate]);

  if (!name) return <div>Acesso inválido</div>;

  return (
    <div className="public-schedule-container">
      <h2>Agendamento Confirmado!</h2>
      <p>Olá <strong>{name}</strong>, seu horário foi agendado para <strong>{formatDate(date)}</strong> às <strong>{time}</strong>.</p>
    </div>
  );
}
```

#### **Dados Recebidos**

- `name` (string): Nome do paciente
- `date` (string): Data do agendamento
- `time` (string): Horário do agendamento

#### **Funcionalidades**

- ✅ Exibe confirmação do agendamento
- ✅ Redireciona se acessado diretamente (sem dados)
- ✅ Formata data para exibição

---

## 🔐 Páginas de Autenticação

### `Login`

**Arquivo:** `src/pages/Login.jsx`  
**Rota:** `/login`

Página de login de médicos.

#### **Estrutura**

```javascript
import { useLogin } from "../hooks/auth/useLogin";

export default function Login() {
  const {
    form,
    error,
    resetError,
    resetEmailSent,
    showPassword,
    handleChange,
    toggleShowPassword,
    handleLogin,
    handleForgotPassword
  } = useLogin();

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          {/* Campos do formulário */}
        </form>
      </div>
    </div>
  );
}
```

#### **Componentes Utilizados**

- Campos de formulário nativos
- Ícones do React Icons

#### **Hooks Utilizados**

- `useLogin()`: Gerencia estado e handlers do login

#### **Funcionalidades**

- ✅ Validação de email e senha
- ✅ Mostrar/ocultar senha
- ✅ Recuperação de senha
- ✅ Redirecionamento para dashboard após login
- ✅ Links para registro

#### **Estados**

- `form`: Dados do formulário (email, password)
- `error`: Erro de login
- `resetError`: Erro de recuperação de senha
- `resetEmailSent`: Email de recuperação enviado
- `showPassword`: Mostrar senha

---

### `Register`

**Arquivo:** `src/pages/Register.jsx`  
**Rota:** `/register`

Página de registro de novos médicos.

#### **Estrutura**

```javascript
import { useRegister } from "../hooks/auth/useRegister";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import PasswordInput from "../components/common/PasswordInput";
import PasswordChecklist from "../components/common/PasswordChecklist";

export default function Register() {
  const { form, errors, passwordCriteria, handleChange, handleSubmit } = useRegister();

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Cadastro de Médico</h2>
        <form onSubmit={handleSubmit}>
          {/* Campos do formulário */}
        </form>
      </div>
    </div>
  );
}
```

#### **Componentes Utilizados**

- `Input`: Campo de input reutilizável
- `Button`: Botão reutilizável
- `PasswordInput`: Campo de senha com validação
- `PasswordChecklist`: Lista de critérios de senha

#### **Hooks Utilizados**

- `useRegister()`: Gerencia estado e handlers do registro

#### **Funcionalidades**

- ✅ Validação de todos os campos
- ✅ Validação de força de senha
- ✅ Validação de confirmação de senha
- ✅ Formatação automática de WhatsApp
- ✅ Criação de usuário no Firebase
- ✅ Criação de documento do médico
- ✅ Redirecionamento para dashboard após registro
- ✅ Links para login

#### **Campos do Formulário**

- Nome completo (obrigatório)
- Email (obrigatório, válido)
- Senha (obrigatória, critérios)
- Confirmar senha (obrigatória, igual à senha)
- WhatsApp (obrigatório, formatado)

---

## 📊 Páginas do Dashboard

### `Dashboard` ✨ ATUALIZADO

**Arquivo:** `src/pages/Dashboard.jsx`  
**Rota:** `/dashboard`

Página principal do dashboard com duas visualizações: **Pacientes & Agenda** e **Financeiro**. Usa Strategy Pattern para alternar entre as views.

#### **Novas Funcionalidades**

1. **Visualização Pacientes & Agenda** (padrão)
   - Cards de estatísticas (Confirmados, Pendentes, Horários disponíveis, Agendamentos ocupados)
   - Indicadores do período (Novos pacientes, Taxa de faltas, Taxa de cancelamento)
   - Próximas consultas
   - Modais interativos para detalhamento

2. **Visualização Financeiro** ✨ NOVO
   - Bloco 1: Cards principais (Recebido, A receber, Em risco)
   - Bloco 2: Previsão financeira do período
   - Bloco 3: Linha do tempo financeira (gráfico de barras)
   - Bloco 4: Detalhamento por status

#### **Estrutura**

```javascript
import { useDashboard } from "../hooks/dashboard/useDashboard";
import PageHeader from "../components/common/PageHeader/PageHeader";
import PublicLinkCard from "../components/dashboard/PublicLinkCard";
import Filters from "../components/common/Filters/Filters";
import StatsCard from "../components/dashboard/StatsCard";
import StatusSummary from "../components/dashboard/StatusSummary";
import AppointmentsChart from "../components/dashboard/AppointmentsChart";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";

export default function Dashboard() {
  const { loading, stats, chartData, upcomingAppointments, ... } = useDashboard();

  if (loading) return <ContentLoading />;

  return (
    <div className="dashboard-content">
      <PageHeader />
      <PublicLinkCard />
      <Filters />
      <StatsCard />
      <StatusSummary />
      <AppointmentsChart />
      <UpcomingAppointments />
    </div>
  );
}
```

#### **Componentes Utilizados**

- `PageHeader`: Cabeçalho da página
- `PublicLinkCard`: Card com link público
- `Filters`: Filtros de data/mês/ano
- `StatsCard`: Cards de estatísticas
- `StatusSummary`: Resumo por status
- `AppointmentsChart`: Gráfico de appointments
- `UpcomingAppointments`: Próximos appointments

#### **Hooks Utilizados**

- `useDashboard()`: Gerencia estado e dados do dashboard

#### **Funcionalidades**

- ✅ Exibe estatísticas do período selecionado
- ✅ Filtros por data/mês/ano
- ✅ Gráficos de appointments
- ✅ Próximos appointments
- ✅ Links para outras páginas
- ✅ Comparação com período anterior

#### **Estatísticas Exibidas**

- Total de consultas
- Novos pacientes
- Horários disponíveis
- Taxa de conversão
- Faturamento previsto
- Ticket médio

---

### `Agenda`

**Arquivo:** `src/pages/Agenda.jsx`  
**Rota:** `/dashboard/appointments`

Página de agenda do dia com lista de appointments.

#### **Estrutura**

```javascript
import useAgenda from "../hooks/agenda/useAgenda";
import PageHeader from "../components/common/PageHeader/PageHeader";
import DateNavigation from "../components/agenda/DateNavigation";
import AppointmentList from "../components/agenda/AppointmentList";

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { appointments, statusUpdates, lockedAppointments, ... } = useAgenda(currentDate);

  return (
    <div className="calendar-availability-container">
      <PageHeader />
      <DateNavigation />
      <AppointmentList />
    </div>
  );
}
```

#### **Componentes Utilizados**

- `PageHeader`: Cabeçalho da página
- `DateNavigation`: Navegação de datas (anterior/próximo/hoje)
- `AppointmentList`: Lista de appointments do dia

#### **Hooks Utilizados**

- `useAgenda(currentDate)`: Gerencia estado e handlers da agenda

#### **Funcionalidades**

- ✅ Navegação entre dias
- ✅ Lista de appointments do dia
- ✅ Mudança de status de appointments
- ✅ Adição de pacientes
- ✅ Envio de mensagens WhatsApp
- ✅ Identificação de appointments bloqueados

#### **Navegação**

- Botão "Anterior": Dia anterior
- Botão "Hoje": Dia atual
- Botão "Próximo": Próximo dia

---

### `Availability`

**Arquivo:** `src/pages/Availability.jsx`  
**Rota:** `/dashboard/availability`

Página de gestão de disponibilidade mensal com calendário.

#### **Estrutura**

```javascript
import { useAvailability } from "../hooks/appointments/useAvailability";
import PageHeader from "../components/common/PageHeader/PageHeader";
import CalendarWrapper from "../components/availability/CalendarWrapper/CalendarWrapper";
import DayManagement from "../components/availability/DayManagement/DayManagement";

export default function Availability() {
  const {
    loading,
    selectedDate,
    handleSelectDate,
    handleAddSlot,
    handleRemoveSlot,
    handleBookAppointment,
    getAvailabilityForDate,
    getAllSlotsForDate,
    getAppointmentsForDate,
    getCalendarTileData,
  } = useAvailability();

  if (loading) return <ContentLoading />;

  return (
    <div className="availability-page">
      <PageHeader />
      <CalendarWrapper />
      {selectedDate && <DayManagement />}
    </div>
  );
}
```

#### **Componentes Utilizados**

- `PageHeader`: Cabeçalho da página
- `CalendarWrapper`: Calendário com badges
- `DayManagement`: Gerenciamento de dia selecionado

#### **Hooks Utilizados**

- `useAvailability()`: Gerencia estado e handlers da disponibilidade

#### **Funcionalidades**

- ✅ Calendário mensal com badges
- ✅ Seleção de data
- ✅ Adição/remoção de slots
- ✅ Criação de appointments
- ✅ Exclusão de appointments
- ✅ Marcação como cancelado
- ✅ Visualização de slots ocupados vs livres

#### **Badges no Calendário**

- Badge verde: Slots livres
- Badge vermelho: Slots ocupados

---

### `AllAppointments`

**Arquivo:** `src/pages/AllAppointments.jsx`  
**Rota:** `/dashboard/allappointments`

Página com todos os appointments agrupados por paciente.

#### **Estrutura**

```javascript
import useAllAppointments from "../hooks/agenda/useAllAppointments";
import Filters from "../components/common/Filters/Filters";
import PatientsList from "../components/allAppointments/PatientsList";
import SaveChangesBar from "../components/allAppointments/SaveChangesBar";

export default function AllAppointments() {
  const {
    patientsData,
    loadingData,
    statusFilter,
    searchTerm,
    changedIds,
    saving,
    handleStatusChange,
    handleSave,
    lockedAppointments,
  } = useAllAppointments(user);

  if (loadingData) return <LoadingFallback />;

  return (
    <div className="appointments-page">
      <header className="page-header">
        <h2>Todos os Agendamentos</h2>
      </header>
      <Filters />
      <PatientsList />
      <SaveChangesBar />
    </div>
  );
}
```

#### **Componentes Utilizados**

- `Filters`: Filtros avançados (busca, status, data)
- `PatientsList`: Lista de pacientes com appointments
- `SaveChangesBar`: Barra de salvamento de mudanças

#### **Hooks Utilizados**

- `useAllAppointments(user)`: Gerencia estado e handlers de todos os appointments

#### **Funcionalidades**

- ✅ Lista todos os appointments agrupados por paciente
- ✅ Filtros avançados (busca, status, data)
- ✅ Mudança de status em lote
- ✅ Expansão/colapso de pacientes
- ✅ Salvamento de mudanças
- ✅ Identificação de appointments bloqueados
- ✅ Estatísticas agregadas

#### **Filtros Disponíveis**

- Busca por nome ou telefone
- Filtro por status
- Filtro por período (data inicial/final)
- Filtro por mês/ano

---

### `Patients`

**Arquivo:** `src/pages/Patients.jsx`  
**Rota:** `/dashboard/clients`

Página de gestão de pacientes.

#### **Estrutura**

```javascript
import { usePatients } from "../hooks/patients/usePatients";

export default function Patients() {
  const {
    loading,
    newPatient,
    patientsList,
    patientsCount,
    updateNewPatientField,
    handleWhatsappChange,
    addPatient,
    savePatient,
    enableEditPatient,
    editingPatients,
  } = usePatients(user);

  if (loading) return <div>Carregando pacientes...</div>;

  return (
    <div className="patients-container">
      <h2>Clientes</h2>
      <div className="add-patient-form">
        {/* Formulário de adição */}
      </div>
      <table className="patients-table">
        {/* Lista de pacientes */}
      </table>
    </div>
  );
}
```

#### **Componentes Utilizados**

- Tabela HTML nativa
- Formulário HTML nativo

#### **Hooks Utilizados**

- `usePatients(user)`: Gerencia estado e handlers de pacientes

#### **Funcionalidades**

- ✅ Adição de novos pacientes
- ✅ Listagem de pacientes
- ✅ Edição de pacientes (nome, nome de referência, preço)
- ✅ Validação de duplicatas (WhatsApp)
- ✅ Formatação automática de WhatsApp
- ✅ Estatísticas por paciente (total de consultas)

#### **Campos do Paciente**

- Nome completo
- Nome de referência
- WhatsApp
- Valor da consulta
- Total de consultas (read-only)

---

### `Settings`

**Arquivo:** `src/pages/Settings.jsx`  
**Rota:** `/dashboard/settings`

Página de configurações do médico com estrutura modular e seções colapsáveis.

#### **Estrutura**

```javascript
import { useSettings } from "../hooks/settings/useSettings";
import PlanSection from "../components/settings/PlanSection/PlanSection";
import WhatsAppSection from "../components/settings/WhatsAppSection/WhatsAppSection";
import PublicScheduleSection from "../components/settings/PublicScheduleSection/PublicScheduleSection";
import AppointmentTypeSection from "../components/settings/AppointmentTypeSection/AppointmentTypeSection";
import Button from "../components/common/Button";
import ContentLoading from "../components/common/ContentLoading/ContentLoading";

export default function Settings() {
  const user = auth.currentUser;
  const {
    loading,
    saving,
    doctor,
    isPro,
    whatsappConfig,
    publicScheduleConfig,
    appointmentTypeConfig,
    subscriptionEndDate,
    newLocationName,
    newLocationValue,
    cancelLoading,
    cancelError,
    reactivateLoading,
    reactivateError,
    updateWhatsappField,
    updatePublicScheduleField,
    updateAppointmentTypeField,
    setNewLocationName,
    setNewLocationValue,
    handleAddLocation,
    updateLocation,
    removeLocation,
    handleCancelSubscription,
    handleReactivateSubscription,
    saveSettings,
    generatePreview,
  } = useSettings(user);

  if (loading) {
    return <ContentLoading message="Carregando configurações..." />;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Configurações</h1>
        <p className="settings-subtitle">Gerencie suas preferências e plano</p>
      </div>

      <PlanSection
        isPro={isPro}
        doctor={doctor}
        subscriptionEndDate={subscriptionEndDate}
        onCancel={handleCancelSubscription}
        onReactivate={handleReactivateSubscription}
        cancelLoading={cancelLoading}
        reactivateLoading={reactivateLoading}
        cancelError={cancelError}
        reactivateError={reactivateError}
      />

      <PublicScheduleSection
        publicScheduleConfig={publicScheduleConfig}
        onUpdateField={updatePublicScheduleField}
      />

      <AppointmentTypeSection
        appointmentTypeConfig={appointmentTypeConfig}
        onUpdateField={updateAppointmentTypeField}
        onAddLocation={handleAddLocation}
        onUpdateLocation={updateLocation}
        onRemoveLocation={removeLocation}
        newLocationName={newLocationName}
        newLocationValue={newLocationValue}
        onNewLocationNameChange={setNewLocationName}
        onNewLocationValueChange={setNewLocationValue}
      />

      <WhatsAppSection
        whatsappConfig={whatsappConfig}
        onUpdateField={updateWhatsappField}
        preview={generatePreview()}
      />

      <div className="settings-footer">
        <Button onClick={handleSave} disabled={saving} loading={saving}>
          {saving ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </div>
  );
}
```

#### **Componentes Utilizados**

- ✨ NOVO: `PlanSection` - Gerenciamento de plano e assinatura (upgrade, cancelamento, reativação)
- ✨ NOVO: `WhatsAppSection` - Configuração de mensagens WhatsApp (colapsável)
- ✨ NOVO: `PublicScheduleSection` - Configuração de período de exibição do agendamento público (colapsável)
- ✨ NOVO: `AppointmentTypeSection` - Configuração de tipos de atendimento e locais (colapsável)
- `Button` - Botão de salvar
- `ContentLoading` - Loading state

#### **Hooks Utilizados**

- `useSettings(user)`: Gerencia estado e handlers de configurações (inclui integração Stripe)

#### **Funcionalidades**

- ✅ ✨ NOVO: Gerenciamento de assinatura Stripe (upgrade, cancelamento, reativação)
- ✅ ✨ NOVO: Exibição de data de término da assinatura
- ✅ ✨ NOVO: Configuração de período de exibição do agendamento público
- ✅ ✨ NOVO: Configuração de tipos de atendimento (online/presencial)
- ✅ ✨ NOVO: Gerenciamento de múltiplos locais de atendimento presencial
- ✅ ✨ NOVO: Seções colapsáveis com animações
- ✅ Configuração de mensagem WhatsApp (intro, body, footer)
- ✅ Opção de incluir/ocultar valor na mensagem
- ✅ Preview da mensagem em tempo real
- ✅ Salvamento de configurações

#### **Configurações**

- ✨ NOVO: **Plano e Assinatura:**
  - Upgrade para PRO (Stripe Checkout)
  - Cancelamento de assinatura
  - Reativação de assinatura
  - Data de término da assinatura

- ✨ NOVO: **Agendamento Público:**
  - Período de exibição (todas as datas futuras, semana atual, mês atual, próximos 7 dias, etc.)

- ✨ NOVO: **Tipo de Atendimento:**
  - Modo: Desabilitado, Fixo, Permitir escolha
  - Tipo fixo: Online ou Presencial
  - Valores padrão para Online e Presencial
  - Locais de atendimento presencial (nome e valor)

- **Mensagem WhatsApp:**
  - Início da mensagem (intro)
  - Texto principal (body)
  - Texto final (footer)
  - Incluir valor da consulta (checkbox)

---

## 🎨 Layout Pages

### `DashboardLayout`

**Arquivo:** `src/pages/DashboardLayout.jsx`  
**Rota:** `/dashboard/*` (layout)

Layout principal do dashboard com sidebar e outlet.

#### **Estrutura**

```javascript
import { useDashboardLayout } from "../hooks/common/useDashboardLayout";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      {!isDesktop && (
        <>
          <button onClick={toggleSidebar}>Menu</button>
          <div className="sidebar-overlay" onClick={closeSidebar} />
        </>
      )}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
```

#### **Componentes Utilizados**

- `Sidebar`: Barra lateral de navegação
- `Outlet`: Renderiza páginas filhas (React Router)

#### **Hooks Utilizados**

- `useDashboardLayout()`: Gerencia estado e handlers do layout

#### **Funcionalidades**

- ✅ Sidebar responsiva (desktop/mobile)
- ✅ Menu de navegação
- ✅ Dados do médico e plano
- ✅ Logout
- ✅ Renderização de páginas filhas
- ✅ Overlay no mobile

#### **Itens do Menu**

- Home (`/dashboard`)
- Agenda do dia (`/dashboard/appointments`)
- Agenda do mês (`/dashboard/availability`)
- Todos agendamentos (`/dashboard/allappointments`)
- Clientes (`/dashboard/clients`)
- Configurações (`/dashboard/settings`)

---

## 📖 Guia de Uso

### Rotas e Navegação

```javascript
// Públicas
/ → LandingPage
/public/:slug → PublicSchedule
/public/:slug/success → PublicScheduleSuccess

// Autenticação
/login → Login
/register → Register

// Dashboard (privadas)
/dashboard → Dashboard
/dashboard/appointments → Agenda
/dashboard/availability → Availability
/dashboard/allappointments → AllAppointments
/dashboard/clients → Patients
/dashboard/settings → Settings
```

### Padrão de Desenvolvimento

1. **Criar hook customizado** (se necessário)
2. **Importar componentes** reutilizáveis
3. **Usar hook** na página
4. **Renderizar componentes** com dados do hook
5. **Tratar estados** de loading/error

### Exemplo de Nova Página

```javascript
import { useState } from "react";
import { useCustomHook } from "../hooks/custom/useCustomHook";
import PageHeader from "../components/common/PageHeader/PageHeader";
import ContentLoading from "../components/common/ContentLoading/ContentLoading";

export default function NewPage() {
  const { loading, data, handlers } = useCustomHook();

  if (loading) return <ContentLoading message="Carregando..." />;

  return (
    <div className="new-page">
      <PageHeader
        label="Label"
        title="Título"
        description="Descrição"
      />
      {/* Conteúdo da página */}
    </div>
  );
}
```

---

## 🎓 Conclusão

### Pontos Fortes

- ✅ Páginas bem organizadas e estruturadas
- ✅ Separação clara de responsabilidades
- ✅ Uso consistente de hooks customizados
- ✅ Componentes reutilizáveis
- ✅ Tratamento de estados de loading/error
- ✅ Navegação clara e intuitiva

### Melhores Práticas

1. **Sempre usar hooks customizados** para lógica de negócio
2. **Usar componentes reutilizáveis** quando possível
3. **Tratar estados de loading** para melhor UX
4. **Tratar erros** adequadamente
5. **Manter páginas simples** e focadas

---

**Documentação criada por:** Assistente IA  
**Data:** Janeiro 2026  
**Versão:** 1.0
