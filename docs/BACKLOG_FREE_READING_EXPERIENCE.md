# MÓDULO: EXPERIENCIA DE LECTURA PARA USUARIOS FREE - BACKLOG DE DESARROLLO

## PARTE A: HISTORIAS DE USUARIO

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Módulo:** Mejora de la experiencia de lectura para usuarios Free
**Versión:** 1.0
**Fecha:** 12 de abril de 2026
**Preparado por:** Ariel (Product Owner) + Claude
**ADR base:** `docs/ADR_FREE_READING_EXPERIENCE.md`

---

## CONTEXTO

Actualmente los usuarios FREE reciben como resultado de sus lecturas de tarot los campos `meaningUpright` / `meaningReversed` crudos desde la entidad `TarotCard`. Estos textos son **técnicos y están diseñados para alimentar el motor de interpretación personalizada de PREMIUM**, no para ser leídos por el usuario final. Como consecuencia, la experiencia free es pobre y no entrega valor emocional/orientativo.

La mejora alinea el flujo FREE con una **versión recortada del flujo PREMIUM**, usando interpretaciones pre-escritas que respetan la arquitectura existente y permiten una estrategia de upgrade más clara.

**Características clave de la solución:**

- FREE accede al **mismo selector de categorías** que PREMIUM pero recortado a 3 categorías: **Amor y Relaciones**, **Salud y Bienestar**, **Dinero y Finanzas** (con sus mismos nombres, slugs e íconos que en PREMIUM)
- FREE **salta el paso de preguntas** (va directo de categoría a tirada)
- FREE **solo puede usar los 22 Arcanos Mayores** (no el mazo de 78 cartas)
- FREE **ya tiene acceso solo a tiradas de 1 y 3 cartas** (restricción existente vía `requiredPlan` en `TarotSpread`)
- Se crea una **tabla nueva** `card_free_interpretation` con 132 textos (22 cartas × 3 categorías × 2 orientaciones) para lecturas convencionales
- Se agregan **2 campos nuevos** `dailyFreeUpright` y `dailyFreeReversed` en `TarotCard` con 44 textos para carta del día (tono de "energía diaria" que menciona brevemente los 3 temas)
- **Total de textos a generar: 176** (batch offline + revisión humana)
- **URLs correctas: `/tarot/**`** (las actuales `/ritual/**` se renombran como prerequisito)

---

## DECISIONES DE ARQUITECTURA

| Decisión | Elección | Razón |
|----------|----------|-------|
| Dónde guardar las interpretaciones de tirada | **Tabla nueva `card_free_interpretation`** | Tiene dimensión adicional (categoría) — 132 registros |
| Dónde guardar las interpretaciones de carta del día | **Campos nuevos en `TarotCard`** (`dailyFreeUpright/Reversed`) | Solo 44 registros, relación 1:1 con la carta |
| Restricción de mazo para FREE | **Solo 22 Arcanos Mayores** | Práctica estándar del mercado (Los Arcanos, etc.), reduce esfuerzo de contenido |
| Flujo FREE vs PREMIUM | **FREE = versión recortada de PREMIUM** (no flujo separado) | Reutiliza componentes existentes, simplifica mantenimiento |
| Selector de categorías FREE | **Mismo `CategorySelector`** con prop `freeModeCategories` | Una sola fuente de verdad, filtra por slugs |
| Paso de preguntas para FREE | **Omitido** — FREE va directo de categoría a tirada | Menor fricción, el plan no incluye preguntas custom |
| Generación de contenido | **Tarea batch offline asistida por LLM (Claude/Gemini) + revisión humana** | No es cómputo en runtime, permite calidad editorial |
| Tono por contexto | **Dos tonos distintos**: tirada (atemporal, por categoría) vs carta del día (energía del día, 3 temas breves) | Expectativas distintas del usuario |
| URLs | **`/tarot/**`** en lugar de `/ritual/**` | Existe otra actividad llamada "Rituales" — colisión semántica |
| Impacto en PREMIUM | **Ninguno** (los nuevos campos/tabla son ignorados por el flujo de interpretación personalizada) | Cero regresión |
| Validación de mazo FREE | **Backend en `create-reading.use-case.ts`** | Seguridad — evita bypass desde cliente |
| Daily card para anónimos | **Mismo comportamiento que FREE** | Experiencia consistente pre-login |

---

## ÍNDICE DE HISTORIAS DE USUARIO

| ID      | Historia                                                  | Prioridad | Requiere Auth |
| ------- | --------------------------------------------------------- | --------- | ------------- |
| HUS-001 | Rename de rutas `/ritual` → `/tarot` (prerequisito)       | Must      | —             |
| HUS-002 | Elegir categoría (Free) entre Amor, Salud y Dinero        | Must      | Sí (Free)     |
| HUS-003 | Ver lectura Free con interpretación pre-escrita por categoría | Must  | Sí (Free)     |
| HUS-004 | Ver carta del día con texto de "energía diaria"           | Must      | No            |
| HUS-005 | Usuario Free ve solo Arcanos Mayores al elegir cartas     | Must      | Sí (Free)     |
| HUS-006 | Ver CTA de upgrade a Premium desde resultados Free        | Should    | Sí (Free)     |
| HUS-007 | Administrar interpretaciones Free desde admin             | Could     | Admin         |

---

## DETALLE DE HISTORIAS DE USUARIO

### HUS-001: Rename de Rutas `/ritual` → `/tarot` (Prerequisito)

**Como** equipo de producto
**Quiero** que todas las rutas relacionadas a la tirada de cartas vivan bajo `/tarot/**`
**Para** evitar colisión semántica con la actividad existente "Rituales" (`/rituales/**`)

#### Criterios de Aceptación:

1. **Dado** que un usuario navega a `/tarot`, `/tarot/tirada`, `/tarot/preguntas`, `/tarot/lectura`
   **Cuando** la página carga
   **Entonces** ve el contenido correspondiente (antes disponible en `/ritual/**`)

2. **Dado** que un usuario accede a la URL antigua `/ritual/*`
   **Cuando** se resuelve la ruta
   **Entonces** es redirigido automáticamente al equivalente en `/tarot/*` (301 o redirect de Next.js)

3. **Dado** que reviso el código
   **Cuando** busco referencias a `/ritual`
   **Entonces** no quedan hardcodeos (todo vive en `ROUTES` de `lib/constants/routes.ts`)

#### Notas Técnicas:

- Actualizar `ROUTES` en `frontend/src/lib/constants/routes.ts` (ruta `RITUAL*` → `TAROT*`)
- Mover físicamente carpetas `app/ritual/**` → `app/tarot/**`
- Agregar redirects en `next.config.js` para SEO y links externos
- Actualizar todas las referencias `router.replace('/ritual/...')` y `router.push('/ritual/...')`

#### Estimación: 2 puntos

---

### HUS-002: Elegir Categoría (Free) entre Amor y Relaciones, Salud y Bienestar, Dinero y Finanzas

**Como** usuario con plan FREE
**Quiero** poder elegir una categoría para mi lectura (Amor y Relaciones, Salud y Bienestar, o Dinero y Finanzas)
**Para** recibir una interpretación orientada a mi área de interés

> **Importante:** las 3 categorías disponibles para FREE se muestran con el **mismo nombre, slug e ícono** que tienen en el selector PREMIUM (proviniendo de la tabla `reading_category`). No se crean nombres ni iconografía nuevos — FREE es una vista filtrada del mismo catálogo.

#### Criterios de Aceptación:

1. **Dado** que soy un usuario FREE autenticado
   **Cuando** navego a `/tarot`
   **Entonces** veo un selector con 3 categorías tomadas de `reading_category`: **❤️ Amor y Relaciones**, **🌿 Salud y Bienestar**, **💰 Dinero y Finanzas** (mismos nombres que ve PREMIUM para esas 3)

2. **Dado** que soy un usuario PREMIUM
   **Cuando** navego a `/tarot`
   **Entonces** veo las 6 categorías completas (sin cambios respecto al flujo actual)

3. **Dado** que soy FREE y elijo una categoría
   **Cuando** confirmo la selección
   **Entonces** se me redirige directamente a `/tarot/tirada?categoryId=X` (sin pasar por selector de preguntas)

4. **Dado** que soy FREE
   **Cuando** veo el selector
   **Entonces** veo un mensaje/CTA: _"¿Querés más categorías? Actualizá a Premium."_

5. **Dado** que alcancé mi límite de tarot readings
   **Cuando** entro al selector de categorías
   **Entonces** soy redirigido al modal `ReadingLimitReached` (comportamiento actual, sin cambios)

#### Notas Técnicas:

- Modificar `CategorySelector.tsx` para aceptar prop `freeModeCategories?: string[]` que filtra por slugs
- Modificar `RitualPageContent.tsx` (futuro `TarotPageContent`): en vez de `router.replace('/tarot/tirada')` para FREE, renderizar `<CategorySelector freeModeCategories={['amor', 'salud', 'dinero']} />` (slugs — el nombre visible se resuelve desde `reading_category`)
- `handleCategoryClick` en modo FREE debe navegar directo a `/tarot/tirada?categoryId=X` (sin pasar por `/tarot/preguntas`)
- Usar `capabilities.canUseCustomQuestions` para discriminar (ya existe)

#### Estimación: 5 puntos

---

### HUS-003: Ver Lectura Free con Interpretación Pre-escrita por Categoría

**Como** usuario FREE
**Quiero** recibir una interpretación amigable orientada a la categoría que elegí
**Para** obtener valor emocional y orientativo de mi lectura (no un listado de keywords técnico)

#### Criterios de Aceptación:

1. **Dado** que soy FREE y elegí la categoría "Amor"
   **Cuando** completo la tirada de 3 cartas
   **Entonces** veo para cada carta un texto pre-escrito orientado al amor (2-3 oraciones, tono cálido, específico a la orientación upright/reversed)

2. **Dado** que veo la sección de interpretación
   **Cuando** leo el encabezado
   **Entonces** veo el nombre de la categoría elegida con su ícono (ej: ❤️ Tu Lectura de Amor)

3. **Dado** que soy PREMIUM
   **Cuando** completo una lectura
   **Entonces** sigo viendo la interpretación personalizada (sin cambios)

4. **Dado** que soy FREE y el backend no encontró interpretación pre-escrita para alguna combinación
   **Cuando** recibo la lectura
   **Entonces** veo un fallback razonable (texto por defecto o el `meaningUpright` crudo con mensaje explicativo)

5. **Dado** que consulto el historial de una lectura FREE pasada
   **Cuando** abro el detalle
   **Entonces** veo la misma interpretación pre-escrita (persistente)

#### Notas Técnicas:

- Backend: modificar `create-reading.use-case.ts` para que, cuando `useAI === false && categoryId`, busque interpretaciones en `card_free_interpretation` via `CardFreeInterpretationService.findByCardsAndCategory()`
- Backend: adjuntar `freeInterpretations` al response de lectura
- Frontend: modificar `InterpretationSection` en `ReadingExperience.tsx` para renderizar `freeInterpretations` cuando están presentes
- Persistencia: las interpretaciones se guardan como parte del registro de lectura para que el historial las muestre

#### Estimación: 8 puntos

---

### HUS-004: Ver Carta del Día con Texto de "Energía Diaria"

**Como** usuario FREE o anónimo
**Quiero** que mi carta del día me entregue un texto con tono de "energía del día"
**Para** sentir que la lectura es relevante al presente y no un texto genérico

#### Criterios de Aceptación:

1. **Dado** que soy FREE o anónimo
   **Cuando** saco mi carta del día
   **Entonces** veo una sola interpretación (no dividida por categoría) de 3-5 oraciones con tono "hoy la energía de [carta] te acompaña..." que menciona brevemente amor, bienestar y dinero

2. **Dado** que soy FREE/anónimo
   **Cuando** la carta del día se elige aleatoriamente
   **Entonces** siempre es un Arcano Mayor (no Menor)

3. **Dado** que soy PREMIUM
   **Cuando** saco mi carta del día
   **Entonces** recibo la interpretación personalizada (sin cambios)

4. **Dado** que la misma carta me salió ayer en orientación upright
   **Cuando** hoy me vuelve a salir en upright
   **Entonces** el texto es el mismo (intencionalmente estático — la variedad es un valor Premium)

5. **Dado** que la interpretación pre-escrita de la carta es `null` (aún sin seed)
   **Cuando** se muestra el resultado
   **Entonces** hay un fallback al `meaningUpright/Reversed` con nota explicativa

#### Notas Técnicas:

- Backend: modificar `selectRandomCard()` en `daily-reading.service.ts` para filtrar por `category: 'arcanos_mayores'` cuando el usuario es FREE/anónimo
- Backend: retornar `card.dailyFreeUpright` o `card.dailyFreeReversed` como `interpretation` cuando `useAI === false`
- Frontend: modificar `DailyCardExperience.tsx` para mostrar el texto pre-escrito sin el layout de 3 temas (un bloque único)

#### Estimación: 5 puntos

---

### HUS-005: Usuario Free Ve Solo Arcanos Mayores al Elegir Cartas

**Como** sistema
**Quiero** que los usuarios FREE solo puedan ver/usar los 22 Arcanos Mayores en cualquier tirada
**Para** alinearse con la práctica del mercado y limitar el contenido gratuito

#### Criterios de Aceptación:

1. **Dado** que soy FREE y llego al deck de selección de cartas
   **Cuando** se renderiza el mazo
   **Entonces** veo solo 22 cartas (los Arcanos Mayores)

2. **Dado** que soy PREMIUM
   **Cuando** se renderiza el mazo
   **Entonces** veo las 78 cartas completas

3. **Dado** que un cliente malicioso modifica el request y envía IDs de Arcanos Menores siendo FREE
   **Cuando** el backend procesa la lectura
   **Entonces** rechaza con 403 y mensaje: _"El plan FREE solo permite cartas de Arcanos Mayores"_

4. **Dado** que soy FREE/anónimo y saco carta del día
   **Cuando** el backend elige aleatoriamente
   **Entonces** siempre es un Arcano Mayor

#### Notas Técnicas:

- Backend: en `create-reading.use-case.ts` (o `ReadingValidatorService`), si `!useAI`, validar que todas las cards tengan `category === 'arcanos_mayores'`
- Backend: `selectRandomCard()` en `daily-reading.service.ts` filtra por `category` según capabilities
- Frontend: al hacer fetch del deck, enviar filtro por arcanos mayores si `!canUseCustomQuestions` (o un nuevo capability `canUseFullDeck`)

#### Estimación: 5 puntos

---

### HUS-006: Ver CTA de Upgrade a Premium desde Resultados Free

**Como** usuario FREE
**Quiero** ver una invitación clara a upgradear a Premium en el resultado de mi lectura
**Para** entender qué obtengo al pagar (interpretación personalizada y profunda)

#### Criterios de Aceptación:

1. **Dado** que soy FREE y completé una lectura
   **Cuando** veo el resultado con interpretación pre-escrita
   **Entonces** al final veo un banner: _"✨ Con Premium obtenés una interpretación personalizada y profunda para tu pregunta exacta."_

2. **Dado** que veo el banner de upgrade
   **Cuando** hago clic en el CTA
   **Entonces** soy llevado a `/premium` (landing de upgrade)

3. **Dado** que soy FREE y saqué carta del día
   **Cuando** veo el resultado
   **Entonces** veo un banner similar al del punto 1

4. **Dado** que soy PREMIUM
   **Cuando** veo el resultado
   **Entonces** no veo el banner de upgrade

#### Notas Técnicas:

- Crear componente reutilizable `FreeReadingUpgradeBanner` con estilos de brand
- Insertarlo al final de `InterpretationSection` y `DailyCardExperience` condicionalmente por capabilities

#### Estimación: 3 puntos

---

### HUS-007: Administrar Interpretaciones Free desde Admin (Opcional)

**Como** admin
**Quiero** poder editar los 176 textos pre-escritos desde el panel admin
**Para** refinar copy sin necesidad de un deploy de código

> Esta HUS es **opcional / could-have**. En MVP se puede manejar el contenido vía seed y editarlo vía migración o script.

#### Criterios de Aceptación:

1. **Dado** que soy admin y entro a `/admin/interpretaciones-free`
   **Cuando** la página carga
   **Entonces** veo una tabla con filtros por carta, categoría y orientación

2. **Dado** que selecciono una interpretación
   **Cuando** hago clic en "Editar"
   **Entonces** puedo modificar el texto y guardar

3. **Dado** que actualicé un texto
   **Cuando** un usuario FREE hace una lectura
   **Entonces** ve el texto actualizado

#### Estimación: 5 puntos (postergable)

---

## MATRIZ DE PERMISOS

| Capacidad                                                    | Anónimo | Free           | Premium | Admin |
| ------------------------------------------------------------ | ------- | -------------- | ------- | ----- |
| Ver catálogo de servicios holísticos (no aplica a este módulo) | —     | —              | —       | —     |
| Carta del día con texto "energía diaria"                     | ✅      | ✅             | ❌ (usa personalizada) | ✅ |
| Carta del día con interpretación personalizada               | ❌      | ❌             | ✅      | ✅    |
| Acceder a `/tarot` (selector de categorías)                  | ❌      | ✅ (3 cats)    | ✅ (6)  | ✅    |
| Acceder a `/tarot/preguntas`                                 | ❌      | ❌             | ✅      | ✅    |
| Elegir cartas del mazo completo (78)                         | ❌      | ❌ (solo 22)   | ✅      | ✅    |
| Tiradas de 1 y 3 cartas                                      | ❌      | ✅             | ✅      | ✅    |
| Tiradas de 5, 7, 10 cartas                                   | ❌      | ❌             | ✅      | ✅    |
| Recibir interpretación pre-escrita por categoría             | ❌      | ✅             | ❌      | —     |
| Recibir interpretación personalizada y profunda              | ❌      | ❌             | ✅      | ✅    |
| Ver CTA de upgrade                                           | ✅      | ✅             | ❌      | ❌    |

---

## FLUJO DE USUARIO COMPLETO

```
FREE:                                     PREMIUM (sin cambios):
  /tarot                                    /tarot
    │                                         │
    ▼                                         ▼
  3 categorías (Amor y Relaciones,        6 categorías
   Salud y Bienestar, Dinero y Finanzas)
    │                                         │
    ▼                                         ▼
  /tarot/tirada?categoryId=X                /tarot/preguntas?categoryId=X
  (SALTA preguntas)                           │
    │                                         ▼
    ▼                                       /tarot/tirada?questionId=Y
  Elegir tirada (1 o 3 cartas)                │
    │                                         ▼
    ▼                                       Elegir tirada (todas)
  Seleccionar cartas (solo 22 arcanos)        │
    │                                         ▼
    ▼                                       Seleccionar cartas (78)
  /tarot/lectura?spreadId=Z&...               │
    │                                         ▼
    ▼                                       /tarot/lectura?...
  Resultado con texto pre-escrito             │
  + CTA upgrade                               ▼
                                            Resultado personalizado


CARTA DEL DÍA:
  /carta-del-dia
    │
    ▼
  ├─ FREE/Anónimo: carta aleatoria entre 22 arcanos → dailyFreeUpright/Reversed
  └─ Premium: carta aleatoria entre 78 → interpretación personalizada y profunda
```

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** `T-FR-B0X` = Backend, `T-FR-F0X` = Frontend, `T-FR-S0X` = Seed (contenido editorial), `T-FR-P0X` = Prerequisito

### Índice de Tareas Técnicas

| ID       | Tarea                                                              | Tipo     | Prioridad   | Estimación |
| -------- | ------------------------------------------------------------------ | -------- | ----------- | ---------- |
| T-FR-P01 | Rename de rutas `/ritual` → `/tarot` + redirects                   | Frontend | ✅ COMPLETADA | 0.5 días   |
| T-FR-B01 | Capa de dominio: Migración, entidad y campos nuevos                | Backend  | ✅ COMPLETADA | 2 días     |
| T-FR-B02 | Capa de aplicación: Service, Repository y modificación de use case | Backend  | ✅ COMPLETADA | 3 días     |
| T-FR-B03 | Validación de mazo FREE + modificación de daily-reading            | Backend  | ✅ COMPLETADA | 2 días     |
| T-FR-B04 | Capability `canUseFullDeck` + endpoint `GET /cards?category=`      | Backend  | ✅ COMPLETADA | 1 día      |
| T-FR-S01 | Seed de tiradas — 132 prompts para Claude/Gemini                   | Content  | ✅ COMPLETADA | 3 días     |
| T-FR-S02 | Seed de carta del día — 44 prompts para Claude/Gemini              | Content  | ✅ COMPLETADA | 2 días     |
| T-FR-F01 | Frontend: CategorySelector con modo Free + routing                 | Frontend | ✅ COMPLETADA | 2 días     |
| T-FR-F02 | Frontend: InterpretationSection con textos pre-escritos + CTA      | Frontend | 🔴 CRÍTICA | 2 días     |
| T-FR-F03 | Frontend: DailyCardExperience con texto de energía diaria          | Frontend | 🔴 CRÍTICA | 2 días     |
| T-FR-F04 | Frontend: Deck filtrado a Arcanos Mayores para FREE                | Frontend | 🟡 ALTA    | 2 días     |

**Estimación total:** ~21.5 días de desarrollo (incluye TDD + ciclos de calidad + generación de contenido)

---

## PREREQUISITO

---

### T-FR-P01: Rename de Rutas `/ritual` → `/tarot` + Redirects

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 0.5 días (3-4h — verificado por grep: ~7 archivos en `app/ritual/`, ~5 `router.push/replace`, ~8 `href`, ~15 tests)
**Dependencias:** Ninguna
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Actualizar `frontend/src/lib/constants/routes.ts`: renombrar claves y valores `RITUAL*` → `TAROT*` (ej: `RITUAL_TIRADA: '/ritual/tirada'` → `TAROT_TIRADA: '/tarot/tirada'`)
- [x] Mover físicamente carpetas del App Router: `app/ritual/**` → `app/tarot/**`
- [x] Actualizar todas las llamadas `router.replace('/ritual/...')` y `router.push('/ritual/...')` en el código (buscar exhaustivamente)
- [x] Renombrar componentes relacionados: `RitualPageContent` → `TarotPageContent`
- [x] Agregar redirects 301 en `next.config.js`:
  ```js
  async redirects() {
    return [
      { source: '/ritual', destination: '/tarot', permanent: true },
      { source: '/ritual/:path*', destination: '/tarot/:path*', permanent: true },
    ];
  }
  ```
- [x] Actualizar tests que dependan de las rutas antiguas
- [x] Verificar links en Header, Footer, emails transaccionales y documentación

#### 🎯 Criterios de aceptación

- [x] Navegando a `/tarot`, `/tarot/tirada`, `/tarot/preguntas`, `/tarot/lectura` se ve el contenido correcto
- [x] Navegando a `/ritual/*` se redirige permanentemente al equivalente en `/tarot/*`
- [x] No quedan referencias hardcodeadas a `/ritual` en el código (grep limpio)
- [x] Los tests pasan y `npm run build` compila sin errores
- [x] `npm run type-check` y `npm run lint:fix` pasan

---

## TAREAS DE BACKEND

---

### T-FR-B01: Capa de Dominio — Migración, Entidad y Campos Nuevos

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** Ninguna
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-003, HUS-004 (capa de datos)

#### 📋 Descripción

Crear la estructura de datos para las interpretaciones pre-escritas de usuarios FREE: una tabla nueva `card_free_interpretation` para tiradas convencionales (132 registros), dos campos nuevos `daily_free_upright` / `daily_free_reversed` en la tabla existente `tarot_card` para carta del día (44 registros), y un campo `free_interpretations` tipo JSONB en `tarot_reading` para persistir los textos del historial FREE.

> **Decisión de persistencia del historial FREE:** En lugar de concatenar los textos en el campo `interpretation: string | null` existente (que está reservado para la interpretación personalizada de PREMIUM), se agrega una columna nueva `free_interpretations: jsonb nullable` a `tarot_reading`. Esto permite estructurar los textos por posición/carta y preserva la semántica del campo `interpretation` para el flujo personalizado (zero regresión en el historial PREMIUM).

#### ✅ Tareas específicas

**Entidad CardFreeInterpretation:**

- [x] Crear entidad `CardFreeInterpretation` en `modules/tarot/cards/entities/card-free-interpretation.entity.ts` con campos: `id`, `cardId` (FK `tarot_card`), `categoryId` (FK `reading_category`), `orientation` ('upright' | 'reversed'), `content` (text), `createdAt`, `updatedAt`
- [x] Decorador `@Unique(['cardId', 'categoryId', 'orientation'])` para evitar duplicados
- [x] Relaciones ManyToOne con `TarotCard` y `ReadingCategory`
- [x] Índices apropiados en `cardId` y `categoryId`

**Modificación de TarotCard:**

- [x] Agregar campos `dailyFreeUpright: string | null` y `dailyFreeReversed: string | null` (type: `text`, nullable: `true`) a `TarotCard` entity ([tarot-card.entity.ts](backend/tarot-app/src/modules/tarot/cards/entities/tarot-card.entity.ts))

**Modificación de TarotReading:**

- [x] Agregar campo `freeInterpretations: Record<number, { content: string }> | null` (type: `jsonb`, nullable: `true`) a `TarotReading` entity ([tarot-reading.entity.ts:160](backend/tarot-app/src/modules/tarot/readings/entities/tarot-reading.entity.ts#L160)) — estructura indexada por `position` de la lectura
- [x] Decorar con `@ApiProperty` apropiado para que aparezca en Swagger y en el response (no hay DTO de response: la entidad es el contrato — verificado)

**Migración:**

- [x] Crear migración `CreateCardFreeInterpretations` que cree la tabla con FKs (ON DELETE CASCADE a `tarot_card`, RESTRICT a `reading_category`)
- [x] Crear migración `AddDailyFreeFieldsToTarotCard` que agregue las dos columnas nullable
- [x] Crear migración `AddFreeInterpretationsToTarotReading` que agregue campo `freeInterpretations` de tipo `jsonb` nullable
- [x] Las tres migraciones reversibles (método `down()` implementado)

**Repositorio:**

- [x] Crear interface `ICardFreeInterpretationRepository` con método `findByCardsAndCategory(cardIds: number[], orientations: ('upright' | 'reversed')[], categoryId: number): Promise<CardFreeInterpretation[]>`
- [x] Crear implementación TypeORM
- [x] Token de inyección para DI
- [x] Tests unitarios con mock de TypeORM

#### 🎯 Criterios de aceptación

- [x] La migración se aplica correctamente y es reversible
- [x] La entidad `CardFreeInterpretation` respeta el unique compuesto
- [x] Los campos `dailyFreeUpright/Reversed` son `nullable: true` para no romper datos existentes
- [x] `npm run build` compila sin errores
- [x] Coverage ≥ 80% en los archivos nuevos
- [x] `validate-architecture.js` pasa sin errores

---

### T-FR-B02: Capa de Aplicación — Service y Modificación de Use Case

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 días
**Dependencias:** T-FR-B01
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-003

#### 📋 Descripción

Crear el servicio que consulta las interpretaciones pre-escritas y modificar el use case principal de creación de lecturas para adjuntar los textos amigables cuando el usuario es FREE con `categoryId` seleccionado.

#### ✅ Tareas específicas

**Service:**

- [x] Crear `CardFreeInterpretationService` con método `findByCardsAndCategory(cards, cardPositions, categoryId)` que retorna un mapa `{ [positionIndex]: { content: string } }` indexado por posición (0..N-1)
- [x] Tests unitarios con happy path + casos de combinaciones faltantes (fallback a `meaningUpright/Reversed`)

**Modificación de Use Case:**

- [x] Modificar [create-reading.use-case.ts](backend/tarot-app/src/modules/tarot/readings/application/use-cases/create-reading.use-case.ts):
  ```typescript
  if (createReadingDto.useAI === true) {
    // PREMIUM — SIN CAMBIOS (setea reading.interpretation)
  } else if (createReadingDto.categoryId) {
    // FREE: buscar interpretaciones pre-escritas por categoría
    const freeInterpretations = await this.cardFreeInterpretationService
      .findByCardsAndCategory(cards, cardPositions, createReadingDto.categoryId);
    await this.readingRepo.update(reading.id, { freeInterpretations });
  }
  ```
- [x] Persistir en el campo `freeInterpretations: jsonb` creado en T-FR-B01 (NO usar el campo `interpretation` — está reservado para la interpretación personalizada de PREMIUM)
- [x] Mantener fallback: si no se encuentra combinación para una carta, usar `meaningUpright/Reversed` existente

**DTO:**

- [x] Agregar `categoryId?: number` al [CreateReadingDto](backend/tarot-app/src/modules/tarot/readings/dto/create-reading.dto.ts). Validaciones: `@IsInt() @IsOptional() @IsPositive()`
- [x] El response sigue siendo la entidad `TarotReading`. `freeInterpretations` queda visible gracias al nuevo campo de entidad

**Validación de categoryId por plan:**

- [x] Agregar método `validateCategoryAccess(userPlan, categoryId)` en [ReadingValidatorService](backend/tarot-app/src/modules/tarot/readings/application/services/reading-validator.service.ts) que verifica que FREE/ANONYMOUS solo use slugs `['amor', 'salud', 'dinero']` consultando `CategoriesService.findOne(categoryId)`. PREMIUM tiene acceso total sin consulta.
- [x] Llamar el validador desde `create-reading.use-case.ts` antes de crear la lectura. Lanza `ForbiddenException` si la categoría no está permitida para el plan
- [x] Tests unitarios del validador cubriendo los 3 slugs permitidos para FREE, rechazo de `trabajo`/`espiritual`/`general`, ANONYMOUS rechazado, y acceso total para PREMIUM

**Tests:**

- [x] Tests unitarios del use case cubriendo:
  - PREMIUM con `useAI: true` → genera interpretación personalizada (sin cambios, zero regresión)
  - FREE con `categoryId` → carga interpretaciones pre-escritas y persiste en `freeInterpretations`
  - FREE sin `categoryId` → no llama a `cardFreeInterpretationService`
  - `useAI: true` con `categoryId` → flujo PREMIUM toma precedencia
  - `validateCategoryAccess` lanza `ForbiddenException` → `readingRepo.create` no se llama

#### 🎯 Criterios de aceptación

- [x] El flujo PREMIUM sigue funcionando exactamente igual (zero regresión)
- [x] El flujo FREE con `categoryId` retorna interpretaciones pre-escritas
- [x] El historial de lecturas muestra las interpretaciones persistidas
- [x] Coverage ≥ 80%
- [x] No se usa `any` ni `eslint-disable`

---

### T-FR-B03: Validación de Mazo FREE + Modificación de Daily Reading

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** T-FR-B01
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-004, HUS-005

#### 📋 Descripción

Agregar validación de seguridad backend que impida a usuarios FREE usar Arcanos Menores, y modificar el servicio de carta del día para (a) limitar la selección aleatoria a arcanos mayores y (b) retornar los nuevos campos `dailyFreeUpright/Reversed` como interpretación.

#### ✅ Tareas específicas

**Validación de Mazo (create-reading):**

- [x] En `create-reading.use-case.ts` (o `ReadingValidatorService`), si `!useAI`, verificar que todas las cartas tengan `category === 'arcanos_mayores'`
- [x] Lanzar `ForbiddenException('El plan FREE solo permite cartas de Arcanos Mayores')` si la validación falla
- [x] Tests unitarios con intento malicioso (FREE enviando IDs de arcanos menores)

**Modificación de DailyReadingService:**

- [x] Modificar `selectRandomCard()` en `daily-reading.service.ts`: aceptar parámetro `onlyMajorArcana: boolean`; si `true`, filtrar query por `category: 'arcanos_mayores'`
- [x] En el método que orquesta la carta del día: si el usuario es FREE/anónimo → `onlyMajorArcana: true`
- [x] Retornar `card.dailyFreeUpright` o `card.dailyFreeReversed` como `interpretation` cuando el usuario no accede a interpretación personalizada (antes retornaba `null` o `meaningUpright`)
- [x] Fallback: si `dailyFreeUpright/Reversed` es `null` (aún sin seed), usar `meaningUpright/Reversed` con log warning

**Tests:**

- [x] Tests unitarios: usuario anónimo → solo arcanos mayores + texto `dailyFreeUpright`
- [x] Tests: usuario FREE → igual que anónimo
- [x] Tests: usuario PREMIUM → mazo completo + interpretación personalizada
- [x] Tests: fallback cuando `dailyFreeUpright` es `null`

#### 🎯 Criterios de aceptación

- [x] Un cliente malicioso FREE no puede obtener lectura con arcanos menores (403)
- [x] Carta del día para FREE/anónimo siempre es un arcano mayor
- [x] Carta del día para FREE/anónimo muestra el texto `dailyFreeUpright/Reversed`
- [x] El flujo PREMIUM sigue generando interpretación personalizada sin cambios
- [x] Coverage ≥ 80%

---

---

### T-FR-B04: Capability `canUseFullDeck` + Endpoint `GET /cards?category=`

**Prioridad:** 🟡 ALTA
**Estimación:** 1 día
**Dependencias:** Ninguna (puede hacerse en paralelo con B01-B03)
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-005 (prerequisito backend de T-FR-F04)

#### 📋 Descripción

Agregar la capability explícita `canUseFullDeck` al `UserCapabilitiesService` y soportar filtrado por `category` en el endpoint público de cartas para que el frontend pueda solicitar solo Arcanos Mayores. Hoy el endpoint `GET /cards` no acepta filtros y no existe capability específica para el mazo completo (solo proxies como `canUseAI`/`canUseCustomQuestions` que conceptualmente son distintos).

#### ✅ Tareas específicas

**Capability:**

- [x] Agregar campo `canUseFullDeck: boolean` al [UserCapabilitiesDto](backend/tarot-app/src/modules/users/application/dto/user-capabilities.dto.ts)
- [x] En [UserCapabilitiesService.getCapabilities()](backend/tarot-app/src/modules/users/application/services/user-capabilities.service.ts): setear `canUseFullDeck = plan === UserPlanType.PREMIUM`
- [x] Tests unitarios: FREE/anónimo → `false`, PREMIUM → `true`

**Endpoint de cartas:**

- [x] Modificar [cards.controller.ts:32](backend/tarot-app/src/modules/tarot/cards/cards.controller.ts#L32) — agregar query param `@Query('category') category?: string` al `GET /cards`
- [x] Agregar método `findByCategory(category: string)` en [cards.service.ts](backend/tarot-app/src/modules/tarot/cards/cards.service.ts)
- [x] Documentar con `@ApiQuery({ name: 'category', required: false, example: 'arcanos_mayores' })`
- [x] Tests unitarios + E2E: `GET /cards?category=arcanos_mayores` retorna 22 cartas; sin filtro retorna 78

**Frontend:**

- [x] Actualizar type `UserCapabilities` en frontend para incluir `canUseFullDeck`

#### 🎯 Criterios de aceptación

- [x] `canUseFullDeck` aparece en el response de `/users/capabilities`
- [x] `GET /cards?category=arcanos_mayores` retorna solo los 22 Arcanos Mayores
- [x] `GET /cards` sin query sigue retornando las 78 cartas (sin regresión)
- [x] Coverage ≥ 80%

---

## TAREAS DE SEED / CONTENIDO (PROMPTS EDITORIALES)

> Estas tareas no son de código — son **prompts listos para enviar a Claude o Gemini** para que generen el contenido editorial. La salida se guarda como seed y se ejecuta vía scripts de migración de datos. El revisor humano debe validar cada texto antes de mergearlo.

---

### T-FR-S01: Seed de Tiradas — 132 Prompts para Claude/Gemini

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 días (generación + revisión humana)
**Dependencias:** T-FR-B01 (tabla creada)
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-003

#### 📋 Descripción

Generar los **132 textos** para la tabla `card_free_interpretation`: **22 Arcanos Mayores × 3 categorías (Amor y Relaciones, Salud y Bienestar, Dinero y Finanzas — slugs `amor`/`salud`/`dinero`) × 2 orientaciones (upright, reversed)**.

#### ✅ Tareas específicas

- [x] Ejecutar el prompt maestro (abajo) en Claude y/o Gemini para cada carta
- [x] Consolidar outputs en `backend/tarot-app/src/modules/tarot/cards/seeds/card-free-interpretations.data.ts` como array de objetos `{ cardSlug, categorySlug, orientation, content }`
- [x] Script de seed idempotente que inserta los registros (upsert por `cardId + categoryId + orientation`)
- [x] Revisión humana (checklist): tono cálido, 2-3 oraciones, sin clichés, coherente con `meaningUpright/Reversed`

---

#### 📝 PROMPT MAESTRO PARA CLAUDE/GEMINI (Tiradas)

> Copiar y pegar este prompt, reemplazando `{{CARD_NAME}}`, `{{CARD_DESCRIPTION}}`, `{{CARD_KEYWORDS_UPRIGHT}}`, `{{CARD_KEYWORDS_REVERSED}}` con los datos reales de cada Arcano Mayor (tomados de la entity `TarotCard`).

---

**Inicio del prompt ▼**

Eres un redactor especializado en tarot con un tono cálido, empático y orientativo, con sensibilidad rioplatense. Tu tarea es escribir 6 interpretaciones breves (2-3 oraciones cada una) de una carta de tarot para usuarios que están recibiendo una lectura gratuita.

- **CARTA:** `{{CARD_NAME}}`
- **DESCRIPCIÓN ENCICLOPÉDICA:** `{{CARD_DESCRIPTION}}`
- **KEYWORDS DERECHA (upright):** `{{CARD_KEYWORDS_UPRIGHT}}`
- **KEYWORDS INVERTIDA (reversed):** `{{CARD_KEYWORDS_REVERSED}}`

**CONTEXTO:**

- El usuario eligió una categoría entre: Amor y Relaciones, Salud y Bienestar, Dinero y Finanzas
- Cada texto debe orientarse 100% a esa categoría (no mezclar)
- Tono: cálido, empático, orientativo pero no alarmista ni dogmático
- Longitud: 2-3 oraciones por texto (máximo ~50 palabras)
- Español neutro con sensibilidad argentina (sin modismos excesivos)
- No usar "tú" — usar "vos" o segunda persona neutra

**FORMATO DE SALIDA (JSON estricto, sin explicaciones adicionales):**

```json
{
  "amor_upright": "texto aquí...",
  "amor_reversed": "texto aquí...",
  "salud_upright": "texto aquí...",
  "salud_reversed": "texto aquí...",
  "dinero_upright": "texto aquí...",
  "dinero_reversed": "texto aquí..."
}
```

**EJEMPLO DE SALIDA (para El Loco):**

```json
{
  "amor_upright": "El Loco te invita a abrirte a nuevas conexiones sin miedo. Dejá ir las expectativas y permití que el amor te sorprenda con caminos inesperados.",
  "amor_reversed": "Hay un salto que estás postergando por miedo. La carta te pide revisar si la imprudencia o la resistencia están impidiendo que te entregues de verdad.",
  "salud_upright": "Es momento de soltar cargas y darte permiso para ser libre. Tu bienestar pasa por escuchar tu espíritu aventurero y no reprimir tu espontaneidad.",
  "salud_reversed": "Cuidado con la dispersión o los riesgos innecesarios. Tu cuerpo te pide más presencia y menos fuga hacia delante.",
  "dinero_upright": "Nuevas oportunidades están por llegar, pero requieren un salto de fe. Confiá en tu capacidad de adaptarte y atrevete a explorar caminos no convencionales.",
  "dinero_reversed": "Una decisión financiera apresurada puede salir cara. Antes de dar el salto, revisá si tenés la información que necesitás."
}
```

Ahora generá los 6 textos para la carta `{{CARD_NAME}}`.

**Fin del prompt ▲**

---

#### 🎯 Criterios de aceptación

- [x] Los 132 textos están generados y revisados por un humano
- [x] El seed es idempotente (re-ejecutable sin duplicar)
- [x] Cada texto respeta la longitud (2-3 oraciones, ~50 palabras)
- [x] El tono es consistente entre todas las cartas
- [x] No hay mezcla entre categorías (un texto de "amor" no habla de dinero)

---

### T-FR-S02: Seed de Carta del Día — 44 Prompts para Claude/Gemini

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días (generación + revisión humana)
**Dependencias:** T-FR-B01 (campos agregados)
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Ejecutar el prompt maestro (abajo) en Claude y/o Gemini para cada carta
- [x] Consolidar outputs y crear migración de datos que haga UPDATE en `tarot_card` por slug
- [x] Revisión humana: tono "energía diaria", menciona los 3 temas brevemente

---

#### 📝 PROMPT MAESTRO PARA CLAUDE/GEMINI (Carta del Día)

---

**Inicio del prompt ▼**

Eres un redactor especializado en tarot con un tono cálido, empático y orientado al presente. Tu tarea es escribir 2 interpretaciones breves de una carta de tarot para la funcionalidad "Carta del Día".

- **CARTA:** `{{CARD_NAME}}`
- **DESCRIPCIÓN ENCICLOPÉDICA:** `{{CARD_DESCRIPTION}}`
- **KEYWORDS DERECHA:** `{{CARD_KEYWORDS_UPRIGHT}}`
- **KEYWORDS INVERTIDA:** `{{CARD_KEYWORDS_REVERSED}}`

**CONTEXTO — ESTE TEXTO ES DIFERENTE A LAS TIRADAS:**

- Es la **carta del día**, no una tirada → tono de "energía del día", presente, acompañamiento
- En un único texto debés mencionar **brevemente** los 3 temas: amor, bienestar y dinero
- Arranca con fórmula tipo: "Hoy la energía de [carta] te acompaña..." o variantes similares
- Longitud: 3-5 oraciones (~80-100 palabras)
- Español neutro con sensibilidad argentina
- Segunda persona con "vos"

**FORMATO DE SALIDA (JSON estricto):**

```json
{
  "daily_upright": "texto aquí...",
  "daily_reversed": "texto aquí..."
}
```

**EJEMPLO DE SALIDA (para El Loco):**

```json
{
  "daily_upright": "Hoy la energía del Loco te acompaña. En el amor, es un día para animarte a dar ese primer paso sin miedo al rechazo. Tu bienestar pide soltar el control y fluir con lo inesperado. En lo económico, una oportunidad sorpresa podría aparecer si te atrevés a salir de lo habitual.",
  "daily_reversed": "Hoy el Loco invertido te pide prudencia. En el amor, revisá si estás saltando sin mirar o si hay una decisión que conviene repensar. Tu cuerpo pide grounding, no más dispersión. En lo económico, evitá gastos impulsivos — la claridad llegará si bajás un cambio."
}
```

Ahora generá los 2 textos para la carta `{{CARD_NAME}}`.

**Fin del prompt ▲**

---

#### 🎯 Criterios de aceptación

- [x] Los 44 textos están generados y revisados
- [x] Cada texto menciona los 3 temas (amor, bienestar, dinero) brevemente
- [x] El tono es de "energía presente" (no atemporal como las tiradas)
- [x] La migración de datos es reversible
- [x] Fallback a `meaningUpright/Reversed` cuando `dailyFreeUpright/Reversed` es null funciona correctamente

---

## TAREAS DE FRONTEND

---

### T-FR-F01: Frontend — CategorySelector con Modo Free + Routing

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** T-FR-P01 (rename de rutas), T-FR-B02 (backend listo)
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-002

#### 📋 Descripción

Modificar `CategorySelector` para soportar un modo FREE con filtrado a 3 categorías, y actualizar `RitualPageContent` (futuro `TarotPageContent`) para que renderice el selector filtrado en vez de saltar directo a la tirada. FREE debe navegar directo a la tirada después de elegir categoría (sin pasar por preguntas).

#### ✅ Tareas específicas

- [x] Modificar `CategorySelector.tsx`: agregar prop `freeModeCategories?: string[]` que filtra `categories` por slugs antes de renderizar
- [x] Si `freeModeCategories` está presente, modificar `handleCategoryClick` para navegar a `/tarot/tirada?categoryId=X` (en lugar de `/tarot/preguntas?categoryId=X`)
- [x] Agregar banner/CTA en modo FREE: _"¿Querés más categorías? Actualizá a Premium."_
- [x] Modificar `RitualPageContent.tsx` (renombrar a `TarotPageContent`):
  - Eliminar el `useEffect` que hace `router.replace('/tarot/tirada')` para FREE
  - Renderizar `<CategorySelector freeModeCategories={['amor-relaciones', 'salud-bienestar', 'dinero-finanzas']} />` cuando `!canUseCustomQuestions && canCreateTarotReading`
  - Mantener `<CategorySelector />` sin filtro para PREMIUM
- [x] Tests unitarios:
  - CategorySelector en modo FREE muestra solo 3 categorías
  - CategorySelector en modo FREE navega a `/tarot/tirada?...` al elegir categoría
  - CategorySelector sin `freeModeCategories` muestra las 6 (sin regresión)
  - TarotPageContent renderiza el selector filtrado para FREE

#### 🎯 Criterios de aceptación

- [x] FREE ve 3 categorías (Amor y Relaciones, Salud y Bienestar, Dinero y Finanzas) con sus íconos — mismos nombres que PREMIUM
- [x] PREMIUM ve las 6 categorías (sin regresión)
- [x] FREE navega directo a `/tarot/tirada?categoryId=X` (sin pasar por preguntas)
- [x] El banner de upgrade se muestra para FREE
- [x] Coverage ≥ 80%, build y type-check pasan

---

### T-FR-F02: Frontend — InterpretationSection con Textos Pre-escritos + CTA Upgrade

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** T-FR-B02 (backend retorna `freeInterpretations`)
**Estado:** ⏳ PENDIENTE
**Cubre HUS:** HUS-003, HUS-006

#### 📋 Descripción

Modificar la sección de resultados de lectura (`InterpretationSection` en `ReadingExperience.tsx`) para que, cuando el response trae `freeInterpretations`, renderice los textos amigables pre-escritos en lugar de los `meaningUpright/Reversed` crudos. Incluir el banner de upgrade a Premium al final.

#### ✅ Tareas específicas

- [ ] Actualizar tipos TypeScript: agregar `freeInterpretations?: ...` al tipo `Reading`
- [ ] Modificar `InterpretationSection` (`ReadingExperience.tsx` L164-229):
  - Si `reading.freeInterpretations` está presente, usar esos textos por carta/orientación
  - Mostrar el nombre de la categoría elegida con ícono en el encabezado (ej: ❤️ Tu Lectura de Amor)
  - Fallback: si falta combinación, usar `meaningUpright/Reversed` existente con mensaje discreto
- [ ] Crear componente `FreeReadingUpgradeBanner` (reutilizable): título, descripción, botón CTA a `/premium`
- [ ] Renderizar `FreeReadingUpgradeBanner` al final de la sección cuando el usuario es FREE
- [ ] Tests unitarios:
  - `InterpretationSection` muestra textos pre-escritos cuando `freeInterpretations` está presente
  - Muestra el nombre+ícono de la categoría correctamente
  - Fallback a `meaningUpright/Reversed` cuando falta combinación
  - Banner upgrade visible para FREE, oculto para PREMIUM

#### 🎯 Criterios de aceptación

- [ ] Usuario FREE ve los textos amigables pre-escritos en el resultado
- [ ] Usuario PREMIUM sigue viendo la interpretación personalizada (sin regresión)
- [ ] Banner de upgrade visible solo para FREE
- [ ] Fallback razonable cuando falta seed
- [ ] Texto user-facing en español

---

### T-FR-F03: Frontend — DailyCardExperience con Texto de Energía Diaria

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** T-FR-B03 (backend retorna `dailyFreeUpright/Reversed`)
**Estado:** ⏳ PENDIENTE
**Cubre HUS:** HUS-004, HUS-006

#### 📋 Descripción

Modificar `DailyCardExperience` para que muestre el texto único de "energía diaria" (proveniente de `dailyFreeUpright/Reversed`) en lugar del layout dividido por categorías. Incluir banner de upgrade.

#### ✅ Tareas específicas

- [ ] Actualizar tipos: el response de carta del día incluye `interpretation: string` (ya existente, ahora poblado con `dailyFreeUpright/Reversed`)
- [ ] Modificar `DailyCardExperience.tsx`:
  - Renderizar el texto como un bloque único (no 3 secciones temáticas)
  - Encabezado: "🌟 Tu Carta del Día" + nombre de la carta + orientación
  - Incluir `FreeReadingUpgradeBanner` al final (para FREE/anónimo)
  - Para PREMIUM: mantener el layout actual con la interpretación personalizada
- [ ] Fallback visual si `interpretation` es null (texto mínimo + keywords)
- [ ] Tests unitarios:
  - FREE/anónimo ve el texto único de energía diaria
  - PREMIUM ve la interpretación personalizada (sin regresión)
  - Banner upgrade visible para FREE/anónimo

#### 🎯 Criterios de aceptación

- [ ] FREE/anónimo ve el texto único de energía diaria
- [ ] PREMIUM ve la interpretación personalizada y profunda (sin regresión)
- [ ] El layout es claro, no dividido por categorías
- [ ] Banner upgrade visible para no-Premium

---

### T-FR-F04: Frontend — Deck Filtrado a Arcanos Mayores para FREE

**Prioridad:** 🟡 ALTA
**Estimación:** 2 días
**Dependencias:** T-FR-B03, **T-FR-B04** (endpoint y capability deben existir antes)
**Estado:** ⏳ PENDIENTE
**Cubre HUS:** HUS-005

#### 📋 Descripción

Filtrar el mazo de cartas mostrado en el flujo de selección (`ReadingExperience`) para que los usuarios FREE solo vean los 22 Arcanos Mayores, usando la capability `canUseFullDeck` y el query param del endpoint (creados en T-FR-B04). La validación de seguridad está en backend (T-FR-B03); esto es la capa de UX.

> **Nota:** Verificado que hoy **no existe un hook `useTarotCards`** en frontend. Las cartas se consumen desde `/encyclopedia/cards` o endpoints específicos del flujo de selección. Se debe identificar el punto exacto de fetch en `ReadingExperience` y crear/modificar el hook correspondiente.

#### ✅ Tareas específicas

- [ ] Identificar el punto de fetch del deck en `ReadingExperience` (hoy posiblemente inline o vía endpoint encyclopedia)
- [ ] Crear/modificar hook `useTarotDeck(options: { onlyMajorArcana?: boolean })` que consuma `GET /cards?category=arcanos_mayores` cuando corresponda
- [ ] En `ReadingExperience`: pasar `onlyMajorArcana: !capabilities.canUseFullDeck` al hook
- [ ] Tests unitarios:
  - FREE ve mazo de 22 cartas
  - PREMIUM ve mazo de 78 cartas
  - La selección funciona correctamente con deck reducido

#### 🎯 Criterios de aceptación

- [ ] FREE solo ve los 22 Arcanos Mayores en la selección
- [ ] PREMIUM ve las 78 cartas
- [ ] No se rompe el flujo de selección existente
- [ ] Coverage ≥ 80%

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
FASE 0 — Prerequisito:
  T-FR-P01 (rename de rutas /ritual → /tarot)

FASE 1 — Backend + generación de contenido en paralelo:
  T-FR-B01 ──┬──► T-FR-B02 ──► T-FR-B03
             │
             ├──► T-FR-S01 (prompts tiradas)
             └──► T-FR-S02 (prompts carta del día)

  T-FR-B04 (capability + endpoint filtrado — independiente, paralelo)

FASE 2 — Frontend (después de backend):
  T-FR-F01 ──► T-FR-F02
  T-FR-F03 (paralelo con F02)
  T-FR-F04 (requiere T-FR-B04 + T-FR-B03)
```

> **Nota:** T-FR-S01 y T-FR-S02 (generación de contenido editorial asistida) son **independientes del código** y pueden ejecutarse en paralelo desde que T-FR-B01 define el esquema. Esto permite que el contenido esté listo cuando el backend termine.

---

## DIAGRAMA DE DEPENDENCIAS

```
T-FR-P01 (Rename /ritual → /tarot)
    │
    ▼
T-FR-B01 (Migración + Entidades + Campos + freeInterpretations JSONB)
    │
    ├──► T-FR-B02 (Service + Use Case + categoryId DTO + Validator)
    │        │
    │        ▼
    │    T-FR-F02 (InterpretationSection + CTA)
    │
    ├──► T-FR-B03 (Validación mazo + Daily)
    │        │
    │        └──► T-FR-F03 (DailyCardExperience)
    │
    ├──► T-FR-S01 (Seed tiradas — 132 prompts editoriales)
    │
    └──► T-FR-S02 (Seed carta del día — 44 prompts editoriales)

T-FR-B04 (canUseFullDeck + GET /cards?category=) ─┐
                                                   │
                                                   ├──► T-FR-F04 (Deck filtrado)
T-FR-B03 ──────────────────────────────────────────┘

T-FR-P01 ──► T-FR-F01 (CategorySelector Free + routing)
```

---

**FIN DE PARTE B — TAREAS TÉCNICAS**

---

## PARTE C: MEJORAS FUTURAS (no bloqueantes para MVP)

| ID       | Tarea                                                          | Tipo      | Prioridad | Estimación |
| -------- | -------------------------------------------------------------- | --------- | --------- | ---------- |
| T-FR-M01 | Admin: editor de interpretaciones Free (HUS-007)               | Fullstack | 🟢 Baja  | 5 días     |
| T-FR-M02 | A/B testing del copy de interpretaciones Free                  | Analytics | 🟢 Baja  | 3 días     |
| T-FR-M03 | Extender a 6 categorías para FREE si métricas de retención lo justifican | Backend + Content | 🟢 Baja | 5 días |
| T-FR-M04 | Generación dinámica de variantes con LLM económico (Groq/Llama) | Backend   | 🟢 Baja  | 5 días     |

---

**Estimación total del módulo (MVP):** ~21.5 días

**Autores:** Ariel (PO) + Claude
**Última actualización:** 2026-04-12
