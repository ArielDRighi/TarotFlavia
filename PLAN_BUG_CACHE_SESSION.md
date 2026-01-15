# Plan de Solución - Bugs de Caché y Sesión

**Fecha:** 14 Enero 2026
**Rama:** `fix/cache-session-bugs`

---

## 🎯 Resumen Ejecutivo

**3 bugs identificados con causa raíz confirmada:**

| Bug    | Problema                                  | Causa Raíz                             | Solución                                                     | Prioridad | Tiempo |
| ------ | ----------------------------------------- | -------------------------------------- | ------------------------------------------------------------ | --------- | ------ |
| **#1** | Lectura eliminada sigue visible (PREMIUM) | `findById()` no filtra `deletedAt`     | Agregar `where: { id, deletedAt: IsNull() }` en `findById()` | 🔴 ALTA   | 15 min |
| **#2** | Error 500 al cambiar PREMIUM→FREE         | `logout()` no limpia React Query cache | Agregar `queryClient.clear()`                                | 🔴 ALTA   | 15 min |
| **#3** | Historial vacío + refetch lento           | `staleTime` 5 min impide refetch       | Configurar `staleTime: 30s` en `useMyReadings`               | 🔴 ALTA   | 10 min |

**Nota sobre Bug #1:**

- ✅ Backend filtra correctamente en `findByUserId()` (línea 86): `.andWhere('reading.deletedAt IS NULL')`
- ❌ Backend NO filtra en `findById()` (líneas 32-39): Solo usa `where: { id }`
- 🎯 Queries individuales cacheadas retornan lecturas eliminadas
- **Por qué usuario nuevo funciona pero PREMIUM no:** Usuario nuevo solo cachea lista (sin queries individuales)

**Impacto:**

- Bug #2 es **bloqueante** - afecta cambio de usuarios
- Bug #1 es **crítico** - lecturas eliminadas siguen visibles para usuarios con múltiples lecturas
- Bug #3 es **crítico** - afecta UX de todos los usuarios (historial vacío + cambios tardan 5 min)

**Plan de acción:** BUG-F-001 (15 min) → BUG-B-002 (15 min) → BUG-F-003 (10 min) → **Total: 40 min críticos**

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

**Conclusión (ACTUALIZADA después de revisión PROFUNDA de código):**

- ✅ DELETE funciona correctamente (setea deletedAt)
- ⚠️ **PROBLEMA ENCONTRADO:** GET /readings **SÍ** filtra en `findByUserId()` (línea 86), **PERO NO** en `findById()` (líneas 32-39)

  ```typescript
  // ✅ findByUserId() - TIENE filtro (línea 86)
  .andWhere('reading.deletedAt IS NULL')

  // ❌ findById() - NO TIENE filtro (líneas 32-39)
  async findById(id: number) {
    return this.readingRepo.findOne({
      where: { id },  // ❌ No filtra deletedAt
      relations,
    });
  }
  ```

- 🎯 **Causa raíz REAL es DOBLE:**
  1. **BACKEND:** `findById()` retorna lecturas eliminadas (usado por queries individuales cacheadas)
  2. **FRONTEND:** `staleTime` 5 min impide refetch de query invalidado

**Por qué funciona para usuario NUEVO pero NO para PREMIUM:**

- **Usuario nuevo (1 lectura):** Solo tiene query de lista cacheado → Al eliminar queda `[]` → UI muestra empty state ✅
- **Usuario PREMIUM (10+ lecturas):** Tiene queries de lista Y queries individuales cacheadas → `findById()` sigue retornando lectura eliminada → UI muestra lectura "fantasma" ❌

**Archivos afectados:**

**BACKEND (BUG REAL - REQUIERE FIX):**

- `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts` - `findById()` NO filtra `deletedAt` ⚠️

**FRONTEND (PROBLEMA DE CONFIGURACIÓN):**

- `frontend/src/lib/providers/react-query-provider.tsx` - `staleTime: 5 * 60 * 1000` global muy alto
- `frontend/src/hooks/api/useReadings.ts` - `useMyReadings()` necesita override con `staleTime: 30s`

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

#### 🔴 MÁXIMA PRIORIDAD - Problema 2 (Caché entre usuarios)

**Impacto:** Bloqueante, afecta cambio de usuarios

**FRONTEND: BUG-F-001 - Limpiar caché de React Query al hacer logout** ⭐ IMPLEMENTAR PRIMERO

- Modificar `authStore.ts` función `logout()` para limpiar React Query cache
- Agregar `queryClient.clear()` antes de `set({ user: null })`
- Esto evitará que queries de PREMIUM (categorías, etc.) se usen con FREE user
- Agregar tests para verificar limpieza de caché
- **Tiempo:** 15 minutos

**NOTA:** El error 500 en categorías para FREE es **correcto** - FREE users no tienen permiso para categorías. El problema es que el frontend no debería estar intentando acceder a categorías con un usuario FREE.

#### 🔴 ALTA PRIORIDAD - Problema 1 (Lecturas eliminadas visibles) - BUG EN BACKEND ⚠️

**Impacto:** CRÍTICO - Usuario PREMIUM ve lecturas eliminadas (usuario nuevo NO)

**BACKEND: BUG-B-002 - findById() no filtra lecturas eliminadas** ⭐ IMPLEMENTAR SEGUNDO

**Hallazgo clave:**

```typescript
// ✅ findByUserId() línea 86 - TIENE filtro
.andWhere('reading.deletedAt IS NULL')

// ❌ findById() líneas 32-39 - NO TIENE filtro
async findById(id: number) {
  return this.readingRepo.findOne({
    where: { id },  // ❌ Problema: No filtra deletedAt
    relations,
  });
}
```

**Por qué esto causa el bug:**

1. Usuario PREMIUM tiene múltiples lecturas → Frontend cachea queries de lista Y queries individuales
2. Usuario elimina lectura ID 53 → Backend setea `deletedAt` ✅
3. Frontend invalida `readingQueryKeys.all` → Incluye queries de lista Y queries individuales
4. Query de lista (`findByUserId`) filtra correctamente → Lista actualizada ✅
5. **Pero queries individuales** (`findById`) NO filtran → Retornan lectura eliminada ❌
6. React Query mantiene el dato individual en caché (staleTime 5 min) → UI muestra lectura "fantasma"

**Usuario nuevo NO tiene este problema porque:**

- Solo tiene 1 lectura → Al eliminarla, lista queda `[]`
- Probablemente NO tiene queries individuales cacheadas
- Empty state se muestra correctamente

**FIX requerido:**

- Archivo: `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts`
- Método: `findById()` (líneas 32-39)
- Agregar filtro: `where: { id, deletedAt: IsNull() }`
- **Tiempo:** 15 minutos

#### 🔴 ALTA PRIORIDAD - Problema 3 (Historial vacío + refetch lento) ⚠️

**Impacto:** CRÍTICO - Afecta UX de todos los usuarios

**FRONTEND: BUG-F-003 - Configurar staleTime adecuado para readings** ⭐ IMPLEMENTAR TERCERO

**Hallazgo clave:**

```typescript
// Backend línea 86 - YA FILTRA CORRECTAMENTE:
.andWhere('reading.deletedAt IS NULL')  // ✅ Filtro existe

// Problema real: staleTime 5 min en frontend
const STALE_TIME_MS = 5 * 60 * 1000;  // ❌ Muy alto para readings
```

## 📝 Tareas Detalladas

### BACKEND

#### BUG-B-002: findById() no filtra lecturas eliminadas ⭐ CRÍTICO

**Problema confirmado:**

```typescript
// ❌ findById() líneas 32-39 - NO FILTRA deletedAt
async findById(
  id: number,
  relations: string[] = ['deck', 'user', 'cards', 'interpretations'],
): Promise<TarotReading | null> {
  return this.readingRepo.findOne({
    where: { id },  // ❌ No filtra deletedAt
    relations,
  });
}

// ✅ findByUserId() línea 86 - SÍ FILTRA
.andWhere('reading.deletedAt IS NULL')
```

**Por qué esto causa Bug #1:**

1. Usuario PREMIUM navega por su historial → React Query cachea queries de lista Y queries individuales (por si abre detalles)
2. Usuario elimina lectura → `findByUserId()` filtra correctamente, pero queries individuales cacheadas siguen válidas
3. Frontend invalida queries, pero `findById()` sigue retornando la lectura eliminada
4. Con `staleTime: 5min`, React Query mantiene esos datos individuales obsoletos

**FIX:**

- Archivo: `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts`
- Método: `findById()` (líneas 32-39)
- Agregar filtro en `where` clause

**Implementación:**

```typescript
async findById(
  id: number,
  relations: string[] = ['deck', 'user', 'cards', 'interpretations'],
): Promise<TarotReading | null> {
  return this.readingRepo.findOne({
    where: {
      id,
      deletedAt: IsNull(),  // ✅ Agregar filtro
    },
    relations,
  });
}
```

**Tests a agregar:**

```typescript
// typeorm-reading.repository.spec.ts
it('should not return soft-deleted reading by id', async () => {
  const reading = await repository.create({ userId: 1, ... });
  await repository.softDelete(reading.id);

  const result = await repository.findById(reading.id);

  expect(result).toBeNull();  // No debe retornar lectura eliminada
});
```

**Tiempo estimado:** 15 minutos

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

#### BUG-B-001: ~~Investigar error 500 en categorías para FREE user~~ (NO ES BUG)

**NOTA:** Error 500 es **esperado y correcto**. FREE users no tienen permiso para acceder a categorías. El problema es del frontend que no limpia el caché.

**Descartado:** No hay trabajo de backend aquí. El backend está funcionando correctamente al retornar error cuando FREE intenta acceder a recursos PREMIUM.

---

#### BUG-B-002: GET /readings no filtra lecturas eliminadas ⭐ PRIORIDAD MÁXIMA

**Problema confirmado:**

```sql
-- Lectura eliminada tiene deletedAt seteado:
SELECT id, deletedAt FROM tarot_reading WHERE id = 53;
-- Result: id=53, deletedAt='2026-01-15 00:09:50' ✅

-- Pero GET /readings la retorna:
GET /api/v1/readings?page=1&limit=10
-- Result: { data: [{ id: 53, ... }, ...] } ❌
```

**Archivos a modificar:**

- `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts`
- Método: `findByUser()` o `findPaginated()` (el que usa el endpoint GET /readings)

**Implementación:**

1. Buscar el método que lista readings del usuario (probablemente `findByUser` o similar)
2. Agregar filtro en el query builder:

   ```typescript
   .where('reading.deletedAt IS NULL')
   ```

   O si usa `find()`:

   ```typescript
   where: {
     deletedAt: IsNull();
   }
   ```

3. Verificar que GET /readings/:id (individual) también excluya eliminadas

**Tests a agregar:**

```typescript
// readings.e2e-spec.ts
it("should not return soft-deleted readings in list", async () => {
  // Crear lectura
  const reading = await createReading();

  // Eliminar
  await request(app.getHttpServer()).delete(`/api/v1/readings/${reading.id}`).expect(200);

  // GET list NO debe incluirla
  const response = await request(app.getHttpServer()).get("/api/v1/readings").expect(200);

  expect(response.body.data.find((r) => r.id === reading.id)).toBeUndefined();
});
```

**Tiempo estimado:** 15-20 minutos

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

#### BUG-F-002: Optimistic update al eliminar lectura (OPCIONAL - Mejora de UX)

**NOTA:** Esta tarea es **OPCIONAL** y solo mejora la experiencia de usuario proporcionando feedback visual inmediato. Bug #1 se resolverá automáticamente con BUG-F-003.

**Cuándo implementar:**

- ✅ DESPUÉS de validar que BUG-F-003 resuelve el problema de visibilidad
- ✅ Como mejora de UX para feedback instantáneo (sin esperar 30s)
- ❌ NO es crítico ni bloqueante

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

#### BUG-F-003: Configurar staleTime adecuado para readings ⭐ MEJORA Bug #1 Y RESUELVE Bug #3

**Problema:** `staleTime` global de 5 minutos hace que queries "fresh" NO refetch aunque estén invalidados.

**Por qué esto agrava Bug #1 y causa Bug #3:**

1. **Bug #3 (Historial vacío):** Usuario nuevo → Carga historial (GET retorna `[]`) → Query "fresh" por 5 min → Crea lectura → `invalidateQueries()` → Query "fresh" + "invalid" → NO refetch → Historial sigue vacío

2. **Bug #1 (Lectura eliminada visible) - AGRAVA el problema:** Usuario → Carga historial → Query "fresh" por 5 min → Elimina lectura → Backend retorna correctamente en lista PERO queries individuales cacheadas (de `findById`) NO refetch por 5 min → Lectura sigue visible

**Nota importante:** BUG-F-003 **mejora** Bug #1 pero NO lo resuelve completamente porque el problema raíz es BUG-B-002 (`findById()` sin filtro)

**Archivos:**

- `frontend/src/hooks/api/useReadings.ts` - Agregar `staleTime` específico a `useMyReadings`

**Solución: StaleTime más corto para readings (30 segundos):**

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

**Por qué staleTime 30s es la solución correcta:**

- ✅ Soluciona Bug #3: usuarios nuevos ven su historial en <30s
- ✅ Soluciona Bug #1: lecturas eliminadas desaparecen en <30s
- ✅ Mejora la experiencia para TODOS los usuarios (cambios se ven más rápido)
- ✅ Más predecible que forzar refetch
- ✅ Balance entre UX (actualización rápida) y performance (evita refetch innecesarios)
- ✅ 30 segundos es razonable para datos que el usuario modifica activamente

**Tests a agregar:**

1. Usuario nuevo crea lectura → Navega a historial → Debe aparecer
2. Usuario elimina lectura → Espera <30s → Debe desaparecer
3. Usuario con historial cacheado → Crea/elimina → Actualiza en <30s
4. Verificar que NO hace refetch cada render (usar React Query Devtools)

**Tiempo estimado:** 10 minutos

---

## ✅ Orden de Implementación

### FASE 1: CRÍTICO (Bugs confirmados - 40 minutos total)

#### 1. **BUG-F-001** - Limpiar caché en logout ⭐⭐⭐ PRIMERO

- **Impacto:** BLOQUEANTE para cambio de usuarios
- **Problema:** Queries de PREMIUM contaminan sesión de FREE
- **Solución:** Agregar `queryClient.clear()` en `authStore.logout()`
- **Complejidad:** Muy baja (1 línea de código)
- **Riesgo:** Ninguno - es la práctica correcta
- **Tiempo estimado:** 15 minutos

#### 2. **BUG-B-002** - findById() filtra deletedAt ⭐⭐⭐ SEGUNDO

- **Impacto:** CRÍTICO - Lecturas eliminadas visibles para usuario PREMIUM
- **Problema:** `findById()` no filtra `deletedAt`, queries individuales retornan lecturas eliminadas
- **Solución:** Agregar `deletedAt: IsNull()` en `where` clause de `findById()`
- **Complejidad:** Muy baja (agregar 1 campo en where)
- **Riesgo:** Muy bajo - fix simple y probado
- **Tiempo estimado:** 15 minutos

#### 3. **BUG-F-003** - StaleTime 30s para readings ⭐⭐ TERCERO

- **Impacto:** CRÍTICO - Resuelve Bug #3 (historial vacío) + Mejora Bug #1 (refetch más rápido)
- **Problema:** staleTime 5 min impide refetch después de invalidación
- **Solución:** Agregar `staleTime: 30 * 1000` en `useMyReadings()`
- **Complejidad:** Muy baja (agregar 1 parámetro)
- **Riesgo:** Bajo - solo aumenta frecuencia de refetch (razonable)
- **Tiempo estimado:** 10 minutos

**Checkpoint:** Después de FASE 1, todos los bugs críticos están resueltos ✅

---

### FASE 2: VALIDACIÓN (15 minutos)

#### 4. **Validar que Bug #1 está completamente resuelto**

**Tests manuales con Playwright:**

1. Login como PREMIUM → Crear 5 lecturas → Eliminar 1 lectura
2. Verificar que desaparece INMEDIATAMENTE de la lista ✅
3. Recargar página → Verificar que NO aparece ✅
4. Login como usuario nuevo → Crear primera lectura
5. Navegar a historial inmediatamente → Verificar que aparece en <30s ✅

**Criterio de éxito:**

- ✅ Lectura eliminada desaparece inmediatamente (gracias a BUG-B-002)
- ✅ Historial de usuario nuevo se actualiza en <30s (gracias a BUG-F-003)
- ✅ No hay lecturas "fantasma" (gracias a BUG-B-002 + BUG-F-003)

---

### FASE 3: OPCIONAL - Mejoras de UX (30 minutos)

#### 5. **BUG-F-002** - Optimistic updates (SOLO SI QUIERES MEJOR UX)

- **Impacto:** Mejora UX con feedback instantáneo (0ms vs esperar refetch)
- **NO es necesario** ya que BUG-B-002 + BUG-F-003 resuelven el problema
- **Valor agregado:** Usuario ve cambio inmediato sin esperar
- **Complejidad:** Media (manejo de rollback en error)
- **Cuándo implementar:** Como mejora de calidad, no como bug fix
- **Tiempo estimado:** 30 minutos

---

### 📊 Resumen de Tiempos

| Fase               | Tareas                            | Tiempo | Impacto                       |
| ------------------ | --------------------------------- | ------ | ----------------------------- |
| **FASE 1**         | BUG-F-001 + BUG-B-002 + BUG-F-003 | 40 min | ✅ Resuelve 3 bugs críticos   |
| **FASE 2**         | Validación                        | 15 min | ✅ Confirma solución completa |
| **FASE 3**         | BUG-F-002 (opcional)              | 30 min | ⭐ Mejora UX (no crítico)     |
| **TOTAL CRÍTICO**  | Fixes mínimos necesarios          | 55 min | ✅ Todos los bugs resueltos   |
| **TOTAL COMPLETO** | Con mejoras opcionales            | 85 min | ⭐ UX optimizada              |

---

## 🧪 Plan de Testing

### Tests Unitarios

#### BUG-F-001 (Limpiar caché en logout):

```typescript
// authStore.test.ts
it("should clear React Query cache on logout", () => {
  const queryClient = new QueryClient();
  const clearSpy = vi.spyOn(queryClient, "clear");

  authStore.logout();

  expect(clearSpy).toHaveBeenCalled();
});
```

#### BUG-F-003 (StaleTime override):

```typescript
// useReadings.test.ts
it("useMyReadings should have 30s staleTime", () => {
  const { result } = renderHook(() => useMyReadings(1, 10));

  // Verificar que staleTime está configurado
  expect(result.current).toBeDefined();
});
```

### Tests E2E (Playwright)

#### 1. **Test: Cambio de usuario limpia caché (BUG-F-001)**

```typescript
test("should clear cache when switching users", async ({ page }) => {
  // Login como PREMIUM
  await loginAs(page, "premium@test.com");
  await createReading(page, { withCategory: true });

  // Logout
  await logout(page);

  // Login como FREE
  await loginAs(page, "free@test.com");

  // Verificar que NO ve opciones de PREMIUM
  await expect(page.locator('[data-testid="category-selector"]')).not.toBeVisible();

  // Intentar lectura FREE debe funcionar sin errores
  await createReading(page, { plan: "FREE" });
  await expect(page).not.toHaveText("500");
});
```

#### 2. **Test: Primera lectura de nuevo usuario aparece inmediatamente (BUG-F-003 resuelve Bug #3)**

```typescript
test("new user sees first reading in history", async ({ page }) => {
  // Registrar nuevo usuario
  const email = `newuser_${Date.now()}@test.com`;
  await register(page, email);

  // Crear primera lectura
  await createReading(page);
  await expect(page).toHaveText("Lectura creada exitosamente");

  // Navegar a historial inmediatamente
  await page.goto("/historial");

  // DEBE mostrar la lectura (no "Tu destino aún no ha sido revelado")
  await expect(page.locator('[data-testid="reading-card"]')).toBeVisible({ timeout: 31000 });
  await expect(page).not.toHaveText("Tu destino aún no ha sido revelado");
});
```

#### 3. **Test: Lectura eliminada desaparece del historial (BUG-F-003 resuelve Bug #1)**

```typescript
test("deleted reading disappears from history within 30s", async ({ page }) => {
  // Login y crear lectura
  await loginAs(page, "premium@test.com");
  const readingTitle = `Lectura ${Date.now()}`;
  await createReading(page, { question: readingTitle });

  // Ir a historial
  await page.goto("/historial");
  await expect(page.locator(`text=${readingTitle}`)).toBeVisible();

  // Eliminar lectura
  await page.locator(`text=${readingTitle}`).locator("..").locator('[data-testid="delete-button"]').click();
  await page.locator('[data-testid="confirm-delete"]').click();

  // Lectura debe desaparecer en <30s
  await expect(page.locator(`text=${readingTitle}`)).not.toBeVisible({ timeout: 31000 });

  // Recargar página - NO debe aparecer
  await page.reload();
  await expect(page.locator(`text=${readingTitle}`)).not.toBeVisible();
});
```

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

**Comenzar con BUG-F-001** - Limpiar caché de React Query en logout

**Por qué este orden:**

1. ✅ Es el bug más crítico (bloqueante para cambio de usuarios)
2. ✅ Es el más rápido de implementar (15 minutos)
3. ✅ Tiene cero riesgo (es la práctica correcta)
4. ✅ Permite probar inmediatamente el cambio PREMIUM→FREE

**Después:** Implementar BUG-F-003 (10 minutos) → **TODOS LOS BUGS CRÍTICOS RESUELTOS** ✅

**Total tiempo de fix crítico:** ~25 minutos
