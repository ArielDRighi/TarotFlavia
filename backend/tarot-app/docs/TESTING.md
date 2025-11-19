# Testing Guide - Tarot Backend

## Tabla de Contenidos

1. [Filosofía de Testing](#filosofía-de-testing)
2. [Tipos de Tests](#tipos-de-tests)
3. [Estructura de Tests](#estructura-de-tests)
4. [Cómo Ejecutar Tests](#cómo-ejecutar-tests)
5. [Cómo Crear Nuevos Tests](#cómo-crear-nuevos-tests)
6. [Coverage Actual](#coverage-actual)
7. [Best Practices](#best-practices)
8. [Debugging Tests](#debugging-tests)

---

## Filosofía de Testing

**⚠️ REGLA DE ORO: TODOS LOS TESTS DEBEN BUSCAR BUGS REALES, NUNCA FALSEAR TESTS PARA QUE PASEN**

Consulta **[TESTING_PHILOSOPHY.md](./TESTING_PHILOSOPHY.md)** para la filosofía completa y obligatoria antes de crear cualquier test.

### Principios Clave

1. **Investigar código ANTES de escribir tests**
2. **Escribir tests que ESPERAN encontrar bugs**
3. **Cuando un test falla, investigar y corregir el código de producción**
4. **Nunca cambiar el test para que pase sin investigar**
5. **Documentar bugs encontrados en commits**

---

## Tipos de Tests

### 1. Unit Tests (Jest)

**Ubicación:** `src/**/*.spec.ts` (al lado del archivo testeado)

**Propósito:** Testear lógica aislada de servicios, use-cases, helpers

**Coverage mínimo:** 80% líneas, 70% branches

**Ejemplo:**

```typescript
// src/modules/tarot/interpretations/interpretations.service.spec.ts
describe('InterpretationsService', () => {
  let service: InterpretationsService;

  // Mock dependencies
  const mockAIProvider = {
    generateCompletion: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InterpretationsService,
        { provide: AIProviderService, useValue: mockAIProvider },
      ],
    }).compile();

    service = module.get<InterpretationsService>(InterpretationsService);
  });

  it('should reject empty cards array', async () => {
    // BUG HUNTING: Empty input should be validated
    await expect(service.generateInterpretation([], [])).rejects.toThrow(
      'Cards array cannot be empty',
    );
  });
});
```

### 2. Integration Tests (E2E con DB real)

**Ubicación:** `test/*-integration.e2e-spec.ts`

**Propósito:** Testear flujos completos con base de datos REAL

**Ejemplo:**

```typescript
// test/auth-integration.e2e-spec.ts
describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should register and login user', async () => {
    // Register
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty('accessToken');

    // Login with same credentials
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'ValidPass123!',
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('accessToken');
  });
});
```

### 3. E2E Tests (End-to-End)

**Ubicación:** `test/*.e2e-spec.ts`

**Propósito:** Testear flujos completos de usuario (registro → lectura → límites)

**Ejemplo:**

```typescript
// test/mvp-complete.e2e-spec.ts
describe('MVP Complete Flow (e2e)', () => {
  it('should complete full user journey: register → reading → limit', async () => {
    // 1. Register
    const user = await createTestUser();

    // 2. Create reading
    const reading = await request(app.getHttpServer())
      .post('/readings')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ spreadId: 1, question: 'Test question' })
      .expect(201);

    expect(reading.body.cards).toHaveLength(3);
    expect(reading.body.interpretation).toBeDefined();

    // 3. Verify usage limit incremented
    const limits = await request(app.getHttpServer())
      .get('/usage-limits/my-limits')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(limits.body.dailyReadings.current).toBe(1);
  });
});
```

---

## Estructura de Tests

### Convenciones de Naming

```
src/modules/users/users.service.ts
src/modules/users/users.service.spec.ts          // Unit tests

test/auth-integration.e2e-spec.ts                // Integration tests
test/mvp-complete.e2e-spec.ts                    // E2E tests
```

### Patrón AAA (Arrange-Act-Assert)

```typescript
it('should validate user input', async () => {
  // Arrange: Setup mocks and data
  const mockUser = { id: 1, email: 'test@example.com' };
  mockRepository.findOne.mockResolvedValue(mockUser);

  // Act: Execute the function under test
  const result = await service.findByEmail('test@example.com');

  // Assert: Verify expected behavior
  expect(result).toEqual(mockUser);
  expect(mockRepository.findOne).toHaveBeenCalledWith({
    where: { email: 'test@example.com' },
  });
});
```

### Grouping con describe()

```typescript
describe('UsersService', () => {
  describe('create', () => {
    it('should create user successfully', () => {});
    it('should reject duplicate email', () => {});
    it('should throw error if save fails', () => {});
  });

  describe('BUG HUNTING: Edge Cases', () => {
    it('should handle null readings array', () => {});
    it('should prevent SQL injection in sortBy', () => {});
  });
});
```

---

## Cómo Ejecutar Tests

### Todos los tests

```bash
npm test
```

### Tests con coverage

```bash
npm run test:cov
```

**Thresholds configurados:**

- Líneas: 80%
- Branches: 70%
- Functions: 75%

### Test específico

```bash
# Por nombre de archivo
npm test -- users.service.spec.ts

# Por pattern
npm test -- auth

# Solo un test específico
npm test -- users.service.spec.ts -t "should create user"
```

### Watch mode (desarrollo)

```bash
npm run test:watch
```

**Útil para:** Desarrollo iterativo, refactoring

### E2E tests

```bash
npm run test:e2e
```

**Base de datos:** Usa `tarot_test` (configurado en `.env.test`)

### Debug tests

```bash
# Con logs completos
npm test -- --verbose

# Con debugger de Node.js
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Cómo Crear Nuevos Tests

### Checklist Obligatorio (TESTING_PHILOSOPHY.md)

Antes de escribir CUALQUIER test:

- [ ] Leí TODO el código relacionado (service, controller, repository, DTOs, entities)
- [ ] Identifiqué guards, validaciones y constraints
- [ ] Probé endpoints manualmente (Postman/curl) si aplica
- [ ] Identifiqué edge cases y vulnerabilidades
- [ ] Escribí tests que BUSCAN bugs, no que asumen corrección
- [ ] Cuando test falló, investigué código de producción
- [ ] Si encontré bugs, los CORREGÍ en producción
- [ ] Documenté bugs encontrados en commit message

### 1. Crear Unit Test para Service

```bash
# Archivo: src/modules/example/example.service.spec.ts
```

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExampleService } from './example.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Example } from './entities/example.entity';

describe('ExampleService', () => {
  let service: ExampleService;

  // Mock repository
  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: getRepositoryToken(Example),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('BUG HUNTING: findById validation', () => {
    it('should throw NotFoundException if id is negative', async () => {
      // BUG: Negative IDs should be rejected
      await expect(service.findById(-1)).rejects.toThrow('Invalid ID');
    });

    it('should return entity if found', async () => {
      const mockEntity = { id: 1, name: 'Test' };
      mockRepository.findOne.mockResolvedValue(mockEntity);

      const result = await service.findById(1);

      expect(result).toEqual(mockEntity);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
```

### 2. Crear Integration Test

```bash
# Archivo: test/example-integration.e2e-spec.ts
```

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  setupTestDatabase,
  cleanupTestDatabase,
} from './helpers/e2e-database.helper';

describe('Example Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupTestDatabase();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await app.close();
  });

  it('/POST /examples (should create example)', async () => {
    const response = await request(app.getHttpServer())
      .post('/examples')
      .send({ name: 'Test Example', value: 123 })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Example');
  });
});
```

### 3. Crear Factory para Test Data

```bash
# Archivo: test/helpers/factories/example.factory.ts
```

```typescript
import { Example } from '../../src/modules/example/entities/example.entity';

export class ExampleFactory {
  static create(overrides?: Partial<Example>): Example {
    return {
      id: 1,
      name: 'Test Example',
      value: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Example;
  }

  static createMany(count: number): Example[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({ id: i + 1, name: `Example ${i + 1}` }),
    );
  }
}
```

---

## Coverage Actual

### Estado Global (Actualizado: 2025-11-19)

| Métrica    | Actual | Target | Estado |
| ---------- | ------ | ------ | ------ |
| Statements | 39.49% | 80%    | ❌ Low |
| Branches   | 29.38% | 70%    | ❌ Low |
| Functions  | 32.03% | 75%    | ❌ Low |
| Lines      | 39.49% | 80%    | ❌ Low |

### Coverage por Módulo

| Módulo                  | Coverage | Tests Pasando | Bugs Encontrados  | Estado |
| ----------------------- | -------- | ------------- | ----------------- | ------ |
| InterpretationsService  | 85%+     | 16/16         | 5 bugs corregidos | ✅     |
| UsersService            | 84%      | 33/33         | 0 bugs (verified) | ✅     |
| Auth (Integration)      | N/A      | 15/16         | 1 skipped         | 🟡     |
| Reading Creation (Int.) | N/A      | 16/16         | 4 bugs corregidos | ✅     |

### Próximos Targets

**Prioridad Alta (Coverage <60%):**

1. ReadingValidatorService
2. TypeOrmReadingRepository (0%)
3. Use-cases (~23%)
4. Controllers (~48%)

**Prioridad Media (60-80%):**

1. Cache services
2. AI providers
3. Email service

---

## Best Practices

### 1. Mock External Services

```typescript
// ❌ MAL: Llamar servicios reales
it('should generate interpretation', async () => {
  const result = await service.callOpenAI(prompt); // Llama API real!
});

// ✅ BIEN: Mockear servicios externos
const mockAIProvider = {
  generateCompletion: jest.fn().mockResolvedValue({
    content: 'Mocked interpretation',
    provider: 'mock',
  }),
};
```

### 2. Test Edge Cases

```typescript
describe('BUG HUNTING: Edge Cases', () => {
  it('should reject empty input', () => {});
  it('should reject null input', () => {});
  it('should reject negative numbers', () => {});
  it('should handle very long strings', () => {});
  it('should prevent SQL injection', () => {});
});
```

### 3. Use Meaningful Test Names

```typescript
// ❌ MAL
it('works', () => {});
it('test 1', () => {});

// ✅ BIEN
it('should reject duplicate email (case-insensitive)', () => {});
it('should invalidate all tokens when plan changes', () => {});
```

### 4. Test One Thing Per Test

```typescript
// ❌ MAL: Test múltiples comportamientos
it('should create user and send email and log event', () => {
  // Testing 3 things at once
});

// ✅ BIEN: Separar en tests individuales
it('should create user successfully', () => {});
it('should send welcome email after creation', () => {});
it('should log user creation event', () => {});
```

### 5. Cleanup After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks(); // Limpiar mocks
});

afterAll(async () => {
  await cleanupTestDatabase(); // Limpiar BD
  await app.close(); // Cerrar app
});
```

---

## Debugging Tests

### 1. Ver Output Completo

```bash
npm test -- --verbose
```

### 2. Logs en Tests

```typescript
it('should debug issue', () => {
  console.log('Value:', someValue); // Visible en output
  expect(someValue).toBeDefined();
});
```

### 3. Isolate Failing Test

```typescript
// Solo ejecutar este test
it.only('should fail', () => {
  expect(1).toBe(2);
});

// Skip este test temporalmente
it.skip('should be fixed later', () => {
  // TODO: Fix this test
});
```

### 4. Debug con VSCode

**.vscode/launch.json:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${fileBasenameNoExtension}", "--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 5. Ver Coverage HTML

```bash
npm run test:cov
open coverage/lcov-report/index.html  # macOS/Linux
start coverage/lcov-report/index.html # Windows
```

---

## Ejemplos Reales

### Ejemplo 1: Bug Encontrado - Empty Cards Array

**Test que encontró el bug:**

```typescript
it('should reject empty cards array', async () => {
  await expect(service.generateInterpretation([], [])).rejects.toThrow(
    'Cards array cannot be empty',
  );
});
```

**Bug en producción:**

```typescript
// ANTES (código sin validación)
async generateInterpretation(cards: TarotCard[], positions: any[]) {
  // No validation - could crash with empty array!
  const interpretation = await this.aiProvider.generate(cards);
}

// DESPUÉS (bug corregido)
async generateInterpretation(cards: TarotCard[], positions: any[]) {
  if (!cards || cards.length === 0) {
    throw new BadRequestException('Cards array cannot be empty');
  }
  const interpretation = await this.aiProvider.generate(cards);
}
```

### Ejemplo 2: Bug Encontrado - SQL Injection Prevention

**Test que VERIFICÓ protección:**

```typescript
it('should prevent SQL injection in sortBy parameter', async () => {
  await service.findAllWithFilters({
    sortBy: 'email; DROP TABLE users--' as any,
  });

  // Should use default 'createdAt', NOT malicious value
  expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
    'user.createdAt',
    'DESC',
  );
});
```

**Código de producción (YA CORRECTO):**

```typescript
const allowedSortColumns: Record<string, string> = {
  createdAt: 'user.createdAt',
  lastLogin: 'user.lastLogin',
  email: 'user.email',
  name: 'user.name',
};
const sortColumn =
  allowedSortColumns[sortBy] || allowedSortColumns['createdAt'];
queryBuilder.orderBy(sortColumn, sortOrder); // Safe from SQL injection
```

---

## FAQs

### ¿Cuándo escribir unit tests vs integration tests?

- **Unit tests:** Para lógica de negocio compleja, cálculos, validaciones
- **Integration tests:** Para flujos completos que involucran múltiples módulos y BD
- **E2E tests:** Para user journeys críticos (registro → lectura → pago)

### ¿Cómo mockear TypeORM Repository?

```typescript
const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  }),
};
```

### ¿Qué hacer si un test falla en CI pero pasa localmente?

1. **Verificar variables de entorno:** `.env.test` vs CI config
2. **Timing issues:** Agregar `await` donde falte, usar `jest.setTimeout()`
3. **Database state:** Asegurar cleanup correcto en `afterEach`
4. **Dependencies:** Verificar versiones en `package-lock.json`

### ¿Cómo testear código asíncrono?

```typescript
// Usar async/await
it('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});

// Verificar que promise se rechaza
it('should reject invalid input', async () => {
  await expect(service.asyncMethod(null)).rejects.toThrow('Invalid input');
});
```

---

## Recursos

### Documentación Interna

- **[TESTING_PHILOSOPHY.md](./TESTING_PHILOSOPHY.md)** - Filosofía obligatoria de testing
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura del proyecto
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Guía de contribución

### Documentación Externa

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## Próximos Pasos

1. ✅ Alcanzar 80% coverage en servicios críticos:
   - InterpretationsService ✅ (85%)
   - UsersService ✅ (84%)
   - ReadingValidatorService ⏳
   - Cache services ⏳
2. ⏳ Crear tests E2E para flujos completos:
   - Usuario free: registro → lectura → alcanzar límite
   - Usuario premium: múltiples lecturas → regeneración
   - Admin: gestión de usuarios
3. ⏳ Configurar fixtures y factories reusables

4. ⏳ Performance tests para endpoints críticos

---

**Última actualización:** 2025-11-19  
**Versión:** 1.0.0  
**Próxima revisión:** Al completar TASK-059
