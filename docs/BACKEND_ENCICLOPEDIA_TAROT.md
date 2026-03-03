# BACKLOG AUGURIA 2.0 - ENCICLOPEDIA MÍSTICA

## Historias de Usuario

**Fecha de creación:** 18 de enero de 2026
**Última actualización:** 2 de marzo de 2026
**Módulo:** Enciclopedia Mística
**Prioridad Global:** 🟡 MEDIA
**Estimación Total:** ~18-19 días

---

## OVERVIEW DEL MÓDULO

La Enciclopedia Mística es una sección educativa estática que permite a los usuarios explorar y aprender sobre tarot, astrología y artes místicas. Incluye las 78 cartas del Tarot, 34 artículos de astrología (signos, planetas, casas, elementos) y 6 guías de actividades. Es acceso público, sin lógica de negocio compleja, optimizada para SEO.

### Estructura del contenido:

| Categoría                  | Cantidad | Descripción                                        |
| -------------------------- | -------- | -------------------------------------------------- |
| Arcanos Mayores            | 22       | El Loco (0) a El Mundo (XXI)                       |
| Bastos (Wands)             | 14       | As al 10 + Paje, Caballero, Reina, Rey             |
| Copas (Cups)               | 14       | As al 10 + Corte                                   |
| Espadas (Swords)           | 14       | As al 10 + Corte                                   |
| Oros (Pentacles)           | 14       | As al 10 + Corte                                   |
| Signos Zodiacales          | 12       | Aries a Piscis, características y compatibilidades |
| Planetas                   | 10       | Sol a Plutón, mitología e influencias              |
| Casas Astrales             | 12       | Áreas de vida (sistema Placidus)                   |
| Elementos y Modalidades    | 8        | Fuego/Tierra/Aire/Agua + Cardinal/Fijo/Mutable     |
| Guía: Numerología          | 15       | Números 1-9 y maestros 11/22/33                    |
| Guía: Péndulo              | 4        | Historia, tipos, interpretación                    |
| Guía: Carta Astral         | 5        | Qué es, cómo leerla, aspectos                      |
| Guía: Rituales             | 6        | Tipos, preparación, fases lunares                  |
| Guía: Horóscopo Occidental | 3        | Sistema occidental, cómo funciona                  |
| Guía: Horóscopo Chino      | 5        | 12 animales, Wu Xing, compatibilidad               |
| **Total**                  | **~173** |                                                    |

### Funcionalidades principales:

- Navegación por categorías (Tarot / Astrología / Guías)
- Búsqueda global por nombre o slug (cartas + artículos)
- Vista detallada de cada carta y artículo
- Significados derecha/invertida (cartas de tarot)
- Palabras clave y asociaciones
- Relación entre cartas y artículos de astrología
- Widget "Info + Ver más" integrado en cada página de módulo
- Páginas estáticas optimizadas para SEO (`generateMetadata` + `generateStaticParams`)
- Acceso público total sin restricciones de plan
- Cross-links entre módulos y artículos relacionados (Carta Astral ↔ signos/planetas, Tarot ↔ arcanos)

---

## 1. HISTORIAS DE USUARIO

### HU-ENC-001: Explorar la enciclopedia (Usuario Anónimo)

```gherkin
Feature: Explorar enciclopedia como usuario anónimo
  Como usuario anónimo
  Quiero navegar la enciclopedia de cartas del Tarot
  Para aprender sobre cada carta sin necesidad de registrarme

  Background:
    Given soy un usuario anónimo en Auguria
    And la enciclopedia tiene las 78 cartas cargadas

  Scenario: Acceder a la enciclopedia desde el menú
    When hago clic en "Enciclopedia" en el menú
    Then veo la página principal de la enciclopedia
    And veo una sección "Arcanos Mayores" con 22 cartas
    And veo una sección "Arcanos Menores" con 4 palos
    And veo un buscador de cartas

  Scenario: Ver listado de Arcanos Mayores
    Given estoy en la enciclopedia
    When hago clic en "Arcanos Mayores"
    Then veo las 22 cartas en orden (0-XXI)
    And cada carta muestra su imagen, número y nombre
    And puedo hacer clic en cualquier carta

  Scenario: Ver listado de un palo (Arcanos Menores)
    Given estoy en la enciclopedia
    When hago clic en "Copas"
    Then veo las 14 cartas del palo de Copas
    And están ordenadas: As, 2-10, Paje, Caballero, Reina, Rey
    And cada carta muestra su imagen y nombre

  Scenario: Buscar una carta por nombre
    Given estoy en la enciclopedia
    When escribo "Emperatriz" en el buscador
    Then veo "La Emperatriz" en los resultados
    And puedo hacer clic para ver el detalle

  Scenario: Buscar con término parcial
    Given estoy en la enciclopedia
    When escribo "cab" en el buscador
    Then veo todos los "Caballeros" (4 resultados)
    And veo también "El Caballo" si existiera
```

---

### HU-ENC-002: Ver detalle de una carta

```gherkin
Feature: Ver información detallada de una carta
  Como usuario
  Quiero ver toda la información de una carta
  Para entender su significado profundo

  Background:
    Given estoy en la enciclopedia

  Scenario: Ver detalle de Arcano Mayor
    When hago clic en "La Emperatriz"
    Then veo la página de detalle con:
      | Campo | Valor |
      | Imagen | Carta de La Emperatriz |
      | Número | III |
      | Nombre | La Emperatriz |
      | Arcano | Mayor |
      | Elemento | Tierra |
      | Planeta | Venus |
    And veo la sección "Significado Derecha"
    And veo la sección "Significado Invertida"
    And veo las palabras clave
    And veo cartas relacionadas

  Scenario: Ver detalle de Arcano Menor
    When hago clic en "Tres de Copas"
    Then veo la página de detalle con:
      | Campo | Valor |
      | Imagen | Carta Tres de Copas |
      | Palo | Copas |
      | Número | 3 |
      | Elemento | Agua |
    And veo significados derecha/invertida
    And veo palabras clave del palo

  Scenario: Ver carta de la corte
    When hago clic en "Reina de Espadas"
    Then veo información adicional:
      | Campo | Valor |
      | Tipo | Carta de Corte |
      | Rango | Reina |
      | Palo | Espadas |
      | Elemento combinado | Agua de Aire |
    And veo descripción de la personalidad
    And veo cómo identificarla en lecturas

  Scenario: Navegar entre cartas
    Given estoy viendo "El Mago (I)"
    When hago clic en "Siguiente"
    Then navego a "La Sacerdotisa (II)"
    When hago clic en "Anterior"
    Then vuelvo a "El Mago (I)"
```

---

### HU-ENC-004: Filtros y organización

```gherkin
Feature: Filtrar y organizar cartas
  Como usuario
  Quiero filtrar cartas por diferentes criterios
  Para encontrar lo que busco más fácilmente

  Scenario: Filtrar por elemento
    Given estoy en la enciclopedia
    When selecciono filtro "Elemento: Fuego"
    Then veo solo cartas asociadas a Fuego:
      - Palo de Bastos completo
      - Arcanos Mayores con elemento Fuego

  Scenario: Filtrar por tipo de carta
    Given estoy en la enciclopedia
    When selecciono "Solo cartas de corte"
    Then veo las 16 cartas de corte
    And están agrupadas por palo

  Scenario: Ordenar cartas
    Given estoy viendo Arcanos Mayores
    When selecciono "Ordenar: A-Z"
    Then las cartas se ordenan alfabéticamente
    When selecciono "Ordenar: Número"
    Then las cartas vuelven al orden numérico
```

---

### HU-ENC-005: Explorar la sección de Astrología

```gherkin
Feature: Explorar la sección de astrología en la enciclopedia
  Como usuario anónimo
  Quiero navegar por la sección de astrología de la enciclopedia
  Para aprender sobre signos, planetas y casas astrales

  Background:
    Given soy un usuario anónimo en Auguria
    And la enciclopedia tiene los 34 artículos de astrología cargados

  Scenario: Acceder a la sección de astrología desde la enciclopedia
    Given estoy en la página principal de la enciclopedia
    When hago clic en la pestaña "Astrología"
    Then veo tres subsecciones: "Signos Zodiacales", "Planetas" y "Casas Astrales"
    And veo una breve descripción de cada subsección

  Scenario: Ver listado de signos zodiacales
    Given estoy en la sección "Astrología" de la enciclopedia
    When hago clic en "Signos Zodiacales"
    Then veo los 12 signos en orden (Aries a Piscis)
    And cada signo muestra su símbolo, elemento y modalidad
    And puedo hacer clic en cualquier signo para ver su detalle

  Scenario: Ver detalle de un signo zodiacal
    When hago clic en "Escorpio"
    Then veo la página de detalle con:
      | Campo           | Valor           |
      | Nombre          | Escorpio        |
      | Símbolo         | Escorpión       |
      | Elemento        | Agua            |
      | Modalidad       | Fijo            |
      | Planeta regente | Plutón / Marte  |
      | Fechas          | 23 Oct - 21 Nov |
    And veo la descripción del carácter y personalidad
    And veo la sección de compatibilidades
    And veo los arcanos del tarot asociados a Escorpio

  Scenario: Ver listado de planetas
    Given estoy en la sección "Astrología"
    When hago clic en "Planetas"
    Then veo los 10 planetas (Sol a Plutón)
    And cada planeta muestra su símbolo astrológico
    And puedo hacer clic para ver el detalle

  Scenario: Ver detalle de un planeta
    When hago clic en "Mercurio"
    Then veo la página de detalle con:
      | Campo      | Valor                   |
      | Nombre     | Mercurio                |
      | Rige       | Géminis y Virgo         |
      | Mitología  | Mensajero de los dioses |
    And veo su influencia en la carta astral
    And veo los arcanos del tarot que se asocian a este planeta

  Scenario: Ver listado de casas astrales
    Given estoy en la sección "Astrología"
    When hago clic en "Casas Astrales"
    Then veo las 12 casas numeradas
    And cada casa muestra su área de vida principal
    And puedo hacer clic en cada casa para ver su detalle
```

---

### HU-ENC-006: Widget "Ver más" en páginas de módulos

```gherkin
Feature: Ver información de la enciclopedia integrada en las páginas de módulos
  Como usuario de Auguria
  Quiero ver un resumen informativo en cada página de módulo
  Para aprender sobre el tema mientras uso la herramienta

  Background:
    Given soy un usuario anónimo o registrado en Auguria

  Scenario: Ver widget de enciclopedia en la página de Numerología
    Given estoy en la página "/numerologia"
    Then veo un widget de información con el título "¿Qué es la Numerología?"
    And veo un snippet de 2-3 oraciones explicando la numerología
    And veo un botón "Ver más en la Enciclopedia"
    When hago clic en "Ver más en la Enciclopedia"
    Then navego a "/enciclopedia/guias/numerologia"

  Scenario: Ver widget de enciclopedia en la página del Péndulo
    Given estoy en la página "/pendulo"
    Then veo un widget con el título "Sobre el Péndulo"
    And veo una descripción breve de para qué sirve el péndulo
    And veo un botón "Ver más en la Enciclopedia"
    When hago clic en "Ver más"
    Then navego a "/enciclopedia/guias/pendulo"

  Scenario: Ver widget de enciclopedia en la página de Carta Astral
    Given estoy en la página "/carta-astral"
    Then veo un widget con el título "¿Qué es una Carta Astral?"
    And veo un snippet explicando qué es una carta astral
    And veo el botón "Ver más en la Enciclopedia"
    When hago clic en "Ver más"
    Then navego a "/enciclopedia/guias/carta-astral"

  Scenario: Ver widget de enciclopedia en la página del Horóscopo
    Given estoy en la página "/horoscopo"
    Then veo un widget con el título "Sobre el Horóscopo Occidental"
    And veo un botón "Ver más en la Enciclopedia"
    When hago clic en "Ver más"
    Then navego a "/enciclopedia/guias/horoscopo"

  Scenario: Ver widget de enciclopedia en la página del Horóscopo Chino
    Given estoy en la página "/horoscopo-chino"
    Then veo un widget con el título "El Zodíaco Chino"
    And veo un botón "Ver más en la Enciclopedia"
    When hago clic en "Ver más"
    Then navego a "/enciclopedia/guias/horoscopo-chino"

  Scenario: Ver widget de enciclopedia en la página de Rituales
    Given estoy en la página "/rituales"
    Then veo un widget con el título "Sobre los Rituales"
    And veo un botón "Ver más en la Enciclopedia"
    When hago clic en "Ver más"
    Then navego a "/enciclopedia/guias/ritual"

  Scenario: Widget es visible para usuarios anónimos y registrados
    Given soy un usuario anónimo
    Then el widget "Ver más" está visible sin requerir login
    And el botón lleva a una página pública de la enciclopedia
```

---

### HU-ENC-007: Explorar guías de actividades

```gherkin
Feature: Explorar guías de actividades en la enciclopedia
  Como usuario de Auguria
  Quiero leer artículos explicativos sobre cada actividad mística
  Para comprender mejor cómo funcionan y cómo interpretar los resultados

  Background:
    Given soy un usuario en Auguria (anónimo o registrado)

  Scenario: Acceder a la sección de Guías desde la enciclopedia
    Given estoy en "/enciclopedia"
    When hago clic en la pestaña "Guías"
    Then veo 6 guías disponibles:
      - Numerología
      - Péndulo
      - Carta Astral
      - Rituales
      - Horóscopo Occidental
      - Horóscopo Chino
    And cada guía muestra un ícono, título y descripción breve

  Scenario: Leer la guía de Numerología
    Given estoy en la sección de Guías
    When hago clic en "Numerología"
    Then navego a "/enciclopedia/guias/numerologia"
    And veo una página con:
      - Introducción: qué es la numerología
      - Los números 1 al 9 con su significado
      - Los números maestros 11, 22 y 33
      - Cómo se calcula el camino de vida
    And veo un CTA "Calcular mi Numerología" que lleva a "/numerologia"

  Scenario: Leer la guía del Péndulo
    Given estoy en la sección de Guías
    When hago clic en "Péndulo"
    Then navego a "/enciclopedia/guias/pendulo"
    And veo:
      - Historia y origen del péndulo
      - Cómo funciona la radiestesia
      - Tipos de péndulos (cuarzo, metal, madera)
      - Cómo interpretar respuestas Sí/No/Quizás
    And veo un CTA "Usar el Péndulo Digital" que lleva a "/pendulo"

  Scenario: Navegar entre guías con links internos
    Given estoy leyendo la guía de Carta Astral
    When veo la mención de "signo solar"
    Then es un enlace clicable
    When hago clic en "signo solar"
    Then navego al artículo del signo correspondiente en la enciclopedia

  Scenario: Leer guía es acceso público
    Given soy usuario anónimo
    When navego a "/enciclopedia/guias/numerologia"
    Then puedo leer el artículo completo sin login
    And no veo restricciones por plan
```

---

### HU-ENC-008: Ver artículos de elementos y modalidades

```gherkin
Feature: Explorar elementos y modalidades astrológicas en la enciclopedia
  Como usuario de Auguria
  Quiero entender los elementos y modalidades astrológicas
  Para interpretar mejor mi carta astral y los arcanos del tarot

  Scenario: Ver la sección de Elementos
    Given estoy en "/enciclopedia"
    When navego a la subsección "Elementos"
    Then veo los 4 elementos: Fuego, Tierra, Aire, Agua
    And cada elemento muestra los signos que lo rigen
    And muestra los palos del tarot asociados

  Scenario: Ver detalle de un elemento
    Given estoy en la enciclopedia de elementos
    When hago clic en "Fuego"
    Then veo:
      - Descripción del elemento Fuego
      - Signos asociados: Aries, Leo, Sagitario
      - Palo del tarot: Bastos
      - Modalidades: Cardinal (Aries), Fijo (Leo), Mutable (Sagitario)
      - Características generales del carácter

  Scenario: Ver las modalidades astrológicas
    Given estoy en la enciclopedia de elementos
    When hago clic en "Modalidades"
    Then veo las 3 modalidades: Cardinal, Fijo, Mutable
    And cada una explica su dinámica energética
    And muestra los 4 signos de cada modalidad
```

---

### HU-ENC-009: Cross-linking desde módulos hacia la enciclopedia

```gherkin
Feature: Links cruzados entre módulos y la enciclopedia
  Como usuario de Auguria
  Quiero tener acceso fácil a información de la enciclopedia desde los resultados de los módulos
  Para aprender más sobre los símbolos relevantes en mis consultas

  Scenario: Ver link de enciclopedia en el resultado de Carta Astral - signo
    Given generé una carta astral
    When veo el resultado con "Sol en Escorpio"
    Then "Escorpio" es un enlace
    When hago clic en "Escorpio"
    Then navego a "/enciclopedia/astrologia/signos/escorpio"

  Scenario: Ver link de enciclopedia en el resultado de Carta Astral - planeta
    Given generé una carta astral
    When veo "Venus en conjunción"
    Then "Venus" es un enlace
    When hago clic en "Venus"
    Then navego a "/enciclopedia/astrologia/planetas/venus"

  Scenario: Ver link desde el detalle de carta de Tarot hacia artículo de planeta
    Given estoy viendo "La Emperatriz" en la enciclopedia de tarot
    When veo el campo "Planeta: Venus"
    Then "Venus" es un enlace clicable
    When hago clic en "Venus"
    Then navego a "/enciclopedia/astrologia/planetas/venus"
```

---

### HU-ENC-010: Búsqueda global en la Enciclopedia Mística

```gherkin
Feature: Búsqueda global en la enciclopedia mística
  Como usuario
  Quiero buscar en toda la enciclopedia con un solo buscador
  Para encontrar artículos de cualquier categoría rápidamente

  Scenario: Buscar un signo zodiacal
    Given estoy en "/enciclopedia"
    And existe un buscador global
    When escribo "Escorpio" en el buscador
    Then veo resultados que incluyen:
      - El artículo "Escorpio" (signo zodiacal)
      - Las cartas de tarot asociadas a Escorpio

  Scenario: Buscar por categoría semántica
    Given estoy en "/enciclopedia"
    When escribo "agua" en el buscador
    Then veo resultados de múltiples categorías:
      - Elemento: Agua
      - Cartas de tarot del palo de Copas
      - Signos de agua: Cáncer, Escorpio, Piscis

  Scenario: Búsqueda sin resultados
    Given estoy en "/enciclopedia"
    When escribo "xyzabc" en el buscador
    Then veo el mensaje "No se encontraron artículos para 'xyzabc'"
    And veo sugerencias de búsquedas populares

  Scenario: Búsqueda con mínimo de caracteres
    Given estoy en la enciclopedia
    When escribo solo "a" en el buscador
    Then no se ejecuta la búsqueda
    And veo un hint "Escribe al menos 2 caracteres"
```

---

### HU-ENC-011: Navegación por categorías de la Enciclopedia ampliada

```gherkin
Feature: Navegación por categorías de la enciclopedia mística completa
  Como usuario
  Quiero navegar la enciclopedia por categorías claras
  Para encontrar fácilmente el tipo de información que busco

  Scenario: Ver la página principal de la enciclopedia con todas las categorías
    Given navego a "/enciclopedia"
    Then veo tres secciones principales:
      - "Tarot" con sub-categorías: Arcanos Mayores, Arcanos Menores
      - "Astrología" con sub-categorías: Signos, Planetas, Casas, Elementos
      - "Guías" con: Numerología, Péndulo, Carta Astral, Rituales, Horóscopo, Horóscopo Chino
    And cada sección tiene una descripción breve
    And cada sección tiene un contador de artículos

  Scenario: Ver página de categoría
    When hago clic en "Signos Zodiacales"
    Then navego a una página de listado con los 12 signos
    And cada elemento de la lista muestra nombre, símbolo e ícono de elemento

  Scenario: Páginas de enciclopedia con SEO
    Given navego a "/enciclopedia/astrologia/signos/aries"
    Then la página tiene:
      | Metadata    | Valor                                         |
      | title       | Aries - Signo Zodiacal - Enciclopedia Mística |
      | description | Descripción del signo Aries...                |
      | og:title    | Aries - Enciclopedia Mística Auguria          |
    And el contenido está disponible para indexación por buscadores
```

---

### HU-ENC-012: Guía del Horóscopo Chino en la Enciclopedia

```gherkin
Feature: Explorar el sistema del horóscopo chino en la enciclopedia
  Como usuario de Auguria
  Quiero aprender sobre el zodíaco chino en la enciclopedia
  Para entender el sistema antes de consultar mi horóscopo

  Scenario: Acceder a la guía del horóscopo chino
    When navego a "/enciclopedia/guias/horoscopo-chino"
    Then veo:
      - Introducción al zodíaco chino
      - Los 12 animales con su descripción breve
      - Los elementos Wu Xing (Madera, Fuego, Tierra, Metal, Agua)
      - Cómo se calcula el animal por año de nacimiento (con el Año Nuevo Chino)
    And veo un CTA "Ver mi Horóscopo Chino" que lleva a "/horoscopo-chino"

  Scenario: Ver artículo de un animal del zodíaco chino
    Given estoy en la guía del Horóscopo Chino
    When hago clic en "Dragón"
    Then navego a un artículo de detalle
    And veo:
      - Características del Dragón
      - Años del Dragón recientes
      - Elementos compatibles
      - Compatibilidades con otros animales
```

---

# Backend: Entidades y Migraciones

---

### TASK-300: Crear entidad TarotCard

**Módulo:** `src/modules/encyclopedia/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** Ninguna  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear la entidad principal que representa cada carta del Tarot con toda su información.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/entities/tarot-card.entity.ts`
- `src/database/migrations/XXXX-CreateTarotCards.ts`

**Estructura del módulo:**

```
src/modules/encyclopedia/
├── encyclopedia.module.ts
├── entities/
│   └── tarot-card.entity.ts
├── enums/
│   └── tarot.enums.ts
├── data/
│   └── cards-seed.data.ts
├── application/
│   ├── dto/
│   └── services/
└── infrastructure/
    └── controllers/
```

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear `tarot.enums.ts`:

  ```typescript
  export enum ArcanaType {
    MAJOR = "major",
    MINOR = "minor",
  }

  export enum Suit {
    WANDS = "wands", // Bastos - Fuego
    CUPS = "cups", // Copas - Agua
    SWORDS = "swords", // Espadas - Aire
    PENTACLES = "pentacles", // Oros - Tierra
  }

  export enum CourtRank {
    PAGE = "page", // Paje/Sota
    KNIGHT = "knight", // Caballero
    QUEEN = "queen", // Reina
    KING = "king", // Rey
  }

  export enum Element {
    FIRE = "fire",
    WATER = "water",
    AIR = "air",
    EARTH = "earth",
    SPIRIT = "spirit", // Para algunos Arcanos Mayores
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

  export enum ZodiacAssociation {
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
  ```

- [x] Crear `tarot-card.entity.ts` (creada como `encyclopedia-tarot-card.entity.ts` con clase `EncyclopediaTarotCard` y tabla `encyclopedia_tarot_cards`):

  ```typescript
  import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
  import { ArcanaType, Suit, CourtRank, Element, Planet, ZodiacAssociation } from "../enums/tarot.enums";

  @Entity("tarot_cards")
  @Index("idx_card_arcana", ["arcanaType"])
  @Index("idx_card_suit", ["suit"])
  @Index("idx_card_slug", ["slug"], { unique: true })
  export class TarotCard {
    @PrimaryGeneratedColumn()
    id: number;

    // Identificación
    @Column({ type: "varchar", length: 50, unique: true })
    slug: string; // "the-fool", "three-of-cups"

    @Column({ type: "varchar", length: 100 })
    nameEn: string; // "The Fool"

    @Column({ type: "varchar", length: 100 })
    nameEs: string; // "El Loco"

    // Clasificación
    @Column({ type: "enum", enum: ArcanaType })
    arcanaType: ArcanaType;

    @Column({ type: "smallint" })
    number: number; // 0-21 para Mayores, 1-14 para Menores

    @Column({ type: "varchar", length: 10, nullable: true })
    romanNumeral: string | null; // "0", "I", "II"... solo Mayores

    // Solo para Arcanos Menores
    @Column({ type: "enum", enum: Suit, nullable: true })
    suit: Suit | null;

    @Column({ type: "enum", enum: CourtRank, nullable: true })
    courtRank: CourtRank | null; // Solo para cartas de corte

    // Asociaciones esotéricas
    @Column({ type: "enum", enum: Element, nullable: true })
    element: Element | null;

    @Column({ type: "enum", enum: Planet, nullable: true })
    planet: Planet | null;

    @Column({ type: "enum", enum: ZodiacAssociation, nullable: true })
    zodiacSign: ZodiacAssociation | null;

    // Contenido
    @Column({ type: "text" })
    meaningUpright: string; // Significado derecha

    @Column({ type: "text" })
    meaningReversed: string; // Significado invertida

    @Column({ type: "text", nullable: true })
    description: string | null; // Descripción general

    @Column({ type: "jsonb" })
    keywords: {
      upright: string[];
      reversed: string[];
    };

    // Imágenes
    @Column({ type: "varchar", length: 255 })
    imageUrl: string; // URL de la imagen principal

    @Column({ type: "varchar", length: 255, nullable: true })
    thumbnailUrl: string | null;

    // Relaciones con otras cartas
    @Column({ type: "jsonb", nullable: true })
    relatedCards: number[] | null; // IDs de cartas relacionadas

    // Metadata
    @Column({ type: "int", default: 0 })
    viewCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
  }
  ```

- [x] Crear migración (creada como `1772000000000-CreateEncyclopediaTarotCards.ts`):

  ```typescript
  // XXXX-CreateTarotCards.ts
  export class CreateTarotCards implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      // Crear enums
      await queryRunner.query(`
        CREATE TYPE arcana_type_enum AS ENUM ('major', 'minor');
        CREATE TYPE suit_enum AS ENUM ('wands', 'cups', 'swords', 'pentacles');
        CREATE TYPE court_rank_enum AS ENUM ('page', 'knight', 'queen', 'king');
        CREATE TYPE element_enum AS ENUM ('fire', 'water', 'air', 'earth', 'spirit');
        CREATE TYPE planet_enum AS ENUM (
          'sun', 'moon', 'mercury', 'venus', 'mars',
          'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
        );
        CREATE TYPE zodiac_association_enum AS ENUM (
          'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
          'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        );
      `);

      // Crear tabla
      await queryRunner.query(`
        CREATE TABLE tarot_cards (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(50) UNIQUE NOT NULL,
          name_en VARCHAR(100) NOT NULL,
          name_es VARCHAR(100) NOT NULL,
          arcana_type arcana_type_enum NOT NULL,
          number SMALLINT NOT NULL,
          roman_numeral VARCHAR(10),
          suit suit_enum,
          court_rank court_rank_enum,
          element element_enum,
          planet planet_enum,
          zodiac_sign zodiac_association_enum,
          meaning_upright TEXT NOT NULL,
          meaning_reversed TEXT NOT NULL,
          description TEXT,
          keywords JSONB NOT NULL,
          image_url VARCHAR(255) NOT NULL,
          thumbnail_url VARCHAR(255),
          related_cards JSONB,
          view_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Crear índices
      await queryRunner.query(`
        CREATE INDEX idx_card_arcana ON tarot_cards(arcana_type);
        CREATE INDEX idx_card_suit ON tarot_cards(suit);
        CREATE UNIQUE INDEX idx_card_slug ON tarot_cards(slug);
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("DROP TABLE IF EXISTS tarot_cards");
      await queryRunner.query("DROP TYPE IF EXISTS zodiac_association_enum");
      await queryRunner.query("DROP TYPE IF EXISTS planet_enum");
      await queryRunner.query("DROP TYPE IF EXISTS element_enum");
      await queryRunner.query("DROP TYPE IF EXISTS court_rank_enum");
      await queryRunner.query("DROP TYPE IF EXISTS suit_enum");
      await queryRunner.query("DROP TYPE IF EXISTS arcana_type_enum");
    }
  }
  ```

##### Testing

- [x] Test: Entidad se crea correctamente
- [x] Test: Slug es único
- [x] Test: JSONB de keywords funciona
- [x] Test: Enums validan correctamente

---

#### 🎯 Criterios de Aceptación

- [x] Migración ejecuta sin errores
- [x] Entidad soporta 78 cartas
- [x] Índices creados para búsquedas comunes
- [x] Enums cubren todas las opciones

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El slug es la clave de búsqueda principal
> - `suit` y `courtRank` son NULL para Arcanos Mayores
> - `romanNumeral` es NULL para Arcanos Menores
> - Las imágenes se almacenan como URLs (no binarios)

### TASK-302: Crear Seeder de Cartas del Tarot

**Módulo:** `src/modules/encyclopedia/data/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-300  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear el archivo de datos con las 78 cartas y el comando para poblar la base de datos.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/data/major-arcana.data.ts`
- `src/modules/encyclopedia/data/minor-arcana.data.ts`
- `src/modules/encyclopedia/data/cards-seed.data.ts`
- `src/database/seeds/tarot-cards.seed.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear `major-arcana.data.ts` (22 cartas):

  ```typescript
  import { ArcanaType, Element, Planet, ZodiacAssociation } from "../enums/tarot.enums";

  export interface CardSeedData {
    slug: string;
    nameEn: string;
    nameEs: string;
    arcanaType: ArcanaType;
    number: number;
    romanNumeral?: string;
    suit?: string;
    courtRank?: string;
    element?: Element;
    planet?: Planet;
    zodiacSign?: ZodiacAssociation;
    meaningUpright: string;
    meaningReversed: string;
    description: string;
    keywords: {
      upright: string[];
      reversed: string[];
    };
    imageUrl: string;
  }

  export const MAJOR_ARCANA: CardSeedData[] = [
    {
      slug: "the-fool",
      nameEn: "The Fool",
      nameEs: "El Loco",
      arcanaType: ArcanaType.MAJOR,
      number: 0,
      romanNumeral: "0",
      element: Element.AIR,
      planet: Planet.URANUS,
      meaningUpright:
        "El Loco representa nuevos comienzos, inocencia y espíritu libre. Es la carta del potencial ilimitado y la aventura. Simboliza dar un salto de fe hacia lo desconocido con optimismo y confianza.",
      meaningReversed:
        "Invertida, El Loco advierte sobre imprudencia, decisiones precipitadas y falta de dirección. Puede indicar ingenuidad excesiva o resistencia a dar el siguiente paso por miedo.",
      description:
        "Un joven está al borde de un precipicio, mirando al cielo con una bolsa al hombro y un perro a sus pies. Representa el inicio del viaje del alma.",
      keywords: {
        upright: ["Nuevos comienzos", "Inocencia", "Aventura", "Libertad", "Potencial"],
        reversed: ["Imprudencia", "Ingenuidad", "Riesgo", "Miedo", "Estancamiento"],
      },
      imageUrl: "/images/tarot/major/00-the-fool.jpg",
    },
    {
      slug: "the-magician",
      nameEn: "The Magician",
      nameEs: "El Mago",
      arcanaType: ArcanaType.MAJOR,
      number: 1,
      romanNumeral: "I",
      element: Element.AIR,
      planet: Planet.MERCURY,
      meaningUpright:
        "El Mago representa la manifestación, el poder personal y la habilidad de convertir ideas en realidad. Tienes todos los recursos que necesitas; es momento de actuar con confianza y determinación.",
      meaningReversed:
        "Invertida, puede indicar manipulación, talentos desperdiciados o falta de dirección. También puede señalar trucos, engaños o no utilizar tu potencial completo.",
      description:
        "Un hombre de pie frente a una mesa con los cuatro elementos. Un brazo apunta al cielo y otro a la tierra, canalizando energía universal.",
      keywords: {
        upright: ["Manifestación", "Poder", "Acción", "Concentración", "Habilidad"],
        reversed: ["Manipulación", "Engaño", "Desperdicio", "Falta de dirección", "Trucos"],
      },
      imageUrl: "/images/tarot/major/01-the-magician.jpg",
    },
    {
      slug: "the-high-priestess",
      nameEn: "The High Priestess",
      nameEs: "La Sacerdotisa",
      arcanaType: ArcanaType.MAJOR,
      number: 2,
      romanNumeral: "II",
      element: Element.WATER,
      planet: Planet.MOON,
      meaningUpright:
        "La Sacerdotisa representa la intuición, el misterio y el conocimiento interior. Es momento de escuchar tu voz interna y confiar en tu sabiduría innata. Los secretos serán revelados.",
      meaningReversed:
        "Invertida, puede indicar secretos ocultos, ignorar tu intuición o información que se te está ocultando. También puede señalar superficialidad o desconexión espiritual.",
      description:
        "Una mujer sentada entre dos pilares, con una luna a sus pies y un velo detrás. Sostiene un pergamino parcialmente oculto.",
      keywords: {
        upright: ["Intuición", "Misterio", "Sabiduría interior", "Espiritualidad", "Secretos"],
        reversed: ["Secretos ocultos", "Desconexión", "Ignorar intuición", "Superficialidad"],
      },
      imageUrl: "/images/tarot/major/02-the-high-priestess.jpg",
    },
    // ... continuar con las 19 cartas restantes
  ];
  ```

- [x] Crear `minor-arcana.data.ts` (56 cartas, ejemplo de Copas):

  ```typescript
  import { ArcanaType, Suit, CourtRank, Element } from "../enums/tarot.enums";
  import { CardSeedData } from "./major-arcana.data";

  export const CUPS: CardSeedData[] = [
    {
      slug: "ace-of-cups",
      nameEn: "Ace of Cups",
      nameEs: "As de Copas",
      arcanaType: ArcanaType.MINOR,
      number: 1,
      suit: Suit.CUPS,
      element: Element.WATER,
      meaningUpright:
        "El As de Copas representa nuevos comienzos emocionales, amor, compasión y creatividad. Es una copa rebosante de sentimientos positivos y conexiones profundas.",
      meaningReversed:
        "Invertida, puede indicar bloqueo emocional, amor no correspondido o creatividad reprimida. Las emociones pueden estar contenidas o mal dirigidas.",
      description:
        "Una mano emerge de una nube sosteniendo una copa dorada de la que fluye agua hacia un estanque de lotos.",
      keywords: {
        upright: ["Amor nuevo", "Emoción", "Intuición", "Creatividad", "Compasión"],
        reversed: ["Bloqueo emocional", "Vacío", "Represión", "Desamor"],
      },
      imageUrl: "/images/tarot/cups/01-ace-of-cups.jpg",
    },
    // ... 2-10 de Copas
    {
      slug: "page-of-cups",
      nameEn: "Page of Cups",
      nameEs: "Paje de Copas",
      arcanaType: ArcanaType.MINOR,
      number: 11,
      suit: Suit.CUPS,
      courtRank: CourtRank.PAGE,
      element: Element.WATER,
      meaningUpright:
        "El Paje de Copas representa mensajes emocionales, creatividad juvenil e intuición en desarrollo. Puede indicar una persona sensible y soñadora, o el inicio de un proyecto creativo.",
      meaningReversed:
        "Invertida, puede indicar inmadurez emocional, creatividad bloqueada o noticias decepcionantes relacionadas con sentimientos.",
      description:
        "Un joven de pie sostiene una copa de la que emerge un pez. Viste ropas floridas y mira con curiosidad.",
      keywords: {
        upright: ["Mensajes", "Creatividad", "Sensibilidad", "Sueños", "Juventud"],
        reversed: ["Inmadurez", "Bloqueo creativo", "Decepción", "Capricho"],
      },
      imageUrl: "/images/tarot/cups/11-page-of-cups.jpg",
    },
    // ... Caballero, Reina, Rey de Copas
  ];

  // Exportar todos los palos
  export const WANDS: CardSeedData[] = [
    /* ... */
  ];
  export const SWORDS: CardSeedData[] = [
    /* ... */
  ];
  export const PENTACLES: CardSeedData[] = [
    /* ... */
  ];
  ```

- [x] Crear `cards-seed.data.ts`:

  ```typescript
  import { MAJOR_ARCANA } from "./major-arcana.data";
  import { CUPS, WANDS, SWORDS, PENTACLES } from "./minor-arcana.data";

  export const ALL_CARDS = [...MAJOR_ARCANA, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

  export const TOTAL_CARDS = 78;
  ```

- [x] Crear comando de seed:

  ```typescript
  // src/database/seeds/tarot-cards.seed.ts
  import { DataSource } from "typeorm";
  import { TarotCard } from "@/modules/encyclopedia/entities/tarot-card.entity";
  import { ALL_CARDS } from "@/modules/encyclopedia/data/cards-seed.data";

  export async function seedTarotCards(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(TarotCard);

    // Verificar si ya hay cartas
    const count = await repository.count();
    if (count > 0) {
      console.log(`Ya existen ${count} cartas. Saltando seed.`);
      return;
    }

    console.log("Insertando 78 cartas del Tarot...");

    for (const cardData of ALL_CARDS) {
      const card = repository.create(cardData);
      await repository.save(card);
    }

    console.log("Seed completado: 78 cartas insertadas.");
  }
  ```

##### Testing

- [x] Test: Seed inserta 78 cartas
- [x] Test: No duplica si ya existen
- [x] Test: Todos los slugs son únicos
- [x] Test: Todas las cartas tienen contenido mínimo

---

#### 🎯 Criterios de Aceptación

- [x] 22 Arcanos Mayores completos
- [x] 56 Arcanos Menores completos (14 x 4 palos)
- [x] Todos los campos requeridos llenos
- [x] Comando de seed funciona
- [x] Contenido en español de calidad

# Backend: Módulo y Servicio

---

 ### TASK-303: Crear módulo y servicio de Enciclopedia

**Estado:** ✅ COMPLETADA  
**Módulo:** `src/modules/encyclopedia/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-300, TASK-302

---

#### 📋 Descripción

Crear el módulo NestJS con el servicio principal para consultar cartas.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/encyclopedia.module.ts`
- `src/modules/encyclopedia/application/services/encyclopedia.service.ts`
- `src/modules/encyclopedia/application/dto/*.dto.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear DTOs:

  ```typescript
  // card-response.dto.ts
  import { ApiProperty } from "@nestjs/swagger";
  import { ArcanaType, Suit, CourtRank, Element } from "../enums/tarot.enums";

  export class CardKeywordsDto {
    @ApiProperty({ example: ["Amor", "Intuición"] })
    upright: string[];

    @ApiProperty({ example: ["Bloqueo", "Desamor"] })
    reversed: string[];
  }

  export class CardSummaryDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: "the-fool" })
    slug: string;

    @ApiProperty({ example: "El Loco" })
    nameEs: string;

    @ApiProperty({ enum: ArcanaType })
    arcanaType: ArcanaType;

    @ApiProperty({ example: 0 })
    number: number;

    @ApiProperty({ enum: Suit, nullable: true })
    suit: Suit | null;

    @ApiProperty({ example: "/images/tarot/major/00-the-fool.jpg" })
    thumbnailUrl: string;
  }

  export class CardDetailDto extends CardSummaryDto {
    @ApiProperty({ example: "The Fool" })
    nameEn: string;

    @ApiProperty({ example: "0", nullable: true })
    romanNumeral: string | null;

    @ApiProperty({ enum: CourtRank, nullable: true })
    courtRank: CourtRank | null;

    @ApiProperty({ enum: Element, nullable: true })
    element: Element | null;

    @ApiProperty()
    meaningUpright: string;

    @ApiProperty()
    meaningReversed: string;

    @ApiProperty({ nullable: true })
    description: string | null;

    @ApiProperty({ type: CardKeywordsDto })
    keywords: CardKeywordsDto;

    @ApiProperty()
    imageUrl: string;

    @ApiProperty({ type: [Number], nullable: true })
    relatedCards: number[] | null;
  }
  ```

  ```typescript
  // card-filters.dto.ts
  import { ApiProperty } from "@nestjs/swagger";
  import { IsOptional, IsEnum, IsString } from "class-validator";
  import { ArcanaType, Suit, Element } from "../enums/tarot.enums";

  export class CardFiltersDto {
    @ApiProperty({ enum: ArcanaType, required: false })
    @IsOptional()
    @IsEnum(ArcanaType)
    arcanaType?: ArcanaType;

    @ApiProperty({ enum: Suit, required: false })
    @IsOptional()
    @IsEnum(Suit)
    suit?: Suit;

    @ApiProperty({ enum: Element, required: false })
    @IsOptional()
    @IsEnum(Element)
    element?: Element;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false, default: false })
    @IsOptional()
    courtOnly?: boolean;
  }
  ```

- [ ] Crear `encyclopedia.service.ts`:

  ```typescript
  import { Injectable, NotFoundException } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository, Like, In } from "typeorm";
  import { TarotCard } from "../entities/tarot-card.entity";
  import { CardFiltersDto } from "../application/dto/card-filters.dto";
  import { CardSummaryDto, CardDetailDto } from "../application/dto/card-response.dto";
  import { ArcanaType, Suit, CourtRank } from "../enums/tarot.enums";

  @Injectable()
  export class EncyclopediaService {
    constructor(
      @InjectRepository(TarotCard)
      private readonly cardRepository: Repository<TarotCard>,
    ) {}

    /**
     * Obtener todas las cartas con filtros opcionales
     */
    async findAll(filters?: CardFiltersDto): Promise<CardSummaryDto[]> {
      const query = this.cardRepository.createQueryBuilder("card");

      if (filters?.arcanaType) {
        query.andWhere("card.arcanaType = :arcanaType", {
          arcanaType: filters.arcanaType,
        });
      }

      if (filters?.suit) {
        query.andWhere("card.suit = :suit", { suit: filters.suit });
      }

      if (filters?.element) {
        query.andWhere("card.element = :element", { element: filters.element });
      }

      if (filters?.courtOnly) {
        query.andWhere("card.courtRank IS NOT NULL");
      }

      if (filters?.search) {
        query.andWhere("(card.nameEs ILIKE :search OR card.nameEn ILIKE :search)", { search: `%${filters.search}%` });
      }

      // Ordenar: Mayores primero por número, luego Menores por palo y número
      query.orderBy("card.arcanaType", "ASC").addOrderBy("card.suit", "ASC").addOrderBy("card.number", "ASC");

      const cards = await query.getMany();

      return cards.map(this.toSummaryDto);
    }

    /**
     * Obtener Arcanos Mayores
     */
    async getMajorArcana(): Promise<CardSummaryDto[]> {
      return this.findAll({ arcanaType: ArcanaType.MAJOR });
    }

    /**
     * Obtener cartas por palo
     */
    async getBySuit(suit: Suit): Promise<CardSummaryDto[]> {
      return this.findAll({ suit });
    }

    /**
     * Obtener carta por slug
     */
    async findBySlug(slug: string, userId?: number): Promise<CardDetailDto> {
      const card = await this.cardRepository.findOne({
        where: { slug },
      });

      if (!card) {
        throw new NotFoundException(`Carta "${slug}" no encontrada`);
      }

      // Incrementar contador de vistas (fire-and-forget)
      this.incrementViewCount(card.id).catch(() => {});

      return this.toDetailDto(card);
    }

    /**
     * Obtener carta por ID
     */
    async findById(id: number): Promise<TarotCard> {
      const card = await this.cardRepository.findOne({ where: { id } });

      if (!card) {
        throw new NotFoundException(`Carta con ID ${id} no encontrada`);
      }

      return card;
    }

    /**
     * Obtener cartas relacionadas
     */
    async getRelatedCards(cardId: number): Promise<CardSummaryDto[]> {
      const card = await this.findById(cardId);

      if (!card.relatedCards || card.relatedCards.length === 0) {
        return [];
      }

      const related = await this.cardRepository.find({
        where: { id: In(card.relatedCards) },
      });

      return related.map(this.toSummaryDto);
    }

    /**
     * Buscar cartas por texto
     */
    async search(term: string): Promise<CardSummaryDto[]> {
      return this.findAll({ search: term });
    }

    /**
     * Obtener carta anterior y siguiente
     */
    async getNavigation(cardId: number): Promise<{
      previous: CardSummaryDto | null;
      next: CardSummaryDto | null;
    }> {
      const card = await this.findById(cardId);
      const allCards = await this.findAll();

      const currentIndex = allCards.findIndex((c) => c.id === cardId);

      return {
        previous: currentIndex > 0 ? allCards[currentIndex - 1] : null,
        next: currentIndex < allCards.length - 1 ? allCards[currentIndex + 1] : null,
      };
    }

    /**
     * Incrementar contador de vistas
     */
    private async incrementViewCount(cardId: number): Promise<void> {
      await this.cardRepository
        .createQueryBuilder()
        .update()
        .set({ viewCount: () => "view_count + 1" })
        .where("id = :id", { id: cardId })
        .execute();
    }

    private toSummaryDto(card: TarotCard): CardSummaryDto {
      return {
        id: card.id,
        slug: card.slug,
        nameEs: card.nameEs,
        arcanaType: card.arcanaType,
        number: card.number,
        suit: card.suit,
        thumbnailUrl: card.thumbnailUrl || card.imageUrl,
      };
    }

    private toDetailDto(card: TarotCard): CardDetailDto {
      return {
        ...this.toSummaryDto(card),
        nameEn: card.nameEn,
        romanNumeral: card.romanNumeral,
        courtRank: card.courtRank,
        element: card.element,
        meaningUpright: card.meaningUpright,
        meaningReversed: card.meaningReversed,
        description: card.description,
        keywords: card.keywords,
        imageUrl: card.imageUrl,
        relatedCards: card.relatedCards,
      };
    }
  }
  ```

- [x] Crear `encyclopedia.module.ts`:

  ```typescript
  import { Module } from "@nestjs/common";
  import { TypeOrmModule } from "@nestjs/typeorm";
  import { TarotCard } from "./entities/tarot-card.entity";
  import { EncyclopediaService } from "./application/services/encyclopedia.service";
  import { EncyclopediaController } from "./infrastructure/controllers/encyclopedia.controller";

  @Module({
    imports: [TypeOrmModule.forFeature([TarotCard])],
    providers: [EncyclopediaService],
    controllers: [EncyclopediaController],
    exports: [EncyclopediaService],
  })
  export class EncyclopediaModule {}
  ```

- [x] Registrar en `app.module.ts`

##### Testing

- [x] Test: findAll retorna 78 cartas
- [x] Test: Filtro por arcanaType funciona
- [x] Test: Filtro por suit funciona
- [x] Test: Búsqueda por nombre funciona
- [x] Test: findBySlug retorna carta correcta
- [x] Test: 404 para slug inexistente

---

#### 🎯 Criterios de Aceptación

- [x] Servicio consulta todas las cartas
- [x] Filtros funcionan correctamente
- [x] Búsqueda es case-insensitive
- [x] ViewCount se incrementa

# Backend: Endpoints

---

### TASK-304: Crear endpoints de Enciclopedia

**Módulo:** `src/modules/encyclopedia/infrastructure/controllers/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-303  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Implementar endpoints REST para consultar cartas.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/infrastructure/controllers/encyclopedia.controller.ts`
- `src/modules/encyclopedia/infrastructure/controllers/encyclopedia.controller.spec.ts`

**Endpoints:**

| Método | Ruta                                   | Descripción               | Auth |
| ------ | -------------------------------------- | ------------------------- | ---- |
| GET    | `/encyclopedia/cards`                  | Listar cartas con filtros | No   |
| GET    | `/encyclopedia/cards/major`            | Arcanos Mayores           | No   |
| GET    | `/encyclopedia/cards/suit/:suit`       | Cartas por palo           | No   |
| GET    | `/encyclopedia/cards/search`           | Buscar cartas             | No   |
| GET    | `/encyclopedia/cards/:slug`            | Detalle de carta          | No   |
| GET    | `/encyclopedia/cards/:slug/related`    | Cartas relacionadas       | No   |
| GET    | `/encyclopedia/cards/:slug/navigation` | Anterior/Siguiente        | No   |

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear `encyclopedia.controller.ts`:

  ```typescript
  import {
    Controller,
    Get,
    Param,
    Query,
    ParseEnumPipe,
  } from "@nestjs/common";
  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
  import { EncyclopediaService } from "../application/services/encyclopedia.service";
  import { CardFiltersDto } from "../application/dto/card-filters.dto";
  import { CardSummaryDto, CardDetailDto } from "../application/dto/card-response.dto";
  import { Suit } from "../enums/tarot.enums";

  @ApiTags("Encyclopedia")
  @Controller("encyclopedia")
  export class EncyclopediaController {
    constructor(
      private readonly encyclopediaService: EncyclopediaService,
    ) {}

    /**
     * GET /encyclopedia/cards
     * Listar todas las cartas con filtros opcionales
     */
    @Get("cards")
    @ApiOperation({ summary: "Listar cartas con filtros" })
    @ApiResponse({ status: 200, type: [CardSummaryDto] })
    async getCards(@Query() filters: CardFiltersDto): Promise<CardSummaryDto[]> {
      return this.encyclopediaService.findAll(filters);
    }

    /**
     * GET /encyclopedia/cards/major
     * Obtener Arcanos Mayores
     */
    @Get("cards/major")
    @ApiOperation({ summary: "Obtener Arcanos Mayores" })
    @ApiResponse({ status: 200, type: [CardSummaryDto] })
    async getMajorArcana(): Promise<CardSummaryDto[]> {
      return this.encyclopediaService.getMajorArcana();
    }

    /**
     * GET /encyclopedia/cards/suit/:suit
     * Obtener cartas por palo
     */
    @Get("cards/suit/:suit")
    @ApiOperation({ summary: "Obtener cartas por palo" })
    @ApiParam({ name: "suit", enum: Suit })
    @ApiResponse({ status: 200, type: [CardSummaryDto] })
    async getBySuit(@Param("suit", new ParseEnumPipe(Suit)) suit: Suit): Promise<CardSummaryDto[]> {
      return this.encyclopediaService.getBySuit(suit);
    }

    /**
     * GET /encyclopedia/cards/search
     * Buscar cartas
     */
    @Get("cards/search")
    @ApiOperation({ summary: "Buscar cartas por nombre" })
    @ApiQuery({ name: "q", description: "Término de búsqueda" })
    @ApiResponse({ status: 200, type: [CardSummaryDto] })
    async searchCards(@Query("q") query: string): Promise<CardSummaryDto[]> {
      if (!query || query.length < 2) {
        return [];
      }
      return this.encyclopediaService.search(query);
    }

    /**
     * GET /encyclopedia/cards/:slug
     * Obtener detalle de carta
     */
    @Get("cards/:slug")
    @ApiOperation({ summary: "Obtener detalle de una carta" })
    @ApiParam({ name: "slug", example: "the-fool" })
    @ApiResponse({ status: 200, type: CardDetailDto })
    @ApiResponse({ status: 404, description: "Carta no encontrada" })
    async getCardBySlug(@Param("slug") slug: string): Promise<CardDetailDto> {
      return this.encyclopediaService.findBySlug(slug);
    }

    /**
     * GET /encyclopedia/cards/:slug/related
     * Obtener cartas relacionadas
     */
    @Get("cards/:slug/related")
    @ApiOperation({ summary: "Obtener cartas relacionadas" })
    @ApiResponse({ status: 200, type: [CardSummaryDto] })
    async getRelatedCards(@Param("slug") slug: string): Promise<CardSummaryDto[]> {
      const card = await this.encyclopediaService.findBySlug(slug);
      return this.encyclopediaService.getRelatedCards(card.id);
    }

    /**
     * GET /encyclopedia/cards/:slug/navigation
     * Obtener carta anterior y siguiente
     */
    @Get("cards/:slug/navigation")
    @ApiOperation({ summary: "Obtener navegación (anterior/siguiente)" })
    async getNavigation(@Param("slug") slug: string): Promise<{
      previous: CardSummaryDto | null;
      next: CardSummaryDto | null;
    }> {
      const card = await this.encyclopediaService.findBySlug(slug);
      return this.encyclopediaService.getNavigation(card.id);
    }

  }
  ```

##### Testing

- [x] Test e2e: GET /encyclopedia/cards retorna 78 cartas
- [x] Test e2e: GET /encyclopedia/cards?arcanaType=major retorna 22
- [x] Test e2e: GET /encyclopedia/cards/suit/cups retorna 14
- [x] Test e2e: GET /encyclopedia/cards/search?q=mag retorna resultados
- [x] Test e2e: GET /encyclopedia/cards/the-fool retorna detalle
- [x] Test e2e: GET /encyclopedia/cards/invalid retorna 404

---

#### 🎯 Criterios de Aceptación

- [x] Todos los endpoints funcionan
- [x] Filtros se aplican correctamente
- [x] Documentación Swagger completa

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - La búsqueda requiere mínimo 2 caracteres
> - Usar ILIKE para búsqueda case-insensitive en PostgreSQL

---

# Backend: Enciclopedia Mística (artículos estáticos)

---

### TASK-309: Crear entidad EncyclopediaArticle y migración

**Módulo:** `src/modules/encyclopedia/`
**Prioridad:** 🔴 ALTA
**Estimación:** 1 día
**Dependencias:** TASK-300 (comparte módulo de enciclopedia existente)

---

#### 📋 Descripción

Ampliar el módulo `encyclopedia` con una nueva entidad `EncyclopediaArticle` para todos los contenidos no-tarot: signos zodiacales, planetas, casas, elementos, modalidades y guías de actividades.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/entities/encyclopedia-article.entity.ts`
- `src/modules/encyclopedia/enums/article.enums.ts`
- `src/database/migrations/XXXX-CreateEncyclopediaArticles.ts`

**Archivo a modificar:**

- `src/modules/encyclopedia/encyclopedia.module.ts` (agregar `EncyclopediaArticle` al `TypeOrmModule.forFeature`)

**Enums:**

```typescript
// article.enums.ts
export enum ArticleCategory {
  ZODIAC_SIGN = 'zodiac_sign',
  PLANET = 'planet',
  ASTROLOGICAL_HOUSE = 'astro_house',
  ELEMENT = 'element',
  MODALITY = 'modality',
  GUIDE_NUMEROLOGY = 'guide_numerology',
  GUIDE_PENDULUM = 'guide_pendulum',
  GUIDE_BIRTH_CHART = 'guide_birth_chart',
  GUIDE_RITUAL = 'guide_ritual',
  GUIDE_HOROSCOPE = 'guide_horoscope',
  GUIDE_CHINESE = 'guide_chinese',
}
```

**Entidad:**

```typescript
// encyclopedia-article.entity.ts
@Entity('encyclopedia_articles')
@Index('idx_article_category', ['category'])
export class EncyclopediaArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  @Index('idx_article_slug', { unique: true })
  slug: string; // 'aries', 'mercury', 'house-1', 'guide-numerology'

  @Column({ type: 'varchar', length: 120 })
  nameEs: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  nameEn: string | null;

  @Column({ type: 'enum', enum: ArticleCategory })
  category: ArticleCategory;

  @Column({ type: 'text' })
  snippet: string; // 2-3 oraciones para el widget "Ver más"

  @Column({ type: 'text' })
  content: string; // Markdown completo para la página de detalle

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null; // Símbolo, fechas, elemento, etc.

  @Column({ type: 'jsonb', nullable: true })
  relatedArticles: string[] | null; // Slugs de artículos relacionados

  @Column({ type: 'jsonb', nullable: true })
  relatedTarotCards: number[] | null; // IDs de TarotCard relacionadas

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'smallint', default: 0 })
  sortOrder: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Migración:** Crear tabla `encyclopedia_articles` con enum `article_category_enum` en PostgreSQL. Índices en `slug` (unique) y `category`.

---

#### ✅ Criterios de Aceptación

- [ ] Migración ejecuta sin errores
- [ ] Entidad soporta todos los tipos de contenido (11 categorías)
- [ ] Índice de slug permite búsqueda rápida
- [ ] Campo `snippet` separado de `content` (optimización para widgets)

---

#### 🧪 Tests TDD

```typescript
// encyclopedia-article.entity.spec.ts
describe('EncyclopediaArticle entity', () => {
  it('debe crearse con todos los campos requeridos');
  it('debe rechazar slug duplicado (constraint unique)');
  it('debe validar el enum de categoría');
  it('debe aceptar estructura flexible en JSONB metadata');
  it('debe inicializar viewCount en 0');
});
```

---

#### 📎 Notas para el Agente IA

> - Seguir el mismo patrón de entidad que `tarot-card.entity.ts` (misma convención de decoradores, índices, snake_case para nombres de columna via `NamingStrategy`)
> - El campo `snippet` (máx ~300 chars) es distinto de `content` (puede ser miles de chars en Markdown)
> - Los slugs deben ser URL-safe: minúsculas, sin tildes, guiones en lugar de espacios

---

### TASK-310: Crear seeder de artículos de la Enciclopedia Mística

**Módulo:** `src/modules/encyclopedia/data/`
**Prioridad:** 🔴 ALTA
**Estimación:** 2 días
**Dependencias:** TASK-309

---

#### 📋 Descripción

Crear los archivos de datos seed con contenido real en español para las ~95 entradas nuevas: 12 signos, 10 planetas, 12 casas, 4 elementos, 3 modalidades y 6 guías de actividades.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
src/modules/encyclopedia/data/
├── zodiac-signs.data.ts        (12 entradas)
├── planets.data.ts             (10 entradas)
├── astrological-houses.data.ts (12 entradas)
├── elements-modalities.data.ts (7 entradas: 4 elementos + 3 modalidades)
├── activity-guides.data.ts     (6 guías con contenido editorial extenso)
└── articles-seed.data.ts       (agrupador que exporta todos)

src/database/seeds/
└── encyclopedia-articles.seed.ts
```

**Interfaz de datos:**

```typescript
export interface ArticleSeedData {
  slug: string;
  nameEs: string;
  nameEn: string | null;
  category: ArticleCategory;
  snippet: string; // Máx ~300 caracteres. Texto para el widget "Ver más"
  content: string; // Markdown completo
  metadata: Record<string, unknown> | null;
  relatedTarotCards: number[] | null; // IDs de cartas de tarot relacionadas
  sortOrder: number;
}
```

**Ejemplo de dato para signo zodiacal:**

```typescript
{
  slug: 'aries',
  nameEs: 'Aries',
  nameEn: 'Aries',
  category: ArticleCategory.ZODIAC_SIGN,
  snippet: 'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal. Simboliza el inicio, la energía pionera y el impulso de actuar.',
  content: `# Aries\n\n**Fechas:** 21 de marzo - 19 de abril\n**Elemento:** Fuego\n**Modalidad:** Cardinal\n**Planeta regente:** Marte\n\n## Carácter y Personalidad\n...`,
  metadata: {
    symbol: '♈',
    element: 'fire',
    modality: 'cardinal',
    rulingPlanet: 'mars',
    dateRange: '21 Mar - 19 Abr',
    compatibleSigns: ['leo', 'sagittarius', 'gemini', 'aquarius'],
  },
  relatedTarotCards: [4], // El Emperador (ID)
  sortOrder: 1,
}
```

**Seed idempotente:**

```typescript
// encyclopedia-articles.seed.ts
export async function seedEncyclopediaArticles(dataSource: DataSource) {
  const repo = dataSource.getRepository(EncyclopediaArticle);
  const existing = await repo.count();
  if (existing > 0) return; // No duplicar
  await repo.insert(ALL_ARTICLES_DATA);
}
```

---

#### ✅ Criterios de Aceptación

- [ ] Seed inserta ~95 artículos correctamente
- [ ] Seed es idempotente (no duplica en ejecuciones sucesivas)
- [ ] Todos los slugs son únicos y URL-safe
- [ ] `snippet` y `content` no están vacíos en ningún artículo
- [ ] Los `relatedTarotCards` referencian IDs válidos del seeder de cartas

---

#### 🧪 Tests TDD

```typescript
describe('EncyclopediaArticles seeder', () => {
  it('debe insertar ~95 artículos en la BD');
  it('no debe duplicar artículos en segunda ejecución');
  it('todos los slugs deben ser únicos');
  it('snippet y content deben ser no vacíos');
  it('sortOrder de signos zodiacales va de 1 a 12');
});
```

---

### TASK-311: Crear ArticlesService y DTOs

**Módulo:** `src/modules/encyclopedia/application/`
**Prioridad:** 🔴 ALTA
**Estimación:** 1 día
**Dependencias:** TASK-309, TASK-310

---

#### 📋 Descripción

Crear el servicio `ArticlesService` que gestiona los artículos de la enciclopedia mística y los DTOs de respuesta correspondientes.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/application/services/articles.service.ts`
- `src/modules/encyclopedia/application/dto/article-response.dto.ts`
- `src/modules/encyclopedia/application/dto/article-filters.dto.ts`

**DTOs:**

```typescript
// article-response.dto.ts
export class ArticleSnippetDto {
  @ApiProperty() id: number;
  @ApiProperty() slug: string;
  @ApiProperty() nameEs: string;
  @ApiProperty({ enum: ArticleCategory }) category: ArticleCategory;
  @ApiProperty() snippet: string;
  // NO incluye content - optimizado para el widget "Ver más"
}

export class ArticleSummaryDto extends ArticleSnippetDto {
  @ApiProperty({ nullable: true }) imageUrl: string | null;
  @ApiProperty() sortOrder: number;
}

export class ArticleDetailDto extends ArticleSummaryDto {
  @ApiProperty({ nullable: true }) nameEn: string | null;
  @ApiProperty() content: string; // Markdown completo
  @ApiProperty({ nullable: true }) metadata: Record<string, unknown> | null;
  @ApiProperty({ type: [ArticleSummaryDto] }) relatedArticles: ArticleSummaryDto[];
  @ApiProperty({ nullable: true }) relatedTarotCards: number[] | null;
}
```

**Métodos del servicio:**

```typescript
@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(EncyclopediaArticle)
    private readonly articleRepository: Repository<EncyclopediaArticle>,
  ) {}

  // Para el widget "Ver más" - retorna solo snippet, NO content
  async getSnippetBySlug(slug: string): Promise<ArticleSnippetDto>

  // Para la página de detalle - retorna content completo con relaciones resueltas
  async findBySlug(slug: string): Promise<ArticleDetailDto>

  // Para el listado de una categoría
  async findByCategory(category: ArticleCategory): Promise<ArticleSummaryDto[]>

  // Búsqueda case-insensitive en nombre y snippet
  async search(term: string): Promise<ArticleSummaryDto[]>

  // Para artículos relacionados (resuelve slugs a entidades)
  async findRelated(slugs: string[]): Promise<ArticleSummaryDto[]>

  // Fire-and-forget (no await)
  private incrementViewCount(id: number): void
}
```

---

#### ✅ Criterios de Aceptación

- [ ] `getSnippetBySlug` NO incluye el campo `content` en su respuesta
- [ ] `findBySlug` incluye `content` completo y resuelve `relatedArticles` de slugs a objetos
- [ ] `search` es case-insensitive (ILIKE en PostgreSQL)
- [ ] Lanza `NotFoundException` para slug inexistente
- [ ] `incrementViewCount` es fire-and-forget (no bloquea la respuesta)

---

#### 🧪 Tests TDD

```typescript
describe('ArticlesService', () => {
  it('getSnippetBySlug debe retornar snippet sin campo content');
  it('findBySlug debe retornar articulo con content completo');
  it('findBySlug debe lanzar NotFoundException si slug no existe');
  it('search debe ser case-insensitive');
  it('search con término vacío debe retornar array vacío');
  it('findByCategory debe retornar artículos ordenados por sortOrder');
});
```

---

### TASK-312: Crear endpoints REST de artículos

**Módulo:** `src/modules/encyclopedia/infrastructure/controllers/`
**Prioridad:** 🔴 ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-311

---

#### 📋 Descripción

Crear el controlador `ArticlesController` con los endpoints públicos para consultar artículos de la enciclopedia mística.

---

#### 🏗️ Contexto Técnico

**Archivo a crear:**

- `src/modules/encyclopedia/infrastructure/controllers/articles.controller.ts`

**Endpoints:**

| Método | Ruta                                        | Descripción                                  | Auth |
| ------ | ------------------------------------------- | -------------------------------------------- | ---- |
| GET    | `/encyclopedia/articles`                    | Listar artículos (filtros: category, search) | No   |
| GET    | `/encyclopedia/articles/categories`         | Listar categorías con conteo de artículos    | No   |
| GET    | `/encyclopedia/articles/snippet/:slug`      | Snippet del artículo (para el widget)        | No   |
| GET    | `/encyclopedia/articles/:slug`              | Detalle completo del artículo                | No   |
| GET    | `/encyclopedia/articles/category/:category` | Artículos de una categoría                   | No   |

**Query params para `/encyclopedia/articles`:**

```typescript
export class ArticleFiltersDto {
  @IsOptional()
  @IsEnum(ArticleCategory)
  category?: ArticleCategory;

  @IsOptional()
  @MinLength(2)
  search?: string;
}
```

**Nota importante:** El endpoint `/snippet/:slug` es crítico para el widget frontend — retorna solo `id, slug, nameEs, category, snippet` sin el campo `content` para mantener respuestas rápidas y ligeras.

---

#### ✅ Criterios de Aceptación

- [ ] `GET /articles?category=zodiac_sign` retorna 12 signos
- [ ] `GET /articles/snippet/aries` retorna solo el snippet (sin `content`)
- [ ] `GET /articles/aries` retorna artículo completo con `content`
- [ ] `GET /articles?search=mercurio` retorna resultados relevantes
- [ ] `GET /articles/nonexistent` retorna `404`
- [ ] Todos los endpoints documentados en Swagger con `@ApiTags('encyclopedia')`

---

#### 🧪 Tests TDD

```typescript
describe('ArticlesController', () => {
  it('GET /articles?category=zodiac_sign debe retornar 12 signos');
  it('GET /articles/snippet/aries no debe incluir campo content');
  it('GET /articles/aries debe incluir campo content');
  it('GET /articles?search=mercurio debe retornar resultados');
  it('GET /articles/nonexistent debe retornar 404');
});
```

---

### TASK-313: Endpoint de búsqueda global unificada

**Módulo:** `src/modules/encyclopedia/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 0.5 días
**Dependencias:** TASK-311, TASK-312

---

#### 📋 Descripción

Ampliar la búsqueda de la enciclopedia para buscar simultáneamente en `TarotCard` (por nombre) y en `EncyclopediaArticle` (por nombre y snippet), retornando resultados unificados.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

- `src/modules/encyclopedia/application/services/encyclopedia.service.ts` (agregar método `globalSearch`)
- `src/modules/encyclopedia/infrastructure/controllers/encyclopedia.controller.ts` (nuevo endpoint)

**Endpoint:**

```
GET /encyclopedia/search?q={term}
```

**Respuesta:**

```typescript
export class GlobalSearchResultDto {
  @ApiProperty({ type: [CardSummaryDto] }) tarotCards: CardSummaryDto[];
  @ApiProperty({ type: [ArticleSummaryDto] }) articles: ArticleSummaryDto[];
  @ApiProperty() total: number;
}
```

**Regla:** Si `term.length < 2` retornar `{ tarotCards: [], articles: [], total: 0 }` sin consultar la BD.

---

#### 🧪 Tests TDD

```typescript
describe('Encyclopedia globalSearch', () => {
  it('buscar "mercurio" debe retornar artículo de planeta Y cartas de tarot con mercurio');
  it('buscar "agua" debe retornar elemento Agua y cartas de Copas');
  it('búsqueda con menos de 2 caracteres debe retornar arrays vacíos');
  it('sin resultados debe retornar arrays vacíos con total: 0');
});
```

---

### TASK-314: Incremento de viewCount para artículos (fire-and-forget)

**Módulo:** `src/modules/encyclopedia/application/services/`
**Prioridad:** 🟢 BAJA
**Estimación:** 0.25 días
**Dependencias:** TASK-311

---

#### 📋 Descripción

Aplicar el mismo patrón fire-and-forget ya usado para viewCount en el servicio de cartas de tarot. Al llamar `findBySlug` en `ArticlesService` se incrementa el contador de vistas del artículo sin bloquear la respuesta.

**Método a agregar en `ArticlesService`:**

```typescript
private incrementViewCount(id: number): void {
  this.articleRepository
    .increment({ id }, 'viewCount', 1)
    .catch(() => {/* silencioso */});
}
```

---

# Frontend: Types, API y Hooks

---

### TASK-305: Crear tipos TypeScript para Enciclopedia

**Módulo:** `frontend/src/types/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-304

---

#### 📋 Descripción

Crear los tipos TypeScript y funciones de API para la enciclopedia del Tarot.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/types/encyclopedia.types.ts`
- `frontend/src/lib/api/encyclopedia-api.ts`
- `frontend/src/hooks/api/useEncyclopedia.ts`

**Archivos a modificar:**

- `frontend/src/lib/api/endpoints.ts`
- `frontend/src/types/index.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `encyclopedia.types.ts`:

  ```typescript
  // Enums
  export enum ArcanaType {
    MAJOR = "major",
    MINOR = "minor",
  }

  export enum Suit {
    WANDS = "wands",
    CUPS = "cups",
    SWORDS = "swords",
    PENTACLES = "pentacles",
  }

  export enum CourtRank {
    PAGE = "page",
    KNIGHT = "knight",
    QUEEN = "queen",
    KING = "king",
  }

  export enum Element {
    FIRE = "fire",
    WATER = "water",
    AIR = "air",
    EARTH = "earth",
    SPIRIT = "spirit",
  }

  // Interfaces
  export interface CardKeywords {
    upright: string[];
    reversed: string[];
  }

  export interface CardSummary {
    id: number;
    slug: string;
    nameEs: string;
    arcanaType: ArcanaType;
    number: number;
    suit: Suit | null;
    thumbnailUrl: string;
  }

  export interface CardDetail extends CardSummary {
    nameEn: string;
    romanNumeral: string | null;
    courtRank: CourtRank | null;
    element: Element | null;
    meaningUpright: string;
    meaningReversed: string;
    description: string | null;
    keywords: CardKeywords;
    imageUrl: string;
    relatedCards: number[] | null;
  }

  export interface CardNavigation {
    previous: CardSummary | null;
    next: CardSummary | null;
  }

  export interface CardFilters {
    arcanaType?: ArcanaType;
    suit?: Suit;
    element?: Element;
    search?: string;
    courtOnly?: boolean;
  }

  // Helpers de UI
  export interface SuitInfo {
    suit: Suit;
    nameEs: string;
    nameEn: string;
    element: Element;
    symbol: string;
    color: string;
  }

  export const SUIT_INFO: Record<Suit, SuitInfo> = {
    [Suit.WANDS]: {
      suit: Suit.WANDS,
      nameEs: "Bastos",
      nameEn: "Wands",
      element: Element.FIRE,
      symbol: "🪄",
      color: "text-orange-500",
    },
    [Suit.CUPS]: {
      suit: Suit.CUPS,
      nameEs: "Copas",
      nameEn: "Cups",
      element: Element.WATER,
      symbol: "🏆",
      color: "text-blue-500",
    },
    [Suit.SWORDS]: {
      suit: Suit.SWORDS,
      nameEs: "Espadas",
      nameEn: "Swords",
      element: Element.AIR,
      symbol: "⚔️",
      color: "text-slate-500",
    },
    [Suit.PENTACLES]: {
      suit: Suit.PENTACLES,
      nameEs: "Oros",
      nameEn: "Pentacles",
      element: Element.EARTH,
      symbol: "🪙",
      color: "text-amber-500",
    },
  };

  export const ELEMENT_INFO: Record<Element, { nameEs: string; color: string }> = {
    [Element.FIRE]: { nameEs: "Fuego", color: "text-red-500" },
    [Element.WATER]: { nameEs: "Agua", color: "text-blue-500" },
    [Element.AIR]: { nameEs: "Aire", color: "text-sky-500" },
    [Element.EARTH]: { nameEs: "Tierra", color: "text-green-500" },
    [Element.SPIRIT]: { nameEs: "Espíritu", color: "text-purple-500" },
  };
  ```

- [ ] Agregar endpoints en `endpoints.ts`:

  ```typescript
  export const API_ENDPOINTS = {
    // ...existentes

    ENCYCLOPEDIA: {
      CARDS: "/encyclopedia/cards",
      MAJOR: "/encyclopedia/cards/major",
      BY_SUIT: (suit: string) => `/encyclopedia/cards/suit/${suit}`,
      SEARCH: "/encyclopedia/cards/search",
      CARD_DETAIL: (slug: string) => `/encyclopedia/cards/${slug}`,
      CARD_RELATED: (slug: string) => `/encyclopedia/cards/${slug}/related`,
      CARD_NAVIGATION: (slug: string) => `/encyclopedia/cards/${slug}/navigation`,
    },
  } as const;
  ```

- [ ] Crear `encyclopedia-api.ts`:

  ```typescript
  import { apiClient } from "./axios-config";
  import { API_ENDPOINTS } from "./endpoints";
  import type { CardSummary, CardDetail, CardNavigation, CardFilters, Suit } from "@/types/encyclopedia.types";

  export async function getCards(filters?: CardFilters): Promise<CardSummary[]> {
    const params = new URLSearchParams();

    if (filters?.arcanaType) params.append("arcanaType", filters.arcanaType);
    if (filters?.suit) params.append("suit", filters.suit);
    if (filters?.element) params.append("element", filters.element);
    if (filters?.courtOnly) params.append("courtOnly", "true");

    const response = await apiClient.get<CardSummary[]>(`${API_ENDPOINTS.ENCYCLOPEDIA.CARDS}?${params.toString()}`);
    return response.data;
  }

  export async function getMajorArcana(): Promise<CardSummary[]> {
    const response = await apiClient.get<CardSummary[]>(API_ENDPOINTS.ENCYCLOPEDIA.MAJOR);
    return response.data;
  }

  export async function getCardsBySuit(suit: Suit): Promise<CardSummary[]> {
    const response = await apiClient.get<CardSummary[]>(API_ENDPOINTS.ENCYCLOPEDIA.BY_SUIT(suit));
    return response.data;
  }

  export async function searchCards(query: string): Promise<CardSummary[]> {
    const response = await apiClient.get<CardSummary[]>(
      `${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH}?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  }

  export async function getCardBySlug(slug: string): Promise<CardDetail> {
    const response = await apiClient.get<CardDetail>(API_ENDPOINTS.ENCYCLOPEDIA.CARD_DETAIL(slug));
    return response.data;
  }

  export async function getRelatedCards(slug: string): Promise<CardSummary[]> {
    const response = await apiClient.get<CardSummary[]>(API_ENDPOINTS.ENCYCLOPEDIA.CARD_RELATED(slug));
    return response.data;
  }

  export async function getCardNavigation(slug: string): Promise<CardNavigation> {
    const response = await apiClient.get<CardNavigation>(API_ENDPOINTS.ENCYCLOPEDIA.CARD_NAVIGATION(slug));
    return response.data;
  }
  ```

- [ ] Crear `useEncyclopedia.ts`:

  ```typescript
  "use client";

  import { useQuery } from "@tanstack/react-query";
  import {
    getCards,
    getMajorArcana,
    getCardsBySuit,
    searchCards,
    getCardBySlug,
    getRelatedCards,
    getCardNavigation,
  } from "@/lib/api/encyclopedia-api";
  import type { CardFilters, Suit } from "@/types/encyclopedia.types";

  export const encyclopediaKeys = {
    all: ["encyclopedia"] as const,
    cards: (filters?: CardFilters) => [...encyclopediaKeys.all, "cards", filters] as const,
    major: () => [...encyclopediaKeys.all, "major"] as const,
    suit: (suit: Suit) => [...encyclopediaKeys.all, "suit", suit] as const,
    search: (query: string) => [...encyclopediaKeys.all, "search", query] as const,
    card: (slug: string) => [...encyclopediaKeys.all, "card", slug] as const,
    related: (slug: string) => [...encyclopediaKeys.all, "related", slug] as const,
    navigation: (slug: string) => [...encyclopediaKeys.all, "navigation", slug] as const,
  };

  export function useCards(filters?: CardFilters) {
    return useQuery({
      queryKey: encyclopediaKeys.cards(filters),
      queryFn: () => getCards(filters),
      staleTime: 1000 * 60 * 60, // 1 hora (datos estáticos)
    });
  }

  export function useMajorArcana() {
    return useQuery({
      queryKey: encyclopediaKeys.major(),
      queryFn: getMajorArcana,
      staleTime: 1000 * 60 * 60,
    });
  }

  export function useCardsBySuit(suit: Suit) {
    return useQuery({
      queryKey: encyclopediaKeys.suit(suit),
      queryFn: () => getCardsBySuit(suit),
      staleTime: 1000 * 60 * 60,
    });
  }

  export function useSearchCards(query: string) {
    return useQuery({
      queryKey: encyclopediaKeys.search(query),
      queryFn: () => searchCards(query),
      enabled: query.length >= 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    });
  }

  export function useCard(slug: string) {
    return useQuery({
      queryKey: encyclopediaKeys.card(slug),
      queryFn: () => getCardBySlug(slug),
      enabled: !!slug,
      staleTime: 1000 * 60 * 60,
    });
  }

  export function useRelatedCards(slug: string) {
    return useQuery({
      queryKey: encyclopediaKeys.related(slug),
      queryFn: () => getRelatedCards(slug),
      enabled: !!slug,
      staleTime: 1000 * 60 * 60,
    });
  }

  export function useCardNavigation(slug: string) {
    return useQuery({
      queryKey: encyclopediaKeys.navigation(slug),
      queryFn: () => getCardNavigation(slug),
      enabled: !!slug,
    });
  }
  ```

- [ ] Exportar desde `types/index.ts`

##### Testing

- [ ] Test: Tipos se exportan correctamente
- [ ] Test: API functions hacen llamadas correctas
- [ ] Test: Hooks retornan datos esperados
- [ ] Test: useSearchCards solo ejecuta con 2+ caracteres

---

#### 🎯 Criterios de Aceptación

- [ ] Tipos completos para todas las entidades
- [ ] API functions cubren todos los endpoints
- [ ] Hooks con staleTime apropiado (1h para datos estáticos)

# Frontend: Componentes de Lista y Navegación

---

### TASK-306: Crear componentes de listado de cartas

**Módulo:** `frontend/src/components/features/encyclopedia/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-305

---

#### 📋 Descripción

Crear componentes para mostrar listas de cartas, tarjetas individuales y controles de navegación.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/encyclopedia/
├── index.ts
├── CardThumbnail.tsx
├── CardGrid.tsx
├── CardListItem.tsx
├── SuitSelector.tsx
├── CategoryTabs.tsx
├── SearchBar.tsx
├── EncyclopediaSkeleton.tsx
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `CardThumbnail.tsx`:

  ```tsx
  "use client";

  import Image from "next/image";
  import Link from "next/link";
  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { cn } from "@/lib/utils";
  import { SUIT_INFO, ArcanaType } from "@/types/encyclopedia.types";
  import type { CardSummary } from "@/types/encyclopedia.types";

  interface CardThumbnailProps {
    card: CardSummary;
    showBadge?: boolean;
    className?: string;
  }

  export function CardThumbnail({ card, showBadge = true, className }: CardThumbnailProps) {
    const suitInfo = card.suit ? SUIT_INFO[card.suit] : null;

    return (
      <Link href={`/enciclopedia/${card.slug}`}>
        <Card className={cn("group overflow-hidden transition-all hover:shadow-lg hover:scale-105", className)}>
          <div className="relative aspect-[2/3] bg-muted">
            <Image
              src={card.thumbnailUrl}
              alt={card.nameEs}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {showBadge && card.arcanaType === ArcanaType.MAJOR && (
              <Badge variant="secondary" className="absolute top-2 right-2">
                Mayor
              </Badge>
            )}
          </div>
          <div className="p-3 text-center">
            <h3 className="font-serif text-sm line-clamp-1">{card.nameEs}</h3>
          </div>
        </Card>
      </Link>
    );
  }
  ```

- [ ] Crear `CardGrid.tsx`:

  ```tsx
  "use client";

  import { CardThumbnail } from "./CardThumbnail";
  import { EncyclopediaSkeleton } from "./EncyclopediaSkeleton";
  import { cn } from "@/lib/utils";
  import type { CardSummary } from "@/types/encyclopedia.types";

  interface CardGridProps {
    cards: CardSummary[];
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
  }

  export function CardGrid({
    cards,
    isLoading = false,
    emptyMessage = "No se encontraron cartas",
    className,
  }: CardGridProps) {
    if (isLoading) {
      return <EncyclopediaSkeleton variant="grid" />;
    }

    if (cards.length === 0) {
      return <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>;
    }

    return (
      <div
        className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", className)}
      >
        {cards.map((card) => (
          <CardThumbnail key={card.id} card={card} />
        ))}
      </div>
    );
  }
  ```

- [ ] Crear `SuitSelector.tsx`:

  ```tsx
  "use client";

  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib/utils";
  import { Suit, SUIT_INFO } from "@/types/encyclopedia.types";

  interface SuitSelectorProps {
    selected?: Suit;
    onSelect: (suit: Suit) => void;
    className?: string;
  }

  export function SuitSelector({ selected, onSelect, className }: SuitSelectorProps) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {Object.values(SUIT_INFO).map((info) => (
          <Button
            key={info.suit}
            variant={selected === info.suit ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(info.suit)}
          >
            {info.symbol} {info.nameEs}
          </Button>
        ))}
      </div>
    );
  }
  ```

- [ ] Crear `CategoryTabs.tsx`:

  ```tsx
  "use client";

  import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

  type Category = "all" | "major" | "minor";

  interface CategoryTabsProps {
    value: Category;
    onChange: (value: Category) => void;
    className?: string;
  }

  export function CategoryTabs({ value, onChange, className }: CategoryTabsProps) {
    return (
      <Tabs value={value} onValueChange={(v) => onChange(v as Category)} className={className}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="major">Arcanos Mayores</TabsTrigger>
          <TabsTrigger value="minor">Arcanos Menores</TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }
  ```

- [ ] Crear `SearchBar.tsx`:

  ```tsx
  "use client";

  import { useState, useEffect } from "react";
  import { Search, X } from "lucide-react";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { useDebounce } from "@/hooks/useDebounce";

  interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
  }

  export function SearchBar({ onSearch, placeholder = "Buscar...", className }: SearchBarProps) {
    const [value, setValue] = useState("");
    const debouncedValue = useDebounce(value, 300);

    useEffect(() => {
      onSearch(debouncedValue);
    }, [debouncedValue, onSearch]);

    return (
      <div className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setValue("");
              onSearch("");
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  ```

- [ ] Crear `EncyclopediaSkeleton.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";

  interface Props {
    variant?: "grid" | "detail";
    count?: number;
  }

  export function EncyclopediaSkeleton({ variant = "grid", count = 12 }: Props) {
    if (variant === "detail") {
      return (
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-64 h-96" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="aspect-[2/3]" />
            <div className="p-3">
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          </Card>
        ))}
      </div>
    );
  }
  ```

- [ ] Crear `index.ts`:
  ```typescript
  export { CardThumbnail } from "./CardThumbnail";
  export { CardGrid } from "./CardGrid";
  export { SuitSelector } from "./SuitSelector";
  export { CategoryTabs } from "./CategoryTabs";
  export { SearchBar } from "./SearchBar";
  export { EncyclopediaSkeleton } from "./EncyclopediaSkeleton";
  // ... más exports en siguientes tareas
  ```

##### Testing

- [ ] Test: CardGrid renderiza cartas
- [ ] Test: CardThumbnail muestra badge correcto
- [ ] Test: SuitSelector selecciona palo
- [ ] Test: SearchBar debounce funciona
- [ ] Test: Skeleton muestra placeholders

---

#### 🎯 Criterios de Aceptación

- [ ] Grid responsive (2-6 columnas)
- [ ] Badges identifican tipo de carta
- [ ] Búsqueda con debounce 300ms
- [ ] Loading states con skeletons
- [ ] Hover effects en cards

# Frontend: Componentes de Detalle

---

### TASK-307: Crear componentes de detalle de carta

**Módulo:** `frontend/src/components/features/encyclopedia/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-306

---

#### 📋 Descripción

Crear componentes para mostrar el detalle completo de una carta, incluyendo significados, palabras clave y navegación.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/encyclopedia/
├── CardDetailView.tsx
├── CardImage.tsx
├── CardMeaning.tsx
├── CardKeywords.tsx
├── CardMetadata.tsx
├── CardNavigation.tsx
├── RelatedCards.tsx
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `CardImage.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import Image from "next/image";
  import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
  import { cn } from "@/lib/utils";

  interface CardImageProps {
    src: string;
    alt: string;
    className?: string;
  }

  export function CardImage({ src, alt, className }: CardImageProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div
            className={cn(
              "relative cursor-zoom-in overflow-hidden rounded-lg shadow-lg",
              "w-full max-w-xs aspect-[2/3]",
              className,
            )}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, 320px"
              priority
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="relative aspect-[2/3]">
            <Image src={src} alt={alt} fill className="object-contain" sizes="(max-width: 768px) 100vw, 672px" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  ```

- [ ] Crear `CardMeaning.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { ArrowUp, ArrowDown } from "lucide-react";

  interface CardMeaningProps {
    meaningUpright: string;
    meaningReversed: string;
  }

  export function CardMeaning({ meaningUpright, meaningReversed }: CardMeaningProps) {
    return (
      <Card className="p-6">
        <Tabs defaultValue="upright">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upright" className="gap-2">
              <ArrowUp className="h-4 w-4" />
              Derecha
            </TabsTrigger>
            <TabsTrigger value="reversed" className="gap-2">
              <ArrowDown className="h-4 w-4" />
              Invertida
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upright" className="mt-0">
            <p className="text-muted-foreground leading-relaxed">{meaningUpright}</p>
          </TabsContent>

          <TabsContent value="reversed" className="mt-0">
            <p className="text-muted-foreground leading-relaxed">{meaningReversed}</p>
          </TabsContent>
        </Tabs>
      </Card>
    );
  }
  ```

- [ ] Crear `CardKeywords.tsx`:

  ```tsx
  "use client";

  import { Badge } from "@/components/ui/badge";
  import { Card } from "@/components/ui/card";
  import { ArrowUp, ArrowDown } from "lucide-react";
  import type { CardKeywords as Keywords } from "@/types/encyclopedia.types";

  interface CardKeywordsProps {
    keywords: Keywords;
  }

  export function CardKeywords({ keywords }: CardKeywordsProps) {
    return (
      <Card className="p-6">
        <h3 className="font-serif text-lg mb-4">Palabras Clave</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span>Derecha</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.upright.map((keyword, i) => (
                <Badge key={i} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span>Invertida</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.reversed.map((keyword, i) => (
                <Badge key={i} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }
  ```

- [ ] Crear `CardMetadata.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { ArcanaType, SUIT_INFO, ELEMENT_INFO, CourtRank } from "@/types/encyclopedia.types";
  import type { CardDetail } from "@/types/encyclopedia.types";

  interface CardMetadataProps {
    card: CardDetail;
  }

  const COURT_NAMES: Record<CourtRank, string> = {
    [CourtRank.PAGE]: "Paje",
    [CourtRank.KNIGHT]: "Caballero",
    [CourtRank.QUEEN]: "Reina",
    [CourtRank.KING]: "Rey",
  };

  export function CardMetadata({ card }: CardMetadataProps) {
    const suitInfo = card.suit ? SUIT_INFO[card.suit] : null;
    const elementInfo = card.element ? ELEMENT_INFO[card.element] : null;

    return (
      <Card className="p-6">
        <h3 className="font-serif text-lg mb-4">Información</h3>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Arcano</dt>
            <dd className="font-medium">{card.arcanaType === ArcanaType.MAJOR ? "Mayor" : "Menor"}</dd>
          </div>

          {card.romanNumeral && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Número</dt>
              <dd className="font-medium">{card.romanNumeral}</dd>
            </div>
          )}

          {suitInfo && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Palo</dt>
              <dd className="font-medium">
                {suitInfo.symbol} {suitInfo.nameEs}
              </dd>
            </div>
          )}

          {card.courtRank && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Rango</dt>
              <dd className="font-medium">{COURT_NAMES[card.courtRank]}</dd>
            </div>
          )}

          {elementInfo && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Elemento</dt>
              <dd className={`font-medium ${elementInfo.color}`}>{elementInfo.nameEs}</dd>
            </div>
          )}
        </dl>
      </Card>
    );
  }
  ```

- [ ] Crear `CardNavigation.tsx`:

  ```tsx
  "use client";

  import Link from "next/link";
  import { ChevronLeft, ChevronRight } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { useCardNavigation } from "@/hooks/api/useEncyclopedia";

  interface CardNavigationProps {
    slug: string;
  }

  export function CardNavigation({ slug }: CardNavigationProps) {
    const { data: navigation, isLoading } = useCardNavigation(slug);

    if (isLoading || !navigation) {
      return null;
    }

    return (
      <div className="flex justify-between items-center">
        {navigation.previous ? (
          <Button variant="ghost" asChild>
            <Link href={`/enciclopedia/${navigation.previous.slug}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {navigation.previous.nameEs}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {navigation.next ? (
          <Button variant="ghost" asChild>
            <Link href={`/enciclopedia/${navigation.next.slug}`}>
              {navigation.next.nameEs}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    );
  }
  ```

- [ ] Crear `RelatedCards.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { CardThumbnail } from "./CardThumbnail";
  import { useRelatedCards } from "@/hooks/api/useEncyclopedia";
  import { Skeleton } from "@/components/ui/skeleton";

  interface RelatedCardsProps {
    slug: string;
  }

  export function RelatedCards({ slug }: RelatedCardsProps) {
    const { data: cards, isLoading } = useRelatedCards(slug);

    if (isLoading) {
      return (
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="aspect-[2/3]" />
            <Skeleton className="aspect-[2/3]" />
            <Skeleton className="aspect-[2/3]" />
          </div>
        </Card>
      );
    }

    if (!cards || cards.length === 0) {
      return null;
    }

    return (
      <Card className="p-6">
        <h3 className="font-serif text-lg mb-4">Cartas Relacionadas</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {cards.map((card) => (
            <CardThumbnail key={card.id} card={card} showBadge={false} />
          ))}
        </div>
      </Card>
    );
  }
  ```

- [ ] Crear `CardDetailView.tsx` (componente principal):

  ```tsx
  "use client";

  import { ArrowLeft } from "lucide-react";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  import { CardImage } from "./CardImage";
  import { CardMeaning } from "./CardMeaning";
  import { CardKeywords } from "./CardKeywords";
  import { CardMetadata } from "./CardMetadata";
  import { CardNavigation } from "./CardNavigation";
  import { RelatedCards } from "./RelatedCards";
  import type { CardDetail } from "@/types/encyclopedia.types";

  interface CardDetailViewProps {
    card: CardDetail;
  }

  export function CardDetailView({ card }: CardDetailViewProps) {
    return (
      <div className="space-y-8">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/enciclopedia">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Enciclopedia
            </Link>
          </Button>
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Imagen */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <CardImage src={card.imageUrl} alt={card.nameEs} />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="font-serif text-4xl mb-2">{card.nameEs}</h1>
              <p className="text-xl text-muted-foreground">{card.nameEn}</p>
            </div>

            {card.description && <p className="text-muted-foreground">{card.description}</p>}

            <CardMetadata card={card} />
          </div>
        </div>

        {/* Significados */}
        <CardMeaning meaningUpright={card.meaningUpright} meaningReversed={card.meaningReversed} />

        {/* Palabras clave */}
        <CardKeywords keywords={card.keywords} />

        {/* Cartas relacionadas */}
        <RelatedCards slug={card.slug} />

        {/* Navegación inferior */}
        <CardNavigation slug={card.slug} />
      </div>
    );
  }
  ```

##### Testing

- [ ] Test: CardDetailView renderiza todos los componentes
- [ ] Test: CardNavigation muestra anterior/siguiente
- [ ] Test: CardImage abre modal al hacer clic
- [ ] Test: Tabs de significados funcionan

---

#### 🎯 Criterios de Aceptación

- [ ] Vista de detalle muestra toda la información
- [ ] Imagen se puede ampliar en modal
- [ ] Navegación entre cartas funciona
- [ ] Componentes son responsive

# Frontend: Páginas

---

### TASK-308: Crear páginas de Enciclopedia

**Módulo:** `frontend/src/app/enciclopedia/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-306, TASK-307

---

#### 📋 Descripción

Crear las páginas principales de la enciclopedia: listado y detalle de cartas.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/app/enciclopedia/page.tsx`
- `frontend/src/app/enciclopedia/[slug]/page.tsx`

**Archivos a modificar:**

- `frontend/src/components/layout/Header.tsx`
- `frontend/src/lib/constants/routes.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Agregar rutas en `routes.ts`:

  ```typescript
  export const ROUTES = {
    // ...existentes
    ENCICLOPEDIA: "/enciclopedia",
    ENCICLOPEDIA_CARD: (slug: string) => `/enciclopedia/${slug}`,
  } as const;
  ```

- [ ] Crear `app/enciclopedia/page.tsx`:

  ```tsx
  "use client";

  import { useState, useCallback } from "react";
  import {
    CardGrid,
    CategoryTabs,
    SuitSelector,
    SearchBar,
    EncyclopediaSkeleton,
  } from "@/components/features/encyclopedia";
  import { useCards, useMajorArcana, useCardsBySuit, useSearchCards } from "@/hooks/api/useEncyclopedia";
  import { ArcanaType, Suit } from "@/types/encyclopedia.types";

  type Category = "all" | "major" | "minor";

  export default function EnciclopediaPage() {
    const [category, setCategory] = useState<Category>("all");
    const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Queries
    const allCards = useCards();
    const majorCards = useMajorArcana();
    const suitCards = useCardsBySuit(selectedSuit!);
    const searchResults = useSearchCards(searchQuery);

    // Determinar qué datos mostrar
    const isSearching = searchQuery.length >= 2;
    const showSuitSelector = category === "minor";

    const getDisplayData = () => {
      if (isSearching) {
        return {
          cards: searchResults.data || [],
          isLoading: searchResults.isLoading,
        };
      }

      switch (category) {
        case "major":
          return {
            cards: majorCards.data || [],
            isLoading: majorCards.isLoading,
          };
        case "minor":
          if (selectedSuit) {
            return {
              cards: suitCards.data || [],
              isLoading: suitCards.isLoading,
            };
          }
          return {
            cards: (allCards.data || []).filter((c) => c.arcanaType === ArcanaType.MINOR),
            isLoading: allCards.isLoading,
          };
        default:
          return {
            cards: allCards.data || [],
            isLoading: allCards.isLoading,
          };
      }
    };

    const { cards, isLoading } = getDisplayData();

    const handleCategoryChange = (newCategory: Category) => {
      setCategory(newCategory);
      setSelectedSuit(null);
      setSearchQuery("");
    };

    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
    }, []);

    return (
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-2">Enciclopedia del Tarot</h1>
          <p className="text-muted-foreground">Explora las 78 cartas y descubre sus significados</p>
        </div>

        {/* Controles */}
        <div className="space-y-4 mb-8">
          <SearchBar onSearch={handleSearch} placeholder="Buscar carta por nombre..." className="max-w-md mx-auto" />

          {!isSearching && (
            <>
              <CategoryTabs value={category} onChange={handleCategoryChange} className="max-w-md mx-auto" />

              {showSuitSelector && (
                <div className="flex justify-center">
                  <SuitSelector selected={selectedSuit || undefined} onSelect={setSelectedSuit} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {isSearching && (
          <p className="text-sm text-muted-foreground mb-4">
            {cards.length} resultado{cards.length !== 1 ? "s" : ""} para "{searchQuery}"
          </p>
        )}

        {/* Grid de cartas */}
        <CardGrid
          cards={cards}
          isLoading={isLoading}
          emptyMessage={isSearching ? "No se encontraron cartas" : "No hay cartas para mostrar"}
        />
      </div>
    );
  }
  ```

- [ ] Crear `app/enciclopedia/[slug]/page.tsx`:

  ```tsx
  "use client";

  import { useParams } from "next/navigation";
  import { CardDetailView, EncyclopediaSkeleton } from "@/components/features/encyclopedia";
  import { useCard } from "@/hooks/api/useEncyclopedia";
  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import { ROUTES } from "@/lib/constants/routes";

  export default function CardDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data: card, isLoading, error } = useCard(slug);

    if (isLoading) {
      return (
        <div className="container mx-auto py-8 px-4">
          <EncyclopediaSkeleton variant="detail" />
        </div>
      );
    }

    if (error || !card) {
      return (
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl mb-4">Carta no encontrada</h1>
          <p className="text-muted-foreground mb-6">La carta que buscas no existe o fue eliminada.</p>
          <Button asChild>
            <Link href={ROUTES.ENCICLOPEDIA}>Ver todas las cartas</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <CardDetailView card={card} />
      </div>
    );
  }
  ```

- [ ] Actualizar `Header.tsx`:
  ```tsx
  const navigationItems = [
    { href: "/carta-del-dia", label: "Carta del Día" },
    { href: "/horoscopo", label: "Horóscopo" },
    { href: "/numerologia", label: "Numerología" },
    { href: "/enciclopedia", label: "Enciclopedia Mística" },
    { href: "/ritual", label: "Lectura", requiresAuth: true },
  ];
  ```

##### Testing

- [ ] Test: Página principal muestra 78 cartas
- [ ] Test: Filtro por categoría funciona
- [ ] Test: Filtro por palo funciona
- [ ] Test: Búsqueda filtra correctamente
- [ ] Test: Página de detalle muestra carta
- [ ] Test: 404 para slug inexistente

---

#### 🎯 Criterios de Aceptación

- [ ] /enciclopedia muestra grid de cartas
- [ ] Filtros y búsqueda funcionan
- [ ] /enciclopedia/[slug] muestra detalle
- [ ] Link en header
- [ ] Responsive en móvil

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - La búsqueda solo se activa con 2+ caracteres
> - El selector de palo solo aparece en categoría "minor"
> - Usar useCallback para handleSearch (evitar re-renders)

---

# Frontend: Enciclopedia Mística (artículos estáticos)

---

### TASK-315: Crear tipos TypeScript, API y hooks para artículos

**Módulo:** `frontend/src/types/` y `frontend/src/lib/api/`
**Prioridad:** 🔴 ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-312

---

#### 📋 Descripción

Crear los tipos TypeScript y funciones de API para los nuevos artículos de la enciclopedia mística.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/types/encyclopedia-article.types.ts`
- `frontend/src/lib/api/encyclopedia-articles-api.ts`
- `frontend/src/hooks/api/useEncyclopediaArticles.ts`

**Archivos a modificar:**

- `frontend/src/lib/api/endpoints.ts` (agregar `ENCYCLOPEDIA.ARTICLES.*`)
- `frontend/src/types/index.ts` (re-exportar nuevos tipos si aplica)

**Tipos principales:**

```typescript
// encyclopedia-article.types.ts
export enum ArticleCategory {
  ZODIAC_SIGN = 'zodiac_sign',
  PLANET = 'planet',
  ASTROLOGICAL_HOUSE = 'astro_house',
  ELEMENT = 'element',
  MODALITY = 'modality',
  GUIDE_NUMEROLOGY = 'guide_numerology',
  GUIDE_PENDULUM = 'guide_pendulum',
  GUIDE_BIRTH_CHART = 'guide_birth_chart',
  GUIDE_RITUAL = 'guide_ritual',
  GUIDE_HOROSCOPE = 'guide_horoscope',
  GUIDE_CHINESE = 'guide_chinese',
}

export interface ArticleSnippet {
  id: number;
  slug: string;
  nameEs: string;
  category: ArticleCategory;
  snippet: string;
}

export interface ArticleSummary extends ArticleSnippet {
  imageUrl: string | null;
  sortOrder: number;
}

export interface ArticleDetail extends ArticleSummary {
  nameEn: string | null;
  content: string; // Markdown completo
  metadata: Record<string, unknown> | null;
  relatedArticles: ArticleSummary[];
  relatedTarotCards: number[] | null;
}

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  [ArticleCategory.ZODIAC_SIGN]: 'Signos Zodiacales',
  [ArticleCategory.PLANET]: 'Planetas',
  [ArticleCategory.ASTROLOGICAL_HOUSE]: 'Casas Astrales',
  [ArticleCategory.ELEMENT]: 'Elementos',
  [ArticleCategory.MODALITY]: 'Modalidades',
  [ArticleCategory.GUIDE_NUMEROLOGY]: 'Guía de Numerología',
  [ArticleCategory.GUIDE_PENDULUM]: 'Guía del Péndulo',
  [ArticleCategory.GUIDE_BIRTH_CHART]: 'Guía de Carta Astral',
  [ArticleCategory.GUIDE_RITUAL]: 'Guía de Rituales',
  [ArticleCategory.GUIDE_HOROSCOPE]: 'Guía del Horóscopo',
  [ArticleCategory.GUIDE_CHINESE]: 'Guía del Horóscopo Chino',
};
```

**Endpoints a agregar en `endpoints.ts`:**

```typescript
ENCYCLOPEDIA: {
  // ... endpoints existentes para cartas de tarot ...
  ARTICLES: '/encyclopedia/articles',
  ARTICLE_SNIPPET: (slug: string) => `/encyclopedia/articles/snippet/${slug}`,
  ARTICLE_DETAIL: (slug: string) => `/encyclopedia/articles/${slug}`,
  ARTICLE_BY_CATEGORY: (category: string) => `/encyclopedia/articles/category/${category}`,
  SEARCH_GLOBAL: '/encyclopedia/search',
}
```

**Hooks:**

```typescript
// useEncyclopediaArticles.ts
export const articleKeys = {
  snippet: (slug: string) => ['encyclopedia', 'article', 'snippet', slug],
  detail: (slug: string) => ['encyclopedia', 'article', 'detail', slug],
  byCategory: (category: ArticleCategory) => ['encyclopedia', 'articles', 'category', category],
  search: (term: string) => ['encyclopedia', 'search', term],
};

// Para el widget "Ver más" - staleTime: 1h (contenido estático)
export function useArticleSnippet(slug: string): UseQueryResult<ArticleSnippet>

// Para la página de detalle completa
export function useArticle(slug: string): UseQueryResult<ArticleDetail>

// Para listado de una categoría
export function useArticlesByCategory(category: ArticleCategory): UseQueryResult<ArticleSummary[]>

// Búsqueda global (cartas de tarot + artículos)
// Solo ejecuta si term.length >= 2
export function useGlobalSearch(term: string): UseQueryResult<GlobalSearchResult>
```

---

#### ✅ Criterios de Aceptación

- [ ] Tipos exportados sin errores de TypeScript
- [ ] `useArticleSnippet` llama a `/encyclopedia/articles/snippet/:slug`
- [ ] `useGlobalSearch` combina resultados de tarot y artículos
- [ ] `staleTime` de 1 hora para todo el contenido estático

---

#### 🧪 Tests TDD

```typescript
describe('useEncyclopediaArticles hooks', () => {
  it('useArticleSnippet debe llamar al endpoint de snippet');
  it('useArticle debe llamar al endpoint de detalle');
  it('useGlobalSearch no debe ejecutarse si term.length < 2');
  it('useArticlesByCategory debe retornar artículos de la categoría correcta');
});
```

---

### TASK-316: Crear componente EncyclopediaInfoWidget

**Módulo:** `frontend/src/components/features/encyclopedia/`
**Prioridad:** 🔴 ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-315

---

#### 📋 Descripción

Crear el componente reutilizable `EncyclopediaInfoWidget` que muestra un snippet de un artículo de la enciclopedia con un botón "Ver más en la Enciclopedia". Seguir exactamente el mismo patrón del `NumerologyWidget` existente.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/components/features/encyclopedia/EncyclopediaInfoWidget.tsx`
- `frontend/src/components/features/encyclopedia/EncyclopediaInfoWidget.test.tsx`

**Componente:**

```tsx
// EncyclopediaInfoWidget.tsx
'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useArticleSnippet } from '@/hooks/api/useEncyclopediaArticles';

interface EncyclopediaInfoWidgetProps {
  slug: string;       // Ej: 'guide-numerology', 'guide-pendulum'
  title?: string;     // Sobreescribe el nameEs del artículo (opcional)
  className?: string;
}

export function EncyclopediaInfoWidget({ slug, title, className }: EncyclopediaInfoWidgetProps) {
  const { data: article, isLoading, error } = useArticleSnippet(slug);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-16 w-full" /></CardContent>
      </Card>
    );
  }

  // Widget no es crítico - si falla, no rompe la página
  if (error || !article) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          {title ?? article.nameEs}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{article.snippet}</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href={`/enciclopedia/guias/${slug}`}>
            <BookOpen className="mr-2 h-4 w-4" />
            Ver más en la Enciclopedia
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

#### ✅ Criterios de Aceptación

- [ ] Muestra `Skeleton` en estado loading
- [ ] Retorna `null` en estado de error (widget no es crítico)
- [ ] Muestra snippet y botón cuando hay datos
- [ ] El link apunta a `/enciclopedia/guias/${slug}`
- [ ] La prop `title` sobreescribe el `nameEs` del artículo

---

#### 🧪 Tests TDD

```typescript
describe('EncyclopediaInfoWidget', () => {
  it('debe mostrar Skeleton en estado loading');
  it('debe retornar null en estado de error (sin crashear la página)');
  it('debe mostrar el snippet y el botón cuando hay datos');
  it('el link debe apuntar a /enciclopedia/guias/{slug}');
  it('prop title sobreescribe el nombre del artículo');
});
```

---

### TASK-317: Integrar EncyclopediaInfoWidget en las 6 páginas de módulos

**Módulo:** `frontend/src/components/features/` y `frontend/src/app/`
**Prioridad:** 🔴 ALTA
**Estimación:** 1 día
**Dependencias:** TASK-316

---

#### 📋 Descripción

Agregar el `EncyclopediaInfoWidget` en cada una de las 6 páginas de módulos. El widget debe aparecer en posición discreta (debajo del hero/título, antes del formulario/contenido principal) sin interrumpir el flujo principal.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

1. **`frontend/src/components/features/numerology/NumerologyPage.tsx`**
   - Agregar `<EncyclopediaInfoWidget slug="guide-numerology" className="mb-6" />` debajo del título, antes de la calculadora

2. **Componente de Péndulo** (identificar archivo exacto en features/pendulum/)
   - Agregar `<EncyclopediaInfoWidget slug="guide-pendulum" className="mb-6" />`

3. **`frontend/src/app/horoscopo/page.tsx`** (o su componente feature)
   - Agregar `<EncyclopediaInfoWidget slug="guide-horoscope" className="mb-6" />`

4. **`frontend/src/app/horoscopo-chino/page.tsx`** (o su componente feature)
   - Agregar `<EncyclopediaInfoWidget slug="guide-chinese" className="mb-6" />`

5. **Componente de Rituales** (identificar archivo exacto en features/rituals/)
   - Agregar `<EncyclopediaInfoWidget slug="guide-ritual" className="mb-6" />`

6. **`frontend/src/app/carta-astral/page.tsx`**
   - Agregar `<EncyclopediaInfoWidget slug="guide-birth-chart" className="mb-6" />`

**Nota:** Identificar los archivos exactos leyendo cada módulo antes de modificar.

---

#### ✅ Criterios de Aceptación

- [ ] Las 6 páginas renderizan `EncyclopediaInfoWidget` con el `slug` correcto
- [ ] Widget no bloquea el renderizado si el API falla (retorna `null`)
- [ ] Widget aparece en posición consistente en todas las páginas (debajo del header, antes del contenido principal)
- [ ] Widget es visible para usuarios anónimos

---

#### 🧪 Tests TDD

```typescript
// Para cada módulo:
it('debe renderizar EncyclopediaInfoWidget con slug="guide-{modulo}"');
it('debe renderizar correctamente si EncyclopediaInfoWidget retorna null');
```

---

### TASK-318: Componentes de listado para Astrología y Guías

**Módulo:** `frontend/src/components/features/encyclopedia/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 1 día
**Dependencias:** TASK-315

---

#### 📋 Descripción

Crear los componentes de listado para las nuevas categorías de la enciclopedia: signos zodiacales, planetas, casas astrales y guías de actividades.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/encyclopedia/
├── ArticleCard.tsx          # Tarjeta adaptativa según categoría
├── ArticleGrid.tsx          # Grid responsive de artículos
├── ArticleSkeleton.tsx      # Skeleton para carga de artículos
├── AstrologySection.tsx     # Sección "Astrología" con 3 sub-categorías
├── GuidesSection.tsx        # Sección "Guías" con 6 actividades
└── EncyclopediaHome.tsx     # Nueva página hub (Tarot + Astrología + Guías)
```

**ArticleCard — adaptación por categoría:**

| Categoría | Campos mostrados |
| --------- | ---------------- |
| Signo zodiacal | Símbolo (♈), nombre, elemento (con color), modalidad, fechas |
| Planeta | Símbolo astrológico, nombre, signos que rige |
| Casa astral | Número romano, nombre, área de vida principal |
| Elemento/Modalidad | Ícono, nombre, descripción breve |
| Guía | Ícono de actividad, título, primera línea del snippet |

**GuidesSection — 6 tarjetas:**
- Numerología, Péndulo, Carta Astral, Rituales, Horóscopo Occidental, Horóscopo Chino

---

#### ✅ Criterios de Aceptación

- [ ] `ArticleCard` renderiza los campos correctos según la categoría del artículo
- [ ] `ArticleGrid` muestra el número correcto de artículos con layout responsive
- [ ] `GuidesSection` muestra exactamente 6 guías
- [ ] `AstrologySection` tiene links funcionales a sus 3 sub-secciones

---

#### 🧪 Tests TDD

```typescript
describe('ArticleCard', () => {
  it('debe mostrar símbolo y fechas para signo zodiacal');
  it('debe mostrar signo(s) que rige para planeta');
  it('debe mostrar número romano para casa astral');
});
describe('GuidesSection', () => {
  it('debe renderizar exactamente 6 guías');
  it('cada guía debe tener link correcto');
});
```

---

### TASK-319: Componente ArticleDetailView

**Módulo:** `frontend/src/components/features/encyclopedia/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 0.5 días
**Dependencias:** TASK-318

---

#### 📋 Descripción

Crear el componente que renderiza el contenido completo de un artículo usando `react-markdown` para el campo `content`.

---

#### 🏗️ Contexto Técnico

**Archivo a crear:** `frontend/src/components/features/encyclopedia/ArticleDetailView.tsx`

**Estructura del componente:**

```tsx
interface ArticleDetailViewProps {
  article: ArticleDetail;
}

export function ArticleDetailView({ article }: ArticleDetailViewProps) {
  return (
    <div className="space-y-8">
      {/* Breadcrumb de navegación */}
      {/* Header: nombre del artículo + badge de categoría */}
      {/* Metadata cards (símbolo, fechas, elemento, etc. según categoría) */}
      {/* Contenido Markdown renderizado con react-markdown + remark-gfm */}
      {/* Cartas de tarot relacionadas (si relatedTarotCards no es null) */}
      {/* Artículos relacionados */}
      {/* CTA al módulo correspondiente (solo si es guía) */}
    </div>
  );
}
```

**CTA por tipo de guía:**
- `guide-numerology` → botón "Calcular mi Numerología" → `/numerologia`
- `guide-pendulum` → botón "Usar el Péndulo Digital" → `/pendulo`
- `guide-birth-chart` → botón "Generar mi Carta Astral" → `/carta-astral`
- `guide-ritual` → botón "Explorar Rituales" → `/rituales`
- `guide-horoscope` → botón "Ver mi Horóscopo" → `/horoscopo`
- `guide-chinese` → botón "Ver mi Horóscopo Chino" → `/horoscopo-chino`

---

#### ✅ Criterios de Aceptación

- [ ] Renderiza el contenido Markdown correctamente (headings, listas, tablas)
- [ ] Muestra cartas de tarot relacionadas si existen
- [ ] Muestra artículos relacionados
- [ ] CTA correcto según la categoría del artículo
- [ ] Breadcrumb navega correctamente

---

#### 🧪 Tests TDD

```typescript
describe('ArticleDetailView', () => {
  it('debe renderizar contenido markdown');
  it('debe mostrar cartas de tarot relacionadas cuando existen');
  it('no debe mostrar sección de cartas si relatedTarotCards es null');
  it('debe mostrar CTA correcto para guía de numerología');
  it('no debe mostrar CTA para signos zodiacales (no son guías)');
});
```

---

### TASK-320: Actualizar rutas de la Enciclopedia y crear nuevas páginas

**Módulo:** `frontend/src/app/enciclopedia/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 0.5 días
**Dependencias:** TASK-318

---

#### 📋 Descripción

Reorganizar la estructura de rutas de `/enciclopedia` para soportar las nuevas secciones. La página principal se convierte en hub de 3 secciones.

---

#### 🏗️ Contexto Técnico

**Nueva estructura de rutas:**

```
/enciclopedia/                                   → Hub principal (Tarot | Astrología | Guías)
/enciclopedia/tarot/                             → Listado de 78 cartas (actual page.tsx movido)
/enciclopedia/tarot/[slug]/                      → Detalle de carta (mover de /enciclopedia/[slug])
/enciclopedia/astrologia/                        → Hub de astrología
/enciclopedia/astrologia/signos/                 → Listado 12 signos zodiacales
/enciclopedia/astrologia/signos/[slug]/          → Detalle de signo (ej: /astrologia/signos/aries)
/enciclopedia/astrologia/planetas/               → Listado 10 planetas
/enciclopedia/astrologia/planetas/[slug]/        → Detalle de planeta (ej: /astrologia/planetas/venus)
/enciclopedia/astrologia/casas/                  → Listado 12 casas astrales
/enciclopedia/astrologia/casas/[slug]/           → Detalle de casa (ej: /astrologia/casas/casa-1)
/enciclopedia/guias/                             → Listado de 6 guías
/enciclopedia/guias/[slug]/                      → Detalle de guía (ej: /guias/numerologia)
/enciclopedia/elementos/[slug]/                  → Detalle de elemento o modalidad
```

**Archivos a modificar:**

- `frontend/src/app/enciclopedia/page.tsx` → convertir en hub con `EncyclopediaHome`
- `frontend/src/lib/constants/routes.ts` → agregar nuevas rutas

**Archivos a crear:**

```
frontend/src/app/enciclopedia/
├── tarot/
│   ├── page.tsx               (listado de cartas - mover contenido actual)
│   └── [slug]/
│       └── page.tsx           (detalle de carta - mover de /enciclopedia/[slug])
├── astrologia/
│   ├── page.tsx
│   ├── signos/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── planetas/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── casas/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── guias/
│   ├── page.tsx
│   └── [slug]/page.tsx
└── elementos/
    └── [slug]/page.tsx
```

**Redirect 301 para SEO:**

Agregar redirect en `next.config.js` de `/enciclopedia/[slug]` (cartas de tarot) a `/enciclopedia/tarot/[slug]`.

**Nuevas constantes en `routes.ts`:**

```typescript
ENCICLOPEDIA_TAROT: '/enciclopedia/tarot',
ENCICLOPEDIA_TAROT_CARD: (slug: string) => `/enciclopedia/tarot/${slug}`,
ENCICLOPEDIA_ASTROLOGIA: '/enciclopedia/astrologia',
ENCICLOPEDIA_SIGNO: (slug: string) => `/enciclopedia/astrologia/signos/${slug}`,
ENCICLOPEDIA_PLANETA: (slug: string) => `/enciclopedia/astrologia/planetas/${slug}`,
ENCICLOPEDIA_CASA: (slug: string) => `/enciclopedia/astrologia/casas/${slug}`,
ENCICLOPEDIA_GUIAS: '/enciclopedia/guias',
ENCICLOPEDIA_GUIA: (slug: string) => `/enciclopedia/guias/${slug}`,
ENCICLOPEDIA_ELEMENTO: (slug: string) => `/enciclopedia/elementos/${slug}`,
```

---

#### ✅ Criterios de Aceptación

- [ ] Hub principal muestra 3 secciones: Tarot, Astrología, Guías
- [ ] Links de categorías navegan correctamente
- [ ] Redirect 301 funciona: `/enciclopedia/el-loco` → `/enciclopedia/tarot/el-loco`
- [ ] Páginas de listado de artículos (12 signos, 10 planetas, 12 casas) funcionan
- [ ] 404 para slug inexistente

---

#### 🧪 Tests TDD

```typescript
describe('Enciclopedia Hub page', () => {
  it('debe mostrar las 3 secciones principales');
  it('links de categorías deben tener href correcto');
});
describe('Enciclopedia article pages', () => {
  it('página de signo debe renderizar ArticleDetailView');
  it('debe retornar 404 para slug inexistente');
});
```

---

### TASK-321: SEO metadata con generateMetadata

**Módulo:** `frontend/src/app/enciclopedia/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 0.5 días
**Dependencias:** TASK-320

---

#### 📋 Descripción

Agregar `generateMetadata` (y opcionalmente `generateStaticParams` para pre-render) en todas las páginas de detalle de la enciclopedia.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:** Todas las `page.tsx` de detalle creadas en TASK-320

**Patrón para páginas de detalle:**

```typescript
// enciclopedia/astrologia/signos/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: `${article.nameEs} - Enciclopedia Mística | Auguria`,
    description: article.snippet,
    openGraph: {
      title: `${article.nameEs} - Auguria`,
      description: article.snippet,
      type: 'article',
    },
  };
}

// Pre-renderizar en build time para mejor performance y SEO
export async function generateStaticParams() {
  const signs = await getArticlesByCategory(ArticleCategory.ZODIAC_SIGN);
  return signs.map((s) => ({ slug: s.slug }));
}
```

---

#### ✅ Criterios de Aceptación

- [ ] `title` de cada página incluye el nombre del artículo
- [ ] `description` usa el `snippet` del artículo
- [ ] Open Graph tags presentes
- [ ] `generateStaticParams` implementado para signos, planetas, casas y guías

---

#### 🧪 Tests TDD

```typescript
describe('SEO metadata', () => {
  it('generateMetadata debe incluir el nombre del artículo en title');
  it('generateMetadata debe usar snippet como description');
  it('generateMetadata debe retornar objeto vacío si artículo no existe');
});
```

---

### TASK-322: Cross-links desde Carta Astral hacia la Enciclopedia

**Módulo:** `frontend/src/components/features/birth-chart/`
**Prioridad:** 🟢 BAJA
**Estimación:** 0.5 días
**Dependencias:** TASK-320

---

#### 📋 Descripción

Agregar enlaces desde los resultados de la Carta Astral hacia los artículos de la enciclopedia (signos y planetas). Al mostrar "Sol en Escorpio", el texto "Escorpio" debe ser un link a `/enciclopedia/astrologia/signos/escorpio`.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:** Componentes de `birth-chart` que renderizan posiciones planetarias (identificar leyendo el módulo antes de modificar).

**Utilidades a agregar en `routes.ts` o nuevo archivo:**

```typescript
// Funciones helper para links a la enciclopedia
export function getSignEncyclopediaLink(sign: string): string {
  return `/enciclopedia/astrologia/signos/${sign.toLowerCase()}`;
}

export function getPlanetEncyclopediaLink(planet: string): string {
  return `/enciclopedia/astrologia/planetas/${planet.toLowerCase()}`;
}
```

**Patrón de uso en el componente:**

```tsx
// Antes:
<span>Sol en Escorpio</span>

// Después:
<span>Sol en <Link href={getSignEncyclopediaLink('escorpio')}>Escorpio</Link></span>
```

---

#### ✅ Criterios de Aceptación

- [ ] Nombres de signos en resultados de Carta Astral son links con href correcto
- [ ] Nombres de planetas en resultados son links con href correcto
- [ ] Links abren en la misma pestaña (sin `target="_blank"`)
- [ ] Links tienen estilo visual diferenciado (underline o color)

---

#### 🧪 Tests TDD

```typescript
describe('Birth Chart encyclopedia links', () => {
  it('nombre de signo en resultado debe renderizar como link');
  it('link de signo debe apuntar a /enciclopedia/astrologia/signos/{slug}');
  it('nombre de planeta en resultado debe renderizar como link');
  it('link de planeta debe apuntar a /enciclopedia/astrologia/planetas/{slug}');
});
```

---

# Esquema de Datos, Dependencias y Resumen

---

## ESQUEMA DE DATOS

### Tabla: `tarot_cards`

```sql
-- Enums
CREATE TYPE arcana_type_enum AS ENUM ('major', 'minor');
CREATE TYPE suit_enum AS ENUM ('wands', 'cups', 'swords', 'pentacles');
CREATE TYPE court_rank_enum AS ENUM ('page', 'knight', 'queen', 'king');
CREATE TYPE element_enum AS ENUM ('fire', 'water', 'air', 'earth', 'spirit');
CREATE TYPE planet_enum AS ENUM (
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
);
CREATE TYPE zodiac_association_enum AS ENUM (
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
);

-- Tabla principal
CREATE TABLE tarot_cards (
  id SERIAL PRIMARY KEY,

  -- Identificación
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_es VARCHAR(100) NOT NULL,

  -- Clasificación
  arcana_type arcana_type_enum NOT NULL,
  number SMALLINT NOT NULL,
  roman_numeral VARCHAR(10),
  suit suit_enum,
  court_rank court_rank_enum,

  -- Asociaciones esotéricas
  element element_enum,
  planet planet_enum,
  zodiac_sign zodiac_association_enum,

  -- Contenido
  meaning_upright TEXT NOT NULL,
  meaning_reversed TEXT NOT NULL,
  description TEXT,
  keywords JSONB NOT NULL,

  -- Imágenes
  image_url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),

  -- Relaciones
  related_cards JSONB,

  -- Tracking
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_card_slug ON tarot_cards(slug);
CREATE INDEX idx_card_arcana ON tarot_cards(arcana_type);
CREATE INDEX idx_card_suit ON tarot_cards(suit);
CREATE INDEX idx_card_element ON tarot_cards(element);
```

### Tamaño Estimado

| Tabla               | Registros | Tamaño Aprox            |
| ------------------- | --------- | ----------------------- |
| tarot_cards         | 78        | ~200 KB                 |

**Nota:** Los datos de cartas son estáticos (seeder), solo view_count cambia.

---

## DEPENDENCIAS

### Dependencias npm

**Backend:**

- Ninguna adicional (usa TypeORM existente)

**Frontend:**

- Ninguna adicional (usa TanStack Query existente)

### Variables de Entorno

**Ninguna adicional.**

### Archivos de Imágenes

Se requieren 78 imágenes de cartas:

```
public/images/tarot/
├── major/
│   ├── 00-the-fool.jpg
│   ├── 01-the-magician.jpg
│   └── ... (22 imágenes)
├── wands/
│   ├── 01-ace-of-wands.jpg
│   └── ... (14 imágenes)
├── cups/
│   └── ... (14 imágenes)
├── swords/
│   └── ... (14 imágenes)
└── pentacles/
    └── ... (14 imágenes)
```

**Formato recomendado:** JPG, 400x600px, optimizado para web (~50KB c/u)

---

## RESUMEN DE TAREAS

### Fase 1: Enciclopedia del Tarot (tareas originales)

| Tarea    | Descripción              | Estimación |
| -------- | ------------------------ | ---------- |
| TASK-300 | Entidad TarotCard        | 1 día      |
| TASK-302 | Seeder de 78 cartas      | 1.5 días   |
| TASK-303 | Módulo y servicios       | 1 día      |
| TASK-304 | Endpoints                | 1 día      |
| TASK-305 | Types y hooks frontend   | 0.5 días   |
| TASK-306 | Componentes de lista     | 1 día      |
| TASK-307 | Componentes de detalle   | 1 día      |
| TASK-308 | Páginas                  | 1 día      |

**Subtotal Fase 1:** 8 días

---

### Fase 2: Enciclopedia Mística (nuevas tareas)

#### Backend — artículos estáticos

| Tarea    | Descripción                        | Estimación | Prioridad |
| -------- | ---------------------------------- | ---------- | --------- |
| TASK-309 | Entidad EncyclopediaArticle        | 1 día      | 🔴 ALTA   |
| TASK-310 | Seeder de ~95 artículos            | 2 días     | 🔴 ALTA   |
| TASK-311 | ArticlesService + DTOs             | 1 día      | 🔴 ALTA   |
| TASK-312 | Endpoints REST de artículos        | 0.5 días   | 🔴 ALTA   |
| TASK-313 | Búsqueda global unificada          | 0.5 días   | 🟡 MEDIA  |
| TASK-314 | ViewCount para artículos           | 0.25 días  | 🟢 BAJA   |

#### Frontend — widget e integración

| Tarea    | Descripción                              | Estimación | Prioridad |
| -------- | ---------------------------------------- | ---------- | --------- |
| TASK-315 | Tipos TS + API + Hooks para artículos    | 0.5 días   | 🔴 ALTA   |
| TASK-316 | EncyclopediaInfoWidget                   | 0.5 días   | 🔴 ALTA   |
| TASK-317 | Integrar widget en 6 módulos             | 1 día      | 🔴 ALTA   |
| TASK-318 | Componentes de listado (artículos)       | 1 día      | 🟡 MEDIA  |
| TASK-319 | ArticleDetailView (Markdown)             | 0.5 días   | 🟡 MEDIA  |
| TASK-320 | Nuevas rutas de enciclopedia             | 0.5 días   | 🟡 MEDIA  |
| TASK-321 | SEO metadata (generateMetadata)          | 0.5 días   | 🟡 MEDIA  |
| TASK-322 | Cross-links desde Carta Astral           | 0.5 días   | 🟢 BAJA   |

**Subtotal Fase 2:** 10.25 días

---

**TOTAL PROYECTO:** ~17.5-18.5 días

---

## ORDEN DE IMPLEMENTACIÓN

```
Semana 1: Backend Tarot (Fase 1)
├── TASK-300: Entidad TarotCard (1d)
├── TASK-302: Seeder de cartas (1.5d)
├── TASK-303: Módulo y servicios (1d)
└── TASK-304: Endpoints (1d)

Semana 2: Frontend Tarot (Fase 1)
├── TASK-305: Types y hooks (0.5d)
├── TASK-306: Componentes lista (1d)
├── TASK-307: Componentes detalle (1d)
└── TASK-308: Páginas (1d)

Semana 3: Backend Enciclopedia Mística (Fase 2 - entrega mínima viable)
├── TASK-309: Entidad EncyclopediaArticle (1d)
├── TASK-310: Seeder de ~95 artículos (2d)
├── TASK-311: ArticlesService + DTOs (1d)
└── TASK-312: Endpoints REST (0.5d)

Semana 4: Frontend Widget (Fase 2 - entrega mínima viable)
├── TASK-315: Types + API + Hooks (0.5d)
├── TASK-316: EncyclopediaInfoWidget (0.5d)
└── TASK-317: Integrar en 6 módulos (1d)
[← PRIMERA ENTREGA DE VALOR: widget "Ver más" en todos los módulos]

Semana 4-5: Frontend páginas completas (Fase 2 - enciclopedia completa)
├── TASK-318: Componentes de listado (1d)
├── TASK-319: ArticleDetailView (0.5d)
├── TASK-320: Nuevas rutas (0.5d)
├── TASK-321: SEO metadata (0.5d)
├── TASK-313: Búsqueda global (0.5d)
├── TASK-322: Cross-links Carta Astral (0.5d)
└── TASK-314: ViewCount artículos (0.25d)
```

---

## RIESGOS

| Riesgo                               | Probabilidad | Impacto | Mitigación                          |
| ------------------------------------ | ------------ | ------- | ----------------------------------- |
| Contenido de cartas incompleto       | Media        | Alto    | Usar contenido genérico temporal    |
| Imágenes no disponibles              | Media        | Medio   | Placeholder images                  |
| Seeder toma mucho tiempo             | Baja         | Bajo    | Ejecutar en migración separada      |
| Búsqueda lenta con muchos datos      | Baja         | Bajo    | Solo ~173 registros totales         |
| Contenido editorial de artículos     | Alta         | Medio   | Priorizar snippets (para el widget) |
| Colisión de rutas al mover /[slug]   | Baja         | Alto    | Redirect 301 en next.config.js      |

---

## CHECKLIST DE COMPLETITUD

### Backend — Tarot (Fase 1)

- [x] TASK-300: Entidad TarotCard creada
- [x] TASK-302: Seeder con 78 cartas
- [x] TASK-303: Módulo y servicios
- [x] TASK-304: Endpoints funcionando

### Backend — Enciclopedia Mística (Fase 2)

- [ ] TASK-309: Entidad EncyclopediaArticle creada
- [ ] TASK-310: Seeder con ~95 artículos
- [ ] TASK-311: ArticlesService con todos los métodos
- [ ] TASK-312: Endpoints REST funcionando
- [ ] TASK-313: Búsqueda global unificada
- [ ] TASK-314: ViewCount para artículos

### Frontend — Tarot (Fase 1)

- [ ] TASK-305: Types y hooks
- [ ] TASK-306: Componentes de lista
- [ ] TASK-307: Componentes de detalle
- [ ] TASK-308: Páginas

### Frontend — Enciclopedia Mística (Fase 2)

- [ ] TASK-315: Types + API + Hooks para artículos
- [ ] TASK-316: EncyclopediaInfoWidget
- [ ] TASK-317: Widget integrado en las 6 páginas de módulos
- [ ] TASK-318: Componentes de listado (ArticleCard, ArticleGrid, etc.)
- [ ] TASK-319: ArticleDetailView con Markdown
- [ ] TASK-320: Nuevas rutas y restructura de /enciclopedia
- [ ] TASK-321: SEO metadata en páginas de artículos
- [ ] TASK-322: Cross-links desde Carta Astral

### Contenido

- [ ] 22 Arcanos Mayores con contenido
- [ ] 56 Arcanos Menores con contenido
- [ ] 78 imágenes de cartas de tarot
- [ ] Palabras clave para cada carta
- [ ] 12 artículos de signos zodiacales
- [ ] 10 artículos de planetas
- [ ] 12 artículos de casas astrales
- [ ] 4 artículos de elementos + 3 de modalidades
- [ ] 6 guías de actividades (Numerología, Péndulo, Carta Astral, Rituales, Horóscopo, Horóscopo Chino)

### Testing

- [ ] Tests unitarios de servicios (backend)
- [ ] Tests e2e de endpoints
- [ ] Tests de componentes (frontend)
- [ ] Coverage >80%

---

## NOTAS ADICIONALES

### SEO

- Cartas de tarot: "El Loco - Significado del Tarot | Auguria"
- Signos zodiacales: "Aries - Signo Zodiacal - Enciclopedia Mística | Auguria"
- Guías: "Guía de Numerología - Enciclopedia Mística | Auguria"
- Open Graph image: imagen del artículo o de la carta

### Accesibilidad

- Imágenes con alt text descriptivo
- Navegación por teclado en los grids
- Contraste adecuado en badges

### Performance

- Las imágenes deben usar `next/image` con sizes apropiados
- Lazy loading para grids de cartas y artículos
- `staleTime` de 1 hora (datos estáticos)
- `generateStaticParams` para pre-render de páginas de artículos en build time
- El endpoint `/snippet/:slug` retorna respuesta mínima para mantener el widget ligero

---

## PROMPTS PARA GENERACIÓN DE CONTENIDO (Gemini)

> **Instrucciones de uso:** Cada prompt a continuación debe enviarse a Gemini por separado.
> La respuesta debe ser TypeScript válido, listo para copiar-pegar en el archivo `.data.ts` correspondiente.
> Los prompts más pesados (Prompt 2 y Prompt 6) incluyen notas sobre posible subdivisión.

---

### Prompt 1: Arcanos Mayores (`major-arcana.data.ts`)

> **Archivo destino:** `src/modules/encyclopedia/data/major-arcana.data.ts`
> **Volumen:** 22 cartas

```
Necesito que generes los datos completos de las 22 cartas de Arcanos Mayores del Tarot Rider-Waite para un seeder de base de datos.

INTERFAZ TYPESCRIPT (cada carta debe cumplir esta interfaz exacta):

export interface CardSeedData {
  slug: string;               // kebab-case, URL-safe. Ej: "the-fool", "the-magician"
  nameEn: string;             // Nombre en inglés
  nameEs: string;             // Nombre en español
  arcanaType: ArcanaType;     // Siempre ArcanaType.MAJOR para este bloque
  number: number;             // 0 (El Loco) a 21 (El Mundo)
  romanNumeral?: string;      // "0", "I", "II", ... "XXI"
  suit?: string;              // No aplica para Arcanos Mayores (omitir)
  courtRank?: string;         // No aplica para Arcanos Mayores (omitir)
  element?: Element;          // Asociación elemental tradicional Rider-Waite
  planet?: Planet;            // Asociación planetaria tradicional Rider-Waite
  zodiacSign?: ZodiacAssociation; // Asociación zodiacal tradicional Rider-Waite
  meaningUpright: string;     // 3+ oraciones en español. Mínimo 50 caracteres.
  meaningReversed: string;    // 3+ oraciones en español. Mínimo 50 caracteres.
  description: string;        // Descripción visual de la carta Rider-Waite. Mín 20 chars.
  keywords: {
    upright: string[];        // Mínimo 5 palabras clave en español
    reversed: string[];       // 4-5 palabras clave en español
  };
  imageUrl: string;           // Pattern: "/images/tarot/major/{nn}-{slug}.jpg" (nn = 00-21)
}

ENUMS VÁLIDOS:

enum ArcanaType { MAJOR = "major", MINOR = "minor" }

enum Element { FIRE = "fire", WATER = "water", AIR = "air", EARTH = "earth", SPIRIT = "spirit" }

enum Planet { SUN = "sun", MOON = "moon", MERCURY = "mercury", VENUS = "venus", MARS = "mars", JUPITER = "jupiter", SATURN = "saturn", URANUS = "uranus", NEPTUNE = "neptune", PLUTO = "pluto" }

enum ZodiacAssociation { ARIES = "aries", TAURUS = "taurus", GEMINI = "gemini", CANCER = "cancer", LEO = "leo", VIRGO = "virgo", LIBRA = "libra", SCORPIO = "scorpio", SAGITTARIUS = "sagittarius", CAPRICORN = "capricorn", AQUARIUS = "aquarius", PISCES = "pisces" }

LAS 22 CARTAS A GENERAR (con asociaciones astrológicas tradicionales Rider-Waite):

 0. El Loco (The Fool) — Air / Uranus
 1. El Mago (The Magician) — Air / Mercury
 2. La Sacerdotisa (The High Priestess) — Water / Moon
 3. La Emperatriz (The Empress) — Earth / Venus
 4. El Emperador (The Emperor) — Fire / Aries
 5. El Hierofante (The Hierophant) — Earth / Taurus
 6. Los Enamorados (The Lovers) — Air / Gemini
 7. El Carro (The Chariot) — Water / Cancer
 8. La Fuerza (Strength) — Fire / Leo
 9. El Ermitaño (The Hermit) — Earth / Virgo
10. La Rueda de la Fortuna (Wheel of Fortune) — Jupiter
11. La Justicia (Justice) — Air / Libra
12. El Colgado (The Hanged Man) — Water / Neptune
13. La Muerte (Death) — Water / Scorpio
14. La Templanza (Temperance) — Fire / Sagittarius
15. El Diablo (The Devil) — Earth / Capricorn
16. La Torre (The Tower) — Fire / Mars
17. La Estrella (The Star) — Air / Aquarius
18. La Luna (The Moon) — Water / Pisces
19. El Sol (The Sun) — Fire / Sun
20. El Juicio (Judgement) — Fire / Pluto
21. El Mundo (The World) — Earth / Saturn

EJEMPLO DE FORMATO DE SALIDA (para las 2 primeras cartas):

import { ArcanaType, Element, Planet, ZodiacAssociation } from "../enums/tarot.enums";
import { CardSeedData } from "./major-arcana.data";

export const MAJOR_ARCANA: CardSeedData[] = [
  {
    slug: "the-fool",
    nameEn: "The Fool",
    nameEs: "El Loco",
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    romanNumeral: "0",
    element: Element.AIR,
    planet: Planet.URANUS,
    meaningUpright: "El Loco representa nuevos comienzos, inocencia y espíritu libre. Es la carta del potencial ilimitado y la aventura. Simboliza dar un salto de fe hacia lo desconocido con optimismo y confianza.",
    meaningReversed: "Invertida, El Loco advierte sobre imprudencia, decisiones precipitadas y falta de dirección. Puede indicar ingenuidad excesiva o resistencia a dar el siguiente paso por miedo.",
    description: "Un joven está al borde de un precipicio, mirando al cielo con una bolsa al hombro y un perro a sus pies. Representa el inicio del viaje del alma.",
    keywords: {
      upright: ["Nuevos comienzos", "Inocencia", "Aventura", "Libertad", "Potencial"],
      reversed: ["Imprudencia", "Ingenuidad", "Riesgo", "Miedo", "Estancamiento"],
    },
    imageUrl: "/images/tarot/major/00-the-fool.jpg",
  },
  // ... continuar con las 21 cartas restantes
];

REGLAS:
- Todo el texto user-facing en español
- meaningUpright y meaningReversed: mínimo 3 oraciones, mínimo 50 caracteres
- description: descripción visual de la ilustración Rider-Waite, mínimo 20 caracteres
- keywords.upright: mínimo 5 palabras clave
- keywords.reversed: 4-5 palabras clave
- Sin texto placeholder ni genérico
- Usar las asociaciones astrológicas/elementales de la tradición Rider-Waite/Golden Dawn
- Generar las 22 cartas completas, no usar "// ..." ni comentarios de continuación
```

---

### Prompt 2: Arcanos Menores (`minor-arcana.data.ts`)

> **Archivo destino:** `src/modules/encyclopedia/data/minor-arcana.data.ts`
> **Volumen:** 56 cartas (4 palos × 14 cartas)
> **⚠️ NOTA:** Si Gemini no puede generar las 56 cartas de una vez, dividir en 2 sub-prompts: Bastos+Copas y Espadas+Oros.

```
Necesito que generes los datos completos de las 56 cartas de Arcanos Menores del Tarot Rider-Waite para un seeder de base de datos.

INTERFAZ TYPESCRIPT (misma que Arcanos Mayores):

export interface CardSeedData {
  slug: string;               // kebab-case. Ej: "ace-of-cups", "king-of-swords"
  nameEn: string;             // Ej: "Ace of Cups", "King of Swords"
  nameEs: string;             // Ej: "As de Copas", "Rey de Espadas"
  arcanaType: ArcanaType;     // Siempre ArcanaType.MINOR para este bloque
  number: number;             // 1-10 para numerales, 11=Paje, 12=Caballero, 13=Reina, 14=Rey
  romanNumeral?: string;      // No aplica para Menores (omitir)
  suit?: string;              // Suit del enum
  courtRank?: string;         // Solo para cartas de corte (11-14)
  element?: Element;          // Elemento del palo
  planet?: Planet;            // No aplica para Menores (omitir)
  zodiacSign?: ZodiacAssociation; // No aplica para Menores (omitir)
  meaningUpright: string;     // 3+ oraciones en español. Mínimo 50 caracteres.
  meaningReversed: string;    // 3+ oraciones en español. Mínimo 50 caracteres.
  description: string;        // Descripción visual de la carta Rider-Waite.
  keywords: {
    upright: string[];        // Mínimo 5 palabras clave en español
    reversed: string[];       // 4-5 palabras clave en español
  };
  imageUrl: string;           // Pattern: "/images/tarot/{suit}/{nn}-{slug}.jpg"
}

ENUMS VÁLIDOS:

enum ArcanaType { MAJOR = "major", MINOR = "minor" }
enum Suit { WANDS = "wands", CUPS = "cups", SWORDS = "swords", PENTACLES = "pentacles" }
enum CourtRank { PAGE = "page", KNIGHT = "knight", QUEEN = "queen", KING = "king" }
enum Element { FIRE = "fire", WATER = "water", AIR = "air", EARTH = "earth" }

ASOCIACIONES DE PALOS:
- Bastos (Wands) → Fuego (Element.FIRE) → imageUrl: /images/tarot/wands/
- Copas (Cups) → Agua (Element.WATER) → imageUrl: /images/tarot/cups/
- Espadas (Swords) → Aire (Element.AIR) → imageUrl: /images/tarot/swords/
- Oros (Pentacles) → Tierra (Element.EARTH) → imageUrl: /images/tarot/pentacles/

ESTRUCTURA POR PALO (14 cartas cada uno):
- As (1), 2, 3, 4, 5, 6, 7, 8, 9, 10
- Paje/Page (11), Caballero/Knight (12), Reina/Queen (13), Rey/King (14)

NOMBRES EN ESPAÑOL:
- Numerales: "As de Copas", "Dos de Copas", ..., "Diez de Copas"
- Corte: "Paje de Copas", "Caballero de Copas", "Reina de Copas", "Rey de Copas"
- Palos: Bastos, Copas, Espadas, Oros

EJEMPLO DE FORMATO DE SALIDA:

import { ArcanaType, Suit, CourtRank, Element } from "../enums/tarot.enums";
import { CardSeedData } from "./major-arcana.data";

export const WANDS: CardSeedData[] = [
  {
    slug: "ace-of-wands",
    nameEn: "Ace of Wands",
    nameEs: "As de Bastos",
    arcanaType: ArcanaType.MINOR,
    number: 1,
    suit: Suit.WANDS,
    element: Element.FIRE,
    meaningUpright: "El As de Bastos representa la chispa de inspiración, nuevos proyectos y energía creativa en bruto. Es el inicio de una aventura llena de pasión y entusiasmo. Las ideas fluyen con fuerza y es momento de actuar.",
    meaningReversed: "Invertida, puede indicar retrasos en proyectos, falta de motivación o energía creativa bloqueada. La pasión se ha enfriado y cuesta encontrar dirección o propósito.",
    description: "Una mano emerge de una nube sosteniendo un bastón floreciente del que brotan hojas verdes. Al fondo, un castillo sobre una colina.",
    keywords: {
      upright: ["Inspiración", "Nuevos proyectos", "Creatividad", "Pasión", "Potencial"],
      reversed: ["Bloqueo creativo", "Retrasos", "Desmotivación", "Falta de dirección", "Frustración"],
    },
    imageUrl: "/images/tarot/wands/01-ace-of-wands.jpg",
  },
  // ... continuar
];

export const CUPS: CardSeedData[] = [ /* 14 cartas */ ];
export const SWORDS: CardSeedData[] = [ /* 14 cartas */ ];
export const PENTACLES: CardSeedData[] = [ /* 14 cartas */ ];

export const MINOR_ARCANA: CardSeedData[] = [...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

REGLAS:
- Todo el texto user-facing en español
- meaningUpright y meaningReversed: mínimo 3 oraciones, mínimo 50 caracteres
- description: descripción visual de la ilustración Rider-Waite
- keywords.upright: mínimo 5 palabras clave
- keywords.reversed: 4-5 palabras clave
- courtRank SOLO para cartas 11-14 (Paje, Caballero, Reina, Rey)
- Generar las 56 cartas completas (4 palos × 14), sin "// ..." ni comentarios de continuación
```

---

### Prompt 3: Signos Zodiacales (`zodiac-signs.data.ts`)

> **Archivo destino:** `src/modules/encyclopedia/data/zodiac-signs.data.ts`
> **Volumen:** 12 signos

```
Necesito que generes los datos completos de los 12 signos zodiacales para un seeder de base de datos de una enciclopedia mística.

INTERFAZ TYPESCRIPT:

export interface ArticleSeedData {
  slug: string;                              // kebab-case. Ej: "aries", "taurus"
  nameEs: string;                            // Nombre en español. Ej: "Aries"
  nameEn: string | null;                     // Nombre en inglés. Ej: "Aries"
  category: ArticleCategory;                 // Siempre ArticleCategory.ZODIAC_SIGN
  snippet: string;                           // Resumen de 2-3 oraciones. Máximo 300 caracteres.
  content: string;                           // Artículo completo en Markdown.
  metadata: Record<string, unknown> | null;  // Datos estructurados del signo
  relatedTarotCards: number[] | null;        // IDs de cartas del tarot asociadas
  sortOrder: number;                         // 1-12
}

ENUM:
enum ArticleCategory { ZODIAC_SIGN = 'zodiac_sign' }

ESTRUCTURA DE METADATA PARA CADA SIGNO:
{
  symbol: string;           // Símbolo Unicode. Ej: "♈"
  element: string;          // "fire" | "water" | "air" | "earth"
  modality: string;         // "cardinal" | "fixed" | "mutable"
  rulingPlanet: string;     // Slug del planeta. Ej: "mars", "venus"
  dateRange: string;        // Ej: "21 Mar - 19 Abr"
  compatibleSigns: string[]; // Slugs de signos compatibles
}

ESTRUCTURA DEL CONTENT (Markdown) PARA CADA SIGNO:
# {Nombre del signo}

**Fechas:** {rango de fechas}
**Elemento:** {Fuego/Tierra/Aire/Agua}
**Modalidad:** {Cardinal/Fijo/Mutable}
**Planeta regente:** {nombre del planeta}
**Símbolo:** {símbolo unicode}

## Carácter y Personalidad
(2-3 párrafos describiendo la personalidad del signo)

## Fortalezas
(Lista de 5-7 fortalezas con descripción breve)

## Debilidades
(Lista de 4-6 debilidades con descripción breve)

## En el Amor
(1-2 párrafos sobre el signo en relaciones románticas)

## En el Trabajo
(1-2 párrafos sobre el signo en el ámbito laboral)

## Compatibilidades
(Compatibilidad con cada elemento y mención de los signos más y menos compatibles)

## Carta del Tarot Asociada
(Breve mención de la carta del tarot asociada y por qué)

LOS 12 SIGNOS A GENERAR:

| # | Signo       | Símbolo | Elemento | Modalidad | Planeta  | Fechas            | Carta Tarot Asociada (ID) |
|---|-------------|---------|----------|-----------|----------|-------------------|---------------------------|
| 1 | Aries       | ♈      | fire     | cardinal  | mars     | 21 Mar - 19 Abr   | 4 (El Emperador)          |
| 2 | Tauro       | ♉      | earth    | fixed     | venus    | 20 Abr - 20 May   | 5 (El Hierofante)         |
| 3 | Géminis     | ♊      | air      | mutable   | mercury  | 21 May - 20 Jun   | 6 (Los Enamorados)        |
| 4 | Cáncer      | ♋      | water    | cardinal  | moon     | 21 Jun - 22 Jul   | 7 (El Carro)              |
| 5 | Leo         | ♌      | fire     | fixed     | sun      | 23 Jul - 22 Ago   | 8 (La Fuerza)             |
| 6 | Virgo       | ♍      | earth    | mutable   | mercury  | 23 Ago - 22 Sep   | 9 (El Ermitaño)           |
| 7 | Libra       | ♎      | air      | cardinal  | venus    | 23 Sep - 22 Oct   | 11 (La Justicia)          |
| 8 | Escorpio    | ♏      | water    | fixed     | pluto    | 23 Oct - 21 Nov   | 13 (La Muerte)            |
| 9 | Sagitario   | ♐      | fire     | mutable   | jupiter  | 22 Nov - 21 Dic   | 14 (La Templanza)         |
|10 | Capricornio | ♑      | earth    | cardinal  | saturn   | 22 Dic - 19 Ene   | 15 (El Diablo)            |
|11 | Acuario     | ♒      | air      | fixed     | uranus   | 20 Ene - 18 Feb   | 17 (La Estrella)          |
|12 | Piscis      | ♓      | water    | mutable   | neptune  | 19 Feb - 20 Mar   | 12 (El Colgado)           |

EJEMPLO DE FORMATO DE SALIDA:

import { ArticleCategory } from "../enums/article.enums";
import { ArticleSeedData } from "./articles-seed.data";

export const ZODIAC_SIGNS: ArticleSeedData[] = [
  {
    slug: 'aries',
    nameEs: 'Aries',
    nameEn: 'Aries',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet: 'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal. Simboliza el inicio, la energía pionera y el impulso de actuar.',
    content: `# Aries\n\n**Fechas:** 21 de marzo - 19 de abril\n**Elemento:** Fuego\n...`,
    metadata: {
      symbol: '♈',
      element: 'fire',
      modality: 'cardinal',
      rulingPlanet: 'mars',
      dateRange: '21 Mar - 19 Abr',
      compatibleSigns: ['leo', 'sagittarius', 'gemini', 'aquarius'],
    },
    relatedTarotCards: [4],
    sortOrder: 1,
  },
  // ... continuar con los 11 signos restantes
];

REGLAS:
- Todo el texto en español
- snippet: máximo 300 caracteres, 2-3 oraciones
- content: Markdown completo, NO abreviado. Incluir TODAS las secciones listadas arriba para cada signo
- Generar los 12 signos completos, sin "// ..." ni comentarios de continuación
```

---

### Prompt 4: Planetas (`planets.data.ts`)

> **Archivo destino:** `src/modules/encyclopedia/data/planets.data.ts`
> **Volumen:** 10 planetas

```
Necesito que generes los datos completos de los 10 planetas astrológicos para un seeder de base de datos de una enciclopedia mística.

INTERFAZ TYPESCRIPT:

export interface ArticleSeedData {
  slug: string;                              // kebab-case. Ej: "sun", "moon", "mercury"
  nameEs: string;                            // Ej: "Sol", "Luna", "Mercurio"
  nameEn: string | null;                     // Ej: "Sun", "Moon", "Mercury"
  category: ArticleCategory;                 // Siempre ArticleCategory.PLANET
  snippet: string;                           // Resumen de 2-3 oraciones. Máximo 300 caracteres.
  content: string;                           // Artículo completo en Markdown.
  metadata: Record<string, unknown> | null;  // Datos estructurados del planeta
  relatedTarotCards: number[] | null;        // IDs de cartas del tarot asociadas
  sortOrder: number;                         // 1-10
}

ENUM:
enum ArticleCategory { PLANET = 'planet' }

ESTRUCTURA DE METADATA PARA CADA PLANETA:
{
  symbol: string;           // Símbolo Unicode del planeta. Ej: "☉" (Sol), "☽" (Luna)
  type: string;             // "personal" | "social" | "transpersonal"
  domicile: string[];       // Signos donde el planeta tiene domicilio. Ej: ["aries"] para Marte
  exaltation: string | null; // Signo donde el planeta está exaltado. Ej: "capricorn" para Marte
}

ESTRUCTURA DEL CONTENT (Markdown) PARA CADA PLANETA:
# {Nombre del planeta}

**Símbolo:** {símbolo unicode}
**Tipo:** {Personal/Social/Transpersonal}
**Domicilio:** {signos}
**Exaltación:** {signo}

## Simbolismo y Mitología
(2-3 párrafos sobre la mitología del planeta y su simbolismo)

## Influencia Astrológica
(2-3 párrafos sobre qué aspectos de la vida rige este planeta)

## {Planeta} en los Signos
(Breve descripción de cómo se manifiesta en cada signo que rige)

## Tránsitos de {Planeta}
(1-2 párrafos sobre qué significan los tránsitos de este planeta)

## Carta del Tarot Asociada
(Breve mención de la(s) carta(s) del tarot asociada(s))

LOS 10 PLANETAS A GENERAR:

| # | Planeta  | Símbolo | Tipo           | Domicilio              | Exaltación  | Carta Tarot (ID)       |
|---|----------|---------|----------------|------------------------|-------------|------------------------|
| 1 | Sol      | ☉       | personal       | leo                    | aries       | 19 (El Sol)            |
| 2 | Luna     | ☽       | personal       | cancer                 | taurus      | 2 (La Sacerdotisa)     |
| 3 | Mercurio | ☿       | personal       | gemini, virgo          | virgo       | 1 (El Mago)            |
| 4 | Venus    | ♀       | personal       | taurus, libra          | pisces      | 3 (La Emperatriz)      |
| 5 | Marte    | ♂       | personal       | aries, scorpio         | capricorn   | 16 (La Torre)          |
| 6 | Júpiter  | ♃       | social         | sagittarius, pisces    | cancer      | 10 (Rueda de Fortuna)  |
| 7 | Saturno  | ♄       | social         | capricorn, aquarius    | libra       | 21 (El Mundo)          |
| 8 | Urano    | ♅       | transpersonal  | aquarius               | scorpio     | 0 (El Loco)            |
| 9 | Neptuno  | ♆       | transpersonal  | pisces                 | leo         | 12 (El Colgado)        |
|10 | Plutón   | ♇       | transpersonal  | scorpio                | aries       | 20 (El Juicio)         |

FORMATO DE SALIDA:

import { ArticleCategory } from "../enums/article.enums";
import { ArticleSeedData } from "./articles-seed.data";

export const PLANETS: ArticleSeedData[] = [
  {
    slug: 'sun',
    nameEs: 'Sol',
    nameEn: 'Sun',
    category: ArticleCategory.PLANET,
    snippet: '...',
    content: `# Sol\n\n**Símbolo:** ☉\n...`,
    metadata: {
      symbol: '☉',
      type: 'personal',
      domicile: ['leo'],
      exaltation: 'aries',
    },
    relatedTarotCards: [19],
    sortOrder: 1,
  },
  // ... continuar con los 9 planetas restantes
];

REGLAS:
- Todo el texto en español
- snippet: máximo 300 caracteres
- content: Markdown completo con TODAS las secciones
- Generar los 10 planetas completos, sin abreviar
```

---

### Prompt 5: Casas Astrales + Elementos + Modalidades

> **Archivos destino:**
> - `src/modules/encyclopedia/data/astrological-houses.data.ts` (12 casas)
> - `src/modules/encyclopedia/data/elements-modalities.data.ts` (4 elementos + 3 modalidades)
> **Volumen:** 19 artículos

```
Necesito que generes los datos de 19 artículos para un seeder de base de datos de una enciclopedia mística: 12 casas astrales, 4 elementos y 3 modalidades.

INTERFAZ TYPESCRIPT:

export interface ArticleSeedData {
  slug: string;
  nameEs: string;
  nameEn: string | null;
  category: ArticleCategory;
  snippet: string;                           // Máximo 300 caracteres
  content: string;                           // Markdown completo
  metadata: Record<string, unknown> | null;
  relatedTarotCards: number[] | null;
  sortOrder: number;
}

ENUMS:
enum ArticleCategory {
  ASTROLOGICAL_HOUSE = 'astro_house',
  ELEMENT = 'element',
  MODALITY = 'modality',
}

=== BLOQUE 1: 12 CASAS ASTRALES ===

METADATA POR CASA:
{
  number: number;          // 1-12
  naturalSign: string;     // Slug del signo natural. Ej: "aries" para Casa 1
  rulingPlanet: string;    // Slug del planeta regente. Ej: "mars" para Casa 1
  keywords: string[];      // 3-5 palabras clave del área de vida
}

CONTENT MARKDOWN POR CASA:
# Casa {N}: {Nombre}

**Signo Natural:** {signo}
**Planeta Regente:** {planeta}
**Palabras Clave:** {keywords}

## Área de Vida
(2-3 párrafos sobre qué aspecto de la vida representa esta casa)

## Interpretación
(1-2 párrafos sobre cómo interpretar planetas en esta casa)

## Planetas en la Casa {N}
(Breve descripción del efecto de los planetas personales en esta casa)

LAS 12 CASAS:

| # | Nombre                   | Slug      | Signo Natural | Planeta  | Keywords                                |
|---|--------------------------|-----------|---------------|----------|-----------------------------------------|
| 1 | Casa del Yo              | house-1   | aries         | mars     | Identidad, apariencia, inicio           |
| 2 | Casa de los Recursos     | house-2   | taurus        | venus    | Dinero, valores, posesiones             |
| 3 | Casa de la Comunicación  | house-3   | gemini        | mercury  | Comunicación, hermanos, viajes cortos   |
| 4 | Casa del Hogar           | house-4   | cancer        | moon     | Hogar, familia, raíces                  |
| 5 | Casa de la Creatividad   | house-5   | leo           | sun      | Creatividad, romance, hijos             |
| 6 | Casa de la Salud         | house-6   | virgo         | mercury  | Salud, trabajo diario, servicio         |
| 7 | Casa de las Relaciones   | house-7   | libra         | venus    | Pareja, asociaciones, contratos         |
| 8 | Casa de la Transformación| house-8   | scorpio       | pluto    | Transformación, muerte, herencias       |
| 9 | Casa de la Filosofía     | house-9   | sagittarius   | jupiter  | Viajes largos, filosofía, educación     |
|10 | Casa de la Carrera       | house-10  | capricorn     | saturn   | Carrera, estatus, logros                |
|11 | Casa de los Ideales      | house-11  | aquarius      | uranus   | Amigos, grupos, ideales                 |
|12 | Casa del Inconsciente    | house-12  | pisces        | neptune  | Inconsciente, karma, espiritualidad     |

=== BLOQUE 2: 4 ELEMENTOS ===

METADATA POR ELEMENTO:
{
  symbol: string;           // "🔥", "🌍", "💨", "💧"
  signs: string[];          // Slugs de los 3 signos del elemento
  qualities: string[];      // 3-5 cualidades principales
}

CONTENT MARKDOWN POR ELEMENTO:
# Elemento {Nombre}

**Símbolo:** {emoji}
**Signos:** {lista de signos}
**Palo del Tarot:** {palo asociado}

## Características
(2-3 párrafos sobre las cualidades del elemento)

## Los Signos de {Elemento}
### {Signo 1}
(Breve resumen de cómo se manifiesta el elemento en este signo)
### {Signo 2}
(ídem)
### {Signo 3}
(ídem)

## Compatibilidad Elemental
(1-2 párrafos sobre cómo interactúa este elemento con los demás)

LOS 4 ELEMENTOS:

| # | Elemento | Slug  | Signos                        | Palo Tarot |
|---|----------|-------|-------------------------------|------------|
| 1 | Fuego    | fire  | aries, leo, sagittarius       | Bastos     |
| 2 | Tierra   | earth | taurus, virgo, capricorn      | Oros       |
| 3 | Aire     | air   | gemini, libra, aquarius       | Espadas    |
| 4 | Agua     | water | cancer, scorpio, pisces       | Copas      |

=== BLOQUE 3: 3 MODALIDADES ===

METADATA POR MODALIDAD:
{
  signs: string[];          // Slugs de los 4 signos de la modalidad
  quality: string;          // Descripción breve de la cualidad
}

CONTENT MARKDOWN POR MODALIDAD:
# Modalidad {Nombre}

**Signos:** {lista de signos}

## Características
(2-3 párrafos sobre la cualidad de la modalidad)

## Los Signos {Modalidad}es
### {Signo 1} ({Elemento})
(Breve resumen)
### {Signo 2} ({Elemento})
(ídem)
### {Signo 3} ({Elemento})
(ídem)
### {Signo 4} ({Elemento})
(ídem)

LAS 3 MODALIDADES:

| # | Modalidad | Slug     | Signos                              | Cualidad                    |
|---|-----------|----------|-------------------------------------|-----------------------------|
| 1 | Cardinal  | cardinal | aries, cancer, libra, capricorn     | Inicio, liderazgo, acción   |
| 2 | Fijo      | fixed    | taurus, leo, scorpio, aquarius      | Estabilidad, persistencia   |
| 3 | Mutable   | mutable  | gemini, virgo, sagittarius, pisces  | Adaptabilidad, flexibilidad |

FORMATO DE SALIDA (2 archivos separados):

// === astrological-houses.data.ts ===
import { ArticleCategory } from "../enums/article.enums";
import { ArticleSeedData } from "./articles-seed.data";

export const ASTROLOGICAL_HOUSES: ArticleSeedData[] = [ /* 12 casas */ ];

// === elements-modalities.data.ts ===
import { ArticleCategory } from "../enums/article.enums";
import { ArticleSeedData } from "./articles-seed.data";

export const ELEMENTS: ArticleSeedData[] = [ /* 4 elementos */ ];
export const MODALITIES: ArticleSeedData[] = [ /* 3 modalidades */ ];
export const ELEMENTS_AND_MODALITIES: ArticleSeedData[] = [...ELEMENTS, ...MODALITIES];

REGLAS:
- Todo el texto en español
- snippet: máximo 300 caracteres
- content: Markdown completo con TODAS las secciones, NO abreviado
- Generar los 19 artículos completos
- sortOrder: Casas 1-12, Elementos 1-4, Modalidades 1-3
```

---

### Prompt 6: Guías de Actividades (`activity-guides.data.ts`)

> **Archivo destino:** `src/modules/encyclopedia/data/activity-guides.data.ts`
> **Volumen:** 7 guías (incluye GUIDE_TAROT nueva)
> **⚠️ NOTA:** Este es el prompt más pesado. Cada guía tiene contenido Markdown extenso con secciones de cada sub-item. **Se recomienda ejecutar como 7 prompts individuales**, uno por guía, usando el mismo contexto base pero pidiendo solo 1 guía por vez.

**Contexto base (incluir al inicio de cada sub-prompt de guía):**

```
Necesito que generes el contenido completo de una guía para un seeder de base de datos de una enciclopedia mística. Esta guía se mostrará como artículo principal en la enciclopedia y será accesible desde un widget "Ver más" en la página del módulo correspondiente.

La guía debe ser COMPLETA y AUTO-SUFICIENTE: incluir historia, explicación de cómo funciona, y secciones resumidas de cada sub-item de la actividad.

INTERFAZ TYPESCRIPT:

export interface ArticleSeedData {
  slug: string;
  nameEs: string;
  nameEn: string | null;
  category: ArticleCategory;
  snippet: string;                           // Máximo 300 caracteres. Se muestra en el widget "Ver más".
  content: string;                           // Markdown extenso completo.
  metadata: Record<string, unknown> | null;
  relatedTarotCards: number[] | null;
  sortOrder: number;
}

METADATA PARA GUÍAS:
{
  sections: string[];   // Lista de títulos de secciones H2 del contenido
}
```

**Sub-prompt 6.1: Guía del Tarot (NUEVA)**

```
GUÍA A GENERAR:
- slug: "guide-tarot"
- nameEs: "Guía del Tarot"
- nameEn: "Tarot Guide"
- category: ArticleCategory.GUIDE_TAROT  (valor: 'guide_tarot')
- sortOrder: 1

ESTRUCTURA DEL CONTENT (Markdown extenso):

# Guía del Tarot

## Historia del Tarot
(3-4 párrafos: orígenes, evolución, Rider-Waite)

## ¿Cómo Funciona el Tarot?
(2-3 párrafos explicando el mecanismo de las lecturas)

## El Mazo Rider-Waite
(1-2 párrafos sobre por qué se usa este mazo)

## Los 22 Arcanos Mayores
(Introducción + sección resumida de CADA uno de los 22 Arcanos Mayores con nombre, número romano, significado breve al derecho e invertido, 1-2 oraciones cada uno)

### 0 - El Loco
### I - El Mago
### II - La Sacerdotisa
... hasta ...
### XXI - El Mundo

## Los Arcanos Menores
(Introducción sobre la estructura: 4 palos × 14 cartas)

### Bastos (Fuego)
(Resumen del palo + qué representan, 1-2 oraciones por cada carta del As al Rey)

### Copas (Agua)
(ídem)

### Espadas (Aire)
(ídem)

### Oros (Tierra)
(ídem)

## Tipos de Tiradas
(Descripción de 4-5 tiradas comunes: Cruz Celta, 3 cartas, Sí/No, etc.)

## Cómo Hacer una Lectura
(Guía paso a paso para principiantes)

## Consejos para Principiantes
(5-7 consejos prácticos)

relatedTarotCards: null (todas las cartas son relevantes)
```

**Sub-prompt 6.2: Guía de Numerología**

```
GUÍA A GENERAR:
- slug: "guide-numerology"
- nameEs: "Guía de Numerología"
- nameEn: "Numerology Guide"
- category: ArticleCategory.GUIDE_NUMEROLOGY  (valor: 'guide_numerology')
- sortOrder: 2

ESTRUCTURA DEL CONTENT (Markdown extenso):

# Guía de Numerología

## Historia de la Numerología
(2-3 párrafos: Pitágoras, tradiciones, evolución)

## ¿Cómo Funciona?
(2-3 párrafos sobre cómo se calculan los números)

## Cómo Calcular tu Número Personal
(Explicación paso a paso con ejemplo)

## Los Números del 1 al 9
(Sección detallada de CADA número con significado, personalidad, fortalezas y debilidades)

### Número 1 - El Líder
### Número 2 - El Diplomático
### Número 3 - El Comunicador
### Número 4 - El Constructor
### Número 5 - El Aventurero
### Número 6 - El Protector
### Número 7 - El Buscador
### Número 8 - El Poderoso
### Número 9 - El Humanitario

## Números Maestros
(Explicación de qué son y por qué son especiales)

### Número 11 - El Intuitivo
### Número 22 - El Constructor Maestro
### Número 33 - El Maestro Sanador

## Numerología y Compatibilidad
(Cómo interactúan los números entre sí)

## Numerología en la Vida Diaria
(Aplicaciones prácticas)

relatedTarotCards: null
```

**Sub-prompt 6.3: Guía del Péndulo**

```
GUÍA A GENERAR:
- slug: "guide-pendulum"
- nameEs: "Guía del Péndulo"
- nameEn: "Pendulum Guide"
- category: ArticleCategory.GUIDE_PENDULUM  (valor: 'guide_pendulum')
- sortOrder: 3

ESTRUCTURA DEL CONTENT (Markdown extenso):

# Guía del Péndulo

## Historia del Péndulo
(2-3 párrafos: orígenes, radiestesia, usos históricos)

## Tipos de Péndulos
(Descripción de los tipos: cristal, metal, madera, etc.)

## ¿Cómo Funciona?
(Explicación del mecanismo: respuesta ideomotora, energía, conexión)

## Cómo Usar el Péndulo
(Guía paso a paso: calibración, preguntas, interpretación)

### Paso 1: Elegir tu Péndulo
### Paso 2: Calibrar las Respuestas (Sí/No/Tal vez)
### Paso 3: Formular Preguntas
### Paso 4: Interpretar los Movimientos

## Interpretación de Movimientos
(Círculos, líneas, elipses, inmóvil)

## Consejos y Precauciones
(5-7 consejos prácticos)

relatedTarotCards: null
```

**Sub-prompt 6.4: Guía de la Carta Astral**

```
GUÍA A GENERAR:
- slug: "guide-birth-chart"
- nameEs: "Guía de la Carta Astral"
- nameEn: "Birth Chart Guide"
- category: ArticleCategory.GUIDE_BIRTH_CHART  (valor: 'guide_birth_chart')
- sortOrder: 4

ESTRUCTURA DEL CONTENT (Markdown extenso):

# Guía de la Carta Astral

## ¿Qué es una Carta Astral?
(2-3 párrafos: definición, qué representa, para qué sirve)

## Historia y Origen
(2-3 párrafos: astrología babilónica, griega, evolución)

## Componentes de la Carta Astral
(Introducción a los componentes principales)

### El Sol (Tu Esencia)
### La Luna (Tu Mundo Emocional)
### El Ascendente (Tu Imagen al Mundo)
### Los Planetas Personales (Mercurio, Venus, Marte)
### Los Planetas Sociales (Júpiter, Saturno)
### Los Planetas Transpersonales (Urano, Neptuno, Plutón)

## Las 12 Casas Astrológicas
(Resumen de cada casa: nombre, área de vida, 2-3 oraciones cada una)

### Casa 1 a Casa 12

## Los Aspectos
(Explicación de conjunción, sextil, cuadratura, trígono, oposición)

## Cómo Leer tu Carta Astral
(Guía paso a paso para principiantes)

## Sistemas de Casas
(Breve mención de Placidus, Koch, Casas Iguales)

relatedTarotCards: null
```

**Sub-prompt 6.5: Guía de Rituales**

```
GUÍA A GENERAR:
- slug: "guide-ritual"
- nameEs: "Guía de Rituales"
- nameEn: "Rituals Guide"
- category: ArticleCategory.GUIDE_RITUAL  (valor: 'guide_ritual')
- sortOrder: 5

ESTRUCTURA DEL CONTENT (Markdown extenso):

# Guía de Rituales

## ¿Qué son los Rituales?
(2-3 párrafos: definición, propósito, tipos)

## Historia de los Rituales
(2-3 párrafos: tradiciones ancestrales, evolución moderna)

## Tipos de Rituales
(Descripción de cada tipo con su propósito)

### Rituales de Protección
### Rituales de Abundancia
### Rituales de Amor
### Rituales de Limpieza Energética
### Rituales de Sanación
### Rituales de Manifestación

## Las Fases Lunares y los Rituales
(Cuándo es mejor realizar cada tipo de ritual según la luna)

### Luna Nueva
### Luna Creciente
### Luna Llena
### Luna Menguante

## Cómo Preparar un Ritual
(Guía paso a paso: espacio, materiales, intención, ejecución, cierre)

## Materiales Comunes
(Velas, cristales, hierbas, incienso, agua)

## Consejos y Precauciones
(5-7 consejos)

relatedTarotCards: null
```

**Sub-prompt 6.6: Guía del Horóscopo Occidental**

```
GUÍA A GENERAR:
- slug: "guide-horoscope"
- nameEs: "Guía del Horóscopo Occidental"
- nameEn: "Western Horoscope Guide"
- category: ArticleCategory.GUIDE_HOROSCOPE  (valor: 'guide_horoscope')
- sortOrder: 6

ESTRUCTURA DEL CONTENT (Markdown extenso):

# Guía del Horóscopo Occidental

## ¿Qué es el Horóscopo?
(2-3 párrafos: definición, diferencia con carta astral)

## Historia del Horóscopo Occidental
(3-4 párrafos: Babilonia, Grecia, Roma, era moderna)

## ¿Cómo Funciona?
(2-3 párrafos: eclíptica, zodiaco tropical vs sideral)

## Los 12 Signos del Zodíaco
(Sección resumida de CADA signo: fechas, elemento, modalidad, planeta regente, 3-4 oraciones de personalidad)

### Aries (21 Mar - 19 Abr)
### Tauro (20 Abr - 20 May)
### Géminis (21 May - 20 Jun)
### Cáncer (21 Jun - 22 Jul)
### Leo (23 Jul - 22 Ago)
### Virgo (23 Ago - 22 Sep)
### Libra (23 Sep - 22 Oct)
### Escorpio (23 Oct - 21 Nov)
### Sagitario (22 Nov - 21 Dic)
### Capricornio (22 Dic - 19 Ene)
### Acuario (20 Ene - 18 Feb)
### Piscis (19 Feb - 20 Mar)

## Los Elementos
(Breve descripción de Fuego, Tierra, Aire, Agua y qué signos incluyen)

## Las Modalidades
(Breve descripción de Cardinal, Fijo, Mutable)

## Compatibilidad entre Signos
(Tabla o secciones de compatibilidad por elemento)

relatedTarotCards: null
```

**Sub-prompt 6.7: Guía del Horóscopo Chino**

```
GUÍA A GENERAR:
- slug: "guide-chinese"
- nameEs: "Guía del Horóscopo Chino"
- nameEn: "Chinese Horoscope Guide"
- category: ArticleCategory.GUIDE_CHINESE  (valor: 'guide_chinese')
- sortOrder: 7

ESTRUCTURA DEL CONTENT (Markdown extenso):

# Guía del Horóscopo Chino

## ¿Qué es el Horóscopo Chino?
(2-3 párrafos: definición, diferencias con el occidental)

## Historia y Origen
(3-4 párrafos: leyenda de los 12 animales, tradición china)

## ¿Cómo Funciona?
(2-3 párrafos: ciclo de 12 años, cálculo por año de nacimiento)

## Los 12 Animales
(Sección resumida de CADA animal: años recientes, elemento fijo, personalidad, compatibilidades, 4-5 oraciones cada uno)

### Rata (鼠)
### Buey (牛)
### Tigre (虎)
### Conejo (兔)
### Dragón (龍)
### Serpiente (蛇)
### Caballo (馬)
### Cabra (羊)
### Mono (猴)
### Gallo (鷄)
### Perro (狗)
### Cerdo (豬)

## Los 5 Elementos (Wu Xing)
(Descripción de Madera, Fuego, Tierra, Metal, Agua y cómo modifican al animal)

### Madera (木)
### Fuego (火)
### Tierra (土)
### Metal (金)
### Agua (水)

## Compatibilidad entre Animales
(Triángulos de compatibilidad y conflictos)

## El Ciclo de 60 Años
(Explicación del ciclo completo animal × elemento)

relatedTarotCards: null
```

**Formato de salida final para el archivo:**

```
import { ArticleCategory } from "../enums/article.enums";
import { ArticleSeedData } from "./articles-seed.data";

export const ACTIVITY_GUIDES: ArticleSeedData[] = [
  // Las 7 guías generadas por los sub-prompts
];
```

---

> **NOTA:** Al agregar `GUIDE_TAROT` se debe actualizar también:
> 1. El enum `ArticleCategory` en `article.enums.ts`: agregar `GUIDE_TAROT = 'guide_tarot'`
> 2. El enum `ArticleCategory` en `frontend/src/types/encyclopedia-article.types.ts`
> 3. El mapa `ARTICLE_CATEGORY_LABELS`: agregar `[ArticleCategory.GUIDE_TAROT]: 'Guía del Tarot'`
> 4. TASK-317: agregar widget `<EncyclopediaInfoWidget slug="guide-tarot" />` en la página de lecturas de tarot
> 5. La tabla de contenido del Overview del módulo (agregar fila "Guía: Tarot")

---

**Fin del Módulo Enciclopedia Mística**
