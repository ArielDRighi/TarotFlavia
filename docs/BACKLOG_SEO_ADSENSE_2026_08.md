# Backlog SEO / AdSense — Agosto 2026

> **Propósito:** cerrar lo que falta para que AdSense apruebe `auguriatarot.com` y para que el problema
> no se repita en silencio.
> **Origen:** rechazo de AdSense por *"Contenido de poco valor"* (31-jul-2026) y el trabajo de
> T-PROD-020 → T-PROD-024, documentado en [BACKLOG_PRODUCCION_2026_07.md](./BACKLOG_PRODUCCION_2026_07.md).
> **Última medición:** 9-ago-2026, contra producción.

---

## 📍 Punto de partida (leé esto antes de tomar cualquier tarea)

### Qué pasó

Google Search Console avisó *"Duplicada: Google ha elegido una versión canónica diferente"* y AdSense
rechazó el sitio por contenido de poco valor. La causa resultó ser una cadena de tres problemas, todos ya
resueltos y deployados:

1. **T-PROD-020** — casi todas las URLs del sitemap compartían el `<title>` "Auguria". Se agregó metadata
   propia por ruta y SSR de la ficha de tarot.
2. **T-PROD-022** — `AuthProvider` devolvía una pantalla "Verificando sesión..." **en lugar de** `children`
   en todo render del servidor, así que **el sitio entero servía 3 palabras** a Googlebot.
3. **T-PROD-023** — el build de Railway venía fallando desde el 26-jul, así que nada de lo anterior había
   llegado a producción. Se destrabó.
4. **T-PROD-024** — los 53 artículos de enciclopedia + rituales + servicios traían su contenido por el
   cliente: 5–11 palabras para el crawler. Ahora resuelven en el servidor.

### Dónde está el sitio hoy

Muestra estratificada de 62 de las 178 URLs del sitemap, midiendo **palabras propias** (total menos las
39 de header + footer):

| Grupo | URLs | Palabras propias | Estado |
| --- | --- | --- | --- |
| Home | 1 | 611 | ✅ |
| Fichas de tarot | 79 | 126–233 | ✅ |
| Artículos de enciclopedia (signos, planetas, casas, guías, elementos) | 53 | 400–645 | ✅ |
| Hubs con texto estático (numerología, carta astral, péndulo, horóscopo, rituales, chino) | ~8 | 215–415 | ✅ |
| Fichas de ritual y servicio | 9 | 243–422 | ✅ |
| Horóscopo chino por animal | 12 | 3 → **355–401** | ✅ T-SEO-002 (10-ago) |
| Signos del horóscopo | 12 | 31 → **414–508** | ✅ T-SEO-004 (13-ago) |
| Listados y hubs (`/premium`, `/servicios`, `/explorar`, `/enciclopedia/tarot`, `/enciclopedia/guias`, `/enciclopedia`, `/enciclopedia/astrologia` + 3 listados astro, `/contacto`) | 11 | 3–70 → **183–822** | ✅ T-SEO-003 (10-ago) |

**29 de 62 URLs muestreadas superan las 150 palabras propias** (antes de este trabajo: 13).
Con T-SEO-002 cerrada, **41 de 62**: los 12 animales del horóscopo chino pasaron de 3 a 355–401.
Con T-SEO-003 cerrada, la corrida completa del guardarraíl da **153 de 178 URLs** sobre las 120
palabras: quedan los 12 signos (T-SEO-004) y 13 fichas entre 109 y 119.
Con T-SEO-004 cerrada, **162 de 178**: las 16 que faltan son las fichas al borde del umbral
(15 arcanos menores de 108 a 119 y `/servicios/limpiezas-energeticas` en 107), ninguna vacía.
El chrome pasó de 39 a **41 palabras**, así que las cuentas viejas se corren dos hacia abajo.

### El patrón que ya funciona (replicalo, no inventes otro)

Probado cuatro veces en producción. La ruta resuelve el recurso en el servidor y lo entrega al componente
cliente, que siembra React Query con él:

```tsx
// app/<ruta>/[slug]/page.tsx  (server component)
import { cache } from 'react';
import { resolveRouteResource, safeStaticParams } from '@/lib/metadata/route-data';

export const revalidate = 86400; // si el contenido es estático

// `generateMetadata` y la página piden lo mismo. Next solo dedupea `fetch()` y acá
// hay axios, así que sin `cache()` son dos requests por render.
const getResourceCached = cache((slug: string) => resolveRouteResource(() => getResource(slug)));

export async function generateMetadata({ params }) { /* usa getResourceCached */ }
export async function generateStaticParams() { return safeStaticParams(getAll, r => ({ slug: r.slug })); }

export default async function Page({ params }) {
  const { slug } = await params;
  return <Content slug={slug} initialResource={await getResourceCached(slug)} />;
}
```

```tsx
// components/features/.../Content.tsx  ('use client')
const { data, isLoading } = useResource(slug, initialResource);

// ⚠️ Guardar por `!data`, NUNCA por `error`: en React Query v5 un refetch fallido en
// background puebla `error` conservando el `data` bueno, y mirar `error` tira abajo
// contenido ya cargado.
if (isLoading) return <Skeleton />;
if (!data) return <NoEncontrado />;
```

```ts
// hooks/api/useX.ts
export function useResource(slug: string, initialData?: Resource) {
  return useQuery({
    queryKey: keys.detail(slug),
    queryFn: () => getResource(slug),
    staleTime: STALE_TIME,
    initialData,
    // ⚠️ Solo si el dato CAMBIA (precio, contadores): sin esto React Query estampa
    // `initialData` como recién traído y con el `staleTime` no refetchea al montar,
    // así que la copia horneada en el HTML queda fija hasta que expire el ISR.
    initialDataUpdatedAt: 0,
  });
}
```

Referencias vivas: [enciclopedia/tarot/[slug]/page.tsx](../frontend/src/app/enciclopedia/tarot/%5Bslug%5D/page.tsx),
[ArticleDetailPageContent.tsx](../frontend/src/components/features/encyclopedia/ArticleDetailPageContent.tsx),
[route-data.ts](../frontend/src/lib/metadata/route-data.ts).

### Cómo verificar (no alcanza con `npm run build`)

Lecciones que costaron caro en la sesión del 8-ago:

1. **CI en verde NO significa que el deploy funcione.** Lo fue hasta el 19-ago-2026: CI usaba `npm ci`
   contra el lockfile de la raíz y el Dockerfile de Railway corría `npm install` sin lockfile,
   resolviendo versiones distintas. El deploy estuvo roto dos semanas con CI verde. **T-SEO-005 cerró
   esa brecha**: el frontend ahora se construye desde la raíz con `npm ci`, igual que CI. Las otras
   tres lecciones siguen vigentes.
2. **El build local no prerenderiza lo que depende de la API** (no está levantada). Para ver el HTML real
   (⚠️ desde la **raíz** del repo, no desde `frontend/`):

```bash
docker build --no-cache -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_APP_URL=https://auguriatarot.com \
  --build-arg NEXT_PUBLIC_API_URL=https://api.auguriatarot.com/api/v1 \
  --build-arg NEXT_PUBLIC_APP_ENV=production -t auguria-check .

docker run -d --name chk -p 3099:3001 \
  -e NEXT_PUBLIC_API_URL=https://api.auguriatarot.com/api/v1 \
  -e NEXT_PUBLIC_APP_URL=https://auguriatarot.com auguria-check
sleep 12
curl -sS -A "Mozilla/5.0 (compatible; Googlebot/2.1)" http://localhost:3099/<ruta> | \
  python3 -c "import sys,re;h=sys.stdin.read();b=re.sub(r'(?is)<(script|style|noscript)[^>]*>.*?</\1>',' ',h);print(len(re.sub(r'\s+',' ',re.sub(r'(?s)<[^>]+>',' ',b)).strip().split()))"
docker rm -f chk
```

3. **El edge de Railway cachea el HTML** (`cache-control: s-maxage=31536000`). Después de un deploy,
   verificá con un cache-buster (`?cb=123`) o vas a medir la versión vieja.
4. **El chrome (header + footer) son 39 palabras.** Restalas siempre.

### Reglas del proyecto que aplican

Seguí `docs/WORKFLOW_FRONTEND.md` (TDD, ciclo de calidad, PR a `develop`). Y del `CLAUDE.md` raíz:
sin `any` / `eslint-disable` / `@ts-ignore` **ni en tests**, texto user-facing en español, nada de
lógica en `app/`.

---

## Índice de tareas

| ID | Tarea | Tipo | Prioridad | Estimación |
| --- | --- | --- | --- | --- |
| T-SEO-001 | Guardarraíl automático de contenido indexable ✅ | Frontend/CI | 🔴 Crítica | 2 pts |
| T-SEO-002 | Horóscopo chino por animal: 12 URLs sirven 3 palabras ✅ | Frontend | 🔴 Crítica | 3 pts |
| T-SEO-003 | Listados y hubs sin contenido para el crawler ✅ | Frontend | 🟠 Alta | 2 pts |
| T-SEO-004 | Signos del horóscopo: ficha estática del signo ✅ | Frontend | 🟠 Alta | 2 pts |
| T-SEO-005 | El build de Docker no usa lockfile (deriva de dependencias) ✅ | Infra | 🟠 Alta | 2 pts |
| T-SEO-006 | Los `notFound()` devuelven 200 (soft-404) ✅ | Frontend | 🟡 Media | 1.5 pts |
| T-SEO-007 | El panel de admin expulsa al admin (secuela de T-PROD-022) ✅ | Frontend | 🔴 Crítica | 1 pt |

**Orden recomendado:** todas cerradas (001–007).

---

## T-SEO-001: Guardarraíl Automático de Contenido Indexable

**Prioridad:** 🔴 Crítica · **Estimación:** 2 pts · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (9-ago-2026)

### Problema

La misma clase de bug —una página que trae su contenido por el cliente y por lo tanto sirve un cascarón
al crawler— se arregló **cuatro veces** (tarot, artículos, rituales, servicios), y las cuatro se
descubrieron **midiendo a mano con `curl`**. Eso no escala: la próxima página que alguien agregue con
datos del cliente nace invisible y nos enteramos por otro rechazo de AdSense.

### Alcance

Un script que recorra `sitemap.xml`, mida las palabras propias de cada URL y falle si alguna baja del
umbral. Debe poder correr contra un host arbitrario (build local, contenedor, producción).

- [x] `frontend/scripts/check-indexable-content.mjs` (o `.ts`) con:
  - [x] `--base-url` (default: `NEXT_PUBLIC_APP_URL`)
  - [x] `--min-words` (sugerido: 120 palabras propias)
  - [x] `--sample N` para muestreo estratificado por sección, y modo completo
  - [x] descuento automático del chrome: medirlo contra una ruta vacía conocida (`/admin`) en vez de
        hardcodear 39
  - [x] salida en tabla ordenada por palabras ascendente + exit code ≠ 0 si hay incumplimientos
  - [x] cache-buster en las requests (ver *Cómo verificar*)
- [x] **Detección de soft-404**: pedir un slug inventado por cada patrón de ruta dinámica y reportar si
      responde 200 en vez de 404. Alimenta T-SEO-006.
- [x] Lista de excepciones justificadas en el propio script (`RUTAS_EXENTAS`, hoy vacía a propósito).
- [x] Tests del script (59 tests: parseo del sitemap, conteo de palabras, secciones, muestreo, umbral,
      soft-404, exit code, orquestación con `fetch` inyectado).
- [x] Documentar el uso en `frontend/README.md` (+ paso 11 bis no bloqueante en `docs/WORKFLOW_FRONTEND.md`).

### Criterios de aceptación

- [x] Corriendo contra producción hoy, reporta las URLs delgadas conocidas (chino, signos, listados).
      ⚠️ **No son 27 sino 48** — ver *Qué encontró al correrlo* abajo: la muestra de 62 URLs se había
      salteado 6 hubs, y 13 fichas quedan entre 109 y 119 palabras.
- [x] Exit code ≠ 0 con esas URLs presentes; exit 0 si se le baja el umbral por debajo de ellas
      (`--min-words 3` → 178/178 cumplen, exit 0).
- [x] Detecta el soft-404 de `/enciclopedia/tarot/inventado-xyz` (y 10 más).

### Fuera de alcance

Enchufarlo como *gate* bloqueante de CI. Primero que exista y se use a mano; convertirlo en gate implica
decidir qué hacer cuando la API está caída durante el build, y eso merece su propia discusión.

### Qué encontró al correrlo (producción, 9-ago-2026, umbral 120)

`npm run check:indexable -- --base-url https://auguriatarot.com` → **48 de 178 URLs** por debajo del
umbral, no 27. El chrome medido dio **39 palabras exactas**, así que la referencia manual era correcta;
lo que estaba incompleto era la muestra.

| Grupo | URLs | Palabras propias | Tarea |
| --- | --- | --- | --- |
| Horóscopo chino por animal | 12 | 3 | T-SEO-002 |
| Signos del horóscopo | 12 | 31 | T-SEO-004 |
| Listados ya conocidos (`/premium`, `/servicios`, `/enciclopedia/guias`, `/explorar`, `/enciclopedia/tarot`) | 5 | 3–24 | T-SEO-003 |
| **Hubs que la muestra no había medido** (`/enciclopedia/astrologia/planetas` 18, `/enciclopedia/astrologia/signos` 23, `/enciclopedia/astrologia/casas` 26, `/contacto` 34, `/enciclopedia` 70, `/enciclopedia/astrologia` 70) | **6** | 18–70 | **sumar a T-SEO-003** |
| **Fichas al borde del umbral** (12 arcanos menores 110–119 + `/servicios/limpiezas-energeticas` 109) | **13** | 109–119 | contenido real, apenas corto |

Se escaparon porque el muestreo manual metía todos los hubs de primer nivel en una bolsa y medía unos
pocos. Por eso `sectionOf()` trata cada ruta de primer nivel como su propia sección: con `--sample 2` se
miden 34 URLs y **aparecen las 10 clases de problema**, no un subconjunto.

**11 soft-404** (responden 200 con la página de no-encontrado) — insumo directo para T-SEO-006:
`/enciclopedia`, `/enciclopedia/astrologia/{casas,planetas,signos}`, `/enciclopedia/{elementos,guias,tarot}`,
`/horoscopo`, `/horoscopo-chino`, `/rituales`, `/servicios`.

### Notas técnicas

- **Las rutas dinámicas se infieren del sitemap** (un padre con ≥3 hijos es un `[slug]`) en vez de
  hardcodearse: una sección nueva queda cubierta sin tocar el script.
- **El chrome se mide, no se asume.** Si alguien agrega un link al header, el umbral no se corre solo.
- Los tests del script viven en `frontend/scripts/*.test.mjs`; se agregó ese patrón al `include` de
  `vitest.config.ts` (antes solo miraba `src/`).
- **`scripts/` entró a los quality gates**: `lint`/`lint:fix` cubren `scripts/**/*.mjs`, `format`
  cubre `{src,scripts}`, y `tsconfig.test.json` incluye `**/*.mjs` para que el `// @ts-check` del
  script se valide en `npm run type-check`. Va en el tsconfig de tests y **no** en el de la app por
  la misma razón que los tests: un script de desarrollo no debe poder tumbar un deploy (T-SEO-005).
- **Modos de falla silenciosa cerrados tras la revisión**: si `/admin` no responde 200 la corrida
  aborta (con la línea base en 0 el umbral se ablandaba solo); una request caída se reporta como
  fila fallida en vez de tumbar las otras 177; y los soft-404 no cuentan para el exit code salvo
  `--fail-on-soft-404`, porque los 11 actuales harían fallar toda corrida hasta que se arregle
  T-SEO-006. **Actualizado el 19-ago-2026:** cerrada T-SEO-006, ese flag es el default y para
  ignorarlos hay que pasar `--no-fail-on-soft-404`.

---

## T-SEO-002: Horóscopo Chino — 12 URLs Sirven 3 Palabras

**Prioridad:** 🔴 Crítica · **Estimación:** 3 pts · **Dependencias:** conviene tener T-SEO-001
**Estado:** ✅ COMPLETADA (10-ago-2026)

### Problema

`/horoscopo-chino/[animal]` sirve **3 palabras propias** — el peor caso del sitio, peor incluso que antes
de arreglar el gate global. Son 12 URLs en el sitemap.

**La causa NO es la misma que en artículos/rituales.**
[AnimalHoroscopePage.tsx](../frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx)
usa `useSearchParams()` en un client component, lo que **deopta la ruta entera** del prerender estático:
Next no puede generar HTML porque el árbol depende de la query string. Por eso emite menos que el resto.

### Alcance sugerido

Separar lo estático de lo interactivo:

- [x] La ficha del animal se renderiza en el servidor sin tocar la API. `CHINESE_ZODIAC_INFO` alcanzaba
      para el encabezado pero no para 150 palabras (son ~10), así que el contenido propio se escribió en
      [chinese-zodiac-profiles.data.ts](../frontend/src/lib/constants/chinese-zodiac-profiles.data.ts):
      titular, dos párrafos de introducción, tres rasgos explicados, fortalezas, desafíos, amor, trabajo,
      compatibilidades y datos de suerte, **únicos por animal**.
- [x] La predicción del año queda client-side (`AnimalHoroscopePanel`), dentro de un `<Suspense>` en
      `AnimalHoroscopeRoute`. Ése es el corte que permite prerenderizar el resto.
- [x] El modal ya no bloquea: arranca cerrado y se abre con un botón (*Elegir mi elemento*) desde un
      aviso inline. Ver *Decisión de UX* abajo.
- [x] `generateStaticParams` emite los 12 animales: el build los lista como `●` (SSG) con `revalidate` de
      1 día.

### Criterios de aceptación

- [x] Las 12 URLs superan las 150 palabras propias: **355–401** (antes 3), medido contra el build de
      producción con el chrome en 39 palabras. Verificado también con
      `npm run check:indexable --base-url http://localhost:3099`: las 12 en ✅.
- [x] El selector de elemento y la predicción siguen funcionando: mismo `ElementSelectorModal`, mismo
      `handleElementSelect`, misma navegación con `?element=`. Cambia **cuándo** se abre el modal.
- [x] `getChineseZodiacMetadata` intacto: títulos únicos verificados en el HTML servido
      (`Horóscopo Chino: Rata` / `: Dragón` / `: Cerdo`) y canonical propio por URL.

### Decisión de UX: el modal ya no se auto-abre

Antes, al entrar a la ficha sin `?element=`, el modal se abría solo. Con la ficha nueva eso es un
problema doble: tapa el contenido con el overlay y, además, Radix marca `aria-hidden` en el resto del
documento mientras el diálogo está abierto, así que las 380 palabras recién agregadas quedaban fuera del
árbol de accesibilidad. Ahora la ficha se lee primero y aparece un aviso con dos salidas: *Elegir mi
elemento* (abre el mismo modal) y el enlace al calculador. Se eliminó el estado `userDismissedModal`, que
existía solo para no reabrir el modal descartado.

### Notas técnicas

- **La causa era el `useSearchParams` sin límite de Suspense**, como decía el diagnóstico. El árbol quedó
  así: `page.tsx` (server, `revalidate = 86400`) → `AnimalHoroscopeRoute` (server: valida el segmento,
  ficha, `<Suspense>`) → `AnimalHoroscopePanel` (`'use client'`, selector + predicción).
- **`AnimalHoroscopePage` pasó a llamarse `AnimalHoroscopePanel`** (ya no es la página) y perdió el
  branch de "Animal no válido": esa validación vive ahora en el componente de ruta, en el servidor, con
  una sola fuente de verdad. El "volver al listado" del encabezado es un `<Link>` real en lugar de un
  `router.push`, así que el crawler lo recorre.
- **`ChineseHoroscopeDetail` bajó su `<h1>` a `<h2>`**: el `<h1>` de la página es el de la ficha.
- **Los años de nacimiento se calculan**, no se hardcodean: `getAnimalBirthYears` en
  [chinese-zodiac.ts](../frontend/src/lib/utils/chinese-zodiac.ts) los deriva del ciclo de 12 sobre un
  rango fijo (1936–2043). El rango es fijo a propósito: con `new Date()` el HTML prerenderizado quedaría
  congelado en el año del build. La ficha aclara que el año chino empieza con el Año Nuevo Chino y deriva
  al calculador para las fechas de enero/febrero.
- **Guardarraíl de contenido en los tests**: `getProfileWordCount` + `MIN_PROFILE_WORDS` fallan si un
  perfil baja de 200 palabras, y hay tests de unicidad de párrafos, de reciprocidad de las afinidades y
  de que el choque sea el opuesto de la rueda. Si alguien recorta el contenido, se entera en CI y no en
  el próximo rechazo de AdSense.
- **El soft-404 sigue vivo** (`/horoscopo-chino/inventado-xyz` responde 200): es T-SEO-006, fuera de
  alcance acá.

### Ajustes tras la revisión

- **Dos bloques de compatibilidad y dos de suerte convivían sin distinguirse.** La ficha trae los datos
  tradicionales del signo y la predicción trae los del año, y no coinciden (la API guarda dos animales en
  choque, la tradición uno). Ahora los títulos lo dicen: "Compatibilidad tradicional de X" / "Suerte
  tradicional del signo X" contra "Afinidades de {año}" / "Elementos de Suerte de {año}".
  `ChineseCompatibility` acepta un `title` opcional para eso.
- **El barrel dejó de exportar los componentes de ruta.** `index → AnimalHoroscopeRoute → AnimalHoroscopePanel
  → index` era un ciclo, y el barrel es lo que un client component importa: un import con side-effect y las
  536 líneas de perfiles terminan en el bundle del navegador. El panel importa a sus hijos por ruta directa.
- **`showElementModal` pasó a `needsElementSelection`** en el hook: ya no controla ningún modal.
  Se eliminó también `isValidAnimal`, que quedó sin consumidores cuando la validación se fue al servidor.
- **Se sacó el `revalidate = 86400`**: el HTML sale entero de constantes del repo, así que un ISR diario
  regeneraba 12 URLs por día para producir el mismo byte.
- **El aviso de "elegí tu elemento" ya no parpadea** para el usuario autenticado en su propio animal: el
  hook expone `isResolvingUserAnimal` y el panel espera esa resolución.

---

## T-SEO-003: Listados y Hubs sin Contenido para el Crawler

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (10-ago-2026)

### Problema

| Ruta | Palabras propias |
| --- | --- |
| `/premium` | 3 |
| `/servicios` | 5 |
| `/enciclopedia/guias` | 13 |
| `/explorar` | 20 |
| `/enciclopedia/tarot` | 24 |

`/premium` es especialmente sensible: es a donde va un revisor de AdSense a mirar el modelo de negocio, y
sirve 3 palabras.

### Alcance

Mismo patrón del punto *El patrón que ya funciona*, aplicado a listados en vez de fichas:

- [x] `/enciclopedia/tarot` — la ruta ya es server; resolver `getCards()` y pasar por `initialData` a
      `EnciclopediaContent`.
- [x] `/enciclopedia/guias` — ídem con `GuiasContent`.
- [x] `/servicios` — ídem con `ServiciosPage`.
- [x] `/explorar` — listado de tarotistas; ojo que el endpoint es **paginado** (ver contrato en
      `.github/copilot-instructions.md`): sembrar solo la primera página.
- [x] `/premium` — revisar por qué sirve 3 palabras: si el contenido de planes viene de la API, sembrarlo;
      si es estático, entender qué lo está bloqueando. **Era lo segundo**: ver *Notas técnicas*.
- [x] **Sumados por T-SEO-001** (la muestra manual no los había medido): `/enciclopedia` 70,
      `/enciclopedia/astrologia` 70, `/enciclopedia/astrologia/casas` 26, `/enciclopedia/astrologia/planetas` 18,
      `/enciclopedia/astrologia/signos` 23 y `/contacto` 34. Los cinco primeros son hubs de listado, mismo
      patrón; `/contacto` es un formulario y quizá amerite texto propio en vez de sembrado.

### Criterios de aceptación

- [x] Las 11 rutas superan las 120 palabras propias, verificado con
      `npm run check:indexable -- --base-url http://localhost:3099` contra el build de producción en
      Docker (chrome medido en 39 palabras):

      | Ruta | Antes | Ahora |
      | --- | --- | --- |
      | `/premium` | 3 | **277** |
      | `/servicios` | 5 | **255** |
      | `/enciclopedia/guias` | 13 | **427** |
      | `/enciclopedia/astrologia/planetas` | 18 | **595** |
      | `/explorar` | 20 | **208** |
      | `/enciclopedia/astrologia/signos` | 23 | **649** |
      | `/enciclopedia/tarot` | 24 | **511** |
      | `/enciclopedia/astrologia/casas` | 26 | **822** |
      | `/contacto` | 34 | **183** |
      | `/enciclopedia` | 70 | **270** |
      | `/enciclopedia/astrologia` | 70 | **244** |

      El total del sitio pasó de **48 URLs bajo el umbral a 25**: quedan los 12 signos (T-SEO-004) y
      las 13 fichas al borde (109–119), ninguna de esta tarea.
- [x] Sin regresión en la interactividad (filtros, búsqueda, tabs): los tests de `/explorar`
      (búsqueda con debounce, chips de especialidad, estado vacío, navegación al perfil) y de la
      enciclopedia siguen verdes, adaptados al segundo argumento de los hooks.

### Notas técnicas

- **`/premium` no era un problema de sembrado.** Toda la página esperaba a `usePublicPlans` detrás de un
  esqueleto de pantalla completa, así que la comparativa, las FAQ y el "sin compromiso" —contenido
  estático que no depende de la API— no llegaban nunca al crawler. Ahora lo único que espera es el
  número del precio (`PriceSkeleton`). El sembrado se agregó igual, para que el HTML salga con el precio
  real.
- **Dos mecanismos, no uno.** Sembrar resuelve el caso feliz, pero deja el contenido de cada URL atado a
  que la API responda durante el build. Por eso cada ruta suma además un bloque editorial propio
  ([listing-intros.data.ts](../frontend/src/lib/constants/listing-intros.data.ts) +
  [ListingIntro.tsx](../frontend/src/components/common/ListingIntro.tsx)): texto escrito, único por ruta,
  que se renderiza siempre en el servidor. Es el piso garantizado —130 palabras mínimo, verificadas por
  `listing-intros.data.test.ts`— y de paso evita que estas URLs sean listas de enlaces sin texto propio,
  que es exactamente lo que Google llama contenido de poco valor.
- **Los listados degradan, las fichas no.** `resolveListingData` devuelve `undefined` si la API falla, al
  revés de `resolveRouteResource`, que propaga. La diferencia es deliberada y está documentada en
  [route-data.ts](../frontend/src/lib/metadata/route-data.ts): una ficha sin su recurso no tiene nada que
  mostrar; un listado tiene su introducción y el cliente reintenta al montar. `getArticlesByCategories`
  aplica el mismo criterio por categoría: una caída no deja sin contenido a las otras seis guías.
- **`initialDataUpdatedAt: 0` donde el dato cambia** (planes, servicios, tarotistas) y no donde es
  estático (cartas, artículos), siguiendo el criterio de T-PROD-024.
- **`/explorar` dejó de ser un client component.** El `useRouter` que la hacía cliente entera vive ahora
  en `ExplorarContent`; la ruta resuelve la primera página del endpoint paginado. El sembrado se aplica
  **solo con los filtros por defecto**: con búsqueda o especialidad activas la clave de caché es otra y
  sembrarla con el listado sin filtrar mostraría resultados que no corresponden.
- **`GUIDE_CATEGORIES` se movió a `encyclopedia-article.types.ts`**: la ruta (server) y `GuiasContent`
  (cliente) necesitan la misma lista, y el server component no debería importar el módulo cliente solo
  para leer una constante.
- **ISR:** 1 día para la enciclopedia (contenido estático, igual que las fichas) y 1 hora para
  `/premium`, `/servicios` y `/explorar`, donde precios y listados se editan desde el admin.
- **El soft-404 sigue vivo** (11 rutas responden 200): es T-SEO-006, fuera de alcance acá.

### Ajustes tras la revisión

- **`ServiciosPage` guardaba por `isError`**, justo el anti-patrón que documenta *El patrón que ya
  funciona*. Antes no molestaba porque sin sembrado un fetch fallido no tenía `data` que perder; con
  `initialData` + `initialDataUpdatedAt: 0` la query refetchea al montar, y un refetch fallido en
  background poblaba `error` **conservando el catálogo bueno**: al usuario se le borraba de la pantalla
  una grilla que ya estaba viendo. Ahora el error se muestra solo si además no hay datos.
- **Un `[]` del servidor ya no cuenta como sembrado.** En cartas y artículos no hay
  `initialDataUpdatedAt: 0` (contenido estático), así que un 200 con lista vacía —ventana de migración o
  seed— se estampaba como recién traído y el `staleTime` bloqueaba el refetch: la página quedaba vacía
  hasta 1 h en el cliente y hasta 24 h en el HTML cacheado. Se siembra solo si hay algo que sembrar.
- **La degradación dejó de ser muda.** `resolveListingData` y `getArticlesByCategories` logean el fallo:
  con el ISR, una caída de un segundo dejaba la ruta sin listado por 24 h y no quedaba rastro en ningún
  log. Es la misma clase de agujero que T-SEO-001 vino a cerrar.
- **La ruta `/explorar` importa `ExplorarContent` por su path directo** y el barrel dejó de exportarlo,
  igual que en T-SEO-002: el barrel arrastraba todo el marketplace al grafo de una ruta de servidor.
- **Tres correcciones al contenido editorial**, todas verificables por un revisor de AdSense en dos
  clics: la enciclopedia no ofrece "significado en combinación" (sí palabras clave y cartas
  relacionadas); la tarjeta del listado de guías no muestra años de experiencia ni lecturas realizadas
  (eso está en el perfil); y el plazo de respuesta de `/contacto` estaba dicho dos veces en la misma
  página, con "horas" en un lado y "horas hábiles" en el otro.
- **Test de integración de punta a punta** en
  [signos/seeding.test.tsx](../frontend/src/app/enciclopedia/astrologia/signos/seeding.test.tsx): ruta
  real, hook real y `QueryClient` real, con la API como único mock. Los tests de ruta verificaban la
  cañería (que el hook reciba el dato), no que el dato terminara en el HTML, que es lo que mide el
  crawler.

---

## T-SEO-004: Signos del Horóscopo — Ficha Estática del Signo

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (13-ago-2026)

### Problema

`/horoscopo/[sign]` sirve **31 palabras propias** × 12 URLs.

⚠️ **No se puede hacer SSR del horóscopo del día**, y es deliberado: se resuelve contra el **día calendario
local del visitante** (`useLocalHoroscope` → `useLocalToday`). Renderizarlo en el servidor mostraría el día
del servidor. Está documentado en T-PROD-020 y en `CLAUDE.md`.

### Alcance

- [x] Renderizar en el servidor la **ficha estática del signo**. `ZODIAC_SIGNS_INFO` alcanzaba para
      el encabezado pero no para 150 palabras (son 5 campos), así que el contenido propio se escribió
      en [zodiac-sign-profiles.data.ts](../frontend/src/lib/constants/zodiac-sign-profiles.data.ts):
      titular, dos párrafos de introducción, las tres áreas de la lectura diaria, mejor franja del
      día, señal de alerta, palabras clave, afinidades y eje opuesto, **únicos por signo**
      (271–319 palabras cada uno). Fechas, elemento, modalidad, afinidades y opuesto **no** se
      escriben: se derivan en [zodiac.ts](../frontend/src/lib/utils/zodiac.ts).
- [x] El horóscopo del día sigue client-side, dentro de la ficha y arriba del material estático
      (`HoroscopeSignPanel`). Sin `<Suspense>`: acá no hay `useSearchParams`, así que la ruta
      prerenderiza igual; el build lista los 12 signos como `●` (SSG).
- [x] No duplicar el artículo de `/enciclopedia/astrologia/signos/[slug]`: ver *Cómo se evitó la
      duplicación* abajo.

### Criterios de aceptación

- [x] Las 12 URLs superan las 150 palabras propias: **414–508** (antes 31), medido contra el build de
      producción en Docker con `npm run check:indexable -- --base-url http://localhost:3099`
      (chrome medido en 41 palabras). El total del sitio pasó de 153 a **162 de 178** sobre el umbral.
- [x] El horóscopo sigue cambiando a la medianoche local del visitante: `useLocalHoroscope` no se
      tocó y sigue viviendo en un client component. Lo único que se movió al servidor es lo que **no**
      depende del día.
- [x] `/horoscopo/aries` y `/enciclopedia/astrologia/signos/aries` no sirven el mismo texto:
      medido con shingles de 6 palabras contra las dos páginas servidas, el solapamiento es **6,6 %**
      y es todo header, footer y el rango de fechas.

### Cómo se evitó la duplicación con la enciclopedia

El artículo de la enciclopedia ya publica el **perfil astrológico** del signo (carácter, fortalezas,
desafíos, amor, compatibilidades, tarot, datos curiosos). Repetir eso en `/horoscopo/[sign]` era
fabricar dos URLs para el mismo contenido.

La ficha se escribió con otro ángulo, el que corresponde a la URL: **la lectura diaria**. Cómo
transcurre un día del signo, qué mirar en cada una de las tres áreas del horóscopo de hoy —las
mismas `love` / `wellness` / `money` que devuelve la API—, en qué franja rinde y qué señal atender
cuando el día se complica. Además, la ficha **enlaza** al artículo de la enciclopedia con una frase
que dice explícitamente qué hay en cada una, que es la señal que le queda a Google de que son
complementarias y no la misma página. El ángulo está documentado al tope del archivo de datos para
que un cambio futuro no lo desarme sin querer.

### Notas técnicas

- **El árbol quedó igual que en T-SEO-002**: `page.tsx` (server) → `HoroscopeSignRoute` (server:
  valida el segmento y sirve la ficha) → `HoroscopeSignPanel` (`'use client'`, horóscopo del día).
  `HoroscopeSignPageContent` pasó a llamarse `HoroscopeSignPanel` —ya no es la página—, recibe el
  signo **ya validado** por props en vez de leer `useParams`, y perdió el branch de "Signo no
  válido": esa validación vive ahora en el servidor, con una sola fuente de verdad. El "volver al
  hub" del encabezado es un `<Link>` real en lugar de un `router.push`, así que el crawler lo recorre.
- **El horóscopo del día va *dentro* de la ficha**, entre la introducción y el resto, por un `children`
  del componente de ficha. Ponerlo al final del artículo lo habría escondido debajo de 300 palabras,
  y es lo que el visitante viene a buscar; ponerlo antes del `<h1>` habría dejado el encabezado de la
  página por debajo del pliegue.
- **Nada se hardcodea dos veces.** `getZodiacDateRange`, `getZodiacModality`, `getHarmonicSigns`,
  `getOppositeSign` y `getZodiacEncyclopediaSlug` derivan del signo: las fechas salen del mismo
  `ZODIAC_DATE_RANGES` que usa `getZodiacSignFromDate` (que pasó de array a `Record`, sin cambiar su
  comportamiento), la modalidad del lugar en la rueda, la afinidad del elemento —fuego con aire,
  tierra con agua, la misma que describe la enciclopedia— y el opuesto de las seis posiciones.
  Escritos como contenido, tarde o temprano se contradicen con el artículo.
- **El slug de la enciclopedia no es la clave del enum**: el artículo de Tauro vive en
  `/enciclopedia/astrologia/signos/tauro`, no en `/taurus`. Se deriva de `nameEs` sin acentos y los
  12 valores están fijados en los tests, para que un cambio en la enciclopedia falle ahí y no en un
  enlace roto en producción.
- **`HoroscopeDetail` bajó su `<h1>` a `<h2>`**: el `<h1>` de la página es el de la ficha.
- **El barrel `'use client'` de la feature no exporta los componentes de ruta.** Mismo motivo que en
  T-SEO-002: exportarlos desde ahí arrastraría la ficha y los 12 perfiles al bundle del navegador.
- **Guardarraíl de contenido en los tests**: `getSignProfileWordCount` + `MIN_SIGN_PROFILE_WORDS`
  fallan si un perfil baja de 200 palabras, y hay tests de unicidad de párrafos y de listas de
  palabras clave. Si alguien recorta el contenido, se entera en CI y no en el próximo rechazo.
- **Test de punta a punta en la ruta**: `page.test.tsx` renderiza el server component ya resuelto con
  la API del horóscopo mockeada y verifica que el texto de la ficha llegue al HTML — que es lo que
  mide el crawler—, no solo que la cañería esté conectada.
- **El soft-404 sigue vivo** (`/horoscopo/inventado-xyz` responde 200): es T-SEO-006, fuera de
  alcance acá.

### Ajustes tras la revisión

- **`getHarmonicSigns` listaba al signo opuesto como afín.** El opuesto está a seis posiciones y
  seis ≡ dos en el ciclo de cuatro elementos, así que **siempre** cae en el elemento complementario
  y entraba en la lista. Resultado: cada ficha mostraba al mismo signo en "con qué signos sintoniza"
  y en "su eje opuesto", con dos enlaces al mismo href, y contradecía al `compatibleSigns` de la
  enciclopedia —que lista al opuesto aparte—, justo lo que derivar el dato venía a evitar.
  Astrológicamente tampoco cerraba: mismo elemento es trígono y elemento amigo a ±2 es sextil, pero
  ±6 es una **oposición**, que es tensión y no sintonía. Ahora se filtra: quedan 4 signos por ficha
  (2 trígonos + 2 sextiles), idénticos a los de la enciclopedia, y hay un test que lo fija.
- **Tests de coherencia con `birth-chart.enums.ts`.** Ese módulo ya declara fechas, modalidad,
  elemento y slug de enciclopedia para los mismos 12 signos, con su propio enum. Los helpers los
  derivan en vez de repetirlos, así que las dos tablas podían divergir sin que nada fallara: se
  agregaron 48 tests que cruzan las dos. Si alguna vez difieren, la ficha del horóscopo estaría
  mostrando un dato distinto del que muestra la carta astral para el mismo signo.
- **El orden del enum `ZodiacSign` es load-bearing** y ahora lo dice donde se declara: la modalidad y
  el opuesto salen de la posición en la rueda.
- **El bloque del horóscopo del día tiene nombre accesible** (`<h2 class="sr-only">Horóscopo de
  hoy</h2>` + `aria-labelledby`). Su único encabezado lo aportaba `HoroscopeDetail`, y solo cuando
  hay datos: mientras cargaba, la sección quedaba anónima.

---

## T-SEO-005: El Build de Docker no Usa Lockfile

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** coordinación con el panel de Railway
**Estado:** ✅ COMPLETADA (19-ago-2026) — código, cambio de panel y deploy verificados en producción

### Problema

El [Dockerfile del frontend](../frontend/Dockerfile) copiaba solo `package.json` y corría `npm install`, sin
lockfile. Resolvía versiones **más nuevas** que local y que CI: en el incidente del 8-ago el builder trajo
**Next 16.3.0** contra **16.0.6** local, y esa deriva rompió el deploy **durante dos semanas con CI en
verde**. T-PROD-023 eliminó la clase de fallo concreta (tipos de tests), pero la causa de fondo seguía viva:
cualquier deriva en dependencias de *aplicación* podía volver a romper un deploy sin aviso.

### Opciones

1. **Recomendada:** mover el *Root Directory* de Railway a la raíz del monorepo y usar `npm ci` contra el
   lockfile raíz — idéntico a CI. Hay precedente: el Dockerfile del backend ya se construye desde la raíz.
2. Commitear un `frontend/package-lock.json` propio. No requiere tocar Railway, pero deja dos lockfiles en
   un repo con workspaces, que npm no maneja bien y que se desincronizan.

### Alcance (opción 1)

- [x] Adaptar `frontend/Dockerfile` a contexto de raíz (`COPY package.json package-lock.json ./`,
      `npm ci -w frontend`, rutas del monorepo). Quedó de dos stages —builder + producción— igual que el
      del backend, en vez de los tres de antes: el stage `deps` separado ya no aporta nada porque el orden
      *copiar manifiestos → instalar → copiar fuente* da la misma caché de capas.
- [x] **Coordinado con el Delta**: cambio aplicado por `railway api` (GraphQL `serviceInstanceUpdate`),
      no a mano por el panel. ⚠️ **Los valores no eran los que decía este backlog**: el backend, que ya
      construía desde la raíz, usa *Root Directory* **vacío** (no `/`) y *Dockerfile Path* **con barra
      inicial**. Se espejó esa convención en vez de inventar una:

      | Servicio | Root Directory | Dockerfile Path |
      | --- | --- | --- |
      | backend | `""` | `/backend/tarot-app/Dockerfile` |
      | frontend | `""` | `/frontend/Dockerfile` |

      Confirmado por API que ambos servicios tienen su *deployment trigger* en `main` y que hay un solo
      environment (`production`), o sea un solo panel que tocar. Aplicar el cambio **no** disparó ningún
      build, así que el sitio siguió sirviendo el deployment viejo hasta el merge a `main`.
- [x] Verificar con `docker build` real desde la raíz **antes** de tocar el panel.

### Criterios de aceptación

- [x] `docker build` desde la raíz completa y resuelve **las mismas versiones que local/CI**:
      **57/57** dependencias declaradas en `frontend/package.json` coinciden exactamente con el
      `package-lock.json` raíz. `next` da **16.2.2** dentro de la imagen = 16.2.2 en el lockfile.
- [x] Deploy exitoso en Railway (19-ago-2026). El *tell* en los logs del build es `RUN npm ci -w frontend`
      + `added 759 packages` — **los mismos 759 del build local**. Antes decía `RUN npm install` y
      `added 723 packages`: 36 paquetes de diferencia, que es exactamente la deriva que esta tarea vino
      a cerrar.

### Cómo se verificó (19-ago-2026)

```bash
# 1. Build desde la RAÍZ del repo (no desde frontend/)
docker build --no-cache -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_APP_URL=https://auguriatarot.com \
  --build-arg NEXT_PUBLIC_API_URL=https://api.auguriatarot.com/api/v1 \
  --build-arg NEXT_PUBLIC_APP_ENV=production -t auguria-front-lockfile .
# → exit 0, 218 páginas estáticas generadas

# 2. Versiones dentro de la imagen contra el lockfile → 57/57 idénticas
docker run --rm --entrypoint node auguria-front-lockfile \
  -p "require('/app/node_modules/next/package.json').version"   # 16.2.2

# 3. El contenedor sirve contenido real: guardarraíl de T-SEO-001 contra la imagen
docker run -d --name chk-005 -p 3099:3001 \
  -e NEXT_PUBLIC_API_URL=https://api.auguriatarot.com/api/v1 \
  -e NEXT_PUBLIC_APP_URL=https://auguriatarot.com auguria-front-lockfile
# ⚠️ `-w frontend`: el script vive en frontend/package.json y acá estamos en la raíz
npm run check:indexable -w frontend -- --base-url http://localhost:3099 --sample 2
# → 34/34 cumplen (123–820 palabras propias), 0 por debajo del umbral.
#   Los 11 soft-404 que reporta son los conocidos de T-SEO-006, no una regresión.
```

### Verificación en producción (19-ago-2026, post-deploy)

Con cache-buster, porque el edge de Railway cachea con `s-maxage=31536000`:

```bash
npm run check:indexable -w frontend -- --base-url https://auguriatarot.com --sample 2
# → 34/34 cumplen · 0 por debajo del umbral — idéntico a lo medido contra el contenedor local.
#   Los 11 soft-404 siguen ahí: son T-SEO-006, no una regresión.
```

Home 650 palabras, `/horoscopo/aries` 550, `/enciclopedia/tarot/the-fool` 260, `/servicios` 294;
imágenes de `public/` y `manifest.json` en 200. El cambio de layout del `standalone` no rompió nada.

### Notas técnicas

- **El output `standalone` cambia de forma en contexto de monorepo.** Con la raíz en el contexto, Next
  detecta el workspace root por el `package-lock.json` y emite `standalone/frontend/server.js` con los
  `node_modules` izados en `standalone/node_modules` —en vez de `standalone/server.js`—. Por eso el stage
  de producción copia a `./frontend/.next/static` y `./frontend/public`, y el `CMD` es
  `node frontend/server.js`. **Es el mismo layout que ya producía el build local**, que siempre vio el
  lockfile raíz: la que era rara era la imagen, no el local.
- **`npm ci -w frontend`** instala 759 paquetes (raíz + workspace). No necesita `legacy-peer-deps`: el
  conflicto de peers opcionales de `@hookform/resolvers` solo aparece en una resolución fresca
  (`npm install`), y el lockfile ya trae el árbol resuelto. Por eso el Dockerfile dejó de copiar
  `frontend/.npmrc` **antes del install**; el archivo sigue entrando después, con el `COPY frontend/`, pero
  para entonces la instalación ya está hecha. **El invariante es el orden**: si alguien adelanta ese `COPY`,
  el `.npmrc` vuelve a gobernar la instalación. Hay un comentario en el Dockerfile diciéndolo.
- **Costo de caché aceptado**: ahora la capa del `npm ci` se invalida ante cualquier cambio del lockfile
  raíz, incluido un bump de dependencia del *backend*. Son ~20 s de reinstalación; barato contra la
  reproducibilidad.
- **El `.dockerignore` que manda ahora es el de la raíz**, no `frontend/.dockerignore` (Docker lee el del
  contexto). El de la raíz ya cubría lo que importa —`frontend/node_modules`, `frontend/.next`, specs y
  coverage—, pero **no había paridad completa**: los patrones de Docker no cruzan `/`, así que `.env`/`.env.*`
  cubrían solo la raíz del repo, y `**/test/` no matchea `tests/`. Se le sumaron `frontend/.env*`,
  `**/tests/`, `**/test-results/`, `**/docs/` y `**/*.md`. Sin eso el árbol de e2e, `test-results/` y los
  `docs/` de cada workspace entraban al stage `builder` (a la imagen de producción no llegaban, y
  `tests/e2e` está en el `exclude` del `tsconfig`, así que no rompía nada — pero un `frontend/.env` futuro
  sí se habría colado en una capa).
  **`frontend/.dockerignore` se borró**: no puede volver a aplicarse nunca, y dejarlo era garantizar que
  alguien agregue ahí una exclusión que no hace nada.
- **El build sigue exigiendo los `--build-arg`**: sin `NEXT_PUBLIC_API_URL` falla al recolectar
  `/tarotistas/[id]/reservar`. Es preexistente y Railway los inyecta, pero conviene saberlo al reproducir
  a mano.
- **El `node_modules` local estaba desactualizado** (`next` 16.0.6 contra los 16.2.2 del lockfile), así que
  el build local venía validando una versión que producción no iba a correr. Resuelto el 19-ago con un
  `npm ci` en la raíz —que no toca el lockfile, a diferencia de `npm install`—, y revalidado con la
  versión nueva: type-check limpio, 6039 tests y build en verde. **Local, CI y la imagen resuelven ahora
  exactamente lo mismo**, que era el punto de la tarea.
- **Lo que esta tarea NO arregla**: que el deploy de Railway no corra ningún test ni el guardarraíl. Sigue
  siendo posible romper producción con CI en verde por otras vías; lo que se cierra es la deriva de
  versiones.

---

## T-SEO-006: Los `notFound()` Devuelven 200 (Soft-404)

**Prioridad:** 🟡 Media · **Estimación:** 1.5 pts · **Dependencias:** T-SEO-001 ayuda a detectarlo
**Estado:** ✅ COMPLETADA (19-ago-2026)

### Problema

Medido contra la imagen de producción el 9-ago:

```
/enciclopedia/elementos/aries      → 200 (página de no-encontrado)
/servicios/inventado               → 200 (página de no-encontrado)
/enciclopedia/tarot/inventado-xyz  → 200 (página de no-encontrado)
```

`notFound()` corta el render y sirve la página correcta, pero **no emite el status 404**. Un soft-404 es
justamente lo que Google penaliza: la URL entra al índice como página válida y vacía.

⚠️ Es **preexistente** — la tercera URL usa código de T-PROD-020 que ya estaba en producción — pero
invalida la afirmación de "404 real" que quedó escrita en T-PROD-020, T-PROD-021 y T-PROD-024 (los
comentarios del código ya se corrigieron; el backlog viejo conserva la afirmación).

### Causa: el `app/loading.tsx` global

Era **streaming**, la primera hipótesis de la lista, pero no por la razón que decía: no había ninguna
llamada tardía a `notFound()`. El causante era
[`src/app/loading.tsx`](../frontend/src/app/loading.tsx), un spinner global.

Un `loading.tsx` es azúcar sintáctica para envolver el segmento en un `<Suspense>`. Al estar en la
**raíz** de `app/`, envolvía **todas** las rutas del sitio. Con ese límite presente, el shell (todo lo
que queda fuera del Suspense: `<html>`, el layout, header y footer) está listo apenas renderiza el
layout, así que Next **confirma la respuesta con 200 y emite el esqueleto** antes de correr el cuerpo
de la página. Cuando `notFound()` se lanzaba, ya no había status que cambiar: el error viajaba por el
stream como `NEXT_HTTP_ERROR_FALLBACK;404` y la página de no-encontrado la pintaba el **cliente**.

Medido contra el build de producción (`node frontend/server.js`, el mismo comando del Dockerfile),
con seis rutas de sonda que aislan cada variable:

| Sonda | `notFound()` en… | `revalidate` | `generateStaticParams` | Con `loading.tsx` | Sin él |
| --- | --- | --- | --- | --- | --- |
| a | page | no | no | **200** | 404 |
| b | page | sí | no | **200** | 404 |
| c | `generateMetadata` | no | no | **200** | 404 |
| d | `generateMetadata` | sí | sí | **200** | 404 |
| e | — (`dynamicParams = false`) | no | sí | 404 | 404 |
| f | page (`force-dynamic`) | — | no | **200** | 404 |

Las hipótesis de ISR y de `generateMetadata` quedaron descartadas: la sonda `f` (`force-dynamic`, sin
caché de por medio) también daba 200, y la `a` —la más simple posible— también. La única que
funcionaba era la `e`, que **nunca llega a renderizar**: con `dynamicParams = false` Next descarta el
segmento desconocido en el router, antes del render.

Lo que sí es cierto de las hipótesis originales: `/ruta-que-no-existe` (una URL que no matchea ningún
patrón) siempre respondió 404, porque ahí Next sirve el `/_not-found` prerenderizado sin renderizar
nada.

### Alcance

- [x] **Eliminado `app/loading.tsx`.** Era el límite de Suspense que impedía emitir el 404, y además
      hacía que **cualquier** render on-demand le sirviera un spinner al crawler en vez de la página
      —la misma clase de bug que T-SEO-001 vino a cazar—. Los `loading.tsx` **por segmento**
      (`/tarot`, `/ritual`, `/explorar`, `/historial`, `/carta-astral`) se conservan: ninguno envuelve
      una ruta dinámica pública.
- [x] Las dos páginas que dependían de ese Suspense prestado tienen el suyo:
      [registro](../frontend/src/app/registro/page.tsx) y
      [premium/activacion](../frontend/src/app/premium/activacion/page.tsx) leen la query string con
      `useSearchParams`. Sin el límite propio, el build falla con *"useSearchParams() should be
      wrapped in a suspense boundary"* — es decir que el `loading.tsx` global estaba **tapando**
      esa deuda.
- [x] `/horoscopo/[sign]` y `/horoscopo-chino/[animal]` llaman a `notFound()`. Estas dos **no eran un
      problema de Next**: renderizaban a propósito una ficha de "Signo no válido" / "Animal no
      válido" con status 200, que es un soft-404 escrito a mano. Se eliminó también
      `INVALID_ROUTE_PARAM_METADATA` (metadata `noindex` + `canonical: './'`), que existía solo para
      maquillar ese 200 y quedó sin sentido con un 404 real.
- [x] `/tarotistas/[id]` (pública e indexable: `robots.ts` bloquea `/tarotistas/*/reservar`, no el
      perfil) resuelve el perfil en el servidor y corta con `notFound()`. Tenía además un bug
      preexistente: tipaba `params` como objeto plano cuando en Next 16 es una `Promise`, así que
      `Number(params.id)` daba **`NaN`** y el request salía a la API como `/tarotistas/NaN`. El
      parseo del segmento vive ahora en
      [`parseNumericRouteId`](../frontend/src/lib/utils/route-params.ts).
- [x] Test de regresión de **status HTTP**: [`tests/e2e/soft-404.spec.ts`](../frontend/tests/e2e/soft-404.spec.ts)
      (16 casos) pide un slug inventado por cada patrón dinámico público y asevera 404, más cuatro
      URLs válidas que deben seguir en 200 para que "todo 404" no pase la suite.
- [x] **El guardarraíl ahora falla.** `check:indexable` reportaba los soft-404 sin afectar el exit
      code, precisamente porque los 11 conocidos habrían hecho fallar toda corrida. Cerrada la
      tarea, `--fail-on-soft-404` pasó a ser el default y se agregó `--no-fail-on-soft-404` para
      volver atrás.

### Criterios de aceptación

- [x] Un slug inexistente en cualquier ruta dinámica pública devuelve **404**. Verificado sobre el
      build de producción (`node frontend/server.js`): las 11 rutas que reportaba T-SEO-001, más
      `/tarotistas/abc` y `/tarotistas/999999`.
- [x] Las URLs válidas siguen devolviendo 200 con su contenido: `check:indexable` contra ese mismo
      build da **45/45 cumplen** y **"✅ Sin soft-404"**.

### Notas técnicas

- **Qué se pierde al sacar el `loading.tsx` global:** el spinner de pantalla completa en la
  navegación client-side hacia rutas que no tenían el suyo. Los circuitos que sí tardan —tarot,
  ritual, historial, carta astral, explorar— conservan su `loading.tsx` de segmento. Quedan sin
  feedback de navegación cinco rutas `ƒ` (server-rendered on demand): `/tarotistas/[id]`,
  `/tarotistas/[id]/reservar`, `/servicios/[slug]/pago`, `/servicios/reservar/[purchaseId]` y
  `/compartida/[token]`. Las cuatro últimas son client components cuyo render en el servidor es
  inmediato (montan su propio esqueleto), así que la espera es solo el payload RSC. La primera sí
  hace una llamada bloqueante a la API, y **ahí no se puede agregar un `loading.tsx`**: reintroduciría
  exactamente el soft-404 que esta tarea cerró. El remedio para esa ruta fue el opuesto —pasarle el
  perfil ya resuelto al componente— así que el cliente no vuelve a pedirlo y el HTML trae el
  contenido real. Lo que se gana en las once rutas públicas es que el servidor no confirme un 200
  antes de saber qué va a renderizar.
- **El cuerpo del 404 lo pinta el cliente.** Con `notFound()` desde una ruta ya matcheada, Next 16
  responde 404 con un documento vacío y el `not-found.tsx` se monta al hidratar (verificado también
  en las seis sondas, así que es comportamiento de Next y no algo de este árbol). No es una regresión
  —antes el crawler recibía el spinner, con status 200— y para SEO lo determinante es el status: con
  un 404 Google descarta la URL sin mirar el cuerpo.
- **Se corrigieron los tests que documentaban el bug como comportamiento esperado.** Los de
  `/horoscopo/[sign]` y `/horoscopo-chino/[animal]` aseveraban el texto "Signo no válido" y la
  metadata `noindex`; ahora aseveran que la ruta corta con `notFound()`. El de `/tarotistas/[id]`
  pasaba `params` como objeto plano, que es justamente lo que ocultaba el `NaN` en producción.
- **Los tests unitarios no alcanzan para esto y por eso hay un e2e.** Las rutas llamaban a
  `notFound()` desde antes de esta tarea y sus tests lo verificaban: el status HTTP es una capa que
  jsdom no ve.
- **`soft-404.spec.ts` exige un build de producción y la API arriba.** Corriéndolo contra
  `next dev` el pipeline de streaming no es el mismo, así que una regresión podría no aparecer; y
  con la API caída `resolveRouteResource` propaga y las rutas de enciclopedia/rituales/servicios
  responden 500 en vez de 404. Queda escrito en el encabezado del spec y en `tests/e2e/README.md`.

### Salió de la revisión

- **`/tarotistas/[id]` descartaba el perfil que acababa de traer.** La primera versión del arreglo
  usaba el fetch del servidor solo como portón del 404 y devolvía `<TarotistaProfilePage id={id} />`,
  que volvía a pedir el mismo perfil desde el cliente: dos llamadas a la API por visita y, en una
  ruta **indexable**, un HTML con el esqueleto —el agujero que T-SEO-004 cerró en las otras—. Ahora
  se le pasa `initialTarotista`, igual que las 5 hermanas, y `useTarotistaDetail` lo acepta como
  `initialData` con `initialDataUpdatedAt: 0` (mismo criterio que `useRitual`: las valoraciones
  cambian, así que el cliente igual refetchea al montar).
- **`/tarotistas/[id]/reservar` arrastraba el mismo bug de `params` que el padre.** Tipaba
  `params` como objeto plano —en Next 16 es una `Promise`—, así que `Number(params.id)` daba `NaN` y
  `BookingPage` arrancaba con un id inválido. Es privada, así que no era un soft-404, pero la
  reserva salía rota. Pasó a leer el segmento con `useParams` (el patrón de las otras rutas cliente)
  + `parseNumericRouteId`. Su test lo tapaba pasando `params` como prop; ahora mockea `useParams`.
- **Faltaban dos casos en el e2e:** la ruta legacy `/enciclopedia/[slug]` (redirige y debe terminar
  en 404) y `/tarotistas/999999` — solo estaba `/tarotistas/abc`, que ejercita el parseo del
  segmento y no el 404 que devuelve la API.
- **Quedaba un `useSearchParams` sin límite de Suspense propio:** `/servicios/[slug]/pago`. No rompe
  el build porque la ruta sale como `ƒ` (no se prerenderiza), así que se deja como está y queda
  anotado: si algún día se le agrega `generateStaticParams`, el build va a fallar ahí.

---

## T-SEO-007: El Panel de Admin Expulsa al Admin (secuela de T-PROD-022)

**Prioridad:** 🔴 Crítica · **Estimación:** 1 pt · **Dependencias:** ninguna
**Detectado:** 12-ago-2026, en producción
**Estado:** ✅ COMPLETADA (13-ago-2026)

### Problema

`auguriatarot.com/admin` redirige a `/perfil` **incluso siendo admin**. Hoy el sitio no tiene ningún
administrador que pueda entrar al panel.

**No es un problema de permisos.** Verificado contra la base de producción:

```
id=7  florzenavilla@gmail.com  roles={consumer,admin}  isAdmin=t  creada 19-abr-2026
```

Cero filas en `audit_logs` para ese usuario (nadie le quitó el rol desde el panel), la base es la
original (18 usuarios, el más viejo del 6-abr) y es la **única** cuenta admin del sistema.

### Causa

[admin/layout.tsx](../frontend/src/app/admin/layout.tsx) redirige cuando `user` es `null`, **sin
esperar a que la sesión se resuelva**:

```tsx
useEffect(() => {
  if (!isAuthenticated || !user || !user.roles.includes('admin')) {
    router.push('/perfil'); // ⚠️ corre con el store todavía vacío
  }
}, [isAuthenticated, user, router]);
```

El store arranca siempre en `user: null, isAuthenticated: false, isLoading: true`
([authStore.ts](../frontend/src/stores/authStore.ts)): el usuario y sus roles aparecen recién después
de rehidratar `localStorage` y de que responda `GET /users/profile`. En ese hueco el efecto ya
redirigió.

**Por qué empezó ahora:** hasta el 8-ago el `AuthProvider` devolvía "Verificando sesión…" *en lugar de*
`children`, así que el layout de admin nunca llegaba a montarse con el usuario vacío — el bug estaba
tapado. **T-PROD-022** sacó ese splash (era lo que servía 3 palabras a Googlebot y costó el rechazo de
AdSense) y **T-PROD-023** destrabó el deploy, así que llegó a producción. El comentario del propio
provider ya dejaba escrito cómo tenían que quedar las rutas privadas —*"usan `useRequireAuth`, que
espera a que `isLoading` sea `false` antes de redirigir"*— y `/admin` es la única que no se migró: es
el **único gate del front que mira `roles` y no mira `isLoading`**.

Como además no hay ningún enlace a `/admin` en la navegación, la única forma de entrar es escribiendo
la URL, que es justo el caso que siempre falla. Por eso se ve como "perdí el rol" y no como algo
intermitente.

### Alcance

- [x] `admin/layout.tsx` espera a `isLoading === false` antes de decidir. El guard se escribió como hook
      —[useRequireAdmin.ts](../frontend/src/hooks/useRequireAdmin.ts)— que **compone** `useRequireAuth`
      (autenticación + espera) y le suma la verificación de rol encima, en vez de un tercer guard a mano.
      El layout quedó sin `useEffect` de redirección y sin `useRouter`.
- [x] Mientras se resuelve la sesión, el layout muestra el `Spinner` del proyecto (*Verificando
      permisos…*) en vez de `null`. Ya no hay pantalla en blanco previa a la expulsión.
- [x] Enlace **Panel de Admin** en el menú de la cuenta ([UserMenu.tsx](../frontend/src/components/layout/UserMenu.tsx)),
      visible solo para admins. Se implementó y no solo se evaluó: sin él, la única vía de entrada era
      justamente la que fallaba.
- [x] **Barrido del resto de los guards del front.** `/admin` era el único con la forma. Resultado:
      - los redirects automáticos por sesión están todos en `useRequireAuth`, que ya espera `isLoading`;
      - `CategorySelector` y `RitualPageContent` redirigen por *capabilities*, pero ya gatean con su
        propio `isLoading` (y `RitualPageContent` exige `user` presente);
      - `ChartResultPageContent` y `ActivationPage` redirigen por estado de store / query param, no por
        sesión;
      - el resto de los `router.push` con `user`/`isAuthenticated` son handlers de click, no efectos de
        montaje;
      - no hay `middleware.ts` ni ningún otro punto del front que lea `roles`.

### Criterios de aceptación

- [x] Entrar directo a `/admin` (URL pegada o F5 dentro del panel) con una cuenta admin **no** redirige.
- [x] Una cuenta sin rol admin sigue siendo redirigida a `/perfil`.
- [x] Test de regresión que cubra el estado intermedio: `isLoading: true` con `user: null` **no** dispara
      la redirección. Cubierto en los dos niveles: el hook
      ([useRequireAdmin.test.ts](../frontend/src/hooks/useRequireAdmin.test.ts), incluye la transición
      `loading → admin resuelto`) y el layout
      ([layout.test.tsx](../frontend/src/app/admin/layout.test.tsx), sin redirección + spinner + los
      children recién cuando resuelve).

### Notas

- El backend está bien: `admin.guard.ts` acepta el rol por el array `roles` o por el booleano legacy
  `isAdmin`, y la cuenta tiene los dos. La API le responde; es la web la que no la deja entrar.
- **El front ahora acepta los dos igual que el backend.** `UserProfileResponseDto` devuelve `roles` **y**
  `isAdmin`, pero el tipo `AuthUser` del front solo declaraba `roles`. Se agregó `isAdmin?: boolean` al
  tipo y la regla vive en un único lugar —[isAdminUser()](../frontend/src/lib/utils/roles.ts)— que usan
  tanto el guard como el menú, para que no puedan divergir.
- **Cambio de destino para el visitante anónimo:** antes `/admin` sin sesión mandaba a `/perfil`, que a
  su vez rebota a `/login` por `useRequireAuth`. Ahora va directo a `/login`; se ahorra el salto
  intermedio y el destino final es el mismo. Los no-admin **autenticados** siguen yendo a `/perfil`.
- Queda anotado en este backlog y no en uno de producción porque es **daño colateral directo** del
  arreglo de SEO: es el precio que quedó pendiente de pagar por haber sacado el splash bloqueante.

**Follow-up detectado en la revisión (fuera del alcance de esta tarea):** el `catch` de `checkAuth`
en [authStore.ts](../frontend/src/stores/authStore.ts) es un catch-all: ante **cualquier** error de
`GET /users/profile` —un blip de red, un timeout, un 5xx— borra los tokens y hace `setUser(null)`, y
con la sesión ya resuelta el guard manda a `/login`. Es la única vía de expulsión que queda y es
**previa** a T-SEO-007: afecta por igual a todas las rutas protegidas, no solo al panel. El arreglo
sería limpiar la sesión solo ante 401/403 y conservarla ante errores de red o 5xx. Merece su propia
tarea porque toca el manejo de sesión de todo el front.

---

## 📌 Pendientes de Ops (no son código)

- [ ] **Solicitar la revisión de AdSense** — recomendado **después** de T-SEO-002 y T-SEO-003. Con
      `/premium` sirviendo 3 palabras, un revisor ve lo mismo que motivó el primer rechazo, y un segundo
      rechazo cuesta más que unos días de espera.
- [ ] **Search Console**: reenviar el sitemap y pedir re-indexación. Google todavía tiene en el índice la
      versión de 3 palabras por página.
- [ ] **`ads.txt`**: verificado el 9-ago, correcto en producción
      (`google.com, pub-3738638099455331, DIRECT, f08c47fec0942fa0`). El "No se encuentra" del panel es
      previo al deploy; Google lo re-rastrea solo.
- [ ] **Verificar que no haya www y no-www dados de alta a la vez** en Search Console sirviendo lo mismo
      (pendiente desde T-PROD-020).

---

## ➡️ Continúa en la fase 2

El 19-ago-2026 AdSense rechazó el sitio por segunda vez, **diez horas antes** de que el deploy de
esta fase llegara a producción (el build de Docker estuvo roto dos semanas; lo destrabó T-SEO-005).
Midiendo producción después del deploy aparece un problema distinto, que esta fase no tocó: las **79
fichas de tarot son el 44 % del sitio y promedian 166 palabras propias**.

**[BACKLOG_SEO_CONTENIDO_2026_08.md](./BACKLOG_SEO_CONTENIDO_2026_08.md)** — T-SEO-008 a T-SEO-013:
volumen editorial, autoría (E-E-A-T), terminología YMYL y la puerta de salida antes de pedir la
tercera revisión.
