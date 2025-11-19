# TASK-059: Plan de Testing Suite Completo - Subtareas

## Contexto

TASK-059 es demasiado extensa para completarse en un solo commit. Este documento divide la tarea en subtareas manejables, organizadas por tipo de test y complejidad. **Cada subtarea representa un commit independiente.**

---

## Estado Actual (Coverage: 39.49%)

### ✅ Ya Completado (Commits 1-5)

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

---

## 🔴 Subtareas Pendientes

### Fase 1: Tests Unitarios de Servicios Críticos (Target: >80% coverage)

#### SUBTASK-4: ReadingValidatorService Unit Tests

**Prioridad:** CRÍTICA  
**Estimación:** 2-3 horas  
**Coverage actual:** Desconocido

**Tareas:**

- Investigar código de `ReadingValidatorService` antes de escribir tests
- Buscar bugs en validaciones de:
  - Spread validation
  - Card count validation
  - Position validation
  - Question format validation
- Escribir tests que fallen si hay bugs
- Corregir bugs encontrados
- Target: >80% coverage

**Criterios:**

- Tests pasando
- Coverage >80%
- Bugs documentados (si se encuentran)
- 1 commit al completar

---

#### SUBTASK-5: TypeOrmReadingRepository Unit Tests

**Prioridad:** CRÍTICA  
**Estimación:** 3-4 horas  
**Coverage actual:** 0%

**Tareas:**

- Investigar código del repositorio
- Buscar bugs en:
  - Query construction
  - Transaction handling
  - Error handling
  - Pagination logic
  - Filtering logic
- Mockear TypeORM QueryBuilder
- Tests de casos edge: empty results, DB errors, invalid filters
- Target: >80% coverage

**Criterios:**

- Tests pasando
- Coverage >80%
- Mocks correctos de TypeORM
- 1 commit al completar

---

#### SUBTASK-6: AuthService Unit Tests

**Prioridad:** CRÍTICA  
**Estimación:** 3-4 horas  
**Coverage actual:** Desconocido

**Tareas:**

- Investigar AuthService code
- Buscar bugs en:
  - Password hashing
  - Token generation/validation
  - Login logic
  - Register logic
  - Refresh token flow
- Tests de seguridad:
  - SQL injection attempts
  - XSS in credentials
  - Token expiry edge cases
- Target: >80% coverage

**Criterios:**

- Tests pasando
- Coverage >80%
- Security edge cases covered
- 1 commit al completar

---

#### SUBTASK-7: TarotService Unit Tests

**Prioridad:** CRÍTICA  
**Estimación:** 2-3 horas  
**Coverage actual:** Desconocido

**Tareas:**

- Investigar TarotService code
- Buscar bugs en:
  - Card selection algorithm
  - Shuffle logic
  - Duplicate card prevention
  - Spread loading
- Tests matemáticos:
  - Distribución aleatoria correcta
  - No duplicados
  - Todas las cartas representadas
- Target: >80% coverage

**Criterios:**

- Tests pasando
- Coverage >80%
- Algoritmo validado matemáticamente
- 1 commit al completar

---

#### SUBTASK-8: UsageLimitsService Unit Tests

**Prioridad:** CRÍTICA  
**Estimación:** 2-3 horas  
**Coverage actual:** Desconocido

**Tareas:**

- Investigar UsageLimitsService code
- Buscar bugs en:
  - Limit checking logic
  - Increment logic
  - Reset logic (daily/monthly)
  - Premium vs free logic
- Tests de edge cases:
  - Límite exacto
  - Overflow attempts
  - Timezone edge cases
- Target: >80% coverage

**Criterios:**

- Tests pasando
- Coverage >80%
- Límites funcionan correctamente
- 1 commit al completar

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

### Sprint 2 (Alta Prioridad - Target: 70% coverage)

6. SUBTASK-9: Guards
7. SUBTASK-12: Use Cases Parte 1
8. SUBTASK-13: Use Cases Parte 2
9. SUBTASK-16: OpenAI Provider

### Sprint 3 (E2E - Target: 75% coverage)

10. SUBTASK-18: E2E Free User
11. SUBTASK-19: E2E Premium User
12. SUBTASK-21: E2E Error Scenarios
13. SUBTASK-24: External Services Mocking

### Sprint 4 (Completar - Target: 80%+ coverage)

14. SUBTASK-10: Pipes & Interceptors
15. SUBTASK-11: Cache Services
16. SUBTASK-14: Controllers Parte 1
17. SUBTASK-15: Controllers Parte 2
18. SUBTASK-17: AI Fallback
19. SUBTASK-22: Performance Critical
20. SUBTASK-26: Coverage Thresholds

### Sprint 5 (Pulir - Target: 85%+ coverage)

21. SUBTASK-20: E2E Admin
22. SUBTASK-23: Performance DB
23. SUBTASK-25: Fixtures Expansion
24. SUBTASK-27: Watch Mode

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

### Última Actualización: 2025-01-XX

- **Coverage Actual:** 39.49%
- **Subtareas Completadas:** 6/27 (22%)
- **Bugs Encontrados:** 9
- **Tests Totales:** 1058 passing

---

## Referencias

- **Filosofía:** `docs/TESTING_PHILOSOPHY.md`
- **Guía Completa:** `docs/TESTING.md`
- **Backlog Principal:** `docs/project_backlog.md` (TASK-059)
- **Branch:** `feature/TASK-059-testing-suite-completo`
