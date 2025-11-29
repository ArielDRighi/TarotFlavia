OK, vamos a iniciar esta tarea.

Tarea: TASK-076: Dashboard de Configuración Dinámica de Planes ⭐⭐⭐

**Prioridad:** 🟡 ALTA  
**Estimación:** 4 días  
**Tags:** mvp, plan-config, dynamic-limits, admin-dashboard, database-driven  
**Dependencias:** TASK-ARCH-012 (Users Module), TASK-071 (Subscriptions), TASK-075 (Logging)  
**Marcador MVP:** ⭐⭐⭐ **IMPORTANTE PARA MVP** - Gestión flexible de planes y límites  
**Estado:** ✅ COMPLETADA  
**Fecha Finalización:** 2025-11-28

---

#### ✅ Resultado Final

**Implementación completada exitosamente con:**

- ✅ All unit tests passing (15/15 - UsageLimitsService)
- ✅ All integration tests passing (22/22)
  - 16/16 plan-config-users integration tests
  - 6/6 plan-config-readings integration tests
- ✅ All E2E tests passing (curl script: 27/27 validations)
- ✅ 1 critical bug discovered and fixed
- ✅ Lint clean
- ✅ Build successful
- ✅ Architecture validation passed

**Bug Crítico Descubierto por Tests:**

**BUG #1: Dynamic Plan Limits Not Enforced**

- **Archivos afectados**: `usage-limits.service.ts`
- **Error**: UsageLimitsService usaba constantes hardcodeadas (USAGE_LIMITS) en lugar de leer límites dinámicos de PlanConfigService
- **Impacto**: Cambios en límites de planes desde admin dashboard NO se aplicaban en producción
- **Causa raíz**: Dos sistemas paralelos de límites sin comunicación
- **Fix**: Integrar PlanConfigService.getReadingsLimit() en UsageLimitsService.checkLimit()
- **Validación**: Tests de integración verifican que límites dinámicos se aplican inmediatamente

**Mejora de Validación:**

- Agregado ParseEnumPipe a controller para validar planType correctamente
- Antes: 500 Internal Server Error con planType inválido
- Después: 400 Bad Request con mensaje descriptivo

---

#### 📋 Descripción

Implementar sistema de configuración dinámica de planes de usuario mediante base de datos, reemplazando las constantes hardcodeadas actuales. Incluye dashboard administrativo para gestionar features, límites y capacidades de cada plan (GUEST, FREE, PREMIUM, PROFESSIONAL) sin necesidad de redesplegar la aplicación.

**Planes Disponibles:**

- **GUEST/ANONYMOUS**: Usuarios no registrados (3 lecturas/mes, sin IA, sin guardar historial)
- **FREE**: Usuarios registrados gratuitos (10 lecturas/mes, 100 requests IA, guardar historial)
- **PREMIUM**: Plan de pago individual ($9.99/mes, lecturas ilimitadas, IA ilimitada, todas las features)
- **PROFESSIONAL**: Plan para tarotistas profesionales ($19.99/mes, todo PREMIUM + soporte prioritario + features exclusivas)

---

#### 🧪 Testing

**Unit Tests:** ✅ COMPLETADO (15/15 passing)

- [x] Test PlanConfigService.findAll() retorna todos los planes
- [x] Test PlanConfigService.findByPlanType() retorna plan específico
- [x] Test PlanConfigService.create() crea nuevo plan
- [x] Test PlanConfigService.update() actualiza plan existente
- [x] Test PlanConfigService.remove() elimina plan
- [x] Test UsageLimitsService.checkLimit() usa PlanConfigService para TAROT_READING
- [x] Test UsageLimitsService.getRemainingUsage() calcula límites dinámicos
- [x] Test UsageLimitsService fallback a constantes para features no dinámicas

**Integration Tests:** ✅ COMPLETADO (22/22 passing)

**plan-config-users.integration.spec.ts** (16 tests):

- [x] Test plan validation: todos los tipos de plan válidos existen
- [x] Test plan limits consistency: FREE tiene 10 lecturas, PREMIUM ilimitadas
- [x] Test PlanConfigService helpers: getReadingsLimit(), getAIQuota(), getPlanPrice()
- [x] Test dynamic limit updates: cambios se aplican inmediatamente
- [x] Test pricing calculation: FREE $0, PREMIUM $9.99, PROFESSIONAL $19.99
- [x] Test error handling: plan inexistente lanza NotFoundException

**plan-config-readings.integration.spec.ts** (6 tests):

- [x] Test GUEST user enforces 3 reading limit
- [x] Test FREE user enforces 10 reading limit
- [x] Test PREMIUM user allows unlimited readings
- [x] Test increasing limit allows more readings
- [x] Test decreasing limit blocks at new threshold
- [x] Test dynamic limit integration with UsageLimitsService

**E2E Tests:** ✅ COMPLETADO (27 validations via curl script)

- [x] Test GET /plan-config - lista todos los planes (200)
- [x] Test GET /plan-config/:planType - obtiene plan FREE/PREMIUM (200)
- [x] Test GET /plan-config/invalid - valida enum (400)
- [x] Test POST /plan-config - crea plan con datos válidos (201)
- [x] Test POST /plan-config - valida campos requeridos (400)
- [x] Test PUT /plan-config/:planType - actualiza límites (200)
- [x] Test PUT /plan-config/:planType - actualiza features (200)
- [x] Test PUT /plan-config/invalid - valida enum (400)
- [x] Test DELETE /plan-config/:planType - elimina plan (204)
- [x] Test DELETE /plan-config/invalid - valida enum (400)
- [x] Test autorización: endpoints requieren admin (401 sin token)

**Script de Testing Manual:**

- `test-plan-config-endpoints.sh`: 27 validaciones automáticas con curl
- Incluye autenticación admin, CRUD completo, validaciones de seguridad

---

#### 📊 Archivos Creados/Modificados

**Módulo Plan-Config:**

| Archivo                                             | Líneas | Tipo           | Descripción                    |
| --------------------------------------------------- | ------ | -------------- | ------------------------------ |
| `src/modules/plan-config/plan-config.module.ts`     | 25     | Existente      | Módulo NestJS                  |
| `src/modules/plan-config/plan-config.controller.ts` | 113    | **Modificado** | +ParseEnumPipe para validación |
| `src/modules/plan-config/plan-config.service.ts`    | 150    | Existente      | CRUD de planes                 |
| `src/modules/plan-config/entities/plan.entity.ts`   | 85     | Existente      | Entidad Plan                   |
| `src/modules/plan-config/dto/create-plan.dto.ts`    | 110    | Existente      | DTO creación                   |
| `src/modules/plan-config/dto/update-plan.dto.ts`    | 15     | Existente      | DTO actualización              |

**Integración con UsageLimits:**

| Archivo                                                 | Líneas | Tipo           | Descripción                    |
| ------------------------------------------------------- | ------ | -------------- | ------------------------------ |
| `src/modules/usage-limits/usage-limits.service.ts`      | 200    | **Modificado** | +PlanConfigService integration |
| `src/modules/usage-limits/usage-limits.module.ts`       | 25     | **Modificado** | +PlanConfigModule import       |
| `src/modules/usage-limits/usage-limits.service.spec.ts` | 350    | **Modificado** | +mockPlanConfigService         |

**Migraciones y Seeds:**

| Archivo                                                           | Líneas | Tipo       | Descripción           |
| ----------------------------------------------------------------- | ------ | ---------- | --------------------- |
| `src/database/migrations/1770300000000-AddGuestToUserPlanEnum.ts` | 28     | **Creado** | Agrega GUEST enum     |
| `src/database/seeds/plans.seed.ts`                                | 120    | Existente  | Seed planes iniciales |

**Tests:**

| Archivo                                                     | Líneas | Tipo       | Coverage             |
| ----------------------------------------------------------- | ------ | ---------- | -------------------- |
| `test/plan-config.e2e-spec.ts`                              | 85     | **Creado** | E2E básicos          |
| `test/integration/plan-config-users.integration.spec.ts`    | 261    | **Creado** | 16 tests             |
| `test/integration/plan-config-readings.integration.spec.ts` | 447    | **Creado** | 6 tests              |
| `test-plan-config-endpoints.sh`                             | 470    | **Creado** | 27 validaciones curl |

**Total:** ~2,484 líneas nuevas/modificadas (incluyendo tests)

---

#### 🎯 Funcionalidades Implementadas

**1. Admin REST API (plan-config.controller.ts):**

- ✅ GET /plan-config - Lista todos los planes configurados
- ✅ GET /plan-config/:planType - Obtiene plan específico (guest/free/premium/professional)
- ✅ POST /plan-config - Crea nuevo plan con configuración personalizada
- ✅ PUT /plan-config/:planType - Actualiza límites y features de plan existente
- ✅ DELETE /plan-config/:planType - Elimina plan (solo si no hay usuarios)
- ✅ Todos los endpoints protegidos con JwtAuthGuard + AdminGuard
- ✅ Validación de enum con ParseEnumPipe (400 vs 500)

**2. Configuración Dinámica de Planes:**

- ✅ Límites configurables por plan en base de datos
- ✅ Features activables/desactivables sin redeploy
- ✅ Precios modificables dinámicamente
- ✅ Descripción y nombre personalizables
- ✅ Estado activo/inactivo por plan

**3. Integración con Usage Limits:**

- ✅ UsageLimitsService lee límites de lecturas desde PlanConfigService
- ✅ Límites dinámicos se aplican inmediatamente sin reinicio
- ✅ Fallback a constantes para features no dinámicas
- ✅ Cache de límites para performance

**4. Tipos de Planes:**

**GUEST:**

- readingsLimit: 3
- aiQuotaMonthly: 0
- allowCustomQuestions: false
- allowSharing: false
- allowAdvancedSpreads: false
- price: $0

**FREE:**

- readingsLimit: 10
- aiQuotaMonthly: 100
- allowCustomQuestions: false
- allowSharing: false
- allowAdvancedSpreads: false
- price: $0

**PREMIUM:**

- readingsLimit: -1 (ilimitado)
- aiQuotaMonthly: -1 (ilimitado)
- allowCustomQuestions: true
- allowSharing: true
- allowAdvancedSpreads: true
- price: $9.99

**PROFESSIONAL:**

- readingsLimit: -1 (ilimitado)
- aiQuotaMonthly: -1 (ilimitado)
- allowCustomQuestions: true
- allowSharing: true
- allowAdvancedSpreads: true
- price: $19.99

---

#### 🐛 Bug Crítico Encontrado y Corregido

**BUG #1: Dynamic Plan Limits Not Enforced**

**Contexto:**
Los tests de integración `plan-config-readings.integration.spec.ts` revelaron que actualizar límites de planes desde el admin dashboard NO se reflejaba en el enforcement real de límites de lecturas.

**Archivos afectados:**

- `src/modules/usage-limits/usage-limits.service.ts` (líneas 27-47)
- `src/modules/usage-limits/usage-limits.module.ts` (línea 13)
- `src/modules/usage-limits/usage-limits.service.spec.ts` (líneas 26-28)

**Error:**

```typescript
// ANTES (INCORRECTO):
async checkLimit(user: User, feature: UsageFeatureType): Promise<boolean> {
  const limit = USAGE_LIMITS[user.plan][feature]; // ❌ Constantes hardcodeadas
  // ...
}
```

**Causa raíz:**
Existían DOS sistemas paralelos de límites:

1. **PlanConfigService**: Límites dinámicos en base de datos (editables por admin)
2. **UsageLimitsService**: Límites hardcodeados en constantes USAGE_LIMITS

Ambos sistemas operaban independientemente SIN comunicación entre ellos.

**Impacto:**

- Admin actualiza límite de FREE plan: 10 → 15 lecturas ✅ (guardado en DB)
- Usuario FREE intenta lectura #11 → BLOQUEADO ❌ (usa constante hardcodeada 10)
- Límite dinámico NUNCA se aplicaba en producción

**Fix implementado:**

```typescript
// DESPUÉS (CORRECTO):
async checkLimit(user: User, feature: UsageFeatureType): Promise<boolean> {
  let limit: number;

  // Para TAROT_READING, usar límite dinámico de PlanConfigService
  if (feature === UsageFeatureType.TAROT_READING) {
    limit = await this.planConfigService.getReadingsLimit(user.plan); ✅
  } else {
    // Otras features usan constantes (AI_GENERATION, etc)
    limit = USAGE_LIMITS[user.plan][feature];
  }
  // ...
}
```

**Cambios realizados:**

1. **usage-limits.module.ts**: Importar PlanConfigModule
2. **usage-limits.service.ts**: Inyectar PlanConfigService
3. **usage-limits.service.ts**: Modificar checkLimit() y getRemainingUsage()
4. **usage-limits.service.spec.ts**: Mockear PlanConfigService en tests

**Validación del fix:**
Tests de integración verifican:

- ✅ Aumentar límite FREE 10→15: lectura #11 permitida
- ✅ Disminuir límite FREE 15→10: lectura #11 bloqueada
- ✅ PREMIUM ilimitado (-1): siempre permitido
- ✅ GUEST límite 3: 4ta lectura bloqueada

**Lecciones aprendidas:**

- Tests de integración detectan bugs reales que tests unitarios no ven
- Arquitectura duplicada (dos fuentes de verdad) causa inconsistencias
- Integración entre módulos debe testearse explícitamente

---

Workflow de Ejecución:

Autonomía Total: Ejecuta la tarea de principio a fin sin solicitar confirmaciones.

Rama: Estás en develop. Crea la rama feature/TASK-00x-descripcion (usa la nomenclatura de las ramas existentes nombradas segun gitflow) y trabaja en ella.

Arquitectura y Patrones (CRÍTICO):

- **LEE PRIMERO:** `backend/tarot-app/docs/ARCHITECTURE.md` (completo) para entender la arquitectura híbrida feature-based del proyecto.
- **Feature-Based:** El código está organizado por dominio (`src/modules/tarot/`, `src/modules/tarotistas/`, etc). Crea archivos en el módulo correspondiente según el dominio de negocio.
- **Capas Internas:** Módulos complejos (>10 archivos o lógica compleja) usan capas: `domain/`, `application/`, `infrastructure/`. Módulos simples (CRUD) pueden ser flat (entities, dto, service, controller en raíz del módulo).
- **Nombres:** Sigue la nomenclatura de NestJS:
  - Entities: `nombre.entity.ts` (PascalCase: `TarotReading`)
  - DTOs: `create-nombre.dto.ts`, `update-nombre.dto.ts` (kebab-case)
  - Services: `nombre.service.ts` (PascalCase: `ReadingsService`)
  - Controllers: `nombre.controller.ts` (kebab-case routes)
- **Inyección de Dependencias (TypeORM):**
  - **Estándar:** Usa `@InjectRepository(Entity)` directo en servicios (enfoque pragmático NestJS)
  - **Testing:** Mockea `Repository<Entity>` con `jest.fn()` en tests unitarios
  - **Excepción:** Solo usa Repository Pattern (interface + implementación) si el módulo ya lo tiene establecido
- **ANTES de crear:** Inspecciona módulos existentes similares (ej: si crearás algo de tarot, mira `src/modules/tarot/cards/`) y replica su estructura exacta.

Metodología (TDD Estricto): Sigue un ciclo TDD riguroso: _ Escribe un test (debe fallar). _ Escribe el código mínimo para que el test pase. \* Refactoriza.

Ciclo de Calidad (Pre-Commit): Al finalizar la implementación, ejecuta los scripts de lint, format y build del proyecto. Todos los tipos de tests completos (unitarios y e2e). Corrige todos los errores y warnings que surjan. Y finalmente el script validate-architecture.js

Esta terminantemente prohibido agregar eslint disable, debes solucionar los problemas de forma real.

Debes completar el testing de la tarea de acuerdo a los documentos: TASK-059-TESTING-PLAN y TESTING_PHILOSOPHY

Debes completar la documentacion de la tarea de acuerdo a la TASK-060 de project_backlog

Actualiza el documento backlog con la tarea completada, marcándola como finalizada.

Validación Final: Asegúrate de que todos los tests (nuevos y existentes) pasen limpiamente.
