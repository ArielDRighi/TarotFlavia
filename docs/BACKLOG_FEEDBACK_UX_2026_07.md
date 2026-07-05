# BACKLOG: FEEDBACK DE CONSISTENCIA UX Y CONTRATOS PREMIUM — Julio 2026

## PARTE A: REPORTE DE HALLAZGOS

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Ronda de feedback transversal de UX/UI + auditoría de contratos y copy de Premium
**Versión:** 1.0
**Fecha:** 5 de julio de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente de desarrollo)
**Verificación:** Relevamiento de código (agentes exploradores sobre `frontend/` y `backend/tarot-app/`) + capturas aportadas por Ariel navegando `localhost:3001`.
**Canon visual de referencia:** rediseños de Dashboard (`BACKLOG_DASHBOARD_REDISENO_2026_06.md`), Enciclopedia (`BACKLOG_ENCICLOPEDIA_REDISENO_2026_05.md`) y Premium (`BACKLOG_PREMIUM_REDISENO_2026_07.md`) + tokens de `globals.css`.
**Convención de IDs:** nueva serie `FBK-XXX` (hallazgos) / `T-FBK-XXX` (tareas) propia de este backlog.

---

## CONTEXTO

Ariel realizó una ronda de feedback navegando la app y detectó seis frentes distintos: (1) invitaciones a Premium con estilos distintos entre widgets del dashboard, (2) la ficha informativa "¿Qué es…?" siempre ubicada **arriba** de la actividad, (3) menciones prohibidas a "IA" en texto de cara al usuario, (4) discrepancias entre lo que **promete** la página `/premium` y lo que el sistema **entrega**, (5) iconos del Horóscopo Chino que no acompañan el canon visual, y (6) el destacado "Tu signo/Tu animal" que agranda la tarjeta y rompe la grilla.

El relevamiento confirmó que la mayoría son cambios de bajo riesgo y alcance acotado, con **dos excepciones de fondo**: la auditoría de contratos de Premium (FBK-004) revela **promesas sin sustento** y una **incoherencia sistémica en la cuota de IA** (tres fuentes de verdad contradictorias), que es un bug de contrato, no solo de copy.

---

## ÍNDICE DE HALLAZGOS

| ID | Hallazgo | Severidad | Módulo afectado |
| -------- | --------------------------------------------------------------------------------------- | ---------- | ---------------------------------- |
| FBK-001 | Invitación a Premium inconsistente entre widgets del dashboard + fragmentación del upsell | 🟠 Alta | Frontend — Dashboard / upsell |
| FBK-002 | Ficha informativa "¿Qué es…?" ubicada arriba de la actividad en 9 páginas (debe ir abajo) | 🟡 Media | Frontend — 9 páginas de actividad |
| FBK-003 | Menciones a "IA" en texto user-facing (regla dura del proyecto) | 🟠 Alta | Frontend + Backend (transversal) |
| FBK-004 | Contratos de Premium: la página promete lo que el sistema no entrega (incl. cuota IA incoherente) | 🔴 Crítica | Frontend + Backend — Premium |
| FBK-005 | Iconos del Horóscopo Chino off-canon (emojis crudos multicolor) | 🟡 Media | Frontend — Horóscopo Chino |
| FBK-006 | Destacado "Tu signo/Tu animal" agranda la tarjeta y rompe la grilla | 🟡 Media | Frontend — Horóscopo occidental/chino |

---

## DETALLE DE HALLAZGOS

### FBK-001: Invitación a Premium Inconsistente en el Dashboard

**Severidad:** 🟠 Alta
**Módulo:** [SacredEventsWidget.tsx](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx), [PersonalizedRitualsWidget.tsx](../frontend/src/components/features/dashboard/PersonalizedRitualsWidget.tsx)
**Reportado por:** Ariel — "los widgets tienen distintos estilos de diseño y la invitación a premium es distinta en ambos; ¿no existe una genérica?".

#### Descripción del Problema

Dos widgets del dashboard que conviven ([UserDashboard.tsx:119-124](../frontend/src/components/features/dashboard/UserDashboard.tsx#L119-L124)) resuelven el upsell a Premium de forma distinta:

- **Calendario Sagrado** SÍ usa el componente compartido [`PremiumUpsellCard`](../frontend/src/components/ui/premium-upsell-card.tsx) ([SacredEventsWidget.tsx:206-216](../frontend/src/components/features/dashboard/SacredEventsWidget.tsx#L206-L216)): tarjeta con gradiente, icono `Zap`, botón degradado y copy desde la constante `CTA_PREMIUM.UPSELL_SOFT`.
- **Rituales Recomendados** NO usa ningún componente compartido ([PersonalizedRitualsWidget.tsx:64-81](../frontend/src/components/features/dashboard/PersonalizedRitualsWidget.tsx#L64-L81)): markup inline con un `<p>` + `<Button>` sólido, sin tarjeta, sin icono, sin gradiente, y con el CTA **hardcodeado** (`"Desbloquear recomendaciones"`) fuera del sistema de constantes.

El componente genérico **ya existe** (`PremiumUpsellCard`), pero solo uno de los dos lo consume. Funcionalmente los widgets **no** son el mismo (uno invita al calendario completo, otro a recomendaciones personalizadas), por lo que **no** se fusionan; pero deben compartir el mismo lenguaje visual de invitación.

Además existe una **fragmentación general del upsell**: hay ~10 componentes de upgrade/upsell dispersos con al menos 3 sistemas de estilo compitiendo, sin base común:

- `PremiumUpsellCard` → gradiente `purple/pink` **hardcodeado**.
- Banners en `readings/` (`UpgradeBanner` → `from-primary to-secondary`, `FreeReadingUpgradeBanner` → `from-violet-600`) → tokens de marca.
- `PremiumUpgradePrompt` (conversion) → tokens `bg-secondary`, iconos `Lock`/`Gem`/`Sparkles`.

#### Criterios de Aceptación

1. **Dado** el dashboard de un usuario Free
   **Cuando** se muestran los widgets "Calendario Sagrado" y "Rituales Recomendados"
   **Entonces** ambas invitaciones a Premium usan el **mismo componente y lenguaje visual** (`PremiumUpsellCard` o su sucesor de marca) y el CTA viene de `CTA_PREMIUM` (sin strings hardcodeados).

#### Notas Técnicas

- **Quick win (T-FBK-001):** hacer que `PersonalizedRitualsWidget` consuma `PremiumUpsellCard` con una constante de `CTA_PREMIUM`.
- **Deuda de diseño (T-FBK-002, opcional):** migrar `PremiumUpsellCard` a tokens de marca (hoy usa `purple/pink` crudo, tras el rediseño de T-PREM-007 el resto del circuito ya está en dorado/tokens) y converger los banners dispersos hacia una base común.
- Ojo: el CTA "por IA" que aparece en la página premium (no en estos widgets) se atiende en FBK-003; este hallazgo es solo consistencia visual del upsell.

---

### FBK-002: Ficha Informativa "¿Qué es…?" Arriba de la Actividad

**Severidad:** 🟡 Media
**Módulo:** [ServiceIntro.tsx](../frontend/src/components/features/encyclopedia/ServiceIntro.tsx) + 9 páginas de actividad
**Reportado por:** Ariel — "la información de las actividades está arriba de la propia actividad; debería estar abajo en todas las páginas".

#### Descripción del Problema

Cada página de actividad muestra la ficha educativa "¿Qué es…?" (título + intro + bullets + nota + botón "Ver más en la Enciclopedia") **antes** de la actividad real (formulario/herramienta/resultado). El usuario quiere el orden inverso: **primero la actividad, después la explicación**, de forma consistente en todas las páginas.

Todas las páginas usan **un único componente compartido**, `ServiceIntro`, alimentado por datos centralizados en [service-intros.data.ts](../frontend/src/lib/constants/service-intros.data.ts). No hay markup duplicado: cada página hace `<ServiceIntro data={...} />` arriba de la actividad. Invertir el orden es, en cada caso, **mover una línea de JSX** dentro del mismo archivo.

#### Alcance (9 páginas)

| # | Actividad | Archivo | Línea del intro |
| -- | ---------------- | ------------------------------------------------------------------------------------ | -------- |
| 1 | Numerología | `components/features/numerology/NumerologyPage.tsx` | 79 |
| 2 | Tarot del Día | `app/carta-del-dia/page.tsx` | 21 |
| 3 | Carta Astral | `components/features/birth-chart/BirthChartPageContent/BirthChartPageContent.tsx` | 187 |
| 4 | Horóscopo | `app/horoscopo/page.tsx` | 32 |
| 5 | Horóscopo Chino | `app/horoscopo-chino/page.tsx` | 40 |
| 6 | Péndulo | `components/features/pendulum/PendulumConsultation.tsx` | 127 |
| 7 | Rituales | `components/features/rituals/RitualsPage.tsx` | 67 |
| 8 | Tirada de Tarot | `app/tarot/page.tsx` | 27 |
| 9 | Ritual | `app/ritual/page.tsx` | 27 |

Fuera de alcance: `Servicios` no usa `ServiceIntro`, y las subpáginas de flujo (`tarot/preguntas`, `tarot/tirada`, etc.) tampoco lo renderizan.

#### Criterios de Aceptación

1. **Dado** cualquiera de las 9 páginas de actividad
   **Cuando** carga
   **Entonces** la ficha "¿Qué es…?" aparece **debajo** de toda la actividad (formulario/herramienta/resultado), con separación visual consistente.

#### Notas Técnicas

- Al mover el intro abajo, cambiar el margen de separación de `mb-6`/`mb-8` (hacia abajo) a `mt-6`/`mt-8` (hacia arriba) en las 9 llamadas para mantener la coherencia.
- En páginas con varios bloques de actividad (ej. Horóscopo Chino: calculadora + selector + tarjeta), el criterio por defecto es: **el intro va al final, después de todos los bloques de actividad**.
- Verificar que no se rompan `data-testid` ni tests que asuman el orden actual.

---

### FBK-003: Menciones a "IA" en Texto User-Facing

**Severidad:** 🟠 Alta (viola una regla dura del proyecto)
**Módulo:** transversal — Frontend (8) + Backend (guards, seed, plantillas de email)
**Reportado por:** Ariel — "está prohibido nombrar 'IA'; debe referirse a recomendaciones personalizadas, profundas, etc.".

#### Descripción del Problema

El texto de cara al usuario no debe mencionar "IA" / "inteligencia artificial". Debe reformularse como "recomendaciones personalizadas", "interpretaciones profundas/personalizadas", "análisis personalizado", etc. Se detectaron violaciones tanto en frontend como en textos que el backend devuelve al usuario (mensajes de error, descripción del plan renderizada en `/premium`, y plantillas de email).

#### Inventario de Violaciones

**Frontend (user-facing):**

| Archivo:línea | Texto |
| ---- | ---- |
| `premium/PremiumPage.tsx:59` | "Interpretación con IA personalizada" |
| `premium/PremiumPage.tsx:64` | "Rituales recomendados por IA" |
| `premium/PremiumPage.tsx:193` | "Interpretaciones personalizadas con IA, tiradas avanzadas…" |
| `lib/constants/premium-benefits.ts:63` | "Interpretaciones con IA avanzada" |
| `birth-chart/AISynthesis/AISynthesis.tsx:106` | "Análisis único generado por inteligencia artificial" |
| `birth-chart/AISynthesis/AISynthesis.tsx:239` | "…análisis único generado por inteligencia artificial que conecta…" |
| `birth-chart/BirthChartPageContent/BirthChartPageContent.tsx:268` | "✓ Síntesis personalizada con IA" |
| `profile/SubscriptionTab.tsx:269` | "Interpretaciones personalizadas con IA" |

**Backend (texto devuelto al usuario):**

| Archivo:línea | Texto | Vía |
| ---- | ---- | ---- |
| `database/seeds/plans.seeder.ts:67` | "…interpretaciones con IA y preguntas personalizadas" | Descripción del plan renderizada en `PremiumPage.tsx:261` |
| `tarot/readings/dto/create-reading.dto.ts:53` | "…cuando se solicita interpretación con IA" | Validación 400 |
| `tarot/readings/guards/requires-premium-for-ai.guard.ts:43,59` | "Las funciones/interpretaciones con IA están disponibles solo para usuarios Premium…" | ForbiddenException |
| `numerology/guards/requires-premium-for-numerology-ai.guard.ts:36` | "Las interpretaciones numerológicas con IA…" | ForbiddenException |
| `email/email.service.ts:173` | "🚫 Has alcanzado tu límite mensual de interpretaciones con IA" | Asunto de email |
| `email/templates/welcome.hbs:117` | "Realizar lecturas de tarot personalizadas con IA" | Email |
| `email/templates/quota-limit-reached.hbs:5,125` | "Cuota de IA Alcanzada", "interpretaciones con IA." | Email |
| `email/templates/quota-warning-80.hbs:5,109,118,180` | "Advertencia de Cuota de IA", "Interpretaciones ilimitadas con IA" | Email |
| `email/templates/plan-change.hbs:169` | "Interpretaciones más profundas con IA avanzada" | Email |

**Zona gris (decidir):** el **panel de admin** (`app/admin/ai-usage/page.tsx`, `admin/PlanComparisonTable.tsx`, etc.) dice "Inteligencia Artificial" pero solo lo ven administradores. Definir si la regla aplica al panel interno.

**No cuentan como violación:** nombres de variables/componentes (`AISynthesis`, `AIProvider`), `OPENAI_*`, logs, comentarios, Swagger, prompts al modelo, tests y docs `.md`.

#### Criterios de Aceptación

1. **Dado** cualquier texto que ve el usuario final (UI, mensajes de error de la API, emails)
   **Cuando** se refiere a la funcionalidad de interpretación/recomendación
   **Entonces** NO menciona "IA" / "inteligencia artificial"; usa reformulaciones de marca (ej. "interpretaciones personalizadas", "análisis profundo").

2. **Dado** la descripción del plan Premium
   **Cuando** se muestra en `/premium`
   **Entonces** el texto correcto proviene del backend (seed + migración de datos), no solo del frontend.

#### Notas Técnicas

- Corregir **solo el frontend no alcanza**: la descripción del plan se renderiza desde `plans.seeder.ts:67`, por lo que hace falta actualizar el seed **y** una migración de datos para las filas ya existentes en la tabla `plans`.
- Coordinar con FBK-004/T-FBK-005: varias de estas líneas (filas de la tabla comparativa) también se tocan al alinear el copy con la implementación real. Reformular una sola vez.
- Definir un **glosario de reemplazos** aprobado por Ariel antes de aplicar, para uniformidad.

---

### FBK-004: Contratos de Premium — La Página Promete lo que el Sistema no Entrega

**Severidad:** 🔴 Crítica (incluye un bug de contrato en la cuota de IA)
**Módulo:** Frontend (4 fuentes de copy) + Backend (límites, seed, constantes)
**Reportado por:** Ariel — "revisar los contratos de premium contra lo que indica su página".

#### Descripción del Problema

Los beneficios de Premium están dispersos en **4 fuentes que ya se contradicen entre sí** ([PremiumPage.tsx](../frontend/src/components/features/premium/PremiumPage.tsx), [premium-benefits.ts](../frontend/src/lib/constants/premium-benefits.ts), [PremiumBenefitsSection.tsx](../frontend/src/components/features/home/PremiumBenefitsSection.tsx) y la descripción del plan que viene del backend). Al cruzarlas con la implementación real surgen tres tipos de discrepancia.

**A) Promesas sin sustento (la página afirma algo que el código no hace):**

1. **"Lecturas ilimitadas"** (`PremiumUpgradePrompt.tsx:26`) → **falso**: Premium tiene tope duro de **3 tiradas/día** (`plans.seeder.ts:71`) + 1 carta/día. Contradice incluso a otras piezas de la propia UI que dicen "3 lecturas por día".
2. **"Experiencia sin publicidad"** (`PremiumBenefitsSection.tsx:30`) → no existe sistema de anuncios en el código.
3. **"Acceso prioritario / nuevas funcionalidades primero"** (`PremiumBenefitsSection.tsx:35`) → sin lógica que lo implemente.
4. **"Historial y estadísticas / descubrí patrones"** (`PremiumBenefitsSection.tsx:25`) → no hay módulo de estadísticas; solo retención de historial.
5. **Tiradas "Herradura" y "Año completo"** (`PremiumBenefitsSection.tsx:16`) → esas tiradas **no existen** (solo 1, 3, 5 cartas y Cruz Céltica en `tarot-spreads.data.ts`).
6. **"Historial ilimitado de rituales"** (`premium-benefits.ts:53`) → no hay límite de historial de rituales por plan.

**B) Clasificaciones engañosas:**

7. La tabla comparativa vende la **tirada de 3 cartas como premium-only** (`PremiumPage.tsx:58`), pero en el backend es `requiredPlan: ANONYMOUS` (`tarot-spreads.data.ts:92`) → **free ya puede hacerla**. Solo 5 cartas y Cruz Céltica son realmente premium.
8. **"Horóscopo y numerología" marcado como free ✓** (`PremiumPage.tsx:63`), pero la numerología **con IA** está gateada a premium (`requires-premium-for-numerology-ai.guard.ts:34`).
9. La comparativa muestra **"Historial de 365 días" como exclusivo premium (free ✗)**, pero free tiene **30 días** de retención (`readings.constants.ts:11`), no cero.

**C) Features reales que la página NO menciona:** Carta astral (free 3/mes vs premium ∞), Péndulo (1 vs 3/día), Oráculo (5/día vs ∞), regeneración de interpretación (premium ∞).

**D) 🔴 Incoherencia sistémica de la cuota de IA (bug de contrato):** hay **3 valores contradictorios** para lo mismo:

- Seed de DB (`plans.seeder.ts:57,72`): FREE `aiQuotaMonthly=0`, PREMIUM `=100`.
- Constante que realmente enforcea (`ai-usage/constants/ai-usage.constants.ts:25,32`): FREE `=100/mes`, PREMIUM `=-1` (ilimitado).
- UI (`useUserPlanFeatures.ts:83`, `DailyCardExperience.tsx:66`): trata la IA como **premium-only**.

El guard usa la constante (FREE=100), pero ninguna ruta de UI ofrece esos 100 requests a free. Hay que definir la fuente de verdad única y alinear las tres capas.

#### Números reales (fuente de verdad para validar todo el copy)

| Feature | FREE | PREMIUM | Fuente |
| ---- | ---- | ---- | ---- |
| Carta del día | 1/día | 1/día (con interpretación personalizada) | `plans.seeder.ts` |
| Tiradas de tarot | 1/día | 3/día | `plans.seeder.ts:56,71` |
| Oráculo | 5/día | ∞ | `usage-limits.constants.ts:25,33` |
| Péndulo | 1/día | 3/día | `usage-limits.constants.ts:26,34` |
| Carta astral | 3/mes | ∞ | `usage-limits.constants.ts:27,35` |
| Retención de historial | 30 días | 365 días | `readings.constants.ts:11-12` |
| Tiradas premium-only | — | solo 5 cartas y Cruz Céltica | `tarot-spreads.data.ts` |
| Precio | — | $7.000/mes | `plans.seeder.ts:68` |

#### Criterios de Aceptación

1. **Dado** la página `/premium` y todas las fuentes de beneficios
   **Cuando** se auditan contra la implementación
   **Entonces** cada beneficio listado tiene una contraparte real en el código; se eliminan o corrigen las promesas sin sustento (puntos A) y las clasificaciones engañosas (puntos B).

2. **Dado** las features gateadas reales (péndulo, carta astral, oráculo, regeneración)
   **Cuando** se decide su relevancia comercial
   **Entonces** se reflejan correctamente en la comparativa o se documenta por qué se omiten.

3. **Dado** la cuota de IA
   **Cuando** se resuelve la incoherencia
   **Entonces** existe **una sola fuente de verdad** y las tres capas (seed/DB, constante de enforcement, UI) coinciden.

#### Notas Técnicas

- Idealmente **unificar las 4 fuentes de beneficios** en una sola constante consumida por todos los puntos de venta (página, modales, home), para que no vuelvan a divergir.
- Este hallazgo se divide en dos tareas por alcance: **T-FBK-005** (copy/beneficios frontend, con decisiones de producto de Ariel) y **T-FBK-006** (bug de la cuota de IA, backend).
- Coordinar con FBK-003: al reescribir las filas de la comparativa se elimina también la mención a "IA".

---

### FBK-005: Iconos del Horóscopo Chino Off-Canon

**Severidad:** 🟡 Media
**Módulo:** [ChineseAnimalCard.tsx](../frontend/src/components/features/chinese-horoscope/ChineseAnimalCard.tsx) + usos del emoji
**Reportado por:** Ariel — "buscar iconos más acordes al diseño de la página para el horóscopo chino".

#### Descripción del Problema

El Horóscopo Chino renderiza los animales como **emojis Unicode multicolor** del sistema (🐀🐂🐅… en `chinese-zodiac.ts:9-106`), en un `<span className="text-4xl">` sin tratamiento ([ChineseAnimalCard.tsx:89](../frontend/src/components/features/chinese-horoscope/ChineseAnimalCard.tsx#L89)). Esos emojis a todo color **desentonan** con la paleta lila/`primary` del canon.

En cambio, el Horóscopo Occidental **se ve bien** porque usa un componente dedicado, [`ZodiacSymbol`](../frontend/src/components/features/horoscope/ZodiacSymbol.tsx), que combina: **glifo Unicode astrológico** (♈–♓) + **selector de presentación de texto `︎`** (fuerza monocromático) + clase `.zodiac-symbol` (`font-variant-emoji: text` en `globals.css:202-204`) + `text-primary`.

El mismo emoji crudo del chino se reutiliza en ~5 lugares más (`AnimalCalculator.tsx:103`, `ChineseHoroscopeDetail.tsx:49`, `ChineseHoroscopeWidget.tsx:76`, `ChineseCompatibility.tsx:48`, `AnimalHoroscopePage.tsx:101`).

#### Criterios de Aceptación

1. **Dado** el selector y las tarjetas del Horóscopo Chino
   **Cuando** se muestran los 12 animales
   **Entonces** los iconos son **monocromáticos y coloreados con `text-primary`** (u otro token de marca), coherentes con el tratamiento del Horóscopo Occidental.

#### Notas Técnicas

- **Decisión de diseño necesaria:** a diferencia de los glifos astrológicos (U+2648–U+2653, que tienen presentación de texto nativa), **los emojis de animales NO tienen equivalente monocromático limpio** bajo `font-variant-emoji: text`. Para paridad visual real la vía natural del proyecto es **iconos SVG monocromáticos** (o una icon-font) coloreados con `text-primary`, encapsulados en un componente análogo a `ZodiacSymbol` (ej. `ChineseAnimalSymbol`).
- Reemplazar el render en `ChineseAnimalCard.tsx:89` y propagar el nuevo componente a los ~5 usos restantes.
- Conservar accesibilidad (`role="img"` + `aria-label` con el nombre del animal, como hace `ZodiacSymbol`).

---

### FBK-006: El Destacado "Tu Signo / Tu Animal" Rompe la Grilla

**Severidad:** 🟡 Media
**Módulo:** [ZodiacSignCard.tsx](../frontend/src/components/features/horoscope/ZodiacSignCard.tsx), [ChineseAnimalCard.tsx](../frontend/src/components/features/chinese-horoscope/ChineseAnimalCard.tsx)
**Reportado por:** Ariel — "en el horóscopo occidental y chino, el 'tu signo' agranda la tarjeta y la fila rompiendo el diseño; basta con un recuadro que lo destaque, como ya existe".

#### Descripción del Problema

Cuando una tarjeta corresponde al signo/animal del usuario, se añade un **`<span>` de texto extra dentro de la card** ("Tu signo" / "Tu animal") que ocupa una línea adicional de altura. Como la grilla no fija altura de fila, esa card queda **más alta** que las demás y **desalinea toda la fila**. No es `scale` ni padding condicional: es contenido extra sin altura reservada.

- Occidental: badge en [ZodiacSignCard.tsx:93](../frontend/src/components/features/horoscope/ZodiacSignCard.tsx#L93) — `{isUserSign && <span className="text-muted-foreground text-xs">Tu signo</span>}`.
- Chino: badge en [ChineseAnimalCard.tsx:91](../frontend/src/components/features/chinese-horoscope/ChineseAnimalCard.tsx#L91) — `{isUserAnimal && <span className="text-xs font-medium text-red-500">Tu animal</span>}`.

El **recuadro de highlight que "ya existe"** es la clase condicional de borde: `isUserSign && 'border-accent border-2'` (occidental, línea 83) / `isUserAnimal && 'border-2 border-red-500'` (chino, línea 81). Ese borde destaca sin agrandar; el problema es exclusivamente el `<span>` de texto.

#### Criterios de Aceptación

1. **Dado** el selector de signos (occidental) o animales (chino)
   **Cuando** una tarjeta es la del usuario
   **Entonces** se destaca **solo con el borde** (sin agregar altura), manteniendo todas las tarjetas de la fila del **mismo tamaño**.

2. **Dado** el destacado del chino
   **Cuando** se compara con el occidental
   **Entonces** usa el **mismo token de borde** (`accent`), no `border-red-500` (que además desentona con el lila).

3. **Dado** que se quita el texto visible "Tu signo/Tu animal"
   **Cuando** un lector de pantalla recorre la tarjeta
   **Entonces** la condición de "tu signo" sigue siendo perceptible vía `aria-label` en la `Card` (no se pierde accesibilidad).

#### Notas Técnicas

- Solución mínima: eliminar el `<span>` de texto y apoyarse en el borde existente, agregando `aria-label` a la `Card`. Alternativa si se quiere conservar la etiqueta: posicionarla **absolute** (o reservarle altura fija) para que no altere el flujo.
- Grillas idénticas en ambos (`grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6`): `ZodiacSignSelector.tsx:57` y `ChineseAnimalSelector.tsx:55`.
- Verificar tests que dependan del texto "Tu signo"/"Tu animal" (migrarlos a `aria-label`).

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** serie `T-FBK-XXX` propia de este backlog.
> Estimación en puntos de historia (1 punto ≈ 0.5 día).
> Cada tarea se ejecuta siguiendo `docs/WORKFLOW_FRONTEND.md` o `docs/WORKFLOW_BACKEND.md` según su tipo (TDD, ciclo de calidad y PR a `develop`).

### Índice de Tareas Técnicas

| ID | Tarea | Tipo | Prioridad | Estimación |
| ---------- | --------------------------------------------------------------------------- | ---------- | ---------- | ---------- |
| T-FBK-001 | Unificar la invitación a Premium del dashboard (Rituales → `PremiumUpsellCard`) | Frontend | 🟠 Alta | 1 pt |
| T-FBK-002 | (Deuda) Unificar el sistema de upsell (tokens de marca + convergencia de banners) | Frontend | 🟢 Baja | 3 pts |
| T-FBK-003 | Reubicar la ficha "¿Qué es…?" debajo de la actividad en las 9 páginas | Frontend | 🟡 Media | 1.5 pts |
| T-FBK-004 | Erradicar "IA" del texto user-facing (front + back + emails + migración) | Full-stack | 🟠 Alta | 3 pts |
| T-FBK-005 | Alinear el copy/beneficios de Premium con la implementación real | Frontend | 🔴 Crítica | 2.5 pts |
| T-FBK-006 | Resolver la incoherencia de la cuota de IA (fuente de verdad única) | Backend | 🔴 Crítica | 2 pts |
| T-FBK-007 | Alinear los iconos del Horóscopo Chino al canon | Frontend | 🟡 Media | 2 pts |
| T-FBK-008 | "Tu signo/animal" sin agrandar la tarjeta (solo borde + a11y) | Frontend | 🟡 Media | 1 pt |

---

### T-FBK-001: Unificar la Invitación a Premium del Dashboard

**Prioridad:** 🟠 Alta
**Estimación:** 1 punto
**Dependencias:** ninguna
**Cubre Hallazgo:** FBK-001
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] Reemplazar el markup inline de `PersonalizedRitualsWidget.tsx:64-81` por `<PremiumUpsellCard>` (mismo patrón que `SacredEventsWidget.tsx:206-216`), con `title`/`description` adecuados a rituales personalizados.
- [ ] Migrar el CTA hardcodeado `"Desbloquear recomendaciones"` a una constante de `CTA_PREMIUM` (reutilizar `UPSELL_SOFT` o añadir una específica si Ariel prefiere ese texto).
- [ ] Actualizar/añadir tests del widget para fijar el uso del componente compartido.

#### 🎯 Criterios de Aceptación

- Ambos widgets del dashboard muestran la misma invitación visual; el CTA proviene de `CTA_PREMIUM`.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `PersonalizedRitualsWidget.tsx` (+ test), `lib/constants/cta-copy.ts` (si se agrega constante).

---

### T-FBK-002: Unificar el Sistema de Upsell (Deuda de Diseño)

**Prioridad:** 🟢 Baja
**Estimación:** 3 puntos
**Dependencias:** T-FBK-001
**Cubre Hallazgo:** FBK-001 (fragmentación general)
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] Migrar `PremiumUpsellCard` de `purple/pink` hardcodeado a **tokens de marca** (dorado/`secondary`), coherente con el rediseño del circuito premium (T-PREM-007).
- [ ] Inventariar los ~10 componentes de upgrade/upsell dispersos y definir una base común (o cuáles convergen hacia `PremiumUpsellCard` vs. cuáles son banners específicos legítimos).
- [ ] Documentar la guía de uso (cuándo usar tarjeta de upsell vs. banner vs. modal).

#### 🎯 Criterios de Aceptación

- El upsell usa un lenguaje visual único de marca (sin `purple/pink` crudo) en todos los puntos de conversión.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `ui/premium-upsell-card.tsx` + banners de `readings/` y `conversion/` (según inventario).

---

### T-FBK-003: Reubicar la Ficha "¿Qué es…?" Debajo de la Actividad

**Prioridad:** 🟡 Media
**Estimación:** 1.5 puntos
**Dependencias:** ninguna
**Cubre Hallazgo:** FBK-002
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] Mover el `<ServiceIntro>` (o `<NumerologyIntro>`) debajo de la actividad en las 9 páginas del alcance.
- [ ] Cambiar el margen de separación de `mb-*` a `mt-*` en las 9 llamadas.
- [ ] En páginas con varios bloques de actividad, ubicar el intro al final de todos ellos.
- [ ] Actualizar tests que asuman el orden previo.

#### 🎯 Criterios de Aceptación

- Las 9 páginas muestran la ficha informativa debajo de la actividad, con separación consistente.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- Los 9 del alcance (ver tabla de FBK-002) + sus tests.

---

### T-FBK-004: Erradicar "IA" del Texto User-Facing

**Prioridad:** 🟠 Alta
**Estimación:** 3 puntos
**Dependencias:** glosario de reemplazos aprobado por Ariel; coordinar con T-FBK-005
**Cubre Hallazgo:** FBK-003
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] **Frontend:** reformular las 8 apariciones del inventario (PremiumPage, premium-benefits, AISynthesis, BirthChartPageContent, SubscriptionTab).
- [ ] **Backend — mensajes:** reformular guards (`requires-premium-for-ai.guard.ts`, `requires-premium-for-numerology-ai.guard.ts`), DTO (`create-reading.dto.ts:53`) y asunto de email (`email.service.ts:173`).
- [ ] **Backend — plan:** actualizar `plans.seeder.ts:67` **y** crear una **migración de datos** para reformular la descripción del plan en las filas existentes de la tabla `plans`.
- [ ] **Backend — emails:** reformular las plantillas `.hbs` (welcome, quota-limit-reached, quota-warning-80, plan-change).
- [ ] Decidir con Ariel si aplica al **panel de admin** (zona gris) y actuar en consecuencia.
- [ ] Añadir un **guardarraíl** (test/lint) que falle si reaparece "IA"/"inteligencia artificial" en texto user-facing.

#### 🎯 Criterios de Aceptación

- Ningún texto de cara al usuario (UI, errores de API, emails, descripción del plan renderizada) menciona "IA".
- Ciclos de calidad frontend y backend completos pasan.

#### 📁 Archivos involucrados

- 8 archivos frontend + guards/DTO/email service + 4 plantillas `.hbs` + seed + nueva migración de datos.

---

### T-FBK-005: Alinear el Copy/Beneficios de Premium con la Implementación Real

**Prioridad:** 🔴 Crítica
**Estimación:** 2.5 puntos
**Dependencias:** decisiones de producto de Ariel (qué features exhibir); coordinar con T-FBK-004 y T-FBK-006
**Cubre Hallazgo:** FBK-004 (puntos A, B, C)
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] Eliminar/corregir las **promesas sin sustento** (lecturas ilimitadas, sin publicidad, acceso prioritario, estadísticas, tiradas "Herradura/Año completo", historial ilimitado de rituales).
- [ ] Corregir las **clasificaciones engañosas** (tirada de 3 cartas es free, no premium; numerología con IA es premium; free tiene 30 días de historial).
- [ ] Decidir con Ariel qué **features reales no listadas** exhibir (péndulo, carta astral, oráculo, regeneración) y reflejarlas.
- [ ] **Unificar las 4 fuentes de beneficios** en una sola constante consumida por página, modales y home.
- [ ] Actualizar tests que fijen la comparativa contra los números reales.

#### 🎯 Criterios de Aceptación

- Cada beneficio mostrado en `/premium` (y home/modales) tiene contraparte real en el código; los números coinciden con la tabla de "números reales" de FBK-004.
- Existe una única fuente de beneficios; ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `premium/PremiumPage.tsx`, `lib/constants/premium-benefits.ts`, `home/PremiumBenefitsSection.tsx`, `conversion/PremiumUpgradePrompt.tsx`, `conversion/LimitReachedModal.tsx` (+ tests).

---

### T-FBK-006: Resolver la Incoherencia de la Cuota de IA

**Prioridad:** 🔴 Crítica
**Estimación:** 2 puntos
**Dependencias:** decisión de producto (¿free tiene cuota de interpretación o no?)
**Cubre Hallazgo:** FBK-004 (punto D)
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] Definir con Ariel la **regla de negocio** real: ¿la interpretación personalizada es premium-only, o free tiene una cuota mensual?
- [ ] Establecer **una sola fuente de verdad** y alinear las tres capas: seed/DB (`plans.seeder.ts`, `aiQuotaMonthly`), constante de enforcement (`ai-usage.constants.ts`) y la UI (`useUserPlanFeatures.ts`, `DailyCardExperience.tsx`).
- [ ] Migración de datos si cambia `aiQuotaMonthly` en filas existentes.
- [ ] Tests que fijen la coherencia (mismo valor en las tres capas) y el comportamiento del guard.

#### 🎯 Criterios de Aceptación

- La cuota de interpretación por plan es un único valor coherente en seed/DB, enforcement y UI; el guard bloquea/permite exactamente lo que la UI ofrece.
- Ciclo de calidad backend completo pasa.

#### 📁 Archivos involucrados

- `ai-usage/constants/ai-usage.constants.ts`, `database/seeds/plans.seeder.ts`, `ai-quota.service.ts`/`check-user-quota.use-case.ts`, migración; en frontend `useUserPlanFeatures.ts` si aplica.

---

### T-FBK-007: Alinear los Iconos del Horóscopo Chino al Canon

**Prioridad:** 🟡 Media
**Estimación:** 2 puntos
**Dependencias:** decisión de diseño (SVG monocromático vs. icon-font)
**Cubre Hallazgo:** FBK-005
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] Decidir con Ariel el set de iconos monocromáticos para los 12 animales (SVG de marca vs. icon-font).
- [ ] Crear un componente `ChineseAnimalSymbol` análogo a `ZodiacSymbol` (icono monocromático + `text-primary` + `role="img"`/`aria-label`).
- [ ] Reemplazar el render en `ChineseAnimalCard.tsx:89` y propagar a los ~5 usos restantes (`AnimalCalculator`, `ChineseHoroscopeDetail`, `ChineseHoroscopeWidget`, `ChineseCompatibility`, `AnimalHoroscopePage`).
- [ ] Tests del nuevo componente y de las tarjetas.

#### 🎯 Criterios de Aceptación

- Los animales del Horóscopo Chino se ven monocromáticos y coherentes con el Horóscopo Occidental (paleta de marca).
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- Nuevo `ChineseAnimalSymbol` (+ assets si SVG), `ChineseAnimalCard.tsx` y los ~5 consumidores del emoji (+ tests).

---

### T-FBK-008: "Tu Signo/Animal" sin Agrandar la Tarjeta

**Prioridad:** 🟡 Media
**Estimación:** 1 punto
**Dependencias:** ninguna
**Cubre Hallazgo:** FBK-006
**Estado:** 🔲 PENDIENTE

#### ✅ Tareas específicas

- [ ] Quitar (o reposicionar como `absolute`/altura fija) el `<span>` "Tu signo" (`ZodiacSignCard.tsx:93`) y "Tu animal" (`ChineseAnimalCard.tsx:91`) para que no altere el alto de la card.
- [ ] Apoyar el destacado solo en el borde existente; **unificar** el borde del chino de `border-red-500` a `border-accent`.
- [ ] Añadir `aria-label` a la `Card` para conservar la accesibilidad del estado "tu signo/animal".
- [ ] Migrar tests que dependan del texto visible al `aria-label`.

#### 🎯 Criterios de Aceptación

- Todas las tarjetas de una fila mantienen el mismo tamaño; la del usuario se destaca solo con el borde (token `accent`); la accesibilidad se conserva.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `horoscope/ZodiacSignCard.tsx`, `chinese-horoscope/ChineseAnimalCard.tsx` (+ tests).

---

## ORDEN DE EJECUCIÓN SUGERIDO

1. **T-FBK-006** y **T-FBK-005** (contratos de Premium: resolver el bug de cuota de IA y alinear el copy — mayor impacto de producto; requieren decisiones de Ariel primero).
2. **T-FBK-004** (erradicar "IA" del texto user-facing — coordinar con T-FBK-005 para tocar las filas de la comparativa una sola vez).
3. **T-FBK-001** (quick win de consistencia del upsell en el dashboard).
4. **T-FBK-003** (reubicar fichas informativas — mecánico, 9 páginas).
5. **T-FBK-008** (arreglo de grilla "tu signo/animal").
6. **T-FBK-007** (iconos del Horóscopo Chino — requiere decisión de diseño).
7. **T-FBK-002** (deuda de unificación del sistema de upsell — de cierre, prioridad baja).

---

> **Nota:** este backlog deriva de una ronda de feedback de Ariel navegando `localhost:3001` (julio 2026) y de un relevamiento de código sobre `frontend/` y `backend/tarot-app/`. Los hallazgos FBK-005/FBK-006 se apoyan en el canon visual ya establecido (Dashboard, Enciclopedia, Premium) para garantizar coherencia; FBK-003/FBK-004 nacen de reglas duras del proyecto (prohibición de "IA" en texto user-facing) y de la necesidad de que la página de Premium describa fielmente lo que el sistema entrega.
