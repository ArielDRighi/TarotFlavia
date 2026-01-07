# Análisis Completo: Problemas con Límites de Uso

**Fecha:** 7 de enero de 2026  
**Rama:** `fix/separate-daily-card-and-reading-limits`  
**Estado:** 🔴 CRÍTICO - Sistema de límites no cumple con el modelo de negocio

---

## 📋 Resumen Ejecutivo

El sistema actual de límites tiene **problemas arquitectónicos fundamentales** que impiden que funcione según el modelo de negocio definido. Los dos tipos de lecturas (Carta del Día y Tiradas de Tarot) **están usando el mismo límite compartido**, cuando deberían tener límites completamente independientes.

---

## 🎯 Modelo de Negocio Esperado

Según [`MODELO_NEGOCIO_DEFINIDO.md`](./frontend/docs/MODELO_NEGOCIO_DEFINIDO.md):

### Límites por Plan

| Plan        | Carta del Día | Tiradas de Tarot | IA    |
| ----------- | ------------- | ---------------- | ----- |
| **ANÓNIMO** | 1/día         | ❌ No acceso     | ❌ No |
| **FREE**    | 1/día         | 1/día            | ❌ No |
| **PREMIUM** | 1/día         | 3/día            | ✅ Sí |

### Regla de Oro #3

> **Límites independientes** (1 carta día + N tiradas)

Ejemplo para usuario FREE:

- ✅ Puede hacer: 1 carta del día + 1 tirada de tarot = 2 lecturas totales
- ❌ NO puede hacer: 2 cartas del día (límite 1)
- ❌ NO puede hacer: 2 tiradas de tarot (límite 1)
- ❌ NO puede hacer: 0 cartas + 2 tiradas (límite tiradas = 1)

**Los límites son por TIPO de feature, NO por total de lecturas.**

---

## 🐛 Problemas Identificados

### Problema #1: Backend usa UN SOLO límite compartido

**Ubicación:** `backend/tarot-app/src/database/seeds/plans.seeder.ts`

```typescript
{
  planType: UserPlan.FREE,
  name: 'Plan Gratis',
  readingsLimit: 2,  // ❌ PROBLEMA: Un solo límite para ambos tipos
  // ...
}
```

**Estado Actual:**

- La tabla `plans` solo tiene un campo `readingsLimit`
- Este límite se usa para AMBOS tipos de lecturas
- No hay separación entre:
  - `dailyCardLimit` (carta del día)
  - `tarotReadingsLimit` (tiradas de tarot)

**Impacto:**

- Un usuario FREE con límite `readingsLimit: 2` puede:
  - 2 cartas del día + 0 tiradas ❌ INCORRECTO (debería ser 1 + 1)
  - 0 cartas + 2 tiradas ❌ INCORRECTO (debería ser 1 + 1)
  - 2 tiradas + 0 cartas ❌ INCORRECTO (debería ser 1 + 1)

---

### Problema #2: UsageLimit usa un solo "feature" para todo

**Ubicación:** `backend/tarot-app/src/modules/usage-limits/entities/usage-limit.entity.ts`

```typescript
export enum UsageFeature {
  TAROT_READING = "tarot_reading", // ❌ Se usa para AMBOS tipos
  ORACLE_QUERY = "oracle_query",
  INTERPRETATION_REGENERATION = "interpretation_regeneration",
}
```

**Estado Actual:**

- Tanto `DailyReadingController` como `ReadingsController` usan:
  ```typescript
  @CheckUsageLimit(UsageFeature.TAROT_READING)
  ```
- NO existe `UsageFeature.DAILY_CARD`
- Ambos endpoints comparten el mismo contador de uso

**Código Actual:**

**DailyReadingController:**

```typescript
@Post()
@UseGuards(CheckUsageLimitGuard)
@UseInterceptors(IncrementUsageInterceptor)
@CheckUsageLimit(UsageFeature.TAROT_READING)  // ❌ Comparte límite
async generateDailyCard() { /* ... */ }
```

**ReadingsController:**

```typescript
@Post()
@UseGuards(CheckUsageLimitGuard)
@UseInterceptors(IncrementUsageInterceptor)
@CheckUsageLimit(UsageFeature.TAROT_READING)  // ❌ Comparte límite
async create() { /* ... */ }
```

**Impacto:**

- Si un usuario FREE hace 1 carta del día → contador = 1
- Intenta hacer 1 tirada → contador = 2 → ✅ PERMITIDO (límite 2)
- Pero ya NO puede hacer nada más (ni carta ni tirada)
- Resultado: El usuario puede elegir hacer 2 del mismo tipo o 1+1
- **Esto NO es lo esperado según el modelo de negocio**

---

### Problema #3: Frontend no diferencia límites

**Ubicación:** `frontend/src/components/features/readings/SpreadSelector.tsx`

```typescript
const hasReachedLimit = useCallback((): boolean => {
  if (!user) return false;
  if (user.plan === "premium") return false;

  const dailyCount = user.dailyReadingsCount ?? 0; // ❌ Un solo contador
  const dailyLimit = user.dailyReadingsLimit ?? CONFIG.DEFAULT_FREE_DAILY_LIMIT;

  return dailyCount >= dailyLimit;
}, [user]);
```

**Estado Actual:**

- El tipo `User` tiene:
  - `dailyReadingsCount` (un solo contador)
  - `dailyReadingsLimit` (un solo límite)
- NO hay:
  - `dailyCardCount` / `dailyCardLimit`
  - `tarotReadingsCount` / `tarotReadingsLimit`

**Impacto:**

- El frontend no puede mostrar correctamente:
  - "Has usado 1 de 1 carta del día"
  - "Has usado 0 de 1 tiradas de tarot"
- Solo muestra: "Has usado 1 de 2 lecturas" (ambiguo)

---

## 🔧 Solución Propuesta

### Opción 1: Dos límites separados (RECOMENDADA)

**Ventajas:**

- ✅ Cumple 100% con el modelo de negocio
- ✅ Máxima flexibilidad para ajustar planes
- ✅ Claridad en reportes y analytics
- ✅ Permite futuros ajustes (ej: PREMIUM 1 carta + 5 tiradas)

**Desventajas:**

- ❌ Requiere migración de base de datos
- ❌ Más cambios en backend y frontend

**Cambios Necesarios:**

#### Backend

1. **Migración de Base de Datos:**

   ```sql
   -- Agregar nuevas columnas a table `plans`
   ALTER TABLE plans
     ADD COLUMN daily_card_limit INTEGER NOT NULL DEFAULT 1,
     ADD COLUMN tarot_readings_limit INTEGER NOT NULL DEFAULT 0;

   -- Migrar datos existentes
   UPDATE plans
   SET
     daily_card_limit = 1,
     tarot_readings_limit = CASE
       WHEN plan_type = 'anonymous' THEN 0
       WHEN plan_type = 'free' THEN 1
       WHEN plan_type = 'premium' THEN 3
     END;

   -- Eventualmente eliminar columna antigua (después de validar)
   -- ALTER TABLE plans DROP COLUMN readings_limit;
   ```

2. **Actualizar Enum UsageFeature:**

   ```typescript
   export enum UsageFeature {
     DAILY_CARD = "daily_card", // ✅ NUEVO
     TAROT_READING = "tarot_reading",
     ORACLE_QUERY = "oracle_query",
     INTERPRETATION_REGENERATION = "interpretation_regeneration",
   }
   ```

3. **Actualizar Plan Entity:**

   ```typescript
   @Column({ type: 'int', default: 1 })
   dailyCardLimit: number;

   @Column({ type: 'int', default: 0 })
   tarotReadingsLimit: number;
   ```

4. **Actualizar DailyReadingController:**

   ```typescript
   @CheckUsageLimit(UsageFeature.DAILY_CARD)  // ✅ Feature específico
   async generateDailyCard() { /* ... */ }
   ```

5. **Actualizar PlanConfigService:**
   ```typescript
   async getDailyCardLimit(plan: UserPlan): Promise<number> { /* ... */ }
   async getTarotReadingsLimit(plan: UserPlan): Promise<number> { /* ... */ }
   ```

#### Frontend

1. **Actualizar User Type:**

   ```typescript
   export interface User {
     // ...
     dailyCardCount?: number;
     dailyCardLimit?: number;
     tarotReadingsCount?: number;
     tarotReadingsLimit?: number;
   }
   ```

2. **Actualizar API DTOs:**

   ```typescript
   export interface UserResponseDto {
     // ...
     dailyCardCount: number;
     dailyCardLimit: number;
     tarotReadingsCount: number;
     tarotReadingsLimit: number;
   }
   ```

3. **Actualizar Componentes:**
   - `SpreadSelector.tsx` → verificar `tarotReadingsCount >= tarotReadingsLimit`
   - `DailyCardExperience.tsx` → verificar `dailyCardCount >= dailyCardLimit`
   - Modales de límite → mostrar límites específicos

---

### Opción 2: Lógica de validación condicional (NO RECOMENDADA)

Mantener un solo límite pero agregar lógica especial para validar:

- "Si es carta del día, verificar que hoy no tenga carta"
- "Si es tirada, verificar que tenga espacio en el límite"

**Ventajas:**

- ✅ No requiere migración de DB

**Desventajas:**

- ❌ NO cumple con el modelo de negocio correctamente
- ❌ Lógica compleja y propensa a bugs
- ❌ Dificulta analytics y reportes
- ❌ No permite flexibilidad futura

**RECOMENDACIÓN:** NO usar esta opción

---

## 📊 Comparación Visual

### Estado Actual (❌ INCORRECTO)

```
Usuario FREE con límite: readingsLimit = 2

Escenario A:
  - 1 Carta del día → count = 1 ✅
  - 1 Tirada → count = 2 ✅
  - Intenta otra Carta → count = 3 ❌ Rechazado (correcto)

Escenario B:
  - 2 Cartas del día → count = 2 ✅ (❌ DEBERÍA rechazar la 2da)
  - Intenta Tirada → count = 3 ❌ Rechazado

Escenario C:
  - 2 Tiradas → count = 2 ✅ (❌ DEBERÍA rechazar la 2da)
  - Intenta Carta → count = 3 ❌ Rechazado
```

### Estado Esperado (✅ CORRECTO)

```
Usuario FREE con límites: dailyCardLimit = 1, tarotReadingsLimit = 1

Escenario A:
  - 1 Carta del día → dailyCardCount = 1 ✅
  - 1 Tirada → tarotReadingsCount = 1 ✅
  - Intenta otra Carta → dailyCardCount = 2 ❌ Rechazado (límite 1)
  - Intenta otra Tirada → tarotReadingsCount = 2 ❌ Rechazado (límite 1)

Escenario B:
  - 1 Carta del día → dailyCardCount = 1 ✅
  - Intenta otra Carta → dailyCardCount = 2 ❌ Rechazado (límite 1)
  - 1 Tirada → tarotReadingsCount = 1 ✅ (independiente)

Escenario C:
  - 1 Tirada → tarotReadingsCount = 1 ✅
  - Intenta otra Tirada → tarotReadingsCount = 2 ❌ Rechazado (límite 1)
  - 1 Carta del día → dailyCardCount = 1 ✅ (independiente)
```

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Backend Changes (Migración de DB)

1. ✅ Crear migración para agregar `daily_card_limit` y `tarot_readings_limit`
2. ✅ Migrar datos existentes
3. ✅ Actualizar `Plan` entity
4. ✅ Actualizar seeds con límites separados
5. ✅ Agregar `UsageFeature.DAILY_CARD` al enum

### Fase 2: Backend Logic

6. ✅ Actualizar `DailyReadingController` para usar `UsageFeature.DAILY_CARD`
7. ✅ Actualizar `PlanConfigService` para retornar límites separados
8. ✅ Actualizar `UsageLimitsService` para validar contra el límite correcto
9. ✅ Actualizar DTOs para incluir ambos contadores

### Fase 3: Frontend

10. ✅ Actualizar tipos TypeScript (`User`, DTOs)
11. ✅ Actualizar `SpreadSelector` para verificar límite de tiradas
12. ✅ Actualizar `DailyCardExperience` para verificar límite de cartas
13. ✅ Actualizar modales para mostrar límites específicos
14. ✅ Actualizar tests

### Fase 4: Testing

15. ✅ Tests unitarios backend (límites separados)
16. ✅ Tests integración backend (endpoints)
17. ✅ Tests unitarios frontend (componentes)
18. ✅ Tests E2E (flujo completo)
19. ✅ Testing manual con usuarios de cada plan

---

## 🚨 Impacto en Producción

**Riesgo:** MEDIO-ALTO

**Razones:**

- Cambios en esquema de base de datos
- Cambios en contratos de API
- Posible pérdida temporal de datos de límites durante migración

**Mitigaciones:**

1. Ejecutar migración en horario de bajo tráfico
2. Backup completo antes de migración
3. Script de rollback preparado
4. Monitoreo post-deploy
5. Feature flag para activar/desactivar nuevos límites

---

## 📝 Notas Adicionales

### Pregunta del Usuario

> "deberian dividirse los limites por tipo de tirada?"

**Respuesta:** SÍ, absolutamente. El modelo de negocio es claro:

- **Carta del Día:** 1 límite independiente (1/día para todos)
- **Tiradas de Tarot:** Otro límite independiente (0 para ANÓNIMO, 1 para FREE, 3 para PREMIUM)

Esto permite:

- Mejor control de costos (IA solo en PREMIUM)
- Funnel de conversión más claro (ANÓNIMO → FREE → PREMIUM)
- Analytics precisos por tipo de feature
- Flexibilidad para ajustar planes sin afectar todo el sistema

### Estado Actual del Límite FREE

> "el usuario free tiene un limite de 2, hasta donde yo habia probado ese limite era para una carta del dia y una lectura del tarot"

**Análisis:** Esto funcionaba "por casualidad" porque:

- El límite era 2
- Si hacías 1 carta + 1 tirada = 2 → ✅ Funcionaba
- Pero si hacías 2 cartas + 0 tiradas = 2 → ✅ También funcionaba (❌ NO debería)

El problema se nota cuando:

- Quieres ajustar el límite de tiradas a 2 para FREE (pero mantener carta en 1)
- Quieres analytics separados ("¿cuántas cartas del día se generan al día?")
- Quieres mostrar al usuario límites específicos ("Has usado 1/1 carta, 0/1 tirada")

---

## ✅ Próximos Pasos

1. **Validar con el dueño del producto:**
   - ¿Confirmas que los límites deben ser independientes?
   - ¿Los valores propuestos son correctos? (ANÓNIMO: 1+0, FREE: 1+1, PREMIUM: 1+3)

2. **Decidir timing:**
   - ¿Se implementa ahora o se planifica para una ventana de mantenimiento?

3. **Ejecutar Plan de Acción:**
   - Seguir las fases 1-4 documentadas arriba

4. **Documentar:**
   - Actualizar `API_DOCUMENTATION.md` con nuevos campos
   - Actualizar `MODELO_NEGOCIO_DEFINIDO.md` con estado "IMPLEMENTADO"
   - Crear CHANGELOG entry

---

**Última actualización:** 7 de enero de 2026
