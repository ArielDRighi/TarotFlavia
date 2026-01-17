# Workflow de Desarrollo Frontend - Auguria

> 📋 **Propósito:** Workflow TDD completo para tareas de frontend Next.js.
> 🤖 **Uso:** Este documento debe ser aplicado automáticamente cuando se inicia una tarea de frontend.
> 📅 **Last Updated:** January 17, 2026

---

## 🎯 Trigger Automático

**Cuando el usuario diga:**
- "Iniciar TASK-XXX del frontend"
- "Empezar tarea frontend TASK-XXX"
- Cualquier variación similar

**El agente debe aplicar este workflow automáticamente SIN pedir confirmación.**

---

## 📋 Workflow Completo

### Fase 0: Preparación

1. **Leer el backlog correspondiente** para entender el contexto completo de la tarea
2. **Crear rama de feature** siguiendo convención: `feature/TASK-XXX-descripcion-corta`
3. **Crear lista de tareas (TodoWrite)** con todos los pasos necesarios

### Fase 1: Análisis y Diseño (RED)

**Objetivo:** Entender qué se debe hacer antes de escribir código.

1. **Leer documentación relevante:**
   - `frontend/docs/ARCHITECTURE.md` - Arquitectura feature-based
   - `frontend/docs/AI_DEVELOPMENT_GUIDE.md` - Guía de desarrollo
   - `frontend/docs/DESIGN_HAND-OFF.md` - Design tokens y UI
   - `.github/copilot-instructions.md` - Reglas de contrato

2. **Analizar código existente:**
   - Buscar componentes/hooks similares para seguir patrones
   - Identificar dependencias (tipos, hooks, API endpoints)
   - Revisar estructura de carpetas del feature afectado

3. **Diseñar la solución:**
   - Definir qué archivos se necesitan crear/modificar
   - Identificar tipos TypeScript necesarios
   - Planificar estructura de tests
   - Identificar componentes reutilizables vs nuevos

4. **Escribir tests PRIMERO (TDD - Red Phase):**
   ```bash
   # Los tests deben FALLAR porque no hay implementación aún
   npm run test -- src/path/to/new-feature.test.tsx
   ```
   - Tests unitarios para componentes
   - Tests para hooks personalizados
   - Tests para casos de éxito y error
   - Tests para edge cases

### Fase 2: Implementación (GREEN)

**Objetivo:** Hacer que los tests pasen con la implementación mínima.

5. **Implementar siguiendo arquitectura feature-based:**
   ```
   frontend/src/
   ├── app/                    # SOLO rutas y layouts (NO lógica)
   │   └── (ruta)/
   │       ├── page.tsx        # Cliente o servidor según necesidad
   │       └── layout.tsx
   ├── components/
   │   ├── ui/                 # shadcn/ui primitives (NO modificar)
   │   └── features/           # Componentes de negocio por dominio
   │       └── feature-name/
   │           ├── FeatureComponent.tsx
   │           ├── FeatureComponent.test.tsx
   │           └── index.ts
   ├── hooks/
   │   ├── api/                # React Query hooks
   │   │   ├── useFeature.ts
   │   │   └── useFeature.test.ts
   │   └── utils/              # Utility hooks
   ├── lib/
   │   ├── api/
   │   │   ├── endpoints.ts    # Centralized endpoints
   │   │   ├── feature-api.ts  # API functions
   │   │   └── feature-api.test.ts
   │   ├── utils/
   │   │   ├── helper.ts
   │   │   └── helper.test.ts
   │   └── validations/        # Zod schemas
   ├── stores/                 # Zustand stores (global state)
   └── types/                  # TypeScript types
       ├── feature.types.ts
       ├── feature.types.test.ts
       └── index.ts            # Centralized exports
   ```

6. **Orden de implementación:**
   
   **a) Types primero (`types/`):**
   ```typescript
   // feature.types.ts
   export interface Feature {
     id: number;              // IDs siempre numéricos
     name: string;
     // ...
   }
   
   export type FeatureStatus = 'active' | 'inactive';
   ```
   
   **b) Endpoints centralizados (`lib/api/endpoints.ts`):**
   ```typescript
   export const API_ENDPOINTS = {
     // ... existing endpoints
     FEATURE: {
       BASE: '/feature',
       BY_ID: (id: number) => `/feature/${id}`,
       // ...
     },
   } as const;
   ```
   
   **c) API functions (`lib/api/feature-api.ts`):**
   ```typescript
   import { apiClient } from './apiClient';
   import { API_ENDPOINTS } from './endpoints';
   
   export async function getFeatures(): Promise<Feature[]> {
     const response = await apiClient.get(API_ENDPOINTS.FEATURE.BASE);
     return response.data;
   }
   ```
   
   **d) React Query hooks (`hooks/api/useFeature.ts`):**
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { getFeatures } from '@/lib/api/feature-api';
   
   export function useFeatures() {
     return useQuery({
       queryKey: ['features'],
       queryFn: getFeatures,
     });
   }
   ```
   
   **e) Componentes (`components/features/feature-name/`):**
   ```typescript
   'use client';  // Línea 1 si es client component
   
   // 1. React & Next.js
   import { useState } from 'react';
   // 2. Icons
   import { Plus } from 'lucide-react';
   // 3. Third-party
   // 4. Custom hooks
   import { useFeatures } from '@/hooks/api/useFeature';
   // 5. Components (ui → features)
   import { Button } from '@/components/ui/button';
   // 6. Utils & types
   import { cn } from '@/lib/utils';
   import type { Feature } from '@/types';
   
   // Constants
   const CONSTANTS = { /* ... */ };
   
   // Types
   interface Props { /* ... */ }
   
   // Helpers (funciones auxiliares)
   function helper() { /* ... */ }
   
   // Sub-components (si son pequeños y específicos)
   function SubComponent() { /* ... */ }
   
   // Main Component
   export function FeatureComponent({ prop }: Props) {
     // 1. State
     const [state, setState] = useState();
     
     // 2. Hooks
     const { data, isLoading } = useFeatures();
     
     // 3. Derived state
     const isEmpty = data?.length === 0;
     
     // 4. Handlers
     const handleClick = useCallback(() => {}, []);
     
     // 5. Effects
     useEffect(() => {}, []);
     
     // 6. Render
     return (
       <div data-testid="feature-component">
         {/* Spanish for user-facing text */}
         <h1>Título en Español</h1>
       </div>
     );
   }
   ```

7. **Convenciones críticas:**
   - `'use client'` en línea 1 para client components
   - `data-testid` en elementos principales para testing
   - Texto user-facing en **español**
   - IDs siempre **numéricos** (nunca strings)
   - Usar `API_ENDPOINTS` (nunca hardcodear)
   - Tipos TypeScript estrictos (no `any`)
   - Paginación: `{ data: [], meta: { page, limit, totalItems, totalPages } }`

8. **Ejecutar tests:**
   ```bash
   npm run test -- src/path/to/feature.test.tsx
   # Deben PASAR TODOS los tests
   ```

### Fase 3: Refactorización (REFACTOR)

**Objetivo:** Mejorar código sin cambiar comportamiento.

9. **Refactorizar:**
   - Extraer componentes reutilizables
   - Crear custom hooks si hay lógica repetida
   - Optimizar imports (orden correcto)
   - Mejorar nombres de variables/funciones
   - Aplicar principios de composición

10. **Ejecutar tests nuevamente:**
    ```bash
    npm run test -- src/path/to/feature.test.tsx
    # Deben seguir pasando después de refactorizar
    ```

### Fase 4: Validación de Calidad

**Objetivo:** Garantizar que el código cumple estándares del proyecto.

11. **Ejecutar suite completa de validaciones:**
    ```bash
    # Desde frontend/
    npm run lint                # Lint
    npm run lint:fix            # Lint + autofix
    npm run type-check          # TypeScript validation
    npm run test:run            # Tests sin watch mode
    npm run test:coverage       # Coverage ≥ 80%
    npm run build               # Build production
    ```

12. **Verificar reglas críticas:**
    - ✅ No hay `any` types sin justificación
    - ✅ Coverage ≥ 80%
    - ✅ Todos los tests pasan
    - ✅ Type-check sin errores
    - ✅ Build exitoso
    - ✅ No hay lógica en `app/` (solo rutas/layouts)
    - ✅ IDs son numéricos
    - ✅ Endpoints centralizados
    - ✅ Texto user-facing en español
    - ✅ `'use client'` en client components

### Fase 5: Documentación y Commit

13. **Actualizar documentación:**
    - Marcar tarea como completada en el backlog correspondiente
    - Agregar notas técnicas relevantes en el backlog
    - Actualizar `ARCHITECTURE.md` si hay cambios estructurales

14. **Crear commit siguiendo convenciones:**
    ```bash
    # Convención: tipo(scope): descripción
    # Tipos: feat, fix, refactor, test, docs, style, chore
    
    git add .
    git commit -m "feat(feature): descripción en español de la feature"
    
    # Ejemplo:
    # git commit -m "feat(horoscope): add zodiac sign calculation utilities"
    ```

15. **Push y crear PR:**
    ```bash
    git push -u origin feature/TASK-XXX-descripcion
    
    # Crear PR con:
    # - Título descriptivo
    # - Resumen de cambios (bullet points)
    # - Referencia a la tarea (TASK-XXX)
    # - Screenshots/video si hay cambios visuales
    # - Checklist de validaciones completadas
    ```

---

## 🔍 Checklist Final

Antes de crear el PR, verificar:

- [ ] Tests escritos ANTES de implementación (TDD)
- [ ] Todos los tests pasan (`npm run test:run`)
- [ ] Coverage ≥ 80% (`npm run test:coverage`)
- [ ] Lint sin errores (`npm run lint`)
- [ ] Type-check sin errores (`npm run type-check`)
- [ ] Build exitoso (`npm run build`)
- [ ] No hay lógica en `app/` (solo rutas/layouts)
- [ ] IDs numéricos (no strings)
- [ ] Endpoints centralizados (no hardcodeados)
- [ ] Texto user-facing en español
- [ ] `'use client'` en client components
- [ ] `data-testid` en elementos principales
- [ ] Types exportados en `types/index.ts`
- [ ] Documentación actualizada
- [ ] Backlog actualizado con estado de tarea
- [ ] Commit message sigue convención
- [ ] PR creado con descripción completa

---

## ⚠️ Reglas Críticas

1. **TDD NO ES OPCIONAL** - Tests primero, implementación después
2. **NO poner lógica en app/** - Solo rutas y layouts
3. **NO modificar contratos de API** sin aprobación explícita
4. **NO usar `any`** - TypeScript estricto
5. **NO hardcodear endpoints** - Usar `API_ENDPOINTS`
6. **NO usar inglés** en texto user-facing
7. **NO olvidar `'use client'`** en client components
8. **NO crear PR** sin pasar todas las validaciones

---

## 📚 Documentos de Referencia

- `frontend/docs/ARCHITECTURE.md` - Arquitectura feature-based
- `frontend/docs/AI_DEVELOPMENT_GUIDE.md` - Guía de desarrollo TDD
- `frontend/docs/DESIGN_HAND-OFF.md` - Design tokens y UI
- `frontend/docs/FRONTEND_BACKLOG.md` - Estado de tareas
- `.github/copilot-instructions.md` - Reglas de contratos
- `AGENTS.md` - Guía para agentes IA

---

**End of Workflow** - Aplicar este proceso en TODAS las tareas de frontend.
