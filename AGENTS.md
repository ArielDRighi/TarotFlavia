# AGENTS.md - Auguria Codebase Guide for AI Agents

> 🤖 **Purpose:** Essential reference for AI coding agents working in this monorepo.
> 📅 **Last Updated:** January 18, 2026

---

## 🚨 CRITICAL RULES FOR AI AGENTS

### Rule 1: NEVER Develop Beyond Requested Task
**IMPORTANTE:** Solo desarrolla la tarea específica que el usuario solicita. **NUNCA** asumas que debes continuar con la siguiente tarea, incluso si:
- El usuario dice "continue"
- Terminas una tarea y ves la siguiente en el backlog
- Las tareas están relacionadas o son dependencias

**Siempre pregunta explícitamente** antes de empezar una nueva tarea.

❌ **INCORRECTO:**
```
Usuario: "Desarrolla TASK-111"
Agente: [Completa TASK-111]
Agente: [Automáticamente empieza TASK-112 sin preguntar]
```

✅ **CORRECTO:**
```
Usuario: "Desarrolla TASK-111"
Agente: [Completa TASK-111]
Agente: "TASK-111 completada. ¿Quieres que continúe con TASK-112?"
```

### Rule 2: PRs ALWAYS Target `develop` Branch
**CRÍTICO:** Todos los Pull Requests deben apuntar al branch `develop`, **NUNCA** a `main`.

```bash
# ✅ CORRECTO
gh pr create --base develop --title "..." --body "..."

# ❌ INCORRECTO
gh pr create --base main --title "..." --body "..."
```

**Razón:** El proyecto usa Git Flow:
- `develop`: Branch de integración para desarrollo
- `main`: Solo para releases de producción

### Rule 3: ALWAYS Validate PR Feedback Before Applying
**CRÍTICO:** Cuando recibas feedback de un PR, **NUNCA** apliques cambios automáticamente.

**Proceso obligatorio:**

1. **VALIDAR** qué archivos menciona el feedback
2. **VERIFICAR** si esos archivos están realmente en el PR (`gh pr diff [PR_NUMBER] --name-only`)
3. **CATEGORIZAR** el feedback:
   - ✅ Válido: Archivo en feedback Y en PR
   - ❌ Inválido: Archivo en feedback pero NO en PR
   - ⚠️ Dudoso: Requiere análisis adicional
4. **INFORMAR** al usuario con formato:
   ```
   📋 ANÁLISIS DE FEEDBACK DEL PR
   
   ✅ FEEDBACK VÁLIDO (X items):
   1. [Descripción] → [Acción propuesta]
   
   ❌ FEEDBACK INVÁLIDO (Y items):
   1. [Descripción] → Razón: [archivo no está en PR]
   
   ⚠️ FEEDBACK DUDOSO (Z items):
   1. [Descripción] → Requiere decisión
   
   ¿Procedo a aplicar los X items válidos?
   ```
5. **ESPERAR** confirmación del usuario antes de aplicar

**IMPORTANTE:** Herramientas de IA (como Copilot) pueden revisar archivos incorrectos o confundirse con el contexto. Siempre verificar primero.

### Rule 4: MANDATORY Quality Gates & Task Tracking
**CRÍTICO:** NUNCA olvides estos pasos en CADA tarea. Usa TODO list para tracking.

#### A) Ciclo de Calidad Completo (OBLIGATORIO)

Ejecutar EN ORDEN después de implementación:

```bash
# Backend
cd backend/tarot-app
npm run format              # ⚠️ CRÍTICO: NO OLVIDAR
npm run lint                # Autofix code style
npm run test:cov            # Coverage ≥ 80%
npm run build               # Compilación exitosa
npm run validate-architecture  # Si existe el script

# Frontend  
cd frontend
npm run format              # ⚠️ CRÍTICO: NO OLVIDAR
npm run lint:fix            # Autofix code style
npm run type-check          # TypeScript validation
npm run test:run            # Run all tests
npm run build               # Build para producción
node scripts/validate-architecture.js  # Validar arquitectura
```

**SI OLVIDAS `format` o cualquier paso:**
- El código tendrá formato inconsistente
- Los PRs fallarán en CI/CD
- Se perderá tiempo en ciclos de feedback

#### B) Actualización de Backlog (OBLIGATORIO)

**ANTES de crear el commit final:**

1. **Marcar TODAS las tareas como completadas**:
   ```markdown
   **Estado:** ✅ COMPLETADA
   
   - [x] Tarea 1
   - [x] Tarea 2
   ```

2. **Verificar checkboxes**:
   - ✅ Todos los criterios de aceptación
   - ✅ Todas las subtareas técnicas
   - ✅ Todos los tests

3. **NO incluir en commit si el backlog no está actualizado**

#### C) Uso de TODO List (OBLIGATORIO)

**Al inicio de CADA tarea, crear TODO list con:**

**Para tareas de BACKEND:**
```
1. Implementar [feature/test]
2. Ejecutar npm run format
3. Ejecutar npm run lint
4. Ejecutar npm run test:cov
5. Ejecutar npm run build
6. Ejecutar npm run validate-architecture (si existe)
7. Actualizar backlog (marcar tarea completada)
8. Crear commit
9. Push y crear PR apuntando a develop
```

**Para tareas de FRONTEND:**
```
1. Implementar [feature/test]
2. Ejecutar npm run format
3. Ejecutar npm run lint:fix
4. Ejecutar npm run type-check
5. Ejecutar npm run test:run
6. Ejecutar npm run build
7. Ejecutar node scripts/validate-architecture.js
8. Actualizar backlog (marcar tarea completada)
9. Crear commit
10. Push y crear PR apuntando a develop
```

**Marcar cada ítem INMEDIATAMENTE después de completarlo.**

**❌ NUNCA:**
- Omitir `format` porque "el linter lo arreglará"
- Olvidar marcar tareas en el backlog
- Crear commit sin actualizar documentación
- Asumir que un paso "no es importante"

**✅ SIEMPRE:**
- Seguir el orden exacto de los pasos
- Usar TODO list para tracking
- Verificar que TODOS los pasos estén ✅ antes del commit
- Actualizar backlog ANTES del commit final

---

## 📂 Repository Structure

```
tarot/                           # Monorepo root
├── backend/tarot-app/          # NestJS API (port 3000)
├── frontend/                   # Next.js App (port 3001)
└── docs/                       # Project documentation
```

**Key Documentation:**
- Backend: `backend/tarot-app/docs/API_DOCUMENTATION.md`, `ARCHITECTURE.md`
- Frontend: `frontend/docs/ARCHITECTURE.md`, `AI_DEVELOPMENT_GUIDE.md`
- Copilot Rules: `.github/copilot-instructions.md`

---

## 🛠️ Commands Reference

### Root (Monorepo)
```bash
npm run build    # Build all workspaces
npm run test     # Test all workspaces
npm run lint     # Lint all workspaces
```

### Backend (from `backend/tarot-app/`)
```bash
# Development
npm run start:dev              # Start dev server (watch mode)
npm run build                  # Build for production
npm run lint                   # Lint and autofix

# Testing
npm run test                   # All unit tests
npm run test:watch             # Watch mode
npm run test -- path/to/file.spec.ts  # Single test file
npm run test:cov               # Coverage report
npm run test:integration       # Integration tests
npm run test:e2e               # E2E tests (requires DB)

# Database
npm run db:dev:reset           # Reset dev DB (Linux/Mac)
npm run db:dev:reset:win       # Reset dev DB (Windows)
npm run db:seed:all            # Seed all data
npm run migration:generate -- src/database/migrations/MigrationName  # Generate migration
npm run migration:run          # Run pending migrations
```

### Frontend (from `frontend/`)
```bash
# Development
npm run dev                    # Start dev server (port 3001)
npm run build                  # Build for production
npm run lint                   # Lint
npm run lint:fix               # Lint and autofix
npm run type-check             # TypeScript validation

# Testing
npm run test                   # Run tests in watch mode
npm run test:run               # Run tests once
npm run test:coverage          # Coverage report
npm run test -- src/path/to/file.test.tsx  # Single test file
```

---

## 📐 Code Style Guidelines

### TypeScript Configuration

**Backend (`tsconfig.json`):**
- `target: ES2023`, `module: commonjs`
- `experimentalDecorators: true`
- `strictNullChecks: true`, `noImplicitAny: false`

**Frontend (`tsconfig.json`):**
- `target: ES2017`, `module: esnext`
- `strict: true`, `jsx: react-jsx`
- Path alias: `@/*` → `./src/*`

### Formatting (Prettier)
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "endOfLine": "auto"
}
```

### Import Organization

**Backend:**
```typescript
// 1. Framework (@nestjs/*)
import { Injectable, Inject } from '@nestjs/common';
// 2. Third-party (typeorm, etc.)
import { Repository } from 'typeorm';
// 3. Swagger decorators
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// 4. Internal modules (domain/application/infrastructure)
import { CreateReadingUseCase } from '../use-cases/create-reading.use-case';
// 5. Common utilities
import { User } from '../../../users/entities/user.entity';
```

**Frontend:**
```typescript
'use client';  // Always on line 1 for client components
// 1. React & Next.js
import { useState } from 'react';
// 2. Icons
import { Plus } from 'lucide-react';
// 3. Third-party libraries
import ReactMarkdown from 'react-markdown';
// 4. Custom hooks
import { useCreateReading } from '@/hooks/api/useReadings';
// 5. Components (ui → features)
import { Button } from '@/components/ui/button';
// 6. Utils & types
import { cn } from '@/lib/utils';
import type { ReadingDetail } from '@/types';
```

### Naming Conventions

| Category | Backend | Frontend |
|----------|---------|----------|
| Files | `kebab-case.ts` | `PascalCase.tsx` (components), `kebab-case.ts` (utils) |
| Classes/Components | `PascalCase` | `PascalCase` |
| Methods/Functions | `camelCase` | `camelCase` |
| Hooks | N/A | `useCamelCase` |
| Constants | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| Interfaces | `IPascalCase` | `PascalCase` |
| Types | `PascalCase` | `PascalCase` |
| Enums | `PascalCase` | `PascalCase` |

---

## 🏗️ Architecture Patterns

### Backend (NestJS + Clean Architecture)

**Layer Structure:**
```
src/modules/readings/
├── domain/             # Business logic, entities, interfaces
├── application/        # Use cases, orchestrators
└── infrastructure/     # Controllers, repositories, adapters
```

**Dependency Flow:** Controller → Orchestrator → Use Cases → Repositories

**Key Patterns:**
1. **Orchestrator Pattern:** Coordinate use cases, never inject repositories in controllers
2. **Repository Pattern:** Use interfaces with `@Inject('IRepositoryName')`
3. **Use Cases:** Complex business logic (create reading, apply AI interpretation)
4. **Guards/Interceptors:** Stack decorators for auth, rate limiting, usage tracking

**Controller Example:**
```typescript
@ApiTags('Lecturas')  // Spanish for user-facing text
@Controller('readings')
export class ReadingsController {
  constructor(
    private readonly orchestrator: ReadingsOrchestratorService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nueva lectura' })
  async create(@Request() req, @Body() dto: CreateReadingDto) {
    return this.orchestrator.create(req.user, dto);  // Delegate to orchestrator
  }
}
```

### Frontend (Next.js + Feature-Based)

**Directory Structure:**
```
src/
├── app/                # Routes & layouts only (no logic)
├── components/
│   ├── ui/            # shadcn/ui primitives
│   └── features/      # Business components by domain
├── hooks/
│   ├── api/           # TanStack Query hooks
│   └── utils/         # Utility hooks
├── lib/
│   ├── api/           # API functions, axios config, endpoints
│   └── validations/   # Zod schemas
├── stores/            # Zustand stores
└── types/             # TypeScript types
```

**Component Structure:**
```typescript
'use client';

// Constants → Types → Helpers → Sub-components → Main Component

const CONSTANTS = { /* ... */ };

type ComponentState = 'idle' | 'loading';

interface Props { /* ... */ }

function Helper() { /* ... */ }

export function Component({ prop }: Props) {
  // State → Hooks → Derived state → Handlers → Effects → Render
  const [state, setState] = useState<ComponentState>('idle');
  const { data } = useQuery();
  const isPremium = user?.plan === 'premium';
  const handleClick = useCallback(() => {}, []);
  useEffect(() => {}, []);
  
  return <div data-testid="component">...</div>;
}
```

---

## 🎯 Critical Rules from Copilot Instructions

### 1. **IDs are NUMERIC (never strings)**
```typescript
// ✅ CORRECT
{ "id": 123, "userId": 1 }

// ❌ WRONG
{ "id": "123", "userId": "uuid" }
```

### 2. **Pagination Format (do not modify)**
```typescript
// ✅ Backend returns this format
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

### 3. **Use Centralized Endpoints**
```typescript
// ✅ CORRECT
import { API_ENDPOINTS } from '@/lib/api/endpoints';
apiClient.post(API_ENDPOINTS.READINGS.BASE, data);

// ❌ WRONG
apiClient.post('/readings', data);  // Hardcoded
```

### 4. **Spanish for User-Facing Text**
```typescript
// ✅ CORRECT
toast.success('Lectura creada exitosamente');
@ApiOperation({ summary: 'Crear nueva lectura' })

// ❌ WRONG
toast.success('Reading created successfully');
```

---

## 🧪 Testing Patterns

### Backend (Jest)
```typescript
describe('ReadingsService', () => {
  let service: ReadingsService;
  const mockRepo = { findOne: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReadingsService,
        { provide: 'IReadingRepository', useValue: mockRepo },
      ],
    }).compile();
    service = module.get(ReadingsService);
    jest.clearAllMocks();
  });

  it('should create reading', async () => {
    mockRepo.save.mockResolvedValue({ id: 1 });
    const result = await service.create({});
    expect(result.id).toBe(1);
  });

  it('should throw NotFoundException when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
```

### Frontend (Vitest + Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('ReadingCard', () => {
  it('should render card name', () => {
    render(<ReadingCard name="The Fool" />);
    expect(screen.getByText('The Fool')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<ReadingCard onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't inject repositories in controllers** → Use orchestrators
2. **Don't hardcode endpoints** → Use `API_ENDPOINTS` constant
3. **Don't use `any` type** → Use proper TypeScript types
4. **Don't forget `'use client'`** → Required for Next.js client components
5. **Don't skip tests** → TDD is enforced (coverage ≥ 80%)
6. **Don't modify API contracts** → IDs are numeric, pagination format is fixed
7. **Don't use English for user-facing text** → Always Spanish

---

## 🤖 Automated Workflows

### Trigger Recognition

**AI Agents MUST automatically apply these workflows when the user says:**

#### Backend Tasks
```
"Iniciar TASK-XXX del backend"
"Empezar tarea backend TASK-XXX"
"Start backend task TASK-XXX"
```

**Action:** Automatically apply **FULL workflow** from `docs/WORKFLOW_BACKEND.md`

#### Frontend Tasks
```
"Iniciar TASK-XXX del frontend"
"Empezar tarea frontend TASK-XXX"
"Start frontend task TASK-XXX"
```

**Action:** Automatically apply **FULL workflow** from `docs/WORKFLOW_FRONTEND.md`

#### Backend PR Feedback
```
"Tengo feedback del PR de backend TASK-XXX"
"Feedback del PR backend"
"PR feedback backend: [comentarios]"
```

**Action:** Automatically apply **FULL workflow** from `docs/WORKFLOW_PR_FEEDBACK_BACKEND.md`

#### Frontend PR Feedback
```
"Tengo feedback del PR de frontend TASK-XXX"
"Feedback del PR frontend"
"PR feedback frontend: [comentarios]"
```

**Action:** Automatically apply **FULL workflow** from `docs/WORKFLOW_PR_FEEDBACK_FRONTEND.md`

### Workflow Documents

| Workflow | Path | When to Use |
|----------|------|-------------|
| **Backend TDD** | `docs/WORKFLOW_BACKEND.md` | All NestJS backend tasks |
| **Frontend TDD** | `docs/WORKFLOW_FRONTEND.md` | All Next.js frontend tasks |
| **Backend PR Feedback** | `docs/WORKFLOW_PR_FEEDBACK_BACKEND.md` | When receiving PR reviews for backend |
| **Frontend PR Feedback** | `docs/WORKFLOW_PR_FEEDBACK_FRONTEND.md` | When receiving PR reviews for frontend |

**CRITICAL:** These workflows are **NOT suggestions** - they are **mandatory processes** that must be followed for every task. The user should never need to repeat the full workflow instructions.

---

## 🔍 When in Doubt

1. Check existing code patterns in similar modules
2. Consult `.github/copilot-instructions.md` for API contracts
3. Review `backend/tarot-app/docs/ARCHITECTURE.md` for backend patterns
4. Review `frontend/docs/AI_DEVELOPMENT_GUIDE.md` for frontend patterns
5. Review `docs/WORKFLOW_BACKEND.md` or `docs/WORKFLOW_FRONTEND.md` for complete workflows
6. Run tests before committing: `npm run test:cov` (backend), `npm run test:run` (frontend)

---

**End of Guide** - Follow these patterns for consistent, high-quality code.
