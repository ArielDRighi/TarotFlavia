# Script de Validación de Arquitectura Frontend

## 📋 Propósito

Este script valida que el código frontend siga la arquitectura feature-based y las reglas definidas en `ARCHITECTURE.md`.

## 🚀 Uso

```bash
# Desde carpeta frontend/
node scripts/validate-architecture.js

# El script retorna:
# - Exit code 0: Todo OK
# - Exit code 1: Errores encontrados (bloquea commit)
```

## ✅ Validaciones Ejecutadas

### 1. Nomenclatura de Archivos

**Regla:** Archivos deben seguir convenciones según su tipo.

**Valida:**

- ✅ Componentes React (`.tsx`) → `PascalCase.tsx`

  - ✅ Correcto: `ReadingCard.tsx`, `LoginForm.tsx`
  - ❌ Incorrecto: `readingCard.tsx`, `reading-card.tsx`

- ✅ Hooks (en `hooks/`) → `useCamelCase.ts`

  - ✅ Correcto: `useReadings.ts`, `useAuth.ts`
  - ❌ Incorrecto: `readings.ts`, `UseReadings.ts`

- ✅ Stores (en `stores/`) → `camelCaseStore.ts`
  - ✅ Correcto: `authStore.ts`, `readingStore.ts`
  - ❌ Incorrecto: `AuthStore.ts`, `auth.ts`

**Severidad:** ❌ ERROR

---

### 2. No Uso de 'any'

**Regla:** TypeScript debe tener tipos específicos. Prohibido usar `any`.

**Valida:**

- ✅ No hay `: any` en declaraciones
- ✅ No hay `<any>` en genéricos

**Ejemplo:**

```typescript
// ❌ DETECTA ESTO
function handleData(data: any) {}
const response: any = await fetch();

// ✅ ESTO ES CORRECTO
function handleData(data: Reading) {}
const response: unknown = await fetch();
```

**Severidad:** ❌ ERROR

---

### 3. No Disable Directives

**Regla:** Prohibido usar `eslint-disable`, `@ts-ignore`, `@ts-nocheck`.

**Valida:**

- ✅ No hay `/* eslint-disable */`
- ✅ No hay `// @ts-ignore`
- ✅ No hay `// @ts-nocheck`

**Razón:** Estos comentarios ocultan problemas reales que deben ser corregidos.

**Severidad:** ❌ ERROR

---

### 4. Importaciones con Alias

**Regla:** Usar alias `@/` para importaciones en lugar de rutas relativas largas.

**Valida:**

- ⚠️ Detecta importaciones relativas de 2+ niveles (`../../`)

**Ejemplo:**

```typescript
// ⚠️ WARNING
import { Button } from "../../../components/ui/button";

// ✅ CORRECTO
import { Button } from "@/components/ui/button";
```

**Severidad:** ⚠️ WARNING

---

### 5. No Lógica de Negocio en app/

**Regla:** `app/` solo debe contener rutas y layouts. Lógica va en `components/features/`.

**Valida:**

- ⚠️ Detecta `useState`, `useEffect`, `useQuery`, `useMutation` en `page.tsx`

**Ejemplo:**

```typescript
// ⚠️ WARNING - app/lecturas/page.tsx
export default function ReadingsPage() {
  const [data, setData] = useState([]); // ⚠️ Lógica aquí
  useEffect(() => { ... }); // ⚠️ Lógica aquí
  return <div>...</div>;
}

// ✅ CORRECTO - app/lecturas/page.tsx
import { ReadingsList } from '@/components/features/readings/ReadingsList';

export default function ReadingsPage() {
  return <ReadingsList />; // Solo renderiza componente
}

// ✅ CORRECTO - components/features/readings/ReadingsList.tsx
export function ReadingsList() {
  const { data } = useReadings(); // Lógica aquí
  return <div>...</div>;
}
```

**Severidad:** ⚠️ WARNING

---

### 6. Estructura Feature-Based

**Regla:** Componentes deben estar organizados en `components/features/[dominio]/`.

**Valida:**

- ✅ Existen carpetas de features (`readings`, `auth`, `marketplace`, `admin`)
- ⚠️ No hay componentes sueltos en `components/` (deben estar en `features/` o `ui/`)

**Estructura esperada:**

```
components/
├── ui/                    # shadcn/ui base
└── features/              # Componentes de negocio
    ├── readings/
    ├── marketplace/
    ├── auth/
    └── admin/
```

**Severidad:** ⚠️ WARNING

---

### 7. Hooks API Usan React Query

**Regla:** Hooks en `hooks/api/` deben usar React Query, no `fetch()` directo.

**Valida:**

- ❌ Detecta `fetch(` o `axios.` sin `useQuery` o `useMutation`

**Ejemplo:**

```typescript
// ❌ ERROR - hooks/api/useReadings.ts
export function useReadings() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/readings').then(...); // ❌ Fetch directo
  }, []);

  return data;
}

// ✅ CORRECTO - hooks/api/useReadings.ts
import { useQuery } from '@tanstack/react-query';

export function useReadings() {
  return useQuery({
    queryKey: ['readings'],
    queryFn: () => apiClient.get('/readings'),
  });
}
```

**Severidad:** ❌ ERROR

---

## 📊 Reporte de Salida

El script genera un reporte detallado:

### Ejemplo de Salida Exitosa

```
🏗️  Validador de Arquitectura Frontend - TarotFlavia

📝 Validando nomenclatura de archivos...
   ✅ Nomenclatura correcta

🔍 Validando uso de "any" en TypeScript...
   ✅ No se detectó uso de "any"

🚫 Validando eslint-disable y ts-ignore...
   ✅ No se detectaron disable directives

📦 Validando importaciones...
   ✅ Importaciones correctas

📁 Validando directorio app/...
   ✅ No se detectó lógica de negocio en app/

🎯 Validando estructura feature-based...
   ✅ 4 features detectadas: readings, auth, marketplace, admin

🪝 Validando estructura de hooks...
   ✅ Hooks API usan React Query correctamente

================================================================================
📊 REPORTE DE VALIDACIÓN DE ARQUITECTURA
================================================================================

✅ VALIDACIÓN EXITOSA - Arquitectura correcta
================================================================================
```

### Ejemplo de Salida con Errores

```
❌ ERRORES CRÍTICOS (3):

1. [NO_ANY] components/features/readings/ReadingCard.tsx
   Línea 15
   Usage of 'any' type detected. Use specific types or 'unknown'.
   > const data: any = props.reading;

2. [NO_DISABLE] components/features/auth/LoginForm.tsx
   Línea 8
   Disable directive detected. Fix the actual problem instead.
   > // eslint-disable-next-line @typescript-eslint/no-explicit-any

3. [NOMENCLATURE] components/features/readings/readingCard.tsx
   Component file must be PascalCase: readingCard.tsx

⚠️  WARNINGS (2):

1. [IMPORT_ALIAS] components/features/readings/ReadingsList.tsx
   Línea 3
   Long relative import detected. Consider using '@/' alias.
   > import { Button } from '../../../ui/button';

2. [APP_LOGIC] app/lecturas/page.tsx
   Línea 12
   Business logic detected in page component. Move to feature components.
   > const { data } = useReadings();

================================================================================
❌ VALIDACIÓN FALLIDA - Corregir errores antes de commit
================================================================================
```

---

## 🔧 Integración en Workflow

### 1. Ejecutar Manualmente

```bash
node scripts/validate-architecture.js
```

### 2. Incluir en Script `quality`

```json
{
  "scripts": {
    "validate": "node scripts/validate-architecture.js",
    "quality": "npm run lint && npm run type-check && npm run validate && npm run build && npm run test"
  }
}
```

### 3. Pre-commit Hook (Opcional)

```bash
# .husky/pre-commit
npm run validate
```

---

## ⏭️ Cuando el Proyecto No Está Inicializado

Si `src/` no existe (proyecto no inicializado con Next.js), el script:

1. Detecta que no hay directorio `src/`
2. Muestra mensaje informativo
3. Termina con exit code 0 (sin bloquear)

```
⏭️  Directorio src/ no existe. Proyecto aún no inicializado (ejecutar TAREA 0.1).
✅ Validación omitida - Setup pendiente
```

---

## 🆚 Diferencias con ESLint

| Aspecto          | ESLint                  | validate-architecture.js                |
| ---------------- | ----------------------- | --------------------------------------- |
| **Propósito**    | Calidad de código JS/TS | Arquitectura del proyecto               |
| **Valida**       | Sintaxis, bugs, estilo  | Organización, naming, patterns          |
| **Ejemplo**      | `no-unused-vars`        | `No lógica en app/`                     |
| **Configurable** | Sí (`.eslintrc`)        | No (reglas fijas)                       |
| **Ejecución**    | `npm run lint`          | `node scripts/validate-architecture.js` |

**Ambos son complementarios y deben ejecutarse juntos.**

---

## 📝 Notas Importantes

1. **Severidades:**

   - ❌ **ERROR**: Bloquea commit (exit code 1)
   - ⚠️ **WARNING**: No bloquea, pero debe revisarse

2. **Ignorar Archivos:**

   - Automáticamente ignora: `.test.ts`, `.test.tsx`, `.d.ts`
   - No valida: `node_modules/`, `.next/`

3. **Falsos Positivos:**

   - Muy raros gracias a reglas específicas
   - Si encuentras uno, reportar para ajustar el script

4. **Performance:**
   - Rápido: ~1-2 segundos en proyectos medianos
   - No afecta significativamente el ciclo de desarrollo

---

## 🔄 Actualización del Script

Para agregar nuevas validaciones, editar `scripts/validate-architecture.js`:

```javascript
// Agregar nueva función de validación
function validateNewRule() {
  console.log("\n🔍 Validando nueva regla...\n");

  // Lógica de validación

  if (errorFound) {
    errors.push({
      file: relativePath,
      message: "Descripción del error",
      rule: "NEW_RULE",
    });
  }
}

// Agregar al main()
function main() {
  // ... validaciones existentes
  validateNewRule(); // Nueva validación
  printReport();
}
```

---

**Última actualización:** 3 Diciembre 2025
