# Documentação - Lógica de Status de Agendamentos

## 📋 Visão Geral

Este documento descreve a lógica completa de status de agendamentos no sistema, incluindo definições, grupos, regras de negócio e uso em todo o código.

---

## 1. Definições de Status

### Arquivo: `src/constants/appointmentStatus.js`

### Status Principais

```javascript
export const APPOINTMENT_STATUS = {
  CONFIRMED: "Confirmado",      // Consulta confirmada
  PENDING: "Pendente",          // Aguardando confirmação
  MESSAGE_SENT: "Msg enviada",  // Mensagem enviada ao paciente
  CANCELLED: "Cancelado",        // Consulta cancelada (LIBERA slot)
  NO_SHOW: "Não Compareceu",    // Paciente não compareceu (BLOQUEIA slot)
};
```

---

## 2. Grupos de Status

### STATUS_GROUPS

Os grupos organizam status para filtros, análises e validações:

```javascript
export const STATUS_GROUPS = {
  // Status confirmados
  CONFIRMED: [APPOINTMENT_STATUS.CONFIRMED],
  
  // Status pendentes (aguardando confirmação)
  PENDING: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.MESSAGE_SENT],
  
  // Status cancelados (apenas Cancelado libera slot)
  CANCELLED: [APPOINTMENT_STATUS.CANCELLED],
  
  // Status ativos (BLOQUEIAM slots - ocupam horários)
  ACTIVE: [
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.PENDING,
    APPOINTMENT_STATUS.MESSAGE_SENT,
    APPOINTMENT_STATUS.NO_SHOW  // ⚠️ Não Compareceu BLOQUEIA slot
  ],
};
```

### ⚠️ REGRA DE NEGÓCIO IMPORTANTE

**NOVA LÓGICA (Implementada):**

- **ACTIVE**: Status que **BLOQUEIAM** slots (ocupam horários)
  - ✅ Confirmado
  - ✅ Pendente
  - ✅ Msg enviada
  - ✅ **Não Compareceu** (bloqueia slot - paciente não compareceu mas horário continua ocupado)

- **CANCELLED**: Status que **LIBERAM** slots
  - ✅ **Apenas Cancelado** (libera slot para novo agendamento)
  - ❌ **Não Compareceu NÃO está em CANCELLED** (bloqueia slot)

---

## 3. Configuração Visual (STATUS_CONFIG)

Cada status tem configuração para exibição:

```javascript
STATUS_CONFIG = {
  [APPOINTMENT_STATUS.CONFIRMED]: {
    color: "success",        // Verde
    label: "Confirmado",
    icon: "CheckCircle",
    cssClass: "confirmed",
    chartColor: "#16a34a",
  },
  [APPOINTMENT_STATUS.PENDING]: {
    color: "warning",        // Amarelo/Laranja
    label: "Pendente",
    icon: "Clock",
    cssClass: "pending",
    chartColor: "#f59e0b",
  },
  [APPOINTMENT_STATUS.MESSAGE_SENT]: {
    color: "info",           // Azul
    label: "Msg enviada",
    icon: "MessageCircle",
    cssClass: "message-sent",
    chartColor: "#3b82f6",
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    color: "danger",         // Vermelho (mas visualmente AZUL no SlotItem)
    label: "Cancelado",
    icon: "XCircle",
    cssClass: "cancelled",
    chartColor: "#ef4444",
  },
  [APPOINTMENT_STATUS.NO_SHOW]: {
    color: "danger",         // Vermelho
    label: "Não Compareceu",
    icon: "XOctagon",
    cssClass: "no-show",
    chartColor: "#dc2626",
  },
}
```

---

## 4. Funções Utilitárias

### `getStatusConfig(status)`

Retorna configuração visual de um status.

```javascript
const config = getStatusConfig("Confirmado");
// { color: "success", label: "Confirmado", ... }
```

### `isStatusInGroup(status, group)`

Verifica se um status pertence a um grupo.

```javascript
isStatusInGroup("Confirmado", "ACTIVE")  // true
isStatusInGroup("Cancelado", "ACTIVE")   // false
isStatusInGroup("Cancelado", "CANCELLED") // true
```

---

## 5. Uso em Filtros

### `src/utils/filters/appointmentFilters.js`

#### `filterActiveAppointments(appointments)`

Filtra apenas appointments com status em `STATUS_GROUPS.ACTIVE`.

**Uso:** Quando precisa de appointments que ocupam/bloqueiam slots.

```javascript
const active = filterActiveAppointments(appointments);
// Retorna: Confirmado, Pendente, Msg enviada, Não Compareceu
```

#### `filterAppointments(appointments, config)`

Filtro geral que aceita múltiplos critérios, incluindo `statusFilter`.

**Uso:** Filtros de busca e visualização.

```javascript
const filtered = filterAppointments(appointments, {
  statusFilter: "Confirmado",  // ou "Todos"
  startDate: "2026-01-01",
  endDate: "2026-01-31"
});
```

### `src/utils/filters/availabilityFilters.js`

#### `filterAvailableSlots(availability, appointments)`

Remove slots ocupados por appointments `ACTIVE`.

**Uso:** Calcular slots livres para agendamento.

```javascript
const available = filterAvailableSlots(availability, appointments);
// Retorna slots que NÃO estão ocupados por ACTIVE
// Inclui slots com appointments cancelados (não estão em ACTIVE)
```

---

## 6. Validações e Conflitos

### `src/utils/appointments/getBookedSlots.js`

#### `getBookedSlotsForDate(appointments, date)`

Retorna horários ocupados (apenas status `ACTIVE`).

**Uso:** Verificar quais horários estão ocupados.

```javascript
const booked = getBookedSlotsForDate(appointments, "2026-01-15");
// Retorna: ["08:00", "10:00"] (apenas ACTIVE)
// NÃO retorna horários cancelados
```

### `src/utils/appointments/hasConflict.js`

#### `hasAppointmentConflict(appointments, date, time)`

Verifica se já existe appointment `ACTIVE` no horário.

**Uso:** Validar antes de criar novo appointment.

```javascript
if (hasAppointmentConflict(appointments, "2026-01-15", "14:00")) {
  // Horário ocupado por ACTIVE
}
// Retorna false para horários cancelados (não bloqueiam)
```

---

## 7. Limites e Contagem

### `src/utils/limits/calculateMonthlyLimit.js`

#### `calculateMonthlyAppointmentsCount(appointments)`

Conta apenas appointments `CONFIRMED` no mês atual.

**Uso:** Calcular limite do plano.

```javascript
const count = calculateMonthlyAppointmentsCount(appointments);
// Conta apenas "Confirmado" no mês atual
```

**⚠️ IMPORTANTE:** Limites são baseados apenas em `CONFIRMED`, não em `ACTIVE`.

---

## 8. Estatísticas

### `src/utils/stats/appointmentStats.js`

#### `calculateAppointmentStats(appointments, priceMap)`

- **Total:** appointments `ACTIVE`
- **Revenue:** apenas `CONFIRMED` (faturamento)

```javascript
const stats = calculateAppointmentStats(appointments, priceMap);
// {
//   totalAppointments: 10,  // ACTIVE
//   totalRevenue: 500.00,   // Apenas CONFIRMED
//   averageTicket: "50.00"
// }
```

#### `calculateStatusSummary(appointments)`

Agrupa por grupos de status.

```javascript
const summary = calculateStatusSummary(appointments);
// {
//   confirmed: 5,   // CONFIRMED
//   pending: 3,     // PENDING (Pendente + Msg enviada)
//   cancelled: 2    // Apenas CANCELLED (não inclui NO_SHOW)
// }
```

### `src/utils/stats/enhancedStats.js`

#### `calculateGroupedStats(appointments)`

Agrupa appointments por grupos de status.

**⚠️ ATENÇÃO:** Usa `isStatusInGroup` para CONFIRMED e PENDING, mas verifica `APPOINTMENT_STATUS.CANCELLED` diretamente (correto - apenas Cancelado).

#### `calculateNewPatientsStats(appointments, month, year)`

Considera apenas appointments `ACTIVE` para identificar novos pacientes.

#### `calculateConversionRate(appointments)`

Taxa de conversão = Confirmados / Total Ativos.

```javascript
const rate = calculateConversionRate(appointments);
// Confirmados / (Confirmado + Pendente + Msg enviada + Não Compareceu)
```

---

## 9. Componentes

### `src/components/agenda/AppointmentItem.jsx`

Select de status com todas as opções:

```javascript
<option value={APPOINTMENT_STATUS.PENDING}>Pendente</option>
<option value={APPOINTMENT_STATUS.MESSAGE_SENT}>Msg enviada</option>
<option value={APPOINTMENT_STATUS.CONFIRMED}>Confirmado</option>
<option value={APPOINTMENT_STATUS.NO_SHOW}>Não Compareceu</option>
<option value={APPOINTMENT_STATUS.CANCELLED}>Cancelado</option>
```

### `src/components/availability/SlotItem/SlotItem.jsx`

Usa `getStatusConfig()` para exibir badge de status.

**Visual:**
- Slots cancelados: **AZUL** (borda e fundo)
- Slots "Não Compareceu": **VERMELHO** (borda e fundo)

### `src/components/availability/DayStats/DayStats.jsx`

Exibe apenas:
- ✅ Confirmados
- ✅ Pendentes

**Removidos:**
- ❌ Cancelados
- ❌ Livres

### `src/components/dashboard/StatusSummary/StatusSummary.jsx`

Exibe 4 categorias:
- Confirmados
- Pendentes
- Cancelados
- No-show

---

## 10. Hooks

### `src/hooks/agenda/useAgenda.js`

- Filtra appointments `ACTIVE` para exibição
- Permite atualização de status
- Valida conflitos usando `STATUS_GROUPS.ACTIVE`
- Calcula `freeSlots` incluindo slots cancelados

### `src/hooks/agenda/useAllAppointments.js`

- Filtro por status (dropdown)
- Filtra `ACTIVE` para validações

### `src/hooks/appointments/useAvailability.js`

- Usa `STATUS_GROUPS.ACTIVE` para calcular slots ocupados
- Cria appointments com status padrão `CONFIRMED`
- Permite cancelar (muda para `CANCELLED`)
- `getCalendarTileData()` inclui slots cancelados como livres

### `src/hooks/appointments/usePublicSchedule.js`

- Filtra apenas appointments `ACTIVE` para validações
- Inclui slots cancelados na lista de disponíveis
- Filtra slots que já passaram (data/hora atual)

### `src/hooks/dashboard/useDashboard.js`

- Usa `STATUS_GROUPS.ACTIVE` para cálculos gerais
- Conta `NO_SHOW` separadamente em algumas estatísticas
- Usa `APPOINTMENT_STATUS.CANCELLED` diretamente (correto)

---

## 11. Serviços

### `src/services/firebase/appointments.service.js`

#### `createAppointment(data)`

Status padrão: **"Pendente"** (string) se não informado.

```javascript
status: data.status || "Pendente"
```

**⚠️ INCONSISTÊNCIA:** 
- `useAvailability.js` cria com `APPOINTMENT_STATUS.CONFIRMED`
- `appointments.service.js` usa "Pendente" (string)

**Recomendação:** Padronizar para usar constante `APPOINTMENT_STATUS.PENDING`.

#### `updateAppointment(appointmentId, data)`

Permite atualizar campo `status`.

---

## 12. Padrões de Uso

### ✅ CORRETO: Usar STATUS_GROUPS.ACTIVE

```javascript
// ✅ Para verificar se slot está ocupado
if (STATUS_GROUPS.ACTIVE.includes(appointment.status)) {
  // Slot ocupado
}

// ✅ Para filtrar appointments ativos
const active = appointments.filter(a => 
  STATUS_GROUPS.ACTIVE.includes(a.status)
);
```

### ✅ CORRETO: Verificar CANCELLED diretamente

```javascript
// ✅ Para contar apenas cancelados (não inclui NO_SHOW)
const cancelled = appointments.filter(a => 
  a.status === APPOINTMENT_STATUS.CANCELLED
);
```

### ✅ CORRETO: Usar isStatusInGroup para grupos

```javascript
// ✅ Para verificar grupos
if (isStatusInGroup(status, 'CONFIRMED')) {
  // Status confirmado
}
```

### ❌ EVITAR: Verificar status específico quando deveria usar grupo

```javascript
// ❌ EVITAR (a menos que seja necessário)
if (appointment.status === APPOINTMENT_STATUS.CONFIRMED) {
  // Melhor usar: isStatusInGroup(status, 'CONFIRMED')
}
```

---

## 13. Regras de Negócio

### Regra 1: Bloqueio de Slots

**Status que BLOQUEIAM slots (ocupam horários):**
- ✅ Confirmado
- ✅ Pendente
- ✅ Msg enviada
- ✅ **Não Compareceu** (bloqueia - paciente não compareceu mas horário continua ocupado)

**Status que LIBERAM slots:**
- ✅ **Cancelado** (libera slot para novo agendamento)

### Regra 2: Limites Mensais

**Contagem para limites:**
- Apenas `CONFIRMED` conta para limite do plano
- `NO_SHOW` não conta para limite (mas bloqueia slot)

### Regra 3: Faturamento

**Revenue (faturamento):**
- Apenas `CONFIRMED` gera faturamento
- Outros status não geram receita

### Regra 4: Slots Livres

**Slots considerados livres:**
1. Slots na availability não ocupados por `ACTIVE`
2. Slots com appointments `CANCELLED` (mesmo que não estejam na availability)
3. Slots futuros (não passados - data/hora atual)

---

## 14. Inconsistências Encontradas

### ✅ 1. Status Padrão na Criação (CORRIGIDO)

**Localização:**
- `src/services/firebase/appointments.service.js`: Agora usa `APPOINTMENT_STATUS.PENDING` ✅
- `src/hooks/appointments/useAvailability.js`: Usa `APPOINTMENT_STATUS.CONFIRMED` (intencional - cria já confirmado)

**Status:** ✅ **PADRONIZADO** - Ambos usam constantes.

**Nota:** `useAvailability.js` cria appointments já confirmados (comportamento intencional para agendamento interno).

### ✅ 2. Verificação Redundante em useDashboard (CORRIGIDO)

**Localização:** `src/hooks/dashboard/useDashboard.js`

**Status:** ✅ **CORRIGIDO** - Removida verificação redundante, agora usa apenas `STATUS_GROUPS.ACTIVE.includes()`.

### ✅ 3. Verificações Diretas de CANCELLED (Correto)

**Localizações:**
- `src/utils/stats/enhancedStats.js`
- `src/utils/stats/appointmentStats.js`
- `src/hooks/dashboard/useDashboard.js`

**Status:** ✅ **CORRETO** - Necessário para contar apenas Cancelado (não incluir NO_SHOW).

---

## 15. Checklist de Padronização

### ✅ Verificações de Bloqueio de Slot

- [x] `getBookedSlotsForDate()` - Usa `STATUS_GROUPS.ACTIVE` ✅
- [x] `hasAppointmentConflict()` - Usa `STATUS_GROUPS.ACTIVE` ✅
- [x] `filterAvailableSlots()` - Usa `STATUS_GROUPS.ACTIVE` ✅
- [x] `getCalendarTileData()` - Usa `STATUS_GROUPS.ACTIVE` ✅
- [x] `useAgenda.js` - Usa `STATUS_GROUPS.ACTIVE` ✅
- [x] `useAvailability.js` - Usa `STATUS_GROUPS.ACTIVE` ✅
- [x] `usePublicSchedule.js` - Usa `STATUS_GROUPS.ACTIVE` ✅

### ✅ Verificações de Cancelado

- [x] `enhancedStats.js` - Usa `APPOINTMENT_STATUS.CANCELLED` diretamente ✅
- [x] `appointmentStats.js` - Usa `APPOINTMENT_STATUS.CANCELLED` diretamente ✅
- [x] `useDashboard.js` - Usa `APPOINTMENT_STATUS.CANCELLED` diretamente ✅
- [x] `usePublicSchedule.js` - Usa `APPOINTMENT_STATUS.CANCELLED` diretamente ✅
- [x] `useAvailability.js` - Usa `APPOINTMENT_STATUS.CANCELLED` diretamente ✅

### ✅ Inconsistências Corrigidas

- [x] Status padrão na criação (agora usa constante `APPOINTMENT_STATUS.PENDING`) ✅
- [x] Verificação redundante em `useDashboard.js` (removida) ✅

---

## 16. Fluxo de Status

```
CRIAÇÃO
  ↓
[Pendente] (padrão) ou [Confirmado] (useAvailability)
  ↓
┌─────────────────────────────────────┐
│  MUDANÇAS DE STATUS                 │
└─────────────────────────────────────┘
  ↓
[Msg enviada] → [Confirmado] → [Não Compareceu]
  ↓                                    ↓
[Cancelado] ←──────────────────────────┘
  ↓
LIBERA SLOT (pode marcar novo appointment)
```

---

## 17. Resumo Executivo

### Status que Bloqueiam Slots (ACTIVE)
- ✅ Confirmado
- ✅ Pendente
- ✅ Msg enviada
- ✅ **Não Compareceu** (bloqueia slot)

### Status que Liberam Slots
- ✅ **Cancelado** (libera slot)

### Contagem para Limites
- ✅ Apenas **Confirmado** conta

### Faturamento
- ✅ Apenas **Confirmado** gera receita

### Slots Livres
- ✅ Slots não ocupados por ACTIVE
- ✅ Slots com appointments Cancelados
- ✅ Slots futuros (não passados)

---

## 18. Arquivos Principais

### Definições
- `src/constants/appointmentStatus.js` - Definições centrais

### Utils
- `src/utils/filters/appointmentFilters.js` - Filtros de appointments
- `src/utils/filters/availabilityFilters.js` - Filtros de disponibilidade
- `src/utils/appointments/getBookedSlots.js` - Horários ocupados
- `src/utils/appointments/hasConflict.js` - Validação de conflitos
- `src/utils/appointments/getStatusOptions.js` - Opções para selects
- `src/utils/stats/appointmentStats.js` - Estatísticas básicas
- `src/utils/stats/enhancedStats.js` - Estatísticas avançadas
- `src/utils/limits/calculateMonthlyLimit.js` - Limites mensais

### Hooks
- `src/hooks/agenda/useAgenda.js` - Agenda do dia
- `src/hooks/agenda/useAllAppointments.js` - Todos os appointments
- `src/hooks/appointments/useAvailability.js` - Disponibilidade
- `src/hooks/appointments/usePublicSchedule.js` - Agenda pública
- `src/hooks/dashboard/useDashboard.js` - Dashboard

### Componentes
- `src/components/agenda/AppointmentItem.jsx` - Item de appointment
- `src/components/availability/SlotItem/SlotItem.jsx` - Item de slot
- `src/components/availability/DayStats/DayStats.jsx` - Estatísticas do dia
- `src/components/dashboard/StatusSummary/StatusSummary.jsx` - Resumo de status

### Serviços
- `src/services/firebase/appointments.service.js` - CRUD de appointments

---

## 19. Conclusão

A lógica de status está **bem padronizada** na maioria dos lugares:

✅ **Pontos Fortes:**
- Uso consistente de `STATUS_GROUPS.ACTIVE` para bloqueio de slots
- Verificações diretas de `CANCELLED` quando necessário (correto)
- Funções utilitárias centralizadas
- Documentação inline nos arquivos

✅ **Status Atual:**
- Status padrão na criação: **PADRONIZADO** (usa constante)
- Verificação redundante: **CORRIGIDA** (removida)

**Conclusão:** A lógica de status está **totalmente padronizada** em todo o código.
