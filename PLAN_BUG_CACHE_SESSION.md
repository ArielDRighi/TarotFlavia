# Plan de Solución - Bugs de Caché y Sesión

**Fecha:** 14 Enero 2026
**Rama:** `fix/cache-session-bugs`

---

## 🎯 Resumen Ejecutivo

**3 bugs identificados con causa raíz encontrada:**

| Bug    | Problema                          | Causa Raíz                             | Solución                                       | Prioridad | Tiempo |
| ------ | --------------------------------- | -------------------------------------- | ---------------------------------------------- | --------- | ------ |
| **#1** | Lectura eliminada sigue visible   | No hay optimistic update               | Implementar `onMutate` en `useDeleteReading`   | MEDIA     | 30 min |
| **#2** | Error 500 al cambiar PREMIUM→FREE | `logout()` no limpia React Query cache | Agregar `queryClient.clear()`                  | 🔴 ALTA   | 15 min |
| **#3** | Historial vacío en usuario nuevo  | `staleTime` 5 min impide refetch       | Configurar `staleTime: 30s` en `useMyReadings` | 🟠 MEDIA  | 10 min |

**Impacto:**

- Bug #2 es **bloqueante** - afecta cambio de usuarios
- Bug #3 afecta **UX de todos los usuarios** (no solo nuevos)
- Bug #1 afecta **percepción de calidad**

**Plan de acción:** Implementar en orden #2 → #3 → #1 (~1.5 horas total)

---

## 📋 Problemas Identificados

### Problema 1: Lectura eliminada sigue visible en UI (CONFIRMADO CON PLAYWRIGHT) ⚠️

**Descripción:** Al hacer click en eliminar una lectura en el historial, la lectura se elimina en el backend pero sigue siendo visible en la UI hasta recargar la página.

**Síntomas (Playwright investigation):**

1. Usuario PREMIUM con 10+ lecturas (página 1 de 2)
2. Click "Eliminar lectura" en primera lectura → Confirmar
3. Backend: DELETE /readings/53 → 200 OK ✅
4. Backend: Refetch automático GET /readings?page=1&limit=10 → 200 OK ✅
5. **UI NO se actualiza** - La lectura sigue visible ❌
6. Toast "Lectura eliminada" aparece pero UI no cambia

**Comparación con usuario nuevo:**

- Usuario NUEVO (1 lectura): Eliminación → UI muestra empty state ✅ FUNCIONA
- Usuario PREMIUM (10+ lecturas paginadas): Eliminación → UI NO actualiza ❌ BUG

**Causa Raíz (CONFIRMADA con DB query):** ⚠️ **BACKEND BUG - GET readings no filtra eliminadas**

**Investigación completa:**

1. **Playwright + Network:**
   - DELETE /readings/53 → 200 OK ✅
   - GET /readings?page=1&limit=10 → Retorna lectura ID 53 ❌
   - Frontend muestra lo que backend envía (correcto)

2. **Database query directa:**

   ```sql
   SELECT id, deletedAt FROM tarot_reading WHERE id = 53
   -- Result: id=53, deletedAt='2026-01-15 00:09:50' ✅
   ```

   **El soft-delete SÍ funciona** - la lectura tiene `deletedAt` seteado

3. **Problema real:**
   - El endpoint GET /readings **NO filtra por deletedAt IS NULL**
   - Retorna TODAS las lecturas incluidas las eliminadas
   - Por eso el usuario PREMIUM ve la lectura "eliminada"
   - El usuario nuevo "funcionó" porque tenía 1 sola lectura → al eliminarla el array quedó vacío

**Conclusión:**

- ✅ DELETE funciona correctamente (setea deletedAt)
- ❌ GET /readings NO excluye readings eliminadas
- El bug está en el **repository o query de GET readings**

**Archivos afectados:**

**BACKEND (CAUSA RAÍZ):**

- `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts` - Método `findByUser()` o similar NO filtra por `deletedAt IS NULL`
- `backend/tarot-app/src/modules/tarot/readings/application/use-cases/get-my-readings.use-case.ts` - Query debe excluir soft-deleted
- **FIX:** Agregar `.where('reading.deletedAt IS NULL')` o usar `withDeleted: false` en TypeORM query

**FRONTEND (Funcionando correctamente):**

- `frontend/src/hooks/api/useReadings.ts` - Invalidación funciona ✅
- `frontend/src/components/features/readings/ReadingsHistory.tsx` - Muestra lo que el backend envía ✅

### Problema 2: Caché de sesión entre usuarios con diferentes planes

**Descripción:** Al cambiar de usuario con plan PREMIUM a usuario con plan FREE, el sistema intenta acceder a funcionalidades de PREMIUM (como categorías) que no están disponibles para FREE, resultando en error 500.

**Causa Raíz (Análisis del código):**

- `authStore.ts` (línea 100-114) en `logout()` solo limpia localStorage y el estado del store
- **NO limpia el caché de React Query**
- Los queries de categorías, readings, capabilities del usuario PREMIUM quedan en caché
- Al hacer login como FREE, el frontend intenta usar esos queries cacheados
- FREE user NO tiene permiso para categorías → error 500 es esperado del backend
- **El problema es que FREE NO debería estar intentando acceder a categorías en primer lugar**

**Archivos afectados:**

- `frontend/src/stores/authStore.ts` - función `logout()` no limpia React Query cache
- Todas las queries de React Query quedan "sucias" con datos del usuario anterior

### Problema 3 (NUEVO): Historial vacío para usuarios nuevos - CONFIGURACIÓN DE CACHE

**Descripción:** Al crear la primera lectura de un usuario nuevo, no aparece en el historial inmediatamente. Tampoco aparece después de recargar la página. Solo aparece después de ~5-10 minutos.

**Síntomas observados (Playwright investigation):**

1. Usuario nuevo crea lectura → Éxito, muestra interpretación
2. Usuario navega a /historial → Muestra "Tu destino aún no ha sido revelado"
3. Usuario recarga página inmediatamente → SIGUE vacío
4. Usuario recarga página después de ~5 minutos (staleTime) → ✅ Aparece la lectura

**Causa Raíz (Análisis del código):**

**PROBLEMA DE CONFIGURACIÓN DE CACHE:**

- `frontend/src/lib/providers/react-query-provider.tsx` (línea 10):
  ```typescript
  const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
  ```
- Esta configuración global afecta a TODOS los queries del sistema
- `useMyReadings()` en `useReadings.ts` (línea 107-111) **NO tiene `staleTime` específico**, hereda los 5 minutos globales
- Cuando se crea la primera lectura, `invalidateQueries` marca el query como "invalid"
- PERO el query sigue estando "fresh" porque no han pasado 5 minutos desde que se ejecutó
- React Query **NO refetch automáticamente queries "fresh" aunque estén invalidados**
- Solo después de que expire el `staleTime` (5 min) el query se marca como "stale" y refetch

**Secuencia del problema:**

1. Usuario nuevo carga /historial → `useMyReadings()` se ejecuta → Retorna `[]` (vacío) → Query queda "fresh" por 5 minutos
2. Usuario crea lectura → `invalidateQueries()` se ejecuta → Query marcado como "invalid" PERO sigue "fresh"
3. Usuario vuelve a /historial o recarga → Query "fresh" + "invalid" → React Query usa caché (datos viejos vacíos)
4. Después de 5 minutos → Query "stale" → Próxima navegación refetch → ✅ Datos actualizados

**Por qué NO afecta a usuarios existentes:**

- Usuarios FREE/PREMIUM existentes ya tienen historial con datos
- El `staleTime` de 5 minutos es razonable para datos que cambian poco
- Pero para un usuario NUEVO, el primer query retorna `[]` y queda cacheado por 5 minutos

**Archivos afectados:**

- `frontend/src/lib/providers/react-query-provider.tsx` - `staleTime` global muy alto
- `frontend/src/hooks/api/useReadings.ts` - `useMyReadings()` no override `staleTime`
- `frontend/src/hooks/api/useReadings.ts` - `useCreateReading()` usa `invalidateQueries` pero no es suficiente con query "fresh"

---

## 🎯 Solución Propuesta

### Prioridad de Tareas

#### 🔴 ALTA PRIORIDAD - Problema 2 (Caché entre usuarios)

**Impacto:** Bloqueante, afecta cambio de usuarios

**FRONTEND: BUG-F-001 - Limpiar caché de React Query al hacer logout** ⭐ CAUSA RAÍZ

- Modificar `authStore.ts` función `logout()` para limpiar React Query cache
- Agregar `queryClient.clear()` o `queryClient.removeQueries()`
- Esto evitará que queries de PREMIUM (categorías, etc.) se usen con FREE user
- Agregar tests para verificar limpieza de caché

**NOTA:** El error 500 en categorías para FREE es **correcto** - FREE users no tienen permiso para categorías. El problema es que el frontend no debería estar intentando acceder a categorías con un usuario FREE.

#### 🔴 ALTA PRIORIDAD - Problema 1 (Lecturas eliminadas aparecen) - BACKEND BUG ⚠️

**Impacto:** CRÍTICO - Lecturas eliminadas se muestran en el historial

**BACKEND: BUG-B-002 - GET readings no filtra por deletedAt** ⭐ CAUSA RAÍZ CONFIRMADA

**Hallazgo de DB:**

```sql
-- Lectura ID 53 eliminada con Playwright:
SELECT id, deletedAt FROM tarot_reading WHERE id = 53;
-- Result: id=53, deletedAt='2026-01-15 00:09:50' ✅ Soft-delete SÍ funciona

-- Pero GET /readings la retorna:
GET /api/v1/readings?page=1&limit=10
-- Result: { data: [{ id: 53, ... }, ...] } ❌ No filtra eliminadas
```

**FIX requerido:**

- Archivo: `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts`
- Método: `findByUser()` o `findPaginated()` (el que usa GET /readings)
- Agregar filtro: `.where('reading.deletedAt IS NULL')` o configurar `withDeleted: false`
- Verificar que TODOS los queries de lectura excluyan soft-deleted

**Tests:**

- Agregar e2e: DELETE reading → GET readings → Verificar que NO aparece en lista
- Agregar e2e: DELETE reading → GET /readings/:id → Verificar retorna 404

**OPCIONAL FRONTEND: BUG-F-002 - Optimistic updates**

- Solo para mejorar UX (NO prioritario hasta fix de backend)
- El backend debe funcionar correctamente primero

#### 🟠 MEDIA PRIORIDAD - Problema 3 (Historial vacío nuevo usuario) - PROBLEMA DE CONFIGURACIÓN ⚠️

**Impacto:** Afecta TODOS los usuarios, especialmente visible en usuarios nuevos
**Causa:** StaleTime global de 5 minutos hace que queries "fresh" no refetch aunque estén invalidados

**FRONTEND: BUG-F-003 - Configurar staleTime adecuado para readings** ⭐ SOLUCIÓN

- Agregar `staleTime: 30 * 1000` (30 segundos) a `useMyReadings()`
- Esto override el staleTime global de 5 minutos
- Mejora UX para TODOS los usuarios (cambios se ven en ≤30s)
- Alternativa: Usar `refetchQueries` en lugar de `invalidateQueries` en `useCreateReading`
- **Recomendado:** Implementar staleTime específico (más predecible)
- Agregar delay si es necesario
- Agregar tests

---

## 📝 Tareas Detalladas

### BACKEND

#### BUG-B-001: Investigar error 500 en categorías para FREE user

**Archivos:**

- `backend/tarot~~Investigar error 500 en categorías para FREE user~~ (NO ES BUG)
  **NOTA:** Error 500 es **esperado y correcto**. FREE users no tienen permiso para acceder a categorías. El problema es del frontend que no limpia el caché.

**Descartado:** No hay trabajo de backend aquí. El backend está funcionando correctamente al retornar error cuando FREE intenta acceder a recursos PREMIUM.or 500 al recargar con lectura eliminada
**Archivos:**

- `backend/tarot-app/src/modules/tarot/readings/readings.controller.ts`
- Endpoint GET /readings/:id

**Pasos:**

1. Reproducir: Eliminar lectura → Recargar página
2. Identificar qué endpoint falla
3. Verificar manejo de soft-deleted readings
4. Retornar 404 si reading está eliminada
5. Agregar test

### FRONTEND

#### BUG-F-001: Limpiar caché React Query en logout

**Archivos:**

- `frontend/src/stores/authStore.ts`

**Implementación:**

```typescript
// En authStore.ts
import { useQueryClient } from '@tanstack/react-query';

// En la función logout:
logout: () => {
  // Get queryClient instance
  const queryClient = useQueryClient();

  // Clear tokens from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Clear ALL React Query cache
  queryClient.clear();

  // Clear user state
  set({
    user: null,
    isAuthenticated: false,
  });
},
```

**Tests:**

```typescript
// authStore.test.ts
it("should clear React Query cache on logout", () => {
  const queryClient = new QueryClient();
  const clearSpy = vi.spyOn(queryClient, "clear");

  // Setup: user logged in with cached queries
  // Act: logout
  authStore.logout();

  // Assert
  expect(clearSpy).toHaveBeenCalled();
});
```

#### BUG-F-002: Optimistic update al eliminar lectura

**Archivos:**

- `frontend/src/hooks/api/useReadings.ts`

**Implementación:**

```typescript
export function useDeleteReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteReading(id),
    // Optimistic update BEFORE API call
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: readingQueryKeys.all });

      // Snapshot previous value
      const previousReadings = queryClient.getQueryData(readingQueryKeys.list({}));

      // Optimistically remove from cache
      queryClient.setQueryData(readingQueryKeys.list({}), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((r: any) => r.id !== deletedId),
        };
      });

      return { previousReadings };
    },
    // On error: rollback
    onError: (err, deletedId, context) => {
      if (context?.previousReadings) {
        queryClient.setQueryData(readingQueryKeys.list({}), context.previousReadings);
      }
      toast.error("Error al eliminar lectura");
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
    },
    onSuccess: () => {
      toast.success("Lectura eliminada");
    },
  });
}
```

#### BUG-F-003: Configurar staleTime adecuado para readings - SOLUCIÓN AL PROBLEMA 3 ⭐

**Problema:** `staleTime` global de 5 minutos hace que queries "fresh" NO refetch aunque estén invalidados. Esto causa que usuarios nuevos no vean su primera lectura hasta que expire el staleTime.

**Archivos:**

- `frontend/src/hooks/api/useReadings.ts` - Agregar `staleTime` específico a `useMyReadings`
- `frontend/src/hooks/api/useReadings.ts` - Mejorar invalidación en `useCreateReading`

**Solución 1: StaleTime más corto para readings (RECOMENDADO):**

```typescript
/**
 * Hook to fetch paginated list of user's readings
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 */
export function useMyReadings(page: number, limit: number) {
  return useQuery({
    queryKey: readingQueryKeys.list(page, limit),
    queryFn: () => getMyReadings(page, limit),
    staleTime: 30 * 1000, // 30 segundos - readings pueden cambiar frecuentemente
    // Esto override el staleTime global de 5 minutos
  });
}
```

**Justificación:**

- Readings son datos que el usuario modifica activamente (crea, elimina, regenera)
- 30 segundos es suficiente para evitar refetch innecesarios pero permite actualización rápida
- Otros datos estáticos (categorías, spreads) mantienen `staleTime: Infinity`
- Queries de admin/métricas mantienen su `staleTime` específico

**Solución 2: Refetch forzado después de crear lectura (ALTERNATIVA):**

```typescript
export function useCreateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReadingDto) => createReading(data),
    onSuccess: async (newReading) => {
      // FORZAR refetch inmediato ignorando staleTime
      await queryClient.refetchQueries({
        queryKey: readingQueryKeys.all,
        type: "active", // Solo queries actualmente montadas
      });

      // También invalidar capabilities
      await invalidateUserData(queryClient);

      toast.success("Lectura creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear lectura");
    },
  });
}
```

**Recomendación:** Implementar **Solución 1** (staleTime 30s) porque:

- ✅ Soluciona el problema de usuarios nuevos
- ✅ Mejora la experiencia para TODOS los usuarios (cambios se ven más rápido)
- ✅ Más predecible que forzar refetch
- ✅ Sigue aprovechGET readings no filtra eliminadas) - PRIMERO ⭐⭐⭐
  - **CRÍTICO:** Lecturas soft-deleted se muestran en lista
  - Causa confirmada con DB query: `deletedAt` se setea correctamente ✅
  - Pero GET /readings NO filtra por `deletedAt IS NULL` ❌
  - FIX: Agregar `.where('reading.deletedAt IS NULL')` en query de readings
  - Archivo: `typeorm-reading.repository.ts` método `findByUser()` o similar
  - **Tiempo estimado:** 15-20 minutos (fix simple)s sin delay

4. Verificar que NO hace refetch cada render (usar React Query Devtools)

---

## ✅ Orden de Implementación

### FASE 1: CRÍTICO (Bugs bloqueantes)

1. **BUG-B-002** (Soft-delete no funciona en backend) - PRIMERO ⭐⭐⭐
   - **CRÍTICO:** La eliminación NO funciona - datos no se eliminan
   - Problema confirmado con Playwright + API testing
   - DELETE retorna 200 OK pero GET retorna la lectura "eliminada"
   - Investigar repository y use case de soft-delete
   - **Tiempo estimado:** 30-45 minutos

2. **BUG-F-001** (Limpiar caché en logout) - SEGUNDO ⭐
   - Crítico para cambio de usuarios (problema 2)
   - Fácil de implementar (1 línea de código)
   - Previene errores 500 al cambiar PREMIUM→FREE
   - **Tiempo estimado:** 15 minutos

### FASE 2: IMPORTANTE (UX y configuración)

3. **BUG-F-003** (StaleTime adecuado para readings) - TERCERO ⭐
   - Soluciona problema 3 (usuarios nuevos)
   - Mejora UX para TODOS los usuarios
   - Fácil de implementar (agregar 1 línea)
   - **Tiempo estimado:** 10 minutos

### FASE 3: OPCIONAL (Mejoras de UX)

4. **BUG-F-002** (Optimistic updates para eliminación) - CUARTO
   - Solo mejora UX visual (NO prioritario hasta que BUG-B-002 esté resuelto)
   - Implementación más compleja
   - **Tiempo estimado:** 30 minutos

**Total estimado:** ~2 horas para solucionar los 3 problemas críticos (bugs 1, 2 y 3)

- Mejora UX para TODOS los usuarios
- Fácil de implementar (agregar 1 línea)
- **Tiempo estimado:** 10 minutos

3. **BUG-F-002** (Optimistic update eliminación) - TERCERO
   - Mejora UX significativamente (feedback inmediato)
   - Soluciona problema 1 (visibilidad de eliminación)
   - Implementación más compleja (optimistic updates)
   - **Tiempo estimado:** 30 minutos

### FASE 3: BACKEND (Opcional - manejo de errores)

4. **BUG-B-002** (Error 500 al recargar con lectura eliminada) - CUARTO
   - Investigar stacktrace y endpoint GET /readings/:id
   - Retornar 404 en lugar de 500
   - **Tiempo estimado:** 20 minutos

**Total estimado:** ~1.5 horas para solucionar los 3 problemas principales

---

## 🧪 Plan de Testing

### Tests Unitarios

- `authStore.test.ts` - Verificar limpieza de caché en logout
- `useReadings.test.ts` - Verificar optimistic updates

### Tests E2E (Playwright)

1. **Test: Cambio de usuario limpia caché**
   - Login como PREMIUM → Crear lectura con categoría → Logout
   - Login como FREE → Verificar NO ve data de PREMIUM
   - Intentar lectura FREE → NO debe intentar acceder a categorías
   - Verificar que UI solo muestra opciones disponibles para FREE

2. **Test: Eliminación inmediata en UI**
   - Crear lectura → Ir a historial
   - Eliminar lectura → Verificar desaparece inmediatamente
   - NO recargar → Verificar sigue sin aparecer

3. **Test: Primera lectura de nuevo usuario (BUG-F-003)** ⭐
   - Registrar nuevo usuario
   - Crear primera lectura → Verificar éxito
   - Navegar a /historial inmediatamente → ✅ Debe mostrar la lectura
   - Verificar NO muestra "Tu destino aún no ha sido revelado"
   - Crear segunda lectura → Verificar ambas aparecen
   - **Tiempo máximo de aparición:** <30 segundos (staleTime configurado)

---

## 📊 Checklist de Validación

### Para cada bug corregido:

- [ ] Test que reproduce el bug (falla antes del fix)
- [ ] Implementación del fix
- [ ] Test pasa después del fix
- [ ] Tests de regresión
- [ ] Validación manual en localhost
- [ ] Lint y type-check sin errores
- [ ] Build exitoso
- [ ] Documentación actualizada

### Validación Final:

- [ ] Todos los tests pasan
- [ ] Coverage >= 80%
- [ ] E2E tests pasan con Playwright
- [ ] App funciona en localhost:3001
- [ ] Probado manualmente cada escenario

---

## 🚀 Siguiente Paso

Comenzar con **BUG-F-001**: Limpiar caché de React Query en logout, ya que es la causa raíz del problema más crítico y es rápido de implementar.
