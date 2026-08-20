# Backlog SEO — Fase 2: Volumen Editorial (agosto 2026)

> **Continuación de [BACKLOG_SEO_ADSENSE_2026_08.md](./BACKLOG_SEO_ADSENSE_2026_08.md).**
> Aquella fase arregló **cómo** se sirve el contenido. Ésta arregla **cuánto** contenido hay
> —y **qué** dice.

---

## Por qué existe esta fase

El 19-ago-2026 AdSense rechazó el sitio por segunda vez con el mismo motivo: **"Contenido de poco
valor"**.

El rechazo entró a las **09:12**. El deploy que llevó a producción los arreglos de la fase 1
—T-SEO-002, 003 y 004, mergeados entre el 10 y el 13 de agosto— salió recién a las **19:43** del
mismo día, porque el build de Docker estuvo roto dos semanas con CI en verde y eso lo destrabó
T-SEO-005. **AdSense revisó el sitio viejo.** Es el dato que hay que tener presente antes de sacar
conclusiones sobre si la fase 1 sirvió: sirvió, pero no llegó a tiempo.

Ahora bien: medir producción **después** del deploy deja ver un problema distinto, que la fase 1 no
tocó porque no estaba en su alcance.

### Lo que mide el guardarraíl hoy (19-ago-2026, post-deploy)

`npm run check:indexable -- --base-url https://auguriatarot.com` → **162 de 178 URLs** superan las
120 palabras propias (antes del deploy eran 130). El chrome mide 41 palabras.

| Profundidad (palabras propias) | URLs | % del sitio |
| --- | --- | --- |
| < 120 (bajo el umbral) | 16 | 9 % |
| 120–299 | 76 | **43 %** |
| 300–599 | 78 | 44 % |
| 600–999 | 7 | 4 % |
| 1000+ | 1 | 0,5 % |

**Solo 8 de 178 URLs (4,5 %) llegan a 600 palabras.**

### El desglose que explica el rechazo

| Sección | URLs | Promedio de palabras propias |
| --- | --- | --- |
| **`/enciclopedia/tarot`** | **79** | **166** |
| `/enciclopedia/astrologia` | 38 | 410 |
| `/horoscopo` | 13 | 432 |
| `/horoscopo-chino` | 13 | 369 |
| `/enciclopedia/guias` | 8 | 695 |
| `/enciclopedia/elementos` | 7 | 405 |
| `/rituales` | 5 | 358 |
| `/servicios` | 4 | 210 |

**Las 79 fichas de tarot son el 44 % del sitio y promedian 166 palabras.** No están rotas: se
renderizan en el servidor, tienen `<title>` propio, canonical propio y contenido real. Son
**cortas**. Un revisor que abre cinco URLs al azar tiene 44 % de probabilidad de caer en una ficha
de 166 palabras, y ésa es la muestra sobre la que decide.

Las 16 URLs bajo el umbral (107–119 palabras) son 15 arcanos menores y
`/servicios/limpiezas-energeticas`: el mismo problema, un poco peor.

### Qué NO es el problema

Conviene dejarlo escrito para no volver a auditar lo mismo:

- **No es renderizado.** El sitio es Next.js 16 (App Router, SSG + ISR), no una SPA. Pidiendo el HTML
  crudo con User-Agent de Googlebot y sin ejecutar JavaScript, la home entrega 609 palabras propias.
  Eso lo cerraron T-PROD-020 y la fase 1.
- **No son los soft-404.** T-SEO-006 los arregló y es correcto arreglarlos —meten URLs vacías al
  índice—, pero "contenido de poco valor" en AdSense se refiere a densidad editorial, no a status
  HTTP.
- **No es `ads.txt`.** Verificado y autorizado en el panel.

---

## Tareas

| ID | Tarea | Tipo | Prioridad | Estimación | Estado |
| --- | --- | --- | --- | --- | --- |
| T-SEO-008 | Modelo de contenido extendido para las fichas de tarot | Backend | 🔴 Crítica | 2 pts | ✅ Completada |
| T-SEO-009 | Redactar y cargar el contenido de las 78 fichas | Contenido | 🔴 Crítica | 5 pts | ⬜ Pendiente |
| T-SEO-010 | Renderizar las secciones nuevas + guardarraíl de largo | Frontend | 🔴 Crítica | 2 pts | ⬜ Pendiente |
| T-SEO-011 | Página `/sobre-nosotros` y señales de autoría (E-E-A-T) | Frontend | 🟠 Alta | 2 pts | ⬜ Pendiente |
| T-SEO-012 | `/servicios/[slug]`: las 4 fichas promedian 210 palabras | Frontend | 🟡 Media | 1,5 pts | ⬜ Pendiente |
| T-SEO-013 | "Salud" fuera del texto visible (YMYL) | Front + Back + datos | 🟠 Alta | 2 pts | 🟡 Parcial |

**⛔ No pedir la tercera revisión de AdSense hasta tener 008, 009, 010, 011 y 013 en producción, más
los pendientes de Search Console.** Ver *Puerta de salida* al final.

---

## 📌 Orden de desarrollo (fuente única)

> Incluye las tareas de [`BACKLOG_DEUDA_TECNICA_2026_08.md`](./BACKLOG_DEUDA_TECNICA_2026_08.md),
> porque el orden se cruza entre los dos backlogs. **Si cambia el orden, se cambia acá y en ningún
> otro lado.**

| # | Tarea | Est. | Por qué va ahí |
| --- | --- | --- | --- |
| 1 | ~~**T-DEUDA-003**~~ ✅ | 0,5 pts | Cerrada 19-ago-2026: producción sana, base local resincronizada |
| 2 | **T-SEO-009 + la parte de tarot de T-SEO-013** | 5 pts | Camino crítico, en una sola pasada |
| 3 | **T-SEO-011** | 2 pts | En paralelo, durante la revisión humana de las 78 fichas |
| 4 | **T-SEO-010** | 2 pts | Necesita el contenido de 009 cargado para verificar |
| 5 | **Resto de T-SEO-013** | ~1,5 pts | Carta astral, numerología, prompts de IA, guardarraíl |
| 6 | **Deploy + verificación en producción + Search Console** | — | Recién ahí se pide la revisión |
| 7 | T-SEO-012 | 1,5 pts | No está en la puerta de salida |
| 8 | T-DEUDA-002 | 1 pt | Los 2 índices reales de `sessions` |
| 9 | T-DEUDA-001 | 2 pts | El más largo y el menos urgente |

**Hasta poder pedir la tercera revisión: ~11 pts** (009 + 011 + 010 + resto de 013). El medio punto
de T-DEUDA-003 ya está gastado.

### Por qué este orden y no el obvio

**T-DEUDA-003 primero, aunque no sea de negocio.** ✅ **Hecha el 19-ago-2026.** Eran treinta minutos
y hacía dos cosas: decir si `planExpiresAt` está sano en producción —**lo está**, las 13 columnas en
`timestamptz`— y resincronizar la base de desarrollo. Lo segundo importa porque T-SEO-009 es todo
trabajo de seeder contra la base local, y arrancar las 78 fichas sobre una base desincronizada es
debugging que no tiene nada que ver con el contenido. **T-SEO-009 arranca desbloqueada.**

**009 y la parte de tarot de 013 van juntas.** `major-arcana.data.ts` y `minor-arcana.data.ts` tienen
"salud" en los significados existentes y son los mismos archivos donde 009 agrega las secciones
nuevas. Separarlas es escribir dos veces el mismo párrafo y comerse conflictos de merge en los dos
archivos de datos más grandes del repo. Ver las notas de T-SEO-013.

**011 va en el medio, no al final.** El cuello de botella de 009 no es de código: es *cada ficha
revisada por una persona antes de cargarse*. 011 es independiente, entra en la puerta de salida y es
el trabajo que se puede intercalar mientras se revisan fichas.

**010 después de que 009 esté completo, no en paralelo.** El guardarraíl de 010 exige que ninguna
sección quede vacía en ninguna ficha: si entra con 40 de 78 cartas cargadas, deja el CI en rojo.

**"Mergeado" no es "en producción".** Es la lección del 19-ago: AdSense revisó el sitio viejo porque
el deploy salió diez horas después del rechazo. El paso 6 no es trámite.

---

## ⚠️ Regla transversal de terminología (aplica a TODAS las tareas)

**La palabra "salud" no va en ningún texto visible del sitio. El término es "energía y bienestar".**

No es cosmético. Un sitio que ofrece lecturas de tarot *"de salud"* o una carta astral que habla de
*"la salud del consultante"* se lee como **consejo médico**: es territorio **YMYL** (*Your Money or
Your Life*), la categoría donde Google aplica su estándar de calidad más exigente y donde exige
autoría y credenciales verificables que un sitio de tarot no puede acreditar. Para un revisor de
AdSense que ya rechazó el sitio dos veces, es una señal negativa gratuita.

**Todo contenido nuevo que se escriba en esta fase nace con esta regla aplicada.** El detalle de la
limpieza de lo que ya existe está en T-SEO-013.

---

## T-SEO-008: Modelo de Contenido Extendido para las Fichas de Tarot

**Estado:** ✅ COMPLETADA (19-ago-2026)
**Prioridad:** 🔴 Crítica · **Estimación:** 2 pts · **Dependencias:** ninguna

### Problema

La entidad [`EncyclopediaTarotCard`](../backend/tarot-app/src/modules/encyclopedia/entities/encyclopedia-tarot-card.entity.ts)
tiene exactamente cuatro campos de contenido:

| Campo | Tipo | Qué guarda |
| --- | --- | --- |
| `meaningUpright` | `text` | significado derecho |
| `meaningReversed` | `text` | significado invertido |
| `description` | `text` (nullable) | descripción de la carta y su imagen |
| `keywords` | `jsonb` | palabras clave derecho/invertido |

Con eso no se llega a 500 palabras por más que se alargue cada campo: estirar `meaningUpright` hasta
300 palabras produce un muro de texto, no un artículo. **Faltan secciones, no caracteres.**

### Decisión de diseño a tomar

Dos caminos, y conviene elegir explícitamente antes de escribir la migración:

**(A) Columnas de texto nombradas** — una por sección fija. Se puede validar el largo por columna, el
frontend renderiza secciones discretas sin parsear nada, y la API mantiene un contrato tipado.
**(B) Un único `content: text` en Markdown**, como ya hace `EncyclopediaArticle`. Más flexible, pero
el largo solo se puede validar sobre el total y el frontend pierde la estructura.

**Recomendación: (A) para las secciones que son las mismas en las 78 cartas, `jsonb` para lo que
varía.** El motivo es el guardarraíl: con (B) una ficha puede cumplir el total teniendo una sección
vacía y otra inflada, y eso es exactamente lo que no queremos que pase sin que nadie se entere.

**Decisión tomada: (A).** Seis columnas de texto nombradas + `combinations` en `jsonb`.

### Alcance

- [x] Campos nuevos en la entidad, **todos nullable** (el deploy tiene que poder salir antes de que
      exista el contenido):

  | Campo | Tipo | Contenido | Largo objetivo |
  | --- | --- | --- | --- |
  | `meaningLove` | `text` | la carta en el amor y los vínculos | 70–100 palabras |
  | `meaningWork` | `text` | la carta en el trabajo y el dinero | 70–100 |
  | `meaningWellbeing` | `text` | la carta en la **energía y el bienestar** | 60–90 |
  | `symbolism` | `text` | lectura de la imagen: figuras, colores, números | 80–120 |
  | `advice` | `text` | qué hacer cuando sale esta carta | 50–80 |
  | `yesNo` | `varchar` | respuesta en tiradas de sí/no + matiz | 20–40 |
  | `combinations` | `jsonb` | `[{ cardSlug, reading }]` — 3 a 5 por ficha | 30–50 c/u |

  ⚠️ El campo se llama **`meaningWellbeing`**, no `meaningHealth`: ver la regla transversal de
  terminología. El nombre del campo importa porque termina en el DTO, en Swagger y en el tipo del
  frontend, y un `meaningHealth` invita a que alguien escriba consejo médico adentro.

- [x] Migración TypeORM generada con `npm run migration:generate`
      (`1787187733536-AddExtendedContentToEncyclopediaCards.ts`). ⚠️ El archivo generado traía además
      decenas de sentencias de **drift preexistente ajeno a la tarea** —renombres de FKs e índices y
      una reversión de `AuthTimestampsToTimestamptz1776900000000` que habría devuelto los timestamps
      a `TIMESTAMP` sin zona horaria—. Se conservaron **solo** los `ALTER TABLE` de esta entidad,
      agregándoles `IF [NOT] EXISTS` para hacerlos idempotentes. El drift restante —91 sentencias en
      total, 83 tras T-DEUDA-003— quedó inventariado y agendado en
      [`BACKLOG_DEUDA_TECNICA_2026_08.md`](./BACKLOG_DEUDA_TECNICA_2026_08.md) (T-DEUDA-001 a 003).
- [x] DTOs y respuesta de la API actualizados (`CardDetailDto` + `CardCombinationDto`), con Swagger
      (`@ApiPropertyOptional`).
- [x] El endpoint de **listado** NO devuelve los campos nuevos: `CardSummaryDto` quedó intacto y hay
      un test que congela sus 7 claves.
- [x] Tests: entidad (7 casos), DTO (nuevo `card-response.dto.spec.ts`), y servicio (8 casos, entre
      ellos que el listado y las cartas relacionadas siguen sin traer los campos nuevos).

### Criterios de aceptación

- [x] La migración corre en una base con las 78 cartas cargadas sin perder datos. Verificado sobre
      la base de desarrollo: 78 cartas antes y después, mismo hash de contenido, y `down` → `up`
      redondo.
- [x] `GET /encyclopedia/cards/:slug` devuelve los campos nuevos cuando existen y los omite cuando
      son `null`, sin romper el contrato actual. Verificado contra el server real: `the-fool` con
      contenido de prueba trae las 7 claves; `the-magician` sin contenido devuelve las 19 de siempre.
- [x] `GET /encyclopedia/cards` no engorda su respuesta. Verificado: 78 items × 7 claves.

### Decisiones de implementación

- **Una sección sin contenido no viaja en la respuesta.** El mapeo omite la clave cuando el valor es
  `null`, string en blanco o lista vacía —no la manda como `null`—, así el frontend decide por
  presencia de clave y nunca renderiza un título con el cuerpo vacío mientras se carga el contenido
  de T-SEO-009.
- **`yes_no` es `varchar(500)`**, no `varchar(255)`: 40 palabras no entran cómodas en 255 caracteres.
- **El seeder y `CardSeedData` no se tocaron**: cargar contenido es T-SEO-009. Las 78 fichas existentes
  quedan con las siete columnas en `NULL`.
- **La proyección de los listados quedó acotada** a las 8 columnas que consume `CardSummaryDto`.
  Sin eso, `GET /encyclopedia/cards` —y `getNavigation`, que corre en cada página de detalle— leerían
  las ~35.000 palabras nuevas de la base solo para descartarlas apenas T-SEO-009 cargue el contenido.

### Fuera de alcance

Cargar contenido. Esta tarea deja el molde vacío; lo llena T-SEO-009.

---

## T-SEO-009: Redactar y Cargar el Contenido de las 78 Fichas

**Prioridad:** 🔴 Crítica · **Estimación:** 5 pts · **Dependencias:** T-SEO-008

### Problema

Hay que producir **~450 palabras nuevas × 78 cartas ≈ 35.000 palabras**. Es la tarea más grande de
las dos fases y es trabajo de **contenido**, no de código: el código ya va a estar listo con
T-SEO-008.

### Alcance

- [ ] **Redacción asistida por IA con revisión editorial.** Los insumos ya existen en
      [`docs/prompts_enciclopedia/`](./prompts_enciclopedia/) —`arcanos_mayores.md` y
      `arcanos_menores.md` traen el significado general por palo y las lecciones por número—, así que
      el prompt parte de material propio y no de una alucinación.
- [ ] **Español rioplatense, coherente con la voz del sitio.** El resto de la enciclopedia ya está
      escrita; la ficha nueva no puede sonar a otro autor.
- [ ] **Cada ficha revisada por una persona antes de cargarse.** No negociable: 78 fichas generadas y
      publicadas sin leer son exactamente el "contenido de poco valor" que Google penaliza, solo que
      más largo. Es el riesgo principal de esta tarea.
- [ ] **La sección de bienestar no da consejo médico.** Habla de energía, descanso, hábitos y ánimo;
      no menciona enfermedades, diagnósticos, tratamientos ni la palabra "salud". El prompt lo tiene
      que decir explícitamente, porque un modelo al que se le pide "la carta en la salud" escribe
      consejo médico por default. Ver la regla transversal.
- [ ] **Carga por seeder idempotente** (`encyclopedia-tarot-cards.seeder.ts` ya existe): correrlo dos
      veces no debe duplicar ni pisar ediciones hechas desde el panel de admin.
- [ ] Las **combinaciones** (`combinations`) tienen que referenciar slugs que existan; un slug muerto
      rompe el cross-link. ⚠️ **El backend no lo ataja**: T-SEO-008 solo omite `combinations` cuando la
      lista está vacía, así que una entrada con `cardSlug` en blanco o inexistente llega igual al
      frontend. La validación de slugs es responsabilidad de esta tarea.

### Criterios de aceptación

- [ ] Las 78 fichas superan las **500 palabras propias** medidas con
      `npm run check:indexable -- --base-url <host> --min-words 500`, filtrando la sección de tarot.
- [ ] Ninguna sección queda vacía en ninguna ficha (lo verifica el guardarraíl de T-SEO-010).
- [ ] Los párrafos no se repiten entre cartas: el test de unicidad que ya existe para los perfiles
      del horóscopo chino (T-SEO-002) se replica acá.
- [ ] Cada `combinations[].cardSlug` resuelve a una carta existente.
- [ ] `grep -i salud` sobre el contenido nuevo no devuelve nada.

### Notas

- **Por qué 500 y no 600:** el umbral de 600 que sugieren las guías de AdSense es orientativo y las
  fichas de tarot son un formato de referencia, no un ensayo. 500 palabras propias por ficha llevan
  el promedio de la sección de 166 a ~520 y el del sitio muy por encima del piso. Si el revisor
  vuelve a rechazar, subir el umbral es un cambio de contenido, no de arquitectura.
- **Orden sugerido de carga:** primero los 15 arcanos menores que hoy están bajo el umbral
  (`three-of-swords` 108, `eight-of-wands` 111, `three-of-wands` 111, `two-of-pentacles` 111,
  `five-of-wands` 112, `seven-of-wands` 112, `ten-of-wands` 112, `four-of-wands` 116,
  `seven-of-swords` 116, `six-of-pentacles` 116, `ace-of-swords` 117, `four-of-swords` 117,
  `five-of-swords` 118, `seven-of-pentacles` 118, `page-of-swords` 119), después el resto de los
  menores, después los mayores. Así el guardarraíl deja de fallar antes.

---

## T-SEO-010: Renderizar las Secciones Nuevas + Guardarraíl de Largo

**Prioridad:** 🔴 Crítica · **Estimación:** 2 pts · **Dependencias:** T-SEO-008 (bloqueante), T-SEO-009 (para verificar)

### Problema

Hoy la ficha servida tiene esta estructura de encabezados —medida sobre el HTML de producción:

```
H1  Tres de Espadas
H3  Información
H3  Palabras Clave
```

Sin `<h2>` intermedios y sin secciones temáticas. El contenido de T-SEO-009 no aparece solo: hay que
renderizarlo.

### Alcance

- [ ] `CardDetailView` renderiza las secciones nuevas como `<section>` con `<h2>` propio:

  | Campo | Encabezado visible |
  | --- | --- |
  | `meaningLove` | *En el amor* |
  | `meaningWork` | *En el trabajo* |
  | `meaningWellbeing` | ***En la energía y el bienestar*** |
  | `symbolism` | *El simbolismo de la carta* |
  | `advice` | *El consejo de la carta* |
  | `yesNo` | *¿Sí o no?* |
  | `combinations` | *Combinaciones frecuentes* |

- [ ] **Cada sección degrada sola si su campo es `null`.** Es lo que permite desplegar T-SEO-008 y
      T-SEO-010 antes de que exista todo el contenido, y cargar las fichas de a tandas.
- [ ] Las **combinaciones** son `<Link>` reales a `/enciclopedia/tarot/[slug]`, no texto plano: son
      cross-links internos que el crawler recorre y que hoy no existen entre fichas.
- [ ] Jerarquía de encabezados correcta (`h1` → `h2` → `h3`), sin saltos.
- [ ] **Guardarraíl de contenido en tests**, replicando el patrón de T-SEO-002
      (`getProfileWordCount` + `MIN_PROFILE_WORDS`): si una ficha baja del piso o le falta una
      sección, falla en CI y no en el próximo rechazo de AdSense.

### Criterios de aceptación

- [ ] Las 78 fichas superan 500 palabras propias medidas contra el build de producción.
- [ ] Una ficha con campos nuevos en `null` sigue renderizando sin huecos ni encabezados vacíos.
- [ ] `npm run check:indexable -- --base-url <host>` en verde, sin soft-404.

---

## T-SEO-011: `/sobre-nosotros` y Señales de Autoría (E-E-A-T)

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna

### Problema

**No existe ninguna página que diga quién está detrás del sitio.** El footer enlaza `/terminos`,
`/privacidad` y `/contacto`, y nada más. No hay bio, ni formación, ni foto, ni firma en el contenido.

Para un sitio que da consejo personal —tarot, astrología, rituales— eso es una señal negativa
directa en las guías de calidad de Google (E-E-A-T: *Experience, Expertise, Authoritativeness,
Trustworthiness*). Un revisor humano de AdSense que no puede identificar al autor de un sitio de
consulta espiritual tiene un motivo más para marcarlo como de poco valor.

### Alcance

- [ ] Página `/sobre-nosotros`, estática, **600+ palabras propias**: quién es Flavia, su formación y
      trayectoria, cómo trabaja, qué enfoque tiene con el tarot y la astrología, por qué existe
      Auguria y cómo se produce el contenido de la enciclopedia.
- [ ] Foto real. Una imagen de stock es peor que ninguna.
- [ ] Enlace en el footer, en el bloque de enlaces legales, junto a *Contacto*.
- [ ] Alta en `sitemap.xml` (sale sola si se agrega a las rutas estáticas de `buildSitemap`).
- [ ] **NO** agregarla a `DISALLOWED_PATHS` de `robots.ts` — es de las que más queremos que se
      indexen.
- [ ] Datos estructurados `Person`/`Organization` (JSON-LD) en la página, enlazados desde el
      `Organization` del sitio.
- [ ] Firma de autoría visible en las guías de la enciclopedia (las 8 de `/enciclopedia/guias`), que
      son el contenido editorial más extenso que hay.

### Criterios de aceptación

- [ ] `/sobre-nosotros` supera 600 palabras propias medidas con el guardarraíl.
- [ ] Se llega desde el footer de cualquier página con un `<a href>` real.
- [ ] El JSON-LD valida en el Rich Results Test de Google.

### Notas

Es la tarea de mejor relación esfuerzo/impacto de las seis: una página y un enlace. Se puede hacer
en paralelo con T-SEO-009, que es la larga.

---

## T-SEO-012: `/servicios/[slug]` — las 4 Fichas Promedian 210 Palabras

**Prioridad:** 🟡 Media · **Estimación:** 1,5 pts · **Dependencias:** ninguna

### Problema

Son solo 4 URLs, pero `/servicios/limpiezas-energeticas` está en **107 palabras** —bajo el umbral— y
la sección promedia 210. Además son las páginas **comerciales** del sitio: si un revisor entra por
ahí, ve una ficha de producto delgada.

### Alcance

- [ ] Llevar las 4 fichas a 400+ palabras propias: en qué consiste la sesión, cómo se prepara la
      persona, qué pasa durante y después, para quién es y para quién no, preguntas frecuentes.
- [ ] Verificar si el contenido debe vivir en la entidad del servicio (editable desde el panel) o en
      constantes del repo. Los servicios se editan desde admin, así que probablemente lo primero —
      pero entonces hace falta un campo nuevo, igual que en T-SEO-008.
- [ ] Ojo con `limpiezas-energeticas`: es la ficha más expuesta a prometer efectos terapéuticos.
      Aplica la regla transversal de terminología.

### Criterios de aceptación

- [ ] Las 4 URLs superan 400 palabras propias.
- [ ] `/servicios/limpiezas-energeticas` deja de aparecer bajo el umbral.

---

## T-SEO-013: "Salud" Fuera del Texto Visible (YMYL)

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna
**Estado:** 🟡 PARCIAL — el código está hecho ([PR #629](https://github.com/ArielDRighi/TarotFlavia/pull/629)); falta el corpus sembrado en la base

### Problema

La palabra "salud" aparecía **220 veces en ~50 archivos** entre frontend y backend, y buena parte se
renderizaba: el chip de especialidad del marketplace, la categoría de lectura del tarot, la Casa VI
de la carta astral, la metadata de las 13 fichas de horóscopo, la pantalla de bloqueo del péndulo.

Ver la *Regla transversal de terminología* arriba para el motivo. En resumen: es territorio YMYL y no
hay nada que ganar quedándose con la palabra.

### Hecho (PR #629)

Las tres clases de ocurrencia se tratan distinto, y ésa es la parte que importa de esta tarea:

- [x] **Texto visible → cambiado.** Chip y badge de especialidad, categoría de lectura, pantalla de
      bloqueo y disclaimer del péndulo, metadata del horóscopo, intro del listado de tarotistas, dos
      perfiles del horóscopo chino (donde "salud" era el rubro laboral) y la Casa VI de la carta
      astral (*Trabajo y Bienestar*).
- [x] **Sin migración de base.** Los dos valores que vienen de la API se resuelven con un mapa de
      etiqueta visible: `specialtyLabel()` en `lib/constants/marketplace.ts` y `categoryLabel()` en
      `CategorySelector.tsx`. El valor guardado no cambia, así que el filtro del marketplace sigue
      andando y —clave— **el slug `salud-bienestar` no se toca porque el gating FREE filtra por
      slug** (`reading-validator.service.ts`). Renombrarlo habría dejado a los usuarios FREE sin
      acceso a una de sus tres categorías.
- [x] **Las salvaguardas quedan intactas.** `blockedTerms` del validador del péndulo y la categoría
      `'salud'` que devuelve son lo que **detecta y bloquea** preguntas sobre enfermedad,
      diagnóstico y tratamiento. Renombrarlas apagaría la protección. Lo que cambió es el texto que
      ve el usuario: *"Tema Médico Detectado"* y *"consultá con un profesional de la medicina"* —
      igual de firme y más preciso.

### Pendiente: el corpus sembrado en la base

Quedan **~180 ocurrencias** que no alcanza con cambiar en el repo, porque el contenido ya está
sembrado en la base de producción:

| Archivo | Ocurrencias | Dónde se ve |
| --- | --- | --- |
| `modules/tarot/cards/seeds/card-free-interpretations.data.ts` | 58 | interpretaciones de las lecturas gratuitas |
| `database/seeds/birth-chart/03-planets-in-houses.md` | 20 | resultado y PDF de la carta astral |
| `database/seeds/data/predefined-questions.data.ts` | 10 | preguntas sugeridas en el circuito de tarot |
| `modules/encyclopedia/data/astrological-houses.data.ts` | 9 | `/enciclopedia/astrologia/casas/*` |
| `database/seeds/birth-chart/02-planets-in-signs.md` | 8 | carta astral |
| `database/seeds/reading-categories.seeder.ts` + `.seed.ts` | 6 | nombre y descripción de la categoría |
| `modules/encyclopedia/data/{minor,major}-arcana.data.ts` | varias | fichas de tarot |
| `modules/numerology/data/interpretations.data.ts` | varias | numerología |
| resto (guías de actividad, prompts del horóscopo chino, plantillas de email) | resto | varios |

- [ ] Reescribir el corpus con la terminología nueva.
- [ ] **Re-seed o migración de datos**, según si el registro se edita desde el panel de admin: si se
      edita, una migración que pise el texto borraría cambios editoriales.
- [ ] Renombrar el `name` y la `description` de la categoría `salud-bienestar` en la base — con eso
      el `categoryLabel()` del frontend queda redundante y se puede sacar. **El slug se queda como
      está**: migrarlo toca el gating FREE en los dos lados.
- [ ] Revisar los prompts de IA (`chinese-horoscope.prompts.ts`, síntesis de carta astral): si el
      prompt dice "salud", el modelo devuelve texto con la palabra y reaparece por la puerta de
      atrás, sin pasar por ningún archivo del repo.
- [ ] Guardarraíl: un test que falle si aparece "salud" en los datos de seed. Es la única forma de
      que esto no vuelva dentro de tres meses.

### Criterios de aceptación

- [ ] `grep -rniI "salud" frontend/src backend/tarot-app/src` solo devuelve slugs, valores de base,
      claves de mapas, comentarios, fixtures de test y la lista de términos bloqueados del péndulo.
- [ ] Ninguna página de producción muestra la palabra: verificable barriendo el HTML servido de las
      178 URLs del sitemap.
- [ ] Las preguntas sobre enfermedad siguen bloqueadas en el péndulo (test de regresión existente).

### Notas

- **Se solapa con T-SEO-009.** Las fichas de tarot se reescriben enteras ahí; conviene hacer las dos
  cosas en la misma pasada y no reescribir el mismo texto dos veces.
- **El campo nuevo se llama `meaningWellbeing`, no `meaningHealth`** (T-SEO-008). Un nombre de campo
  con "health" invita a que alguien escriba consejo médico adentro dentro de seis meses.

---

## 🚪 Puerta de salida: cuándo pedir la tercera revisión

Un tercer rechazo cuesta más que dos semanas de trabajo. **Todo esto tiene que estar hecho y
verificado en producción antes de tocar el botón:**

- [ ] T-SEO-008, 009, 010, 011 y 013 desplegadas y verificadas **en producción** (no solo mergeadas
      — ver qué pasó el 19-ago con el deploy roto).
- [ ] `npm run check:indexable -- --base-url https://auguriatarot.com` en **verde**: 178/178 sobre el
      umbral y sin soft-404.
- [ ] El promedio de `/enciclopedia/tarot` por encima de **500 palabras** (hoy 166).
- [ ] Ninguna página muestra la palabra "salud".
- [ ] **Search Console: sitemap reenviado y re-indexación pedida**, y confirmado que Google ya
      rastreó la versión nueva. Está pendiente desde el primer rechazo y es tan importante como el
      contenido: si el revisor mira el índice y no el sitio en vivo, ve las páginas de 3 palabras
      aunque estén arregladas.
- [ ] Verificado que no estén dados de alta `www` y no-`www` sirviendo lo mismo.

### Verificación rápida antes de pedirla

```bash
cd frontend
npm run check:indexable -- --base-url https://auguriatarot.com
# Debe terminar con exit 0, "178/178 cumplen" y "✅ Sin soft-404".
```

---

**Última actualización:** 19-ago-2026
