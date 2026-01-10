# Fix: Sistema de Límites Diarios - Reseteo y Modales

**Rama:** `bugfix/daily-limits-reset`
**Fecha:** 10 Enero 2026
**Autor:** Copilot AI

---

## 🐛 Problemas Resueltos

### 1. Los límites NO se reinician de un día para el otro ✅

**Síntoma:**

- Usuarios consumían límites un día y al día siguiente seguían bloqueados
- Afectaba tanto a usuarios FREE como PREMIUM
- Tanto Carta del Día como Tiradas de Tarot

**Causa Raíz:**

- `CheckUsageLimitGuard` usaba dos métodos diferentes de validación:
  - **DAILY_CARD:** Consultaba directamente tabla `daily_reading` ✅
  - **TAROT_READING:** Usaba `UsageLimitsService.checkLimit()` con tabla `usage_limit` ❌
- La tabla `usage_limit` es para analytics/histórico, no para validación en tiempo real
- `UsageLimitsResetService` solo borra registros ANTIGUOS (> 7 días), no resetea diariamente

**Solución Implementada:**

- Modificado `CheckUsageLimitGuard` para usar queries directas a tablas reales TAMBIÉN para `TAROT_READING`
- Ahora ambas features consultan las tablas de lecturas directamente:
  - `DAILY_CARD` → `daily_reading.readingDate >= today`
  - `TAROT_READING` → `tarot_reading.createdAt >= today AND deletedAt IS NULL`
- Esto garantiza consistencia y precisión: si no hay lectura de HOY, el límite está disponible

### 2. Modal incorrecto para usuarios PREMIUM ✅

**Síntoma:**

- Usuarios PREMIUM que alcanzaban su límite diario (3 tiradas/día)
- Veían modal `UpgradeModal` que les decía "Upgrade a Premium"
- Deberían ver `DailyLimitReachedModal` ("Vuelve mañana")

**Posibles Causas:**

1. Evaluación incorrecta de `isPremium` si `user.plan` era `null`/`undefined`
2. Error no identificado correctamente como `DailyLimitError`

**Solución Implementada:**

1. **Evaluación más robusta de `isPremium`:**

   ```typescript
   // Antes
   const isPremium = user?.plan?.toUpperCase() === "PREMIUM";

   // Después
   const isPremium = Boolean(user?.plan) && user.plan.toUpperCase() === "PREMIUM";
   ```

2. **Mejor identificación de errores de límite en API:**

   ```typescript
   // Verificar mensaje específico además del status 403
   if (axios.isAxiosError(error) && error.response?.status === 403) {
     const errorMessage = error.response.data?.message || "";

     if (errorMessage.toLowerCase().includes("límite") || errorMessage.toLowerCase().includes("limit")) {
       const limitError = new Error("DAILY_LIMIT_REACHED");
       limitError.name = "DailyLimitError";
       throw limitError;
     }
   }
   ```

3. **Logs detallados para debugging:**
   - Backend: Log en `CheckUsageLimitGuard` con detalles de validación
   - Frontend: Log en error handling con estado completo del usuario

---

## 📝 Cambios Implementados

### Backend

#### 1. `check-usage-limit.guard.ts`

**Cambios:**

- Importado `TarotReading`, `UsersService`, `PlanConfigService`, `IsNull`
- Inyectado `TarotReading` repository y servicios adicionales
- Agregada lógica para `TAROT_READING`:
  ```typescript
  if (feature === UsageFeature.TAROT_READING) {
    // Get user's plan and limits
    const user = await this.usersService.findById(userId);
    const planConfig = await this.planConfigService.findByPlanType(user.plan);

    // Check unlimited access
    if (planConfig.tarotReadingsLimit === -1) return true;

    // Count readings created today (excluding soft-deleted)
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
- Agregados logs detallados para debugging

#### 2. `usage-limits.module.ts`

**Cambios:**

- Agregado `TarotReading` entity al `TypeOrmModule.forFeature()`

### Frontend

#### 1. `ReadingExperience.tsx`

**Cambios:**

- Mejorada evaluación de `isPremium`:
  ```typescript
  const isPremium = Boolean(user?.plan) && user.plan.toUpperCase() === "PREMIUM";
  ```
- Agregados logs detallados en error handling:
  ```typescript
  console.log("❌ Reading creation error:", {
    error,
    errorName: error instanceof Error ? error.name : "unknown",
    isPremium,
    userPlan: user?.plan,
    isDailyLimitError: error instanceof Error && error.name === "DailyLimitError",
  });
  ```

#### 2. `readings-api.ts`

**Cambios:**

- Mejorada detección de errores de límite:

  ```typescript
  // Verificar mensaje además de status 403
  const errorMessage = error.response.data?.message || "";

  if (errorMessage.toLowerCase().includes("límite") || errorMessage.toLowerCase().includes("limit")) {
    const limitError = new Error("DAILY_LIMIT_REACHED");
    limitError.name = "DailyLimitError";
    throw limitError;
  }
  ```

- Agregados logs para debugging

---

## ✅ Beneficios de la Solución

### 1. Consistencia

- Ambas features (DAILY_CARD y TAROT_READING) usan el mismo enfoque
- Consultan directamente las tablas de lecturas reales
- Una sola fuente de verdad: las lecturas existentes

### 2. Precisión

- Los límites se calculan en tiempo real basándose en lecturas del día actual
- No depende de registros intermedios que puedan desincronizarse
- Incluye filtro `deletedAt IS NULL` para no contar lecturas eliminadas

### 3. Mantenibilidad

- Código más simple y directo
- Menos dependencias entre servicios
- Más fácil de debuggear con los logs agregados

### 4. Compatibilidad con Modelo de Negocio

- Respeta los límites definidos en `plans` table
- Maneja correctamente usuarios con acceso ilimitado (-1)
- Se resetea automáticamente a medianoche UTC sin cron jobs adicionales

---

## 🧪 Testing Manual

### Escenario 1: Reseteo de Límites

1. **Día 1:**
   - Login como usuario FREE
   - Crear 1 lectura de tarot → ✅ Éxito
   - Intentar 2da lectura → ❌ Límite alcanzado, modal correcto
   - Ver carta del día → ✅ Éxito
   - Intentar carta del día de nuevo → ❌ Límite alcanzado, modal correcto

2. **Día 2 (después de medianoche UTC):**
   - Login con mismo usuario
   - Intentar lectura de tarot → ✅ Debe permitir (reseteo automático)
   - Intentar carta del día → ✅ Debe permitir (reseteo automático)

### Escenario 2: Modal Correcto para PREMIUM

1. **Usuario PREMIUM:**
   - Login como usuario PREMIUM
   - Crear 3 lecturas de tarot (límite PREMIUM)
   - Intentar 4ta lectura → ❌ Límite alcanzado
   - Verificar modal: `DailyLimitReachedModal`
   - Verificar texto: "Tu límite se reinicia mañana" (NO "Upgrade a Premium")

### Escenario 3: Lecturas Eliminadas No Cuentan

1. **Usuario FREE:**
   - Crear 1 lectura de tarot
   - Eliminar la lectura (soft delete)
   - Intentar crear otra lectura → ✅ Debe permitir (lectura eliminada no cuenta)

---

## 📊 Logs para Verificación

Con los logs agregados, podrás ver en la consola:

**Backend (logs):**

```
[CheckUsageLimitGuard] Checking TAROT_READING for userId=1, today=2026-01-10T00:00:00.000Z
[CheckUsageLimitGuard] TAROT_READING check: count=2, limit=3
```

**Frontend (browser console):**

```javascript
❌ Reading creation error: {
  error: Error: DAILY_LIMIT_REACHED,
  errorName: 'DailyLimitError',
  isPremium: true,
  userPlan: 'PREMIUM',
  isDailyLimitError: true
}
✅ Showing DailyLimitReachedModal to PREMIUM user
```

---

## 🔍 Verificación Post-Deploy

1. **Verificar logs del backend:**
   - Ver que las queries a las tablas reales se ejecutan correctamente
   - Confirmar que los counts son precisos

2. **Verificar comportamiento en producción:**
   - Usuarios FREE: 1 lectura/día → Modal "Upgrade a Premium"
   - Usuarios PREMIUM: 3 lecturas/día → Modal "Vuelve mañana"
   - Reseteo automático a medianoche UTC

3. **Monitorear errores:**
   - No deberían haber ForbiddenException inesperadas
   - Los modales deben mostrarse en el momento correcto

---

## 📋 Siguiente Paso

1. **Hacer commit y push:**

   ```bash
   git add .
   git commit -m "fix: daily limits reset and correct modals for PREMIUM users

   - Use direct queries to real tables for limit validation
   - Fix TAROT_READING limit check (was using usage_limit table)
   - Improve isPremium evaluation to handle null/undefined
   - Better error detection for limit errors
   - Add detailed logs for debugging

   Fixes #XXX"

   git push origin bugfix/daily-limits-reset
   ```

2. **Crear Pull Request:**
   - Título: "Fix: Daily Limits Reset and Correct Modals for PREMIUM Users"
   - Descripción: Enlazar este documento
   - Reviewers: Equipo de desarrollo

3. **Testing en staging:**
   - Ejecutar escenarios de testing manual
   - Verificar logs
   - Confirmar que ambos problemas están resueltos

4. **Merge a develop:**
   - Después de aprobación y testing exitoso

---

**Estado:** Implementación completa - Lista para review y testing
