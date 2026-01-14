# Sistema de Límites de Uso y Reseteo

## Resumen

Este documento describe el sistema de límites de uso para las funcionalidades de Auguria (lecturas de tarot y carta del día), incluyendo cómo se aplican los límites según el tipo de usuario y cómo se resetean cada 24 horas.

## Arquitectura General

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  CheckUsageLimitGuard │────▶│   Base de Datos │
│   (Next.js)     │     │      (NestJS)         │     │   (PostgreSQL)  │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   date.utils.ts      │
                        │ (Utilidades de fecha)│
                        └──────────────────────┘
```

## Tipos de Límites

### 1. TAROT_READING (Lecturas de Tarot)

| Plan      | Límite Diario | Descripción                    |
|-----------|---------------|--------------------------------|
| ANONYMOUS | 1             | Sin registro                   |
| FREE      | 1             | Usuario registrado gratuito    |
| PREMIUM   | 3             | Usuario de pago                |

### 2. DAILY_CARD (Carta del Día)

| Plan      | Límite Diario | Descripción                    |
|-----------|---------------|--------------------------------|
| ANONYMOUS | 1             | Sin registro                   |
| FREE      | 1             | Usuario registrado gratuito    |
| PREMIUM   | 1             | Usuario de pago (mismo límite) |

## Componentes del Sistema

### Backend

#### 1. CheckUsageLimitGuard (`backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.ts`)

Este guard de NestJS intercepta las peticiones a endpoints protegidos y verifica si el usuario ha alcanzado su límite diario.

```typescript
@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obtiene el tipo de límite del decorador @UsageLimit()
    // 2. Determina el plan del usuario (ANONYMOUS, FREE, PREMIUM)
    // 3. Consulta el uso en las últimas 24 horas
    // 4. Compara con el límite permitido
    // 5. Lanza ForbiddenException si se excede
  }
}
```

**Uso en controladores:**

```typescript
@Post()
@UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
@UsageLimit(UsageLimitType.TAROT_READING)
async createReading(@Body() dto: CreateReadingDto) {
  // ...
}
```

#### 2. Utilidades de Fecha (`backend/tarot-app/src/common/utils/date.utils.ts`)

Funciones centralizadas para manejo consistente de fechas UTC:

```typescript
/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (UTC)
 * Usado para comparar con columnas DATE de PostgreSQL
 */
export function getTodayUTCDateString(): string {
  return formatDateToUTCString(new Date());
}

/**
 * Formatea un Date a string YYYY-MM-DD usando componentes UTC
 */
export function formatDateToUTCString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el inicio del día actual (00:00:00 UTC)
 * Usado para consultas de ventana de 24 horas con TIMESTAMP
 */
export function getStartOfTodayUTC(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}
```

#### 3. Lógica de Consulta por Tipo de Límite

El guard utiliza diferentes estrategias de consulta según el tipo de recurso:

**DAILY_CARD** (columna `reading_date` tipo DATE):
```typescript
const count = await this.dailyReadingRepository
  .createQueryBuilder('dr')
  .where('dr.userId = :userId', { userId })
  .andWhere('dr.readingDate = :today', { today: getTodayUTCDateString() })
  .getCount();
```

**TAROT_READING** (columna `created_at` tipo TIMESTAMP):
```typescript
const count = await this.readingRepository
  .createQueryBuilder('r')
  .where('r.userId = :userId', { userId })
  .andWhere('r.createdAt >= :startOfDay', { startOfDay: getStartOfTodayUTC() })
  .getCount();
```

### Frontend

#### 1. Utilidades de Fecha (`frontend/src/lib/utils/date.ts`)

Manejo de fechas que evita problemas de timezone al mostrar fechas en la UI:

```typescript
/**
 * Parsea un string de fecha de forma segura para evitar shift de timezone.
 *
 * PROBLEMA: new Date('2025-01-15') interpreta como UTC midnight.
 * En timezone UTC-3, esto muestra "14 de enero" en vez de "15 de enero".
 *
 * SOLUCIÓN: Para fechas DATE-only (YYYY-MM-DD), construimos un Date
 * usando el constructor explícito con hora 12:00 local, evitando
 * ambigüedades de parsing dependientes de implementación.
 */
export function parseDateString(dateString: string): Date {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  if (isDateOnly) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }
  return new Date(dateString);
}

/**
 * Formatea fecha completa en español: "Miércoles 15 de enero"
 */
export function formatDateFull(dateString: string): string {
  const date = parseDateString(dateString);
  const formatted = format(date, "EEEE d 'de' MMMM", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
```

#### 2. Funciones Disponibles

| Función | Formato de Salida | Ejemplo |
|---------|-------------------|---------|
| `formatDateFull` | "Día D de Mes" | "Miércoles 15 de enero" |
| `formatDateFullWithYear` | "Día D de Mes de YYYY" | "Miércoles 15 de enero de 2025" |
| `formatDateShort` | "DD/MM/YYYY" | "15/01/2025" |
| `formatDateCompact` | "M/D" | "1/15" |
| `formatDateLocalized` | Según locale | "15 de enero de 2025" |

## Flujo de Verificación de Límites

```
Usuario hace petición
        │
        ▼
┌───────────────────┐
│ CheckUsageLimitGuard │
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────────┐
│ ¿Qué tipo de límite?          │
│ (TAROT_READING o DAILY_CARD)  │
└─────────┬─────────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
TAROT_READING  DAILY_CARD
    │           │
    ▼           ▼
Consulta por   Consulta por
createdAt      readingDate
>= inicio día  = fecha hoy
    │           │
    └─────┬─────┘
          │
          ▼
┌───────────────────────────────┐
│ ¿Uso actual < límite del plan?│
└─────────┬─────────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
   SÍ          NO
    │           │
    ▼           ▼
 Permitir    Denegar
 (200 OK)    (403 Forbidden)
```

## Reseteo de Límites

### ¿Cuándo se resetean los límites?

Los límites se resetean automáticamente **cada día a las 00:00 UTC**.

No hay un proceso de reset explícito. El sistema simplemente cuenta los usos del día actual:

- Para **DAILY_CARD**: Cuenta registros donde `reading_date = fecha_hoy`
- Para **TAROT_READING**: Cuenta registros donde `created_at >= inicio_del_día_UTC`

### Ejemplo de Reseteo

```
Día 1 (14 de enero 2025):
- Usuario FREE crea 1 lectura a las 10:00 UTC
- Conteo: 1/1 → Límite alcanzado
- Intento a las 15:00 UTC → 403 Forbidden

Día 2 (15 de enero 2025):
- 00:00 UTC: Nuevo día comienza
- Usuario intenta crear lectura a las 08:00 UTC
- Conteo: 0/1 → Permitido
- Lectura creada exitosamente
```

## Manejo de Usuarios Anónimos

Los usuarios anónimos se identifican por **fingerprint del navegador**:

```typescript
// Frontend: genera fingerprint único
export async function getSessionFingerprint(): Promise<string> {
  // Combina: userAgent + idioma + timezone + resolución + etc.
  return hash(browserProperties);
}

// Backend: busca por visitorFingerprint en vez de userId
const count = await this.readingRepository
  .createQueryBuilder('r')
  .where('r.visitorFingerprint = :fingerprint', { fingerprint })
  .andWhere('r.createdAt >= :startOfDay', { startOfDay })
  .getCount();
```

## Esquema de Base de Datos

### Tabla `daily_readings`

```sql
CREATE TABLE daily_readings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  visitor_fingerprint VARCHAR(255),
  reading_date DATE NOT NULL,  -- Columna tipo DATE
  card_id INTEGER REFERENCES tarot_cards(id),
  -- ...
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para consultas de límite
CREATE INDEX idx_daily_readings_user_date
ON daily_readings(user_id, reading_date);
```

### Tabla `readings`

```sql
CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  visitor_fingerprint VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),  -- Columna tipo TIMESTAMP
  -- ...
);

-- Índice para consultas de límite
CREATE INDEX idx_readings_user_created
ON readings(user_id, created_at);
```

## Testing

### Tests Unitarios (Backend)

```typescript
// date.utils.spec.ts
describe('getTodayUTCDateString', () => {
  it('should return today in YYYY-MM-DD format', () => {
    const result = getTodayUTCDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// check-usage-limit.guard.spec.ts
describe('24-hour limit reset', () => {
  it('should allow new reading after midnight UTC', async () => {
    // Simula lectura de ayer
    await createReadingAt(yesterday);

    // Verifica que hoy se permite nueva lectura
    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
  });
});
```

### Tests Unitarios (Frontend)

```typescript
// date.test.ts
describe('parseDateString', () => {
  it('should not shift DATE-only strings due to timezone', () => {
    const parsed = parseDateString('2025-01-15');
    expect(parsed.getDate()).toBe(15);
    expect(parsed.getMonth()).toBe(0); // January
  });
});
```

## Errores Comunes y Soluciones

### 1. Fechas Mostradas un Día Antes

**Problema:** El historial muestra "14 de enero" cuando debería ser "15 de enero".

**Causa:** `new Date('2025-01-15')` se interpreta como UTC midnight. En timezones negativos (ej: UTC-3), esto resulta en "14 de enero 21:00".

**Solución:** Usar `parseDateString()` que agrega `T12:00:00` a fechas DATE-only.

### 2. Límites No Se Resetean

**Problema:** Usuario reporta que no puede crear lectura aunque es un nuevo día.

**Posibles causas:**
1. El servidor está en timezone diferente al UTC
2. La columna de fecha usa tipo incorrecto (TIMESTAMP vs DATE)
3. La consulta no usa las funciones centralizadas

**Solución:** Verificar que se usen `getTodayUTCDateString()` y `getStartOfTodayUTC()`.

### 3. Usuario Anónimo Tiene Límite Incorrecto

**Problema:** Usuario anónimo puede crear más lecturas de las permitidas.

**Causa:** El fingerprint del navegador cambió (modo incógnito, diferente navegador).

**Solución:** Esto es comportamiento esperado. El fingerprint es "best effort" para usuarios no autenticados.

## Configuración de Límites

Los límites están definidos en:

```typescript
// backend/tarot-app/src/modules/usage-limits/constants/limits.ts
export const USAGE_LIMITS = {
  [UsageLimitType.TAROT_READING]: {
    [SubscriptionPlan.ANONYMOUS]: 1,
    [SubscriptionPlan.FREE]: 1,
    [SubscriptionPlan.PREMIUM]: 3,
  },
  [UsageLimitType.DAILY_CARD]: {
    [SubscriptionPlan.ANONYMOUS]: 1,
    [SubscriptionPlan.FREE]: 1,
    [SubscriptionPlan.PREMIUM]: 1,
  },
};
```

Para modificar límites, actualiza este archivo y reinicia el servidor.

## Monitoreo

### Logs Relevantes

```typescript
// El guard registra cuando se deniega acceso
this.logger.warn(
  `User ${userId} exceeded ${limitType} limit: ${currentUsage}/${limit}`
);
```

### Métricas Sugeridas

- `usage_limit_checks_total`: Total de verificaciones de límite
- `usage_limit_exceeded_total`: Total de límites excedidos (por tipo y plan)
- `daily_readings_created_total`: Total de lecturas creadas por día

## Referencias

- [NestJS Guards](https://docs.nestjs.com/guards)
- [TypeORM QueryBuilder](https://typeorm.io/select-query-builder)
- [date-fns Locales](https://date-fns.org/docs/I18n)
- [JavaScript Date Gotchas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format)
