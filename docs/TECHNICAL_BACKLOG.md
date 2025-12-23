# 📋 Technical Backlog - MVP Strategy Implementation

> **Documento de Tareas Técnicas**  
> Fecha: 18 Diciembre 2025  
> Versión: 1.0  
> **Propósito:** Backlog detallado de tareas para implementar cambios según MVP_STRATEGY_SUMMARY

---

## 📊 Resumen Ejecutivo

**Decisiones Confirmadas:**

1. ✅ Plan naming: Seguir convenciones de industria (`ANONYMOUS`, `FREE`, `PREMIUM`)
2. ✅ FREE: Carta del día (1/día) + 1 tirada de 3 cartas (ambas SIN IA)
3. ✅ PREMIUM: Límite de 3 tiradas/día (todas CON IA, incluyendo carta del día)
4. ✅ Timezone: UTC para reset diario
5. ✅ Admin Panel: Existe y funciona en `/admin/planes`

**Ahorro Estimado:** ~$100 USD/mes por cada 1,000 usuarios FREE

---

## 📈 Distribución de Tareas

### Por Sprint

| Sprint    | Tareas        | Estimación      | Prioridad  |
| --------- | ------------- | --------------- | ---------- |
| Sprint 1  | 8 tareas      | 20-25 horas     | 🔴 Crítico |
| Sprint 2  | 6 tareas      | 15-20 horas     | 🟠 Alto    |
| Sprint 3  | 5 tareas      | 25-30 horas     | 🟡 Medio   |
| **TOTAL** | **19 tareas** | **60-75 horas** | -          |

### Por Área

| Área                        | Tareas | Estimación  |
| --------------------------- | ------ | ----------- |
| Backend - Migrations        | 2      | 5-6 horas   |
| Backend - Guards/Validators | 4      | 8-10 horas  |
| Backend - Services          | 3      | 6-8 horas   |
| Frontend - UI/Components    | 6      | 20-25 horas |
| Frontend - API Integration  | 2      | 4-5 horas   |
| Testing & QA                | 2      | 16-20 horas |

---

## 🎯 Sprint 1: CRÍTICO - Ahorro de Costos (1-2 semanas)

### Objetivo

Eliminar uso de IA en planes FREE y ANONYMOUS para reducir costos operativos a $0 en tier gratuito.

### Tareas Incluidas

- TASK-001 a TASK-008
- **Ahorro Directo:** ~$100 USD/mes por cada 1,000 usuarios FREE

---

### ✅ TASK-001: Renombrar enum UserPlan (GUEST → ANONYMOUS) - COMPLETADA

**Prioridad:** 🔴 P0 - CRÍTICO  
**Área:** Backend - User Entity  
**Estimación:** 2 horas  
**Tiempo Real:** 2 horas  
**Dependencias:** Ninguna  
**Feature:** F001  
**Branch:** `feature/TASK-001-002-rename-enum-userplan` (merged)  
**Estado:** ✅ COMPLETADA (21 Dic 2025)

#### Descripción

Renombrar plan `GUEST` a `ANONYMOUS` en el enum UserPlan siguiendo convenciones de la industria. Eliminar plan `PROFESSIONAL` del enum (se migrará a PREMIUM en DB).

#### Archivos a Modificar

**Backend:**

- `backend/tarot-app/src/modules/users/entities/user.entity.ts` - Actualizar enum UserPlan
- Todos los archivos que importen/usen `UserPlan.GUEST` → cambiar a `UserPlan.ANONYMOUS`
- Todos los archivos que usen `UserPlan.PROFESSIONAL` → eliminar o cambiar a `UserPlan.PREMIUM`

**Archivos Clave a Revisar:**

- `usage-limits.constants.ts`
- `plans.seeder.ts`
- `reading-validator.service.ts`
- Guards que validen planes
- Tests que usen los enums

#### Criterios de Aceptación

- [x] Enum contiene solo: `ANONYMOUS`, `FREE`, `PREMIUM`
- [x] Todas las referencias a `UserPlan.GUEST` actualizadas a `UserPlan.ANONYMOUS`
- [x] Todas las referencias a `UserPlan.PROFESSIONAL` eliminadas
- [x] No hay errores de compilación TypeScript
- [x] Tests de user.entity actualizados y pasando (1815 tests passing)
- [x] Búsqueda global de "GUEST" y "PROFESSIONAL" sin resultados en src/

#### Comandos de Verificación

```bash
# Buscar referencias no actualizadas
grep -r "GUEST\|PROFESSIONAL" backend/tarot-app/src/ --exclude-dir=node_modules

# Ejecutar tests
npm test -- user.entity.spec.ts
```

#### Notas

- Este cambio NO afecta la base de datos todavía (eso es TASK-002)
- Solo actualiza el código TypeScript
- La migración de DB se hará después de este cambio

---

### ✅ TASK-002: Migración de base de datos para actualizar planes - COMPLETADA

**Prioridad:** 🔴 P0 - CRÍTICO  
**Área:** Backend - Database Migrations  
**Estimación:** 4 horas  
**Tiempo Real:** 2 horas  
**Dependencias:** TASK-001  
**Feature:** F001  
**Branch:** `feature/TASK-001-002-rename-enum-userplan` (merged)  
**Estado:** ✅ COMPLETADA (21 Dic 2025)  
**Nota:** No se requirió migración manual. InitialSchema ya crea enum con valores correctos.

#### Descripción

Crear migración de TypeORM production-ready para:

1. Renombrar `guest` → `anonymous` en enums y datos
2. Migrar usuarios `professional` → `premium`
3. Eliminar plan `professional` de la tabla `plans`
4. Actualizar enums de PostgreSQL sin downtime

**⚠️ MIGRACIÓN PARA PRODUCCIÓN:** Esta migración debe ser segura para ejecutar en producción sin pérdida de datos.

#### Estrategia de Migración

PostgreSQL no permite modificar enums directamente. Estrategia:

1. Crear nuevos enums temporales con valores correctos
2. Migrar datos de usuarios y planes a nuevos valores
3. Cambiar columnas para usar nuevos enums
4. Eliminar enums antiguos
5. Renombrar nuevos enums a nombres originales

#### Archivos a Crear

**Migración principal:**

- `backend/tarot-app/src/database/migrations/[TIMESTAMP]-UpdatePlansEnum.ts`

**Scripts de verificación:**

- `backend/tarot-app/scripts/verify-migration.sql` (opcional)

#### Pasos de la Migración

**Método `up()` - Aplicar cambios:**

1. **Verificar datos existentes:**

   ```sql
   -- Contar usuarios por plan
   SELECT plan, COUNT(*) FROM "user" GROUP BY plan;

   -- Verificar si existen usuarios con professional
   SELECT COUNT(*) FROM "user" WHERE plan = 'professional';
   ```

2. **Migrar usuarios con `professional` a `premium`:**

   ```sql
   UPDATE "user"
   SET plan = 'premium'
   WHERE plan = 'professional';
   ```

3. **Actualizar tabla plans (eliminar professional, renombrar guest):**

   ```sql
   -- Eliminar plan professional
   DELETE FROM plans WHERE "planType" = 'professional';

   -- Actualizar guest a anonymous
   UPDATE plans
   SET "planType" = 'anonymous'
   WHERE "planType" = 'guest';
   ```

4. **Actualizar usuarios con `guest` a `anonymous`:**

   ```sql
   UPDATE "user"
   SET plan = 'anonymous'
   WHERE plan = 'guest';
   ```

5. **Recrear enums (proceso complejo):**

   ```sql
   -- Crear enum temporal con nuevos valores
   CREATE TYPE user_plan_enum_new AS ENUM ('anonymous', 'free', 'premium');

   -- Convertir columna a usar nuevo enum
   ALTER TABLE "user"
   ALTER COLUMN plan TYPE user_plan_enum_new
   USING plan::text::user_plan_enum_new;

   -- Eliminar enum viejo
   DROP TYPE user_plan_enum;

   -- Renombrar nuevo enum
   ALTER TYPE user_plan_enum_new RENAME TO user_plan_enum;

   -- Repetir para plans_plantype_enum
   CREATE TYPE plans_plantype_enum_new AS ENUM ('anonymous', 'free', 'premium');
   ALTER TABLE plans
   ALTER COLUMN "planType" TYPE plans_plantype_enum_new
   USING "planType"::text::plans_plantype_enum_new;
   DROP TYPE plans_plantype_enum;
   ALTER TYPE plans_plantype_enum_new RENAME TO plans_plantype_enum;
   ```

**Método `down()` - Revertir cambios:**

Implementar rollback completo para deshacer todos los cambios en orden inverso.

#### Pre-requisitos

- [x] TASK-001 completada (código TypeScript actualizado) ✅ VERIFICADO
- [ ] Backup de base de datos creado (N/A - sin deployment previo)
- [x] Plan de rollback documentado (UpdatePlansEnum.ts.backup como referencia) ✅ VERIFICADO
- [x] Testing en ambiente de staging (tests de integración) ✅ VERIFICADO
- [x] Ventana de mantenimiento coordinada (N/A - sin deployment previo)

#### Criterios de Aceptación

- [x] Migración `up()` ejecuta sin errores ✅ VERIFICADO (InitialSchema crea enum correctamente)
- [x] Migración `down()` revierte correctamente (N/A - InitialSchema, sin migración manual)
- [x] Enum `user_plan_enum` contiene: `'anonymous'`, `'free'`, `'premium'` ✅ VERIFICADO en PostgreSQL
- [x] Enum `plans_plantype_enum` contiene: `'anonymous'`, `'free'`, `'premium'` ✅ VERIFICADO en PostgreSQL
- [x] Usuarios con plan `professional` migrados a `premium` (N/A - sin usuarios previos)
- [x] Usuarios con plan `guest` migrados a `anonymous` (N/A - sin usuarios previos)
- [x] Tabla `plans` no contiene registro de `professional` ✅ VERIFICADO (solo 3 planes en DB)
- [x] Tabla `plans` tiene registro de `anonymous` ✅ VERIFICADO en PostgreSQL
- [x] Sin pérdida de datos durante migración (sin datos previos)
- [x] Tests de migración pasando ✅ VERIFICADO (8 suites integración, 92 tests)
- [x] Documentación de rollback completa (UpdatePlansEnum.ts.backup como referencia)

**⚠️ Nota de Verificación:** Los valores actuales en DB difieren del seeder original:

- ANONYMOUS: `readingsLimit: 3` (seeder define 3, correcto)
- FREE: `readingsLimit: 10, aiQuotaMonthly: 100` (⚠️ NO coincide con TASK-003: debe ser 2 y 0)
- PREMIUM: `readingsLimit: -1, aiQuotaMonthly: -1` (ilimitado, correcto)

#### Verificaciones Ejecutadas (21 Dic 2025)

```bash
# Verificación 1: Enum user_plan_enum ✅ PASADO
SELECT unnest(enum_range(NULL::user_plan_enum))::text;
# Resultado: anonymous, free, premium

# Verificación 2: Enum plans_plantype_enum ✅ PASADO
SELECT unnest(enum_range(NULL::plans_plantype_enum))::text;
# Resultado: anonymous, free, premium

# Verificación 3: Usuarios existentes ✅ PASADO
SELECT DISTINCT plan FROM "user";
# Resultado: free, premium (sin guest ni professional)

# Verificación 4: Configuración de planes ⚠️ REQUIERE AJUSTE (ver TASK-003)
SELECT "planType", name, "readingsLimit", "aiQuotaMonthly" FROM plans;
# Resultado:
# anonymous | Plan Anónimo  |  3 |   0  ✅
# free      | Plan Gratuito | 10 | 100  ⚠️ (debe ser 2 y 0)
# premium   | Plan Premium  | -1 |  -1  ✅
```

#### Testing de Migración (Comandos de Referencia)

```bash
# 1. Crear backup
pg_dump -U postgres tarot_db > backup_before_migration.sql

# 2. Ejecutar migración
npm run migration:run

# 3. Verificar enums en PostgreSQL
psql -U postgres -d tarot_db -c "SELECT unnest(enum_range(NULL::user_plan_enum));"
# Debe retornar: anonymous, free, premium

# 4. Verificar migración de usuarios
psql -U postgres -d tarot_db -c "SELECT plan, COUNT(*) FROM \"user\" GROUP BY plan;"
# No debe haber 'guest' ni 'professional'

# 5. Verificar tabla plans
psql -U postgres -d tarot_db -c "SELECT \"planType\", name FROM plans ORDER BY \"planType\";"
# Debe tener: anonymous, free, premium

# 6. Probar rollback en staging
npm run migration:revert

# 7. Verificar que volvió al estado anterior
psql -U postgres -d tarot_db -c "SELECT unnest(enum_range(NULL::user_plan_enum));"

# 8. Re-ejecutar para confirmar idempotencia
npm run migration:run
```

#### Plan de Rollback

En caso de problemas durante la migración en producción:

1. **Opción A - Rollback de migración:**

   ```bash
   npm run migration:revert
   ```

2. **Opción B - Restaurar desde backup:**

   ```bash
   psql -U postgres -d tarot_db < backup_before_migration.sql
   ```

3. **Opción C - Rollback manual (último recurso):**
   Ejecutar SQL inverso manualmente desde scripts de verificación

#### Riesgos y Mitigaciones

| Riesgo                        | Probabilidad | Impacto | Mitigación                                          |
| ----------------------------- | ------------ | ------- | --------------------------------------------------- |
| Pérdida de datos              | Baja         | Crítico | Backup completo antes de migrar                     |
| Downtime prolongado           | Media        | Alto    | Testing exhaustivo en staging, migración optimizada |
| Enum no se puede recrear      | Baja         | Alto    | Usar estrategia de enum temporal + rename           |
| Usuarios professional en prod | Media        | Medio   | Query de verificación antes de migrar               |
| Rollback falla                | Baja         | Crítico | Múltiples opciones de rollback documentadas         |

#### Comandos de Generación

```bash
# Generar migración vacía
npm run migration:generate -- -n UpdatePlansEnum

# Editar archivo generado con la lógica arriba
# backend/tarot-app/src/database/migrations/[TIMESTAMP]-UpdatePlansEnum.ts
```

#### Notas Importantes

- ⚠️ **NO usar `synchronize: true` en producción**
- ⚠️ Ejecutar primero en ambiente de staging
- ⚠️ Crear backup ANTES de ejecutar en producción
- ⚠️ Coordinar ventana de mantenimiento si es necesario
- ✅ La migración es idempotente (puede ejecutarse múltiples veces)
- ✅ El rollback está completamente implementado

---

### ✅ TASK-003: Actualizar seeder de planes con nuevos valores - COMPLETADA

**Prioridad:** 🔴 P0 - CRÍTICO
**Área:** Backend - Database Seeders
**Estimación:** 1.5 horas
**Tiempo Real:** 1 hora
**Dependencias:** TASK-001, TASK-002
**Feature:** F001, F002
**Branch:** `feature/TASK-003-update-plans-seeder` (ready for merge)
**Estado:** ✅ COMPLETADA (22 Dic 2025)

#### Descripción

Actualizar `plans.seeder.ts` para crear solo 3 planes con las configuraciones correctas según MVP_STRATEGY_SUMMARY.

**IMPORTANTE:** FREE y ANONYMOUS **NO tienen acceso a IA** (`aiQuotaMonthly: 0`).

#### Configuración de Planes

**Plan ANONYMOUS (invitado no registrado):**

- `planType`: `ANONYMOUS`
- `name`: "Plan Anónimo"
- `price`: 0
- `readingsLimit`: 1 (carta del día)
- `aiQuotaMonthly`: 0 ← **SIN IA**
- `canUseCustomQuestions`: false
- `canAccessDailyCard`: true
- `maxCardsPerReading`: 1

**Plan FREE (registrado gratis):**

- `planType`: `FREE`
- `name`: "Plan Gratis"
- `price`: 0
- `readingsLimit`: 2 (1 carta del día + 1 tirada de 3 cartas)
- `aiQuotaMonthly`: 0 ← **SIN IA**
- `canUseCustomQuestions`: false
- `canAccessDailyCard`: true
- `maxCardsPerReading`: 3

**Plan PREMIUM (pago):**

- `planType`: `PREMIUM`
- `name`: "Plan Premium"
- `price`: 9.99
- `readingsLimit`: 3
- `aiQuotaMonthly`: 100 ← **CON IA**
- `canUseCustomQuestions`: true
- `canAccessDailyCard`: true
- `maxCardsPerReading`: 10

#### Archivos a Modificar

- `backend/tarot-app/src/database/seeders/plans.seeder.ts`

#### Criterios de Aceptación

- [x] Seeder crea exactamente 3 planes (ANONYMOUS, FREE, PREMIUM) ✅ VERIFICADO
- [x] Plan ANONYMOUS: `readingsLimit: 1`, `aiQuotaMonthly: 0` ✅ VERIFICADO
- [x] Plan FREE: `readingsLimit: 2`, `aiQuotaMonthly: 0` ✅ VERIFICADO
- [x] Plan PREMIUM: `readingsLimit: 3`, `aiQuotaMonthly: 100` ✅ VERIFICADO
- [x] No existe plan PROFESSIONAL en seeder ✅ VERIFICADO
- [x] Seeder ejecuta sin errores ✅ VERIFICADO
- [x] Tests unitarios del seeder pasan (3/3 tests passed) ✅ VERIFICADO
- [x] Valores en base de datos coinciden con especificaciones ✅ VERIFICADO (22 Dic 2025)

#### Testing

```bash
# Ejecutar seeder
npm run db:seed

# Verificar planes creados
psql -U postgres -d tarot_dev -c "SELECT \"planType\", name, \"readingsLimit\", \"aiQuotaMonthly\" FROM plans ORDER BY \"planType\";"

# Debe retornar:
# planType    | name          | readingsLimit | aiQuotaMonthly
# -----------+--------------+---------------+----------------
# anonymous  | Plan Anónimo |       1       |       0
# free       | Plan Gratis  |       2       |       0
# premium    | Plan Premium |       3       |     100
```

#### Impacto en Costos

- ✅ FREE con `aiQuotaMonthly: 0` → ahorro de ~$50-100/mes por 1,000 usuarios
- ✅ ANONYMOUS ya tenía 0, sin cambios

---

### 🔍 NOTA IMPORTANTE: Lógica de Respuesta para Usuarios FREE

**Pregunta:** ¿Necesita lógica propia para mostrar descripción de cartas a usuarios FREE?

**Respuesta:** **NO necesita lógica adicional.** Las cartas ya tienen contenido estático en la base de datos.

#### Modelo de Datos Existente

La entidad `TarotCard` ya contiene:

```typescript
// Campos disponibles en TarotCard.entity.ts
meaningUpright: string; // "Nuevos comienzos, libertad..."
meaningReversed: string; // "Imprudencia, riesgos..."
description: string; // "El Loco simboliza el inicio..."
keywords: string; // "Aventura, libertad, caos..."
```

#### Respuesta del Backend según Plan

**Usuario FREE (SIN IA):**

```json
{
  "id": 123,
  "cards": [
    {
      "id": 1,
      "name": "El Loco",
      "position": "upright",
      "meaningUpright": "Nuevos comienzos, libertad...",
      "description": "El Loco simboliza...",
      "keywords": "Aventura, libertad..."
    }
  ],
  "interpretation": null, // ← NULL (sin IA)
  "hasInterpretation": false
}
```

**Usuario PREMIUM (CON IA):**

```json
{
  "id": 124,
  "cards": [...],  // Mismo contenido estático
  "interpretation": "Basado en tus cartas, veo que...",  // ← Generado por IA
  "hasInterpretation": true
}
```

#### Implementación

La lógica ya existe en:

- **Backend:** `readings-orchestrator.service.ts` decide si llamar a IA según `generateInterpretation` flag
- **Frontend:** Renderiza `interpretation` si existe, o muestra `meaningUpright/description` de cada carta

**No requiere desarrollo adicional**, solo verificar que:

1. FREE users tengan `generateInterpretation: false` (TASK-005)
2. Frontend muestre correctamente ambos casos (verificar en TASK-014)

---

### 📝 TASK-004: Crear guard para bloquear IA en planes FREE y ANONYMOUS

**Prioridad:** 🔴 P0 - CRÍTICO (Ahorro de Costos)  
**Área:** Backend - Guards  
**Estimación:** 2 horas  
**Dependencias:** TASK-001  
**Feature:** F004, F005  
**Branch sugerido:** `feat/premium-ai-guard`

#### Descripción

Crear un nuevo guard `RequiresPremiumForAIGuard` que bloquee la generación de interpretación con IA para planes FREE y ANONYMOUS. Solo usuarios PREMIUM pueden usar IA.

#### Archivo a Crear

- `backend/tarot-app/src/modules/tarot/readings/guards/requires-premium-for-ai.guard.ts`
- `backend/tarot-app/src/modules/tarot/readings/guards/requires-premium-for-ai.guard.spec.ts` (tests)

#### Lógica del Guard

1. Leer `request.body.generateInterpretation`
2. Si es `false` o `undefined` → permitir (lectura sin IA)
3. Si es `true` y usuario NO es PREMIUM → lanzar `ForbiddenException`
4. Si es `true` y usuario es PREMIUM → permitir

#### Mensaje de Error

"Las interpretaciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad."

#### Archivos a Modificar

- `backend/tarot-app/src/modules/tarot/readings/readings.controller.ts`
  - Agregar `RequiresPremiumForAIGuard` al array de `@UseGuards()` del endpoint `POST /readings`

#### Criterios de Aceptación

- [ ] Guard creado e implementa `CanActivate`
- [ ] Bloquea `generateInterpretation: true` para FREE y ANONYMOUS
- [ ] Permite `generateInterpretation: true` solo para PREMIUM
- [ ] Permite `generateInterpretation: false` para todos los planes
- [ ] Mensaje de error claro y localizado
- [ ] Guard aplicado en controller de readings
- [ ] Tests del guard con 100% coverage
- [ ] Tests de integración del endpoint pasando

#### Tests a Implementar

1. **Test: PREMIUM puede generar IA**
   - Usuario PREMIUM + `generateInterpretation: true` → 201 Created

2. **Test: FREE no puede generar IA**
   - Usuario FREE + `generateInterpretation: true` → 403 Forbidden

3. **Test: ANONYMOUS no puede generar IA**
   - Usuario ANONYMOUS + `generateInterpretation: true` → 403 Forbidden

4. **Test: FREE puede crear lectura sin IA**
   - Usuario FREE + `generateInterpretation: false` → 201 Created

5. **Test: Campo omitido se permite (asume false)**
   - Usuario FREE sin campo `generateInterpretation` → 201 Created

#### Impacto

🔥 **CRÍTICO - AHORRO DE COSTOS:** Este guard previene que usuarios FREE/ANONYMOUS usen IA accidentalmente, eliminando ~$50-100 USD/mes por cada 1,000 usuarios.

---

### 📝 TASK-005: Cambiar default de generateInterpretation a false

**Prioridad:** 🔴 P0 - CRÍTICO (Ahorro de Costos)  
**Área:** Backend - DTOs  
**Estimación:** 30 min  
**Dependencias:** TASK-004  
**Feature:** F004, F005  
**Branch sugerido:** `chore/interpretation-default-false`

#### Descripción

Cambiar el valor por defecto del campo `generateInterpretation` en CreateReadingDto de `true` a `false`. Esto asegura que si el frontend no envía el campo, NO se generará interpretación con IA.

#### Archivos a Modificar

- `backend/tarot-app/src/modules/tarot/readings/dto/create-reading.dto.ts`

#### Cambios Específicos

**Campo `generateInterpretation`:**

- Cambiar `default: true` → `default: false`
- Cambiar `example: true` → `example: false`
- Actualizar description: "Si se debe generar interpretación con IA (solo Premium)"
- Cambiar valor inicial: `generateInterpretation: boolean = true` → `= false`

#### Archivos de Tests a Actualizar

- `create-reading.dto.spec.ts` - Verificar que default es false
- `create-reading.use-case.spec.ts` - Ajustar tests que asuman true por defecto
- `readings.controller.spec.ts` - Ajustar tests de integración

#### Criterios de Aceptación

- [ ] Default del campo es `false`
- [ ] Documentación Swagger actualizada (example: false)
- [ ] Si frontend omite el campo → se asume `false`
- [ ] Tests actualizados para reflejar nuevo default
- [ ] No hay errores de compilación
- [ ] Tests de DTO pasando con coverage 100%

#### Impacto

- ✅ Previene generación accidental de IA si frontend no envía el campo
- ✅ Reduce superficie de error (defensive programming)
- ✅ Menor consumo de cuota de IA en entornos de desarrollo

#### Testing Manual

```bash
# Test: Crear lectura sin especificar generateInterpretation
curl -X POST http://localhost:3000/api/readings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "spreadId": 1,
    "deckId": 1,
    "cardIds": [1],
    "cardPositions": [{"cardId": 1, "position": "presente", "isReversed": false}],
    "predefinedQuestionId": 1
  }'

# Verificar: reading.interpretation debe ser null
```

---

### 📝 TASK-006: Actualizar usage limits constants

**Prioridad:** 🔴 P0 - CRÍTICO  
**Área:** Backend - Usage Limits  
**Estimación:** 1 hora  
**Dependencias:** TASK-001  
**Feature:** F002  
**Branch sugerido:** `chore/update-usage-limits`

#### Descripción

Actualizar constantes de límites de uso (`USAGE_LIMITS`) para reflejar nuevos valores de planes: eliminar PROFESSIONAL, renombrar GUEST a ANONYMOUS, y ajustar límites diarios.

#### Archivos a Modificar

- `backend/tarot-app/src/modules/usage-limits/usage-limits.constants.ts`

#### Cambios por Plan

**ANONYMOUS (antes GUEST):**

- `TAROT_READING`: Cambiar de 3 a **1**
- `INTERPRETATION_REGENERATION`: Mantener en **0**
- `ORACLE_QUERY`: Mantener en **0**

**FREE:**

- `TAROT_READING`: Cambiar a **2** (carta del día + 1 tirada 3 cartas)
- `INTERPRETATION_REGENERATION`: Mantener en **0**
- `ORACLE_QUERY`: Mantener en **5**

**PREMIUM:**

- `TAROT_READING`: Cambiar de -1 a **3** (límite de 3 tiradas/día)
- `INTERPRETATION_REGENERATION`: Mantener en **-1** (ilimitado)
- `ORACLE_QUERY`: Mantener en **-1** (ilimitado)

**PROFESSIONAL:**

- **ELIMINAR** completamente la entrada

#### Criterios de Aceptación

- [ ] Constante `USAGE_LIMITS` no contiene `UserPlan.PROFESSIONAL`
- [ ] `UserPlan.GUEST` renombrado a `UserPlan.ANONYMOUS`
- [ ] Límites actualizados según nueva estrategia
- [ ] No hay errores de compilación TypeScript
- [ ] Tests que usen estas constantes actualizados
- [ ] Comentarios en código actualizados (eliminar referencia a "unlimited PROFESSIONAL")

#### Testing

```bash
# Verificar que los imports funcionan
npm run build

# Ejecutar tests de usage limits
npm test -- usage-limits
```

#### Notas

- Este archivo trabaja junto con el sistema de plan-config (DB)
- Los límites aquí son defaults/fallback
- La fuente de verdad final son los valores en DB (tabla `plans`)

---

### 📝 TASK-007: Implementar sistema de reset diario de límites (Cron Job)

**Prioridad:** 🔴 P0 - CRÍTICO  
**Área:** Backend - Usage Limits / Scheduling  
**Estimación:** 4 horas  
**Dependencias:** TASK-006  
**Feature:** F002  
**Branch sugerido:** `feat/daily-limits-reset`

#### Descripción

Implementar cron job que resetea los límites de uso diariamente a medianoche UTC. Actualmente los límites son totales (sin reset), lo que no cumple con la estrategia de límites diarios.

#### Archivos a Crear

- `backend/tarot-app/src/modules/usage-limits/services/usage-limits-reset.service.ts`
- `backend/tarot-app/src/modules/usage-limits/services/usage-limits-reset.service.spec.ts`

#### Archivos a Modificar

- `backend/tarot-app/src/modules/usage-limits/usage-limits.module.ts`
  - Importar `ScheduleModule.forRoot()`
  - Agregar `UsageLimitsResetService` a providers
- `backend/tarot-app/package.json`
  - Verificar que `@nestjs/schedule` está instalado (o instalarlo)

#### Lógica del Cron Job

1. **Trigger:** Todos los días a las 00:00 UTC
2. **Acción:** Eliminar registros de `usage_limit` de hace más de 7 días (retención)
3. **Logging:** Registrar cantidad de registros eliminados
4. **Error handling:** Capturar y loggear errores sin detener la app

#### Criterios de Aceptación

- [ ] Servicio `UsageLimitsResetService` creado con decorator `@Injectable()`
- [ ] Cron job configurado con `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`
- [ ] Timezone configurado a UTC
- [ ] Elimina registros de `usage_limit` con `createdAt < now() - 7 days`
- [ ] Logs informativos en cada ejecución
- [ ] Error handling con try/catch
- [ ] Tests unitarios del servicio
- [ ] Tests de integración (verificar que cron se registra)
- [ ] Documentación de configuración

#### Testing

**Tests Unitarios:**

1. Elimina registros antiguos correctamente
2. Mantiene registros recientes (< 7 días)
3. Maneja errores sin lanzar excepción
4. Loggea cantidad de registros eliminados

**Test Manual:**

```bash
# Insertar registros de prueba con fechas antiguas
psql -d tarot_dev -c "INSERT INTO usage_limit (user_id, feature, count, created_at) VALUES (1, 'tarot_reading', 5, NOW() - INTERVAL '10 days');"

# Esperar a medianoche UTC o triggear manualmente el cron
# Verificar que se eliminó
psql -d tarot_dev -c "SELECT * FROM usage_limit WHERE created_at < NOW() - INTERVAL '7 days';"
```

#### Configuración de Timezone

Asegurar que el servidor use UTC:

- Variable de entorno `TZ=UTC`
- Configuración de NestJS para UTC
- Verificación en logs

#### Notas

- El reset es por eliminación de registros antiguos, no por actualizar a 0
- Cada día se cuentan solo las acciones del día actual (filtrado por `createdAt`)
- Retención de 7 días permite analytics históricos

---

### 📝 TASK-008: Actualizar validación de límites para filtrar por día actual

**Prioridad:** 🔴 P0 - CRÍTICO  
**Área:** Backend - Usage Limits Service  
**Estimación:** 2.5 horas  
**Dependencias:** TASK-007  
**Feature:** F002  
**Branch sugerido:** `feat/daily-limit-validation`

#### Descripción

Modificar `CheckUsageLimitGuard` y `UsageLimitsService` para que verifiquen límites solo del día actual (UTC), no del total histórico. Esto convierte los límites de "totales" a "diarios".

#### Archivos a Modificar

- `backend/tarot-app/src/modules/usage-limits/usage-limits.service.ts`
- `backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.ts`
- `backend/tarot-app/src/modules/usage-limits/usage-limits.service.spec.ts`

#### Cambios en UsageLimitsService

**Método a modificar:** `checkLimit(userId, feature)`

**Lógica actual:** Cuenta TODAS las acciones del usuario para esa feature
**Lógica nueva:** Cuenta solo las acciones de HOY (desde 00:00 UTC hasta ahora)

**Pasos:**

1. Obtener fecha de inicio del día actual en UTC
2. Filtrar query de `usage_limit` por `userId`, `feature`, y `createdAt >= today`
3. Contar registros que cumplan filtro
4. Comparar con límite del plan

#### Cambios en CheckUsageLimitGuard

- Asegurar que usa el método actualizado del service
- Mensaje de error debe indicar "límite diario" (no solo "límite")
- Ejemplo: "Has alcanzado tu límite diario de 2 lecturas. Vuelve mañana o actualiza a Premium."

#### Criterios de Aceptación

- [ ] Query de conteo filtra por día actual (UTC)
- [ ] Límites se resetean automáticamente cada día
- [ ] Mensaje de error menciona "diario" y cuándo resetea
- [ ] Tests verifican conteo solo de hoy
- [ ] Tests verifican que acciones de ayer no cuentan
- [ ] No afecta funcionalidad de otros features
- [ ] Performance: query usa índice en `createdAt`

#### Tests a Implementar

1. **Test: Contar solo acciones de hoy**
   - Crear 5 lecturas ayer, 2 hoy → debe contar 2

2. **Test: Reseteo implícito a medianoche**
   - Simular medianoche → contador debe volver a 0

3. **Test: Diferentes features se cuentan separadamente**
   - 2 TAROT_READING + 3 ORACLE_QUERY → no se suman

4. **Test: Usuarios diferentes no interfieren**
   - User A con 2 lecturas, User B con 1 → cada uno su contador

#### Performance Considerations

- Agregar índice compuesto: `(userId, feature, createdAt)` en tabla `usage_limit`
- Query debe ser rápido (<50ms) incluso con millones de registros históricos

---

## 🎯 Sprint 2: Validaciones y Guards (1 semana)

### Objetivo

Asegurar que todas las validaciones de planes estén correctas y que el contenido estático de cartas esté completo para usuarios FREE/ANONYMOUS.

### Tareas Incluidas

- TASK-009 a TASK-014 (Backend: 009-012, Frontend: 013-014)
- **Foco:** Prevenir bugs y asegurar UX correcta sin IA

---

### 📝 TASK-009: Actualizar guard de custom questions para validar solo PREMIUM

**Prioridad:** 🟠 P1 - ALTO (Backend)  
**Área:** Backend - Guards  
**Estimación:** 1 hora  
**Dependencias:** TASK-001  
**Feature:** F012  
**Branch sugerido:** `fix/custom-question-guard-premium`

#### Descripción

Actualizar `RequiresPremiumForCustomQuestionGuard` para que valide SOLO usuarios PREMIUM (no solo bloquear FREE). Actualmente el guard solo verifica `if (plan === FREE)`, pero con 3 planes (ANONYMOUS, FREE, PREMIUM) debe ser `if (plan !== PREMIUM)`.

#### Archivos a Modificar

- `backend/tarot-app/src/modules/tarot/readings/guards/requires-premium-for-custom-question.guard.ts`
- `backend/tarot-app/src/modules/tarot/readings/guards/requires-premium-for-custom-question.guard.spec.ts`

#### Lógica Actual vs Nueva

**Actual:** `if (user.plan === UserPlan.FREE) throw ForbiddenException`  
**Problema:** ANONYMOUS puede usar custom questions (no está bloqueado)

**Nueva:** `if (user.plan !== UserPlan.PREMIUM) throw ForbiddenException`  
**Solución:** Solo PREMIUM puede, cualquier otro plan se bloquea

#### Criterios de Aceptación

- [ ] Guard bloquea ANONYMOUS con custom question → 403
- [ ] Guard bloquea FREE con custom question → 403
- [ ] Guard permite PREMIUM con custom question → pasa
- [ ] Guard permite todos los planes sin custom question → pasa
- [ ] Mensaje de error actualizado
- [ ] Tests cubren los 3 planes
- [ ] Coverage 100% del guard

#### Tests a Agregar

1. **Test: ANONYMOUS + customQuestion → 403**
2. **Test: FREE + customQuestion → 403** (ya existe)
3. **Test: PREMIUM + customQuestion → pasa**
4. **Test: ANONYMOUS sin customQuestion → pasa**

---

### 📝 TASK-010: Actualizar validaciones en reading-validator.service

**Prioridad:** 🟠 P1 - ALTO (Backend)  
**Área:** Backend - Services  
**Estimación:** 1.5 horas  
**Dependencias:** TASK-001  
**Feature:** F001, F002  
**Branch sugerido:** `refactor/reading-validator-plans`

#### Descripción

Actualizar `ReadingValidatorService` para eliminar referencias a PROFESSIONAL y asegurar que las validaciones funcionen con los 3 planes correctos (ANONYMOUS, FREE, PREMIUM).

#### Archivos a Modificar

- `backend/tarot-app/src/modules/tarot/readings/application/services/reading-validator.service.ts`
- `backend/tarot-app/src/modules/tarot/readings/application/services/reading-validator.service.spec.ts`

#### Cambios Específicos

**Método `validateUserIsPremium`:**

- Ya existe y valida correctamente `user.plan !== UserPlan.PREMIUM`
- Verificar que funcione con nuevos planes

**Método `validateFreeUserReadingsLimit`:**

- Comentario menciona "PREMIUM, PROFESSIONAL" → actualizar a solo "PREMIUM"
- Lógica está correcta (usa DB config), solo actualizar comentarios

**Comentarios y documentación:**

- Buscar y eliminar referencias a "professional"
- Actualizar JSDoc de métodos

#### Criterios de Aceptación

- [ ] No hay referencias a "professional" en el archivo
- [ ] Comentarios actualizados para 3 planes
- [ ] Método `validateUserIsPremium` funciona con ANONYMOUS, FREE
- [ ] Tests cubren los 3 planes
- [ ] No hay regresión en funcionalidad existente

#### Tests a Verificar

1. ANONYMOUS alcanza límite → ForbiddenException
2. FREE alcanza límite → ForbiddenException
3. PREMIUM sin límite → pasa
4. Validación de ownership funciona para todos los planes

---

### 📝 TASK-011: Verificar y completar contenido estático de cartas

**Prioridad:** 🟡 P2 - MEDIO (Backend)  
**Área:** Backend - Database / Content  
**Estimación:** 3-4 horas  
**Dependencias:** Ninguna  
**Feature:** F007  
**Branch sugerido:** `content/complete-card-descriptions`

#### Descripción

Auditar base de datos para verificar que TODAS las cartas del tarot tienen descripciones completas (nombre, descripción, significado derecho/invertido, keywords). Esto es crítico porque usuarios FREE/ANONYMOUS solo ven este contenido (sin IA).

#### Archivos a Revisar

- `backend/tarot-app/src/database/seeds/cards-seeder.ts` (si existe)
- Tabla `card` en base de datos
- Posiblemente archivos JSON con datos de cartas

#### Pasos de Auditoría

1. **Ejecutar query de verificación:**
   - Cartas sin descripción
   - Cartas sin significado_derecho
   - Cartas sin significado_invertido
   - Cartas sin keywords
   - Cartas sin imagen

2. **Identificar cartas faltantes:**
   - Listar IDs de cartas con datos incompletos
   - Documentar qué campos faltan por carta

3. **Completar contenido:**
   - Usar fuente confiable de tarot
   - Traducir a español
   - Mantener tono consistente con Flavia

4. **Crear/actualizar seeder:**
   - Si no existe seeder de cartas, crearlo
   - Asegurar que es idempotente
   - Agregar tests del seeder

#### Criterios de Aceptación

- [ ] Script SQL de verificación ejecutado
- [ ] 100% de cartas tienen `description` no nulo
- [ ] 100% de cartas tienen `meaning_upright` no nulo
- [ ] 100% de cartas tienen `meaning_reversed` no nulo
- [ ] 100% de cartas tienen `keywords` (mínimo 3 por carta)
- [ ] 100% de cartas tienen `imageUrl` válida
- [ ] Seeder actualizado con contenido completo
- [ ] Documentación de fuentes de contenido

#### Query de Verificación

```sql
-- Verificar cartas incompletas
SELECT id, name,
       CASE WHEN description IS NULL THEN 'SIN_DESC' ELSE 'OK' END as desc_status,
       CASE WHEN meaning_upright IS NULL THEN 'SIN_UPRIGHT' ELSE 'OK' END as upright_status,
       CASE WHEN meaning_reversed IS NULL THEN 'SIN_REVERSED' ELSE 'OK' END as reversed_status,
       CASE WHEN keywords IS NULL OR array_length(keywords, 1) < 3 THEN 'SIN_KEYWORDS' ELSE 'OK' END as keywords_status,
       CASE WHEN image_url IS NULL THEN 'SIN_IMG' ELSE 'OK' END as img_status
FROM card
WHERE description IS NULL
   OR meaning_upright IS NULL
   OR meaning_reversed IS NULL
   OR keywords IS NULL
   OR array_length(keywords, 1) < 3
   OR image_url IS NULL;
```

#### Notas

- Prioridad media porque el sistema puede funcionar sin esto, pero UX será pobre
- Contenido debe ser profesional y coherente
- Si hay muchas cartas incompletas, considerar contratar copywriter especializado en tarot

---

### 📝 TASK-012: Actualizar endpoints de categorías y preguntas (públicos vs auth)

**Prioridad:** 🟡 P2 - MEDIO (Backend)  
**Área:** Backend - Controllers  
**Estimación:** 2 horas  
**Dependencias:** TASK-001  
**Feature:** F011, F012  
**Branch sugerido:** `feat/categories-questions-access`

#### Descripción

Revisar y decidir nivel de acceso de endpoints de categorías y preguntas predefinidas. Según estrategia MVP, solo PREMIUM usa categorías/preguntas, pero los endpoints pueden ser públicos para marketing.

#### Archivos a Revisar

- `backend/tarot-app/src/modules/categories/categories.controller.ts`
- `backend/tarot-app/src/modules/predefined-questions/predefined-questions.controller.ts`

#### Decisiones a Tomar

**Opción A: Endpoints Públicos (sin auth)**

- GET categorías → público (para landing page)
- GET preguntas → público (para mostrar ejemplos)
- Validación al USAR se hace en create-reading (ya existe guard)

**Opción B: Endpoints Protegidos (requieren auth)**

- GET categorías → requiere JWT
- GET preguntas → requiere JWT
- Solo usuarios logueados pueden verlos

**Recomendación:** Opción A (públicos para marketing)

#### Cambios si se elige Opción A

**Categories Controller:**

- Eliminar `@UseGuards(JwtAuthGuard)` del GET
- Mantener auth en POST/PUT/DELETE (admin only)

**Predefined Questions Controller:**

- Eliminar `@UseGuards(JwtAuthGuard)` del GET
- Opcional: Agregar filtro por categoría
- Mantener auth en POST/PUT/DELETE (admin only)

**Documentación Swagger:**

- Actualizar @ApiOperation para indicar que son públicos
- Agregar ejemplos de uso en landing page

#### Criterios de Aceptación

- [ ] Decisión documentada (Opción A o B)
- [ ] Guards actualizados según decisión
- [ ] Swagger docs actualizados
- [ ] Tests de acceso público/privado pasando
- [ ] Frontend puede acceder sin auth (si Opción A)
- [ ] Create-reading sigue validando plan PREMIUM al usar

#### Tests a Implementar

**Si Opción A (público):**

1. GET /categories sin auth → 200 OK
2. GET /predefined-questions sin auth → 200 OK
3. POST /readings con categoryId + FREE → 403 (guard bloquea)

**Si Opción B (privado):**

1. GET /categories sin auth → 401 Unauthorized
2. GET /categories con auth → 200 OK

---

### 📝 TASK-013: Actualizar tipos y API client del frontend

**Prioridad:** 🟠 P1 - ALTO (Frontend)  
**Área:** Frontend - Types & API  
**Estimación:** 2 horas  
**Dependencias:** TASK-001, TASK-002, TASK-005  
**Feature:** F001  
**Branch sugerido:** `feat/update-frontend-plan-types`

#### Descripción

Actualizar tipos TypeScript del frontend para reflejar los nuevos planes (ANONYMOUS, FREE, PREMIUM) y el cambio de default en `generateInterpretation`.

#### Archivos a Modificar

- `frontend/src/types/user.types.ts` - Enum de planes
- `frontend/src/types/reading.types.ts` - CreateReadingDto
- `frontend/src/lib/api/readings-api.ts` - API functions
- Cualquier componente que muestre badges de plan

#### Cambios en user.types.ts

**Si existe enum UserPlan en frontend:**

```typescript
// ANTES
export enum UserPlan {
  GUEST = "guest",
  FREE = "free",
  PREMIUM = "premium",
  PROFESSIONAL = "professional",
}

// DESPUÉS
export enum UserPlan {
  ANONYMOUS = "anonymous",
  FREE = "free",
  PREMIUM = "premium",
}
```

**Si usa type literal:**

```typescript
// Actualizar de:
type UserPlan = "guest" | "free" | "premium" | "professional";
// A:
type UserPlan = "anonymous" | "free" | "premium";
```

#### Cambios en reading.types.ts

**CreateReadingDto:**

- Campo `generateInterpretation?: boolean` debe tener default `false` en documentación
- Agregar comentario: "// Solo true para usuarios Premium"

#### Cambios en Componentes

**Buscar y actualizar:**

- Badges que muestren "Guest" → "Anónimo"
- Badges que muestren "Professional" → eliminar o cambiar a "Premium"
- Lógica condicional que use `plan === 'guest'` → actualizar a `'anonymous'`

#### Criterios de Aceptación

- [ ] No hay errores de compilación TypeScript
- [ ] Enum/type de planes actualizado
- [ ] CreateReadingDto refleja cambio de backend
- [ ] Búsqueda de "guest" y "professional" en src/ sin resultados
- [ ] Componentes de badges actualizados
- [ ] Tests de tipos pasando
- [ ] ESLint sin warnings

#### Búsqueda Global

```bash
# Desde frontend/
grep -r "guest\|GUEST\|professional\|PROFESSIONAL" src/ --exclude-dir=node_modules
```

---

### 📝 TASK-014: Implementar UI condicional con upsell de features Premium

**Prioridad:** 🟠 P1 - ALTO (Frontend)  
**Área:** Frontend - UI/UX + Conversion  
**Estimación:** 4 horas  
**Dependencias:** TASK-013  
**Feature:** F011, F012, F013, F018  
**Branch sugerido:** `feat/premium-upsell-ui`

#### Descripción

Implementar lógica en el frontend para **mostrar todas las features pero deshabilitar las premium** con CTAs claros de upgrade.

**Estrategia de Conversión (Freemium):**

- ✅ **MOSTRAR** features premium (deshabilitadas) para que usuarios sepan que existen
- ✅ **AGREGAR** tooltips y badges "Solo Premium"
- ✅ **INCLUIR** CTAs de upgrade estratégicos
- ❌ **NO OCULTAR** completamente (reduce awareness y conversión)

#### Componentes a Modificar

**Formulario de Nueva Lectura:**

**1. Selector de Categorías (F011):**

- FREE/ANONYMOUS: Mostrar selector **deshabilitado** con badge "🔒 Premium"
- Tooltip al hover: "Las categorías personalizadas están disponibles en Premium. Actualizar ahora"
- Click en selector deshabilitado → modal de upgrade

**2. Input de Pregunta Personalizada (F012):**

- FREE/ANONYMOUS: Mostrar input **deshabilitado** con placeholder "Pregunta personalizada (Solo Premium)"
- Badge "🔒 Premium" junto al label
- Click en input → modal de upgrade con beneficios

**3. Checkbox "Generar Interpretación IA" (F013):**

- FREE/ANONYMOUS: Mostrar checkbox **deshabilitado** + tooltip
- Label: "Generar interpretación con IA 🔒 Premium"
- Tooltip: "Las interpretaciones personalizadas con IA requieren Premium"

**4. Preguntas Predefinidas:**

- FREE: Mostrar dropdown **habilitado** (pueden usar)
- Badge informativo: "Gratis" o "✓ Incluido en tu plan"

**Resultados de Lectura:**

- FREE/ANONYMOUS: Mostrar descripción estática de cartas + banner de upgrade
- Banner: "💎 Desbloquea interpretaciones personalizadas con IA. Upgrade a Premium"
- PREMIUM: Mostrar interpretación completa con IA

**Dashboard/Home:**

- Mostrar badge de plan actual (FREE, ANONYMOUS, PREMIUM)
- Contador de lecturas restantes del día
- Card destacado "Upgrade a Premium" siempre visible para FREE/ANONYMOUS
- Listado de beneficios Premium en sidebar

#### Archivos Probables

- `frontend/src/components/features/readings/ReadingForm.tsx`
- `frontend/src/components/features/readings/ReadingResult.tsx`
- `frontend/src/components/features/readings/UpgradeModal.tsx` (crear)
- `frontend/src/components/features/readings/PremiumBadge.tsx` (crear)
- `frontend/src/app/dashboard/page.tsx`

#### Componentes Nuevos a Crear

**PremiumBadge.tsx:**

```typescript
// Componente reutilizable para marcar features premium
<PremiumBadge variant="lock" />
<PremiumBadge variant="unlock" tooltipText="Solo Premium" />
```

**UpgradeModal.tsx:**

- Título: "Desbloquea todo el potencial del Tarot"
- Lista de beneficios Premium
- Precio: $9.99/mes
- CTA: "Comenzar ahora"
- Link: "Ver más sobre Premium"

#### Lógica Condicional

**Hook personalizado:**

```typescript
// hooks/useUserPlanFeatures.ts
const useUserPlanFeatures = () => {
  const { user } = useAuth();
  const plan = user?.plan || "anonymous";

  return {
    canUseAI: plan === "premium",
    canUseCategories: plan === "premium",
    canUseCustomQuestions: plan === "premium",
    canShare: plan !== "anonymous",
    isPremium: plan === "premium",
    isFree: plan === "free",
    isAnonymous: plan === "anonymous",
    dailyReadingsLimit: plan === "anonymous" ? 1 : plan === "free" ? 2 : 3,
  };
};
```

**En JSX:**

```tsx
const { canUseCategories, isPremium } = useUserPlanFeatures();

{
  /* Selector VISIBLE pero deshabilitado si no es premium */
}
<CategorySelector
  disabled={!canUseCategories}
  badge={!canUseCategories && <PremiumBadge />}
  onClick={!canUseCategories ? openUpgradeModal : undefined}
  tooltip={!canUseCategories ? "Solo Premium" : undefined}
/>;

{
  /* Banner de upgrade si no es premium */
}
{
  !isPremium && <UpgradeBanner />;
}
```

#### Criterios de Aceptación

- [ ] Selector de categorías VISIBLE pero deshabilitado para FREE/ANONYMOUS
- [ ] Input de pregunta personalizada VISIBLE pero deshabilitado para FREE/ANONYMOUS
- [ ] Checkbox IA VISIBLE pero deshabilitado para FREE/ANONYMOUS
- [ ] Todos los controles deshabilitados tienen badge "🔒 Premium"
- [ ] Tooltips explican beneficio de Premium al hover
- [ ] Click en feature deshabilitada abre UpgradeModal
- [ ] UpgradeModal tiene lista clara de beneficios y pricing
- [ ] CTAs de upgrade visibles en mínimo 3 ubicaciones estratégicas
- [ ] ReadingResult muestra banner de upgrade para FREE users
- [ ] UX es clara y no frustra al usuario
- [ ] Responsive en mobile
- [ ] Tests de componentes pasando

#### UX Best Practices Implementadas

**✅ Hacer (Estrategia de Conversión):**

- Mostrar feature deshabilitada con diseño atractivo (no grayed out feo)
- Badge visual claro "Premium" con icono de diamante/lock
- Tooltip informativo al hover explicando beneficio
- Click en feature deshabilitada → modal persuasivo (no error)
- CTA claro: "Actualizar a Premium" con precio visible
- Destacar valor antes del precio

**❌ Evitar (Anti-patrones):**

- Ocultar completamente features premium (reduce awareness)
- Mostrar botón activo que al clickear da error genérico
- Error toast sin guía de solución
- Feature deshabilitada sin explicación del por qué
- Demasiados banners de upgrade (spam)
- No mostrar precio (genera desconfianza)

#### Métricas de Éxito (Post-implementación)

- Tasa de apertura de UpgradeModal > 20%
- Click en CTA "Actualizar a Premium" > 10% de aperturas de modal
- Conversión FREE → PREMIUM > 5% (a 30 días)

#### Testing

```bash
# Tests de componentes
npm test -- PremiumBadge.test.tsx
npm test -- UpgradeModal.test.tsx
npm test -- useUserPlanFeatures.test.ts

# Tests de integración
npm test -- ReadingForm.test.tsx
```

#### Notas Importantes

- 💡 **Psicología de conversión:** Mostrar lo que se pierden (FOMO) es más efectivo que ocultarlo
- 💡 **Pricing visible:** Siempre mostrar precio en modal de upgrade (transparencia genera confianza)
- 💡 **CTAs estratégicos:** Ubicar en momentos de mayor intención (después de lectura, al alcanzar límite diario)
- 💡 **Mobile-first:** Mayoría de usuarios serán mobile, priorizar UX móvil

---

## 🎯 Sprint 3: Frontend UX y Monetización (2 semanas)

### Objetivo

Desarrollar Home Page dual, sistema de conversión, y preparar integración de Google Ads.

### Tareas Incluidas

- TASK-015 a TASK-019 (Frontend puro)
- **Foco:** Conversión de usuarios y monetización

---

### 📝 TASK-015: Crear componente LandingPage (usuarios no autenticados)

**Prioridad:** 🟡 P2 - MEDIO (Frontend)  
**Área:** Frontend - Pages/Components  
**Estimación:** 8-10 horas  
**Dependencias:** TASK-013  
**Feature:** F015  
**Branch sugerido:** `feat/landing-page`

#### Descripción

Crear landing page completa para usuarios no autenticados. Objetivo: explicar propuesta de valor y convertir a registro.

#### Archivos a Crear

- `frontend/src/components/features/home/LandingPage.tsx`
- `frontend/src/components/features/home/HeroSection.tsx`
- `frontend/src/components/features/home/TryWithoutRegisterSection.tsx`
- `frontend/src/components/features/home/PremiumBenefitsSection.tsx`
- `frontend/src/components/features/home/WhatIsTarotSection.tsx`
- `frontend/src/components/features/home/TestimonialsSection.tsx` (opcional)

#### Secciones de la Landing Page

**1. Hero Section**

- Headline principal: "Descubre tu destino con Tarot personalizado"
- Subheadline: Explicar propuesta de valor (IA + tarotista Flavia)
- CTA primario: "Comenzar Gratis"
- CTA secundario: "Probar sin registro"
- Imagen/ilustración de cartas de tarot

**2. Try Without Register Section**

- Título: "Prueba sin compromiso"
- Botón: "Carta del Día Gratis" (link a tirada anónima)
- Explicación: "1 carta aleatoria sin necesidad de registrarte"

**3. Premium Benefits Section**

- Título: "¿Por qué elegir Premium?"
- Lista de beneficios:
  - ✨ Interpretaciones con IA personalizadas
  - 🔮 Todas las tiradas disponibles
  - ❓ Preguntas personalizadas
  - 📊 Estadísticas avanzadas
  - 🚫 Sin publicidad
- Precio: "$X.XX/mes"
- CTA: "Actualizar a Premium"

**4. What Is Tarot Section**

- Título: "¿Qué es el Tarot?"
- Explicación breve y educativa
- Historia, uso, tipos de cartas
- Objetivo: educar y generar confianza

**5. FAQ Section (opcional)**

- ¿Es gratis?
- ¿Qué incluye Premium?
- ¿Quién es Flavia?
- ¿Cómo funciona la IA?

#### Criterios de Aceptación

- [ ] Hero section con CTAs funcionales
- [ ] Sección de prueba sin registro visible
- [ ] Beneficios Premium listados claramente
- [ ] Sección educativa de tarot
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accesibilidad (a11y): navegación por teclado, aria-labels
- [ ] Performance: LCP < 2.5s
- [ ] SEO: meta tags, headings jerárquicos
- [ ] Links a /register y /login funcionan

#### Diseño

- Usar design tokens de DESIGN_HAND-OFF.md
- Componentes de shadcn/ui
- Imágenes optimizadas (WebP, lazy loading)
- Animaciones sutiles (framer-motion opcional)

---

### 📝 TASK-016: Crear componente UserDashboard (home para usuarios autenticados)

**Prioridad:** 🟡 P2 - MEDIO (Frontend)  
**Área:** Frontend - Pages/Components  
**Estimación:** 8-10 horas  
**Dependencias:** TASK-013, TASK-014  
**Feature:** F015  
**Branch sugerido:** `feat/user-dashboard`

#### Descripción

Crear dashboard personalizado que se mostrará en la home (`/`) para usuarios autenticados (FREE y PREMIUM). Objetivo: acceso rápido a funcionalidades y retención.

**⚠️ NOTA IMPORTANTE:** Esto es diferente a `/perfil` (que ya existe). El UserDashboard es la página principal después del login, mientras que `/perfil` es para configuración de cuenta.

#### Diferencia con `/perfil`

| Página            | Ruta              | Propósito                                | Estado                |
| ----------------- | ----------------- | ---------------------------------------- | --------------------- |
| **UserDashboard** | `/` (autenticado) | Quick actions, bienvenida, nueva lectura | ❌ A CREAR (TASK-016) |
| **Profile**       | `/perfil`         | Configuración cuenta, editar datos, plan | ✅ YA EXISTE          |

#### Archivos a Crear

- `frontend/src/components/features/dashboard/UserDashboard.tsx`
- `frontend/src/components/features/dashboard/WelcomeHeader.tsx`
- `frontend/src/components/features/dashboard/QuickActions.tsx`
- `frontend/src/components/features/dashboard/DidYouKnowSection.tsx`
- `frontend/src/components/features/dashboard/StatsSection.tsx` (solo Premium)
- `frontend/src/components/features/dashboard/UpgradeBanner.tsx` (solo Free)

#### Archivos a Modificar

- `frontend/src/app/page.tsx` - Lógica dual (ver TASK-017)

#### Secciones del Dashboard

**1. Welcome Header**

- Saludo personalizado: "¡Hola, {nombre}!"
- Badge de plan: "Free" o "Premium"
- Link discreto a configuración: "Ver perfil" → `/perfil`

**2. Quick Actions (Cards o Botones grandes)**

- **Primario:** "Nueva Lectura" → `/ritual/tirada`
- **Secundario:** "Historial de Lecturas" → `/historial`
- **Secundario:** "Carta del Día" → `/carta-del-dia`
- **Condicional (oculto en MVP):** "Explorar Tarotistas" → `/explorar`

**3. Did You Know Section**

- Tarjeta con dato curioso sobre tarot
- Rotativa (cambia cada visita o diariamente)
- Fuente de datos: array estático con ~10 facts
- Objetivo: educar y entretener (engagement)

**4. Stats Section (solo PREMIUM)**

- Total de lecturas realizadas este mes
- Categorías más consultadas (gráfico simple)
- Cartas más frecuentes
- Link a "Ver más estadísticas" → `/perfil` (tab Subscription)

**5. Upgrade Banner (solo FREE)**

- Título: "Desbloquea todo el potencial del Tarot"
- Lista breve de 3 beneficios Premium
- CTA: "Actualizar a Premium" → modal de upgrade
- Diseño no intrusivo (card elegante, no popup molesto)

**6. Recent Readings Preview (opcional)**

- Últimas 3 lecturas
- Card pequeña con: fecha, pregunta (truncada), tipo de spread
- Link a lectura completa: `/historial/{readingId}`

#### Criterios de Aceptación

- [ ] Dashboard se renderiza solo para usuarios autenticados
- [ ] Saludo personalizado con nombre del usuario
- [ ] Badge de plan visible y correcto
- [ ] Quick Actions funcionales y navigables
- [ ] "Did You Know" se muestra correctamente
- [ ] Stats solo visibles para Premium
- [ ] Upgrade banner solo visible para Free
- [ ] Responsive en todos los dispositivos
- [ ] Loading state mientras carga datos del usuario

#### Personalización por Plan

```typescript
const showStats = user.plan === "premium";
const showUpgradeBanner = user.plan !== "premium";
const dailyReadingsLeft = calculateReadingsLeft(user);
```

---

### 📝 TASK-017: Implementar HomePage con lógica dual (Landing + Dashboard)

**Prioridad:** 🟡 P2 - MEDIO (Frontend)  
**Área:** Frontend - Pages  
**Estimación:** 2 horas  
**Dependencias:** TASK-015, TASK-016  
**Feature:** F015  
**Branch sugerido:** `feat/home-page-dual`

#### Descripción

Actualizar la página principal (`/`) para que detecte si el usuario está autenticado y muestre:

- **LandingPage** (TASK-015) → Usuarios no autenticados
- **UserDashboard** (TASK-016) → Usuarios autenticados (FREE/PREMIUM)

**IMPORTANTE:** Actualmente `/` muestra un home genérico. Debemos reemplazarlo con lógica dual.

#### Archivos a Modificar

- `frontend/src/app/page.tsx` - **Reemplazar** contenido actual con lógica dual

**Archivo actual a modificar:**

```tsx
// frontend/src/app/page.tsx (estado actual)
export default function Home() {
  return (
    <div>
      <h1>Bienvenido a TarotFlavia</h1>
      {/* Contenido genérico actual */}
    </div>
  );
}
```

**Nuevo comportamiento:**

```tsx
export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return user ? <UserDashboard /> : <LandingPage />;
}
```

#### Lógica de la HomePage

1. **Obtener estado de autenticación** con `useAuth()` de Zustand
2. **Mostrar loading** mientras valida (evitar FOUC)
3. **Si autenticado** → renderizar `<UserDashboard />`
4. **Si no autenticado** → renderizar `<LandingPage />`
5. **Manejar errores** de autenticación

#### Implementación

**Prevención de FOUC (Flash Of Unauthed Content):**

- Usar loading state apropiado
- No renderizar contenido hasta confirmar auth
- Skeleton loader profesional
- Evitar parpadeo de componentes

**Performance:**

- Lazy load de componentes grandes:
  ```tsx
  const LandingPage = lazy(() => import("@/components/features/home/LandingPage"));
  const UserDashboard = lazy(() => import("@/components/features/dashboard/UserDashboard"));
  ```

**SEO Considerations:**

- Meta tags dinámicos según estado de auth
- OG tags apropiados para landing (compartir en redes)
- Canonical URL correcta

#### Criterios de Aceptación

- [ ] Usuario no autenticado ve LandingPage completa
- [ ] Usuario FREE autenticado ve UserDashboard
- [ ] Usuario PREMIUM autenticado ve UserDashboard (con stats)
- [ ] No hay FOUC (flash de contenido incorrecto)
- [ ] Loading state profesional mientras valida auth
- [ ] Error handling si falla validación de auth
- [ ] Funciona correctamente después de login (muestra dashboard)
- [ ] Funciona correctamente después de logout (muestra landing)
- [ ] SEO meta tags apropiados
- [ ] Performance: lazy loading de componentes
- [ ] Tests de integración pasando

#### Tests a Implementar

**1. Test: Usuario no autenticado → Landing**

```tsx
it("should show LandingPage for unauthenticated users", () => {
  mockUseAuth({ user: null, isLoading: false });
  render(<Home />);
  expect(screen.getByText(/Descubre tu destino/i)).toBeInTheDocument();
});
```

**2. Test: Usuario FREE → Dashboard**

```tsx
it("should show UserDashboard for FREE users", () => {
  mockUseAuth({ user: { plan: "free" }, isLoading: false });
  render(<Home />);
  expect(screen.getByText(/¡Hola/i)).toBeInTheDocument();
});
```

**3. Test: Loading state**

```tsx
it("should show loading while validating auth", () => {
  mockUseAuth({ user: null, isLoading: true });
  render(<Home />);
  expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
});
```

**4. Test: Navegación después de login**

```tsx
it("should switch to dashboard after login", async () => {
  const { rerender } = render(<Home />);
  mockUseAuth({ user: { plan: "free" }, isLoading: false });
  rerender(<Home />);
  expect(screen.getByText(/Nueva Lectura/i)).toBeInTheDocument();
});
```

#### Comandos de Testing

```bash
npm test -- page.test.tsx
npm run test:integration -- home-flow.test.tsx
```

#### Notas Adicionales

- 📍 Mantener ruta `/perfil` separada (configuración de cuenta)
- 📍 Dashboard es la home del usuario autenticado, NO es `/dashboard`
- 📍 No crear ruta `/dashboard`, todo en `/`
- 📍 Seguir convención Next.js de rutas

---

### 📝 TASK-018: Implementar sistema de CTAs de conversión (Funnels)

**Prioridad:** 🟢 P3 - BAJO (Frontend)  
**Área:** Frontend - Components/UX  
**Estimación:** 4-5 horas  
**Dependencias:** TASK-014, TASK-016  
**Feature:** F018  
**Branch sugerido:** `feat/conversion-funnels`

#### Descripción

Implementar CTAs (Call-to-Actions) estratégicos en diferentes puntos de la aplicación para convertir usuarios ANONYMOUS → FREE → PREMIUM.

#### Ubicaciones de CTAs

**1. Post-Tirada Anónima**

- Después de ver carta del día (ANONYMOUS)
- Modal suave: "¿Te gustó? Regístrate para guardar tu historial"
- Botones: "Registrarme" | "No, gracias"

**2. Post-Tirada FREE**

- Después de 2-3 lecturas FREE
- Banner: "Desbloquea interpretaciones profundas con IA"
- Mostrar ejemplo de interpretación Premium (blurred)
- CTA: "Probar Premium"

**3. En Resultado de Lectura FREE**

- Sección aspiracional después de cartas
- Título: "¿Quieres saber más?"
- Explicar qué incluye Premium
- CTA: "Ver Planes"

**4. En Historial FREE**

- Banner entre lecturas: "Desbloquea interpretaciones de tus lecturas anteriores"
- CTA: "Actualizar a Premium"

**5. Al Alcanzar Límite Diario**

- Modal: "Has usado tus 2 lecturas diarias"
- Opción 1: "Vuelve mañana"
- Opción 2: "Actualiza a Premium (3 lecturas/día + IA)"

#### Componentes a Crear

- `frontend/src/components/features/conversion/RegisterCTAModal.tsx`
- `frontend/src/components/features/conversion/UpgradeToPremiumBanner.tsx`
- `frontend/src/components/features/conversion/LimitReachedModal.tsx`
- `frontend/src/components/features/conversion/PremiumPreview.tsx`

#### Timing y Frecuencia

- No mostrar CTAs en cada acción (fatiga del usuario)
- Registro: Después de 1ra tirada anónima
- Upgrade: Después de 3 interacciones con límites
- Cookie para no repetir modal si usuario cerró 3 veces

#### Criterios de Aceptación

- [ ] CTA post-tirada anónima implementado
- [ ] CTA post-tirada FREE implementado
- [ ] Banner en historial FREE implementado
- [ ] Modal de límite alcanzado implementado
- [ ] CTAs no son intrusivos (pueden cerrarse)
- [ ] No se repiten si usuario ya rechazó 3 veces
- [ ] Tracking de clicks (Google Analytics o similar)
- [ ] Responsive y accesible

#### Tracking de Conversión

```typescript
// Ejemplo de tracking
trackEvent("cta_shown", { location: "post_reading", plan: "free" });
trackEvent("cta_clicked", { location: "post_reading", action: "upgrade" });
```

---

### 📝 TASK-019: Preparar integración de Google Ads (componentes placeholder)

**Prioridad:** ⚪ P4 - BAJA (Frontend)  
**Área:** Frontend - Components/Integration  
**Estimación:** 3-4 horas  
**Dependencias:** TASK-013, TASK-014  
**Feature:** F016  
**Branch sugerido:** `feat/google-ads-placeholders`

#### Descripción

Crear componentes placeholder para Google AdSense que se renderizarán solo para usuarios FREE y ANONYMOUS. Preparar estructura para futura activación de cuenta AdSense.

#### Archivos a Crear

- `frontend/src/components/features/ads/AdBanner.tsx`
- `frontend/src/components/features/ads/AdSidebar.tsx`
- `frontend/src/components/features/ads/useAdConsent.ts` (hook GDPR/CCPA)
- `frontend/src/lib/third-party/google-adsense.ts` (script loader)

#### Componente AdBanner

**Props:**

- `slot`: ID del ad slot (cuando se apruebe cuenta)
- `format`: 'horizontal' | 'vertical' | 'square'
- `className`: Para estilos custom

**Lógica:**

- Solo renderizar si `user.plan !== 'premium'`
- Mostrar placeholder por ahora (div con "Publicidad")
- Lazy loading (no cargar script hasta scroll)
- Error boundary si script de Google falla

#### Ubicaciones de Ads

**1. Resultado de Tirada FREE:**

- AdBanner después de mostrar cartas, antes del upsell
- Formato: horizontal, responsive

**2. Historial FREE:**

- AdBanner cada 5 lecturas
- Formato: horizontal

**3. Dashboard FREE:**

- AdSidebar en desktop (lateral)
- AdBanner en mobile (inferior)

**4. Página Compartida Pública:**

- AdBanner al final de lectura compartida
- Monetización de tráfico viral

#### Preparación GDPR/CCPA

**Consent Management:**

- Hook `useAdConsent()` para verificar consentimiento
- Solo cargar Google Ads si usuario consintió cookies
- Integrar con cookie banner (si existe)
- Guardar preferencia en localStorage

#### Criterios de Aceptación

- [ ] Componente AdBanner creado y exportado
- [ ] Solo se renderiza para FREE y ANONYMOUS
- [ ] NO se renderiza para PREMIUM
- [ ] Placeholder visible (div con "Publicidad" o similar)
- [ ] Lazy loading implementado
- [ ] Consent check implementado
- [ ] Responsive en todos los tamaños
- [ ] Claramente identificado como "Publicidad"
- [ ] Script de Google AdSense preparado (comentado hasta aprobación)

#### Configuración Futura

Cuando se apruebe cuenta Google AdSense:

1. Descomentar script loader
2. Agregar `data-ad-client` con ID de cliente
3. Configurar ad slots por ubicación
4. Activar en producción
5. Monitorear impresiones y earnings

#### Notas

- Máximo 2 ad units por página (política de Google)
- No ads en flujo de ritual (no interrumpir experiencia)
- Categorías permitidas: Espiritualidad, Bienestar, Autoayuda
- Categorías bloqueadas: Gambling, adulto

---

## 📊 Resumen Final del Backlog

### Total de Tareas

| Sprint                     | Backend       | Frontend     | Total  | Estimación |
| -------------------------- | ------------- | ------------ | ------ | ---------- |
| Sprint 1 (Crítico)         | 8 tareas      | 0 tareas     | 8      | 16-18h     |
| Sprint 2 (Validaciones)    | 4 tareas      | 2 tareas     | 6      | 12-14h     |
| Sprint 3 (UX/Monetización) | 0 tareas      | 5 tareas     | 5      | 29-34h     |
| **TOTAL**                  | **12 tareas** | **7 tareas** | **19** | **57-66h** |

### Distribución por Prioridad

| Prioridad        | Tareas | IDs                          | Estimación |
| ---------------- | ------ | ---------------------------- | ---------- |
| 🔴 P0 - CRÍTICO  | 8      | TASK-001 a TASK-008          | 16-18h     |
| 🟠 P1 - ALTO     | 5      | TASK-009, 010, 013, 014      | 8-9h       |
| 🟡 P2 - MEDIO    | 5      | TASK-011, 012, 015, 016, 017 | 22-26h     |
| 🟢 P3 - BAJO     | 1      | TASK-018                     | 4-5h       |
| ⚪ P4 - MUY BAJO | 0      | -                            | 0h         |

### Orden Recomendado de Desarrollo

#### Semana 1-2: Sprint 1 (Backend Crítico)

```
BACKEND:
1. TASK-001 → Renombrar enum UserPlan (2h)
2. TASK-002 → Migración DB planes (3h)
3. TASK-003 → Actualizar seeder (1.5h)
4. TASK-004 → Guard RequiresPremiumForAI (2h)
5. TASK-005 → Default generateInterpretation false (0.5h)
6. TASK-006 → Actualizar usage limits constants (1h)
7. TASK-007 → Cron job reset diario (4h)
8. TASK-008 → Validación límites diarios (2.5h)

CHECKPOINT: Deploy a staging, validar ahorro de costos
```

#### Semana 3: Sprint 2 (Validaciones + Frontend Types)

```
BACKEND:
9. TASK-009 → Guard custom questions (1h)
10. TASK-010 → Actualizar reading-validator (1.5h)
11. TASK-011 → Verificar contenido cartas (3-4h)
12. TASK-012 → Endpoints categorías/preguntas (2h)

FRONTEND:
13. TASK-013 → Actualizar tipos frontend (2h)
14. TASK-014 → UI condicional por plan (3h)

CHECKPOINT: Testing E2E de validaciones
```

#### Semana 4-5: Sprint 3 (Frontend UX)

```
FRONTEND:
15. TASK-015 → LandingPage component (8-10h)
16. TASK-016 → UserDashboard component (8-10h)
17. TASK-017 → HomePage dual logic (2h)
18. TASK-018 → Sistema de CTAs conversión (4-5h)
19. TASK-019 → Google Ads placeholders (3-4h)

CHECKPOINT: UAT con usuarios reales
```

### Tareas Bloqueantes (No Paralelizables)

- TASK-002 requiere TASK-001 completada
- TASK-003 requiere TASK-001 y TASK-002
- TASK-013 requiere TASK-001, TASK-002, TASK-005
- TASK-014 requiere TASK-013
- TASK-016 requiere TASK-013, TASK-014
- TASK-017 requiere TASK-015 y TASK-016

### Tareas Paralelizables

**Pueden hacerse en paralelo:**

- TASK-004, 005, 006 (después de TASK-001)
- TASK-009, 010, 011, 012 (cualquier momento Sprint 2)
- TASK-015 y backend de Sprint 2 (en paralelo)

### Riesgos y Mitigaciones

| Riesgo                         | Probabilidad | Impacto | Mitigación                                                 |
| ------------------------------ | ------------ | ------- | ---------------------------------------------------------- |
| Migración DB rompe producción  | Media        | Alto    | Backup completo, test exhaustivo en staging, rollback plan |
| Usuarios professional en prod  | Baja         | Medio   | Query de verificación antes de migrar, comunicar cambios   |
| Frontend no actualiza tipos    | Media        | Alto    | Strict TypeScript, CI/CD con type check                    |
| Contenido de cartas incompleto | Alta         | Medio   | Priorizar TASK-011, considerar copywriter                  |
| Cron job no ejecuta            | Media        | Alto    | Monitoring con alertas, tests de integración               |
| Ads no aprobados por Google    | Media        | Bajo    | Diseño placeholder permite activar después                 |

### Métricas de Éxito

**Sprint 1 (Costos):**

- ✅ FREE con 0 llamadas a IA
- ✅ ANONYMOUS con 0 llamadas a IA
- ✅ Ahorro de ~$100 USD/mes por 1,000 usuarios FREE

**Sprint 2 (Calidad):**

- ✅ 0 bugs de validación de planes
- ✅ 100% de cartas con contenido completo
- ✅ Tests E2E de validaciones pasando

**Sprint 3 (Conversión):**

- 📊 Tasa de conversión ANONYMOUS → FREE > 15%
- 📊 Tasa de conversión FREE → PREMIUM > 5%
- 📊 Bounce rate de landing < 60%
- 📊 CTR de CTAs de upgrade > 10%

---

## 📝 Notas para Desarrollo

### Convenciones de Branches

```
feat/nombre-feature      # Nueva funcionalidad
fix/nombre-bug           # Corrección de bug
refactor/nombre          # Refactorización sin cambio funcional
chore/nombre             # Tareas de mantenimiento
migration/nombre         # Migraciones de DB
content/nombre           # Cambios de contenido
```

### Commits Semánticos

```
feat: descripción corta
fix: descripción corta
refactor: descripción corta
chore: descripción corta
test: descripción corta
docs: descripción corta
```

### Testing Requirements

- **Backend:** Coverage mínimo 80% en nuevos archivos
- **Frontend:** Tests de componentes críticos (Landing, Dashboard)
- **E2E:** Flujos completos de conversión
- **Integration:** Todos los guards y validaciones

### Deployment Strategy

1. **Sprint 1:** Deploy a staging → validar ahorro → deploy a prod
2. **Sprint 2:** Deploy incremental (una tarea a la vez)
3. **Sprint 3:** Feature flags para Landing (A/B testing)

### Comunicación con Stakeholders

- Actualización semanal de progreso
- Demo al final de cada sprint
- Métricas de ahorro de costos después de Sprint 1
- UAT con usuarios después de Sprint 3

---

**Documento Creado:** 18 Diciembre 2025  
**Última Actualización:** 18 Diciembre 2025  
**Versión:** 1.0  
**Total de Tareas:** 19  
**Tiempo Estimado:** 57-66 horas (aprox. 5-6 semanas)  
**Autor:** GitHub Copilot

### 📝 TASK-001: Migrar Enum de Planes (GUEST → ANONYMOUS)

**Prioridad:** 🔴 P0 - CRÍTICO  
**Estimación:** 2 horas  
**Módulo:** Backend - User Entity  
**Feature:** F001

#### Descripción

Renombrar plan `GUEST` a `ANONYMOUS` siguiendo convenciones de industria y eliminar plan `PROFESSIONAL`.

#### Archivos a Modificar

**1. User Entity**

```
📁 backend/tarot-app/src/modules/users/entities/user.entity.ts
```

**Cambios:**

```typescript
// ANTES
export enum UserPlan {
  GUEST = "guest",
  FREE = "free",
  PREMIUM = "premium",
  PROFESSIONAL = "professional",
}

// DESPUÉS
export enum UserPlan {
  ANONYMOUS = "anonymous", // Renombrado de GUEST
  FREE = "free",
  PREMIUM = "premium",
  // PROFESSIONAL eliminado
}
```

**2. Actualizar todas las importaciones**
Buscar y reemplazar en todo el backend:

- `UserPlan.GUEST` → `UserPlan.ANONYMOUS`
- `UserPlan.PROFESSIONAL` → Eliminar o migrar a `UserPlan.PREMIUM`

#### Tests Afectados

- `user.entity.spec.ts`
- `plans.seeder.spec.ts`
- Cualquier test que use `UserPlan.GUEST` o `UserPlan.PROFESSIONAL`

#### Definition of Done

- [ ] Enum actualizado con `ANONYMOUS` en lugar de `GUEST`
- [ ] `PROFESSIONAL` eliminado del enum
- [ ] Todas las referencias actualizadas en backend
- [ ] Tests actualizados y pasando
- [ ] No hay errores de compilación TypeScript

#### Comandos de Verificación

```bash
# Buscar referencias a planes viejos
cd backend/tarot-app
grep -r "GUEST\|PROFESSIONAL" src/ --exclude-dir=node_modules

# Ejecutar tests
npm test -- user.entity
```

---

### 📝 TASK-002: Migración de Base de Datos - Eliminar PROFESSIONAL

**Prioridad:** 🔴 P0 - CRÍTICO  
**Estimación:** 3 horas  
**Módulo:** Backend - Database Migrations  
**Feature:** F001  
**Dependencias:** TASK-001

#### Descripción

Crear migración de TypeORM para actualizar enum de PostgreSQL, renombrar `guest` a `anonymous`, eliminar `professional`, y migrar usuarios existentes.

#### Archivo a Crear

```
📁 backend/tarot-app/src/database/migrations/TIMESTAMP-RenamePlansAndRemoveProfessional.ts
```

#### Código de Migración

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePlansAndRemoveProfessional1734567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Migrar usuarios PROFESSIONAL a PREMIUM
    await queryRunner.query(`
      UPDATE "user" 
      SET plan = 'premium' 
      WHERE plan = 'professional'
    `);

    // 2. Eliminar plan PROFESSIONAL de tabla plans
    await queryRunner.query(`
      DELETE FROM "plans" 
      WHERE "planType" = 'professional'
    `);

    // 3. Actualizar usuarios GUEST a ANONYMOUS
    await queryRunner.query(`
      UPDATE "user" 
      SET plan = 'anonymous' 
      WHERE plan = 'guest'
    `);

    // 4. Actualizar plan GUEST en tabla plans
    await queryRunner.query(`
      UPDATE "plans" 
      SET "planType" = 'anonymous' 
      WHERE "planType" = 'guest'
    `);

    // 5. Recrear enum sin 'professional' y con 'anonymous'
    await queryRunner.query(`
      ALTER TYPE "user_plan_enum" RENAME TO "user_plan_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "user_plan_enum" AS ENUM('anonymous', 'free', 'premium')
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "plan" TYPE "user_plan_enum" 
      USING "plan"::text::"user_plan_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "user_plan_enum_old"
    `);

    // 6. Recrear enum para tabla plans
    await queryRunner.query(`
      ALTER TYPE "plans_plantype_enum" RENAME TO "plans_plantype_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "plans_plantype_enum" AS ENUM('anonymous', 'free', 'premium')
    `);

    await queryRunner.query(`
      ALTER TABLE "plans" 
      ALTER COLUMN "planType" TYPE "plans_plantype_enum" 
      USING "planType"::text::"plans_plantype_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "plans_plantype_enum_old"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Recrear enums viejos
    await queryRunner.query(`
      ALTER TYPE "user_plan_enum" RENAME TO "user_plan_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "user_plan_enum" AS ENUM('guest', 'free', 'premium', 'professional')
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "plan" TYPE "user_plan_enum" 
      USING "plan"::text::"user_plan_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "user_plan_enum_old"
    `);

    // Revertir cambios en usuarios
    await queryRunner.query(`
      UPDATE "user" SET plan = 'guest' WHERE plan = 'anonymous'
    `);

    // Similar para plans_plantype_enum...
  }
}
```

#### Pre-requisitos

- [ ] Backup de base de datos de producción
- [ ] Verificar cuántos usuarios tienen plan `professional`
- [ ] Comunicar cambios a usuarios afectados

#### Comandos de Ejecución

```bash
# Generar migración
npm run migration:generate -- RenamePlansAndRemoveProfessional

# Ejecutar migración en desarrollo
npm run migration:run

# Verificar en DB
psql -d tarot_dev -c "SELECT plan, COUNT(*) FROM \"user\" GROUP BY plan;"
psql -d tarot_dev -c "SELECT * FROM pg_enum WHERE enumtypid = 'user_plan_enum'::regtype;"
```

#### Definition of Done

- [ ] Migración creada y testeada en local
- [ ] Usuarios `professional` migrados a `premium`
- [ ] Usuarios `guest` renombrados a `anonymous`
- [ ] Plan `professional` eliminado de tabla `plans`
- [ ] Enums de PostgreSQL actualizados
- [ ] Rollback funciona correctamente
- [ ] Backup de producción disponible
- [ ] Documentación de migración completa

#### Riesgos

- ⚠️ Usuarios professional pueden perder acceso si hay lógica específica
- ⚠️ Enum de PostgreSQL no se puede modificar directamente (requiere recreación)
- ⚠️ Downtime mínimo durante migración en producción

---
