# ADR-004: Introducir CQRS para Operaciones Complejas

**Fecha:** 2025-11-11  
**Estado:** Propuesto  
**Contexto:** TASK-ARCH-005 - Separación de comandos y queries  
**Relacionado con:** ADR-001 (Feature-Based), ADR-003 (Repository Pattern)

---

## Contexto

Algunos módulos tienen operaciones con diferentes características de escalabilidad:

- **Lecturas (Readings):** Operaciones de escritura (crear, regenerar) vs consultas complejas (paginación, filtros)
- **Interpretaciones:** Generación asíncrona vs consultas históricas

**Problemas identificados:**

1. **Acoplamiento en services:** Lógica de escritura mezclada con queries complejas
2. **Escalabilidad limitada:** No se pueden optimizar lecturas/escrituras por separado
3. **Auditoría difícil:** Comandos no se registran de forma estructurada
4. **Event-driven limitado:** Difícil implementar eventos de dominio

---

## Decisión

Introducir **CQRS (Command Query Responsibility Segregation)** usando `@nestjs/cqrs` en módulos con operaciones complejas:

### Criterio de Aplicación

Aplicar CQRS SOLO SI:

- ✅ Módulo tiene operaciones de escritura complejas (múltiples validaciones, workflows)
- ✅ Módulo tiene queries complejas (paginación, filtros, agregaciones)
- ✅ Necesidad de eventos de dominio (ej: `ReadingCreated`, `InterpretationGenerated`)
- ✅ Preparación para event sourcing o separación de read/write DBs en el futuro

### Módulos Candidatos

| Módulo              | Aplicar CQRS | Razón                                                 |
| ------------------- | ------------ | ----------------------------------------------------- |
| **readings**        | ✅ SÍ        | Operaciones complejas + eventos + paginación avanzada |
| **interpretations** | ⏳ FUTURO    | Cuando se agregue generación asíncrona con eventos    |
| **cache**           | ❌ NO        | Solo comandos de invalidación (no queries complejas)  |
| **ai**              | ❌ NO        | Abstracción de providers (no CQRS necesario)          |
| **spreads**         | ❌ NO        | CRUD simple                                           |

---

## Estructura CQRS (Readings como ejemplo)

```
readings/
├── application/
│   ├── commands/
│   │   ├── handlers/
│   │   │   ├── create-reading.handler.ts
│   │   │   ├── regenerate-reading.handler.ts
│   │   │   └── share-reading.handler.ts
│   │   └── impl/
│   │       ├── create-reading.command.ts
│   │       ├── regenerate-reading.command.ts
│   │       └── share-reading.command.ts
│   ├── queries/
│   │   ├── handlers/
│   │   │   ├── get-reading.handler.ts
│   │   │   └── list-readings.handler.ts
│   │   └── impl/
│   │       ├── get-reading.query.ts
│   │       └── list-readings.query.ts
│   └── events/
│       ├── handlers/
│       │   ├── reading-created.handler.ts
│       │   └── reading-regenerated.handler.ts
│       └── impl/
│           ├── reading-created.event.ts
│           └── reading-regenerated.event.ts
```

---

## Alternativas Consideradas

### Opción 1: Mantener Services tradicionales

```typescript
// ❌ Rechazada para módulos complejos
@Injectable()
export class ReadingsService {
  async create(...) {} // Escritura
  async findAll(...) {} // Lectura
  async regenerate(...) {} // Escritura compleja
}
```

**Pros:**

- ✅ Simplicidad
- ✅ Menos código

**Contras:**

- ❌ No separa responsabilidades
- ❌ Difícil escalar lecturas vs escrituras
- ❌ Sin eventos de dominio

**Razón de rechazo:** No cumple objetivos de escalabilidad y event-driven

---

### Opción 2: CQRS con Event Sourcing completo

```typescript
// ❌ Rechazada (over-engineering)
- Event Store
- Proyecciones
- Snapshots
- Replay de eventos
```

**Pros:**

- ✅ Auditoría completa
- ✅ Time-travel debugging
- ✅ Escalabilidad máxima

**Contras:**

- ❌ Complejidad enorme
- ❌ Over-engineering para tamaño actual
- ❌ Infraestructura adicional (EventStore DB)

**Razón de rechazo:** Demasiado complejo para MVP actual

---

### Opción 3: CQRS Básico con @nestjs/cqrs ⭐ **ELEGIDA**

```typescript
// ✅ Aceptada
- Comandos (escritura)
- Queries (lectura)
- Eventos (event bus in-memory)
- Sin Event Sourcing (por ahora)
```

**Pros:**

- ✅ Separación clara de responsabilidades
- ✅ Eventos de dominio simples
- ✅ Escalable a Event Sourcing si es necesario
- ✅ Testing simplificado (handlers pequeños)

**Contras:**

- ⚠️ Más boilerplate que services tradicionales
- ⚠️ Curva de aprendizaje

**Razón de selección:**

- Balance perfecto entre simplicidad y escalabilidad
- Preparado para evolución a Event Sourcing
- Event bus in-memory suficiente para MVP

---

## Consecuencias

### Positivas

1. **Separación de responsabilidades:**

   ```typescript
   // Comando: Crear lectura
   @CommandHandler(CreateReadingCommand)
   export class CreateReadingHandler {
     // Solo lógica de creación + validaciones
   }

   // Query: Listar lecturas
   @QueryHandler(ListReadingsQuery)
   export class ListReadingsHandler {
     // Solo lógica de consulta + paginación
   }
   ```

2. **Eventos de dominio:**

   ```typescript
   // Publicar evento después de crear lectura
   this.eventBus.publish(new ReadingCreatedEvent(reading.id, userId));

   // Handler independiente escucha evento
   @EventsHandler(ReadingCreatedEvent)
   export class ReadingCreatedHandler {
     handle(event: ReadingCreatedEvent) {
       // Disparar generación de interpretación
       // Invalidar caché
       // Enviar notificación
     }
   }
   ```

3. **Testing simplificado:**

   ```typescript
   // Test de comando (solo lógica de creación)
   it('should create reading', async () => {
     const command = new CreateReadingCommand(...);
     const result = await handler.execute(command);
     expect(result).toBeDefined();
   });
   ```

4. **Auditoría preparada:**

   ```typescript
   // Comandos pueden registrarse fácilmente
   @CommandHandler(CreateReadingCommand)
   export class CreateReadingHandler {
     async execute(command: CreateReadingCommand) {
       this.logger.log(`Creating reading: ${JSON.stringify(command)}`);
       // ...
     }
   }
   ```

5. **Escalabilidad futura:**
   - Fácil separar read/write DBs
   - Preparado para Event Sourcing
   - Queries pueden cachearse agresivamente

### Negativas / Trade-offs

1. **Más boilerplate:**

   - Command + Handler + Event (vs 1 método en service)
   - **Mitigación:** Snippets/generators

2. **Curva de aprendizaje:**

   - Patrón nuevo para equipo
   - **Mitigación:** Documentación + ejemplos

3. **Over-engineering en módulos simples:**
   - **Mitigación:** Aplicar SOLO en módulos complejos (criterio claro)

---

## Implementación

### Instalación

```bash
npm install @nestjs/cqrs
```

### Módulo Ejemplo: Readings

```typescript
// 1️⃣ Command
export class CreateReadingCommand {
  constructor(
    public readonly userId: string,
    public readonly spreadId: string,
    public readonly question: string,
    public readonly cards: string[],
  ) {}
}

// 2️⃣ Command Handler
@CommandHandler(CreateReadingCommand)
export class CreateReadingHandler
  implements ICommandHandler<CreateReadingCommand>
{
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateReadingCommand): Promise<Reading> {
    const { userId, spreadId, question, cards } = command;

    // Validaciones
    await this.validator.validateSpread(spreadId);
    await this.validator.validateUser(userId);

    // Crear lectura
    const reading = await this.readingRepo.create({
      userId,
      spreadId,
      question,
      cards,
    });

    // Publicar evento
    this.eventBus.publish(new ReadingCreatedEvent(reading.id, userId));

    return reading;
  }
}

// 3️⃣ Event
export class ReadingCreatedEvent {
  constructor(
    public readonly readingId: string,
    public readonly userId: string,
  ) {}
}

// 4️⃣ Event Handler
@EventsHandler(ReadingCreatedEvent)
export class ReadingCreatedHandler
  implements IEventHandler<ReadingCreatedEvent>
{
  private readonly logger = new Logger(ReadingCreatedHandler.name);

  handle(event: ReadingCreatedEvent) {
    this.logger.log(`Reading created: ${event.readingId}`);
    // Disparar generación de interpretación
    // Invalidar caché
  }
}

// 5️⃣ Controller
@Controller('readings')
export class ReadingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateReadingDto, @Req() req) {
    const command = new CreateReadingCommand(
      req.user.id,
      dto.spreadId,
      dto.question,
      dto.cards,
    );
    return this.commandBus.execute(command);
  }

  @Get()
  async findAll(@Req() req, @Query() query) {
    const listQuery = new ListReadingsQuery(
      req.user.id,
      query.page,
      query.limit,
    );
    return this.queryBus.execute(listQuery);
  }
}

// 6️⃣ Module
@Module({
  imports: [CqrsModule],
  providers: [
    CreateReadingHandler,
    ListReadingsHandler,
    ReadingCreatedHandler,
    // ...
  ],
  controllers: [ReadingsController],
})
export class ReadingsModule {}
```

---

## Validación

### Criterios de Aceptación

- [ ] `@nestjs/cqrs` instalado
- [ ] Commands creados para escrituras complejas
- [ ] Queries creados para lecturas complejas
- [ ] Events publicados en handlers
- [ ] Controller usa `CommandBus` y `QueryBus`
- [ ] Module importa `CqrsModule`
- [ ] Tests de handlers (unitarios)
- [ ] Build exitoso
- [ ] Coverage >= baseline

---

## Referencias

- [PLAN_REFACTORIZACION.md](../../PLAN_REFACTORIZACION.md) - TASK-ARCH-005
- [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs)
- [Martin Fowler - CQRS](https://martinfowler.com/bliki/CQRS.html)
- [ADR-001](./ADR-001-adopt-feature-based-modules.md)
- [ADR-003](./ADR-003-repository-pattern.md)

---

## Revisiones

- **2025-11-11:** Creación inicial (TASK-ARCH-005 - Propuesto)
- **Próxima revisión:** Cuando se implemente CQRS en readings (cambiar estado a Aceptado)

---

## Notas Adicionales

### Estado Actual (2025-11-11)

- **Estado ADR:** Propuesto (TASK-ARCH-005 no ejecutada aún)
- **Razón:** CQRS es opcional/futuro según priorización
- **Acción:** Documentar decisión para referencia futura

### Trigger para Implementación

Implementar CQRS en readings CUANDO:

- Se requiera separación de read/write DBs
- Se necesite auditoría completa de comandos
- Queries de lecturas se vuelvan muy complejas (>5 filtros)
- Se planee Event Sourcing

### Alternativa Actual

Por ahora, readings usa **Repository Pattern + Use Cases** (TASK-ARCH-003), que es suficiente para MVP.
