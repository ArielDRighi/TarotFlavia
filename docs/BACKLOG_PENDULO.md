# BACKLOG AUGURIA 2.0 - PÉNDULO DIGITAL

## Historias de Usuario

**Fecha de creación:** 18 de enero de 2026  
**Módulo:** Péndulo Digital  
**Prioridad Global:** 🟡 MEDIA  
**Estimación Total:** 6-7 días

---

## OVERVIEW DEL MÓDULO

El Péndulo Digital es una herramienta interactiva que simula la experiencia de usar un péndulo físico para obtener respuestas a preguntas de sí/no. Utiliza animaciones fluidas y física realista para crear una experiencia inmersiva y contemplativa.

### Características principales:

| Característica          | Descripción                                               |
| ----------------------- | --------------------------------------------------------- |
| Animación realista      | Péndulo con física de oscilación natural                  |
| Respuestas Sí/No/Quizás | Tres posibles direcciones de movimiento                   |
| Múltiples estilos       | Diferentes diseños de péndulos (cristal, metal, madera)   |
| Historial de consultas  | Registro de preguntas y respuestas (usuarios registrados) |
| Modo meditativo         | Fondo y sonidos ambientales opcionales                    |
| Interpretación IA       | Explicación contextual de la respuesta (opcional)         |

### Mecánica del péndulo:

- **Sí:** Oscilación vertical (adelante-atrás)
- **No:** Oscilación horizontal (izquierda-derecha)
- **Quizás/Incierto:** Movimiento circular

---

## 1. HISTORIAS DE USUARIO

### HU-PEN-001: Usar el péndulo digital (Usuario Anónimo)

```gherkin
Feature: Consultar el péndulo digital
  Como usuario anónimo
  Quiero usar el péndulo digital para obtener respuestas
  Para recibir guía en decisiones simples

  Background:
    Given soy un usuario en Auguria

  Scenario: Acceder al péndulo
    When navego a la sección "Péndulo"
    Then veo la página del péndulo con:
      - Péndulo animado en reposo (leve balanceo)
      - Campo para escribir mi pregunta
      - Botón "Consultar"
      - Selector de estilo de péndulo
      - Breve explicación de cómo funciona

  Scenario: Hacer una consulta al péndulo
    Given estoy en la página del péndulo
    When escribo "¿Debo aceptar este trabajo?"
    And hago clic en "Consultar"
    Then el péndulo comienza a moverse de forma aleatoria
    And después de 3-5 segundos se estabiliza en una dirección
    And veo la respuesta (Sí/No/Quizás) con animación
    And opcionalmente veo una breve interpretación

  Scenario: Consultar sin pregunta
    Given estoy en la página del péndulo
    When hago clic en "Consultar" sin escribir pregunta
    Then veo mensaje "Formula tu pregunta mentalmente"
    And el péndulo responde igualmente

  Scenario: Nueva consulta
    Given acabo de recibir una respuesta
    When hago clic en "Nueva consulta"
    Then el péndulo vuelve a posición de reposo
    And el campo de pregunta se limpia
    And puedo hacer otra consulta
```

---

### HU-PEN-002: Personalizar el péndulo

```gherkin
Feature: Personalizar apariencia del péndulo
  Como usuario
  Quiero elegir el estilo de mi péndulo
  Para tener una experiencia más personal

  Scenario: Ver estilos disponibles
    Given estoy en la página del péndulo
    When hago clic en el selector de estilos
    Then veo las opciones disponibles:
      | Estilo | Descripción |
      | Cristal de cuarzo | Transparente con reflejos |
      | Amatista | Púrpura con brillo |
      | Obsidiana | Negro brillante |
      | Cobre | Metal cobrizo antiguo |
      | Madera | Madera natural tallada |
      | Oro | Dorado elegante (Premium) |

  Scenario: Cambiar estilo de péndulo
    Given estoy viendo los estilos
    When selecciono "Amatista"
    Then el péndulo cambia de apariencia
    And la cadena/cuerda se adapta al estilo
    And el cambio se guarda en localStorage

  Scenario: Estilos premium para usuarios registrados
    Given soy usuario anónimo
    When intento seleccionar "Oro"
    Then veo mensaje "Estilo premium - Inicia sesión"
    And puedo ver una preview del estilo
```

---

### HU-PEN-003: Modo meditativo

```gherkin
Feature: Activar modo meditativo
  Como usuario
  Quiero un ambiente contemplativo
  Para concentrarme mejor en mi consulta

  Scenario: Activar modo meditativo
    Given estoy en la página del péndulo
    When activo el "Modo meditativo"
    Then el fondo cambia a un degradado suave
    And aparecen partículas flotantes sutiles
    And opcionalmente se reproduce música ambiental
    And la UI se simplifica (menos elementos)

  Scenario: Controlar audio ambiental
    Given tengo el modo meditativo activado
    Then veo controles de:
      - Volumen del ambiente
      - Tipo de sonido (cuencos, naturaleza, silencio)
      - Botón de mute

  Scenario: Desactivar modo meditativo
    Given tengo el modo meditativo activado
    When desactivo el modo
    Then vuelve el fondo normal
    And se detiene el audio
    And aparecen todos los elementos de UI
```

---

### HU-PEN-004: Historial de consultas (Usuario Registrado)

```gherkin
Feature: Ver historial de consultas
  Como usuario registrado
  Quiero ver mis consultas anteriores
  Para reflexionar sobre las respuestas recibidas

  Background:
    Given soy un usuario registrado y autenticado

  Scenario: Guardar consulta automáticamente
    Given hago una consulta al péndulo
    When recibo la respuesta
    Then la consulta se guarda automáticamente con:
      | Campo | Ejemplo |
      | Pregunta | ¿Debo aceptar este trabajo? |
      | Respuesta | Sí |
      | Fecha | 18 de enero 2026, 15:30 |
      | Fase lunar | Luna Creciente |

  Scenario: Ver historial
    When accedo a "Mi Historial"
    Then veo mis últimas consultas
    And cada entrada muestra pregunta, respuesta y fecha
    And puedo filtrar por respuesta (Sí/No/Quizás)

  Scenario: Eliminar consulta del historial
    Given estoy viendo mi historial
    When elimino una consulta
    Then desaparece de la lista
    And no se puede recuperar

  Scenario: Límite de historial
    Given soy usuario gratuito
    Then mi historial guarda las últimas 20 consultas
    And las más antiguas se eliminan automáticamente
```

---

### HU-PEN-005: Interpretación con IA (Opcional)

```gherkin
Feature: Obtener interpretación de la respuesta
  Como usuario
  Quiero una interpretación más profunda
  Para entender mejor el mensaje del péndulo

  Scenario: Ver interpretación básica
    Given acabo de recibir una respuesta "Sí"
    Then veo una interpretación genérica:
      "El péndulo indica una energía positiva hacia tu pregunta.
       Este puede ser un buen momento para avanzar."

  Scenario: Solicitar interpretación personalizada
    Given acabo de recibir una respuesta
    And soy usuario registrado
    When hago clic en "Interpretación profunda"
    Then la IA genera una interpretación considerando:
      - Mi pregunta específica
      - La respuesta del péndulo
      - La fase lunar actual
    And veo un texto de 2-3 párrafos

  Scenario: Usuario anónimo solicita interpretación
    Given soy usuario anónimo
    When intento obtener interpretación personalizada
    Then veo CTA para registrarse
    And puedo ver la interpretación genérica
```

---

## 2. REGLAS DE NEGOCIO

### Generación de Respuestas

```
ALGORITMO RESPUESTA PÉNDULO:
1. Usuario hace consulta
2. Sistema genera número aleatorio (0-100)
3. Distribución de probabilidades:
   - 0-40: Sí (40%)
   - 41-80: No (40%)
   - 81-100: Quizás (20%)
4. Animación muestra movimiento correspondiente
5. Se revela respuesta con efecto visual
```

### Límites por Tipo de Usuario

| Feature           | Anónimo    | Registrado Gratis | Premium    |
| ----------------- | ---------- | ----------------- | ---------- |
| Consultas/día     | Ilimitadas | Ilimitadas        | Ilimitadas |
| Historial         | No         | Últimas 20        | Ilimitado  |
| Estilos           | 3 básicos  | 5 estilos         | Todos      |
| Interpretación IA | Genérica   | 5/día             | Ilimitada  |
| Modo meditativo   | Sí         | Sí                | Sí         |

### Privacidad

- Las preguntas NO se almacenan para usuarios anónimos
- Usuarios registrados pueden borrar su historial
- Las preguntas no se usan para entrenar modelos

# Backend: Entidades y Enums

---

### TASK-500: Crear entidades del Péndulo Digital

**Módulo:** `src/modules/pendulum/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** Ninguna

---

#### 📋 Descripción

Crear las entidades para el sistema del péndulo digital: estilos de péndulo y historial de consultas.

---

#### 🏗️ Contexto Técnico

**Estructura del módulo:**

```
src/modules/pendulum/
├── pendulum.module.ts
├── entities/
│   ├── pendulum-style.entity.ts
│   └── pendulum-query.entity.ts
├── enums/
│   └── pendulum.enums.ts
├── data/
│   └── pendulum-styles.data.ts
├── application/
│   ├── dto/
│   └── services/
└── infrastructure/
    └── controllers/
```

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `pendulum.enums.ts`:

  ```typescript
  export enum PendulumResponse {
    YES = "yes",
    NO = "no",
    MAYBE = "maybe",
  }

  export enum PendulumStyleType {
    CRYSTAL_QUARTZ = "crystal_quartz",
    AMETHYST = "amethyst",
    OBSIDIAN = "obsidian",
    COPPER = "copper",
    WOOD = "wood",
    GOLD = "gold",
    ROSE_QUARTZ = "rose_quartz",
    LAPIS_LAZULI = "lapis_lazuli",
  }

  export enum PendulumMovement {
    VERTICAL = "vertical", // Sí - adelante/atrás
    HORIZONTAL = "horizontal", // No - izquierda/derecha
    CIRCULAR = "circular", // Quizás - circular
  }
  ```

- [ ] Crear `pendulum-style.entity.ts`:

  ```typescript
  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
  import { PendulumStyleType } from "../enums/pendulum.enums";

  @Entity("pendulum_styles")
  export class PendulumStyle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: PendulumStyleType, unique: true })
    type: PendulumStyleType;

    @Column({ type: "varchar", length: 50 })
    name: string;

    @Column({ type: "varchar", length: 50 })
    nameEs: string;

    @Column({ type: "text" })
    description: string;

    // Colores para renderizado
    @Column({ type: "varchar", length: 7 })
    primaryColor: string; // HEX color

    @Column({ type: "varchar", length: 7 })
    secondaryColor: string; // HEX color

    @Column({ type: "varchar", length: 7, nullable: true })
    glowColor: string | null; // Color del brillo

    // Propiedades visuales
    @Column({ type: "boolean", default: false })
    hasGlow: boolean;

    @Column({ type: "boolean", default: false })
    isTransparent: boolean;

    @Column({ type: "varchar", length: 20, default: "silver" })
    chainColor: string;

    // Acceso
    @Column({ type: "boolean", default: false })
    isPremium: boolean;

    @Column({ type: "boolean", default: true })
    isActive: boolean;

    @Column({ type: "smallint", default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;
  }
  ```

- [ ] Crear `pendulum-query.entity.ts`:

  ```typescript
  import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
  import { User } from "@/modules/users/entities/user.entity";
  import { PendulumResponse, PendulumStyleType } from "../enums/pendulum.enums";
  import { LunarPhase } from "@/modules/rituals/enums/ritual.enums";

  @Entity("pendulum_queries")
  @Index("idx_query_user", ["userId"])
  @Index("idx_query_date", ["createdAt"])
  export class PendulumQuery {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({ type: "text", nullable: true })
    question: string | null; // Puede ser null si consultan mentalmente

    @Column({ type: "enum", enum: PendulumResponse })
    response: PendulumResponse;

    @Column({ type: "enum", enum: PendulumStyleType })
    styleUsed: PendulumStyleType;

    @Column({ type: "enum", enum: LunarPhase, nullable: true })
    lunarPhase: LunarPhase | null;

    @Column({ type: "text", nullable: true })
    interpretation: string | null; // Interpretación generada por IA

    @Column({ type: "boolean", default: false })
    hasAiInterpretation: boolean;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
  }
  ```

##### Testing

- [ ] Test: Entidades se crean correctamente
- [ ] Test: Enums tienen valores correctos
- [ ] Test: Relación con User funciona
- [ ] Test: Cascade delete funciona

---

#### 🎯 Criterios de Aceptación

- [ ] Entidad PendulumStyle con propiedades visuales
- [ ] Entidad PendulumQuery para historial
- [ ] Enums para respuestas y estilos
- [ ] Índices para consultas frecuentes

---

### TASK-501: Crear migración y seeder de estilos

**Módulo:** `src/database/migrations/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-500

---

#### 📋 Descripción

Crear migración para las tablas del péndulo y seeder con los estilos disponibles.

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear migración:

  ```typescript
  // XXXX-CreatePendulumTables.ts
  import { MigrationInterface, QueryRunner } from "typeorm";

  export class CreatePendulumTables implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      // Crear enums
      await queryRunner.query(`
        CREATE TYPE pendulum_response_enum AS ENUM ('yes', 'no', 'maybe');
        
        CREATE TYPE pendulum_style_enum AS ENUM (
          'crystal_quartz', 'amethyst', 'obsidian', 'copper',
          'wood', 'gold', 'rose_quartz', 'lapis_lazuli'
        );
        
        CREATE TYPE pendulum_movement_enum AS ENUM (
          'vertical', 'horizontal', 'circular'
        );
      `);

      // Tabla de estilos
      await queryRunner.query(`
        CREATE TABLE pendulum_styles (
          id SERIAL PRIMARY KEY,
          type pendulum_style_enum UNIQUE NOT NULL,
          name VARCHAR(50) NOT NULL,
          name_es VARCHAR(50) NOT NULL,
          description TEXT NOT NULL,
          primary_color VARCHAR(7) NOT NULL,
          secondary_color VARCHAR(7) NOT NULL,
          glow_color VARCHAR(7),
          has_glow BOOLEAN DEFAULT false,
          is_transparent BOOLEAN DEFAULT false,
          chain_color VARCHAR(20) DEFAULT 'silver',
          is_premium BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          sort_order SMALLINT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Tabla de consultas
      await queryRunner.query(`
        CREATE TABLE pendulum_queries (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          question TEXT,
          response pendulum_response_enum NOT NULL,
          style_used pendulum_style_enum NOT NULL,
          lunar_phase lunar_phase_enum,
          interpretation TEXT,
          has_ai_interpretation BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          
          CONSTRAINT fk_query_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        );
  
        CREATE INDEX idx_query_user ON pendulum_queries(user_id);
        CREATE INDEX idx_query_date ON pendulum_queries(created_at DESC);
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("DROP TABLE IF EXISTS pendulum_queries");
      await queryRunner.query("DROP TABLE IF EXISTS pendulum_styles");
      await queryRunner.query("DROP TYPE IF EXISTS pendulum_movement_enum");
      await queryRunner.query("DROP TYPE IF EXISTS pendulum_style_enum");
      await queryRunner.query("DROP TYPE IF EXISTS pendulum_response_enum");
    }
  }
  ```

- [ ] Crear `pendulum-styles.data.ts`:

  ```typescript
  import { PendulumStyleType } from "../enums/pendulum.enums";

  export interface PendulumStyleSeed {
    type: PendulumStyleType;
    name: string;
    nameEs: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    glowColor?: string;
    hasGlow: boolean;
    isTransparent: boolean;
    chainColor: string;
    isPremium: boolean;
    sortOrder: number;
  }

  export const PENDULUM_STYLES: PendulumStyleSeed[] = [
    {
      type: PendulumStyleType.CRYSTAL_QUARTZ,
      name: "Crystal Quartz",
      nameEs: "Cuarzo Cristal",
      description: "Cristal de cuarzo transparente, amplificador de energía y claridad mental.",
      primaryColor: "#FFFFFF",
      secondaryColor: "#E8E8E8",
      glowColor: "#FFFFFF",
      hasGlow: true,
      isTransparent: true,
      chainColor: "silver",
      isPremium: false,
      sortOrder: 1,
    },
    {
      type: PendulumStyleType.AMETHYST,
      name: "Amethyst",
      nameEs: "Amatista",
      description: "Piedra púrpura de intuición y conexión espiritual.",
      primaryColor: "#9966CC",
      secondaryColor: "#7B4397",
      glowColor: "#9966CC",
      hasGlow: true,
      isTransparent: true,
      chainColor: "silver",
      isPremium: false,
      sortOrder: 2,
    },
    {
      type: PendulumStyleType.OBSIDIAN,
      name: "Obsidian",
      nameEs: "Obsidiana",
      description: "Vidrio volcánico negro, protección y verdad oculta.",
      primaryColor: "#0D0D0D",
      secondaryColor: "#1A1A1A",
      hasGlow: false,
      isTransparent: false,
      chainColor: "black",
      isPremium: false,
      sortOrder: 3,
    },
    {
      type: PendulumStyleType.COPPER,
      name: "Copper",
      nameEs: "Cobre",
      description: "Metal conductor de energía, tradición y conexión ancestral.",
      primaryColor: "#B87333",
      secondaryColor: "#8B4513",
      hasGlow: false,
      isTransparent: false,
      chainColor: "copper",
      isPremium: false,
      sortOrder: 4,
    },
    {
      type: PendulumStyleType.WOOD,
      name: "Wood",
      nameEs: "Madera",
      description: "Madera natural tallada, conexión con la tierra y estabilidad.",
      primaryColor: "#8B4513",
      secondaryColor: "#654321",
      hasGlow: false,
      isTransparent: false,
      chainColor: "brown",
      isPremium: false,
      sortOrder: 5,
    },
    {
      type: PendulumStyleType.ROSE_QUARTZ,
      name: "Rose Quartz",
      nameEs: "Cuarzo Rosa",
      description: "Piedra del amor y la compasión, ideal para preguntas del corazón.",
      primaryColor: "#FFB6C1",
      secondaryColor: "#FF69B4",
      glowColor: "#FFB6C1",
      hasGlow: true,
      isTransparent: true,
      chainColor: "rose_gold",
      isPremium: true,
      sortOrder: 6,
    },
    {
      type: PendulumStyleType.LAPIS_LAZULI,
      name: "Lapis Lazuli",
      nameEs: "Lapislázuli",
      description: "Piedra azul de sabiduría y verdad, usada por antiguas civilizaciones.",
      primaryColor: "#26619C",
      secondaryColor: "#1E4D7B",
      glowColor: "#4169E1",
      hasGlow: true,
      isTransparent: false,
      chainColor: "gold",
      isPremium: true,
      sortOrder: 7,
    },
    {
      type: PendulumStyleType.GOLD,
      name: "Gold",
      nameEs: "Oro",
      description: "Péndulo dorado de abundancia y poder solar.",
      primaryColor: "#FFD700",
      secondaryColor: "#DAA520",
      glowColor: "#FFD700",
      hasGlow: true,
      isTransparent: false,
      chainColor: "gold",
      isPremium: true,
      sortOrder: 8,
    },
  ];
  ```

- [ ] Crear comando de seed:

  ```typescript
  // src/database/seeds/pendulum-styles.seed.ts
  import { DataSource } from "typeorm";
  import { PendulumStyle } from "@/modules/pendulum/entities/pendulum-style.entity";
  import { PENDULUM_STYLES } from "@/modules/pendulum/data/pendulum-styles.data";

  export async function seedPendulumStyles(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(PendulumStyle);

    const count = await repo.count();
    if (count > 0) {
      console.log("Estilos de péndulo ya existen. Saltando seed.");
      return;
    }

    console.log("Insertando estilos de péndulo...");

    for (const style of PENDULUM_STYLES) {
      const entity = repo.create(style);
      await repo.save(entity);
    }

    console.log(`Seed completado: ${PENDULUM_STYLES.length} estilos insertados.`);
  }
  ```

##### Testing

- [ ] Test: Migración crea tablas correctamente
- [ ] Test: Seeder inserta todos los estilos
- [ ] Test: No duplica si ya existen

---

#### 🎯 Criterios de Aceptación

- [ ] Tablas creadas con índices
- [ ] 8 estilos de péndulo insertados
- [ ] 5 gratuitos, 3 premium
- [ ] Colores y propiedades visuales correctos

# Backend: Módulo y Servicios

---

### TASK-502: Crear módulo y servicios del Péndulo

**Módulo:** `src/modules/pendulum/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-500, TASK-501

---

#### 📋 Descripción

Crear el módulo NestJS con servicios para consultar el péndulo, generar respuestas, gestionar historial e interpretaciones.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/pendulum/pendulum.module.ts`
- `src/modules/pendulum/application/services/pendulum.service.ts`
- `src/modules/pendulum/application/services/pendulum-history.service.ts`
- `src/modules/pendulum/application/services/pendulum-interpretation.service.ts`
- `src/modules/pendulum/application/dto/*.dto.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear DTOs:

  ```typescript
  // pendulum-query.dto.ts
  import { ApiProperty } from "@nestjs/swagger";
  import { IsOptional, IsString, IsEnum, MaxLength } from "class-validator";
  import { PendulumStyleType } from "../enums/pendulum.enums";

  export class PendulumQueryDto {
    @ApiProperty({ required: false, maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    question?: string;

    @ApiProperty({ enum: PendulumStyleType, required: false })
    @IsOptional()
    @IsEnum(PendulumStyleType)
    style?: PendulumStyleType;

    @ApiProperty({ required: false, default: false })
    @IsOptional()
    requestInterpretation?: boolean;
  }
  ```

  ```typescript
  // pendulum-response.dto.ts
  import { ApiProperty } from "@nestjs/swagger";
  import { PendulumResponse, PendulumMovement, PendulumStyleType } from "../enums/pendulum.enums";

  export class PendulumStyleDto {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: PendulumStyleType })
    type: PendulumStyleType;

    @ApiProperty()
    name: string;

    @ApiProperty()
    nameEs: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    primaryColor: string;

    @ApiProperty()
    secondaryColor: string;

    @ApiProperty({ nullable: true })
    glowColor: string | null;

    @ApiProperty()
    hasGlow: boolean;

    @ApiProperty()
    isTransparent: boolean;

    @ApiProperty()
    chainColor: string;

    @ApiProperty()
    isPremium: boolean;
  }

  export class PendulumQueryResponseDto {
    @ApiProperty({ enum: PendulumResponse })
    response: PendulumResponse;

    @ApiProperty({ enum: PendulumMovement })
    movement: PendulumMovement;

    @ApiProperty()
    responseText: string;

    @ApiProperty({ nullable: true })
    interpretation: string | null;

    @ApiProperty({ nullable: true })
    queryId: number | null; // Solo si está autenticado

    @ApiProperty()
    lunarPhase: string;

    @ApiProperty()
    lunarPhaseName: string;
  }

  export class PendulumHistoryItemDto {
    @ApiProperty()
    id: number;

    @ApiProperty({ nullable: true })
    question: string | null;

    @ApiProperty({ enum: PendulumResponse })
    response: PendulumResponse;

    @ApiProperty({ enum: PendulumStyleType })
    styleUsed: PendulumStyleType;

    @ApiProperty({ nullable: true })
    lunarPhase: string | null;

    @ApiProperty({ nullable: true })
    interpretation: string | null;

    @ApiProperty()
    createdAt: Date;
  }
  ```

- [ ] Crear `pendulum.service.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository } from "typeorm";
  import { PendulumStyle } from "../entities/pendulum-style.entity";
  import { PendulumQuery } from "../entities/pendulum-query.entity";
  import { PendulumResponse, PendulumMovement, PendulumStyleType } from "../enums/pendulum.enums";
  import { PendulumQueryDto, PendulumQueryResponseDto, PendulumStyleDto } from "../application/dto";
  import { LunarPhaseService } from "@/modules/rituals/application/services/lunar-phase.service";
  import { PendulumInterpretationService } from "./pendulum-interpretation.service";

  @Injectable()
  export class PendulumService {
    constructor(
      @InjectRepository(PendulumStyle)
      private readonly styleRepository: Repository<PendulumStyle>,
      @InjectRepository(PendulumQuery)
      private readonly queryRepository: Repository<PendulumQuery>,
      private readonly lunarService: LunarPhaseService,
      private readonly interpretationService: PendulumInterpretationService,
    ) {}

    /**
     * Obtener todos los estilos disponibles
     */
    async getStyles(includePremium: boolean = true): Promise<PendulumStyleDto[]> {
      const query = this.styleRepository
        .createQueryBuilder("style")
        .where("style.isActive = :active", { active: true })
        .orderBy("style.sortOrder", "ASC");

      if (!includePremium) {
        query.andWhere("style.isPremium = :premium", { premium: false });
      }

      const styles = await query.getMany();
      return styles.map(this.toStyleDto);
    }

    /**
     * Obtener un estilo por tipo
     */
    async getStyleByType(type: PendulumStyleType): Promise<PendulumStyle | null> {
      return this.styleRepository.findOne({
        where: { type, isActive: true },
      });
    }

    /**
     * Consultar el péndulo
     */
    async query(
      dto: PendulumQueryDto,
      userId?: number,
      isPremiumUser: boolean = false,
    ): Promise<PendulumQueryResponseDto> {
      // Generar respuesta
      const response = this.generateResponse();
      const movement = this.getMovementForResponse(response);
      const responseText = this.getResponseText(response);

      // Obtener fase lunar
      const lunarInfo = this.lunarService.getCurrentPhase();

      // Generar interpretación si se solicita
      let interpretation: string | null = null;
      if (dto.requestInterpretation && dto.question) {
        interpretation = await this.interpretationService.generate(dto.question, response, lunarInfo);
      }

      // Guardar en historial si está autenticado
      let queryId: number | null = null;
      if (userId) {
        const savedQuery = await this.saveQuery(userId, dto, response, interpretation, lunarInfo.phase);
        queryId = savedQuery.id;
      }

      return {
        response,
        movement,
        responseText,
        interpretation,
        queryId,
        lunarPhase: lunarInfo.phase,
        lunarPhaseName: lunarInfo.phaseName,
      };
    }

    /**
     * Generar respuesta aleatoria con distribución ponderada
     */
    private generateResponse(): PendulumResponse {
      const random = Math.random() * 100;

      // Distribución: Sí 40%, No 40%, Quizás 20%
      if (random < 40) {
        return PendulumResponse.YES;
      } else if (random < 80) {
        return PendulumResponse.NO;
      } else {
        return PendulumResponse.MAYBE;
      }
    }

    /**
     * Obtener tipo de movimiento para la respuesta
     */
    private getMovementForResponse(response: PendulumResponse): PendulumMovement {
      switch (response) {
        case PendulumResponse.YES:
          return PendulumMovement.VERTICAL;
        case PendulumResponse.NO:
          return PendulumMovement.HORIZONTAL;
        case PendulumResponse.MAYBE:
          return PendulumMovement.CIRCULAR;
      }
    }

    /**
     * Obtener texto de respuesta
     */
    private getResponseText(response: PendulumResponse): string {
      switch (response) {
        case PendulumResponse.YES:
          return "Sí";
        case PendulumResponse.NO:
          return "No";
        case PendulumResponse.MAYBE:
          return "Quizás";
      }
    }

    /**
     * Guardar consulta en historial
     */
    private async saveQuery(
      userId: number,
      dto: PendulumQueryDto,
      response: PendulumResponse,
      interpretation: string | null,
      lunarPhase: string,
    ): Promise<PendulumQuery> {
      const query = this.queryRepository.create({
        userId,
        question: dto.question || null,
        response,
        styleUsed: dto.style || PendulumStyleType.CRYSTAL_QUARTZ,
        lunarPhase: lunarPhase as any,
        interpretation,
        hasAiInterpretation: !!interpretation,
      });

      return this.queryRepository.save(query);
    }

    private toStyleDto(style: PendulumStyle): PendulumStyleDto {
      return {
        id: style.id,
        type: style.type,
        name: style.name,
        nameEs: style.nameEs,
        description: style.description,
        primaryColor: style.primaryColor,
        secondaryColor: style.secondaryColor,
        glowColor: style.glowColor,
        hasGlow: style.hasGlow,
        isTransparent: style.isTransparent,
        chainColor: style.chainColor,
        isPremium: style.isPremium,
      };
    }
  }
  ```

- [ ] Crear `pendulum-history.service.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository } from "typeorm";
  import { PendulumQuery } from "../entities/pendulum-query.entity";
  import { PendulumHistoryItemDto } from "../application/dto";
  import { PendulumResponse } from "../enums/pendulum.enums";

  const MAX_HISTORY_FREE = 20;
  const MAX_HISTORY_PREMIUM = 100;

  @Injectable()
  export class PendulumHistoryService {
    constructor(
      @InjectRepository(PendulumQuery)
      private readonly queryRepository: Repository<PendulumQuery>,
    ) {}

    /**
     * Obtener historial del usuario
     */
    async getUserHistory(
      userId: number,
      limit?: number,
      filterResponse?: PendulumResponse,
    ): Promise<PendulumHistoryItemDto[]> {
      const query = this.queryRepository
        .createQueryBuilder("q")
        .where("q.userId = :userId", { userId })
        .orderBy("q.createdAt", "DESC");

      if (filterResponse) {
        query.andWhere("q.response = :response", { response: filterResponse });
      }

      if (limit) {
        query.take(limit);
      }

      const history = await query.getMany();

      return history.map((h) => ({
        id: h.id,
        question: h.question,
        response: h.response,
        styleUsed: h.styleUsed,
        lunarPhase: h.lunarPhase,
        interpretation: h.interpretation,
        createdAt: h.createdAt,
      }));
    }

    /**
     * Eliminar consulta del historial
     */
    async deleteQuery(userId: number, queryId: number): Promise<boolean> {
      const result = await this.queryRepository.delete({
        id: queryId,
        userId,
      });

      return (result.affected || 0) > 0;
    }

    /**
     * Limpiar historial antiguo (mantener últimos N)
     */
    async cleanupOldHistory(userId: number, isPremium: boolean): Promise<number> {
      const maxHistory = isPremium ? MAX_HISTORY_PREMIUM : MAX_HISTORY_FREE;

      // Obtener IDs a mantener
      const toKeep = await this.queryRepository
        .createQueryBuilder("q")
        .select("q.id")
        .where("q.userId = :userId", { userId })
        .orderBy("q.createdAt", "DESC")
        .take(maxHistory)
        .getMany();

      const keepIds = toKeep.map((q) => q.id);

      if (keepIds.length === 0) return 0;

      // Eliminar los que no están en la lista
      const result = await this.queryRepository
        .createQueryBuilder()
        .delete()
        .where("userId = :userId", { userId })
        .andWhere("id NOT IN (:...keepIds)", { keepIds })
        .execute();

      return result.affected || 0;
    }

    /**
     * Obtener estadísticas del usuario
     */
    async getUserStats(userId: number): Promise<{
      total: number;
      yesCount: number;
      noCount: number;
      maybeCount: number;
    }> {
      const result = await this.queryRepository
        .createQueryBuilder("q")
        .select("q.response", "response")
        .addSelect("COUNT(*)", "count")
        .where("q.userId = :userId", { userId })
        .groupBy("q.response")
        .getRawMany();

      const stats = {
        total: 0,
        yesCount: 0,
        noCount: 0,
        maybeCount: 0,
      };

      result.forEach((r) => {
        const count = parseInt(r.count, 10);
        stats.total += count;
        switch (r.response) {
          case PendulumResponse.YES:
            stats.yesCount = count;
            break;
          case PendulumResponse.NO:
            stats.noCount = count;
            break;
          case PendulumResponse.MAYBE:
            stats.maybeCount = count;
            break;
        }
      });

      return stats;
    }
  }
  ```

- [ ] Crear `pendulum-interpretation.service.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { PendulumResponse } from "../enums/pendulum.enums";
  import { LunarInfo } from "@/modules/rituals/application/services/lunar-phase.service";

  @Injectable()
  export class PendulumInterpretationService {
    /**
     * Generar interpretación para una respuesta
     * Por ahora usa templates, en el futuro puede usar IA
     */
    async generate(question: string, response: PendulumResponse, lunarInfo: LunarInfo): Promise<string> {
      // Interpretaciones base por respuesta
      const baseInterpretations: Record<PendulumResponse, string[]> = {
        [PendulumResponse.YES]: [
          "El péndulo indica una energía positiva y receptiva hacia tu pregunta.",
          "Las energías están alineadas favorablemente en este momento.",
          "Hay un flujo de apertura y posibilidad en torno a esta situación.",
        ],
        [PendulumResponse.NO]: [
          "El péndulo sugiere que este puede no ser el momento adecuado.",
          "Las energías actuales indican resistencia o bloqueo.",
          "Quizás sea prudente reconsiderar o esperar antes de actuar.",
        ],
        [PendulumResponse.MAYBE]: [
          "El péndulo muestra incertidumbre, lo cual sugiere que hay factores aún por definirse.",
          "La respuesta no es clara en este momento; considera explorar más la situación.",
          "Las energías están en transición; dale tiempo a la situación.",
        ],
      };

      // Seleccionar interpretación base aleatoria
      const bases = baseInterpretations[response];
      const baseText = bases[Math.floor(Math.random() * bases.length)];

      // Agregar contexto lunar
      const lunarContext = this.getLunarContext(lunarInfo, response);

      return `${baseText}\n\n${lunarContext}`;
    }

    /**
     * Obtener contexto según fase lunar
     */
    private getLunarContext(lunarInfo: LunarInfo, response: PendulumResponse): string {
      const phase = lunarInfo.phaseName;
      const sign = lunarInfo.zodiacSign;

      const contexts: Record<string, string> = {
        "Luna Nueva": `Con la ${phase}, es un momento propicio para nuevos comienzos y sembrar intenciones. ${response === PendulumResponse.YES ? "La respuesta positiva refuerza este potencial de inicio." : "Quizás sea mejor esperar a que la luna crezca."}`,
        "Luna Llena": `Bajo la ${phase}, las emociones están intensificadas y las verdades salen a la luz. ${response === PendulumResponse.YES ? "Es momento de actuar con confianza." : "Considera si las emociones están nublando tu juicio."}`,
        "Cuarto Creciente": `En ${phase}, las energías favorecen la acción y el crecimiento. ${response === PendulumResponse.YES ? "Aprovecha este impulso." : "Puede haber obstáculos por superar primero."}`,
        "Cuarto Menguante": `Durante el ${phase}, es tiempo de soltar y reflexionar. ${response === PendulumResponse.NO ? "La respuesta sugiere que hay algo que debes dejar ir." : "Considera qué debes liberar antes de avanzar."}`,
      };

      const defaultContext = `Con la luna en ${sign}, confía en tu intuición para interpretar este mensaje.`;

      return contexts[phase] || defaultContext;
    }

    /**
     * Obtener interpretación genérica (sin pregunta específica)
     */
    getGenericInterpretation(response: PendulumResponse): string {
      switch (response) {
        case PendulumResponse.YES:
          return "El péndulo se mueve de forma afirmativa, indicando una respuesta positiva a tu pregunta interna.";
        case PendulumResponse.NO:
          return "El movimiento horizontal del péndulo sugiere una respuesta negativa o que este no es el momento adecuado.";
        case PendulumResponse.MAYBE:
          return "El péndulo gira en círculos, lo cual indica incertidumbre o que la situación aún está por definirse.";
      }
    }
  }
  ```

##### Testing

- [ ] Test: generateResponse distribuye correctamente
- [ ] Test: Query se guarda en historial
- [ ] Test: Cleanup elimina registros antiguos
- [ ] Test: Stats calculan correctamente
- [ ] Test: Interpretación genera texto

---

#### 🎯 Criterios de Aceptación

- [ ] Servicio genera respuestas con distribución correcta
- [ ] Historial respeta límites por tipo de usuario
- [ ] Interpretaciones varían por fase lunar
- [ ] Estadísticas calculan totales por respuesta

# Backend: Endpoints

---

### TASK-503: Crear endpoints del Péndulo

**Módulo:** `src/modules/pendulum/infrastructure/controllers/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-502

---

#### 📋 Descripción

Implementar endpoints REST para el péndulo digital.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/pendulum/infrastructure/controllers/pendulum.controller.ts`

**Endpoints:**

| Método | Ruta                      | Descripción                | Auth     |
| ------ | ------------------------- | -------------------------- | -------- |
| GET    | `/pendulum/styles`        | Listar estilos disponibles | No       |
| POST   | `/pendulum/query`         | Consultar el péndulo       | Opcional |
| GET    | `/pendulum/history`       | Mi historial de consultas  | Sí       |
| GET    | `/pendulum/history/stats` | Mis estadísticas           | Sí       |
| DELETE | `/pendulum/history/:id`   | Eliminar consulta          | Sí       |

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `pendulum.controller.ts`:

  ```typescript
  import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
  } from "@nestjs/common";
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
  import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
  import { OptionalAuthGuard } from "@/common/guards/optional-auth.guard";
  import { CurrentUser } from "@/common/decorators/current-user.decorator";
  import { User } from "@/modules/users/entities/user.entity";
  import { PendulumService } from "../application/services/pendulum.service";
  import { PendulumHistoryService } from "../application/services/pendulum-history.service";
  import {
    PendulumQueryDto,
    PendulumQueryResponseDto,
    PendulumStyleDto,
    PendulumHistoryItemDto,
  } from "../application/dto";
  import { PendulumResponse } from "../enums/pendulum.enums";

  @ApiTags("Pendulum")
  @Controller("pendulum")
  export class PendulumController {
    constructor(
      private readonly pendulumService: PendulumService,
      private readonly historyService: PendulumHistoryService,
    ) {}

    /**
     * GET /pendulum/styles
     * Obtener estilos de péndulo disponibles
     */
    @Get("styles")
    @ApiOperation({ summary: "Listar estilos de péndulo" })
    @ApiResponse({ status: 200, type: [PendulumStyleDto] })
    async getStyles(): Promise<PendulumStyleDto[]> {
      return this.pendulumService.getStyles();
    }

    /**
     * POST /pendulum/query
     * Consultar el péndulo
     */
    @Post("query")
    @UseGuards(OptionalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Consultar el péndulo" })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, type: PendulumQueryResponseDto })
    async query(@Body() dto: PendulumQueryDto, @CurrentUser() user?: User): Promise<PendulumQueryResponseDto> {
      const isPremium = user?.subscription === "premium"; // Ajustar según modelo de usuario
      return this.pendulumService.query(dto, user?.id, isPremium);
    }

    /**
     * GET /pendulum/history
     * Obtener historial de consultas
     */
    @Get("history")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener mi historial de consultas" })
    @ApiQuery({ name: "limit", required: false, type: Number })
    @ApiQuery({ name: "response", required: false, enum: PendulumResponse })
    @ApiResponse({ status: 200, type: [PendulumHistoryItemDto] })
    async getHistory(
      @CurrentUser() user: User,
      @Query("limit") limit?: number,
      @Query("response") response?: PendulumResponse,
    ): Promise<PendulumHistoryItemDto[]> {
      return this.historyService.getUserHistory(user.id, limit, response);
    }

    /**
     * GET /pendulum/history/stats
     * Obtener estadísticas del usuario
     */
    @Get("history/stats")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener mis estadísticas de consultas" })
    @ApiResponse({
      status: 200,
      schema: {
        type: "object",
        properties: {
          total: { type: "number" },
          yesCount: { type: "number" },
          noCount: { type: "number" },
          maybeCount: { type: "number" },
        },
      },
    })
    async getStats(@CurrentUser() user: User) {
      return this.historyService.getUserStats(user.id);
    }

    /**
     * DELETE /pendulum/history/:id
     * Eliminar consulta del historial
     */
    @Delete("history/:id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: "Eliminar consulta del historial" })
    @ApiResponse({ status: 204, description: "Consulta eliminada" })
    @ApiResponse({ status: 404, description: "Consulta no encontrada" })
    async deleteQuery(@CurrentUser() user: User, @Param("id", ParseIntPipe) queryId: number): Promise<void> {
      const deleted = await this.historyService.deleteQuery(user.id, queryId);
      if (!deleted) {
        throw new Error("Consulta no encontrada");
      }
    }
  }
  ```

- [ ] Crear `pendulum.module.ts`:

  ```typescript
  import { Module } from "@nestjs/common";
  import { TypeOrmModule } from "@nestjs/typeorm";
  import { PendulumStyle } from "./entities/pendulum-style.entity";
  import { PendulumQuery } from "./entities/pendulum-query.entity";
  import { PendulumService } from "./application/services/pendulum.service";
  import { PendulumHistoryService } from "./application/services/pendulum-history.service";
  import { PendulumInterpretationService } from "./application/services/pendulum-interpretation.service";
  import { PendulumController } from "./infrastructure/controllers/pendulum.controller";
  import { RitualsModule } from "@/modules/rituals/rituals.module";

  @Module({
    imports: [
      TypeOrmModule.forFeature([PendulumStyle, PendulumQuery]),
      RitualsModule, // Para LunarPhaseService
    ],
    providers: [PendulumService, PendulumHistoryService, PendulumInterpretationService],
    controllers: [PendulumController],
    exports: [PendulumService],
  })
  export class PendulumModule {}
  ```

- [ ] Registrar en `app.module.ts`

##### Testing

- [ ] Test e2e: GET /pendulum/styles retorna lista
- [ ] Test e2e: POST /pendulum/query retorna respuesta
- [ ] Test e2e: POST /pendulum/query guarda si auth
- [ ] Test e2e: POST /pendulum/query funciona sin auth
- [ ] Test e2e: GET /pendulum/history requiere auth
- [ ] Test e2e: GET /pendulum/history/stats retorna conteos
- [ ] Test e2e: DELETE /pendulum/history/:id elimina
- [ ] Test e2e: DELETE /pendulum/history/:id ajeno falla

---

#### 🎯 Criterios de Aceptación

- [ ] Endpoints funcionan correctamente
- [ ] Query funciona con y sin autenticación
- [ ] Historial solo accesible con auth
- [ ] Estadísticas calculan correctamente
- [ ] Documentación Swagger completa

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El endpoint POST /query usa OptionalAuthGuard
> - Si el usuario está autenticado, se guarda en historial
> - Si no está autenticado, solo retorna la respuesta
> - La interpretación requiere que se envíe `requestInterpretation: true`
> - El módulo depende de RitualsModule para LunarPhaseService

# Frontend: Types, API y Hooks

---

### TASK-504: Crear tipos TypeScript para Péndulo

**Módulo:** `frontend/src/types/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-503

---

#### 📋 Descripción

Crear los tipos TypeScript, funciones de API y hooks para el módulo del péndulo.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/types/pendulum.types.ts`
- `frontend/src/lib/api/pendulum-api.ts`
- `frontend/src/hooks/api/usePendulum.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `pendulum.types.ts`:

  ```typescript
  // Enums
  export enum PendulumResponse {
    YES = "yes",
    NO = "no",
    MAYBE = "maybe",
  }

  export enum PendulumMovement {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    CIRCULAR = "circular",
  }

  export enum PendulumStyleType {
    CRYSTAL_QUARTZ = "crystal_quartz",
    AMETHYST = "amethyst",
    OBSIDIAN = "obsidian",
    COPPER = "copper",
    WOOD = "wood",
    GOLD = "gold",
    ROSE_QUARTZ = "rose_quartz",
    LAPIS_LAZULI = "lapis_lazuli",
  }

  // Interfaces
  export interface PendulumStyle {
    id: number;
    type: PendulumStyleType;
    name: string;
    nameEs: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    glowColor: string | null;
    hasGlow: boolean;
    isTransparent: boolean;
    chainColor: string;
    isPremium: boolean;
  }

  export interface PendulumQueryRequest {
    question?: string;
    style?: PendulumStyleType;
    requestInterpretation?: boolean;
  }

  export interface PendulumQueryResponse {
    response: PendulumResponse;
    movement: PendulumMovement;
    responseText: string;
    interpretation: string | null;
    queryId: number | null;
    lunarPhase: string;
    lunarPhaseName: string;
  }

  export interface PendulumHistoryItem {
    id: number;
    question: string | null;
    response: PendulumResponse;
    styleUsed: PendulumStyleType;
    lunarPhase: string | null;
    interpretation: string | null;
    createdAt: string;
  }

  export interface PendulumStats {
    total: number;
    yesCount: number;
    noCount: number;
    maybeCount: number;
  }

  // Helpers de UI
  export const RESPONSE_INFO: Record<
    PendulumResponse,
    {
      text: string;
      color: string;
      bgColor: string;
      emoji: string;
    }
  > = {
    [PendulumResponse.YES]: {
      text: "Sí",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      emoji: "✓",
    },
    [PendulumResponse.NO]: {
      text: "No",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      emoji: "✗",
    },
    [PendulumResponse.MAYBE]: {
      text: "Quizás",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      emoji: "?",
    },
  };

  export const MOVEMENT_DURATION = 4000; // ms de animación
  export const IDLE_SWING_DURATION = 3000; // ms de balanceo en reposo

  // Configuración de animación por movimiento
  export const MOVEMENT_CONFIG: Record<
    PendulumMovement,
    {
      keyframes: string;
      iterations: number;
    }
  > = {
    [PendulumMovement.VERTICAL]: {
      keyframes: "pendulum-vertical",
      iterations: 6,
    },
    [PendulumMovement.HORIZONTAL]: {
      keyframes: "pendulum-horizontal",
      iterations: 6,
    },
    [PendulumMovement.CIRCULAR]: {
      keyframes: "pendulum-circular",
      iterations: 3,
    },
  };
  ```

- [ ] Crear `pendulum-api.ts`:

  ```typescript
  import { apiClient } from "./axios-config";
  import type {
    PendulumStyle,
    PendulumQueryRequest,
    PendulumQueryResponse,
    PendulumHistoryItem,
    PendulumStats,
    PendulumResponse,
  } from "@/types/pendulum.types";

  const BASE_URL = "/pendulum";

  export async function getPendulumStyles(): Promise<PendulumStyle[]> {
    const response = await apiClient.get<PendulumStyle[]>(`${BASE_URL}/styles`);
    return response.data;
  }

  export async function queryPendulum(request: PendulumQueryRequest): Promise<PendulumQueryResponse> {
    const response = await apiClient.post<PendulumQueryResponse>(`${BASE_URL}/query`, request);
    return response.data;
  }

  export async function getPendulumHistory(
    limit?: number,
    filterResponse?: PendulumResponse,
  ): Promise<PendulumHistoryItem[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (filterResponse) params.append("response", filterResponse);

    const url = params.toString() ? `${BASE_URL}/history?${params.toString()}` : `${BASE_URL}/history`;

    const response = await apiClient.get<PendulumHistoryItem[]>(url);
    return response.data;
  }

  export async function getPendulumStats(): Promise<PendulumStats> {
    const response = await apiClient.get<PendulumStats>(`${BASE_URL}/history/stats`);
    return response.data;
  }

  export async function deletePendulumQuery(queryId: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/history/${queryId}`);
  }
  ```

- [ ] Crear `usePendulum.ts`:

  ```typescript
  "use client";

  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import {
    getPendulumStyles,
    queryPendulum,
    getPendulumHistory,
    getPendulumStats,
    deletePendulumQuery,
  } from "@/lib/api/pendulum-api";
  import type { PendulumQueryRequest, PendulumResponse } from "@/types/pendulum.types";

  export const pendulumKeys = {
    all: ["pendulum"] as const,
    styles: () => [...pendulumKeys.all, "styles"] as const,
    history: (limit?: number, filter?: PendulumResponse) =>
      [...pendulumKeys.all, "history", { limit, filter }] as const,
    stats: () => [...pendulumKeys.all, "stats"] as const,
  };

  /**
   * Hook para obtener estilos de péndulo
   */
  export function usePendulumStyles() {
    return useQuery({
      queryKey: pendulumKeys.styles(),
      queryFn: getPendulumStyles,
      staleTime: 1000 * 60 * 60 * 24, // 24 horas (casi nunca cambia)
    });
  }

  /**
   * Hook para consultar el péndulo
   */
  export function usePendulumQuery() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (request: PendulumQueryRequest) => queryPendulum(request),
      onSuccess: () => {
        // Invalidar historial y stats cuando se hace una consulta
        queryClient.invalidateQueries({ queryKey: [...pendulumKeys.all, "history"] });
        queryClient.invalidateQueries({ queryKey: pendulumKeys.stats() });
      },
    });
  }

  /**
   * Hook para obtener historial
   */
  export function usePendulumHistory(limit?: number, filter?: PendulumResponse) {
    return useQuery({
      queryKey: pendulumKeys.history(limit, filter),
      queryFn: () => getPendulumHistory(limit, filter),
    });
  }

  /**
   * Hook para obtener estadísticas
   */
  export function usePendulumStats() {
    return useQuery({
      queryKey: pendulumKeys.stats(),
      queryFn: getPendulumStats,
    });
  }

  /**
   * Hook para eliminar consulta
   */
  export function useDeletePendulumQuery() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (queryId: number) => deletePendulumQuery(queryId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [...pendulumKeys.all, "history"] });
        queryClient.invalidateQueries({ queryKey: pendulumKeys.stats() });
      },
    });
  }

  /**
   * Hook para manejar el estado local del péndulo (sin persistencia)
   */
  export function usePendulumState() {
    const { data: styles } = usePendulumStyles();
    const queryMutation = usePendulumQuery();

    return {
      styles: styles || [],
      query: queryMutation.mutateAsync,
      isQuerying: queryMutation.isPending,
      lastResponse: queryMutation.data,
      error: queryMutation.error,
      reset: queryMutation.reset,
    };
  }
  ```

- [ ] Exportar desde `types/index.ts`

##### Testing

- [ ] Test: Tipos se exportan correctamente
- [ ] Test: API functions hacen llamadas correctas
- [ ] Test: usePendulumQuery invalida historial
- [ ] Test: usePendulumStyles cachea 24h
- [ ] Test: useDeletePendulumQuery funciona

---

#### 🎯 Criterios de Aceptación

- [ ] Tipos completos para todas las entidades
- [ ] API functions cubren todos los endpoints
- [ ] Hooks con manejo de cache apropiado
- [ ] Helpers de UI para colores y textos
- [ ] Configuración de animaciones exportada

---

## PAUSA PARA CONFIRMACIÓN

He completado las **primeras 5 partes del Módulo Péndulo Digital**:

| Archivo      | Contenido                   | Tareas           |
| ------------ | --------------------------- | ---------------- |
| **PARTE-6A** | Historias de Usuario        | HU-PEN-001 a 005 |
| **PARTE-6B** | Backend: Entidades y Seeder | TASK-500, 501    |
| **PARTE-6C** | Backend: Servicios          | TASK-502         |
| **PARTE-6D** | Backend: Endpoints          | TASK-503         |
| **PARTE-6E** | Frontend: Types y Hooks     | TASK-504         |

---

**Partes pendientes (6F-6J):**

- **6F:** Frontend Componentes Péndulo (animación, canvas)
- **6G:** Frontend Componentes UI (controles, historial)
- **6H:** Frontend Modo Meditativo
- **6I:** Frontend Páginas
- **6J:** Esquema de Datos y Resumen

---

# Frontend: Componentes del Péndulo (Animación)

---

### TASK-505: Crear componentes de animación del péndulo

**Módulo:** `frontend/src/components/features/pendulum/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-504

---

#### 📋 Descripción

Crear los componentes principales del péndulo con animaciones CSS y física realista.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/pendulum/
├── index.ts
├── Pendulum.tsx
├── PendulumChain.tsx
├── PendulumGem.tsx
├── PendulumAnimation.css
├── usePendulumAnimation.ts
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `PendulumAnimation.css`:

  ```css
  /* Animaciones del péndulo */

  /* Balanceo suave en reposo */
  @keyframes pendulum-idle {
    0%,
    100% {
      transform: rotate(-3deg);
    }
    50% {
      transform: rotate(3deg);
    }
  }

  /* Movimiento vertical (Sí) */
  @keyframes pendulum-vertical {
    0%,
    100% {
      transform: rotate(0deg) translateY(0);
    }
    25% {
      transform: rotate(-2deg) translateY(-15px);
    }
    50% {
      transform: rotate(0deg) translateY(0);
    }
    75% {
      transform: rotate(2deg) translateY(15px);
    }
  }

  /* Movimiento horizontal (No) */
  @keyframes pendulum-horizontal {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-25deg);
    }
    75% {
      transform: rotate(25deg);
    }
  }

  /* Movimiento circular (Quizás) */
  @keyframes pendulum-circular {
    0% {
      transform: rotate(0deg) translateX(0);
    }
    25% {
      transform: rotate(15deg) translateX(10px);
    }
    50% {
      transform: rotate(0deg) translateX(0);
    }
    75% {
      transform: rotate(-15deg) translateX(-10px);
    }
    100% {
      transform: rotate(0deg) translateX(0);
    }
  }

  /* Transición inicial aleatoria */
  @keyframes pendulum-searching {
    0%,
    100% {
      transform: rotate(-5deg);
    }
    20% {
      transform: rotate(8deg);
    }
    40% {
      transform: rotate(-12deg);
    }
    60% {
      transform: rotate(6deg);
    }
    80% {
      transform: rotate(-8deg);
    }
  }

  /* Efecto de brillo para gemas */
  @keyframes gem-glow {
    0%,
    100% {
      filter: brightness(1) drop-shadow(0 0 5px var(--glow-color, transparent));
    }
    50% {
      filter: brightness(1.2) drop-shadow(0 0 15px var(--glow-color, transparent));
    }
  }

  /* Clases de animación */
  .pendulum-idle {
    animation: pendulum-idle 3s ease-in-out infinite;
    transform-origin: top center;
  }

  .pendulum-searching {
    animation: pendulum-searching 1.5s ease-in-out infinite;
    transform-origin: top center;
  }

  .pendulum-vertical {
    animation: pendulum-vertical 0.6s ease-in-out;
    animation-iteration-count: 6;
    transform-origin: top center;
  }

  .pendulum-horizontal {
    animation: pendulum-horizontal 0.6s ease-in-out;
    animation-iteration-count: 6;
    transform-origin: top center;
  }

  .pendulum-circular {
    animation: pendulum-circular 1.2s ease-in-out;
    animation-iteration-count: 3;
    transform-origin: top center;
  }

  .gem-glowing {
    animation: gem-glow 2s ease-in-out infinite;
  }
  ```

- [ ] Crear `usePendulumAnimation.ts`:

  ```typescript
  "use client";

  import { useState, useCallback, useRef } from "react";
  import { PendulumMovement, MOVEMENT_DURATION } from "@/types/pendulum.types";

  export type PendulumState = "idle" | "searching" | "moving" | "revealed";

  interface UsePendulumAnimationReturn {
    state: PendulumState;
    currentMovement: PendulumMovement | null;
    animationClass: string;
    startSearching: () => void;
    revealAnswer: (movement: PendulumMovement) => Promise<void>;
    reset: () => void;
  }

  export function usePendulumAnimation(): UsePendulumAnimationReturn {
    const [state, setState] = useState<PendulumState>("idle");
    const [currentMovement, setCurrentMovement] = useState<PendulumMovement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimeouts = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const startSearching = useCallback(() => {
      clearTimeouts();
      setState("searching");
      setCurrentMovement(null);
    }, []);

    const revealAnswer = useCallback(async (movement: PendulumMovement): Promise<void> => {
      return new Promise((resolve) => {
        setState("moving");
        setCurrentMovement(movement);

        // Esperar a que termine la animación
        timeoutRef.current = setTimeout(() => {
          setState("revealed");
          resolve();
        }, MOVEMENT_DURATION);
      });
    }, []);

    const reset = useCallback(() => {
      clearTimeouts();
      setState("idle");
      setCurrentMovement(null);
    }, []);

    const getAnimationClass = (): string => {
      switch (state) {
        case "idle":
          return "pendulum-idle";
        case "searching":
          return "pendulum-searching";
        case "moving":
        case "revealed":
          if (currentMovement === PendulumMovement.VERTICAL) return "pendulum-vertical";
          if (currentMovement === PendulumMovement.HORIZONTAL) return "pendulum-horizontal";
          if (currentMovement === PendulumMovement.CIRCULAR) return "pendulum-circular";
          return "pendulum-idle";
        default:
          return "pendulum-idle";
      }
    };

    return {
      state,
      currentMovement,
      animationClass: getAnimationClass(),
      startSearching,
      revealAnswer,
      reset,
    };
  }
  ```

- [ ] Crear `PendulumGem.tsx`:

  ```tsx
  "use client";

  import { cn } from "@/lib/utils";
  import type { PendulumStyle } from "@/types/pendulum.types";

  interface PendulumGemProps {
    style: PendulumStyle;
    isGlowing?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
  }

  const SIZE_MAP = {
    sm: "w-8 h-12",
    md: "w-12 h-18",
    lg: "w-16 h-24",
  };

  export function PendulumGem({ style, isGlowing = false, size = "md", className }: PendulumGemProps) {
    const sizeClass = SIZE_MAP[size];

    return (
      <div
        className={cn("relative", sizeClass, isGlowing && style.hasGlow && "gem-glowing", className)}
        style={
          {
            "--glow-color": style.glowColor || "transparent",
          } as React.CSSProperties
        }
      >
        {/* Forma de la gema (hexágono/cristal) */}
        <svg
          viewBox="0 0 40 60"
          className="w-full h-full"
          style={{ filter: style.hasGlow ? `drop-shadow(0 0 8px ${style.glowColor})` : undefined }}
        >
          <defs>
            {/* Gradiente para la gema */}
            <linearGradient id={`gem-gradient-${style.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={style.primaryColor} />
              <stop offset="50%" stopColor={style.secondaryColor} />
              <stop offset="100%" stopColor={style.primaryColor} />
            </linearGradient>

            {/* Brillo interno para gemas transparentes */}
            {style.isTransparent && (
              <radialGradient id={`gem-shine-${style.type}`} cx="30%" cy="30%">
                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            )}
          </defs>

          {/* Forma de cristal */}
          <path
            d="M20 0 L38 15 L38 45 L20 60 L2 45 L2 15 Z"
            fill={`url(#gem-gradient-${style.type})`}
            stroke={style.secondaryColor}
            strokeWidth="1"
            opacity={style.isTransparent ? 0.85 : 1}
          />

          {/* Facetas del cristal */}
          <path
            d="M20 0 L20 60 M2 15 L38 45 M38 15 L2 45"
            stroke={style.secondaryColor}
            strokeWidth="0.5"
            opacity="0.3"
            fill="none"
          />

          {/* Brillo */}
          {style.isTransparent && <ellipse cx="14" cy="18" rx="6" ry="8" fill={`url(#gem-shine-${style.type})`} />}
        </svg>
      </div>
    );
  }
  ```

- [ ] Crear `PendulumChain.tsx`:

  ```tsx
  "use client";

  import { cn } from "@/lib/utils";

  interface PendulumChainProps {
    color: string;
    length?: number;
    className?: string;
  }

  const CHAIN_COLORS: Record<string, string> = {
    silver: "#C0C0C0",
    gold: "#FFD700",
    copper: "#B87333",
    black: "#1A1A1A",
    brown: "#8B4513",
    rose_gold: "#B76E79",
  };

  export function PendulumChain({ color, length = 120, className }: PendulumChainProps) {
    const chainColor = CHAIN_COLORS[color] || color;
    const linkCount = Math.floor(length / 8);

    return (
      <div className={cn("flex flex-col items-center", className)} style={{ height: length }}>
        {/* Punto de anclaje */}
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chainColor }} />

        {/* Eslabones de la cadena */}
        <svg width="12" height={length - 10} viewBox={`0 0 12 ${length - 10}`} className="overflow-visible">
          {Array.from({ length: linkCount }).map((_, i) => (
            <ellipse key={i} cx="6" cy={i * 8 + 4} rx="3" ry="4" fill="none" stroke={chainColor} strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    );
  }
  ```

- [ ] Crear `Pendulum.tsx`:

  ```tsx
  "use client";

  import { forwardRef } from "react";
  import { PendulumChain } from "./PendulumChain";
  import { PendulumGem } from "./PendulumGem";
  import { cn } from "@/lib/utils";
  import type { PendulumStyle } from "@/types/pendulum.types";
  import "./PendulumAnimation.css";

  interface PendulumProps {
    style: PendulumStyle;
    animationClass?: string;
    isGlowing?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
  }

  const SIZE_CONFIG = {
    sm: { chainLength: 80, gemSize: "sm" as const },
    md: { chainLength: 120, gemSize: "md" as const },
    lg: { chainLength: 160, gemSize: "lg" as const },
  };

  export const Pendulum = forwardRef<HTMLDivElement, PendulumProps>(function Pendulum(
    { style, animationClass = "pendulum-idle", isGlowing = false, size = "md", className },
    ref,
  ) {
    const config = SIZE_CONFIG[size];

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center", animationClass, className)}
        style={{ transformOrigin: "top center" }}
      >
        <PendulumChain color={style.chainColor} length={config.chainLength} />
        <PendulumGem style={style} isGlowing={isGlowing} size={config.gemSize} />
      </div>
    );
  });
  ```

- [ ] Crear `PendulumDisplay.tsx` (componente contenedor):

  ```tsx
  "use client";

  import { Pendulum } from "./Pendulum";
  import { usePendulumAnimation } from "./usePendulumAnimation";
  import { cn } from "@/lib/utils";
  import type { PendulumStyle, PendulumMovement, PendulumResponse } from "@/types/pendulum.types";
  import { RESPONSE_INFO } from "@/types/pendulum.types";

  interface PendulumDisplayProps {
    style: PendulumStyle;
    onQuery: () => Promise<{ movement: PendulumMovement; response: PendulumResponse }>;
    className?: string;
  }

  export function PendulumDisplay({ style, onQuery, className }: PendulumDisplayProps) {
    const { state, animationClass, startSearching, revealAnswer, reset } = usePendulumAnimation();

    const [response, setResponse] = useState<PendulumResponse | null>(null);

    const handleConsult = async () => {
      setResponse(null);
      startSearching();

      // Esperar un momento para el efecto visual
      await new Promise((r) => setTimeout(r, 2000));

      // Obtener respuesta del backend
      const result = await onQuery();

      // Animar hacia la respuesta
      await revealAnswer(result.movement);
      setResponse(result.response);
    };

    const handleReset = () => {
      reset();
      setResponse(null);
    };

    const responseInfo = response ? RESPONSE_INFO[response] : null;

    return (
      <div className={cn("flex flex-col items-center", className)}>
        {/* Área del péndulo */}
        <div className="relative h-[280px] flex items-start justify-center pt-4">
          {/* Punto de soporte */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-muted rounded-b-full" />

          <Pendulum style={style} animationClass={animationClass} isGlowing={state === "revealed"} size="lg" />
        </div>

        {/* Respuesta */}
        {responseInfo && state === "revealed" && (
          <div
            className={cn(
              "mt-4 px-8 py-4 rounded-full text-2xl font-serif",
              responseInfo.bgColor,
              responseInfo.color,
              "animate-in fade-in zoom-in duration-500",
            )}
          >
            {responseInfo.text}
          </div>
        )}

        {/* Estado de búsqueda */}
        {state === "searching" && <p className="mt-4 text-muted-foreground animate-pulse">Consultando al péndulo...</p>}
      </div>
    );
  }
  ```

- [ ] Crear `index.ts`:
  ```typescript
  export { Pendulum } from "./Pendulum";
  export { PendulumGem } from "./PendulumGem";
  export { PendulumChain } from "./PendulumChain";
  export { PendulumDisplay } from "./PendulumDisplay";
  export { usePendulumAnimation } from "./usePendulumAnimation";
  export type { PendulumState } from "./usePendulumAnimation";
  ```

##### Testing

- [ ] Test: Animaciones se aplican correctamente
- [ ] Test: Transiciones entre estados funcionan
- [ ] Test: Gema muestra colores del estilo
- [ ] Test: Cadena renderiza con color correcto
- [ ] Test: usePendulumAnimation maneja estados

---

#### 🎯 Criterios de Aceptación

- [ ] Péndulo se balancea suavemente en idle
- [ ] Animación de búsqueda es errática
- [ ] Movimiento vertical para "Sí"
- [ ] Movimiento horizontal para "No"
- [ ] Movimiento circular para "Quizás"
- [ ] Gemas transparentes tienen brillo
- [ ] Cadena se adapta al estilo

# Frontend: Componentes de UI (Controles y Selectores)

---

### TASK-506: Crear componentes de controles del péndulo

**Módulo:** `frontend/src/components/features/pendulum/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-505

---

#### 📋 Descripción

Crear componentes de interfaz: selector de estilos, campo de pregunta, historial y estadísticas.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/pendulum/
├── StyleSelector.tsx
├── QuestionInput.tsx
├── PendulumControls.tsx
├── HistoryList.tsx
├── PendulumStats.tsx
├── ResponseDisplay.tsx
├── PendulumSkeleton.tsx
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `StyleSelector.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { Check, Lock } from "lucide-react";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { PendulumGem } from "./PendulumGem";
  import { cn } from "@/lib/utils";
  import { useAuthStore } from "@/stores/authStore";
  import type { PendulumStyle, PendulumStyleType } from "@/types/pendulum.types";

  interface StyleSelectorProps {
    styles: PendulumStyle[];
    selected: PendulumStyleType;
    onSelect: (type: PendulumStyleType) => void;
  }

  export function StyleSelector({ styles, selected, onSelect }: StyleSelectorProps) {
    const [open, setOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();

    const selectedStyle = styles.find((s) => s.type === selected);

    const handleSelect = (style: PendulumStyle) => {
      if (style.isPremium && !isAuthenticated) {
        // TODO: Mostrar modal de login
        return;
      }
      onSelect(style.type);
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            {selectedStyle && (
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedStyle.primaryColor }} />
            )}
            {selectedStyle?.nameEs || "Seleccionar estilo"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Elige tu péndulo</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="grid grid-cols-2 gap-4">
              {styles.map((style) => {
                const isLocked = style.isPremium && !isAuthenticated;
                const isSelected = style.type === selected;

                return (
                  <button
                    key={style.type}
                    onClick={() => handleSelect(style)}
                    disabled={isLocked}
                    className={cn(
                      "relative p-4 rounded-lg border-2 transition-all text-left",
                      isSelected ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted",
                      isLocked && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    {/* Preview de la gema */}
                    <div className="flex justify-center mb-3">
                      <PendulumGem style={style} size="sm" />
                    </div>

                    {/* Info */}
                    <h4 className="font-medium text-sm">{style.nameEs}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{style.description}</p>

                    {/* Indicadores */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
  ```

- [ ] Crear `QuestionInput.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { HelpCircle, X } from "lucide-react";
  import { Textarea } from "@/components/ui/textarea";
  import { Button } from "@/components/ui/button";
  import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
  import { cn } from "@/lib/utils";

  interface QuestionInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
  }

  export function QuestionInput({ value, onChange, disabled = false, className }: QuestionInputProps) {
    const maxLength = 500;
    const remaining = maxLength - value.length;

    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium">Tu pregunta</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Formula una pregunta de sí/no. Si prefieres, puedes dejarla en blanco y formularla mentalmente.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="¿Debo...? ¿Es bueno...? ¿Debería...?"
            maxLength={maxLength}
            disabled={disabled}
            className="min-h-[80px] pr-8 resize-none"
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange("")}
              disabled={disabled}
              className="absolute top-2 right-2 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Opcional - puedes consultar sin escribir</span>
          <span className={cn("text-xs", remaining < 50 ? "text-amber-500" : "text-muted-foreground")}>
            {remaining}
          </span>
        </div>
      </div>
    );
  }
  ```

- [ ] Crear `PendulumControls.tsx`:

  ```tsx
  "use client";

  import { Sparkles, RotateCcw, History } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Switch } from "@/components/ui/switch";
  import { Label } from "@/components/ui/label";
  import { cn } from "@/lib/utils";

  interface PendulumControlsProps {
    onConsult: () => void;
    onReset: () => void;
    onShowHistory?: () => void;
    isConsulting: boolean;
    hasResult: boolean;
    requestInterpretation: boolean;
    onInterpretationChange: (value: boolean) => void;
    isAuthenticated: boolean;
    className?: string;
  }

  export function PendulumControls({
    onConsult,
    onReset,
    onShowHistory,
    isConsulting,
    hasResult,
    requestInterpretation,
    onInterpretationChange,
    isAuthenticated,
    className,
  }: PendulumControlsProps) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Botones principales */}
        <div className="flex justify-center gap-4">
          {!hasResult ? (
            <Button size="lg" onClick={onConsult} disabled={isConsulting} className="gap-2 min-w-[160px]">
              <Sparkles className="h-5 w-5" />
              {isConsulting ? "Consultando..." : "Consultar"}
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={onReset} className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Nueva consulta
            </Button>
          )}

          {isAuthenticated && onShowHistory && (
            <Button variant="outline" size="lg" onClick={onShowHistory}>
              <History className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Opción de interpretación */}
        {!hasResult && (
          <div className="flex items-center justify-center gap-2">
            <Switch id="interpretation" checked={requestInterpretation} onCheckedChange={onInterpretationChange} />
            <Label htmlFor="interpretation" className="text-sm cursor-pointer">
              Incluir interpretación
            </Label>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] Crear `ResponseDisplay.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
  import { RESPONSE_INFO, LUNAR_PHASE_INFO } from "@/types/pendulum.types";
  import type { PendulumQueryResponse } from "@/types/pendulum.types";

  interface ResponseDisplayProps {
    response: PendulumQueryResponse;
    className?: string;
  }

  export function ResponseDisplay({ response, className }: ResponseDisplayProps) {
    const responseInfo = RESPONSE_INFO[response.response];

    return (
      <Card className={cn("p-6 text-center", className)}>
        {/* Respuesta principal */}
        <div
          className={cn(
            "inline-block px-6 py-3 rounded-full text-3xl font-serif mb-4",
            responseInfo.bgColor,
            responseInfo.color,
          )}
        >
          {response.responseText}
        </div>

        {/* Fase lunar */}
        <p className="text-sm text-muted-foreground mb-4">Consultado durante {response.lunarPhaseName}</p>

        {/* Interpretación */}
        {response.interpretation && (
          <div className="mt-4 pt-4 border-t text-left">
            <h4 className="font-medium mb-2">Interpretación</h4>
            <p className="text-muted-foreground text-sm whitespace-pre-line">{response.interpretation}</p>
          </div>
        )}
      </Card>
    );
  }
  ```

- [ ] Crear `HistoryList.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { Trash2, Filter } from "lucide-react";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { cn } from "@/lib/utils";
  import { usePendulumHistory, useDeletePendulumQuery } from "@/hooks/api/usePendulum";
  import { PendulumResponse, RESPONSE_INFO } from "@/types/pendulum.types";

  export function HistoryList() {
    const [filter, setFilter] = useState<PendulumResponse | "all">("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data: history, isLoading } = usePendulumHistory(50, filter === "all" ? undefined : filter);
    const { mutate: deleteQuery, isPending: isDeleting } = useDeletePendulumQuery();

    const handleDelete = () => {
      if (deleteId) {
        deleteQuery(deleteId, {
          onSuccess: () => setDeleteId(null),
        });
      }
    };

    if (isLoading) {
      return <div className="text-center py-8">Cargando historial...</div>;
    }

    return (
      <div className="space-y-4">
        {/* Filtro */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as PendulumResponse | "all")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value={PendulumResponse.YES}>Solo Sí</SelectItem>
              <SelectItem value={PendulumResponse.NO}>Solo No</SelectItem>
              <SelectItem value={PendulumResponse.MAYBE}>Solo Quizás</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista */}
        {history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => {
              const responseInfo = RESPONSE_INFO[item.response];
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            responseInfo.bgColor,
                            responseInfo.color,
                          )}
                        >
                          {responseInfo.text}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {item.question ? (
                        <p className="text-sm">{item.question}</p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">Pregunta mental</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No hay consultas en tu historial</div>
        )}

        {/* Confirmación de eliminar */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar consulta?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  ```

- [ ] Crear `PendulumStats.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { usePendulumStats } from "@/hooks/api/usePendulum";
  import { RESPONSE_INFO, PendulumResponse } from "@/types/pendulum.types";
  import { cn } from "@/lib/utils";

  export function PendulumStats() {
    const { data: stats, isLoading } = usePendulumStats();

    if (isLoading || !stats) {
      return null;
    }

    const items = [
      { label: "Total", value: stats.total, color: "text-foreground" },
      { label: "Sí", value: stats.yesCount, ...RESPONSE_INFO[PendulumResponse.YES] },
      { label: "No", value: stats.noCount, ...RESPONSE_INFO[PendulumResponse.NO] },
      { label: "Quizás", value: stats.maybeCount, ...RESPONSE_INFO[PendulumResponse.MAYBE] },
    ];

    return (
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Tus estadísticas</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          {items.map((item) => (
            <div key={item.label}>
              <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  ```

##### Testing

- [ ] Test: StyleSelector muestra estilos
- [ ] Test: Estilos premium bloqueados sin auth
- [ ] Test: QuestionInput maneja max length
- [ ] Test: HistoryList filtra correctamente
- [ ] Test: PendulumStats muestra conteos

---

#### 🎯 Criterios de Aceptación

- [ ] Selector de estilos funciona
- [ ] Estilos premium requieren auth
- [ ] Campo de pregunta es opcional
- [ ] Historial se puede filtrar
- [ ] Estadísticas muestran totales

# Frontend: Modo Meditativo

---

### TASK-507: Crear componentes del modo meditativo

**Módulo:** `frontend/src/components/features/pendulum/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-505, TASK-506

---

#### 📋 Descripción

Crear el modo meditativo con fondos ambientales, partículas y controles de audio.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/pendulum/
├── MeditativeMode.tsx
├── ParticleBackground.tsx
├── AmbientAudio.tsx
├── MeditativeControls.tsx
├── useMeditativeMode.ts
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `useMeditativeMode.ts`:

  ```typescript
  "use client";

  import { useState, useCallback, useEffect } from "react";

  export type AmbientSound = "silence" | "bowls" | "nature" | "rain";

  interface MeditativeModeState {
    isActive: boolean;
    sound: AmbientSound;
    volume: number;
    isMuted: boolean;
  }

  interface UseMeditativeModeReturn extends MeditativeModeState {
    toggle: () => void;
    setSound: (sound: AmbientSound) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    activate: () => void;
    deactivate: () => void;
  }

  const STORAGE_KEY = "pendulum-meditative-settings";

  export function useMeditativeMode(): UseMeditativeModeReturn {
    const [state, setState] = useState<MeditativeModeState>({
      isActive: false,
      sound: "bowls",
      volume: 0.5,
      isMuted: false,
    });

    // Cargar configuración guardada
    useEffect(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setState((prev) => ({
            ...prev,
            sound: parsed.sound || "bowls",
            volume: parsed.volume ?? 0.5,
          }));
        }
      } catch {
        // Ignorar errores de localStorage
      }
    }, []);

    // Guardar configuración
    useEffect(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            sound: state.sound,
            volume: state.volume,
          }),
        );
      } catch {
        // Ignorar errores de localStorage
      }
    }, [state.sound, state.volume]);

    const toggle = useCallback(() => {
      setState((prev) => ({ ...prev, isActive: !prev.isActive }));
    }, []);

    const activate = useCallback(() => {
      setState((prev) => ({ ...prev, isActive: true }));
    }, []);

    const deactivate = useCallback(() => {
      setState((prev) => ({ ...prev, isActive: false }));
    }, []);

    const setSound = useCallback((sound: AmbientSound) => {
      setState((prev) => ({ ...prev, sound }));
    }, []);

    const setVolume = useCallback((volume: number) => {
      setState((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
    }, []);

    const toggleMute = useCallback(() => {
      setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    }, []);

    return {
      ...state,
      toggle,
      setSound,
      setVolume,
      toggleMute,
      activate,
      deactivate,
    };
  }
  ```

- [ ] Crear `ParticleBackground.tsx`:

  ```tsx
  "use client";

  import { useEffect, useRef } from "react";
  import { cn } from "@/lib/utils";

  interface ParticleBackgroundProps {
    isActive: boolean;
    className?: string;
  }

  interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    hue: number;
  }

  export function ParticleBackground({ isActive, className }: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
      if (!isActive) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ajustar tamaño del canvas
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener("resize", resize);

      // Crear partículas iniciales
      const createParticle = (): Particle => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5 - 0.2, // Tendencia hacia arriba
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 220, // Tonos azules/púrpuras
      });

      particlesRef.current = Array.from({ length: 50 }, createParticle);

      // Animación
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((particle, index) => {
          // Actualizar posición
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Reiniciar si sale del canvas
          if (particle.y < -10 || particle.x < -10 || particle.x > canvas.width + 10) {
            particlesRef.current[index] = {
              ...createParticle(),
              y: canvas.height + 10,
            };
          }

          // Dibujar partícula
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`;
          ctx.fill();

          // Efecto de brillo
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity * 0.3})`;
          ctx.fill();
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener("resize", resize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isActive]);

    if (!isActive) return null;

    return <canvas ref={canvasRef} className={cn("fixed inset-0 pointer-events-none z-0", className)} />;
  }
  ```

- [ ] Crear `AmbientAudio.tsx`:

  ```tsx
  "use client";

  import { useEffect, useRef } from "react";
  import type { AmbientSound } from "./useMeditativeMode";

  interface AmbientAudioProps {
    sound: AmbientSound;
    volume: number;
    isMuted: boolean;
    isPlaying: boolean;
  }

  const AUDIO_SOURCES: Record<AmbientSound, string> = {
    silence: "",
    bowls: "/sounds/ambient/singing-bowls.mp3",
    nature: "/sounds/ambient/forest.mp3",
    rain: "/sounds/ambient/rain.mp3",
  };

  export function AmbientAudio({ sound, volume, isMuted, isPlaying }: AmbientAudioProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      if (sound === "silence" || !isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        return;
      }

      const src = AUDIO_SOURCES[sound];
      if (!src) return;

      // Crear o actualizar audio
      if (!audioRef.current || audioRef.current.src !== src) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(src);
        audioRef.current.loop = true;
      }

      audioRef.current.volume = isMuted ? 0 : volume;

      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay puede estar bloqueado
          console.log("Autoplay blocked, waiting for user interaction");
        });
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }, [sound, volume, isMuted, isPlaying]);

    // Actualizar volumen sin recrear audio
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
      }
    }, [volume, isMuted]);

    return null; // Componente invisible
  }
  ```

- [ ] Crear `MeditativeControls.tsx`:

  ```tsx
  "use client";

  import { Moon, Volume2, VolumeX, Music } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Slider } from "@/components/ui/slider";
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { cn } from "@/lib/utils";
  import type { AmbientSound } from "./useMeditativeMode";

  interface MeditativeControlsProps {
    isActive: boolean;
    onToggle: () => void;
    sound: AmbientSound;
    onSoundChange: (sound: AmbientSound) => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    onMuteToggle: () => void;
    className?: string;
  }

  const SOUND_OPTIONS: { value: AmbientSound; label: string }[] = [
    { value: "silence", label: "Silencio" },
    { value: "bowls", label: "Cuencos tibetanos" },
    { value: "nature", label: "Naturaleza" },
    { value: "rain", label: "Lluvia" },
  ];

  export function MeditativeControls({
    isActive,
    onToggle,
    sound,
    onSoundChange,
    volume,
    onVolumeChange,
    isMuted,
    onMuteToggle,
    className,
  }: MeditativeControlsProps) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Botón modo meditativo */}
        <Button variant={isActive ? "default" : "outline"} size="sm" onClick={onToggle} className="gap-2">
          <Moon className={cn("h-4 w-4", isActive && "fill-current")} />
          {isActive ? "Modo activo" : "Modo meditativo"}
        </Button>

        {/* Controles de audio (solo si está activo) */}
        {isActive && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Music className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sonido ambiente</label>
                  <Select value={sound} onValueChange={onSoundChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUND_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {sound !== "silence" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Volumen</label>
                      <Button variant="ghost" size="icon" onClick={onMuteToggle} className="h-8 w-8">
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Slider
                      value={[volume * 100]}
                      onValueChange={([v]) => onVolumeChange(v / 100)}
                      max={100}
                      step={1}
                      disabled={isMuted}
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }
  ```

- [ ] Crear `MeditativeMode.tsx` (wrapper):

  ```tsx
  "use client";

  import { ParticleBackground } from "./ParticleBackground";
  import { AmbientAudio } from "./AmbientAudio";
  import { MeditativeControls } from "./MeditativeControls";
  import { useMeditativeMode } from "./useMeditativeMode";
  import { cn } from "@/lib/utils";

  interface MeditativeModeProps {
    children: React.ReactNode;
    className?: string;
  }

  export function MeditativeMode({ children, className }: MeditativeModeProps) {
    const meditative = useMeditativeMode();

    return (
      <div
        className={cn(
          "relative min-h-screen transition-colors duration-1000",
          meditative.isActive && "bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950",
          className,
        )}
      >
        {/* Fondo de partículas */}
        <ParticleBackground isActive={meditative.isActive} />

        {/* Audio ambiente */}
        <AmbientAudio
          sound={meditative.sound}
          volume={meditative.volume}
          isMuted={meditative.isMuted}
          isPlaying={meditative.isActive}
        />

        {/* Contenido */}
        <div className="relative z-10">{children}</div>

        {/* Controles flotantes */}
        <div className="fixed bottom-4 right-4 z-20">
          <MeditativeControls
            isActive={meditative.isActive}
            onToggle={meditative.toggle}
            sound={meditative.sound}
            onSoundChange={meditative.setSound}
            volume={meditative.volume}
            onVolumeChange={meditative.setVolume}
            isMuted={meditative.isMuted}
            onMuteToggle={meditative.toggleMute}
          />
        </div>
      </div>
    );
  }
  ```

##### Testing

- [ ] Test: Partículas se animan suavemente
- [ ] Test: Audio se reproduce y pausa
- [ ] Test: Volumen se ajusta correctamente
- [ ] Test: Configuración se persiste
- [ ] Test: Modo se activa/desactiva

---

#### 🎯 Criterios de Aceptación

- [ ] Fondo cambia a gradiente oscuro
- [ ] Partículas flotan suavemente
- [ ] Audio ambiente con 3 opciones
- [ ] Controles de volumen funcionan
- [ ] Estado se guarda en localStorage
- [ ] Transiciones suaves

---

#### 📎 Archivos de Audio Necesarios

```
public/sounds/ambient/
├── singing-bowls.mp3  # ~2 min loop
├── forest.mp3         # ~2 min loop
└── rain.mp3           # ~2 min loop
```

**Nota:** Los archivos de audio deben ser loops seamless de ~1-2 MB cada uno.

# Frontend: Páginas

---

### TASK-508: Crear páginas del Péndulo

**Módulo:** `frontend/src/app/pendulo/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-505, TASK-506, TASK-507

---

#### 📋 Descripción

Crear la página principal del péndulo y la página de historial.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/app/pendulo/page.tsx`
- `frontend/src/app/pendulo/historial/page.tsx`

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
    PENDULO: "/pendulo",
    PENDULO_HISTORIAL: "/pendulo/historial",
  } as const;
  ```

- [ ] Crear `app/pendulo/page.tsx`:

  ```tsx
  "use client";

  import { useState, useCallback } from "react";
  import { Info } from "lucide-react";
  import {
    Pendulum,
    PendulumDisplay,
    StyleSelector,
    QuestionInput,
    PendulumControls,
    ResponseDisplay,
    MeditativeMode,
    usePendulumAnimation,
  } from "@/components/features/pendulum";
  import { usePendulumStyles, usePendulumQuery } from "@/hooks/api/usePendulum";
  import { useAuthStore } from "@/stores/authStore";
  import { useToast } from "@/hooks/useToast";
  import { Card } from "@/components/ui/card";
  import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
  import { Button } from "@/components/ui/button";
  import { HistoryList, PendulumStats } from "@/components/features/pendulum";
  import { PendulumStyleType } from "@/types/pendulum.types";
  import type { PendulumQueryResponse } from "@/types/pendulum.types";

  export default function PenduloPage() {
    const { isAuthenticated } = useAuthStore();
    const { toast } = useToast();

    // Estado local
    const [selectedStyle, setSelectedStyle] = useState<PendulumStyleType>(PendulumStyleType.CRYSTAL_QUARTZ);
    const [question, setQuestion] = useState("");
    const [requestInterpretation, setRequestInterpretation] = useState(false);
    const [lastResponse, setLastResponse] = useState<PendulumQueryResponse | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    // Hooks
    const { data: styles, isLoading: loadingStyles } = usePendulumStyles();
    const { mutateAsync: queryPendulum, isPending: isQuerying } = usePendulumQuery();
    const animation = usePendulumAnimation();

    const currentStyle = styles?.find((s) => s.type === selectedStyle) || styles?.[0];

    const handleConsult = useCallback(async () => {
      if (!currentStyle) return;

      setLastResponse(null);
      animation.startSearching();

      try {
        // Esperar un momento para el efecto visual
        await new Promise((r) => setTimeout(r, 2000));

        const response = await queryPendulum({
          question: question || undefined,
          style: selectedStyle,
          requestInterpretation,
        });

        await animation.revealAnswer(response.movement);
        setLastResponse(response);

        if (!isAuthenticated && response.queryId === null) {
          toast({
            title: "Consulta completada",
            description: "Inicia sesión para guardar tu historial",
          });
        }
      } catch (error) {
        animation.reset();
        toast({
          title: "Error",
          description: "No se pudo consultar el péndulo",
          variant: "destructive",
        });
      }
    }, [
      currentStyle,
      question,
      selectedStyle,
      requestInterpretation,
      queryPendulum,
      animation,
      isAuthenticated,
      toast,
    ]);

    const handleReset = () => {
      animation.reset();
      setLastResponse(null);
      setQuestion("");
    };

    if (loadingStyles) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      );
    }

    return (
      <MeditativeMode>
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl mb-2">Péndulo Digital</h1>
            <p className="text-muted-foreground">Formula tu pregunta y deja que el péndulo te guíe</p>
          </div>

          {/* Área del péndulo */}
          <Card className="p-6 mb-6 bg-background/80 backdrop-blur">
            <div className="flex justify-between items-start mb-4">
              {/* Selector de estilo */}
              {styles && <StyleSelector styles={styles} selected={selectedStyle} onSelect={setSelectedStyle} />}

              {/* Info */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cómo usar el péndulo</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                    <p>
                      El péndulo es una herramienta de adivinación que responde preguntas de sí o no mediante el
                      movimiento.
                    </p>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Movimientos:</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>
                          <strong>Vertical (adelante-atrás):</strong> Sí
                        </li>
                        <li>
                          <strong>Horizontal (izquierda-derecha):</strong> No
                        </li>
                        <li>
                          <strong>Circular:</strong> Quizás / Incierto
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Consejos:</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Formula preguntas claras de sí/no</li>
                        <li>Mantén la mente abierta</li>
                        <li>Puedes preguntar mentalmente</li>
                        <li>Activa el modo meditativo para mayor concentración</li>
                      </ul>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Péndulo animado */}
            <div className="relative h-[280px] flex items-start justify-center pt-4 mb-6">
              {/* Soporte */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-muted rounded-b-lg" />

              {currentStyle && (
                <Pendulum
                  style={currentStyle}
                  animationClass={animation.animationClass}
                  isGlowing={animation.state === "revealed"}
                  size="lg"
                />
              )}
            </div>

            {/* Respuesta */}
            {lastResponse && animation.state === "revealed" && (
              <ResponseDisplay response={lastResponse} className="mb-6" />
            )}
          </Card>

          {/* Controles */}
          {!lastResponse && (
            <Card className="p-6 mb-6 bg-background/80 backdrop-blur">
              <QuestionInput value={question} onChange={setQuestion} disabled={isQuerying} className="mb-4" />
            </Card>
          )}

          <PendulumControls
            onConsult={handleConsult}
            onReset={handleReset}
            onShowHistory={() => setShowHistory(true)}
            isConsulting={isQuerying || animation.state === "searching"}
            hasResult={!!lastResponse}
            requestInterpretation={requestInterpretation}
            onInterpretationChange={setRequestInterpretation}
            isAuthenticated={isAuthenticated}
          />

          {/* Estadísticas (solo autenticados) */}
          {isAuthenticated && !lastResponse && (
            <div className="mt-8">
              <PendulumStats />
            </div>
          )}

          {/* Sheet de historial */}
          <Sheet open={showHistory} onOpenChange={setShowHistory}>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Historial de consultas</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <HistoryList />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </MeditativeMode>
    );
  }
  ```

- [ ] Crear `app/pendulo/historial/page.tsx`:

  ```tsx
  "use client";

  import { useEffect } from "react";
  import { useRouter } from "next/navigation";
  import { ArrowLeft } from "lucide-react";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { HistoryList, PendulumStats } from "@/components/features/pendulum";
  import { useAuthStore } from "@/stores/authStore";
  import { ROUTES } from "@/lib/constants/routes";

  export default function PenduloHistorialPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login?redirect=/pendulo/historial");
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={ROUTES.PENDULO}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al péndulo
            </Link>
          </Button>

          <h1 className="font-serif text-4xl mb-2">Mi Historial</h1>
          <p className="text-muted-foreground">Registro de tus consultas al péndulo</p>
        </div>

        {/* Estadísticas */}
        <div className="mb-8">
          <PendulumStats />
        </div>

        {/* Lista de historial */}
        <Card className="p-6">
          <h2 className="font-medium mb-4">Consultas recientes</h2>
          <HistoryList />
        </Card>
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
    { href: "/pendulo", label: "Péndulo" },
    { href: "/lectura", label: "Lectura", requiresAuth: true },
  ];
  ```

- [ ] Agregar exports al index de componentes:
  ```typescript
  // En components/features/pendulum/index.ts
  export { Pendulum } from "./Pendulum";
  export { PendulumGem } from "./PendulumGem";
  export { PendulumChain } from "./PendulumChain";
  export { PendulumDisplay } from "./PendulumDisplay";
  export { usePendulumAnimation } from "./usePendulumAnimation";
  export { StyleSelector } from "./StyleSelector";
  export { QuestionInput } from "./QuestionInput";
  export { PendulumControls } from "./PendulumControls";
  export { ResponseDisplay } from "./ResponseDisplay";
  export { HistoryList } from "./HistoryList";
  export { PendulumStats } from "./PendulumStats";
  export { MeditativeMode } from "./MeditativeMode";
  export { ParticleBackground } from "./ParticleBackground";
  export { AmbientAudio } from "./AmbientAudio";
  export { MeditativeControls } from "./MeditativeControls";
  export { useMeditativeMode } from "./useMeditativeMode";
  export type { PendulumState } from "./usePendulumAnimation";
  export type { AmbientSound } from "./useMeditativeMode";
  ```

##### Testing

- [ ] Test: Página carga estilos
- [ ] Test: Consulta funciona sin auth
- [ ] Test: Consulta guarda con auth
- [ ] Test: Modo meditativo se activa
- [ ] Test: Historial requiere auth
- [ ] Test: Reset limpia estado

---

#### 🎯 Criterios de Aceptación

- [ ] /pendulo muestra péndulo interactivo
- [ ] Consulta funciona con/sin pregunta
- [ ] Modo meditativo disponible
- [ ] /pendulo/historial requiere auth
- [ ] Estadísticas visibles para usuarios auth
- [ ] Link en header funciona
- [ ] Responsive en móvil

# Esquema de Datos, Dependencias y Resumen

---

## ESQUEMA DE DATOS

### Tabla: `pendulum_styles`

```sql
CREATE TYPE pendulum_style_enum AS ENUM (
  'crystal_quartz', 'amethyst', 'obsidian', 'copper',
  'wood', 'gold', 'rose_quartz', 'lapis_lazuli'
);

CREATE TABLE pendulum_styles (
  id SERIAL PRIMARY KEY,
  type pendulum_style_enum UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  name_es VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  primary_color VARCHAR(7) NOT NULL,
  secondary_color VARCHAR(7) NOT NULL,
  glow_color VARCHAR(7),
  has_glow BOOLEAN DEFAULT false,
  is_transparent BOOLEAN DEFAULT false,
  chain_color VARCHAR(20) DEFAULT 'silver',
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `pendulum_queries`

```sql
CREATE TYPE pendulum_response_enum AS ENUM ('yes', 'no', 'maybe');

CREATE TABLE pendulum_queries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT,
  response pendulum_response_enum NOT NULL,
  style_used pendulum_style_enum NOT NULL,
  lunar_phase lunar_phase_enum,
  interpretation TEXT,
  has_ai_interpretation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_user ON pendulum_queries(user_id);
CREATE INDEX idx_query_date ON pendulum_queries(created_at DESC);
```

### Tamaño Estimado

| Tabla            | Registros Iniciales | Crecimiento                 |
| ---------------- | ------------------- | --------------------------- |
| pendulum_styles  | 8                   | Muy bajo (raramente cambia) |
| pendulum_queries | 0                   | ~10 KB / 100 consultas      |

---

## DEPENDENCIAS

### Dependencias npm

**Backend:**

- Ninguna adicional

**Frontend:**

- Ninguna adicional (usa canvas nativo para partículas)

### Variables de Entorno

**Ninguna adicional.**

### Archivos de Audio

```
public/sounds/ambient/
├── singing-bowls.mp3  # ~1-2 MB, loop seamless
├── forest.mp3         # ~1-2 MB, loop seamless
└── rain.mp3           # ~1-2 MB, loop seamless
```

**Notas sobre audio:**

- Deben ser loops seamless (sin corte perceptible)
- Formato MP3 para máxima compatibilidad
- Duración recomendada: 1-2 minutos
- Bitrate: 128kbps es suficiente

---

## RESUMEN DE TAREAS

| Tarea    | Descripción            | Estimación |
| -------- | ---------------------- | ---------- |
| TASK-500 | Entidades y Enums      | 0.5 días   |
| TASK-501 | Migraciones y Seeder   | 0.5 días   |
| TASK-502 | Servicios              | 1 día      |
| TASK-503 | Endpoints              | 0.5 días   |
| TASK-504 | Frontend Types y Hooks | 0.5 días   |
| TASK-505 | Componentes Animación  | 1.5 días   |
| TASK-506 | Componentes UI         | 1 día      |
| TASK-507 | Modo Meditativo        | 1 día      |
| TASK-508 | Páginas                | 1 día      |

**Total:** 7.5 días

---

## ORDEN DE IMPLEMENTACIÓN

```
Semana 1: Backend + Base Frontend
├── TASK-500: Entidades (0.5d)
├── TASK-501: Migraciones y Seeder (0.5d)
├── TASK-502: Servicios (1d)
├── TASK-503: Endpoints (0.5d)
├── TASK-504: Types y Hooks (0.5d)
└── TASK-505: Componentes Animación (1.5d)

Semana 2: Frontend UI
├── TASK-506: Componentes UI (1d)
├── TASK-507: Modo Meditativo (1d)
└── TASK-508: Páginas (1d)
```

---

## CARACTERÍSTICAS TÉCNICAS DESTACADAS

### Animaciones CSS

El péndulo usa animaciones CSS puras para mejor rendimiento:

- `pendulum-idle`: Balanceo suave en reposo
- `pendulum-searching`: Movimiento errático mientras busca
- `pendulum-vertical`: Oscilación adelante-atrás (Sí)
- `pendulum-horizontal`: Oscilación izquierda-derecha (No)
- `pendulum-circular`: Movimiento circular (Quizás)

### Renderizado de Gemas

Las gemas se renderizan con SVG para:

- Escalabilidad sin pérdida de calidad
- Gradientes y efectos de brillo
- Efecto de transparencia para cristales
- Personalización dinámica de colores

### Modo Meditativo

Implementa:

- Canvas 2D para partículas flotantes
- Web Audio API para sonido ambiente
- Persistencia de preferencias en localStorage
- Transiciones CSS suaves

### Generación de Respuestas

Distribución de probabilidades:

- **Sí:** 40%
- **No:** 40%
- **Quizás:** 20%

La respuesta se genera en el backend para consistencia y auditoría.

---

## RIESGOS

| Riesgo                                    | Probabilidad | Impacto | Mitigación                                     |
| ----------------------------------------- | ------------ | ------- | ---------------------------------------------- |
| Audio no reproduce en móvil               | Media        | Bajo    | Requerir interacción del usuario primero       |
| Animaciones lentas en dispositivos viejos | Baja         | Medio   | Usar `will-change` y reducir partículas        |
| Canvas consume mucha batería              | Media        | Bajo    | Desactivar partículas en móvil si es necesario |
| Archivos de audio muy pesados             | Baja         | Bajo    | Optimizar a 128kbps, lazy load                 |

---

## CHECKLIST DE COMPLETITUD

### Backend

- [ ] TASK-500: Entidades creadas
- [ ] TASK-501: 8 estilos insertados
- [ ] TASK-502: Servicios funcionan
- [ ] TASK-503: Endpoints probados

### Frontend

- [ ] TASK-504: Types y hooks
- [ ] TASK-505: Animaciones fluidas
- [ ] TASK-506: Controles de UI
- [ ] TASK-507: Modo meditativo
- [ ] TASK-508: Páginas completas

### Assets

- [ ] 3 archivos de audio ambiente
- [ ] Favicon/icono de péndulo (opcional)

### Testing

- [ ] Tests de generación de respuestas
- [ ] Tests de animaciones (visual)
- [ ] Tests e2e de endpoints
- [ ] Tests de componentes
- [ ] Coverage >80%

---

## NOTAS ADICIONALES

### Accesibilidad

- Describir el movimiento del péndulo con texto
- Permitir reducir movimiento (prefers-reduced-motion)
- Asegurar que controles sean accesibles por teclado
- Proveer alternativa textual al modo meditativo

### SEO

- Title: "Péndulo Digital - Consulta Sí/No | Auguria"
- Description: "Consulta el péndulo digital para obtener respuestas a tus preguntas. Herramienta de adivinación con múltiples estilos de cristales."

### Performance

- Lazy load del modo meditativo
- Defer carga de audio hasta que se active
- Usar requestAnimationFrame para partículas
- Limitar partículas en dispositivos móviles

### Futuras Mejoras

- Respuestas personalizadas con IA
- Más estilos de péndulos
- Compartir consulta en redes
- Modo offline (PWA)
- Vibración háptica en móvil

---

**Fin del Módulo Péndulo Digital**
