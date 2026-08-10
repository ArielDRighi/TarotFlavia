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
| **Signos del horóscopo** | **12** | **31** | ❌ T-SEO-004 |
| **Listados y hubs** (`/premium` 3, `/servicios` 5, `/explorar` 20, `/enciclopedia/tarot` 24, `/enciclopedia/guias` 13) | **5** | 3–24 | ❌ T-SEO-003 |

**29 de 62 URLs muestreadas superan las 150 palabras propias** (antes de este trabajo: 13).
Con T-SEO-002 cerrada, **41 de 62**: los 12 animales del horóscopo chino pasaron de 3 a 355–401.

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
| T-SEO-003 | Listados y hubs sin contenido para el crawler | Frontend | 🟠 Alta | 2 pts |
| T-SEO-004 | Signos del horóscopo: ficha estática del signo | Frontend | 🟠 Alta | 2 pts |
| T-SEO-005 | El build de Docker no usa lockfile (deriva de dependencias) | Infra | 🟠 Alta | 2 pts |
| T-SEO-006 | Los `notFound()` devuelven 200 (soft-404) | Frontend | 🟡 Media | 1.5 pts |

**Orden recomendado:** 001 → 002 → 003 → 004 → 005 → 006.
El 001 primero porque convierte el resto en verificable; el 005 en un momento sin urgencia porque
necesita coordinación con el panel de Railway.

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

- [ ] `/enciclopedia/tarot` — la ruta ya es server; resolver `getCards()` y pasar por `initialData` a
      `EnciclopediaContent`.
- [ ] `/enciclopedia/guias` — ídem con `GuiasContent`.
- [ ] `/servicios` — ídem con `ServiciosPage`.
- [ ] `/explorar` — listado de tarotistas; ojo que el endpoint es **paginado** (ver contrato en
      `.github/copilot-instructions.md`): sembrar solo la primera página.
- [ ] `/premium` — revisar por qué sirve 3 palabras: si el contenido de planes viene de la API, sembrarlo;
      si es estático, entender qué lo está bloqueando.
- [ ] **Sumados por T-SEO-001** (la muestra manual no los había medido): `/enciclopedia` 70,
      `/enciclopedia/astrologia` 70, `/enciclopedia/astrologia/casas` 26, `/enciclopedia/astrologia/planetas` 18,
      `/enciclopedia/astrologia/signos` 23 y `/contacto` 34. Los cinco primeros son hubs de listado, mismo
      patrón; `/contacto` es un formulario y quizá amerite texto propio en vez de sembrado.

### Criterios de aceptación

- [ ] Las 11 rutas superan las 120 palabras propias, verificado con
      `npm run check:indexable -- --base-url https://auguriatarot.com`.
- [ ] Sin regresión en la interactividad (filtros, búsqueda, tabs).

---

## T-SEO-004: Signos del Horóscopo — Ficha Estática del Signo

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna

### Problema

`/horoscopo/[sign]` sirve **31 palabras propias** × 12 URLs.

⚠️ **No se puede hacer SSR del horóscopo del día**, y es deliberado: se resuelve contra el **día calendario
local del visitante** (`useLocalHoroscope` → `useLocalToday`). Renderizarlo en el servidor mostraría el día
del servidor. Está documentado en T-PROD-020 y en `CLAUDE.md`.

### Alcance

- [ ] Renderizar en el servidor la **ficha estática del signo**: nombre, símbolo, fechas, elemento,
      modalidad, rasgos, compatibilidades. Sale de `ZODIAC_SIGNS_INFO`
      ([zodiac.ts](../frontend/src/lib/utils/zodiac.ts)) o de la enciclopedia, sin depender del día.
- [ ] El horóscopo del día sigue client-side, debajo o al costado.
- [ ] Ojo con no duplicar el artículo de `/enciclopedia/astrologia/signos/[slug]`: si el texto es el
      mismo, Google los agrupa. Usar contenido distinto o canonicalizar a uno de los dos.

### Criterios de aceptación

- [ ] Las 12 URLs superan las 150 palabras propias.
- [ ] El horóscopo sigue cambiando a la medianoche local del visitante (no romper T-PROD-020).
- [ ] `/horoscopo/aries` y `/enciclopedia/astrologia/signos/aries` no sirven el mismo texto.

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
