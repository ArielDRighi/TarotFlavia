# CLAUDE.md - Backend (NestJS)

> Contexto específico para desarrollo en el backend. Lee primero el CLAUDE.md de la raíz.

## Stack

- **Framework**: NestJS 10.x (TypeScript)
- **ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL 16
- **AI Providers**: Groq Llama 3.1 70B (principal), OpenAI GPT-4, DeepSeek (fallback)
- **Testing**: Jest (TDD)

## Arquitectura

```
src/modules/{module}/
├── domain/              # Lógica de negocio pura
│   └── interfaces/      # Contratos de repositorios
├── application/         # Casos de uso, orquestación
│   ├── services/        # Servicios de aplicación
│   ├── use-cases/       # Casos de uso (CQRS)
│   ├── orchestrators/   # Coordinan use cases
│   └── dto/             # Data Transfer Objects
└── infrastructure/      # Detalles técnicos
    ├── repositories/    # Implementaciones TypeORM
    └── controllers/     # HTTP endpoints
```

## Patrones Obligatorios

### 1. Controller → Orchestrator → Use Cases
```typescript
// ✅ CORRECTO
@Controller('readings')
export class ReadingsController {
  constructor(private readonly orchestrator: ReadingsOrchestratorService) {}

  @Post()
  create(@Body() dto: CreateReadingDto) {
    return this.orchestrator.create(dto);  // Delegar a orchestrator
  }
}

// ❌ INCORRECTO - NO inyectar repositories en controllers
constructor(private readonly readingRepo: IReadingRepository) {}
```

### 2. Repository Pattern con Interfaces
```typescript
// Interface: domain/interfaces/
export interface IReadingRepository {
  create(data: Partial<Reading>): Promise<Reading>;
  findById(id: number): Promise<Reading | null>;
}

// Implementación: infrastructure/repositories/
@Injectable()
export class TypeOrmReadingRepository implements IReadingRepository {
  constructor(@InjectRepository(Reading) private repo: Repository<Reading>) {}
}

// Inyección: application/services/
constructor(
  @Inject('IReadingRepository')
  private readonly readingRepo: IReadingRepository,
) {}
```

### 3. Decoradores Swagger
```typescript
@ApiTags('Lecturas')  // Español para user-facing
@Controller('readings')
export class ReadingsController {
  @Post()
  @ApiOperation({ summary: 'Crear nueva lectura' })
  @ApiResponse({ status: 201, description: 'Lectura creada exitosamente' })
  async create() {}
}
```

## Orden de Imports

```typescript
// 1. Framework (@nestjs/*)
import { Injectable, Inject } from '@nestjs/common';
// 2. Third-party (typeorm, etc.)
import { Repository } from 'typeorm';
// 3. Swagger decorators
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// 4. Internal modules (domain/application/infrastructure)
import { CreateReadingUseCase } from '../use-cases/create-reading.use-case';
// 5. Common utilities
import { User } from '../../../users/entities/user.entity';
```

## Testing

```typescript
describe('ReadingsService', () => {
  let service: ReadingsService;
  const mockRepo = { findOne: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReadingsService,
        { provide: 'IReadingRepository', useValue: mockRepo },
      ],
    }).compile();
    service = module.get(ReadingsService);
    jest.clearAllMocks();
  });

  it('should create reading', async () => {
    mockRepo.save.mockResolvedValue({ id: 1 });
    const result = await service.create({});
    expect(result.id).toBe(1);
  });
});
```

## Comandos

```bash
npm run start:dev              # Servidor desarrollo (watch)
npm run test                   # Unit tests
npm run test:cov               # Tests + coverage (≥80%)
npm run test:watch             # Tests en watch mode
npm run lint                   # Lint + autofix
npm run build                  # Build producción
npm run format                 # Prettier format
node scripts/validate-architecture.js  # Validar arquitectura

# Database
npm run migration:generate -- src/database/migrations/NombreMigracion
npm run migration:run
npm run db:seed:all
```

## Ciclo de Calidad Completo

```bash
npm run format && npm run lint && npm run test:cov && npm run build && node scripts/validate-architecture.js
```

## Documentación

- `docs/ARCHITECTURE.md` - Arquitectura completa
- `docs/API_DOCUMENTATION.md` - Endpoints REST
- `docs/TESTING.md` - Estrategia de testing
