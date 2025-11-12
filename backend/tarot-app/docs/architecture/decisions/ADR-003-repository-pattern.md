# ADR-003: Implementar Repository Pattern Explícito

**Fecha:** 2025-11-11  
**Estado:** Aceptado  
**Contexto:** TASK-ARCH-004 - Abstracción de acceso a datos  
**Relacionado con:** ADR-001 (Arquitectura Feature-Based), ADR-002 (Criterio de Capas)

---

## Contexto

Durante la refactorización arquitectural, se identificó **acoplamiento directo a TypeORM** en services:

```typescript
// ❌ PROBLEMA: Service acoplado a TypeORM
@Injectable()
export class ReadingsService {
  constructor(
    @InjectRepository(Reading)
    private readonly readingRepo: Repository<Reading>, // TypeORM específico
  ) {}
}
```

**Problemas:**

1. **Dificulta testing:** Mockear `Repository<T>` de TypeORM es complejo
2. **Viola Dependency Inversion:** Capa de aplicación depende de framework de infraestructura
3. **Baja flexibilidad:** Cambiar ORM (ej: Prisma, TypeORM → Drizzle) requiere reescribir services
4. **Acoplamiento:** Lógica de negocio mezclada con queries SQL/TypeORM

---

## Decisión

Aplicar **Repository Pattern explícito** en todos los módulos que usan capas (domain/application/infrastructure):

### Estructura

```
module/
├── domain/
│   └── interfaces/
│       └── {entity}-repository.interface.ts    # Contrato (abstracción)
├── application/
│   └── services/
│       └── {module}.service.ts                 # Inyecta INTERFACE
└── infrastructure/
    └── repositories/
        └── typeorm-{entity}.repository.ts      # Implementación TypeORM
```

### Patrón

```typescript
// domain/interfaces/reading-repository.interface.ts
export interface IReadingRepository {
  create(data: Partial<Reading>): Promise<Reading>;
  findById(id: string): Promise<Reading | null>;
  findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<[Reading[], number]>;
  update(id: string, data: Partial<Reading>): Promise<Reading>;
  delete(id: string): Promise<void>;
}

// infrastructure/repositories/typeorm-reading.repository.ts
@Injectable()
export class TypeOrmReadingRepository implements IReadingRepository {
  constructor(
    @InjectRepository(Reading)
    private readonly repo: Repository<Reading>,
  ) {}

  async create(data: Partial<Reading>): Promise<Reading> {
    const reading = this.repo.create(data);
    return this.repo.save(reading);
  }
  // ... resto de métodos
}

// application/services/readings.service.ts
@Injectable()
export class ReadingsService {
  constructor(
    @Inject('IReadingRepository') // Inyecta INTERFACE
    private readonly readingRepo: IReadingRepository,
  ) {}
}

// readings.module.ts
@Module({
  providers: [
    {
      provide: 'IReadingRepository',
      useClass: TypeOrmReadingRepository, // TypeORM confinado aquí
    },
    ReadingsService,
  ],
})
export class ReadingsModule {}
```

---

## Alternativas Consideradas

### Opción 1: Inyectar TypeORM Repository directamente

```typescript
// ❌ Rechazada
constructor(
  @InjectRepository(Reading)
  private readonly repo: Repository<Reading>,
) {}
```

**Pros:**

- ✅ Simplicidad (estilo NestJS estándar)
- ✅ Menos código boilerplate

**Contras:**

- ❌ Acoplamiento a TypeORM
- ❌ Difícil testing (mockear Repository<T> complejo)
- ❌ Viola Dependency Inversion

**Razón de rechazo:** No cumple objetivos de testabilidad y flexibilidad

---

### Opción 2: Generic Repository Pattern

```typescript
// ❌ Rechazada
export class GenericRepository<T> implements IRepository<T> {
  constructor(private repo: Repository<T>) {}
  // Métodos genéricos
}
```

**Pros:**

- ✅ Reutilización de código
- ✅ DRY

**Contras:**

- ❌ Métodos específicos de entidad difíciles de tipar
- ❌ Queries complejas requieren escapar de abstracción
- ❌ Over-abstracción

**Razón de rechazo:** Pragmatismo > abstracción excesiva

---

### Opción 3: Repository Pattern Específico por Entidad ⭐ **ELEGIDA**

```typescript
// ✅ Aceptada
export interface IReadingRepository {
  // Métodos específicos para Reading
  findByUserId(...): Promise<[Reading[], number]>;
  regenerate(...): Promise<Reading>;
}
```

**Pros:**

- ✅ Abstracción clara y tipada
- ✅ Fácil testing (mockear interface simple)
- ✅ Separa domain de infrastructure
- ✅ Permite métodos específicos de entidad

**Contras:**

- ⚠️ Más boilerplate (mitigado por generadores/snippets)
- ⚠️ Duplicación de interfaces similares (aceptable por claridad)

**Razón de selección:**

- Balance perfecto entre abstracción y pragmatismo
- Facilita testing sin over-engineering
- Preparado para cambiar ORM sin reescribir lógica

---

## Consecuencias

### Positivas

1. **Testabilidad mejorada:**

   ```typescript
   // ✅ Mock simple de interface
   const mockRepo: IReadingRepository = {
     findById: jest.fn().mockResolvedValue(mockReading),
     create: jest.fn().mockResolvedValue(mockReading),
   };
   ```

2. **Dependency Inversion cumplido:**

   - Services (application) dependen de INTERFACES (domain)
   - TypeORM confinado a infrastructure

3. **Flexibilidad para cambiar ORM:**

   ```typescript
   // Fácil crear PrismaReadingRepository implements IReadingRepository
   // Sin tocar services
   ```

4. **Separación clara de responsabilidades:**
   - Domain: Define QUÉ operaciones
   - Infrastructure: Define CÓMO implementarlas

### Negativas / Trade-offs

1. **Más boilerplate inicial:**

   - Interface + Implementación (vs solo Repository<T>)
   - **Mitigación:** Templates/snippets para generar rápido

2. **Curva de aprendizaje:**

   - Desarrolladores nuevos deben entender patrón
   - **Mitigación:** Documentado en CONTRIBUTING.md

3. **Posible duplicación de interfaces:**
   - Entities similares tendrán interfaces parecidas
   - **Aceptado:** Claridad > DRY en este caso

---

## Implementación

### Módulos Aplicados (TASK-ARCH-004)

| Módulo              | Interface               | Implementación                   | Estado |
| ------------------- | ----------------------- | -------------------------------- | ------ |
| **cache**           | `ICacheRepository`      | `InMemoryCacheRepository`        | ✅     |
| **readings**        | `IReadingRepository`    | `TypeOrmReadingRepository`       | ✅     |
| **ai**              | `IAIProviderRepository` | `OpenAIRepository`, `ClaudeRepo` | ✅     |
| **tarotistas**      | `ITarotistaRepository`  | `TypeOrmTarotistaRepository`     | ⏳     |
| **spreads**         | `ISpreadRepository`     | `TypeOrmSpreadRepository`        | ⏳     |
| **cards**           | `ICardRepository`       | `TypeOrmCardRepository`          | ⏳     |
| **interpretations** | N/A (simplificado)      | Usa otros repositories           | ✅     |

### Convención de Nombres

- **Interface:** `I{Entity}Repository` (ej: `IReadingRepository`)
- **Implementación:** `{ORM}{Entity}Repository` (ej: `TypeOrmReadingRepository`)
- **Provider token:** String `'I{Entity}Repository'` (ej: `'IReadingRepository'`)

### Ubicación de Archivos

```
src/modules/{module}/
├── domain/
│   └── interfaces/
│       └── {entity}-repository.interface.ts    # Interface
└── infrastructure/
    └── repositories/
        └── typeorm-{entity}.repository.ts      # Implementación TypeORM
```

---

## Validación

### Anti-patrones Prohibidos

```bash
# ❌ NO debe haber @InjectRepository en services (solo en repositories)
grep -r "@InjectRepository" src/modules/*/application/
# Debe retornar 0 resultados

# ✅ Verificar que solo está en infrastructure
grep -r "@InjectRepository" src/modules/*/infrastructure/repositories/
# Debe retornar implementaciones de repositories
```

### Checklist de Implementación

- [ ] Interface creada en `domain/interfaces/`
- [ ] Implementación TypeORM en `infrastructure/repositories/`
- [ ] Service inyecta interface (no TypeORM Repository)
- [ ] Module configura provider con `provide/useClass`
- [ ] Tests unitarios mockean interface
- [ ] Build exitoso
- [ ] Coverage >= baseline

---

## Ejemplos de Código

### Ejemplo Completo: ReadingRepository

```typescript
// 1️⃣ domain/interfaces/reading-repository.interface.ts
export interface IReadingRepository {
  create(data: Partial<Reading>): Promise<Reading>;
  findById(id: string): Promise<Reading | null>;
  findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<[Reading[], number]>;
  update(id: string, data: Partial<Reading>): Promise<Reading>;
  delete(id: string): Promise<void>;
  share(id: string, shareToken: string): Promise<Reading>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 2️⃣ infrastructure/repositories/typeorm-reading.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { Reading } from '../entities/reading.entity';

@Injectable()
export class TypeOrmReadingRepository implements IReadingRepository {
  constructor(
    @InjectRepository(Reading)
    private readonly repo: Repository<Reading>,
  ) {}

  async create(data: Partial<Reading>): Promise<Reading> {
    const reading = this.repo.create(data);
    return this.repo.save(reading);
  }

  async findById(id: string): Promise<Reading | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['spread', 'user'],
    });
  }

  async findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<[Reading[], number]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options || {};

    return this.repo.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['spread'],
    });
  }

  async update(id: string, data: Partial<Reading>): Promise<Reading> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async share(id: string, shareToken: string): Promise<Reading> {
    await this.repo.update(id, { shareToken, sharedAt: new Date() });
    return this.findById(id);
  }
}

// 3️⃣ application/services/readings.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';

@Injectable()
export class ReadingsService {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
  ) {}

  async create(userId: string, data: any) {
    return this.readingRepo.create({ userId, ...data });
  }

  async findById(id: string) {
    return this.readingRepo.findById(id);
  }
}

// 4️⃣ readings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reading } from './infrastructure/entities/reading.entity';
import { TypeOrmReadingRepository } from './infrastructure/repositories/typeorm-reading.repository';
import { ReadingsService } from './application/services/readings.service';
import { ReadingsController } from './infrastructure/controllers/readings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reading])],
  providers: [
    {
      provide: 'IReadingRepository',
      useClass: TypeOrmReadingRepository,
    },
    ReadingsService,
  ],
  controllers: [ReadingsController],
  exports: [ReadingsService],
})
export class ReadingsModule {}
```

---

## Referencias

- [PLAN_REFACTORIZACION.md](../../PLAN_REFACTORIZACION.md) - TASK-ARCH-004
- [ADR-001](./ADR-001-adopt-feature-based-modules.md) - Arquitectura Feature-Based
- [ADR-002](./ADR-002-layered-architecture-criteria.md) - Criterio de Capas
- Clean Architecture - Robert C. Martin
- Domain-Driven Design - Eric Evans

---

## Revisiones

- **2025-11-11:** Creación inicial (TASK-ARCH-004)
- **Próxima revisión:** 2026-05-11 (6 meses) - Evaluar si patrón escala bien
