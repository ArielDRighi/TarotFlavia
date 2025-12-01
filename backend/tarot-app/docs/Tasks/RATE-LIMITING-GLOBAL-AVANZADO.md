# Rate Limiting Global y Avanzado

## TASK-014: Rate Limiting Global + TASK-014-a: Rate Limiting Avanzado

**Estado:** ✅ COMPLETADO  
**Prioridad:** 🟡 ALTA (TASK-014) / 🔴 CRÍTICA (TASK-014-a)  
**Estimación:** 1 día (TASK-014) + 1.5 días (TASK-014-a)  
**Dependencias:** TASK-002 (Migraciones)  
**Branch:** `feature/TASK-014-implementar-rate-limiting-global`, `feature/TASK-014-a-rate-limiting-avanzado`  
**Commits:** Múltiples, último `5df5727`  
**Marcador MVP:** ⭐ RECOMENDADO (TASK-014) / ⭐⭐⭐ CRÍTICO (TASK-014-a)

---

## 📋 Descripción

Sistema completo de rate limiting para proteger la API contra abuso y ataques DDoS:
- **TASK-014:** Implementación básica con `@nestjs/throttler`
- **TASK-014-a:** Protección avanzada con bloqueo de IPs, whitelist y límites granulares

---

## 🏗️ Arquitectura Implementada

### Componentes Principales

```
Request → IPWhitelistService → IPBlockingService → CustomThrottlerGuard → Controller
                 ↓                      ↓                    ↓
            (bypass)              (403 blocked)        (429 throttled)
```

### 1. CustomThrottlerGuard
**Archivo:** `src/common/guards/custom-throttler.guard.ts`

```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const ip = this.getIP(request);

    // 1. Check IP whitelist - skip all rate limiting
    if (this.ipWhitelistService?.isWhitelisted(ip)) {
      return true;
    }

    // 2. Check if IP is blocked
    if (this.ipBlockingService?.isBlocked(ip)) {
      throw new ForbiddenException(`IP ${ip} is temporarily blocked`);
    }

    try {
      // 3. Apply rate limiting
      return await super.canActivate(context);
    } catch (error) {
      // 4. Record violation
      if (error instanceof ThrottlerException) {
        this.ipBlockingService.recordViolation(ip);
      }
      throw error;
    }
  }
}
```

### 2. IPBlockingService
**Archivo:** `src/common/services/ip-blocking.service.ts`

```typescript
@Injectable()
export class IPBlockingService {
  private readonly violationsMap = new Map<string, ViolationRecord[]>();
  private readonly blockedIPs = new Map<string, BlockedIPRecord>();
  
  // Threshold: 10 violaciones en 1 hora → bloqueo por 1 hora
  private readonly VIOLATION_THRESHOLD = 10;
  private readonly VIOLATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private readonly BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour

  recordViolation(ip: string): void { ... }
  isBlocked(ip: string): boolean { ... }
  blockIP(ip: string, reason: string, duration?: number): void { ... }
  unblockIP(ip: string): boolean { ... }
  getViolations(ip: string): number { ... }
  getAllViolations(): ViolationSummary[] { ... }
  getBlockedIPs(): BlockedIPInfo[] { ... }
}
```

### 3. IPWhitelistService
**Archivo:** `src/common/services/ip-whitelist.service.ts`

```typescript
@Injectable()
export class IPWhitelistService {
  private readonly whitelist: Set<string>;
  
  // IPs por defecto: localhost
  private readonly defaultWhitelist = [
    '127.0.0.1',
    '::1',
    '::ffff:127.0.0.1'
  ];

  constructor() {
    // Cargar desde IP_WHITELIST env variable
    const envWhitelist = process.env.IP_WHITELIST?.split(',') || [];
    this.whitelist = new Set([...this.defaultWhitelist, ...envWhitelist]);
  }

  isWhitelisted(ip: string): boolean { ... }
  addToWhitelist(ip: string): void { ... }
  removeFromWhitelist(ip: string): boolean { ... }
  getWhitelist(): string[] { ... }
}
```

### 4. @RateLimit Decorator
**Archivo:** `src/common/decorators/rate-limit.decorator.ts`

```typescript
export interface RateLimitOptions {
  ttl: number;        // Time window in seconds
  limit: number;      // Max requests in time window
  blockDuration?: number; // Block duration after exceeding
}

export const RateLimit = (options: RateLimitOptions): MethodDecorator =>
  SetMetadata(RATE_LIMIT_OPTIONS_KEY, options);

// Uso:
@RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 })
@Post('register')
async register() { ... }
```

---

## 📊 Límites Configurados

### Límites Globales (AppModule)

```typescript
ThrottlerModule.forRoot([
  {
    name: 'default',
    ttl: 60000,    // 1 minuto
    limit: 100,    // 100 requests
  },
])
```

### Límites por Endpoint Crítico

| Endpoint | Límite | Tiempo | Bloqueo |
|----------|--------|--------|---------|
| `POST /auth/register` | 3 req | 1 hora | 1 hora |
| `POST /auth/login` | 5 req | 15 min | 1 hora |
| `POST /auth/forgot-password` | 3 req | 1 hora | 1 hora |

### Diferenciación por Plan

| Plan | Límite Global | Multiplicador |
|------|---------------|---------------|
| Guest (no auth) | 100 req/min | 1x |
| FREE (auth) | 100 req/min | 1x |
| PREMIUM (auth) | 200 req/min | 2x |

---

## 📁 Archivos Implementados

### TASK-014 (Base)

| Archivo | Descripción |
|---------|-------------|
| `src/common/guards/custom-throttler.guard.ts` | Guard personalizado |
| `src/common/guards/custom-throttler.guard.spec.ts` | Tests del guard |
| `src/common/filters/throttler-exception.filter.ts` | Filtro para mensajes personalizados |
| `docs/RATE_LIMITING.md` | Documentación completa |

### TASK-014-a (Avanzado)

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `src/common/decorators/rate-limit.decorator.ts` | 48 | Decorator @RateLimit |
| `src/common/decorators/rate-limit.decorator.spec.ts` | 118 | Tests (3 tests) |
| `src/common/services/ip-blocking.service.ts` | 182 | Bloqueo de IPs |
| `src/common/services/ip-blocking.service.spec.ts` | 236 | Tests (19 tests) |
| `src/common/services/ip-whitelist.service.ts` | 75 | Whitelist de IPs |
| `src/modules/admin/rate-limits/rate-limits-admin.controller.ts` | 120 | Endpoint violations |
| `src/modules/admin/rate-limits/ip-whitelist-admin.controller.ts` | 106 | Endpoints whitelist |
| `test/rate-limiting-advanced.e2e-spec.ts` | 160 | Tests E2E |

---

## 🔐 Endpoints de Administración

### GET /admin/rate-limits/violations
Obtiene estadísticas de violaciones y IPs bloqueadas:

```bash
curl -X GET http://localhost:3000/admin/rate-limits/violations \
  -H "Authorization: Bearer <admin_token>"
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

### IP Whitelist Management

```bash
# Listar IPs en whitelist
GET /admin/ip-whitelist

# Agregar IP a whitelist
POST /admin/ip-whitelist
{ "ip": "192.168.1.100" }

# Remover IP de whitelist
DELETE /admin/ip-whitelist/192.168.1.100
```

---

## 🛡️ Sistema de Bloqueo Automático

### Flujo de Bloqueo

```
1. Cliente excede rate limit → Violación registrada
2. 10 violaciones en 1 hora → IP bloqueada automáticamente
3. Requests de IP bloqueada → 403 Forbidden inmediato
4. Después de 1 hora → Bloqueo expira automáticamente
```

### Mensaje de Error (429)

```json
{
  "statusCode": 429,
  "message": "Has excedido el límite de solicitudes. Por favor, intenta de nuevo en 60 segundos.",
  "error": "Too Many Requests",
  "retryAfter": 60,
  "limit": 100,
  "remaining": 0
}
```

### Mensaje de IP Bloqueada (403)

```json
{
  "statusCode": 403,
  "message": "IP 203.0.113.100 is temporarily blocked due to excessive rate limit violations",
  "error": "Forbidden"
}
```

---

## 📋 Headers de Respuesta

Todas las respuestas incluyen:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699884960000
```

Cuando se excede (429):
```
Retry-After: 60
```

---

## 🧪 Tests Implementados

### Tests Unitarios
- ✅ CustomThrottlerGuard (múltiples tests)
- ✅ IPBlockingService (19 tests)
- ✅ @RateLimit decorator (3 tests)
- ✅ Total: 22+ tests nuevos

### Tests E2E (`test/rate-limiting-advanced.e2e-spec.ts`)
- ✅ Bloqueo automático tras violaciones
- ✅ IP whitelist funciona
- ✅ Límites específicos por endpoint
- ✅ Diferenciación premium/free

---

## ⚙️ Variables de Entorno

```env
# Whitelist de IPs (opcional, comma-separated)
IP_WHITELIST=192.168.1.1,10.0.0.1

# Configuración de throttler
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

---

## ✅ Criterios de Aceptación Cumplidos

### TASK-014 (Base)
- ✅ Endpoints protegidos contra spam y abuso
- ✅ Límites apropiados por tipo de endpoint
- ✅ Usuarios reciben feedback claro sobre límites
- ✅ Headers X-RateLimit-* en todas las respuestas
- ✅ Usuarios premium tienen doble límite
- ✅ Mensaje de error en español con tiempo de espera

### TASK-014-a (Avanzado)
- ✅ Cada endpoint crítico tiene límites específicos
- ✅ Sistema bloquea IPs abusivas (10 violations → 1h block)
- ✅ Diferenciación guest/free/premium
- ✅ Storage in-memory con documentación para Redis
- ✅ Admins pueden ver estadísticas de violaciones
- ✅ Sistema protege contra DDoS básicos

---

## 📚 Documentación Relacionada

- [docs/RATE_LIMITING.md](../RATE_LIMITING.md) - Documentación completa de 500+ líneas
