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

1. **CI en verde NO significa que el deploy funcione.** CI usa `npm ci` contra el lockfile de la raíz;
   el Dockerfile de Railway corre `npm install` sin lockfile y resuelve versiones distintas. El deploy
   estuvo roto dos semanas con CI verde. Ver T-SEO-005.
2. **El build local no prerenderiza lo que depende de la API** (no está levantada). Para ver el HTML real:

```bash
cd frontend
docker build --no-cache \
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
| T-SEO-005 | El build de Docker no usa lockfile (deriva de dependencias) | Infra | 🟠 Alta | 2 pts |
| T-SEO-006 | Los `notFound()` devuelven 200 (soft-404) | Frontend | 🟡 Media | 1.5 pts |
| T-SEO-007 | El panel de admin expulsa al admin (secuela de T-PROD-022) ✅ | Frontend | 🔴 Crítica | 1 pt |

**Orden recomendado:** 005 → 006 (001, 002, 003, 004 y 007 ya están cerradas).
El 005, en un momento sin urgencia, porque necesita coordinación con el panel de Railway.

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
  T-SEO-006.

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

### Problema

El [Dockerfile del frontend](../frontend/Dockerfile) copia solo `package.json` y corre `npm install`, sin
lockfile. Resuelve versiones **más nuevas** que local y que CI: en el incidente del 8-ago el builder trajo
**Next 16.3.0** contra **16.0.6** local, y esa deriva rompió el deploy **durante dos semanas con CI en
verde**. T-PROD-023 eliminó la clase de fallo concreta (tipos de tests), pero la causa de fondo sigue viva:
cualquier deriva en dependencias de *aplicación* puede volver a romper un deploy sin aviso.

### Opciones

1. **Recomendada:** mover el *Root Directory* de Railway a la raíz del monorepo y usar `npm ci` contra el
   lockfile raíz — idéntico a CI. Hay precedente: el Dockerfile del backend ya se construye desde la raíz.
2. Commitear un `frontend/package-lock.json` propio. No requiere tocar Railway, pero deja dos lockfiles en
   un repo con workspaces, que npm no maneja bien y que se desincronizan.

### Alcance (opción 1)

- [ ] Adaptar `frontend/Dockerfile` a contexto de raíz (`COPY package.json package-lock.json ./`,
      `npm ci`, rutas del monorepo).
- [ ] **Coordinar con el Delta**: en el panel de Railway hay que cambiar *Root Directory* a `/` y
      *Dockerfile Path* a `frontend/Dockerfile`. **Si sale solo una de las dos mitades, el deploy se rompe.**
- [ ] Verificar con `docker build` real desde la raíz **antes** de tocar el panel.

### Criterios de aceptación

- [ ] `docker build` desde la raíz completa y resuelve **las mismas versiones que local/CI** (comparar
      `next --version` dentro de la imagen contra el lockfile).
- [ ] Deploy exitoso en Railway.

---

## T-SEO-006: Los `notFound()` Devuelven 200 (Soft-404)

**Prioridad:** 🟡 Media · **Estimación:** 1.5 pts · **Dependencias:** T-SEO-001 ayuda a detectarlo

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

### Alcance

- [ ] Entender por qué Next no emite 404 en estas rutas. Hipótesis a descartar: streaming (headers ya
      enviados cuando se llama `notFound()`), interacción con ISR/`revalidate`, ausencia de un
      `not-found.tsx` por segmento.
- [ ] Arreglarlo o, si es una limitación real de esta configuración, documentar la alternativa
      (p. ej. validar el slug **antes** de empezar a renderizar).
- [ ] Test de regresión que asevere el **status HTTP**, no solo el contenido.

### Criterios de aceptación

- [ ] Un slug inexistente en cualquier ruta dinámica pública devuelve **404**.
- [ ] Las URLs válidas siguen devolviendo 200 con su contenido.

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
