# Análisis: Backend vs Frontend - Sistema de Límites

> **TL;DR**: ❌ **El backend NO está preparado para Opción 1**. Solo retorna contadores, no capabilities. El problema es 50% backend + 50% frontend.

**Fecha**: 8 Enero 2026  
**Contexto**: Análisis post-bug recurrente de validación de límites

---

## 🔍 Estado Actual del Backend

### ✅ Lo que el Backend SÍ hace bien

#### 1. **Validación Autoritaria de Límites**

```typescript
// daily-reading.service.ts - Líneas 88-104
// ✅ Backend valida ANTES de permitir creación
const hasLimit = await this.usageLimitsService.checkLimit(userId, UsageFeature.DAILY_CARD);

if (!hasLimit) {
  throw new ForbiddenException("Has alcanzado tu límite de carta del día.");
}
```

**✅ Correcto**: Backend es la autoridad final, frontend no puede bypasear.

---

#### 2. **Lógica de Negocio Centralizada**

```typescript
// usage-limits.service.ts - Líneas 22-68
async checkLimit(userId: number, feature: UsageFeature): Promise<boolean> {
  const user = await this.usersService.findById(userId);

  // Obtener límite del plan
  let limit: number;
  if (feature === UsageFeature.DAILY_CARD) {
    limit = await this.planConfigService.getDailyCardLimit(user.plan);
  } else if (feature === UsageFeature.TAROT_READING) {
    limit = await this.planConfigService.getTarotReadingsLimit(user.plan);
  }

  // Premium = -1 (ilimitado)
  if (limit === -1) {
    return true;
  }

  // Comparar con uso actual
  const usageRecord = await this.usageLimitRepository.findOne({
    where: { userId, feature, date: dateString }
  });

  const currentCount = usageRecord?.count || 0;
  return currentCount < limit; // ✅ Correcto: usa <
}
```

**✅ Correcto**: Lógica compleja (planes, límites, contadores) está en backend.

---

#### 3. **Respuesta con Contadores Detallados**

```typescript
// users.controller.ts - Líneas 48-118
async getProfile(@Request() req) {
  const user = await this.usersService.findById(userId);

  // Obtener límites del plan
  const dailyCardLimit = await this.planConfigService.getDailyCardLimit(user.plan);
  const tarotReadingsLimit = await this.planConfigService.getTarotReadingsLimit(user.plan);

  // Obtener uso restante
  const dailyCardRemaining = await this.usageLimitsService.getRemainingUsage(
    userId,
    UsageFeature.DAILY_CARD,
  );
  const tarotReadingsRemaining = await this.usageLimitsService.getRemainingUsage(
    userId,
    UsageFeature.TAROT_READING,
  );

  // Calcular contadores
  const dailyCardCount = dailyCardLimit === -1 ? 0 : Math.max(0, dailyCardLimit - dailyCardRemaining);
  const tarotReadingsCount = tarotReadingsLimit === -1 ? 0 : Math.max(0, tarotReadingsLimit - tarotReadingsRemaining);

  return {
    ...result,
    dailyCardCount,
    dailyCardLimit: dailyCardLimit === -1 ? 999999 : dailyCardLimit,
    tarotReadingsCount,
    tarotReadingsLimit: tarotReadingsLimit === -1 ? 999999 : tarotReadingsLimit,
  };
}
```

**✅ Correcto**: Backend calcula y retorna contadores precisos.

---

### ❌ Lo que el Backend NO hace (pero debería para Opción 1)

#### 1. **NO retorna Capabilities**

**Response actual** (`GET /api/users/profile`):

```json
{
  "id": 1,
  "email": "user@test.com",
  "plan": "FREE",
  "dailyCardCount": 1,
  "dailyCardLimit": 1,
  "tarotReadingsCount": 0,
  "tarotReadingsLimit": 1
}
```

**❌ Problema**: Frontend debe calcular `canCreateDailyReading = dailyCardCount >= dailyCardLimit`.

**Response ideal** (Opción 1 - Backend-Driven UI):

```json
{
  "id": 1,
  "email": "user@test.com",
  "plan": "FREE",

  // ✅ Backend dice QUÉ puede hacer el usuario
  "capabilities": {
    "canCreateDailyReading": false,
    "canCreateTarotReading": true,
    "dailyReadingStatus": {
      "used": 1,
      "limit": 1,
      "nextAvailable": "2026-01-09T00:00:00Z",
      "message": "Ya recibiste tu carta del día hoy"
    },
    "tarotReadingStatus": {
      "used": 0,
      "limit": 1,
      "resetsDaily": true
    }
  }
}
```

---

#### 2. **NO provee mensajes de UI**

**Comparación**:

| Backend Actual                             | Backend Ideal (Opción 1)                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `{ dailyCardCount: 1, dailyCardLimit: 1 }` | `{ canCreateDailyReading: false, message: "Ya recibiste tu carta del día" }` |
| Frontend calcula mensaje                   | Backend provee mensaje listo para UI                                         |
| Frontend decide qué mostrar                | Backend controla UX                                                          |

---

#### 3. **NO indica timing de próxima disponibilidad**

**Actual**:

- Frontend debe asumir: "Si límite alcanzado, disponible mañana"
- No sabe hora exacta de reset

**Ideal**:

```json
{
  "dailyReadingStatus": {
    "nextAvailable": "2026-01-09T00:00:00Z",
    "hoursUntilReset": 8
  }
}
```

---

## 🔍 Estado Actual del Frontend

### ❌ Lo que el Frontend hace MAL

#### 1. **Duplica Lógica de Negocio**

```typescript
// SpreadSelector.tsx - Frontend
const tarotCount = user.tarotReadingsCount ?? 0;
const tarotLimit = user.tarotReadingsLimit ?? 1;
const hasReachedLimit = tarotCount >= tarotLimit; // ❌ Lógica duplicada

// usage-limits.service.ts - Backend
const currentCount = usageRecord?.count || 0;
return currentCount < limit; // ✅ Lógica original
```

**❌ Problema**:

- Backend usa `<`
- Frontend usa `>=`
- Aunque matemáticamente equivalentes, es confuso y propenso a errores
- Si cambia regla de negocio, hay que cambiar 2 lugares

---

#### 2. **Tiene Comparadores Inconsistentes**

```typescript
// DailyCardExperience.tsx
const hasReachedDailyCardLimit = dailyCardCount >= dailyCardLimit; // ✅ Correcto

// SpreadSelector.tsx (ANTES del fix)
const tarotLimit = user.tarotReadingsLimit ?? 0; // ❌ Fallback incorrecto
return tarotCount >= tarotLimit; // ❌ 0 >= 0 = true (bug!)

// SpreadSelector.tsx (DESPUÉS del fix)
const tarotLimit = user.tarotReadingsLimit ?? 1; // ✅ Fallback correcto
return tarotCount >= tarotLimit; // ✅ Correcto ahora
```

**❌ Problema**: Es fácil introducir bugs con fallbacks incorrectos.

---

#### 3. **Confunde Roles de React Query vs Zustand**

```typescript
// ❌ Usuario data duplicado en DOS lugares:

// 1. Zustand (authStore)
export const useAuthStore = create<AuthStore>()(
  persist((set, get) => ({
    user: {
      dailyCardCount: 1,
      dailyCardLimit: 1,
      // ... más campos
    },
  }))
);

// 2. React Query
export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => apiClient.get("/users/profile"),
  });
}

// ❌ Diferentes componentes leen de lugares diferentes
// SpreadSelector → useAuth() → Zustand
// Profile Page → useUser() → React Query
```

**❌ Problema**:

- Single Source of Truth violado
- Difícil sincronizar ambos
- Causa bugs cuando uno se actualiza pero el otro no

---

#### 4. **Tiene Lógica Frágil de Estado Local**

```typescript
// DailyCardExperience.tsx
const [localReading, setLocalReading] = useState<DailyReading | null>(null);
const { data: dailyReading } = useDailyReadingToday({ enabled: !hasReachedLimit });

// ❌ Lógica compleja para distinguir "recién creada" vs "regresando"
const currentReading = localReading || (!hasReachedDailyCardLimit ? dailyReading : null);

const isAuthenticatedLimitReached =
  isAuthenticated &&
  hasReachedDailyCardLimit &&
  !localReading && // ❌ Sutil: depende de estado de sesión
  !isCreatingReading &&
  !isRevealing;
```

**❌ Problema**:

- Distinguir "recién creada" vs "regresando" requiere lógica compleja
- `localReading` se borra al refrescar → comportamiento diferente
- Fácil introducir bugs al simplificar o cambiar

---

### ✅ Lo que el Frontend hace BIEN

#### 1. **Validación Preventiva (UX)**

```typescript
// ✅ Muestra modal ANTES de llamar API
if (hasReachedDailyCardLimit) {
  return <DailyCardLimitReached />;
}

// ✅ Evita request innecesario y mejora UX
```

**✅ Correcto**: Es bueno validar en frontend para UX rápida.

---

#### 2. **Manejo de Errores del Backend**

```typescript
// ✅ Si frontend falla validación, backend catch
createDailyReading(undefined, {
  onError: (err) => {
    if (isAxiosError(err) && err.response?.status === 403) {
      // ✅ Backend rechazó → Mostrar mensaje apropiado
      setAuthenticatedError(err);
    }
  },
});
```

**✅ Correcto**: Frontend respeta autoridad del backend.

---

## 🎯 Diagnóstico Final

### ¿Quién tiene la culpa?

| Aspecto                         | Backend                            | Frontend                                 | Solución                              |
| ------------------------------- | ---------------------------------- | ---------------------------------------- | ------------------------------------- |
| **Lógica de negocio duplicada** | ❌ No provee capabilities          | ❌ Calcula límites manualmente           | Backend debe retornar capabilities    |
| **Comparadores confusos**       | ⚠️ Usa `<` (correcto pero confuso) | ❌ Usa `>=` (equivalente pero diferente) | Unificar notación o usar capabilities |
| **Dual Store (RQ + Zustand)**   | ✅ N/A (backend solo retorna JSON) | ❌ Arquitectura frágil                   | Eliminar Zustand para user data       |
| **Estado local complejo**       | ✅ N/A                             | ❌ `localReading` es muy sutil           | Capabilities eliminarían necesidad    |
| **Sincronización manual**       | ⚠️ Requiere llamar checkAuth()     | ❌ Olvida sincronizar                    | Backend-driven eliminaría problema    |

**Conclusión**:

- 🔴 **Backend: 40% culpable** - No implementa patrón Backend-Driven UI
- 🔴 **Frontend: 60% culpable** - Arquitectura frágil con lógica duplicada

---

## 📊 Comparación: Actual vs Ideal

### Flujo Actual (PROBLEMÁTICO)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Frontend llama GET /users/profile                    │
│    Backend retorna: { dailyCardCount: 1, limit: 1 }    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend CALCULA:                                     │
│    const hasReached = count >= limit  // ❌ Duplica     │
│    if (hasReached) showModal()                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Si frontend falla validación (bug):                  │
│    - Usuario intenta crear lectura                      │
│    - Backend rechaza con 403                            │
│    - Mala UX (usuario ve error después de click)        │
└─────────────────────────────────────────────────────────┘
```

**Problemas**:

- ❌ Lógica duplicada (fuente de bugs)
- ❌ Comparadores confusos (`<` vs `>=`)
- ❌ Frontend debe calcular capabilities
- ❌ Si cálculo falla → Mala UX

---

### Flujo Ideal (BACKEND-DRIVEN)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Frontend llama GET /users/profile                    │
│    Backend retorna:                                      │
│    {                                                     │
│      capabilities: {                                     │
│        canCreateDailyReading: false,  // ✅ Backend      │
│        message: "Ya recibiste tu carta del día"         │
│      }                                                   │
│    }                                                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend SOLO RENDERIZA:                             │
│    if (!capabilities.canCreateDailyReading) {           │
│      return <Modal message={capabilities.message} />    │
│    }                                                     │
│    // ✅ NO calcula, NO duplica lógica                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Si usuario intenta bypassear frontend:               │
│    - Backend SIEMPRE rechaza (validación autoritaria)   │
│    - Frontend confía en backend (single source)         │
└─────────────────────────────────────────────────────────┘
```

**Ventajas**:

- ✅ ZERO lógica duplicada
- ✅ Backend controla UX (mensajes, timing)
- ✅ Frontend super simple (solo renderiza)
- ✅ Agregar nuevas capabilities es trivial
- ✅ Tests más fáciles (mock capabilities)

---

## 🚀 Plan de Migración Recomendado

### Fase 1: Backend - Agregar Capabilities (1 semana)

#### Paso 1.1: Crear DTO de Capabilities

```typescript
// backend/src/modules/users/dto/user-capabilities.dto.ts

export class DailyReadingStatusDto {
  used: number;
  limit: number;
  nextAvailable: string | null;
  message: string | null;
}

export class TarotReadingStatusDto {
  used: number;
  limit: number;
  resetsDaily: boolean;
}

export class UserCapabilitiesDto {
  canCreateDailyReading: boolean;
  canCreateTarotReading: boolean;
  dailyReadingStatus: DailyReadingStatusDto;
  tarotReadingStatus: TarotReadingStatusDto;
}

export class UserProfileResponseDto {
  id: number;
  email: string;
  name: string;
  plan: UserPlan;

  // ✅ NUEVO: Backend indica QUÉ puede hacer
  capabilities: UserCapabilitiesDto;

  // ⚠️ DEPRECATED: Mantener por compatibilidad (eliminar en v2)
  dailyCardCount: number;
  dailyCardLimit: number;
  tarotReadingsCount: number;
  tarotReadingsLimit: number;
}
```

#### Paso 1.2: Crear Servicio de Capabilities

```typescript
// backend/src/modules/users/services/user-capabilities.service.ts

@Injectable()
export class UserCapabilitiesService {
  constructor(
    private readonly usageLimitsService: UsageLimitsService,
    private readonly planConfigService: PlanConfigService
  ) {}

  async getUserCapabilities(userId: number, userPlan: UserPlan): Promise<UserCapabilitiesDto> {
    // Obtener límites del plan
    const dailyCardLimit = await this.planConfigService.getDailyCardLimit(userPlan);
    const tarotLimit = await this.planConfigService.getTarotReadingsLimit(userPlan);

    // Obtener uso actual
    const dailyCardRemaining = await this.usageLimitsService.getRemainingUsage(userId, UsageFeature.DAILY_CARD);
    const tarotRemaining = await this.usageLimitsService.getRemainingUsage(userId, UsageFeature.TAROT_READING);

    // Calcular capabilities
    const dailyCardUsed = dailyCardLimit === -1 ? 0 : Math.max(0, dailyCardLimit - dailyCardRemaining);
    const tarotUsed = tarotLimit === -1 ? 0 : Math.max(0, tarotLimit - tarotRemaining);

    // ✅ Backend decide capabilities
    const canCreateDailyReading = dailyCardRemaining > 0 || dailyCardLimit === -1;
    const canCreateTarotReading = tarotRemaining > 0 || tarotLimit === -1;

    // ✅ Backend provee mensajes para UI
    const dailyMessage = canCreateDailyReading
      ? null
      : `Ya recibiste tu carta del día. Obtuviste ${dailyCardUsed} de ${dailyCardLimit} carta hoy.`;

    // ✅ Backend calcula próxima disponibilidad
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      canCreateDailyReading,
      canCreateTarotReading,
      dailyReadingStatus: {
        used: dailyCardUsed,
        limit: dailyCardLimit === -1 ? 999999 : dailyCardLimit,
        nextAvailable: canCreateDailyReading ? null : tomorrow.toISOString(),
        message: dailyMessage,
      },
      tarotReadingStatus: {
        used: tarotUsed,
        limit: tarotLimit === -1 ? 999999 : tarotLimit,
        resetsDaily: true,
      },
    };
  }
}
```

#### Paso 1.3: Actualizar Controller

```typescript
// backend/src/modules/users/controllers/users.controller.ts

@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  const userId = req.user.userId;
  const user = await this.usersService.findById(userId);

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  // ✅ NUEVO: Obtener capabilities
  const capabilities = await this.userCapabilitiesService.getUserCapabilities(
    userId,
    user.plan,
  );

  // ⚠️ MANTENER campos legacy por compatibilidad
  const dailyCardLimit = await this.planConfigService.getDailyCardLimit(user.plan);
  const tarotLimit = await this.planConfigService.getTarotReadingsLimit(user.plan);
  // ... (resto del cálculo legacy)

  const { password: _password, ...result } = user;

  return {
    ...result,
    // ✅ NUEVO: Capabilities
    capabilities,
    // ⚠️ DEPRECATED: Mantener por compatibilidad
    dailyCardCount: capabilities.dailyReadingStatus.used,
    dailyCardLimit: capabilities.dailyReadingStatus.limit,
    tarotReadingsCount: capabilities.tarotReadingStatus.used,
    tarotReadingsLimit: capabilities.tarotReadingStatus.limit,
  };
}
```

**Ventaja de mantener legacy**: Frontend puede migrar gradualmente.

---

### Fase 2: Frontend - Migrar a Capabilities (1 semana)

#### Paso 2.1: Actualizar Types

```typescript
// frontend/src/types/user.ts

export interface DailyReadingStatus {
  used: number;
  limit: number;
  nextAvailable: string | null;
  message: string | null;
}

export interface TarotReadingStatus {
  used: number;
  limit: number;
  resetsDaily: boolean;
}

export interface UserCapabilities {
  canCreateDailyReading: boolean;
  canCreateTarotReading: boolean;
  dailyReadingStatus: DailyReadingStatus;
  tarotReadingStatus: TarotReadingStatus;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  plan: UserPlan;

  // ✅ NUEVO
  capabilities: UserCapabilities;

  // ⚠️ DEPRECATED (remover cuando backend elimine)
  dailyCardCount?: number;
  dailyCardLimit?: number;
  tarotReadingsCount?: number;
  tarotReadingsLimit?: number;
}
```

#### Paso 2.2: Simplificar DailyCardExperience

```typescript
// frontend/src/components/features/daily-reading/DailyCardExperience.tsx

export function DailyCardExperience() {
  const { user, isAuthenticated } = useAuth();

  // ❌ ELIMINAR toda esta complejidad:
  // const dailyCardCount = user?.dailyCardCount ?? 0;
  // const dailyCardLimit = user?.dailyCardLimit ?? 1;
  // const hasReachedDailyCardLimit = dailyCardCount >= dailyCardLimit;
  // const [localReading, setLocalReading] = useState(null);
  // const isAuthenticatedLimitReached = ... (lógica compleja)

  // ✅ NUEVO: Backend ya decidió
  if (isAuthenticated && !user?.capabilities.canCreateDailyReading) {
    return (
      <DailyCardLimitReached
        status={user.capabilities.dailyReadingStatus}
      />
    );
  }

  // ✅ Componente ahora es MUCHO más simple
  return <DailyCardReveal />;
}
```

#### Paso 2.3: Simplificar SpreadSelector

```typescript
// frontend/src/components/features/readings/SpreadSelector.tsx

export function SpreadSelector() {
  const { user } = useAuth();

  // ❌ ELIMINAR:
  // const tarotCount = user.tarotReadingsCount ?? 0;
  // const tarotLimit = user.tarotReadingsLimit ?? 1;
  // const hasReachedLimit = tarotCount >= tarotLimit;

  // ✅ NUEVO: Backend ya decidió
  if (!user?.capabilities.canCreateTarotReading) {
    return (
      <TarotReadingLimitReached
        status={user.capabilities.tarotReadingStatus}
      />
    );
  }

  return <SpreadSelectionUI />;
}
```

#### Paso 2.4: Eliminar checkAuth() Manual

```typescript
// ❌ ANTES: Tenías que recordar sincronizar
export function useCreateReading() {
  return useMutation({
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      await useAuthStore.getState().checkAuth(); // ❌ Manual
    },
  });
}

// ✅ DESPUÉS: Auto-refetch por intervalo
export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => apiClient.get("/users/profile"),
    refetchInterval: 30000, // Auto-refetch cada 30s
    refetchOnWindowFocus: true, // Refetch al volver a la ventana
  });
}

// ✅ useCreateReading más simple
export function useCreateReading() {
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] }); // ✅ Suficiente
      toast.success("Lectura creada");
    },
  });
}
```

---

### Fase 3: Eliminar Zustand para User Data (1 semana)

```typescript
// ✅ NUEVO authStore: SOLO tokens, NO user data
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const { access_token, refresh_token } = await apiClient.post("/auth/login", { email, password });
        set({ accessToken: access_token, refreshToken: refresh_token });
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null });
        window.location.href = "/";
      },
    }),
    { name: "auth-storage" }
  )
);

// ✅ NUEVO useAuth: Solo React Query
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      try {
        return await apiClient.get<AuthUser>("/users/profile");
      } catch {
        localStorage.removeItem("access_token");
        return null;
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
```

---

## 📈 Métricas de Éxito

| Métrica                                   | Antes                              | Después Fase 1           | Después Fase 3     |
| ----------------------------------------- | ---------------------------------- | ------------------------ | ------------------ |
| **Líneas de código (validación límites)** | ~150 líneas                        | ~120 líneas              | ~40 líneas         |
| **Fuentes de verdad para user**           | 2 (RQ + Zustand)                   | 2 (RQ + Zustand)         | 1 (RQ)             |
| **Lugares con lógica de límites**         | 3 (Backend + 2 Frontend)           | 2 (Backend + 1 Frontend) | 1 (Backend)        |
| **Tests necesarios**                      | E2E + Unit Frontend + Unit Backend | E2E + Unit Backend       | E2E + Unit Backend |
| **Probabilidad de regresión**             | 🔴 Alta (5/5)                      | 🟡 Media (3/5)           | 🟢 Baja (1/5)      |
| **Tiempo para agregar nuevo límite**      | 2-3 horas                          | 1-2 horas                | 30 min             |
| **Complejidad para junior dev**           | 🔴 Muy alta                        | 🟡 Media                 | 🟢 Baja            |

---

## 🎯 Respuesta a tu Pregunta

> ¿El backend está efectivamente ya bien creado para la opción 1 pero el problema es cómo se manejó el front?

**Respuesta**: ❌ **NO**. El análisis muestra:

### Backend (40% del problema)

- ❌ NO retorna `capabilities` (solo contadores)
- ❌ NO provee mensajes para UI
- ❌ NO indica timing de próxima disponibilidad
- ✅ SÍ valida correctamente (autoridad)
- ✅ SÍ tiene lógica centralizada

**Veredicto Backend**: Está bien estructurado pero **falta la capa de capabilities**.

### Frontend (60% del problema)

- ❌ Duplica lógica de negocio (calcula límites)
- ❌ Arquitectura frágil (Zustand + React Query)
- ❌ Estado local complejo (`localReading`)
- ❌ Sincronización manual (`checkAuth()`)
- ✅ SÍ hace validación preventiva (UX)

**Veredicto Frontend**: Arquitectura necesita refactor completo.

### Distribución de Culpa

```
Backend (implementar capabilities): ████████░░ 40%
Frontend (arquitectura frágil):     ████████████ 60%
```

---

## 💡 Conclusión

**Para implementar Opción 1 correctamente**, necesitas:

1. **Backend**: Agregar endpoint que retorne `capabilities` (1 semana)
2. **Frontend**: Migrar a usar `capabilities` + eliminar Zustand para user (2 semanas)
3. **Total**: ~3 semanas para implementación completa

**¿Vale la pena?**

- ✅ SÍ: Ya has perdido 15+ horas en 5 iteraciones
- ✅ SÍ: El código actual es muy frágil
- ✅ SÍ: Facilitará futuras features (más planes, más límites)

**Alternativa pragmática** (si no tienes 3 semanas):

- Fase 1 SOLO (backend capabilities): 1 semana
- Frontend mantiene arquitectura actual pero usa capabilities
- Ya mejora mucho la situación (elimina lógica duplicada)
- Dejas Zustand + RQ para después

---

**Última actualización**: 8 Enero 2026  
**Autor**: AI Assistant + Team Auguria
