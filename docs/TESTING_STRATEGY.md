# 🧪 Estrategia de Testing - TarotFlavia

**Fecha:** 29 de Octubre, 2025  
**Proyecto:** TarotFlavia - Backend NestJS  
**Framework:** Jest + Supertest

> **⚠️ IMPORTANTE:** Esta estrategia se implementa completamente en **TASK-059: Testing Suite Completo** (⭐⭐⭐ CRÍTICA MVP).  
> Ver `backend/tarot-app/docs/project_backlog.md` líneas 3590-3650 para detalles de implementación.

---

## 📊 Estado Actual del Testing

### Tests Implementados ✅

- **Total de tests:** 196 pasando (post-refactoring TASK-001-a)
- **Módulos con tests:**
  - ✅ Auth (controller + service)
  - ✅ Cards (controller + service)
  - ✅ Decks (controller + service)
  - ✅ Spreads (controller + service)
  - ✅ Readings (controller + service)
  - ✅ Interpretations (service)
  - ✅ Categories (controller + service)
  - ✅ Seeders (cards, decks, spreads, categories)
  - ✅ Config (env validation)

### Coverage Actual

- **Estimado:** ~80% de cobertura
- **Metodología:** TDD aplicada desde TASK-001
- **Target MVP:** >80% code coverage (según TASK-059)

---

## 🎯 Tipos de Tests Necesarios

### 1. **Tests Unitarios** (Unit Tests)

**¿Qué son?** Prueban funciones/métodos individuales aislados.

**¿Cuándo crearlos?**

- ✅ **INMEDIATAMENTE** al desarrollar cada módulo (TDD)
- ✅ Antes de escribir el código de producción (fase RED)

**¿Dónde están?**

- `*.service.spec.ts` - Tests de servicios
- `*.controller.spec.ts` - Tests de controladores
- `*.seeder.spec.ts` - Tests de seeders

**Ejemplos implementados:**

```typescript
// cards.service.spec.ts
describe("CardsService", () => {
  it("should create a card", async () => {
    const result = await service.create(createCardDto);
    expect(result).toBeDefined();
    expect(result.name).toBe("The Fool");
  });

  it("should find all cards", async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(78);
  });
});
```

**Cobertura objetivo:** **90%** de servicios y controladores

---

### 2. **Tests de Integración** (Integration Tests)

**¿Qué son?** Prueban interacción entre módulos (Service + Repository + DB).

**¿Cuándo crearlos?**

- ⚠️ **DESPUÉS** de completar módulo completo
- ⚠️ Antes de marcar task como completada

**¿Dónde ubicarlos?**

- `test/integration/*.spec.ts` (carpeta dedicada)

**Ejemplo necesario:**

```typescript
// test/integration/readings.integration.spec.ts
describe("Readings Integration", () => {
  let app: INestApplication;
  let readingsService: ReadingsService;
  let cardsService: CardsService;
  let spreadsService: SpreadsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    readingsService = moduleRef.get(ReadingsService);
    cardsService = moduleRef.get(CardsService);
    spreadsService = moduleRef.get(SpreadsService);
  });

  it("should create reading with real database", async () => {
    const spread = await spreadsService.findOne(1);
    const cards = await cardsService.findAll();

    const reading = await readingsService.create(user, {
      spreadId: spread.id,
      question: "Test question",
      deckId: 1,
    });

    expect(reading).toBeDefined();
    expect(reading.cardPositions).toHaveLength(spread.cardCount);
  });
});
```

**Cobertura objetivo:** **70%** de flujos completos

---

### 3. **Tests E2E** (End-to-End Tests)

**¿Qué son?** Simulan requests HTTP reales al API.

**¿Cuándo crearlos?**

- 🟡 **ANTES** de considerar MVP listo para producción
- 🟡 Al completar cada Epic del backlog

**¿Dónde ubicarlos?**

- `test/*.e2e-spec.ts`

**Base de Datos E2E Dedicada:**

Este proyecto usa una **base de datos PostgreSQL dedicada** para tests E2E (puerto 5436), completamente aislada del entorno de desarrollo (puerto 5435).

**Características:**

- ✅ **E2EDatabaseHelper** - Clase helper para gestión automática del ciclo de vida
- ✅ **Seeders** - Datos de prueba consistentes (categorías, cartas, spreads, usuarios)
- ✅ **Limpieza automática** - `cleanDatabase()` entre tests para aislamiento
- ✅ **Docker profile `e2e`** - Contenedor separado del desarrollo
- ✅ **Usuarios de prueba**: `admin@test.com`, `premium@test.com`, `free@test.com` (password: `Test123456!`)

**Uso en tests E2E:**

```typescript
import { E2EDatabaseHelper } from "./helpers/e2e-database.helper";

const dbHelper = new E2EDatabaseHelper();

beforeAll(async () => {
  await dbHelper.initialize(); // Conecta a E2E DB (puerto 5436)
  await dbHelper.cleanDatabase(); // Limpia datos previos

  // Seed datos de prueba
  const dataSource = dbHelper.getDataSource();
  await seedReadingCategories(dataSource.getRepository(ReadingCategory));
  await seedTarotCards(dataSource.getRepository(TarotCard));
  // ...
});

afterAll(async () => {
  await dbHelper.close(); // Cierra conexión limpiamente
  await app.close();
});
```

**Gestión de E2E Database:**

```bash
# Iniciar E2E database
./scripts/manage-e2e-db.sh start

# Setup completo (migraciones + seeders)
./scripts/manage-e2e-db.sh setup

# Ejecutar tests E2E
npm run test:e2e

# Limpiar datos
./scripts/manage-e2e-db.sh clean

# Resetear completamente
./scripts/manage-e2e-db.sh reset
```

Ver [README-DOCKER.md](../backend/tarot-app/docs/README-DOCKER.md#-base-de-datos-de-testing-e2e) para documentación completa.

**Ejemplo ya existente:**

```typescript
// test/app.e2e-spec.ts
describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer()).get("/").expect(200).expect("Hello World!");
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Tests E2E necesarios para MVP:**

```typescript
// test/auth.e2e-spec.ts
describe("Authentication E2E", () => {
  it("should register new user", () => {
    return request(app.getHttpServer())
      .post("/auth/register")
      .send({ email: "test@test.com", password: "Test1234!" })
      .expect(201);
  });

  it("should login user", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@test.com", password: "Test1234!" })
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });
});
```

**Cobertura objetivo:** **100%** de endpoints críticos

---

## 📋 Tareas de Testing por Epic

### Epic 1: Estabilización de Base

#### TASK-002: Migraciones

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Migración genera tablas correctamente
- [ ] Script de rollback funciona
- [ ] No hay pérdida de datos

# Tests de integración
- [ ] Migración run + revert ciclo completo
- [ ] Seeder funciona después de migración
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-002  
**Tipo:** Integración  
**Ubicación:** `test/integration/migrations.spec.ts`

---

#### TASK-003: Validación de Variables

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Valida variables de DB correctamente
- [ ] Rechaza variables inválidas
- [ ] Mensajes de error claros

# Tests E2E
- [ ] App no arranca sin OPENAI_API_KEY
- [ ] App no arranca sin JWT_SECRET
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-003  
**Tipo:** Unitario + E2E  
**Ubicación:** `src/config/env-validator.spec.ts`

---

#### TASK-004: OpenAI Config

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Health check detecta API key inválida
- [ ] Timeout configurado correctamente

# Tests de integración
- [ ] Llamada real a OpenAI funciona
- [ ] Logging de uso se registra

# Tests E2E
- [ ] Endpoint /health/openai responde 200
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-004  
**Tipo:** Unitario + Integración + E2E  
**Ubicación:** `src/interpretations/openai-health.spec.ts`

---

### Epic 2: Categorías y Preguntas

#### TASK-008: Seeder Categorías

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Seeder crea 6 categorías
- [ ] Idempotencia (múltiples ejecuciones)
- [ ] Validación de campos requeridos
```

**Cuándo:** ✅ AHORA (al completar seeder)  
**Tipo:** Unitario  
**Ubicación:** `src/database/seeds/categories.seeder.spec.ts`

---

#### TASK-009: Módulo Preguntas

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Service crea pregunta
- [ ] Service filtra por categoría
- [ ] Controller protege endpoints admin

# Tests de integración
- [ ] GET /predefined-questions?categoryId=1
- [ ] POST /predefined-questions (admin only)

# Tests E2E
- [ ] Usuario puede listar preguntas
- [ ] Usuario no-admin no puede crear
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-009  
**Tipo:** Unitario + Integración + E2E  
**Ubicación:**

- `src/predefined-questions/*.spec.ts`
- `test/predefined-questions.e2e-spec.ts`

---

#### TASK-010: Seeder Preguntas

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Seeder crea mínimo 30 preguntas
- [ ] Distribución por categoría correcta
- [ ] Relaciones con categorías válidas
```

**Cuándo:** ✅ AHORA (al completar seeder)  
**Tipo:** Unitario  
**Ubicación:** `src/database/seeds/questions.seeder.spec.ts`

---

### Epic 3: Planes y Límites

#### TASK-011: Planes en User

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Método isPremium() funciona
- [ ] Método hasPlanExpired() valida fechas
- [ ] JWT incluye información de plan

# Tests de integración
- [ ] Usuario free tiene plan='free'
- [ ] Usuario premium tiene plan='premium'
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-011  
**Tipo:** Unitario + Integración  
**Ubicación:** `src/users/user.entity.spec.ts`

---

#### TASK-012: Sistema de Límites

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] checkLimit() retorna false cuando excede
- [ ] incrementUsage() suma correctamente
- [ ] getRemainingUsage() calcula bien
- [ ] Reset diario funciona

# Tests de integración
- [ ] Usuario free bloqueado después de 3 lecturas
- [ ] Usuario premium ilimitado
- [ ] Contadores se resetean a medianoche

# Tests E2E
- [ ] POST /readings retorna 429 al exceder límite
- [ ] Premium puede hacer más de 3 lecturas
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-012  
**Tipo:** Unitario + Integración + E2E  
**Ubicación:**

- `src/usage-limits/*.spec.ts`
- `test/usage-limits.e2e-spec.ts`

---

#### TASK-013: Lecturas Híbridas

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] DTO valida pregunta predefinida para free
- [ ] DTO acepta pregunta custom para premium
- [ ] Guard rechaza custom para free

# Tests de integración
- [ ] Lectura con predefined_question_id
- [ ] Lectura con custom_question (premium)
- [ ] Error claro para free con custom

# Tests E2E (CRÍTICOS)
- [ ] Usuario FREE crea lectura con pregunta predefinida
- [ ] Usuario FREE rechazado con pregunta custom
- [ ] Usuario PREMIUM crea lectura con custom
- [ ] Usuario PREMIUM puede usar predefinidas también
```

**Cuándo:** 🔴 ANTES de marcar TASK-013 completa  
**Tipo:** Unitario + Integración + E2E  
**Ubicación:**

- `src/readings/*.spec.ts`
- `test/readings-hybrid.e2e-spec.ts`

**Importancia:** ⭐⭐⭐ CRÍTICO - Es el diferenciador del negocio

---

### Epic 4: Seguridad

#### TASK-014: Rate Limiting

**Tests necesarios:**

```bash
# Tests E2E (CRÍTICOS)
- [ ] Endpoint rechaza después de límite
- [ ] Headers X-RateLimit-* presentes
- [ ] Límite diferente para premium

# Tests de integración
- [ ] ThrottlerModule configurado correctamente
- [ ] Storage funciona (in-memory o Redis)
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-014  
**Tipo:** E2E + Integración  
**Ubicación:** `test/rate-limiting.e2e-spec.ts`

---

#### TASK-018: Optimizar Prompts

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Prompt incluye spread correctamente
- [ ] Prompt incluye cartas con significados
- [ ] Prompt respeta límite de tokens
- [ ] Estructura de respuesta validada

# Tests de integración (con mock de OpenAI)
- [ ] Prompt generado es coherente
- [ ] Respuesta parseada correctamente

# Tests E2E (opcional, con API real)
- [ ] Interpretación generada es útil
- [ ] Tiempo de respuesta <10s
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-018  
**Tipo:** Unitario + Integración  
**Ubicación:** `src/interpretations/prompts.spec.ts`

---

#### TASK-019: Logging OpenAI

**Tests necesarios:**

```bash
# Tests unitarios
- [ ] Log se crea con todos los campos
- [ ] Costo calculado correctamente
- [ ] Duración medida en ms

# Tests de integración
- [ ] Llamada a OpenAI registra log
- [ ] Error de OpenAI registra log con status error

# Tests E2E
- [ ] Endpoint admin retorna estadísticas
- [ ] Estadísticas calculan totales correctamente
```

**Cuándo:** ⚠️ Durante desarrollo de TASK-019  
**Tipo:** Unitario + Integración + E2E  
**Ubicación:**

- `src/openai-usage/*.spec.ts`
- `test/admin/openai-stats.e2e-spec.ts`

---

## 🎯 Tests E2E Críticos para MVP

### Suite Completa de Tests E2E (OBLIGATORIOS antes de producción)

```typescript
// test/mvp-complete.e2e-spec.ts
describe("MVP Complete Flow E2E", () => {
  let accessToken: string;
  let userId: number;

  describe("1. Authentication Flow", () => {
    it("should register free user", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "freeuser@test.com",
          password: "Test1234!",
          name: "Free User",
        })
        .expect(201);

      userId = res.body.id;
    });

    it("should login and receive JWT", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "freeuser@test.com",
          password: "Test1234!",
        })
        .expect(200);

      accessToken = res.body.access_token;
      expect(accessToken).toBeDefined();
    });
  });

  describe("2. Categories Flow", () => {
    it("should list all categories", async () => {
      const res = await request(app.getHttpServer()).get("/categories").expect(200);

      expect(res.body).toHaveLength(6);
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("icon");
    });
  });

  describe("3. Predefined Questions Flow (FREE)", () => {
    it("should list questions by category", async () => {
      const res = await request(app.getHttpServer()).get("/predefined-questions?categoryId=1").expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(5);
      expect(res.body[0]).toHaveProperty("questionText");
    });
  });

  describe("4. Reading Creation Flow (FREE)", () => {
    it("should create reading with predefined question", async () => {
      const res = await request(app.getHttpServer())
        .post("/readings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          spreadId: 1,
          deckId: 1,
          categoryId: 1,
          predefinedQuestionId: 1,
          generateInterpretation: true,
        })
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("interpretation");
      expect(res.body.cardPositions).toBeDefined();
    });

    it("should reject custom question for free user", async () => {
      await request(app.getHttpServer())
        .post("/readings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          spreadId: 1,
          deckId: 1,
          categoryId: 1,
          customQuestion: "My custom question",
          generateInterpretation: true,
        })
        .expect(403); // Forbidden
    });

    it("should enforce daily limit (3 readings)", async () => {
      // Create 2nd reading
      await request(app.getHttpServer())
        .post("/readings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ spreadId: 1, deckId: 1, predefinedQuestionId: 1 })
        .expect(201);

      // Create 3rd reading
      await request(app.getHttpServer())
        .post("/readings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ spreadId: 1, deckId: 1, predefinedQuestionId: 1 })
        .expect(201);

      // 4th reading should fail
      await request(app.getHttpServer())
        .post("/readings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ spreadId: 1, deckId: 1, predefinedQuestionId: 1 })
        .expect(429); // Too Many Requests
    });
  });

  describe("5. Reading History Flow", () => {
    it("should list user readings", async () => {
      const res = await request(app.getHttpServer())
        .get("/readings")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.length).toBe(3); // From previous tests
    });

    it("should get single reading details", async () => {
      const res = await request(app.getHttpServer())
        .get("/readings/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty("interpretation");
      expect(res.body).toHaveProperty("cards");
    });
  });

  describe("6. Premium User Flow", () => {
    let premiumToken: string;

    it("should register premium user", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "premium@test.com",
          password: "Test1234!",
          name: "Premium User",
        })
        .expect(201);
    });

    it("should upgrade to premium (admin action)", async () => {
      // Simula acción de admin cambiando plan
      // En producción sería vía Stripe webhook
    });

    it("should create reading with custom question", async () => {
      const loginRes = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "premium@test.com", password: "Test1234!" })
        .expect(200);

      premiumToken = loginRes.body.access_token;

      const res = await request(app.getHttpServer())
        .post("/readings")
        .set("Authorization", `Bearer ${premiumToken}`)
        .send({
          spreadId: 2, // 3-card spread
          deckId: 1,
          categoryId: 2, // Work category
          customQuestion: "¿Cómo mejorar mi carrera profesional?",
          generateInterpretation: true,
        })
        .expect(201);

      expect(res.body.customQuestion).toBe("¿Cómo mejorar mi carrera profesional?");
    });

    it("should allow unlimited readings", async () => {
      // Create 10 readings (more than free limit)
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post("/readings")
          .set("Authorization", `Bearer ${premiumToken}`)
          .send({ spreadId: 1, deckId: 1, customQuestion: `Test ${i}` })
          .expect(201);
      }
    });
  });

  describe("7. Rate Limiting", () => {
    it("should enforce global rate limit", async () => {
      // Make 101 requests rapidly (exceeds 100/min limit)
      const requests = [];
      for (let i = 0; i < 101; i++) {
        requests.push(request(app.getHttpServer()).get("/categories"));
      }

      const results = await Promise.all(requests);
      const tooManyRequests = results.filter((r) => r.status === 429);

      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
```

**Cuándo ejecutar:**

- ✅ Antes de cada commit a `main`
- ✅ Antes de cada deploy a producción
- ✅ En CI/CD pipeline

---

## 🔄 Estrategia de Testing por Fase

### Fase 1: Durante Desarrollo (TDD)

```bash
# Al crear cada feature:
1. Escribir test que falla (RED)
2. Implementar código mínimo (GREEN)
3. Refactorizar (REFACTOR)
4. Commit con tests pasando

# Comandos:
npm run test               # Tests unitarios
npm run test:watch         # Modo watch
npm run test:cov           # Con coverage
```

### Fase 2: Al Completar Módulo

```bash
# Antes de marcar task completa:
1. Tests unitarios ✅ (>90% coverage)
2. Tests de integración ✅
3. npm run test -- --coverage
4. Verificar coverage >80%

# Comandos:
npm run test:integration   # Solo integración
npm run test:cov           # Coverage report
```

### Fase 3: Antes de Merge a Main

```bash
# CI/CD Pipeline:
1. npm run test            # Unitarios
2. npm run test:e2e        # E2E completo
3. npm run test:cov        # Coverage
4. Lint + Format
5. Build exitoso

# Manual:
npm run test:e2e           # E2E
npm run lint               # Linting
npm run build              # Compilación
```

### Fase 4: Antes de Deploy Producción

```bash
# Checklist completo:
✅ Todos los tests unitarios pasan
✅ Todos los tests integración pasan
✅ Suite E2E MVP completa pasa
✅ Coverage >80%
✅ No hay warnings de lint
✅ Build exitoso
✅ Migraciones probadas
✅ Seeders ejecutados exitosamente

# Comandos finales:
npm run test:all           # Todos los tipos
npm run test:cov           # Coverage final
npm run migration:run      # Migraciones
npm run seed               # Seeders
```

---

## 📁 Estructura de Carpetas de Tests

```
backend/tarot-app/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts      ← Tests unitarios
│   │   ├── auth.controller.ts
│   │   └── auth.controller.spec.ts   ← Tests unitarios
│   ├── readings/
│   │   ├── readings.service.spec.ts
│   │   └── readings.controller.spec.ts
│   ├── database/
│   │   └── seeds/                     ← Seeders para datos de prueba
│   └── ...
├── test/
│   ├── helpers/
│   │   └── e2e-database.helper.ts    ← Helper para E2E DB management
│   ├── app.e2e-spec.ts               ← E2E básico
│   ├── predefined-questions.e2e-spec.ts ← E2E preguntas
│   ├── mvp-complete.e2e-spec.ts      ← Suite MVP completa
│   ├── password-recovery.e2e-spec.ts ← E2E password reset
│   ├── readings-hybrid.e2e-spec.ts   ← E2E lecturas híbridas
│   ├── rate-limiting.e2e-spec.ts     ← E2E rate limiting
│   ├── integration/
│   │   ├── readings.integration.spec.ts
│   │   ├── migrations.spec.ts
│   │   └── seeders.spec.ts
│   ├── jest-e2e.json                 ← Config Jest E2E
│   └── setup/
│       ├── setup-e2e-db.ts           ← Setup E2E database
│       └── teardown-e2e-db.ts        ← Teardown E2E database
├── scripts/
│   └── manage-e2e-db.sh              ← Script gestión E2E DB
├── coverage/                          ← Reports de coverage
└── package.json
```

**Archivos clave de E2E:**

- `test/helpers/e2e-database.helper.ts` - Clase helper para gestión de E2E DB
- `test/setup/setup-e2e-db.ts` - Inicializa E2E database con migraciones y seeders
- `test/setup/teardown-e2e-db.ts` - Limpia E2E database después de tests
- `scripts/manage-e2e-db.sh` - Script bash para gestión completa de E2E DB
- `typeorm-e2e.config.ts` - Configuración TypeORM para E2E database (puerto 5436)

---

## ⚙️ Configuración de Jest

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:integration": "jest --config ./test/jest-integration.json",
    "test:all": "npm run test && npm run test:e2e && npm run test:integration"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s", "!**/*.spec.ts", "!**/node_modules/**"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## 📊 Coverage Goals

### Mínimo Aceptable (MVP)

- **Servicios:** 90%
- **Controladores:** 85%
- **Guards/Pipes:** 95%
- **Global:** 80%

### Ideal (Producción)

- **Servicios:** 95%
- **Controladores:** 90%
- **Guards/Pipes:** 100%
- **Global:** 90%

---

## 🚨 Tests Críticos NO Negociables para MVP

```bash
# Estos tests DEBEN pasar antes de producción:

✅ Usuario puede registrarse
✅ Usuario puede hacer login
✅ JWT funciona correctamente
✅ Usuario FREE crea lectura con pregunta predefinida
✅ Usuario FREE rechazado con pregunta custom
✅ Usuario PREMIUM crea lectura con custom
✅ Límite de 3 lecturas/día para FREE
✅ PREMIUM ilimitado
✅ Interpretación con IA se genera
✅ Historial de lecturas funciona
✅ Rate limiting protege endpoints
✅ OpenAI health check funciona
```

**Total:** 12 tests E2E críticos

---

## 📝 Checklist de Testing por Task

### Template para cada Task:

```markdown
## TASK-XXX: [Nombre]

### Tests Unitarios

- [ ] Service: método1()
- [ ] Service: método2()
- [ ] Controller: endpoint1()
- [ ] DTO validations

### Tests de Integración

- [ ] Flujo completo con DB
- [ ] Relaciones entre entidades

### Tests E2E

- [ ] Happy path
- [ ] Error handling
- [ ] Edge cases

### Coverage

- [ ] > 90% en servicios
- [ ] > 85% en controladores
- [ ] > 80% global

### Documentación

- [ ] README actualizado
- [ ] Swagger docs
```

---

## 🎯 Resumen Ejecutivo

### Tests por Tipo

| Tipo            | Cuándo                   | Dónde                | Obligatorio MVP  |
| --------------- | ------------------------ | -------------------- | ---------------- |
| **Unitarios**   | Durante desarrollo (TDD) | `*.spec.ts`          | ✅ SÍ            |
| **Integración** | Al completar módulo      | `test/integration/`  | ⚠️ RECOMENDADO   |
| **E2E**         | Antes de deploy          | `test/*.e2e-spec.ts` | ✅ SÍ (críticos) |

### Tasks que REQUIEREN E2E antes de completar:

- TASK-013: Lecturas Híbridas ⭐⭐⭐
- TASK-012: Sistema de Límites ⭐⭐
- TASK-014: Rate Limiting ⭐⭐
- TASK-004: OpenAI Config ⭐

### Tests ya implementados: ✅

- 103 tests unitarios pasando
- Cobertura ~75-80%
- TDD aplicado desde TASK-001

### Tests pendientes críticos: ⚠️

- Suite E2E completa para MVP
- Tests de integración para lecturas
- Tests E2E de sistema híbrido (free vs premium)

---

## 💡 Recomendaciones Finales

1. **Continuar con TDD:** No escribir código sin test primero
2. **E2E progresivo:** Agregar tests E2E al completar cada Epic
3. **CI/CD obligatorio:** Configurar GitHub Actions con tests
4. **Coverage mínimo:** No permitir merge <80% coverage
5. **Suite MVP:** Ejecutar `mvp-complete.e2e-spec.ts` antes de producción

---

## 🎯 Implementación: TASK-059

Esta estrategia se implementa completamente en **TASK-059: Implementar Testing Suite Completo**.

### Alcance de TASK-059 (5 días, ⭐⭐⭐ CRÍTICA)

**Tests Unitarios:**

- ✅ Todos los servicios con >80% coverage
- ✅ Guards (RolesGuard, UsageLimitGuard, etc.)
- ✅ Pipes e interceptors

**Tests de Integración:**

- ✅ Auth flow completo (register → login → protected endpoint)
- ✅ Reading creation flow completo
- ✅ Admin operations con DB de test

**Tests E2E:**

- ✅ Usuario FREE: registro → lectura → límite alcanzado
- ✅ Usuario PREMIUM: múltiples lecturas → regeneración
- ✅ Admin: gestión de usuarios y contenido
- ✅ Los 12 tests críticos listados en este documento

**Infraestructura:**

- ✅ DB `tarot_test` separada
- ✅ Factories para fixtures (users, readings)
- ✅ Mocks de OpenAI API
- ✅ Coverage reports (HTML local + JSON para CI)
- ✅ Script `npm run test:watch` para desarrollo

### Tareas Relacionadas

- **TASK-019-a:** Suite E2E completa (ya marcada ⭐⭐⭐ CRÍTICA)
- **TASK-059:** Testing Suite completo (implementación de esta estrategia)

**Criterios de aceptación (según backlog):**

- ✓ Coverage supera 80% en servicios críticos
- ✓ Todos los tests pasan consistentemente
- ✓ Los tests son rápidos (<5 min total)

**Próximo paso:** Ejecutar TASK-059 después de completar funcionalidades core del MVP.
