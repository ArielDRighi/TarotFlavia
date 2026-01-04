# Copilot Code Review Instructions - Auguria

> 📋 **Propósito:** Este documento proporciona contexto completo del proyecto para que Copilot realice revisiones de código más precisas y evite sugerencias que contradigan los contratos ya definidos.

---

## 🎯 Contexto del Proyecto

Auguria es un **monorepo** con:

```
tarot/
├── backend/tarot-app/     # NestJS API (puerto 3000)
└── frontend/              # Next.js App (puerto 3001)
```

---

## 🔧 Backend (NestJS)

### Stack Tecnológico

- **Framework:** NestJS 10.x (TypeScript)
- **ORM:** TypeORM 0.3.x
- **Database:** PostgreSQL 16
- **AI Providers:** Groq Llama 3.1 70B (principal), OpenAI GPT-4, DeepSeek (fallback)
- **Testing:** Jest (TDD)

### Arquitectura

- **Feature-Based Modules** con capas internas (domain/, application/, infrastructure/)
- **Repository Pattern** con interfaces
- **CQRS** selectivo en módulos complejos

### ⚠️ CONTRATOS DE API DEFINIDOS (NO MODIFICAR)

#### IDs son NUMÉRICOS

El backend usa **IDs numéricos** en todas las entidades:

```typescript
// ✅ CORRECTO - Backend usa números
{
  "id": 123,
  "userId": 1,
  "spreadId": 2,
  "tarotistaId": 1
}

// ❌ INCORRECTO - No son strings
{
  "id": "123",
  "userId": "uuid-here"
}
```

#### Paginación del Backend

El backend retorna paginación con este formato:

```typescript
// ✅ CORRECTO - Formato real del backend
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}

// ❌ INCORRECTO - Este formato NO es del backend
{
  "data": [...],
  "meta": {
    "pageSize": 10,      // NO existe
    "hasNextPage": true  // NO existe
  }
}
```

#### Endpoints Principales

```typescript
// Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

// Users
GET    /api/users/me
PATCH  /api/users/me
PATCH  /api/users/me/password

// Readings
POST   /api/readings                    // Crear lectura
GET    /api/readings                    // Listar lecturas (paginado)
GET    /api/readings/:id                // Obtener lectura
DELETE /api/readings/:id                // Soft delete
POST   /api/readings/:id/restore        // Restaurar
POST   /api/readings/:id/regenerate     // Regenerar interpretación
POST   /api/readings/:id/share          // Compartir

// Catálogos
GET    /api/categories                  // Categorías
GET    /api/predefined-questions        // Preguntas predefinidas
GET    /api/spreads                     // Tipos de tiradas
GET    /api/spreads/:id                 // Detalle de tirada
GET    /api/cards                       // Catálogo de cartas

// Trash
GET    /api/readings/trash              // Lecturas eliminadas
```

---

## 🎨 Frontend (Next.js)

### Stack Tecnológico

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (global) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios con interceptors JWT
- **Testing:** Vitest + Testing Library

### Arquitectura Feature-Based

```
frontend/src/
├── app/                # Solo rutas y layouts (NO lógica)
├── components/
│   ├── ui/            # shadcn/ui base
│   └── features/      # Componentes de negocio por dominio
├── hooks/
│   ├── api/           # React Query hooks
│   └── utils/         # Utility hooks
├── stores/            # Zustand stores
├── lib/
│   ├── api/           # Axios config + endpoints + API functions
│   └── validations/   # Zod schemas
└── types/             # TypeScript types
```

### Convenciones de Nomenclatura

```typescript
// Componentes: PascalCase.tsx
ReadingCard.tsx;
LoginForm.tsx;

// Hooks: camelCase.ts con prefijo 'use'
useReadings.ts;
useAuth.ts;

// Stores: camelCase.ts con sufijo 'Store'
authStore.ts;
readingStore.ts;

// Tests: nombre.test.tsx
ReadingCard.test.tsx;
useReadings.test.ts;

// API functions: kebab-case.ts
readings - api.ts;
auth - api.ts;
```

### Endpoints Centralizados

Los endpoints deben definirse en `lib/api/endpoints.ts`:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    ME: "/users/me",
    UPDATE_PASSWORD: "/users/me/password",
  },
  READINGS: {
    BASE: "/readings",
    BY_ID: (id: number) => `/readings/${id}`,
    TRASH: "/readings/trash",
    RESTORE: (id: number) => `/readings/${id}/restore`,
    REGENERATE: (id: number) => `/readings/${id}/regenerate`,
    SHARE: (id: number) => `/readings/${id}/share`,
  },
  CATEGORIES: {
    BASE: "/categories",
  },
  PREDEFINED_QUESTIONS: {
    BASE: "/predefined-questions",
  },
  SPREADS: {
    BASE: "/spreads",
    BY_ID: (id: number) => `/spreads/${id}`,
  },
} as const;
```

---

## 📏 Reglas de Code Review

### ✅ VERIFICAR

1. **Tipos coinciden con Backend:** Los tipos TypeScript del frontend deben reflejar exactamente el contrato del backend
2. **Endpoints centralizados:** Usar `API_ENDPOINTS` en lugar de strings hardcodeados
3. **TDD:** Tests deben existir para nueva funcionalidad
4. **Separation of Concerns:**
   - `app/` solo rutas
   - `components/` solo UI
   - `hooks/` lógica y data fetching
   - `lib/` utilidades y API calls
5. **Coverage ≥ 80%**
6. **Sin `any` ni `@ts-ignore`**

### ❌ NO SUGERIR (Falsos Positivos Comunes)

1. **Cambiar IDs de `number` a `string`** - El backend usa IDs numéricos
2. **Cambiar `PaginationMeta` con campos que no existen** - Usar `limit`/`totalItems`, no `pageSize`/`hasNextPage`
3. **Usar `PaginatedResponse<T>` genérico** si no coincide con respuesta real del backend
4. **Importar de rutas incorrectas** - Respetar alias `@/`

### ⚠️ CUANDO DUDAR

Si un tipo o estructura parece "inconsistente", verificar primero:

1. `backend/tarot-app/docs/API_DOCUMENTATION.md` - Contratos de API
2. `frontend/docs/ARCHITECTURE.md` - Arquitectura y convenciones
3. `frontend/docs/AI_DEVELOPMENT_GUIDE.md` - Workflow de desarrollo

---

## 📚 Documentación de Referencia

### Backend

| Documento                                     | Propósito                                     |
| --------------------------------------------- | --------------------------------------------- |
| `backend/tarot-app/docs/API_DOCUMENTATION.md` | Contratos de API, endpoints, request/response |
| `backend/tarot-app/docs/ARCHITECTURE.md`      | Arquitectura y patrones del backend           |
| `backend/tarot-app/docs/DATABASE.md`          | Esquema de base de datos                      |
| `backend/tarot-app/docs/TESTING.md`           | Estrategia de testing                         |

### Frontend

| Documento                               | Propósito                  |
| --------------------------------------- | -------------------------- |
| `frontend/docs/ARCHITECTURE.md`         | Arquitectura feature-based |
| `frontend/docs/AI_DEVELOPMENT_GUIDE.md` | Workflow TDD y reglas      |
| `frontend/docs/FRONTEND_BACKLOG.md`     | Tareas y estado actual     |
| `frontend/docs/DESIGN_HAND-OFF.md`      | Design tokens y UI         |

---

## 🔍 Ejemplos de Reviews Correctos vs Incorrectos

### ❌ Review Incorrecto

```
"Consider using string IDs instead of numbers for better consistency with UUID patterns"
```

**Por qué está mal:** El backend usa IDs numéricos. Cambiarlos rompería la compatibilidad.

### ✅ Review Correcto

```
"The endpoint string '/readings' should use API_ENDPOINTS.READINGS.BASE for consistency"
```

**Por qué está bien:** Mejora la mantenibilidad sin romper contratos.

---

### ❌ Review Incorrecto

```
"PaginationMeta should include 'hasNextPage' and 'hasPreviousPage' for better UX"
```

**Por qué está mal:** El backend no retorna esos campos. La lógica de navegación se calcula en frontend.

### ✅ Review Correcto

```
"Consider adding a helper function to calculate hasNextPage from totalPages and current page"
```

**Por qué está bien:** No cambia el contrato, sugiere mejora de UX en frontend.

---

## 🎯 Prioridades de Review

1. **🔴 Crítico:** Rompe contrato con backend, introduce bugs
2. **🟠 Importante:** No sigue arquitectura, falta testing
3. **🟡 Mejora:** Optimización, refactoring, claridad de código
4. **🟢 Nitpick:** Estilo, convenciones menores

---

**Última actualización:** 5 Diciembre 2025
