# Backlog SEO — Fase 3: De App con Enciclopedia a Portal Editorial (septiembre 2026)

> **Continuación de [BACKLOG_SEO_CONTENIDO_2026_08.md](./BACKLOG_SEO_CONTENIDO_2026_08.md).**
> La fase 1 arregló **cómo** se sirve el contenido. La fase 2 arregló **cuánto** hay. Ésta arregla
> **qué ve el revisor en los primeros 60 segundos**: hoy ve una app freemium con una enciclopedia
> adosada, y decide ahí.

---

## Por qué existe esta fase

El 11-sep-2026 AdSense rechazó el sitio por **tercera vez** con el mismo motivo: **"Contenido de
poco valor"**. El próximo pedido sería el **cuarto**.

Esta vez el rechazo entró con **todo el plan de la fase 2 en producción y verificado**. Medido el
mismo día:

- `npm run check:indexable -- --base-url https://auguriatarot.com` → **179/179 cumplen**, 0 bajo el
  umbral, sin soft-404.
- Las 78 fichas de `/enciclopedia/tarot` sirven **780–890 palabras propias** (antes 166).
- `/sobre-nosotros` sirve 1.199 palabras; las guías, 700–1.350.
- Dominio creado el 14-ene-2026 (8 meses: la edad no es el problema). `www` → 301 a no-`www`.
  `ads.txt` correcto. Sin otras redes de anuncios. El loader de AdSense carga para anónimos (el
  client id está en el build de producción).

**El volumen ya no explica el rechazo.** Lo que lo explica es lo que el guardarraíl no mide.

### Lo que ve un revisor sin login (medido el 11-sep-2026)

Se pidió cada URL con `curl`, User-Agent de Googlebot, sin JavaScript, y se contaron las palabras
**sin nav ni footer**.

| # | Hallazgo | Evidencia |
| --- | --- | --- |
| **A** | **El menú principal lleva a páginas "herramienta + folleto".** Están en el sitemap y el guardarraíl las da por buenas porque **superan el umbral de 120 palabras** (tienen 215–260): el umbral sirve para detectar páginas vacías, no folletos. Las herramientas **son gratuitas y funcionan sin registro** (péndulo 1 consulta, carta del día 1 por día, carta astral, numerología): eso es un activo. Lo fino es el **texto editorial** que las acompaña. | `/carta-del-dia` 220 · `/pendulo` 215 · `/rituales` 223 · `/horoscopo` 217 · `/contacto` ~180 · `/premium` ~280 palabras propias. Todas indexables y en el sitemap. Las cuatro primeras usan **la misma plantilla**: emoji + 3 bullets + "Nota:" + "Ver más en la Enciclopedia". Para el revisor es el patrón "sitio de herramientas": un widget y 200 palabras. |
| **B** | **La home es una landing de SaaS.** | Hero "Crear cuenta gratis", tabla de precios Visitante / Free / **Premium $7.000 por mes** con lista de features, "Cómo funciona en 3 pasos". 651 palabras, casi todas de producto. |
| **C** | **`/horoscopo/[signo]` promete "Horóscopo de X Hoy" y el HTML no trae la predicción.** | El `<title>` dice "Hoy"; el HTML servido tiene solo el perfil estático del signo (551 palabras). La predicción la trae `HoroscopeSignPanel` por JS, a propósito (día local del visitante). |
| **D** | **Las 78 fichas tienen los mismos 10 `h2` en el mismo orden.** | `Información · Significado · En el amor · En el trabajo · En la energía y el bienestar · Simbolismo · Consejo · ¿Sí o no? · Palabras clave · Combinaciones`. Señal de "producido en volumen". |
| **E** | **Autoría anónima a propósito.** | `/sobre-nosotros`: *"Elegimos presentarnos como equipo y no como una figura única."* Sin nombre, sin foto, sin byline en las fichas. |
| — | Rutas bloqueadas en `robots.txt` que igual responden 200 con casi nada. | `/tarot` 270 · `/ritual` 270 · `/carta-astral/resultado` **45 palabras**, sin `noindex`. Un revisor que llega por un link las ve igual. |
| — | El sitemap pone `lastmod` = hora del request en las 179 URLs. | Google lo ignora cuando es así, y se lee como generado sin criterio. |

### Qué dicen las fuentes (y coinciden entre sí)

Se cruzó con la comunidad hispana e inglesa (ForoBeta, comunidad de AdSense, dev.to, guías 2026) y
con dos segundas opiniones independientes. Los tres análisis ordenaron igual:

1. **B y A son la causa.** El revisor pasa 30–90 segundos: entra a la raíz, ve precios y
   "crear cuenta", hace dos o tres clics en el menú y cae en un widget con 200 palabras de folleto, siempre con la
   misma plantilla. Veredicto: *aplicación comercial con contenido secundario* (el "estigma del
   sitio-herramienta"). Es el patrón
   n.º 1 de rechazo en proyectos híbridos (SaaS + contenido). Las 78 fichas de 800 palabras
   **probablemente nunca las abrió**.
2. **C y E son graves por el nicho.** En temas esotéricos Google aplica filtros estrictos; un título
   que promete "hoy" y no lo entrega, y un sitio sin persona responsable, destruyen la confianza
   mínima.
3. **D se posterga.** Una enciclopedia con estructura consistente es legítima (un diccionario también
   la tiene) mientras el texto sea propio. Se mitiga barato en los 22 Arcanos Mayores, no
   reescribiendo 78 fichas.
4. **Reenviar sin cambios** funciona a veces cuando no se sabe qué está mal. Acá hay cinco causas
   identificadas: es tirar un ciclo de 2–4 semanas a la moneda.

### Qué NO es el problema (para no volver a auditarlo)

- **No es volumen de las fichas.** 780+ palabras propias con revisión humana superan la media del
  nicho en español.
- **No es renderizado ni soft-404.** Fases 1 y 2.
- **No es edad del dominio, `www`, `ads.txt` ni el loader de AdSense.** Verificado arriba.
- **No es la palabra "salud".** T-SEO-013 la sacó del texto visible.

### Qué NO vale la pena hacer

- ❌ Reescribir las 78 fichas.
- ❌ Sumar 50 artículos de blog genéricos: 179 URLs es de sobra; más páginas flojas empeoran la
  proporción.
- ❌ Backlinks, PBN o servicios de "aprobación garantizada".
- ❌ Reenviar sin cambios.
- ❌ Cambiar de dominio, de framework o de plantilla.
- ❌ Eliminar el modelo freemium: se **mueve de lugar**, no se saca.
- ❌ Badge "generado por IA" en cada página: no lo piden y baja el valor percibido. Lo que sirve es
  una *política editorial* que reencuadre la IA como "datos + borrador + revisión humana".
- ❌ Desbloquear la app de `robots.txt`.

---

## Tareas

| ID | Tarea | Tipo | Prioridad | Estimación | Estado |
| --- | --- | --- | --- | --- | --- |
| T-SEO-014 | Home editorial: de landing SaaS a portada de portal | Frontend | 🔴 Crítica | 3 pts | ⬜ Pendiente |
| T-SEO-015 | Páginas de herramientas: nota editorial debajo de cada widget; `noindex` a ventas/internas; guardarraíl sobre el nav | Frontend + contenido | 🔴 Crítica | 4 pts | ⬜ Pendiente |
| T-SEO-016 | Horóscopo del día en el HTML servido (SSR/ISR) | Frontend | 🟠 Alta | 2 pts | ✅ Completada |
| T-SEO-017 | Persona editorial responsable, bylines y `/politica-editorial` | Frontend + decisión | 🟠 Alta | 2 pts | ⬜ Pendiente |
| T-SEO-018 | Disclaimer global y guardarraíl de lenguaje determinista (YMYL) | Front + datos | 🟡 Media | 1,5 pts | ⬜ Pendiente |
| T-SEO-019 | `robots.ts`: `Mediapartners-Google`; sitemap sin `lastmod` falso | Frontend | 🟢 Baja | 0,5 pts | ✅ Completada |
| T-SEO-020 | Arcanos Mayores: romper la plantilla (invertida, caso de tirada, iconografía) | Contenido + Front | 🟢 Baja | 3 pts | ⬜ Diferida |
| T-SEO-021 | Péndulo: el cristal no contrasta con el fondo | Frontend (UI) | 🟡 Media | 0,5 pts | ⬜ Pendiente |

**⛔ No pedir la cuarta revisión hasta tener 014, 015, 016, 017 y 018 en producción en un deploy
único, más 14–21 días de rastreo.** Ver *Puerta de salida* al final. T-SEO-020 no entra en la puerta:
es para después, o para la ventana de espera si sobra tiempo.

---

## 📌 Orden de desarrollo (fuente única)

| # | Tarea | Est. | Por qué va ahí |
| --- | --- | --- | --- |
| 1 | ~~**T-SEO-019**~~ ✅ | 0,5 pts | Cerrada 11-sep-2026: grupo `Mediapartners-Google` en robots y sitemap sin `lastmod` |
| 2 | ~~**T-SEO-016**~~ ✅ | 2 pts | Cerrada 11-sep-2026: `getCanonicalDailyHoroscopes()` en `lib/api/horoscope-server.ts` devuelve los 12 del día canónico (ART) para que 014 y 015 los consuman en SSR |
| 3 | **T-SEO-014** | 3 pts | La causa n.º 1. Es la pantalla que decide |
| 4 | **T-SEO-015** | 4 pts | La causa n.º 2. Va después de 014 porque las secciones que la home deja de mostrar (precios, "3 pasos") aterrizan en `/premium`, que es una de las URLs que 015 reescribe |
| 5 | **T-SEO-017** | 2 pts | Necesita una **decisión de negocio** (quién firma) que se puede tomar mientras se desarrollan 014–016. El código es chico |
| 6 | **T-SEO-018** | 1,5 pts | Cierra el lenguaje después de que 014/015/017 escribieron texto nuevo, así el guardarraíl los cubre |
| 7 | **Deploy único + Search Console + espera de 14–21 días** | — | No es código. Ver *Puerta de salida* |
| 4b | **T-SEO-021** | 0,5 pts | Va pegada a T-SEO-015: es la misma página y el revisor va a mirar el widget. Puede ir en la misma rama o en una propia, pero antes del deploy único |
| 8 | T-SEO-020 | 3 pts | Durante la espera, si sobra tiempo. No demora el pedido |

**Total hasta la puerta de salida: 13,5 pts.**

### Por qué un deploy único y no incremental

El revisor y Googlebot pueden mirar versiones cacheadas. Si la home nueva sale hoy y el menú
arreglado en diez días, el índice queda dos semanas en un estado intermedio y la ventana de espera
arranca dos veces. Se mergea todo a `develop`, se despliega una vez, se verifica, y **recién ahí**
empieza a contar el plazo.

---

## ⚠️ Regla transversal: lo que está en el menú vale; lo que no vale, no está en el menú

**Nunca dejar en la navegación de un visitante sin login una URL que merezca `noindex`.** Y al
revés: lo que está en el menú es lo primero que el revisor abre, así que tiene que ser lo más sólido
del sitio, no lo más fino.

Las herramientas gratuitas **se quedan en el menú**: son lo mejor que tiene el sitio para mostrar
sin registro. Lo que cambia es que cada una lleva debajo una nota editorial de verdad. La regla de
las tres salidas aplica a lo que no sea herramienta ni contenido (páginas de venta, rutas internas):

- **Reescribir** → 800+ palabras propias con estructura distinta a las demás, en el sitemap, en el
  menú.
- **`noindex, follow`** + **fuera del menú público** + **fuera del sitemap**. Sigue accesible desde
  la app logueada.
- **Eliminar.**

---

## T-SEO-014: Home Editorial — de Landing SaaS a Portada de Portal

**Estado:** ⬜ Pendiente
**Prioridad:** 🔴 Crítica · **Estimación:** 3 pts · **Tipo:** Frontend
**Depende de:** T-SEO-016 (la portada muestra el horóscopo del día en SSR)

### Problema

`LandingPage` (`frontend/src/components/features/home/`) es una landing de producto:
`HeroSection` ("Crear cuenta gratis"), `TryWithoutRegisterSection`, `PlanComparison` (tabla
Visitante / Free / Premium $7.000), `PremiumBenefitsSection`, `HowItWorks` ("3 simples pasos"),
`WhatIsTarotSection`. Un revisor que entra a la raíz clasifica el sitio como app comercial en los
primeros segundos, y no vuelve a mirar.

### Alcance

Reemplazar `LandingPage` para el visitante anónimo por una **portada editorial**. Target: 900–1.200
palabras rastreables reales en el HTML, mayormente extractos. Estructura acordada por las tres
fuentes:

1. **Hero de publicación, no de producto.** `h1` del tipo *"Tarot y astrología en español:
   enciclopedia, horóscopos y guías"* + bajada de 2 líneas que diga qué es el sitio. Sin tabla, sin
   "Crear cuenta gratis" ocupando el 40 % superior.
2. **Horóscopo de hoy (12 signos).** Fecha visible, extracto de 2–3 líneas por signo **en el HTML**
   (viene de T-SEO-016), link a cada `/horoscopo/[signo]`.
3. **Carta del día.** Imagen + nombre + ~150 palabras de interpretación + link a la ficha completa.
4. **Últimas guías.** 4–6 cards con título, extracto, fecha real y byline (T-SEO-017).
5. **Explorá la enciclopedia.** Con los números a la vista: *78 cartas · 12 signos · 12 casas ·
   10 planetas · 12 signos chinos*. Le muestra profundidad al revisor antes del clic.
6. **Quiénes somos.** 3 líneas + foto + link a `/sobre-nosotros`.
7. **Franja discreta de servicios.** Una línea: *"También ofrecemos lecturas personalizadas y carta
   astral →"*. Sin tabla.
8. Disclaimer en el footer (T-SEO-018).

**El modelo de negocio no desaparece: se muda.** `PlanComparison`, `PremiumBenefitsSection` y
`HowItWorks` pasan a `/premium` (T-SEO-015). El CTA de registro queda como botón en el header, no
como hero.

**`UserDashboard` para usuarios logueados no se toca.** Es ahí —y en `/premium`— donde vive el
upsell a Premium: el usuario ya probó la lectura gratis y sabe de qué se le habla. **En la home
anónima no hay precios ni lista de features "gratis"**: lo gratis se demuestra (el horóscopo se lee,
la carta se ve, la enciclopedia se navega), no se anuncia. Una lista de features sin la columna de
precio sigue siendo un folleto.

### Criterios de aceptación

- [ ] La home anónima no contiene precios, tabla de planes ni "Cómo funciona en 3 pasos".
- [ ] El HTML servido sin JS (`curl -A Googlebot`) trae los 12 extractos del horóscopo de hoy con la
      fecha, la carta del día y ≥ 900 palabras sin nav/footer.
- [ ] `h1` único, de publicación.
- [ ] Los componentes de landing que se dejan de usar en la home se reubican (T-SEO-015) o se borran
      con sus tests; nada queda huérfano.
- [ ] `check:indexable` sigue en verde y la home sube su cuenta respecto de hoy (651).
- [ ] Tests: cada sección nueva con `data-testid`, y `HomePageContent.test.tsx` actualizado.

### Fuera de alcance

Rediseño visual del resto del sitio; cambios en `UserDashboard`.

---

## T-SEO-015: Páginas de Herramientas — Nota Editorial Debajo de Cada Widget; Guardarraíl sobre el Nav

**Estado:** ⬜ Pendiente
**Prioridad:** 🔴 Crítica · **Estimación:** 4 pts · **Tipo:** Frontend + contenido
**Depende de:** T-SEO-014 (recibe los componentes de precios en `/premium`)

### Problema

Ver hallazgo **A**. Las herramientas del menú son gratuitas y usables sin registro; el problema es
que cada página es *widget + 200 palabras de folleto con la misma plantilla*. Para un revisor de
AdSense eso es un "sitio de herramientas", el patrón que más rechazos junta en la comunidad, aunque
la herramienta sea buena. **El arreglo no es sacarlas ni esconderlas: es ponerles la nota debajo.**

**La nota no duplica la enciclopedia.** El diseño actual es "herramienta acá, teoría en la
enciclopedia, un link genérico entre las dos". Se conserva ese reparto: la enciclopedia sigue siendo
el *qué es*; la nota debajo del widget es el *cómo usar esto acá* (cómo formular la pregunta, cómo
leer el resultado que acaba de dar, qué hacer si falta un dato, qué no puede decirte). Textos con
intención distinta, sin repetir párrafos. Y el link "Ver más en la Enciclopedia" **se queda, pero
apunta a la entrada específica** (`/enciclopedia/...` del péndulo, del número de vida, de la carta
natal), no al índice: deja de ser un botón de salida y pasa a ser un enlace interno relevante.

Además `/tarot`, `/ritual` y `/carta-astral/resultado` responden 200 con 270/270/45 palabras y sin
`noindex`: `robots.txt` no frena a un revisor que llega por un link.

### Alcance — decisión por URL

| URL | Hoy | Acción | Detalle |
| --- | --- | --- | --- |
| `/carta-del-dia` | 220 pal., plantilla | **Reescribir** | Es el mejor activo: contenido fechado y fresco. Carta de hoy con interpretación (400–600 pal., en SSR con `revalidate` diario) + guía permanente *"Cómo usar la carta del día"* (800+) + archivo de los últimos 30 días. La herramienta interactiva queda como componente, no como página. |
| `/horoscopo` | 217 pal., plantilla | **Reescribir como hub real** | Los 12 signos con la fecha de hoy y el extracto de 2–3 líneas de cada predicción, en el HTML (reutiliza T-SEO-016). Debajo, el texto explicativo actual. |
| `/rituales` | 223 pal., plantilla | **Reescribir como índice editorial** | Ya hay 4 rituales en el sitemap: el hub los presenta con extracto y contexto (fases lunares, cuándo conviene cada uno). 600+ pal. |
| `/pendulo` | 215 pal., plantilla | **Herramienta + nota** | El péndulo digital queda arriba, usable sin registro como hoy. Debajo, 800+ pal. de uso: cómo formular la pregunta acá (ejemplos que sirven y que no), cómo leer cada movimiento, qué hacer con un "quizás", qué no puede decirte. La teoría (qué es la radiestesia) queda en la enciclopedia, enlazada a su entrada. |
| `/numerologia`, `/carta-astral` | 345 / 417 pal. | **Herramienta + nota** | Mismo criterio: la calculadora arriba, y debajo una guía propia (qué es el número de vida / qué muestra una carta natal, cómo leer el resultado, qué no dice). 800+ pal. Estructura distinta a la de `/pendulo`. |
| `/contacto` | ~180 pal. | **Reescribir, mantener indexable** | Es página de confianza: formulario + `consultas@auguriatarot.com` (dominio propio, no formulario huérfano) + ciudad/provincia + horario de respuesta + quién responde (T-SEO-017). |
| `/premium` | ~280 pal. | **Reescribir + `noindex`** | Recibe `PlanComparison`, `PremiumBenefitsSection` y `HowItWorks` de la home, más FAQ de facturación, cancelación, reembolso y **botón de arrepentimiento** (Res. 424/2020, ventas online en Argentina — confirmar con legales). Es página de venta: `noindex`, y en el header queda como botón "Premium", no como ítem del menú editorial. Ya está excluida de anuncios por `useAdsEnabled`. |
| `/tarot`, `/ritual`, `/carta-astral/resultado` | 200, 45–270 pal., robots-disallow | **`noindex`** | Meta `robots: noindex, follow` en el layout de cada una. No cambia la app. |

**Menú público resultante** (`HeaderNavLinks.tsx`, `Footer.tsx`): el mismo de hoy — las
herramientas gratuitas se quedan (`Carta del día`, `Péndulo`, `Carta astral`, `Numerología`,
`Rituales`, `Horóscopo`, `Enciclopedia`) porque después de esta tarea cada una es una página con
contenido propio. Lo único que cambia de lugar es **Premium**: deja de ser ítem del menú editorial y
pasa a ser un botón junto a "Iniciar sesión".

### Guardarraíl

`frontend/scripts/check-indexable-content.mjs` hoy exige 120 palabras propias a toda URL del
sitemap: detecta páginas vacías, no folletos. Extenderlo en dos sentidos:

1. **Umbral alto para el menú.** Las URLs enlazadas desde el header y el footer de la home (se
   rastrean los `href` internos) exigen **500 palabras propias**, no 120. Son las que el revisor
   abre primero. Cualquier URL del menú que esté bajo ese umbral y no tenga `noindex` → exit 1 con
   la lista.
2. **Coherencia `noindex` ↔ sitemap.** Una URL con `noindex` no puede estar en el sitemap, y una del
   sitemap no puede tener `noindex`. Cualquier cruce → exit 1.

Tests en `check-indexable-content.test.mjs`.

### Criterios de aceptación

- [ ] Ninguna URL del header/footer anónimo sirve menos de 500 palabras propias sin `noindex`, y
      ninguna herramienta gratuita perdió su acceso sin registro (test de cada widget en anónimo).
- [ ] `/premium`, `/tarot`, `/ritual`, `/carta-astral/resultado` con `noindex, follow` verificable
      en el HTML.
- [ ] `/carta-del-dia`, `/horoscopo`, `/rituales`, `/pendulo`, `/numerologia`, `/carta-astral` y
      `/contacto` en el sitemap, con estructura de encabezados **distinta entre sí** (no la plantilla
      emoji + 3 bullets).
- [ ] El guardarraíl rastrea nav/footer y falla ante la combinación prohibida; tests del script en
      verde.
- [ ] `Header.test.tsx` y `Footer` tests actualizados al menú nuevo.

---

## T-SEO-016: Horóscopo del Día en el HTML Servido (SSR/ISR)

**Estado:** ✅ COMPLETADA (11-sep-2026)
**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Tipo:** Frontend

### Problema

`frontend/src/app/horoscopo/[sign]/page.tsx` documenta: *"El horóscopo del día sigue siendo cliente
a propósito: se resuelve contra el día calendario local del visitante."* El resultado es un
`<title>` que promete "Hoy" y un HTML sin predicción. Y la home nueva (T-SEO-014) y el hub
`/horoscopo` (T-SEO-015) necesitan los 12 extractos en el servidor.

### Decisión de diseño

El sitio tiene una zona horaria canónica: el horóscopo se genera a las 01:00 UTC (22:00 ART) para
que esté listo antes de la medianoche argentina, con ventana válida `[00:00, 03:00) UTC`. Entonces:

- El **servidor renderiza la predicción del día en `America/Argentina/Buenos_Aires`** con
  `revalidate` de 1 h (o revalidación on-demand disparada por el cron de generación, si el backend
  ya expone un hook; si no, 1 h alcanza).
- El cliente **conserva** la lógica de día local, pero solo para **reemplazar** el bloque cuando el
  día local del visitante difiere del canónico — nunca para el primer render. Así no hay
  hydration mismatch: el HTML inicial es el del servidor, y un visitante en otra zona horaria ve el
  suyo un instante después.
- Si el backend no tiene horóscopo para la fecha (ventana de generación caída), el servidor muestra
  el del día anterior con la leyenda que ya existe (`isShowingPreviousDay`), no un hueco.

Endpoints ya existen: `API_ENDPOINTS.HOROSCOPE.BY_DATE(date)` y `BY_DATE_SIGN(date, sign)`. Verificar
que sean públicos (sin JWT) para el fetch server-side; si requieren auth, exponer la variante pública
en el backend como subtarea.

### Criterios de aceptación

- [x] `curl -A Googlebot https://auguriatarot.com/horoscopo/aries` trae la predicción del día
      (texto completo) y la fecha en el HTML.
- [x] Existe una función server-side reutilizable que devuelve los 12 horóscopos del día (la usan
      014 y 015).
- [x] Sin hydration mismatch en consola en dev ni en tests.
- [x] Un visitante cuyo día local difiere ve su día tras hidratar; test unitario del swap.
- [x] `HoroscopeSignPanel.test.tsx` y `page.test.tsx` actualizados.

### Decisiones de implementación

- **Alcance de la ruta:** `/horoscopo/[signo]` sigue siendo la consulta puntual (elegís tu signo y
  ves su predicción). Lo que cambia es que la predicción viaja en el HTML. Mostrar los 12 extractos
  juntos es de 014 (portada) y 015 (hub `/horoscopo`); acá sólo queda la función que los provee.
- **`lib/api/horoscope-server.ts`** (sólo Server Components): `getCanonicalDailyHoroscopes()`
  devuelve `{ canonicalDate, horoscopes, isShowingPreviousDay }` con el mismo fallback que el
  cliente (si hoy viene `[]`, se pide ayer). Envuelta en `cache()` de React para dedupear dentro
  del render. `getCanonicalHoroscopeForSign(sign)` saca el signo **de esa lista** y no de
  `BY_DATE_SIGN` a propósito: ese endpoint incrementa `viewCount`, y una regeneración de ISR no es
  una persona mirando.
- **Día canónico:** `getCanonicalDateString()` (`lib/utils/date.ts`) formatea en
  `America/Argentina/Buenos_Aires` vía `Intl.DateTimeFormat`. En producción el proceso corre en
  UTC y cruza de día a las 21:00 ART: verificado en local a las 21:06 ART (00:06 UTC), con el
  horóscopo del 12 ya generado, el HTML servido siguió siendo el del 11.
- **Sin hydration mismatch:** `HoroscopeSignPanel` pinta `initialHoroscope` tanto en el servidor
  como en la hidratación. `useLocalToday()` sólo decide si **habilitar** la query del día local
  (`useLocalHoroscope(null)` cuando coincide con el canónico → cero requests para el visitante
  argentino); el reemplazo ocurre recién cuando `localQuery.data` llega. Mientras carga o si falla,
  se conserva lo servido — nunca un skeleton sobre contenido que ya está.
- **Excepción (revisión local):** si el servidor sirvió el de **ayer** (`isShowingPreviousDay`),
  la query local se habilita igual aunque el día coincida. Ese HTML queda cacheado hasta 1 h y, si
  el cron terminó en el medio, el visitante argentino se quedaba sin request y sin el de hoy hasta
  la próxima regeneración. Si aún no existe, el hook cae a ayer (el mismo que ya se ve) sin
  parpadeo.
- **`viewCount` deja de crecer con las visitas reales.** Antes cada carga de `/horoscopo/[signo]`
  pegaba a `BY_DATE_SIGN`, que incrementa el contador; ahora el visitante argentino no dispara
  ninguna request. Hoy `viewCount` no se expone en ningún endpoint, así que nada visible cambia,
  pero si algún día se quiere medir hay que instrumentarlo aparte (un beacon del cliente, o contar
  en el servidor excluyendo el build por `X-Prerender`).
- **Degradación:** si la API falla durante el render, `resolveListingData` devuelve `undefined`
  (con `console.warn`) y el panel cae al comportamiento cliente anterior. La ficha del signo se
  sirve igual. No se tira abajo el build ni se cachea un error por todo el ISR.
- **`revalidate = 3600`** en `app/horoscopo/[sign]/page.tsx` (antes sin `revalidate`: HTML
  estático hasta el próximo deploy). No se implementó revalidación on-demand desde el cron: el
  backlog la dejaba como opcional y 1 h alcanza para la ventana de generación.
- **Verificado contra el stack real** (Postgres + NestJS + `next dev`, Playwright con
  `timezoneId`): Buenos Aires → 0 llamadas a la API desde el cliente, 0 avisos de hidratación;
  Tokio (ya 12-sep local) → una llamada `BY_DATE_SIGN(2026-09-12)` y el bloque pasa del 11 al 12
  sin skeleton; con el 12 inexistente, 404 → fallback al 11 con la leyenda "de ayer".

---

## T-SEO-017: Persona Editorial Responsable, Bylines y `/politica-editorial`

**Estado:** ⬜ Pendiente
**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Tipo:** Frontend + decisión de negocio

### Problema

Ver hallazgo **E**. En el nicho esotérico, un sitio sin persona responsable se lee como granja de
contenido, por bien escrito que esté. Las guías 2026 lo dicen sin vueltas: *Google aprueba antes un
sitio mediocre con autoría clara que uno bien escrito y anónimo.*

Hay una ventaja que no se está usando: **detrás del servicio hay una tarotista humana real.**

### ⚠️ Decisión previa (de negocio, no de código)

Quién firma. Mínimo viable innegociable, según las tres fuentes:

- **Una persona con nombre y apellido reales, foto real** (no ilustración, no stock, no IA), bio de
  150–250 palabras con años de práctica y formación, y **un perfil externo verificable** (Instagram
  o LinkedIn).
- Puede ser la tarotista como autora, o el dueño del proyecto como **editor responsable** aunque las
  lecturas las haga otra persona: "editor" es un rol legítimo y suficiente.
- Seudónimo sin foto ni presencia externa: más débil, no fatal. Lo fatal es el anonimato actual.

### Alcance

1. **`/sobre-nosotros` reescrito**: quién es la persona responsable, año de inicio, ciudad, qué
   hacen y por qué, bibliografía de referencia (Waite, Pollack, Jung para arquetipos), email de
   contacto con dominio propio. Sacar la frase *"elegimos presentarnos como equipo y no como una
   figura única"*.
2. **`/autores/[slug]`** (o sección en `/sobre-nosotros` si hay una sola persona): bio, foto, links
   externos, listado de lo que firmó.
3. **Componente `Byline`** — *"Por [Nombre] · Revisado el [fecha]"* — en las 78 fichas de tarot,
   signos, casas, planetas, guías, rituales y servicios. La fecha sale de un campo real, no de
   `new Date()`.
4. **`/politica-editorial`** (linkeada desde footer y `/sobre-nosotros`): cómo se produce el
   contenido, quién lo revisa, qué fuentes usa (tradición Rider-Waite-Smith; efemérides calculadas
   para astrología), con qué criterio se corrige, cada cuánto se actualiza. Y la fórmula para la IA,
   que reencuadra sin badge:
   > *"Los horóscopos diarios se elaboran a partir de las posiciones planetarias del día, con
   > asistencia de herramientas de lenguaje y revisión editorial de [Nombre]."*
5. **Pie del horóscopo diario**: la misma línea, con la fecha del día.
6. `Person` en JSON-LD del autor; `author` en el schema `Article` de las fichas si ya existe.

### Criterios de aceptación

- [ ] `/sobre-nosotros` nombra a una persona real con foto y link externo.
- [ ] Byline visible en el HTML servido de toda ficha y guía; JSON-LD con `author`.
- [ ] `/politica-editorial` en el sitemap, 600+ palabras, linkeada desde el footer.
- [ ] Ninguna página dice "generado por IA" como badge; la mención va en la política y el pie.

---

## T-SEO-018: Disclaimer Global y Guardarraíl de Lenguaje Determinista (YMYL)

**Estado:** ⬜ Pendiente
**Prioridad:** 🟡 Media · **Estimación:** 1,5 pts · **Tipo:** Front + datos

### Problema

El tarot no está prohibido en AdSense. Lo que hunde a los sitios esotéricos es el **vocabulario de
promesa y de daño**. T-SEO-013 sacó "salud"; falta el resto, y falta el aviso legal que hoy no existe
en el footer.

### Alcance

1. **Disclaimer en el footer global y al pie de cada lectura/ficha:**
   > *"Los contenidos, lecturas y análisis de Auguria tienen fines culturales, de entretenimiento y
   > de autoconocimiento. No sustituyen asesoramiento médico, psicológico, legal ni financiero."*
   Mismo texto en `/terminos`.
2. **Auditoría y reescritura** de lenguaje determinista en el corpus (seeders de fichas, prompts de
   IA, textos de UI). Sacar sin excepción:
   - Promesas de resultado: *amarres, endulzamientos, garantizado, 100 % preciso, predicción exacta,
     te devuelve a…*
   - Salud (lo que quedó): *cura, sana, sanación* → *acompañamiento, reflexión, autoconocimiento*.
   - Dinero/legal accionable: *cuándo invertir, vas a ganar el juicio*.
   - Miedo/urgencia: *advertencia, peligro, tu destino está en riesgo, lo que nadie te dice*.
   Reformular a inclinación arquetípica: ❌ *"El As de Oros te garantiza un aumento"* →
   ✔️ *"El As de Oros simboliza oportunidades materiales y sugiere ordenar tus recursos"*.
   **Revisar en especial** las secciones *"¿Sí o no?"* y *"En la energía y el bienestar"* de las 78
   fichas: son donde más fácil se desliza.
3. **Extender el guardarraíl de T-SEO-013** (el que busca "salud") a una lista de términos
   prohibidos, con los mismos tests.

### Criterios de aceptación

- [ ] Disclaimer en el HTML servido del footer y de una ficha, y en `/terminos`.
- [ ] El guardarraíl de terminología falla ante cualquiera de los términos nuevos; corpus en verde.
- [ ] Prompts de IA (horóscopo, lecturas) con la instrucción explícita de no usar lenguaje
      determinista ni de salud.

---

## T-SEO-019: `robots.ts` — `Mediapartners-Google`; Sitemap sin `lastmod` Falso

**Estado:** ✅ COMPLETADA (11-sep-2026)
**Prioridad:** 🟢 Baja · **Estimación:** 0,5 pts · **Tipo:** Frontend

### Alcance

1. En `frontend/src/lib/metadata/robots.ts`, agregar un bloque `User-agent: Mediapartners-Google`
   con `Allow: /`. Hoy el `Disallow` de `User-agent: *` alcanza también al rastreador de anuncios, y
   Google pide que pueda acceder a las páginas donde se sirven anuncios. No cambia el bloqueo para
   Googlebot de búsqueda.
2. En el sitemap, `lastmod` por URL desde un dato real (fecha de última edición del contenido, o
   fecha del último deploy para las estáticas), no `new Date()` del request. Si no hay dato,
   **omitir** `lastmod`: es mejor que uno falso.

### Criterios de aceptación

- [x] `robots.txt` de producción tiene un grupo `User-agent: Mediapartners-Google` / `Allow: /`
      (verificar tras el deploy con `curl https://auguriatarot.com/robots.txt`).
- [x] El sitemap no emite `lastmod` (no hay 179 URLs con la misma fecha al segundo).
- [x] Tests de `buildRobots` y del sitemap actualizados (22 tests en verde).

### Decisiones de implementación

- **`lastmod` omitido, no calculado.** Ninguno de los tipos que alimentan el sitemap (`CardSummary`,
  rituales, servicios) trae fecha de edición, y las estáticas no tienen otra fuente que el deploy.
  Inventar una fecha era el problema original. Queda documentado en `buildSitemap` que, el día que
  la API exponga `updatedAt`, va ahí.
- **Grupo propio para `Mediapartners-Google`, sin `disallow`.** En robots.txt gana el grupo más
  específico, así que las reglas de `*` no le aplican: entra a todo. En staging no se emite el
  grupo, el sitio sigue cerrado entero.
- Los tests de `robots.test.ts` dejaron de asumir `rules[0]` y buscan el grupo por `userAgent`.

### Lo que encontró la revisión local (y se corrigió)

- El test de staging seguía usando `rules[0]`; pasó al helper `getGenericRule()`.
- Un test repetía lo que ya cubría el siguiente; se reemplazó por uno que fija que en producción
  existen **exactamente** dos grupos (`*` y `Mediapartners-Google`) y que el genérico conserva su
  lista de bloqueos.
- El helper de tipos `ElementOf` (con su comentario sobre condicionales distributivos) se
  reemplazó por `[rules].flat()`, que normaliza objeto-o-array sin tipos manuales.

---

## T-SEO-020: Arcanos Mayores — Romper la Plantilla (diferida)

**Estado:** ⬜ Diferida (no entra en la puerta de salida)
**Prioridad:** 🟢 Baja · **Estimación:** 3 pts · **Tipo:** Contenido + Front

Solo los 22 Arcanos Mayores, que son los que traen tráfico. **No** las 78.

- Dos elementos que ninguna ficha del web hispano tiene: un **mini-caso de tirada** (*"esta carta
  salió en posición de futuro en una consulta sobre cambio de trabajo; así se leyó"*) y una **nota
  iconográfica** específica de la lámina RWS (qué símbolo concreto está y qué significa).
- Sección propia **"Invertida"**.
- **Variar el orden** y **omitir** secciones que no aplican: que 50 fichas compartan 7 `h2` y
  difieran en 3 no dispara la alarma; que 78 tengan los mismos 10 en el mismo orden, sí.
- **Media original**: el mazo es CC0; un diagrama propio por carta con los símbolos señalados es la
  prueba de originalidad más barata y más fuerte.
- Los 56 Arcanos Menores quedan como están.

---

## T-SEO-021: Péndulo — el Cristal no Contrasta con el Fondo

**Estado:** ⬜ Pendiente
**Prioridad:** 🟡 Media · **Estimación:** 0,5 pts · **Tipo:** Frontend (UI)

### Problema

En `/pendulo` el cristal de la punta es casi invisible: el cono usa el gradiente
`from-white/90 via-purple-100/80 to-purple-200/70` (`frontend/src/components/features/pendulum/Pendulum.tsx`,
línea ~50) sobre el fondo casi blanco de la sección. En la captura del 11-sep-2026 se ve el soporte
gris y el hilo, y una mancha lila apenas perceptible donde debería estar el cristal. Es la
herramienta que el revisor va a mirar en `/pendulo` (T-SEO-015): tiene que verse.

### Alcance

- Rediseñar el cristal con contraste real contra el fondo: gradiente más saturado (violeta/amatista
  medio a oscuro, o cuarzo con borde definido), sombra proyectada y, si hace falta, un halo sutil.
  Mantener el estilo del sitio (paleta púrpura de la marca).
- Verificar contraste en los estados de animación (reposo, oscilación, respuesta sí/no/quizás) y en
  móvil.
- El soporte y el hilo pueden quedar; si se cambia el fondo de la sección en vez del cristal,
  documentar por qué.

### Criterios de aceptación

- [ ] El cristal se distingue a simple vista sobre el fondo en desktop y móvil, en reposo y en
      movimiento.
- [ ] Sin cambios en la lógica de `PendulumConsultation`; solo presentación.
- [ ] Tests de `Pendulum.tsx` actualizados si cambian clases o `data-testid`.

---

## 🚪 Puerta de salida: cuándo pedir la cuarta revisión

Un cuarto rechazo es peor que tres. **Todo esto, en este orden:**

- [ ] T-SEO-014, 015, 016, 017 y 018 mergeadas a `develop` y desplegadas **en un único deploy**,
      siguiendo el runbook de la fase 2 (backend → seeders → build del frontend).
- [ ] Verificación en producción, sin login y sin JS:
  ```bash
  cd frontend
  npm run check:indexable -- --base-url https://auguriatarot.com   # verde, incluido el nav
  curl -sA Googlebot https://auguriatarot.com/ | grep -c "Horóscopo de hoy"   # ≥ 1
  curl -sA Googlebot https://auguriatarot.com/horoscopo/aries | grep -c "$(date +%-d) de"  # ≥ 1
  curl -sA Googlebot https://auguriatarot.com/premium | grep -c noindex       # ≥ 1
  ```
- [ ] El revisor tiene que poder entender de qué se trata el sitio y **encontrar contenido
      sustancial sin registrarse y sin salir del primer nivel de navegación**. Hacer el recorrido a
      mano: home → 3 clics del menú → volver. Si en alguno se cae en una pantalla de app, no está
      listo.
- [ ] **Search Console, deploy + 1 día**: sitemap reenviado; *Inspección de URL* → *Probar URL
      publicada* en ~15 URLs clave (home, `/horoscopo`, los 12 signos, 2 fichas de tarot, 1 guía)
      mirando el **HTML renderizado**, y pedir indexación de cada una.
- [ ] **Esperar 14–21 días** desde el deploy. Durante la espera: publicar 1–2 guías nuevas por
      semana (cadencia editorial), no tocar nada más. Comprobar en Search Console que las URLs
      modificadas ya muestran la versión nueva e impresiones regulares.
- [ ] Recién ahí: AdSense → Centro de políticas → *Solicitar revisión*. No existe una "revisión
      manual" aparte ni un canal de soporte que explique el motivo; el botón es el proceso.
      Puede tardar de días a 2–4 semanas.

---

**Última actualización:** 11-sep-2026
