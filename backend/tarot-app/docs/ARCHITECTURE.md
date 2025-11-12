# Arquitectura - Tarot Backend

## Visión General

Backend del marketplace de tarotistas construido con **NestJS**, aplicando arquitectura **híbrida feature-based con capas internas**.

**Tecnologías principales:**

- **Framework:** NestJS 10.x (Node.js + TypeScript)
- **ORM:** TypeORM 0.3.x
- **Database:** PostgreSQL 15+
- **Cache:** In-memory (preparado para Redis)
- **AI Providers:** OpenAI, Anthropic Claude
- **Testing:** Jest
- **Validation:** class-validator, class-transformer

---

## Principios Arquitecturales

### 1. Feature-Based Modules

Organización por **dominio de negocio** (cohesión funcional):

```
src/modules/
├── tarot/              # Dominio principal
│   ├── readings/       # Lecturas de tarot
│   ├── interpretations/  # Interpretaciones IA
│   ├── spreads/        # Tiradas (configuración)
│   └── cards/          # Catálogo de cartas
├── tarotistas/         # Marketplace de tarotistas
├── users/              # Gestión de usuarios
├── auth/               # Autenticación y autorización
└── ai/                 # Abstracción de proveedores IA
```

**Beneficios:**

- Todo lo relacionado a "readings" está junto
- Fácil navegar y entender responsabilidades
- Despliegue modular (microservicios futuros)

**Referencia:** [ADR-001: Feature-Based Modules](docs/architecture/decisions/ADR-001-adopt-feature-based-modules.md)

---

### 2. Layered Architecture (Selectiva)

Dentro de módulos **complejos**, se aplica separación en capas:

```
module/
├── domain/              # Lógica de negocio pura
│   └── interfaces/      # Contratos, abstracciones
├── application/         # Casos de uso, orquestación
│   ├── services/        # Servicios de aplicación
│   ├── use-cases/       # Casos de uso (CQRS)
│   └── dto/             # Data Transfer Objects
└── infrastructure/      # Detalles técnicos
    ├── repositories/    # Acceso a datos (TypeORM)
    ├── controllers/     # HTTP endpoints
    └── entities/        # Entidades de DB
```

**Criterio de aplicación:**

- ✅ Módulo >10 archivos .ts O >1000 líneas
- ✅ Lógica de negocio compleja
- ❌ CRUD simple (<5 archivos)

**Referencia:** [ADR-002: Criterio de Capas](docs/architecture/decisions/ADR-002-layered-architecture-criteria.md)

---

### 3. Repository Pattern

Abstracción de acceso a datos para **desacoplar ORM** de lógica de negocio:

```typescript
// domain/interfaces/reading-repository.interface.ts
export interface IReadingRepository {
  create(data: Partial<Reading>): Promise<Reading>;
  findById(id: string): Promise<Reading | null>;
  // ...
}

// infrastructure/repositories/typeorm-reading.repository.ts
@Injectable()
export class TypeOrmReadingRepository implements IReadingRepository {
  constructor(@InjectRepository(Reading) private repo: Repository<Reading>) {}
  // Implementación TypeORM
}

// application/services/readings.service.ts
@Injectable()
export class ReadingsService {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository, // Interface, no TypeORM
  ) {}
}
```

**Beneficios:**

- Fácil testing (mockear interface simple)
- Desacoplamiento de TypeORM
- Preparado para cambiar ORM (Prisma, Drizzle, etc.)

**Referencia:** [ADR-003: Repository Pattern](docs/architecture/decisions/ADR-003-repository-pattern.md)

---

### 4. CQRS (Selectivo)

Separación de **Commands** (escritura) y **Queries** (lectura) en operaciones complejas:

```typescript
// Command (escritura)
@CommandHandler(CreateReadingCommand)
export class CreateReadingHandler {
  async execute(command: CreateReadingCommand): Promise<Reading> {
    // Validaciones + creación
  }
}

// Query (lectura)
@QueryHandler(ListReadingsQuery)
export class ListReadingsHandler {
  async execute(query: ListReadingsQuery): Promise<Reading[]> {
    // Consulta con paginación
  }
}

// Controller
@Controller('readings')
export class ReadingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() dto: CreateReadingDto) {
    return this.commandBus.execute(new CreateReadingCommand(...));
  }

  @Get()
  findAll(@Query() query: any) {
    return this.queryBus.execute(new ListReadingsQuery(...));
  }
}
```

**Aplicado en:**

- `readings/` - Operaciones complejas con eventos

**Futuro:**

- `interpretations/` - Generación asíncrona con eventos

**Referencia:** [ADR-004: CQRS](docs/architecture/decisions/ADR-004-cqrs-for-complex-operations.md)

---

### 5. Event-Driven

Eventos de dominio para **desacoplar módulos**:

```typescript
// Publicar evento
this.eventBus.publish(new ReadingCreatedEvent(reading.id, userId));

// Escuchar evento
@EventsHandler(ReadingCreatedEvent)
export class ReadingCreatedHandler {
  handle(event: ReadingCreatedEvent) {
    // Disparar generación de interpretación
    // Invalidar caché
    // Enviar notificación
  }
}
```

**Eventos actuales:**

- `ReadingCreatedEvent`
- `ReadingRegeneratedEvent`
- `CacheInvalidatedEvent`

---

## Estructura de Módulos

### Módulos con Capas (Complejos)

| Módulo       | Archivos | Líneas | Razón                                               |
| ------------ | -------- | ------ | --------------------------------------------------- |
| **readings** | 28       | ~2400  | CQRS + eventos + validaciones complejas             |
| **cache**    | 8        | ~780   | Lógica compleja de invalidación + multi-provider    |
| **ai**       | 12       | ~1800  | Abstracción multi-provider + retry + error handling |

**Estructura:**

```
readings/
├── domain/
│   └── interfaces/
│       └── reading-repository.interface.ts
├── application/
│   ├── commands/
│   │   ├── handlers/
│   │   └── impl/
│   ├── queries/
│   │   ├── handlers/
│   │   └── impl/
│   ├── events/
│   │   ├── handlers/
│   │   └── impl/
│   ├── services/
│   └── dto/
└── infrastructure/
    ├── repositories/
    ├── controllers/
    └── entities/
```

---

### Módulos Flat (Simples)

| Módulo              | Archivos | Líneas | Razón               |
| ------------------- | -------- | ------ | ------------------- |
| **interpretations** | 5        | ~600   | Simplificado (CRUD) |
| **spreads**         | 6        | ~480   | CRUD simple         |
| **cards**           | 7        | ~950   | Catálogo            |
| **tarotistas**      | 7        | ~1000  | Preparado futuro    |

**Estructura:**

```
spreads/
├── entities/
├── dto/
├── spreads.service.ts
├── spreads.controller.ts
└── spreads.module.ts
```

---

## Patrones Aplicados

### Repository Pattern

**Módulos que lo implementan:**

- ✅ `readings/` - IReadingRepository + TypeOrmReadingRepository
- ✅ `cache/` - ICacheRepository + InMemoryCacheRepository
- ✅ `ai/` - IAIProviderRepository + OpenAIRepository, ClaudeRepository

**Convención:**

```typescript
// Interface: domain/interfaces/{entity}-repository.interface.ts
export interface IReadingRepository {
  // Métodos específicos de Reading
}

// Implementación: infrastructure/repositories/typeorm-{entity}.repository.ts
@Injectable()
export class TypeOrmReadingRepository implements IReadingRepository {
  // Implementación con TypeORM
}

// Inyección: application/services/{module}.service.ts
constructor(
  @Inject('IReadingRepository')
  private readonly repo: IReadingRepository,
) {}

// Configuración: {module}.module.ts
providers: [
  {
    provide: 'IReadingRepository',
    useClass: TypeOrmReadingRepository,
  },
]
```

---

### CQRS (Command Query Responsibility Segregation)

**Módulos que lo implementan:**

- ✅ `readings/` - Commands, Queries, Events

**Estructura:**

```
application/
├── commands/
│   ├── handlers/
│   │   ├── create-reading.handler.ts
│   │   └── regenerate-reading.handler.ts
│   └── impl/
│       ├── create-reading.command.ts
│       └── regenerate-reading.command.ts
├── queries/
│   ├── handlers/
│   │   ├── get-reading.handler.ts
│   │   └── list-readings.handler.ts
│   └── impl/
│       ├── get-reading.query.ts
│       └── list-readings.query.ts
└── events/
    ├── handlers/
    │   └── reading-created.handler.ts
    └── impl/
        └── reading-created.event.ts
```

---

### Dependency Injection

**Reglas:**

1. Services inyectan **interfaces**, no implementaciones
2. Controllers inyectan services o CommandBus/QueryBus
3. Repositories inyectan TypeORM Repository (confinado a infrastructure)

**Ejemplo:**

```typescript
// ✅ BIEN
constructor(
  @Inject('IUserRepository')
  private readonly userRepo: IUserRepository,
) {}

// ❌ MAL
constructor(
  @InjectRepository(User)
  private readonly userRepo: Repository<User>, // Acoplamiento a TypeORM
) {}
```

---

## Testing

### Estrategia de Testing

| Tipo            | Coverage | Herramienta      | Scope                       |
| --------------- | -------- | ---------------- | --------------------------- |
| **Unit**        | ≥80%     | Jest             | Services, handlers, helpers |
| **Integration** | ≥60%     | Jest             | Repositories, modules       |
| **E2E**         | Críticos | Jest + Supertest | Endpoints completos         |

---

### Unit Tests

**Ubicación:** `{file}.spec.ts` (al lado del archivo)

**Ejemplo:**

```typescript
describe('CreateReadingHandler', () => {
  let handler: CreateReadingHandler;
  let mockRepo: IReadingRepository;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockResolvedValue(mockReading),
      // ...
    };

    const module = await Test.createTestingModule({
      providers: [
        CreateReadingHandler,
        { provide: 'IReadingRepository', useValue: mockRepo },
        // ...
      ],
    }).compile();

    handler = module.get(CreateReadingHandler);
  });

  it('should create reading', async () => {
    const command = new CreateReadingCommand(...);
    const result = await handler.execute(command);
    expect(result).toBeDefined();
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
```

---

### Integration Tests

**Ubicación:** `test/{feature}/{feature}-integration.spec.ts`

**Ejemplo:**

```typescript
describe('ReadingsModule Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ReadingsModule, TypeOrmModule.forRoot(testConfig)],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should create reading', async () => {
    // Test con DB real (test DB)
  });
});
```

---

### E2E Tests

**Ubicación:** `test/{feature}.e2e-spec.ts`

**Ejemplo:**

```typescript
describe('Readings E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/POST readings', () => {
    return request(app.getHttpServer())
      .post('/readings')
      .send(createReadingDto)
      .expect(201);
  });
});
```

---

## CI/CD

### GitHub Actions

**Workflow:** `.github/workflows/architecture-validation.yml`

**Validaciones automáticas:**

1. ✅ **Estructura de módulos:** `node scripts/validate-architecture.js`
2. ✅ **Dependencias circulares:** `madge --circular --extensions ts src/`
3. ✅ **Linter:** `npm run lint`
4. ✅ **Build:** `npm run build`
5. ✅ **Tests + Coverage:** `npm run test:cov`
6. ✅ **Coverage ≥80%:** Verificación automática

**Trigger:** Pull requests a `develop` o `main`

---

### Scripts de Validación

**Validar arquitectura:**

```bash
npm run validate:arch
# O directamente:
node scripts/validate-architecture.js
```

**Validar dependencias circulares:**

```bash
npm install -g madge
madge --circular --extensions ts src/
```

**Validar coverage:**

```bash
npm run test:cov
# Verifica que coverage ≥ 80%
```

---

## Flujos Principales

### Flujo: Crear Lectura de Tarot

```
1. Cliente → POST /api/readings
2. ReadingsController → CommandBus.execute(CreateReadingCommand)
3. CreateReadingHandler:
   - Valida spread (ReadingValidatorService)
   - Valida usuario
   - Crea lectura (IReadingRepository)
   - Publica evento (ReadingCreatedEvent)
4. ReadingCreatedHandler (escucha evento):
   - Dispara generación de interpretación
   - Invalida caché
5. InterpretationsService:
   - Consulta configuración de tarotista
   - Llama AIService (abstracción multi-provider)
   - Guarda interpretación
   - Cachea resultado
6. Response → Cliente con lectura + interpretación
```

---

### Flujo: Abstracción Multi-Provider IA

```
1. InterpretationsService → AIService.generateInterpretation()
2. AIService:
   - Detecta provider configurado (openai/claude)
   - Construye prompt usando TarotistaConfig
   - Llama AIProviderFactory.create(provider)
3. AIProviderFactory → OpenAIRepository o ClaudeRepository
4. Provider:
   - Intenta llamada a IA
   - Retry con backoff exponencial (3 intentos)
   - Manejo de errores (rate limit, timeout, etc.)
5. Response → Interpretación generada
6. Cache → Guarda en caché (ICacheRepository)
```

---

### Flujo: Invalidación de Caché

```
1. Evento disparador:
   - ReadingRegeneratedEvent
   - TarotistaConfigUpdatedEvent
2. CacheInvalidationHandler (escucha eventos):
   - Identifica qué caché invalidar
   - Llama ICacheRepository.invalidate(key)
3. InMemoryCacheRepository:
   - Elimina entradas relacionadas
   - Registra invalidación (auditoría)
4. Próxima consulta → Cache miss → Regenera interpretación
```

---

## Escalabilidad

### Preparación para Marketplace Enterprise

**Multi-tenant preparado:**

- Tarotistas tienen configuración independiente (prompts, modelos IA)
- Interpretaciones vinculadas a tarotista específico
- Revenue tracking por tarotista

**Separación Read/Write (futuro):**

- CQRS facilita separar read DB (consultas) de write DB (comandos)
- Queries pueden cachearse agresivamente
- Commands registran eventos para auditoría

**Event Sourcing (futuro):**

- Event bus in-memory actual puede migrar a Event Store
- Eventos de dominio ya implementados
- Fácil agregar replay de eventos

---

## Seguridad

### Autenticación y Autorización

- **JWT tokens** (access + refresh)
- **Roles:** user, tarotista, admin
- **Guards:** JwtAuthGuard, RolesGuard, AdminGuard

### Rate Limiting

- Limitación por usuario/plan
- Guards: `CheckUsageLimitGuard`
- Interceptors: `IncrementUsageInterceptor`

### Validación de Inputs

- `class-validator` en todos los DTOs
- Sanitización de inputs (XSS prevention)

---

## Performance

### Caché

**Estrategia:**

- Interpretaciones cacheadas por (readingId + tarotistaId)
- Invalidación automática en eventos
- TTL configurable por tipo de caché

**Implementación:**

- Actual: In-memory (ICacheRepository + InMemoryCacheRepository)
- Futuro: Redis (misma interface, cambiar implementación)

### Database

- Índices en columnas frecuentes (userId, tarotistaId, createdAt)
- Soft deletes (deletedAt)
- Relaciones lazy-loading cuando es posible

---

## Migración y Evolución

### Estado Actual (2025-11-11)

**Completadas:**

- ✅ TASK-ARCH-001: Extraer módulo cache con capas
- ✅ TASK-ARCH-002: Extraer módulo AI con capas
- ✅ TASK-ARCH-003: Dividir readings.service en use-cases
- ✅ TASK-ARCH-004: Repository Pattern explícito
- ✅ TASK-ARCH-006: Evaluar módulos restantes
- ✅ TASK-ARCH-007: Documentación y governance

**Pendientes/Futuras:**

- ⏳ TASK-ARCH-005: CQRS en interpretations (opcional)
- ⏳ Migrar caché a Redis
- ⏳ Separar read/write DBs
- ⏳ Event Sourcing

---

## Referencias

### Documentación Interna

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución
- [ADRs](./architecture/decisions/) - Decisiones arquitecturales
- [PLAN_REFACTORIZACION.md](./PLAN_REFACTORIZACION.md) - Plan de refactorización

### Documentación Externa

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern - Martin Fowler](https://martinfowler.com/bliki/CQRS.html)

---

## FAQ

### ¿Por qué arquitectura híbrida y no Clean Architecture pura?

Ver [ADR-001: Feature-Based Modules](docs/architecture/decisions/ADR-001-adopt-feature-based-modules.md)

**Resumen:** Balance entre simplicidad (MVP) y escalabilidad (enterprise). Clean pura es over-engineering para tamaño actual.

---

### ¿Cuándo aplicar capas a un módulo?

Ver [ADR-002: Criterio de Capas](docs/architecture/decisions/ADR-002-layered-architecture-criteria.md)

**Criterio:** >10 archivos O >1000 líneas O lógica compleja.

---

### ¿Por qué Repository Pattern si ya tengo TypeORM?

Ver [ADR-003: Repository Pattern](docs/architecture/decisions/ADR-003-repository-pattern.md)

**Razones:**

1. Testabilidad (fácil mockear)
2. Desacoplamiento de ORM
3. Preparado para cambiar ORM

---

### ¿Cuándo usar CQRS?

Ver [ADR-004: CQRS](docs/architecture/decisions/ADR-004-cqrs-for-complex-operations.md)

**Criterio:**

- Operaciones de escritura complejas
- Queries complejas (paginación, filtros)
- Necesidad de eventos de dominio

---

### ¿Cómo agrego un nuevo módulo?

Ver [CONTRIBUTING.md - Crear Nuevo Módulo](../CONTRIBUTING.md#crear-nuevo-módulo)

**Resumen:**

1. Evaluar si necesita capas (criterio ADR-002)
2. Crear estructura (flat o con capas)
3. Implementar (Repository Pattern si aplica)
4. Tests (≥80% coverage)
5. Documentar (README.md)

---

## Contacto y Soporte

Para dudas arquitecturales:

- Crear issue en GitHub con label `architecture`
- Consultar ADRs existentes
- Revisar CONTRIBUTING.md

---

**Última actualización:** 2025-11-11  
**Versión:** 1.0.0  
**Próxima revisión:** 2026-05-11 (6 meses)
