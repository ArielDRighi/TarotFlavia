# BACKLOG: REDISEÑO DEL HOME AUTENTICADO (DASHBOARD FREE / PREMIUM) — Junio 2026

## PARTE A: REPORTE DE HALLAZGOS DE DISEÑO

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Rediseño de UX/UI del home autenticado (dashboard de usuarios FREE registrado y PREMIUM)
**Versión:** 1.0
**Fecha:** 30 de junio de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)
**Verificación visual:** Playwright sobre el entorno local (`localhost:3001`), sesiones reales `free@test.com` y `premium@test.com`.
**Canon visual de referencia:** rediseño de la Enciclopedia Mística (`BACKLOG_ENCICLOPEDIA_REDISENO_2026_05.md`) y tokens de `globals.css`.
**Convención de IDs:** se inicia una nueva serie `DASH-XXX` / `T-DASH-XXX` propia de este backlog.

---

## CONTEXTO

Durante una revisión de diseño sobre el **home de usuarios autenticados** (`/`, componente [UserDashboard.tsx](frontend/src/components/features/dashboard/UserDashboard.tsx)), Ariel reportó dos problemas:

1. **Los widgets se agrupan a la derecha y se van hacia abajo**, en una columna estrecha, en lugar de **utilizar todo el espacio horizontal disponible** que permita chequear todos los widgets "de un vistazo".
2. El home **podría embellecerse como la Enciclopedia**: atmósfera mística (banda oscura/dorada), alguna **ilustración**, identidad de marca — hoy es un tablero blanco plano sin personalidad.

El objetivo rector es **CONSISTENCIA de diseño** con el rediseño ya aplicado a la Enciclopedia: reutilizar su canon visual (gradiente noche `#1a0a2e → #2d1b69`, dorado `#d69e2e`, Cormorant Garamond, estrellas/luna decorativas, `Reveal` escalonado, micro-interacciones de hover) en vez de inventar un lenguaje nuevo.

### Evidencia visual capturada (Playwright, viewport 1440×900)

| Usuario  | Hallazgo observado                                                                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FREE     | Columna izquierda (2/3) con solo **2 elementos** (`¿Sabías que…?` + banner de upgrade) y luego **~1.100 px de vacío blanco** hasta el footer. Columna derecha (1/3) con **5 widgets** apilados hacia abajo.          |
| PREMIUM  | Columna izquierda (2/3) con **1 solo elemento** (`¿Sabías que…?`) y luego **~1.500 px de vacío blanco**. Columna derecha (1/3) con **6 widgets** apilados (Horóscopo, Chino, Numerología, Calendario, Rituales, Stats). |

> En ambos casos se desperdicia **~60 % del ancho** en pantallas desktop. El problema es **peor en Premium** (no tiene `UpgradeBanner` que rellene la izquierda).

---

## ÍNDICE DE HALLAZGOS

| ID       | Hallazgo                                                                            | Severidad  | Módulo afectado                          |
| -------- | ----------------------------------------------------------------------------------- | ---------- | ---------------------------------------- |
| DASH-001 | Layout 2/3 + 1/3 desbalanceado: 5–6 widgets apilados en columna estrecha, vacío masivo | 🔴 Crítica | Frontend — UserDashboard (layout)        |
| DASH-002 | Home sin identidad de marca: cabecera plana, sin banda mística ni ilustración        | 🟠 Alta    | Frontend — WelcomeHeader / Dashboard     |
| DASH-003 | Inconsistencia visual entre widgets (serif sí/no, grises hardcodeados, `dark:` muerto) | 🟡 Media   | Frontend — Widgets del dashboard         |
| DASH-004 | Sin assets ni ilustraciones de marca para el dashboard                               | 🟠 Alta    | Frontend — Assets                        |
| DASH-005 | Empty states pobres (solo texto) en widgets sin datos                                | 🟡 Media   | Frontend — Widgets (estados vacíos)      |
| DASH-006 | Sin micro-interacciones ni reveal escalonado (tablero estático)                      | 🟢 Baja    | Frontend — Widgets / Dashboard           |
| DASH-007 | Accesibilidad: contraste AA en banda oscura, foco visible, `prefers-reduced-motion`  | 🟡 Media   | Frontend — transversal                   |

---

## DETALLE DE HALLAZGOS

### DASH-001: Layout Desbalanceado — Widgets Apilados a la Derecha y Vacío Masivo

**Severidad:** 🔴 Crítica (es el problema principal reportado)
**Módulo:** [UserDashboard.tsx](frontend/src/components/features/dashboard/UserDashboard.tsx)
**Reportado por:** Ariel — home FREE y PREMIUM (30/06/2026), confirmado por Playwright.

#### Descripción del Problema

El dashboard usa una grilla de 2 columnas asimétrica donde **toda la batería de widgets temáticos** (Horóscopo, Horóscopo Chino, Numerología, Calendario Sagrado, Rituales, Estadísticas) se renderiza en la **columna derecha de 1/3 de ancho**, mientras la columna izquierda de 2/3 solo aloja `DidYouKnow` + `MyServices` + `UpgradeBanner`. El resultado: los widgets se comprimen en una tira angosta que "se va hacia abajo" y queda un enorme bloque blanco a la izquierda.

#### Causa Raíz Identificada

En [UserDashboard.tsx:55-88](frontend/src/components/features/dashboard/UserDashboard.tsx#L55-L88):

```tsx
<div className="grid gap-8 lg:grid-cols-3">
  {/* Left column (2/3 width) */}
  <div className="space-y-8 lg:col-span-2">
    <DidYouKnowSection />
    <MyServicesWidget />
    {!isPremium && <UpgradeBanner />}
  </div>

  {/* Right column (1/3 width) — 6 widgets stacked */}
  <div className="space-y-8">
    <HoroscopeWidget />
    <ChineseHoroscopeWidget />
    <NumerologyWidget />
    <SacredEventsWidget />
    <PersonalizedRitualsWidget />
    {isPremium && <StatsSection />}
  </div>
</div>
```

La asignación de columnas es **estática y temática**, no responsiva al volumen de contenido. Como casi todos los widgets viven en la columna de 1/3, esa columna crece verticalmente sin límite y la de 2/3 queda casi vacía.

#### Criterios de Aceptación

1. **Dado** que entro al home autenticado en desktop (≥ `lg`)
   **Cuando** carga el dashboard
   **Entonces** los widgets se distribuyen **a lo ancho** (multi-columna), sin una columna casi vacía y sin una columna angosta que se extienda mucho más que el resto.

2. **Dado** cualquier plan (FREE o PREMIUM)
   **Cuando** se muestran sus widgets (que varían por plan)
   **Entonces** la grilla **rellena el ancho** de forma equilibrada independientemente de cuántos widgets correspondan al plan.

3. **Dado** mobile / tablet
   **Cuando** se reduce el ancho
   **Entonces** la grilla colapsa con elegancia a 2 y luego 1 columna, conservando orden lógico.

#### Notas Técnicas

- Sustituir la grilla temática 2/3 + 1/3 por una **grilla de widgets que use todo el ancho**. Dos enfoques válidos:
  - **Opción A — Masonry por columnas CSS (recomendada):** envolver los widgets en `columns-1 sm:columns-2 xl:columns-3 gap-6` con cada widget en `break-inside-avoid mb-6`. Rellena densamente el ancho respetando alturas dispares (estilo Pinterest), que es exactamente "ver todo de un vistazo".
  - **Opción B — Grid auto-fit:** `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-start`. Más simple y predecible; deja huecos por alturas dispares pero nunca una columna vacía.
- **Jerarquía sugerida del home:** (1) banda de bienvenida full-width (DASH-002), (2) `QuickActions` full-width, (3) `DidYouKnow` como tira full-width o primera celda destacada, (4) **grilla de widgets** (Horóscopo, Chino, Numerología, Calendario, Rituales, Servicios, Stats), (5) `UpgradeBanner` full-width al pie (solo FREE).
- Los gates por plan se conservan: `StatsSection` solo PREMIUM, `UpgradeBanner` solo no-PREMIUM, `MyServicesWidget` se oculta si no hay compras. La grilla debe rellenar bien **con y sin** esos widgets.
- No romper los tests existentes de `UserDashboard` ni de los widgets; ajustar los que asuman el layout de 2 columnas.

---

### DASH-002: Home Sin Identidad de Marca — Cabecera Plana, Sin Banda Mística ni Ilustración

**Severidad:** 🟠 Alta
**Módulo:** [WelcomeHeader.tsx](frontend/src/components/features/dashboard/WelcomeHeader.tsx) + [UserDashboard.tsx](frontend/src/components/features/dashboard/UserDashboard.tsx)
**Reportado por:** Ariel — "podría embellecerse como en la enciclopedia, tener alguna ilustración" (30/06/2026).

#### Descripción del Problema

El home autenticado es un tablero **blanco plano**: la bienvenida es una fila de texto (`¡Hola, {nombre}!` + badge + "Ver perfil") sin atmósfera, sin la banda noche/dorada que sí tiene la Enciclopedia (`ArticleHero`, hub). No hay ninguna ilustración ni acento visual de marca en toda la página.

#### Causa Raíz Identificada

[WelcomeHeader.tsx:27-41](frontend/src/components/features/dashboard/WelcomeHeader.tsx#L27-L41) renderiza un `div` flex plano con grises hardcodeados y clases `dark:` muertas (el proyecto es **light-mode only**):

```tsx
<div className="flex items-center justify-between">
  <h1 className="font-serif text-3xl font-bold">¡Hola, {displayName}!</h1>
  <PlanBadge plan={plan} />
  <Link className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 ...">Ver perfil</Link>
</div>
```

No reutiliza el canon de la Enciclopedia (`HERO_GRADIENT`, estrellas `animate-twinkle`, luna creciente CSS, filete dorado, Cormorant sobre fondo oscuro).

#### Criterios de Aceptación

1. **Dado** que entro al home autenticado
   **Cuando** carga la cabecera
   **Entonces** veo una **banda de bienvenida mística** (gradiente noche `#1a0a2e → #2d1b69`, estrellas, luna creciente, filete dorado) con el saludo en Cormorant crema y el `PlanBadge`, coherente con `ArticleHero`/hub de la Enciclopedia.

2. **Dado** el plan del usuario
   **Cuando** se renderiza la banda
   **Entonces** se refleja con un acento (p. ej. badge dorado para Premium) sin romper contraste AA.

3. **Dado** el conjunto del home
   **Cuando** lo recorro
   **Entonces** hay al menos **una ilustración/recurso visual de marca** (en la banda y/o empty states) que aporta atmósfera, coherente con la paleta violeta/índigo/dorado.

#### Notas Técnicas

- Crear `DashboardHero` (o evolucionar `WelcomeHeader`) reutilizando el patrón exacto de `ArticleHero`: `const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)'`, estrellas `animate-twinkle bg-amber-200/80`, luna `boxShadow: 'inset -18px -6px 0 0 #d69e2e'`, filete `linear-gradient(90deg, transparent, #d69e2e, transparent)`.
- Saludo en `font-serif` color `#f9f7f2`; texto secundario con `text-on-dark-muted`. Opcional: subtítulo contextual ("Tu universo místico de hoy").
- Imagen/ilustración temática opcional como capa de fondo con overlay de legibilidad (ver `IMAGE_OVERLAY` de `ArticleHero`); fallback al gradiente puro si no hay asset (DASH-004).
- Eliminar las clases `dark:` muertas y los grises hardcodeados (relacionado con DASH-003).
- Tokens ya existen en `globals.css`: `--color-bg-hero`, `--color-bg-hero-mid`, `--color-text-on-dark`, `--color-secondary`, etc. No agregar tokens nuevos salvo necesidad.

---

### DASH-003: Inconsistencia Visual Entre Widgets

**Severidad:** 🟡 Media
**Módulo:** widgets bajo `frontend/src/components/features/` (dashboard, horoscope, chinese-horoscope, numerology)
**Reportado por:** Análisis de consistencia (30/06/2026).

#### Descripción del Problema

Los widgets no comparten un tratamiento de tarjeta común: algunos usan `font-serif` en el título y otros no ([NumerologyWidget.tsx](frontend/src/components/features/numerology/NumerologyWidget.tsx) y [UpgradeBanner.tsx](frontend/src/components/features/readings/UpgradeBanner.tsx) usan sans), conviven grises/colores hardcodeados (`gray-200`, `purple-100`, `amber-100`) con tokens de marca, y persisten clases `dark:` muertas. El conjunto se ve como piezas sueltas, no como un sistema.

#### Causa Raíz Identificada

Cada widget se construyó por separado con la primitiva `Card` de shadcn y estilos ad-hoc. No hay un encabezado de widget común (ícono + título Cormorant + acento dorado) ni un contenedor de marca compartido. Inventario detallado: títulos serif presentes en Horóscopo/Chino/Calendario/Servicios/Stats/Sabías-que pero **ausentes** en Numerología y UpgradeBanner; colores de estado y de acento hardcodeados en varios.

#### Criterios de Aceptación

1. **Dado** dos widgets cualesquiera del home
   **Cuando** los comparo
   **Entonces** comparten el mismo tratamiento de tarjeta (radio, borde/realce, encabezado con ícono + título Cormorant, acento dorado) y la misma escala tipográfica.

2. **Dado** el código de los widgets
   **Cuando** se audita
   **Entonces** no quedan clases `dark:` (light-mode only) ni grises de marca hardcodeados donde exista un token (`text-text-primary`, `text-text-muted`, `secondary`, `primary`).

#### Notas Técnicas

- Introducir un componente contenedor común (`DashboardCard` o `WidgetCard`) con encabezado estandarizado (slot de ícono, título `font-serif`, acción opcional "Ver más/Ver todo") y, opcionalmente, un filete dorado sutil — coherente con el canon de la Enciclopedia.
- Normalizar `NumerologyWidget` y `UpgradeBanner` para usar `font-serif` en títulos.
- Reemplazar grises/acentos hardcodeados por tokens (`--color-text-primary`, `--color-text-muted`, `--color-primary`, `--color-secondary`). Conservar los colores **semánticos** de estados (verde confirmado, ámbar pendiente, etc.).
- Cambio acotado a estilos; **no** alterar lógica de datos (hooks React Query) ni `data-testid`.

---

### DASH-004: Sin Assets ni Ilustraciones de Marca para el Dashboard

**Severidad:** 🟠 Alta (habilita DASH-002 y DASH-005)
**Módulo:** `frontend/public/images/dashboard/` (nuevo) + assets
**Reportado por:** Ariel — "podría tener alguna ilustración" (30/06/2026).

#### Descripción del Problema

No existe ningún asset visual pensado para el home autenticado. La Enciclopedia ya tiene un set rico (`public/images/enciclopedia/*.webp`, 54 imágenes), pero el dashboard no reutiliza nada ni tiene material propio (ilustración de cabecera, ilustraciones para empty states).

#### Criterios de Aceptación

1. **Dado** el rediseño del home
   **Cuando** se integran imágenes
   **Entonces** existe un set mínimo en `frontend/public/images/dashboard/` (cabecera + 1–2 ilustraciones para empty states), en **WebP** optimizado, coherente con el canon (violeta/índigo + dorado, etéreo, `no text`).

2. **Dado** cada imagen
   **Cuando** se usa
   **Entonces** tiene `alt` descriptivo en español (o `alt=""` + `aria-hidden` si es puramente decorativa).

#### Notas Técnicas

- Reutilizar la **fórmula de prompts** de `FEEDBACK_ENCICLOPEDIA_DISENO.md §5–6` y el flujo de optimización de `frontend/docs/IMAGE_OPTIMIZATION.md` (WebP, calidad ~80, sin metadata).
- Set sugerido: `dashboard-hero.webp` (banda de bienvenida), `empty-calendar.webp` / `empty-rituals.webp` (estados vacíos). Posibilidad de **reaprovechar** assets existentes de la Enciclopedia antes de generar nuevos.
- Mantener peso bajo (la banda puede funcionar solo con gradiente si la imagen no aterriza — fallback elegante, como `ArticleHero`).

---

### DASH-005: Empty States Pobres en Widgets Sin Datos

**Severidad:** 🟡 Media
**Módulo:** [SacredEventsWidget.tsx](frontend/src/components/features/dashboard/SacredEventsWidget.tsx), [PersonalizedRitualsWidget.tsx](frontend/src/components/features/dashboard/PersonalizedRitualsWidget.tsx), [HoroscopeWidget.tsx](frontend/src/components/features/horoscope/HoroscopeWidget.tsx), [NumerologyWidget.tsx](frontend/src/components/features/numerology/NumerologyWidget.tsx)
**Reportado por:** Análisis + evidencia Playwright (30/06/2026).

#### Descripción del Problema

En las sesiones de prueba, varios widgets caen en **estados vacíos solo-texto**: "Sin eventos próximos", "Configura tu fecha de nacimiento para ver tu horóscopo", "Realiza algunas lecturas más…". Sin ilustración ni jerarquía, refuerzan la sensación de tablero vacío (visible sobre todo en FREE, que aún no configuró su perfil).

#### Criterios de Aceptación

1. **Dado** un widget sin datos
   **Cuando** muestra su empty state
   **Entonces** presenta una pequeña **ilustración/ícono de marca** + mensaje + CTA claro (p. ej. "Configurar fecha → /perfil"), coherente con el sistema.

2. **Dado** el empty state
   **Cuando** hay una acción
   **Entonces** el CTA es accesible (foco visible) y consistente con los demás widgets.

#### Notas Técnicas

- Estandarizar un sub-componente de empty state (ícono/ilustración + título + texto + CTA), reutilizable por los widgets.
- Usar assets de DASH-004 o íconos Lucide con acento dorado cuando no haya ilustración.
- No cambiar las condiciones de negocio de los estados (loading/error/empty ya existen), solo su presentación.

---

### DASH-006: Sin Micro-interacciones ni Reveal Escalonado

**Severidad:** 🟢 Baja (pulido)
**Módulo:** widgets del dashboard + `UserDashboard`
**Reportado por:** Análisis de consistencia (30/06/2026).

#### Descripción del Problema

El home es estático: los widgets no tienen hover de marca (lift + glow dorado) ni aparición escalonada al entrar en viewport. La Enciclopedia ya tiene `Reveal` y un sistema de hover coherente; el dashboard no los usa.

#### Criterios de Aceptación

1. **Dado** que cargo el home
   **Cuando** entran los widgets en viewport
   **Entonces** aparecen con un **reveal fade-up escalonado** sutil (respetando `prefers-reduced-motion`).

2. **Dado** que paso el mouse por un widget interactivo
   **Cuando** hago hover
   **Entonces** hay una micro-interacción coherente (elevación + glow dorado suave), sin afectar legibilidad ni performance.

#### Notas Técnicas

- Reutilizar `Reveal` (`features/encyclopedia/Reveal.tsx`) y el hook `useReducedMotion` (`hooks/utils/useReducedMotion.ts`) — evaluar moverlos a una ubicación compartida (`components/common/` o `features/common/`) para no acoplar dashboard ↔ encyclopedia.
- Hover: `hover:-translate-y-1` + `hover:shadow-[0_18px_40px_-12px_rgba(214,158,46,0.45)]` (mismo patrón que `SectionCard` del hub).
- Stagger por índice (`index` prop), tope de pasos (ya implementado en `Reveal`).

---

### DASH-007: Accesibilidad del Home Rediseñado

**Severidad:** 🟡 Media
**Módulo:** transversal (banda de bienvenida, tarjetas, empty states)
**Reportado por:** Política de accesibilidad del proyecto (AA), análogo a T-ENC-009.

#### Descripción del Problema

El rediseño introduce fondo oscuro (banda) e imágenes; hay que garantizar contraste AA del texto sobre la banda, `alt` en imágenes nuevas, foco visible en CTAs/links y respeto a `prefers-reduced-motion`.

#### Criterios de Aceptación

1. **Dado** texto sobre la banda oscura
   **Cuando** se mide el contraste
   **Entonces** cumple WCAG AA (texto crema `#f9f7f2` sobre gradiente noche ≈ 7.5:1; chips dorados con texto noche `#1a0a2e`, no blanco).

2. **Dado** las imágenes y elementos interactivos nuevos
   **Cuando** se navegan
   **Entonces** tienen `alt` adecuado y **foco visible** (`focus-visible:ring-secondary`), y las animaciones se neutralizan con movimiento reducido.

#### Notas Técnicas

- Replicar las decisiones de contraste de T-ENC-009 (chips dorados con `text-[#1a0a2e]`, no `text-secondary-foreground` blanco).
- Verificar ratios con la fórmula de luminancia WCAG; añadir tests que fijen el contrato de `alt`/foco.

---

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** serie `T-DASH-XXX` propia de este backlog.
> Estimación en puntos de historia (1 punto ≈ 0.5 día). Todas las tareas son frontend salvo indicación.
> Cada tarea se ejecuta siguiendo `docs/WORKFLOW_FRONTEND.md` (TDD, ciclo de calidad y PR a `develop`).

### Índice de Tareas Técnicas

| ID         | Tarea                                                                       | Tipo     | Prioridad  | Estimación |
| ---------- | --------------------------------------------------------------------------- | -------- | ---------- | ---------- |
| T-DASH-001 | Reestructurar el layout a grilla de widgets full-width (masonry/auto-fit)   | Frontend | 🔴 Crítica | 3 pts      |
| T-DASH-002 | Banda de bienvenida mística (`DashboardHero`) reutilizando el canon         | Frontend | 🟠 Alta    | 2.5 pts    |
| T-DASH-003 | Tarjeta de widget común + normalización de tokens (quitar `dark:`/grises)   | Frontend | 🟡 Media   | 2.5 pts    |
| T-DASH-004 | Generación y optimización de assets del dashboard (WebP)                    | Assets   | 🟠 Alta    | 2 pts      |
| T-DASH-005 | Empty states ilustrados y consistentes                                      | Frontend | 🟡 Media   | 2 pts      |
| T-DASH-006 | Micro-interacciones + `Reveal` escalonado (componentes compartidos)         | Frontend | 🟢 Baja    | 1.5 pts    |
| T-DASH-007 | Accesibilidad del home (AA en banda, `alt`, foco, reduced-motion)           | Frontend | 🟡 Media   | 1.5 pts    |

**Estimación total:** ~15 puntos.

---

## TAREAS DETALLADAS

### T-DASH-001: Grilla de Widgets Full-Width

**Prioridad:** 🔴 Crítica
**Estimación:** 3 puntos
**Dependencias:** ninguna
**Cubre Hallazgo:** DASH-001
**Estado:** ✅ Completada (rama `feature/T-DASH-001-grilla-widgets-full-width`)

#### 📋 Descripción

Reemplazar el layout 2/3 + 1/3 de `UserDashboard` por una distribución que use **todo el ancho**, de modo que los widgets se vean "de un vistazo" y no se apilen en una columna estrecha con un vacío al lado.

#### ✅ Tareas específicas

- [x] Sustituir la grilla temática por una **grilla de widgets responsiva**. **Decisión: Opción B** (`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 items-start gap-6`) en vez de la masonry CSS de la Opción A, por ser predecible, conservar el orden DOM = orden visual (mejor accesibilidad/lectura) y ser testeable de forma estable. Documentado en el JSDoc de `UserDashboard`.
- [x] Reordenar la jerarquía: `WelcomeHeader` → `QuickActions` full-width → `DidYouKnow` (tira full-width) → grilla de widgets → `UpgradeBanner` full-width (solo FREE). (La banda mística de bienvenida queda para T-DASH-002.)
- [x] Conservar gates por plan (`StatsSection` premium, `UpgradeBanner` no-premium, `MyServicesWidget` oculto sin compras); la grilla rellena bien con y sin ellos.
- [x] Responsive: 1 col mobile, 2 col tablet (`sm`), 3 col desktop (`xl`), sin columna vacía.
- [x] Tests de `UserDashboard`: añadidos 2 tests de contrato (`data-testid="dashboard-widget-grid"` con clases `grid-cols-1`/`xl:grid-cols-3`, widgets dentro de la grilla; `StatsSection` dentro de la grilla en premium). 15/15 tests del archivo en verde; no se rompió ninguno existente.

#### 📝 Notas de implementación

- El cambio es **puramente estructural** (contenedor + reordenamiento de JSX): no se tocó la lógica de datos, hooks ni `data-testid` de los widgets.
- `MyServicesWidget` pasó a la grilla; como se auto-oculta (devuelve `null`) cuando no hay compras, simplemente libera su celda sin dejar un hueco "vacío con borde".
- **Verificación visual con Playwright** (sesiones reales `free@test.com` / `premium@test.com`, build de producción en `localhost:3001`): el vacío blanco lateral desapareció; en PREMIUM la página pasó de ~2.046 px a ~1.290 px de alto con los 6 widgets visibles en una grilla 3×2; en FREE los 5 widgets se distribuyen en 3 columnas con el banner de upgrade full-width al pie.
- Ciclo de calidad frontend completo en verde: `format`, `lint:fix` (0 errores), `type-check`, `test:run` (403 archivos / 5017 tests), `build` y `validate-architecture.js`.

#### 🎯 Criterios de Aceptación

- Los widgets ocupan el ancho disponible; sin columna casi vacía ni tira angosta desbordando hacia abajo.
- FREE y PREMIUM se ven equilibrados.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/dashboard/UserDashboard.tsx`
- `frontend/src/components/features/dashboard/UserDashboard.test.tsx`

---

### T-DASH-002: Banda de Bienvenida Mística (`DashboardHero`)

**Prioridad:** 🟠 Alta
**Estimación:** 2.5 puntos
**Dependencias:** T-DASH-004 (asset opcional; con fallback a gradiente puede ir antes)
**Cubre Hallazgo:** DASH-002
**Estado:** ✅ Completada (rama `feature/T-DASH-002-dashboard-hero-mistico`)

#### ✅ Tareas específicas

- [x] Crear `DashboardHero` (o evolucionar `WelcomeHeader`) con `HERO_GRADIENT`, estrellas `animate-twinkle`, luna creciente CSS y filete dorado, reutilizando el patrón de `ArticleHero`. (Se creó `DashboardHero` nuevo y se retiró el `WelcomeHeader` huérfano.)
- [x] Saludo `¡Hola, {nombre}!` en Cormorant crema + `PlanBadge` + acceso a perfil; subtítulo contextual opcional (prop `subtitle`).
- [x] Capa de imagen opcional con overlay de legibilidad y **fallback** al gradiente si no hay asset (prop `image`; sin asset → solo gradiente).
- [x] Eliminar clases `dark:` y grises hardcodeados de la cabecera (colores crema/dorado vía constantes del canon).
- [x] Tests (saludo, fallback de nombre, badge por plan, foco visible del link de perfil, alt si hay imagen, fallback a gradiente).
- [x] Coverage ≥ 80% (`DashboardHero.tsx`: 100% stmts/branch/funcs/lines).

#### 🎯 Criterios de Aceptación

- La cabecera del home usa la banda mística coherente con la Enciclopedia.
- Contraste AA del texto sobre la banda.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/dashboard/WelcomeHeader.tsx` (o nuevo `DashboardHero.tsx`)
- tests correspondientes

---

### T-DASH-003: Tarjeta de Widget Común + Normalización de Tokens

**Prioridad:** 🟡 Media
**Estimación:** 2.5 puntos
**Dependencias:** ninguna (idealmente antes de T-DASH-006)
**Cubre Hallazgo:** DASH-003
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Crear `DashboardCard`/`WidgetCard` con encabezado estandarizado (ícono + título `font-serif` + acción opcional) y tratamiento de marca coherente.
- [ ] Migrar los widgets a ese contenedor sin alterar su lógica de datos ni `data-testid`.
- [ ] Normalizar `NumerologyWidget` y `UpgradeBanner` a `font-serif` en títulos.
- [ ] Reemplazar grises/acentos hardcodeados por tokens; quitar todas las clases `dark:` del dashboard.
- [ ] Tests de regresión visual mínima (encabezado, título serif, tokens) por widget tocado.
- [ ] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Los widgets comparten tratamiento y tipografía; sin `dark:` ni grises de marca hardcodeados.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/dashboard/*` y widgets de `horoscope/`, `chinese-horoscope/`, `numerology/`, `readings/UpgradeBanner.tsx`
- nuevo componente común + tests

---

### T-DASH-004: Generación y Optimización de Assets del Dashboard

**Prioridad:** 🟠 Alta
**Estimación:** 2 puntos
**Dependencias:** ninguna (habilita DASH-002/005)
**Cubre Hallazgo:** DASH-004
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Generar set mínimo (`dashboard-hero.webp`, `empty-calendar.webp`, `empty-rituals.webp`) con la fórmula de prompts del canon (violeta/índigo + dorado, etéreo, `no text`).
- [ ] Evaluar reaprovechar assets existentes de `public/images/enciclopedia/` antes de generar nuevos.
- [ ] Exportar a WebP optimizado en `frontend/public/images/dashboard/`; `alt` en español por imagen.
- [ ] Seguir `frontend/docs/IMAGE_OPTIMIZATION.md`.

#### 🎯 Criterios de Aceptación

- Set disponible y optimizado, consistente con la marca; cada imagen con `alt`.

#### 📁 Archivos involucrados

- `frontend/public/images/dashboard/*` (nuevos)

---

### T-DASH-005: Empty States Ilustrados y Consistentes

**Prioridad:** 🟡 Media
**Estimación:** 2 puntos
**Dependencias:** T-DASH-003, T-DASH-004
**Cubre Hallazgo:** DASH-005
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Sub-componente de empty state reutilizable (ilustración/ícono + título + texto + CTA).
- [ ] Aplicarlo en Calendario Sagrado, Rituales, Horóscopo (sin fecha) y Numerología (sin perfil).
- [ ] Conservar condiciones de negocio (loading/error/empty) y CTAs existentes.
- [ ] Tests (render del empty state + CTA con href correcto + foco).
- [ ] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Los estados vacíos se ven cuidados y consistentes, con CTA claro y accesible.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- widgets afectados + nuevo sub-componente de empty state + tests

---

### T-DASH-006: Micro-interacciones + `Reveal` Escalonado

**Prioridad:** 🟢 Baja
**Estimación:** 1.5 puntos
**Dependencias:** T-DASH-001, T-DASH-003
**Cubre Hallazgo:** DASH-006
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Reutilizar `Reveal` + `useReducedMotion` (evaluar moverlos a ubicación compartida) para fade-up escalonado de los widgets.
- [ ] Hover de marca (lift + glow dorado) en widgets interactivos.
- [ ] Respetar `prefers-reduced-motion` (aparición inmediata, sin animaciones en bucle).
- [ ] Tests donde aplique / verificación visual.
- [ ] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Animaciones sutiles y performantes que respetan `prefers-reduced-motion`.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `UserDashboard` + widgets; posible relocalización de `Reveal`/`useReducedMotion`

---

### T-DASH-007: Accesibilidad del Home

**Prioridad:** 🟡 Media
**Estimación:** 1.5 puntos
**Dependencias:** T-DASH-002, T-DASH-005
**Cubre Hallazgo:** DASH-007
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Contraste AA del texto sobre la banda; chips dorados con texto noche (`#1a0a2e`).
- [ ] `alt` en imágenes nuevas; foco visible en CTAs/links del home.
- [ ] Verificación con fórmula de contraste WCAG; tests que fijen contrato de `alt`/foco/contraste.
- [ ] Coverage ≥ 80% donde aplique.

#### 🎯 Criterios de Aceptación

- Texto sobre fondos oscuros cumple AA; imágenes con `alt`; foco visible; movimiento reducido respetado.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- banda de bienvenida, tarjetas, empty states + tests

---

## ORDEN DE EJECUCIÓN SUGERIDO

1. **T-DASH-001** (fix de layout — mayor impacto, resuelve el problema principal reportado).
2. **T-DASH-004** (assets — habilita el embellecimiento visual).
3. **T-DASH-002** (banda de bienvenida mística).
4. **T-DASH-003** (tarjeta común + tokens).
5. **T-DASH-005** (empty states ilustrados).
6. **T-DASH-006** (micro-interacciones) y **T-DASH-007** (a11y) como pulido final.

---

> **Nota:** este backlog deriva de un análisis de consistencia con el rediseño de la Enciclopedia (`BACKLOG_ENCICLOPEDIA_REDISENO_2026_05.md`) y de evidencia visual capturada con Playwright sobre `free@test.com` y `premium@test.com`. Reutiliza el canon visual existente (tokens de `globals.css`, patrón `ArticleHero`, `Reveal`, hover de `SectionCard`) para garantizar coherencia de marca.
