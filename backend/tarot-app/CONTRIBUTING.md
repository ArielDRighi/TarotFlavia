# Guía de Contribución - Tarot Backend

## Arquitectura

Este proyecto usa **arquitectura híbrida** NestJS:

- **Feature-based modules:** Organización por dominio de negocio
- **Layered architecture:** En módulos complejos (domain/application/infrastructure)

### Criterio para Capas

**Aplicar capas (domain/application/infrastructure) SI:**

- ✅ Módulo >10 archivos .ts
- ✅ Módulo >1000 líneas código
- ✅ Lógica de negocio compleja

**Mantener flat SI:**

- ❌ Módulo <5 archivos
- ❌ <500 líneas código
- ❌ Simple CRUD

**Referencia:** [ADR-002: Criterio de Capas](docs/architecture/decisions/ADR-002-layered-architecture-criteria.md)

---

## Convenciones de Código

### Naming

- **Entities:** `{Entity}.entity.ts` (PascalCase)
- **Services:** `{feature}.service.ts` (kebab-case)
- **Controllers:** `{feature}.controller.ts` (kebab-case)
- **DTOs:** `{action}-{entity}.dto.ts` (kebab-case)
- **Interfaces:** `I{Name}.ts` o `{name}.interface.ts`
- **Use Cases:** `{action}-{entity}.use-case.ts` (kebab-case)
- **Repositories:** `{orm}-{entity}.repository.ts` (kebab-case)

**Ejemplos:**

```
user.entity.ts
users.service.ts
users.controller.ts
create-user.dto.ts
update-user.dto.ts
IUserRepository.ts  o  user-repository.interface.ts
create-user.use-case.ts
typeorm-user.repository.ts
```

---

### Estructura de Carpetas

#### Módulo con Capas (Complejo)

```
module/
├── domain/
│   ├── interfaces/           # Contratos, abstracciones
│   │   └── {entity}-repository.interface.ts
│   └── entities/             # Entidades de dominio (opcional)
│       └── {entity}.entity.ts
├── application/
│   ├── services/             # Servicios de aplicación
│   │   └── {feature}.service.ts
│   ├── use-cases/            # Casos de uso (si usa CQRS)
│   │   ├── commands/
│   │   ├── queries/
│   │   └── events/
│   └── dto/                  # Data Transfer Objects
│       ├── create-{entity}.dto.ts
│       └── update-{entity}.dto.ts
├── infrastructure/
│   ├── repositories/         # Implementaciones de repositorios
│   │   └── typeorm-{entity}.repository.ts
│   ├── controllers/          # Controladores HTTP
│   │   └── {feature}.controller.ts
│   └── entities/             # Entidades de TypeORM
│       └── {entity}.entity.ts
└── {module}.module.ts        # Módulo NestJS
```

**Ejemplos de módulos con capas:**

- `src/modules/tarot/cache/`
- `src/modules/tarot/ai/`
- `src/modules/tarot/readings/`

---

#### Módulo Flat (Simple)

```
module/
├── entities/
│   └── {entity}.entity.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   └── update-{entity}.dto.ts
├── {module}.service.ts
├── {module}.controller.ts
└── {module}.module.ts
```

**Ejemplos de módulos flat:**

- `src/modules/tarot/interpretations/`
- `src/modules/tarot/spreads/`
- `src/modules/tarot/cards/`

---

## Repository Pattern

Todos los módulos con capas deben usar **Repository Pattern explícito**:

### 1. Crear Interface (domain/interfaces)

```typescript
// domain/interfaces/user-repository.interface.ts
export interface IUserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

### 2. Implementar con TypeORM (infrastructure/repositories)

```typescript
// infrastructure/repositories/typeorm-user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  // ... resto de métodos
}
```

### 3. Inyectar Interface en Service (application/services)

```typescript
// application/services/users.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async create(data: CreateUserDto) {
    return this.userRepo.create(data);
  }
}
```

### 4. Configurar Provider (module.ts)

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { TypeOrmUserRepository } from './infrastructure/repositories/typeorm-user.repository';
import { UsersService } from './application/services/users.service';
import { UsersController } from './infrastructure/controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: TypeOrmUserRepository,
    },
    UsersService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

**Referencia:** [ADR-003: Repository Pattern](docs/architecture/decisions/ADR-003-repository-pattern.md)

---

## Tests

### Coverage Mínimo

- **Unit tests:** ≥80%
- **Integration tests:** ≥60%
- **E2E tests:** Endpoints críticos

### Naming de Tests

```typescript
describe('FeatureService', () => {
  describe('methodName', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = ...;
      const expected = ...;

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should throw error when invalid input', () => {
      expect(() => service.methodName(null)).toThrow();
    });
  });
});
```

### Ubicación de Tests

- **Unit tests:** `{file}.spec.ts` (al lado del archivo)
- **Integration tests:** `test/{feature}/{feature}-integration.spec.ts`
- **E2E tests:** `test/{feature}.e2e-spec.ts`

### Mockear Repositories

```typescript
// ✅ BIEN - Mockear interface
const mockUserRepo: IUserRepository = {
  findById: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  // ... resto de métodos
};

const module = await Test.createTestingModule({
  providers: [
    UsersService,
    {
      provide: 'IUserRepository',
      useValue: mockUserRepo,
    },
  ],
}).compile();
```

```typescript
// ❌ MAL - Mockear TypeORM Repository
const mockRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

@InjectRepository(User) // ❌ Acoplamiento a TypeORM
```

---

## Code Review

### Checklist de PR

Antes de crear un Pull Request, verificar:

- [ ] **Build pasa:** `npm run build`
- [ ] **Tests pasan:** `npm test`
- [ ] **Coverage >= actual:** `npm run test:cov`
- [ ] **Linter pasa:** `npm run lint`
- [ ] **Formato correcto:** `npm run format`
- [ ] **E2E críticos pasan:** `npm run test:e2e -- {test}.e2e-spec.ts`
- [ ] **0 dependencias circulares:** `npx madge --circular --extensions ts --exclude '\.module\.ts$' src/`
- [ ] **Commits siguen Conventional Commits**
- [ ] **ADR creado** (si decisión arquitectural)
- [ ] **Documentación actualizada** (README, docs/)
- [ ] **Cambios funcionales probados manualmente**

### Tamaño de PR

- **Ideal:** <300 líneas cambiadas
- **Máximo:** <500 líneas cambiadas
- **Si >500 líneas:** Dividir en múltiples PRs

### Descripción de PR

```markdown
## Descripción

[Descripción breve del cambio]

## Tipo de Cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Refactorización
- [ ] Documentación

## Checklist

- [ ] Build pasa
- [ ] Tests pasan
- [ ] Coverage >= baseline
- [ ] Linter pasa
- [ ] Documentación actualizada

## Testing

[Describir cómo se probó el cambio]

## Screenshots (si aplica)

[Adjuntar screenshots si hay cambios visuales]
```

---

## Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización (sin cambio funcional)
- `docs`: Documentación
- `test`: Tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejora de performance
- `style`: Cambios de formato (sin cambio lógico)

### Ejemplos

```bash
feat(readings): agregar endpoint de regeneración
fix(auth): corregir validación de token expirado
refactor(arch): aplicar Repository Pattern en readings
docs(adr): documentar decisión de CQRS
test(cache): agregar tests de invalidación
chore(deps): actualizar dependencias de seguridad
```

---

## Crear Nuevo Módulo

### Paso 1: Evaluar si necesita capas

**Usar checklist:**

- [ ] ¿Tendrá >10 archivos .ts?
- [ ] ¿Tendrá >1000 líneas de código?
- [ ] ¿Tiene lógica de negocio compleja?

**SI (≥1 criterio cumplido) → CON CAPAS**  
**NO → FLAT**

---

### Paso 2a: Crear Módulo con Capas

```bash
# Crear estructura
mkdir -p src/modules/{module}/domain/interfaces
mkdir -p src/modules/{module}/application/services
mkdir -p src/modules/{module}/application/dto
mkdir -p src/modules/{module}/infrastructure/repositories
mkdir -p src/modules/{module}/infrastructure/controllers
mkdir -p src/modules/{module}/infrastructure/entities
```

**Archivos a crear:**

1. `domain/interfaces/{entity}-repository.interface.ts`
2. `application/services/{module}.service.ts`
3. `application/dto/create-{entity}.dto.ts`
4. `application/dto/update-{entity}.dto.ts`
5. `infrastructure/repositories/typeorm-{entity}.repository.ts`
6. `infrastructure/controllers/{module}.controller.ts`
7. `infrastructure/entities/{entity}.entity.ts`
8. `{module}.module.ts`

---

### Paso 2b: Crear Módulo Flat

```bash
# Crear estructura
mkdir -p src/modules/{module}/entities
mkdir -p src/modules/{module}/dto
```

**Archivos a crear:**

1. `entities/{entity}.entity.ts`
2. `dto/create-{entity}.dto.ts`
3. `dto/update-{entity}.dto.ts`
4. `{module}.service.ts`
5. `{module}.controller.ts`
6. `{module}.module.ts`

---

### Paso 3: Implementar

**Seguir orden:**

1. **Entity** (TypeORM)
2. **DTOs** (validaciones con `class-validator`)
3. **Repository Interface** (si usa capas)
4. **Repository Implementation** (si usa capas)
5. **Service** (lógica de negocio)
6. **Controller** (endpoints HTTP)
7. **Module** (configuración NestJS)

---

### Paso 4: Agregar Tests

```bash
# Unit tests (>=80% coverage)
{module}.service.spec.ts

# Integration tests (si aplica)
test/{module}/{module}-integration.spec.ts

# E2E tests
test/{module}.e2e-spec.ts
```

---

### Paso 5: Documentar

**Crear:** `src/modules/{module}/README.md`

```markdown
# Módulo {Module}

## Descripción

[Descripción del módulo]

## Estructura

[Si usa capas, explicar]

## Endpoints

- `GET /api/{module}` - Listar
- `GET /api/{module}/:id` - Obtener por ID
- `POST /api/{module}` - Crear
- `PATCH /api/{module}/:id` - Actualizar
- `DELETE /api/{module}/:id` - Eliminar

## DTOs

- `Create{Entity}Dto`
- `Update{Entity}Dto`

## Servicios

- `{Module}Service`

## Repositorios

- `I{Entity}Repository` (interface)
- `TypeOrm{Entity}Repository` (implementation)
```

---

### Paso 6: Integrar en AppModule

```typescript
// app.module.ts
import { {Module}Module } from './modules/{module}/{module}.module';

@Module({
  imports: [
    // ... otros módulos
    {Module}Module,
  ],
})
export class AppModule {}
```

---

### Paso 7: Validar

```bash
npm run build
npm test
npm run test:cov
npm run lint
npm run test:e2e
```

---

## Workflow de Desarrollo

### 1. Crear Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/TASK-XXX-descripcion
```

**Convención de nombres:**

- `feature/{TASK-XXX}-{descripcion}` - Nueva funcionalidad
- `fix/{TASK-XXX}-{descripcion}` - Bug fix
- `refactor/{TASK-XXX}-{descripcion}` - Refactorización
- `docs/{TASK-XXX}-{descripcion}` - Documentación

---

### 2. Desarrollo Incremental

```bash
# Hacer cambios pequeños
# Commit frecuente

git add .
git commit -m "feat(module): agregar funcionalidad X"

# Validar después de cada commit
npm run build && npm test
```

---

### 3. Pre-Push Validation

```bash
# Antes de push, ejecutar validación completa
npm run build
npm run lint
npm run format
npm test
npm run test:cov
npm run test:e2e

# Si todo pasa
git push origin feature/TASK-XXX-descripcion
```

---

### 4. Crear Pull Request

**En GitHub:**

- Usar template de PR
- Asignar reviewers
- Agregar labels (feature/bug/refactor/docs)
- Verificar que CI/CD pasa

---

### 5. Code Review

**Reviewer debe verificar:**

- [ ] Código sigue convenciones
- [ ] Tests agregados (coverage ≥80%)
- [ ] Documentación actualizada
- [ ] No hay código comentado sin razón
- [ ] No hay console.log (usar Logger)
- [ ] Imports organizados
- [ ] No hay dependencias circulares

---

### 6. Merge

**Después de aprobación:**

```bash
# Squash and merge (preferido)
# O Merge commit (si commits son atómicos)

# Borrar branch
git branch -d feature/TASK-XXX-descripcion
git push origin --delete feature/TASK-XXX-descripcion
```

---

## Troubleshooting

### Error: "Circular dependency detected"

**Verificar:**

```bash
# Excluye .module.ts (pueden tener dependencias circulares válidas con forwardRef)
npx madge --circular --extensions ts --exclude '\.module\.ts$' src/
```

**Solución:**

- **Para módulos:** Usar `forwardRef()` en ambos módulos (esto es válido en NestJS)
- **Para entidades:** Usar interfaces locales en lugar de importar las clases completas
- **Para servicios:** Reorganizar dependencias o usar eventos
- Reorganizar imports
- Crear interface intermedia

---

### Error: "Cannot inject I{Entity}Repository"

**Verificar:**

- Provider configurado en módulo
- String del `@Inject()` coincide con `provide`

```typescript
// ✅ BIEN
{
  provide: 'IUserRepository',
  useClass: TypeOrmUserRepository,
}

constructor(
  @Inject('IUserRepository') // Mismo string
  private readonly userRepo: IUserRepository,
) {}
```

---

### Tests fallando después de refactor

**Verificar:**

- Mocks actualizados
- Imports correctos
- Coverage no bajó

---

## Recursos

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura completa
- [ADRs](docs/architecture/decisions/) - Decisiones arquitecturales
- [PLAN_REFACTORIZACION.md](docs/PLAN_REFACTORIZACION.md) - Plan de refactorización
- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)

---

## Preguntas Frecuentes

### ¿Cuándo aplicar capas?

Ver [ADR-002: Criterio de Capas](docs/architecture/decisions/ADR-002-layered-architecture-criteria.md)

### ¿Cuándo usar CQRS?

Ver [ADR-004: CQRS](docs/architecture/decisions/ADR-004-cqrs-for-complex-operations.md)

### ¿Cómo mockear TypeORM Repository?

Ver sección "Mockear Repositories" arriba.

### ¿Qué hacer si coverage baja?

- Agregar tests para nuevo código
- No hacer merge hasta que coverage ≥ baseline

---

## Contacto

Para dudas o sugerencias, crear issue en GitHub o contactar al equipo de arquitectura.
