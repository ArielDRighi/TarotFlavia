# Backlog — Incidente de deploy del 31-ago-2026 (el contador de vistas tiró el build)

> **Estado:** 🟡 Abierto — 001 a 004 completadas; T-DEPLOY-005 quedó abierta al barrer las fechas.
> **Fecha del diagnóstico:** 31-ago-2026
> **Rama:** `fix/encyclopedia-view-count-fire-and-forget`

---

## Qué pasó

El deploy del frontend **falló**. El build de Next abortó durante el export estático:

```
Error occurred prerendering page "/enciclopedia/tarot/four-of-swords"
Error occurred prerendering page "/enciclopedia/tarot/the-emperor"
Error [AxiosError]: Request failed with status code 500
  path: '/api/v1/encyclopedia/cards/five-of-wands'
  data: { statusCode: 500, message: 'Internal server error' }

Export encountered an error on /enciclopedia/tarot/[slug]/page, exiting the build.
```

Producción no se cayó: el frontend siguió sirviendo el build anterior y el backend nuevo quedó
sano. Lo que se perdió fue el deploy.

### La secuencia (UTC)

⚠️ **Son dos relojes distintos.** Las horas del backend salen del campo `timestamp` que estampa
la app; las del build son las que Railway pone al ingerir el log, y llegan unos segundos después
del hecho. No se pueden alinear al segundo entre sí, así que la tabla ordena por lo que **causó**
qué, no por el número.

| Hora | Reloj | Qué |
| --- | --- | --- |
| 23:59:37 | Railway | push a `main` → arranca el deploy de **los dos servicios a la vez** |
| 00:11:35 | build | el frontend llega al export estático: **31 workers**, 219 páginas |
| 00:11:36 | build | 54/219 páginas listas — las fichas venían respondiendo bien |
| ~00:11:39 | — | las requests que van a fallar entran al backend (deducido: 00:11:44 menos los 5s del timeout) |
| 00:11:41 | build | tres páginas fallan con 500 y Next aborta el build |
| 00:11:44.314 | backend | primer `Query read timeout`; el último es 00:11:44.448 — **todos en 134ms** |
| ~00:11:47 | Railway | `Stopping Container` del backend viejo |
| 00:12:35 | backend | el backend nuevo levanta, sano |

## Causa raíz

`EncyclopediaService.findBySlug` **esperaba** al contador de vistas:

```ts
// ❌ antes
async findBySlug(slug: string): Promise<CardDetailDto> {
  const card = await this.cardRepository.findOne({ where: { slug } });
  if (!card) throw new NotFoundException(`Carta "${slug}" no encontrada`);

  await this.incrementViewCount(card.id);   // ← un UPDATE, bloqueante
  return this.toDetailDto(card);
}
```

O sea: **cada lectura de una ficha era también una escritura, y la escritura estaba en el camino
crítico**. Si el `UPDATE` fallaba, la excepción subía y el endpoint devolvía 500.

El log del backend viejo lo dice entero. Copiado verbatim de
`railway logs --deployment --service backend 101c0ae8`, con los saltos de línea del campo `stack`
expandidos y el resto sin tocar —las barras de `\"` son el escapado del propio log—:

```
[ERRO] HTTP Request Error context="HTTPLogger"
  correlationId="1d31ff2f-27ef-4d68-bba9-9b76601f2285" duration="5054ms"
  error="Query read timeout" method="GET"
  url="/api/v1/encyclopedia/cards/five-of-wands"
  stack="QueryFailedError: Query read timeout
    at PostgresQueryRunner.query (/app/node_modules/typeorm/driver/postgres/PostgresQueryRunner.js:216:19)
    at async UpdateQueryBuilder.execute (/app/node_modules/typeorm/query-builder/UpdateQueryBuilder.js:83:33)
    at async EncyclopediaService.incrementViewCount (/app/backend/tarot-app/dist/src/modules/encyclopedia/application/services/encyclopedia.service.js:144:9)
    at async EncyclopediaService.findBySlug (/app/backend/tarot-app/dist/src/modules/encyclopedia/application/services/encyclopedia.service.js:90:9)"

[ERRO] Query read timeout context="ExceptionsHandler" parameters=[27]
  query="UPDATE \"encyclopedia_tarot_cards\" SET \"view_count\" = \"view_count\" + 1, \"updated_at\" = CURRENT_TIMESTAMP WHERE \"id\" = $1"
```

Dos cosas para leer ahí:

- Los ~5.005ms (van de 5.004 a 5.105 según la request) no son casualidad:
  `src/config/typeorm.ts:119` fija `query_timeout: DB_MAX_QUERY_TIME || 5000`.
- El `context="HTTPLogger"` importa: ese log **no** lo emite TypeORM —en producción corre con
  `logging: false`, `config/typeorm.ts:80`— sino
  `common/interceptors/logging.interceptor.ts`, porque el error llegó hasta la capa HTTP. Ver
  *[Sobre el log del error](#sobre-el-log-del-error)*.

### Por qué justo en el deploy

El export estático pide las **78 fichas con 31 workers en paralelo**. Con el `await`, cada lectura
arrastraba un `UPDATE`: 78 en total, hasta 31 en vuelo a la vez, contra un pool de 25 conexiones
(25 es el tamaño con `NODE_ENV=production` y `DB_POOL_SIZE` sin setear; en dev arranca con 10).

En un día normal aguanta. Ese día el contenedor del backend se estaba apagando por su propio
deploy —los dos servicios salen del mismo push, a la misma hora— así que las conexiones se
drenaban mientras los escritores se apilaban. Se saturó, timeout, 500, build abortado.

**El deploy simultáneo no es la causa, es el disparador.** La causa es que un contador de vistas
—telemetría pura— pudiera tumbar la lectura de la ficha.

### El detalle que más molesta

`ArticlesService` **ya tenía el arreglo**, con docblock y todo, desde que se escribió:

```ts
// articles.service.ts — tal cual estaba: la estructura correcta que las fichas nunca recibieron
private incrementViewCount(id: number): void {
  this.articleRepository.increment({ id }, 'viewCount', 1).catch(() => {
    /* silencioso — no bloquea la respuesta al usuario */
  });
}
```

Dos servicios hermanos en el mismo módulo, el mismo contador, y sólo uno era fire-and-forget.

(El `.catch()` mudo de artículos tenía su propio problema, que se arregla en esta misma tarea —
ver *[Sobre el log del error](#sobre-el-log-del-error)*.)

---

## Tareas

| ID | Tarea | Tipo | Prioridad | Estimación | Estado |
| --- | --- | --- | --- | --- | --- |
| T-DEPLOY-001 | Hacer fire-and-forget el contador de vistas de las fichas | Backend | 🔴 Crítica | 0,5 pts | ✅ Completada (31-ago-2026) |
| T-DEPLOY-002 | Que el export estático no escriba en la base | Backend/Frontend | 🟡 Media | 1 pt | ✅ Completada (31-ago-2026) |
| T-DEPLOY-003 | Sacar las escrituras de telemetría de los otros tres caminos de lectura | Backend | 🟠 Alta | 1 pt | ✅ Completada (31-ago-2026) |
| T-DEPLOY-004 | Los rezagados: `lastLogin` en el login, catches mudos y el e2e de `share-text` | Backend | 🟡 Media | 1 pt | ✅ Completada (01-sep-2026) |
| T-DEPLOY-005 | El resto del desfasaje UTC vs zona de la app | Backend | 🟠 Alta | 1,5 pts | ⬜ Pendiente |

---

## T-DEPLOY-001: Hacer Fire-and-Forget el Contador de Vistas de las Fichas

**Prioridad:** 🔴 Crítica · **Estimación:** 0,5 pts · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (31-ago-2026)

### Alcance

- [x] `findBySlug` deja de esperar al contador.
- [x] `incrementViewCount` pasa a `repository.increment(...)` con `.catch()`. Sigue siendo un
      `UPDATE` atómico (`view_count = view_count + 1`), no un read-modify-write: no se pierden
      vistas por concurrencia. Y sigue tocando `updated_at`, igual que el query builder que
      reemplaza —`UpdateQueryBuilder` agrega el `@UpdateDateColumn` solo, verificado contra la
      base—.
- [x] `ArticlesService` recibe el mismo log en su `.catch()`, que estaba mudo.
- [x] Tests de regresión.

```ts
// ✅ después
private incrementViewCount(id: number): void {
  this.cardRepository.increment({ id }, 'viewCount', 1).catch((error) => {
    this.logger.warn(
      `No se pudo incrementar view_count de la carta ${id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  });
}
```

### Sobre el log del error

La primera versión de este fix copiaba de artículos un `.catch()` **vacío**, con el argumento de
que "el logger de TypeORM igual lo registra". Eso era falso, y lo levantó la revisión:

- En producción TypeORM corre con `logging: false` (`config/typeorm.ts:80`, que sólo habilita logs
  cuando `NODE_ENV === 'development'`).
- El log que este mismo postmortem cita arriba lleva `context="HTTPLogger"`: lo emitió
  `common/interceptors/logging.interceptor.ts` porque el error llegó a la capa HTTP. Que es
  exactamente lo que este fix deja de permitir.

O sea que un `.catch()` mudo habría dejado el contador roto **sin ningún rastro en producción**, y
el diagnóstico que hizo posible este postmortem no habría sido posible la próxima vez. Por eso el
catch loguea a `warn`, y por eso se le agregó lo mismo a `ArticlesService`, que tenía el mismo
agujero desde que se escribió.

El fallo sigue sin llegar al usuario. Lo que cambia es que deja de ser invisible para nosotros.

### Verificación

Los tests unitarios cubren el contrato, pero el que importa es el escenario real. Se reprodujo
contra la base de desarrollo tomando un lock exclusivo sobre la fila desde otra sesión, que es lo
que hace un `UPDATE` concurrente:

```sql
BEGIN; SELECT view_count FROM encyclopedia_tarot_cards WHERE slug='five-of-wands' FOR UPDATE;
SELECT pg_sleep(12); ROLLBACK;
```

Con el `UPDATE` del contador bloqueado más allá del `query_timeout` de 5000ms:

| | Antes | Después |
| --- | --- | --- |
| `GET /encyclopedia/cards/five-of-wands` | **500** a los ~5.005ms | **200** a los **18ms** |

Y el fallo del contador queda registrado, con el `correlationId` de la request para poder cruzarlo:

```
warn [b74c3afb-...] [EncyclopediaService]: No se pudo incrementar view_count de la carta 5: Query read timeout
```

Con la base sana el contador sigue funcionando —`view_count` 5 → 8 tras tres requests, con el mismo
SQL atómico de siempre— y **`updated_at` se sigue tocando**: era la duda razonable al cambiar el
query builder por `increment()`, y la respuesta es que no hay diferencia, porque
`UpdateQueryBuilder` agrega el `@UpdateDateColumn` por su cuenta. Verificado en la base:
`the-fool` pasó de `view_count=9 / updated_at=2026-08-28 01:20` a
`view_count=10 / updated_at=2026-09-01 01:12`.

### Criterios de aceptación

- [x] Un fallo del contador no afecta la respuesta del endpoint (verificado con el lock de arriba).
- [x] El rechazo queda manejado y **logueado**, no silenciado.
- [x] El contador sigue incrementando cuando la base está sana, y sigue tocando `updated_at`.
- [x] Los tests fallan si alguien revierte el fix — verificado mutando el servicio a propósito,
      ver abajo.
- [x] `npm run format`, `npm run lint`, `npm run test:cov`, `npm run build` y
      `node scripts/validate-architecture.js` en verde.

### Los tests

`encyclopedia.service.spec.ts` → `describe('incrementViewCount (integrado en findBySlug)')`:

1. Llama a `increment({ id }, 'viewCount', 1)` al pedir el detalle.
2. **La regresión del incidente:** con `increment` rechazando, `findBySlug` resuelve igual.
3. El fallo se loguea a `warn` con el mensaje del error.
4. No incrementa si el slug no existe (el `NotFoundException` sigue primero).

Los dos primeros y el tercero se verificaron **mutando el servicio a propósito** —el único modo de
saber si un test sirve—:

| Mutación | Qué falla |
| --- | --- |
| Sacar el `.catch()` (deja el rechazo colgado) | el test 3 |
| Volver al `await` bloqueante | los tests 2 y 3 |

### El test que se descartó

La primera versión tenía un cuarto test que escuchaba `process.on('unhandledRejection')` para
probar que el rechazo quedaba manejado. **No servía para nada**, y lo demostró la revisión
corriéndolo: Jest intercepta los rechazos colgados y los reporta al final del run, así que ese
evento **nunca se emite** y el test pasaba igual con el `.catch()` borrado.

Se reemplazó por el test 3, que afirma sobre el `warn`. Ese sí falla cuando no hay `.catch()`,
porque sin catch no hay log — y de paso cubre lo que de verdad importa, que el fallo se vea.

---

## T-DEPLOY-002: Que el Export Estático No Escriba en la Base

**Prioridad:** 🟡 Media · **Estimación:** 1 pt · **Dependencias:** T-DEPLOY-001
**Estado:** ✅ COMPLETADA (31-ago-2026) — **130 → 0 vistas falsas por deploy, medido**

### Problema

T-DEPLOY-001 sacó el fallo del camino crítico, pero el build **seguía escribiendo**.

Y no son sólo las fichas. También se prerenderizan las rutas de artículos
(`enciclopedia/elementos/[slug]`, `guias/[slug]`, `astrologia/{signos,planetas,casas}/[slug]`), que
incrementan vía `ArticlesService.findBySlug`, **y las de rituales** (`rituales/[slug]`), vía
`RitualsService.findBySlug`.

Con **78 fichas + 48 artículos + 4 rituales**, cada deploy del frontend sumaba **130 vistas falsas**
y disparaba otros tantos `UPDATE` contra el pool mientras el backend puede estar redeployando.

> Los rituales aparecieron en la revisión: el alcance original de esta tarea sólo hablaba de fichas
> y artículos. Ver *[Lo que faltaba](#lo-que-faltaba-rituales)*.

Dos consecuencias, ninguna catastrófica ya:

- **El dato está contaminado.** `view_count` mezcla visitas reales con builds. Si algún día se usa
  para ordenar fichas "más vistas", ordena por cantidad de deploys.
- **Ruido en cada deploy.** Los `Query read timeout` van a seguir apareciendo en los logs de
  producción cada vez que se deploye, ahora sin romper nada pero ensuciando el diagnóstico del
  próximo incidente.

### Alcance

- [x] Que el prerender no cuente como vista, **en fichas, artículos y rituales**.
- [ ] ~~Bajar la concurrencia del export~~ — ver *Lo que no hizo falta*.
- [ ] ~~Desacoplar los deploys~~ — ídem.

### La decisión: un header, no un query param

Se evaluaron tres mecanismos:

| Opción | Por qué no |
| --- | --- |
| `?prerender=1` | Ensucia las URLs y rompe la semántica de caché/CDN por query string |
| **Header `X-Prerender`** | **La elegida.** Invisible para el caché, no toca el contrato de rutas |
| Endpoint de lectura pura aparte | Duplica código y hay que mantener dos caminos en sincronía |

El frontend lo manda desde el interceptor de request de axios —el criterio es del transporte, no
de cada endpoint: **nada de lo que pasa durante el build es la acción de una persona**— y el
backend lo lee con un decorador de parámetro, `@IsPrerender()`.

⚠️ **Es una pista, no una credencial.** Cualquiera puede mandar el header y dejar de ser contado.
Para un contador de vistas es aceptable —no hay nada que ganar falsificándolo y no gatea ningún
acceso— pero queda escrito en el decorador: **no usarlo para nada que tenga consecuencias**.

### Los dos modos de falla silenciosa que había que tapar

Los dos habrían dejado el fix sin efecto **sin romper un solo test**:

1. **Que `NEXT_PHASE` quedara horneado en el bundle del cliente.** `isPrerenderBuild()` daría
   `true` para siempre en el navegador y **dejaríamos de contar todas las vistas reales**. Por eso
   la función corta con `typeof window !== 'undefined'` antes de mirar la variable.

   Verificado contra el bundle construido: `phase-production-build`, `NEXT_PHASE` y `X-Prerender`
   aparecen **cero veces** en los 119 chunks de `.next/static/`. Y la guarda resultó hacer más de
   lo que se esperaba: SWC constant-foldea `typeof window !== 'undefined'` a `true` en el build de
   cliente, así que la función colapsa a `return false` y **el bloque del header se elimina del
   bundle por dead-code elimination**. No es sólo un cinturón de runtime: el código ni siquiera
   viaja al navegador.

   (El test corre en jsdom, donde la condición se evalúa en runtime: verifica el comportamiento
   pero no puede ver la eliminación. La garantía real es más fuerte que la que el test prueba.)
2. **Cachear `NEXT_PHASE` al importar el módulo.** Durante el build Next levanta workers y el
   módulo puede cargarse antes de que la variable esté puesta; una `const` de módulo daría `false`
   para siempre. Se lee en cada llamada, y hay un test que lo fija.

### Verificación: medida, no deducida

Un test unitario no puede probar que el header viaja de punta a punta en un build real. Así que se
corrió el build del frontend contra el backend local y se midió la suma de `view_count` antes y
después. Y para que la medición signifique algo, se corrió **también con el header desactivado**:

| Build | fichas | artículos | rituales |
| --- | --- | --- | --- |
| **Con** el header | 416 → **416** | 3782 → **3782** | 31 → **31** |
| **Sin** el header (mutación) | 416 → **494** (+78) | 3782 → **3830** (+48) | 29 → **33** (+4) |

**+78, +48 y +4 = las 130 vistas falsas.** Ahora está medido en vez de estimado.

El build sí pegó a la API en los dos casos —304 queries de enciclopedia en el log del backend,
incluidas las de `findBySlug`—, así que el 416 → 416 es "no contó", no "no preguntó". (Los
contadores de la base de desarrollo se restauraron después de cada prueba.)

### Lo que faltaba: rituales

La primera versión de este fix cubría fichas y artículos, que era el alcance escrito. La revisión
fue a buscar **otras páginas prerenderizadas que pegaran a endpoints con contador** y encontró
`rituales/[slug]`: `generateStaticParams` con 4 slugs, `getRitualBySlug` awaiteado en
`generateMetadata` y en el body, y `RitualsService.findBySlug` incrementando.

Medido con la app corriendo: `GET /rituals/:slug` **ignoraba el header** —el header viajaba, el
backend lo tiraba— y un build completo sumaba +4. Se arregló con el mismo patrón, que ya estaba
escrito: `@IsPrerender()` en el controller y `DetailReadOptions` en el servicio.

Por eso `DetailReadOptions` terminó en `common/interfaces/` y no dentro del módulo de enciclopedia:
lo usan dos módulos.

**Los que se revisaron y no tenían el problema:** los horóscopos (`/horoscopo/[sign]` y
`/horoscopo-chino/[animal]` prerenderizan desde constantes del repo; su API sólo la tocan
componentes `'use client'`, cero requests en build), `/servicios/[slug]` (pega a la API en build
pero `holistic-services` no tiene contador), y el resto de los `increment()` del backend, que están
detrás de auth o de POSTs de uso.

### Lo que no hizo falta

El alcance original proponía además bajar la concurrencia del export (31 workers) y desacoplar los
deploys. **Ninguna de las dos se hizo, y no por falta de tiempo:**

- Con el prerender sin escribir, los 31 workers ya no disparan ningún `UPDATE`. La concurrencia
  dejó de ser un problema en vez de mitigarse.
- El orden de los deploys sigue importando por otra razón —el contenido de las fichas, ver el
  docblock de `enciclopedia/tarot/[slug]/page.tsx`— pero eso es T-SEO, no este backlog.

Bajar los workers habría hecho el build más lento a cambio de nada.

### ⚠️ Lo que este fix NO arregla, y conviene saber antes de confiar en `view_count`

La revisión levantó algo que cambia cómo hay que leer la columna, y que **no es un defecto de esta
tarea** pero sí material para quien la use.

Las cuatro rutas de detalle son SSG con `revalidate = 86400`, y `useCard(slug, initialCard)`
(`hooks/api/useEncyclopedia.ts`) siembra React Query con `initialData` y `staleTime` de 1 h. O sea
que **una visita real a `/enciclopedia/tarot/[slug]` no genera ninguna request** a la API: el HTML
sale del caché estático y el cliente no refetchea.

Antes de esta tarea, el prerender era prácticamente lo único que incrementaba en producción.
Después, lo único que queda es la regeneración de ISR: **~1 incremento por página por día, haya 0 o
10.000 visitas**.

`view_count` pasó de "visitas infladas por deploy" a **"días desde el último deploy"**. Ninguna de
las dos cosas es "visitas". Si algún día el número tiene que significar algo, hay que medirlo desde
el cliente o desde los logs del edge, no desde este endpoint.

### Fuera de alcance

Rediseñar el conteo de vistas (buffer en memoria, batch, Redis, medición desde el cliente). Si
`view_count` llega a importar de verdad, es su propia tarea — y el párrafo de arriba es el punto de
partida.

### Criterios de aceptación

- [x] Un build completo del frontend no mueve ningún `view_count` — medido.
- [x] La medición es significativa: sin el header, el mismo build suma 130.
- [x] El cableado decorador → controller → servicio está cubierto sobre HTTP real
      (`test/prerender-view-count.e2e-spec.ts`, 9 tests). Los unitarios **no** lo cubrían: le pasan
      el booleano a mano al controller, así que desconectar el `@IsPrerender()` los dejaba a los
      237 en verde. Verificado mutando exactamente eso: los unitarios siguen verdes, el e2e falla.
- [x] Una visita real al **endpoint** sigue contando: el default de `countView` es `true` y el
      header nunca sale del navegador. Verificado por HTTP en
      `test/prerender-view-count.e2e-spec.ts`.
- [x] Backend: `format`, `lint`, `test:cov` (4815 tests, 85,89% statements), `build`,
      `validate-architecture` en verde.
- [x] Frontend: `format`, `lint:fix`, `type-check`, `test:run` (6211 tests), `build`,
      `validate-architecture` en verde.

---

## T-DEPLOY-003: Sacar las Escrituras de Telemetría de los Otros Tres Caminos de Lectura

**Prioridad:** 🟠 Alta · **Estimación:** 1 pt · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (31-ago-2026)

### Problema

La revisión de T-DEPLOY-001 fue a buscar el mismo antipatrón al resto del backend y encontró
**tres lugares más** donde un `await` de escritura de telemetría está en un camino de lectura.
Ninguno está en la ruta del prerender, así que el próximo deploy no se rompe por éstos — pero es
la misma bomba, y dos están en endpoints públicos.

| Dónde | Qué hace | Por qué importa |
| --- | --- | --- |
| `readings-orchestrator.service.ts:189` | `getSharedReading` awaitea `incrementViewCount` | endpoint **público sin auth** (`shared-readings.controller.ts:35`). Fix idéntico al de esta tarea, una línea |
| `readings.controller.ts:363` | `GET :id/share-text` awaitea `incrementShareCount` | el peor de los tres, ver abajo |
| `interpretation-cache.service.ts:106` | `getFromCache` awaitea el UPDATE de `hit_count` | un **cache hit** se convierte en error con el dato ya en la mano |

### El de `share-text` necesita más que sacar el `await`

`typeorm-reading.repository.ts:287` no sólo incrementa: después del `increment` hace un `findOne`
extra y tira un `Error` genérico —o sea, un 500— si no encuentra la fila.

```ts
async incrementShareCount(id: number): Promise<TarotReading> {
  await this.readingRepo.increment({ id }, 'shareCount', 1);
  const reading = await this.readingRepo.findOne({ where: { id } });   // ← round-trip de más
  if (!reading) throw new Error(`Reading with id ${id} not found`);    // ← 500 por telemetría
  return reading;
}
```

Y el `TarotReading` que devuelve **se descarta** en el controller. El único caller es
`readings.controller.ts:363`, así que la firma puede pasar a `Promise<void>` y el `findOne` y el
`throw` se van con ella. Hay que tocar `IReadingRepository` (`reading-repository.interface.ts:24`)
y el orquestador (`readings-orchestrator.service.ts:198`).

### El del caché necesita además arreglo de atomicidad

```ts
await this.cacheRepository.update(
  { id: dbCache.id },
  { hit_count: dbCache.hit_count + 1, last_used_at: new Date() },   // ← read-modify-write
);
```

Es read-modify-write sobre un valor leído antes, no un `increment` atómico: bajo concurrencia
pierde cuentas, independientemente del `await`. Van las dos cosas juntas: `increment()` para
`hit_count` y el `update` de `last_used_at`, los dos fuera del camino crítico.

### Alcance

- [x] `getSharedReading`: fire-and-forget con log, igual que T-DEPLOY-001.
- [x] `incrementShareCount`: el repositorio pasa a `Promise<void>` y se le borran el `findOne` y el
      `throw`; el orquestador pasa a `void` y se traga el rechazo con log; el controller deja de
      esperarlo. Actualizada la interfaz `IReadingRepository`.
- [x] `getFromCache`: un solo `UPDATE` atómico, fuera del camino crítico.
- [x] Tests de regresión en los tres, con la mutación verificada.

### Dónde quedó la responsabilidad

El fire-and-forget vive en el **orquestador**, no en el controller. Es lo que hace que el controller
no pueda equivocarse: `incrementShareCount(id): void` no devuelve nada que se pueda esperar, así
que el tipo garantiza lo que antes garantizaba la disciplina.

Por eso el spec del controller **no** tiene un test de "el contador falla": no hay forma de que ese
fallo le llegue. El primer intento sí lo tenía, mockeando un throw síncrono, y se descartó porque
modelaba algo que el código no puede hacer. Los tests del fallo viven donde vive la lógica.

### El `UPDATE` del caché, verificado

Va en una sola sentencia en vez de un `increment()` más un `update()`: son dos columnas de la misma
fila y no hay razón para pagar dos round-trips. El SQL tal como lo ejecuta Postgres:

```sql
UPDATE "cached_interpretations"
SET "hit_count" = "hit_count" + 1, "last_used_at" = $1
WHERE "id" = $2
```

El `+ 1` lo resuelve Postgres. Antes era `hit_count: dbCache.hit_count + 1`, sumado en JS sobre un
valor leído antes: dos hits concurrentes escribían el mismo número y uno se perdía.

**La prueba de que ahora no se pierde:** tres hits concurrentes sobre la misma fila con
`hit_count = 5` la dejan en **8**. Los tres leyeron valores distintos y ninguna cuenta se perdió.
Con el read-modify-write viejo se habría perdido al menos una.

### Verificación en runtime

Los tres se probaron contra la base de desarrollo bloqueando la fila desde otra sesión
(`SELECT ... FOR UPDATE` + `pg_sleep`), que es lo que hace un `UPDATE` concurrente:

| Endpoint | Camino sano | Con el contador bloqueado |
| --- | --- | --- |
| `GET /shared/:token` (público) | **200**, `viewCount` 0 → 1 | **200 en 28ms** |
| `GET /readings/:id/share-text` | **200 en 46ms**, `shareCount` 0 → 1 | **200 en 60ms** |
| `getFromCache` | `hit_count` 5 → 6 y `last_used_at` seteado, 8ms | devuelve el hit en **11ms** |

Los fallos quedan logueados con el `correlationId` de la request:

```
warn [1bfa1a18-...] [ReadingsOrchestratorService]: No se pudo incrementar viewCount de la lectura 1: Query read timeout
```

El `UPDATE` de `share-text` es una sola sentencia y **no hay ningún SELECT después** — el `findOne`
que se borró efectivamente no está:

```sql
UPDATE "tarot_reading" SET "shareCount" = "shareCount" + 1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $1
```

(Los datos de prueba quedaron como estaban: la lectura con `sharedToken` en `null`, `isPublic` en
`false` y los contadores en 0, y la fila sembrada en `cached_interpretations` borrada.)

### Un detalle que cambia cómo se leen estos logs

`query_timeout` es del **lado del cliente**: `pg` deja de esperar la respuesta y rechaza la promesa,
pero **no cancela la sentencia en el servidor**. El `statement_timeout` es 30000ms
(`config/typeorm.ts:117`).

Medido: con la fila bloqueada 9 segundos, el endpoint responde 200 en 36ms, `view_count` se queda
quieto mientras el lock está tomado, y **sube igual cuando el lock se libera** — con el `warn` ya
emitido a los 5 segundos.

Dos consecuencias:

- **El fire-and-forget no pierde la cuenta por contención**, sólo deja de esperarla. Mejor de lo que
  prometía este backlog.
- **Un `warn` no significa que la escritura se perdió.** Significa que se dejó de esperar. Si algún
  día hay que auditar contadores, el log es una señal de lentitud, no de pérdida.

### Los tests, verificados por mutación

Un test que no falla cuando el código se rompe no sirve. Las cuatro mutaciones se aplicaron a
propósito:

| Mutación | Qué falla |
| --- | --- |
| `getSharedReading` vuelve a esperar al contador | 2 tests del orquestador |
| `incrementShareCount` del orquestador deja de tragar el rechazo | 1 test del orquestador |
| El repositorio vuelve al `findOne` extra | 1 test del repositorio |
| El caché vuelve al read-modify-write bloqueante | 3 tests del caché |

El test "devuelve el hit aunque el contador falle" hace fallar los **dos** caminos de escritura
—el query builder y `repository.update`— justamente para que siga siendo load-bearing si alguien
vuelve al `update()` de antes.

### Criterios de aceptación

- [x] Los tres endpoints responden con el contador roto.
- [x] `hit_count` se incrementa de forma atómica.
- [x] `incrementShareCount` no hace queries de más ni tira excepciones por telemetría.
- [x] Los fallos se loguean, no se silencian.
- [x] Las cuatro mutaciones rompen tests.
- [x] `npm run format`, `npm run lint`, `npm run test:cov` (4804 tests, 85,88% statements),
      `npm run build` y `node scripts/validate-architecture.js` en verde.

### Fuera de alcance

Los que **ya están bien** y no hay que tocar: horóscopo (`horoscope.controller.ts:139,199,274`) y
rituales (`rituals.service.ts:115`) ya usan fire-and-forget.

### Nota sobre fire-and-forget y SIGTERM

Vale para las tres y para T-DEPLOY-001: un UPDATE fire-and-forget puede perderse si llega un
SIGTERM entre la respuesta y el commit. Para contadores de vistas y de shares es aceptable —es el
trade-off que se elige a cambio de no tumbar la lectura—. Si algún día alguno de estos números
tiene que ser exacto, no se arregla con `await`: se arregla con un buffer y un flush.

---

## T-DEPLOY-004: Los Rezagados

**Prioridad:** 🟡 Media · **Estimación:** 1 pt · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (01-sep-2026) — y destapó un **bug de producción** que nadie buscaba

Tres cosas que salieron de la revisión de T-DEPLOY-003 y quedaron fuera de su alcance. Ninguna era
urgente; las tres son de la misma familia. La tercera resultó ser otra cosa: ver
*[El e2e no era un fixture faltante](#3-el-e2e-de-share-text-no-era-un-fixture-faltante)*.

### 1. `lastLogin` bloquea el login

`auth/application/use-cases/login.use-case.ts:113-114`

```ts
user.lastLogin = new Date();
await this.usersService.update(user.id, { lastLogin: user.lastLogin });
```

Es **la misma forma de falla** que este backlog viene arreglando, sólo que en un camino de escritura
y no de lectura: un timeout ahí convierte un login con credenciales válidas en un 500. Y no es
telemetría opinable — `lastLogin` es exactamente igual de prescindible que un contador de vistas
frente a la posibilidad de no dejar entrar a alguien.

El precedente correcto está **tres líneas más abajo**, en el mismo método: el `logSecurityEvent` ya
va envuelto en try/catch.

- [x] Sacar el `await` del camino crítico, con log.
- [x] Test de regresión: el login devuelve los tokens aunque el `update` rechace, y el fallo se
      loguea.

Va con `fireAndForget` como todo el resto. Se dejó el `console.error` del `logSecurityEvent` como
estaba: cambiarlo a `this.logger` es una mejora legítima pero hay un test que lo espía, y no es
parte de esta tarea.

### 2. Catches mudos: el patrón quedó a medias

El criterio que fijó T-DEPLOY-001 es "los fallos se loguean, no se silencian" —porque en producción
TypeORM corre con `logging: false` y un `.catch()` vacío no deja rastro—. Quedaron cinco rezagados
con `.catch(() => {})`:

| Archivo | Líneas |
| --- | --- |
| `rituals/application/services/rituals.service.ts` | 115 |
| `horoscope/infrastructure/controllers/horoscope.controller.ts` | 139, 199, 274 |
| `horoscope/infrastructure/controllers/chinese-horoscope.controller.ts` | 186, 389 |

Eran preexistentes y estructuralmente correctos —no bloquean la respuesta—, pero mudos.

- [x] Los seis pasan por `fireAndForget`.
- [x] **Y los que ya logueaban también.** Quedaban cinco copias del mismo `.catch()` con el mismo
      armado de mensaje: enciclopedia, artículos, las dos del orquestador de lecturas y la del
      caché. Todas usan ahora el helper, con los mismos mensajes de antes —así que sus tests siguen
      valiendo—.
- [x] `readings-cache.interceptor.ts` era el único fire-and-forget del repo **sin ningún catch**.
      Hoy es inofensivo porque el store es en memoria y no rechaza; el día que entre Redis sería una
      unhandled rejection, o sea el proceso.

**Alcance de "un solo patrón", dicho con precisión:** el helper cubre la **telemetría de lectura**,
que es de lo que trata este backlog. Quedan siete fire-and-forget artesanales
(`horoscope.controller.ts:77`, `chinese-horoscope.controller.ts:313,444`,
`ip-blocking.service.ts:169,190`, `forgot-password.use-case.ts:41`, `cache-warming.service.ts:87`,
`increment-usage.interceptor.ts:54`) que usan `logger.error` con el stack como segundo argumento —
algo que el helper, con un `warn` de un solo string, no expresa. No son deuda: son otro caso.

### El helper: `common/utils/fire-and-forget.ts`

Diez líneas que concentran lo que este backlog fue aprendiendo:

```ts
fireAndForget(
  this.cardRepository.increment({ id }, 'viewCount', 1),
  this.logger,
  `No se pudo incrementar view_count de la carta ${id}`,
);
```

- **Devuelve `void`**, para que no se pueda esperar por accidente. El tipo es la mitad de la
  garantía; la otra mitad es el `.catch()`.
- **Loguea, no silencia** — la lección de T-DEPLOY-001: en producción TypeORM corre con
  `logging: false`, así que un `.catch()` vacío deja el fallo sin ningún rastro.
- **Aguanta rechazos que no son `Error`** (un string, un `undefined`), que es donde un formateo
  ingenuo volvería a dejar el fallo invisible. Tiene test.

### 3. El e2e de `share-text` no era un fixture faltante

`test/share-text.e2e-spec.ts` tenía **2 tests en rojo cuando se los miraba de noche**, los dos con
404 en `/daily-reading/share-text`. El diagnóstico anotado acá decía que faltaba el fixture. **Era
falso: el fixture existe** —el `beforeAll` inserta los `daily_readings` de los usuarios free y
premium desde siempre—.

Lo que pasaba es más interesante, y es la trampa que el CLAUDE.md de la raíz documenta entera:

| Quién | Cómo resuelve "hoy" |
| --- | --- |
| El fixture del e2e | `new Date().toISOString().split('T')[0]` → **UTC** |
| `daily-reading.service.ts:56` | `getTodayAppDateString()` → **America/Argentina/Buenos_Aires** |

Las dos fechas coinciden 21 horas por día y difieren las otras 3, entre las 21:00 y las 00:00 ART.
O sea que **los tests fallaban sólo de noche**. No estaban rotos: eran flaky por zona horaria, y por
eso "fallaban idénticos en `develop`" cuando se los miró de noche.

- [x] El fixture usa `getTodayAppDateString()`, la misma función que el servicio.

### 🔴 Y al arreglar el test apareció un bug de producción

Con el fixture corregido, los dos tests pasaron **y el tercero —el del usuario anónimo— se puso en
rojo**. Ese venía pasando por casualidad: el fixture usaba UTC y el endpoint **también**, así que
dos errores se cancelaban.

`daily-reading.controller.ts:301`, el único lugar del módulo que no usaba la fecha de la app:

```ts
// ❌ antes
const todayStr = new Date().toISOString().split('T')[0];
dailyReading = await this.dailyReadingService.findOneByFingerprint(fingerprint, todayStr);
```

Pero `generateAnonymousDailyCard` guarda la carta con `getTodayAppDateString()`. **Entre las 21:00 y
las 00:00 ART, un usuario anónimo al que se le acababa de dar su carta del día no podía pedir el
texto para compartirla: 404.** Tres horas por día, todos los días.

- [x] El controller usa `getTodayAppDateString()`.
- [x] Test de regresión con el reloj fijado dentro de la ventana
      (`2026-09-02T01:30Z` = 22:30 ART del día anterior). Fijarlo no es decorativo: sin eso el test
      pasa 21 de cada 24 horas, que es exactamente cómo el bug llegó hasta acá.
- [x] Los 9 tests de `share-text.e2e-spec.ts` pasan **a cualquier hora**. Ojo con decir "pasan
      por primera vez": en `develop` pasaban las 21 horas del día en que los dos calendarios
      coinciden. Lo que cambia —y es más fuerte— es que ahora no dependen de la hora.

**La lección, que es la misma de siempre en este backlog:** un test en rojo que "siempre estuvo en
rojo" no es ruido de fondo. Y un test que pasa puede estar pasando por dos errores que se anulan.

### Nota: `share-text` hace 3 SELECT por request

Preexistente, no lo introdujo T-DEPLOY-003 y no es parte de esta tarea. El `findOne` con relations
del orquestador cuesta 2 queries por el patrón de distinct-id de TypeORM, más un fetch
independiente. Si alguna vez el endpoint importa por volumen, ahí está el margen.

### Criterios de aceptación

- [x] El login devuelve los tokens aunque falle el guardado de `lastLogin`, y el fallo se loguea.
- [x] No queda ningún `.catch(() => {})` mudo en el repo: todos los fire-and-forget pasan por el
      mismo helper.
- [x] `share-text.e2e-spec.ts` pasa completo (9/9).
- [x] `npm run format`, `npm run lint`, `npm run test:cov` (4827 tests, 85,95% statements),
      `npm run build` y `node scripts/validate-architecture.js` en verde.

---

## T-DEPLOY-005: El Resto del Desfasaje UTC vs Zona de la App

**Prioridad:** 🟠 Alta · **Estimación:** 1,5 pts · **Dependencias:** ninguna
**Estado:** ⬜ Pendiente

### De dónde sale

T-DEPLOY-004 arregló **el** desfasaje que un test señaló
(`daily-reading.controller.ts:301`). La revisión preguntó lo obvio —*"¿arreglaste el que el test te
mostró o todos?"*— y barrió el repo. La respuesta es: uno vivo más, uno latente y dos de
agendamiento.

**La ventana es siempre la misma:** entre las **21:00 y las 00:00 ART**, `new Date().toISOString()`
ya está en el día siguiente y `getTodayAppDateString()` todavía no. Tres horas por día, todos los
días. Argentina no tiene horario de verano, así que el desfase es fijo (`date.utils.ts:127` lo
asume explícito).

### 1. 🔴 El widget del número del día muestra el número de mañana

`numerology.controller.ts:246-249` + `common/utils/numerology.utils.ts:247-250`

`GET /numerology/day-number` resuelve "hoy" en UTC **por partida doble**: el campo `date` con
`toISOString()` y el cálculo con `getUTCFullYear/getUTCMonth/getUTCDate`. Reproducido el
01-sep-2026 a las 21:50 ART:

```
fecha app (ART): 2026-09-01   dayNumber ART: 2
fecha UTC      : 2026-09-02   dayNumber UTC: 3   ← lo que devuelve el endpoint
```

Y se muestra: `NumerologyWidget.tsx:17,111` renderiza `dayNumber.dayNumber`.

- [ ] `getTodayAppDateString()` para el campo `date`.
- [ ] Una variante de `calculateDayNumber` que tome el `YYYY-MM-DD` de la app en vez de leer los
      getters UTC de un `Date`. **Es un cambio de semántica del producto**, no sólo un bug: hay que
      decidir explícitamente que el número del día de un usuario argentino cambia a medianoche de
      Argentina. Por eso va en su propia tarea y no se coló en T-DEPLOY-004.
- [ ] Test con el reloj fijado dentro de la ventana, como el de
      `daily-reading.controller.spec.ts`.

### 2. 🟡 La cuota mensual se resetea 3 horas antes, el último día del mes

`usage-limits.service.ts:110-115` abre el mes con `Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)`,
pero `usage.date` se escribe con `getTodayAppDateString()` (línea 137). El último día de cada mes,
en la ventana, `getUTCMonth()` ya es el mes siguiente → el `>= startDate` no matchea nada → la suma
da 0.

**Hoy es latente, no vivo:** los tres planes tienen `birth_chart_monthly_limit = -1` y
`getPendulumLimit` nunca devuelve `period: 'monthly'`. Pero se activa con un `UPDATE plans SET
birth_chart_monthly_limit = 3`, **sin deploy**.

- [ ] `getStartOfMonthAppString()` en `date.utils.ts`, hermano de `getDateDaysAgoAppString`.

### 3. 🟡 Agendamiento

- `availability.service.ts:164` y `typeorm-exception.repository.ts:77` usan
  `Between(today.toISOString().split('T')[0], '2099-12-31')` para las excepciones "futuras", pero
  `exception_date` lo carga la tarotista desde su calendario en ART. En la ventana, **la excepción
  de hoy desaparece del listado**.
- `book-session.use-case.ts:44` hace `new Date(\`${dto.sessionDate}T${dto.sessionTime}\`)` sin
  offset, que se parsea en la zona del servidor — y el contenedor corre con `TZ=UTC`
  (`Dockerfile:59`). El chequeo de "mínimo 2 horas de anticipación" corre 3 horas corrido respecto
  del horario real de la tarotista.

- [ ] Los tres, con la misma receta.

### Lo que se revisó y está bien

No todo `toISOString()` es un bug: lo que importa es que **el que escribe y el que lee usen el mismo
calendario**.

| Columna | Estado |
| --- | --- |
| `reading_date` | ✅ los 9 sitios usan la fecha de la app tras T-DEPLOY-004 |
| `anonymous_usage.date` | ✅ los 3 usan la fecha de la app |
| `usage_limit.date` (diario) | ✅ guard, servicio y capabilities, todos app |
| `horoscope_date` | ✅ UTC en escritura **y** en lectura: autoconsistente, y es el desfase intencional del cron de las 01:00 UTC |
| `sacred-event-notification-cron.service.ts:76` | ✅ el `dateStr` es sólo para el log |
| `daily-reading-cleanup.service.ts:73,88` | ✅ el cutoff cae en el día anterior en los dos calendarios |

### Nota aparte: `login.use-case.ts:46` arrastra un `eslint-disable`

Preexistente, en un archivo que T-DEPLOY-004 tocó. La Regla 0 del `CLAUDE.md` no admite excepciones,
así que vale sacarlo — pero **no alcanza con renombrar a `_password`**: se probó y la config de
ESLint de este repo tampoco lo ignora (`users.service.ts:121` tiene el mismo disable, ya con el
guión bajo). Hace falta poner `ignoreRestSiblings: true` en la regla, que es un cambio de config
del proyecto y se lleva puestos los dos disables de una.
