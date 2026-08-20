# Backlog Deuda Técnica — Esquema vs Entidades (agosto 2026)

> **Origen:** [T-SEO-008](./BACKLOG_SEO_CONTENIDO_2026_08.md#t-seo-008-modelo-de-contenido-extendido-para-las-fichas-de-tarot).
> Al correr `npm run migration:generate` para agregar siete columnas a una tabla, el generador
> devolvió **91 sentencias**, de las cuales 7 eran las de la tarea.

---

## Por qué existe este backlog

`npm run migration:generate` no inventa SQL: compara **lo que declaran los decoradores de las
entidades** contra **cómo está la base de verdad**, y escribe el SQL necesario para que la base se
parezca a las entidades.

En este repo las migraciones se escribieron **a mano**, con SQL explícito que dice más de lo que
dicen los decoradores (`TIMESTAMPTZ`, `ON DELETE CASCADE`, nombres legibles de FKs e índices). Los
decoradores nunca se actualizaron para reflejarlo. Resultado: el generador ve diferencias que **no
son bugs**, y propone "arreglarlas" al revés — rompiendo la base para que coincida con entidades
incompletas.

**El riesgo no es teórico.** De las 91 sentencias, 8 eran `DROP COLUMN` + `ADD COLUMN` —hoy son 83 y
4, después de T-DEUDA-003— que no convierten el tipo: **borran la columna y la crean vacía**. Si alguien commitea el output del
generador sin leerlo, se lleva puestas las fechas de creación de la enciclopedia entera.

```sql
-- Lo que propone el generador para "corregir" el tipo de created_at:
ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN "created_at";
ALTER TABLE "encyclopedia_tarot_cards" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now();
```

### Inventario medido (19-ago-2026, contra `develop` y la base de desarrollo)

| Categoría | Sentencias | Naturaleza |
| --- | --- | --- |
| `DROP CONSTRAINT` + `ADD CONSTRAINT` (FKs) | 27 + 27 | nombres **y** `ON DELETE` |
| `DROP INDEX` + `CREATE INDEX` (renombres) | 6 + 6 | cosmético |
| `CREATE [UNIQUE] INDEX` (índices que faltan) | 5 | **2 son reales** |
| `DROP COLUMN` + `ADD` (timestamps) | 8 + 8 | ⚠️ destructivo |
| `ALTER COLUMN` / renombre de enum | 3 + 3 | cosmético |
| **Total en `up()`** | **91** | |

> ⚠️ Las filas de arriba son la clasificación original y **no suman 91 sino 93**: la fila de
> renombres de índices está sobrecontada en 2 (son 6 `DROP` + 4 `CREATE`, no 6 + 6). El total de 91 sí
> era el medido. Abajo va el desglose exacto, ya reconciliado.

#### Inventario exacto tras T-DEUDA-003 (19-ago-2026, verificado sentencia por sentencia)

Al resincronizar la base local desaparecieron 8 sentencias y el total quedó en **83**. Este desglose
**suma exacto**:

| Categoría | Sentencias | Naturaleza |
| --- | --- | --- |
| `DROP CONSTRAINT` + `ADD CONSTRAINT` (FKs) | 27 + 27 = 54 | nombres **y** `ON DELETE` — cosmético |
| `DROP INDEX` + `CREATE INDEX` con hash (renombres) | 6 + 4 = 10 | cosmético · ⚠️ 2 se dropean y **no** se recrean |
| `CREATE [UNIQUE] INDEX` (índices que faltan) | 5 | **2 reales** (`sessions`) + 3 `*_slug` redundantes → T-DEUDA-002 |
| `DROP COLUMN` + `ADD` (timestamps de enciclopedia) | 4 + 4 = 8 | ⚠️ destructivo → T-DEUDA-001 |
| `ALTER COLUMN ... SET DEFAULT` (`temperature`, `top_p`) | 2 | cosmético |
| Renombre del enum de `session_type` | 4 | `CREATE TYPE` + `ALTER` + `RENAME` + `DROP TYPE` |
| **Total en `up()`** | **83** | |

Las 8 que se fueron eran los `DROP COLUMN` + `ADD` de las 4 columnas de T-PROD-021. **No eran ruido:
eran drift real**, y el generador las resolvía de la forma destructiva. Ver
*[Efecto colateral medido](#efecto-colateral-medido-el-generador-ya-no-propone-borrar-las-fechas-de-plan)*.

Dos cosas que este desglose deja a la vista y **no** estaban inventariadas:

- Los `CREATE [UNIQUE] INDEX` siguen siendo **5, con 2 reales**, tal como dice T-DEUDA-002: son
  `idx_session_completed_at_status` e `idx_session_tarotista_completed` (más los 3 `*_slug`
  redundantes). El inventario de esa tarea queda confirmado.
- Hay **6 `DROP INDEX` y sólo 4 `CREATE INDEX`**: el generador propone borrar 2 índices que existen en
  la base y **ninguna entidad declara**. Eso es pérdida de índices, no un renombre. Entra en el
  alcance de T-DEUDA-001 (decidir nombres de índices) — anotado, no resuelto acá.

### El drift va en las dos direcciones

No alcanza con "arreglar las entidades" ni con "correr lo que dice el generador". Hay tres grupos
distintos y cada uno se resuelve distinto:

**Grupo A — la entidad está incompleta, la base está bien.** `encyclopedia_tarot_cards` y
`encyclopedia_articles` tienen `created_at`/`updated_at` en `timestamptz` (lo puso la migración
original), pero la entidad declara `@CreateDateColumn({ name: 'created_at' })` **sin `type`**, y el
default de TypeORM es `timestamp` sin zona. Se arregla en el código, sin tocar la base.

**Grupo B — falta trabajo real en la base.** Cinco índices están declarados **solo** en decoradores
de entidad y ninguna migración los crea. Con `synchronize: false` eso significa que **no existen en
ninguna base**: ni dev, ni staging, ni producción.

**Grupo C — cosmético.** Nombres de FKs e índices (legibles en la base vs. hash de TypeORM) y
defaults (`0.7` vs `'0.7'`). Sin impacto funcional, pero son **66 de las 83** sentencias —54 de FKs,
10 de renombres de índices y 2 de defaults—: son el ruido que esconde a los grupos A y B.

---

## ⚠️ La regla que hay que grabar: nunca editar una migración ya aplicada

Buscando el origen del drift apareció un caso concreto que conviene dejar escrito, porque el
mecanismo se va a repetir.

La migración `AuthTimestampsToTimestamptz1776900000000` (T-PROD-021) nació con **9 columnas** en el
commit `00ea46b3`. Después, aplicando feedback del PR, el commit `e07a9363` le **agregó 4 columnas
más** (`user.planStartedAt`, `user.planExpiresAt`, `user_tarotista_subscriptions.expires_at`,
`can_change_at`) editando el archivo ya existente.

TypeORM **nunca re-ejecuta una migración ya registrada**. Cualquier base que haya corrido la primera
versión se quedó sin esas 4 columnas para siempre. Es exactamente lo que pasó en la base de
desarrollo local: las 9 primeras quedaron en `timestamptz` y las 4 agregadas siguieron naive hasta que
T-DEUDA-003 las convirtió a mano el 19-ago-2026.

```
# Base de desarrollo local — ANTES de T-DEUDA-003 (19-ago-2026).
# Muestra de 5 de las 13 columnas; faltan planStartedAt y can_change_at, también naive.
password_reset_tokens.expires_at   = timestamp with time zone    ✅
refresh_tokens.expires_at          = timestamp with time zone    ✅
cached_interpretations.expires_at  = timestamp with time zone    ✅
user.planExpiresAt                 = timestamp without time zone ❌
user_tarotista_subscriptions.expires_at = timestamp without time zone ❌
```

**Producción está sana** — verificado el 19-ago-2026, no inferido: las 13 columnas están en
`timestamptz`, las 4 agregadas incluidas. Los dos commits entraron juntos en el merge del PR #618, así
que `develop` y `main` nunca vieron la versión de 9 columnas: los 22 minutos que existió fueron
enteros dentro de la rama de feature. La única base que corrió esa versión es la local, donde se
trabajó el PR. El detalle de la consulta está en [T-DEUDA-003](#t-deuda-003-verificar-en-producción-las-4-columnas-de-t-prod-021).

**La regla, entonces:** una migración mergeada es inmutable. Lo que falta va en una migración
**nueva**.

---

## Tareas

| ID | Tarea | Tipo | Prioridad | Estimación | Estado |
| --- | --- | --- | --- | --- | --- |
| T-DEUDA-001 | Alinear los decoradores de las entidades con el esquema real | Backend | 🟠 Alta | 2 pts | ⬜ Pendiente |
| T-DEUDA-002 | Crear los índices que las entidades declaran y no existen | Backend | 🟠 Alta | 1 pt | ⬜ Pendiente |
| T-DEUDA-003 | Verificar en producción las 4 columnas de T-PROD-021 | Verificación | 🔴 Crítica | 0,5 pts | ✅ Completada (19-ago-2026) |

**Orden dentro de este backlog:** 003 **ya está cerrada** —fue primero justamente porque podía
destapar un bug de fechas en producción, y resultó que no había ninguno: no dejó trabajo de migración
para las otras dos—. Queda 002, y 001 al final porque es la más larga y la menos urgente.

> 📌 **El orden completo, cruzado con las tareas de SEO, está en
> [`BACKLOG_SEO_CONTENIDO_2026_08.md` → *Orden de desarrollo*](./BACKLOG_SEO_CONTENIDO_2026_08.md#-orden-de-desarrollo-fuente-única).**
> Ahí vive la fuente única; este backlog no la duplica para que no se desincronicen.
>
> El resumen: **T-DEUDA-003 fue primero de todo** —resincronizó la base local, que es contra la que
> corre el seeder de T-SEO-009, así que T-SEO-009 arranca desbloqueada—, y 002 y 001 van **después**
> de pedir la tercera revisión de AdSense, porque ninguna de las dos bloquea nada de ese camino.

**Puerta de salida del backlog:** `npm run migration:generate -- src/database/migrations/Drift`
genera un archivo **vacío**. Ese es el único criterio que prueba que no quedó drift.
**Marcador al 19-ago-2026, tras T-DEUDA-003: 83 sentencias.** Conviene generar el archivo **fuera del
repo** (`-- /tmp/DriftProbe`) mientras sea una medición y no una migración de verdad.

---

## T-DEUDA-001: Alinear los Decoradores de las Entidades con el Esquema Real

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna

### Problema

Las entidades describen mal la base. El generador de migraciones queda inutilizable: cada vez que
alguien lo corra para un cambio de 1 columna, va a recibir **83 sentencias** (eran 91 antes de
T-DEUDA-003) y va a tener que podarlas a mano —que es exactamente lo que hubo que hacer en
T-SEO-008— con el riesgo de que en alguna poda se cuele un `DROP COLUMN`.

### Alcance

Es **solo código**: no se toca la base. Cada cambio hace que el decorador diga lo que la base ya
hace.

- [ ] **Timestamps de la enciclopedia.** `encyclopedia-tarot-card.entity.ts` y
      `encyclopedia-article.entity.ts`: declarar el tipo en `@CreateDateColumn`/`@UpdateDateColumn`.

  ```ts
  // ❌ hoy — TypeORM asume `timestamp` sin zona; la base tiene timestamptz
  @CreateDateColumn({ name: 'created_at' })

  // ✅
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  ```

- [ ] **`ON DELETE` de las relaciones.** La base tiene `CASCADE` en las FKs (verificado en
      `pg_constraint`); las entidades no lo declaran, así que el generador propone `NO ACTION`.
      Declarar `onDelete: 'CASCADE'` (o el que corresponda) en cada `@ManyToOne`/`@OneToOne`.
      ⚠️ **Verificar cada FK contra la base antes de escribirla**, una por una. No asumir CASCADE
      para todas: hay al menos una con `SET NULL`.

- [ ] **Nombres de FKs e índices.** Decidir explícitamente y dejarlo escrito: o se le pone a las
      entidades el nombre legible que ya tiene la base, o se acepta el hash de TypeORM. Lo que no
      puede quedar es la mitad y la mitad.

- [ ] **Defaults numéricos** de `tarotista_config` (`temperature`, `top_p`): `0.7` vs `'0.7'`.

- [ ] **Renombre del enum** `sessions_session_type_enum` → `holistic_services_session_type_enum`:
      decidir si se renombra en la base (migración) o se fija `enumName` en la entidad (código).
      Preferir lo segundo: renombrar un tipo en producción no aporta nada.

### Criterios de aceptación

- [ ] `npm run migration:generate` genera un archivo **vacío** (junto con T-DEUDA-002).
- [ ] No se agregó ninguna migración: la tarea es solo de decoradores.
- [ ] `npm run test:cov`, `npm run build` y `node scripts/validate-architecture.js` en verde.
- [ ] La app arranca contra la base existente y los endpoints de enciclopedia, planes y suscripciones
      siguen respondiendo (los cambios de tipo en decoradores afectan la hidratación de entidades).

### Fuera de alcance

Cambiar el esquema. Si aparece un caso donde la base está mal y la entidad bien, se anota y se
resuelve en una migración aparte — no acá.

---

## T-DEUDA-002: Crear los Índices que las Entidades Declaran y No Existen

**Prioridad:** 🟠 Alta · **Estimación:** 1 pt · **Dependencias:** ninguna

### Problema

Cinco índices están declarados en decoradores `@Index(...)` y **ninguna migración los crea**. Con
`synchronize: false` (correcto), un `@Index` en una entidad no crea nada: es documentación que no se
ejecuta. Verificado con `grep` sobre `src/database/migrations/`: cero resultados para los cinco.

| Índice | Entidad | ¿Existe en la base? | ¿Importa? |
| --- | --- | --- | --- |
| `idx_session_tarotista_completed` | `session.entity.ts:27` | ❌ | **Sí** — índice compuesto de performance |
| `idx_session_completed_at_status` | `session.entity.ts:26` | ❌ | **Sí** — ídem |
| `idx_enc_card_slug` | `encyclopedia-tarot-card.entity.ts:56` | ❌ | Probablemente no |
| `idx_article_slug` | `encyclopedia-article.entity.ts:39` | ❌ | Probablemente no |
| `idx_ritual_slug` | `ritual.entity.ts:20` | ❌ | Probablemente no |

Los tres `*_slug` son `UNIQUE` sobre columnas que **ya tienen un constraint `UNIQUE`**, y ese
constraint crea su propio índice con otro nombre (en cartas es
`encyclopedia_tarot_cards_slug_key`, verificado en `pg_indexes`). O sea: el índice existe, le sobra
el nombre. Los dos de `sessions`, en cambio, no tienen nada que los cubra.

### Alcance

- [ ] Verificar **columna por columna** cuáles de los 5 están realmente cubiertos por el índice del
      `UNIQUE` de la columna (`pg_indexes` sobre cada tabla).
- [ ] Los que estén cubiertos: **borrar el `@Index` redundante** de la entidad, no crear el índice.
      Un índice unique duplicado es escritura extra en cada `INSERT` sin ningún beneficio de lectura.
- [ ] Los que no estén cubiertos (`sessions` × 2): migración nueva que los cree con
      `CREATE INDEX IF NOT EXISTS`.
- [ ] Medir si los índices de `sessions` cambian algo: son para las queries de métricas de
      tarotistas. Dejar anotado el `EXPLAIN` antes y después.

### Criterios de aceptación

- [ ] `pg_indexes` y los decoradores `@Index` coinciden en las 5 tablas.
- [ ] El generador deja de proponer `CREATE INDEX` (junto con T-DEUDA-001, archivo vacío).
- [ ] La migración corre sobre una base con datos sin bloqueos largos (`CREATE INDEX` toma
      `SHARE` sobre la tabla; evaluar `CONCURRENTLY` si `sessions` está grande en producción).

---

## T-DEUDA-003: Verificar en Producción las 4 Columnas de T-PROD-021

**Prioridad:** 🔴 Crítica · **Estimación:** 0,5 pts · **Dependencias:** ninguna
**Estado:** ✅ COMPLETADA (19-ago-2026) — producción sana, **no hizo falta migración**

### Problema

Ver la sección *"nunca editar una migración ya aplicada"* arriba. En la base de desarrollo local, 4
columnas que la migración T-PROD-021 dice convertir seguían en `timestamp` sin zona horaria, porque
esa base corrió una versión anterior del archivo.

**Si producción estuviera en el mismo estado**, entonces:

- `user.planExpiresAt` se compara contra `new Date()` en `hasPlanExpired()` y en el cron que degrada
  premium → free. Con la columna naive, esa comparación se corre el offset del timezone del proceso.
- `user_tarotista_subscriptions.expires_at` tiene el mismo problema para las suscripciones a
  tarotistas.

Habría sido el tercer bug de fechas del proyecto. Por eso fue primero, aunque sea media hora.

### Alcance

- [x] Correr contra **producción** (solo lectura):

  ```sql
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE (table_name = 'user' AND column_name IN ('planStartedAt', 'planExpiresAt'))
     OR (table_name = 'user_tarotista_subscriptions'
         AND column_name IN ('expires_at', 'can_change_at'));
  ```

- [x] **Dieron `timestamp with time zone`** → tarea cerrada. Producción está sana y el problema era
      solo la base local.
- [x] ~~Si dan `timestamp without time zone`: crear una migración nueva~~ — **no aplicó.** No se
      agregó ninguna migración.
- [x] Resincronizar la base de desarrollo local (se corrieron los 4 `ALTER` a mano, sin
      `db:dev:reset`, para no perder los datos de desarrollo).

### Resultado de la verificación

**Fecha:** 19-ago-2026 · **Consulta:** solo lectura sobre `information_schema.columns`, sin ningún DDL.

**Qué base se consultó, y cómo se estableció que es la de producción.** El proyecto de Railway se
llama `Auguria Staging` por historia (nació del [ADR de staging](./ADR_STAGING_DEPLOYMENT.md), que
anticipaba "crear un nuevo environment cuando estén listos para producción"), así que el nombre del
proyecto **no** alcanza como evidencia. Lo que se usó es el listado de recursos del environment
`production` de ese proyecto:

```
$ railway status        # proyecto Auguria Staging · environment production
Services
  - backend:  ● Online · https://api.auguriatarot.com
  - frontend: ● Online · https://auguriatarot.com
Databases
  - Postgres: ● Online · postgres-volume
```

Ese environment contiene el backend que sirve el dominio productivo `api.auguriatarot.com` y **una
sola** base Postgres, que es la que se consultó (`railway run --service Postgres --environment
production`). Además, esa base tiene registrada la migración `1776900000000` en su tabla `migrations`,
o sea que es una base que corrió el historial del proyecto.

> ⚠️ Lo que **no** se verificó por falta de permisos de lectura de secretos: que el `DATABASE_URL` del
> servicio `backend` apunte literalmente a ese `Postgres`. Se infiere de que es el único del
> environment. Si alguna vez hay dos bases en el mismo environment, esta inferencia deja de valer.

**Las 13 columnas de T-PROD-021 están en `timestamptz` en producción**, incluidas las 4 que se
agregaron por feedback del PR:

| Columna | Producción (19-ago) | Dev local (antes) | Dev local (después) |
| --- | --- | --- | --- |
| `user.planStartedAt` | ✅ `timestamptz` | ❌ `timestamp without time zone` | ✅ `timestamptz` |
| `user.planExpiresAt` | ✅ `timestamptz` | ❌ `timestamp without time zone` | ✅ `timestamptz` |
| `user_tarotista_subscriptions.expires_at` | ✅ `timestamptz` | ❌ `timestamp without time zone` | ✅ `timestamptz` |
| `user_tarotista_subscriptions.can_change_at` | ✅ `timestamptz` | ❌ `timestamp without time zone` | ✅ `timestamptz` |

Consulta de control sobre la base local después de los `ALTER`: las 13 columnas en
`timestamp with time zone`, y el `count(*)` de columnas `timestamp without time zone` entre esas 13
devuelve **0**.

Las otras 9 (`password_reset_tokens` ×3, `refresh_tokens` ×3, `cached_interpretations` ×3) ya estaban
en `timestamptz` en las dos bases. En ambas, `migrations` tiene registrada
`AuthTimestampsToTimestamptz1776900000000`, así que TypeORM no la va a re-ejecutar en ninguna: por eso
la local necesitaba los `ALTER` a mano.

**Conclusión: no hay bug de fechas en producción.** `planExpiresAt` y el cron que degrada premium →
free están sanos. El único entorno afectado era el de desarrollo local.

### Por qué producción se salvó (verificado en git, no inferido)

Los dos commits entraron **juntos** en el merge del PR #618:

```
$ git log --oneline 5aff21cf^1..5aff21cf^2
e07a9363 fix: apply PR feedback - suma las 4 columnas que faltaban ...
00ea46b3 fix(auth): las expiraciones pasan a timestamptz ... (T-PROD-021)
```

`5aff21cf` es el merge del PR #618 (8-ago-2026) y es el **primer** commit de `develop` que contiene a
cualquiera de los dos. Los 22 minutos en que la migración existió con 9 columnas (00:22 → 00:44 del
31-jul-2026) transcurrieron enteros dentro de la rama `feature/T-PROD-021-timestamptz-auth`. Ninguna
base que deployee desde `develop` o desde `main` vio esa versión.

Esto no invalida la regla: **la salvó la casualidad de que el feedback llegó antes del merge.** Si el
PR se hubiera mergeado entre los dos commits —el caso normal, no el excepcional— producción habría
quedado con las 4 columnas naive y el bug habría sido real. La regla sigue siendo la de arriba: a una
migración mergeada no se la edita.

### Efecto colateral medido: el generador ya no propone borrar las fechas de plan

Resincronizar la base local no fue sólo higiene. Las dos mediciones son del mismo día (19-ago-2026),
con `npm run migration:generate` apuntando a un archivo fuera del repo:

| | Sentencias en `up()` | `DROP COLUMN` |
| --- | --- | --- |
| Antes del arreglo (base desincronizada) | 91 | 8 |
| Después del arreglo | **83** | **4** |

Las 4 que se fueron eran `user.planExpiresAt`, `user.planStartedAt`,
`user_tarotista_subscriptions.expires_at` y `can_change_at` (identificadas **por diferencia** contra el
output posterior, no capturadas del output previo — ver la nota al pie de esta sección). Las 4 entidades **ya declaraban**
`@Column({ type: 'timestamptz' })` —verificado en `user.entity.ts:127,135` y
`user-tarotista-subscription.entity.ts:97,112`—, así que el generador veía una diferencia **legítima**
contra la base local naive.

Cómo la resolvía es el punto. Los 4 `DROP COLUMN` que **siguen** en el output son los timestamps de la
enciclopedia, y ahí se ve el patrón textual con el que TypeORM trata un cambio de tipo de timestamp:

```sql
-- Sigue en el output posterior al arreglo, para encyclopedia_tarot_cards:
ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN "created_at";
ALTER TABLE "encyclopedia_tarot_cards" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now();
```

Las 4 columnas de plan caían en ese mismo grupo del inventario (`DROP COLUMN` + `ADD`, 8 + 8 antes
del arreglo; después quedan 4 + 4, y los 4 que quedan son los de la enciclopedia). O sea: **la base local
estaba a un `migration:generate` mal podado de una migración que le borraba a todos los usuarios
premium la fecha de vencimiento del plan.** Es el mismo mecanismo que la Regla A del workflow, pero
sobre una columna de facturación en vez de una de auditoría.

> ⚠️ El bloque SQL de arriba es el **observado después del arreglo** para la enciclopedia. La forma exacta
> que tomaban las 4 sentencias de plan no quedó capturada antes del arreglo: se deduce de la
> aritmética del inventario (8 → 4 `DROP COLUMN`, y los 4 restantes identificados por nombre). Si
> hace falta la prueba textual, se reproduce volviendo las 4 columnas a naive en una base de
> descarte.

Los 4 `DROP COLUMN` que quedan son los `created_at`/`updated_at` de `encyclopedia_tarot_cards` y
`encyclopedia_articles` — el Grupo A, que **T-DEUDA-001 resuelve en el código** (poniéndole `type` al
decorador), no en la base.

### Criterios de aceptación

- [x] Queda escrito en esta tarea el resultado de la consulta contra producción, con fecha.
- [x] La base local queda con las 13 columnas de T-PROD-021 en `timestamptz`.
- [x] Si hizo falta migración: corre en dev y queda verificada antes del deploy. → **No hizo falta.**

---

## Puerta de Salida

Con las tres tareas cerradas:

```bash
cd backend/tarot-app
# Ojo: mientras esto sea una MEDICIÓN y no una migración de verdad, generar fuera del repo
# para no dejar un archivo de 83 sentencias suelto en src/database/migrations/.
npm run migration:generate -- /tmp/DriftProbe
# Debe fallar con "No changes in database schema were found"
```

Mientras ese comando siga devolviendo sentencias, el generador no es confiable y toda migración
nueva hay que podarla a mano.
