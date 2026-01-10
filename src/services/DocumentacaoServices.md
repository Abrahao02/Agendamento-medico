# 📚 Documentação Completa - Firebase Services

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Config & Collections](#️-config--collections)
3. [Auth Service](#-auth-service)
4. [Doctor Service](#-doctor-service)
5. [Patient Service](#-patient-service)
6. [Appointment Service](#-appointment-service)
7. [Availability Service](#-availability-service)
8. [Email Service](#-email-service)
9. [Sugestões de Melhorias](#-sugestões-de-melhorias)
10. [Guia de Uso Completo](#-guia-de-uso-completo)

---

## 🎯 Visão Geral

### Arquitetura

```
src/services/firebase/
├── config.js              # Configuração do Firebase
├── collections.js         # Constantes e validators
├── index.js              # Export central
├── auth.service.js       # Autenticação
├── doctors.service.js    # CRUD de médicos
├── patients.service.js   # CRUD de pacientes
├── appointments.service.js # CRUD de agendamentos
└── availability.service.js # CRUD de disponibilidade

src/services/api/
└── email.service.js      # Envio de emails
```

### Padrão de Retorno

Todos os services seguem o mesmo padrão de retorno:

```typescript
// Sucesso
{
  success: true,
  data?: any,        // Dados retornados
  id?: string,       // ID do documento criado
  alreadyExists?: boolean  // Indica se já existia
}

// Erro
{
  success: false,
  error: string      // Mensagem de erro
}
```

---

## ⚙️ Config & Collections

### `config.js`

Inicializa o Firebase com variáveis de ambiente.

```javascript
import { auth, db } from "@/services/firebase/config";

// Usar no resto da aplicação
const user = auth.currentUser;
const docRef = doc(db, "appointments", id);
```

**Variáveis de Ambiente Necessárias:**
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

### `collections.js`

#### **COLLECTIONS**

Constantes para nomes de coleções.

```javascript
import { COLLECTIONS } from "@/services/firebase/collections";

const ref = collection(db, COLLECTIONS.APPOINTMENTS);
// ➜ collection(db, "appointments")
```

**Coleções Disponíveis:**
- `DOCTORS` - "doctors"
- `PATIENTS` - "patients"
- `AVAILABILITY` - "availability"
- `APPOINTMENTS` - "appointments"

---

#### **getAvailabilityId(doctorId, date)**

Gera ID único para disponibilidade.

```javascript
import { getAvailabilityId } from "@/services/firebase/collections";

getAvailabilityId("doc123", "2026-01-15");
// ➜ "doc123_2026-01-15"
```

**Parâmetros:**
- `doctorId` (string): ID do médico
- `date` (string): Data no formato YYYY-MM-DD

**Retorna:** `string` - ID único

**Vantagens:**
- IDs previsíveis (facilita consultas)
- Evita duplicação de documentos
- Fácil busca por médico + data

---

#### **getPatientId(doctorId, whatsapp)**

Gera ID único para paciente.

```javascript
import { getPatientId } from "@/services/firebase/collections";

getPatientId("doc123", "(11) 98765-4321");
// ➜ "doc123_11987654321"

getPatientId("doc123", "11 9 8765 4321");
// ➜ "doc123_11987654321"
```

**Parâmetros:**
- `doctorId` (string): ID do médico
- `whatsapp` (string): WhatsApp (com ou sem formatação)

**Retorna:** `string` - ID único

**Lógica:**
- Remove caracteres não numéricos
- Garante unicidade por médico + telefone
- Paciente pode ter múltiplos médicos (IDs diferentes)

---

#### **validators**

Validadores reutilizáveis para dados do Firebase.

##### **validators.date(dateStr)**

Valida data no formato YYYY-MM-DD.

```javascript
import { validators } from "@/services/firebase/collections";

validators.date("2026-01-15");  // ➜ true
validators.date("15/01/2026");  // ➜ false (formato errado)
validators.date("2026-13-01");  // ➜ false (mês inválido)
validators.date("2026-02-30");  // ➜ false (dia não existe)
```

**Validações:**
- ✅ Formato YYYY-MM-DD (regex)
- ✅ Data real (não aceita 30/02)
- ✅ Valores numéricos válidos

**Console:** Loga erros em caso de validação falhar

---

##### **validators.time(timeStr)**

Valida horário no formato HH:mm.

```javascript
validators.time("14:30");  // ➜ true
validators.time("23:59");  // ➜ true
validators.time("24:00");  // ➜ false (hora inválida)
validators.time("14:60");  // ➜ false (minuto inválido)
validators.time("14h30");  // ➜ false (formato errado)
```

**Validações:**
- ✅ Formato HH:mm (regex)
- ✅ Hora: 00-23
- ✅ Minuto: 00-59

**Console:** Loga erros em caso de validação falhar

---

##### **validators.whatsapp(whatsappStr)**

Valida número de WhatsApp.

```javascript
validators.whatsapp("11987654321");     // ➜ true (11 dígitos)
validators.whatsapp("1234567890");      // ➜ true (10 dígitos)
validators.whatsapp("123456789012345"); // ➜ true (15 dígitos)
validators.whatsapp("123456789");       // ➜ false (9 dígitos)
validators.whatsapp("1234567890123456"); // ➜ false (16 dígitos)
```

**Validações:**
- ✅ Remove caracteres não numéricos
- ✅ Aceita 10-15 dígitos
- ✅ Suporta WhatsApp internacional

**Console:** Loga erros em caso de validação falhar

---

## 🔐 Auth Service

### **registerUser(email, password)**

Cria novo usuário e envia email de verificação.

```javascript
import { registerUser } from "@/services/firebase";

const result = await registerUser("user@example.com", "SenhaForte@123");

if (result.success) {
  console.log("Usuário criado:", result.user.uid);
  console.log("Email de verificação enviado!");
} else {
  console.error(result.message);
  // ➜ "Este email já está cadastrado"
}
```

**Parâmetros:**
- `email` (string): Email do usuário
- `password` (string): Senha (mínimo 6 caracteres)

**Retorna:**
```typescript
// Sucesso
{
  success: true,
  user: User  // Firebase User object
}

// Erro
{
  success: false,
  error: string,    // Firebase error code
  message: string   // Mensagem em português
}
```

**Comportamento:**
- Cria usuário no Firebase Auth
- Envia email de verificação automaticamente
- Não cria documento em `doctors` (fazer separadamente)

---

### **loginUser(email, password)**

Autentica usuário existente.

```javascript
import { loginUser } from "@/services/firebase";

const result = await loginUser("user@example.com", "senha123");

if (result.success) {
  console.log("Login bem-sucedido:", result.user.email);
  console.log("Verificado:", result.user.emailVerified);
} else {
  console.error(result.message);
  // ➜ "Senha incorreta"
}
```

**Parâmetros:**
- `email` (string): Email do usuário
- `password` (string): Senha

**Retorna:** Mesmo padrão de `registerUser`

**Mensagens de Erro:**
- `auth/user-not-found` → "Usuário não encontrado"
- `auth/wrong-password` → "Senha incorreta"
- `auth/invalid-email` → "Email inválido"

---

### **logoutUser()**

Desloga o usuário atual.

```javascript
import { logoutUser } from "@/services/firebase";

const result = await logoutUser();

if (result.success) {
  console.log("Logout realizado");
  // Redirecionar para login
}
```

**Retorna:**
```typescript
{ success: boolean, error?: string }
```

---

### **resetPassword(email)**

Envia email de redefinição de senha.

```javascript
import { resetPassword } from "@/services/firebase";

const result = await resetPassword("user@example.com");

if (result.success) {
  alert("Email de recuperação enviado!");
}
```

**Parâmetros:**
- `email` (string): Email cadastrado

**Retorna:** `{ success: boolean, error?: string }`

---

## 👨‍⚕️ Doctor Service

### **createDoctor({ uid, name, email, whatsapp })**

Cria documento do médico após registro.

```javascript
import { createDoctor } from "@/services/firebase";

// Após registerUser
const result = await createDoctor({
  uid: user.uid,
  name: "Dr. João Silva",
  email: "joao@example.com",
  whatsapp: "11987654321"
});

if (result.success) {
  console.log("Médico criado com slug único!");
}
```

**Parâmetros:**
```typescript
{
  uid: string,       // Firebase Auth UID
  name: string,      // Nome completo
  email: string,     // Email
  whatsapp: string   // WhatsApp (com ou sem formatação)
}
```

**Campos Criados Automaticamente:**
```javascript
{
  uid: "firebase_uid",
  name: "Dr. João Silva",
  email: "joao@example.com",
  whatsapp: "11987654321",
  slug: "dr-joao-silva",        // Gerado automaticamente
  plan: "free",
  patientLimit: 10,
  defaultValueSchedule: 0,
  whatsappConfig: {
    intro: "Olá",
    body: "Sua sessão está agendada",
    footer: "Caso não possa comparecer, avise com antecedência.",
    showValue: true
  },
  createdAt: serverTimestamp()
}
```

**Geração de Slug:**
```javascript
"Dr. João Silva" → "dr-joao-silva"
"Dr. João Silva" (já existe) → "dr-joao-silva-2"
"Dr. João Silva" (já existe 2) → "dr-joao-silva-3"
```

**Retorna:** `{ success: boolean, error?: string }`


---

### **getDoctor(doctorId)**

Busca médico por ID.

```javascript
import { getDoctor } from "@/services/firebase";

const result = await getDoctor("doc123");

if (result.success) {
  console.log(result.data);
  // ➜ { id: "doc123", name: "Dr. João", slug: "dr-joao", ... }
}
```

**Parâmetros:**
- `doctorId` (string): UID do Firebase Auth

**Retorna:**
```typescript
{
  success: true,
  data: {
    id: string,
    uid: string,
    name: string,
    email: string,
    whatsapp: string,
    slug: string,
    plan: string,
    patientLimit: number,
    defaultValueSchedule: number,
    whatsappConfig: object,
    createdAt: Timestamp
  }
}
```

---

### **getDoctorBySlug(slug)**

Busca médico por slug (para agenda pública).

```javascript
import { getDoctorBySlug } from "@/services/firebase";

const result = await getDoctorBySlug("dr-joao-silva");

if (result.success) {
  console.log("Médico encontrado:", result.data.name);
} else {
  console.log("Médico não encontrado");
}
```

**Parâmetros:**
- `slug` (string): Slug único do médico

**Retorna:** Mesmo padrão de `getDoctor`

**Comportamento:**
- Usa query no Firestore (índice necessário)
- Avisa no console se encontrar slug duplicado
- Retorna o primeiro resultado

---

### **updateDoctor(doctorId, data)**

Atualiza dados do médico.

```javascript
import { updateDoctor } from "@/services/firebase";

await updateDoctor("doc123", {
  name: "Dr. João Carlos Silva",
  defaultValueSchedule: 200,
  whatsappConfig: {
    intro: "Olá!",
    body: "Sua consulta está confirmada",
    footer: "Nos vemos em breve",
    showValue: false
  }
});
```

**Campos Permitidos:**
- `name` (string)
- `whatsapp` (string)
- `defaultValueSchedule` (number)
- `whatsappConfig` (object)
- `patientLimit` (number)

**Validações:**
- `whatsappConfig.showValue` deve ser boolean
- Apenas campos permitidos são atualizados
- Adiciona `updatedAt` automaticamente

**Retorna:** `{ success: boolean, error?: string }`

---

## 👤 Patient Service

### **createPatient(doctorId, patientData)**

Cria paciente (apenas se não existir).

```javascript
import { createPatient } from "@/services/firebase";

const result = await createPatient("doc123", {
  name: "João Silva",
  whatsapp: "11987654321",
  referenceName: "João",
  price: 150,
  status: "active"
});

if (result.success) {
  if (result.alreadyExists) {
    console.log("Paciente já existia:", result.id);
  } else {
    console.log("Paciente criado:", result.id);
  }
}
```

**Parâmetros:**
```typescript
doctorId: string
patientData: {
  name: string,           // Obrigatório
  whatsapp: string,       // Obrigatório
  referenceName?: string, // Opcional
  price?: number,         // Opcional (default: 0)
  status?: string,        // Opcional (default: "pending")
  createdAt?: Date        // Opcional
}
```

**Retorna:**
```typescript
{
  success: true,
  id: string,                // ID gerado (doctorId_whatsapp)
  alreadyExists: boolean     // true = não sobrescreveu
}
```

**Comportamento:**
- 🔒 **NÃO sobrescreve** paciente existente
- ID gerado: `doctorId_whatsappLimpo`
- Sanitiza nome (trim)
- Se `createdAt` não fornecido, usa `new Date()`

---

### **getPatient(doctorId, whatsapp)**

Busca paciente específico.

```javascript
import { getPatient } from "@/services/firebase";

const result = await getPatient("doc123", "11987654321");

if (result.success) {
  console.log(result.data);
  // ➜ { id: "doc123_11987654321", name: "João", ... }
} else {
  console.log("Paciente não encontrado");
}
```

**Parâmetros:**
- `doctorId` (string)
- `whatsapp` (string): Com ou sem formatação

**Retorna:**
```typescript
{
  success: true,
  data: {
    id: string,
    doctorId: string,
    name: string,
    whatsapp: string,
    referenceName: string | null,
    price: number,
    status: string,
    createdAt: Date
  }
}
```

---

### **getPatients(doctorId)**

Lista todos os pacientes de um médico.

```javascript
import { getPatients } from "@/services/firebase";

const result = await getPatients("doc123");

if (result.success) {
  result.data.forEach(patient => {
    console.log(`${patient.name} - R$ ${patient.price}`);
  });
}
```

**Parâmetros:**
- `doctorId` (string)

**Retorna:**
```typescript
{
  success: true,
  data: Patient[]
}
```

**Uso Comum:**
```javascript
// Para criar mapa de preços
const { data: patients } = await getPatients(doctorId);
const priceMap = {};
patients.forEach(p => {
  priceMap[p.whatsapp] = p.price;
});
```

---

### **updatePatient(doctorId, whatsapp, data)**

Atualiza dados do paciente.

```javascript
import { updatePatient } from "@/services/firebase";

await updatePatient("doc123", "11987654321", {
  referenceName: "João Carlos",
  price: 200,
  status: "active"
});
```

**Campos Permitidos:**
- `name` (string)
- `referenceName` (string)
- `price` (number)
- `status` (string)

**Retorna:** `{ success: boolean, error?: string }`

---

## 📅 Appointment Service

### **createAppointment(data)**

Cria novo agendamento.

```javascript
import { createAppointment } from "@/services/firebase";

const result = await createAppointment({
  doctorId: "doc123",
  patientId: "doc123_11987654321",
  patientName: "João Silva",
  patientWhatsapp: "11987654321",
  date: "2026-01-15",
  time: "14:00",
  value: 150,
  status: "Confirmado"  // Opcional (default: "Pendente")
});

if (result.success) {
  console.log("Agendamento criado:", result.appointmentId);
}
```

**Campos Obrigatórios:**
```typescript
{
  doctorId: string,
  patientId: string,
  patientName: string,
  patientWhatsapp: string,
  date: string,          // YYYY-MM-DD
  time: string,          // HH:mm
  value?: number,        // Default: 0
  status?: string        // Default: "Pendente"
}
```

**Validações:**
- ✅ Todos os campos obrigatórios presentes
- ✅ `date` no formato YYYY-MM-DD (validators.date)
- ✅ `time` no formato HH:mm (validators.time)
- ✅ `value` convertido para número

**Retorna:**
```typescript
{
  success: true,
  appointmentId: string  // ID gerado automaticamente
}
```

**Console:** Loga dados recebidos e validações detalhadas

---

### **updateAppointment(appointmentId, data)**

Atualiza agendamento existente.

```javascript
import { updateAppointment } from "@/services/firebase";

await updateAppointment("appt123", {
  date: "2026-01-20",
  time: "15:00",
  status: "Confirmado",
  value: 200
});
```

**Campos Permitidos:**
- `date` (string): YYYY-MM-DD
- `time` (string): HH:mm
- `value` (number)
- `status` (string)
- `patientName` (string)

**Validações:**
- Valida formato de `date` se fornecido
- Valida formato de `time` se fornecido
- Adiciona `updatedAt` automaticamente

**Retorna:** `{ success: boolean, error?: string }`

---

### **deleteAppointment(appointmentId)**

Deleta agendamento.

```javascript
import { deleteAppointment } from "@/services/firebase";

const result = await deleteAppointment("appt123");

if (result.success) {
  console.log("Agendamento removido");
}
```

**Parâmetros:**
- `appointmentId` (string)

**Retorna:** `{ success: boolean, error?: string }`

---

### **getAppointmentsByDoctor(doctorId)**

Lista todos os agendamentos do médico.

```javascript
import { getAppointmentsByDoctor } from "@/services/firebase";

const result = await getAppointmentsByDoctor("doc123");

if (result.success) {
  console.log(`Total: ${result.data.length} agendamentos`);
}
```

**Retorna:**
```typescript
{
  success: true,
  data: Appointment[]
}
```

---

### **getAppointmentsByDate(doctorId, date)**

Lista agendamentos de um dia específico.

```javascript
import { getAppointmentsByDate } from "@/services/firebase";

const result = await getAppointmentsByDate("doc123", "2026-01-15");

if (result.success) {
  result.data.forEach(appt => {
    console.log(`${appt.time} - ${appt.patientName}`);
  });
}
```

**Parâmetros:**
- `doctorId` (string)
- `date` (string): YYYY-MM-DD

**Validações:**
- Valida formato de data

**Retorna:** `{ success: true, data: Appointment[] }`

---

### **getAppointmentsByPatient(doctorId, patientId)**

Lista agendamentos de um paciente.

```javascript
import { getAppointmentsByPatient } from "@/services/firebase";

const result = await getAppointmentsByPatient(
  "doc123",
  "doc123_11987654321"
);

if (result.success) {
  console.log(`Histórico: ${result.data.length} consultas`);
}
```

**Retorna:** `{ success: true, data: Appointment[] }`

---

## 🗓️ Availability Service

### **saveAvailability(doctorId, date, slot)**

Adiciona um horário à disponibilidade.

```javascript
import { saveAvailability } from "@/services/firebase";

const result = await saveAvailability("doc123", "2026-01-15", "14:00");

if (result.success) {
  console.log("Horário adicionado!");
}
```

**Parâmetros:**
- `doctorId` (string)
- `date` (string): YYYY-MM-DD
- `slot` (string): HH:mm

**Validações:**
- Valida formato de data
- Valida formato de horário

**Comportamento:**
- Se dia não existe: cria documento com `slots: ["14:00"]`
- Se dia existe: adiciona slot ao array (sem duplicar)
- Ordena slots automaticamente

**ID do Documento:** `doctorId_date` (ex: `doc123_2026-01-15`)

---

### **removeAvailability(doctorId, date, slot)**

Remove um horário da disponibilidade.

```javascript
import { removeAvailability } from "@/services/firebase";

const result = await removeAvailability("doc123", "2026-01-15", "14:00");

if (result.success) {
  console.log("Horário removido!");
}
```

**Parâmetros:**
- `doctorId` (string)
- `date` (string): YYYY-MM-DD
- `slot` (string): HH:mm

**Comportamento:**
- Remove slot do array (usa `arrayRemove`)
- Se array ficar vazio: deleta o documento inteiro
- Se documento não existe: lança erro

---

### **getAvailability(doctorId)**

Lista toda a disponibilidade do médico.

```javascript
import { getAvailability } from "@/services/firebase";

const result = await getAvailability("doc123");

if (result.success) {
  result.data.forEach(day => {
    console.log(`${day.date}: ${day.slots.join(", ")}`);
  });
}
```

**Retorna:**
```typescript
{
  success: true,
  data: [
    {
      id: "doc123_2026-01-15",
      doctorId: "doc123",
      date: "2026-01-15",
      slots: ["08:00", "09:00", "10:00"]
    },
    ...
  ]
}
```

---

### **setDayAvailability(doctorId, date, slots)**

Define todos os horários de um dia (substitui existentes).

```javascript
import { setDayAvailability } from "@/services/firebase";

// Define horários do dia
await setDayAvailability("doc123", "2026-01-15", [
  "08:00", "09:00", "10:00", "14:00", "15:00"
]);

// Remove todos os horários (deleta documento)
await setDayAvailability("doc123", "2026-01-15", []);
```

**Parâmetros:**
- `doctorId` (string)
- `date` (string): YYYY-MM-DD
- `slots` (string[]): Array de horários HH:mm

**Validações:**
- Valida formato de data
- Valida formato de cada horário

**Comportamento:**
- `slots` vazio: deleta documento
- `slots` com valores: substitui todos os horários
- Remove duplicatas automaticamente
- Ordena slots automaticamente

---

## 📧 Email Service

### **sendAppointmentEmail(data)**

Envia email de notificação ao médico.

```javascript
import { sendAppointmentEmail } from "@/services/api/email.service";

await sendAppointmentEmail({
  doctor: {
    name: "Dr. João Silva",
    email: "joao@example.com"
  },
  patientName: "Maria Santos",
  whatsapp: "11987654321",
  date: "15/01/2026",
  time: "14:00",
  value: 150
});
```

**Parâmetros:**
```typescript
{
  doctor: {
    name: string,
    email: string
  },
  patientName: string,
  whatsapp: string,
  date: string,        // Formato DD/MM/YYYY (display)
  time: string,        // Formato HH:mm
  value: number
}
```

**Comportamento:**
- Envia email via Google Apps Script
- Formato text/plain + HTML
- Não quebra fluxo de agendamento em caso de erro
- Loga erros no console

**⚠️ Configuração Necessária:**
```env
VITE_APPS_SCRIPT_URL=https://script.google.com/...
```

---

### 🟡 **Melhorias Recomendadas**

#### 1. **Adicionar Transaction para Appointments**

```javascript
// ANTES
export async function createAppointment(data) {
  await setDoc(newAppointmentRef, {...});
}

// DEPOIS
export async function createAppointment(data) {
  // Verifica se slot está disponível E cria appointment
  // em uma única transação atômica
  const batch = writeBatch(db);
  // ... lógica de validação
  await batch.commit();
}
```

#### 2. **Adicionar Soft Delete**

```javascript
export async function deleteAppointment(appointmentId) {
  // Ao invés de deletar, marcar como cancelado
  await updateDoc(appointmentRef, {
    status: "Cancelado",
    canceledAt: serverTimestamp()
  });
}
```

#### 3. **Adicionar Paginação**

```javascript
export async function getAppointmentsByDoctor(
  doctorId,
  options = { limit: 100, startAfter: null }
) {
  let q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where("doctorId", "==", doctorId),
    limit(options.limit)
  );

  if (options.startAfter) {
    q = query(q, startAfter(options.startAfter));
  }

  // ...
}
```

#### 4. **Adicionar Retry Logic**

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

#### 5. **Melhorar Error Handling**

```javascript
// ANTES
} catch (error) {
  console.error("createAppointment error:", error);
  return { success: false, error: error.message };
}

// DEPOIS
} catch (error) {
  console.error("createAppointment error:", error);

  // Mapear erros do Firebase para mensagens amigáveis
  const errorMessages = {
    "permission-denied": "Sem permissão para esta operação",
    "not-found": "Documento não encontrado",
    "already-exists": "Documento já existe",
    "unavailable": "Serviço temporariamente indisponível"
  };

  return {
    success: false,
    error: errorMessages[error.code] || error.message
  };
}
```

#### 6. **Adicionar Validação de Conflito de Horários**

```javascript
export async function createAppointment(data) {
  // Verificar se slot está disponível ANTES de criar
  const existingAppt = await getAppointmentsByDate(data.doctorId, data.date);

  if (existingAppt.success) {
    const conflict = existingAppt.data.find(a => a.time === data.time);
    if (conflict) {
      return {
        success: false,
        error: "Este horário já está agendado"
      };
    }
  }

  // Prosseguir com criação...
}
```

#### 7. **Adicionar Índices no Firestore**

Criar arquivo `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "doctorId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "doctorId", "order": "ASCENDING" },
        { "fieldPath": "patientId", "order": "ASCENDING" }
      ]
    }
  ]
}
```

#### 8. **Adicionar Cache Local**

```javascript
const cache = new Map();

export async function getDoctor(doctorId) {
  // Verificar cache
  if (cache.has(`doctor_${doctorId}`)) {
    return cache.get(`doctor_${doctorId}`);
  }

  const result = await getDoc(doc(db, COLLECTIONS.DOCTORS, doctorId));

  // Armazenar em cache por 5 minutos
  if (result.exists()) {
    const data = { success: true, data: { id: result.id, ...result.data() } };
    cache.set(`doctor_${doctorId}`, data);
    setTimeout(() => cache.delete(`doctor_${doctorId}`), 5 * 60 * 1000);
    return data;
  }

  return { success: false, error: "Médico não encontrado" };
}
```

---

## 📖 Guia de Uso Completo

### Fluxo de Registro e Login

```javascript
// 1. Registrar usuário
const authResult = await registerUser("joao@example.com", "Senha@123");

if (authResult.success) {
  // 2. Criar documento do médico
  await createDoctor({
    uid: authResult.user.uid,
    name: "Dr. João Silva",
    email: authResult.user.email,
    whatsapp: "11987654321"
  });

  // 3. Redirecionar para verificar email
  navigate("/verify-email");
}

// Login
const loginResult = await loginUser("joao@example.com", "Senha@123");

if (loginResult.success) {
  // Buscar dados do médico
  const doctorResult = await getDoctor(loginResult.user.uid);

  if (doctorResult.success) {
    // Armazenar no contexto/estado
    setDoctor(doctorResult.data);
    navigate("/dashboard");
  }
}
```

### Fluxo de Agendamento Público

```javascript
// 1. Buscar médico por slug
const doctorResult = await getDoctorBySlug("dr-joao-silva");

if (!doctorResult.success) {
  return <NotFound />;
}

const doctor = doctorResult.data;

// 2. Buscar disponibilidade
const availResult = await getAvailability(doctor.id);
const availability = availResult.data;

// 3. Buscar agendamentos existentes
const apptsResult = await getAppointmentsByDoctor(doctor.id);
const appointments = apptsResult.data;

// 4. Filtrar slots disponíveis
const freeSlots = filterAvailableSlots(availability, appointments);

// 5. Usuário seleciona slot e preenche dados
const appointmentData = {
  doctorId: doctor.id,
  patientId: `${doctor.id}_${cleanWhatsapp}`,
  patientName: "Maria Santos",
  patientWhatsapp: cleanWhatsapp,
  date: "2026-01-15",
  time: "14:00",
  value: doctor.defaultValueSchedule,
  status: "Pendente"
};

// 6. Criar agendamento
const result = await createAppointment(appointmentData);

if (result.success) {
  // 7. Enviar email (opcional)
  await sendAppointmentEmail({
    doctor,
    patientName: appointmentData.patientName,
    whatsapp: appointmentData.patientWhatsapp,
    date: formatDate(appointmentData.date),
    time: appointmentData.time,
    value: appointmentData.value
  });

  // 8. Mostrar sucesso
  alert("Agendamento realizado!");
}
```

### Fluxo de Gerenciamento de Agenda

```javascript
// 1. Adicionar disponibilidade
await saveAvailability("doc123", "2026-01-15", "08:00");
await saveAvailability("doc123", "2026-01-15", "09:00");
await saveAvailability("doc123", "2026-01-15", "10:00");

// OU adicionar vários de uma vez
await setDayAvailability("doc123", "2026-01-15", [
  "08:00", "09:00", "10:00", "14:00", "15:00", "16:00"
]);

// 2. Buscar agendamentos do dia
const result = await getAppointmentsByDate("doc123", "2026-01-15");

// 3. Atualizar status
await updateAppointment(appointmentId, {
  status: "Confirmado"
});

// 4. Cancelar agendamento
await deleteAppointment(appointmentId);

// 5. Remover disponibilidade (se necessário)
await removeAvailability("doc123", "2026-01-15", "10:00");
```

### Fluxo de Gerenciamento de Pacientes

```javascript
// 1. Adicionar paciente manualmente
const result = await createPatient("doc123", {
  name: "João Silva",
  whatsapp: "11987654321",
  referenceName: "João",
  price: 150,
  status: "active"
});

if (result.alreadyExists) {
  console.log("Paciente já existia");
}

// 2. Listar pacientes
const patientsResult = await getPatients("doc123");
const patients = patientsResult.data;

// 3. Criar mapa de preços
const priceMap = {};
patients.forEach(p => {
  priceMap[p.whatsapp] = p.price;
});

// 4. Atualizar paciente
await updatePatient("doc123", "11987654321", {
  price: 200,
  referenceName: "João Carlos"
});

// 5. Buscar histórico de agendamentos
const historyResult = await getAppointmentsByPatient(
  "doc123",
  "doc123_11987654321"
);
```

### Exemplo Completo: Dashboard

```javascript
import { useState, useEffect } from "react";
import {
  getDoctor,
  getAppointmentsByDoctor,
  getAvailability,
  getPatients
} from "@/services/firebase";
import {
  filterAppointments,
  validateAvailability,
  filterAvailableSlots,
  countAvailableSlots,
  calculateAppointmentStats
} from "@/utils/filters";

export function useDashboard(user) {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [priceMap, setPriceMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // 1. Buscar médico
        const doctorResult = await getDoctor(user.uid);
        if (doctorResult.success) {
          setDoctor(doctorResult.data);
        }

        // 2. Buscar appointments
        const apptsResult = await getAppointmentsByDoctor(user.uid);
        if (apptsResult.success) {
          setAppointments(apptsResult.data);
        }

        // 3. Buscar availability
        const availResult = await getAvailability(user.uid);
        if (availResult.success) {
          const validated = validateAvailability(availResult.data, true);
          setAvailability(validated);
        }

        // 4. Buscar pacientes (para preços)
        const patientsResult = await getPatients(user.uid);
        if (patientsResult.success) {
          const prices = {};
          patientsResult.data.forEach(p => {
            prices[p.whatsapp] = p.price;
          });
          setPriceMap(prices);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filtrar appointments do mês atual
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const filteredAppointments = filterAppointments(appointments, {
    selectedMonth: currentMonth,
    selectedYear: currentYear
  });

  // Calcular slots disponíveis
  const availableSlots = filterAvailableSlots(availability, appointments);
  const slotsCount = countAvailableSlots(availableSlots);

  // Calcular estatísticas
  const stats = calculateAppointmentStats(filteredAppointments, priceMap);

  return {
    doctor,
    loading,
    stats: {
      ...stats,
      slotsOpen: slotsCount
    },
    appointments: filteredAppointments,
    availability: availableSlots
  };
}
```

---

## 🎓 Conclusão

### Pontos Fortes
- ✅ Padrão de retorno consistente
- ✅ Validações robustas
- ✅ IDs previsíveis e eficientes
- ✅ Documentação implícita (console.log)
- ✅ Tratamento de erros em todos os métodos
- ✅ Segurança (allowedFields em updates)

### Áreas de Melhoria
- ⚠️ Corrigir bugs identificados
- ⚠️ Adicionar transações para operações críticas
- ⚠️ Implementar paginação para listas grandes
- ⚠️ Adicionar cache local
- ⚠️ Melhorar mensagens de erro
- ⚠️ Adicionar retry logic
- ⚠️ Configurar índices no Firestore

### Estrutura de Dados no Firestore

```
firestore/
├── doctors/
│   └── {uid}/
│       ├── name
│       ├── email
│       ├── whatsapp
│       ├── slug (único)
│       ├── plan
│       ├── patientLimit
│       ├── defaultValueSchedule
│       ├── whatsappConfig {}
│       └── createdAt
│
├── patients/
│   └── {doctorId}_{whatsapp}/
│       ├── doctorId
│       ├── name
│       ├── whatsapp
│       ├── referenceName
│       ├── price
│       ├── status
│       └── createdAt
│
├── availability/
│   └── {doctorId}_{date}/
│       ├── doctorId
│       ├── date (YYYY-MM-DD)
│       └── slots[] (["08:00", "09:00"])
│
└── appointments/
    └── {auto-id}/
        ├── doctorId
        ├── patientId
        ├── patientName
        ├── patientWhatsapp
        ├── date (YYYY-MM-DD)
        ├── time (HH:mm)
        ├── value
        ├── status
        └── createdAt
```

---

**Documentação criada por:** Assistente IA  
**Data:** Janeiro 2026  
**Versão:** 1.0