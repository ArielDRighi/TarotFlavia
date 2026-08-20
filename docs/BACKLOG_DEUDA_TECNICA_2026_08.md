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

**El riesgo no es teórico.** De las 91 sentencias, 8 son `DROP COLUMN` + `ADD COLUMN`, que no
convierten el tipo: **borran la columna y la crean vacía**. Si alguien commitea el output del
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
defaults (`0.7` vs `'0.7'`). Sin impacto funcional, pero son 66 de las 91 sentencias: son el ruido
que esconde a los grupos A y B.

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
desarrollo local: las 9 primeras están en `timestamptz` y las 4 agregadas siguen naive.

```
password_reset_tokens.expires_at   = timestamp with time zone    ✅
refresh_tokens.expires_at          = timestamp with time zone    ✅
cached_interpretations.expires_at  = timestamp with time zone    ✅
user.planExpiresAt                 = timestamp without time zone ❌
user_tarotista_subscriptions.expires_at = timestamp without time zone ❌
```

**Producción probablemente esté bien**: los dos commits entraron en el mismo PR (#618), así que
`develop` y producción solo vieron la versión final de 13 columnas. Pero *probablemente* no alcanza
cuando la columna en cuestión es `planExpiresAt`, que alimenta el cron que degrada premium → free.
Verificarlo es T-DEUDA-003.

**La regla, entonces:** una migración mergeada es inmutable. Lo que falta va en una migración
**nueva**.

---

## Tareas

| ID | Tarea | Tipo | Prioridad | Estimación | Estado |
| --- | --- | --- | --- | --- | --- |
| T-DEUDA-001 | Alinear los decoradores de las entidades con el esquema real | Backend | 🟠 Alta | 2 pts | ⬜ Pendiente |
| T-DEUDA-002 | Crear los índices que las entidades declaran y no existen | Backend | 🟠 Alta | 1 pt | ⬜ Pendiente |
| T-DEUDA-003 | Verificar en producción las 4 columnas de T-PROD-021 | Verificación | 🔴 Crítica | 0,5 pts | ⬜ Pendiente |

**Orden sugerido dentro de este backlog:** 003 primero (es media hora y puede destapar un bug de
fechas en producción), después 002, y 001 al final porque es la más larga y la menos urgente.

> 📌 **El orden completo, cruzado con las tareas de SEO, está en
> [`BACKLOG_SEO_CONTENIDO_2026_08.md` → *Orden de desarrollo*](./BACKLOG_SEO_CONTENIDO_2026_08.md#-orden-de-desarrollo-fuente-única).**
> Ahí vive la fuente única; este backlog no la duplica para que no se desincronicen.
>
> El resumen: **T-DEUDA-003 va primero de todo** —resincroniza la base local, que es contra la que
> corre el seeder de T-SEO-009—, y 002 y 001 van **después** de pedir la tercera revisión de AdSense,
> porque ninguna de las dos bloquea nada de ese camino.

**Puerta de salida del backlog:** `npm run migration:generate -- src/database/migrations/Drift`
genera un archivo **vacío**. Ese es el único criterio que prueba que no quedó drift.

---

## T-DEUDA-001: Alinear los Decoradores de las Entidades con el Esquema Real

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Dependencias:** ninguna

### Problema

Las entidades describen mal la base. El generador de migraciones queda inutilizable: cada vez que
alguien lo corra para un cambio de 1 columna, va a recibir 91 sentencias y va a tener que podarlas a
mano —que es exactamente lo que hubo que hacer en T-SEO-008— con el riesgo de que en alguna poda se
cuele un `DROP COLUMN`.

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

### Problema

Ver la sección *"nunca editar una migración ya aplicada"* arriba. En la base de desarrollo local, 4
columnas que la migración T-PROD-021 dice convertir siguen en `timestamp` sin zona horaria, porque
esa base corrió una versión anterior del archivo.

**Si producción está en el mismo estado**, entonces:

- `user.planExpiresAt` se compara contra `new Date()` en `hasPlanExpired()` y en el cron que degrada
  premium → free. Con la columna naive, esa comparación se corre el offset del timezone del proceso.
- `user_tarotista_subscriptions.expires_at` tiene el mismo problema para las suscripciones a
  tarotistas.

Es el tercer bug de fechas del proyecto si se confirma. Por eso va primero, aunque sea media hora.

### Alcance

- [ ] Correr contra **producción** (solo lectura):

  ```sql
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE (table_name = 'user' AND column_name IN ('planStartedAt', 'planExpiresAt'))
     OR (table_name = 'user_tarotista_subscriptions'
         AND column_name IN ('expires_at', 'can_change_at'));
  ```

- [ ] **Si dan `timestamp with time zone`:** cerrar la tarea. Producción está sana y el problema era
      solo la base local.
- [ ] **Si dan `timestamp without time zone`:** es un bug en producción. Crear una migración
      **nueva** (no editar T-PROD-021) que corra los 4 `ALTER COLUMN ... TYPE TIMESTAMP WITH TIME
      ZONE USING "col" AT TIME ZONE 'UTC'`, con el mismo razonamiento y las mismas advertencias de
      deploy que documenta `1776900000000-AuthTimestampsToTimestamptz.ts`.
- [ ] Resincronizar la base de desarrollo local en cualquiera de los dos casos (correr los 4 `ALTER`
      a mano, o `npm run db:dev:reset` + `migration:run` + seeds).

### Criterios de aceptación

- [ ] Queda escrito en esta tarea el resultado de la consulta contra producción, con fecha.
- [ ] La base local queda con las 13 columnas de T-PROD-021 en `timestamptz`.
- [ ] Si hizo falta migración: corre en dev y queda verificada antes del deploy.

---

## Puerta de Salida

Con las tres tareas cerradas:

```bash
cd backend/tarot-app
npm run migration:generate -- src/database/migrations/Drift
# Debe fallar con "No changes in database schema were found"
```

Mientras ese comando siga devolviendo sentencias, el generador no es confiable y toda migración
nueva hay que podarla a mano.
