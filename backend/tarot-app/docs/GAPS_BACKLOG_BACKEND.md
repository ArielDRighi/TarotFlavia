# 🎯 Backlog GAPs Identificados - Backend

**Proyecto:** Auguria - Correcciones Post-Audit
**Fecha de creación:** 2026-01-07
**Origen:** Validación técnica USER_STORIES_AUDIT.md

---

## 📊 CONTEXTO

Este backlog contiene tareas backend derivadas de la auditoría técnica realizada contra el modelo de negocio definido. Los GAPs fueron identificados en la validación del código vs la visión del producto.

**Documento de referencia:** `frontend/docs/USER_STORIES_AUDIT.md`

---

## 🏆 PRIORIZACIÓN

- **P0 - CRÍTICO:** Bloqueantes para monetización o lanzamiento
- **P1 - IMPORTANTE:** Mejoran experiencia o diferenciación, requeridos post-MVP
- **P2 - MEJORA:** Nice-to-have, no bloqueantes

---

## 📦 Epic GAP-1: Límite de Historial por Plan

> **Origen:** GAP-1 en USER_STORIES_AUDIT.md
> **Problema:** Endpoint `/readings` devuelve mismo resultado para FREE y PREMIUM
> **Objetivo:** Implementar límite de historial diferenciado por plan

---

### **TASK-GAP-101: Implementar límite de historial en endpoint GET /readings**

**Prioridad:** 🟡 P1 - IMPORTANTE
**Estimación:** 4 horas
**Dependencias:** Ninguna
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-101-history-limit`

#### 📋 Descripción

Modificar el endpoint `GET /readings` para aplicar límite de resultados según el plan del usuario. FREE debe ver solo las últimas N lecturas, PREMIUM debe ver todas sin límite.

#### ✅ Tareas específicas

- [ ] Definir límite de historial para FREE:
  - Recomendación: Últimas 30 lecturas o último mes
  - Agregar constante en `src/lib/constants/config.ts`
  - Documentar decisión en código
- [ ] Modificar `ReadingsService.findMyReadings()`:
  - Detectar plan del usuario desde JWT o relación User
  - Si `user.plan === 'FREE'`: aplicar límite en query
  - Si `user.plan === 'PREMIUM'`: sin límite (actual)
  - Mantener paginación funcionando
- [ ] Agregar campo en respuesta de paginación:
  - `hasLimitedHistory: boolean` (true para FREE)
  - `historyLimit: number | null` (null para PREMIUM)
  - Frontend usará esto para mostrar banner
- [ ] Modificar query TypeORM:
  - Para FREE: agregar `.take(HISTORY_LIMIT)` después de filtros
  - Mantener ordenamiento por `createdAt DESC`
  - Asegurar que paginación respeta límite global
- [ ] Escribir tests unitarios:
  - Usuario FREE solo ve últimas N lecturas
  - Usuario PREMIUM ve todas sus lecturas
  - Paginación funciona correctamente con límite
  - Metadata de respuesta incluye `hasLimitedHistory`
- [ ] Escribir test E2E:
  - Crear usuario FREE con 50 lecturas
  - Verificar que endpoint devuelve solo 30
  - Verificar que flag `hasLimitedHistory: true`
  - Crear usuario PREMIUM con 50 lecturas
  - Verificar que endpoint devuelve todas
  - Verificar que flag `hasLimitedHistory: false`

#### 🎯 Criterios de aceptación

- ✅ Usuarios FREE ven solo últimas N lecturas (ej: 30)
- ✅ Usuarios PREMIUM ven todas sus lecturas sin límite
- ✅ La respuesta incluye metadata sobre límite de historial
- ✅ Paginación funciona correctamente para ambos casos
- ✅ Tests unitarios y E2E pasan con 100% coverage

#### 📝 Notas técnicas

- **Archivo afectado:** `src/modules/readings/readings.service.ts`
- **Endpoint:** `GET /api/readings`
- **Límite sugerido FREE:** 30 lecturas o 30 días
- **Metadata adicional:**
  ```typescript
  {
    data: Reading[],
    meta: {
      page: number,
      limit: number,
      total: number,
      hasLimitedHistory: boolean, // NUEVO
      historyLimit: number | null  // NUEVO
    }
  }
  ```

#### 🔗 Referencias

- GAP-1 en USER_STORIES_AUDIT.md
- Requiere: Frontend TASK-GAP-002 para mostrar límite

---

## 📦 Epic GAP-2: Integración de Mercado Pago

> **Origen:** GAP-4 en USER_STORIES_AUDIT.md
> **Problema:** Sin pasarela de pago = CERO revenue
> **Objetivo:** Implementar backend de suscripciones con Mercado Pago

---

### **TASK-GAP-102: Crear módulo de Subscriptions y integración Mercado Pago**

**Prioridad:** 🔴 P0 - CRÍTICO
**Estimación:** 16 horas
**Dependencias:** Decisiones de diseño (frontend TASK-GAP-003)
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-102-mercadopago-subscriptions`

#### 📋 Descripción

Crear módulo completo de subscripciones que integre Mercado Pago para manejar upgrades FREE → PREMIUM, webhooks de pago, y actualización de planes de usuario.

#### ✅ Tareas específicas

- [ ] Instalar SDK de Mercado Pago:
  - `npm install mercadopago -w backend/tarot-app`
  - Configurar credentials en `.env`:
    - `MERCADOPAGO_ACCESS_TOKEN`
    - `MERCADOPAGO_PUBLIC_KEY`
- [ ] Crear módulo `SubscriptionsModule`:
  - `nest g module subscriptions`
  - `nest g service subscriptions`
  - `nest g controller subscriptions`
- [ ] Crear entidad `Subscription`:
  ```typescript
  @Entity('subscriptions')
  class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @Column()
    mercadoPagoSubscriptionId: string;

    @Column()
    status: 'pending' | 'active' | 'cancelled' | 'paused';

    @Column()
    plan: 'PREMIUM';

    @Column({ type: 'decimal' })
    amount: number;

    @Column()
    currency: string; // 'ARS', 'USD', etc.

    @Column()
    billingCycle: 'monthly' | 'yearly';

    @Column({ nullable: true })
    nextBillingDate: Date;

    @Column({ nullable: true })
    cancelledAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
  }
  ```
- [ ] Implementar `SubscriptionsService`:
  - `createPreference(userId, plan)` - Genera preference_id de MP
  - `handleWebhook(payload)` - Procesa notificaciones de MP
  - `cancelSubscription(userId)` - Cancela suscripción
  - `getSubscriptionStatus(userId)` - Consulta estado actual
  - `updateUserPlan(userId, plan)` - Actualiza User.plan
- [ ] Crear endpoints en `SubscriptionsController`:
  - `POST /subscriptions/create-preference` - Crea preference para checkout
  - `POST /subscriptions/webhook` - Recibe notificaciones de MP
  - `GET /subscriptions/status` - Consulta estado de suscripción
  - `POST /subscriptions/cancel` - Cancela suscripción (usuario)
- [ ] Implementar validación de webhook de Mercado Pago:
  - Verificar firma del webhook (x-signature)
  - Validar que evento proviene de MP legítimo
  - Documentar en código el flujo de validación
- [ ] Implementar lógica de actualización de plan:
  - Al recibir webhook `payment.created` con status `approved`:
    - Crear/actualizar registro Subscription
    - Actualizar `User.plan = 'PREMIUM'`
    - Actualizar `User.subscriptionExpiresAt` (1 mes desde hoy)
    - Enviar email de confirmación (opcional)
  - Al recibir `subscription.cancelled`:
    - Marcar Subscription.status = 'cancelled'
    - Actualizar `User.plan = 'FREE'` (si expiró)
- [ ] Crear migration para tabla `subscriptions`
- [ ] Escribir tests unitarios para `SubscriptionsService`:
  - Creación de preference devuelve datos válidos
  - Webhook válido actualiza User.plan correctamente
  - Webhook inválido es rechazado
  - Cancelación funciona correctamente
- [ ] Escribir tests E2E para flujo completo:
  - Mock de webhook de MP con pago aprobado
  - Verificar que User.plan se actualiza a PREMIUM
  - Verificar que Subscription se crea correctamente
  - Mock de webhook de cancelación
  - Verificar que User.plan vuelve a FREE tras expiración

#### 🎯 Criterios de aceptación

- ✅ Usuario FREE puede iniciar proceso de upgrade
- ✅ Se genera preference_id de Mercado Pago correctamente
- ✅ Webhook de MP actualiza plan de usuario automáticamente
- ✅ Usuario PREMIUM tiene acceso inmediato tras pago aprobado
- ✅ Cancelación de suscripción funciona correctamente
- ✅ Webhooks maliciosos son rechazados (validación firma)
- ✅ Tests E2E simulan flujo completo de upgrade

#### 📝 Notas técnicas

- **Módulo nuevo:** `src/modules/subscriptions/`
- **Entidad:** `Subscription`
- **Endpoints:**
  - `POST /api/subscriptions/create-preference`
  - `POST /api/subscriptions/webhook` (sin auth)
  - `GET /api/subscriptions/status` (auth required)
  - `POST /api/subscriptions/cancel` (auth required)
- **Webhook URL:** Debe ser pública y accesible por MP
- **Testing:** Usar Mercado Pago Sandbox para pruebas

#### 🔗 Referencias

- GAP-4 en USER_STORIES_AUDIT.md
- Documentación MP: https://www.mercadopago.com.ar/developers/
- Requiere: Frontend TASK-GAP-004

---

### **TASK-GAP-103: Implementar scheduler para verificar suscripciones expiradas**

**Prioridad:** 🔴 P0 - CRÍTICO
**Estimación:** 4 horas
**Dependencias:** TASK-GAP-102
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-103-subscription-scheduler`

#### 📋 Descripción

Implementar job scheduler que verifique diariamente suscripciones expiradas y actualice el plan de usuarios de PREMIUM a FREE cuando corresponda.

#### ✅ Tareas específicas

- [ ] Instalar `@nestjs/schedule`:
  - `npm install @nestjs/schedule -w backend/tarot-app`
  - Importar `ScheduleModule` en `AppModule`
- [ ] Crear `SubscriptionScheduler` service:
  - Inyectar `SubscriptionsService` y `UsersService`
  - Implementar método `@Cron()` que ejecuta diariamente
- [ ] Implementar lógica de verificación:
  - Query a DB: usuarios con `plan = 'PREMIUM'` y `subscriptionExpiresAt < NOW()`
  - Para cada usuario:
    - Verificar estado en Mercado Pago (API call)
    - Si suscripción cancelada o expirada:
      - Actualizar `User.plan = 'FREE'`
      - Marcar `Subscription.status = 'cancelled'`
      - Enviar email de notificación (opcional)
    - Si suscripción activa pero fecha expiró:
      - Extender `subscriptionExpiresAt` (+1 mes)
      - Mantener `plan = 'PREMIUM'`
- [ ] Agregar logging detallado:
  - Log de inicio de job
  - Log de cada usuario procesado
  - Log de errores en API de MP
  - Log de finalización con contadores
- [ ] Configurar cron expression:
  - Ejecutar diariamente a las 2 AM: `0 0 2 * * *`
  - Hacer configurable vía env: `SUBSCRIPTION_CHECK_CRON`
- [ ] Escribir tests unitarios:
  - Mock de usuarios con suscripción expirada
  - Verificar que plan se actualiza a FREE
  - Verificar que suscripción activa no se toca
  - Verificar manejo de errores de MP API

#### 🎯 Criterios de aceptación

- ✅ Job ejecuta diariamente sin intervención manual
- ✅ Usuarios con suscripción expirada vuelven a FREE
- ✅ Usuarios con suscripción activa mantienen PREMIUM
- ✅ Errores de MP API se manejan gracefully
- ✅ Logs permiten auditar ejecuciones
- ✅ Tests unitarios pasan con 100% coverage

#### 📝 Notas técnicas

- **Archivo nuevo:** `src/modules/subscriptions/subscription.scheduler.ts`
- **Cron expression:** `0 0 2 * * *` (2 AM diario)
- **API MP:** `GET /v1/subscriptions/{id}` para verificar estado
- **Manejo de errores:** No debe crashear si MP API falla

#### 🔗 Referencias

- Depende de TASK-GAP-102
- NestJS Scheduler: https://docs.nestjs.com/techniques/task-scheduling

---

## 📦 Epic GAP-3: Validación de Límites de Tiradas

> **Origen:** GAP-2 en USER_STORIES_AUDIT.md
> **Problema:** No hay evidencia clara del límite 1 FREE / 3 PREMIUM
> **Objetivo:** Validar y documentar que límites funcionan correctamente

---

### **TASK-GAP-104: Validar y documentar límites de tiradas por plan**

**Prioridad:** 🔴 P0 - CRÍTICO (validación)
**Estimación:** 2 horas
**Dependencias:** Ninguna
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `docs/GAP-104-validate-reading-limits`

#### 📋 Descripción

Validar mediante tests E2E que los límites de tiradas de tarot funcionan correctamente según el plan del usuario, y documentar la implementación actual.

#### ✅ Tareas específicas

- [ ] Revisar código actual de límites:
  - Ubicar lógica en `ReadingsService` o middleware
  - Verificar cómo se calcula `dailyReadingsCount`
  - Verificar cómo se obtiene `dailyReadingsLimit` por plan
  - Documentar flujo en comentarios de código
- [ ] Agregar constantes explícitas si no existen:
  ```typescript
  // src/modules/readings/constants/limits.ts
  export const READING_LIMITS = {
    ANONYMOUS: 0,  // No pueden hacer tiradas completas
    FREE: 1,       // 1 tirada por día
    PREMIUM: 3,    // 3 tiradas por día
  } as const;
  ```
- [ ] Escribir tests E2E que validen límites:
  - Usuario FREE hace 1 tirada → OK
  - Usuario FREE intenta 2da tirada → 403 Forbidden
  - Usuario PREMIUM hace 3 tiradas → OK
  - Usuario PREMIUM intenta 4ta tirada → 403 Forbidden
  - Verificar que límite resetea a medianoche (mock de fecha)
- [ ] Verificar endpoint `GET /me` devuelve:
  ```typescript
  {
    user: {
      ...
      plan: 'FREE' | 'PREMIUM',
      dailyReadingsCount: number,    // Lecturas hechas hoy
      dailyReadingsLimit: number,    // Límite según plan
    }
  }
  ```
- [ ] Documentar en `README` o `docs/LIMITS.md`:
  - Tabla de límites por plan
  - Cómo se calculan los límites
  - Cuándo se resetean (medianoche UTC)
  - Diferencia entre "carta del día" y "tiradas de tarot"

#### 🎯 Criterios de aceptación

- ✅ Tests E2E confirman que límites funcionan correctamente
- ✅ FREE puede hacer exactamente 1 tirada/día
- ✅ PREMIUM puede hacer exactamente 3 tiradas/día
- ✅ Límites se resetean correctamente a medianoche
- ✅ Endpoint `/me` devuelve información de límites
- ✅ Documentación clara sobre límites

#### 📝 Notas técnicas

- **Confirmación del dueño:** Límites YA funcionan correctamente
- **Objetivo:** Validar con tests y documentar
- **No requiere:** Cambios en lógica, solo tests y docs

#### 🔗 Referencias

- GAP-2 en USER_STORIES_AUDIT.md
- Confirmación: "Límites funcionan correctamente"

---

## 📦 Epic GAP-4: Configurabilidad de Límites

> **Origen:** GAP-5 en USER_STORIES_AUDIT.md
> **Problema:** Límites están hardcoded en config
> **Objetivo:** Hacer límites configurables desde admin sin deploy

---

### **TASK-GAP-105: Mover límites de planes a base de datos**

**Prioridad:** 🟢 P2 - MEJORA FUTURA
**Estimación:** 8 horas
**Dependencias:** Panel admin frontend (futuro)
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-105-configurable-limits`

#### 📋 Descripción

Migrar límites de planes (daily readings, daily cards, historial) desde constantes hardcoded a tabla de configuración en DB, permitiendo modificación desde panel admin.

#### ✅ Tareas específicas

- [ ] Crear entidad `PlanConfig`:
  ```typescript
  @Entity('plan_configs')
  class PlanConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    plan: 'ANONYMOUS' | 'FREE' | 'PREMIUM';

    @Column({ type: 'int' })
    dailyReadingsLimit: number;

    @Column({ type: 'int' })
    dailyCardsLimit: number;

    @Column({ type: 'int', nullable: true })
    historyLimit: number | null; // null = ilimitado

    @Column({ type: 'json', nullable: true })
    features: string[]; // ['ai_interpretation', 'categories', etc]

    @UpdateDateColumn()
    updatedAt: Date;
  }
  ```
- [ ] Crear migration con valores iniciales:
  - ANONYMOUS: dailyCardsLimit: 1, dailyReadingsLimit: 0
  - FREE: dailyCardsLimit: 1, dailyReadingsLimit: 1
  - PREMIUM: dailyCardsLimit: 1, dailyReadingsLimit: 3
- [ ] Crear `PlanConfigService`:
  - `getLimitsForPlan(plan)` - Obtiene límites del plan
  - `updateLimits(plan, limits)` - Actualiza límites (admin)
  - Cache en memoria para evitar DB hits constantes
- [ ] Modificar servicios que usan límites:
  - `ReadingsService`: usar `PlanConfigService` en lugar de constantes
  - `DailyReadingService`: usar `PlanConfigService`
  - Invalidar cache cuando se actualizan límites
- [ ] Crear endpoints admin (futuro):
  - `GET /admin/plans/config` - Obtener config de todos los planes
  - `PUT /admin/plans/config/:plan` - Actualizar config de un plan
  - Proteger con guard `@UseGuards(AdminGuard)`
- [ ] Escribir tests:
  - Migración inserta valores correctos
  - `PlanConfigService` devuelve límites correctos
  - Cache funciona correctamente
  - Actualización de límites se refleja inmediatamente

#### 🎯 Criterios de aceptación

- ✅ Límites se leen desde DB en lugar de constantes
- ✅ Actualización de límites no requiere deploy
- ✅ Cache evita DB hits innecesarios
- ✅ Valores por defecto son los correctos
- ✅ Endpoints admin funcionan (cuando exista panel)
- ✅ Tests pasan con 100% coverage

#### 📝 Notas técnicas

- **Prioridad baja:** No bloqueante para MVP
- **Beneficio:** Permite experimentar con límites sin deploy
- **Requiere:** Panel admin en frontend (futuro)

#### 🔗 Referencias

- GAP-5 en USER_STORIES_AUDIT.md
- Mejora futura, no crítico

---

## 📋 RESUMEN DE PRIORIDADES

### 🔴 P0 - CRÍTICO (Bloqueantes para monetización)
1. **TASK-GAP-102:** Integración Mercado Pago (16h)
2. **TASK-GAP-103:** Scheduler de suscripciones (4h)
3. **TASK-GAP-104:** Validar límites de tiradas (2h)

### 🟡 P1 - IMPORTANTE (Post-MVP)
4. **TASK-GAP-101:** Límite de historial por plan (4h)

### 🟢 P2 - MEJORA FUTURA
5. **TASK-GAP-105:** Límites configurables en DB (8h)

**Total estimado P0:** 22 horas (~3 días)
**Total estimado P1:** 4 horas
**Total estimado P2:** 8 horas

---

## 📝 NOTAS FINALES

- **Mercado Pago** es el único bloqueante crítico real
- **Scheduler de suscripciones** es necesario para no perder revenue
- **Validación de límites** es documentación, no nuevo código
- **Límites configurables** es mejora futura, no urgente

**Última actualización:** 2026-01-07
