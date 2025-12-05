# 🎯 Backlog Técnico Frontend - TarotFlavia

**Proyecto:** TarotFlavia MVP
**Stack:** Next.js 14 + shadcn/ui + Zustand + TanStack Query + Zod
**Prioridad:** Desarrollo secuencial de menor a mayor complejidad

---

## 🏗️ CONTEXTO: MONOREPO

> ⚠️ **IMPORTANTE:** Este proyecto usa una estructura **monorepo con npm workspaces**.

### Estructura del repositorio:

```
tarot-monorepo/
├── package.json          # Root - coordina workspaces
├── node_modules/         # Dependencias compartidas (instaladas aquí)
├── backend/
│   └── tarot-app/        # NestJS backend (puerto 3000)
├── frontend/             # Next.js frontend (puerto 3001) ← TRABAJAR AQUÍ
│   ├── package.json      # Ya existe, registrado en workspaces
│   └── docs/             # Documentación frontend
└── docs/                 # Documentación general
```

### Reglas de trabajo en monorepo:

| Acción                   | Comando                                  | Ubicación             |
| ------------------------ | ---------------------------------------- | --------------------- |
| Instalar dependencias    | `npm install`                            | **Raíz del proyecto** |
| Agregar dep. al frontend | `npm install <paquete> -w frontend`      | Raíz del proyecto     |
| Ejecutar frontend        | `npm run dev -w frontend`                | Raíz del proyecto     |
| Ejecutar backend         | `npm run start:dev -w backend/tarot-app` | Raíz del proyecto     |
| Ejecutar desde carpeta   | `npm run dev`                            | Dentro de `frontend/` |

### Puertos por defecto:

- **Backend NestJS:** `http://localhost:3000`
- **Frontend Next.js:** `http://localhost:3001`
- **API URL para frontend:** `http://localhost:3000/api`

### Antes de comenzar:

1. Asegúrate de estar en la carpeta `frontend/` del monorepo existente
2. NO crees un nuevo repositorio ni carpeta
3. El `package.json` de frontend ya existe y está registrado en workspaces
4. Las dependencias se instalan desde la raíz con `-w frontend`

---

## 📦 FASE 0: SETUP INICIAL

### ✅ TAREA 0.1: Inicializar proyecto Next.js 14 en monorepo existente

**Estado:** ✅ COMPLETADA (2025-12-03)
**Prioridad:** CRÍTICA
**Estimación:** 30 min
**Dependencias:** Ninguna

**Resumen de Implementación:**

- Next.js 16.0.6 inicializado con App Router, TypeScript y Tailwind CSS 4
- Puerto configurado en 3001 para evitar conflictos con backend
- Estructura de carpetas creada según arquitectura: `components/ui`, `components/features`, `hooks/api`, `hooks/utils`, `stores`, `lib/api`, `lib/utils`, `lib/validations`, `lib/constants`, `types`, `styles`
- Variables de entorno configuradas (.env.local)
- Dependencias core instaladas: Axios, TanStack Query, Zod, Zustand, React Hook Form, clsx, tailwind-merge
- Testing configurado: Vitest + Testing Library con 100% coverage en utils
- Scripts agregados: test, test:cov, type-check, format, lint

**Archivos creados:**

- `src/lib/api/axios-config.ts` - Cliente Axios con interceptors JWT
- `src/lib/api/endpoints.ts` - Definición centralizada de endpoints
- `src/lib/utils/cn.ts` - Merge de clases Tailwind
- `src/lib/utils/format.ts` - Utilidades de formateo
- `src/lib/constants/routes.ts` - Rutas de la app
- `src/lib/constants/config.ts` - Configuraciones globales
- `src/lib/validations/auth.schemas.ts` - Schemas Zod para auth
- `src/lib/validations/reading.schemas.ts` - Schemas Zod para readings
- `src/types/*.ts` - Tipos TypeScript globales
- `vitest.config.ts`, `vitest.setup.ts` - Configuración de tests
- `.prettierrc`, `.prettierignore` - Configuración de Prettier

**Consigna:**
Inicializar Next.js 14 en la carpeta `frontend/` existente del monorepo. Configurar App Router, TypeScript, Tailwind CSS y estructura de carpetas.

**Prompt:**

```
Inicializa Next.js 14 en la carpeta frontend/ del monorepo existente:

⚠️ CONTEXTO MONOREPO:
- Ya existe la carpeta frontend/ con package.json registrado en workspaces
- El backend NestJS corre en puerto 3000
- El frontend debe correr en puerto 3001 para evitar conflictos

PASO 1 - INICIALIZAR NEXT.JS:
Desde la carpeta frontend/, ejecuta:
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

Nota: El "." indica que se instale en la carpeta actual (frontend/), no crear subcarpeta.

PASO 2 - CONFIGURAR PUERTO:
Modificar package.json del frontend para usar puerto 3001:
  "scripts": {
    "dev": "next dev -p 3001",
    ...
  }

PASO 3 - ESTRUCTURA DE CARPETAS (dentro de src/):
src/
├── app/              # Rutas de Next.js (App Router)
├── components/
│   ├── ui/          # Componentes shadcn/ui
│   └── features/    # Componentes de negocio
├── lib/             # Utilidades y configuraciones
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
├── types/           # TypeScript types
└── styles/          # CSS globales

PASO 4 - VARIABLES DE ENTORNO:
Crear archivo .env.local en frontend/ con:
  NEXT_PUBLIC_API_URL=http://localhost:3000/api

PASO 5 - ACTUALIZAR .gitignore:
Agregar al .gitignore de frontend/:
  .env.local
  .env*.local

VERIFICACIÓN:
- Desde frontend/: npm run dev → debe abrir http://localhost:3001
- Desde raíz: npm run dev -w frontend → mismo resultado

NO incluyas ejemplos de componentes, solo la estructura base.
```

---

### TAREA 0.2: Configurar Tailwind con Design Tokens ✅ COMPLETADA

**Prioridad:** CRÍTICA
**Estimación:** 20 min
**Dependencias:** 0.1
**Completada:** 3 de Diciembre, 2025

**Consigna:**
Configurar tailwind.config.js con los Design Tokens del documento DESIGN_HAND-OFF.md (colores, tipografía, sombras).

**Implementación realizada:**

- ✅ Configurado `globals.css` con Design Tokens usando sintaxis Tailwind v4 (`@theme`)
- ✅ Colores: bg-main, surface, text-primary, text-muted, primary, secondary, accent-success
- ✅ Tipografía: font-serif (Cormorant Garamond), font-sans (Lato)
- ✅ Sombras: shadow-soft
- ✅ Fuentes importadas en `layout.tsx` con `next/font/google`
- ✅ Modo Light only (sin dark mode)
- ✅ Build exitoso, lint sin errores, tests pasando

**Decisión técnica:**

- Tailwind v4 usa la nueva sintaxis CSS-first con `@theme` en lugar de `tailwind.config.js`
- Las fuentes se cargan via `next/font/google` y se inyectan como CSS variables

---

### TAREA 0.3: Instalar dependencias core ✅ COMPLETADA

**Prioridad:** CRÍTICA
**Estimación:** 15 min
**Dependencias:** 0.1
**Fecha completado:** 2025-12-03
**Rama:** feature/TASK-0.3-install-core-dependencies

**Consigna:**
Instalar todas las dependencias necesarias para el proyecto: shadcn/ui, Zustand, TanStack Query, Zod, Axios, date-fns, clsx.

**Resultado:**

- ✅ Instaladas dependencias: zustand, @tanstack/react-query, axios, zod, date-fns, clsx, class-variance-authority, lucide-react
- ✅ Instalado @tanstack/react-query-devtools como devDependency
- ✅ shadcn/ui inicializado con base color Neutral y Tailwind v4
- ✅ Archivo src/lib/utils.ts creado automáticamente con función cn()
- ✅ tailwind-merge instalado como dependencia de shadcn
- ✅ Todos los quality checks pasando (lint, type-check, build, tests)
- ✅ Coverage 100%

**Prompt:**

```
Instala las siguientes dependencias en el proyecto:

⚠️ CONTEXTO MONOREPO:
Puedes instalar de dos formas:
- Desde la raíz: npm install <paquete> -w frontend
- Desde frontend/: npm install <paquete>

OPCIÓN A - DESDE CARPETA FRONTEND/:
cd frontend
npm install zustand @tanstack/react-query axios zod date-fns clsx class-variance-authority lucide-react
npm install -D @tanstack/react-query-devtools

OPCIÓN B - DESDE RAÍZ DEL MONOREPO:
npm install zustand @tanstack/react-query axios zod date-fns clsx class-variance-authority lucide-react -w frontend
npm install -D @tanstack/react-query-devtools -w frontend

CONFIGURAR SHADCN/UI (ejecutar desde frontend/):
cd frontend
npx shadcn-ui@latest init

Opciones para shadcn/ui:
- Style: Default
- Base color: Slate
- CSS variables: Yes

IMPORTANTE:
- NO instales componentes shadcn/ui todavía, solo inicializa
- Crea archivo src/lib/utils.ts si shadcn no lo crea automáticamente con la función cn() para merge de clases
```

---

### ✅ TAREA 0.4: Configurar TanStack Query Provider (COMPLETADA)

**Prioridad:** CRÍTICA
**Estimación:** 20 min
**Dependencias:** 0.3
**Estado:** ✅ Completada (2025-12-03)

**Archivos creados:**

- `src/lib/providers/react-query-provider.tsx` - Provider con QueryClient configurado
- `src/lib/providers/react-query-provider.test.tsx` - Tests unitarios

**Archivos modificados:**

- `src/app/layout.tsx` - Wrapeado children con ReactQueryProvider

**Configuración implementada:**

- staleTime: 5 minutos (300000ms)
- refetchOnWindowFocus: false
- ReactQueryDevtools en desarrollo
- Singleton pattern para QueryClient en browser

**Coverage:** 97.5% (88.88% en provider específico)

**Consigna:**
Crear provider de TanStack Query y wrapear la aplicación en app/layout.tsx.

**Prompt:**

```
Configura TanStack Query en el proyecto:

CREAR ARCHIVO: src/lib/providers/react-query-provider.tsx
- Debe ser un Client Component ('use client')
- Crear QueryClient con configuración:
  - defaultOptions.queries.staleTime: 5 minutos
  - defaultOptions.queries.refetchOnWindowFocus: false
- Exportar componente ReactQueryProvider que envuelva children con QueryClientProvider
- En desarrollo, incluir ReactQueryDevtools

MODIFICAR: src/app/layout.tsx
- Importar ReactQueryProvider
- Envolver {children} con ReactQueryProvider

NO incluyas configuración de Axios ni stores todavía.
```

---

### ✅ TAREA 0.5: Configurar Axios con interceptors (COMPLETADA)

**Prioridad:** CRÍTICA
**Estimación:** 30 min
**Dependencias:** 0.3
**Completada:** 2025-12-04
**Actualizada:** 2025-12-04 (PR feedback aplicado)
**Rama:** feature/TASK-0.5-axios-interceptors

**Consigna:**
Crear instancia de Axios configurada con baseURL, interceptors para tokens JWT y manejo de errores.

**Implementación Realizada:**

```
ARCHIVO: src/lib/api/axios-config.ts

CONFIGURACIÓN:
✅ baseURL desde process.env.NEXT_PUBLIC_API_URL
✅ timeout: 30000ms
✅ headers por defecto: 'Content-Type': 'application/json'

REQUEST INTERCEPTOR:
✅ Obtener token de localStorage (key: 'access_token')
✅ Si existe token, agregar header: Authorization: `Bearer ${token}`

RESPONSE INTERCEPTOR:
✅ Si error 401:
  - Verificar que originalRequest existe (fix para network errors)
  - Obtener refresh_token de localStorage y enviarlo en request body
  - Si refresh exitoso, guardar AMBOS tokens (access_token y refresh_token)
  - Requests concurrentes se encolan y reintentan con nuevo token
  - Si refresh falla, limpiar tokens de localStorage y redirigir a /login
  - isRefreshing flag se resetea antes del redirect (fix race condition)
✅ Si error 403: lanzar ForbiddenError con mensaje "sin permisos"
✅ Si error 429: lanzar RateLimitError con mensaje "rate limit excedido"

EXPORTS:
✅ apiClient - Instancia de axios configurada
✅ ForbiddenError - Clase de error para 403
✅ RateLimitError - Clase de error para 429

TESTS:
✅ 18 tests unitarios (100% pasando)
✅ Coverage: 82.75% en axios-config.ts
✅ Coverage global del proyecto: 88.77%

PR FEEDBACK APLICADO:
✅ Null check para originalRequest (network errors)
✅ refreshToken enviado en request body
✅ Guardar ambos tokens (token rotation support)
✅ processQueue resuelve requests correctamente
✅ isRefreshing resetea antes de redirect
✅ Tests adicionales para nuevos escenarios
```

**Nota de Seguridad:**
El almacenamiento de JWT en localStorage es una decisión arquitectural heredada del backend existente.
Para mayor seguridad, se recomienda evaluar migrar a HttpOnly cookies en futuras iteraciones.

---

## 🎨 FASE 1: UI KIT BASE

### ✅ TAREA 1.1: Instalar componentes shadcn/ui base (COMPLETADA)

**Prioridad:** ALTA
**Estimación:** 20 min
**Dependencias:** 0.3
**Estado:** ✅ COMPLETADA (2025-12-04)
**Rama:** feature/TASK-1.1-shadcn-components

**Componentes instalados:**

- button.tsx
- input.tsx
- card.tsx
- badge.tsx
- dialog.tsx
- sonner.tsx (toast - nueva versión shadcn v4)
- skeleton.tsx
- dropdown-menu.tsx
- tabs.tsx
- avatar.tsx
- alert.tsx

**Decisiones:**

- El componente `toast` fue reemplazado por `sonner` (nueva convención shadcn/ui v4)
- Se actualizó el script `validate-architecture.js` para excluir `components/ui/` de la validación de nomenclatura PascalCase (los componentes shadcn usan lowercase por convención)

**Verificación:**

- ✅ Lint: 0 errores
- ✅ Type-check: 0 errores
- ✅ Build: exitoso
- ✅ Tests: 74 pasando
- ✅ Coverage: 88.77%
- ✅ Arquitectura validada

---

### ✅ TAREA 1.2: Crear componente ToastNotification

**Estado:** ✅ COMPLETADA (2025-12-04)
**Prioridad:** ALTA
**Estimación:** 20 min
**Dependencias:** 1.1

**Resumen de Implementación:**

- Sistema de notificaciones toast implementado usando sonner (shadcn/ui toast)
- Hook `useToast` creado en `src/hooks/utils/useToast.ts`
- Componente `Toaster` actualizado en `src/components/ui/toaster.tsx`
- Integrado en `src/app/layout.tsx`

**Tipos de Toast:**

- ✅ Success: borde izquierdo verde (#48BB78), ícono Check
- ✅ Error: borde izquierdo rojo, ícono X
- ✅ Info: borde izquierdo azul, ícono Info

**Configuración:**

- ✅ Posición: top-right
- ✅ Duración por defecto: 3000ms
- ✅ Animación: slide-in desde la derecha (sonner default)

**Archivos creados/modificados:**

- `src/hooks/utils/useToast.ts` - Hook con métodos toast.success/error/info/dismiss
- `src/hooks/utils/useToast.test.ts` - 12 tests
- `src/components/ui/toaster.tsx` - Componente Toaster con estilos personalizados
- `src/components/ui/toaster.test.tsx` - 10 tests
- `src/app/layout.tsx` - Integración del Toaster

**Uso:**

```tsx
import { useToast } from '@/hooks/utils/useToast';

const { toast } = useToast();
toast.success('Lectura guardada');
toast.error('Error al guardar');
toast.info('Tu sesión expirará pronto', { description: 'En 5 minutos' });
```

**Métricas:**

- ✅ Lint: 0 errores
- ✅ Type-check: 0 errores
- ✅ Tests: 96 pasando (22 nuevos)
- ✅ Coverage: 87.85%
- ✅ Build: exitoso
- ✅ Arquitectura validada

**Consigna:**
Crear sistema de notificaciones toast usando shadcn/ui toast. Debe soportar tipos: success, error, info.

**Prompt:**

```
Crea el sistema de notificaciones usando shadcn/ui toast:

CREAR ARCHIVO: src/components/ui/toaster.tsx (si no existe)
- Usar componente Toast de shadcn/ui

CREAR ARCHIVO: src/hooks/use-toast.ts (si no existe)
- Hook para mostrar toasts

TIPOS DE TOAST:
- success: borde izquierdo verde (#48BB78), ícono Check de lucide-react
- error: borde izquierdo rojo, ícono X de lucide-react
- info: borde izquierdo azul, ícono Info de lucide-react

CONFIGURACIÓN:
- Posición: top-right
- Duración por defecto: 3000ms
- Animación: slide-in desde la derecha

AGREGAR EN: src/app/layout.tsx
- Importar y agregar <Toaster /> al final del body

EXPORTAR:
- Hook useToast con método toast({ title, description, variant })
```

---

### TAREA 1.3: Crear componente ConfirmationModal ✅

**Prioridad:** MEDIA
**Estimación:** 30 min
**Dependencias:** 1.1
**Estado:** COMPLETADA (2025-12-04)

**Consigna:**
Crear modal de confirmación reutilizable con opciones de título, mensaje, acción confirmar y cancelar.

**Implementación:**

- Archivo: `src/components/ui/confirmation-modal.tsx`
- Tests: `src/components/ui/confirmation-modal.test.tsx` (17 tests, 100% coverage)
- Props implementadas: open, onOpenChange, title, description, confirmText, cancelText, onConfirm, variant, loading
- Comportamiento: soporte para variante destructiva, estado loading con spinner, manejo de promesas async

**Prompt:**

```
Crea un componente modal de confirmación usando Dialog de shadcn/ui:

CREAR ARCHIVO: src/components/ui/confirmation-modal.tsx

PROPS:
- open: boolean
- onOpenChange: (open: boolean) => void
- title: string
- description: string
- confirmText?: string (default: "Confirmar")
- cancelText?: string (default: "Cancelar")
- onConfirm: () => void | Promise<void>
- variant?: 'default' | 'destructive' (default: 'default')
- loading?: boolean

COMPORTAMIENTO:
- Si variant es 'destructive', botón confirmar es rojo
- Si loading es true, botón confirmar muestra spinner y está deshabilitado
- Al confirmar, ejecutar onConfirm y si es Promise, esperar antes de cerrar
- Botón cancelar siempre cierra el modal

ESTILO:
- Usar componentes Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription de shadcn/ui
- Footer con botones alineados a la derecha
- Overlay oscuro semitransparente
```

---

### ✅ TAREA 1.4: Crear componentes de estado (Skeleton, Error, Empty)

**Prioridad:** ALTA
**Estimación:** 40 min
**Dependencias:** 1.1
**Estado:** ✅ COMPLETADA (2025-12-04)

**Consigna:**
Crear tres componentes para estados de carga, error y vacío que se reutilizarán en toda la aplicación.

**Archivos Creados:**

- `src/components/ui/skeleton-card.tsx` - Componente con variantes tarotist/reading/session
- `src/components/ui/skeleton-card.test.tsx` - 10 tests (100% coverage)
- `src/components/ui/error-display.tsx` - Componente con mensaje de error y retry opcional
- `src/components/ui/error-display.test.tsx` - 11 tests (100% coverage)
- `src/components/ui/empty-state.tsx` - Componente con icono, título, mensaje y acción opcional
- `src/components/ui/empty-state.test.tsx` - 13 tests (100% coverage)

**Decisiones de Implementación:**

- SkeletonCard usa el Skeleton base de shadcn/ui con diferentes estructuras por variante
- ErrorDisplay incluye role="alert" y aria-live="polite" para accesibilidad
- EmptyState permite ícono como React.ReactNode para máxima flexibilidad
- Todos los componentes aceptan className y props adicionales para extensibilidad

**Prompt:**

```
Crea tres componentes de estado reutilizables:

ARCHIVO 1: src/components/ui/skeleton-card.tsx
- Componente SkeletonCard que simula una tarjeta de contenido
- Props: variant: 'tarotist' | 'reading' | 'session'
- Cada variant debe tener estructura diferente de Skeleton (usar Skeleton de shadcn/ui)
- tarotist: círculo arriba (foto) + 3 líneas de texto
- reading: rectángulo (carta) + 2 líneas de texto
- session: línea + rectángulo + línea

ARCHIVO 2: src/components/ui/error-display.tsx
- Componente ErrorDisplay
- Props: message: string, onRetry?: () => void
- Mostrar ícono AlertCircle de lucide-react en color rojo suave
- Texto del error centrado
- Si onRetry existe, mostrar botón "Intentar de nuevo"
- Usar colores del design system

ARCHIVO 3: src/components/ui/empty-state.tsx
- Componente EmptyState
- Props: icon?: React.ReactNode, title: string, message: string, action?: { label: string, onClick: () => void }
- Layout centrado verticalmente
- Ícono grande en gris suave (si se provee)
- Título en font-serif
- Mensaje en text-muted
- Botón de acción opcional

IMPORTANTE: Todos los componentes deben ser genéricos y reutilizables.
```

---

### ✅ TAREA 1.5: Crear badges de Plan y Status

**Estado:** ✅ COMPLETADA (2025-12-04)
**Prioridad:** MEDIA
**Estimación:** 25 min
**Dependencias:** 1.1

**Consigna:**
Crear componentes Badge para mostrar planes de usuario y estados de sesiones según especificación del diseño.

**Resumen de Implementación:**

- **PlanBadge** (`src/components/ui/plan-badge.tsx`): Componente para mostrar planes de usuario (guest, free, premium, professional) con estilos específicos por plan. Texto en uppercase.
- **StatusBadge** (`src/components/ui/status-badge.tsx`): Componente para mostrar estados de sesiones (pending, confirmed, completed, cancelled) con colores semánticos y texto traducido al español.
- Tests con 100% coverage para ambos componentes
- TDD estricto: tests escritos primero, luego implementación

**Archivos creados:**

- `src/components/ui/plan-badge.tsx` - PlanBadge component
- `src/components/ui/plan-badge.test.tsx` - 18 tests
- `src/components/ui/status-badge.tsx` - StatusBadge component
- `src/components/ui/status-badge.test.tsx` - 15 tests

**Decisiones de diseño:**

- StatusBadge usa texto blanco para todos los estados para mejor contraste/legibilidad sobre fondos de colores
- Estilos aplicados via inline styles para colores específicos del design system, clases Tailwind para border-transparent

---

## 🏗️ FASE 2: LAYOUT Y NAVEGACIÓN

### ✅ TAREA 2.1: Crear Layout principal (App Shell)

**Prioridad:** CRÍTICA
**Estimación:** 45 min
**Dependencias:** 1.1, 1.2
**Estado:** ✅ COMPLETADA

**Consigna:**
Crear layout principal con Header, Footer y background según design system. Debe ser responsive.

**Resumen de Implementación:**

- **Header** (`src/components/layout/Header.tsx`): Header sticky con logo centrado, navegación condicional (Explorar/Mis Sesiones solo para autenticados), hamburger menu en mobile, integración con UserMenu
- **Footer** (`src/components/layout/Footer.tsx`): Footer simple con links legales (Términos, Privacidad, Contacto) y copyright
- **UserMenu** (`src/components/layout/UserMenu.tsx`): Dropdown menu con Avatar para usuarios autenticados, botón "Iniciar Sesión" para no autenticados
- **authStore** (`src/stores/authStore.ts`): Zustand store para estado de autenticación
- **layout.tsx**: Modificado con bg-bg-main, min-h-screen, estructura Header + main + Footer

**Archivos creados:**

- `src/components/layout/Header.tsx` - Header component
- `src/components/layout/Header.test.tsx` - 16 tests
- `src/components/layout/Footer.tsx` - Footer component
- `src/components/layout/Footer.test.tsx` - 10 tests
- `src/components/layout/UserMenu.tsx` - UserMenu component
- `src/components/layout/UserMenu.test.tsx` - 13 tests
- `src/components/layout/index.ts` - Barrel exports
- `src/stores/authStore.ts` - Auth Zustand store
- `src/stores/authStore.test.ts` - 4 tests

**Decisiones de diseño:**

- Nomenclatura PascalCase para componentes según convención del proyecto
- UserMenu usa asChild con Link para "Iniciar Sesión" (accesible como link)
- Header responsive con hamburger visible solo en mobile (md:hidden)
- authStore minimalista con user, token, setAuth y logout
- Coverage 100% en todos los nuevos componentes

**Prompt:**

```
Crea el layout principal de la aplicación:

MODIFICAR: src/app/layout.tsx
- Background del body: bg-main (#F9F7F2)
- Agregar clase min-h-screen
- Estructura: Header + main + Footer

CREAR: src/components/layout/header.tsx
- Componente Header con:
  - Logo centrado usando font-serif (texto "Tarot")
  - Navegación derecha: botones "Explorar" y "Mis Sesiones" (solo si está autenticado)
  - Menú de usuario (Avatar + Dropdown) a la derecha extrema
  - En mobile: hamburger menu colapsable
- Fondo surface (blanco), shadow-soft
- Sticky top

CREAR: src/components/layout/footer.tsx
- Componente Footer simple
- Links: "Términos" | "Privacidad" | "Contacto"
- Centrado, text-muted, padding vertical
- Copyright: "© 2025 TarotFlavia"

CREAR: src/components/layout/user-menu.tsx
- Dropdown usando DropdownMenu de shadcn/ui
- Avatar con inicial del nombre
- Items: "Mi Perfil", "Mis Lecturas", "Configuración", divider, "Cerrar Sesión"
- Si NO está autenticado: mostrar botón "Iniciar Sesión"

IMPORTANTE:
- Verificar autenticación desde Zustand store (crearás en siguiente fase)
- Por ahora, simula usuario null y hardcodea un usuario de prueba en el código
```

---

### ✅ TAREA 2.2: Crear páginas base de rutas

**Estado:** ✅ COMPLETADA (2025-12-04)
**Prioridad:** ALTA
**Estimación:** 30 min
**Dependencias:** 2.1

**Resumen de Implementación:**

- Creadas todas las páginas base de rutas con TDD (tests primero, luego implementación)
- Estructura completa de rutas en `src/app/`:
  - `login/page.tsx` - Página de Login
  - `registro/page.tsx` - Página de Registro
  - `recuperar-password/page.tsx` - Recuperar Contraseña
  - `explorar/page.tsx` - Marketplace Tarotistas
  - `tarotistas/[id]/page.tsx` - Perfil Público Tarotista (ruta dinámica)
  - `ritual/page.tsx` - Lectura con IA
  - `historial/page.tsx` - Historial de Lecturas
  - `carta-del-dia/page.tsx` - Carta del Día
  - `perfil/page.tsx` - Mi Perfil
  - `sesiones/page.tsx` - Mis Sesiones
  - `admin/layout.tsx` - Layout Admin con indicador visual
  - `admin/page.tsx` - Dashboard Admin
  - `admin/usuarios/page.tsx` - Gestión de Usuarios
  - `admin/tarotistas/page.tsx` - Gestión de Tarotistas
- Todas las páginas son Server Components con `min-h-screen` y `bg-bg-main`
- Tests con 100% coverage para todas las páginas nuevas
- Build exitoso con todas las rutas generadas correctamente

**Archivos creados:**

- `src/app/login/page.tsx`, `src/app/login/page.test.tsx`
- `src/app/registro/page.tsx`, `src/app/registro/page.test.tsx`
- `src/app/recuperar-password/page.tsx`, `src/app/recuperar-password/page.test.tsx`
- `src/app/explorar/page.tsx`, `src/app/explorar/page.test.tsx`
- `src/app/tarotistas/[id]/page.tsx`, `src/app/tarotistas/[id]/page.test.tsx`
- `src/app/ritual/page.tsx`, `src/app/ritual/page.test.tsx`
- `src/app/historial/page.tsx`, `src/app/historial/page.test.tsx`
- `src/app/carta-del-dia/page.tsx`, `src/app/carta-del-dia/page.test.tsx`
- `src/app/perfil/page.tsx`, `src/app/perfil/page.test.tsx`
- `src/app/sesiones/page.tsx`, `src/app/sesiones/page.test.tsx`
- `src/app/admin/layout.tsx`, `src/app/admin/layout.test.tsx`
- `src/app/admin/page.tsx`, `src/app/admin/page.test.tsx`
- `src/app/admin/usuarios/page.tsx`, `src/app/admin/usuarios/page.test.tsx`
- `src/app/admin/tarotistas/page.tsx`, `src/app/admin/tarotistas/page.test.tsx`

**Consigna:**
Crear estructura de carpetas y archivos page.tsx vacíos para todas las rutas de la aplicación.

**Prompt:**

```
Crea la estructura de rutas de Next.js App Router:

ESTRUCTURA (todas dentro de src/app/):
├── page.tsx                    # Home/Landing
├── login/page.tsx              # Login
├── registro/page.tsx           # Registro
├── recuperar-password/page.tsx # Recuperar contraseña
├── explorar/page.tsx           # Marketplace tarotistas
├── tarotistas/[id]/page.tsx    # Perfil público tarotista
├── ritual/page.tsx             # Lectura con IA
├── historial/page.tsx          # Historial lecturas
├── carta-del-dia/page.tsx      # Daily card
├── perfil/page.tsx             # Mi perfil
├── sesiones/page.tsx           # Mis sesiones
└── admin/
    ├── layout.tsx              # Layout admin
    ├── page.tsx                # Dashboard admin
    ├── usuarios/page.tsx       # Gestión usuarios
    └── tarotistas/page.tsx     # Gestión tarotistas

CADA page.tsx DEBE:
- Ser un Server Component por defecto
- Exportar default function NombrePage()
- Retornar un div con título h1 que diga el nombre de la página
- Usar className con bg-main y min-h-screen

EJEMPLO:
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-main p-8">
      <h1 className="font-serif text-3xl">Login</h1>
    </div>
  );
}

NO agregues contenido real, solo estructura.
```

---

## 🔐 FASE 3: AUTENTICACIÓN

### TAREA 3.1: Crear Zustand store de autenticación ✅

**Estado:** COMPLETADA
**Fecha:** 2025-12-04
**Prioridad:** CRÍTICA
**Estimación:** 40 min
**Dependencias:** 0.5

**Resumen de Implementación:**

- Creado `src/types/auth.types.ts` con tipos: AuthUser, AuthState, LoginCredentials, LoginResponse, AuthActions, AuthStore
- Expandido `src/stores/authStore.ts` con nuevo store completo:
  - Estado inicial: user: null, isAuthenticated: false, isLoading: true
  - Acciones implementadas: setUser, login, logout, checkAuth
  - Persistencia con middleware persist de Zustand (key: 'auth-storage')
  - Solo persiste: user, isAuthenticated (no isLoading)
  - Integración con apiClient y toast de sonner para mensajes
- Tests con 100% coverage (19 tests)

**Decisiones técnicas:**

- Se reutilizó `authStore.ts` existente expandiendo su funcionalidad
- El tipo AuthUser usa `id: number` y `roles: string[]` según spec del backend
- No se implementó redirección en logout (se manejará en componente/hook consumidor)
- Tokens se almacenan en localStorage via store, no directamente

**Archivos modificados:**

- `src/types/auth.types.ts` (nuevo)
- `src/types/index.ts` (exports agregados)
- `src/stores/authStore.ts` (expandido)
- `src/stores/authStore.test.ts` (reescrito con 19 tests)

**Consigna:**
Crear store de Zustand para manejar estado de autenticación: usuario, tokens, login, logout, verificación.

**Prompt:**

```
Crea el store de autenticación con Zustand:

CREAR ARCHIVO: src/stores/auth-store.ts

TYPES (crear en src/types/auth.types.ts):
- User: { id: number, email: string, name: string, roles: string[], plan: string }
- AuthState: { user: User | null, isAuthenticated: boolean, isLoading: boolean }

STORE:
- Estado inicial: user: null, isAuthenticated: false, isLoading: true
- Acciones:
  - setUser(user: User | null): actualiza user y isAuthenticated
  - login(email: string, password: string): Promise
    - Llamar a apiClient.post('/auth/login', { email, password })
    - Guardar access_token y refresh_token en localStorage
    - Llamar a setUser con data.user
  - logout(): void
    - Limpiar localStorage (access_token, refresh_token)
    - Llamar a setUser(null)
    - Redirigir a /login usando router.push (importar useRouter)
  - checkAuth(): Promise
    - Verificar si existe access_token en localStorage
    - Si existe, llamar a apiClient.get('/users/profile')
    - Si exitoso, setUser con data
    - Si falla, limpiar tokens y setUser(null)
    - Marcar isLoading: false al finalizar

PERSISTENCIA:
- Usar middleware persist de Zustand para persistir user
- Key: 'auth-storage'
- Solo persistir: user, isAuthenticated

IMPORTANTE:
- Importar apiClient de axios-config
- Manejar errores y usar toast para mostrar mensajes
```

---

### TAREA 3.2: Crear hook useAuth ✅ COMPLETADA

**Prioridad:** ALTA
**Estimación:** 15 min
**Dependencias:** 3.1
**Completada:** 2025-12-05
**Rama:** feature/TASK-3.2-use-auth-hook

**Consigna:**
Crear custom hook que facilite el uso del auth store en componentes.

**Archivos creados:**

- `src/hooks/useAuth.ts` - Hook principal para acceso al auth store
- `src/hooks/useAuth.test.ts` - Tests con 100% coverage
- `src/hooks/useRequireAuth.ts` - Hook para proteger páginas
- `src/hooks/useRequireAuth.test.ts` - Tests con 100% coverage

**Notas de implementación:**

- Los archivos usan nomenclatura camelCase (useAuth.ts, no use-auth.ts) siguiendo convenciones del proyecto
- useAuth expone: user, isAuthenticated, isLoading, login, logout, checkAuth
- useRequireAuth redirige a /login cuando no autenticado y no cargando
- Tests: 20 tests, 100% coverage en ambos hooks

---

### TAREA 3.3: Crear formulario de Login ✅ COMPLETADA

**Prioridad:** CRÍTICA
**Estimación:** 45 min
**Dependencias:** 1.1, 3.2
**Completada:** 2025-12-05
**Rama:** feature/TASK-3.3-login-form

**Consigna:**
Crear página de login completa con formulario, validación con Zod y manejo de errores.

**Archivos creados:**

- `src/components/features/auth/LoginForm.tsx` - Componente de formulario de login
- `src/components/features/auth/LoginForm.test.tsx` - Tests con 100% coverage (18 tests)
- `src/components/features/auth/index.ts` - Barrel export

**Archivos modificados:**

- `src/app/login/page.tsx` - Actualizada para usar LoginForm
- `src/app/login/page.test.tsx` - Tests actualizados

**Notas de implementación:**

- Sigue arquitectura feature-based (components/features/auth/)
- Usa react-hook-form + zodResolver para validación
- Usa loginSchema de lib/validations/auth.schemas.ts (ya existía)
- Integra con useAuth hook para login
- Spinner con Loader2 de lucide-react durante submit
- Links a /recuperar-password y /registro
- Design tokens aplicados: shadow-soft, font-serif, bg-primary
- 100% coverage en LoginForm.tsx

---

### TAREA 3.4: Crear formulario de Registro ✅ COMPLETADA

**Estado:** ✅ COMPLETADA (2025-12-05)
**Prioridad:** ALTA
**Estimación:** 40 min
**Dependencias:** 1.1, 3.2

**Resumen de Implementación:**

- Creado componente `RegisterForm.tsx` en `components/features/auth/`
- Estructura idéntica a LoginForm con Card centrada y diseño consistente
- Campos: name, email, password, confirmPassword con validación Zod
- Validación de contraseñas coincidentes usando `.refine()`
- Funcionalidad de registro con auto-login y redirección a `/perfil`
- Manejo de errores del backend (email duplicado, etc.)
- Agregada función `register` al authStore y useAuth hook
- Actualizado tipo `AuthStore` con `RegisterCredentials`

**Archivos creados/modificados:**

- `src/components/features/auth/RegisterForm.tsx` - Componente principal
- `src/components/features/auth/RegisterForm.test.tsx` - 19 tests completos
- `src/components/features/auth/index.ts` - Export del componente
- `src/app/registro/page.tsx` - Página usando RegisterForm
- `src/app/registro/page.test.tsx` - Tests de la página
- `src/stores/authStore.ts` - Añadida función register
- `src/hooks/useAuth.ts` - Añadida función register
- `src/types/auth.types.ts` - Añadido tipo RegisterCredentials

**Tests y Coverage:**

- 19 tests en RegisterForm.test.tsx (100% coverage)
- 357 tests totales pasando
- Lint, type-check y build sin errores

**Consigna:**
Crear página de registro similar a login pero con campos adicionales: name, confirmPassword.

**Prompt:**

```
Crea la página de Registro:

ARCHIVO: src/app/registro/page.tsx

CLIENT COMPONENT ('use client')

ESTRUCTURA SIMILAR A LOGIN:
- Card centrada, mismo diseño
- Título: "Únete al Oráculo"
- Formulario:
  - Input name (requerido)
  - Input email (requerido, type="email")
  - Input password (requerido, min 6 caracteres)
  - Input confirmPassword (debe coincidir)
  - Botón "Crear Cuenta" bg-primary

VALIDACIÓN ZOD:
- Schema con name, email, password, confirmPassword
- Validar que password === confirmPassword con .refine()

COMPORTAMIENTO:
- Al submit, llamar a apiClient.post('/auth/register', { name, email, password })
- Si éxito:
  - Mostrar toast "Cuenta creada exitosamente"
  - Automáticamente hacer login con las credenciales
  - Redirigir a /perfil
- Si error, mostrar toast con mensaje del backend

FOOTER:
- Link "¿Ya tienes cuenta? Inicia sesión" -> /login

IMPORTANTE:
- Usar react-hook-form + zodResolver
- Manejar errores específicos del backend (email duplicado, etc.)
```

---

### TAREA 3.5: Crear página Recuperar Contraseña ✅ COMPLETADA

**Prioridad:** MEDIA
**Estimación:** 35 min
**Dependencias:** 1.1
**Completada:** 2025-12-05

**Consigna:**
Crear página para solicitar reset de contraseña con input de email.

**Implementación:**

- `src/components/features/auth/ForgotPasswordForm.tsx` - Componente del formulario
- `src/app/recuperar-password/page.tsx` - Página de la ruta
- `src/lib/validations/auth.schemas.ts` - Schema `forgotPasswordSchema` para validación
- Tests completos con 100% coverage

**Características implementadas:**

- Card centrada con diseño consistente con login
- Validación de email con Zod
- Llamada a `apiClient.post('/auth/forgot-password', { email })`
- Toast de éxito sin revelar si el email existe (seguridad)
- Cooldown de 60 segundos con contador visible
- Estado de loading con spinner
- Link de regreso a login

**Prompt:**

```
Crea la página de recuperación de contraseña:

ARCHIVO: src/app/recuperar-password/page.tsx

CLIENT COMPONENT ('use client')

ESTRUCTURA:
- Card centrada, mismo diseño que login
- Título: "Recuperar Contraseña"
- Descripción: "Ingresa tu email y te enviaremos instrucciones"
- Formulario:
  - Input email
  - Botón "Enviar Instrucciones"

COMPORTAMIENTO:
- Al submit, llamar a apiClient.post('/auth/forgot-password', { email })
- Mostrar toast de éxito: "Email enviado. Revisa tu bandeja de entrada"
- Deshabilitar botón por 60 segundos después de enviar (para evitar spam)
- Mostrar contador: "Reenviar en X segundos"

VALIDACIÓN:
- Email válido con Zod

FOOTER:
- Link "Volver al inicio de sesión" -> /login

IMPORTANTE:
- Manejar estado de loading
- No revelar si el email existe o no (seguridad)
```

---

## 📖 FASE 4: SISTEMA DE LECTURAS

### TAREA 4.1: Crear servicio de API para lecturas

**Prioridad:** CRÍTICA
**Estimación:** 30 min
**Dependencias:** 0.5

**Consigna:**
Crear funciones helper para todas las llamadas a API relacionadas con lecturas usando TanStack Query.

**Prompt:**

```
Crea el servicio de API para lecturas:

CREAR ARCHIVO: src/lib/api/readings-api.ts

FUNCIONES (usar apiClient de axios-config):
- getCategories(): Promise<Category[]>
  - GET /categories
- getPredefinedQuestions(categoryId?: number): Promise<Question[]>
  - GET /predefined-questions?categoryId={id}
- getSpreads(): Promise<Spread[]>
  - GET /spreads
- createReading(data: CreateReadingDto): Promise<Reading>
  - POST /readings
  - data: { spreadId, categoryId, questionId?, customQuestion? }
- getMyReadings(page: number, limit: number): Promise<PaginatedReadings>
  - GET /readings?page={page}&limit={limit}
- getReadingById(id: number): Promise<ReadingDetail>
  - GET /readings/{id}
- deleteReading(id: number): Promise<void>
  - DELETE /readings/{id}
- regenerateInterpretation(readingId: number): Promise<Reading>
  - POST /readings/{id}/regenerate
- shareReading(readingId: number): Promise<{ shareToken: string }>
  - POST /readings/{id}/share
- unshareReading(readingId: number): Promise<void>
  - DELETE /readings/{id}/unshare
- getTrashedReadings(): Promise<Reading[]>
  - GET /readings/trash
- restoreReading(readingId: number): Promise<Reading>
  - POST /readings/{id}/restore

TYPES (crear en src/types/reading.types.ts):
- Category, Question, Spread, Reading, ReadingDetail, CreateReadingDto
- Basarte en la estructura de respuestas del backend según API_DOCUMENTATION

IMPORTANTE:
- Todas las funciones deben lanzar errores con mensajes claros
- NO crear hooks de TanStack Query aquí, solo funciones API
```

---

### TAREA 4.2: Crear hooks de TanStack Query para lecturas

**Prioridad:** ALTA
**Estimación:** 35 min
**Dependencias:** 4.1

**Consigna:**
Crear custom hooks usando TanStack Query para consumir API de lecturas con caching.

**Prompt:**

```
Crea hooks de TanStack Query para lecturas:

CREAR ARCHIVO: src/hooks/queries/use-readings.ts

HOOKS:
1. useCategories()
   - useQuery con queryKey: ['categories']
   - queryFn: getCategories
   - staleTime: Infinity (categorías no cambian frecuentemente)

2. usePredefinedQuestions(categoryId?: number)
   - useQuery con queryKey: ['questions', categoryId]
   - queryFn: () => getPredefinedQuestions(categoryId)
   - enabled: categoryId !== undefined

3. useSpreads()
   - useQuery con queryKey: ['spreads']
   - queryFn: getSpreads
   - staleTime: Infinity

4. useMyReadings(page: number, limit: number)
   - useQuery con queryKey: ['readings', page, limit]
   - queryFn: () => getMyReadings(page, limit)

5. useReadingDetail(id: number)
   - useQuery con queryKey: ['reading', id]
   - queryFn: () => getReadingById(id)

6. useCreateReading()
   - useMutation con mutationFn: createReading
   - onSuccess: invalidar query ['readings']
   - Retornar toast de éxito

7. useDeleteReading()
   - useMutation con mutationFn: deleteReading
   - onSuccess: invalidar queries ['readings']

8. useRegenerateInterpretation()
   - useMutation con mutationFn: regenerateInterpretation
   - onSuccess: invalidar query ['reading', id]

9. useUnshareReading()
   - useMutation con mutationFn: unshareReading
   - onSuccess: invalidar query ['reading', id]

10. useTrashedReadings()
    - useQuery con queryKey: ['readings', 'trash']
    - queryFn: getTrashedReadings

11. useRestoreReading()
    - useMutation con mutationFn: restoreReading
    - onSuccess: invalidar queries ['readings'] y ['readings', 'trash']

IMPORTANTE:
- Usar useQueryClient para invalidaciones
- Manejar errores con toast
- Exportar todos los hooks
```

---

### TAREA 4.3: Crear componente TarotCard

**Prioridad:** ALTA
**Estimación:** 40 min
**Dependencias:** 1.1

**Consigna:**
Crear componente de carta de tarot con estados: reverso, anverso, animación de volteo.

**Prompt:**

```
Crea el componente TarotCard:

CREAR ARCHIVO: src/components/features/tarot-card.tsx

PROPS:
- card?: TarotCard (opcional, si no hay es reverso)
- isRevealed: boolean
- onClick?: () => void
- size?: 'sm' | 'md' | 'lg' (default: 'md')

ESTADOS:
- Reverso (isRevealed=false): Imagen genérica del dorso con patrón geométrico dorado
- Anverso (isRevealed=true): Imagen de la carta con nombre debajo

ANIMACIÓN:
- Usar CSS transform rotateY para efecto de volteo 3D
- Duración: 600ms
- hover: translateY(-5px) cuando NO está revelada

TAMAÑOS:
- sm: w-32 h-48
- md: w-40 h-60
- lg: w-48 h-72

ESTILO:
- Bordes rounded-xl
- Sombra shadow-lg
- Cursor pointer si onClick existe

IMPORTANTE:
- Por ahora usar placeholder para imagen del dorso (div con bg-secondary y patrón)
- La imagen del anverso será card.imageUrl (agregarás integración después)
- Agregar atributo alt describiendo la carta para accesibilidad
```

---

### TAREA 4.4: Crear página selector de categoría

**Prioridad:** ALTA
**Estimación:** 45 min
**Dependencias:** 4.2, 1.4

**Consigna:**
Crear interfaz para que usuario seleccione categoría de consulta antes de hacer lectura.

**Prompt:**

```
Crea la página de selector de categoría:

CREAR ARCHIVO: src/app/ritual/page.tsx

CLIENT COMPONENT ('use client')

DEBE USAR: useRequireAuth() para proteger ruta

ESTRUCTURA:
- Título centrado font-serif: "¿Qué inquieta tu alma hoy?"
- Grid responsive de categorías:
  - 1 columna en mobile
  - 2 columnas en tablet
  - 3 columnas en desktop

COMPONENTE CategoryCard (crear inline):
- Card con:
  - Ícono grande de la categoría (usar lucide-react)
  - Nombre de la categoría
  - Color de acento según categoría (usar secondary para borde)
  - Efecto hover: scale-105
- Al hacer clic, navegar a /ritual/preguntas?categoryId={id}

OBTENER DATOS:
- Usar hook useCategories()
- Mostrar SkeletonCard mientras carga
- Mostrar ErrorDisplay si falla
- Mostrar EmptyState si no hay categorías

CATEGORÍAS Y COLORES (según backend):
- Amor: Heart icon, rosa pálido
- Carrera: Briefcase icon, azul pálido
- Dinero: DollarSign icon, verde pálido
- Salud: Activity icon, naranja pálido
- Espiritual: Sparkles icon, púrpura pálido
- General: Star icon, amarillo pálido

IMPORTANTE:
- Usar componentes de estado (Skeleton, Error, Empty)
- Grid con gap-6
```

---

### TAREA 4.5: Crear página selector de pregunta

**Prioridad:** ALTA
**Estimación:** 50 min
**Dependencias:** 4.2, 4.4

**Consigna:**
Crear interfaz para seleccionar pregunta predefinida o escribir pregunta custom (solo Premium).

**Prompt:**

```
Crea la página de selector de pregunta:

CREAR ARCHIVO: src/app/ritual/preguntas/page.tsx

CLIENT COMPONENT ('use client')

OBTENER categoryId desde searchParams de Next.js

ESTRUCTURA:
- Breadcrumb: "Ritual > {Nombre Categoría}"
- Título: "Selecciona tu consulta"

SECCIÓN 1: Preguntas Predefinidas (SIEMPRE VISIBLE)
- Lista vertical de preguntas
- Cada pregunta como Card clicable
- Al seleccionar, marca con borde primary y check icon
- Botón al final: "Continuar con esta pregunta"

SECCIÓN 2: Pregunta Personalizada (SOLO SI ES PREMIUM)
- Separador con texto: "O escribe tu propia pregunta"
- Textarea grande
- Contador de caracteres (max 500)
- Botón: "Usar mi pregunta"

VALIDACIÓN:
- Si usuario es FREE y intenta escribir custom: mostrar toast "Actualiza a Premium"
- Si pregunta custom está vacía, deshabilitar botón

OBTENER DATOS:
- useAuth() para verificar plan del usuario
- usePredefinedQuestions(categoryId) para las preguntas

AL CONTINUAR:
- Guardar en estado (usar useState):
  - categoryId
  - questionId (si seleccionó predefinida)
  - customQuestion (si escribió custom)
- Navegar a /ritual/tirada con estos datos en state

IMPORTANTE:
- Mostrar SkeletonCard mientras carga preguntas
- Manejar caso donde categoryId no existe
```

---

### TAREA 4.6: Crear página selector de tirada

**Prioridad:** ALTA
**Estimación:** 45 min
**Dependencias:** 4.2, 4.5

**Consigna:**
Crear interfaz para que usuario seleccione tipo de tirada (1, 3, 5 o 10 cartas).

**Prompt:**

```
Crea la página selector de tirada:

CREAR ARCHIVO: src/app/ritual/tirada/page.tsx

CLIENT COMPONENT ('use client')

RECIBIR STATE de página anterior (pregunta seleccionada)

ESTRUCTURA:
- Breadcrumb: "Ritual > Pregunta > Tipo de Tirada"
- Título: "Elige tu tipo de consulta"

GRID DE TIRADAS:
- Grid responsive 2x2
- Cada tirada como Card grande:
  - Nombre del spread
  - Descripción corta
  - Número de cartas
  - Nivel: Principiante / Intermedio / Avanzado (badge)
  - Tiempo estimado de lectura
  - Botón "Seleccionar"

SPREADS (según backend):
1. Respuesta Rápida - 1 carta - Principiante - 2 min
2. Pasado-Presente-Futuro - 3 cartas - Principiante - 5 min
3. Análisis Profundo - 5 cartas - Intermedio - 10 min
4. Cruz Céltica - 10 cartas - Avanzado - 20 min

OBTENER DATOS:
- useSpreads() para obtener tipos de tirada

AL SELECCIONAR:
- Validar límites de uso del usuario (verificar plan)
- Si alcanzó límite diario: mostrar modal "Has alcanzado tu límite. Actualiza a Premium"
- Si OK: navegar a /ritual/lectura con todos los datos

IMPORTANTE:
- Diseño visual atractivo para cada tirada
- Usar badge para indicar nivel
- Mostrar icono de cartas según cantidad
```

---

### TAREA 4.7: Crear página de lectura (ritual)

**Prioridad:** CRÍTICA
**Estimación:** 90 min
**Dependencias:** 4.3, 4.6

**Consigna:**
Crear la experiencia completa de lectura con 3 estados: selección de cartas, loading IA, resultado.

**Prompt:**

```
Crea la página de experiencia de lectura:

CREAR ARCHIVO: src/app/ritual/lectura/page.tsx

CLIENT COMPONENT ('use client')

RECIBIR STATE con: categoryId, questionId/customQuestion, spreadId

ESTADOS DE LA EXPERIENCIA:

ESTADO 1: SELECCIÓN DE CARTAS
- Mostrar pregunta del usuario arriba
- Grid de cartas boca abajo (dorsos) según spreadId:
  - 1 carta: centrada
  - 3 cartas: fila horizontal
  - 5 cartas: cruz
  - 10 cartas: cruz céltica (layout especial)
- Usuario puede clicar en cada carta (máximo el número permitido)
- Cartas seleccionadas se marcan con borde primary
- Botón flotante: "Revelar mi destino" (solo activo cuando seleccionó todas)

ESTADO 2: LOADING IA
- Ocultar grid de cartas
- Mostrar animación de pulso con ícono de carta
- Textos rotativos cada 2 segundos:
  - "Consultando con el universo..."
  - "Alineando energías..."
  - "Descifrando el mensaje cósmico..."
- Barra de progreso animada (opcional)

ESTADO 3: RESULTADO
- Revelar cartas seleccionadas (animación de volteo secuencial)
- Debajo de cada carta: su nombre y posición en el spread
- Sección de interpretación:
  - Título: "Tu lectura del Tarot"
  - Texto de interpretación renderizado como markdown
  - Usar componente de markdown (instalar: npm install react-markdown)
- Botones de acción:
  - "Guardar Lectura" (siempre)
  - "Regenerar Interpretación" (solo Premium)
  - "Compartir" (genera link público)
  - "Nueva Lectura"

LÓGICA:
- Al hacer clic en "Revelar", llamar a useCreateReading() con los datos
- Guardar reading devuelta en estado local
- La API ya retorna las cartas e interpretación

IMPORTANTE:
- Usar componente T


# 🎯 Backlog Técnico Frontend - TarotFlavia (Parte 2)

**Continuación desde TAREA 4.7**

---

### TAREA 4.7: Crear página de lectura (ritual) - CONTINUACIÓN

**Prompt (continuación):**
```

...continuación de TAREA 4.7

IMPORTANTE:

- Usar componente TarotCard para mostrar cartas
- Animación de volteo secuencial (delay entre cartas)
- Para interpretación markdown: instalar react-markdown
- Manejar errores de límite de uso (mostrar modal upgrade)
- Deshabilitar interacción mientras está en loading

```

---

## 📚 FASE 5: HISTORIAL DE LECTURAS

### TAREA 5.1: Crear componente ReadingCard
**Prioridad:** ALTA
**Estimación:** 35 min
**Dependencias:** 1.1, 1.5

**Consigna:**
Crear componente de tarjeta para mostrar lectura en el historial con preview y acciones.

**Prompt:**
```

Crea el componente ReadingCard para el historial:

CREAR ARCHIVO: src/components/features/reading-card.tsx

PROPS:

- reading: Reading (incluye: id, question, createdAt, cards, category, spread)
- onView: (id: number) => void
- onDelete: (id: number) => void

ESTRUCTURA:

- Card horizontal en desktop, vertical en mobile
- Sección izquierda:
  - Miniatura de la primera carta revelada (pequeña)
  - O ícono de carta si no hay imagen
- Sección centro:
  - Pregunta (text-primary, font-semibold, truncate después de 2 líneas)
  - Fecha relativa (date-fns: "hace 2 días")
  - Badge con tipo de tirada (ej: "Cruz Céltica")
  - Badge con categoría
- Sección derecha:
  - Botón "Ver" (ojo icon)
  - Botón "Eliminar" (trash icon) - solo icono, confirmar antes de eliminar

ESTILOS:

- Fondo surface (blanco)
- Sombra shadow-soft
- hover: shadow-lg y scale-102
- Responsive con flexbox

IMPORTANTE:

- Usar date-fns para formatear fecha: formatDistanceToNow
- Truncar texto largo con line-clamp-2
- Usar iconos de lucide-react

```

---

### TAREA 5.2: Crear página Historial de Lecturas
**Prioridad:** ALTA
**Estimación:** 55 min
**Dependencias:** 5.1, 4.2

**Consigna:**
Crear página con lista paginada de lecturas del usuario, filtros y búsqueda.

**Prompt:**
```

Crea la página de Historial de Lecturas:

CREAR ARCHIVO: src/app/historial/page.tsx

CLIENT COMPONENT ('use client')

DEBE USAR: useRequireAuth()

ESTRUCTURA:

- Header:
  - Título font-serif: "Tu camino revelado"
  - Dropdown filtro por fecha: "Más recientes", "Más antiguas", "Esta semana", "Este mes"
  - Buscador (input) para filtrar por pregunta

- Lista de lecturas:
  - Usar componente ReadingCard
  - Grid vertical con gap-4
  - Paginación abajo (10 lecturas por página)

- Empty State:
  - Icono de carta gris
  - Texto: "Tu destino aún no ha sido revelado. Haz una lectura hoy."
  - Botón: "Hacer mi primera lectura" -> /ritual

OBTENER DATOS:

- useMyReadings(page, limit) con paginación
- Mantener page en useState
- Filtrar localmente por búsqueda (opcional: implementar en backend después)

ACCIONES:

- Ver lectura: navegar a /historial/{id}
- Eliminar: mostrar ConfirmationModal, luego useDeleteReading()

PAGINACIÓN:

- Botones Anterior/Siguiente
- Mostrar "Página X de Y"
- Deshabilitar botones en los extremos

IMPORTANTE:

- Mostrar SkeletonCard (variant: 'reading') mientras carga
- Manejar estado de eliminación (optimistic update)

```

---

### TAREA 5.3: Crear página detalle de lectura
**Prioridad:** ALTA
**Estimación:** 45 min
**Dependencias:** 4.3, 4.2

**Consigna:**
Crear página que muestra lectura completa con cartas, interpretación y opciones de compartir/regenerar.

**Prompt:**
```

Crea la página de detalle de lectura:

CREAR ARCHIVO: src/app/historial/[id]/page.tsx

CLIENT COMPONENT ('use client')

OBTENER ID desde params de Next.js

ESTRUCTURA:

- Breadcrumb: "Historial > Lectura"
- Header:
  - Pregunta realizada (font-serif, grande)
  - Fecha y hora completa
  - Badges: categoría y tipo de tirada

- Sección Cartas:
  - Grid con cartas reveladas según layout del spread
  - Debajo de cada carta: nombre, posición y significado corto

- Sección Interpretación:
  - Título: "Interpretación"
  - Texto completo renderizado como markdown
  - Usar react-markdown con estilos customizados

- Acciones (botones al final):
  - "Compartir" (genera link y copia al portapapeles)
  - "Regenerar Interpretación" (solo Premium, modal de confirmación)
  - "Volver al historial"

OBTENER DATOS:

- useReadingDetail(id)
- Mostrar Skeleton mientras carga
- Si no existe o fue eliminada: mostrar 404

COMPARTIR:

- Llamar a shareReading(id)
- Copiar link al portapapeles: window.navigator.clipboard.writeText()
- Mostrar toast: "Link copiado al portapapeles"

REGENERAR:

- Modal confirmación: "Esto consumirá una regeneración (Premium)"
- Llamar a useRegenerateInterpretation()
- Mostrar loading en el texto de interpretación
- Actualizar cuando termine

IMPORTANTE:

- Usar TarotCard component para mostrar cartas
- Estilizar markdown: títulos, listas, párrafos con spacing adecuado

```

---

## 🌅 FASE 6: CARTA DEL DÍA

### TAREA 6.1: Crear servicio API para Daily Reading
**Prioridad:** ALTA
**Estimación:** 20 min
**Dependencias:** 0.5

**Consigna:**
Crear funciones API y hooks para obtener carta del día.

**Prompt:**
```

Crea el servicio API para Carta del Día:

CREAR ARCHIVO: src/lib/api/daily-reading-api.ts

FUNCIONES:

- getDailyReading(): Promise<DailyReading>
  - POST /daily-reading (retorna o crea la del día)
- getDailyReadingToday(): Promise<DailyReading | null>
  - GET /daily-reading/today
- getDailyReadingHistory(page: number, limit: number): Promise<PaginatedDailyReadings>
  - GET /daily-reading/history?page={page}&limit={limit}
- regenerateDailyReading(): Promise<DailyReading>
  - POST /daily-reading/regenerate (solo Premium)

TYPES (agregar a src/types/reading.types.ts):

- DailyReading: { id, userId, card, interpretation, date, isRegenerated }

CREAR ARCHIVO: src/hooks/queries/use-daily-reading.ts

HOOKS:

1. useDailyReading()
   - useMutation con mutationFn: getDailyReading
   - No usar useQuery porque es un POST

2. useDailyReadingToday()
   - useQuery con queryKey: ['daily-reading', 'today']
   - queryFn: getDailyReadingToday

3. useDailyReadingHistory(page, limit)
   - useQuery con queryKey: ['daily-reading', 'history', page, limit]

4. useRegenerateDailyReading()
   - useMutation con mutationFn: regenerateDailyReading
   - onSuccess: invalidar ['daily-reading', 'today']

IMPORTANTE:

- Manejar errores Premium requerido

```

---

### TAREA 6.2: Crear página Carta del Día
**Prioridad:** ALTA
**Estimación:** 60 min
**Dependencias:** 6.1, 4.3

**Consigna:**
Crear experiencia de carta del día con dos estados: bloqueado (antes de revelar) y revelado.

**Prompt:**
```

Crea la página Carta del Día:

CREAR ARCHIVO: src/app/carta-del-dia/page.tsx

CLIENT COMPONENT ('use client')

DEBE USAR: useRequireAuth()

DOS ESTADOS PRINCIPALES:

ESTADO 1: NO REVELADA (primera vez del día)

- Fondo con gradiente suave
- Carta de dorso centrada, grande
- Animación flotante suave (bounce lento infinito)
- Texto místico: "Conecta con tu energía y toca la carta"
- Al hacer clic en la carta: llamar a useDailyReading()

ESTADO 2: REVELADA

- Transición con animación de volteo
- Carta revelada grande y centrada
- Título de la carta en font-serif, grande, color secondary (dorado)
- Interpretación debajo (markdown)
- Botones:
  - "Compartir mensaje" (copia texto)
  - "Ver historial de cartas"
  - "Regenerar" (solo Premium, modal confirmación)

RESTRICCIÓN FREE:

- Si usuario FREE ya la vio hoy, mostrar directamente ESTADO 2
- Si intenta regenerar: modal "Actualiza a Premium para regenerar"

OBTENER DATOS:

- Al montar: useDailyReadingToday() para verificar si ya existe
- Si existe: mostrar ESTADO 2 directo
- Si no existe: mostrar ESTADO 1

ANIMACIONES:

- Entrada de carta: scale y fade-in
- Volteo: rotateY 3D (igual que TarotCard)
- Transición suave entre estados

IMPORTANTE:

- Experiencia mística y especial (única del día)
- Usar TarotCard component
- Feedback visual inmediato al interactuar

```

---

### TAREA 6.3: Crear página Historial Carta del Día
**Prioridad:** MEDIA
**Estimación:** 35 min
**Dependencias:** 6.1, 5.1

**Consigna:**
Crear historial de cartas del día previas con calendario visual.

**Prompt:**
```

Crea la página de historial de Carta del Día:

CREAR ARCHIVO: src/app/carta-del-dia/historial/page.tsx

CLIENT COMPONENT ('use client')

ESTRUCTURA:

- Título: "Tu viaje diario"
- Vista de lista con tarjetas por fecha

COMPONENTE DailyReadingCard (crear inline similar a ReadingCard):

- Fecha grande y destacada (format: "Lunes 2 de Diciembre")
- Miniatura de carta
- Título de carta
- Preview de interpretación (primeras 2 líneas)
- Botón "Ver completa"

LISTA:

- Ordenada de más reciente a más antigua
- Paginación (10 por página)
- Al hacer clic: navegar a /carta-del-dia/historial/{id}

OBTENER DATOS:

- useDailyReadingHistory(page, limit)

EMPTY STATE:

- "Aún no has consultado tu carta diaria"
- Botón: "Ver carta de hoy"

IMPORTANTE:

- Formato de fecha legible en español
- Usar date-fns con locale es

```

---

## 🏪 FASE 7: MARKETPLACE DE TAROTISTAS

### TAREA 7.1: Crear servicio API para tarotistas
**Prioridad:** ALTA
**Estimación:** 25 min
**Dependencias:** 0.5

**Consigna:**
Crear funciones API y hooks para listar tarotistas y ver perfiles.

**Prompt:**
```

Crea el servicio API para Tarotistas:

CREAR ARCHIVO: src/lib/api/tarotistas-api.ts

FUNCIONES:

- getTarotistas(filters?: TarotistaFilters): Promise<Tarotista[]>
  - GET /tarotistas?specialty={specialty}&search={search}
- getTarotistaById(id: number): Promise<TarotistaDetail>
  - GET /tarotistas/{id}

TYPES (crear src/types/tarotista.types.ts):

- Tarotista: { id, name, bio, avatar, specialties, rating, reviewCount, pricePerSession, isActive }
- TarotistaDetail: extends Tarotista + { languages, yearsExperience, reviews }
- TarotistaFilters: { specialty?: string, search?: string }

CREAR ARCHIVO: src/hooks/queries/use-tarotistas.ts

HOOKS:

1. useTarotistas(filters?: TarotistaFilters)
   - useQuery con queryKey: ['tarotistas', filters]
   - queryFn: () => getTarotistas(filters)

2. useTarotistaDetail(id: number)
   - useQuery con queryKey: ['tarotista', id]
   - queryFn: () => getTarotistaById(id)

IMPORTANTE:

- Manejar especialidades como array de strings

```

---

### TAREA 7.2: Crear componente TarotistaCard
**Prioridad:** ALTA
**Estimación:** 40 min
**Dependencias:** 1.1, 1.5

**Consigna:**
Crear tarjeta de tarotista para el marketplace con foto, info y acciones.

**Prompt:**
```

Crea el componente TarotistaCard:

CREAR ARCHIVO: src/components/features/tarotista-card.tsx

PROPS:

- tarotista: Tarotista
- onViewProfile: (id: number) => void

ESTRUCTURA:

- Card vertical
- Header:
  - Foto de perfil circular grande
  - Borde dorado (border-secondary) de 3px
  - Badge de disponibilidad: punto verde/gris junto al nombre
- Body:
  - Nombre (font-serif, bold)
  - Rating con estrellas (★★★★☆) en color secondary
  - Número de reviews: "(24 valoraciones)"
  - Especialidades como badges pequeños con colores pastel
  - Bio corta (truncate 3 líneas)
- Footer:
  - Precio por sesión: "$XX / 30 min"
  - Botón "Ver Perfil" (outline primary)

ESTILO:

- Fondo surface
- shadow-soft
- hover: scale-105 y shadow-lg
- Responsive

ESPECIALIDADES Y COLORES:

- Amor: rosa pálido
- Dinero: verde pálido
- Carrera: azul pálido
- Salud: naranja pálido
- Espiritual: púrpura pálido

IMPORTANTE:

- Avatar con fallback a iniciales si no hay imagen
- Usar Avatar component de shadcn/ui
- Rating dinámico (máximo 5 estrellas)

```

---

### TAREA 7.3: Crear página Explorar Tarotistas
**Prioridad:** ALTA
**Estimación:** 55 min
**Dependencias:** 7.2, 7.1

**Consigna:**
Crear marketplace con grid de tarotistas, filtros y búsqueda.

**Prompt:**
```

Crea la página Explorar Tarotistas:

CREAR ARCHIVO: src/app/explorar/page.tsx

CLIENT COMPONENT ('use client')

ESTRUCTURA:

- Header:
  - Título font-serif grande: "Nuestros Guías Espirituales"
  - Subtítulo: "Encuentra al mentor ideal para tu camino"
- Filtros (barra horizontal):
  - Buscador (input con ícono de búsqueda)
  - Chips clicables de especialidades:
    - "Todos", "Amor", "Dinero", "Carrera", "Salud", "Espiritual"
  - Chip seleccionado: bg-primary, texto blanco
  - Chips no seleccionados: outline

- Grid de Tarotistas:
  - CSS Grid responsive:
    - 1 columna en mobile
    - 2 columnas en tablet
    - 3 columnas en desktop
  - Gap: gap-6
  - Usar componente TarotistaCard

- Empty State:
  - Si filtro no retorna resultados
  - Ilustración (ícono Search grande)
  - Texto: "No encontramos guías con ese criterio"
  - Botón: "Limpiar filtros"

OBTENER DATOS:

- useTarotistas(filters) con filtros en useState
- Filtrar localmente por búsqueda (search en nombre o bio)

ACCIONES:

- Al hacer clic en tarotista: navegar a /tarotistas/{id}

IMPORTANTE:

- Mostrar SkeletonCard (variant: 'tarotist') mientras carga
- Debounce en el input de búsqueda (300ms)
- Instalar use-debounce: npm install use-debounce

```

---

### TAREA 7.4: Crear página Perfil Público de Tarotista
**Prioridad:** ALTA
**Estimación:** 70 min
**Dependencias:** 7.1

**Consigna:**
Crear perfil completo de tarotista con información detallada y opciones de agendar sesión o lectura IA.

**Prompt:**
```

Crea la página de perfil público de tarotista:

CREAR ARCHIVO: src/app/tarotistas/[id]/page.tsx

CLIENT COMPONENT ('use client')

OBTENER ID desde params

ESTRUCTURA:

SECCIÓN HERO:

- Fondo con gradiente suave primary
- Foto de perfil grande circular con borde dorado
- Nombre grande (font-serif)
- Rating con estrellas y número de reviews
- Badges de especialidades
- Indicador de disponibilidad: "Disponible ahora" (verde) o "No disponible" (gris)

SECCIÓN BIO:

- Título: "Sobre mí"
- Texto completo de bio
- Años de experiencia
- Idiomas

SECCIÓN SERVICIOS (dos opciones como Cards):

CARD 1: Oráculo Digital

- Ícono de cartas
- Título: "Lectura con IA personalizada"
- Descripción corta
- Botón: "Consultar el Tarot" -> /ritual con tarotistaId en state

CARD 2: Sesión Privada

- Ícono de calendario/video
- Título: "Sesión en vivo conmigo"
- Precio y duración
- Botón: "Ver disponibilidad" -> /tarotistas/{id}/reservar

SECCIÓN REVIEWS:

- Título: "Lo que dicen mis consultantes"
- Lista de últimas 5 reviews
- Cada review: avatar, nombre, rating, comentario, fecha
- Si hay más: botón "Ver todas las reseñas"

OBTENER DATOS:

- useTarotistaDetail(id)
- Mostrar Skeleton mientras carga
- Si no existe: 404

IMPORTANTE:

- Diseño elegante y profesional
- Botones con hover effects
- Responsive

# 🎯 Backlog Frontend - TarotFlavia (Parte 3 - FINAL)

**Fases finales: Perfil, Sesiones y Admin**

---

## 👤 FASE 8: MI PERFIL

### TAREA 8.1: Crear servicio API de usuario

**Prioridad:** ALTA
**Estimación:** 20 min
**Dependencias:** 0.5

**Consigna:**
Crear funciones API para gestión de perfil de usuario.

**Prompt:**

```
Crea servicio API para perfil de usuario:

ARCHIVO: src/lib/api/user-api.ts

FUNCIONES:
- getProfile(): Promise<UserProfile>
  - GET /users/profile
- updateProfile(data: UpdateProfileDto): Promise<UserProfile>
  - PATCH /users/profile
- deleteAccount(): Promise<void>
  - DELETE /users/:id

TYPES (src/types/user.types.ts):
- UserProfile: { id, name, email, plan, roles, createdAt, usageStats }
- UpdateProfileDto: { name?: string, email?: string, password?: string }

ARCHIVO: src/hooks/queries/use-user.ts

HOOKS:
- useProfile()
  - useQuery ['profile']
- useUpdateProfile()
  - useMutation con invalidación de ['profile']
- useDeleteAccount()
  - useMutation que limpia auth después
```

---

### TAREA 8.2: Crear página Mi Perfil

**Prioridad:** ALTA
**Estimación:** 60 min
**Dependencias:** 8.1, 1.1

**Consigna:**
Crear página de perfil con tabs: Cuenta, Suscripción, Ajustes.

**Prompt:**

```
Crea página Mi Perfil:

ARCHIVO: src/app/perfil/page.tsx

CLIENT COMPONENT con useRequireAuth()

ESTRUCTURA:

HEADER:
- Card con gradiente primary suave
- Avatar grande
- Nombre usuario
- PlanBadge del plan actual

TABS (usar Tabs de shadcn/ui):

TAB 1: CUENTA
- Formulario editar:
  - Input nombre
  - Input email (readonly)
  - Botón "Guardar cambios"
- Sección cambiar contraseña:
  - Input password actual
  - Input nueva password
  - Input confirmar password
  - Botón "Actualizar contraseña"

TAB 2: SUSCRIPCIÓN
- Card con plan actual
- Fecha de renovación (si Premium/Pro)
- Estadísticas de uso:
  - Lecturas realizadas este mes
  - Lecturas restantes hoy
- Tabla comparativa de planes:
  - Columnas: Free, Premium, Professional
  - Filas: features con checks verdes
- Botón destacado: "Mejorar a Premium" (si es Free)

TAB 3: AJUSTES
- Notificaciones (toggles):
  - Email para nuevas lecturas
  - Recordatorio carta del día
- Privacidad:
  - Hacer perfil público/privado
- Zona peligrosa:
  - Botón rojo "Eliminar cuenta" (modal confirmación)

OBTENER DATOS:
- useProfile()
- useAuth() para plan actual

ACCIONES:
- Guardar cambios: useUpdateProfile()
- Eliminar cuenta: useDeleteAccount() con modal doble confirmación

IMPORTANTE:
- Validación con Zod
- Feedback con toast
- Modal destructivo para eliminar cuenta
```

---

## 📅 FASE 9: SISTEMA DE SESIONES

### TAREA 9.1: Crear servicios API de sesiones

**Prioridad:** ALTA
**Estimación:** 30 min
**Dependencias:** 0.5

**Consigna:**
Crear funciones API para gestión de sesiones.

**Prompt:**

```
Crea servicios API para sesiones:

ARCHIVO: src/lib/api/sessions-api.ts

FUNCIONES:
- getAvailableSlots(tarotistaId: number, date: string): Promise<TimeSlot[]>
  - GET /scheduling/available-slots?tarotistaId={id}&date={date}
- bookSession(data: BookSessionDto): Promise<Session>
  - POST /scheduling/book
- getMySessions(status?: string): Promise<Session[]>
  - GET /scheduling/my-sessions?status={status}
- getSessionDetail(id: number): Promise<SessionDetail>
  - GET /scheduling/my-sessions/{id}
- cancelSession(id: number): Promise<void>
  - POST /scheduling/my-sessions/{id}/cancel

TYPES (src/types/session.types.ts):
- TimeSlot: { time: string, available: boolean }
- Session: { id, tarotistaId, userId, date, time, duration, status, meetLink }
- BookSessionDto: { tarotistaId, date, time, duration }

ARCHIVO: src/hooks/queries/use-sessions.ts

HOOKS:
- useAvailableSlots(tarotistaId, date)
- useBookSession()
- useMySessions(status?)
- useSessionDetail(id)
- useCancelSession()
```

---

### TAREA 9.2: Crear componente Calendario de Reservas

**Prioridad:** ALTA
**Estimación:** 70 min
**Dependencias:** 9.1

**Consigna:**
Crear calendario interactivo para seleccionar fecha y hora de sesión.

**Prompt:**

```
Crea componente BookingCalendar:

ARCHIVO: src/components/features/booking-calendar.tsx

PROPS:
- tarotistaId: number
- onBook: (date: string, time: string, duration: number) => void

ESTRUCTURA:

SELECTOR DE FECHA:
- Scroll horizontal de días (próximos 30 días)
- Cada día como chip/píldora:
  - Formato: "Lun 2"
  - Día seleccionado: bg-secondary (dorado), texto blanco
  - Día sin disponibilidad: gris claro, no clicable
  - Día con disponibilidad: outline clickable

SELECTOR DE HORA:
- Al seleccionar día, mostrar slots disponibles abajo
- Chips de horarios: "09:00", "10:00", etc.
- Slot disponible: outline clickable
- Slot ocupado: gris, disabled
- Slot seleccionado: bg-primary

SELECTOR DE DURACIÓN:
- Radio buttons: 30 min, 60 min, 90 min
- Mostrar precio por duración

RESUMEN:
- Card sticky/fixed mostrando:
  - Fecha seleccionada
  - Hora seleccionada
  - Duración
  - Precio total
- Botón: "Confirmar y Reservar"

OBTENER DATOS:
- useAvailableSlots(tarotistaId, selectedDate)
- Recargar slots cuando cambia fecha

IMPORTANTE:
- Validar que usuario seleccionó fecha, hora y duración
- Deshabilitar botón si falta algo
- Responsive: en mobile, lista vertical
```

---

### TAREA 9.3: Crear página Reservar Sesión

**Prioridad:** ALTA
**Estimación:** 45 min
**Dependencias:** 9.2

**Consigna:**
Crear flujo completo de reserva de sesión con tarotista.

**Prompt:**

```
Crea página de reserva:

ARCHIVO: src/app/tarotistas/[id]/reservar/page.tsx

CLIENT COMPONENT con useRequireAuth()

ESTRUCTURA:
- Breadcrumb: "Explorar > {Nombre Tarotista} > Reservar"
- Info tarotista en header (mini card):
  - Avatar, nombre, rating
- Componente BookingCalendar
- Al confirmar:
  - Llamar a useBookSession()
  - Si éxito: modal de confirmación con:
    - "¡Sesión reservada!"
    - Detalles: fecha, hora, duración
    - Link de Google Meet (si ya está disponible)
    - Botón: "Agregar a calendario"
    - Botón: "Ver mis sesiones"
  - Si falla: toast con error

IMPORTANTE:
- Validar que usuario tiene saldo/plan suficiente
- Mostrar loading mientras reserva
```

---

### TAREA 9.4: Crear componente SessionCard

**Prioridad:** MEDIA
**Estimación:** 30 min
**Dependencias:** 1.5

**Consigna:**
Crear tarjeta para mostrar sesión reservada.

**Prompt:**

```
Crea componente SessionCard:

ARCHIVO: src/components/features/session-card.tsx

PROPS:
- session: Session
- onCancel?: (id: number) => void
- onJoin?: (meetLink: string) => void

ESTRUCTURA:
- Card horizontal
- Izquierda:
  - Avatar del tarotista
  - Nombre
- Centro:
  - Fecha y hora: "Lunes 2 de Diciembre - 15:00"
  - Duración: "60 minutos"
  - StatusBadge (pending, confirmed, completed, cancelled)
- Derecha:
  - Si status=confirmed y fecha cercana: botón "Unirse" (verde)
  - Si status=pending o confirmed: botón "Cancelar" (outline rojo)
  - Si status=completed: ícono check verde

ESTILOS:
- Borde izquierdo coloreado según status
- Shadow suave
- Responsive

IMPORTANTE:
- Calcular si sesión es "próxima" (dentro de 24hs)
- Deshabilitar cancelación si faltan menos de 24hs
```

---

### TAREA 9.5: Crear página Mis Sesiones

**Prioridad:** ALTA
**Estimación:** 40 min
**Dependencias:** 9.4, 9.1

**Consigna:**
Crear lista de sesiones del usuario con filtros por estado.

**Prompt:**

```
Crea página Mis Sesiones:

ARCHIVO: src/app/sesiones/page.tsx

CLIENT COMPONENT con useRequireAuth()

ESTRUCTURA:
- Título: "Mis Sesiones"
- Tabs para filtrar:
  - "Próximas" (pending + confirmed)
  - "Completadas"
  - "Canceladas"
  - "Todas"

- Lista de sesiones:
  - Usar SessionCard
  - Ordenadas por fecha (próximas primero)

- Empty State por tab:
  - Próximas: "No tienes sesiones programadas"
  - Completadas: "Aún no has tenido sesiones"
  - etc.

OBTENER DATOS:
- useMySessions(statusFilter)
- Filtrar por tab seleccionado

ACCIONES:
- Cancelar: modal confirmación, luego useCancelSession()
- Unirse: abrir meetLink en nueva pestaña
- Ver detalle: navegar a /sesiones/{id}

IMPORTANTE:
- Mostrar SkeletonCard mientras carga
- Ordenamiento correcto por fecha
```

---

## ⚙️ FASE 10: PANEL DE ADMINISTRACIÓN

### TAREA 10.1: Crear layout de Admin

**Prioridad:** ALTA
**Estimación:** 40 min
**Dependencias:** 2.1

**Consigna:**
Crear layout específico para sección admin con sidebar de navegación.

**Prompt:**

```
Crea layout admin:

ARCHIVO: src/app/admin/layout.tsx

CLIENT COMPONENT

DEBE VERIFICAR:
- useAuth() para verificar rol 'admin'
- Si NO es admin: redirect a /perfil

ESTRUCTURA:
- Sidebar fijo izquierdo (desktop) / drawer colapsable (mobile)
- Contenido main a la derecha

SIDEBAR:
- Logo arriba
- Items de navegación:
  - Dashboard (ícono LayoutDashboard)
  - Usuarios (ícono Users)
  - Tarotistas (ícono Sparkles)
  - Lecturas (ícono BookOpen)
  - Configuración (ícono Settings)
- Link activo: bg-primary/10, borde izquierdo primary

MAIN:
- Padding adecuado
- Background bg-main
- {children}

IMPORTANTE:
- Responsive con hamburger menu en mobile
- Active link styling
- Guard de autorización
```

---

### TAREA 10.2: Crear Dashboard Admin

**Prioridad:** ALTA
**Estimación:** 60 min
**Dependencias:** 10.1

**Consigna:**
Crear dashboard con métricas principales y gráficos.

**Prompt:**

```
Crea dashboard admin:

ARCHIVO: src/app/admin/page.tsx

CLIENT COMPONENT

ESTRUCTURA:

CARDS DE MÉTRICAS (grid 4 columnas):
1. Total Usuarios
   - Número grande
   - Comparación vs mes anterior (+5%)
2. Lecturas del Mes
   - Número + tendencia
3. Tarotistas Activos
   - Número
4. Revenue del Mes
   - Monto en $

GRÁFICOS (grid 2 columnas):
1. Lecturas por día (últimos 30 días)
   - Gráfico de líneas
   - Usar recharts: npm install recharts
2. Distribución por plan
   - Gráfico de dona

TABLA RECIENTE:
- Últimas 10 lecturas realizadas
- Columnas: Usuario, Fecha, Tipo de tirada, Status
- Link a detalle

OBTENER DATOS:
- Crear hook useDashboardStats()
- GET /admin/dashboard/stats (métricas completas)
- GET /admin/dashboard/charts (datos para gráficos)
- NOTA: /admin/dashboard/metrics está deprecated, usar /stats

IMPORTANTE:
- Instalar recharts para gráficos
- Cards con iconos de lucide-react
- Números formateados (separador de miles)
```

---

### TAREA 10.3: Crear página Admin Usuarios

**Prioridad:** ALTA
**Estimación:** 55 min
**Dependencias:** 10.1

**Consigna:**
Crear tabla de usuarios con búsqueda, filtros y acciones de administración.

**Prompt:**

```
Crea gestión de usuarios admin:

ARCHIVO: src/app/admin/usuarios/page.tsx

CLIENT COMPONENT

ESTRUCTURA:
- Header:
  - Título: "Gestión de Usuarios"
  - Input de búsqueda (nombre o email)
  - Filtro por plan (dropdown)
  - Filtro por rol (dropdown)

- Tabla de usuarios:
  - Columnas:
    - Avatar + Nombre
    - Email
    - Plan (badge)
    - Roles (badges)
    - Fecha registro
    - Acciones (dropdown)
  - Paginación abajo

- Acciones por usuario (dropdown):
  - Ver perfil
  - Cambiar plan
  - Asignar/quitar rol
  - Banear/Desbanear
  - Eliminar cuenta

MODALES:
- Modal Cambiar Plan:
  - Select con opciones: Free, Premium, Professional
  - Botón confirmar
- Modal Banear:
  - Textarea para razón
  - Botón confirmar destructivo

OBTENER DATOS:
- Crear hook useAdminUsers(filters, page, limit)
- API: GET /admin/users

IMPORTANTE:
- Tabla responsive (en mobile: cards)
- Búsqueda con debounce
- Confirmación para acciones destructivas
```

---

### TAREA 10.4: Crear página Admin Tarotistas

**Prioridad:** MEDIA
**Estimación:** 50 min
**Dependencias:** 10.1

**Consigna:**
Crear gestión de tarotistas con aprobación de aplicaciones.

**Prompt:**

```
Crea gestión de tarotistas admin:

ARCHIVO: src/app/admin/tarotistas/page.tsx

CLIENT COMPONENT

TABS:

TAB 1: TAROTISTAS ACTIVOS
- Tabla similar a usuarios
- Columnas:
  - Avatar + Nombre
  - Especialidades
  - Rating
  - Sesiones completadas
  - Revenue
  - Estado (activo/inactivo)
  - Acciones
- Acciones:
  - Ver perfil
  - Editar configuración IA
  - Desactivar/Reactivar
  - Ver métricas

TAB 2: APLICACIONES PENDIENTES
- Lista de aplicaciones para ser tarotista
- Card por aplicación:
  - Datos del usuario
  - Razón/motivación
  - Fecha de aplicación
  - Botones: "Aprobar" (verde) / "Rechazar" (rojo)

OBTENER DATOS:
- Hooks: useAdminTarotistas(), useTarotistApplications()
- APIs: GET /admin/tarotistas, GET /admin/tarotistas/applications

ACCIONES:
- Aprobar: POST /admin/tarotistas/applications/{id}/approve
- Rechazar: POST /admin/tarotistas/applications/{id}/reject

IMPORTANTE:
- Confirmación antes de aprobar/rechazar
- Toast con feedback
- Actualizar lista después de acción
```

---

### TAREA 10.5: Crear página Uso de IA y Costos

**Prioridad:** CRÍTICA
**Estimación:** 70 min
**Dependencias:** 10.1

**Consigna:**
Crear página para visualizar estadísticas de uso de IA, costos por proveedor y alertas activas. Esta es información crítica para el administrador.

**Prompt:**

```
Crea página de estadísticas de uso de IA:

ARCHIVO: src/app/admin/ai-usage/page.tsx

CLIENT COMPONENT

ESTRUCTURA:

HEADER:
- Título: "Uso de Inteligencia Artificial"
- Selector de rango de fechas (últimos 7 días, 30 días, custom)

CARDS DE ALERTAS (mostrar solo si hay alertas activas):
- Alert cards con colores según severidad:
  - groqRateLimitAlert: "⚠️ Límite de Groq cercano" (amarillo)
  - highErrorRateAlert: "🔴 Tasa de errores alta" (rojo)
  - highFallbackRateAlert: "⚠️ Muchos fallbacks a proveedores secundarios" (amarillo)
  - highDailyCostAlert: "💰 Costo diario alto" (naranja)

CARDS DE MÉTRICAS (grid 4 columnas):
1. Total Requests
   - Número grande
   - Llamadas de Groq hoy vs límite diario
2. Tokens Consumidos
   - Total tokens (input + output)
   - Desglose: input/output
3. Costo Total
   - Monto en USD
   - Comparación vs mes anterior
4. Tasa de Éxito
   - Porcentaje
   - Color verde si > 95%, amarillo si > 90%, rojo si < 90%

TABLA POR PROVEEDOR:
- Columnas:
  - Proveedor (Groq, OpenAI, DeepSeek)
  - Total Calls
  - Successful Calls
  - Failed Calls
  - Error Rate %
  - Total Tokens
  - Average Latency (ms)
  - Total Cost (USD)
- Fila de totales al final

GRÁFICOS (grid 2 columnas):
1. Costos por día (últimos 30 días)
   - Gráfico de barras apiladas por proveedor
   - Usar recharts
2. Distribución por proveedor
   - Gráfico de dona

OBTENER DATOS:
- Crear archivo: src/lib/api/admin-ai-usage-api.ts
- Función: getAIUsageStats(startDate?, endDate?)
  - GET /admin/ai-usage?startDate={date}&endDate={date}
- Crear hook: src/hooks/queries/use-admin-ai-usage.ts
  - useAIUsageStats(startDate?, endDate?)

TYPES (src/types/admin.types.ts):
interface AIProviderStats {
  provider: 'GROQ' | 'OPENAI' | 'DEEPSEEK';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  errorRate: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  averageLatency: number;
  totalCost: number;
}

interface AIUsageStats {
  statistics: AIProviderStats[];
  groqCallsToday: number;
  groqRateLimitAlert: boolean;
  highErrorRateAlert: boolean;
  highFallbackRateAlert: boolean;
  highDailyCostAlert: boolean;
}

IMPORTANTE:
- Formatear costos con 4 decimales (ej: $0.0234)
- Formatear tokens con separador de miles
- Colores de proveedor consistentes en gráficos
- Refresh automático cada 5 minutos (refetchInterval)
```

---

### TAREA 10.6: Crear página Configuración de Planes

**Prioridad:** ALTA
**Estimación:** 60 min
**Dependencias:** 10.1

**Consigna:**
Crear página para ver y editar la configuración de límites de cada plan (FREE, PREMIUM, PROFESSIONAL).

**Prompt:**

```
Crea página de configuración de planes:

ARCHIVO: src/app/admin/planes/page.tsx

CLIENT COMPONENT

ESTRUCTURA:

HEADER:
- Título: "Configuración de Planes"
- Descripción: "Gestiona los límites y features de cada plan de suscripción"

GRID DE CARDS (3 columnas, 1 por plan):

CARD POR PLAN (FREE, PREMIUM, PROFESSIONAL):
- Header con nombre del plan y badge de color
- Formulario editable con campos:
  - dailyReadingLimit: number (lecturas diarias)
  - monthlyAIQuota: number (cuota mensual de IA, -1 = ilimitado)
  - canUseCustomQuestions: boolean (toggle)
  - canRegenerateInterpretations: boolean (toggle)
  - maxRegenerationsPerReading: number
  - canShareReadings: boolean (toggle)
  - historyLimit: number (límite de historial, -1 = ilimitado)
  - canBookSessions: boolean (toggle)
  - price: number (precio mensual en USD)
- Botón "Guardar Cambios" por card
- Indicador de "sin guardar" si hay cambios

TABLA COMPARATIVA (abajo):
- Tabla visual mostrando diferencias entre planes
- Columnas: Feature | FREE | PREMIUM | PROFESSIONAL
- Filas con checks verdes o X rojas

OBTENER DATOS:
- Crear archivo: src/lib/api/admin-plans-api.ts
- Funciones:
  - getAllPlans(): GET /plan-config
  - getPlan(planType): GET /plan-config/{planType}
  - updatePlan(planType, data): PUT /plan-config/{planType}
- Crear hook: src/hooks/queries/use-admin-plans.ts
  - usePlans()
  - useUpdatePlan()

TYPES (agregar a src/types/admin.types.ts):
interface PlanConfig {
  id: number;
  planType: 'guest' | 'free' | 'premium' | 'professional';
  dailyReadingLimit: number;
  monthlyAIQuota: number;
  canUseCustomQuestions: boolean;
  canRegenerateInterpretations: boolean;
  maxRegenerationsPerReading: number;
  canShareReadings: boolean;
  historyLimit: number;
  canBookSessions: boolean;
  price: number;
}

IMPORTANTE:
- Validación antes de guardar (números positivos o -1)
- Confirmación modal antes de guardar cambios
- Toast de éxito/error
- Deshabilitar edición de GUEST (solo lectura)
```

---

### TAREA 10.7: Crear página Rate Limiting y Seguridad

**Prioridad:** ALTA
**Estimación:** 55 min
**Dependencias:** 10.1

**Consigna:**
Crear página para monitorear violaciones de rate limiting, IPs bloqueadas y eventos de seguridad.

**Prompt:**

```
Crea página de rate limiting y seguridad:

ARCHIVO: src/app/admin/seguridad/page.tsx

CLIENT COMPONENT

ESTRUCTURA:

TABS:
- "Rate Limiting"
- "Eventos de Seguridad"

TAB 1: RATE LIMITING

CARDS DE STATS (grid 3 columnas):
1. Total Violaciones
   - Número
2. IPs con Violaciones Activas
   - Número
3. IPs Bloqueadas
   - Número (color rojo si > 0)

TABLA: IPs CON VIOLACIONES
- Columnas:
  - IP
  - Cantidad de violaciones
  - Primera violación (fecha)
  - Última violación (fecha)
  - Acciones (botón "Bloquear IP")

TABLA: IPs BLOQUEADAS
- Columnas:
  - IP
  - Razón del bloqueo
  - Bloqueada desde
  - Expira en
  - Acciones (botón "Desbloquear")

TAB 2: EVENTOS DE SEGURIDAD

FILTROS:
- Tipo de evento (dropdown): login_failed, suspicious_activity, etc.
- Severidad (dropdown): low, medium, high, critical
- Rango de fechas
- Usuario específico (input)

TABLA DE EVENTOS:
- Columnas:
  - Fecha/Hora
  - Tipo de evento
  - Severidad (badge con color)
  - Usuario (si aplica)
  - IP
  - Descripción
- Paginación

OBTENER DATOS:
- Crear archivo: src/lib/api/admin-security-api.ts
- Funciones:
  - getRateLimitViolations(): GET /admin/rate-limits/violations
  - getSecurityEvents(filters): GET /admin/security/events
- Crear hooks:
  - useRateLimitViolations()
  - useSecurityEvents(filters)

TYPES:
interface RateLimitViolation {
  ip: string;
  count: number;
  firstViolation: string;
  lastViolation: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt: string;
}

interface SecurityEvent {
  id: number;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  ip: string;
  description: string;
  createdAt: string;
}

IMPORTANTE:
- Colores de severidad: low=gris, medium=amarillo, high=naranja, critical=rojo
- Refresh automático cada 30 segundos
- Confirmación antes de bloquear/desbloquear IP
```

---

### TAREA 10.8: Crear página Audit Logs

**Prioridad:** MEDIA
**Estimación:** 40 min
**Dependencias:** 10.1

**Consigna:**
Crear página para ver el historial de acciones administrativas (audit trail).

**Prompt:**

```
Crea página de audit logs:

ARCHIVO: src/app/admin/audit/page.tsx

CLIENT COMPONENT

ESTRUCTURA:

HEADER:
- Título: "Registro de Auditoría"
- Descripción: "Historial de todas las acciones administrativas"

FILTROS (barra horizontal):
- Usuario (dropdown con admins)
- Tipo de acción (dropdown): USER_BANNED, PLAN_CHANGED, TAROTISTA_APPROVED, etc.
- Entidad (dropdown): User, Tarotista, Reading, etc.
- Rango de fechas
- Botón "Limpiar filtros"

TABLA DE LOGS:
- Columnas:
  - Fecha/Hora
  - Admin (nombre del admin que hizo la acción)
  - Acción (badge con color)
  - Entidad afectada
  - Detalles (expandible)
  - IP del admin
- Paginación (20 por página)

DETALLES EXPANDIBLES (por fila):
- Mostrar JSON con:
  - oldValue: estado anterior
  - newValue: estado nuevo
- Formato legible con diff highlighting si aplica

OBTENER DATOS:
- Crear archivo: src/lib/api/admin-audit-api.ts
- Función: getAuditLogs(filters): GET /admin/audit-logs
- Hook: useAuditLogs(filters)

TYPES:
interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  targetUserId?: number;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: object;
  newValue?: object;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

IMPORTANTE:
- Acciones con colores: destructivas=rojo, creación=verde, modificación=azul
- JSON viewer para oldValue/newValue
- Exportar a CSV (botón opcional)
```

---

### TAREA 10.9: Crear página Cache Management

**Prioridad:** BAJA
**Estimación:** 35 min
**Dependencias:** 10.1

**Consigna:**
Crear página para ver estadísticas de caché y poder invalidar caché manualmente.

**Prompt:**

```
Crea página de gestión de caché:

ARCHIVO: src/app/admin/cache/page.tsx

CLIENT COMPONENT

ESTRUCTURA:

HEADER:
- Título: "Gestión de Caché"
- Botón "Refrescar Stats"

CARDS DE STATS (grid 4 columnas):
1. Total Entries
   - Número de entradas en caché
2. Hit Rate
   - Porcentaje (color verde si > 80%)
3. Miss Rate
   - Porcentaje
4. Memory Usage
   - MB usados

SECCIÓN: COMBINACIONES MÁS CACHEADAS
- Tabla con top 10:
  - Tarotista
  - Spread
  - Categoría
  - Hit Count
  - Última actualización

SECCIÓN: ACCIONES DE INVALIDACIÓN
- Card con opciones:
  - Invalidar todo el caché (botón rojo con confirmación)
  - Invalidar por tarotista:
    - Dropdown para seleccionar tarotista
    - Botón "Invalidar"
  - Invalidar por spread:
    - Dropdown para seleccionar spread
    - Botón "Invalidar"

SECCIÓN: WARMING STATUS
- Estado actual del warming
- Última ejecución
- Próxima ejecución programada
- Botón "Ejecutar Warming Ahora"

OBTENER DATOS:
- Crear archivo: src/lib/api/admin-cache-api.ts
- Funciones:
  - getCacheAnalytics(): GET /admin/cache/analytics
  - invalidateTarotistaCache(id): DELETE /admin/cache/tarotistas/{id}
  - triggerCacheWarming(): POST /admin/cache/warming/trigger
- Hook: useCacheAnalytics()

IMPORTANTE:
- Confirmación para invalidar todo
- Toast con cantidad de entradas eliminadas
- Refresh después de invalidación
```

---

### TAREA 10.10: Crear página Métricas de Plataforma

**Prioridad:** MEDIA
**Estimación:** 45 min
**Dependencias:** 10.1

**Consigna:**
Crear página con métricas agregadas de toda la plataforma (revenue, sesiones, performance).

**Prompt:**

```
Crea página de métricas de plataforma:

ARCHIVO: src/app/admin/metricas/page.tsx

CLIENT COMPONENT

ESTRUCTURA:

HEADER:
- Título: "Métricas de Plataforma"
- Selector de período: 7 días, 30 días, 90 días, 1 año

CARDS DE MÉTRICAS PRINCIPALES (grid 4 columnas):
1. Revenue Total
   - Monto en USD
   - Comparación con período anterior
   - Tendencia (flecha arriba/abajo)
2. Sesiones Completadas
   - Número
   - % de sesiones reservadas que se completaron
3. Lecturas Totales
   - Número
   - Promedio por usuario
4. Usuarios Activos
   - Número (últimos 30 días)
   - Nuevos registros del período

GRÁFICOS (grid 2x2):
1. Revenue por mes (barras)
2. Lecturas por día (líneas)
3. Distribución de usuarios por plan (dona)
4. Sesiones por estado (barras horizontales)

TABLA: TOP TAROTISTAS
- Columnas:
  - Posición
  - Nombre
  - Lecturas generadas
  - Sesiones completadas
  - Revenue generado
  - Rating promedio

OBTENER DATOS:
- Usar endpoint existente: GET /tarotistas/metrics/platform
- Crear hook: usePlatformMetrics(period)

IMPORTANTE:
- Formatear montos como currency
- Formatear números grandes (1.2K, 15K, etc.)
- Colores consistentes en gráficos
- Loading skeletons mientras carga
```

---

### TAREA 10.11: Actualizar sidebar de Admin con nuevas páginas

**Prioridad:** ALTA
**Estimación:** 15 min
**Dependencias:** 10.5-10.10

**Consigna:**
Actualizar el sidebar del layout de admin para incluir todas las nuevas páginas.

**Prompt:**

```
Actualiza el sidebar del admin layout:

MODIFICAR: src/app/admin/layout.tsx

NUEVA ESTRUCTURA DE NAVEGACIÓN:

SECCIÓN: PRINCIPAL
- Dashboard (ícono LayoutDashboard) -> /admin
- Métricas (ícono TrendingUp) -> /admin/metricas

SECCIÓN: GESTIÓN
- Usuarios (ícono Users) -> /admin/usuarios
- Tarotistas (ícono Sparkles) -> /admin/tarotistas
- Lecturas (ícono BookOpen) -> /admin/lecturas

SECCIÓN: SISTEMA
- Uso de IA (ícono Brain) -> /admin/ai-usage
- Configuración de Planes (ícono Settings) -> /admin/planes
- Seguridad (ícono Shield) -> /admin/seguridad
- Caché (ícono Database) -> /admin/cache
- Audit Logs (ícono ScrollText) -> /admin/audit

ESTILOS:
- Separadores entre secciones
- Títulos de sección en texto pequeño gris
- Iconos de lucide-react
- Link activo: bg-primary/10, borde izquierdo primary

IMPORTANTE:
- Mantener responsive
- Colapsar secciones en mobile
```

---

## 🔗 FASE 10.5: FUNCIONALIDADES DE USUARIO FALTANTES

### TAREA 10.12: Crear página de Lectura Compartida Pública

**Prioridad:** MEDIA
**Estimación:** 35 min
**Dependencias:** 4.3

**Consigna:**
Crear página pública (sin login requerido) para ver lecturas compartidas mediante token.

**Prompt:**

```
Crea página de lectura compartida pública:

ARCHIVO: src/app/lecturas/compartida/[token]/page.tsx

SERVER COMPONENT (puede ser público)

ESTRUCTURA:

HEADER:
- Logo de TarotFlavia centrado
- Texto: "Lectura compartida"

CONTENIDO:
- Card principal con:
  - Pregunta realizada (título grande, font-serif)
  - Fecha de la lectura
  - Tipo de tirada (badge)

- Sección de cartas:
  - Grid con las cartas reveladas
  - Usar TarotCard component
  - Debajo de cada carta: nombre y posición

- Sección de interpretación:
  - Texto completo renderizado como markdown
  - Usar react-markdown

FOOTER:
- Texto: "¿Quieres tu propia lectura?"
- Botón CTA: "Crear mi cuenta gratis" -> /registro

ESTADO DE ERROR:
- Si token inválido o expirado:
  - Mostrar mensaje: "Esta lectura ya no está disponible"
  - Botón: "Ir al inicio"

OBTENER DATOS:
- Crear función: getSharedReading(token): GET /readings/shared/{token}
- Esta ruta NO requiere autenticación
- Llamar desde el Server Component con fetch

IMPORTANTE:
- NO usar hooks de auth (es página pública)
- SEO: exportar metadata dinámica con título de la lectura
- Open Graph tags para preview al compartir en redes
```

---

### TAREA 10.13: Agregar selector de Tarotista Favorito

**Prioridad:** MEDIA
**Estimación:** 30 min
**Dependencias:** 7.4

**Consigna:**
Agregar funcionalidad para que usuarios FREE puedan seleccionar su tarotista favorito (con cooldown de 30 días).

**Prompt:**

```
Agrega funcionalidad de tarotista favorito:

MODIFICAR: src/app/tarotistas/[id]/page.tsx (Perfil de Tarotista)

AGREGAR EN HERO SECTION:
- Si usuario está logueado y es FREE:
  - Mostrar botón "⭐ Elegir como favorito"
  - Si ya es favorito: mostrar "⭐ Tu tarotista favorito" (badge dorado)
  - Si tiene cooldown activo: mostrar "Podrás cambiar en X días"

LÓGICA:
- Al hacer clic en "Elegir como favorito":
  - Modal de confirmación: "¿Establecer a {nombre} como tu tarotista favorito? Solo podrás cambiarlo en 30 días"
  - Llamar a API
  - Actualizar UI

CREAR SERVICIO:
- Archivo: src/lib/api/subscriptions-api.ts
- Funciones:
  - setFavoriteTarotista(tarotistaId): POST /subscriptions/set-favorite
  - getMySubscription(): GET /subscriptions/my-subscription

CREAR HOOK:
- useSetFavoriteTarotista()
- useMySubscription()

TYPES:
interface UserSubscription {
  id: number;
  favoriteTarotistaId: number | null;
  lastFavoriteChange: string | null;
  canChangeFavorite: boolean;
  daysUntilChange: number;
}

MOSTRAR EN MI PERFIL (TAREA 8.2):
- En la sección de cuenta, mostrar:
  - "Tu tarotista favorito: {nombre}"
  - Link para ver su perfil

IMPORTANTE:
- Solo mostrar para usuarios FREE (PREMIUM tiene all-access)
- Manejar error si cooldown activo
- Toast de éxito al establecer favorito
```

---

## ✅ FASE 11: EXTRAS Y POLISH

### TAREA 11.1: Crear página 404 custom

**Prioridad:** BAJA
**Estimación:** 20 min

**Prompt:**

```
Crea página 404:

ARCHIVO: src/app/not-found.tsx

ESTRUCTURA:
- Centrada vertical y horizontal
- Ícono grande de carta boca abajo
- Título font-serif: "404 - Camino no encontrado"
- Texto místico: "Los astros no reconocen este destino"
- Botón: "Volver al inicio"

ESTILO:
- Fondo bg-main
- Temática mística consistente
```

---

### TAREA 11.2: Agregar Loading States globales

**Prioridad:** MEDIA
**Estimación:** 30 min

**Prompt:**

```
Crea loading.tsx para rutas principales:

ARCHIVOS:
- src/app/loading.tsx (global)
- src/app/ritual/loading.tsx
- src/app/historial/loading.tsx
- src/app/explorar/loading.tsx

CADA LOADING:
- Spinner centrado con animación
- Texto: "Cargando..."
- Usar componente de shadcn/ui o custom

IMPORTANTE:
- Next.js usa automáticamente loading.tsx como Suspense boundary
```

---

### TAREA 11.3: Implementar SEO y Metadata

**Prioridad:** MEDIA
**Estimación:** 40 min

**Prompt:**

```
Configura SEO y metadata:

MODIFICAR: Cada page.tsx debe exportar metadata

EJEMPLO src/app/page.tsx:
export const metadata: Metadata = {
  title: 'TarotFlavia - Tu guía espiritual',
  description: 'Lecturas de tarot con IA y sesiones con tarotistas profesionales',
  openGraph: {
    title: 'TarotFlavia',
    description: 'Descubre tu destino',
    images: ['/og-image.png'],
  },
};

PAGES A CONFIGURAR:
- Home, Login, Registro
- Ritual, Historial, Carta del día
- Explorar, Perfil tarotista
- Mi Perfil

IMPORTANTE:
- Metadata dinámica para perfiles de tarotista
- Open Graph para compartir lecturas
```

---

### TAREA 11.4: Optimizar imágenes y assets

**Prioridad:** BAJA
**Estimación:** 30 min

**Prompt:**

```
Optimiza assets:

TAREAS:
1. Usar next/image en lugar de <img>
2. Agregar logo SVG en /public
3. Crear placeholder para cartas de tarot
4. Optimizar tamaños de avatar
5. Agregar favicon y manifest.json para PWA

CONFIGURAR en next.config.js:
- remotePatterns para imágenes externas
- Configuración de compresión

IMPORTANTE:
- Usar Image de Next.js con priority para above-the-fold
- Lazy loading para resto
```

---

## 🧪 FASE 12: TESTING MÍNIMO (Smoke Tests)

> **Nota:** Testing E2E completo está en "Post-MVP", pero estos smoke tests son recomendados antes de release.

### TAREA 12.1: Configurar Vitest para unit tests

**Prioridad:** MEDIA
**Estimación:** 30 min
**Dependencias:** 0.1

**Consigna:**
Configurar Vitest como framework de testing para componentes y hooks.

**Prompt:**

```
Configura Vitest para testing:

INSTALAR:
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom

CREAR ARCHIVO: vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})

CREAR ARCHIVO: src/test/setup.ts
import '@testing-library/jest-dom'

AGREGAR A package.json:
"scripts": {
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}

IMPORTANTE:
- NO escribas tests todavía, solo configura el entorno
```

---

### TAREA 12.2: Smoke tests de componentes críticos

**Prioridad:** MEDIA
**Estimación:** 45 min
**Dependencias:** 12.1, 1.1

**Consigna:**
Crear smoke tests básicos para verificar que los componentes principales renderizan sin errores.

**Prompt:**

```
Crea smoke tests para componentes críticos:

CREAR ARCHIVO: src/components/ui/__tests__/smoke.test.tsx

TESTS MÍNIMOS:
1. Button renderiza sin errores
2. Input renderiza sin errores
3. Card renderiza sin errores
4. Toast puede ser invocado
5. Modal abre y cierra correctamente

EJEMPLO:
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('UI Components Smoke Tests', () => {
  it('Button renders without crashing', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

CREAR ARCHIVO: src/components/features/__tests__/smoke.test.tsx

TESTS:
1. TarotCard renderiza en estado reverso
2. TarotCard renderiza en estado anverso
3. PlanBadge muestra texto correcto por plan
4. StatusBadge muestra color correcto por estado

IMPORTANTE:
- Solo verificar que renderizan sin errores
- NO testear lógica compleja todavía
- Usar mocks para datos
```

---

### TAREA 12.3: Smoke tests de flujos de autenticación

**Prioridad:** ALTA
**Estimación:** 40 min
**Dependencias:** 12.1, 3.3

**Consigna:**
Crear tests básicos para el flujo de autenticación.

**Prompt:**

```
Crea smoke tests para autenticación:

CREAR ARCHIVO: src/app/login/__tests__/login.test.tsx

TESTS:
1. Formulario de login renderiza campos email y password
2. Botón submit está presente
3. Validación muestra error si email inválido
4. Validación muestra error si password muy corto

CREAR ARCHIVO: src/stores/__tests__/auth-store.test.ts

TESTS:
1. Estado inicial es isAuthenticated: false
2. setUser actualiza el estado correctamente
3. logout limpia el usuario

IMPORTANTE:
- Mockear apiClient para evitar llamadas reales
- Usar vi.mock() de Vitest
- NO testear integración con backend todavía
```

---

### TAREA 12.4: Script de smoke test pre-deploy

**Prioridad:** MEDIA
**Estimación:** 20 min
**Dependencias:** 12.2, 12.3

**Consigna:**
Crear script que ejecute todos los smoke tests antes de deploy.

**Prompt:**

```
Configura script de smoke tests:

AGREGAR A package.json:
"scripts": {
  "test:smoke": "vitest run --testPathPattern=smoke",
  "predeploy": "npm run build && npm run test:smoke"
}

CREAR ARCHIVO: .github/workflows/test.yml (opcional si usan GitHub Actions)
name: Smoke Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:smoke

IMPORTANTE:
- Los smoke tests deben pasar en menos de 30 segundos
- Si fallan, bloquear el deploy
```

---

## 🎉 FINALIZACIÓN

**RESUMEN TOTAL DE TAREAS:** ~62 tareas
**ESTIMACIÓN TOTAL:** 46-58 horas de desarrollo

**ORDEN RECOMENDADO DE EJECUCIÓN:**

1. FASE 0: Setup (obligatorio primero)
2. FASE 1-2: UI Kit y Layout
3. FASE 3: Autenticación
4. FASE 4-5: Sistema de lecturas
5. FASE 6-7: Extras (Carta día, Marketplace y Compartir)
6. FASE 8-9: Perfil y Sesiones
7. FASE 10: Admin (Dashboard + Métricas + Configuración completa)
8. FASE 11: Polish final
9. FASE 12: Testing Mínimo (Smoke tests críticos)

**PRÓXIMOS PASOS POST-MVP:**

- Testing E2E completo con Cypress/Playwright
- Integración con Stripe para pagos
- PWA: notificaciones push
- Modo offline con Service Workers
- Analytics y tracking avanzado
- A/B testing
- Internacionalización (i18n)

---

## 📋 VERIFICACIÓN DE ENDPOINTS (3 Dic 2025)

Este documento fue verificado contra el backend real. Cambios aplicados:

### ✅ Endpoints Agregados

- `GET /readings/trash` - Obtener lecturas eliminadas (papelera)
- `POST /readings/{id}/restore` - Restaurar lectura eliminada
- `DELETE /readings/{id}/unshare` - Dejar de compartir lectura

### ✅ Endpoints Corregidos

- `GET /admin/dashboard/metrics` → **DEPRECATED**, usar `GET /admin/dashboard/stats`
- Agregado `GET /admin/dashboard/charts` para datos de gráficos

### ✅ Hooks Agregados

- `useTrashedReadings()` - Query para papelera
- `useRestoreReading()` - Mutation para restaurar
- `useUnshareReading()` - Mutation para dejar de compartir
- `useDashboardStats()` - Reemplaza useDashboardMetrics

### ✅ Tareas Admin Agregadas (3 Dic 2025)

Se agregaron las siguientes tareas para completar el panel de administración:

| Tarea | Descripción                | Endpoint Principal                 | Tiempo |
| ----- | -------------------------- | ---------------------------------- | ------ |
| 10.5  | Admin AI Usage & Costs     | `GET /admin/ai-usage`              | 60 min |
| 10.6  | Admin Plan Configuration   | `GET/PUT /plan-config/:type`       | 50 min |
| 10.7  | Admin Rate Limiting        | `GET /admin/rate-limits/*`         | 45 min |
| 10.8  | Admin Audit Logs           | `GET /admin/audit-logs`            | 40 min |
| 10.9  | Admin Cache Management     | `GET /admin/cache/analytics`       | 45 min |
| 10.10 | Admin Platform Metrics     | `GET /tarotistas/metrics/platform` | 35 min |
| 10.11 | Actualizar Sidebar Admin   | N/A                                | 15 min |
| 7.5   | Public Shared Reading Page | `GET /readings/shared/:token`      | 35 min |

---

**FIN DEL BACKLOG TÉCNICO**
