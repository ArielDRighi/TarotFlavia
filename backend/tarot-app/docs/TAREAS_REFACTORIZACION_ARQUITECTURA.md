# 🏗️ Tareas de Refactorización Arquitectural

**Fecha de creación:** 10 de Noviembre, 2025  
**Basado en:** ARQUITECTURA_ANALISIS.md  
**Objetivo:** Migrar progresivamente hacia una arquitectura enterprise-level siguiendo Clean Architecture y SOLID

---

## 📋 Contexto

Este documento contiene las tareas necesarias para refactorizar la arquitectura actual del backend hacia una estructura más escalable y mantenible. Las tareas están ordenadas según la **Estrategia Híbrida** recomendada en el análisis arquitectural.

**Estado actual:**

- ✅ Estructura modular NestJS funcional
- ❌ Módulo `interpretations` sobrecargado (19 archivos, múltiples responsabilidades)
- ❌ Services demasiado grandes (`readings.service.ts`: 720 líneas, `interpretations.service.ts`: 353 líneas)
- ❌ Falta de separación clara de capas (domain/application/infrastructure)

**Meta final:**

- Arquitectura enterprise-level con separación de capas
- Módulos cohesivos con responsabilidades únicas
- Services de <300 líneas
- Alta testabilidad y mantenibilidad

---

## 🎯 Fase 1: Quick Wins (Refactorización Incremental)

### **TASK-ARCH-001: Extraer Módulo `cache` Independiente** ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 2-3 días  
**Dependencias:** Ninguna  
**Marcador MVP:** ⭐⭐⭐ **CRÍTICO** - Primer paso de desacoplamiento

#### 📋 Descripción

Extraer toda la funcionalidad de cache del módulo `interpretations` hacia un módulo `CacheModule` independiente y reutilizable. Actualmente, el cache está mezclado con la lógica de interpretaciones, violando el principio de responsabilidad única.

**Archivos a mover desde `interpretations/`:**

- `cache-admin.controller.ts` → `cache/controllers/`
- `cache-cleanup.service.ts` → `cache/application/services/`
- `interpretation-cache.service.ts` → `cache/application/services/`
- `entities/cached-interpretation.entity.ts` → `cache/infrastructure/entities/`

#### ✅ Tareas específicas

**1. Crear estructura del módulo Cache:**

```
src/modules/cache/
├── domain/
│   ├── interfaces/
│   │   └── cache-repository.interface.ts    # Interface del repositorio
│   └── entities/
│       └── cache-entry.entity.ts             # Entidad de dominio
├── application/
│   ├── services/
│   │   ├── cache-manager.service.ts          # Orquestador principal
│   │   ├── cache-invalidation.service.ts     # Lógica de invalidación
│   │   └── cache-cleanup.service.ts          # Limpieza automática
│   └── dto/
│       ├── cache-stats.dto.ts
│       └── invalidate-cache.dto.ts
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-cache.repository.ts       # Implementación TypeORM
│   ├── controllers/
│   │   └── cache-admin.controller.ts         # Endpoints admin
│   └── entities/
│       └── cached-interpretation.entity.ts    # Entidad TypeORM
└── cache.module.ts
```

**2. Implementar interfaces de dominio:**

- [ ] Crear `ICacheRepository` con métodos:
  - `findByKey(key: string): Promise<CacheEntry | null>`
  - `save(entry: CacheEntry): Promise<CacheEntry>`
  - `invalidate(key: string): Promise<void>`
  - `invalidatePattern(pattern: string): Promise<void>`
  - `getStats(): Promise<CacheStats>`
  - `cleanup(olderThan: Date): Promise<number>`

**3. Migrar servicios existentes:**

- [ ] Mover `InterpretationCacheService` → `CacheManagerService`
- [ ] Refactorizar para usar `ICacheRepository` (inversión de dependencias)
- [ ] Mover `CacheCleanupService` sin cambios (ya está bien estructurado)
- [ ] Crear `CacheInvalidationService` con lógica de invalidación inteligente

**4. Migrar controller y endpoints:**

- [ ] Mover `CacheAdminController` a `infrastructure/controllers/`
- [ ] Actualizar rutas: `/admin/cache` → `/cache/admin`
- [ ] Mantener guards de autenticación y autorización
- [ ] Documentación Swagger actualizada

**5. Actualizar módulo de interpretaciones:**

- [ ] Importar `CacheModule` en `InterpretationsModule`
- [ ] Inyectar `CacheManagerService` en `InterpretationsService`
- [ ] Eliminar imports directos de entidades de cache
- [ ] Actualizar tests con nuevos imports

**6. Testing:**

- [ ] Tests unitarios de `CacheManagerService` (12+ tests)
- [ ] Tests unitarios de `CacheInvalidationService` (8+ tests)
- [ ] Tests de integración del repositorio (6+ tests)
- [ ] Tests E2E del controller admin (5+ tests)
- [ ] Verificar que todos los tests existentes sigan pasando

#### 🎯 Criterios de aceptación

- ✅ El módulo `CacheModule` es completamente independiente
- ✅ Puede ser reutilizado por otros módulos (readings, users, etc.)
- ✅ `InterpretationsModule` tiene 30% menos archivos
- ✅ Todos los tests pasan (unitarios, integración y E2E)
- ✅ La funcionalidad de cache sigue funcionando igual
- ✅ Separación clara de capas (domain/application/infrastructure)

#### 📝 Notas importantes

- **Beneficio inmediato:** Reduce complejidad de `interpretations` en 30%
- **Reutilización:** Otros módulos podrán usar el cache fácilmente
- **Testabilidad:** Cada capa se puede testear independientemente
- **Ubicación:** Crear en `src/modules/cache/` (NO dentro de interpretations)

---

### **TASK-ARCH-002: Extraer Módulo `ai` Independiente** ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 3-4 días  
**Dependencias:** TASK-ARCH-001  
**Marcador MVP:** ⭐⭐⭐ **CRÍTICO** - Centraliza toda la lógica de IA

#### 📋 Descripción

Extraer toda la funcionalidad relacionada con proveedores de IA hacia un módulo `AIModule` independiente y agnóstico del dominio. Actualmente, los providers de IA están mezclados con interpretaciones de tarot, pero deberían ser reutilizables para cualquier feature que necesite IA.

**Archivos a mover desde `interpretations/`:**

- `ai-provider.interface.ts` → `ai/domain/interfaces/`
- `ai-provider.service.ts` → `ai/application/services/`
- `prompt-builder.service.ts` → `ai/application/services/`
- `tarot-prompts.ts` → Mantener en `interpretations/` (específico del dominio)
- `providers/groq.provider.ts` → `ai/infrastructure/providers/`
- `providers/deepseek.provider.ts` → `ai/infrastructure/providers/`
- `providers/openai.provider.ts` → `ai/infrastructure/providers/`
- `errors/ai-error.types.ts` → `ai/domain/errors/`
- `errors/circuit-breaker.utils.ts` → `ai/infrastructure/resilience/`
- `errors/retry.utils.ts` → `ai/infrastructure/resilience/`

#### ✅ Tareas específicas

**1. Crear estructura del módulo AI:**

```
src/modules/ai/
├── domain/
│   ├── interfaces/
│   │   ├── ai-provider.interface.ts       # Interface principal
│   │   └── prompt-builder.interface.ts    # Interface para builders
│   ├── value-objects/
│   │   ├── ai-request.vo.ts
│   │   └── ai-response.vo.ts
│   └── errors/
│       ├── ai-error.types.ts
│       └── ai-exceptions.ts
├── application/
│   ├── services/
│   │   ├── ai-orchestrator.service.ts     # Coordina providers (antes ai-provider.service)
│   │   └── prompt-builder.service.ts      # Builder genérico
│   └── dto/
│       ├── ai-request.dto.ts
│       ├── ai-response.dto.ts
│       └── provider-config.dto.ts
├── infrastructure/
│   ├── providers/
│   │   ├── groq.provider.ts
│   │   ├── deepseek.provider.ts
│   │   ├── openai.provider.ts
│   │   └── gemini.provider.ts            # Preparado para futuro
│   ├── resilience/
│   │   ├── circuit-breaker.ts
│   │   ├── retry.strategy.ts
│   │   └── timeout.handler.ts
│   └── http/
│       └── ai-http.adapter.ts
└── ai.module.ts
```

**2. Implementar Value Objects de dominio:**

- [ ] Crear `AIRequest` con validaciones:
  - `prompt: string`
  - `systemMessage?: string`
  - `maxTokens: number`
  - `temperature: number`
  - `model?: string`
- [ ] Crear `AIResponse` con:
  - `content: string`
  - `tokensUsed: TokenUsage`
  - `provider: AIProvider`
  - `durationMs: number`
  - `cached: boolean`

**3. Refactorizar AIProviderService → AIOrchestrator:**

- [ ] Renombrar para reflejar su rol de coordinador
- [ ] Hacer agnóstico del dominio (no mencionar "tarot" o "interpretations")
- [ ] Recibir prompts como parámetros (no construirlos internamente)
- [ ] Mantener lógica de fallback (Groq → DeepSeek → OpenAI)

**4. Extraer PromptBuilder genérico:**

- [ ] Crear interface `IPromptBuilder<T>` genérica
- [ ] Implementación base con métodos comunes:
  - `buildSystemMessage(context: T): string`
  - `buildUserMessage(context: T): string`
  - `buildFullPrompt(context: T): AIRequest`
- [ ] Nota: Los prompts específicos de tarot quedan en `interpretations/`

**5. Migrar providers sin cambios:**

- [ ] Mover Groq, DeepSeek, OpenAI a `infrastructure/providers/`
- [ ] Asegurar que implementan `IAIProvider` correctamente
- [ ] Extraer configuraciones a `AIModule` (tokens, timeouts, etc.)

**6. Implementar patrones de resiliencia:**

- [ ] Mover circuit-breaker y retry a `infrastructure/resilience/`
- [ ] Implementar `CircuitBreakerService` reutilizable
- [ ] Implementar `RetryStrategyService` configurable por provider
- [ ] Agregar `TimeoutHandler` con timeouts por provider

**7. Actualizar módulo de interpretaciones:**

- [ ] Importar `AIModule` en `InterpretationsModule`
- [ ] Crear `TarotPromptBuilder implements IPromptBuilder<ReadingContext>`
- [ ] Mantener `tarot-prompts.ts` en interpretations (constantes específicas)
- [ ] `InterpretationsService` inyecta `AIOrchestrator` + `TarotPromptBuilder`
- [ ] Actualizar tests con nuevos imports

**8. Testing:**

- [ ] Tests unitarios de `AIOrchestrator` (15+ tests)
- [ ] Tests unitarios de cada provider (8+ tests por provider)
- [ ] Tests de `CircuitBreaker` (10+ tests)
- [ ] Tests de `RetryStrategy` (8+ tests)
- [ ] Tests de integración del módulo completo (12+ tests)
- [ ] Tests E2E verificando fallback automático (6+ tests)

#### 🎯 Criterios de aceptación

- ✅ El módulo `AIModule` es completamente independiente del dominio
- ✅ Puede ser reutilizado por cualquier módulo (interpretations, oracle, rituales)
- ✅ `InterpretationsModule` tiene 40% menos archivos
- ✅ La lógica de fallback funciona correctamente
- ✅ Circuit breaker previene cascadas de fallos
- ✅ Todos los tests pasan (unitarios, integración y E2E)
- ✅ Separación clara de capas (domain/application/infrastructure)

#### 📝 Notas importantes

- **Beneficio inmediato:** Reduce complejidad de `interpretations` en 40% adicional
- **Reutilización:** Oráculo, rituales y otras features pueden usar el mismo módulo
- **Escalabilidad:** Fácil agregar nuevos providers (Gemini, Claude, Llama local)
- **Resiliencia:** Circuit breaker y retry mejoran estabilidad
- **Ubicación:** Crear en `src/modules/ai/` (módulo transversal)

---

## 🎯 Fase 2: Refactorización Moderada

### **TASK-ARCH-003: Dividir `readings.service.ts` con Use Cases** ⭐⭐

**Prioridad:** 🟡 ALTA  
**Estimación:** 4-5 días  
**Dependencias:** TASK-ARCH-001, TASK-ARCH-002  
**Marcador MVP:** ⭐⭐ **NECESARIO** - Service demasiado grande (720 líneas)

#### 📋 Descripción

Dividir el service monolítico de `ReadingsService` (720 líneas) en múltiples use cases siguiendo el patrón CQRS. Cada operación de negocio debe tener su propio use case, haciendo el código más mantenible y testeable.

**Violaciones actuales:**

- Un service con 20+ métodos
- Múltiples responsabilidades (crear, regenerar, compartir, paginar, validar)
- Difícil de testear (muchos mocks necesarios)
- Violación del Single Responsibility Principle

#### ✅ Tareas específicas

**1. Crear estructura de use cases:**

```
src/modules/tarot/readings/
├── domain/
│   ├── entities/
│   │   └── reading.entity.ts              # Entidad de dominio pura
│   ├── repositories/
│   │   └── reading.repository.interface.ts
│   └── services/
│       ├── reading-validator.service.ts    # Validaciones de negocio
│       └── reading-domain.service.ts       # Lógica de dominio pura
├── application/
│   ├── use-cases/
│   │   ├── create-reading.use-case.ts
│   │   ├── regenerate-reading.use-case.ts
│   │   ├── share-reading.use-case.ts
│   │   ├── get-reading.use-case.ts
│   │   ├── list-user-readings.use-case.ts
│   │   └── delete-reading.use-case.ts
│   ├── services/
│   │   ├── reading-generator.service.ts    # Genera lecturas
│   │   └── reading-share.service.ts        # Lógica de compartir
│   └── dto/
│       └── (DTOs existentes)
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-reading.repository.ts   # Implementación TypeORM
│   ├── controllers/
│   │   ├── readings.controller.ts
│   │   └── share.controller.ts
│   └── entities/
│       └── tarot-reading.entity.ts         # Entidad TypeORM
└── readings.module.ts
```

**2. Implementar Repository Pattern:**

- [ ] Crear `IReadingRepository` interface con métodos:
  - `findById(id: string): Promise<Reading | null>`
  - `findByUser(userId: string, options): Promise<Reading[]>`
  - `save(reading: Reading): Promise<Reading>`
  - `update(id: string, data): Promise<Reading>`
  - `delete(id: string): Promise<void>`
  - `findByShareToken(token: string): Promise<Reading | null>`
- [ ] Implementar `TypeORMReadingRepository` que implementa la interface
- [ ] Inyectar interface en use cases (no implementación directa)

**3. Crear Use Cases (Commands):**

- [ ] **CreateReadingUseCase:**
  - Validar límites de uso
  - Validar pregunta (predefinida vs custom)
  - Seleccionar cartas random
  - Generar interpretación (delegar a InterpretationsService)
  - Guardar lectura
  - Máximo 100 líneas
- [ ] **RegenerateReadingUseCase:**
  - Validar ownership
  - Validar límites de regeneración
  - Regenerar interpretación
  - Actualizar lectura
  - Máximo 80 líneas
- [ ] **ShareReadingUseCase:**
  - Validar ownership
  - Generar token único
  - Enviar email
  - Actualizar lectura
  - Máximo 70 líneas
- [ ] **DeleteReadingUseCase:**
  - Validar ownership
  - Soft delete
  - Máximo 50 líneas

**4. Crear Use Cases (Queries):**

- [ ] **GetReadingUseCase:**
  - Buscar por ID
  - Validar ownership (excepto si es shared)
  - Retornar con relaciones
  - Máximo 60 líneas
- [ ] **ListUserReadingsUseCase:**
  - Paginar lecturas del usuario
  - Aplicar filtros (categoría, spread, fecha)
  - Ordenar por fecha
  - Máximo 80 líneas

**5. Extraer servicios de aplicación:**

- [ ] **ReadingGeneratorService:**
  - `selectRandomCards(spread, deck): Card[]`
  - `generateReading(user, dto): Reading`
  - Máximo 150 líneas
- [ ] **ReadingValidatorService:**
  - `validateUserCanCreateReading(user): void`
  - `validateQuestionType(user, dto): void`
  - `validateOwnership(user, reading): void`
  - Máximo 100 líneas
- [ ] **ReadingShareService:**
  - `generateShareToken(): string`
  - `sendShareEmail(reading, recipient): void`
  - Máximo 80 líneas

**6. Refactorizar controller:**

- [ ] `ReadingsController` llama a use cases (no a service gigante)
- [ ] Cada endpoint inyecta el use case específico que necesita
- [ ] Simplificar guards y validaciones (delegarlas a use cases)

**7. Testing:**

- [ ] Tests unitarios por cada use case (10+ tests por use case)
- [ ] Tests unitarios de servicios de aplicación (8+ tests por servicio)
- [ ] Tests del repository (mock de TypeORM)
- [ ] Tests de integración del módulo completo
- [ ] Tests E2E verificando que todo funciona igual

#### 🎯 Criterios de aceptación

- ✅ No existe ningún archivo de más de 300 líneas
- ✅ Cada use case tiene una responsabilidad única
- ✅ El controller es delgado (solo coordina)
- ✅ Repository Pattern implementado correctamente
- ✅ Todos los tests pasan (unitarios, integración y E2E)
- ✅ La funcionalidad sigue siendo idéntica para el usuario
- ✅ Coverage de tests >85%

#### 📝 Notas importantes

- **Beneficio principal:** Código mucho más mantenible y testeable
- **CQRS ligero:** Separar commands (modifican) de queries (solo leen)
- **Testing:** Cada use case se testea de forma aislada
- **Migración gradual:** Implementar use case por use case
- **No breaking changes:** La API pública no cambia

---

### **TASK-ARCH-004: Dividir `interpretations.service.ts` con Use Cases** ⭐⭐

**Prioridad:** 🟡 ALTA  
**Estimación:** 3-4 días  
**Dependencias:** TASK-ARCH-001, TASK-ARCH-002  
**Marcador MVP:** ⭐⭐ **NECESARIO** - Service demasiado grande (353 líneas)

#### 📋 Descripción

Dividir `InterpretationsService` (353 líneas) aplicando el mismo patrón de use cases que en TASK-ARCH-003. Después de extraer cache y AI, este service aún tiene múltiples responsabilidades que deben separarse.

**Responsabilidades actuales:**

- Generar interpretaciones
- Regenerar interpretaciones
- Gestionar caché
- Coordinar providers de IA
- Construir prompts
- Validar límites

#### ✅ Tareas específicas

**1. Crear estructura de use cases:**

```
src/modules/tarot/interpretations/
├── domain/
│   ├── entities/
│   │   └── interpretation.entity.ts       # Dominio puro
│   ├── repositories/
│   │   └── interpretation.repository.interface.ts
│   └── services/
│       └── interpretation-domain.service.ts
├── application/
│   ├── use-cases/
│   │   ├── generate-interpretation.use-case.ts
│   │   ├── regenerate-interpretation.use-case.ts
│   │   └── get-interpretation.use-case.ts
│   ├── services/
│   │   └── tarot-prompt-builder.service.ts  # Specific to tarot
│   └── dto/
│       └── generate-interpretation.dto.ts
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-interpretation.repository.ts
│   ├── controllers/
│   │   └── interpretations.controller.ts
│   └── entities/
│       └── tarot-interpretation.entity.ts
└── interpretations.module.ts
```

**2. Implementar Repository Pattern:**

- [ ] Crear `IInterpretationRepository` interface
- [ ] Implementar `TypeORMInterpretationRepository`
- [ ] Inyectar en use cases

**3. Crear Use Cases:**

- [ ] **GenerateInterpretationUseCase:**
  - Buscar en caché
  - Si no existe: construir prompt → llamar AI → guardar
  - Retornar interpretación
  - Máximo 120 líneas
- [ ] **RegenerateInterpretationUseCase:**
  - Validar ownership
  - Validar límites
  - Invalidar caché
  - Generar nueva → guardar
  - Máximo 100 líneas
- [ ] **GetInterpretationUseCase:**
  - Buscar por ID
  - Validar ownership
  - Retornar
  - Máximo 50 líneas

**4. Crear TarotPromptBuilder:**

- [ ] Implementar `IPromptBuilder<ReadingContext>` del módulo AI
- [ ] Mantener `tarot-prompts.ts` con constantes específicas
- [ ] Métodos:
  - `buildSystemMessage()`
  - `buildUserMessage(context)`
  - `buildFullPrompt(context)`
- [ ] Máximo 150 líneas

**5. Refactorizar controller:**

- [ ] Inyectar use cases específicos
- [ ] Eliminar lógica de negocio del controller
- [ ] Controller solo coordina

**6. Testing:**

- [ ] Tests unitarios por cada use case (8+ tests)
- [ ] Tests del TarotPromptBuilder (10+ tests)
- [ ] Tests del repository
- [ ] Tests E2E del flujo completo

#### 🎯 Criterios de aceptación

- ✅ No existe ningún archivo de más de 200 líneas
- ✅ Cada use case tiene responsabilidad única
- ✅ Prompts de tarot separados de la lógica de AI genérica
- ✅ Todos los tests pasan
- ✅ Coverage >85%

#### 📝 Notas importantes

- **Pre-requisito:** TASK-ARCH-001 y TASK-ARCH-002 deben estar completas
- **Beneficio:** Service pasa de 353 líneas a <200 líneas total
- **Mantiene:** Los prompts específicos de tarot en este módulo
- **Usa:** AIModule para la infraestructura de IA

---

### **TASK-ARCH-005: Aplicar Repository Pattern Explícito en Todos los Módulos** ⭐

**Prioridad:** 🟢 MEDIA  
**Estimación:** 5-6 días  
**Dependencias:** TASK-ARCH-003, TASK-ARCH-004  
**Marcador MVP:** ⭐ **RECOMENDADO** - Mejora testabilidad y desacoplamiento

#### 📋 Descripción

Implementar el patrón Repository de forma explícita en todos los módulos principales, separando la lógica de acceso a datos de la lógica de negocio. Actualmente se usan repositorios de TypeORM directamente, acoplando la lógica a la implementación.

**Beneficios:**

- Desacopla lógica de negocio de TypeORM
- Facilita testing (mock de interfaces, no de TypeORM)
- Permite cambiar ORM en el futuro sin afectar lógica
- Centraliza queries complejas

#### ✅ Tareas específicas

**1. Módulos a refactorizar:**

- [ ] **UsersModule:**
  - `IUserRepository` interface
  - `TypeORMUserRepository` implementación
  - Migrar `UsersService` para usar interface
- [ ] **CardsModule:**
  - `ICardRepository` interface
  - `TypeORMCardRepository` implementación
  - Migrar `CardsService`
- [ ] **DecksModule:**
  - `IDeckRepository` interface
  - `TypeORMDeckRepository` implementación
  - Migrar `DecksService`
- [ ] **SpreadsModule:**
  - `ISpreadRepository` interface
  - `TypeORMSpreadRepository` implementación
  - Migrar `SpreadsService`
- [ ] **CategoriesModule:**
  - `ICategoryRepository` interface
  - `TypeORMCategoryRepository` implementación
  - Migrar `CategoriesService`

**2. Estructura estándar por módulo:**

```
module/
├── domain/
│   ├── entities/
│   │   └── entity-name.entity.ts          # Dominio
│   └── repositories/
│       └── entity.repository.interface.ts  # Interface
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-entity.repository.ts   # Implementación
│   └── entities/
│       └── entity-name.entity.ts          # TypeORM
```

**3. Patrón de implementación:**

```typescript
// Interface (domain)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  // ... más métodos
}

// Implementación (infrastructure)
@Injectable()
export class TypeORMUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: UserEntity): User {
    // Mapeo de entity a domain
  }
}

// Service (usa interface, no implementación)
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
  ) {}
}
```

**4. Actualizar módulos para inyección:**

- [ ] Configurar providers con tokens de inyección
- [ ] Usar `@Inject('IRepository')` en services
- [ ] Exportar interfaces desde módulo

**5. Testing:**

- [ ] Tests unitarios de cada repository (8+ tests)
- [ ] Mock de interfaces en tests de services
- [ ] Verificar que toda funcionalidad sigue igual

#### 🎯 Criterios de aceptación

- ✅ Todos los módulos principales usan Repository Pattern
- ✅ Services dependen de interfaces, no de implementaciones
- ✅ Fácil mockear repositorios en tests
- ✅ Queries complejas centralizadas en repositories
- ✅ Todos los tests pasan

#### 📝 Notas importantes

- **No urgente:** Esta tarea mejora arquitectura pero no es bloqueante
- **Beneficio a largo plazo:** Facilita testing y mantenimiento
- **Puede hacerse módulo por módulo:** Migración incremental
- **Testing:** Cada módulo debe testearse tras migración

---

## 🎯 Fase 3: Mejoras Arquitecturales Avanzadas

### **TASK-ARCH-006: Introducir CQRS para Operaciones Complejas** 🔵

**Prioridad:** 🟢 BAJA  
**Estimación:** 6-7 días  
**Dependencias:** TASK-ARCH-003, TASK-ARCH-004, TASK-ARCH-005  
**Marcador MVP:** 🔵 **FASE 2** - Optimización avanzada post-MVP

#### 📋 Descripción

Implementar el patrón CQRS (Command Query Responsibility Segregation) completo usando `@nestjs/cqrs` para las operaciones más complejas del sistema. Separar completamente los comandos (escritura) de las queries (lectura).

**Casos de uso ideales:**

- Lecturas con paginación, filtros y ordenamiento complejos
- Generación de interpretaciones (muchos pasos)
- Reportes y estadísticas de admin
- Operaciones que requieren saga/transacciones

#### ✅ Tareas específicas

**1. Instalar y configurar:**

- [ ] Instalar `@nestjs/cqrs`
- [ ] Configurar `CqrsModule` en módulos relevantes
- [ ] Crear estructura de commands, queries y handlers

**2. Implementar Commands para Readings:**

```typescript
// commands/
create-reading.command.ts
regenerate-reading.command.ts
share-reading.command.ts
delete-reading.command.ts

// handlers/
create-reading.handler.ts  # Ejecuta CreateReadingUseCase
regenerate-reading.handler.ts
share-reading.handler.ts
delete-reading.handler.ts
```

**3. Implementar Queries para Readings:**

```typescript
// queries/
get - reading.query.ts;
list - user - readings.query.ts;
get - reading - stats.query.ts;

// handlers/
get - reading.handler.ts;
list - user - readings.handler.ts;
get - reading - stats.handler.ts;
```

**4. Implementar Commands para Interpretations:**

```typescript
// commands/
generate - interpretation.command.ts;
regenerate - interpretation.command.ts;

// handlers/
generate - interpretation.handler.ts;
regenerate - interpretation.handler.ts;
```

**5. Implementar Event Sourcing (opcional):**

- [ ] Eventos de dominio:
  - `ReadingCreated`
  - `InterpretationGenerated`
  - `ReadingShared`
- [ ] Event handlers para side effects
- [ ] Saga para flujos complejos

**6. Refactorizar controllers:**

- [ ] Controller dispatch commands/queries
- [ ] Eliminar llamadas directas a use cases
- [ ] Bus de comandos y queries centralizado

**7. Testing:**

- [ ] Tests de cada command handler
- [ ] Tests de cada query handler
- [ ] Tests de event handlers (si se implementan)
- [ ] Tests E2E del flujo completo

#### 🎯 Criterios de aceptación

- ✅ CQRS implementado en módulos críticos (readings, interpretations)
- ✅ Commands y Queries completamente separados
- ✅ Event handlers funcionan correctamente
- ✅ Performance no se degrada
- ✅ Todos los tests pasan

#### 📝 Notas importantes

- **Solo para Phase 2:** No es necesario para MVP
- **Overhead:** Agrega complejidad, solo vale la pena si el sistema escala
- **Beneficios:** Mejor separación, event sourcing, sagas
- **Alternativa:** Los use cases actuales son suficientes para MVP

---

### **TASK-ARCH-007: Separar Capas Completas (Clean Architecture Total)** 🔵

**Prioridad:** 🟢 BAJA  
**Estimación:** 15-20 días  
**Dependencias:** Todas las anteriores  
**Marcador MVP:** 🔵 **FASE 2** - Arquitectura enterprise completa

#### 📋 Descripción

Migrar completamente a Clean Architecture con separación estricta de capas. Esta es la meta final de arquitectura enterprise-level, pero solo debe hacerse cuando el equipo crezca y el proyecto escale significativamente.

**Estructura objetivo:**

```
src/
├── core/                          # Capa de dominio
│   ├── domain/
│   │   ├── entities/              # Entidades de negocio puras
│   │   ├── value-objects/         # Value objects inmutables
│   │   ├── repositories/          # Interfaces de repositorios
│   │   ├── services/              # Servicios de dominio
│   │   └── events/                # Eventos de dominio
│   └── application/
│       ├── use-cases/             # Casos de uso
│       ├── ports/                 # Interfaces (ports)
│       ├── dto/                   # DTOs
│       └── mappers/               # Mappers domain ↔ DTO
│
├── infrastructure/                # Capa de infraestructura
│   ├── database/
│   │   ├── typeorm/
│   │   ├── repositories/          # Implementaciones
│   │   ├── entities/              # Entidades TypeORM
│   │   └── migrations/
│   ├── http/
│   │   ├── controllers/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── external-services/
│   │   ├── ai-providers/
│   │   ├── email/
│   │   └── payment/
│   ├── cache/
│   │   ├── redis/
│   │   └── in-memory/
│   └── config/
│
└── modules/                       # Módulos NestJS (orquestación)
    ├── tarot/
    ├── users/
    ├── auth/
    └── admin/
```

#### ✅ Tareas específicas

- [ ] **Reorganizar estructura completa de carpetas**
- [ ] **Migrar entidades de dominio puras (sin decoradores de TypeORM)**
- [ ] **Crear value objects inmutables**
- [ ] **Implementar mappers entre capas**
- [ ] **Separar completamente infraestructura de dominio**
- [ ] **Actualizar TODOS los imports del proyecto**
- [ ] **Re-testear TODO el sistema**

#### 🎯 Criterios de aceptación

- ✅ Arquitectura sigue estrictamente Clean Architecture
- ✅ Dominio completamente independiente de frameworks
- ✅ Fácil cambiar implementaciones de infraestructura
- ✅ Todos los tests pasan

#### 📝 Notas importantes

- **Solo si el proyecto escala significativamente**
- **Requiere equipo grande y dedicado**
- **Riesgo de sobre-ingeniería si se hace muy pronto**
- **Evaluar en Q2 2026 según el análisis original**

---

## 📊 Resumen de Prioridades

### 🔴 Críticas (Hacer YA)

1. **TASK-ARCH-001:** Extraer módulo Cache (2-3 días)
2. **TASK-ARCH-002:** Extraer módulo AI (3-4 días)

### 🟡 Altas (Siguiente Sprint)

3. **TASK-ARCH-003:** Dividir ReadingsService con Use Cases (4-5 días)
4. **TASK-ARCH-004:** Dividir InterpretationsService con Use Cases (3-4 días)

### 🟢 Medias (Roadmap Q1 2026)

5. **TASK-ARCH-005:** Repository Pattern en todos los módulos (5-6 días)

### 🔵 Fase 2 (Q2 2026+)

6. **TASK-ARCH-006:** CQRS para operaciones complejas (6-7 días)
7. **TASK-ARCH-007:** Clean Architecture completa (15-20 días)

---

## 📝 Notas Finales

- **Prioridad 1:** TASK-ARCH-001 y TASK-ARCH-002 (reducen 70% de complejidad de interpretations)
- **Prioridad 2:** TASK-ARCH-003 y TASK-ARCH-004 (reducen tamaño de services gigantes)
- **Incremental:** Cada tarea es independiente y puede hacerse gradualmente
- **Sin breaking changes:** La API pública no cambia, solo la estructura interna
- **Testing obligatorio:** Cada refactor debe mantener o mejorar el coverage

---

## 🎓 Referencias

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs)
- [Repository Pattern in NestJS](https://docs.nestjs.com/techniques/database#repository-pattern)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
