# Prompts para Desarrollo - Frontend TarotFlavia

> 📋 **Uso:** Copiar y pegar el prompt correspondiente según el tipo de tarea junto con la descripción específica de la tarea del backlog.

---

## 🆕 Prompt: Nueva Tarea de Desarrollo

````
OK, vamos a iniciar esta nueva tarea del frontend.

Tarea: TASK-X.Y: [Pega aquí la descripción detallada de la tarea del FRONTEND_BACKLOG.md]

**Workflow de Ejecución:**

**Autonomía Total:** Ejecuta la tarea de principio a fin sin solicitar confirmaciones intermedias.

**Rama:** Estás en develop (o main). Crea la rama feature/TASK-X.Y-descripcion-corta a partir de develop y trabaja en ella.

**Lectura Obligatoria (CRÍTICO):**

ANTES de escribir cualquier código, lee estos documentos:

1. `frontend/docs/ARCHITECTURE.md` (COMPLETO):
   - Feature-based structure (app/, components/, hooks/, stores/, lib/)
   - Separation of concerns por tipo de archivo
   - Data fetching con TanStack Query + Axios
   - Form handling con React Hook Form + Zod
   - Nomenclatura y convenciones
   - Anti-patterns a evitar

2. `frontend/docs/AI_DEVELOPMENT_GUIDE.md` (COMPLETO):
   - Workflow TDD estricto
   - Ciclos de calidad obligatorios
   - Implementación por capas con ejemplos
   - Reglas estrictas y prohibiciones
   - Plantilla de estructura de archivos

3. `frontend/docs/DESIGN_HAND-OFF.md` (CONSULTA):
   - Design Tokens (colores, tipografía, sombras)
   - Componentes UI base
   - Guías visuales de pantallas

**Arquitectura y Patrones (CRÍTICO):**

- **Feature-Based:** El código está organizado por dominio (`components/features/readings/`, `components/features/auth/`, etc). Crea archivos en el feature correspondiente.
- **Separation of Concerns:**
  - `app/` - Solo rutas y layouts (NO lógica)
  - `components/` - UI pura (presentacional)
  - `hooks/` - Lógica reutilizable y data fetching
  - `stores/` - Estado global (Zustand, minimalista)
  - `lib/` - Utilidades, configuraciones, schemas
- **Nomenclatura:**
  - Componentes: PascalCase.tsx (`ReadingCard.tsx`)
  - Hooks: camelCase.ts con prefijo 'use' (`useReadings.ts`)
  - Stores: camelCase.ts con sufijo 'Store' (`authStore.ts`)
  - Tests: nombre.test.tsx (`ReadingCard.test.tsx`)
- **ANTES de crear:** Inspecciona features existentes similares y replica su estructura exacta.

**Metodología (TDD Estricto):**

Sigue un ciclo TDD riguroso:

1. 🔴 **RED:** Escribe un test que falle
   - Crea archivo .test.tsx
   - Describe comportamiento esperado
   - Verifica que falle (npm test)

2. 🟢 **GREEN:** Escribe código mínimo para pasar test
   - Implementa solo lo necesario
   - Verifica que pase (npm test)
   - NO optimices todavía

3. 🔵 **REFACTOR:** Mejora el código
   - Elimina duplicación
   - Mejora nombres
   - Optimiza si es necesario
   - Verifica que tests sigan pasando

4. ♻️ **REPETIR** hasta completar funcionalidad

**Ciclo de Calidad (Pre-Commit):**

Al finalizar la implementación, ejecuta TODOS estos comandos:

```bash
npm run lint                          # 0 errores, 0 warnings
npm run type-check                    # 0 errores de tipos
npm run format                        # Formatear con Prettier
node scripts/validate-architecture.js # Validar arquitectura
npm run build                         # Build debe ser exitoso
npm test                              # 100% tests pasando
npm run test:cov                      # Coverage ≥ 80%
````

Corrige TODOS los errores y warnings que surjan.

**PROHIBICIONES ESTRICTAS:**

🚫 Usar `any` en TypeScript (usar tipos específicos o `unknown`)
🚫 Usar `/* eslint-disable */` o `// @ts-ignore`
🚫 Fetch directo sin React Query
🚫 Lógica de negocio en app/ pages
🚫 Estilos hardcodeados (usar Design Tokens)
🚫 Coverage <80%
🚫 Importaciones relativas largas (usar @/ alias)

**Actualizar Backlog:**

Al finalizar, actualiza `frontend/docs/FRONTEND_BACKLOG.md`:

- Marca la tarea como completada
- Documenta cualquier decisión importante

**Validación Final:**

Asegúrate de que:

- ✅ Todos los tests pasan (npm test)
- ✅ Coverage ≥ 80%
- ✅ Build exitoso (npm run build)
- ✅ Lint sin errores (npm run lint)
- ✅ Type check sin errores
- ✅ App funciona en localhost:3001

**Push y Commit:**

```bash
git add .
git commit -m "feat(scope): description

- Detalle 1
- Detalle 2
- Tests con X% coverage"

git push origin feature/TASK-X.Y-descripcion
```

**Entregable:**

Proporcióname:

1. Resumen de archivos creados/modificados
2. Coverage de tests alcanzado
3. Screenshots o video de funcionalidad (si aplica)
4. Borrador del mensaje para Pull Request

```

---

## 🔧 Prompt: Refactorización

```

OK, vamos a ejecutar esta tarea de refactorización.

Tarea: REFACTOR-X.Y: [Pega aquí descripción de la refactorización]

**Contexto:**

- Esta es una refactorización para mejorar arquitectura/código
- NUNCA sacrifiques funcionalidad
- Objetivo: Mejorar estructura manteniendo comportamiento

**Workflow:**

**1. Preparación:**

- Lee `frontend/docs/ARCHITECTURE.md` (especialmente sección relevante)
- Ejecuta: `npm run lint && npm run type-check && npm run build && npm test`
- Documenta coverage ACTUAL (no puede bajar)
- Crea rama: `refactor/TASK-X.Y-descripcion-corta`

**2. Metodología: PRESERVE-VERIFY-REFACTOR**

- **PRESERVE:** Duplica (no muevas). Crea nueva estructura, COPIA archivos
- **VERIFY:** Valida todo funciona (`npm test && npm run build`)
- **REFACTOR:** Solo AHORA elimina código antiguo. Valida de nuevo

**3. Ejecución:**

- Sigue plan de refactorización paso a paso
- Checkpoint cada 3-5 cambios: `npm test && npm run build`
- NUNCA elimines tests - muévelos/adapta con el código
- Coverage >= baseline (obligatorio)
- Commits incrementales: `refactor(scope): paso X/N - descripción`

**4. Prohibiciones:**

🚫 Cambiar comportamiento funcional
🚫 Eliminar tests
🚫 Usar eslint-disable o ts-ignore
🚫 Bajar coverage
🚫 Romper build

**5. Validación Final:**

```bash
rm -rf .next node_modules/.cache
npm run lint && npm run type-check
npm run build && npm test && npm run test:cov
npm run dev  # Probar manualmente en localhost:3001
```

**6. Entregable:**

- Resumen: Archivos (movidos/creados/eliminados)
- Coverage: antes → después (debe ser >=)
- Diff: `git diff develop --stat`
- Validaciones: Build ✅, Tests ✅, Lint ✅, Type Check ✅
- Borrador PR

**Métricas de Éxito:**

✅ Lint sin errores
✅ Type check sin errores
✅ Build exitoso
✅ Todos los tests pasando
✅ Coverage >= baseline
✅ App funciona igual que antes
✅ Código más limpio/mantenible

```

---

## 🐛 Prompt: Corrección de Bug

```

OK, vamos a corregir este bug.

Bug: BUG-X.Y: [Pega aquí descripción del bug]

**Workflow:**

**1. Reproducir:**

- Crea rama: `fix/BUG-X.Y-descripcion-corta`
- Reproduce el bug localmente
- Documenta pasos exactos para reproducir
- Identifica archivos/funciones afectadas

**2. Test que Reproduce Bug (TDD):**

ANTES de corregir, escribe un test que FALLE y demuestre el bug:

```typescript
// tests/components/[Component].test.tsx
it('should [comportamiento correcto esperado]', () => {
  // Setup que reproduce el bug

  // Assertion que falla actualmente
  expect(actual).toBe(expected); // ❌ Falla por el bug
});
```

Ejecuta: `npm test` → debe FALLAR

**3. Corregir Bug:**

- Corrige SOLO el bug (no refactorices ahora)
- Código mínimo necesario
- Ejecuta: `npm test` → debe PASAR ✅

**4. Prevenir Regresión:**

Agrega tests adicionales si es necesario:

- Edge cases
- Casos límite
- Variaciones del bug

**5. Validación:**

```bash
npm run lint
npm run type-check
npm run build
npm test           # Incluye nuevo test + todos los existentes
npm run test:cov   # Coverage no debe bajar
```

**6. Commit:**

```bash
git commit -m "fix(scope): correct [problema específico]

Fixes #[issue-number] (si aplica)

- Test que reproduce bug
- Corrección mínima
- Tests de regresión"
```

**Entregable:**

1. Test que demuestra el bug (antes falla, después pasa)
2. Corrección aplicada
3. Explicación de la causa raíz
4. Tests adicionales para prevenir regresión

```

---

## 📝 Prompt: Feedback de Pull Request

```

Tengo el siguiente feedback del PR para la rama feature/TASK-X.Y.

Feedback Recibido: [Pega aquí el feedback completo del revisor]

**Tu Tarea (Análisis Senior):**

**1. Analiza y Valida:**

Lee críticamente cada punto del feedback:

- ¿Es técnicamente correcto?
- ¿Mejora la calidad del código?
- ¿Sigue la arquitectura definida?

**2. Clasifica Feedback:**

- ✅ **Aplicar:** Feedback válido que mejora el código
- ⚠️ **Discutir:** No estás de acuerdo (prepara argumentos)
- ℹ️ **Aclarar:** Necesitas más contexto

**3. Aplica Correcciones:**

Para feedback ✅ Aplicar:

- Implementa cambios solicitados
- Si implican lógica, actualiza tests
- Mantén TDD: test → código → refactor

**4. Justifica (Pushback):**

Para feedback ⚠️ Discutir:

Prepara respuesta técnica:

```markdown
@[reviewer] Gracias por el feedback. Sobre [punto específico]:

**Contexto:** [Explica por qué lo hiciste así]

**Razón:** [Justificación técnica con referencias]

**Alternativas consideradas:** [Otras opciones evaluadas]

**Propuesta:** [Mantener como está / Alternativa mejor]
```

**5. Calidad y TDD:**

Si las correcciones cambian lógica:

- Actualiza tests existentes
- Agrega nuevos tests si es necesario
- Ejecuta ciclo completo:

```bash
npm run lint
npm run type-check
npm run build
npm test
npm run test:cov
```

**6. Commit de Correcciones:**

```bash
# NUNCA uses --amend (complica historial + force push)
git add .
git commit -m "fix: apply PR feedback - [descripción]

Addressed:
- [Punto 1 del feedback]
- [Punto 2 del feedback]"

git push origin feature/TASK-X.Y
```

**Entregable:**

1. ✅ Cambios aplicados (con justificación)
2. ⚠️ Feedback en discusión (con argumentos)
3. ✅ Tests actualizados/agregados
4. ✅ Ciclo de calidad completo ejecutado
5. Comentarios en PR respondiendo al feedback

```

---

## 🧪 Prompt: Agregar Tests a Código Existente

```

Necesito agregar tests completos a código existente sin tests.

Archivos: [Lista de archivos a testear]

**Workflow:**

**1. Análisis del Código:**

- Lee el código existente
- Identifica funcionalidades y casos de uso
- Lista edge cases y casos límite
- Revisa dependencias (hooks, APIs, stores)

**2. Estrategia de Testing:**

Para cada archivo, determina:

**Componentes:**

- ✅ Renderiza correctamente
- ✅ Props se pasan correctamente
- ✅ Eventos de usuario (clicks, inputs)
- ✅ Estados condicionales (loading, error, empty)
- ✅ Integración con hooks

**Hooks:**

- ✅ Retorna valores esperados
- ✅ Actualiza estado correctamente
- ✅ Maneja errores
- ✅ Side effects (invalidaciones, etc.)

**Utils/Lib:**

- ✅ Casos normales
- ✅ Edge cases
- ✅ Errores esperados

**3. Implementación de Tests:**

```typescript
// Estructura recomendada
describe('ComponentName', () => {
  // Setup común
  beforeEach(() => {
    // Limpiar estado
  });

  describe('Rendering', () => {
    it('should render with required props', () => {});
    it('should render loading state', () => {});
    it('should render error state', () => {});
    it('should render empty state', () => {});
  });

  describe('User Interactions', () => {
    it('should handle click events', () => {});
    it('should handle form submissions', () => {});
  });

  describe('Data Fetching', () => {
    it('should fetch data on mount', () => {});
    it('should refetch on dependency change', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined props', () => {});
    it('should handle network errors', () => {});
  });
});
```

**4. Mocking:**

```typescript
// Mock de React Query
vi.mock('@/hooks/api/useReadings', () => ({
  useReadings: vi.fn(() => ({
    data: mockData,
    isLoading: false,
    error: null,
  })),
}));

// Mock de Zustand
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser,
    token: 'mock-token',
  })),
}));
```

**5. Coverage Target:**

- ✅ Líneas: ≥80%
- ✅ Branches: ≥75%
- ✅ Functions: ≥80%
- ✅ Statements: ≥80%

**6. Validación:**

```bash
npm test -- [archivo].test.tsx    # Test específico
npm run test:cov                   # Verificar coverage
```

**Entregable:**

1. Tests completos para todos los archivos
2. Coverage ≥80% en cada archivo
3. Documentación de casos complejos
4. Commit: `test(scope): add comprehensive tests for [feature]`

```

---

## 🎨 Prompt: Implementar Diseño UI

```

Voy a implementar el diseño UI de [pantalla/componente].

Diseño: [Referencia a DESIGN_HAND-OFF.md o mockup]

**Workflow:**

**1. Análisis del Diseño:**

Lee `frontend/docs/DESIGN_HAND-OFF.md`:

- ✅ Design Tokens (colores, tipografía, espaciados)
- ✅ Componentes base a usar (shadcn/ui)
- ✅ Guía visual de la pantalla

**2. Planificación de Componentes:**

Descompón el diseño en componentes:

- Layout principal
- Secciones (Header, Content, Footer)
- Componentes reutilizables
- Estados (loading, error, empty)

**3. Implementación Bottom-Up:**

Orden de desarrollo:

1. Componentes atómicos (Button, Card, Input)
2. Componentes moleculares (Form, Card completa)
3. Componentes organism (Sección completa)
4. Template/Page (Layout final)

**4. Design Tokens (OBLIGATORIO):**

✅ USAR Design Tokens del `tailwind.config.js`:

```tsx
// ✅ CORRECTO
<div className="bg-bg-main text-text-primary">
<h1 className="font-serif text-primary">
<Card className="shadow-soft">

// ❌ INCORRECTO - NO hardcodear
<div style={{ backgroundColor: '#F9F7F2' }}>
<h1 style={{ fontFamily: 'Cormorant Garamond' }}>
```

**5. Componentes shadcn/ui:**

Usa componentes de `@/components/ui/`:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// NO reimplementes componentes que ya existen
```

**6. Responsive Design:**

```tsx
// Mobile-first approach
<div className="
  grid grid-cols-1           // Mobile
  md:grid-cols-2             // Tablet
  lg:grid-cols-3             // Desktop
  gap-4
">
```

**7. Accessibility:**

```tsx
// Semántica HTML
<button aria-label="Cerrar modal">
  <XIcon aria-hidden="true" />
</button>

// Focus visible
<Input className="focus:ring-2 focus:ring-primary" />

// Contraste adecuado (verificar con DevTools)
```

**8. Testing UI:**

```typescript
describe("ReadingCard UI", () => {
  it("should match design tokens", () => {
    render(<ReadingCard {...props} />);

    const card = screen.getByRole("article");
    expect(card).toHaveClass("shadow-soft");
  });

  it("should be responsive", () => {
    // Test mobile, tablet, desktop viewports
  });
});
```

**9. Validación:**

```bash
npm run build              # Verificar CSS se genera correctamente
npm test                   # Tests de componentes UI
npm run dev                # Verificar visualmente en localhost:3001
```

Verificar manualmente:

- ✅ Design tokens correctos
- ✅ Responsive en mobile/tablet/desktop
- ✅ Accessibility (teclado, screen reader)
- ✅ Estados (hover, focus, active, disabled)

**Entregable:**

1. Componentes UI implementados
2. Usa Design Tokens (NO hardcodeo)
3. Responsive design
4. Accesible (a11y)
5. Tests de UI
6. Screenshots en diferentes viewports

```

---

## 📦 Prompt: Configurar Nueva Dependencia

```

Necesito agregar una nueva dependencia al proyecto.

Dependencia: [nombre de la dependencia]
Propósito: [para qué se usará]

**Workflow:**

**1. Justificación:**

Antes de instalar, verifica:

- ✅ ¿Realmente necesitamos esta dependencia?
- ✅ ¿No existe funcionalidad similar ya instalada?
- ✅ ¿Es mantenida activamente? (último commit <6 meses)
- ✅ ¿Tiene buena reputación? (downloads, stars, issues)

**2. Instalación (Monorepo Context):**

```bash
# Desde carpeta frontend/
cd frontend
npm install [dependencia]

# O desde raíz del monorepo
npm install [dependencia] -w frontend

# Dev dependency
npm install -D [dependencia] -w frontend
```

**3. Configuración:**

Si requiere configuración:

- Crear archivo de config en `lib/config/`
- Documentar en README.md del frontend
- Agregar tipos si es TypeScript

**4. Wrapper (Recomendado):**

Encapsula la dependencia en un wrapper:

```typescript
// lib/[nombre]/[nombre]-client.ts
import ExternalLib from 'external-lib';

// Wrapper para aislar dependencia
export const clientInstance = new ExternalLib({
  // config
});

export function helperFunction() {
  return clientInstance.method();
}
```

Beneficios:

- Fácil cambiar dependencia en el futuro
- Un solo punto de configuración
- Testeable (mock del wrapper)

**5. Documentación:**

Actualiza:

- `package.json` - Dependencia agregada
- `README.md` - Para qué se usa
- `ARCHITECTURE.md` - Si afecta arquitectura

**6. Tests:**

```typescript
// tests/lib/[nombre].test.ts
describe('[Nombre] Client', () => {
  it('should initialize correctly', () => {});
  it('should handle errors', () => {});
});
```

**7. Validación:**

```bash
npm run type-check     # Verificar tipos
npm run build          # Build exitoso
npm test               # Tests pasan
```

**Entregable:**

1. Dependencia instalada
2. Configuración en lib/config/ (si aplica)
3. Wrapper implementado (recomendado)
4. Tests básicos
5. Documentación actualizada
6. Commit: `chore(deps): add [dependencia] for [propósito]`

```

---

## 🚀 Prompt: Optimización de Performance

```

Necesito optimizar el performance de [componente/página].

Problema: [Descripción del problema de performance]

**Workflow:**

**1. Medición (Baseline):**

```bash
# Lighthouse en Chrome DevTools
npm run build
npm run start
# Abrir Chrome DevTools → Lighthouse → Run

# Documentar scores actuales:
# - Performance: X/100
# - First Contentful Paint: X ms
# - Time to Interactive: X ms
# - Total Bundle Size: X KB
```

**2. Identificación de Problemas:**

Usa herramientas:

- Chrome DevTools → Performance tab
- React DevTools → Profiler
- Lighthouse → Opportunities

Problemas comunes:

- ❌ Re-renders innecesarios
- ❌ Bundles grandes
- ❌ Imágenes sin optimizar
- ❌ Datos que no usan React Query cache
- ❌ Components no lazy loaded

**3. Optimizaciones:**

**A. Memoization:**

```tsx
// Solo si hay re-renders costosos (profiler primero)
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => heavyComputation(data), [data]);

  const handleClick = useCallback(() => doSomething(data), [data]);

  return <div onClick={handleClick}>{processed}</div>;
});
```

**B. Code Splitting:**

```tsx
// Lazy load componentes pesados
const AdminDashboard = lazy(() => import('@/components/features/admin/Dashboard'));

function AdminPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

**C. Image Optimization:**

```tsx
// Usar next/image siempre
import Image from 'next/image';

<Image
  src={tarotista.avatar}
  alt={tarotista.name}
  width={300}
  height={300}
  loading="lazy" // Lazy loading
  placeholder="blur" // Blur placeholder
/>;
```

**D. React Query Optimization:**

```tsx
// Configurar staleTime adecuado
export function useReadings() {
  return useQuery({
    queryKey: ['readings'],
    queryFn: fetchReadings,
    staleTime: 5 * 60 * 1000, // 5 min (datos no cambian frecuentemente)
    gcTime: 10 * 60 * 1000, // 10 min (garbage collection)
  });
}
```

**E. Bundle Size:**

```bash
# Analizar bundle
npm run build
npm run analyze   # Si tienes @next/bundle-analyzer

# Eliminar imports no usados
# Usar dynamic imports para código condicional
```

**4. Medición (After):**

```bash
# Re-ejecutar Lighthouse
# Comparar con baseline:
# - Performance: X → Y (+Z puntos)
# - FCP: X ms → Y ms (-Z ms)
# - Bundle: X KB → Y KB (-Z KB)
```

**5. Testing:**

```bash
# Verificar que optimizaciones no rompieron nada
npm test
npm run build
npm run dev  # Probar manualmente
```

**6. Documentación:**

```markdown
## Performance Optimization [Componente]

**Baseline:**

- Performance: 65/100
- FCP: 2.5s
- Bundle: 450KB

**Optimizations Applied:**

1. Memoized expensive calculations
2. Lazy loaded AdminDashboard
3. Optimized images with next/image
4. Increased React Query staleTime

**Results:**

- Performance: 65 → 88 (+23)
- FCP: 2.5s → 1.2s (-1.3s)
- Bundle: 450KB → 320KB (-130KB)
```

**Entregable:**

1. Métricas before/after
2. Optimizaciones aplicadas
3. Tests siguen pasando
4. Documentación de cambios
5. Commit: `perf(scope): optimize [componente] performance`

```

---

## 📊 Resumen de Prompts Disponibles

| Prompt | Cuándo Usar | Archivo |
|--------|-------------|---------|
| **Nueva Tarea** | Desarrollar nueva funcionalidad | Este documento |
| **Refactorización** | Mejorar código existente | Este documento |
| **Bug Fix** | Corregir un bug | Este documento |
| **PR Feedback** | Responder a revisión de código | Este documento |
| **Agregar Tests** | Testear código sin tests | Este documento |
| **UI Design** | Implementar diseño visual | Este documento |
| **Nueva Dependencia** | Agregar librería externa | Este documento |
| **Performance** | Optimizar velocidad/bundle | Este documento |

---

**Última actualización:** 3 Diciembre 2025
```
