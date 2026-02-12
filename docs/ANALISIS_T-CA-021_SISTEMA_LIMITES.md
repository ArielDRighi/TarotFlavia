# Análisis T-CA-021: Sistema de Límites Existente

> **Tarea:** T-CA-021 - Analizar Sistema de Límites Existente  
> **Fecha:** 12 de febrero de 2026  
> **Objetivo:** Entender el sistema actual de límites de uso y planificar cómo extenderlo para soportar límites mensuales además de los diarios existentes.

---

## 📋 Resumen Ejecutivo

### Hallazgo Principal: ✅ **El sistema YA soporta límites mensuales**

El análisis revela que el módulo `usage-limits` **ya tiene implementado el soporte para límites mensuales** a través del método `getUsageByPeriod()` que acepta períodos `'daily' | 'monthly' | 'lifetime'`.

**BIRTH_CHART ya está configurado** en el sistema con:
- Feature enum: `UsageFeature.BIRTH_CHART` existe
- Límites definidos: ANONYMOUS (1 lifetime), FREE (3 mensuales), PREMIUM (5 mensuales)
- Método de consulta mensual: `getUsageByPeriod(userId, BIRTH_CHART, 'monthly')` ya existe

### Trabajo Requerido para Integración

**NO se requiere extender el sistema de límites**, solo:
1. **Aplicar el guard existente** en los endpoints de Carta Astral
2. **Usar los decoradores** `@CheckUsageLimit(UsageFeature.BIRTH_CHART)` y `@AllowAnonymous()`
3. **Validar que los límites mensuales funcionen correctamente** con tests

---

## 🏗️ Arquitectura del Módulo `usage-limits`

### Ubicación
```
backend/tarot-app/src/modules/usage-limits/
```

### Componentes Principales

#### 1. Entities

**`UsageLimit` entity** (`entities/usage-limit.entity.ts`):
```typescript
@Entity('usage_limit')
export class UsageLimit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: UsageFeature })
  feature: UsageFeature;

  @Column({ default: 1 })
  count: number;

  @Column({ type: 'date' })  // ⚠️ DATE, no TIMESTAMP
  date: string;  // Formato: 'YYYY-MM-DD'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**`UsageFeature` enum**:
```typescript
export enum UsageFeature {
  DAILY_CARD = 'daily_card',
  TAROT_READING = 'tarot_reading',
  ORACLE_QUERY = 'oracle_query',
  INTERPRETATION_REGENERATION = 'interpretation_regeneration',
  PENDULUM_QUERY = 'pendulum_query',
  BIRTH_CHART = 'birth_chart',  // ✅ YA EXISTE
}
```

**`AnonymousUsage` entity** (`entities/anonymous-usage.entity.ts`):
```typescript
@Entity('anonymous_usage')
export class AnonymousUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fingerprint: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: UsageFeature })
  feature: UsageFeature;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### 2. Services

**`UsageLimitsService`** (`usage-limits.service.ts`):

Métodos principales:
- `checkLimit(userId, feature, period)`: Valida si el usuario puede acceder a la feature
- `incrementUsage(userId, feature)`: Incrementa el contador de uso
- `getUsage(userId, feature)`: Obtiene el uso actual (diario)
- **`getUsageByPeriod(userId, feature, period)`**: **✅ Método clave para límites mensuales**

```typescript
async getUsageByPeriod(
  userId: number,
  feature: UsageFeature,
  period: 'daily' | 'monthly' | 'lifetime',
): Promise<number> {
  if (period === 'daily') {
    return this.getUsage(userId, feature);
  }

  if (period === 'lifetime') {
    const records = await this.usageLimitRepository.find({
      where: { userId, feature },
    });
    return records.reduce((sum, record) => sum + record.count, 0);
  }

  if (period === 'monthly') {
    const startOfMonth = getStartOfMonthUTCString();
    const endOfMonth = getEndOfMonthUTCString();

    const records = await this.usageLimitRepository.find({
      where: {
        userId,
        feature,
        date: Between(startOfMonth, endOfMonth),
      },
    });

    return records.reduce((sum, record) => sum + record.count, 0);
  }

  throw new Error(`Invalid period: ${period}`);
}
```

**Funciones de fecha utilizadas:**
- `getTodayUTCDateString()`: Retorna 'YYYY-MM-DD' del día actual en UTC
- `getStartOfMonthUTCString()`: Retorna '2026-02-01' (primer día del mes actual)
- `getEndOfMonthUTCString()`: Retorna '2026-02-28' (último día del mes actual)

**`AnonymousTrackingService`** (`services/anonymous-tracking.service.ts`):

Maneja tracking de usuarios anónimos:
- `canAccessToday(fingerprint, feature)`: Valida acceso diario
- `canAccessLifetime(fingerprint, feature, maxCount)`: Valida acceso lifetime (usa fecha '1970-01-01')
- `incrementUsage(fingerprint, ip, feature)`: Incrementa uso anónimo

**`UsageLimitsResetService`** (`services/usage-limits-reset.service.ts`):

Cron job para limpieza automática:
```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
  name: 'daily-usage-limits-reset',
  timeZone: 'UTC',
})
async handleDailyReset(): Promise<void> {
  // Elimina registros más antiguos que USAGE_RETENTION_DAYS (7 días)
  const cutoffDateStr = getDateDaysAgoUTCString(USAGE_RETENTION_DAYS);
  await this.usageLimitRepository.delete({
    date: LessThan(cutoffDateStr),
  });
}
```

**⚠️ Nota importante:** El reset NO elimina registros mensuales activos porque `USAGE_RETENTION_DAYS = 7`. Para un mes de febrero (28 días), los registros se mantienen solo 7 días, lo que significa que **para consultas mensuales necesitamos ajustar la retención**.

#### 3. Guards

**`CheckUsageLimitGuard`** (`guards/check-usage-limit.guard.ts`):

Guard reutilizable que intercepta requests:
```typescript
@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get(USAGE_LIMIT_FEATURE_KEY, context.getHandler());
    const allowAnonymous = this.reflector.get(ALLOW_ANONYMOUS_KEY, context.getHandler());

    // 1. Extraer usuario del request (JWT o anónimo)
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const fingerprint = request.headers['x-device-fingerprint'];

    // 2. Validar límites según tipo de usuario
    if (userId) {
      const canAccess = await this.usageLimitsService.checkLimit(userId, feature);
      if (!canAccess) {
        throw new ForbiddenException('Límite de uso alcanzado');
      }
    } else if (allowAnonymous && fingerprint) {
      const canAccess = await this.anonymousTrackingService.canAccessToday(fingerprint, feature);
      if (!canAccess) {
        throw new ForbiddenException('Límite de uso alcanzado para usuarios anónimos');
      }
    }

    return true;
  }
}
```

#### 4. Interceptors

**`IncrementUsageInterceptor`** (`interceptors/increment-usage.interceptor.ts`):

Interceptor que incrementa el uso **después** de una respuesta exitosa:
```typescript
@Injectable()
export class IncrementUsageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const feature = this.reflector.get(USAGE_LIMIT_FEATURE_KEY, ...);
    const userId = context.switchToHttp().getRequest().user?.userId;

    return next.handle().pipe(
      tap({
        next: () => {
          // Incrementar uso asíncronamente sin bloquear la respuesta
          this.usageLimitsService.incrementUsage(userId, feature).catch(...);
        },
      }),
    );
  }
}
```

#### 5. Decorators

**`@CheckUsageLimit(feature)`** (`decorators/check-usage-limit.decorator.ts`):
```typescript
export const CheckUsageLimit = (feature: UsageFeature) =>
  SetMetadata(USAGE_LIMIT_FEATURE_KEY, feature);
```

**`@AllowAnonymous()`** (`decorators/allow-anonymous.decorator.ts`):
```typescript
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true);
```

#### 6. Configuración

**`usage-limits.constants.ts`**:
```typescript
export const USAGE_LIMITS: Record<UsageFeature, PlanLimits> = {
  // ... otras features ...
  
  [UsageFeature.BIRTH_CHART]: {  // ✅ YA CONFIGURADO
    [UserPlan.ANONYMOUS]: {
      maxCount: 1,
      period: 'lifetime',
    },
    [UserPlan.FREE]: {
      maxCount: 3,
      period: 'monthly',  // ✅ Límite mensual
    },
    [UserPlan.PREMIUM]: {
      maxCount: 5,
      period: 'monthly',  // ✅ Límite mensual
    },
  },
};

export const USAGE_RETENTION_DAYS = 7;  // ⚠️ Puede ser insuficiente para mensuales
```

---

## 🔍 Análisis de Períodos de Límites

### 1. Límites Diarios

**Cómo funcionan:**
- La columna `date` es tipo `DATE` (no timestamp)
- Se almacena en formato 'YYYY-MM-DD' (ej: '2026-02-12')
- La consulta filtra por `date = getTodayUTCDateString()`
- **No hay reset explícito**: el límite se "resetea" porque al día siguiente la fecha cambia

**Ejemplo de consulta:**
```sql
SELECT SUM(count) FROM usage_limit
WHERE userId = 123
  AND feature = 'daily_card'
  AND date = '2026-02-12';
```

**Features que usan límites diarios:**
- `DAILY_CARD`: 1 por día
- `TAROT_READING`: FREE: 1/día, PREMIUM: 3/día
- `ORACLE_QUERY`: FREE: 1/día, PREMIUM: 5/día
- `INTERPRETATION_REGENERATION`: FREE: 1/día, PREMIUM: 3/día

### 2. Límites Mensuales

**Cómo funcionan:**
- **✅ Ya implementado** en `getUsageByPeriod(userId, feature, 'monthly')`
- Usa `Between(startOfMonth, endOfMonth)` para filtrar
- Suma todos los registros del mes actual
- **Reset automático**: cuando cambia el mes, los registros quedan fuera del rango

**Ejemplo de consulta:**
```sql
SELECT SUM(count) FROM usage_limit
WHERE userId = 123
  AND feature = 'birth_chart'
  AND date BETWEEN '2026-02-01' AND '2026-02-28';
```

**Features configuradas con límites mensuales:**
- `BIRTH_CHART`: FREE: 3/mes, PREMIUM: 5/mes

**⚠️ Problema identificado:** `USAGE_RETENTION_DAYS = 7`

Si el cron job elimina registros después de 7 días, entonces:
- En febrero día 15, se eliminarían registros del 1-7 de febrero
- La consulta mensual solo vería registros del 8-28 de febrero
- **Los límites mensuales no funcionarían correctamente**

**Solución propuesta:**
- Cambiar `USAGE_RETENTION_DAYS` a `35` días (para cubrir 1 mes + margen)
- O modificar el cron job para que respete límites mensuales

### 3. Límites Lifetime

**Cómo funcionan:**
- Suma **todos** los registros sin filtro de fecha
- Usado principalmente para usuarios anónimos
- `AnonymousUsage` usa fecha fija `'1970-01-01'` para lifetime

**Ejemplo de consulta:**
```sql
SELECT SUM(count) FROM usage_limit
WHERE userId = 123
  AND feature = 'pendulum_query';
```

**Features que usan límites lifetime:**
- `PENDULUM_QUERY`: ANONYMOUS: 1 lifetime
- `BIRTH_CHART`: ANONYMOUS: 1 lifetime

---

## 🎯 Puntos de Extensión Identificados

### ✅ NO SE REQUIEREN EXTENSIONES

El sistema **ya soporta todo lo necesario** para Carta Astral:

1. **Feature enum**: `UsageFeature.BIRTH_CHART` existe
2. **Límites configurados**: FREE: 3/mes, PREMIUM: 5/mes, ANONYMOUS: 1 lifetime
3. **Método mensual**: `getUsageByPeriod(userId, BIRTH_CHART, 'monthly')` existe
4. **Decoradores**: `@CheckUsageLimit()` y `@AllowAnonymous()` listos
5. **Guard**: `CheckUsageLimitGuard` funciona out-of-the-box
6. **Interceptor**: `IncrementUsageInterceptor` funciona out-of-the-box

### ⚠️ Ajuste Necesario: Retención de Datos

**Problema:**
```typescript
export const USAGE_RETENTION_DAYS = 7;  // ⚠️ Elimina registros después de 7 días
```

**Impacto:**
- Para límites mensuales (28-31 días), se perderían registros necesarios para el cálculo
- El límite mensual se calcularía incorrectamente (solo últimos 7 días)

**Solución:**
```typescript
// Opción 1: Aumentar retención global
export const USAGE_RETENTION_DAYS = 35;  // 1 mes + margen

// Opción 2: Retención por período (recomendado)
export const USAGE_RETENTION_CONFIG = {
  daily: 7,      // Mantener 7 días para features diarias
  monthly: 35,   // Mantener 35 días para features mensuales
  lifetime: -1,  // Mantener indefinidamente (o valor alto)
};
```

**Cambios requeridos:**
1. Modificar `UsageLimitsResetService.handleDailyReset()` para respetar diferentes retenciones
2. Consultar el período de la feature desde `USAGE_LIMITS` config
3. Eliminar solo registros según su período correspondiente

---

## 📊 Flujo Completo de Validación

### Caso 1: Usuario Autenticado (FREE)

**Request:** `POST /birth-chart` con JWT válido

```typescript
// Controller
@UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
@CheckUsageLimit(UsageFeature.BIRTH_CHART)
@Post()
async create(@Request() req, @Body() dto: CreateBirthChartDto) {
  return this.orchestrator.create(req.user, dto);
}
```

**Flujo:**
1. `JwtAuthGuard` valida el token → Extrae `userId`
2. `CheckUsageLimitGuard` se ejecuta:
   - Obtiene `feature = UsageFeature.BIRTH_CHART` del decorador
   - Llama a `usageLimitsService.checkLimit(userId, BIRTH_CHART)`
   - Internamente:
     - Obtiene `userPlan = UserPlan.FREE` desde `usersService`
     - Obtiene límite: `USAGE_LIMITS[BIRTH_CHART][FREE] = { maxCount: 3, period: 'monthly' }`
     - Llama a `getUsageByPeriod(userId, BIRTH_CHART, 'monthly')`
     - Consulta DB: `SELECT SUM(count) WHERE date BETWEEN '2026-02-01' AND '2026-02-28'`
     - Si `currentUsage < 3` → Retorna `true` (permite acceso)
     - Si `currentUsage >= 3` → Retorna `false` (deniega acceso)
3. Si el guard retorna `false` → Lanza `ForbiddenException('Límite de uso alcanzado')`
4. Si el guard retorna `true` → Continúa con el controller
5. Controller ejecuta lógica de negocio
6. Response exitosa → `IncrementUsageInterceptor` se activa
7. Interceptor llama a `incrementUsage(userId, BIRTH_CHART)`
   - Inserta o incrementa: `INSERT INTO usage_limit (userId, feature, date, count) VALUES (...)`
   - `date = getTodayUTCDateString() = '2026-02-12'`

**Base de datos después:**
```sql
usage_limit
| id | userId | feature     | count | date       |
|----|--------|-------------|-------|------------|
| 1  | 123    | birth_chart | 1     | 2026-02-12 |
```

Al día siguiente (2026-02-13), se crea un nuevo registro. La consulta mensual suma ambos.

### Caso 2: Usuario Anónimo

**Request:** `POST /birth-chart` sin JWT, pero con header `x-device-fingerprint`

```typescript
@AllowAnonymous()
@CheckUsageLimit(UsageFeature.BIRTH_CHART)
@Post()
async create(@Headers('x-device-fingerprint') fingerprint, @Body() dto) {
  return this.orchestrator.create(null, dto, fingerprint);
}
```

**Flujo:**
1. NO hay JWT → `userId = undefined`
2. `CheckUsageLimitGuard` detecta `allowAnonymous = true`
3. Extrae `fingerprint` del header
4. Llama a `anonymousTrackingService.canAccessLifetime(fingerprint, BIRTH_CHART, 1)`
5. Consulta DB: `SELECT COUNT(*) FROM anonymous_usage WHERE fingerprint = '...' AND feature = 'birth_chart' AND date = '1970-01-01'`
6. Si `count < 1` → Permite acceso
7. Si `count >= 1` → Deniega acceso
8. Después del response exitoso:
   - `anonymousTrackingService.incrementUsage(fingerprint, ip, BIRTH_CHART)`
   - `INSERT INTO anonymous_usage (fingerprint, feature, date) VALUES (..., '1970-01-01')`

**Base de datos:**
```sql
anonymous_usage
| id | fingerprint | feature     | date       |
|----|-------------|-------------|------------|
| 1  | abc123...   | birth_chart | 1970-01-01 |
```

La fecha fija `'1970-01-01'` se usa como "marcador" de lifetime.

---

## 🧪 Testing Requerido

### Tests de Integración

**Objetivo:** Validar que el sistema funciona correctamente para límites mensuales de BIRTH_CHART.

#### Test 1: Usuario FREE - Límite Mensual (3/mes)

```typescript
describe('BirthChart - Usage Limits (Integration)', () => {
  it('should allow 3 birth charts per month for FREE users', async () => {
    const user = await createFreeUser();
    
    // Request 1 - OK
    const res1 = await request(app.getHttpServer())
      .post('/birth-chart')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validDto)
      .expect(201);
    
    // Request 2 - OK
    const res2 = await request(app.getHttpServer())
      .post('/birth-chart')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validDto)
      .expect(201);
    
    // Request 3 - OK
    const res3 = await request(app.getHttpServer())
      .post('/birth-chart')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validDto)
      .expect(201);
    
    // Request 4 - FORBIDDEN
    const res4 = await request(app.getHttpServer())
      .post('/birth-chart')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validDto)
      .expect(403);
    
    expect(res4.body.message).toContain('Límite de uso alcanzado');
  });

  it('should reset monthly limit at start of new month', async () => {
    // Mock date to end of month
    jest.useFakeTimers().setSystemTime(new Date('2026-02-28'));
    
    const user = await createFreeUser();
    
    // Use 3 charts in February
    await createBirthChart(user, 3);
    
    // Advance to March 1
    jest.setSystemTime(new Date('2026-03-01'));
    
    // Should allow new chart
    const res = await request(app.getHttpServer())
      .post('/birth-chart')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validDto)
      .expect(201);
    
    jest.useRealTimers();
  });
});
```

#### Test 2: Usuario PREMIUM - Límite Mensual (5/mes)

```typescript
it('should allow 5 birth charts per month for PREMIUM users', async () => {
  const user = await createPremiumUser();
  
  // Create 5 charts - all OK
  for (let i = 0; i < 5; i++) {
    await request(app.getHttpServer())
      .post('/birth-chart')
      .set('Authorization', `Bearer ${user.token}`)
      .send(validDto)
      .expect(201);
  }
  
  // 6th chart - FORBIDDEN
  await request(app.getHttpServer())
    .post('/birth-chart')
    .set('Authorization', `Bearer ${user.token}`)
    .send(validDto)
    .expect(403);
});
```

#### Test 3: Usuario Anónimo - Límite Lifetime (1)

```typescript
it('should allow only 1 birth chart lifetime for anonymous users', async () => {
  const fingerprint = 'test-fingerprint-123';
  
  // Request 1 - OK
  await request(app.getHttpServer())
    .post('/birth-chart')
    .set('x-device-fingerprint', fingerprint)
    .send(validDto)
    .expect(201);
  
  // Request 2 - FORBIDDEN
  await request(app.getHttpServer())
    .post('/birth-chart')
    .set('x-device-fingerprint', fingerprint)
    .send(validDto)
    .expect(403);
  
  // Even after days, still FORBIDDEN
  jest.useFakeTimers().setSystemTime(new Date('2026-03-15'));
  
  await request(app.getHttpServer())
    .post('/birth-chart')
    .set('x-device-fingerprint', fingerprint)
    .send(validDto)
    .expect(403);
  
  jest.useRealTimers();
});
```

#### Test 4: Retención de Datos

```typescript
it('should NOT delete monthly usage records within retention period', async () => {
  const user = await createFreeUser();
  
  // Create chart on Feb 1
  jest.useFakeTimers().setSystemTime(new Date('2026-02-01'));
  await createBirthChart(user);
  
  // Advance to Feb 20 (19 days later)
  jest.setSystemTime(new Date('2026-02-20'));
  
  // Trigger cron job
  const resetService = app.get(UsageLimitsResetService);
  await resetService.handleDailyReset();
  
  // Check that Feb 1 record still exists (for monthly calculation)
  const usage = await usageLimitsService.getUsageByPeriod(
    user.userId,
    UsageFeature.BIRTH_CHART,
    'monthly',
  );
  expect(usage).toBe(1);  // Should still count Feb 1 record
  
  jest.useRealTimers();
});
```

---

## 📝 Recomendaciones

### 1. Ajustar Retención de Datos (CRÍTICO)

**Problema:** `USAGE_RETENTION_DAYS = 7` elimina registros necesarios para límites mensuales.

**Solución recomendada:**

```typescript
// usage-limits.constants.ts
export const USAGE_RETENTION_CONFIG = {
  daily: 7,      // Features diarias: mantener 1 semana
  monthly: 35,   // Features mensuales: mantener 35 días (1 mes + margen)
  lifetime: 90,  // Features lifetime: mantener 3 meses para analytics
};
```

```typescript
// usage-limits-reset.service.ts
async handleDailyReset(): Promise<void> {
  // Para cada feature, obtener su período
  for (const feature of Object.values(UsageFeature)) {
    const config = USAGE_LIMITS[feature];
    
    // Determinar período más largo de esa feature (entre planes)
    const maxPeriod = Object.values(config)
      .map(limit => limit.period)
      .reduce((max, period) => {
        const order = { daily: 1, monthly: 2, lifetime: 3 };
        return order[period] > order[max] ? period : max;
      });
    
    // Obtener días de retención según período
    const retentionDays = USAGE_RETENTION_CONFIG[maxPeriod];
    
    if (retentionDays > 0) {
      const cutoffDate = getDateDaysAgoUTCString(retentionDays);
      
      await this.usageLimitRepository.delete({
        feature,
        date: LessThan(cutoffDate),
      });
    }
  }
}
```

### 2. Documentar Uso de Decoradores

Agregar ejemplos en `backend/tarot-app/docs/USAGE_LIMITS_GUARD.md`:

```typescript
// Ejemplo: Endpoint de Carta Astral
@ApiTags('Carta Astral')
@Controller('birth-chart')
export class BirthChartController {
  @UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
  @CheckUsageLimit(UsageFeature.BIRTH_CHART)
  @AllowAnonymous()  // Permite anónimos con fingerprint
  @Post()
  @ApiOperation({ summary: 'Crear carta astral' })
  async create(
    @Request() req,
    @Headers('x-device-fingerprint') fingerprint: string,
    @Body() dto: CreateBirthChartDto,
  ) {
    return this.orchestrator.create(req.user, dto, fingerprint);
  }
}
```

### 3. Monitoreo de Límites

Agregar endpoint de admin para monitorear uso:

```typescript
@Get('admin/usage-stats')
@UseGuards(AdminGuard)
async getUsageStats(@Query('feature') feature: UsageFeature) {
  return {
    currentMonth: await this.usageLimitsService.getMonthlyStats(feature),
    topUsers: await this.usageLimitsService.getTopUsers(feature, 10),
  };
}
```

---

## ✅ Conclusiones

### Estado Actual

1. **✅ Sistema completo**: El módulo `usage-limits` ya soporta límites diarios, mensuales y lifetime.
2. **✅ BIRTH_CHART configurado**: Feature enum, límites por plan y decoradores listos.
3. **✅ Método mensual existente**: `getUsageByPeriod(userId, feature, 'monthly')` ya implementado.
4. **⚠️ Ajuste necesario**: `USAGE_RETENTION_DAYS = 7` debe aumentarse para límites mensuales.

### Trabajo Requerido (Siguiente Tarea)

**T-CA-022: Integrar Sistema de Límites en Endpoints de Carta Astral**

1. Aplicar decoradores en el controller:
   - `@CheckUsageLimit(UsageFeature.BIRTH_CHART)`
   - `@AllowAnonymous()`
2. Agregar `CheckUsageLimitGuard` en la cadena de guards
3. Pasar `fingerprint` desde el controller al orchestrator (para anónimos)
4. Escribir tests de integración para validar límites mensuales
5. **OPCIONAL (recomendado):** Ajustar `USAGE_RETENTION_DAYS` a 35 días

### Riesgos Identificados

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Retención de 7 días elimina registros mensuales | Alto | Cambiar a 35 días antes de integrar |
| Fingerprint faltante en request anónimo | Medio | Validar en controller y retornar error claro |
| Límite alcanzado sin mensaje claro al usuario | Bajo | Personalizar mensaje de `ForbiddenException` |

---

## 📚 Referencias

- **Documentación**: `docs/USAGE_LIMITS_SYSTEM.md`
- **Guard reutilizable**: `backend/tarot-app/docs/USAGE_LIMITS_GUARD.md`
- **Código fuente**: `backend/tarot-app/src/modules/usage-limits/`
- **Constantes**: `usage-limits.constants.ts`
- **Tarea relacionada**: `docs/BACKLOG_CARTA_ASTRAL.md` (T-CA-022)

---

**Análisis completado:** 12 de febrero de 2026  
**Próximo paso:** T-CA-022 - Integrar Sistema de Límites en Endpoints de Carta Astral
