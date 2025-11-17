# Análisis de Implementación Existente - TASK-054, TASK-054-a, TASK-054-b

**Fecha:** 17 de Noviembre, 2025  
**Analista:** GitHub Copilot  
**Objetivo:** Analizar funcionalidad existente vs. tareas planificadas para evitar duplicación

---

## 📊 Resumen Ejecutivo

La aplicación **YA TIENE IMPLEMENTADA** gran parte de la infraestructura necesaria para las tareas TASK-054, TASK-054-a y TASK-054-b. A continuación el análisis detallado:

### ✅ Lo que YA EXISTE:

1. **Sistema de tracking de uso de IA** (ai-usage module)
2. **Sistema de fallback automático entre providers** (AIProviderService)
3. **Cálculo automático de costos** (AIUsageService)
4. **Logging de uso por provider** (AIUsageLog entity)
5. **Circuit breakers y retry logic** (en AIProviderService)
6. **Límites de uso diarios** (usage-limits module)
7. **Alertas de rate limiting** (shouldAlert en AIUsageService)

### ⚠️ Lo que FALTA (y debe implementarse):

1. **Campos en User entity** para tracking mensual de AI usage
2. **Cuotas mensuales por plan** (FREE: 100/mes, PREMIUM: ilimitado)
3. **Guard de cuotas mensuales** (AIQuotaGuard)
4. **Endpoint GET /usage/ai** para consulta de usuario
5. **Cron job de reset mensual** de contadores
6. **Notificaciones de cuotas** (80% y 100%)
7. **Límites hard de gasto** por provider (TASK-054-b)

---

## 🔍 Análisis Detallado por Tarea

### TASK-054: Sistema de Cuotas de IA por Usuario

#### ✅ YA IMPLEMENTADO:

1. **AIUsageLog Entity** (`src/modules/ai-usage/entities/ai-usage-log.entity.ts`):

   - ✅ Tracking de provider usado (GROQ, DEEPSEEK, OPENAI, GEMINI)
   - ✅ Tracking de tokens (prompt, completion, total)
   - ✅ Cálculo de costos en USD
   - ✅ Relación con User y Reading
   - ✅ Campo `fallbackUsed` para analytics
   - ✅ Índices optimizados `(userId, createdAt)` y `(provider, createdAt)`

2. **AIUsageService** (`src/modules/ai-usage/ai-usage.service.ts`):

   - ✅ Método `createLog()` para registrar uso
   - ✅ Método `calculateCost()` con pricing por provider:
     ```typescript
     GROQ: { input: 0, output: 0 }        // Gratis
     DEEPSEEK: { input: 0.14, output: 0.28 } // $0.14/M input, $0.28/M output
     OPENAI: { input: 0.15, output: 0.6 }   // $0.15/M input, $0.60/M output
     ```
   - ✅ Método `getStatistics()` con métricas por provider
   - ✅ Método `shouldAlert()` con alertas configurables:
     - `groqRateLimit`: 12,000 calls/día (threshold)
     - `highErrorRate`: >5%
     - `highFallbackRate`: >10%
     - `highDailyCost`: >$2/día

3. **AIUsageController** (`src/modules/ai-usage/ai-usage.controller.ts`):

   - ✅ Endpoint `GET /admin/ai-usage` (solo admin)
   - ✅ Filtros por startDate y endDate
   - ✅ Retorna statistics + alerts

4. **UsageLimitsService** (`src/modules/usage-limits/usage-limits.service.ts`):

   - ✅ Sistema de límites DIARIOS por feature
   - ✅ Método `checkLimit()` para verificar
   - ✅ Método `incrementUsage()` con atomic increment
   - ✅ Método `getRemainingUsage()`
   - ✅ Configuración por plan (FREE vs PREMIUM):
     ```typescript
     FREE: {
       TAROT_READING: 3/día,
       INTERPRETATION_REGENERATION: 0/día,
       ORACLE_QUERY: 5/día
     }
     PREMIUM: {
       TAROT_READING: -1 (ilimitado),
       INTERPRETATION_REGENERATION: -1,
       ORACLE_QUERY: -1
     }
     ```

5. **CheckUsageLimitGuard** (`src/modules/usage-limits/guards/check-usage-limit.guard.ts`):
   - ✅ Guard funcional para límites diarios
   - ✅ Error 403 descriptivo cuando se excede límite

#### ❌ FALTA IMPLEMENTAR:

1. **Campos en User Entity** para tracking mensual:

   ```typescript
   // Agregar a src/modules/users/entities/user.entity.ts
   @Column({ name: 'ai_requests_used_month', type: 'int', default: 0 })
   aiRequestsUsedMonth: number;

   @Column({ name: 'ai_cost_usd_month', type: 'decimal', precision: 10, scale: 6, default: 0 })
   aiCostUsdMonth: number;

   @Column({ name: 'ai_tokens_used_month', type: 'int', default: 0 })
   aiTokensUsedMonth: number;

   @Column({ name: 'ai_provider_used', type: 'varchar', length: 50, nullable: true })
   aiProviderUsed: string | null;

   @Column({ name: 'quota_warning_sent', type: 'boolean', default: false })
   quotaWarningSent: boolean;

   @Column({ name: 'ai_usage_reset_at', type: 'timestamp', nullable: true })
   aiUsageResetAt: Date | null;
   ```

2. **AIQuotaService** (nuevo servicio):

   - Método `trackMonthlyUsage(userId, requests, tokens, cost, provider)`:
     - Incrementar contadores en User
     - Verificar soft limit (80%) y hard limit (100%)
     - Disparar notificaciones si corresponde
   - Método `checkMonthlyQuota(userId)`: verificar si NO excedió cuota
   - Método `getRemainingQuota(userId)`: retornar cuota restante
   - Método `resetMonthlyCounters()`: resetear todos los usuarios (cron)

3. **AIQuotaGuard** (nuevo guard):

   - Verificar cuota mensual antes de generar interpretación
   - Error 429 descriptivo con mensaje según plan:
     - FREE: "Has alcanzado tu límite de 100 interpretaciones mensuales"
     - Sugerencia: "Actualiza a plan Premium para interpretaciones ilimitadas"

4. **Endpoint GET /usage/ai**:

   ```typescript
   // Crear en nuevo controller: AIQuotaController
   @Get('/usage/ai')
   @UseGuards(JwtAuthGuard)
   async getMyAIUsage(@CurrentUser() user: User) {
     return {
       requestsUsedThisMonth: user.aiRequestsUsedMonth,
       tokensUsedThisMonth: user.aiTokensUsedMonth,
       costEstimatedThisMonth: user.aiCostUsdMonth,
       providerPrimarilyUsed: user.aiProviderUsed,
       quotaLimit: user.plan === 'free' ? 100 : -1,
       percentageUsed: ...,
       resetDate: ...,
       warningTriggered: user.quotaWarningSent
     };
   }
   ```

5. **Cron Job de Reset Mensual**:

   ```typescript
   // En AIQuotaService
   @Cron('0 0 1 * *') // Día 1 de cada mes a las 00:00
   async resetMonthlyQuotas() {
     await this.userRepository.update({}, {
       aiRequestsUsedMonth: 0,
       aiCostUsdMonth: 0,
       aiTokensUsedMonth: 0,
       quotaWarningSent: false,
       aiUsageResetAt: new Date()
     });
   }
   ```

6. **Integración con AIProviderService**:

   - Después de llamar `aiUsageService.createLog()`, también llamar:
     ```typescript
     await this.aiQuotaService.trackMonthlyUsage(
       userId,
       1, // 1 request
       response.tokensUsed.total,
       costUsd,
       response.provider,
     );
     ```

7. **Notificaciones de Cuotas**:
   - Integrar con EmailService (TASK-040)
   - Template: `quota-warning-80.html`
   - Template: `quota-limit-reached.html`

---

### TASK-054-a: Fallback Automático Escalonado

#### ✅ YA IMPLEMENTADO (COMPLETAMENTE):

**AIProviderService** (`src/modules/ai/application/services/ai-provider.service.ts`):

1. ✅ **Fallback automático** implementado en `generateCompletion()`:

   - Intenta providers en orden: Groq → DeepSeek → OpenAI
   - Si uno falla, automáticamente prueba el siguiente
   - Logging detallado de cada intento

2. ✅ **Circuit Breakers** implementados:

   - Clase `CircuitBreaker` con estados CLOSED/OPEN/HALF_OPEN
   - Threshold: 5 fallos consecutivos
   - Timeout: 5 minutos (300,000ms)
   - Skip automático de providers con circuito abierto

3. ✅ **Retry con Backoff Exponencial**:

   - 3 reintentos por provider
   - Implementado en `retryWithBackoff()` utility
   - Delays: 1s, 2s, 4s

4. ✅ **Logging de Fallback**:

   - Campo `fallbackUsed: boolean` en AIUsageLog
   - Logs de advertencia cuando hay fallback
   - Logging de estado de circuit breaker

5. ✅ **Detección de Errores**:

   - Detecta errores de rate limit (429)
   - Detecta network errors
   - Registra en AIUsageLog con status ERROR

6. ✅ **Métodos de Monitoreo**:
   - `getProvidersStatus()`: estado de cada provider
   - `getPrimaryProvider()`: provider principal disponible
   - `getCircuitBreakerStats()`: estadísticas de circuit breakers

#### ❌ FALTA IMPLEMENTAR:

**Nada crítico**, pero puede mejorarse:

1. **Health Check Endpoint** `/health/ai` (opcional):

   ```typescript
   // En HealthController
   @Get('/ai')
   async checkAIProviders() {
     const statuses = await this.aiProviderService.getProvidersStatus();
     const cbStats = this.aiProviderService.getCircuitBreakerStats();
     return {
       status: statuses.some(s => s.available) ? 'healthy' : 'degraded',
       providers: statuses,
       circuitBreakers: cbStats
     };
   }
   ```

2. **Endpoint Admin de Fallback Stats** (opcional):

   ```typescript
   // En AIUsageController
   @Get('/fallback-stats')
   async getFallbackStats() {
     // Consultar AIUsageLog para obtener:
     // - Número de fallbacks en últimas 24h
     // - Provider más usado
     // - Tasa de éxito por provider
   }
   ```

3. **Alertas de Fallback** (ya existe `shouldAlert('highFallbackRate')`):
   - ✅ Ya implementado en AIUsageService
   - ⚠️ Falta integrar con EmailService para notificar admin

#### 📝 CONCLUSIÓN TASK-054-a:

**Estado: 95% COMPLETADO** ✅

La funcionalidad core de fallback automático YA ESTÁ IMPLEMENTADA. Solo faltan mejoras opcionales de monitoreo y alertas.

**Recomendación:** Marcar TASK-054-a como completada y crear subtareas opcionales para health checks y alertas.

---

### TASK-054-b: Límite Hard de Gasto en Providers de Pago

#### ✅ YA IMPLEMENTADO:

1. **Cálculo de Costos**:

   - ✅ Método `calculateCost()` en AIUsageService
   - ✅ Pricing correcto por provider
   - ✅ Costos almacenados en AIUsageLog

2. **Tracking de Costos**:

   - ✅ Campo `costUsd` en AIUsageLog
   - ✅ Método `getStatistics()` retorna `totalCost` por provider

3. **Alertas de Costos**:
   - ✅ `shouldAlert('highDailyCost')`: threshold $2/día
   - ✅ Consulta costos en tiempo real

#### ❌ FALTA IMPLEMENTAR:

**Todo el sistema de límites hard está pendiente:**

1. **AIProviderUsage Entity** (nueva entidad):

   ```typescript
   @Entity('ai_provider_usage')
   export class AIProviderUsage {
     @PrimaryColumn({ type: 'enum', enum: AIProvider })
     provider: AIProvider;

     @PrimaryColumn({ type: 'char', length: 7 }) // 'YYYY-MM'
     month: string;

     @Column({ type: 'int', default: 0 })
     totalRequests: number;

     @Column({ type: 'bigint', default: 0 })
     totalTokens: number;

     @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
     costUsed: number;

     @Column({ type: 'decimal', precision: 10, scale: 6 })
     monthlyLimit: number;

     @Column({ type: 'boolean', default: false })
     limitReached: boolean;

     @UpdateDateColumn()
     updatedAt: Date;
   }
   ```

2. **AIProviderCostService** (nuevo servicio):

   - `trackUsage(provider, tokens, cost)`: incrementar counters
   - `canUseProvider(provider)`: verificar si NO alcanzó límite
   - `getRemainingBudget(provider)`: calcular restante
   - `notifyAdmin(provider, percentage)`: enviar email a admin
   - `resetMonthlyCounters()`: cron del día 1 de mes

3. **Variables de Entorno**:

   ```bash
   # Agregar a .env.example
   DEEPSEEK_MAX_MONTHLY_COST_USD=20.00
   OPENAI_MAX_MONTHLY_COST_USD=50.00
   AI_COST_ALERT_EMAIL=admin@tarotflavia.com
   ```

4. **Integración en AIProviderService**:

   - Antes de intentar provider de pago, verificar:
     ```typescript
     const canUse = await this.costService.canUseProvider(provider);
     if (!canUse) {
       this.logger.warn(`${provider} limit reached, skipping`);
       continue; // Probar siguiente provider
     }
     ```
   - Después de éxito, trackear:
     ```typescript
     await this.costService.trackUsage(
       provider,
       response.tokensUsed.total,
       costUsd,
     );
     ```

5. **Endpoints Admin**:

   ```typescript
   @Get('/admin/ai-costs')
   async getAICosts() { ... }

   @Patch('/admin/ai-costs/:provider/limit')
   async updateCostLimit(
     @Param('provider') provider: AIProvider,
     @Body() dto: UpdateCostLimitDto
   ) { ... }
   ```

6. **Cron Job**:
   ```typescript
   @Cron('0 0 1 * *') // Día 1 a las 00:00
   async resetMonthlyCosts() {
     await this.costService.resetMonthlyCounters();
   }
   ```

#### 📝 CONCLUSIÓN TASK-054-b:

**Estado: 0% COMPLETADO** ❌

Debe implementarse completamente. La infraestructura de tracking existe, pero falta la lógica de límites hard.

---

## 📋 Plan de Acción Actualizado

### TASK-054: Sistema de Cuotas de IA por Usuario (3 días)

**Subtareas a implementar:**

1. ✅ **Migración de Base de Datos** (0.5 días):

   - Agregar campos a User entity
   - Migración para actualizar tabla `user`

2. ✅ **AIQuotaService** (1 día):

   - `trackMonthlyUsage()`
   - `checkMonthlyQuota()`
   - `getRemainingQuota()`
   - `resetMonthlyCounters()` con cron job

3. ✅ **AIQuotaGuard** (0.5 días):

   - Guard para verificar cuota mensual
   - Mensajes de error descriptivos

4. ✅ **AIQuotaController** (0.5 días):

   - Endpoint `GET /usage/ai`
   - Integración con User data

5. ✅ **Integración** (0.5 días):
   - Llamar AIQuotaService desde AIProviderService
   - Tests de integración

**Estimación ajustada:** 3 días (sin cambios)

---

### TASK-054-a: Fallback Automático (OPCIONAL - 0.5 días)

**Estado:** ✅ **95% COMPLETADO**

**Subtareas opcionales:**

1. ⚠️ **Health Check Endpoint** (0.25 días):

   - `GET /health/ai`
   - Integración en HealthModule

2. ⚠️ **Alertas de Fallback** (0.25 días):
   - Integrar con EmailService
   - Email a admin cuando fallback rate > 10%

**Estimación ajustada:** 0.5 días (reducido de 2 días)

**Recomendación:** Marcar como completada si no se requieren mejoras opcionales.

---

### TASK-054-b: Límites Hard de Gasto (1.5 días)

**Subtareas a implementar:**

1. ✅ **AIProviderUsage Entity** (0.25 días):

   - Crear entity
   - Migración

2. ✅ **AIProviderCostService** (0.5 días):

   - `trackUsage()`
   - `canUseProvider()`
   - `getRemainingBudget()`
   - `notifyAdmin()`
   - Cron job de reset mensual

3. ✅ **Integración en AIProviderService** (0.25 días):

   - Verificar límites antes de usar provider
   - Trackear uso después de éxito

4. ✅ **Variables de Entorno** (0.1 días):

   - Agregar a .env.example
   - Validación en env.validation.ts

5. ✅ **Endpoints Admin** (0.25 días):

   - `GET /admin/ai-costs`
   - `PATCH /admin/ai-costs/:provider/limit`

6. ✅ **Tests** (0.15 días):
   - Tests unitarios
   - Tests E2E de bloqueo

**Estimación ajustada:** 1.5 días (sin cambios)

---

## 🎯 Recomendaciones Finales

### Orden de Implementación Sugerido:

1. **TASK-054** (ALTA PRIORIDAD) - 3 días

   - Implementar sistema de cuotas mensuales
   - Crítico para evitar abuse y controlar costos

2. **TASK-054-b** (ALTA PRIORIDAD) - 1.5 días

   - Implementar límites hard de gasto
   - Protección financiera esencial

3. **TASK-054-a** (OPCIONAL) - 0.5 días
   - Mejoras de monitoreo y alertas
   - El core ya está implementado

### Total Estimado: 5 días (reducido de 6.5 días originales)

**Ahorro:** 1.5 días gracias a implementación previa de fallback automático.

---

## ✅ Checklist de Validación

Antes de comenzar implementación, verificar:

- [x] AIUsageLog entity existe y tiene campos necesarios
- [x] AIUsageService tiene método calculateCost()
- [x] AIProviderService tiene fallback automático
- [x] UsageLimitsService existe para límites diarios
- [x] Circuit breakers implementados
- [x] Retry logic implementado
- [ ] User entity NO tiene campos de tracking mensual (pendiente)
- [ ] NO existe AIQuotaService (pendiente)
- [ ] NO existe AIQuotaGuard (pendiente)
- [ ] NO existe endpoint GET /usage/ai (pendiente)
- [ ] NO existe AIProviderUsage entity (pendiente)
- [ ] NO existe AIProviderCostService (pendiente)
- [ ] NO existen límites hard de gasto (pendiente)

---

**Documento generado automáticamente el:** 2025-11-17  
**Próxima revisión:** Antes de implementar TASK-054
