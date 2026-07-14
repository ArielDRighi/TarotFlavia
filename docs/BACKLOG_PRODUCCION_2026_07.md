# BACKLOG: PREPARACIÓN PARA PRODUCCIÓN — Julio 2026

## PARTE A: REPORTE DE HALLAZGOS

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Ronda de preparación para producción (config de pagos, bugs visuales, assets, integridad del producto y monetización)
**Versión:** 1.0
**Fecha:** 10 de julio de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente de desarrollo)
**Verificación:** Relevamiento de código (agentes exploradores sobre `frontend/` y `backend/tarot-app/`) + análisis de configuración (`.env`, panel de Mercado Pago) + navegación de la versión deployada por Ariel.
**Convención de IDs:** nueva serie `PROD-XXX` (hallazgos) / `T-PROD-XXX` (tareas) propia de este backlog.

---

## CONTEXTO

De cara a la salida a producción, Ariel detectó siete frentes: (1) la integración de Mercado Pago sigue con credenciales de testing, (2) en móvil el logo "Auguria" tapa el botón "Iniciar sesión", (3) las cartas de alta calidad están en la DB local pero la versión deployada muestra las viejas, (4) falta un email dedicado del dominio (a comprar en Porkbun, donde está el dominio), (5) ya existe la imagen definitiva para el dorso de las cartas (hoy el dorso es un patrón CSS), (6) las cartas de las tiradas **no están mezcladas** — la selección es 100 % predecible — y (7) hay que monetizar a usuarios anónimos y Free con Google AdSense.

El relevamiento confirmó que la mayoría son tareas acotadas de configuración/frontend, con **dos excepciones de fondo**: la mezcla de cartas (PROD-006) es un defecto de integridad del producto que requiere mover la asignación de cartas al backend, y AdSense (PROD-007) requiere infraestructura nueva (gating por plan, consentimiento de cookies y alta en Google).

---

## ÍNDICE DE HALLAZGOS

| ID | Hallazgo | Severidad | Módulo afectado |
| -------- | ------------------------------------------------------------------------------ | ---------- | -------------------------------------- |
| PROD-001 | Mercado Pago en modo testing (credenciales de prueba, sin secret de webhook) | 🔴 Crítica | Backend — pagos / config + panel MP |
| PROD-002 | En móvil, el logo "Auguria" tapa el botón "Iniciar sesión" | 🟠 Alta | Frontend — Header global |
| PROD-003 | Cartas de alta calidad no sincronizadas en el deploy (DB + assets) | 🟠 Alta | Ops — migración prod + deploy frontend |
| PROD-004 | Sin email dedicado del dominio; SMTP sin configurar (emails NO se envían) | 🟠 Alta | Infra — Porkbun + config backend |
| PROD-005 | El dorso de las cartas es un patrón CSS; existe la imagen final para reemplazarlo | 🟡 Media | Frontend — componentes de cartas |
| PROD-006 | Las cartas de las tiradas NO están mezcladas: la selección es determinista | 🔴 Crítica | Full-stack — flujo de tiradas |
| PROD-007 | Sin monetización por anuncios para usuarios anónimos y Free (Google AdSense) | 🟡 Media | Frontend + Infra — nueva feature |
| PROD-008 | En móvil, los nombres de signos/animales se cortan en el selector de horóscopo | 🟠 Alta | Frontend — Horóscopo occidental y chino |
| PROD-009 | Campana de notificaciones visible sin feature planeada (+ enum desincronizado que crashea) | 🟠 Alta | Frontend — Header / Notificaciones |

> **Segunda ronda (11 de julio de 2026):** PROD-008 y PROD-009 se agregaron tras una navegación de Ariel sobre la versión deployada en móvil. Ambos son de frontend y de alcance acotado; PROD-009 incluye además un crash latente que Ariel no había visto.

---

## DETALLE DE HALLAZGOS

### PROD-001: Mercado Pago en Modo Testing

**Severidad:** 🔴 Crítica (bloquea cobros reales)
**Módulo:** Backend — [mercadopago.service.ts](../backend/tarot-app/src/modules/payments/infrastructure/services/mercadopago.service.ts) + `backend/tarot-app/.env` + panel de Mercado Pago
**Reportado por:** Ariel — "actualmente el proyecto tiene la configuración de Mercado Pago de testing".

#### Descripción del Problema

La integración de MP (Checkout Pro para servicios holísticos + Preapproval para suscripciones Premium) está completa y **el código ya está preparado para producción**, pero la configuración es de testing:

- `MP_ACCESS_TOKEN` en `.env` es la credencial de la **cuenta de prueba** (formato `APP_USR-` de test user).
- `MP_WEBHOOK_SECRET` está **comentado**. El código tiene el fail-safe correcto: con `NODE_ENV=production` y sin secret, [mercadopago.service.ts:125-139](../backend/tarot-app/src/modules/payments/infrastructure/services/mercadopago.service.ts#L125-L139) **rechaza todos los webhooks** → sin el secret configurado, en producción ningún pago se acreditaría jamás.
- `BACKEND_URL` apunta a un túnel de **ngrok** (webhooks de testing local); `FRONTEND_URL` a `localhost:3001`.
- `MP_PREAPPROVAL_PLAN_ID` está seteado en `.env` pero **ninguna parte de `src/` la lee** — configuración muerta: [create-preapproval.use-case.ts](../backend/tarot-app/src/modules/subscriptions/application/use-cases/create-preapproval.use-case.ts) crea preapprovals sueltos con las constantes de [preapproval-plan.constants.ts](../backend/tarot-app/src/modules/subscriptions/application/constants/preapproval-plan.constants.ts).
- El precio de la suscripción ($2.999 ARS/mes) está **hardcodeado** en `preapproval-plan.constants.ts:5` — confirmar que es el precio real de salida.
- El webhook único (compras + suscripciones) es `POST {BACKEND_URL}/api/v1/webhooks/mercadopago` ([webhook.controller.ts](../backend/tarot-app/src/modules/payments/infrastructure/controllers/webhook.controller.ts)).

El frontend **no** tiene credenciales de MP: solo redirige al `init_point` que devuelve la API. No requiere cambios.

#### Criterios de Aceptación

1. **Dado** un usuario real en la app productiva
   **Cuando** compra un servicio holístico o se suscribe a Premium
   **Entonces** el pago se procesa con la cuenta real de MP, el webhook llega firmado, la firma valida y el estado de la compra/suscripción se actualiza.

---

### PROD-002: "Auguria" Tapa "Iniciar Sesión" en Móvil

**Severidad:** 🟠 Alta (bug visual en el punto de entrada de todo usuario móvil no logueado)
**Módulo:** [Header.tsx](../frontend/src/components/layout/Header.tsx) + [UserMenu.tsx](../frontend/src/components/layout/UserMenu.tsx)
**Reportado por:** Ariel — "en la versión móvil 'Auguria' tapa 'iniciar sesión'".

#### Descripción del Problema

Hay **un único header global** ([app/layout.tsx:47](../frontend/src/app/layout.tsx#L47) → `<Header />`), así que el bug afecta a todo el sitio en móvil cuando el usuario no está autenticado.

**Causa raíz:** el logo usa centrado absoluto en móvil — [Header.tsx:54-56](../frontend/src/components/layout/Header.tsx#L54-L56):

```tsx
<Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
  <span className="text-primary font-serif text-2xl font-semibold">Auguria</span>
</Link>
```

Al estar `absolute`, el logo queda **fuera del flujo flex**: el `justify-between` de la barra solo reparte la hamburguesa (izquierda) y la zona derecha. Cuando no hay usuario, [UserMenu.tsx:27-38](../frontend/src/components/layout/UserMenu.tsx#L27-L38) renderiza **dos botones de texto** ("Iniciar sesión" + "Crear cuenta") que en viewports de 360-430 px crecen hacia el centro geométrico de la barra — exactamente donde está pintado el logo absoluto (`text-2xl`, sin fondo, sin truncate) — y se superponen.

El diseño "logo centrado en móvil" asume laterales estrechos (íconos), pero el estado no-autenticado tiene texto largo a la derecha. Los tests existentes ([Header.test.tsx](../frontend/src/components/layout/Header.test.tsx)) son de JSDOM y no cubren posicionamiento, así que no bloquean el fix.

#### Criterios de Aceptación

1. **Dado** un viewport móvil (320-430 px) sin sesión iniciada
   **Cuando** se renderiza el header
   **Entonces** el logo "Auguria" y los botones "Iniciar sesión" / "Crear cuenta" son completamente visibles y clickeables, sin superposición.

---

### PROD-003: Cartas de Alta Calidad No Sincronizadas en el Deploy

**Severidad:** 🟠 Alta
**Módulo:** Ops — migración de DB en producción + deploy del frontend
**Reportado por:** Ariel — "las cartas de mayor calidad existen en la DB, pero no se hizo deploy; en la versión deployada las tiradas usan las viejas".

#### Descripción del Problema

El pipeline de imágenes de cartas tiene **dos mitades que se despliegan por separado** y hoy están desincronizadas en el entorno deployado:

1. **DB (backend):** la migración [1776400000000-MigrateCardImagesToLocalWebP.ts](../backend/tarot-app/src/database/migrations/1776400000000-MigrateCardImagesToLocalWebP.ts) actualiza los 78 `imageUrl` de `tarot_card` desde las URLs viejas de `upload.wikimedia.org` hacia paths locales `/images/tarot/<slug>.webp`.
2. **Assets (frontend):** las 78 imágenes WebP (~3.2 MB total) viven en `frontend/public/images/tarot/`, trackeadas en git, y se sirven desde el **dominio del frontend** (los paths en DB son relativos).

Además, [next.config.ts](../frontend/next.config.ts) tiene `images.remotePatterns: []` — Next.js **rechaza** hosts remotos. Consecuencia crítica: si en producción se deploya el frontend nuevo **sin** correr la migración, las cartas no se verán "viejas", se verán **rotas** (next/image rechaza wikimedia). El orden del deploy importa.

Diagnóstico del estado actual deployado (a confirmar en el entorno): la migración no se corrió en la DB de producción y/o el frontend deployado es una build previa a los assets.

Nota: la enciclopedia usa otra tabla (`encyclopedia_tarot_card`) y otros assets (`/images/enciclopedia/`) — verificar ambas superficies. El doc [IMAGE_OPTIMIZATION.md](../frontend/docs/IMAGE_OPTIMIZATION.md) quedó desactualizado (aún documenta `remotePatterns` con wikimedia).

#### Criterios de Aceptación

1. **Dado** el entorno deployado
   **Cuando** un usuario ve una tirada, la carta del día o la enciclopedia
   **Entonces** todas las cartas muestran las imágenes WebP locales de alta calidad, sin 404 ni errores de next/image.

---

### PROD-004: Sin Email Dedicado del Dominio (y SMTP Sin Configurar)

**Severidad:** 🟠 Alta
**Módulo:** Infra — Porkbun (DNS/email) + `backend/tarot-app/.env` ([email.service.ts](../backend/tarot-app/src/modules/email/email.service.ts))
**Reportado por:** Ariel — "quiero comprar un mail dedicado en Porkbun, que es donde compré el dominio".

#### Descripción del Problema

Dos cosas distintas pero acopladas:

1. **No existe una casilla de email del dominio** (tipo `hola@` / `noreply@<dominio>`). Ariel quiere comprarla en **Porkbun** (registrador del dominio), que ofrece email hosting pago por casilla y reenvío (forwarding) gratuito.
2. **El backend hoy NO envía emails reales:** el `.env` no tiene ninguna variable `SMTP_*` configurada, por lo que el módulo de email corre en modo `jsonTransport` (los emails se loguean en consola y no salen — ver [EMAIL_SETUP.md](../backend/tarot-app/docs/EMAIL_SETUP.md)). Afecta: bienvenida, reset de contraseña, lecturas compartidas, avisos de límite de cuota.

La casilla dedicada resuelve además el remitente para Mercado Pago/AdSense y la imagen profesional del proyecto.

#### Criterios de Aceptación

1. **Dado** un usuario que se registra o pide reset de contraseña en producción
   **Cuando** el backend dispara el email
   **Entonces** el email llega desde `noreply@<dominio>` (o la casilla definida), sin caer en spam (SPF/DKIM/DMARC configurados y validados).

---

### PROD-005: El Dorso de las Cartas es CSS; Existe la Imagen Final

**Severidad:** 🟡 Media
**Módulo:** [TarotCard.tsx](../frontend/src/components/features/readings/TarotCard.tsx) (+ [CardThumbnails.tsx](../frontend/src/components/features/readings/CardThumbnails.tsx))
**Reportado por:** Ariel — "tengo la imagen para el dorso final de las cartas".

#### Descripción del Problema

El dorso actual **no es una imagen**: es un patrón geométrico dibujado con divs y CSS (`bg-secondary`, marco, mandala, esquinas) en [TarotCard.tsx:102-136](../frontend/src/components/features/readings/TarotCard.tsx#L102-L136) (`data-testid="card-back"`). No existe ningún asset de dorso en `frontend/public/` — la búsqueda de `*back*`/`dorso` no devuelve archivos.

Puntos a tener en cuenta:

- El campo `reversedImageUrl` de la entidad `tarot_card` **no** es el dorso (es para la carta invertida) — no confundir; el dorso es un asset estático del frontend, no requiere DB.
- `CardThumbnails.tsx` también dibuja cartas boca abajo — debe usar la misma imagen.
- La imagen que aporta Ariel debe optimizarse a WebP (mismo pipeline que las 78 cartas, ~20-60 KB) y respetar el aspect ratio de las cartas.

#### Criterios de Aceptación

1. **Dado** cualquier vista con cartas boca abajo (selección de tirada, thumbnails)
   **Cuando** se renderizan
   **Entonces** muestran la imagen final del dorso (WebP optimizada), manteniendo `data-testid="card-back"` y la accesibilidad actual.

---

### PROD-006: Las Cartas de las Tiradas NO Están Mezcladas

**Severidad:** 🔴 Crítica (integridad del producto: la tirada es 100 % predecible)
**Módulo:** Full-stack — [useTarotDeck.ts](../frontend/src/hooks/api/useTarotDeck.ts), [ReadingExperience.tsx](../frontend/src/components/features/readings/ReadingExperience.tsx), [create-reading.use-case.ts](../backend/tarot-app/src/modules/tarot/readings/application/use-cases/create-reading.use-case.ts)
**Reportado por:** Ariel — "para la selección de cartas en las tiradas, estas no están mezcladas y deben estar mezcladas".

#### Descripción del Problema

**No existe ningún shuffle en el flujo de tiradas.** La identidad de cada carta boca abajo es determinista:

- [useTarotDeck.ts:54](../frontend/src/hooks/api/useTarotDeck.ts#L54) genera el mazo en orden fijo: `Array.from({ length: size }, (_, i) => i)` → `[0,1,2,...]`.
- [ReadingExperience.tsx:404-405](../frontend/src/components/features/readings/ReadingExperience.tsx#L404-L405) deriva la carta directamente de la posición elegida: `cardIds = selectedCardIndices.map((index) => index + 1)`. **La posición 1 del mazo boca abajo es SIEMPRE El Loco (id 1), la 2 El Mago (id 2), etc.**
- El backend **confía en los `cardIds` del cliente**: [create-reading.use-case.ts:101](../backend/tarot-app/src/modules/tarot/readings/application/use-cases/create-reading.use-case.ts#L101) los busca en DB tal cual llegan. Un usuario puede además editar el POST y elegir exactamente las cartas que quiera.
- La única aleatoriedad es la orientación (`isReversed: Math.random() < 0.3`, [ReadingExperience.tsx:413](../frontend/src/components/features/readings/ReadingExperience.tsx#L413)) — y también es client-side.

Evidencia de intención original inconclusa: existe `random-cards.dto.ts` como **código muerto** (no cableado a ningún controller). En contraste, la **tirada diaria SÍ randomiza server-side** ([daily-reading.service.ts:412-421](../backend/tarot-app/src/modules/tarot/daily-reading/daily-reading.service.ts#L412-L421)) — es el patrón a seguir.

**Decisión de diseño:** un shuffle solo client-side no cumple el requisito (el usuario puede leer la red/JS y predecir o manipular). La asignación de identidad debe ser **autoritativa en el backend**, con aleatoriedad criptográfica (`crypto.randomInt`, ya usado en `reading-share.service.ts`). Esto implica un cambio deliberado del contrato del endpoint `POST /readings` (el cliente deja de enviar la identidad de las cartas), coordinado entre backend y frontend.

Un test frontend hoy **codifica el bug como comportamiento esperado**: `ReadingExperience.test.tsx:1040-1044` (`cardIds: expect.arrayContaining([1]) // index 0 → cardId 1`).

#### Criterios de Aceptación

1. **Dado** dos tiradas idénticas (mismo spread, mismas posiciones elegidas)
   **Cuando** el usuario selecciona las mismas posiciones del mazo boca abajo
   **Entonces** las cartas asignadas difieren entre tiradas (aleatoriedad real), la asignación ocurre en el backend y el cliente no puede predecirla ni forzarla.
2. **Dado** un usuario FREE
   **Cuando** se mezcla el mazo
   **Entonces** solo entran en el pool los Arcanos Mayores (se preserva `validateDeckAccess`).

---

### PROD-007: Google AdSense para Usuarios Anónimos y Free

**Severidad:** 🟡 Media (feature de monetización)
**Módulo:** Frontend — layout global, nueva feature `ads/` + Infra (cuenta AdSense, consent)
**Reportado por:** Ariel — "agregar Google Ads para usuarios anónimos y free".

#### Descripción del Problema

No existe hoy ninguna integración de ads ni de analytics activa (los `gtag()` de [useConversionTracking.ts:108-159](../frontend/src/hooks/utils/useConversionTracking.ts#L108-L159) están comentados). Relevamiento de lo que ya existe para construir encima:

- **Gating por plan resuelto:** [useUserPlanFeatures.ts:71-92](../frontend/src/hooks/utils/useUserPlanFeatures.ts#L71-L92) expone `isPremium`/`isFree`/`isAnonymous` (`UserPlan = 'anonymous' | 'free' | 'premium'`). Regla de ads: mostrar si `plan !== 'premium'`.
- **Hidratación:** el `authStore` expone `_hasHydrated` y el `AuthProvider` bloquea el render hasta validar sesión → se puede evitar el "flash" de ads a un premium.
- **Sin CSP hoy** ([next.config.ts:35-45](../frontend/next.config.ts#L35-L45) solo setea Content-Type del manifest) → AdSense no será bloqueado, pero si se agrega CSP hay que contemplar sus dominios.
- **Sin CMP/banner de cookies:** para anuncios personalizados en UE, AdSense exige un CMP certificado; la vía más simple es el mensaje de consentimiento propio de Google (Privacy & messaging). La página [privacidad/page.tsx](../frontend/src/app/privacidad/page.tsx) es un placeholder a actualizar.
- **Páginas candidatas:** públicas de alto tráfico SEO (`/enciclopedia/**`, `/horoscopo/**`, `/horoscopo-chino/**`, landing) + app autenticada Free (`/tarot`, `/historial`, `/carta-del-dia`, dashboard). Excluir siempre: `/admin/**`, flujos de pago (`/premium/activacion`, pago de servicios).
- **Tests que hoy afirman que NO hay ads** (deberán actualizarse): `PremiumBenefitsSection.test.tsx:62`, `UpgradeModal.test.tsx:79-83`. Bonus de producto: "Sin publicidad" pasa a ser un beneficio Premium real y se puede sumar al copy de `/premium` (cuidando FBK-005: no prometer lo que no se entrega — acá sí se entregaría).

#### Criterios de Aceptación

1. **Dado** un usuario anónimo o Free
   **Cuando** navega páginas con slots de anuncio
   **Entonces** ve anuncios de AdSense (tras consentimiento donde aplique).
2. **Dado** un usuario Premium
   **Cuando** navega cualquier página
   **Entonces** NO se carga el script de AdSense ni se muestra ningún anuncio (tampoco un flash momentáneo).

---

### PROD-008: Los Nombres de Signos/Animales se Cortan en Móvil

**Severidad:** 🟠 Alta (bug visual en dos secciones del producto)
**Módulo:** Frontend — [AnimalHoroscopePage.tsx](../frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx), [horoscopo/[sign]/page.tsx](../frontend/src/app/horoscopo/[sign]/page.tsx), [ChineseAnimalCard.tsx](../frontend/src/components/features/chinese-horoscope/ChineseAnimalCard.tsx), [ZodiacSignCard.tsx](../frontend/src/components/features/horoscope/ZodiacSignCard.tsx)
**Reportado por:** Ariel — "encontré navegando la aplicación el siguiente problema, calculo también pasa en el horóscopo occidental" (captura del selector chino en móvil: "Caballo" → "Cabal", "Serpiente" → "Serp", "Cerdo" → "Cerc").

#### Descripción del Problema

En la página de detalle de un animal/signo, el selector de las 12 opciones se renderiza dentro de un contenedor `overflow-x-auto` con la grilla **forzada a 6 columnas en móvil**:

```tsx
<div className="mb-8 overflow-x-auto px-1 py-2">
  <ChineseAnimalSelector ... className="!grid-cols-6 lg:!grid-cols-12" />
</div>
```

El componente es un **CSS grid**, no un carrusel flex. Las 6 columnas se reparten el ancho del viewport (`repeat(6, minmax(0, 1fr))`), así que en un móvil de 380px cada tarjeta queda en ~55px de ancho. El nombre se renderiza en `text-lg` (18px), sin `truncate` ni wrap y sin ancho mínimo de tarjeta: el texto **desborda la tarjeta**, empuja el grid más allá del viewport y queda visualmente cortado. El `overflow-x-auto` produce entonces un scroll horizontal espurio que además parte las tarjetas del borde derecho.

El bug está **duplicado**: `ChineseAnimalSelector`/`ChineseAnimalCard` y `ZodiacSignSelector`/`ZodiacSignCard` son dos copias independientes del mismo patrón (no existe componente compartido), y ambas páginas de detalle usan el mismo override `!grid-cols-6 lg:!grid-cols-12`. La intuición de Ariel es correcta: **pasa igual en el horóscopo occidental**, y ahí es peor porque los nombres son más largos ("Capricornio", "Sagitario").

**Las páginas de listado (`/horoscopo`, `/horoscopo-chino`) TAMBIÉN tienen el bug.** (Corregido durante la revisión: la primera versión de este documento afirmaba lo contrario — que la grilla por defecto "daba ancho suficiente" — sin haberlo medido. Es falso.) La grilla de 3 columnas en móvil deja tarjetas de 85–120px y el nombre en `text-lg` no entra:

| viewport | `/horoscopo` | `/horoscopo-chino` |
| -------- | ------------------------------------------------------------ | ------------------------------------ |
| 320px | Géminis, Cáncer, Escorpio, Sagitario, Capricornio, Acuario | Conejo, Dragón, Serpiente, Caballo |
| 360px | Sagitario, Capricornio | Serpiente |
| 390px | **Capricornio** | — |
| 430px | **Capricornio** | — |

Es decir: el mismo síntoma que reportó Ariel también estaba en la **página de entrada** del horóscopo occidental, en todo el rango móvil.

#### Criterios de Aceptación

1. **Dado** un viewport móvil (320–430px)
   **Cuando** el usuario abre el detalle de un signo o de un animal
   **Entonces** los 12 nombres se leen **completos** (ningún texto cortado ni desbordado).
2. **Dado** ese mismo viewport
   **Cuando** el usuario recorre el selector
   **Entonces** el scroll horizontal es **intencional** (carrusel de una fila, tarjetas de ancho fijo), no un desborde accidental del grid.
3. **Dado** un viewport desktop
   **Entonces** el selector conserva la fila de 12 tarjetas actual.

---

### PROD-009: Campana de Notificaciones Visible Sin Feature Planeada (+ Crash Latente)

**Severidad:** 🟠 Alta (UI muerta de cara al usuario + `TypeError` latente en el header)
**Módulo:** Frontend — [Header.tsx](../frontend/src/components/layout/Header.tsx), [notifications/](../frontend/src/components/features/notifications/), [notification.types.ts](../frontend/src/types/notification.types.ts)
**Reportado por:** Ariel — "veo la campana de notificaciones que no tiene (según entiendo) ninguna función… notificaciones no están planeadas en la web".

#### Descripción del Problema

Son **dos problemas superpuestos**:

**(a) La campana parece muerta.** La feature *sí* está implementada de punta a punta (TASK-400h backend + TASK-414 frontend, ambas completadas en `BACKLOG_RITUALES.md`): dropdown Radix con lista, contador de no leídas, "marcar todas como leídas", y backend con `GET /notifications`, `/count`, `PATCH /:id/read`, `/read-all`. Pero el **único productor de notificaciones** es el cron de eventos sagrados ([sacred-event-notification-cron.service.ts](../backend/tarot-app/src/modules/notifications/application/services/sacred-event-notification-cron.service.ts)), que solo genera notificaciones para usuarios **premium**. Para cualquier usuario Free la campana está siempre vacía → se percibe como un ícono sin función. **Decisión del Delta:** notificaciones no están planeadas en la web; **ocultar y bloquear** la feature sin borrar el código, para poder reactivarla más adelante.

**(b) Crash latente por enums desincronizados.** El enum del backend y el del frontend no coinciden:

| Backend (`user-notification.entity.ts:12-17`) | ¿Existe en el frontend? |
| --------------------------------------------- | ----------------------- |
| `sacred_event` | ✅ |
| `sacred_event_reminder` | ❌ **falta** |
| `ritual_reminder` | ✅ |
| `pattern_insight` | ❌ **falta** |

Además el frontend define tres tipos que el backend **nunca emite** (`reading_shared`, `system`, `promotion`). [NotificationItem.tsx:13](../frontend/src/components/features/notifications/NotificationItem.tsx#L13) hace `NOTIFICATION_TYPE_INFO[notification.type]` **sin guard** y luego lee `typeInfo.icon` / `.color` / `.name`: si a un usuario premium le llega un `sacred_event_reminder` (el cron los emite activamente), el dropdown tira `TypeError` y rompe el header. Este bug **hay que arreglarlo igual**, aunque la campana quede oculta, porque el código queda en el repo para reactivarse.

#### Criterios de Aceptación

1. **Dado** cualquier usuario (Free o Premium)
   **Cuando** carga la app
   **Entonces** NO ve la campana en el header, y el frontend **no hace ninguna petición** a `/notifications` ni a `/notifications/count`.
2. **Dado** que se active el flag en el futuro
   **Cuando** llega una notificación de **cualquier** tipo emitido por el backend
   **Entonces** el ítem se renderiza sin crashear (tipos sincronizados + fallback defensivo para tipos desconocidos).
3. El código de la feature (componentes, hooks, API, tipos, tests) **permanece en el repo**, no se borra.

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** serie `T-PROD-XXX` propia de este backlog.
> Estimación en puntos de historia (1 punto ≈ 0.5 día).
> Las tareas de **código** se ejecutan siguiendo `docs/WORKFLOW_FRONTEND.md` / `docs/WORKFLOW_BACKEND.md` (TDD, ciclo de calidad y PR a `develop`). Las tareas de **Ops/Infra** son checklists operativos (paneles externos, DNS, deploy) sin PR asociado, salvo donde se indique.

### Índice de Tareas Técnicas

| ID | Tarea | Tipo | Prioridad | Estimación |
| ---------- | ------------------------------------------------------------------------------ | ----------- | ---------- | ---------- |
| T-PROD-001 | Migrar Mercado Pago a producción (credenciales, webhook, env) | Ops/Config | 🔴 Crítica | 1 pt |
| T-PROD-002 | Fix header móvil: logo en el flujo flex (sin overlap con auth) | Frontend | 🟠 Alta | 1 pt |
| T-PROD-003 | Sincronizar cartas HQ en el entorno deployado (migración + assets) | Ops | 🟠 Alta | 1 pt |
| T-PROD-004 | ✅ Email del dominio: buzón humano en Porkbun + envío transaccional por Resend (SMTP) | Ops/Infra | 🟠 Alta | 1 pt |
| T-PROD-005 | Dorso final de las cartas (imagen WebP en lugar del patrón CSS) | Frontend | 🟡 Media | 1.5 pts |
| T-PROD-006 | Mezcla de cartas server-side (backend: shuffle autoritativo con crypto) | Backend | 🔴 Crítica | 3 pts |
| T-PROD-007 | Mezcla de cartas: adaptar el frontend al nuevo contrato | Frontend | 🔴 Crítica | 2 pts |
| T-PROD-008 | ✅ AdSense fase 1: componente `AdSlot` + carga condicional del script por plan | Frontend | 🟡 Media | 3 pts |
| T-PROD-009 | AdSense fase 2: alta de cuenta, ads.txt, consentimiento y colocación en páginas | Full-stack | 🟡 Media | 3 pts |
| T-PROD-010 | ✅ Selector de horóscopo: carrusel móvil con nombres completos (occidental + chino) | Frontend | 🟠 Alta | 2 pts |
| T-PROD-011 | ✅ Ocultar y bloquear notificaciones tras feature flag + sincronizar el enum | Frontend | 🟠 Alta | 1.5 pts |
| T-PROD-012 | ✅ Fail-fast de SMTP en producción (hoy el fallback a jsonTransport es silencioso) + Reply-To | Backend | 🟠 Alta | 1 pt |
| T-PROD-013 | ✅ Página de contacto: la dirección pública `contacto@auguria.com` no existe (dominio equivocado) | Frontend | 🔴 Crítica | 0.5 pt |
| T-PROD-014 | ✅ Formulario de contacto: enviar de verdad (endpoint + EmailService); hoy los mensajes se pierden | Full-stack | 🟠 Alta | 3 pts |
| T-PROD-015 | **Reset de contraseña no envía nada**: usuarios sin recuperación de cuenta + métodos huérfanos | Backend | 🔴 Crítica | 3 pts |
| T-PROD-016 | **Alertas de costo al admin sin plantilla**: si el gasto de los proveedores se dispara, nadie se entera | Backend | 🟠 Alta | 1 pt |
| T-PROD-017 | ✅ Geocoding: el `User-Agent` que enviamos a Nominatim declara un email inexistente (riesgo de bloqueo silencioso) | Backend | 🟠 Alta | 0.5 pt |
| T-PROD-018 | ✅ Sin `robots.txt` ni `sitemap.xml`, staging indexable y la imagen social (`og-image.png`) no existe | Frontend | 🔴 Crítica | 2 pts |

---

### T-PROD-001: Migrar Mercado Pago a Producción

**Prioridad:** 🔴 Crítica
**Estimación:** 1 punto
**Dependencias:** dominio productivo del backend y frontend definidos (HTTPS). Idealmente después de T-PROD-004 (para tener el email del negocio).
**Cubre Hallazgo:** PROD-001
**Tipo:** Ops/Config (sin PR, salvo el paso 6 opcional)

#### ✅ Paso a paso

1. **Obtener credenciales productivas reales:**
   - [ ] Ingresar al [panel de desarrolladores de MP](https://www.mercadopago.com.ar/developers/panel) con la cuenta **real** que va a cobrar (no la de prueba).
   - [ ] En la aplicación → *Credenciales de producción*: si nunca se activó, completar el flujo "Ir a producción" (datos del negocio, industria, sitio web).
   - [ ] Copiar el **Access Token productivo** (`APP_USR-...` de la cuenta real).
2. **Configurar el webhook productivo:**
   - [ ] Panel → *Webhooks* → modo **Producción** → URL: `https://<api-productiva>/api/v1/webhooks/mercadopago`.
   - [ ] Suscribir los tópicos **Pagos** (`payment`) y **Suscripciones** (`subscription_preapproval`) — el endpoint único procesa ambos.
   - [ ] Copiar la **clave secreta** generada por el panel.
3. **Actualizar las variables de entorno del backend productivo:**
   ```bash
   NODE_ENV=production
   MP_ACCESS_TOKEN=APP_USR-<token-de-la-cuenta-real>
   MP_WEBHOOK_SECRET=<secret-del-panel>          # OBLIGATORIO: sin él, prod rechaza TODOS los webhooks
   BACKEND_URL=https://<api-productiva>          # reemplaza el túnel ngrok
   FRONTEND_URL=https://<frontend-productivo>    # back_urls de retorno del checkout
   CORS_ORIGIN=https://<frontend-productivo>
   ```
4. **Confirmar el precio real** de la suscripción Premium: hoy $2.999 ARS/mes hardcodeado en `preapproval-plan.constants.ts:5`. Si cambia, actualizar la constante (mini-PR backend).
5. **Verificación post-deploy:**
   - [ ] Compra real de monto bajo de un servicio holístico → confirmar en logs que llega el webhook, `validateSignature` devuelve `true` y la compra pasa a estado pagado.
   - [ ] Alta y cancelación de una suscripción Premium real → estado del usuario actualizado.
   - [ ] Las back_urls (`/servicios/pago-exitoso`, `/servicios/pago-pendiente`, `/servicios/pago-fallido`, `/premium/activacion`) resuelven en el dominio productivo.
6. **(Opcional, mini-PR backend):** eliminar la variable muerta `MP_PREAPPROVAL_PLAN_ID` del `.env` productivo y su sección de `.env.example` (ningún código de `src/` la lee), **o** crear una tarea futura para que `create-preapproval.use-case.ts` use un plan real de MP (en ese caso, correr `npm run mp:create-plan` con el token productivo — los planes son por cuenta).
7. **Seguridad:** las credenciales de prueba quedaron en el `.env` local; no reutilizarlas. Producción idealmente con vault de secretos (o variables del proveedor de hosting), nunca `.env` plano en el repo.

#### 🎯 Criterios de Aceptación

- Un pago real de compra y una suscripción real se procesan de punta a punta con firma de webhook validada.
- Sin el secret configurado, el arranque/operación en producción no acredita pagos silenciosamente (comportamiento fail-safe ya implementado).

---

### T-PROD-002: Fix Header Móvil (Logo en el Flujo Flex) — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA (variante A — logo al flujo flex)
**Prioridad:** 🟠 Alta
**Estimación:** 1 punto
**Dependencias:** ninguna
**Cubre Hallazgo:** PROD-002
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)

#### ✅ Tareas específicas

- [x] En [Header.tsx:54-56](../frontend/src/components/layout/Header.tsx#L54-L56), quitar el centrado absoluto del logo en móvil y devolverlo al flujo flex (variante A elegida por el Delta — el `justify-between` reserva su ancho y el overlap desaparece en cualquier viewport):
  ```tsx
  <Link href="/" className="flex-shrink-0">
    <span className="text-primary font-serif text-xl font-semibold sm:text-2xl">Auguria</span>
  </Link>
  ```
- [x] Ajustar el orden visual: en móvil el logo queda junto a la hamburguesa (izquierda); verificado el espaciado.
- [x] Complemento a la variante A: se compactaron los botones de auth en [UserMenu.tsx](../frontend/src/components/layout/UserMenu.tsx) (`size="sm"` con `sm:h-9 sm:px-4`, `gap-1.5 sm:gap-2`) para reducir el ancho en móvil. **No** se ocultó "Iniciar sesión" ni se aplicó la variante B (el Delta eligió mantener ambos botones visibles).
- [x] Tests: se añadieron asserts a [Header.test.tsx](../frontend/src/components/layout/Header.test.tsx) (ausencia de `absolute`/`-translate-x-1/2` y presencia de `flex-shrink-0` en el logo) y a [UserMenu.test.tsx](../frontend/src/components/layout/UserMenu.test.tsx) (botones auth compactos `sm:h-9`).
- [x] Verificación manual responsive en 320 / 360 / 390 / 430 px (Playwright + medición de bounding boxes). Overlap logo/botones resuelto en todos los viewports.

> **Nota de verificación (320px):** el overlap reportado quedó resuelto en 320-430px. A 360px+ (todos los móviles reales; iPhone SE = 375px) los 4 elementos entran con holgura. A exactamente 320px (iPhone 5/SE-1ª gen, ~0-1% del tráfico) los dos botones de auth con texto completo + logo exceden el ancho por ~12px y "Crear cuenta" scrollea ligeramente. **Decisión del Delta:** aceptar as-is (variante A pura, sin ocultar botones).

#### 🎯 Criterios de Aceptación

- [x] Sin superposición logo/botones en ningún viewport ≥ 320 px, autenticado o no.
- [x] El acceso a login sigue disponible en móvil (barra).
- [x] Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `layout/Header.tsx`, `layout/UserMenu.tsx` + tests (`Header.test.tsx`, `UserMenu.test.tsx`).

---

### T-PROD-003: Sincronizar Cartas HQ en el Entorno Deployado

**Estado:** 🔄 Parte de código ✅ COMPLETADA (PR) — pasos de Ops pendientes de ejecución en Railway
**Prioridad:** 🟠 Alta
**Estimación:** 1 punto
**Dependencias:** acceso a la DB y al pipeline de deploy del entorno
**Cubre Hallazgo:** PROD-003
**Tipo:** Ops + PR (migración de la enciclopedia + docs)

> ⚠️ **El paso a paso original quedó desactualizado.** El diagnóstico del repo encontró tres cosas
> que cambian el procedimiento; los pasos de abajo ya están corregidos:
>
> 1. El `Dockerfile` del frontend **ya copia `public/`** (`frontend/Dockerfile:43`), así que el
>    pitfall clásico de `output: 'standalone'` no aplica. Las 79 WebP están trackeadas en git.
> 2. **`npm run migration:run` no se puede correr en el contenedor deployado**: el script usa
>    `ts-node` sobre `src/config/data-source.ts`, y la imagen de producción no copia `src/` ni
>    conserva las devDependencies (`npm prune --omit=dev`). No hace falta: `src/config/typeorm.ts`
>    tiene **`migrationsRun: true`**, o sea que **el backend aplica las migraciones solo, al arrancar**.
> 3. **Faltaba una migración.** La enciclopedia usa otra tabla (`encyclopedia_tarot_cards`, columna
>    `image_url`) y la migración existente solo cubría `tarot_card`. El commit `f596e2c9` pasó la seed
>    data de la enciclopedia a WebP locales pero nunca creó la migración, y el seeder es idempotente
>    por omisión (si la tabla ya tiene filas, no las toca). Sin esa migración, un entorno sembrado
>    antes de `f596e2c9` sigue con URLs de Wikimedia en la enciclopedia y `next/image` las rechaza.

#### ✅ Paso a paso

1. **Diagnóstico del estado actual del entorno deployado:**
   - [ ] DB (tiradas): `SELECT "imageUrl" FROM tarot_card WHERE name = 'El Loco';` → ¿`/images/tarot/the-fool.webp` o una URL de wikimedia?
   - [ ] DB (enciclopedia): `SELECT "image_url" FROM encyclopedia_tarot_cards WHERE slug = 'the-fool';` → puede dar tres cosas: `/images/tarot/the-fool.webp` (sano), una URL de wikimedia, o `/images/tarot/major/00-the-fool.jpg` (path legacy de TASK-302, archivo inexistente → 404). La migración corrige los tres.
   - [ ] Assets: `GET https://<frontend>/images/tarot/the-fool.webp` → ¿200 o 404?
2. **Deploy del frontend PRIMERO.** La build ya incluye las 78 WebP de `frontend/public/images/tarot/` (el Dockerfile copia `public/`; verificado). Con esto los assets quedan servidos **antes** de que la DB cambie.
3. **Deploy del backend (aplica las migraciones automáticamente al bootear).** No se corre ningún comando: al arrancar, TypeORM aplica las pendientes —
   `1776400000000-MigrateCardImagesToLocalWebP` (tabla `tarot_card`, 78 UPDATEs) y
   `1776800000000-MigrateEncyclopediaCardImagesToLocalWebP` (tabla `encyclopedia_tarot_cards`, derivada del slug, idempotente).
   ⚠️ **Por eso el orden importa:** desplegar el backend es lo que dispara la migración. Si el backend arranca antes de que el frontend nuevo tenga los assets → 404. Si el frontend nuevo va sin la migración → next/image **rechaza** wikimedia (`remotePatterns: []`) y las cartas se ven rotas. Ventana mínima = frontend primero, backend inmediatamente después.
4. **Verificación:** repetir el paso 1 (debe dar path local + 200) y navegar una tirada, la carta del día y varias fichas de la **enciclopedia**, con caché del navegador vacía. Ojo: las fichas de la enciclopedia usan los mismos assets `/images/tarot/*.webp`; `/images/enciclopedia/` son solo las imágenes de hub/hero, hardcodeadas en el frontend.
5. **(PR):** [x] migración `1776800000000-MigrateEncyclopediaCardImagesToLocalWebP` + [x] actualizar [IMAGE_OPTIMIZATION.md](../frontend/docs/IMAGE_OPTIMIZATION.md), que documentaba `remotePatterns` con `upload.wikimedia.org` y contradecía el `next.config.ts` actual.

#### 🎯 Criterios de Aceptación

- Todas las superficies (tiradas, carta del día, historial, enciclopedia) muestran las WebP locales en el entorno deployado, sin 404 ni errores de next/image.

#### 📝 Notas técnicas

- **Resto pendiente (menor):** `tarot-decks.data.ts:41` todavía tiene una URL de Wikimedia para la tapa del mazo (`tarot_deck.imageUrl`). Hoy es dato muerto —ningún componente del frontend la renderiza— por eso no se tocó. Si alguna vez se muestra el mazo, hay que migrarla también o `next/image` la va a rechazar.
- La migración de la enciclopedia deriva la URL del `slug` (`'/images/tarot/' || slug || '.webp'`) en una única sentencia, con `WHERE image_url IS DISTINCT FROM` ese valor canónico: es idempotente (no hace nada si el entorno ya estaba sano) y NULL-safe. Se verificó que los 78 slugs coinciden exactamente con los 78 nombres de archivo WebP.
- **Ojo, la seed data de la enciclopedia tuvo TRES estados, no dos.** Además de las URLs de Wikimedia (TASK-323), hubo un estado previo (TASK-302) con paths locales **con subcarpeta**: `/images/tarot/major/00-the-fool.jpg`. Esos archivos no existen (el directorio es plano, `<slug>.webp`), así que dan 404 aunque `next/image` los acepte por ser locales. Por eso el `WHERE` compara contra el valor canónico en vez de usar un `NOT LIKE '/images/tarot/%'`, que dejaría ese estado sin corregir. El paso 1 del diagnóstico debe distinguir los tres.

---

### T-PROD-004: Email del Dominio — Porkbun (recibe) + Resend (envía) — ✅ COMPLETADA

**Estado:** ✅ **COMPLETADA** (2026-07-12) — infraestructura de email operativa y verificada de punta a punta.
**Prioridad:** 🟠 Alta
**Estimación:** 1 punto
**Dependencias:** acceso a la cuenta de Porkbun donde está `auguriatarot.com`
**Cubre Hallazgo:** PROD-004
**Tipo:** Ops/Infra (sin PR)

> ### ⚠️ Arquitectura revisada — el plan original de esta tarea era inviable
>
> El plan original (mandar los emails del backend por el SMTP de la casilla Porkbun) **lo prohíbe el
> propio Porkbun**, en el aviso *Bulk / Transactional Email Notice* de su panel de email:
>
> > *"Porkbun's email service is **not intended for the sending of bulk or automated transactional
> > email**."*
>
> No es solo entregabilidad: es su política de uso. Un buzón de registrar no es una plataforma de envío
> (IP compartida con otros clientes, límites pensados para una persona escribiendo mails, y **cero
> visibilidad de bounces/quejas** — el día que un reset de contraseña no llega, no hay log que mirar).
>
> **Arquitectura elegida: Porkbun recibe, Resend envía.**
>
> | Pieza | Dirección | Proveedor |
> |---|---|---|
> | Buzón humano (consultas de clientes; se lee y se responde) | `consultas@auguriatarot.com` | Casilla paga de Porkbun (IMAP real) |
> | Remitente transaccional del backend | `noreply@auguriatarot.com` | Resend, vía su **relay SMTP** |
> | Alias (`hola@`, `pagos@`, `flavia@`) | → reenvían a `consultas@` | Forwarding gratis de Porkbun (20 incluidos) |
>
> **Sigue siendo cero código.** El `EmailModule` ya usa `@nestjs-modules/mailer` sobre SMTP puro
> ([email.module.ts](../backend/tarot-app/src/modules/email/email.module.ts)), y Resend expone un relay
> SMTP — entra en las mismas 5 variables (`SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM`) sin tocar el módulo.
> Resend da DKIM propio, log por envío y webhooks de bounce, y su free tier (3.000 emails/mes, 100/día,
> 1 dominio) cubre de sobra el volumen del MVP.
>
> *(Porkbun sugiere Mailchimp en ese mismo aviso: no aplica — Mailchimp es marketing masivo, no el
> transaccional de una app.)*
>
> ### ⚠️ Mito a no repetir: **no** hay que fusionar dos SPF en uno
>
> Resend **no toca el SPF ni el MX de la raíz**: pone su SPF y su MX de feedback en el subdominio
> `send.auguriatarot.com` (su dominio Envelope-From), y su DKIM en `resend._domainkey.auguriatarot.com`,
> con selector propio. Los MX/SPF/DKIM de Porkbun quedan intactos en la raíz. Conviven sin pisarse.
> **Lo único compartido es el DMARC** (uno solo, en la raíz).

#### 💰 Costo

| Ítem | Costo |
|------|-------|
| Casilla `consultas@auguriatarot.com` | **US$3/mes/inbox, billed yearly = US$36/año** (verificado en el panel; **el trial de 15 días que menciona su KB no se ofreció** para este dominio) |
| Alias de forwarding (`hola@`, `pagos@`, `flavia@`) | **gratis** (20 incluidos; adicionales US$3/año c/u) |
| Resend | **US$0** (free tier); Pro US$20/mes si se superan 3.000/mes o 100/día |

> El forwarding **solo recibe, no envía**: para *responderle* a un cliente desde una dirección del dominio
> hace falta la casilla paga. Por eso `consultas@` es casilla y no alias.

#### ✅ Paso a paso

**Fase 1 — Porkbun: el buzón humano (completarla y verificarla ANTES de tocar Resend)**

1. [x] Panel → *Domain Management* → `auguriatarot.com` → icono de sobre (columna **EMAIL**).
2. [x] Bloque **Porkbun Email Hosting** → *Add Hosted Email Account* → **Add to Cart** → checkout (US$36/año).
3. [x] Con la compra hecha, crear la casilla `consultas` con su password. **Anotar ese password aparte**: es el de la *casilla*, no el de la cuenta Porkbun.
4. [x] Porkbun agrega sus **MX** en la raíz al activar el servicio. En el panel de email, habilitar **DKIM y DMARC** si no vienen encendidos. Si el DNS quedara inconsistente, el panel tiene un botón **Fix DNS**.
5. [x] Verificar que **recibe**: mandar un mail desde Gmail a `consultas@auguriatarot.com` y abrirlo en el **webmail** de Porkbun.
6. [x] Verificar que **envía**: responder desde el webmail y confirmar que llega a Gmail (anotar si cae en spam).
7. [x] Crear los alias de forwarding gratis: `hola@` y `pagos@` (notificaciones de MercadoPago/Railway) → `consultas@`; `flavia@` → el mail de Flavia. **No** crear un forward para `consultas@` (chocaría con la casilla).

> **⚠️ Gmail web ya no puede leer la casilla.** Google discontinuó el fetch por POP3 en Gmail.com en
> **enero de 2026** (aviso en el panel de Porkbun). Para leer `consultas@`: el webmail de Porkbun, un
> cliente IMAP de escritorio (Thunderbird) o la app móvil de Gmail. **Sí** se puede seguir *enviando* como
> `consultas@` desde Gmail con "Enviar como" + SMTP.
>
> Settings ([KB](https://kb.porkbun.com/article/146-email-client-configuration-settings)): IMAP
> `imap.porkbun.com:993` (SSL/TLS) · SMTP `smtp.porkbun.com:587` (STARTTLS) o `:465` (TLS implícito) ·
> usuario = la dirección completa.

**Fase 2 — Resend: el remitente transaccional**

8. [x] Crear cuenta en [resend.com](https://resend.com) → *Domains* → **Add Domain** → `auguriatarot.com` (raíz), eligiendo la región de envío más cercana.
9. [x] Resend muestra los registros a cargar. Copiarlos **del panel, en el momento** (varían por región y cuenta — **no** copiarlos de esta doc). La forma que tienen es:

   | Tipo | Host | Valor | Nota |
   |------|------|-------|------|
   | `MX` | `send` | `feedback-smtp.<región>.amazonses.com` (prio 10) | **No es el MX de la raíz.** No pisa a Porkbun. |
   | `TXT` | `send` | `v=spf1 include:amazonses.com ~all` | SPF del Envelope-From, **separado** del SPF raíz de Porkbun. |
   | `TXT` | `resend._domainkey` | clave pública DKIM | Selector propio → no choca con el DKIM de Porkbun. |

10. [x] Cargarlos en Porkbun → *DNS Records*. **No tocar los MX ni el TXT de SPF de la raíz.**
11. [x] Esperar propagación y darle **Verify** en Resend hasta que el dominio quede `Verified`.
12. [x] Crear una **API Key** en Resend (*API Keys*, con permiso de envío). Es el `SMTP_PASS`.

**Fase 3 — DMARC (uno solo, compartido)**

13. [x] En Porkbun → *DNS Records*, dejar **un único** TXT en `_dmarc` (si el paso 4 ya creó uno, **editarlo**, no agregar otro):
    ```
    v=DMARC1; p=none; rua=mailto:consultas@auguriatarot.com
    ```
    Arrancar en `p=none` (monitorear sin bloquear). Cuando los reportes confirmen que Porkbun y Resend autentican bien, subirlo a `p=quarantine`.

**Fase 4 — Backend productivo (Railway)**

14. [x] Cargar las variables (host/puerto/usuario de Resend son **fijos**; ver [docs de SMTP de Resend](https://resend.com/docs/send-with-smtp)):
    ```bash
    SMTP_HOST=smtp.resend.com
    SMTP_PORT=587                          # STARTTLS. El módulo hace secure:true solo si el puerto es 465.
    SMTP_USER=resend                       # literal, NO es un email
    SMTP_PASS=re_xxxxxxxxxxxx              # la API Key de Resend
    EMAIL_FROM=noreply@auguriatarot.com    # el dominio debe estar Verified en Resend
    FRONTEND_URL=https://<frontend-productivo>   # los links de reset salen de acá
    ```
15. [x] Redeploy del backend.

**Fase 5 — Verificación**

> **⚠️ Ojo: esta tarea NO se puede verificar con "registro" ni "reset de contraseña".** Al ejecutarla se
> descubrió que **nadie llama** a `sendWelcomeEmail` ni a `sendPasswordResetEmail` — el reset imprime el
> link en la consola del servidor y le miente al usuario. Ver **T-PROD-015**. Configurar el SMTP no
> arregla eso: son dos problemas distintos. T-PROD-004 valida el **transporte**; T-PROD-015 conecta los
> **flujos**.

16. [x] En los logs de arranque, el warning `⚠️ Email configuration is incomplete... TEST MODE with jsonTransport` **ya no aparece**.
17. [x] **Test directo del transporte** (script temporal con `nodemailer`, espejando la config de `email.module.ts`: `secure: port === 465`): `transport.verify()` acepta las credenciales y `sendMail()` devuelve `250`.
18. [x] El mail de prueba llega a Gmail **a bandeja de entrada** (no spam), y en *Mostrar original* los **tres** dan `PASS`: SPF, **DKIM firmado con `auguriatarot.com`** y DMARC.
19. [x] Dashboard de Resend → *Logs*: el envío figura como `Delivered` (esta visibilidad es justamente lo que el SMTP de Porkbun no daba).
20. [x] Enviar un mail a [mail-tester.com](https://www.mail-tester.com) por el relay de Resend → score ≥ 9/10, con SPF, DKIM y DMARC en verde.
21. [ ] *(opcional, diagnóstico)* Repetir el mail-tester **desde el webmail de Porkbun** (`consultas@`): valida la otra mitad del DNS, que es independiente. Se espera un score menor al de Resend por el DKIM que Porkbun no firma.
22. [x] Una vez todo en verde, **volver el DMARC a `p=quarantine`** (durante la migración estuvo en `p=none`). ✅ verificado con `dig`.

#### 🎯 Criterios de Aceptación

- [x] Los emails transaccionales salen de `noreply@auguriatarot.com` vía Resend y llegan a **bandeja de entrada** (no spam) en Gmail/Outlook.
- [x] El módulo de email del backend deja de operar en `jsonTransport` en producción.
- [x] `consultas@auguriatarot.com` recibe **y responde** correctamente (buzón humano operativo).
- [x] SPF, DKIM y DMARC pasan en verde para **ambos** caminos (Resend y Porkbun), con un único registro DMARC.

#### 🔬 Evidencia de la verificación (2026-07-12)

| Check | Resultado |
|---|---|
| Transporte SMTP (`verify()` + `sendMail()` con la config de `email.module.ts`) | ✅ credenciales aceptadas, `250 OK` |
| Mail de prueba en Gmail | ✅ **bandeja de entrada**, entregado en 1 s |
| SPF / DKIM / DMARC (Gmail → *Mostrar original*) | ✅ los tres `PASS`, **DKIM firmado con `auguriatarot.com`** |
| Resend → Logs | ✅ `POST /emails` → `200` |
| **mail-tester (vía Resend)** | ✅ **10/10** |
| Railway (producción): warning de `jsonTransport` en el boot | ✅ **no aparece** → el módulo tomó las variables |
| Railway: arranque | ✅ `Modo: Production`, `Nest application successfully started`, 0 warnings, 0 errores |
| DNS: MX/SPF/DKIM de Porkbun tras cargar Resend | ✅ intactos (verificado con `dig`) |

#### 📝 Hallazgos durante la ejecución (2026-07-12)

- 🔴 **El reset de contraseña no manda nada** → **T-PROD-015**. El hallazgo más importante de la tarea: configurar el SMTP no le sirve a ningún usuario final hasta que esto se cablee.
- ⚠️ **`ADMIN_EMAIL_COST_ALERTS` no estaba seteada** (ni declarada en `env.validation.ts`). Sin ella, `ai-provider-cost.service.ts` loguea un warning y **no manda la alerta**: si el gasto de IA se dispara en producción, nadie se entera. Se cargó en Railway apuntando a `consultas@auguriatarot.com`. **Debería declararse en `env.validation.ts`** (candidata a sumarse a T-PROD-012).
- ❓ **DKIM saliente de Porkbun: sin resolver.** Gmail (*Mostrar original*) **no mostró línea de DKIM** en el mail enviado desde el webmail — solo SPF `PASS` y DMARC `PASS`, es decir, DMARC apoyado en un solo pilar (frágil: un reenvío rompe el SPF y no queda nada que lo sostenga). Pero **mail-tester le dio 10/10 con "correctamente autenticado" en verde**. Las dos observaciones se contradicen: o el firmado se activó más tarde (posiblemente al usar *Configure DMARC*, con propagación diferida), o mail-tester es menos estricto que Gmail. **Queda por confirmar** re-enviando desde el webmail a Gmail y mirando si aparece la línea de DKIM. **No es bloqueante en ningún caso**: el DKIM que usa la app es el de Resend (selector `resend`), independiente de este, y sacó 10/10 con los tres `PASS`. **Cuidado con el botón *Fix DNS*** — regenera los registros de email hosting y puede pisar el `_dmarc` editado a mano.
- ⚠️ **El `_dmarc` que crea el botón *Configure DMARC* de Porkbun sale con `p=quarantine`** y con los reportes (`rua`/`ruf`) apuntando a una dirección de MXToolbox a la que el Delta **no tiene acceso**. Durante la migración se bajó a `p=none`; al terminar se restauró a `p=quarantine` y se agregó `mailto:consultas@auguriatarot.com` al `rua` para tener visibilidad propia.
- ⚠️ **Hay un `CNAME *.auguriatarot.com`** (parking de Porkbun) que tapaba `send.auguriatarot.com`. Al crear registros explícitos en `send`, el wildcard dejó de aplicar sobre ese nombre (verificado con `dig`). Si Resend alguna vez falla al verificar, **el wildcard es el primer sospechoso**.
- ⚠️ **Con el SMTP cargado, el entorno local manda mails REALES.** Antes corría en `jsonTransport` (inofensivo). Un seed o un test de integración con datos reales ahora le escribe a personas reales y consume la cuota de Resend. **Las credenciales quedan comentadas en el `.env` local**; descomentar solo para pruebas puntuales.
- **Precio real:** US$3/mes/inbox billed yearly = **US$36/año**. El trial de 15 días que menciona la KB de Porkbun **no se ofreció**. Resend: US$0 (free tier: 3.000/mes, 100/día).

#### 🔗 Tareas derivadas

- **T-PROD-015** 🔴 (reset de contraseña que no envía nada): **sin esto, T-PROD-004 no le sirve a ningún usuario final.** El transporte queda perfecto y ningún mail de auth sale igual.
- **T-PROD-012** (fail-fast de SMTP en producción): el fallback silencioso a `jsonTransport` hace que un typo en una variable de Railway deje a todos los usuarios sin emails, con la app aparentemente sana. Conviene mergearla **antes** del cutover de esta tarea.
- **T-PROD-014** (formulario de contacto): depende del SMTP que habilita esta tarea.

---

### T-PROD-005: Dorso Final de las Cartas (Imagen WebP) — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA
**Prioridad:** 🟡 Media
**Estimación:** 1.5 puntos
**Dependencias:** imagen del dorso aportada por Ariel
**Cubre Hallazgo:** PROD-005
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)

#### ✅ Tareas específicas

- [x] **Optimizar el asset:** WebP generado en `frontend/public/images/tarot/card-back.webp` (591×960, 53 KB, dentro del target 20-60 KB). El asset conserva **íntegra** la imagen original (788×1280 ≈ 197:320), sin relleno ni recorte.
- [x] **Ajustar la proporción de la carta al dorso:** `sizeClasses` pasa de altura fija (`w-32 h-48`, `w-40 h-60`, `w-48 h-72` → 2:3) a **solo ancho** (`w-32`, `w-40`, `w-48`) + `CARD_ASPECT_CLASS` (`aspect-[197/320]`), la proporción real del dorso. Ver nota de decisión abajo.
- [x] **Reemplazar el patrón CSS** de `TarotCard.tsx`: los divs decorativos (marco + mandala geométrica + esquinas) se sustituyeron por `<Image src={CARD_BACK_IMAGE_SRC} alt="" fill sizes={imageSizes[size]} className="object-cover" />` dentro de `data-testid="card-back"`. Se conservaron `rounded-xl`, `shadow-lg`, `bg-secondary` (fallback de carga) y `[backface-visibility:hidden]`; se añadió `overflow-hidden` para que la imagen respete el radio.
- [x] **Skeletons alineados a la nueva proporción** (evitan layout shift): `app/tarot/lectura/page.tsx`, `app/ritual/lectura/page.tsx` y `DailyCardExperience.tsx` reutilizan `CARD_ASPECT_CLASS` en lugar de `h-60 w-40` / `h-72 w-48`.
- [x] **Unificar el dorso:** el dorso vive **solo** en `TarotCard.tsx`. `CardThumbnails.tsx` **no requiere cambios** — únicamente renderiza cartas boca arriba (`card.imageUrl` de `CardPreview`), nunca dorsos. El resto de vistas con cartas boca abajo (`ReadingExperience`, `DailyCardExperience`, `ReadingDetail`, `SharedReadingView`) reutilizan `TarotCard`, por lo que heredan el dorso automáticamente. Se exportó `CARD_BACK_IMAGE_SRC` como única fuente de verdad del path.
- [x] **Preservar contrato de tests:** `data-testid="card-back"` intacto. Se reescribió el bloque `Card Back Design` de `TarotCard.test.tsx` (5 tests: src del asset, `alt=""` decorativo, `object-cover`, mismo dorso en `sm`/`lg`, dorso presente con carta no revelada). `smoke.test.tsx` sigue pasando sin cambios.
- [x] NO se tocó `reversedImageUrl` ni la DB — el dorso es un asset estático del frontend.
- [x] Verificación visual con Playwright sobre el componente real (sm/md/lg, grid de 12 cartas y animación de flip dorso→frente): dorso completo, nítido y sin deformación en todos los tamaños; asset servido 200 y sin errores de consola.

> **Nota de decisión (proporción de la carta):** la imagen original (788×1280 ≈ 197:320) es un dorso con marco dorado a sangre, mientras que los contenedores de carta eran 2:3. Ninguna de las dos opciones dentro de un 2:3 era aceptable: con `object-cover` se recortaba ~4% arriba y abajo, **cortando las líneas horizontales del marco dorado**; con relleno lateral aparecían barras negras (**descartado por el Delta**). Solución elegida: **darle a la carta la proporción del dorso** (`aspect-[197/320]`, expuesta como `CARD_ASPECT_CLASS`), de modo que el dorso se muestra íntegro sin barras ni recorte. Efecto colateral **positivo**: los frentes del mazo (300×527 ≈ 1:1.76, más altos que el contenedor) pasan de perder ~15% vertical por `object-cover` a perder solo ~8%. Las cartas quedan levemente más altas en toda la app; los skeletons se ajustaron en consecuencia.

#### 🎯 Criterios de Aceptación

- [x] Todas las cartas boca abajo muestran la imagen final del dorso, nítida y sin deformación en todos los tamaños.
- [x] Ciclo de calidad frontend completo pasa (format, lint 0 errores, type-check, 5181 tests, build, validate-architecture).

#### 📁 Archivos involucrados

- `frontend/public/images/tarot/card-back.webp` (nuevo), `readings/TarotCard.tsx`, `readings/TarotCard.test.tsx`. `CardThumbnails.tsx` sin cambios (no renderiza dorsos).

---

### T-PROD-006: Mezcla de Cartas Server-Side (Backend)

**Prioridad:** 🔴 Crítica
**Estimación:** 3 puntos
**Dependencias:** ninguna (pero coordinar el merge con T-PROD-007)
**Cubre Hallazgo:** PROD-006
**Tipo:** Backend (`docs/WORKFLOW_BACKEND.md`)
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] **Crear `DeckShufflerService`** (capa domain/application del módulo readings) con Fisher-Yates sobre `crypto.randomInt` (patrón ya presente en `reading-share.service.ts`; NO usar `Math.random` para identidad):
  ```ts
  import { randomInt } from 'crypto';
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  ```
- [x] **Cambiar el contrato de `POST /readings`:** el cliente deja de enviar la identidad (`cardIds`); envía `spreadId`, `deckId`, la cantidad/posiciones elegidas y (opcional) metadatos de UX. ⚠️ Es un cambio deliberado del contrato — documentarlo en `API_DOCUMENTATION.md` y versionar el DTO (`CreateReadingDto`): eliminar/deprecar `cardIds` y la orientación client-side.
- [x] **En [create-reading.use-case.ts](../backend/tarot-app/src/modules/tarot/readings/application/use-cases/create-reading.use-case.ts) (hoy línea 101):** obtener el pool elegible según plan (preservar `validateDeckAccess`: FREE = solo Arcanos Mayores), mezclar con `DeckShufflerService`, tomar `spread.cardCount` cartas y asignarlas a las posiciones.
- [x] **Mover `isReversed` al backend** con `crypto` (hoy `Math.random() < 0.3` en el cliente): mantener la probabilidad de negocio (30 %) en una constante.
- [x] **Limpiar `random-cards.dto.ts`** (código muerto de la intención original): eliminarlo o reutilizarlo como base del nuevo contrato.
- [x] **Tests (TDD):** con RNG mockeado — determinismo bajo seed fija, variabilidad entre lecturas, respeto del pool FREE (nunca sale un Arcano Menor), distribución de `isReversed`, y que `cardIds` enviados por un cliente malicioso son ignorados/rechazados. Modelo a seguir: `daily-reading.service.spec.ts:537` (`selectRandomCard`).
- [x] Respuesta del endpoint: debe devolver las cartas asignadas (identidad + orientación + posición) para que el frontend las revele.

> **Notas de implementación:** El pool se obtiene con `cardsService.findByDeck(deckId)`
> filtrando `category === 'arcanos_mayores'` para FREE/ANÓNIMO (PREMIUM = mazo
> completo). `DeckShufflerService.decideReversed()` usa `crypto.randomInt(100)`
> contra `REVERSED_PROBABILITY = 0.3`. La orientación y la posición se construyen
> en el use-case (`spread.positions[i].name`) y se persisten en `cardPositions`.
> Guard adicional: si el pool < `spread.cardCount` se lanza `NotFoundException`.
> ⚠️ **Merge coordinado con T-PROD-007** (contrato roto hasta que el front se adapte).

#### 🎯 Criterios de Aceptación

- La identidad y orientación de cada carta se decide exclusivamente en el backend con aleatoriedad criptográfica.
- Un cliente no puede predecir ni forzar qué carta recibe (manipular el POST no altera la asignación).
- Usuarios FREE solo reciben Arcanos Mayores. Coverage ≥ 80 %.

#### 📁 Archivos involucrados

- `readings/application/use-cases/create-reading.use-case.ts`, nuevo `DeckShufflerService` (+ spec), `dto/create-reading.dto.ts`, `dto/random-cards.dto.ts` (eliminar/reciclar), `docs/API_DOCUMENTATION.md`.

---

### T-PROD-007: Mezcla de Cartas — Adaptar el Frontend

**Prioridad:** 🔴 Crítica
**Estimación:** 2 puntos
**Dependencias:** T-PROD-006 (nuevo contrato del endpoint)
**Cubre Hallazgo:** PROD-006
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] **[ReadingExperience.tsx:404-415](../frontend/src/components/features/readings/ReadingExperience.tsx#L404-L415):** eliminar la derivación `cardId = index + 1` y el `isReversed` client-side; el grid boca abajo pasa a ser un gesto de UX (el usuario elige N posiciones) y la identidad llega en la **respuesta** de `createReading` (revelación con los datos del backend).
- [x] ~~**useTarotDeck.ts:54:** mezclar visualmente los índices~~ — **descartado (con criterio):** con el sorteo independiente del backend, la identidad ya no depende de la posición del grid (el Fool no está en ningún lugar fijo), y las cartas boca abajo son visualmente idénticas → el shuffle client-side no tiene efecto observable. Se omite para no agregar complejidad/superficie de test sin beneficio.
- [x] **Actualizar el DTO/tipos** de `CreateReadingDto` en `types/` (quitado `cardIds`/`cardPositions` y el tipo `CardPositionDto`); el hook de mutación (`useCreateReading`) usa el nuevo contrato sin cambios.
- [x] **Tests:** corregido `ReadingExperience.test.tsx` (ya no asume `cardId = index + 1`; verifica que el DTO no lleva `cardIds`/`cardPositions`) y adaptados `readings-api.test.ts` y `useReadings.test.tsx`. `useTarotDeck.test.ts` no requiere cambios (el hook no se modificó).
- [ ] **Verificación E2E manual:** dos tiradas idénticas seleccionando las mismas posiciones deben revelar cartas distintas; la animación de revelado sigue fluida. *(pendiente de ejecutar por el usuario con backend+front de esta rama levantados — GATE C)*

#### 🎯 Criterios de Aceptación

- La UX de selección se mantiene (elegir cartas boca abajo, revelar), pero las cartas reveladas provienen del backend.
- Ciclo de calidad frontend completo pasa.

> **Nota de merge:** PR **apilado** sobre `feature/T-PROD-006-...` (base del PR = rama de 006). Al mergear 006 a `develop`, GitHub reapunta la base de este PR a `develop` y queda solo el diff de frontend. Mergear 006 primero.

#### 📁 Archivos involucrados

- `readings/ReadingExperience.tsx`, `hooks/api/useTarotDeck.ts`, `hooks/api/useReadings.ts` (mutación), `types/reading.types.ts` + tests.

---

### T-PROD-008: AdSense Fase 1 — `AdSlot` + Carga Condicional por Plan — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA
**Prioridad:** 🟡 Media
**Estimación:** 3 puntos
**Dependencias:** ninguna (puede desarrollarse con un client ID de prueba; el ID real llega en T-PROD-009)
**Cubre Hallazgo:** PROD-007
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)

#### ✅ Tareas específicas

- [x] **Crear la feature `components/features/ads/`** con dos client components:
  - [x] `AdSenseScript.tsx`: monta el loader oficial con `next/script` (`strategy="afterInteractive"`, `crossOrigin="anonymous"`, `src=".../adsbygoogle.js?client=<NEXT_PUBLIC_ADSENSE_CLIENT>"`). Devuelve `null` si el usuario es premium, si `!_hasHydrated`, o si la env var no está seteada (kill-switch para dev/staging).
  - [x] `AdSlot.tsx`: renderiza el `<ins className="adsbygoogle">` con `data-ad-client`/`data-ad-slot`/formato responsive + `useEffect` que encola `window.adsbygoogle.push({})` una sola vez (`useRef`, sin doble push en re-render, con `try/catch` para no romper la página si el loader no está). Mismo gating. `window.adsbygoogle` tipado con una declaración global en [adsense.types.ts](../frontend/src/types/adsense.types.ts) (sin `any`).
- [x] **Gating (regla de negocio):** centralizado en el hook nuevo [useAdsEnabled](../frontend/src/hooks/utils/useAdsEnabled.ts), que compone `useUserPlanFeatures` + `_hasHydrated` del `authStore` + env var + rutas excluidas. Un premium **jamás** ve un anuncio ni un flash (ni siquiera se descarga `adsbygoogle.js`).
- [x] **Env var nueva:** `NEXT_PUBLIC_ADSENSE_CLIENT` documentada en `frontend/.env.example` (vacía = ads apagados; se trimea, así que un valor en blanco también apaga).
- [x] **Montar `AdSenseScript` en [app/layout.tsx](../frontend/src/app/layout.tsx)** dentro de `AuthProvider` (necesita el plan hidratado).
- [x] **Excluir zonas:** implementado como regla **dura** en `useAdsEnabled` vía `usePathname()` — ni el script ni los slots se activan bajo `/admin/**`, `/premium/**` (incluye `/premium/activacion`) ni en rutas que contengan `/pago` (checkout de servicios y retornos `pago-exitoso`/`pago-fallido`/`pago-pendiente`). Así la exclusión no depende de recordarla al colocar slots en T-PROD-009.
- [x] **Tests:** 35 tests nuevos (17 del hook + 6 `AdSenseScript` + 12 `AdSlot`), 100 % de cobertura en los 3 archivos nuevos. Cubren: no renderizar para premium / sin hidratar / sin env var / en zonas excluidas; sí renderizar para anónimo y Free; atributos del `<ins>`; push único a la cola.

#### 🎯 Criterios de Aceptación

- [x] Con la env var seteada: anónimos y Free ven slots; Premium nunca (ni flash). Sin env var: cero rastro de AdSense.
- [x] Ciclo de calidad frontend completo pasa (format, lint, type-check, 5217 tests, build, validate-architecture).

#### 📁 Archivos involucrados

- `features/ads/AdSenseScript.tsx`, `features/ads/AdSlot.tsx`, `features/ads/index.ts` (+ tests), `hooks/utils/useAdsEnabled.ts` (+ test), `types/adsense.types.ts`, `types/index.ts`, `app/layout.tsx`, `frontend/.env.example`.

#### 📝 Notas de implementación

- **Ningún `AdSlot` está colocado todavía en ninguna página** — la colocación es el paso 4 de T-PROD-009. Fase 1 entrega la infraestructura + el gating.
- **Copy premium "Sin publicidad" NO se agregó** (sigue siendo el paso 5, opcional, de T-PROD-009): mientras no haya slots colocados, un Free no ve anuncios y prometer "sin publicidad" sería una promesa vacía (regla FBK-005). Los tests `PremiumBenefitsSection.test.tsx` y `UpgradeModal.test.tsx` mantienen el guard `not.toContain('publicidad')`, con el comentario actualizado para que apunte a T-PROD-009 en vez de decir "no hay sistema de ads".
- El `slotId` de `AdSlot` es un `string` (identificador del panel de AdSense, no un ID de entidad de la app — la regla de "IDs numéricos" no aplica).

---

### T-PROD-009: AdSense Fase 2 — Alta, ads.txt, Consentimiento y Colocación

**Prioridad:** 🟡 Media
**Estimación:** 3 puntos
**Dependencias:** T-PROD-008 + dominio productivo activo con contenido indexable (Google revisa el sitio) + T-PROD-004 (email para la cuenta)
**Cubre Hallazgo:** PROD-007
**Tipo:** Full-stack + Ops

#### ✅ Paso a paso

1. **Alta en AdSense (Ops):**
   - [ ] Crear la cuenta en [adsense.google.com](https://adsense.google.com) con el email del negocio y registrar el dominio productivo.
   - [ ] Verificar la propiedad del sitio y esperar la aprobación (días a semanas; requiere contenido real indexable — la enciclopedia juega a favor).
   - [ ] Obtener el `ca-pub-XXXXXXXX` real → setear `NEXT_PUBLIC_ADSENSE_CLIENT` en producción.
2. **`ads.txt` (mini-PR frontend):** crear `frontend/public/ads.txt` con la línea que provee AdSense (`google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0`).
3. **Consentimiento (UE/GDPR):**
   - [ ] Activar **Privacy & messaging** en el panel de AdSense (CMP certificado de Google, se auto-inyecta con el loader) — vía recomendada frente a construir un banner propio.
   - [ ] Actualizar el texto placeholder de [privacidad/page.tsx](../frontend/src/app/privacidad/page.tsx) con la divulgación real de cookies/AdSense.
4. **Colocación de `AdSlot` (PR frontend, dentro de componentes de feature — regla "no lógica en `app/`"):**
   - [ ] Prioridad 1 — públicas de alto tráfico SEO: fichas de `/enciclopedia/**`, `/horoscopo/**` y `/horoscopo-chino/**` (in-article), `LandingPage`.
   - [ ] Prioridad 2 — app autenticada Free: `UserDashboard`, `/historial`, resultado de tiradas.
   - [ ] Moderación: 1-2 slots por página, nunca interrumpiendo la actividad principal (formularios, revelación de cartas) ni cerca de CTAs de pago.
5. **Producto (opcional):** sumar "Sin publicidad" a los beneficios de `/premium` (`premium-benefits.ts`) — ahora sería una promesa real; respeta la regla de FBK-005 (no prometer lo que no se entrega).
6. **Verificación:** con un usuario free y una ventana anónima, confirmar impresiones reales en el panel de AdSense; con un premium, confirmar en la pestaña Network que `adsbygoogle.js` ni siquiera se descarga.

#### 🎯 Criterios de Aceptación

- Cuenta aprobada, `ads.txt` accesible en `https://<dominio>/ads.txt`, mensaje de consentimiento operativo en UE.
- Anuncios reales visibles para anónimos/Free en las páginas definidas; Premium 100 % libre de ads.

---

### T-PROD-010: Selector de Horóscopo — Carrusel Móvil con Nombres Completos — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA
**Prioridad:** 🟠 Alta
**Estimación:** 2 puntos
**Dependencias:** ninguna
**Cubre Hallazgo:** PROD-008
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)

#### ✅ Tareas específicas

> **ALCANCE (aclarado por el Delta durante la revisión):** el bug es **solo de móvil**. En desktop el selector se ve bien y **no se toca**. El carrusel aplica únicamente por debajo de `lg:`; en `lg:` se restaura la fila de 12 columnas original.

- [x] Prop `variant?: 'grid' | 'carousel'` (default `'grid'`) en `ZodiacSignSelector` y `ChineseAnimalSelector`. En `'carousel'`, **en móvil**, el contenedor es un flex de una sola fila con scroll horizontal **intencional** (`flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-2`) y cada tarjeta recibe ancho fijo (`w-28 shrink-0 snap-start`) en vez de depender de una columna del grid. Se usó `w-28` (112px) y no `w-24`: "Capricornio" (el nombre más largo) no entraba en 96px. En `lg:` el mismo contenedor vuelve a `lg:grid lg:grid-cols-12 lg:gap-4` y las tarjetas a `lg:w-auto lg:shrink`: **desktop queda idéntico a `develop`** (verificado: mismas 12 columnas y mismos anchos de tarjeta — 67px @1024, 89px @1280, 110px @1868).
- [x] Prop `compact` en `ZodiacSignCard` y `ChineseAnimalCard`: `p-3`, símbolo `text-3xl` y nombre `text-sm leading-tight break-words`, **todo revertido en `lg:`** (`lg:p-4`, `lg:text-4xl`, `lg:text-lg lg:leading-normal lg:break-normal`) para no alterar desktop. El look de las páginas de listado también queda intacto (sin `compact` siguen en `p-4` / `text-4xl` / `text-lg`).
- [x] En [horoscopo/[sign]/page.tsx](../frontend/src/app/horoscopo/[sign]/page.tsx) y [AnimalHoroscopePage.tsx](../frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx), reemplazado el wrapper `overflow-x-auto` + el override `!grid-cols-6 lg:!grid-cols-12` por `variant="carousel"`. El layout ahora vive dentro del selector (dueño de su propio layout), no en la página.
- [x] **Extra no previsto:** en el carrusel móvil (una sola fila) la tarjeta **seleccionada quedaba fuera de pantalla** (Leo es la 5ª, Cabra la 8ª): el usuario no veía cuál estaba activa. Se centra automáticamente con el hook compartido [useScrollSelectedIntoView](../frontend/src/hooks/utils/useScrollSelectedIntoView.ts) — compartido a propósito: el bug de abajo habría que arreglarlo dos veces si cada selector tuviera su copia.
- [x] **Los listados también se arreglan** (`/horoscopo`, `/horoscopo-chino`): recortaban los mismos nombres en 320–430px (ver tabla en PROD-008). El look de la tarjeta se unificó en `DENSITY_CLASSES`: arranca compacta y recupera el tamaño original en cuanto hay ancho. Lo único que cambia entre densidades es **dónde** está ese punto — `md:` para la grilla (ahí ya hay 4 columnas anchas) y `lg:` para el carrusel (sus tarjetas miden 112px fijos hasta ahí). Tablet y desktop no cambian.
- [x] `hyphens-auto` en el nombre (el `<html lang="es">` ya estaba, que es lo que habilita el guionado): a 320px "Capricornio" no entra ni en `text-sm`, y sin esto el navegador partía la palabra al medio ("Capricorni/o"). Ahora guiona bien ("Capricor-nio"). De 360px en adelante entra en una línea.
- [x] Tests unitarios: clases de carrusel vs grid, preservación del `lg:grid-cols-12` de desktop, `compact`, nombres completos, y un **guard de regresión** de que no se usa `scrollIntoView` (ver nota abajo).
- [x] **Tests e2e** ([tests/e2e/horoscope-selector.spec.ts](../frontend/tests/e2e/horoscope-selector.spec.ts) + script `test:e2e`; estrena la infra de Playwright que ya estaba configurada y sin usar). Motivo: jsdom no tiene motor de layout, así que los tests unitarios **solo pueden afirmar clases de Tailwind** y no habrían detectado **ninguno** de los dos bugs de layout de esta tarea. El e2e verifica en navegador real: ningún nombre recortado en móvil, `window.scrollX === 0`, tarjeta seleccionada a la vista, y desktop sin scroll.

#### 🎯 Criterios de Aceptación

- [x] Los 12 nombres se leen completos en móvil (320–430px), en el horóscopo **occidental y chino**, tanto en el **detalle** como en el **listado**.
- [x] El scroll horizontal del selector es intencional (una fila), no un desborde del grid.
- [x] **Desktop queda exactamente como estaba** (no era parte del bug; el Delta pidió no tocarlo).
- [x] Ciclo de calidad frontend completo pasa (5270 unit tests) + 16 tests e2e propios (37 en total en la suite).

> **⚠️ Deuda abierta — el e2e NO corre en CI.** El script `test:e2e` es nuevo y `playwright.config.ts` levanta su propio `webServer`, pero ningún job de `.github/workflows/` ejecuta el Playwright del **frontend** (el `npm run test:e2e` de `ci.yml` es el del backend). Consecuencia: la red que atrapa exactamente esta clase de bug —recortes de layout y desplazamiento de página, los dos que se escaparon a 5270 unit tests— **no está enchufada**: si alguien reintroduce el `scrollIntoView`, CI sigue en verde. **Queda como tarea aparte** (agregar un step con `npx playwright install --with-deps chromium` + `npm run test:e2e -- --project=chromium` al job de frontend); no se hizo acá para no meter cambios de CI en un PR de bugfix.

> **🔴 Regresión detectada en la revisión (y corregida):** el auto-scroll se implementó primero con `card.scrollIntoView({ inline: 'center' })`. Por spec, `scrollIntoView` desplaza **todas** las cajas scrolleables ancestras, **incluida la del documento**: como el `body` tiene desborde horizontal preexistente (T-PROD-002), la página entera cargaba corrida hacia la derecha (`window.scrollX` = 19px a 320px, **64px a 768px**). Se reemplazó por escritura directa de `scrollLeft` sobre el contenedor, que no toca ancestros. Queda un test unitario que falla si alguien vuelve a introducir `scrollIntoView`, y un e2e que verifica `window.scrollX === 0`.

> **Nota de verificación (320px):** a 320px el `body` sigue desbordando ~19px, pero **no lo causa el selector**: se midió el mismo `scrollWidth=339` en la home (sin selector), en el listado (sin carrusel) y en el detalle, y coincide exactamente con el `scrollWidth` del `header`. Es el desborde preexistente que ya documentó T-PROD-002 y que el Delta aceptó as-is.

> **Hallazgo lateral (fuera de alcance, NO se tocó):** el grid de desktop recorta nombres cuando la ventana es angosta — a 1280px se recortan 5 (Géminis, Escorpio, Sagitario, Capricornio, Acuario) y a 1024px once de doce; a 1868px solo roza "Capricornio", por eso en monitores grandes no se percibe. Es preexistente en `develop` y el Delta decidió no tocar desktop en esta tarea. Candidato a hallazgo propio si alguna vez molesta.

#### 📁 Archivos involucrados

- `hooks/utils/useScrollSelectedIntoView.ts` (nuevo, compartido por ambos horóscopos).
- `features/horoscope/ZodiacSignSelector.tsx`, `ZodiacSignCard.tsx` + tests.
- `features/chinese-horoscope/ChineseAnimalSelector.tsx`, `ChineseAnimalCard.tsx`, `AnimalHoroscopePage.tsx` + tests.
- `app/horoscopo/[sign]/page.tsx`.
- `tests/e2e/horoscope-selector.spec.ts` (nuevo) + script `test:e2e` en `package.json`.

---

### T-PROD-011: Ocultar y Bloquear Notificaciones (Feature Flag) + Sincronizar el Enum — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA
**Prioridad:** 🟠 Alta
**Estimación:** 1.5 puntos
**Dependencias:** ninguna
**Cubre Hallazgo:** PROD-009
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)

#### ✅ Tareas específicas

**(a) Ocultar y bloquear (sin borrar código):**

- [x] Feature flag `NEXT_PUBLIC_NOTIFICATIONS_ENABLED`, **opt-in** (`=== 'true'`): por defecto **apagado**. Se leyó dentro del render (patrón de `useAdsEnabled`/`AdSlot`, T-PROD-008) y no como constante de módulo, para que sea testeable con `vi.stubEnv`.
- [x] En [Header.tsx](../frontend/src/components/layout/Header.tsx), el render pasa a `{user && isNotificationsEnabled && <NotificationBell />}`. Al no montarse `NotificationBell`, sus hooks de React Query no corren → **cero peticiones** a `/notifications*` (esto es el "bloquear": no alcanza con ocultarlo por CSS).
- [x] Variable documentada en `frontend/.env.example` (apagada, con nota de que la feature existe y puede reactivarse).
- [x] **No se borró** nada: componentes, hooks, API, tipos y tests de notificaciones siguen en el repo.

**(b) Fix del crash (aplica igual, para cuando se reactive):**

- [x] `NotificationType` sincronizado con el enum autoritativo del backend: agregados `SACRED_EVENT_REMINDER` y `PATTERN_INSIGHT` con su entrada en `NOTIFICATION_TYPE_INFO`. Los tres tipos sin productor (`reading_shared`, `system`, `promotion`) quedan como reservados y documentados como tales.
- [x] Nuevo helper `getNotificationTypeInfo()` en [notification.types.ts](../frontend/src/types/notification.types.ts) con fallback genérico (`🔔 Notificación`) para tipos desconocidos, y [NotificationItem.tsx](../frontend/src/components/features/notifications/NotificationItem.tsx) pasa a usarlo en vez de indexar el `Record` directo. Sin `any`: el lookup se tipa como `Partial<Record<NotificationType, NotificationTypeInfo>>`.
- [x] Tests (TDD): flag off/on en `Header` (incluido "no se llama a `useUnreadCount`"), `NotificationItem` no crashea ante un tipo desconocido, y un bloque de **paridad con el enum del backend**. Se corrigió el test `should have exactly 5 notification types`, que era justamente el que fijaba el enum incompleto.

> **Corrección honesta (marcada en la revisión):** el bloque de "paridad" **no es un guard automático**. La lista de tipos del backend está *hardcodeada* en el test del frontend, así que si el backend agrega un tipo nuevo, este test **sigue en verde** hasta que alguien actualice la lista a mano — que es exactamente el olvido que causó el bug. Se dejó así a propósito (acoplar un unit test del frontend a un archivo del workspace del backend es peor), pero la red de seguridad real en runtime es el **fallback** de `getNotificationTypeInfo()`, no el test. Sirve como documentación ejecutable del contrato, no como candado.

#### 🎯 Criterios de Aceptación

- [x] Ningún usuario ve la campana, y no se dispara ninguna petición a `/notifications*` (verificado en navegador real interceptando el tráfico de red: 0 requests).
- [x] Con el flag encendido, la campana vuelve a funcionar y ningún tipo de notificación del backend crashea el dropdown.
- [x] El código de la feature sigue en el repo.
- [x] Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `layout/Header.tsx` + `Header.test.tsx`.
- `types/notification.types.ts`, `features/notifications/NotificationItem.tsx` + tests.
- `frontend/.env.example`.

> **Nota (fuera de alcance):** el cron backend de eventos sagrados sigue escribiendo notificaciones en la DB para usuarios premium aunque la UI esté oculta. Son filas inertes (nadie las lee) y no justifican tocar el backend ahora. Si la feature se descarta definitivamente, crear una tarea aparte para desactivar el cron.

---

### T-PROD-012: Fail-Fast de SMTP en Producción + Reply-To — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA (2026-07-12)
**Prioridad:** 🟠 Alta
**Estimación:** 1 punto
**Dependencias:** ninguna (pero cobra sentido junto con T-PROD-004)
**Origen:** hallazgo al revisar la arquitectura de email de T-PROD-004
**Tipo:** Backend (`docs/WORKFLOW_BACKEND.md`)

> 📌 **Alcance ampliado por decisión del Delta:** la tarea absorbe los **dos hallazgos aparcados**
> que T-PROD-015 y T-PROD-016 dejaron marcados como *"candidata a sumarse a T-PROD-012"*
> (`FRONTEND_URL` y `ADMIN_EMAIL_COST_ALERTS`). Los tres agujeros son la misma falla:
> **una variable mal cargada en Railway no rompe nada, solo apaga los emails en silencio.**

#### 📋 Problema

[email.module.ts:21-36](../backend/tarot-app/src/modules/email/email.module.ts#L21-L36) hace **fallback silencioso** a `jsonTransport` si falta **cualquiera** de las 5 variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`). En producción es un modo de fallo peligroso: un typo en una variable de Railway y la app **arranca perfecta**, loguea un `logger.warn` que nadie lee, y **ningún usuario recibe su reset de contraseña**. El bug es invisible hasta que un cliente reclama.

Las 5 variables están declaradas `@IsOptional()` en [env.validation.ts:217-240](../backend/tarot-app/src/config/env.validation.ts#L217-L240), así que la validación de entorno tampoco lo detiene.

Segundo problema, menor: el módulo no setea `replyTo`. Si un cliente le responde a `noreply@auguriatarot.com` (y muchos lo hacen), el mail se pierde.

#### ✅ Tareas específicas

- [x] El `useFactory` de `MailerModule` se **extrajo** a [mailer.config.ts](../backend/tarot-app/src/modules/email/mailer.config.ts) (`createMailerOptions`): inline dentro del decorador era **imposible de testear**. `email.module.ts` queda en 17 líneas.
- [x] **Fail-fast:** si `NODE_ENV === 'production'` y la config SMTP está incompleta → **lanza** al arranque, con un error que **nombra las variables que faltan**. Fuera de producción se conserva el fallback a `jsonTransport` + warning (los tests y el dev local dependen de él).
- [x] `defaults: { from, replyTo: EMAIL_REPLY_TO ?? from }` y `EMAIL_REPLY_TO` declarada en `env.validation.ts` con el mismo `@Matches` de email que `EMAIL_FROM`. Valor productivo: `consultas@auguriatarot.com`.
- [x] Bloque `template` **fuera del `if`**: la rama de `jsonTransport` ahora también configura el `HandlebarsAdapter`, así un `.hbs` roto se detecta corriendo los tests y no en producción.
- [x] **Bug encontrado al extraer el factory:** `secure: smtpPort === 465` comparaba **string con number** (`ConfigService` devuelve `'465'`, porque `SMTP_PORT` es `@IsPort()` = string). El resultado era **siempre `false`**: en el puerto 465 se habría intentado conectar **sin TLS implícito**. Hoy no explota solo porque Resend usa 587. Corregido con `Number(...)` y cubierto por test.
- [x] Tests: fail-fast por cada una de las 5 variables, el error nombra todas las faltantes, `jsonTransport` en `development` y `test`, transporte real, `secure` solo en 465, y `replyTo` con y sin `EMAIL_REPLY_TO`. **+27 tests** en total sobre la suite (4511 → 4538).
- [x] `.env.example` y [EMAIL_SETUP.md](../backend/tarot-app/docs/EMAIL_SETUP.md) reescritos: el doc seguía hablando de Mailtrap, de `tarotflavia.com` y de que las variables eran "opcionales" — contradecía el fail-fast.

**Hallazgos aparcados que esta tarea cierra:**

- [x] **`FRONTEND_URL` (venía de T-PROD-015):** tiene default, así que class-validator **nunca** la marcaba como faltante. En producción, sin ella los links de **todos** los emails salían apuntando a `localhost` sin un solo error en los logs. Ahora `validate()` ([env-validator.ts](../backend/tarot-app/src/config/env-validator.ts)) **falla el boot** en producción si no está seteada **o si apunta a localhost/127.0.0.1**.
- [x] **`ADMIN_EMAIL_COST_ALERTS` (venía de T-PROD-016):** no estaba declarada en `env.validation.ts`, así que un typo pasaba sin ruido y las alertas de costo quedaban mudas. Declarada y validada como email.

#### 🎯 Criterios de Aceptación

- [x] En `NODE_ENV=production`, arrancar sin SMTP completo **falla el boot** con un mensaje claro, en vez de simular silenciosamente que los emails se envían.
- [x] En dev/test, el comportamiento actual (jsonTransport + warning) se conserva intacto.
- [x] Las respuestas a `noreply@` aterrizan en el buzón humano (`replyTo` en los `defaults` del mailer).
- [x] Ciclo de calidad backend completo pasa: format, lint (0 errores), **4511 tests**, coverage **84.77%**, build y `validate-architecture.js`.

#### 🔍 Ronda de revisión (hallazgos aplicados en un 2º commit)

El revisor encontró **tres cosas importantes** que el primer commit tenía mal. Todas verificadas y
corregidas con TDD (test primero, en rojo, antes del fix):

- [x] 🟠 **`EMAIL_REPLY_TO=""` tumbaba el boot en TODOS los entornos.** `@IsOptional()` de
      class-validator saltea `undefined` pero **no** el string vacío, así que dejar la variable
      vacía —la forma habitual de desactivarla, y la que el propio `.env.example` promueve para
      otras— hacía fallar el `@Matches`. Era una **regresión** introducida por esta misma tarea.
      Corregido con el `@Transform` que ya protegía a `SMTP_PORT`. Ídem `ADMIN_EMAIL_COST_ALERTS`.
- [x] 🟠 **`FRONTEND_URL` sin esquema pasaba el guard.** Se validaba "no vacía" y "no localhost",
      pero no el formato: con `FRONTEND_URL=www.auguriatarot.com` el boot pasaba y los links de los
      emails salían **rotos, sin un solo error en los logs** — el mismo modo de falla que la tarea
      vino a matar, un escalón más abajo. Ahora se **parsea** con `new URL()` y se compara el
      `hostname` (de paso desaparece el falso positivo de `includes('localhost')`, que habría
      rechazado un host legítimo como `localhost.auguriatarot.com`).
- [x] 🟠 **La red de seguridad sobre los `.hbs` no existía.** El código, el doc y este backlog
      afirmaban que sacar el `template` del `if` hacía que *"un `.hbs` roto se detecte corriendo los
      tests"*. **Era falso**: ningún test renderizaba una plantilla (el `MailerService` está
      mockeado en todos). Ahora [email-templates.spec.ts](../backend/tarot-app/src/modules/email/email-templates.spec.ts)
      monta el `MailerModule` **real** con `jsonTransport` y **renderiza los 8 templates** con el
      contexto que les pasa `EmailService`; con `strict: true`, una variable faltante rompe el test.
      **Este test sí habría detectado el `dist/` sin plantillas de T-PROD-015.**
- [x] 🟡 **El fail-fast corría demasiado tarde.** Vivía en el `useFactory` del `MailerModule`, que se
      instancia **después** de que `TypeOrmModule` conecta y corre las migraciones
      (`migrationsRun: true`): un deploy con SMTP incompleto **habría migrado la base y recién
      después muerto**. Movido a `validate()` ([env-validator.ts](../backend/tarot-app/src/config/env-validator.ts)),
      que corre en `ConfigModule.forRoot`, **antes de tocar la DB**, y ahora reporta **todas** las
      variables faltantes en un solo error (Ops ya no descubre una por deploy). El throw del factory
      se conserva como red de seguridad: el `EmailModule` se monta standalone en los e2e, sin esa
      validación.
- [x] 🟡 Aserción tautológica (`expect(adapter).toBeDefined()` sobre una constante de módulo) →
      `toBeInstanceOf(HandlebarsAdapter)` + chequeo del `dir`.
- [x] 💡 Guard de `NaN` en `SMTP_PORT` y `replyTo` también en los defaults de `jsonTransport`.

#### 🔬 Verificación contra el build (no solo tests)

Aplicando la lección de T-PROD-015 (*"el ciclo de calidad no cubre el envío real: ts-jest corre desde
`src/`"*), los caminos se ejercitaron **sobre `dist/`**, no solo en Jest:

| Caso | Resultado |
| --- | --- |
| `NODE_ENV=production` sin SMTP | ❌ el boot **muere** (exit 1) nombrando las 5 variables faltantes |
| `NODE_ENV=production` con `FRONTEND_URL` en localhost o sin esquema | ❌ el boot **muere** (exit 1) nombrando `FRONTEND_URL` |
| `NODE_ENV=production` con ambos problemas | ❌ **un solo error con todo**, y **sin llegar a conectar la base** |
| `NODE_ENV=development` sin SMTP | ✅ warning + `jsonTransport`, la app sigue arrancando (sin regresión) |

> ⚠️ **Acción de Ops pendiente al deployar:** setear **`EMAIL_REPLY_TO=consultas@auguriatarot.com`** en
> Railway (opcional, pero sin ella las respuestas de los clientes caen en `noreply@`, que nadie lee).
> Las 5 SMTP, `FRONTEND_URL` y `ADMIN_EMAIL_COST_ALERTS` ya están cargadas desde T-PROD-004 — si
> alguna se hubiera perdido, **ahora el deploy falla en vez de callarse**, que es exactamente el punto.

---

### T-PROD-013: La Dirección Pública de la Página de Contacto No Existe — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA (2026-07-12)
**Prioridad:** 🔴 Crítica (dirección rota de cara al público; el fix es trivial)
**Estimación:** 0.5 punto
**Dependencias:** ninguna — **no** espera a T-PROD-004
**Origen:** hallazgo al revisar los alias de email de T-PROD-004
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)

#### 📋 Problema

[contacto/page.tsx:55](../frontend/src/app/contacto/page.tsx#L55) publica como dirección de contacto **`contacto@auguria.com`**. Ese dominio **no es el del proyecto** (el dominio real es `auguriatarot.com`) y esa casilla **no existe**. Todo cliente que le escriba recibe un rebote — o, peor, el mail le llega a quien sea que tenga registrado `auguria.com`.

Es un resto del rebrand: el mismo dominio equivocado aparece también en el `README.md` (`soporte@auguria.com`, `seguridad@auguria.com`).

#### ✅ Tareas específicas

- [x] [contacto/page.tsx](../frontend/src/app/contacto/page.tsx): `contacto@auguria.com` → **`consultas@auguriatarot.com`** (la casilla real, creada en T-PROD-004). Además ahora es un `mailto:` clickeable, no texto plano.
- [x] Barrido del repo por el dominio equivocado. Corregido lo **publicado**: la página de contacto y el `README.md` (`soporte@` y `seguridad@` → `consultas@auguriatarot.com`; ninguno de esos dos alias existe en Porkbun, así que apuntar al buzón real). Tras el review, también los 3 fixtures de test del frontend que mockeaban `test@auguria.com` (`AdSenseScript.test.tsx`, `AdSlot.test.tsx`, `useAdsEnabled.test.ts`) → `test@example.com` (dominio reservado por RFC 2606). El frontend queda con **cero** `auguria.com`.
- [x] Dirección extraída a una constante única: `CONFIG.CONTACT_EMAIL` en [lib/constants/config.ts](../frontend/src/lib/constants/config.ts), para que no vuelva a divergir.
- [x] Tests: la página de contacto renderiza la dirección correcta, la expone como `mailto:` y **no** contiene ninguna `@auguria.com`; [config.test.ts](../frontend/src/lib/constants/config.test.ts) fija el buzón y su dominio.

#### 🎯 Criterios de Aceptación

- [x] Ninguna dirección de un dominio que no sea `auguriatarot.com` queda publicada en el frontend. Verificado en el HTML prerenderizado de `/contacto` (0 ocurrencias de `auguria.com`); el único email en `src/` fuera de tests es la constante, el resto son placeholders `tu@email.com` de los formularios.
- [x] Ciclo de calidad frontend completo pasa: format, lint (0 errores), type-check, 5291 tests, build y `validate-architecture.js`.

#### 📌 Fuera de alcance (decisión del Delta — hallazgo derivado en **T-PROD-017**)

El barrido encontró más `auguria.com` **no publicados** al usuario, que este PR **no** toca para mantenerlo Frontend puro:

- 🟠 **Backend, funcional:** [geocode.service.ts](../backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.ts) manda `User-Agent: Auguria/1.0 (contact@auguria.com)` a **Nominatim**, cuya política de uso exige un email de contacto **válido** para poder avisar antes de bloquear. Hoy es inexistente → **derivado a T-PROD-017** (3 usos + 2 tests).
- 🟡 **Placeholders y ejemplos** (sin impacto en runtime): `.env.example`, `system-config.entity.ts` (`example:` de Swagger), `docs/modules/birth-chart/*`, ADRs y `create-mp-preapproval-plan.ts`. Los dos primeros entran en **T-PROD-017**; la documentación histórica queda como está.

---

### T-PROD-014: El Formulario de Contacto No Envía Nada — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA (2026-07-12)
**Prioridad:** 🟠 Alta
**Estimación:** 3 puntos
**Dependencias:** **T-PROD-004** (necesita el SMTP real andando) + T-PROD-012 (deseable)
**Origen:** hallazgo al revisar los alias de email de T-PROD-004
**Tipo:** Full-stack (backend + frontend)

#### 📋 Problema

El formulario de contacto **valida** (Zod: `name`, `email`, `subject`, `message` — [contact.schemas.ts](../frontend/src/lib/validations/contact.schemas.ts)) pero **no envía**. El `onSubmit` de [ContactForm.tsx:50-55](../frontend/src/components/features/contact/ContactForm.tsx#L50-L55) es un `TODO` y **no existe endpoint de contacto en el backend**. La propia página lo admite con un `DisclaimerBanner`:

> *"Este formulario es funcional pero el envío de correos aún no está implementado. Los mensajes se muestran en la consola del navegador."*

Es decir: **los mensajes de los clientes se pierden en la consola del navegador.** Un usuario completa el form, ve el mensaje de éxito, y nadie recibe nada.

#### ✅ Tareas específicas

**Backend:**
- [x] Endpoint público `POST /contact` (sin `JwtAuthGuard`) en el nuevo módulo `contact` (`contact.controller.ts` → `send-contact-message.use-case.ts`), con `SendContactMessageDto` espejando el schema Zod del frontend (2-100 / email / 5-200 / 10-2000).
- [x] **Rate limiting**: `@RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 })` + `@Throttle({ default: { limit: 3, ttl: 3600000 } })` — 3 mensajes/hora por IP, igual que `auth/forgot-password`.
- [x] Nuevo template `contact-message.hbs` + `EmailService.sendContactMessageEmail()`: envía al buzón de contacto con `replyTo` = **email del visitante**, que **pisa** el default global (`EMAIL_REPLY_TO`) — sin eso, responder el mensaje sería responderse a sí misma.
- [x] **Nueva variable `CONTACT_EMAIL_TO`**, obligatoria en producción (el boot falla si falta, misma política que las SMTP de T-PROD-012). Fuera de producción cae a `EMAIL_REPLY_TO` / `EMAIL_FROM`.
- [x] El envío **relanza** si el SMTP falla (a diferencia de las alertas de costo): el use-case devuelve 500 y loguea remitente + asunto, para que el mensaje pueda rescatarse del log.
- [x] Tests: use-case, controller (delegación, endpoint público, 400 de validación) y el **429 real** montando `ThrottlerGuard` con supertest; `EmailService` (destinatario, replyTo, fallbacks, error); render del template (incluido el escape de HTML del cuerpo, que lo escribe un desconocido sin auth).
- [x] **Endurecimiento**: el asunto rechaza saltos de línea (`@Matches(/^[^\r\n]+$/)`) — viaja a una cabecera del email y un `\n` permitiría inyectar un `Bcc:` desde un endpoint público.

**Frontend:**
- [x] `API_ENDPOINTS.CONTACT.BASE` en `lib/api/endpoints.ts` + `lib/api/contact-api.ts`.
- [x] Hook `useSendContactMessage` (TanStack Query, `useMutation`) cableado en el `onSubmit` de `ContactForm`: `isPending` deshabilita el formulario, el error muestra el `Alert` y el 429 avisa del límite en vez del error genérico. Ante un error **no** se limpia el formulario (el usuario reintenta sin volver a escribir).
- [x] **Eliminado el `DisclaimerBanner`** de `contacto/page.tsx` y los `TODO` de la página y del componente.
- [x] Tests: envío real al backend, éxito (toast + reset), error de red, 429, botón deshabilitado mientras envía y rehabilitado tras el error. La página fija que el disclaimer **ya no** está.

#### 🎯 Criterios de Aceptación

- [x] Un mensaje enviado desde la página de contacto **llega a `CONTACT_EMAIL_TO`** (`consultas@auguriatarot.com` en producción), y responderlo contesta directamente al cliente (gracias al `replyTo`).
- [x] El endpoint resiste un flood: pasado el límite, responde 429. Verificado contra la app real: 3×200 y el 4.º con `429 / retryAfter: 3600`.
- [x] La página ya no muestra el disclaimer de "no implementado".
- [x] Ciclos de calidad completos: backend (format, lint, 4567 tests, coverage 84.6%, build, validate-architecture) y frontend (format, lint 0 errores, type-check, 5301 tests, build, validate-architecture).

#### 🔒 Hallazgo del review: el rate limit era esquivable (arreglado en esta misma tarea)

El revisor encontró que **el límite de todos los endpoints públicos era decorativo**, no solo el de contacto: `custom-throttler.guard.ts` armaba el tracker con el **primer** elemento del `X-Forwarded-For`, que es justamente el que escribe el cliente. Mandando `X-Forwarded-For: 1.2.3.<random>` en cada request se obtenía un tracker nuevo cada vez y **el 429 no llegaba a dispararse nunca** — ni en `login`, ni en `register`, ni en `forgot-password`. Con el formulario de contacto el costo sube: un anónimo podía mail-bombear el buzón y quemar la cuota de SMTP (riesgo de suspensión de la cuenta de Resend).

Se arregló acá (y no en una tarea aparte) porque sin esto el criterio de aceptación "el endpoint resiste un flood" era **falso**:

- [x] `main.ts`: la app se crea como `NestExpressApplication` y se configura **`trust proxy`** ([trust-proxy.config.ts](../backend/tarot-app/src/config/trust-proxy.config.ts)). Express descarta los saltos confiables y `request.ip` queda en la IP real del cliente, ignorando lo que este haya inventado.
- [x] `custom-throttler.guard.ts`: `getIP()` ya **no** parsea el header a mano — usa `request.ip`. Los dos tests que fijaban el comportamiento vulnerable ("should extract first IP from x-forwarded-for") se reemplazaron por los que fijan el correcto.
- [x] **Nueva variable `TRUST_PROXY_HOPS`** (default 1 = Railway). Es configurable a propósito: el número **tiene que coincidir con la cadena de proxies real**. Demasiado bajo → vuelve el bypass; demasiado alto → `request.ip` pasa a ser la IP del proxy, la misma para todos, y la app **empieza a devolver 429 a usuarios reales**. Si algún día se pone un CDN delante de Railway, es `2`. El valor se loguea en el arranque.
- [x] Test de regresión que **falla contra el código viejo** (verificado): rotar el `X-Forwarded-For` no regala cuota nueva.

#### 🔍 Verificación manual (backend real, dev)

`POST /api/v1/contact` contra el servidor levantado:

- 200 con el mensaje de confirmación y `EmailService` logueando el envío (jsonTransport en dev).
- Asunto con `\n` → **400**.
- **Flood con el `X-Forwarded-For` rotando** (`10.0.0.1..4, <ip real>`): 3×200 y el 4.º **429**. Antes del fix los cuatro pasaban.
- Un cliente real distinto **sigue pudiendo escribir** (200): el fix no colapsó a todos en un único bucket, que era el riesgo de calibrar mal `trust proxy`.

Nota: `127.0.0.1`/`::1` están whitelisteadas por defecto (`ip-whitelist.service.ts`), así que desde localhost sin `X-Forwarded-For` no se ve ningún límite — es el comportamiento de toda la app, no de este endpoint.

> ⚠️ **Acciones de Ops al deployar:**
> 1. Setear **`CONTACT_EMAIL_TO=consultas@auguriatarot.com`** en Railway. **Sin ella el arranque en
>    producción falla** (a propósito): un buzón de contacto sin destinatario es exactamente el bug que
>    esta tarea arregla, y preferimos que se note en el deploy y no en los mensajes perdidos.
> 2. **Confirmar `TRUST_PROXY_HOPS`**: queda en **1** (Railway edge) sin necesidad de setearla. Si hay
>    un CDN/proxy adicional delante, hay que subirla, o los usuarios podrán volver a falsear su IP.

---

### T-PROD-015: El Reset de Contraseña No Envía Nada (Usuarios Sin Recuperación de Cuenta)

**Estado:** ✅ COMPLETADA — **verificada de punta a punta en producción (2026-07-12)**
**Prioridad:** 🔴 **Crítica — bloqueante de lanzamiento**
**Estimación:** 3 puntos
**Dependencias:** T-PROD-004 (necesita el SMTP real andando)
**Origen:** hallazgo al ejecutar T-PROD-004
**Tipo:** Backend (`docs/WORKFLOW_BACKEND.md`) **+ Frontend** (`docs/WORKFLOW_FRONTEND.md`)

> 🚨 **Hallazgo al iniciar la tarea: el problema era más grande que el diagnóstico original.**
> El backlog daba por sentado que bastaba con cablear el email, pero **el frontend no tiene
> ninguna página que consuma el token**. Las rutas son en español y solo existe
> `/recuperar-password` (el formulario que *pide* el mail); no hay pantalla que llame a
> `POST /auth/reset-password`, que sí existe y funciona hace tiempo en el backend.
> Es decir: cableando solo el backend, el mail habría llegado con un link a un **404**, y el
> criterio de aceptación #1 sería imposible de cumplir. Por eso la tarea pasa a cubrir **los dos
> stacks** (dos PRs, uno por stack). Ruta elegida por el Delta: **`/restablecer-password?token=`**
> (en español, separada de `/recuperar-password` para no mezclar dos pantallas distintas).

#### 📋 Problema

[forgot-password.use-case.ts](../backend/tarot-app/src/modules/auth/application/use-cases/forgot-password.use-case.ts):

```ts
// TODO: For now, log the link to console (until real email integration is implemented)
console.log(`/reset-password?token=${token}`);
return {
  message: 'Password reset email sent',              // ← mentira
  token: process.env.NODE_ENV !== 'production' ? token : undefined,
};
```

**En producción, "olvidé mi contraseña" está completamente roto.** El backend genera el token, lo imprime en la consola del servidor, le responde al usuario *"Password reset email sent"* y **no manda ningún mail**. Y como en producción el token tampoco se devuelve, **un usuario que pierde su contraseña queda encerrado afuera de su cuenta, sin ninguna vía de recuperación.**

Configurar el SMTP (T-PROD-004) **no arregla esto**: el transporte queda perfecto y el mail no sale igual, porque nadie lo manda.

El problema es más amplio: **4 de los 9 métodos de `EmailService` son código muerto** — nadie los llama.

| Método | ¿Quién lo llama? |
|---|---|
| `sendPasswordResetEmail` | ❌ **nadie** ← el crítico |
| `sendWelcomeEmail` | ❌ nadie |
| `sendPlanChangeEmail` | ❌ nadie |
| `sendSharedReading` | ❌ nadie |
| `sendQuotaWarningEmail` / `sendQuotaLimitReachedEmail` | ✅ `ai-quota.service.ts` |
| `sendHolisticServiceConfirmation` | ✅ webhook de MP |
| `sendProviderCostWarning/LimitReached` | ✅ `ai-provider-cost.service.ts` |

Es decir: hoy los únicos emails que la app manda de verdad son los de cuota, la confirmación de compra y las alertas de costo al admin. **Todo el correo de la cuenta del usuario (reset, bienvenida, cambio de plan) no existe.**

#### ✅ Tareas específicas — Backend (✅ COMPLETADO)

- [x] **`forgot-password.use-case.ts`**: inyecta `UsersService` + `EmailService` y llama a `sendPasswordResetEmail`; el link se arma sobre `FRONTEND_URL`. **`console.log` del token eliminado** (era una fuga: quedaba escrito en los logs de Railway, que son consultables).
- [x] **El `token` ya no se devuelve en la respuesta HTTP** en ningún entorno. Los tests que lo leían de la respuesta (o del `console.log`) ahora lo obtienen del `EmailService` mockeado — la misma vía que el usuario real: `password-recovery.e2e-spec.ts`, `auth-users.integration.spec.ts` y `email.integration.spec.ts` (estos dos últimos tenían 2 tests en `it.skip` esperando justamente esta tarea; quedaron **habilitados**).
- [x] El mensaje de respuesta es **el mismo exista o no el usuario**: *"Si el email está registrado, recibirás un enlace para restablecer tu contraseña."* Además, si el usuario no existe **ni siquiera se genera un token**, y un fallo de SMTP **no cambia la respuesta** (devolver un 500 solo cuando el usuario existe sería un canal de enumeración).
- [x] **Bienvenida:** `sendWelcomeEmail` cableado en `register.use-case.ts` dentro de try/catch — si el email falla, el alta igual se completa (solo se loguea el error).
- [x] **Huérfanos resueltos:** `sendPlanChangeEmail` cableado a la **activación Premium** del webhook de MP (no crítico: try/catch, el pago ya está acreditado). `sendSharedReading` + `shared-reading.hbs` + `SharedReadingData` **borrados**: la feature de compartir usa link público (`/compartida/[token]`), no email — era código muerto.
- [x] **Marca:** las plantillas `welcome` y `password-reset` decían *"Tarot App"* → **Auguria**; el CTA del mail de bienvenida apuntaba a `href='#'` → ahora a `FRONTEND_URL`.
- [x] Tests: reset envía el mail con el link correcto; el token **no** aparece en la respuesta ni en los logs; el registro sobrevive al fallo del email; la activación Premium notifica y sobrevive al fallo del email.

#### ✅ Tareas específicas — Frontend (✅ COMPLETADO)

- [x] Página `/restablecer-password` (client component con `useSearchParams` dentro de `Suspense`, siguiendo el patrón de `ritual/lectura`): toma el `token` de la query y se lo pasa a `ResetPasswordForm`.
- [x] `ResetPasswordForm`: nueva contraseña + confirmación, con `resetPasswordSchema` que **replica las reglas del backend** (`IsStrongPassword`: mínimo 8 caracteres, una mayúscula y un número; máx. 128).
- [x] Token inválido/expirado/ya usado (400 del backend) → mensaje claro + enlace a `/recuperar-password` para pedir uno nuevo. Enlace **sin** token (se cortó al copiarlo del mail) → tarjeta "Enlace inválido" con el mismo enlace de rescate.
- [x] Al éxito: toast + redirección a `/login`.
- [x] **Bonus (regla de endpoints centralizados):** `ForgotPasswordForm` tenía hardcodeado `'/auth/forgot-password'`. Se agregaron `AUTH.FORGOT_PASSWORD` y `AUTH.RESET_PASSWORD` a `API_ENDPOINTS` y ambos formularios los usan.

##### 🔬 Verificación en navegador real (Chromium, 480 px)

| Escenario | Resultado |
|---|---|
| `/restablecer-password?token=…` | ✅ renderiza el formulario |
| Envío del formulario | ✅ sale `POST /auth/reset-password` con `{"token":"…","newPassword":"…"}` |
| Respuesta 400 (token vencido/usado) | ✅ *"El enlace expiró o ya fue usado…"* + enlace para pedir uno nuevo |
| `/restablecer-password` sin token | ✅ tarjeta "Enlace inválido" |
| Contraseña débil / confirmación distinta | ✅ *"Mínimo 8 caracteres"* / *"Las contraseñas no coinciden"* (no llega al backend) |

#### 🎯 Criterios de Aceptación

- [x] Un usuario que olvida su contraseña recibe el mail, hace clic en el link y **recupera su cuenta**, de punta a punta, en producción. ✅ **verificado en producción el 2026-07-12** (evidencia abajo)
- [x] El token de reset **no** aparece en los logs del servidor ni en ninguna respuesta HTTP.
- [x] Un alta de usuario recibe el mail de bienvenida, y si el envío falla el alta igual se completa.
- [x] `EmailService` no tiene métodos huérfanos (`sendPlanChangeEmail` cableado; `sendSharedReading` borrado con su template).
- [x] Ciclo de calidad backend completo pasa (4474 tests, coverage 84.69%, build y arquitectura OK).

#### 🔬 Hallazgos de la revisión (2026-07-12)

- 🔴 **Los templates `.hbs` nunca llegaban a `dist` → en producción NO salía ningún email con template.**
  `nest build` es tsc puro: no copia assets, y `nest-cli.json` solo declaraba las fuentes de
  `birth-chart`. El `Dockerfile` copia únicamente `dist/`, así que en Railway
  `dist/src/modules/email/templates/` **no existe** → `HandlebarsAdapter` hace `readFileSync` → **ENOENT**
  → `sendMail` rechaza. **Esto afecta a todos los mails con template desde siempre** (cuota de IA,
  confirmación de compra), no solo a los de esta tarea: los llamadores tragan el error y solo lo
  loguean, así que falló en silencio todo este tiempo. **Los tests unitarios no lo veían** porque
  ts-jest corre desde `src/`, donde los templates sí están; T-PROD-004 tampoco, porque validó el
  transporte con un script suelto de nodemailer, sin pasar por el pipeline de templates.
  **Corregido:** glob de assets en `nest-cli.json` + `watchAssets`, y un test de regresión
  (`email-templates.spec.ts`) que falla si el glob se pierde o si falta un template que usa `EmailService`.
- 🟠 **Enumeración de usuarios por *timing*.** El mensaje genérico no alcanzaba: un email registrado
  esperaba la ida y vuelta al SMTP (~1 s) y uno inexistente respondía en ~0 ms. Ese delta es un oráculo
  trivial de medir. **Corregido:** el envío del mail de reset va en segundo plano (`void … .catch()`),
  así la respuesta no depende de si el usuario existe.
- 🟠 **`FRONTEND_URL` tenía como default `http://localhost:3000`, que es el puerto del *backend*.**
  Está declarada con default en `env.validation.ts`, así que `getOrThrow` nunca falla: si Railway no la
  tiene cargada, **los links de todos los emails salen apuntando a localhost y no se registra ningún
  error**. **Corregido** el default a `3001` y descomentada en `.env.example`. **Sigue siendo obligatoria
  en producción** → ✅ **cerrado en T-PROD-012**: en producción el boot falla si no está seteada o si
  apunta a localhost.
- 🟡 Los spies de los tests de integración corrían el envío **real** (`jest.spyOn` sin `mockResolvedValue`):
  con las credenciales de Resend descomentadas en el `.env` local, `npm run test:integration` mandaba
  mails de verdad a direcciones inexistentes (hard bounces + cuota). **Corregido.**
- ❗ **Hallazgo sin resolver → tarea nueva:** `EmailService` referencia los templates
  **`provider-cost-warning` y `provider-cost-limit-reached`, que NO existen** en
  `src/modules/email/templates/`. Las alertas de costo de IA al admin (`ai-provider-cost.service.ts`)
  **nunca pudieron enviarse**, ni siquiera con los templates ya copiados al build: el método atrapa el
  error y no relanza. Es el mismo agujero que denunciaba el hallazgo de T-PROD-004 sobre
  `ADMIN_EMAIL_COST_ALERTS`: si el gasto de IA se dispara, nadie se entera.

#### ✅ Evidencia de la verificación en producción (2026-07-12)

Ejecutada por el Delta sobre el entorno productivo (Railway), con los tres PRs mergeados
(#591 backend, #592 frontend, #593 alertas de costo):

| Paso | Resultado |
|---|---|
| Solicitud de reset desde el sitio productivo | ✅ |
| Mail *"Recuperación de contraseña"* desde `noreply@auguriatarot.com` | ✅ llega a **bandeja de entrada** (no spam) |
| Clic en *"Restablecer Contraseña"* → `/restablecer-password?token=…` | ✅ abre la página en el dominio productivo |
| Cambio de contraseña | ✅ |
| Login con la contraseña nueva | ✅ |

**El flujo de recuperación de cuenta quedó operativo.** Era el bloqueante de lanzamiento: hasta esta
tarea, un usuario que perdía su contraseña quedaba encerrado afuera de su cuenta sin ninguna vía de
recuperación.

> 📌 **Lección para futuras tareas de email:** el ciclo de calidad **no** cubre el envío real. Los tests
> unitarios pasaban con `dist/` sin una sola plantilla, porque ts-jest corre desde `src/`, donde los
> `.hbs` siempre existieron. Cualquier tarea que toque emails debe probarse **contra el build**
> (`npm run build && node dist/src/main`) o directamente en el entorno desplegado.

---

### T-PROD-016: Las Alertas de Costo al Admin No Tienen Plantilla (Nadie Se Entera Si el Gasto Se Dispara) — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA
**Prioridad:** 🟠 Alta
**Estimación:** 1 punto
**Dependencias:** el fix de assets de T-PROD-015 (sin él, las plantillas no llegan al build igual)
**Origen:** hallazgo de la revisión de T-PROD-015
**Tipo:** Backend (`docs/WORKFLOW_BACKEND.md`)

#### 📋 Problema

`ai-provider-cost.service.ts` avisa al admin cuando el gasto mensual de un proveedor llega al 80% y
al 100% del límite. El código está cableado y `EmailService` tiene los dos métodos… pero
**las plantillas `provider-cost-warning.hbs` y `provider-cost-limit-reached.hbs` nunca existieron**.
`sendMail` fallaba con ENOENT, y como los dos métodos atrapan el error y **no relanzan**, el fallo
quedaba enterrado en un log.

Efecto real: **si el gasto de los proveedores se dispara, nadie se entera** — ni por el aviso
temprano del 80%, ni cuando el límite se agota y las llamadas al proveedor empiezan a rechazarse.
Es el mismo agujero que ya había señalado T-PROD-004 con `ADMIN_EMAIL_COST_ALERTS` sin setear:
las dos mitades del aviso estaban rotas a la vez.

#### ✅ Tareas específicas

- [x] Crear `provider-cost-warning.hbs` (aviso al 80%, con barra de progreso) y
      `provider-cost-limit-reached.hbs` (límite agotado), en el estilo de las plantillas existentes.
- [x] **Formatear los números en `EmailService`**: el servicio pasa valores crudos
      (`percentageUsed` llega como `82.3456`, el costo con 5 decimales). Ahora van con 2 decimales
      (costo) y 1 (porcentaje). Se agrega `adminUrl` al contexto (link directo al panel de consumo).
- [x] **Asuntos en español** (estaban en inglés: *"AI Cost Alert…"*), respetando el guardarraíl
      FBK-003 (`no-ia-user-facing.spec.ts`): el texto de los mails **no** menciona "IA" — el nombre
      del proveedor ya identifica de qué se habla.
- [x] Tests: los dos métodos **no tenían ninguno**. Se cubren el contexto formateado, el asunto, y
      que un fallo de envío **no rompa** el flujo que dispara la alerta.
- [x] Las dos plantillas se suman a `email-templates.spec.ts` (guarda de regresión del build).

#### 🎯 Criterios de Aceptación

- [x] Las dos plantillas existen y llegan a `dist` en el build.
- [x] Los mails salen con montos y porcentajes legibles y con link al panel.
- [x] Un fallo de envío de la alerta no rompe el registro del costo.
- [x] Ciclo de calidad backend completo pasa (4488 tests, coverage 84.75%).

> ⚠️ **Para que las alertas lleguen de verdad, `ADMIN_EMAIL_COST_ALERTS` debe estar seteada en
> Railway** (se cargó durante T-PROD-004 apuntando a `consultas@auguriatarot.com`). Sin ella, el
> servicio loguea un warning y no manda nada. → ✅ **declarada y validada como email en
> `env.validation.ts` en T-PROD-012**: ahora un typo en la dirección se detecta en el boot.

---

### T-PROD-017: El `User-Agent` del Geocoding Declara un Email Inexistente (Riesgo de Bloqueo Silencioso) — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA (2026-07-13)
**Prioridad:** 🟠 Alta
**Estimación:** 0.5 punto
**Dependencias:** ninguna — el buzón real ya existe (T-PROD-004)
**Origen:** hallazgo abierto de T-PROD-013 (el barrido del dominio equivocado encontró usos **no publicados** al usuario que aquel PR no tocó por ser Frontend puro)
**Tipo:** Backend (`docs/WORKFLOW_BACKEND.md`)

#### 📋 Problema

[geocode.service.ts](../backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.ts)
manda en **cada** llamada de geocoding el header:

```
User-Agent: Auguria/1.0 (contact@auguria.com)
```

Ese buzón **no existe** — es el mismo resto del rebrand que arregló T-PROD-013 en el frontend (el dominio
real es `auguriatarot.com`). No es cosmético: la [política de uso de Nominatim](https://operations.osmfoundation.org/policies/nominatim/)
exige identificar la aplicación con un **medio de contacto válido**, y ese contacto es su vía para
avisarnos antes de bloquear. Con un email inexistente, el aviso rebota y **el bloqueo nos llega sin
previo aviso**.

El impacto es sobre la carta natal: el geocoding es lo que convierte el lugar de nacimiento en
coordenadas + timezone. Si OSM nos corta, **no se puede generar ninguna carta natal nueva**.

**3 usos del header** (2 de ellos contra Nominatim):

| Línea | Destino | Nota |
|---|---|---|
| [:164](../backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.ts#L164) | Photon (Komoot) — fuente primaria | no exige contacto, pero conviene ser consistente |
| [:223](../backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.ts#L223) | **Nominatim** — fallback de búsqueda | `// Requerido por Nominatim` |
| [:354](../backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.ts#L354) | **Nominatim** — reverse geocoding | |

Además el string está **triplicado a mano**: es exactamente la forma en que este bug se volvió a filtrar.

#### ✅ Tareas específicas

- [x] Extraer el `User-Agent` a una **constante única**
      ([contact.constants.ts](../backend/tarot-app/src/common/constants/contact.constants.ts):
      `CONTACT_EMAIL = 'consultas@auguriatarot.com'` + `GEOCODING_USER_AGENT`), espejando lo que
      T-PROD-013 hizo en el frontend con `CONFIG.CONTACT_EMAIL`. Los 3 usos la consumen — que no
      vuelva a divergir. *(También se exporta desde el barrel `src/common/index.ts` por consistencia,
      pero el guardrail real es el módulo de la constante: el barrel hoy no lo consume nadie.)*
- [x] Reemplazar `contact@auguria.com` por **`consultas@auguriatarot.com`** (la casilla real creada en
      T-PROD-004, que es la que efectivamente leemos).
- [x] Actualizar los 2 tests que fijaban el string literal (`geocode.service.spec.ts:155` y `:616`):
      ahora aseveran **contra la constante**.
- [x] Test de regresión: nuevo bloque `identificación saliente del geocoding` en
      [geocode.service.spec.ts](../backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.spec.ts)
      — las 3 llamadas salientes (Photon, fallback Nominatim, reverse Nominatim) mandan exactamente
      `GEOCODING_USER_AGENT`, y ningún header saliente declara un buzón fuera de `auguriatarot.com`.
- [x] **Limpieza del mismo dominio en el backend** (mismo PR):
  - [x] `system-config.entity.ts:54` — el `example:` de Swagger publicaba `admin@auguria.com` en la
        documentación de la API → `admin@example.com` (dominio reservado por RFC 2606), y su spec
        (`system-config.entity.spec.ts:21,30`) usa el mismo fixture.
  - [x] `.env.example`: los ejemplos de `CORS_ORIGINS` y `BACKEND_URL` alineados con el dominio real.
        *(El `EMAIL_FROM` ya lo corrigió T-PROD-012 al reescribir el bloque de email.)*
  - [x] **`scripts/create-mp-preapproval-plan.ts:170`** (hallazgo del revisor, sumado al PR): el `back_url`
        del plan de MercadoPago caía a `https://auguria.com.ar/premium` — dominio inexistente, y **no era
        una URL de ejemplo**: es el retorno post-checkout que MP guarda dentro del plan. Además el guard
        estaba roto (testeaba `BACKEND_URL` pero interpolaba `FRONTEND_URL ?? BACKEND_URL`, así que con
        solo `FRONTEND_URL` seteada caía igual al dominio muerto). Ahora:
        `` `${process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL}/premium` ``. Importa porque **T-PROD-001
        corre este script contra la cuenta real de MP**.

#### 🎯 Criterios de Aceptación

- [x] `grep -r "auguria\.com" backend/tarot-app/src` (excluyendo `auguriatarot.com`) devuelve **0 resultados**
      (también en `.env.example`).
- [x] El `User-Agent` que llega a Nominatim y Photon declara un buzón que **existe y leemos**.
- [x] El email del `User-Agent` está definido en **un solo lugar** del backend.
- [x] Ciclo de calidad backend completo pasa: format, lint, `test:cov` (4593 tests, coverage 84.87%), build
      y `validate-architecture.js`.

#### 📌 Fuera de alcance

Quedan `auguria.com` en **documentación histórica** (ADRs, `docs/modules/birth-chart/*`,
`FEEDBACK_CA_001_*`). No afectan runtime ni nada publicado al usuario; corregirlos reescribiría documentos
que registran decisiones ya tomadas.

> ⚠️ El `scripts/create-mp-preapproval-plan.ts` **estaba** en esta lista como "URL de ejemplo, no afecta
> runtime". Era falso: el revisor local lo encontró y **entró al PR** (ver la última tarea de arriba).

---

### T-PROD-018: El Sitio No Es Indexable ni Compartible (Sin `robots.txt`, Sin `sitemap.xml`, con la Imagen Social Rota) — ✅ COMPLETADA

**Estado:** ✅ COMPLETADA (2026-07-14)
**Prioridad:** 🔴 Crítica (bloquea T-PROD-009: AdSense **no aprueba** un sitio que Google no puede rastrear)
**Estimación:** 2 puntos
**Dependencias:** ninguna para el código. El valor real se materializa cuando el dominio productivo esté activo.
**Origen:** hallazgo al analizar el cutover de staging al dominio final
**Tipo:** Frontend (`docs/WORKFLOW_FRONTEND.md`)

#### 📋 Problema

El frontend tiene un módulo de SEO decente ([seo.ts](../frontend/src/lib/metadata/seo.ts): metadata por página, Open Graph,
Twitter cards) pero le faltan las **tres piezas que Google realmente consume**, y una de las que sí existe está rota:

| # | Falta | Consecuencia |
|---|---|---|
| 1 | **`robots.txt`** — no existe ni `frontend/public/robots.txt` ni `app/robots.ts` | Nada le dice a Google qué rastrear. Y peor: `defaultMetadata.robots = { index: true, follow: true }` ([seo.ts:70-73](../frontend/src/lib/metadata/seo.ts#L70-L73)) es **fijo**, así que **staging se declara indexable**. Si Google indexa `staging.auguriatarot.com` y después publicamos el dominio final con el mismo contenido → **contenido duplicado compitiendo contra nosotros mismos**, justo en las páginas que son el argumento para que AdSense apruebe. |
| 2 | **`sitemap.xml`** — no existe `app/sitemap.ts` | Google descubre las páginas a fuerza de crawl. La enciclopedia (78 cartas), los 12 signos y los 12 animales del horóscopo chino son **cientos de URLs generadas** que son precisamente el contenido indexable del sitio: sin sitemap, tardan semanas en aparecer, o no aparecen. |
| 3 | **`alternates.canonical`** — ningún metadata lo declara | Con dos hosts sirviendo lo mismo (staging + producción), sin canonical Google elige por su cuenta cuál rankea. |
| 4 | **`og-image.png` NO EXISTE** — `frontend/public/og-image.png` no está en el repo, pero **todos** los metadata lo referencian (`DEFAULT_OG_IMAGE`, [seo.ts:24](../frontend/src/lib/metadata/seo.ts#L24)) | **Cada link compartido en WhatsApp / Instagram / Facebook / Twitter muestra la preview rota (404).** Es el primer contacto de un usuario referido con la marca. |

#### ✅ Tareas específicas

- [x] **`app/robots.ts`** (Next genera `/robots.txt`): `Allow: /` + `Sitemap:` + `Host:` en producción;
      `Disallow: /` fuera de ella. Excluye las rutas privadas.
      ⚠️ **Trampa del prefijo:** en robots.txt una regla matchea por *prefijo de path*, así que `/tarot`
      también bloquearía `/tarotistas/1` y `/ritual` bloquearía `/rituales` — ambas **públicas**. Van como
      `/x/` + `/x$`. Hay un test que asevera el comportamiento (`/tarotistas/1` NO bloqueada), no la forma
      de la lista.
- [x] **La indexación se deriva del host de `NEXT_PUBLIC_APP_URL`**
      ([indexing.ts](../frontend/src/lib/metadata/indexing.ts)), no de un flag nuevo: es **fail-closed**.
      Solo `auguriatarot.com` / `www.auguriatarot.com` se indexan; staging, los previews de Railway y local
      quedan fuera **sin que nadie tenga que acordarse de apagar nada** — que es exactamente cómo staging
      quedó indexable. `defaultMetadata.robots` pasó de `index: true` fijo a depender del entorno.
- [x] **`app/sitemap.ts`**: estáticas + enciclopedia (cartas + las 12 categorías de artículos, mapeadas a su
      ruta real) + 12 signos + 12 animales + rituales + servicios. Cada sección degrada a vacío si su fetch
      falla: **un sitemap incompleto es mejor que un build caído**.
      ⚠️ **`export const revalidate = 3600`**: el build del frontend (Docker/Railway) **no alcanza a la API**,
      así que un sitemap solo-de-build se publicaría sin la enciclopedia. Con ISR se regenera en el
      contenedor que corre, donde la API sí responde.
- [x] **`alternates.canonical`**: `'./'` en `defaultMetadata` + las 5 páginas de artículos
      (`getArticleMetadata(article, canonicalPath)`).
      🔴 **Hallazgo del revisor local, y era grave:** el primer intento usaba `canonical: '/'`. El root
      layout exporta ese metadata y **Next lo hereda** en toda página que no declare `alternates`, así que
      las 178 URLs del sitemap se declaraban *duplicadas de la home* → Google no habría indexado ninguna.
      Es el modo de falla exacto que la tarea venía a evitar, introducido por la tarea misma. `'./'` lo
      resuelve contra el pathname actual (self-canonical). Verificado en el HTML del build:
      `/rituales` → `<link rel="canonical" href="https://auguriatarot.com/rituales">`.
- [x] **Contenido duplicado eliminado**: `/enciclopedia/[slug]` servía *exactamente* lo mismo que
      `/enciclopedia/tarot/[slug]` (mismo `useCard`, mismo `CardDetailView`). Ahora hace `permanentRedirect`
      (308) a la canónica y se borró `ROUTES.ENCICLOPEDIA_CARD`.
      ⚠️ **El "nadie la enlazaba" era falso** (lo detectó el revisor): el default de `CardThumbnail` apuntaba
      a la legacy y `CardGrid` lo montaba sin `href` → **las 78 cartas del hub pasaban por el 308**; ídem el
      prev/next de `CardNavigation`. Corregido: todo el linking interno usa `ROUTES.ENCICLOPEDIA_TAROT_CARD`.
      `ArticleCard` era peor: enlazaba **artículos** a la ruta de *cartas* → habría caído en "Carta no
      encontrada". Ahora usa el nuevo `getArticlePath(category, slug)`
      ([article-routes.ts](../frontend/src/lib/constants/article-routes.ts)), que además reutiliza el sitemap.
- [x] **Imagen social**: `app/opengraph-image.tsx` con `ImageResponse` de next/og (1200×630, tokens del hero).
      El `og-image.png` que los metadata referenciaban **nunca existió en `public/`**. Un test de `seo.test.ts`
      **fijaba el bug** (aseveraba `stringContaining('/og-image.png')`): ahora asevera contra `OG_IMAGE_PATH`.
      El revisor encontró una **segunda** preview rota: `carta-astral/layout.tsx` apuntaba a
      `/og/carta-astral.png` y `public/og/` tampoco existe. Corregida.
- [x] **Menores del review**: `getBaseUrl` normaliza la barra final (un `https://dominio.com/` pegado en
      Railway producía `//sitemap.xml` en las 178 URLs), y `generateSharedReadingMetadata` dejó de declarar
      `index: true` fijo — una lectura vive detrás de un token no adivinable y el robots.txt ya bloquea
      `/compartida/`.
- [x] Tests: `indexing` (9), `robots` (6, incluida la trampa del prefijo), `sitemap` (9: mapeo de categorías,
      URL canónica de las cartas, degradación por sección, sin duplicados), redirect de la ruta duplicada (2)
      y los nuevos de `seo`.

#### 🎯 Criterios de Aceptación

- [x] Staging → `robots.txt` con `Disallow: /` **y** `<meta name="robots" content="noindex, nofollow">` en el
      HTML. *(Verificado contra un build real con `NEXT_PUBLIC_APP_URL=https://staging.auguriatarot.com`.)*
- [x] Dominio final → `robots.txt` con `Allow: /` + `Sitemap:`, y `/sitemap.xml` con **178 URLs**: 133 de
      enciclopedia, 24 horóscopos, 5 rituales, 4 servicios y 12 estáticas. *(Verificado levantando el build
      productivo contra la API real.)*
- [x] `GET /opengraph-image` → **200 `image/png`** (111 KB), y el HTML emite
      `<meta property="og:image">` apuntando a esa URL. *(Antes: 404.)*
- [x] `GET /enciclopedia/the-fool` → **308** a `/enciclopedia/tarot/the-fool`.
- [x] Ciclo de calidad frontend completo pasa: format, lint:fix, type-check, `test:run`
      (**5325 tests**, 424 suites), build y `validate-architecture.js`.

#### 📌 Fuera de alcance (deliberado, no olvido)

- **Los perfiles de tarotistas (`/tarotistas/[id]`) no entran al sitemap**: el listado del backend es
  paginado y las constantes de ruta del marketplace están desactualizadas (`ROUTES.TAROTISTA_PROFILE` apunta
  a `/marketplace/...`, que no existe). Merece su propia tarea.
- **Varias páginas públicas son client components** (`/horoscopo/[sign]`, la ficha de carta, `/rituales/[slug]`,
  `/servicios/[slug]`): Googlebot recibe un 200 con el esqueleto y el contenido se pinta por JS. Google hoy
  ejecuta JS, pero indexa más lento y peor. Además esas rutas **no tienen `title`/`description` propios**:
  comparten el default "Auguria". Es el próximo cuello de botella de SEO y **necesita una tarea aparte**.

#### 📌 Nota de Ops (no es código)

Dar de alta el dominio final en **Google Search Console** y enviar el `sitemap.xml`. Es lo que acelera la
indexación — y es también la evidencia que mira AdSense en T-PROD-009.

---

## ORDEN DE EJECUCIÓN SUGERIDO

1. **T-PROD-002** (header móvil) — bug visible, fix acotado, sin dependencias.
2. **T-PROD-006 → T-PROD-007** (mezcla de cartas) — integridad del producto core; coordinar ambos PRs para mergear juntos o con feature flag.
3. **T-PROD-005** (dorso final) — se apoya en los mismos componentes que T-PROD-007; conviene después para evitar conflictos.
4. **T-PROD-003** (deploy cartas HQ) — operativo, puede ir en paralelo a lo anterior.
5. **T-PROD-004** (email del dominio: Porkbun + Resend) — operativo, desbloquea el remitente para MP y AdSense. Conviene mergear **T-PROD-012** antes del cutover: así, si una variable SMTP queda mal cargada en Railway, el boot falla en vez de dejar los emails silenciosamente muertos.
6. **T-PROD-001** (MP producción) — al final de la preparación, cuando dominio + email estén listos; es el gate de cobros reales.
7. **T-PROD-008 → T-PROD-009** (AdSense) — la fase 1 puede desarrollarse en cualquier momento; la fase 2 requiere el sitio productivo estable (Google revisa el dominio), así que va última.
8. **T-PROD-010 + T-PROD-011** (segunda ronda: selector móvil + notificaciones) — bugs visibles, fixes acotados, sin dependencias entre sí ni con el resto. Se desarrollan juntos en una sola rama/PR por ser ambos frontend y de la misma ronda de navegación.
9. **T-PROD-013** (dirección de contacto rota) — independiente de todo y trivial; puede salir **ya**, sin esperar al email. Es una dirección rota de cara al público.
10. **T-PROD-015** (reset de contraseña) — 🔴 **inmediatamente después de T-PROD-004**. Es el consumidor que justifica todo el trabajo de email: sin esto, el SMTP anda pero ningún usuario puede recuperar su cuenta. **No se lanza sin esta tarea.**
11. **T-PROD-014** (formulario de contacto que sí envía) — también después de T-PROD-004, pero puede esperar a 015.
12. **T-PROD-017** (`User-Agent` del geocoding con email inexistente) — independiente de todo y acotado, como lo fue T-PROD-013. Puede salir en cualquier momento; conviene **antes del lanzamiento**, porque el riesgo que cubre (que OSM nos bloquee sin poder avisarnos) se materializa justamente cuando sube el tráfico real.
13. **T-PROD-018** (robots + sitemap + canonical + og-image) — 🔴 **antes de que el dominio final vea la luz.** Dos razones de tiempo: (a) el `noindex` de staging tiene que estar puesto **antes** de que Google lo indexe (después hay que pedir la desindexación y esperar); (b) AdSense (T-PROD-009) revisa un sitio que Google pueda rastrear, así que sin sitemap la fase 2 arranca cojeando. Es, además, **la única tarea de código que queda pendiente**: el resto del camino a producción es Ops (T-PROD-001, T-PROD-003, T-PROD-009).

---

**Nota:** las tareas de código (T-PROD-002/005/006/007/008/010/011/012/013/014/017 y las partes PR de 003/009) siguen el workflow correspondiente (`WORKFLOW_FRONTEND.md` / `WORKFLOW_BACKEND.md`): TDD, ciclo de calidad completo, PR a `develop`, y actualización de este backlog al completar cada una.
