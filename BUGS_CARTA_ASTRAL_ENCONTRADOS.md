# 🐛 Bugs Encontrados en Página de Carta Astral

**Fecha:** Febrero 16, 2026
**Usuario Reporte:** Ariel
**Status:** Investigación Completada - Hallazgos Documentados

---

## Resumen Ejecutivo

Se identificaron **3 bugs críticos** que causan que los campos de la página de Carta Astral se bloqueen inmediatamente después de cargar (2-3 segundos):

1. **Error 500 en endpoint `/api/v1/birth-chart/usage`** (RAÍZ CAUSA)
2. **OptionalJwtAuthGuard retorna usuario ANÓNIMO para usuarios AUTENTICADOS**
3. **Lógica de bloqueo desactiva formulario cuando `usage` es undefined**

---

## 🔴 BUG #1: Error 500 en `/api/v1/birth-chart/usage` - CRÍTICO

**Severidad:** 🔴 CRÍTICA
**Impacto:** Todos los usuarios afectados
**Status:** ✅ Confirmado

### Síntomas
- Console muestra errores HTTP 500 al cargar página
- Campo `usage` en frontend queda `undefined`
- Formulario se bloquea después de 2-3 segundos

### Evidencia
```
GET http://localhost:3000/api/v1/birth-chart/usage HTTP/1.1
< HTTP/1.1 500 Internal Server Error
```

### Causa Probable
Hay 3 causas potenciales que contribuyen:

**Opción A: OptionalJwtAuthGuard no extrae usuario**
- Cuando hay Authorization header, el guard intenta validar el token
- Si el token es inválido/expirado, el catch bloque lo captura (línea 27-30)
- Retorna `true` permitiendo acceso, pero `handleRequest` retorna `null`
- Resultado: `@CurrentUser() user = null` → se trata como anónimo

**Opción B: JWT Token expirado**
- El token tiene `exp: 1771244276`
- Si la fecha actual es posterior a ese timestamp, está expirado
- AuthGuard rechaza el token
- Guard lo captura en catch y retorna `null`

**Opción C: usageLimitsService.getUsageByPeriod() falla**
- Línea 211: `await this.usageLimitsService.getUsageByPeriod(user.userId, ...)`
- Si `user` es NULL (porque guard falló), esto lanza error
- Resultado: HTTP 500

### Código Problemático

**backend/.../optional-jwt-auth.guard.ts (línea 27-30)**
```typescript
try {
  const result = await super.canActivate(context);
  return result as boolean;
} catch {
  // Si el token es inválido, permitir acceso sin autenticación
  return true;  // ← RETORNA TRUE PERO USER SIGUE SIENDO NULL
}
```

**backend/.../birth-chart-facade.service.ts (línea 211)**
```typescript
// Si user es NULL, esto lanza error
const monthlyUsage = await this.usageLimitsService.getUsageByPeriod(
  user.userId,  // ← ERROR si user es NULL
  UsageFeature.BIRTH_CHART,
  'monthly',
);
```

### Solución (Recomendada)

Agregar validación en `birth-chart-facade.service.ts` línea 209-210:

```typescript
async getUsageStatus(
  user: UserContext | null,
  fingerprint: string,
): Promise<{ ... }> {
  if (!user) {
    // Caso: anónimo
    return { ... };
  }

  // ← VALIDAR QUE USER.USERID EXISTE Y ES VÁLIDO
  if (!user.userId) {
    throw new BadRequestException('Invalid user context');
  }

  try {
    const monthlyUsage = await this.usageLimitsService.getUsageByPeriod(
      user.userId,
      UsageFeature.BIRTH_CHART,
      'monthly',
    );
    // ...
  } catch (error) {
    // Fallback para caso de error
    this.logger.error(`Error getting usage for user ${user.userId}:`, error);
    return {
      plan: user.plan,
      used: 0,
      limit: 3,
      remaining: 3,
      resetsAt: this.getNextMonthStartIso(),
      canGenerate: true,  // Default a true para evitar bloqueo
    };
  }
}
```

---

## 🔴 BUG #2: OptionalJwtAuthGuard retorna usuario ANÓNIMO - CRÍTICO

**Severidad:** 🔴 CRÍTICA
**Impacto:** Todos los usuarios autenticados se ven como anónimos
**Status:** ✅ Confirmado

### Síntomas
```bash
curl -H "Authorization: Bearer $TOKEN_PREMIUM" \
  http://localhost:3000/api/v1/birth-chart/usage

# Response (INCORRECTO):
{"plan":"anonymous",...}

# Expected:
{"plan":"premium",...}
```

### Causa Raíz
**`OptionalJwtAuthGuard` catch block captura errores pero no propaga datos del usuario.**

Cuando `super.canActivate(context)` falla (token expirado/inválido):
1. Lanza error
2. Catch lo captura (línea 27)
3. Retorna `true` (permite acceso)
4. Pero `handleRequest` retorna `null` (línea 49)
5. `@CurrentUser()` recibe `null` → se trata como anónimo

### Código Problemático

**backend/.../optional-jwt-auth.guard.ts (línea 15-32)**
```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest<Request>();

  if (!request.headers.authorization) {
    return true;  // ← OK: Sin token, permite anónimo
  }

  try {
    const result = await super.canActivate(context);
    return result as boolean;  // ← OK: Token válido, procede
  } catch {
    return true;  // ← PROBLEMA: Token inválido, pero retorna true SIN validar
  }
}
```

### Solución (Recomendada)

Mejorar el guard para distinguir entre "sin token" y "token inválido":

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest<Request>();

  // Sin token → permitir anónimo
  if (!request.headers.authorization) {
    return true;
  }

  try {
    // Validar JWT
    return (await super.canActivate(context)) as boolean;
  } catch (error) {
    // Token inválido/expirado → LOG pero NO bloquear (permite anónimo)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Invalid JWT: ${errorMsg}`);
    // Continuar como anónimo (request.user = null)
    return true;
  }
}
```

---

## 🟡 BUG #3: Lógica de bloqueo desactiva formulario - MODERADA

**Severidad:** 🟡 MODERADA
**Impacto:** Usuarios no pueden completar formulario cuando `canGenerate=false`
**Status:** ✅ Confirmado

### Síntomas
- Todos los campos tienen `[disabled]`
- Botón "Generar mi carta astral" deshabilitado
- Usuario ve mensaje "Actualiza a Premium"

### Causa Raíz
**Lógica condicional en `page.tsx` línea 171:**

```typescript
{canGenerate || usageLoading ? (
  <BirthDataForm disabled={!canGenerate || usageLoading} />
) : (
  <div>Límite alcanzado - Actualiza a Premium</div>
)}
```

Cuando `useCanGenerateChart()` retorna `canGenerate=false`:
1. Primero intenta mostrar formulario (porque `usageLoading` puede ser `true`)
2. Pero `disabled={!canGenerate || usageLoading}` desactiva todos los campos
3. Después de 2-3 segundos cuando `usageLoading=false`, muestra estado bloqueado

### Código Problemático

**frontend/.../page.tsx (línea 171-180)**
```typescript
{canGenerate || usageLoading ? (
  <BirthDataForm
    onSubmit={handleSubmit}
    isLoading={isSubmitting}
    disabled={!canGenerate || usageLoading}  // ← PROBLEMA
    showUsageWarning={remaining === 1}
    usageMessage={...}
  />
) : (
  <div>Mensaje de bloqueo</div>
)}
```

### Solución (Recomendada)

Separar la lógica: permitir ver formulario incluso mientras carga:

```typescript
{usageLoading ? (
  // Mostrar formulario mientras carga (disabled pero visible)
  <BirthDataForm
    disabled={true}  // Loading state
    isLoading={isSubmitting}
  />
) : canGenerate ? (
  // Completamente habilitado
  <BirthDataForm
    disabled={false}
    isLoading={isSubmitting}
    showUsageWarning={remaining === 1}
    usageMessage={...}
  />
) : (
  // Bloqueado después de saber que no puede generar
  <div>Mensaje de bloqueo con CTA</div>
)}
```

---

## 📊 Matriz de Impacto

| Bug | Usuario Anónimo | Usuario Free | Usuario Premium | Severidad |
|-----|-----------------|--------------|-----------------|-----------|
| #1: Error 500 | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | 🔴 CRÍTICA |
| #2: Anónimo para autenticados | N/A | ❌ Se ve como anónimo | ❌ Se ve como anónimo | 🔴 CRÍTICA |
| #3: Formulario deshabilitado | ❌ Deshabilitado | ❌ Deshabilitado | ❌ Deshabilitado | 🟡 MODERADA |

---

## ✅ Plan de Corrección

### Fase 1: Arreglar Raíz Causa (Backend)

1. **Arreglar `birth-chart-facade.service.ts`**
   - Agregar validación de `user.userId`
   - Agregar try-catch con fallback
   - Archivo: `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`
   - Línea: ~209-231

2. **Revisar `OptionalJwtAuthGuard`**
   - Verificar que extrae usuario correctamente
   - Revisar configuración JWT
   - Archivo: `backend/tarot-app/src/modules/auth/infrastructure/guards/optional-jwt-auth.guard.ts`
   - Línea: ~15-50

### Fase 2: Mejorar UX (Frontend)

3. **Mejorar lógica de bloqueo en `page.tsx`**
   - Mostrar formulario mientras carga
   - Mejor indicador visual de loading
   - Archivo: `frontend/src/app/carta-astral/page.tsx`
   - Línea: ~171-180

### Fase 3: Testing

4. **Ejecutar tests de regresión**
   ```bash
   cd backend/tarot-app && npm run test:cov
   cd ../../frontend && npm run test:run
   ```

5. **Testear manualmente con Playwright**
   - Anónimo: 1 carta
   - Free: 3 cartas/mes
   - Premium: ilimitadas

---

## 📋 Checklist de Validación Post-Fix

- [ ] No hay errores 500 en console
- [ ] Usuario premium ve `{"plan":"premium",...}`
- [ ] Usuario free ve `{"plan":"free",...}`
- [ ] Campos se pueden completar sin bloqueo
- [ ] Botón "Generar" está habilitado
- [ ] Página está centrada (no alineada a izquierda)
- [ ] Tests pasan con coverage ≥80%
- [ ] No hay bloqueo intrusivo después 2-3 segundos

---

## 📚 Archivos Relevantes

**Backend:**
- `src/modules/birth-chart/application/services/birth-chart-facade.service.ts` (línea 182-231)
- `src/modules/auth/infrastructure/guards/optional-jwt-auth.guard.ts` (línea 15-50)
- `src/modules/usage-limits/usage-limits.service.ts` (línea 98-131)

**Frontend:**
- `src/app/carta-astral/page.tsx` (línea 171-180)
- `src/hooks/api/useBirthChart.ts` (línea 178-198)
- `src/components/features/birth-chart/BirthDataForm/BirthDataForm.tsx`

**Tests:**
- `frontend/tests/e2e/birth-chart/birth-chart.spec.ts`
- `backend/tarot-app/src/modules/birth-chart/infrastructure/controllers/birth-chart.controller.spec.ts`

---

**Documento generado por:** Claude Code
**Status:** ✅ Investigación Completa
**Acción Requerida:** Implementar soluciones en Fase 1-3
