# Sistema de Lecturas con Preguntas Predefinidas vs Libres

## TASK-013: Modificar Sistema de Lecturas para Preguntas Predefinidas vs Libres

**Estado:** ✅ COMPLETADO  
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 3 días  
**Dependencias:** TASK-009 (Preguntas Predefinidas), TASK-011 (Límites de Uso)  
**Branch:** `feature/TASK-013-modificar-sistema-lecturas-preguntas`  
**Commit:** `5907c6c`  
**Marcador MVP:** ⭐⭐⭐ **CRÍTICO PARA MVP** - Implementa diferenciación del negocio

---

## 📋 Descripción

Esta tarea implementa el diferenciador clave del modelo de negocio freemium:
- **Usuarios FREE:** Solo pueden usar preguntas predefinidas
- **Usuarios PREMIUM:** Pueden escribir preguntas personalizadas

---

## 🏗️ Arquitectura Implementada

### Flujo de Validación
```
Request → JwtAuthGuard → RequiresPremiumForCustomQuestionGuard → ReadingsController → Service
```

### Componentes Clave

#### 1. Guard: `RequiresPremiumForCustomQuestionGuard`
**Archivo:** `src/modules/tarot/readings/guards/requires-premium-for-custom-question.guard.ts`

```typescript
@Injectable()
export class RequiresPremiumForCustomQuestionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const body = request.body;

    // Si no hay pregunta personalizada, permitir acceso
    if (!body.customQuestion) {
      return true;
    }

    // Si hay pregunta personalizada, verificar que el usuario sea premium
    if (user.plan === UserPlan.FREE) {
      throw new ForbiddenException(
        'Las preguntas personalizadas requieren un plan premium. ' +
        'Por favor, elige una pregunta predefinida o actualiza tu plan.',
      );
    }

    // Usuario premium puede usar preguntas personalizadas
    return true;
  }
}
```

#### 2. DTO: `CreateReadingDto`
**Archivo:** `src/modules/tarot/readings/dto/create-reading.dto.ts`

```typescript
export class CreateReadingDto {
  @ValidateIf((o) => o.predefinedQuestionId !== undefined || !o.customQuestion)
  @IsInt()
  @Validate(IsExclusiveWithConstraint, ['customQuestion'])
  @Validate(HasQuestionConstraint)
  predefinedQuestionId?: number;

  @ValidateIf((o) => o.customQuestion !== undefined)
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  @SanitizeHtml()
  customQuestion?: string;
}
```

**Validaciones:**
- `HasQuestionConstraint`: Asegura que al menos una pregunta (predefinida o personalizada) esté presente
- `IsExclusiveWithConstraint`: No permite ambas preguntas simultáneamente
- `@SanitizeHtml()`: Sanitiza HTML para prevenir XSS

---

## 📁 Archivos Implementados

| Archivo | Descripción |
|---------|-------------|
| `src/modules/tarot/readings/guards/requires-premium-for-custom-question.guard.ts` | Guard de validación de plan |
| `src/modules/tarot/readings/dto/create-reading.dto.ts` | DTO con validaciones |
| `src/modules/tarot/readings/dto/validators/is-exclusive-with.validator.ts` | Validador custom |
| `src/modules/tarot/readings/dto/validators/has-question.validator.ts` | Validador de pregunta |
| `src/modules/tarot/readings/readings.controller.ts` | Controller con guards |
| `src/modules/tarot/readings/readings.service.ts` | Servicio actualizado |
| `test/readings-hybrid.e2e-spec.ts` | Tests E2E |

---

## 🎯 Casos de Uso

### Usuario FREE - Pregunta Predefinida ✅
```bash
curl -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer <token_free>" \
  -H "Content-Type: application/json" \
  -d '{
    "predefinedQuestionId": 5,
    "spreadId": 1,
    "cards": [{"cardId": 1, "position": "pasado", "isReversed": false}]
  }'
# Esperado: 201 Created
```

### Usuario FREE - Pregunta Personalizada ❌
```bash
curl -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer <token_free>" \
  -H "Content-Type: application/json" \
  -d '{
    "customQuestion": "¿Cuál es mi propósito en la vida?",
    "spreadId": 1,
    "cards": [{"cardId": 1, "position": "pasado", "isReversed": false}]
  }'
# Esperado: 403 Forbidden
# Mensaje: "Las preguntas personalizadas requieren un plan premium..."
```

### Usuario PREMIUM - Pregunta Personalizada ✅
```bash
curl -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer <token_premium>" \
  -H "Content-Type: application/json" \
  -d '{
    "customQuestion": "¿Cuál es mi propósito en la vida?",
    "spreadId": 1,
    "cards": [{"cardId": 1, "position": "pasado", "isReversed": false}]
  }'
# Esperado: 201 Created
```

### Usuario PREMIUM - Pregunta Predefinida ✅
```bash
curl -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer <token_premium>" \
  -H "Content-Type: application/json" \
  -d '{
    "predefinedQuestionId": 5,
    "spreadId": 1,
    "cards": [{"cardId": 1, "position": "pasado", "isReversed": false}]
  }'
# Esperado: 201 Created (premium puede usar ambos tipos)
```

---

## 🧪 Tests Implementados

### Tests Unitarios
- ✅ DTO valida pregunta predefinida para free (9 tests)
- ✅ DTO acepta pregunta custom para premium
- ✅ Guard rechaza custom para free (6 tests)
- ✅ Validador HasQuestionConstraint funciona correctamente
- ✅ Validador IsExclusiveWithConstraint funciona correctamente

### Tests de Integración
- ✅ Lectura con `predefinedQuestionId`
- ✅ Lectura con `customQuestion` (premium)
- ✅ Error claro para free con custom
- ✅ Sanitización HTML funciona

### Tests E2E (`test/readings-hybrid.e2e-spec.ts`)
- ✅ Usuario FREE crea lectura con pregunta predefinida → 201
- ✅ Usuario FREE rechazado con pregunta custom → 403
- ✅ Usuario PREMIUM crea lectura con custom → 201
- ✅ Usuario PREMIUM puede usar predefinidas también → 201

---

## 🔒 Seguridad Implementada

1. **Validación de Plan:** Guard verifica el plan del usuario antes de permitir preguntas personalizadas
2. **Sanitización HTML:** El decorator `@SanitizeHtml()` previene inyección XSS en preguntas
3. **Límite de Caracteres:** 10-500 caracteres para preguntas personalizadas
4. **Exclusividad:** No se permite enviar ambos tipos de pregunta simultáneamente

---

## 📊 Entidad TarotReading Actualizada

```typescript
@Entity('tarot_reading')
export class TarotReading {
  // ... otros campos

  @Column({ name: 'predefined_question_id', nullable: true })
  predefinedQuestionId?: number;

  @ManyToOne(() => PredefinedQuestion, { nullable: true })
  @JoinColumn({ name: 'predefined_question_id' })
  predefinedQuestion?: PredefinedQuestion;

  @Column({ name: 'custom_question', nullable: true, length: 500 })
  customQuestion?: string;

  @Column({
    name: 'question_type',
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.PREDEFINED
  })
  questionType: QuestionType;
}

enum QuestionType {
  PREDEFINED = 'predefined',
  CUSTOM = 'custom'
}
```

---

## ✅ Criterios de Aceptación Cumplidos

- ✅ Usuarios free solo pueden crear lecturas con preguntas predefinidas
- ✅ Usuarios premium pueden usar ambos tipos de preguntas
- ✅ Los errores de validación son claros y útiles
- ✅ Campo `question_type` disponible para analytics
- ✅ Relación con `PredefinedQuestion` implementada
- ✅ Tests E2E obligatorios pasando

---

## 💡 Modelo de Negocio

Esta implementación es **CRÍTICA** para el modelo freemium:

| Plan | Preguntas Predefinidas | Preguntas Personalizadas |
|------|------------------------|-------------------------|
| FREE | ✅ Sí | ❌ No |
| PREMIUM | ✅ Sí | ✅ Sí |

El valor agregado para usuarios premium es la capacidad de formular sus propias preguntas, lo que proporciona una experiencia más personalizada.
