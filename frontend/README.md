# Frontend TarotFlavia

Frontend del marketplace de tarotistas construido con Next.js 14 + shadcn/ui.

## 🏗️ Contexto: Monorepo

Este proyecto está dentro de un **monorepo con npm workspaces**:

```
tarot-monorepo/
├── backend/tarot-app/     # NestJS (puerto 3000)
└── frontend/              # Next.js (puerto 3001) ← ESTÁS AQUÍ
```

## 📚 Documentación Importante

**Antes de desarrollar, lee:**

1. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitectura feature-based, patrones, convenciones
2. **[AI_DEVELOPMENT_GUIDE.md](docs/AI_DEVELOPMENT_GUIDE.md)** - Guía completa para desarrollo con IA
3. **[AI_PROMPTS.md](docs/AI_PROMPTS.md)** - Prompts para cada tipo de tarea
4. **[DESIGN_HAND-OFF.md](docs/DESIGN_HAND-OFF.md)** - Design tokens y guías visuales
5. **[FRONTEND_BACKLOG.md](docs/FRONTEND_BACKLOG.md)** - Backlog de tareas

## 🚀 Setup Inicial

> ⚠️ **IMPORTANTE:** Sigue la TAREA 0.1 del FRONTEND_BACKLOG.md para setup completo.

### Desde carpeta frontend/

```bash
# 1. Inicializar Next.js 14 (ver TAREA 0.1 del backlog)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Configurar puerto 3001 en package.json
# Editar "dev": "next dev -p 3001"

# 3. Instalar dependencias core (ver TAREA 0.3 del backlog)
npm install zustand @tanstack/react-query axios zod date-fns clsx class-variance-authority lucide-react
npm install -D @tanstack/react-query-devtools

# 4. Inicializar shadcn/ui
npx shadcn-ui@latest init

# 5. Configurar variables de entorno
cp .env.example .env.local
# Editar NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Desde raíz del monorepo

```bash
# Instalar dependencias de TODO el monorepo
npm install

# Ejecutar frontend
npm run dev -w frontend

# Ejecutar backend
npm run start:dev -w backend/tarot-app
```

## 📦 Stack Tecnológico

- **Framework:** Next.js 14 (App Router, TypeScript, React 18)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand (global) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios con interceptors JWT
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint + Prettier

## 🔧 Scripts Disponibles (Post-Setup)

Una vez inicializado Next.js, estos serán los scripts:

```bash
# Desarrollo
npm run dev              # Iniciar servidor desarrollo (puerto 3001)
npm run build            # Build de producción
npm run start            # Iniciar build de producción
npm run preview          # Preview del build

# Calidad de Código
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir errores de ESLint automáticamente
npm run format           # Formatear con Prettier
npm run type-check       # Verificar tipos TypeScript

# Testing
npm test                 # Ejecutar tests con Vitest
npm run test:watch       # Tests en modo watch
npm run test:cov         # Tests con coverage
npm run test:ui          # Abrir UI de Vitest

# Validación de Arquitectura
node scripts/validate-architecture.js  # Validar arquitectura feature-based

# Ciclo Completo de Calidad (pre-commit)
npm run quality          # Ejecuta: lint + type-check + format + validate + build + test
```

## 🏗️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router (rutas)
│   │   ├── (auth)/            # Grupo: rutas de autenticación
│   │   ├── (dashboard)/       # Grupo: rutas con dashboard layout
│   │   ├── admin/             # Panel de administración
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   └── features/          # Componentes de negocio (feature-based)
│   │       ├── readings/      # Todo relacionado a lecturas
│   │       ├── marketplace/   # Todo relacionado a marketplace
│   │       ├── auth/          # Todo relacionado a autenticación
│   │       └── admin/         # Todo relacionado a admin
│   │
│   ├── hooks/
│   │   ├── api/               # React Query hooks (data fetching)
│   │   └── utils/             # Utility hooks
│   │
│   ├── stores/                # Zustand stores (estado global)
│   │
│   ├── lib/
│   │   ├── api/               # Axios config, endpoints
│   │   ├── validations/       # Schemas Zod
│   │   ├── utils/             # Utilidades
│   │   └── constants/         # Constantes globales
│   │
│   └── types/                 # TypeScript types globales
│
├── tests/                     # Tests (Vitest)
│   ├── components/
│   ├── hooks/
│   └── lib/
│
├── public/                    # Assets estáticos
│
└── docs/                      # Documentación del frontend
    ├── ARCHITECTURE.md
    ├── AI_DEVELOPMENT_GUIDE.md
    ├── AI_PROMPTS.md
    ├── DESIGN_HAND-OFF.md
    └── FRONTEND_BACKLOG.md
```

## 🎨 Design System

**Design Tokens configurados en `tailwind.config.js`:**

```javascript
// Colores
bg - main; // #F9F7F2 (Crema Papiro)
surface; // #FFFFFF (Blanco)
text - primary; // #2D3748 (Gris Grafito)
text - muted; // #718096 (Gris Suave)
primary; // #805AD5 (Lavanda Místico)
secondary; // #D69E2E (Dorado)
accent - success; // #48BB78 (Verde)

// Tipografía
font - serif; // Cormorant Garamond, Playfair Display
font - sans; // Lato, Inter

// Sombras
shadow - soft; // 0 4px 20px -2px rgba(128, 90, 213, 0.1)
```

Ver `docs/DESIGN_HAND-OFF.md` para guía completa.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch (desarrollo)
npm run test:watch

# Coverage report
npm run test:cov

# Target mínimo: 80% coverage
```

**Estrategia de testing:**

- **Unit tests** - Componentes, hooks, utils (TDD)
- **Integration tests** - Flujos con React Query
- **E2E tests** - Playwright (post-MVP)

## 🔄 Workflow de Desarrollo

### 1. Antes de comenzar una tarea

```bash
# Leer documentación obligatoria
cat docs/ARCHITECTURE.md
cat docs/AI_DEVELOPMENT_GUIDE.md
cat docs/FRONTEND_BACKLOG.md  # Tarea específica

# Crear rama
git checkout -b feature/TASK-X.Y-descripcion
```

### 2. Durante desarrollo (TDD)

```
1. 🔴 RED: Escribir test que falle
2. 🟢 GREEN: Código mínimo para pasar
3. 🔵 REFACTOR: Mejorar código
4. ♻️ REPETIR
```

### 3. Antes de commit

```bash
# Ciclo de calidad COMPLETO
npm run lint
npm run type-check
npm run format
node scripts/validate-architecture.js  # Validar arquitectura
npm run build
npm test
npm run test:cov  # ≥80% coverage
```

> 💡 **Tip:** Usa `npm run quality` para ejecutar todo el ciclo automáticamente.

### 4. CI/CD Pipeline

**Todos los Pull Requests deben pasar CI antes de mergear:**

- ✅ Linting & Formatting
- ✅ Type Checking
- ✅ Architecture Validation (`validate-architecture.js`)
- ✅ Build
- ✅ Tests (coverage ≥80%)

**Workflows disponibles:**

- `ci.yml` - Pipeline completo (backend + frontend)
- `architecture-validation.yml` - Validación manual de arquitectura
- `monorepo-optimization.yml` - CI optimizado (solo corre tests de workspaces modificados)

**Ver workflows en:** `.github/workflows/`

### 5. Commit y Push

```bash
git add .
git commit -m "feat(scope): description"
git push origin feature/TASK-X.Y
```

## 📋 Reglas de Commits (Conventional Commits)

```
feat(readings): add trash functionality
fix(auth): correct token refresh logic
refactor(ui): migrate to shadcn Card
test(readings): add unit tests for ReadingCard
docs(arch): update data fetching patterns
style(format): apply prettier
perf(images): optimize with next/image
chore(deps): update dependencies
```

## 🚫 Prohibiciones Estrictas

- ❌ Usar `any` en TypeScript (usar tipos específicos o `unknown`)
- ❌ Usar `/* eslint-disable */` o `// @ts-ignore`
- ❌ Fetch directo sin React Query
- ❌ Lógica de negocio en `app/` pages (mover a `components/`)
- ❌ Estilos hardcodeados (usar Design Tokens)
- ❌ Coverage <80%
- ❌ Importaciones relativas largas (usar `@/` alias)

## 🔗 Endpoints del Backend

**Backend URL:** `http://localhost:3000/api`

Ver `backend/tarot-app/docs/API_DOCUMENTATION.md` para documentación completa de endpoints.

## 🌐 URLs del Proyecto

- **Frontend Dev:** http://localhost:3001
- **Backend API:** http://localhost:3000/api
- **API Docs:** http://localhost:3000/api-docs (Swagger)

## 🤝 Desarrollo con IA

Este proyecto está diseñado para desarrollo asistido por IA:

1. **Antes de cada tarea:** Copia el prompt de `docs/AI_PROMPTS.md`
2. **Incluye siempre:** Contexto de `docs/ARCHITECTURE.md`
3. **Sigue:** Workflow TDD + Ciclos de calidad de `docs/AI_DEVELOPMENT_GUIDE.md`

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod](https://zod.dev)

## 🐛 Troubleshooting

Ver sección completa en `docs/AI_DEVELOPMENT_GUIDE.md`.

## 📄 Licencia

Privado - TarotFlavia

---

**Estado:** 🚧 Pendiente de setup inicial (ver TAREA 0.1 del backlog)
