# 🔧 Documentação Completa - Backend (Firebase Functions)

> **Versão:** 1.0  
> **Última atualização:** Janeiro 2026  
> **Status:** ✅ Completa

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura](#-arquitetura)
3. [Configuração](#-configuração)
4. [Functions de Agendamentos](#-functions-de-agendamentos)
5. [Functions do Stripe](#-functions-do-stripe)
6. [Helpers e Utilitários](#-helpers-e-utilitários)
7. [Segurança](#-segurança)
8. [Deploy e Manutenção](#-deploy-e-manutenção)

---

## 🎯 Visão Geral

O backend do sistema é construído com **Firebase Functions v2**, utilizando TypeScript para garantir type safety e melhor manutenibilidade. As functions são organizadas em módulos temáticos e seguem padrões consistentes de validação, tratamento de erros e logging.

### Funcionalidades Principais

- ✅ **Criação Segura de Agendamentos Públicos** - Validação server-side completa
- ✅ **Validação de Limites de Plano** - Controle de limites mensais para plano FREE
- ✅ **Integração Stripe Completa** - Checkout, cancelamento, reativação e webhooks
- ✅ **Transações Atômicas** - Garantia de consistência de dados
- ✅ **Logging Detalhado** - Rastreamento completo de operações

### Tecnologias

- **Firebase Functions v2** - Serverless functions
- **TypeScript** - Type safety e melhor DX
- **Firebase Admin SDK** - Acesso privilegiado ao Firestore
- **Stripe SDK** - Processamento de pagamentos
- **Firestore** - Banco de dados NoSQL

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
functions/
├── src/
│   ├── index.ts                    # Export central de todas as functions
│   ├── appointments/
│   │   ├── createPublicAppointment.ts    # Criação segura de agendamentos
│   │   └── validateAppointmentLimit.ts   # Validação de limites
│   └── stripe/
│       ├── createCheckoutSession.ts      # Criação de sessão de checkout
│       ├── cancelSubscription.ts          # Cancelamento de assinatura
│       ├── reactivateSubscription.ts     # Reativação de assinatura
│       ├── webhook.ts                     # Processamento de webhooks
│       ├── helpers.ts                     # Funções auxiliares
│       └── types.ts                       # Tipos TypeScript
├── package.json
└── tsconfig.json
```

### Padrões de Design

#### 1. **Callable Functions (v2)**
Todas as functions que precisam de autenticação ou validação de entrada usam `onCall`:

```typescript
export const myFunction = onCall(
  {
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    // Lógica da function
  }
);
```

#### 2. **HTTP Functions (v2)**
Para webhooks externos (Stripe), usa `onRequest`:

```typescript
export const myWebhook = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // Lógica do webhook
  }
);
```

#### 3. **Tratamento de Erros**
Padrão consistente de tratamento de erros:

```typescript
try {
  // Lógica
  return { success: true, data: result };
} catch (error: any) {
  logger.error('Erro na operação', {
    message: error.message,
    context: request.data,
  });
  throw new Error(error.message || 'Erro ao processar');
}
```

#### 4. **Logging**
Uso consistente de logging para debugging e monitoramento:

```typescript
logger.info('Operação realizada', { userId, data });
logger.error('Erro na operação', { message: error.message });
logger.warn('Aviso', { context });
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

#### Secrets (Recomendado)

```bash
# Configurar secrets do Stripe
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

#### Variáveis de Ambiente (Fallback)

Se os secrets não estiverem configurados, as functions usam variáveis de ambiente:

```bash
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
```

### Instalação

```bash
cd functions
npm install
```

### Build

```bash
npm run build
```

### Deploy

```bash
# Deploy de todas as functions
firebase deploy --only functions

# Deploy de uma function específica
firebase deploy --only functions:createPublicAppointment
```

### Logs

```bash
# Ver logs em tempo real
firebase functions:log

# Ver logs de uma function específica
firebase functions:log --only createPublicAppointment
```

---

## 📅 Functions de Agendamentos

### `createPublicAppointment`

**Arquivo:** `functions/src/appointments/createPublicAppointment.ts`

**Tipo:** Callable Function (v2)

**Descrição:** Cria agendamento público de forma segura, validando todos os dados server-side e prevenindo abusos.

#### Parâmetros

```typescript
{
  doctorSlug: string;          // Slug único do médico
  date: string;               // Data no formato YYYY-MM-DD
  time: string;               // Horário no formato HH:mm
  patientName: string;         // Nome do paciente
  patientWhatsapp: string;    // WhatsApp do paciente
  appointmentType?: string;   // 'online' | 'presencial' (opcional)
  location?: string;           // Nome do local (obrigatório se presencial)
}
```

#### Retorno

```typescript
{
  success: true;
  appointmentId: string;
  message: string;
}
```

#### Validações Realizadas

1. **Validação de Entrada**
   - ✅ `doctorSlug` obrigatório e válido
   - ✅ `date` no formato YYYY-MM-DD
   - ✅ `time` no formato HH:mm
   - ✅ `patientName` obrigatório e não vazio
   - ✅ `patientWhatsapp` válido (10-15 dígitos)

2. **Validação de Médico**
   - ✅ Médico existe no Firestore
   - ✅ Slug corresponde a médico válido

3. **Validação de Limite de Plano**
   - ✅ Plano FREE: máximo 10 consultas confirmadas por mês
   - ✅ Plano PRO: sem limite
   - ✅ Conta apenas consultas com status "Confirmado"

4. **Validação de Disponibilidade**
   - ✅ Slot existe na disponibilidade do médico
   - ✅ Suporta slots em formato string ou objeto
   - ✅ Valida que horário está na lista de slots disponíveis

5. **Validação de Conflito**
   - ✅ Verifica se horário já está agendado
   - ✅ Considera apenas status ativos: "Confirmado", "Pendente", "Msg enviada"
   - ✅ Previne double-booking

6. **Validação de Tipo de Atendimento**
   - ✅ Se `appointmentType` fornecido, valida configuração do médico
   - ✅ Modo `disabled`: não permite tipo de atendimento
   - ✅ Modo `fixed`: valida que tipo corresponde ao configurado
   - ✅ Modo `allow_choice`: permite qualquer tipo válido
   - ✅ Se presencial: valida que local existe na lista configurada

#### Cálculo de Valor

```typescript
// Valor padrão baseado no tipo de atendimento
let appointmentValue = appointmentTypeConfig.defaultValueOnline || 0;

if (appointmentType === 'presencial' && location) {
  // Busca valor do local específico
  const selectedLocation = appointmentTypeConfig.locations.find(
    loc => loc.name === location
  );
  appointmentValue = selectedLocation?.defaultValue || 
                    appointmentTypeConfig.defaultValuePresencial || 0;
} else if (appointmentType === 'online') {
  appointmentValue = appointmentTypeConfig.defaultValueOnline || 0;
}
```

#### Criação Atômica

A criação do agendamento usa **transação do Firestore** para garantir atomicidade:

```typescript
await db.runTransaction(async (transaction) => {
  // Re-valida disponibilidade dentro da transação
  const availabilitySnapshot = await transaction.get(availabilityRef);
  if (!availabilitySnapshot.exists) {
    throw new Error('Horário não disponível');
  }

  // Cria agendamento
  transaction.set(appointmentRef, {
    doctorId,
    patientId,
    patientName: patientName.trim(),
    patientWhatsapp: cleanWhatsapp,
    date,
    time,
    value: appointmentValue,
    status: 'Pendente',
    appointmentType: appointmentType || null,
    location: location || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
```

#### Exemplo de Uso

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const createPublicAppointment = httpsCallable(
  functions,
  'createPublicAppointment'
);

const result = await createPublicAppointment({
  doctorSlug: 'dr-joao-silva',
  date: '2026-01-15',
  time: '14:00',
  patientName: 'Maria Santos',
  patientWhatsapp: '(11) 98765-4321',
  appointmentType: 'presencial',
  location: 'Consultório Principal'
});

if (result.data.success) {
  console.log('Agendamento criado:', result.data.appointmentId);
}
```

#### Erros Possíveis

- `"doctorSlug é obrigatório"` - Slug não fornecido
- `"Data inválida. Use formato YYYY-MM-DD"` - Formato de data incorreto
- `"Horário inválido. Use formato HH:mm"` - Formato de horário incorreto
- `"Nome do paciente é obrigatório"` - Nome vazio ou não fornecido
- `"WhatsApp inválido"` - WhatsApp com menos de 10 ou mais de 15 dígitos
- `"Médico não encontrado"` - Slug não corresponde a médico existente
- `"Limite de consultas confirmadas do mês atingido"` - Plano FREE atingiu limite
- `"Horário não disponível"` - Slot não existe na disponibilidade
- `"Este horário já foi agendado"` - Conflito com agendamento existente
- `"Tipo de atendimento não configurado"` - Médico não configurou tipos
- `"Local inválido"` - Local não existe na lista configurada

---

### `validateAppointmentLimit`

**Arquivo:** `functions/src/appointments/validateAppointmentLimit.ts`

**Tipo:** Callable Function (v2)

**Descrição:** Valida se um médico do plano FREE pode criar um novo agendamento, verificando se atingiu o limite mensal.

#### Parâmetros

```typescript
{
  doctorId: string;  // ID do médico (Firebase Auth UID)
}
```

#### Retorno

```typescript
// Plano FREE
{
  allowed: boolean;      // true se pode criar, false se atingiu limite
  count: number;         // Número de consultas confirmadas no mês
  limit: number;        // Limite do plano (10 para FREE)
  plan: 'free';
}

// Plano PRO
{
  allowed: true;
  count: 0;
  limit: 0;
  plan: 'pro';
}
```

#### Lógica de Validação

1. **Busca Dados do Médico**
   - Obtém documento do médico no Firestore
   - Extrai plano (`plan` field)

2. **Plano PRO**
   - Retorna `allowed: true` imediatamente
   - Sem limite de consultas

3. **Plano FREE**
   - Calcula intervalo do mês atual (01/MM/YYYY a 31/MM/YYYY)
   - Busca todas as consultas confirmadas do médico
   - Filtra por data dentro do mês atual
   - Compara quantidade com limite (10)

#### Exemplo de Uso

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const validateAppointmentLimit = httpsCallable(
  functions,
  'validateAppointmentLimit'
);

const result = await validateAppointmentLimit({
  doctorId: user.uid
});

if (result.data.allowed) {
  console.log(`Pode criar. ${result.data.count}/${result.data.limit} consultas este mês`);
} else {
  console.log(`Limite atingido. ${result.data.count}/${result.data.limit} consultas`);
}
```

#### Constantes

```typescript
const FREE_PLAN_MONTHLY_LIMIT = 10;
const APPOINTMENT_STATUS_CONFIRMED = 'Confirmado';
```

---

## 💳 Functions do Stripe

### `createCheckoutSession`

**Arquivo:** `functions/src/stripe/createCheckoutSession.ts`

**Tipo:** Callable Function (v2)

**Descrição:** Cria sessão de checkout no Stripe para assinatura do plano PRO.

#### Parâmetros

```typescript
{
  userId: string;           // ID do usuário (Firebase Auth UID)
  userEmail: string;        // Email do usuário
  priceId: string;          // ID do preço do Stripe (price_xxx)
  successUrl?: string;      // URL de redirecionamento após sucesso
  cancelUrl?: string;       // URL de redirecionamento após cancelamento
}
```

#### Retorno

```typescript
{
  sessionId: string;  // ID da sessão de checkout
  url: string;        // URL para redirecionar o usuário
}
```

#### Comportamento

1. **Validação de Entrada**
   - ✅ `userId`, `userEmail` e `priceId` obrigatórios

2. **Criação da Sessão**
   - Cria sessão no Stripe com modo `subscription`
   - Define `client_reference_id` como `userId`
   - Adiciona `userId` em `metadata`
   - Configura URLs de sucesso e cancelamento

3. **Retorno**
   - Retorna `sessionId` e `url` para redirecionamento

#### Configuração de Secrets

```typescript
// Tenta usar secret do Firebase
let stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');

// Fallback para variável de ambiente
const getStripeSecret = (): string => {
  if (stripeSecretKey) {
    try {
      return stripeSecretKey.value();
    } catch {
      // Fallback
    }
  }
  return process.env.STRIPE_SECRET_KEY || '';
};
```

#### Exemplo de Uso

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const createCheckoutSession = httpsCallable(
  functions,
  'createCheckoutSession'
);

const result = await createCheckoutSession({
  userId: user.uid,
  userEmail: user.email,
  priceId: 'price_1234567890',
  successUrl: `${window.location.origin}/settings?success=true`,
  cancelUrl: `${window.location.origin}/settings?canceled=true`
});

// Redirecionar para checkout
window.location.href = result.data.url;
```

---

### `cancelSubscription`

**Arquivo:** `functions/src/stripe/cancelSubscription.ts`

**Tipo:** Callable Function (v2)

**Descrição:** Cancela assinatura do Stripe no final do período pago (não cancela imediatamente).

#### Parâmetros

```typescript
{
  userId: string;  // ID do usuário
}
```

#### Retorno

```typescript
{
  success: boolean;
  message: string;
}
```

#### Comportamento

1. **Busca Dados do Médico**
   - Obtém documento do médico
   - Extrai `stripeSubscriptionId`

2. **Validação**
   - Verifica se assinatura existe
   - Verifica se `stripeSubscriptionId` está presente

3. **Cancelamento no Stripe**
   - Atualiza assinatura com `cancel_at_period_end: true`
   - Usuário mantém acesso PRO até o final do período

4. **Atualização no Firestore**
   - Atualiza `stripeSubscriptionStatus` para `'cancel_at_period_end'`
   - Salva `subscriptionCancelAt` com timestamp do cancelamento
   - Mantém `plan: 'pro'` até o cancelamento efetivo

#### Exemplo de Uso

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const cancelSubscription = httpsCallable(
  functions,
  'cancelSubscription'
);

const result = await cancelSubscription({
  userId: user.uid
});

if (result.data.success) {
  alert('Assinatura será cancelada no final do período pago');
}
```

---

### `reactivateSubscription`

**Arquivo:** `functions/src/stripe/reactivateSubscription.ts`

**Tipo:** Callable Function (v2)

**Descrição:** Reativa assinatura cancelada, removendo o cancelamento agendado.

#### Parâmetros

```typescript
{
  userId: string;  // ID do usuário
}
```

#### Retorno

```typescript
{
  success: boolean;
  message: string;
}
```

#### Comportamento

1. **Busca Dados do Médico**
   - Obtém documento do médico
   - Extrai `stripeSubscriptionId`

2. **Validação**
   - Verifica se assinatura existe
   - Verifica se está em estado de cancelamento agendado

3. **Reativação no Stripe**
   - Atualiza assinatura com `cancel_at_period_end: false`
   - Remove cancelamento agendado

4. **Atualização no Firestore**
   - Atualiza `stripeSubscriptionStatus` para `'active'`
   - Remove `subscriptionCancelAt` (define como `null`)
   - Garante `plan: 'pro'`

#### Exemplo de Uso

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const reactivateSubscription = httpsCallable(
  functions,
  'reactivateSubscription'
);

const result = await reactivateSubscription({
  userId: user.uid
});

if (result.data.success) {
  alert('Assinatura reativada com sucesso!');
}
```

---

### `stripeWebhook`

**Arquivo:** `functions/src/stripe/webhook.ts`

**Tipo:** HTTP Function (v2)

**Descrição:** Processa eventos do Stripe via webhook, sincronizando status de assinaturas com o Firestore.

#### Endpoint

```
POST https://[region]-[project].cloudfunctions.net/stripeWebhook
```

#### Segurança

1. **Verificação de Assinatura**
   - Valida `stripe-signature` header
   - Usa `STRIPE_WEBHOOK_SECRET` para verificar autenticidade
   - Previne falsificação de eventos

2. **Processamento de Body**
   - Suporta `rawBody` (padrão Firebase Functions v2)
   - Fallback para `body` como string ou Buffer

#### Eventos Tratados

##### `checkout.session.completed`

Quando checkout é completado com sucesso.

**Ações:**
- Atualiza `plan` para `'pro'`
- Salva `stripeCustomerId` e `stripeSubscriptionId`
- Define `stripeSubscriptionStatus` como `'active'`

##### `customer.subscription.created` / `customer.subscription.updated`

Quando assinatura é criada ou atualizada.

**Ações:**
- Se `cancel_at_period_end`: mantém PRO, salva data de cancelamento
- Se `active`: define plano como PRO
- Se outro status: define plano como `'free'`

##### `customer.subscription.deleted`

Quando assinatura é deletada.

**Ações:**
- Define `plan` como `'free'`
- Remove `stripeSubscriptionId`
- Define `stripeSubscriptionStatus` como `'canceled'`

##### `invoice.payment_succeeded`

Quando pagamento é bem-sucedido.

**Ações:**
- Atualiza `lastPaymentAt`
- Garante `plan` como PRO
- Atualiza status da assinatura

##### `invoice.payment_failed`

Quando pagamento falha.

**Ações:**
- Apenas loga warning
- Não altera plano imediatamente

#### Configuração no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicione endpoint: `https://[region]-[project].cloudfunctions.net/stripeWebhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copie o **Signing secret** (começa com `whsec_`)

#### Exemplo de Log

```typescript
logger.info('Webhook recebido', { type: event.type });
logger.info('Plano atualizado', { userId, plan: 'pro' });
logger.warn('Pagamento falhou', { userId, invoiceId });
```

---

## 🛠️ Helpers e Utilitários

### `helpers.ts`

**Arquivo:** `functions/src/stripe/helpers.ts`

Funções auxiliares para operações com Stripe e Firestore.

#### `updateDoctorPlan(userId, data)`

Atualiza dados do plano do médico no Firestore.

```typescript
await updateDoctorPlan(userId, {
  plan: 'pro',
  stripeSubscriptionStatus: 'active',
  planUpdatedAt: serverTimestamp()
});
```

**Parâmetros:**
- `userId` (string): ID do usuário
- `data` (Partial<DoctorPlanData>): Dados a atualizar

**Comportamento:**
- Atualiza documento do médico
- Adiciona `planUpdatedAt` automaticamente
- Loga operação

#### `getUserIdFromEvent(event)`

Extrai `userId` de um evento do Stripe.

**Ordem de busca:**
1. `client_reference_id`
2. `metadata.userId`

**Retorna:** `string | null`

#### `getSubscriptionId(subscriptionRef)`

Extrai `subscriptionId` de uma referência do Stripe.

**Suporta:**
- String direta: `"sub_123"`
- Objeto com `id`: `{ id: "sub_123" }`
- `null` ou `undefined`

**Retorna:** `string | null`

---

### `types.ts`

**Arquivo:** `functions/src/stripe/types.ts`

Tipos TypeScript para integração Stripe.

```typescript
export interface DoctorPlanData {
  plan: 'free' | 'pro';
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeSubscriptionStatus?: string | null;
  subscriptionCancelAt?: admin.firestore.Timestamp | null;
  planUpdatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
  lastPaymentAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

export type PlanStatus = 'free' | 'pro';

export type SubscriptionStatus = 
  | 'active' 
  | 'cancel_at_period_end' 
  | 'canceled' 
  | 'past_due' 
  | 'unpaid';
```

---

## 🔒 Segurança

### Validação de Entrada

Todas as functions validam entrada rigorosamente:

```typescript
if (!doctorSlug || typeof doctorSlug !== 'string') {
  throw new Error('doctorSlug é obrigatório');
}

if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  throw new Error('Data inválida. Use formato YYYY-MM-DD');
}
```

### Validação de Webhook

Webhooks do Stripe são validados usando assinatura:

```typescript
const sig = req.headers['stripe-signature'] as string;
event = stripe.webhooks.constructEvent(bodyString, sig, getWebhookSecret());
```

### Secrets Management

Secrets são gerenciados via Firebase Secret Manager:

```typescript
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
```

### Transações Atômicas

Operações críticas usam transações do Firestore:

```typescript
await db.runTransaction(async (transaction) => {
  // Validações e escritas atômicas
});
```

### Logging Seguro

Logs não expõem dados sensíveis:

```typescript
logger.info('Operação realizada', {
  userId,  // OK
  // password: 'xxx'  // NUNCA
});
```

---

## 🚀 Deploy e Manutenção

### Deploy Inicial

```bash
# 1. Configurar secrets
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# 2. Build
cd functions
npm run build

# 3. Deploy
firebase deploy --only functions
```

### Deploy Incremental

```bash
# Deploy de uma function específica
firebase deploy --only functions:createPublicAppointment

# Deploy de todas as functions do Stripe
firebase deploy --only functions:createCheckoutSession,functions:stripeWebhook
```

### Monitoramento

```bash
# Ver logs em tempo real
firebase functions:log

# Ver logs de uma function
firebase functions:log --only createPublicAppointment

# Ver logs com filtro
firebase functions:log --only createPublicAppointment | grep "ERROR"
```

### Troubleshooting

#### Erro: "Secret não encontrado"

```bash
# Verificar secrets configurados
firebase functions:secrets:access STRIPE_SECRET_KEY

# Reconfigurar secret
firebase functions:secrets:set STRIPE_SECRET_KEY
```

#### Erro: "Webhook signature inválida"

1. Verificar `STRIPE_WEBHOOK_SECRET` no Stripe Dashboard
2. Reconfigurar secret: `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`
3. Verificar se URL do webhook está correta

#### Erro: "Transação falhou"

- Verificar se todas as leituras estão antes das escritas
- Verificar se documentos não foram modificados externamente
- Verificar limites de tamanho da transação

---

## 📊 Métricas e Monitoramento

### Logs Importantes

- ✅ Criação de agendamentos
- ✅ Validações de limite
- ✅ Checkouts do Stripe
- ✅ Webhooks processados
- ❌ Erros e exceções

### Métricas Recomendadas

- Taxa de sucesso de agendamentos
- Tempo de resposta das functions
- Taxa de erro por function
- Uso de recursos (CPU, memória)

---

## 🎓 Conclusão

### Pontos Fortes

- ✅ Validação server-side completa
- ✅ Transações atômicas para consistência
- ✅ Logging detalhado para debugging
- ✅ Type safety com TypeScript
- ✅ Segurança robusta (secrets, validação de webhooks)
- ✅ Tratamento de erros consistente

### Áreas de Melhoria

- ⚠️ Adicionar testes unitários
- ⚠️ Implementar retry logic para operações críticas
- ⚠️ Adicionar rate limiting
- ⚠️ Implementar cache para consultas frequentes
- ⚠️ Adicionar métricas e alertas

---

**Documentação criada por:** Assistente IA  
**Data:** Janeiro 2026  
**Versão:** 1.0
