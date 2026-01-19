# BACKLOG AUGURIA 2.0 - HORÓSCOPO CHINO

## Historias de Usuario

**Fecha de creación:** 16 de enero de 2026  
**Módulo:** Horóscopo Chino (Anual)  
**Prioridad Global:** 🟡 MEDIA  
**Estimación Total:** 4-5 días (MVP), 5.5 días (con automatización), +1.5 días (HU-HCH-005)  
**Estado MVP:** ✅ COMPLETADO (TASK-111 a TASK-117)  
**Pendiente:** TASK-118 (Cron job anual - Opcional), TASK-119 a TASK-122 (Elemento Wu Xing)

---

## DESCRIPCIÓN GENERAL

El Horóscopo Chino es un sistema basado en ciclos de 12 años, donde cada año está representado por un animal. A diferencia del horóscopo occidental (diario), el chino es **anual** y se genera una vez por año para cada animal.

**Características clave:**

- 12 animales del zodiaco chino
- Generación anual (no diaria)
- Cálculo automático del animal por fecha de nacimiento
- Considera el Año Nuevo Chino (variable, entre enero y febrero)

---

## 1. HISTORIAS DE USUARIO

### HU-HCH-001: Consultar horóscopo chino (Usuario Anónimo)

```gherkin
Feature: Consultar horóscopo chino como usuario anónimo
  Como usuario anónimo
  Quiero consultar el horóscopo chino de cualquier animal
  Para conocer las predicciones del año sin registrarme

  Background:
    Given soy un usuario anónimo navegando en Auguria
    And los horóscopos chinos del año 2026 ya fueron generados

  Scenario: Acceder a la sección de horóscopo chino
    When navego a la sección "Horóscopo Chino"
    Then veo una página con los 12 animales del zodiaco chino
    And cada tarjeta muestra el animal, su nombre y años correspondientes
    And veo información sobre el año actual (2026 - Año de la Serpiente)

  Scenario: Ver horóscopo completo de un animal
    Given estoy en la página de horóscopo chino
    When hago clic en la tarjeta del "Dragón"
    Then veo el horóscopo anual completo del Dragón para 2026
    And veo secciones: Amor, Carrera, Bienestar, Finanzas
    And veo compatibilidades con otros animales
    And veo elementos de suerte (colores, números, direcciones)

  Scenario: Calcular mi animal sin registrarme
    Given estoy en la página de horóscopo chino
    When ingreso mi año de nacimiento "1988" en el calculador
    Then veo que mi animal es "Dragón"
    And veo un botón para ver el horóscopo del Dragón
    And veo un CTA para registrarme y guardar mi animal
```

---

### HU-HCH-002: Horóscopo chino personalizado (Usuario Registrado)

```gherkin
Feature: Ver horóscopo chino personalizado
  Como usuario registrado con fecha de nacimiento
  Quiero ver automáticamente mi horóscopo chino
  Para no tener que calcular mi animal cada vez

  Background:
    Given soy un usuario registrado
    And mi fecha de nacimiento es "1988-03-15" (Dragón)
    And estoy autenticado

  Scenario: Ver mi animal en el dashboard
    When accedo a mi dashboard
    Then veo un widget "Tu Horóscopo Chino 2026"
    And muestra mi animal (Dragón) con su ícono
    And muestra un resumen de las predicciones del año
    And tiene un botón "Ver completo"

  Scenario: Ver detalle de mi horóscopo chino
    Given estoy en mi dashboard
    When hago clic en "Ver completo" del widget chino
    Then navego a /horoscopo-chino/dragon
    And mi animal aparece destacado en el selector

  Scenario: Nacido antes del Año Nuevo Chino
    Given mi fecha de nacimiento es "1988-01-15"
    And el Año Nuevo Chino de 1988 fue el 17 de febrero
    When el sistema calcula mi animal
    Then determina que pertenezco al año 1987 (Conejo)
    And muestra el horóscopo del Conejo, no del Dragón

  Scenario: Usuario sin fecha de nacimiento
    Given no tengo fecha de nacimiento configurada
    When accedo al widget de horóscopo chino
    Then veo mensaje "Configura tu fecha de nacimiento"
    And veo un enlace a mi perfil para configurarla
```

---

### HU-HCH-003: Generación anual de horóscopos chinos (Sistema)

```gherkin
Feature: Generación anual de horóscopos chinos
  Como sistema
  Quiero generar horóscopos chinos una vez al año
  Para tener contenido listo para todo el año

  Background:
    Given es diciembre y se acerca el nuevo año
    And el administrador tiene acceso al panel de admin

  Scenario: Generación manual por admin
    Given soy administrador
    When accedo al panel de generación de contenido
    And selecciono "Generar Horóscopos Chinos 2027"
    Then el sistema genera horóscopos para los 12 animales
    And cada generación incluye predicciones anuales completas
    And se guardan en la base de datos con año 2027

  Scenario: Generación automática pre-año nuevo
    Given es el 15 de diciembre de 2026
    And no existen horóscopos chinos para 2027
    When el cron job de preparación anual se ejecuta
    Then genera los 12 horóscopos para 2027
    And envía notificación al admin confirmando generación

  Scenario: No regenerar si ya existen
    Given ya existen horóscopos chinos para 2027
    When se intenta generar nuevamente
    Then el sistema detecta que ya existen
    And no genera duplicados
    And retorna los existentes
```

---

### HU-HCH-004: Compatibilidad entre animales

```gherkin
Feature: Ver compatibilidad entre animales
  Como usuario
  Quiero ver la compatibilidad de mi animal con otros
  Para entender mis relaciones interpersonales

  Scenario: Ver compatibilidades en el detalle
    Given estoy viendo el horóscopo del Dragón
    Then veo una sección "Compatibilidad"
    And muestra animales más compatibles (Rata, Mono, Gallo)
    And muestra animales menos compatibles (Perro, Conejo)
    And cada compatibilidad tiene una breve explicación

  Scenario: Comparar dos animales específicos
    Given estoy en la página de horóscopo chino
    When selecciono "Dragón" y "Serpiente" para comparar
    Then veo un análisis de compatibilidad detallado
    And muestra porcentaje de compatibilidad
    And muestra áreas fuertes y débiles de la relación
```

---

### HU-HCH-005: Cálculo del Elemento Anual (Wu Xing)

**Módulo:** `src/common/utils` & `src/modules/horoscope`  
**Prioridad:** 🔴 ALTA (Esencial para identidad del usuario)  
**Dependencias:** Extiende TASK-111 y TASK-114  
**Estado:** ⏳ PENDIENTE

```gherkin
Feature: Identificación del Elemento Anual (Wu Xing)
  Como usuario (anónimo o registrado)
  Quiero conocer mi elemento específico según mi año de nacimiento (ej. "Dragón de Tierra")
  Para distinguir mi personalidad astrológica más allá del animal general

  Background:
    Given el sistema utiliza los 5 elementos chinos: Metal, Agua, Madera, Fuego, Tierra
    And el elemento se determina por el último dígito del año chino

  Scenario: Calcular elemento basado en el año
    Given mi fecha de nacimiento es "1988-03-15" (Año Chino 1988)
    And el último dígito del año es 8
    When el sistema calcula mi signo completo
    Then determina que mi elemento anual es "Tierra"
    And mi identidad completa es "Dragón de Tierra"

  Scenario: Distinción entre elemento fijo y variable
    Given soy un "Dragón" (Elemento fijo: Tierra)
    But nací en "2000" (Año del Metal - dígitos 0,0)
    When consulto mi perfil
    Then veo que soy un "Dragón de Metal"
    And el sistema usa "Metal" para personalizar predicciones

  Scenario: Fecha antes del Año Nuevo Chino
    Given mi fecha de nacimiento es "1988-01-15"
    And el Año Nuevo Chino de 1988 fue el 17 de febrero
    When el sistema calcula mi elemento
    Then determina que pertenezco al año chino 1987
    And mi elemento es "Fuego" (1987 termina en 7)
    And mi identidad completa es "Conejo de Fuego"

  Scenario: Ver elemento en respuesta del cálculo
    Given calculo mi animal con fecha "1988-03-15"
    When recibo la respuesta del API
    Then incluye campo "birthElement": "Tierra"
    And incluye campo "fixedElement": "Tierra" (elemento natural del Dragón)
    And incluye campo "fullZodiacType": "Dragón de Tierra"
```

#### Regla de Negocio: Cálculo del Elemento por Dígito

| Último dígito | Elemento |
| ------------- | -------- |
| 0, 1          | Metal    |
| 2, 3          | Agua     |
| 4, 5          | Madera   |
| 6, 7          | Fuego    |
| 8, 9          | Tierra   |

**Nota importante:** El cálculo debe usar el `chineseYear` (ajustado por el Año Nuevo Chino), NO el año gregoriano directo.

---

## 2. INFORMACIÓN DEL ZODIACO CHINO

### Animales y Años Recientes

| Animal    | Emoji | Años Recientes         | Elemento 2024-2035 |
| --------- | ----- | ---------------------- | ------------------ |
| Rata      | 🐀    | 2020, 2008, 1996, 1984 | Metal              |
| Buey      | 🐂    | 2021, 2009, 1997, 1985 | Metal              |
| Tigre     | 🐅    | 2022, 2010, 1998, 1986 | Agua               |
| Conejo    | 🐇    | 2023, 2011, 1999, 1987 | Agua               |
| Dragón    | 🐉    | 2024, 2012, 2000, 1988 | Madera             |
| Serpiente | 🐍    | 2025, 2013, 2001, 1989 | Madera             |
| Caballo   | 🐴    | 2026, 2014, 2002, 1990 | Fuego              |
| Cabra     | 🐐    | 2027, 2015, 2003, 1991 | Fuego              |
| Mono      | 🐒    | 2028, 2016, 2004, 1992 | Tierra             |
| Gallo     | 🐓    | 2029, 2017, 2005, 1993 | Tierra             |
| Perro     | 🐕    | 2030, 2018, 2006, 1994 | Metal              |
| Cerdo     | 🐖    | 2031, 2019, 2007, 1995 | Metal              |

### Fechas del Año Nuevo Chino (Referencia)

El Año Nuevo Chino cae entre el 21 de enero y el 20 de febrero. Ejemplos:

- 2024: 10 de febrero
- 2025: 29 de enero
- 2026: 17 de febrero
- 2027: 6 de febrero

**IMPORTANTE:** Para calcular el animal correctamente, se debe considerar si la persona nació antes o después del Año Nuevo Chino de su año de nacimiento.

# Backend: Entidad y Helper de Cálculo

---

### TASK-111: Crear helper para calcular animal del zodiaco chino

**Módulo:** `src/common/utils/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-100 (birthDate en User)

---

#### 📋 Descripción

Crear funciones utilitarias para calcular el animal del zodiaco chino basado en fecha de nacimiento, considerando las fechas variables del Año Nuevo Chino.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/common/utils/chinese-zodiac.utils.ts`
- `src/common/utils/chinese-zodiac.utils.spec.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear enum `ChineseZodiacAnimal`:

  ```typescript
  export enum ChineseZodiacAnimal {
    RAT = "rat",
    OX = "ox",
    TIGER = "tiger",
    RABBIT = "rabbit",
    DRAGON = "dragon",
    SNAKE = "snake",
    HORSE = "horse",
    GOAT = "goat",
    MONKEY = "monkey",
    ROOSTER = "rooster",
    DOG = "dog",
    PIG = "pig",
  }
  ```

- [x] Crear constante con fechas del Año Nuevo Chino (1950-2050)

- [x] Crear función principal `getChineseZodiacAnimal`

- [x] Crear función `getChineseZodiacInfo`

- [x] Crear constante con información completa de todos los animales

- [x] Crear función `getChineseYear`

- [x] Exportar desde `src/common/utils/index.ts`

##### Testing

- [x] Test: Persona nacida en 1988-03-15 → Dragón
- [x] Test: Persona nacida en 1988-01-15 (antes del CNY) → Conejo
- [x] Test: Persona nacida en 2000-02-05 (exacto CNY) → Dragón
- [x] Test: Ciclo completo de 12 animales
- [x] Test: getChineseZodiacInfo retorna datos correctos
- [x] Test: Compatibilidades correctas

---

#### 🎯 Criterios de Aceptación

- [x] Calcula animal correctamente considerando CNY
- [x] Maneja fechas antes del Año Nuevo Chino
- [x] Información de compatibilidad disponible
- [x] Tests cubren edge cases
- [x] Coverage >90% (100% alcanzado)

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El Año Nuevo Chino varía cada año (21 ene - 20 feb)
> - Si alguien nace el 15 de enero de 1988 y el CNY fue el 17 de febrero, pertenece a 1987
> - El ciclo de 12 años comienza en 1900 con la Rata
> - Incluir fechas del CNY desde 1950 hasta 2050 para máxima cobertura

---

### TASK-112: Crear entidad ChineseHoroscope y migración

**Módulo:** `src/modules/horoscope/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-111  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear la entidad para almacenar horóscopos chinos anuales.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/horoscope/entities/chinese-horoscope.entity.ts`
- `src/database/migrations/XXXX-CreateChineseHoroscopes.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear entidad `ChineseHoroscope`:

  ```typescript
  @Entity("chinese_horoscopes")
  @Index("idx_chinese_animal_year", ["animal", "year"], { unique: true })
  @Index("idx_chinese_year", ["year"])
  export class ChineseHoroscope {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: ChineseZodiacAnimal })
    animal: ChineseZodiacAnimal;

    @Column({ type: "smallint" })
    year: number; // 2026, 2027, etc.

    @Column({ type: "text" })
    generalOverview: string;

    @Column({ type: "jsonb" })
    areas: {
      love: { content: string; rating: number };
      career: { content: string; rating: number };
      wellness: { content: string; rating: number };
      finance: { content: string; rating: number };
    };

    @Column({ type: "jsonb" })
    luckyElements: {
      numbers: number[];
      colors: string[];
      directions: string[];
      months: number[];
    };

    @Column({ type: "jsonb" })
    compatibility: {
      best: ChineseZodiacAnimal[];
      good: ChineseZodiacAnimal[];
      challenging: ChineseZodiacAnimal[];
    };

    @Column({ type: "text", nullable: true })
    monthlyHighlights: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    aiProvider: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    aiModel: string;

    @Column({ type: "int", default: 0 })
    tokensUsed: number;

    @Column({ type: "int", default: 0 })
    viewCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
  }
  ```

- [x] Crear migración:

  ```sql
  CREATE TYPE chinese_zodiac_animal_enum AS ENUM (
    'rat', 'ox', 'tiger', 'rabbit',
    'dragon', 'snake', 'horse', 'goat',
    'monkey', 'rooster', 'dog', 'pig'
  );

  CREATE TABLE chinese_horoscopes (
    id SERIAL PRIMARY KEY,
    animal chinese_zodiac_animal_enum NOT NULL,
    year SMALLINT NOT NULL,
    general_overview TEXT NOT NULL,
    areas JSONB NOT NULL,
    lucky_elements JSONB NOT NULL,
    compatibility JSONB NOT NULL,
    monthly_highlights TEXT,
    ai_provider VARCHAR(50),
    ai_model VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_animal_year UNIQUE (animal, year)
  );

  CREATE INDEX idx_chinese_year ON chinese_horoscopes(year);
  ```

- [x] Ejecutar migración

##### Testing

- [x] Test: Entidad se crea correctamente
- [x] Test: Índice único previene duplicados
- [x] Test: JSONB se guarda y recupera

---

#### 🎯 Criterios de Aceptación

- [x] Migración ejecuta sin errores
- [x] Índice único (animal, year) funciona
- [x] JSONB permite queries complejas

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El campo `year` es SMALLINT (no DATE) porque es anual
> - Las áreas incluyen `career` y `finance` (diferentes al occidental)
> - `compatibility` tiene 3 niveles: best, good, challenging
> - `luckyElements` incluye direcciones (importante en feng shui)

# Backend: Servicio de Generación

---

### TASK-113: Crear servicio de generación de horóscopo chino

**Módulo:** `src/modules/horoscope/application/services/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-112, TASK-102 (Gemini Provider)  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear el servicio para generar horóscopos chinos anuales usando IA.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/horoscope/application/services/chinese-horoscope.service.ts`
- `src/modules/horoscope/application/services/chinese-horoscope.service.spec.ts`
- `src/modules/horoscope/application/prompts/chinese-horoscope.prompts.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear `chinese-horoscope.prompts.ts`:

  ```typescript
  export const CHINESE_HOROSCOPE_SYSTEM_PROMPT = `
  Eres un experto en astrología china con profundo conocimiento del zodiaco chino,
  los cinco elementos y el feng shui.
  
  Tu tarea es generar horóscopos anuales detallados y precisos.
  
  REGLAS:
  1. Considera el elemento del año y cómo afecta al animal
  2. Incluye predicciones específicas por área de vida
  3. Proporciona consejos prácticos y accionables
  4. Menciona meses favorables y desafiantes
  5. Incluye elementos de suerte tradicionales
  
  IMPORTANTE SOBRE BIENESTAR (wellness):
  - NO hagas diagnósticos físicos ni menciones enfermedades
  - Enfócate en: niveles de energía, descanso, manejo del estrés,
    meditación, autocuidado, equilibrio emocional y vitalidad
  - Usa términos como: "energía vital", "armonía interior",
    "momento de pausa", "autocuidado", "equilibrio"
  
  FORMATO DE RESPUESTA (JSON estricto):
  {
    "generalOverview": "Resumen general del año (3-4 oraciones)",
    "areas": {
      "love": { "content": "Predicción amor (3-4 oraciones)", "rating": 8 },
      "career": { "content": "Predicción carrera (3-4 oraciones)", "rating": 7 },
      "wellness": { "content": "Predicción bienestar: energía, descanso, autocuidado (3-4 oraciones)", "rating": 9 },
      "finance": { "content": "Predicción finanzas (3-4 oraciones)", "rating": 6 }
    },
    "luckyElements": {
      "numbers": [3, 7, 9],
      "colors": ["Rojo", "Dorado"],
      "directions": ["Sur", "Este"],
      "months": [3, 6, 9]
    },
    "monthlyHighlights": "Resumen de meses clave del año"
  }
  `;

  export const CHINESE_HOROSCOPE_USER_PROMPT = (
    animal: string,
    year: number,
    animalInfo: ChineseZodiacInfo,
    yearInfo: { element: string; rulingAnimal: string },
  ) => `
  Genera el horóscopo chino anual para ${animalInfo.nameEs} (${animal}) 
  para el año ${year}.
  
  Información del animal:
  - Elemento natural: ${animalInfo.element}
  - Yin/Yang: ${animalInfo.yinYang}
  - Características: ${animalInfo.characteristics.join(", ")}
  
  Información del año ${year}:
  - Animal regente: ${yearInfo.rulingAnimal}
  - Elemento del año: ${yearInfo.element}
  
  Considera cómo interactúan el elemento del animal con el del año.
  Responde SOLO con el JSON, sin texto adicional.
  `;
  ```

- [x] Crear `ChineseHoroscopeService`:

  ````typescript
  @Injectable()
  export class ChineseHoroscopeService {
    private readonly logger = new Logger(ChineseHoroscopeService.name);

    constructor(
      @InjectRepository(ChineseHoroscope)
      private readonly repository: Repository<ChineseHoroscope>,
      private readonly aiProviderService: AIProviderService,
    ) {}

    /**
     * Genera horóscopo chino para un animal y año
     */
    async generateForAnimal(animal: ChineseZodiacAnimal, year: number): Promise<ChineseHoroscope> {
      // Verificar si ya existe
      const existing = await this.findByAnimalAndYear(animal, year);
      if (existing) {
        this.logger.log(`Horóscopo chino ya existe: ${animal} ${year}`);
        return existing;
      }

      const animalInfo = getChineseZodiacInfo(animal);
      const yearInfo = getChineseYearInfo(year);

      const messages: AIMessage[] = [
        { role: "system", content: CHINESE_HOROSCOPE_SYSTEM_PROMPT },
        {
          role: "user",
          content: CHINESE_HOROSCOPE_USER_PROMPT(animal, year, animalInfo, yearInfo),
        },
      ];

      const startTime = Date.now();
      const aiResponse = await this.aiProviderService.generateCompletion(messages, null, null, {
        temperature: 0.7,
        maxTokens: 1500,
      });

      const data = this.parseAIResponse(aiResponse.content);

      // Agregar compatibilidad desde info estática
      const compatibility = {
        best: animalInfo.compatibleWith.slice(0, 2),
        good: animalInfo.compatibleWith.slice(2),
        challenging: animalInfo.incompatibleWith,
      };

      const horoscope = this.repository.create({
        animal,
        year,
        generalOverview: data.generalOverview,
        areas: data.areas,
        luckyElements: data.luckyElements,
        compatibility,
        monthlyHighlights: data.monthlyHighlights,
        aiProvider: aiResponse.provider,
        aiModel: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed.total,
      });

      return this.repository.save(horoscope);
    }

    /**
     * Genera horóscopos para todos los animales de un año
     */
    async generateAllForYear(year: number): Promise<{
      successful: number;
      failed: number;
      results: GenerationResult[];
    }> {
      const animals = Object.values(ChineseZodiacAnimal);
      const results: GenerationResult[] = [];

      // Generar secuencialmente con delay
      for (let i = 0; i < animals.length; i++) {
        const animal = animals[i];

        if (i > 0) {
          await this.delay(5000); // 5s entre cada uno
        }

        try {
          this.logger.log(`[${i + 1}/12] Generando ${animal}...`);
          const horoscope = await this.generateForAnimal(animal, year);
          results.push({ animal, success: true, id: horoscope.id });
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          this.logger.error(`[${i + 1}/12] Falló ${animal}: ${msg}`);
          results.push({ animal, success: false, error: msg });
        }
      }

      return {
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      };
    }

    /**
     * Busca horóscopo por animal y año
     */
    async findByAnimalAndYear(animal: ChineseZodiacAnimal, year: number): Promise<ChineseHoroscope | null> {
      return this.repository.findOne({
        where: { animal, year },
      });
    }

    /**
     * Obtiene todos los horóscopos de un año
     */
    async findAllByYear(year: number): Promise<ChineseHoroscope[]> {
      return this.repository.find({
        where: { year },
        order: { animal: "ASC" },
      });
    }

    /**
     * Obtiene horóscopo para un usuario basado en su birthDate
     */
    async findForUser(birthDate: Date, year: number = new Date().getFullYear()): Promise<ChineseHoroscope | null> {
      const animal = getChineseZodiacAnimal(birthDate);
      return this.findByAnimalAndYear(animal, year);
    }

    /**
     * Incrementa contador de vistas
     */
    async incrementViewCount(id: number): Promise<void> {
      await this.repository
        .createQueryBuilder()
        .update()
        .set({ viewCount: () => "viewCount + 1" })
        .where("id = :id", { id })
        .execute();
    }

    private parseAIResponse(content: string): ChineseHoroscopeAIResponse {
      try {
        const clean = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return JSON.parse(clean);
      } catch (error) {
        this.logger.error("Error parsing AI response:", error);
        throw new InternalServerErrorException("Error al procesar IA");
      }
    }

    private delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  interface GenerationResult {
    animal: ChineseZodiacAnimal;
    success: boolean;
    id?: number;
    error?: string;
  }

  interface ChineseHoroscopeAIResponse {
    generalOverview: string;
    areas: {
      love: { content: string; rating: number };
      career: { content: string; rating: number };
      wellness: { content: string; rating: number };
      finance: { content: string; rating: number };
    };
    luckyElements: {
      numbers: number[];
      colors: string[];
      directions: string[];
      months: number[];
    };
    monthlyHighlights: string;
  }
  ````

- [x] Actualizar `horoscope.module.ts`:
  ```typescript
  @Module({
    imports: [TypeOrmModule.forFeature([DailyHoroscope, ChineseHoroscope]), AIModule],
    providers: [
      HoroscopeGenerationService,
      HoroscopeCronService,
      ChineseHoroscopeService, // 🆕
    ],
    exports: [HoroscopeGenerationService, ChineseHoroscopeService],
  })
  export class HoroscopeModule {}
  ```

##### Testing

- [x] Test: Genera horóscopo correctamente
- [x] Test: No genera duplicados
- [x] Test: generateAllForYear genera 12 horóscopos
- [x] Test: findForUser calcula animal correcto
- [x] Test: Parsea JSON de IA correctamente

---

#### 🎯 Criterios de Aceptación

- [x] Servicio genera horóscopos anuales
- [x] Incluye compatibilidad entre animales
- [x] Método para generar todos los animales
- [x] Tests >80% coverage

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El horóscopo chino es ANUAL, no diario
> - La compatibilidad viene del helper estático, no de IA
> - Delay de 5s entre generaciones para evitar rate limits
> - El prompt considera interacción entre elementos del animal y del año

# Backend: Endpoints

---

### TASK-114: Crear endpoints de Horóscopo Chino

**Módulo:** `src/modules/horoscope/infrastructure/controllers/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-113  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Implementar endpoints REST para consultar horóscopos chinos.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.ts`
- `src/modules/horoscope/application/dto/chinese-horoscope-response.dto.ts`

**Endpoints:**

| Método | Ruta                                      | Descripción                  | Auth  |
| ------ | ----------------------------------------- | ---------------------------- | ----- |
| GET    | `/chinese-horoscope/:year`                | Todos los horóscopos del año | No    |
| GET    | `/chinese-horoscope/:year/:animal`        | Horóscopo específico         | No    |
| GET    | `/chinese-horoscope/my-animal`            | Mi horóscopo                 | Sí    |
| GET    | `/chinese-horoscope/calculate`            | Calcular animal              | No    |
| POST   | `/chinese-horoscope/admin/generate/:year` | Generar año                  | Admin |

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear DTOs:

  ```typescript
  // chinese-horoscope-response.dto.ts
  export class ChineseHoroscopeAreaDto {
    @ApiProperty()
    content: string;

    @ApiProperty({ minimum: 1, maximum: 10 })
    rating: number;
  }

  export class ChineseHoroscopeLuckyDto {
    @ApiProperty({ type: [Number] })
    numbers: number[];

    @ApiProperty({ type: [String] })
    colors: string[];

    @ApiProperty({ type: [String] })
    directions: string[];

    @ApiProperty({ type: [Number] })
    months: number[];
  }

  export class ChineseHoroscopeResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: ChineseZodiacAnimal })
    animal: ChineseZodiacAnimal;

    @ApiProperty()
    year: number;

    @ApiProperty()
    generalOverview: string;

    @ApiProperty()
    areas: {
      love: ChineseHoroscopeAreaDto;
      career: ChineseHoroscopeAreaDto;
      wellness: ChineseHoroscopeAreaDto;
      finance: ChineseHoroscopeAreaDto;
    };

    @ApiProperty()
    luckyElements: ChineseHoroscopeLuckyDto;

    @ApiProperty()
    compatibility: {
      best: ChineseZodiacAnimal[];
      good: ChineseZodiacAnimal[];
      challenging: ChineseZodiacAnimal[];
    };

    @ApiProperty({ nullable: true })
    monthlyHighlights: string | null;
  }

  // calculate-animal.dto.ts
  export class CalculateAnimalDto {
    @ApiProperty({ example: "1988-03-15" })
    @IsDateString()
    birthDate: string;
  }

  export class CalculateAnimalResponseDto {
    @ApiProperty({ enum: ChineseZodiacAnimal })
    animal: ChineseZodiacAnimal;

    @ApiProperty()
    animalInfo: {
      nameEs: string;
      nameEn: string;
      emoji: string;
      element: string;
      characteristics: string[];
    };

    @ApiProperty()
    chineseYear: number;
  }
  ```

- [ ] Crear `ChineseHoroscopeController`:

  ```typescript
  @ApiTags("Chinese Horoscope")
  @Controller("chinese-horoscope")
  export class ChineseHoroscopeController {
    constructor(private readonly chineseService: ChineseHoroscopeService) {}

    /**
     * GET /chinese-horoscope/calculate?birthDate=1988-03-15
     * Calcula el animal del zodiaco chino
     */
    @Get("calculate")
    @ApiOperation({ summary: "Calcular animal del zodiaco chino" })
    @ApiQuery({ name: "birthDate", example: "1988-03-15" })
    @ApiResponse({ status: 200, type: CalculateAnimalResponseDto })
    calculateAnimal(@Query("birthDate") birthDateStr: string): CalculateAnimalResponseDto {
      const birthDate = new Date(birthDateStr);
      if (isNaN(birthDate.getTime())) {
        throw new BadRequestException("Fecha inválida");
      }

      const animal = getChineseZodiacAnimal(birthDate);
      const animalInfo = getChineseZodiacInfo(animal);
      const chineseYear = getChineseYearForDate(birthDate);

      return {
        animal,
        animalInfo: {
          nameEs: animalInfo.nameEs,
          nameEn: animalInfo.nameEn,
          emoji: animalInfo.emoji,
          element: animalInfo.element,
          characteristics: animalInfo.characteristics,
        },
        chineseYear,
      };
    }

    /**
     * GET /chinese-horoscope/my-animal
     * Obtiene el horóscopo del usuario autenticado
     */
    @Get("my-animal")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Mi horóscopo chino" })
    @ApiResponse({ status: 200, type: ChineseHoroscopeResponseDto })
    async getMyAnimalHoroscope(
      @CurrentUser() user: User,
      @Query("year") yearStr?: string,
    ): Promise<ChineseHoroscopeResponseDto> {
      if (!user.birthDate) {
        throw new BadRequestException("Configura tu fecha de nacimiento para ver tu horóscopo");
      }

      const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

      const horoscope = await this.chineseService.findForUser(user.birthDate, year);

      if (!horoscope) {
        throw new NotFoundException("Horóscopo no disponible para este año");
      }

      this.chineseService.incrementViewCount(horoscope.id).catch(() => {});
      return this.toResponseDto(horoscope);
    }

    /**
     * GET /chinese-horoscope/:year
     * Obtiene todos los horóscopos de un año
     */
    @Get(":year")
    @ApiOperation({ summary: "Todos los horóscopos de un año" })
    @ApiParam({ name: "year", example: 2026 })
    @ApiResponse({ status: 200, type: [ChineseHoroscopeResponseDto] })
    async getAllByYear(@Param("year", ParseIntPipe) year: number): Promise<ChineseHoroscopeResponseDto[]> {
      if (year < 2020 || year > 2050) {
        throw new BadRequestException("Año fuera de rango (2020-2050)");
      }

      const horoscopes = await this.chineseService.findAllByYear(year);
      return horoscopes.map(this.toResponseDto);
    }

    /**
     * GET /chinese-horoscope/:year/:animal
     * Obtiene horóscopo específico
     */
    @Get(":year/:animal")
    @ApiOperation({ summary: "Horóscopo de un animal específico" })
    @ApiParam({ name: "year", example: 2026 })
    @ApiParam({ name: "animal", enum: ChineseZodiacAnimal })
    @ApiResponse({ status: 200, type: ChineseHoroscopeResponseDto })
    async getByYearAndAnimal(
      @Param("year", ParseIntPipe) year: number,
      @Param("animal", new ParseEnumPipe(ChineseZodiacAnimal))
      animal: ChineseZodiacAnimal,
    ): Promise<ChineseHoroscopeResponseDto> {
      const horoscope = await this.chineseService.findByAnimalAndYear(animal, year);

      if (!horoscope) {
        throw new NotFoundException("Horóscopo no disponible");
      }

      this.chineseService.incrementViewCount(horoscope.id).catch(() => {});
      return this.toResponseDto(horoscope);
    }

    /**
     * POST /chinese-horoscope/admin/generate/:year
     * Genera horóscopos para un año (solo admin)
     */
    @Post("admin/generate/:year")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Generar horóscopos de un año (Admin)" })
    @ApiParam({ name: "year", example: 2027 })
    async generateForYear(@Param("year", ParseIntPipe) year: number): Promise<{ successful: number; failed: number }> {
      if (year < 2024 || year > 2050) {
        throw new BadRequestException("Año fuera de rango");
      }

      const result = await this.chineseService.generateAllForYear(year);
      return {
        successful: result.successful,
        failed: result.failed,
      };
    }

    private toResponseDto(h: ChineseHoroscope): ChineseHoroscopeResponseDto {
      return {
        id: h.id,
        animal: h.animal,
        year: h.year,
        generalOverview: h.generalOverview,
        areas: h.areas,
        luckyElements: h.luckyElements,
        compatibility: h.compatibility,
        monthlyHighlights: h.monthlyHighlights,
      };
    }
  }
  ```

- [x] Agregar controller al módulo

- [x] Documentar con Swagger

##### Testing

- [x] Test e2e: GET /chinese-horoscope/calculate funciona
- [x] Test e2e: GET /chinese-horoscope/2026 retorna array
- [x] Test e2e: GET /chinese-horoscope/2026/dragon retorna horóscopo
- [x] Test e2e: GET /chinese-horoscope/my-animal requiere auth
- [x] Test e2e: POST admin/generate requiere admin
- [x] Test e2e: 404 cuando no existe

---

#### 🎯 Criterios de Aceptación

- [x] Todos los endpoints funcionan
- [x] Calculador de animal funciona
- [x] Endpoint /my-animal usa birthDate del usuario
- [x] Endpoint de generación solo para admins
- [x] Documentación Swagger completa

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El endpoint de `calculate` NO requiere autenticación
> - El endpoint de generación es POST y solo para admins
> - Validar rango de años (2020-2050)
> - El cálculo del animal considera el Año Nuevo Chino

# Frontend: Types, API y Hooks

---

### TASK-115: Crear tipos y API client para Horóscopo Chino

**Módulo:** `frontend/src/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-114  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear tipos TypeScript, funciones de API y hooks para el horóscopo chino.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/types/chinese-horoscope.types.ts`
- `frontend/src/lib/api/chinese-horoscope-api.ts`
- `frontend/src/lib/utils/chinese-zodiac.ts`
- `frontend/src/hooks/api/useChineseHoroscope.ts`

**Archivos a modificar:**

- `frontend/src/lib/api/endpoints.ts`
- `frontend/src/types/index.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [x] Crear `chinese-horoscope.types.ts`:

  ```typescript
  export enum ChineseZodiacAnimal {
    RAT = "rat",
    OX = "ox",
    TIGER = "tiger",
    RABBIT = "rabbit",
    DRAGON = "dragon",
    SNAKE = "snake",
    HORSE = "horse",
    GOAT = "goat",
    MONKEY = "monkey",
    ROOSTER = "rooster",
    DOG = "dog",
    PIG = "pig",
  }

  export interface ChineseHoroscopeArea {
    content: string;
    rating: number;
  }

  export interface ChineseHoroscopeLucky {
    numbers: number[];
    colors: string[];
    directions: string[];
    months: number[];
  }

  export interface ChineseHoroscope {
    id: number;
    animal: ChineseZodiacAnimal;
    year: number;
    generalOverview: string;
    areas: {
      love: ChineseHoroscopeArea;
      career: ChineseHoroscopeArea;
      wellness: ChineseHoroscopeArea;
      finance: ChineseHoroscopeArea;
    };
    luckyElements: ChineseHoroscopeLucky;
    compatibility: {
      best: ChineseZodiacAnimal[];
      good: ChineseZodiacAnimal[];
      challenging: ChineseZodiacAnimal[];
    };
    monthlyHighlights: string | null;
  }

  export interface ChineseZodiacInfo {
    animal: ChineseZodiacAnimal;
    nameEs: string;
    nameEn: string;
    emoji: string;
    element: string;
    characteristics: string[];
  }

  export interface CalculateAnimalResponse {
    animal: ChineseZodiacAnimal;
    animalInfo: ChineseZodiacInfo;
    chineseYear: number;
  }
  ```

- [ ] Agregar endpoints en `endpoints.ts`:

  ```typescript
  export const API_ENDPOINTS = {
    // ...existentes

    CHINESE_HOROSCOPE: {
      CALCULATE: "/chinese-horoscope/calculate",
      MY_ANIMAL: "/chinese-horoscope/my-animal",
      BY_YEAR: (year: number) => `/chinese-horoscope/${year}`,
      BY_YEAR_ANIMAL: (year: number, animal: string) => `/chinese-horoscope/${year}/${animal}`,
    },
  } as const;
  ```

- [ ] Crear `chinese-horoscope-api.ts`:

  ```typescript
  import { apiClient } from "./axios-config";
  import { API_ENDPOINTS } from "./endpoints";
  import type { ChineseHoroscope, ChineseZodiacAnimal, CalculateAnimalResponse } from "@/types/chinese-horoscope.types";

  export async function calculateAnimal(birthDate: string): Promise<CalculateAnimalResponse> {
    const response = await apiClient.get<CalculateAnimalResponse>(API_ENDPOINTS.CHINESE_HOROSCOPE.CALCULATE, {
      params: { birthDate },
    });
    return response.data;
  }

  export async function getMyAnimalHoroscope(year?: number): Promise<ChineseHoroscope> {
    const response = await apiClient.get<ChineseHoroscope>(API_ENDPOINTS.CHINESE_HOROSCOPE.MY_ANIMAL, {
      params: year ? { year } : undefined,
    });
    return response.data;
  }

  export async function getChineseHoroscopesByYear(year: number): Promise<ChineseHoroscope[]> {
    const response = await apiClient.get<ChineseHoroscope[]>(API_ENDPOINTS.CHINESE_HOROSCOPE.BY_YEAR(year));
    return response.data;
  }

  export async function getChineseHoroscope(year: number, animal: ChineseZodiacAnimal): Promise<ChineseHoroscope> {
    const response = await apiClient.get<ChineseHoroscope>(
      API_ENDPOINTS.CHINESE_HOROSCOPE.BY_YEAR_ANIMAL(year, animal),
    );
    return response.data;
  }
  ```

- [ ] Crear `lib/utils/chinese-zodiac.ts`:

  ```typescript
  import { ChineseZodiacAnimal, ChineseZodiacInfo } from "@/types/chinese-horoscope.types";

  export const CHINESE_ZODIAC_INFO: Record<ChineseZodiacAnimal, ChineseZodiacInfo> = {
    [ChineseZodiacAnimal.RAT]: {
      animal: ChineseZodiacAnimal.RAT,
      nameEs: "Rata",
      nameEn: "Rat",
      emoji: "🐀",
      element: "Agua",
      characteristics: ["Inteligente", "Adaptable", "Ingenioso"],
    },
    [ChineseZodiacAnimal.OX]: {
      animal: ChineseZodiacAnimal.OX,
      nameEs: "Buey",
      nameEn: "Ox",
      emoji: "🐂",
      element: "Tierra",
      characteristics: ["Diligente", "Confiable", "Fuerte"],
    },
    [ChineseZodiacAnimal.TIGER]: {
      animal: ChineseZodiacAnimal.TIGER,
      nameEs: "Tigre",
      nameEn: "Tiger",
      emoji: "🐅",
      element: "Madera",
      characteristics: ["Valiente", "Competitivo", "Impredecible"],
    },
    [ChineseZodiacAnimal.RABBIT]: {
      animal: ChineseZodiacAnimal.RABBIT,
      nameEs: "Conejo",
      nameEn: "Rabbit",
      emoji: "🐇",
      element: "Madera",
      characteristics: ["Gentil", "Elegante", "Responsable"],
    },
    [ChineseZodiacAnimal.DRAGON]: {
      animal: ChineseZodiacAnimal.DRAGON,
      nameEs: "Dragón",
      nameEn: "Dragon",
      emoji: "🐉",
      element: "Tierra",
      characteristics: ["Confiado", "Inteligente", "Entusiasta"],
    },
    [ChineseZodiacAnimal.SNAKE]: {
      animal: ChineseZodiacAnimal.SNAKE,
      nameEs: "Serpiente",
      nameEn: "Snake",
      emoji: "🐍",
      element: "Fuego",
      characteristics: ["Enigmático", "Inteligente", "Sabio"],
    },
    [ChineseZodiacAnimal.HORSE]: {
      animal: ChineseZodiacAnimal.HORSE,
      nameEs: "Caballo",
      nameEn: "Horse",
      emoji: "🐴",
      element: "Fuego",
      characteristics: ["Animado", "Activo", "Enérgico"],
    },
    [ChineseZodiacAnimal.GOAT]: {
      animal: ChineseZodiacAnimal.GOAT,
      nameEs: "Cabra",
      nameEn: "Goat",
      emoji: "🐐",
      element: "Tierra",
      characteristics: ["Calmado", "Gentil", "Compasivo"],
    },
    [ChineseZodiacAnimal.MONKEY]: {
      animal: ChineseZodiacAnimal.MONKEY,
      nameEs: "Mono",
      nameEn: "Monkey",
      emoji: "🐒",
      element: "Metal",
      characteristics: ["Agudo", "Curioso", "Juguetón"],
    },
    [ChineseZodiacAnimal.ROOSTER]: {
      animal: ChineseZodiacAnimal.ROOSTER,
      nameEs: "Gallo",
      nameEn: "Rooster",
      emoji: "🐓",
      element: "Metal",
      characteristics: ["Observador", "Trabajador", "Valiente"],
    },
    [ChineseZodiacAnimal.DOG]: {
      animal: ChineseZodiacAnimal.DOG,
      nameEs: "Perro",
      nameEn: "Dog",
      emoji: "🐕",
      element: "Tierra",
      characteristics: ["Leal", "Honesto", "Amable"],
    },
    [ChineseZodiacAnimal.PIG]: {
      animal: ChineseZodiacAnimal.PIG,
      nameEs: "Cerdo",
      nameEn: "Pig",
      emoji: "🐖",
      element: "Agua",
      characteristics: ["Compasivo", "Generoso", "Diligente"],
    },
  };

  export function getChineseZodiacInfo(animal: ChineseZodiacAnimal): ChineseZodiacInfo {
    return CHINESE_ZODIAC_INFO[animal];
  }

  export function getCurrentChineseYear(): number {
    return new Date().getFullYear();
  }
  ```

- [ ] Crear `useChineseHoroscope.ts`:

  ```typescript
  "use client";

  import { useQuery, useMutation } from "@tanstack/react-query";
  import {
    calculateAnimal,
    getMyAnimalHoroscope,
    getChineseHoroscopesByYear,
    getChineseHoroscope,
  } from "@/lib/api/chinese-horoscope-api";
  import type { ChineseZodiacAnimal } from "@/types/chinese-horoscope.types";

  export const chineseHoroscopeKeys = {
    all: ["chinese-horoscope"] as const,
    myAnimal: (year?: number) => [...chineseHoroscopeKeys.all, "my", year] as const,
    byYear: (year: number) => [...chineseHoroscopeKeys.all, year] as const,
    byAnimal: (year: number, animal: ChineseZodiacAnimal) => [...chineseHoroscopeKeys.all, year, animal] as const,
    calculate: (birthDate: string) => [...chineseHoroscopeKeys.all, "calculate", birthDate] as const,
  } as const;

  export function useCalculateAnimal(birthDate: string | null) {
    return useQuery({
      queryKey: chineseHoroscopeKeys.calculate(birthDate || ""),
      queryFn: () => calculateAnimal(birthDate!),
      enabled: !!birthDate,
      staleTime: Infinity, // El animal nunca cambia
    });
  }

  export function useMyAnimalHoroscope(year?: number) {
    return useQuery({
      queryKey: chineseHoroscopeKeys.myAnimal(year),
      queryFn: () => getMyAnimalHoroscope(year),
      staleTime: 1000 * 60 * 60 * 24, // 24 horas (es anual)
      retry: false,
    });
  }

  export function useChineseHoroscopesByYear(year: number) {
    return useQuery({
      queryKey: chineseHoroscopeKeys.byYear(year),
      queryFn: () => getChineseHoroscopesByYear(year),
      staleTime: 1000 * 60 * 60 * 24,
    });
  }

  export function useChineseHoroscope(year: number, animal: ChineseZodiacAnimal | null) {
    return useQuery({
      queryKey: chineseHoroscopeKeys.byAnimal(year, animal!),
      queryFn: () => getChineseHoroscope(year, animal!),
      enabled: !!animal,
      staleTime: 1000 * 60 * 60 * 24,
    });
  }
  ```

- [x] Exportar desde `types/index.ts`

##### Testing

- [x] Test: Tipos se exportan correctamente
- [x] Test: API functions funcionan
- [x] Test: CHINESE_ZODIAC_INFO tiene 12 animales
- [x] Test: Hooks con staleTime correcto

---

#### 🎯 Criterios de Aceptación

- [x] Tipos completos para horóscopo chino
- [x] API functions cubren todos los endpoints
- [x] Info de 12 animales disponible
- [x] staleTime de 24h (es anual)

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - staleTime de 24 horas porque el horóscopo es anual
> - El cálculo del animal se hace en backend (considera CNY)
> - useCalculateAnimal tiene staleTime: Infinity (nunca cambia)

# Frontend: Componentes UI

---

### TASK-116: Crear componentes UI de Horóscopo Chino

**Módulo:** `frontend/src/components/features/chinese-horoscope/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-115  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear componentes de UI para mostrar horóscopos chinos.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/chinese-horoscope/
├── index.ts
├── ChineseAnimalCard.tsx
├── ChineseAnimalSelector.tsx
├── ChineseHoroscopeDetail.tsx
├── ChineseCompatibility.tsx
├── AnimalCalculator.tsx
├── ChineseHoroscopeWidget.tsx
└── ChineseHoroscopeSkeleton.tsx
```

---

#### ✅ Tareas Específicas

##### Frontend

- [x] Crear `ChineseAnimalCard.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
  import type { ChineseZodiacAnimal, ChineseZodiacInfo } from "@/types/chinese-horoscope.types";

  interface ChineseAnimalCardProps {
    animalInfo: ChineseZodiacInfo;
    isSelected?: boolean;
    isUserAnimal?: boolean;
    onClick?: (animal: ChineseZodiacAnimal) => void;
    className?: string;
  }

  export function ChineseAnimalCard({
    animalInfo,
    isSelected = false,
    isUserAnimal = false,
    onClick,
    className,
  }: ChineseAnimalCardProps) {
    return (
      <Card
        data-testid={`chinese-animal-${animalInfo.animal}`}
        className={cn(
          "cursor-pointer p-4 text-center transition-all",
          "hover:shadow-md hover:scale-105",
          isSelected && "ring-2 ring-primary",
          isUserAnimal && "border-red-500 border-2",
          className,
        )}
        onClick={() => onClick?.(animalInfo.animal)}
      >
        <span className="text-4xl">{animalInfo.emoji}</span>
        <p className="mt-2 font-serif text-lg">{animalInfo.nameEs}</p>
        <p className="text-xs text-muted-foreground">{animalInfo.element}</p>
        {isUserAnimal && <span className="text-xs text-red-500 font-medium">Tu animal</span>}
      </Card>
    );
  }
  ```

- [x] Crear `ChineseAnimalSelector.tsx`:

  ```tsx
  "use client";

  import { ChineseAnimalCard } from "./ChineseAnimalCard";
  import { CHINESE_ZODIAC_INFO } from "@/lib/utils/chinese-zodiac";
  import { cn } from "@/lib/utils";
  import type { ChineseZodiacAnimal } from "@/types/chinese-horoscope.types";

  interface ChineseAnimalSelectorProps {
    selectedAnimal?: ChineseZodiacAnimal | null;
    userAnimal?: ChineseZodiacAnimal | null;
    onSelect: (animal: ChineseZodiacAnimal) => void;
    className?: string;
  }

  export function ChineseAnimalSelector({
    selectedAnimal,
    userAnimal,
    onSelect,
    className,
  }: ChineseAnimalSelectorProps) {
    const animals = Object.values(CHINESE_ZODIAC_INFO);

    return (
      <div
        data-testid="chinese-animal-selector"
        className={cn("grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6", className)}
      >
        {animals.map((info) => (
          <ChineseAnimalCard
            key={info.animal}
            animalInfo={info}
            isSelected={selectedAnimal === info.animal}
            isUserAnimal={userAnimal === info.animal}
            onClick={onSelect}
          />
        ))}
      </div>
    );
  }
  ```

- [x] Crear `ChineseCompatibility.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { CHINESE_ZODIAC_INFO } from "@/lib/utils/chinese-zodiac";
  import type { ChineseZodiacAnimal } from "@/types/chinese-horoscope.types";

  interface ChineseCompatibilityProps {
    compatibility: {
      best: ChineseZodiacAnimal[];
      good: ChineseZodiacAnimal[];
      challenging: ChineseZodiacAnimal[];
    };
  }

  export function ChineseCompatibility({ compatibility }: ChineseCompatibilityProps) {
    const renderAnimals = (animals: ChineseZodiacAnimal[], variant: "success" | "warning" | "destructive") => (
      <div className="flex flex-wrap gap-2">
        {animals.map((animal) => {
          const info = CHINESE_ZODIAC_INFO[animal];
          return (
            <Badge key={animal} variant={variant as "default"}>
              {info.emoji} {info.nameEs}
            </Badge>
          );
        })}
      </div>
    );

    return (
      <Card className="p-4">
        <h3 className="font-serif text-lg mb-4">Compatibilidad</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-green-600 mb-2">Excelente compatibilidad</p>
            {renderAnimals(compatibility.best, "success")}
          </div>

          <div>
            <p className="text-sm font-medium text-yellow-600 mb-2">Buena compatibilidad</p>
            {renderAnimals(compatibility.good, "warning")}
          </div>

          <div>
            <p className="text-sm font-medium text-red-600 mb-2">Compatibilidad desafiante</p>
            {renderAnimals(compatibility.challenging, "destructive")}
          </div>
        </div>
      </Card>
    );
  }
  ```

- [x] Crear `ChineseHoroscopeDetail.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { ChineseCompatibility } from "./ChineseCompatibility";
  import { CHINESE_ZODIAC_INFO } from "@/lib/utils/chinese-zodiac";
  import type { ChineseHoroscope } from "@/types/chinese-horoscope.types";

  interface ChineseHoroscopeDetailProps {
    horoscope: ChineseHoroscope;
  }

  const AREA_LABELS = {
    love: { label: "Amor", icon: "❤️" },
    career: { label: "Carrera", icon: "💼" },
    wellness: { label: "Bienestar", icon: "✨" },
    finance: { label: "Finanzas", icon: "💰" },
  };

  export function ChineseHoroscopeDetail({ horoscope }: ChineseHoroscopeDetailProps) {
    const animalInfo = CHINESE_ZODIAC_INFO[horoscope.animal];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-6xl">{animalInfo.emoji}</span>
          <h1 className="mt-2 font-serif text-3xl">{animalInfo.nameEs}</h1>
          <Badge variant="secondary" className="mt-2">
            Horóscopo {horoscope.year}
          </Badge>
        </div>

        {/* Overview */}
        <Card className="p-6">
          <p className="text-lg leading-relaxed">{horoscope.generalOverview}</p>
        </Card>

        {/* Areas */}
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(horoscope.areas).map(([key, area]) => {
            const config = AREA_LABELS[key as keyof typeof AREA_LABELS];
            return (
              <Card key={key} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>{config.icon}</span>
                  <h3 className="font-medium">{config.label}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {area.rating}/10
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{area.content}</p>
              </Card>
            );
          })}
        </div>

        {/* Lucky Elements */}
        <Card className="p-4">
          <h3 className="font-serif text-lg mb-4">Elementos de Suerte</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Números</p>
              <p className="font-medium">{horoscope.luckyElements.numbers.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Colores</p>
              <p className="font-medium">{horoscope.luckyElements.colors.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Direcciones</p>
              <p className="font-medium">{horoscope.luckyElements.directions.join(", ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mejores meses</p>
              <p className="font-medium">{horoscope.luckyElements.months.join(", ")}</p>
            </div>
          </div>
        </Card>

        {/* Compatibility */}
        <ChineseCompatibility compatibility={horoscope.compatibility} />

        {/* Monthly Highlights */}
        {horoscope.monthlyHighlights && (
          <Card className="p-4">
            <h3 className="font-serif text-lg mb-2">Destacados del Año</h3>
            <p className="text-sm text-muted-foreground">{horoscope.monthlyHighlights}</p>
          </Card>
        )}
      </div>
    );
  }
  ```

- [ ] Crear `AnimalCalculator.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { useCalculateAnimal } from "@/hooks/api/useChineseHoroscope";
  import { CHINESE_ZODIAC_INFO } from "@/lib/utils/chinese-zodiac";

  interface AnimalCalculatorProps {
    onAnimalFound?: (animal: string) => void;
  }

  export function AnimalCalculator({ onAnimalFound }: AnimalCalculatorProps) {
    const [birthDate, setBirthDate] = useState("");
    const [queryDate, setQueryDate] = useState<string | null>(null);

    const { data, isLoading, error } = useCalculateAnimal(queryDate);

    const handleCalculate = () => {
      if (birthDate) {
        setQueryDate(birthDate);
      }
    };

    return (
      <Card className="p-6">
        <h3 className="font-serif text-lg mb-4">Descubre tu Animal del Zodiaco Chino</h3>

        <div className="flex gap-2 mb-4">
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            placeholder="Tu fecha de nacimiento"
          />
          <Button onClick={handleCalculate} disabled={!birthDate || isLoading}>
            {isLoading ? "Calculando..." : "Calcular"}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">Error al calcular</p>}

        {data && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <span className="text-5xl">{CHINESE_ZODIAC_INFO[data.animal].emoji}</span>
            <p className="mt-2 font-serif text-xl">Eres {data.animalInfo.nameEs}</p>
            <p className="text-sm text-muted-foreground">Año chino: {data.chineseYear}</p>
            <Button className="mt-4" onClick={() => onAnimalFound?.(data.animal)}>
              Ver mi horóscopo
            </Button>
          </div>
        )}
      </Card>
    );
  }
  ```

- [ ] Crear `ChineseHoroscopeWidget.tsx`:

  ```tsx
  "use client";

  import Link from "next/link";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Skeleton } from "@/components/ui/skeleton";
  import { useMyAnimalHoroscope } from "@/hooks/api/useChineseHoroscope";
  import { useAuthStore } from "@/stores/authStore";
  import { CHINESE_ZODIAC_INFO } from "@/lib/utils/chinese-zodiac";
  import { ArrowRight, Settings } from "lucide-react";

  export function ChineseHoroscopeWidget() {
    const { user } = useAuthStore();
    const currentYear = new Date().getFullYear();
    const { data, isLoading, error } = useMyAnimalHoroscope(currentYear);

    if (!user?.birthDate) {
      return (
        <Card className="p-6">
          <h2 className="font-serif text-xl mb-2">Horóscopo Chino</h2>
          <p className="text-muted-foreground mb-4 text-sm">Configura tu fecha de nacimiento</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/perfil">
              <Settings className="mr-2 h-4 w-4" />
              Configurar
            </Link>
          </Button>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card className="p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      );
    }

    if (error || !data) {
      return (
        <Card className="p-6">
          <h2 className="font-serif text-xl mb-2">Horóscopo Chino</h2>
          <p className="text-muted-foreground text-sm">No disponible</p>
        </Card>
      );
    }

    const info = CHINESE_ZODIAC_INFO[data.animal];

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{info.emoji}</span>
            <div>
              <h2 className="font-serif text-xl">{info.nameEs}</h2>
              <p className="text-xs text-muted-foreground">{currentYear}</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/horoscopo-chino/${data.animal}`}>
              Ver más
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="text-sm line-clamp-3 text-muted-foreground">{data.generalOverview}</p>
      </Card>
    );
  }
  ```

- [x] Crear `index.ts` con exports

##### Testing

- [x] Test: AnimalSelector renderiza 12 animales
- [x] Test: AnimalCard con onClick funciona
- [x] Test: ChineseCompatibility muestra todas las categorías
- [x] Test: Componentes tienen data-testid correctos

---

#### 🎯 Criterios de Aceptación

- [x] Componentes siguen design system
- [x] ChineseAnimalCard muestra emoji, nombre, elemento
- [x] ChineseAnimalSelector grid responsivo (3/4/6 columnas)
- [x] ChineseCompatibility muestra best/good/challenging
- [x] ChineseHoroscopeDetail muestra todas las secciones
- [x] Tests cubren casos principales

# Frontend: Páginas y Esquema de Datos

---

### TASK-117: Crear páginas de Horóscopo Chino

**Módulo:** `frontend/src/app/horoscopo-chino/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-116  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear páginas para el horóscopo chino.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/app/horoscopo-chino/page.tsx`
- `frontend/src/app/horoscopo-chino/[animal]/page.tsx`

**Archivos a modificar:**

- `frontend/src/components/layout/Header.tsx`
- `frontend/src/lib/constants/routes.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [x] Agregar rutas:

  ```typescript
  export const ROUTES = {
    // ...existentes
    HOROSCOPO_CHINO: "/horoscopo-chino",
    HOROSCOPO_CHINO_ANIMAL: (animal: string) => `/horoscopo-chino/${animal}`,
  } as const;
  ```

- [x] Crear `app/horoscopo-chino/page.tsx`:

  ```tsx
  "use client";

  import { useRouter } from "next/navigation";
  import { ChineseAnimalSelector, AnimalCalculator } from "@/components/features/chinese-horoscope";
  import { useChineseHoroscopesByYear } from "@/hooks/api/useChineseHoroscope";
  import { useAuthStore } from "@/stores/authStore";
  import { ROUTES } from "@/lib/constants/routes";
  import type { ChineseZodiacAnimal } from "@/types/chinese-horoscope.types";

  export default function HoroscopoChinoPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const currentYear = new Date().getFullYear();
    const { isLoading } = useChineseHoroscopesByYear(currentYear);

    const handleAnimalSelect = (animal: ChineseZodiacAnimal) => {
      router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(animal));
    };

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-2">Horóscopo Chino {currentYear}</h1>
          <p className="text-muted-foreground">Descubre las predicciones anuales según tu animal</p>
        </div>

        {/* Calculador para usuarios sin cuenta */}
        {!isAuthenticated && (
          <div className="mb-8">
            <AnimalCalculator onAnimalFound={handleAnimalSelect} />
          </div>
        )}

        {/* Selector de animales */}
        <ChineseAnimalSelector onSelect={handleAnimalSelect} />
      </div>
    );
  }
  ```

- [x] Crear `app/horoscopo-chino/[animal]/page.tsx`:

  ```tsx
  "use client";

  import { useParams, useRouter } from "next/navigation";
  import { ArrowLeft } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { ChineseHoroscopeDetail, ChineseAnimalSelector } from "@/components/features/chinese-horoscope";
  import { useChineseHoroscope } from "@/hooks/api/useChineseHoroscope";
  import { CHINESE_ZODIAC_INFO } from "@/lib/utils/chinese-zodiac";
  import { ROUTES } from "@/lib/constants/routes";
  import { ChineseZodiacAnimal } from "@/types/chinese-horoscope.types";

  export default function ChineseHoroscopeAnimalPage() {
    const params = useParams();
    const router = useRouter();
    const currentYear = new Date().getFullYear();

    const animal = params.animal as ChineseZodiacAnimal;
    const { data, isLoading, error } = useChineseHoroscope(currentYear, animal);

    if (!CHINESE_ZODIAC_INFO[animal]) {
      return (
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl mb-4">Animal no válido</h1>
          <Button onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)}>Ver todos los animales</Button>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.HOROSCOPO_CHINO)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Todos los animales
        </Button>

        <div className="mb-8 overflow-x-auto pb-2">
          <ChineseAnimalSelector
            selectedAnimal={animal}
            onSelect={(a) => router.push(ROUTES.HOROSCOPO_CHINO_ANIMAL(a))}
            className="!grid-cols-6 lg:!grid-cols-12"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Horóscopo no disponible para {currentYear}</p>
          </div>
        ) : data ? (
          <ChineseHoroscopeDetail horoscope={data} />
        ) : null}
      </div>
    );
  }
  ```

- [x] Actualizar Header con link

##### Testing

- [x] Test: Página muestra 12 animales
- [x] Test: Calculador funciona
- [x] Test: Página de animal muestra detalle

---

#### 🎯 Criterios de Aceptación

- [x] /horoscopo-chino muestra selector
- [x] /horoscopo-chino/[animal] muestra detalle
- [x] Calculador funciona para anónimos
- [x] Link en header

---

# Backend: Cron Job Anual

---

### TASK-118: Implementar cron job para generación automática anual

**Módulo:** `src/modules/horoscope/application/services/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-113  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Implementar un cron job que genere automáticamente los horóscopos chinos del próximo año el 15 de diciembre de cada año, cumpliendo con la HU-HCH-003.

---

#### 🏗️ Contexto Técnico

**Archivos a crear/modificar:**

- `src/modules/horoscope/application/services/chinese-horoscope-cron.service.ts`
- `src/modules/horoscope/application/services/chinese-horoscope-cron.service.spec.ts`
- `src/modules/horoscope/horoscope.module.ts` (agregar provider)

**Funcionalidad:**

- Ejecutar automáticamente el 15 de diciembre a las 00:00 UTC
- Generar los 12 horóscopos chinos para el año siguiente
- No regenerar si ya existen
- Enviar notificación al administrador al completar

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear `chinese-horoscope-cron.service.ts`:
- [x] Crear tests `chinese-horoscope-cron.service.spec.ts`
- [x] Actualizar `horoscope.module.ts`

##### Testing

- [x] Test: Genera horóscopos automáticamente el 15 de diciembre
- [x] Test: No regenera si ya existen horóscopos
- [x] Test: Maneja errores correctamente
- [x] Test: Método manual funciona correctamente

---

#### 🎯 Criterios de Aceptación

- [x] Cron job se ejecuta el 15 de diciembre a las 00:00 UTC
- [x] Genera automáticamente los 12 horóscopos del año siguiente
- [x] No genera duplicados si ya existen
- [x] Registra logs de inicio, progreso y finalización
- [x] Método manual disponible para testing
- [x] Tests >80% coverage

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El cron se ejecuta UNA VEZ AL AÑO (15 de diciembre)
> - Debe verificar existencia antes de generar (evitar duplicados)
> - Reutiliza el método `generateAllForYear()` de ChineseHoroscopeService
> - El sistema de notificaciones al admin se implementará en el futuro
> - Usar mismo patrón que HoroscopeCronService (horóscopos occidentales)

---

# Backend: Elemento Anual (Wu Xing) - HU-HCH-005

---

### TASK-119: Exportar y mejorar función getElementByYear

**Módulo:** `src/common/utils/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.25 días (2 horas)  
**Dependencias:** TASK-111  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

La función `getElementForYear` ya existe pero es privada. Necesitamos:

1. Exportarla públicamente
2. Agregar tipo `ChineseElement`
3. Crear función helper para obtener elemento por fecha de nacimiento (considera CNY)
4. Agregar función para generar `fullZodiacType` (ej. "Dragón de Tierra")

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

- `src/common/utils/chinese-zodiac.utils.ts`
- `src/common/utils/chinese-zodiac.utils.spec.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Agregar tipo exportado `ChineseElement`:

  ```typescript
  export type ChineseElement = "metal" | "water" | "wood" | "fire" | "earth";

  export const CHINESE_ELEMENTS_MAP_ES: Record<ChineseElement, string> = {
    metal: "Metal",
    water: "Agua",
    wood: "Madera",
    fire: "Fuego",
    earth: "Tierra",
  };
  ```

- [x] Exportar función existente `getElementForYear`:

  ```typescript
  export function getElementForYear(year: number): ChineseElement {
    // Lógica existente (ya implementada)
  }
  ```

- [x] Crear función `getElementByBirthDate`:

  ```typescript
  /**
   * Obtiene el elemento del año de nacimiento (considera CNY)
   * @param birthDate - Fecha de nacimiento
   * @returns Elemento del año chino correspondiente
   */
  export function getElementByBirthDate(birthDate: Date): ChineseElement {
    // Usar misma lógica que getChineseZodiacAnimal para obtener chineseYear
    // Luego aplicar getElementForYear(chineseYear)
  }
  ```

- [x] Crear función `getFullZodiacType`:

  ```typescript
  /**
   * Genera la identidad completa (ej. "Dragón de Tierra")
   * @param animal - Animal del zodiaco
   * @param element - Elemento del año
   * @returns Nombre completo en español
   */
  export function getFullZodiacType(animal: ChineseZodiacAnimal, element: ChineseElement): string {
    const info = getChineseZodiacInfo(animal);
    return `${info.nameEs} de ${CHINESE_ELEMENTS_MAP_ES[element]}`;
  }
  ```

##### Testing

- [x] Test: 1988 (dígito 8) → "earth" (Tierra)
- [x] Test: 1989 (dígito 9) → "earth" (Tierra)
- [x] Test: 2024 (dígito 4) → "wood" (Madera)
- [x] Test: 2000 (dígito 0) → "metal" (Metal)
- [x] Test: Fecha borde 15 Ene 1988 → año chino 1987 → "fire" (Fuego)
- [x] Test: `getFullZodiacType(DRAGON, 'earth')` → "Dragón de Tierra"
- [x] Test: `getFullZodiacType(RABBIT, 'fire')` → "Conejo de Fuego"

---

#### 🎯 Criterios de Aceptación

- [x] Tipo `ChineseElement` exportado
- [x] Función `getElementForYear` exportada
- [x] Función `getElementByBirthDate` creada y exportada
- [x] Función `getFullZodiacType` creada y exportada
- [x] Tests cubren edge case de CNY
- [x] Coverage >90%

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - La función `getElementForYear` YA EXISTE en el archivo (líneas 417-434)
> - Solo necesita ser exportada (actualmente es función privada)
> - El cálculo es: `(year - 1900) % 10` aplicado a array de elementos
> - Para `getElementByBirthDate` reutilizar lógica de CNY de `getChineseZodiacAnimal`
> - El **caso crítico** es 15 Ene 1988: CNY fue 17 Feb → año chino 1987 → dígito 7 → Fuego

---

### TASK-120: Actualizar DTO CalculateAnimalResponseDto

**Módulo:** `src/modules/horoscope/application/dto/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.25 días (2 horas)  
**Dependencias:** TASK-119  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Actualizar el DTO de respuesta del cálculo de animal para incluir los nuevos campos de elemento.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

- `src/modules/horoscope/application/dto/calculate-animal.dto.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Agregar nuevos campos al DTO:

  ```typescript
  export class CalculateAnimalResponseDto {
    // ... campos existentes (animal, animalInfo, chineseYear)

    @ApiProperty({
      description: "Elemento del año de nacimiento (Wu Xing)",
      example: "earth",
    })
    birthElement: string;

    @ApiProperty({
      description: "Nombre del elemento en español",
      example: "Tierra",
    })
    birthElementEs: string;

    @ApiProperty({
      description: "Elemento fijo/natural del animal",
      example: "earth",
    })
    fixedElement: string;

    @ApiProperty({
      description: "Identidad zodiacal completa",
      example: "Dragón de Tierra",
    })
    fullZodiacType: string;
  }
  ```

---

#### 🎯 Criterios de Aceptación

- [x] Nuevos campos agregados al DTO
- [x] Decoradores Swagger correctos
- [x] Ejemplos reflejan datos reales

---

### TASK-121: Actualizar controller para incluir elemento

**Módulo:** `src/modules/horoscope/infrastructure/controllers/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días (4 horas)  
**Dependencias:** TASK-119, TASK-120  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Actualizar los endpoints `calculateAnimal` y `getMyAnimalHoroscope` para que retornen la información completa del elemento.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

- `src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.ts`
- `src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.spec.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Actualizar endpoint `POST /chinese-horoscope/calculate-animal`:

  ```typescript
  @Post('calculate-animal')
  async calculateAnimal(@Body() dto: CalculateAnimalDto): Promise<CalculateAnimalResponseDto> {
    const birthDate = new Date(dto.birthDate);
    const animal = getChineseZodiacAnimal(birthDate);
    const animalInfo = getChineseZodiacInfo(animal);
    const chineseYear = getChineseYear(birthDate);

    // NUEVOS campos
    const birthElement = getElementByBirthDate(birthDate);
    const fullZodiacType = getFullZodiacType(animal, birthElement);

    return {
      animal,
      animalInfo: { /* ... */ },
      chineseYear,
      birthElement,
      birthElementEs: CHINESE_ELEMENTS_MAP_ES[birthElement],
      fixedElement: animalInfo.element,
      fullZodiacType,
    };
  }
  ```

- [x] Actualizar endpoint `GET /chinese-horoscope/my-animal` (si aplica)

##### Testing

- [x] Test: calculateAnimal retorna birthElement correcto
- [x] Test: calculateAnimal retorna fullZodiacType correcto
- [x] Test: Fecha borde CNY retorna elemento correcto
- [x] Test: Swagger documenta nuevos campos

---

#### 🎯 Criterios de Aceptación

- [x] Endpoint calculateAnimal retorna nuevos campos
- [x] Swagger documentation actualizada
- [x] Tests cubren nuevos campos
- [x] Backward compatible (campos adicionales, no breaking changes)

---

### TASK-122: Actualizar frontend para mostrar elemento

**Módulo:** `frontend/src/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días (4 horas)  
**Dependencias:** TASK-121  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Actualizar los tipos TypeScript y componentes del frontend para mostrar el elemento del usuario.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

- `src/types/chinese-horoscope.types.ts`
- `src/components/features/chinese-horoscope/AnimalCalculator.tsx`
- `src/components/features/chinese-horoscope/ChineseHoroscopeWidget.tsx`

---

#### ✅ Tareas Específicas

##### Frontend

- [x] Actualizar tipos en `chinese-horoscope.types.ts`:

  ```typescript
  export interface CalculateAnimalResponse {
    // ... campos existentes
    birthElement: string;
    birthElementEs: string;
    fixedElement: string;
    fullZodiacType: string;
  }
  ```

- [x] Actualizar `AnimalCalculator.tsx` para mostrar:
  - Nombre completo (ej. "Dragón de Tierra")
  - Elemento del año con ícono/color

- [x] ~Actualizar `ChineseHoroscopeWidget.tsx`~ (NO REQUERIDO: endpoint `/my-animal` no incluye campos de elemento)

##### Testing

- [x] Test: AnimalCalculator muestra fullZodiacType
- [x] Test: AnimalCalculator muestra elemento con ícono
- [x] Tests actualizados con nuevos campos (26/26 tests passed)

---

#### 🎯 Criterios de Aceptación

- [x] Tipos actualizados reflejan nueva API
- [x] UI muestra "Dragón de Tierra" en lugar de solo "Dragón"
- [x] Elemento tiene color/ícono distintivo
- [x] Tests actualizados
- [x] Backward compatible (fallback graceful si nuevos campos no disponibles)

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Usar colores para elementos: 🔴 Fuego, 🟤 Tierra, ⚪ Metal, 🔵 Agua, 🟢 Madera
> - El fullZodiacType debe ser prominente en la UI
> - Mantener backward compatibility (si API no retorna campos, fallback graceful)

#### 📝 Notas de Implementación (TASK-122 Completada)

**Fecha:** 19 de enero, 2026  
**Archivos modificados:**

- `frontend/src/types/chinese-horoscope.types.ts` - Agregados campos: birthElement, birthElementEs, fixedElement, fullZodiacType
- `frontend/src/components/features/chinese-horoscope/AnimalCalculator.tsx` - Helper getElementIcon(), muestra fullZodiacType y elemento con ícono
- `frontend/src/components/features/chinese-horoscope/AnimalCalculator.test.tsx` - 26/26 tests actualizados y pasando

**Decisiones técnicas:**

1. ChineseHoroscopeWidget NO modificado - endpoint `/my-animal` no incluye campos de elemento
2. Iconos de elementos: emojis circulares de colores (⚪🔵🟢🔴🟤)
3. Fallback strategy: `data.fullZodiacType || data.animalInfo.nameEs`
4. Validaciones pasadas: format, lint, type-check, tests (1202/1202), build

**Coverage:** 100% en nuevos campos

---

### TASK-123: Agregar Wu Xing a endpoint /my-animal

**Módulo:** `backend + frontend`  
**Prioridad:** 🔴 ALTA (Bug Fix)  
**Estimación:** 0.5 días (4 horas)  
**Dependencias:** TASK-119, TASK-122  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

El endpoint `GET /chinese-horoscope/my-animal` para usuarios autenticados NO incluye los campos Wu Xing (birthElement, fullZodiacType), mientras que `POST /calculate-animal` para usuarios anónimos SÍ los incluye.

**Problema detectado:** El widget del dashboard y la página de horóscopo chino para usuarios logueados muestra solo el animal base (ej. "Dragón") en lugar del tipo completo (ej. "Dragón de Tierra").

---

#### 🏗️ Contexto Técnico

**Endpoints afectados:**

| Endpoint                 | Usuarios     | Estado Wu Xing              |
| ------------------------ | ------------ | --------------------------- |
| `POST /calculate-animal` | Anónimos     | ✅ Incluye campos           |
| `GET /my-animal`         | Autenticados | ✅ **Ahora incluye campos** |

**Archivos modificados:**

**Backend:**

- `src/modules/horoscope/application/dto/chinese-horoscope-response.dto.ts` - Agregados campos opcionales
- `src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.ts` - Calcula y retorna campos
- `src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.spec.ts` - 26 tests (3 nuevos)

**Frontend:**

- `src/types/chinese-horoscope.types.ts` - Agregados campos a ChineseHoroscope interface
- `src/components/features/chinese-horoscope/ChineseHoroscopeWidget.tsx` - Muestra fullZodiacType y elemento
- `src/components/features/chinese-horoscope/ChineseHoroscopeWidget.test.tsx` - 25 tests (6 nuevos)

---

#### ✅ Tareas Específicas

##### Backend

- [x] Agregar campos opcionales a `ChineseHoroscopeResponseDto`:

  ```typescript
  @ApiPropertyOptional({
    description: 'Elemento del año de nacimiento (Wu Xing) - solo en /my-animal',
    example: 'earth',
  })
  birthElement?: string;

  @ApiPropertyOptional({
    description: 'Nombre del elemento en español',
    example: 'Tierra',
  })
  birthElementEs?: string;

  @ApiPropertyOptional({
    description: 'Identidad zodiacal completa',
    example: 'Dragón de Tierra',
  })
  fullZodiacType?: string;
  ```

- [x] Modificar `getMyAnimalHoroscope` para calcular y agregar campos Wu Xing:

  ```typescript
  // Después de obtener horoscope...
  const birthElement = getElementByBirthDate(birthDate);
  const fullZodiacType = getFullZodiacType(horoscope.animal, birthElement);

  return {
    ...this.toResponseDto(horoscope),
    birthElement,
    birthElementEs: CHINESE_ELEMENTS_MAP_ES[birthElement],
    fullZodiacType,
  };
  ```

##### Testing Backend

- [x] Test: /my-animal retorna birthElement correcto
- [x] Test: /my-animal retorna fullZodiacType correcto
- [x] Test: CNY edge case (usuario nacido antes de CNY)

##### Frontend

- [x] Actualizar tipo `ChineseHoroscope` con campos opcionales
- [x] Agregar helper `getElementIcon()` a ChineseHoroscopeWidget
- [x] Mostrar fullZodiacType en lugar de solo nameEs (con fallback)
- [x] Mostrar elemento con ícono debajo del título

##### Testing Frontend

- [x] Test: Widget muestra fullZodiacType cuando está disponible
- [x] Test: Widget hace fallback a nameEs cuando fullZodiacType no está disponible
- [x] Test: Widget muestra elemento con ícono metal (⚪)
- [x] Test: Widget muestra elemento con ícono fire (🔴)
- [x] Test: Widget muestra elemento con ícono earth (🟤)
- [x] Test: No muestra elemento cuando birthElementEs no está disponible

---

#### 🎯 Criterios de Aceptación

- [x] Endpoint /my-animal retorna birthElement, birthElementEs, fullZodiacType
- [x] Widget del dashboard muestra "Dragón de Tierra" en lugar de solo "Dragón"
- [x] Widget muestra elemento con ícono de color
- [x] Backward compatible (campos opcionales)
- [x] Tests cubren nuevos campos
- [x] Coverage >80%

---

#### 📊 Resultados

**Backend:**

- Tests: 26/26 pasando (3 nuevos tests para Wu Xing en /my-animal)
- Format: ✅ Sin cambios
- Lint: ✅ Limpio
- Build: ✅ Exitoso
- Architecture Validation: ✅ Pasada

**Frontend:**

- Tests: 25/25 pasando (6 nuevos tests para Wu Xing)
- Format: ✅ Sin cambios
- Lint: ✅ Limpio
- Type-check: ✅ Sin errores
- Build: ✅ Exitoso
- Architecture Validation: ✅ Pasada

**Coverage:** 100% en nuevos campos y funcionalidad

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Reutilizar funciones existentes: `getElementByBirthDate`, `getFullZodiacType`, `CHINESE_ELEMENTS_MAP_ES`
> - Reutilizar `getElementIcon()` del AnimalCalculator (moverlo a utils o copiar)
> - Los campos son OPCIONALES en el DTO porque otros endpoints que usan el mismo DTO no los tienen
> - Solo el endpoint `/my-animal` tendrá estos campos (porque tiene acceso al birthDate del usuario)

---

## ESQUEMA DE DATOS

### Nueva Tabla: `chinese_horoscopes`

```sql
CREATE TYPE chinese_zodiac_animal_enum AS ENUM (
  'rat', 'ox', 'tiger', 'rabbit',
  'dragon', 'snake', 'horse', 'goat',
  'monkey', 'rooster', 'dog', 'pig'
);

CREATE TABLE chinese_horoscopes (
  id SERIAL PRIMARY KEY,
  animal chinese_zodiac_animal_enum NOT NULL,
  year SMALLINT NOT NULL,
  general_overview TEXT NOT NULL,
  areas JSONB NOT NULL,
  lucky_elements JSONB NOT NULL,
  compatibility JSONB NOT NULL,
  monthly_highlights TEXT,
  ai_provider VARCHAR(50),
  ai_model VARCHAR(100),
  tokens_used INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_animal_year UNIQUE (animal, year)
);

CREATE INDEX idx_chinese_year ON chinese_horoscopes(year);
```

### Tamaño Estimado

| Período | Registros | Tamaño  |
| ------- | --------- | ------- |
| 1 año   | 12        | ~60 KB  |
| 5 años  | 60        | ~300 KB |
| 10 años | 120       | ~600 KB |

**Retención:** Indefinida (es contenido anual)

---

## DEPENDENCIAS Y RIESGOS

### Riesgos

| Riesgo                        | Prob. | Impacto | Mitigación                 |
| ----------------------------- | ----- | ------- | -------------------------- |
| Cálculo incorrecto del animal | Media | Alto    | Tests exhaustivos con CNY  |
| Horóscopo no generado         | Baja  | Medio   | Admin puede generar manual |
| Usuario nació antes de CNY    | Alta  | Medio   | Lógica de cálculo correcta |
| Elemento incorrecto por CNY   | Alta  | Medio   | Tests edge case CNY        |

### Orden de Implementación

```
Día 1:
├── TASK-111: Helper chinese-zodiac (0.5d)
└── TASK-112: Entidad ChineseHoroscope (0.5d)

Día 2-3:
├── TASK-113: Servicio generación (1d)
└── TASK-114: Endpoints (1d)

Día 4-5:
├── TASK-115: Types y hooks (0.5d)
├── TASK-116: Componentes UI (1d)
└── TASK-117: Páginas (0.5d)

Día 6 (Opcional - Automatización):
└── TASK-118: Cron job anual (0.5d)

Día 7-8 (HU-HCH-005 - Elemento Wu Xing):
├── TASK-119: Exportar getElementByYear (0.25d)
├── TASK-120: Actualizar DTO (0.25d)
├── TASK-121: Actualizar controller (0.5d)
└── TASK-122: Actualizar frontend (0.5d)

Día 8 (Bug Fix):
└── TASK-123: Agregar Wu Xing a /my-animal (0.5d)

Día 9-13 (HU-HCH-006 - Horóscopos por Animal/Elemento):
├── TASK-124: Modificar schema DB para 60 horóscopos (0.5d)
├── TASK-125: Actualizar generador AI para 60 variantes (1d)
├── TASK-126: Crear endpoint /chinese-horoscope/:animal/:element (0.5d)
├── TASK-127: Actualizar página /horoscopo-chino con selector (1d)
├── TASK-128: Actualizar página /horoscopo-chino/[animal] (1d)
└── TASK-129: Integrar calculador con navegación (0.5d)
```

**Total:** 4-5 días (MVP), 5.5 días (con automatización), 7 días (con Wu Xing), 11.5 días (con Horóscopos Animal/Elemento)

---

## HU-HCH-006: Horóscopos Personalizados por Animal/Elemento

**Prioridad:** 🟡 MEDIA  
**Estimación Total:** 4.5 días  
**Estado:** 📋 PENDIENTE

---

### 📋 Descripción

Implementar horóscopos anuales completos para las 60 combinaciones de animal/elemento del zodiaco chino (12 animales × 5 elementos Wu Xing), siguiendo el enfoque profesional de la astrología china (BaZi).

**Principio Base:**

> "No existe un Dragón genérico. Existen 5 Dragones diferentes, y cada uno tiene un destino distinto."

---

### 🎯 Objetivos

1. Generar 60 horóscopos anuales (no 12)
2. Siempre requerir fecha/año de nacimiento para consultas
3. Mostrar horóscopo personalizado animal/elemento
4. Eliminar concepto de "elemento base" en horóscopos

---

### 📐 Flujo UX Profesional

```
/horoscopo-chino
├── Usuario logueado con birthDate → Muestra SU card destacada + 11 animales
├── Usuario sin birthDate → "Ingresa tu fecha para descubrir tu signo"
└── Quiero ver otro animal → "¿Para quién consultas? Ingresa el año de nacimiento"

/horoscopo-chino/[animal]
├── Es MI animal → Muestra MI horóscopo (animal + MI elemento)
└── Es OTRO animal → Pide año: "¿En qué año nació esta persona?"
                      → Muestra horóscopo de ese animal + elemento calculado
```

---

### ✅ Tareas

---

### TASK-124: Modificar schema DB para 60 horóscopos

**Módulo:** `backend`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** Ninguna  
**Estado:** 📋 PENDIENTE

#### Descripción

Modificar la entidad `ChineseHoroscope` para soportar la combinación animal + elemento como clave única en lugar de solo animal.

#### Tareas Específicas

- [ ] Agregar campo `element` (ChineseElement enum) a entidad ChineseHoroscope
- [ ] Cambiar constraint unique de `(animal, year)` a `(animal, element, year)`
- [ ] Crear migración para nuevo schema
- [ ] Actualizar repository con métodos `findByAnimalElementAndYear`
- [ ] Tests para nueva estructura

#### Criterios de Aceptación

- [ ] Entidad soporta 60 registros por año (12 × 5)
- [ ] Migración ejecuta sin errores
- [ ] Tests cubren nuevos métodos

---

### TASK-125: Actualizar generador AI para 60 variantes

**Módulo:** `backend`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-124  
**Estado:** 📋 PENDIENTE

#### Descripción

Modificar el servicio de generación para crear horóscopos personalizados para cada combinación animal/elemento.

#### Tareas Específicas

- [ ] Actualizar prompt de IA para incluir elemento del usuario
- [ ] Modificar `generateAllHoroscopes` para generar 60 variantes
- [ ] Agregar batch processing con delays (evitar rate limits)
- [ ] Incluir interacción elemento nacimiento vs elemento del año en prompt
- [ ] Actualizar admin command para regeneración masiva
- [ ] Tests para generación de múltiples elementos

#### Prompt Context Adicional

```
El usuario es un {animal} de {elemento}.
El año {año} es un año de {elemento_año}.
Considera la interacción entre {elemento} y {elemento_año}:
- Ciclo productivo: Madera→Fuego→Tierra→Metal→Agua→Madera
- Ciclo destructivo: Madera→Tierra→Agua→Fuego→Metal→Madera
```

#### Criterios de Aceptación

- [ ] Se generan 60 horóscopos por año
- [ ] Cada horóscopo menciona la interacción de elementos
- [ ] Rate limiting respetado (60 calls con delays)

---

### TASK-126: Crear endpoint /chinese-horoscope/:animal/:element

**Módulo:** `backend`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-124  
**Estado:** 📋 PENDIENTE

#### Descripción

Crear nuevo endpoint para obtener horóscopo por animal y elemento específico.

#### Tareas Específicas

- [ ] Crear endpoint `GET /chinese-horoscope/:animal/:element`
- [ ] Validar animal y element con enums
- [ ] Retornar 404 si no existe para ese año
- [ ] Mantener backward compatibility con endpoint actual (deprecar gradualmente)
- [ ] Documentar en Swagger
- [ ] Tests de integración

#### API Contract

```typescript
GET /chinese-horoscope/dragon/earth?year=2026

Response:
{
  id: 42,
  animal: "dragon",
  element: "earth",
  animalEs: "Dragón",
  elementEs: "Tierra",
  fullZodiacType: "Dragón de Tierra",
  year: 2026,
  generalOverview: "...",
  areas: {...}
}
```

#### Criterios de Aceptación

- [ ] Endpoint retorna horóscopo específico
- [ ] Validación de parámetros correcta
- [ ] Swagger documentado
- [ ] Tests cubren casos válidos e inválidos

---

### TASK-127: Actualizar página /horoscopo-chino con selector

**Módulo:** `frontend`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-126  
**Estado:** 📋 PENDIENTE

#### Descripción

Rediseñar la página principal de horóscopo chino para que siempre solicite fecha/año antes de mostrar un horóscopo.

#### Tareas Específicas

- [ ] Usuario logueado con birthDate: destacar SU card animal/elemento
- [ ] Usuario sin birthDate: mostrar calculador prominente
- [ ] Click en otro animal: abrir modal/form para ingresar año
- [ ] Actualizar ChineseAnimalSelector con indicador visual del animal propio
- [ ] Agregar YearSelectorModal component
- [ ] Tests para todos los flujos

#### Mockup UX

```
┌─────────────────────────────────────────────┐
│  🐴 Tu Horóscopo: Caballo de Tierra 2026    │ ← Destacado
│  [Ver mi horóscopo completo]                │
├─────────────────────────────────────────────┤
│  Explora otros signos                       │
│  🐀 🐂 🐅 🐇 🐉 🐍 🐴 🐑 🐒 🐓 🐕 🐖      │
│  ↑ Click abre modal: "¿Año de nacimiento?"  │
└─────────────────────────────────────────────┘
```

#### Criterios de Aceptación

- [ ] Usuario ve su animal/elemento destacado
- [ ] Modal de año funciona correctamente
- [ ] Navegación fluida entre animales
- [ ] Tests cubren flujos principales

---

### TASK-128: Actualizar página /horoscopo-chino/[animal]

**Módulo:** `frontend`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-126, TASK-127  
**Estado:** 📋 PENDIENTE

#### Descripción

Modificar la página de detalle para mostrar horóscopo específico animal/elemento, solicitando año si no es el animal del usuario.

#### Tareas Específicas

- [ ] Si es MI animal: mostrar horóscopo de MI elemento directamente
- [ ] Si es OTRO animal: mostrar selector de año antes del contenido
- [ ] Crear componente YearInputBanner para pedir año
- [ ] Actualizar URL a `/horoscopo-chino/[animal]?element=[element]` o `/horoscopo-chino/[animal]/[element]`
- [ ] Mantener persistencia del año seleccionado (sessionStorage)
- [ ] Tests para ambos flujos

#### Flujo

```
/horoscopo-chino/dragon (no es mi animal)
├── Banner: "¿En qué año nació la persona?"
├── Input: [1988] → Calcular → "Dragón de Tierra"
└── Muestra horóscopo de Dragón de Tierra 2026

/horoscopo-chino/horse (es mi animal, soy Caballo de Tierra)
└── Muestra horóscopo de Caballo de Tierra 2026 directamente
```

#### Criterios de Aceptación

- [ ] Mi animal muestra mi horóscopo directo
- [ ] Otro animal pide año primero
- [ ] Navegación funcional
- [ ] Tests cubren casos

---

### TASK-129: Integrar calculador con navegación a horóscopo

**Módulo:** `frontend`  
**Prioridad:** 🟢 BAJA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-128  
**Estado:** 📋 PENDIENTE

#### Descripción

Conectar el AnimalCalculator con navegación directa al horóscopo completo del animal/elemento calculado.

#### Tareas Específicas

- [ ] Agregar botón "Ver tu horóscopo completo" al resultado del calculador
- [ ] Navegar a `/horoscopo-chino/[animal]?element=[element]`
- [ ] Pasar elemento calculado como query param
- [ ] Para usuario anónimo: persistir fecha en sessionStorage
- [ ] Tests de integración

#### Criterios de Aceptación

- [ ] Calculador conecta con página de horóscopo
- [ ] Elemento se pasa correctamente
- [ ] Navegación fluida

---

## CHECKLIST DE COMPLETITUD

### Backend

- [x] TASK-111: Helper chinese-zodiac
- [x] TASK-112: Entidad ChineseHoroscope
- [x] TASK-113: Servicio de generación
- [x] TASK-114: Endpoints
- [x] TASK-118: Cron job anual (Opcional - Automatización)
- [x] TASK-119: Exportar getElementByYear y helpers (HU-HCH-005)
- [x] TASK-120: Actualizar DTO CalculateAnimalResponseDto (HU-HCH-005)
- [x] TASK-121: Actualizar controller con elemento (HU-HCH-005)
- [x] TASK-123: Agregar Wu Xing a /my-animal (Bug Fix)
- [ ] TASK-124: Modificar schema DB para 60 horóscopos (HU-HCH-006)
- [ ] TASK-125: Actualizar generador AI para 60 variantes (HU-HCH-006)
- [ ] TASK-126: Crear endpoint /:animal/:element (HU-HCH-006)

### Frontend

- [x] TASK-115: Types y hooks
- [x] TASK-116: Componentes UI
- [x] TASK-117: Páginas
- [x] TASK-122: Mostrar elemento en UI (HU-HCH-005)
- [ ] TASK-127: Actualizar página /horoscopo-chino (HU-HCH-006)
- [ ] TASK-128: Actualizar página /horoscopo-chino/[animal] (HU-HCH-006)
- [ ] TASK-129: Integrar calculador con navegación (HU-HCH-006)

### Infraestructura

- [x] Migración ejecutada
- [x] Fechas CNY cargadas (1950-2050)
- [x] Tests >80% coverage
- [x] Cron job anual configurado

---

**Fin del Módulo Horóscopo Chino**
