# ADR: Flujo Anónimo → Free → Premium + Suscripciones con Mercado Pago

## Estado

**Aceptado** — 2026-03-30 (implementación completa: T-BE-01 → T-QA-05)

---

## Contexto

Auguria necesita monetizar mediante suscripciones Premium mensuales y pagos únicos para servicios holísticos de Flavia. El proyecto ya tiene:

- **MercadoPago Checkout Pro** funcionando para pagos únicos de servicios holísticos (ARS)
- **User.plan** con enum `anonymous | free | premium` y campos `subscriptionStatus`, `planStartedAt`, `planExpiresAt`
- **Plan entity** con límites configurables desde admin (dailyCardLimit, tarotReadingsLimit, etc.)
- **Feature gating completo**: `useUserCapabilities()` hook, `PremiumGuard`, `UsageLimit` entity
- **Webhook controller** en `POST /api/v1/webhooks/mercadopago` procesando pagos de servicios holísticos
- **Campo `stripeCustomerId`** en User — nunca utilizado, se depreca

**Decisiones fijas:**
1. Todo con Mercado Pago (no Stripe)
2. Moneda: ARS para todo
3. Activación instantánea post-pago sin recarga de página

---

## Decisión 1: Suscripciones Recurrentes con Mercado Pago

### Modelo elegido: Preapproval (Suscripciones MP)

Se usará la **API de Preapproval** de Mercado Pago para suscripciones recurrentes. Esta API permite crear planes con cobro automático mensual.

### Plan en MP: creado al deployar (seed), no dinámicamente

Se crea **un único plan de preapproval** en MP durante el seed/deploy inicial. Razones:

- Solo hay un plan premium (no hay silver/gold/enterprise)
- El precio se cambia pocas veces (requiere crear nuevo plan en MP cuando cambie)
- Simplifica el flujo: el backend solo necesita el `preapproval_plan_id` como variable de entorno

**Variable de entorno nueva:** `MP_PREAPPROVAL_PLAN_ID`

### Convivencia de webhooks: endpoint unificado con routing por tipo

El webhook controller actual (`POST /api/v1/webhooks/mercadopago`) se **extiende** para manejar ambos tipos de notificación. El routing interno se hace por el campo `type` del payload:

```
type: "payment"                    → flujo existente (servicios holísticos)
type: "subscription_preapproval"   → flujo nuevo (suscripciones premium)
```

**Justificación:** Un solo endpoint simplifica la configuración en MP. El `notification_url` se setea al crear cada preapproval (no en el panel de MP), por lo que ambos flujos pueden apuntar al mismo endpoint. La validación de firma con `x-signature` ya está implementada y aplica a ambos tipos.

**Alternativa descartada:** Crear `/webhooks/mercadopago/subscriptions` separado. Añade complejidad sin beneficio — el tipo de notificación ya viene en el payload.

### Cambios en schema de base de datos

**Nuevos campos en tabla `users`** (migración):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `mpPreapprovalId` | `varchar(100) nullable` | ID de la suscripción en MP (reemplaza a `stripeCustomerId`) |
| `mpCustomerId` | `varchar(100) nullable` | ID del pagador en MP |

**Campos existentes que se reutilizan (sin cambios):**
- `plan` — se actualiza a `premium` al activar suscripción
- `subscriptionStatus` — `active`, `cancelled`, `expired`
- `planStartedAt` — fecha de activación
- `planExpiresAt` — fin del período actual (se actualiza cada cobro)

**Campo a deprecar:**
- `stripeCustomerId` — se marca como deprecated en el entity, se remueve en migración futura

**NO se crea tabla nueva de suscripciones.** Razón: hay un solo plan premium, la relación es 1:1 con User. Los campos en User son suficientes. Si en el futuro se necesitan múltiples planes, se puede extraer a tabla separada.

### Flujo de suscripción MP

```
1. Frontend llama POST /api/v1/subscriptions/create-preapproval
2. Backend crea preapproval en MP con:
   - preapproval_plan_id (env var)
   - payer_email (user.email)
   - external_reference: "sub_{userId}"
   - notification_url: "{BACKEND_URL}/api/v1/webhooks/mercadopago"
   - back_url: "{FRONTEND_URL}/premium/activacion?status={status}"
3. Backend devuelve { initPoint: string } (URL de MP Checkout)
4. Frontend redirige al usuario a initPoint
5. Usuario paga en MP → MP redirige a back_url
6. MP envía webhook → backend procesa:
   a. Fetch preapproval por ID
   b. Valida external_reference (extrae userId)
   c. Si status=authorized: activa plan premium
   d. Si status=cancelled/paused: desactiva
```

### Manejo de cancelación, expiración y reintentos

| Evento MP | Acción backend |
|-----------|---------------|
| `authorized` | `plan=premium`, `subscriptionStatus=active`, `planExpiresAt=endDate` |
| `paused` (reintento de cobro fallido) | Sin cambio inmediato. MP reintenta 3 veces en 10 días. `subscriptionStatus` permanece `active` |
| `cancelled` (usuario cancela) | `subscriptionStatus=cancelled`. Plan permanece `premium` hasta `planExpiresAt` |
| `cancelled` (cobro fallido definitivo) | `subscriptionStatus=expired`, `plan=free` cuando `planExpiresAt` pasa |

**Regla clave:** Al cancelar, el usuario mantiene acceso premium hasta el fin del período ya pago. Un CRON job diario revisa `planExpiresAt` para degradar usuarios expirados.

### CRON: degradación automática de planes expirados

```
Frecuencia: cada 6 horas
Lógica:
  WHERE plan = 'premium'
    AND subscriptionStatus IN ('cancelled', 'expired')
    AND planExpiresAt < NOW()
  → SET plan = 'free', subscriptionStatus = 'expired'
```

Se implementa con `@nestjs/schedule` (ya instalado).

---

## Decisión 2: Flujo de Usuario Anónimo → Free → Premium

### Anónimo → Free (registro)

**Estado actual:** El registro (`POST /auth/register`) crea un usuario con `plan=free` y devuelve tokens JWT + user data. El frontend guarda tokens en localStorage, actualiza Zustand store y limpia React Query cache.

**Cambios necesarios:** Ninguno en el flujo core de registro. Solo se agrega:

1. **Migración de AnonymousUsage**: Al registrarse, el backend busca registros en `anonymous_usage` que coincidan con el `fingerprint` enviado en el body de registro. Si encuentra, vincula el historial anónimo al nuevo userId en `usage_limits`. Esto es **best-effort** (no bloquea registro si falla).

2. **Frontend: enviar fingerprint en registro.** El `RegisterCredentials` ya se envía con `name`, `email`, `password`, `birthDate`. Se agrega campo opcional `fingerprint` para que el backend pueda migrar el uso anónimo.

**¿Qué pasa con el sessionId/fingerprint al registrarse?** El fingerprint se deja de usar una vez que el usuario tiene JWT. Las capabilities pasan a calcularse por userId en vez de fingerprint. El React Query cache se limpia en login/register (ya implementado), por lo que las capabilities se refetchean con el nuevo contexto autenticado.

### Free → Premium (upgrade)

**Flujo paso a paso:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE UPGRADE                             │
│                                                                  │
│  1. Usuario ve CTA de upgrade                                    │
│     ├── Modal contextual (al tocar feature premium bloqueada)    │
│     ├── Página /premium (desde navbar, perfil, o CTA)            │
│     └── Banner en /perfil                                        │
│                                                                  │
│  2. CTA dispara: POST /subscriptions/create-preapproval          │
│     └── Backend crea preapproval en MP                           │
│     └── Devuelve { initPoint: string }                           │
│                                                                  │
│  3. Frontend redirige a initPoint (sale de Auguria → MP)         │
│                                                                  │
│  4. Usuario completa pago en MP                                  │
│                                                                  │
│  5. MP redirige a back_url:                                      │
│     /premium/activacion?preapproval_id=X&status=authorized       │
│                                                                  │
│  6. Página /premium/activacion:                                  │
│     ├── Si status=authorized: muestra "Activando..."             │
│     │   ├── Polling GET /subscriptions/status cada 2s (max 30s)  │
│     │   ├── Cuando plan=premium: actualiza Zustand + invalida    │
│     │   │   capabilities → muestra "¡Premium activado! 🎉"       │
│     │   └── Si timeout: "Estamos procesando tu pago, en breve    │
│     │       se activará tu plan Premium"                         │
│     ├── Si status=pending: muestra "Pago en proceso..."          │
│     └── Si status=failure: muestra "Hubo un problema" + retry    │
│                                                                  │
│  7. Webhook MP (async, puede llegar antes o después del paso 6)  │
│     └── Activa plan premium en DB                                │
└─────────────────────────────────────────────────────────────────┘
```

**¿Dónde se muestra la opción de upgrade?**

| Ubicación | Trigger | Componente |
|-----------|---------|-----------|
| Navbar | Siempre visible para free users | Badge "Premium" o "Upgrade" junto al avatar |
| Página /premium | Link desde navbar, perfil, CTAs | Página standalone con comparación de planes |
| Modal contextual | Al intentar usar feature premium | Modal con beneficios + CTA |
| Perfil (/perfil) | Sección "Mi plan" | Card con plan actual + botón upgrade |
| Feature gates | Cuando `canUse*` es false | Inline prompt con CTA al plan premium |

**Checkout Pro vs Preapproval:** Son APIs completamente separadas en MP. Checkout Pro (`Preference`) se usa para pagos únicos (servicios de Flavia). Preapproval se usa para suscripciones. No hay conflicto — cada una genera su propia URL de checkout.

### Premium → Free (cancelación/expiración)

**Regla: acceso hasta fin de período pago.** Si el usuario cancela el 10 de marzo y pagó hasta el 31 de marzo, mantiene premium hasta el 31.

**Flujo de cancelación:**

```
1. Usuario va a /perfil → sección "Mi plan" → "Cancelar suscripción"
2. Modal de confirmación: "Tu plan Premium seguirá activo hasta {planExpiresAt}"
3. Frontend: POST /subscriptions/cancel
4. Backend:
   a. Llama MP API para cancelar preapproval
   b. Actualiza user.subscriptionStatus = 'cancelled'
   c. NO cambia user.plan (sigue premium hasta expiración)
5. CRON job degrada a free cuando planExpiresAt pasa
```

**Frontend al degradar:**
- El CRON job cambia `plan` en DB
- Próximo `checkAuth()` o refetch de capabilities detecta el cambio
- Zustand store se actualiza con nuevo plan
- React Query invalida capabilities → UI refleja nuevo estado
- No se necesita acción en tiempo real — el polling natural de capabilities (staleTime: 0, refetchOnWindowFocus: true) detecta el cambio

---

## Decisión 3: Activación Instantánea Post-Pago

### Opción elegida: B — Polling con React Query al volver del checkout

**Mecanismo:**

La página `/premium/activacion` (back_url de MP) implementa un polling corto:

```
1. Usuario vuelve de MP con ?status=authorized
2. Página activa refetchInterval de 2 segundos en GET /subscriptions/status
3. Endpoint devuelve { plan, subscriptionStatus, planExpiresAt }
4. Cuando plan === 'premium':
   a. Detiene polling
   b. Actualiza Zustand store (setUser con nuevo plan)
   c. Invalida capabilities query
   d. Muestra animación de éxito
   e. Redirige a /perfil o feature que quería usar (via query param ?redirect=)
5. Si después de 30 segundos no hay cambio:
   a. Detiene polling
   b. Muestra mensaje: "Estamos procesando tu pago. Tu plan Premium se activará automáticamente en unos minutos."
   c. Opción de ir al inicio
```

### Evaluación de alternativas

| Criterio | A: SSE | B: Polling (elegida) | C: Híbrido |
|----------|--------|---------------------|-----------|
| Complejidad | Alta (nuevo endpoint SSE, EventSource en frontend, manejo de reconexión) | Baja (React Query refetchInterval, endpoint REST simple) | Muy alta (ambos) |
| Infraestructura | Requiere que el proxy/load balancer soporte conexiones long-lived | Sin requisitos especiales | Ambos requisitos |
| Fiabilidad | Media (SSE se desconecta en mobile, proxies con timeout) | Alta (HTTP estándar, retry automático) | Alta pero frágil |
| Latencia | Baja (~instantáneo) | Aceptable (max 2s de delay) | Baja |
| Uso actual | Sin infraestructura SSE/WS | React Query ya configurado | Parcial |
| Mantenimiento | Nuevo patrón en la codebase | Patrón existente | Dos patrones |

**Justificación de B:**

1. **El polling solo ocurre en un momento específico** (vuelta del checkout) y dura máximo 30 segundos. No es un polling permanente que desperdicie recursos.
2. **React Query ya tiene `refetchInterval`** — no se necesita código nuevo de infraestructura.
3. **2 segundos de latencia máxima es aceptable** para una activación de plan. El usuario acaba de volver de MP y espera una confirmación — un spinner de 2s es normal.
4. **SSE requiere infraestructura nueva** (endpoint, EventSource client, reconexión, proxy config) para un caso de uso que ocurre una vez por usuario. Over-engineering.
5. **Sin SSE/WS, la codebase se mantiene simple** — todo es request/response HTTP estándar.

**¿Y para el día a día (sin checkout)?** La detección de cambio de plan funciona con el sistema existente:
- `useUserCapabilities()` tiene `staleTime: 0` y `refetchOnWindowFocus: true`
- `checkAuth()` se ejecuta al montar la app
- Si el CRON degrada un usuario, el próximo refetch de capabilities lo detecta

---

## Decisión 4: Feature Gating — Extensiones

### Lo que se extiende (no se crea nuevo)

El sistema de feature gating actual es **suficiente** para el flujo premium. No se necesitan componentes nuevos de infraestructura.

| Componente | Estado | Acción |
|-----------|--------|--------|
| `useUserCapabilities()` hook | Completo | Sin cambios. Ya refetchea con staleTime: 0 |
| `PremiumGuard` (backend) | Completo | Sin cambios. Ya valida `user.plan === 'premium'` |
| `Plan` entity + admin CRUD | Completo | Sin cambios. Límites ya configurables |
| `UsageLimit` entity | Completo | Sin cambios |
| `UserCapabilities` type | Completo | Agregar campo `subscriptionStatus` para UI |

### Cambios concretos en feature gating

**1. Agregar `subscriptionStatus` a la respuesta de capabilities:**

El tipo `UserCapabilities` se extiende con:

```typescript
// Nuevo en capabilities.types.ts
subscriptionStatus: 'active' | 'cancelled' | 'expired' | null;
planExpiresAt: string | null;  // ISO date
```

Esto permite al frontend mostrar:
- "Premium activo" (active)
- "Premium hasta {fecha}" (cancelled, con planExpiresAt)
- Badge de "Renovar" si está cancelled

**2. Agregar `plan` y `subscriptionStatus` al `AuthUser` type:**

`AuthUser` ya tiene `plan: string`. Se tipea mejor y se agrega:

```typescript
// Cambio en auth.types.ts
plan: 'anonymous' | 'free' | 'premium';  // más específico
subscriptionStatus?: 'active' | 'cancelled' | 'expired' | null;
```

**3. No se necesita componente `<FeatureGate>` nuevo.**

El patrón actual ya funciona:

```tsx
// Patrón existente — suficiente
const { data: capabilities } = useUserCapabilities();
if (!capabilities?.canCreateTarotReading) {
  return <PremiumUpgradePrompt feature="lecturas de tarot" />;
}
```

Se crea un **único componente reutilizable** para los upgrade prompts:

```tsx
// Nuevo: PremiumUpgradePrompt
// Props: feature (string), variant ('modal' | 'inline' | 'banner')
// Muestra: descripción del beneficio + CTA "Hacete Premium"
// Comportamiento: si es modal, cierra al hacer click fuera
```

### Upgrade prompts contextuales

Dos patrones de UX:

| Patrón | Cuándo | Ejemplo |
|--------|--------|---------|
| **Descubrimiento** | Feature visible pero bloqueada | "Las preguntas personalizadas son una función Premium. ¡Desbloqueá todo por $X/mes!" con CTA |
| **Límite alcanzado** | Agotó su cuota del día | "Usaste tus 3 lecturas de hoy. Con Premium, tus lecturas son ilimitadas." con CTA |

Ambos usan el mismo `PremiumUpgradePrompt` con props diferentes.

---

## Decisión 5: Página de Pricing/Planes

### Formato: página standalone en `/premium`

**No es modal** — es una página completa. Razones:
- Necesita espacio para comparar planes con detalle
- Funciona como landing para compartir link directo (`auguria.com/premium`)
- Los modals contextuales son para prompts rápidos, no para la tabla completa de pricing

### Contenido de la página

```
/premium
├── Hero: "Desbloqueá todo el poder de Auguria"
├── Tabla comparativa:
│   ├── Plan Gratuito (actual)
│   │   ├── 1 Carta del Día por día
│   │   ├── Lecturas limitadas
│   │   ├── Preguntas predefinidas
│   │   ├── Tiradas básicas (1 y 3 cartas)
│   │   └── Horóscopo diario
│   └── Plan Premium ($X/mes)
│       ├── ✨ Cartas del Día ilimitadas
│       ├── ✨ Lecturas ilimitadas
│       ├── ✨ Preguntas personalizadas
│       ├── ✨ Todas las tiradas (Cruz Celta, 5 cartas)
│       ├── ✨ Péndulo ilimitado
│       ├── ✨ Interpretaciones IA avanzadas
│       ├── ✨ Compartir lecturas
│       └── CTA: "Empezar Premium" → flujo MP
├── FAQ: Preguntas frecuentes sobre el plan
└── Garantía: "Cancelá cuando quieras"
```

**Datos dinámicos:** Los límites se obtienen de `GET /plan-config/{planType}` para que coincidan con lo configurado en admin. El precio viene del plan premium en la entidad Plan.

### Links a la página

| Desde | Cómo |
|-------|------|
| Navbar | Link "Premium" visible solo para usuarios free (oculto para premium y anónimos) |
| Perfil | Card "Mi Plan" con botón "Mejorar mi plan" |
| Upgrade prompts | CTA "Ver planes" en modals contextuales |
| Footer | Link en sección de navegación |
| Home | Sección de pricing simplificada con link a /premium |

---

## Decisión 6: Impacto en lo Existente

### Migraciones TypeORM necesarias

**Migración 1: `AddMercadoPagoSubscriptionFields`**
```sql
-- Nuevos campos
ALTER TABLE "user" ADD COLUMN "mp_preapproval_id" varchar(100);
ALTER TABLE "user" ADD COLUMN "mp_customer_id" varchar(100);

-- Índice para búsqueda por preapproval
CREATE INDEX "IDX_user_mp_preapproval_id" ON "user" ("mp_preapproval_id");
```

**No se remueve `stripeCustomerId` en esta migración** — se deja como deprecated y se limpia en una migración futura para evitar breaking changes.

### Módulos NestJS

| Módulo | Acción | Cambios |
|--------|--------|---------|
| `subscriptions.module` | **Extender** | Agregar `SubscriptionController`, `CreatePreapprovalUseCase`, `CancelSubscriptionUseCase`, `CheckSubscriptionStatusUseCase` |
| `holistic-services.module` | **Modificar** | Extraer `MercadoPagoService` a módulo compartido |
| `users.module` | **Modificar menor** | `User` entity con nuevos campos, capabilities response extendida |
| `auth.module` | **Sin cambios** | JWT payload ya incluye `plan` |

**Nuevo módulo compartido: `payments.module`**

`MercadoPagoService` actualmente vive en `holistic-services`. Como ahora lo necesitan tanto holistic-services como subscriptions, se extrae a un módulo compartido:

```
src/modules/payments/
├── payments.module.ts
├── infrastructure/
│   └── services/
│       └── mercadopago.service.ts  (movido desde holistic-services)
└── domain/
    └── interfaces/
        └── payment-gateway.interface.ts
```

**Webhook controller:** Se mueve a `payments.module` y se convierte en un router que delega al use case correcto según `payload.type`:

```
POST /webhooks/mercadopago
  ├── type: "payment" → ProcessMercadoPagoWebhookUseCase (holistic-services, existente)
  └── type: "subscription_preapproval" → ProcessSubscriptionWebhookUseCase (subscriptions, nuevo)
```

### Cambios en frontend

| Área | Cambios |
|------|---------|
| **Nueva página** | `/premium` — pricing/planes |
| **Nueva página** | `/premium/activacion` — post-checkout con polling |
| **Nuevo componente** | `PremiumUpgradePrompt` — prompt reutilizable de upgrade |
| **Nuevo hook** | `useSubscription()` — crear/cancelar suscripción, check status |
| **Modificar tipo** | `AuthUser` — agregar `subscriptionStatus` |
| **Modificar tipo** | `UserCapabilities` — agregar `subscriptionStatus`, `planExpiresAt` |
| **Modificar store** | `authStore` — extender `setUser` para incluir nuevos campos |
| **Modificar componente** | `UserMenu` / Navbar — agregar link/badge Premium |
| **Modificar componente** | Perfil — agregar sección "Mi Plan" con gestión de suscripción |
| **Nuevo en endpoints.ts** | `SUBSCRIPTIONS.CREATE_PREAPPROVAL`, `SUBSCRIPTIONS.STATUS`, `SUBSCRIPTIONS.CANCEL` |

### Webhooks existentes de Flavia

**No se modifican los webhooks existentes de Flavia.** El `ProcessMercadoPagoWebhookUseCase` sigue procesando `type: "payment"` igual que hoy. Solo se agrega un segundo handler para `type: "subscription_preapproval"`.

### Variables de entorno nuevas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `MP_PREAPPROVAL_PLAN_ID` | ID del plan de preapproval creado en MP | Sí (producción) |
| `BACKEND_URL` | URL pública del backend (para notification_url de MP) | Sí (producción) |

**Variables existentes reutilizadas:**
- `MP_ACCESS_TOKEN` — misma credencial para Checkout Pro y Preapproval
- `MP_WEBHOOK_SECRET` — misma validación de firma
- `FRONTEND_URL` — para back_urls de MP

---

## Consecuencias

### Positivas
- **Complejidad mínima**: Polling temporal (máx 30s) vs infraestructura SSE/WS permanente
- **Reutiliza casi todo**: Feature gating, capabilities, guards, MercadoPago service existentes
- **Una sola migración**: Solo 2 campos nuevos en User
- **Degradación graciosa**: Si webhook se demora, el polling lo cubre. Si ambos fallan, el CRON job lo atrapa
- **Cancelación justa**: Usuario mantiene acceso hasta fin de período pago

### Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Webhook de MP llega tarde o no llega | Polling en front + CRON de reconciliación diaria que consulta estado en MP API |
| Preapproval de MP cambia de API | SDK `mercadopago@2.12.0` es estable. Versionar con lock file |
| Usuario manipula localStorage para simular premium | Todas las validaciones son server-side (PremiumGuard, UsageLimit). localStorage solo es para UX |
| Race condition: webhook y polling simultáneos | Update atómico con check de estado previo (patrón ya usado en holistic-services: `updateStatusIfCurrent`) |
| Cambio de precio del plan | Crear nuevo plan en MP. Usuarios existentes mantienen precio anterior hasta cancelar/resubscribirse |

---

## Diagrama de Flujo del Upgrade

```
Usuario Free                    Frontend                      Backend                     Mercado Pago
     │                             │                             │                             │
     │  Click "Hacete Premium"     │                             │                             │
     │────────────────────────────>│                             │                             │
     │                             │  POST /subscriptions/       │                             │
     │                             │  create-preapproval         │                             │
     │                             │────────────────────────────>│                             │
     │                             │                             │  POST /preapproval          │
     │                             │                             │  (plan_id, payer, urls)      │
     │                             │                             │────────────────────────────>│
     │                             │                             │                             │
     │                             │                             │  { id, init_point }         │
     │                             │                             │<────────────────────────────│
     │                             │  { initPoint }              │                             │
     │                             │<────────────────────────────│                             │
     │                             │                             │                             │
     │  Redirect a MP Checkout     │                             │                             │
     │<────────────────────────────│                             │                             │
     │                             │                             │                             │
     │  ══════ Usuario paga en MP ══════                         │                             │
     │                             │                             │                             │
     │  Redirect a /premium/       │                             │                             │
     │  activacion?status=ok       │                             │                             │
     │────────────────────────────>│                             │                             │
     │                             │                             │  Webhook (async)            │
     │                             │                             │<────────────────────────────│
     │                             │                             │  → plan=premium             │
     │                             │                             │  → status=active            │
     │                             │  Polling: GET /subs/status  │                             │
     │                             │────────────────────────────>│                             │
     │                             │  { plan: 'premium' } ✓      │                             │
     │                             │<────────────────────────────│                             │
     │                             │                             │                             │
     │                             │  → Zustand: plan=premium    │                             │
     │                             │  → Invalidar capabilities   │                             │
     │                             │  → Mostrar "¡Activado!"     │                             │
     │  Pantalla de éxito          │                             │                             │
     │<────────────────────────────│                             │                             │
```

---

## Lista de Tareas (orden de implementación)

### Fase 1: Infraestructura de pagos (backend)

1. **Extraer `MercadoPagoService` a `payments.module`** — mover desde holistic-services, crear módulo compartido
2. **Migración TypeORM** — agregar `mpPreapprovalId`, `mpCustomerId` a User entity
3. **Extender User entity** — nuevos campos + actualizar helpers
4. **Mover webhook controller** a `payments.module` con routing por tipo
5. **Crear script de seed** para crear plan de preapproval en MP (o documentar proceso manual)

### Fase 2: Suscripciones (backend)

6. **`CreatePreapprovalUseCase`** — crea preapproval en MP, devuelve initPoint
7. **`ProcessSubscriptionWebhookUseCase`** — procesa webhook de suscripción, activa/desactiva plan
8. **`CancelSubscriptionUseCase`** — cancela preapproval en MP, actualiza subscriptionStatus
9. **`CheckSubscriptionStatusUseCase`** — devuelve estado actual de suscripción (para polling)
10. **`SubscriptionController`** — endpoints REST (create, cancel, status)
11. **CRON job de degradación** — revisa planes expirados cada 6 horas
12. **Extender capabilities** — agregar subscriptionStatus y planExpiresAt a la respuesta
13. **Tests unitarios** para todos los use cases
14. **Tests de integración** para webhook + polling

### Fase 3: Frontend - Página de pricing

15. **Página `/premium`** — comparación de planes con datos dinámicos
16. **Componente `PremiumUpgradePrompt`** — prompt reutilizable (modal/inline/banner)
17. **Hook `useSubscription()`** — create-preapproval, cancel, status
18. **Endpoints en `endpoints.ts`** — nuevas rutas de suscripción
19. **Tests de componentes**

### Fase 4: Frontend - Flujo de checkout y activación

20. **Página `/premium/activacion`** — post-checkout con polling
21. **Extender tipos** — `AuthUser`, `UserCapabilities` con campos de suscripción
22. **Modificar Navbar** — link/badge Premium para free users
23. **Modificar Perfil** — sección "Mi Plan" con gestión de suscripción
24. **Integrar upgrade prompts** en features premium existentes (preguntas custom, tiradas avanzadas, etc.)
25. **Tests E2E** del flujo completo

### Fase 5: Reconciliación y robustez

26. **CRON de reconciliación** — consulta estado de preapprovals en MP API para detectar inconsistencias
27. **Logging y alertas** — monitoreo de webhooks fallidos, activaciones tardías
28. **Documentación** — actualizar API docs, ARCHITECTURE.md
