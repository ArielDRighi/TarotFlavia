# Rate Limiting Avanzado

Este proyecto implementa un sistema avanzado de rate limiting usando `@nestjs/throttler` con protección DDoS, bloqueo de IPs abusivas y diferenciación granular por planes de usuario.

## 🚀 Características Principales

- ✅ **Rate limiting global** (100 req/min base)
- ✅ **Límites específicos por endpoint crítico**
- ✅ **Bloqueo automático de IPs** tras violaciones repetidas
- ✅ **IP Whitelist** para admins, health checks y servicios de confianza
- ✅ **Diferenciación Guest/FREE/PREMIUM** con límites escalables
- ✅ **Dashboard de administración** para monitorear violaciones
- ✅ **Headers X-RateLimit-\*** en todas las respuestas

## Configuración General

### Límites Globales

- **100 requests por minuto** para todos los endpoints (excepto los que tienen límites específicos)
- Los headers `X-RateLimit-*` se incluyen en todas las respuestas
- **Usuarios Premium**: 200 req/min (doble límite)

### Límites por Endpoint Crítico (con @RateLimit decorator)

#### 🔒 Autenticación

| Endpoint                     | Límite      | Bloqueo tras exceder |
| ---------------------------- | ----------- | -------------------- |
| `POST /auth/register`        | 3 req/hora  | 1 hora               |
| `POST /auth/login`           | 5 req/15min | 1 hora               |
| `POST /auth/forgot-password` | 3 req/hora  | 1 hora               |

#### 📖 Lecturas de Tarot

| Plan    | Límite diario | Límite por minuto |
| ------- | ------------- | ----------------- |
| Guest   | N/A           | 5 req/min         |
| FREE    | 3 lecturas    | 10 req/min        |
| PREMIUM | 50 lecturas   | 20 req/min        |

### Diferenciación por Plan de Usuario

#### Guest (no autenticado)

- Límite global: 100 req/min
- Sin acceso a lecturas de tarot
- Rate limiting más restrictivo

#### FREE (autenticado)

- Límite global: 100 req/min
- Lecturas: 3/día
- Regeneraciones: NO permitidas

#### PREMIUM (autenticado)

- Límite global: **200 req/min** (2x)
- Lecturas: 50/día
- Regeneraciones: 10/día
- Todos los límites por endpoint **duplicados**

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

## 🛡️ Protección DDoS: Bloqueo Automático de IPs

### Sistema de Violaciones

El sistema trackea violaciones de rate limit por IP:

- **Threshold**: 10 violaciones en 1 hora
- **Acción**: Bloqueo automático de IP por 1 hora
- **Ventana**: Las violaciones expiran después de 1 hora

### Ejemplo de Flujo

1. Cliente hace 11 requests excediendo límite → 10 violaciones registradas
2. Sistema bloquea automáticamente la IP por 1 hora
3. Todos los requests de esa IP reciben **403 Forbidden** inmediatamente
4. Después de 1 hora, el bloqueo expira automáticamente

### Consultar Violaciones (Admin)

```bash
GET /admin/rate-limits/violations
Authorization: Bearer <admin_token>
```

**Respuesta:**

```json
{
  "violations": [
    {
      "ip": "203.0.113.100",
      "count": 8,
      "firstViolation": "2025-11-13T10:00:00.000Z",
      "lastViolation": "2025-11-13T10:45:00.000Z"
    }
  ],
  "blockedIps": [
    {
      "ip": "203.0.113.101",
      "reason": "Too many rate limit violations",
      "blockedAt": "2025-11-13T11:00:00.000Z",
      "expiresAt": "2025-11-13T12:00:00.000Z"
    }
  ],
  "stats": {
    "totalViolations": 15,
    "totalBlockedIps": 2,
    "activeViolationsCount": 3
  }
}
```

## 🏳️ IP Whitelist

### IPs por Defecto (siempre whitelisted)

- `127.0.0.1` (localhost IPv4)
- `::1` (localhost IPv6)
- `::ffff:127.0.0.1` (localhost IPv6-mapped IPv4)

### Gestión de Whitelist (Admin)

#### Listar IPs whitelisted

```bash
GET /admin/ip-whitelist
Authorization: Bearer <admin_token>
```

#### Agregar IP

```bash
POST /admin/ip-whitelist
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "ip": "203.0.113.50"
}
```

#### Eliminar IP

```bash
DELETE /admin/ip-whitelist/203.0.113.50
Authorization: Bearer <admin_token>
```

### Configuración vía Variables de Entorno

```env
# .env
IP_WHITELIST=203.0.113.50,203.0.113.51,198.51.100.0
```

**Nota**: Las IPs en `IP_WHITELIST` se cargan al iniciar la aplicación y **no están sujetas a rate limiting**.

## Implementación Técnica

### @RateLimit Decorator

Decorator personalizado para aplicar límites específicos a endpoints:

```typescript
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('auth')
export class AuthController {
  @Post('register')
  @RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 })
  async register(@Body() dto: CreateUserDto) {
    // 3 registros/hora, bloqueo 1 hora tras exceder
  }

  @Post('login')
  @RateLimit({ ttl: 900, limit: 5, blockDuration: 3600 })
  async login(@Body() dto: LoginDto) {
    // 5 intentos/15min, bloqueo 1 hora tras exceder
  }
}
```

**Opciones:**

- `ttl`: Tiempo de ventana en segundos
- `limit`: Número máximo de requests en la ventana
- `blockDuration`: Duración del bloqueo en segundos (opcional, default = ttl)

### CustomThrottlerGuard

Guard personalizado que extiende `ThrottlerGuard` para:

- Verificar si IP está en whitelist (bypass total si está)
- Verificar si IP está bloqueada (403 inmediato si está)
- Diferenciar límites según el plan del usuario (free vs premium)
- Registrar violaciones automáticamente al exceder límites
- Usar tracker personalizado basado en IP + userId

### IPBlockingService

Servicio que gestiona violaciones y bloqueos:

```typescript
// Registrar violación (automático al exceder rate limit)
recordViolation(ip: string): void

// Verificar si IP está bloqueada
isBlocked(ip: string): boolean

// Bloquear IP manualmente (admin)
blockIP(ip: string, durationSeconds: number, reason?: string): void

// Desbloquear IP
unblockIP(ip: string): void

// Obtener violaciones de una IP
getViolations(ip: string): number

// Obtener todas las violaciones activas
getAllViolations(): Array<{ip, count, firstViolation, lastViolation}>

// Obtener IPs bloqueadas
getBlockedIPs(): Array<{ip, reason, blockedAt, expiresAt}>
```

### IPWhitelistService

Servicio que gestiona la whitelist de IPs:

```typescript
// Verificar si IP está whitelisted
isWhitelisted(ip: string): boolean

// Agregar IP a whitelist
addIP(ip: string): void

// Eliminar IP de whitelist
removeIP(ip: string): void

// Obtener todas las IPs whitelisted
getWhitelistedIPs(): string[]
```

### ThrottlerExceptionFilter

Filtro de excepciones que intercepta `ThrottlerException` para:

- Generar mensajes de error personalizados en español
- Incluir información útil del tiempo de espera
- Mantener los headers X-RateLimit-\* en la respuesta

## Testing

### Suite de Tests E2E

Las pruebas E2E verifican:

- ✅ Límite global se aplica correctamente
- ✅ Límites específicos por endpoint funcionan
- ✅ IP se bloquea automáticamente tras 10 violaciones
- ✅ Blocked IP recibe 403 Forbidden
- ✅ Bloqueo expira después de duración especificada
- ✅ IP whitelisted bypasea rate limiting
- ✅ Usuarios premium reciben 2x límite
- ✅ Headers X-RateLimit-\* se incluyen en respuestas
- ✅ Mensajes de error personalizados se retornan
- ✅ Header Retry-After se incluye en errores 429
- ✅ Admin puede consultar violaciones y bloqueos

### Ejecutar Tests

```bash
# Todos los tests de rate limiting
npm run test:e2e -- --testPathPattern="rate-limiting"

# Solo tests avanzados (IP blocking)
npm run test:e2e -- --testPathPattern="rate-limiting-advanced"

# Tests básicos
npm run test:e2e -- rate-limiting.e2e-spec.ts
```

## 🔧 Consideraciones para Producción

### Redis como Storage (Recomendado)

Para ambientes de producción con múltiples instancias, se recomienda usar Redis como storage compartido:

```bash
npm install nestjs-throttler-storage-redis ioredis
```

```typescript
// app.module.ts
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

ThrottlerModule.forRoot({
  throttlers: [{ ttl: 60000, limit: 100 }],
  storage: new ThrottlerStorageRedisService({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  }),
});
```

**Variables de entorno:**

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
REDIS_DB=0
```

**Nota**: Sin Redis, el rate limiting funciona en memoria (in-memory) lo cual está bien para desarrollo y servidores single-instance, pero no es adecuado para clusters.

### Proxies y Load Balancers

Si la aplicación está detrás de un proxy/load balancer, asegurar que Express confíe en el proxy:

```typescript
// main.ts
app.set('trust proxy', true);
```

El `CustomThrottlerGuard` ya maneja correctamente el header `X-Forwarded-For` para obtener la IP real del cliente.

### Monitoreo y Alertas

Se recomienda configurar alertas para:

- Número de IPs bloqueadas > threshold (ej: 10 IPs bloqueadas simultáneamente)
- Rate limit violations por endpoint (detectar intentos de ataque)
- IPs con alto número de violaciones (posible bot/scraper)

```typescript
// Ejemplo: integración con sistema de alertas
if (ipBlockingService.getBlockedIPs().length > 10) {
  alertingService.send('High number of blocked IPs detected');
}
```

### Ajustar Límites según Carga

Los límites actuales son conservadores para MVP. En producción ajustar según:

- **Capacidad del servidor**: CPU, memoria, base de datos
- **Análisis de tráfico real**: percentiles p95, p99 de requests/min por usuario
- **Costos de infraestructura**: APIs externas (OpenAI, etc.)

**Ejemplo de ajuste:**

```typescript
// Aumentar límite global a 200 req/min
ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]);
```

## 🚫 Excluir Endpoints del Rate Limiting

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

  @Get('db')
  @SkipThrottle({ default: false }) // Solo skip para throttler default
  checkDatabase() {
    return { status: 'ok' };
  }
}
```

**Nota**: Los health checks ya están excluidos por defecto cuando la IP está en whitelist.

## 📊 Métricas y Logs

### Logs Disponibles

El sistema loggea automáticamente:

```
[IPBlockingService] IP 203.0.113.100 violation recorded (5/10)
[IPBlockingService] IP 203.0.113.100 blocked after 10 violations
[CustomThrottlerGuard] Blocked request from IP: 203.0.113.100
[CustomThrottlerGuard] Whitelisted IP bypassing rate limit: 127.0.0.1
[IPWhitelistService] Added 203.0.113.50 to whitelist
```

### Nivel de Log Recomendado

- **Desarrollo**: `DEBUG` (ver todas las violaciones)
- **Producción**: `WARN` (solo bloqueos y eventos críticos)

```env
LOG_LEVEL=warn
```

## 🔒 Seguridad

### Buenas Prácticas

1. **No exponer detalles internos**: Los mensajes de error no revelan información del sistema
2. **Usar HTTPS**: Siempre en producción para proteger tokens y headers
3. **Rotar secrets**: JWT secrets regularmente
4. **Monitorear whitelist**: Auditar cambios en la whitelist de IPs
5. **Rate limiting en múltiples capas**: Combinar con firewall (ej: Cloudflare)

### Prevención de Bypass

El sistema previene bypass de rate limiting mediante:

- ✅ Tracking por IP real (X-Forwarded-For)
- ✅ Tracking adicional por userId cuando está autenticado
- ✅ Bloqueo automático de IPs abusivas
- ✅ Whitelist controlada solo por admins
- ✅ Headers X-RateLimit-\* no exponen información sensible

## 🆘 Troubleshooting

### Usuario legítimo bloqueado

> ⚠️ **Nota**: Actualmente no existe un endpoint REST para desbloquear IPs. El desbloqueo debe realizarse programáticamente desde el servicio o agregando la IP a la whitelist.

**Opción 1: Desbloquear vía servicio** (requiere acceso al código):

```typescript
ipBlockingService.unblockIP('203.0.113.100');
```

**Opción 2: Agregar a whitelist** (preferido para IPs confiables):

```bash
POST /admin/ip-whitelist
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "ip": "203.0.113.100"
}
```

### Demasiados 429 en producción

1. Verificar logs de violations: `GET /admin/rate-limits/violations`
2. Analizar patrones de tráfico legítimo
3. Ajustar límites si es necesario
4. Considerar agregar IPs de servicios legítimos a whitelist

### Rate limiting no funciona

1. Verificar que `CustomThrottlerGuard` está registrado como `APP_GUARD`
2. Verificar que `trust proxy` está habilitado si usa proxy/LB
3. Verificar que Redis está funcionando (si se usa)
4. Revisar logs: `[ThrottlerGuard]` y `[CustomThrottlerGuard]`

## 📚 Referencias

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [RFC 6585 - Additional HTTP Status Codes (429 Too Many Requests)](https://www.rfc-editor.org/rfc/rfc6585#section-4)
