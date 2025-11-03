# Usage Limits Guard & Decorator

Este documento describe cómo usar el guard y decorator reutilizable `@CheckUsageLimit` para aplicar límites de uso en endpoints de NestJS.

## 📦 Componentes

### 1. **CheckUsageLimitGuard**

Guard que verifica si un usuario puede ejecutar una acción basándose en sus límites de uso diarios.

- **Ubicación:** `src/modules/usage-limits/guards/check-usage-limit.guard.ts`
- **Función:** Bloquea el request si el usuario alcanzó su límite diario
- **Respuesta de error:** `403 Forbidden` con mensaje descriptivo

### 2. **IncrementUsageInterceptor**

Interceptor que registra el uso de una feature DESPUÉS de que la operación se complete exitosamente.

- **Ubicación:** `src/modules/usage-limits/interceptors/increment-usage.interceptor.ts`
- **Función:** Incrementa el contador de uso automáticamente
- **Nota:** Si falla, solo logea el error sin bloquear la respuesta

### 3. **@CheckUsageLimit(feature)**

Decorator que marca un endpoint para aplicar límites de uso.

- **Ubicación:** `src/modules/usage-limits/decorators/check-usage-limit.decorator.ts`
- **Parámetro:** `feature: UsageFeature` - La feature a validar
- **Features disponibles:**
  - `UsageFeature.TAROT_READING`
  - `UsageFeature.INTERPRETATION_REGENERATION`
  - `UsageFeature.ORACLE_QUERY`

## 🚀 Uso Básico

### Aplicar límites a un endpoint

```typescript
import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  CheckUsageLimitGuard,
  IncrementUsageInterceptor,
  CheckUsageLimit,
  UsageFeature,
} from '../../usage-limits';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('readings')
export class ReadingsController {
  @UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @CheckUsageLimit(UsageFeature.TAROT_READING)
  @Post()
  async createReading(@Request() req, @Body() dto: CreateReadingDto) {
    // Tu lógica aquí - no necesitas validar límites manualmente
    return this.readingsService.create(req.user, dto);
  }
}
```

### Múltiples guards

Puedes combinar el guard con otros guards existentes:

```typescript
@UseGuards(
  JwtAuthGuard,                           // Autenticación
  RequiresPremiumGuard,                   // Validación de plan
  CheckUsageLimitGuard                    // Límites de uso
)
@UseInterceptors(IncrementUsageInterceptor)
@CheckUsageLimit(UsageFeature.INTERPRETATION_REGENERATION)
@Post(':id/regenerate')
async regenerateInterpretation(@Param('id') id: number) {
  return this.interpretationsService.regenerate(id);
}
```

## 📊 Límites Configurados

Los límites se definen en `src/modules/usage-limits/usage-limits.constants.ts`:

```typescript
export const USAGE_LIMITS: Record<UserPlan, Record<UsageFeature, number>> = {
  [UserPlan.FREE]: {
    [UsageFeature.TAROT_READING]: 3, // 3 lecturas/día
    [UsageFeature.INTERPRETATION_REGENERATION]: 0, // No permitido
    [UsageFeature.ORACLE_QUERY]: 5, // 5 consultas/día
  },
  [UserPlan.PREMIUM]: {
    [UsageFeature.TAROT_READING]: -1, // Ilimitado
    [UsageFeature.INTERPRETATION_REGENERATION]: -1, // Ilimitado
    [UsageFeature.ORACLE_QUERY]: -1, // Ilimitado
  },
};
```

**Nota:** El valor `-1` significa uso ilimitado.

## 🔄 Flujo de Ejecución

1. **Request llega al endpoint**
2. **Guards se ejecutan en orden:**
   - `JwtAuthGuard` → Verifica autenticación
   - `CheckUsageLimitGuard` → Verifica límite de uso
     - Si límite alcanzado → `403 Forbidden` ❌
     - Si tiene cuota disponible → Continúa ✅
3. **Handler se ejecuta** (tu lógica de negocio)
4. **Interceptor se ejecuta DESPUÉS:**
   - `IncrementUsageInterceptor` → Incrementa contador
   - Si falla → Solo logea error, no afecta respuesta
5. **Response retorna al cliente**

## ⚙️ Configuración del Módulo

Para usar estos componentes, asegúrate de importar `UsageLimitsModule`:

```typescript
import { Module } from '@nestjs/common';
import { UsageLimitsModule } from '../usage-limits/usage-limits.module';

@Module({
  imports: [
    UsageLimitsModule, // Exporta guard, interceptor y decorator
    // ... otros módulos
  ],
  controllers: [YourController],
  providers: [YourService],
})
export class YourModule {}
```

## 🧪 Testing

### Unit Tests

Mockear el service es suficiente:

```typescript
const mockUsageLimitsService = {
  checkLimit: jest.fn(),
  incrementUsage: jest.fn(),
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [YourController],
    providers: [
      {
        provide: UsageLimitsService,
        useValue: mockUsageLimitsService,
      },
      CheckUsageLimitGuard,
      IncrementUsageInterceptor,
      Reflector,
    ],
  }).compile();
});
```

### E2E Tests

Los E2E tests validan el flujo completo:

```typescript
it('✅ Usuario FREE bloqueado después de 3 lecturas/día', async () => {
  // Crear 3 lecturas
  for (let i = 0; i < 3; i++) {
    await request(app.getHttpServer())
      .post('/readings')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send(validReadingDto)
      .expect(201);
  }

  // 4ta lectura debe fallar
  await request(app.getHttpServer())
    .post('/readings')
    .set('Authorization', `Bearer ${freeUserToken}`)
    .send(validReadingDto)
    .expect(403)
    .expect((res) => {
      expect(res.body.message).toContain('límite diario');
    });
});
```

## 🚨 Mensajes de Error

### Límite alcanzado

```json
{
  "statusCode": 403,
  "message": "Has alcanzado el límite diario para esta función. Por favor, actualiza tu plan o intenta mañana.",
  "error": "Forbidden"
}
```

### Usuario no autenticado

```json
{
  "statusCode": 403,
  "message": "Usuario no autenticado",
  "error": "Forbidden"
}
```

## 📝 Beneficios

### ✅ Ventajas de esta implementación

1. **DRY (Don't Repeat Yourself)**: Lógica centralizada
2. **Declarativo**: Uso simple con decorators
3. **Reutilizable**: Fácil de aplicar a nuevos endpoints
4. **Testeable**: Guards e interceptors con tests propios
5. **Mantenible**: Cambios en un solo lugar
6. **Type-safe**: TypeScript garantiza uso correcto
7. **Escalable**: Agregar nuevas features es trivial

### 🔄 Comparación con implementación manual

**Antes (implementación manual en service):**

```typescript
// En el service (40+ líneas de código repetitivo)
async create(user: User, dto: CreateReadingDto) {
  // 1. Validar límite
  const canCreate = await this.usageLimitsService.checkLimit(
    user.id,
    UsageFeature.TAROT_READING,
  );

  if (!canCreate) {
    throw new ForbiddenException('Has alcanzado el límite...');
  }

  // 2. Lógica de negocio...
  const reading = await this.doBusinessLogic(dto);

  // 3. Registrar uso
  await this.usageLimitsService.incrementUsage(
    user.id,
    UsageFeature.TAROT_READING,
  );

  return reading;
}
```

**Después (con guard reutilizable):**

```typescript
// En el controller (3 líneas)
@UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
@UseInterceptors(IncrementUsageInterceptor)
@CheckUsageLimit(UsageFeature.TAROT_READING)
@Post()
async createReading(@Request() req, @Body() dto: CreateReadingDto) {
  // Lógica de negocio limpia, sin validaciones
  return this.readingsService.create(req.user, dto);
}

// En el service (sin lógica de límites)
async create(user: User, dto: CreateReadingDto) {
  // Solo lógica de negocio
  return await this.doBusinessLogic(dto);
}
```

## 🔮 Uso Futuro

### Agregar nuevas features

1. Agregar enum value en `UsageFeature`:

```typescript
export enum UsageFeature {
  TAROT_READING = 'tarot_reading',
  ORACLE_QUERY = 'oracle_query',
  INTERPRETATION_REGENERATION = 'interpretation_regeneration',
  AI_CONSULTATION = 'ai_consultation', // Nueva feature
}
```

2. Configurar límites en constants:

```typescript
export const USAGE_LIMITS = {
  [UserPlan.FREE]: {
    // ... otras features
    [UsageFeature.AI_CONSULTATION]: 1, // 1 consulta/día
  },
  [UserPlan.PREMIUM]: {
    // ... otras features
    [UsageFeature.AI_CONSULTATION]: -1, // Ilimitado
  },
};
```

3. Aplicar a endpoint:

```typescript
@CheckUsageLimit(UsageFeature.AI_CONSULTATION)
@Post('consult')
async consultAI(@Body() dto: ConsultDto) {
  return this.aiService.consult(dto);
}
```

¡Listo! 🎉

## 📚 Referencias

- **Guard:** `src/modules/usage-limits/guards/check-usage-limit.guard.ts`
- **Interceptor:** `src/modules/usage-limits/interceptors/increment-usage.interceptor.ts`
- **Decorator:** `src/modules/usage-limits/decorators/check-usage-limit.decorator.ts`
- **Constants:** `src/modules/usage-limits/usage-limits.constants.ts`
- **Tests:** `src/modules/usage-limits/**/*.spec.ts`
- **E2E Tests:** `test/mvp-complete.e2e-spec.ts`
