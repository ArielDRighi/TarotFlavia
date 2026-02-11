# Plan de Remediación de Tipos `any` - Backend

> 📅 **Fecha:** 11 Febrero 2026  
> 🎯 **Total de `any` a eliminar:** 355  
> ⚠️ **Estado:** TEMPORAL - Este archivo se eliminará después de completar todas las tareas

---

## 🎯 Estrategia General

Este plan organiza la eliminación de los 355 usos de `any` en el backend en **17 tareas incrementales** distribuidas en **4 fases** según prioridad.

**Principios:**

- ✅ Una tarea = un ámbito claro y acotado
- ✅ Cada tarea incluye tests
- ✅ Orden de prioridad: producción → tests críticos → tests normales → e2e
- ✅ Validación con `npm run lint` después de cada tarea

---

## 📋 FASE 1: CÓDIGO DE PRODUCCIÓN CRÍTICO (✅ COMPLETADA)

### TASK-ANY-001: Logger Service y Common Utilities ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🔴 CRÍTICA  
**Usos de `any`:** 15  
**Archivos afectados:**

- `src/common/logger/logger.service.ts` (8 usos)
- `src/common/logger/logger.service.spec.ts` (5 usos)
- `src/common/interceptors/logging.interceptor.ts` (1 uso)
- `src/common/guards/custom-throttler.guard.spec.ts` (1 uso)

**Tipos a crear:**

```typescript
// logger.service.ts
type LogContext = Record<string, string | number | boolean | null>;
type LogMetadata = Record<string, unknown>;

// logging.interceptor.ts
type InterceptorContext = Record<string, string | number>;
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/common/
npm run build
```

---

### TASK-ANY-002: Audit System (Entities & DTOs) ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🔴 CRÍTICA  
**Usos de `any`:** 4  
**Archivos afectados:**

- `src/modules/audit/entities/audit-log.entity.ts` (2 usos)
- `src/modules/audit/dto/create-audit-log.dto.ts` (2 usos)

**Tipos a crear:**

```typescript
type AuditMetadata = Record<string, string | number | boolean | null>;
type AuditChanges = Record<string, { before: unknown; after: unknown }>;
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/audit/
npm run build
```

---

### TASK-ANY-003: Tarotistas Repository Interfaces ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🔴 CRÍTICA  
**Usos de `any`:** 4  
**Archivos afectados:**

- `src/modules/tarotistas/domain/interfaces/tarotista-repository.interface.ts` (1 uso)
- `src/modules/tarotistas/domain/interfaces/reports-repository.interface.ts` (2 usos)
- `src/modules/tarotistas/application/dto/update-tarotista-config.dto.ts` (1 uso)

**Tipos a crear:**

```typescript
// tarotista-repository.interface.ts
type WhereCondition = FindOptionsWhere<Tarotista>;

// reports-repository.interface.ts
type ReportData = {
  headers: string[];
  rows: (string | number)[][];
  metadata?: Record<string, string | number>;
};

type PDFTemplateData = {
  title: string;
  data: Record<string, string | number | string[]>;
};
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/tarotistas/
npm run build
```

---

### TASK-ANY-004: Birth Chart DTOs ✅ (OMITIDA)

**Estado:** ✅ OMITIDA (Sin `any` en producción)  
**Prioridad:** 🔴 CRÍTICA  
**Usos de `any`:** 3  
**Archivos afectados:**

- `src/modules/birth-chart/application/dto/chart-response.dto.ts` (3 usos)

**Tipos a crear:**

```typescript
type PlanetData = {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
};

type HouseData = {
  number: number;
  sign: string;
  degree: number;
};

type AspectData = {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
};
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/birth-chart/application/dto/
npm run build
```

---

### TASK-ANY-005: Notifications System ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🔴 CRÍTICA  
**Usos de `any`:** 3  
**Archivos afectados:**

- `src/modules/notifications/entities/user-notification.entity.ts` (1 uso)
- `src/modules/notifications/application/dto/notification.dto.ts` (1 uso)
- `src/modules/notifications/application/services/notifications.service.ts` (1 uso)

**Tipos a crear:**

```typescript
type NotificationData = {
  title?: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, string | number>;
};
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/notifications/
npm run build
```

---

### TASK-ANY-006: Tarot Interpretations Service ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🔴 CRÍTICA  
**Usos de `any`:** 3  
**Archivos afectados:**

- `src/modules/tarot/interpretations/interpretations.service.ts` (2 usos)
- `src/modules/tarot/interpretations/entities/tarot-interpretation.entity.ts` (1 uso)

**Tipos a crear:**

```typescript
type AIConfig = {
  model: string;
  temperature: number;
  maxTokens: number;
  provider: "groq" | "openai" | "deepseek";
};

type InterpretationMetadata = Record<string, string | number | boolean>;
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/tarot/interpretations/
npm run build
```

---

### TASK-ANY-007: AI Module & Cache Service ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🟠 ALTA  
**Usos de `any`:** 4  
**Archivos afectados:**

- `src/modules/ai/application/dto/ai-request.dto.ts` (1 uso)
- `src/modules/ai/application/dto/ai-response.dto.ts` (1 uso)
- `src/modules/cache/application/services/interpretation-cache.service.ts` (2 usos)

**Tipos a crear:**

```typescript
// ai-request.dto.ts
type AIRequestContext = Record<string, string | number | boolean>;

// ai-response.dto.ts
type AIResponseMetadata = {
  model: string;
  tokensUsed?: number;
  latency?: number;
};

// interpretation-cache.service.ts
type CacheValue<T = unknown> = T;
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/ai/
npm run test src/modules/cache/
npm run build
```

---

### TASK-ANY-008: Auth Validators ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🟡 MEDIA  
**Usos de `any`:** 1  
**Archivos afectados:**

- `src/modules/auth/application/dto/is-strong-password.validator.ts` (1 uso)

**Cambio:**

```typescript
// Antes
validate(value: any) {

// Después
validate(value: unknown) {
  if (typeof value !== 'string') return false;
  // ... resto de lógica
}
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/auth/
npm run build
```

---

## 📋 FASE 2: TESTS CRÍTICOS

### TASK-ANY-009: Users Module Tests ✅

**Estado:** ✅ COMPLETADA  
**Prioridad:** 🟠 ALTA  
**Usos de `any`:** 47 → 0  
**Archivos modificados:**

- ✅ `src/modules/users/application/services/user-capabilities.service.spec.ts` (22 usos → 0)
- ✅ `src/modules/users/application/services/users-orchestrator.service.spec.ts` (7 usos → 0)
- ✅ `src/modules/users/application/dto/update-user-plan.dto.spec.ts` (4 usos → 0)
- ✅ `src/modules/users/application/dto/user-capabilities.dto.spec.ts` (6 usos → 0)
- ✅ `src/modules/users/application/use-cases/create-user.use-case.spec.ts` (2 usos → 0)
- ✅ `src/modules/users/infrastructure/controllers/users.controller.spec.ts` (3 usos → 0)
- ✅ `src/modules/users/infrastructure/repositories/typeorm-user.repository.spec.ts` (2 usos → 0)
- ✅ `src/modules/users/users.service.spec.ts` (1 uso → 0)

**Cambios implementados:**

1. **DTOs de validación**: `Object.assign(dto, { property })` en lugar de `(dto as any).property`
2. **Mocks de repositorios**: `Record<string, jest.Mock>` en lugar de `jest.Mocked<Partial<Interface>>`
3. **Type casts seguros**: `as unknown as Type` para incompatibilidades de Partial
4. **Imports corregidos**: Agregado UserRole, User, Plan entities
5. **Propiedades de Plan**: Eliminadas propiedades inexistentes del mock
6. **Roles tipados**: `[UserRole.CONSUMER]` en lugar de `['user']`

**Resultados de validación:**

```bash
✅ npm run format - OK (sin cambios)
✅ npm run lint - OK (módulo users clean)
✅ npm run test src/modules/users/ - 17/17 suites, 237 tests passed
✅ npm run test:cov - 80.86% coverage (3484 tests)
✅ npm run build - Compilación exitosa
✅ node scripts/validate-architecture.js - Validación OK
```

---

### TASK-ANY-010: Birth Chart Module Tests

**Prioridad:** 🟠 ALTA  
**Usos de `any`:** 56  
**Archivos afectados:**

- `src/modules/birth-chart/application/services/chart-calculation.service.spec.ts` (18 usos)
- `src/modules/birth-chart/application/services/chart-pdf.service.spec.ts` (11 usos)
- `src/modules/birth-chart/infrastructure/repositories/birth-chart-interpretation.repository.spec.ts` (6 usos)
- `src/modules/birth-chart/entities/birth-chart.entity.spec.ts` (5 usos)
- `src/modules/birth-chart/application/dto/generate-chart.dto.spec.ts` (5 usos)
- `src/modules/birth-chart/application/services/chart-cache.service.spec.ts` (4 usos)
- Otros archivos (7 usos)

**Estrategia:**

```typescript
// Definir tipos mock reutilizables
type MockChartData = Partial<ChartData>;
const mockPlanetData: PlanetData = {
  /* ... */
};
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/birth-chart/
```

---

### TASK-ANY-011: Database Seeders Tests

**Prioridad:** 🟠 ALTA  
**Usos de `any`:** 33  
**Archivos afectados:**

- `src/database/seeds/tarot-cards.seeder.spec.ts` (19 usos)
- `src/database/seeds/reading-categories.seeder.spec.ts` (11 usos)
- `src/database/seeds/sacred-calendar.seeder.spec.ts` (3 usos)

**Estrategia:**

```typescript
// Usar Partial<EntityType> para mocks de repository
const mockRepo: Partial<Repository<TarotCard>> = {
  save: jest.fn().mockResolvedValue({}),
  count: jest.fn().mockResolvedValue(0),
};
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/database/seeds/
```

---

### TASK-ANY-012: Auth Module Tests

**Prioridad:** 🟠 ALTA  
**Usos de `any`:** 29  
**Archivos afectados:**

- `src/modules/auth/infrastructure/repositories/typeorm-refresh-token.repository.spec.ts` (9 usos)
- `src/modules/auth/application/use-cases/login.use-case.spec.ts` (3 usos)
- `src/modules/auth/application/use-cases/logout.use-case.spec.ts` (3 usos)
- `src/modules/auth/application/use-cases/register.use-case.spec.ts` (3 usos)
- `src/modules/auth/application/use-cases/reset-password.use-case.spec.ts` (3 usos)
- `src/modules/auth/application/services/token-cleanup.service.spec.ts` (2 usos)
- Otros archivos (6 usos)

**Estrategia:**

```typescript
// Mocks tipados para repositorios
let mockRefreshTokenRepo: jest.Mocked<IRefreshTokenRepository>;
let mockPasswordResetRepo: jest.Mocked<IPasswordResetRepository>;
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/auth/
```

---

## 📋 FASE 3: TESTS NO CRÍTICOS

### TASK-ANY-013: Tarot Module Tests

**Prioridad:** 🟡 MEDIA  
**Usos de `any`:** 30  
**Archivos afectados:**

- `src/modules/tarot/daily-reading/daily-reading-cleanup.service.spec.ts` (11 usos)
- `src/modules/tarot/readings/application/services/share-text-generator.service.spec.ts` (7 usos)
- Otros archivos de readings (12 usos)

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/tarot/
```

---

### TASK-ANY-014: Horoscope, Numerology & Health Tests

**Prioridad:** 🟡 MEDIA  
**Usos de `any`:** 39  
**Archivos afectados:**

- `src/modules/horoscope/` (25 usos)
- `src/modules/numerology/` (7 usos)
- `src/modules/health/` (7 usos)

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/horoscope/
npm run test src/modules/numerology/
npm run test src/modules/health/
```

---

### TASK-ANY-015: Rituals, Tarotistas & Admin Tests

**Prioridad:** 🟡 MEDIA  
**Usos de `any`:** 43  
**Archivos afectados:**

- `src/modules/rituals/` (17 usos)
- `src/modules/tarotistas/` (14 tests usos)
- `src/modules/admin/` (9 usos)
- `src/modules/pendulum/` (1 uso)
- `src/modules/plan-config/` (1 uso)
- `src/modules/scheduling/` (2 usos)

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/rituals/
npm run test src/modules/tarotistas/
npm run test src/modules/admin/
```

---

### TASK-ANY-016: Usage Limits & Subscriptions Tests

**Prioridad:** 🟡 MEDIA  
**Usos de `any`:** 19  
**Archivos afectados:**

- `src/modules/usage-limits/` (13 usos)
- `src/modules/subscriptions/` (6 usos)

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test src/modules/usage-limits/
npm run test src/modules/subscriptions/
```

---

## 📋 FASE 4: TESTS E2E

### TASK-ANY-017: E2E & Integration Tests

**Prioridad:** 🟢 BAJA  
**Usos de `any`:** 19  
**Archivos afectados:**

- `test/integration/` (9 usos)
- `test/*.e2e-spec.ts` (10 usos)

**Estrategia:**

```typescript
// E2E tests pueden usar interfaces más simples
type TestRequest = Partial<Request>;
type TestResponse = Partial<Response>;
```

**Validación:**

```bash
cd backend/tarot-app
npm run lint
npm run test:e2e
```

---

## 📊 Progreso de Fases

| Fase         | Tareas    | Usos de `any` | % del Total | Estado |
| ------------ | --------- | ------------- | ----------- | ------ |
| **Fase 1**   | 8 tareas  | 35 usos       | 9.9%        | ⏳     |
| **Fase 2**   | 4 tareas  | 165 usos      | 46.5%       | ⏳     |
| **Fase 3**   | 4 tareas  | 131 usos      | 36.9%       | ⏳     |
| **Fase 4**   | 1 tarea   | 19 usos       | 5.4%        | ⏳     |
| **RESTANTE** |           | 5 usos        | 1.3%        | ⏳     |
| **TOTAL**    | 17 tareas | 355 usos      | 100%        |        |

**Nota:** El restante (5 usos) son archivos AI usages y similares que se asignarán en refactoring posterior.

---

## ✅ Checklist por Tarea

Para cada tarea, el agente debe:

- [ ] Leer el archivo del módulo correspondiente
- [ ] Identificar todos los usos de `any` en el código
- [ ] Crear tipos apropiados (interfaces, types, unions, generics)
- [ ] Reemplazar `any` por los tipos creados
- [ ] Actualizar tests si es necesario
- [ ] Ejecutar `npm run lint` y verificar que pasa
- [ ] Ejecutar tests del módulo y verificar que pasan
- [ ] Ejecutar `npm run build` y verificar compilación
- [ ] Marcar la tarea como completada en el backlog
- [ ] Crear commit con formato: `refactor(module-name): eliminate 'any' usage (TASK-ANY-XXX)`
- [ ] Push y crear PR apuntando a `develop`

---

## 🚫 Reglas Importantes

1. **NO mezclar tareas** - Una tarea = un PR
2. **NO saltar validaciones** - Lint, tests y build son obligatorios
3. **NO usar `unknown` sin type guards** - Preferir tipos específicos
4. **NO romper contratos existentes** - La API pública debe mantenerse
5. **SIEMPRE documentar** - Explicar decisiones de diseño de tipos

---

## 🎯 Objetivo Final

Al completar las 17 tareas:

✅ 0 usos de `any` en el código  
✅ Regla `@typescript-eslint/no-explicit-any` activada  
✅ CI pasando sin errores  
✅ Mejor type safety en toda la aplicación  
✅ Menos bugs relacionados con tipos

---

## 📝 Notas de Implementación

### Orden Sugerido de Ejecución

1. **TASK-ANY-001 a TASK-ANY-008** (Fase 1) - En orden secuencial
2. **TASK-ANY-009 a TASK-ANY-012** (Fase 2) - Pueden hacerse en paralelo si hay múltiples agentes
3. **TASK-ANY-013 a TASK-ANY-016** (Fase 3) - En cualquier orden
4. **TASK-ANY-017** (Fase 4) - Al final

### Después de Completar TASK-ANY-008

**Habilitar la regla de ESLint:**

```javascript
// backend/tarot-app/eslint.config.mjs
{
  rules: {
    '@typescript-eslint/no-explicit-any': 'error', // Cambiar de 'off' a 'error'
    // ... resto de reglas
  },
}
```

Esto hará que las tareas subsiguientes validen automáticamente que no se agreguen nuevos `any`.

---

## 🔗 Referencias

- Análisis completo: `ANALISIS_ANY_TYPESCRIPT.md`
- Reporte ESLint: `backend/tarot-app/eslint-any-report.txt`
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- ESLint Rule: https://typescript-eslint.io/rules/no-explicit-any/

---

**Documento creado el:** 11 Febrero 2026  
**Última actualización:** 11 Febrero 2026  
**Autor:** AI Agent (GitHub Copilot)
