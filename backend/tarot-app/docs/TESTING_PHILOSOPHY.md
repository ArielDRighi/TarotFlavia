# Filosofía de Testing - OBLIGATORIO LEER ANTES DE CREAR TESTS

## REGLA DE ORO - NUNCA ROMPER ESTA REGLA

**ABSOLUTAMENTE TODOS LOS TESTS DE LA APLICACIÓN DEBEN BUSCAR ERRORES REALES Y CORREGIRLOS, NUNCA FALSEAR UN TEST PARA QUE PASE EXITOSAMENTE**

## Proceso Obligatorio para Crear Tests

### 1. INVESTIGAR PRIMERO - NO ASUMIR NADA

Antes de escribir cualquier test:

1. **Leer el código de producción completo**

   - Controller: ¿Qué endpoints existen? ¿Qué guards tienen?
   - Service: ¿Qué lógica de negocio implementa?
   - Repository: ¿Cómo interactúa con la BD?
   - DTOs: ¿Qué validaciones existen?
   - Entities: ¿Qué relaciones hay? ¿Qué constraints?

2. **Ejecutar el código manualmente** (si es posible)

   - Usar Postman/curl para probar endpoints
   - Verificar respuestas reales
   - Inspeccionar base de datos

3. **Identificar edge cases y vulnerabilidades**
   - ¿Qué pasa con inputs inválidos?
   - ¿Hay problemas de seguridad?
   - ¿Funciona la validación?
   - ¿Se manejan correctamente los errores?

### 2. ESCRIBIR TESTS QUE BUSQUEN BUGS

**NO escribir tests asumiendo que el código funciona correctamente**

**SÍ escribir tests que:**

- Verifiquen comportamiento esperado según los requisitos de negocio
- Prueben edge cases (null, undefined, strings vacíos, números negativos, etc.)
- Busquen vulnerabilidades de seguridad
- Verifiquen que las validaciones funcionan
- Prueben el manejo de errores

### 3. CUANDO UN TEST FALLA

**NUNCA hacer:**

- ❌ Cambiar el test para que pase sin investigar
- ❌ Asumir que el código está correcto y el test está mal
- ❌ Usar `.skip()` sin documentar el bug encontrado
- ❌ Cambiar expectations para que coincidan con output incorrecto

**SIEMPRE hacer:**

- ✅ Investigar POR QUÉ falla el test
- ✅ Determinar si es un bug REAL en el código de producción
- ✅ Si es bug real: CORREGIR el código de producción
- ✅ Si el test está mal: CORREGIR el test con evidencia
- ✅ Documentar el bug encontrado en el commit message

### 4. EJEMPLOS DE BUGS REALES ENCONTRADOS

#### Bug #1: Cards array vacío en readings

**Test escribió:** `expect(response.body.cards).toHaveLength(3)`
**Resultado:** `cards: []` (array vacío)
**Acción CORRECTA:** Investigar use-case → Encontrar que `CreateReadingUseCase` no agregaba cards al reading
**Acción INCORRECTA:** Cambiar a `expect(response.body.cards).toHaveLength(0)`

#### Bug #2: Spread/Deck inválido retorna 500 en lugar de 404

**Test escribió:** `expect(404)` para deck inválido
**Resultado:** Error 500 Internal Server Error
**Acción CORRECTA:** Agregar validación en use-case para devolver 404
**Acción INCORRECTA:** Cambiar test a `expect(500)`

#### Bug #3: Email case-sensitivity permite duplicados

**Test escribió:** Registrar `test@example.com` y `Test@Example.com`
**Resultado esperado:** Segundo registro debe fallar con 409
**Resultado real:** Ambos registros exitosos (BUG)
**Acción CORRECTA:** Normalizar email a lowercase en UsersService
**Acción INCORRECTA:** Aceptar que emails son case-sensitive

### 5. TIPOS DE TESTS REQUERIDOS

#### Integration Tests (E2E)

- Usan base de datos REAL
- Prueban flujo completo de endpoints
- Verifican relaciones entre módulos
- Buscan bugs de integración

#### Unit Tests

- Mockean dependencias
- Prueban lógica aislada
- Verifican edge cases
- Alcanzan >80% coverage

#### Performance Tests

- Verifican tiempos de respuesta
- Buscan N+1 queries
- Verifican caching

### 6. CHECKLIST ANTES DE CREAR TESTS

- [ ] Leí TODO el código relacionado (controller, service, repository, DTOs, entities)
- [ ] Identifiqué guards, validaciones y constraints
- [ ] Probé los endpoints manualmente (si aplica)
- [ ] Identifiqué edge cases y vulnerabilidades
- [ ] Escribí tests que BUSCAN bugs, no que asumen corrección
- [ ] Cuando un test falló, investigué el código de producción
- [ ] Si encontré bugs, los CORREGÍ en producción
- [ ] Documenté bugs encontrados en commit message

### 7. RED FLAGS - SEÑALES DE TESTS FALSOS

- Test pasa en primer intento sin investigar código → SOSPECHOSO
- Todos los tests pasan sin encontrar ningún bug → SOSPECHOSO
- Cambié expectations para que coincidan con output → MAL
- Usé `.skip()` sin documentar bug claramente → MAL
- No leí código de producción antes de escribir test → MAL

### 8. FILOSOFÍA DE "TEST-DRIVEN BUG HUNTING"

Los tests NO son para validar que el código funciona.
Los tests SON para ENCONTRAR dónde NO funciona y CORREGIRLO.

**Mentalidad correcta:**

- "Este endpoint DEBERÍA hacer X según requisitos. ¿Realmente lo hace?"
- "¿Qué pasa si envío datos inválidos? ¿Se maneja correctamente?"
- "¿Hay validaciones de seguridad? ¿Funcionan?"

**Mentalidad incorrecta:**

- "Asumo que funciona, voy a escribir test que pase"
- "El test falla, debo estar escribiendo mal el test"
- "El código está bien, solo ajusto el test"

## CONSECUENCIAS DE FALSEAR TESTS

- Bugs en producción no detectados
- Falsa sensación de seguridad
- Coverage inflado sin valor real
- Deuda técnica acumulada
- Pérdida de confianza en test suite

## BENEFICIOS DE BUSCAR BUGS REALES

- Código más robusto y confiable
- Bugs encontrados antes de producción
- Documentación viva de comportamiento esperado
- Confianza real en el test suite
- Menos bugs reportados por usuarios

## BUENAS PRÁCTICAS - TAMAÑO Y ORGANIZACIÓN DE ARCHIVOS DE TEST

### Límites Recomendados

**Un archivo de test NO debería exceder:**

- ✅ **300-400 líneas** para tests unitarios simples
- ⚠️ **500-600 líneas** para tests de integración complejos
- 🔴 **>800 líneas** es señal de que DEBE refactorizarse

### Cuándo Refactorizar un Archivo de Test

**Señales de que un archivo de test es demasiado grande:**

1. **Más de 500 líneas** → Considerar dividir
2. **Más de 800 líneas** → OBLIGATORIO dividir
3. **Más de 10 bloques `describe()`** de primer nivel
4. **Scrolling excesivo** para encontrar tests específicos
5. **Setup duplicado** en múltiples bloques
6. **Dificultad para entender** qué se está testeando

### Estrategias de Refactorización

#### Opción 1: Dividir por Funcionalidad

```
# Archivo original muy grande
users.service.spec.ts (1200 líneas) ❌

# Dividir en:
users.service.create.spec.ts (300 líneas) ✅
users.service.read.spec.ts (250 líneas) ✅
users.service.update.spec.ts (280 líneas) ✅
users.service.delete.spec.ts (220 líneas) ✅
users.service.validation.spec.ts (150 líneas) ✅
```

#### Opción 2: Dividir por Caso de Uso

```
# Archivo original muy grande
readings.service.spec.ts (1500 líneas) ❌

# Dividir en:
readings.service.creation.spec.ts (400 líneas) ✅
readings.service.retrieval.spec.ts (300 líneas) ✅
readings.service.interpretation.spec.ts (450 líneas) ✅
readings.service.edge-cases.spec.ts (350 líneas) ✅
```

#### Opción 3: Dividir por Tipo de Test

```
# Archivo original muy grande
auth.e2e-spec.ts (900 líneas) ❌

# Dividir en:
auth-register.e2e-spec.ts (250 líneas) ✅
auth-login.e2e-spec.ts (200 líneas) ✅
auth-tokens.e2e-spec.ts (300 líneas) ✅
auth-permissions.e2e-spec.ts (150 líneas) ✅
```

### Helpers y Utilities Compartidos

**Para evitar duplicación entre archivos:**

```typescript
// test/helpers/users.helpers.ts
export const createUserFactory = () => { ... };
export const mockUserRepository = () => { ... };

// test/fixtures/users.fixtures.ts
export const validUserDto = { ... };
export const invalidUserDto = { ... };

// users.service.create.spec.ts
import { createUserFactory, mockUserRepository } from '@test/helpers/users.helpers';
import { validUserDto } from '@test/fixtures/users.fixtures';
```

### Ventajas de Archivos de Test Pequeños

✅ **Legibilidad:** Fácil encontrar y entender tests específicos  
✅ **Mantenibilidad:** Cambios localizados, menos conflictos de merge  
✅ **Performance:** Jest puede paralelizar mejor archivos pequeños  
✅ **Navegación:** Menos scrolling, estructura más clara  
✅ **Debugging:** Más fácil identificar qué falló  
✅ **Onboarding:** Nuevos desarrolladores entienden más rápido

### Límites por Tipo de Test (Basados en Google TypeScript Style Guide)

| Tipo de Test         | Límite Ideal | Límite Máximo | Acción si Excede           |
| -------------------- | ------------ | ------------- | -------------------------- |
| Unit Test (simple)   | 300 líneas   | 400 líneas    | Dividir por método/función |
| Unit Test (complejo) | 400 líneas   | 600 líneas    | Dividir por caso de uso    |
| Integration Test     | 400 líneas   | 600 líneas    | Dividir por flujo          |
| E2E Test             | 300 líneas   | 500 líneas    | Dividir por user journey   |

**⚠️ LÍMITE CRÍTICO: 600 líneas**
- Archivos >600 líneas **DEBEN** refactorizarse
- Archivos >800 líneas **RECHAZAN** en code review
- Archivos >1000 líneas violan principios SOLID y Clean Code

**Referencia:** Google TypeScript Style Guide recomienda ~400 líneas máximo por archivo

### Excepción: Tests Exhaustivos

**A veces un archivo grande está justificado:**

- Tests de validación exhaustiva (100+ edge cases)
- Tests de compatibilidad con múltiples versiones
- Tests de regresión documentando bugs históricos

**En estos casos:**

- Documentar claramente POR QUÉ es grande
- Usar comentarios de sección para navegación
- Mantener estructura clara con `describe()` anidados

### Red Flags

🔴 **Archivo >600 líneas** sin justificación documentada → DEBE refactorizarse  
🔴 **Archivo >800 líneas** → RECHAZAR en code review  
🔴 **Archivo >1000 líneas** → Violación grave de Clean Code  
🔴 **Copy-paste de setup** entre bloques (extraer a helper)  
🔴 **Tests difíciles de encontrar** (pobre organización)  
🔴 **Timeouts frecuentes** al ejecutar (demasiados tests en un archivo)  
🔴 **Merge conflicts recurrentes** (demasiadas personas editando mismo archivo)

---

## REGLAS DE TYPESCRIPT Y LINTING PARA TESTS

### ⚠️ REGLA CRÍTICA: NUNCA usar `as any`

TypeScript strict mode está habilitado. **TODOS** los tests deben pasar lint sin errores ni warnings.

#### REGLA #1: Patrón `as unknown as Type`

❌ **INCORRECTO:**

```typescript
const mockUser = { id: 1, email: 'test@test.com' } as any;
mockService.findOne.mockResolvedValue(null as any);
const mockDeck = { id: 1, name: 'Test' } as any;
```

✅ **CORRECTO:**

```typescript
const mockUser = { id: 1, email: 'test@test.com' } as unknown as User;
mockService.findOne.mockResolvedValue(null as unknown as User);
const mockDeck = { id: 1, name: 'Test' } as unknown as TarotDeck;
```

#### REGLA #2: Tipos helper para objetos parciales

❌ **INCORRECTO:**

```typescript
const mockReading = {
  id: 1,
  user: { id: 100 },
} as any;
```

✅ **CORRECTO:**

```typescript
type PartialUser = Partial<User> & Pick<User, 'id'>;
type PartialReading = Omit<Partial<TarotReading>, 'user'> & {
  user?: Partial<TarotReading['user']>;
};

const mockReading: PartialReading = {
  id: 1,
  user: { id: 100 },
};
```

#### REGLA #3: Importar tipos de entidades

❌ **INCORRECTO:**

```typescript
// No importar tipos necesarios
const mockDeck = { id: 1, name: 'Test' } as any;
```

✅ **CORRECTO:**

```typescript
import { TarotDeck } from '../../../decks/entities/tarot-deck.entity';
import { TarotSpread } from '../../../spreads/entities/tarot-spread.entity';
import { TarotCard } from '../../../cards/entities/tarot-card.entity';

const mockDeck = { id: 1, name: 'Test' } as unknown as TarotDeck;
const mockSpread = { id: 1, name: 'Test' } as unknown as TarotSpread;
```

#### REGLA #4: Tipar bloques catch

❌ **INCORRECTO:**

```typescript
try {
  await service.method();
} catch (error) {
  expect(error.message).toBe('Error');
}
```

✅ **CORRECTO:**

```typescript
try {
  await service.method();
} catch (error: unknown) {
  const httpError = error as HttpException;
  expect(httpError.message).toBe('Error');
}
```

#### REGLA #5: ReturnType para mocks complejos

❌ **INCORRECTO:**

```typescript
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
} as any;
```

✅ **CORRECTO:**

```typescript
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
} as unknown as ReturnType<Repository<Entity>['createQueryBuilder']>;
```

#### REGLA #6: Tests E2E con supertest

Para archivos E2E donde `app.getHttpServer()` retorna `any`:

```typescript
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

describe('Test E2E', () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;

  beforeAll(async () => {
    app = moduleFixture.createNestApplication();
    await app.init();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    httpServer = app.getHttpServer();
  });

  it('should work', async () => {
    const response = await request(httpServer).get('/endpoint');
    const body = response.body as unknown as ExpectedType;
  });
});
```

#### REGLA #7: Arrays de mocks tipados

❌ **INCORRECTO:**

```typescript
const mockCards = [{ id: 1 }, { id: 2 }] as any[];
```

✅ **CORRECTO:**

```typescript
const mockCards = [
  { id: 1, name: 'Card 1' },
  { id: 2, name: 'Card 2' },
] as unknown as TarotCard[];
```

#### REGLA #8: Mock de servicios con tipos explícitos

❌ **INCORRECTO:**

```typescript
const mockService = {
  method: jest.fn(),
};
```

✅ **CORRECTO:**

```typescript
const mockService: jest.Mocked<ServiceType> = {
  method: jest.fn(),
} as jest.Mocked<ServiceType>;
```

### Workflow Obligatorio Después de Editar

```bash
# 1. Aplicar prettier automáticamente
npx eslint <archivo> --fix

# 2. Verificar 0 errores y 0 warnings
npx eslint <archivo>

# 3. Ejecutar tests
npm test -- <archivo>
```

### Reemplazo Global con sed

Para archivos con muchas ocurrencias:

```bash
sed -i 's/as any/as unknown as Type/g' archivo.spec.ts
sed -i 's/} as any);/} as unknown as User);/g' archivo.spec.ts
```

### ✅ CHECKLIST DE LINT ANTES DE COMPLETAR TAREA

- [ ] ✅ **0 errores** de eslint
- [ ] ✅ **0 warnings** de `@typescript-eslint/no-unsafe-*`
- [ ] ✅ Todos los tests pasan
- [ ] ✅ No hay `as any` explícitos
- [ ] ✅ Prettier aplicado (`--fix`)
- [ ] ✅ Imports de tipos agregados
- [ ] ✅ Tipos helper creados si son necesarios

### Por Qué Estas Reglas Son Críticas

1. **CI/CD:** El workflow de GitHub Actions rechaza código con errores de lint
2. **Type Safety:** TypeScript strict mode previene bugs en tiempo de compilación
3. **Mantenibilidad:** Código tipado es más fácil de refactorizar
4. **Documentación:** Los tipos son documentación ejecutable
5. **Autocompletado:** IDEs proveen mejor ayuda con tipos explícitos

---

**RECUERDA: Un test que pasa sin encontrar bugs es un test que NO hizo su trabajo correctamente.**

**OBJETIVO: Encontrar y corregir TODOS los bugs antes de que lleguen a producción.**
