# Guía de Desarrollo con IA - Frontend TarotFlavia

> 📋 **Propósito:** Este documento guía a las IAs en el desarrollo del frontend siguiendo buenas prácticas de Next.js, React y arquitectura limpia. Copiar y pegar antes de cada tarea junto con la tarea específica del backlog.

---

## 🎯 Contexto del Proyecto

**Stack Tecnológico:**

- **Framework:** Next.js 14 (App Router, TypeScript, React 18)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (global) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + Testing Library
- **HTTP:** Axios con interceptors JWT

**Arquitectura:** Feature-based con separation of concerns

**Ubicación en Monorepo:**

```
tarot-monorepo/
├── backend/tarot-app/     # NestJS (puerto 3000)
└── frontend/              # Next.js (puerto 3001) ← TRABAJAS AQUÍ
```

---

## 📚 Lectura Obligatoria ANTES de Comenzar

Antes de escribir **CUALQUIER línea de código**, debes leer:

### 1. ARCHITECTURE.md (Completo)

📄 `frontend/docs/ARCHITECTURE.md`

**Qué aprender:**

- Estructura feature-based del proyecto
- Separation of concerns (app/, components/, hooks/, stores/, lib/)
- Data fetching strategy (TanStack Query + Axios)
- Form handling (React Hook Form + Zod)
- Nomenclatura de archivos y código
- Anti-patterns a evitar

**Tiempo de lectura:** 15-20 minutos

### 2. DESIGN_HAND-OFF.md (Consulta)

📄 `frontend/docs/DESIGN_HAND-OFF.md`

**Qué aprender:**

- Design Tokens (colores, tipografía, sombras)
- Componentes UI base
- Guías visuales de cada pantalla

**Uso:** Consultar cuando desarrolles UI

### 3. FRONTEND_BACKLOG.md (Tarea Específica)

📄 `frontend/docs/FRONTEND_BACKLOG.md`

**Qué aprender:**

- Contexto del monorepo
- Tarea específica a desarrollar
- Dependencias entre tareas
- Prompts detallados

---

## 🔄 Workflow de Desarrollo (TDD + Ciclos de Calidad)

### Fase 1: Preparación

```bash
# 1. Crear rama (desde frontend/)
git checkout -b feature/TASK-X.Y-descripcion-corta

# 2. Verificar que todo funciona ANTES de empezar
npm run lint
npm run type-check
npm run build
npm test

# Si algo falla, NO continúes. Reporta el problema.
```

### Fase 2: Desarrollo TDD

**Ciclo estricto:**

```
1. 🔴 RED: Escribe un test que falle
   ├─ Crea archivo .test.tsx
   ├─ Describe el comportamiento esperado
   └─ Verifica que falle (npm test)

2. 🟢 GREEN: Escribe código mínimo para pasar test
   ├─ Implementa solo lo necesario
   ├─ Verifica que pase (npm test)
   └─ NO optimices todavía

3. 🔵 REFACTOR: Mejora el código
   ├─ Elimina duplicación
   ├─ Mejora nombres
   ├─ Optimiza (si necesario)
   └─ Verifica que tests sigan pasando

4. ♻️ REPETIR hasta completar la funcionalidad
```

**Ejemplo práctico:**

```tsx
// 1. 🔴 RED - Escribir test primero
// tests/components/ReadingCard.test.tsx
describe("ReadingCard", () => {
  it("should display reading question", () => {
    const reading = { id: "1", question: "¿Amor?" };
    render(<ReadingCard reading={reading} />);
    expect(screen.getByText("¿Amor?")).toBeInTheDocument();
  });
});

// npm test → FALLA (componente no existe)

// 2. 🟢 GREEN - Código mínimo
// components/features/readings/ReadingCard.tsx
export function ReadingCard({ reading }) {
  return <div>{reading.question}</div>;
}

// npm test → PASA ✅

// 3. 🔵 REFACTOR - Mejorar
export function ReadingCard({ reading }: ReadingCardProps) {
  return (
    <Card>
      <CardHeader>{reading.question}</CardHeader>
    </Card>
  );
}

// npm test → PASA ✅
```

### Fase 3: Implementación Completa

#### A. Estructura de Archivos

**Antes de crear archivos, verifica:**

1. ¿Ya existe un módulo similar? → Replica su estructura
2. ¿Dónde va según ARCHITECTURE.md? → Feature-based
3. ¿Nomenclatura correcta? → PascalCase componentes, camelCase hooks

**Ejemplo: Nueva funcionalidad de "Papelera de Lecturas"**

```bash
# 1. Componentes (features/readings/)
components/features/readings/
├── ReadingCard.tsx           # Ya existe
├── ReadingForm.tsx           # Ya existe
├── ReadingsList.tsx          # Ya existe
└── TrashReadingsList.tsx     # NUEVO - Lista de eliminadas

# 2. Hooks (hooks/api/)
hooks/api/
├── useReadings.ts            # Ya existe
└── useTrashedReadings.ts     # NUEVO - Query papelera

# 3. Types (types/)
types/
└── reading.types.ts          # Extender con TrashReading

# 4. Rutas (app/)
app/lecturas/
├── page.tsx                  # Ya existe
└── papelera/
    └── page.tsx              # NUEVO - Ruta /lecturas/papelera

# 5. Tests
tests/components/
└── TrashReadingsList.test.tsx  # NUEVO
```

#### B. Implementación por Capas

**Orden obligatorio:**

```
1. Types/Interfaces (types/)
   └─ Define tipos TypeScript

2. Schemas Zod (lib/validations/)
   └─ Si hay formularios/validación

3. API Hooks (hooks/api/)
   └─ React Query queries/mutations

4. Componentes (components/features/)
   └─ UI con lógica de presentación

5. Páginas (app/)
   └─ Rutas que usan componentes

6. Tests (tests/)
   └─ Cobertura completa
```

**Ejemplo completo:**

```tsx
// ===== 1. TYPES =====
// types/reading.types.ts
export interface TrashedReading extends Reading {
  deletedAt: string;
  restorable: boolean;
}

// ===== 2. SCHEMAS (si aplica) =====
// lib/validations/reading.schemas.ts
export const restoreReadingSchema = z.object({
  id: z.string().uuid(),
});

// ===== 3. API HOOKS =====
// hooks/api/useTrashedReadings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios-config";

export function useTrashedReadings() {
  return useQuery({
    queryKey: ["readings", "trash"],
    queryFn: async () => {
      const response = await apiClient.get<TrashedReading[]>("/readings/trash");
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

export function useRestoreReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/readings/${id}/restore`);
    },
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["readings", "trash"] });
      queryClient.invalidateQueries({ queryKey: ["readings"] });
    },
  });
}

// ===== 4. COMPONENTES =====
// components/features/readings/TrashReadingsList.tsx
("use client");

import { useTrashedReadings, useRestoreReading } from "@/hooks/api/useTrashedReadings";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function TrashReadingsList() {
  const { data: readings, isLoading, error } = useTrashedReadings();
  const { mutate: restore, isPending } = useRestoreReading();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error al cargar papelera</p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!readings || readings.length === 0) {
    return <div className="text-center p-8 text-gray-500">No hay lecturas eliminadas</div>;
  }

  const handleRestore = (id: string) => {
    restore(id, {
      onSuccess: () => {
        toast.success("Lectura restaurada correctamente");
      },
      onError: (error) => {
        toast.error("Error al restaurar: " + error.message);
      },
    });
  };

  return (
    <div className="space-y-4">
      {readings.map((reading) => (
        <div key={reading.id} className="border rounded-lg p-4">
          <p className="font-serif text-lg">{reading.question}</p>
          <p className="text-sm text-gray-500">Eliminada: {new Date(reading.deletedAt).toLocaleDateString()}</p>
          <Button
            onClick={() => handleRestore(reading.id)}
            disabled={isPending || !reading.restorable}
            size="sm"
            className="mt-2"
          >
            Restaurar
          </Button>
        </div>
      ))}
    </div>
  );
}

// ===== 5. PÁGINA =====
// app/lecturas/papelera/page.tsx
import { TrashReadingsList } from "@/components/features/readings/TrashReadingsList";

export const metadata = {
  title: "Papelera | TarotFlavia",
  description: "Lecturas eliminadas",
};

export default function TrashPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-serif mb-6">Papelera de Lecturas</h1>
      <TrashReadingsList />
    </div>
  );
}

// ===== 6. TESTS =====
// tests/components/TrashReadingsList.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TrashReadingsList } from "@/components/features/readings/TrashReadingsList";
import { vi } from "vitest";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

describe("TrashReadingsList", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("should show loading state initially", () => {
    render(<TrashReadingsList />, { wrapper });
    expect(screen.getAllByTestId("skeleton")).toHaveLength(3);
  });

  it("should display trashed readings", async () => {
    // Mock API response
    vi.mock("@/hooks/api/useTrashedReadings", () => ({
      useTrashedReadings: () => ({
        data: [{ id: "1", question: "¿Test?", deletedAt: "2025-12-01", restorable: true }],
        isLoading: false,
        error: null,
      }),
    }));

    render(<TrashReadingsList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("¿Test?")).toBeInTheDocument();
    });
  });

  it("should call restore mutation when restore button clicked", async () => {
    const mockRestore = vi.fn();

    vi.mock("@/hooks/api/useTrashedReadings", () => ({
      useRestoreReading: () => ({
        mutate: mockRestore,
        isPending: false,
      }),
    }));

    render(<TrashReadingsList />, { wrapper });

    const restoreBtn = screen.getByText("Restaurar");
    fireEvent.click(restoreBtn);

    expect(mockRestore).toHaveBeenCalledWith("1", expect.any(Object));
  });
});
```

### Fase 4: Ciclos de Calidad

**Ejecutar SIEMPRE después de completar la tarea:**

```bash
# 1. LINT - Verificar reglas ESLint
npm run lint

# Si hay errores:
# ❌ PROHIBIDO: Usar /* eslint-disable */
# ✅ OBLIGATORIO: Corregir el problema real

# 2. TYPE CHECK - Verificar tipos TypeScript
npm run type-check

# Si hay errores de tipos:
# - Revisar interfaces
# - Agregar tipos faltantes
# - NO usar 'any' (usar 'unknown' si necesario)

# 3. FORMAT - Formatear código
npm run format

# Prettier formatea automáticamente

# 4. BUILD - Compilar para producción
npm run build

# Debe completar sin errores
# Warnings aceptables solo si están documentados

# 5. TESTS - Ejecutar todos los tests
npm test

# Coverage mínimo: 80% (configurado en vitest.config.ts)
# Todos los tests deben pasar ✅

# 6. TESTS E2E (solo si aplica)
npm run test:e2e

# Ejecutar solo si modificaste flujos completos
```

**Checklist de Calidad:**

```
□ npm run lint → Sin errores ni warnings
□ npm run type-check → Sin errores de tipos
□ npm run format → Código formateado
□ npm run build → Build exitoso
□ npm test → 100% tests pasando + coverage ≥80%
□ Manual testing → Verificar en http://localhost:3001
□ Accessibility → Probar con teclado
□ Responsive → Probar mobile/tablet/desktop
```

### Fase 5: Commit y Push

**Estructura de commits (Conventional Commits):**

```bash
# Formato
<type>(<scope>): <description>

[optional body]

# Ejemplos
feat(readings): add trash functionality
fix(auth): correct token refresh logic
refactor(ui): migrate to shadcn Card component
test(readings): add unit tests for TrashReadingsList
docs(arch): update data fetching patterns
style(format): apply prettier to all files
perf(images): optimize with next/image
chore(deps): update dependencies

# Hacer commit
git add .
git commit -m "feat(readings): add trash functionality

- Create TrashReadingsList component
- Add useTrashedReadings and useRestoreReading hooks
- Add /lecturas/papelera route
- Add comprehensive tests with 90% coverage"

# Push
git push origin feature/TASK-X.Y-descripcion
```

**Tipos permitidos:**

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `refactor` - Refactorización sin cambio funcional
- `test` - Agregar/modificar tests
- `docs` - Documentación
- `style` - Formato (prettier, eslint)
- `perf` - Mejora de performance
- `chore` - Tareas de mantenimiento

---

## 🚫 Reglas Estrictas (PROHIBICIONES)

### ❌ NUNCA hacer:

1. **Usar `any` en TypeScript**

   ```tsx
   // ❌ PROHIBIDO
   const data: any = fetchData();

   // ✅ CORRECTO
   const data: Reading[] = fetchData();
   // o si es desconocido:
   const data: unknown = fetchData();
   ```

2. **Ignorar errores de ESLint**

   ```tsx
   // ❌ PROHIBIDO
   /* eslint-disable */
   // @ts-ignore

   // ✅ CORRECTO - Corregir el problema
   ```

3. **Fetch directo sin React Query**

   ```tsx
   // ❌ PROHIBIDO
   useEffect(() => {
     fetch("/api/readings").then(setData);
   }, []);

   // ✅ CORRECTO
   const { data } = useReadings();
   ```

4. **Lógica de negocio en componentes de página (app/)**

   ```tsx
   // ❌ PROHIBIDO
   // app/lecturas/page.tsx
   export default function ReadingsPage() {
     const [data, setData] = useState([]);
     // 200 líneas de lógica...
   }

   // ✅ CORRECTO
   export default function ReadingsPage() {
     return <ReadingsList />; // Lógica en componente
   }
   ```

5. **Estilos inline hardcodeados**

   ```tsx
   // ❌ PROHIBIDO
   <div style={{ color: '#805AD5' }}>

   // ✅ CORRECTO
   <div className="text-primary">
   ```

6. **Importaciones absolutas mal formadas**

   ```tsx
   // ❌ PROHIBIDO
   import { Button } from "../../../components/ui/button";

   // ✅ CORRECTO
   import { Button } from "@/components/ui/button";
   ```

7. **Componentes sin tipado de props**

   ```tsx
   // ❌ PROHIBIDO
   function ReadingCard({ reading }) {}

   // ✅ CORRECTO
   interface ReadingCardProps {
     reading: Reading;
     onDelete?: (id: string) => void;
   }
   function ReadingCard({ reading, onDelete }: ReadingCardProps) {}
   ```

8. **Tests sin coverage mínimo**

   ```bash
   # ❌ PROHIBIDO - Subir código con <80% coverage

   # ✅ CORRECTO - Verificar coverage
   npm run test:cov
   ```

---

## ✅ Mejores Prácticas Obligatorias

### 1. Componentización

```tsx
// ✅ CORRECTO - Componentes pequeños y reutilizables
function ReadingCard({ reading }: ReadingCardProps) {
  return (
    <Card>
      <CardHeader>
        <ReadingQuestion question={reading.question} />
      </CardHeader>
      <CardContent>
        <ReadingMeta createdAt={reading.createdAt} />
      </CardContent>
      <CardFooter>
        <ReadingActions readingId={reading.id} />
      </CardFooter>
    </Card>
  );
}

// ❌ INCORRECTO - Todo en un solo componente gigante
```

### 2. Hooks Personalizados

```tsx
// ✅ CORRECTO - Extraer lógica a hooks
function useReadingActions(readingId: string) {
  const { mutate: deleteReading } = useDeleteReading();
  const { mutate: shareReading } = useShareReading();

  const handleDelete = () => {
    if (confirm("¿Eliminar lectura?")) {
      deleteReading(readingId);
    }
  };

  return { handleDelete, shareReading };
}

// Uso
function ReadingActions({ readingId }) {
  const { handleDelete, shareReading } = useReadingActions(readingId);
  return (
    <>
      <Button onClick={handleDelete}>Eliminar</Button>
      <Button onClick={() => shareReading(readingId)}>Compartir</Button>
    </>
  );
}
```

### 3. Error Boundaries

```tsx
// ✅ CORRECTO - Manejar errores gracefully
function ReadingsList() {
  const { data, error, isLoading } = useReadings();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return data.map((reading) => <ReadingCard key={reading.id} {...reading} />);
}
```

### 4. Optimistic Updates

```tsx
// ✅ CORRECTO - Actualización optimista para mejor UX
export function useDeleteReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/readings/${id}`),
    onMutate: async (id) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ["readings"] });

      // Snapshot estado anterior
      const previousReadings = queryClient.getQueryData(["readings"]);

      // Actualización optimista
      queryClient.setQueryData(["readings"], (old: Reading[]) => old.filter((r) => r.id !== id));

      return { previousReadings };
    },
    onError: (err, id, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(["readings"], context.previousReadings);
      toast.error("Error al eliminar");
    },
    onSuccess: () => {
      toast.success("Lectura eliminada");
    },
  });
}
```

### 5. Accessibility

```tsx
// ✅ CORRECTO - Accesible con teclado y screen readers
<Button aria-label="Eliminar lectura" onClick={handleDelete}>
  <TrashIcon aria-hidden="true" />
</Button>;

// ✅ CORRECTO - Focus management
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<Input ref={inputRef} />;
```

---

## 📝 Plantilla de Prompt para Tareas

**Copiar este template cuando inicies una tarea:**

```markdown
## 🎯 TAREA: [Número y título de FRONTEND_BACKLOG.md]

### Pre-requisitos completados:

- [x] Leí ARCHITECTURE.md completo
- [x] Revisé DESIGN_HAND-OFF.md para UI
- [x] Entendí la tarea del backlog
- [x] Verifiqué dependencias previas completadas

### Contexto de la tarea:

[Copiar consigna del backlog]

### Plan de implementación:

1. **Archivos a crear:**

   - [ ] types/[nombre].types.ts - Interfaces TypeScript
   - [ ] lib/validations/[nombre].schemas.ts - Schemas Zod (si aplica)
   - [ ] hooks/api/use[Nombre].ts - React Query hooks
   - [ ] components/features/[feature]/[Componente].tsx - Componentes
   - [ ] app/[ruta]/page.tsx - Página Next.js
   - [ ] tests/components/[Componente].test.tsx - Tests

2. **Enfoque TDD:**

   - Escribir tests primero para cada componente
   - Implementar código mínimo
   - Refactorizar manteniendo tests verdes

3. **Ciclos de calidad:**
   - [ ] npm run lint
   - [ ] npm run type-check
   - [ ] npm run format
   - [ ] npm run build
   - [ ] npm test (coverage ≥80%)
   - [ ] Manual testing en localhost:3001

### Entregables:

- [ ] Código implementado según arquitectura
- [ ] Tests con cobertura ≥80%
- [ ] Documentación inline (JSDoc si necesario)
- [ ] Commit con conventional commits
- [ ] Screenshot o video de funcionalidad (si aplica)

### Notas:

[Cualquier consideración especial de la tarea]
```

---

## 🆘 Troubleshooting

### Problema: Build falla con errores de tipos

**Solución:**

```bash
# 1. Verificar node_modules actualizados
npm install

# 2. Limpiar caché de Next.js
rm -rf .next

# 3. Verificar tipos
npm run type-check

# 4. Rebuild
npm run build
```

### Problema: Tests fallan aleatoriamente

**Solución:**

```typescript
// Limpiar estado entre tests
beforeEach(() => {
  queryClient.clear();
  localStorage.clear();
  vi.clearAllMocks();
});
```

### Problema: React Query no refetch después de mutation

**Solución:**

```typescript
// Asegurarse de invalidar queries
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["readings"] });
  // o refetch específico
  queryClient.refetchQueries({ queryKey: ["readings", id] });
};
```

### Problema: ESLint errors por importaciones

**Solución:**

```typescript
// Verificar tsconfig.json tiene paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// Reiniciar TS server en VS Code
// Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 📊 Métricas de Éxito

Antes de considerar una tarea completada, verificar:

| Métrica           | Objetivo              | Verificación         |
| ----------------- | --------------------- | -------------------- |
| **Lint**          | 0 errores, 0 warnings | `npm run lint`       |
| **Type Check**    | 0 errores de tipos    | `npm run type-check` |
| **Build**         | Build exitoso         | `npm run build`      |
| **Tests**         | 100% pasando          | `npm test`           |
| **Coverage**      | ≥80% líneas           | `npm run test:cov`   |
| **Performance**   | Lighthouse ≥90        | Manual (solo pages)  |
| **Accessibility** | WCAG AA               | Manual               |
| **Bundle Size**   | <300KB inicial        | `npm run build`      |

---

## 🎓 Recursos de Aprendizaje

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Patrones y Best Practices

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)

---

## ✨ Resumen Ejecutivo para IA

**Antes de cada tarea:**

1. Leer ARCHITECTURE.md completo
2. Consultar DESIGN_HAND-OFF.md para UI
3. Entender tarea específica del backlog

**Durante desarrollo:**

1. Seguir TDD estricto (RED → GREEN → REFACTOR)
2. Respetar feature-based architecture
3. Usar TypeScript strict (NO any)
4. Componentizar (componentes pequeños)
5. Tests con ≥80% coverage

**Antes de commit:**

1. `npm run lint` → 0 errores
2. `npm run type-check` → 0 errores
3. `npm run format` → código formateado
4. `npm run build` → build exitoso
5. `npm test` → 100% pasando
6. Manual testing → funciona en localhost:3001

**Commit:**

- Conventional Commits: `feat(scope): description`
- Push a rama feature/TASK-X.Y

**¡Nunca:**

- ❌ Usar `any` en TypeScript
- ❌ Usar `eslint-disable`
- ❌ Fetch directo (usar React Query)
- ❌ Lógica en app/ pages (mover a components)
- ❌ Estilos hardcodeados (usar Design Tokens)
- ❌ Coverage <80%

---

**Última actualización:** 3 Diciembre 2025
