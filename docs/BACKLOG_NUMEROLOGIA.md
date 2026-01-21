# BACKLOG AUGURIA 2.0 - NUMEROLOGÍA

## Historias de Usuario

**Fecha de creación:** 17 de enero de 2026  
**Módulo:** Numerología  
**Prioridad Global:** 🟡 MEDIA (Alto valor, baja complejidad)  
**Estimación Total:** 6.5 días

---

## OVERVIEW DEL MÓDULO

La Numerología calcula números significativos basados en la fecha de nacimiento y nombre del usuario. Es un módulo de **baja complejidad** porque los cálculos son algorítmicos (no requieren IA para la funcionalidad básica).

### Funcionalidad Premium con IA

Los usuarios **PREMIUM** pueden obtener una **interpretación personalizada generada por IA** que analiza la combinación única de todos sus números. Esta interpretación se genera **una única vez** y se persiste en la base de datos para el usuario.

### Números a calcular:

| Número            | Fuente                 | Descripción        |
| ----------------- | ---------------------- | ------------------ |
| Camino de Vida    | Fecha nacimiento       | Propósito de vida  |
| Número del Alma   | Vocales del nombre     | Deseos internos    |
| Personalidad      | Consonantes del nombre | Cómo te ven otros  |
| Expresión         | Nombre completo        | Talentos naturales |
| Día de Nacimiento | Día del mes            | Talento especial   |
| Año Personal      | Fecha + año actual     | Ciclo anual        |
| Mes Personal      | Año personal + mes     | Ciclo mensual      |

### Números Maestros:

Los números 11, 22 y 33 son "maestros" y no se reducen.

---

## 1. HISTORIAS DE USUARIO

### HU-NUM-001: Calcular numerología (Usuario Anónimo)

```gherkin
Feature: Calcular numerología como usuario anónimo
  Como usuario anónimo
  Quiero calcular mis números basados en mi fecha de nacimiento
  Para conocer mi perfil numerológico sin registrarme

  Background:
    Given soy un usuario anónimo en Auguria

  Scenario: Acceder a la calculadora de numerología
    When navego a la sección "Numerología"
    Then veo una introducción explicando qué es la numerología
    And veo un formulario con campo de fecha de nacimiento
    And veo un campo opcional para nombre completo
    And veo un botón "Calcular mis Números"

  Scenario: Calcular solo con fecha de nacimiento
    Given estoy en la página de numerología
    When ingreso mi fecha de nacimiento "1990-03-25"
    And hago clic en "Calcular"
    Then veo mi Número de Camino de Vida (2)
    And veo mi Número del Día (25 → 7)
    And veo mi Año Personal para 2026
    And veo mi Mes Personal actual
    And NO veo números basados en nombre (vacíos)

  Scenario: Calcular con fecha y nombre completo
    Given estoy en la página de numerología
    When ingreso fecha "1990-03-25"
    And ingreso nombre "Juan Carlos Pérez"
    And hago clic en "Calcular"
    Then veo todos los números incluyendo:
      | Camino de Vida | 2 |
      | Número del Alma | 3 |
      | Personalidad | 7 |
      | Expresión | 1 |
    And veo la interpretación de cada número

  Scenario: Número maestro detectado
    Given ingreso fecha "1992-11-29"
    When calculo mis números
    Then mi Camino de Vida muestra "11" (no reducido a 2)
    And veo una indicación especial "Número Maestro"
    And veo la interpretación del número 11
```

---

### HU-NUM-002: Numerología para usuario registrado

```gherkin
Feature: Numerología personalizada para usuario registrado
  Como usuario registrado con fecha de nacimiento
  Quiero ver mi numerología pre-calculada
  Para acceder rápidamente a mis números

  Background:
    Given soy un usuario registrado
    And mi fecha de nacimiento es "1990-03-25"
    And mi nombre es "María González"

  Scenario: Ver widget en dashboard
    When accedo a mi dashboard
    Then veo un widget "Tu Numerología"
    And muestra mi Camino de Vida destacado
    And muestra mi Año Personal 2026
    And veo un botón "Ver perfil completo"

  Scenario: Ver perfil numerológico completo
    Given estoy en mi dashboard
    When hago clic en "Ver perfil completo"
    Then navego a /numerologia/mi-perfil
    And veo todos mis números pre-calculados
    And los datos vienen de mi perfil (no necesito ingresar)
    And puedo recalcular si cambié mi nombre

  Scenario: Actualizar nombre y recalcular
    Given estoy en mi perfil numerológico
    And mi nombre registrado es "María González"
    When actualizo mi nombre a "María González López"
    And hago clic en "Recalcular"
    Then los números basados en nombre se actualizan
    And el Camino de Vida permanece igual (usa fecha)
```

---

### HU-NUM-003: Interpretaciones de números

```gherkin
Feature: Ver interpretaciones detalladas
  Como usuario
  Quiero ver qué significa cada número
  Para entender mi perfil numerológico

  Scenario: Ver interpretación de Camino de Vida
    Given calculé mis números
    And mi Camino de Vida es 7
    When hago clic en "Ver más" del Camino de Vida
    Then veo una descripción detallada del número 7
    And veo características positivas
    And veo desafíos potenciales
    And veo compatibilidad con otros números
    And veo profesiones afines

  Scenario: Comparar con otro número
    Given estoy viendo mi perfil (Camino de Vida 7)
    When selecciono "Comparar compatibilidad"
    And elijo el número 3
    Then veo el análisis de compatibilidad 7-3
    And veo fortalezas de la combinación
    And veo áreas de conflicto potencial
```

# Backend: Utilidades y Cálculos

---

### TASK-200: Crear utilidades de cálculo numerológico

**Módulo:** `src/common/utils/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** Ninguna  
**Estado:** ✅ COMPLETADA

---

#### 📋 Descripción

Crear funciones puras para calcular todos los números numerológicos. Estos cálculos son algorítmicos y no requieren IA.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/common/utils/numerology.utils.ts`
- `src/common/utils/numerology.utils.spec.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Crear constantes de letras a números:

  ```typescript
  // Sistema Pitagórico
  const LETTER_VALUES: Record<string, number> = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    I: 9,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    O: 6,
    P: 7,
    Q: 8,
    R: 9,
    S: 1,
    T: 2,
    U: 3,
    V: 4,
    W: 5,
    X: 6,
    Y: 7,
    Z: 8,
  };

  const VOWELS = ["A", "E", "I", "O", "U"];
  const MASTER_NUMBERS = [11, 22, 33];
  ```

- [x] Crear función `reduceToSingleDigit`:

  ```typescript
  /**
   * Reduce un número a un solo dígito, preservando números maestros
   * @param num - Número a reducir
   * @param preserveMaster - Si preservar 11, 22, 33
   * @returns Número reducido o maestro
   */
  export function reduceToSingleDigit(num: number, preserveMaster: boolean = true): number {
    if (preserveMaster && MASTER_NUMBERS.includes(num)) {
      return num;
    }

    while (num > 9) {
      num = String(num)
        .split("")
        .reduce((sum, digit) => sum + parseInt(digit), 0);

      if (preserveMaster && MASTER_NUMBERS.includes(num)) {
        return num;
      }
    }

    return num;
  }
  ```

- [x] Crear función `calculateLifePath`:

  ```typescript
  /**
   * Calcula el Número de Camino de Vida
   * Suma todos los dígitos de la fecha de nacimiento
   * @param birthDate - Fecha de nacimiento
   * @returns Número de Camino de Vida (1-9, 11, 22, 33)
   */
  export function calculateLifePath(birthDate: Date): number {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    // Reducir cada componente por separado primero
    const yearReduced = reduceToSingleDigit(year, false);
    const monthReduced = reduceToSingleDigit(month, false);
    const dayReduced = reduceToSingleDigit(day, false);

    // Sumar y reducir preservando maestros
    const total = yearReduced + monthReduced + dayReduced;
    return reduceToSingleDigit(total, true);
  }
  ```

- [x] Crear función `calculateBirthdayNumber`:

  ```typescript
  /**
   * Calcula el Número del Día de Nacimiento
   * Solo usa el día del mes
   * @param birthDate - Fecha de nacimiento
   * @returns Número del día (1-9, 11, 22)
   */
  export function calculateBirthdayNumber(birthDate: Date): number {
    const day = birthDate.getDate();
    return reduceToSingleDigit(day, true);
  }
  ```

- [x] Crear función `calculateExpressionNumber`:

  ```typescript
  /**
   * Calcula el Número de Expresión (Destino)
   * Suma todas las letras del nombre completo
   * @param fullName - Nombre completo
   * @returns Número de Expresión
   */
  export function calculateExpressionNumber(fullName: string): number {
    const normalized = fullName
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^A-Z]/g, ""); // Solo letras

    const sum = normalized.split("").reduce((total, letter) => {
      return total + (LETTER_VALUES[letter] || 0);
    }, 0);

    return reduceToSingleDigit(sum, true);
  }
  ```

- [x] Crear función `calculateSoulUrge`:

  ```typescript
  /**
   * Calcula el Número del Alma (Deseo del Corazón)
   * Suma solo las vocales del nombre
   * @param fullName - Nombre completo
   * @returns Número del Alma
   */
  export function calculateSoulUrge(fullName: string): number {
    const normalized = fullName
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const sum = normalized
      .split("")
      .filter((letter) => VOWELS.includes(letter))
      .reduce((total, letter) => {
        return total + (LETTER_VALUES[letter] || 0);
      }, 0);

    return reduceToSingleDigit(sum, true);
  }
  ```

- [x] Crear función `calculatePersonality`:

  ```typescript
  /**
   * Calcula el Número de Personalidad
   * Suma solo las consonantes del nombre
   * @param fullName - Nombre completo
   * @returns Número de Personalidad
   */
  export function calculatePersonality(fullName: string): number {
    const normalized = fullName
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const sum = normalized
      .split("")
      .filter((letter) => LETTER_VALUES[letter] && !VOWELS.includes(letter))
      .reduce((total, letter) => {
        return total + (LETTER_VALUES[letter] || 0);
      }, 0);

    return reduceToSingleDigit(sum, true);
  }
  ```

- [x] Crear función `calculatePersonalYear`:

  ```typescript
  /**
   * Calcula el Año Personal
   * Suma día + mes de nacimiento + año actual
   * @param birthDate - Fecha de nacimiento
   * @param year - Año a calcular (default: actual)
   * @returns Año Personal (1-9)
   */
  export function calculatePersonalYear(birthDate: Date, year: number = new Date().getFullYear()): number {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    const sum = reduceToSingleDigit(day, false) + reduceToSingleDigit(month, false) + reduceToSingleDigit(year, false);

    return reduceToSingleDigit(sum, false); // No maestros en año personal
  }
  ```

- [x] Crear función `calculatePersonalMonth`:

  ```typescript
  /**
   * Calcula el Mes Personal
   * Año Personal + mes actual
   * @param personalYear - Año personal calculado
   * @param month - Mes (1-12)
   * @returns Mes Personal (1-9)
   */
  export function calculatePersonalMonth(personalYear: number, month: number = new Date().getMonth() + 1): number {
    const sum = personalYear + month;
    return reduceToSingleDigit(sum, false);
  }
  ```

- [x] Crear función `calculateDayNumber`:

  ```typescript
  /**
   * Calcula el Número del Día Universal
   * Suma todos los dígitos de una fecha específica
   * @param date - Fecha a calcular (default: hoy)
   * @returns Número del día (1-9)
   */
  export function calculateDayNumber(date: Date = new Date()): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const sum = reduceToSingleDigit(year, false) + reduceToSingleDigit(month, false) + reduceToSingleDigit(day, false);

    return reduceToSingleDigit(sum, false); // No maestros en día universal
  }
  ```

- [x] Crear función principal `calculateAllNumbers`:

  ```typescript
  export interface NumerologyResult {
    lifePath: number;
    birthday: number;
    expression: number | null;
    soulUrge: number | null;
    personality: number | null;
    personalYear: number;
    personalMonth: number;
    isMasterNumber: boolean;
    birthDate: string;
    fullName: string | null;
  }

  /**
   * Calcula todos los números numerológicos
   */
  export function calculateAllNumbers(birthDate: Date, fullName?: string): NumerologyResult {
    const lifePath = calculateLifePath(birthDate);
    const personalYear = calculatePersonalYear(birthDate);

    return {
      lifePath,
      birthday: calculateBirthdayNumber(birthDate),
      expression: fullName ? calculateExpressionNumber(fullName) : null,
      soulUrge: fullName ? calculateSoulUrge(fullName) : null,
      personality: fullName ? calculatePersonality(fullName) : null,
      personalYear,
      personalMonth: calculatePersonalMonth(personalYear),
      isMasterNumber: MASTER_NUMBERS.includes(lifePath),
      birthDate: birthDate.toISOString().split("T")[0],
      fullName: fullName || null,
    };
  }
  ```

- [x] Exportar desde `src/common/utils/index.ts`

##### Testing

- [x] Test: reduceToSingleDigit(29) = 11 (maestro)
- [x] Test: reduceToSingleDigit(38) = 11 (maestro)
- [x] Test: reduceToSingleDigit(29, false) = 2
- [x] Test: calculateLifePath("1990-03-25") = correcto
- [x] Test: calculateExpressionNumber("Juan") = correcto
- [x] Test: calculateSoulUrge("AEIOU") = 6 (1+5+9+6+3)
- [x] Test: calculateDayNumber devuelve 1-9
- [x] Test: Nombres con acentos funcionan
- [x] Test: Números maestros se preservan

---

#### 🎯 Criterios de Aceptación

- [x] Todos los cálculos son correctos
- [x] Números maestros se preservan donde corresponde
- [x] Acentos y caracteres especiales se manejan
- [x] Tests cubren edge cases
- [x] Coverage >80% (Coverage total: 80.52%) - Cumple estándar del proyecto definido en AGENTS.md

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Los números maestros (11, 22, 33) NO se reducen en Camino de Vida
> - El Año Personal y Mes Personal SÍ se reducen (no usan maestros)
> - Normalizar acentos: é → e, ñ → n para cálculo
> - La Y puede ser vocal o consonante; usar como consonante

# Backend: Interpretaciones y Servicio

---

### TASK-201: Crear datos de interpretaciones numerológicas

**Módulo:** `src/modules/numerology/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-200

---

#### 📋 Descripción

Crear el contenido estático de interpretaciones para cada número (1-9 y maestros 11, 22, 33).

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/numerology/data/interpretations.data.ts`
- `src/modules/numerology/data/compatibility.data.ts`

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear interface de interpretación:

  ```typescript
  export interface NumberInterpretation {
    number: number;
    name: string;
    keywords: string[];
    description: string;
    strengths: string[];
    challenges: string[];
    careers: string[];
    isMaster: boolean;
  }

  export interface LifePathInterpretation extends NumberInterpretation {
    lifePurpose: string;
    lessonsToLearn: string[];
  }
  ```

- [ ] Crear interpretaciones de Camino de Vida:

  ```typescript
  export const LIFE_PATH_INTERPRETATIONS: Record<number, LifePathInterpretation> = {
    1: {
      number: 1,
      name: "El Líder",
      keywords: ["Independencia", "Originalidad", "Ambición"],
      description: "El número 1 representa el liderazgo y la individualidad...",
      strengths: ["Determinación y voluntad fuerte", "Capacidad de innovación", "Independencia y autosuficiencia"],
      challenges: ["Tendencia al egoísmo", "Dificultad para trabajar en equipo", "Impaciencia con los demás"],
      careers: ["Empresario", "Director", "Inventor", "Freelancer"],
      lifePurpose: "Desarrollar la individualidad y liderar con el ejemplo",
      lessonsToLearn: ["Humildad", "Colaboración", "Paciencia"],
      isMaster: false,
    },
    2: {
      number: 2,
      name: "El Diplomático",
      keywords: ["Cooperación", "Equilibrio", "Sensibilidad"],
      description: "El número 2 representa la dualidad y la asociación...",
      strengths: ["Excelente mediador", "Intuición desarrollada", "Capacidad de escucha"],
      challenges: ["Indecisión", "Dependencia emocional", "Evitar conflictos excesivamente"],
      careers: ["Mediador", "Consejero", "Artista", "Trabajador social"],
      lifePurpose: "Crear armonía y servir de puente entre personas",
      lessonsToLearn: ["Asertividad", "Independencia", "Autoconfianza"],
      isMaster: false,
    },
    // ... números 3-9
    11: {
      number: 11,
      name: "El Visionario",
      keywords: ["Intuición", "Iluminación", "Inspiración"],
      description: "El 11 es un número maestro de alta vibración espiritual...",
      strengths: ["Intuición extraordinaria", "Capacidad de inspirar a otros", "Conexión espiritual profunda"],
      challenges: ["Nerviosismo y ansiedad", "Expectativas muy altas", "Dificultad para materializar ideas"],
      careers: ["Líder espiritual", "Artista", "Inventor", "Sanador"],
      lifePurpose: "Iluminar y elevar la consciencia colectiva",
      lessonsToLearn: ["Practicidad", "Paciencia", "Autocontrol"],
      isMaster: true,
    },
    22: {
      number: 22,
      name: "El Constructor Maestro",
      keywords: ["Manifestación", "Visión", "Poder"],
      description: "El 22 combina la visión del 11 con la practicidad del 4...",
      strengths: ["Capacidad de materializar grandes visiones", "Liderazgo natural", "Pensamiento a gran escala"],
      challenges: ["Presión autoimpuesta", "Tendencia al workaholism", "Frustración cuando no se alcanzan metas"],
      careers: ["Arquitecto", "Político", "CEO", "Filántropo"],
      lifePurpose: "Construir legados que beneficien a la humanidad",
      lessonsToLearn: ["Equilibrio", "Delegación", "Paciencia"],
      isMaster: true,
    },
    33: {
      number: 33,
      name: "El Maestro Sanador",
      keywords: ["Compasión", "Servicio", "Amor incondicional"],
      description: "El 33 es el más elevado de los números maestros...",
      strengths: ["Compasión ilimitada", "Capacidad de sanar", "Devoción al servicio"],
      challenges: ["Sacrificio excesivo", "Agotamiento emocional", "Descuidar necesidades propias"],
      careers: ["Sanador", "Maestro espiritual", "Humanitario", "Artista"],
      lifePurpose: "Elevar a la humanidad a través del amor",
      lessonsToLearn: ["Autocuidado", "Límites", "Equilibrio"],
      isMaster: true,
    },
  };
  ```

- [ ] Crear datos de compatibilidad:

  ```typescript
  export type CompatibilityLevel = "high" | "medium" | "low";

  export interface Compatibility {
    numbers: [number, number];
    level: CompatibilityLevel;
    description: string;
    strengths: string[];
    challenges: string[];
  }

  export const COMPATIBILITY_DATA: Compatibility[] = [
    {
      numbers: [1, 1],
      level: "medium",
      description: "Dos líderes pueden chocar o complementarse",
      strengths: ["Ambición compartida", "Respeto mutuo"],
      challenges: ["Competencia", "Luchas de poder"],
    },
    {
      numbers: [1, 2],
      level: "high",
      description: "El líder y el diplomático se equilibran",
      strengths: ["Complementariedad", "Equilibrio"],
      challenges: ["El 1 puede dominar", "El 2 puede ceder demasiado"],
    },
    // ... más combinaciones
  ];

  export function getCompatibility(num1: number, num2: number): Compatibility | null {
    return (
      COMPATIBILITY_DATA.find(
        (c) => (c.numbers[0] === num1 && c.numbers[1] === num2) || (c.numbers[0] === num2 && c.numbers[1] === num1),
      ) || null
    );
  }
  ```

---

#### 🎯 Criterios de Aceptación

- [ ] Interpretaciones para números 1-9
- [ ] Interpretaciones para maestros 11, 22, 33
- [ ] Datos de compatibilidad básicos
- [ ] Contenido en español

---

### TASK-202: Crear módulo y servicio de Numerología

**Módulo:** `src/modules/numerology/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-200, TASK-201

---

#### 📋 Descripción

Crear el módulo NestJS y servicio principal que expone los cálculos e interpretaciones.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
src/modules/numerology/
├── numerology.module.ts
├── numerology.service.ts
├── numerology.service.spec.ts
├── dto/
│   ├── calculate-numerology.dto.ts
│   └── numerology-response.dto.ts
└── data/
    ├── interpretations.data.ts
    └── compatibility.data.ts
```

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `calculate-numerology.dto.ts`:

  ```typescript
  import { ApiProperty } from "@nestjs/swagger";
  import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

  export class CalculateNumerologyDto {
    @ApiProperty({
      example: "1990-03-25",
      description: "Fecha de nacimiento",
    })
    @IsDateString()
    birthDate: string;

    @ApiProperty({
      example: "Juan Carlos Pérez",
      description: "Nombre completo (opcional)",
      required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    fullName?: string;
  }
  ```

- [ ] Crear `numerology-response.dto.ts`:

  ```typescript
  import { ApiProperty } from "@nestjs/swagger";

  export class NumberDetailDto {
    @ApiProperty({ example: 7 })
    value: number;

    @ApiProperty({ example: "El Buscador" })
    name: string;

    @ApiProperty({ example: ["Análisis", "Introspección"] })
    keywords: string[];

    @ApiProperty()
    description: string;

    @ApiProperty({ example: false })
    isMaster: boolean;
  }

  export class NumerologyResponseDto {
    @ApiProperty({ type: NumberDetailDto })
    lifePath: NumberDetailDto;

    @ApiProperty({ type: NumberDetailDto })
    birthday: NumberDetailDto;

    @ApiProperty({ type: NumberDetailDto, nullable: true })
    expression: NumberDetailDto | null;

    @ApiProperty({ type: NumberDetailDto, nullable: true })
    soulUrge: NumberDetailDto | null;

    @ApiProperty({ type: NumberDetailDto, nullable: true })
    personality: NumberDetailDto | null;

    @ApiProperty({ example: 5 })
    personalYear: number;

    @ApiProperty({ example: 8 })
    personalMonth: number;

    @ApiProperty({ example: "1990-03-25" })
    birthDate: string;

    @ApiProperty({ example: "Juan Pérez", nullable: true })
    fullName: string | null;
  }
  ```

- [ ] Crear `numerology.service.ts`:

  ```typescript
  import { Injectable } from "@nestjs/common";
  import { calculateAllNumbers, NumerologyResult } from "@/common/utils/numerology.utils";
  import { LIFE_PATH_INTERPRETATIONS, NumberInterpretation } from "./data/interpretations.data";
  import { getCompatibility, Compatibility } from "./data/compatibility.data";
  import { CalculateNumerologyDto } from "./dto/calculate-numerology.dto";
  import { NumerologyResponseDto, NumberDetailDto } from "./dto/numerology-response.dto";

  @Injectable()
  export class NumerologyService {
    /**
     * Calcula todos los números e incluye interpretaciones
     */
    calculate(dto: CalculateNumerologyDto): NumerologyResponseDto {
      const birthDate = new Date(dto.birthDate);
      const result = calculateAllNumbers(birthDate, dto.fullName);

      return {
        lifePath: this.getNumberDetail(result.lifePath),
        birthday: this.getNumberDetail(result.birthday),
        expression: result.expression ? this.getNumberDetail(result.expression) : null,
        soulUrge: result.soulUrge ? this.getNumberDetail(result.soulUrge) : null,
        personality: result.personality ? this.getNumberDetail(result.personality) : null,
        personalYear: result.personalYear,
        personalMonth: result.personalMonth,
        birthDate: result.birthDate,
        fullName: result.fullName,
      };
    }

    /**
     * Obtiene interpretación detallada de un número
     */
    getInterpretation(number: number): NumberInterpretation | null {
      return LIFE_PATH_INTERPRETATIONS[number] || null;
    }

    /**
     * Obtiene compatibilidad entre dos números
     */
    getCompatibility(num1: number, num2: number): Compatibility | null {
      return getCompatibility(num1, num2);
    }

    /**
     * Construye el detalle de un número con interpretación
     */
    private getNumberDetail(number: number): NumberDetailDto {
      const interpretation = LIFE_PATH_INTERPRETATIONS[number];

      if (!interpretation) {
        return {
          value: number,
          name: `Número ${number}`,
          keywords: [],
          description: "",
          isMaster: [11, 22, 33].includes(number),
        };
      }

      return {
        value: number,
        name: interpretation.name,
        keywords: interpretation.keywords,
        description: interpretation.description,
        isMaster: interpretation.isMaster,
      };
    }
  }
  ```

- [ ] Crear `numerology.module.ts`:

  ```typescript
  import { Module } from "@nestjs/common";
  import { NumerologyService } from "./numerology.service";
  import { NumerologyController } from "./numerology.controller";

  @Module({
    providers: [NumerologyService],
    controllers: [NumerologyController],
    exports: [NumerologyService],
  })
  export class NumerologyModule {}
  ```

- [ ] Registrar en `app.module.ts`

##### Testing

- [ ] Test: Service calcula números correctamente
- [ ] Test: Interpretaciones se incluyen
- [ ] Test: Números sin nombre retornan null en expression/soul/personality
- [ ] Test: getCompatibility funciona

---

#### 🎯 Criterios de Aceptación

- [ ] Servicio calcula todos los números
- [ ] Interpretaciones se adjuntan
- [ ] DTOs documentados con Swagger
- [ ] Tests unitarios pasan

# Backend: Entidad y Servicio de Interpretación IA (PREMIUM)

---

### TASK-202b: Crear entidad y servicio de interpretación IA para usuarios Premium

**Módulo:** `src/modules/numerology/`
**Prioridad:** 🔴 ALTA
**Estimación:** 1 día
**Dependencias:** TASK-202

---

#### 📋 Descripción

Crear la entidad para persistir la interpretación IA del usuario premium. La interpretación se genera **una única vez** por usuario y se almacena permanentemente. Si el usuario ya tiene una interpretación, se retorna la existente.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
src/modules/numerology/
├── entities/
│   └── numerology-interpretation.entity.ts
├── prompts/
│   └── numerology-interpretation.prompt.ts
├── guards/
│   └── requires-premium-for-numerology-ai.guard.ts
└── dto/
    └── numerology-interpretation-response.dto.ts
```

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear entidad `NumerologyInterpretation`:

  ```typescript
  // src/modules/numerology/entities/numerology-interpretation.entity.ts
  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
  import { User } from "@/modules/users/entities/user.entity";

  @Entity("numerology_interpretations")
  @Index("idx_numerology_interpretation_user", ["userId"], { unique: true })
  export class NumerologyInterpretation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "user_id" })
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    // === NÚMEROS CALCULADOS (snapshot al momento de generar) ===
    @Column({ name: "life_path", type: "smallint" })
    lifePath: number;

    @Column({ name: "birthday_number", type: "smallint" })
    birthdayNumber: number;

    @Column({ name: "expression_number", type: "smallint", nullable: true })
    expressionNumber: number | null;

    @Column({ name: "soul_urge", type: "smallint", nullable: true })
    soulUrge: number | null;

    @Column({ name: "personality", type: "smallint", nullable: true })
    personality: number | null;

    @Column({ name: "birth_date", type: "date" })
    birthDate: Date;

    @Column({ name: "full_name", type: "varchar", length: 100, nullable: true })
    fullName: string | null;

    // === INTERPRETACIÓN GENERADA ===
    @Column({ type: "text" })
    interpretation: string;

    // === METADATA DE IA ===
    @Column({ name: "ai_provider", type: "varchar", length: 50 })
    aiProvider: string;

    @Column({ name: "ai_model", type: "varchar", length: 100 })
    aiModel: string;

    @Column({ name: "tokens_used", type: "int", default: 0 })
    tokensUsed: number;

    @Column({ name: "generation_time_ms", type: "int", default: 0 })
    generationTimeMs: number;

    @CreateDateColumn({ name: "generated_at" })
    generatedAt: Date;
  }
  ```

- [ ] Crear migración para la tabla:

  ```typescript
  // src/database/migrations/XXXXXX-CreateNumerologyInterpretation.ts
  export class CreateNumerologyInterpretation implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: "numerology_interpretations",
          columns: [
            { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
            { name: "user_id", type: "int", isUnique: true },
            { name: "life_path", type: "smallint" },
            { name: "birthday_number", type: "smallint" },
            { name: "expression_number", type: "smallint", isNullable: true },
            { name: "soul_urge", type: "smallint", isNullable: true },
            { name: "personality", type: "smallint", isNullable: true },
            { name: "birth_date", type: "date" },
            { name: "full_name", type: "varchar", length: "100", isNullable: true },
            { name: "interpretation", type: "text" },
            { name: "ai_provider", type: "varchar", length: "50" },
            { name: "ai_model", type: "varchar", length: "100" },
            { name: "tokens_used", type: "int", default: 0 },
            { name: "generation_time_ms", type: "int", default: 0 },
            { name: "generated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          ],
          foreignKeys: [
            {
              columnNames: ["user_id"],
              referencedTableName: "user",
              referencedColumnNames: ["id"],
              onDelete: "CASCADE",
            },
          ],
        }),
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("numerology_interpretations");
    }
  }
  ```

- [ ] Crear prompt de interpretación IA:

  ```typescript
  // src/modules/numerology/prompts/numerology-interpretation.prompt.ts

  export const NUMEROLOGY_SYSTEM_PROMPT = `Eres un numerólogo experto con décadas de experiencia en interpretación de perfiles numerológicos.
  Tu tarea es crear una interpretación personalizada y profunda basada en la combinación única de números del consultante.
  ```

REGLAS:

- Escribe en español, con un tono cálido pero profesional
- Relaciona los diferentes números entre sí, mostrando cómo se complementan o desafían
- Sé específico y evita generalidades vagas
- Incluye consejos prácticos basados en los números
- La interpretación debe ser de 400-600 palabras
- Usa formato markdown con encabezados para organizar la respuesta
- NO inventes números ni datos que no se te proporcionaron`;

  export function buildNumerologyUserPrompt(data: {
  lifePath: number;
  birthdayNumber: number;
  expressionNumber: number | null;
  soulUrge: number | null;
  personality: number | null;
  personalYear: number;
  fullName: string | null;
  }): string {
  const hasNameNumbers = data.expressionNumber !== null;

  return `Genera una interpretación numerológica personalizada para el siguiente perfil:

## NÚMEROS DEL CONSULTANTE

### Desde la fecha de nacimiento:

- **Camino de Vida:** ${data.lifePath} ${isMasterNumber(data.lifePath) ? '(Número Maestro)' : ''}
- **Número del Día:** ${data.birthdayNumber}
- **Año Personal ${new Date().getFullYear()}:** ${data.personalYear}

${hasNameNumbers ? `### Desde el nombre (${data.fullName}):

- **Expresión/Destino:** ${data.expressionNumber} ${isMasterNumber(data.expressionNumber!) ? '(Número Maestro)' : ''}
- **Número del Alma:** ${data.soulUrge}
- **Personalidad:** ${data.personality}` : '### Sin números de nombre disponibles'}

## ESTRUCTURA DE LA RESPUESTA

Organiza tu interpretación así:

### 🌟 Tu Esencia Numerológica

(Resumen de quién eres según tus números principales)

### 🛤️ Tu Camino de Vida (${data.lifePath})

(Propósito, lecciones de vida, dirección)

${hasNameNumbers ? `### 💫 Tu Potencial y Deseos Internos
(Cómo se relacionan Expresión, Alma y Personalidad)` : ''}

### 📅 Tu Ciclo Actual (Año Personal ${data.personalYear})

(Qué energías predominan este año, qué cultivar)

### 💡 Consejos Prácticos

(3-4 recomendaciones específicas basadas en tus números)`;
}

function isMasterNumber(num: number): boolean {
return [11, 22, 33].includes(num);
}

````

- [ ] Agregar métodos al servicio:

```typescript
// Agregar a NumerologyService

@Injectable()
export class NumerologyService {
  constructor(
    @InjectRepository(NumerologyInterpretation)
    private readonly interpretationRepo: Repository<NumerologyInterpretation>,
    private readonly aiProviderService: AIProviderService,
  ) {}

  /**
   * Obtiene interpretación existente del usuario
   */
  async getExistingInterpretation(userId: number): Promise<NumerologyInterpretation | null> {
    return this.interpretationRepo.findOne({ where: { userId } });
  }

  /**
   * Genera y guarda interpretación IA (solo si no existe)
   */
  async generateAndSaveInterpretation(user: User): Promise<NumerologyInterpretation> {
    // Verificar que no exista
    const existing = await this.getExistingInterpretation(user.id);
    if (existing) {
      return existing;
    }

    // Calcular números
    const birthDate = new Date(user.birthDate);
    const numbers = calculateAllNumbers(birthDate, user.name);

    // Generar con IA
    const startTime = Date.now();
    const prompt = buildNumerologyUserPrompt({
      lifePath: numbers.lifePath,
      birthdayNumber: numbers.birthday,
      expressionNumber: numbers.expression,
      soulUrge: numbers.soulUrge,
      personality: numbers.personality,
      personalYear: numbers.personalYear,
      fullName: user.name,
    });

    const aiResponse = await this.aiProviderService.generateCompletion(
      [
        { role: 'system', content: NUMEROLOGY_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.7, maxTokens: 1500 },
    );

    const generationTimeMs = Date.now() - startTime;

    // Crear y guardar entidad
    const interpretation = this.interpretationRepo.create({
      userId: user.id,
      lifePath: numbers.lifePath,
      birthdayNumber: numbers.birthday,
      expressionNumber: numbers.expression,
      soulUrge: numbers.soulUrge,
      personality: numbers.personality,
      birthDate: birthDate,
      fullName: user.name,
      interpretation: aiResponse.content,
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      tokensUsed: aiResponse.totalTokens || 0,
      generationTimeMs,
    });

    return this.interpretationRepo.save(interpretation);
  }
}
````

- [ ] Crear DTO de respuesta:

  ```typescript
  // src/modules/numerology/dto/numerology-interpretation-response.dto.ts
  import { ApiProperty } from "@nestjs/swagger";

  export class NumerologyInterpretationResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 123 })
    userId: number;

    @ApiProperty()
    interpretation: string;

    @ApiProperty({ example: 7 })
    lifePath: number;

    @ApiProperty({ example: 5, nullable: true })
    expression: number | null;

    @ApiProperty({ example: 3, nullable: true })
    soulUrge: number | null;

    @ApiProperty({ example: 2, nullable: true })
    personality: number | null;

    @ApiProperty({ example: 25 })
    birthday: number;

    @ApiProperty()
    generatedAt: string;

    @ApiProperty({ example: "groq" })
    aiProvider: string;

    @ApiProperty({ example: "llama-3.1-70b-versatile" })
    aiModel: string;
  }
  ```

- [ ] Registrar entidad en el módulo

##### Testing

- [ ] Test: generateAndSaveInterpretation crea nueva interpretación
- [ ] Test: generateAndSaveInterpretation retorna existente si ya existe
- [ ] Test: getExistingInterpretation retorna null si no existe
- [ ] Test: La interpretación se guarda con todos los campos correctos
- [ ] Test: La entidad tiene constraint UNIQUE en userId

---

#### 🎯 Criterios de Aceptación

- [ ] Entidad creada con migración
- [ ] Solo se genera una interpretación por usuario
- [ ] Se almacena metadata de IA (provider, model, tokens)
- [ ] El prompt genera interpretaciones coherentes
- [ ] Tests cubren el flujo completo

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - La interpretación se genera UNA SOLA VEZ por usuario
> - Si el usuario ya tiene interpretación, se retorna la existente (no se regenera)
> - El constraint UNIQUE en userId previene duplicados a nivel de DB
> - Se guarda un "snapshot" de los números al momento de generar
> - El costo de IA se trackea en `AIUsageLog` automáticamente por el `AIProviderService`

---

# Backend: Endpoints

---

### TASK-203: Crear endpoints de Numerología

**Módulo:** `src/modules/numerology/infrastructure/controllers/`
**Prioridad:** 🔴 ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-202

---

#### 📋 Descripción

Implementar endpoints REST para calcular numerología y consultar significados.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/numerology/infrastructure/controllers/numerology.controller.ts`
- `src/modules/numerology/infrastructure/controllers/numerology.controller.spec.ts`

**Endpoints:**

| Método | Ruta                               | Descripción               | Auth         |
| ------ | ---------------------------------- | ------------------------- | ------------ |
| POST   | `/numerology/calculate`            | Calcular perfil (anónimo) | No           |
| GET    | `/numerology/my-profile`           | Mi perfil completo        | Sí           |
| POST   | `/numerology/my-profile/interpret` | Interpretación IA         | Sí (PREMIUM) |
| GET    | `/numerology/meanings`             | Todos los significados    | No           |
| GET    | `/numerology/meanings/:number`     | Significado de un número  | No           |
| GET    | `/numerology/day-number`           | Número del día actual     | No           |

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `NumerologyController`:

  ```typescript
  @ApiTags("Numerology")
  @Controller("numerology")
  export class NumerologyController {
    constructor(private readonly numerologyService: NumerologyService) {}

    /**
     * POST /numerology/calculate
     * Calcula perfil básico (para anónimos y widget)
     */
    @Post("calculate")
    @ApiOperation({ summary: "Calcular perfil numerológico básico" })
    @ApiResponse({ status: 200, type: NumerologyProfileDto })
    async calculate(@Body() dto: CalculateNumerologyDto): Promise<NumerologyProfileDto> {
      const birthDate = new Date(dto.birthDate);
      return this.numerologyService.calculateProfile(
        birthDate,
        dto.fullName,
        false, // Sin interpretación IA
      );
    }

    /**
     * GET /numerology/my-profile
     * Perfil completo del usuario autenticado
     */
    @Get("my-profile")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener mi perfil numerológico" })
    @ApiResponse({ status: 200, type: NumerologyProfileDto })
    @ApiResponse({ status: 400, description: "Sin fecha de nacimiento" })
    async getMyProfile(@CurrentUser() user: User): Promise<NumerologyProfileDto> {
      if (!user.birthDate) {
        throw new BadRequestException("Configura tu fecha de nacimiento para ver tu perfil");
      }

      return this.numerologyService.calculateProfile(user.birthDate, user.name, false);
    }

    /**
     * POST /numerology/my-profile/interpret
     * Genera interpretación IA (solo PREMIUM)
     * Usa el mismo patrón de guards que readings
     */
    @Post("my-profile/interpret")
    @UseGuards(JwtAuthGuard, RequiresPremiumForNumerologyAIGuard, AIQuotaGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Generar interpretación IA (PREMIUM)" })
    @ApiResponse({ status: 200, type: NumerologyInterpretationResponseDto })
    @ApiResponse({ status: 403, description: "Requiere plan PREMIUM" })
    @ApiResponse({ status: 409, description: "Ya existe una interpretación" })
    async interpretMyProfile(@CurrentUser() user: User): Promise<NumerologyInterpretationResponseDto> {
      if (!user.birthDate) {
        throw new BadRequestException("Configura tu fecha de nacimiento");
      }

      // Verifica si ya existe interpretación (se genera una sola vez)
      const existing = await this.numerologyService.getExistingInterpretation(user.id);
      if (existing) {
        return existing;
      }

      return this.numerologyService.generateAndSaveInterpretation(user);
    }

    /**
     * GET /numerology/meanings
     * Lista todos los significados (para galería)
     */
    @Get("meanings")
    @ApiOperation({ summary: "Obtener todos los significados" })
    @ApiResponse({ status: 200, type: [NumerologyMeaning] })
    async getAllMeanings(): Promise<NumerologyMeaning[]> {
      return this.numerologyService.getAllMeanings();
    }

    /**
     * GET /numerology/meanings/:number
     * Significado de un número específico
     */
    @Get("meanings/:number")
    @ApiOperation({ summary: "Obtener significado de un número" })
    @ApiParam({ name: "number", example: 7 })
    @ApiResponse({ status: 200, type: NumerologyMeaning })
    @ApiResponse({ status: 404, description: "Número no encontrado" })
    async getMeaning(@Param("number", ParseIntPipe) number: number): Promise<NumerologyMeaning> {
      // Validar que sea un número válido
      const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
      if (!validNumbers.includes(number)) {
        throw new BadRequestException("Número inválido. Debe ser 1-9, 11, 22 o 33");
      }

      const meaning = await this.numerologyService.getMeaning(number);
      if (!meaning) {
        throw new NotFoundException(`Significado del ${number} no encontrado`);
      }

      return meaning;
    }

    /**
     * GET /numerology/day-number
     * Número del día actual (para widget)
     */
    @Get("day-number")
    @ApiOperation({ summary: "Obtener número del día actual" })
    @ApiResponse({
      status: 200,
      schema: {
        type: "object",
        properties: {
          date: { type: "string", example: "2026-01-17" },
          dayNumber: { type: "number", example: 8 },
          meaning: { type: "object" },
        },
      },
    })
    async getDayNumber(): Promise<{
      date: string;
      dayNumber: number;
      meaning: NumerologyMeaning | null;
    }> {
      const today = new Date();
      const dayNumber = calculateDayNumber(today);
      const meaning = await this.numerologyService.getMeaning(dayNumber);

      return {
        date: today.toISOString().split("T")[0],
        dayNumber,
        meaning,
      };
    }
  }
  ```

- [ ] Crear guard `RequiresPremiumForNumerologyAIGuard` (siguiendo patrón existente):

  ```typescript
  // src/modules/numerology/guards/requires-premium-for-numerology-ai.guard.ts
  import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
  import { UserPlan } from "@/modules/users/entities/user.entity";

  interface RequestWithUser extends Request {
    user: { userId: number; plan: UserPlan };
  }

  @Injectable()
  export class RequiresPremiumForNumerologyAIGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException("Usuario no autenticado");
      }

      // Solo usuarios PREMIUM pueden generar interpretación IA
      if (user.plan !== UserPlan.PREMIUM) {
        throw new ForbiddenException(
          "Las interpretaciones numerológicas con IA están disponibles solo para usuarios Premium. " +
            "Actualiza tu plan para desbloquear esta funcionalidad.",
        );
      }

      return true;
    }
  }
  ```

  > **Nota:** Este guard sigue el mismo patrón que `RequiresPremiumForAIGuard` en el módulo de readings.

- [ ] Agregar controller al módulo

- [ ] Documentar con Swagger

##### Testing

- [ ] Test e2e: POST /numerology/calculate funciona
- [ ] Test e2e: GET /numerology/my-profile sin auth → 401
- [ ] Test e2e: GET /numerology/my-profile sin birthDate → 400
- [ ] Test e2e: POST /numerology/my-profile/interpret sin PREMIUM → 403
- [ ] Test e2e: GET /numerology/meanings retorna 12
- [ ] Test e2e: GET /numerology/meanings/7 retorna significado
- [ ] Test e2e: GET /numerology/meanings/99 → 400
- [ ] Test e2e: GET /numerology/day-number retorna número

---

#### 🎯 Criterios de Aceptación

- [ ] Todos los endpoints funcionan
- [ ] Validación de plan para interpretación IA
- [ ] Validación de números (1-9, 11, 22, 33)
- [ ] Documentación Swagger completa
- [ ] Tests cubren todos los casos

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El endpoint `/calculate` es público (para widget de anónimos)
> - Solo `/my-profile/interpret` requiere PREMIUM
> - Usar `PlanGuard` con decorador `@RequiredPlan`
> - Validar que el número esté en [1-9, 11, 22, 33]
> - El día número cambia diariamente, no cachear largo tiempo

# Frontend: Types, API y Hooks

---

### TASK-204: Crear tipos TypeScript y API client para Numerología

**Módulo:** `frontend/src/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 0.5 días
**Dependencias:** TASK-203

---

#### 📋 Descripción

Crear los tipos TypeScript, endpoints y funciones de API para numerología.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/types/numerology.types.ts`
- `frontend/src/lib/api/numerology-api.ts`
- `frontend/src/lib/utils/numerology.ts`
- `frontend/src/hooks/api/useNumerology.ts`

**Archivos a modificar:**

- `frontend/src/lib/api/endpoints.ts`
- `frontend/src/types/index.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `numerology.types.ts` (alineado con DTOs del backend):

  ```typescript
  /**
   * Coincide con NumberDetailDto del backend
   */
  export interface NumberDetailDto {
    value: number;
    name: string;
    keywords: string[];
    description: string;
    isMaster: boolean;
  }

  /**
   * Coincide con NumerologyResponseDto del backend
   */
  export interface NumerologyResponseDto {
    lifePath: NumberDetailDto;
    birthday: NumberDetailDto;
    expression: NumberDetailDto | null;
    soulUrge: NumberDetailDto | null;
    personality: NumberDetailDto | null;
    personalYear: number;
    personalMonth: number;
    birthDate: string;
    fullName: string | null;
  }

  /**
   * Respuesta de interpretación IA (PREMIUM)
   * Coincide con NumerologyInterpretationResponseDto del backend
   */
  export interface NumerologyInterpretationResponseDto {
    id: number;
    userId: number;
    interpretation: string;
    lifePath: number;
    expression: number | null;
    soulUrge: number | null;
    personality: number | null;
    birthday: number;
    generatedAt: string;
    aiProvider: string;
    aiModel: string;
  }

  /**
   * Significado de un número
   */
  export interface NumerologyMeaning {
    number: number;
    name: string;
    keywords: string[];
    description: string;
    strengths: string[];
    challenges: string[];
    careers: string[];
    lifePurpose?: string;
    lessonsToLearn?: string[];
    isMaster: boolean;
  }

  export interface DayNumberResponse {
    date: string;
    dayNumber: number;
    meaning: NumerologyMeaning | null;
  }

  export interface CalculateNumerologyRequest {
    birthDate: string;
    fullName?: string;
  }

  /**
   * Compatibilidad entre números
   */
  export type CompatibilityLevel = "high" | "medium" | "low";

  export interface Compatibility {
    numbers: [number, number];
    level: CompatibilityLevel;
    description: string;
    strengths: string[];
    challenges: string[];
  }
  ```

- [ ] Agregar endpoints en `endpoints.ts`:

  ```typescript
  export const API_ENDPOINTS = {
    // ...existentes

    NUMEROLOGY: {
      CALCULATE: "/numerology/calculate",
      MY_PROFILE: "/numerology/my-profile",
      INTERPRET: "/numerology/my-profile/interpret",
      MEANINGS: "/numerology/meanings",
      MEANING_BY_NUMBER: (num: number) => `/numerology/meanings/${num}`,
      DAY_NUMBER: "/numerology/day-number",
    },
  } as const;
  ```

- [ ] Crear `numerology-api.ts`:

  ```typescript
  import { apiClient } from "./axios-config";
  import { API_ENDPOINTS } from "./endpoints";
  import type {
    NumerologyResponseDto,
    NumerologyInterpretationResponseDto,
    NumerologyMeaning,
    DayNumberResponse,
    CalculateNumerologyRequest,
  } from "@/types/numerology.types";

  /**
   * Calcula perfil numerológico (público)
   */
  export async function calculateNumerology(data: CalculateNumerologyRequest): Promise<NumerologyResponseDto> {
    const response = await apiClient.post<NumerologyResponseDto>(API_ENDPOINTS.NUMEROLOGY.CALCULATE, data);
    return response.data;
  }

  /**
   * Obtiene mi perfil numerológico (requiere auth)
   */
  export async function getMyNumerologyProfile(): Promise<NumerologyResponseDto> {
    const response = await apiClient.get<NumerologyResponseDto>(API_ENDPOINTS.NUMEROLOGY.MY_PROFILE);
    return response.data;
  }

  /**
   * Genera interpretación IA (PREMIUM)
   */
  export async function generateNumerologyInterpretation(): Promise<NumerologyInterpretationResponseDto> {
    const response = await apiClient.post<NumerologyInterpretationResponseDto>(API_ENDPOINTS.NUMEROLOGY.INTERPRET);
    return response.data;
  }

  /**
   * Obtiene todos los significados
   */
  export async function getAllNumerologyMeanings(): Promise<NumerologyMeaning[]> {
    const response = await apiClient.get<NumerologyMeaning[]>(API_ENDPOINTS.NUMEROLOGY.MEANINGS);
    return response.data;
  }

  /**
   * Obtiene significado de un número
   */
  export async function getNumerologyMeaning(number: number): Promise<NumerologyMeaning> {
    const response = await apiClient.get<NumerologyMeaning>(API_ENDPOINTS.NUMEROLOGY.MEANING_BY_NUMBER(number));
    return response.data;
  }

  /**
   * Obtiene número del día actual
   */
  export async function getDayNumber(): Promise<DayNumberResponse> {
    const response = await apiClient.get<DayNumberResponse>(API_ENDPOINTS.NUMEROLOGY.DAY_NUMBER);
    return response.data;
  }
  ```

- [ ] Crear `lib/utils/numerology.ts` (cálculos cliente):

  ```typescript
  /**
   * Reduce un número a un solo dígito (1-9)
   * Preserva números maestros (11, 22, 33)
   */
  export function reduceToSingleDigit(num: number, preserveMasterNumbers: boolean = true): number {
    if (preserveMasterNumbers && [11, 22, 33].includes(num)) {
      return num;
    }

    while (num > 9) {
      num = String(num)
        .split("")
        .reduce((sum, digit) => sum + parseInt(digit), 0);

      if (preserveMasterNumbers && [11, 22, 33].includes(num)) {
        return num;
      }
    }

    return num;
  }

  /**
   * Calcula número de vida (para preview rápido)
   */
  export function calculateLifePathNumber(birthDate: Date): number {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    const yearReduced = reduceToSingleDigit(year, true);
    const monthReduced = reduceToSingleDigit(month, true);
    const dayReduced = reduceToSingleDigit(day, true);

    const total = yearReduced + monthReduced + dayReduced;
    return reduceToSingleDigit(total, true);
  }

  /**
   * Info básica de números para UI
   */
  export const NUMEROLOGY_NUMBERS_INFO: Record<
    number,
    {
      name: string;
      emoji: string;
      color: string;
    }
  > = {
    1: { name: "El Líder", emoji: "👑", color: "text-red-500" },
    2: { name: "El Diplomático", emoji: "🤝", color: "text-blue-500" },
    3: { name: "El Creativo", emoji: "🎨", color: "text-yellow-500" },
    4: { name: "El Constructor", emoji: "🏗️", color: "text-green-500" },
    5: { name: "El Aventurero", emoji: "🌍", color: "text-orange-500" },
    6: { name: "El Protector", emoji: "💖", color: "text-pink-500" },
    7: { name: "El Buscador", emoji: "🔮", color: "text-purple-500" },
    8: { name: "El Exitoso", emoji: "💎", color: "text-amber-500" },
    9: { name: "El Humanitario", emoji: "🕊️", color: "text-teal-500" },
    11: { name: "El Visionario", emoji: "✨", color: "text-indigo-500" },
    22: { name: "El Constructor Maestro", emoji: "🌟", color: "text-cyan-500" },
    33: { name: "El Maestro Sanador", emoji: "💫", color: "text-rose-500" },
  };
  ```

- [ ] Crear `useNumerology.ts`:

  ```typescript
  "use client";

  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import {
    calculateNumerology,
    getMyNumerologyProfile,
    generateNumerologyInterpretation,
    getAllNumerologyMeanings,
    getNumerologyMeaning,
    getDayNumber,
  } from "@/lib/api/numerology-api";
  import type { CalculateNumerologyRequest } from "@/types/numerology.types";

  export const numerologyQueryKeys = {
    all: ["numerology"] as const,
    myProfile: () => [...numerologyQueryKeys.all, "my-profile"] as const,
    meanings: () => [...numerologyQueryKeys.all, "meanings"] as const,
    meaning: (num: number) => [...numerologyQueryKeys.all, "meaning", num] as const,
    dayNumber: () => [...numerologyQueryKeys.all, "day-number"] as const,
  } as const;

  /**
   * Hook para obtener mi perfil numerológico
   */
  export function useMyNumerologyProfile() {
    return useQuery({
      queryKey: numerologyQueryKeys.myProfile(),
      queryFn: getMyNumerologyProfile,
      staleTime: 1000 * 60 * 60, // 1 hora
      retry: false,
    });
  }

  /**
   * Hook para calcular perfil (público)
   */
  export function useCalculateNumerology() {
    return useMutation({
      mutationFn: (data: CalculateNumerologyRequest) => calculateNumerology(data),
    });
  }

  /**
   * Hook para generar interpretación IA
   */
  export function useGenerateInterpretation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: generateNumerologyInterpretation,
      onSuccess: (data) => {
        // Actualizar cache del perfil
        queryClient.setQueryData(numerologyQueryKeys.myProfile(), data);
      },
    });
  }

  /**
   * Hook para obtener todos los significados
   */
  export function useNumerologyMeanings() {
    return useQuery({
      queryKey: numerologyQueryKeys.meanings(),
      queryFn: getAllNumerologyMeanings,
      staleTime: 1000 * 60 * 60 * 24, // 24 horas (no cambian)
    });
  }

  /**
   * Hook para obtener significado de un número
   */
  export function useNumerologyMeaning(number: number | null) {
    return useQuery({
      queryKey: numerologyQueryKeys.meaning(number!),
      queryFn: () => getNumerologyMeaning(number!),
      enabled: number !== null && number > 0,
      staleTime: 1000 * 60 * 60 * 24,
    });
  }

  /**
   * Hook para obtener número del día
   */
  export function useDayNumber() {
    return useQuery({
      queryKey: numerologyQueryKeys.dayNumber(),
      queryFn: getDayNumber,
      staleTime: 1000 * 60 * 60, // 1 hora
    });
  }
  ```

- [ ] Exportar desde `types/index.ts`

##### Testing

- [ ] Test: Tipos se exportan correctamente
- [ ] Test: calculateLifePathNumber funciona en cliente
- [ ] Test: Hooks retornan datos esperados
- [ ] Test: useMutation actualiza cache

---

#### 🎯 Criterios de Aceptación

- [ ] Tipos completos
- [ ] API functions cubren todos los endpoints
- [ ] Cálculo cliente para preview rápido
- [ ] Hooks con staleTime apropiado

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Los significados se cachean 24h (no cambian)
> - El perfil del usuario se cachea 1h
> - El número del día se cachea 1h (cambia diariamente)
> - Hay cálculo en cliente para preview sin llamar API

# Frontend: Componentes UI

---

### TASK-205: Crear componentes UI de Numerología

**Módulo:** `frontend/src/components/features/numerology/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 1 día
**Dependencias:** TASK-204

---

#### 📋 Descripción

Crear los componentes de UI para numerología: calculadora, tarjetas de números, perfil completo y widget.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/numerology/
├── index.ts
├── NumerologyIntro.tsx        # Introducción explicativa
├── NumerologyCalculator.tsx
├── NumberCard.tsx
├── NumberGallery.tsx
├── NumerologyProfile.tsx
├── NumerologyWidget.tsx
├── NumerologySkeleton.tsx
└── __tests__/
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `NumerologyIntro.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { cn } from "@/lib/utils";

  interface NumerologyIntroProps {
    className?: string;
  }

  export function NumerologyIntro({ className }: NumerologyIntroProps) {
    return (
      <Card
        className={cn(
          "p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20",
          className,
        )}
      >
        <h2 className="font-serif text-xl mb-3">¿Qué es la Numerología?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          La numerología es un sistema ancestral que estudia la relación entre los números y los eventos de la vida. A
          través de tu fecha de nacimiento y nombre, podemos descubrir aspectos profundos de tu personalidad, propósito
          de vida y ciclos personales.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">📅 Desde tu fecha</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>• Camino de Vida</li>
              <li>• Número del Día</li>
              <li>• Año Personal</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">✨ Desde tu nombre</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>• Número de Expresión</li>
              <li>• Número del Alma</li>
              <li>• Personalidad</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 italic">
          Los números maestros (11, 22, 33) tienen un significado especial y no se reducen.
        </p>
      </Card>
    );
  }
  ```

- [ ] Crear `NumberCard.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { cn } from "@/lib/utils";
  import { NUMEROLOGY_NUMBERS_INFO } from "@/lib/utils/numerology";
  import type { NumberDetailDto } from "@/types/numerology.types";

  interface NumberCardProps {
    number: NumberDetailDto;
    context?: "lifePath" | "expression" | "soulUrge" | "personality" | "birthday" | "personalYear" | "personalMonth";
    variant?: "compact" | "full";
    onClick?: () => void;
    className?: string;
  }

  const CONTEXT_LABELS: Record<string, string> = {
    lifePath: "Camino de Vida",
    expression: "Expresión/Destino",
    soulUrge: "Número del Alma",
    personality: "Personalidad",
    birthday: "Número del Día",
    personalYear: "Año Personal",
    personalMonth: "Mes Personal",
  };

  export function NumberCard({ number, context, variant = "compact", onClick, className }: NumberCardProps) {
    const info = NUMEROLOGY_NUMBERS_INFO[number.value];

    return (
      <Card
        data-testid={`number-card-${number.value}`}
        className={cn("p-4 transition-all", onClick && "cursor-pointer hover:shadow-md", className)}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className={cn("text-4xl font-bold", info?.color || "text-primary")}>{number.value}</div>
          <div className="flex-1">
            {context && <p className="text-xs text-muted-foreground">{CONTEXT_LABELS[context]}</p>}
            <p className="font-serif text-lg">{number.name}</p>
            {number.isMaster && (
              <Badge variant="secondary" className="mt-1">
                Número Maestro ✨
              </Badge>
            )}
          </div>
          {info?.emoji && <span className="text-2xl">{info.emoji}</span>}
        </div>

        {variant === "full" && (
          <>
            <p className="mt-3 text-sm text-muted-foreground">{number.keywords.join(", ")}</p>
            <p className="mt-2 text-sm">{number.description}</p>
          </>
        )}
      </Card>
    );
  }
  ```

- [ ] Crear `NumberGallery.tsx`:

  ```tsx
  "use client";

  import { NumberCard } from "./NumberCard";
  import { Skeleton } from "@/components/ui/skeleton";
  import { useNumerologyMeanings } from "@/hooks/api/useNumerology";
  import { NUMEROLOGY_NUMBERS_INFO } from "@/lib/utils/numerology";

  interface NumberGalleryProps {
    onNumberClick?: (number: number) => void;
  }

  export function NumberGallery({ onNumberClick }: NumberGalleryProps) {
    const { data: meanings, isLoading } = useNumerologyMeanings();

    if (isLoading) {
      return (
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      );
    }

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

    return (
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {numbers.map((num) => {
          const meaning = meanings?.find((m) => m.number === num);
          const info = NUMEROLOGY_NUMBERS_INFO[num];

          return (
            <div
              key={num}
              data-testid={`gallery-number-${num}`}
              className="cursor-pointer p-4 text-center rounded-lg border 
                         hover:shadow-md transition-all hover:border-primary"
              onClick={() => onNumberClick?.(num)}
            >
              <span className={cn("text-3xl font-bold", info?.color)}>{num}</span>
              <p className="mt-1 text-sm font-medium">{meaning?.name || info?.name}</p>
              {[11, 22, 33].includes(num) && <span className="text-xs text-muted-foreground">Maestro</span>}
            </div>
          );
        })}
      </div>
    );
  }
  ```

- [ ] Crear `NumerologyCalculator.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { NumberCard } from "./NumberCard";
  import { useCalculateNumerology } from "@/hooks/api/useNumerology";
  import { calculateLifePathNumber } from "@/lib/utils/numerology";
  import type { NumerologyResponseDto } from "@/types/numerology.types";

  interface NumerologyCalculatorProps {
    onCalculated?: (profile: NumerologyResponseDto) => void;
    showNameField?: boolean;
  }

  export function NumerologyCalculator({ onCalculated, showNameField = false }: NumerologyCalculatorProps) {
    const [birthDate, setBirthDate] = useState("");
    const [fullName, setFullName] = useState("");
    const [quickResult, setQuickResult] = useState<number | null>(null);

    const { mutate: calculate, isPending, data } = useCalculateNumerology();

    const handleQuickCalculate = () => {
      if (!birthDate) return;
      const date = new Date(birthDate);
      const lifePathNumber = calculateLifePathNumber(date);
      setQuickResult(lifePathNumber);
    };

    const handleFullCalculate = () => {
      if (!birthDate) return;

      calculate(
        { birthDate, fullName: fullName || undefined },
        {
          onSuccess: (profile) => {
            onCalculated?.(profile);
          },
        },
      );
    };

    return (
      <Card className="p-6">
        <h3 className="font-serif text-xl mb-4">Calcula tu Número de Vida</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setQuickResult(null);
              }}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {showNameField && (
            <div>
              <Label htmlFor="fullName">Nombre completo (opcional)</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Para calcular Número de Destino"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleQuickCalculate} disabled={!birthDate}>
              Vista rápida
            </Button>
            <Button onClick={handleFullCalculate} disabled={!birthDate || isPending}>
              {isPending ? "Calculando..." : "Calcular perfil"}
            </Button>
          </div>
        </div>

        {quickResult && !data && (
          <div className="mt-6 p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Tu Número de Vida</p>
            <p className="text-5xl font-bold text-primary mt-2">{quickResult}</p>
            <p className="text-sm mt-2">Calcula el perfil completo para ver más detalles</p>
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-3">
            <NumberCard number={data.lifePath} context="lifePath" variant="full" />
            {data.expression && <NumberCard number={data.expression} context="expression" />}
          </div>
        )}
      </Card>
    );
  }
  ```

- [ ] Crear `NumerologyProfile.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Separator } from "@/components/ui/separator";
  import { NumberCard } from "./NumberCard";
  import { Sparkles } from "lucide-react";
  import type { NumerologyResponseDto, NumerologyInterpretationResponseDto } from "@/types/numerology.types";

  interface NumerologyProfileProps {
    profile: NumerologyResponseDto;
    interpretation?: NumerologyInterpretationResponseDto | null;
    onRequestInterpretation?: () => void;
    isGeneratingInterpretation?: boolean;
    canGenerateInterpretation?: boolean;
  }

  export function NumerologyProfile({
    profile,
    interpretation,
    onRequestInterpretation,
    isGeneratingInterpretation = false,
    canGenerateInterpretation = false,
  }: NumerologyProfileProps) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl">Tu Perfil Numerológico</h1>
          <p className="text-muted-foreground mt-2">Fecha de nacimiento: {profile.birthDate}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <NumberCard number={profile.lifePath} context="lifePath" variant="full" />
          {profile.expression && <NumberCard number={profile.expression} context="expression" variant="full" />}
          {profile.soulUrge && <NumberCard number={profile.soulUrge} context="soulUrge" variant="full" />}
          {profile.personality && <NumberCard number={profile.personality} context="personality" variant="full" />}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <NumberCard
            number={{
              value: profile.personalYear,
              name: `Año Personal ${new Date().getFullYear()}`,
              keywords: [],
              description: "",
              isMaster: false,
            }}
            context="personalYear"
          />
          <NumberCard
            number={{
              value: profile.personalMonth,
              name: "Mes Personal",
              keywords: [],
              description: "",
              isMaster: false,
            }}
            context="personalMonth"
          />
        </div>

        <Separator />

        {interpretation ? (
          <Card
            className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 
                          dark:from-purple-950/20 dark:to-indigo-950/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-serif text-lg">Interpretación Personalizada</h3>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line">{interpretation.interpretation}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Generado el {new Date(interpretation.generatedAt).toLocaleDateString()}
            </p>
          </Card>
        ) : canGenerateInterpretation ? (
          <Card className="p-6 text-center">
            <Sparkles className="h-8 w-8 mx-auto text-purple-500 mb-3" />
            <h3 className="font-serif text-lg mb-2">Interpretación con IA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Obtén una interpretación personalizada que relaciona todos tus números
            </p>
            <Button onClick={onRequestInterpretation} disabled={isGeneratingInterpretation}>
              {isGeneratingInterpretation ? "Generando..." : "Generar interpretación"}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 text-center bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Mejora a PREMIUM para obtener interpretaciones personalizadas con IA
            </p>
          </Card>
        )}
      </div>
    );
  }
  ```

- [ ] Crear `NumerologyWidget.tsx`:

  ```tsx
  "use client";

  import Link from "next/link";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Skeleton } from "@/components/ui/skeleton";
  import { useMyNumerologyProfile, useDayNumber } from "@/hooks/api/useNumerology";
  import { useAuthStore } from "@/stores/authStore";
  import { NUMEROLOGY_NUMBERS_INFO } from "@/lib/utils/numerology";
  import { ArrowRight, Settings } from "lucide-react";

  export function NumerologyWidget() {
    const { user } = useAuthStore();
    const { data: profile, isLoading: profileLoading } = useMyNumerologyProfile();
    const { data: dayNumber } = useDayNumber();

    if (!user?.birthDate) {
      return (
        <Card className="p-6">
          <h2 className="font-serif text-xl mb-2">Tu Numerología</h2>
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

    if (profileLoading) {
      return (
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-16 w-full" />
        </Card>
      );
    }

    if (!profile) {
      return (
        <Card className="p-6">
          <h2 className="font-serif text-xl mb-2">Tu Numerología</h2>
          <p className="text-muted-foreground text-sm">No disponible</p>
        </Card>
      );
    }

    const lifePathInfo = NUMEROLOGY_NUMBERS_INFO[profile.lifePath.value];

    return (
      <Card data-testid="numerology-widget" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Tu Numerología</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/numerologia/mi-perfil">
              Ver más
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Vida</p>
            <p className={`text-3xl font-bold ${lifePathInfo?.color}`}>{profile.lifePath.value}</p>
          </div>
          <div className="flex-1">
            <p className="font-medium">{profile.lifePath.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{profile.lifePath.keywords.join(", ")}</p>
          </div>
        </div>

        {dayNumber && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Número del Día</p>
              <p className="font-medium">{dayNumber.dayNumber}</p>
            </div>
            <span className="text-2xl">{NUMEROLOGY_NUMBERS_INFO[dayNumber.dayNumber]?.emoji}</span>
          </div>
        )}
      </Card>
    );
  }
  ```

- [ ] Crear `index.ts` con exports

##### Testing

- [ ] Test: NumberCard muestra datos correctos
- [ ] Test: NumberGallery renderiza 12 números
- [ ] Test: NumerologyCalculator calcula correctamente
- [ ] Test: NumerologyProfile muestra todos los números
- [ ] Test: NumerologyWidget muestra CTA si no hay birthDate

---

#### 🎯 Criterios de Aceptación

- [ ] Componentes siguen design system
- [ ] Números maestros destacados visualmente
- [ ] Loading y error states
- [ ] Responsive
- [ ] Tests cubren casos principales

# Frontend: Páginas, Widget y Esquema de Datos

---

### TASK-206: Crear páginas de Numerología

**Módulo:** `frontend/src/app/numerologia/`
**Prioridad:** 🟡 MEDIA
**Estimación:** 1 día
**Dependencias:** TASK-205

---

#### 📋 Descripción

Crear la página principal de numerología con calculadora y vista de resultados.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/app/numerologia/page.tsx`
- `frontend/src/app/numerologia/resultado/page.tsx`

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
    NUMEROLOGIA: "/numerologia",
    NUMEROLOGIA_RESULTADO: "/numerologia/resultado",
  } as const;
  ```

- [ ] Crear `app/numerologia/page.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { useRouter } from "next/navigation";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { NumerologyIntro } from "@/components/features/numerology";
  import { useAuthStore } from "@/stores/authStore";
  import { useCalculateNumerology } from "@/hooks/api/useNumerology";
  import { ROUTES } from "@/lib/constants/routes";

  export default function NumerologiaPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { mutate, isPending } = useCalculateNumerology();

    const [birthDate, setBirthDate] = useState(user?.birthDate ? user.birthDate.split("T")[0] : "");
    const [fullName, setFullName] = useState(user?.name || "");

    const handleCalculate = () => {
      if (!birthDate) return;

      mutate(
        { birthDate, fullName: fullName || undefined },
        {
          onSuccess: (data) => {
            sessionStorage.setItem("numerologyResult", JSON.stringify(data));
            router.push(ROUTES.NUMEROLOGIA_RESULTADO);
          },
        },
      );
    };

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl mb-2">Numerología</h1>
            <p className="text-muted-foreground">Descubre los números que rigen tu vida</p>
          </div>

          <NumerologyIntro className="mb-8" />

          <Card className="p-6">
            <h2 className="font-serif text-xl mb-4">Calcula tus Números</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullName">Nombre Completo (opcional)</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Para números de expresión y alma"
                />
              </div>

              <Button onClick={handleCalculate} disabled={!birthDate || isPending} className="w-full">
                {isPending ? "Calculando..." : "Calcular mis Números"}
              </Button>
            </div>

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                <a href="/registro" className="text-primary hover:underline">
                  Regístrate
                </a>{" "}
                para guardar tus resultados
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }
  ```

- [ ] Crear `app/numerologia/resultado/page.tsx`:

  ```tsx
  "use client";

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import { ArrowLeft, RefreshCw } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { NumberCard } from "@/components/features/numerology";
  import { ROUTES } from "@/lib/constants/routes";
  import type { NumerologyResponseDto } from "@/types/numerology.types";

  export default function ResultadoPage() {
    const router = useRouter();
    const [result, setResult] = useState<NumerologyResponseDto | null>(null);

    useEffect(() => {
      const stored = sessionStorage.getItem("numerologyResult");
      if (stored) {
        setResult(JSON.parse(stored));
      } else {
        router.push(ROUTES.NUMEROLOGIA);
      }
    }, [router]);

    if (!result) {
      return (
        <div className="container mx-auto py-8 text-center">
          <p>Cargando...</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.NUMEROLOGIA)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nueva consulta
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.NUMEROLOGIA)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recalcular
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl mb-2">Tu Perfil Numerológico</h1>
            <p className="text-muted-foreground">
              Fecha: {result.birthDate}
              {result.fullName && ` • ${result.fullName}`}
            </p>
          </div>

          {/* Número principal: Camino de Vida */}
          <NumberCard number={result.lifePath} context="lifePath" variant="full" className="mb-8" />

          {/* Grid de números */}
          <h2 className="font-serif text-xl mb-4">Tus Números</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <NumberCard number={result.birthday} context="birthday" />
            {result.expression && <NumberCard number={result.expression} context="expression" />}
            {result.soulUrge && <NumberCard number={result.soulUrge} context="soulUrge" />}
            {result.personality && <NumberCard number={result.personality} context="personality" />}
          </div>

          {/* Ciclos personales */}
          <h2 className="font-serif text-xl mb-4">Tus Ciclos Actuales</h2>
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Año Personal {new Date().getFullYear()}</p>
              <p className="text-4xl font-bold text-primary mt-2">{result.personalYear}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Mes Personal ({new Date().toLocaleDateString("es", { month: "long" })})
              </p>
              <p className="text-4xl font-bold text-primary mt-2">{result.personalMonth}</p>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">¿Quieres profundizar más?</p>
            <Button asChild>
              <a href="/ritual">Consulta el Tarot</a>
            </Button>
          </div>
        </div>
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
    { href: "/ritual", label: "Lectura", requiresAuth: true },
  ];
  ```

##### Testing

- [ ] Test: Página muestra formulario
- [ ] Test: Validación de fecha
- [ ] Test: Navegación a resultado
- [ ] Test: Resultado muestra números
- [ ] Test: Botones de navegación funcionan

---

#### 🎯 Criterios de Aceptación

- [ ] /numerologia muestra calculadora
- [ ] /numerologia/resultado muestra perfil
- [ ] Datos persisten en sessionStorage
- [ ] Link en header
- [ ] Responsive

---

### TASK-207: Agregar widget al Dashboard

**Módulo:** `frontend/src/components/features/dashboard/`
**Prioridad:** 🟢 BAJA
**Estimación:** 0.5 días
**Dependencias:** TASK-206

---

#### 📋 Descripción

Widget de numerología en el dashboard del usuario autenticado.

---

#### ✅ Tareas Específicas

- [ ] Agregar `NumerologyWidget` en `UserDashboard.tsx`:

  ```tsx
  import { NumerologyWidget } from "@/components/features/numerology";

  // En el grid:
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <DailyCardWidget />
    <HoroscopeWidget />
    <NumerologyWidget />
  </div>;
  ```

---

#### 🎯 Criterios de Aceptación

- [ ] Widget visible en dashboard
- [ ] Muestra Camino de Vida
- [ ] CTA si no hay birthDate

---

## ESQUEMA DE DATOS

### Notas sobre Base de Datos

**Este módulo NO requiere nuevas tablas.** Los cálculos son:

- Algorítmicos (funciones puras)
- Basados en `user.birthDate` existente
- Sin persistencia de resultados

### Datos Estáticos (en código)

```typescript
// Almacenados en:
// src/modules/numerology/data/interpretations.data.ts
// src/modules/numerology/data/compatibility.data.ts

interface NumberInterpretation {
  number: number; // 1-9, 11, 22, 33
  name: string; // "El Líder"
  keywords: string[]; // ["Independencia", "Ambición"]
  description: string; // Descripción larga
  strengths: string[]; // Fortalezas
  challenges: string[]; // Desafíos
  careers: string[]; // Profesiones afines
  isMaster: boolean; // true para 11, 22, 33
}
```

---

## DEPENDENCIAS

### Dependencias npm

**Ninguna adicional.** Solo usa:

- Funciones matemáticas nativas de JavaScript
- Utilidades de string existentes

### Variables de Entorno

**Ninguna adicional.**

---

## RESUMEN DE TAREAS

| Tarea     | Descripción                         | Estimación |
| --------- | ----------------------------------- | ---------- |
| TASK-200  | Utils de cálculo (backend)          | 1 día      |
| TASK-201  | Datos de interpretaciones (backend) | 0.5 días   |
| TASK-202  | Módulo y servicio (backend)         | 0.5 días   |
| TASK-202b | Entidad e IA Premium (backend)      | 1 día      |
| TASK-203  | Endpoints (backend)                 | 0.5 días   |
| TASK-204  | Types, API y hooks (frontend)       | 0.5 días   |
| TASK-205  | Componentes UI (frontend)           | 1 día      |
| TASK-206  | Páginas (frontend)                  | 1 día      |
| TASK-207  | Widget dashboard (frontend)         | 0.5 días   |

**Total:** 6.5 días

---

## CHECKLIST DE COMPLETITUD

### Backend

- [ ] TASK-200: Utilidades de cálculo
- [ ] TASK-201: Datos de interpretaciones
- [ ] TASK-202: Módulo y servicio
- [ ] TASK-202b: Entidad e interpretación IA Premium
- [ ] TASK-203: Endpoints

### Frontend

- [ ] TASK-204: Types, API y hooks
- [ ] TASK-205: Componentes UI
- [ ] TASK-206: Páginas
- [ ] TASK-207: Widget dashboard

### Validación

- [ ] Números maestros se preservan
- [ ] Acentos se manejan correctamente
- [ ] Tests >80% coverage

---

**Fin del Módulo Numerología**
