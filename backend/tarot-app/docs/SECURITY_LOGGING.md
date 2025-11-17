# Security Logging System

## Descripción

Sistema de logging y monitoreo de eventos de seguridad que registra todas las actividades críticas en la aplicación, como intentos de login (exitosos y fallidos), cambios de contraseña, accesos administrativos y actividades sospechosas.

## Componentes

### SecurityEvent Entity

Entidad principal que representa un evento de seguridad en la base de datos.

**Campos:**

- `id` (number): Identificador único auto-incremental
- `eventType` (enum): Tipo de evento de seguridad
- `severity` (enum): Nivel de severidad
- `userId` (number, nullable): Usuario relacionado
- `ipAddress` (string, nullable): Dirección IP del origen
- `userAgent` (string, nullable): User agent del navegador
- `details` (jsonb, nullable): Detalles adicionales del evento
- `createdAt` (timestamp): Fecha y hora del evento

**Índices:**

- `IDX_security_events_user_created` - Para consultas por usuario
- `IDX_security_events_event_type_created` - Para consultas por tipo de evento
- `IDX_security_events_severity_created` - Para consultas por severidad
- `IDX_security_events_created_at` - Para consultas ordenadas por fecha

### Tipos de Eventos (SecurityEventType)

```typescript
enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  SUCCESSFUL_LOGIN = 'successful_login',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  RATE_LIMIT_VIOLATION = 'rate_limit_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_EXPORT = 'data_export',
  ADMIN_ACCESS = 'admin_access',
  PERMISSION_CHANGE = 'permission_change',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  API_KEY_CREATED = 'api_key_created',
}
```

### Niveles de Severidad (SecurityEventSeverity)

```typescript
enum SecurityEventSeverity {
  LOW = 'low', // Eventos normales (ej: login exitoso)
  MEDIUM = 'medium', // Eventos que requieren atención (ej: login fallido)
  HIGH = 'high', // Eventos importantes (ej: múltiples intentos fallidos)
  CRITICAL = 'critical', // Eventos críticos (ej: violación de seguridad detectada)
}
```

## Servicios

### SecurityEventService

Servicio principal que maneja el registro de eventos de seguridad.

**Métodos:**

#### `logSecurityEvent(data: CreateSecurityEventDto): Promise<SecurityEvent>`

Registra un nuevo evento de seguridad en la base de datos y en los logs de Winston.

```typescript
await this.securityEventService.logSecurityEvent({
  eventType: SecurityEventType.FAILED_LOGIN,
  userId: user.id,
  severity: SecurityEventSeverity.MEDIUM,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  details: { email: loginDto.email, reason: 'Invalid password' },
});
```

#### `findAll(queryDto: QuerySecurityEventDto): Promise<PaginatedResponse>`

Consulta eventos de seguridad con filtros y paginación.

**Filtros disponibles:**

- `eventType`: Filtrar por tipo de evento
- `severity`: Filtrar por nivel de severidad
- `userId`: Filtrar por usuario
- `startDate`: Fecha de inicio del rango
- `endDate`: Fecha de fin del rango
- `page`: Número de página (por defecto: 1)
- `limit`: Elementos por página (por defecto: 20, máximo: 100)

#### `logToWinston(event: SecurityEvent): void`

Método privado que registra eventos en los archivos de log de Winston según la severidad:

- **LOW**: Se registra como `info`
- **MEDIUM**: Se registra como `warn`
- **HIGH**: Se registra como `error`
- **CRITICAL**: Se registra como `error`

## Endpoints API

### GET /admin/security/events

Consulta eventos de seguridad (requiere rol admin).

**Query Parameters:**

- `eventType` (opcional): Tipo de evento (failed_login, successful_login, etc.)
- `severity` (opcional): Nivel de severidad (low, medium, high, critical)
- `userId` (opcional): ID numérico del usuario
- `startDate` (opcional): Fecha de inicio (ISO 8601)
- `endDate` (opcional): Fecha de fin (ISO 8601)
- `page` (opcional): Número de página (mínimo: 1)
- `limit` (opcional): Elementos por página (1-100, por defecto: 20)

**Respuesta:**

```json
{
  "events": [
    {
      "id": 1,
      "eventType": "failed_login",
      "severity": "medium",
      "userId": 42,
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "details": {
        "email": "user@example.com",
        "reason": "Invalid password"
      },
      "createdAt": "2025-01-17T10:30:00Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

**Códigos de respuesta:**

- `200 OK`: Consulta exitosa
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No tiene permisos de admin
- `400 Bad Request`: Parámetros inválidos

## Integración con AuthService

El sistema de seguridad está integrado con el servicio de autenticación para registrar automáticamente:

### Login Fallido

```typescript
// En auth.service.ts - validateUser()
await this.securityEventService.logSecurityEvent({
  eventType: SecurityEventType.FAILED_LOGIN,
  userId: user.id,
  severity: SecurityEventSeverity.MEDIUM,
  ipAddress: ipAddress,
  userAgent: userAgent,
  details: { email, reason: 'Invalid password' },
});
```

### Login Exitoso

```typescript
// En auth.service.ts - login()
await this.securityEventService.logSecurityEvent({
  eventType: SecurityEventType.SUCCESSFUL_LOGIN,
  userId: user.id,
  severity: SecurityEventSeverity.LOW,
  ipAddress: ipAddress,
  userAgent: userAgent,
  details: { email: user.email },
});
```

## Logging a Archivos (Winston)

Los eventos se registran automáticamente en archivos de log según su severidad:

**Configuración de Winston:**

- **Console Transport**: Solo en desarrollo
- **File Transport**: Con rotación diaria (DailyRotateFile)
  - Ruta: `logs/app-%DATE%.log`
  - Rotación: Diaria
  - Retención: 14 días
  - Max tamaño: 20MB

**Ejemplo de log:**

```
2025-01-17 10:30:00 warn [correlation-id] [SecurityEventService]: Security Event: failed_login {"eventType":"failed_login","severity":"medium","userId":42,"ipAddress":"192.168.1.100","details":{"email":"user@example.com","reason":"Invalid password"}}
```

## Rendimiento

### Índices de Base de Datos

Se han creado 4 índices compuestos para optimizar las consultas:

1. `IDX_security_events_user_created`: `(user_id, created_at)`
2. `IDX_security_events_event_type_created`: `(event_type, created_at)`
3. `IDX_security_events_severity_created`: `(severity, created_at)`
4. `IDX_security_events_created_at`: `(created_at)`

Todos los índices compuestos incluyen `created_at` para optimizar consultas con rangos de fechas.

### Foreign Keys

- `FK_security_events_user`: Relación con tabla `user` (ON DELETE SET NULL)
  - Permite mantener el evento incluso si el usuario es eliminado

## Ejemplos de Uso

### Registrar Actividad Sospechosa

```typescript
await this.securityEventService.logSecurityEvent({
  eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
  userId: user.id,
  severity: SecurityEventSeverity.HIGH,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  details: {
    action: 'Multiple failed attempts',
    count: 5,
    timeWindow: '5 minutes',
  },
});
```

### Consultar Eventos de un Usuario

```typescript
const events = await this.securityEventService.findAll({
  userId: 42, // ID numérico del usuario
  page: 1,
  limit: 20,
});
```

### Consultar Eventos Críticos del Último Día

```typescript
const events = await this.securityEventService.findAll({
  severity: SecurityEventSeverity.CRITICAL,
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  page: 1,
  limit: 50,
});
```

## Testing

El sistema incluye tests E2E completos que validan:

1. **Autenticación:**

   - Rechaza requests no autenticados (401)
   - Rechaza usuarios no-admin (403)
   - Permite acceso a administradores (200)

2. **Filtros:**

   - Filtrado por tipo de evento
   - Filtrado por severidad
   - Paginación correcta
   - Validación de parámetros

3. **Logging:**
   - Registro automático de login fallido
   - Registro automático de login exitoso
   - Persistencia en base de datos
   - Inclusión de IP y User Agent

**Ejecutar tests:**

```bash
npm run test:e2e -- --testNamePattern="Security Events"
```

## Mejoras Futuras

- [ ] Sistema de alertas automáticas para eventos críticos (email a admin)
- [ ] Dashboard visual para analizar eventos de seguridad
- [ ] Agregación de estadísticas (eventos por día, por tipo, etc.)
- [ ] Detección automática de patrones sospechosos
- [ ] Integración con servicios externos de monitoreo (Sentry, DataDog)
- [ ] Exportación de eventos en formato CSV/JSON
- [ ] Webhooks para notificaciones en tiempo real

## Referencias

- Migración: `1763378576976-CreateSecurityEventsTable.ts`
- Entity: `src/modules/security/entities/security-event.entity.ts`
- Service: `src/modules/security/security-event.service.ts`
- Controller: `src/modules/security/security-events.controller.ts`
- Tests: `test/security-events.e2e-spec.ts`
