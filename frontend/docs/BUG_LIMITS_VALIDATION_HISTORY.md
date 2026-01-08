# Bug Recurrente: Validación de Límites FREE/PREMIUM/ANONYMOUS

> **⚠️ ALERTA CRÍTICA**: Este bug ha sido arreglado múltiples veces y sigue apareciendo. Este documento explica por qué es tan frágil y cómo evitar regresiones.

**Última actualización**: 8 Enero 2026  
**Branch**: `fix/limits-validation-all-plans`  
**Iteraciones previas**: 5+ veces

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Bugs Encontrados](#bugs-encontrados)
3. [Root Causes: Por Qué Sigue Rompiéndose](#root-causes-por-qué-sigue-rompiéndose)
4. [Soluciones Implementadas](#soluciones-implementadas)
5. [Puntos Frágiles del Código](#puntos-frágiles-del-código)
6. [Arquitectura del Sistema de Límites](#arquitectura-del-sistema-de-límites)
7. [Cómo Prevenir Regresiones](#cómo-prevenir-regresiones)
8. [Tests de Validación](#tests-de-validación)

---

## 🚨 Resumen Ejecutivo

### El Problema

El sistema de validación de límites para usuarios FREE/PREMIUM/ANONYMOUS es extremadamente frágil porque:

1. **Estado distribuido**: Los límites se validan en 3 lugares diferentes (frontend, backend, authStore)
2. **Caché múltiples**: React Query + Zustand + localStorage + sessionStorage
3. **Timing crítico**: La validación depende del momento exacto en que se consultan los contadores
4. **Lógica compleja**: Diferentes reglas para cada tipo de usuario y cada feature (carta del día vs tiradas)

### Impacto

Cuando falla, los usuarios FREE experimentan:

- ❌ Modal de límite en su PRIMERA lectura (debería permitir 1 lectura)
- ❌ Carta revelada en lugar de modal cuando regresan (debería mostrar modal)
- ❌ Comportamiento inconsistente entre carta del día y tiradas de tarot

---

## 🐛 Bugs Encontrados

### Bug #1: Modal de límite en primera lectura

**Síntoma**: Usuario FREE nuevo va a "Nueva Lectura" y ve modal de límite alcanzado sin haber hecho ninguna lectura.

**Esperado**: Debería poder hacer 1 tirada de tarot sin ver modal.

**Root Cause**:

- `SpreadSelector` valida `tarotCount >= tarotLimit`
- Al crear usuario, `tarotReadingsCount` puede ser `undefined` o `null`
- Fallback incorrecto: `tarotLimit ?? 0` hacía que `0 >= 0` fuera `true`

**Código problemático**:

```typescript
// ❌ INCORRECTO
const tarotLimit = user.tarotReadingsLimit ?? 0; // Si es undefined, fallback a 0
return tarotCount >= tarotLimit; // 0 >= 0 = true (límite alcanzado!)
```

---

### Bug #2: Carta del día muestra carta anterior en lugar de modal

**Síntoma**: Usuario FREE usa su carta del día, sale, y al regresar ve la carta revelada en lugar del modal de límite alcanzado.

**Esperado**: Debería mostrar modal "Ya recibiste tu carta del día".

**Root Cause**:

- React Query mantiene `data` en caché incluso cuando `enabled: false`
- `currentReading = localReading || dailyReading` usa la carta cacheada
- La lógica de `localReading` no distinguía entre "recién creada" vs "retornando después"

**Código problemático**:

```typescript
// ❌ INCORRECTO
const { data: dailyReading } = useDailyReadingToday({
  enabled: isAuthenticated && !hasReachedDailyCardLimit,
});
const currentReading = localReading || dailyReading; // dailyReading puede tener data vieja!
```

---

### Bug #3: useCreateReading no actualiza authStore

**Síntoma**: Después de crear una lectura, ir a "Nueva Lectura" NO muestra el modal de límite alcanzado.

**Esperado**: Después de usar el límite, al regresar debería mostrar modal inmediatamente.

**Root Cause**:

- `useCreateReading` invalida React Query (`userQueryKeys.profile`)
- Pero `SpreadSelector` lee de `authStore` (Zustand), no de React Query
- El authStore no se actualiza hasta el siguiente `checkAuth()` automático

**Código problemático**:

```typescript
// ❌ INCORRECTO
onSuccess: async () => {
  queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });
  // ❌ SpreadSelector usa authStore, no React Query!
};
```

---

### Bug #4: Logout no redirige desde carta del día

**Síntoma**: Al hacer logout desde la página de carta del día (con modal de límite), muestra la carta boca abajo en lugar de redirigir.

**Esperado**: Logout debería redirigir al home.

**Root Cause**:

- `authStore.logout()` limpia tokens y estado
- Pero NO hace navegación/redirect
- La página actual queda en estado inconsistente (sin usuario pero en página protegida)

**Código problemático**:

```typescript
// ❌ INCORRECTO
logout: () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  set({ user: null, isAuthenticated: false });
  // ❌ Falta: window.location.href = '/';
};
```

---

## 🔍 Root Causes: Por Qué Sigue Rompiéndose

### 1. Arquitectura de Estado Dual (React Query + Zustand)

**El Problema Fundamental**: Los límites se gestionan en DOS sistemas de estado diferentes:

```
┌─────────────────────────────────────────────────────────┐
│                    FUENTES DE VERDAD                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  React Query (TanStack)          Zustand (authStore)    │
│  ├─ userQueryKeys.profile        ├─ user.dailyCardCount│
│  ├─ Fetches desde /users/me      ├─ user.tarotCount    │
│  ├─ Auto-invalidación            ├─ user.*Limit        │
│  └─ Cache automático              └─ Persiste localStorage│
│                                                          │
└─────────────────────────────────────────────────────────┘
                           ↓
                    ⚠️ PROBLEMA ⚠️
        Componentes leen de diferentes fuentes
```

**Componentes afectados**:

- `DailyCardExperience`: Lee de React Query (`useDailyReadingToday`)
- `SpreadSelector`: Lee de Zustand (`useAuth()` → `authStore`)
- `CategorySelector`: Lee de Zustand (`useAuth()` → `authStore`)

**Por qué es frágil**:

1. Si invalidas React Query pero el componente lee de Zustand → No se actualiza
2. Si actualizas Zustand pero el query está deshabilitado → Usa caché viejo
3. Timing: Zustand puede actualizarse DESPUÉS de que el componente renderice

---

### 2. Validación de Límites en Múltiples Lugares

**Los límites se validan en 3 capas diferentes**:

```
┌──────────────────────────────────────────────────────┐
│ 1. FRONTEND (preventivo - UX)                        │
│    ├─ SpreadSelector.tsx                             │
│    ├─ DailyCardExperience.tsx                        │
│    └─ CategorySelector.tsx                           │
├──────────────────────────────────────────────────────┤
│ 2. BACKEND (autoridad - seguridad)                   │
│    ├─ reading.service.ts                             │
│    ├─ daily-reading.service.ts                       │
│    └─ usage-limit.service.ts                         │
├──────────────────────────────────────────────────────┤
│ 3. ZUSTAND STORE (estado global)                     │
│    └─ authStore.ts (user.dailyCardCount, etc)       │
└──────────────────────────────────────────────────────┘
```

**Por qué es frágil**:

- Cambiar lógica en un lugar puede romper los otros
- Ejemplo: Cambiar `>=` a `>` en frontend pero no en backend → Inconsistencia
- Ejemplo: Olvidar actualizar authStore después de crear lectura → Modal no aparece

---

### 3. Modelo de Negocio: "Si reingresa tras consumir límite → Modal inmediato"

Esta regla de negocio es CONTRAINTUITIVA para desarrolladores:

```typescript
// ❌ Lógica intuitiva (INCORRECTA según modelo de negocio)
if (user.dailyCardCount > user.dailyCardLimit) {
  showModal(); // Solo después de EXCEDER
}

// ✅ Lógica correcta (modelo de negocio)
if (user.dailyCardCount >= user.dailyCardLimit) {
  showModal(); // Inmediatamente al ALCANZAR
}
```

**Por qué se rompe**:

- Desarrollador piensa: "Si tiene límite 1, puede hacer 1 lectura → count debe ser > 1 para bloquear"
- Pero el modelo dice: "Cuando count === limit, YA consumió su límite → bloquear inmediatamente"
- Esta confusión causa que se cambie `>=` por `>` repetidamente

**Ejemplo concreto**:

```
Usuario FREE: dailyCardLimit = 1

Momento 1: dailyCardCount = 0
  ¿Mostrar modal? NO (0 >= 1 es false) ✅ Puede crear carta

Momento 2: Crea carta → dailyCardCount = 1
  ¿Mostrar modal? SÍ (1 >= 1 es true) ✅ Ya usó su límite

Momento 3: Regresa a carta-del-dia
  ¿Mostrar modal? SÍ (1 >= 1 es true) ✅ No puede crear otra
```

---

### 4. React Query Cache Persistente

**El problema más sutil**:

```typescript
// Query con enabled: false sigue manteniendo data
const { data: dailyReading } = useDailyReadingToday({
  enabled: isAuthenticated && !hasReachedDailyCardLimit,
});

// Escenario problemático:
// 1. Usuario crea carta → data se llena con la carta
// 2. Usuario sale y regresa → enabled = false (límite alcanzado)
// 3. PERO: data todavía contiene la carta anterior!
// 4. Componente usa data vieja para mostrar carta en lugar de modal
```

**Por qué es frágil**:

- React Query no borra `data` cuando `enabled` cambia a `false`
- Esto es por diseño (para mostrar stale data mientras se recarga)
- Pero en nuestro caso queremos OCULTAR la data cuando se alcanza el límite

---

### 5. LocalReading: Estado de Sesión vs Estado Persistente

**La distinción sutil que causa confusión**:

```typescript
// DailyCardExperience tiene DOS estados de carta:
const [localReading, setLocalReading] = useState<DailyReading | null>(null);
const { data: dailyReading } = useDailyReadingToday({ ... });

// localReading = Carta recién creada en ESTA sesión (useState)
// dailyReading = Carta fetcheada del backend (React Query)

// PROBLEMA: ¿Cuándo usar cada uno?
const currentReading = localReading || dailyReading; // ¿Correcto?
```

**Por qué es frágil**:

- `localReading` se borra al recargar página (useState no persiste)
- `dailyReading` persiste en React Query cache
- Lógica debe distinguir: "¿Usuario ACABA de crear?" vs "¿Usuario está regresando?"
- Solución actual: `!localReading` en el check de límite
- Pero es fácil olvidar esta distinción y romperlo

---

## ✅ Soluciones Implementadas

### Solución #1: Fallback correcto en SpreadSelector

**Archivo**: `frontend/src/components/features/readings/SpreadSelector.tsx`

**Cambio**:

```typescript
// ❌ ANTES (INCORRECTO)
const tarotLimit = user.tarotReadingsLimit ?? 0;
// Si user.tarotReadingsLimit es undefined → fallback a 0
// Entonces: tarotCount >= 0 → SIEMPRE true

// ✅ DESPUÉS (CORRECTO)
const tarotLimit = user.tarotReadingsLimit ?? 1;
// Si user.tarotReadingsLimit es undefined → fallback a 1 (límite FREE por defecto)
// Entonces: tarotCount >= 1 → Solo true cuando realmente alcanzó límite
```

**Por qué funciona**: FREE users tienen límite 1 por defecto. Si el backend no envía el valor, asumir 1 es seguro.

**Riesgo de regresión**: Si alguien piensa "mejor usar 0 como fallback seguro" → Se rompe de nuevo.

---

### Solución #2: Ignorar caché de React Query cuando límite alcanzado

**Archivo**: `frontend/src/components/features/daily-reading/DailyCardExperience.tsx`

**Cambio**:

```typescript
// ❌ ANTES (INCORRECTO)
const currentReading = localReading || dailyReading;
// Siempre usa dailyReading como fallback → Muestra carta cacheada incluso cuando límite alcanzado

// ✅ DESPUÉS (CORRECTO)
const currentReading = localReading || (!hasReachedDailyCardLimit ? dailyReading : null);
// Solo usa dailyReading si el usuario NO ha alcanzado el límite
// Si límite alcanzado → currentReading = null → Muestra modal
```

**Por qué funciona**:

1. Si `localReading` existe → Usuario ACABA de crear carta → Mostrarla
2. Si `localReading` es null pero límite NO alcanzado → Fetch carta del backend
3. Si `localReading` es null Y límite alcanzado → No mostrar carta, mostrar modal

**Riesgo de regresión**: Si alguien simplifica a `localReading || dailyReading` pensando "más simple es mejor" → Se rompe.

---

### Solución #3: Actualizar authStore después de crear lectura

**Archivo**: `frontend/src/hooks/api/useReadings.ts`

**Cambio**:

```typescript
// ❌ ANTES (INCORRECTO)
onSuccess: async () => {
  queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });
  toast.success('Lectura creada exitosamente');
};

// ✅ DESPUÉS (CORRECTO)
onSuccess: async () => {
  queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });

  // CRÍTICO: También actualizar authStore inmediatamente
  await useAuthStore.getState().checkAuth();

  toast.success('Lectura creada exitosamente');
};
```

**Por qué funciona**:

1. Invalida React Query para componentes que leen de allí
2. Llama `checkAuth()` para fetchear `/users/me` y actualizar authStore
3. Ahora componentes que leen de authStore (como SpreadSelector) ven contadores actualizados

**Riesgo de regresión**:

- Si se crea otro mutation de lectura y olvidan agregar `checkAuth()` → Se rompe
- Si se cambia SpreadSelector a leer de React Query y olvidan revisar esto → Puede funcionar pero ser inconsistente

---

### Solución #4: Redirect en logout

**Archivo**: `frontend/src/stores/authStore.ts`

**Cambio**:

```typescript
// ❌ ANTES (INCORRECTO)
logout: () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  set({ user: null, isAuthenticated: false });
  // Usuario queda en página protegida sin auth
};

// ✅ DESPUÉS (CORRECTO)
logout: () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  set({ user: null, isAuthenticated: false });

  // CRÍTICO: Redirigir al home después de limpiar estado
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};
```

**Por qué funciona**: `window.location.href` hace navegación completa (no SPA), limpia todo estado de React/Next.js.

**Riesgo de regresión**: Si alguien cambia a `router.push('/')` (Next.js router) → Puede no limpiar estado correctamente.

---

### Solución #5: Lógica refinada de isAuthenticatedLimitReached

**Archivo**: `frontend/src/components/features/daily-reading/DailyCardExperience.tsx`

**Cambio**:

```typescript
// ❌ ANTES (SIMPLIFICADO - CAUSABA BUGS)
const isAuthenticatedLimitReached = isAuthenticated && hasReachedDailyCardLimit;

// ✅ DESPUÉS (COMPLEJO - PERO CORRECTO)
const isAuthenticatedLimitReached =
  isAuthenticated &&
  hasReachedDailyCardLimit &&
  !localReading && // Permitir ver carta recién creada en ESTA sesión
  !isCreatingReading && // No mostrar modal mientras está creando
  !isRevealing; // No mostrar modal durante animación de reveal
```

**Por qué funciona**:

- `!localReading`: Si usuario ACABA de crear la carta (en esta sesión), dejarle verla
- `!isCreatingReading`: Durante el proceso de creación, no interrumpir con modal
- `!isRevealing`: Durante animación de flip, no interrumpir con modal

**Por qué es complicado**:

- Usuario crea carta → `localReading` se llena → Modal NO aparece (correcto)
- Usuario cierra pestaña y regresa → `localReading = null` (useState no persiste) → Modal aparece (correcto)
- Pero `dailyReading` tiene data cacheada → Por eso necesitamos Solución #2

**Riesgo de regresión**: Si alguien simplifica esto pensando "demasiado complejo" → Se rompe de nuevo.

---

## 🔥 Puntos Frágiles del Código

### 1. DualStore Pattern (React Query + Zustand)

**Ubicación**: Todo el sistema de autenticación y límites

**Fragilidad**: 🔴🔴🔴🔴🔴 (5/5 - EXTREMADAMENTE FRÁGIL)

**Qué lo hace frágil**:

```typescript
// authStore (Zustand) - Persiste en localStorage
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null, // { dailyCardCount, dailyCardLimit, tarotReadingsCount, ... }
      // ...
    }),
    { name: 'auth-storage' }
  )
);

// React Query - Cache en memoria con TTL
export function useUser() {
  return useQuery({
    queryKey: userQueryKeys.profile,
    queryFn: () => apiClient.get<AuthUser>('/users/me'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// PROBLEMA: Componentes diferentes leen de lugares diferentes
// SpreadSelector → useAuth() → authStore (Zustand)
// Profile page → useUser() → React Query
```

**Cómo puede romperse**:

1. Desarrollador invalida React Query pero componente lee de Zustand → No actualiza
2. Backend retorna datos nuevos pero Zustand no se refresca → Estado viejo
3. Dos requests concurrentes actualizan en orden diferente → Race condition

**Recomendación**:

- **Opción A (ideal pero costosa)**: Unificar en una sola fuente de verdad
  - Usar SOLO React Query para user data
  - Eliminar user de authStore, solo mantener tokens
  - Refactorizar todos los `useAuth()` a `useUser()`
- **Opción B (pragmática)**: Documentar claramente
  - Comentar en CADA lugar que lee user data: "⚠️ Lee de Zustand, no de React Query"
  - Crear helper que sincroniza ambos después de mutation
  - Tests que verifican ambos stores están sincronizados

---

### 2. Comparador >= vs >

**Ubicación**:

- `SpreadSelector.tsx` línea ~175-187
- `DailyCardExperience.tsx` línea ~76
- Backend: `reading.service.ts`, `daily-reading.service.ts`

**Fragilidad**: 🔴🔴🔴🔴⚪ (4/5 - MUY FRÁGIL)

**Qué lo hace frágil**:

```typescript
// La confusión mental recurrente:
// "Si límite es 1, cuando count = 1, ¿ya se pasó o no?"

// ❌ Intuición incorrecta:
if (count > limit) {
  // "Mayor que 1 = 2 o más"
  showModal();
}

// ✅ Modelo de negocio:
if (count >= limit) {
  // "Igual a 1 = ya usó su único permitido"
  showModal();
}
```

**Cómo puede romperse**:

1. Desarrollador nuevo lee el código y piensa: "Esto debería ser `>`"
2. AI assistant (Copilot) sugiere cambiar `>=` a `>` porque "parece más lógico"
3. Durante refactor, se copia lógica de otro lugar que usa `>` incorrectamente

**Recomendación**:

- Agregar comentario GRITANDO en cada lugar:

```typescript
// ⚠️⚠️⚠️ CRÍTICO: Debe ser >= NO > ⚠️⚠️⚠️
// Modelo de negocio: "Si reingresa tras consumir límite → Modal inmediato"
// Cuando count === limit, el usuario YA usó su límite permitido
// Ejemplo: FREE user con limit=1, cuando count=1 → YA consumió su única lectura
// Ver: frontend/docs/BUG_LIMITS_VALIDATION_HISTORY.md
const hasReachedLimit = count >= limit;
```

---

### 3. React Query enabled flag + data persistence

**Ubicación**: `DailyCardExperience.tsx` línea ~85-90

**Fragilidad**: 🔴🔴🔴⚪⚪ (3/5 - MODERADAMENTE FRÁGIL)

**Qué lo hace frágil**:

```typescript
const { data: dailyReading } = useDailyReadingToday({
  enabled: isAuthenticated && !hasReachedDailyCardLimit,
});

// SORPRESA: Cuando enabled cambia a false, data NO se borra!
// React Query mantiene la última data exitosa
// Esto es útil para mostrar stale data mientras recarga
// Pero en nuestro caso queremos OCULTAR la data
```

**Cómo puede romperse**:

1. Desarrollador asume: "`enabled: false` → `data` será `undefined`" → Rompe
2. Cambian lógica a confiar solo en `enabled` para decidir qué mostrar → Rompe
3. Agregan `keepPreviousData: true` sin darse cuenta que ya está manteniendo data → Empeora

**Recomendación**:

- Comentario explícito:

```typescript
const { data: dailyReading } = useDailyReadingToday({
  enabled: isAuthenticated && !hasReachedDailyCardLimit,
});

// ⚠️ IMPORTANTE: Incluso cuando enabled=false, 'data' puede contener carta vieja del cache
// NO confiar solo en 'enabled' para decidir si mostrar carta o modal
// Solución: Verificar hasReachedDailyCardLimit antes de usar dailyReading
// Ver currentReading computed property abajo
```

---

### 4. LocalReading useState vs dailyReading fetch

**Ubicación**: `DailyCardExperience.tsx` línea ~96-132

**Fragilidad**: 🔴🔴🔴⚪⚪ (3/5 - MODERADAMENTE FRÁGIL)

**Qué lo hace frágil**:

```typescript
// DOS estados diferentes para la "carta actual":
const [localReading, setLocalReading] = useState<DailyReading | null>(null);
const { data: dailyReading } = useDailyReadingToday({ ... });

// ¿Cuál usar cuándo? Lógica sutil:
// - localReading: Carta creada EN ESTA SESIÓN (se borra al refrescar)
// - dailyReading: Carta fetcheada del backend (persiste en cache)

// Necesidad: Distinguir "recién creada" vs "regresando a ver"
```

**Cómo puede romperse**:

1. Desarrollador piensa: "¿Para qué dos estados? Simplifiquemos a uno solo" → Rompe
2. Cambian a usar solo `dailyReading` → Pierde la distinción sesión actual
3. Cambian a usar solo `localReading` → Pierde persistencia

**Recomendación**:

- Comentar claramente la razón de DOS estados:

```typescript
// ⚠️ ARQUITECTURA CRÍTICA: DOS estados de carta son necesarios
//
// 1. localReading (useState):
//    - Carta creada EN ESTA SESIÓN DEL NAVEGADOR
//    - Se borra al refrescar página / cerrar tab
//    - Propósito: Distinguir "usuario ACABA de crear" vs "usuario está regresando"
//    - Uso: Permitir ver carta recién creada aunque límite alcanzado
//
// 2. dailyReading (React Query):
//    - Carta fetcheada del backend
//    - Persiste en cache de React Query
//    - Propósito: Mostrar carta existente cuando usuario regresa
//    - Problema: Puede contener data vieja incluso cuando enabled=false
//
// Ver: frontend/docs/BUG_LIMITS_VALIDATION_HISTORY.md
const [localReading, setLocalReading] = useState<DailyReading | null>(null);
const { data: dailyReading } = useDailyReadingToday({ ... });
```

---

### 5. checkAuth() timing en mutations

**Ubicación**: `useReadings.ts`, `useDailyReading.ts`

**Fragilidad**: 🔴🔴🔴🔴⚪ (4/5 - MUY FRÁGIL)

**Qué lo hace frágil**:

```typescript
// TODA mutation que cambia límites debe:
// 1. Invalidar React Query
// 2. Llamar checkAuth() para actualizar Zustand
// 3. Esperar a que ambos terminen antes de navegar

// Fácil olvidar en nuevas mutations
```

**Cómo puede romperse**:

1. Se crea nuevo mutation hook (ej: `useDeleteReading`)
2. Se olvida agregar `checkAuth()` en `onSuccess`
3. Componentes que leen de authStore ven datos viejos → No actualizan límites

**Recomendación**:

- Crear helper que encapsula el patrón:

```typescript
// utils/mutation-helpers.ts
export async function invalidateUserData(queryClient: QueryClient) {
  // Invalidar React Query
  queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });
  queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });

  // Actualizar Zustand authStore
  await useAuthStore.getState().checkAuth();
}

// Uso en mutations:
export function useCreateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReadingDto) => createReading(data),
    onSuccess: async () => {
      await invalidateUserData(queryClient); // Helper ✅
      toast.success('Lectura creada exitosamente');
    },
  });
}
```

---

## 🏗️ Arquitectura del Sistema de Límites

### Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO HACE ACCIÓN                      │
│                  (Click en "Revelar carta" / "Crear lectura")   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND: Validación Preventiva (UX)               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SpreadSelector / DailyCardExperience                     │   │
│  │ Verifica: count >= limit ?                               │   │
│  │ Fuente: authStore (Zustand)                              │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
│         ┌───────────────┴────────────────┐                      │
│         │ Límite alcanzado?              │                      │
│         ├─────────────┬──────────────────┤                      │
│         │ SÍ          │ NO               │                      │
│         ▼             ▼                  │                      │
│  Mostrar Modal   Permitir continuar     │                      │
│  (Bloqueo UX)                            │                      │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MUTATION: Llamada a API Backend                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ useCreateReading() / useDailyReading()                   │   │
│  │ POST /api/readings                                       │   │
│  │ POST /api/daily-readings                                 │   │
│  └──────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│            BACKEND: Validación Autoritaria (Seguridad)           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ reading.service.ts / daily-reading.service.ts            │   │
│  │                                                          │   │
│  │ 1. Fetch user.dailyCardCount / tarotReadingsCount       │   │
│  │ 2. Fetch user.dailyCardLimit / tarotReadingsLimit       │   │
│  │ 3. Verificar: count >= limit ?                          │   │
│  │ 4. Si límite alcanzado → throw ForbiddenException       │   │
│  │ 5. Si OK → Crear lectura + Incrementar contador         │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
│         ┌───────────────┴────────────────┐                      │
│         │ Límite alcanzado?              │                      │
│         ├─────────────┬──────────────────┤                      │
│         │ SÍ          │ NO               │                      │
│         ▼             ▼                  │                      │
│  Error 403       Lectura creada         │                      │
│                  + Contador ++           │                      │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND: Actualizar Estado (onSuccess)            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. queryClient.invalidateQueries(userQueryKeys.profile)  │   │
│  │    → React Query refetch /users/me                       │   │
│  │                                                          │   │
│  │ 2. await useAuthStore.getState().checkAuth()            │   │
│  │    → Zustand fetch /users/me y actualiza authStore      │   │
│  │                                                          │   │
│  │ 3. setLocalReading(data) (solo DailyCardExperience)     │   │
│  │    → useState guarda carta de ESTA sesión               │   │
│  └──────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO VE RESULTADO                          │
│              (Carta revelada + Interpretación)                   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ Usuario sale y regresa
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              SEGUNDA VISITA: ¿Mostrar Carta o Modal?            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ DailyCardExperience / SpreadSelector                     │   │
│  │                                                          │   │
│  │ Verificar:                                               │   │
│  │ - hasReachedDailyCardLimit (count >= limit) ?           │   │
│  │ - localReading existe? (NO, useState se borró)          │   │
│  │                                                          │   │
│  │ Resultado:                                               │   │
│  │ - isAuthenticatedLimitReached = true                    │   │
│  │ - currentReading = null (ignorar cache)                 │   │
│  │                                                          │   │
│  │ → Mostrar Modal de Límite Alcanzado ✅                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Estados Críticos

```
Estado 1: Usuario nuevo (nunca usó límite)
├─ dailyCardCount = 0
├─ dailyCardLimit = 1
├─ hasReachedDailyCardLimit = false (0 >= 1 = false)
├─ localReading = null
├─ dailyReading = undefined (nunca fetcheó)
└─ RESULTADO: Mostrar carta boca abajo (puede crear) ✅

Estado 2: Usuario ACABA de crear carta (misma sesión)
├─ dailyCardCount = 1
├─ dailyCardLimit = 1
├─ hasReachedDailyCardLimit = true (1 >= 1 = true)
├─ localReading = { carta data } ← CLAVE
├─ dailyReading = { carta data } (fetcheó después de crear)
└─ RESULTADO: Mostrar carta revelada (porque localReading existe) ✅

Estado 3: Usuario regresa después (nueva sesión)
├─ dailyCardCount = 1
├─ dailyCardLimit = 1
├─ hasReachedDailyCardLimit = true (1 >= 1 = true)
├─ localReading = null ← useState se borró
├─ dailyReading = { carta data } (cache de React Query)
├─ isAuthenticatedLimitReached = true ← CLAVE
│   (porque !localReading && hasReachedDailyCardLimit)
├─ currentReading = null ← CLAVE
│   (porque hasReachedDailyCardLimit → ignorar cache)
└─ RESULTADO: Mostrar modal de límite alcanzado ✅
```

---

## 🛡️ Cómo Prevenir Regresiones

### 1. Tests Automatizados (CRÍTICO)

**Crear suite de tests E2E con Playwright**:

```typescript
// tests/e2e/limits-validation.spec.ts

describe('Límites FREE User - Carta del Día', () => {
  beforeEach(async ({ page }) => {
    // Reset DB para user free@test.com
    await resetUserLimits('free@test.com');
    await page.goto('/login');
    await loginAs(page, 'free@test.com', 'password');
  });

  test('Primera visita: muestra carta boca abajo', async ({ page }) => {
    await page.goto('/carta-del-dia');
    await expect(page.locator('[data-testid="tarot-card"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).not.toBeVisible(); // NO modal
  });

  test('Primera creación: revela carta sin modal', async ({ page }) => {
    await page.goto('/carta-del-dia');
    await page.locator('[data-testid="tarot-card"]').click();
    await page.waitForTimeout(3000); // Animación + API

    await expect(page.locator('text=Invertida,upright')).toBeVisible();
    await expect(page.locator('[role="alert"]')).not.toBeVisible();
  });

  test('Segunda visita: muestra modal de límite', async ({ page }) => {
    // Primera creación
    await page.goto('/carta-del-dia');
    await page.locator('[data-testid="tarot-card"]').click();
    await page.waitForTimeout(3000);

    // Navegar y regresar
    await page.goto('/');
    await page.goto('/carta-del-dia');

    // Debe mostrar modal
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=Ya recibiste tu carta del día')).toBeVisible();
    await expect(page.locator('text=1 de 1 carta')).toBeVisible();
  });
});

describe('Límites FREE User - Tiradas', () => {
  test('Primera tirada: completa sin modal', async ({ page }) => {
    await page.goto('/ritual/tirada');
    await page.locator('button:has-text("Seleccionar")').first().click();
    await page.locator('[aria-label*="Carta 1"]').click();
    await page.locator('button:has-text("Revelar")').click();
    await page.waitForURL('**/ritual/lectura?spreadId=*');

    await expect(page.locator('text=Tu lectura del Tarot')).toBeVisible();
  });

  test('Segunda visita: muestra modal de límite', async ({ page }) => {
    // Primera tirada
    await createReading(page, 'free@test.com');

    // Navegar y regresar
    await page.goto('/');
    await page.goto('/ritual/tirada');

    // Debe mostrar modal
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=Límite de tiradas alcanzado')).toBeVisible();
    await expect(page.locator('text=1 de 1 tirada')).toBeVisible();
  });
});

describe('Logout', () => {
  test('Logout desde carta-del-dia con límite alcanzado redirige a home', async ({ page }) => {
    await createDailyCard(page, 'free@test.com');
    await page.goto('/carta-del-dia'); // Modal de límite

    await page.locator('[data-testid="user-menu-trigger"]').click();
    await page.locator('role=menuitem[name="Cerrar Sesión"]').click();

    // Debe redirigir al home
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });
});
```

**Ejecutar en CI/CD antes de merge**:

```yaml
# .github/workflows/test-limits.yml
name: Test Límites Validación

on: [pull_request]

jobs:
  e2e-limits:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start Docker Compose
        run: docker-compose up -d
      - name: Run E2E Tests
        run: npm run test:e2e -- limits-validation.spec.ts
      - name: Upload Report
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: playwright-report
          path: playwright-report/
```

---

### 2. Code Review Checklist

**Agregar a PR template**:

```markdown
## ⚠️ Checklist: Cambios en Sistema de Límites

Si tu PR toca alguno de estos archivos, verifica:

### Archivos Críticos:

- [ ] `SpreadSelector.tsx`
- [ ] `DailyCardExperience.tsx`
- [ ] `useReadings.ts` / `useDailyReading.ts`
- [ ] `authStore.ts`
- [ ] Backend: `reading.service.ts` / `daily-reading.service.ts`

### Verificaciones Obligatorias:

**Comparadores:**

- [ ] ¿Usaste `>=` NO `>` para validar límites?
- [ ] ¿Agregaste comentario explicando por qué `>=`?

**Mutations:**

- [ ] ¿Tu mutation llama `checkAuth()` en `onSuccess`?
- [ ] ¿Invalidas tanto React Query como Zustand?

**Estado de User:**

- [ ] ¿Tu componente lee de authStore (Zustand) o React Query?
- [ ] ¿Agregaste comentario indicando de dónde lee?

**React Query:**

- [ ] ¿Usas `enabled` flag en query de límites?
- [ ] ¿Manejas el caso donde `data` persiste aunque `enabled=false`?

**Tests:**

- [ ] ¿Agregaste test E2E para tu cambio?
- [ ] ¿Corriste toda la suite de `limits-validation.spec.ts`?

### Documentación:

- [ ] Leí `frontend/docs/BUG_LIMITS_VALIDATION_HISTORY.md`
- [ ] Actualicé el doc si encontré nuevo caso edge
```

---

### 3. Linting Rule Personalizada

**Crear ESLint rule que detecte patrones problemáticos**:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'tarot/no-greater-than-limit-check': 'error',
  },
};

// eslint-custom-rules/no-greater-than-limit-check.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce >= instead of > for limit checks',
    },
    messages: {
      useGreaterThanOrEqual:
        'Use >= instead of > for limit checks. See frontend/docs/BUG_LIMITS_VALIDATION_HISTORY.md',
    },
  },
  create(context) {
    return {
      BinaryExpression(node) {
        // Detect: count > limit or similar
        if (node.operator === '>') {
          const leftName = node.left.name || '';
          const rightName = node.right.name || '';

          if (
            (leftName.includes('Count') && rightName.includes('Limit')) ||
            (leftName.includes('Limit') && rightName.includes('Count'))
          ) {
            context.report({
              node,
              messageId: 'useGreaterThanOrEqual',
            });
          }
        }
      },
    };
  },
};
```

---

### 4. Monitoreo en Producción

**Agregar tracking para detectar bugs temprano**:

```typescript
// lib/analytics/limits-tracking.ts

export function trackLimitValidation(event: {
  component: 'DailyCard' | 'Spread';
  userPlan: 'FREE' | 'PREMIUM' | 'ANONYMOUS';
  count: number;
  limit: number;
  action: 'allowed' | 'blocked';
  modalShown: boolean;
}) {
  // Enviar a analytics
  posthog.capture('limit_validation', event);

  // Detectar anomalías
  if (event.action === 'allowed' && event.count >= event.limit) {
    // 🚨 BUG: Usuario permitido cuando debería estar bloqueado
    Sentry.captureMessage('Límite validation error: Allowed when should block', {
      level: 'error',
      extra: event,
    });
  }

  if (event.action === 'blocked' && event.count < event.limit) {
    // 🚨 BUG: Usuario bloqueado cuando debería estar permitido
    Sentry.captureMessage('Límite validation error: Blocked when should allow', {
      level: 'error',
      extra: event,
    });
  }
}

// Uso en componentes:
function DailyCardExperience() {
  const { user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      trackLimitValidation({
        component: 'DailyCard',
        userPlan: user.subscriptionPlan,
        count: user.dailyCardCount,
        limit: user.dailyCardLimit,
        action: hasReachedDailyCardLimit ? 'blocked' : 'allowed',
        modalShown: isAuthenticatedLimitReached,
      });
    }
  }, [hasReachedDailyCardLimit]);
}
```

---

### 5. Documentación Viva

**Crear ADR (Architecture Decision Record)**:

```markdown
<!-- docs/architecture/ADR-003-dual-store-limits.md -->

# ADR 003: Sistema Dual de Estado para Límites de Usuario

## Status

Accepted

## Context

Necesitamos validar límites de lecturas en frontend (UX) y backend (seguridad).
Frontend usa React Query para data fetching y Zustand para auth state.

## Decision

Usar DOS sistemas de estado:

1. React Query: Data fetching con cache
2. Zustand: Auth state con persistencia localStorage

## Consequences

### Positivo

- React Query maneja cache y refetch automático
- Zustand persiste auth entre reloads
- Cada uno optimizado para su caso de uso

### Negativo

- Estado duplicado (user data en ambos)
- Sincronización manual necesaria
- Fácil causar bugs si no se sincronizan

### Mitigación

- Llamar `checkAuth()` después de TODA mutation que cambie límites
- Invalidar React Query queries al mismo tiempo
- Tests E2E verifican ambos stores sincronizados

## References

- `frontend/docs/BUG_LIMITS_VALIDATION_HISTORY.md`
- `frontend/src/stores/authStore.ts`
- `frontend/src/hooks/api/useUser.ts`
```

---

## 🧪 Tests de Validación

### Suite Manual de Tests (Para QA)

**Copiar y pegar en ticket de QA**:

```
SUITE: Validación de Límites FREE User
Usuario de prueba: free@test.com / Test123456!

Pre-requisito: Reset límites
- Backend: DELETE FROM usage_limit WHERE user_id = 2;
- Backend: DELETE FROM daily_readings WHERE user_id = 2;
- Backend: DELETE FROM tarot_reading WHERE "userId" = 2;

TEST 1: Carta del Día - Primera Vez
1. Login como free@test.com
2. Ir a /carta-del-dia
3. ✅ PASS: Muestra carta boca abajo (NO modal)
4. Click en carta para revelar
5. ✅ PASS: Carta se revela con interpretación
6. ✅ PASS: NO muestra modal de límite
7. Estado esperado: dailyCardCount = 1

TEST 2: Carta del Día - Segunda Visita
1. (Continuar de TEST 1)
2. Navegar a Home
3. Regresar a /carta-del-dia
4. ✅ PASS: Muestra modal "Ya recibiste tu carta del día"
5. ✅ PASS: Mensaje "1 de 1 carta hoy"
6. ❌ FAIL si: Muestra carta revelada en lugar de modal

TEST 3: Nueva Lectura - Primera Vez
1. Navegar a /ritual/tirada
2. ✅ PASS: Muestra selector de tiradas (NO modal)
3. Seleccionar "Tirada de 1 Carta"
4. Click en Carta 1
5. Click en "Revelar mi destino"
6. Esperar ~10 segundos
7. ✅ PASS: Muestra lectura completa
8. ✅ PASS: NO muestra modal de límite
9. Estado esperado: tarotReadingsCount = 1

TEST 4: Nueva Lectura - Segunda Visita
1. (Continuar de TEST 3)
2. Navegar a Home
3. Regresar a /ritual/tirada
4. ✅ PASS: Muestra modal "Límite de tiradas alcanzado"
5. ✅ PASS: Mensaje "1 de 1 tirada"
6. ❌ FAIL si: Muestra selector de tiradas en lugar de modal

TEST 5: Logout desde Modal
1. (Continuar de TEST 4, estando en modal)
2. Click en menú usuario (F)
3. Click en "Cerrar Sesión"
4. ✅ PASS: Redirige a home (/)
5. ✅ PASS: Muestra landing page con "Iniciar Sesión"
6. ❌ FAIL si: Queda en /ritual/tirada o muestra error

TEST 6: Logout desde Carta del Día Modal
1. Login como free@test.com (con límite ya usado)
2. Ir a /carta-del-dia
3. Verificar modal "Ya recibiste tu carta"
4. Click en menú usuario
5. Click en "Cerrar Sesión"
6. ✅ PASS: Redirige a home (/)
7. ❌ FAIL si: Muestra carta boca abajo en lugar de redirigir

CRITERIO DE ÉXITO: Todos los tests PASS (6/6)
```

---

### Tests Unitarios Críticos

**Agregar a `SpreadSelector.test.tsx`**:

```typescript
describe('SpreadSelector - Límites', () => {
  it('debe permitir lectura cuando count < limit', () => {
    const user = mockUser({
      tarotReadingsCount: 0,
      tarotReadingsLimit: 1,
    });

    const { result } = renderHook(() => hasReachedTarotLimit(user));

    expect(result).toBe(false); // Puede crear
  });

  it('debe bloquear lectura cuando count === limit', () => {
    const user = mockUser({
      tarotReadingsCount: 1,
      tarotReadingsLimit: 1,
    });

    const { result } = renderHook(() => hasReachedTarotLimit(user));

    expect(result).toBe(true); // Debe bloquear (>= no >)
  });

  it('debe usar fallback de 1 cuando limit es undefined', () => {
    const user = mockUser({
      tarotReadingsCount: 0,
      tarotReadingsLimit: undefined,
    });

    const { result } = renderHook(() => hasReachedTarotLimit(user));

    expect(result).toBe(false); // 0 >= 1 = false
  });

  it('REGRESIÓN: debe usar >= NO >', () => {
    const user = mockUser({
      tarotReadingsCount: 1,
      tarotReadingsLimit: 1,
    });

    // Este test existe específicamente para prevenir regresión
    // de cambiar >= a >
    const result = user.tarotReadingsCount >= user.tarotReadingsLimit;

    expect(result).toBe(true);
  });
});
```

---

## 📊 Resumen de Cambios (Esta Iteración)

| Archivo                   | Líneas  | Cambio                                                                | Impacto                                 |
| ------------------------- | ------- | --------------------------------------------------------------------- | --------------------------------------- |
| `authStore.ts`            | 102-117 | Agregado redirect al home en logout                                   | 🔴 CRÍTICO - Evita estado inconsistente |
| `DailyCardExperience.tsx` | 126-132 | Corregido `currentReading` para ignorar cache cuando límite alcanzado | 🔴 CRÍTICO - Evita mostrar carta vieja  |
| `useReadings.ts`          | 138     | Agregado `checkAuth()` en `onSuccess`                                 | 🔴 CRÍTICO - Sincroniza authStore       |
| `SpreadSelector.tsx`      | 179     | Cambiado fallback de `?? 0` a `?? 1`                                  | 🔴 CRÍTICO - Permite primera lectura    |

**Total**: 4 archivos, ~15 líneas de código cambiadas

---

## 🚀 Próximos Pasos Recomendados

### Corto Plazo (Esta Sprint)

1. ✅ Hacer commit con mensaje descriptivo
2. ✅ Crear PR con link a este documento
3. ⬜ Ejecutar suite manual de QA (TEST 1-6)
4. ⬜ Pedir code review enfocado en puntos frágiles
5. ⬜ Merge solo después de QA pass

### Mediano Plazo (Próxima Sprint)

1. ⬜ Crear tests E2E automatizados con Playwright
2. ⬜ Integrar tests en CI/CD
3. ⬜ Crear helper `invalidateUserData()` para mutations
4. ⬜ Agregar tracking de límites a Sentry/PostHog

### Largo Plazo (Deuda Técnica)

1. ⬜ Evaluar unificar en single source of truth (React Query SOLO)
2. ⬜ Refactorizar authStore para solo manejar tokens
3. ⬜ Crear abstracción de "Limit Service" que encapsule lógica
4. ⬜ Documentar en Storybook los estados del componente

---

## 📝 Historial de Iteraciones

| Fecha   | Iteración | Bug Principal                             | Causa Root                      | Solución                        |
| ------- | --------- | ----------------------------------------- | ------------------------------- | ------------------------------- |
| 2025-12 | #1        | Modal en primera lectura                  | Comparador `>` en lugar de `>=` | Cambiado a `>=`                 |
| 2025-12 | #2        | Modal en primera lectura (again)          | Fallback `?? 0`                 | Cambiado a `?? 1`               |
| 2026-01 | #3        | Carta vieja mostrada en lugar de modal    | React Query cache persiste      | Ignorar cache cuando límite     |
| 2026-01 | #4        | Modal no aparece en segunda visita tirada | authStore no actualizado        | Agregado `checkAuth()`          |
| 2026-01 | #5        | Logout no redirige                        | Falta navegación en `logout()`  | Agregado `window.location.href` |

**Total iteraciones**: 5+  
**Tiempo perdido acumulado**: ~10-15 horas de desarrollo + QA

---

## 🎯 Conclusión

Este bug es recurrente porque:

1. **Arquitectura inherentemente frágil**: Estado distribuido + Cache múltiples
2. **Lógica contraintuitiva**: `>=` vs `>` confunde a desarrolladores
3. **Falta de tests automatizados**: Regresiones no se detectan antes de deploy
4. **Documentación dispersa**: Conocimiento en comentarios, no centralizado

**Para romper el ciclo**, necesitamos:

1. ✅ Esta documentación exhaustiva (que estás leyendo)
2. ⬜ Tests E2E que corran en CI/CD
3. ⬜ Code review checklist específico
4. ⬜ Refactor a largo plazo de arquitectura

**Si este bug aparece de nuevo:**

1. Lee este documento de arriba a abajo
2. Ejecuta suite manual TEST 1-6
3. Revisa los 5 puntos frágiles
4. Agrega nuevo caso a este documento
5. Considera que quizás es momento del refactor grande

---

## 🏆 Solución Arquitectural Recomendada

### Opción 1: Backend-Driven UI (RECOMENDADA)

**Principio**: El backend controla QUÉ puede hacer el usuario, el frontend solo renderiza.

#### Cambio Fundamental

**❌ ACTUAL**: Backend retorna contadores, frontend calcula límites

```json
{
  "dailyCardCount": 1,
  "dailyCardLimit": 1
}
```

Frontend: `if (count >= limit) showModal()`

**✅ IDEAL**: Backend retorna capabilities, frontend renderiza

```json
{
  "capabilities": {
    "canCreateDailyReading": false,
    "dailyReadingStatus": {
      "used": 1,
      "limit": 1,
      "message": "Ya recibiste tu carta del día",
      "nextAvailable": "2026-01-09T00:00:00Z"
    }
  }
}
```

Frontend: `if (!capabilities.canCreateDailyReading) showModal(capabilities.message)`

#### Beneficios

| Aspecto                      | Antes                              | Después            |
| ---------------------------- | ---------------------------------- | ------------------ |
| **Lógica duplicada**         | Backend + Frontend calculan        | Solo Backend       |
| **Fuentes de verdad**        | 2 (RQ + Zustand)                   | 1 (Backend)        |
| **Tests necesarios**         | E2E + Unit Frontend + Unit Backend | E2E + Unit Backend |
| **Probabilidad regresión**   | 🔴 Alta (5/5)                      | 🟢 Baja (1/5)      |
| **Tiempo agregar límite**    | 2-3 horas                          | 30 min             |
| **Complejidad para juniors** | 🔴 Muy alta                        | 🟢 Baja            |

#### Estado del Código

📊 **Análisis completo**: Ver [ANALISIS_BACKEND_VS_FRONTEND.md](../../ANALISIS_BACKEND_VS_FRONTEND.md)

**Distribución del problema**:

- 🔴 **Backend (40%)**: Falta implementar capabilities. Backend valida correctamente pero NO retorna `canCreateDailyReading: boolean`.
- 🔴 **Frontend (60%)**: Arquitectura frágil con lógica duplicada + dual store (React Query + Zustand)

**Veredicto**: Backend NO está listo para Opción 1. Necesita:

1. Agregar DTO de capabilities
2. Crear UserCapabilitiesService
3. Modificar endpoint `/users/profile` para retornar capabilities

**Estimación**:

- Backend (agregar capabilities): 1 semana
- Frontend (usar capabilities): 1 semana
- Eliminar Zustand para user data: 1 semana
- **Total**: ~3 semanas vs 15+ horas perdidas en 5 iteraciones

#### Plan de Implementación

Ver [ANALISIS_BACKEND_VS_FRONTEND.md](../../ANALISIS_BACKEND_VS_FRONTEND.md) sección "Plan de Migración Recomendado" para:

- Código exacto de capabilities DTO
- Implementación de UserCapabilitiesService
- Migración gradual del frontend
- Estrategia de eliminación de Zustand

**Próxima acción sugerida**: Crear issue/ticket para implementar capabilities en backend como deuda técnica prioritaria.

---

**Última actualización**: 8 Enero 2026  
**Autor**: AI Assistant + Equipo Auguria  
**Próxima revisión**: Cuando aparezca iteración #6 🙃
