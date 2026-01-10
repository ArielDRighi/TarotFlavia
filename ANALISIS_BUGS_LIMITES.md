# Análisis de Bugs en Sistema de Límites

**Fecha:** 10 Enero 2026
**Reportado por:** Usuario
**Estado:** En análisis

---

## 🐛 Problemas Reportados

### 1. Los límites NO se reinician de un día para el otro

**Síntoma:**

- Usuario consumió límites ayer (tanto FREE como PREMIUM)
- Hoy los límites siguen consumidos
- Al intentar Carta del Día o Tirada de Tarot, sale el modal de límite alcanzado

**Impacto:** CRÍTICO - Funcionalidad core no operativa

### 2. Modal incorrecto para usuarios PREMIUM

**Síntoma:**

- Usuarios PREMIUM que alcanzan su límite diario (3 tiradas/día)
- Reciben modal `UpgradeModal` que les dice "Upgrade a Premium"
- Deberían recibir `DailyLimitReachedModal` ("Vuelve mañana")

**Impacto:** MEDIO - UX confusa, pero los modales salen en el momento correcto

---

## 🔍 Análisis en Profundidad

### Problema 1: Límites no se reinician

#### ¿Cómo funciona actualmente?

**Hay DOS sistemas compitiendo:**

1. **UsageLimitsService (tabla `usage_limit`):**

   ```typescript
   // En checkLimit()
   const today = new Date();
   today.setUTCHours(0, 0, 0, 0);
   const dateString = today.toISOString().split("T")[0]; // '2026-01-10'

   // Busca registro WHERE date = '2026-01-10'
   const usageRecord = await usageLimitRepository.findOne({
     where: { userId, feature, date: dateString },
   });

   return (usageRecord?.count || 0) < limit;
   ```

   - Si existe registro con `count >= limit` → BLOQUEADO ❌
   - Si NO existe registro → DISPONIBLE ✅

2. **UserCapabilitiesService (tablas reales):**

   ```typescript
   // Para Carta del Día
   const existingDailyReading = await dailyReadingRepository.findOne({
     where: {
       userId,
       readingDate: MoreThanOrEqual(today), // Compara timestamps
     },
   });
   const dailyCardUsage = existingDailyReading ? 1 : 0;

   // Para Tiradas Tarot
   const tarotReadingsCount = await tarotReadingRepository.count({
     where: {
       user: { id: userId },
       createdAt: MoreThanOrEqual(today), // Compara timestamps
       deletedAt: IsNull(),
     },
   });
   ```

   - Consulta DIRECTO las tablas de lecturas
   - Más confiable, usa datos REALES ✅

**¿Cuál se está usando en producción?**

- ✅ **Carta del Día:** `CheckUsageLimitGuard` verifica DIRECTO `daily_reading` (correcto)
- ❌ **Tiradas Tarot:** `CheckUsageLimitGuard` usa `usageLimitsService.checkLimit()` (problema!)

#### Diagnóstico: LA CAUSA RAÍZ

**Código en `CheckUsageLimitGuard.canActivate()`:**

```typescript
// LÍNEA 54-73 - Para DAILY_CARD está bien ✅
if (feature === UsageFeature.DAILY_CARD) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const existingReading = await this.dailyReadingRepository.findOne({
    where: { userId, readingDate: MoreThanOrEqual(today) },
  });

  if (existingReading) throw new ForbiddenException("...");
  return true;
}

// LÍNEA 75-84 - Para otras features usa usage_limit ❌
const canUse = await this.usageLimitsService.checkLimit(userId, feature);

if (!canUse) {
  throw new ForbiddenException("Has alcanzado tu límite diario para esta función...");
}
```

**EL PROBLEMA:**

1. Usuario crea lectura de tarot → Se inserta en `tarot_reading` ✅
2. Interceptor `IncrementUsageInterceptor` inserta/incrementa `usage_limit` ✅
3. Al día siguiente:
   - `tarot_reading` tiene registro con `createdAt = '2026-01-09 20:00:00'`
   - Hoy es `2026-01-10 08:00:00`
   - **PERO** `usage_limit` tiene registro con `date = '2026-01-10'` SI el usuario ya intentó hoy ❌

**POR QUÉ NO SE RESETEA:**

- `usage_limit.date` es un string 'YYYY-MM-DD'
- Cuando buscas con `WHERE date = '2026-01-10'`, si hay registro, lo encuentra
- NO importa cuándo se creó, solo importa que exista para ESA FECHA
- El cron job borra registros VIEJOS (> 7 días), NO del día actual

**ENTONCES:**

- Si ayer consumiste límites → `usage_limit` tiene `date='2026-01-09', count=3`
- Hoy (2026-01-10):
  - Al verificar límite → busca `date='2026-01-10'` → NO encuentra nada → ✅ PERMITE
  - Al crear lectura → inserta/incrementa `date='2026-01-10', count=1` → ✅ OK
  - Al intentar segunda vez → busca `date='2026-01-10'` → encuentra count=1 → ✅ PERMITE (si límite > 1)

**PERO SI YA INTENTASTE HOY:**

- Primera vez hoy → busca `date='2026-01-10'` → NO encuentra → ✅ crea con count=1
- Segunda vez hoy → busca `date='2026-01-10'` → encuentra count=1 → verifica 1 < 3 → ✅ PERMITE
- Cuarta vez hoy → busca `date='2026-01-10'` → encuentra count=3 → verifica 3 < 3 → ❌ BLOQUEA

**CONCLUSIÓN:**
El sistema funciona CORRECTAMENTE para reseteo diario. El problema reportado sugiere:

1. El record de `usage_limit` NO se está creando/incrementando correctamente
2. O hay un registro "fantasma" que persiste
3. O el `IncrementUsageInterceptor` está fallando

**NECESITAMOS VERIFICAR:**

- ¿El interceptor está corriendo?
- ¿Se están creando registros en `usage_limit`?
- ¿Hay registros huérfanos con fechas incorrectas?

---

### Problema 2: Modal incorrecto para PREMIUM

#### Código actual en ReadingExperience.tsx:

```typescript
// LÍNEA 365-382
catch (error) {
  if (error instanceof Error && error.name === 'DailyLimitError') {
    setState('selecting');

    // Show different modal based on user plan
    if (isPremium) {
      // PREMIUM user: show gentle "come back tomorrow" message
      setShowLimitReachedModal(true); // ✅ Correcto - DailyLimitReachedModal
    } else {
      // FREE user: show upgrade to Premium modal
      setUpgradeModalReason('limit-reached');
      setShowUpgradeModal(true); // ✅ Correcto - UpgradeModal
    }
    return;
  }
  // ... error handling
}
```

**El código es CORRECTO** ✅

#### ¿Por qué ve modal incorrecto?

**ANÁLISIS DEL FLUJO DE ERROR:**

1. **Backend lanza ForbiddenException:**

   ```typescript
   // CheckUsageLimitGuard.ts LÍNEA 82
   throw new ForbiddenException(
     "Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC)..."
   );
   ```

2. **Frontend transforma en DailyLimitError:**

   ```typescript
   // readings-api.ts LÍNEA 110-116
   if (axios.isAxiosError(error) && error.response?.status === 403) {
     const limitError = new Error("DAILY_LIMIT_REACHED");
     limitError.name = "DailyLimitError"; // ✅ Correcto
     throw limitError;
   }
   ```

3. **ReadingExperience maneja el error:**
   ```typescript
   // ReadingExperience.tsx LÍNEA 367
   if (error instanceof Error && error.name === "DailyLimitError") {
     if (isPremium) {
       setShowLimitReachedModal(true); // ✅ DailyLimitReachedModal
     } else {
       setShowUpgradeModal(true); // ✅ UpgradeModal
     }
   }
   ```

**EL FLUJO ES CORRECTO** ✅

#### Diagnóstico: ¿Cuál es el problema REAL?

**HIPÓTESIS 1: El modal correcto se muestra, pero el contenido es el problema**

Revisando `DailyLimitReachedModal.tsx`:

```typescript
// LÍNEA 60-76
if (isDailyCard) {
  return {
    title: "Carta del día completada",
    description: "Ya has recibido tu carta del día. Vuelve mañana para una nueva lectura.",
    icon: Calendar,
  };
}

// Tarot readings
return {
  title: "Límite diario alcanzado",
  description: `Has usado tus ${totalReadings} ${totalReadings === 1 ? "lectura" : "lecturas"} del día. Tu límite se reinicia mañana.`,
  icon: TrendingUp,
};
```

✅ Contenido correcto - NO invita a upgradr a Premium

**HIPÓTESIS 2: Se está mostrando UpgradeModal por otro flujo**

Buscar otros lugares donde se muestra `UpgradeModal`:

- Cuando FREE/ANONYMOUS alcanzan límite ✅
- Cuando intentan features bloqueadas (custom questions, etc.) ✅
- **¿Hay algún otro trigger?**

**HIPÓTESIS 3: `isPremium` evalúa incorrectamente**

```typescript
// ReadingExperience.tsx LÍNEA 283
const isPremium = user?.plan?.toUpperCase() === "PREMIUM";
```

Si `user.plan` es:

- `'premium'` → `'PREMIUM' === 'PREMIUM'` → ✅ true
- `'Premium'` → `'PREMIUM' === 'PREMIUM'` → ✅ true
- `'PREMIUM'` → `'PREMIUM' === 'PREMIUM'` → ✅ true
- `null` → `undefined?.toUpperCase() === 'PREMIUM'` → ❌ false

**POSIBLE CAUSA:**

- Si `user` es `null` o `user.plan` es `undefined` → `isPremium = false`
- Entonces muestra `UpgradeModal` aunque sea premium

**NECESITAMOS VERIFICAR:**

1. Estado de `user` en el momento del error
2. Si el error es realmente `DailyLimitError` o cae en otro catch
3. Si hay otro lugar que muestra `UpgradeModal` sin verificar plan

---

## 🎯 Plan de Acción

### 1. Verificar si hay inconsistencia entre servicios de límites

**Archivos a revisar:**

- ✅ `backend/tarot-app/src/modules/usage-limits/usage-limits.service.ts`
- ✅ `backend/tarot-app/src/modules/users/application/services/user-capabilities.service.ts`

**Preguntas:**

- ¿El backend usa `UsageLimitsService` o `UserCapabilitiesService` para validar?
- ¿Hay dos fuentes de verdad diferentes?

### 2. Revisar endpoints de creación

**Archivos a revisar:**

- `backend/tarot-app/src/modules/tarot/readings/readings.controller.ts`
- `backend/tarot-app/src/modules/tarot/daily-reading/daily-reading.controller.ts`

**Preguntas:**

- ¿Qué validación usan ANTES de crear?
- ¿Qué error lanzan cuando límite alcanzado?

### 3. Verificar timezone y fechas

**Tests a hacer:**

- Logs de backend mostrando `dateString` generado
- Comparar con fecha real del servidor
- Verificar que `setUTCHours(0, 0, 0, 0)` funciona

### 4. Revisar error handling en frontend

**Archivos a revisar:**

- ✅ `frontend/src/components/features/readings/ReadingExperience.tsx`
- `frontend/src/lib/api/client.ts` (error interceptor)

**Preguntas:**

- ¿El error `DailyLimitError` se propaga correctamente?
- ¿Hay transformación de errores que cambia el `error.name`?

---

## 🔧 Soluciones Propuestas

### PROBLEMA 1: Límites no se reinician

#### Investigación Necesaria (PASO 1):

1. **Query manual a la base de datos:**

   ```sql
   -- Ver registros de usage_limit para usuarios afectados
   SELECT * FROM usage_limit
   WHERE user_id IN (1, 2) -- IDs de usuarios que reportan problema
   ORDER BY date DESC, feature;

   -- Ver lecturas reales de hoy
   SELECT * FROM tarot_reading
   WHERE user_id IN (1, 2)
   AND created_at >= CURRENT_DATE
   ORDER BY created_at DESC;

   -- Ver cartas del día de hoy
   SELECT * FROM daily_reading
   WHERE user_id IN (1, 2)
   AND reading_date >= CURRENT_DATE
   ORDER BY reading_date DESC;
   ```

2. **Verificar si interceptor está funcionando:**

   ```typescript
   // Agregar logs en IncrementUsageInterceptor
   this.logger.log(`Incrementing usage for userId=${userId}, feature=${feature}, date=${dateString}`);
   ```

3. **Verificar timezone del servidor:**
   ```bash
   # En el servidor
   date
   timedatectl
   ```

#### Solución Temporal (Si se confirma problema):

1. **Script de reseteo manual:**

   ```sql
   -- Borrar registros de usage_limit de días pasados
   DELETE FROM usage_limit WHERE date < CURRENT_DATE;

   -- O específicamente para usuarios afectados
   DELETE FROM usage_limit
   WHERE user_id IN (1, 2) AND date < CURRENT_DATE;
   ```

#### Solución Permanente:

**OPCIÓN A: Unificar validación usando tablas reales (RECOMENDADO)**

Modificar `CheckUsageLimitGuard` para usar queries directas a tablas reales:

```typescript
// Para TAROT_READING también consultar tabla real
if (feature === UsageFeature.TAROT_READING) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const user = await this.usersService.findById(userId);
  const planConfig = await this.planConfigService.findByPlanType(user.plan);

  const readingsCount = await this.tarotReadingRepository.count({
    where: {
      user: { id: userId },
      createdAt: MoreThanOrEqual(today),
      deletedAt: IsNull(),
    },
  });

  if (readingsCount >= planConfig.tarotReadingsLimit) {
    throw new ForbiddenException("...");
  }

  return true;
}
```

**OPCIÓN B: Mejorar UsageLimitsService (alternativa)**

Agregar verificación adicional con OR:

```typescript
async checkLimit(userId: number, feature: UsageFeature): Promise<boolean> {
  // ... código actual ...

  // Double-check con tabla real para TAROT_READING
  if (feature === UsageFeature.TAROT_READING) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const realCount = await this.tarotReadingRepository.count({
      where: {
        user: { id: userId },
        createdAt: MoreThanOrEqual(today),
        deletedAt: IsNull()
      }
    });

    return realCount < limit;
  }

  // ... resto del código ...
}
```

---

### PROBLEMA 2: Modal incorrecto para PREMIUM

#### Investigación Necesaria (PASO 1):

1. **Agregar logs detallados en error handling:**

   ```typescript
   // ReadingExperience.tsx
   catch (error) {
     console.log('❌ Error details:', {
       error,
       errorName: error instanceof Error ? error.name : 'unknown',
       errorMessage: error instanceof Error ? error.message : 'unknown',
       isPremium,
       userPlan: user?.plan,
       isDailyLimitError: error instanceof Error && error.name === 'DailyLimitError'
     });

     if (error instanceof Error && error.name === 'DailyLimitError') {
       // ...
     }
   }
   ```

2. **Verificar que el modal que se muestra es el correcto:**

   ```typescript
   // Agregar data-testid para debugging
   <UpgradeModal
     open={showUpgradeModal}
     data-debug-user-plan={user?.plan}
     data-debug-reason={upgradeModalReason}
   />

   <DailyLimitReachedModal
     open={showLimitReachedModal}
     data-debug-user-plan={user?.plan}
   />
   ```

#### Solución (según hallazgos):

**SI el problema es evaluación de `isPremium`:**

```typescript
// Hacer evaluación más robusta
const isPremium = Boolean(user?.plan) && user.plan.toUpperCase() === "PREMIUM";
```

**SI el problema es otro flujo mostrando UpgradeModal:**

Buscar TODOS los lugares donde se muestra `UpgradeModal` y agregar:

```typescript
// Antes de mostrar modal
if (user?.plan?.toUpperCase() === "PREMIUM") {
  console.warn("⚠️ Attempting to show UpgradeModal to PREMIUM user - using DailyLimitReachedModal instead");
  setShowLimitReachedModal(true);
  return;
}

setShowUpgradeModal(true);
```

**SI el error NO es DailyLimitError:**

Mejorar transformación de errores:

```typescript
// readings-api.ts
export async function createReading(data: CreateReadingDto): Promise<ReadingDetail> {
  try {
    const response = await apiClient.post<ApiReadingResponse>(API_ENDPOINTS.READINGS.BASE, data);
    return transformReadingResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      // Verificar mensaje específico de límite
      const errorMessage = error.response.data?.message || "";

      if (errorMessage.includes("límite") || errorMessage.includes("limit")) {
        const limitError = new Error("DAILY_LIMIT_REACHED");
        limitError.name = "DailyLimitError";
        throw limitError;
      }
    }
    throw new Error("Error al crear lectura");
  }
}
```

---

### Tests de Validación

```typescript
// tests/limits-reset.e2e.spec.ts
describe("Daily Limits Reset", () => {
  it("should allow user to create reading today after consuming yesterday", async () => {
    // 1. Login como usuario premium
    // 2. Consumir 3 lecturas hoy
    // 3. Verificar que 4ta lectura falla con límite alcanzado
    // 4. Simular paso de medianoche (cambiar fecha del sistema o esperar)
    // 5. Verificar que puede crear lectura de nuevo
  });

  it("should show correct modal for PREMIUM user at limit", async () => {
    // 1. Login como usuario premium
    // 2. Consumir 3 lecturas (límite)
    // 3. Intentar 4ta lectura
    // 4. Verificar que modal es DailyLimitReachedModal
    // 5. Verificar que NO dice "Upgrade a Premium"
  });
});
```

---

## 📋 Siguiente Paso

Crear rama `bugfix/daily-limits-reset` y:

1. Revisar controladores de backend para ver qué validación usan
2. Verificar logs de fechas generadas
3. Implementar fixes según hallazgos
4. Tests para validar comportamiento correcto

---

**Estado:** Análisis completo - Listo para implementación
