# 📚 Documentação Completa - Components do Projeto

> **Versão:** 1.1  
> **Última atualização:** Janeiro 2026  
> **Total de Componentes:** ~55 componentes

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Common Components](#-common-components)
3. [Dashboard Components](#-dashboard-components)
4. [Layout Components](#-layout-components)
5. [Agenda Components](#-agenda-components)
6. [Availability Components](#-availability-components)
7. [Landing Components](#-landing-components)
8. [Public Schedule Components](#-public-schedule-components)
9. [Stripe Components](#-stripe-components) ✨ NOVO
10. [Settings Components](#-settings-components) ✨ NOVO
11. [Guia de Uso](#-guia-de-uso)

---

## 🎯 Visão Geral

### Arquitetura

```
src/components/
├── common/              # Componentes reutilizáveis
│   ├── Badge/
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── PageHeader/
│   ├── Filters/
│   ├── ContentLoading/
│   ├── LoadingFallback/
│   ├── PasswordInput/
│   └── PasswordChecklist/
├── dashboard/           # Componentes do dashboard
│   ├── StatsCard/
│   ├── StatusSummary/
│   ├── AppointmentsChart/
│   ├── UpcomingAppointments/
│   ├── PublicLinkCard/
│   ├── DetailsSummary/
│   ├── FinancialChart/
│   └── MonthlyComparison/
├── layout/              # Componentes de layout
│   ├── Header/
│   └── Sidebar/
├── agenda/              # Componentes de agenda
│   ├── DateNavigation/
│   ├── AppointmentList/
│   └── AppointmentItem/
├── availability/        # Componentes de disponibilidade
│   ├── CalendarWrapper/
│   ├── DayManagement/
│   ├── DayStats/
│   └── SlotItem/
├── landing/             # Componentes da landing page
│   ├── HeroSection/
│   ├── ProblemSection/
│   ├── FeaturesSection/
│   ├── PricingSection/
│   └── Footer/
└── publicSchedule/      # Componentes de agendamento público
    ├── AppointmentForm/
    ├── DayCard/
    ├── PublicScheduleHeader/
    └── IntroCard/
```

### Padrão de Estrutura

Todos os componentes seguem o padrão:
1. Props bem definidas com JSDoc
2. Classes CSS modulares
3. Exportação default
4. Suporte a className customizada

---

## 🎨 Common Components

### `Badge`

**Arquivo:** `src/components/common/Badge/Badge.jsx`

Componente de badge reutilizável para indicadores e tags.

#### **Uso**

```javascript
import Badge, { StatusBadge, BadgeGroup } from "@/components/common/Badge";

// Badge simples
<Badge variant="success">Confirmado</Badge>

// Badge com ícone
<Badge variant="warning" icon={<AlertIcon />}>Atenção</Badge>

// Badge removível
<Badge variant="info" onRemove={() => {/* handle remove */}}>
  Tag
</Badge>

// Status Badge
<StatusBadge status="confirmado" />

// Badge Group
<BadgeGroup>
  <Badge variant="primary">Tag 1</Badge>
  <Badge variant="secondary">Tag 2</Badge>
</BadgeGroup>
```

#### **Props**

```typescript
{
  children?: React.ReactNode,          // Conteúdo do badge
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'gray',
  size?: 'sm' | 'md' | 'lg',
  pill?: boolean,                      // Bordas arredondadas
  outline?: boolean,                   // Contorno
  icon?: React.ReactNode,              // Ícone
  dot?: boolean,                       // Apenas ponto
  onRemove?: () => void,               // Função de remoção
  className?: string
}
```

#### **Variantes**

- `primary`: Azul (padrão)
- `secondary`: Cinza
- `success`: Verde
- `warning`: Amarelo
- `danger`: Vermelho
- `info`: Ciano
- `gray`: Cinza claro

---

### `Button`

**Arquivo:** `src/components/common/Button/Button.jsx`

Componente de botão reutilizável.

#### **Uso**

```javascript
import Button from "@/components/common/Button";

// Botão primário
<Button variant="primary" onClick={handleClick}>
  Salvar
</Button>

// Botão com ícone
<Button 
  variant="success" 
  leftIcon={<SaveIcon />}
  rightIcon={<ArrowIcon />}
>
  Salvar e Continuar
</Button>

// Botão loading
<Button variant="primary" loading={isSaving}>
  Salvar
</Button>

// Botão desabilitado
<Button variant="secondary" disabled>
  Cancelar
</Button>
```

#### **Props**

```typescript
{
  children: React.ReactNode,
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost',
  size?: 'sm' | 'md' | 'lg',
  fullWidth?: boolean,
  disabled?: boolean,
  loading?: boolean,
  leftIcon?: React.ReactNode,
  rightIcon?: React.ReactNode,
  onClick?: () => void,
  type?: 'button' | 'submit' | 'reset',
  className?: string
}
```

---

### `Card`

**Arquivo:** `src/components/common/Card/Card.jsx`

Componente de card reutilizável.

#### **Uso**

```javascript
import Card, { CardSection } from "@/components/common/Card";

// Card simples
<Card title="Título">
  <p>Conteúdo do card</p>
</Card>

// Card com header customizado
<Card header={<CustomHeader />}>
  <p>Conteúdo</p>
</Card>

// Card clicável
<Card 
  clickable 
  hoverable
  onClick={() => {/* handle click */}}
>
  <p>Card clicável</p>
</Card>

// Card Section
<Card>
  <CardSection>
    Seção 1
  </CardSection>
  <CardSection>
    Seção 2
  </CardSection>
</Card>
```

#### **Props**

```typescript
{
  children: React.ReactNode,
  title?: string,
  header?: React.ReactNode,
  footer?: React.ReactNode,
  hoverable?: boolean,
  clickable?: boolean,
  onClick?: () => void,
  className?: string,
  padding?: 'sm' | 'md' | 'lg',
  noPadding?: boolean
}
```

---

### `Input`

**Arquivo:** `src/components/common/Input/Input.jsx`

Componente de input reutilizável.

#### **Uso**

```javascript
import Input from "@/components/common/Input";

// Input simples
<Input
  label="Nome"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Digite seu nome"
/>

// Input com ícone
<Input
  label="Email"
  type="email"
  leftIcon={<EmailIcon />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Input com erro
<Input
  label="Senha"
  type="password"
  value={password}
  error="Senha muito curta"
  onChange={(e) => setPassword(e.target.value)}
/>

// Input com helper
<Input
  label="Telefone"
  helper="Digite o DDD + número"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>
```

#### **Props**

```typescript
{
  label?: string,
  error?: string,
  helper?: string,
  leftIcon?: React.ReactNode,
  rightIcon?: React.ReactNode,
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time',
  size?: 'sm' | 'md' | 'lg',
  fullWidth?: boolean,
  disabled?: boolean,
  required?: boolean,
  placeholder?: string,
  className?: string,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
```

---

### `PageHeader`

**Arquivo:** `src/components/common/PageHeader/PageHeader.jsx`

Componente de cabeçalho de página padronizado.

#### **Uso**

```javascript
import PageHeader from "@/components/common/PageHeader/PageHeader";

<PageHeader
  label="Visão Geral"
  title="Painel de Controle"
  description="Acompanhe consultas, faturamento e disponibilidade em tempo real"
/>
```

#### **Props**

```typescript
{
  label?: string,        // Label pequeno (opcional)
  title?: string,        // Título principal
  description?: string   // Descrição (opcional)
}
```

---

### `Filters`

**Arquivo:** `src/components/common/Filters/Filters.jsx`

Componente de filtros avançados reutilizável.

#### **Uso**

```javascript
import Filters from "@/components/common/Filters/Filters";

<Filters
  // Busca
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Buscar por nome ou telefone..."
  showSearch={true}
  
  // Status
  statusFilter={statusFilter}
  onStatusChange={setStatusFilter}
  statusOptions={statusOptions}
  showStatus={true}
  
  // Datas
  dateFrom={startDate}
  dateTo={endDate}
  onDateFromChange={setStartDate}
  onDateToChange={setEndDate}
  showDateRange={true}
  
  // Mês/Ano
  month={selectedMonth}
  year={selectedYear}
  onMonthChange={setSelectedMonth}
  onYearChange={setSelectedYear}
  availableYears={availableYears}
  showMonthYear={true}
  
  // Reset
  onReset={resetFilters}
  
  // Ações extras
  extraActions={<CustomActions />}
/>
```

#### **Props**

```typescript
{
  // Busca
  searchTerm?: string,
  onSearchChange?: (value: string) => void,
  searchPlaceholder?: string,
  showSearch?: boolean,
  
  // Status
  statusFilter?: string,
  onStatusChange?: (value: string) => void,
  statusOptions?: Array<{ value: string, label: string }>,
  showStatus?: boolean,
  
  // Datas
  dateFrom?: string,
  dateTo?: string,
  onDateFromChange?: (value: string) => void,
  onDateToChange?: (value: string) => void,
  showDateRange?: boolean,
  
  // Mês/Ano
  month?: number,
  year?: number,
  onMonthChange?: (value: number) => void,
  onYearChange?: (value: number) => void,
  availableYears?: number[],
  showMonthYear?: boolean,
  
  // Reset
  onReset?: () => void,
  
  // Extras
  extraActions?: React.ReactNode
}
```

---

### `ContentLoading`

**Arquivo:** `src/components/common/ContentLoading/ContentLoading.jsx`

Componente de loading para conteúdo (não tela cheia).

#### **Uso**

```javascript
import ContentLoading from "@/components/common/ContentLoading/ContentLoading";

<ContentLoading 
  message="Carregando dados..." 
  height={400}
  size="md"
/>
```

#### **Props**

```typescript
{
  message?: string,      // Mensagem (padrão: "Carregando...")
  height?: number,       // Altura em px (padrão: 200)
  inline?: boolean,      // Display inline-flex
  size?: 'sm' | 'md' | 'lg'  // Tamanho do spinner
}
```

---

### `LoadingFallback`

**Arquivo:** `src/components/common/LoadingFallback/LoadingFallback.jsx`

Componente de loading para lazy loading (tela cheia).

#### **Uso**

```javascript
import LoadingFallback from "@/components/common/LoadingFallback/LoadingFallback";

// No React Router Suspense
<Suspense fallback={<LoadingFallback />}>
  <LazyComponent />
</Suspense>
```

#### **Props**

Nenhuma prop (componente fixo).

---

### `PasswordInput`

**Arquivo:** `src/components/common/PasswordInput/PasswordInput.jsx`

Componente de input de senha com toggle de visibilidade.

#### **Uso**

```javascript
import PasswordInput from "@/components/common/PasswordInput";

<PasswordInput
  label="Senha"
  value={password}
  error={errors.password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

#### **Props**

Similar ao `Input`, mas com comportamento específico para senha.

---

### `PasswordChecklist`

**Arquivo:** `src/components/common/PasswordChecklist/PasswordChecklist.jsx`

Componente de checklist de critérios de senha.

#### **Uso**

```javascript
import PasswordChecklist from "@/components/common/PasswordChecklist";

<PasswordChecklist 
  criteria={passwordCriteria}
/>
```

#### **Props**

```typescript
{
  criteria: {
    length: boolean,
    uppercase: boolean,
    lowercase: boolean,
    number: boolean,
    symbol: boolean
  }
}
```

---

## 📊 Dashboard Components

### `StatsCard`

**Arquivo:** `src/components/dashboard/StatsCard/StatsCard.jsx`

Card de estatística com ícone, valor e comparação.

#### **Uso**

```javascript
import StatsCard from "@/components/dashboard/StatsCard/StatsCard";
import { Calendar } from "lucide-react";

<StatsCard
  icon={Calendar}
  value={stats.totalAppointments}
  title="Total de consultas"
  subtitle="No período selecionado"
  color="green"
  onClick={() => navigate("/dashboard/allappointments")}
  comparison={{
    value: 25,
    trend: "up"
  }}
/>
```

#### **Props**

```typescript
{
  icon: React.ComponentType,
  value: string | number,
  title: string,
  subtitle?: string,
  color?: 'green' | 'blue' | 'purple' | 'amber' | 'red',
  onClick?: () => void,
  loading?: boolean,
  comparison?: {
    value: number,
    trend: 'up' | 'down' | 'neutral'
  },
  className?: string
}
```

---

### `StatusSummary`

**Arquivo:** `src/components/dashboard/StatusSummary/StatusSummary.jsx`

Resumo de appointments por status.

#### **Uso**

```javascript
import StatusSummary from "@/components/dashboard/StatusSummary/StatusSummary";

<StatusSummary
  confirmed={statusSummary.confirmed}
  pending={statusSummary.pending}
  cancelled={statusSummary.cancelled}
  percentages={statusSummary.percentages}
/>
```

#### **Props**

```typescript
{
  confirmed: number,
  pending: number,
  cancelled: number,
  percentages: {
    confirmed: number,
    pending: number,
    cancelled: number
  }
}
```

---

### `AppointmentsChart`

**Arquivo:** `src/components/dashboard/AppointmentsChart/AppointmentsChart.jsx`

Gráfico de appointments ao longo do tempo.

#### **Uso**

```javascript
import AppointmentsChart from "@/components/dashboard/AppointmentsChart/AppointmentsChart";

<AppointmentsChart data={chartData} />
```

#### **Props**

```typescript
{
  data: Array<{
    date: string,
    confirmed: number,
    pending: number,
    cancelled: number
  }>
}
```

---

### `UpcomingAppointments`

**Arquivo:** `src/components/dashboard/UpcomingAppointments/UpcomingAppointments.jsx`

Lista de próximos appointments.

#### **Uso**

```javascript
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments/UpcomingAppointments";

<UpcomingAppointments appointments={upcomingAppointments} />
```

#### **Props**

```typescript
{
  appointments: Array<Appointment>
}
```

---

### `PublicLinkCard`

**Arquivo:** `src/components/dashboard/PublicLinkCard/PublicLinkCard.jsx`

Card com link público para agendamento.

#### **Uso**

```javascript
import PublicLinkCard from "@/components/dashboard/PublicLinkCard/PublicLinkCard";

<PublicLinkCard slug={doctorSlug} />
```

#### **Props**

```typescript
{
  slug: string
}
```

---

### `DetailsSummary`

**Arquivo:** `src/components/dashboard/DetailsSummary/DetailsSummary.jsx`

Componente para mostrar métricas detalhadas com barras de progresso.

#### **Uso**

```javascript
import DetailsSummary from "@/components/dashboard/DetailsSummary/DetailsSummary";

<DetailsSummary
  newPatients={10}
  newPatientsTotal={50}
  messagesSent={25}
  messagesSentTotal={50}
  noShow={5}
  noShowTotal={50}
  cancelled={10}
  cancelledTotal={50}
/>
```

#### **Props**

```typescript
{
  newPatients?: number,
  newPatientsTotal?: number,
  messagesSent?: number,
  messagesSentTotal?: number,
  noShow?: number,
  noShowTotal?: number,
  cancelled?: number,
  cancelledTotal?: number
}
```

**Comportamento:**
- Exibe métricas com barras de progresso
- Calcula percentuais automaticamente
- Cores diferentes para cada métrica (blue, orange, red, gray)

---

### `FinancialChart`

**Arquivo:** `src/components/dashboard/FinancialChart/FinancialChart.jsx`

Gráfico de linha mostrando evolução financeira ao longo do tempo.

#### **Uso**

```javascript
import FinancialChart from "@/components/dashboard/FinancialChart/FinancialChart";

<FinancialChart data={financialChartData} />
```

#### **Props**

```typescript
{
  data: Array<{
    date: string,
    revenue: number
  }>
}
```

**Comportamento:**
- Gráfico de linha usando Recharts
- Formata valores em R$
- Exibe estado vazio quando não há dados

---

### `MonthlyComparison`

**Arquivo:** `src/components/dashboard/MonthlyComparison/MonthlyComparison.jsx`

Comparativo mensal financeiro em formato de lista.

#### **Uso**

```javascript
import MonthlyComparison from "@/components/dashboard/MonthlyComparison/MonthlyComparison";

<MonthlyComparison data={monthlyData} />
```

#### **Props**

```typescript
{
  data: Array<{
    key: string,
    name: string,
    revenue: number,
    trend?: 'up' | 'down'
  }>
}
```

**Comportamento:**
- Lista de meses com valores de receita
- Indicadores de tendência (↑ ou ↓)
- Exibe estado vazio quando não há dados

---

## 🎨 Layout Components

### `Header`

**Arquivo:** `src/components/layout/Header/Header.jsx`

Cabeçalho da landing page.

#### **Uso**

```javascript
import Header from "@/components/layout/Header/Header";

<Header user={user} />
```

#### **Props**

```typescript
{
  user?: User | null
}
```

---

### `Sidebar`

**Arquivo:** `src/components/layout/Sidebar/Sidebar.jsx`

Barra lateral de navegação do dashboard.

#### **Uso**

```javascript
import Sidebar from "@/components/layout/Sidebar/Sidebar";

<Sidebar
  sidebarOpen={sidebarOpen}
  toggleSidebar={toggleSidebar}
  closeSidebar={closeSidebar}
  isDesktop={isDesktop}
  doctorName={doctorName}
  plan={plan}
  appointmentsThisMonth={appointmentsThisMonth}
  isLimitReached={isLimitReached}
  handleLogout={handleLogout}
  menuItems={MENU_ITEMS}
/>
```

#### **Props**

```typescript
{
  sidebarOpen: boolean,
  toggleSidebar: () => void,
  closeSidebar: () => void,
  isDesktop: boolean,
  doctorName: string,
  plan: string,
  appointmentsThisMonth: number,
  isLimitReached: boolean,
  handleLogout: () => void,
  menuItems: Array<{
    to: string,
    icon: React.ComponentType,
    text: string,
    end?: boolean
  }>
}
```

---

## 📅 Agenda Components

### `DateNavigation`

**Arquivo:** `src/components/agenda/DateNavigation/DateNavigation.jsx`

Navegação de datas (anterior/hoje/próximo).

#### **Uso**

```javascript
import DateNavigation from "@/components/agenda/DateNavigation/DateNavigation";

<DateNavigation
  currentDate={currentDate}
  onPrev={goToPrev}
  onNext={goToNext}
  onToday={goToToday}
  formatDate={formatDate}
/>
```

#### **Props**

```typescript
{
  currentDate: Date,
  onPrev: () => void,
  onNext: () => void,
  onToday: () => void,
  formatDate: (date: Date | string) => string
}
```

---

### `AppointmentList`

**Arquivo:** `src/components/agenda/AppointmentList/AppointmentList.jsx`

Lista de appointments do dia.

#### **Uso**

```javascript
import AppointmentList from "@/components/agenda/AppointmentList/AppointmentList";

<AppointmentList
  appointments={appointments}
  statusUpdates={statusUpdates}
  referenceNames={referenceNames}
  patientStatus={patientStatus}
  lockedAppointments={lockedAppointments}
  onStatusChange={handleStatusChange}
  onAddPatient={handleAddPatient}
  onSendWhatsapp={handleSendWhatsapp}
/>
```

#### **Props**

```typescript
{
  appointments: Array<Appointment>,
  statusUpdates: { [id: string]: string },
  referenceNames: { [id: string]: string },
  patientStatus: { [id: string]: string },
  lockedAppointments: Set<string>,
  onStatusChange: (id: string, status: string) => void,
  onAddPatient: (data: PatientData) => void,
  onSendWhatsapp: (id: string) => void
}
```

---

### `AppointmentItem`

**Arquivo:** `src/components/agenda/AppointmentItem/AppointmentItem.jsx`

Item individual de appointment.

#### **Uso**

```javascript
import AppointmentItem from "@/components/agenda/AppointmentItem/AppointmentItem";

<AppointmentItem
  appointment={appointment}
  status={statusUpdates[appointment.id]}
  isLocked={lockedAppointments.has(appointment.id)}
  onStatusChange={(status) => handleStatusChange(appointment.id, status)}
/>
```

---

## 📆 Availability Components

### `CalendarWrapper`

**Arquivo:** `src/components/availability/CalendarWrapper/CalendarWrapper.jsx`

Wrapper do calendário mensal.

#### **Uso**

```javascript
import CalendarWrapper from "@/components/availability/CalendarWrapper/CalendarWrapper";

<CalendarWrapper
  value={calendarValue}
  onSelectDate={handleSelectDate}
  tileContent={tileContent}
/>
```

#### **Props**

```typescript
{
  value: Date,
  onSelectDate: (date: Date) => void,
  tileContent?: (props: any) => React.ReactNode
}
```

---

### `DayManagement`

**Arquivo:** `src/components/availability/DayManagement/DayManagement.jsx`

Gerenciamento de dia selecionado (slots e appointments).

#### **Uso**

```javascript
import DayManagement from "@/components/availability/DayManagement/DayManagement";

<DayManagement
  date={selectedDate}
  formattedDate={formatDate(selectedDate)}
  availableSlots={getAvailabilityForDate(selectedDate)}
  allSlots={getAllSlotsForDate(selectedDate)}
  appointments={getAppointmentsForDate(selectedDate)}
  patients={patients}
  onAddSlot={handleAddSlot}
  onRemoveSlot={handleRemoveSlot}
  onBookAppointment={handleBookAppointment}
  onDeleteAppointment={deleteAppointment}
  onMarkAsCancelled={markAsCancelled}
/>
```

---

## 🌐 Landing Components

### `HeroSection`

**Arquivo:** `src/components/landing/HeroSection.jsx`

Seção hero da landing page.

#### **Uso**

```javascript
import HeroSection from "@/components/landing/HeroSection";

<HeroSection onScrollToPlans={scrollToPlans} />
```

---

### `ProblemSection`

**Arquivo:** `src/components/landing/ProblemSection.jsx`

Seção de problemas/soluções.

#### **Uso**

```javascript
import ProblemSection from "@/components/landing/ProblemSection";

<ProblemSection />
```

---

### `FeaturesSection`

**Arquivo:** `src/components/landing/FeaturesSection.jsx`

Seção de funcionalidades.

#### **Uso**

```javascript
import FeaturesSection from "@/components/landing/FeaturesSection";

<FeaturesSection />
```

---

### `PricingSection`

**Arquivo:** `src/components/landing/PricingSection.jsx`

Seção de planos/preços.

#### **Uso**

```javascript
import PricingSection from "@/components/landing/PricingSection";

<PricingSection 
  user={user}
  loading={loading}
  onProClick={handleProClick}
  onNavigateToRegister={() => navigate("/register")}
/>
```

---

### `Footer`

**Arquivo:** `src/components/landing/Footer.jsx`

Rodapé da landing page.

#### **Uso**

```javascript
import Footer from "@/components/landing/Footer";

<Footer />
```

---

## 💳 Stripe Components ✨ NOVO

### `StripeCheckoutButton`

**Arquivo:** `src/components/stripe/StripeCheckoutButton.jsx`

Botão reutilizável para iniciar checkout do Stripe.

#### **Props**

```typescript
interface StripeCheckoutButtonProps {
  children?: React.ReactNode;        // Texto do botão (default: "Assinar PRO")
  variant?: 'primary' | 'secondary'; // Variante do botão (default: 'primary')
  className?: string;                // Classes CSS adicionais
  showPaymentInfo?: boolean;         // Mostrar "Cartão de crédito ou Pix" (default: true)
  showIcon?: boolean;                // Mostrar ícone Zap (default: true)
  [key: string]: any;                // Outras props do Button
}
```

#### **Uso**

```javascript
import StripeCheckoutButton from '@/components/stripe/StripeCheckoutButton';

// Uso básico
<StripeCheckoutButton>
  Assinar PRO - R$ 49/mês
</StripeCheckoutButton>

// Sem informações de pagamento e ícone
<StripeCheckoutButton
  showPaymentInfo={false}
  showIcon={false}
  className="upgrade-btn"
>
  Assinar PRO - R$ 49/mês
</StripeCheckoutButton>
```

#### **Comportamento**

- ✅ Usa `useStripeCheckout` internamente
- ✅ Gerencia loading state
- ✅ Exibe erros abaixo do botão
- ✅ Desabilita durante loading
- ✅ Suporta customização via props

---

## ⚙️ Settings Components ✨ NOVO

### `PlanSection`

**Arquivo:** `src/components/settings/PlanSection/PlanSection.jsx`

Seção para gerenciamento de plano e assinatura Stripe.

#### **Props**

```typescript
interface PlanSectionProps {
  isPro: boolean;
  doctor: Doctor | null;
  subscriptionEndDate: Date | null;
  onCancel: () => Promise<void>;
  onReactivate: () => Promise<void>;
  cancelLoading: boolean;
  reactivateLoading: boolean;
  cancelError: string | null;
  reactivateError: string | null;
}
```

#### **Uso**

```javascript
import PlanSection from '@/components/settings/PlanSection/PlanSection';

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
```

#### **Comportamento**

- ✅ Exibe card de upgrade para usuários free
- ✅ Exibe informações de assinatura ativa para usuários PRO
- ✅ Mostra data de término da assinatura
- ✅ Permite cancelamento (no final do período pago)
- ✅ Permite reativação de assinatura cancelada
- ✅ Gerencia estados de loading e error

---

### `WhatsAppSection`

**Arquivo:** `src/components/settings/WhatsAppSection/WhatsAppSection.jsx`

Seção colapsável para configuração de mensagens WhatsApp.

#### **Props**

```typescript
interface WhatsAppSectionProps {
  whatsappConfig: {
    intro: string;
    body: string;
    footer: string;
    showValue: boolean;
  };
  onUpdateField: (field: string, value: any) => void;
  preview: string;
}
```

#### **Uso**

```javascript
import WhatsAppSection from '@/components/settings/WhatsAppSection/WhatsAppSection';

<WhatsAppSection
  whatsappConfig={whatsappConfig}
  onUpdateField={updateWhatsappField}
  preview={generatePreview()}
/>
```

#### **Comportamento**

- ✅ Seção colapsável com animação
- ✅ Campos para intro, body, footer
- ✅ Checkbox para incluir valor
- ✅ Preview da mensagem em tempo real
- ✅ Gerencia estado de expansão

---

### `PublicScheduleSection`

**Arquivo:** `src/components/settings/PublicScheduleSection/PublicScheduleSection.jsx`

Seção colapsável para configuração do período de exibição do agendamento público.

#### **Props**

```typescript
interface PublicScheduleSectionProps {
  publicScheduleConfig: {
    period: string;
  };
  onUpdateField: (field: string, value: any) => void;
}
```

#### **Uso**

```javascript
import PublicScheduleSection from '@/components/settings/PublicScheduleSection/PublicScheduleSection';

<PublicScheduleSection
  publicScheduleConfig={publicScheduleConfig}
  onUpdateField={updatePublicScheduleField}
/>
```

#### **Comportamento**

- ✅ Seção colapsável com animação
- ✅ Select com opções de período
- ✅ Descrição de cada opção
- ✅ Gerencia estado de expansão

---

### `AppointmentTypeSection`

**Arquivo:** `src/components/settings/AppointmentTypeSection/AppointmentTypeSection.jsx`

Seção colapsável para configuração de tipos de atendimento e locais.

#### **Props**

```typescript
interface AppointmentTypeSectionProps {
  appointmentTypeConfig: {
    mode: 'disabled' | 'fixed' | 'allow_choice';
    fixedType: 'online' | 'presencial';
    defaultValueOnline: number;
    defaultValuePresencial: number;
    locations: Array<{ name: string; defaultValue: number }>;
  };
  onUpdateField: (field: string, value: any) => void;
  onAddLocation: () => void;
  onUpdateLocation: (index: number, location: { name: string; defaultValue: number }) => void;
  onRemoveLocation: (index: number) => void;
  newLocationName: string;
  newLocationValue: string;
  onNewLocationNameChange: (value: string) => void;
  onNewLocationValueChange: (value: string) => void;
}
```

#### **Uso**

```javascript
import AppointmentTypeSection from '@/components/settings/AppointmentTypeSection/AppointmentTypeSection';

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
```

#### **Comportamento**

- ✅ Seção colapsável com animação
- ✅ Select para modo de exibição (desabilitado, fixo, permitir escolha)
- ✅ Select para tipo fixo (quando modo é fixo)
- ✅ Campos para valores padrão (online e presencial)
- ✅ Gerenciamento de múltiplos locais de atendimento
- ✅ Adicionar, editar e remover locais
- ✅ Validação de campos obrigatórios

---

## 📖 Guia de Uso

### Criando um Novo Componente

```javascript
// src/components/common/NewComponent/NewComponent.jsx
import React from 'react';
import './NewComponent.css';

/**
 * Componente Novo
 * 
 * @param {Object} props
 * @param {string} props.title - Título do componente
 * @param {React.ReactNode} props.children - Conteúdo
 */
export default function NewComponent({ title, children, className = '' }) {
  return (
    <div className={`new-component ${className}`}>
      {title && <h3>{title}</h3>}
      <div className="new-component-content">
        {children}
      </div>
    </div>
  );
}
```

### Padrões de Nomenclatura

- **Componentes:** PascalCase (`Button`, `StatsCard`)
- **Arquivos:** PascalCase (`Button.jsx`, `StatsCard.jsx`)
- **Pastas:** PascalCase (`Button/`, `StatsCard/`)
- **CSS:** Kebab-case (`button.css`, `stats-card.css`)
- **Props:** camelCase (`fullWidth`, `onClick`)

### Estrutura de Pastas

```
ComponentName/
├── ComponentName.jsx
├── ComponentName.css
└── index.js
```

---

## 🎓 Conclusão

### Pontos Fortes

- ✅ Componentes bem organizados e reutilizáveis
- ✅ Props bem documentadas com JSDoc
- ✅ CSS modular e organizado
- ✅ Suporte a customização via className
- ✅ Acessibilidade (ARIA labels)

### Melhores Práticas

1. **Sempre documentar props** com JSDoc
2. **Usar PropTypes ou TypeScript** para validação
3. **Manter componentes pequenos** e focados
4. **Reutilizar componentes** quando possível
5. **Testar componentes** isoladamente

---

**Documentação criada por:** Assistente IA  
**Data:** Janeiro 2026  
**Versão:** 1.2
