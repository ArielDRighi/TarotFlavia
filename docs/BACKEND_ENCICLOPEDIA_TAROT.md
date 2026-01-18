# BACKLOG AUGURIA 2.0 - ENCICLOPEDIA DEL TAROT

## Historias de Usuario

**Fecha de creación:** 18 de enero de 2026  
**Módulo:** Enciclopedia del Tarot  
**Prioridad Global:** 🟡 MEDIA  
**Estimación Total:** 6-8 días

---

## OVERVIEW DEL MÓDULO

La Enciclopedia del Tarot es una sección educativa que permite a los usuarios explorar y aprender sobre las 78 cartas del Tarot. Incluye los 22 Arcanos Mayores y los 56 Arcanos Menores organizados por palos.

### Estructura del Tarot:

| Categoría        | Cantidad | Descripción                            |
| ---------------- | -------- | -------------------------------------- |
| Arcanos Mayores  | 22       | El Loco (0) a El Mundo (XXI)           |
| Bastos (Wands)   | 14       | As al 10 + Paje, Caballero, Reina, Rey |
| Copas (Cups)     | 14       | As al 10 + Corte                       |
| Espadas (Swords) | 14       | As al 10 + Corte                       |
| Oros (Pentacles) | 14       | As al 10 + Corte                       |
| **Total**        | **78**   |                                        |

### Funcionalidades principales:

- Navegación por categorías (Mayores/Menores/Palos)
- Búsqueda de cartas por nombre
- Vista detallada de cada carta
- Significados derecha/invertida
- Palabras clave y asociaciones
- Relación con otras cartas
- Favoritos (usuarios registrados)

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

### HU-ENC-003: Gestionar favoritos (Usuario Registrado)

```gherkin
Feature: Guardar cartas favoritas
  Como usuario registrado
  Quiero guardar mis cartas favoritas
  Para acceder rápidamente a ellas

  Background:
    Given soy un usuario registrado y autenticado
    And estoy en la enciclopedia

  Scenario: Agregar carta a favoritos
    Given estoy viendo "La Estrella"
    When hago clic en el ícono de corazón
    Then la carta se agrega a mis favoritos
    And el ícono cambia a corazón lleno
    And veo un toast "Agregada a favoritos"

  Scenario: Ver mis cartas favoritas
    Given tengo 5 cartas en favoritos
    When voy a "Mis Favoritos" en la enciclopedia
    Then veo las 5 cartas que guardé
    And puedo hacer clic en cada una

  Scenario: Quitar carta de favoritos
    Given "La Luna" está en mis favoritos
    When hago clic en el corazón de "La Luna"
    Then la carta se quita de favoritos
    And el ícono vuelve a corazón vacío

  Scenario: Usuario anónimo intenta agregar favorito
    Given soy usuario anónimo
    When intento agregar una carta a favoritos
    Then veo un mensaje "Inicia sesión para guardar favoritos"
    And veo un botón para registrarse
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

# Backend: Entidades y Migraciones

---

### TASK-300: Crear entidad TarotCard

**Módulo:** `src/modules/encyclopedia/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** Ninguna

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
│   ├── tarot-card.entity.ts
│   └── user-favorite-card.entity.ts
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

- [ ] Crear `tarot.enums.ts`:

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

- [ ] Crear `tarot-card.entity.ts`:

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

- [ ] Crear migración:

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

- [ ] Test: Entidad se crea correctamente
- [ ] Test: Slug es único
- [ ] Test: JSONB de keywords funciona
- [ ] Test: Enums validan correctamente

---

#### 🎯 Criterios de Aceptación

- [ ] Migración ejecuta sin errores
- [ ] Entidad soporta 78 cartas
- [ ] Índices creados para búsquedas comunes
- [ ] Enums cubren todas las opciones

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El slug es la clave de búsqueda principal
> - `suit` y `courtRank` son NULL para Arcanos Mayores
> - `romanNumeral` es NULL para Arcanos Menores
> - Las imágenes se almacenan como URLs (no binarios)

# Backend: Entidad de Favoritos

---

### TASK-301: Crear entidad UserFavoriteCard

**Módulo:** `src/modules/encyclopedia/entities/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-300

---

#### 📋 Descripción

Crear la entidad para almacenar las cartas favoritas de cada usuario.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/entities/user-favorite-card.entity.ts`
- `src/database/migrations/XXXX-CreateUserFavoriteCards.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `user-favorite-card.entity.ts`:

  ```typescript
  import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
    Unique,
  } from "typeorm";
  import { User } from "@/modules/users/entities/user.entity";
  import { TarotCard } from "./tarot-card.entity";

  @Entity("user_favorite_cards")
  @Unique("unique_user_card", ["userId", "cardId"])
  @Index("idx_favorites_user", ["userId"])
  export class UserFavoriteCard {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    cardId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(() => TarotCard, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cardId" })
    card: TarotCard;

    @CreateDateColumn()
    createdAt: Date;
  }
  ```

- [ ] Crear migración:

  ```typescript
  // XXXX-CreateUserFavoriteCards.ts
  export class CreateUserFavoriteCards implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE user_favorite_cards (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          card_id INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          
          CONSTRAINT fk_favorite_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
            
          CONSTRAINT fk_favorite_card
            FOREIGN KEY (card_id)
            REFERENCES tarot_cards(id)
            ON DELETE CASCADE,
            
          CONSTRAINT unique_user_card
            UNIQUE (user_id, card_id)
        );
      `);

      await queryRunner.query(`
        CREATE INDEX idx_favorites_user ON user_favorite_cards(user_id);
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("DROP TABLE IF EXISTS user_favorite_cards");
    }
  }
  ```

##### Testing

- [ ] Test: Crear favorito funciona
- [ ] Test: Constraint único previene duplicados
- [ ] Test: Cascade delete funciona con usuario
- [ ] Test: Cascade delete funciona con carta

---

#### 🎯 Criterios de Aceptación

- [ ] Relación muchos-a-muchos funciona
- [ ] No se pueden duplicar favoritos
- [ ] Eliminar usuario elimina sus favoritos
- [ ] Índice en userId para consultas rápidas

---

### TASK-302: Crear Seeder de Cartas del Tarot

**Módulo:** `src/modules/encyclopedia/data/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-300

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

- [ ] Crear `major-arcana.data.ts` (22 cartas):

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

- [ ] Crear `minor-arcana.data.ts` (56 cartas, ejemplo de Copas):

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

- [ ] Crear `cards-seed.data.ts`:

  ```typescript
  import { MAJOR_ARCANA } from "./major-arcana.data";
  import { CUPS, WANDS, SWORDS, PENTACLES } from "./minor-arcana.data";

  export const ALL_CARDS = [...MAJOR_ARCANA, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

  export const TOTAL_CARDS = 78;
  ```

- [ ] Crear comando de seed:

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

- [ ] Test: Seed inserta 78 cartas
- [ ] Test: No duplica si ya existen
- [ ] Test: Todos los slugs son únicos
- [ ] Test: Todas las cartas tienen contenido mínimo

---

#### 🎯 Criterios de Aceptación

- [ ] 22 Arcanos Mayores completos
- [ ] 56 Arcanos Menores completos (14 x 4 palos)
- [ ] Todos los campos requeridos llenos
- [ ] Comando de seed funciona
- [ ] Contenido en español de calidad

# Backend: Módulo y Servicio

---

### TASK-303: Crear módulo y servicio de Enciclopedia

**Módulo:** `src/modules/encyclopedia/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-300, TASK-301, TASK-302

---

#### 📋 Descripción

Crear el módulo NestJS con el servicio principal para consultar cartas y gestionar favoritos.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/encyclopedia/encyclopedia.module.ts`
- `src/modules/encyclopedia/application/services/encyclopedia.service.ts`
- `src/modules/encyclopedia/application/services/favorites.service.ts`
- `src/modules/encyclopedia/application/dto/*.dto.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear DTOs:

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

    @ApiProperty({ example: false })
    isFavorite: boolean;
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

      return this.toDetailDto(card, false); // isFavorite se setea en controller
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

    private toDetailDto(card: TarotCard, isFavorite: boolean): CardDetailDto {
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
        isFavorite,
      };
    }
  }
  ```

- [ ] Crear `favorites.service.ts`:

  ```typescript
  import { Injectable, ConflictException } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository } from "typeorm";
  import { UserFavoriteCard } from "../entities/user-favorite-card.entity";
  import { TarotCard } from "../entities/tarot-card.entity";
  import { CardSummaryDto } from "../application/dto/card-response.dto";

  @Injectable()
  export class FavoritesService {
    constructor(
      @InjectRepository(UserFavoriteCard)
      private readonly favoriteRepository: Repository<UserFavoriteCard>,
      @InjectRepository(TarotCard)
      private readonly cardRepository: Repository<TarotCard>,
    ) {}

    /**
     * Agregar carta a favoritos
     */
    async addFavorite(userId: number, cardId: number): Promise<void> {
      const existing = await this.favoriteRepository.findOne({
        where: { userId, cardId },
      });

      if (existing) {
        throw new ConflictException("La carta ya está en favoritos");
      }

      const favorite = this.favoriteRepository.create({ userId, cardId });
      await this.favoriteRepository.save(favorite);
    }

    /**
     * Quitar carta de favoritos
     */
    async removeFavorite(userId: number, cardId: number): Promise<void> {
      await this.favoriteRepository.delete({ userId, cardId });
    }

    /**
     * Verificar si es favorito
     */
    async isFavorite(userId: number, cardId: number): Promise<boolean> {
      const count = await this.favoriteRepository.count({
        where: { userId, cardId },
      });
      return count > 0;
    }

    /**
     * Obtener favoritos del usuario
     */
    async getUserFavorites(userId: number): Promise<CardSummaryDto[]> {
      const favorites = await this.favoriteRepository.find({
        where: { userId },
        relations: ["card"],
        order: { createdAt: "DESC" },
      });

      return favorites.map((fav) => ({
        id: fav.card.id,
        slug: fav.card.slug,
        nameEs: fav.card.nameEs,
        arcanaType: fav.card.arcanaType,
        number: fav.card.number,
        suit: fav.card.suit,
        thumbnailUrl: fav.card.thumbnailUrl || fav.card.imageUrl,
      }));
    }

    /**
     * Obtener IDs de favoritos (para marcar en listados)
     */
    async getUserFavoriteIds(userId: number): Promise<number[]> {
      const favorites = await this.favoriteRepository.find({
        where: { userId },
        select: ["cardId"],
      });

      return favorites.map((f) => f.cardId);
    }
  }
  ```

- [ ] Crear `encyclopedia.module.ts`:

  ```typescript
  import { Module } from "@nestjs/common";
  import { TypeOrmModule } from "@nestjs/typeorm";
  import { TarotCard } from "./entities/tarot-card.entity";
  import { UserFavoriteCard } from "./entities/user-favorite-card.entity";
  import { EncyclopediaService } from "./application/services/encyclopedia.service";
  import { FavoritesService } from "./application/services/favorites.service";
  import { EncyclopediaController } from "./infrastructure/controllers/encyclopedia.controller";

  @Module({
    imports: [TypeOrmModule.forFeature([TarotCard, UserFavoriteCard])],
    providers: [EncyclopediaService, FavoritesService],
    controllers: [EncyclopediaController],
    exports: [EncyclopediaService],
  })
  export class EncyclopediaModule {}
  ```

- [ ] Registrar en `app.module.ts`

##### Testing

- [ ] Test: findAll retorna 78 cartas
- [ ] Test: Filtro por arcanaType funciona
- [ ] Test: Filtro por suit funciona
- [ ] Test: Búsqueda por nombre funciona
- [ ] Test: findBySlug retorna carta correcta
- [ ] Test: 404 para slug inexistente
- [ ] Test: Favoritos CRUD funciona

---

#### 🎯 Criterios de Aceptación

- [ ] Servicio consulta todas las cartas
- [ ] Filtros funcionan correctamente
- [ ] Búsqueda es case-insensitive
- [ ] Favoritos se gestionan correctamente
- [ ] ViewCount se incrementa

# Backend: Endpoints

---

### TASK-304: Crear endpoints de Enciclopedia

**Módulo:** `src/modules/encyclopedia/infrastructure/controllers/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-303

---

#### 📋 Descripción

Implementar endpoints REST para consultar cartas y gestionar favoritos.

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
| GET    | `/encyclopedia/favorites`              | Mis favoritos             | Sí   |
| POST   | `/encyclopedia/favorites/:cardId`      | Agregar favorito          | Sí   |
| DELETE | `/encyclopedia/favorites/:cardId`      | Quitar favorito           | Sí   |

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `encyclopedia.controller.ts`:

  ```typescript
  import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
    ParseEnumPipe,
    HttpCode,
    HttpStatus,
  } from "@nestjs/common";
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
  import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
  import { OptionalAuthGuard } from "@/common/guards/optional-auth.guard";
  import { CurrentUser } from "@/common/decorators/current-user.decorator";
  import { User } from "@/modules/users/entities/user.entity";
  import { EncyclopediaService } from "../application/services/encyclopedia.service";
  import { FavoritesService } from "../application/services/favorites.service";
  import { CardFiltersDto } from "../application/dto/card-filters.dto";
  import { CardSummaryDto, CardDetailDto } from "../application/dto/card-response.dto";
  import { Suit } from "../enums/tarot.enums";

  @ApiTags("Encyclopedia")
  @Controller("encyclopedia")
  export class EncyclopediaController {
    constructor(
      private readonly encyclopediaService: EncyclopediaService,
      private readonly favoritesService: FavoritesService,
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
    @UseGuards(OptionalAuthGuard)
    @ApiOperation({ summary: "Obtener detalle de una carta" })
    @ApiParam({ name: "slug", example: "the-fool" })
    @ApiResponse({ status: 200, type: CardDetailDto })
    @ApiResponse({ status: 404, description: "Carta no encontrada" })
    async getCardBySlug(@Param("slug") slug: string, @CurrentUser() user?: User): Promise<CardDetailDto> {
      const card = await this.encyclopediaService.findBySlug(slug);

      // Verificar si es favorito (si hay usuario)
      if (user) {
        const isFavorite = await this.favoritesService.isFavorite(user.id, card.id);
        return { ...card, isFavorite };
      }

      return { ...card, isFavorite: false };
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

    // =====================
    // FAVORITOS (requieren auth)
    // =====================

    /**
     * GET /encyclopedia/favorites
     * Obtener mis cartas favoritas
     */
    @Get("favorites")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener mis cartas favoritas" })
    @ApiResponse({ status: 200, type: [CardSummaryDto] })
    async getMyFavorites(@CurrentUser() user: User): Promise<CardSummaryDto[]> {
      return this.favoritesService.getUserFavorites(user.id);
    }

    /**
     * POST /encyclopedia/favorites/:cardId
     * Agregar carta a favoritos
     */
    @Post("favorites/:cardId")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Agregar carta a favoritos" })
    @ApiParam({ name: "cardId", example: 1 })
    @ApiResponse({ status: 201, description: "Agregada a favoritos" })
    @ApiResponse({ status: 409, description: "Ya está en favoritos" })
    async addFavorite(
      @CurrentUser() user: User,
      @Param("cardId", ParseIntPipe) cardId: number,
    ): Promise<{ message: string }> {
      await this.favoritesService.addFavorite(user.id, cardId);
      return { message: "Carta agregada a favoritos" };
    }

    /**
     * DELETE /encyclopedia/favorites/:cardId
     * Quitar carta de favoritos
     */
    @Delete("favorites/:cardId")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Quitar carta de favoritos" })
    @ApiParam({ name: "cardId", example: 1 })
    @ApiResponse({ status: 200, description: "Eliminada de favoritos" })
    async removeFavorite(
      @CurrentUser() user: User,
      @Param("cardId", ParseIntPipe) cardId: number,
    ): Promise<{ message: string }> {
      await this.favoritesService.removeFavorite(user.id, cardId);
      return { message: "Carta eliminada de favoritos" };
    }
  }
  ```

- [ ] Crear `OptionalAuthGuard` si no existe:

  ```typescript
  // src/common/guards/optional-auth.guard.ts
  import { Injectable, ExecutionContext } from "@nestjs/common";
  import { AuthGuard } from "@nestjs/passport";

  @Injectable()
  export class OptionalAuthGuard extends AuthGuard("jwt") {
    handleRequest(err: any, user: any) {
      // No lanzar error si no hay usuario
      return user || null;
    }
  }
  ```

##### Testing

- [ ] Test e2e: GET /encyclopedia/cards retorna 78 cartas
- [ ] Test e2e: GET /encyclopedia/cards?arcanaType=major retorna 22
- [ ] Test e2e: GET /encyclopedia/cards/suit/cups retorna 14
- [ ] Test e2e: GET /encyclopedia/cards/search?q=mag retorna resultados
- [ ] Test e2e: GET /encyclopedia/cards/the-fool retorna detalle
- [ ] Test e2e: GET /encyclopedia/cards/invalid retorna 404
- [ ] Test e2e: GET /encyclopedia/favorites sin auth retorna 401
- [ ] Test e2e: POST /encyclopedia/favorites/1 agrega favorito
- [ ] Test e2e: POST duplicado retorna 409
- [ ] Test e2e: DELETE /encyclopedia/favorites/1 elimina

---

#### 🎯 Criterios de Aceptación

- [ ] Todos los endpoints funcionan
- [ ] Filtros se aplican correctamente
- [ ] OptionalAuthGuard funciona
- [ ] Favoritos requieren autenticación
- [ ] Documentación Swagger completa

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - OptionalAuthGuard permite que el endpoint funcione con o sin auth
> - El campo `isFavorite` solo se calcula si hay usuario
> - La búsqueda requiere mínimo 2 caracteres
> - Usar ILIKE para búsqueda case-insensitive en PostgreSQL

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
    isFavorite: boolean;
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
      FAVORITES: "/encyclopedia/favorites",
      ADD_FAVORITE: (cardId: number) => `/encyclopedia/favorites/${cardId}`,
      REMOVE_FAVORITE: (cardId: number) => `/encyclopedia/favorites/${cardId}`,
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

  export async function getFavorites(): Promise<CardSummary[]> {
    const response = await apiClient.get<CardSummary[]>(API_ENDPOINTS.ENCYCLOPEDIA.FAVORITES);
    return response.data;
  }

  export async function addFavorite(cardId: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ENCYCLOPEDIA.ADD_FAVORITE(cardId));
  }

  export async function removeFavorite(cardId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ENCYCLOPEDIA.REMOVE_FAVORITE(cardId));
  }
  ```

- [ ] Crear `useEncyclopedia.ts`:

  ```typescript
  "use client";

  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import {
    getCards,
    getMajorArcana,
    getCardsBySuit,
    searchCards,
    getCardBySlug,
    getRelatedCards,
    getCardNavigation,
    getFavorites,
    addFavorite,
    removeFavorite,
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
    favorites: () => [...encyclopediaKeys.all, "favorites"] as const,
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

  export function useFavorites() {
    return useQuery({
      queryKey: encyclopediaKeys.favorites(),
      queryFn: getFavorites,
    });
  }

  export function useToggleFavorite() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ cardId, isFavorite }: { cardId: number; isFavorite: boolean }) => {
        if (isFavorite) {
          await removeFavorite(cardId);
        } else {
          await addFavorite(cardId);
        }
      },
      onSuccess: (_, { cardId }) => {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: encyclopediaKeys.favorites() });
        // Actualizar el detalle de la carta si está en caché
        queryClient.invalidateQueries({ queryKey: encyclopediaKeys.all });
      },
    });
  }
  ```

- [ ] Exportar desde `types/index.ts`

##### Testing

- [ ] Test: Tipos se exportan correctamente
- [ ] Test: API functions hacen llamadas correctas
- [ ] Test: Hooks retornan datos esperados
- [ ] Test: useSearchCards solo ejecuta con 2+ caracteres
- [ ] Test: useToggleFavorite invalida queries

---

#### 🎯 Criterios de Aceptación

- [ ] Tipos completos para todas las entidades
- [ ] API functions cubren todos los endpoints
- [ ] Hooks con staleTime apropiado (1h para datos estáticos)
- [ ] Toggle de favoritos funciona con invalidación

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
├── FavoriteButton.tsx
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

- [ ] Crear `FavoriteButton.tsx`:

  ```tsx
  "use client";

  import { Heart } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { useToggleFavorite } from "@/hooks/api/useEncyclopedia";
  import { useAuthStore } from "@/stores/authStore";
  import { useToast } from "@/hooks/useToast";
  import { cn } from "@/lib/utils";

  interface FavoriteButtonProps {
    cardId: number;
    isFavorite: boolean;
    className?: string;
  }

  export function FavoriteButton({ cardId, isFavorite, className }: FavoriteButtonProps) {
    const { isAuthenticated } = useAuthStore();
    const { toast } = useToast();
    const { mutate, isPending } = useToggleFavorite();

    const handleClick = () => {
      if (!isAuthenticated) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para guardar favoritos",
          variant: "destructive",
        });
        return;
      }

      mutate(
        { cardId, isFavorite },
        {
          onSuccess: () => {
            toast({
              title: isFavorite ? "Eliminada" : "Agregada",
              description: isFavorite ? "Carta eliminada de favoritos" : "Carta agregada a favoritos",
            });
          },
        },
      );
    };

    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isPending}
        className={cn("transition-colors", isFavorite && "text-red-500 hover:text-red-600", className)}
      >
        <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
      </Button>
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
  import { FavoriteButton } from "./FavoriteButton";
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
          <FavoriteButton cardId={card.id} isFavorite={card.isFavorite} />
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
- [ ] Test: FavoriteButton muestra estado correcto
- [ ] Test: CardNavigation muestra anterior/siguiente
- [ ] Test: CardImage abre modal al hacer clic
- [ ] Test: Tabs de significados funcionan

---

#### 🎯 Criterios de Aceptación

- [ ] Vista de detalle muestra toda la información
- [ ] Imagen se puede ampliar en modal
- [ ] Favoritos funcionan con feedback visual
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
- `frontend/src/app/enciclopedia/favoritos/page.tsx`

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
    ENCICLOPEDIA_FAVORITOS: "/enciclopedia/favoritos",
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

- [ ] Crear `app/enciclopedia/favoritos/page.tsx`:

  ```tsx
  "use client";

  import { useRouter } from "next/navigation";
  import { useEffect } from "react";
  import { Heart } from "lucide-react";
  import { CardGrid, EncyclopediaSkeleton } from "@/components/features/encyclopedia";
  import { useFavorites } from "@/hooks/api/useEncyclopedia";
  import { useAuthStore } from "@/stores/authStore";
  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import { ROUTES } from "@/lib/constants/routes";

  export default function FavoritosPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuthStore();
    const { data: favorites, isLoading } = useFavorites();

    // Redirect si no está autenticado
    useEffect(() => {
      if (!authLoading && !isAuthenticated) {
        router.push("/login?redirect=/enciclopedia/favoritos");
      }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || !isAuthenticated) {
      return (
        <div className="container mx-auto py-8 px-4">
          <EncyclopediaSkeleton variant="grid" count={6} />
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="font-serif text-4xl">Mis Favoritos</h1>
          </div>
          <p className="text-muted-foreground">Tus cartas guardadas para referencia rápida</p>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <EncyclopediaSkeleton variant="grid" count={6} />
        ) : favorites && favorites.length > 0 ? (
          <CardGrid cards={favorites} />
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl mb-2">Sin favoritos aún</h2>
            <p className="text-muted-foreground mb-6">Explora la enciclopedia y guarda las cartas que te interesen</p>
            <Button asChild>
              <Link href={ROUTES.ENCICLOPEDIA}>Explorar cartas</Link>
            </Button>
          </div>
        )}
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
    { href: "/enciclopedia", label: "Enciclopedia" },
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
- [ ] Test: Favoritos requiere auth
- [ ] Test: Estado vacío de favoritos

---

#### 🎯 Criterios de Aceptación

- [ ] /enciclopedia muestra grid de cartas
- [ ] Filtros y búsqueda funcionan
- [ ] /enciclopedia/[slug] muestra detalle
- [ ] /enciclopedia/favoritos requiere auth
- [ ] Link en header
- [ ] Responsive en móvil

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - La búsqueda solo se activa con 2+ caracteres
> - El selector de palo solo aparece en categoría "minor"
> - Favoritos redirige a login si no está autenticado
> - Usar useCallback para handleSearch (evitar re-renders)

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

### Tabla: `user_favorite_cards`

```sql
CREATE TABLE user_favorite_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  card_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign Keys
  CONSTRAINT fk_favorite_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_card
    FOREIGN KEY (card_id) REFERENCES tarot_cards(id) ON DELETE CASCADE,

  -- Único por usuario-carta
  CONSTRAINT unique_user_card UNIQUE (user_id, card_id)
);

CREATE INDEX idx_favorites_user ON user_favorite_cards(user_id);
```

### Tamaño Estimado

| Tabla               | Registros | Tamaño Aprox            |
| ------------------- | --------- | ----------------------- |
| tarot_cards         | 78        | ~200 KB                 |
| user_favorite_cards | Variable  | ~1 KB por 100 favoritos |

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

| Tarea    | Descripción              | Estimación |
| -------- | ------------------------ | ---------- |
| TASK-300 | Entidad TarotCard        | 1 día      |
| TASK-301 | Entidad UserFavoriteCard | 0.5 días   |
| TASK-302 | Seeder de 78 cartas      | 1.5 días   |
| TASK-303 | Módulo y servicios       | 1 día      |
| TASK-304 | Endpoints                | 1 día      |
| TASK-305 | Types y hooks frontend   | 0.5 días   |
| TASK-306 | Componentes de lista     | 1 día      |
| TASK-307 | Componentes de detalle   | 1 día      |
| TASK-308 | Páginas                  | 1 día      |

**Total:** 8.5 días

---

## ORDEN DE IMPLEMENTACIÓN

```
Semana 1: Backend
├── TASK-300: Entidad TarotCard (1d)
├── TASK-301: Entidad UserFavoriteCard (0.5d)
├── TASK-302: Seeder de cartas (1.5d)
├── TASK-303: Módulo y servicios (1d)
└── TASK-304: Endpoints (1d)

Semana 2: Frontend
├── TASK-305: Types y hooks (0.5d)
├── TASK-306: Componentes lista (1d)
├── TASK-307: Componentes detalle (1d)
└── TASK-308: Páginas (1d)
```

---

## RIESGOS

| Riesgo                          | Probabilidad | Impacto | Mitigación                        |
| ------------------------------- | ------------ | ------- | --------------------------------- |
| Contenido de cartas incompleto  | Media        | Alto    | Usar contenido genérico temporal  |
| Imágenes no disponibles         | Media        | Medio   | Placeholder images                |
| Seeder toma mucho tiempo        | Baja         | Bajo    | Ejecutar en migración separada    |
| Búsqueda lenta con muchos datos | Baja         | Bajo    | Solo 78 registros, no es problema |

---

## CHECKLIST DE COMPLETITUD

### Backend

- [ ] TASK-300: Entidad TarotCard creada
- [ ] TASK-301: Entidad UserFavoriteCard creada
- [ ] TASK-302: Seeder con 78 cartas
- [ ] TASK-303: Módulo y servicios
- [ ] TASK-304: Endpoints funcionando

### Frontend

- [ ] TASK-305: Types y hooks
- [ ] TASK-306: Componentes de lista
- [ ] TASK-307: Componentes de detalle
- [ ] TASK-308: Páginas

### Contenido

- [ ] 22 Arcanos Mayores con contenido
- [ ] 56 Arcanos Menores con contenido
- [ ] 78 imágenes de cartas
- [ ] Palabras clave para cada carta

### Testing

- [ ] Tests unitarios de servicios
- [ ] Tests e2e de endpoints
- [ ] Tests de componentes
- [ ] Coverage >80%

---

## NOTAS ADICIONALES

### SEO

Cada página de carta debería tener:

- Title: "El Loco - Significado del Tarot | Auguria"
- Description: Primer párrafo del significado
- Open Graph image: Imagen de la carta

### Accesibilidad

- Imágenes con alt text descriptivo
- Navegación por teclado en el grid
- Contraste adecuado en badges
- aria-labels en botones de favoritos

### Performance

- Las imágenes deben usar `next/image` con sizes apropiados
- Lazy loading para grid de cartas
- staleTime de 1 hora (datos estáticos)
- Prefetch de carta al hover (opcional)

---

**Fin del Módulo Enciclopedia del Tarot**
