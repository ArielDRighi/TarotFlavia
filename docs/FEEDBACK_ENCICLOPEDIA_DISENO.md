# 🔮 Feedback de Diseño — Enciclopedia Mística

> **Autor:** Análisis de diseño (skill `frontend-aesthetics`)
> **Fecha:** 31 de mayo de 2026
> **Alcance:** `/enciclopedia`, `/enciclopedia/guias`, `/enciclopedia/guias/[slug]` y artículos de detalle (signos, planetas, elementos, tarot).
> **Objetivo:** Transformar la Enciclopedia de un muro de texto plano a una experiencia editorial inmersiva, coherente con la identidad mística de Auguria.

---

## 1. Resumen ejecutivo

La Enciclopedia tiene **contenido de altísima calidad** pero una **presentación que lo desperdicia**. Hoy se ve como un documento de Word: texto corrido sobre fondo blanco, sin imágenes, sin jerarquía visual real y completamente desconectado del universo visual celeste/dorado que define a la marca (ver `hero-bg.webp`, `birth-chart-promo.webp`, `tarot-cards.webp`).

El problema **no es solo estético**: hay un **bug técnico raíz** que aplana toda la tipografía (ver §2.1). Una vez resuelto, sumado a segmentación visual e imágenes, la Enciclopedia puede convertirse en un activo de marca y SEO de primer nivel.

### Diagnóstico en una frase

> Contenido editorial premium presentado con la jerarquía visual de un `.txt`.

---

## 2. Hallazgos técnicos (causa raíz)

### 2.1. 🔴 CRÍTICO — Las clases `prose` no aplican estilos (títulos planos)

En [ArticleDetailView.tsx](../frontend/src/components/features/encyclopedia/ArticleDetailView.tsx) el contenido Markdown se renderiza así:

```tsx
<div className="prose prose-neutral dark:prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
</div>
```

Pero el proyecto **no tiene instalado `@tailwindcss/typography`** (verificado en [globals.css](../frontend/src/app/globals.css) y `package.json`). En Tailwind v4 esto significa que `prose`, `prose-neutral` y `dark:prose-invert` **no existen como utilidades** → se ignoran silenciosamente.

**Consecuencia:** aunque el Markdown genera `<h1>`, `<h2>`, `<h3>`, `<ul>`, `<strong>` correctamente (confirmado en el árbol de accesibilidad), **todos se ven del mismo tamaño que un párrafo**. Por eso "Guía del Tarot: El Espejo del Alma", "1. ¿Qué es el Tarot?" y el cuerpo se ven idénticos: no hay ritmo ni jerarquía.

> Esta es la causa #1 del "texto difícil de leer". Resolverla sola ya mejora el 60% de la experiencia.

**Opciones de solución:**

- **A (recomendada):** instalar `@tailwindcss/typography` y definir un preset `prose` con los tokens de Auguria (Cormorant para títulos, Lato para cuerpo, lavanda `#805ad5` para enlaces, dorado `#d69e2e` para acentos).
- **B:** crear componentes custom para cada nodo de `ReactMarkdown` (mapeo `components={{ h1, h2, h3, p, ul, strong, blockquote }}`) con clases Tailwind. Da más control editorial (callouts, drop-caps, separadores) y evita una dependencia.

> Recomendación: **Opción B** para los artículos editoriales (guías), porque permite insertar imágenes, callouts y separadores decorativos. La marca lo agradece.

### 2.2. 🟠 "Cartas de Tarot Relacionadas" muestra `#1 #2 … #10`

En la guía de Tarot, la sección de cartas relacionadas renderiza chips crudos con el ID numérico (`#1`, `#2`…). Es confuso y feo. Debe mostrar **miniatura + nombre** de la carta enlazando a `/enciclopedia/tarot/[slug]` (ya existe `CardThumbnail`).

### 2.3. 🟠 Tema claro plano, sin atmósfera

La Enciclopedia usa exclusivamente `bg-main` (crema) y `surface` (blanco) sin ningún uso de los tokens oscuros de marca (`--color-bg-hero #1a0a2e`, `--color-bg-hero-mid #2d1b69`, `--color-secondary-glow`). El resultado es genérico. La marca ya tiene un sistema celeste/dorado precioso que aquí no se aprovecha.

### 2.4. 🟡 Hub con emojis del sistema (🃏 ⭐ 📚)

En [EnciclopediaHubContent.tsx](../frontend/src/components/features/encyclopedia/EnciclopediaHubContent.tsx) las 3 secciones usan emojis nativos. Se ven como un prototipo, rompen con la estética dorada ilustrada y varían según el SO del usuario. Deben ser **ilustraciones/íconos de marca** o imágenes temáticas.

### 2.5. 🟡 `/enciclopedia/guias` aparece sin contenido visible

La lista de guías renderizó solo el header (sin tarjetas) en navegación directa. Verificar el estado de carga/seed; además, hoy las tarjetas de guía ([GuiasContent.tsx](../frontend/src/components/features/encyclopedia/GuiasContent.tsx)) son filas mínimas texto+flecha, sin imagen ni color.

---

## 3. Lineamientos de marca a respetar

Extraídos de los tokens reales ([globals.css](../frontend/src/app/globals.css)) y de las imágenes existentes.

| Elemento            | Valor                                 | Uso                                       |
| ------------------- | ------------------------------------- | ----------------------------------------- |
| Fuente títulos      | **Cormorant Garamond** (`font-serif`) | Display, headings de artículo             |
| Fuente cuerpo       | **Lato** (`font-sans`)                | Párrafos, listas                          |
| Crema papiro        | `#f9f7f2` (`bg-main`)                 | Fondo de lectura                          |
| Superficie          | `#ffffff` (`surface`)                 | Tarjetas                                  |
| Grafito             | `#2d3748` (`text-primary`)            | Texto                                     |
| Gris suave          | `#718096` (`text-muted`)              | Subtítulos, metadatos                     |
| **Lavanda místico** | `#805ad5` (`primary`)                 | Enlaces, acentos, CTA                     |
| **Dorado mate**     | `#d69e2e` (`secondary`)               | Bordes, íconos, filetes decorativos       |
| Noche profunda      | `#1a0a2e` (`bg-hero`)                 | Encabezados inmersivos, héroes de sección |
| Índigo oscuro       | `#2d1b69` (`bg-hero-mid`)             | Gradientes                                |
| Glow dorado         | `rgba(214,158,46,0.25)`               | Resplandores sutiles                      |
| Sombra suave        | `0 4px 20px -2px rgba(128,90,213,.1)` | Tarjetas                                  |

### Estilo visual de imágenes (canon de marca)

De `hero-bg.webp`, `tarot-cards.webp`, `birth-chart-promo.webp`:

- **Pintura digital etérea**, cielo nocturno violeta/índigo profundo.
- **Luz dorada cálida**: luna creciente, estrellas, bokeh, polvo estelar.
- **Línea dorada fina** para símbolos (cartas, rueda zodiacal, geometría sagrada).
- Atmósfera onírica, brumosa, premium. Nada plano ni vectorial duro.
- Para ilustraciones sobre fondo claro (ej. `incense-bg.webp`): **boceto a lápiz fino + detalle dorado**, mucho aire en blanco.

---

## 4. Rediseño propuesto por pantalla

### 4.1. Hub `/enciclopedia`

**Problema:** blanco plano + emojis.

**Propuesta:**

- **Hero de encabezado** con banda oscura `bg-hero → bg-hero-mid` (gradiente), título Cormorant grande en crema, partículas/estrellas sutiles (CSS, sin assets pesados) y un filete dorado.
- **3 tarjetas inmersivas** (Tarot / Astrología / Guías), cada una con **imagen temática** de cabecera (no emoji), overlay degradado oscuro abajo, título dorado y micro-interacción en hover (zoom suave de imagen + glow dorado).
- Layout: mantener grid 3-col en desktop, pero romper la simetría con la tarjeta central ligeramente elevada o con ratio distinto (acento editorial).

**Imágenes a generar (3):**

1. **Tarot** — _Prompt:_ `Ethereal digital painting, three ornate tarot cards with fine gold-line sacred geometry, fanned out, glowing softly against a deep violet and indigo night sky, golden bokeh and stardust, crescent moon glow, mystical premium atmosphere, dreamy haze, no text, 16:9` (alineado con `tarot-cards.webp`).
2. **Astrología** — _Prompt:_ `Ethereal digital painting, luminous golden zodiac wheel with fine line constellations, deep violet indigo cosmic background, crescent moon, scattered stars and golden bokeh, dreamy mystical premium mood, no text, 16:9` (alineado con `hero-bg.webp`).
3. **Guías** — _Prompt:_ `Ethereal digital painting, an open antique grimoire with glowing golden runes rising as light particles, deep violet night sky, crescent moon, soft golden bokeh and stardust, mystical premium atmosphere, dreamy haze, no text, 16:9`.

---

### 4.2. Listado `/enciclopedia/guias`

**Problema:** filas texto+flecha, sin jerarquía ni imagen.

**Propuesta — tarjetas editoriales:**

- Grid 2-col (desktop) / 1-col (mobile).
- Cada tarjeta: **thumbnail temático** (izquierda o cabecera), **título Cormorant**, snippet a 2 líneas, **chip de categoría dorado**, y CTA "Leer guía →" en lavanda.
- Hover: elevación + borde dorado + leve translate.
- Orden ya correcto (Guía del Tarot primero, fix BUG-017).

**Imágenes:** reutilizar las cabeceras de cada guía (§4.3) en formato thumbnail.

---

### 4.3. Artículo de guía `/enciclopedia/guias/[slug]` — _el corazón del rediseño_

**Problema:** muro de texto, sin ritmo, sin imágenes, títulos planos (bug §2.1).

**Estructura editorial propuesta (plantilla para TODAS las guías):**

```
┌─────────────────────────────────────────────┐
│  HERO DE ARTÍCULO (banda oscura bg-hero)     │
│  · Breadcrumb                                 │
│  · Categoría (chip dorado)                    │
│  · Título Cormorant XL en crema               │
│  · Subtítulo/lead (snippet)                   │
│  · Imagen de cabecera temática (overlay)      │
│  · Tiempo de lectura · nº de secciones        │
├─────────────────────────────────────────────┤
│  ÍNDICE / "En esta guía" (TOC anclado)        │
│  Lista de secciones con scroll-spy            │
├─────────────────────────────────────────────┤
│  CUERPO con ritmo:                            │
│   · H2 con número dorado en círculo           │
│   · Drop-cap en el primer párrafo             │
│   · Cada sección con su imagen/ilustración    │
│   · Callouts: "Sabías que…", "Clave"          │
│   · Listas con íconos (palos, tiradas)        │
│   · Separadores decorativos dorados (✦)       │
│   · Tablas estilizadas donde aplique          │
├─────────────────────────────────────────────┤
│  CTA inmersivo (banda oscura + glow)          │
│  Cartas relacionadas (thumb + nombre) §2.2    │
│  Artículos relacionados (tarjetas)            │
└─────────────────────────────────────────────┘
```

**Mejoras transversales de lectura:**

- Ancho de medida ~`max-w-[68ch]` para el cuerpo (legibilidad).
- Interlineado `leading-relaxed`, `text-lg` en cuerpo.
- H2: Cormorant + número en badge dorado circular.
- H3: Cormorant medio + filete dorado corto debajo.
- Primer párrafo de cada gran sección con **drop-cap** (letra capital dorada, Cormorant).
- Reveal escalonado al hacer scroll (fade-up sutil por sección).

---

## 5. Plantilla aplicada: **Guía del Tarot** (ejemplo completo)

Tomando el contenido actual y enriqueciéndolo con segmentos, títulos e imágenes.

### Cabecera (hero)

- **Imagen:** `Ethereal digital painting, three ornate Rider-Waite style tarot cards (The Fool, The World, The Magician) with fine gold-line illustration, glowing on a deep violet indigo cosmic background, golden bokeh, crescent moon, stardust, dreamy mystical premium, no text, 21:9 banner`
- **Lead actual** (ya existe, mantener): "Descubre el antiguo arte adivinatorio del Tarot…"

### Sección 1 — ¿Qué es el Tarot?

- **Título sugerido:** "El Tarot: un mapa del viaje del alma"
- **Imagen (lateral):** `Ethereal pencil-and-gold illustration, a single ornate tarot card emanating golden light, fine line art, soft cream background with subtle violet haze, mystical premium, no text, 4:5` (estilo `incense-bg.webp`).
- **Callout "Clave":** "El Tarot no predice un futuro fijo: ilumina patrones, tendencias y posibilidades."

### Sección 2 — Los 78 Arcanos

- **Título sugerido:** "Los 78 Arcanos: la estructura del Tarot"
- **Bloque visual de 2 columnas:**
  - **Arcanos Mayores (22)** — _Imagen:_ `Ethereal digital painting, a procession of 22 glowing tarot major arcana silhouettes along a golden path under a starry violet sky, crescent moon, fine gold line, dreamy mystical, no text, 16:9`
  - **Arcanos Menores (56)** — bloque de **4 palos con íconos dorados** (🔥 Bastos / 💧 Copas / 🗡 Espadas / ⭐ Pentáculos → reemplazar emojis por **íconos de línea dorada**). _Imagen opcional:_ `Four mystical suit symbols — wand, cup, sword, pentacle — in fine gold line on deep violet background with golden bokeh, elegant, no text, 16:9`.
- Convertir los 4 palos en **tarjetas con ícono + elemento + keywords** (mejor que lista plana).

### Sección 3 — ¿Cómo funciona una lectura?

- **Título:** "Cómo se lee el Tarot"
- **Tres tiradas como tarjetas ilustradas** (Carta del Día / Tres cartas / Cruz Celta), cada una con un diagrama de posición de cartas en línea dorada.
  - _Imagen tiradas:_ `Three tarot spread layouts (single card, three-card line, celtic cross) drawn as elegant fine gold-line diagrams on deep violet background, minimal, no text, 16:9`
- **Callout "Sabías que…":** sobre cartas invertidas (no son negativas).

### Sección 4 — El Tarot como autoconocimiento

- **Título:** "Tarot y autoconocimiento"
- **Imagen:** `Ethereal digital painting, a person meditating with a glowing tarot card floating above their hands, golden light, violet cosmic haze, stars, dreamy introspective mood, no text, 16:9`
- **Cita destacada (blockquote dorado):** referencia a los arquetipos de Jung.

### Sección 5 — Historia breve

- **Título:** "Una breve historia del Tarot"
- **Línea de tiempo visual** (timeline vertical con hitos dorados): s.XV Italia → de Gébelin → Lévi → Waite-Smith 1909.
- **Imagen:** `Ethereal vintage illustration, antique 15th century Italian trionfi tarot cards aged parchment with gold leaf detail, soft candlelight, mystical historical mood, no text, 16:9`

### Cierre

- **CTA inmersivo:** banda oscura + "Calcular mi Carta del Día / Hacer una tirada".
- **Cartas relacionadas:** miniatura real + nombre (fix §2.2).

---

## 6. Guía de prompts de imágenes (para consistencia con IA)

Para que toda imagen generada se sienta de la misma familia que los assets actuales, usar esta **fórmula base** y variar solo el sujeto:

> `Ethereal digital painting, [SUJETO], fine gold line detail, deep violet and indigo night sky, crescent moon, golden bokeh and stardust, dreamy mystical premium atmosphere, soft haze, cinematic glow, no text, no watermark, [RATIO]`

**Variantes según contexto:**

- **Cabeceras de artículo:** ratio `21:9`, sujeto protagonista centrado.
- **Imágenes de sección:** ratio `16:9` o `4:5` (lateral).
- **Sobre fondo claro (crema):** cambiar a → `delicate pencil sketch with fine gold ink accents, on warm cream paper, lots of negative space, elegant, mystical, no text` (estilo `incense-bg.webp`).

**Reglas:**

- Siempre `no text` (los títulos los pone la UI).
- Paleta: violeta/índigo + dorado. **Nunca** colores saturados fríos fuera de la familia.
- Exportar en **WebP** y guardar en `frontend/public/images/enciclopedia/` con nombres semánticos (`guia-tarot-hero.webp`, `tarot-arcanos-mayores.webp`, etc.).
- Definir `alt` descriptivo en español para accesibilidad/SEO.

---

## 7. Backlog de tareas propuesto

> Pendiente de tu aprobación para convertir en tareas formales (TASK-XXX) siguiendo `docs/WORKFLOW_FRONTEND.md`.

| #   | Tipo      | Prioridad | Tarea                                                                                                                                                     |
| --- | --------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🐛 Fix    | 🔴 Alta   | Resolver tipografía de artículos: mapear nodos de `ReactMarkdown` a componentes con tokens de marca (Opción B §2.1) o instalar `@tailwindcss/typography`. |
| 2   | 🐛 Fix    | 🟠 Media  | "Cartas relacionadas": render con miniatura + nombre enlazando al detalle (§2.2).                                                                         |
| 3   | ✨ Feat   | 🟠 Media  | Componente `ArticleHero` (banda oscura + imagen + breadcrumb + lead + meta) para artículos de guía.                                                       |
| 4   | ✨ Feat   | 🟠 Media  | Sistema editorial Markdown: H2 numerado, drop-cap, callouts ("Clave", "Sabías que…"), separadores dorados, blockquote, tablas.                            |
| 5   | ✨ Feat   | 🟡 Media  | TOC "En esta guía" con scroll-spy.                                                                                                                        |
| 6   | 🎨 Design | 🟠 Media  | Rediseño del Hub `/enciclopedia`: hero oscuro + 3 tarjetas con imagen (sin emojis).                                                                       |
| 7   | 🎨 Design | 🟡 Media  | Rediseño tarjetas de `/enciclopedia/guias` (editorial con thumbnail).                                                                                     |
| 8   | 🖼️ Assets | 🟠 Media  | Generar y optimizar imágenes (hero + secciones) por guía, en `public/images/enciclopedia/`.                                                               |
| 9   | ✨ Feat   | 🟢 Baja   | Reveal escalonado al scroll + micro-interacciones de hover en tarjetas.                                                                                   |
| 10  | ♿ A11y   | 🟡 Media  | `alt` descriptivos, contraste AA en bandas oscuras, foco visible.                                                                                         |

---

## 8. Antes / Después (resumen visual)

| Aspecto             | Hoy                      | Propuesta                                  |
| ------------------- | ------------------------ | ------------------------------------------ |
| Jerarquía           | Todo igual (bug `prose`) | H1/H2/H3 Cormorant + numeración dorada     |
| Imágenes            | Ninguna                  | Hero + 1 img/sección, canon violeta-dorado |
| Tema                | Blanco plano             | Crema editorial + bandas oscuras de marca  |
| Ritmo de lectura    | Muro de texto            | Secciones, callouts, separadores, drop-cap |
| Hub                 | Emojis del SO            | Tarjetas ilustradas con hover              |
| Cartas relacionadas | `#1 #2 #3…`              | Miniatura + nombre                         |
| Identidad           | Genérica/"IA"            | Mística, premium, memorable                |

---

> **Siguiente paso sugerido:** confirmame si avanzo creando las tareas formales (§7) en el backlog de frontend y, si querés, arranco por la **Tarea #1** (fix de tipografía), que es la de mayor impacto/esfuerzo.
