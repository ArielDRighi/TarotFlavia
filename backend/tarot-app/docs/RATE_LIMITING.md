# Rate Limiting

Este proyecto implementa rate limiting global usando `@nestjs/throttler` para proteger la API contra abusos y garantizar un uso justo de los recursos.

## Configuración General

### Límites Globales

- **100 requests por minuto** para todos los endpoints (excepto los que tienen límites específicos)
- Los headers `X-RateLimit-*` se incluyen en todas las respuestas

### Límites por Endpoint

#### Autenticación (`/auth`)

- **5 requests por minuto**
- Aplica a todos los endpoints de autenticación (login, register, etc.)

#### Lecturas de Tarot (`/readings`)

- **10 requests por minuto**
- Aplica a endpoints de creación y consulta de lecturas

### Diferenciación por Plan de Usuario

Los usuarios **premium** reciben **el doble de límite** en todos los endpoints:

- Global: 200 req/min (vs 100 req/min para usuarios free)
- Auth: 10 req/min (vs 5 req/min)
- Readings: 20 req/min (vs 10 req/min)

## Headers de Respuesta

Todas las respuestas incluyen los siguientes headers:

### Respuestas Exitosas

```
X-RateLimit-Limit: <límite_máximo>
X-RateLimit-Remaining: <requests_restantes>
X-RateLimit-Reset: <timestamp_unix_en_ms>
```

### Cuando se excede el límite (HTTP 429)

```
X-RateLimit-Limit: <límite_máximo>
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <timestamp_unix_en_ms>
Retry-After: <segundos_para_reintentar>
```

## Mensajes de Error

Cuando se excede el límite, la respuesta será:

```json
{
  "statusCode": 429,
  "message": "Has excedido el límite de solicitudes. Por favor, intenta de nuevo en X segundos.",
  "error": "Too Many Requests",
  "retryAfter": 60,
  "limit": 100,
  "remaining": 0
}
```

## Implementación Técnica

### CustomThrottlerGuard

Guard personalizado que extiende `ThrottlerGuard` para:

- Diferenciar límites según el plan del usuario (free vs premium)
- Usar tracker personalizado basado en IP + userId (si está autenticado)

### ThrottlerExceptionFilter

Filtro de excepciones que intercepta `ThrottlerException` para:

- Generar mensajes de error personalizados en español
- Incluir información útil del tiempo de espera
- Mantener los headers X-RateLimit-\* en la respuesta

### Aplicación en Controladores

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 req/min
export class AuthController {
  // endpoints...
}
```

## Testing

Las pruebas E2E verifican:

- ✅ Límite global se aplica correctamente
- ✅ Límites específicos por endpoint funcionan
- ✅ Headers X-RateLimit-\* se incluyen en respuestas
- ✅ Mensajes de error personalizados se retornan
- ✅ Header Retry-After se incluye en errores 429

Ejecutar pruebas:

```bash
npm run test:e2e -- --testPathPattern="rate-limiting"
```

## Consideraciones para Producción

### Redis como Storage

Para ambientes de producción con múltiples instancias, se recomienda usar Redis como storage compartido:

```typescript
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60000, limit: 100 }],
  storage: new ThrottlerStorageRedisService({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }),
});
```

### Proxies y Load Balancers

Si la aplicación está detrás de un proxy/load balancer, asegurar que Express confíe en el proxy:

```typescript
// main.ts
app.set('trust proxy', true);
```

El `CustomThrottlerGuard` ya maneja correctamente el header `X-Forwarded-For` para obtener la IP real del cliente.

## Endpoints Públicos

Si necesitas excluir algún endpoint del rate limiting:

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
export class HealthController {
  @SkipThrottle() // Este endpoint no tiene límite de rate
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```
