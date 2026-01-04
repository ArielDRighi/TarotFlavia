# Arquitectura - Auguria Frontend

## Visión General

Frontend del marketplace de tarotistas construido con **Next.js 14** (App Router), aplicando arquitectura **feature-based con separation of concerns**.

**Tecnologías principales:**

- **Framework:** Next.js 14 (App Router, TypeScript, React 18)
- **Styling:** Tailwind CSS 3.x + Design Tokens personalizados
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **State Management:** Zustand (stores modulares)
- **Data Fetching:** TanStack Query v5 (React Query)
- **Validation:** Zod (schemas TypeScript-first)
- **HTTP Client:** Axios (con interceptors JWT)
- **Forms:** React Hook Form + Zod resolvers
- **Testing:** Vitest + Testing Library (TDD)

---

## Principios Arquitecturales

### 1. Feature-Based Structure

Organización por **dominio de negocio** en lugar de tipo técnico:

```
src/
├── app/                      # Next.js App Router (rutas)
│   ├── (auth)/              # Grupo de rutas autenticadas
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Grupo con layout dashboard
│   │   ├── lecturas/
│   │   ├── marketplace/
│   │   └── perfil/
│   ├── admin/               # Panel admin
│   └── layout.tsx           # Root layout
│
├── components/              # Componentes React
│   ├── ui/                  # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   └── features/            # Componentes de negocio (feature-based)
│       ├── readings/        # Todo relacionado a lecturas
│       │   ├── ReadingCard.tsx
│       │   ├── ReadingForm.tsx
│       │   ├── SpreadSelector.tsx
│       │   └── InterpretationView.tsx
│       │
│       ├── marketplace/     # Todo relacionado a marketplace
│       │   ├── TarotistaCard.tsx
│       │   ├── SessionBooking.tsx
│       │   └── RatingStars.tsx
│       │
│       ├── auth/            # Todo relacionado a autenticación
│       │   ├── LoginForm.tsx
│       │   └── RegisterForm.tsx
│       │
│       └── admin/           # Todo relacionado a admin
│           ├── StatsCards.tsx
│           └── UsersTable.tsx
│
├── hooks/                   # Custom hooks (feature-based)
│   ├── api/                 # React Query hooks
│   │   ├── useReadings.ts   # Queries/Mutations para readings
│   │   ├── useTarotistas.ts
│   │   ├── useAuth.ts
│   │   └── useUsers.ts
│   │
│   └── utils/               # Utility hooks
│       ├── useDebounce.ts
│       ├── useMediaQuery.ts
│       └── useLocalStorage.ts
│
├── stores/                  # Zustand stores (feature-based)
│   ├── authStore.ts         # Estado de autenticación
│   ├── readingStore.ts      # Estado temporal de lectura
│   └── uiStore.ts           # Estado UI global (modals, toasts)
│
├── lib/                     # Utilidades y configuraciones
│   ├── api/
│   │   ├── axios-config.ts  # Cliente Axios configurado
│   │   └── endpoints.ts     # Definición de endpoints
│   │
│   ├── validations/         # Schemas Zod
│   │   ├── auth.schemas.ts
│   │   ├── reading.schemas.ts
│   │   └── tarotista.schemas.ts
│   │
│   ├── utils/
│   │   ├── cn.ts            # Merge clases Tailwind
│   │   ├── format.ts        # Formateo de datos
│   │   └── dates.ts         # Utilidades de fechas
│   │
│   └── constants/
│       ├── routes.ts        # Rutas de la app
│       └── config.ts        # Configuraciones globales
│
└── types/                   # TypeScript types globales
    ├── api.types.ts         # Tipos de respuestas API
    ├── reading.types.ts
    ├── tarotista.types.ts
    └── user.types.ts
```

**Beneficios:**

- Todo relacionado a "readings" está junto (componentes + hooks + stores)
- Fácil encontrar y modificar funcionalidades completas
- Imports cortos y claros: `@/components/features/readings/ReadingCard`
- Preparado para extracción a microfrontends

---

### 2. Separation of Concerns

Cada tipo de archivo tiene **una responsabilidad clara**:

#### **App Router (`app/`)**

- ✅ Define rutas y layouts
- ✅ Maneja metadata SEO
- ✅ Server Components donde sea posible
- ❌ NO lógica de negocio (mover a componentes/hooks)

```tsx
// app/lecturas/page.tsx
import { ReadingsList } from '@/components/features/readings/ReadingsList';

export const metadata = {
  title: 'Mis Lecturas | Auguria',
};

export default function ReadingsPage() {
  return <ReadingsList />; // Componente con lógica
}
```

#### **Components (`components/`)**

- ✅ UI pura (presentacional)
- ✅ Props tipadas con TypeScript
- ✅ Separados en `ui/` (base) y `features/` (negocio)
- ❌ NO llamadas directas a API (usar hooks)
- ❌ NO lógica compleja (mover a hooks/utils)

```tsx
// components/features/readings/ReadingCard.tsx
interface ReadingCardProps {
  reading: Reading;
  onDelete: (id: string) => void;
}

export function ReadingCard({ reading, onDelete }: ReadingCardProps) {
  return <Card>{/* Solo UI, recibe datos y callbacks */}</Card>;
}
```

#### **Hooks (`hooks/`)**

- ✅ Encapsulan lógica reutilizable
- ✅ React Query para data fetching (`hooks/api/`)
- ✅ Custom hooks para comportamiento (`hooks/utils/`)
- ❌ NO componentes visuales

```tsx
// hooks/api/useReadings.ts
export function useReadings() {
  return useQuery({
    queryKey: ['readings'],
    queryFn: () => apiClient.get('/readings'),
  });
}

export function useDeleteReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/readings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
    },
  });
}
```

#### **Stores (`stores/`)**

- ✅ Estado global compartido (Zustand)
- ✅ Minimalista (solo lo que realmente es global)
- ❌ NO para data fetching (usar React Query)
- ❌ NO para estado de formularios (usar React Hook Form)

```tsx
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

#### **Lib (`lib/`)**

- ✅ Configuraciones (Axios, React Query)
- ✅ Utilidades puras (sin React hooks)
- ✅ Schemas de validación (Zod)
- ✅ Constantes

---

### 3. Data Fetching Strategy

**Patrón: TanStack Query + Axios**

```tsx
// 1. Configurar Axios (lib/api/axios-config.ts)
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Interceptor para JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Crear hooks de React Query (hooks/api/useReadings.ts)
export function useReadings(filters?: ReadingFilters) {
  return useQuery({
    queryKey: ['readings', filters],
    queryFn: () => apiClient.get('/readings', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// 3. Usar en componentes
function ReadingsList() {
  const { data, isLoading, error } = useReadings();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return data.map((reading) => <ReadingCard key={reading.id} {...reading} />);
}
```

**Reglas:**

- ✅ **Queries** para GET (lectura)
- ✅ **Mutations** para POST/PUT/DELETE (escritura)
- ✅ **Invalidate queries** después de mutaciones
- ✅ **Optimistic updates** para mejor UX
- ❌ **NO fetch directo** en componentes

---

### 4. Form Handling

**Patrón: React Hook Form + Zod**

```tsx
// 1. Schema de validación (lib/validations/reading.schemas.ts)
export const createReadingSchema = z.object({
  question: z.string().min(10, 'Mínimo 10 caracteres'),
  spreadType: z.enum(['SIMPLE', 'CRUZ_CELTA', 'TRES_CARTAS']),
  isPrivate: z.boolean().default(true),
});

type CreateReadingForm = z.infer<typeof createReadingSchema>;

// 2. Componente de formulario
function ReadingForm() {
  const { mutate, isPending } = useCreateReading();

  const form = useForm<CreateReadingForm>({
    resolver: zodResolver(createReadingSchema),
    defaultValues: { isPrivate: true },
  });

  const onSubmit = (data: CreateReadingForm) => {
    mutate(data, {
      onSuccess: () => toast.success('Lectura creada'),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('question')} />
      {form.formState.errors.question && (
        <ErrorMessage>{form.formState.errors.question.message}</ErrorMessage>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear Lectura'}
      </Button>
    </form>
  );
}
```

---

### 5. Styling Strategy

**Patrón: Tailwind CSS + Design Tokens + shadcn/ui**

```tsx
// 1. Design Tokens (tailwind.config.js)
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-main': '#F9F7F2',
        primary: '#805AD5',
        secondary: '#D69E2E',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(128, 90, 213, 0.1)',
      },
    },
  },
};

// 2. Utility para merge clases (lib/utils/cn.ts)
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 3. Uso en componentes
function ReadingCard({ className, ...props }) {
  return <Card className={cn('shadow-soft', className)}>{/* Merge automático de clases */}</Card>;
}
```

**Reglas:**

- ✅ Usar Design Tokens (NO colores hardcodeados)
- ✅ Componentes shadcn/ui como base
- ✅ `cn()` para merge de clases
- ❌ NO CSS modules (usar solo Tailwind)
- ❌ NO inline styles (excepto dinámicos)

---

### 6. Error Handling

**Estrategia en capas:**

```tsx
// 1. Axios Interceptor (lib/api/axios-config.ts)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Refresh token o redirect a login
    }
    throw new ApiError(error.response?.data?.message || 'Error desconocido');
  }
);

// 2. React Query Error Boundary (app/layout.tsx)
function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
    </QueryClientProvider>
  );
}

// 3. Manejo en componentes
function ReadingsList() {
  const { data, error } = useReadings();

  if (error) {
    return <ErrorMessage error={error} retry={() => refetch()} />;
  }

  // ...
}
```

---

### 7. Testing Strategy

**Patrón: TDD con Vitest + Testing Library**

```tsx
// tests/components/ReadingCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadingCard } from '@/components/features/readings/ReadingCard';

describe('ReadingCard', () => {
  it('should render reading question', () => {
    const reading = { id: '1', question: '¿Encontraré el amor?' };
    render(<ReadingCard reading={reading} />);

    expect(screen.getByText('¿Encontraré el amor?')).toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    const reading = { id: '1', question: 'Test' };

    render(<ReadingCard reading={reading} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

**Niveles de testing:**

1. **Unit tests** - Componentes, hooks, utils (TDD estricto)
2. **Integration tests** - Flujos completos con React Query
3. **E2E tests** - Playwright (post-MVP)

---

## Nomenclatura y Convenciones

### Archivos

| Tipo              | Nomenclatura                | Ejemplo                |
| ----------------- | --------------------------- | ---------------------- |
| Componentes React | PascalCase.tsx              | `ReadingCard.tsx`      |
| Hooks             | camelCase.ts (prefijo use)  | `useReadings.ts`       |
| Stores            | camelCase.ts (sufijo Store) | `authStore.ts`         |
| Utils             | camelCase.ts                | `format.ts`            |
| Types             | camelCase.types.ts          | `reading.types.ts`     |
| Schemas           | camelCase.schemas.ts        | `auth.schemas.ts`      |
| Tests             | nombre.test.tsx             | `ReadingCard.test.tsx` |

### Código

```tsx
// ✅ CORRECTO
export function ReadingCard({ reading }: ReadingCardProps) { }
export const useReadings = () => { };
export const authStore = create<AuthStore>(...);

// ❌ INCORRECTO
export const ReadingCard = ({ reading }) => { }; // Usar function declaration
export function getReadings() { } // Hooks deben empezar con 'use'
```

---

## Performance Optimization

### 1. Code Splitting

```tsx
// Lazy loading de componentes pesados
const AdminDashboard = lazy(() => import('@/components/features/admin/Dashboard'));

function AdminPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

### 2. Image Optimization

```tsx
import Image from 'next/image';

function TarotistaCard({ tarotista }) {
  return (
    <Image
      src={tarotista.avatar}
      alt={tarotista.name}
      width={100}
      height={100}
      loading="lazy" // Lazy loading automático
    />
  );
}
```

### 3. Memoization

```tsx
// Solo para componentes con re-renders costosos
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => heavyComputation(data), [data]);

  return <div>{processedData}</div>;
});
```

---

## Security Best Practices

### 1. XSS Prevention

```tsx
// ✅ CORRECTO - Sanitizar HTML del backend
import DOMPurify from 'dompurify';

function InterpretationView({ html }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html),
      }}
    />
  );
}

// ❌ INCORRECTO - Nunca confiar en HTML sin sanitizar
<div dangerouslySetInnerHTML={{ __html: untrustedHTML }} />;
```

### 2. Token Storage

```tsx
// ✅ CORRECTO - HttpOnly cookies (mejor opción)
// Configurado en el backend

// ✅ ACEPTABLE - localStorage con precauciones
const token = localStorage.getItem('access_token');

// ❌ INCORRECTO - sessionStorage (se pierde al cerrar)
```

### 3. CSRF Protection

```tsx
// Axios envía cookies automáticamente
apiClient.defaults.withCredentials = true;
```

---

## Accessibility (a11y)

```tsx
// ✅ Siempre usar labels semánticos
<Button aria-label="Eliminar lectura">
  <TrashIcon />
</Button>

// ✅ Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
  onClick={onClick}
>
  Click me
</div>

// ✅ Focus management
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);
```

---

## Reglas de Commits

Seguir **Conventional Commits** igual que el backend:

```
feat(readings): add trash functionality
fix(auth): correct refresh token flow
refactor(ui): migrate to shadcn button component
test(readings): add unit tests for ReadingCard
docs(arch): update data fetching strategy
```

**Tipos permitidos:**

- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `refactor` - Refactorización sin cambio funcional
- `test` - Agregar/modificar tests
- `docs` - Documentación
- `style` - Formato, lint
- `perf` - Mejora de performance
- `chore` - Tareas de mantenimiento

---

## Anti-Patterns a Evitar

### ❌ Prop Drilling

```tsx
// MALO
<Parent>
  <Child level1={data}>
    <Child level2={data}>
      <Child level3={data} /> {/* Pasar props por 3 niveles */}
    </Child>
  </Child>
</Parent>;

// BUENO - Usar Context o Zustand
const data = useReadingStore((s) => s.currentReading);
```

### ❌ God Components

```tsx
// MALO - Componente que hace TODO
function ReadingsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... 500 líneas más
}

// BUENO - Separar responsabilidades
function ReadingsPage() {
  return (
    <>
      <ReadingsHeader />
      <ReadingsFilters />
      <ReadingsList />
    </>
  );
}
```

### ❌ Lógica en JSX

```tsx
// MALO
return (
  <div>
    {data.filter((x) => x.active).map((x) => (x.type === 'A' ? <ComponentA /> : <ComponentB />))}
  </div>
);

// BUENO - Extraer a variables/funciones
const activeItems = data.filter((x) => x.active);
const renderItem = (item) => (item.type === 'A' ? <ComponentA /> : <ComponentB />);

return <div>{activeItems.map(renderItem)}</div>;
```

---

## Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
