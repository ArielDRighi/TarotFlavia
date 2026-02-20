# Rediseño del PDF de Carta Astral - Especificación de Diseño e Implementación

> **Autor**: Diseño editorial senior
> **Fecha**: 2026-02-20
> **Archivo a modificar**: `backend/tarot-app/src/modules/birth-chart/application/services/chart-pdf.service.ts`
> **Librería**: PDFKit (server-side, Node.js)

---

## 1. Diagnóstico del PDF Actual

### Problemas Detectados
1. **Sin gráficos visuales**: No hay rueda de carta astral, ni gráficos de distribución
2. **Sin aspectario**: No existe la grilla/matriz de aspectos entre planetas
3. **Sin tabla de casas**: Las cúspides de las 12 casas no se muestran
4. **Sin distribución de modalidades**: Solo se muestran elementos, faltan modalidades y polaridad
5. **Tipografía genérica**: Solo Helvetica sin jerarquía visual clara
6. **Sin numeración de páginas**
7. **Portada plana**: Fondo gris uniforme sin personalidad
8. **Sin separadores visuales**: Las secciones se mezclan visualmente
9. **Sin resumen de aspectos**: No se muestra el conteo armónicos vs desafiantes
10. **Tabla de planetas sin tratamiento visual**: Texto plano sin filas alternadas ni iconografía

---

## 2. Paleta de Colores Rediseñada

```
COLORS = {
  // Fondos
  coverGradientStart: '#1A0B2E',   // Púrpura profundo (portada)
  coverGradientEnd:   '#2D1B4E',   // Púrpura oscuro (portada)
  pageBg:             '#FFFFFF',   // Blanco para páginas interiores
  cardBg:             '#F5F3FF',   // Lavanda muy suave (cajas de contenido)
  tableRowAlt:        '#FAF8FF',   // Filas alternadas tabla

  // Texto
  textPrimary:        '#1F1135',   // Púrpura casi negro
  textSecondary:      '#6B7280',   // Gris medio
  textOnDark:         '#F5F3FF',   // Texto claro sobre fondo oscuro
  textGold:           '#D4A017',   // Dorado para nombre en portada

  // Acentos
  accentViolet:       '#8B5CF6',   // Violeta principal (títulos de sección)
  accentLightViolet:  '#C084FC',   // Violeta claro (subtítulos)
  accentGold:         '#F59E0B',   // Dorado (detalles decorativos)

  // Elementos (barras de distribución)
  elementFire:        '#EF4444',   // Rojo fuego
  elementEarth:       '#22C55E',   // Verde tierra
  elementAir:         '#FBBF24',   // Amarillo aire
  elementWater:       '#3B82F6',   // Azul agua

  // Aspectos
  aspectHarmonious:   '#10B981',   // Verde (trígono, sextil)
  aspectChallenging:  '#EF4444',   // Rojo (cuadratura, oposición)
  aspectNeutral:      '#8B5CF6',   // Violeta (conjunción)

  // Líneas y bordes
  lineLight:          '#E5E7EB',   // Líneas separadoras suaves
  lineMedium:         '#D1D5DB',   // Bordes de tabla
}
```

---

## 3. Tipografía

PDFKit incluye las fuentes Helvetica por defecto. Para mejorar la jerarquía:

```
FONTS = {
  titleLarge:  { font: 'Helvetica-Bold',  size: 32 },  // "CARTA ASTRAL"
  titleMedium: { font: 'Helvetica-Bold',  size: 22 },  // Títulos de sección
  subtitle:    { font: 'Helvetica-Bold',  size: 16 },  // Subtítulos (En Libra, En Casa 7)
  bodyLarge:   { font: 'Helvetica',       size: 12 },  // Texto principal
  bodySmall:   { font: 'Helvetica',       size: 10 },  // Texto secundario, aspectos
  caption:     { font: 'Helvetica',       size: 9  },  // Pies de página, disclaimers
  tableHeader: { font: 'Helvetica-Bold',  size: 10 },  // Encabezados de tabla
  tableBody:   { font: 'Helvetica',       size: 10 },  // Cuerpo de tabla
  symbol:      { font: 'Helvetica',       size: 14 },  // Símbolos zodiacales/planetarios
}
```

> **Mejora futura**: Registrar fuentes personalizadas (ej: Inter, Playfair Display) via `doc.registerFont()` cuando estén disponibles los archivos .ttf/.otf.

---

## 4. Estructura de Páginas (Nuevo Diseño)

### Página 1 — Portada
```
┌─────────────────────────────────────────────────────┐
│  [Fondo: Gradiente vertical púrpura profundo]       │
│                                                     │
│                                                     │
│              ── ✦ ──                                │
│                                                     │
│           C A R T A   A S T R A L                   │
│                                                     │
│             NOMBRE COMPLETO                         │
│           (color dorado, grande)                    │
│                                                     │
│           ─────────────────                         │
│                                                     │
│        Nacimiento: 17 de octubre de 1979            │
│        Hora: 22:00 · Lugar: Córdoba, Argentina      │
│                                                     │
│                                                     │
│         ┌─────────────────────────┐                 │
│         │      TU BIG THREE      │                 │
│         │                        │                 │
│         │  ☉  Sol en Libra       │                 │
│         │  ☽  Luna en Libra      │                 │
│         │  ↑  Ascendente en Aries│                 │
│         └─────────────────────────┘                 │
│                                                     │
│                                                     │
│        Generado por Auguria · 17/2/2026             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Detalles de implementación:**
- Fondo: Rectángulo completo con `fillColor(coverGradientStart)`. Agregar un segundo rectángulo con gradiente en la mitad inferior con `coverGradientEnd`
- Línea decorativa: `doc.moveTo().lineTo()` con color dorado, grosor fino
- Título "CARTA ASTRAL": Letras espaciadas (`characterSpacing: 4`), color blanco/lavanda
- Nombre: Color dorado (`textGold`), tamaño grande
- Big Three box: Rectángulo redondeado con borde semi-transparente, fondo ligeramente más claro
- Footer: Color lavanda suave, tamaño caption

---

### Página 2 — Posiciones Planetarias y Distribución
```
┌─────────────────────────────────────────────────────┐
│  POSICIONES PLANETARIAS                         2   │
│  ───────────────────────────────────                │
│                                                     │
│  ┌───────┬──────────┬──────┬────────┬───────────┐   │
│  │Planeta│  Signo   │ Casa │ Grado  │ Retrógrado│   │
│  ├───────┼──────────┼──────┼────────┼───────────┤   │
│  │ ☉ Sol │  Libra   │  7   │ 25.9°  │           │   │
│  │ ☽ Luna│  Libra   │  6   │ 12.7°  │           │   │
│  │ ☿ Merc│ Escorpio │  7   │ 18.0°  │           │   │
│  │  ...  │   ...    │ ...  │  ...   │    ...    │   │
│  └───────┴──────────┴──────┴────────┴───────────┘   │
│                                                     │
│  CÚSPIDES DE CASAS                                  │
│  ──────────────────                                 │
│  ┌──────┬──────────┬────────┐                       │
│  │ Casa │  Signo   │ Grado  │                       │
│  │  I   │  Aries   │ 12.5°  │ (2 columnas,         │
│  │  II  │  Tauro   │  8.3°  │  6 casas cada una)   │
│  │ ...  │   ...    │  ...   │                       │
│  └──────┴──────────┴────────┘                       │
│                                                     │
│  DISTRIBUCIÓN                                       │
│  ─────────────                                      │
│                                                     │
│  Elementos:                                         │
│  Fuego  ████████░░░░░  3 (27%)                      │
│  Tierra ██████░░░░░░░  2 (18%)                      │
│  Aire   ████████░░░░░  3 (27%)                      │
│  Agua   ████████░░░░░  3 (27%)                      │
│                                                     │
│  Modalidades:                                       │
│  Cardinal ████████████░  4 (36%)                    │
│  Fijo    ████████░░░░░  3 (27%)                     │
│  Mutable ████████░░░░░  3 (27%)                     │
│                                                     │
│  Polaridad:                                         │
│  Masculino ████████████  6 (55%)                    │
│  Femenino  ██████████░░  5 (45%)                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Detalles de implementación:**
- Tabla de planetas: Filas con color alternado (`tableRowAlt`), símbolos planetarios en columna izquierda
- Tabla de casas: Disposición en 2 columnas lado a lado (Casas I-VI | Casas VII-XII)
- Barras de distribución: Rectángulos coloreados proporcionales al porcentaje. Ancho máximo ~200px
  - Cada barra es un `doc.rect()` con `fillColor` del elemento + un rect de fondo gris claro
- Columna retrógrado: Mostrar "℞" si `isRetrograde === true`

---

### Página 3 — Aspectario (Grilla de Aspectos) + Resumen
```
┌─────────────────────────────────────────────────────┐
│  ASPECTARIO                                     3   │
│  ────────────                                       │
│                                                     │
│     │ ☉ │ ☽ │ ☿ │ ♀ │ ♂ │ ♃ │ ♄ │ ♅ │ ♆ │ ♇ │   │
│  ───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤   │
│  ☉  │   │   │   │   │ □ │   │   │   │   │ ☌ │   │
│  ☽  │   │   │   │   │ ⚹ │   │   │   │   │ ☌ │   │
│  ☿  │   │   │   │ ☌ │ □ │   │   │ ☌ │   │   │   │
│  ♀  │   │   │ ☌ │   │ □ │   │   │   │   │   │   │
│  ♂  │ □ │ ⚹ │ □ │ □ │   │   │   │ □ │ △ │   │   │
│  ♃  │   │   │   │   │   │   │   │   │   │   │   │
│  ♄  │   │   │   │   │   │   │   │ ⚹ │ □ │   │   │
│  ♅  │   │   │ ☌ │   │ □ │   │ ⚹ │   │   │   │   │
│  ♆  │   │   │   │   │ △ │   │ □ │   │   │ ⚹ │   │
│  ♇  │ ☌ │ ☌ │   │   │   │   │   │   │ ⚹ │   │   │
│  ───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘   │
│                                                     │
│  Leyenda:                                           │
│  ☌ Conjunción  ☍ Oposición  □ Cuadratura           │
│  △ Trígono     ⚹ Sextil                            │
│                                                     │
│  ■ Armónico (verde)  ■ Desafiante (rojo)            │
│  ■ Neutral (violeta)                                │
│                                                     │
│  ─────────────────────────────────────────          │
│                                                     │
│  RESUMEN DE ASPECTOS                                │
│  ┌─────────────────────┐                            │
│  │ Total: 15           │                            │
│  │ Armónicos: 6   ████ │                            │
│  │ Desafiantes: 7 █████│                            │
│  │ Neutrales: 2   █    │                            │
│  │                     │                            │
│  │ Aspecto más fuerte: │                            │
│  │ Sol ☌ Plutón (0.5°) │                            │
│  └─────────────────────┘                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Detalles de implementación:**
- Grilla: Tabla NxN donde N = número de planetas. Solo se rellena el triángulo inferior (evitar duplicados)
- Celdas: ~40x30px cada una. Color de fondo según naturaleza del aspecto
- Símbolos de aspecto en el centro de cada celda
- Leyenda debajo con rectángulos coloreados de ejemplo
- Resumen: Caja con `cardBg` de fondo, bordes redondeados
- Barras mini horizontales proporcionales para armónicos/desafiantes

---

### Páginas 4-6 — Big Three (Sol, Luna, Ascendente)

Cada una ocupa su propia página con layout consistente:

```
┌─────────────────────────────────────────────────────┐
│                                                 4   │
│  ┌──────────────────────────────────────────────┐   │
│  │  [Barra lateral violeta 4px]                 │   │
│  │                                              │   │
│  │   ☉  SOL                                    │   │
│  │   en Libra                                  │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [Texto de interpretación del Big Three]            │
│                                                     │
│  Lorem ipsum dolor sit amet, consectetur            │
│  adipiscing elit. Sed do eiusmod tempor              │
│  incididunt ut labore et dolore magna aliqua...     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Detalles de implementación:**
- Header box: Rectángulo con `cardBg`, barra izquierda de 4px en `accentViolet`
- Símbolo del planeta: Grande (24pt) en color violeta
- Nombre del planeta: Bold, 20pt, color `textPrimary`
- "en [Signo]": 16pt, color `accentViolet`
- Texto: 12pt, justificado, con line height generoso (1.5)

---

### Páginas 7+ — Planetas Individuales

```
┌─────────────────────────────────────────────────────┐
│                                                 7   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ☿ MERCURIO                                   │   │
│  │ en Escorpio - Casa 7                         │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [Introducción al planeta - texto en itálica o      │
│   con fondo lavanda suave como bloque destacado]    │
│                                                     │
│  ── En Escorpio ──────────────────────────          │
│                                                     │
│  [Texto de interpretación en signo]                 │
│                                                     │
│  ── En Casa 7 ────────────────────────────          │
│                                                     │
│  [Texto de interpretación en casa]                  │
│                                                     │
│  ── Aspectos ─────────────────────────────          │
│                                                     │
│  ┌──────────────────────────────────────┐           │
│  │ ☌ Conjunción con Urano        [■ N] │           │
│  │ Interpretación del aspecto...        │           │
│  └──────────────────────────────────────┘           │
│  ┌──────────────────────────────────────┐           │
│  │ □ Cuadratura con Marte        [■ D] │           │
│  │ Interpretación del aspecto...        │           │
│  └──────────────────────────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Detalles de implementación:**
- Header: Similar al Big Three pero con signo + casa
- Introducción: Bloque con fondo `cardBg` y padding, borde izquierdo dorado
- Subtítulos de sección: Con línea horizontal que se extiende hacia la derecha
- Aspectos: Cada uno en su propia caja con borde. Badge de color según naturaleza:
  - `[■ A]` = Armónico (verde), `[■ D]` = Desafiante (rojo), `[■ N]` = Neutral (violeta)
- Control de paginación: Si el contenido excede la página, continuar en la siguiente manteniendo el header del planeta

---

### Página de Síntesis IA (Premium)

```
┌─────────────────────────────────────────────────────┐
│                                                 N   │
│  ┌──────────────────────────────────────────────┐   │
│  │  ✦  SÍNTESIS PERSONALIZADA                   │   │
│  │     Análisis generado por Inteligencia       │   │
│  │     Artificial                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [Texto de síntesis con espaciado generoso]         │
│                                                     │
│  Párrafo 1...                                       │
│                                                     │
│  Párrafo 2...                                       │
│                                                     │
│  Párrafo 3...                                       │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### Última Página — Disclaimer

```
┌─────────────────────────────────────────────────────┐
│                                                 N   │
│                                                     │
│                                                     │
│                                                     │
│            ── ✦ ──                                  │
│                                                     │
│          AVISO IMPORTANTE                           │
│                                                     │
│  [Texto del disclaimer en tamaño pequeño,           │
│   color gris medio, centrado]                       │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│        © 2026 Auguria                               │
│        Todos los derechos reservados                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 5. Elementos Decorativos Recurrentes

### Header de cada página interior
- Línea fina horizontal en la parte superior (color `lineLight`)
- Número de página en la esquina superior derecha (caption, color `textSecondary`)

### Separadores de sección
- Título alineado a la izquierda + línea horizontal que se extiende hasta el margen derecho
- Formato: `"── Título ──────────────────────"`

### Decoración de portada
- Línea decorativa con punto central: `"── ✦ ──"` (se dibuja con `moveTo/lineTo` + un pequeño diamante/estrella en el centro)

---

## 6. Tareas de Implementación

### Pre-requisitos
- [ ] Leer `docs/WORKFLOW_BACKEND.md` antes de comenzar

### Fase 1: Refactoring de Base
> Preparar la estructura del servicio para el nuevo diseño

- [ ] **T1.1** Extraer la configuración de colores y fuentes en constantes/objetos tipados al inicio del servicio con la nueva paleta definida en la sección 2
- [ ] **T1.2** Crear método helper `renderPageHeader(doc, pageNumber)` que dibuja la línea superior fina y el número de página en cada página interior
- [ ] **T1.3** Crear método helper `renderSectionTitle(doc, title, y)` que renderiza un título de sección con la línea horizontal extendida hacia la derecha
- [ ] **T1.4** Crear método helper `renderContentBox(doc, x, y, width, height, options?)` que dibuja un rectángulo con fondo `cardBg`, borde redondeado opcional, y barra lateral de color
- [ ] **T1.5** Crear método helper `renderHorizontalBar(doc, x, y, width, maxWidth, color, label, value)` para las barras de distribución
- [ ] **T1.6** Crear método helper `renderAspectBadge(doc, x, y, nature)` que dibuja el badge coloreado `[A]`/`[D]`/`[N]` según naturaleza del aspecto
- [ ] **T1.7** Implementar tracking de página (`pageNumber`) incrementando en cada `addPage()` y llamando a `renderPageHeader` automáticamente

### Fase 2: Portada
> Rediseñar la portada con fondo oscuro y jerarquía visual

- [ ] **T2.1** Reemplazar el fondo gris plano por un fondo púrpura profundo (`coverGradientStart`) ocupando toda la página
- [ ] **T2.2** Agregar un segundo rectángulo en la mitad inferior con `coverGradientEnd` para simular gradiente
- [ ] **T2.3** Dibujar la decoración "── ✦ ──" centrada arriba del título (líneas doradas + punto central)
- [ ] **T2.4** Renderizar "CARTA ASTRAL" con `characterSpacing: 4`, color `textOnDark`, 32pt, centrado
- [ ] **T2.5** Renderizar el nombre en color `textGold`, 28pt, centrado
- [ ] **T2.6** Agregar línea separadora fina dorada debajo del nombre
- [ ] **T2.7** Datos de nacimiento en color `textOnDark`, 13pt
- [ ] **T2.8** Big Three en una caja con borde semi-transparente (rect con `strokeColor` blanco, `opacity` 0.3) con fondo ligeramente más claro. Incluir símbolos planetarios
- [ ] **T2.9** Footer con fecha de generación en color lavanda suave

### Fase 3: Página de Posiciones y Distribución
> Nueva página 2 con tabla mejorada y gráficos de barras

- [ ] **T3.1** Renderizar tabla de posiciones planetarias con filas alternadas (`tableRowAlt` / blanco)
- [ ] **T3.2** Agregar columna de símbolo planetario a la izquierda de cada fila
- [ ] **T3.3** Agregar columna "Retrógrado" que muestra "℞" cuando `isRetrograde === true`
- [ ] **T3.4** Renderizar tabla de cúspides de casas en 2 columnas lado a lado (Casas I-VI | Casas VII-XII). Usar los datos de `chartData.houses`
- [ ] **T3.5** Renderizar barras horizontales de distribución de **Elementos** con colores: Fuego=rojo, Tierra=verde, Aire=amarillo, Agua=azul
- [ ] **T3.6** Renderizar barras horizontales de distribución de **Modalidades** (Cardinal, Fijo, Mutable) con tonos violeta
- [ ] **T3.7** Renderizar barras horizontales de distribución de **Polaridad** (Masculino/Femenino) usando los datos de `chartData.distribution.polarity`

### Fase 4: Aspectario (Grilla de Aspectos) — NUEVA PÁGINA
> Agregar la página 3 con la matriz de aspectos

- [ ] **T4.1** Crear nuevo método `renderAspectGridPage(doc, chartData)`
- [ ] **T4.2** Construir una grilla de 10x10 (planetas) donde cada celda muestra el símbolo del aspecto si existe entre esos dos planetas. Solo rellenar el triángulo inferior para evitar duplicados
- [ ] **T4.3** Colorear el fondo de cada celda según la naturaleza del aspecto (`aspectHarmonious`, `aspectChallenging`, `aspectNeutral`)
- [ ] **T4.4** Renderizar encabezados de fila y columna con símbolos planetarios
- [ ] **T4.5** Agregar leyenda debajo de la grilla explicando cada símbolo de aspecto y su color
- [ ] **T4.6** Agregar sección "RESUMEN DE ASPECTOS" con caja que muestre:
  - Total de aspectos
  - Cantidad armónicos vs desafiantes vs neutrales (con mini-barras)
  - Aspecto más fuerte (menor orbe)
  - Usar datos de `interpretation.aspectSummary`

### Fase 5: Big Three Rediseñado
> Mejorar las páginas del Big Three con boxes y mejor jerarquía

- [ ] **T5.1** Rediseñar `renderBigThreeSection` para usar un header box con:
  - Fondo `cardBg`
  - Barra lateral izquierda de 4px en `accentViolet`
  - Símbolo del planeta grande (24pt) en violeta
  - Nombre del planeta en bold 20pt
  - "en [Signo]" en 16pt violeta debajo
- [ ] **T5.2** Renderizar el texto de interpretación con `lineGap: 4` para mejor legibilidad
- [ ] **T5.3** Asegurar que cada sección del Big Three comienza en una nueva página con `renderPageHeader`

### Fase 6: Páginas de Planetas Rediseñadas
> Mejorar el layout de cada planeta individual

- [ ] **T6.1** Rediseñar header del planeta con box similar al Big Three (fondo + barra lateral)
- [ ] **T6.2** Renderizar la introducción del planeta en un bloque destacado con fondo `cardBg` y borde izquierdo dorado (`accentGold`), padding de 10px
- [ ] **T6.3** Implementar subtítulos de sección ("En [Signo]", "En Casa [N]", "Aspectos") con el formato de línea extendida
- [ ] **T6.4** Renderizar cada aspecto en su propia caja con:
  - Borde sutil (`lineLight`)
  - Nombre del aspecto en bold con badge de color según naturaleza
  - Texto de interpretación debajo
- [ ] **T6.5** Mejorar el control de paginación: al inicio de cada nueva sección verificar espacio disponible. Si la sección no cabe (menos de 150px restantes), saltar a nueva página

### Fase 7: Síntesis IA
> Mejorar la presentación de la síntesis

- [ ] **T7.1** Agregar header box con ícono "✦" y texto "SÍNTESIS PERSONALIZADA" con subtítulo "Análisis generado por Inteligencia Artificial"
- [ ] **T7.2** Renderizar párrafos con `lineGap: 6` y separación entre párrafos de 15px
- [ ] **T7.3** Control de paginación para textos largos que excedan una página

### Fase 8: Disclaimer
> Darle un diseño más limpio y elegante

- [ ] **T8.1** Centrar verticalmente el contenido en la página
- [ ] **T8.2** Agregar decoración "── ✦ ──" arriba del título
- [ ] **T8.3** Texto del disclaimer en `textSecondary`, centrado, con `lineGap: 4`
- [ ] **T8.4** Copyright y nombre de Auguria al final con separador

### Fase 9: Integración y Flujo Principal
> Actualizar `generatePDF()` para incluir las nuevas páginas

- [ ] **T9.1** Actualizar el flujo de `generatePDF()` para insertar la nueva página de Aspectario (Fase 4) entre la página de Posiciones y el Big Three
- [ ] **T9.2** Verificar que el `pageCount` se actualiza correctamente con la nueva página
- [ ] **T9.3** Asegurar que `renderPageHeader` se llama en todas las páginas interiores (no en portada)

### Fase 10: Tests
> Actualizar tests existentes y agregar nuevos

- [ ] **T10.1** Actualizar `chart-pdf.service.spec.ts` para reflejar el nuevo número de páginas esperado
- [ ] **T10.2** Agregar test para verificar que la grilla de aspectos se genera correctamente
- [ ] **T10.3** Agregar test para verificar que las barras de distribución manejan correctamente porcentajes de 0% y 100%
- [ ] **T10.4** Agregar test para verificar el rendering de la tabla de casas
- [ ] **T10.5** Ejecutar ciclo de calidad completo: `npm run format && npm run lint && npm run test:cov && npm run build`

### Fase 11: QA Visual
> Verificación manual del PDF generado

- [ ] **T11.1** Generar un PDF de prueba y verificar visualmente cada página
- [ ] **T11.2** Verificar que los saltos de página funcionan correctamente en planetas con muchos aspectos
- [ ] **T11.3** Verificar que los símbolos Unicode se renderizan correctamente (☉, ☽, ☿, ♀, ♂, ♃, ♄, ♅, ♆, ♇, ☌, ☍, □, △, ⚹, ℞)
- [ ] **T11.4** Verificar el PDF con nombres largos y con caracteres especiales
- [ ] **T11.5** Verificar la versión Free (sin síntesis IA) y Premium (con síntesis IA)

---

## 7. Datos Disponibles (Referencia Rápida)

| Dato | Origen | Usado actualmente | Nuevo uso |
|------|--------|-------------------|-----------|
| `chartData.planets[]` | Cálculos | Tabla posiciones | Tabla mejorada + Aspectario |
| `chartData.houses[]` | Cálculos | NO | Tabla de casas (nuevo) |
| `chartData.aspects[]` | Cálculos | Solo en interpretación | Grilla de aspectos (nuevo) |
| `chartData.distribution.elements` | Cálculos | Texto simple | Barras coloreadas (nuevo) |
| `chartData.distribution.modalities` | Cálculos | NO | Barras coloreadas (nuevo) |
| `chartData.distribution.polarity` | Cálculos | NO | Barras coloreadas (nuevo) |
| `interpretation.aspectSummary` | Servicio | NO | Resumen de aspectos (nuevo) |
| `interpretation.distribution` | Servicio | Elementos solo | Elementos + Modalidades |

---

## 8. Notas para Implementación con PDFKit

### Gradiente simulado
PDFKit no tiene gradientes nativos. Simular con múltiples rectángulos de colores progresivos:
```js
// Simular gradiente con 2 bloques
doc.rect(0, 0, width, height/2).fill('#1A0B2E');
doc.rect(0, height/2, width, height/2).fill('#2D1B4E');
```

### Rectángulos redondeados
```js
doc.roundedRect(x, y, width, height, cornerRadius).fill(color);
```

### Barra lateral de color en boxes
```js
// Primero el fondo
doc.roundedRect(x, y, w, h, 4).fill(cardBg);
// Luego la barra lateral (sobreescribe la esquina izquierda)
doc.rect(x, y, 4, h).fill(accentViolet);
```

### Character spacing para títulos
```js
doc.text('CARTA ASTRAL', x, y, { characterSpacing: 4, align: 'center' });
```

### Opacidad
```js
doc.save();
doc.opacity(0.3);
doc.rect(x, y, w, h).stroke('#FFFFFF');
doc.restore();
```

---

## 9. Mejoras Futuras (No incluir en esta implementación)

- Fuentes personalizadas (Playfair Display para títulos, Inter para cuerpo)
- Logo de Auguria en portada y header
- Rueda de carta astral generada programáticamente (SVG → PDF)
- Marca de agua para versión Free
- QR code con link al resultado online
- Versión en inglés
