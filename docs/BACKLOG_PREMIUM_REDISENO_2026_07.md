# BACKLOG: REDISEÑO DEL CIRCUITO PREMIUM Y CONSISTENCIA DE MARCA — Julio 2026

## PARTE A: REPORTE DE HALLAZGOS DE DISEÑO

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Rediseño de UX/UI de la página **`/premium`** (y páginas hermanas) + auditoría transversal de consistencia de marca
**Versión:** 1.0
**Fecha:** 2 de julio de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)
**Verificación visual:** Playwright sobre el entorno local (`localhost:3001`), en esquema de color **oscuro** y **claro** (viewport 1440×900).
**Canon visual de referencia:** rediseño de la Enciclopedia (`BACKLOG_ENCICLOPEDIA_REDISENO_2026_05.md`, `FEEDBACK_ENCICLOPEDIA_DISENO.md`) y del Dashboard (`BACKLOG_DASHBOARD_REDISENO_2026_06.md`) + tokens de `globals.css`.
**Convención de IDs:** se inicia una nueva serie `PREM-XXX` / `T-PREM-XXX` propia de este backlog.

---

## CONTEXTO

Ariel reportó que la página **`/premium`** es "un completo desastre": colores que no acompañan al rediseño del Dashboard ni de la Enciclopedia, y **texto claro sobre fondo claro** que impide leer la información (no se puede verificar si la comparativa de planes es correcta). Se pidió, además, un **barrido de consistencia** sobre el resto de páginas para detectar dónde se rompe el lenguaje de marca.

La verificación con Playwright confirmó **dos problemas de raíz distintos pero superpuestos**:

1. **Bug funcional de "modo oscuro fantasma" (contraste).** La app es **light-only** (`globals.css`: _"Mode: Light only (NO dark mode)"_, sin `.dark` ni tokens oscuros), pero varios componentes usan variantes Tailwind **`dark:`** que, sin estrategia de dark mode configurada, responden a **`prefers-color-scheme: dark`** del sistema operativo. En un SO en modo oscuro (el de Ariel), el texto salta a blanco/claro mientras el fondo del `body` sigue crema → **texto claro sobre fondo claro**.
2. **Inconsistencia de marca.** `/premium` (y otras páginas de "borde": auth, contacto, modales) están construidas con **paleta cruda `purple-*` + `gray-*`** (violeta eléctrico), sin la banda mística noche/dorado, sin Cormorant en cabecera, sin acentos dorados, sin `Reveal` ni el tratamiento de tarjeta del canon. No se leen como el mismo producto que el Dashboard/Enciclopedia.

### Evidencia visual capturada (Playwright)

**Contraste efectivo en `/premium` (fórmula de luminancia WCAG), esquema OSCURO:**

| Elemento | Color de texto | Fondo | Ratio | Estado |
| -------- | -------------- | ----- | ----- | ------ |
| `h2` "¿Qué plan se adapta a ti?" | `#ffffff` | `#f9f7f2` (crema) | **1.07:1** | 🔴 Ilegible |
| `h3` de FAQ (preguntas) | `#ffffff` | `#f9f7f2` | **1.07:1** | 🔴 Ilegible |
| Filas de la tabla comparativa (`td`) | gris muy claro | `#f9f7f2` | **≈1.1:1** | 🔴 Ilegible |
| Badge "Plan Premium" | claro | claro | **1.02:1** | 🔴 Ilegible |

> En esquema **claro** los mismos elementos dan 20–6500:1 (perfecto). El defecto **solo** se manifiesta con el SO en modo oscuro — exactamente el entorno de Ariel, de ahí "no puedo leer la info".

**Barrido de consistencia (nº de elementos con contraste <2:1 en esquema oscuro):**

| Ruta | Elementos <2:1 | Observación |
| ---- | --------------- | ----------- |
| `/premium` | varios (h1/h2/h3/tabla/FAQ) | 🔴 Peor caso: paleta púrpura + `dark:` |
| `/premium/activacion` | **17** | 🔴 Hermana de `/premium`, mismos defectos |
| `/registro` | 1 (navbar) | 🟡 Contraste OK; **paleta off-canon** (título/CTA púrpura) |
| `/login` | 1 (navbar) | 🟡 Igual que registro |
| `/contacto` | 1 (navbar) | 🟡 Contraste OK; **paleta off-canon** (CTA/nota púrpura) |
| `/servicios` | 1 (navbar) | 🟡 Revisar acentos púrpura |

**Inventario de uso de `dark:` (causa raíz del bug de contraste), por nº de ocurrencias:**

| Archivo | Ocurrencias | Severidad |
| ------- | ----------- | --------- |
| `components/features/premium/PremiumPage.tsx` | 39 | 🔴 |
| `components/features/premium/ActivationPage.tsx` | 12 | 🔴 |
| `app/registro/page.tsx` | 6 | 🟠 |
| `components/features/notifications/NotificationItem.tsx` | 5 | 🟠 |
| `components/features/notifications/NotificationDropdown.tsx` | 3 | 🟠 |
| `components/features/horoscope/HoroscopeAreaCard.tsx` | 3 | 🟡 (bg dark:) |
| `components/features/onboarding/WelcomeModal.tsx` | 2 | 🟡 (+ púrpura) |
| `components/features/conversion/PremiumUpgradePrompt.tsx` | 2 | 🟡 (+ púrpura) |
| `components/features/daily-reading/DailyReadingCard.tsx` | 1 | 🟡 (`prose dark:prose-invert`) |
| `components/features/conversion/LimitReachedModal.tsx` | 1 | 🟡 |
| `components/features/birth-chart/AISynthesis/AISynthesis.tsx` | 1 | 🟡 (`prose dark:prose-invert`) |

> `dashboard/WidgetCard.tsx` y `globals.css` aparecen en el grep pero son **falsos positivos** (la palabra "dark" está en un comentario / en nombres de token como `--color-bg-section-dark`).

---

## ÍNDICE DE HALLAZGOS

| ID | Hallazgo | Severidad | Módulo afectado |
| -------- | ----------------------------------------------------------------------------------- | ---------- | ---------------------------------------- |
| PREM-001 | "Modo oscuro fantasma": variantes `dark:` en app light-only → texto claro sobre fondo claro | 🔴 Crítica | Frontend — transversal (11 archivos) |
| PREM-002 | `/premium` sin identidad de marca: paleta púrpura/gris, sin banda mística ni dorado | 🟠 Alta | Frontend — PremiumPage |
| PREM-003 | `/premium/activacion` con los mismos defectos que `/premium` | 🟠 Alta | Frontend — ActivationPage |
| PREM-004 | Sin assets de marca para el circuito premium | 🟠 Alta | Frontend — Assets |
| PREM-005 | Páginas de auth (`/registro`, `/login`) off-canon (título/CTA púrpura, sin atmósfera) | 🟡 Media | Frontend — Auth |
| PREM-006 | `/contacto` off-canon (CTA y caja de nota en púrpura) | 🟡 Media | Frontend — Contacto |
| PREM-007 | Modales de conversión/onboarding off-canon + `dark:` (púrpura, prompts de upgrade) | 🟡 Media | Frontend — Conversion / Onboarding |
| PREM-008 | Restos de contraste en dark OS: `prose dark:prose-invert`, `HoroscopeAreaCard`, navbar "Iniciar sesión" (1.75:1) | 🟢 Baja | Frontend — transversal |

---

## DETALLE DE HALLAZGOS

### PREM-001: "Modo Oscuro Fantasma" — Texto Claro sobre Fondo Claro

**Severidad:** 🔴 Crítica (bloquea la lectura de información en el SO en modo oscuro)
**Módulo:** transversal — 11 archivos con variantes `dark:` (ver inventario)
**Reportado por:** Ariel ("letras claras contra fondo claro, no puedo leer la info") — confirmado por Playwright.

#### Descripción del Problema

La app declara explícitamente **light-only** en `globals.css` y no implementa una estrategia de dark mode (no hay `.dark`, ni `@custom-variant dark`, ni tokens oscuros para `--background`/`--foreground`). Sin embargo, varios componentes conservan variantes **`dark:`** de Tailwind. Como Tailwind, sin configuración, liga `dark:` a **`@media (prefers-color-scheme: dark)`**, en un SO en modo oscuro esas variantes **se activan**: el texto pasa a `dark:text-white`/`dark:text-gray-300` mientras el `body` mantiene su fondo **crema** (`#f9f7f2`) porque no hay token oscuro. Resultado: **blanco sobre crema (1.07:1)** en títulos, FAQ y la tabla comparativa de `/premium`.

#### Causa Raíz Identificada

Ejemplos en [PremiumPage.tsx](frontend/src/components/features/premium/PremiumPage.tsx):

```tsx
<h2 className="… text-gray-900 dark:text-white">¿Qué plan se adapta a ti?</h2>
<td className="… text-gray-700 dark:text-gray-300">{feature.text}</td>
<h3 className="… text-gray-900 dark:text-white">{item.question}</h3>
```

En dark OS, `dark:text-white`/`dark:text-gray-300` ganan, pero el contenedor no tiene fondo oscuro (los gradientes `dark:from-purple-950` son `background-image`, no cubren estas secciones) → el fondo efectivo es el `body` crema.

#### Criterios de Aceptación

1. **Dado** un SO/navegador en modo oscuro
   **Cuando** navego cualquier página de la app
   **Entonces** el texto mantiene contraste AA (no hay texto claro sobre fondo claro): la app se ve **igual** que en modo claro (es light-only por diseño).

2. **Dado** el código
   **Cuando** se audita
   **Entonces** no quedan variantes `dark:` que dependan de `prefers-color-scheme` sin un fondo oscuro fijo que las respalde (o se neutraliza el dark mode a nivel de configuración de Tailwind/CSS).

#### Notas Técnicas

- **Dos enfoques válidos** (a decidir en la tarea):
  - **Opción A — Purga (recomendada):** eliminar las variantes `dark:` de los 11 archivos y usar solo tokens de marca (`text-foreground`, `text-muted-foreground`, `bg-card`, etc.). Es lo que ya hacen Dashboard y Enciclopedia. Explícito y sin sorpresas.
  - **Opción B — Neutralizar el dark mode globalmente:** forzar `color-scheme: light` / definir `@custom-variant dark (&:where(.dark, .dark *))` (estrategia por clase que nunca se activa) para que todas las `dark:` queden inertes. Menos tocar, pero deja "código muerto" `dark:` que puede confundir.
- Preferir **A** para las páginas que además se rediseñan (PREM-002/003/005/006/007); usar **B** como red de seguridad global si se quiere blindar de un plumazo.
- Añadir un **check** (test o lint) que falle si reaparecen `dark:` en `src/` (guardarraíl).

---

### PREM-002: `/premium` Sin Identidad de Marca — Paleta Púrpura/Gris, Cabecera Plana

**Severidad:** 🟠 Alta
**Módulo:** [PremiumPage.tsx](frontend/src/components/features/premium/PremiumPage.tsx)
**Reportado por:** Ariel — "los colores, el diseño… no acompaña al dashboard ni a la enciclopedia".

#### Descripción del Problema

`/premium` está construida con **violeta eléctrico** (`bg-purple-600`, `text-purple-600`, `from-purple-50 to-white`) y **grises** (`text-gray-900`, `border-gray-200`), en lugar del canon: **noche `#1a0a2e`/índigo `#2d1b69` + dorado `#d69e2e`**, crema `#f9f7f2`, Cormorant en cabecera. No hay banda mística (como `DashboardHero`/`ArticleHero`), ni estrellas/luna decorativas, ni filete dorado, ni `Reveal` escalonado, ni el tratamiento de tarjeta común (`WidgetCard`). El hero es un degradé `purple-50 → white` plano; los CTAs son `bg-purple-600` (fuera de la familia de marca).

#### Criterios de Aceptación

1. **Dado** que entro a `/premium`
   **Cuando** carga la página
   **Entonces** presenta una **banda de bienvenida mística** coherente con `DashboardHero`/`ArticleHero` (gradiente noche, imagen opcional con overlay, estrellas/luna, filete dorado, título Cormorant crema).

2. **Dado** las tarjetas de plan y la tabla comparativa
   **Cuando** se muestran
   **Entonces** usan **solo tokens de marca** (sin `purple-*`/`gray-*` crudos): tarjeta Premium destacada con acento dorado, chips dorados con **texto noche** (`text-bg-hero`, no blanco), tabla legible con encabezado noche y filas con `text-foreground`.

3. **Dado** los CTAs ("Comenzar Premium")
   **Cuando** se renderizan
   **Entonces** usan el botón de marca (primario/secundario del sistema), con **foco visible** (`focus-visible:ring-secondary`) y respetan `prefers-reduced-motion`.

#### Notas Técnicas

- Extraer un **`PremiumHero`** (o reutilizar el patrón de `DashboardHero`) con `image` opcional + fallback a gradiente.
- Reutilizar `WidgetCard`/`Card` del canon para las tarjetas de plan; el "Recomendado" como chip dorado con `text-bg-hero`.
- La tabla comparativa: encabezado con fondo noche + texto crema; filas alternas suaves con tokens; check dorado (`text-secondary`) y cruz atenuada (`text-muted-foreground`).
- Envolver secciones en `Reveal` para el fade-up escalonado (coherencia con T-DASH-006/T-ENC-008).
- **No** cambiar el contrato de datos ni la lógica de `usePublicPlans`/`useCreatePreapproval`/gates por plan.

---

### PREM-003: `/premium/activacion` con los Mismos Defectos

**Severidad:** 🟠 Alta
**Módulo:** [ActivationPage.tsx](frontend/src/components/features/premium/ActivationPage.tsx)
**Reportado por:** Barrido Playwright (17 elementos <2:1 en dark OS).

#### Descripción del Problema

La página de activación/confirmación premium comparte la paleta púrpura/gris y 12 variantes `dark:`. Al ser la pantalla que ve el usuario **justo después de pagar**, la mala legibilidad y la incoherencia de marca son especialmente dañinas (momento de máxima expectativa).

#### Criterios de Aceptación

1. **Dado** el flujo de activación
   **Cuando** se muestra el estado (éxito/pendiente/error)
   **Entonces** usa el canon (tokens, dorado, Cormorant, banda si aplica) y cumple AA en cualquier esquema de color.

#### Notas Técnicas

- Alinear con PREM-002 (mismos componentes/patrones de marca).
- Conservar la lógica de activación y los estados existentes; solo cambia la capa visual.

---

### PREM-004: Sin Assets de Marca para el Circuito Premium

**Severidad:** 🟠 Alta (habilita la banda mística de PREM-002/003)
**Módulo:** `frontend/public/images/premium/` (nuevo) + assets
**Reportado por:** Necesidad derivada del rediseño (banda mística).

#### Descripción del Problema

No existe ningún asset visual pensado para el circuito premium. El Dashboard tiene `public/images/dashboard/*` y la Enciclopedia un set rico en `public/images/enciclopedia/*`, pero premium no reutiliza nada ni tiene material propio para su banda.

#### Criterios de Aceptación

1. **Dado** el rediseño de `/premium`
   **Cuando** se integra la banda mística
   **Entonces** existe al menos `premium-hero.webp` (cabecera) en `frontend/public/images/premium/`, en **WebP** optimizado, coherente con el canon (violeta/índigo + dorado, etéreo, `no text`), con **fallback elegante a gradiente** si el asset no carga.

2. **Dado** cada imagen
   **Cuando** se usa
   **Entonces** tiene `alt` descriptivo en español (o `alt=""` + `aria-hidden` si es puramente decorativa).

#### Notas Técnicas — Prompts de Imágenes (fórmula del canon)

> Fórmula base (de `FEEDBACK_ENCICLOPEDIA_DISENO.md §6`): variar **solo el sujeto**.
> `Ethereal digital painting, [SUJETO], fine gold line detail, deep violet and indigo night sky, crescent moon, golden bokeh and stardust, dreamy mystical premium atmosphere, soft haze, cinematic glow, no text, no watermark, [RATIO]`

**Assets propuestos:**

1. **`premium-hero.webp`** (banda de bienvenida, ratio `21:9`)
   `Ethereal digital painting, a radiant golden key unlocking an ornate tarot card adorned with fine gold-line sacred geometry, encircled by a luminous constellation and a crescent moon, deep violet and indigo night sky, golden bokeh and stardust, dreamy mystical premium atmosphere, soft haze, cinematic glow, no text, no watermark, 21:9`

2. **`premium-crown.webp`** _(opcional, acento para la sección de garantía / "Sin compromiso", ratio `4:5` o `1:1`)_
   `Ethereal digital painting, a delicate golden crown floating above an open palm made of stardust, fine gold line detail, deep violet and indigo night sky, crescent moon, golden bokeh, dreamy mystical premium atmosphere, soft haze, no text, no watermark, 1:1`

3. **`premium-activacion.webp`** _(opcional, estado de éxito de activación, ratio `16:9`)_
   `Ethereal digital painting, a blooming golden mandala of light bursting open, fine gold line sacred geometry, deep violet and indigo night sky, crescent moon, golden bokeh and stardust, joyful mystical premium atmosphere, soft haze, cinematic glow, no text, no watermark, 16:9`

**Reglas (idénticas al canon):** siempre `no text`; paleta violeta/índigo + dorado, nunca colores fríos saturados fuera de la familia; exportar **WebP** (calidad ~80, sin metadata) según `frontend/docs/IMAGE_OPTIMIZATION.md`; nombres semánticos en `public/images/premium/`; `alt` en español.

> **Reaprovechamiento:** antes de generar, evaluar si `enciclopedia/tarot-cards.webp` o `hero-bg.webp` ya sirven de fallback para la banda (como hizo el Dashboard).

---

### PREM-005: Páginas de Autenticación Off-Canon

**Severidad:** 🟡 Media
**Módulo:** [registro/page.tsx](frontend/src/app/registro/page.tsx), página de `/login`
**Reportado por:** Barrido Playwright.

#### Descripción del Problema

`/registro` y `/login` son funcionalmente legibles pero **no llevan la marca**: título en púrpura (`text-purple-700`), CTA `Crear Cuenta`/enlaces en `purple-600`, tarjeta blanca plana sobre crema, sin banda mística, sin dorado, sin atmósfera. Es la primera impresión de un usuario nuevo y no comunica identidad. Además, `registro/page.tsx` tiene lógica de UI directamente en `app/` (revisar contra la regla "no lógica en `app/`").

#### Criterios de Aceptación

1. **Dado** `/registro` y `/login`
   **Cuando** cargan
   **Entonces** usan el canon (Cormorant + dorado en título, CTA de marca con foco visible, atmósfera mística sutil), sin `purple-*` crudo.

2. **Dado** `registro/page.tsx`
   **Cuando** se refactoriza
   **Entonces** la lógica vive en un componente de `components/features/auth/` y `app/` solo enruta.

#### Notas Técnicas

- Reutilizar el patrón de banda/atmósfera del canon (una franja mística lateral o superior).
- Alinear con la purga `dark:` de PREM-001.

---

### PREM-006: `/contacto` Off-Canon

**Severidad:** 🟡 Media
**Módulo:** `app/contacto/*` / componente de contacto
**Reportado por:** Barrido Playwright.

#### Descripción del Problema

`/contacto` es legible pero usa CTA `Enviar Mensaje` en `purple-600` y una caja de nota con tinte púrpura, fuera de la paleta de marca. El título Cormorant "Contacto" sí acompaña; el resto no.

#### Criterios de Aceptación

1. **Dado** `/contacto`
   **Cuando** carga
   **Entonces** usa botón/acentos de marca (dorado/primario del sistema) y tokens; la caja de nota usa un estilo de callout del canon.

---

### PREM-007: Modales de Conversión y Onboarding Off-Canon

**Severidad:** 🟡 Media
**Módulo:** [PremiumUpgradePrompt.tsx](frontend/src/components/features/conversion/PremiumUpgradePrompt.tsx), [LimitReachedModal.tsx](frontend/src/components/features/conversion/LimitReachedModal.tsx), [WelcomeModal.tsx](frontend/src/components/features/onboarding/WelcomeModal.tsx)
**Reportado por:** Inventario `dark:` + revisión de paleta.

#### Descripción del Problema

Los prompts de upgrade y el modal de bienvenida usan `text-purple-600/700 dark:text-purple-400` y acentos púrpura. Son puntos de conversión de alto impacto (empujan a premium), por lo que deben lucir premium y de marca.

#### Criterios de Aceptación

1. **Dado** cada modal/prompt de conversión u onboarding
   **Cuando** se muestra
   **Entonces** usa tokens de marca (dorado como acento premium), sin `purple-*` crudo ni `dark:`, con foco visible y contraste AA.

---

### PREM-008: Restos de Contraste en Modo Oscuro

**Severidad:** 🟢 Baja
**Módulo:** `DailyReadingCard.tsx`, `AISynthesis.tsx` (`prose dark:prose-invert`), `HoroscopeAreaCard.tsx` (bg `dark:`), navbar "Iniciar sesión"
**Reportado por:** Barrido Playwright.

#### Descripción del Problema

- `prose dark:prose-invert`: en dark OS invierte la tipografía de los bloques Markdown (lectura diaria, síntesis de carta astral) → texto claro sobre tarjeta clara.
- `HoroscopeAreaCard`: fondos `dark:bg-rose-950/20` etc. tiñen las tarjetas de área en dark OS, restando contraste.
- Navbar "Iniciar sesión": botón outline con **1.75:1** en dark OS (borderline AA).

#### Criterios de Aceptación

1. **Dado** dark OS
   **Cuando** se ven estos elementos
   **Entonces** todos cumplen AA (se resuelven al purgar `dark:` en PREM-001; el navbar puede necesitar ajuste de tono del botón).

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** serie `T-PREM-XXX` propia de este backlog.
> Estimación en puntos de historia (1 punto ≈ 0.5 día). Todas las tareas son frontend salvo indicación.
> Cada tarea se ejecuta siguiendo `docs/WORKFLOW_FRONTEND.md` (TDD, ciclo de calidad y PR a `develop`).

### Índice de Tareas Técnicas

| ID | Tarea | Tipo | Prioridad | Estimación |
| ---------- | --------------------------------------------------------------------------- | -------- | ---------- | ---------- |
| T-PREM-001 | Erradicar el "modo oscuro fantasma" (purga de `dark:` + guardarraíl) | Frontend | 🔴 Crítica | 2 pts |
| T-PREM-002 | Rediseño de `/premium` al canon (banda mística + tokens + tabla legible) | Frontend | 🟠 Alta | 3.5 pts |
| T-PREM-003 | Rediseño de `/premium/activacion` coherente | Frontend | 🟠 Alta | 2 pts |
| T-PREM-004 | Generación y optimización de assets premium (WebP) | Assets | 🟠 Alta | 1.5 pts |
| T-PREM-005 | Auth (`/registro`, `/login`) al canon + sacar lógica de `app/` | Frontend | 🟡 Media | 2.5 pts |
| T-PREM-006 | `/contacto` al canon | Frontend | 🟡 Media | 1 pt |
| T-PREM-007 | Modales de conversión + onboarding al canon | Frontend | 🟡 Media | 2 pts |
| T-PREM-008 | A11y del circuito premium (contraste AA, foco, reduced-motion, tests) | Frontend | 🟡 Media | 1.5 pts |

---

### T-PREM-001: Erradicar el "Modo Oscuro Fantasma"

**Prioridad:** 🔴 Crítica
**Estimación:** 2 puntos
**Dependencias:** ninguna (habilita al resto)
**Cubre Hallazgo:** PREM-001, PREM-008
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Purgar las variantes `dark:` de los 11 archivos del inventario, reemplazando por tokens de marca (`text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `text-secondary`, etc.).
- [ ] En bloques `prose`: quitar `dark:prose-invert` (o fijar el tema claro).
- [ ] Añadir un **guardarraíl** (test de arquitectura o regla de lint) que falle si reaparece `dark:` en `src/`.
- [ ] (Opcional, red de seguridad) forzar `color-scheme: light` en `globals.css`.
- [ ] Tests que fijen el contrato (sin `dark:` en los componentes tocados).

#### 🎯 Criterios de Aceptación

- La app se ve idéntica en SO claro y oscuro; no hay texto claro sobre fondo claro.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- Los 11 del inventario (PremiumPage, ActivationPage, registro, notifications×2, HoroscopeAreaCard, WelcomeModal, PremiumUpgradePrompt, LimitReachedModal, DailyReadingCard, AISynthesis) + tests + guardarraíl.

---

### T-PREM-002: Rediseño de `/premium` al Canon

**Prioridad:** 🟠 Alta
**Estimación:** 3.5 puntos
**Dependencias:** T-PREM-001, T-PREM-004 (asset opcional; con fallback a gradiente puede ir antes)
**Cubre Hallazgo:** PREM-002
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Banda mística `PremiumHero` (gradiente noche, imagen opcional + overlay, estrellas/luna, filete dorado, título Cormorant crema, subtítulo con precio en dorado).
- [ ] Tarjetas de plan con `Card`/`WidgetCard` del canon; "Recomendado" como chip dorado con `text-bg-hero`.
- [ ] Tabla comparativa legible: encabezado noche + crema, filas con `text-foreground`, check dorado / cruz atenuada.
- [ ] Secciones "Sin compromiso" y FAQ con tokens y (opcional) callouts del canon.
- [ ] CTAs con botón de marca + foco visible; `Reveal` escalonado; `prefers-reduced-motion` respetado.
- [ ] No romper `usePublicPlans`/`useCreatePreapproval`/gates por plan ni los `data-testid` (`cta-hero`, `plan-comparison`, `faq-section`, etc.).

#### 🎯 Criterios de Aceptación

- `/premium` acompaña visualmente al Dashboard/Enciclopedia; contraste AA en cualquier esquema.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `PremiumPage.tsx` (+ test), posible nuevo `PremiumHero.tsx` (+ test).

---

### T-PREM-003: Rediseño de `/premium/activacion`

**Prioridad:** 🟠 Alta
**Estimación:** 2 puntos
**Dependencias:** T-PREM-001, T-PREM-002
**Cubre Hallazgo:** PREM-003
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Alinear estados (éxito/pendiente/error) con el canon (tokens, dorado, Cormorant, banda si aplica).
- [ ] Conservar la lógica de activación y los estados existentes.

#### 🎯 Criterios de Aceptación

- La pantalla post-pago luce premium y de marca; contraste AA.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `ActivationPage.tsx` (+ test).

---

### T-PREM-004: Assets del Circuito Premium

**Prioridad:** 🟠 Alta
**Estimación:** 1.5 puntos
**Dependencias:** ninguna
**Cubre Hallazgo:** PREM-004
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Generar `premium-hero.webp` (y opcionalmente `premium-crown.webp`, `premium-activacion.webp`) con los prompts de PREM-004.
- [ ] Optimizar a WebP (calidad ~80, sin metadata) según `frontend/docs/IMAGE_OPTIMIZATION.md`; guardar en `public/images/premium/`.
- [ ] Definir `alt` en español para cada uso.

#### 🎯 Criterios de Aceptación

- Set mínimo disponible y optimizado, coherente con el canon; fallback a gradiente garantizado.

---

### T-PREM-005: Auth al Canon

**Prioridad:** 🟡 Media
**Estimación:** 2.5 puntos
**Dependencias:** T-PREM-001
**Cubre Hallazgo:** PREM-005
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Rediseñar `/registro` y `/login` con atmósfera mística (Cormorant + dorado, CTA de marca, foco visible), sin `purple-*` crudo.
- [ ] Mover la lógica de `registro/page.tsx` a `components/features/auth/`; `app/` solo enruta.

#### 🎯 Criterios de Aceptación

- Primera impresión de marca coherente; contraste AA; `app/` sin lógica.
- Ciclo de calidad frontend completo pasa.

---

### T-PREM-006: `/contacto` al Canon

**Prioridad:** 🟡 Media
**Estimación:** 1 punto
**Dependencias:** T-PREM-001
**Cubre Hallazgo:** PREM-006
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] CTA y acentos de marca; caja de nota como callout del canon; tokens.

#### 🎯 Criterios de Aceptación

- `/contacto` coherente con la marca; contraste AA.

---

### T-PREM-007: Modales de Conversión y Onboarding al Canon

**Prioridad:** 🟡 Media
**Estimación:** 2 puntos
**Dependencias:** T-PREM-001
**Cubre Hallazgo:** PREM-007
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] `PremiumUpgradePrompt`, `LimitReachedModal`, `WelcomeModal`: reemplazar púrpura por dorado/tokens; foco visible; sin `dark:`.

#### 🎯 Criterios de Aceptación

- Los puntos de conversión lucen premium y de marca; contraste AA.

---

### T-PREM-008: A11y del Circuito Premium

**Prioridad:** 🟡 Media
**Estimación:** 1.5 puntos
**Dependencias:** T-PREM-002, T-PREM-003
**Cubre Hallazgo:** PREM-001, PREM-008 (verificación)
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Verificar contraste AA con la utilidad `lib/utils/contrast.ts` (getContrastRatio/meetsWcagAA, de T-DASH-007): banda, chips dorados con texto noche, tabla, FAQ.
- [ ] Foco visible en CTAs/links; `alt` en imágenes nuevas; `prefers-reduced-motion` respetado.
- [ ] Tests que fijen el contrato de contraste/alt/foco (análogo T-DASH-007).

#### 🎯 Criterios de Aceptación

- Todo el circuito premium cumple AA; imágenes con `alt`; foco visible; movimiento reducido respetado.
- Ciclo de calidad frontend completo pasa.

---

## ORDEN DE EJECUCIÓN SUGERIDO

1. **T-PREM-001** (erradicar `dark:` — resuelve el bug de legibilidad reportado, de mayor impacto y habilita al resto).
2. **T-PREM-004** (assets — habilita la banda mística).
3. **T-PREM-002** (rediseño de `/premium`, el foco del pedido).
4. **T-PREM-003** (activación, hermana de premium).
5. **T-PREM-005** / **T-PREM-006** / **T-PREM-007** (consistencia del resto de bordes: auth, contacto, modales).
6. **T-PREM-008** (a11y del circuito como cierre, reutilizando `contrast.ts`).

---

> **Nota:** este backlog deriva de un análisis de consistencia con los rediseños de Dashboard (`BACKLOG_DASHBOARD_REDISENO_2026_06.md`) y Enciclopedia (`FEEDBACK_ENCICLOPEDIA_DISENO.md`), y de evidencia visual capturada con Playwright sobre `localhost:3001` en esquemas de color claro y oscuro. Reutiliza el canon visual existente (tokens de `globals.css`, patrón `DashboardHero`/`ArticleHero`, `WidgetCard`, `Reveal`, `contrast.ts`) para garantizar coherencia de marca y accesibilidad.
