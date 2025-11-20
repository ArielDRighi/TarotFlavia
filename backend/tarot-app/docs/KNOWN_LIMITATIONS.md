# Known Limitations & Non-Critical Issues

Este documento registra limitaciones conocidas del sistema que **NO son bugs críticos** pero deben considerarse para mejoras futuras.

---

## 🟠 MEDIA - Race Condition en Concurrent Requests

**Descubierto en:** SUBTASK-18 (E2E Free User Journey)  
**Fecha:** 2025-11-20  
**Estado:** ⚠️ Documentado (no corregido)

### Descripción

Cuando un usuario FREE envía 5 requests concurrentes para crear lecturas, **todas las 5 requests pueden tener éxito** en lugar de respetar el límite de 3 lecturas/día.

### Comportamiento Esperado

- Usuario FREE limitado a 3 lecturas por día
- Request #4 y #5 deberían recibir `403 Forbidden`

### Comportamiento Real

- Las 5 requests concurrentes tienen éxito
- El límite de 3 lecturas se bypasea

### Root Cause

El check de `usage_limit` en la base de datos **NO es atómico**:

```typescript
// Current implementation (non-atomic)
const usageCount = await this.usageLimitRepository.count({ userId, date });
if (usageCount >= 3) {
  throw new ForbiddenException('Daily limit exceeded');
}
await this.usageLimitRepository.increment({ userId, date });
```

**Problema:** Entre el `count` y el `increment`, otra request puede ejecutar el mismo check.

### Impacto

- **Severidad:** 🟠 MEDIA
- **Seguridad:** Baja (no expone datos)
- **Negocio:** Media (usuarios pueden obtener lecturas extra gratis)
- **Explotabilidad:** Alta (requiere conocimiento técnico + herramientas como Postman)

### Mitigación Actual

- ✅ **Rate limiting** activo: Limita requests por IP/usuario
- ✅ Solo afecta usuarios con conocimiento técnico
- ✅ El exceso es pequeño (máximo 2 lecturas extra)

### Solución Propuesta

**Opción A: Row-Level Locking (PostgreSQL)**

```typescript
// Use SELECT FOR UPDATE
const usageLimit = await this.usageLimitRepository
  .createQueryBuilder()
  .where({ userId, date })
  .setLock('pessimistic_write')
  .getOne();

if (usageLimit && usageLimit.count >= 3) {
  throw new ForbiddenException('Daily limit exceeded');
}
```

**Opción B: Atomic Counter**

```typescript
// Use database-level increment with constraint
await this.usageLimitRepository.increment(
  { userId, date },
  'count',
  1
);

// Add CHECK constraint in migration
ALTER TABLE usage_limit ADD CONSTRAINT max_free_readings CHECK (count <= 3);
```

**Opción C: Redis Atomic Increment**

```typescript
const count = await redis.incr(`usage:${userId}:${date}`);
if (count > 3) {
  await redis.decr(`usage:${userId}:${date}`);
  throw new ForbiddenException('Daily limit exceeded');
}
```

### Estimación de Corrección

- **Esfuerzo:** 1-2 horas
- **Riesgo:** Bajo (cambio localizado)
- **Prioridad:** Media (no bloquea MVP)

### Referencias

- Test file: `test/free-user-edge-cases.e2e-spec.ts` (líneas 150-250)
- Test: "should enforce daily limit even with concurrent requests (race condition documented)"

---

## 🟢 BAJA - JWT Stateless Tokens Remain Valid After Logout

**Descubierto en:** SUBTASK-18 (E2E Free User Journey)  
**Fecha:** 2025-11-20  
**Estado:** ℹ️ Expected Behavior (by design)

### Descripción

Después de ejecutar `POST /auth/logout-all`, los **access tokens** siguen siendo válidos hasta su expiración natural (15 minutos).

### Comportamiento Esperado (JWT Stateless)

- ✅ Refresh tokens se revocan inmediatamente (DB)
- ✅ Access tokens siguen válidos hasta expiry (stateless)
- ℹ️ Esto es **comportamiento esperado** de JWT stateless

### Comportamiento Real

Idéntico al esperado. No es un bug.

### Root Cause

**Diseño arquitectónico:** JWT stateless significa que los tokens no se almacenan en base de datos y por lo tanto **no pueden revocarse antes de su expiración** sin implementar un sistema de blacklist.

### Impacto

- **Severidad:** 🟢 BAJA
- **Seguridad:** Baja (ventana de 15 minutos)
- **Usabilidad:** No afecta UX normal
- **Casos de uso afectados:**
  - Usuario hace logout-all desde dispositivo comprometido
  - Token robado sigue funcionando 15 min máximo

### Mitigación Actual

- ✅ **Expiry corto:** 15 minutos es ventana pequeña
- ✅ **Refresh tokens revocados:** Impide renovación
- ✅ **Logout-all:** Revoca TODOS los refresh tokens
- ✅ Después de 15 min, access token expira naturalmente

### Solución Propuesta (Si se requiere)

**Opción A: Token Blacklist (Redis)**

```typescript
// Add revoked tokens to Redis
await redis.setex(`blacklist:${tokenId}`, 900, '1'); // 15 min TTL

// Check in JwtAuthGuard
const isBlacklisted = await redis.exists(`blacklist:${tokenId}`);
if (isBlacklisted) {
  throw new UnauthorizedException('Token revoked');
}
```

**Pros:**

- Revocación inmediata
- Expiración automática (TTL)

**Cons:**

- Añade latencia a CADA request autenticado
- Requiere infraestructura Redis
- Aumenta complejidad
- Contrarresta beneficios de JWT stateless

**Opción B: Shorter Access Token Expiry**

```typescript
// Reduce from 15min to 5min
expiresIn: '5m';
```

**Pros:**

- Reduce ventana de explotación
- No requiere infraestructura adicional

**Cons:**

- Usuarios deben renovar tokens más frecuentemente
- Más carga en endpoint /auth/refresh

### Recomendación

**NO IMPLEMENTAR** token blacklist para MVP. Razones:

1. ✅ 15 minutos es ventana razonable
2. ✅ Refresh tokens ya se revocan correctamente
3. ✅ Añade complejidad y latencia innecesaria
4. ✅ Casos de uso real muy limitados
5. ✅ Alternativa: reducir expiry a 10 minutos si es necesario

### Estimación de Corrección

- **Esfuerzo:** 3-4 horas (blacklist implementation)
- **Riesgo:** Medio (impacta performance de todos los requests)
- **Prioridad:** Baja (no recomendado para MVP)

### Referencias

- Test file: `test/free-user-edge-cases.e2e-spec.ts` (líneas 260-350)
- Test: "should allow re-authentication after logout-all (JWT stateless - old token still valid)"
- Auth service: `src/modules/auth/application/services/auth.service.ts`

---

## 📋 Resumen

| Limitación                         | Severidad | Impacto Negocio | Corrección Recomendada | Prioridad | Estimación |
| ---------------------------------- | --------- | --------------- | ---------------------- | --------- | ---------- |
| Race condition concurrent requests | 🟠 MEDIA  | Media           | SÍ (row-level locking) | Media     | 1-2 hrs    |
| JWT stateless after logout         | 🟢 BAJA   | Baja            | NO (by design)         | Baja      | N/A        |

---

## Próximas Acciones

### Corto Plazo (Post-MVP)

- [ ] **TASK-XXX:** Implementar row-level locking en usage_limit (race condition fix)

### Largo Plazo (Si es necesario)

- [ ] Evaluar reducir access token expiry de 15min → 10min
- [ ] Considerar token blacklist solo si hay requerimiento de seguridad específico

---

## Proceso de Actualización

1. **Tests descubren limitación** → Documentar aquí (no corregir inmediatamente)
2. **Evaluar severidad:**
   - 🔴 CRÍTICA: Corregir inmediatamente
   - 🟠 MEDIA: Documentar + planificar corrección post-MVP
   - 🟢 BAJA: Documentar + evaluar necesidad
3. **Crear TASK específica** para corrección si aplica
4. **Actualizar este documento** con decisión final

---

**Última actualización:** 2025-11-20 (SUBTASK-18)
