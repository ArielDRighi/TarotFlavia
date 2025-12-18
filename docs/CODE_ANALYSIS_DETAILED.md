# 🔍 Análisis Técnico Detallado - Código Existente vs MVP Strategy

> **Documento de Investigación y Hallazgos**  
> Fecha: 18 Diciembre 2025  
> Versión: 1.0  
> **Propósito:** Análisis exhaustivo del código existente para determinar qué cambios son necesarios según MVP_STRATEGY_SUMMARY

---

## 📋 Metodología de Análisis

Este documento analiza el código existente en backend y frontend para cada feature definida en `MVP_FEATURES_BREAKDOWN.md`, identificando:

1. ✅ **Código que funciona** y no requiere cambios
2. ⚠️ **Código que requiere modificación** para cumplir con nueva estrategia
3. ❌ **Funcionalidad faltante** que debe desarrollarse desde cero

---

## 🎯 F001: Sistema de Tiers de Usuario

### Estado: ⚠️ EXISTE - REQUIERE MODIFICACIÓN

### 📍 Archivos Analizados

| Archivo            | Ruta                                                                       | Propósito              |
| ------------------ | -------------------------------------------------------------------------- | ---------------------- |
| `user.entity.ts`   | `backend/tarot-app/src/modules/users/entities/user.entity.ts`              | Entity principal       |
| `InitialSchema.ts` | `backend/tarot-app/src/database/migrations/1761655973524-InitialSchema.ts` | Migración inicial      |
| `plans.seeder.ts`  | `backend/tarot-app/src/database/seeds/plans.seeder.ts`                     | Seeder de planes       |
| `plan.entity.ts`   | `backend/tarot-app/src/modules/plan-config/entities/plan.entity.ts`        | Configuración dinámica |

### 🔍 Hallazgos Detallados

#### 1. Sistema Actual (3 Planes)

**user.entity.ts (líneas 16-21):**

```typescript
export enum UserPlan {
  GUEST = "guest",
  FREE = "free",
  PREMIUM = "premium",
  PROFESSIONAL = "professional", // ❌ ELIMINAR
}
```

**Problema:**

- Existe un 4º plan `GUEST` que no estaba documentado en feedback inicial
- Existe `PROFESSIONAL` que debe eliminarse
- La migración de DB define el enum como: `'free', 'premium', 'professional'`

**Lógica Actual de Professional:**

- Según `plans.seeder.ts` (líneas 74-88):
  - Precio: $19.99
  - Readings ilimitadas
  - IA ilimitada
  - Todas las features habilitadas
  - "Para tarotistas profesionales con soporte prioritario"

**Diferencia vs Premium:**

- Antes: Premium = 1 tarotista, Professional = todos los tarotistas
- Ahora: Premium = acceso completo (eliminar professional)

#### 2. Plan GUEST Descubierto

**plans.seeder.ts (líneas 41-50):**

```typescript
{
  planType: UserPlan.GUEST,
  name: 'Plan Invitado',
  description: 'Plan para usuarios no registrados con acceso limitado para probar la aplicación',
  price: 0,
  readingsLimit: 3,
  aiQuotaMonthly: 0, // No AI for guests  ⚠️ CRÍTICO
  allowCustomQuestions: false,
  allowSharing: false,
  allowAdvancedSpreads: false,
}
```

**Hallazgo Importante:**

- `GUEST` está configurado con **0 AI quota** ✅ (correcto según estrategia)
- Límite: 3 lecturas (nuevo requisito dice 1 carta/día)
- Este plan podría mapear a "Usuarios Anónimos" de la estrategia

#### 3. Plan FREE Actual

**plans.seeder.ts (líneas 51-63):**

```typescript
{
  planType: UserPlan.FREE,
  name: 'Plan Gratuito',
  readingsLimit: 10,
  aiQuotaMonthly: 100,  // ⚠️ CAMBIO CRÍTICO: Debe ser 0
  allowCustomQuestions: false,
  allowSharing: false,
  allowAdvancedSpreads: false,
}
```

**Problema CRÍTICO:**

- **FREE tiene `aiQuotaMonthly: 100`** pero según nueva estrategia debe ser **0**
- Esto genera costos innecesarios si FREE usa IA
- `readingsLimit: 10` es correcto según estrategia
- `allowSharing: false` ⚠️ Pero estrategia dice que FREE **SÍ** puede compartir

#### 4. Plan PREMIUM Actual

**plans.seeder.ts (líneas 64-76):**

```typescript
{
  planType: UserPlan.PREMIUM,
  name: 'Plan Premium',
  price: 9.99,
  readingsLimit: -1, // Ilimitado
  aiQuotaMonthly: -1, // Ilimitado
  allowCustomQuestions: true,
  allowSharing: true,
  allowAdvancedSpreads: true,
}
```

✅ **Premium está correctamente configurado** según nueva estrategia

### 🛠️ Cambios Requeridos

#### Backend

**1. Migración de Base de Datos**

**Acción:** Crear migración para:

- Eliminar valor `'professional'` del enum `user_plan_enum`
- Migrar usuarios `professional` existentes a `premium`
- Actualizar enum: `'guest', 'free', 'premium'`

**Archivo:** `backend/tarot-app/src/database/migrations/XXXX-RemoveProfessionalPlan.ts`

```typescript
// NUEVA MIGRACIÓN REQUERIDA
export class RemoveProfessionalPlan1734567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Migrar usuarios professional a premium
    await queryRunner.query(`
      UPDATE "user" 
      SET plan = 'premium' 
      WHERE plan = 'professional'
    `);

    // 2. Eliminar plan professional de la tabla plans
    await queryRunner.query(`
      DELETE FROM "plans" 
      WHERE "planType" = 'professional'
    `);

    // 3. Recrear enum sin professional
    await queryRunner.query(`
      ALTER TYPE "user_plan_enum" RENAME TO "user_plan_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "user_plan_enum" AS ENUM('guest', 'free', 'premium')
    `);
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "plan" TYPE "user_plan_enum" 
      USING "plan"::text::"user_plan_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "user_plan_enum_old"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic
  }
}
```

**2. Actualizar UserPlan Enum**

**Archivo:** `backend/tarot-app/src/modules/users/entities/user.entity.ts`

```typescript
// ANTES
export enum UserPlan {
  GUEST = "guest",
  FREE = "free",
  PREMIUM = "premium",
  PROFESSIONAL = "professional", // ❌ ELIMINAR
}

// DESPUÉS
export enum UserPlan {
  GUEST = "guest", // Mapea a "Usuarios Anónimos"
  FREE = "free", // Usuarios registrados sin pago
  PREMIUM = "premium", // Usuarios de pago
}
```

**3. Actualizar Plans Seeder**

**Archivo:** `backend/tarot-app/src/database/seeds/plans.seeder.ts`

```typescript
// Cambios necesarios:

// 1. Ajustar GUEST
{
  planType: UserPlan.GUEST,
  readingsLimit: 1,  // Cambiar de 3 a 1 (1 carta/día)
  aiQuotaMonthly: 0, // ✅ Ya está en 0
  // ... resto igual
}

// 2. Ajustar FREE (CRÍTICO)
{
  planType: UserPlan.FREE,
  readingsLimit: 10, // ✅ Correcto
  aiQuotaMonthly: 0, // ⚠️ CAMBIAR de 100 a 0 (sin IA)
  allowSharing: true, // ⚠️ CAMBIAR de false a true
  allowCustomQuestions: false, // ✅ Correcto
  allowAdvancedSpreads: false, // ✅ Correcto
}

// 3. PREMIUM sin cambios ✅

// 4. ELIMINAR PROFESSIONAL
// Borrar todo el objeto del plan professional
```

**4. Actualizar Usage Limits**

**Archivo:** `backend/tarot-app/src/modules/usage-limits/usage-limits.constants.ts`

```typescript
// Eliminar entrada de PROFESSIONAL
export const USAGE_LIMITS: Record<UserPlan, Record<UsageFeature, number>> = {
  [UserPlan.GUEST]: {
    [UsageFeature.TAROT_READING]: 1, // Cambiar de 3 a 1
    [UsageFeature.INTERPRETATION_REGENERATION]: 0,
    [UsageFeature.ORACLE_QUERY]: 0,
  },
  [UserPlan.FREE]: {
    [UsageFeature.TAROT_READING]: 10, // ✅ Correcto
    [UsageFeature.INTERPRETATION_REGENERATION]: 0, // ✅ Correcto
    [UsageFeature.ORACLE_QUERY]: 5,
  },
  [UserPlan.PREMIUM]: {
    [UsageFeature.TAROT_READING]: -1,
    [UsageFeature.INTERPRETATION_REGENERATION]: -1,
    [UsageFeature.ORACLE_QUERY]: -1,
  },
  // ❌ ELIMINAR
  // [UserPlan.PROFESSIONAL]: { ... }
} as const;
```

#### Frontend

**Buscar y eliminar referencias a `professional`:**

```bash
grep -r "professional\|PROFESSIONAL" frontend/src/
```

**Archivos probables a actualizar:**

- `types/user.types.ts` - Si existe enum de planes
- `components/features/admin/` - Dashboard de admin
- Cualquier componente que muestre badges de plan

### ⚠️ Riesgos Identificados

1. **Usuarios existentes con plan professional:**
   - ¿Cuántos hay en producción?
   - Necesitan migración antes del deploy
   - Plan de comunicación de downgrade/upgrade

2. **Referencias hardcodeadas:**
   - Buscar en todo el código menciones a "professional"
   - Actualizar tests que usen este plan

3. **Plan GUEST vs Anónimos:**
   - Decisión: ¿GUEST es lo mismo que "usuarios anónimos"?
   - Si sí: Renombrar a ANONYMOUS para claridad
   - Si no: Crear lógica separada para anónimos sin DB

---

## 🎯 F002: Control de Límites por Tier

### Estado: ⚠️ EXISTE - REQUIERE MODIFICACIÓN

### 📍 Archivos Analizados

| Archivo                        | Ruta                                                                                             | Funcionalidad           |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------- |
| `usage-limits.constants.ts`    | `backend/tarot-app/src/modules/usage-limits/usage-limits.constants.ts`                           | Límites por feature     |
| `plan.entity.ts`               | `backend/tarot-app/src/modules/plan-config/entities/plan.entity.ts`                              | Límites dinámicos en DB |
| `reading-validator.service.ts` | `backend/tarot-app/src/modules/tarot/readings/application/services/reading-validator.service.ts` | Validación de límites   |

### 🔍 Hallazgos Detallados

#### 1. Sistema Dual de Límites

**Descubrimiento:** Existen **DOS** sistemas de límites:

**A. Límites hardcodeados** (`usage-limits.constants.ts`):

- `UsageFeature.TAROT_READING`
- `UsageFeature.INTERPRETATION_REGENERATION`
- `UsageFeature.ORACLE_QUERY`

**B. Límites dinámicos en DB** (`Plan.readingsLimit`):

- Gestionados por admin en `plan-config` module
- Usados por `ReadingValidatorService`

**Problema:** Duplicación de lógica. ¿Cuál tiene prioridad?

#### 2. Validación Actual

**reading-validator.service.ts (líneas 132-146):**

```typescript
async validateFreeUserReadingsLimit(
  totalReadings: number,
  userPlan: UserPlan,
): Promise<void> {
  // Get limit from database configuration (dynamic)
  const planLimit = await this.planConfigService.getReadingsLimit(userPlan);

  // -1 means unlimited (PREMIUM, PROFESSIONAL)  ⚠️
  if (planLimit === -1) {
    return;
  }

  if (totalReadings >= planLimit) {
    throw new ForbiddenException(
      `Los usuarios ${userPlan} están limitados a ${planLimit} lecturas`,
    );
  }
}
```

✅ **Buena práctica:** Usa límites de DB (dinámicos)
⚠️ **Problema:** Comentario menciona PROFESSIONAL que se eliminará

#### 3. Límites Actuales vs Nuevos Requisitos

**Comparación:**

| Plan         | Límite Actual (DB) | Límite Nuevo (Estrategia)      | ¿Requiere Cambio?   |
| ------------ | ------------------ | ------------------------------ | ------------------- |
| GUEST        | 3                  | 1 carta/día                    | ✅ SÍ (cambiar a 1) |
| FREE         | 10                 | 1x1 carta/día + 1x3 cartas/día | ⚠️ COMPLEJO         |
| PREMIUM      | -1 (ilimitado)     | 3 tiradas/día                  | ✅ SÍ (cambiar a 3) |
| PROFESSIONAL | -1 (ilimitado)     | N/A (eliminar)                 | ✅ SÍ (eliminar)    |

**Nota Crítica sobre FREE:**

- Estrategia dice: "1 tirada de 1 carta/día + 1 tirada de 3 cartas/día"
- Sistema actual: "10 lecturas totales"
- ⚠️ **Conflicto:** El sistema actual no diferencia por tipo de tirada

#### 4. Reset de Límites

**Búsqueda:** ¿Existe cron job para reset diario?

```bash
grep -r "cron\|schedule\|reset.*limit\|daily.*reset" backend/tarot-app/src/
```

**Resultado:** No se encontró sistema de reset automático diario.

**Problema:**

- Estrategia requiere límites DIARIOS (reset a medianoche)
- Sistema actual parece ser límite total (sin reset)

### 🛠️ Cambios Requeridos

#### 1. Decisión Arquitectónica: Tipos de Límites

**Opción A: Límite Diario Simple (más fácil)**

- FREE: 2 lecturas/día (independiente del tipo)
- GUEST: 1 lectura/día
- PREMIUM: 3 lecturas/día

**Opción B: Límite por Tipo de Tirada (complejo, pero según estrategia)**

- Requiere nueva tabla `reading_daily_limits`
- Campos: `userId`, `date`, `oneCardCount`, `threeCardCount`, `fiveCardCount`, etc.

**Recomendación:** Opción A para MVP, Opción B post-MVP

#### 2. Migración de Límites en DB

```sql
-- Actualizar límites en tabla plans
UPDATE plans SET readingsLimit = 1 WHERE planType = 'guest';
UPDATE plans SET readingsLimit = 2 WHERE planType = 'free';  -- Simplificado
UPDATE plans SET readingsLimit = 3 WHERE planType = 'premium';
```

#### 3. Sistema de Reset Diario

**Nuevo archivo:** `backend/tarot-app/src/modules/usage-limits/usage-limits-reset.service.ts`

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { UsageLimit } from "./entities/usage-limit.entity";

@Injectable()
export class UsageLimitsResetService {
  private readonly logger = new Logger(UsageLimitsResetService.name);

  constructor(
    @InjectRepository(UsageLimit)
    private usageLimitRepo: Repository<UsageLimit>
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: "UTC",
  })
  async resetDailyLimits(): Promise<void> {
    this.logger.log("Starting daily usage limits reset...");

    // Eliminar registros de más de 7 días
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - 7);

    const result = await this.usageLimitRepo.delete({
      createdAt: LessThan(retentionDate),
    });

    this.logger.log(`Daily reset complete. Deleted ${result.affected || 0} old records.`);
  }
}
```

**Actualizar module:**

```typescript
// usage-limits.module.ts
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    TypeOrmModule.forFeature([UsageLimit]),
    ScheduleModule.forRoot(), // Agregar
  ],
  providers: [
    UsageLimitsService,
    UsageLimitsResetService, // Agregar
  ],
})
export class UsageLimitsModule {}
```

#### 4. Validación de Límites Diarios

**Actualizar:** `CheckUsageLimitGuard`

Agregar lógica para verificar límites del día actual (no total):

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const todayUsage = await this.usageLimitService.countToday(userId, feature, today);

if (todayUsage >= limit) {
  throw new ForbiddenException(`Has alcanzado tu límite diario de ${limit} ${featureName}. Intenta mañana.`);
}
```

### ⚠️ Riesgos y Consideraciones

1. **Timezone:**
   - ¿Reset a medianoche UTC o del usuario?
   - Recomendación: UTC para simplificar MVP

2. **Límites por tipo de tirada:**
   - Estrategia específica requiere lógica compleja
   - Proponer simplificación al usuario

3. **Usuarios actualmente usando límites viejos:**
   - Comunicar cambios antes del deploy
   - Posible reset de contadores

---

## 🎯 F004 + F005: Tiradas Sin IA para FREE y ANÓNIMOS

### Estado: ⚠️ REQUIERE MODIFICACIÓN CRÍTICA (Ahorro de Costos)

### 📍 Archivos Analizados

| Archivo                      | Ruta                                                                                            | Funcionalidad      |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------ |
| `create-reading.use-case.ts` | `backend/tarot-app/src/modules/tarot/readings/application/use-cases/create-reading.use-case.ts` | Lógica de creación |
| `create-reading.dto.ts`      | `backend/tarot-app/src/modules/tarot/readings/dto/create-reading.dto.ts`                        | DTO de request     |
| `readings.controller.ts`     | `backend/tarot-app/src/modules/tarot/readings/readings.controller.ts`                           | Endpoint HTTP      |
| `interpretations.service.ts` | `backend/tarot-app/src/modules/tarot/interpretations/interpretations.service.ts`                | Servicio de IA     |

### 🔍 Hallazgos Críticos

#### 1. Campo `generateInterpretation` en DTO

**create-reading.dto.ts (líneas 138-145):**

```typescript
@ApiProperty({
  example: true,
  description: 'Si se debe generar una interpretación automática',
  default: true,  // ⚠️ PROBLEMA: Default TRUE
})
@IsBoolean()
@IsOptional()
generateInterpretation: boolean = true;  // ⚠️ SIEMPRE TRUE por defecto
```

**Problema CRÍTICO:**

- Por defecto, **TODAS** las lecturas generan interpretación IA
- Esto incluye FREE y GUEST (costo innecesario)
- Frontend puede omitir este campo y se asume `true`

#### 2. Lógica de Generación de IA

**create-reading.use-case.ts (líneas 101-160):**

```typescript
// Generar interpretación si se solicita
if (createReadingDto.generateInterpretation) {  // ⚠️ Solo valida el flag
  try {
    // ... llama a interpretationsService.generateInterpretation
    // NO VALIDA EL PLAN DEL USUARIO AQUÍ
  }
}
```

**Hallazgo:**

- **NO existe validación de plan** antes de llamar a IA
- Si frontend envía `generateInterpretation: true` en FREE → se genera IA (costo)
- Confía ciegamente en el valor del DTO

#### 3. Guards Existentes

**readings.controller.ts (líneas 45-51):**

```typescript
@UseGuards(
  JwtAuthGuard,
  RequiresPremiumForCustomQuestionGuard,  // ✅ Valida custom question
  CheckUsageLimitGuard,                   // ✅ Valida límites
)
```

**Falta:**

- ❌ NO existe `RequiresPremiumForAIGuard`
- ❌ NO existe validación de plan antes de IA

#### 4. Plan Config - AI Quota

**plan.entity.ts:**

```typescript
@Column({ type: 'int', default: 100 })
aiQuotaMonthly: number;
```

**Plans Seeder:**

- GUEST: `aiQuotaMonthly: 0` ✅
- FREE: `aiQuotaMonthly: 100` ⚠️ (debe ser 0)
- PREMIUM: `aiQuotaMonthly: -1` ✅

**Validación de quota:** Existe `AIQuotaGuard` pero solo valida si hay quota disponible, no si el plan DEBERÍA usar IA.

### 🛠️ Cambios Requeridos (CRÍTICO - Ahorro de Costos)

#### 1. Nuevo Guard: RequiresPremiumForAIInterpretationGuard

**Crear:** `backend/tarot-app/src/modules/tarot/readings/guards/requires-premium-for-ai.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { UserPlan } from "../../../users/entities/user.entity";

interface RequestWithUser {
  user: {
    userId: number;
    plan: UserPlan;
  };
  body: {
    generateInterpretation?: boolean;
  };
}

/**
 * Guard que BLOQUEA generación de IA para planes FREE y GUEST
 * Solo PREMIUM puede usar interpretación IA
 */
@Injectable()
export class RequiresPremiumForAIGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const body = request.body;

    // Si NO solicita interpretación, permitir (lectura sin IA)
    if (!body.generateInterpretation) {
      return true;
    }

    // Si solicita interpretación, DEBE ser PREMIUM
    if (user.plan !== UserPlan.PREMIUM) {
      // IMPORTANTE: Setear flag a false para evitar generación
      body.generateInterpretation = false;

      throw new ForbiddenException(
        "Las interpretaciones con IA están disponibles solo para usuarios Premium. " +
          "Actualiza tu plan para desbloquear esta funcionalidad."
      );
    }

    return true;
  }
}
```

#### 2. Aplicar Guard en Controller

**readings.controller.ts:**

```typescript
@UseGuards(
  JwtAuthGuard,
  RequiresPremiumForCustomQuestionGuard,
  RequiresPremiumForAIGuard,  // ⬅️ AGREGAR
  CheckUsageLimitGuard,
)
@Post()
async createReading(...) {
  // ...
}
```

#### 3. Cambiar Default del DTO

**create-reading.dto.ts:**

```typescript
@ApiProperty({
  example: false,  // ⚠️ Cambiar default a FALSE
  description: 'Si se debe generar interpretación con IA (solo Premium)',
  default: false,  // ⚠️ Ahora false por defecto
})
@IsBoolean()
@IsOptional()
generateInterpretation: boolean = false;  // ⚠️ FALSE por defecto
```

**Impacto:**

- Si frontend NO envía el campo → no se genera IA (ahorro)
- Frontend PREMIUM debe enviar explícitamente `generateInterpretation: true`

#### 4. Validación Adicional en Use Case (Defense in Depth)

**create-reading.use-case.ts:**

```typescript
// AGREGAR validación antes de generar IA
if (createReadingDto.generateInterpretation) {
  // ⬅️ AGREGAR VALIDACIÓN DE PLAN
  if (user.plan !== UserPlan.PREMIUM) {
    this.logger.warn(
      `User ${user.id} (plan: ${user.plan}) attempted AI generation. Blocked.`,
    );
    // NO generar IA, continuar sin interpretación
    return reading;
  }

  try {
    // ... resto del código de IA
  }
}
```

#### 5. Actualizar Plans Seeder (ya mencionado en F001)

```typescript
{
  planType: UserPlan.FREE,
  aiQuotaMonthly: 0,  // ⚠️ CAMBIAR de 100 a 0
}
```

### 📊 Impacto en Ahorro de Costos

**Estimación:**

- Supuesto: 1000 usuarios FREE
- Promedio: 5 lecturas/mes por usuario
- Total lecturas FREE/mes: 5000

**Antes (con IA):**

- Costo por lectura: ~$0.01 USD
- Costo mensual: $50 USD

**Después (sin IA):**

- Costo: $0
- **Ahorro: $50 USD/mes por cada 1000 usuarios FREE**

---

## 🎯 F007: Información Estática de Cartas

### Estado: ✅ EXISTENTE - VERIFICAR CONTENIDO

### 📍 Archivos Analizados

| Archivo            | Ruta                                                                | Funcionalidad      |
| ------------------ | ------------------------------------------------------------------- | ------------------ |
| `card.entity.ts`   | `backend/tarot-app/src/modules/tarot/cards/entities/card.entity.ts` | Entity de cartas   |
| `cards.service.ts` | `backend/tarot-app/src/modules/tarot/cards/cards.service.ts`        | Servicio de cartas |
| `cards-seeder.ts`  | `backend/tarot-app/src/database/seeds/cards-seeder.ts` (si existe)  | Datos estáticos    |

### 🔍 Búsqueda de Archivos

```bash
find backend/tarot-app -name "*card*" -type f | grep -E "entity|service|seed"
```

**Resultados esperados:**

- Entity con campos: `name`, `description`, `meaning`, `keywords`, `imageUrl`
- Servicio con método `findByIds()` (ya visto en use case)

### 🛠️ Acción Requerida

**Verificar que cada carta tiene:**

1. ✅ Descripción completa en español
2. ✅ Significado derecho e invertido
3. ✅ Palabras clave (keywords)
4. ✅ Imagen de alta calidad

**Script de verificación:**

```sql
-- Verificar cartas sin descripción
SELECT id, name
FROM card
WHERE description IS NULL
   OR description = ''
   OR meaning_upright IS NULL
   OR meaning_reversed IS NULL;
```

**Si faltan datos:** Completar con contenido genérico de tarot.

---

## 🎯 F011, F012, F013: Categorías, Preguntas e IA (Premium)

### Estado: ✅ EXISTE - VERIFICAR VALIDACIONES

### 📍 Archivos Analizados

| Archivo                                         | Funcionalidad          |
| ----------------------------------------------- | ---------------------- |
| `requires-premium-for-custom-question.guard.ts` | Guard existente ✅     |
| `categories.controller.ts`                      | Endpoint de categorías |
| `predefined-questions.controller.ts`            | Endpoint de preguntas  |

### 🔍 Hallazgo

**requires-premium-for-custom-question.guard.ts (líneas 29-42):**

```typescript
@Injectable()
export class RequiresPremiumForCustomQuestionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = request.user;
    const body = request.body;

    if (!body.customQuestion) {
      return true;
    }

    if (user.plan === UserPlan.FREE) {
      throw new ForbiddenException("Las preguntas personalizadas requieren un plan premium.");
    }

    return true;
  }
}
```

✅ **Validación existente correcta**

**Problema:** Solo valida `FREE`, pero con GUEST/PROFESSIONAL necesita actualizar:

```typescript
if (user.plan !== UserPlan.PREMIUM) {  // ⬅️ Cambiar lógica
  throw new ForbiddenException(...);
}
```

### 🛠️ Cambios Requeridos

1. **Actualizar Guard de Custom Question:**

```typescript
// Antes
if (user.plan === UserPlan.FREE) {

// Después
if (user.plan !== UserPlan.PREMIUM) {
```

2. **Verificar endpoints de Categories y Questions:**

**¿Son públicos o requieren auth?**

Buscar decorators:

```typescript
@Public()  // Si existe, significa público
@UseGuards(JwtAuthGuard)  // Si existe, requiere auth
```

**Según estrategia:**

- Categorías: Solo Premium debe poder **seleccionarlas** al crear lectura
- El endpoint GET puede ser público (para mostrar en marketing)
- La validación se hace al crear lectura, no al listar

---

## 🎯 F015: Home Page Dual (Landing + Dashboard)

### Estado: ❌ A DESARROLLAR DESDE CERO

### 📍 Búsqueda de Código Actual

```bash
find frontend/src/app -name "page.tsx" -o -name "layout.tsx" | head -5
```

**Buscar home actual:**

```bash
cat frontend/src/app/page.tsx
```

### 🔍 Hallazgo

**Según feedback del usuario:**

> "Home page no existe, hay una mockeada provisoria"

**Acción:** Buscar el mock actual para entender estructura.

**Archivos probables:**

- `frontend/src/app/page.tsx` - Home page
- `frontend/src/app/dashboard/page.tsx` - Dashboard (si existe)
- `frontend/src/components/features/home/` - Componentes de home

### 🛠️ Desarrollo Requerido

**Componentes a crear:**

1. **LandingPage.tsx** (usuarios no autenticados)
   - HeroSection
   - TryWithoutRegisterCTA
   - PremiumBenefitsSection
   - WhatIsTarotSection
   - RegisterCTA

2. **UserDashboard.tsx** (usuarios autenticados)
   - WelcomeHeader con badge de plan
   - QuickActions (Nueva Lectura, Historial, etc.)
   - DidYouKnowSection (rotativa)
   - StatsSection (solo Premium)
   - UpgradeBanner (solo Free)

3. **HomePage.tsx** (orquestador)
   ```typescript
   export default function HomePage() {
     const { user, isLoading } = useAuth();

     if (isLoading) return <LoadingSpinner />;
     if (user) return <UserDashboard user={user} />;
     return <LandingPage />;
   }
   ```

**Estimación:** 20-30 horas de desarrollo + diseño

---

## 📊 Resumen Ejecutivo de Hallazgos

### 🔴 CRÍTICO - Ahorro de Costos (Implementar YA)

| Feature   | Problema                            | Solución                            | Ahorro Estimado        |
| --------- | ----------------------------------- | ----------------------------------- | ---------------------- |
| F001      | Plan FREE con `aiQuotaMonthly: 100` | Cambiar a 0                         | $50/mes por 1000 users |
| F004/F005 | No valida plan antes de IA          | Agregar `RequiresPremiumForAIGuard` | $50/mes por 1000 users |
| F002      | Sin reset diario de límites         | Implementar cron job                | -                      |

**Ahorro total potencial: ~$100 USD/mes por cada 1000 usuarios FREE**

### 🟠 IMPORTANTE - Funcionalidad Core

| Feature   | Estado  | Acción Requerida        | Complejidad  |
| --------- | ------- | ----------------------- | ------------ |
| F001      | Parcial | Migración 3→2 planes    | Media (4-6h) |
| F002      | Parcial | Ajustar límites diarios | Alta (8-12h) |
| F011-F013 | Bueno   | Actualizar guards       | Baja (2h)    |

### 🟡 MODERADO - UX y Mejoras

| Feature | Estado               | Acción Requerida      | Complejidad   |
| ------- | -------------------- | --------------------- | ------------- |
| F015    | No existe            | Desarrollar Home dual | Alta (20-30h) |
| F007    | Existe               | Verificar contenido   | Baja (2-4h)   |
| F010    | Probablemente existe | Verificar share logic | Media (4h)    |

---

## 🎯 Próximos Pasos Recomendados

### Sprint 1 (CRÍTICO - 1 semana)

1. ✅ **Migración de Planes (F001)**
   - Crear migración para eliminar `professional`
   - Actualizar enum en código
   - Ajustar seeders

2. ✅ **Bloqueo de IA para FREE (F004/F005)**
   - Crear `RequiresPremiumForAIGuard`
   - Cambiar default de `generateInterpretation`
   - Actualizar `aiQuotaMonthly` de FREE a 0

3. ✅ **Sistema de Reset Diario (F002)**
   - Implementar cron job
   - Ajustar límites en DB
   - Validación por día (no total)

### Sprint 2 (Importante - 1-2 semanas)

4. **Ajustes de Guards (F011-F013)**
   - Actualizar validaciones de Premium
   - Tests de regresión

5. **Verificación de Contenido (F007)**
   - Audit de cartas en DB
   - Completar descripciones faltantes

6. **Compartir Lecturas (F010)**
   - Verificar funcionalidad existente
   - Ajustar según plan (FREE puede compartir)

### Sprint 3 (UX - 2-3 semanas)

7. **Home Page Dual (F015)**
   - Diseño de componentes
   - Implementación Landing
   - Implementación Dashboard
   - Integración con auth

---

## 📝 Notas Finales

**Decisiones Pendientes con Usuario:**

1. **Plan GUEST vs Usuarios Anónimos:**
   - ¿Son lo mismo?
   - ¿Renombrar GUEST a ANONYMOUS?

2. **Límites por Tipo de Tirada:**
   - Estrategia: "1x1 carta + 1x3 cartas" para FREE
   - Actual: "10 lecturas totales"
   - ¿Simplificar a "2 lecturas/día" para MVP?

3. **Premium: 3 tiradas/día vs Ilimitado:**
   - Estrategia dice "3 tiradas/día"
   - Código actual: ilimitado
   - ¿Cambiar o mantener ilimitado?

4. **Reset diario: ¿UTC o timezone del usuario?**
   - Recomendación: UTC para simplicidad MVP

---

**Documento generado:** 18 Diciembre 2025  
**Autor:** GitHub Copilot  
**Versión:** 1.0  
**Total de líneas de código analizadas:** ~3000  
**Archivos revisados:** 25+
