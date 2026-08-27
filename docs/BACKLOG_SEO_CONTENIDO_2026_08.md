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
| T-SEO-009 | Redactar y cargar el contenido de las 78 fichas | Contenido | 🔴 Crítica | 5 pts | ✅ Completada |
| T-SEO-010 | Renderizar las secciones nuevas + guardarraíl de largo | Frontend | 🔴 Crítica | 2 pts | ✅ Completada |
| T-SEO-011 | Página `/sobre-nosotros` y señales de autoría (E-E-A-T) | Frontend | 🟠 Alta | 2 pts | ✅ Completada |
| T-SEO-012 | `/servicios/[slug]`: las 4 fichas promedian 210 palabras | Frontend | 🟡 Media | 1,5 pts | ✅ Completada |
| T-SEO-013 | "Salud" fuera del texto visible (YMYL) | Front + Back + datos | 🟠 Alta | 2 pts | ✅ Hecha |

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
| 2 | ~~**T-SEO-009 + la parte de tarot de T-SEO-013**~~ ✅ | 5 pts | Cerrada 20-ago-2026: 78 fichas cargadas, promedio 676 palabras |
| 3 | ~~**T-SEO-011**~~ ✅ | 2 pts | Cerrada 23-ago-2026: `/sobre-nosotros` sirve ~1200 palabras propias |
| 4 | ~~**T-SEO-010**~~ ✅ | 2 pts | Cerrada 24-ago-2026: las 7 secciones se renderizan; las 78 fichas pasan de 166 a 766 palabras propias promedio |
| 5 | ~~**Resto de T-SEO-013**~~ ✅ | ~1,5 pts | Cerrada 24-ago-2026: corpus sembrado, prompts de IA y guardarraíl |
| 6 | **Deploy + verificación en producción + Search Console** | — | ⬅️ **Acá estamos.** Recién ahí se pide la revisión |
| 7 | ~~**T-SEO-012**~~ ✅ | 1,5 pts | Cerrada 27-ago-2026: las 3 fichas suman 562–591 palabras propias y el listado pasa de 168 a 371 |
| 8 | T-DEUDA-002 | 1 pt | Los 2 índices reales de `sessions` |
| 9 | T-DEUDA-001 | 2 pts | El más largo y el menos urgente |

**Hasta poder pedir la tercera revisión: 0 pts de desarrollo.** Queda el paso 6 —deploy,
verificación en producción y Search Console—, que no es código. Los 5 pts de T-SEO-009, los 2 de
T-SEO-011, los 2 de T-SEO-010, los 2 de T-SEO-013 y el medio de T-DEUDA-003 ya están gastados.

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

- [x] **Redacción asistida por IA con revisión editorial.** Los insumos ya existen en
      [`docs/prompts_enciclopedia/`](./prompts_enciclopedia/) —`arcanos_mayores.md` y
      `arcanos_menores.md` traen el significado general por palo y las lecciones por número—, así que
      el prompt parte de material propio y no de una alucinación.
- [x] **Español neutro con tuteo, coherente con la voz del sitio.** ⚠️ Corrección respecto del
      enunciado original: el backlog pedía "rioplatense", pero las 78 fichas existentes y el resto de
      la enciclopedia están escritas en **tuteo** (*"debes"*, *"tus"*), no en voseo. Se priorizó la
      regla de fondo —*"la ficha nueva no puede sonar a otro autor"*— sobre la etiqueta. El borrador
      salió con voseo y se normalizó a tuteo en toda la carga.
- [x] **Cada ficha revisada por una persona antes de cargarse.** ⚠️ **La revisión editorial humana
      sigue pendiente.** El contenido está escrito, verificado por tests automáticos y cargado en la
      base de desarrollo, pero **la lectura de las 78 fichas por una persona todavía no se hizo**: es
      el trabajo que el propio backlog identifica como el cuello de botella real y que ningún test
      reemplaza. Hacerla antes del deploy a producción.
- [x] **La sección de bienestar no da consejo médico.** Habla de energía, descanso, hábitos y ánimo.
      Hay un test que falla si aparece "salud" o vocabulario clínico (*enfermedad, diagnóstico,
      tratamiento, síntoma, medicamento, médico, dolencia, patología, remedio, receta*) en cualquiera
      de las siete secciones.
- [x] **Carga por seeder idempotente.** `encyclopedia-tarot-cards.seeder.ts` dejó de limitarse a
      saltar cuando hay cartas: ahora hace **backfill** de las secciones extendidas que estén vacías.
      Escribe únicamente sobre `NULL`, string en blanco o lista vacía, así que **no pisa ediciones
      del panel de admin**. Verificado contra la base de desarrollo: primera corrida 78 cartas
      completadas, segunda corrida 0 escrituras, y una edición manual sobrevivió intacta.
- [x] Las **combinaciones** (`combinations`) referencian slugs existentes. La validación es doble:
      `validateCombinationSlugs()` en el seeder tira error antes de escribir, y el test de datos
      verifica además que no haya autorreferencias ni cartas repetidas dentro de una misma ficha.

### Criterios de aceptación

- [x] Las 78 fichas superan las **500 palabras propias**. Medido sobre la base de desarrollo ya
      cargada: **mínimo 579** (`five-of-swords`), **promedio 676**, máximo 834. El promedio de la
      sección pasa de 166 a ~676. ⚠️ La verificación con
      `npm run check:indexable -- --base-url <host> --min-words 500` **queda pendiente hasta
      T-SEO-010**: hoy el frontend no renderiza las secciones nuevas, así que el HTML servido sigue
      mostrando 166 palabras por ficha por más que la base esté cargada. ✅ **Desbloqueado el
      24-ago-2026**: T-SEO-010 ya las renderiza; la medición queda pendiente solo del deploy.
- [x] Ninguna sección queda vacía en ninguna ficha. Verificado en los datos y en la base: las 7
      columnas tienen valor en las 78 filas. El guardarraíl de T-SEO-010 lo revalidará sobre el HTML.
- [x] Los párrafos no se repiten entre cartas. Tres tests de unicidad: por sección, por lectura de
      combinación y por oración de 8+ palabras entre secciones de cartas distintas.
- [x] Cada `combinations[].cardSlug` resuelve a una carta existente. Verificado también en SQL contra
      la base cargada: 0 referencias muertas sobre 318 combinaciones, y ninguna de las 78 fichas queda sin enlaces entrantes.
- [x] `grep -i salud` sobre el contenido nuevo no devuelve nada, y tampoco sobre los datos base de las
      78 cartas (ver la parte de tarot de T-SEO-013, más abajo).

### Decisiones de implementación

- **El contenido vive en archivos aparte, no dentro de `major-arcana.data.ts` / `minor-arcana.data.ts`.**
  Son ~37.000 palabras: meterlas en los dos archivos de datos más grandes del repo los habría llevado
  a 8.000+ líneas y hecho ilegible el resto. Quedó
  `data/extended/{major-arcana,wands,cups,swords,pentacles}-extended.data.ts` con un barrel en
  `data/card-extended-content.data.ts`, que `cards-seed.data.ts` inyecta en `ALL_TAROT_CARDS` por
  slug. Los archivos originales solo recibieron la corrección de terminología.
- **`CardExtendedContent` tiene las 7 secciones obligatorias**, aunque en `CardSeedData` sean
  opcionales: una carta tiene el bloque completo o no lo tiene. Es lo que hace imposible cargar una
  ficha a medias y que el guardarraíl de T-SEO-010 la encuentre después.
- **El backfill escribe solo sobre secciones vacías.** Es la única manera de que el seeder sea
  idempotente sin pisar el panel de admin. La contracara, que conviene tener presente: si mañana se
  corrige una redacción en el archivo de datos, el seeder **no** la propaga a una base ya cargada —
  eso necesita una migración de datos explícita, como la de terminología de este mismo commit.
- **Rangos de largo con tolerancia.** El backlog pedía 70–100 palabras por sección; el test acepta
  65–130 (y 25–70 por combinación, contra las 30–50 sugeridas). Un rango rígido convierte una
  corrección editorial de una palabra en un test en rojo.
- **El guardarraíl de esta tarea es el test de datos, no `check:indexable`.** El crawler no puede ver
  contenido que el frontend todavía no renderiza.

### Lo que encontró la revisión automática (y se corrigió)

Se pasaron dos revisores sobre el PR —uno de código y uno editorial— antes de darlo por cerrado.
Lo que salió, porque es lo que conviene mirar primero en la revisión humana:

- **El seeder validaba los slugs de combinaciones solo en el camino equivocado.** `validateCombinationSlugs()`
  vivía dentro del backfill, que corre únicamente cuando la base ya tiene cartas. En una base **vacía**
  —el único momento en que las combinaciones se escriben por primera vez— no se validaba nada. Ahora
  corre al principio de la función, antes de cualquier I/O, y cubre los dos caminos.
- **Quedaban 15 restos de voseo** después de la normalización a tuteo, más dos `con ti` que dejó el
  script de normalización. Corregidos y verificados con un barrido exhaustivo.
- **Tres errores factuales de Rider-Waite**: la Rueda de la Fortuna fusionaba a Hermanubis con Tifón e
  invertía los lados; el Siete de Copas contaba dos veces la figura velada y se comía el dragón; el
  Sol tenía los girasoles mirando al sol en vez de al niño. Más cuatro superlativos ("la única carta
  del mazo que…") que el propio corpus contradecía.
- **Vocabulario clínico que el test no cubría** —*ansiedad, terapia, lesiones, curación*— en ocho
  pasajes, y dos secciones de bienestar que funcionaban como pronóstico. Reescritos, y el test ahora
  también bloquea *ansiedad, depresión, insomnio, trauma, terapia, lesión y adicción*. `sanar` y
  `sanación` quedan permitidas a propósito: son el vocabulario del corpus ya publicado y de los
  insumos de `docs/prompts_enciclopedia/`.
- **El 95 % de los `meaningWork` cerraba con la misma fórmula** ("En el dinero indica…"). Bajó al
  33 %, repartido entre cinco variantes.
- **Seis fichas no recibían ningún enlace entrante** desde las combinaciones —`wheel-of-fortune`,
  `page-of-wands`, `page-of-cups`, `knight-of-swords`, `queen-of-swords`, `knight-of-pentacles`—, lo
  que en una tarea de SEO deja media función del bloque sin cumplir, porque T-SEO-010 convierte cada
  combinación en un `<Link>` interno. Se agregó una quinta combinación a seis Mayores y un test que
  falla si alguna ficha vuelve a quedar huérfana.
- **El test de unicidad no miraba las combinaciones.** Ahora sí, y sacó a la luz cuatro solapamientos
  textuales entre pares recíprocos, reescritos para que cada lado mire desde su propia carta.

### Lo que queda pendiente

- **La revisión editorial humana de las 78 fichas.** Es el criterio no negociable del alcance y el
  único que ningún test cubre. Hacerla antes del deploy. Dos cosas para mirar con atención, que la
  revisión automática marcó y no se resolvieron del todo:
  - **El registro léxico.** Se normalizaron los marcadores más frecuentes (`acá` → `aquí` ×38,
    `envión` → `impulso` ×9), pero el corpus nuevo sigue siendo más conversacional que el existente,
    que es formal y esotérico. Cuando T-SEO-010 renderice `meaningUpright` y `meaningLove` en la
    misma página, la diferencia de tono se va a notar. Es una decisión editorial, no técnica.
  - **Muletillas de estructura**: `El ánimo…` abre el 73 % de los `meaningWellbeing` y `Si estás sin
    pareja…` cierra el 38 % de los `meaningLove`.
- **`check:indexable -- --min-words 500`**, después de T-SEO-010 y del deploy.
- **Cobertura**: `package.json` excluye `src/database/seeds/**` de `collectCoverageFrom`, así que las
  ~130 líneas nuevas del seeder tienen spec pero **no** cuentan para el gate del 80 %.

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

**Estado:** ✅ COMPLETADA (24-ago-2026)

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

- [x] `CardDetailView` renderiza las secciones nuevas como `<section>` con `<h2>` propio:

  | Campo | Encabezado visible |
  | --- | --- |
  | `meaningLove` | *En el amor* |
  | `meaningWork` | *En el trabajo* |
  | `meaningWellbeing` | ***En la energía y el bienestar*** |
  | `symbolism` | *El simbolismo de la carta* |
  | `advice` | *El consejo de la carta* |
  | `yesNo` | *¿Sí o no?* |
  | `combinations` | *Combinaciones frecuentes* |

- [x] **Cada sección degrada sola si su campo es `null`.** `CardContentSection` no renderiza nada
      —ni el encabezado— si el campo no vino, vino vacío o vino en blanco. Es lo que permite cargar
      las fichas de a tandas sin dejar títulos huérfanos.
- [x] Las **combinaciones** son `<Link>` reales a `/enciclopedia/tarot/[slug]`, no texto plano.
      ⚠️ La respuesta de la API solo trae `cardSlug`, así que el **nombre del enlace se resuelve en
      el servidor** (`getCombinationCardNames` + `resolveListingData` en la ruta): un cross-link cuyo
      texto aparece recién en el cliente no le sirve al crawler. Si el listado no responde, el enlace
      degrada al slug legible y la ficha sale igual.
- [x] Jerarquía de encabezados correcta (`h1` → `h2`), sin saltos. Los dos `h3` sueltos que había
      —*Información* y *Palabras Clave*— pasaron a `h2`, igual que *Cartas Relacionadas*, y el bloque
      de significados —que no tenía encabezado y quedaba como un tramo sin rótulo en el esquema—
      recibió el suyo: *El significado de la carta*.
- [x] **Guardarraíl de contenido en tests**: `MIN_CARD_DETAIL_WORDS` en
      `card-content-sections.data.ts` y la medición sobre el **DOM renderizado** en
      `CardDetailView.test.tsx`, con el `countWords` compartido de T-SEO-002/T-SEO-011. Mide solo el
      contenido propio —descripción, significados, las seis secciones y las combinaciones—, sin el
      chrome de hero, metadatos, palabras clave y firma: 590 palabras contra un piso de 500.

### Criterios de aceptación

- [x] Las 78 fichas superan 500 palabras propias. **Medido sobre el HTML servido** con
      `check:indexable` contra el host local con la base cargada (24-ago-2026): las 78 responden 200,
      **mínimo 694** (`five-of-swords` y `four-of-swords`), **promedio 766**, máximo 893, y ninguna
      queda por debajo del piso. Contra las 166 palabras que servía la ficha antes de esta tarea.
      Los otros dos lugares donde se mide lo mismo: el test de datos del backend (T-SEO-009: mínimo
      579 palabras de fuente, promedio 676) y el guardarraíl de render, que renderiza la ficha más
      corta del corpus y cuenta el texto del DOM.
- [x] Una ficha con campos nuevos en `null` sigue renderizando sin huecos ni encabezados vacíos.
      Cubierto por tres tests: sin contenido extendido, con una sola sección cargada y con un string
      en blanco.
- [x] `npm run check:indexable -- --base-url <host>` sin soft-404. Corrido sobre las **179 URLs del
      sitemap**: **0 soft-404** y las 78 fichas en verde con `--min-words 500`. La única URL delgada
      de verdad que queda no es una ficha y ya tiene tarea: `/servicios/limpiezas-energeticas`, 106
      palabras (T-SEO-012). `/explorar` marcó 2 palabras en la corrida, pero es un artefacto de
      `next dev` —la primera request devuelve el `loading.tsx` mientras compila la ruta—: en caliente
      sirve 210. ⚠️ La corrida fue contra el **host local**; repetirla contra producción después del
      deploy.

### Decisiones de implementación

- **La lista de secciones vive en un solo lugar** (`src/lib/constants/card-content-sections.data.ts`)
  y de ahí la consumen el render y el guardarraíl. Repartir los encabezados por el JSX habría dejado
  al test verificando una copia del contrato en vez del contrato.
- **El guardarraíl del frontend mide el HTML, no el corpus.** Las 78 fichas viven en la base y en los
  datos del backend, que ya tiene su propio test de largo (T-SEO-009); duplicar el corpus en el
  frontend habría creado una segunda fuente de verdad que se desincroniza. Lo que este guardarraíl
  cubre es lo que aquel no puede ver: que el render **saque a la página** lo que la API manda. Por eso
  el fixture es la ficha real más corta del corpus y el test cuenta el texto del DOM renderizado.
  La contracara, anotada en el propio fixture: es una **copia** del corpus, así que si mañana se
  acorta esa carta en el backend, lo agarra el test de allá y acá queda un texto viejo — no al revés.
- **El largo total no detecta que se caiga una sección corta**, y no pretende hacerlo: quitando
  `symbolism` o las combinaciones la ficha cae por debajo del piso, pero quitando `yesNo` no. Lo que
  cubre eso son los tests que buscan cada sección una por una, más el que verifica que ninguna llegue
  al DOM con el cuerpo vacío.
- **`meaningReversed` no cuenta para la medición del DOM**: vive en la pestaña *Invertida* de
  `CardMeaning`, y Radix desmonta el panel inactivo, así que no está en el HTML servido. Son ~15
  palabras por ficha y el piso se supera igual, pero conviene tenerlo anotado: es contenido escrito
  que el crawler no ve. Cambiarlo es una decisión de UX (pestañas → secciones), fuera del alcance de
  esta tarea.
- **La ruta pide el listado de cartas para resolver los nombres de las combinaciones.** Es una
  llamada extra por ficha en el build (78 en total, contra el endpoint de listado, que desde T-SEO-008
  proyecta solo 8 columnas). El mapa se filtra a los 3-5 slugs de la ficha antes de mandarlo al
  cliente, así que al payload de cada página van 4 entradas y no 78.

### Lo que encontró la revisión local (y se corrigió)

- **Dos helpers del guardarraíl eran código muerto.** `getCardDetailWordCount` y
  `getMissingCardSections` no los consumía nadie fuera de su propio test, y ese test los corría
  contra el fixture: comprobaba que el fixture estaba completo, no que el contenido publicado lo
  estuviera. Se eliminaron; el guardarraíl quedó donde mide algo real, sobre el DOM.
- **El guardarraíl de largo contaba el chrome.** Medía `container.textContent` entero —hero,
  metadatos, palabras clave, firma: ~70 palabras—, así que el número estaba inflado respecto de
  "palabras propias". Ahora suma solo los bloques de contenido de autor.
- **Tres de los cuatro cambios de encabezado no tenían test que los fijara**: los tests usaban
  `getByText`, que pasa igual con `h3` o con `h2`. Pasaron a `getByRole('heading', { level: 2 })`, y
  el `h2` nuevo de `CardMeaning` —que no cubría nada— tiene el suyo.
- **La etiqueta de respaldo del cross-link salía como `Seven Of Swords`**, con la partícula
  capitalizada. Ahora se arma como el `nameEn` real de la carta (`Seven of Swords`), que es el mismo
  nombre inglés que la ficha ya muestra como subtítulo.
- **Duplicación**: el `split` de párrafos estaba escrito dos veces (descripción y secciones) y las
  clases de la tarjeta, copiadas literales en dos componentes. Quedaron `splitParagraphs` en
  `lib/utils/text.ts` y `CARD_SECTION_CLASSES` exportada de `CardContentSection`.
- **El pass-through de `combinationCardNames`** en `CardDetailPageContent` no tenía test propio.

### Lo que queda pendiente

- **Repetir `check:indexable -- --min-words 500` contra producción** después del deploy. La corrida
  del 24-ago-2026 fue contra el host local con la base cargada —que es lo que cierra el criterio de
  aceptación—, pero producción sirve el build estático con ISR y conviene confirmarlo ahí antes de
  pedir la revisión de AdSense.
- **La diferencia de tono entre el corpus viejo y el nuevo** que anotó T-SEO-009 ahora se ve en la
  misma página: `meaningUpright` (formal, esotérico) y `meaningLove` (más conversacional) quedaron a
  dos secciones de distancia. Es material para la revisión editorial humana, que sigue pendiente.

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

**Estado:** ✅ COMPLETADA (23-ago-2026)

### Alcance

- [x] Página `/sobre-nosotros`, estática, **600+ palabras propias**: quién está detrás del sitio, su
      trayectoria, cómo trabaja, qué enfoque tiene con el tarot y la astrología, por qué existe
      Auguria y cómo se produce el contenido de la enciclopedia. **1135 palabras con el guardarraíl;
      1199 propias medidas por `check:indexable` contra el build.**
- [x] ~~Foto real~~ → **decisión del dueño del producto: sin foto de personas.** El sitio se
      presenta como equipo y no nombra a nadie, así que no hay retrato posible; una imagen de stock
      haciendo de "nuestro equipo" es peor señal que ninguna. La identidad visual la aporta la marca
      (`/images/logo-auguria.webp`).
- [x] Enlace en el footer, en el bloque de enlaces legales, junto a *Contacto*.
- [x] Alta en `sitemap.xml` (`STATIC_ROUTES` de `buildSitemap`, priority 0.6, monthly).
- [x] **NO** se agregó a `DISALLOWED_PATHS` de `robots.ts`.
- [x] Datos estructurados JSON-LD en la página: `Organization` (esta es su fuente canónica) +
      `AboutPage`, que lo referencia por `@id` en vez de duplicarlo. **`Person` NO se emite**, por
      la misma decisión de arriba.
- [x] Firma de autoría visible en las guías de la enciclopedia (`AuthorByline` en
      `ArticleDetailView`, condicionada a `isGuide`).

### Criterios de aceptación

- [x] `/sobre-nosotros` supera 600 palabras propias medidas con el guardarraíl → **1135**
      (`getAboutPageWordCount`, que excluye encabezados) y **1199** medidas por `check:indexable`
      contra el build, que es la cuenta que ve el crawler. Es la URL con más contenido propio del
      sitio; el barrido dio 17/17 ✅.
- [x] Se llega desde el footer de cualquier página con un `<a href>` real.
- [ ] El JSON-LD valida en el Rich Results Test de Google → **verificable recién en producción**:
      el test de Google necesita una URL pública. Los tests cubren el shape, las URLs absolutas y
      el enlace por `@id`; la validación final va con el deploy.

### Decisiones de implementación

- **El sitio se presenta como equipo, sin nombres propios.** Decisión del dueño del producto. El
  guardarraíl de contenido lo verifica (`about-page.data.test.ts` falla si aparece un nombre
  personal), para que no se cuele en una edición posterior.
- **Trayectoria declarada:** *más de una década de práctica acumulada* en tarot, astrología,
  numerología, péndulo, horóscopo chino y rituales. Dato confirmado por el dueño del producto — es
  una página de confianza y una credencial inventada la vuelve contraproducente.
- **El texto vive en `about-page.data.ts`,** no en el JSX: mismo criterio que
  `listing-intros.data.ts` (T-SEO-003), así el guardarraíl mide las palabras y la unicidad sin
  renderizar. Piso declarado: `MIN_ABOUT_PAGE_WORDS = 600`.
- **`structured-data.ts` es nuevo:** el sitio no emitía ningún JSON-LD. El `Organization` queda
  disponible para que otras rutas (fichas, artículos) lo referencien por `@id` en el futuro sin
  volver a describirlo.
- **La firma va solo en las guías.** Las fichas de astrología son datos de referencia, no piezas de
  autor; firmarlas sería ruido.
- **Terminología:** la página no usa la palabra "salud" (regla transversal, T-SEO-013).

### Archivos

| Archivo | Qué es |
| --- | --- |
| `src/lib/constants/about-page.data.ts` | Contenido + `MIN_ABOUT_PAGE_WORDS` + `getAboutPageWordCount` |
| `src/lib/metadata/structured-data.ts` | Builders de `Organization` y `AboutPage` (JSON-LD) |
| `src/components/common/JsonLd.tsx` | Emite el `<script type="application/ld+json">` |
| `src/components/common/AuthorByline.tsx` | Firma de autoría del contenido editorial |
| `src/components/features/about/AboutContent.tsx` | Maqueta de la página |
| `src/app/sobre-nosotros/page.tsx` | Ruta estática + metadata + los dos bloques JSON-LD |

Modificados: `routes.ts`, `page-metadata.ts`, `sitemap.ts`, `Footer.tsx`, `ArticleDetailView.tsx`,
`CardDetailView.tsx`, `layout.tsx`, `HeroSection.tsx`, `listing-intros.data.ts`,
`chinese-zodiac-profiles.data.ts`, `utils/text.ts`. Nuevo: `lib/constants/branding.ts`.

### Correcciones de la revisión

La revisión encontró que **tres afirmaciones del texto no las cumplía el producto**. En una página
cuyo único propósito es la confianza, eso es peor que no tenerla: un revisor la refuta en dos clics.
Las tres se corrigieron y quedaron **blindadas con tests**, para que no vuelvan por una edición
posterior:

| Afirmación original | Por qué era falsa | Cómo quedó |
| --- | --- | --- |
| "lectura de tarot con las barajas Rider-Waite **y Marsella**" | `MARSEILLE_DECK` está **comentado** en `tarot-decks.data.ts`; el único mazo sembrado es Rider-Waite | Se quitó Marsella. Test: la página no puede nombrarla |
| "Cuando una fuente discrepa de otra, **lo decimos en el texto**" | **Cero** citas de fuentes en todo el corpus de la enciclopedia, y ninguna marca de discrepancia | Se bajó a lo verificable. Test: la página no puede prometerlo |
| "No vas a encontrar acá lecturas que **garanticen** que un negocio prospere" | `major-arcana.data.ts` dice *"promete… prosperidad financiera"* (La Emperatriz) y *"**garantiza** resolución a favor en **temas legales**"* (La Justicia) | Se acotó a lo que sí es cierto: ningún **servicio** se ofrece prometiendo un desenlace |

Otras correcciones aplicadas:

- **El `Organization` se movió al layout raíz.** Vivía solo en `/sobre-nosotros`: la entidad editora
  existía para Google en una página hoja, mientras las ~120 URLs de enciclopedia no declaraban
  publisher. Ahora toda URL lo lleva, y `/sobre-nosotros` emite solo su `AboutPage` referenciándolo
  por `@id` — que es justamente para lo que el `@id` está.
- **La firma se extendió a las 78 fichas de tarot.** El argumento original ("las fichas son datos de
  referencia") dejó de valer con T-SEO-009: promedian 676 palabras de texto de autor. Pasó de 7 a 85
  URLs firmadas con una línea. Signos, planetas y casas siguen sin firma: ésos sí son referencia.
- **`inLanguage` fuera del `Organization`:** schema.org la define sobre `CreativeWork`, no sobre
  `Organization`. En el `AboutPage` sí es válida y ahí quedó.
- **`email` + `contactPoint` en el `Organization`:** contacto verificable es de lo que AdSense
  enumera explícitamente, y solo existía como `mailto:` en `/contacto`.
- **Fecha de revisión visible** (`Última revisión editorial: agosto de 2026`) + `dateModified` en el
  JSON-LD: la página afirma que el contenido se revisa periódicamente y no había forma de
  verificarlo.
- **El logo se declaraba cuadrado** (96×96) siendo apaisado (655×386): se dibujaba letterboxed y más
  chico de lo previsto. Se extrajo `lib/constants/branding.ts` para que la home, la página y el
  JSON-LD no puedan divergir.
- **`countWords` centralizado** en `utils/text.ts`: había tres implementaciones de la misma cuenta
  (T-SEO-002, T-SEO-003 y ésta).

### Hallazgos derivados — NO son de esta tarea

1. ~~**Tres fichas de arcanos mayores prometen resultados**~~ ✅ **Resuelto en T-SEO-013**
   (24-ago-2026). La Emperatriz *"promete… prosperidad financiera"*, La Justicia *"garantiza
   resolución a favor en temas legales"* y El Emperador *"augurio excelente… disciplina
   financiera"* ahora describen el simbolismo en vez de garantizar el resultado, en el archivo de
   seed **y** en la base ya sembrada.
2. **La enciclopedia no cita una sola fuente.** Un bloque *"Fuentes"* al pie de las 7 guías (Waite,
   Pollack, etc.) es de las señales E-E-A-T más baratas que quedan sin explotar. Tarea nueva.
3. **Voseo vs. tuteo inconsistente en el sitio.** `/sobre-nosotros` está en voseo pleno;
   `service-intros.data.ts`, `/contacto` y `/terminos` están en tuteo. Deuda preexistente, ahora más
   visible. Tarea nueva.

---

## T-SEO-012: `/servicios/[slug]` — las 4 Fichas Promedian 210 Palabras

**Estado:** ✅ COMPLETADA (27-ago-2026)
**Prioridad:** 🟡 Media · **Estimación:** 1,5 pts · **Dependencias:** ninguna

### Problema

Son solo 4 URLs, pero `/servicios/limpiezas-energeticas` está en **107 palabras** —bajo el umbral— y
la sección promedia 210. Además son las páginas **comerciales** del sitio: si un revisor entra por
ahí, ve una ficha de producto delgada.

### Alcance

- [x] Llevar las 4 fichas a 400+ palabras propias: en qué consiste la sesión, cómo se prepara la
      persona, qué pasa durante y después, para quién es y para quién no, preguntas frecuentes.
      Las tres fichas de detalle llevan las cinco secciones **y** cuatro preguntas frecuentes cada
      una: 591 palabras de prosa en `arbol-genealogico`, 562 en `pendulo-hebreo` y 584 en
      `limpiezas-energeticas` — 632, 597 y 616 medidas sobre el DOM renderizado, contando los
      encabezados y las preguntas—, además de lo que ya traía la API. La cuarta URL es el **listado**
      `/servicios`, no una ficha: se resolvió extendiendo su `LISTING_INTROS` de 168 a 371 palabras.
- [x] Verificar si el contenido debe vivir en la entidad del servicio (editable desde el panel) o en
      constantes del repo. **Decisión: constantes del repo** (`service-details.data.ts`), contra la
      recomendación tentativa del enunciado. Ver *Por qué en el repo y no en la entidad*.
- [x] Ojo con `limpiezas-energeticas`: es la ficha más expuesta a prometer efectos terapéuticos.
      Aplica la regla transversal de terminología. Su ficha es la única que dice **"No cura nada"**
      con todas las letras, y el guardarraíl prohíbe el vocabulario clínico en todo el contenido
      salvo en el `disclaimer`, que existe justamente para nombrar lo que la sesión no es.

### Criterios de aceptación

- [x] Las 4 URLs superan 400 palabras propias. Medido sobre el contenido escrito: las tres fichas
      ponen 597–632 palabras en el DOM **antes** de sumar la descripción que viene de la API, y
      el listado pasa de ~210 a ~450 contando la introducción, los encabezados y las tres tarjetas.
      ⚠️ La verificación con `npm run check:indexable -- --base-url <host> --min-words 400` queda
      **pendiente del deploy**, igual que el resto de la fase: "mergeado" no es "en producción".
- [x] `/servicios/limpiezas-energeticas` deja de aparecer bajo el umbral. Era la peor de las 178
      URLs del sitio en su categoría: 26 palabras de `longDescription` sembrada. Ahora suma 584
      propias.

### Por qué en el repo y no en la entidad

El enunciado se inclinaba por la entidad ("los servicios se editan desde admin, así que
probablemente lo primero"). Se eligió lo contrario, y conviene dejar escrito por qué:

1. **Es contenido YMYL que tiene que pasar por revisión de código.** La ficha de limpiezas
   energéticas es la más expuesta del sitio a prometer un efecto terapéutico. En el repo la cubren
   `service-details.data.test.ts`, `no-salud-user-facing.test.ts` y el diff de un PR. En una columna
   `text` editable desde el panel no la cubre nada: la misma frase que hoy se rechaza en review
   entraría por un textarea sin que ningún test se ponga en rojo.
2. **Lo que el panel edita es lo operativo.** Precio, duración, WhatsApp, link de Mercado Pago,
   orden y activo, más las dos descripciones que ya existen. Ninguna de esas es una redacción de 400
   palabras con estructura fija de cinco secciones y un FAQ; agregar seis textareas más al
   `EditServiceModal` para que queden vacías es peor producto y más superficie.
3. **No depende de que la API responda.** Mismo criterio y mismo lugar que `listing-intros.data.ts`
   (T-SEO-003) y `service-intros.data.ts`: es el piso garantizado de texto propio de la ruta. El
   bloque se renderiza **fuera** de `ServiceDetailPage`, que es cliente, así que llega al crawler
   aunque la parte interactiva se quede en su esqueleto.

**El costo, anotado:** un servicio nuevo creado desde el admin no tiene entrada en
`SERVICE_DETAILS` y su ficha nace con las palabras de su `longDescription` y nada más — no se
rompe, degrada. `getServiceEditorialContent()` devuelve `undefined` y la ruta no renderiza el
bloque. El test ata la cobertura a los tres slugs sembrados, así que agregar un cuarto servicio
obliga a escribirle su bloque; en producción lo detecta `npm run check:indexable`.

### Decisiones de implementación

- **El texto vive en datos tipados, no en el JSX** (`src/lib/constants/service-details.data.ts`).
  Es lo que permite que el guardarraíl de largo, el de unicidad y el de vocabulario YMYL lo
  verifiquen sin renderizar nada, igual que en T-SEO-003 y T-SEO-010.
- **El piso son 400 palabras del bloque editorial solo, no de la página.** Apoyarse en la
  `longDescription` sembrada sería apoyarse en el dato más flaco del catálogo: `limpiezas-energeticas`
  tiene 26 palabras y el panel de admin puede acortarla más. Con 400 acá, la URL supera el umbral
  pase lo que pase con la base.
- **Doble guardarraíl, como en T-SEO-010.** Uno sobre los datos (`service-details.data.test.ts`, 26
  casos) y otro sobre el **DOM renderizado** (`ServiceEditorialContent.test.tsx`): el primero no
  puede ver si el render efectivamente saca el texto a la página, y ese fue exactamente el agujero
  que T-SEO-009 descubrió cuando el corpus estaba cargado y el HTML seguía sirviendo 166 palabras.
  El test negativo —"un contenido recortado no llega al piso"— está para que el guardarraíl no pase
  por construcción.
- **El vocabulario clínico se prohíbe en todo el contenido menos en el `disclaimer`.** Un aviso YMYL
  necesita nombrar lo que la práctica no es ("no reemplaza la consulta con un profesional de la
  medicina"), y prohibir la palabra en todos lados obligaría a escribir un aviso que no dice nada.
  Es el mismo criterio con el que T-SEO-013 dejó intactas las instrucciones negativas de los prompts
  de IA: la mención en negativo es la protección, no la infracción. El test exige además que el
  `disclaimer` contenga un "no reemplaza / no sustituye", así que no se puede vaciar.
- **Se replicó el test de promesa de desenlace económico o legal** de T-SEO-013 (verbo de promesa
  cruzado con vocabulario económico o legal en la misma oración). Son páginas comerciales: es donde
  más barato sale prometer un resultado sin darse cuenta.
- **Voseo.** La sección `/servicios` ya estaba en voseo —las descripciones sembradas ("dejás de
  cargar"), el CTA ("Elegí fecha y horario"), los estados de error ("el servicio que buscás")— y el
  contenido nuevo lo respeta. La inconsistencia global voseo/tuteo del sitio sigue siendo la deuda
  anotada en los hallazgos de T-SEO-011; lo que esta tarea garantiza es que dentro de una misma URL
  la voz no cambie.
- **La cuarta URL era el listado, no una ficha.** El desglose de la auditoría dice "`/servicios` · 4
  URLs" y el catálogo tiene tres servicios sembrados: `/servicios` + las tres fichas. El listado se
  resolvió con tres secciones nuevas en `LISTING_INTROS.servicios` —cómo elegir entre los tres, qué
  leer antes de reservar y quién atiende— más un enlace a `/sobre-nosotros`, que es señal E-E-A-T y
  no estaba.

### Lo que encontró la revisión local (y se corrigió)

El primer borrador pasaba las seis puertas de calidad y aun así tenía **contenido inventado**. Es el
hallazgo que conviene retener de esta tarea: en una página comercial, el riesgo no está en el código.

- **🔴 El copy nombraba a Flavia y remitía a `/sobre-nosotros`, que dice lo contrario.**
  `about-page.data.ts` afirma textualmente *"Elegimos presentarnos como equipo y no como una figura
  única"* y no menciona a Flavia ni una vez. El enlace nuevo invitaba al revisor a hacer exactamente
  ese click. La sección se reescribió sin nombrar a nadie y sin afirmar qué contiene esa página; el
  enlace queda, porque la señal E-E-A-T es real, pero ya no promete lo que no hay.
- **🔴 La ficha decía "Modalidad: WhatsApp" arriba y "videollamada / presencial" abajo.**
  `ServiceDetailPage.tsx` renderiza la modalidad hardcodeada y el bloque nuevo la contradecía dos
  pantallas más abajo. **"Presencial" además no existe en el producto**: no hay dirección, ni zona de
  cobertura, ni precio diferencial. Prometer visita a domicilio en una página con botón de pago es
  una obligación comercial inventada. Todo el copy quedó alineado a WhatsApp y a distancia.
- **🟠 Entregables que el producto no tiene.** *"Recibís el genograma en imagen y un resumen
  escrito"*, *"te dejo por escrito las letras"*, *"firma el resumen de cada encuentro"*. `Session` no
  tiene un solo campo de entregable al usuario y no hay flujo de envío post-sesión. Se bajaron a lo
  que sí ocurre dentro de la hora: se repasa, se anota, se cierra.
- **🟠 Afirmaciones de demanda sin respaldo.** *"Es la modalidad que más se pide"*, *"la que más se
  coordina"*, *"muchas consultas se cierran en una sola"*. Los tres precios están en `0`: el catálogo
  ni siquiera está operativo. Fuera las tres.
- **🟠 Un requisito operativo inventado:** la ficha del péndulo pedía *"nombre completo y fecha de
  nacimiento"*, que el flujo de reserva no pide en ningún lado.
- **🟠 El copy del listado se acopló a datos que el admin controla.** *"Cómo elegir entre **los
  tres**"*, *"ninguna de **las tres** prácticas"*, y *"la sesión dura **una hora**"* contra el
  `durationMinutes` que viene de la base. El panel puede crear un cuarto servicio o desactivar uno, y
  la grilla mostraría 2 o 4 tarjetas sobre un texto que dice "los tres". **Éste es el agujero real de
  la decisión "constantes del repo", y no es el que el JSDoc anticipaba**: para las tres fichas el
  argumento se sostiene; para el listado, contar y nombrar el catálogo era acoplarse a él. Se
  reescribió sin cardinalidad ni duraciones.
- **🟠 El guardarraíl de vocabulario clínico no veía el vocabulario del rubro.** El regex original no
  matcheaba `terapia`, `psicología`, `enfermo`, ni las conjugaciones de `curar` — y el JSDoc del
  propio campo `disclaimer` decía que era el único lugar donde se podía nombrar *"la medicina o la
  psicología"*. Se amplió. ⚠️ La versión `cur\w*` que sugería la revisión marcaba *curiosidad*,
  *curso* y *curva*: quedó con las terminaciones enumeradas, porque un guardarraíl con falsos
  positivos se termina relajando y relajado no sirve para nada.
- **🟠 Un comentario afirmaba una paridad con el backend que no existe.** Decía *"misma lista que el
  corpus del backend"*: el guardarraíl de T-SEO-013 escanea **una sola palabra**, `salud`. La lista
  clínica es propia de esta tarea y ahora lo dice.
- **🟠 El regex económico/legal era más débil que el que decía replicar.** Le faltaban `negocio`,
  `prosperidad`, `ganancias`, `sueldo`, `laboral`, `capital`, `patrimonio`, `contrato`, `finanzas`,
  `inversión`, `ascenso` y `promoción`. `negocio` es justo el vocabulario de la ficha de limpiezas.
  Se copió la lista del backend tal cual, más `herencia`, `demanda` y `sentencia`.
- **🟠 Los dos guardarraíles YMYL pasaban por construcción.** Afirmaban una lista vacía, así que un
  regex que no matchea nada los dejaba en verde para siempre — que es exactamente cómo los falsos
  negativos de arriba pasaron desapercibidos. Van con cuatro casos que **deben** dar hit (y uno que
  no debe), calcados del negativo que el guardarraíl de largo ya tenía.
- **🟠 `/servicios` era la única de las 4 URLs sin piso propio.** `MIN_LISTING_INTRO_WORDS` es 130 y
  la ruta necesita 400: borrar las tres secciones nuevas dejaba el CI en verde y la URL de nuevo bajo
  el umbral. Se agregó `MIN_LISTING_INTRO_WORDS_BY_KEY` con 360 para esa clave.
- **🟡 `ServiceEditorialContent` era un clon de `ListingIntro`**, carácter por carácter salvo el
  envoltorio y el pie. El núcleo —título, lead y grilla de secciones— se extrajo a
  `components/common/EditorialCard.tsx`. El tipo de `sections` se declara ahí y **no** se importa de
  ningún archivo de datos: TypeScript es estructural, así que ni `ListingIntro` ni la ficha de
  servicio tienen que conocer el dominio del otro.
- **🟡 La meta description de `/servicios` describía servicios que no existen.** Decía *"Sesiones
  personales con Flavia: registros akáshicos, terapias holísticas y acompañamiento espiritual"* —
  ninguno de los tres es un servicio sembrado, "terapias" es vocabulario que el guardarraíl de esta
  misma tarea prohíbe, y es el texto que sale en el resultado de búsqueda. Corregida. Era deuda
  preexistente, pero es una línea y es la misma URL.
- **🟡 Se quitó *"no intervienen animales"*.** La intención era diferenciarse de prácticas con
  sacrificio; en una página que un revisor de AdSense va a leer, introducir la idea para negarla
  juega en contra.

**No se aplicó**, con motivo: emitir `FAQPage` en JSON-LD queda como tarea nueva (abajo), y
`about-page.data.ts` no se tocó — la decisión de presentarse como equipo es de T-SEO-011 y
deliberada; lo que estaba mal era el copy nuevo que la contradecía.

### Hallazgos derivados — NO son de esta tarea

1. **Dos `longDescription` sembradas traen vocabulario clínico.** `arbol-genealogico` dice
   *"enfermedades"*, *"síntoma"* y *"Sanar / sanación"*; `pendulo-hebreo` abre con *"tratar, sanar y
   transformar la energía"*. Es texto que **hoy se renderiza en producción**, en las páginas
   comerciales, justo arriba del bloque nuevo. No lo atrapa ningún criterio actual: el guardarraíl de
   T-SEO-013 busca `salud` y estas palabras no la contienen. Arreglarlo es el patrón ya probado de
   T-SEO-013 —reescribir el seed + una migración de datos con `REPLACE` acotado por slug— y es
   backend, no frontend. **Tarea nueva.**
2. **Las fichas de servicio no emiten `FAQPage` en JSON-LD.** Ahora que tienen preguntas frecuentes
   reales, el bloque de datos estructurados sale casi gratis con la infraestructura de T-SEO-011
   (`JsonLd` + `structured-data.ts`). Se dejó afuera para no ensanchar una tarea de 1,5 pts.
   **Tarea nueva.**
3. **Los precios de los tres servicios están en `0`.** El seeder los deja en cero para que el admin
   los cargue, y la ficha muestra *"0 ARS"*. En una página comercial que un revisor de AdSense puede
   abrir, un precio en cero es una señal de sitio incompleto. Es dato de producción, no de código.

---

## T-SEO-013: "Salud" Fuera del Texto Visible (YMYL)

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (24-ago-2026) — código en [PR #629](https://github.com/ArielDRighi/TarotFlavia/pull/629); corpus sembrado, prompts y guardarraíl en el PR de cierre

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

### Hecho: el corpus sembrado en la base (24-ago-2026)

Quedaban **~180 ocurrencias** que no alcanzaba con cambiar en el repo, porque el contenido ya está
sembrado en la base de producción:

| Archivo | Ocurrencias | Dónde se ve |
| --- | --- | --- |
| `modules/tarot/cards/seeds/card-free-interpretations.data.ts` | 58 | interpretaciones de las lecturas gratuitas |
| `database/seeds/birth-chart/03-planets-in-houses.md` | 20 | resultado y PDF de la carta astral |
| `database/seeds/data/predefined-questions.data.ts` | 10 | preguntas sugeridas en el circuito de tarot |
| `modules/encyclopedia/data/astrological-houses.data.ts` | 9 | `/enciclopedia/astrologia/casas/*` |
| `database/seeds/birth-chart/02-planets-in-signs.md` | 8 | carta astral |
| `database/seeds/reading-categories.seeder.ts` + `.seed.ts` | 6 | nombre y descripción de la categoría |
| ~~`modules/encyclopedia/data/{minor,major}-arcana.data.ts`~~ ✅ | 2 | fichas de tarot — hecho en T-SEO-009 |
| `modules/numerology/data/interpretations.data.ts` | varias | numerología |
| resto (guías de actividad, prompts del horóscopo chino, plantillas de email) | resto | varios |

- [x] Reescribir el corpus con la terminología nueva. **51 ocurrencias** en 16 archivos de seed y
      datos (las ~180 del inventario original contaban `categorySlug: 'salud-bienestar'`, que es
      slug y no se toca).
- [x] **Migración de datos, no re-seed.** Los cinco seeders del corpus son *skip-if-exists*
      (`seedReadingCategories`, `seedEncyclopediaArticles`, `seedBirthChartInterpretations`,
      `seedPredefinedQuestions`, `seedTarotCards` cortan apenas encuentran una fila), así que en una
      base ya poblada un re-seed no cambia una sola letra. Va
      `1787583600000-ReplaceSaludWordingInSeededCorpus`: **67 pares** `[viejo, nuevo]` aplicados con
      `REPLACE` por subcadena exacta, **parametrizado** y acotado por `POSITION(...) > 0`, sobre **7
      tablas**. El par del ícono va en su propia entrada, anclada a la columna `icon` y al slug: un
      emoji es una subcadena de un carácter y sin anclar el `down` reescribiría cualquier 🌿 de la
      tabla. Si alguien editó una fila, el `POSITION` no matchea y la migración no la toca: no
      puede pisar una edición editorial. El panel de admin, además, hoy no edita ninguna de esas
      tablas (`admin` es dashboard + usuarios).
      **Verificado contra la base de desarrollo con datos reales** (132 interpretaciones libres, 42
      preguntas, 78 cartas, 48 artículos, 476 interpretaciones de carta astral): `up` deja las 6
      tablas en 0 ocurrencias, `down` restaura el texto viejo con **hash idéntico** al de partida, y
      un segundo `up` reproduce exactamente el mismo hash (idempotente).
- [x] Renombrado el `name` (*Energía y Bienestar*), la `description` y —no estaba previsto— el
      `icon`: era 🏥, un hospital, que es la misma señal YMYL que el nombre. Ahora 🌿. **El slug
      quedó como está**: migrarlo toca el gating FREE en los dos lados.
      `categoryLabel()` en `CategorySelector.tsx` **se dejó** aunque ahora sea redundante: es la red
      para una base que todavía no corrió la migración (entorno viejo, rollback). Cuesta tres líneas
      y evita que un `name` viejo se filtre a la página.
- [x] Prompts de IA revisados. `chinese-horoscope.prompts.ts` ya estaba bien: su única mención es
      la instrucción **negativa** *"NO uses términos médicos o menciones condiciones de salud"*, que
      es justamente lo que impide que el modelo devuelva texto médico — sacarla apagaría la
      protección. `chart-ai-synthesis.service.ts` **no la tenía**: el prompt le pasa al modelo las
      interpretaciones individuales de la carta, así que con el corpus viejo la palabra volvía por
      la puerta de atrás. Se le agregó la regla 10 (*nunca la palabra "salud" ni consejo médico;
      energía, descanso, hábitos y bienestar*) y la línea equivalente en el bloque `NO incluyas`.
- [x] **Promesas de resultado legal/financiero** (hallazgo derivado de T-SEO-012, asignado acá).
      Prometer un desenlace es la otra mitad de YMYL: La Emperatriz *"promete… prosperidad
      financiera"*, La Justicia *"garantiza resolución a favor en temas legales"* y El Emperador
      *"augurio excelente… disciplina financiera"*. Las tres reescritas en `major-arcana.data.ts` y
      migradas en `encyclopedia_tarot_cards.meaning_upright`.
      La revisión local encontró **tres más** que el primer barrido no vio: El Carro (*"augura
      victorias… promociones merecidas"*) y dos del seed de lecturas (*"Buen augurio de rápidos
      resultados… en lo económico como laboral"*, *"en finanzas… augura llegada de dinero
      inesperado"*). Salieron todas.
      El guardarraíl que lo sostiene **no** prohíbe `promete` a secas: el corpus de T-SEO-009 lo usa
      13 veces y casi siempre para *negar* la promesa (*"no promete continuidad"*, *"la que menos
      promete atajos"*) — mismo criterio con el que `sanar` quedó fuera de la lista médica. Tampoco
      alcanza con prohibir `augur`: *"augura matrimonios felices"* (El Sol) es copy de tarot
      perfectamente sano. Lo que se prohíbe es el **cruce**: un verbo de promesa y vocabulario
      económico o legal **en la misma oración**. Sobre el corpus da 0 falsos positivos.
- [x] Guardarraíl: `src/no-salud-user-facing.spec.ts`, calcado del patrón de
      `no-ia-user-facing.spec.ts` (FBK-003). Escanea `database/seeds/**` y todo `data/`, `seeds/`,
      `prompts/` y `templates/` de los módulos —`.ts`, `.md` y `.hbs`—, replicando el mismo
      `grep -i salud` del criterio de aceptación sobre el **origen**. Ignora comentarios, el slug
      `salud-bienestar` y una allowlist de dos entradas justificadas.
      El mismo archivo trae un segundo test que cubre la otra mitad de YMYL —la *Money*—: cruza un
      verbo de promesa (`garanti*`, `augur*`) con vocabulario económico o legal **dentro de la misma
      oración**. Cruzarlos es lo que lo hace preciso: sobre el corpus actual da 0 hits y, medido
      antes de arreglar, daba exactamente los 3 que quedaban, sin un solo falso positivo.
      Va con un segundo archivo, `src/database/seeds/salud-wording-sync.spec.ts`, que ata la
      migración a los archivos de seed: por cada par verifica que el texto nuevo **está** en el seed
      y que el viejo **no**. Sin él, migración y seed pueden divergir y una base nueva termina
      distinta de una migrada, sin que nada se ponga en rojo.
      Y un tercero en el frontend, `frontend/src/no-salud-user-facing.test.ts`, espejo de
      `no-ia-user-facing.test.ts`: barre todo `frontend/src` (menos admin y tests). Sin él, un
      componente nuevo con la palabra en copy visible no rompía nada.
      ⚠️ El spec vive en `seeds/` y no en `migrations/` a propósito: el glob de TypeORM
      (`database/migrations/*{.ts,.js}`) carga **todo** lo que haya en esa carpeta, así que un
      `.spec.ts` ahí adentro rompe el CLI de migraciones y el arranque de la app
      (`migrationsRun: true`) con *"describe is not defined"*. Verificado en carne propia.

### Criterios de aceptación

- [x] `grep -rniI "salud" frontend/src backend/tarot-app/src` solo devuelve slugs, valores de base,
      claves de mapas, comentarios, fixtures de test, la lista de términos bloqueados del péndulo y
      las **instrucciones negativas de los prompts de IA** (*"NO uses…"*, *"NO incluyas…"*), que son
      protección y no contenido. Ninguna cadena renderizable quedó con la palabra.
- [ ] Ninguna página de producción muestra la palabra: verificable barriendo el HTML servido de las
      178 URLs del sitemap. **Pendiente del deploy** — el repo y la migración están listos, pero
      "mergeado" no es "en producción" (paso 6 del orden de desarrollo).
- [x] Las preguntas sobre enfermedad siguen bloqueadas en el péndulo: no se tocó `blockedTerms` ni
      la categoría `'salud'` del validador, y sus tests de regresión siguen en verde (321 suites,
      4667 tests del backend).

### Notas

- **Se solapa con T-SEO-009.** ✅ **La parte de tarot se hizo ahí, el 20-ago-2026.** Las 78 fichas
  tenían solo **2** ocurrencias, y en ninguna de las dos la palabra hablaba de salud:
  `the-devil.description` decía *"el saludo vulgar de la ignorancia"* y `nine-of-wands.meaningUpright`
  decía *"límites saludables"*. Igual salieron las dos, porque el criterio de aceptación es un
  `grep -i salud` sobre el HTML servido y no distingue el sentido. Quedaron corregidos los archivos
  de seed **y** las bases ya sembradas, con la migración
  `1787274000000-ReplaceSaludWordingInTarotCards`: dos `UPDATE` con `REPLACE` sobre una subcadena
  exacta, acotados por slug, de modo que si el panel de admin reescribió esa ficha el `LIKE` no
  matchea y la migración no toca nada. `up` y `down` verificados contra la base de desarrollo con las
  78 cartas cargadas. Las 7 secciones nuevas nacen sin la palabra y hay un test que lo sostiene.
- **Lo que las fichas de tarot todavía tienen y NO entra por el grep de "salud".** Medido al revisar
  T-SEO-009: `major-arcana.data.ts` y `minor-arcana.data.ts` contienen `ansiedad`, `ansiedades`,
  `traumas`, `dependencia emocional`, `síndrome del nido vacío`, `sanar problemas de imagen corporal`
  y `psique` en los `meaningReversed` — texto que **hoy se renderiza en producción**. Es el mismo
  riesgo YMYL que motivó la regla, pero por vocabulario clínico y no por la palabra "salud", así que
  ningún criterio de aceptación actual lo atrapa. El contenido nuevo de T-SEO-009 sí está cubierto:
  su test bloquea *ansiedad, depresión, insomnio, trauma, terapia, lesión y adicción*. Conviene
  extender ese criterio al resto del corpus cuando se retome esta tarea.
- **Se hizo un cambio de terminología no previsto en la lista original:** la palabra en las fichas de
  tarot no era el rubro "salud" sino *saludo* y *saludable*. Vale la pena tenerlo en cuenta al barrer
  los archivos que faltan: el grep del criterio de aceptación no distingue el sentido, así que en el
  resto del corpus también van a aparecer falsos positivos que hay que reescribir igual.
- **El campo nuevo se llama `meaningWellbeing`, no `meaningHealth`** (T-SEO-008). Un nombre de campo
  con "health" invita a que alguien escriba consejo médico adentro dentro de seis meses.
- **Vocabulario clínico: barrido parcial, queda deuda.** Al reescribir el corpus se sacaron también
  los términos clínicos que estaban **en las mismas frases** que "salud" —`enfermedad`,
  `enfermedades`, `problemas inflamatorios`— porque eran el mismo párrafo y el mismo riesgo. Lo que
  **no** se tocó es el vocabulario clínico que vive en frases sin la palabra: `hipocondría`,
  `psicosomática`, `somatización`, `medicina alternativa`, `cirujano`, `investigador médico`,
  `alergias` en las interpretaciones de carta astral, y `ansiedad`, `traumas`, `dependencia
  emocional`, `psique` en los `meaningReversed` de las 78 fichas. Ampliar el barrido a todo eso es
  reescribir cientos de párrafos de contenido astrológico legítimo y merece su propia tarea con su
  propio criterio; ningún criterio de aceptación de T-SEO-013 lo atrapa. **El contenido nuevo sí
  está cubierto**: `card-extended-content.data.spec.ts` bloquea 20 términos médicos en las 7
  secciones de las fichas.
- **Lo que encontró la revisión local y se aplicó** (además de las tres promesas de arriba): el
  regex del guardarraíl no matcheaba `augura` (solo `augurio`); la exención por slug eximía la
  **línea entera**, así que `{ slug: 'salud-bienestar', name: 'Salud y Bienestar' }` —una línea que
  prettier puede generar— pasaba limpia; `SEED_SOURCES` listaba 2 de los 6 archivos que componen
  `ALL_ARTICLES_DATA`; el par del emoji no estaba anclado; y quedaba `enfermedades` en el mismo
  párrafo de Neptuno/Casa 6 que ya se había reescrito. Todo corregido y probado inyectando un
  archivo de prueba para ver el guardarraíl fallar.
- **Camino renderizable que no estaba en el inventario original: las especialidades del tarotista.**
  `TarotistaProfilePage.tsx` renderizaba `{especialidad}` **crudo** (a diferencia de
  `TarotistaCard.tsx`, que sí usaba `specialtyLabel()`), y `lib/metadata/seo.ts` metía
  `especialidades.join(', ')` en la `<meta name="description">` de `/tarotistas/[id]`, que es una
  ruta indexable. Con un tarotista de especialidad `'Salud'` la palabra salía publicada en el HTML.
  Hoy no pasaba porque el único tarotista sembrado no la tiene: era latente. Los dos usos ahora
  pasan por `specialtyLabel()`, con un test cada uno.
- **Fuera de alcance, anotado:** `birth_charts.chartData.aiSynthesis` es `jsonb` persistido; las
  síntesis generadas con el prompt viejo pueden traer la palabra y no hay migración para ellas. El
  impacto SEO es nulo —son páginas privadas de usuarios Premium, no indexables—, pero técnicamente
  el criterio de "texto visible" no las cubre.
- **`reading-categories.seed.ts` es código muerto.** Nadie lo importa; el seeder vivo es
  `reading-categories.seeder.ts`, que exporta una función con el **mismo nombre** pero con los slugs
  reales. Los slugs del archivo muerto (`amor`, `salud`, `espiritual`) romperían el gating FREE si
  alguien lo cableara. Se le sacó la palabra del texto visible y se le puso un encabezado de
  advertencia, pero **borrarlo queda como candidato a una tarea de deuda técnica**: no es trabajo de
  esta tarea decidir su suerte.

---

## 🚀 Runbook de deploy — el orden NO es opcional

> Escrito el 26-ago-2026 después de que el deploy de T-SEO-013 saliera "verde" y **el sitio quedara
> exactamente igual que antes**. Una hora de diagnóstico. Si vas a deployar algo que cambia
> contenido de la base, leé esto primero.

### Los tres pasos, en este orden

| # | Paso | Por qué |
| --- | --- | --- |
| 1 | **Deploy del backend** | Las migraciones corren solas al arrancar (`migrationsRun: true` en `config/typeorm.ts`). Esto sí es automático. |
| 2 | **`npm run db:seed:encyclopedia`** contra la base de producción | **Los seeders NO corren en el deploy.** Y el contenido extendido de las 78 fichas —las 7 secciones de T-SEO-009, lo que las lleva de 166 a ~766 palabras— vive en un **seeder**, no en una migración. |
| 3 | **Build del frontend**, recién después de verificar el paso 2 por API | Las páginas de la enciclopedia son estáticas (`revalidate = 86400`): se prerenderizan **durante el build**, contra la API. El HTML que ve Google es una foto de ese instante y dura 24 h. |

### Las tres trampas que nos comimos

**1. "Deploy en verde" no es "contenido en producción".** Los dos servicios dieron `SUCCESS` y la
base tenía las 78 cartas… con los 7 campos nuevos en `NULL`. La API devolvía las fichas de 166
palabras. El trabajo entero de T-SEO-009 no lo veía nadie.

**2. `db:seed:all` NO se puede correr contra producción.** Incluye `seedUsers`, que crea
`free@test.com`, `premium@test.com` y `admin@test.com` **con una contraseña conocida**. Por eso
existe `scripts/db-seed-encyclopedia.ts`: corre solo los dos seeders de la enciclopedia, los dos
seguros de repetir (el de cartas hace *backfill* y no pisa ediciones del panel de admin; el de
artículos es skip-if-exists).

**3. `railway redeploy` no reconstruye.** Ni siquiera con `--from-source`. El `Dockerfile` del
frontend hace `COPY frontend/` y después `RUN npm run build`: si el commit es el mismo, Docker
reusa esa capa y devuelve el **mismo HTML byte a byte** (lo medimos: 52618 bytes, mismo md5, en tres
deploys seguidos). Para que se reconstruya de verdad **tiene que cambiar algún archivo dentro de
`frontend/`**.

> Si el frontend ya salió con datos viejos y no querés forzar un build: las páginas se arreglan
> solas cuando vence el ISR, hasta 24 h después del build. Es una salida válida si no hay apuro.

### Verificación (no alcanza con mirar el sitio)

```bash
# 1. La base y la API — esto es lo que tiene que estar bien primero
curl -s https://api.auguriatarot.com/api/v1/encyclopedia/cards/the-devil | jq 'keys'
#    Tienen que aparecer meaningLove, meaningWork, meaningWellbeing, symbolism,
#    advice, yesNo y combinations.

# 2. El HTML servido — que es otra cosa
curl -s https://auguriatarot.com/enciclopedia/tarot/the-devil | grep -c "En la energía y el bienestar"

# 3. El barrido completo
cd frontend && npm run check:indexable -- --base-url https://auguriatarot.com
```

---

## 🚪 Puerta de salida: cuándo pedir la tercera revisión

Un tercer rechazo cuesta más que dos semanas de trabajo. **Todo esto tiene que estar hecho y
verificado en producción antes de tocar el botón:**

- [ ] T-SEO-008, 009, 010, 011 y 013 desplegadas y verificadas **en producción** (no solo mergeadas
      — ver qué pasó el 19-ago con el deploy roto). ⚠️ Seguir el **Runbook de deploy** de arriba:
      backend → `db:seed:encyclopedia` → build del frontend. Las migraciones corren solas; **los
      seeders no**, y el contenido de las fichas está en un seeder.
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

**Última actualización:** 26-ago-2026
