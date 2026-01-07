# Plan de Implementación: Límites Separados por Tipo de Lectura

**Fecha:** 7 de enero de 2026  
**Rama:** `fix/separate-daily-card-and-reading-limits`  
**Objetivo:** Separar límites de "Carta del Día" y "Tiradas de Tarot" en límites independientes configurables

---

## 📋 Valores de Límites Objetivo

| Plan    | Carta del Día | Tiradas de Tarot |
| ------- | ------------- | ---------------- |
| ANÓNIMO | 1/día         | 0/día            |
| FREE    | 1/día         | 1/día            |
| PREMIUM | 1/día         | 3/día            |

**Importante:** Ambos límites deben ser configurables desde el panel de administrador.

---

## 🎯 Tareas Backend

### ✅ TAREA 1: Agregar nuevos campos a Plan entity

**Archivo:** `backend/tarot-app/src/modules/plan-config/entities/plan.entity.ts`

**Cambios:**

- Agregar `dailyCardLimit: number`
- Agregar `tarotReadingsLimit: number`
- Mantener `readingsLimit` temporalmente (deprecar después)

**Commit:** `feat(backend): add separate limits for daily cards and tarot readings to Plan entity`

---

### ✅ TAREA 2: Crear migración de base de datos

**Archivo:** Nuevo archivo en `backend/tarot-app/src/database/migrations/`

**Acciones:**

1. Agregar columnas `daily_card_limit` y `tarot_readings_limit` a tabla `plans`
2. Migrar datos existentes basados en `plan_type`
3. No eliminar `readings_limit` todavía (por compatibilidad)

**Commit:** `feat(backend): add migration to split reading limits by type`

---

### ✅ TAREA 3: Actualizar seeds de planes

**Archivo:** `backend/tarot-app/src/database/seeds/plans.seeder.ts`

**Cambios:**

- ANÓNIMO: `dailyCardLimit: 1, tarotReadingsLimit: 0`
- FREE: `dailyCardLimit: 1, tarotReadingsLimit: 1`
- PREMIUM: `dailyCardLimit: 1, tarotReadingsLimit: 3`

**Commit:** `feat(backend): update plan seeds with separate daily card and tarot reading limits`

---

### ✅ TAREA 4: Agregar UsageFeature.DAILY_CARD al enum

**Archivo:** `backend/tarot-app/src/modules/usage-limits/entities/usage-limit.entity.ts`

**Cambios:**

- Agregar `DAILY_CARD = 'daily_card'` al enum `UsageFeature`

**Commit:** `feat(backend): add DAILY_CARD to UsageFeature enum`

---

### ✅ TAREA 5: Actualizar PlanConfigService con métodos separados

**Archivo:** `backend/tarot-app/src/modules/plan-config/plan-config.service.ts`

**Cambios:**

- Agregar `getDailyCardLimit(plan: UserPlan): Promise<number>`
- Agregar `getTarotReadingsLimit(plan: UserPlan): Promise<number>`
- Mantener `getReadingsLimit()` por compatibilidad

**Commit:** `feat(backend): add separate limit methods in PlanConfigService`

---

### ✅ TAREA 6: Actualizar UsageLimitsService para usar límites específicos

**Archivo:** `backend/tarot-app/src/modules/usage-limits/usage-limits.service.ts`

**Cambios:**

- Actualizar `checkLimit()` para detectar feature y usar límite correcto
- Actualizar `getRemainingUsage()` para usar límite correcto

**Commit:** `feat(backend): update UsageLimitsService to use feature-specific limits`

---

### ✅ TAREA 7: Actualizar DailyReadingController para usar DAILY_CARD

**Archivo:** `backend/tarot-app/src/modules/tarot/daily-reading/daily-reading.controller.ts`

**Cambios:**

- Cambiar `@CheckUsageLimit(UsageFeature.TAROT_READING)` a `@CheckUsageLimit(UsageFeature.DAILY_CARD)`

**Commit:** `feat(backend): use DAILY_CARD feature for daily reading limits`

---

### ✅ TAREA 8: Actualizar UsersController para incluir contadores separados en /me

**Archivo:** `backend/tarot-app/src/modules/users/infrastructure/controllers/users.controller.ts`

**Cambios:**

- Actualizar endpoint `/me` para incluir:
  - `dailyCardCount`
  - `dailyCardLimit`
  - `tarotReadingsCount`
  - `tarotReadingsLimit`

**Commit:** `feat(backend): add separate usage counters to /me endpoint`

---

### ✅ TAREA 9: Actualizar DTOs con nuevos campos

**Archivos:**

- `backend/tarot-app/src/modules/users/dto/user-response.dto.ts`
- `backend/tarot-app/src/modules/plan-config/dto/*.dto.ts`

**Cambios:**

- Agregar campos de límites separados a DTOs

**Commit:** `feat(backend): update DTOs with separate limit fields`

---

### ✅ TAREA 10: Actualizar tests backend

**Archivos:** Todos los tests afectados

**Cambios:**

- Actualizar mocks con nuevos campos
- Actualizar assertions
- Agregar tests para límites separados

**Commit:** `test(backend): update tests for separate reading limits`

---

## 🎯 Tareas Frontend

### ✅ TAREA 11: Actualizar tipos TypeScript

**Archivos:**

- `frontend/src/types/user.ts`
- `frontend/src/types/api.ts`

**Cambios:**

- Agregar `dailyCardCount`, `dailyCardLimit`
- Agregar `tarotReadingsCount`, `tarotReadingsLimit`

**Commit:** `feat(frontend): add separate limit types to User and API types`

---

### ✅ TAREA 12: Actualizar SpreadSelector para verificar límite de tiradas

**Archivo:** `frontend/src/components/features/readings/SpreadSelector.tsx`

**Cambios:**

- Cambiar lógica de `hasReachedLimit()` para usar `tarotReadingsCount >= tarotReadingsLimit`

**Commit:** `feat(frontend): update SpreadSelector to use tarot reading specific limits`

---

### ✅ TAREA 13: Actualizar DailyCardExperience para verificar límite de cartas

**Archivo:** `frontend/src/components/features/daily-reading/DailyCardExperience.tsx`

**Cambios:**

- Agregar validación de `dailyCardCount >= dailyCardLimit` antes de permitir generación

**Commit:** `feat(frontend): update DailyCardExperience to use daily card specific limits`

---

### ✅ TAREA 14: Actualizar componentes de límite alcanzado

**Archivos:**

- `frontend/src/components/features/readings/ReadingLimitReached.tsx`
- `frontend/src/components/features/daily-reading/DailyCardLimitReached.tsx`

**Cambios:**

- Mostrar límites específicos por tipo
- Mostrar progreso correcto (ej: "1/1 cartas del día", "2/3 tiradas")

**Commit:** `feat(frontend): update limit reached components with specific counters`

---

### ✅ TAREA 15: Actualizar authStore para manejar nuevos campos

**Archivo:** `frontend/src/stores/authStore.ts`

**Cambios:**

- Asegurar que los nuevos campos se guarden en el store
- Actualizar interfaces del store

**Commit:** `feat(frontend): update authStore to handle separate limit fields`

---

### ✅ TAREA 16: Actualizar tests frontend

**Archivos:** Todos los tests de componentes afectados

**Cambios:**

- Actualizar mocks con nuevos campos
- Agregar tests para límites separados

**Commit:** `test(frontend): update tests for separate reading limits`

---

## 🎯 Tareas de Integración y Testing

### ✅ TAREA 17: Ejecutar migraciones en base de datos local

**Acciones:**

1. Ejecutar migración
2. Verificar que datos se migraron correctamente
3. Verificar que seeds funcionan

**Commit:** `chore: run migrations for separate reading limits`

---

### ✅ TAREA 18: Testing manual E2E

**Escenarios a probar:**

1. Usuario ANÓNIMO: 1 carta (✅), intenta tirada (❌)
2. Usuario FREE: 1 carta (✅), 1 tirada (✅), segunda carta (❌), segunda tirada (❌)
3. Usuario PREMIUM: 1 carta (✅), 3 tiradas (✅), segunda carta (❌), cuarta tirada (❌)

**Commit:** `test: validate separate limits work correctly in all plans`

---

### ✅ TAREA 19: Actualizar documentación

**Archivos:**

- `backend/tarot-app/docs/API_DOCUMENTATION.md`
- `frontend/docs/MODELO_NEGOCIO_DEFINIDO.md`

**Cambios:**

- Documentar nuevos campos en API
- Marcar implementación como completada

**Commit:** `docs: update documentation with separate reading limits implementation`

---

## 📊 Estado de Tareas

| #   | Tarea                        | Estado       | Commit |
| --- | ---------------------------- | ------------ | ------ |
| 1   | Plan entity: nuevos campos   | ⏳ Pendiente | -      |
| 2   | Migración de DB              | ⏳ Pendiente | -      |
| 3   | Seeds actualizados           | ⏳ Pendiente | -      |
| 4   | Enum UsageFeature.DAILY_CARD | ⏳ Pendiente | -      |
| 5   | PlanConfigService métodos    | ⏳ Pendiente | -      |
| 6   | UsageLimitsService lógica    | ⏳ Pendiente | -      |
| 7   | DailyReadingController       | ⏳ Pendiente | -      |
| 8   | UsersController /me          | ⏳ Pendiente | -      |
| 9   | DTOs actualizados            | ⏳ Pendiente | -      |
| 10  | Tests backend                | ⏳ Pendiente | -      |
| 11  | Tipos TypeScript             | ⏳ Pendiente | -      |
| 12  | SpreadSelector               | ⏳ Pendiente | -      |
| 13  | DailyCardExperience          | ⏳ Pendiente | -      |
| 14  | Componentes límite           | ⏳ Pendiente | -      |
| 15  | AuthStore                    | ⏳ Pendiente | -      |
| 16  | Tests frontend               | ⏳ Pendiente | -      |
| 17  | Migraciones DB               | ⏳ Pendiente | -      |
| 18  | Testing E2E                  | ⏳ Pendiente | -      |
| 19  | Documentación                | ⏳ Pendiente | -      |

---

## 🚀 Orden de Ejecución

1. **Backend Database & Entities** (Tareas 1-4)
2. **Backend Services** (Tareas 5-7)
3. **Backend API** (Tareas 8-9)
4. **Backend Tests** (Tarea 10)
5. **Frontend Types & Components** (Tareas 11-15)
6. **Frontend Tests** (Tarea 16)
7. **Integration & Validation** (Tareas 17-18)
8. **Documentation** (Tarea 19)

---

**Última actualización:** 7 de enero de 2026
