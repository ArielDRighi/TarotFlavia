# TASK-059: Plan de Testing Suite Completo - Subtareas

## Contexto

TASK-059 es demasiado extensa para completarse en un solo commit. Este documento divide la tarea en subtareas manejables, organizadas por tipo de test y complejidad. **Cada subtarea representa un commit independiente.**

---

## Estado Actual (Coverage: ~42%)

### ✅ Ya Completado (Commits 1-14)

#### SUBTASK-0: Documentación Base

- ✅ `docs/TESTING_PHILOSOPHY.md`: Filosofía obligatoria de testing (buscar bugs reales)
- ✅ `docs/TESTING.md`: Guía completa de testing (745 líneas)
- 📝 Commit: "docs: add comprehensive testing guides (TESTING_PHILOSOPHY + TESTING.md)"

#### SUBTASK-1: Infraestructura de Testing

- ✅ DB de pruebas: `tarot_test` configurada
- ✅ Factories: user.factory, reading.factory, card.factory, spread.factory
- ✅ Setup/teardown automático
- ✅ Coverage configuration
- 📝 Commit: Infraestructura ya existente

#### SUBTASK-2A: Tests de Integración - Auth Flow

- ✅ 15/16 tests pasando
- ✅ Email normalization tests
- ⚠️ 1 test skipped (ban endpoint no implementado)
- 📝 Commit: Realizado previamente

#### SUBTASK-2B: Tests de Integración - Reading Creation

- ✅ 16/16 tests pasando
- ✅ **4 bugs encontrados y corregidos** en producción
- 📝 Commit: "test: add integration tests for reading creation flow + fix 4 bugs"

#### SUBTASK-3A: Unit Tests - InterpretationsService

- ✅ 16/16 tests pasando
- ✅ **5 bugs encontrados y corregidos**:
  1. Empty cards array validation
  2. Negative tarotistaId validation
  3. Zero tarotistaId validation
  4. Daily card error propagation
  5. Output sanitization before caching
- ✅ Coverage: 67% → 85%+
- 📝 Commit: "test: add unit tests for InterpretationsService + fix 5 bugs"

#### SUBTASK-3B: Unit Tests - UsersService

- ✅ 33/33 tests pasando
- ✅ **0 bugs encontrados** (código ya correcto)
- ✅ Tests verifican: Email normalization, SQL injection prevention, null handling
- ✅ Coverage: 58% → 84%
- 📝 Commit: "test: add comprehensive unit tests for UsersService (verified correct behavior)"

#### SUBTASK-4: ReadingValidatorService Unit Tests

- ✅ 28/28 tests pasando
- ✅ **3 bugs encontrados y corregidos**:
  1. Missing spread.positions null check
  2. Missing user null validation
  3. Missing reading null validation
- ✅ Coverage: 0% → 100% statements/functions/lines
- 📝 Commit: "test: add ReadingValidatorService unit tests + fix 3 bugs"

#### SUBTASK-5: TypeOrmReadingRepository Unit Tests

- ✅ 36/36 tests pasando
- ✅ **4 CRITICAL bugs encontrados y corregidos**:
  1. Missing null check in findById (TypeError crash)
  2. Missing null check in update (TypeError crash)
  3. Missing null check in softDelete (TypeError crash)
  4. Missing null check in restore (TypeError crash)
- ✅ Coverage: 0% → 97.22% (lines), 88.88% (branches)
- 📝 Commit: "test: add TypeOrmReadingRepository unit tests + fix 4 CRITICAL bugs"

#### SUBTASK-6: AuthService Unit Tests

- ✅ 30/30 tests pasando
- ✅ **3 bugs encontrados y corregidos**:
  1. BUG #17 (CRITICAL): User banned check missing in login flow
  2. BUG #18 (HIGH): Password comparison happens before ban check (timing attack)
  3. BUG #19 (HIGH): Missing lastLogin timestamp update
- ✅ Coverage: 0% → 100% statements/functions/lines
- 📝 Commit: "test: add AuthService comprehensive unit tests + fix 3 security bugs"

#### SUBTASK-7: ReadingsOrchestratorService Unit Tests

- ✅ 41/41 tests pasando
- ✅ **0 bugs encontrados** (architecture correctly delegates validation)
- ✅ Coverage: 21 → 41 tests (20 edge cases added)
- ✅ Branch coverage: 33.33% (correct for delegation pattern)
- 📝 Commit: "test: add ReadingsOrchestratorService comprehensive tests (verified correct delegation)"

#### SUBTASK-8: Use Cases Unit Tests (EN PROGRESO - 5/7 completados)

**GetReadingUseCase:**

- ✅ 13/13 tests pasando
- ✅ **0 bugs** (correct implementation)
- ✅ Coverage: Expected 100%

**DeleteReadingUseCase:**

- ✅ 11/11 tests pasando
- ✅ **0 bugs** (correct implementation)
- ✅ Coverage: Expected 100%

**RestoreReadingUseCase:**

- ✅ 13/13 tests pasando
- ✅ **0 bugs** (correct implementation)
- ✅ Coverage: Expected 100%

**CreateReadingUseCase:**

- ✅ 19/19 tests pasando
- ✅ **2 CRITICAL bugs encontrados y corregidos**:
  1. BUG #20 (CRITICAL): Missing user null validation (TypeError crash)
  2. BUG #21 (CRITICAL): Missing predefinedQuestion null validation (TypeError crash)
- ✅ Coverage: Expected 100%

**ShareReadingUseCase:**

- ✅ 14/14 tests pasando
- ✅ **0 bugs** (correct implementation)
- ✅ Coverage: Expected 100%

**ListReadingsUseCase:** ⏳ PENDIENTE (64 líneas, paginación)

**RegenerateReadingUseCase:** ⏳ PENDIENTE (123 líneas, AI + límites)

**Subtotal SUBTASK-8:**

- Tests completados: 70/~90 esperados (78%)
- Bugs encontrados: 2 CRITICAL
- 📝 Commits parciales: 4 commits realizados

---

## 🔴 Subtareas Pendientes

### Fase 1: Tests Unitarios de Servicios Críticos (Target: >80% coverage)

#### ~~SUBTASK-4: ReadingValidatorService Unit Tests~~ ✅ COMPLETADO

**Estado:** ✅ COMPLETADO  
**Tests:** 28 passing  
**Coverage:** 100% statements/functions/lines  
**Bugs:** 3 corregidos

---

#### ~~SUBTASK-5: TypeOrmReadingRepository Unit Tests~~ ✅ COMPLETADO

**Estado:** ✅ COMPLETADO  
**Tests:** 36 passing  
**Coverage:** 97.22% lines, 88.88% branches  
**Bugs:** 4 CRITICAL corregidos

---

#### ~~SUBTASK-6: AuthService Unit Tests~~ ✅ COMPLETADO

**Estado:** ✅ COMPLETADO  
**Tests:** 30 passing  
**Coverage:** 100% statements/functions/lines  
**Bugs:** 3 security bugs (1 CRITICAL, 2 HIGH)

---

#### SUBTASK-7: ~~TarotService~~ ReadingsOrchestratorService Unit Tests ✅ COMPLETADO

**Estado:** ✅ COMPLETADO  
**Tests:** 41 passing  
**Coverage:** 100% statements/functions/lines, 33.33% branches (correct)  
**Bugs:** 0 (correct delegation architecture)

---

#### SUBTASK-8: Use Cases Unit Tests - Readings Module 🔄 EN PROGRESO (71%)

**Prioridad:** CRÍTICA  
**Estimación:** 4-6 horas  
**Coverage actual:** ~23% → ~60% (estimado)  
**Estado:** 5/7 use cases completados

**Tareas:**

- ✅ GetReadingUseCase tests (13 tests, 0 bugs)
- ✅ DeleteReadingUseCase tests (11 tests, 0 bugs)
- ✅ RestoreReadingUseCase tests (13 tests, 0 bugs)
- ✅ CreateReadingUseCase tests (19 tests, 2 CRITICAL bugs)
- ✅ ShareReadingUseCase tests (14 tests, 0 bugs)
- ⏳ ListReadingsUseCase tests (PENDIENTE)
- ⏳ RegenerateReadingUseCase tests (PENDIENTE)

**Criterios:**

- Tests pasando: 70/~90 (78%)
- Coverage objetivo: >80% para todos los use cases
- Bugs encontrados: 2 CRITICAL
- Commits parciales: 4 realizados

---

#### ~~SUBTASK-9: UsageLimitsService Unit Tests~~

**NOTA:** Renombrado a SUBTASK-8 (Use Cases). UsageLimitsService será parte de otra fase.

---

### Fase 2: Tests Unitarios de Infraestructura

#### SUBTASK-9: Guards Unit Tests

**Prioridad:** ALTA  
**Estimación:** 2-3 horas

**Tareas:**

- RolesGuard tests
- UsageLimitGuard tests
- AuthGuard tests (si custom)
- Tests de edge cases:
  - Missing headers
  - Invalid tokens
  - Expired tokens
  - Role mismatches

**Criterios:**

- Todos los guards >80% coverage
- Security edge cases covered
- 1 commit al completar

---

#### SUBTASK-10: Pipes & Interceptors Unit Tests

**Prioridad:** MEDIA  
**Estimación:** 2 horas

**Tareas:**

- ValidationPipe tests (si custom)
- TransformInterceptor tests
- LoggingInterceptor tests
- CacheInterceptor tests
- Tests de transformaciones correctas

**Criterios:**

- Pipes/Interceptors >80% coverage
- Transformaciones validadas
- 1 commit al completar

---

#### SUBTASK-11: Cache Services Unit Tests

**Prioridad:** MEDIA  
**Estimación:** 2-3 horas

**Tareas:**

- CacheService unit tests
- Mockear Redis
- Tests de:
  - Set/Get/Delete operations
  - TTL correctness
  - Cache invalidation
  - Error handling cuando Redis falla

**Criterios:**

- CacheService >80% coverage
- Redis mocks correctos
- 1 commit al completar

---

### Fase 3: Tests de Use Cases

#### SUBTASK-12: Use Cases Unit Tests (Parte 1)

**Prioridad:** ALTA  
**Estimación:** 3-4 horas  
**Coverage actual:** ~23%

**Tareas:**

- CreateReadingUseCase tests (ampliar existentes)
- GetReadingUseCase tests
- ListReadingsUseCase tests
- Buscar bugs en orquestación de servicios
- Tests de casos complejos

**Criterios:**

- Use cases >80% coverage
- Orquestación validada
- 1 commit al completar

---

#### SUBTASK-13: Use Cases Unit Tests (Parte 2)

**Prioridad:** ALTA  
**Estimación:** 3-4 horas

**Tareas:**

- RegenerateInterpretationUseCase tests
- DeleteReadingUseCase tests
- UpdateReadingUseCase tests (si existe)
- Tests de transacciones
- Tests de rollback scenarios

**Criterios:**

- Use cases >80% coverage
- Transacciones validadas
- 1 commit al completar

---

### Fase 4: Tests de Controllers

#### SUBTASK-14: Controllers Unit Tests (Parte 1)

**Prioridad:** MEDIA  
**Estimación:** 3 horas  
**Coverage actual:** ~48%

**Tareas:**

- AuthController tests
- UsersController tests
- Tests de:
  - Request validation
  - Response formatting
  - Error handling
  - DTO transformations

**Criterios:**

- Controllers >80% coverage
- DTOs validados
- 1 commit al completar

---

#### SUBTASK-15: Controllers Unit Tests (Parte 2)

**Prioridad:** MEDIA  
**Estimación:** 3 horas

**Tareas:**

- ReadingsController tests
- InterpretationsController tests
- AdminController tests (si existe)
- Tests de permisos
- Tests de paginación

**Criterios:**

- Controllers >80% coverage
- Permisos validados
- 1 commit al completar

---

### Fase 5: Tests de AI Providers

#### SUBTASK-16: OpenAI Provider Unit Tests

**Prioridad:** ALTA  
**Estimación:** 3-4 horas

**Tareas:**

- Mockear OpenAI SDK
- Tests de prompt generation
- Tests de response parsing
- Tests de error handling:
  - API down
  - Rate limits
  - Invalid responses
  - Timeout scenarios

**Criterios:**

- AI Provider >80% coverage
- Mocks correctos
- Error scenarios covered
- 1 commit al completar

---

#### SUBTASK-17: AI Provider Fallback Tests

**Prioridad:** MEDIA  
**Estimación:** 2 horas

**Tareas:**

- Tests de fallback logic (si existe)
- Tests de retry mechanism
- Tests de circuit breaker (si existe)
- Tests de degraded mode

**Criterios:**

- Fallback logic validada
- Resilience patterns tested
- 1 commit al completar

---

### Fase 6: Tests E2E de User Journeys

#### SUBTASK-18: E2E - Free User Journey

**Prioridad:** CRÍTICA  
**Estimación:** 3-4 horas

**Tareas:**

- Flujo completo:
  1. Register
  2. Login
  3. Create reading (1st)
  4. Create reading (2nd)
  5. Create reading (3rd - alcanzar límite)
  6. Verify limit exceeded error
- Tests de edge cases:
  - Concurrent requests
  - Session expiry mid-flow

**Criterios:**

- Flujo completo funcional
- Límites respetados
- Errors manejados correctamente
- 1 commit al completar

---

#### SUBTASK-19: E2E - Premium User Journey

**Prioridad:** CRÍTICA  
**Estimación:** 3-4 horas

**Tareas:**

- Flujo completo:
  1. Register
  2. Upgrade to premium (mock payment)
  3. Create multiple readings (>3)
  4. Regenerate interpretation
  5. Access premium features
- Tests de:
  - Unlimited readings
  - Regeneration works
  - Premium-only features

**Criterios:**

- Flujo premium funcional
- Features exclusivos validados
- 1 commit al completar

---

#### SUBTASK-20: E2E - Admin User Journey

**Prioridad:** MEDIA  
**Estimación:** 2-3 horas

**Tareas:**

- Flujo completo:
  1. Login as admin
  2. List users
  3. Ban user
  4. Unban user
  5. View analytics (si existe)
- Tests de permisos:
  - Non-admin cannot access
  - Admin CRUD operations work

**Criterios:**

- Admin operations functional
- Permisos correctos
- 1 commit al completar

---

#### SUBTASK-21: E2E - Error Scenarios

**Prioridad:** ALTA  
**Estimación:** 2-3 horas

**Tareas:**

- Tests de escenarios de error:
  - Invalid credentials
  - Expired tokens
  - Missing required fields
  - Invalid data formats
  - Concurrent modification conflicts
- Verificar error responses correctos
- Verificar rollbacks funcionan

**Criterios:**

- Error handling validado
- Rollbacks verificados
- 1 commit al completar

---

### Fase 7: Tests de Performance

#### SUBTASK-22: Performance Tests - Critical Endpoints

**Prioridad:** MEDIA  
**Estimación:** 3 horas

**Tareas:**

- Test de performance para:
  - POST /readings (target: <15s)
  - GET /readings (target: <500ms)
  - POST /auth/login (target: <2s)
- Tests de carga:
  - 10 usuarios concurrentes
  - 50 usuarios concurrentes
- Identificar bottlenecks

**Criterios:**

- Endpoints cumplen targets
- Bottlenecks documentados
- 1 commit al completar

---

#### SUBTASK-23: Performance Tests - Database Queries

**Prioridad:** BAJA  
**Estimación:** 2 horas

**Tareas:**

- Tests de queries lentos
- Tests de N+1 problems
- Tests de índices correctos
- Query analysis

**Criterios:**

- No N+1 problems
- Queries optimizados
- 1 commit al completar

---

### Fase 8: Tests de Fixtures & Mocks

#### SUBTASK-24: External Services Mocking

**Prioridad:** ALTA  
**Estimación:** 2-3 horas

**Tareas:**

- Mockear OpenAI API completamente
- Mockear Email Service
- Mockear Payment Gateway (si existe)
- Tests que usan mocks NO llaman servicios reales
- Documentar cómo crear nuevos mocks

**Criterios:**

- Todos los servicios externos mockeados
- No llamadas reales en tests
- Documentación clara
- 1 commit al completar

---

#### SUBTASK-25: Test Fixtures & Factories Expansion

**Prioridad:** MEDIA  
**Estimación:** 2 horas

**Tareas:**

- Crear fixtures adicionales:
  - Admin users
  - Premium users
  - Banned users
  - Multiple spreads
  - Edge case readings
- Documentar uso de fixtures

**Criterios:**

- Fixtures completos
- Fácil de usar
- Documentados
- 1 commit al completar

---

### Fase 9: Coverage & Reporting

#### SUBTASK-26: Coverage Configuration & Thresholds

**Prioridad:** MEDIA  
**Estimación:** 1-2 horas

**Tareas:**

- Configurar coverage thresholds en Jest:
  - Global: 80% lines, 70% branches
  - Per-file: 75% lines, 65% branches
- HTML reports
- JSON reports para CI
- Configurar `npm run test:coverage`

**Criterios:**

- Thresholds configurados
- Reports generados
- Script funcional
- 1 commit al completar

---

#### SUBTASK-27: Test Watch Mode & Developer Experience

**Prioridad:** BAJA  
**Estimación:** 1 hora

**Tareas:**

- Configurar `npm run test:watch`
- Configurar `npm run test:debug`
- Optimizar velocidad de tests
- Documentar workflows de desarrollo

**Criterios:**

- Scripts funcionan
- Tests rápidos (<5 min total)
- Documentado en TESTING.md
- 1 commit al completar

---

## Resumen de Fases

| Fase                               | Subtareas               | Estimación Total | Prioridad    |
| ---------------------------------- | ----------------------- | ---------------- | ------------ |
| ✅ Completado                      | SUBTASK-0 a SUBTASK-3B  | ~16 horas        | CRÍTICA      |
| 1. Unit Tests - Servicios Críticos | SUBTASK-4 a SUBTASK-8   | 12-17 horas      | CRÍTICA      |
| 2. Unit Tests - Infraestructura    | SUBTASK-9 a SUBTASK-11  | 6-8 horas        | ALTA/MEDIA   |
| 3. Use Cases                       | SUBTASK-12 a SUBTASK-13 | 6-8 horas        | ALTA         |
| 4. Controllers                     | SUBTASK-14 a SUBTASK-15 | 6 horas          | MEDIA        |
| 5. AI Providers                    | SUBTASK-16 a SUBTASK-17 | 5-6 horas        | ALTA/MEDIA   |
| 6. E2E User Journeys               | SUBTASK-18 a SUBTASK-21 | 10-14 horas      | CRÍTICA/ALTA |
| 7. Performance                     | SUBTASK-22 a SUBTASK-23 | 5 horas          | MEDIA/BAJA   |
| 8. Fixtures & Mocks                | SUBTASK-24 a SUBTASK-25 | 4-5 horas        | ALTA/MEDIA   |
| 9. Coverage & Tooling              | SUBTASK-26 a SUBTASK-27 | 2-3 horas        | MEDIA/BAJA   |
| **TOTAL**                          | **27 subtareas**        | **56-77 horas**  | -            |

---

## Orden Recomendado de Ejecución

### Sprint 1 (Crítico - Target: 60% coverage)

1. SUBTASK-4: ReadingValidatorService
2. SUBTASK-5: TypeOrmReadingRepository
3. SUBTASK-6: AuthService
4. SUBTASK-7: TarotService
5. SUBTASK-8: UsageLimitsService

**Ciclo de Calidad (Pre-Commit):** Al finalizar Sprint 1, ejecutar:

```bash
npm run lint && npm run format && npm run build
npm test && npm run test:e2e
node scripts/validate-architecture.js
```

Corregir todos los errores y warnings antes de continuar.

---

### Sprint 2 (Alta Prioridad - Target: 70% coverage)

6. SUBTASK-9: Guards
7. SUBTASK-12: Use Cases Parte 1
8. SUBTASK-13: Use Cases Parte 2
9. SUBTASK-16: OpenAI Provider

**Ciclo de Calidad (Pre-Commit):** Al finalizar Sprint 2, ejecutar:

```bash
npm run lint && npm run format && npm run build
npm test && npm run test:e2e
node scripts/validate-architecture.js
```

Corregir todos los errores y warnings antes de continuar.

---

### Sprint 3 (E2E - Target: 75% coverage)

10. SUBTASK-18: E2E Free User
11. SUBTASK-19: E2E Premium User
12. SUBTASK-21: E2E Error Scenarios
13. SUBTASK-24: External Services Mocking

**Ciclo de Calidad (Pre-Commit):** Al finalizar Sprint 3, ejecutar:

```bash
npm run lint && npm run format && npm run build
npm test && npm run test:e2e
node scripts/validate-architecture.js
```

Corregir todos los errores y warnings antes de continuar.

---

### Sprint 4 (Completar - Target: 80%+ coverage)

14. SUBTASK-10: Pipes & Interceptors
15. SUBTASK-11: Cache Services
16. SUBTASK-14: Controllers Parte 1
17. SUBTASK-15: Controllers Parte 2
18. SUBTASK-17: AI Fallback
19. SUBTASK-22: Performance Critical
20. SUBTASK-26: Coverage Thresholds

**Ciclo de Calidad (Pre-Commit):** Al finalizar Sprint 4, ejecutar:

```bash
npm run lint && npm run format && npm run build
npm test && npm run test:e2e
node scripts/validate-architecture.js
```

Corregir todos los errores y warnings antes de continuar.

---

### Sprint 5 (Pulir - Target: 85%+ coverage)

21. SUBTASK-20: E2E Admin
22. SUBTASK-23: Performance DB
23. SUBTASK-25: Fixtures Expansion
24. SUBTASK-27: Watch Mode

**Ciclo de Calidad (Pre-Commit):** Al finalizar Sprint 5, ejecutar:

```bash
npm run lint && npm run format && npm run build
npm test && npm run test:e2e
node scripts/validate-architecture.js
```

Corregir todos los errores y warnings antes de continuar.

---

## Notas Importantes

### Filosofía Obligatoria (TESTING_PHILOSOPHY.md)

**CADA subtarea DEBE seguir:**

1. **Investigar código ANTES de escribir tests**
2. **Buscar bugs reales** (no escribir tests que siempre pasan)
3. **Escribir tests que fallen si hay bugs**
4. **Corregir bugs encontrados en producción**
5. **Documentar bugs en commit message**

### Commits

- **1 commit por subtarea completada**
- Formato: `test(scope): description + fix N bugs` o `test(scope): description (verified correct)`
- Ejemplo: `test(reading-validator): add unit tests + fix 3 validation bugs`
- Ejemplo: `test(users): add unit tests (verified correct behavior - 0 bugs)`

### Coverage Tracking

Después de cada subtarea:

```bash
npm run test:coverage
```

Verificar que coverage aumenta consistentemente.

### Bugs Encontrados Hasta Ahora

- **InterpretationsService:** 5 bugs
- **Reading Creation Flow:** 4 bugs
- **UsersService:** 0 bugs (código correcto)
- **TOTAL:** 9 bugs reales encontrados y corregidos

---

## Actualización de Estado

Actualizar esta sección después de completar cada subtarea:

### Última Actualización: 2025-01-19

- **Coverage Actual:** ~42% (estimado)
- **Subtareas Completadas:** 10.5/27 (39%) - SUBTASK-8 al 71%
- **Bugs Encontrados:** 21 (9 previos + 12 nuevos en esta sesión)
  - InterpretationsService: 5 bugs
  - Reading Creation Flow: 4 bugs
  - UsersService: 0 bugs
  - ReadingValidatorService: 3 bugs
  - TypeOrmReadingRepository: 4 CRITICAL bugs
  - AuthService: 3 security bugs (1 CRITICAL, 2 HIGH)
  - ReadingsOrchestratorService: 0 bugs
  - CreateReadingUseCase: 2 CRITICAL bugs
  - Other Use Cases: 0 bugs
- **Tests Totales:** ~1,269 passing (1,171 baseline + ~98 nuevos)

---

## Referencias

- **Filosofía:** `docs/TESTING_PHILOSOPHY.md`
- **Guía Completa:** `docs/TESTING.md`
- **Backlog Principal:** `docs/project_backlog.md` (TASK-059)
- **Branch:** `feature/TASK-059-testing-suite-completo`
