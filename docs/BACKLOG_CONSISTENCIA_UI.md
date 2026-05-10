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
| Skeletons | **`<Skeleton>` de `components/ui/skeleton.tsx`** | Token visual (`bg-muted`) ya alineado |
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
   - [`src/app/loading.tsx:10`](../frontend/src/app/loading.tsx#L10)
   - [`src/app/explorar/loading.tsx:10`](../frontend/src/app/explorar/loading.tsx#L10)
   - [`src/app/tarot/loading.tsx:10`](../frontend/src/app/tarot/loading.tsx#L10)
   - [`src/app/ritual/loading.tsx:10`](../frontend/src/app/ritual/loading.tsx#L10)
   - [`src/app/historial/loading.tsx:10`](../frontend/src/app/historial/loading.tsx#L10)

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
| T-UI-04 | Refactor banners/alerts a `<Alert>` con variantes | 🔴 Crítica | 2 días | — | ⏳ PENDIENTE |
| T-UI-05 | Unificar copy de CTAs Premium (constante única) | 🟡 Alta | 0.5 día | T-UI-04 (idealmente) | ⏳ PENDIENTE |
| T-UI-06 | Migrar skeletons inline a `<Skeleton>` | 🟡 Alta | 1 día | — | ⏳ PENDIENTE |
| T-UI-07 | Unificar copy de CTAs de auth | 🟡 Alta | 0.5 día | — | ⏳ PENDIENTE |
| T-UI-08 | Crear `<DisclaimerBanner>` y migrar páginas legales | 🟢 Media | 0.5 día | T-UI-04 | ⏳ PENDIENTE |
| T-UI-09 | Migrar feedback de `ContactForm` a toast | 🟢 Media | 0.25 día | — | ⏳ PENDIENTE |
| T-UI-10 | Renombrar/unificar uso de "Próximamente" | 🟢 Baja | 0.25 día | — | ⏳ PENDIENTE |

**Estimación total:** ~8.5 días.

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

- [x] [`marketplace/BookingPage.tsx:97`](../frontend/src/components/features/marketplace/BookingPage.tsx#L97) — usar `<ErrorDisplay message="Error al cargar el tarotista" onRetry={...} />` y mantener el botón "Volver a explorar" como secundario fuera del componente si se desea.
- [x] [`marketplace/BookingCalendar.tsx:238`](../frontend/src/components/features/marketplace/BookingCalendar.tsx#L238) — `<ErrorDisplay message="Error al cargar horarios disponibles" onRetry={refetch} />`.
- [x] [`dashboard/SacredEventsWidget.tsx:137-139`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L137-L139).
- [x] [`admin/CacheManagementContent.tsx:124-129`](../frontend/src/components/features/admin/CacheManagementContent.tsx#L124-L129) — reemplazar el bloque (`<p text-destructive>` + botón "Reintentar") por `<ErrorDisplay onRetry={refetch} message="Error al cargar datos de caché" />`.
- [x] [`readings/ReadingExperience.tsx:702`](../frontend/src/components/features/readings/ReadingExperience.tsx#L702) — sustituir botón "Reintentar" por flujo con `<ErrorDisplay>`.
- [x] **Decisión de copy:** copy canónico confirmado: "Intentar de nuevo". Tests actualizados:
  - [`src/app/historial/page.test.tsx:797`](../frontend/src/app/historial/page.test.tsx#L797) — cambiado `/reintentar/i` por `/intentar de nuevo/i`.
  - Resto de tests migrados.

#### 🎯 Criterios de aceptación

- [x] No quedan `<p className="text-red-600">Error...</p>` inline en componentes de feature.
- [x] El copy del retry es **uniforme** en toda la app: "Intentar de nuevo".
- [x] Tests actualizados al copy canónico, todos pasando.
- [x] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`marketplace/BookingPage.tsx`, `marketplace/BookingCalendar.tsx`, `dashboard/SacredEventsWidget.tsx`, `admin/CacheManagementContent.tsx`, `readings/ReadingExperience.tsx`, `app/historial/page.test.tsx`.

---

### T-UI-04: Refactor banners/alerts inline a `<Alert>` con variantes

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** ninguna
**Estado:** ⏳ PENDIENTE
**Cubre INC:** INC-004

#### 📋 Descripción

Unificar los 6 patrones de markup de banners (`bg-yellow-50`, `bg-red-50`, `bg-green-50`, `bg-amber-50`, gradiente premium) bajo el componente `<Alert>` de [`components/ui/alert.tsx`](../frontend/src/components/ui/alert.tsx). Si el componente actual no expone variantes `info` / `warning` / `success`, agregarlas.

#### ✅ Tareas específicas

- [ ] **Extender `<Alert>` con variantes** (en `components/ui/alert.tsx`): `default | info | success | warning | destructive`. Mapear cada una a tokens de color (no `bg-red-50` hardcoded — usar `bg-destructive/10`, `bg-amber-500/10`, `bg-emerald-500/10`, etc.).
- [ ] Migrar **error banners admin**:
  - [`app/admin/page.tsx:44`](../frontend/src/app/admin/page.tsx#L44)
  - [`PlatformMetricsContent.tsx:90`](../frontend/src/components/features/admin/PlatformMetricsContent.tsx#L90)
  - [`AgendaManagementContent.tsx:263`](../frontend/src/components/features/admin/AgendaManagementContent.tsx#L263)
  - [`UsersManagementContent.tsx:123`](../frontend/src/components/features/admin/UsersManagementContent.tsx#L123)
  → `<Alert variant="destructive">`.
- [ ] Migrar **success banner** [`ContactForm.tsx:149`](../frontend/src/components/features/contact/ContactForm.tsx#L149) → ver T-UI-09 (mejor a toast).
- [ ] Migrar **warning banners**:
  - [`holistic-services/ServiceBookingPage.tsx:197`](../frontend/src/components/features/holistic-services/ServiceBookingPage.tsx#L197)
  - [`birth-chart/UsageLimitBanner.tsx:47`](../frontend/src/components/features/birth-chart/UsageLimitBanner/UsageLimitBanner.tsx#L47)
  → `<Alert variant="warning">`.
- [ ] **Banners upsell premium con gradiente** ([`SacredEventsWidget.tsx:189`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L189), [`DailyLimitReachedModal.tsx:106`](../frontend/src/components/features/readings/DailyLimitReachedModal.tsx#L106)): crear componente dedicado `<PremiumUpsellCard>` reutilizable (NO un `<Alert>`, son CTAs de conversión, no notificaciones).
- [ ] Disclaimers `<div bg-yellow-50>` → ver T-UI-08.

#### 🎯 Criterios de aceptación

- [ ] `<Alert>` expone al menos `info`, `success`, `warning`, `destructive` con tokens del design system.
- [ ] No quedan banners con `bg-red-50`, `bg-green-50`, `bg-yellow-50`, `bg-amber-50` hardcoded en componentes de feature (excepción: `<PremiumUpsellCard>` con gradiente intencional).
- [ ] Migración cubierta por tests (visual + a11u: cada variante tiene `role="alert"` apropiado).
- [ ] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`components/ui/alert.tsx` (extender), `app/admin/page.tsx`, `admin/PlatformMetricsContent.tsx`, `admin/AgendaManagementContent.tsx`, `admin/UsersManagementContent.tsx`, `holistic-services/ServiceBookingPage.tsx`, `birth-chart/UsageLimitBanner`, `dashboard/SacredEventsWidget.tsx`, `readings/DailyLimitReachedModal.tsx`, nuevo `components/ui/premium-upsell-card.tsx`.

---

### T-UI-05: Unificar copy de CTAs Premium en una constante

**Prioridad:** 🟡 ALTA
**Estimación:** 0.5 día
**Dependencias:** decisión de producto sobre copy canónico
**Estado:** ⏳ PENDIENTE
**Cubre INC:** INC-005

#### 📋 Descripción

Existen 6 copys distintos para la misma acción ("Comenzar ahora", "Upgrade a Premium", "Obtener Premium", "Actualizar a Premium", "Mejorar a Premium", "Comenzar Premium"). Crear una constante única en `lib/constants/cta-copy.ts` y reemplazar todos los literales por ella. **Antes de implementar**, validar con producto cuál es el copy canónico para cada contexto:

- **Compra inicial / página premium:** propuesta `Obtener Premium` o `Comenzar Premium`.
- **Tras alcanzar límite:** propuesta `Actualizar a Premium`.
- **Upsell suave (banner):** propuesta `Mejorar a Premium`.

#### ✅ Tareas específicas

- [ ] Reunión/Slack con PO para fijar copy por contexto.
- [ ] Crear `lib/constants/cta-copy.ts` exportando `CTA_PREMIUM = { PURCHASE: '...', LIMIT_REACHED: '...', UPSELL_SOFT: '...' }`.
- [ ] Migrar archivos:
  - [`UpgradeModal.tsx:170`](../frontend/src/components/features/readings/UpgradeModal.tsx#L170)
  - [`UpgradeBanner.tsx:53`](../frontend/src/components/features/readings/UpgradeBanner.tsx#L53)
  - [`PremiumUpgradePrompt.tsx:109,274`](../frontend/src/components/features/conversion/PremiumUpgradePrompt.tsx#L109)
  - [`PremiumPreview.tsx:80`](../frontend/src/components/features/conversion/PremiumPreview.tsx#L80)
  - [`DailyCardLimitReached.tsx:236`](../frontend/src/components/features/daily-reading/DailyCardLimitReached.tsx#L236)
  - [`ReadingLimitReached.tsx:136`](../frontend/src/components/features/readings/ReadingLimitReached.tsx#L136)
  - [`SacredEventsWidget.tsx:205`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L205)
  - [`PremiumPage.tsx:131`](../frontend/src/components/features/premium/PremiumPage.tsx#L131)
  - [`PlanComparison.tsx:74`](../frontend/src/components/features/home/PlanComparison.tsx#L74)
- [ ] Actualizar tests que asuman copy específico.

#### 🎯 Criterios de aceptación

- [ ] Existe `lib/constants/cta-copy.ts` con copys documentados.
- [ ] No queda ningún CTA Premium con literal hardcoded en componentes de feature.
- [ ] El producto valida el copy final.
- [ ] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

10 archivos de features Premium + nuevo `lib/constants/cta-copy.ts`.

---

### T-UI-06: Migrar skeletons inline a `<Skeleton>`

**Prioridad:** 🟡 ALTA
**Estimación:** 1 día
**Dependencias:** ninguna
**Estado:** ⏳ PENDIENTE
**Cubre INC:** INC-006

#### 📋 Descripción

Reemplazar `<div className="animate-pulse rounded bg-gray-200 ..." />` y derivados por `<Skeleton>` de [`components/ui/skeleton.tsx`](../frontend/src/components/ui/skeleton.tsx). El componente ya usa `bg-muted` (token correcto del design system).

#### ✅ Tareas específicas

- [ ] [`tarot/tirada/page.tsx:32`](../frontend/src/app/tarot/tirada/page.tsx#L32) — `<Skeleton className="mb-6 h-4 w-48" />`.
- [ ] [`tarot/preguntas/page.tsx:24`](../frontend/src/app/tarot/preguntas/page.tsx#L24) — `<Skeleton className="mb-6 h-4 w-32" />`.
- [ ] [`carta-astral/historial/loading.tsx:11`](../frontend/src/app/carta-astral/historial/loading.tsx#L11) — `<Skeleton className="h-8 w-48" />`.
- [ ] [`readings/QuestionSelector.tsx:30`](../frontend/src/components/features/readings/QuestionSelector.tsx#L30) y [`readings/CategorySelector.tsx:68`](../frontend/src/components/features/readings/CategorySelector.tsx#L68) — los skeleton-card custom: decidir si conviene crear `<SkeletonCard>` reutilizable (componer `<Skeleton>` en una `<Card>`) o adaptar directamente. Ya existe [`skeleton-card.tsx`](../frontend/src/components/ui/skeleton-card.tsx) — usarlo si aplica.
- [ ] Auditar `animate-pulse` con grep en `src/` y migrar el resto.

#### 🎯 Criterios de aceptación

- [ ] No quedan `bg-gray-200` ni `bg-card` aplicados a skeletons en features.
- [ ] `<Skeleton>` (o `<SkeletonCard>`) es el primitivo único para esqueletos.
- [ ] Tests pasan; `data-testid="skeleton-card"` se preserva donde lo usen los tests.
- [ ] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`app/tarot/tirada/page.tsx`, `app/tarot/preguntas/page.tsx`, `app/carta-astral/historial/loading.tsx`, `readings/QuestionSelector.tsx`, `readings/CategorySelector.tsx`, posible nuevo uso de `components/ui/skeleton-card.tsx`.

---

### T-UI-07: Unificar copy de CTAs de auth

**Prioridad:** 🟡 ALTA
**Estimación:** 0.5 día
**Dependencias:** ninguna
**Estado:** ⏳ PENDIENTE
**Cubre INC:** INC-007

#### 📋 Descripción

Hoy conviven 4 variantes para la misma acción ("Crear Cuenta", "Crear Cuenta Gratis", "Crear mi cuenta gratis", "Registrarse"). Definir convención y migrar.

**Propuesta inicial (validar con PO):**

- "Crear cuenta" → submit del form de registro.
- "Crear cuenta gratis" → CTAs de conversión (resultado free, página compartida, planes).
- "Iniciar sesión" → entrar a la app (consistente).
- Eliminar "Registrarse" del UserMenu y reemplazar por "Crear cuenta" (alineado al submit).

#### ✅ Tareas específicas

- [ ] Reunión con PO para confirmar copys.
- [ ] Crear constante `CTA_AUTH = { LOGIN: 'Iniciar sesión', REGISTER: 'Crear cuenta', REGISTER_CONVERSION: 'Crear cuenta gratis' }` en `lib/constants/cta-copy.ts`.
- [ ] Migrar:
  - [`UserMenu.tsx:33`](../frontend/src/components/layout/UserMenu.tsx#L33) — "Registrarse" → "Crear cuenta".
  - [`compartida/[token]/page.tsx:106`](../frontend/src/app/compartida/[token]/page.tsx#L106) — "Crear mi cuenta gratis" → "Crear cuenta gratis".
  - Casillas de tests (`carta-astral/resultado/page.test.tsx`, `RegisterForm.test.tsx`) actualizadas.

#### 🎯 Criterios de aceptación

- [ ] Solo existen los 3 copys consensuados en componentes de feature.
- [ ] Constante única consumida desde todos los CTAs de auth.
- [ ] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`components/layout/UserMenu.tsx`, `app/compartida/[token]/page.tsx`, tests asociados, `lib/constants/cta-copy.ts`.

---

### T-UI-08: Crear `<DisclaimerBanner>` y migrar páginas legales

**Prioridad:** 🟢 MEDIA
**Estimación:** 0.5 día
**Dependencias:** T-UI-04 (variante `info` en `<Alert>`)
**Estado:** ⏳ PENDIENTE
**Cubre INC:** INC-008

#### 📋 Descripción

Las páginas `contacto`, `terminos` y `privacidad` repiten textualmente el mismo bloque "Nota: ..." con `<div className="rounded-lg bg-yellow-50 p-4">`. Reemplazar por un componente `<DisclaimerBanner>` (o directamente `<Alert variant="info">` con icono `Info`).

#### ✅ Tareas específicas

- [ ] Decidir: ¿componente nuevo `<DisclaimerBanner>` o uso directo de `<Alert variant="info">`?
- [ ] Migrar:
  - [`app/contacto/page.tsx:42`](../frontend/src/app/contacto/page.tsx#L42)
  - [`app/terminos/page.tsx:115`](../frontend/src/app/terminos/page.tsx#L115)
  - [`app/privacidad/page.tsx:152`](../frontend/src/app/privacidad/page.tsx#L152)
- [ ] Eliminar `bg-yellow-50` hardcoded.

#### 🎯 Criterios de aceptación

- [ ] Las tres páginas legales usan el mismo componente.
- [ ] Visualmente idénticas en light mode (único modo soportado).
- [ ] Aprovechar la migración para eliminar las clases `dark:*` legacy presentes en estos `<div>`.
- [ ] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`app/contacto/page.tsx`, `app/terminos/page.tsx`, `app/privacidad/page.tsx`, posible nuevo `components/ui/disclaimer-banner.tsx`.

---

### T-UI-09: Migrar feedback de `ContactForm` a toast

**Prioridad:** 🟢 MEDIA
**Estimación:** 0.25 día
**Dependencias:** ninguna
**Estado:** ⏳ PENDIENTE
**Cubre INC:** INC-009

#### 📋 Descripción

`ContactForm` muestra el éxito de envío como banner inline `<div bg-green-50>`. Esto rompe el patrón establecido en `authStore`/`admin` de usar Sonner toast para feedback transitorio.

#### ✅ Tareas específicas

- [ ] [`contact/ContactForm.tsx:149`](../frontend/src/components/features/contact/ContactForm.tsx#L149) — eliminar el banner, usar `toast.success('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.')`.
- [ ] Resetear el form tras éxito (si no lo hace).
- [ ] Actualizar tests del form para verificar el toast (no el banner).

#### 🎯 Criterios de aceptación

- [ ] Éxito del form se comunica vía toast.
- [ ] Errores siguen mostrándose como `<Alert variant="destructive">` (mensaje persistente).
- [ ] Tests actualizados.
- [ ] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`components/features/contact/ContactForm.tsx` y tests.

---

### T-UI-10: Renombrar/unificar uso de "Próximamente"

**Prioridad:** 🟢 BAJA
**Estimación:** 0.25 día
**Dependencias:** ninguna
**Estado:** ⏳ PENDIENTE
**Cubre INC:** INC-010

#### 📋 Descripción

"Próximamente" se usa con dos significados distintos:
1. **"Eventos próximos"** (lista, cronología) — `SacredEventsWidget`.
2. **"Feature aún no disponible"** — `SettingsTab`, `PlatformMetricsContent`, `TarotistaProfilePage`.

Esto es ambiguo: el usuario puede leer "Próximamente" en el dashboard y pensar que esa sección no funciona aún.

#### ✅ Tareas específicas

- [ ] Renombrar [`SacredEventsWidget.tsx:174`](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L174) de `Próximamente` → `Próximos eventos` (o `Próximos`).
- [ ] Crear pequeño `<ComingSoonBadge>` o usar `<Badge variant="secondary">Próximamente</Badge>` para los placeholders de features no implementadas:
  - [`profile/SettingsTab.tsx:59,71`](../frontend/src/components/features/profile/SettingsTab.tsx#L59)
  - [`marketplace/TarotistaProfilePage.tsx:346`](../frontend/src/components/features/marketplace/TarotistaProfilePage.tsx#L346)
  - [`admin/PlatformMetricsContent.tsx:123`](../frontend/src/components/features/admin/PlatformMetricsContent.tsx#L123)

#### 🎯 Criterios de aceptación

- [ ] "Próximamente" solo se usa para indicar feature en desarrollo (visualmente como Badge).
- [ ] Las secciones de eventos usan otro copy ("Próximos eventos" / "Próximos").
- [ ] Ciclo de calidad pasa.

#### 📁 Archivos involucrados

`dashboard/SacredEventsWidget.tsx`, `profile/SettingsTab.tsx`, `marketplace/TarotistaProfilePage.tsx`, `admin/PlatformMetricsContent.tsx`.

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
```
