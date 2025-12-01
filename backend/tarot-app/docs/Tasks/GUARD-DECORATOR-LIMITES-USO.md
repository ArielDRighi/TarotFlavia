# Guard y Decorator de Límites de Uso

## TASK-012-a: Crear Guard/Decorator de Validación de Límites de Uso

**Estado:** ✅ COMPLETADO  
**Prioridad:** 🟢 BAJA (Opcional para MVP)  
**Estimación:** 1 día  
**Dependencias:** TASK-011 (UsageLimitsModule)  
**Tipo:** Refactoring/Mejora de código

---

## 📋 Descripción

Esta tarea implementa una solución elegante y reutilizable para la validación de límites de uso mediante:
- Un **Guard** que verifica si el usuario puede usar una característica antes de ejecutar el endpoint
- Un **Decorator** para marcar endpoints que requieren validación de límites
- Un **Interceptor** que incrementa el uso después de una operación exitosa

Esta aproximación sigue las mejores prácticas de NestJS y permite una validación declarativa sin código repetitivo.

---

## 🏗️ Arquitectura Implementada

### Flujo de Validación
```
Request → Guard (verifica límite) → Controller → Service → Response → Interceptor (incrementa uso)
```

### Componentes

#### 1. Decorator: `@CheckUsageLimit()`
**Archivo:** `src/modules/usage-limits/decorators/check-usage-limit.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { UsageFeature } from '../entities/usage-limit.entity';

export const USAGE_LIMIT_FEATURE_KEY = 'usage-limit-feature';

/**
 * Decorator para marcar un endpoint como requeridor de validación de límites
 * @param feature - La característica a validar
 */
export const CheckUsageLimit = (feature: UsageFeature) =>
  SetMetadata(USAGE_LIMIT_FEATURE_KEY, feature);
```

**Uso:**
```typescript
@CheckUsageLimit(UsageFeature.TAROT_READING)
@Post()
async createReading() { ... }
```

#### 2. Guard: `CheckUsageLimitGuard`
**Archivo:** `src/modules/usage-limits/guards/check-usage-limit.guard.ts`

```typescript
@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  constructor(
    private readonly usageLimitsService: UsageLimitsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extraer feature del metadata del decorator
    const feature = this.reflector.getAllAndOverride<UsageFeature>(
      USAGE_LIMIT_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. Si no hay feature, permitir paso
    if (!feature) return true;

    // 3. Extraer usuario del request
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 4. Verificar límite
    const canUse = await this.usageLimitsService.checkLimit(userId, feature);

    if (!canUse) {
      throw new ForbiddenException(
        'Has alcanzado el límite diario para esta función. Por favor, actualiza tu plan o intenta mañana.',
      );
    }

    return true;
  }
}
```

#### 3. Interceptor: `IncrementUsageInterceptor`
**Archivo:** `src/modules/usage-limits/interceptors/increment-usage.interceptor.ts`

```typescript
@Injectable()
export class IncrementUsageInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IncrementUsageInterceptor.name);

  constructor(
    private readonly usageLimitsService: UsageLimitsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const feature = this.reflector.getAllAndOverride<UsageFeature>(
      USAGE_LIMIT_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!feature) return next.handle();

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) return next.handle();

    // Incrementar uso DESPUÉS de respuesta exitosa
    return next.handle().pipe(
      tap({
        next: () => {
          this.usageLimitsService
            .incrementUsage(userId, feature)
            .catch((error) => {
              this.logger.error(
                `Failed to increment usage for user ${userId}, feature ${feature}`,
                error instanceof Error ? error.stack : String(error),
              );
            });
        },
      }),
    );
  }
}
```

---

## 📁 Archivos Implementados

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `src/modules/usage-limits/guards/check-usage-limit.guard.ts` | ~50 | Guard de validación |
| `src/modules/usage-limits/guards/check-usage-limit.guard.spec.ts` | ~80 | Tests del guard |
| `src/modules/usage-limits/decorators/check-usage-limit.decorator.ts` | ~17 | Decorator |
| `src/modules/usage-limits/interceptors/increment-usage.interceptor.ts` | ~62 | Interceptor |
| `src/modules/usage-limits/interceptors/increment-usage.interceptor.spec.ts` | ~80 | Tests del interceptor |

---

## 🎯 Beneficios de esta Implementación

### Antes (código repetitivo):
```typescript
@Post()
async createReading(@CurrentUser() user: User) {
  // Validación manual en cada endpoint
  const canUse = await this.usageLimitsService.checkLimit(user.id, UsageFeature.TAROT_READING);
  if (!canUse) {
    throw new ForbiddenException('Límite alcanzado');
  }
  
  const result = await this.readingsService.create();
  
  // Incremento manual
  await this.usageLimitsService.incrementUsage(user.id, UsageFeature.TAROT_READING);
  
  return result;
}
```

### Después (declarativo):
```typescript
@UseGuards(CheckUsageLimitGuard)
@UseInterceptors(IncrementUsageInterceptor)
@CheckUsageLimit(UsageFeature.TAROT_READING)
@Post()
async createReading() {
  return this.readingsService.create();
}
```

---

## 🧪 Tests Implementados

### Guard Tests (`check-usage-limit.guard.spec.ts`)
- ✅ Permite paso si no hay feature definida
- ✅ Lanza ForbiddenException si usuario no autenticado
- ✅ Permite paso si límite no alcanzado
- ✅ Lanza ForbiddenException si límite alcanzado

### Interceptor Tests (`increment-usage.interceptor.spec.ts`)
- ✅ No incrementa si no hay feature
- ✅ No incrementa si no hay usuario
- ✅ Incrementa uso después de respuesta exitosa
- ✅ Loggea error pero no bloquea si falla incremento

---

## 🔄 Uso en Readings Controller

El guard y el interceptor están preparados para aplicarse en `ReadingsController`:

```typescript
// readings.controller.ts
@Controller('readings')
@UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
@UseInterceptors(IncrementUsageInterceptor)
export class ReadingsController {
  
  @CheckUsageLimit(UsageFeature.TAROT_READING)
  @Post()
  async create(@Body() createReadingDto: CreateReadingDto) {
    return this.readingsService.create(createReadingDto);
  }
}
```

---

## ⚠️ Notas Importantes

1. **Opcional para MVP:** El sistema actual de validación manual funciona correctamente
2. **Refactoring:** Es una mejora de código, no un bug fix
3. **Reutilizable:** Puede aplicarse a cualquier endpoint que necesite límites (TASK-022: regenerar interpretaciones, TASK-033: oráculo)

---

## ✅ Criterios de Aceptación Cumplidos

- ✅ Guard `CheckUsageLimitGuard` verifica límites antes de ejecutar
- ✅ Decorator `@CheckUsageLimit()` marca endpoints declarativamente
- ✅ Interceptor `IncrementUsageInterceptor` incrementa uso después del éxito
- ✅ Tests unitarios con buena cobertura
- ✅ Exportados desde `UsageLimitsModule`

---

## 📚 Tests de Integración Necesarios

Para validar completamente esta funcionalidad, agregar al script de tests:

```bash
# Verificar que el guard bloquea cuando límite alcanzado
# (requiere usuario con límite agotado)
curl -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer <token_usuario_limite_agotado>" \
  -H "Content-Type: application/json" \
  -d '{"question": "test"}' \
  # Esperado: 403 Forbidden
```
