# CLAUDE.md - Auguria Monorepo

> Este archivo es leído automáticamente por Claude Code al inicio de cada sesión.
> Última actualización: Junio 2026

## Proyecto

**Auguria** es un marketplace de tarotistas con lecturas de tarot y servicios
holísticos (carta astral, numerología, horóscopo, péndulo, rituales)
potenciados por IA.

```
tarot/  (monorepo, npm workspaces, Node 20)
├── backend/tarot-app/   # NestJS 11 API + PostgreSQL/TypeORM (puerto 3000)
├── frontend/            # Next.js 16 + React 19 App Router (puerto 3001)
└── docs/                # Workflows, ADRs, backlogs y documentación
```

## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Backend** | NestJS 11, TypeORM 0.3 + PostgreSQL (`pg`), Passport/JWT, Swagger, Throttler, cache-manager, Winston |
| **IA** | OpenAI, Google Gemini (`@google/generative-ai`), Groq SDK |
| **Pagos** | MercadoPago (suscripciones premium / preapproval) |
| **Astrología** | `sweph` (Swiss Ephemeris), `luxon`, `date-fns` |
| **Frontend** | Next.js 16 (App Router), React 19, TanStack Query 5, Zustand 5, Zod, Axios, Tailwind |
| **Tests** | Jest (backend: unit/integration/e2e), Vitest (frontend) |

## Reglas Críticas

### 1. WORKFLOW OBLIGATORIO
**ANTES de cualquier tarea, identificar el tipo y leer el workflow correspondiente:**

| Trigger | Workflow a leer PRIMERO |
|---------|------------------------|
| Tarea backend, API, NestJS | `docs/WORKFLOW_BACKEND.md` |
| Tarea frontend, UI, Next.js | `docs/WORKFLOW_FRONTEND.md` |
| Feedback PR backend | `docs/WORKFLOW_PR_FEEDBACK_BACKEND.md` |
| Feedback PR frontend | `docs/WORKFLOW_PR_FEEDBACK_FRONTEND.md` |

### 2. Git Flow
- **PRs SIEMPRE a `develop`** (NUNCA a `main`)
- Branch naming: `feature/TASK-XXX-descripcion-corta`
- Commits: Conventional Commits (`feat`, `fix`, `refactor`, `test`, `docs`)
- **NO** usar `git commit --amend` para correcciones de PR (crear commit nuevo)

### 3. Contratos de API (NO modificar)
- **IDs son NUMÉRICOS** (nunca strings)
- **Paginación**: `{ data: [], meta: { page, limit, totalItems, totalPages } }`
- **Endpoints centralizados** (frontend): usar la constante `API_ENDPOINTS`
  definida en `frontend/src/lib/api/endpoints.ts` (NO hardcodear URLs)

### 4. Idioma
- **Código**: inglés (variables, funciones, comentarios técnicos)
- **Texto user-facing**: español (mensajes, labels, Swagger descriptions, rutas)

### 5. Calidad
- **TDD obligatorio**: tests primero, implementación después
- **Coverage mínimo**: ≥80%
- **NO usar**: `any`, `eslint-disable`, `@ts-ignore` (cero tolerancia, también en tests)

## Estructura del Código

### Backend (`backend/tarot-app/src/`)
- `modules/` — feature modules NestJS, uno por dominio:
  `admin`, `ai`, `ai-usage`, `audit`, `auth`, `birth-chart`, `cache`,
  `categories`, `email`, `encyclopedia`, `health`, `holistic-services`,
  `horoscope`, `notifications`, `numerology`, `payments`, `pendulum`,
  `plan-config`, `predefined-questions`, `rituals`, `scheduling`, `security`,
  `subscriptions`, `tarot`, `tarot-core`, `tarotistas`, `usage-limits`, `users`
- `common/` — guards, interceptors, filters, DTOs y utilidades compartidas
- `config/` — configuración y `data-source.ts` (TypeORM, migraciones)
- `database/` — seeds y migraciones
- `scripts/` — CLIs y utilidades (seed, migraciones, stats, etc.)

### Frontend (`frontend/src/`)
- `app/` — rutas App Router en español (`tarot`, `carta-astral`, `numerologia`,
  `horoscopo`, `pendulo`, `rituales`, `servicios`, `tarotistas`, `admin`,
  `perfil`, `historial`, `login`, `registro`, `premium`, etc.)
- `components/` — `ui/` (primitivos), `features/` (por dominio), `layout/`
- `lib/` — `api/` (clients + `endpoints.ts`), `config`, `constants`,
  `validations` (Zod), `providers`, `utils`
- `stores/` — Zustand stores (`authStore`, `birthChartStore`, …)
- `hooks/`, `types/`, `styles/`

## Comandos Frecuentes

### Backend (desde `backend/tarot-app/`)
```bash
npm run start:dev          # Servidor desarrollo (puerto 3000)
npm run test               # Tests unitarios
npm run test:cov           # Tests + coverage
npm run test:integration   # Tests de integración (requiere DB)
npm run test:e2e           # Tests end-to-end (requiere DB)
npm run lint               # ESLint + autofix
npm run build              # Build producción (nest build)
npm run migration:run      # Aplicar migraciones TypeORM
npm run db:seed:all        # Seed completo de la DB
node scripts/validate-architecture.js  # Validar arquitectura
```

### Frontend (desde `frontend/`)
```bash
npm run dev                # Servidor desarrollo (puerto 3001)
npm run test:run           # Tests (Vitest)
npm run test:coverage      # Tests + coverage
npm run lint:fix           # ESLint + autofix
npm run type-check         # Validar TypeScript (tsc --noEmit)
npm run build              # Build producción (next build)
node scripts/validate-architecture.js  # Validar arquitectura
```

## Ciclo de Calidad (ejecutar SIEMPRE antes de commit)

**Backend:**
```bash
cd backend/tarot-app && npm run format && npm run lint && npm run test:cov && npm run build && node scripts/validate-architecture.js
```

**Frontend:**
```bash
cd frontend && npm run format && npm run lint:fix && npm run type-check && npm run test:run && npm run build && node scripts/validate-architecture.js
```

> CI replica estas validaciones en `.github/workflows/ci.yml` y
> `architecture-validation.yml`.

## Documentación de Referencia

| Documento | Propósito |
|-----------|-----------|
| `AGENTS.md` | Guía completa para agentes IA (prohibiciones y reglas detalladas) |
| `.github/copilot-instructions.md` | Contratos de API |
| `backend/tarot-app/docs/ARCHITECTURE.md` | Arquitectura backend |
| `backend/tarot-app/docs/API_DOCUMENTATION.md` | Endpoints REST |
| `frontend/docs/ARCHITECTURE.md` | Arquitectura frontend |
| `frontend/docs/AI_DEVELOPMENT_GUIDE.md` | Guía TDD frontend |
| `docs/*.md` | ADRs, backlogs por feature y flujos de UX |

## Reglas de Desarrollo

### NO hacer nunca:
- Desarrollar más allá de la tarea solicitada
- Aplicar feedback de PR sin validar archivos
- Usar `git commit --amend` para correcciones de PR
- Crear PR sin pasar todas las validaciones
- Hardcodear endpoints (usar `API_ENDPOINTS`)
- Usar `any`, `eslint-disable` o `@ts-ignore`

### SIEMPRE hacer:
- Leer el workflow antes de empezar
- Preguntar antes de continuar con otra tarea
- Usar TODO list para tracking de pasos
- Actualizar backlog al completar tareas
- Crear nuevo commit (no amend) para correcciones de PR
