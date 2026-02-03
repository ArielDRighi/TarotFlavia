# CLAUDE.md - Auguria Monorepo

> Este archivo es leído automáticamente por Claude Code al inicio de cada sesión.
> Última actualización: Febrero 2026

## Proyecto

**Auguria** es un marketplace de tarotistas con lecturas de tarot potenciadas por IA.

```
tarot/
├── backend/tarot-app/   # NestJS API (puerto 3000)
├── frontend/            # Next.js App (puerto 3001)
└── docs/                # Documentación del proyecto
```

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

### 3. Contratos de API (NO modificar)
- **IDs son NUMÉRICOS** (nunca strings)
- **Paginación**: `{ data: [], meta: { page, limit, totalItems, totalPages } }`
- **Endpoints centralizados**: usar `API_ENDPOINTS` constant

### 4. Idioma
- **Código**: inglés (variables, funciones, comentarios técnicos)
- **Texto user-facing**: español (mensajes, labels, Swagger descriptions)

### 5. Calidad
- **TDD obligatorio**: tests primero, implementación después
- **Coverage mínimo**: ≥80%
- **NO usar**: `any`, `eslint-disable`, `@ts-ignore`

## Comandos Frecuentes

### Backend (desde `backend/tarot-app/`)
```bash
npm run start:dev          # Servidor desarrollo
npm run test:cov           # Tests + coverage
npm run lint               # Lint + autofix
npm run build              # Build producción
node scripts/validate-architecture.js  # Validar arquitectura
```

### Frontend (desde `frontend/`)
```bash
npm run dev                # Servidor desarrollo (3001)
npm run test:run           # Tests
npm run lint:fix           # Lint + autofix
npm run type-check         # Validar TypeScript
npm run build              # Build producción
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

## Documentación de Referencia

| Documento | Propósito |
|-----------|-----------|
| `AGENTS.md` | Guía completa para agentes IA |
| `.github/copilot-instructions.md` | Contratos de API |
| `backend/tarot-app/docs/ARCHITECTURE.md` | Arquitectura backend |
| `backend/tarot-app/docs/API_DOCUMENTATION.md` | Endpoints REST |
| `frontend/docs/ARCHITECTURE.md` | Arquitectura frontend |
| `frontend/docs/AI_DEVELOPMENT_GUIDE.md` | Guía TDD frontend |

## Reglas de Desarrollo

### NO hacer nunca:
- Desarrollar más allá de la tarea solicitada
- Aplicar feedback de PR sin validar archivos
- Usar `git commit --amend` para correcciones de PR
- Crear PR sin pasar todas las validaciones
- Hardcodear endpoints (usar `API_ENDPOINTS`)

### SIEMPRE hacer:
- Leer el workflow antes de empezar
- Preguntar antes de continuar con otra tarea
- Usar TODO list para tracking de pasos
- Actualizar backlog al completar tareas
- Crear nuevo commit (no amend) para correcciones de PR
