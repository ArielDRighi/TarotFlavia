# BACKLOG: REDISEÑO DE LA ENCICLOPEDIA MÍSTICA — FASE 2 (Junio 2026)

## CONTEXTO

La **Fase 1** (`BACKLOG_ENCICLOPEDIA_REDISENO_2026_05.md`, tareas `T-ENC-001` a `T-ENC-009`)
construyó toda la **infraestructura editorial** de la enciclopedia: render editorial del
Markdown (`MarkdownArticle`), `ArticleHero`, `ArticleCallout`, `ArticleToc`, `Reveal`,
rediseño del Hub y del listado de guías, micro-interacciones y reveal escalonado.

**Sin embargo, solo se pobló de contenido visual la Guía del Tarot.** El resto del módulo
cae a fallbacks (gradiente de marca con `✦`) o conserva cabecera simple. Este backlog
(serie `T-ENC-010+`) cierra ese gap en tres frentes:

1. **6 guías restantes** sin imágenes ni data editorial.
2. **Sección de astrología** (signos, planetas, casas, elementos, modalidades) sin hero temático.
3. **Detalle de cartas de tarot** (`/enciclopedia/tarot/[slug]`) sin tratamiento visual.

**Fecha:** 2 de junio de 2026
**Convención de IDs:** continúa la serie `ENC-XXX` / `T-ENC-XXX` de la Fase 1.
**Documentos fuente:** `FEEDBACK_ENCICLOPEDIA_DISENO.md` (§3 marca, §6 fórmula de prompts),
`BACKLOG_ENCICLOPEDIA_REDISENO_2026_05.md` (infraestructura de Fase 1).

---

## PARTE A: GAP ANALYSIS (estado heredado de Fase 1)

| Guía / Sección               | Categoría             | Hero | Imgs sección | Data editorial | Prompts |
| ---------------------------- | --------------------- | ---- | ------------ | -------------- | ------- |
| Tarot                        | `guide_tarot`         | ✅   | ✅ (5)       | ✅             | ✅      |
| Numerología                  | `guide_numerology`    | ❌   | ❌           | ❌             | ❌ → §C |
| Péndulo                      | `guide_pendulum`      | ❌   | ❌           | ❌             | ❌ → §C |
| Carta Astral                 | `guide_birth_chart`   | ❌   | ❌           | ❌             | ❌ → §C |
| Rituales                     | `guide_ritual`        | ❌   | ❌           | ❌             | ❌ → §C |
| Horóscopo Occidental         | `guide_horoscope`     | ❌   | ❌           | ❌             | ❌ → §C |
| Horóscopo Chino              | `guide_chinese`       | ❌   | ❌           | ❌             | ❌ → §C |
| Signos / Planetas / Casas …  | `zodiac_sign` etc.    | ❌   | n/a          | n/a            | ❌ → §C |
| Detalle de carta de tarot    | (ruta `/tarot/[slug]`)| ❌   | n/a          | n/a            | ❌ → §C |

**Notas de implementación heredadas:**

- El fallback de las guías sin asset vive en `GuiasContent.tsx` (`getGuideTheme` → gradiente `✦`).
- La data editorial vive en `frontend/src/lib/data/encyclopedia-editorial.data.ts`
  (`ARTICLE_EDITORIAL`, hoy solo la clave `'guia-tarot'`). El render asocia imágenes a
  secciones **por número de H2** (`sections[].image`), no por hardcode.
- El modo editorial de `ArticleDetailView` está gateado a `category.startsWith('guide_')`
  (`isGuideCategory`). Astrología y cartas **no** entran a ese gate hoy (decisión de Fase 1).

---

## PARTE B: TAREAS TÉCNICAS

| ID        | Tarea                                                                       | Tipo     | Prioridad  | Est.   |
| --------- | --------------------------------------------------------------------------- | -------- | ---------- | ------ |
| T-ENC-010 | Imágenes + data editorial de las 6 guías restantes                          | Assets+FE| 🟠 Alta    | 5 pts  |
| T-ENC-011 | Thumbnails de guías en el listado (eliminar fallback de gradiente)          | Frontend | 🟡 Media   | 1.5 pts|
| T-ENC-012 | Hero temático genérico por categoría de astrología                          | Assets+FE| 🟡 Media   | 3 pts  |
| T-ENC-013 | Tratamiento visual del detalle de cartas de tarot                           | FE       | 🟡 Media   | 2.5 pts|
| T-ENC-014 | Generación y optimización de todos los assets nuevos (WebP)                 | Assets   | 🟠 Alta    | 3 pts  |

**Estimación total:** ~15 pts. **Orden sugerido:** T-ENC-014 (assets) habilita 010/012/013;
luego 010 → 011 → 012 → 013.

---

### T-ENC-010: Imágenes + Data Editorial de las 6 Guías Restantes

**Prioridad:** 🟠 Alta · **Estimación:** 5 pts · **Dependencias:** T-ENC-014 (assets)
**Cubre:** gap de guías (numerología, péndulo, carta astral, rituales, horóscopo, horóscopo chino)
**Estado:** ✅ COMPLETADA

**Nota de implementación:** La data editorial apunta a los assets definidos en §C. Las imágenes se
generarán con T-ENC-014; hasta entonces el componente muestra el fallback de marca (`ArticleHero`
sin `src` queda gracefully sin imagen de sección). El slug del horóscopo occidental es
`guia-horoscopo-occidental` (no `guia-horoscopo`). `guia-rituales` tiene 4 secciones H2 (no 6);
`guia-horoscopo-occidental` tiene 3; `guia-horoscopo-chino` tiene 4.

#### ✅ Tareas específicas

- [x] Para cada una de las 6 guías, añadir su entrada en `ARTICLE_EDITORIAL`
      (`encyclopedia-editorial.data.ts`) con `hero` + `sections[].image` mapeadas por nº de H2,
      siguiendo la estructura de secciones documentada en §C.
- [x] Cada imagen con `alt` descriptivo en español.
- [x] Verificar que cada guía entra al modo editorial (ya gateado por `guide_*`) y renderiza
      hero con imagen + imágenes de sección, sin tocar `ArticleDetailView`.
- [x] Tests de la data (entradas presentes, src/alt válidos por guía).
- [x] Coverage ≥ 80% (100% statements/branch/funcs/lines).

#### 🎯 Criterios de aceptación

- Las 6 guías muestran hero con imagen e imágenes de sección coherentes con la marca.
- `alt` en español en todas las imágenes; cero regresión en la Guía del Tarot.

#### 📁 Archivos

- `frontend/src/lib/data/encyclopedia-editorial.data.ts` (+ test)
- `frontend/public/images/enciclopedia/*` (assets de T-ENC-014)

---

### T-ENC-011: Thumbnails de Guías en el Listado

**Prioridad:** 🟡 Media · **Estimación:** 1.5 pts · **Dependencias:** T-ENC-014
**Cubre:** fallback de gradiente en `/enciclopedia/guias`

#### ✅ Tareas específicas

- [ ] Poblar `GUIDE_THEME` (`GuiasContent.tsx`) con el asset de cada categoría (reutilizar el
      hero de cada guía como thumbnail), eliminando la dependencia del fallback `✦` salvo como
      red de seguridad.
- [ ] Conservar `resolveThumbnail` (prioridad a `imageUrl` del backend si existiera) y el orden.
- [ ] Tests (cada tarjeta con su imagen, alt, href).
- [ ] Coverage ≥ 80%.

#### 📁 Archivos

- `frontend/src/components/features/encyclopedia/GuiasContent.tsx` (+ test)

---

### T-ENC-012: Hero Temático por Categoría de Astrología

**Prioridad:** 🟡 Media · **Estimación:** 3 pts · **Dependencias:** T-ENC-014
**Cubre:** signos, planetas, casas, elementos, modalidades sin identidad visual

> **Decisión de alcance (confirmada):** una imagen **genérica por categoría** (≈5 assets),
> no una por entidad. Menos peso, consistencia inmediata; si más adelante se quiere granularidad
> por entidad, la data ya quedará lista para extenderse.

#### ✅ Tareas específicas

- [ ] Mapa `categoría → { src, alt }` para `zodiac_sign`, `planet`, `astro_house`, `element`,
      `modality` (assets `astro-*.webp` de §C).
- [ ] Mostrar un hero/banda temática en el detalle de esas categorías **sin** activar el modo
      editorial completo de guías (cabecera con imagen, no drop-cap/badges numerados), evitando
      regresión de contenido.
- [ ] `alt` en español; contraste AA del texto sobre la banda.
- [ ] Tests (render del hero por categoría, alt, fallback a banda sin imagen).
- [ ] Coverage ≥ 80%.

#### 📁 Archivos

- `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx`
- (posible) nuevo mapa de assets en `encyclopedia-editorial.data.ts` o archivo hermano
- tests correspondientes

---

### T-ENC-013: Tratamiento Visual del Detalle de Cartas de Tarot

**Prioridad:** 🟡 Media · **Estimación:** 2.5 pts · **Dependencias:** —
**Cubre:** `/enciclopedia/tarot/[slug]` sin atmósfera de marca
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Hero del detalle de carta: **reutilizar el arte propio de la carta** como protagonista
      sobre banda de marca (gradiente noche + estrellas), en lugar de generar un asset por carta
      (78 cartas → inviable/innecesario). Imagen de la carta + halo dorado + breadcrumb + nombre
      Cormorant + arcano/palo como chip.
- [x] Cuerpo con el render editorial existente (`MarkdownArticle`) si el contenido lo amerita.
- [x] `alt` en español derivado del nombre de la carta.
- [x] Tests (hero con arte de carta, breadcrumb, chip, alt).
- [x] Coverage ≥ 80% (alcanzado 100% statements/branch/funcs/lines).

**Bonus incluido en esta tarea:**
- Migración de 78 imágenes de cartas de Wikimedia Commons → assets locales WebP (22 MB → 3.2 MB, -85%).
- Se eliminó `unoptimized={true}` de CardImage, CardThumbnail, CardListItem — Next.js ahora optimiza las imágenes nativamente.

#### 📁 Archivos

- `frontend/src/components/features/encyclopedia/CardDetailHero.tsx` (nuevo)
- `frontend/src/components/features/encyclopedia/CardDetailHero.test.tsx` (nuevo, 13 tests)
- `frontend/src/components/features/encyclopedia/CardDetailView.tsx` (refactorizado, usa CardDetailHero)
- `frontend/src/components/features/encyclopedia/index.ts` (exporta CardDetailHero)
- `frontend/public/images/tarot/` (78 WebPs nuevos)
- `backend/.../major-arcana.data.ts` / `minor-arcana.data.ts` (URLs actualizadas)

---

### T-ENC-014: Generación y Optimización de Assets (WebP)

**Prioridad:** 🟠 Alta · **Estimación:** 3 pts · **Dependencias:** ninguna (habilita 010/012/013)

#### ✅ Tareas específicas

- [ ] Generar con IA todas las imágenes de §C usando la **fórmula base** (§6 del feedback).
- [ ] Paleta violeta/índigo + dorado, `no text`, coherentes con `hero-bg.webp` / `tarot-cards.webp`.
- [ ] Exportar a **WebP** (seguir `frontend/docs/IMAGE_OPTIMIZATION.md`): heros ~1792px,
      secciones ~1000px, laterales 4:5 ~640px.
- [ ] Nombres semánticos según §C; guardar en `frontend/public/images/enciclopedia/`.

#### 🎯 Criterios de aceptación

- Set completo disponible y optimizado; peso por imagen acorde a la guía de optimización.

---

## PARTE C: PROMPTS DE IMÁGENES (apéndice de generación)

> **Fórmula base (FEEDBACK §6):**
> `Ethereal digital painting, [SUJETO], fine gold line detail, deep violet and indigo night sky, crescent moon, golden bokeh and stardust, dreamy mystical premium atmosphere, soft haze, cinematic glow, no text, no watermark, [RATIO]`
> Heros = `21:9` · Secciones = `16:9` (lateral `4:5`). Variar **solo el sujeto**.

### C.1 — Numerología (`guide_numerology`)

| Asset                          | Sección (H2)                  | Sujeto (`[SUJETO]`)                                                                                 |
| ------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `guia-numerologia-hero.webp`   | Hero (21:9)                   | glowing golden numerals from 1 to 9 floating within sacred geometry, a luminous numeric mandala     |
| `numerologia-pitagoras.webp`   | 1. Origen / Pitágoras         | an ancient Greek philosopher contemplating golden numbers above a marble temple, classical mystical |
| `numerologia-numeros-base.webp`| 2. Números base 1–9           | nine radiant golden archetypal numerals arranged in a circle, each glowing softly                   |
| `numerologia-maestros.webp`    | 3. Números maestros 11/22/33  | three towering luminous master numbers ascending as pillars of golden light                         |
| `numerologia-mapa-alma.webp`   | 4. Cálculo del perfil         | a glowing birth date dissolving into streams of golden numbers, a soul map forming                  |
| `numerologia-ciclos.webp`      | 5. Ciclos del tiempo          | a spiral calendar wheel made of golden numerals turning through the seasons                         |

### C.2 — Péndulo (`guide_pendulum`)

| Asset                        | Sección (H2)                | Sujeto                                                                                       |
| ---------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| `guia-pendulo-hero.webp`     | Hero (21:9)                 | a crystal pendulum suspended mid-swing, glowing, casting golden arcs over a mystical chart    |
| `pendulo-historia.webp`      | 1. Historia de la radiestesia| antique dowsing rods and a brass pendulum on aged parchment, vintage mystical mood            |
| `pendulo-tipos.webp`         | 2. Tipos de péndulos        | a row of different crystal pendulums (quartz, amethyst, brass) hanging, glowing softly         |
| `pendulo-limpieza.webp`      | 3. Limpieza y consagración  | a pendulum bathed in moonlight and curling incense smoke, purification ritual                  |
| `pendulo-calibracion.webp`   | 4. Calibración              | a pendulum swinging along glowing golden yes/no axes, calibration diagram, elegant             |
| `pendulo-preguntar.webp`     | 5. El arte de preguntar     | a hand holding a pendulum over an open notebook, golden focus glow, introspective              |

### C.3 — Carta Astral (`guide_birth_chart`)

| Asset                          | Sección (H2)              | Sujeto                                                                                  |
| ------------------------------ | ------------------------- | --------------------------------------------------------------------------------------- |
| `guia-carta-astral-hero.webp`  | Hero (21:9)               | a luminous natal birth chart wheel with planets and zodiac glyphs in fine gold line      |
| `carta-astral-requisitos.webp` | 1. Qué necesitas          | a birth certificate, a globe and an antique clock glowing, the data of a soul's origin   |
| `carta-astral-big3.webp`       | 2. La Trinidad (Big 3)    | sun, moon and rising horizon aligned as a luminous trinity over a cosmic landscape       |
| `carta-astral-planetas.webp`   | 3. Los planetas           | a procession of the classical planets orbiting in deep violet cosmos, fine gold line     |
| `carta-astral-casas.webp`      | 4. Las 12 casas           | a chart wheel divided into twelve glowing houses hovering above the earth                 |
| `carta-astral-aspectos.webp`   | 5. Los aspectos           | geometric golden lines (trine, square, opposition) connecting planets across the wheel   |
| `carta-astral-nodos.webp`      | 6. Nodos lunares          | the north and south lunar nodes joined by a karmic golden path across a starry sky        |

### C.4 — Rituales (`guide_ritual`)

| Asset                        | Sección (H2)                  | Sujeto                                                                                   |
| ---------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `guia-rituales-hero.webp`    | Hero (21:9)                   | a mystical altar with lit candles, crystals and herbs glowing, sacred ritual atmosphere   |
| `rituales-energia.webp`      | 1. Psicología y energía       | a meditating figure radiating a luminous golden aura, intention made visible              |
| `rituales-espacio.webp`      | 2. Espacio sagrado            | a glowing circle of salt and candles forming a protected sacred space                     |
| `rituales-rueda-tiempo.webp` | 3. Fases lunares y días       | a wheel of moon phases ringed with golden weekday glyphs, lunar calendar                   |
| `rituales-herramientas.webp` | 4. Correspondencias básicas   | herbs, crystals, colored candles and incense arranged as ritual tools, fine gold detail   |
| `rituales-estructura.webp`   | 5. Estructura del ritual      | an elegant step diagram of a ritual rising as golden light, minimal                       |
| `rituales-etica.webp`        | 6. Ética mágica               | balanced golden scales of light beneath a crescent moon, harmony and responsibility       |

### C.5 — Horóscopo Occidental (`guide_horoscope`)

| Asset                            | Sección (H2)                  | Sujeto                                                                                |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| `guia-horoscopo-hero.webp`       | Hero (21:9)                   | a complete zodiac wheel with twelve glowing sign glyphs and fine constellation lines   |
| `horoscopo-historia.webp`        | 1. Historia de la astrología  | ancient astronomers charting a Babylonian night sky with golden constellations         |
| `horoscopo-elementos.webp`       | 2. Elementos y modalidades    | the four element symbols (fire, earth, air, water) in fine gold line over violet cosmos |
| `horoscopo-arquetipos.webp`      | 3. Los 12 arquetipos          | a procession of the twelve zodiac constellations across a starry violet sky            |
| `horoscopo-compatibilidad.webp`  | 4. Compatibilidad (sinastría) | two natal chart wheels overlapping in luminous golden harmony                          |
| `horoscopo-transitos.webp`       | 5. Tránsitos planetarios      | planets drifting across a zodiac band leaving golden trails, the cosmic weather        |

### C.6 — Horóscopo Chino (`guide_chinese`)

| Asset                                | Sección (H2)              | Sujeto                                                                              |
| ------------------------------------ | ------------------------- | ----------------------------------------------------------------------------------- |
| `guia-horoscopo-chino-hero.webp`     | Hero (21:9)               | the twelve Chinese zodiac animals in fine gold line arranged in a luminous circle    |
| `horoscopo-chino-carrera.webp`       | 1. La Gran Carrera        | the twelve zodiac animals racing across a mythic river under a golden sky            |
| `horoscopo-chino-animales.webp`      | 2. Los 12 arquetipos      | a procession of the twelve Chinese zodiac animals, elegant fine gold silhouettes     |
| `horoscopo-chino-wuxing.webp`        | 3. Los cinco elementos    | the Wu Xing cycle — wood, fire, earth, metal, water — as a glowing golden pentagon    |
| `horoscopo-chino-compatibilidad.webp`| 4. Compatibilidad         | pairs of Chinese zodiac animals in harmonious golden alignment                       |
| `horoscopo-chino-bazi.webp`          | 5. Ba Zi: cuatro pilares  | four luminous golden pillars of destiny rising against a violet starry sky           |

### C.7 — Astrología (hero genérico por categoría)

> Una imagen por categoría (`16:9`, sirve de banda de cabecera). Si una entidad reutiliza
> mejor el hero de su guía, priorizarlo.

| Asset                    | Categoría        | Sujeto                                                                       |
| ------------------------ | ---------------- | ---------------------------------------------------------------------------- |
| `astro-signos.webp`      | `zodiac_sign`    | a zodiac wheel of twelve glowing sign glyphs over deep violet cosmos          |
| `astro-planetas.webp`    | `planet`         | the classical planets orbiting in a luminous golden cosmos                    |
| `astro-casas.webp`       | `astro_house`    | a chart wheel divided into twelve glowing houses above the earth's horizon    |
| `astro-elementos.webp`   | `element`        | the four elements (fire, earth, air, water) as fine gold symbols in balance   |
| `astro-modalidades.webp` | `modality`       | three motion glyphs (cardinal, fixed, mutable) as flowing golden forms        |

### C.8 — Detalle de cartas de tarot

> **Sin assets nuevos generados.** El hero del detalle reutiliza el **arte propio de la carta**
> (ya disponible en el mazo) como protagonista sobre la banda de marca (gradiente noche +
> estrellas + halo dorado). Generar 78 imágenes sería innecesario y pesado. La única pieza de
> ambiente opcional es un fondo reutilizable:
>
> `astro-tarot-fondo.webp` (16:9) — _Sujeto:_ `a soft empty mystical backdrop, deep violet indigo haze with golden bokeh and a crescent moon, gentle vignette, lots of negative space`

---

## REGLAS DE EJECUCIÓN

- Cada tarea frontend se ejecuta siguiendo `docs/WORKFLOW_FRONTEND.md` (TDD, ciclo de calidad
  completo, PR a `develop`).
- Sin `any` / `eslint-disable` / `@ts-ignore`; texto user-facing en español; rutas y endpoints
  centralizados; `alt` en español en toda imagen nueva.
- Reutilizar `ArticleHero`, `MarkdownArticle`, `Reveal` y la data `encyclopedia-editorial.data.ts`
  de la Fase 1 — **no** crear infraestructura nueva salvo lo estrictamente necesario (T-ENC-012/013).
