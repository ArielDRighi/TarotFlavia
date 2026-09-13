# MÓDULO: CONSISTENCIA UI/UX - BACKLOG DE REFACTOR

## PARTE A: REPORTE DE INCONSISTENCIAS

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Módulo:** Consistencia visual y semántica del frontend
**Versión:** 1.0
**Fecha:** 9 de mayo de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## CONTEXTO

Auditoría de consistencia UX/UI sobre `frontend/src/`. El objetivo fue detectar **textos/mensajes que se repiten semánticamente pero con implementaciones distintas de CSS/HTML/componente**: misma intención comunicativa, distintos `<div>`, distintas clases Tailwind, distinto componente shadcn (o ninguno).

El sistema de diseño ya provee primitivos reutilizables en `src/components/ui/` (`Spinner`, `EmptyState`, `ErrorDisplay`, `Alert`, `Skeleton`, `Toaster`), pero gran parte del código de features los reimplementa inline. Esto genera divergencia visual entre páginas que deberían sentirse parte del mismo producto.

> **Nota sobre dark mode:** Auguria solo soporta **light mode**. Las clases `dark:*` que aparecen en algunos archivos (ej: `dark:bg-yellow-950/20`) son legacy heredadas de shadcn/ui y NO representan funcionalidad activa. No se incluyen como criterio de aceptación en este backlog y, donde sea trivial, conviene eliminarlas durante la migración.

---

## DECISIONES DE ARQUITECTURA

| Decisión | Elección | Razón |
| --- | --- | --- |
| Fuente de verdad para loading/empty/error | **Componentes en `components/ui/`** | Ya existen, testeados y documentados |
| Estilos de banners/alertas | **`<Alert>` de shadcn** con variantes | Variantes tipadas y accesibles |
| Skeletons | **`<Skeleton>` de `components/ui/skeleton.tsx`** | Token visual (`bg-accent`) ya alineado |
| Mensajes transitorios | **`toast.*` (Sonner)** | Patrón establecido en `authStore` |
| Mensajes persistentes | **`<Alert>` inline** | Permanecen visibles |
| Copy de CTAs Premium | **Constantes en `lib/constants/`** | Evita drift de copy |
| Migración | **Incremental por categoría** | PRs revisables, baja regresión |

---

## RESUMEN EJECUTIVO

| Categoría | Variantes | Severidad | Archivos afectados (aprox.) |
| --- | --- | --- | --- |
| Loading states ("Cargando…") | 5 | 🔴 Alta | 8+ |
| Empty states ("No hay X") | 3 | 🔴 Alta | 15+ |
| Error states + retry | 4 | 🔴 Alta | 8+ |
| Banners/Alerts (warning/error/success) | 6 | 🔴 Alta | 20+ |
| CTAs Premium ("Comenzar/Obtener/Mejorar/Actualizar Premium") | 6 | 🟡 Media | 10+ |
| Skeletons (`animate-pulse` raw vs `<Skeleton>`) | 3 | 🟡 Media | 10+ |
| CTAs Auth ("Crear Cuenta" vs "Registrarse" vs "Crear Cuenta Gratis") | 4 | 🟡 Media | 6+ |
| Disclaimers (`<div bg-yellow-50>` vs `<Alert>`) | 2 | 🟢 Baja | 3 |
| Toasts vs alerts inline para feedback | 2 | 🟢 Baja | 5+ |
| "Próximamente" como heading/badge | 3 | 🟢 Baja | 4+ |

---

## DETALLE POR CATEGORÍA

### INC-001: Loading states implementados de 5 formas distintas

**Componente recomendado existente:** [`Spinner`](../frontend/src/components/ui/spinner.tsx) — soporta `size`, `text`, `centered`.

**Variantes detectadas:**

1. ✅ **`<Spinner size="lg" text="Cargando..." />`** (correcto, en archivos `loading.tsx` de App Router):
   - [`src/app/explorar/loading.tsx:10`](../frontend/src/app/explorar/loading.tsx#L10)
   - [`src/app/tarot/loading.tsx:10`](../frontend/src/app/tarot/loading.tsx#L10)
   - [`src/app/ritual/loading.tsx:10`](../frontend/src/app/ritual/loading.tsx#L10)
   - [`src/app/historial/loading.tsx:10`](../frontend/src/app/historial/loading.tsx#L10)

   > El `src/app/loading.tsx` **global** que encabezaba esta lista se eliminó en T-SEO-006: al
   > envolver todas las rutas en un `<Suspense>`, hacía que Next confirmara la respuesta con 200
   > antes de renderizar la página y ninguna ruta dinámica podía emitir un 404.

2. ❌ **`<p className="...text-gray-500">Cargando...</p>`** (sin spinner, color hardcoded):
   - [`src/components/features/marketplace/BookingPage.tsx:86`](../frontend/src/components/features/marketplace/BookingPage.tsx#L86) → `<p className="mt-4 text-center text-sm text-gray-500">Cargando...</p>`
   - [`src/app/tarotistas/[id]/reservar/page.tsx:28`](../frontend/src/app/tarotistas/[id]/reservar/page.tsx#L28)
   - [`src/components/features/marketplace/BookingCalendar.tsx:233`](../frontend/src/components/features/marketplace/BookingCalendar.tsx#L233) → `Cargando horarios disponibles...`
   - [`src/components/features/dashboard/SacredEventsWidget.tsx:130`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L130) → `Cargando eventos...`

3. ❌ **`<div className="animate-pulse">Cargando...</div>`** (pulse en texto, no spinner):
   - [`src/components/features/readings/ReadingExperience.tsx:522`](../frontend/src/components/features/readings/ReadingExperience.tsx#L522)
   - [`src/components/features/dashboard/SacredEventsWidget.tsx:128-131`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L128-L131) (combina icon + texto bajo `animate-pulse`)

4. ❌ **`<div className="py-12 text-center">Cargando...</div>`** (texto plano centrado):
   - [`src/components/features/admin/CacheManagementContent.tsx:134`](../frontend/src/components/features/admin/CacheManagementContent.tsx#L134)
   - [`src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx:118`](../frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx#L118) → `Cargando horóscopo...`

5. ❓ **Componente `BirthChartLoading`** (custom, dominio-específico): aceptable si extiende el Spinner; revisar si solo envuelve markup duplicado.

**Severidad:** 🔴 Alta. La mayoría de los casos en componentes "cliente" (no `loading.tsx`) ignoran el primitivo existente.

---

### INC-002: Empty states implementados de 3 formas distintas

**Componente recomendado existente:** [`EmptyState`](../frontend/src/components/ui/empty-state.tsx) — `icon`, `title`, `message`, `action`.

**Variantes detectadas:**

1. ❌ **`<p className="text-muted-foreground py-8 text-center">No hay X</p>`** (texto plano, sin icono ni jerarquía):
   - [`src/components/features/admin/CacheManagementContent.tsx:172`](../frontend/src/components/features/admin/CacheManagementContent.tsx#L172) → `No hay combinaciones cacheadas`
   - [`src/components/features/admin/RateLimitingTab.tsx:109`](../frontend/src/components/features/admin/RateLimitingTab.tsx#L109) → `No hay violaciones registradas`
   - [`src/components/features/admin/RateLimitingTab.tsx:142`](../frontend/src/components/features/admin/RateLimitingTab.tsx#L142) → `No hay IPs bloqueadas`
   - [`src/components/features/admin/TarotistasTable.tsx:53`](../frontend/src/components/features/admin/TarotistasTable.tsx#L53) → `No hay tarotistas para mostrar`
   - [`src/components/features/admin/UsersTable.tsx:65`](../frontend/src/components/features/admin/UsersTable.tsx#L65) → `No hay usuarios para mostrar`
   - [`src/components/features/admin/TarotistasManagementContent.tsx:226`](../frontend/src/components/features/admin/TarotistasManagementContent.tsx#L226)
   - [`src/components/features/marketplace/BookingCalendar.tsx:242`](../frontend/src/components/features/marketplace/BookingCalendar.tsx#L242) → `No hay horarios disponibles para esta fecha`
   - [`src/components/features/birth-chart/PlanetPositionsTable/PlanetPositionsTable.tsx:127`](../frontend/src/components/features/birth-chart/PlanetPositionsTable/PlanetPositionsTable.tsx#L127)

2. ❌ **`<div className="text-muted-foreground py-12 text-center">{emptyMessage}</div>`** (grids genéricos):
   - [`src/components/features/encyclopedia/ArticleGrid.tsx:58`](../frontend/src/components/features/encyclopedia/ArticleGrid.tsx#L58)
   - [`src/components/features/encyclopedia/CardGrid.tsx:53`](../frontend/src/components/features/encyclopedia/CardGrid.tsx#L53)
   - [`src/components/features/rituals/RitualGrid.tsx:53`](../frontend/src/components/features/rituals/RitualGrid.tsx#L53)

3. ❌ **`<div className="py-8 text-center"><Icon /><p>...</p></div>`** (icono + texto inline, replica el patrón de `EmptyState` sin usarlo):
   - [`src/components/features/dashboard/SacredEventsWidget.tsx:144-147`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L144-L147)

**Severidad:** 🔴 Alta. El componente `EmptyState` ya está testeado pero solo se usa en tests; ningún feature lo consume actualmente.

---

### INC-003: Error states + retry implementados de 4 formas distintas

**Componente recomendado existente:** [`ErrorDisplay`](../frontend/src/components/ui/error-display.tsx) — incluye `AlertCircle`, mensaje y botón con copy fija "Intentar de nuevo".

**Variantes detectadas:**

1. ✅ **`<ErrorDisplay message=... onRetry=... />`** (correcto):
   - [`src/components/features/readings/ReadingExperience.tsx:531`](../frontend/src/components/features/readings/ReadingExperience.tsx#L531)

2. ❌ **`<p className="text-red-600">Error al cargar...</p>`** (texto rojo plano sin retry):
   - [`src/components/features/marketplace/BookingPage.tsx:97`](../frontend/src/components/features/marketplace/BookingPage.tsx#L97) → `Error al cargar el tarotista`
   - [`src/components/features/marketplace/BookingCalendar.tsx:238`](../frontend/src/components/features/marketplace/BookingCalendar.tsx#L238) → `Error al cargar horarios disponibles`
   - [`src/components/features/dashboard/SacredEventsWidget.tsx:138`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L138) → `Error al cargar eventos. Inténtalo de nuevo.`

3. ❌ **Bloque `<p text-destructive>` + `<Button>Reintentar</Button>`** (replica `ErrorDisplay` inline con copy distinta):
   - [`src/components/features/admin/CacheManagementContent.tsx:125-128`](../frontend/src/components/features/admin/CacheManagementContent.tsx#L125-L128) → texto `Error al cargar datos de caché` + botón `Reintentar`
   - [`src/components/features/readings/ReadingExperience.tsx:702`](../frontend/src/components/features/readings/ReadingExperience.tsx#L702) → botón `Reintentar` (vs `Intentar de nuevo` del componente canónico)

4. ❌ **Inconsistencia de copy del CTA de retry**: en el código aparecen las dos variantes intercambiadas:
   - "Intentar de nuevo" → `ErrorDisplay` (canónico)
   - "Reintentar" → varios sitios inline
   - Tests usan ambos: [`src/app/tarot/preguntas/page.test.tsx:278`](../frontend/src/app/tarot/preguntas/page.test.tsx#L278) busca `/intentar de nuevo/i`, [`src/app/historial/page.test.tsx:797`](../frontend/src/app/historial/page.test.tsx#L797) busca `/reintentar/i`.

**Severidad:** 🔴 Alta. Mensajes de error con tres niveles de severidad visual (texto rojo plano vs bloque con icono vs componente real) según en qué feature caigas.

---

### INC-004: Banners/Alerts con 6 patrones de markup distintos

**Componente recomendado existente:** [`Alert`](../frontend/src/components/ui/alert.tsx) con `AlertTitle`/`AlertDescription`.

**Variantes detectadas:**

1. ✅ **`<Alert>` correcto** (uso adecuado del primitivo):
   - [`src/app/registro/page.tsx:26`](../frontend/src/app/registro/page.tsx#L26) — banner de whitelisting con icono `Lock`
   - [`src/components/features/admin/AIUsageContent.tsx:49`](../frontend/src/components/features/admin/AIUsageContent.tsx#L49)
   - [`src/components/features/pendulum/PendulumLimitBanner.tsx:36`](../frontend/src/components/features/pendulum/PendulumLimitBanner.tsx#L36)
   - [`src/components/features/numerology/NumerologyPage.tsx:83`](../frontend/src/components/features/numerology/NumerologyPage.tsx#L83)

2. ❌ **`<div className="rounded-lg bg-yellow-50 p-4">`** (disclaimer placeholder reescrito 3 veces):
   - [`src/app/contacto/page.tsx:42`](../frontend/src/app/contacto/page.tsx#L42)
   - [`src/app/terminos/page.tsx:115`](../frontend/src/app/terminos/page.tsx#L115)
   - [`src/app/privacidad/page.tsx:152`](../frontend/src/app/privacidad/page.tsx#L152)
   - Los tres usan exactamente el mismo formato `<strong>Nota:</strong> ...`.

3. ❌ **`<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">`** (banner de error genérico):
   - [`src/app/admin/page.tsx:44`](../frontend/src/app/admin/page.tsx#L44)
   - [`src/components/features/admin/PlatformMetricsContent.tsx:90`](../frontend/src/components/features/admin/PlatformMetricsContent.tsx#L90)
   - [`src/components/features/admin/AgendaManagementContent.tsx:263`](../frontend/src/components/features/admin/AgendaManagementContent.tsx#L263)
   - [`src/components/features/admin/UsersManagementContent.tsx:123`](../frontend/src/components/features/admin/UsersManagementContent.tsx#L123)

4. ❌ **`<div className="rounded-lg bg-green-50 p-4">`** (success banner inline):
   - [`src/components/features/contact/ContactForm.tsx:149`](../frontend/src/components/features/contact/ContactForm.tsx#L149)

5. ❌ **`<div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800">`** (warning sin `<Alert>`):
   - [`src/components/features/holistic-services/ServiceBookingPage.tsx:197`](../frontend/src/components/features/holistic-services/ServiceBookingPage.tsx#L197)
   - [`src/components/features/birth-chart/UsageLimitBanner/UsageLimitBanner.tsx:47`](../frontend/src/components/features/birth-chart/UsageLimitBanner/UsageLimitBanner.tsx#L47)

6. ❌ **`<div className="bg-gradient-to-r from-purple-50 to-pink-50 ...">`** (banner upsell con gradiente, repetido):
   - [`src/components/features/dashboard/SacredEventsWidget.tsx:189`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L189)
   - [`src/components/features/readings/DailyLimitReachedModal.tsx:106`](../frontend/src/components/features/readings/DailyLimitReachedModal.tsx#L106)

**Severidad:** 🔴 Alta. El producto comunica el mismo nivel de severidad (warning/error/success) con seis paletas y estructuras distintas, lo cual erosiona la jerarquía visual.

---

### INC-005: CTAs de upgrade Premium con 6 etiquetas distintas

**Variantes detectadas:**

| Copy | Archivo | Contexto |
| --- | --- | --- |
| **"Comenzar ahora"** | [`UpgradeModal.tsx:170`](../frontend/src/components/features/readings/UpgradeModal.tsx#L170) | Modal upgrade tras tirada |
| **"Upgrade a Premium"** | [`UpgradeBanner.tsx:53`](../frontend/src/components/features/readings/UpgradeBanner.tsx#L53) | Banner persistente |
| **"Obtener Premium"** | [`PremiumUpgradePrompt.tsx:109`](../frontend/src/components/features/conversion/PremiumUpgradePrompt.tsx#L109), [`:274`](../frontend/src/components/features/conversion/PremiumUpgradePrompt.tsx#L274) | Promo conversion |
| **"Actualizar a Premium"** | [`PremiumPreview.tsx:80`](../frontend/src/components/features/conversion/PremiumPreview.tsx#L80), [`DailyCardLimitReached.tsx:236`](../frontend/src/components/features/daily-reading/DailyCardLimitReached.tsx#L236), [`ReadingLimitReached.tsx:136`](../frontend/src/components/features/readings/ReadingLimitReached.tsx#L136) | Pantalla de límite alcanzado |
| **"Mejorar a Premium"** | [`SacredEventsWidget.tsx:205`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L205) | Upsell dashboard |
| **"Comenzar Premium"** | [`PremiumPage.tsx:131`](../frontend/src/components/features/premium/PremiumPage.tsx#L131), [`PlanComparison.tsx:74`](../frontend/src/components/features/home/PlanComparison.tsx#L74) | Página comparativa |

**Severidad:** 🟡 Media. Funcionalmente equivalentes, pero rompen consistencia de marca y dificultan análisis de conversión (qué CTA performa).

---

### INC-006: Skeletons mezclando `<Skeleton>`, `bg-muted` y `bg-gray-200`

**Componente recomendado existente:** [`Skeleton`](../frontend/src/components/ui/skeleton.tsx).

**Variantes detectadas:**

1. ✅ **`<Skeleton className="h-X w-Y" />`** (correcto):
   - [`src/components/features/marketplace/BookingPage.tsx:83-85`](../frontend/src/components/features/marketplace/BookingPage.tsx#L83-L85)
   - [`src/components/features/marketplace/BookingCalendar.tsx:230-232`](../frontend/src/components/features/marketplace/BookingCalendar.tsx#L230-L232)

2. ❌ **`<div className="animate-pulse rounded-lg border bg-card p-4" />`** (skeleton custom para card):
   - [`src/components/features/readings/QuestionSelector.tsx:30`](../frontend/src/components/features/readings/QuestionSelector.tsx#L30)
   - [`src/components/features/readings/CategorySelector.tsx:68`](../frontend/src/components/features/readings/CategorySelector.tsx#L68)

3. ❌ **`<div className="h-4 w-48 animate-pulse rounded bg-gray-200" />`** (color hardcoded, ignora token):
   - [`src/app/tarot/tirada/page.tsx:32`](../frontend/src/app/tarot/tirada/page.tsx#L32)
   - [`src/app/tarot/preguntas/page.tsx:24`](../frontend/src/app/tarot/preguntas/page.tsx#L24)

4. ❌ **`<div className="bg-muted h-8 w-48 animate-pulse rounded" />`** (replica `<Skeleton>` con clases):
   - [`src/app/carta-astral/historial/loading.tsx:11`](../frontend/src/app/carta-astral/historial/loading.tsx#L11)

**Severidad:** 🟡 Media. Token visual divergente (`bg-card` vs `bg-gray-200` vs `bg-muted`) hace que las pantallas de carga se vean con tonos distintos según la feature.

---

### INC-007: Copy de auth ("Iniciar Sesión", "Crear Cuenta", "Crear Cuenta Gratis", "Registrarse")

**Variantes detectadas:**

| Copy | Contexto | Archivo |
| --- | --- | --- |
| "Crear Cuenta Gratis" | CTA de conversión (resultado free) | tests en [`carta-astral/resultado/page.test.tsx:591`](../frontend/src/app/carta-astral/resultado/page.test.tsx#L591) |
| "Crear mi cuenta gratis" | Página compartida | [`src/app/compartida/[token]/page.tsx:106`](../frontend/src/app/compartida/[token]/page.tsx#L106) |
| "Crear Cuenta" | Botón submit en RegisterForm | [`RegisterForm.test.tsx:89`](../frontend/src/components/features/auth/RegisterForm.test.tsx#L89) |
| "Registrarse" | Link en UserMenu desplegable | [`src/components/layout/UserMenu.tsx:33`](../frontend/src/components/layout/UserMenu.tsx#L33) |

**Severidad:** 🟡 Media. El usuario ve cuatro copys equivalentes durante un mismo flujo de onboarding.

---

### INC-008: Disclaimers placeholder reimplementados (legal/contacto/términos/privacidad)

Variantes 2 y 3 de [INC-004](#inc-004-bannersalerts-con-6-patrones-de-markup-distintos). El bloque "Nota: este es contenido placeholder…" aparece literal en 3 archivos con el mismo HTML pero sin usar `<Alert>`. Esto es un caso especialmente claro de duplicación: misma intención, mismo copy estructural, mismo color, escrito tres veces.

**Severidad:** 🟢 Baja-Media (es trivial de unificar y elimina drift futuro).

---

### INC-009: Toasts vs alerts inline para feedback transitorio

**Variantes detectadas:**

1. ✅ **`toast.error(...)`/`toast.info(...)`** (Sonner — patrón establecido):
   - [`src/stores/authStore.ts:85`](../frontend/src/stores/authStore.ts#L85)
   - [`src/components/features/admin/TarotistasManagementContent.tsx:83`](../frontend/src/components/features/admin/TarotistasManagementContent.tsx#L83)

2. ❌ **Banner inline `<div bg-green-50>` para confirmar éxito**:
   - [`src/components/features/contact/ContactForm.tsx:149`](../frontend/src/components/features/contact/ContactForm.tsx#L149) → "¡Mensaje enviado exitosamente!"

**Severidad:** 🟢 Baja. Solo el form de contacto rompe el patrón.

---

### INC-010: "Próximamente" como heading, párrafo y badge

**Variantes detectadas:**

| Variante | Archivo |
| --- | --- |
| `<h4 className="mt-4 mb-3 text-sm font-medium text-gray-700">Próximamente</h4>` | [`SacredEventsWidget.tsx:174`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L174) |
| `<p className="text-xs text-gray-500">Próximamente</p>` | [`PlatformMetricsContent.tsx:123`](../frontend/src/components/features/admin/PlatformMetricsContent.tsx#L123) |
| Texto inline en frase: "disponible próximamente" / "estarán disponibles próximamente" | [`SettingsTab.tsx:59,71`](../frontend/src/components/features/profile/SettingsTab.tsx#L59), [`TarotistaProfilePage.tsx:346`](../frontend/src/components/features/marketplace/TarotistaProfilePage.tsx#L346) |

Nota: en `SacredEventsWidget`, "Próximamente" se usa como **etiqueta de sección** (eventos próximos), no como "feature aún no disponible". Conviene renombrar a "Próximos" para evitar el doble sentido con los placeholders de "feature en desarrollo".

**Severidad:** 🟢 Baja.

---

## ARCHIVOS CON MAYOR CONCENTRACIÓN DE INCONSISTENCIAS

1. [`components/features/dashboard/SacredEventsWidget.tsx`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx) — loading + error + empty + upsell + heading "Próximamente" todos inline.
2. [`components/features/marketplace/BookingPage.tsx`](../frontend/src/components/features/marketplace/BookingPage.tsx) y [`BookingCalendar.tsx`](../frontend/src/components/features/marketplace/BookingCalendar.tsx) — loading inline + error rojo plano + empty inline.
3. [`components/features/admin/CacheManagementContent.tsx`](../frontend/src/components/features/admin/CacheManagementContent.tsx) — replica `ErrorDisplay` y `Spinner` con copy "Reintentar" / "Cargando...".
4. Páginas legales [`contacto`](../frontend/src/app/contacto/page.tsx), [`terminos`](../frontend/src/app/terminos/page.tsx), [`privacidad`](../frontend/src/app/privacidad/page.tsx) — disclaimer "Nota:" duplicado tres veces.
5. Componentes de admin (`RateLimitingTab`, `TarotistasTable`, `UsersTable`, `TarotistasManagementContent`) — empty states como `<p>` plano.

---

# PARTE B: TAREAS TÉCNICAS

## Índice de Tareas Técnicas

| ID | Tarea | Prioridad | Estimación | Dependencias | Estado |
| --- | --- | --- | --- | --- | --- |
| T-UI-01 | Migrar loading states a `<Spinner>` | 🔴 Crítica | 1 día | — | ✅ COMPLETADA |
| T-UI-02 | Migrar empty states a `<EmptyState>` | 🔴 Crítica | 1.5 días | — | ✅ COMPLETADA |
| T-UI-03 | Migrar error states a `<ErrorDisplay>` y unificar copy "Intentar de nuevo" | 🔴 Crítica | 1 día | — | ✅ COMPLETADA |
| T-UI-04 | Refactor banners/alerts a `<Alert>` con variantes | 🔴 Crítica | 2 días | — | ✅ COMPLETADA |
| T-UI-05 | Unificar copy de CTAs Premium (constante única) | 🟡 Alta | 0.5 día | T-UI-04 (idealmente) | ✅ COMPLETADA |
| T-UI-06 | Migrar skeletons inline a `<Skeleton>` | 🟡 Alta | 1 día | — | ✅ COMPLETADA |
| T-UI-07 | Unificar copy de CTAs de auth | 🟡 Alta | 0.5 día | — | ✅ COMPLETADA |
| T-UI-08 | Crear `<DisclaimerBanner>` y migrar páginas legales | 🟢 Media | 0.5 día | T-UI-04 | ✅ COMPLETADA |
| T-UI-09 | Migrar feedback de `ContactForm` a toast | 🟢 Media | 0.25 día | — | ✅ COMPLETADA |
| T-UI-10 | Renombrar/unificar uso de "Próximamente" | 🟢 Baja | 0.25 día | — | ✅ COMPLETADA |
| T-UI-11 | Barrido residual de patrones legacy fuera del scope inicial | 🟡 Alta | 1.5 días | T-UI-01..10 | ✅ COMPLETADA |

**Estimación total:** ~10 días.

---

## TAREAS DETALLADAS

---

### T-UI-01: Migrar loading states inline a `<Spinner>`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 1 día
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-001

#### 📋 Descripción

Reemplazar todos los `<p>Cargando...</p>`, `<div className="animate-pulse">Cargando...</div>` y `<div className="py-12 text-center">Cargando...</div>` por el componente reutilizable `<Spinner />` de [`components/ui/spinner.tsx`](../frontend/src/components/ui/spinner.tsx). Los archivos `loading.tsx` del App Router ya lo usan correctamente; el trabajo está en componentes "cliente" (paginas de marketplace, dashboard widget, admin, horóscopo chino, readings).

#### ✅ Tareas específicas

- [x] [`BookingPage.tsx`](../frontend/src/components/features/marketplace/BookingPage.tsx) — reemplazar `<p>Cargando...</p>` por `<Spinner size="md" text="Cargando..." />`.
- [x] [`BookingCalendar.tsx`](../frontend/src/components/features/marketplace/BookingCalendar.tsx) — `<Spinner size="sm" text="Cargando horarios disponibles..." />` (mantener los `<Skeleton>` previos solo si aplica jerarquía visual).
- [x] [`tarotistas/[id]/reservar/page.tsx`](../frontend/src/app/tarotistas/%5Bid%5D/reservar/page.tsx) — `<Spinner />`.
- [x] [`SacredEventsWidget.tsx`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx) — quitar `animate-pulse` envolvente, usar `<Spinner size="md" text="Cargando eventos..." />` (preserva el feel del widget si se desea, pero alineado al primitivo).
- [x] [`ReadingExperience.tsx`](../frontend/src/components/features/readings/ReadingExperience.tsx) — reemplazar `<div className="animate-pulse">Cargando...</div>`.
- [x] [`CacheManagementContent.tsx`](../frontend/src/components/features/admin/CacheManagementContent.tsx) — `<Spinner />` con padding del contenedor.
- [x] [`AnimalHoroscopePage.tsx`](../frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx).
- [x] Auditar otros usos de `Cargando` con grep `Cargando` (excluyendo tests y `loading.tsx`) y migrar.
- [x] Si en algún lugar el botón muestra texto "Cargando..." durante mutación (ej: `UpgradeModal:170`, `UpgradeBanner:53`), considerar reemplazar por `<Spinner size="sm" />` dentro del `<Button disabled>` — decisión: copys en botones de mutación NO se migran (son labels de estado, no loading states de página).

#### 🎯 Criterios de aceptación

- [x] No quedan literales `Cargando...` fuera de `<Spinner>` (excepción: dentro de `<Button>` durante un mutation pendiente, donde el copy puede mantenerse pero acompañado por el ícono).
- [x] `npm run lint:fix && npm run type-check && npm run test:run && npm run build` pasa sin errores.
- [x] Tests existentes que buscan `getByText('Cargando...')` siguen pasando (el `<Spinner>` ya emite ese texto vía la prop `text`).

#### 📁 Archivos involucrados

`marketplace/BookingPage.tsx`, `marketplace/BookingCalendar.tsx`, `tarotistas/[id]/reservar/page.tsx`, `dashboard/SacredEventsWidget.tsx`, `readings/ReadingExperience.tsx`, `admin/CacheManagementContent.tsx`, `chinese-horoscope/AnimalHoroscopePage.tsx`.

---

### T-UI-02: Migrar empty states inline a `<EmptyState>`

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 1.5 días
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-002

#### 📋 Descripción

Reemplazar los `<p className="text-muted-foreground py-8 text-center">No hay X</p>` y los grids con mensaje plano por `<EmptyState>` de [`components/ui/empty-state.tsx`](../frontend/src/components/ui/empty-state.tsx). Cuando aplique, agregar un icono de Lucide acorde al contexto (`Inbox`, `CalendarHeart`, `Users`, `Shield`, etc.) y, donde tenga sentido, una `action` (ej: "Volver a explorar").

#### ✅ Tareas específicas

- [x] [`admin/CacheManagementContent.tsx:172`](../frontend/src/components/features/admin/CacheManagementContent.tsx#L172) — `EmptyState` con icono `Database`/`Inbox`, title "Sin caché aún", message "No hay combinaciones cacheadas".
- [x] [`admin/RateLimitingTab.tsx:109,142`](../frontend/src/components/features/admin/RateLimitingTab.tsx#L109) — dos empty states (violaciones, IPs).
- [x] [`admin/TarotistasTable.tsx:53`](../frontend/src/components/features/admin/TarotistasTable.tsx#L53), [`UsersTable.tsx:65`](../frontend/src/components/features/admin/UsersTable.tsx#L65), [`TarotistasManagementContent.tsx:226`](../frontend/src/components/features/admin/TarotistasManagementContent.tsx#L226).
- [x] [`marketplace/BookingCalendar.tsx:242`](../frontend/src/components/features/marketplace/BookingCalendar.tsx#L242) — `EmptyState` compacto con icono `Clock` y `className="py-4"`.
- [x] [`birth-chart/PlanetPositionsTable.tsx:127`](../frontend/src/components/features/birth-chart/PlanetPositionsTable/PlanetPositionsTable.tsx#L127).
- [x] [`encyclopedia/ArticleGrid.tsx:58`](../frontend/src/components/features/encyclopedia/ArticleGrid.tsx#L58), [`encyclopedia/CardGrid.tsx:53`](../frontend/src/components/features/encyclopedia/CardGrid.tsx#L53), [`rituals/RitualGrid.tsx:53`](../frontend/src/components/features/rituals/RitualGrid.tsx#L53) — los tres aceptan prop `emptyMessage`; refactor para que internamente rendericen `<EmptyState>`.
- [x] [`dashboard/SacredEventsWidget.tsx:144-147`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L144-L147) — migrado a `<EmptyState>` con icono `CalendarHeart` y `className="py-4"`.

#### 🎯 Criterios de aceptación

- [x] Ningún archivo de feature renderiza `<p className="text-muted-foreground py-8 text-center">No hay …</p>`.
- [x] Las grids genéricas (`ArticleGrid`, `CardGrid`, `RitualGrid`) consumen `<EmptyState>` y conservan la prop `emptyMessage` que pasa a `message`.
- [x] Tests siguen pasando; agregar tests de empty state donde no existan.
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`admin/*` (5 archivos), `marketplace/BookingCalendar.tsx`, `encyclopedia/*` (2 archivos), `rituals/RitualGrid.tsx`, `dashboard/SacredEventsWidget.tsx`, `birth-chart/PlanetPositionsTable`.

---

### T-UI-03: Migrar error states a `<ErrorDisplay>` y unificar copy del retry

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 1 día
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-003

#### 📋 Descripción

Reemplazar los `<p className="text-red-600">Error al cargar...</p>` y los bloques inline `<p>...</p> + <Button>Reintentar</Button>` por `<ErrorDisplay message=... onRetry=... />` de [`components/ui/error-display.tsx`](../frontend/src/components/ui/error-display.tsx). El componente canónico ya fija el copy a **"Intentar de nuevo"** — alinear todo el código (y los tests que buscaban `/reintentar/i`) a esa convención.

#### ✅ Tareas específicas

- [x] [`marketplace/BookingPage.tsx:97`](../frontend/src/components/features/marketplace/BookingPage.tsx#L97) — usar `<ErrorDisplay message="Error al cargar el tarotista" onRetry={() => void refetch()} />` y mantener el botón "Volver a explorar" como CTA secundario semánticamente distinto.
- [x] [`marketplace/BookingCalendar.tsx:238`](../frontend/src/components/features/marketplace/BookingCalendar.tsx#L238) — `<ErrorDisplay message="Error al cargar horarios disponibles" onRetry={refetch} />`.
- [x] [`dashboard/SacredEventsWidget.tsx:137-139`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L137-L139).
- [x] [`admin/CacheManagementContent.tsx:124-129`](../frontend/src/components/features/admin/CacheManagementContent.tsx#L124-L129) — reemplazar el bloque (`<p text-destructive>` + botón "Reintentar") por `<ErrorDisplay onRetry={refetch} message="Error al cargar datos de caché" />`. También migrado `warmingError` inline al final del render.
- [x] [`readings/ReadingExperience.tsx:702`](../frontend/src/components/features/readings/ReadingExperience.tsx#L702) — sustituir botón "Reintentar" por flujo con `<ErrorDisplay>`.
- [x] **Decisión de copy:** copy canónico confirmado: "Intentar de nuevo". Tests actualizados:
  - [`src/app/historial/page.test.tsx:797`](../frontend/src/app/historial/page.test.tsx#L797) — cambiado `/reintentar/i` por `/intentar de nuevo/i`.
  - Resto de tests migrados.

#### 🎯 Criterios de aceptación

- [x] No quedan `<p className="text-red-600">Error...</p>` ni `<p className="text-destructive">Error...</p>` inline en los 6 componentes del scope de esta tarea. *(Componentes fuera de scope — `DailyCardExperience`, `ServiciosPage`, `ActivationPage`, `StatsSection`, `MyServicesWidget` — quedan pendientes para iteración futura.)*
- [x] El copy del retry es **uniforme** en todos los componentes migrados: "Intentar de nuevo".
- [x] `onRetry` semánticamente correcto: ejecuta `refetch()` real, no navegación.
- [x] Tests actualizados al copy canónico, todos pasando.
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`marketplace/BookingPage.tsx`, `marketplace/BookingCalendar.tsx`, `dashboard/SacredEventsWidget.tsx`, `admin/CacheManagementContent.tsx`, `readings/ReadingExperience.tsx`, `app/historial/page.test.tsx`.

---

### T-UI-04: Refactor banners/alerts inline a `<Alert>` con variantes

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-004

#### 📋 Descripción

Unificar los 6 patrones de markup de banners (`bg-yellow-50`, `bg-red-50`, `bg-green-50`, `bg-amber-50`, gradiente premium) bajo el componente `<Alert>` de [`components/ui/alert.tsx`](../frontend/src/components/ui/alert.tsx). Si el componente actual no expone variantes `info` / `warning` / `success`, agregarlas.

#### ✅ Tareas específicas

- [x] **Extender `<Alert>` con variantes** (en `components/ui/alert.tsx`): `default | info | success | warning | destructive`. Mapear cada una a tokens de color (no `bg-red-50` hardcoded — usar `bg-destructive/10`, `bg-amber-500/10`, `bg-emerald-500/10`, etc.).
- [x] Migrar **error banners admin**:
  - [`app/admin/page.tsx:44`](../frontend/src/app/admin/page.tsx#L44)
  - [`PlatformMetricsContent.tsx:90`](../frontend/src/components/features/admin/PlatformMetricsContent.tsx#L90)
  - [`AgendaManagementContent.tsx:263`](../frontend/src/components/features/admin/AgendaManagementContent.tsx#L263)
  - [`UsersManagementContent.tsx:123`](../frontend/src/components/features/admin/UsersManagementContent.tsx#L123)
  → `<Alert variant="destructive">`.
- [ ] Migrar **success banner** [`ContactForm.tsx:149`](../frontend/src/components/features/contact/ContactForm.tsx#L149) → ver T-UI-09 (mejor a toast).
- [x] Migrar **warning banners**:
  - [`holistic-services/ServiceBookingPage.tsx:197`](../frontend/src/components/features/holistic-services/ServiceBookingPage.tsx#L197)
  - [`birth-chart/UsageLimitBanner.tsx:47`](../frontend/src/components/features/birth-chart/UsageLimitBanner/UsageLimitBanner.tsx#L47)
  → `<Alert variant="warning">`.
- [x] **Banners upsell premium con gradiente** ([`SacredEventsWidget.tsx:189`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L189), [`DailyLimitReachedModal.tsx:106`](../frontend/src/components/features/readings/DailyLimitReachedModal.tsx#L106)): crear componente dedicado `<PremiumUpsellCard>` reutilizable (NO un `<Alert>`, son CTAs de conversión, no notificaciones). Info message en DailyLimitReachedModal migrado a `<Alert variant="info">`.
- [ ] Disclaimers `<div bg-yellow-50>` → ver T-UI-08.

#### 🎯 Criterios de aceptación

- [x] `<Alert>` expone al menos `info`, `success`, `warning`, `destructive` con tokens del design system.
- [x] No quedan banners con `bg-red-50`, `bg-green-50`, `bg-yellow-50`, `bg-amber-50` hardcoded en componentes de feature (excepción: `<PremiumUpsellCard>` con gradiente intencional).
- [x] Migración cubierta por tests (visual + a11u: cada variante tiene `role="alert"` apropiado).
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`components/ui/alert.tsx` (extender), `app/admin/page.tsx`, `admin/PlatformMetricsContent.tsx`, `admin/AgendaManagementContent.tsx`, `admin/UsersManagementContent.tsx`, `holistic-services/ServiceBookingPage.tsx`, `birth-chart/UsageLimitBanner`, `dashboard/SacredEventsWidget.tsx`, `readings/DailyLimitReachedModal.tsx`, nuevo `components/ui/premium-upsell-card.tsx`.

---

### T-UI-05: Unificar copy de CTAs Premium en una constante

**Prioridad:** 🟡 ALTA
**Estimación:** 0.5 día
**Dependencias:** decisión de producto sobre copy canónico
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-005

#### 📋 Descripción

Existen 6 copys distintos para la misma acción ("Comenzar ahora", "Upgrade a Premium", "Obtener Premium", "Actualizar a Premium", "Mejorar a Premium", "Comenzar Premium"). Crear una constante única en `lib/constants/cta-copy.ts` y reemplazar todos los literales por ella. **Antes de implementar**, validar con producto cuál es el copy canónico para cada contexto:

- **Compra inicial / página premium:** propuesta `Obtener Premium` o `Comenzar Premium`.
- **Tras alcanzar límite:** propuesta `Actualizar a Premium`.
- **Upsell suave (banner):** propuesta `Mejorar a Premium`.

#### ✅ Tareas específicas

- [x] Reunión/Slack con PO para fijar copy por contexto.
- [x] Crear `lib/constants/cta-copy.ts` exportando `CTA_PREMIUM = { PURCHASE: 'Comenzar Premium', LIMIT_REACHED: 'Mejorar a Premium', UPSELL_SOFT: 'Upgrade a Premium' }`.
- [x] Migrar archivos:
  - [`UpgradeModal.tsx`](../frontend/src/components/features/readings/UpgradeModal.tsx)
  - [`UpgradeBanner.tsx`](../frontend/src/components/features/readings/UpgradeBanner.tsx)
  - [`PremiumUpgradePrompt.tsx`](../frontend/src/components/features/conversion/PremiumUpgradePrompt.tsx)
  - [`PremiumPreview.tsx`](../frontend/src/components/features/conversion/PremiumPreview.tsx)
  - [`DailyCardLimitReached.tsx`](../frontend/src/components/features/daily-reading/DailyCardLimitReached.tsx)
  - [`ReadingLimitReached.tsx`](../frontend/src/components/features/readings/ReadingLimitReached.tsx)
  - [`SacredEventsWidget.tsx`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx)
  - [`PremiumPage.tsx`](../frontend/src/components/features/premium/PremiumPage.tsx)
  - [`PlanComparison.tsx`](../frontend/src/components/features/home/PlanComparison.tsx)
  - [`LimitReachedModal.tsx`](../frontend/src/components/features/conversion/LimitReachedModal.tsx)
  - [`PremiumBenefitsSection.tsx`](../frontend/src/components/features/home/PremiumBenefitsSection.tsx)
- [x] Actualizar tests que asuman copy específico (8 archivos de tests).

#### 🎯 Criterios de aceptación

- [x] Existe `lib/constants/cta-copy.ts` con copys documentados.
- [x] No queda ningún CTA Premium con literal hardcoded en componentes de feature.
- [x] El producto valida el copy final.
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

10 archivos de features Premium + nuevo `lib/constants/cta-copy.ts`.

---

### T-UI-06: Migrar skeletons inline a `<Skeleton>`

**Prioridad:** 🟡 ALTA
**Estimación:** 1 día
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-006

#### 📋 Descripción

Reemplazar `<div className="animate-pulse rounded bg-gray-200 ..." />` y derivados por `<Skeleton>` de [`components/ui/skeleton.tsx`](../frontend/src/components/ui/skeleton.tsx). El componente ya usa `bg-accent` (token aplicado internamente por el componente).

#### ✅ Tareas específicas

- [x] [`tarot/tirada/page.tsx`](../frontend/src/app/tarot/tirada/page.tsx) — `<Skeleton>` en todos los placeholders del fallback Suspense.
- [x] [`tarot/preguntas/page.tsx`](../frontend/src/app/tarot/preguntas/page.tsx) — `<Skeleton>` en los placeholders del fallback Suspense.
- [x] [`tarot/lectura/page.tsx`](../frontend/src/app/tarot/lectura/page.tsx) — `<Skeleton>` en placeholders de cards y headers.
- [x] [`ritual/tirada/page.tsx`](../frontend/src/app/ritual/tirada/page.tsx) — mismo patrón que tarot/tirada.
- [x] [`ritual/preguntas/page.tsx`](../frontend/src/app/ritual/preguntas/page.tsx) — mismo patrón que tarot/preguntas.
- [x] [`ritual/lectura/page.tsx`](../frontend/src/app/ritual/lectura/page.tsx) — mismo patrón que tarot/lectura.
- [x] [`carta-astral/historial/loading.tsx`](../frontend/src/app/carta-astral/historial/loading.tsx) — `<Skeleton>` reemplaza los `bg-muted animate-pulse` inline.
- [x] [`readings/QuestionSelector.tsx`](../frontend/src/components/features/readings/QuestionSelector.tsx) — `SkeletonQuestionCard` refactorizado con `<Skeleton>` internamente.
- [x] [`readings/CategorySelector.tsx`](../frontend/src/components/features/readings/CategorySelector.tsx) — `SkeletonCategoryCard` refactorizado con `<Skeleton>` internamente.
- [x] [`readings/SpreadSelector.tsx`](../frontend/src/components/features/readings/SpreadSelector.tsx) — `SkeletonSpreadCard` refactorizado con `<Skeleton>` internamente.
- [x] Auditar `animate-pulse` con grep en `src/` — casos restantes son usos legítimos (pendulum, sparkles icon, birth-chart wheel, ChartHistoryPage que ya usa `bg-muted` vía `<Skeleton>` indirectamente, etc.) y no son skeletons de contenido.

#### 🎯 Criterios de aceptación

- [x] No quedan `bg-gray-200` aplicados a skeletons de contenido en features del scope.
- [x] No quedan `bg-card animate-pulse` en skeleton components del scope.
- [x] `<Skeleton>` es el primitivo único para esqueletos de loading en los archivos migrados.
- [x] Tests pasan; `data-testid="skeleton-card"` y `data-testid="skeleton-spread-card"` preservados.
- [x] Ciclo de calidad pasa (format, lint, type-check, build, validate-architecture).

#### 📁 Archivos involucrados

`app/tarot/{tirada,preguntas,lectura}/page.tsx`, `app/ritual/{tirada,preguntas,lectura}/page.tsx`, `app/carta-astral/historial/loading.tsx`, `readings/QuestionSelector.tsx`, `readings/CategorySelector.tsx`, `readings/SpreadSelector.tsx`.

---

### T-UI-07: Unificar copy de CTAs de auth

**Prioridad:** 🟡 ALTA
**Estimación:** 0.5 día
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-007

#### 📋 Descripción

Hoy conviven 4 variantes para la misma acción ("Crear Cuenta", "Crear Cuenta Gratis", "Crear mi cuenta gratis", "Registrarse"). Definir convención y migrar.

**Propuesta inicial (validar con PO):**

- "Crear cuenta" → submit del form de registro.
- "Crear cuenta gratis" → CTAs de conversión (resultado free, página compartida, planes).
- "Iniciar sesión" → entrar a la app (consistente).
- Eliminar "Registrarse" del UserMenu y reemplazar por "Crear cuenta" (alineado al submit).

#### ✅ Tareas específicas

- [x] Reunión con PO para confirmar copys.
- [x] Crear constante `CTA_AUTH = { LOGIN: 'Iniciar sesión', REGISTER: 'Crear cuenta', REGISTER_CONVERSION: 'Crear cuenta gratis' }` en `lib/constants/cta-copy.ts`.
- [x] Migrar:
  - [`UserMenu.tsx:33`](../frontend/src/components/layout/UserMenu.tsx#L33) — "Registrarse" → "Crear cuenta".
  - [`compartida/[token]/page.tsx:106`](../frontend/src/app/compartida/[token]/page.tsx#L106) — "Crear mi cuenta gratis" → "Crear cuenta gratis".
  - `SharedReadingView.tsx` — "Crear mi cuenta gratis" → "Crear cuenta gratis".
  - Casillas de tests (`UserMenu.test.tsx`, `Header.test.tsx`, `SharedReadingView.test.tsx`) actualizadas.

#### 🎯 Criterios de aceptación

- [x] Constante `CTA_AUTH` definida y consumida en los CTAs migrados en este task.
- [x] CTAs migrados: `UserMenu` (LOGIN + REGISTER), `SharedReadingView` (REGISTER_CONVERSION), `compartida/[token]/page.tsx` (REGISTER_CONVERSION).
- [ ] CTAs pendientes de migración futura: `DailyCardExperience.tsx` ("Registrarse"), `PlanComparison.tsx` ("Registrarse gratis"), `PremiumPage.tsx` ("Registrarse gratis"), `PendulumLimitBanner.tsx` ("Registrarse").
- [x] Tests de los componentes migrados usan `CTA_AUTH` como fuente de verdad (no strings literales).
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`components/layout/UserMenu.tsx`, `app/compartida/[token]/page.tsx`, tests asociados, `lib/constants/cta-copy.ts`.

---

### T-UI-08: Crear `<DisclaimerBanner>` y migrar páginas legales

**Prioridad:** 🟢 MEDIA
**Estimación:** 0.5 día
**Dependencias:** T-UI-04 (variante `info` en `<Alert>`)
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-008

#### 📋 Descripción

Las páginas `contacto`, `terminos` y `privacidad` repiten textualmente el mismo bloque "Nota: ..." con `<div className="rounded-lg bg-yellow-50 p-4">`. Reemplazar por un componente `<DisclaimerBanner>` (o directamente `<Alert variant="info">` con icono `Info`).

#### ✅ Tareas específicas

- [x] Decidir: ¿componente nuevo `<DisclaimerBanner>` o uso directo de `<Alert variant="info">`?
- [x] Migrar:
  - `app/contacto/page.tsx`
  - `app/terminos/page.tsx`
  - `app/privacidad/page.tsx`
- [x] Eliminar `bg-yellow-50` hardcoded.

#### 🎯 Criterios de aceptación

- [x] Las tres páginas legales usan el mismo componente.
- [x] Visualmente idénticas en light mode (único modo soportado).
- [x] Aprovechar la migración para eliminar las clases `dark:*` legacy presentes en estas páginas (`dark:bg-yellow-950/20`, `dark:bg-purple-950/20`, `dark:prose-invert`).
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`app/contacto/page.tsx`, `app/terminos/page.tsx`, `app/privacidad/page.tsx`, posible nuevo `components/ui/disclaimer-banner.tsx`.

---

### T-UI-09: Migrar feedback de `ContactForm` a toast

**Prioridad:** 🟢 MEDIA
**Estimación:** 0.25 día
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-009

#### 📋 Descripción

`ContactForm` muestra el éxito de envío como banner inline `<div bg-green-50>`. Esto rompe el patrón establecido en `authStore`/`admin` de usar Sonner toast para feedback transitorio.

#### ✅ Tareas específicas

- [x] [`contact/ContactForm.tsx:149`](../frontend/src/components/features/contact/ContactForm.tsx#L149) — eliminar el banner, usar `toast.success('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.')`.
- [x] Resetear el form tras éxito (ya lo hacía; confirmado).
- [x] Actualizar tests del form para verificar el toast (no el banner). Errores usan `<Alert variant="destructive">` (persistente).

#### 🎯 Criterios de aceptación

- [x] Éxito del form se comunica vía toast.
- [x] Errores siguen mostrándose como `<Alert variant="destructive">` (mensaje persistente).
- [x] Tests actualizados.
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`components/features/contact/ContactForm.tsx` y tests.

---

### T-UI-10: Renombrar/unificar uso de "Próximamente"

**Prioridad:** 🟢 BAJA
**Estimación:** 0.25 día
**Dependencias:** ninguna
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-010

#### 📋 Descripción

"Próximamente" se usa con dos significados distintos:
1. **"Eventos próximos"** (lista, cronología) — `SacredEventsWidget`.
2. **"Feature aún no disponible"** — `SettingsTab`, `PlatformMetricsContent`, `TarotistaProfilePage`.

Esto es ambiguo: el usuario puede leer "Próximamente" en el dashboard y pensar que esa sección no funciona aún.

#### ✅ Tareas específicas

- [x] Renombrar [`SacredEventsWidget.tsx`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx) de `Próximamente` → `Próximos eventos` (o `Próximos`).
- [x] Crear pequeño `<ComingSoonBadge>` o usar `<Badge variant="secondary">Próximamente</Badge>` para los placeholders de features no implementadas:
  - [`profile/SettingsTab.tsx:59,71`](../frontend/src/components/features/profile/SettingsTab.tsx#L59)
  - [`marketplace/TarotistaProfilePage.tsx:346`](../frontend/src/components/features/marketplace/TarotistaProfilePage.tsx#L346)
  - [`admin/PlatformMetricsContent.tsx:123`](../frontend/src/components/features/admin/PlatformMetricsContent.tsx#L123)

#### 🎯 Criterios de aceptación

- [x] "Próximamente" solo se usa para indicar feature en desarrollo (visualmente como Badge).
- [x] Las secciones de eventos usan otro copy ("Próximos eventos" / "Próximos").
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`dashboard/SacredEventsWidget.tsx`, `profile/SettingsTab.tsx`, `marketplace/TarotistaProfilePage.tsx`, `admin/PlatformMetricsContent.tsx`.

---

### T-UI-11: Barrido residual de patrones legacy fuera del scope inicial

**Prioridad:** 🟡 ALTA
**Estimación:** 1.5 días
**Dependencias:** T-UI-01 a T-UI-10 (todas COMPLETADAS — los primitivos y constantes ya existen)
**Estado:** ✅ COMPLETADA
**Cubre INC:** INC-002, INC-003, INC-004, INC-006 (archivos no listados en la auditoría inicial)

#### 📋 Descripción

Durante la verificación de T-UI-01..10 se encontraron ~25 ubicaciones adicionales que **no estaban en el scope original** de la auditoría pero replican los mismos patrones legacy que ya fueron unificados. Esta tarea cierra el círculo: aplica los primitivos del design system (`<EmptyState>`, `<ErrorDisplay>`, `<Alert>`, `<Skeleton>`) a todos los archivos restantes para alcanzar **consistencia real en toda la app** (criterio aspiracional de T-UI-03 que aún no se cumple por estar fuera de scope: "El copy del retry es uniforme en toda la app").

#### ✅ Tareas específicas

**1. Empty states inline residuales → `<EmptyState>` (INC-002):**

- [x] [`app/admin/page.tsx:108`](../frontend/src/app/admin/page.tsx#L108) → "No hay datos de distribución disponibles"
- [x] [`app/admin/page.tsx:122`](../frontend/src/app/admin/page.tsx#L122) → "No hay lecturas recientes disponibles"
- [x] [`components/features/holistic-services/ServiciosPage.tsx:81`](../frontend/src/components/features/holistic-services/ServiciosPage.tsx#L81) → "No hay servicios disponibles en este momento."
- [x] [`components/features/admin/PlanDistributionChart.tsx:29`](../frontend/src/components/features/admin/PlanDistributionChart.tsx#L29) → "No hay datos disponibles"
- [x] [`components/features/admin/DailyReadingsChart.tsx:33`](../frontend/src/components/features/admin/DailyReadingsChart.tsx#L33) → "No hay datos disponibles"
- [x] [`components/features/admin/RecentReadingsTable.tsx:78`](../frontend/src/components/features/admin/RecentReadingsTable.tsx#L78) → "No hay lecturas recientes"
- [x] [`components/features/admin/ServicesTable.tsx:50`](../frontend/src/components/features/admin/ServicesTable.tsx#L50) → "No hay servicios registrados"
- [x] [`components/features/admin/TransactionsTable.tsx:116`](../frontend/src/components/features/admin/TransactionsTable.tsx#L116), [`:173`](../frontend/src/components/features/admin/TransactionsTable.tsx#L173) → 2 mensajes ("No hay transacciones registradas" / "No hay transacciones que coincidan con los filtros")
- [x] [`components/features/admin/PlanComparisonTable.tsx:90`](../frontend/src/components/features/admin/PlanComparisonTable.tsx#L90) → "No hay planes disponibles para comparar"
- [x] [`components/features/birth-chart/ElementDistribution/ElementDistribution.tsx:255`](../frontend/src/components/features/birth-chart/ElementDistribution/ElementDistribution.tsx#L255) → "No hay datos de distribución disponibles."

**2. Botones "Reintentar" → migrar a `<ErrorDisplay onRetry={...}>` o renombrar a "Intentar de nuevo" (INC-003, criterio uniformidad):**

- [x] [`components/features/daily-reading/DailyCardExperience.tsx:284`](../frontend/src/components/features/daily-reading/DailyCardExperience.tsx#L284)
- [x] [`components/features/dashboard/MyServicesWidget.tsx:112`](../frontend/src/components/features/dashboard/MyServicesWidget.tsx#L112)
- [x] [`components/features/dashboard/StatsSection.tsx:84`](../frontend/src/components/features/dashboard/StatsSection.tsx#L84)
- [x] [`components/features/birth-chart/ChartHistoryPage/ChartHistoryPage.tsx:263`](../frontend/src/components/features/birth-chart/ChartHistoryPage/ChartHistoryPage.tsx#L263) (label de action)
- [x] [`components/features/birth-chart/ErrorState/ErrorState.tsx:54,89`](../frontend/src/components/features/birth-chart/ErrorState/ErrorState.tsx#L54) — componente custom; alinear copy a "Intentar de nuevo" o componer sobre `<ErrorDisplay>`.
- [x] [`components/features/premium/ActivationPage.tsx:139`](../frontend/src/components/features/premium/ActivationPage.tsx#L139)
- [x] [`components/features/holistic-services/ServiciosPage.tsx:70`](../frontend/src/components/features/holistic-services/ServiciosPage.tsx#L70)
- [x] Actualizar tests asociados (`ErrorState.test.tsx`, `ActivationPage.test.tsx`) para buscar el copy unificado.

**3. Banners inline `bg-red-50` / `bg-amber-50` / `bg-green-50` → `<Alert variant="...">` (INC-004):**

- [x] [`components/features/admin/AgendaManagementContent.tsx:322`](../frontend/src/components/features/admin/AgendaManagementContent.tsx#L322) — error de fechas bloqueadas (`bg-red-50`).
- [x] [`components/features/admin/HolisticServicesManagement.tsx:156,177`](../frontend/src/components/features/admin/HolisticServicesManagement.tsx#L156) — 2 banners de error.
- [x] [`components/features/holistic-services/ServicePaymentPage.tsx:187`](../frontend/src/components/features/holistic-services/ServicePaymentPage.tsx#L187) (`bg-amber-50` warning), [`:201`](../frontend/src/components/features/holistic-services/ServicePaymentPage.tsx#L201) (`bg-red-50` error).
- [x] [`components/features/holistic-services/ServiceBookingPage.tsx:224`](../frontend/src/components/features/holistic-services/ServiceBookingPage.tsx#L224) — banner error inline (`bg-red-50`).
- [x] [`components/features/holistic-services/MyServicesList.tsx:170`](../frontend/src/components/features/holistic-services/MyServicesList.tsx#L170) — pill amber para "pendiente"; mantenido sin cambios (CTA de acción, no banner).
- [x] [`components/features/onboarding/WelcomeModal.tsx:69`](../frontend/src/components/features/onboarding/WelcomeModal.tsx#L69) — bloque informativo `bg-amber-50` → `<Alert variant="info">` o `<Alert variant="warning">`.

**4. Skeletons inline residuales → `<Skeleton>` (INC-006):**

- [x] [`components/features/birth-chart/ChartHistoryPage/ChartHistoryPage.tsx:276-282`](../frontend/src/components/features/birth-chart/ChartHistoryPage/ChartHistoryPage.tsx#L276-L282) — 4 divs con `bg-muted animate-pulse rounded`.
- [x] [`components/features/encyclopedia/ArticleSkeleton.tsx:35`](../frontend/src/components/features/encyclopedia/ArticleSkeleton.tsx#L35) — componer sobre `<Skeleton>`.
- [x] [`components/features/encyclopedia/ArticleListPageContent.tsx:74`](../frontend/src/components/features/encyclopedia/ArticleListPageContent.tsx#L74).
- [x] [`components/features/encyclopedia/ArticleDetailPageContent.tsx:28`](../frontend/src/components/features/encyclopedia/ArticleDetailPageContent.tsx#L28).

**5. Limpieza colateral oportunista:**

- [x] Eliminar las clases `dark:*` huérfanas que aparezcan en los archivos tocados (alineado con la nota de "No dark mode" del documento).
- [ ] Verificar que no se introduzcan nuevos casos: agregar regla ESLint o lint custom que falle ante `className="...bg-(red|amber|yellow|green)-50..."` fuera de `components/ui/`.

#### 🎯 Criterios de aceptación

- [x] El criterio aspiracional de T-UI-03 se cumple: **NO existe ningún botón "Reintentar"** en componentes de feature; el copy uniforme es "Intentar de nuevo".
- [x] `grep -r "No hay" src/` solo retorna usos dentro de `<EmptyState>` o tests.
- [x] `grep -r "bg-red-50\|bg-amber-50\|bg-yellow-50\|bg-green-50" src/` no retorna banners (sí puede retornar usos legítimos como charts/indicators).
- [x] `grep -r "animate-pulse rounded.*bg-muted" src/` no retorna skeletons inline.
- [x] Tests existentes pasan; tests actualizados para reflejar nuevos copys.
- [x] Ciclo de calidad completo pasa (`npm run format && npm run lint:fix && npm run type-check && npm run test:run && npm run build && node scripts/validate-architecture.js`).

#### 📁 Archivos involucrados

≈25 archivos en `admin/`, `holistic-services/`, `dashboard/`, `daily-reading/`, `birth-chart/`, `encyclopedia/`, `premium/`, `onboarding/`.

#### 📝 Sugerencia de implementación

Por tamaño, conviene dividir en **2-3 PRs**:

1. **T-UI-11a** — Empty states + skeletons residuales (lowest risk, mostly admin).
2. **T-UI-11b** — Botones "Reintentar" → "Intentar de nuevo" (requiere alinear tests y componente `ErrorState` de birth-chart).
3. **T-UI-11c** — Banners holistic-services + onboarding (más diseño, conviene reviewer con ojo visual).

---

### T-UI-12: Iconografía de marca — reemplazar emojis y glifos ad hoc por assets de la línea de diseño

**Prioridad:** 🟡 ALTA
**Estimación:** 3 días de integración + generación de assets (Ariel, con los prompts de abajo)
**Dependencias:** ninguna
**Estado:** 🟡 EN CURSO — PR 1/N (base + UI genérica) hecho el 12 de septiembre de 2026; la Fase 2 espera los assets de la Fase 0
**Reportado por:** Ariel (12 de septiembre de 2026): "hay iconos que no tienen nada que ver con el diseño de la página"

#### 📌 Estado por PR

| PR | Alcance | Estado |
| --- | --- | --- |
| **1 — base + UI genérica + `zodiac/`** (`feature/T-UI-12-iconografia-marca-base`, PR #656) | Script de post-proceso (`scripts/process-brand-icons.mjs` + `npm run icons:process`, `sharp` como devDependency), registro tipado `lib/constants/brand-icons.ts` (79 slugs, 9 familias), `<BrandIcon>`, `<CheckItem>`, migración de toda la UI genérica a `lucide-react`, guardarraíl `no-emoji-user-facing.test.ts` con lista de pendientes por familia, sección "Iconografía" en `DESIGN_HAND-OFF.md`. **Familias `zodiac/`, `chinese/`, `areas/`, `elements/` y `suits/` entregadas en el mismo PR** (Ariel generó las 42 el 12-sep): `ZodiacSymbol` y `ChineseAnimalSymbol` envuelven `<BrandIcon>`; áreas, elementos Wu Xing y palos van con `<BrandIcon>` directo. Verificado en `/`, `/horoscopo`, `/horoscopo/[signo]`, `/horoscopo-chino`, `/horoscopo-chino/[animal]` y el modal de elemento | ✅ |
| **2..N — una familia por PR** | Al recibir los WebP de una familia en `public/images/icons/<familia>/`: migrar sus consumidores a `<BrandIcon>` y sacar los archivos de `PENDIENTES_FASE_2` en el guardarraíl. El test del registro exige que la familia esté completa y sin huérfanos | ⬜ esperan Fase 0 (moon, rituals, numerology, hubs) |

**Decisiones tomadas en el PR 1** (Ariel las puede revertir):

- La notación astrológica de `birth-chart.enums.ts` **se queda como texto** (opción por defecto de la
  tabla; allowlist permanente del guardarraíl).
- El separador editorial `✦` (U+2726) de `MarkdownArticle` / `GuiasContent` **se queda**: no tiene
  presentación emoji en Unicode, renderiza igual en todos los SO y ya va en dorado de marca. Si igual se
  quiere un asset, entra con la familia `hubs/`.
- Los textos de compartir (`navigator.share` en `DailyReadingCard` / `DailyCardExperience`) conservan
  sus emojis: no los renderiza el sitio.
- **Un solo tamaño de asset (512)**: `next/image` ya genera las variantes de 16–384 px
  (`imageSizes` en `next.config.ts`), así que el 128 "para badges" sobra y sólo agregaría archivos
  huérfanos al chequeo del registro. `--size` existe por si hace falta.
- Slugs de rituales: `cleansing → energy`, `healing → wellbeing` (glosario sin términos de salud);
  el mapeo lo hace el consumidor cuando llegue la familia.
- **Peso de los assets (cambio de criterio, 12-sep):** "< 15 KB el WebP de 512" no es alcanzable con
  el halo suave de la línea visual —es un degradé ancho de alfa, y eso pesa 27–48 KB por más que se
  comprima (se probó color de halo constante, alfa cuantizado, reducir antes de recortar, `alphaQuality`
  60–90). Lo que cuenta para LCP es lo que sirve `next/image`: **1,5 KB a 48 px, 3,7 KB a 96 px,
  5,3 KB a 128 px**. El script avisa desde 48 KB en el máster. Los 12 de `zodiac/` pesan 27–48 KB;
  los 12 de `chinese/` 32–69 KB (más trazo; servidos a 128 px, 7–9 KB); `areas/`, `elements/` y
  `suits/` 12–69 KB.
- El halo lleva **color fijo** (el dorado mediano del trazo de ese asset) y alfa cuantizado de a 8:
  des-premultiplicar un color casi blanco con alfa bajo amplifica el ruido del JPEG y duplicaba el
  peso; el trazo sólido (≥ 75 % de distancia al blanco) conserva su color y queda opaco.
- **Contraste (feedback de Ariel, 12-sep):** el trazo del modelo es de ~8 px sobre 2048 y a 48–72 px
  quedaba en medio píxel: el antialiasing lo lavaba. Oscurecer solo no alcanzaba; lo que resuelve es
  **engrosar el trazo** antes de reducir (`--stroke`, dilatación de la máscara del trazo sólido,
  0,25 % del lado ≈ 5 px) más un dorado un 15 % más profundo (`--tone 0.85`, acerca el dorado del
  modelo al `#B7791F` de la marca sin cambiar el matiz). Se comparó a 48/72 px: `r3`, `r5`, `r8`, con y
  sin tono; `r5 + 0.85` es la que mejor lee sin cerrar el detalle interior.
- **Medallón (segundo feedback de Ariel, 13-sep: "sigue siendo muy mala la lectura en todas las
  pantallas"):** engrosar y oscurecer no alcanzó. Un line-art ornamental de trazo fino **no lee sobre
  blanco a 48–112 px**, le falta masa. Lo que sí funciona es la propia regla del `DESIGN_HAND-OFF`:
  dorado sobre **violeta cósmico**. `BrandIcon` suma `frame="medallion"`: disco con degradé radial
  (`#8B5CF6 → #5B3AA6`, dorado a `brightness-[1.35]`; los dos primeros intentos, `#4C2A85 → #22114F`
  y `#6B46C1 → #3F2A7A`, le parecieron oscuros a Ariel sobre todo en los medallones de 44 px; se
  comparó a 44 y 96 px y por debajo de este el dorado se funde en los chicos). **Tercer ajuste:** en los
  medallones `sm`/`md` (28–44 px: modal de elemento, digest, widgets, tarjetas de área) Ariel los
  prefirió sin fondo o "muy clarito": variante `.brand-icon-medallion-light` (`#F5F1FF → #E6DDFB`,
  borde dorado al 45 %, dorado sin avivar). El violeta queda para `lg`+ (grillas y encabezados). La
  regla la decide `BrandIcon` por tamaño, no cada consumidor, borde dorado fino (`.brand-icon-medallion` en `globals.css`) y el icono al
  78 % del disco con `brightness-[1.35] saturate-[1.1]` (el dorado entonado para fondo claro quedaba
  apagado sobre violeta). Diámetros `BRAND_ICON_MEDALLION_SIZES`: 28/44/64/96/144. Se comparó a 1x
  contra el icono suelto a 72 y 104 px y contra el medallón sin avivar. Aplicado en grillas de signos
  y animales (`xl`), encabezados de ficha (`2xl`), encabezados de detalle y widgets (`xl`/`md`),
  digest de la home y del hub (`md`), modal de elemento (`md`), tarjetas de área (`md`) y resultado
  de la calculadora (`lg`). Sin medallón: filas de puntaje `text-xs`, chips de compatibilidad,
  selector de palos y ficha de carta (iconos chicos en línea con texto).

#### 📋 Descripción

El sitio tiene una línea visual definida (`DESIGN_HAND-OFF.md` + las 60 ilustraciones de
`public/images/enciclopedia|premium|dashboard`): **line-art dorado (`#D69E2E`) con brillo suave,
lavanda místico (`#805AD5`) como color de marca, fondo cósmico violeta cuando es ilustración, y
tarjetas crema/blancas (`#F9F7F2` / `#FFFFFF`) cuando es UI**. Pero la iconografía de dominio la
resuelven **emojis del sistema** (multicolor, distintos en cada SO/navegador) y dos parches:

- **208 emojis en 41 archivos** de `src/` (fuera de tests): signos ♈–♓, animales 🐀–🐖,
  elementos 🔥💧💨🌿, áreas ❤️💼✨💰, fases lunares 🌑–🌘, categorías de rituales, arquetipos
  numerológicos 👑🤝🎨…, hubs/guías 🔮🪐🏠🔢⚖️🕯️🐉, notificaciones 🔔🎁⚙️, calendario sagrado.
- `ZodiacSymbol.tsx`: fuerza el glifo Unicode a monocromo con `U+FE0E` (depende de la fuente
  del sistema; en algunos SO sigue saliendo emoji).
- `ChineseAnimalSymbol.tsx`: 12 SVG de trazo **dibujados a mano en código** (24×24), sin relación
  con las ilustraciones del sitio (ver `horoscopo-chino-animales.webp`, donde los animales son
  line-art dorado con brillo).

La tarea reemplaza todo eso por un **set de iconos de marca** generado con Gemini (Nano Banana)
siguiendo la línea establecida, servido como imágenes locales, y deja un guardarraíl para que no
vuelvan a entrar emojis en texto de cara al usuario.

#### 🎯 Reglas de decisión (qué va con qué)

| Tipo de icono | Solución | Ejemplos |
| --- | --- | --- |
| **Iconografía de dominio** (signos, animales, elementos, palos, fases, áreas, arquetipos, hubs) | **Asset de marca** generado (`public/images/icons/…webp`) vía `<BrandIcon>` | ♈, 🐉, 🔥, 🌕, ❤️, 👑, 🔮 |
| **Iconografía de UI genérica** (acciones, estados, avisos) | **`lucide-react`**, que ya es la librería del sitio | ✓, ⚠️, 🔔, ⚙️, 🔎, 🎁, 💡, 🎉 |
| **Notación astrológica en la carta natal** (`birth-chart.enums.ts`: ☉ ☽ ☿ ♀ ♂ … ☌ ☍ ⚹) | **Se mantiene como texto** con `ZodiacSymbol`/U+FE0E: es notación estándar de la disciplina, no decoración. ⚠️ Decisión a confirmar con Ariel antes de arrancar | ☉ ☽ ♃ |
| **Emojis en encabezados de texto** (`service-intros.data.ts`: "🗂️ Los Arcanos Menores") | **Se quitan** del string; el icono va como `<BrandIcon>` al lado si hace falta | 🗂️ ♈ 🌗 🐉 🌳 |
| Panel de admin | Fuera de alcance (solo lo ven administradores) | `ChineseHoroscopeAdminPanel.tsx`, `AIUsageAlerts.tsx` |

#### 📦 Inventario de assets a generar

Todos en **1024×1024 con fondo blanco puro**, post-procesados a **WebP con alfa, 512×512** (y
128×128 para badges) en `public/images/icons/<familia>/<slug>.webp`. Nombres = slugs que ya usa
el código (`aries`, `rat`, `fire`, `new_moon`…).

| Familia | Cantidad | Slugs | Reemplaza |
| --- | --- | --- | --- |
| `zodiac/` | 12 | aries … pisces | `ZodiacSymbol` + `♈–♓` en `zodiac.ts`, `ArticleCard`, `GuidesSection`, `AstrologySection`, `service-intros` |
| `chinese/` | 12 | rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig | `ChineseAnimalSymbol` + `emoji` en `chinese-zodiac.ts`, `app/horoscopo-chino/page.tsx` |
| `elements/` | 5 (+5 chinos) | fire, water, air, earth, spirit · wood, fire-cn, earth-cn, metal, water-cn | `SUIT_INFO`/`ELEMENT_INFO` en `encyclopedia.types.ts`, `ElementSelectorModal`, `chinese-zodiac.ts` (🔴🔵🟢🟤⚪) |
| `suits/` | 4 | wands, cups, swords, pentacles | `SUIT_INFO.symbol` (🔥💧💨🌿) |
| `areas/` | 4 | love, work, wellbeing, money | `HoroscopeWidget`, `ChineseHoroscopeWidget`, `ChineseHoroscopeDetail` (❤️ 💼 ✨ 💰) |
| `moon/` | 8 | new_moon … waning_crescent | `LUNAR_PHASE_INFO` en `ritual.types.ts` |
| `rituals/` | 8 | tarot, lunar, energy, meditation, protection, abundance, love, wellbeing | `RITUAL_CATEGORY_INFO` en `ritual.types.ts` |
| `numerology/` | 12 | 1–9, 11, 22, 33 | `NUMEROLOGY_NUMBERS_INFO.emoji` en `numerology.ts`, `NumberCard`, `NumberGallery`, `NumerologyWidget` |
| `hubs/` | 9 | tarot, horoscope, chinese, numerology, pendulum, birth-chart, rituals, planets, houses | `ArticleCard`, `GuidesSection`, `AstrologySection`, `EncyclopediaHome`, `sacred-calendar.types.ts` |
| **Total** | **~79** | | |

#### ✅ Tareas específicas

**Fase 0 — Assets (Ariel + Nano Banana):**

- [ ] Generar los ~79 assets con los prompts de abajo. Generar **de a familia completa en una
      misma sesión/chat** (los 12 signos seguidos, los 12 animales seguidos…) para que el modelo
      mantenga el trazo; si un asset se desvía, regenerar pasando uno bueno como referencia.
- [x] Post-proceso (script `frontend/scripts/process-brand-icons.mjs` con `sharp`): quitar el
      fondo blanco → alfa, recortar al contenido con margen 8 %, exportar 512 en WebP
      (`npm run icons:process`, entrada `frontend/brand-icons-raw/<familia>/<slug>.png`, gitignored).
- [ ] Revisar los 79 en la hoja de contacto (`brand-icons-raw/icons-contact-sheet.html`, la
      genera el script: 32/64/128 px sobre tarjeta y sobre cósmico) y descartar los que no lean
      bien a 32 px.

**Fase 1 — Componente y registro:**

- [x] `lib/constants/brand-icons.ts`: registro tipado `BRAND_ICONS[familia][slug] = { src, alt }`
      con `alt` en español. El test verifica que cada familia **presente** en `public/` esté
      completa y sin huérfanos (las que aún no llegaron no se exigen: así el test es verde hoy y
      se vuelve estricto familia por familia).
- [x] `components/ui/brand-icon.tsx`: `<BrandIcon family="zodiac" name="aries" size="sm|md|lg|xl" />`
      sobre `next/image`, `role="img"`, `alt` desde el registro (o `label`), `decorative` para
      ocultar, `priority` sólo above-the-fold. Equivalencias: `text-xl` → `sm` (20), `text-2xl/3xl`
      → `md` (32), `text-4xl/5xl` → `lg` (48), hero → `xl` (72).

**Fase 2 — Migración por dominio** (un PR por familia o por dos familias; grep sobre TODO
`src/`, incluido `src/app/`, no solo `components/features/`):

- [x] Signos occidentales: `ZodiacSymbol` pasa a envolver `<BrandIcon family="zodiac">` (misma
      firma —`symbol` + `label` + `className`— más `sign` y `size` opcionales; el tamaño se deriva de
      la clase `text-*` que ya pasaban los consumidores), y se borran `TEXT_PRESENTATION_SELECTOR` y
      la utilidad CSS `.zodiac-symbol`. `ZodiacSignCard` pasa a `sign` + `size` explícito (`xl` en
      grilla, `lg` en carrusel) y `mx-auto` porque el `Card` es flex-column y el `<img>` no se
      centraba como el `<span>`. `zodiac.ts` conserva `symbol` como dato (allowlist del guardarraíl:
      nadie lo renderiza como glifo).
- [x] Animales chinos: `ChineseAnimalSymbol` pasa a envolver `<BrandIcon family="chinese">` (misma
      firma más `size`); se borran los 12 SVG de `ANIMAL_GLYPHS`. `ChineseAnimalCard` con `size`
      explícito + `mx-auto` como la occidental. Nuevo tamaño `2xl` (112 px) para el encabezado de
      ficha de signo y de animal (`ZodiacSignProfile`, `AnimalProfile`): a 72 px el animal se perdía.
      El helper `brandIconSizeFromClassName` (clase `text-*` → tamaño) vive en `brand-icon.tsx` y lo
      comparten los dos wrappers. `DailyHoroscopeList` (digest de la home y del hub `/horoscopo`)
      renderizaba `info.symbol` como texto: pasa a `ZodiacSymbol` decorativo (`decorative` nuevo,
      el nombre del signo ya está al lado). `app/horoscopo-chino/page.tsx` ya no tenía emoji. Queda como deuda
      menor: `CHINESE_ZODIAC_INFO[x].emoji` y `getAnimalEmoji` del hook no tienen consumidor
      (`YearSelectorModal` tampoco); se limpian con la familia `elements/`, que toca el mismo archivo.
- [x] Elementos y palos: `SuitInfo.symbol` se elimina (🔥💧💨🌿) y `SuitSelector` / `CardMetadata`
      renderizan `<BrandIcon family="suits">`; `getElementIcon` (🔴🔵🟢🟤⚪, fallback ⭕) pasa a
      `getElementBrandIcon(): BrandIconName<'elements'> | undefined` (`water-cn`, `fire-cn`,
      `earth-cn`, `metal`, `wood`) y lo consumen `AnimalCalculator`, `ChineseHoroscopeWidget` y
      `ElementSelectorModal`. Se limpió la deuda anotada: `ChineseZodiacInfo.emoji`, `getAnimalEmoji`
      del hook y el emoji en la meta description del animal. Los 5 elementos occidentales
      (`fire`, `water`, `air`, `earth`, `spirit`) quedan en el registro para la enciclopedia.
- [x] Áreas del horóscopo: nueva constante `lib/constants/horoscope-areas.ts`
      (`HOROSCOPE_AREA_ICON`: `love`/`career`→`work`/`wellness`→`wellbeing`/`finance`,`money`→`money`)
      consumida por `HoroscopeWidget`, `ChineseHoroscopeWidget`, `ChineseHoroscopeDetail` y también
      `HoroscopeAreaCard` (el detalle del signo occidental usaba `Heart`/`Sparkles`/`Wallet` de
      lucide: es iconografía de dominio, va con la familia). Tamaños: `sm` en las filas de puntaje
      (`text-xs`), `md` en tarjetas y en el modal de elemento (a 20 px no leen).
- [ ] Fases lunares y categorías de rituales (`ritual.types.ts` + consumidores).
- [ ] Numerología (`numerology.ts`, `NumberCard`, `NumberGallery`, `NumerologyWidget`,
      `NumerologyProfile`, `NumerologyPage`).
- [ ] Hubs y guías (`ArticleCard`, `GuidesSection`, `AstrologySection`, `EncyclopediaHome`,
      `GuiasContent`, `MarkdownArticle` ✦, `service-intros.data.ts`, `sacred-calendar.types.ts`).
- [x] UI genérica → `lucide-react`: `notification.types.ts` (`icon` pasa de string a
      `LucideIcon`: ✨🌙🕯️🔎🔮⚙️🎁🔔 → `Sparkles`, `Moon`, `Flame`, `Search`, `Layers`, `Settings`,
      `Gift`, `Bell`), los 24 ✓ de `*LimitReached`, `SubscriptionTab`, `BirthChartPageContent`
      (→ nuevo `<CheckItem>` en `components/ui/check-item.tsx`), ✓ en `TarotistaProfilePage`
      (→ `Check`), 💡 (→ `Lightbulb`; el aviso de `NumerologyPage` pasa a `Alert variant="info"`),
      🎉 (→ `PartyPopper`), ⭐ Maestro (→ `Star`), ✨ en `WelcomeModal` / `ReadingExperience`
      (→ `Sparkles`), 💎 y ✨ redundantes con el `<Gem>`/`<Sparkles>` de al lado en
      `UpgradeBanner` / `FreeReadingUpgradeBanner` (se quitan). ★ de `SavedChartCard` es el
      fallback de `ZodiacSymbol`: va con la familia `zodiac/`.

**Fase 3 — Guardarraíl:**

- [x] `src/no-emoji-user-facing.test.ts` (mismo patrón que `no-ia-user-facing.test.ts`): falla si
      aparece un carácter de los bloques emoji / Misc Symbols / Dingbats en `src/` fuera de
      comentarios, tests y `admin/`. Dos listas verificadas (un archivo listado que ya no tiene
      emojis rompe el test): `ALLOWLIST` permanente (`birth-chart.enums.ts`, textos de compartir,
      `✦`) y `PENDIENTES_FASE_2` (20 archivos, tipada por familia de `BRAND_ICONS`), que cada PR
      de familia va vaciando.
- [x] `DESIGN_HAND-OFF.md` (`backend/tarot-app/docs/`): sección "6. Iconografía" con la línea
      visual, la regla de decisión y el uso de `<BrandIcon>`.

#### 🎨 Prompts para Gemini (Nano Banana)

En inglés a propósito: el modelo sigue mejor la especificación de estilo. Usar siempre el
**prompt base** y, debajo, el bloque del asset. Pedir **una imagen por prompt** (no grillas).

**Prompt base (pegar completo antes de cada asset):**

```
Icon for a premium tarot & astrology web app. STYLE: elegant mystical line-art drawn in fine
metallic gold (#D69E2E) strokes with a soft warm glow, delicate ornamental filigree details,
a few tiny 4-point sparkles and faint star dust around the subject. Single centered subject,
symmetrical, balanced composition with generous margins (subject fills ~70% of the canvas).
Clean, crisp, readable when scaled down to 48 px: no tiny clutter, no more than 3 levels of
detail. BACKGROUND: pure flat white (#FFFFFF), completely empty — no gradient, no vignette,
no frame, no circle, no shadow, no texture. NO text, NO letters, NO numbers, NO watermark.
Square 1:1, 1024×1024, high resolution, sharp edges. Consistent with the other icons of the
same set: same stroke weight, same glow, same level of detail.

SUBJECT:
```

**Variante "ilustración"** (solo si más adelante se quieren heros por signo, no para iconos):
reemplazar la línea de BACKGROUND por
`BACKGROUND: deep violet-indigo cosmic night sky (#2D1B69 to #1A0A2E) with faint constellation lines, a thin crescent moon and golden bokeh particles, like a painted mystical illustration.`

**Signos occidentales (`zodiac/`)** — glifo + motivo del signo integrado, para que lea a 32 px:

| Slug | SUBJECT |
| --- | --- |
| aries | The astrological glyph of Aries (♈) whose two curves end in stylized curling ram horns; a small spark at the base. |
| taurus | The glyph of Taurus (♉): a circle with crescent horns on top, the circle drawn as a delicate ring with a tiny star inside. |
| gemini | The glyph of Gemini (♊): two vertical pillars joined by arcs, with a faint mirrored twin flourish; subtle symmetry. |
| cancer | The glyph of Cancer (♋): two mirrored spirals with claw-like ends, drawn like a moon-tide swirl. |
| leo | The glyph of Leo (♌): a flowing loop ending in a mane-like curl, with a small sun ray burst at the top. |
| virgo | The glyph of Virgo (♍): three vertical strokes ending in an inward loop, with a small wheat spike woven in. |
| libra | The glyph of Libra (♎): a horizontal line under a raised arc, drawn like a balanced scale beam with a tiny plumb sparkle. |
| scorpio | The glyph of Scorpio (♏): three strokes ending in an upward arrow-tail, like a scorpion sting, with a small star at the tip. |
| sagittarius | The glyph of Sagittarius (♐): a diagonal arrow crossed near the tail, feathered fletching, with a comet-like sparkle trail. |
| capricorn | The glyph of Capricorn (♑): the sea-goat curve with a horn stroke and a fish-tail loop, elegant and ornamental. |
| aquarius | The glyph of Aquarius (♒): two parallel wavy lines like flowing water, with three tiny droplets of light above. |
| pisces | The glyph of Pisces (♓): two opposing arcs joined by a bar, the arcs ending in fish-tail flourishes. |

**Animales chinos (`chinese/`)** — animal completo de perfil, mismo trazo que los de
`horoscopo-chino-animales.webp`:

| Slug | SUBJECT |
| --- | --- |
| rat | A rat in elegant side profile, long tail curling into a flourish, alert ears, sitting upright. |
| ox | An ox in side profile, sturdy body, curved horns, calm posture, one hoof slightly forward. |
| tiger | A tiger in side profile, mid-stride, stripes suggested with a few strokes, tail raised in a curve. |
| rabbit | A rabbit sitting in side profile, long upright ears, soft rounded body, tiny tail. |
| dragon | A Chinese dragon in an S-shaped serpentine pose, flowing whiskers and mane, small clawed feet, a pearl of light near its mouth. |
| snake | A snake coiled in a graceful figure-eight, head raised, subtle scale pattern, tongue as a tiny spark. |
| horse | A horse in side profile, mid-gallop, flowing mane and tail. |
| goat | A goat in side profile, curved ridged horns, small beard, standing on a tiny rock. |
| monkey | A monkey sitting in side profile, long curling tail, one hand raised. |
| rooster | A rooster in side profile, proud chest, ornate tail feathers, crest and wattle. |
| dog | A dog sitting in side profile, alert ears, tail curled upward, loyal posture. |
| pig | A pig in side profile, round body, curly tail, small ears, gentle expression. |

**Elementos y palos (`elements/`, `suits/`):**

| Slug | SUBJECT |
| --- | --- |
| fire | A single upright flame with three tongues, inner flame suggested by a thinner stroke. |
| water | A single droplet with two concentric ripples beneath it. |
| air | Three flowing horizontal wind curls of increasing length, like a breeze. |
| earth | A mountain silhouette with a small sprout growing from its base. |
| spirit | A five-petal lotus with a small spark of light at its center. |
| wood | A young tree with a straight trunk and a symmetrical round canopy of a few leaves. |
| fire-cn | Same flame as `fire` but with a small red-gold ember base (keep gold line-art). |
| earth-cn | A layered hill with a small square field pattern (the Chinese earth character motif, no text). |
| metal | A ring/coin shape with a square hole in the center (Chinese coin), no characters. |
| water-cn | A wave with a curling crest, no droplet. |
| wands | A single upright wooden wand with small leaves sprouting from its top. |
| cups | A chalice seen from the front, with a small rising drop of light above it. |
| swords | A single upright sword, blade pointing up, simple crossguard, thin glow along the blade. |
| pentacles | A coin with a five-pointed star (pentacle) inscribed inside a circle. |

**Áreas del horóscopo (`areas/`):**

| Slug | SUBJECT |
| --- | --- |
| love | Two overlapping hearts drawn as a single continuous filigree line. |
| work | A laurel branch curved around a small rising star (achievement), no briefcase. |
| wellbeing | A lotus flower with a small sun rising behind it. |
| money | Three stacked coins with a small four-point sparkle, no currency symbols. |

**Fases lunares (`moon/`)** — mismo círculo de referencia en las 8, solo cambia la parte iluminada:

| Slug | SUBJECT |
| --- | --- |
| new_moon | A moon disc outlined in gold, fully dark inside (thin outline only), with a faint halo. |
| waxing_crescent | A moon disc with a thin crescent lit on the RIGHT side, the rest as thin outline. |
| first_quarter | A moon disc with the RIGHT half lit. |
| waxing_gibbous | A moon disc with about three quarters lit on the RIGHT, a thin dark sliver on the left. |
| full_moon | A full moon disc softly lit with subtle crater texture and a glow halo. |
| waning_gibbous | A moon disc with about three quarters lit on the LEFT, a thin dark sliver on the right. |
| last_quarter | A moon disc with the LEFT half lit. |
| waning_crescent | A moon disc with a thin crescent lit on the LEFT side. |

**Categorías de rituales (`rituals/`):**

| Slug | SUBJECT |
| --- | --- |
| tarot | A single tarot card seen from the front with an ornamental back pattern and a small star. |
| lunar | A crescent moon cradling a small star. |
| energy | A candle flame with radiating light lines. |
| meditation | A seated figure in lotus pose, minimal line, a small halo above the head. |
| protection | A shield with a small star in the center and a laurel outline. |
| abundance | A cornucopia or a bowl overflowing with small stars (choose the clearest). |
| love | A single heart wrapped by a thin ribbon flourish. |
| wellbeing | A sprig with three leaves inside a soft circle of light. |

**Numerología (`numerology/`)** — arquetipos, sin el número dibujado:

| Slug | SUBJECT |
| --- | --- |
| 1 | An ornate crown (leader). |
| 2 | Two hands meeting, clasped gently (diplomat). |
| 3 | A painter's palette with three small stars instead of paint dots (creative). |
| 4 | A stone arch with a keystone (builder). |
| 5 | A compass rose with a small comet (adventurer). |
| 6 | A heart sheltered under a small roof line (protector). |
| 7 | A crystal ball on a small stand with a star inside (seeker). |
| 8 | A faceted gem (achiever). |
| 9 | A dove in flight carrying a small branch (humanitarian). |
| 11 | An open eye with a star as the pupil (visionary). |
| 22 | A stepped temple/pyramid outline with a star above (master builder). |
| 33 | Two open hands releasing a small star upward (compassionate master). |

**Hubs y guías (`hubs/`):**

| Slug | SUBJECT |
| --- | --- |
| tarot | Three fanned tarot cards with ornamental backs. |
| horoscope | A zodiac wheel: a ring with twelve small tick marks and a star at the center. |
| chinese | A Chinese lantern with a small tassel and a star glow. |
| numerology | A sacred-geometry circle with a triangle inside and small nodes at the vertices (no digits). |
| pendulum | A pendulum: a chain ending in a faceted crystal point, slight swing arc. |
| birth-chart | A natal chart wheel: a ring with inner spokes and small planet dots on the rim. |
| rituals | A candle with a crescent moon behind it. |
| planets | A ringed planet with two small orbiting stars. |
| houses | A twelve-segment wheel with one segment highlighted, like an astrological houses chart. |

#### 🧪 Criterios de aceptación

- [ ] Cero emojis en texto de cara al usuario fuera de `admin/` (guardarraíl en verde). *PR 1:
      verde con 20 archivos en `PENDIENTES_FASE_2`; se cumple del todo cuando la lista quede vacía.*
- [ ] Los 24 signos (12 + 12) se ven idénticos en Linux/Windows/macOS/iOS/Android: son
      imágenes, no glifos de fuente. *(12 + 12 ✅.)*
- [x] `ZodiacSymbol` y `ChineseAnimalSymbol` conservan su firma pública; sus consumidores no
      cambian de props (las dos tarjetas de grilla pasan a `size` explícito por decisión visual,
      no por obligación).
- [x] Cada asset tiene `alt` en español y `role="img"`; los decorativos, `aria-hidden`
      (garantizado por `<BrandIcon>` + el registro).
- [ ] Lighthouse: sin regresión de LCP en `/horoscopo` y `/horoscopo-chino` (máster 512 WebP
      < 48 KB; servido por `next/image` ≤ 6 KB hasta 128 px; `priority` solo above-the-fold). *Ver
      "Peso de los assets" arriba: el criterio original de 15 KB se ajustó.*
- [x] Ciclo de calidad completo por PR (PR 1: ✅).

#### 📁 Archivos involucrados

Nuevos: `public/images/icons/**`, `lib/constants/brand-icons.ts`, `components/ui/brand-icon.tsx`,
`components/ui/check-item.tsx`, `scripts/process-brand-icons.mjs`, `src/no-emoji-user-facing.test.ts`.
Modificados: los 41 archivos del inventario (lista exacta con
`python3` + regex de bloques emoji sobre `src/` sin tests, ver descripción).

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
1. T-UI-04 (Alert variants)        ─┐
2. T-UI-01 (Spinner)                ├─ Foundation: primitivos limpios
3. T-UI-02 (EmptyState)             │
4. T-UI-03 (ErrorDisplay)          ─┘
5. T-UI-06 (Skeleton)               ─┐
6. T-UI-08 (DisclaimerBanner)        ├─ Migraciones que dependen de la foundation
7. T-UI-09 (Toast en ContactForm)   ─┘
8. T-UI-05 (CTA Premium copy)       ─┐
9. T-UI-07 (CTA Auth copy)           ├─ Copy unification (requiere PO)
10. T-UI-10 (Próximamente)          ─┘
11. T-UI-11 (Barrido residual)      ─── Cierre: archivos fuera del scope inicial
```

Cada tarea es un PR independiente a `develop`. Pasar el ciclo de calidad completo antes de mergear cada uno.

---

## DIAGRAMA DE DEPENDENCIAS

```
T-UI-01 ─────────┐
T-UI-02 ─────────┤
T-UI-03 ─────────┼──► (independientes, paralelizables)
T-UI-06 ─────────┤
T-UI-04 ─► T-UI-08
T-UI-09 ─────────┐
T-UI-10 ─────────┤
T-UI-05 (req PO) ┤
T-UI-07 (req PO) ┘
T-UI-11 (depende de T-UI-01..10 completadas) ──► barrido residual
```
