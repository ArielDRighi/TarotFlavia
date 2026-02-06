# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7A: HISTORIAS DE USUARIO

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.1  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## ÍNDICE DE HISTORIAS DE USUARIO

| ID        | Historia                              | Prioridad | Plan         |
| --------- | ------------------------------------- | --------- | ------------ |
| HU-CA-001 | Generar carta astral básica           | Must      | Todos        |
| HU-CA-002 | Ver gráfico de la carta               | Must      | Todos        |
| HU-CA-003 | Ver posiciones planetarias            | Must      | Todos        |
| HU-CA-004 | Ver interpretación Big Three          | Must      | Todos        |
| HU-CA-005 | Ver informe completo estático         | Must      | Free/Premium |
| HU-CA-006 | Recibir síntesis personalizada con IA | Must      | Premium      |
| HU-CA-007 | Descargar carta en PDF                | Should    | Free/Premium |
| HU-CA-008 | Guardar carta en historial            | Should    | Premium      |
| HU-CA-009 | Ver historial de cartas               | Should    | Premium      |
| HU-CA-010 | Controlar límites de uso              | Must      | Todos        |
| HU-CA-011 | Configurar límites desde admin        | Should    | Admin        |
| HU-CA-012 | Seleccionar lugar de nacimiento       | Must      | Todos        |

---

## DETALLE DE HISTORIAS DE USUARIO

### HU-CA-001: Generar Carta Astral Básica

**Como** usuario de Auguria (anónimo, free o premium)  
**Quiero** ingresar mis datos de nacimiento (fecha, hora, lugar)  
**Para** obtener mi carta astral calculada con precisión astronómica

#### Criterios de Aceptación:

1. **Dado** que estoy en la página de Carta Astral  
   **Cuando** completo el formulario con nombre, fecha, hora y lugar de nacimiento  
   **Entonces** el sistema calcula las posiciones planetarias usando Swiss Ephemeris o equivalente

2. **Dado** que ingresé datos válidos  
   **Cuando** el sistema procesa la solicitud  
   **Entonces** obtengo las posiciones de: Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno, Plutón

3. **Dado** que el cálculo fue exitoso  
   **Cuando** se muestran los resultados  
   **Entonces** veo el grado exacto y signo de cada planeta

4. **Dado** que ingresé la hora de nacimiento  
   **Cuando** el sistema calcula  
   **Entonces** también calcula el Ascendente y las 12 casas (sistema Placidus)

5. **Dado** que hay planetas en la carta  
   **Cuando** el sistema analiza sus posiciones  
   **Entonces** identifica los aspectos mayores entre ellos (conjunción, oposición, cuadratura, trígono, sextil)

#### Notas Técnicas:

- Usar librería sweph o circular-natal-horoscope-js para cálculos
- Precisión mínima: 1 grado (preferible: minutos de arco)
- Considerar zona horaria del lugar de nacimiento
- Convertir hora local a tiempo universal para cálculos

#### Estimación: 8 puntos

---

### HU-CA-002: Ver Gráfico de la Carta

**Como** usuario que generó su carta astral  
**Quiero** ver un gráfico circular (rueda zodiacal) con mis planetas posicionados  
**Para** visualizar mi carta de forma tradicional y comprensible

#### Criterios de Aceptación:

1. **Dado** que mi carta fue calculada  
   **Cuando** veo los resultados  
   **Entonces** veo un gráfico SVG circular con los 12 signos del zodíaco

2. **Dado** que el gráfico se muestra  
   **Cuando** observo los planetas  
   **Entonces** cada planeta aparece posicionado en su grado y signo correcto

3. **Dado** que la carta tiene casas calculadas  
   **Cuando** veo el gráfico  
   **Entonces** las líneas de las casas están visibles dividiendo la rueda

4. **Dado** que hay aspectos entre planetas  
   **Cuando** veo el gráfico  
   **Entonces** se muestran líneas conectando los planetas con aspectos (colores diferenciados por tipo)

5. **Dado** que veo el gráfico en cualquier dispositivo  
   **Cuando** cambio el tamaño de pantalla  
   **Entonces** el SVG se escala correctamente sin perder calidad

#### Notas Técnicas:

- Usar librería @astrodraw/astrochart para generación SVG
- El gráfico debe ser exportable para inclusión en PDF
- Colores de aspectos: Conjunción (verde), Oposición (rojo), Cuadratura (rojo), Trígono (azul), Sextil (azul)

#### Estimación: 5 puntos

---

### HU-CA-003: Ver Posiciones Planetarias

**Como** usuario que generó su carta astral  
**Quiero** ver tablas organizadas con todas las posiciones  
**Para** conocer los datos exactos de mi carta

#### Criterios de Aceptación:

1. **Dado** que mi carta fue calculada  
   **Cuando** veo la sección de posiciones  
   **Entonces** veo una tabla con: Planeta | Grado | Signo | Casa

2. **Dado** que veo la tabla de planetas  
   **Cuando** observo cada fila  
   **Entonces** veo el símbolo del planeta, grado con minutos, signo zodiacal y número de casa

3. **Dado** que mi carta tiene casas  
   **Cuando** veo la sección de casas  
   **Entonces** veo una tabla con: Casa | Grado | Signo (cúspide de cada casa)

4. **Dado** que hay aspectos calculados  
   **Cuando** veo la sección de aspectos  
   **Entonces** veo un aspectario (matriz) mostrando los aspectos entre planetas

5. **Dado** que veo las tablas  
   **Cuando** interactúo con ellas  
   **Entonces** puedo ordenar o filtrar la información (opcional)

#### Notas Técnicas:

- Usar símbolos astrológicos (Unicode o iconos SVG)
- El aspectario es una matriz triangular (evitar duplicados)
- Mostrar símbolo del aspecto en la matriz

#### Estimación: 3 puntos

---

### HU-CA-004: Ver Interpretación Big Three

**Como** usuario de cualquier plan (incluso anónimo)  
**Quiero** ver la interpretación de mi Sol, Luna y Ascendente  
**Para** entender los tres pilares fundamentales de mi carta

#### Criterios de Aceptación:

1. **Dado** que mi carta fue calculada  
   **Cuando** veo las interpretaciones  
   **Entonces** veo la interpretación del Sol en mi signo zodiacal

2. **Dado** que mi carta tiene Luna calculada  
   **Cuando** veo las interpretaciones  
   **Entonces** veo la interpretación de la Luna en mi signo zodiacal

3. **Dado** que tengo hora de nacimiento y Ascendente calculado  
   **Cuando** veo las interpretaciones  
   **Entonces** veo la interpretación del Ascendente en mi signo

4. **Dado** que soy usuario anónimo  
   **Cuando** veo el Big Three  
   **Entonces** SOLO veo estas tres interpretaciones (no el resto de planetas)

5. **Dado** que las interpretaciones se muestran  
   **Cuando** las leo  
   **Entonces** son textos de al menos 2-3 párrafos con contenido significativo

#### Notas Técnicas:

- Textos provienen de la tabla BirthChartInterpretation
- 12 textos para Sol en signo + 12 para Luna + 12 para Ascendente = 36 textos mínimos
- Estos textos se muestran a TODOS los planes

#### Estimación: 3 puntos

---

### HU-CA-005: Ver Informe Completo Estático

**Como** usuario Free o Premium  
**Quiero** ver interpretaciones de todos los elementos de mi carta  
**Para** obtener un análisis astrológico profundo

#### Criterios de Aceptación:

1. **Dado** que soy usuario Free o Premium  
   **Cuando** genero mi carta  
   **Entonces** veo interpretaciones para TODOS los planetas en sus signos

2. **Dado** que mi carta tiene planetas en casas  
   **Cuando** veo las interpretaciones  
   **Entonces** veo la interpretación de cada planeta en su casa

3. **Dado** que hay aspectos entre planetas  
   **Cuando** veo las interpretaciones  
   **Entonces** veo la interpretación de cada aspecto significativo

4. **Dado** que veo una interpretación de planeta  
   **Cuando** la expando  
   **Entonces** veo: Introducción del planeta + Planeta en Signo + Planeta en Casa + Aspectos

5. **Dado** que veo la distribución de mi carta  
   **Cuando** analizo los porcentajes  
   **Entonces** veo distribución por: Elementos (Fuego, Tierra, Aire, Agua), Modalidades (Cardinal, Fijo, Mutable), Temperamento (Masculino, Femenino)

#### Notas Técnicas:

- Estructura similar al PDF de Los Arcanos
- ~490 textos estáticos en base de datos
- Usar acordeones o tabs para organizar la información
- Usuario anónimo NO ve esta sección completa

#### Estimación: 5 puntos

---

### HU-CA-006: Recibir Síntesis Personalizada con IA

**Como** usuario Premium  
**Quiero** recibir una síntesis que conecte todos los elementos de mi carta  
**Para** obtener una interpretación única y personalizada

#### Criterios de Aceptación:

1. **Dado** que soy usuario Premium  
   **Cuando** genero mi carta  
   **Entonces** veo una sección adicional "Síntesis Personalizada"

2. **Dado** que la IA procesa mi carta  
   **Cuando** veo la síntesis  
   **Entonces** el texto conecta elementos de mi carta entre sí (ej: "Tu Sol en Géminis combinado con Luna en Escorpio sugiere...")

3. **Dado** que recibo la síntesis  
   **Cuando** la leo  
   **Entonces** es un texto único de 3-5 párrafos que no podría aplicar a otra persona

4. **Dado** que soy usuario Free o Anónimo  
   **Cuando** veo la carta  
   **Entonces** NO veo la síntesis IA, pero veo un CTA "Actualiza a Premium para síntesis personalizada"

5. **Dado** que genero mi carta como Premium  
   **Cuando** la guardo  
   **Entonces** la síntesis IA se guarda junto con la carta para futuras consultas

#### Notas Técnicas:

- Llamar a API de IA (modelo a definir) con prompt específico
- El prompt incluye los datos de la carta + las interpretaciones base
- Cachear resultado para no regenerar si se consulta de nuevo
- Implementar manejo de errores si la IA falla

#### Estimación: 5 puntos

---

### HU-CA-007: Descargar Carta en PDF

**Como** usuario Free o Premium  
**Quiero** descargar mi carta astral en formato PDF  
**Para** guardarla, imprimirla o compartirla

#### Criterios de Aceptación:

1. **Dado** que soy usuario Free o Premium  
   **Cuando** veo mi carta generada  
   **Entonces** veo un botón "Descargar PDF"

2. **Dado** que hago clic en descargar  
   **Cuando** el PDF se genera  
   **Entonces** incluye: Portada, Gráfico, Tablas, Interpretaciones

3. **Dado** que soy usuario Premium  
   **Cuando** descargo el PDF  
   **Entonces** también incluye la sección de Síntesis IA

4. **Dado** que el PDF se genera  
   **Cuando** lo abro  
   **Entonces** tiene formato profesional similar al de Los Arcanos (múltiples páginas bien estructuradas)

5. **Dado** que soy usuario Anónimo  
   **Cuando** veo mi carta  
   **Entonces** NO veo opción de descargar PDF, solo CTA para registrarse

#### Notas Técnicas:

- Usar skill de PDF del proyecto
- El PDF puede tener 10-20 páginas dependiendo del plan
- Incluir branding de Auguria
- Incluir disclaimer al final
- **Free:** El PDF es la única forma de "guardar" su carta (no tiene historial)

#### Estimación: 8 puntos

---

### HU-CA-008: Guardar Carta en Historial

**Como** usuario Premium  
**Quiero** guardar las cartas que genero  
**Para** consultarlas después sin tener que regenerarlas

#### Criterios de Aceptación:

1. **Dado** que soy usuario Premium  
   **Cuando** genero una carta  
   **Entonces** se guarda automáticamente en mi historial

2. **Dado** que la carta se guarda  
   **Cuando** accedo después  
   **Entonces** puedo ver todos los datos sin consumir una nueva generación

3. **Dado** que tengo cartas guardadas  
   **Cuando** genero una nueva para la misma persona (mismos datos)  
   **Entonces** el sistema me avisa que ya existe y ofrece verla

4. **Dado** que tengo cartas guardadas  
   **Cuando** quiero eliminar una  
   **Entonces** puedo hacerlo con confirmación

5. **Dado** que soy usuario Free o Anónimo  
   **Cuando** genero una carta  
   **Entonces** NO se guarda en ningún historial (es efímera, solo pueden descargar PDF)

#### Notas Técnicas:

- Guardar en tabla BirthChart con userId
- Guardar JSON completo de la carta para no recalcular
- Índice único por userId + birthDate + birthTime + coordenadas (para detectar duplicados)
- **Solo Premium:** Free y Anónimo no tienen acceso a esta funcionalidad

#### Estimación: 3 puntos

---

### HU-CA-009: Ver Historial de Cartas

**Como** usuario Premium  
**Quiero** ver todas las cartas que he generado  
**Para** acceder fácilmente a ellas

#### Criterios de Aceptación:

1. **Dado** que soy usuario Premium  
   **Cuando** accedo a la sección de historial  
   **Entonces** veo una lista de todas mis cartas guardadas

2. **Dado** que veo la lista  
   **Cuando** observo cada entrada  
   **Entonces** veo: Nombre, Fecha de nacimiento, Signo Solar, Fecha de creación

3. **Dado** que veo una carta en la lista  
   **Cuando** hago clic en ella  
   **Entonces** veo el detalle completo de la carta

4. **Dado** que estoy en el detalle de una carta guardada  
   **Cuando** quiero el PDF  
   **Entonces** puedo descargarlo sin consumir generación

5. **Dado** que soy usuario Free o Anónimo  
   **Cuando** intento acceder al historial  
   **Entonces** veo CTA "Actualiza a Premium para guardar tus cartas"

#### Notas Técnicas:

- Endpoint GET /birth-chart/history con paginación
- Mostrar thumbnail o mini-gráfico en la lista (opcional)
- Lazy loading para listas largas
- **Solo Premium:** Verificar plan antes de mostrar historial

#### Estimación: 3 puntos

---

### HU-CA-010: Controlar Límites de Uso

**Como** sistema  
**Quiero** controlar cuántas cartas puede generar cada tipo de usuario  
**Para** gestionar recursos y diferenciar planes

#### Criterios de Aceptación:

1. **Dado** que soy usuario Anónimo  
   **Cuando** intento generar una carta  
   **Entonces** el sistema verifica si ya usé mi única carta lifetime

2. **Dado** que soy usuario Free  
   **Cuando** intento generar una carta  
   **Entonces** el sistema verifica si tengo disponibles de mis 3 mensuales

3. **Dado** que soy usuario Premium  
   **Cuando** intento generar una carta  
   **Entonces** el sistema verifica si tengo disponibles de mis 5 mensuales

4. **Dado** que no tengo cartas disponibles  
   **Cuando** intento generar  
   **Entonces** veo mensaje explicativo y CTA apropiado según mi plan

5. **Dado** que es día 1 del mes  
   **Cuando** el sistema procesa  
   **Entonces** resetea los contadores mensuales de Free y Premium

#### Límites Definidos:

- **Anónimo:** 1 lifetime total
- **Free:** 3 por mes
- **Premium:** 5 por mes

#### Notas Técnicas:

- **IMPORTANTE:** Analizar y reutilizar el sistema de límites existente (tarot, péndulo, etc.)
- El sistema existente maneja límites DIARIOS; adaptar para soportar límites MENSUALES
- Centralizar la lógica de límites si no está centralizada
- Integrar carta astral al sistema existente en lugar de crear lógica nueva
- Para anónimos: reutilizar tracking existente (cookies/fingerprint)

#### Estimación: 5 puntos

---

### HU-CA-011: Configurar Límites desde Admin

**Como** administrador de Auguria  
**Quiero** poder ajustar los límites de uso desde el panel de administración  
**Para** responder a necesidades del negocio sin deploy

#### Criterios de Aceptación:

1. **Dado** que soy administrador  
   **Cuando** accedo al panel de configuración  
   **Entonces** veo los límites actuales de carta astral por plan

2. **Dado** que quiero cambiar el límite Free  
   **Cuando** modifico el valor y guardo  
   **Entonces** el nuevo límite aplica inmediatamente

3. **Dado** que quiero cambiar el límite Premium  
   **Cuando** modifico el valor y guardo  
   **Entonces** el nuevo límite aplica inmediatamente

4. **Dado** que cambio un límite  
   **Cuando** los usuarios generan cartas  
   **Entonces** respetan el nuevo límite

5. **Dado** que configuro límites  
   **Cuando** veo el histórico  
   **Entonces** puedo ver cuándo se cambió cada límite (auditoría)

#### Notas Técnicas:

- El límite de anónimos (1 lifetime) NO es configurable
- Reutilizar panel de admin existente para límites
- Cachear valores para no consultar DB en cada request

#### Estimación: 2 puntos

---

### HU-CA-012: Seleccionar Lugar de Nacimiento

**Como** usuario generando mi carta  
**Quiero** buscar y seleccionar mi lugar de nacimiento fácilmente  
**Para** obtener las coordenadas correctas para el cálculo

#### Criterios de Aceptación:

1. **Dado** que estoy en el formulario de carta astral  
   **Cuando** empiezo a escribir el lugar de nacimiento  
   **Entonces** veo sugerencias de lugares que coinciden

2. **Dado** que veo sugerencias  
   **Cuando** selecciono una  
   **Entonces** el campo se completa con el nombre completo del lugar

3. **Dado** que seleccioné un lugar  
   **Cuando** el sistema procesa  
   **Entonces** obtiene automáticamente: latitud, longitud, zona horaria

4. **Dado** que mi lugar no aparece en sugerencias  
   **Cuando** lo escribo manualmente  
   **Entonces** el sistema intenta geocodificarlo igualmente

5. **Dado** que el lugar no puede geocodificarse  
   **Cuando** intento continuar  
   **Entonces** veo un mensaje de error pidiendo verificar o ingresar otro lugar

#### Notas Técnicas:

- Usar API de geocoding (Google Places, OpenStreetMap Nominatim, o similar)
- Cachear lugares comunes para reducir llamadas a API
- La zona horaria es crucial para la precisión del cálculo
- Considerar cambios históricos de zona horaria para fechas antiguas

#### Estimación: 5 puntos

---

## RESUMEN DE ESTIMACIÓN

| Historia  | Puntos        |
| --------- | ------------- |
| HU-CA-001 | 8             |
| HU-CA-002 | 5             |
| HU-CA-003 | 3             |
| HU-CA-004 | 3             |
| HU-CA-005 | 5             |
| HU-CA-006 | 5             |
| HU-CA-007 | 8             |
| HU-CA-008 | 3             |
| HU-CA-009 | 3             |
| HU-CA-010 | 5             |
| HU-CA-011 | 2             |
| HU-CA-012 | 5             |
| **TOTAL** | **55 puntos** |

---

## MATRIZ DE FUNCIONALIDADES POR PLAN

| Funcionalidad                            | Anónimo         | Free       | Premium    |
| ---------------------------------------- | --------------- | ---------- | ---------- |
| Generar carta                            | ✅ (1 lifetime) | ✅ (3/mes) | ✅ (5/mes) |
| Ver gráfico SVG                          | ✅              | ✅         | ✅         |
| Ver tablas (posiciones, casas, aspectos) | ✅              | ✅         | ✅         |
| Interpretación Big Three                 | ✅              | ✅         | ✅         |
| Informe completo estático                | ❌              | ✅         | ✅         |
| Síntesis IA personalizada                | ❌              | ❌         | ✅         |
| Descargar PDF                            | ❌              | ✅         | ✅         |
| Guardar en historial                     | ❌              | ❌         | ✅         |
| Ver historial                            | ❌              | ❌         | ✅         |

---

## PRÓXIMOS PASOS

Una vez aprobadas las historias de usuario, se procederá a crear las tareas técnicas distribuidas en 18 partes (PARTE-7B a PARTE-7S), con 5 tareas cada una.

---

**FIN DE PARTE 7A - HISTORIAS DE USUARIO**

# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7B: TAREAS DE BACKEND - ENTIDADES Y BASE DE DATOS

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.0  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## RESUMEN DE PARTE 7B

Esta parte cubre la creación de entidades, enums, migraciones y configuración de base de datos necesarias para el módulo de Carta Astral.

| Tarea    | Título                                     | Tipo    | Prioridad | Estimación |
| -------- | ------------------------------------------ | ------- | --------- | ---------- |
| T-CA-001 | Crear enums astrológicos                   | Backend | Must      | 2h         |
| T-CA-002 | Crear entidad BirthChart                   | Backend | Must      | 3h         |
| T-CA-003 | Crear entidad BirthChartInterpretation     | Backend | Must      | 3h         |
| T-CA-004 | Crear migración de tablas principales      | Backend | Must      | 2h         |
| T-CA-005 | Crear seeder de interpretaciones estáticas | Backend | Must      | 4h         |

**Total estimado:** 14 horas

---

## DETALLE DE TAREAS

### T-CA-001: Crear Enums Astrológicos ✅

**Estado:** ✅ COMPLETADA

**Historia relacionada:** HU-CA-001, HU-CA-003, HU-CA-004, HU-CA-005

**Descripción:**
Crear los enums TypeScript necesarios para representar los elementos astrológicos del sistema: planetas, signos zodiacales, casas, tipos de aspectos y categorías de interpretación.

**Ubicación:** `src/modules/birth-chart/domain/enums/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── domain/
    └── enums/
        ├── index.ts
        ├── planet.enum.ts
        ├── zodiac-sign.enum.ts
        ├── aspect-type.enum.ts
        ├── house.enum.ts
        └── interpretation-category.enum.ts
```

**Implementación:**

```typescript
// planet.enum.ts
export enum Planet {
  SUN = "sun",
  MOON = "moon",
  MERCURY = "mercury",
  VENUS = "venus",
  MARS = "mars",
  JUPITER = "jupiter",
  SATURN = "saturn",
  URANUS = "uranus",
  NEPTUNE = "neptune",
  PLUTO = "pluto",
}

// Metadata de planetas para UI y cálculos
export const PlanetMetadata: Record<
  Planet,
  {
    name: string;
    symbol: string;
    unicode: string;
  }
> = {
  [Planet.SUN]: { name: "Sol", symbol: "☉", unicode: "\u2609" },
  [Planet.MOON]: { name: "Luna", symbol: "☽", unicode: "\u263D" },
  [Planet.MERCURY]: { name: "Mercurio", symbol: "☿", unicode: "\u263F" },
  [Planet.VENUS]: { name: "Venus", symbol: "♀", unicode: "\u2640" },
  [Planet.MARS]: { name: "Marte", symbol: "♂", unicode: "\u2642" },
  [Planet.JUPITER]: { name: "Júpiter", symbol: "♃", unicode: "\u2643" },
  [Planet.SATURN]: { name: "Saturno", symbol: "♄", unicode: "\u2644" },
  [Planet.URANUS]: { name: "Urano", symbol: "♅", unicode: "\u2645" },
  [Planet.NEPTUNE]: { name: "Neptuno", symbol: "♆", unicode: "\u2646" },
  [Planet.PLUTO]: { name: "Plutón", symbol: "♇", unicode: "\u2647" },
};
```

```typescript
// zodiac-sign.enum.ts
export enum ZodiacSign {
  ARIES = "aries",
  TAURUS = "taurus",
  GEMINI = "gemini",
  CANCER = "cancer",
  LEO = "leo",
  VIRGO = "virgo",
  LIBRA = "libra",
  SCORPIO = "scorpio",
  SAGITTARIUS = "sagittarius",
  CAPRICORN = "capricorn",
  AQUARIUS = "aquarius",
  PISCES = "pisces",
}

export const ZodiacSignMetadata: Record<
  ZodiacSign,
  {
    name: string;
    symbol: string;
    unicode: string;
    element: "fire" | "earth" | "air" | "water";
    modality: "cardinal" | "fixed" | "mutable";
    startDate: { month: number; day: number };
    endDate: { month: number; day: number };
  }
> = {
  [ZodiacSign.ARIES]: {
    name: "Aries",
    symbol: "♈",
    unicode: "\u2648",
    element: "fire",
    modality: "cardinal",
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
  },
  // ... resto de signos
};
```

```typescript
// aspect-type.enum.ts
export enum AspectType {
  CONJUNCTION = "conjunction",
  OPPOSITION = "opposition",
  SQUARE = "square",
  TRINE = "trine",
  SEXTILE = "sextile",
}

export const AspectMetadata: Record<
  AspectType,
  {
    name: string;
    symbol: string;
    angle: number;
    orb: number; // Orbe permitido en grados
    nature: "harmonious" | "challenging" | "neutral";
  }
> = {
  [AspectType.CONJUNCTION]: {
    name: "Conjunción",
    symbol: "☌",
    angle: 0,
    orb: 8,
    nature: "neutral",
  },
  [AspectType.OPPOSITION]: {
    name: "Oposición",
    symbol: "☍",
    angle: 180,
    orb: 8,
    nature: "challenging",
  },
  [AspectType.SQUARE]: {
    name: "Cuadratura",
    symbol: "□",
    angle: 90,
    orb: 6,
    nature: "challenging",
  },
  [AspectType.TRINE]: {
    name: "Trígono",
    symbol: "△",
    angle: 120,
    orb: 8,
    nature: "harmonious",
  },
  [AspectType.SEXTILE]: {
    name: "Sextil",
    symbol: "⚹",
    angle: 60,
    orb: 4,
    nature: "harmonious",
  },
};
```

```typescript
// house.enum.ts
export enum House {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
  FIFTH = 5,
  SIXTH = 6,
  SEVENTH = 7,
  EIGHTH = 8,
  NINTH = 9,
  TENTH = 10,
  ELEVENTH = 11,
  TWELFTH = 12,
}

export const HouseMetadata: Record<
  House,
  {
    name: string;
    theme: string;
    keywords: string[];
  }
> = {
  [House.FIRST]: {
    name: "Casa I",
    theme: "Identidad",
    keywords: ["yo", "apariencia", "personalidad"],
  },
  // ... resto de casas
};
```

```typescript
// interpretation-category.enum.ts
export enum InterpretationCategory {
  PLANET_INTRO = "planet_intro", // Introducción general del planeta
  PLANET_IN_SIGN = "planet_in_sign", // Planeta en signo
  PLANET_IN_HOUSE = "planet_in_house", // Planeta en casa
  ASPECT = "aspect", // Aspecto entre planetas
  ASCENDANT = "ascendant", // Ascendente en signo
}
```

**Criterios de aceptación:**

- [x] Todos los enums creados con valores string lowercase
- [x] Metadata de cada enum con información para UI
- [x] Archivo index.ts exportando todos los enums
- [x] Tests unitarios para validar metadata
- [x] Documentación JSDoc en cada enum

**Dependencias:** Ninguna

**Estimación:** 2 horas

---

### T-CA-002: Crear Entidad BirthChart

**Historia relacionada:** HU-CA-001, HU-CA-008, HU-CA-009

**Descripción:**
Crear la entidad principal `BirthChart` que almacena las cartas astrales generadas por usuarios Premium. Incluye datos de nacimiento, posiciones calculadas y relación con usuario.

**Ubicación:** `src/modules/birth-chart/infrastructure/entities/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── infrastructure/
    └── entities/
        ├── index.ts
        └── birth-chart.entity.ts
```

**Implementación:**

```typescript
// birth-chart.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../../users/entities/user.entity";

/**
 * Interfaz para posición de un planeta
 */
export interface PlanetPosition {
  planet: string;
  longitude: number; // Grados absolutos (0-360)
  sign: string; // Signo zodiacal
  signDegree: number; // Grado dentro del signo (0-30)
  house: number; // Número de casa (1-12)
  isRetrograde: boolean; // Si está retrógrado
}

/**
 * Interfaz para cúspide de casa
 */
export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  signDegree: number;
}

/**
 * Interfaz para aspecto entre planetas
 */
export interface ChartAspect {
  planet1: string;
  planet2: string;
  aspectType: string;
  angle: number;
  orb: number;
  isApplying: boolean;
}

/**
 * Interfaz para distribución de elementos/modalidades
 */
export interface ChartDistribution {
  elements: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalities: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  polarity: {
    masculine: number;
    feminine: number;
  };
}

/**
 * Interfaz completa de datos calculados de la carta
 */
export interface ChartData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: ChartAspect[];
  ascendant: PlanetPosition;
  midheaven: PlanetPosition;
  distribution: ChartDistribution;
  aiSynthesis?: string; // Síntesis generada por IA (solo Premium)
}

@Entity("birth_charts")
@Index("idx_birth_chart_user", ["userId"])
@Index("idx_birth_chart_user_birth", ["userId", "birthDate", "birthTime", "latitude", "longitude"], { unique: true })
export class BirthChart {
  @ApiProperty({ example: 1, description: "ID único de la carta astral" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: "ID del usuario propietario" })
  @Column()
  userId: number;

  @ApiProperty({ example: "Mi carta natal", description: "Nombre identificador de la carta" })
  @Column({ type: "varchar", length: 100 })
  name: string;

  @ApiProperty({ example: "1990-05-15", description: "Fecha de nacimiento" })
  @Column({ type: "date" })
  birthDate: Date;

  @ApiProperty({ example: "14:30:00", description: "Hora de nacimiento (HH:mm:ss)" })
  @Column({ type: "time" })
  birthTime: string;

  @ApiProperty({ example: "Buenos Aires, Argentina", description: "Lugar de nacimiento" })
  @Column({ type: "varchar", length: 255 })
  birthPlace: string;

  @ApiProperty({ example: -34.6037, description: "Latitud del lugar de nacimiento" })
  @Column({ type: "decimal", precision: 10, scale: 6 })
  latitude: number;

  @ApiProperty({ example: -58.3816, description: "Longitud del lugar de nacimiento" })
  @Column({ type: "decimal", precision: 10, scale: 6 })
  longitude: number;

  @ApiProperty({ example: "America/Argentina/Buenos_Aires", description: "Zona horaria IANA" })
  @Column({ type: "varchar", length: 100 })
  timezone: string;

  @ApiProperty({ description: "Datos calculados de la carta (posiciones, aspectos, etc.)" })
  @Column({ type: "jsonb" })
  chartData: ChartData;

  @ApiProperty({ example: "leo", description: "Signo solar (para búsquedas rápidas)" })
  @Column({ type: "varchar", length: 20 })
  sunSign: string;

  @ApiProperty({ example: "scorpio", description: "Signo lunar" })
  @Column({ type: "varchar", length: 20 })
  moonSign: string;

  @ApiProperty({ example: "virgo", description: "Signo ascendente" })
  @Column({ type: "varchar", length: 20 })
  ascendantSign: string;

  @ApiProperty({ example: "2026-02-06T12:00:00Z", description: "Fecha de creación" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: "2026-02-06T12:00:00Z", description: "Fecha de última actualización" })
  @UpdateDateColumn()
  updatedAt: Date;

  // ============================================================================
  // RELACIONES
  // ============================================================================

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  // ============================================================================
  // MÉTODOS HELPER
  // ============================================================================

  /**
   * Obtiene el "Big Three" de la carta
   */
  getBigThree(): { sun: string; moon: string; ascendant: string } {
    return {
      sun: this.sunSign,
      moon: this.moonSign,
      ascendant: this.ascendantSign,
    };
  }

  /**
   * Verifica si la carta tiene síntesis de IA
   */
  hasAiSynthesis(): boolean {
    return !!this.chartData?.aiSynthesis;
  }

  /**
   * Obtiene los aspectos de un planeta específico
   */
  getAspectsForPlanet(planet: string): ChartAspect[] {
    return this.chartData?.aspects?.filter((a) => a.planet1 === planet || a.planet2 === planet) || [];
  }
}
```

**Criterios de aceptación:**

- [ ] Entidad creada con todos los campos especificados
- [ ] Interfaces TypeScript para estructuras JSON
- [ ] Índice único para prevenir cartas duplicadas
- [ ] Índice de búsqueda por userId
- [ ] Relación ManyToOne con User (CASCADE delete)
- [ ] Métodos helper documentados
- [ ] Swagger decorators para documentación API
- [ ] Tests unitarios para métodos helper

**Dependencias:** T-CA-001 (enums)

**Estimación:** 3 horas

---

### T-CA-003: Crear Entidad BirthChartInterpretation

**Historia relacionada:** HU-CA-004, HU-CA-005

**Descripción:**
Crear la entidad `BirthChartInterpretation` que almacena los ~490 textos estáticos de interpretación astrológica. Estos textos son el contenido base para las lecturas de carta astral.

**Ubicación:** `src/modules/birth-chart/infrastructure/entities/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── infrastructure/
    └── entities/
        ├── index.ts
        ├── birth-chart.entity.ts
        └── birth-chart-interpretation.entity.ts
```

**Implementación:**

```typescript
// birth-chart-interpretation.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { InterpretationCategory, Planet, ZodiacSign, AspectType, House } from "../../domain/enums";

@Entity("birth_chart_interpretations")
@Index("idx_interpretation_category", ["category"])
@Index("idx_interpretation_planet_sign", ["planet", "sign"])
@Index("idx_interpretation_planet_house", ["planet", "house"])
@Index("idx_interpretation_aspect", ["planet", "planet2", "aspectType"])
@Unique("uq_interpretation_combo", ["category", "planet", "sign", "house", "aspectType", "planet2"])
export class BirthChartInterpretation {
  @ApiProperty({ example: 1, description: "ID único de la interpretación" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "planet_in_sign",
    description: "Categoría de la interpretación",
    enum: InterpretationCategory,
  })
  @Column({
    type: "enum",
    enum: InterpretationCategory,
  })
  category: InterpretationCategory;

  @ApiProperty({
    example: "sun",
    description: "Planeta principal (null para ascendente)",
    enum: Planet,
    nullable: true,
  })
  @Column({
    type: "enum",
    enum: Planet,
    nullable: true,
  })
  planet: Planet | null;

  @ApiProperty({
    example: "aries",
    description: "Signo zodiacal (para planet_in_sign y ascendant)",
    enum: ZodiacSign,
    nullable: true,
  })
  @Column({
    type: "enum",
    enum: ZodiacSign,
    nullable: true,
  })
  sign: ZodiacSign | null;

  @ApiProperty({
    example: 1,
    description: "Número de casa (para planet_in_house)",
    nullable: true,
  })
  @Column({
    type: "smallint",
    nullable: true,
  })
  house: number | null;

  @ApiProperty({
    example: "conjunction",
    description: "Tipo de aspecto (para category=aspect)",
    enum: AspectType,
    nullable: true,
  })
  @Column({
    type: "enum",
    enum: AspectType,
    nullable: true,
  })
  aspectType: AspectType | null;

  @ApiProperty({
    example: "moon",
    description: "Segundo planeta del aspecto (para category=aspect)",
    enum: Planet,
    nullable: true,
  })
  @Column({
    type: "enum",
    enum: Planet,
    nullable: true,
  })
  planet2: Planet | null;

  @ApiProperty({
    example: "El Sol en Aries representa una personalidad...",
    description: "Texto de la interpretación",
  })
  @Column({ type: "text" })
  content: string;

  @ApiProperty({
    example: "Personalidad dinámica y emprendedora",
    description: "Resumen corto para vistas compactas",
    nullable: true,
  })
  @Column({ type: "varchar", length: 255, nullable: true })
  summary: string | null;

  @ApiProperty({
    example: true,
    description: "Si la interpretación está activa",
  })
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @ApiProperty({ example: "2026-02-06T12:00:00Z" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: "2026-02-06T12:00:00Z" })
  @UpdateDateColumn()
  updatedAt: Date;

  // ============================================================================
  // MÉTODOS HELPER ESTÁTICOS
  // ============================================================================

  /**
   * Genera la clave única para buscar una interpretación
   */
  static generateKey(
    category: InterpretationCategory,
    planet?: Planet | null,
    sign?: ZodiacSign | null,
    house?: number | null,
    aspectType?: AspectType | null,
    planet2?: Planet | null,
  ): string {
    return `${category}:${planet || ""}:${sign || ""}:${house || ""}:${aspectType || ""}:${planet2 || ""}`;
  }

  /**
   * Valida que la combinación de campos sea coherente con la categoría
   */
  static validateCombination(
    category: InterpretationCategory,
    planet?: Planet | null,
    sign?: ZodiacSign | null,
    house?: number | null,
    aspectType?: AspectType | null,
    planet2?: Planet | null,
  ): { valid: boolean; error?: string } {
    switch (category) {
      case InterpretationCategory.PLANET_INTRO:
        if (!planet) return { valid: false, error: "planet_intro requires planet" };
        if (sign || house || aspectType || planet2) {
          return { valid: false, error: "planet_intro only needs planet" };
        }
        break;

      case InterpretationCategory.PLANET_IN_SIGN:
        if (!planet || !sign) {
          return { valid: false, error: "planet_in_sign requires planet and sign" };
        }
        break;

      case InterpretationCategory.PLANET_IN_HOUSE:
        if (!planet || !house) {
          return { valid: false, error: "planet_in_house requires planet and house" };
        }
        break;

      case InterpretationCategory.ASPECT:
        if (!planet || !planet2 || !aspectType) {
          return { valid: false, error: "aspect requires planet, planet2, and aspectType" };
        }
        break;

      case InterpretationCategory.ASCENDANT:
        if (!sign) {
          return { valid: false, error: "ascendant requires sign" };
        }
        if (planet || house || aspectType || planet2) {
          return { valid: false, error: "ascendant only needs sign" };
        }
        break;
    }

    return { valid: true };
  }
}
```

**Distribución de registros esperada:**

| Categoría       | Cálculo                 | Cantidad |
| --------------- | ----------------------- | -------- |
| PLANET_INTRO    | 10 planetas             | 10       |
| ASCENDANT       | 12 signos               | 12       |
| PLANET_IN_SIGN  | 10 planetas × 12 signos | 120      |
| PLANET_IN_HOUSE | 10 planetas × 12 casas  | 120      |
| ASPECT          | ~45 pares × 5 tipos     | ~225     |
| **TOTAL**       |                         | **~487** |

**Criterios de aceptación:**

- [ ] Entidad creada con todos los campos nullable apropiados
- [ ] Constraint UNIQUE para prevenir duplicados
- [ ] Índices optimizados para búsquedas comunes
- [ ] Método estático generateKey para búsquedas
- [ ] Método estático validateCombination para validar datos
- [ ] Swagger decorators completos
- [ ] Tests unitarios para métodos estáticos

**Dependencias:** T-CA-001 (enums)

**Estimación:** 3 horas

---

### T-CA-004: Crear Migración de Tablas Principales

**Historia relacionada:** Todas

**Descripción:**
Crear la migración de TypeORM que genera las tablas `birth_charts` y `birth_chart_interpretations` en la base de datos PostgreSQL, incluyendo enums, índices y constraints.

**Ubicación:** `src/migrations/`

**Archivo a crear:**

```
src/migrations/
└── XXXXXXXXXX-CreateBirthChartTables.ts
```

**Implementación:**

```typescript
// XXXXXXXXXX-CreateBirthChartTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateBirthChartTables1707220000000 implements MigrationInterface {
  name = "CreateBirthChartTables1707220000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // =========================================================================
    // 1. CREAR ENUMS
    // =========================================================================

    // Enum de planetas
    await queryRunner.query(`
      CREATE TYPE "planet_enum" AS ENUM (
        'sun', 'moon', 'mercury', 'venus', 'mars',
        'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
      );
    `);

    // Enum de signos zodiacales
    await queryRunner.query(`
      CREATE TYPE "zodiac_sign_enum" AS ENUM (
        'aries', 'taurus', 'gemini', 'cancer',
        'leo', 'virgo', 'libra', 'scorpio',
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
      );
    `);

    // Enum de tipos de aspecto
    await queryRunner.query(`
      CREATE TYPE "aspect_type_enum" AS ENUM (
        'conjunction', 'opposition', 'square', 'trine', 'sextile'
      );
    `);

    // Enum de categorías de interpretación
    await queryRunner.query(`
      CREATE TYPE "interpretation_category_enum" AS ENUM (
        'planet_intro', 'planet_in_sign', 'planet_in_house', 'aspect', 'ascendant'
      );
    `);

    // =========================================================================
    // 2. CREAR TABLA birth_charts
    // =========================================================================

    await queryRunner.createTable(
      new Table({
        name: "birth_charts",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "userId",
            type: "integer",
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
          },
          {
            name: "birthDate",
            type: "date",
          },
          {
            name: "birthTime",
            type: "time",
          },
          {
            name: "birthPlace",
            type: "varchar",
            length: "255",
          },
          {
            name: "latitude",
            type: "decimal",
            precision: 10,
            scale: 6,
          },
          {
            name: "longitude",
            type: "decimal",
            precision: 10,
            scale: 6,
          },
          {
            name: "timezone",
            type: "varchar",
            length: "100",
          },
          {
            name: "chartData",
            type: "jsonb",
          },
          {
            name: "sunSign",
            type: "varchar",
            length: "20",
          },
          {
            name: "moonSign",
            type: "varchar",
            length: "20",
          },
          {
            name: "ascendantSign",
            type: "varchar",
            length: "20",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    // Índice por usuario
    await queryRunner.createIndex(
      "birth_charts",
      new TableIndex({
        name: "idx_birth_chart_user",
        columnNames: ["userId"],
      }),
    );

    // Índice único para prevenir duplicados
    await queryRunner.createIndex(
      "birth_charts",
      new TableIndex({
        name: "idx_birth_chart_user_birth",
        columnNames: ["userId", "birthDate", "birthTime", "latitude", "longitude"],
        isUnique: true,
      }),
    );

    // Foreign key con users
    await queryRunner.createForeignKey(
      "birth_charts",
      new TableForeignKey({
        name: "fk_birth_chart_user",
        columnNames: ["userId"],
        referencedTableName: "user",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    // =========================================================================
    // 3. CREAR TABLA birth_chart_interpretations
    // =========================================================================

    await queryRunner.createTable(
      new Table({
        name: "birth_chart_interpretations",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "category",
            type: "interpretation_category_enum",
          },
          {
            name: "planet",
            type: "planet_enum",
            isNullable: true,
          },
          {
            name: "sign",
            type: "zodiac_sign_enum",
            isNullable: true,
          },
          {
            name: "house",
            type: "smallint",
            isNullable: true,
          },
          {
            name: "aspectType",
            type: "aspect_type_enum",
            isNullable: true,
          },
          {
            name: "planet2",
            type: "planet_enum",
            isNullable: true,
          },
          {
            name: "content",
            type: "text",
          },
          {
            name: "summary",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    // Índices de búsqueda
    await queryRunner.createIndex(
      "birth_chart_interpretations",
      new TableIndex({
        name: "idx_interpretation_category",
        columnNames: ["category"],
      }),
    );

    await queryRunner.createIndex(
      "birth_chart_interpretations",
      new TableIndex({
        name: "idx_interpretation_planet_sign",
        columnNames: ["planet", "sign"],
      }),
    );

    await queryRunner.createIndex(
      "birth_chart_interpretations",
      new TableIndex({
        name: "idx_interpretation_planet_house",
        columnNames: ["planet", "house"],
      }),
    );

    await queryRunner.createIndex(
      "birth_chart_interpretations",
      new TableIndex({
        name: "idx_interpretation_aspect",
        columnNames: ["planet", "planet2", "aspectType"],
      }),
    );

    // Constraint único para combinación
    await queryRunner.query(`
      ALTER TABLE birth_chart_interpretations
      ADD CONSTRAINT uq_interpretation_combo
      UNIQUE NULLS NOT DISTINCT (category, planet, sign, house, "aspectType", planet2);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar constraint único
    await queryRunner.query(`
      ALTER TABLE birth_chart_interpretations
      DROP CONSTRAINT IF EXISTS uq_interpretation_combo;
    `);

    // Eliminar índices de interpretations
    await queryRunner.dropIndex("birth_chart_interpretations", "idx_interpretation_aspect");
    await queryRunner.dropIndex("birth_chart_interpretations", "idx_interpretation_planet_house");
    await queryRunner.dropIndex("birth_chart_interpretations", "idx_interpretation_planet_sign");
    await queryRunner.dropIndex("birth_chart_interpretations", "idx_interpretation_category");

    // Eliminar tabla interpretations
    await queryRunner.dropTable("birth_chart_interpretations");

    // Eliminar foreign key de birth_charts
    await queryRunner.dropForeignKey("birth_charts", "fk_birth_chart_user");

    // Eliminar índices de birth_charts
    await queryRunner.dropIndex("birth_charts", "idx_birth_chart_user_birth");
    await queryRunner.dropIndex("birth_charts", "idx_birth_chart_user");

    // Eliminar tabla birth_charts
    await queryRunner.dropTable("birth_charts");

    // Eliminar enums
    await queryRunner.query(`DROP TYPE IF EXISTS "interpretation_category_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "aspect_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "zodiac_sign_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "planet_enum";`);
  }
}
```

**Criterios de aceptación:**

- [ ] Migración ejecuta sin errores en ambiente de desarrollo
- [ ] Rollback (down) funciona correctamente
- [ ] Todos los enums creados en PostgreSQL
- [ ] Ambas tablas creadas con columnas correctas
- [ ] Índices creados según especificación
- [ ] Foreign key con CASCADE delete funcionando
- [ ] Constraint UNIQUE NULLS NOT DISTINCT funcionando
- [ ] Documentación de la migración en código

**Dependencias:** T-CA-001, T-CA-002, T-CA-003

**Estimación:** 2 horas

---

### T-CA-005: Crear Seeder de Interpretaciones Estáticas

**Historia relacionada:** HU-CA-004, HU-CA-005

**Descripción:**
Crear un seeder que carga los ~490 textos de interpretación astrológica en la tabla `birth_chart_interpretations`. Los textos serán generados con Gemini usando prompts específicos (documento separado).

**Ubicación:** `src/modules/birth-chart/infrastructure/seeders/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── infrastructure/
    └── seeders/
        ├── birth-chart-interpretations.seeder.ts
        └── data/
            ├── planet-intros.json
            ├── ascendants.json
            ├── planets-in-signs.json
            ├── planets-in-houses.json
            └── aspects.json
```

**Implementación del Seeder:**

```typescript
// birth-chart-interpretations.seeder.ts
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { BirthChartInterpretation } from "../entities/birth-chart-interpretation.entity";
import { InterpretationCategory, Planet, ZodiacSign, AspectType } from "../../domain/enums";

// Importar datos JSON
import planetIntros from "./data/planet-intros.json";
import ascendants from "./data/ascendants.json";
import planetsInSigns from "./data/planets-in-signs.json";
import planetsInHouses from "./data/planets-in-houses.json";
import aspects from "./data/aspects.json";

interface InterpretationData {
  category: InterpretationCategory;
  planet?: Planet | null;
  sign?: ZodiacSign | null;
  house?: number | null;
  aspectType?: AspectType | null;
  planet2?: Planet | null;
  content: string;
  summary?: string;
}

@Injectable()
export class BirthChartInterpretationsSeeder implements OnModuleInit {
  private readonly logger = new Logger(BirthChartInterpretationsSeeder.name);

  constructor(
    @InjectRepository(BirthChartInterpretation)
    private readonly interpretationRepo: Repository<BirthChartInterpretation>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Ejecuta el seeder automáticamente en desarrollo
   */
  async onModuleInit(): Promise<void> {
    const autoSeed = this.configService.get<string>("AUTO_SEED_INTERPRETATIONS");

    if (autoSeed === "true") {
      await this.seed();
    }
  }

  /**
   * Ejecuta el seeding completo
   */
  async seed(): Promise<{ created: number; skipped: number; errors: number }> {
    this.logger.log("Starting birth chart interpretations seeding...");

    const stats = { created: 0, skipped: 0, errors: 0 };

    try {
      // 1. Seed planet intros (10)
      const introStats = await this.seedCategory(planetIntros as InterpretationData[], "Planet Intros");
      this.mergeStats(stats, introStats);

      // 2. Seed ascendants (12)
      const ascendantStats = await this.seedCategory(ascendants as InterpretationData[], "Ascendants");
      this.mergeStats(stats, ascendantStats);

      // 3. Seed planets in signs (120)
      const signStats = await this.seedCategory(planetsInSigns as InterpretationData[], "Planets in Signs");
      this.mergeStats(stats, signStats);

      // 4. Seed planets in houses (120)
      const houseStats = await this.seedCategory(planetsInHouses as InterpretationData[], "Planets in Houses");
      this.mergeStats(stats, houseStats);

      // 5. Seed aspects (~225)
      const aspectStats = await this.seedCategory(aspects as InterpretationData[], "Aspects");
      this.mergeStats(stats, aspectStats);

      this.logger.log(`Seeding completed: ${stats.created} created, ${stats.skipped} skipped, ${stats.errors} errors`);

      return stats;
    } catch (error) {
      this.logger.error("Error during seeding:", error);
      throw error;
    }
  }

  /**
   * Seed una categoría específica
   */
  private async seedCategory(
    data: InterpretationData[],
    categoryName: string,
  ): Promise<{ created: number; skipped: number; errors: number }> {
    this.logger.log(`Seeding ${categoryName} (${data.length} items)...`);

    const stats = { created: 0, skipped: 0, errors: 0 };

    for (const item of data) {
      try {
        // Verificar si ya existe
        const existing = await this.interpretationRepo.findOne({
          where: {
            category: item.category,
            planet: item.planet || null,
            sign: item.sign || null,
            house: item.house || null,
            aspectType: item.aspectType || null,
            planet2: item.planet2 || null,
          },
        });

        if (existing) {
          stats.skipped++;
          continue;
        }

        // Crear nuevo registro
        const interpretation = this.interpretationRepo.create({
          category: item.category,
          planet: item.planet || null,
          sign: item.sign || null,
          house: item.house || null,
          aspectType: item.aspectType || null,
          planet2: item.planet2 || null,
          content: item.content,
          summary: item.summary || null,
          isActive: true,
        });

        await this.interpretationRepo.save(interpretation);
        stats.created++;
      } catch (error) {
        this.logger.error(`Error seeding ${categoryName} item:`, error);
        stats.errors++;
      }
    }

    this.logger.log(`${categoryName}: ${stats.created} created, ${stats.skipped} skipped`);

    return stats;
  }

  /**
   * Merge stats de categoría en stats totales
   */
  private mergeStats(
    total: { created: number; skipped: number; errors: number },
    category: { created: number; skipped: number; errors: number },
  ): void {
    total.created += category.created;
    total.skipped += category.skipped;
    total.errors += category.errors;
  }

  /**
   * Elimina todas las interpretaciones (para re-seed)
   */
  async clear(): Promise<number> {
    this.logger.warn("Clearing all birth chart interpretations...");
    const result = await this.interpretationRepo.delete({});
    return result.affected || 0;
  }

  /**
   * Obtiene estadísticas actuales
   */
  async getStats(): Promise<{
    total: number;
    byCategory: Record<InterpretationCategory, number>;
  }> {
    const total = await this.interpretationRepo.count();

    const byCategory = {} as Record<InterpretationCategory, number>;
    for (const category of Object.values(InterpretationCategory)) {
      byCategory[category] = await this.interpretationRepo.count({
        where: { category },
      });
    }

    return { total, byCategory };
  }
}
```

**Estructura de archivos JSON de datos:**

```json
// data/planet-intros.json
[
  {
    "category": "planet_intro",
    "planet": "sun",
    "content": "El Sol representa tu esencia, tu identidad central y la fuerza vital que te impulsa. Es el astro que ilumina quién eres realmente, más allá de las máscaras sociales. En tu carta natal, el Sol indica dónde brillas con luz propia y qué te hace sentir verdaderamente vivo.",
    "summary": "Tu esencia e identidad central"
  },
  // ... 9 planetas más
]

// data/planets-in-signs.json
[
  {
    "category": "planet_in_sign",
    "planet": "sun",
    "sign": "aries",
    "content": "Con el Sol en Aries, posees una naturaleza pionera y valiente. Eres un iniciador nato, siempre dispuesto a abrir nuevos caminos. Tu energía es directa y apasionada, aunque a veces puede manifestarse como impaciencia. Necesitas acción y desafíos para sentirte vivo.",
    "summary": "Pionero, valiente e impulsivo"
  },
  // ... 119 combinaciones más
]
```

**CLI Command para ejecutar manualmente:**

```typescript
// src/commands/seed-interpretations.command.ts
import { Command, CommandRunner } from "nest-commander";
import { BirthChartInterpretationsSeeder } from "../modules/birth-chart/infrastructure/seeders/birth-chart-interpretations.seeder";

@Command({
  name: "seed:interpretations",
  description: "Seed birth chart interpretations",
})
export class SeedInterpretationsCommand extends CommandRunner {
  constructor(private readonly seeder: BirthChartInterpretationsSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log("Starting interpretations seeding...");
    const stats = await this.seeder.seed();
    console.log("Seeding completed:", stats);
  }
}
```

**Criterios de aceptación:**

- [ ] Seeder carga todos los datos sin errores
- [ ] Detecta y salta duplicados (idempotente)
- [ ] Logs detallados de progreso y errores
- [ ] Comando CLI para ejecución manual
- [ ] Método clear() para resetear datos
- [ ] Método getStats() para verificar estado
- [ ] Archivos JSON con datos placeholder
- [ ] Documentación de estructura de datos JSON
- [ ] Variable de entorno para auto-seed en desarrollo

**Dependencias:** T-CA-003, T-CA-004

**Nota:** Los textos finales de los archivos JSON serán generados con Gemini usando prompts específicos (documento PARTE-7S).

**Estimación:** 4 horas

---

## CHECKLIST DE PARTE 7B

- [ ] T-CA-001: Enums astrológicos creados
- [ ] T-CA-002: Entidad BirthChart creada
- [ ] T-CA-003: Entidad BirthChartInterpretation creada
- [ ] T-CA-004: Migración ejecutada correctamente
- [ ] T-CA-005: Seeder funcional con datos placeholder

---

## PRÓXIMOS PASOS

**Siguiente parte:** PARTE-7C - Tareas de Backend: Servicio de Cálculos Astronómicos

---

**FIN DE PARTE 7B - TAREAS DE ENTIDADES Y BASE DE DATOS**

# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7C: TAREAS DE BACKEND - SERVICIO DE CÁLCULOS ASTRONÓMICOS

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.0  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## RESUMEN DE PARTE 7C

Esta parte cubre la implementación del servicio core que realiza los cálculos astronómicos para generar cartas astrales: posiciones planetarias, casas, aspectos y distribuciones.

| Tarea    | Título                                              | Tipo    | Prioridad | Estimación |
| -------- | --------------------------------------------------- | ------- | --------- | ---------- |
| T-CA-006 | Configurar librería de efemérides                   | Backend | Must      | 3h         |
| T-CA-007 | Crear servicio de cálculo de posiciones planetarias | Backend | Must      | 4h         |
| T-CA-008 | Crear servicio de cálculo de casas                  | Backend | Must      | 3h         |
| T-CA-009 | Crear servicio de cálculo de aspectos               | Backend | Must      | 3h         |
| T-CA-010 | Crear servicio orquestador de carta astral          | Backend | Must      | 4h         |

**Total estimado:** 17 horas

---

## DETALLE DE TAREAS

### T-CA-006: Configurar Librería de Efemérides

**Historia relacionada:** HU-CA-001

**Descripción:**
Instalar y configurar la librería de cálculos astronómicos (Swiss Ephemeris) para obtener posiciones planetarias precisas. Incluye configuración de archivos de efemérides y wrapper TypeScript.

**Ubicación:** `src/modules/birth-chart/infrastructure/ephemeris/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── infrastructure/
    └── ephemeris/
        ├── index.ts
        ├── ephemeris.config.ts
        ├── ephemeris.wrapper.ts
        └── ephemeris.types.ts
```

**Dependencias NPM a instalar:**

```bash
npm install sweph
```

**Librería seleccionada: `sweph`** (Swiss Ephemeris)

| Criterio             | Valor                                                     |
| -------------------- | --------------------------------------------------------- |
| Precisión            | Alta (Swiss Ephemeris oficial - estándar de la industria) |
| Licencia             | AGPL-3.0 (compatible con proyecto)                        |
| Dependencias nativas | Sí (requiere compilación, manejado por npm)               |
| Mantenimiento        | Activo                                                    |

**Razón de elección:** Auguria es un producto profesional que requiere precisión astrológica real. Swiss Ephemeris es el estándar usado por software astrológico profesional.

**Implementación:**

```typescript
// ephemeris.types.ts
export interface EphemerisInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number; // 0-59
  latitude: number; // -90 a 90
  longitude: number; // -180 a 180
}

export interface RawPlanetPosition {
  name: string;
  longitude: number; // 0-360 grados absolutos
  latitude: number; // Latitud eclíptica
  distance: number; // Distancia en AU
  longitudeSpeed: number; // Velocidad (negativo = retrógrado)
}

export interface RawHouseCusps {
  cusps: number[]; // 12 cúspides en grados
  ascendant: number; // Grado del Ascendente
  midheaven: number; // Grado del Medio Cielo (MC)
}

export interface EphemerisOutput {
  planets: RawPlanetPosition[];
  houses: RawHouseCusps;
  julianDay: number;
  siderealTime: number;
}
```

```typescript
// ephemeris.config.ts
import { registerAs } from "@nestjs/config";

export default registerAs("ephemeris", () => ({
  // Sistema de casas: Placidus (más común)
  houseSystem: process.env.EPHEMERIS_HOUSE_SYSTEM || "placidus",

  // Zodíaco: Tropical (occidental) vs Sideral (védico)
  zodiacType: process.env.EPHEMERIS_ZODIAC_TYPE || "tropical",

  // Planetas a calcular
  planets: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],

  // Precisión de cálculo (minutos de arco)
  precision: parseInt(process.env.EPHEMERIS_PRECISION || "1", 10),
}));
```

```typescript
// ephemeris.wrapper.ts
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sweph from "sweph";
import { EphemerisInput, EphemerisOutput, RawPlanetPosition, RawHouseCusps } from "./ephemeris.types";

// Constantes de Swiss Ephemeris
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_URANUS = 7;
const SE_NEPTUNE = 8;
const SE_PLUTO = 9;

// Flags de cálculo
const SEFLG_SPEED = 256; // Incluir velocidad (para retrogradación)
const SEFLG_SWIEPH = 2; // Usar archivos Swiss Ephemeris

// Sistemas de casas
const HOUSE_SYSTEMS: Record<string, string> = {
  placidus: "P",
  koch: "K",
  equal: "E",
  whole_sign: "W",
  campanus: "C",
  regiomontanus: "R",
};

@Injectable()
export class EphemerisWrapper implements OnModuleInit {
  private readonly logger = new Logger(EphemerisWrapper.name);
  private readonly houseSystem: string;
  private isInitialized = false;

  // Mapeo de planetas
  private readonly PLANETS = [
    { id: SE_SUN, name: "sun" },
    { id: SE_MOON, name: "moon" },
    { id: SE_MERCURY, name: "mercury" },
    { id: SE_VENUS, name: "venus" },
    { id: SE_MARS, name: "mars" },
    { id: SE_JUPITER, name: "jupiter" },
    { id: SE_SATURN, name: "saturn" },
    { id: SE_URANUS, name: "uranus" },
    { id: SE_NEPTUNE, name: "neptune" },
    { id: SE_PLUTO, name: "pluto" },
  ];

  constructor(private readonly configService: ConfigService) {
    this.houseSystem = this.configService.get<string>("ephemeris.houseSystem", "placidus");
  }

  /**
   * Inicializa Swiss Ephemeris al cargar el módulo
   */
  async onModuleInit(): Promise<void> {
    try {
      // Configurar path de archivos de efemérides (opcional, usa built-in si no existe)
      const ephePath = this.configService.get<string>("SWEPH_PATH");
      if (ephePath) {
        sweph.set_ephe_path(ephePath);
      }

      this.isInitialized = true;
      this.logger.log("Swiss Ephemeris initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Swiss Ephemeris:", error);
      throw error;
    }
  }

  /**
   * Calcula posiciones planetarias y casas para una fecha/hora/ubicación dada
   */
  calculate(input: EphemerisInput): EphemerisOutput {
    if (!this.isInitialized) {
      throw new Error("Swiss Ephemeris not initialized");
    }

    this.logger.debug(`Calculating ephemeris for: ${JSON.stringify(input)}`);

    try {
      // 1. Convertir fecha/hora a Julian Day
      const julianDay = this.calculateJulianDay(input.year, input.month, input.day, input.hour, input.minute);

      // 2. Calcular posiciones de planetas
      const planets = this.calculatePlanets(julianDay);

      // 3. Calcular casas
      const houses = this.calculateHouses(julianDay, input.latitude, input.longitude);

      // 4. Calcular tiempo sideral
      const siderealTime = sweph.sidtime(julianDay);

      return {
        planets,
        houses,
        julianDay,
        siderealTime,
      };
    } catch (error) {
      this.logger.error("Error calculating ephemeris:", error);
      throw new Error(`Ephemeris calculation failed: ${error.message}`);
    }
  }

  /**
   * Calcula Julian Day desde fecha/hora
   */
  private calculateJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
    // Convertir hora y minutos a fracción decimal
    const hourDecimal = hour + minute / 60;

    // julday retorna el Julian Day
    return sweph.julday(year, month, day, hourDecimal, sweph.GREG_CAL);
  }

  /**
   * Calcula posiciones de los 10 planetas principales
   */
  private calculatePlanets(julianDay: number): RawPlanetPosition[] {
    const flags = SEFLG_SWIEPH | SEFLG_SPEED;

    return this.PLANETS.map(({ id, name }) => {
      try {
        const result = sweph.calc_ut(julianDay, id, flags);

        if (result.error) {
          this.logger.warn(`Error calculating ${name}: ${result.error}`);
          return this.createEmptyPosition(name);
        }

        return {
          name,
          longitude: result.data[0], // Longitud eclíptica (0-360)
          latitude: result.data[1], // Latitud eclíptica
          distance: result.data[2], // Distancia en AU
          longitudeSpeed: result.data[3], // Velocidad (negativo = retrógrado)
        };
      } catch (error) {
        this.logger.warn(`Exception calculating ${name}:`, error);
        return this.createEmptyPosition(name);
      }
    });
  }

  /**
   * Calcula las 12 cúspides de casas + Ascendente + MC
   */
  private calculateHouses(julianDay: number, latitude: number, longitude: number): RawHouseCusps {
    const houseSystemChar = HOUSE_SYSTEMS[this.houseSystem] || "P";

    try {
      const result = sweph.houses(julianDay, latitude, longitude, houseSystemChar);

      if (result.error) {
        this.logger.warn(`Error calculating houses: ${result.error}`);
        return this.createEmptyHouses();
      }

      // result.data.houses contiene las 12 cúspides (índice 1-12)
      // result.data.points contiene: [0]=Asc, [1]=MC, [2]=ARMC, [3]=Vertex, etc.
      const cusps: number[] = [];
      for (let i = 1; i <= 12; i++) {
        cusps.push(result.data.houses[i]);
      }

      return {
        cusps,
        ascendant: result.data.points[0], // Ascendente
        midheaven: result.data.points[1], // Medio Cielo (MC)
      };
    } catch (error) {
      this.logger.warn("Exception calculating houses:", error);
      return this.createEmptyHouses();
    }
  }

  /**
   * Crea una posición vacía para manejo de errores
   */
  private createEmptyPosition(name: string): RawPlanetPosition {
    return {
      name,
      longitude: 0,
      latitude: 0,
      distance: 0,
      longitudeSpeed: 0,
    };
  }

  /**
   * Crea casas vacías para manejo de errores
   */
  private createEmptyHouses(): RawHouseCusps {
    return {
      cusps: Array(12)
        .fill(0)
        .map((_, i) => i * 30), // Casas iguales como fallback
      ascendant: 0,
      midheaven: 270,
    };
  }

  /**
   * Valida que las coordenadas sean válidas
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Valida que la fecha sea válida para cálculos
   * Swiss Ephemeris soporta: -13000 a +16800 aprox.
   */
  validateDate(year: number): boolean {
    return year >= 1800 && year <= 2400;
  }

  /**
   * Cierra Swiss Ephemeris (llamar al destruir el módulo)
   */
  close(): void {
    sweph.close();
    this.isInitialized = false;
    this.logger.log("Swiss Ephemeris closed");
  }
}
```

**Criterios de aceptación:**

- [ ] Librería `sweph` instalada y configurada
- [ ] Wrapper TypeScript con tipado completo
- [ ] Inicialización en `onModuleInit`
- [ ] Cálculo de Julian Day correcto
- [ ] Cálculo de 10 planetas funcionando
- [ ] Cálculo de 12 casas (sistema Placidus por defecto)
- [ ] Soporte para múltiples sistemas de casas (configurable)
- [ ] Ascendente y Medio Cielo extraídos
- [ ] Velocidad planetaria para detección de retrogradación
- [ ] Validación de coordenadas y fechas
- [ ] Manejo de errores robusto con fallbacks
- [ ] Método `close()` para limpieza de recursos
- [ ] Tests unitarios con fechas conocidas
- [ ] Documentación de precisión y limitaciones

**Dependencias:** Ninguna

**Estimación:** 3 horas

---

### T-CA-007: Crear Servicio de Cálculo de Posiciones Planetarias

**Historia relacionada:** HU-CA-001, HU-CA-003

**Descripción:**
Crear el servicio que transforma las posiciones raw del wrapper de efemérides en objetos `PlanetPosition` enriquecidos con signo zodiacal, grado en signo, casa y estado de retrogradación.

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        └── planet-position.service.ts
```

**Implementación:**

```typescript
// planet-position.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Planet, ZodiacSign, ZodiacSignMetadata, PlanetMetadata } from "../../domain/enums";
import { PlanetPosition } from "../../infrastructure/entities/birth-chart.entity";
import { RawPlanetPosition, RawHouseCusps } from "../../infrastructure/ephemeris/ephemeris.types";

@Injectable()
export class PlanetPositionService {
  private readonly logger = new Logger(PlanetPositionService.name);

  // Orden de signos para cálculos
  private readonly ZODIAC_ORDER: ZodiacSign[] = [
    ZodiacSign.ARIES,
    ZodiacSign.TAURUS,
    ZodiacSign.GEMINI,
    ZodiacSign.CANCER,
    ZodiacSign.LEO,
    ZodiacSign.VIRGO,
    ZodiacSign.LIBRA,
    ZodiacSign.SCORPIO,
    ZodiacSign.SAGITTARIUS,
    ZodiacSign.CAPRICORN,
    ZodiacSign.AQUARIUS,
    ZodiacSign.PISCES,
  ];

  /**
   * Transforma posiciones raw en posiciones enriquecidas
   */
  calculatePositions(rawPlanets: RawPlanetPosition[], houseCusps: RawHouseCusps): PlanetPosition[] {
    return rawPlanets.map((raw) => this.enrichPosition(raw, houseCusps));
  }

  /**
   * Enriquece una posición raw con signo, casa, etc.
   */
  private enrichPosition(raw: RawPlanetPosition, houseCusps: RawHouseCusps): PlanetPosition {
    const planet = this.mapToPlanetEnum(raw.name);
    const { sign, degree } = this.longitudeToSign(raw.longitude);
    const house = this.calculateHouse(raw.longitude, houseCusps.cusps);
    const isRetrograde = raw.longitudeSpeed < 0;

    return {
      planet: planet,
      longitude: raw.longitude,
      sign: sign,
      signDegree: degree,
      house: house,
      isRetrograde: isRetrograde,
    };
  }

  /**
   * Convierte nombre de planeta a enum
   */
  private mapToPlanetEnum(name: string): string {
    const mapping: Record<string, Planet> = {
      sun: Planet.SUN,
      moon: Planet.MOON,
      mercury: Planet.MERCURY,
      venus: Planet.VENUS,
      mars: Planet.MARS,
      jupiter: Planet.JUPITER,
      saturn: Planet.SATURN,
      uranus: Planet.URANUS,
      neptune: Planet.NEPTUNE,
      pluto: Planet.PLUTO,
    };

    return mapping[name.toLowerCase()] || name;
  }

  /**
   * Convierte longitud absoluta (0-360) a signo y grado
   */
  longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
    // Normalizar a 0-360
    const normalizedLong = ((longitude % 360) + 360) % 360;

    // Cada signo ocupa 30 grados
    const signIndex = Math.floor(normalizedLong / 30);
    const degree = normalizedLong % 30;

    return {
      sign: this.ZODIAC_ORDER[signIndex],
      degree: Math.round(degree * 100) / 100, // 2 decimales
    };
  }

  /**
   * Determina en qué casa está un planeta
   */
  calculateHouse(longitude: number, cusps: number[]): number {
    // Normalizar longitud
    const normalizedLong = ((longitude % 360) + 360) % 360;

    // Buscar entre qué cúspides está
    for (let i = 0; i < 12; i++) {
      const currentCusp = cusps[i];
      const nextCusp = cusps[(i + 1) % 12];

      // Manejar el cruce de 0°/360°
      if (currentCusp > nextCusp) {
        // La casa cruza el punto Aries
        if (normalizedLong >= currentCusp || normalizedLong < nextCusp) {
          return i + 1;
        }
      } else {
        if (normalizedLong >= currentCusp && normalizedLong < nextCusp) {
          return i + 1;
        }
      }
    }

    // Fallback a casa 1
    return 1;
  }

  /**
   * Calcula la posición del Ascendente como PlanetPosition
   */
  calculateAscendant(ascendantLongitude: number): PlanetPosition {
    const { sign, degree } = this.longitudeToSign(ascendantLongitude);

    return {
      planet: "ascendant",
      longitude: ascendantLongitude,
      sign: sign,
      signDegree: degree,
      house: 1, // El Ascendente siempre está en la cúspide de casa 1
      isRetrograde: false,
    };
  }

  /**
   * Calcula la posición del Medio Cielo como PlanetPosition
   */
  calculateMidheaven(midheavenLongitude: number): PlanetPosition {
    const { sign, degree } = this.longitudeToSign(midheavenLongitude);

    return {
      planet: "midheaven",
      longitude: midheavenLongitude,
      sign: sign,
      signDegree: degree,
      house: 10, // El MC siempre está en la cúspide de casa 10
      isRetrograde: false,
    };
  }

  /**
   * Formatea posición para display (ej: "15° 23' Aries")
   */
  formatPosition(position: PlanetPosition): string {
    const degrees = Math.floor(position.signDegree);
    const minutes = Math.round((position.signDegree - degrees) * 60);
    const signName = ZodiacSignMetadata[position.sign as ZodiacSign]?.name || position.sign;
    const retrograde = position.isRetrograde ? " ℞" : "";

    return `${degrees}° ${minutes}' ${signName}${retrograde}`;
  }

  /**
   * Obtiene el "Big Three" de una lista de posiciones
   */
  getBigThree(
    planets: PlanetPosition[],
    ascendant: PlanetPosition,
  ): { sun: ZodiacSign; moon: ZodiacSign; ascendant: ZodiacSign } {
    const sun = planets.find((p) => p.planet === Planet.SUN);
    const moon = planets.find((p) => p.planet === Planet.MOON);

    return {
      sun: (sun?.sign as ZodiacSign) || ZodiacSign.ARIES,
      moon: (moon?.sign as ZodiacSign) || ZodiacSign.ARIES,
      ascendant: (ascendant?.sign as ZodiacSign) || ZodiacSign.ARIES,
    };
  }
}
```

**Criterios de aceptación:**

- [ ] Transformación de todas las posiciones raw
- [ ] Cálculo correcto de signo desde longitud
- [ ] Cálculo correcto de casa para cada planeta
- [ ] Detección de retrogradación
- [ ] Cálculo de Ascendente y MC
- [ ] Formateo para display humano
- [ ] Extracción de Big Three
- [ ] Tests unitarios con casos conocidos
- [ ] Tests de edge cases (cruce de 0°/360°)

**Dependencias:** T-CA-006

**Estimación:** 4 horas

---

### T-CA-008: Crear Servicio de Cálculo de Casas

**Historia relacionada:** HU-CA-001, HU-CA-003

**Descripción:**
Crear el servicio que transforma las cúspides raw en objetos `HouseCusp` enriquecidos con signo y grado, y calcula metadata adicional de las casas.

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        ├── planet-position.service.ts
        └── house-cusp.service.ts
```

**Implementación:**

```typescript
// house-cusp.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { ZodiacSign, House, HouseMetadata } from "../../domain/enums";
import { HouseCusp } from "../../infrastructure/entities/birth-chart.entity";
import { RawHouseCusps } from "../../infrastructure/ephemeris/ephemeris.types";
import { PlanetPositionService } from "./planet-position.service";

@Injectable()
export class HouseCuspService {
  private readonly logger = new Logger(HouseCuspService.name);

  constructor(private readonly positionService: PlanetPositionService) {}

  /**
   * Transforma cúspides raw en cúspides enriquecidas
   */
  calculateCusps(rawCusps: RawHouseCusps): HouseCusp[] {
    return rawCusps.cusps.map((longitude, index) => {
      const houseNumber = index + 1;
      const { sign, degree } = this.positionService.longitudeToSign(longitude);

      return {
        house: houseNumber,
        longitude: longitude,
        sign: sign,
        signDegree: degree,
      };
    });
  }

  /**
   * Obtiene la cúspide de una casa específica
   */
  getCusp(cusps: HouseCusp[], houseNumber: number): HouseCusp | undefined {
    return cusps.find((c) => c.house === houseNumber);
  }

  /**
   * Calcula qué signo rige cada casa
   */
  getHouseRulers(cusps: HouseCusp[]): Record<number, ZodiacSign> {
    const rulers: Record<number, ZodiacSign> = {};

    for (const cusp of cusps) {
      rulers[cusp.house] = cusp.sign as ZodiacSign;
    }

    return rulers;
  }

  /**
   * Detecta casas interceptadas (signo completo dentro de una casa)
   * Esto ocurre en latitudes altas y es astrológicamente significativo
   */
  findInterceptedSigns(cusps: HouseCusp[]): ZodiacSign[] {
    const signsOnCusps = new Set(cusps.map((c) => c.sign));
    const allSigns = Object.values(ZodiacSign);

    return allSigns.filter((sign) => !signsOnCusps.has(sign));
  }

  /**
   * Detecta signos duplicados (mismo signo en dos cúspides consecutivas)
   */
  findDuplicatedSigns(cusps: HouseCusp[]): Array<{ sign: ZodiacSign; houses: number[] }> {
    const signCounts: Record<string, number[]> = {};

    for (const cusp of cusps) {
      if (!signCounts[cusp.sign]) {
        signCounts[cusp.sign] = [];
      }
      signCounts[cusp.sign].push(cusp.house);
    }

    return Object.entries(signCounts)
      .filter(([_, houses]) => houses.length > 1)
      .map(([sign, houses]) => ({
        sign: sign as ZodiacSign,
        houses,
      }));
  }

  /**
   * Calcula el tamaño de cada casa en grados
   */
  calculateHouseSizes(cusps: HouseCusp[]): Record<number, number> {
    const sizes: Record<number, number> = {};

    for (let i = 0; i < 12; i++) {
      const current = cusps[i].longitude;
      const next = cusps[(i + 1) % 12].longitude;

      // Manejar cruce de 0°/360°
      let size = next - current;
      if (size < 0) {
        size += 360;
      }

      sizes[i + 1] = Math.round(size * 100) / 100;
    }

    return sizes;
  }

  /**
   * Obtiene información completa de una casa
   */
  getHouseInfo(
    cusps: HouseCusp[],
    houseNumber: number,
  ): {
    cusp: HouseCusp;
    theme: string;
    keywords: string[];
    size: number;
  } | null {
    const cusp = this.getCusp(cusps, houseNumber);
    if (!cusp) return null;

    const metadata = HouseMetadata[houseNumber as House];
    const sizes = this.calculateHouseSizes(cusps);

    return {
      cusp,
      theme: metadata?.theme || "",
      keywords: metadata?.keywords || [],
      size: sizes[houseNumber],
    };
  }

  /**
   * Formatea cúspide para display
   */
  formatCusp(cusp: HouseCusp): string {
    const degrees = Math.floor(cusp.signDegree);
    const minutes = Math.round((cusp.signDegree - degrees) * 60);

    return `Casa ${cusp.house}: ${degrees}° ${minutes}' ${cusp.sign}`;
  }

  /**
   * Agrupa casas por elemento del signo en su cúspide
   */
  groupByElement(cusps: HouseCusp[]): Record<string, number[]> {
    const groups: Record<string, number[]> = {
      fire: [],
      earth: [],
      air: [],
      water: [],
    };

    for (const cusp of cusps) {
      // Obtener elemento del signo (asumiendo ZodiacSignMetadata disponible)
      const element = this.getSignElement(cusp.sign as ZodiacSign);
      if (element && groups[element]) {
        groups[element].push(cusp.house);
      }
    }

    return groups;
  }

  /**
   * Helper: obtiene el elemento de un signo
   */
  private getSignElement(sign: ZodiacSign): "fire" | "earth" | "air" | "water" {
    const fireSign = [ZodiacSign.ARIES, ZodiacSign.LEO, ZodiacSign.SAGITTARIUS];
    const earthSigns = [ZodiacSign.TAURUS, ZodiacSign.VIRGO, ZodiacSign.CAPRICORN];
    const airSigns = [ZodiacSign.GEMINI, ZodiacSign.LIBRA, ZodiacSign.AQUARIUS];
    const waterSigns = [ZodiacSign.CANCER, ZodiacSign.SCORPIO, ZodiacSign.PISCES];

    if (fireSign.includes(sign)) return "fire";
    if (earthSigns.includes(sign)) return "earth";
    if (airSigns.includes(sign)) return "air";
    if (waterSigns.includes(sign)) return "water";

    return "fire"; // fallback
  }
}
```

**Criterios de aceptación:**

- [ ] Transformación de 12 cúspides
- [ ] Cálculo correcto de signo en cada cúspide
- [ ] Detección de signos interceptados
- [ ] Detección de signos duplicados
- [ ] Cálculo de tamaño de casas
- [ ] Agrupación por elemento
- [ ] Formateo para display
- [ ] Tests unitarios completos
- [ ] Tests con cartas de latitudes extremas

**Dependencias:** T-CA-007

**Estimación:** 3 horas

---

### T-CA-009: Crear Servicio de Cálculo de Aspectos

**Historia relacionada:** HU-CA-001, HU-CA-003, HU-CA-005

**Descripción:**
Crear el servicio que detecta y calcula los aspectos (conjunción, oposición, cuadratura, trígono, sextil) entre planetas basándose en sus posiciones y los orbes permitidos.

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        ├── planet-position.service.ts
        ├── house-cusp.service.ts
        └── aspect-calculation.service.ts
```

**Implementación:**

```typescript
// aspect-calculation.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Planet, AspectType, AspectMetadata } from "../../domain/enums";
import { ChartAspect, PlanetPosition } from "../../infrastructure/entities/birth-chart.entity";

interface AspectConfig {
  type: AspectType;
  angle: number;
  orb: number;
}

@Injectable()
export class AspectCalculationService {
  private readonly logger = new Logger(AspectCalculationService.name);

  // Configuración de aspectos mayores
  private readonly ASPECTS: AspectConfig[] = [
    { type: AspectType.CONJUNCTION, angle: 0, orb: 8 },
    { type: AspectType.OPPOSITION, angle: 180, orb: 8 },
    { type: AspectType.SQUARE, angle: 90, orb: 6 },
    { type: AspectType.TRINE, angle: 120, orb: 8 },
    { type: AspectType.SEXTILE, angle: 60, orb: 4 },
  ];

  // Planetas a considerar para aspectos (en orden de importancia)
  private readonly ASPECT_PLANETS = [
    Planet.SUN,
    Planet.MOON,
    Planet.MERCURY,
    Planet.VENUS,
    Planet.MARS,
    Planet.JUPITER,
    Planet.SATURN,
    Planet.URANUS,
    Planet.NEPTUNE,
    Planet.PLUTO,
  ];

  /**
   * Calcula todos los aspectos entre planetas
   */
  calculateAspects(planets: PlanetPosition[], ascendant?: PlanetPosition): ChartAspect[] {
    const aspects: ChartAspect[] = [];
    const allPoints = [...planets];

    // Opcionalmente incluir Ascendente en aspectos
    if (ascendant) {
      allPoints.push(ascendant);
    }

    // Comparar cada par de planetas
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        const planet1 = allPoints[i];
        const planet2 = allPoints[j];

        const aspect = this.findAspect(planet1, planet2);
        if (aspect) {
          aspects.push(aspect);
        }
      }
    }

    // Ordenar por fuerza del aspecto (menor orbe = más fuerte)
    return aspects.sort((a, b) => a.orb - b.orb);
  }

  /**
   * Busca si hay un aspecto entre dos planetas
   */
  private findAspect(planet1: PlanetPosition, planet2: PlanetPosition): ChartAspect | null {
    const angle = this.calculateAngle(planet1.longitude, planet2.longitude);

    for (const aspectConfig of this.ASPECTS) {
      const orb = this.calculateOrb(angle, aspectConfig.angle);

      if (orb <= aspectConfig.orb) {
        // Determinar si el aspecto es aplicativo o separativo
        const isApplying = this.isAspectApplying(planet1, planet2, aspectConfig.angle);

        return {
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspectType: aspectConfig.type,
          angle: Math.round(angle * 100) / 100,
          orb: Math.round(orb * 100) / 100,
          isApplying,
        };
      }
    }

    return null;
  }

  /**
   * Calcula el ángulo entre dos longitudes
   */
  private calculateAngle(long1: number, long2: number): number {
    let diff = Math.abs(long1 - long2);

    // Siempre usar el ángulo menor
    if (diff > 180) {
      diff = 360 - diff;
    }

    return diff;
  }

  /**
   * Calcula el orbe (desviación del ángulo exacto)
   */
  private calculateOrb(actualAngle: number, aspectAngle: number): number {
    return Math.abs(actualAngle - aspectAngle);
  }

  /**
   * Determina si un aspecto es aplicativo (acercándose) o separativo
   */
  private isAspectApplying(planet1: PlanetPosition, planet2: PlanetPosition, aspectAngle: number): boolean {
    // Si no tenemos datos de velocidad, asumir aplicativo
    // En una implementación completa, usaríamos longitudeSpeed
    // Por ahora, basamos en la posición relativa

    const currentAngle = this.calculateAngle(planet1.longitude, planet2.longitude);

    // Simular movimiento futuro (aproximación simple)
    const futureAngle = this.calculateAngle(
      planet1.longitude + 1, // 1 grado de movimiento
      planet2.longitude + 0.5, // Planeta externo se mueve más lento
    );

    const currentOrb = Math.abs(currentAngle - aspectAngle);
    const futureOrb = Math.abs(futureAngle - aspectAngle);

    // Si el orbe futuro es menor, el aspecto es aplicativo
    return futureOrb < currentOrb;
  }

  /**
   * Obtiene aspectos de un planeta específico
   */
  getAspectsForPlanet(aspects: ChartAspect[], planet: Planet | string): ChartAspect[] {
    return aspects.filter((a) => a.planet1 === planet || a.planet2 === planet);
  }

  /**
   * Obtiene aspectos por tipo
   */
  getAspectsByType(aspects: ChartAspect[], type: AspectType): ChartAspect[] {
    return aspects.filter((a) => a.aspectType === type);
  }

  /**
   * Cuenta aspectos armónicos vs desafiantes
   */
  getAspectBalance(aspects: ChartAspect[]): {
    harmonious: number;
    challenging: number;
    neutral: number;
  } {
    let harmonious = 0;
    let challenging = 0;
    let neutral = 0;

    for (const aspect of aspects) {
      const metadata = AspectMetadata[aspect.aspectType];

      switch (metadata?.nature) {
        case "harmonious":
          harmonious++;
          break;
        case "challenging":
          challenging++;
          break;
        default:
          neutral++;
      }
    }

    return { harmonious, challenging, neutral };
  }

  /**
   * Encuentra el aspecto más fuerte (menor orbe)
   */
  getStrongestAspect(aspects: ChartAspect[]): ChartAspect | null {
    if (aspects.length === 0) return null;

    return aspects.reduce((strongest, current) => (current.orb < strongest.orb ? current : strongest));
  }

  /**
   * Formatea aspecto para display
   */
  formatAspect(aspect: ChartAspect): string {
    const metadata = AspectMetadata[aspect.aspectType];
    const applying = aspect.isApplying ? "(aplicativo)" : "(separativo)";

    return `${aspect.planet1} ${metadata?.symbol || "?"} ${aspect.planet2} - ${aspect.orb}° ${applying}`;
  }

  /**
   * Genera matriz de aspectos (aspectario)
   */
  generateAspectMatrix(aspects: ChartAspect[], planets: string[]): Record<string, Record<string, ChartAspect | null>> {
    const matrix: Record<string, Record<string, ChartAspect | null>> = {};

    for (const p1 of planets) {
      matrix[p1] = {};
      for (const p2 of planets) {
        if (p1 === p2) {
          matrix[p1][p2] = null;
          continue;
        }

        const aspect = aspects.find(
          (a) => (a.planet1 === p1 && a.planet2 === p2) || (a.planet1 === p2 && a.planet2 === p1),
        );

        matrix[p1][p2] = aspect || null;
      }
    }

    return matrix;
  }
}
```

**Criterios de aceptación:**

- [ ] Detección de 5 aspectos mayores
- [ ] Cálculo correcto de ángulos y orbes
- [ ] Determinación de aspecto aplicativo vs separativo
- [ ] Filtrado por planeta y por tipo
- [ ] Balance de aspectos armónicos/desafiantes
- [ ] Generación de matriz de aspectos
- [ ] Formateo para display
- [ ] Tests unitarios con aspectos conocidos
- [ ] Tests de edge cases (0°/360°)

**Dependencias:** T-CA-007

**Estimación:** 3 horas

---

### T-CA-010: Crear Servicio Orquestador de Carta Astral

**Historia relacionada:** HU-CA-001

**Descripción:**
Crear el servicio principal que orquesta todo el proceso de generación de una carta astral: coordina los cálculos, ensambla los resultados y genera el objeto `ChartData` completo.

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        ├── planet-position.service.ts
        ├── house-cusp.service.ts
        ├── aspect-calculation.service.ts
        └── chart-calculation.service.ts
```

**Implementación:**

```typescript
// chart-calculation.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { EphemerisWrapper } from "../../infrastructure/ephemeris/ephemeris.wrapper";
import { PlanetPositionService } from "./planet-position.service";
import { HouseCuspService } from "./house-cusp.service";
import { AspectCalculationService } from "./aspect-calculation.service";
import { ChartData, ChartDistribution, PlanetPosition } from "../../infrastructure/entities/birth-chart.entity";
import { ZodiacSign, ZodiacSignMetadata, Planet } from "../../domain/enums";

export interface ChartCalculationInput {
  birthDate: Date;
  birthTime: string; // "HH:mm" o "HH:mm:ss"
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ChartCalculationResult {
  chartData: ChartData;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  ascendantSign: ZodiacSign;
  calculationTimeMs: number;
}

@Injectable()
export class ChartCalculationService {
  private readonly logger = new Logger(ChartCalculationService.name);

  constructor(
    private readonly ephemeris: EphemerisWrapper,
    private readonly planetService: PlanetPositionService,
    private readonly houseService: HouseCuspService,
    private readonly aspectService: AspectCalculationService,
  ) {}

  /**
   * Genera una carta astral completa
   */
  async calculateChart(input: ChartCalculationInput): Promise<ChartCalculationResult> {
    const startTime = Date.now();

    this.logger.log(`Calculating chart for: ${input.birthDate.toISOString()}`);

    try {
      // 1. Parsear fecha y hora
      const { year, month, day, hour, minute } = this.parseDateTime(input.birthDate, input.birthTime);

      // 2. Validar inputs
      this.validateInputs(year, input.latitude, input.longitude);

      // 3. Calcular efemérides raw
      const ephemerisOutput = this.ephemeris.calculate({
        year,
        month,
        day,
        hour,
        minute,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      // 4. Transformar posiciones planetarias
      const planets = this.planetService.calculatePositions(ephemerisOutput.planets, ephemerisOutput.houses);

      // 5. Transformar cúspides de casas
      const houses = this.houseService.calculateCusps(ephemerisOutput.houses);

      // 6. Calcular Ascendente y MC
      const ascendant = this.planetService.calculateAscendant(ephemerisOutput.houses.ascendant);
      const midheaven = this.planetService.calculateMidheaven(ephemerisOutput.houses.midheaven);

      // 7. Calcular aspectos
      const aspects = this.aspectService.calculateAspects(planets, ascendant);

      // 8. Calcular distribución (elementos, modalidades, polaridad)
      const distribution = this.calculateDistribution(planets, ascendant);

      // 9. Obtener Big Three
      const bigThree = this.planetService.getBigThree(planets, ascendant);

      // 10. Ensamblar ChartData
      const chartData: ChartData = {
        planets,
        houses,
        aspects,
        ascendant,
        midheaven,
        distribution,
        aiSynthesis: undefined, // Se agrega después por AI
      };

      const calculationTimeMs = Date.now() - startTime;

      this.logger.log(`Chart calculated in ${calculationTimeMs}ms`);

      return {
        chartData,
        sunSign: bigThree.sun,
        moonSign: bigThree.moon,
        ascendantSign: bigThree.ascendant,
        calculationTimeMs,
      };
    } catch (error) {
      this.logger.error("Error calculating chart:", error);
      throw new Error(`Chart calculation failed: ${error.message}`);
    }
  }

  /**
   * Parsea fecha y hora de nacimiento
   */
  private parseDateTime(
    birthDate: Date,
    birthTime: string,
  ): { year: number; month: number; day: number; hour: number; minute: number } {
    const [timePart] = birthTime.split(":");
    const timeParts = birthTime.split(":").map(Number);

    return {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1, // JavaScript usa 0-11
      day: birthDate.getDate(),
      hour: timeParts[0] || 0,
      minute: timeParts[1] || 0,
    };
  }

  /**
   * Valida inputs antes de calcular
   */
  private validateInputs(year: number, latitude: number, longitude: number): void {
    if (!this.ephemeris.validateDate(year)) {
      throw new Error(`Invalid year: ${year}. Must be between 1800 and 2100.`);
    }

    if (!this.ephemeris.validateCoordinates(latitude, longitude)) {
      throw new Error(`Invalid coordinates: lat=${latitude}, lon=${longitude}`);
    }
  }

  /**
   * Calcula distribución de elementos, modalidades y polaridad
   */
  private calculateDistribution(planets: PlanetPosition[], ascendant: PlanetPosition): ChartDistribution {
    // Incluir Ascendente en el conteo (es significativo)
    const allPoints = [...planets, ascendant];

    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
    const polarity = { masculine: 0, feminine: 0 };

    for (const point of allPoints) {
      const sign = point.sign as ZodiacSign;
      const metadata = ZodiacSignMetadata[sign];

      if (metadata) {
        // Contar elemento
        elements[metadata.element]++;

        // Contar modalidad
        modalities[metadata.modality]++;

        // Contar polaridad (fuego y aire = masculino, tierra y agua = femenino)
        if (metadata.element === "fire" || metadata.element === "air") {
          polarity.masculine++;
        } else {
          polarity.feminine++;
        }
      }
    }

    return { elements, modalities, polarity };
  }

  /**
   * Obtiene resumen de la carta para logs/debug
   */
  getChartSummary(result: ChartCalculationResult): string {
    const { chartData, sunSign, moonSign, ascendantSign } = result;

    return [
      `Big Three: Sol en ${sunSign}, Luna en ${moonSign}, Ascendente en ${ascendantSign}`,
      `Planetas: ${chartData.planets.length}`,
      `Aspectos: ${chartData.aspects.length}`,
      `Distribución: Fuego=${chartData.distribution.elements.fire}, ` +
        `Tierra=${chartData.distribution.elements.earth}, ` +
        `Aire=${chartData.distribution.elements.air}, ` +
        `Agua=${chartData.distribution.elements.water}`,
    ].join("\n");
  }

  /**
   * Valida si una carta calculada tiene datos completos
   */
  validateChartData(chartData: ChartData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!chartData.planets || chartData.planets.length !== 10) {
      errors.push(`Expected 10 planets, got ${chartData.planets?.length || 0}`);
    }

    if (!chartData.houses || chartData.houses.length !== 12) {
      errors.push(`Expected 12 houses, got ${chartData.houses?.length || 0}`);
    }

    if (!chartData.ascendant) {
      errors.push("Missing ascendant");
    }

    if (!chartData.midheaven) {
      errors.push("Missing midheaven");
    }

    if (!chartData.distribution) {
      errors.push("Missing distribution");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

**Criterios de aceptación:**

- [ ] Orquestación completa del cálculo de carta
- [ ] Parseo correcto de fecha y hora
- [ ] Validación de inputs antes de calcular
- [ ] Cálculo de distribución de elementos/modalidades
- [ ] Ensamblaje correcto de ChartData
- [ ] Extracción de Big Three
- [ ] Logging de tiempo de cálculo
- [ ] Validación de datos calculados
- [ ] Manejo de errores robusto
- [ ] Tests de integración completos
- [ ] Tests con cartas de ejemplo verificadas

**Dependencias:** T-CA-006, T-CA-007, T-CA-008, T-CA-009

**Estimación:** 4 horas

---

## CHECKLIST DE PARTE 7C

- [ ] T-CA-006: Librería de efemérides configurada
- [ ] T-CA-007: Servicio de posiciones planetarias funcionando
- [ ] T-CA-008: Servicio de cúspides de casas funcionando
- [ ] T-CA-009: Servicio de cálculo de aspectos funcionando
- [ ] T-CA-010: Servicio orquestador integrando todo

---

## DIAGRAMA DE DEPENDENCIAS

```
T-CA-006 (Ephemeris)
    │
    ▼
T-CA-007 (Planet Positions) ──────┐
    │                             │
    ▼                             │
T-CA-008 (House Cusps) ◄──────────┤
    │                             │
    ▼                             │
T-CA-009 (Aspects) ◄──────────────┘
    │
    ▼
T-CA-010 (Chart Calculator) ◄─────── Usa todos los anteriores
```

---

## PRÓXIMOS PASOS

**Siguiente parte:** PARTE-7D - Tareas de Backend: Servicios de Interpretación y Caché

---

**FIN DE PARTE 7C - TAREAS DE CÁLCULOS ASTRONÓMICOS**

# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7D: TAREAS DE BACKEND - SERVICIOS DE INTERPRETACIÓN Y CACHÉ

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.0  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## RESUMEN DE PARTE 7D

Esta parte cubre los servicios que recuperan interpretaciones de la base de datos, generan síntesis con IA para usuarios Premium, y gestionan el caché de cartas astrales.

| Tarea    | Título                                    | Tipo    | Prioridad | Estimación |
| -------- | ----------------------------------------- | ------- | --------- | ---------- |
| T-CA-011 | Crear repositorio de interpretaciones     | Backend | Must      | 3h         |
| T-CA-012 | Crear servicio de interpretación de carta | Backend | Must      | 4h         |
| T-CA-013 | Crear servicio de síntesis con IA         | Backend | Must      | 4h         |
| T-CA-014 | Integrar caché para cartas astrales       | Backend | Should    | 3h         |
| T-CA-015 | Crear servicio de generación de PDF       | Backend | Should    | 5h         |

**Total estimado:** 19 horas

---

## DETALLE DE TAREAS

### T-CA-011: Crear Repositorio de Interpretaciones

**Historia relacionada:** HU-CA-004, HU-CA-005

**Descripción:**
Crear el repositorio que encapsula las consultas a la tabla `birth_chart_interpretations`, optimizando la recuperación de textos según planeta, signo, casa y aspectos.

**Ubicación:** `src/modules/birth-chart/infrastructure/repositories/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── infrastructure/
    └── repositories/
        ├── index.ts
        ├── birth-chart-interpretation.repository.ts
        └── birth-chart-interpretation.repository.interface.ts
```

**Implementación:**

```typescript
// birth-chart-interpretation.repository.interface.ts
import { BirthChartInterpretation } from "../entities/birth-chart-interpretation.entity";
import { InterpretationCategory, Planet, ZodiacSign, AspectType } from "../../domain/enums";

export interface IBirthChartInterpretationRepository {
  /**
   * Busca interpretación de planeta en signo
   */
  findPlanetInSign(planet: Planet, sign: ZodiacSign): Promise<BirthChartInterpretation | null>;

  /**
   * Busca interpretación de planeta en casa
   */
  findPlanetInHouse(planet: Planet, house: number): Promise<BirthChartInterpretation | null>;

  /**
   * Busca interpretación de aspecto entre planetas
   */
  findAspect(planet1: Planet, planet2: Planet, aspectType: AspectType): Promise<BirthChartInterpretation | null>;

  /**
   * Busca interpretación del Ascendente en signo
   */
  findAscendant(sign: ZodiacSign): Promise<BirthChartInterpretation | null>;

  /**
   * Busca introducción de un planeta
   */
  findPlanetIntro(planet: Planet): Promise<BirthChartInterpretation | null>;

  /**
   * Obtiene todas las interpretaciones necesarias para una carta
   */
  findAllForChart(params: {
    planets: Array<{ planet: Planet; sign: ZodiacSign; house: number }>;
    aspects: Array<{ planet1: Planet; planet2: Planet; aspectType: AspectType }>;
    ascendantSign: ZodiacSign;
  }): Promise<Map<string, BirthChartInterpretation>>;

  /**
   * Obtiene solo interpretaciones del Big Three
   */
  findBigThree(
    sunSign: ZodiacSign,
    moonSign: ZodiacSign,
    ascendantSign: ZodiacSign,
  ): Promise<{
    sun: BirthChartInterpretation | null;
    moon: BirthChartInterpretation | null;
    ascendant: BirthChartInterpretation | null;
  }>;
}

export const BIRTH_CHART_INTERPRETATION_REPOSITORY = Symbol("BIRTH_CHART_INTERPRETATION_REPOSITORY");
```

```typescript
// birth-chart-interpretation.repository.ts
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { BirthChartInterpretation } from "../entities/birth-chart-interpretation.entity";
import { IBirthChartInterpretationRepository } from "./birth-chart-interpretation.repository.interface";
import { InterpretationCategory, Planet, ZodiacSign, AspectType } from "../../domain/enums";

@Injectable()
export class BirthChartInterpretationRepository implements IBirthChartInterpretationRepository {
  private readonly logger = new Logger(BirthChartInterpretationRepository.name);

  constructor(
    @InjectRepository(BirthChartInterpretation)
    private readonly repo: Repository<BirthChartInterpretation>,
  ) {}

  async findPlanetInSign(planet: Planet, sign: ZodiacSign): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.PLANET_IN_SIGN,
        planet,
        sign,
        isActive: true,
      },
    });
  }

  async findPlanetInHouse(planet: Planet, house: number): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.PLANET_IN_HOUSE,
        planet,
        house,
        isActive: true,
      },
    });
  }

  async findAspect(planet1: Planet, planet2: Planet, aspectType: AspectType): Promise<BirthChartInterpretation | null> {
    // Buscar en ambas direcciones (Sol-Luna o Luna-Sol)
    const result = await this.repo.findOne({
      where: [
        {
          category: InterpretationCategory.ASPECT,
          planet: planet1,
          planet2: planet2,
          aspectType,
          isActive: true,
        },
        {
          category: InterpretationCategory.ASPECT,
          planet: planet2,
          planet2: planet1,
          aspectType,
          isActive: true,
        },
      ],
    });

    return result;
  }

  async findAscendant(sign: ZodiacSign): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.ASCENDANT,
        sign,
        isActive: true,
      },
    });
  }

  async findPlanetIntro(planet: Planet): Promise<BirthChartInterpretation | null> {
    return this.repo.findOne({
      where: {
        category: InterpretationCategory.PLANET_INTRO,
        planet,
        isActive: true,
      },
    });
  }

  async findBigThree(
    sunSign: ZodiacSign,
    moonSign: ZodiacSign,
    ascendantSign: ZodiacSign,
  ): Promise<{
    sun: BirthChartInterpretation | null;
    moon: BirthChartInterpretation | null;
    ascendant: BirthChartInterpretation | null;
  }> {
    const [sun, moon, ascendant] = await Promise.all([
      this.findPlanetInSign(Planet.SUN, sunSign),
      this.findPlanetInSign(Planet.MOON, moonSign),
      this.findAscendant(ascendantSign),
    ]);

    return { sun, moon, ascendant };
  }

  async findAllForChart(params: {
    planets: Array<{ planet: Planet; sign: ZodiacSign; house: number }>;
    aspects: Array<{ planet1: Planet; planet2: Planet; aspectType: AspectType }>;
    ascendantSign: ZodiacSign;
  }): Promise<Map<string, BirthChartInterpretation>> {
    const results = new Map<string, BirthChartInterpretation>();

    this.logger.debug(
      `Fetching interpretations for ${params.planets.length} planets and ${params.aspects.length} aspects`,
    );

    // 1. Buscar introducciones de planetas (10)
    const planetIntros = await this.repo.find({
      where: {
        category: InterpretationCategory.PLANET_IN_SIGN,
        planet: In(params.planets.map((p) => p.planet)),
        isActive: true,
      },
    });

    // 2. Buscar planetas en signos (batch)
    const planetSignKeys = params.planets.map((p) => ({
      planet: p.planet,
      sign: p.sign,
    }));

    for (const interp of planetIntros) {
      const key = BirthChartInterpretation.generateKey(InterpretationCategory.PLANET_INTRO, interp.planet);
      results.set(key, interp);
    }

    // 3. Buscar planetas en casas (batch)
    const planetHousePromises = params.planets.map((p) =>
      this.findPlanetInHouse(p.planet, p.house).then((interp) => {
        if (interp) {
          const key = BirthChartInterpretation.generateKey(
            InterpretationCategory.PLANET_IN_HOUSE,
            interp.planet,
            null,
            interp.house,
          );
          results.set(key, interp);
        }
      }),
    );

    // 4. Buscar planetas en signos
    const planetSignPromises = params.planets.map((p) =>
      this.findPlanetInSign(p.planet, p.sign).then((interp) => {
        if (interp) {
          const key = BirthChartInterpretation.generateKey(
            InterpretationCategory.PLANET_IN_SIGN,
            interp.planet,
            interp.sign,
          );
          results.set(key, interp);
        }
      }),
    );

    // 5. Buscar aspectos
    const aspectPromises = params.aspects.map((a) =>
      this.findAspect(a.planet1, a.planet2, a.aspectType).then((interp) => {
        if (interp) {
          const key = BirthChartInterpretation.generateKey(
            InterpretationCategory.ASPECT,
            interp.planet,
            null,
            null,
            interp.aspectType,
            interp.planet2,
          );
          results.set(key, interp);
        }
      }),
    );

    // 6. Buscar Ascendente
    const ascendantPromise = this.findAscendant(params.ascendantSign).then((interp) => {
      if (interp) {
        const key = BirthChartInterpretation.generateKey(InterpretationCategory.ASCENDANT, null, interp.sign);
        results.set(key, interp);
      }
    });

    // Ejecutar todas las promesas en paralelo
    await Promise.all([...planetHousePromises, ...planetSignPromises, ...aspectPromises, ascendantPromise]);

    this.logger.debug(`Retrieved ${results.size} interpretations`);

    return results;
  }

  /**
   * Cuenta interpretaciones por categoría (para estadísticas)
   */
  async countByCategory(): Promise<Record<InterpretationCategory, number>> {
    const counts = await this.repo
      .createQueryBuilder("interp")
      .select("interp.category", "category")
      .addSelect("COUNT(*)", "count")
      .where("interp.isActive = :active", { active: true })
      .groupBy("interp.category")
      .getRawMany();

    const result = {} as Record<InterpretationCategory, number>;
    for (const row of counts) {
      result[row.category as InterpretationCategory] = parseInt(row.count, 10);
    }

    return result;
  }
}
```

**Criterios de aceptación:**

- [ ] Interface definida con todos los métodos necesarios
- [ ] Implementación de búsqueda por planeta/signo
- [ ] Implementación de búsqueda por planeta/casa
- [ ] Implementación de búsqueda de aspectos (bidireccional)
- [ ] Implementación de búsqueda de Ascendente
- [ ] Método batch para obtener todas las interpretaciones de una carta
- [ ] Optimización con consultas paralelas
- [ ] Token de inyección de dependencias
- [ ] Tests unitarios con mocks
- [ ] Tests de integración con DB

**Dependencias:** T-CA-003 (entidad BirthChartInterpretation)

**Estimación:** 3 horas

---

### T-CA-012: Crear Servicio de Interpretación de Carta

**Historia relacionada:** HU-CA-004, HU-CA-005

**Descripción:**
Crear el servicio que ensambla las interpretaciones para una carta astral, organizándolas en la estructura necesaria para mostrar al usuario según su plan (Big Three para anónimos, completo para Free/Premium).

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        └── chart-interpretation.service.ts
```

**Implementación:**

```typescript
// chart-interpretation.service.ts
import { Injectable, Logger, Inject } from "@nestjs/common";
import {
  BIRTH_CHART_INTERPRETATION_REPOSITORY,
  IBirthChartInterpretationRepository,
} from "../../infrastructure/repositories/birth-chart-interpretation.repository.interface";
import { BirthChartInterpretation } from "../../infrastructure/entities/birth-chart-interpretation.entity";
import { ChartData, PlanetPosition, ChartAspect } from "../../infrastructure/entities/birth-chart.entity";
import {
  Planet,
  ZodiacSign,
  AspectType,
  PlanetMetadata,
  ZodiacSignMetadata,
  AspectMetadata,
  InterpretationCategory,
} from "../../domain/enums";

/**
 * Interpretación de un planeta individual
 */
export interface PlanetInterpretation {
  planet: Planet;
  planetName: string;
  planetSymbol: string;
  sign: ZodiacSign;
  signName: string;
  house: number;
  isRetrograde: boolean;
  intro?: string;
  inSign?: string;
  inHouse?: string;
  aspects?: AspectInterpretation[];
}

/**
 * Interpretación de un aspecto
 */
export interface AspectInterpretation {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  aspectName: string;
  aspectSymbol: string;
  orb: number;
  interpretation?: string;
}

/**
 * Interpretación del Big Three
 */
export interface BigThreeInterpretation {
  sun: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  moon: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  ascendant: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
}

/**
 * Informe completo de interpretación
 */
export interface FullChartInterpretation {
  bigThree: BigThreeInterpretation;
  planets: PlanetInterpretation[];
  distribution: {
    elements: { name: string; count: number; percentage: number }[];
    modalities: { name: string; count: number; percentage: number }[];
  };
  aspectSummary: {
    total: number;
    harmonious: number;
    challenging: number;
    strongest?: AspectInterpretation;
  };
}

@Injectable()
export class ChartInterpretationService {
  private readonly logger = new Logger(ChartInterpretationService.name);

  constructor(
    @Inject(BIRTH_CHART_INTERPRETATION_REPOSITORY)
    private readonly interpretationRepo: IBirthChartInterpretationRepository,
  ) {}

  /**
   * Genera interpretación del Big Three (para TODOS los planes)
   */
  async generateBigThreeInterpretation(
    sunSign: ZodiacSign,
    moonSign: ZodiacSign,
    ascendantSign: ZodiacSign,
  ): Promise<BigThreeInterpretation> {
    this.logger.debug("Generating Big Three interpretation");

    const { sun, moon, ascendant } = await this.interpretationRepo.findBigThree(sunSign, moonSign, ascendantSign);

    return {
      sun: {
        sign: sunSign,
        signName: ZodiacSignMetadata[sunSign]?.name || sunSign,
        interpretation: sun?.content || this.getDefaultInterpretation("sun", sunSign),
      },
      moon: {
        sign: moonSign,
        signName: ZodiacSignMetadata[moonSign]?.name || moonSign,
        interpretation: moon?.content || this.getDefaultInterpretation("moon", moonSign),
      },
      ascendant: {
        sign: ascendantSign,
        signName: ZodiacSignMetadata[ascendantSign]?.name || ascendantSign,
        interpretation: ascendant?.content || this.getDefaultInterpretation("ascendant", ascendantSign),
      },
    };
  }

  /**
   * Genera interpretación completa (para Free y Premium)
   */
  async generateFullInterpretation(chartData: ChartData): Promise<FullChartInterpretation> {
    this.logger.debug("Generating full chart interpretation");

    // 1. Preparar parámetros para búsqueda batch
    const planets = chartData.planets.map((p) => ({
      planet: p.planet as Planet,
      sign: p.sign as ZodiacSign,
      house: p.house,
    }));

    const aspects = chartData.aspects.map((a) => ({
      planet1: a.planet1 as Planet,
      planet2: a.planet2 as Planet,
      aspectType: a.aspectType as AspectType,
    }));

    const ascendantSign = chartData.ascendant.sign as ZodiacSign;

    // 2. Obtener todas las interpretaciones en batch
    const interpretationsMap = await this.interpretationRepo.findAllForChart({
      planets,
      aspects,
      ascendantSign,
    });

    // 3. Generar Big Three
    const sunSign = chartData.planets.find((p) => p.planet === Planet.SUN)?.sign as ZodiacSign;
    const moonSign = chartData.planets.find((p) => p.planet === Planet.MOON)?.sign as ZodiacSign;
    const bigThree = await this.generateBigThreeInterpretation(sunSign, moonSign, ascendantSign);

    // 4. Generar interpretaciones de planetas
    const planetInterpretations = this.buildPlanetInterpretations(
      chartData.planets,
      chartData.aspects,
      interpretationsMap,
    );

    // 5. Calcular distribución con porcentajes
    const distribution = this.buildDistributionSummary(chartData.distribution);

    // 6. Generar resumen de aspectos
    const aspectSummary = this.buildAspectSummary(chartData.aspects, interpretationsMap);

    return {
      bigThree,
      planets: planetInterpretations,
      distribution,
      aspectSummary,
    };
  }

  /**
   * Construye interpretaciones para cada planeta
   */
  private buildPlanetInterpretations(
    planets: PlanetPosition[],
    aspects: ChartAspect[],
    interpretationsMap: Map<string, BirthChartInterpretation>,
  ): PlanetInterpretation[] {
    return planets.map((planet) => {
      const planetEnum = planet.planet as Planet;
      const signEnum = planet.sign as ZodiacSign;

      // Buscar interpretaciones
      const introKey = BirthChartInterpretation.generateKey(InterpretationCategory.PLANET_INTRO, planetEnum);
      const signKey = BirthChartInterpretation.generateKey(InterpretationCategory.PLANET_IN_SIGN, planetEnum, signEnum);
      const houseKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_IN_HOUSE,
        planetEnum,
        null,
        planet.house,
      );

      // Obtener aspectos de este planeta
      const planetAspects = aspects
        .filter((a) => a.planet1 === planet.planet || a.planet2 === planet.planet)
        .map((a) => this.buildAspectInterpretation(a, interpretationsMap));

      return {
        planet: planetEnum,
        planetName: PlanetMetadata[planetEnum]?.name || planet.planet,
        planetSymbol: PlanetMetadata[planetEnum]?.symbol || "",
        sign: signEnum,
        signName: ZodiacSignMetadata[signEnum]?.name || planet.sign,
        house: planet.house,
        isRetrograde: planet.isRetrograde,
        intro: interpretationsMap.get(introKey)?.content,
        inSign: interpretationsMap.get(signKey)?.content,
        inHouse: interpretationsMap.get(houseKey)?.content,
        aspects: planetAspects,
      };
    });
  }

  /**
   * Construye interpretación de un aspecto
   */
  private buildAspectInterpretation(
    aspect: ChartAspect,
    interpretationsMap: Map<string, BirthChartInterpretation>,
  ): AspectInterpretation {
    const aspectKey = BirthChartInterpretation.generateKey(
      InterpretationCategory.ASPECT,
      aspect.planet1 as Planet,
      null,
      null,
      aspect.aspectType as AspectType,
      aspect.planet2 as Planet,
    );

    const metadata = AspectMetadata[aspect.aspectType as AspectType];

    return {
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      aspectType: aspect.aspectType as AspectType,
      aspectName: metadata?.name || aspect.aspectType,
      aspectSymbol: metadata?.symbol || "",
      orb: aspect.orb,
      interpretation: interpretationsMap.get(aspectKey)?.content,
    };
  }

  /**
   * Construye resumen de distribución con porcentajes
   */
  private buildDistributionSummary(distribution: ChartData["distribution"]): {
    elements: { name: string; count: number; percentage: number }[];
    modalities: { name: string; count: number; percentage: number }[];
  } {
    const totalPlanets = 11; // 10 planetas + Ascendente

    const elements = [
      { name: "Fuego", count: distribution.elements.fire },
      { name: "Tierra", count: distribution.elements.earth },
      { name: "Aire", count: distribution.elements.air },
      { name: "Agua", count: distribution.elements.water },
    ].map((e) => ({
      ...e,
      percentage: Math.round((e.count / totalPlanets) * 100),
    }));

    const modalities = [
      { name: "Cardinal", count: distribution.modalities.cardinal },
      { name: "Fijo", count: distribution.modalities.fixed },
      { name: "Mutable", count: distribution.modalities.mutable },
    ].map((m) => ({
      ...m,
      percentage: Math.round((m.count / totalPlanets) * 100),
    }));

    return { elements, modalities };
  }

  /**
   * Construye resumen de aspectos
   */
  private buildAspectSummary(
    aspects: ChartAspect[],
    interpretationsMap: Map<string, BirthChartInterpretation>,
  ): {
    total: number;
    harmonious: number;
    challenging: number;
    strongest?: AspectInterpretation;
  } {
    let harmonious = 0;
    let challenging = 0;

    for (const aspect of aspects) {
      const metadata = AspectMetadata[aspect.aspectType as AspectType];
      if (metadata?.nature === "harmonious") {
        harmonious++;
      } else if (metadata?.nature === "challenging") {
        challenging++;
      }
    }

    // Encontrar el aspecto más fuerte (menor orbe)
    const strongest = aspects.length > 0 ? aspects.reduce((min, a) => (a.orb < min.orb ? a : min)) : undefined;

    return {
      total: aspects.length,
      harmonious,
      challenging,
      strongest: strongest ? this.buildAspectInterpretation(strongest, interpretationsMap) : undefined,
    };
  }

  /**
   * Genera interpretación por defecto si no existe en DB
   */
  private getDefaultInterpretation(type: string, sign: ZodiacSign): string {
    const signName = ZodiacSignMetadata[sign]?.name || sign;

    switch (type) {
      case "sun":
        return `Tu Sol en ${signName} representa tu esencia y propósito vital. Este signo influye en tu identidad central y cómo expresas tu individualidad.`;
      case "moon":
        return `Tu Luna en ${signName} revela tu mundo emocional interior. Este signo influye en cómo procesas tus sentimientos y qué necesitas para sentirte seguro.`;
      case "ascendant":
        return `Tu Ascendente en ${signName} es la máscara que muestras al mundo. Este signo influye en la primera impresión que causas y cómo inicias nuevas experiencias.`;
      default:
        return "";
    }
  }
}
```

**Criterios de aceptación:**

- [ ] Generación de Big Three para todos los planes
- [ ] Generación de informe completo para Free/Premium
- [ ] Ensamblaje de interpretaciones por planeta
- [ ] Ensamblaje de interpretaciones de aspectos
- [ ] Cálculo de porcentajes de distribución
- [ ] Resumen de balance de aspectos
- [ ] Interpretaciones por defecto si faltan en DB
- [ ] Optimización con consultas batch
- [ ] Tests unitarios completos
- [ ] Tests de integración

**Dependencias:** T-CA-011

**Estimación:** 4 horas

---

### T-CA-013: Crear Servicio de Síntesis con IA

**Historia relacionada:** HU-CA-006

**Descripción:**
Crear el servicio que genera la síntesis personalizada con IA para usuarios Premium, conectando los diferentes elementos de la carta en un texto cohesivo y único.

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        └── chart-ai-synthesis.service.ts
```

**Implementación:**

```typescript
// chart-ai-synthesis.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { AIProviderService } from "../../../ai/application/services/ai-provider.service";
import { AIMessage } from "../../../ai/domain/interfaces/ai-provider.interface";
import { ChartData, PlanetPosition, ChartAspect } from "../../infrastructure/entities/birth-chart.entity";
import { ZodiacSign, Planet, AspectType, ZodiacSignMetadata, PlanetMetadata, AspectMetadata } from "../../domain/enums";
import { FullChartInterpretation } from "./chart-interpretation.service";

export interface AISynthesisInput {
  chartData: ChartData;
  interpretation: FullChartInterpretation;
  userName?: string;
  birthDate?: Date;
}

export interface AISynthesisResult {
  synthesis: string;
  tokensUsed: number;
  provider: string;
  model: string;
  durationMs: number;
}

@Injectable()
export class ChartAISynthesisService {
  private readonly logger = new Logger(ChartAISynthesisService.name);

  // Configuración de la síntesis
  private readonly MAX_TOKENS = 1500;
  private readonly TEMPERATURE = 0.7;

  constructor(private readonly aiProvider: AIProviderService) {}

  /**
   * Genera síntesis personalizada con IA
   */
  async generateSynthesis(input: AISynthesisInput, userId?: number): Promise<AISynthesisResult> {
    this.logger.log("Generating AI synthesis for chart");

    const startTime = Date.now();

    try {
      // 1. Construir el prompt
      const messages = this.buildPrompt(input);

      // 2. Llamar al servicio de IA
      const response = await this.aiProvider.generateCompletion(
        messages,
        userId,
        null, // No hay readingId para cartas astrales
        {
          maxTokens: this.MAX_TOKENS,
          temperature: this.TEMPERATURE,
        },
      );

      const durationMs = Date.now() - startTime;

      this.logger.log(`AI synthesis generated in ${durationMs}ms using ${response.provider}`);

      return {
        synthesis: response.content,
        tokensUsed: response.tokensUsed.total,
        provider: response.provider,
        model: response.model,
        durationMs,
      };
    } catch (error) {
      this.logger.error("Error generating AI synthesis:", error);
      throw new Error(`AI synthesis generation failed: ${error.message}`);
    }
  }

  /**
   * Construye los mensajes del prompt para la IA
   */
  private buildPrompt(input: AISynthesisInput): AIMessage[] {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(input);

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
  }

  /**
   * Construye el prompt de sistema
   */
  private buildSystemPrompt(): string {
    return `Eres un astrólogo profesional con profundo conocimiento de astrología occidental. Tu tarea es crear una síntesis personalizada de una carta natal.

INSTRUCCIONES:
1. Escribe en segunda persona, hablándole directamente a la persona.
2. Conecta los diferentes elementos de la carta entre sí, mostrando cómo interactúan.
3. Identifica patrones o temas recurrentes en la carta.
4. Usa un tono cálido, empoderador y perspicaz.
5. Evita predicciones concretas o deterministas.
6. No repitas la información que ya se le mostró en las interpretaciones individuales.
7. Enfócate en la integración y síntesis de los elementos.
8. La respuesta debe ser de 3-5 párrafos sustanciales.
9. Escribe en español.

ESTRUCTURA SUGERIDA:
- Párrafo 1: Tema central o hilo conductor de la carta
- Párrafo 2: Cómo interactúan tus luminarias (Sol y Luna) con tu Ascendente
- Párrafo 3: Patrones en los aspectos más significativos
- Párrafo 4: Tu distribución de elementos y cómo te afecta
- Párrafo 5: Mensaje integrador final

NO incluyas:
- Saludos o despedidas
- Menciones de que eres una IA
- Disclaimers legales
- Referencias a "esta síntesis" o "este análisis"`;
  }

  /**
   * Construye el prompt del usuario con los datos de la carta
   */
  private buildUserPrompt(input: AISynthesisInput): string {
    const { chartData, interpretation, userName, birthDate } = input;

    // Formatear el Big Three
    const bigThree = `
SOL EN ${interpretation.bigThree.sun.signName.toUpperCase()}:
${interpretation.bigThree.sun.interpretation}

LUNA EN ${interpretation.bigThree.moon.signName.toUpperCase()}:
${interpretation.bigThree.moon.interpretation}

ASCENDENTE EN ${interpretation.bigThree.ascendant.signName.toUpperCase()}:
${interpretation.bigThree.ascendant.interpretation}`;

    // Formatear posiciones planetarias
    const positions = chartData.planets
      .map((p) => {
        const planetName = PlanetMetadata[p.planet as Planet]?.name || p.planet;
        const signName = ZodiacSignMetadata[p.sign as ZodiacSign]?.name || p.sign;
        const retro = p.isRetrograde ? " (R)" : "";
        return `${planetName}: ${signName} en Casa ${p.house}${retro}`;
      })
      .join("\n");

    // Formatear aspectos principales (solo los más fuertes)
    const strongAspects = chartData.aspects
      .filter((a) => a.orb <= 5) // Solo aspectos con orbe <= 5°
      .slice(0, 10) // Máximo 10 aspectos
      .map((a) => {
        const p1 = PlanetMetadata[a.planet1 as Planet]?.name || a.planet1;
        const p2 = PlanetMetadata[a.planet2 as Planet]?.name || a.planet2;
        const aspectName = AspectMetadata[a.aspectType as AspectType]?.name || a.aspectType;
        return `${p1} ${aspectName} ${p2} (orbe: ${a.orb}°)`;
      })
      .join("\n");

    // Formatear distribución
    const distribution = `
ELEMENTOS:
- Fuego: ${chartData.distribution.elements.fire} planetas
- Tierra: ${chartData.distribution.elements.earth} planetas
- Aire: ${chartData.distribution.elements.air} planetas
- Agua: ${chartData.distribution.elements.water} planetas

MODALIDADES:
- Cardinal: ${chartData.distribution.modalities.cardinal} planetas
- Fijo: ${chartData.distribution.modalities.fixed} planetas
- Mutable: ${chartData.distribution.modalities.mutable} planetas`;

    // Construir prompt completo
    return `Genera una síntesis personalizada para la siguiente carta natal:

${userName ? `NOMBRE: ${userName}` : ""}
${birthDate ? `FECHA DE NACIMIENTO: ${birthDate.toLocaleDateString("es-ES")}` : ""}

=== BIG THREE ===
${bigThree}

=== POSICIONES PLANETARIAS ===
${positions}

=== ASPECTOS PRINCIPALES ===
${strongAspects}

=== DISTRIBUCIÓN ===
${distribution}

=== BALANCE DE ASPECTOS ===
- Total de aspectos: ${interpretation.aspectSummary.total}
- Aspectos armónicos: ${interpretation.aspectSummary.harmonious}
- Aspectos desafiantes: ${interpretation.aspectSummary.challenging}

Genera la síntesis ahora:`;
  }

  /**
   * Valida si el resultado de la IA es aceptable
   */
  validateSynthesis(synthesis: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Verificar longitud mínima
    if (synthesis.length < 500) {
      issues.push("Synthesis too short (< 500 characters)");
    }

    // Verificar que no contenga placeholders
    if (synthesis.includes("[") && synthesis.includes("]")) {
      issues.push("Synthesis contains potential placeholders");
    }

    // Verificar que esté en español
    const spanishIndicators = ["el", "la", "de", "que", "tu", "en"];
    const hasSpanish = spanishIndicators.some((word) => synthesis.toLowerCase().includes(` ${word} `));
    if (!hasSpanish) {
      issues.push("Synthesis might not be in Spanish");
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Genera síntesis de fallback si la IA falla
   */
  generateFallbackSynthesis(interpretation: FullChartInterpretation): string {
    const { bigThree, distribution, aspectSummary } = interpretation;

    const dominantElement = this.findDominant(distribution.elements);
    const dominantModality = this.findDominant(distribution.modalities);

    return `Tu carta natal revela una personalidad con el Sol en ${bigThree.sun.signName}, lo que define tu esencia central, combinada con una Luna en ${bigThree.moon.signName} que colorea tu mundo emocional, y un Ascendente en ${bigThree.ascendant.signName} que moldea cómo te presentas al mundo.

Con una predominancia del elemento ${dominantElement.name} en tu carta, tiendes a procesar la vida principalmente a través de ${this.getElementDescription(dominantElement.name)}. La modalidad ${dominantModality.name} dominante sugiere que tu forma de actuar es principalmente ${this.getModalityDescription(dominantModality.name)}.

En cuanto a tus aspectos planetarios, tienes ${aspectSummary.harmonious} aspectos armónicos y ${aspectSummary.challenging} aspectos desafiantes, lo que indica ${aspectSummary.harmonious > aspectSummary.challenging ? "un flujo relativamente fácil de energía en tu carta" : "oportunidades de crecimiento a través de la tensión creativa"}.

Esta combinación única de energías te hace una persona singular, con talentos y desafíos específicos que forman parte de tu camino de desarrollo personal.`;
  }

  /**
   * Encuentra el elemento/modalidad dominante
   */
  private findDominant(items: { name: string; count: number }[]): { name: string; count: number } {
    return items.reduce((max, item) => (item.count > max.count ? item : max));
  }

  /**
   * Descripción de elemento
   */
  private getElementDescription(element: string): string {
    const descriptions: Record<string, string> = {
      Fuego: "la acción, la inspiración y el entusiasmo",
      Tierra: "lo práctico, lo tangible y la estabilidad",
      Aire: "las ideas, la comunicación y las conexiones",
      Agua: "las emociones, la intuición y la profundidad",
    };
    return descriptions[element] || "tu forma única de ser";
  }

  /**
   * Descripción de modalidad
   */
  private getModalityDescription(modality: string): string {
    const descriptions: Record<string, string> = {
      Cardinal: "iniciadora y emprendedora",
      Fijo: "persistente y determinada",
      Mutable: "adaptable y flexible",
    };
    return descriptions[modality] || "única";
  }
}
```

**Criterios de aceptación:**

- [ ] Integración con AIProviderService existente
- [ ] Prompt de sistema bien estructurado
- [ ] Prompt de usuario con todos los datos relevantes
- [ ] Validación del resultado de la IA
- [ ] Síntesis de fallback si la IA falla
- [ ] Logging de métricas (tiempo, tokens, provider)
- [ ] Manejo de errores robusto
- [ ] Tests unitarios con mocks de AI
- [ ] Tests de integración

**Dependencias:** T-CA-012, Módulo AI existente

**Estimación:** 4 horas

---

### T-CA-014: Integrar Caché para Cartas Astrales

**Historia relacionada:** HU-CA-001, HU-CA-006

**Descripción:**
Integrar el sistema de caché existente para almacenar cálculos de cartas astrales y síntesis de IA, evitando recálculos innecesarios y reduciendo costos de AI.

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear/modificar:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        └── chart-cache.service.ts
```

**Implementación:**

```typescript
// chart-cache.service.ts
import { Injectable, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { createHash } from "crypto";
import { ChartData } from "../../infrastructure/entities/birth-chart.entity";
import { FullChartInterpretation } from "./chart-interpretation.service";

export interface CachedChartData {
  chartData: ChartData;
  calculatedAt: Date;
  cacheKey: string;
}

export interface CachedSynthesis {
  synthesis: string;
  generatedAt: Date;
  provider: string;
  model: string;
}

@Injectable()
export class ChartCacheService {
  private readonly logger = new Logger(ChartCacheService.name);

  // TTL para diferentes tipos de caché
  private readonly CHART_CALCULATION_TTL = 24 * 60 * 60 * 1000; // 24 horas
  private readonly SYNTHESIS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días
  private readonly INTERPRETATION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Genera clave de caché para cálculos de carta
   */
  generateChartCacheKey(birthDate: Date, birthTime: string, latitude: number, longitude: number): string {
    const dataString = `chart:${birthDate.toISOString()}:${birthTime}:${latitude}:${longitude}`;
    return createHash("sha256").update(dataString).digest("hex");
  }

  /**
   * Genera clave de caché para síntesis de IA
   */
  generateSynthesisCacheKey(chartCacheKey: string): string {
    return `synthesis:${chartCacheKey}`;
  }

  /**
   * Genera clave de caché para interpretaciones
   */
  generateInterpretationCacheKey(chartCacheKey: string): string {
    return `interpretation:${chartCacheKey}`;
  }

  /**
   * Obtiene cálculo de carta desde caché
   */
  async getChartCalculation(cacheKey: string): Promise<CachedChartData | null> {
    try {
      const cached = await this.cacheManager.get<CachedChartData>(`chart:${cacheKey}`);

      if (cached) {
        this.logger.debug(`Chart calculation cache HIT: ${cacheKey}`);
        return cached;
      }

      this.logger.debug(`Chart calculation cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      this.logger.error("Error getting chart from cache:", error);
      return null;
    }
  }

  /**
   * Guarda cálculo de carta en caché
   */
  async setChartCalculation(cacheKey: string, chartData: ChartData): Promise<void> {
    try {
      const cached: CachedChartData = {
        chartData,
        calculatedAt: new Date(),
        cacheKey,
      };

      await this.cacheManager.set(`chart:${cacheKey}`, cached, this.CHART_CALCULATION_TTL);

      this.logger.debug(`Chart calculation cached: ${cacheKey}`);
    } catch (error) {
      this.logger.error("Error caching chart calculation:", error);
    }
  }

  /**
   * Obtiene síntesis de IA desde caché
   */
  async getSynthesis(chartCacheKey: string): Promise<CachedSynthesis | null> {
    try {
      const key = this.generateSynthesisCacheKey(chartCacheKey);
      const cached = await this.cacheManager.get<CachedSynthesis>(key);

      if (cached) {
        this.logger.debug(`Synthesis cache HIT: ${chartCacheKey}`);
        return cached;
      }

      this.logger.debug(`Synthesis cache MISS: ${chartCacheKey}`);
      return null;
    } catch (error) {
      this.logger.error("Error getting synthesis from cache:", error);
      return null;
    }
  }

  /**
   * Guarda síntesis de IA en caché
   */
  async setSynthesis(chartCacheKey: string, synthesis: string, provider: string, model: string): Promise<void> {
    try {
      const key = this.generateSynthesisCacheKey(chartCacheKey);
      const cached: CachedSynthesis = {
        synthesis,
        generatedAt: new Date(),
        provider,
        model,
      };

      await this.cacheManager.set(key, cached, this.SYNTHESIS_TTL);

      this.logger.debug(`Synthesis cached: ${chartCacheKey}`);
    } catch (error) {
      this.logger.error("Error caching synthesis:", error);
    }
  }

  /**
   * Obtiene interpretación completa desde caché
   */
  async getInterpretation(chartCacheKey: string): Promise<FullChartInterpretation | null> {
    try {
      const key = this.generateInterpretationCacheKey(chartCacheKey);
      const cached = await this.cacheManager.get<FullChartInterpretation>(key);

      if (cached) {
        this.logger.debug(`Interpretation cache HIT: ${chartCacheKey}`);
        return cached;
      }

      this.logger.debug(`Interpretation cache MISS: ${chartCacheKey}`);
      return null;
    } catch (error) {
      this.logger.error("Error getting interpretation from cache:", error);
      return null;
    }
  }

  /**
   * Guarda interpretación completa en caché
   */
  async setInterpretation(chartCacheKey: string, interpretation: FullChartInterpretation): Promise<void> {
    try {
      const key = this.generateInterpretationCacheKey(chartCacheKey);
      await this.cacheManager.set(key, interpretation, this.INTERPRETATION_TTL);

      this.logger.debug(`Interpretation cached: ${chartCacheKey}`);
    } catch (error) {
      this.logger.error("Error caching interpretation:", error);
    }
  }

  /**
   * Invalida todo el caché relacionado a una carta
   */
  async invalidateChart(chartCacheKey: string): Promise<void> {
    try {
      await Promise.all([
        this.cacheManager.del(`chart:${chartCacheKey}`),
        this.cacheManager.del(this.generateSynthesisCacheKey(chartCacheKey)),
        this.cacheManager.del(this.generateInterpretationCacheKey(chartCacheKey)),
      ]);

      this.logger.log(`Cache invalidated for chart: ${chartCacheKey}`);
    } catch (error) {
      this.logger.error("Error invalidating chart cache:", error);
    }
  }

  /**
   * Obtiene estadísticas de caché (para admin/debug)
   */
  async getCacheStats(): Promise<{
    chartCalculations: number;
    syntheses: number;
    interpretations: number;
  }> {
    // Nota: La implementación real depende del backend de caché (Redis, Memory)
    // Esta es una implementación placeholder
    return {
      chartCalculations: 0,
      syntheses: 0,
      interpretations: 0,
    };
  }
}
```

**Criterios de aceptación:**

- [ ] Integración con CACHE_MANAGER existente
- [ ] Caché de cálculos de carta (24h TTL)
- [ ] Caché de síntesis de IA (7 días TTL)
- [ ] Caché de interpretaciones (30 días TTL)
- [ ] Generación de claves de caché únicas
- [ ] Invalidación selectiva de caché
- [ ] Logging de hits/misses
- [ ] Manejo de errores sin romper el flujo
- [ ] Tests unitarios con mock de cache manager

**Dependencias:** Sistema de caché existente

**Estimación:** 3 horas

---

### T-CA-015: Crear Servicio de Generación de PDF

**Historia relacionada:** HU-CA-007

**Descripción:**
Crear el servicio que genera el PDF descargable de la carta astral, incluyendo portada, gráfico SVG, tablas de posiciones, interpretaciones y síntesis (si aplica).

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── services/
        ├── index.ts
        └── chart-pdf.service.ts
```

**Implementación:**

```typescript
// chart-pdf.service.ts
import { Injectable, Logger } from "@nestjs/common";
import * as PDFDocument from "pdfkit";
import { ChartData } from "../../infrastructure/entities/birth-chart.entity";
import { FullChartInterpretation, BigThreeInterpretation } from "./chart-interpretation.service";
import { PlanetMetadata, ZodiacSignMetadata, AspectMetadata, Planet, ZodiacSign, AspectType } from "../../domain/enums";

export interface PDFGenerationInput {
  chartData: ChartData;
  interpretation: FullChartInterpretation;
  aiSynthesis?: string;
  userName: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  generatedAt: Date;
  isPremium: boolean;
}

export interface PDFGenerationResult {
  buffer: Buffer;
  filename: string;
  pageCount: number;
}

@Injectable()
export class ChartPdfService {
  private readonly logger = new Logger(ChartPdfService.name);

  // Configuración de estilos
  private readonly COLORS = {
    primary: "#2D1B4E", // Morado oscuro
    secondary: "#8B5CF6", // Violeta
    accent: "#F59E0B", // Dorado
    text: "#1F2937", // Gris oscuro
    muted: "#6B7280", // Gris
    background: "#FAFAFA", // Gris claro
  };

  private readonly FONTS = {
    title: "Helvetica-Bold",
    heading: "Helvetica-Bold",
    body: "Helvetica",
    symbol: "Helvetica",
  };

  /**
   * Genera el PDF completo de la carta astral
   */
  async generatePDF(input: PDFGenerationInput): Promise<PDFGenerationResult> {
    this.logger.log(`Generating PDF for ${input.userName}`);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Carta Astral - ${input.userName}`,
            Author: "Auguria",
            Subject: "Carta Astral Natal",
            Creator: "Auguria - Plataforma de Servicios Místicos",
          },
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const filename = this.generateFilename(input.userName, input.birthDate);

          resolve({
            buffer,
            filename,
            pageCount: doc.bufferedPageRange().count,
          });
        });
        doc.on("error", reject);

        // === PÁGINA 1: PORTADA ===
        this.renderCoverPage(doc, input);

        // === PÁGINA 2: GRÁFICO Y TABLAS ===
        doc.addPage();
        this.renderChartPage(doc, input);

        // === PÁGINA 3+: BIG THREE ===
        doc.addPage();
        this.renderBigThreePage(doc, input.interpretation.bigThree);

        // === PÁGINAS DE PLANETAS (Free y Premium) ===
        for (const planet of input.interpretation.planets) {
          doc.addPage();
          this.renderPlanetPage(doc, planet);
        }

        // === PÁGINA DE SÍNTESIS IA (Solo Premium) ===
        if (input.isPremium && input.aiSynthesis) {
          doc.addPage();
          this.renderSynthesisPage(doc, input.aiSynthesis);
        }

        // === PÁGINA FINAL: DISCLAIMER ===
        doc.addPage();
        this.renderDisclaimerPage(doc);

        doc.end();
      } catch (error) {
        this.logger.error("Error generating PDF:", error);
        reject(error);
      }
    });
  }

  /**
   * Renderiza la página de portada
   */
  private renderCoverPage(doc: PDFKit.PDFDocument, input: PDFGenerationInput): void {
    const { userName, birthDate, birthTime, birthPlace, generatedAt } = input;
    const { bigThree } = input.interpretation;

    // Fondo decorativo
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(this.COLORS.background);

    // Logo/Título
    doc
      .fontSize(36)
      .font(this.FONTS.title)
      .fillColor(this.COLORS.primary)
      .text("CARTA ASTRAL", 50, 150, { align: "center" });

    // Nombre
    doc.fontSize(28).fillColor(this.COLORS.secondary).text(userName.toUpperCase(), 50, 220, { align: "center" });

    // Datos de nacimiento
    doc.fontSize(14).font(this.FONTS.body).fillColor(this.COLORS.text);

    const birthDateStr = birthDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.text(`Nacimiento: ${birthDateStr}`, 50, 320, { align: "center" });
    doc.text(`Hora: ${birthTime}`, 50, 340, { align: "center" });
    doc.text(`Lugar: ${birthPlace}`, 50, 360, { align: "center" });

    // Big Three destacado
    doc.moveDown(3);
    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text("TU BIG THREE", 50, 440, { align: "center" });

    doc.fontSize(14).font(this.FONTS.body).fillColor(this.COLORS.text);

    const sunName = ZodiacSignMetadata[bigThree.sun.sign]?.name || bigThree.sun.sign;
    const moonName = ZodiacSignMetadata[bigThree.moon.sign]?.name || bigThree.moon.sign;
    const ascName = ZodiacSignMetadata[bigThree.ascendant.sign]?.name || bigThree.ascendant.sign;

    doc.text(`☉ Sol en ${sunName}`, 50, 480, { align: "center" });
    doc.text(`☽ Luna en ${moonName}`, 50, 500, { align: "center" });
    doc.text(`↑ Ascendente en ${ascName}`, 50, 520, { align: "center" });

    // Footer
    doc
      .fontSize(10)
      .fillColor(this.COLORS.muted)
      .text(`Generado por Auguria el ${generatedAt.toLocaleDateString("es-ES")}`, 50, doc.page.height - 80, {
        align: "center",
      });
  }

  /**
   * Renderiza la página con gráfico y tablas
   */
  private renderChartPage(doc: PDFKit.PDFDocument, input: PDFGenerationInput): void {
    // Título
    doc.fontSize(18).font(this.FONTS.heading).fillColor(this.COLORS.primary).text("POSICIONES PLANETARIAS", 50, 50);

    // Tabla de planetas
    const tableTop = 90;
    const tableHeaders = ["Planeta", "Signo", "Grado", "Casa", "R"];
    const colWidths = [100, 100, 80, 60, 40];

    // Headers
    doc.fontSize(10).font(this.FONTS.heading).fillColor(this.COLORS.text);

    let xPos = 50;
    for (let i = 0; i < tableHeaders.length; i++) {
      doc.text(tableHeaders[i], xPos, tableTop, { width: colWidths[i] });
      xPos += colWidths[i];
    }

    // Línea separadora
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(50 + colWidths.reduce((a, b) => a + b, 0), tableTop + 15)
      .stroke(this.COLORS.muted);

    // Filas de planetas
    doc.font(this.FONTS.body);
    let yPos = tableTop + 25;

    for (const planet of input.chartData.planets) {
      const planetName = PlanetMetadata[planet.planet as Planet]?.name || planet.planet;
      const signName = ZodiacSignMetadata[planet.sign as ZodiacSign]?.name || planet.sign;
      const degree = `${Math.floor(planet.signDegree)}° ${Math.round((planet.signDegree % 1) * 60)}'`;

      xPos = 50;
      doc.text(planetName, xPos, yPos, { width: colWidths[0] });
      xPos += colWidths[0];
      doc.text(signName, xPos, yPos, { width: colWidths[1] });
      xPos += colWidths[1];
      doc.text(degree, xPos, yPos, { width: colWidths[2] });
      xPos += colWidths[2];
      doc.text(planet.house.toString(), xPos, yPos, { width: colWidths[3] });
      xPos += colWidths[3];
      doc.text(planet.isRetrograde ? "℞" : "", xPos, yPos, { width: colWidths[4] });

      yPos += 20;
    }

    // Distribución
    yPos += 30;
    doc.fontSize(14).font(this.FONTS.heading).text("DISTRIBUCIÓN", 50, yPos);

    yPos += 25;
    doc.fontSize(10).font(this.FONTS.body);

    const { elements, modalities } = input.interpretation.distribution;

    // Elementos
    doc.text("Elementos:", 50, yPos);
    yPos += 15;
    for (const el of elements) {
      doc.text(`  ${el.name}: ${el.count} (${el.percentage}%)`, 50, yPos);
      yPos += 12;
    }

    yPos += 10;
    // Modalidades
    doc.text("Modalidades:", 50, yPos);
    yPos += 15;
    for (const mod of modalities) {
      doc.text(`  ${mod.name}: ${mod.count} (${mod.percentage}%)`, 50, yPos);
      yPos += 12;
    }
  }

  /**
   * Renderiza la página del Big Three
   */
  private renderBigThreePage(doc: PDFKit.PDFDocument, bigThree: BigThreeInterpretation): void {
    doc.fontSize(20).font(this.FONTS.heading).fillColor(this.COLORS.primary).text("TU BIG THREE", 50, 50);

    let yPos = 100;

    // Sol
    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.secondary)
      .text(`☉ SOL EN ${bigThree.sun.signName.toUpperCase()}`, 50, yPos);

    yPos += 25;
    doc
      .fontSize(11)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.text)
      .text(bigThree.sun.interpretation, 50, yPos, {
        width: doc.page.width - 100,
        align: "justify",
      });

    yPos = doc.y + 30;

    // Luna
    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.secondary)
      .text(`☽ LUNA EN ${bigThree.moon.signName.toUpperCase()}`, 50, yPos);

    yPos += 25;
    doc
      .fontSize(11)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.text)
      .text(bigThree.moon.interpretation, 50, yPos, {
        width: doc.page.width - 100,
        align: "justify",
      });

    yPos = doc.y + 30;

    // Ascendente
    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.secondary)
      .text(`↑ ASCENDENTE EN ${bigThree.ascendant.signName.toUpperCase()}`, 50, yPos);

    yPos += 25;
    doc
      .fontSize(11)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.text)
      .text(bigThree.ascendant.interpretation, 50, yPos, {
        width: doc.page.width - 100,
        align: "justify",
      });
  }

  /**
   * Renderiza una página de planeta individual
   */
  private renderPlanetPage(doc: PDFKit.PDFDocument, planet: FullChartInterpretation["planets"][0]): void {
    // Título del planeta
    doc
      .fontSize(20)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text(`${planet.planetSymbol} ${planet.planetName.toUpperCase()}`, 50, 50);

    doc
      .fontSize(14)
      .fillColor(this.COLORS.secondary)
      .text(`En ${planet.signName} - Casa ${planet.house}${planet.isRetrograde ? " (Retrógrado)" : ""}`, 50, 80);

    let yPos = 120;

    // Intro del planeta
    if (planet.intro) {
      doc
        .fontSize(11)
        .font(this.FONTS.body)
        .fillColor(this.COLORS.text)
        .text(planet.intro, 50, yPos, {
          width: doc.page.width - 100,
          align: "justify",
        });
      yPos = doc.y + 20;
    }

    // Planeta en signo
    if (planet.inSign) {
      doc
        .fontSize(12)
        .font(this.FONTS.heading)
        .fillColor(this.COLORS.secondary)
        .text(`En ${planet.signName}`, 50, yPos);

      yPos += 18;
      doc
        .fontSize(11)
        .font(this.FONTS.body)
        .fillColor(this.COLORS.text)
        .text(planet.inSign, 50, yPos, {
          width: doc.page.width - 100,
          align: "justify",
        });
      yPos = doc.y + 20;
    }

    // Planeta en casa
    if (planet.inHouse) {
      doc
        .fontSize(12)
        .font(this.FONTS.heading)
        .fillColor(this.COLORS.secondary)
        .text(`En Casa ${planet.house}`, 50, yPos);

      yPos += 18;
      doc
        .fontSize(11)
        .font(this.FONTS.body)
        .fillColor(this.COLORS.text)
        .text(planet.inHouse, 50, yPos, {
          width: doc.page.width - 100,
          align: "justify",
        });
    }
  }

  /**
   * Renderiza la página de síntesis IA (Premium)
   */
  private renderSynthesisPage(doc: PDFKit.PDFDocument, synthesis: string): void {
    doc.fontSize(20).font(this.FONTS.heading).fillColor(this.COLORS.primary).text("SÍNTESIS PERSONALIZADA", 50, 50);

    doc.fontSize(10).fillColor(this.COLORS.accent).text("✨ Contenido exclusivo Premium generado con IA", 50, 80);

    doc
      .fontSize(11)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.text)
      .text(synthesis, 50, 110, {
        width: doc.page.width - 100,
        align: "justify",
        lineGap: 4,
      });
  }

  /**
   * Renderiza la página de disclaimer
   */
  private renderDisclaimerPage(doc: PDFKit.PDFDocument): void {
    doc.fontSize(14).font(this.FONTS.heading).fillColor(this.COLORS.primary).text("AVISO IMPORTANTE", 50, 50);

    doc
      .fontSize(10)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.muted)
      .text(
        `Esta carta astral ha sido generada con fines de entretenimiento y autoconocimiento. 
         
La astrología es una herramienta simbólica y no debe utilizarse como sustituto de asesoramiento profesional en áreas de salud, finanzas, relaciones o decisiones importantes de vida.

Los cálculos astronómicos se basan en algoritmos precisos, pero las interpretaciones son de carácter general y pueden no aplicar a todas las situaciones individuales.

Cada persona es única y tiene libre albedrío para tomar sus propias decisiones independientemente de las configuraciones astrológicas.`,
        50,
        80,
        {
          width: doc.page.width - 100,
          align: "justify",
          lineGap: 3,
        },
      );

    // Footer con marca
    doc
      .fontSize(12)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.secondary)
      .text("AUGURIA", 50, doc.page.height - 150, { align: "center" });

    doc
      .fontSize(10)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.muted)
      .text("Plataforma de Servicios Místicos", 50, doc.page.height - 130, { align: "center" });

    doc.text("www.auguria.com", 50, doc.page.height - 110, { align: "center" });
  }

  /**
   * Genera el nombre del archivo PDF
   */
  private generateFilename(userName: string, birthDate: Date): string {
    const safeName = userName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 30);

    const dateStr = birthDate.toISOString().split("T")[0];

    return `carta-astral-${safeName}-${dateStr}.pdf`;
  }
}
```

**Criterios de aceptación:**

- [ ] Generación de PDF con PDFKit
- [ ] Portada con datos de nacimiento y Big Three
- [ ] Página de posiciones planetarias con tabla
- [ ] Página de distribución de elementos/modalidades
- [ ] Páginas individuales por planeta (Free/Premium)
- [ ] Página de síntesis IA (solo Premium)
- [ ] Página de disclaimer legal
- [ ] Estilos consistentes con branding Auguria
- [ ] Nombre de archivo sanitizado
- [ ] Tests unitarios de generación
- [ ] Tests de integración con datos reales

**Dependencias:** T-CA-012, T-CA-013

**Estimación:** 5 horas

---

## CHECKLIST DE PARTE 7D

- [ ] T-CA-011: Repositorio de interpretaciones creado
- [ ] T-CA-012: Servicio de interpretación de carta funcionando
- [ ] T-CA-013: Servicio de síntesis con IA integrado
- [ ] T-CA-014: Sistema de caché integrado
- [ ] T-CA-015: Generación de PDF funcionando

---

## DIAGRAMA DE DEPENDENCIAS

```
T-CA-011 (Interpretation Repository)
    │
    ▼
T-CA-012 (Chart Interpretation Service)
    │
    ├──────────────────────┐
    ▼                      ▼
T-CA-013 (AI Synthesis)   T-CA-014 (Cache Service)
    │                      │
    └──────────┬───────────┘
               ▼
         T-CA-015 (PDF Generation)
```

---

## PRÓXIMOS PASOS

**Siguiente parte:** PARTE-7E - Tareas de Backend: Controladores y DTOs

---

**FIN DE PARTE 7D - TAREAS DE INTERPRETACIÓN Y CACHÉ**

# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7E: TAREAS DE BACKEND - CONTROLADORES Y DTOs

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.0  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## RESUMEN DE PARTE 7E

Esta parte cubre la creación de DTOs de request/response, controladores REST y la integración de todos los servicios en endpoints funcionales.

| Tarea    | Título                                      | Tipo    | Prioridad | Estimación |
| -------- | ------------------------------------------- | ------- | --------- | ---------- |
| T-CA-016 | Crear DTOs de request                       | Backend | Must      | 2h         |
| T-CA-017 | Crear DTOs de response                      | Backend | Must      | 2h         |
| T-CA-018 | Crear controlador principal de carta astral | Backend | Must      | 4h         |
| T-CA-019 | Crear controlador de historial (Premium)    | Backend | Must      | 3h         |
| T-CA-020 | Crear módulo BirthChart completo            | Backend | Must      | 2h         |

**Total estimado:** 13 horas

---

## DETALLE DE TAREAS

### T-CA-016: Crear DTOs de Request

**Historia relacionada:** HU-CA-001, HU-CA-012

**Descripción:**
Crear los DTOs (Data Transfer Objects) para validar y tipar las solicitudes entrantes al módulo de carta astral.

**Ubicación:** `src/modules/birth-chart/application/dto/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── dto/
        ├── index.ts
        ├── create-birth-chart.dto.ts
        ├── generate-chart.dto.ts
        └── geocode-place.dto.ts
```

**Implementación:**

```typescript
// generate-chart.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Matches,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from "class-validator";
import { Transform } from "class-transformer";
import { SanitizeHtml } from "../../../common/decorators/sanitize.decorator";

/**
 * DTO para generar una carta astral (sin guardar)
 * Usado por: Anónimos, Free y Premium
 */
export class GenerateChartDto {
  @ApiProperty({
    example: "María García",
    description: "Nombre de la persona (para mostrar en la carta)",
  })
  @IsString()
  @IsNotEmpty({ message: "El nombre es requerido" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  @SanitizeHtml()
  name: string;

  @ApiProperty({
    example: "1990-05-15",
    description: "Fecha de nacimiento (formato ISO: YYYY-MM-DD)",
  })
  @IsDateString({}, { message: "Fecha de nacimiento inválida. Use formato YYYY-MM-DD" })
  birthDate: string;

  @ApiProperty({
    example: "14:30",
    description: "Hora de nacimiento (formato 24h: HH:mm)",
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Hora de nacimiento inválida. Use formato HH:mm (ej: 14:30)",
  })
  birthTime: string;

  @ApiProperty({
    example: "Buenos Aires, Argentina",
    description: "Lugar de nacimiento (ciudad, país)",
  })
  @IsString()
  @IsNotEmpty({ message: "El lugar de nacimiento es requerido" })
  @MaxLength(255, { message: "El lugar no puede exceder 255 caracteres" })
  @SanitizeHtml()
  birthPlace: string;

  @ApiProperty({
    example: -34.6037,
    description: "Latitud del lugar de nacimiento (-90 a 90)",
  })
  @IsNumber({}, { message: "La latitud debe ser un número" })
  @Min(-90, { message: "La latitud debe ser mayor o igual a -90" })
  @Max(90, { message: "La latitud debe ser menor o igual a 90" })
  @Transform(({ value }) => parseFloat(value))
  latitude: number;

  @ApiProperty({
    example: -58.3816,
    description: "Longitud del lugar de nacimiento (-180 a 180)",
  })
  @IsNumber({}, { message: "La longitud debe ser un número" })
  @Min(-180, { message: "La longitud debe ser mayor o igual a -180" })
  @Max(180, { message: "La longitud debe ser menor o igual a 180" })
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @ApiProperty({
    example: "America/Argentina/Buenos_Aires",
    description: "Zona horaria IANA del lugar de nacimiento",
  })
  @IsString()
  @IsNotEmpty({ message: "La zona horaria es requerida" })
  @MaxLength(100)
  timezone: string;
}

/**
 * DTO para crear/guardar una carta astral (solo Premium)
 * Extiende GenerateChartDto con campos adicionales
 */
export class CreateBirthChartDto extends GenerateChartDto {
  @ApiPropertyOptional({
    example: "Mi carta natal",
    description: "Nombre personalizado para identificar la carta (opcional)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @SanitizeHtml()
  chartName?: string;
}
```

```typescript
// geocode-place.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { SanitizeHtml } from "../../../common/decorators/sanitize.decorator";

/**
 * DTO para geocodificar un lugar de nacimiento
 */
export class GeocodePlaceDto {
  @ApiProperty({
    example: "Buenos Aires, Argentina",
    description: "Texto de búsqueda del lugar",
  })
  @IsString()
  @IsNotEmpty({ message: "El texto de búsqueda es requerido" })
  @MinLength(3, { message: "Ingrese al menos 3 caracteres" })
  @MaxLength(255)
  @SanitizeHtml()
  query: string;
}

/**
 * DTO para seleccionar un lugar de los resultados de geocoding
 */
export class SelectPlaceDto {
  @ApiProperty({
    example: "ChIJZ4a1ZWzKvJUR9BPHX7NLzzs",
    description: "ID del lugar (de Google Places u otro provider)",
  })
  @IsString()
  @IsNotEmpty()
  placeId: string;
}
```

```typescript
// index.ts
export * from "./generate-chart.dto";
export * from "./geocode-place.dto";
```

**Criterios de aceptación:**

- [ ] DTO GenerateChartDto con todas las validaciones
- [ ] DTO CreateBirthChartDto extendiendo GenerateChartDto
- [ ] DTO GeocodePlaceDto para búsqueda de lugares
- [ ] Validación de formato de fecha (ISO)
- [ ] Validación de formato de hora (HH:mm)
- [ ] Validación de rangos de latitud/longitud
- [ ] Sanitización de inputs de texto
- [ ] Decoradores Swagger completos
- [ ] Mensajes de error en español
- [ ] Tests unitarios de validación

**Dependencias:** Ninguna

**Estimación:** 2 horas

---

### T-CA-017: Crear DTOs de Response

**Historia relacionada:** HU-CA-001, HU-CA-004, HU-CA-005, HU-CA-006

**Descripción:**
Crear los DTOs para estructurar y documentar las respuestas del API, diferenciando por plan de usuario.

**Ubicación:** `src/modules/birth-chart/application/dto/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── application/
    └── dto/
        ├── index.ts
        ├── chart-response.dto.ts
        ├── interpretation-response.dto.ts
        └── geocode-response.dto.ts
```

**Implementación:**

```typescript
// chart-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ZodiacSign, Planet, AspectType } from "../../domain/enums";

/**
 * Posición de un planeta en la respuesta
 */
export class PlanetPositionDto {
  @ApiProperty({ example: "sun", enum: Planet })
  planet: string;

  @ApiProperty({ example: "leo", enum: ZodiacSign })
  sign: string;

  @ApiProperty({ example: "Leo" })
  signName: string;

  @ApiProperty({ example: 15.5, description: "Grado dentro del signo (0-30)" })
  signDegree: number;

  @ApiProperty({ example: "15° 30' Leo" })
  formattedPosition: string;

  @ApiProperty({ example: 5 })
  house: number;

  @ApiProperty({ example: false })
  isRetrograde: boolean;
}

/**
 * Cúspide de casa en la respuesta
 */
export class HouseCuspDto {
  @ApiProperty({ example: 1 })
  house: number;

  @ApiProperty({ example: "virgo", enum: ZodiacSign })
  sign: string;

  @ApiProperty({ example: "Virgo" })
  signName: string;

  @ApiProperty({ example: 12.25 })
  signDegree: number;

  @ApiProperty({ example: "12° 15' Virgo" })
  formattedPosition: string;
}

/**
 * Aspecto entre planetas en la respuesta
 */
export class ChartAspectDto {
  @ApiProperty({ example: "sun" })
  planet1: string;

  @ApiProperty({ example: "Sol" })
  planet1Name: string;

  @ApiProperty({ example: "moon" })
  planet2: string;

  @ApiProperty({ example: "Luna" })
  planet2Name: string;

  @ApiProperty({ example: "trine", enum: AspectType })
  aspectType: string;

  @ApiProperty({ example: "Trígono" })
  aspectName: string;

  @ApiProperty({ example: "△" })
  aspectSymbol: string;

  @ApiProperty({ example: 2.5, description: "Orbe en grados" })
  orb: number;

  @ApiProperty({ example: true })
  isApplying: boolean;
}

/**
 * Distribución de elementos/modalidades
 */
export class ChartDistributionDto {
  @ApiProperty({
    example: [
      { name: "Fuego", count: 3, percentage: 27 },
      { name: "Tierra", count: 4, percentage: 36 },
    ],
  })
  elements: Array<{ name: string; count: number; percentage: number }>;

  @ApiProperty({
    example: [{ name: "Cardinal", count: 4, percentage: 36 }],
  })
  modalities: Array<{ name: string; count: number; percentage: number }>;
}

/**
 * Respuesta básica de carta (para Anónimos)
 * Solo incluye: gráfico, tablas y Big Three
 */
export class BasicChartResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: "Datos para renderizar el gráfico SVG" })
  chartSvgData: {
    planets: PlanetPositionDto[];
    houses: HouseCuspDto[];
    aspects: ChartAspectDto[];
  };

  @ApiProperty({ type: [PlanetPositionDto] })
  planets: PlanetPositionDto[];

  @ApiProperty({ type: [HouseCuspDto] })
  houses: HouseCuspDto[];

  @ApiProperty({ type: [ChartAspectDto] })
  aspects: ChartAspectDto[];

  @ApiProperty({ description: "Interpretación del Big Three" })
  bigThree: {
    sun: { sign: string; signName: string; interpretation: string };
    moon: { sign: string; signName: string; interpretation: string };
    ascendant: { sign: string; signName: string; interpretation: string };
  };

  @ApiProperty({ example: 125, description: "Tiempo de cálculo en ms" })
  calculationTimeMs: number;
}

/**
 * Respuesta completa de carta (para Free)
 * Incluye todo lo básico + interpretaciones completas
 */
export class FullChartResponseDto extends BasicChartResponseDto {
  @ApiProperty({ type: ChartDistributionDto })
  distribution: ChartDistributionDto;

  @ApiProperty({ description: "Interpretaciones completas por planeta" })
  interpretations: {
    planets: Array<{
      planet: string;
      planetName: string;
      intro?: string;
      inSign?: string;
      inHouse?: string;
      aspects?: Array<{
        aspectName: string;
        withPlanet: string;
        interpretation?: string;
      }>;
    }>;
  };

  @ApiProperty({ example: true })
  canDownloadPdf: boolean;
}

/**
 * Respuesta Premium de carta
 * Incluye todo lo completo + síntesis IA + guardado
 */
export class PremiumChartResponseDto extends FullChartResponseDto {
  @ApiPropertyOptional({ example: 1, description: "ID de la carta guardada" })
  savedChartId?: number;

  @ApiProperty({ description: "Síntesis personalizada generada por IA" })
  aiSynthesis: {
    content: string;
    generatedAt: string;
    provider: string;
  };

  @ApiProperty({ example: true })
  canAccessHistory: boolean;
}

/**
 * Respuesta de carta guardada (para historial)
 */
export class SavedChartSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Mi carta natal" })
  name: string;

  @ApiProperty({ example: "1990-05-15" })
  birthDate: string;

  @ApiProperty({ example: "Leo" })
  sunSign: string;

  @ApiProperty({ example: "Escorpio" })
  moonSign: string;

  @ApiProperty({ example: "Virgo" })
  ascendantSign: string;

  @ApiProperty({ example: "2026-02-06T12:00:00Z" })
  createdAt: string;
}

/**
 * Respuesta de lista de cartas guardadas
 */
export class ChartHistoryResponseDto {
  @ApiProperty({ type: [SavedChartSummaryDto] })
  charts: SavedChartSummaryDto[];

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
```

```typescript
// interpretation-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";

/**
 * Respuesta de interpretación individual
 */
export class InterpretationDto {
  @ApiProperty({ example: "planet_in_sign" })
  category: string;

  @ApiProperty({ example: "sun" })
  planet?: string;

  @ApiProperty({ example: "leo" })
  sign?: string;

  @ApiProperty({ example: 5 })
  house?: number;

  @ApiProperty({ example: "El Sol en Leo representa..." })
  content: string;

  @ApiProperty({ example: "Personalidad carismática y creativa" })
  summary?: string;
}
```

```typescript
// geocode-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";

/**
 * Resultado de geocoding de un lugar
 */
export class GeocodedPlaceDto {
  @ApiProperty({ example: "ChIJZ4a1ZWzKvJUR9BPHX7NLzzs" })
  placeId: string;

  @ApiProperty({ example: "Buenos Aires, Argentina" })
  displayName: string;

  @ApiProperty({ example: "Buenos Aires" })
  city: string;

  @ApiProperty({ example: "Argentina" })
  country: string;

  @ApiProperty({ example: -34.6037 })
  latitude: number;

  @ApiProperty({ example: -58.3816 })
  longitude: number;

  @ApiProperty({ example: "America/Argentina/Buenos_Aires" })
  timezone: string;
}

/**
 * Respuesta de búsqueda de lugares
 */
export class GeocodeSearchResponseDto {
  @ApiProperty({ type: [GeocodedPlaceDto] })
  results: GeocodedPlaceDto[];

  @ApiProperty({ example: 5 })
  count: number;
}
```

**Criterios de aceptación:**

- [ ] DTOs para respuesta básica (Anónimos)
- [ ] DTOs para respuesta completa (Free)
- [ ] DTOs para respuesta Premium (con síntesis IA)
- [ ] DTOs para historial de cartas
- [ ] DTOs para geocoding
- [ ] Herencia correcta entre niveles de respuesta
- [ ] Decoradores Swagger completos con ejemplos
- [ ] Documentación clara de qué incluye cada nivel
- [ ] Tests unitarios de serialización

**Dependencias:** T-CA-016

**Estimación:** 2 horas

---

### T-CA-018: Crear Controlador Principal de Carta Astral

**Historia relacionada:** HU-CA-001, HU-CA-004, HU-CA-005, HU-CA-006, HU-CA-007, HU-CA-010, HU-CA-012

**Descripción:**
Crear el controlador principal que expone los endpoints para generar cartas astrales, obtener interpretaciones y descargar PDFs, manejando la diferenciación por plan de usuario.

**Ubicación:** `src/modules/birth-chart/infrastructure/controllers/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── infrastructure/
    └── controllers/
        ├── index.ts
        └── birth-chart.controller.ts
```

**Implementación:**

```typescript
// birth-chart.controller.ts
import { Controller, Post, Get, Body, Query, Res, UseGuards, HttpStatus, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Response } from "express";
import { Throttle } from "@nestjs/throttler";

// Guards
import { OptionalJwtAuthGuard } from "../../../auth/guards/optional-jwt-auth.guard";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { PremiumGuard } from "../../../auth/guards/premium.guard";
import { CheckUsageLimitGuard } from "../../../usage-limits/guards/check-usage-limit.guard";

// Decorators
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { UsageType } from "../../../usage-limits/decorators/usage-type.decorator";
import { Fingerprint } from "../../../common/decorators/fingerprint.decorator";

// DTOs
import {
  GenerateChartDto,
  BasicChartResponseDto,
  FullChartResponseDto,
  PremiumChartResponseDto,
  GeocodePlaceDto,
  GeocodeSearchResponseDto,
} from "../../application/dto";

// Services
import { BirthChartFacadeService } from "../../application/services/birth-chart-facade.service";
import { GeocodeService } from "../../application/services/geocode.service";

// Types
import { User } from "../../../users/entities/user.entity";
import { UserPlan } from "../../../users/enums/user-plan.enum";

@ApiTags("Birth Chart")
@Controller("birth-chart")
export class BirthChartController {
  private readonly logger = new Logger(BirthChartController.name);

  constructor(
    private readonly birthChartFacade: BirthChartFacadeService,
    private readonly geocodeService: GeocodeService,
  ) {}

  // ===========================================================================
  // GENERACIÓN DE CARTA
  // ===========================================================================

  /**
   * POST /birth-chart/generate
   * Genera una carta astral sin guardarla
   * Disponible para: Anónimos (1 lifetime), Free (3/mes), Premium (5/mes)
   */
  @Post("generate")
  @UseGuards(OptionalJwtAuthGuard, CheckUsageLimitGuard)
  @UsageType("BIRTH_CHART")
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests/minuto
  @ApiOperation({
    summary: "Generar carta astral",
    description: `Genera una carta astral basada en los datos de nacimiento proporcionados.
    
**Por plan:**
- **Anónimo:** Recibe gráfico + tablas + Big Three interpretado. Límite: 1 lifetime.
- **Free:** Recibe informe completo con todas las interpretaciones. Límite: 3/mes.
- **Premium:** Recibe informe completo + síntesis IA personalizada. Límite: 5/mes.`,
  })
  @ApiResponse({
    status: 200,
    description: "Carta generada exitosamente",
    type: PremiumChartResponseDto, // Mostramos el más completo en docs
  })
  @ApiResponse({ status: 400, description: "Datos de entrada inválidos" })
  @ApiResponse({ status: 429, description: "Límite de uso alcanzado" })
  async generateChart(
    @Body() dto: GenerateChartDto,
    @CurrentUser() user: User | null,
    @Fingerprint() fingerprint: string,
  ): Promise<BasicChartResponseDto | FullChartResponseDto | PremiumChartResponseDto> {
    this.logger.log(`Generating chart for ${user?.email || "anonymous"} (${fingerprint})`);

    // Determinar plan del usuario
    const plan = user?.plan || UserPlan.ANONYMOUS;

    // Generar carta según plan
    const result = await this.birthChartFacade.generateChart(dto, plan, user?.id);

    // Registrar uso (el guard ya validó, ahora incrementamos)
    // Nota: Esto se maneja en el servicio o mediante eventos

    return result;
  }

  /**
   * POST /birth-chart/generate/anonymous
   * Endpoint específico para usuarios anónimos (con fingerprint)
   */
  @Post("generate/anonymous")
  @UseGuards(CheckUsageLimitGuard)
  @UsageType("BIRTH_CHART_ANONYMOUS")
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/minuto
  @ApiOperation({
    summary: "Generar carta astral (anónimo)",
    description: "Genera una carta astral básica para usuarios no registrados. Límite: 1 carta lifetime.",
  })
  @ApiResponse({ status: 200, type: BasicChartResponseDto })
  @ApiResponse({ status: 429, description: "Ya utilizaste tu carta gratuita" })
  async generateChartAnonymous(
    @Body() dto: GenerateChartDto,
    @Fingerprint() fingerprint: string,
  ): Promise<BasicChartResponseDto> {
    this.logger.log(`Generating anonymous chart for fingerprint: ${fingerprint}`);

    return this.birthChartFacade.generateChart(dto, UserPlan.ANONYMOUS, null, fingerprint);
  }

  // ===========================================================================
  // DESCARGA DE PDF
  // ===========================================================================

  /**
   * POST /birth-chart/pdf
   * Genera y descarga el PDF de una carta
   * Disponible para: Free y Premium
   */
  @Post("pdf")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 PDFs/minuto
  @ApiOperation({
    summary: "Descargar carta en PDF",
    description: `Genera un PDF de la carta astral para descargar.
    
**Por plan:**
- **Free:** PDF con interpretaciones estáticas (no incluye síntesis IA)
- **Premium:** PDF completo con síntesis IA personalizada`,
  })
  @ApiResponse({ status: 200, description: "PDF generado", content: { "application/pdf": {} } })
  @ApiResponse({ status: 401, description: "No autenticado" })
  async downloadPdf(@Body() dto: GenerateChartDto, @CurrentUser() user: User, @Res() res: Response): Promise<void> {
    this.logger.log(`Generating PDF for user ${user.email}`);

    const isPremium = user.plan === UserPlan.PREMIUM;
    const pdfResult = await this.birthChartFacade.generatePdf(dto, user, isPremium);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${pdfResult.filename}"`);
    res.setHeader("Content-Length", pdfResult.buffer.length);

    res.status(HttpStatus.OK).send(pdfResult.buffer);
  }

  // ===========================================================================
  // GEOCODING
  // ===========================================================================

  /**
   * GET /birth-chart/geocode
   * Busca lugares para autocompletar el campo de lugar de nacimiento
   */
  @Get("geocode")
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 búsquedas/minuto
  @ApiOperation({
    summary: "Buscar lugar de nacimiento",
    description: "Busca lugares para autocompletar. Retorna coordenadas y zona horaria.",
  })
  @ApiQuery({ name: "query", example: "Buenos Aires" })
  @ApiResponse({ status: 200, type: GeocodeSearchResponseDto })
  async searchPlace(@Query() dto: GeocodePlaceDto): Promise<GeocodeSearchResponseDto> {
    return this.geocodeService.searchPlaces(dto.query);
  }

  // ===========================================================================
  // LÍMITES DE USO
  // ===========================================================================

  /**
   * GET /birth-chart/usage
   * Obtiene el estado de uso de cartas astrales del usuario
   */
  @Get("usage")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: "Consultar límites de uso",
    description: "Retorna cuántas cartas ha generado y cuántas le quedan.",
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        plan: "free",
        used: 2,
        limit: 3,
        remaining: 1,
        resetsAt: "2026-03-01T00:00:00Z",
        canGenerate: true,
      },
    },
  })
  async getUsage(@CurrentUser() user: User | null, @Fingerprint() fingerprint: string) {
    return this.birthChartFacade.getUsageStatus(user, fingerprint);
  }

  // ===========================================================================
  // SÍNTESIS IA (Premium only)
  // ===========================================================================

  /**
   * POST /birth-chart/synthesis
   * Genera síntesis IA para una carta existente (Premium)
   * Útil si la síntesis falló inicialmente o se quiere regenerar
   */
  @Post("synthesis")
  @UseGuards(JwtAuthGuard, PremiumGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 síntesis/minuto
  @ApiOperation({
    summary: "Generar síntesis IA",
    description: "Genera o regenera la síntesis personalizada con IA. Solo Premium.",
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        synthesis: "Tu carta revela una personalidad...",
        generatedAt: "2026-02-06T12:00:00Z",
        provider: "groq",
      },
    },
  })
  @ApiResponse({ status: 403, description: "Requiere plan Premium" })
  async generateSynthesis(@Body() dto: GenerateChartDto, @CurrentUser() user: User) {
    this.logger.log(`Generating AI synthesis for user ${user.email}`);

    return this.birthChartFacade.generateSynthesisOnly(dto, user.id);
  }
}
```

**Criterios de aceptación:**

- [ ] Endpoint POST /generate con diferenciación por plan
- [ ] Endpoint POST /generate/anonymous para anónimos
- [ ] Endpoint POST /pdf para descarga
- [ ] Endpoint GET /geocode para búsqueda de lugares
- [ ] Endpoint GET /usage para consultar límites
- [ ] Endpoint POST /synthesis para síntesis IA (Premium)
- [ ] Guards de autenticación opcionales y requeridos
- [ ] Guard de límites de uso integrado
- [ ] Guard de Premium para endpoints exclusivos
- [ ] Throttling por endpoint
- [ ] Documentación Swagger completa
- [ ] Logging de operaciones
- [ ] Manejo de errores consistente
- [ ] Tests de integración

**Dependencias:** T-CA-016, T-CA-017, Sistema de límites existente

**Estimación:** 4 horas

---

### T-CA-019: Crear Controlador de Historial (Premium)

**Historia relacionada:** HU-CA-008, HU-CA-009

**Descripción:**
Crear el controlador para gestionar el historial de cartas astrales guardadas, exclusivo para usuarios Premium.

**Ubicación:** `src/modules/birth-chart/infrastructure/controllers/`

**Archivos a crear:**

```
src/modules/birth-chart/
└── infrastructure/
    └── controllers/
        ├── index.ts
        ├── birth-chart.controller.ts
        └── birth-chart-history.controller.ts
```

**Implementación:**

```typescript
// birth-chart-history.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

// Guards
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { PremiumGuard } from "../../../auth/guards/premium.guard";

// Decorators
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";

// DTOs
import {
  CreateBirthChartDto,
  ChartHistoryResponseDto,
  SavedChartSummaryDto,
  PremiumChartResponseDto,
} from "../../application/dto";

// Services
import { BirthChartHistoryService } from "../../application/services/birth-chart-history.service";

// Types
import { User } from "../../../users/entities/user.entity";

@ApiTags("Birth Chart History")
@Controller("birth-chart/history")
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class BirthChartHistoryController {
  private readonly logger = new Logger(BirthChartHistoryController.name);

  constructor(private readonly historyService: BirthChartHistoryService) {}

  // ===========================================================================
  // LISTAR HISTORIAL
  // ===========================================================================

  /**
   * GET /birth-chart/history
   * Lista las cartas guardadas del usuario Premium
   */
  @Get()
  @ApiOperation({
    summary: "Listar cartas guardadas",
    description: "Obtiene el historial de cartas astrales guardadas. Solo Premium.",
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiResponse({ status: 200, type: ChartHistoryResponseDto })
  @ApiResponse({ status: 403, description: "Requiere plan Premium" })
  async getHistory(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<ChartHistoryResponseDto> {
    this.logger.log(`Fetching chart history for user ${user.id}`);

    return this.historyService.getUserCharts(user.id, page, limit);
  }

  // ===========================================================================
  // OBTENER CARTA ESPECÍFICA
  // ===========================================================================

  /**
   * GET /birth-chart/history/:id
   * Obtiene el detalle completo de una carta guardada
   */
  @Get(":id")
  @ApiOperation({
    summary: "Obtener carta guardada",
    description: "Obtiene el detalle completo de una carta del historial. No consume generación.",
  })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, type: PremiumChartResponseDto })
  @ApiResponse({ status: 404, description: "Carta no encontrada" })
  async getChart(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User): Promise<PremiumChartResponseDto> {
    this.logger.log(`Fetching chart ${id} for user ${user.id}`);

    const chart = await this.historyService.getChartById(id, user.id);

    if (!chart) {
      throw new NotFoundException("Carta no encontrada");
    }

    return chart;
  }

  // ===========================================================================
  // GUARDAR CARTA
  // ===========================================================================

  /**
   * POST /birth-chart/history
   * Guarda una carta en el historial (se llama automáticamente al generar para Premium)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: "Guardar carta en historial",
    description: `Guarda una carta astral en el historial del usuario.
    
**Nota:** Las cartas se guardan automáticamente al generarlas como Premium.
Este endpoint es útil para guardar manualmente una carta que se generó antes.`,
  })
  @ApiResponse({ status: 201, type: SavedChartSummaryDto })
  @ApiResponse({ status: 409, description: "Ya existe una carta con estos datos" })
  async saveChart(@Body() dto: CreateBirthChartDto, @CurrentUser() user: User): Promise<SavedChartSummaryDto> {
    this.logger.log(`Saving chart for user ${user.id}`);

    // Verificar si ya existe
    const exists = await this.historyService.checkDuplicate(
      user.id,
      dto.birthDate,
      dto.birthTime,
      dto.latitude,
      dto.longitude,
    );

    if (exists) {
      throw new ConflictException("Ya existe una carta guardada con estos datos de nacimiento");
    }

    return this.historyService.saveChart(user.id, dto);
  }

  // ===========================================================================
  // ACTUALIZAR NOMBRE
  // ===========================================================================

  /**
   * PATCH /birth-chart/history/:id/name
   * Actualiza el nombre de una carta guardada
   */
  @Post(":id/name")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renombrar carta",
    description: "Actualiza el nombre identificador de una carta guardada.",
  })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({
    status: 200,
    schema: { example: { id: 1, name: "Carta de mamá" } },
  })
  @ApiResponse({ status: 404, description: "Carta no encontrada" })
  async renameChart(@Param("id", ParseIntPipe) id: number, @Body("name") name: string, @CurrentUser() user: User) {
    this.logger.log(`Renaming chart ${id} for user ${user.id}`);

    const updated = await this.historyService.renameChart(id, user.id, name);

    if (!updated) {
      throw new NotFoundException("Carta no encontrada");
    }

    return { id, name };
  }

  // ===========================================================================
  // ELIMINAR CARTA
  // ===========================================================================

  /**
   * DELETE /birth-chart/history/:id
   * Elimina una carta del historial
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Eliminar carta del historial",
    description: "Elimina permanentemente una carta guardada.",
  })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 204, description: "Carta eliminada" })
  @ApiResponse({ status: 404, description: "Carta no encontrada" })
  async deleteChart(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User): Promise<void> {
    this.logger.log(`Deleting chart ${id} for user ${user.id}`);

    const deleted = await this.historyService.deleteChart(id, user.id);

    if (!deleted) {
      throw new NotFoundException("Carta no encontrada");
    }
  }

  // ===========================================================================
  // VERIFICAR DUPLICADOS
  // ===========================================================================

  /**
   * POST /birth-chart/history/check-duplicate
   * Verifica si ya existe una carta con los mismos datos
   */
  @Post("check-duplicate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verificar carta duplicada",
    description: "Verifica si ya existe una carta guardada con los mismos datos de nacimiento.",
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        exists: true,
        existingChart: { id: 1, name: "Mi carta natal" },
      },
    },
  })
  async checkDuplicate(@Body() dto: CreateBirthChartDto, @CurrentUser() user: User) {
    const existing = await this.historyService.findDuplicate(
      user.id,
      dto.birthDate,
      dto.birthTime,
      dto.latitude,
      dto.longitude,
    );

    return {
      exists: !!existing,
      existingChart: existing ? { id: existing.id, name: existing.name } : null,
    };
  }

  // ===========================================================================
  // DESCARGAR PDF DE CARTA GUARDADA
  // ===========================================================================

  /**
   * GET /birth-chart/history/:id/pdf
   * Descarga el PDF de una carta guardada (no consume generación)
   */
  @Get(":id/pdf")
  @ApiOperation({
    summary: "Descargar PDF de carta guardada",
    description: "Descarga el PDF de una carta del historial. No consume límite de generación.",
  })
  @ApiParam({ name: "id", example: 1 })
  @ApiResponse({ status: 200, content: { "application/pdf": {} } })
  @ApiResponse({ status: 404, description: "Carta no encontrada" })
  async downloadSavedChartPdf(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Downloading PDF for saved chart ${id}`);

    const pdfResult = await this.historyService.generatePdfFromSaved(id, user.id);

    if (!pdfResult) {
      throw new NotFoundException("Carta no encontrada");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${pdfResult.filename}"`);
    res.send(pdfResult.buffer);
  }
}
```

**Criterios de aceptación:**

- [ ] GET /history con paginación
- [ ] GET /history/:id para detalle de carta
- [ ] POST /history para guardar manualmente
- [ ] POST /history/:id/name para renombrar
- [ ] DELETE /history/:id para eliminar
- [ ] POST /history/check-duplicate para verificar
- [ ] GET /history/:id/pdf para descargar PDF
- [ ] Todos los endpoints protegidos con PremiumGuard
- [ ] Validación de propiedad (user.id)
- [ ] Documentación Swagger completa
- [ ] Manejo de errores 404, 409
- [ ] Tests de integración

**Dependencias:** T-CA-018

**Estimación:** 3 horas

---

### T-CA-020: Crear Módulo BirthChart Completo

**Historia relacionada:** Todas

**Descripción:**
Crear el módulo NestJS que integra todos los componentes: entidades, repositorios, servicios y controladores.

**Ubicación:** `src/modules/birth-chart/`

**Archivos a crear:**

```
src/modules/birth-chart/
├── birth-chart.module.ts
└── application/
    └── services/
        ├── index.ts
        ├── birth-chart-facade.service.ts
        └── birth-chart-history.service.ts
```

**Implementación:**

```typescript
// birth-chart.module.ts
import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

// Entities
import { BirthChart } from "./infrastructure/entities/birth-chart.entity";
import { BirthChartInterpretation } from "./infrastructure/entities/birth-chart-interpretation.entity";

// Repositories
import { BirthChartInterpretationRepository } from "./infrastructure/repositories/birth-chart-interpretation.repository";
import { BIRTH_CHART_INTERPRETATION_REPOSITORY } from "./infrastructure/repositories/birth-chart-interpretation.repository.interface";

// Ephemeris
import { EphemerisWrapper } from "./infrastructure/ephemeris/ephemeris.wrapper";
import ephemerisConfig from "./infrastructure/ephemeris/ephemeris.config";

// Services - Cálculos
import { PlanetPositionService } from "./application/services/planet-position.service";
import { HouseCuspService } from "./application/services/house-cusp.service";
import { AspectCalculationService } from "./application/services/aspect-calculation.service";
import { ChartCalculationService } from "./application/services/chart-calculation.service";

// Services - Interpretación
import { ChartInterpretationService } from "./application/services/chart-interpretation.service";
import { ChartAISynthesisService } from "./application/services/chart-ai-synthesis.service";
import { ChartCacheService } from "./application/services/chart-cache.service";
import { ChartPdfService } from "./application/services/chart-pdf.service";

// Services - Facade & History
import { BirthChartFacadeService } from "./application/services/birth-chart-facade.service";
import { BirthChartHistoryService } from "./application/services/birth-chart-history.service";

// Services - Geocoding
import { GeocodeService } from "./application/services/geocode.service";

// Controllers
import { BirthChartController } from "./infrastructure/controllers/birth-chart.controller";
import { BirthChartHistoryController } from "./infrastructure/controllers/birth-chart-history.controller";

// Seeders
import { BirthChartInterpretationsSeeder } from "./infrastructure/seeders/birth-chart-interpretations.seeder";

// External Modules
import { AIModule } from "../ai/ai.module";
import { UsageLimitsModule } from "../usage-limits/usage-limits.module";
import { CacheModule } from "../cache/cache.module";

@Module({
  imports: [
    // TypeORM entities
    TypeOrmModule.forFeature([BirthChart, BirthChartInterpretation]),

    // Config
    ConfigModule.forFeature(ephemerisConfig),

    // HTTP for geocoding
    HttpModule,

    // External modules
    forwardRef(() => AIModule),
    UsageLimitsModule,
    CacheModule,
  ],
  controllers: [BirthChartController, BirthChartHistoryController],
  providers: [
    // Ephemeris
    EphemerisWrapper,

    // Repositories
    {
      provide: BIRTH_CHART_INTERPRETATION_REPOSITORY,
      useClass: BirthChartInterpretationRepository,
    },

    // Calculation Services
    PlanetPositionService,
    HouseCuspService,
    AspectCalculationService,
    ChartCalculationService,

    // Interpretation Services
    ChartInterpretationService,
    ChartAISynthesisService,
    ChartCacheService,
    ChartPdfService,

    // Facade & Business Services
    BirthChartFacadeService,
    BirthChartHistoryService,

    // Geocoding
    GeocodeService,

    // Seeders
    BirthChartInterpretationsSeeder,
  ],
  exports: [
    // Exportar para uso en otros módulos si es necesario
    BirthChartFacadeService,
    ChartCalculationService,
    BirthChartInterpretationsSeeder,
  ],
})
export class BirthChartModule {}
```

```typescript
// birth-chart-facade.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BirthChart } from "../../infrastructure/entities/birth-chart.entity";
import { ChartCalculationService, ChartCalculationInput } from "./chart-calculation.service";
import { ChartInterpretationService } from "./chart-interpretation.service";
import { ChartAISynthesisService } from "./chart-ai-synthesis.service";
import { ChartCacheService } from "./chart-cache.service";
import { ChartPdfService, PDFGenerationInput } from "./chart-pdf.service";

import { GenerateChartDto, BasicChartResponseDto, FullChartResponseDto, PremiumChartResponseDto } from "../dto";

import { UserPlan } from "../../../users/enums/user-plan.enum";
import { User } from "../../../users/entities/user.entity";

@Injectable()
export class BirthChartFacadeService {
  private readonly logger = new Logger(BirthChartFacadeService.name);

  constructor(
    @InjectRepository(BirthChart)
    private readonly chartRepo: Repository<BirthChart>,
    private readonly calculationService: ChartCalculationService,
    private readonly interpretationService: ChartInterpretationService,
    private readonly aiSynthesisService: ChartAISynthesisService,
    private readonly cacheService: ChartCacheService,
    private readonly pdfService: ChartPdfService,
  ) {}

  /**
   * Genera una carta astral según el plan del usuario
   */
  async generateChart(
    dto: GenerateChartDto,
    plan: UserPlan,
    userId?: number | null,
    fingerprint?: string,
  ): Promise<BasicChartResponseDto | FullChartResponseDto | PremiumChartResponseDto> {
    this.logger.log(`Generating chart for plan: ${plan}`);

    // 1. Generar clave de caché
    const birthDate = new Date(dto.birthDate);
    const cacheKey = this.cacheService.generateChartCacheKey(birthDate, dto.birthTime, dto.latitude, dto.longitude);

    // 2. Verificar caché de cálculos
    let chartData = await this.cacheService.getChartCalculation(cacheKey);

    if (!chartData) {
      // 3. Calcular carta
      const input: ChartCalculationInput = {
        birthDate,
        birthTime: dto.birthTime,
        latitude: dto.latitude,
        longitude: dto.longitude,
        timezone: dto.timezone,
      };

      const calculationResult = await this.calculationService.calculateChart(input);
      chartData = {
        chartData: calculationResult.chartData,
        calculatedAt: new Date(),
        cacheKey,
      };

      // Guardar en caché
      await this.cacheService.setChartCalculation(cacheKey, calculationResult.chartData);
    }

    // 4. Respuesta según plan
    switch (plan) {
      case UserPlan.ANONYMOUS:
        return this.buildAnonymousResponse(chartData.chartData, dto);

      case UserPlan.FREE:
        return this.buildFreeResponse(chartData.chartData, dto);

      case UserPlan.PREMIUM:
        return this.buildPremiumResponse(chartData.chartData, dto, userId!);

      default:
        return this.buildAnonymousResponse(chartData.chartData, dto);
    }
  }

  /**
   * Construye respuesta para anónimos (Big Three solamente)
   */
  private async buildAnonymousResponse(chartData: ChartData, dto: GenerateChartDto): Promise<BasicChartResponseDto> {
    // Solo Big Three interpretado
    const bigThree = await this.interpretationService.generateBigThreeInterpretation(
      chartData.planets.find((p) => p.planet === "sun")?.sign,
      chartData.planets.find((p) => p.planet === "moon")?.sign,
      chartData.ascendant.sign,
    );

    return {
      success: true,
      chartSvgData: {
        planets: this.formatPlanetsForSvg(chartData.planets),
        houses: this.formatHousesForSvg(chartData.houses),
        aspects: this.formatAspectsForSvg(chartData.aspects),
      },
      planets: this.formatPlanetsForResponse(chartData.planets),
      houses: this.formatHousesForResponse(chartData.houses),
      aspects: this.formatAspectsForResponse(chartData.aspects),
      bigThree,
      calculationTimeMs: 0, // TODO: agregar tracking
    };
  }

  /**
   * Construye respuesta para Free (interpretación completa)
   */
  private async buildFreeResponse(chartData: ChartData, dto: GenerateChartDto): Promise<FullChartResponseDto> {
    const basicResponse = await this.buildAnonymousResponse(chartData, dto);
    const fullInterpretation = await this.interpretationService.generateFullInterpretation(chartData);

    return {
      ...basicResponse,
      distribution: fullInterpretation.distribution,
      interpretations: {
        planets: fullInterpretation.planets,
      },
      canDownloadPdf: true,
    };
  }

  /**
   * Construye respuesta para Premium (todo + síntesis IA + guardar)
   */
  private async buildPremiumResponse(
    chartData: ChartData,
    dto: GenerateChartDto,
    userId: number,
  ): Promise<PremiumChartResponseDto> {
    const freeResponse = await this.buildFreeResponse(chartData, dto);

    // Generar síntesis IA
    const fullInterpretation = await this.interpretationService.generateFullInterpretation(chartData);
    const synthesis = await this.aiSynthesisService.generateSynthesis(
      {
        chartData,
        interpretation: fullInterpretation,
        userName: dto.name,
        birthDate: new Date(dto.birthDate),
      },
      userId,
    );

    // Guardar en DB
    const savedChart = await this.saveChart(userId, dto, chartData, synthesis.synthesis);

    return {
      ...freeResponse,
      savedChartId: savedChart.id,
      aiSynthesis: {
        content: synthesis.synthesis,
        generatedAt: new Date().toISOString(),
        provider: synthesis.provider,
      },
      canAccessHistory: true,
    };
  }

  /**
   * Guarda la carta en la base de datos
   */
  private async saveChart(
    userId: number,
    dto: GenerateChartDto,
    chartData: ChartData,
    aiSynthesis?: string,
  ): Promise<BirthChart> {
    const chart = this.chartRepo.create({
      userId,
      name: dto.chartName || dto.name,
      birthDate: new Date(dto.birthDate),
      birthTime: dto.birthTime,
      birthPlace: dto.birthPlace,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
      chartData: {
        ...chartData,
        aiSynthesis,
      },
      sunSign: chartData.planets.find((p) => p.planet === "sun")?.sign || "",
      moonSign: chartData.planets.find((p) => p.planet === "moon")?.sign || "",
      ascendantSign: chartData.ascendant.sign,
    });

    return this.chartRepo.save(chart);
  }

  /**
   * Genera PDF de una carta
   */
  async generatePdf(
    dto: GenerateChartDto,
    user: User,
    includeSynthesis: boolean,
  ): Promise<{ buffer: Buffer; filename: string }> {
    // Calcular carta
    const birthDate = new Date(dto.birthDate);
    const input: ChartCalculationInput = {
      birthDate,
      birthTime: dto.birthTime,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
    };

    const { chartData } = await this.calculationService.calculateChart(input);
    const interpretation = await this.interpretationService.generateFullInterpretation(chartData);

    let aiSynthesis: string | undefined;
    if (includeSynthesis) {
      const synthesis = await this.aiSynthesisService.generateSynthesis(
        {
          chartData,
          interpretation,
          userName: dto.name,
          birthDate,
        },
        user.id,
      );
      aiSynthesis = synthesis.synthesis;
    }

    const pdfInput: PDFGenerationInput = {
      chartData,
      interpretation,
      aiSynthesis,
      userName: dto.name,
      birthDate,
      birthTime: dto.birthTime,
      birthPlace: dto.birthPlace,
      generatedAt: new Date(),
      isPremium: includeSynthesis,
    };

    return this.pdfService.generatePDF(pdfInput);
  }

  /**
   * Obtiene estado de uso del usuario
   */
  async getUsageStatus(user: User | null, fingerprint: string) {
    // TODO: Integrar con UsageLimitsService
    const plan = user?.plan || UserPlan.ANONYMOUS;

    const limits = {
      [UserPlan.ANONYMOUS]: { limit: 1, period: "lifetime" },
      [UserPlan.FREE]: { limit: 3, period: "month" },
      [UserPlan.PREMIUM]: { limit: 5, period: "month" },
    };

    return {
      plan,
      used: 0, // TODO: consultar uso real
      limit: limits[plan].limit,
      remaining: limits[plan].limit,
      period: limits[plan].period,
      canGenerate: true,
    };
  }

  /**
   * Genera solo la síntesis IA (para regeneración)
   */
  async generateSynthesisOnly(dto: GenerateChartDto, userId: number) {
    const birthDate = new Date(dto.birthDate);
    const input: ChartCalculationInput = {
      birthDate,
      birthTime: dto.birthTime,
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone,
    };

    const { chartData } = await this.calculationService.calculateChart(input);
    const interpretation = await this.interpretationService.generateFullInterpretation(chartData);

    const synthesis = await this.aiSynthesisService.generateSynthesis(
      {
        chartData,
        interpretation,
        userName: dto.name,
        birthDate,
      },
      userId,
    );

    return {
      synthesis: synthesis.synthesis,
      generatedAt: new Date().toISOString(),
      provider: synthesis.provider,
    };
  }

  // Métodos helper de formateo (implementación simplificada)
  private formatPlanetsForSvg(planets: any[]) {
    return planets;
  }
  private formatHousesForSvg(houses: any[]) {
    return houses;
  }
  private formatAspectsForSvg(aspects: any[]) {
    return aspects;
  }
  private formatPlanetsForResponse(planets: any[]) {
    return planets;
  }
  private formatHousesForResponse(houses: any[]) {
    return houses;
  }
  private formatAspectsForResponse(aspects: any[]) {
    return aspects;
  }
}
```

```typescript
// birth-chart-history.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BirthChart } from "../../infrastructure/entities/birth-chart.entity";
import { ChartPdfService } from "./chart-pdf.service";
import { ChartInterpretationService } from "./chart-interpretation.service";
import { ChartHistoryResponseDto, SavedChartSummaryDto, PremiumChartResponseDto, CreateBirthChartDto } from "../dto";
import { ZodiacSignMetadata, ZodiacSign } from "../../domain/enums";

@Injectable()
export class BirthChartHistoryService {
  private readonly logger = new Logger(BirthChartHistoryService.name);

  constructor(
    @InjectRepository(BirthChart)
    private readonly chartRepo: Repository<BirthChart>,
    private readonly pdfService: ChartPdfService,
    private readonly interpretationService: ChartInterpretationService,
  ) {}

  /**
   * Obtiene las cartas guardadas de un usuario con paginación
   */
  async getUserCharts(userId: number, page: number, limit: number): Promise<ChartHistoryResponseDto> {
    const [charts, total] = await this.chartRepo.findAndCount({
      where: { userId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const summaries: SavedChartSummaryDto[] = charts.map((chart) => ({
      id: chart.id,
      name: chart.name,
      birthDate: chart.birthDate.toISOString().split("T")[0],
      sunSign: ZodiacSignMetadata[chart.sunSign as ZodiacSign]?.name || chart.sunSign,
      moonSign: ZodiacSignMetadata[chart.moonSign as ZodiacSign]?.name || chart.moonSign,
      ascendantSign: ZodiacSignMetadata[chart.ascendantSign as ZodiacSign]?.name || chart.ascendantSign,
      createdAt: chart.createdAt.toISOString(),
    }));

    return {
      charts: summaries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene una carta por ID (verificando propiedad)
   */
  async getChartById(chartId: number, userId: number): Promise<PremiumChartResponseDto | null> {
    const chart = await this.chartRepo.findOne({
      where: { id: chartId, userId },
    });

    if (!chart) {
      return null;
    }

    // Reconstruir respuesta desde datos guardados
    const interpretation = await this.interpretationService.generateFullInterpretation(chart.chartData);

    return {
      success: true,
      chartSvgData: {
        planets: chart.chartData.planets,
        houses: chart.chartData.houses,
        aspects: chart.chartData.aspects,
      },
      planets: chart.chartData.planets,
      houses: chart.chartData.houses,
      aspects: chart.chartData.aspects,
      bigThree: interpretation.bigThree,
      calculationTimeMs: 0,
      distribution: interpretation.distribution,
      interpretations: { planets: interpretation.planets },
      canDownloadPdf: true,
      savedChartId: chart.id,
      aiSynthesis: chart.chartData.aiSynthesis
        ? {
            content: chart.chartData.aiSynthesis,
            generatedAt: chart.createdAt.toISOString(),
            provider: "cached",
          }
        : undefined,
      canAccessHistory: true,
    };
  }

  /**
   * Verifica si existe una carta duplicada
   */
  async checkDuplicate(
    userId: number,
    birthDate: string,
    birthTime: string,
    latitude: number,
    longitude: number,
  ): Promise<boolean> {
    const existing = await this.findDuplicate(userId, birthDate, birthTime, latitude, longitude);
    return !!existing;
  }

  /**
   * Busca una carta duplicada
   */
  async findDuplicate(
    userId: number,
    birthDate: string,
    birthTime: string,
    latitude: number,
    longitude: number,
  ): Promise<BirthChart | null> {
    return this.chartRepo.findOne({
      where: {
        userId,
        birthDate: new Date(birthDate),
        birthTime,
        latitude,
        longitude,
      },
    });
  }

  /**
   * Guarda una carta manualmente
   */
  async saveChart(userId: number, dto: CreateBirthChartDto): Promise<SavedChartSummaryDto> {
    // TODO: Calcular carta y guardar
    // Este método se usa para guardar manualmente, no automáticamente
    throw new Error("Not implemented");
  }

  /**
   * Renombra una carta
   */
  async renameChart(chartId: number, userId: number, newName: string): Promise<boolean> {
    const result = await this.chartRepo.update({ id: chartId, userId }, { name: newName });

    return result.affected > 0;
  }

  /**
   * Elimina una carta
   */
  async deleteChart(chartId: number, userId: number): Promise<boolean> {
    const result = await this.chartRepo.delete({ id: chartId, userId });
    return result.affected > 0;
  }

  /**
   * Genera PDF desde una carta guardada
   */
  async generatePdfFromSaved(chartId: number, userId: number): Promise<{ buffer: Buffer; filename: string } | null> {
    const chart = await this.chartRepo.findOne({
      where: { id: chartId, userId },
    });

    if (!chart) {
      return null;
    }

    const interpretation = await this.interpretationService.generateFullInterpretation(chart.chartData);

    return this.pdfService.generatePDF({
      chartData: chart.chartData,
      interpretation,
      aiSynthesis: chart.chartData.aiSynthesis,
      userName: chart.name,
      birthDate: chart.birthDate,
      birthTime: chart.birthTime,
      birthPlace: chart.birthPlace,
      generatedAt: new Date(),
      isPremium: true,
    });
  }
}
```

**Criterios de aceptación:**

- [ ] Módulo NestJS configurado correctamente
- [ ] Todas las dependencias inyectadas
- [ ] Facade service orquestando todos los servicios
- [ ] History service para operaciones de historial
- [ ] Exportaciones necesarias para otros módulos
- [ ] Integración con AIModule, UsageLimitsModule, CacheModule
- [ ] Seeder registrado como provider
- [ ] Tests de integración del módulo

**Dependencias:** Todas las tareas anteriores

**Estimación:** 2 horas

---

## CHECKLIST DE PARTE 7E

- [ ] T-CA-016: DTOs de request creados con validaciones
- [ ] T-CA-017: DTOs de response creados con documentación
- [ ] T-CA-018: Controlador principal funcionando
- [ ] T-CA-019: Controlador de historial funcionando
- [ ] T-CA-020: Módulo completo e integrado

---

## ENDPOINTS RESULTANTES

| Método | Endpoint                             | Plan         | Descripción                      |
| ------ | ------------------------------------ | ------------ | -------------------------------- |
| POST   | /birth-chart/generate                | Todos        | Genera carta astral              |
| POST   | /birth-chart/generate/anonymous      | Anónimo      | Genera carta para no registrados |
| POST   | /birth-chart/pdf                     | Free/Premium | Descarga PDF                     |
| GET    | /birth-chart/geocode                 | Público      | Busca lugares                    |
| GET    | /birth-chart/usage                   | Todos        | Consulta límites                 |
| POST   | /birth-chart/synthesis               | Premium      | Genera síntesis IA               |
| GET    | /birth-chart/history                 | Premium      | Lista cartas guardadas           |
| GET    | /birth-chart/history/:id             | Premium      | Obtiene carta guardada           |
| POST   | /birth-chart/history                 | Premium      | Guarda carta manualmente         |
| POST   | /birth-chart/history/:id/name        | Premium      | Renombra carta                   |
| DELETE | /birth-chart/history/:id             | Premium      | Elimina carta                    |
| POST   | /birth-chart/history/check-duplicate | Premium      | Verifica duplicado               |
| GET    | /birth-chart/history/:id/pdf         | Premium      | PDF de carta guardada            |

---

## PRÓXIMOS PASOS

**Siguiente parte:** PARTE-7F - Tareas de Backend: Sistema de Límites y Geocoding

---

**FIN DE PARTE 7E - TAREAS DE CONTROLADORES Y DTOs**

# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7F: TAREAS DE BACKEND - SISTEMA DE LÍMITES Y GEOCODING

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.0  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## RESUMEN DE PARTE 7F

Esta parte cubre la integración con el sistema de límites de uso existente (adaptándolo para límites mensuales) y la implementación del servicio de geocodificación para lugares de nacimiento.

| Tarea    | Título                                         | Tipo    | Prioridad | Estimación |
| -------- | ---------------------------------------------- | ------- | --------- | ---------- |
| T-CA-021 | Analizar sistema de límites existente          | Backend | Must      | 2h         |
| T-CA-022 | Extender sistema para límites mensuales        | Backend | Must      | 4h         |
| T-CA-023 | Integrar límites de carta astral               | Backend | Must      | 3h         |
| T-CA-024 | Crear servicio de geocodificación              | Backend | Must      | 4h         |
| T-CA-025 | Crear panel admin para límites de carta astral | Backend | Should    | 3h         |

**Total estimado:** 16 horas

---

## DETALLE DE TAREAS

### T-CA-021: Analizar Sistema de Límites Existente

**Historia relacionada:** HU-CA-010

**Descripción:**
Analizar el sistema de límites de uso actual (`UsageLimitsModule`) para entender su arquitectura y planificar la extensión para soportar límites mensuales además de los diarios existentes.

**Ubicación de análisis:** `src/modules/usage-limits/`

**Objetivos del análisis:**

1. **Entender la arquitectura actual:**
   - ¿Cómo se definen los tipos de límite (`UsageType`)?
   - ¿Cómo funciona el `CheckUsageLimitGuard`?
   - ¿Cómo se trackea el uso para usuarios autenticados vs anónimos?
   - ¿Dónde se configuran los límites por plan?

2. **Identificar puntos de extensión:**
   - ¿Se puede agregar un nuevo período (mensual) sin romper lo existente?
   - ¿Es necesario crear nuevas entidades o se pueden reutilizar?
   - ¿El guard actual puede manejar diferentes períodos?

3. **Documentar hallazgos:**

**Documento de análisis esperado:**

```markdown
# Análisis del Sistema de Límites Existente

## Estructura Actual

### Entidades

- `UsageLimit` (si existe) o tracking en otras tablas
- Campos: userId, usageType, count, date/period

### Enums

- `UsageType`: DAILY_CARD, TAROT_READING, etc.

### Servicios

- `UsageLimitsService`: Lógica de verificación y registro
- Métodos clave: checkLimit(), incrementUsage(), getUsage()

### Guards

- `CheckUsageLimitGuard`: Verifica límites antes de ejecutar endpoint
- Decorador `@UsageType()`: Define qué tipo de uso aplica

### Configuración de Límites

- ¿Hardcoded o configurable?
- ¿Por plan (Anonymous, Free, Premium)?

## Sistema de Reset Actual

Según docs/USAGE_LIMITS_SYSTEM.md:

- Los límites DIARIOS no usan cron job
- Se resetean automáticamente mediante consultas que filtran por fecha actual
- Ejemplo: `WHERE reading_date = TODAY`

## Cambios Necesarios para Límites Mensuales

### Opción A: Extender UsageType con período

- Agregar campo `period: 'daily' | 'monthly' | 'lifetime'`
- Modificar consultas para filtrar por mes actual

### Opción B: Crear entidad separada para uso mensual

- Nueva tabla `monthly_usage`
- Mantener sistema diario intacto

### Opción C: Usar JSONB para tracking flexible

- Columna JSONB en User con contadores por tipo/período

## Recomendación

[Documentar la opción elegida basada en el análisis]
```

**Criterios de aceptación:**

- [ ] Documento de análisis completo
- [ ] Estructura actual documentada
- [ ] Puntos de extensión identificados
- [ ] Recomendación de implementación clara
- [ ] Riesgos y consideraciones documentados
- [ ] Estimación refinada para T-CA-022

**Dependencias:** Ninguna

**Estimación:** 2 horas

---

### T-CA-022: Extender Sistema para Límites Mensuales

**Historia relacionada:** HU-CA-010

**Descripción:**
Extender el sistema de límites existente para soportar límites mensuales, manteniendo compatibilidad con los límites diarios actuales.

**Ubicación:** `src/modules/usage-limits/`

**Archivos a modificar/crear:**

```
src/modules/usage-limits/
├── domain/
│   └── enums/
│       ├── usage-type.enum.ts          # Agregar BIRTH_CHART
│       └── usage-period.enum.ts        # 🆕 Crear
├── application/
│   └── services/
│       └── usage-limits.service.ts     # Extender
├── infrastructure/
│   ├── entities/
│   │   └── monthly-usage.entity.ts     # 🆕 Crear (si es necesario)
│   └── guards/
│       └── check-usage-limit.guard.ts  # Extender
└── constants/
    └── usage-limits.constants.ts       # Agregar límites de carta astral
```

**Implementación:**

```typescript
// usage-period.enum.ts
export enum UsagePeriod {
  DAILY = "daily",
  MONTHLY = "monthly",
  LIFETIME = "lifetime",
}
```

```typescript
// usage-type.enum.ts (extender)
export enum UsageType {
  // Existentes (diarios)
  DAILY_CARD = "daily_card",
  TAROT_READING = "tarot_reading",

  // Nuevos (mensuales)
  BIRTH_CHART = "birth_chart",

  // Anónimos (lifetime)
  BIRTH_CHART_ANONYMOUS = "birth_chart_anonymous",
}

// Configuración de período por tipo
export const UsageTypePeriod: Record<UsageType, UsagePeriod> = {
  [UsageType.DAILY_CARD]: UsagePeriod.DAILY,
  [UsageType.TAROT_READING]: UsagePeriod.DAILY,
  [UsageType.BIRTH_CHART]: UsagePeriod.MONTHLY,
  [UsageType.BIRTH_CHART_ANONYMOUS]: UsagePeriod.LIFETIME,
};
```

```typescript
// usage-limits.constants.ts (extender)
import { UserPlan } from "../../users/enums/user-plan.enum";
import { UsageType } from "../domain/enums/usage-type.enum";

export const USAGE_LIMITS: Record<UsageType, Record<UserPlan, number>> = {
  // Límites existentes (diarios)
  [UsageType.DAILY_CARD]: {
    [UserPlan.ANONYMOUS]: 1,
    [UserPlan.FREE]: 1,
    [UserPlan.PREMIUM]: 3,
  },
  [UsageType.TAROT_READING]: {
    [UserPlan.ANONYMOUS]: 1,
    [UserPlan.FREE]: 3,
    [UserPlan.PREMIUM]: 10,
  },

  // Nuevos límites de carta astral (mensuales/lifetime)
  [UsageType.BIRTH_CHART]: {
    [UserPlan.ANONYMOUS]: 0, // No aplica, usa BIRTH_CHART_ANONYMOUS
    [UserPlan.FREE]: 3, // 3 por mes
    [UserPlan.PREMIUM]: 5, // 5 por mes
  },
  [UsageType.BIRTH_CHART_ANONYMOUS]: {
    [UserPlan.ANONYMOUS]: 1, // 1 lifetime
    [UserPlan.FREE]: 0, // No aplica
    [UserPlan.PREMIUM]: 0, // No aplica
  },
};
```

```typescript
// monthly-usage.entity.ts (nueva entidad para tracking mensual)
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, Unique } from "typeorm";
import { UsageType } from "../../domain/enums/usage-type.enum";

@Entity("monthly_usage")
@Unique("uq_monthly_usage", ["userId", "usageType", "usageYear", "usageMonth"])
@Index("idx_monthly_usage_user", ["userId"])
@Index("idx_monthly_usage_period", ["usageYear", "usageMonth"])
export class MonthlyUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: "enum",
    enum: UsageType,
  })
  usageType: UsageType;

  @Column({ type: "smallint" })
  usageYear: number;

  @Column({ type: "smallint" })
  usageMonth: number; // 1-12

  @Column({ type: "int", default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date | null;
}
```

```typescript
// anonymous-lifetime-usage.entity.ts (para tracking de anónimos lifetime)
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, Unique } from "typeorm";
import { UsageType } from "../../domain/enums/usage-type.enum";

@Entity("anonymous_lifetime_usage")
@Unique("uq_anonymous_lifetime", ["fingerprint", "usageType"])
@Index("idx_anonymous_fingerprint", ["fingerprint"])
export class AnonymousLifetimeUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 64 })
  fingerprint: string;

  @Column({
    type: "enum",
    enum: UsageType,
  })
  usageType: UsageType;

  @Column({ type: "int", default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date | null;
}
```

```typescript
// usage-limits.service.ts (extender con métodos para mensual y lifetime)
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MonthlyUsage } from "../infrastructure/entities/monthly-usage.entity";
import { AnonymousLifetimeUsage } from "../infrastructure/entities/anonymous-lifetime-usage.entity";
import { UsageType, UsageTypePeriod, UsagePeriod } from "../domain/enums";
import { USAGE_LIMITS } from "../constants/usage-limits.constants";
import { UserPlan } from "../../users/enums/user-plan.enum";

@Injectable()
export class UsageLimitsService {
  private readonly logger = new Logger(UsageLimitsService.name);

  constructor(
    @InjectRepository(MonthlyUsage)
    private readonly monthlyUsageRepo: Repository<MonthlyUsage>,
    @InjectRepository(AnonymousLifetimeUsage)
    private readonly anonymousUsageRepo: Repository<AnonymousLifetimeUsage>,
    // ... otros repositorios existentes
  ) {}

  /**
   * Verifica si el usuario puede realizar la acción
   */
  async checkLimit(
    usageType: UsageType,
    userId: number | null,
    plan: UserPlan,
    fingerprint?: string,
  ): Promise<{ allowed: boolean; current: number; limit: number; remaining: number }> {
    const period = UsageTypePeriod[usageType];
    const limit = USAGE_LIMITS[usageType][plan];

    let current: number;

    switch (period) {
      case UsagePeriod.DAILY:
        current = await this.getDailyUsage(usageType, userId);
        break;
      case UsagePeriod.MONTHLY:
        current = await this.getMonthlyUsage(usageType, userId!);
        break;
      case UsagePeriod.LIFETIME:
        current = await this.getLifetimeUsage(usageType, fingerprint!);
        break;
      default:
        current = 0;
    }

    const remaining = Math.max(0, limit - current);
    const allowed = current < limit;

    return { allowed, current, limit, remaining };
  }

  /**
   * Obtiene uso mensual de un usuario
   */
  async getMonthlyUsage(usageType: UsageType, userId: number): Promise<number> {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const record = await this.monthlyUsageRepo.findOne({
      where: {
        userId,
        usageType,
        usageYear: year,
        usageMonth: month,
      },
    });

    return record?.usageCount || 0;
  }

  /**
   * Obtiene uso lifetime de un anónimo
   */
  async getLifetimeUsage(usageType: UsageType, fingerprint: string): Promise<number> {
    const record = await this.anonymousUsageRepo.findOne({
      where: {
        fingerprint,
        usageType,
      },
    });

    return record?.usageCount || 0;
  }

  /**
   * Incrementa el uso mensual
   */
  async incrementMonthlyUsage(usageType: UsageType, userId: number): Promise<void> {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    // Upsert: crear si no existe, incrementar si existe
    await this.monthlyUsageRepo
      .createQueryBuilder()
      .insert()
      .into(MonthlyUsage)
      .values({
        userId,
        usageType,
        usageYear: year,
        usageMonth: month,
        usageCount: 1,
        lastUsedAt: now,
      })
      .orUpdate(["usageCount", "lastUsedAt"], ["userId", "usageType", "usageYear", "usageMonth"])
      .setParameter("usageCount", () => '"usageCount" + 1')
      .execute();

    // Alternativa más simple si el upsert da problemas:
    /*
    let record = await this.monthlyUsageRepo.findOne({
      where: { userId, usageType, usageYear: year, usageMonth: month },
    });

    if (record) {
      record.usageCount++;
      record.lastUsedAt = now;
      await this.monthlyUsageRepo.save(record);
    } else {
      record = this.monthlyUsageRepo.create({
        userId,
        usageType,
        usageYear: year,
        usageMonth: month,
        usageCount: 1,
        lastUsedAt: now,
      });
      await this.monthlyUsageRepo.save(record);
    }
    */
  }

  /**
   * Incrementa el uso lifetime de anónimo
   */
  async incrementLifetimeUsage(usageType: UsageType, fingerprint: string): Promise<void> {
    const now = new Date();

    let record = await this.anonymousUsageRepo.findOne({
      where: { fingerprint, usageType },
    });

    if (record) {
      record.usageCount++;
      record.lastUsedAt = now;
      await this.anonymousUsageRepo.save(record);
    } else {
      record = this.anonymousUsageRepo.create({
        fingerprint,
        usageType,
        usageCount: 1,
        lastUsedAt: now,
      });
      await this.anonymousUsageRepo.save(record);
    }
  }

  /**
   * Obtiene información de uso para mostrar al usuario
   */
  async getUsageInfo(
    usageType: UsageType,
    userId: number | null,
    plan: UserPlan,
    fingerprint?: string,
  ): Promise<{
    plan: UserPlan;
    usageType: UsageType;
    period: UsagePeriod;
    used: number;
    limit: number;
    remaining: number;
    resetsAt: Date | null;
    canUse: boolean;
  }> {
    const checkResult = await this.checkLimit(usageType, userId, plan, fingerprint);
    const period = UsageTypePeriod[usageType];

    // Calcular fecha de reset
    let resetsAt: Date | null = null;
    if (period === UsagePeriod.DAILY) {
      resetsAt = this.getNextDayUTC();
    } else if (period === UsagePeriod.MONTHLY) {
      resetsAt = this.getFirstDayNextMonthUTC();
    }
    // Lifetime no tiene reset

    return {
      plan,
      usageType,
      period,
      used: checkResult.current,
      limit: checkResult.limit,
      remaining: checkResult.remaining,
      resetsAt,
      canUse: checkResult.allowed,
    };
  }

  /**
   * Helper: próximo día UTC
   */
  private getNextDayUTC(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Helper: primer día del próximo mes UTC
   */
  private getFirstDayNextMonthUTC(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  }
}
```

**Migración para nuevas tablas:**

```typescript
// XXXXXXXXXX-CreateMonthlyUsageTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from "typeorm";

export class CreateMonthlyUsageTables1707220000001 implements MigrationInterface {
  name = "CreateMonthlyUsageTables1707220000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar BIRTH_CHART al enum usage_type si existe
    // O crear el enum si no existe
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usage_type_enum') THEN
          CREATE TYPE usage_type_enum AS ENUM ('daily_card', 'tarot_reading', 'birth_chart', 'birth_chart_anonymous');
        ELSE
          ALTER TYPE usage_type_enum ADD VALUE IF NOT EXISTS 'birth_chart';
          ALTER TYPE usage_type_enum ADD VALUE IF NOT EXISTS 'birth_chart_anonymous';
        END IF;
      END
      $$;
    `);

    // Tabla monthly_usage
    await queryRunner.createTable(
      new Table({
        name: "monthly_usage",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "userId",
            type: "integer",
          },
          {
            name: "usageType",
            type: "usage_type_enum",
          },
          {
            name: "usageYear",
            type: "smallint",
          },
          {
            name: "usageMonth",
            type: "smallint",
          },
          {
            name: "usageCount",
            type: "integer",
            default: 0,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "lastUsedAt",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Índices y constraints para monthly_usage
    await queryRunner.createIndex(
      "monthly_usage",
      new TableIndex({
        name: "idx_monthly_usage_user",
        columnNames: ["userId"],
      }),
    );

    await queryRunner.createIndex(
      "monthly_usage",
      new TableIndex({
        name: "idx_monthly_usage_period",
        columnNames: ["usageYear", "usageMonth"],
      }),
    );

    await queryRunner.query(`
      ALTER TABLE monthly_usage
      ADD CONSTRAINT uq_monthly_usage UNIQUE ("userId", "usageType", "usageYear", "usageMonth");
    `);

    // Tabla anonymous_lifetime_usage
    await queryRunner.createTable(
      new Table({
        name: "anonymous_lifetime_usage",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "fingerprint",
            type: "varchar",
            length: "64",
          },
          {
            name: "usageType",
            type: "usage_type_enum",
          },
          {
            name: "usageCount",
            type: "integer",
            default: 0,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "lastUsedAt",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "anonymous_lifetime_usage",
      new TableIndex({
        name: "idx_anonymous_fingerprint",
        columnNames: ["fingerprint"],
      }),
    );

    await queryRunner.query(`
      ALTER TABLE anonymous_lifetime_usage
      ADD CONSTRAINT uq_anonymous_lifetime UNIQUE ("fingerprint", "usageType");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("anonymous_lifetime_usage");
    await queryRunner.dropTable("monthly_usage");
    // No eliminamos los valores del enum para evitar problemas
  }
}
```

**Criterios de aceptación:**

- [ ] Enum `UsagePeriod` creado
- [ ] Enum `UsageType` extendido con BIRTH_CHART
- [ ] Entidad `MonthlyUsage` creada
- [ ] Entidad `AnonymousLifetimeUsage` creada
- [ ] Migración ejecutada correctamente
- [ ] Servicio extendido con métodos para mensual/lifetime
- [ ] Método `checkLimit` unificado para todos los períodos
- [ ] Método `incrementUsage` para cada período
- [ ] Método `getUsageInfo` para consulta de estado
- [ ] Tests unitarios para nueva lógica
- [ ] Tests de integración con DB
- [ ] Compatibilidad con límites diarios existentes verificada

**Dependencias:** T-CA-021

**Estimación:** 4 horas

---

### T-CA-023: Integrar Límites de Carta Astral

**Historia relacionada:** HU-CA-010

**Descripción:**
Integrar el sistema de límites extendido con el módulo de carta astral, asegurando que el guard valide y registre el uso correctamente.

**Ubicación:** `src/modules/usage-limits/` y `src/modules/birth-chart/`

**Archivos a modificar:**

```
src/modules/usage-limits/
├── infrastructure/
│   └── guards/
│       └── check-usage-limit.guard.ts   # Extender
└── usage-limits.module.ts               # Actualizar exports

src/modules/birth-chart/
└── infrastructure/
    └── controllers/
        └── birth-chart.controller.ts    # Ya tiene @UsageType
```

**Implementación:**

```typescript
// check-usage-limit.guard.ts (extender)
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsageLimitsService } from "../../application/services/usage-limits.service";
import { UsageType, UsageTypePeriod, UsagePeriod } from "../../domain/enums";
import { USAGE_TYPE_KEY } from "../../decorators/usage-type.decorator";
import { UserPlan } from "../../../users/enums/user-plan.enum";

@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  private readonly logger = new Logger(CheckUsageLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly usageLimitsService: UsageLimitsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener el tipo de uso del decorador
    const usageType = this.reflector.get<UsageType>(USAGE_TYPE_KEY, context.getHandler());

    if (!usageType) {
      // Si no hay decorador, permitir
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fingerprint = request.fingerprint || request.headers["x-fingerprint"];

    // Determinar plan
    const plan = user?.plan || UserPlan.ANONYMOUS;
    const userId = user?.id || null;

    // Verificar límite
    const { allowed, current, limit, remaining } = await this.usageLimitsService.checkLimit(
      usageType,
      userId,
      plan,
      fingerprint,
    );

    if (!allowed) {
      const period = UsageTypePeriod[usageType];
      const periodText = this.getPeriodText(period);

      this.logger.warn(`Usage limit reached for ${user?.email || fingerprint}: ${usageType} (${current}/${limit})`);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: "Usage Limit Exceeded",
          message: this.getLimitMessage(usageType, plan, period),
          details: {
            usageType,
            period: periodText,
            used: current,
            limit,
            remaining: 0,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Guardar info en request para uso posterior
    request.usageInfo = {
      usageType,
      current,
      limit,
      remaining,
      plan,
    };

    return true;
  }

  /**
   * Genera mensaje de error según tipo y plan
   */
  private getLimitMessage(usageType: UsageType, plan: UserPlan, period: UsagePeriod): string {
    if (usageType === UsageType.BIRTH_CHART_ANONYMOUS) {
      return "Ya utilizaste tu carta astral gratuita. Regístrate para obtener más.";
    }

    if (usageType === UsageType.BIRTH_CHART) {
      if (plan === UserPlan.FREE) {
        return "Has alcanzado el límite de 3 cartas astrales este mes. Actualiza a Premium para obtener 5 cartas mensuales.";
      }
      if (plan === UserPlan.PREMIUM) {
        return "Has alcanzado el límite de 5 cartas astrales este mes. El límite se reinicia el primer día del próximo mes.";
      }
    }

    // Mensaje genérico para otros tipos
    const periodText = period === UsagePeriod.DAILY ? "hoy" : "este mes";
    return `Has alcanzado el límite de uso para ${periodText}.`;
  }

  /**
   * Convierte período a texto
   */
  private getPeriodText(period: UsagePeriod): string {
    switch (period) {
      case UsagePeriod.DAILY:
        return "diario";
      case UsagePeriod.MONTHLY:
        return "mensual";
      case UsagePeriod.LIFETIME:
        return "único";
      default:
        return period;
    }
  }
}
```

```typescript
// Decorador para registrar uso después de éxito
// register-usage.interceptor.ts (nuevo)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { UsageLimitsService } from "../../application/services/usage-limits.service";
import { UsageType, UsageTypePeriod, UsagePeriod } from "../../domain/enums";
import { USAGE_TYPE_KEY } from "../../decorators/usage-type.decorator";

@Injectable()
export class RegisterUsageInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly usageLimitsService: UsageLimitsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const usageType = this.reflector.get<UsageType>(USAGE_TYPE_KEY, context.getHandler());

    if (!usageType) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fingerprint = request.fingerprint || request.headers["x-fingerprint"];
    const period = UsageTypePeriod[usageType];

    return next.handle().pipe(
      tap(async () => {
        // Registrar uso solo después de respuesta exitosa
        try {
          if (period === UsagePeriod.LIFETIME) {
            await this.usageLimitsService.incrementLifetimeUsage(usageType, fingerprint);
          } else if (period === UsagePeriod.MONTHLY) {
            await this.usageLimitsService.incrementMonthlyUsage(usageType, user.id);
          } else {
            await this.usageLimitsService.incrementDailyUsage(usageType, user?.id, fingerprint);
          }
        } catch (error) {
          // Log pero no fallar - el usuario ya recibió su carta
          console.error("Failed to register usage:", error);
        }
      }),
    );
  }
}
```

```typescript
// Actualizar birth-chart.controller.ts para usar interceptor
import { UseInterceptors } from '@nestjs/common';
import { RegisterUsageInterceptor } from '../../../usage-limits/infrastructure/interceptors/register-usage.interceptor';

@Post('generate')
@UseGuards(OptionalJwtAuthGuard, CheckUsageLimitGuard)
@UseInterceptors(RegisterUsageInterceptor)  // 🆕 Agregar
@UsageType('BIRTH_CHART')
async generateChart(...) {
  // ...
}

@Post('generate/anonymous')
@UseGuards(CheckUsageLimitGuard)
@UseInterceptors(RegisterUsageInterceptor)  // 🆕 Agregar
@UsageType('BIRTH_CHART_ANONYMOUS')
async generateChartAnonymous(...) {
  // ...
}
```

**Criterios de aceptación:**

- [ ] Guard valida límites mensuales correctamente
- [ ] Guard valida límites lifetime para anónimos
- [ ] Interceptor registra uso después de éxito
- [ ] Mensajes de error diferenciados por plan
- [ ] Response incluye detalles del límite alcanzado
- [ ] Info de uso disponible en request para logging
- [ ] Tests de integración verificando límites
- [ ] Tests de edge cases (cambio de mes, etc.)

**Dependencias:** T-CA-022

**Estimación:** 3 horas

---

### T-CA-024: Crear Servicio de Geocodificación

**Historia relacionada:** HU-CA-012

**Descripción:**
Crear el servicio que convierte nombres de lugares en coordenadas geográficas (latitud, longitud) y obtiene la zona horaria correspondiente, necesario para calcular cartas astrales precisas.

**Ubicación:** `src/modules/birth-chart/application/services/`

**Archivos a crear:**

```
src/modules/birth-chart/
├── application/
│   └── services/
│       └── geocode.service.ts
└── infrastructure/
    └── cache/
        └── geocode-cache.service.ts
```

**Opciones de API de Geocoding:**

| Provider                | Pros                      | Contras                    | Costo             |
| ----------------------- | ------------------------- | -------------------------- | ----------------- |
| Google Places           | Muy preciso, autocomplete | Requiere billing           | $0.017/request    |
| OpenStreetMap Nominatim | Gratis, sin API key       | Menos preciso, rate limits | Gratis            |
| Mapbox                  | Buen balance              | Requiere API key           | 100k gratis/mes   |
| TimeZoneDB              | Solo timezone             | No tiene geocoding         | Gratis (limitado) |

**Recomendación:** Usar **Nominatim** (OpenStreetMap) para geocoding + **TimeZoneDB** para timezone. Ambos gratis.

**Implementación:**

```typescript
// geocode.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { GeocodeCacheService } from "../../infrastructure/cache/geocode-cache.service";
import { GeocodeSearchResponseDto, GeocodedPlaceDto } from "../dto";

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface TimezoneDBResult {
  status: string;
  message?: string;
  zoneName?: string;
  abbreviation?: string;
  gmtOffset?: number;
}

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  // URLs de APIs
  private readonly NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
  private readonly TIMEZONEDB_URL = "http://api.timezonedb.com/v2.1/get-time-zone";

  // Rate limiting: Nominatim requiere max 1 request/segundo
  private lastNominatimRequest = 0;
  private readonly NOMINATIM_RATE_LIMIT_MS = 1100; // 1.1 segundos

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: GeocodeCacheService,
  ) {}

  /**
   * Busca lugares por texto
   */
  async searchPlaces(query: string): Promise<GeocodeSearchResponseDto> {
    this.logger.debug(`Searching places for: ${query}`);

    // Verificar caché
    const cached = await this.cacheService.getSearchResults(query);
    if (cached) {
      this.logger.debug("Returning cached search results");
      return cached;
    }

    // Rate limiting
    await this.waitForRateLimit();

    try {
      const response = await firstValueFrom(
        this.httpService.get<NominatimResult[]>(this.NOMINATIM_URL, {
          params: {
            q: query,
            format: "json",
            addressdetails: 1,
            limit: 5,
            "accept-language": "es",
          },
          headers: {
            "User-Agent": "Auguria/1.0 (contact@auguria.com)", // Requerido por Nominatim
          },
        }),
      );

      const results: GeocodedPlaceDto[] = await Promise.all(
        response.data.map(async (result) => {
          const latitude = parseFloat(result.lat);
          const longitude = parseFloat(result.lon);

          // Obtener timezone
          const timezone = await this.getTimezone(latitude, longitude);

          return {
            placeId: `osm_${result.osm_type}_${result.osm_id}`,
            displayName: result.display_name,
            city: this.extractCity(result.address),
            country: result.address?.country || "",
            latitude,
            longitude,
            timezone,
          };
        }),
      );

      const responseDto: GeocodeSearchResponseDto = {
        results,
        count: results.length,
      };

      // Guardar en caché
      await this.cacheService.setSearchResults(query, responseDto);

      return responseDto;
    } catch (error) {
      this.logger.error("Error searching places:", error);
      throw new Error("No se pudo buscar el lugar. Intente de nuevo.");
    }
  }

  /**
   * Obtiene detalles de un lugar específico por coordenadas
   */
  async getPlaceDetails(latitude: number, longitude: number): Promise<GeocodedPlaceDto | null> {
    // Verificar caché
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const cached = await this.cacheService.getPlaceDetails(cacheKey);
    if (cached) {
      return cached;
    }

    await this.waitForRateLimit();

    try {
      // Reverse geocoding
      const response = await firstValueFrom(
        this.httpService.get<NominatimResult>("https://nominatim.openstreetmap.org/reverse", {
          params: {
            lat: latitude,
            lon: longitude,
            format: "json",
            addressdetails: 1,
            "accept-language": "es",
          },
          headers: {
            "User-Agent": "Auguria/1.0 (contact@auguria.com)",
          },
        }),
      );

      const result = response.data;
      const timezone = await this.getTimezone(latitude, longitude);

      const place: GeocodedPlaceDto = {
        placeId: `osm_${result.osm_type}_${result.osm_id}`,
        displayName: result.display_name,
        city: this.extractCity(result.address),
        country: result.address?.country || "",
        latitude,
        longitude,
        timezone,
      };

      await this.cacheService.setPlaceDetails(cacheKey, place);

      return place;
    } catch (error) {
      this.logger.error("Error getting place details:", error);
      return null;
    }
  }

  /**
   * Obtiene la zona horaria para unas coordenadas
   */
  async getTimezone(latitude: number, longitude: number): Promise<string> {
    const cacheKey = `tz_${latitude.toFixed(2)},${longitude.toFixed(2)}`;
    const cached = await this.cacheService.getTimezone(cacheKey);
    if (cached) {
      return cached;
    }

    const apiKey = this.configService.get<string>("TIMEZONEDB_API_KEY");

    if (!apiKey) {
      // Fallback: estimar timezone por longitud (muy impreciso pero funcional)
      this.logger.warn("No TIMEZONEDB_API_KEY configured, using fallback");
      return this.estimateTimezoneByLongitude(longitude);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<TimezoneDBResult>(this.TIMEZONEDB_URL, {
          params: {
            key: apiKey,
            format: "json",
            by: "position",
            lat: latitude,
            lng: longitude,
          },
        }),
      );

      if (response.data.status === "OK" && response.data.zoneName) {
        await this.cacheService.setTimezone(cacheKey, response.data.zoneName);
        return response.data.zoneName;
      }

      throw new Error(response.data.message || "Unknown error");
    } catch (error) {
      this.logger.error("Error getting timezone:", error);
      return this.estimateTimezoneByLongitude(longitude);
    }
  }

  /**
   * Extrae la ciudad del objeto address
   */
  private extractCity(address?: NominatimResult["address"]): string {
    if (!address) return "";
    return address.city || address.town || address.village || address.municipality || "";
  }

  /**
   * Estima timezone por longitud (fallback muy básico)
   */
  private estimateTimezoneByLongitude(longitude: number): string {
    // Cada 15 grados de longitud = 1 hora de diferencia con UTC
    const offsetHours = Math.round(longitude / 15);

    if (offsetHours === 0) return "UTC";
    if (offsetHours > 0) return `Etc/GMT-${offsetHours}`;
    return `Etc/GMT+${Math.abs(offsetHours)}`;
  }

  /**
   * Rate limiting para Nominatim
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastNominatimRequest;

    if (timeSinceLastRequest < this.NOMINATIM_RATE_LIMIT_MS) {
      const waitTime = this.NOMINATIM_RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastNominatimRequest = Date.now();
  }
}
```

```typescript
// geocode-cache.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { GeocodeSearchResponseDto, GeocodedPlaceDto } from "../../application/dto";

@Injectable()
export class GeocodeCacheService {
  // TTLs
  private readonly SEARCH_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días
  private readonly PLACE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días
  private readonly TIMEZONE_TTL = 365 * 24 * 60 * 60 * 1000; // 1 año

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // Search results
  async getSearchResults(query: string): Promise<GeocodeSearchResponseDto | null> {
    const key = `geocode:search:${this.normalizeQuery(query)}`;
    return this.cacheManager.get(key);
  }

  async setSearchResults(query: string, results: GeocodeSearchResponseDto): Promise<void> {
    const key = `geocode:search:${this.normalizeQuery(query)}`;
    await this.cacheManager.set(key, results, this.SEARCH_TTL);
  }

  // Place details
  async getPlaceDetails(coordKey: string): Promise<GeocodedPlaceDto | null> {
    const key = `geocode:place:${coordKey}`;
    return this.cacheManager.get(key);
  }

  async setPlaceDetails(coordKey: string, place: GeocodedPlaceDto): Promise<void> {
    const key = `geocode:place:${coordKey}`;
    await this.cacheManager.set(key, place, this.PLACE_TTL);
  }

  // Timezone
  async getTimezone(coordKey: string): Promise<string | null> {
    const key = `geocode:tz:${coordKey}`;
    return this.cacheManager.get(key);
  }

  async setTimezone(coordKey: string, timezone: string): Promise<void> {
    const key = `geocode:tz:${coordKey}`;
    await this.cacheManager.set(key, timezone, this.TIMEZONE_TTL);
  }

  /**
   * Normaliza query para usar como clave de caché
   */
  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, "_");
  }
}
```

**Variables de entorno necesarias:**

```env
# Opcional - si no está, usa estimación por longitud
TIMEZONEDB_API_KEY=your_api_key_here
```

**Criterios de aceptación:**

- [ ] Búsqueda de lugares con Nominatim funcionando
- [ ] Obtención de timezone con TimeZoneDB
- [ ] Fallback de timezone por longitud
- [ ] Rate limiting para Nominatim (1 req/seg)
- [ ] Caché de resultados de búsqueda (7 días)
- [ ] Caché de detalles de lugar (30 días)
- [ ] Caché de timezone (1 año)
- [ ] Reverse geocoding funcionando
- [ ] Manejo de errores robusto
- [ ] Tests unitarios con mocks de APIs
- [ ] Tests de integración

**Dependencias:** Ninguna

**Estimación:** 4 horas

---

### T-CA-025: Crear Panel Admin para Límites de Carta Astral

**Historia relacionada:** HU-CA-011

**Descripción:**
Extender el panel de administración existente para permitir configurar los límites de uso de cartas astrales por plan (Free y Premium).

**Ubicación:** `src/modules/admin/`

**Archivos a crear/modificar:**

```
src/modules/admin/
├── application/
│   └── services/
│       └── admin-limits.service.ts      # Extender
├── infrastructure/
│   └── controllers/
│       └── admin-limits.controller.ts   # Extender
└── application/
    └── dto/
        └── update-limits.dto.ts         # Extender
```

**Implementación:**

```typescript
// update-limits.dto.ts (extender)
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, Min, Max, IsOptional, IsEnum } from "class-validator";
import { UsageType } from "../../../usage-limits/domain/enums";

export class UpdateBirthChartLimitsDto {
  @ApiProperty({
    example: 3,
    description: "Límite mensual para usuarios Free",
  })
  @IsInt()
  @Min(0)
  @Max(100)
  freeLimit: number;

  @ApiProperty({
    example: 5,
    description: "Límite mensual para usuarios Premium",
  })
  @IsInt()
  @Min(0)
  @Max(100)
  premiumLimit: number;
}

export class UsageLimitConfigDto {
  @ApiProperty({ example: "birth_chart" })
  usageType: string;

  @ApiProperty({ example: "monthly" })
  period: string;

  @ApiProperty({
    example: { anonymous: 0, free: 3, premium: 5 },
  })
  limits: Record<string, number>;

  @ApiProperty({ example: "2026-02-06T12:00:00Z" })
  updatedAt: string;

  @ApiPropertyOptional({ example: "admin@auguria.com" })
  updatedBy?: string;
}
```

```typescript
// admin-limits.service.ts (extender)
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemConfig } from "../entities/system-config.entity"; // Si existe
import { UpdateBirthChartLimitsDto, UsageLimitConfigDto } from "../dto";
import { AuditLogService } from "./audit-log.service";
import { USAGE_LIMITS } from "../../../usage-limits/constants/usage-limits.constants";
import { UsageType } from "../../../usage-limits/domain/enums";
import { UserPlan } from "../../../users/enums/user-plan.enum";

@Injectable()
export class AdminLimitsService {
  private readonly logger = new Logger(AdminLimitsService.name);

  // Caché en memoria de límites configurables
  private limitsOverrides: Map<UsageType, Record<UserPlan, number>> = new Map();

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
    private readonly auditLog: AuditLogService,
  ) {
    this.loadLimitsFromDB();
  }

  /**
   * Carga límites personalizados desde DB al iniciar
   */
  private async loadLimitsFromDB(): Promise<void> {
    try {
      const configs = await this.configRepo.find({
        where: { category: "usage_limits" },
      });

      for (const config of configs) {
        const usageType = config.key as UsageType;
        const limits = JSON.parse(config.value);
        this.limitsOverrides.set(usageType, limits);
      }

      this.logger.log(`Loaded ${this.limitsOverrides.size} custom limit configs`);
    } catch (error) {
      this.logger.error("Failed to load limits from DB:", error);
    }
  }

  /**
   * Obtiene límite actual para un tipo y plan
   */
  getLimit(usageType: UsageType, plan: UserPlan): number {
    // Primero verificar overrides
    const override = this.limitsOverrides.get(usageType);
    if (override && override[plan] !== undefined) {
      return override[plan];
    }

    // Fallback a constantes
    return USAGE_LIMITS[usageType]?.[plan] ?? 0;
  }

  /**
   * Obtiene configuración actual de límites de carta astral
   */
  async getBirthChartLimits(): Promise<UsageLimitConfigDto> {
    const usageType = UsageType.BIRTH_CHART;

    return {
      usageType,
      period: "monthly",
      limits: {
        anonymous: 0, // No configurable
        free: this.getLimit(usageType, UserPlan.FREE),
        premium: this.getLimit(usageType, UserPlan.PREMIUM),
      },
      updatedAt: await this.getLastUpdateTime(usageType),
      updatedBy: await this.getLastUpdatedBy(usageType),
    };
  }

  /**
   * Actualiza límites de carta astral
   */
  async updateBirthChartLimits(
    dto: UpdateBirthChartLimitsDto,
    adminUserId: number,
    adminEmail: string,
  ): Promise<UsageLimitConfigDto> {
    const usageType = UsageType.BIRTH_CHART;

    const newLimits: Record<UserPlan, number> = {
      [UserPlan.ANONYMOUS]: 0, // Siempre 0 (usa BIRTH_CHART_ANONYMOUS)
      [UserPlan.FREE]: dto.freeLimit,
      [UserPlan.PREMIUM]: dto.premiumLimit,
    };

    // Guardar en DB
    const configKey = usageType;
    let config = await this.configRepo.findOne({
      where: { category: "usage_limits", key: configKey },
    });

    const previousValue = config?.value;

    if (config) {
      config.value = JSON.stringify(newLimits);
      config.updatedBy = adminEmail;
    } else {
      config = this.configRepo.create({
        category: "usage_limits",
        key: configKey,
        value: JSON.stringify(newLimits),
        updatedBy: adminEmail,
      });
    }

    await this.configRepo.save(config);

    // Actualizar caché en memoria
    this.limitsOverrides.set(usageType, newLimits);

    // Registrar en audit log
    await this.auditLog.log({
      action: "UPDATE_USAGE_LIMITS",
      entityType: "SystemConfig",
      entityId: config.id.toString(),
      userId: adminUserId,
      previousValue,
      newValue: JSON.stringify(newLimits),
      metadata: {
        usageType,
        freeLimit: dto.freeLimit,
        premiumLimit: dto.premiumLimit,
      },
    });

    this.logger.log(`Birth chart limits updated by ${adminEmail}: Free=${dto.freeLimit}, Premium=${dto.premiumLimit}`);

    return this.getBirthChartLimits();
  }

  /**
   * Obtiene historial de cambios de límites
   */
  async getLimitsHistory(usageType: UsageType): Promise<any[]> {
    return this.auditLog.getHistory({
      action: "UPDATE_USAGE_LIMITS",
      entityType: "SystemConfig",
      metadata: { usageType },
    });
  }

  /**
   * Helper: última fecha de actualización
   */
  private async getLastUpdateTime(usageType: UsageType): Promise<string> {
    const config = await this.configRepo.findOne({
      where: { category: "usage_limits", key: usageType },
    });
    return config?.updatedAt?.toISOString() || new Date().toISOString();
  }

  /**
   * Helper: último admin que actualizó
   */
  private async getLastUpdatedBy(usageType: UsageType): Promise<string | undefined> {
    const config = await this.configRepo.findOne({
      where: { category: "usage_limits", key: usageType },
    });
    return config?.updatedBy;
  }
}
```

```typescript
// admin-limits.controller.ts (extender)
import { Controller, Get, Put, Body, UseGuards, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../../../auth/guards/admin.guard";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AdminLimitsService } from "../../application/services/admin-limits.service";
import { UpdateBirthChartLimitsDto, UsageLimitConfigDto } from "../../application/dto";
import { User } from "../../../users/entities/user.entity";

@ApiTags("Admin - Usage Limits")
@Controller("admin/limits")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminLimitsController {
  private readonly logger = new Logger(AdminLimitsController.name);

  constructor(private readonly limitsService: AdminLimitsService) {}

  /**
   * GET /admin/limits/birth-chart
   * Obtiene configuración actual de límites de carta astral
   */
  @Get("birth-chart")
  @ApiOperation({
    summary: "Obtener límites de carta astral",
    description: "Obtiene la configuración actual de límites mensuales de carta astral por plan.",
  })
  @ApiResponse({ status: 200, type: UsageLimitConfigDto })
  async getBirthChartLimits(): Promise<UsageLimitConfigDto> {
    return this.limitsService.getBirthChartLimits();
  }

  /**
   * PUT /admin/limits/birth-chart
   * Actualiza límites de carta astral
   */
  @Put("birth-chart")
  @ApiOperation({
    summary: "Actualizar límites de carta astral",
    description: `Actualiza los límites mensuales de generación de cartas astrales.
    
**Nota:** El límite de usuarios anónimos (1 lifetime) no es configurable.`,
  })
  @ApiResponse({ status: 200, type: UsageLimitConfigDto })
  async updateBirthChartLimits(
    @Body() dto: UpdateBirthChartLimitsDto,
    @CurrentUser() admin: User,
  ): Promise<UsageLimitConfigDto> {
    this.logger.log(
      `Admin ${admin.email} updating birth chart limits: Free=${dto.freeLimit}, Premium=${dto.premiumLimit}`,
    );

    return this.limitsService.updateBirthChartLimits(dto, admin.id, admin.email);
  }

  /**
   * GET /admin/limits/birth-chart/history
   * Historial de cambios de límites
   */
  @Get("birth-chart/history")
  @ApiOperation({
    summary: "Historial de cambios de límites",
    description: "Obtiene el historial de cambios en la configuración de límites.",
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 1,
          action: "UPDATE_USAGE_LIMITS",
          previousValue: '{"free":3,"premium":5}',
          newValue: '{"free":5,"premium":10}',
          userId: 1,
          userEmail: "admin@auguria.com",
          createdAt: "2026-02-06T12:00:00Z",
        },
      ],
    },
  })
  async getLimitsHistory() {
    return this.limitsService.getLimitsHistory(UsageType.BIRTH_CHART);
  }
}
```

**Entidad SystemConfig (si no existe):**

```typescript
// system-config.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from "typeorm";

@Entity("system_config")
@Unique("uq_system_config", ["category", "key"])
@Index("idx_system_config_category", ["category"])
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  category: string;

  @Column({ type: "varchar", length: 100 })
  key: string;

  @Column({ type: "text" })
  value: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Criterios de aceptación:**

- [ ] Endpoint GET para obtener límites actuales
- [ ] Endpoint PUT para actualizar límites
- [ ] Endpoint GET para historial de cambios
- [ ] Límite de anónimos (1 lifetime) NO configurable
- [ ] Cambios aplicados inmediatamente (caché en memoria)
- [ ] Persistencia en DB para sobrevivir reinicios
- [ ] Auditoría de cambios
- [ ] Protegido con AdminGuard
- [ ] Documentación Swagger completa
- [ ] Tests de integración

**Dependencias:** T-CA-022, T-CA-023

**Estimación:** 3 horas

---

## CHECKLIST DE PARTE 7F

- [ ] T-CA-021: Análisis del sistema de límites completado
- [ ] T-CA-022: Sistema extendido para límites mensuales
- [ ] T-CA-023: Límites de carta astral integrados
- [ ] T-CA-024: Servicio de geocodificación funcionando
- [ ] T-CA-025: Panel admin para límites configurado

---

## DIAGRAMA DE FLUJO DE LÍMITES

```
Usuario solicita generar carta
           │
           ▼
┌─────────────────────────────┐
│   CheckUsageLimitGuard      │
│                             │
│  1. Obtener usageType       │
│  2. Determinar período      │
│  3. Consultar uso actual    │
│  4. Comparar con límite     │
└─────────────────────────────┘
           │
           ├── Límite alcanzado ──► HTTP 429 + mensaje
           │
           ▼
┌─────────────────────────────┐
│   Controlador ejecuta       │
│   BirthChartFacade          │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   RegisterUsageInterceptor  │
│                             │
│  Solo si respuesta exitosa: │
│  - incrementMonthlyUsage()  │
│  - o incrementLifetimeUsage │
└─────────────────────────────┘
           │
           ▼
      Respuesta al usuario
```

---

## PRÓXIMOS PASOS

**Siguiente parte:** PARTE-7G - Tareas de Frontend: Componentes Base y Formulario

---

**FIN DE PARTE 7F - TAREAS DE SISTEMA DE LÍMITES Y GEOCODING**

# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7G: TAREAS DE FRONTEND - COMPONENTES BASE Y FORMULARIO

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.0  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## RESUMEN DE PARTE 7G

Esta parte cubre la creación de los componentes base de React y el formulario de entrada de datos de nacimiento para generar cartas astrales.

**Stack Frontend:** Next.js 14 (App Router) + TanStack Query + Zustand + shadcn/ui + Tailwind CSS

| Tarea    | Título                                        | Tipo     | Prioridad | Estimación |
| -------- | --------------------------------------------- | -------- | --------- | ---------- |
| T-CA-026 | Crear tipos TypeScript del módulo             | Frontend | Must      | 2h         |
| T-CA-027 | Crear hooks de API para carta astral          | Frontend | Must      | 3h         |
| T-CA-028 | Crear componente de autocompletado de lugares | Frontend | Must      | 4h         |
| T-CA-029 | Crear formulario de datos de nacimiento       | Frontend | Must      | 4h         |
| T-CA-030 | Crear página principal de carta astral        | Frontend | Must      | 3h         |

**Total estimado:** 16 horas

---

## DETALLE DE TAREAS

### T-CA-026: Crear Tipos TypeScript del Módulo

**Historia relacionada:** Todas

**Descripción:**
Definir todos los tipos e interfaces TypeScript necesarios para el módulo de carta astral en el frontend, alineados con los DTOs del backend.

**Ubicación:** `src/features/birth-chart/types/`

**Archivos a crear:**

```
src/features/birth-chart/
└── types/
    ├── index.ts
    ├── chart.types.ts
    ├── interpretation.types.ts
    ├── geocode.types.ts
    └── api.types.ts
```

**Implementación:**

```typescript
// chart.types.ts
import { ZodiacSign, Planet, AspectType, House } from "./enums";

/**
 * Posición de un planeta
 */
export interface PlanetPosition {
  planet: Planet;
  sign: ZodiacSign;
  signName: string;
  signDegree: number;
  formattedPosition: string;
  house: number;
  isRetrograde: boolean;
}

/**
 * Cúspide de casa
 */
export interface HouseCusp {
  house: House;
  sign: ZodiacSign;
  signName: string;
  signDegree: number;
  formattedPosition: string;
}

/**
 * Aspecto entre planetas
 */
export interface ChartAspect {
  planet1: Planet;
  planet1Name: string;
  planet2: Planet;
  planet2Name: string;
  aspectType: AspectType;
  aspectName: string;
  aspectSymbol: string;
  orb: number;
  isApplying: boolean;
}

/**
 * Distribución de elementos y modalidades
 */
export interface ChartDistribution {
  elements: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  modalities: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Datos para renderizar el gráfico SVG
 */
export interface ChartSvgData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: ChartAspect[];
}

/**
 * Datos de nacimiento (input del formulario)
 */
export interface BirthData {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Carta guardada (para historial)
 */
export interface SavedChart {
  id: number;
  name: string;
  birthDate: string;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  createdAt: string;
}
```

```typescript
// interpretation.types.ts
import { ZodiacSign, Planet, AspectType } from "./enums";

/**
 * Interpretación del Big Three
 */
export interface BigThreeInterpretation {
  sun: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  moon: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
  ascendant: {
    sign: ZodiacSign;
    signName: string;
    interpretation: string;
  };
}

/**
 * Interpretación de un aspecto
 */
export interface AspectInterpretation {
  aspectName: string;
  withPlanet: string;
  interpretation?: string;
}

/**
 * Interpretación de un planeta
 */
export interface PlanetInterpretation {
  planet: Planet;
  planetName: string;
  intro?: string;
  inSign?: string;
  inHouse?: string;
  aspects?: AspectInterpretation[];
}

/**
 * Informe de interpretaciones completo
 */
export interface FullInterpretation {
  planets: PlanetInterpretation[];
}

/**
 * Síntesis generada por IA
 */
export interface AISynthesis {
  content: string;
  generatedAt: string;
  provider: string;
}
```

```typescript
// geocode.types.ts

/**
 * Lugar geocodificado
 */
export interface GeocodedPlace {
  placeId: string;
  displayName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Respuesta de búsqueda de lugares
 */
export interface GeocodeSearchResponse {
  results: GeocodedPlace[];
  count: number;
}
```

```typescript
// api.types.ts
import { PlanetPosition, HouseCusp, ChartAspect, ChartDistribution, ChartSvgData, SavedChart } from "./chart.types";
import { BigThreeInterpretation, FullInterpretation, AISynthesis } from "./interpretation.types";

/**
 * Request para generar carta
 */
export interface GenerateChartRequest {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Respuesta básica (Anónimos)
 */
export interface BasicChartResponse {
  success: boolean;
  chartSvgData: ChartSvgData;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: ChartAspect[];
  bigThree: BigThreeInterpretation;
  calculationTimeMs: number;
}

/**
 * Respuesta completa (Free)
 */
export interface FullChartResponse extends BasicChartResponse {
  distribution: ChartDistribution;
  interpretations: FullInterpretation;
  canDownloadPdf: boolean;
}

/**
 * Respuesta Premium
 */
export interface PremiumChartResponse extends FullChartResponse {
  savedChartId?: number;
  aiSynthesis: AISynthesis;
  canAccessHistory: boolean;
}

/**
 * Unión de tipos de respuesta
 */
export type ChartResponse = BasicChartResponse | FullChartResponse | PremiumChartResponse;

/**
 * Type guards para diferenciar respuestas
 */
export function isFullChartResponse(response: ChartResponse): response is FullChartResponse {
  return "distribution" in response && "interpretations" in response;
}

export function isPremiumChartResponse(response: ChartResponse): response is PremiumChartResponse {
  return "aiSynthesis" in response;
}

/**
 * Estado de uso
 */
export interface UsageStatus {
  plan: "anonymous" | "free" | "premium";
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string | null;
  canGenerate: boolean;
}

/**
 * Respuesta de historial
 */
export interface ChartHistoryResponse {
  charts: SavedChart[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Error de API
 */
export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: {
    usageType?: string;
    period?: string;
    used?: number;
    limit?: number;
    remaining?: number;
  };
}
```

```typescript
// enums.ts
export enum ZodiacSign {
  ARIES = "aries",
  TAURUS = "taurus",
  GEMINI = "gemini",
  CANCER = "cancer",
  LEO = "leo",
  VIRGO = "virgo",
  LIBRA = "libra",
  SCORPIO = "scorpio",
  SAGITTARIUS = "sagittarius",
  CAPRICORN = "capricorn",
  AQUARIUS = "aquarius",
  PISCES = "pisces",
}

export enum Planet {
  SUN = "sun",
  MOON = "moon",
  MERCURY = "mercury",
  VENUS = "venus",
  MARS = "mars",
  JUPITER = "jupiter",
  SATURN = "saturn",
  URANUS = "uranus",
  NEPTUNE = "neptune",
  PLUTO = "pluto",
}

export enum AspectType {
  CONJUNCTION = "conjunction",
  OPPOSITION = "opposition",
  SQUARE = "square",
  TRINE = "trine",
  SEXTILE = "sextile",
}

export type House = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Metadata de signos zodiacales
 */
export const ZODIAC_SIGNS: Record<ZodiacSign, { name: string; symbol: string; element: string }> = {
  [ZodiacSign.ARIES]: { name: "Aries", symbol: "♈", element: "fire" },
  [ZodiacSign.TAURUS]: { name: "Tauro", symbol: "♉", element: "earth" },
  [ZodiacSign.GEMINI]: { name: "Géminis", symbol: "♊", element: "air" },
  [ZodiacSign.CANCER]: { name: "Cáncer", symbol: "♋", element: "water" },
  [ZodiacSign.LEO]: { name: "Leo", symbol: "♌", element: "fire" },
  [ZodiacSign.VIRGO]: { name: "Virgo", symbol: "♍", element: "earth" },
  [ZodiacSign.LIBRA]: { name: "Libra", symbol: "♎", element: "air" },
  [ZodiacSign.SCORPIO]: { name: "Escorpio", symbol: "♏", element: "water" },
  [ZodiacSign.SAGITTARIUS]: { name: "Sagitario", symbol: "♐", element: "fire" },
  [ZodiacSign.CAPRICORN]: { name: "Capricornio", symbol: "♑", element: "earth" },
  [ZodiacSign.AQUARIUS]: { name: "Acuario", symbol: "♒", element: "air" },
  [ZodiacSign.PISCES]: { name: "Piscis", symbol: "♓", element: "water" },
};

/**
 * Metadata de planetas
 */
export const PLANETS: Record<Planet, { name: string; symbol: string }> = {
  [Planet.SUN]: { name: "Sol", symbol: "☉" },
  [Planet.MOON]: { name: "Luna", symbol: "☽" },
  [Planet.MERCURY]: { name: "Mercurio", symbol: "☿" },
  [Planet.VENUS]: { name: "Venus", symbol: "♀" },
  [Planet.MARS]: { name: "Marte", symbol: "♂" },
  [Planet.JUPITER]: { name: "Júpiter", symbol: "♃" },
  [Planet.SATURN]: { name: "Saturno", symbol: "♄" },
  [Planet.URANUS]: { name: "Urano", symbol: "♅" },
  [Planet.NEPTUNE]: { name: "Neptuno", symbol: "♆" },
  [Planet.PLUTO]: { name: "Plutón", symbol: "♇" },
};

/**
 * Metadata de aspectos
 */
export const ASPECTS: Record<
  AspectType,
  { name: string; symbol: string; nature: "harmonious" | "challenging" | "neutral" }
> = {
  [AspectType.CONJUNCTION]: { name: "Conjunción", symbol: "☌", nature: "neutral" },
  [AspectType.OPPOSITION]: { name: "Oposición", symbol: "☍", nature: "challenging" },
  [AspectType.SQUARE]: { name: "Cuadratura", symbol: "□", nature: "challenging" },
  [AspectType.TRINE]: { name: "Trígono", symbol: "△", nature: "harmonious" },
  [AspectType.SEXTILE]: { name: "Sextil", symbol: "⚹", nature: "harmonious" },
};
```

```typescript
// index.ts
export * from "./chart.types";
export * from "./interpretation.types";
export * from "./geocode.types";
export * from "./api.types";
export * from "./enums";
```

**Criterios de aceptación:**

- [ ] Tipos de posiciones planetarias definidos
- [ ] Tipos de casas y aspectos definidos
- [ ] Tipos de interpretaciones definidos
- [ ] Tipos de geocoding definidos
- [ ] Tipos de request/response de API definidos
- [ ] Type guards para diferenciar respuestas
- [ ] Enums con metadata (nombres, símbolos)
- [ ] Exportación centralizada en index.ts
- [ ] Alineación con DTOs del backend

**Dependencias:** Ninguna

**Estimación:** 2 horas

---

### T-CA-027: Crear Hooks de API para Carta Astral

**Historia relacionada:** HU-CA-001, HU-CA-007, HU-CA-008, HU-CA-009

**Descripción:**
Crear los hooks de TanStack Query para interactuar con la API de carta astral: generación, PDF, historial y geocoding.

**Ubicación:** `src/features/birth-chart/hooks/`

**Archivos a crear:**

```
src/features/birth-chart/
└── hooks/
    ├── index.ts
    ├── useGenerateChart.ts
    ├── useChartHistory.ts
    ├── useGeocodeSearch.ts
    ├── useUsageStatus.ts
    └── useDownloadPdf.ts
```

**Implementación:**

```typescript
// useGenerateChart.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GenerateChartRequest, ChartResponse, ApiError } from "../types";

interface UseGenerateChartOptions {
  onSuccess?: (data: ChartResponse) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook para generar una carta astral
 */
export function useGenerateChart(options?: UseGenerateChartOptions) {
  const queryClient = useQueryClient();

  return useMutation<ChartResponse, ApiError, GenerateChartRequest>({
    mutationFn: async (data) => {
      const response = await api.post<ChartResponse>("/birth-chart/generate", data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar cache de uso
      queryClient.invalidateQueries({ queryKey: ["birth-chart", "usage"] });

      // Invalidar historial si es Premium
      if ("savedChartId" in data) {
        queryClient.invalidateQueries({ queryKey: ["birth-chart", "history"] });
      }

      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook para generar carta anónima
 */
export function useGenerateChartAnonymous(options?: UseGenerateChartOptions) {
  return useMutation<ChartResponse, ApiError, GenerateChartRequest>({
    mutationFn: async (data) => {
      const response = await api.post<ChartResponse>("/birth-chart/generate/anonymous", data);
      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
```

```typescript
// useChartHistory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ChartHistoryResponse, PremiumChartResponse, SavedChart } from "../types";

interface UseChartHistoryOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook para obtener historial de cartas (Premium)
 */
export function useChartHistory(options: UseChartHistoryOptions = {}) {
  const { page = 1, limit = 10, enabled = true } = options;

  return useQuery<ChartHistoryResponse>({
    queryKey: ["birth-chart", "history", { page, limit }],
    queryFn: async () => {
      const response = await api.get<ChartHistoryResponse>("/birth-chart/history", {
        params: { page, limit },
      });
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener una carta guardada por ID
 */
export function useSavedChart(chartId: number | null) {
  return useQuery<PremiumChartResponse>({
    queryKey: ["birth-chart", "history", chartId],
    queryFn: async () => {
      const response = await api.get<PremiumChartResponse>(`/birth-chart/history/${chartId}`);
      return response.data;
    },
    enabled: !!chartId,
    staleTime: 30 * 60 * 1000, // 30 minutos (datos no cambian)
  });
}

/**
 * Hook para renombrar una carta guardada
 */
export function useRenameChart() {
  const queryClient = useQueryClient();

  return useMutation<{ id: number; name: string }, Error, { chartId: number; name: string }>({
    mutationFn: async ({ chartId, name }) => {
      const response = await api.post(`/birth-chart/history/${chartId}/name`, { name });
      return response.data;
    },
    onSuccess: (data) => {
      // Actualizar el cache del historial
      queryClient.invalidateQueries({ queryKey: ["birth-chart", "history"] });

      // Actualizar el cache de la carta específica
      queryClient.setQueryData<PremiumChartResponse>(["birth-chart", "history", data.id], (old) =>
        old ? { ...old, name: data.name } : old,
      );
    },
  });
}

/**
 * Hook para eliminar una carta guardada
 */
export function useDeleteChart() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (chartId) => {
      await api.delete(`/birth-chart/history/${chartId}`);
    },
    onSuccess: (_, chartId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: ["birth-chart", "history", chartId] });

      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: ["birth-chart", "history"] });
    },
  });
}
```

```typescript
// useGeocodeSearch.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GeocodeSearchResponse } from "../types";
import { useDebounce } from "@/hooks/useDebounce";

interface UseGeocodeSearchOptions {
  query: string;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook para buscar lugares con debounce
 */
export function useGeocodeSearch(options: UseGeocodeSearchOptions) {
  const { query, enabled = true, debounceMs = 300 } = options;

  // Debounce del query para no hacer muchas requests
  const debouncedQuery = useDebounce(query, debounceMs);

  return useQuery<GeocodeSearchResponse>({
    queryKey: ["geocode", "search", debouncedQuery],
    queryFn: async () => {
      const response = await api.get<GeocodeSearchResponse>("/birth-chart/geocode", {
        params: { query: debouncedQuery },
      });
      return response.data;
    },
    enabled: enabled && debouncedQuery.length >= 3,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 días (lugares no cambian)
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 días en cache
  });
}
```

```typescript
// useUsageStatus.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UsageStatus } from "../types";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Hook para obtener estado de uso de cartas astrales
 */
export function useUsageStatus() {
  const { isAuthenticated } = useAuth();

  return useQuery<UsageStatus>({
    queryKey: ["birth-chart", "usage"],
    queryFn: async () => {
      const response = await api.get<UsageStatus>("/birth-chart/usage");
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook helper para verificar si puede generar
 */
export function useCanGenerateChart(): {
  canGenerate: boolean;
  remaining: number;
  isLoading: boolean;
  message?: string;
} {
  const { data, isLoading } = useUsageStatus();

  if (isLoading || !data) {
    return { canGenerate: false, remaining: 0, isLoading };
  }

  let message: string | undefined;
  if (!data.canGenerate) {
    if (data.plan === "anonymous") {
      message = "Ya utilizaste tu carta gratuita. Regístrate para obtener más.";
    } else if (data.plan === "free") {
      message = `Has alcanzado el límite de ${data.limit} cartas este mes.`;
    } else {
      message = `Has alcanzado el límite de ${data.limit} cartas este mes.`;
    }
  }

  return {
    canGenerate: data.canGenerate,
    remaining: data.remaining,
    isLoading: false,
    message,
  };
}
```

```typescript
// useDownloadPdf.ts
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GenerateChartRequest } from "../types";

/**
 * Hook para descargar PDF de una carta nueva
 */
export function useDownloadPdf() {
  return useMutation<Blob, Error, GenerateChartRequest>({
    mutationFn: async (data) => {
      const response = await api.post("/birth-chart/pdf", data, {
        responseType: "blob",
      });
      return response.data;
    },
    onSuccess: (blob, variables) => {
      // Crear URL y trigger descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carta-astral-${variables.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook para descargar PDF de una carta guardada
 */
export function useDownloadSavedChartPdf() {
  return useMutation<Blob, Error, { chartId: number; chartName: string }>({
    mutationFn: async ({ chartId }) => {
      const response = await api.get(`/birth-chart/history/${chartId}/pdf`, {
        responseType: "blob",
      });
      return response.data;
    },
    onSuccess: (blob, { chartName }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carta-astral-${chartName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
```

```typescript
// index.ts
export * from "./useGenerateChart";
export * from "./useChartHistory";
export * from "./useGeocodeSearch";
export * from "./useUsageStatus";
export * from "./useDownloadPdf";
```

**Criterios de aceptación:**

- [ ] Hook useGenerateChart con manejo de éxito/error
- [ ] Hook useGenerateChartAnonymous para no autenticados
- [ ] Hook useChartHistory con paginación
- [ ] Hook useSavedChart para detalle
- [ ] Hooks useRenameChart y useDeleteChart con invalidación de cache
- [ ] Hook useGeocodeSearch con debounce
- [ ] Hook useUsageStatus con refetch automático
- [ ] Hook useDownloadPdf con trigger de descarga
- [ ] Invalidación de cache correcta tras mutaciones
- [ ] Tiempos de stale/gc apropiados para cada query
- [ ] Tests unitarios

**Dependencias:** T-CA-026

**Estimación:** 3 horas

---

### T-CA-028: Crear Componente de Autocompletado de Lugares

**Historia relacionada:** HU-CA-012

**Descripción:**
Crear un componente de autocompletado para seleccionar el lugar de nacimiento, que busque lugares mientras el usuario escribe y muestre sugerencias.

**Ubicación:** `src/features/birth-chart/components/`

**Archivos a crear:**

```
src/features/birth-chart/
└── components/
    ├── index.ts
    └── PlaceAutocomplete/
        ├── index.ts
        ├── PlaceAutocomplete.tsx
        └── PlaceAutocomplete.module.css (opcional)
```

**Implementación:**

```tsx
// PlaceAutocomplete.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useGeocodeSearch } from "../../hooks";
import { GeocodedPlace } from "../../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceAutocompleteProps {
  value: GeocodedPlace | null;
  onChange: (place: GeocodedPlace | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  label?: string;
  id?: string;
}

export function PlaceAutocomplete({
  value,
  onChange,
  placeholder = "Ej: Buenos Aires, Argentina",
  disabled = false,
  error,
  required = false,
  label = "Lugar de nacimiento",
  id = "birth-place",
}: PlaceAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value?.displayName || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Búsqueda con debounce
  const { data, isLoading, isFetching } = useGeocodeSearch({
    query: inputValue,
    enabled: open && inputValue.length >= 3,
  });

  // Sincronizar input con valor seleccionado
  useEffect(() => {
    if (value) {
      setInputValue(value.displayName);
    }
  }, [value]);

  // Manejar selección de lugar
  const handleSelect = useCallback(
    (place: GeocodedPlace) => {
      onChange(place);
      setInputValue(place.displayName);
      setOpen(false);
    },
    [onChange],
  );

  // Limpiar selección
  const handleClear = useCallback(() => {
    onChange(null);
    setInputValue("");
    inputRef.current?.focus();
  }, [onChange]);

  // Manejar cambio en input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Si borramos todo o cambiamos el texto, limpiar selección
    if (value && newValue !== value.displayName) {
      onChange(null);
    }

    // Abrir popover si hay suficientes caracteres
    if (newValue.length >= 3) {
      setOpen(true);
    }
  };

  // Renderizar contenido del popover
  const renderResults = () => {
    if (isLoading || isFetching) {
      return (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Buscando lugares...
        </div>
      );
    }

    if (!data?.results.length) {
      return (
        <CommandEmpty>
          No se encontraron lugares.
          <br />
          <span className="text-xs text-muted-foreground">Intenta con otro nombre o agrega el país.</span>
        </CommandEmpty>
      );
    }

    return (
      <CommandGroup heading="Lugares encontrados">
        {data.results.map((place) => (
          <CommandItem
            key={place.placeId}
            value={place.placeId}
            onSelect={() => handleSelect(place)}
            className="cursor-pointer"
          >
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">{place.city || place.displayName.split(",")[0]}</span>
              <span className="text-xs text-muted-foreground">
                {place.country}
                {place.timezone && ` • ${place.timezone}`}
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              id={id}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => inputValue.length >= 3 && setOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "pl-10 pr-10",
                error && "border-destructive focus-visible:ring-destructive",
                value && "pr-10",
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar selección"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>{renderResults()}</CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Mostrar lugar seleccionado */}
      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            Coordenadas: {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
          </span>
          <span>•</span>
          <span>Zona: {value.timezone}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
```

```tsx
// index.ts
export { PlaceAutocomplete } from "./PlaceAutocomplete";
```

**Criterios de aceptación:**

- [ ] Input con ícono de búsqueda
- [ ] Popover con resultados mientras escribe
- [ ] Debounce de 300ms en búsqueda
- [ ] Mínimo 3 caracteres para buscar
- [ ] Indicador de carga durante búsqueda
- [ ] Mensaje cuando no hay resultados
- [ ] Selección de lugar actualiza el input
- [ ] Botón para limpiar selección
- [ ] Muestra coordenadas y timezone del lugar seleccionado
- [ ] Soporte para error y required
- [ ] Accesibilidad (aria labels, keyboard navigation)
- [ ] Responsive design
- [ ] Tests de componente

**Dependencias:** T-CA-027

**Estimación:** 4 horas

---

### T-CA-029: Crear Formulario de Datos de Nacimiento

**Historia relacionada:** HU-CA-001, HU-CA-012

**Descripción:**
Crear el formulario completo para ingresar los datos de nacimiento necesarios para generar una carta astral: nombre, fecha, hora y lugar.

**Ubicación:** `src/features/birth-chart/components/`

**Archivos a crear:**

```
src/features/birth-chart/
└── components/
    ├── index.ts
    ├── PlaceAutocomplete/
    └── BirthDataForm/
        ├── index.ts
        ├── BirthDataForm.tsx
        ├── BirthDataForm.schema.ts
        └── BirthDataForm.types.ts
```

**Implementación:**

```typescript
// BirthDataForm.schema.ts
import { z } from "zod";

export const birthDataSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido")
    .refine((date) => {
      const parsed = new Date(date);
      const now = new Date();
      return parsed <= now;
    }, "La fecha no puede ser futura")
    .refine((date) => {
      const parsed = new Date(date);
      return parsed.getFullYear() >= 1900;
    }, "La fecha debe ser posterior a 1900"),

  birthTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),

  birthPlace: z.string().min(1, "Selecciona un lugar de nacimiento"),

  latitude: z.number().min(-90, "Latitud inválida").max(90, "Latitud inválida"),

  longitude: z.number().min(-180, "Longitud inválida").max(180, "Longitud inválida"),

  timezone: z.string().min(1, "Zona horaria requerida"),
});

export type BirthDataFormValues = z.infer<typeof birthDataSchema>;
```

```tsx
// BirthDataForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, User, Sparkles, Info } from "lucide-react";

import { birthDataSchema, BirthDataFormValues } from "./BirthDataForm.schema";
import { PlaceAutocomplete } from "../PlaceAutocomplete";
import { GeocodedPlace } from "../../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface BirthDataFormProps {
  onSubmit: (data: BirthDataFormValues) => void;
  isLoading?: boolean;
  disabled?: boolean;
  showUsageWarning?: boolean;
  usageMessage?: string;
  defaultValues?: Partial<BirthDataFormValues>;
}

export function BirthDataForm({
  onSubmit,
  isLoading = false,
  disabled = false,
  showUsageWarning = false,
  usageMessage,
  defaultValues,
}: BirthDataFormProps) {
  const form = useForm<BirthDataFormValues>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
      ...defaultValues,
    },
  });

  // Manejar selección de lugar
  const handlePlaceSelect = (place: GeocodedPlace | null) => {
    if (place) {
      form.setValue("birthPlace", place.displayName, { shouldValidate: true });
      form.setValue("latitude", place.latitude, { shouldValidate: true });
      form.setValue("longitude", place.longitude, { shouldValidate: true });
      form.setValue("timezone", place.timezone, { shouldValidate: true });
    } else {
      form.setValue("birthPlace", "");
      form.setValue("latitude", 0);
      form.setValue("longitude", 0);
      form.setValue("timezone", "");
    }
  };

  // Obtener lugar actual del form para el autocomplete
  const currentPlace: GeocodedPlace | null = form.watch("birthPlace")
    ? {
        placeId: "",
        displayName: form.watch("birthPlace"),
        city: "",
        country: "",
        latitude: form.watch("latitude"),
        longitude: form.watch("longitude"),
        timezone: form.watch("timezone"),
      }
    : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Alerta de uso */}
        {showUsageWarning && usageMessage && (
          <Alert variant="warning">
            <Info className="h-4 w-4" />
            <AlertDescription>{usageMessage}</AlertDescription>
          </Alert>
        )}

        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...field} placeholder="Ej: María García" className="pl-10" disabled={disabled} />
                </div>
              </FormControl>
              <FormDescription>Nombre para identificar la carta astral</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha y Hora en fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha de nacimiento */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Fecha de nacimiento <span className="text-destructive">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={disabled}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP", { locale: es }) : "Selecciona fecha"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
                        }
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      locale={es}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hora de nacimiento */}
          <FormField
            control={form.control}
            name="birthTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  Hora de nacimiento <span className="text-destructive">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          La hora exacta es crucial para calcular el Ascendente y las casas astrológicas. Si no conoces
                          la hora exacta, puedes usar 12:00 (mediodía).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input {...field} type="time" className="pl-10" disabled={disabled} />
                  </div>
                </FormControl>
                <FormDescription>Formato 24 horas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Lugar de nacimiento (autocomplete) */}
        <FormField
          control={form.control}
          name="birthPlace"
          render={({ field }) => (
            <FormItem>
              <PlaceAutocomplete
                value={currentPlace}
                onChange={handlePlaceSelect}
                disabled={disabled}
                error={form.formState.errors.birthPlace?.message}
                required
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos ocultos para lat/lon/tz */}
        <input type="hidden" {...form.register("latitude")} />
        <input type="hidden" {...form.register("longitude")} />
        <input type="hidden" {...form.register("timezone")} />

        {/* Botón de submit */}
        <Button type="submit" className="w-full" size="lg" disabled={disabled || isLoading || !form.formState.isValid}>
          {isLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              Generando carta astral...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar mi carta astral
            </>
          )}
        </Button>

        {/* Info adicional */}
        <p className="text-xs text-center text-muted-foreground">
          La precisión de la carta depende de la exactitud de los datos ingresados, especialmente la hora de nacimiento.
        </p>
      </form>
    </Form>
  );
}
```

```tsx
// index.ts
export { BirthDataForm } from "./BirthDataForm";
export { birthDataSchema, type BirthDataFormValues } from "./BirthDataForm.schema";
```

**Criterios de aceptación:**

- [ ] Campo de nombre con validación
- [ ] Selector de fecha con calendario
- [ ] Límite de fechas (1900 - hoy)
- [ ] Campo de hora tipo time input
- [ ] Tooltip explicando importancia de hora
- [ ] Integración con PlaceAutocomplete
- [ ] Campos ocultos para lat/lon/timezone
- [ ] Validación con Zod
- [ ] Estados de loading y disabled
- [ ] Alerta de uso cuando aplique
- [ ] Responsive (1 columna mobile, 2 columnas desktop para fecha/hora)
- [ ] Accesibilidad completa
- [ ] Tests de componente

**Dependencias:** T-CA-028

**Estimación:** 4 horas

---

### T-CA-030: Crear Página Principal de Carta Astral

**Historia relacionada:** HU-CA-001

**Descripción:**
Crear la página principal del módulo de carta astral que contiene el formulario, muestra el estado de uso y maneja la navegación al resultado.

**Ubicación:** `src/app/(main)/carta-astral/`

**Archivos a crear:**

```
src/app/(main)/carta-astral/
├── page.tsx
├── layout.tsx
└── loading.tsx
```

**Implementación:**

```tsx
// layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carta Astral | Auguria",
  description:
    "Descubre tu carta astral natal. Conoce la posición de los planetas en el momento de tu nacimiento y obtén interpretaciones personalizadas.",
  openGraph: {
    title: "Carta Astral | Auguria",
    description: "Descubre tu carta astral natal. Conoce la posición de los planetas en el momento de tu nacimiento.",
    images: ["/og/carta-astral.png"],
  },
};

export default function BirthChartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

```tsx
// loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function BirthChartLoading() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-4 mt-8">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
```

```tsx
// page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Sparkles, Crown, AlertCircle } from "lucide-react";

import { BirthDataForm, BirthDataFormValues } from "@/features/birth-chart/components";
import { useGenerateChart, useGenerateChartAnonymous, useCanGenerateChart } from "@/features/birth-chart/hooks";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useBirthChartStore } from "@/features/birth-chart/store";
import { ChartResponse, isPremiumChartResponse } from "@/features/birth-chart/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BirthChartPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { canGenerate, remaining, isLoading: usageLoading, message: usageMessage } = useCanGenerateChart();
  const { setChartResult, setFormData } = useBirthChartStore();

  // Usar el hook apropiado según autenticación
  const generateChart = useGenerateChart({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const generateChartAnonymous = useGenerateChartAnonymous({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const [error, setError] = useState<string | null>(null);

  function handleSuccess(data: ChartResponse) {
    // Guardar resultado en store
    setChartResult(data);

    // Si es Premium y se guardó, redirigir al ID
    if (isPremiumChartResponse(data) && data.savedChartId) {
      router.push(`/carta-astral/resultado/${data.savedChartId}`);
    } else {
      // Para otros planes, ir a resultado temporal
      router.push("/carta-astral/resultado");
    }
  }

  function handleError(error: any) {
    if (error.statusCode === 429) {
      setError(error.message || "Has alcanzado el límite de uso.");
    } else {
      setError("Error al generar la carta astral. Por favor intenta de nuevo.");
    }
  }

  function handleSubmit(data: BirthDataFormValues) {
    setError(null);
    setFormData(data);

    const request = {
      name: data.name,
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      birthPlace: data.birthPlace,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    };

    if (isAuthenticated) {
      generateChart.mutate(request);
    } else {
      generateChartAnonymous.mutate(request);
    }
  }

  const isSubmitting = generateChart.isPending || generateChartAnonymous.isPending;

  return (
    <div className="container max-w-2xl py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Carta Astral</h1>
        <p className="text-muted-foreground mt-2">Descubre el mapa del cielo en el momento de tu nacimiento</p>
      </div>

      {/* Badges de plan */}
      <div className="flex justify-center gap-2 mb-6">
        {!isAuthenticated && (
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />1 carta gratis
          </Badge>
        )}
        {isAuthenticated && user?.plan === "free" && (
          <Badge variant="secondary">Quedan {remaining} cartas este mes</Badge>
        )}
        {isAuthenticated && user?.plan === "premium" && (
          <Badge variant="default" className="bg-amber-500">
            <Crown className="w-3 h-3 mr-1" />
            Premium • {remaining} cartas restantes
          </Badge>
        )}
      </div>

      {/* Error global */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Card principal con formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de nacimiento</CardTitle>
          <CardDescription>Ingresa tu información para calcular tu carta astral natal</CardDescription>
        </CardHeader>
        <CardContent>
          {canGenerate || usageLoading ? (
            <BirthDataForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              disabled={!canGenerate && !usageLoading}
              showUsageWarning={remaining === 1}
              usageMessage={remaining === 1 ? "Esta es tu última carta disponible del período." : undefined}
            />
          ) : (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">{usageMessage}</p>

              {!isAuthenticated && (
                <div className="space-y-2">
                  <p className="text-sm">Crea una cuenta gratuita para generar más cartas.</p>
                  <Button asChild>
                    <Link href="/registro">Crear cuenta gratis</Link>
                  </Button>
                </div>
              )}

              {isAuthenticated && user?.plan === "free" && (
                <div className="space-y-2">
                  <p className="text-sm">
                    Actualiza a Premium para obtener 5 cartas mensuales y síntesis personalizada con IA.
                  </p>
                  <Button asChild>
                    <Link href="/premium">Ver planes Premium</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info adicional según plan */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">¿Qué incluye?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-1">
              <li>✓ Gráfico de tu carta natal</li>
              <li>✓ Posiciones planetarias</li>
              <li>✓ Tu "Big Three" (Sol, Luna, Ascendente)</li>
              {isAuthenticated && user?.plan !== "anonymous" && (
                <>
                  <li>✓ Interpretaciones completas</li>
                  <li>✓ Descarga en PDF</li>
                </>
              )}
              {user?.plan === "premium" && (
                <>
                  <li>✓ Síntesis personalizada con IA</li>
                  <li>✓ Historial de cartas</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Importante</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Para obtener resultados precisos, es fundamental conocer la hora exacta de nacimiento. Esta información
              suele encontrarse en el certificado de nacimiento.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

```tsx
// store/birthChartStore.ts (Zustand store para el módulo)
import { create } from "zustand";
import { ChartResponse } from "../types";
import { BirthDataFormValues } from "../components/BirthDataForm/BirthDataForm.schema";

interface BirthChartState {
  // Datos del formulario
  formData: BirthDataFormValues | null;
  setFormData: (data: BirthDataFormValues) => void;

  // Resultado de la carta
  chartResult: ChartResponse | null;
  setChartResult: (result: ChartResponse) => void;

  // Limpiar todo
  reset: () => void;
}

export const useBirthChartStore = create<BirthChartState>((set) => ({
  formData: null,
  setFormData: (data) => set({ formData: data }),

  chartResult: null,
  setChartResult: (result) => set({ chartResult: result }),

  reset: () => set({ formData: null, chartResult: null }),
}));
```

**Criterios de aceptación:**

- [ ] Layout con metadata SEO
- [ ] Skeleton de loading
- [ ] Header con ícono y descripción
- [ ] Badges mostrando plan y límites
- [ ] Formulario integrado
- [ ] Manejo de errores visual
- [ ] Redirección a resultado tras éxito
- [ ] Vista de límite alcanzado con CTAs
- [ ] Cards informativas de qué incluye
- [ ] Store Zustand para persistir datos entre páginas
- [ ] Responsive design
- [ ] Tests de página

**Dependencias:** T-CA-029, T-CA-027

**Estimación:** 3 horas

---

## CHECKLIST DE PARTE 7G

- [ ] T-CA-026: Tipos TypeScript definidos
- [ ] T-CA-027: Hooks de API creados
- [ ] T-CA-028: Componente PlaceAutocomplete funcionando
- [ ] T-CA-029: Formulario BirthDataForm completo
- [ ] T-CA-030: Página principal funcionando

---

## ESTRUCTURA DE ARCHIVOS RESULTANTE

```
src/
├── app/(main)/carta-astral/
│   ├── page.tsx
│   ├── layout.tsx
│   └── loading.tsx
│
└── features/birth-chart/
    ├── types/
    │   ├── index.ts
    │   ├── chart.types.ts
    │   ├── interpretation.types.ts
    │   ├── geocode.types.ts
    │   ├── api.types.ts
    │   └── enums.ts
    │
    ├── hooks/
    │   ├── index.ts
    │   ├── useGenerateChart.ts
    │   ├── useChartHistory.ts
    │   ├── useGeocodeSearch.ts
    │   ├── useUsageStatus.ts
    │   └── useDownloadPdf.ts
    │
    ├── components/
    │   ├── index.ts
    │   ├── PlaceAutocomplete/
    │   │   ├── index.ts
    │   │   └── PlaceAutocomplete.tsx
    │   └── BirthDataForm/
    │       ├── index.ts
    │       ├── BirthDataForm.tsx
    │       └── BirthDataForm.schema.ts
    │
    └── store/
        └── birthChartStore.ts
```

---

## PRÓXIMOS PASOS

**Siguiente parte:** PARTE-7H - Tareas de Frontend: Visualización del Gráfico SVG

---

**FIN DE PARTE 7G - TAREAS DE FRONTEND: COMPONENTES BASE Y FORMULARIO**

# MÓDULO 7: CARTA ASTRAL - BACKLOG DE DESARROLLO

## PARTE 7H: TAREAS DE FRONTEND - VISUALIZACIÓN DEL GRÁFICO SVG

**Proyecto:** Auguria - Plataforma de Servicios Místicos  
**Módulo:** Carta Astral  
**Versión:** 1.0  
**Fecha:** 6 de febrero de 2026  
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## RESUMEN DE PARTE 7H

Esta parte cubre la visualización del gráfico de carta astral usando la librería `@astrodraw/astrochart` y componentes complementarios para mostrar posiciones y aspectos.

**Librería seleccionada:** `@astrodraw/astrochart` - TypeScript, genera SVGs, sin dependencias externas.

| Tarea    | Título                                              | Tipo     | Prioridad | Estimación |
| -------- | --------------------------------------------------- | -------- | --------- | ---------- |
| T-CA-031 | Configurar librería @astrodraw/astrochart           | Frontend | Must      | 2h         |
| T-CA-032 | Crear componente de gráfico de carta astral         | Frontend | Must      | 5h         |
| T-CA-033 | Crear componente de tabla de posiciones planetarias | Frontend | Must      | 3h         |
| T-CA-034 | Crear componente de tabla de aspectos               | Frontend | Must      | 3h         |
| T-CA-035 | Crear componente de distribución elemental          | Frontend | Should    | 2h         |

**Total estimado:** 15 horas

---

## DETALLE DE TAREAS

### T-CA-031: Configurar Librería @astrodraw/astrochart

**Historia relacionada:** HU-CA-002

**Descripción:**
Instalar y configurar la librería `@astrodraw/astrochart` para renderizar gráficos de cartas astrales en SVG, incluyendo la configuración de colores y estilos acordes al branding de Auguria.

**Ubicación:** `src/features/birth-chart/lib/`

**Dependencias a instalar:**

```bash
npm install @astrodraw/astrochart
```

**Archivos a crear:**

```
src/features/birth-chart/
└── lib/
    ├── index.ts
    ├── astrochart.config.ts
    └── astrochart.utils.ts
```

**Implementación:**

```typescript
// astrochart.config.ts
import type { Settings } from "@astrodraw/astrochart";

/**
 * Colores del branding de Auguria
 */
export const AUGURIA_COLORS = {
  primary: "#2D1B4E", // Morado oscuro
  secondary: "#8B5CF6", // Violeta
  accent: "#F59E0B", // Dorado
  background: "#FAFAFA", // Gris claro
  text: "#1F2937", // Gris oscuro
  muted: "#6B7280", // Gris

  // Elementos
  fire: "#EF4444", // Rojo
  earth: "#84CC16", // Verde
  air: "#FBBF24", // Amarillo
  water: "#3B82F6", // Azul

  // Aspectos
  conjunction: "#8B5CF6", // Violeta
  opposition: "#EF4444", // Rojo
  square: "#F97316", // Naranja
  trine: "#22C55E", // Verde
  sextile: "#3B82F6", // Azul
};

/**
 * Configuración personalizada para AstroChart
 */
export const CHART_SETTINGS: Partial<Settings> = {
  // Colores principales
  CHART_STROKE: AUGURIA_COLORS.primary,
  CHART_STROKE_ONLY: AUGURIA_COLORS.muted,

  // Fondo
  COLOR_BACKGROUND: "transparent",

  // Signos del zodíaco
  COLORS_SIGNS: [
    AUGURIA_COLORS.fire, // Aries
    AUGURIA_COLORS.earth, // Tauro
    AUGURIA_COLORS.air, // Géminis
    AUGURIA_COLORS.water, // Cáncer
    AUGURIA_COLORS.fire, // Leo
    AUGURIA_COLORS.earth, // Virgo
    AUGURIA_COLORS.air, // Libra
    AUGURIA_COLORS.water, // Escorpio
    AUGURIA_COLORS.fire, // Sagitario
    AUGURIA_COLORS.earth, // Capricornio
    AUGURIA_COLORS.air, // Acuario
    AUGURIA_COLORS.water, // Piscis
  ],

  // Planetas
  POINTS_COLOR: AUGURIA_COLORS.primary,
  POINTS_TEXT_SIZE: 12,

  // Casas
  CUSPS_FONT_COLOR: AUGURIA_COLORS.muted,

  // Aspectos
  ASPECTS_COLORS: {
    conjunction: AUGURIA_COLORS.conjunction,
    opposition: AUGURIA_COLORS.opposition,
    square: AUGURIA_COLORS.square,
    trine: AUGURIA_COLORS.trine,
    sextile: AUGURIA_COLORS.sextile,
  },

  // Líneas de aspectos
  ASPECTS_LINE_WIDTH: 1,

  // Radio del chart
  CHART_PADDING: 20,

  // Mostrar/ocultar elementos
  SHOW_ASPECTS: true,
  SHOW_HOUSE_NUMBERS: true,
  SHOW_DEGREE_SYMBOLS: true,

  // Símbolos de planetas (usar Unicode)
  SYMBOLS_PLANET: {
    Sun: "☉",
    Moon: "☽",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Uranus: "♅",
    Neptune: "♆",
    Pluto: "♇",
    NNode: "☊", // Nodo Norte (si se usa)
    Chiron: "⚷", // Quirón (si se usa)
  },

  // Símbolos de signos
  SYMBOLS_SIGNS: {
    Aries: "♈",
    Taurus: "♉",
    Gemini: "♊",
    Cancer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Scorpio: "♏",
    Sagittarius: "♐",
    Capricorn: "♑",
    Aquarius: "♒",
    Pisces: "♓",
  },
};

/**
 * Configuración para modo oscuro
 */
export const CHART_SETTINGS_DARK: Partial<Settings> = {
  ...CHART_SETTINGS,
  CHART_STROKE: "#E5E7EB",
  CHART_STROKE_ONLY: "#9CA3AF",
  POINTS_COLOR: "#F3F4F6",
  CUSPS_FONT_COLOR: "#9CA3AF",
};

/**
 * Configuración para PDF (sin transparencia)
 */
export const CHART_SETTINGS_PDF: Partial<Settings> = {
  ...CHART_SETTINGS,
  COLOR_BACKGROUND: "#FFFFFF",
};
```

```typescript
// astrochart.utils.ts
import type { Point, Cusp } from "@astrodraw/astrochart";
import { PlanetPosition, HouseCusp, ChartAspect } from "../types";
import { Planet, ZodiacSign } from "../types/enums";

/**
 * Mapeo de nombres de planetas (nuestro enum → astrochart)
 */
const PLANET_NAME_MAP: Record<Planet, string> = {
  [Planet.SUN]: "Sun",
  [Planet.MOON]: "Moon",
  [Planet.MERCURY]: "Mercury",
  [Planet.VENUS]: "Venus",
  [Planet.MARS]: "Mars",
  [Planet.JUPITER]: "Jupiter",
  [Planet.SATURN]: "Saturn",
  [Planet.URANUS]: "Uranus",
  [Planet.NEPTUNE]: "Neptune",
  [Planet.PLUTO]: "Pluto",
};

/**
 * Convierte nuestras posiciones planetarias al formato de astrochart
 */
export function convertPlanetsToAstroChart(planets: PlanetPosition[], ascendantLongitude: number): Point[] {
  return planets.map((planet) => {
    // Calcular longitud absoluta desde signo + grado
    const signIndex = Object.values(ZodiacSign).indexOf(planet.sign as ZodiacSign);
    const absoluteLongitude = signIndex * 30 + planet.signDegree;

    return {
      name: PLANET_NAME_MAP[planet.planet as Planet] || planet.planet,
      position: absoluteLongitude,
      // Marcar retrógrado si aplica
      retrograde: planet.isRetrograde,
    };
  });
}

/**
 * Convierte nuestras cúspides de casas al formato de astrochart
 */
export function convertHousesToAstroChart(houses: HouseCusp[]): number[] {
  // astrochart espera un array de 12 longitudes para las cúspides
  return houses.map((house) => {
    const signIndex = Object.values(ZodiacSign).indexOf(house.sign as ZodiacSign);
    return signIndex * 30 + house.signDegree;
  });
}

/**
 * Calcula el Ascendente (longitud absoluta) para rotar el gráfico
 */
export function getAscendantLongitude(houses: HouseCusp[]): number {
  // Casa 1 = Ascendente
  const house1 = houses.find((h) => h.house === 1);
  if (!house1) return 0;

  const signIndex = Object.values(ZodiacSign).indexOf(house1.sign as ZodiacSign);
  return signIndex * 30 + house1.signDegree;
}

/**
 * Prepara los datos para renderizar aspectos en el gráfico
 */
export function prepareAspectsForChart(aspects: ChartAspect[]): Array<{
  point1: string;
  point2: string;
  aspect: string;
  orb: number;
}> {
  return aspects.map((aspect) => ({
    point1: PLANET_NAME_MAP[aspect.planet1 as Planet] || aspect.planet1,
    point2: PLANET_NAME_MAP[aspect.planet2 as Planet] || aspect.planet2,
    aspect: aspect.aspectType,
    orb: aspect.orb,
  }));
}

/**
 * Calcula el tamaño óptimo del gráfico según el contenedor
 */
export function calculateChartSize(containerWidth: number, containerHeight: number, maxSize: number = 600): number {
  const minDimension = Math.min(containerWidth, containerHeight);
  return Math.min(minDimension, maxSize);
}

/**
 * Genera un ID único para el contenedor del gráfico
 */
export function generateChartContainerId(): string {
  return `astrochart-${Math.random().toString(36).substring(2, 9)}`;
}
```

```typescript
// index.ts
export * from "./astrochart.config";
export * from "./astrochart.utils";
```

**Criterios de aceptación:**

- [ ] Librería instalada correctamente
- [ ] Configuración de colores Auguria definida
- [ ] Configuración para modo oscuro
- [ ] Configuración para PDF
- [ ] Funciones de conversión de datos
- [ ] Mapeo correcto de planetas y signos
- [ ] Documentación de la configuración
- [ ] Tests unitarios de funciones de conversión

**Dependencias:** T-CA-026

**Estimación:** 2 horas

---

### T-CA-032: Crear Componente de Gráfico de Carta Astral

**Historia relacionada:** HU-CA-002

**Descripción:**
Crear el componente principal que renderiza el gráfico circular de la carta astral usando `@astrodraw/astrochart`, con soporte para interactividad y responsive design.

**Ubicación:** `src/features/birth-chart/components/`

**Archivos a crear:**

```
src/features/birth-chart/
└── components/
    └── ChartWheel/
        ├── index.ts
        ├── ChartWheel.tsx
        └── ChartWheel.hooks.ts
```

**Implementación:**

```typescript
// ChartWheel.hooks.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { Chart } from "@astrodraw/astrochart";
import type { Data, Settings } from "@astrodraw/astrochart";
import { CHART_SETTINGS, CHART_SETTINGS_DARK } from "../../lib/astrochart.config";
import {
  convertPlanetsToAstroChart,
  convertHousesToAstroChart,
  getAscendantLongitude,
  generateChartContainerId,
} from "../../lib/astrochart.utils";
import { ChartSvgData } from "../../types";

interface UseChartWheelOptions {
  data: ChartSvgData;
  size?: number;
  darkMode?: boolean;
  showAspects?: boolean;
  interactive?: boolean;
}

interface UseChartWheelReturn {
  containerId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  isRendered: boolean;
  error: string | null;
  selectedPlanet: string | null;
  setSelectedPlanet: (planet: string | null) => void;
  exportSvg: () => string | null;
}

export function useChartWheel(options: UseChartWheelOptions): UseChartWheelReturn {
  const { data, size = 500, darkMode = false, showAspects = true, interactive = true } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [containerId] = useState(generateChartContainerId);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  // Renderizar el gráfico
  useEffect(() => {
    if (!containerRef.current || !data.planets.length) return;

    try {
      // Limpiar gráfico anterior
      if (chartRef.current) {
        containerRef.current.innerHTML = "";
      }

      // Preparar datos
      const planets = convertPlanetsToAstroChart(data.planets, 0);
      const cusps = convertHousesToAstroChart(data.houses);

      const chartData: Data = {
        planets: planets.reduce(
          (acc, p) => {
            acc[p.name] = [p.position];
            return acc;
          },
          {} as Record<string, number[]>,
        ),
        cusps,
      };

      // Seleccionar configuración según modo
      const settings: Partial<Settings> = {
        ...(darkMode ? CHART_SETTINGS_DARK : CHART_SETTINGS),
        SHOW_ASPECTS: showAspects,
      };

      // Crear gráfico
      chartRef.current = new Chart(containerId, size, size, settings);
      chartRef.current.radix(chartData).aspects();

      setIsRendered(true);
      setError(null);
    } catch (err) {
      console.error("Error rendering chart:", err);
      setError("Error al renderizar el gráfico");
      setIsRendered(false);
    }
  }, [containerId, data, size, darkMode, showAspects]);

  // Función para exportar SVG
  const exportSvg = useCallback((): string | null => {
    if (!containerRef.current) return null;

    const svg = containerRef.current.querySelector("svg");
    if (!svg) return null;

    return new XMLSerializer().serializeToString(svg);
  }, []);

  return {
    containerId,
    containerRef,
    isRendered,
    error,
    selectedPlanet,
    setSelectedPlanet,
    exportSvg,
  };
}
```

```tsx
// ChartWheel.tsx
"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { AlertCircle, ZoomIn, ZoomOut, Download, Maximize2 } from "lucide-react";
import { useChartWheel } from "./ChartWheel.hooks";
import { ChartSvgData, PlanetPosition } from "../../types";
import { PLANETS, ZODIAC_SIGNS, Planet, ZodiacSign } from "../../types/enums";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ChartWheelProps {
  data: ChartSvgData;
  size?: number;
  showAspects?: boolean;
  showControls?: boolean;
  interactive?: boolean;
  onPlanetClick?: (planet: PlanetPosition) => void;
  onExport?: (svg: string) => void;
  className?: string;
}

export function ChartWheel({
  data,
  size = 500,
  showAspects = true,
  showControls = true,
  interactive = true,
  onPlanetClick,
  onExport,
  className,
}: ChartWheelProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const { containerId, containerRef, isRendered, error, selectedPlanet, setSelectedPlanet, exportSvg } = useChartWheel({
    data,
    size,
    darkMode: isDarkMode,
    showAspects,
    interactive,
  });

  // Manejar click en planeta (si es interactivo)
  const handlePlanetClick = (planet: PlanetPosition) => {
    if (!interactive) return;

    setSelectedPlanet(selectedPlanet === planet.planet ? null : planet.planet);
    onPlanetClick?.(planet);
  };

  // Manejar exportación
  const handleExport = () => {
    const svg = exportSvg();
    if (svg && onExport) {
      onExport(svg);
    } else if (svg) {
      // Descargar como archivo
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "carta-astral.svg";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Leyenda de planetas
  const planetLegend = useMemo(() => {
    return data.planets.map((planet) => {
      const metadata = PLANETS[planet.planet as Planet];
      const signMetadata = ZODIAC_SIGNS[planet.sign as ZodiacSign];

      return {
        ...planet,
        symbol: metadata?.symbol || planet.planet,
        name: metadata?.name || planet.planet,
        signSymbol: signMetadata?.symbol || planet.sign,
        signName: signMetadata?.name || planet.sign,
      };
    });
  }, [data.planets]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Controles del gráfico */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Descargar SVG</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Contenedor del gráfico */}
      <div
        ref={containerRef}
        id={containerId}
        className={cn("mx-auto transition-opacity duration-300", !isRendered && "opacity-0")}
        style={{ width: size, height: size }}
        aria-label="Gráfico de carta astral"
        role="img"
      />

      {/* Skeleton mientras carga */}
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ width: size, height: size }}>
          <div className="animate-pulse">
            <div className="rounded-full border-4 border-muted" style={{ width: size * 0.8, height: size * 0.8 }} />
          </div>
        </div>
      )}

      {/* Leyenda interactiva de planetas */}
      {interactive && isRendered && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {planetLegend.map((planet) => (
            <TooltipProvider key={planet.planet}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handlePlanetClick(planet)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-sm",
                      "border transition-colors",
                      selectedPlanet === planet.planet
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border",
                    )}
                  >
                    <span className="text-base">{planet.symbol}</span>
                    <span className="text-xs">{planet.signSymbol}</span>
                    {planet.isRetrograde && <span className="text-xs text-muted-foreground">℞</span>}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">
                    {planet.name} en {planet.signName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {planet.formattedPosition} • Casa {planet.house}
                    {planet.isRetrograde && " • Retrógrado"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  );
}
```

```tsx
// index.ts
export { ChartWheel } from "./ChartWheel";
export { useChartWheel } from "./ChartWheel.hooks";
```

**Criterios de aceptación:**

- [ ] Renderiza gráfico circular con planetas y casas
- [ ] Muestra aspectos como líneas entre planetas
- [ ] Soporte para modo claro y oscuro
- [ ] Responsive (ajusta tamaño al contenedor)
- [ ] Leyenda interactiva de planetas
- [ ] Tooltip con detalles al hover
- [ ] Botón para exportar SVG
- [ ] Skeleton mientras carga
- [ ] Manejo de errores visual
- [ ] Accesibilidad (aria labels)
- [ ] Callback onPlanetClick para interactividad
- [ ] Tests de componente

**Dependencias:** T-CA-031

**Estimación:** 5 horas

---

### T-CA-033: Crear Componente de Tabla de Posiciones Planetarias

**Historia relacionada:** HU-CA-003

**Descripción:**
Crear un componente de tabla que muestre las posiciones de todos los planetas con su signo, grado, casa y estado de retrogradación.

**Ubicación:** `src/features/birth-chart/components/`

**Archivos a crear:**

```
src/features/birth-chart/
└── components/
    └── PlanetPositionsTable/
        ├── index.ts
        └── PlanetPositionsTable.tsx
```

**Implementación:**

```tsx
// PlanetPositionsTable.tsx
"use client";

import { useMemo } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown, RotateCcw } from "lucide-react";
import { PlanetPosition } from "../../types";
import { PLANETS, ZODIAC_SIGNS, Planet, ZodiacSign } from "../../types/enums";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlanetPositionsTableProps {
  planets: PlanetPosition[];
  ascendant?: PlanetPosition;
  midheaven?: PlanetPosition;
  showCard?: boolean;
  compact?: boolean;
  highlightPlanet?: string;
  onPlanetClick?: (planet: PlanetPosition) => void;
}

export function PlanetPositionsTable({
  planets,
  ascendant,
  midheaven,
  showCard = true,
  compact = false,
  highlightPlanet,
  onPlanetClick,
}: PlanetPositionsTableProps) {
  // Combinar planetas con puntos adicionales
  const allPositions = useMemo(() => {
    const positions: PlanetPosition[] = [...planets];

    // Agregar Ascendente si está disponible
    if (ascendant) {
      positions.push({
        ...ascendant,
        planet: "ascendant" as any,
      });
    }

    // Agregar Medio Cielo si está disponible
    if (midheaven) {
      positions.push({
        ...midheaven,
        planet: "midheaven" as any,
      });
    }

    return positions;
  }, [planets, ascendant, midheaven]);

  // Función para obtener metadata del planeta
  const getPlanetInfo = (position: PlanetPosition) => {
    if (position.planet === "ascendant") {
      return { name: "Ascendente", symbol: "AC" };
    }
    if (position.planet === "midheaven") {
      return { name: "Medio Cielo", symbol: "MC" };
    }
    const metadata = PLANETS[position.planet as Planet];
    return {
      name: metadata?.name || position.planet,
      symbol: metadata?.symbol || position.planet.charAt(0).toUpperCase(),
    };
  };

  // Función para obtener metadata del signo
  const getSignInfo = (position: PlanetPosition) => {
    const metadata = ZODIAC_SIGNS[position.sign as ZodiacSign];
    return {
      name: metadata?.name || position.sign,
      symbol: metadata?.symbol || position.sign.charAt(0).toUpperCase(),
      element: metadata?.element || "unknown",
    };
  };

  // Obtener color del elemento
  const getElementColor = (element: string) => {
    switch (element) {
      case "fire":
        return "text-red-500";
      case "earth":
        return "text-green-600";
      case "air":
        return "text-yellow-500";
      case "water":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  const TableContent = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Planeta</TableHead>
          <TableHead>Signo</TableHead>
          <TableHead className={cn(compact && "hidden sm:table-cell")}>Posición</TableHead>
          <TableHead className="text-center">Casa</TableHead>
          <TableHead className="text-center w-[60px]">R</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allPositions.map((position) => {
          const planetInfo = getPlanetInfo(position);
          const signInfo = getSignInfo(position);
          const isHighlighted = highlightPlanet === position.planet;

          return (
            <TableRow
              key={position.planet}
              className={cn(onPlanetClick && "cursor-pointer hover:bg-muted/50", isHighlighted && "bg-primary/10")}
              onClick={() => onPlanetClick?.(position)}
            >
              {/* Planeta */}
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-lg" title={planetInfo.name}>
                    {planetInfo.symbol}
                  </span>
                  <span className={cn(compact && "hidden sm:inline")}>{planetInfo.name}</span>
                </div>
              </TableCell>

              {/* Signo */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={cn("text-lg", getElementColor(signInfo.element))} title={signInfo.name}>
                    {signInfo.symbol}
                  </span>
                  <span>{signInfo.name}</span>
                </div>
              </TableCell>

              {/* Posición exacta */}
              <TableCell className={cn(compact && "hidden sm:table-cell")}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="font-mono text-sm">{position.formattedPosition}</TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {position.signDegree.toFixed(2)}° de {signInfo.name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              {/* Casa */}
              <TableCell className="text-center">
                <Badge variant="outline">{position.house}</Badge>
              </TableCell>

              {/* Retrógrado */}
              <TableCell className="text-center">
                {position.isRetrograde ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <RotateCcw className="h-4 w-4 text-orange-500 mx-auto" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Retrógrado</p>
                        <p className="text-xs text-muted-foreground">El planeta aparenta moverse hacia atrás</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  if (!showCard) {
    return TableContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Posiciones Planetarias</CardTitle>
        <CardDescription>Ubicación de cada planeta en el momento de tu nacimiento</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">{TableContent}</CardContent>
    </Card>
  );
}
```

```tsx
// index.ts
export { PlanetPositionsTable } from "./PlanetPositionsTable";
```

**Criterios de aceptación:**

- [ ] Muestra todos los planetas con símbolo y nombre
- [ ] Muestra signo con símbolo y color por elemento
- [ ] Muestra posición exacta (grados y minutos)
- [ ] Muestra casa donde se ubica
- [ ] Indicador visual de retrogradación
- [ ] Incluye Ascendente y MC si están disponibles
- [ ] Tooltips con información adicional
- [ ] Soporte para modo compacto (mobile)
- [ ] Highlight de planeta seleccionado
- [ ] Callback onClick para interactividad
- [ ] Responsive design
- [ ] Tests de componente

**Dependencias:** T-CA-026

**Estimación:** 3 horas

---

### T-CA-034: Crear Componente de Tabla de Aspectos

**Historia relacionada:** HU-CA-003

**Descripción:**
Crear un componente de tabla que muestre los aspectos entre planetas, indicando el tipo de aspecto, los planetas involucrados y el orbe.

**Ubicación:** `src/features/birth-chart/components/`

**Archivos a crear:**

```
src/features/birth-chart/
└── components/
    └── AspectsTable/
        ├── index.ts
        └── AspectsTable.tsx
```

**Implementación:**

```tsx
// AspectsTable.tsx
"use client";

import { useMemo, useState } from "react";
import { Filter, Info } from "lucide-react";
import { ChartAspect } from "../../types";
import { PLANETS, ASPECTS, Planet, AspectType } from "../../types/enums";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AspectsTableProps {
  aspects: ChartAspect[];
  showCard?: boolean;
  maxItems?: number;
  filterByPlanet?: string;
  showFilters?: boolean;
  onAspectClick?: (aspect: ChartAspect) => void;
}

type FilterType = "all" | "harmonious" | "challenging";

export function AspectsTable({
  aspects,
  showCard = true,
  maxItems,
  filterByPlanet,
  showFilters = true,
  onAspectClick,
}: AspectsTableProps) {
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [planetFilter, setPlanetFilter] = useState<string>(filterByPlanet || "all");

  // Lista de planetas únicos en los aspectos
  const uniquePlanets = useMemo(() => {
    const planets = new Set<string>();
    aspects.forEach((a) => {
      planets.add(a.planet1);
      planets.add(a.planet2);
    });
    return Array.from(planets);
  }, [aspects]);

  // Filtrar aspectos
  const filteredAspects = useMemo(() => {
    let filtered = [...aspects];

    // Filtrar por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((aspect) => {
        const metadata = ASPECTS[aspect.aspectType as AspectType];
        return metadata?.nature === typeFilter;
      });
    }

    // Filtrar por planeta
    if (planetFilter !== "all") {
      filtered = filtered.filter((aspect) => aspect.planet1 === planetFilter || aspect.planet2 === planetFilter);
    }

    // Ordenar por orbe (más exacto primero)
    filtered.sort((a, b) => a.orb - b.orb);

    // Limitar cantidad
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [aspects, typeFilter, planetFilter, maxItems]);

  // Obtener metadata del aspecto
  const getAspectInfo = (aspect: ChartAspect) => {
    const metadata = ASPECTS[aspect.aspectType as AspectType];
    return {
      name: metadata?.name || aspect.aspectType,
      symbol: metadata?.symbol || "?",
      nature: metadata?.nature || "neutral",
    };
  };

  // Obtener color según naturaleza del aspecto
  const getAspectColor = (nature: string) => {
    switch (nature) {
      case "harmonious":
        return "text-green-500 bg-green-500/10";
      case "challenging":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-purple-500 bg-purple-500/10";
    }
  };

  // Obtener info del planeta
  const getPlanetInfo = (planetKey: string) => {
    const metadata = PLANETS[planetKey as Planet];
    return {
      name: metadata?.name || planetKey,
      symbol: metadata?.symbol || planetKey.charAt(0).toUpperCase(),
    };
  };

  const TableContent = (
    <>
      {/* Filtros */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-4 sm:p-0">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="harmonious">Armónicos</SelectItem>
              <SelectItem value="challenging">Desafiantes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planetFilter} onValueChange={setPlanetFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Planeta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los planetas</SelectItem>
              {uniquePlanets.map((planet) => {
                const info = getPlanetInfo(planet);
                return (
                  <SelectItem key={planet} value={planet}>
                    {info.symbol} {info.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aspecto</TableHead>
            <TableHead className="text-center">Planeta 1</TableHead>
            <TableHead className="text-center hidden sm:table-cell">Tipo</TableHead>
            <TableHead className="text-center">Planeta 2</TableHead>
            <TableHead className="text-right">Orbe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAspects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No se encontraron aspectos con los filtros seleccionados
              </TableCell>
            </TableRow>
          ) : (
            filteredAspects.map((aspect, index) => {
              const aspectInfo = getAspectInfo(aspect);
              const planet1Info = getPlanetInfo(aspect.planet1);
              const planet2Info = getPlanetInfo(aspect.planet2);

              return (
                <TableRow
                  key={`${aspect.planet1}-${aspect.planet2}-${aspect.aspectType}-${index}`}
                  className={cn(onAspectClick && "cursor-pointer hover:bg-muted/50")}
                  onClick={() => onAspectClick?.(aspect)}
                >
                  {/* Aspecto con símbolo */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-lg", getAspectColor(aspectInfo.nature))}>
                        {aspectInfo.symbol}
                      </Badge>
                      <span className="hidden sm:inline">{aspectInfo.name}</span>
                    </div>
                  </TableCell>

                  {/* Planeta 1 */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-lg">{planet1Info.symbol}</TooltipTrigger>
                        <TooltipContent>{planet1Info.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Tipo (solo desktop) */}
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge
                      variant={
                        aspectInfo.nature === "harmonious"
                          ? "default"
                          : aspectInfo.nature === "challenging"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {aspectInfo.nature === "harmonious"
                        ? "Armónico"
                        : aspectInfo.nature === "challenging"
                          ? "Desafiante"
                          : "Neutro"}
                    </Badge>
                  </TableCell>

                  {/* Planeta 2 */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-lg">{planet2Info.symbol}</TooltipTrigger>
                        <TooltipContent>{planet2Info.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Orbe */}
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          className={cn(
                            "font-mono text-sm",
                            aspect.orb <= 2 && "text-green-500 font-medium",
                            aspect.orb > 5 && "text-muted-foreground",
                          )}
                        >
                          {aspect.orb.toFixed(1)}°
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Orbe: {aspect.orb.toFixed(2)}°</p>
                          <p className="text-xs text-muted-foreground">
                            {aspect.orb <= 2
                              ? "Aspecto muy exacto"
                              : aspect.orb <= 5
                                ? "Aspecto moderado"
                                : "Aspecto amplio"}
                          </p>
                          <p className="text-xs mt-1">{aspect.isApplying ? "↗ Aplicativo" : "↘ Separativo"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground px-4 sm:px-0">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500/20" />
          <span>Armónico (fluye)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500/20" />
          <span>Desafiante (tensión)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-500/20" />
          <span>Neutro (fusión)</span>
        </div>
      </div>
    </>
  );

  if (!showCard) {
    return TableContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Aspectos Planetarios
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Los aspectos son ángulos entre planetas que indican cómo interactúan sus energías. Los aspectos
                  armónicos fluyen fácilmente, mientras los desafiantes generan tensión creativa.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>{aspects.length} aspectos encontrados entre planetas</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">{TableContent}</CardContent>
    </Card>
  );
}
```

```tsx
// index.ts
export { AspectsTable } from "./AspectsTable";
```

**Criterios de aceptación:**

- [ ] Muestra todos los aspectos con símbolos
- [ ] Colores diferenciados por naturaleza (armónico/desafiante)
- [ ] Muestra orbe con indicador visual de exactitud
- [ ] Filtro por tipo de aspecto
- [ ] Filtro por planeta
- [ ] Ordenamiento por orbe
- [ ] Tooltips informativos
- [ ] Leyenda explicativa
- [ ] Soporte para limitar cantidad mostrada
- [ ] Responsive design
- [ ] Tests de componente

**Dependencias:** T-CA-026

**Estimación:** 3 horas

---

### T-CA-035: Crear Componente de Distribución Elemental

**Historia relacionada:** HU-CA-003

**Descripción:**
Crear un componente visual que muestre la distribución de planetas por elemento (fuego, tierra, aire, agua) y modalidad (cardinal, fijo, mutable).

**Ubicación:** `src/features/birth-chart/components/`

**Archivos a crear:**

```
src/features/birth-chart/
└── components/
    └── ElementDistribution/
        ├── index.ts
        └── ElementDistribution.tsx
```

**Implementación:**

```tsx
// ElementDistribution.tsx
"use client";

import { useMemo } from "react";
import { Flame, Mountain, Wind, Droplets } from "lucide-react";
import { ChartDistribution } from "../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ElementDistributionProps {
  distribution: ChartDistribution;
  showCard?: boolean;
  showModalities?: boolean;
  compact?: boolean;
}

// Configuración de elementos
const ELEMENTS_CONFIG = {
  Fuego: {
    icon: Flame,
    color: "text-red-500",
    bgColor: "bg-red-500",
    bgLight: "bg-red-500/10",
    description: "Energía, acción, inspiración",
    signs: "Aries, Leo, Sagitario",
  },
  Tierra: {
    icon: Mountain,
    color: "text-green-600",
    bgColor: "bg-green-600",
    bgLight: "bg-green-600/10",
    description: "Practicidad, estabilidad, materialidad",
    signs: "Tauro, Virgo, Capricornio",
  },
  Aire: {
    icon: Wind,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    bgLight: "bg-yellow-500/10",
    description: "Comunicación, ideas, conexiones",
    signs: "Géminis, Libra, Acuario",
  },
  Agua: {
    icon: Droplets,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    description: "Emociones, intuición, profundidad",
    signs: "Cáncer, Escorpio, Piscis",
  },
};

// Configuración de modalidades
const MODALITIES_CONFIG = {
  Cardinal: {
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    description: "Iniciativa, liderazgo, comienzos",
    signs: "Aries, Cáncer, Libra, Capricornio",
  },
  Fijo: {
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    description: "Persistencia, estabilidad, determinación",
    signs: "Tauro, Leo, Escorpio, Acuario",
  },
  Mutable: {
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    description: "Adaptabilidad, flexibilidad, cambio",
    signs: "Géminis, Virgo, Sagitario, Piscis",
  },
};

export function ElementDistribution({
  distribution,
  showCard = true,
  showModalities = true,
  compact = false,
}: ElementDistributionProps) {
  // Encontrar elemento dominante
  const dominantElement = useMemo(() => {
    return distribution.elements.reduce((prev, current) => (current.count > prev.count ? current : prev));
  }, [distribution.elements]);

  // Encontrar modalidad dominante
  const dominantModality = useMemo(() => {
    return distribution.modalities.reduce((prev, current) => (current.count > prev.count ? current : prev));
  }, [distribution.modalities]);

  const ElementsSection = (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {distribution.elements.map((element) => {
        const config = ELEMENTS_CONFIG[element.name as keyof typeof ELEMENTS_CONFIG];
        const Icon = config?.icon || Flame;
        const isDominant = element.name === dominantElement.name;

        return (
          <TooltipProvider key={element.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    isDominant && config?.bgLight,
                    !compact && "p-3",
                  )}
                >
                  {/* Ícono */}
                  <div className={cn("flex-shrink-0 p-2 rounded-full", config?.bgLight)}>
                    <Icon className={cn("h-4 w-4", config?.color)} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isDominant && "text-foreground",
                          !isDominant && "text-muted-foreground",
                        )}
                      >
                        {element.name}
                        {isDominant && <span className="ml-2 text-xs text-primary">Dominante</span>}
                      </span>
                      <span className="text-sm font-mono">
                        {element.count} ({element.percentage}%)
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <Progress
                      value={element.percentage}
                      className={cn("h-2", config?.bgLight)}
                      indicatorClassName={config?.bgColor}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium">{element.name}</p>
                <p className="text-sm text-muted-foreground">{config?.description}</p>
                <p className="text-xs mt-1">Signos: {config?.signs}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  const ModalitiesSection = showModalities && (
    <div className={cn("space-y-3 mt-6", compact && "space-y-2 mt-4")}>
      <h4 className="font-medium text-sm text-muted-foreground">Modalidades</h4>
      {distribution.modalities.map((modality) => {
        const config = MODALITIES_CONFIG[modality.name as keyof typeof MODALITIES_CONFIG];
        const isDominant = modality.name === dominantModality.name;

        return (
          <TooltipProvider key={modality.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3">
                  <span className={cn("w-20 text-sm", isDominant ? "font-medium" : "text-muted-foreground")}>
                    {modality.name}
                  </span>
                  <div className="flex-1">
                    <Progress value={modality.percentage} className="h-2" indicatorClassName={config?.bgColor} />
                  </div>
                  <span className="text-sm font-mono w-16 text-right">
                    {modality.count} ({modality.percentage}%)
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium">{modality.name}</p>
                <p className="text-sm text-muted-foreground">{config?.description}</p>
                <p className="text-xs mt-1">Signos: {config?.signs}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  const Content = (
    <>
      {ElementsSection}
      {ModalitiesSection}

      {/* Resumen */}
      <div className={cn("mt-6 p-3 rounded-lg bg-muted/50", compact && "mt-4 p-2")}>
        <p className="text-sm">
          <span className="font-medium">Tu carta tiene predominancia de </span>
          <span className={ELEMENTS_CONFIG[dominantElement.name as keyof typeof ELEMENTS_CONFIG]?.color}>
            {dominantElement.name}
          </span>
          {showModalities && (
            <>
              <span className="font-medium"> con energía </span>
              <span className={MODALITIES_CONFIG[dominantModality.name as keyof typeof MODALITIES_CONFIG]?.color}>
                {dominantModality.name}
              </span>
            </>
          )}
          <span>.</span>
        </p>
      </div>
    </>
  );

  if (!showCard) {
    return Content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribución de Elementos</CardTitle>
        <CardDescription>Balance de energías en tu carta natal</CardDescription>
      </CardHeader>
      <CardContent>{Content}</CardContent>
    </Card>
  );
}
```

```tsx
// index.ts
export { ElementDistribution } from "./ElementDistribution";
```

**Criterios de aceptación:**

- [ ] Muestra los 4 elementos con íconos y colores
- [ ] Barras de progreso proporcionales
- [ ] Indica elemento dominante
- [ ] Muestra las 3 modalidades (opcional)
- [ ] Tooltips con descripción de cada elemento
- [ ] Resumen textual de predominancia
- [ ] Soporte para modo compacto
- [ ] Responsive design
- [ ] Tests de componente

**Dependencias:** T-CA-026

**Estimación:** 2 horas

---

## CHECKLIST DE PARTE 7H

- [ ] T-CA-031: Librería astrochart configurada
- [ ] T-CA-032: Componente ChartWheel funcionando
- [ ] T-CA-033: Componente PlanetPositionsTable funcionando
- [ ] T-CA-034: Componente AspectsTable funcionando
- [ ] T-CA-035: Componente ElementDistribution funcionando

---

## ESTRUCTURA DE ARCHIVOS RESULTANTE

```
src/features/birth-chart/
├── lib/
│   ├── index.ts
│   ├── astrochart.config.ts
│   └── astrochart.utils.ts
│
└── components/
    ├── index.ts
    ├── PlaceAutocomplete/
    ├── BirthDataForm/
    ├── ChartWheel/
    │   ├── index.ts
    │   ├── ChartWheel.tsx
    │   └── ChartWheel.hooks.ts
    ├── PlanetPositionsTable/
    │   ├── index.ts
    │   └── PlanetPositionsTable.tsx
    ├── AspectsTable/
    │   ├── index.ts
    │   └── AspectsTable.tsx
    └── ElementDistribution/
        ├── index.ts
        └── ElementDistribution.tsx
```

---

## VISTA PREVIA DE COMPONENTES

```
┌─────────────────────────────────────────┐
│           CHART WHEEL                    │
│                                         │
│         ┌─────────────────┐             │
│        /    ☉  ♀         \            │
│       /   ☽      ♂        \           │
│      │  ♃    [WHEEL]    ♄  │          │
│       \   ♅      ♆        /           │
│        \    ♇           /             │
│         └─────────────────┘             │
│                                         │
│  ☉Leo  ☽Scorp  ♀Virgo  ♂Aries ...    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     POSICIONES PLANETARIAS              │
├─────────────────────────────────────────┤
│ Planeta  │ Signo    │ Posición │Casa │R│
│ ☉ Sol    │ ♌ Leo    │ 15° 23'  │  5  │ │
│ ☽ Luna   │ ♏ Escorp │ 22° 45'  │  8  │ │
│ ☿ Mercur │ ♍ Virgo  │  3° 12'  │  6  │℞│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     DISTRIBUCIÓN DE ELEMENTOS           │
├─────────────────────────────────────────┤
│ 🔥 Fuego   ████████░░░░  4 (36%)       │
│ 🌍 Tierra  ██████░░░░░░  3 (27%)       │
│ 💨 Aire    ████░░░░░░░░  2 (18%)       │
│ 💧 Agua    ████░░░░░░░░  2 (18%)       │
│                                         │
│ Predominancia: Fuego con energía Fija   │
└─────────────────────────────────────────┘
```

---

## PRÓXIMOS PASOS

**Siguiente parte:** PARTE-7I - Tareas de Frontend: Páginas de Resultado e Interpretación

---

**FIN DE PARTE 7H - TAREAS DE FRONTEND: VISUALIZACIÓN DEL GRÁFICO SVG**
