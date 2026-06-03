# BACKLOG: REDISEÑO DE LA ENCICLOPEDIA MÍSTICA — Mayo 2026

## PARTE A: REPORTE DE HALLAZGOS DE DISEÑO

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Rediseño de UX/UI y enriquecimiento editorial de un módulo existente
**Versión:** 1.0
**Fecha:** 31 de mayo de 2026
**Preparado por:** Ariel (Product Owner) + Copilot (Asistente IA, skill `frontend-aesthetics`)
**Documento de análisis fuente:** `FEEDBACK_ENCICLOPEDIA_DISENO.md`
**Convención de IDs:** se inicia una nueva serie `ENC-XXX` / `T-ENC-XXX` propia de este backlog.

---

## CONTEXTO

Durante una revisión de diseño sobre la **Enciclopedia Mística** (`/enciclopedia`, `/enciclopedia/guias`, `/enciclopedia/guias/[slug]` y artículos de detalle), Ariel reportó que la información de la enciclopedia se ve **aburrida**, con **texto difícil de leer**, **sin imágenes** que acompañen y **desconectada de la identidad visual** del resto de la página.

El contenido editorial es de altísima calidad, pero la presentación lo desperdicia: se ve como un documento de texto plano sobre fondo blanco, sin jerarquía visual real ni atmósfera mística (celeste/dorado) que sí existe en el resto de la marca (`hero-bg.webp`, `tarot-cards.webp`, `birth-chart-promo.webp`).

Además del problema estético, se detectó un **bug técnico raíz** que aplana toda la tipografía de los artículos (clases `prose` inertes por falta del plugin de typography). Resolverlo es el cambio de mayor impacto/esfuerzo.

---

## ÍNDICE DE HALLAZGOS

| ID      | Hallazgo                                                                  | Severidad  | Módulo afectado                       |
| ------- | ------------------------------------------------------------------------- | ---------- | ------------------------------------- |
| ENC-001 | Tipografía de artículos plana: clases `prose` no aplican (sin jerarquía)  | 🔴 Crítica | Frontend — Encyclopedia ArticleDetail |
| ENC-002 | "Cartas de Tarot Relacionadas" muestra IDs crudos (`#1 #2 … #10`)         | 🟠 Alta    | Frontend — Encyclopedia ArticleDetail |
| ENC-003 | Artículos sin imágenes ni segmentación editorial (muro de texto)          | 🟠 Alta    | Frontend — Encyclopedia / Assets      |
| ENC-004 | Hub `/enciclopedia` con emojis del sistema y tema plano sin identidad     | 🟡 Media   | Frontend — Encyclopedia Hub           |
| ENC-005 | Listado `/enciclopedia/guias` con filas mínimas (sin imagen ni jerarquía) | 🟡 Media   | Frontend — Encyclopedia Guías         |

---

## DETALLE DE HALLAZGOS

### ENC-001: Tipografía de Artículos Plana — Las Clases `prose` No Aplican

**Severidad:** 🔴 Crítica (causa raíz del "texto difícil de leer")
**Módulo:** `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx`
**Reportado por:** Ariel — lectura de `/enciclopedia/guias/guia-tarot` (31/05/2026)

#### Descripción del Problema

El contenido Markdown de cada artículo se renderiza con un muro de texto sin jerarquía: el título de la guía, los `H2` ("1. ¿Qué es el Tarot?"), los `H3` y los párrafos se ven **del mismo tamaño y peso**. No hay ritmo de lectura, lo que hace el contenido denso y aburrido.

#### Causa Raíz Identificada

En [ArticleDetailView.tsx](frontend/src/components/features/encyclopedia/ArticleDetailView.tsx) el contenido se envuelve en clases de typography:

```tsx
<div className="prose prose-neutral dark:prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
</div>
```

Pero el proyecto **no tiene instalado `@tailwindcss/typography`** (verificado en [globals.css](frontend/src/app/globals.css) y `package.json`). En **Tailwind v4** esto significa que `prose`, `prose-neutral` y `dark:prose-invert` **no existen como utilidades** y se ignoran silenciosamente. Aunque `ReactMarkdown` genera correctamente `<h1>/<h2>/<h3>/<ul>/<strong>` (confirmado en el árbol de accesibilidad), ninguno recibe estilos → todo se ve como párrafo plano.

> Esta es la causa #1 del problema reportado. Resolverla sola mejora ~60% de la experiencia de lectura.

#### Criterios de Aceptación

1. **Dado** que abro cualquier artículo de la enciclopedia
   **Cuando** se renderiza el Markdown
   **Entonces** los `H1/H2/H3` tienen tamaños, pesos y espaciado claramente diferenciados del cuerpo (jerarquía visual real).

2. **Dado** el sistema de marca
   **Cuando** se estilan los títulos
   **Entonces** usan Cormorant Garamond (`font-serif`), el cuerpo usa Lato (`font-sans`), los enlaces el lila `#805ad5` y los acentos el dorado `#d69e2e`.

3. **Dado** un párrafo largo
   **Cuando** lo leo
   **Entonces** el ancho de medida (~`max-w-[68ch]`), interlineado (`leading-relaxed`) y tamaño (`text-lg`) favorecen la legibilidad.

#### Notas Técnicas

- **Opción A:** instalar `@tailwindcss/typography` y configurar un preset `prose` con los tokens de Auguria.
- **Opción B (recomendada):** mapear los nodos de `ReactMarkdown` a componentes propios (`components={{ h1, h2, h3, p, ul, ol, li, strong, em, blockquote, a, table }}`) con clases Tailwind. Permite además insertar callouts, separadores decorativos y drop-caps editoriales sin sumar dependencia.
- Centralizar el mapeo en un componente reutilizable (ej. `MarkdownArticle`) para usarlo en todos los tipos de artículo (guías, signos, planetas, elementos).

---

### ENC-002: "Cartas de Tarot Relacionadas" Muestra IDs Crudos (`#1 #2 … #10`)

**Severidad:** 🟠 Alta (confuso, se ve sin terminar)
**Módulo:** `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx`
**Reportado por:** Ariel — guía de Tarot, sección inferior (31/05/2026)

#### Descripción del Problema

La sección "Cartas de Tarot Relacionadas" renderiza **chips con el ID numérico crudo** de cada carta (`#1`, `#2`, … `#10`) en vez de mostrar la carta. Es confuso para el usuario y transmite sensación de prototipo inacabado.

#### Causa Raíz Identificada

En [ArticleDetailView.tsx](frontend/src/components/features/encyclopedia/ArticleDetailView.tsx) la sección itera `article.relatedTarotCards` (un array de IDs) y renderiza el ID directamente:

```tsx
{
  article.relatedTarotCards!.map((cardId) => (
    <span key={cardId} className="...">
      #{cardId}
    </span>
  ));
}
```

No se resuelve el ID a la carta (nombre + miniatura), pese a que ya existen `CardThumbnail` y rutas `/enciclopedia/tarot/[slug]`.

#### Criterios de Aceptación

1. **Dado** un artículo con cartas relacionadas
   **Cuando** se renderiza la sección
   **Entonces** cada carta muestra **miniatura + nombre** (no el ID), enlazando a su detalle `/enciclopedia/tarot/[slug]`.

2. **Dado** que no hay cartas relacionadas
   **Cuando** se renderiza
   **Entonces** la sección no aparece (comportamiento actual conservado).

#### Notas Técnicas

- Resolver los IDs a datos de carta (hook/endpoint existente de cartas) o, si el backend ya devuelve objetos, usar nombre/slug/imagen.
- Reutilizar `CardThumbnail` / `CardListItem` y mantener el estilo de tarjeta de marca.
- Tests del nuevo render (miniatura, nombre, href).

---

### ENC-003: Artículos Sin Imágenes ni Segmentación Editorial

**Severidad:** 🟠 Alta
**Módulo:** `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx` (+ assets + datos de contenido)
**Reportado por:** Ariel — "texto aburrido, difícil de leer, sin imágenes que acompañen" (31/05/2026)

#### Descripción del Problema

Los artículos no tienen **ninguna imagen** ni recursos visuales que segmenten y acompañen la lectura. No hay hero, ni imágenes de sección, ni callouts, ni separadores. La lectura es un muro continuo, sin descanso visual y sin la atmósfera mística de la marca.

#### Causa Raíz Identificada

El render actual es: breadcrumb + título + badge + snippet + bloque Markdown + secciones de relacionados. No existe una **plantilla editorial** (hero con imagen, TOC, imágenes por sección, callouts, CTA inmersivo). Tampoco hay assets de imagen para la enciclopedia (`public/images/` solo tiene los del marketing general).

#### Criterios de Aceptación

1. **Dado** que abro un artículo de guía
   **Cuando** carga
   **Entonces** veo un **hero** con imagen temática (banda oscura de marca), breadcrumb, categoría, título y lead.

2. **Dado** el cuerpo del artículo
   **Cuando** lo recorro
   **Entonces** cada gran sección puede tener su **imagen/ilustración**, y existen recursos editoriales (callouts "Clave"/"Sabías que…", separadores dorados, blockquote, drop-cap en el primer párrafo).

3. **Dado** las imágenes generadas
   **Cuando** se integran
   **Entonces** son coherentes con el canon visual (violeta/índigo + dorado, etéreo) y tienen `alt` descriptivo en español.

#### Notas Técnicas

- Crear componente `ArticleHero` (banda `bg-hero → bg-hero-mid`, imagen con overlay, breadcrumb, lead, meta tiempo de lectura / nº de secciones).
- Sistema editorial: H2 numerado con badge dorado, drop-cap, callouts, separadores `✦`, blockquote dorado, tablas estilizadas.
- Generar imágenes (hero + secciones) por guía y guardarlas en `frontend/public/images/enciclopedia/` (WebP), siguiendo la **fórmula de prompts** definida en `FEEDBACK_ENCICLOPEDIA_DISENO.md §6`.
- El contenido de "qué imagen va en qué sección" se modela como datos (no hardcode en el render) para poder reutilizar la plantilla en todas las guías.

---

### ENC-004: Hub `/enciclopedia` con Emojis del Sistema y Tema Plano

**Severidad:** 🟡 Media (identidad visual)
**Módulo:** `frontend/src/components/features/encyclopedia/EnciclopediaHubContent.tsx`
**Reportado por:** Ariel — hub principal de la enciclopedia (31/05/2026)

#### Descripción del Problema

El hub de la enciclopedia muestra 3 tarjetas (Tarot / Astrología / Guías) con **emojis nativos del sistema** (🃏 ⭐ 📚) sobre fondo blanco plano. Se ve como un prototipo, varía según el SO del usuario y rompe con la estética dorada ilustrada de la marca.

#### Causa Raíz Identificada

En [EnciclopediaHubContent.tsx](frontend/src/components/features/encyclopedia/EnciclopediaHubContent.tsx) cada sección usa `icon: '🃏' | '⭐' | '📚'` renderizados como texto, y las tarjetas son `bg-card` blancas sin imagen ni uso de los tokens oscuros/dorados de marca.

#### Criterios de Aceptación

1. **Dado** que entro a `/enciclopedia`
   **Cuando** carga el hub
   **Entonces** veo un encabezado con identidad de marca (banda oscura/gradiente + título Cormorant) y 3 tarjetas con **imagen temática** (no emojis del sistema).

2. **Dado** que paso el mouse por una tarjeta
   **Cuando** hago hover
   **Entonces** hay una micro-interacción coherente (zoom suave de imagen + glow dorado).

3. **Dado** distintos dispositivos/SO
   **Cuando** se renderiza
   **Entonces** los íconos/ilustraciones se ven idénticos (no dependen de emoji del sistema).

#### Notas Técnicas

- Reemplazar emojis por imágenes/ilustraciones de marca (3 assets, ver prompts en `FEEDBACK_ENCICLOPEDIA_DISENO.md §4.1`).
- Encabezado con banda `bg-hero`/`bg-hero-mid` + filete dorado.
- Mantener grid responsive; opcional romper simetría para acento editorial.
- Tests del hub (render de 3 secciones, enlaces correctos, alt de imágenes).

---

### ENC-005: Listado `/enciclopedia/guias` con Filas Mínimas

**Severidad:** 🟡 Media
**Módulo:** `frontend/src/components/features/encyclopedia/GuiasContent.tsx`
**Reportado por:** Ariel — índice de guías (31/05/2026)

#### Descripción del Problema

El índice de guías presenta cada guía como una **fila mínima** (título + snippet + flecha), sin imagen ni jerarquía, sobre fondo plano. No invita a entrar ni refleja la riqueza del contenido.

#### Causa Raíz Identificada

En [GuiasContent.tsx](frontend/src/components/features/encyclopedia/GuiasContent.tsx) cada `GuiaItem` es un `Link` con `bg-card` + texto + `→`. No hay thumbnail, chip de categoría ni tratamiento visual de marca.

#### Criterios de Aceptación

1. **Dado** que entro a `/enciclopedia/guias`
   **Cuando** carga la lista
   **Entonces** veo **tarjetas editoriales** con thumbnail temático, título Cormorant, snippet (2 líneas), chip de categoría dorado y CTA "Leer guía →".

2. **Dado** que paso el mouse por una tarjeta
   **Cuando** hago hover
   **Entonces** hay elevación + borde dorado + micro-translate.

3. **Dado** el orden actual (Guía del Tarot primero, fix previo BUG-017)
   **Cuando** se listan
   **Entonces** se conserva el orden sin regresiones.

#### Notas Técnicas

- Grid 2-col desktop / 1-col mobile.
- Reutilizar los thumbnails de cabecera de cada guía (assets de ENC-003).
- Tests del listado (tarjeta con imagen, chip, href).

---

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** serie `T-ENC-XXX` propia de este backlog.
> Estimación en puntos de historia (1 punto ≈ 0.5 día). Todas las tareas son frontend salvo indicación.

### Índice de Tareas Técnicas

| ID        | Tarea                                                                      | Tipo     | Prioridad  | Estimación |
| --------- | -------------------------------------------------------------------------- | -------- | ---------- | ---------- |
| T-ENC-001 | Render editorial del Markdown de artículos (jerarquía + tokens de marca)   | Frontend | 🔴 Crítica | 3 pts      |
| T-ENC-002 | "Cartas relacionadas": miniatura + nombre enlazando al detalle             | Frontend | 🟠 Alta    | 1.5 pts    |
| T-ENC-003 | Componente `ArticleHero` + sistema editorial (callouts, separadores, etc.) | Frontend | 🟠 Alta    | 3 pts      |
| T-ENC-004 | TOC "En esta guía" con scroll-spy                                          | Frontend | 🟢 Baja    | 2 pts      |
| T-ENC-005 | Rediseño del Hub `/enciclopedia` (hero + tarjetas con imagen)              | Frontend | 🟡 Media   | 2 pts      |
| T-ENC-006 | Rediseño de tarjetas de `/enciclopedia/guias` (editorial con thumbnail)    | Frontend | 🟡 Media   | 2 pts      |
| T-ENC-007 | Generación y optimización de imágenes de la enciclopedia (assets)          | Assets   | 🟠 Alta    | 3 pts      |
| T-ENC-008 | Micro-interacciones y reveal escalonado al scroll                          | Frontend | 🟢 Baja    | 1.5 pts    |
| T-ENC-009 | Accesibilidad: `alt`, contraste AA en bandas oscuras, foco visible         | Frontend | 🟡 Media   | 1.5 pts    |

**Estimación total:** ~19.5 puntos.

---

## TAREAS DETALLADAS

### T-ENC-001: Render Editorial del Markdown de Artículos

**Prioridad:** 🔴 Crítica
**Estimación:** 3 puntos
**Dependencias:** ninguna
**Cubre Hallazgo:** ENC-001
**Estado:** ✅ Completada (rama `feature/T-ENC-001-render-editorial-markdown`)

#### 📋 Descripción

Eliminar la dependencia de las clases `prose` (inertes en Tailwind v4) y dar jerarquía y legibilidad reales al contenido Markdown, con los tokens de marca de Auguria.

#### ✅ Tareas específicas

- [x] Crear componente reutilizable `MarkdownArticle` que mapee los nodos de `ReactMarkdown` (`components={{ h1, h2, h3, p, ul, ol, li, strong, em, blockquote, a, table, thead, th, td, code, hr }}`) a estilos Tailwind con tokens de marca.
- [x] Títulos en Cormorant (`font-serif`), cuerpo en Lato (`font-sans`), enlaces lila (`text-primary`), acentos dorados (`secondary`).
- [x] Medida de lectura `max-w-[68ch]`, `text-lg`, `leading-relaxed`, ritmo vertical consistente.
- [x] Reemplazar el `<div className="prose …">` de `ArticleDetailView.tsx` por `MarkdownArticle`.
- [x] (Decisión) **Opción B** elegida: mapeo de nodos a componentes propios, **sin** sumar `@tailwindcss/typography` (cero dependencias nuevas, permite acentos editoriales). Documentado en el JSDoc del componente.
- [x] Tests del render (jerarquía h1/h2/h3, cuerpo, listas, strong, em, enlaces, blockquote, tabla GFM, separador, código inline).
- [x] Coverage 100% del componente (≥ 80% requerido).

#### 🎯 Criterios de Aceptación

- Los artículos muestran jerarquía visual clara (h1/h2/h3 diferenciados del cuerpo).
- Estilos coherentes con la identidad (Cormorant/Lato/lila/dorado).
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx`
- `frontend/src/components/features/encyclopedia/MarkdownArticle.tsx` (nuevo)
- `frontend/src/components/features/encyclopedia/MarkdownArticle.test.tsx` (nuevo)
- (posible) `package.json`, configuración de Tailwind

---

### T-ENC-002: "Cartas Relacionadas" con Miniatura + Nombre

**Prioridad:** 🟠 Alta
**Estimación:** 1.5 puntos
**Dependencias:** ninguna
**Cubre Hallazgo:** ENC-002
**Estado:** ✅ Completada (rama `feature/T-ENC-002-cartas-relacionadas-miniatura`)

#### ✅ Tareas específicas

- [x] Resolver cada ID de `relatedTarotCards` a su carta (nombre + slug + imagen), vía hook/endpoint existente.
- [x] Renderizar cada carta con `CardThumbnail` + nombre, enlazando a `/enciclopedia/tarot/[slug]`.
- [x] Conservar la condición de ocultar la sección cuando no hay cartas relacionadas.
- [x] Tests del nuevo render (miniatura, nombre, href).
- [x] Coverage ≥ 80%.

#### 📝 Notas de implementación

- Nuevo componente `RelatedTarotCards` que resuelve los IDs contra el mazo completo (`useCards`, cacheado 1h — sin endpoint nuevo) y construye un mapa `id → CardSummary`. Los IDs desconocidos se omiten; si ninguno resuelve, no renderiza nada.
- Se añadió un prop opcional `href` a `CardThumbnail` (default `/enciclopedia/{slug}`, retrocompatible) para enlazar a la ruta canónica de tarot `ROUTES.ENCICLOPEDIA_TAROT_CARD(slug)` sin afectar otros usos.
- `ArticleDetailView` conserva el gate de la sección (oculta si `relatedTarotCards` es `null`/vacío) y delega la grilla al nuevo componente.

#### 🎯 Criterios de Aceptación

- La sección muestra cartas reales (miniatura + nombre), no IDs crudos.
- Cada carta enlaza a su detalle sin regresiones.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx`
- `frontend/src/components/features/encyclopedia/CardThumbnail.tsx` (reutilizar)
- tests correspondientes

---

### T-ENC-003: Componente `ArticleHero` + Sistema Editorial

**Prioridad:** 🟠 Alta
**Estimación:** 3 puntos
**Dependencias:** T-ENC-001 (render base), T-ENC-007 (assets de imagen)
**Cubre Hallazgo:** ENC-003
**Estado:** ✅ Completada (rama `feature/T-ENC-003-article-hero-sistema-editorial`)

#### 📋 Descripción

Dar a los artículos una plantilla editorial: hero con imagen, recursos visuales de sección y elementos de descanso de lectura.

#### ✅ Tareas específicas

- [x] Crear `ArticleHero` (banda gradiente noche `bg-hero → bg-hero-mid`, imagen de cabecera opcional con overlay + estrellas/luna decorativas, breadcrumb, chip de categoría dorado, título Cormorant, lead, meta de tiempo de lectura + nº de secciones). **Fallback** a banda de gradiente cuando falta la imagen.
- [x] Soportar imágenes por sección modeladas como **datos** (`encyclopedia-editorial.data.ts`, mapeadas por nº de sección H2), no hardcode en el render.
- [x] Recursos editoriales: callouts ("Clave", "Sabías que…" → `ArticleCallout`), separadores dorados `✦`, blockquote dorado (ya en `MarkdownArticle`), drop-cap en el primer párrafo y badge dorado numerado en los H2.
- [x] Integrar en `ArticleDetailView` (gate a categorías de guía `guide_*`); signos/planetas conservan su cabecera simple sin regresión.
- [x] Tests (hero, callouts, badges, drop-cap, ✦, inyección de imagen/callout por sección con alt).
- [x] Coverage 100% en `ArticleHero`, `ArticleCallout`, `ArticleDetailView` y datos editoriales; `MarkdownArticle` 100% líneas / 95% ramas (≥ 80% requerido).

#### 📝 Notas de implementación

- Imágenes generadas con los prompts de `FEEDBACK_ENCICLOPEDIA_DISENO.md` §4.1/§5/§6, optimizadas a **WebP** (ImageMagick, calidad 80, sin metadata) y guardadas en `frontend/public/images/enciclopedia/` (hero 1792px, secciones 1000px, lateral 4:5 640px, hub 800px). Set total ~700 KB.
- `MarkdownArticle` gana un modo editorial **opt-in** (`editorial` + `sections`): por defecto conserva exactamente la tipografía base (cero regresión para signos/planetas).
- Nuevo util `getArticleReadingMeta` (en `lib/utils/text.ts`) deriva tiempo de lectura (~200 wpm) y nº de secciones (conteo de `##`).
- Los assets del Hub (`hub-*.webp`) ya quedan generados para habilitar T-ENC-005.

#### 🎯 Criterios de Aceptación

- Los artículos de guía muestran hero con imagen + cuerpo segmentado con recursos editoriales.
- Coherencia visual con la marca (violeta/índigo/dorado).
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/ArticleHero.tsx` (nuevo)
- `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx`
- datos de contenido editorial por guía (nuevo archivo de datos)
- tests correspondientes

---

### T-ENC-004: TOC "En Esta Guía" con Scroll-Spy

**Prioridad:** 🟢 Baja
**Estimación:** 2 puntos
**Dependencias:** T-ENC-001
**Cubre Hallazgo:** ENC-003 (navegación de lectura)
**Estado:** ✅ Completada (rama `feature/T-ENC-004-toc-scroll-spy`)

#### ✅ Tareas específicas

- [x] Generar índice (TOC) a partir de los `H2` del artículo, con anclas.
- [x] Resaltar la sección activa al hacer scroll (scroll-spy).
- [x] Comportamiento responsive (TOC lateral en desktop, colapsable en mobile).
- [x] Tests (generación de anclas, marcado de sección activa).
- [x] Coverage ≥ 80%.

#### 📝 Notas de implementación

- Nuevo util `extractArticleHeadings` + `getSectionAnchorId` en `lib/utils/text.ts`: deriva el TOC de los `## N.` (ignora `#`/`###` y `##` sin número), limpia markdown inline del label (negritas, cursiva, enlaces → texto) y construye el `id` de ancla (`seccion-N`). `getSectionAnchorId` es la **única fuente de verdad** del id, compartida entre el TOC y el heading renderizado (anclas y destinos siempre concuerdan).
- `MarkdownArticle` (modo editorial) añade `id="seccion-N"` + `scroll-mt-24` a los H2 numerados — cero regresión para signos/planetas (modo no editorial sin id).
- Nuevo `ArticleToc` (client): scroll-spy con `IntersectionObserver` (`rootMargin -80px 0px -70% 0px`, elige el heading más alto entre los visibles y conserva el último activo si ninguno intersecta). Responsive: `<details>` colapsable en mobile + barra lateral `lg:sticky` en desktop, ambas con `aria-current="location"` en la sección activa.
- `ArticleDetailView` extrae el cuerpo a una variable compartida (DRY) y monta el layout de dos columnas (TOC `lg:order-2` + columna de lectura `max-w-[68ch]`) solo para guías con secciones numeradas.
- Coverage 100% líneas/funciones en los archivos nuevos/tocados (≥ 95% ramas); ciclo de calidad frontend completo en verde.

#### 🎯 Criterios de Aceptación

- El artículo muestra un índice navegable que refleja sus secciones.
- La sección activa se resalta según el scroll.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/ArticleToc.tsx` (nuevo)
- `frontend/src/lib/utils/text.ts` (util `extractArticleHeadings` / `getSectionAnchorId`)
- `frontend/src/components/features/encyclopedia/MarkdownArticle.tsx` (ids de ancla)
- `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx` (integración)
- tests correspondientes

---

### T-ENC-005: Rediseño del Hub `/enciclopedia`

**Prioridad:** 🟡 Media
**Estimación:** 2 puntos
**Dependencias:** T-ENC-007 (assets)
**Cubre Hallazgo:** ENC-004
**Estado:** ✅ Completada (rama `feature/T-ENC-005-rediseno-hub-enciclopedia`)

#### ✅ Tareas específicas

- [x] Encabezado con banda oscura/gradiente (`bg-hero`/`bg-hero-mid`) + título Cormorant + filete dorado.
- [x] Reemplazar emojis (🃏 ⭐ 📚) por imágenes/ilustraciones de marca en las 3 tarjetas.
- [x] Tarjetas con imagen + overlay + título dorado + micro-interacción de hover (zoom + glow).
- [x] Mantener grid responsive y enlaces existentes.
- [x] Tests (3 secciones, enlaces correctos, alt de imágenes).
- [x] Coverage 100% en `EnciclopediaHubContent` (≥ 80% requerido).

#### 📝 Notas de implementación

- La banda de cabecera reutiliza el canon visual de `ArticleHero` (gradiente noche `HERO_GRADIENT`, estrellas `animate-twinkle`, luna creciente CSS y filete dorado), manteniendo coherencia entre el hub y el detalle de artículo.
- Cada sección es una `SectionCard` (sub-componente): imagen `next/image` (`fill`, assets `hub-*.webp` de T-ENC-003/007), overlay de legibilidad, título Cormorant crema, descripción y CTA dorado. El emoji del sistema se eliminó del modelo de datos (`icon` → `image: { src, alt }`).
- Micro-interacción de hover coherente vía `group`: zoom suave de imagen (`group-hover:scale-105`), glow dorado (`inset shadow`), elevación (`-translate-y-1`) y desplazamiento del CTA. Foco visible (`focus-visible:ring-secondary`) para accesibilidad por teclado.
- Se conservan los `data-testid` y `href` existentes (cero regresión de navegación); los test-ids de sección quedan anidados dentro del `Link` de categoría.

#### 🎯 Criterios de Aceptación

- El hub refleja la identidad de marca (sin emojis del sistema).
- Hover con micro-interacción coherente.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/EnciclopediaHubContent.tsx`
- `frontend/src/app/enciclopedia/page.test.tsx`

---

### T-ENC-006: Rediseño de Tarjetas de `/enciclopedia/guias`

**Prioridad:** 🟡 Media
**Estimación:** 2 puntos
**Dependencias:** T-ENC-007 (thumbnails)
**Cubre Hallazgo:** ENC-005
**Estado:** ✅ Completada (rama `feature/T-ENC-006-rediseno-tarjetas-guias`)

#### ✅ Tareas específicas

- [x] Convertir `GuiaItem` en tarjeta editorial: thumbnail + título Cormorant + snippet (2 líneas) + chip de categoría dorado + CTA "Leer guía →".
- [x] Grid 2-col desktop / 1-col mobile.
- [x] Hover: elevación + borde dorado + micro-translate.
- [x] Conservar el orden (Guía del Tarot primera) sin regresiones.
- [x] Tests (tarjeta con imagen, chip, href).
- [x] Coverage ≥ 80%.

#### 📝 Notas de implementación

- `GuiaItem` se reemplazó por `GuiaCard`: tarjeta editorial con thumbnail (`aspect-[16/9]`), overlay de legibilidad, chip de categoría dorado (`bg-secondary`), título Cormorant (`font-serif`), snippet `line-clamp-2` y CTA "Leer guía →". Hover coherente con el resto del rediseño (elevación `-translate-y-1`, borde dorado `hover:border-secondary`, glow y zoom de imagen `group-hover:scale-105`); foco visible por teclado.
- **Thumbnail por categoría modelado como datos** (`GUIDE_THEME`): chip corto + asset temático opcional. Hoy solo la Guía del Tarot tiene asset (`guia-tarot-hero.webp`); el resto cae con elegancia a un **gradiente de marca con `✦`** hasta que aterricen sus imágenes por guía (fuera del alcance de T-ENC-007, que produjo los assets de hub/sección/guía-tarot). `resolveThumbnail` prioriza un `imageUrl` del backend si existiera (a prueba de futuro).
- Cabecera con banda de marca (gradiente noche + título Cormorant + filete dorado) coherente con el Hub (T-ENC-005) y `ArticleHero`.
- Orden conservado (Guía del Tarot primera) y `ROUTES.ENCICLOPEDIA_GUIA(slug)` sin cambios → cero regresión de navegación.
- Coverage `GuiasContent`: 100% líneas/funciones, 83% ramas (≥ 80% requerido); ciclo de calidad frontend completo en verde.

#### 🎯 Criterios de Aceptación

- El índice de guías muestra tarjetas ricas con imagen y jerarquía.
- Orden y enlaces conservados.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/GuiasContent.tsx`
- `frontend/src/app/enciclopedia/guias/page.test.tsx`

---

### T-ENC-007: Generación y Optimización de Imágenes de la Enciclopedia

**Prioridad:** 🟠 Alta
**Estimación:** 3 puntos
**Dependencias:** ninguna (habilita ENC-003/004/005/006)
**Cubre Hallazgo:** ENC-003 (assets), ENC-004, ENC-005
**Estado:** ✅ COMPLETADA

#### 📋 Descripción

Producir el set de imágenes de la enciclopedia (hero del hub, cabeceras de guía e imágenes de sección) siguiendo el canon de marca y la fórmula de prompts del documento de feedback.

#### ✅ Tareas específicas

- [x] Generar imágenes con IA siguiendo la **fórmula base** y los prompts por sección de `FEEDBACK_ENCICLOPEDIA_DISENO.md §5–6`.
- [x] Paleta violeta/índigo + dorado; `no text`; coherentes con `hero-bg.webp` / `tarot-cards.webp`.
- [x] Exportar a **WebP** y guardar en `frontend/public/images/enciclopedia/` con nombres semánticos (`guia-tarot-hero.webp`, `tarot-arcanos-mayores.webp`, etc.).
- [x] Optimizar peso (seguir `frontend/docs/IMAGE_OPTIMIZATION.md`).
- [x] Definir `alt` descriptivo en español para cada imagen.

#### 🎯 Criterios de Aceptación

- Set de imágenes disponible en `public/images/enciclopedia/`, optimizado y consistente con la marca.
- Cada imagen con `alt` definido.

#### 📁 Archivos involucrados

- `frontend/public/images/enciclopedia/*` (nuevos)
- `FEEDBACK_ENCICLOPEDIA_DISENO.md` (referencia de prompts)

---

### T-ENC-008: Micro-interacciones y Reveal Escalonado

**Prioridad:** 🟢 Baja
**Estimación:** 1.5 puntos
**Dependencias:** T-ENC-003, T-ENC-005, T-ENC-006
**Cubre Hallazgo:** ENC-003/004/005 (pulido)
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Reveal fade-up escalonado por sección al hacer scroll (sutil, respetando `prefers-reduced-motion`).
- [x] Hover states de tarjetas (hub, guías) con glow dorado y elevación.
- [x] Tests donde aplique / verificación visual.
- [x] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Animaciones sutiles y performantes que respetan `prefers-reduced-motion`.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- componentes de enciclopedia (hub, guías, artículo)

#### 🧩 Notas técnicas (implementación)

- **`useReducedMotion`** (`hooks/utils/`): suscripción a `prefers-reduced-motion`
  vía `useSyncExternalStore` (SSR-safe, sin `setState` en efecto).
- **`Reveal`** (`features/encyclopedia/`): wrapper con `IntersectionObserver` que
  aplica un fade-up escalonado (retardo por `index`, con tope) cuando el elemento
  entra en viewport. Con movimiento reducido aparece visible de inmediato
  (derivado en render, sin desfase de hidratación) y tiene fallback si no hay
  `IntersectionObserver`. El estilo vive en `globals.css` (`[data-reveal]`).
- **`globals.css`**: utilidades `[data-reveal]` + bloque
  `@media (prefers-reduced-motion: reduce)` que además neutraliza las animaciones
  decorativas en bucle (twinkle / float / shimmer).
- **Aplicación:** reveal escalonado en las tarjetas del hub (`EnciclopediaHubContent`),
  en las tarjetas de guías (`GuiasContent`) y en las secciones complementarias del
  artículo (`ArticleDetailView`: cartas relacionadas, artículos relacionados, CTA).
- Los hover states (lift + glow dorado + zoom de imagen) ya existían desde
  T-ENC-005/006; aquí se consolidan bajo el respeto a `prefers-reduced-motion`.

---

### T-ENC-009: Accesibilidad de la Enciclopedia

**Prioridad:** 🟡 Media
**Estimación:** 1.5 puntos
**Dependencias:** T-ENC-003, T-ENC-005
**Cubre Hallazgo:** transversal (ENC-003/004)
**Estado:** ✅ Completada (rama `feature/T-ENC-009-accesibilidad-enciclopedia`)

#### ✅ Tareas específicas

- [x] `alt` descriptivos en todas las imágenes nuevas.
- [x] Contraste AA del texto sobre bandas oscuras (`bg-hero`).
- [x] Foco visible y navegación por teclado en tarjetas y TOC.
- [x] Verificación con herramienta de accesibilidad.
- [x] Coverage ≥ 80% donde aplique.

#### 📝 Notas de implementación

- **Contraste de chips dorados (AA):** los chips de categoría usaban
  `text-secondary-foreground` (= `#ffffff`) sobre `bg-secondary` (`#d69e2e`), una
  combinación blanco-sobre-dorado de ≈ **2.4:1** que **falla** WCAG AA. Se cambió
  a texto noche profunda (`text-[#1a0a2e]`, ≈ **7:1**, cumple AA) en `ArticleHero`,
  `GuiaCard` (`GuiasContent`) y la cabecera simple de `ArticleDetailView`. Cambio
  acotado a la enciclopedia (no se tocó el token global `--secondary-foreground`
  para no afectar botones del resto de la app).
- **Texto sobre bandas oscuras:** el cuerpo (`CREAM` `#f9f7f2` y `CREAM_MUTED`
  `rgba(249,247,242,0.72)`) sobre el gradiente noche da ≈ **7.5:1** → ya cumplía
  AA; se verificó y se conserva sin cambios.
- **Foco visible / teclado:** se añadió anillo `focus-visible` a elementos que solo
  tenían el outline por defecto: enlaces del TOC y el `<summary>` colapsable
  (`ArticleToc`), enlace de tarjeta de carta (`CardThumbnail`) y breadcrumb del
  hero (`ArticleHero`, con `ring-offset` sobre la banda oscura). Las tarjetas del
  Hub y de Guías ya traían foco visible de T-ENC-005/006.
- **`alt`:** auditadas todas las imágenes de la enciclopedia (Hub, Guías,
  `ArticleHero`, `CardThumbnail`); todas con `alt` descriptivo en español. Se
  añadieron tests que fijan el contrato de `alt` y de foco visible.
- **Verificación:** ratios de contraste calculados con la fórmula de luminancia
  relativa WCAG 2.1; tests unitarios bloquean regresiones de contraste/foco.

#### 🎯 Criterios de Aceptación

- Texto sobre fondos oscuros cumple contraste AA.
- Imágenes con `alt`; foco visible en elementos interactivos.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/ArticleHero.tsx` (+ test)
- `frontend/src/components/features/encyclopedia/ArticleToc.tsx` (+ test)
- `frontend/src/components/features/encyclopedia/CardThumbnail.tsx` (+ test)
- `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx` (+ test)
- `frontend/src/components/features/encyclopedia/GuiasContent.tsx` (+ test de `app/enciclopedia/guias/page.test.tsx`)

---

## ORDEN DE EJECUCIÓN SUGERIDO

1. **T-ENC-001** (fix de tipografía — mayor impacto, desbloquea lectura).
2. **T-ENC-007** (assets — habilita el resto del rediseño visual).
3. **T-ENC-002** (quick win visible: cartas relacionadas).
4. **T-ENC-003** (hero + sistema editorial).
5. **T-ENC-005** y **T-ENC-006** (hub y listado).
6. **T-ENC-004** (TOC), **T-ENC-008** (micro-interacciones), **T-ENC-009** (a11y) como pulido final.

---

> **Nota:** este backlog se deriva del análisis en `FEEDBACK_ENCICLOPEDIA_DISENO.md`. Cada tarea debe ejecutarse siguiendo `docs/WORKFLOW_FRONTEND.md` (TDD, ciclo de calidad y PR a `develop`).
