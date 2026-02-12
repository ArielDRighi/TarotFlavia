# Análisis de Uso de `any` en TypeScript

> 📅 **Fecha:** 11 Febrero 2026  
> 🎯 **Objetivo:** Documentar y planificar la eliminación de 355 usos del tipo `any` en el backend  
> ⚠️ **Estado:** TEMPORAL - Este archivo se eliminará después de completar todas las tareas

---

## 🔍 Resumen Ejecutivo

### Problema Detectado

La regla de ESLint `@typescript-eslint/no-explicit-any` está **desactivada** en la configuración del backend (`eslint.config.mjs`):

```javascript
// Línea 30 del archivo backend/tarot-app/eslint.config.mjs
'@typescript-eslint/no-explicit-any': 'off',
```

**Consecuencias:**

- Los ciclos de calidad obligatorios (lint) no detectan usos de `any`
- Los agentes IA no reciben feedback durante el desarrollo
- El CI en GitHub Actions SÍ detecta los errores, causando fallos tardíos
- Total de usos detectados: **355 errores**

### Distribución por Categoría

| Categoría                | Cantidad | % del Total |
| ------------------------ | -------- | ----------- |
| **Tests (.spec.ts)**     | ~320     | 90.1%       |
| **Código de Producción** | ~35      | 9.9%        |

**Nota:** La gran mayoría de usos están en archivos de test, lo cual es menos crítico pero igual debe corregirse.

---

## 📊 Análisis Detallado por Módulo

### 1. Common (Utilidades y Guards)

- `common/guards/custom-throttler.guard.spec.ts` - 1 uso
- `common/interceptors/logging.interceptor.ts` - 1 uso
- `common/logger/logger.service.spec.ts` - 5 usos
- `common/logger/logger.service.ts` - 8 usos

**Subtotal Common:** 15 usos  
**Crítico:** 9 usos en código de producción

---

### 2. Database (Seeders)

- `database/seeds/reading-categories.seeder.spec.ts` - 11 usos
- `database/seeds/sacred-calendar.seeder.spec.ts` - 3 usos
- `database/seeds/tarot-cards.seeder.spec.ts` - 19 usos

**Subtotal Database:** 33 usos  
**Crítico:** 0 (todos en tests)

---

### 3. Módulo Admin

- `modules/admin/admin-dashboard.controller.spec.ts` - 2 usos
- `modules/admin/admin-dashboard.service.spec.ts` - 6 usos
- `modules/admin/admin-users.controller.spec.ts` - 1 uso

**Subtotal Admin:** 9 usos  
**Crítico:** 0 (todos en tests)

---

### 4. Módulo AI Usage & AI

- `modules/ai-usage/application/use-cases/check-user-quota.use-case.spec.ts` - 5 usos
- `modules/ai/application/dto/ai-request.dto.ts` - 1 uso
- `modules/ai/application/dto/ai-response.dto.ts` - 1 uso

**Subtotal AI:** 7 usos  
**Crítico:** 2 usos en DTOs de producción

---

### 5. Módulo Audit

- `modules/audit/dto/create-audit-log.dto.ts` - 2 usos
- `modules/audit/entities/audit-log.entity.ts` - 2 usos

**Subtotal Audit:** 4 usos  
**Crítico:** 4 usos en código de producción

---

### 6. Módulo Auth

- `modules/auth/application/dto/is-strong-password.validator.ts` - 1 uso
- `modules/auth/application/services/auth-orchestrator.service.spec.ts` - 1 uso
- `modules/auth/application/services/token-cleanup.service.spec.ts` - 2 usos
- `modules/auth/application/use-cases/forgot-password.use-case.spec.ts` - 1 uso
- `modules/auth/application/use-cases/login.use-case.spec.ts` - 3 usos
- `modules/auth/application/use-cases/logout.use-case.spec.ts` - 3 usos
- `modules/auth/application/use-cases/refresh-token.use-case.spec.ts` - 1 uso
- `modules/auth/application/use-cases/register.use-case.spec.ts` - 3 usos
- `modules/auth/application/use-cases/reset-password.use-case.spec.ts` - 3 usos
- `modules/auth/infrastructure/guards/optional-jwt-auth.guard.spec.ts` - 1 uso
- `modules/auth/infrastructure/repositories/typeorm-password-reset.repository.spec.ts` - 2 usos
- `modules/auth/infrastructure/repositories/typeorm-refresh-token.repository.spec.ts` - 9 usos

**Subtotal Auth:** 30 usos  
**Crítico:** 1 uso en validator

---

### 7. Módulo Birth Chart

- `modules/birth-chart/application/dto/chart-response.dto.ts` - 3 usos
- `modules/birth-chart/application/dto/create-birth-chart.dto.spec.ts` - 1 uso
- `modules/birth-chart/application/dto/generate-chart.dto.spec.ts` - 5 usos
- `modules/birth-chart/application/dto/geocode-place.dto.spec.ts` - 1 uso
- `modules/birth-chart/application/services/chart-cache.service.spec.ts` - 4 usos
- `modules/birth-chart/application/services/chart-calculation.service.spec.ts` - 18 usos
- `modules/birth-chart/application/services/chart-pdf.service.spec.ts` - 11 usos
- `modules/birth-chart/application/services/planet-position.service.spec.ts` - 1 uso
- `modules/birth-chart/entities/birth-chart-interpretation.entity.spec.ts` - 1 uso
- `modules/birth-chart/entities/birth-chart.entity.spec.ts` - 5 usos
- `modules/birth-chart/infrastructure/controllers/birth-chart.controller.spec.ts` - 3 usos
- `modules/birth-chart/infrastructure/repositories/birth-chart-interpretation.repository.spec.ts` - 6 usos

**Subtotal Birth Chart:** 59 usos  
**Crítico:** 3 usos en DTOs de producción

---

### 8. Módulo Cache

- `modules/cache/application/services/interpretation-cache.service.ts` - 2 usos

**Subtotal Cache:** 2 usos  
**Crítico:** 2 usos en código de producción

---

### 9. Módulo Health

- `modules/health/ai-health.service.spec.ts` - 7 usos

**Subtotal Health:** 7 usos  
**Crítico:** 0 (todos en tests)

---

### 10. Módulo Horoscope

- `modules/horoscope/application/services/chinese-horoscope.service.spec.ts` - 8 usos
- `modules/horoscope/application/services/horoscope-cron.service.spec.ts` - 2 usos
- `modules/horoscope/application/services/horoscope-generation.service.spec.ts` - 1 uso
- `modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.spec.ts` - 11 usos
- `modules/horoscope/infrastructure/controllers/horoscope.controller.spec.ts` - 3 usos

**Subtotal Horoscope:** 25 usos  
**Crítico:** 0 (todos en tests)

---

### 11. Módulo Notifications

- `modules/notifications/application/dto/notification.dto.ts` - 1 uso
- `modules/notifications/application/services/notifications.service.ts` - 1 uso
- `modules/notifications/entities/user-notification.entity.ts` - 1 uso

**Subtotal Notifications:** 3 usos  
**Crítico:** 3 usos en código de producción

---

### 12. Módulo Numerology

- `modules/numerology/numerology.controller.spec.ts` - 7 usos

**Subtotal Numerology:** 7 usos  
**Crítico:** 0 (todos en tests)

---

### 13. Módulo Pendulum

- `modules/pendulum/infrastructure/controllers/pendulum.controller.spec.ts` - 1 uso

**Subtotal Pendulum:** 1 uso  
**Crítico:** 0 (todos en tests)

---

### 14. Módulo Plan Config

- `modules/plan-config/entities/plan.entity.spec.ts` - 1 uso

**Subtotal Plan Config:** 1 uso  
**Crítico:** 0 (todos en tests)

---

### 15. Módulo Rituals

- `modules/rituals/application/services/ritual-history.service.spec.ts` - 1 uso
- `modules/rituals/application/services/rituals-admin.service.spec.ts` - 7 usos
- `modules/rituals/application/services/rituals.service.spec.ts` - 1 uso
- `modules/rituals/application/services/sacred-calendar.service.spec.ts` - 8 usos

**Subtotal Rituals:** 17 usos  
**Crítico:** 0 (todos en tests)

---

### 16. Módulo Scheduling

- `modules/scheduling/infrastructure/controllers/user-scheduling.controller.spec.ts` - 1 uso
- `modules/scheduling/infrastructure/repositories/typeorm-exception.repository.spec.ts` - 1 uso

**Subtotal Scheduling:** 2 usos  
**Crítico:** 0 (todos en tests)

---

### 17. Módulo Subscriptions

- `modules/subscriptions/subscriptions.controller.spec.ts` - 2 usos
- `modules/subscriptions/subscriptions.service.spec.ts` - 4 usos

**Subtotal Subscriptions:** 6 usos  
**Crítico:** 0 (todos en tests)

---

### 18. Módulo Tarot

- `modules/tarot/daily-reading/daily-reading-cleanup.service.spec.ts` - 11 usos
- `modules/tarot/interpretations/entities/tarot-interpretation.entity.ts` - 1 uso
- `modules/tarot/interpretations/interpretations.service.ts` - 2 usos
- `modules/tarot/readings/application/services/share-text-generator.service.spec.ts` - 7 usos
- `modules/tarot/readings/application/use-cases/create-reading.use-case.spec.ts` - 1 uso
- `modules/tarot/readings/application/use-cases/delete-reading.use-case.spec.ts` - 2 usos
- `modules/tarot/readings/application/use-cases/get-reading.use-case.spec.ts` - 2 usos
- `modules/tarot/readings/application/use-cases/restore-reading.use-case.spec.ts` - 2 usos
- `modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.spec.ts` - 2 usos

**Subtotal Tarot:** 30 usos  
**Crítico:** 3 usos en código de producción

---

### 19. Módulo Tarotistas

- `modules/tarotistas/application/dto/update-tarotista-config.dto.ts` - 1 uso
- `modules/tarotistas/application/services/tarotistas-orchestrator.service.spec.ts` - 4 usos
- `modules/tarotistas/domain/interfaces/reports-repository.interface.ts` - 2 usos
- `modules/tarotistas/domain/interfaces/tarotista-repository.interface.ts` - 1 uso
- `modules/tarotistas/infrastructure/controllers/tarotistas-admin.controller.spec.ts` - 2 usos
- `modules/tarotistas/services/revenue-calculation.service.spec.ts` - 8 usos

**Subtotal Tarotistas:** 18 usos  
**Crítico:** 4 usos en código de producción (interfaces y DTOs)

---

### 20. Módulo Usage Limits

- `modules/usage-limits/guards/check-usage-limit.guard.spec.ts` - 1 uso
- `modules/usage-limits/services/anonymous-tracking.service.spec.ts` - 6 usos
- `modules/usage-limits/services/usage-limits-reset.service.spec.ts` - 6 usos

**Subtotal Usage Limits:** 13 usos  
**Crítico:** 0 (todos en tests)

---

### 21. Módulo Users

- `modules/users/application/dto/update-user-plan.dto.spec.ts` - 4 usos
- `modules/users/application/dto/user-capabilities.dto.spec.ts` - 6 usos
- `modules/users/application/services/user-capabilities.service.spec.ts` - 22 usos
- `modules/users/application/services/users-orchestrator.service.spec.ts` - 7 usos
- `modules/users/application/use-cases/create-user.use-case.spec.ts` - 2 usos
- `modules/users/infrastructure/controllers/users.controller.spec.ts` - 3 usos
- `modules/users/infrastructure/repositories/typeorm-user.repository.spec.ts` - 2 usos
- `modules/users/users.service.spec.ts` - 1 uso

**Subtotal Users:** 47 usos  
**Crítico:** 0 (todos en tests)

---

### 22. Tests E2E e Integration

- `test/ai-health.e2e-spec.ts` - 1 uso
- `test/auth-integration.e2e-spec.ts` - 1 uso
- `test/database-infrastructure.e2e-spec.ts` - 1 uso
- `test/health.e2e-spec.ts` - 1 uso
- `test/integration/admin.integration.spec.ts` - 2 usos
- `test/integration/cache-ai.integration.spec.ts` - 2 usos
- `test/integration/categories-questions.integration.spec.ts` - 3 usos
- `test/integration/plan-config.integration.spec.ts` - 2 usos
- `test/integration/usage-limits.integration.spec.ts` - 2 usos
- `test/migration-validation.e2e-spec.ts` - 3 usos
- `test/revenue-sharing-metrics.e2e-spec.ts` - 1 uso

**Subtotal Tests E2E:** 19 usos  
**Crítico:** 0 (todos en tests)

---

## 🎯 Priorización de Remediación

### Nivel 1: CRÍTICO (Código de Producción)

Total: ~35 usos

**Prioridad Alta:**

1. ✅ **Logger Service** (9 usos) - Código central usado en toda la app
2. ✅ **Audit Entities/DTOs** (4 usos) - Seguridad y compliance
3. ✅ **Tarotistas Interfaces** (4 usos) - Core business logic
4. ✅ **Birth Chart DTOs** (3 usos) - API contracts
5. ✅ **Notifications** (3 usos) - User-facing

**Prioridad Media:** 6. ✅ **Tarot Interpretations** (3 usos) - Core business 7. ✅ **AI DTOs** (2 usos) - Third-party integrations 8. ✅ **Cache Service** (2 usos) - Performance critical

**Prioridad Baja:** 9. ✅ **Validators** (1 uso) - Input validation 10. ✅ **DTOs Varios** (4 usos restantes)

---

### Nivel 2: ALTA (Tests Críticos)

Total: ~100 usos

Tests de módulos críticos donde los mocks con `any` ocultan errores:

- Users (47 usos)
- Birth Chart (56 usos)
- Database Seeders (33 usos)
- Auth (29 usos)

---

### Nivel 3: MEDIA (Tests No Críticos)

Total: ~120 usos

Tests de features secundarias o casos edge:

- Tarot (27 usos)
- Horoscope (25 usos)
- Rituals (17 usos)
- Tarotistas (14 usos)
- Usage Limits (13 usos)
- Common (6 usos)
- Health (7 usos)

---

### Nivel 4: BAJA (Tests E2E)

Total: ~19 usos

Tests end-to-end donde el impacto es menor.

---

## 📝 Plan de Acción

### Fase 1: Habilitar la Regla (INMEDIATO)

**Tarea:** Cambiar la configuración de ESLint para activar la regla

**Archivo:** `backend/tarot-app/eslint.config.mjs`

**Cambio:**

```diff
- '@typescript-eslint/no-explicit-any': 'off',
+ '@typescript-eslint/no-explicit-any': 'error',
```

⚠️ **IMPORTANTE:** Esto hará que el lint falle hasta que se corrijan los errores. Se debe hacer en conjunto con las siguientes fases.

---

### Fase 2: Corrección por Prioridad

Se crearán tareas específicas para cada grupo en el backlog técnico.

---

## 🔧 Estrategias de Remediación

### Para Código de Producción

#### 1. Interfaces bien definidas

```typescript
// ❌ Antes
interface ReportRepository {
  exportToPDF(data: any, template: string): Promise<Buffer>;
}

// ✅ Después
interface ReportRepository {
  exportToPDF(data: ReportData, template: string): Promise<Buffer>;
}
```

#### 2. Tipos genéricos

```typescript
// ❌ Antes
class CacheService {
  set(key: string, value: any): void;
}

// ✅ Después
class CacheService {
  set<T>(key: string, value: T): void;
}
```

#### 3. Union types para flexibilidad

```typescript
// ❌ Antes
metadata: any;

// ✅ Después
metadata: Record<string, string | number | boolean>;
```

---

### Para Tests

#### 1. Partial<Type> para mocks parciales

```typescript
// ❌ Antes
const mockUser: any = { id: 1 };

// ✅ Después
const mockUser: Partial<User> = { id: 1 };
```

#### 2. jest.Mocked<T> para mocks de servicios

```typescript
// ❌ Antes
let mockRepository: any;

// ✅ Después
let mockRepository: jest.Mocked<IUserRepository>;
```

#### 3. as unknown as Type para casos específicos

```typescript
// ❌ Antes
const result = service.process(invalidData as any);

// ✅ Después (cuando realmente quieres testear con data inválida)
const result = service.process(invalidData as unknown as ValidType);
```

---

## 📊 Métricas de Seguimiento

| Fase                           | Usos de `any` | % Reducción | Estado |
| ------------------------------ | ------------- | ----------- | ------ |
| **Inicial**                    | 355           | 0%          | ⚠️     |
| **Fase 1 - Críticos**          | 320           | 9.9%        | ⏳     |
| **Fase 2 - Tests Críticos**    | 220           | 38.0%       | ⏳     |
| **Fase 3 - Tests No Críticos** | 100           | 71.8%       | ⏳     |
| **Fase 4 - Tests E2E**         | 0             | 100%        | ⏳     |

---

## 🚀 Próximos Pasos

1. ✅ Crear este documento de análisis
2. ⏳ Crear tareas en el backlog técnico
3. ⏳ Habilitar la regla en ESLint (coordinado con primera tarea)
4. ⏳ Ejecutar tareas en orden de prioridad
5. ⏳ Validar que CI pasa sin errores
6. ⏳ Eliminar este documento temporal

---

## 🔗 Referencias

- ESLint Config: `backend/tarot-app/eslint.config.mjs`
- Reporte Completo: `backend/tarot-app/eslint-any-report.txt`
- TypeScript Docs: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any
- TypeScript ESLint: https://typescript-eslint.io/rules/no-explicit-any/

---

**Documento creado el:** 11 Febrero 2026  
**Última actualización:** 11 Febrero 2026  
**Autor:** AI Agent (GitHub Copilot)
