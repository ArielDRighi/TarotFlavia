# Backlog Técnico: Flujo Premium + Suscripciones Mercado Pago

> Basado en ADR: `docs/ADR_SUBSCRIPTION_PREMIUM_FLOW.md`
> Última actualización: 2026-03-23

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Total de tareas** | 22 |
| **Estimación total** | 28-32 días |
| **Bloques** | 6 (Fundación → Suscripciones BE → Pricing FE → Checkout FE → Integración FE → QA) |

### Ruta Crítica (secuencial, bloqueante)

```
T-BE-01 (JwtStrategy fix) → T-DB-01 (migración) → T-BE-02 (payments module)
→ T-BE-03 (webhook routing) → T-INT-01 (create preapproval)
→ T-INT-02 (webhook suscripciones) → T-INT-03 (cancel + status)
→ T-FE-01 (hook + endpoints) → T-FE-03 (checkout/activación)
```

### Paralelización posible

```
Paralelo 1 (después de T-BE-03):
  ├── Backend: T-INT-01 → T-INT-02 → T-INT-03 → T-BE-04 → T-BE-05 → T-BE-06
  └── Frontend: T-FE-01 → T-FE-02 (pueden usar mocks hasta que backend esté listo)

Paralelo 2 (después de T-INT-03):
  ├── Backend: T-BE-04 (CRON) + T-BE-05 (capabilities)
  └── Frontend: T-FE-03 (checkout) + T-FE-04 (navbar) + T-FE-05 (perfil)

Paralelo 3 (independiente desde el inicio):
  └── T-QA-01 (documentación .env) puede hacerse en cualquier momento
```

---

## Bloque 1: Fundación

> Sin esto, nada del flujo premium funciona.

---

### T-BE-01: Fix crítico — JwtStrategy debe leer plan de la DB

**Prioridad:** 🔴 ALTA
**Estimación:** 0.5 días
**Dependencias:** Ninguna
**Estado:** ✅ COMPLETADA

**Contexto:** `JwtStrategy.validate()` estaba retornando `plan: payload.plan || 'free'` (del JWT) en vez de `plan: user.plan` (de la DB). Esto significaba que cuando el webhook actualiza `plan=premium` en la DB, el `PremiumGuard` seguía leyendo `plan=free` del JWT hasta que el token expire (7 días). Sin este fix, el upgrade a premium no funciona.

#### 📋 Descripción

Cambiar `JwtStrategy.validate()` para que use el plan de la DB (que ya se consulta en la misma función) en vez del JWT payload.

#### ✅ Tareas específicas

**Backend:**
- [x] En `src/modules/auth/infrastructure/strategies/jwt.strategy.ts`: cambiar `plan: payload.plan || 'free'` por `plan: user.plan`
- [x] Cambiar `roles: payload.roles || []` por `roles: user.roles` para consistencia
- [x] Cambiar `isAdmin: payload.isAdmin || false` por `isAdmin: user.isAdmin` para consistencia
- [x] `tarotistaId` se mantiene leyendo desde el JWT payload (es un campo de sesión, no de estado)

**Tests:**
- [x] Actualizar `jwt.strategy.spec.ts`: test que valida que usuario cuyo plan cambió en DB (JWT dice `free`, DB tiene `premium`) recibe `plan: 'premium'`
- [x] Test que valida que usuario con roles actualizados en DB recibe los roles correctos
- [x] Test que valida que `isAdmin` se lee de DB, no de JWT
- [x] Coverage ≥ 80% (100% Stmts, 85.71% Branch, 100% Funcs, 100% Lines)

#### 🎯 Criterios de aceptación

- [x] `JwtStrategy.validate()` retorna `plan` leído de la DB, no del JWT payload
- [x] `PremiumGuard` funciona correctamente si se cambia el plan en la DB sin refrescar el JWT
- [x] Tests pasan y cubren el caso de plan desactualizado en JWT
- [x] Ciclo de calidad completo pasa

**Notas técnicas:**
- PR: `feature/t-be-01-jwt-strategy-db-plan` → `develop`
- Archivos modificados: `jwt.strategy.ts`, `jwt.strategy.spec.ts`
- 12 tests, todos verdes

---

### T-DB-01: Migración — Campos de suscripción MP en User

**Prioridad:** 🔴 ALTA
**Estimación:** 1 día
**Dependencias:** T-BE-01
**Estado:** ✅ COMPLETADA

**Contexto:** La tabla `user` necesita campos para vincular con la suscripción de Mercado Pago. El campo `stripeCustomerId` existe pero nunca se usó — se deja como deprecated.

#### 📋 Descripción

Crear migración TypeORM que agregue campos de MercadoPago a la tabla `user` y actualizar la entidad User.

#### ✅ Tareas específicas

**Backend:**
- [x] Generar migración: `1774555788556-AddMercadoPagoSubscriptionFields.ts`
- [x] Agregar campo `mp_preapproval_id` (`varchar(100)`, nullable) a tabla `user`
- [x] Agregar campo `mp_customer_id` (`varchar(100)`, nullable) a tabla `user`
- [x] Crear índice `IDX_user_mp_preapproval_id` en `mp_preapproval_id`
- [x] Actualizar `User` entity en `src/modules/users/entities/user.entity.ts`:
  - Agregar `mpPreapprovalId: string | null` con `@Column({ name: 'mp_preapproval_id', type: 'varchar', length: 100, nullable: true })`
  - Agregar `mpCustomerId: string | null` con `@Column({ name: 'mp_customer_id', type: 'varchar', length: 100, nullable: true })`
  - Marcar `stripeCustomerId` con `@deprecated` en JSDoc
- [x] Ejecutar migración contra DB de desarrollo: `npm run migration:run`
- [x] Verificar que la migración es reversible (down method)

**Tests:**
- [x] Verificar que tests existentes de User entity siguen pasando
- [x] Agregar tests para `mpPreapprovalId` y `mpCustomerId` (45 tests, todos verdes)
- [x] Verificar que el build compila correctamente
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Migración aplica correctamente en DB limpia y en DB existente
- [x] Migración tiene `down()` funcional
- [x] User entity tiene los nuevos campos con tipos correctos
- [x] Índice creado en `mp_preapproval_id`
- [x] Tests existentes no se rompen
- [x] Ciclo de calidad completo pasa

**Notas técnicas:**
- PR: `feature/t-db-01-migration-mp-subscription-fields` → `develop`
- Archivos modificados: `user.entity.ts`, `user.entity.spec.ts`, `1774555788556-AddMercadoPagoSubscriptionFields.ts`
- 45 tests, todos verdes
- Migración generada con TypeORM CLI + índice `IDX_user_mp_preapproval_id` agregado manualmente

---

### T-BE-02: Extraer MercadoPagoService a payments.module compartido

**Prioridad:** 🔴 ALTA
**Estimación:** 1.5 días
**Dependencias:** T-DB-01
**Estado:** ✅ COMPLETADA

**Contexto:** `MercadoPagoService` vive dentro de `holistic-services` y no está exportado. Ahora lo necesitan tanto holistic-services (pagos únicos) como subscriptions (suscripciones recurrentes). Hay que extraerlo a un módulo compartido.

#### 📋 Descripción

Crear `payments.module` con `MercadoPagoService` extraído y reutilizable. Mantener la firma de validación de webhooks y agregar soporte para PreApproval del SDK.

#### ✅ Tareas específicas

**Backend:**
- [x] Crear estructura de carpetas:
  ```
  src/modules/payments/
  ├── payments.module.ts
  └── infrastructure/
      └── services/
          └── mercadopago.service.ts
  ```
- [x] Mover `MercadoPagoService` de `src/modules/holistic-services/infrastructure/services/mercadopago.service.ts` al nuevo módulo
- [x] Extender `MercadoPagoService` con métodos de PreApproval:
  - `createPreapproval(params)`: Crea suscripción en MP, retorna `{ preapprovalId, initPoint }`
  - `getPreapproval(id)`: Obtiene estado de suscripción por ID
  - `cancelPreapproval(id)`: Cancela suscripción en MP
  - Mantener métodos existentes: `createPreference()`, `getPayment()`, `validateSignature()`
- [x] Configurar `payments.module.ts`:
  - Imports: `ConfigModule`
  - Providers: `MercadoPagoService`
  - Exports: `MercadoPagoService`
- [x] Actualizar `holistic-services.module.ts`:
  - Agregar `PaymentsModule` a imports
  - Remover `MercadoPagoService` de providers
  - Actualizar imports en todos los use cases que usaban `MercadoPagoService` (path de import)
- [x] Verificar que `ProcessMercadoPagoWebhookUseCase` sigue funcionando con el nuevo import path
- [x] Verificar que `CreatePurchaseUseCase` sigue funcionando

**Tests:**
- [x] Mover/actualizar tests de `MercadoPagoService` al nuevo módulo
- [x] Agregar tests para los nuevos métodos de PreApproval (mock del SDK)
- [x] Verificar que tests existentes de holistic-services siguen pasando
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] `MercadoPagoService` vive en `payments.module` y es importable desde otros módulos
- [x] `holistic-services.module` importa `PaymentsModule` y usa `MercadoPagoService` vía DI
- [x] Todos los tests existentes de holistic-services siguen pasando
- [x] Métodos de PreApproval (`create`, `get`, `cancel`) implementados y testeados
- [x] Ciclo de calidad completo pasa

---

### T-BE-03: Mover webhook controller a payments.module con routing por tipo

**Prioridad:** 🔴 ALTA
**Estimación:** 1.5 días
**Dependencias:** T-BE-02
**Estado:** ✅ COMPLETADA

**Contexto:** El webhook controller actual (`POST /webhooks/mercadopago`) vive en holistic-services y solo procesa `type: "payment"`. Necesita manejar también `type: "subscription_preapproval"` y diferenciar cobros recurrentes de pagos de servicios holísticos (ambos llegan como `type: "payment"`).

#### 📋 Descripción

Mover el webhook controller a `payments.module` y convertirlo en un router que delega al use case correcto según el tipo de notificación.

#### ✅ Tareas específicas

**Backend:**
- [x] Mover `WebhookController` de `holistic-services/infrastructure/controllers/` a `payments/infrastructure/controllers/webhook.controller.ts`
- [x] Actualizar `WebhookController` para ser un router:
  - `type: "payment"` → verificar `external_reference`:
    - Si empieza con `sub_` → delegará a `ProcessSubscriptionPaymentUseCase` (se implementa en T-INT-02)
    - Si es numérico → delegar a `ProcessMercadoPagoWebhookUseCase` existente (holistic-services)
  - `type: "subscription_preapproval"` → delegará a `ProcessSubscriptionWebhookUseCase` (se implementa en T-INT-02)
  - Otros tipos → log + ignorar (comportamiento actual)
- [x] Actualizar `payments.module.ts`:
  - Agregar `WebhookController` a controllers
  - Importar `HolisticServicesModule` con `forwardRef` (para resolver dependencia circular)
- [x] Remover `WebhookController` de `holistic-services.module.ts` controllers
- [x] Exportar `HolisticServicesOrchestratorService` desde `holistic-services.module` (ya se exportaba)
- [x] **Preparar inyección placeholder** para los use cases de suscripción: `@Optional() @Inject(SUBSCRIPTION_WEBHOOK_USE_CASE)` con token en `payments/tokens/payment.tokens.ts`

**Tests:**
- [x] Test: webhook con `type: "payment"` y `external_reference` numérico → delega a holistic-services
- [x] Test: webhook con `type: "payment"` y `external_reference` con prefijo `sub_` → delega a suscripciones (stub por ahora)
- [x] Test: webhook con `type: "subscription_preapproval"` → delega a suscripciones (stub por ahora)
- [x] Test: webhook con tipo desconocido → ignora con 200 OK
- [x] Verificar que el endpoint sigue siendo `POST /api/v1/webhooks/mercadopago` (misma ruta)
- [x] Coverage ≥ 80% (97.61% Stmts, 100% Funcs)

#### 🎯 Criterios de aceptación

- [x] Webhook controller vive en `payments.module`
- [x] Pagos de servicios holísticos siguen funcionando exactamente igual
- [x] Routing por `type` + `external_reference` implementado
- [x] Endpoint URL no cambió (`POST /webhooks/mercadopago`)
- [x] Compilación y tests existentes pasan
- [x] Ciclo de calidad completo pasa

---

## Bloque 2: Suscripciones (Backend)

> Lógica de negocio de suscripciones MP.

---

### T-INT-01: CreatePreapprovalUseCase — Crear suscripción en MP

**Prioridad:** 🔴 ALTA
**Estimación:** 1.5 días
**Dependencias:** T-BE-02 (payments module con métodos de PreApproval)
**Estado:** ✅ COMPLETADA

**Contexto:** Cuando un usuario free quiere hacerse premium, el backend crea un preapproval en MP y devuelve la URL de checkout para que el frontend redirija al usuario.

#### 📋 Descripción

Implementar el use case que crea una suscripción de preapproval en MP y el endpoint REST correspondiente.

#### ✅ Tareas específicas

**Backend:**
- [x] Crear `src/modules/subscriptions/application/use-cases/create-preapproval.use-case.ts`:
  - Recibe: `userId`, `userEmail`
  - Valida: usuario existe (NotFoundException si no), usuario no es ya premium. No valida existencia de mpPreapprovalId porque se permite re-iniciar
  - Valida: `MP_PREAPPROVAL_PLAN_ID` configurado (InternalServerErrorException si vacío)
  - Compensación: si `userRepo.save` falla, cancela el preapproval creado en MP antes de lanzar error
  - Llama a `MercadoPagoService.createPreapproval()` con:
    - `preapproval_plan_id` de env var `MP_PREAPPROVAL_PLAN_ID`
    - `payer_email: userEmail`
    - `external_reference: "sub_{userId}"`
    - `back_url: "{FRONTEND_URL}/premium/activacion"`
    - `notification_url: "{BACKEND_URL}/api/v1/webhooks/mercadopago"`
  - Guarda `mpPreapprovalId` en User entity
  - Retorna `{ initPoint: string }`
- [x] Crear `src/modules/subscriptions/application/dto/create-preapproval-response.dto.ts` con `initPoint: string`
- [x] Agregar endpoint a `SubscriptionController`:
  - `POST /subscriptions/create-preapproval`
  - Guard: `JwtAuthGuard`
  - Retorna: `{ initPoint: string }`
- [x] Agregar variable de entorno `MP_PREAPPROVAL_PLAN_ID` a la validación de config (puede ser opcional en desarrollo)

**Tests:**
- [x] Test: usuario free crea preapproval → devuelve initPoint
- [x] Test: usuario ya premium → 400 Bad Request
- [x] Test: MP devuelve error → 502 Bad Gateway con mensaje claro
- [x] Test: `external_reference` tiene formato `sub_{userId}`
- [x] Test: usuario no encontrado → 404 NotFoundException
- [x] Test: `MP_PREAPPROVAL_PLAN_ID` no configurado → 500 InternalServerErrorException
- [x] Test: save falla → cancelPreapproval compensación + 500 InternalServerErrorException
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Endpoint `POST /subscriptions/create-preapproval` funciona y retorna `{ initPoint }`
- [x] `external_reference` usa formato `sub_{userId}` para diferenciarlo de pagos de Flavia
- [x] `mpPreapprovalId` se persiste en User
- [x] Validación: no permite crear si ya es premium
- [x] Validación: usuario debe existir (NotFoundException si no)
- [x] Validación: `MP_PREAPPROVAL_PLAN_ID` debe estar configurado
- [x] Compensación: si save falla, se cancela el preapproval en MP
- [x] Tests unitarios pasan
- [x] Ciclo de calidad completo pasa

---

### T-INT-02: ProcessSubscriptionWebhookUseCase — Procesar webhooks de suscripción

**Prioridad:** 🔴 ALTA
**Estimación:** 2 días
**Dependencias:** T-BE-03 (webhook routing), T-INT-01
**Estado:** ✅ COMPLETADA

**Contexto:** MP envía webhooks cuando el estado de una suscripción cambia (authorized, paused, cancelled) y cuando se procesan los cobros recurrentes. El backend debe actualizar el plan del usuario según estos eventos.

#### 📋 Descripción

Implementar el procesamiento de webhooks de suscripción (tanto `type: "subscription_preapproval"` como `type: "payment"` con `external_reference` prefijo `sub_`).

#### ✅ Tareas específicas

**Backend:**
- [x] Crear `src/modules/subscriptions/application/use-cases/process-subscription-webhook.use-case.ts`:
  - **Para `type: "subscription_preapproval"`:**
    - Fetch preapproval de MP con `MercadoPagoService.getPreapproval(data.id)`
    - Extraer `userId` de `external_reference` (parsear `sub_{userId}`)
    - Buscar usuario por ID
    - Según `status` del preapproval:
      - `authorized` → `plan=premium`, `subscriptionStatus=active`, `planStartedAt=now`, `planExpiresAt=next_payment_date`, `mpPreapprovalId=data.id`
      - `paused` → log warning, sin cambio de plan (MP reintenta automáticamente)
      - `cancelled` → `subscriptionStatus=cancelled` (plan sigue premium hasta `planExpiresAt`)
    - Idempotencia: verificar estado previo antes de actualizar (patrón `updateStatusIfCurrent`)
  - **Para `type: "payment"` con `external_reference` prefijo `sub_`:**
    - Fetch payment de MP con `MercadoPagoService.getPayment(data.id)`
    - Extraer `userId` de `external_reference`
    - Si `status=approved`: actualizar `planExpiresAt` al siguiente período (next_payment_date del preapproval)
    - Si `status=rejected`: log warning (MP maneja reintentos)
- [x] Registrar el use case como provider en `subscriptions.module.ts`
- [x] Conectar con el webhook controller (remover placeholder/stub de T-BE-03)
- [x] Validar firma `x-signature` usando `MercadoPagoService.validateSignature()` existente

**Tests:**
- [x] Test: webhook `subscription_preapproval` con `status=authorized` → user se hace premium
- [x] Test: webhook `subscription_preapproval` con `status=cancelled` → `subscriptionStatus=cancelled`, plan sigue premium
- [x] Test: webhook `subscription_preapproval` con `status=paused` → sin cambio
- [x] Test: webhook `payment` con `external_reference=sub_123` y `status=approved` → actualiza `planExpiresAt`
- [x] Test: webhook `payment` con `external_reference=sub_123` y `status=rejected` → log, sin cambio de plan
- [x] Test: webhook duplicado (idempotencia) → no cambia estado
- [x] Test: `external_reference` inválido → ignora con log
- [x] Test: usuario no encontrado → ignora con log
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Webhooks de suscripción activan/desactivan plan premium correctamente
- [x] Cobros recurrentes (`type: "payment"` con `sub_`) actualizan `planExpiresAt`
- [x] Idempotencia: webhooks duplicados no causan efectos secundarios
- [x] Firma `x-signature` se valida
- [x] No se afecta el procesamiento de pagos de servicios holísticos
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

---

### T-INT-03: Cancel + Status — Endpoints de gestión de suscripción

**Prioridad:** 🔴 ALTA
**Estimación:** 1.5 días
**Dependencias:** T-INT-01
**Estado:** ✅ COMPLETADA

**Contexto:** El usuario necesita poder cancelar su suscripción desde el perfil y el frontend necesita un endpoint para hacer polling del estado de activación post-checkout.

#### 📋 Descripción

Implementar use cases y endpoints para cancelar suscripción y consultar estado.

#### ✅ Tareas específicas

**Backend:**
- [x] Crear `src/modules/subscriptions/application/use-cases/cancel-subscription.use-case.ts`:
  - Valida que el usuario tiene suscripción activa (`mpPreapprovalId` no null, `subscriptionStatus=active`)
  - Llama a `MercadoPagoService.cancelPreapproval(mpPreapprovalId)`
  - Actualiza `subscriptionStatus=cancelled` en User
  - NO cambia `plan` ni `planExpiresAt` (usuario mantiene acceso hasta fin de período)
  - Retorna `{ message, planExpiresAt }`
- [x] Crear `src/modules/subscriptions/application/use-cases/check-subscription-status.use-case.ts`:
  - Retorna: `{ plan, subscriptionStatus, planExpiresAt, mpPreapprovalId }`
  - Lee directamente de la DB (estado fresco, para polling)
- [x] Agregar endpoints al `SubscriptionController`:
  - `POST /subscriptions/cancel` — Guard: `JwtAuthGuard`
  - `GET /subscriptions/status` — Guard: `JwtAuthGuard`
- [x] Crear DTOs de respuesta:
  - `CancelSubscriptionResponseDto`: `{ message: string, planExpiresAt: string }`
  - `SubscriptionStatusResponseDto`: `{ plan: string, subscriptionStatus: string | null, planExpiresAt: string | null }`

**Tests:**
- [x] Test: cancelar suscripción activa → `subscriptionStatus=cancelled`, plan no cambia
- [x] Test: cancelar sin suscripción activa → 400 Bad Request
- [x] Test: cancelar suscripción ya cancelada → 400 Bad Request
- [x] Test: MP API falla al cancelar → 502 con mensaje claro
- [x] Test: check status retorna datos correctos para usuario free/premium/cancelled
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] `POST /subscriptions/cancel` cancela en MP y actualiza DB
- [x] Plan permanece `premium` después de cancelar (hasta `planExpiresAt`)
- [x] `GET /subscriptions/status` retorna estado fresco de la DB
- [x] Validaciones de estado (no cancelar lo que no está activo)
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

---

### T-BE-04: CRON — Degradación automática de planes expirados

**Prioridad:** 🟡 MEDIA
**Estimación:** 1 día
**Dependencias:** T-INT-02 (webhook que setea planExpiresAt)
**Estado:** ✅ COMPLETADA

**Contexto:** Cuando un usuario cancela o MP cancela por cobro fallido, el plan sigue premium hasta `planExpiresAt`. Se necesita un job automático que degrade a free cuando el período expira.

#### 📋 Descripción

Implementar CRON job que revise y degrade planes expirados.

#### ✅ Tareas específicas

**Backend:**
- [x] Crear `src/modules/subscriptions/application/services/subscription-cron.service.ts`:
  - Usar `@Cron('0 */6 * * *')` (cada 6 horas) del decorador `@nestjs/schedule`
  - Query: `WHERE plan = 'premium' AND subscriptionStatus IN ('cancelled', 'expired') AND planExpiresAt < NOW()`
  - Para cada usuario: `plan=free`, `subscriptionStatus=expired`
  - Log: cantidad de usuarios degradados por ejecución
  - Manejar errores por usuario (no detener el batch si uno falla)
- [x] Registrar el servicio en `subscriptions.module.ts`
- [x] Verificar que `ScheduleModule` está importado en el módulo root o en subscriptions
- [x] Agregar `findExpiredPremiumUsers()` a `IUserRepository` e implementación en `TypeOrmUserRepository`

**Tests:**
- [x] Test: usuarios con plan expirado se degradan a free
- [x] Test: usuarios con plan activo NO se degradan
- [x] Test: usuarios con `subscriptionStatus=active` y `planExpiresAt` pasado NO se degradan (protección — solo `cancelled/expired`)
- [x] Test: error en un usuario no detiene el procesamiento del batch
- [x] Coverage ≥ 80% (100% Stmts, 100% Branch, 100% Funcs, 100% Lines)

#### 🎯 Criterios de aceptación

- [x] CRON se ejecuta cada 6 horas
- [x] Solo degrada usuarios con `subscriptionStatus` en `cancelled` o `expired` Y `planExpiresAt` pasado
- [x] Logging claro de resultados
- [x] No afecta usuarios con suscripción activa
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

**Notas técnicas:**
- PR: `feature/t-be-04-cron-plan-degradation` → `develop`
- Archivos nuevos: `subscription-cron.service.ts`, `subscription-cron.service.spec.ts`
- Archivos modificados: `subscriptions.module.ts`, `user-repository.interface.ts`, `typeorm-user.repository.ts`
- 11 tests, todos verdes. Coverage: 100% Stmts/Branch/Funcs/Lines
- `ScheduleModule` ya estaba registrado en `app.module.ts`

---

### T-BE-05: Extender capabilities con datos de suscripción

**Prioridad:** 🟡 MEDIA
**Estimación:** 1 día
**Dependencias:** T-DB-01 (campos en User)
**Estado:** ✅ COMPLETADA

**Contexto:** El frontend necesita `subscriptionStatus` y `planExpiresAt` para mostrar el estado de la suscripción en el perfil y manejar la UI de cancelación.

#### 📋 Descripción

Agregar campos de suscripción a la respuesta del endpoint de capabilities y al login/refresh token response.

#### ✅ Tareas específicas

**Backend:**
- [x] Extender el DTO de respuesta de capabilities (`GET /users/capabilities`) para incluir:
  - `subscriptionStatus: 'active' | 'cancelled' | 'expired' | null`
  - `planExpiresAt: string | null` (ISO date)
- [x] Extender la respuesta de `LoginUseCase.execute()` y `RegisterUseCase.execute()` para incluir `subscriptionStatus` en el objeto `user` (RefreshTokenUseCase no retorna `user`, solo tokens)
- [x] Actualizar el tipo de `user` en las respuestas de login/register para incluir `subscriptionStatus`

**Tests:**
- [x] Test: capabilities de usuario premium activo incluye `subscriptionStatus: 'active'`
- [x] Test: capabilities de usuario free incluye `subscriptionStatus: null`
- [x] Test: capabilities de usuario con suscripción cancelada incluye `subscriptionStatus: 'cancelled'` y `planExpiresAt`
- [x] Test: login response incluye `subscriptionStatus`
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] `GET /users/capabilities` retorna `subscriptionStatus` y `planExpiresAt`
- [x] Login/register/refresh responses incluyen `subscriptionStatus`
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

---

### T-BE-06: CRON de reconciliación con MP API

**Prioridad:** 🟢 BAJA
**Estimación:** 1 día
**Dependencias:** T-INT-02, T-BE-04
**Estado:** ✅ COMPLETADA

**Contexto:** Si un webhook de MP se pierde o falla, el estado en la DB puede quedar inconsistente con el estado real en MP. Un CRON diario de reconciliación detecta y corrige estas inconsistencias.

#### 📋 Descripción

Implementar CRON job que consulta el estado de todas las suscripciones activas en MP API y corrige discrepancias.

#### ✅ Tareas específicas

**Backend:**
- [x] Crear `src/modules/subscriptions/application/services/subscription-reconciliation.service.ts`:
  - Usar `@Cron('0 3 * * *')` (3 AM diario)
  - Query: todos los usuarios con `mpPreapprovalId` no null y `plan=premium`
  - Para cada uno: `MercadoPagoService.getPreapproval(mpPreapprovalId)`
  - Comparar estado de MP con estado local, corregir discrepancias
  - Log detallado de correcciones realizadas
  - Rate limiting: máx 50 consultas por ejecución (respetar límites de MP API)
- [x] Registrar en `subscriptions.module.ts`

**Tests:**
- [x] Test: suscripción activa en DB pero cancelada en MP → se corrige a cancelled
- [x] Test: suscripción en DB coincide con MP → sin cambios
- [x] Test: error de MP API no detiene el batch
- [x] Coverage ≥ 80% (96.87% statements)

#### 🎯 Criterios de aceptación

- [x] CRON se ejecuta diariamente
- [x] Detecta y corrige inconsistencias entre DB y MP
- [x] Logging claro de discrepancias encontradas y corregidas
- [x] Respeta rate limits de MP API
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

---

## Bloque 3: Frontend — Pricing y Upgrade Prompts

> Página de planes y componentes de conversión.

---

### T-FE-01: Hook useSubscription + endpoints + tipos

**Prioridad:** 🔴 ALTA
**Estimación:** 1 día
**Dependencias:** T-INT-01, T-INT-03 (endpoints backend)
**Estado:** ✅ COMPLETADA

**Contexto:** El frontend necesita hooks y tipos para interactuar con los nuevos endpoints de suscripción.

#### 📋 Descripción

Crear el hook de React Query para suscripciones, agregar endpoints al archivo centralizado, y extender los tipos TypeScript.

#### ✅ Tareas específicas

**Frontend:**
- [x] Agregar endpoints a `src/lib/api/endpoints.ts`:
  ```typescript
  SUBSCRIPTIONS: {
    ...existentes,
    CREATE_PREAPPROVAL: '/subscriptions/create-preapproval',
    STATUS: '/subscriptions/status',
    CANCEL: '/subscriptions/cancel',
  }
  ```
- [x] Crear `src/hooks/api/useSubscription.ts`:
  - `useCreatePreapproval()`: mutation que llama `POST /subscriptions/create-preapproval`, retorna `{ initPoint }`
  - `useSubscriptionStatus(options?)`: query que llama `GET /subscriptions/status`, acepta `refetchInterval` para polling
  - `useCancelSubscription()`: mutation que llama `POST /subscriptions/cancel`, invalida capabilities y subscription status on success
- [x] Extender tipos en `src/types/auth.types.ts`:
  - `AuthUser.plan`: cambiar de `string` a `'anonymous' | 'free' | 'premium'`
  - `AuthUser.subscriptionStatus`: agregar como `'active' | 'cancelled' | 'expired' | null` (opcional)
- [x] Extender tipos en `src/types/capabilities.types.ts`:
  - Agregar `subscriptionStatus?: 'active' | 'cancelled' | 'expired' | null`
  - Agregar `planExpiresAt?: string | null`
- [x] Nuevos tipos en `src/types/subscription.types.ts`:
  - `MpSubscriptionStatus`: `{ plan, subscriptionStatus, planExpiresAt }`
  - `CreatePreapprovalResponse`: `{ initPoint: string }`
  - `CancelSubscriptionResponse`: `{ message, planExpiresAt }`
  - `MpSubscriptionStatusValue`: union type de valores de estado
- [x] Exportar nuevos tipos desde `src/types/index.ts`

**Tests:**
- [x] Test: `useCreatePreapproval` llama al endpoint correcto
- [x] Test: `useSubscriptionStatus` con `refetchInterval` hace polling
- [x] Test: `useCancelSubscription` invalida queries on success
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Todos los endpoints de suscripción están centralizados en `API_ENDPOINTS`
- [x] Hooks de React Query creados y testeados
- [x] Tipos TypeScript extendidos y exportados
- [x] Sin errores de TypeScript en el build
- [x] Ciclo de calidad completo pasa

---

### T-FE-02: Página /premium — Comparación de planes

**Prioridad:** 🟡 MEDIA
**Estimación:** 2 días
**Dependencias:** T-FE-01
**Estado:** ✅ COMPLETADA

**Contexto:** No existe página de pricing. Hay un componente `PlanComparison` en el home con datos hardcodeados y precio `$9.99/mes`. Necesita una página dedicada con datos dinámicos y CTA funcional.

#### 📋 Descripción

Crear página standalone `/premium` con comparación de planes, precio dinámico desde la API, y CTA que inicie el flujo de suscripción MP.

#### ✅ Tareas específicas

**Frontend:**
- [x] Agregar ruta a `ROUTES` en `src/lib/constants/routes.ts`: `PREMIUM: '/premium'`
- [x] Crear `src/app/premium/page.tsx` (solo importa componente, sin lógica)
- [x] Crear `src/components/features/premium/PremiumPage.tsx`:
  - Fetch datos de planes desde `GET /plan-config/public` (endpoint público creado en T-FE-02)
  - Hero section: título, subtítulo
  - Tabla comparativa de planes con datos dinámicos
  - Precio del plan premium mostrado dinámicamente
  - CTA "Comenzar Premium":
    - Si usuario no autenticado → redirigir a `/registro`
    - Si usuario free → llamar `useCreatePreapproval()` y redirigir a `initPoint`
    - Si usuario premium → mostrar "Ya tenés Premium" con link a perfil
  - Sección FAQ con preguntas frecuentes (¿qué pasa si cancelo?, ¿cómo funciona el cobro?, etc.)
  - Garantía: "Cancelá cuando quieras, sin compromiso"
- [x] Agregar endpoint público `GET /plan-config/public` en backend (guards movidos a nivel de método, nuevo endpoint sin auth)
- [x] Agregar `PLAN_CONFIG_PUBLIC: '/plan-config/public'` en `src/lib/api/endpoints.ts`
- [x] Crear `src/lib/api/public-plans-api.ts` con `fetchPublicPlans()`
- [x] Crear `src/hooks/api/usePublicPlans.ts` con `usePublicPlans()` React Query hook

**Tests:**
- [x] Test: renderiza tabla de planes con datos
- [x] Test: CTA redirige a registro si no autenticado
- [x] Test: CTA inicia flujo MP si usuario free
- [x] Test: muestra "Ya tenés Premium" si usuario premium
- [x] Test: loading state mientras se cargan datos de planes
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Página `/premium` accesible y responsive
- [x] Datos de planes vienen de la API (no hardcodeados)
- [x] CTA funcional según estado del usuario
- [x] Sección FAQ visible
- [x] Tests pasan (12/12)
- [x] Ciclo de calidad completo pasa (format ✅ lint ✅ type-check ✅ build ✅ validate-architecture ✅)

---

### T-UX-01: Componente PremiumUpgradePrompt reutilizable

**Prioridad:** 🟡 MEDIA
**Estimación:** 1.5 días
**Dependencias:** T-FE-01
**Estado:** ✅ COMPLETADA

**Contexto:** Ya existen varios componentes de conversión dispersos: `PremiumPreview` (blur overlay), `LimitReachedModal` (modal al agotar límite), `UpgradeBanner` (banner gradient). Necesitan un wrapper unificado que conecte con el flujo de suscripción MP real en vez de redirigir a `/registro`.

#### 📋 Descripción

Crear componente `PremiumUpgradePrompt` que unifique los prompts de upgrade y conecte con el flujo de suscripción real.

#### ✅ Tareas específicas

**Frontend:**
- [x] Crear `src/components/features/conversion/PremiumUpgradePrompt.tsx`:
  - Props:
    - `feature: string` — nombre del feature bloqueado (ej: "preguntas personalizadas")
    - `variant: 'modal' | 'inline' | 'banner'` — tipo de visualización
    - `trigger?: 'discovery' | 'limit-reached'` — contexto del prompt
  - Lógica interna:
    - Usa `useCreatePreapproval()` para iniciar flujo de pago
    - Si usuario no autenticado → redirige a `/registro` con query param `?redirect=/premium`
    - Si usuario free → CTA llama a create-preapproval y redirige a MP
    - Si usuario premium → no se renderiza (early return)
  - Variantes:
    - `modal`: dialog con beneficios + CTA (basado en `LimitReachedModal` existente)
    - `inline`: card compacta inline (basado en `PremiumPreview` existente)
    - `banner`: banner horizontal (basado en `UpgradeBanner` existente)
- [x] Actualizar componentes existentes para usar `PremiumUpgradePrompt` internamente:
  - `LimitReachedModal` → conectado a flujo MP real via `useCreatePreapproval` (eliminado prop `onUpgrade`)
  - `UpgradeBanner` → `onUpgradeClick` ahora opcional; flujo MP manejado internamente
  - `PremiumPreview` → conectado a flujo MP real via `useCreatePreapproval` (eliminado prop `onUpgrade`)
- [x] Actualizar `UpgradeModal` en readings para usar el nuevo flujo

**Tests:**
- [x] Test: variant `modal` renderiza dialog
- [x] Test: variant `inline` renderiza card
- [x] Test: variant `banner` renderiza banner
- [x] Test: no renderiza si usuario es premium
- [x] Test: redirige a registro si no autenticado
- [x] Test: inicia flujo MP si usuario free
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Componente reutilizable con 3 variantes
- [x] Conecta con flujo de suscripción MP real
- [x] Componentes existentes actualizados para usar el nuevo flujo
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

---

## Bloque 4: Frontend — Flujo de Checkout y Activación

> Post-pago: polling, activación, celebración.

---

 ### T-FE-03: Página /premium/activacion — Post-checkout con polling

**Prioridad:** 🔴 ALTA
**Estimación:** 2 días
**Dependencias:** T-FE-01 (hook useSubscription), T-INT-03 (endpoint status)
**Estado:** ✅ COMPLETADA

**Contexto:** Después de pagar en MP, el usuario es redirigido a `/premium/activacion`. Esta página debe hacer polling del estado de la suscripción hasta detectar que el plan es premium, y luego activar la UI.

#### 📋 Descripción

Crear la página de activación post-checkout con polling de React Query y manejo de todos los estados posibles.

#### ✅ Tareas específicas

**Frontend:**
- [x] Agregar ruta a `ROUTES`: `PREMIUM_ACTIVACION: '/premium/activacion'`
- [x] Crear `src/app/premium/activacion/page.tsx`
- [x] Crear `src/components/features/premium/ActivationPage.tsx`:
  - Leer query params: `?status=authorized|pending|failure&preapproval_id=X&redirect=/ruta`
  - **Estado `authorized`:**
    - Mostrar spinner con mensaje "Activando tu plan Premium..."
    - Activar `useSubscriptionStatus({ refetchInterval: 2000 })` (polling cada 2s)
    - Cuando `plan === 'premium'`:
      1. Detener polling (setear `refetchInterval: false`)
      2. Actualizar Zustand store: `setUser({ ...user, plan: 'premium', subscriptionStatus: 'active' })`
      3. Invalidar capabilities query: `invalidateCapabilities()`
      4. Mostrar animación de éxito (confetti o similar)
      5. Después de 3 segundos: redirigir a `redirect` query param o a `/perfil`
    - Si después de 30 segundos (15 intentos) el plan no cambió:
      1. Detener polling
      2. Mostrar: "Estamos procesando tu pago. Tu plan Premium se activará automáticamente en unos minutos."
      3. Botón "Ir al inicio"
  - **Estado `pending`:**
    - Mostrar: "Tu pago está siendo procesado. Te notificaremos cuando se confirme."
    - Botón "Ir al inicio"
  - **Estado `failure`:**
    - Mostrar: "Hubo un problema con tu pago."
    - Botón "Reintentar" (vuelve a `/premium`)
    - Botón "Ir al inicio"
  - **Sin status (acceso directo):**
    - Redirigir a `/premium`

**Tests:**
- [x] Test: status=authorized → muestra spinner, inicia polling
- [x] Test: polling detecta plan=premium → muestra éxito, redirige
- [x] Test: polling timeout (30s) → muestra mensaje de espera
- [x] Test: status=pending → muestra mensaje de procesamiento
- [x] Test: status=failure → muestra error con retry
- [x] Test: sin status → redirige a /premium
- [x] Test: actualiza Zustand store al detectar premium
- [x] Test: invalida capabilities query al detectar premium
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Polling funciona con intervalo de 2 segundos
- [x] Polling se detiene al detectar premium o después de 30 segundos
- [x] Zustand store se actualiza correctamente
- [x] Capabilities se invalidan
- [x] Todos los estados (authorized, pending, failure) tienen UI adecuada
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

---

## Bloque 5: Frontend — Integración en App Existente

> Conectar el flujo premium con la app existente.

---

### T-FE-04: Navbar — Link/badge Premium para free users

**Prioridad:** 🟡 MEDIA
**Estimación:** 0.5 días
**Dependencias:** T-FE-01 (tipos extendidos)
**Estado:** ✅ COMPLETADA

**Contexto:** La navbar actualmente no tiene ningún link a Premium. Los usuarios free necesitan un punto de entrada visible al flujo de upgrade.

#### 📋 Descripción

Agregar link/badge "Premium" en la navbar para usuarios free autenticados.

#### ✅ Tareas específicas

**Frontend:**
- [x] Modificar `src/components/layout/Header.tsx`:
  - Agregar link "Premium" visible solo cuando: `user !== null && user.plan !== 'premium'`
  - Ubicación: entre los links de navegación existentes y el `UserMenu`
  - Estilo: badge o botón sutil con icono de estrella/gema (consistente con design tokens)
  - Href: `ROUTES.PREMIUM` (`/premium`)
- [x] Si el usuario es premium, opcionalmente mostrar un badge sutil "Premium" junto al nombre (en `UserMenu`)

**Tests:**
- [x] Test: link "Premium" visible para usuario free
- [x] Test: link "Premium" NO visible para usuario premium
- [x] Test: link "Premium" NO visible para usuario anónimo (no autenticado)
- [x] Tests existentes de Header siguen pasando
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Link visible solo para free users autenticados
- [x] Link apunta a `/premium`
- [x] No rompe tests existentes del Header
- [x] Ciclo de calidad completo pasa

**Notas técnicas:**
- PR: `feature/t-fe-04-navbar-premium-badge` → `develop`
- Archivos modificados: `Header.tsx`, `Header.test.tsx`
- 34 tests, todos verdes (4 nuevos para el badge Premium)
- Icono `Star` de lucide-react, color `text-secondary` para destacar visualmente
- Ciclo de calidad: format ✅ lint ✅ type-check ✅ build ✅ validate-architecture ✅

---

### T-FE-05: Perfil — Sección "Mi Plan" con gestión de suscripción

**Prioridad:** 🟡 MEDIA
**Estimación:** 1.5 días
**Dependencias:** T-FE-01 (hook useSubscription), T-BE-05 (capabilities extendidas)
**Estado:** ✅ COMPLETADA

**Contexto:** Existe `SubscriptionTab` en el perfil que muestra el plan actual y estadísticas de uso. Necesita extenderse para mostrar estado de suscripción y permitir cancelación.

#### 📋 Descripción

Extender `SubscriptionTab` existente con información de suscripción MP y flujo de cancelación.

#### ✅ Tareas específicas

**Frontend:**
- [x] Modificar `src/components/features/profile/SubscriptionTab.tsx`:
  - **Usuario free:** mantener sección actual "Mejora tu Plan" pero cambiar CTA de texto estático ("Próximamente") a botón funcional que redirige a `/premium`
  - **Usuario premium activo (`subscriptionStatus=active`):**
    - Mostrar: "Plan Premium — Activo"
    - Mostrar fecha de próximo cobro (`planExpiresAt`)
    - Botón "Cancelar suscripción" → abre modal de confirmación
  - **Usuario premium cancelado (`subscriptionStatus=cancelled`):**
    - Mostrar: "Plan Premium — Cancelado"
    - Mostrar: "Tu plan Premium sigue activo hasta {planExpiresAt}"
    - Botón "Reactivar" → redirige a `/premium` (crea nueva suscripción)
  - **Modal de confirmación de cancelación:**
    - Texto: "¿Seguro que querés cancelar? Tu plan Premium seguirá activo hasta {fecha}. Después volverás al plan gratuito."
    - Botón "Sí, cancelar" → llama `useCancelSubscription()`
    - Botón "No, mantener Premium"
- [x] Leer `subscriptionStatus` y `planExpiresAt` desde capabilities (fuente de verdad)

**Tests:**
- [x] Test: usuario free → muestra CTA "Mejorar mi plan" funcional
- [x] Test: usuario premium activo → muestra estado y fecha de cobro
- [x] Test: usuario premium activo → botón cancelar abre modal
- [x] Test: confirmar cancelación → llama al endpoint y muestra estado cancelado
- [x] Test: usuario premium cancelado → muestra fecha de expiración y botón reactivar
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Los tres estados (free, premium active, premium cancelled) se muestran correctamente
- [x] Cancelación funciona con modal de confirmación
- [x] Datos vienen de capabilities (single source of truth)
- [x] Tests pasan
- [x] Ciclo de calidad completo pasa

---

 ### T-FE-06: Integrar upgrade prompts en features premium existentes

**Prioridad:** 🟡 MEDIA
**Estimación:** 1.5 días
**Dependencias:** T-UX-01 (PremiumUpgradePrompt)
**Estado:** ✅ COMPLETADA

**Contexto:** Los componentes existentes que bloquean features premium actualmente usan callbacks `onUpgrade` que redirigen a `/registro`. Necesitan conectarse con el flujo de suscripción MP real.

#### 📋 Descripción

Actualizar todos los puntos donde se muestra un prompt de upgrade para usar `PremiumUpgradePrompt` con el flujo real de MP.

#### ✅ Tareas específicas

**Frontend:**
- [x] `ReadingExperience.tsx`: el `UpgradeBanner` y `UpgradeModal` ya existen — actualizar `onUpgradeClick` para usar flujo MP (via `PremiumUpgradePrompt` o directamente `useCreatePreapproval`)
- [x] `QuestionSelector.tsx`: cuando `canUseCustomQuestions=false`, verificar que el `UpgradeModal` ya usa flujo MP (ya correcto, sin cambios necesarios)
- [x] `SpreadSelector` (en tests): verificar que tiradas avanzadas bloqueadas muestran prompt de upgrade funcional (ya correcto, sin cambios necesarios)
- [x] `RitualPageContent.tsx`: verificar que features premium bloqueadas usan el flujo correcto (ya correcto, sin cambios necesarios)
- [x] `DailyLimitReachedModal.tsx` / `DailyCardLimitReached`: verificar CTA para flujo MP (ya correcto, sin cambios necesarios)
- [x] `PlanComparison.tsx` en home: cambiar CTA del plan Premium de `ROUTES.REGISTER` a `ROUTES.PREMIUM`
- [x] `LandingPage.tsx`: verificar que las secciones de pricing linkean a `/premium` (ya correcto, sin cambios necesarios)
- [x] `UpgradeBanner.tsx`: implementado `useAuth()` + `useCreatePreapproval()` internamente — anónimos → `/registro?redirect=/premium`, usuarios free → flujo MP directo

**Tests:**
- [x] Test: cada punto de upgrade llama al flujo correcto (MP para free, registro para anónimo)
- [x] Test: PlanComparison CTA apunta a /premium
- [x] Tests existentes actualizados para reflejar nuevos comportamientos
- [x] Coverage ≥ 80%

#### 🎯 Criterios de aceptación

- [x] Todos los CTAs de upgrade usan el flujo correcto (no redirigen a `/registro` para usuarios free)
- [x] Usuarios anónimos siguen redirigiendo a `/registro`
- [x] Tests actualizados y pasan
- [x] Ciclo de calidad completo pasa

---

## Bloque 6: Robustez y Calidad

> Testing, documentación, seed scripts.

---

### T-QA-01: Documentar variables de entorno MP en .env.example

**Prioridad:** 🟢 BAJA
**Estimación:** 0.5 días
**Dependencias:** Ninguna
**Estado:** ✅ COMPLETADA

**Contexto:** Las variables `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, y `MP_PREAPPROVAL_PLAN_ID` no están documentadas en `.env.example`.

#### 📋 Descripción

Agregar sección de MercadoPago al `.env.example` con todas las variables necesarias.

#### ✅ Tareas específicas

**Documentación:**
- [x] Agregar sección "MercadoPago Configuration" al `.env.example`:
  ```
  # MercadoPago Configuration
  # MP_ACCESS_TOKEN=TEST-xxx (required for payments)
  # MP_WEBHOOK_SECRET=xxx (required in production for webhook signature validation)
  # MP_PREAPPROVAL_PLAN_ID=xxx (required for premium subscriptions)
  ```
- [x] Agregar `BACKEND_URL` si no existe: `# BACKEND_URL=http://localhost:3000` (requerido para notification_url de webhooks)
- [x] Verificar que `FRONTEND_URL` ya está documentado (sí, ya existe comentado)

#### 🎯 Criterios de aceptación

- [x] Todas las variables de MP están documentadas en `.env.example`
- [x] Cada variable tiene descripción y ejemplo
- [x] Indicación de cuáles son requeridas vs opcionales

**Notas técnicas:**
- PR: `feature/t-qa-01-env-example-mp-variables` → `develop`
- Archivos modificados: `backend/tarot-app/.env.example`
- `FRONTEND_URL` ya existía (línea 223), se mantuvo sin cambios
- `BACKEND_URL` agregado junto a `FRONTEND_URL` para coherencia de contexto
- Nueva sección "MercadoPago Configuration" con 3 variables documentadas y categorizadas por obligatoriedad

---

### T-QA-02: Seed script o documentación para crear plan en MP

**Prioridad:** 🟢 BAJA
**Estimación:** 0.5 días
**Dependencias:** T-BE-02 (payments module)
**Estado:** ✅ COMPLETADA

**Contexto:** El plan de preapproval en MP debe crearse una vez manualmente o vía script. El ID resultante se guarda como variable de entorno `MP_PREAPPROVAL_PLAN_ID`.

#### 📋 Descripción

Crear un script CLI o documentar el proceso manual para crear el plan de preapproval en MP.

#### ✅ Tareas específicas

**Backend:**
- [x] Crear `scripts/create-mp-preapproval-plan.ts`:
  - Lee `MP_ACCESS_TOKEN` del `.env`
  - Crea plan de preapproval en MP con:
    - `reason`: "Auguria Premium"
    - `auto_recurring.frequency`: 1
    - `auto_recurring.frequency_type`: "months"
    - `auto_recurring.transaction_amount`: (configurable via argumento CLI)
    - `auto_recurring.currency_id`: "ARS"
  - Imprime el `preapproval_plan_id` resultante
  - Instrucciones para guardar en `.env` como `MP_PREAPPROVAL_PLAN_ID`
- [x] Agregar npm script: `"mp:create-plan": "ts-node -r tsconfig-paths/register scripts/create-mp-preapproval-plan.ts"`
- [x] Documentado en el propio script con JSDoc y ejemplos de uso

#### 🎯 Criterios de aceptación

- [x] Script ejecutable que crea plan en MP y muestra el ID
- [x] Documentación clara del proceso
- [x] Precio configurable por argumento

**Notas técnicas:**
- PR: `feature/t-qa-02-mp-create-plan-script` → `develop`
- Archivo nuevo: `backend/tarot-app/scripts/create-mp-preapproval-plan.ts`
- Archivo modificado: `backend/tarot-app/package.json` (nuevo script `mp:create-plan`)
- Usa `PreApprovalPlan` del SDK de MercadoPago directamente (sin NestFactory)
- Carga `.env` con `dotenv` de forma standalone
- Detecta entorno sandbox vs producción según prefijo del token (`TEST-`)
- Argumentos CLI: `--amount=<ARS>` (default 2999), `--reason=<texto>` (default "Auguria Premium")
- `back_url` usa `FRONTEND_URL` del `.env` o fallback a `http://localhost:3001/premium`
- Ciclo de calidad: format ✅ lint ✅ build ✅

---

### T-QA-03: Tests de integración del flujo webhook → activación

**Prioridad:** 🟡 MEDIA
**Estimación:** 1.5 días
**Dependencias:** T-INT-02, T-INT-03
**Estado:** ✅ COMPLETADA

**Contexto:** Los tests unitarios de cada use case están incluidos en sus tareas respectivas. Se necesitan tests de integración que validen el flujo end-to-end: webhook recibido → plan actualizado → endpoint status retorna premium.

#### ✅ Tareas específicas

**Backend:**
- [x] Test de integración: simular webhook `subscription_preapproval` con `status=authorized` → verificar que `GET /subscriptions/status` retorna `plan=premium`
- [x] Test de integración: simular webhook `payment` con `external_reference=sub_X` y `status=approved` → verificar que `planExpiresAt` se actualiza
- [x] Test de integración: simular cancelación → webhook `subscription_preapproval` con `status=cancelled` → verificar que plan sigue premium pero `subscriptionStatus=cancelled`
- [x] Test de integración: simular que CRON corre después de `planExpiresAt` → verificar que plan se degrada a free
- [x] Test: webhook de pago de servicio holístico con `external_reference` numérico → sigue procesándose normalmente (no regresión)

#### 🎯 Criterios de aceptación

- [x] Flujo completo de activación testeado end-to-end
- [x] Flujo de cancelación testeado end-to-end
- [x] Flujo de degradación por CRON testeado
- [x] No regresión en pagos de servicios holísticos
- [x] Coverage ≥ 80%

---

 ### T-QA-04: Tests E2E del flujo completo de upgrade (frontend)

**Prioridad:** 🟢 BAJA
**Estimación:** 1.5 días
**Dependencias:** T-FE-03, T-FE-05, T-FE-06
**Estado:** ✅ COMPLETADA

**Contexto:** Validar el flujo completo desde la perspectiva del usuario: ver CTA → ir a /premium → crear suscripción → volver a /premium/activacion → ver éxito.

#### ✅ Tareas específicas

**Frontend:**
- [x] Test E2E (Playwright): usuario free navega a `/premium`, ve tabla de planes
- [x] Test E2E: click en "Comenzar Premium" redirige a MP (mock de MP en test — verificar que `window.location` cambia a URL de MP)
- [x] Test E2E: usuario llega a `/premium/activacion?status=authorized`, polling detecta premium, muestra éxito
- [x] Test E2E: usuario en perfil ve estado de suscripción correcto
- [x] Test E2E: usuario cancela suscripción desde perfil, ve confirmación
- [x] Test E2E: upgrade prompts en readings funcionan correctamente

#### 🎯 Criterios de aceptación

- [x] Flujo de upgrade completo testeado con Playwright
- [x] Flujo de cancelación testeado
- [x] Upgrade prompts en features premium testeados
- [x] Tests pasan en CI

---

### T-QA-05: Actualizar documentación del proyecto

**Prioridad:** 🟢 BAJA
**Estimación:** 0.5 días
**Dependencias:** Todas las tareas anteriores
**Estado:** ✅ COMPLETADA

**Contexto:** La documentación del proyecto necesita reflejar los nuevos módulos, endpoints, y flujos.

#### ✅ Tareas específicas

**Documentación:**
- [x] Actualizar `backend/tarot-app/docs/API_DOCUMENTATION.md`: agregar endpoints de suscripción (create-preapproval, cancel, status)
- [x] Actualizar `backend/tarot-app/docs/ARCHITECTURE.md`: agregar `payments.module` al diagrama de módulos
- [x] Actualizar `ROUTES` y endpoints en docs si hay alguna referencia
- [x] Marcar ADR como "Aceptado" en `docs/ADR_SUBSCRIPTION_PREMIUM_FLOW.md`

#### 🎯 Criterios de aceptación

- [x] Documentación refleja la arquitectura actual
- [x] Endpoints nuevos documentados
- [x] ADR marcado como aceptado
