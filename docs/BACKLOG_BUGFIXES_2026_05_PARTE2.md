# BACKLOG: CORRECCIÓN DE BUGS REPORTADOS — Mayo 2026 (Ronda 2)

## PARTE A: REPORTE DE BUGS

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Corrección de defectos en módulos existentes
**Versión:** 1.0
**Fecha:** 29 de mayo de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)
**Continuación de:** `BACKLOG_BUGFIXES_2026_05.md` (la numeración de BUGs y tareas continúa desde donde terminó ese archivo: BUG-016 / T-BUG-016).

---

## CONTEXTO

Durante una segunda verificación visual sobre **https://staging.auguriatarot.com** Ariel reportó cuatro problemas adicionales, todos en el frontend público:

1. **Widget de horóscopo occidental no reconoce la fecha de nacimiento**: aunque el usuario tiene su fecha de nacimiento cargada en el perfil, el widget del dashboard no muestra su signo y muestra el CTA "Configura tu fecha de nacimiento".
2. **La Guía del Tarot no aparece en `/enciclopedia/guias`**: siendo la guía más importante de la página, solo se puede llegar a ella desde los widgets de "Tirada de Tarot" o "Tarot del Día", pero no figura en el listado de Guías.
3. **Símbolos del horóscopo occidental se ven multicolor (emoji) en vez de lila**: los 12 símbolos zodiacales del selector se renderizan como emoji multicolor del sistema. Lo deseado es que sean del **color lila/primary de la página** (monocromáticos), coherentes con la identidad visual.
4. **Tarjeta informativa de cada servicio mucho más pobre que la de Numerología**: la página de Numerología muestra una tarjeta rica y estructurada (`NumerologyIntro`: intro + dos columnas con bullets explicativos + nota + botón a la enciclopedia). El resto de los servicios usan el genérico `EncyclopediaInfoWidget`, que solo muestra una frase. La diferencia es abismal: todos los servicios deben mostrar tanta información y con el mismo nivel de riqueza visual que Numerología.

---

## ÍNDICE DE BUGS

| ID      | Bug                                                                          | Severidad  | Módulo afectado                |
| ------- | ---------------------------------------------------------------------------- | ---------- | ------------------------------ |
| BUG-016 | Widget de horóscopo pide configurar fecha aunque ya está cargada             | 🟠 Alta    | Frontend — Horoscope Widget    |
| BUG-017 | La Guía del Tarot no figura en `/enciclopedia/guias`                         | 🔴 Crítica | Frontend — Encyclopedia        |
| BUG-018 | Símbolos zodiacales se ven multicolor (emoji) en vez de lila                 | 🟡 Media   | Frontend — Horoscope UI        |
| BUG-019 | Tarjeta informativa por servicio mucho más pobre que la de Numerología       | 🟠 Alta    | Frontend — Encyclopedia/Servicios |

---

## DETALLE DE BUGS

### BUG-016: Widget de Horóscopo Pide Configurar Fecha Aunque Ya Está Cargada

**Severidad:** 🟠 Alta
**Módulo:** `frontend/src/components/features/horoscope/HoroscopeWidget.tsx`
**Reportado por:** Ariel — dashboard con fecha de nacimiento ya cargada (29/05/2026)

#### Descripción del Problema

En el dashboard (`UserDashboard.tsx:71`), el `HoroscopeWidget` debería mostrar el signo del usuario y un resumen del horóscopo del día. Pese a tener la fecha de nacimiento cargada en el perfil, el widget muestra el estado "sin datos": el título "Tu Horóscopo" + el texto **"Configura tu fecha de nacimiento para ver tu horóscopo personalizado"** + botón "Configurar". El usuario interpreta (erróneamente) que su fecha no está guardada.

#### Causa Raíz Identificada

El problema es una **conflación de errores en el frontend**. En [HoroscopeWidget.tsx:51-66](frontend/src/components/features/horoscope/HoroscopeWidget.tsx#L51-L66):

```tsx
// Error or no data (includes no birthDate case from API)
if (error || !horoscope) {
  return (
    <Card ...>
      <h2>Tu Horóscopo</h2>
      <p>Configura tu fecha de nacimiento para ver tu horóscopo personalizado</p>
      <Button asChild ...><Link href="/perfil">Configurar</Link></Button>
    </Card>
  );
}
```

El widget trata **cualquier** error igual que "el usuario no tiene fecha de nacimiento". Pero el endpoint backend `GET /horoscope/my-sign` ([horoscope.controller.ts:170-204](backend/tarot-app/src/modules/horoscope/infrastructure/controllers/horoscope.controller.ts#L170-L204)) puede fallar por dos motivos muy distintos:

- **400 Bad Request** → `if (!user.birthDate)` → "Configura tu fecha de nacimiento…" (este sí es el caso real de fecha faltante).
- **404 Not Found** → `if (!horoscope)` → "Horóscopo de {sign} no disponible" — es decir, **la fecha SÍ está cargada y el signo se calculó bien**, pero el horóscopo diario para ese signo todavía no fue generado para la fecha de hoy.

Además, el hook [useHoroscope.ts:98-105](frontend/src/hooks/api/useHoroscope.ts#L98-L105) tiene `retry: false`, por lo que un fallo transitorio (5xx / timeout) tampoco se reintenta y cae también al mismo CTA engañoso.

**Resultado**: si el horóscopo del día para el signo del usuario no fue generado (404) o hubo un error de red/5xx, el usuario con fecha cargada ve "Configura tu fecha de nacimiento", lo cual es incorrecto y confuso.

> ⚠️ **Causa subyacente probable (a verificar):** que el horóscopo diario del signo del usuario no esté generado para hoy apunta a un hueco en la generación diaria de horóscopos occidentales, análogo a BUG-001 (horóscopos chinos faltantes). Conviene auditar `horoscope-cron.service.ts` / `horoscope-generation.service.ts` para confirmar que los 12 signos se generan completos cada día y que existe reintento ante fallos parciales.

#### Criterios de Aceptación

1. **Dado** que tengo la fecha de nacimiento cargada y el horóscopo del día de mi signo existe
   **Cuando** abro el dashboard
   **Entonces** el widget muestra mi símbolo, nombre del signo y el resumen (comportamiento exitoso actual).

2. **Dado** que NO tengo fecha de nacimiento cargada (backend responde **400**)
   **Cuando** abro el dashboard
   **Entonces** veo el CTA "Configura tu fecha de nacimiento" con botón a `/perfil`.

3. **Dado** que tengo fecha cargada pero el horóscopo del día de mi signo aún no existe (backend responde **404**)
   **Cuando** abro el dashboard
   **Entonces** veo un mensaje distinto y honesto (ej: "Tu horóscopo de hoy se está preparando, volvé en un rato"), NO el CTA de configurar fecha.

4. **Dado** que el endpoint falla por error transitorio (5xx / red)
   **Cuando** abro el dashboard
   **Entonces** se reintenta razonablemente y, si persiste, se muestra un estado de error genérico (no el CTA de fecha).

5. **(Subyacente)** **Dado** que es un día cualquiera
   **Cuando** se consulta `/horoscope/my-sign` para cualquier signo
   **Entonces** el horóscopo del día existe para los 12 signos (generación diaria completa y con reintento).

#### Notas Técnicas

- El cliente Axios expone `error.response?.status`. Diferenciar `400` (fecha faltante) vs `404` (horóscopo no generado) vs resto.
- Considerar exponer un campo/estado tipado desde el hook (ej. mapear el error a `'no-birthdate' | 'not-generated' | 'error'`) para que el widget no inspeccione el status crudo.
- Reevaluar `retry: false` en `useMySignHoroscope`: mantener "no reintentar" solo para 400; permitir 1-2 reintentos para 5xx.
- El mismo patrón de mensaje empático ya se aplicó en horóscopo chino (T-BUG-001-C, `AnimalHoroscopePage.tsx`) — reutilizar criterio/copys.
- Auditar la generación diaria de horóscopos occidentales (cron) por la causa subyacente del 404.

---

### BUG-017: La Guía del Tarot No Figura en `/enciclopedia/guias`

**Severidad:** 🔴 Crítica (la guía más importante del sitio no es navegable desde el índice de guías)
**Módulo:** `frontend/src/components/features/encyclopedia/GuiasContent.tsx`
**Reportado por:** Ariel — navegación a `/enciclopedia/guias` (29/05/2026)

#### Descripción del Problema

En `https://staging.auguriatarot.com/enciclopedia/guias` se listan las guías de Numerología, Péndulo, Carta Astral, Rituales, Horóscopo y Horóscopo Chino, pero **NO aparece la Guía del Tarot**, que es la más importante de la plataforma. Hoy solo se puede acceder a ella desde el `EncyclopediaInfoWidget` de las páginas "Tirada de Tarot" (`/tarot`) y "Tarot del Día" (`/carta-del-dia`), que enlazan a `/enciclopedia/guias/guia-tarot`. El artículo existe, pero el índice de guías no lo muestra.

#### Causa Raíz Identificada

En [GuiasContent.tsx:12-19](frontend/src/components/features/encyclopedia/GuiasContent.tsx#L12-L19) el array de categorías recorridas **omite `GUIDE_TAROT`**:

```ts
const GUIDE_CATEGORIES: ArticleCategory[] = [
  ArticleCategory.GUIDE_NUMEROLOGY,
  ArticleCategory.GUIDE_PENDULUM,
  ArticleCategory.GUIDE_BIRTH_CHART,
  ArticleCategory.GUIDE_RITUAL,
  ArticleCategory.GUIDE_HOROSCOPE,
  ArticleCategory.GUIDE_CHINESE,
  // ❌ falta ArticleCategory.GUIDE_TAROT
];
```

La categoría existe en el enum ([encyclopedia-article.types.ts:23](frontend/src/types/encyclopedia-article.types.ts#L23): `GUIDE_TAROT = 'guide_tarot'`) y el artículo está sembrado en el backend con slug `guia-tarot` ([activity-guides.data.ts:15-18](backend/tarot-app/src/modules/encyclopedia/data/activity-guides.data.ts#L15-L18)). El componente renderiza una `CategorySection` por cada entrada del array (un fetch por categoría), por lo que al faltar la entrada, la Guía del Tarot simplemente nunca se solicita ni se muestra.

#### Criterios de Aceptación

1. **Dado** que entro a `/enciclopedia/guias`
   **Cuando** carga la lista
   **Entonces** la **Guía del Tarot** aparece en el listado, idealmente **primera** por ser la más importante.

2. **Dado** que clickeo la Guía del Tarot desde el índice
   **Cuando** navego
   **Entonces** llego a `/enciclopedia/guias/guia-tarot` con el artículo completo.

3. **Dado** que ya existían las otras 6 guías
   **Cuando** se agrega la del Tarot
   **Entonces** las demás siguen mostrándose sin regresiones.

#### Notas Técnicas

- Fix mínimo: agregar `ArticleCategory.GUIDE_TAROT` al array `GUIDE_CATEGORIES`. Para dejarla primera, ubicarla al inicio del array.
- Verificar que la BD de staging tenga el artículo `guia-tarot` sembrado (el seed lo incluye; si falta, re-seed de encyclopedia).
- Actualizar el test `GuiasContent` / `guias/page.test.tsx` para esperar 7 categorías (incluida Tarot).
- Revisar si el comentario "6 guías" en `guias/page.tsx:6` y el JSDoc de `GuiasContent` deben pasar a "7 guías".

---

### BUG-018: Símbolos Zodiacales Se Ven Multicolor (Emoji) en Vez de Lila

**Severidad:** 🟡 Media (estético/identidad visual)
**Módulo:** `frontend/src/components/features/horoscope/ZodiacSignCard.tsx` (+ todo lugar que renderice `signInfo.symbol`)
**Reportado por:** Ariel — selector de signos del horóscopo occidental (29/05/2026)

#### Descripción del Problema

Los 12 símbolos del selector de signos (`ZodiacSignSelector` → `ZodiacSignCard`) se ven **multicolor** (como emoji del sistema operativo). El estado **deseado es que sean del color lila/primary de la página** (monocromáticos), coherentes con la identidad visual del sitio. **NO deben ser coloridos.**

#### Causa Raíz Identificada

En [ZodiacSignCard.tsx:89-91](frontend/src/components/features/horoscope/ZodiacSignCard.tsx#L89-L91) el símbolo se renderiza como carácter Unicode plano sin forzar presentación de texto ni color explícito:

```tsx
<span className="text-4xl" role="img" aria-label={signInfo.nameEs}>
  {signInfo.symbol}
</span>
```

Los símbolos en `ZODIAC_SIGNS_INFO` ([zodiac.ts](frontend/src/lib/utils/zodiac.ts)) son los glifos Unicode `♈ ♉ ♊ …` (U+2648–U+2653). Estos code points pertenecen al rango de **emoji** y muchos navegadores/SO (especialmente móviles) los renderizan por defecto como **emoji multicolor** en lugar de texto. Como no se fuerza la presentación de texto ni se aplica una clase de color, el glifo cae al render emoji del sistema → se ve multicolor y no toma el lila de la página.

> Esto explica el reporte "estaban teñidos del lila… ahora son multicolor": un cambio de fuente/SO/navegador hizo que los glifos pasaran a renderizarse como emoji.

#### Criterios de Aceptación

1. **Dado** que veo el selector de signos en cualquier dispositivo/navegador
   **Cuando** se renderizan los 12 símbolos
   **Entonces** se muestran **monocromáticos en el color lila/primary** de la página (no como emoji multicolor).

2. **Dado** un signo seleccionado o "Tu signo"
   **Cuando** se aplica el color
   **Entonces** los estados `ring`/`border` siguen visibles y legibles.

3. **Dado** cualquier otro lugar que muestre el símbolo zodiacal (ej. `HoroscopeWidget`, detalle `[sign]`)
   **Cuando** se renderiza
   **Entonces** también se ve lila/monocromático (consistencia).

#### Notas Técnicas

- Forzar **presentación de texto** del glifo: agregar el selector de variación `︎` (U+FE0E, *text presentation selector*) al símbolo, y/o aplicar CSS `font-variant-emoji: text` en el `<span>`.
- Aplicar explícitamente el color lila con `text-primary` (o el token correspondiente) al `<span>` del símbolo.
- Alternativa más robusta y multiplataforma: reemplazar los glifos Unicode por **íconos SVG** (set propio o librería) teñidos con `text-primary` vía `currentColor` — evita depender del soporte de `font-variant-emoji`.
- Aplicar el mismo tratamiento en todos los lugares que rendericen `signInfo.symbol` (`HoroscopeWidget.tsx:74`, detalle `[sign]`, etc.).
- Tests de `ZodiacSignCard` verificando la clase de color / presencia del selector de variación.

---

### BUG-019: Tarjeta Informativa por Servicio Mucho Más Pobre que la de Numerología

**Severidad:** 🟠 Alta
**Módulo:** `frontend/src/components/features/encyclopedia/EncyclopediaInfoWidget.tsx` vs `frontend/src/components/features/numerology/NumerologyIntro.tsx`
**Reportado por:** Ariel — comparación visual entre Numerología y el resto de los servicios (29/05/2026)

#### Descripción del Problema

La página de **Numerología** muestra una tarjeta informativa rica y estructurada: título "¿Qué es la Numerología?", párrafo introductorio, **dos columnas** ("📅 Desde tu Fecha de Nacimiento" / "✍️ Desde tu Nombre Completo") con bullets explicativos (Camino de Vida, Número de Cumpleaños, Año Personal, Mes Personal, Número de Expresión, Número del Alma, Personalidad), una **nota** destacada (números maestros 11/22/33) y el botón "Ver más en la Enciclopedia".

El resto de los servicios (Tarot, Horóscopo Occidental, Horóscopo Chino, Péndulo, Carta Astral, Rituales, Carta del Día) muestran apenas **una frase** + el botón. La diferencia es **abismal**. Se pide que todos los servicios muestren tanta información y con la misma riqueza visual que Numerología; el resumen actual es "simple, aburrido y feo".

#### Causa Raíz Identificada

Son **dos componentes distintos**, no el mismo con datos diferentes:

- **Numerología** usa un componente dedicado y hecho a medida: [NumerologyIntro.tsx](frontend/src/components/features/numerology/NumerologyIntro.tsx) — layout estructurado (intro + grid de 2 columnas con `<ul>` de bullets + nota + botón). Todo el contenido está escrito a mano en el componente.
- **Todos los demás servicios** usan el genérico [EncyclopediaInfoWidget.tsx:91-93](frontend/src/components/features/encyclopedia/EncyclopediaInfoWidget.tsx#L91-L93), que solo renderiza `{article.snippet}` (una frase traída del seed):

  ```tsx
  <h2 ...>{displayTitle}</h2>
  <p className="text-sm text-gray-700">{article.snippet}</p>
  <Button asChild ...><Link href={linkHref}>Ver más en la Enciclopedia</Link></Button>
  ```

Páginas que usan hoy el widget pobre: `/carta-del-dia`, `/horoscopo`, `/horoscopo-chino`, `/ritual`, `/tarot`, Carta Astral (`BirthChartPageContent`), Péndulo (`PendulumConsultation`), Rituales (`RitualsPage`).

**Resultado**: solo Numerología tiene la versión rica; el resto quedó con el widget mínimo.

#### Criterios de Aceptación

1. **Dado** que abro cualquier página de servicio
   **Cuando** veo la tarjeta informativa de ese servicio
   **Entonces** tiene un nivel de riqueza equivalente al de Numerología: intro + secciones/bullets explicativos + (si aplica) nota + botón "Ver más en la Enciclopedia".

2. **Dado** que comparo las tarjetas entre todos los servicios
   **Cuando** las leo
   **Entonces** todas tienen estructura y profundidad homogéneas (ya no hay una "abismalmente" mejor que las otras).

3. **Dado** que clickeo "Ver más en la Enciclopedia"
   **Cuando** navego
   **Entonces** llego al artículo completo (sin regresiones).

4. **Dado** el contenido de cada tarjeta
   **Cuando** se redacta
   **Entonces** es específico y veraz por servicio (Tarot habla de arcanos/tiradas, Horóscopo de signos/elementos/modalidades, Péndulo de radiestesia, etc.).

#### Notas Técnicas

- Dos enfoques (decisión de arquitectura — recomendado el B por mantenibilidad):
  - **A. Un componente rico por servicio:** crear `TarotIntro`, `HoroscopeIntro`, `ChineseHoroscopeIntro`, `PendulumIntro`, `BirthChartIntro`, `RitualIntro` espejando `NumerologyIntro`. Rápido de copiar pero genera mucha duplicación.
  - **B. Generalizar `NumerologyIntro` en un componente data-driven:** crear `<ServiceIntro>` que reciba una estructura tipada (`title`, `intro`, `sections: { heading, icon, items: {term, description}[] }[]`, `note?`, `href`) y mover el contenido de cada servicio a un archivo de datos (`service-intros.data.ts`). `NumerologyIntro` pasa a ser una instancia de `<ServiceIntro>`. Menos duplicación, contenido centralizado.
- Reemplazar el uso de `EncyclopediaInfoWidget` por el nuevo componente rico en las 8 ubicaciones listadas (o mantener `EncyclopediaInfoWidget` solo para casos secundarios).
- Mantener el estilo visual de `NumerologyIntro` (card con gradiente lila/índigo, headings, bullets) como base del diseño.
- Tests por servicio (render del título, secciones, bullets, botón) + actualizar tests de las páginas que cambian de widget.
- Coordinar con `BACKLOG_CONSISTENCIA_UI.md` si existe tarea relacionada de consistencia.

---

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** continúa la numeración de `BACKLOG_BUGFIXES_2026_05.md`.
> `-A` = backend, `-B` = frontend cuando aplica. Estimación en puntos de historia (1 punto ≈ 0.5 día).

### Índice de Tareas Técnicas

| ID          | Tarea                                                                          | Tipo        | Prioridad   | Estimación |
| ----------- | ------------------------------------------------------------------------------ | ----------- | ----------- | ---------- |
| T-BUG-016-A | Diferenciar estados del widget de horóscopo (400 vs 404 vs 5xx)                | Frontend    | 🟠 Alta     | 2 pts      |
| T-BUG-016-B | (Subyacente) Auditar/robustecer generación diaria de horóscopos occidentales   | Backend     | 🟠 Alta     | 3 pts      |
| T-BUG-017   | Agregar la Guía del Tarot al índice `/enciclopedia/guias`                       | Frontend    | 🔴 Crítica  | 0.5 pt     |
| T-BUG-018   | Forzar render lila/monocromático de los símbolos zodiacales                    | Frontend    | 🟡 Media    | 1.5 pts    |
| T-BUG-019   | Tarjetas informativas ricas por servicio (paridad con Numerología)             | Frontend    | 🟠 Alta     | 5-8 pts    |

**Estimación total:** ~13–18 puntos.

---

## TAREAS DETALLADAS

### T-BUG-016-A: Diferenciar Estados del Widget de Horóscopo (400 / 404 / 5xx)

**Prioridad:** 🟠 Alta
**Estimación:** 2 puntos
**Dependencias:** ninguna
**Cubre BUG:** BUG-016
**Estado:** ✅ Completada

#### 📋 Descripción

Que el `HoroscopeWidget` deje de mostrar "Configura tu fecha de nacimiento" cuando el problema NO es la falta de fecha. Mapear el error del endpoint a estados distintos y mostrar el copy correcto en cada uno.

#### ✅ Tareas específicas

- [x] En `useMySignHoroscope` (o un wrapper), mapear el error a un estado tipado: `'no-birthdate'` (400) / `'not-generated'` (404) / `'error'` (resto).
- [x] Ajustar `retry`: no reintentar en 400/404; permitir 1-2 reintentos para 5xx.
- [x] En `HoroscopeWidget.tsx` reemplazar el bloque único `if (error || !horoscope)` por ramas:
  - 400 → CTA "Configura tu fecha de nacimiento" (actual).
  - 404 → mensaje "Tu horóscopo de hoy se está preparando, volvé en un rato".
  - 5xx/desconocido → estado de error genérico con opción de reintentar.
- [x] Tests del widget por estado (success / 400 / 404 / 5xx).
- [x] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Un usuario con fecha cargada y horóscopo no generado (404) ve el mensaje "en preparación", NO el CTA de fecha.
- Solo el 400 muestra el CTA de configurar fecha.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/horoscope/HoroscopeWidget.tsx`
- `frontend/src/components/features/horoscope/HoroscopeWidget.test.tsx`
- `frontend/src/hooks/api/useHoroscope.ts`

---

### T-BUG-016-B: Auditar/Robustecer Generación Diaria de Horóscopos Occidentales

**Prioridad:** 🟠 Alta
**Estimación:** 3 puntos
**Dependencias:** ninguna (puede ir en paralelo con T-BUG-016-A)
**Cubre BUG:** BUG-016 (causa subyacente)
**Estado:** ✅ Completada

#### 📋 Descripción

Confirmar que los 12 horóscopos occidentales se generan completos cada día y agregar reintento/visibilidad ante generación parcial (analogía directa con BUG-001 de horóscopos chinos).

#### ✅ Tareas específicas

- [x] Auditar `horoscope-cron.service.ts` y `horoscope-generation.service.ts`: confirmar que se generan los 12 signos por día y qué pasa ante fallo individual.
- [x] Si un signo falla, reintentar con backoff sin abortar el resto del lote.
- [x] Verificación diaria (cron a las 09:00 UTC) que detecta y regenera solo los signos faltantes del día (`generateMissingHoroscopes` + `findMissingSignsForDate`).
- [x] Tests unitarios de la lógica de generación/reintento.
- [x] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- En un día normal, `GET /horoscope/my-sign` nunca devuelve 404 por falta de generación para ninguno de los 12 signos.
- Un fallo transitorio en un signo no deja hueco permanente.
- `npm run test:cov && npm run build && node scripts/validate-architecture.js` pasan.

#### 📁 Archivos involucrados

- `backend/tarot-app/src/modules/horoscope/application/services/horoscope-cron.service.ts`
- `backend/tarot-app/src/modules/horoscope/application/services/horoscope-generation.service.ts`
- specs correspondientes.

---

### T-BUG-017: Agregar la Guía del Tarot al Índice `/enciclopedia/guias`

**Prioridad:** 🔴 Crítica
**Estimación:** 0.5 punto
**Dependencias:** ninguna
**Cubre BUG:** BUG-017
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Agregar `ArticleCategory.GUIDE_TAROT` al array `GUIDE_CATEGORIES` en `GuiasContent.tsx`, ubicándola **primera** (guía más importante).
- [ ] Verificar que el artículo `guia-tarot` esté sembrado en staging/prod; re-seed de encyclopedia si falta.
- [ ] Actualizar comentarios/JSDoc que mencionan "6 guías" → "7 guías" (`guias/page.tsx`, `GuiasContent`).
- [ ] Actualizar tests (`GuiasContent` / `guias/page.test.tsx`) para esperar la Guía del Tarot.
- [ ] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- La Guía del Tarot aparece (primera) en `/enciclopedia/guias` y enlaza a `/enciclopedia/guias/guia-tarot`.
- Las otras 6 guías siguen listándose sin regresiones.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/GuiasContent.tsx`
- `frontend/src/app/enciclopedia/guias/page.tsx` (comentario)
- `frontend/src/app/enciclopedia/guias/page.test.tsx`

---

### T-BUG-018: Forzar Render Lila/Monocromático de los Símbolos Zodiacales

**Prioridad:** 🟡 Media
**Estimación:** 1.5 puntos
**Dependencias:** ninguna
**Cubre BUG:** BUG-018
**Estado:** ⬜ Pendiente

#### ✅ Tareas específicas

- [ ] Forzar presentación de texto del glifo: agregar selector de variación U+FE0E al símbolo y/o `font-variant-emoji: text` en el `<span>` de `ZodiacSignCard.tsx`.
- [ ] Aplicar color lila explícito (`text-primary` / token) al `<span>` del símbolo.
- [ ] (Alternativa robusta) Evaluar reemplazo de glifos Unicode por SVG teñidos con `currentColor` si el soporte de `font-variant-emoji` es insuficiente en los navegadores objetivo.
- [ ] Aplicar el mismo tratamiento en todos los lugares que rendericen `signInfo.symbol` (`HoroscopeWidget.tsx:74`, detalle `[sign]`).
- [ ] Verificar en navegadores móviles (donde el render emoji es más frecuente) que se vean lila.
- [ ] Tests de `ZodiacSignCard` (clase de color / selector de variación).
- [ ] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Los 12 símbolos se ven **lila/monocromáticos** (no emoji multicolor) en desktop y mobile.
- Consistencia en todos los lugares que muestran símbolos zodiacales.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/horoscope/ZodiacSignCard.tsx`
- `frontend/src/components/features/horoscope/ZodiacSignCard.test.tsx`
- (posibles) `frontend/src/lib/utils/zodiac.ts`, `HoroscopeWidget.tsx`, CSS global

---

### T-BUG-019: Tarjetas Informativas Ricas por Servicio (Paridad con Numerología)

**Prioridad:** 🟠 Alta
**Estimación:** 5-8 puntos (según enfoque A o B y cantidad de servicios)
**Dependencias:** decisión de arquitectura (componente por servicio vs `<ServiceIntro>` data-driven)
**Cubre BUG:** BUG-019
**Estado:** ⬜ Pendiente

#### 📋 Descripción

Llevar la tarjeta informativa de cada servicio al mismo nivel de riqueza visual y de contenido que `NumerologyIntro` (intro + secciones con bullets + nota + botón a la enciclopedia), reemplazando el `EncyclopediaInfoWidget` mínimo. Recomendado el **Enfoque B** (componente genérico `<ServiceIntro>` + datos centralizados) por mantenibilidad.

#### ✅ Tareas específicas

**Enfoque B (recomendado — data-driven):**

- [ ] Crear componente genérico `ServiceIntro` que reciba `{ title, intro, sections: { heading, icon?, items: {term, description}[] }[], note?, href }`, replicando el diseño de `NumerologyIntro` (card gradiente lila/índigo, grid de columnas, bullets, nota).
- [ ] Crear archivo de datos `service-intros.data.ts` con el contenido por servicio (Tarot, Horóscopo Occidental, Horóscopo Chino, Péndulo, Carta Astral, Rituales, Carta del Día) — contenido específico y veraz.
- [ ] Refactor: `NumerologyIntro` pasa a ser una instancia de `<ServiceIntro>` con sus datos (sin regresión visual).
- [ ] Reemplazar `EncyclopediaInfoWidget` por `<ServiceIntro>` en las 8 ubicaciones: `/carta-del-dia`, `/horoscopo`, `/horoscopo-chino`, `/ritual`, `/tarot`, `BirthChartPageContent`, `PendulumConsultation`, `RitualsPage`.
- [ ] Tests del genérico + un test por servicio (título, secciones, bullets, botón). Actualizar tests de páginas que cambian de widget.
- [ ] Coverage ≥ 80%.

**Enfoque A (alternativo — un componente por servicio):**

- [ ] Crear `TarotIntro`, `HoroscopeIntro`, `ChineseHoroscopeIntro`, `PendulumIntro`, `BirthChartIntro`, `RitualIntro`, `CartaDelDiaIntro` espejando `NumerologyIntro`.
- [ ] Reemplazar `EncyclopediaInfoWidget` por cada uno en su página.
- [ ] Tests por componente. Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Cada servicio muestra una tarjeta con riqueza equivalente a Numerología (intro + secciones/bullets + nota cuando aplique + botón).
- El contenido es específico y veraz por servicio.
- "Ver más en la Enciclopedia" sigue llevando al artículo completo.
- Numerología no sufre regresión visual.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/features/encyclopedia/` — nuevo `ServiceIntro` (Enfoque B)
- `frontend/src/components/features/numerology/NumerologyIntro.tsx` — refactor a `<ServiceIntro>`
- nuevo `service-intros.data.ts` (Enfoque B)
- páginas: `frontend/src/app/{carta-del-dia,horoscopo,horoscopo-chino,ritual,tarot}/page.tsx`
- `frontend/src/components/features/birth-chart/BirthChartPageContent/`, `.../pendulum/PendulumConsultation.tsx`, `.../rituals/RitualsPage.tsx`
- tests correspondientes

---
