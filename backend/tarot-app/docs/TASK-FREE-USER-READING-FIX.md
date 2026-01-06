# Fix: Flujo de Lecturas para Usuarios FREE

**Fecha:** 2026-01-05  
**Rama:** `testing/fix-free-user-reading-flow`  
**Tipo:** Bugfix  
**Prioridad:** 🔴 ALTA

---

## 🐛 Problema Detectado

Los usuarios **FREE** no podían crear lecturas porque el backend **SIEMPRE requería una pregunta** (predefinedQuestionId o customQuestion), pero los usuarios FREE:

1. **NO pasan por la selección de categoría** (van directo a `/ritual/tirada`)
2. **NO pasan por la selección de pregunta** (van directo a selección de cartas)
3. **NO envían `predefinedQuestionId` ni `customQuestion`** en el payload
4. El backend **rechazaba la petición con 400 Bad Request** por falta de pregunta

### Causa raíz:

El validador `HasQuestionConstraint` en `create-reading.dto.ts` **SIEMPRE requería pregunta**, sin importar si se iba a usar IA o no.

```typescript
// ANTES (INCORRECTO)
@ValidatorConstraint({ name: 'hasQuestion', async: false })
export class HasQuestionConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as CreateReadingDto;
    const hasPredefined = object.predefinedQuestionId !== undefined && ...;
    const hasCustom = object.customQuestion !== undefined && ...;

    return hasPredefined || hasCustom; // ❌ SIEMPRE requería pregunta
  }
}
```

---

## ✅ Solución Implementada

### 1. Modificar el validador `HasQuestionConstraint`

La pregunta **solo es requerida cuando se solicita interpretación con IA** (`useAI === true`):

```typescript
// DESPUÉS (CORRECTO)
@ValidatorConstraint({ name: 'hasQuestion', async: false })
export class HasQuestionConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as CreateReadingDto;

    // ✅ Si NO se usa IA, la pregunta NO es requerida
    if (!object.useAI) {
      return true;
    }

    // ✅ Si se usa IA (useAI === true), la pregunta SÍ es requerida
    const hasPredefined = object.predefinedQuestionId !== undefined && ...;
    const hasCustom = object.customQuestion !== undefined && ...;

    return hasPredefined || hasCustom;
  }

  defaultMessage(): string {
    return 'Debes proporcionar una pregunta cuando se solicita interpretación con IA';
  }
}
```

### 2. Mover el validador al campo `useAI`

Para que el validador se ejecute **siempre** (incluso cuando `predefinedQuestionId` es `undefined`), se movió al campo `useAI`:

```typescript
export class CreateReadingDto {
  // ...otros campos

  @ApiProperty({
    example: true,
    description: 'Si se debe usar IA para generar la lectura (solo Premium)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Validate(HasQuestionConstraint) // ✅ Validador aplicado aquí
  useAI?: boolean;
}
```

### 3. Actualizar tests del DTO

Se agregaron tests para verificar el nuevo comportamiento:

```typescript
it('debe rechazar si no hay pregunta cuando useAI es true', async () => {
  const dto = plainToInstance(CreateReadingDto, {
    deckId: 1,
    spreadId: 1,
    cardIds: [1, 2, 3],
    cardPositions: [...],
    useAI: true, // ❌ Sin pregunta pero con IA
  });

  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
});

it('debe ACEPTAR si no hay pregunta cuando useAI es false', async () => {
  const dto = plainToInstance(CreateReadingDto, {
    deckId: 1,
    spreadId: 1,
    cardIds: [1, 2, 3],
    cardPositions: [...],
    useAI: false, // ✅ Sin pregunta pero sin IA (usuarios FREE)
  });

  const errors = await validate(dto);
  expect(errors).toHaveLength(0);
});

it('debe ACEPTAR si no hay pregunta cuando useAI es undefined', async () => {
  const dto = plainToInstance(CreateReadingDto, {
    deckId: 1,
    spreadId: 1,
    cardIds: [1, 2, 3],
    cardPositions: [...],
    // useAI no definido (usuarios FREE)
  });

  const errors = await validate(dto);
  expect(errors).toHaveLength(0);
});
```

---

## 🧪 Tests

### Tests del DTO

```bash
npm test -- create-reading.dto.spec.ts
```

**Resultado:** ✅ 15/15 tests pasando

```
PASS  test/readings/create-reading.dto.spec.ts (19.162 s)
  CreateReadingDto
    Validación de preguntas predefinidas vs custom
      ✓ debe aceptar predefined_question_id válido
      ✓ debe aceptar custom_question válida
      ✓ debe rechazar si ambos campos están presentes
      ✓ debe rechazar si ninguno de los campos está presente cuando useAI es true
      ✓ debe ACEPTAR si no hay pregunta cuando useAI es false (usuarios FREE)
      ✓ debe ACEPTAR si no hay pregunta cuando useAI es undefined (usuarios FREE)
      ✓ debe rechazar predefinedQuestionId si no es un número entero
      ✓ debe rechazar customQuestion si está vacía
      ✓ debe rechazar customQuestion si excede 500 caracteres
    Campos existentes
      ✓ debe validar campos requeridos
      ✓ debe aceptar DTO completo válido con pregunta predefinida
    Campo useAI
      ✓ debe aceptar useAI como true
      ✓ debe aceptar useAI como false
      ✓ debe aceptar useAI como undefined (campo opcional)
      ✓ debe rechazar useAI si no es booleano

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

---

## 📝 Payload Esperado por Tipo de Usuario

### Usuario FREE (sin IA)

```typescript
POST /api/readings
{
  spreadId: 2,
  deckId: 1,
  cardIds: [5, 15, 25],
  cardPositions: [
    { cardId: 5, position: "Pasado", isReversed: false },
    { cardId: 15, position: "Presente", isReversed: true },
    { cardId: 25, position: "Futuro", isReversed: false }
  ],
  useAI: false
  // ✅ NO incluye predefinedQuestionId ni customQuestion
}
```

### Usuario PREMIUM (con IA)

```typescript
POST /api/readings
{
  spreadId: 2,
  deckId: 1,
  cardIds: [5, 15, 25],
  cardPositions: [...],
  predefinedQuestionId: 3, // ✅ Pregunta requerida para IA
  useAI: true
}
```

O con pregunta personalizada:

```typescript
POST /api/readings
{
  spreadId: 2,
  deckId: 1,
  cardIds: [5, 15, 25],
  cardPositions: [...],
  customQuestion: "¿Encontraré el amor este año?", // ✅ Pregunta requerida para IA
  useAI: true
}
```

---

## 🔄 Archivos Modificados

### Backend

- `src/modules/tarot/readings/dto/create-reading.dto.ts`
  - Modificado validador `HasQuestionConstraint`
  - Movido validador al campo `useAI`
  - Actualizado `@ValidateIf` en `predefinedQuestionId` y `customQuestion`

- `test/readings/create-reading.dto.spec.ts`
  - Agregados 3 nuevos tests para validar flujo FREE
  - Actualizado test existente para clarificar que solo aplica cuando `useAI === true`

---

## ✅ Criterios de Aceptación

- [x] Usuario FREE puede crear lecturas **sin pregunta**
- [x] Usuario FREE puede crear lecturas con `useAI: false`
- [x] Usuario FREE puede crear lecturas con `useAI: undefined`
- [x] Usuario PREMIUM **no puede** crear lecturas con IA **sin pregunta** (falla validación)
- [x] Usuario PREMIUM puede crear lecturas con IA y `predefinedQuestionId`
- [x] Usuario PREMIUM puede crear lecturas con IA y `customQuestion`
- [x] No se pueden enviar ambas preguntas a la vez (validación existente sigue funcionando)
- [x] Tests del DTO pasan (15/15)

---

## 🚀 Próximos Pasos

1. **Ejecutar tests E2E con Playwright** para verificar el flujo completo
2. **Verificar tests de integración** (hay issues con schema de DB que necesitan resolverse por separado)
3. **Merge a develop** después de validación E2E exitosa
4. **Actualizar FLUJO_LECTURA_CORRECTO.md** con estado de la corrección

---

## 📚 Referencias

- [FLUJO_LECTURA_CORRECTO.md](../../../FLUJO_LECTURA_CORRECTO.md) - Especificación completa del flujo
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentación del endpoint POST /api/readings
- Issue raíz: Validador `HasQuestionConstraint` no consideraba el valor de `useAI`

---

**Estado:** ✅ COMPLETADA  
**Tests:** ✅ 15/15 pasando  
**Listo para:** Tests E2E
