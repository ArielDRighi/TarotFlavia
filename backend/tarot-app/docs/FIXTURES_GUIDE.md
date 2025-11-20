# Test Fixtures & Factories - Guía de Uso

## 📖 Introducción

Este documento explica cómo usar fixtures y factories para crear datos de prueba consistentes y mantenibles.

---

## 🏭 Factories vs Fixtures

### **Factories** (Patrones dinámicos)

- **Ubicación:** `test/helpers/factories/`
- **Propósito:** Crear **instancias de entidades** con valores por defecto razonables
- **Cuándo usar:** Cuando necesitas crear objetos TypeORM completos con métodos
- **Características:**
  - Incrementan IDs automáticamente
  - Permiten sobrescribir valores
  - Generan passwords hasheados
  - Retornan instancias de clases (User, TarotReading, etc.)

### **Fixtures** (Datos estáticos)

- **Ubicación:** `test/helpers/fixtures.ts` y `fixtures-advanced.ts`
- **Propósito:** Proporcionar **datos de prueba reutilizables** (POJOs)
- **Cuándo usar:** Cuando necesitas datos consistentes entre tests
- **Características:**
  - Datos inmutables
  - Siempre los mismos valores
  - Objetos planos (no instancias de clases)
  - Fácil de leer y mantener

---

## 🔧 Factories - Guía de Uso

### UserFactory

**Archivo:** `test/helpers/factories/user.factory.ts`

#### Crear usuario básico:

```typescript
import { UserFactory } from './helpers/factories/user.factory';

const user = await UserFactory.create();
// { id: 1, email: 'user1@test.com', name: 'Test User 1', plan: 'free', ... }
```

#### Sobrescribir valores:

```typescript
const admin = await UserFactory.create({
  email: 'custom@admin.com',
  isAdmin: true,
});
```

#### Usar métodos helper:

```typescript
// Usuario admin
const admin = await UserFactory.createAdmin();

// Usuario premium
const premium = await UserFactory.createPremium();

// Usuario free
const free = await UserFactory.createFree();

// Usuario baneado
const banned = await UserFactory.createBanned({
  banReason: 'Spam detected',
});

// Múltiples usuarios
const users = await UserFactory.createMany(10);
```

#### Resetear contador:

```typescript
beforeEach(() => {
  UserFactory.resetCounter(); // Empieza desde id: 1
});
```

**⚠️ IMPORTANTE:**

- `create()` retorna instancia de `User` (clase TypeORM)
- Passwords son automáticamente hasheados con bcrypt
- IDs incrementan automáticamente (1, 2, 3, ...)

---

### ReadingFactory

**Archivo:** `test/helpers/factories/reading.factory.ts`

#### Crear lectura básica:

```typescript
import { ReadingFactory } from './helpers/factories/reading.factory';

const reading = ReadingFactory.create({
  question: 'Should I change jobs?',
  tarotistaId: 1,
});
```

#### Métodos helper:

```typescript
// Lectura compartida
const shared = ReadingFactory.createShared({
  sharedToken: 'my-custom-token',
});

// Lectura eliminada (soft delete)
const deleted = ReadingFactory.createDeleted();

// Múltiples lecturas
const readings = ReadingFactory.createMany(20);
```

---

### SpreadFactory

**Archivo:** `test/helpers/factories/spread.factory.ts`

#### Spreads predefinidos:

```typescript
import { SpreadFactory } from './helpers/factories/spread.factory';

// Tirada de 3 cartas
const threeCard = SpreadFactory.createThreeCardSpread();

// Una carta
const single = SpreadFactory.createSingleCardSpread();

// Cruz Celta (10 cartas)
const celticCross = SpreadFactory.createCelticCross();
```

#### Spread personalizado:

```typescript
const custom = SpreadFactory.create({
  name: 'Yes/No Spread',
  cardCount: 1,
  difficulty: 'beginner',
  positions: [{ name: 'Answer', description: 'Yes or No' }],
});
```

---

### CardFactory

**Archivo:** `test/helpers/factories/card.factory.ts`

#### Crear cartas:

```typescript
import { CardFactory } from './helpers/factories/card.factory';

// Carta básica
const card = CardFactory.create({
  name: 'The Fool',
  number: 0,
});

// Arcano Mayor
const major = CardFactory.createMajorArcana();

// Arcano Menor
const minor = CardFactory.createMinorArcana();

// Tirada de 3 cartas clásicas
const cards = CardFactory.createThreeCardSpread();
// [The Fool, The Magician, The High Priestess]
```

---

## 📦 Fixtures - Guía de Uso

### Fixtures Básicas

**Archivo:** `test/helpers/fixtures.ts`

#### Usar usuarios predefinidos:

```typescript
import { MOCK_USERS } from './helpers/fixtures';

// En tus tests
const { admin, premiumUser, freeUser, bannedUser } = MOCK_USERS;

// Ejemplo en test
it('should allow admin access', () => {
  const user = MOCK_USERS.admin;
  expect(user.isAdmin).toBe(true);
});
```

#### Usar cartas predefinidas:

```typescript
import { MOCK_CARDS } from './helpers/fixtures';

const { theFool, theMagician, theHighPriestess } = MOCK_CARDS;

// En test
expect(theFool.number).toBe(0);
expect(theFool.name).toBe('The Fool');
```

#### Usar spreads predefinidos:

```typescript
import { MOCK_SPREADS } from './helpers/fixtures';

const { threeCard, singleCard, celticCross } = MOCK_SPREADS;

expect(threeCard.cardCount).toBe(3);
expect(celticCross.difficulty).toBe('advanced');
```

#### Usar respuestas de AI mockeadas:

```typescript
import { MOCK_AI_RESPONSE } from './helpers/fixtures';

// Mockear respuesta de AI provider
mockAIProvider.generateCompletion.mockResolvedValue(MOCK_AI_RESPONSE);

// Verificar
expect(result.content).toContain('Visión General');
expect(result.provider).toBe('groq');
```

#### Usar fechas consistentes:

```typescript
import { MOCK_DATES } from './helpers/fixtures';

const { now, yesterday, tomorrow, lastWeek } = MOCK_DATES;

// En test
expect(reading.createdAt).toEqual(MOCK_DATES.now);
```

---

### Fixtures Avanzadas (Edge Cases)

**Archivo:** `test/helpers/fixtures-advanced.ts`

#### Usuarios con casos edge:

```typescript
import { EDGE_CASE_USERS } from './helpers/fixtures-advanced';

// Usuario con email muy largo
const longEmail = EDGE_CASE_USERS.longEmail;
expect(longEmail.email.length).toBeGreaterThan(100);

// Usuario que nunca se logueó
const neverLoggedIn = EDGE_CASE_USERS.neverLoggedIn;
expect(neverLoggedIn.lastLogin).toBeNull();

// Usuario inactivo hace años
const inactive = EDGE_CASE_USERS.inactiveUser;
expect(inactive.lastLogin).toBeDefined();
```

#### Lecturas con casos edge:

```typescript
import { EDGE_CASE_READINGS } from './helpers/fixtures-advanced';

// Lectura con pregunta extremadamente larga
const longQ = EDGE_CASE_READINGS.longQuestion;
expect(longQ.question.length).toBe(500);

// Todas las cartas invertidas
const reversed = EDGE_CASE_READINGS.allReversed;
expect(reversed.cardPositions.every((c) => c.isReversed)).toBe(true);

// Lectura con máximas regeneraciones
const maxRegen = EDGE_CASE_READINGS.maxRegenerations;
expect(maxRegen.regenerationCount).toBe(5);
```

#### Respuestas de AI con casos edge:

```typescript
import { EDGE_CASE_AI_RESPONSES } from './helpers/fixtures-advanced';

// Respuesta muy corta (posible error)
const short = EDGE_CASE_AI_RESPONSES.tooShort;
expect(short.content.length).toBeLessThan(10);

// Respuesta con HTML malicioso (debe sanitizarse)
const malicious = EDGE_CASE_AI_RESPONSES.maliciousHTML;
expect(malicious.content).toContain('<script>');

// Respuesta vacía (error crítico)
const empty = EDGE_CASE_AI_RESPONSES.empty;
expect(empty.content).toBe('');
```

#### Fechas edge:

```typescript
import { EDGE_CASE_DATES } from './helpers/fixtures-advanced';

// Fecha muy antigua
const old = EDGE_CASE_DATES.veryOld;
expect(old.getFullYear()).toBe(1970);

// Día bisiesto
const leap = EDGE_CASE_DATES.leapDay;
expect(leap.getMonth()).toBe(1); // Febrero (0-indexed)
expect(leap.getDate()).toBe(29);
```

---

## 🎯 Patrones de Uso Recomendados

### Pattern 1: Factory + Fixtures combinados

```typescript
import { UserFactory } from './helpers/factories/user.factory';
import { MOCK_SPREADS } from './helpers/fixtures';

it('should create reading with factory user and fixture spread', async () => {
  // Factory para usuario (necesita password hasheado)
  const user = await UserFactory.create();

  // Fixture para spread (datos estáticos)
  const spread = MOCK_SPREADS.threeCard;

  const reading = await service.createReading({
    userId: user.id,
    spreadId: spread.id,
    question: 'Test question',
  });

  expect(reading).toBeDefined();
});
```

### Pattern 2: Fixtures para mocks

```typescript
import { MOCK_AI_RESPONSE, MOCK_USERS } from './helpers/fixtures';

it('should use fixture data for mocks', async () => {
  // Mock con fixture
  mockAIProvider.generateCompletion.mockResolvedValue(MOCK_AI_RESPONSE);

  // Usuario de fixture
  const user = MOCK_USERS.premiumUser;

  const result = await service.interpretReading(user.id, readingId);
  expect(result.content).toContain('Visión General');
});
```

### Pattern 3: Edge cases con fixtures avanzadas

```typescript
import {
  EDGE_CASE_USERS,
  EDGE_CASE_READINGS,
} from './helpers/fixtures-advanced';

describe('Edge Cases', () => {
  it('should handle user with very long email', async () => {
    const user = EDGE_CASE_USERS.longEmail;
    // Test validación...
  });

  it('should handle reading with all reversed cards', async () => {
    const reading = EDGE_CASE_READINGS.allReversed;
    // Test interpretación...
  });
});
```

### Pattern 4: Reset entre tests

```typescript
import { UserFactory } from './helpers/factories/user.factory';
import { ReadingFactory } from './helpers/factories/reading.factory';

describe('Isolated Tests', () => {
  beforeEach(() => {
    // Reset contadores para tests aislados
    UserFactory.resetCounter();
    ReadingFactory.resetCounter();
  });

  it('should create user with id 1', async () => {
    const user = await UserFactory.create();
    expect(user.id).toBe(1); // Siempre 1 gracias a reset
  });
});
```

---

## 📋 Checklist: ¿Factory o Fixture?

Usa **Factory** cuando:

- ✅ Necesitas instancias de clases TypeORM
- ✅ Requieres password hasheado (bcrypt)
- ✅ Necesitas IDs auto-incrementales
- ✅ Quieres sobrescribir valores fácilmente
- ✅ Vas a guardar en base de datos

Usa **Fixture** cuando:

- ✅ Necesitas datos consistentes entre tests
- ✅ Solo requieres objetos planos (POJOs)
- ✅ Estás mockeando respuestas de servicios
- ✅ Pruebas de validación de datos
- ✅ Casos edge documentados

---

## 🚫 Antipatrones - Qué NO Hacer

### ❌ NO crear datos inline repetitivamente

```typescript
// ❌ MAL - Datos duplicados en cada test
it('test 1', () => {
  const user = { id: 1, email: 'test@test.com', name: 'Test', ... };
});

it('test 2', () => {
  const user = { id: 1, email: 'test@test.com', name: 'Test', ... };
});

// ✅ BIEN - Usar factory o fixture
import { UserFactory } from './helpers/factories/user.factory';

it('test 1', async () => {
  const user = await UserFactory.create();
});

it('test 2', async () => {
  const user = await UserFactory.create();
});
```

### ❌ NO mezclar datos de prueba con lógica de test

```typescript
// ❌ MAL - Lógica mezclada
it('should validate user', async () => {
  const user = new User();
  user.id = 1;
  user.email = 'test@test.com';
  user.password = await bcrypt.hash('Test1234!', 10);
  user.name = 'Test User';
  // ... más lógica de setup

  // Finalmente el test real
  expect(await service.validate(user)).toBe(true);
});

// ✅ BIEN - Separar setup
it('should validate user', async () => {
  const user = await UserFactory.create();
  expect(await service.validate(user)).toBe(true);
});
```

### ❌ NO usar fixtures para datos que cambian

```typescript
// ❌ MAL - Modificar fixture
import { MOCK_USERS } from './helpers/fixtures';

it('should update user name', () => {
  MOCK_USERS.freeUser.name = 'New Name'; // ❌ Muta fixture!
  // Esto afecta otros tests...
});

// ✅ BIEN - Copiar o usar factory
it('should update user name', async () => {
  const user = await UserFactory.create({ ...MOCK_USERS.freeUser });
  user.name = 'New Name'; // ✅ Solo afecta esta copia
});
```

### ❌ NO hardcodear valores que deberían ser fixtures

```typescript
// ❌ MAL - Valores hardcodeados
it('should interpret reading', async () => {
  mockAI.mockResolvedValue({
    content: '## Interpretation\n\nLong hardcoded text...',
    provider: 'groq',
    // ... más campos
  });
});

// ✅ BIEN - Usar fixture
import { MOCK_AI_RESPONSE } from './helpers/fixtures';

it('should interpret reading', async () => {
  mockAI.mockResolvedValue(MOCK_AI_RESPONSE);
});
```

---

## 📚 Ejemplos Completos

### Ejemplo 1: Test de integración con factories

```typescript
import { UserFactory } from './helpers/factories/user.factory';
import { SpreadFactory } from './helpers/factories/spread.factory';
import { CardFactory } from './helpers/factories/card.factory';

describe('Reading Creation (Integration)', () => {
  it('should create complete reading with all relations', async () => {
    // Setup usando factories
    const user = await UserFactory.createPremium();
    const spread = SpreadFactory.createThreeCardSpread();
    const cards = CardFactory.createThreeCardSpread();

    // Guardar en DB
    await userRepo.save(user);
    await spreadRepo.save(spread);
    await cardRepo.save(cards);

    // Test real
    const reading = await service.createReading({
      userId: user.id,
      spreadId: spread.id,
      cardIds: cards.map((c) => c.id),
    });

    expect(reading.user.id).toBe(user.id);
    expect(reading.spread.cardCount).toBe(3);
    expect(reading.cards).toHaveLength(3);
  });
});
```

### Ejemplo 2: Test unitario con fixtures

```typescript
import { MOCK_USERS, MOCK_AI_RESPONSE } from './helpers/fixtures';

describe('InterpretationsService (Unit)', () => {
  it('should generate interpretation for premium user', async () => {
    // Mock con fixtures
    const user = MOCK_USERS.premiumUser;
    mockAIProvider.generateCompletion.mockResolvedValue(MOCK_AI_RESPONSE);

    // Test
    const result = await service.generateInterpretation(user.id, readingId);

    expect(result.content).toContain('Visión General');
    expect(result.provider).toBe('groq');
  });
});
```

### Ejemplo 3: Edge cases con fixtures avanzadas

```typescript
import {
  EDGE_CASE_USERS,
  EDGE_CASE_AI_RESPONSES,
} from './helpers/fixtures-advanced';

describe('Validation Edge Cases', () => {
  it('should reject empty AI response', async () => {
    const emptyResponse = EDGE_CASE_AI_RESPONSES.empty;

    await expect(service.processAIResponse(emptyResponse)).rejects.toThrow(
      'AI response cannot be empty',
    );
  });

  it('should sanitize malicious HTML in AI response', async () => {
    const malicious = EDGE_CASE_AI_RESPONSES.maliciousHTML;

    const sanitized = await service.processAIResponse(malicious);

    expect(sanitized.content).not.toContain('<script>');
    expect(sanitized.content).not.toContain('onerror=');
  });

  it('should handle user with very long email', async () => {
    const user = EDGE_CASE_USERS.longEmail;

    const isValid = await validator.validateEmail(user.email);
    expect(isValid).toBe(true);
  });
});
```

---

## 🔄 Mantener Fixtures Actualizadas

Cuando agregues nuevas entidades o campos:

1. **Actualizar factories:**

   - Agregar nuevos campos con valores por defecto razonables
   - Crear método helper si es patrón común
   - Documentar en este archivo

2. **Actualizar fixtures:**

   - Agregar nuevos datos predefinidos si son reutilizables
   - Crear edge cases si detectas nuevos límites de validación
   - Mantener consistencia con valores existentes

3. **Actualizar esta guía:**
   - Agregar ejemplos de uso
   - Documentar nuevos patrones
   - Actualizar checklist si es necesario

---

## 📖 Referencias

- **Factories:** `test/helpers/factories/*.factory.ts`
- **Fixtures básicas:** `test/helpers/fixtures.ts`
- **Fixtures avanzadas:** `test/helpers/fixtures-advanced.ts`
- **Filosofía de testing:** `docs/TESTING_PHILOSOPHY.md`
- **Guía general:** `docs/TESTING.md`
