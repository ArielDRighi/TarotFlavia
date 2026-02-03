# CLAUDE.md - Frontend (Next.js)

> Contexto específico para desarrollo en el frontend. Lee primero el CLAUDE.md de la raíz.

## Stack

- **Framework**: Next.js 14 (App Router, TypeScript, React 18)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (global) + TanStack Query v5 (server state)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios con interceptors JWT
- **Testing**: Vitest + Testing Library (TDD)

## Arquitectura Feature-Based

```
src/
├── app/                    # SOLO rutas y layouts (NO lógica)
│   └── (ruta)/page.tsx     # Importa componentes de features/
├── components/
│   ├── ui/                 # shadcn/ui primitives (NO modificar)
│   └── features/           # Componentes de negocio por dominio
│       └── readings/
│           ├── ReadingCard.tsx
│           └── ReadingCard.test.tsx
├── hooks/
│   ├── api/                # React Query hooks
│   │   └── useReadings.ts
│   └── utils/              # Utility hooks
├── lib/
│   ├── api/
│   │   ├── apiClient.ts    # Axios configurado
│   │   ├── endpoints.ts    # Centralized endpoints
│   │   └── readings-api.ts # API functions
│   └── validations/        # Zod schemas
├── stores/                 # Zustand stores
└── types/                  # TypeScript types
    └── index.ts            # Centralized exports
```

## Patrones Obligatorios

### 1. NO lógica en app/ (solo rutas)
```typescript
// app/lecturas/page.tsx
// ✅ CORRECTO
export default function ReadingsPage() {
  return <ReadingsList />;  // Lógica en componente
}

// ❌ INCORRECTO
export default function ReadingsPage() {
  const [data, setData] = useState([]);
  // ... 200 líneas de lógica
}
```

### 2. Estructura de Componentes
```typescript
'use client';  // Línea 1 si es client component

// 1. React & Next.js
import { useState, useCallback } from 'react';
// 2. Icons
import { Plus } from 'lucide-react';
// 3. Third-party
import ReactMarkdown from 'react-markdown';
// 4. Custom hooks
import { useReadings } from '@/hooks/api/useReadings';
// 5. Components (ui → features)
import { Button } from '@/components/ui/button';
// 6. Utils & types
import { cn } from '@/lib/utils';
import type { Reading } from '@/types';

// Constants
const ITEMS_PER_PAGE = 10;

// Types
interface Props { reading: Reading; }

// Main Component
export function ReadingCard({ reading }: Props) {
  // 1. State
  const [isOpen, setIsOpen] = useState(false);
  // 2. Hooks
  const { data } = useReadings();
  // 3. Derived state
  const isEmpty = data?.length === 0;
  // 4. Handlers
  const handleClick = useCallback(() => {}, []);
  // 5. Effects
  useEffect(() => {}, []);
  // 6. Render
  return <div data-testid="reading-card">...</div>;
}
```

### 3. React Query Hooks
```typescript
// hooks/api/useReadings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReadings, deleteReading } from '@/lib/api/readings-api';

export function useReadings() {
  return useQuery({
    queryKey: ['readings'],
    queryFn: getReadings,
  });
}

export function useDeleteReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}
```

### 4. Endpoints Centralizados
```typescript
// ✅ CORRECTO
import { API_ENDPOINTS } from '@/lib/api/endpoints';
apiClient.post(API_ENDPOINTS.READINGS.BASE, data);

// ❌ INCORRECTO
apiClient.post('/readings', data);  // Hardcoded
```

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('ReadingCard', () => {
  it('should render reading question', () => {
    render(<ReadingCard reading={{ id: 1, question: 'Test?' }} />);
    expect(screen.getByText('Test?')).toBeInTheDocument();
  });

  it('should call onDelete when clicked', async () => {
    const onDelete = vi.fn();
    render(<ReadingCard onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalled();
  });
});
```

## Comandos

```bash
npm run dev                # Servidor desarrollo (3001)
npm run build              # Build producción
npm run test               # Tests en watch mode
npm run test:run           # Tests una vez
npm run test:coverage      # Tests + coverage
npm run lint               # Lint
npm run lint:fix           # Lint + autofix
npm run type-check         # Validar TypeScript
npm run format             # Prettier format
node scripts/validate-architecture.js  # Validar arquitectura
```

## Ciclo de Calidad Completo

```bash
npm run format && npm run lint:fix && npm run type-check && npm run test:run && npm run build && node scripts/validate-architecture.js
```

## Convenciones de Nomenclatura

| Tipo | Nomenclatura | Ejemplo |
|------|-------------|---------|
| Componentes | PascalCase.tsx | `ReadingCard.tsx` |
| Hooks | camelCase.ts (prefijo `use`) | `useReadings.ts` |
| Stores | camelCase.ts (sufijo `Store`) | `authStore.ts` |
| Tests | nombre.test.tsx | `ReadingCard.test.tsx` |
| Types | camelCase.types.ts | `reading.types.ts` |

## Prohibiciones

- ❌ `any` en TypeScript (usar tipos específicos o `unknown`)
- ❌ `eslint-disable` o `@ts-ignore`
- ❌ Fetch directo (usar React Query)
- ❌ Lógica en `app/` (mover a `components/features/`)
- ❌ Estilos hardcodeados (usar Design Tokens)
- ❌ Imports relativos largos (usar `@/`)
- ❌ Coverage <80%

## Documentación

- `docs/ARCHITECTURE.md` - Arquitectura completa
- `docs/AI_DEVELOPMENT_GUIDE.md` - Guía TDD
- `docs/DESIGN_HAND-OFF.md` - Design tokens y UI
