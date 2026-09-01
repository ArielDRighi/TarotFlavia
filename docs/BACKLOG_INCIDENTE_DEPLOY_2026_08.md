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

### La secuencia, con relojes (UTC)

| Hora | Qué |
| --- | --- |
| 23:59:37 | push a `main` → Railway arranca **los dos servicios a la vez** (backend y frontend) |
| 00:11:35 | el frontend llega al export estático: **31 workers**, 219 páginas |
| 00:11:36 | 54/219 páginas listas — las fichas venían respondiendo bien |
| 00:11:44 | el backend viejo empieza a tirar `Query read timeout` a los 5.005ms |
| 00:11:41 | tres páginas fallan con 500 y Next aborta el build |
| ~00:11:47 | `Stopping Container` del backend viejo |
| 00:12:35 | el backend nuevo levanta, sano |

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

El log del backend viejo lo dice entero:

```
[ERRO] Query read timeout  duration="5005ms"  url="/api/v1/encyclopedia/cards/the-magician"
query="UPDATE encyclopedia_tarot_cards SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1"
   at EncyclopediaService.incrementViewCount (encyclopedia.service.js:144)
   at EncyclopediaService.findBySlug (encyclopedia.service.js:90)
```

Los 5.005ms no son casualidad: `src/config/typeorm.ts:119` fija
`query_timeout: DB_MAX_QUERY_TIME || 5000`.

### Por qué justo en el deploy

El export estático pide las **78 fichas con 31 workers en paralelo**. Con el `await`, eso eran 78
`UPDATE` concurrentes contra un pool de 25 conexiones. En un día normal aguanta; ese día el
contenedor del backend se estaba apagando por su propio deploy —los dos servicios salen del mismo
push, a la misma hora— así que las conexiones se drenaban mientras 31 escritores se apilaban. Se
saturó, timeout, 500, build abortado.

**El deploy simultáneo no es la causa, es el disparador.** La causa es que un contador de vistas
—telemetría pura— pudiera tumbar la lectura de la ficha.

### El detalle que más molesta

`ArticlesService` **ya tenía el arreglo**, con docblock y todo, desde que se escribió:

```ts
// articles.service.ts — el patrón correcto, que las fichas nunca recibieron
private incrementViewCount(id: number): void {
  this.articleRepository.increment({ id }, 'viewCount', 1).catch(() => {
    /* silencioso — no bloquea la respuesta al usuario */
  });
}
```

Dos servicios hermanos en el mismo módulo, el mismo contador, y sólo uno era fire-and-forget.

---

## Tareas

| ID | Tarea | Tipo | Prioridad | Estimación | Estado |
| --- | --- | --- | --- | --- | --- |
| T-DEPLOY-001 | Hacer fire-and-forget el contador de vistas de las fichas | Backend | 🔴 Crítica | 0,5 pts | ✅ Completada (31-ago-2026) |
| T-DEPLOY-002 | Que el export estático no escriba en la base | Backend/Frontend | 🟡 Media | 1 pt | ⬜ Pendiente |

---

## T-DEPLOY-001: Hacer Fire-and-Forget el Contador de Vistas de las Fichas

**Prioridad:** 🔴 Crítica · **Estimación:** 0,5 pts · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (31-ago-2026)

### Alcance

- [x] `findBySlug` deja de esperar al contador.
- [x] `incrementViewCount` pasa a `repository.increment(...)` con `.catch()`, idéntico al de
      artículos. Sigue siendo un `UPDATE` atómico (`view_count = view_count + 1`), no un
      read-modify-write: no se pierden vistas por concurrencia.
- [x] Tests de regresión.

```ts
// ✅ después
private incrementViewCount(id: number): void {
  this.cardRepository.increment({ id }, 'viewCount', 1).catch(() => {
    /* silencioso — no bloquea la respuesta al usuario */
  });
}
```

### Sobre silenciar el error

El `.catch()` vacío se copió de artículos a propósito, para que los dos servicios digan lo mismo.
No deja el fallo invisible: el logger de TypeORM sigue registrando el `Query read timeout`, que es
justamente como se diagnosticó este incidente. Lo que cambia es que ya no llega al usuario.

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

Y el contador sigue funcionando cuando la base responde: `view_count` 5 → 8 tras tres requests,
con el mismo SQL atómico de siempre.

### Criterios de aceptación

- [x] Un fallo del contador no afecta la respuesta del endpoint (verificado con el lock de arriba).
- [x] No queda ninguna promesa rechazada sin manejar (test explícito con `unhandledRejection`).
- [x] El contador sigue incrementando cuando la base está sana.
- [x] `npm run format`, `npm run lint`, `npm run test:cov` (4795 tests, 85,84% statements),
      `npm run build` y `node scripts/validate-architecture.js` en verde.

### Los tests

`encyclopedia.service.spec.ts` → `describe('incrementViewCount (integrado en findBySlug)')`:

1. Llama a `increment({ id }, 'viewCount', 1)` al pedir el detalle.
2. **La regresión del incidente:** con `increment` rechazando, `findBySlug` resuelve igual.
3. No deja una promesa rechazada sin manejar — un `.catch()` olvidado tumbaría el proceso con
   `--unhandled-rejections=throw`, que es el default de Node 20.
4. No incrementa si el slug no existe (el `NotFoundException` sigue primero).

---

## T-DEPLOY-002: Que el Export Estático No Escriba en la Base

**Prioridad:** 🟡 Media · **Estimación:** 1 pt · **Dependencias:** T-DEPLOY-001
**Estado:** ⬜ Pendiente

### Problema

T-DEPLOY-001 saca el fallo del camino crítico, pero el build **sigue escribiendo**: cada deploy
del frontend suma **78 vistas falsas** a `view_count` y dispara 78 `UPDATE` concurrentes contra el
pool mientras el backend puede estar redeployando.

Dos consecuencias, ninguna catastrófica ya:

- **El dato está contaminado.** `view_count` mezcla visitas reales con builds. Si algún día se usa
  para ordenar fichas "más vistas", ordena por cantidad de deploys.
- **Ruido en cada deploy.** Los `Query read timeout` van a seguir apareciendo en los logs de
  producción cada vez que se deploye, ahora sin romper nada pero ensuciando el diagnóstico del
  próximo incidente.

### Alcance propuesto

- [ ] Que el prerender no cuente como vista. Lo más limpio es un header o query param que el build
      mande y el servicio respete (`?prerender=1`, o un `User-Agent` propio del build), o que el
      export pegue a un endpoint de lectura pura.
- [ ] Evaluar bajar la concurrencia del export estático del frontend, hoy 31 workers.
- [ ] Considerar que el backend termine de deployar antes de que el frontend haga el export. Hoy
      los dos servicios salen del mismo push y compiten.

### Fuera de alcance

Rediseñar el conteo de vistas (buffer en memoria, batch, Redis). Si `view_count` llega a importar
de verdad, es su propia tarea.
