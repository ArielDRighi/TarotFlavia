# Backlog — Incidente de deploy del 31-ago-2026 (el contador de vistas tiró el build)

> **Estado:** ✅ Cerrado — T-DEPLOY-001 completada.
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
| T-DEPLOY-002 | Que el export estático no escriba en la base | Backend/Frontend | 🟡 Media | 1 pt | ⬜ Pendiente |
| T-DEPLOY-003 | Sacar las escrituras de telemetría de los otros tres caminos de lectura | Backend | 🟠 Alta | 1 pt | ⬜ Pendiente |

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
**Estado:** ⬜ Pendiente

### Problema

T-DEPLOY-001 saca el fallo del camino crítico, pero el build **sigue escribiendo**.

Y no son sólo las fichas: las rutas de artículos también se prerenderizan
(`enciclopedia/elementos/[slug]`, `guias/[slug]`, `astrologia/{signos,planetas,casas}/[slug]`) y
también incrementan, vía `ArticlesService.findBySlug`. Con **78 fichas + 48 artículos**, cada
deploy del frontend suma **~126 vistas falsas** y dispara otros tantos `UPDATE` contra el pool
mientras el backend puede estar redeployando.

Dos consecuencias, ninguna catastrófica ya:

- **El dato está contaminado.** `view_count` mezcla visitas reales con builds. Si algún día se usa
  para ordenar fichas "más vistas", ordena por cantidad de deploys.
- **Ruido en cada deploy.** Los `Query read timeout` van a seguir apareciendo en los logs de
  producción cada vez que se deploye, ahora sin romper nada pero ensuciando el diagnóstico del
  próximo incidente.

### Alcance propuesto

- [ ] Que el prerender no cuente como vista, **en fichas y en artículos**. Lo más limpio es un
      header o query param que el build mande y los dos servicios respeten (`?prerender=1`, o un
      `User-Agent` propio del build), o que el export pegue a un endpoint de lectura pura.
- [ ] Evaluar bajar la concurrencia del export estático del frontend, hoy 31 workers.
- [ ] Considerar que el backend termine de deployar antes de que el frontend haga el export. Hoy
      los dos servicios salen del mismo push y compiten.

### Fuera de alcance

Rediseñar el conteo de vistas (buffer en memoria, batch, Redis). Si `view_count` llega a importar
de verdad, es su propia tarea.

---

## T-DEPLOY-003: Sacar las Escrituras de Telemetría de los Otros Tres Caminos de Lectura

**Prioridad:** 🟠 Alta · **Estimación:** 1 pt · **Dependencias:** ninguna
**Estado:** ⬜ Pendiente

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

- [ ] `getSharedReading`: fire-and-forget con log, igual que T-DEPLOY-001.
- [ ] `incrementShareCount`: pasar a `Promise<void>`, borrar el `findOne` y el `throw`, y sacarlo
      del `await` en el controller. Actualizar la interfaz y el orquestador.
- [ ] `getFromCache`: `increment()` atómico para `hit_count` y fuera del camino crítico.
- [ ] Tests de regresión en los tres, con la mutación verificada (que fallen si se revierte).

### Fuera de alcance

Los que **ya están bien** y no hay que tocar: horóscopo (`horoscope.controller.ts:139,199,274`) y
rituales (`rituals.service.ts:115`) ya usan fire-and-forget.

### Nota sobre fire-and-forget y SIGTERM

Vale para las tres y para T-DEPLOY-001: un UPDATE fire-and-forget puede perderse si llega un
SIGTERM entre la respuesta y el commit. Para contadores de vistas y de shares es aceptable —es el
trade-off que se elige a cambio de no tumbar la lectura—. Si algún día alguno de estos números
tiene que ser exacto, no se arregla con `await`: se arregla con un buffer y un flush.
