# 📚 Documentação Completa - Utils do Projeto

> **Versão:** 2.1  
> **Última atualização:** Janeiro 2026  
> **Total de Utils:** 26 funções

---

## 📋 Índice

1. [WhatsApp Utils](#-whatsapp-utils) ✨ NOVO
2. [Formatação](#-formatação)
3. [Validações](#-validações)
4. [Filtros de Data](#-filtros-de-data)
5. [Filtros de Appointments](#-filtros-de-appointments)
6. [Filtros de Availability](#-filtros-de-availability)
7. [Agrupamento](#-agrupamento)
8. [Estatísticas](#-estatísticas)
9. [Helpers de Pacientes](#-helpers-de-pacientes) ✨ NOVO
10. [Helpers de Appointments](#-helpers-de-appointments) ✨ NOVO
11. [Helpers de Mensagens](#-helpers-de-mensagens) ✨ NOVO
12. [Helpers Gerais](#-helpers-gerais)
13. [Utilitários de Pacientes](#-utilitários-de-pacientes) ✨ NOVO

---

## 📱 WhatsApp Utils

### `cleanWhatsapp(value)` ✨ NOVO
**Arquivo**: `src/utils/whatsapp/cleanWhatsapp.js`

Remove toda formatação do WhatsApp, retornando apenas números.

```javascript
import { cleanWhatsapp } from "@/utils/whatsapp/cleanWhatsapp";

cleanWhatsapp("(11) 98765-4321");
// ➜ "11987654321"

cleanWhatsapp("11 9 8765 4321");
// ➜ "11987654321"

cleanWhatsapp("abc11987xyz");
// ➜ "11987"

cleanWhatsapp("");
// ➜ ""
```

**Parâmetros:**
- `value` (string): Número com ou sem formatação

**Retorna:** `string` - Apenas números (sem limite de tamanho)

**Uso nos Hooks:**
- `usePatients` (3 vezes)
- `useAgenda`
- `usePublicSchedule`
- `useRegister`

---

### `validateWhatsappLength(whatsapp)` ✨ NOVO
**Arquivo**: `src/utils/whatsapp/validateWhatsappLength.js`

Valida se o WhatsApp tem comprimento válido (10-11 dígitos).

```javascript
import { validateWhatsappLength } from "@/utils/whatsapp/validateWhatsappLength";

validateWhatsappLength("11987654321");
// ➜ { valid: true, length: 11 }

validateWhatsappLength("1234567890");
// ➜ { valid: true, length: 10 }

validateWhatsappLength("123456789");
// ➜ { 
//   valid: false, 
//   length: 9, 
//   message: "WhatsApp inválido. Digite DDD + número (10 a 11 dígitos)." 
// }
```

**Parâmetros:**
- `whatsapp` (string): Número apenas com dígitos

**Retorna:** `Object`
```typescript
{
  valid: boolean,
  length: number,
  message?: string  // Apenas quando valid = false
}
```

---

### `formatWhatsapp(value)`
**Arquivo**: `src/utils/formatter/formatWhatsapp.js`

Formata um número de telefone no padrão brasileiro.

```javascript
import { formatWhatsapp } from "@/utils/formatter/formatWhatsapp";

formatWhatsapp("11987654321");
// ➜ "(11) 98765-4321"

formatWhatsapp("1198765");
// ➜ "(11) 98765"

formatWhatsapp("11");
// ➜ "11"
```

**Parâmetros:**
- `value` (string): Número de telefone com ou sem formatação

**Retorna:** `string` - Número formatado como `(XX) XXXXX-XXXX`

**Regras:**
- Remove todos os caracteres não numéricos
- Limita a 11 dígitos
- Formata progressivamente conforme digitação

---

## 🎨 Formatação

### `formatDate(input)`
**Arquivo**: `src/utils/formatter/formatDate.js`

Converte datas de diversos formatos para o padrão brasileiro DD/MM/YYYY.

```javascript
import formatDate from "@/utils/formatter/formatDate";

// ISO string
formatDate("2026-01-15");
// ➜ "15/01/2026"

// Date object
formatDate(new Date(2026, 0, 15));
// ➜ "15/01/2026"

// Timestamp
formatDate(1736899200000);
// ➜ "15/01/2026"

// Valores inválidos
formatDate(null);     // ➜ ""
formatDate("texto");  // ➜ "texto"
```

**Parâmetros:**
- `input` (string | Date | number | null | undefined): Data em qualquer formato

**Retorna:** `string` - Data formatada como `DD/MM/YYYY`

**Casos Suportados:**
- ✅ ISO string (`YYYY-MM-DD`)
- ✅ Date object
- ✅ Timestamp (número)
- ✅ ISO completo (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- ⚠️ Retorna string vazia para `null` ou `undefined`
- ⚠️ Retorna a própria string se não conseguir converter

---

## ✅ Validações

### `validateFormField(field, value, rules)` ✨ NOVO
**Arquivo**: `src/utils/validators/formValidation.js`

Validador universal para campos de formulário com múltiplas regras.

```javascript
import { validateFormField } from "@/utils/validators/formValidation";

// Nome obrigatório
validateFormField("name", "", { required: true });
// ➜ { valid: false, error: "Name é obrigatório." }

validateFormField("name", "João Silva", { required: true });
// ➜ { valid: true }

// Email válido
validateFormField("email", "invalid", { required: true, email: true });
// ➜ { valid: false, error: "Email inválido." }

validateFormField("email", "user@example.com", { required: true, email: true });
// ➜ { valid: true }

// WhatsApp
validateFormField("whatsapp", "11987654321", { required: true, whatsapp: true });
// ➜ { valid: true }

// Senhas iguais
validateFormField("confirmPassword", "123", { 
  required: true, 
  match: { value: "456", message: "As senhas não coincidem." }
});
// ➜ { valid: false, error: "As senhas não coincidem." }

// Comprimento mínimo
validateFormField("password", "123", { minLength: 8 });
// ➜ { valid: false, error: "Mínimo de 8 caracteres." }

// Padrão customizado
validateFormField("cpf", "123", { 
  pattern: /^\d{11}$/ 
});
// ➜ { valid: false, error: "Formato inválido." }

// Validação customizada
validateFormField("age", "15", {
  custom: (value) => {
    const age = Number(value);
    if (age < 18) {
      return { valid: false, error: "Deve ser maior de 18 anos." };
    }
    return { valid: true };
  }
});
```

**Parâmetros:**
- `field` (string): Nome do campo
- `value` (any): Valor do campo
- `rules` (Object): Regras de validação

**Rules Disponíveis:**
```typescript
{
  required?: boolean,           // Campo obrigatório
  email?: boolean,              // Valida formato de email
  whatsapp?: boolean,           // Valida WhatsApp (10-11 dígitos)
  match?: {                     // Valida igualdade (confirmação)
    value: any,
    message?: string
  },
  minLength?: number,           // Comprimento mínimo
  maxLength?: number,           // Comprimento máximo
  pattern?: RegExp,             // Regex customizado
  custom?: (value) => Object    // Validação customizada
}
```

**Retorna:** `Object`
```typescript
{
  valid: boolean,
  error?: string  // Mensagem de erro quando valid = false
}
```

**Uso nos Hooks:**
- `useRegister` - Validação do formulário de registro
- `useLogin` - Validação do formulário de login

---

### `validatePassword(password)` & `isPasswordValid(criteria)`
**Arquivo**: `src/utils/validators/passwordValidation.js`

Valida critérios de senha forte.

```javascript
import { validatePassword, isPasswordValid } from "@/utils/validators/passwordValidation";

const criteria = validatePassword("Senha@123");
// ➜ {
//   length: true,     // >= 8 caracteres
//   uppercase: true,  // Tem maiúscula
//   lowercase: true,  // Tem minúscula
//   number: true,     // Tem número
//   symbol: true      // Tem símbolo
// }

isPasswordValid(criteria);
// ➜ true
```

**Critérios:**
| Critério | Descrição | Validação |
|----------|-----------|-----------|
| `length` | Mínimo 8 caracteres | `password.length >= 8` |
| `uppercase` | Pelo menos uma maiúscula | `/[A-Z]/` |
| `lowercase` | Pelo menos uma minúscula | `/[a-z]/` |
| `number` | Pelo menos um número | `/\d/` |
| `symbol` | Pelo menos um símbolo | `/[\W_]/` |

---

## 📅 Filtros de Data

### `formatDateToQuery(date)`
**Arquivo**: `src/utils/filters/dateFilters.js`

Converte Date object para string YYYY-MM-DD.

```javascript
import { formatDateToQuery } from "@/utils/filters/dateFilters";

formatDateToQuery(new Date(2026, 0, 15));
// ➜ "2026-01-15"

formatDateToQuery(null);
// ➜ ""
```

**Parâmetros:**
- `date` (Date): Data a formatar

**Retorna:** `string` - Data no formato `YYYY-MM-DD` ou string vazia

---

### `getTodayString()`
**Arquivo**: `src/utils/filters/dateFilters.js`

Obtém a data de hoje em formato YYYY-MM-DD.

```javascript
import { getTodayString } from "@/utils/filters/dateFilters";

getTodayString();
// ➜ "2026-01-10" (data atual)
```

**Retorna:** `string` - Data de hoje

---

### `extractYearMonth(dateStr)`
**Arquivo**: `src/utils/filters/dateFilters.js`

Extrai ano e mês de uma string de data.

```javascript
import { extractYearMonth } from "@/utils/filters/dateFilters";

extractYearMonth("2026-01-15");
// ➜ { year: 2026, month: 1 }

extractYearMonth("15/01/2026");
// ➜ null (formato inválido)
```

**Parâmetros:**
- `dateStr` (string): Data no formato `YYYY-MM-DD`

**Retorna:** `{year: number, month: number} | null`

---

### `isDateInRange(date, startDate, endDate)`
**Arquivo**: `src/utils/filters/dateFilters.js`

Verifica se uma data está dentro de um intervalo.

```javascript
import { isDateInRange } from "@/utils/filters/dateFilters";

isDateInRange("2026-01-15", "2026-01-01", "2026-01-31");
// ➜ true

isDateInRange("2026-02-01", "2026-01-01", "2026-01-31");
// ➜ false

// Sem range definido = sempre true
isDateInRange("2026-01-15", "", "");
// ➜ true
```

**Parâmetros:**
- `date` (string): Data a verificar (YYYY-MM-DD)
- `startDate` (string): Data inicial
- `endDate` (string): Data final

**Retorna:** `boolean`

---

### `isDateInMonthYear(dateStr, month, year)`
**Arquivo**: `src/utils/filters/dateFilters.js`

Verifica se uma data pertence a um mês/ano específico.

```javascript
import { isDateInMonthYear } from "@/utils/filters/dateFilters";

isDateInMonthYear("2026-01-15", 1, 2026);
// ➜ true

isDateInMonthYear("2026-02-15", 1, 2026);
// ➜ false
```

**Parâmetros:**
- `dateStr` (string): Data a verificar (YYYY-MM-DD)
- `month` (number): Mês (1-12)
- `year` (number): Ano

**Retorna:** `boolean`

---

### `isFutureDate(dateStr)` / `isPastDate(dateStr)`
**Arquivo**: `src/utils/filters/dateFilters.js`

Verifica se uma data é futura ou passada.

```javascript
import { isFutureDate, isPastDate } from "@/utils/filters/dateFilters";

// Assumindo hoje = 2026-01-10

isFutureDate("2026-01-15");  // ➜ true
isPastDate("2026-01-05");    // ➜ true
```

**Parâmetros:**
- `dateStr` (string): Data a verificar (YYYY-MM-DD)

**Retorna:** `boolean`

---

## 🔍 Filtros de Appointments

### `filterAppointments(appointments, config)`
**Arquivo**: `src/utils/filters/appointmentFilters.js`

Filtra appointments com múltiplos critérios.

```javascript
import { filterAppointments } from "@/utils/filters/appointmentFilters";

const appointments = [
  { id: 1, date: "2026-01-15", status: "Confirmado", patientName: "João" },
  { id: 2, date: "2026-01-20", status: "Pendente", patientName: "Maria" }
];

// Por status
filterAppointments(appointments, { statusFilter: "Confirmado" });

// Por range
filterAppointments(appointments, {
  startDate: "2026-01-01",
  endDate: "2026-01-31"
});

// Por mês/ano
filterAppointments(appointments, {
  selectedMonth: 1,
  selectedYear: 2026
});

// Múltiplos filtros
filterAppointments(appointments, {
  statusFilter: "Confirmado",
  searchTerm: "joão",
  futureOnly: true
});
```

**Config Options:**
```typescript
{
  statusFilter?: string,       // "Confirmado", "Pendente", "Não Compareceu", "Todos"
  searchTerm?: string,         // Busca em nome ou telefone
  startDate?: string,          // YYYY-MM-DD
  endDate?: string,            // YYYY-MM-DD
  selectedMonth?: number,      // 1-12
  selectedYear?: number,       // Ano
  futureOnly?: boolean,        // Apenas >= hoje
  specificDate?: string        // YYYY-MM-DD (prioridade máxima)
}
```

**Retorna:** `Array` - Appointments filtrados

---

### `sortAppointments(appointments, ascending)`
**Arquivo**: `src/utils/filters/appointmentFilters.js`

Ordena appointments por data e hora.

```javascript
import { sortAppointments } from "@/utils/filters/appointmentFilters";

const appointments = [
  { date: "2026-01-20", time: "14:00" },
  { date: "2026-01-15", time: "08:00" }
];

sortAppointments(appointments);
// ➜ Ordenados: 15/08:00, 20/14:00

sortAppointments(appointments, false);
// ➜ Ordenados: 20/14:00, 15/08:00 (descendente)
```

**Parâmetros:**
- `appointments` (Array)
- `ascending` (boolean): `true` (padrão) = ascendente

**Retorna:** `Array` - Nova array ordenada

---

## 📆 Filtros de Availability

### `filterAvailableSlots(availability, appointments)`
**Arquivo**: `src/utils/filters/availabilityFilters.js`

Remove slots já agendados da disponibilidade.

```javascript
import { filterAvailableSlots } from "@/utils/filters/availabilityFilters";

const availability = [
  { date: "2026-01-15", slots: ["08:00", "09:00", "10:00"] }
];

const appointments = [
  { date: "2026-01-15", time: "09:00" }
];

filterAvailableSlots(availability, appointments);
// ➜ [{ date: "2026-01-15", slots: ["08:00", "10:00"] }]
```

**Retorna:** `Array` - Availability apenas com slots livres

---

### `validateAvailability(availability, futureOnly)`
**Arquivo**: `src/utils/filters/availabilityFilters.js`

Valida e filtra availability com critérios de qualidade.

```javascript
import { validateAvailability } from "@/utils/filters/availabilityFilters";

const availability = [
  { date: "2026-01-15", slots: ["08:00"] },
  { date: "2026-01-05", slots: ["10:00"] },  // Passada
  { date: "2026-01-20", slots: [] }          // Vazia
];

validateAvailability(availability);
// ➜ [{ date: "2026-01-15", slots: ["08:00"] }]
```

**Validações:**
- ✅ `date` existe e é string
- ✅ `slots` é array não vazio
- ✅ `date >= hoje` (se futureOnly = true)

**Retorna:** `Array` - Ordenado por data

---

### `countAvailableSlots(availability)`
**Arquivo**: `src/utils/filters/availabilityFilters.js`

Conta total de slots disponíveis.

```javascript
import { countAvailableSlots } from "@/utils/filters/availabilityFilters";

const availability = [
  { date: "2026-01-15", slots: ["08:00", "09:00", "10:00"] }
];

countAvailableSlots(availability);
// ➜ 3
```

---

### `getAvailableSlotsForDate(availability, appointments, date)`
**Arquivo**: `src/utils/filters/availabilityFilters.js`

Obtém slots livres para uma data específica.

```javascript
import { getAvailableSlotsForDate } from "@/utils/filters/availabilityFilters";

getAvailableSlotsForDate(availability, appointments, "2026-01-15");
// ➜ ["08:00", "10:00"] (ordenados, sem agendados)
```

---

## 👥 Agrupamento

### `groupAppointmentsByPatient(appointments)`
**Arquivo**: `src/utils/filters/patientGrouping.js`

Agrupa appointments por paciente (WhatsApp).

```javascript
import { groupAppointmentsByPatient } from "@/utils/filters/patientGrouping";

const appointments = [
  {
    patientWhatsapp: "11987654321",
    patientName: "João Silva",
    referenceName: "João",
    value: 150,
    status: "Confirmado"
  },
  {
    patientWhatsapp: "11987654321",
    value: 150,
    status: "Pendente"
  }
];

groupAppointmentsByPatient(appointments);
// ➜ [
//   {
//     name: "João",
//     whatsapp: "11987654321",
//     appointments: [/* 2 appointments */],
//     totalValue: 300,
//     statusCounts: { Confirmado: 1, Pendente: 1 }
//   }
// ]
```

**Retorna:** `Array` - Pacientes ordenados por nome

---

## 📊 Estatísticas

### `calculateAppointmentStats(appointments, priceMap)`
**Arquivo**: `src/utils/stats/appointmentStats.js`

Calcula estatísticas de appointments.

```javascript
import { calculateAppointmentStats } from "@/utils/stats/appointmentStats";

const appointments = [
  { date: "2026-01-05", status: "Confirmado", patientWhatsapp: "11987654321", value: 150 }
];

const priceMap = {
  "11987654321": 150,
  "11988776655": 200
};

calculateAppointmentStats(appointments, priceMap);
// ➜ {
//   totalAppointments: 1,
//   attendedAppointments: 1,  // Confirmado e data <= hoje
//   totalRevenue: 150,
//   averageTicket: 175        // (150+200)/2
// }
```

---

### `calculateStatusSummary(appointments)`
**Arquivo**: `src/utils/stats/appointmentStats.js`

Calcula resumo por status.

```javascript
import { calculateStatusSummary } from "@/utils/stats/appointmentStats";

const appointments = [
  { status: "Confirmado" },
  { status: "Confirmado" },
  { status: "Pendente" }
];

calculateStatusSummary(appointments);
// ➜ { Confirmado: 2, Pendente: 1, "Não Compareceu": 0 }
```

---

## 🧑‍⚕️ Helpers de Pacientes

### `generatePatientId(doctorId, whatsapp)` ✨ NOVO
**Arquivo**: `src/utils/patients/generatePatientId.js`

Gera ID único para paciente.

```javascript
import { generatePatientId } from "@/utils/patients/generatePatientId";

generatePatientId("doc123", "(11) 98765-4321");
// ➜ "doc123_11987654321"

generatePatientId("doc123", "11 9 8765 4321");
// ➜ "doc123_11987654321"
```

**Uso nos Hooks:**
- `usePatients`
- `useAgenda`
- `usePublicSchedule`

---

### `calculatePatientStats(appointments, whatsapp)` ✨ NOVO
**Arquivo**: `src/utils/patients/calculatePatientStats.js`

Calcula estatísticas de um paciente específico.

```javascript
import { calculatePatientStats } from "@/utils/patients/calculatePatientStats";

const appointments = [
  { patientWhatsapp: "11987654321", value: 150, status: "Confirmado" },
  { patientWhatsapp: "11987654321", value: 150, status: "Pendente" },
  { patientWhatsapp: "11987654321", value: 150, status: "Confirmado" }
];

calculatePatientStats(appointments, "11987654321");
// ➜ {
//   total: 3,
//   totalValue: 450,
//   confirmed: 2,
//   pending: 1,
//   noShow: 0
// }
```

**Retorna:** `Object`
```typescript
{
  total: number,          // Total de appointments
  totalValue: number,     // Soma dos valores
  confirmed: number,      // Status "Confirmado"
  pending: number,        // Status "Pendente"
  noShow: number          // Status "Não Compareceu"
}
```

---

## 📅 Helpers de Appointments

### `getBookedSlotsForDate(appointments, date)` ✨ NOVO
**Arquivo**: `src/utils/appointments/getBookedSlots.js`

Retorna horários já agendados em uma data.

```javascript
import { getBookedSlotsForDate } from "@/utils/appointments/getBookedSlots";

const appointments = [
  { date: "2026-01-15", time: "08:00" },
  { date: "2026-01-15", time: "09:00" }
];

getBookedSlotsForDate(appointments, "2026-01-15");
// ➜ ["08:00", "09:00"] (ordenados)
```

**Uso nos Hooks:**
- `useAvailability`
- `usePublicSchedule`

---

### `hasAppointmentConflict(appointments, date, time)` ✨ NOVO
**Arquivo**: `src/utils/appointments/hasConflict.js`

Verifica se existe conflito de horário.

```javascript
import { hasAppointmentConflict } from "@/utils/appointments/hasConflict";

const appointments = [
  { date: "2026-01-15", time: "08:00" }
];

hasAppointmentConflict(appointments, "2026-01-15", "08:00");
// ➜ true (conflito!)

hasAppointmentConflict(appointments, "2026-01-15", "09:00");
// ➜ false (livre)
```

**Uso nos Hooks:**
- `useAvailability`
- `usePublicSchedule`

---

## 💬 Helpers de Mensagens

### `generateWhatsappMessage(config)` ✨ NOVO
**Arquivo**: `src/utils/message/generateWhatsappMessage.js`

Gera mensagem formatada para WhatsApp.

```javascript
import { generateWhatsappMessage } from "@/utils/message/generateWhatsappMessage";

const message = generateWhatsappMessage({
  intro: "Olá",
  body: "Sua sessão está agendada",
  footer: "Nos vemos em breve",
  patientName: "João",
  date: "15/01/2026",
  time: "14:00",
  value: 150,
  showValue: true
});

// message contém a mensagem formatada
// ➜ "Olá João
//    
//    Sua sessão está agendada
//    
//    Data: 15/01/2026
//    Horário: 14:00
//    Valor: R$ 150
//    
//    Nos vemos em breve"
```

**Config:**
```typescript
{
  intro?: string,           // Default: "Olá"
  body?: string,            // Default: "Sua sessão está agendada"
  footer?: string,          // Default: ""
  patientName?: string,     // Default: ""
  date?: string,            // DD/MM/YYYY
  time?: string,            // HH:mm
  value?: number,           // Default: 0
  showValue?: boolean       // Default: true
}
```

**Uso nos Hooks:**
- `useSettings` - Preview de mensagem

---

## 🧑‍⚕️ Utilitários de Pacientes ✨ NOVO

### `createPatientsMap(patients)` ✨ NOVO
**Arquivo**: `src/utils/patients/createPatientsMap.js`

Cria um mapa de pacientes indexado por WhatsApp para busca rápida.

```javascript
import { createPatientsMap } from "@/utils/patients/createPatientsMap";

const patients = [
  { whatsapp: '5511999999999', name: 'João', referenceName: 'João Silva' },
  { whatsapp: '5511888888888', name: 'Maria', referenceName: 'Maria Santos' }
];

const map = createPatientsMap(patients);
// ➜ {
//   '5511999999999': { whatsapp: '5511999999999', name: 'João', ... },
//   '5511888888888': { whatsapp: '5511888888888', name: 'Maria', ... }
// }

// Uso em componentes
const patientsMap = React.useMemo(() => 
  createPatientsMap(patients), 
  [patients]
);

const patientData = patientsMap[appointment.patientWhatsapp];
```

**Parâmetros:**
- `patients` (Array): Array de objetos paciente

**Retorna:** `Object` - Mapa `{ [whatsapp]: patient }`

**Uso nos Componentes:**
- `ConfirmedAppointmentsModal`
- `NoShowModal`
- `CancelledModal`
- `PendingAppointmentsModal`
- `useDashboardStats`
- `useDashboardCharts`

---

### `getPatientName({ patientData, appointment, defaultName })` ✨ NOVO
**Arquivo**: `src/utils/patients/getPatientName.js`

Obtém o nome do paciente com fallback hierárquico.

**Hierarquia de prioridade:**
1. `patientData.name` (nome completo do paciente - mais atualizado)
2. `patientData.referenceName` (nome de referência do paciente)
3. `appointment.referenceName` (nome de referência do appointment - fallback)
4. `appointment.patientName` (nome do appointment - fallback antigo)
5. `defaultName` (padrão: 'Sem nome')

```javascript
import { getPatientName } from "@/utils/patients/getPatientName";

// Com dados atualizados do paciente
const patientData = { name: 'João Silva', referenceName: 'João' };
const appointment = { referenceName: 'João', patientName: 'João Silva' };
getPatientName({ patientData, appointment });
// ➜ 'João Silva'

// Sem patientData, usa dados do appointment
const appointment = { referenceName: 'Maria' };
getPatientName({ appointment });
// ➜ 'Maria'

// Sem dados, retorna padrão
getPatientName({});
// ➜ 'Sem nome'

// Com nome padrão customizado
getPatientName({ defaultName: 'Paciente não identificado' });
// ➜ 'Paciente não identificado'
```

**Parâmetros:**
- `patientData` (Object, opcional): Dados do paciente do array patients
- `appointment` (Object, opcional): Dados do appointment (fallback)
- `defaultName` (string, opcional): Nome padrão se nenhum for encontrado (padrão: 'Sem nome')

**Retorna:** `string` - Nome do paciente

**Uso nos Componentes:**
- `ConfirmedAppointmentsModal`
- `NoShowModal`
- `CancelledModal`
- `PendingAppointmentsModal`
- `useDashboardCharts`

---

## 🛠️ Helpers Gerais

### `generateYearRange(range)`
**Arquivo**: `src/utils/helpers/yearHelpers.js`

Gera lista de anos para seletores.

```javascript
import { generateYearRange } from "@/utils/helpers/yearHelpers";

// Assumindo ano atual = 2026

generateYearRange(1);
// ➜ [2027, 2026, 2025] (ordem decrescente)

generateYearRange(2);
// ➜ [2028, 2027, 2026, 2025, 2024]
```

**Parâmetros:**
- `range` (number): Quantos anos antes e depois (padrão: 1)

**Retorna:** `Array<number>` - Anos em ordem decrescente

---
