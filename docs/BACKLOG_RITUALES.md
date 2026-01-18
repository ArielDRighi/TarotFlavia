# BACKLOG AUGURIA 2.0 - RITUALES

## Historias de Usuario

**Fecha de creación:** 18 de enero de 2026  
**Módulo:** Rituales  
**Prioridad Global:** 🟡 MEDIA  
**Estimación Total:** 8-10 días

---

## OVERVIEW DEL MÓDULO

Los Rituales son guías paso a paso para prácticas espirituales y esotéricas. Incluyen rituales de tarot, meditaciones guiadas, limpiezas energéticas y ceremonias lunares. Cada ritual tiene instrucciones detalladas, materiales necesarios y tiempos sugeridos para cada fase.

### Categorías de Rituales:

| Categoría  | Descripción                       | Ejemplos                                 |
| ---------- | --------------------------------- | ---------------------------------------- |
| Tarot      | Rituales de preparación y lectura | Consagración de mazo, limpieza de cartas |
| Lunar      | Ceremonias según fase lunar       | Luna nueva, luna llena                   |
| Limpieza   | Purificación energética           | Limpieza con sal, sahumerio              |
| Meditación | Prácticas contemplativas          | Meditación con carta, visualización      |
| Protección | Rituales de protección            | Círculo de protección, escudo            |
| Abundancia | Atracción de prosperidad          | Ritual de abundancia, dinero             |

### Funcionalidades principales:

- Catálogo de rituales por categoría
- Vista detallada con pasos e instrucciones
- Marcar como completado (usuarios registrados)
- Historial de rituales realizados
- Rituales destacados según fase lunar

---

## 1. HISTORIAS DE USUARIO

### HU-RIT-001: Explorar catálogo de rituales (Usuario Anónimo)

```gherkin
Feature: Explorar rituales como usuario anónimo
  Como usuario anónimo
  Quiero ver el catálogo de rituales disponibles
  Para conocer las prácticas que puedo realizar

  Background:
    Given soy un usuario anónimo en Auguria

  Scenario: Acceder al catálogo de rituales
    When navego a la sección "Rituales"
    Then veo la página principal con:
      - Sección "Rituales Destacados" (según fase lunar actual)
      - Categorías de rituales con iconos
      - Buscador de rituales
      - Filtro por dificultad

  Scenario: Ver rituales por categoría
    Given estoy en la página de rituales
    When hago clic en la categoría "Lunar"
    Then veo todos los rituales de ceremonias lunares
    And cada ritual muestra:
      | Campo | Ejemplo |
      | Título | Ritual de Luna Nueva |
      | Duración | 30 minutos |
      | Dificultad | Principiante |
      | Materiales | 4 elementos |
      | Imagen | Thumbnail |

  Scenario: Buscar ritual específico
    Given estoy en la página de rituales
    When escribo "limpieza" en el buscador
    Then veo rituales que contengan "limpieza" en título o descripción
    And los resultados muestran relevancia

  Scenario: Filtrar por dificultad
    Given estoy en la página de rituales
    When selecciono filtro "Dificultad: Principiante"
    Then solo veo rituales marcados como principiante
```

---

### HU-RIT-002: Ver detalle de un ritual

```gherkin
Feature: Ver información detallada de un ritual
  Como usuario
  Quiero ver todos los detalles de un ritual
  Para saber cómo realizarlo correctamente

  Scenario: Ver detalle completo de ritual
    When hago clic en "Ritual de Luna Nueva"
    Then veo la página de detalle con:
      | Sección | Contenido |
      | Header | Título, categoría, duración, dificultad |
      | Descripción | Propósito y beneficios del ritual |
      | Mejor momento | "Realizar durante luna nueva" |
      | Materiales | Lista de elementos necesarios |
      | Preparación | Pasos previos al ritual |
      | Pasos | Instrucciones numeradas con tiempos |
      | Cierre | Cómo finalizar el ritual |
      | Consejos | Tips adicionales |

  Scenario: Ver materiales necesarios
    Given estoy viendo el ritual "Limpieza con Sahumerio"
    When reviso la sección de materiales
    Then veo una lista con:
      - Sahumerio o incienso
      - Vela blanca
      - Recipiente resistente al calor
      - Fósforos o encendedor
    And cada material indica si es opcional u obligatorio

  Scenario: Ver pasos del ritual
    Given estoy viendo un ritual
    When reviso los pasos
    Then cada paso muestra:
      | Campo | Ejemplo |
      | Número | Paso 1 |
      | Título | Preparar el espacio |
      | Descripción | Limpia y ordena el área... |
      | Duración | 5 minutos |
      | Imagen (opcional) | Ilustración del paso |
```

---

### HU-RIT-003: Marcar ritual como completado (Usuario Registrado)

```gherkin
Feature: Marcar ritual como completado
  Como usuario registrado
  Quiero marcar un ritual como completado
  Para llevar un registro de mi práctica espiritual

  Background:
    Given soy un usuario registrado y autenticado
    And estoy viendo el detalle de un ritual

  Scenario: Completar ritual desde el detalle
    When hago clic en "Marcar como Completado"
    Then veo un modal de confirmación
    And puedo agregar notas opcionales
    And puedo dar una calificación (1-5 estrellas)
    When confirmo la acción
    Then el ritual se guarda en mi historial
    And veo mensaje "¡Ritual completado!"

  Scenario: Completar ritual con notas
    Given hago clic en "Marcar como Completado"
    When escribo "Me sentí muy tranquilo durante la práctica"
    And selecciono 5 estrellas
    And confirmo
    Then las notas y calificación se guardan con el registro
```

---

### HU-RIT-004: Historial de rituales (Usuario Registrado)

```gherkin
Feature: Ver historial de rituales realizados
  Como usuario registrado
  Quiero ver mi historial de rituales
  Para llevar un registro de mi práctica espiritual

  Background:
    Given soy un usuario registrado y autenticado

  Scenario: Ver historial en perfil
    When accedo a "Mi Historial de Rituales"
    Then veo una lista de rituales completados
    And cada entrada muestra:
      | Campo | Ejemplo |
      | Ritual | Ritual de Luna Nueva |
      | Fecha | 15 de enero de 2026 |
      | Fase lunar | Luna Nueva en Capricornio |
      | Notas (si las hay) | "Me sentí muy tranquilo" |

  Scenario: Agregar notas a un ritual completado
    Given completé un ritual
    When veo la pantalla de completado
    Then puedo agregar notas personales
    And las notas se guardan con el registro

  Scenario: Ver estadísticas
    Given tengo varios rituales completados
    When veo mi historial
    Then veo estadísticas:
      - Total de rituales realizados
      - Categoría más practicada
      - Racha actual (días consecutivos)

  Scenario: Repetir un ritual del historial
    Given estoy viendo mi historial
    When hago clic en un ritual pasado
    Then veo el detalle del ritual
    And puedo "Repetir" para volver a realizarlo
```

---

### HU-RIT-005: Rituales destacados según fase lunar

```gherkin
Feature: Mostrar rituales relevantes según fase lunar
  Como usuario
  Quiero ver rituales apropiados para la fase lunar actual
  Para aprovechar las energías del momento

  Scenario: Ver rituales destacados en luna nueva
    Given hoy es luna nueva
    When visito la página de rituales
    Then la sección "Destacados" muestra:
      - Ritual de Luna Nueva
      - Ritual de Nuevos Comienzos
      - Meditación de Intenciones
    And veo un banner "Luna Nueva - Ideal para nuevos comienzos"

  Scenario: Ver rituales destacados en luna llena
    Given hoy es luna llena
    When visito la página de rituales
    Then la sección "Destacados" muestra:
      - Ritual de Luna Llena
      - Ritual de Liberación
      - Carga de Cristales
    And veo un banner "Luna Llena - Momento de culminación"

  Scenario: Ver fase lunar actual
    Given estoy en la página de rituales
    Then veo en el header:
      - Icono de la fase lunar actual
      - Nombre de la fase (ej: "Cuarto Creciente")
      - Signo zodiacal de la luna (ej: "Luna en Aries")
```

# Backend: Entidades y Enums

---

### TASK-400: Crear entidades de Rituales

**Módulo:** `src/modules/rituals/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** Ninguna

---

#### 📋 Descripción

Crear las entidades principales para el sistema de rituales: Ritual, RitualStep, RitualMaterial, y UserRitualHistory.

---

#### 🏗️ Contexto Técnico

**Estructura del módulo:**

```
src/modules/rituals/
├── rituals.module.ts
├── entities/
│   ├── ritual.entity.ts
│   ├── ritual-step.entity.ts
│   ├── ritual-material.entity.ts
│   └── user-ritual-history.entity.ts
├── enums/
│   └── ritual.enums.ts
├── data/
│   └── rituals-seed.data.ts
├── application/
│   ├── dto/
│   └── services/
└── infrastructure/
    └── controllers/
```

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `ritual.enums.ts`:

  ```typescript
  export enum RitualCategory {
    TAROT = "tarot",
    LUNAR = "lunar",
    CLEANSING = "cleansing", // Limpieza
    MEDITATION = "meditation",
    PROTECTION = "protection",
    ABUNDANCE = "abundance",
    LOVE = "love",
    HEALING = "healing",
  }

  export enum RitualDifficulty {
    BEGINNER = "beginner", // Principiante
    INTERMEDIATE = "intermediate", // Intermedio
    ADVANCED = "advanced", // Avanzado
  }

  export enum LunarPhase {
    NEW_MOON = "new_moon",
    WAXING_CRESCENT = "waxing_crescent",
    FIRST_QUARTER = "first_quarter",
    WAXING_GIBBOUS = "waxing_gibbous",
    FULL_MOON = "full_moon",
    WANING_GIBBOUS = "waning_gibbous",
    LAST_QUARTER = "last_quarter",
    WANING_CRESCENT = "waning_crescent",
  }

  export enum MaterialType {
    REQUIRED = "required",
    OPTIONAL = "optional",
    ALTERNATIVE = "alternative",
  }
  ```

- [ ] Crear `ritual.entity.ts`:

  ```typescript
  import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
  } from "typeorm";
  import { RitualCategory, RitualDifficulty, LunarPhase } from "../enums/ritual.enums";
  import { RitualStep } from "./ritual-step.entity";
  import { RitualMaterial } from "./ritual-material.entity";

  @Entity("rituals")
  @Index("idx_ritual_category", ["category"])
  @Index("idx_ritual_slug", ["slug"], { unique: true })
  export class Ritual {
    @PrimaryGeneratedColumn()
    id: number;

    // Identificación
    @Column({ type: "varchar", length: 100, unique: true })
    slug: string;

    @Column({ type: "varchar", length: 150 })
    title: string;

    @Column({ type: "text" })
    description: string;

    // Clasificación
    @Column({ type: "enum", enum: RitualCategory })
    category: RitualCategory;

    @Column({ type: "enum", enum: RitualDifficulty })
    difficulty: RitualDifficulty;

    // Timing
    @Column({ type: "smallint" })
    durationMinutes: number; // Duración total estimada

    @Column({ type: "enum", enum: LunarPhase, nullable: true })
    bestLunarPhase: LunarPhase | null; // Mejor fase lunar

    @Column({ type: "jsonb", nullable: true })
    bestLunarPhases: LunarPhase[] | null; // Múltiples fases válidas

    @Column({ type: "varchar", length: 255, nullable: true })
    bestTimeOfDay: string | null; // "Amanecer", "Noche", etc.

    // Contenido
    @Column({ type: "text", nullable: true })
    purpose: string | null; // Propósito/beneficios

    @Column({ type: "text", nullable: true })
    preparation: string | null; // Preparación previa

    @Column({ type: "text", nullable: true })
    closing: string | null; // Cómo cerrar el ritual

    @Column({ type: "jsonb", nullable: true })
    tips: string[] | null; // Consejos adicionales

    // Media
    @Column({ type: "varchar", length: 255 })
    imageUrl: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    thumbnailUrl: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    audioUrl: string | null; // Audio guiado opcional

    // Estado
    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @Column({ type: "boolean", default: false })
    isFeatured: boolean;

    // Tracking
    @Column({ type: "int", default: 0 })
    completionCount: number;

    @Column({ type: "int", default: 0 })
    viewCount: number;

    // Relaciones
    @OneToMany(() => RitualStep, (step) => step.ritual, {
      cascade: true,
      eager: true,
    })
    steps: RitualStep[];

    @OneToMany(() => RitualMaterial, (material) => material.ritual, {
      cascade: true,
      eager: true,
    })
    materials: RitualMaterial[];

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
  }
  ```

- [ ] Crear `ritual-step.entity.ts`:

  ```typescript
  import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
  import { Ritual } from "./ritual.entity";

  @Entity("ritual_steps")
  @Index("idx_step_ritual", ["ritualId"])
  export class RitualStep {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ritualId: number;

    @Column({ type: "smallint" })
    stepNumber: number; // Orden del paso

    @Column({ type: "varchar", length: 150 })
    title: string;

    @Column({ type: "text" })
    description: string;

    @Column({ type: "smallint", nullable: true })
    durationSeconds: number | null; // Duración del paso en segundos

    @Column({ type: "varchar", length: 255, nullable: true })
    imageUrl: string | null;

    @Column({ type: "text", nullable: true })
    mantra: string | null; // Texto para recitar

    @Column({ type: "text", nullable: true })
    visualization: string | null; // Guía de visualización

    @ManyToOne(() => Ritual, (ritual) => ritual.steps, {
      onDelete: "CASCADE",
    })
    @JoinColumn({ name: "ritualId" })
    ritual: Ritual;
  }
  ```

- [ ] Crear `ritual-material.entity.ts`:

  ```typescript
  import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
  import { Ritual } from "./ritual.entity";
  import { MaterialType } from "../enums/ritual.enums";

  @Entity("ritual_materials")
  @Index("idx_material_ritual", ["ritualId"])
  export class RitualMaterial {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ritualId: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string | null; // Detalles adicionales

    @Column({ type: "enum", enum: MaterialType, default: MaterialType.REQUIRED })
    type: MaterialType;

    @Column({ type: "varchar", length: 100, nullable: true })
    alternative: string | null; // Alternativa si no se tiene

    @Column({ type: "smallint", default: 1 })
    quantity: number;

    @Column({ type: "varchar", length: 50, nullable: true })
    unit: string | null; // "unidad", "gramos", etc.

    @ManyToOne(() => Ritual, (ritual) => ritual.materials, {
      onDelete: "CASCADE",
    })
    @JoinColumn({ name: "ritualId" })
    ritual: Ritual;
  }
  ```

- [ ] Crear `user-ritual-history.entity.ts`:

  ```typescript
  import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
  import { User } from "@/modules/users/entities/user.entity";
  import { Ritual } from "./ritual.entity";
  import { LunarPhase } from "../enums/ritual.enums";

  @Entity("user_ritual_history")
  @Index("idx_history_user", ["userId"])
  @Index("idx_history_ritual", ["ritualId"])
  @Index("idx_history_date", ["completedAt"])
  export class UserRitualHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    ritualId: number;

    @Column({ type: "timestamptz" })
    completedAt: Date;

    @Column({ type: "enum", enum: LunarPhase, nullable: true })
    lunarPhase: LunarPhase | null; // Fase lunar al momento

    @Column({ type: "varchar", length: 50, nullable: true })
    lunarSign: string | null; // Signo de la luna

    @Column({ type: "text", nullable: true })
    notes: string | null; // Notas personales

    @Column({ type: "smallint", nullable: true })
    rating: number | null; // 1-5 estrellas

    @Column({ type: "smallint", nullable: true })
    durationMinutes: number | null; // Duración real

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(() => Ritual, { onDelete: "CASCADE" })
    @JoinColumn({ name: "ritualId" })
    ritual: Ritual;

    @CreateDateColumn()
    createdAt: Date;
  }
  ```

##### Testing

- [ ] Test: Entidades se crean correctamente
- [ ] Test: Relaciones OneToMany funcionan
- [ ] Test: Cascade delete funciona
- [ ] Test: Enums validan correctamente

---

#### 🎯 Criterios de Aceptación

- [ ] 4 entidades creadas y relacionadas
- [ ] Enums cubren todas las categorías
- [ ] Índices para consultas frecuentes
- [ ] Historial vincula usuario, ritual y fecha

# Backend: Migraciones y Seeder

---

### TASK-401: Crear migraciones de Rituales

**Módulo:** `src/database/migrations/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-400

---

#### 📋 Descripción

Crear las migraciones para las tablas de rituales.

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear migración principal:

  ```typescript
  // XXXX-CreateRitualsTables.ts
  import { MigrationInterface, QueryRunner } from "typeorm";

  export class CreateRitualsTables implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      // Crear enums
      await queryRunner.query(`
        CREATE TYPE ritual_category_enum AS ENUM (
          'tarot', 'lunar', 'cleansing', 'meditation',
          'protection', 'abundance', 'love', 'healing'
        );
  
        CREATE TYPE ritual_difficulty_enum AS ENUM (
          'beginner', 'intermediate', 'advanced'
        );
  
        CREATE TYPE lunar_phase_enum AS ENUM (
          'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
          'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'
        );
  
        CREATE TYPE material_type_enum AS ENUM (
          'required', 'optional', 'alternative'
        );
      `);

      // Tabla principal de rituales
      await queryRunner.query(`
        CREATE TABLE rituals (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(100) UNIQUE NOT NULL,
          title VARCHAR(150) NOT NULL,
          description TEXT NOT NULL,
          category ritual_category_enum NOT NULL,
          difficulty ritual_difficulty_enum NOT NULL,
          duration_minutes SMALLINT NOT NULL,
          best_lunar_phase lunar_phase_enum,
          best_lunar_phases JSONB,
          best_time_of_day VARCHAR(255),
          purpose TEXT,
          preparation TEXT,
          closing TEXT,
          tips JSONB,
          image_url VARCHAR(255) NOT NULL,
          thumbnail_url VARCHAR(255),
          audio_url VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          completion_count INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
  
        CREATE UNIQUE INDEX idx_ritual_slug ON rituals(slug);
        CREATE INDEX idx_ritual_category ON rituals(category);
        CREATE INDEX idx_ritual_difficulty ON rituals(difficulty);
        CREATE INDEX idx_ritual_lunar_phase ON rituals(best_lunar_phase);
        CREATE INDEX idx_ritual_featured ON rituals(is_featured) WHERE is_featured = true;
      `);

      // Tabla de pasos
      await queryRunner.query(`
        CREATE TABLE ritual_steps (
          id SERIAL PRIMARY KEY,
          ritual_id INTEGER NOT NULL,
          step_number SMALLINT NOT NULL,
          title VARCHAR(150) NOT NULL,
          description TEXT NOT NULL,
          duration_seconds SMALLINT,
          image_url VARCHAR(255),
          mantra TEXT,
          visualization TEXT,
          
          CONSTRAINT fk_step_ritual
            FOREIGN KEY (ritual_id)
            REFERENCES rituals(id)
            ON DELETE CASCADE
        );
  
        CREATE INDEX idx_step_ritual ON ritual_steps(ritual_id);
        CREATE INDEX idx_step_order ON ritual_steps(ritual_id, step_number);
      `);

      // Tabla de materiales
      await queryRunner.query(`
        CREATE TABLE ritual_materials (
          id SERIAL PRIMARY KEY,
          ritual_id INTEGER NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          type material_type_enum DEFAULT 'required',
          alternative VARCHAR(100),
          quantity SMALLINT DEFAULT 1,
          unit VARCHAR(50),
          
          CONSTRAINT fk_material_ritual
            FOREIGN KEY (ritual_id)
            REFERENCES rituals(id)
            ON DELETE CASCADE
        );
  
        CREATE INDEX idx_material_ritual ON ritual_materials(ritual_id);
      `);

      // Tabla de historial
      await queryRunner.query(`
        CREATE TABLE user_ritual_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          ritual_id INTEGER NOT NULL,
          completed_at TIMESTAMPTZ NOT NULL,
          lunar_phase lunar_phase_enum,
          lunar_sign VARCHAR(50),
          notes TEXT,
          rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
          duration_minutes SMALLINT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          
          CONSTRAINT fk_history_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
            
          CONSTRAINT fk_history_ritual
            FOREIGN KEY (ritual_id)
            REFERENCES rituals(id)
            ON DELETE CASCADE
        );
  
        CREATE INDEX idx_history_user ON user_ritual_history(user_id);
        CREATE INDEX idx_history_ritual ON user_ritual_history(ritual_id);
        CREATE INDEX idx_history_date ON user_ritual_history(completed_at);
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("DROP TABLE IF EXISTS user_ritual_history");
      await queryRunner.query("DROP TABLE IF EXISTS ritual_materials");
      await queryRunner.query("DROP TABLE IF EXISTS ritual_steps");
      await queryRunner.query("DROP TABLE IF EXISTS rituals");
      await queryRunner.query("DROP TYPE IF EXISTS material_type_enum");
      await queryRunner.query("DROP TYPE IF EXISTS lunar_phase_enum");
      await queryRunner.query("DROP TYPE IF EXISTS ritual_difficulty_enum");
      await queryRunner.query("DROP TYPE IF EXISTS ritual_category_enum");
    }
  }
  ```

---

### TASK-402: Crear Seeder de Rituales

**Módulo:** `src/modules/rituals/data/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-401

---

#### 📋 Descripción

Crear el archivo de datos con rituales iniciales y el comando para poblar la base de datos.

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `rituals-seed.data.ts`:

  ```typescript
  import { RitualCategory, RitualDifficulty, LunarPhase, MaterialType } from "../enums/ritual.enums";

  export interface RitualSeedData {
    slug: string;
    title: string;
    description: string;
    category: RitualCategory;
    difficulty: RitualDifficulty;
    durationMinutes: number;
    bestLunarPhase?: LunarPhase;
    bestLunarPhases?: LunarPhase[];
    bestTimeOfDay?: string;
    purpose: string;
    preparation?: string;
    closing?: string;
    tips?: string[];
    imageUrl: string;
    materials: MaterialSeedData[];
    steps: StepSeedData[];
  }

  export interface MaterialSeedData {
    name: string;
    description?: string;
    type: MaterialType;
    alternative?: string;
    quantity?: number;
    unit?: string;
  }

  export interface StepSeedData {
    stepNumber: number;
    title: string;
    description: string;
    durationSeconds?: number;
    mantra?: string;
    visualization?: string;
  }

  export const RITUALS_SEED: RitualSeedData[] = [
    // ==================
    // RITUALES LUNARES
    // ==================
    {
      slug: "ritual-luna-nueva",
      title: "Ritual de Luna Nueva",
      description:
        "Ceremonia para establecer intenciones y sembrar semillas de nuevos proyectos aprovechando la energía de la luna nueva.",
      category: RitualCategory.LUNAR,
      difficulty: RitualDifficulty.BEGINNER,
      durationMinutes: 30,
      bestLunarPhase: LunarPhase.NEW_MOON,
      bestTimeOfDay: "Noche",
      purpose:
        "La luna nueva representa el inicio de un nuevo ciclo. Es el momento perfecto para plantar semillas de intención, comenzar proyectos y establecer metas para el mes lunar.",
      preparation:
        "Busca un espacio tranquilo donde no serás interrumpido. Apaga dispositivos electrónicos. Toma un baño o ducha para limpiar tu energía.",
      closing:
        "Agradece a la luna y al universo por escuchar tus intenciones. Guarda tu lista de intenciones en un lugar seguro para revisarla en luna llena.",
      tips: [
        "Escribe tus intenciones en presente, como si ya fueran realidad",
        "Sé específico pero flexible",
        "No establezcas más de 3-5 intenciones principales",
        "Revisa tus intenciones anteriores antes de crear nuevas",
      ],
      imageUrl: "/images/rituals/luna-nueva.jpg",
      materials: [
        { name: "Vela blanca o plateada", type: MaterialType.REQUIRED },
        { name: "Papel y bolígrafo", type: MaterialType.REQUIRED },
        { name: "Incienso de salvia o palo santo", type: MaterialType.OPTIONAL },
        { name: "Cristal de cuarzo claro", type: MaterialType.OPTIONAL, alternative: "Piedra de luna" },
      ],
      steps: [
        {
          stepNumber: 1,
          title: "Preparar el espacio",
          description:
            "Limpia y ordena tu espacio sagrado. Enciende el incienso y permite que el humo purifique el área. Coloca tus materiales frente a ti.",
          durationSeconds: 180,
        },
        {
          stepNumber: 2,
          title: "Encender la vela",
          description:
            'Enciende la vela blanca con intención. Mientras lo haces, di: "Enciendo esta luz para iluminar mi camino en este nuevo ciclo".',
          durationSeconds: 60,
        },
        {
          stepNumber: 3,
          title: "Centrar la energía",
          description:
            "Cierra los ojos y realiza tres respiraciones profundas. Visualiza raíces creciendo desde tus pies hacia la tierra y luz blanca entrando por tu coronilla.",
          durationSeconds: 180,
          visualization: "Imagina una luz plateada de luna envolviendo todo tu ser, limpiando y renovando tu energía.",
        },
        {
          stepNumber: 4,
          title: "Reflexionar",
          description:
            "Piensa en lo que deseas manifestar en este ciclo lunar. ¿Qué proyectos quieres iniciar? ¿Qué hábitos quieres desarrollar? ¿Qué metas quieres alcanzar?",
          durationSeconds: 300,
        },
        {
          stepNumber: 5,
          title: "Escribir intenciones",
          description:
            'Escribe tus intenciones en el papel. Usa frases positivas y en tiempo presente. Por ejemplo: "Atraigo abundancia a mi vida" en lugar de "Quiero tener dinero".',
          durationSeconds: 420,
        },
        {
          stepNumber: 6,
          title: "Activar las intenciones",
          description:
            "Sostén el papel cerca de tu corazón. Lee cada intención en voz alta con convicción. Siente como si ya fueran realidad.",
          durationSeconds: 240,
          mantra:
            "Bajo esta luna nueva, planto las semillas de mis deseos. Confío en que el universo conspira a mi favor.",
        },
        {
          stepNumber: 7,
          title: "Sellar el ritual",
          description:
            "Dobla el papel y colócalo bajo la vela o junto al cristal. Deja que la vela se consuma de forma segura o apágala con gratitud.",
          durationSeconds: 120,
        },
      ],
    },

    {
      slug: "ritual-luna-llena",
      title: "Ritual de Luna Llena",
      description:
        "Ceremonia de liberación y gratitud para soltar lo que ya no te sirve y celebrar tus logros bajo la luna llena.",
      category: RitualCategory.LUNAR,
      difficulty: RitualDifficulty.BEGINNER,
      durationMinutes: 35,
      bestLunarPhase: LunarPhase.FULL_MOON,
      bestTimeOfDay: "Noche, idealmente con la luna visible",
      purpose:
        "La luna llena es el momento de máxima energía del ciclo. Es perfecta para soltar lo que ya no necesitas, celebrar logros y cargar objetos con energía lunar.",
      preparation: "Revisa tus intenciones de luna nueva. Prepara una lista de lo que deseas soltar.",
      closing:
        "Agradece a la luna por su luz y guía. Si es posible, deja tus cristales bajo la luz de la luna para cargarlos.",
      tips: [
        "La energía de luna llena dura 3 días: el día anterior, el día de y el día después",
        "Evita tomar decisiones importantes bajo luna llena, las emociones están intensificadas",
        "Es buen momento para terminar proyectos",
      ],
      imageUrl: "/images/rituals/luna-llena.jpg",
      materials: [
        { name: "Vela blanca", type: MaterialType.REQUIRED },
        { name: "Papel y bolígrafo", type: MaterialType.REQUIRED },
        { name: "Recipiente resistente al fuego", type: MaterialType.REQUIRED },
        { name: "Agua en un bowl (opcional, para cargar)", type: MaterialType.OPTIONAL },
        { name: "Cristales para cargar", type: MaterialType.OPTIONAL },
      ],
      steps: [
        {
          stepNumber: 1,
          title: "Preparar el espacio",
          description: "Ubícate donde puedas ver la luna si es posible. Prepara tu altar con los materiales.",
          durationSeconds: 180,
        },
        {
          stepNumber: 2,
          title: "Conectar con la luna",
          description: "Mira hacia la luna (o imagínala). Siente su luz bañándote. Respira profundamente tres veces.",
          durationSeconds: 120,
          visualization:
            "Imagina la luz plateada de la luna entrando por tu coronilla y llenando todo tu cuerpo de luz.",
        },
        {
          stepNumber: 3,
          title: "Gratitud",
          description:
            "Piensa en todo lo que has logrado desde la última luna nueva. Agradece cada pequeño y gran logro en voz alta.",
          durationSeconds: 300,
        },
        {
          stepNumber: 4,
          title: "Escribir lo que sueltas",
          description:
            "En el papel, escribe todo lo que deseas soltar: miedos, malos hábitos, relaciones tóxicas, creencias limitantes.",
          durationSeconds: 300,
        },
        {
          stepNumber: 5,
          title: "Ritual de liberación",
          description:
            "Lee en voz alta lo que sueltas. Luego, con cuidado y de forma segura, quema el papel en el recipiente.",
          durationSeconds: 240,
          mantra: "Bajo esta luna llena, libero lo que ya no me sirve. Hago espacio para nuevas bendiciones.",
        },
        {
          stepNumber: 6,
          title: "Cargar objetos",
          description:
            "Si tienes cristales o agua, colócalos bajo la luz de la luna. Pide que se carguen con energía lunar.",
          durationSeconds: 120,
        },
        {
          stepNumber: 7,
          title: "Cierre con gratitud",
          description:
            "Agradece a la luna y apaga la vela. Permanece unos minutos en silencio, sintiendo la paz de la liberación.",
          durationSeconds: 180,
        },
      ],
    },

    // ==================
    // RITUALES DE LIMPIEZA
    // ==================
    {
      slug: "limpieza-energetica-hogar",
      title: "Limpieza Energética del Hogar",
      description:
        "Ritual para purificar y renovar la energía de tu espacio vital, eliminando energías estancadas y negativas.",
      category: RitualCategory.CLEANSING,
      difficulty: RitualDifficulty.BEGINNER,
      durationMinutes: 45,
      bestLunarPhases: [LunarPhase.WANING_GIBBOUS, LunarPhase.LAST_QUARTER, LunarPhase.WANING_CRESCENT],
      bestTimeOfDay: "Mañana, con luz natural",
      purpose:
        "Eliminar energías estancadas, negativas o de visitantes. Renovar la vibración del hogar. Ideal después de discusiones, enfermedades o simplemente para mantenimiento energético.",
      preparation:
        "Limpia físicamente tu hogar primero. Abre ventanas para permitir el flujo de energía. Desecha objetos rotos.",
      closing: "Cierra las ventanas después de 10 minutos. Coloca protecciones en las entradas (sal, plantas).",
      tips: [
        "Realiza este ritual al menos una vez al mes",
        "Presta especial atención a esquinas y detrás de puertas",
        "Los espejos acumulan mucha energía, limpia su superficie mientras humeas",
      ],
      imageUrl: "/images/rituals/limpieza-hogar.jpg",
      materials: [
        { name: "Salvia blanca o palo santo", type: MaterialType.REQUIRED, alternative: "Incienso de sándalo" },
        { name: "Recipiente para cenizas", type: MaterialType.REQUIRED },
        { name: "Sal gruesa", type: MaterialType.OPTIONAL },
        { name: "Campana o cuenco tibetano", type: MaterialType.OPTIONAL },
        { name: "Spray de agua florida", type: MaterialType.OPTIONAL },
      ],
      steps: [
        {
          stepNumber: 1,
          title: "Preparación",
          description: "Abre todas las ventanas de la casa. Enciende tu salvia o palo santo de forma segura.",
          durationSeconds: 180,
        },
        {
          stepNumber: 2,
          title: "Establecer intención",
          description:
            'Antes de comenzar, establece tu intención en voz alta: "Limpio este espacio de toda energía que no me pertenece o no me beneficia".',
          durationSeconds: 60,
          mantra: "Limpio y purifico este espacio. Solo la luz y el amor pueden permanecer aquí.",
        },
        {
          stepNumber: 3,
          title: "Comenzar por la entrada",
          description:
            "Empieza por la puerta principal. Mueve el humo en círculos, prestando atención al marco de la puerta.",
          durationSeconds: 120,
        },
        {
          stepNumber: 4,
          title: "Recorrer cada habitación",
          description:
            "Camina por cada habitación en sentido horario. Enfócate en esquinas, detrás de puertas y cerca de ventanas donde la energía se estanca.",
          durationSeconds: 900,
        },
        {
          stepNumber: 5,
          title: "Prestar atención especial",
          description:
            "En el dormitorio, pasa el humo alrededor de la cama. En la cocina, alrededor de la estufa. En el baño, especialmente el espejo.",
          durationSeconds: 300,
        },
        {
          stepNumber: 6,
          title: "Sellar con sonido",
          description:
            "Si tienes campana o cuenco, hazlo sonar en cada habitación. El sonido rompe patrones energéticos estancados.",
          durationSeconds: 180,
        },
        {
          stepNumber: 7,
          title: "Proteger entradas",
          description:
            "Coloca una línea de sal en las entradas principales (puerta y ventanas). Esto crea una barrera protectora.",
          durationSeconds: 180,
        },
        {
          stepNumber: 8,
          title: "Cierre",
          description:
            "Regresa a la entrada principal. Agradece y declara tu espacio limpio y protegido. Cierra las ventanas después de 10 minutos.",
          durationSeconds: 120,
        },
      ],
    },

    // ==================
    // RITUALES DE TAROT
    // ==================
    {
      slug: "consagracion-mazo-tarot",
      title: "Consagración de Mazo de Tarot",
      description: "Ritual para conectar energéticamente con un nuevo mazo de tarot y prepararlo para lecturas.",
      category: RitualCategory.TAROT,
      difficulty: RitualDifficulty.INTERMEDIATE,
      durationMinutes: 40,
      bestLunarPhase: LunarPhase.NEW_MOON,
      bestTimeOfDay: "Noche tranquila",
      purpose:
        "Crear un vínculo energético entre tú y tu nuevo mazo. Limpiar energías de fabricación y transporte. Activar las cartas para lecturas precisas.",
      preparation: "Ten tu mazo nuevo sin abrir o recién abierto. Asegúrate de tener privacidad.",
      closing: "Guarda tu mazo en una bolsa de tela o caja especial. Duerme con él bajo tu almohada la primera noche.",
      tips: [
        "No permitas que otros toquen tu mazo personal",
        "Puedes repetir este ritual si sientes que el mazo necesita reconexión",
        "Algunos tarotistas tienen mazos para uso personal y otros para clientes",
      ],
      imageUrl: "/images/rituals/consagracion-tarot.jpg",
      materials: [
        { name: "Mazo de tarot nuevo", type: MaterialType.REQUIRED },
        { name: "Vela blanca", type: MaterialType.REQUIRED },
        { name: "Incienso (preferiblemente sándalo)", type: MaterialType.REQUIRED },
        { name: "Tela de seda o terciopelo", type: MaterialType.OPTIONAL },
        { name: "Cristal de cuarzo claro", type: MaterialType.OPTIONAL },
      ],
      steps: [
        {
          stepNumber: 1,
          title: "Crear espacio sagrado",
          description:
            "Limpia tu área de trabajo. Enciende la vela y el incienso. Coloca la tela como base para trabajar.",
          durationSeconds: 180,
        },
        {
          stepNumber: 2,
          title: "Desempacar con intención",
          description:
            "Abre tu mazo con reverencia. Si viene envuelto, hazlo conscientemente, como si abrieras un regalo sagrado.",
          durationSeconds: 120,
        },
        {
          stepNumber: 3,
          title: "Primera conexión",
          description:
            "Sostén el mazo completo entre tus manos. Cierra los ojos y respira profundamente. Siente la energía del mazo.",
          durationSeconds: 180,
          visualization:
            "Imagina una luz dorada fluyendo de tus manos hacia el mazo, y del mazo hacia tus manos, creando un circuito.",
        },
        {
          stepNumber: 4,
          title: "Limpiar con humo",
          description:
            "Pasa cada carta a través del humo del incienso, o pasa el incienso alrededor del mazo completo.",
          durationSeconds: 300,
        },
        {
          stepNumber: 5,
          title: "Conocer las cartas",
          description:
            "Revisa carta por carta, mirando la imagen de cada una. No intentes memorizarlas, solo observa y siente.",
          durationSeconds: 600,
        },
        {
          stepNumber: 6,
          title: "Declaración de intención",
          description:
            'Sostén el mazo y declara tu intención para su uso. Por ejemplo: "Este mazo me servirá como puente hacia la sabiduría interior".',
          durationSeconds: 120,
          mantra:
            "Consagro este mazo a la búsqueda de verdad y guía. Que sus mensajes sean claros y para el mayor bien.",
        },
        {
          stepNumber: 7,
          title: "Primera tirada",
          description:
            'Mezcla las cartas con tu energía. Saca una carta preguntando: "¿Qué mensaje tienes para mí?". Reflexiona sobre su significado.',
          durationSeconds: 300,
        },
        {
          stepNumber: 8,
          title: "Cierre y almacenamiento",
          description:
            "Agradece al mazo. Envuélvelo en la tela y guárdalo en un lugar especial. Apaga la vela con gratitud.",
          durationSeconds: 120,
        },
      ],
    },
  ];
  ```

- [ ] Crear comando de seed:

  ```typescript
  // src/database/seeds/rituals.seed.ts
  import { DataSource } from "typeorm";
  import { Ritual } from "@/modules/rituals/entities/ritual.entity";
  import { RitualStep } from "@/modules/rituals/entities/ritual-step.entity";
  import { RitualMaterial } from "@/modules/rituals/entities/ritual-material.entity";
  import { RITUALS_SEED } from "@/modules/rituals/data/rituals-seed.data";

  export async function seedRituals(dataSource: DataSource): Promise<void> {
    const ritualRepo = dataSource.getRepository(Ritual);
    const stepRepo = dataSource.getRepository(RitualStep);
    const materialRepo = dataSource.getRepository(RitualMaterial);

    const count = await ritualRepo.count();
    if (count > 0) {
      console.log(`Ya existen ${count} rituales. Saltando seed.`);
      return;
    }

    console.log("Insertando rituales...");

    for (const ritualData of RITUALS_SEED) {
      const { materials, steps, ...ritualFields } = ritualData;

      // Crear ritual
      const ritual = ritualRepo.create(ritualFields);
      await ritualRepo.save(ritual);

      // Crear materiales
      for (const materialData of materials) {
        const material = materialRepo.create({
          ...materialData,
          ritualId: ritual.id,
        });
        await materialRepo.save(material);
      }

      // Crear pasos
      for (const stepData of steps) {
        const step = stepRepo.create({
          ...stepData,
          ritualId: ritual.id,
        });
        await stepRepo.save(step);
      }
    }

    console.log(`Seed completado: ${RITUALS_SEED.length} rituales insertados.`);
  }
  ```

##### Testing

- [ ] Test: Seed inserta rituales completos
- [ ] Test: Pasos se crean en orden correcto
- [ ] Test: Materiales se asocian correctamente
- [ ] Test: No duplica si ya existen

---

#### 🎯 Criterios de Aceptación

- [ ] Migración crea todas las tablas
- [ ] Seeder crea al menos 4 rituales completos
- [ ] Cada ritual tiene pasos y materiales
- [ ] Contenido en español de calidad

# Backend: Módulo y Servicios

---

### TASK-403: Crear módulo y servicios de Rituales

**Módulo:** `src/modules/rituals/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-400, TASK-401

---

#### 📋 Descripción

Crear el módulo NestJS con servicios para consultar rituales, gestionar historial y obtener rituales destacados según fase lunar.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/rituals/rituals.module.ts`
- `src/modules/rituals/application/services/rituals.service.ts`
- `src/modules/rituals/application/services/ritual-history.service.ts`
- `src/modules/rituals/application/services/lunar-phase.service.ts`
- `src/modules/rituals/application/dto/*.dto.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear DTOs:

  ```typescript
  // ritual-filters.dto.ts
  import { ApiProperty } from "@nestjs/swagger";
  import { IsOptional, IsEnum, IsString } from "class-validator";
  import { RitualCategory, RitualDifficulty, LunarPhase } from "../enums/ritual.enums";

  export class RitualFiltersDto {
    @ApiProperty({ enum: RitualCategory, required: false })
    @IsOptional()
    @IsEnum(RitualCategory)
    category?: RitualCategory;

    @ApiProperty({ enum: RitualDifficulty, required: false })
    @IsOptional()
    @IsEnum(RitualDifficulty)
    difficulty?: RitualDifficulty;

    @ApiProperty({ enum: LunarPhase, required: false })
    @IsOptional()
    @IsEnum(LunarPhase)
    lunarPhase?: LunarPhase;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;
  }
  ```

  ```typescript
  // ritual-response.dto.ts
  import { ApiProperty } from "@nestjs/swagger";
  import { RitualCategory, RitualDifficulty, LunarPhase, MaterialType } from "../enums/ritual.enums";

  export class RitualMaterialDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ nullable: true })
    description: string | null;

    @ApiProperty({ enum: MaterialType })
    type: MaterialType;

    @ApiProperty({ nullable: true })
    alternative: string | null;

    @ApiProperty()
    quantity: number;

    @ApiProperty({ nullable: true })
    unit: string | null;
  }

  export class RitualStepDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    stepNumber: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ nullable: true })
    durationSeconds: number | null;

    @ApiProperty({ nullable: true })
    imageUrl: string | null;

    @ApiProperty({ nullable: true })
    mantra: string | null;

    @ApiProperty({ nullable: true })
    visualization: string | null;
  }

  export class RitualSummaryDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ enum: RitualCategory })
    category: RitualCategory;

    @ApiProperty({ enum: RitualDifficulty })
    difficulty: RitualDifficulty;

    @ApiProperty()
    durationMinutes: number;

    @ApiProperty({ enum: LunarPhase, nullable: true })
    bestLunarPhase: LunarPhase | null;

    @ApiProperty()
    imageUrl: string;

    @ApiProperty()
    materialsCount: number;

    @ApiProperty()
    stepsCount: number;
  }

  export class RitualDetailDto extends RitualSummaryDto {
    @ApiProperty({ nullable: true })
    bestTimeOfDay: string | null;

    @ApiProperty({ nullable: true })
    purpose: string | null;

    @ApiProperty({ nullable: true })
    preparation: string | null;

    @ApiProperty({ nullable: true })
    closing: string | null;

    @ApiProperty({ type: [String], nullable: true })
    tips: string[] | null;

    @ApiProperty({ nullable: true })
    audioUrl: string | null;

    @ApiProperty({ type: [RitualMaterialDto] })
    materials: RitualMaterialDto[];

    @ApiProperty({ type: [RitualStepDto] })
    steps: RitualStepDto[];

    @ApiProperty()
    completionCount: number;
  }
  ```

  ```typescript
  // complete-ritual.dto.ts
  import { ApiProperty } from "@nestjs/swagger";
  import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";

  export class CompleteRitualDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false, minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    durationMinutes?: number;
  }
  ```

- [ ] Crear `lunar-phase.service.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { LunarPhase } from "../enums/ritual.enums";

  export interface LunarInfo {
    phase: LunarPhase;
    phaseName: string;
    illumination: number; // 0-100
    zodiacSign: string;
    isGoodFor: string[];
  }

  @Injectable()
  export class LunarPhaseService {
    /**
     * Calcula la fase lunar actual
     * Algoritmo simplificado basado en ciclo de 29.5 días
     */
    getCurrentPhase(): LunarInfo {
      const now = new Date();
      const phase = this.calculatePhase(now);
      const illumination = this.calculateIllumination(now);
      const zodiacSign = this.calculateLunarSign(now);

      return {
        phase,
        phaseName: this.getPhaseName(phase),
        illumination,
        zodiacSign,
        isGoodFor: this.getPhaseRecommendations(phase),
      };
    }

    /**
     * Calcula la fase lunar para una fecha específica
     */
    calculatePhase(date: Date): LunarPhase {
      // Fecha de luna nueva conocida: 6 de enero 2000
      const knownNewMoon = new Date(2000, 0, 6, 18, 14);
      const synodicMonth = 29.530588853; // Días del ciclo lunar

      const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
      const lunarAge = daysSince % synodicMonth;

      // Dividir el ciclo en 8 fases
      const phaseIndex = Math.floor((lunarAge / synodicMonth) * 8) % 8;

      const phases: LunarPhase[] = [
        LunarPhase.NEW_MOON,
        LunarPhase.WAXING_CRESCENT,
        LunarPhase.FIRST_QUARTER,
        LunarPhase.WAXING_GIBBOUS,
        LunarPhase.FULL_MOON,
        LunarPhase.WANING_GIBBOUS,
        LunarPhase.LAST_QUARTER,
        LunarPhase.WANING_CRESCENT,
      ];

      return phases[phaseIndex];
    }

    /**
     * Calcula porcentaje de iluminación
     */
    private calculateIllumination(date: Date): number {
      const knownNewMoon = new Date(2000, 0, 6, 18, 14);
      const synodicMonth = 29.530588853;
      const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
      const lunarAge = daysSince % synodicMonth;

      // Iluminación varía de 0 (nueva) a 100 (llena) y de vuelta
      const phaseAngle = (lunarAge / synodicMonth) * 2 * Math.PI;
      const illumination = ((1 - Math.cos(phaseAngle)) / 2) * 100;

      return Math.round(illumination);
    }

    /**
     * Calcula el signo zodiacal de la luna (simplificado)
     */
    private calculateLunarSign(date: Date): string {
      // Simplificación: la luna cambia de signo cada ~2.5 días
      const signs = [
        "Aries",
        "Tauro",
        "Géminis",
        "Cáncer",
        "Leo",
        "Virgo",
        "Libra",
        "Escorpio",
        "Sagitario",
        "Capricornio",
        "Acuario",
        "Piscis",
      ];

      const dayOfYear = this.getDayOfYear(date);
      const lunarSignIndex = Math.floor((dayOfYear * 12) / 365 + date.getDate() / 2.5) % 12;

      return signs[lunarSignIndex];
    }

    private getDayOfYear(date: Date): number {
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date.getTime() - start.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    getPhaseName(phase: LunarPhase): string {
      const names: Record<LunarPhase, string> = {
        [LunarPhase.NEW_MOON]: "Luna Nueva",
        [LunarPhase.WAXING_CRESCENT]: "Luna Creciente",
        [LunarPhase.FIRST_QUARTER]: "Cuarto Creciente",
        [LunarPhase.WAXING_GIBBOUS]: "Gibosa Creciente",
        [LunarPhase.FULL_MOON]: "Luna Llena",
        [LunarPhase.WANING_GIBBOUS]: "Gibosa Menguante",
        [LunarPhase.LAST_QUARTER]: "Cuarto Menguante",
        [LunarPhase.WANING_CRESCENT]: "Luna Menguante",
      };
      return names[phase];
    }

    private getPhaseRecommendations(phase: LunarPhase): string[] {
      const recommendations: Record<LunarPhase, string[]> = {
        [LunarPhase.NEW_MOON]: ["Nuevos comienzos", "Establecer intenciones", "Planificación"],
        [LunarPhase.WAXING_CRESCENT]: ["Tomar acción", "Desarrollar ideas", "Compromiso"],
        [LunarPhase.FIRST_QUARTER]: ["Superar obstáculos", "Toma de decisiones", "Acción"],
        [LunarPhase.WAXING_GIBBOUS]: ["Refinamiento", "Ajustes", "Preparación"],
        [LunarPhase.FULL_MOON]: ["Culminación", "Celebración", "Liberación"],
        [LunarPhase.WANING_GIBBOUS]: ["Gratitud", "Compartir", "Enseñar"],
        [LunarPhase.LAST_QUARTER]: ["Soltar", "Perdonar", "Limpiar"],
        [LunarPhase.WANING_CRESCENT]: ["Descanso", "Reflexión", "Sanación"],
      };
      return recommendations[phase];
    }
  }
  ```

- [ ] Crear `rituals.service.ts`:

  ```typescript
  import { Injectable, NotFoundException } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository, In } from "typeorm";
  import { Ritual } from "../entities/ritual.entity";
  import { RitualFiltersDto } from "../application/dto/ritual-filters.dto";
  import { RitualSummaryDto, RitualDetailDto } from "../application/dto/ritual-response.dto";
  import { LunarPhaseService } from "./lunar-phase.service";
  import { LunarPhase } from "../enums/ritual.enums";

  @Injectable()
  export class RitualsService {
    constructor(
      @InjectRepository(Ritual)
      private readonly ritualRepository: Repository<Ritual>,
      private readonly lunarPhaseService: LunarPhaseService,
    ) {}

    /**
     * Obtener todos los rituales con filtros
     */
    async findAll(filters?: RitualFiltersDto): Promise<RitualSummaryDto[]> {
      const query = this.ritualRepository
        .createQueryBuilder("ritual")
        .leftJoinAndSelect("ritual.materials", "materials")
        .leftJoinAndSelect("ritual.steps", "steps")
        .where("ritual.isActive = :isActive", { isActive: true });

      if (filters?.category) {
        query.andWhere("ritual.category = :category", { category: filters.category });
      }

      if (filters?.difficulty) {
        query.andWhere("ritual.difficulty = :difficulty", { difficulty: filters.difficulty });
      }

      if (filters?.lunarPhase) {
        query.andWhere("(ritual.bestLunarPhase = :phase OR ritual.bestLunarPhases @> :phaseArray)", {
          phase: filters.lunarPhase,
          phaseArray: JSON.stringify([filters.lunarPhase]),
        });
      }

      if (filters?.search) {
        query.andWhere("(ritual.title ILIKE :search OR ritual.description ILIKE :search)", {
          search: `%${filters.search}%`,
        });
      }

      query.orderBy("ritual.isFeatured", "DESC").addOrderBy("ritual.completionCount", "DESC");

      const rituals = await query.getMany();

      return rituals.map(this.toSummaryDto);
    }

    /**
     * Obtener rituales destacados según fase lunar actual
     */
    async getFeatured(): Promise<RitualSummaryDto[]> {
      const lunarInfo = this.lunarPhaseService.getCurrentPhase();
      const currentPhase = lunarInfo.phase;

      const rituals = await this.ritualRepository
        .createQueryBuilder("ritual")
        .leftJoinAndSelect("ritual.materials", "materials")
        .leftJoinAndSelect("ritual.steps", "steps")
        .where("ritual.isActive = :isActive", { isActive: true })
        .andWhere(
          "(ritual.isFeatured = true OR ritual.bestLunarPhase = :phase OR ritual.bestLunarPhases @> :phaseArray)",
          { phase: currentPhase, phaseArray: JSON.stringify([currentPhase]) },
        )
        .orderBy("ritual.isFeatured", "DESC")
        .addOrderBy("ritual.completionCount", "DESC")
        .take(6)
        .getMany();

      return rituals.map(this.toSummaryDto);
    }

    /**
     * Obtener ritual por slug
     */
    async findBySlug(slug: string): Promise<RitualDetailDto> {
      const ritual = await this.ritualRepository.findOne({
        where: { slug, isActive: true },
        relations: ["materials", "steps"],
      });

      if (!ritual) {
        throw new NotFoundException(`Ritual "${slug}" no encontrado`);
      }

      // Incrementar vistas (fire-and-forget)
      this.incrementViewCount(ritual.id).catch(() => {});

      return this.toDetailDto(ritual);
    }

    /**
     * Obtener ritual por ID
     */
    async findById(id: number): Promise<Ritual> {
      const ritual = await this.ritualRepository.findOne({
        where: { id },
        relations: ["materials", "steps"],
      });

      if (!ritual) {
        throw new NotFoundException(`Ritual con ID ${id} no encontrado`);
      }

      return ritual;
    }

    /**
     * Obtener categorías disponibles con conteo
     */
    async getCategories(): Promise<{ category: string; count: number }[]> {
      const result = await this.ritualRepository
        .createQueryBuilder("ritual")
        .select("ritual.category", "category")
        .addSelect("COUNT(*)", "count")
        .where("ritual.isActive = :isActive", { isActive: true })
        .groupBy("ritual.category")
        .getRawMany();

      return result;
    }

    /**
     * Incrementar contador de completados
     */
    async incrementCompletionCount(ritualId: number): Promise<void> {
      await this.ritualRepository
        .createQueryBuilder()
        .update()
        .set({ completionCount: () => "completion_count + 1" })
        .where("id = :id", { id: ritualId })
        .execute();
    }

    private async incrementViewCount(ritualId: number): Promise<void> {
      await this.ritualRepository
        .createQueryBuilder()
        .update()
        .set({ viewCount: () => "view_count + 1" })
        .where("id = :id", { id: ritualId })
        .execute();
    }

    private toSummaryDto(ritual: Ritual): RitualSummaryDto {
      return {
        id: ritual.id,
        slug: ritual.slug,
        title: ritual.title,
        description: ritual.description,
        category: ritual.category,
        difficulty: ritual.difficulty,
        durationMinutes: ritual.durationMinutes,
        bestLunarPhase: ritual.bestLunarPhase,
        imageUrl: ritual.thumbnailUrl || ritual.imageUrl,
        materialsCount: ritual.materials?.length || 0,
        stepsCount: ritual.steps?.length || 0,
      };
    }

    private toDetailDto(ritual: Ritual): RitualDetailDto {
      return {
        ...this.toSummaryDto(ritual),
        bestTimeOfDay: ritual.bestTimeOfDay,
        purpose: ritual.purpose,
        preparation: ritual.preparation,
        closing: ritual.closing,
        tips: ritual.tips,
        audioUrl: ritual.audioUrl,
        materials:
          ritual.materials
            ?.sort((a, b) => (a.type === "required" ? -1 : 1))
            .map((m) => ({
              id: m.id,
              name: m.name,
              description: m.description,
              type: m.type,
              alternative: m.alternative,
              quantity: m.quantity,
              unit: m.unit,
            })) || [],
        steps:
          ritual.steps
            ?.sort((a, b) => a.stepNumber - b.stepNumber)
            .map((s) => ({
              id: s.id,
              stepNumber: s.stepNumber,
              title: s.title,
              description: s.description,
              durationSeconds: s.durationSeconds,
              imageUrl: s.imageUrl,
              mantra: s.mantra,
              visualization: s.visualization,
            })) || [],
        completionCount: ritual.completionCount,
      };
    }
  }
  ```

- [ ] Crear `ritual-history.service.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository, Between } from "typeorm";
  import { UserRitualHistory } from "../entities/user-ritual-history.entity";
  import { LunarPhaseService } from "./lunar-phase.service";
  import { RitualsService } from "./rituals.service";
  import { CompleteRitualDto } from "../application/dto/complete-ritual.dto";

  export interface UserStats {
    totalCompleted: number;
    favoriteCategory: string | null;
    currentStreak: number;
    thisMonthCount: number;
  }

  @Injectable()
  export class RitualHistoryService {
    constructor(
      @InjectRepository(UserRitualHistory)
      private readonly historyRepository: Repository<UserRitualHistory>,
      private readonly ritualsService: RitualsService,
      private readonly lunarPhaseService: LunarPhaseService,
    ) {}

    /**
     * Registrar ritual completado
     */
    async completeRitual(userId: number, ritualId: number, dto: CompleteRitualDto): Promise<UserRitualHistory> {
      const lunarInfo = this.lunarPhaseService.getCurrentPhase();

      const history = this.historyRepository.create({
        userId,
        ritualId,
        completedAt: new Date(),
        lunarPhase: lunarInfo.phase,
        lunarSign: lunarInfo.zodiacSign,
        notes: dto.notes,
        rating: dto.rating,
        durationMinutes: dto.durationMinutes,
      });

      await this.historyRepository.save(history);

      // Incrementar contador del ritual
      await this.ritualsService.incrementCompletionCount(ritualId);

      return history;
    }

    /**
     * Obtener historial del usuario
     */
    async getUserHistory(userId: number, limit: number = 20): Promise<UserRitualHistory[]> {
      return this.historyRepository.find({
        where: { userId },
        relations: ["ritual"],
        order: { completedAt: "DESC" },
        take: limit,
      });
    }

    /**
     * Obtener estadísticas del usuario
     */
    async getUserStats(userId: number): Promise<UserStats> {
      const totalCompleted = await this.historyRepository.count({
        where: { userId },
      });

      // Categoría favorita
      const categoryResult = await this.historyRepository
        .createQueryBuilder("history")
        .innerJoin("history.ritual", "ritual")
        .select("ritual.category", "category")
        .addSelect("COUNT(*)", "count")
        .where("history.userId = :userId", { userId })
        .groupBy("ritual.category")
        .orderBy("count", "DESC")
        .limit(1)
        .getRawOne();

      // Racha actual
      const currentStreak = await this.calculateStreak(userId);

      // Este mes
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthCount = await this.historyRepository.count({
        where: {
          userId,
          completedAt: Between(startOfMonth, new Date()),
        },
      });

      return {
        totalCompleted,
        favoriteCategory: categoryResult?.category || null,
        currentStreak,
        thisMonthCount,
      };
    }

    /**
     * Calcular racha de días consecutivos
     */
    private async calculateStreak(userId: number): Promise<number> {
      const history = await this.historyRepository.find({
        where: { userId },
        order: { completedAt: "DESC" },
        take: 30, // Últimos 30 registros
      });

      if (history.length === 0) return 0;

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Agrupar por fecha
      const dateSet = new Set<string>();
      history.forEach((h) => {
        const date = new Date(h.completedAt);
        date.setHours(0, 0, 0, 0);
        dateSet.add(date.toISOString().split("T")[0]);
      });

      // Contar días consecutivos hacia atrás
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];

        if (dateSet.has(dateStr)) {
          streak++;
        } else if (i > 0) {
          // Si no es hoy y no hay registro, termina la racha
          break;
        }
      }

      return streak;
    }

    /**
     * Verificar si el usuario completó un ritual hoy
     */
    async hasCompletedToday(userId: number, ritualId: number): Promise<boolean> {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const count = await this.historyRepository.count({
        where: {
          userId,
          ritualId,
          completedAt: Between(today, tomorrow),
        },
      });

      return count > 0;
    }
  }
  ```

- [ ] Crear `rituals.module.ts`

##### Testing

- [ ] Test: findAll retorna rituales
- [ ] Test: Filtros funcionan
- [ ] Test: getFeatured retorna por fase lunar
- [ ] Test: Fase lunar se calcula correctamente
- [ ] Test: Historial se registra
- [ ] Test: Estadísticas calculan correctamente

---

#### 🎯 Criterios de Aceptación

- [ ] Servicio consulta rituales con filtros
- [ ] Fase lunar se calcula automáticamente
- [ ] Rituales destacados según fase actual
- [ ] Historial registra completados
- [ ] Estadísticas de usuario funcionan

# Backend: Endpoints

---

### TASK-404: Crear endpoints de Rituales

**Módulo:** `src/modules/rituals/infrastructure/controllers/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-403

---

#### 📋 Descripción

Implementar endpoints REST para consultar rituales, gestionar historial y obtener información lunar.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/rituals/infrastructure/controllers/rituals.controller.ts`
- `src/modules/rituals/infrastructure/controllers/rituals.controller.spec.ts`

**Endpoints:**

| Método | Ruta                     | Descripción                 | Auth |
| ------ | ------------------------ | --------------------------- | ---- |
| GET    | `/rituals`               | Listar rituales con filtros | No   |
| GET    | `/rituals/featured`      | Rituales destacados         | No   |
| GET    | `/rituals/categories`    | Categorías con conteo       | No   |
| GET    | `/rituals/lunar-info`    | Info fase lunar actual      | No   |
| GET    | `/rituals/:slug`         | Detalle de ritual           | No   |
| POST   | `/rituals/:id/complete`  | Marcar completado           | Sí   |
| GET    | `/rituals/history`       | Mi historial                | Sí   |
| GET    | `/rituals/history/stats` | Mis estadísticas            | Sí   |

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `rituals.controller.ts`:

  ```typescript
  import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
  } from "@nestjs/common";
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
  import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
  import { CurrentUser } from "@/common/decorators/current-user.decorator";
  import { User } from "@/modules/users/entities/user.entity";
  import { RitualsService } from "../application/services/rituals.service";
  import { RitualHistoryService } from "../application/services/ritual-history.service";
  import { LunarPhaseService, LunarInfo } from "../application/services/lunar-phase.service";
  import { RitualFiltersDto } from "../application/dto/ritual-filters.dto";
  import { RitualSummaryDto, RitualDetailDto } from "../application/dto/ritual-response.dto";
  import { CompleteRitualDto } from "../application/dto/complete-ritual.dto";

  @ApiTags("Rituals")
  @Controller("rituals")
  export class RitualsController {
    constructor(
      private readonly ritualsService: RitualsService,
      private readonly historyService: RitualHistoryService,
      private readonly lunarPhaseService: LunarPhaseService,
    ) {}

    /**
     * GET /rituals
     * Listar todos los rituales con filtros opcionales
     */
    @Get()
    @ApiOperation({ summary: "Listar rituales con filtros" })
    @ApiResponse({ status: 200, type: [RitualSummaryDto] })
    async getRituals(@Query() filters: RitualFiltersDto): Promise<RitualSummaryDto[]> {
      return this.ritualsService.findAll(filters);
    }

    /**
     * GET /rituals/featured
     * Obtener rituales destacados según fase lunar
     */
    @Get("featured")
    @ApiOperation({ summary: "Obtener rituales destacados (según fase lunar)" })
    @ApiResponse({ status: 200, type: [RitualSummaryDto] })
    async getFeatured(): Promise<RitualSummaryDto[]> {
      return this.ritualsService.getFeatured();
    }

    /**
     * GET /rituals/categories
     * Obtener categorías con conteo
     */
    @Get("categories")
    @ApiOperation({ summary: "Obtener categorías de rituales" })
    @ApiResponse({
      status: 200,
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            count: { type: "number" },
          },
        },
      },
    })
    async getCategories(): Promise<{ category: string; count: number }[]> {
      return this.ritualsService.getCategories();
    }

    /**
     * GET /rituals/lunar-info
     * Obtener información de la fase lunar actual
     */
    @Get("lunar-info")
    @ApiOperation({ summary: "Obtener información de fase lunar actual" })
    @ApiResponse({
      status: 200,
      schema: {
        type: "object",
        properties: {
          phase: { type: "string" },
          phaseName: { type: "string" },
          illumination: { type: "number" },
          zodiacSign: { type: "string" },
          isGoodFor: { type: "array", items: { type: "string" } },
        },
      },
    })
    getLunarInfo(): LunarInfo {
      return this.lunarPhaseService.getCurrentPhase();
    }

    /**
     * GET /rituals/history
     * Obtener historial del usuario
     */
    @Get("history")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener mi historial de rituales" })
    @ApiQuery({ name: "limit", required: false, type: Number })
    async getHistory(@CurrentUser() user: User, @Query("limit") limit?: number) {
      const history = await this.historyService.getUserHistory(user.id, limit || 20);

      return history.map((h) => ({
        id: h.id,
        ritual: {
          id: h.ritual.id,
          slug: h.ritual.slug,
          title: h.ritual.title,
          category: h.ritual.category,
        },
        completedAt: h.completedAt,
        lunarPhase: h.lunarPhase,
        lunarSign: h.lunarSign,
        notes: h.notes,
        rating: h.rating,
        durationMinutes: h.durationMinutes,
      }));
    }

    /**
     * GET /rituals/history/stats
     * Obtener estadísticas del usuario
     */
    @Get("history/stats")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener mis estadísticas de rituales" })
    async getStats(@CurrentUser() user: User) {
      return this.historyService.getUserStats(user.id);
    }

    /**
     * GET /rituals/:slug
     * Obtener detalle de un ritual
     */
    @Get(":slug")
    @ApiOperation({ summary: "Obtener detalle de un ritual" })
    @ApiParam({ name: "slug", example: "ritual-luna-nueva" })
    @ApiResponse({ status: 200, type: RitualDetailDto })
    @ApiResponse({ status: 404, description: "Ritual no encontrado" })
    async getRitualBySlug(@Param("slug") slug: string): Promise<RitualDetailDto> {
      return this.ritualsService.findBySlug(slug);
    }

    /**
     * POST /rituals/:id/complete
     * Marcar ritual como completado
     */
    @Post(":id/complete")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Marcar ritual como completado" })
    @ApiParam({ name: "id", example: 1 })
    @ApiResponse({ status: 201, description: "Ritual registrado como completado" })
    async completeRitual(
      @CurrentUser() user: User,
      @Param("id", ParseIntPipe) ritualId: number,
      @Body() dto: CompleteRitualDto,
    ) {
      const history = await this.historyService.completeRitual(user.id, ritualId, dto);

      return {
        message: "Ritual completado exitosamente",
        historyId: history.id,
        lunarPhase: history.lunarPhase,
        lunarSign: history.lunarSign,
      };
    }
  }
  ```

- [ ] Agregar controller al módulo `rituals.module.ts`:

  ```typescript
  import { Module } from "@nestjs/common";
  import { TypeOrmModule } from "@nestjs/typeorm";
  import { Ritual } from "./entities/ritual.entity";
  import { RitualStep } from "./entities/ritual-step.entity";
  import { RitualMaterial } from "./entities/ritual-material.entity";
  import { UserRitualHistory } from "./entities/user-ritual-history.entity";
  import { RitualsService } from "./application/services/rituals.service";
  import { RitualHistoryService } from "./application/services/ritual-history.service";
  import { LunarPhaseService } from "./application/services/lunar-phase.service";
  import { RitualsController } from "./infrastructure/controllers/rituals.controller";

  @Module({
    imports: [TypeOrmModule.forFeature([Ritual, RitualStep, RitualMaterial, UserRitualHistory])],
    providers: [RitualsService, RitualHistoryService, LunarPhaseService],
    controllers: [RitualsController],
    exports: [RitualsService, LunarPhaseService],
  })
  export class RitualsModule {}
  ```

- [ ] Registrar en `app.module.ts`

##### Testing

- [ ] Test e2e: GET /rituals retorna lista
- [ ] Test e2e: GET /rituals?category=lunar filtra
- [ ] Test e2e: GET /rituals/featured retorna destacados
- [ ] Test e2e: GET /rituals/lunar-info retorna fase actual
- [ ] Test e2e: GET /rituals/ritual-luna-nueva retorna detalle
- [ ] Test e2e: GET /rituals/invalid retorna 404
- [ ] Test e2e: POST /rituals/1/complete sin auth retorna 401
- [ ] Test e2e: POST /rituals/1/complete con auth registra
- [ ] Test e2e: GET /rituals/history retorna historial
- [ ] Test e2e: GET /rituals/history/stats retorna estadísticas

---

#### 🎯 Criterios de Aceptación

- [ ] Todos los endpoints funcionan
- [ ] Filtros se aplican correctamente
- [ ] Fase lunar se devuelve correctamente
- [ ] Historial y stats requieren auth
- [ ] Documentación Swagger completa

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El endpoint /lunar-info NO requiere auth y es público
> - Los rituales destacados cambian según la fase lunar actual
> - Al completar un ritual, se registra automáticamente la fase lunar
> - Las estadísticas incluyen racha de días consecutivos
> - El slug del ritual se usa para URLs amigables

# Frontend: Types, API y Hooks

---

### TASK-405: Crear tipos TypeScript para Rituales

**Módulo:** `frontend/src/types/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-404

---

#### 📋 Descripción

Crear los tipos TypeScript, funciones de API y hooks para el módulo de rituales.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/types/ritual.types.ts`
- `frontend/src/lib/api/rituals-api.ts`
- `frontend/src/hooks/api/useRituals.ts`

**Archivos a modificar:**

- `frontend/src/lib/api/endpoints.ts`
- `frontend/src/types/index.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `ritual.types.ts`:

  ```typescript
  // Enums
  export enum RitualCategory {
    TAROT = "tarot",
    LUNAR = "lunar",
    CLEANSING = "cleansing",
    MEDITATION = "meditation",
    PROTECTION = "protection",
    ABUNDANCE = "abundance",
    LOVE = "love",
    HEALING = "healing",
  }

  export enum RitualDifficulty {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
  }

  export enum LunarPhase {
    NEW_MOON = "new_moon",
    WAXING_CRESCENT = "waxing_crescent",
    FIRST_QUARTER = "first_quarter",
    WAXING_GIBBOUS = "waxing_gibbous",
    FULL_MOON = "full_moon",
    WANING_GIBBOUS = "waning_gibbous",
    LAST_QUARTER = "last_quarter",
    WANING_CRESCENT = "waning_crescent",
  }

  export enum MaterialType {
    REQUIRED = "required",
    OPTIONAL = "optional",
    ALTERNATIVE = "alternative",
  }

  // Interfaces
  export interface RitualMaterial {
    id: number;
    name: string;
    description: string | null;
    type: MaterialType;
    alternative: string | null;
    quantity: number;
    unit: string | null;
  }

  export interface RitualStep {
    id: number;
    stepNumber: number;
    title: string;
    description: string;
    durationSeconds: number | null;
    imageUrl: string | null;
    mantra: string | null;
    visualization: string | null;
  }

  export interface RitualSummary {
    id: number;
    slug: string;
    title: string;
    description: string;
    category: RitualCategory;
    difficulty: RitualDifficulty;
    durationMinutes: number;
    bestLunarPhase: LunarPhase | null;
    imageUrl: string;
    materialsCount: number;
    stepsCount: number;
  }

  export interface RitualDetail extends RitualSummary {
    bestTimeOfDay: string | null;
    purpose: string | null;
    preparation: string | null;
    closing: string | null;
    tips: string[] | null;
    audioUrl: string | null;
    materials: RitualMaterial[];
    steps: RitualStep[];
    completionCount: number;
  }

  export interface LunarInfo {
    phase: LunarPhase;
    phaseName: string;
    illumination: number;
    zodiacSign: string;
    isGoodFor: string[];
  }

  export interface RitualHistoryEntry {
    id: number;
    ritual: {
      id: number;
      slug: string;
      title: string;
      category: RitualCategory;
    };
    completedAt: string;
    lunarPhase: LunarPhase | null;
    lunarSign: string | null;
    notes: string | null;
    rating: number | null;
    durationMinutes: number | null;
  }

  export interface UserRitualStats {
    totalCompleted: number;
    favoriteCategory: RitualCategory | null;
    currentStreak: number;
    thisMonthCount: number;
  }

  export interface RitualFilters {
    category?: RitualCategory;
    difficulty?: RitualDifficulty;
    lunarPhase?: LunarPhase;
    search?: string;
  }

  export interface CompleteRitualRequest {
    notes?: string;
    rating?: number;
    durationMinutes?: number;
  }

  // Helpers de UI
  export const CATEGORY_INFO: Record<
    RitualCategory,
    {
      name: string;
      icon: string;
      color: string;
    }
  > = {
    [RitualCategory.TAROT]: { name: "Tarot", icon: "🎴", color: "text-purple-500" },
    [RitualCategory.LUNAR]: { name: "Lunar", icon: "🌙", color: "text-blue-400" },
    [RitualCategory.CLEANSING]: { name: "Limpieza", icon: "✨", color: "text-cyan-500" },
    [RitualCategory.MEDITATION]: { name: "Meditación", icon: "🧘", color: "text-indigo-500" },
    [RitualCategory.PROTECTION]: { name: "Protección", icon: "🛡️", color: "text-amber-500" },
    [RitualCategory.ABUNDANCE]: { name: "Abundancia", icon: "💰", color: "text-green-500" },
    [RitualCategory.LOVE]: { name: "Amor", icon: "💕", color: "text-pink-500" },
    [RitualCategory.HEALING]: { name: "Sanación", icon: "💚", color: "text-emerald-500" },
  };

  export const DIFFICULTY_INFO: Record<
    RitualDifficulty,
    {
      name: string;
      color: string;
    }
  > = {
    [RitualDifficulty.BEGINNER]: { name: "Principiante", color: "text-green-500" },
    [RitualDifficulty.INTERMEDIATE]: { name: "Intermedio", color: "text-yellow-500" },
    [RitualDifficulty.ADVANCED]: { name: "Avanzado", color: "text-red-500" },
  };

  export const LUNAR_PHASE_INFO: Record<
    LunarPhase,
    {
      name: string;
      icon: string;
      emoji: string;
    }
  > = {
    [LunarPhase.NEW_MOON]: { name: "Luna Nueva", icon: "🌑", emoji: "🌑" },
    [LunarPhase.WAXING_CRESCENT]: { name: "Luna Creciente", icon: "🌒", emoji: "🌒" },
    [LunarPhase.FIRST_QUARTER]: { name: "Cuarto Creciente", icon: "🌓", emoji: "🌓" },
    [LunarPhase.WAXING_GIBBOUS]: { name: "Gibosa Creciente", icon: "🌔", emoji: "🌔" },
    [LunarPhase.FULL_MOON]: { name: "Luna Llena", icon: "🌕", emoji: "🌕" },
    [LunarPhase.WANING_GIBBOUS]: { name: "Gibosa Menguante", icon: "🌖", emoji: "🌖" },
    [LunarPhase.LAST_QUARTER]: { name: "Cuarto Menguante", icon: "🌗", emoji: "🌗" },
    [LunarPhase.WANING_CRESCENT]: { name: "Luna Menguante", icon: "🌘", emoji: "🌘" },
  };
  ```

- [ ] Agregar endpoints en `endpoints.ts`:

  ```typescript
  export const API_ENDPOINTS = {
    // ...existentes

    RITUALS: {
      LIST: "/rituals",
      FEATURED: "/rituals/featured",
      CATEGORIES: "/rituals/categories",
      LUNAR_INFO: "/rituals/lunar-info",
      DETAIL: (slug: string) => `/rituals/${slug}`,
      COMPLETE: (id: number) => `/rituals/${id}/complete`,
      HISTORY: "/rituals/history",
      STATS: "/rituals/history/stats",
    },
  } as const;
  ```

- [ ] Crear `rituals-api.ts`:

  ```typescript
  import { apiClient } from "./axios-config";
  import { API_ENDPOINTS } from "./endpoints";
  import type {
    RitualSummary,
    RitualDetail,
    RitualFilters,
    LunarInfo,
    RitualHistoryEntry,
    UserRitualStats,
    CompleteRitualRequest,
  } from "@/types/ritual.types";

  export async function getRituals(filters?: RitualFilters): Promise<RitualSummary[]> {
    const params = new URLSearchParams();

    if (filters?.category) params.append("category", filters.category);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty);
    if (filters?.lunarPhase) params.append("lunarPhase", filters.lunarPhase);
    if (filters?.search) params.append("search", filters.search);

    const url = params.toString() ? `${API_ENDPOINTS.RITUALS.LIST}?${params.toString()}` : API_ENDPOINTS.RITUALS.LIST;

    const response = await apiClient.get<RitualSummary[]>(url);
    return response.data;
  }

  export async function getFeaturedRituals(): Promise<RitualSummary[]> {
    const response = await apiClient.get<RitualSummary[]>(API_ENDPOINTS.RITUALS.FEATURED);
    return response.data;
  }

  export async function getCategories(): Promise<{ category: string; count: number }[]> {
    const response = await apiClient.get<{ category: string; count: number }[]>(API_ENDPOINTS.RITUALS.CATEGORIES);
    return response.data;
  }

  export async function getLunarInfo(): Promise<LunarInfo> {
    const response = await apiClient.get<LunarInfo>(API_ENDPOINTS.RITUALS.LUNAR_INFO);
    return response.data;
  }

  export async function getRitualBySlug(slug: string): Promise<RitualDetail> {
    const response = await apiClient.get<RitualDetail>(API_ENDPOINTS.RITUALS.DETAIL(slug));
    return response.data;
  }

  export async function completeRitual(
    ritualId: number,
    data: CompleteRitualRequest,
  ): Promise<{ message: string; historyId: number }> {
    const response = await apiClient.post(API_ENDPOINTS.RITUALS.COMPLETE(ritualId), data);
    return response.data;
  }

  export async function getRitualHistory(limit?: number): Promise<RitualHistoryEntry[]> {
    const url = limit ? `${API_ENDPOINTS.RITUALS.HISTORY}?limit=${limit}` : API_ENDPOINTS.RITUALS.HISTORY;

    const response = await apiClient.get<RitualHistoryEntry[]>(url);
    return response.data;
  }

  export async function getRitualStats(): Promise<UserRitualStats> {
    const response = await apiClient.get<UserRitualStats>(API_ENDPOINTS.RITUALS.STATS);
    return response.data;
  }
  ```

- [ ] Crear `useRituals.ts`:

  ```typescript
  "use client";

  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import {
    getRituals,
    getFeaturedRituals,
    getCategories,
    getLunarInfo,
    getRitualBySlug,
    completeRitual,
    getRitualHistory,
    getRitualStats,
  } from "@/lib/api/rituals-api";
  import type { RitualFilters, CompleteRitualRequest } from "@/types/ritual.types";

  export const ritualKeys = {
    all: ["rituals"] as const,
    list: (filters?: RitualFilters) => [...ritualKeys.all, "list", filters] as const,
    featured: () => [...ritualKeys.all, "featured"] as const,
    categories: () => [...ritualKeys.all, "categories"] as const,
    lunarInfo: () => [...ritualKeys.all, "lunar-info"] as const,
    detail: (slug: string) => [...ritualKeys.all, "detail", slug] as const,
    history: (limit?: number) => [...ritualKeys.all, "history", limit] as const,
    stats: () => [...ritualKeys.all, "stats"] as const,
  };

  export function useRituals(filters?: RitualFilters) {
    return useQuery({
      queryKey: ritualKeys.list(filters),
      queryFn: () => getRituals(filters),
      staleTime: 1000 * 60 * 30, // 30 minutos
    });
  }

  export function useFeaturedRituals() {
    return useQuery({
      queryKey: ritualKeys.featured(),
      queryFn: getFeaturedRituals,
      staleTime: 1000 * 60 * 60, // 1 hora (cambia con fase lunar)
    });
  }

  export function useRitualCategories() {
    return useQuery({
      queryKey: ritualKeys.categories(),
      queryFn: getCategories,
      staleTime: 1000 * 60 * 60 * 24, // 24 horas (raramente cambia)
    });
  }

  export function useLunarInfo() {
    return useQuery({
      queryKey: ritualKeys.lunarInfo(),
      queryFn: getLunarInfo,
      staleTime: 1000 * 60 * 60, // 1 hora
      refetchInterval: 1000 * 60 * 60, // Refetch cada hora
    });
  }

  export function useRitual(slug: string) {
    return useQuery({
      queryKey: ritualKeys.detail(slug),
      queryFn: () => getRitualBySlug(slug),
      enabled: !!slug,
      staleTime: 1000 * 60 * 30,
    });
  }

  export function useCompleteRitual() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ ritualId, data }: { ritualId: number; data: CompleteRitualRequest }) =>
        completeRitual(ritualId, data),
      onSuccess: () => {
        // Invalidar historial y stats
        queryClient.invalidateQueries({ queryKey: ritualKeys.history() });
        queryClient.invalidateQueries({ queryKey: ritualKeys.stats() });
      },
    });
  }

  export function useRitualHistory(limit?: number) {
    return useQuery({
      queryKey: ritualKeys.history(limit),
      queryFn: () => getRitualHistory(limit),
    });
  }

  export function useRitualStats() {
    return useQuery({
      queryKey: ritualKeys.stats(),
      queryFn: getRitualStats,
    });
  }
  ```

- [ ] Exportar desde `types/index.ts`

##### Testing

- [ ] Test: Tipos se exportan correctamente
- [ ] Test: API functions hacen llamadas correctas
- [ ] Test: Hooks retornan datos esperados
- [ ] Test: useLunarInfo refetch cada hora
- [ ] Test: useCompleteRitual invalida queries

---

#### 🎯 Criterios de Aceptación

- [ ] Tipos completos para todas las entidades
- [ ] API functions cubren todos los endpoints
- [ ] Hooks con staleTime apropiado
- [ ] Info de categorías y fases para UI
- [ ] Helpers de UI con iconos y colores

# Frontend: Componentes de Lista y Navegación

---

### TASK-406: Crear componentes de listado de rituales

**Módulo:** `frontend/src/components/features/rituals/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-405

---

#### 📋 Descripción

Crear componentes para mostrar listas de rituales, tarjetas, filtros y banner de fase lunar.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/rituals/
├── index.ts
├── RitualCard.tsx
├── RitualGrid.tsx
├── RitualCategorySelector.tsx
├── RitualDifficultyFilter.tsx
├── LunarPhaseBanner.tsx
├── RitualSearchBar.tsx
├── RitualsSkeleton.tsx
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `RitualCard.tsx`:

  ```tsx
  "use client";

  import Image from "next/image";
  import Link from "next/link";
  import { Clock, Layers, Package } from "lucide-react";
  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { cn } from "@/lib/utils";
  import { CATEGORY_INFO, DIFFICULTY_INFO, LUNAR_PHASE_INFO } from "@/types/ritual.types";
  import type { RitualSummary } from "@/types/ritual.types";

  interface RitualCardProps {
    ritual: RitualSummary;
    className?: string;
  }

  export function RitualCard({ ritual, className }: RitualCardProps) {
    const categoryInfo = CATEGORY_INFO[ritual.category];
    const difficultyInfo = DIFFICULTY_INFO[ritual.difficulty];
    const lunarInfo = ritual.bestLunarPhase ? LUNAR_PHASE_INFO[ritual.bestLunarPhase] : null;

    return (
      <Link href={`/rituales/${ritual.slug}`}>
        <Card className={cn("group overflow-hidden transition-all hover:shadow-lg", className)}>
          {/* Imagen */}
          <div className="relative aspect-video bg-muted">
            <Image
              src={ritual.imageUrl}
              alt={ritual.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Badge de categoría */}
            <Badge className={cn("absolute top-2 left-2 bg-background/90", categoryInfo.color)}>
              {categoryInfo.icon} {categoryInfo.name}
            </Badge>
            {/* Badge de fase lunar */}
            {lunarInfo && (
              <Badge variant="secondary" className="absolute top-2 right-2 bg-background/90">
                {lunarInfo.emoji}
              </Badge>
            )}
          </div>

          {/* Contenido */}
          <div className="p-4">
            <h3 className="font-serif text-lg mb-2 line-clamp-1 group-hover:text-primary">{ritual.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ritual.description}</p>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {ritual.durationMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {ritual.stepsCount} pasos
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {ritual.materialsCount}
              </span>
            </div>

            {/* Dificultad */}
            <div className="mt-2">
              <span className={cn("text-xs font-medium", difficultyInfo.color)}>{difficultyInfo.name}</span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }
  ```

- [ ] Crear `RitualGrid.tsx`:

  ```tsx
  "use client";

  import { RitualCard } from "./RitualCard";
  import { RitualsSkeleton } from "./RitualsSkeleton";
  import { cn } from "@/lib/utils";
  import type { RitualSummary } from "@/types/ritual.types";

  interface RitualGridProps {
    rituals: RitualSummary[];
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
  }

  export function RitualGrid({
    rituals,
    isLoading = false,
    emptyMessage = "No se encontraron rituales",
    className,
  }: RitualGridProps) {
    if (isLoading) {
      return <RitualsSkeleton variant="grid" />;
    }

    if (rituals.length === 0) {
      return <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>;
    }

    return (
      <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {rituals.map((ritual) => (
          <RitualCard key={ritual.id} ritual={ritual} />
        ))}
      </div>
    );
  }
  ```

- [ ] Crear `RitualCategorySelector.tsx`:

  ```tsx
  "use client";

  import { Button } from "@/components/ui/button";
  import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
  import { cn } from "@/lib/utils";
  import { RitualCategory, CATEGORY_INFO } from "@/types/ritual.types";

  interface RitualCategorySelectorProps {
    selected?: RitualCategory;
    onSelect: (category: RitualCategory | undefined) => void;
    categories?: { category: string; count: number }[];
    className?: string;
  }

  export function RitualCategorySelector({ selected, onSelect, categories, className }: RitualCategorySelectorProps) {
    const allCategories = Object.values(RitualCategory);

    const getCount = (cat: RitualCategory) => {
      const found = categories?.find((c) => c.category === cat);
      return found?.count || 0;
    };

    return (
      <ScrollArea className={cn("w-full whitespace-nowrap", className)}>
        <div className="flex gap-2 pb-2">
          <Button
            variant={selected === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(undefined)}
          >
            Todos
          </Button>
          {allCategories.map((category) => {
            const info = CATEGORY_INFO[category];
            const count = getCount(category);

            return (
              <Button
                key={category}
                variant={selected === category ? "default" : "outline"}
                size="sm"
                onClick={() => onSelect(category)}
                className="gap-1"
              >
                <span>{info.icon}</span>
                <span>{info.name}</span>
                {count > 0 && <span className="text-xs opacity-60">({count})</span>}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }
  ```

- [ ] Crear `RitualDifficultyFilter.tsx`:

  ```tsx
  "use client";

  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { RitualDifficulty, DIFFICULTY_INFO } from "@/types/ritual.types";

  interface RitualDifficultyFilterProps {
    value?: RitualDifficulty;
    onChange: (value: RitualDifficulty | undefined) => void;
  }

  export function RitualDifficultyFilter({ value, onChange }: RitualDifficultyFilterProps) {
    return (
      <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? undefined : (v as RitualDifficulty))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Dificultad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las dificultades</SelectItem>
          {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
            <SelectItem key={key} value={key}>
              {info.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  ```

- [ ] Crear `LunarPhaseBanner.tsx`:

  ```tsx
  "use client";

  import { Moon } from "lucide-react";
  import { Card } from "@/components/ui/card";
  import { useLunarInfo } from "@/hooks/api/useRituals";
  import { LUNAR_PHASE_INFO } from "@/types/ritual.types";
  import { Skeleton } from "@/components/ui/skeleton";
  import { cn } from "@/lib/utils";

  interface LunarPhaseBannerProps {
    className?: string;
  }

  export function LunarPhaseBanner({ className }: LunarPhaseBannerProps) {
    const { data: lunarInfo, isLoading } = useLunarInfo();

    if (isLoading) {
      return (
        <Card className={cn("p-4", className)}>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </Card>
      );
    }

    if (!lunarInfo) return null;

    const phaseInfo = LUNAR_PHASE_INFO[lunarInfo.phase];

    return (
      <Card className={cn("p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20", className)}>
        <div className="flex items-center gap-4">
          <div className="text-5xl">{phaseInfo.emoji}</div>
          <div>
            <h3 className="font-serif text-lg flex items-center gap-2">
              <Moon className="h-4 w-4" />
              {lunarInfo.phaseName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Luna en {lunarInfo.zodiacSign} • {lunarInfo.illumination}% iluminada
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lunarInfo.isGoodFor.map((item, i) => (
                <span key={i} className="text-xs bg-background/50 px-2 py-1 rounded">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }
  ```

- [ ] Crear `RitualsSkeleton.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";

  interface RitualsSkeletonProps {
    variant?: "grid" | "detail";
    count?: number;
  }

  export function RitualsSkeleton({ variant = "grid", count = 6 }: RitualsSkeletonProps) {
    if (variant === "detail") {
      return (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-48" />
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  ```

- [ ] Crear `index.ts`:
  ```typescript
  export { RitualCard } from "./RitualCard";
  export { RitualGrid } from "./RitualGrid";
  export { RitualCategorySelector } from "./RitualCategorySelector";
  export { RitualDifficultyFilter } from "./RitualDifficultyFilter";
  export { LunarPhaseBanner } from "./LunarPhaseBanner";
  export { RitualsSkeleton } from "./RitualsSkeleton";
  // ... más exports en siguientes tareas
  ```

##### Testing

- [ ] Test: RitualCard renderiza información
- [ ] Test: RitualGrid muestra lista
- [ ] Test: CategorySelector filtra
- [ ] Test: LunarPhaseBanner muestra fase actual
- [ ] Test: Skeletons se muestran durante carga

---

#### 🎯 Criterios de Aceptación

- [ ] Cards muestran toda la info relevante
- [ ] Grid es responsive
- [ ] Categorías son scrolleables en móvil
- [ ] Banner lunar muestra fase actual
- [ ] Loading states con skeletons

# Frontend: Componentes de Detalle

---

### TASK-407: Crear componentes de detalle del ritual

**Módulo:** `frontend/src/components/features/rituals/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-406

---

#### 📋 Descripción

Crear componentes para la vista de detalle del ritual: header, materiales, pasos, consejos y modal de completado.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/rituals/
├── RitualHeader.tsx
├── RitualMaterials.tsx
├── RitualStepsList.tsx
├── RitualTips.tsx
├── RitualCompletedModal.tsx
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `RitualHeader.tsx`:

  ```tsx
  "use client";

  import Image from "next/image";
  import { Clock, Layers, Star } from "lucide-react";
  import { Badge } from "@/components/ui/badge";
  import { CATEGORY_INFO, DIFFICULTY_INFO, LUNAR_PHASE_INFO } from "@/types/ritual.types";
  import type { RitualDetail } from "@/types/ritual.types";

  interface RitualHeaderProps {
    ritual: RitualDetail;
  }

  export function RitualHeader({ ritual }: RitualHeaderProps) {
    const categoryInfo = CATEGORY_INFO[ritual.category];
    const difficultyInfo = DIFFICULTY_INFO[ritual.difficulty];
    const lunarInfo = ritual.bestLunarPhase ? LUNAR_PHASE_INFO[ritual.bestLunarPhase] : null;

    return (
      <div className="relative">
        {/* Imagen de fondo */}
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <Image src={ritual.imageUrl} alt={ritual.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={categoryInfo.color}>
              {categoryInfo.icon} {categoryInfo.name}
            </Badge>
            <Badge variant="outline" className={difficultyInfo.color}>
              {difficultyInfo.name}
            </Badge>
            {lunarInfo && (
              <Badge variant="secondary">
                {lunarInfo.emoji} Mejor en {lunarInfo.name}
              </Badge>
            )}
          </div>

          <h1 className="font-serif text-3xl md:text-4xl mb-2">{ritual.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {ritual.durationMinutes} minutos
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              {ritual.steps.length} pasos
            </span>
            {ritual.completionCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {ritual.completionCount} veces realizado
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] Crear `RitualMaterials.tsx`:

  ```tsx
  "use client";

  import { Check, Circle, ArrowRight } from "lucide-react";
  import { Card } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
  import { MaterialType } from "@/types/ritual.types";
  import type { RitualMaterial } from "@/types/ritual.types";

  interface RitualMaterialsProps {
    materials: RitualMaterial[];
  }

  export function RitualMaterials({ materials }: RitualMaterialsProps) {
    const required = materials.filter((m) => m.type === MaterialType.REQUIRED);
    const optional = materials.filter((m) => m.type !== MaterialType.REQUIRED);

    return (
      <Card className="p-6">
        <h2 className="font-serif text-xl mb-4">Materiales Necesarios</h2>

        {required.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Requeridos</h3>
            <ul className="space-y-2">
              {required.map((material) => (
                <li key={material.id} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{material.name}</span>
                    {material.quantity > 1 && (
                      <span className="text-muted-foreground">
                        {" "}
                        × {material.quantity}
                        {material.unit && ` ${material.unit}`}
                      </span>
                    )}
                    {material.description && <p className="text-sm text-muted-foreground">{material.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {optional.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Opcionales</h3>
            <ul className="space-y-2">
              {optional.map((material) => (
                <li key={material.id} className="flex items-start gap-2">
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <span>{material.name}</span>
                    {material.alternative && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        Alternativa: {material.alternative}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
  }
  ```

- [ ] Crear `RitualStepsList.tsx`:

  ```tsx
  "use client";

  import { Clock, Quote, Eye } from "lucide-react";
  import { Card } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
  import type { RitualStep } from "@/types/ritual.types";

  interface RitualStepsListProps {
    steps: RitualStep[];
    className?: string;
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  export function RitualStepsList({ steps, className }: RitualStepsListProps) {
    return (
      <Card className={cn("p-6", className)}>
        <h2 className="font-serif text-xl mb-4">Pasos del Ritual</h2>

        <ol className="space-y-6">
          {steps.map((step, index) => (
            <li key={step.id} className="relative pl-8">
              {/* Número del paso */}
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {step.stepNumber}
              </div>

              {/* Línea conectora */}
              {index < steps.length - 1 && <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border" />}

              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{step.title}</h3>
                  {step.durationSeconds && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />~{formatDuration(step.durationSeconds)}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-2">{step.description}</p>

                {step.mantra && (
                  <div className="bg-muted/50 rounded p-3 text-sm italic flex items-start gap-2">
                    <Quote className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>"{step.mantra}"</span>
                  </div>
                )}

                {step.visualization && (
                  <div className="bg-purple-500/10 rounded p-3 text-sm flex items-start gap-2 mt-2">
                    <Eye className="h-4 w-4 flex-shrink-0 mt-0.5 text-purple-500" />
                    <span>{step.visualization}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Card>
    );
  }
  ```

- [ ] Crear `RitualTips.tsx`:

  ```tsx
  "use client";

  import { Lightbulb } from "lucide-react";
  import { Card } from "@/components/ui/card";

  interface RitualTipsProps {
    tips: string[];
  }

  export function RitualTips({ tips }: RitualTipsProps) {
    return (
      <Card className="p-6">
        <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Consejos
        </h2>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              • {tip}
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  ```

- [ ] Crear `RitualCompletedModal.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { Sparkles, Star } from "lucide-react";
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";
  import { Label } from "@/components/ui/label";
  import { cn } from "@/lib/utils";
  import type { RitualDetail } from "@/types/ritual.types";

  interface RitualCompletedModalProps {
    ritual: RitualDetail;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (notes?: string, rating?: number) => void;
  }

  export function RitualCompletedModal({ ritual, isOpen, onClose, onComplete }: RitualCompletedModalProps) {
    const [notes, setNotes] = useState("");
    const [rating, setRating] = useState<number | null>(null);

    const handleComplete = () => {
      onComplete(notes || undefined, rating || undefined);
      setNotes("");
      setRating(null);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
              <DialogTitle className="font-serif text-2xl">Marcar como Completado</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">¿Completaste "{ritual.title}"? Registra tu experiencia.</p>

            {/* Rating */}
            <div className="text-center">
              <Label className="text-sm text-muted-foreground mb-2 block">Califica tu experiencia</Label>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} onClick={() => setRating(value)} className="p-1 transition-colors">
                    <Star
                      className={cn(
                        "h-8 w-8",
                        rating && value <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notas personales (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Cómo te sentiste? ¿Qué insights tuviste?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleComplete}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  ```

##### Testing

- [ ] Test: RitualHeader muestra información correcta
- [ ] Test: RitualMaterials separa requeridos y opcionales
- [ ] Test: RitualStepsList muestra pasos ordenados
- [ ] Test: RitualTips renderiza lista
- [ ] Test: Modal de completado captura notas y rating

---

#### 🎯 Criterios de Aceptación

- [ ] Detalle muestra toda la info del ritual
- [ ] Materiales categorizados correctamente
- [ ] Pasos con línea de tiempo visual
- [ ] Mantras y visualizaciones destacados
- [ ] Modal permite notas y rating opcionales

# Frontend: Páginas

---

### TASK-408: Crear páginas de Rituales

**Módulo:** `frontend/src/app/rituales/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-406, TASK-407

---

#### 📋 Descripción

Crear las páginas principales: catálogo, detalle de ritual e historial.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/app/rituales/page.tsx`
- `frontend/src/app/rituales/[slug]/page.tsx`
- `frontend/src/app/rituales/historial/page.tsx`

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
    RITUALES: "/rituales",
    RITUAL_DETAIL: (slug: string) => `/rituales/${slug}`,
    RITUALES_HISTORIAL: "/rituales/historial",
  } as const;
  ```

- [ ] Crear `app/rituales/page.tsx`:

  ```tsx
  "use client";

  import { useState, useCallback } from "react";
  import {
    RitualGrid,
    RitualCategorySelector,
    RitualDifficultyFilter,
    LunarPhaseBanner,
    RitualsSkeleton,
  } from "@/components/features/rituals";
  import { SearchBar } from "@/components/features/encyclopedia";
  import { useRituals, useFeaturedRituals, useRitualCategories } from "@/hooks/api/useRituals";
  import { useAuthStore } from "@/stores/authStore";
  import { Button } from "@/components/ui/button";
  import { History } from "lucide-react";
  import Link from "next/link";
  import { ROUTES } from "@/lib/constants/routes";
  import type { RitualCategory, RitualDifficulty, RitualFilters } from "@/types/ritual.types";

  export default function RitualesPage() {
    const { isAuthenticated } = useAuthStore();
    const [filters, setFilters] = useState<RitualFilters>({});

    const { data: categories } = useRitualCategories();
    const { data: featured, isLoading: loadingFeatured } = useFeaturedRituals();
    const { data: rituals, isLoading: loadingRituals } = useRituals(filters);

    const hasFilters = filters.category || filters.difficulty || filters.search;

    const handleCategoryChange = (category: RitualCategory | undefined) => {
      setFilters((prev) => ({ ...prev, category }));
    };

    const handleDifficultyChange = (difficulty: RitualDifficulty | undefined) => {
      setFilters((prev) => ({ ...prev, difficulty }));
    };

    const handleSearch = useCallback((search: string) => {
      setFilters((prev) => ({ ...prev, search: search || undefined }));
    }, []);

    return (
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl mb-2">Rituales</h1>
            <p className="text-muted-foreground">Guías paso a paso para tu práctica espiritual</p>
          </div>
          {isAuthenticated && (
            <Button variant="outline" asChild>
              <Link href={ROUTES.RITUALES_HISTORIAL}>
                <History className="mr-2 h-4 w-4" />
                Mi Historial
              </Link>
            </Button>
          )}
        </div>

        {/* Fase lunar */}
        <LunarPhaseBanner className="mb-8" />

        {/* Rituales destacados */}
        {!hasFilters && (
          <section className="mb-12">
            <h2 className="font-serif text-2xl mb-4">Destacados para esta fase lunar</h2>
            {loadingFeatured ? (
              <RitualsSkeleton count={3} />
            ) : featured && featured.length > 0 ? (
              <RitualGrid rituals={featured.slice(0, 3)} />
            ) : null}
          </section>
        )}

        {/* Filtros */}
        <div className="space-y-4 mb-8">
          <RitualCategorySelector selected={filters.category} onSelect={handleCategoryChange} categories={categories} />

          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar onSearch={handleSearch} placeholder="Buscar ritual..." className="flex-1 max-w-md" />
            <RitualDifficultyFilter value={filters.difficulty} onChange={handleDifficultyChange} />
          </div>
        </div>

        {/* Lista de rituales */}
        <section>
          <h2 className="font-serif text-2xl mb-4">{hasFilters ? "Resultados" : "Todos los Rituales"}</h2>
          {loadingRituals ? (
            <RitualsSkeleton />
          ) : (
            <RitualGrid rituals={rituals || []} emptyMessage="No se encontraron rituales con estos filtros" />
          )}
        </section>
      </div>
    );
  }
  ```

- [ ] Crear `app/rituales/[slug]/page.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { useParams } from "next/navigation";
  import { ArrowLeft, CheckCircle } from "lucide-react";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  import {
    RitualHeader,
    RitualMaterials,
    RitualStepsList,
    RitualTips,
    RitualCompletedModal,
    RitualsSkeleton,
  } from "@/components/features/rituals";
  import { useRitual, useCompleteRitual } from "@/hooks/api/useRituals";
  import { useAuthStore } from "@/stores/authStore";
  import { useToast } from "@/hooks/useToast";
  import { ROUTES } from "@/lib/constants/routes";

  export default function RitualDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { toast } = useToast();

    const { isAuthenticated } = useAuthStore();
    const { data: ritual, isLoading, error } = useRitual(slug);
    const { mutate: completeRitual, isPending } = useCompleteRitual();

    const [showCompletedModal, setShowCompletedModal] = useState(false);

    const handleComplete = (notes?: string, rating?: number) => {
      if (!ritual) return;

      if (!isAuthenticated) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para guardar tu progreso",
        });
        setShowCompletedModal(false);
        return;
      }

      completeRitual(
        {
          ritualId: ritual.id,
          data: { notes, rating },
        },
        {
          onSuccess: () => {
            toast({
              title: "¡Ritual completado!",
              description: "Se ha guardado en tu historial",
            });
            setShowCompletedModal(false);
          },
          onError: () => {
            toast({
              title: "Error",
              description: "No se pudo guardar el ritual",
              variant: "destructive",
            });
          },
        },
      );
    };

    if (isLoading) {
      return (
        <div className="container mx-auto py-8 px-4">
          <RitualsSkeleton variant="detail" />
        </div>
      );
    }

    if (error || !ritual) {
      return (
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl mb-4">Ritual no encontrado</h1>
          <Button asChild>
            <Link href={ROUTES.RITUALES}>Ver todos los rituales</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4">
        {/* Navegación */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href={ROUTES.RITUALES}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Rituales
          </Link>
        </Button>

        {/* Header con imagen */}
        <RitualHeader ritual={ritual} />

        {/* Botón de marcar completado */}
        {isAuthenticated && (
          <div className="my-8 text-center">
            <Button size="lg" onClick={() => setShowCompletedModal(true)} disabled={isPending} className="gap-2">
              <CheckCircle className="h-5 w-5" />
              Marcar como Completado
            </Button>
          </div>
        )}

        {/* Contenido */}
        <div className="grid gap-6 lg:grid-cols-3 mt-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Propósito */}
            {ritual.purpose && (
              <div>
                <h2 className="font-serif text-xl mb-2">Propósito</h2>
                <p className="text-muted-foreground">{ritual.purpose}</p>
              </div>
            )}

            {/* Preparación */}
            {ritual.preparation && (
              <div>
                <h2 className="font-serif text-xl mb-2">Preparación</h2>
                <p className="text-muted-foreground">{ritual.preparation}</p>
              </div>
            )}

            {/* Pasos */}
            <RitualStepsList steps={ritual.steps} />

            {/* Cierre */}
            {ritual.closing && (
              <div>
                <h2 className="font-serif text-xl mb-2">Cierre del Ritual</h2>
                <p className="text-muted-foreground">{ritual.closing}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RitualMaterials materials={ritual.materials} />

            {ritual.tips && ritual.tips.length > 0 && <RitualTips tips={ritual.tips} />}
          </div>
        </div>

        {/* Modal de completado */}
        <RitualCompletedModal
          ritual={ritual}
          isOpen={showCompletedModal}
          onClose={() => setShowCompletedModal(false)}
          onComplete={handleComplete}
        />
      </div>
    );
  }
  ```

          <h1 className="text-2xl mb-4">Ritual no encontrado</h1>
          <Button asChild>
            <Link href={ROUTES.RITUALES}>Ver todos los rituales</Link>
          </Button>
        </div>
      );

  }

  return (
  <div className="container mx-auto py-8 px-4">
  {/_ Navegación _/}
  <Button variant="ghost" asChild className="mb-4">
  <Link href={ROUTES.RITUALES}>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Rituales
  </Link>
  </Button>

        {/* Header con imagen */}
        <RitualHeader ritual={ritual} />

        {/* Botón de comenzar */}
        <div className="my-8 text-center">
          <Button
            size="lg"
            onClick={() => setIsRitualModeOpen(true)}
            className="gap-2"
          >
            <Play className="h-5 w-5" />
            Comenzar Ritual
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Modo guiado con temporizador
          </p>
        </div>

        {/* Contenido */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Propósito */}
            {ritual.purpose && (
              <div>
                <h2 className="font-serif text-xl mb-2">Propósito</h2>
                <p className="text-muted-foreground">{ritual.purpose}</p>
              </div>
            )}

            {/* Preparación */}
            {ritual.preparation && (
              <div>
                <h2 className="font-serif text-xl mb-2">Preparación</h2>
                <p className="text-muted-foreground">{ritual.preparation}</p>
              </div>
            )}

            {/* Pasos */}
            <RitualStepsList steps={ritual.steps} />

            {/* Cierre */}
            {ritual.closing && (
              <div>
                <h2 className="font-serif text-xl mb-2">Cierre del Ritual</h2>
                <p className="text-muted-foreground">{ritual.closing}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RitualMaterials materials={ritual.materials} />

            {ritual.tips && ritual.tips.length > 0 && (
              <RitualTips tips={ritual.tips} />
            )}
          </div>
        </div>

        {/* Modo Ritual */}
        <RitualMode
          ritual={ritual}
          isOpen={isRitualModeOpen}
          onClose={() => setIsRitualModeOpen(false)}
          onComplete={handleComplete}
        />
      </div>

  );
  }

  ```

  ```

- [ ] Crear componente `RitualTips.tsx`:

  ```tsx
  "use client";

  import { Lightbulb } from "lucide-react";
  import { Card } from "@/components/ui/card";

  interface RitualTipsProps {
    tips: string[];
  }

  export function RitualTips({ tips }: RitualTipsProps) {
    return (
      <Card className="p-6">
        <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Consejos
        </h2>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              • {tip}
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  ```

- [ ] Crear `app/rituales/historial/page.tsx`:

  ```tsx
  "use client";

  import { useEffect } from "react";
  import { useRouter } from "next/navigation";
  import { Calendar, Star, Flame, TrendingUp } from "lucide-react";
  import Link from "next/link";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { RitualsSkeleton } from "@/components/features/rituals";
  import { useRitualHistory, useRitualStats } from "@/hooks/api/useRituals";
  import { useAuthStore } from "@/stores/authStore";
  import { CATEGORY_INFO, LUNAR_PHASE_INFO } from "@/types/ritual.types";
  import { ROUTES } from "@/lib/constants/routes";

  export default function HistorialPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuthStore();
    const { data: history, isLoading: loadingHistory } = useRitualHistory();
    const { data: stats, isLoading: loadingStats } = useRitualStats();

    useEffect(() => {
      if (!authLoading && !isAuthenticated) {
        router.push("/login?redirect=/rituales/historial");
      }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || !isAuthenticated) {
      return (
        <div className="container mx-auto py-8 px-4">
          <RitualsSkeleton />
        </div>
      );
    }

    const isLoading = loadingHistory || loadingStats;

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-2">Mi Historial de Rituales</h1>
          <p className="text-muted-foreground">Tu registro de práctica espiritual</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCompleted}</p>
                <p className="text-sm text-muted-foreground">Total completados</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Racha actual (días)</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonthCount}</p>
                <p className="text-sm text-muted-foreground">Este mes</p>
              </div>
            </Card>

            {stats.favoriteCategory && (
              <Card className="p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {CATEGORY_INFO[stats.favoriteCategory]?.name || stats.favoriteCategory}
                  </p>
                  <p className="text-sm text-muted-foreground">Categoría favorita</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Lista de historial */}
        <h2 className="font-serif text-2xl mb-4">Rituales Realizados</h2>

        {isLoading ? (
          <RitualsSkeleton count={4} />
        ) : history && history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry) => {
              const lunarInfo = entry.lunarPhase ? LUNAR_PHASE_INFO[entry.lunarPhase] : null;

              return (
                <Card key={entry.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <Link href={ROUTES.RITUAL_DETAIL(entry.ritual.slug)} className="font-medium hover:text-primary">
                        {entry.ritual.title}
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>
                          {new Date(entry.completedAt).toLocaleDateString("es", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        {lunarInfo && (
                          <span>
                            {lunarInfo.emoji} {lunarInfo.name}
                          </span>
                        )}
                        {entry.lunarSign && <span>Luna en {entry.lunarSign}</span>}
                      </div>
                      {entry.notes && <p className="text-sm mt-2 italic">"{entry.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.rating && (
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= entry.rating! ? "fill-yellow-500 text-yellow-500" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={ROUTES.RITUAL_DETAIL(entry.ritual.slug)}>Repetir</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl mb-2">Sin rituales aún</h3>
            <p className="text-muted-foreground mb-4">Comienza tu práctica espiritual</p>
            <Button asChild>
              <Link href={ROUTES.RITUALES}>Explorar rituales</Link>
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
    { href: "/rituales", label: "Rituales" },
    { href: "/ritual", label: "Lectura", requiresAuth: true },
  ];
  ```

##### Testing

- [ ] Test: Página principal muestra rituales
- [ ] Test: Filtros funcionan
- [ ] Test: Destacados cambian con fase lunar
- [ ] Test: Detalle muestra todos los datos
- [ ] Test: Marcar completado requiere auth
- [ ] Test: Historial requiere auth
- [ ] Test: Estadísticas se muestran

---

#### 🎯 Criterios de Aceptación

- [ ] /rituales muestra catálogo con filtros
- [ ] /rituales/[slug] muestra detalle completo
- [ ] Botón "Marcar como Completado" para usuarios auth
- [ ] /rituales/historial muestra stats e historial
- [ ] Link en header
- [ ] Responsive

# Esquema de Datos, Dependencias y Resumen

---

## ESQUEMA DE DATOS

### Tabla: `rituals`

```sql
-- Enums
CREATE TYPE ritual_category_enum AS ENUM (
  'tarot', 'lunar', 'cleansing', 'meditation',
  'protection', 'abundance', 'love', 'healing'
);

CREATE TYPE ritual_difficulty_enum AS ENUM (
  'beginner', 'intermediate', 'advanced'
);

CREATE TYPE lunar_phase_enum AS ENUM (
  'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
  'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'
);

CREATE TYPE material_type_enum AS ENUM (
  'required', 'optional', 'alternative'
);

-- Tabla principal
CREATE TABLE rituals (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category ritual_category_enum NOT NULL,
  difficulty ritual_difficulty_enum NOT NULL,
  duration_minutes SMALLINT NOT NULL,
  best_lunar_phase lunar_phase_enum,
  best_lunar_phases JSONB,
  best_time_of_day VARCHAR(255),
  purpose TEXT,
  preparation TEXT,
  closing TEXT,
  tips JSONB,
  image_url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  audio_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  completion_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_ritual_slug ON rituals(slug);
CREATE INDEX idx_ritual_category ON rituals(category);
CREATE INDEX idx_ritual_difficulty ON rituals(difficulty);
CREATE INDEX idx_ritual_lunar_phase ON rituals(best_lunar_phase);
CREATE INDEX idx_ritual_featured ON rituals(is_featured) WHERE is_featured = true;
```

### Tabla: `ritual_steps`

```sql
CREATE TABLE ritual_steps (
  id SERIAL PRIMARY KEY,
  ritual_id INTEGER NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  step_number SMALLINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  duration_seconds SMALLINT,
  image_url VARCHAR(255),
  mantra TEXT,
  visualization TEXT
);

CREATE INDEX idx_step_ritual ON ritual_steps(ritual_id);
CREATE INDEX idx_step_order ON ritual_steps(ritual_id, step_number);
```

### Tabla: `ritual_materials`

```sql
CREATE TABLE ritual_materials (
  id SERIAL PRIMARY KEY,
  ritual_id INTEGER NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type material_type_enum DEFAULT 'required',
  alternative VARCHAR(100),
  quantity SMALLINT DEFAULT 1,
  unit VARCHAR(50)
);

CREATE INDEX idx_material_ritual ON ritual_materials(ritual_id);
```

### Tabla: `user_ritual_history`

```sql
CREATE TABLE user_ritual_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ritual_id INTEGER NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL,
  lunar_phase lunar_phase_enum,
  lunar_sign VARCHAR(50),
  notes TEXT,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  duration_minutes SMALLINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_user ON user_ritual_history(user_id);
CREATE INDEX idx_history_ritual ON user_ritual_history(ritual_id);
CREATE INDEX idx_history_date ON user_ritual_history(completed_at);
```

### Tamaño Estimado

| Tabla               | Registros Iniciales   | Crecimiento                      |
| ------------------- | --------------------- | -------------------------------- |
| rituals             | 15-20                 | Bajo (contenido curado)          |
| ritual_steps        | ~100 (5-8 por ritual) | Proporcional a rituales          |
| ritual_materials    | ~60 (3-4 por ritual)  | Proporcional a rituales          |
| user_ritual_history | 0                     | ~50-100 KB/1000 usuarios activos |

---

## DEPENDENCIAS

### Dependencias npm

**Backend:**

- Ninguna adicional

**Frontend:**

- Ninguna adicional

### Variables de Entorno

**Ninguna adicional.**

### Archivos de Imágenes

```
public/images/rituals/
├── luna-nueva.jpg
├── luna-llena.jpg
├── limpieza-hogar.jpg
├── consagracion-tarot.jpg
└── ... (1 por ritual)
```

**Formato recomendado:** JPG, 800x450px (16:9), optimizado para web (~80KB c/u)

---

## RESUMEN DE TAREAS

| Tarea    | Descripción            | Estimación |
| -------- | ---------------------- | ---------- |
| TASK-400 | Entidades y Enums      | 1.5 días   |
| TASK-401 | Migraciones            | 0.5 días   |
| TASK-402 | Seeder de rituales     | 1.5 días   |
| TASK-403 | Módulo y Servicios     | 1.5 días   |
| TASK-404 | Endpoints              | 1 día      |
| TASK-405 | Frontend Types y Hooks | 0.5 días   |
| TASK-406 | Componentes de Lista   | 1 día      |
| TASK-407 | Componentes de Detalle | 1 día      |
| TASK-408 | Páginas                | 1 día      |

**Total:** 9.5 días

---

## ORDEN DE IMPLEMENTACIÓN

```
Semana 1: Backend
├── TASK-400: Entidades (1.5d)
├── TASK-401: Migraciones (0.5d)
├── TASK-402: Seeder (1.5d)
├── TASK-403: Servicios (1.5d)
└── TASK-404: Endpoints (1d)

Semana 2: Frontend
├── TASK-405: Types y Hooks (0.5d)
├── TASK-406: Componentes Lista (1d)
├── TASK-407: Componentes Detalle (1.5d)
└── TASK-408: Páginas (1d)
```

---

## FUNCIONALIDADES DESTACADAS

### Cálculo de Fase Lunar

El servicio `LunarPhaseService` calcula la fase lunar actual usando un algoritmo basado en el ciclo sinódico de 29.5 días. No requiere API externa.

```typescript
// Ejemplo de uso
const lunarInfo = lunarPhaseService.getCurrentPhase();
// {
//   phase: 'full_moon',
//   phaseName: 'Luna Llena',
//   illumination: 98,
//   zodiacSign: 'Leo',
//   isGoodFor: ['Culminación', 'Celebración', 'Liberación']
// }
```

### Estadísticas de Usuario

- Total de rituales completados
- Racha de días consecutivos
- Categoría favorita
- Rituales este mes

---

## RIESGOS

| Riesgo                        | Probabilidad | Impacto | Mitigación                                                  |
| ----------------------------- | ------------ | ------- | ----------------------------------------------------------- |
| Cálculo lunar impreciso       | Baja         | Bajo    | Algoritmo estándar, suficiente para propósitos espirituales |
| Contenido de rituales extenso | Media        | Medio   | Empezar con 10-15 rituales bien curados                     |

---

## CHECKLIST DE COMPLETITUD

### Backend

- [ ] TASK-400: Entidades creadas
- [ ] TASK-401: Migraciones ejecutan
- [ ] TASK-402: Seeder con 10+ rituales
- [ ] TASK-403: Servicios funcionan
- [ ] TASK-404: Endpoints probados

### Frontend

- [ ] TASK-405: Types y hooks
- [ ] TASK-406: Componentes de lista
- [ ] TASK-407: Componentes de detalle
- [ ] TASK-408: Páginas completas

### Contenido

- [ ] 10-15 rituales iniciales
- [ ] Imágenes para cada ritual
- [ ] Contenido en español de calidad

### Testing

- [ ] Tests unitarios de servicios
- [ ] Test de cálculo lunar
- [ ] Tests e2e de endpoints
- [ ] Tests de componentes
- [ ] Coverage >80%

---

## NOTAS ADICIONALES

### SEO

Cada página de ritual debería tener:

- Title: "Ritual de Luna Nueva - Guía Paso a Paso | Auguria"
- Description: Propósito del ritual
- Open Graph image: Imagen del ritual

### Accesibilidad

- Pasos del ritual accesibles por teclado
- Contraste adecuado en toda la interfaz
- Imágenes con alt text descriptivo

### Performance

- Lazy load de imágenes en lista
- staleTime de 30 min para rituales (cambian poco)

### Futuras Mejoras

- Audio guiado para cada paso
- Integración con calendario para programar rituales
- Notificaciones push para fases lunares importantes
- Comunidad: compartir experiencias

---

**Fin del Módulo Rituales**
