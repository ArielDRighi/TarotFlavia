# BACKLOG AUGURIA 2.0 - HORÓSCOPO OCCIDENTAL

## Historias de Usuario e Infraestructura Base

**Fecha de creación:** 16 de enero de 2026  
**Módulo:** Horóscopo Occidental (Diario)  
**Prioridad Global:** 🔴 ALTA

---

## 1. HISTORIAS DE USUARIO

### HU-HOR-001: Consultar horóscopo diario (Usuario Anónimo)

```gherkin
Feature: Consultar horóscopo diario como usuario anónimo
  Como usuario anónimo
  Quiero poder consultar el horóscopo de cualquier signo zodiacal
  Para conocer las predicciones del día sin necesidad de registrarme

  Background:
    Given soy un usuario anónimo navegando en Auguria
    And los horóscopos del día ya fueron generados a las 06:00 UTC

  Scenario: Acceder a la sección de horóscopos desde el header
    When hago clic en "Horóscopo" en el menú de navegación
    Then veo una página con los 12 signos zodiacales en tarjetas
    And cada tarjeta muestra el nombre del signo, icono y símbolo
    And veo un mensaje invitándome a registrarme para personalización

  Scenario: Ver horóscopo completo de un signo
    Given estoy en la página de horóscopos
    When hago clic en la tarjeta de "Aries"
    Then veo el horóscopo completo de Aries para hoy
    And veo tres secciones: Amor, Dinero y Bienestar
    And veo el número de la suerte y color del día
    And veo un CTA para registrarme y ver mi signo automáticamente

  Scenario: Horóscopo no disponible (error de generación)
    Given hubo un error al generar horóscopos hoy
    When intento ver el horóscopo de "Tauro"
    Then veo un mensaje "El horóscopo de hoy no está disponible"
    And veo una sugerencia de intentar más tarde
```

---

### HU-HOR-002: Consultar horóscopo personalizado (Usuario Registrado)

```gherkin
Feature: Consultar horóscopo personalizado como usuario registrado
  Como usuario registrado con fecha de nacimiento configurada
  Quiero ver mi horóscopo automáticamente en mi dashboard
  Para tener una experiencia personalizada sin buscar mi signo

  Background:
    Given soy un usuario registrado con plan FREE o PREMIUM
    And mi fecha de nacimiento es "1990-03-25" (Aries)
    And estoy autenticado en la aplicación

  Scenario: Ver widget de horóscopo en dashboard
    When accedo a mi dashboard (página principal)
    Then veo un widget "Tu Horóscopo de Hoy" con mi signo Aries
    And veo un resumen corto del horóscopo (máx 150 caracteres)
    And veo un botón "Ver completo" que lleva a la página de horóscopo

  Scenario: Ver horóscopo completo desde widget
    Given estoy en mi dashboard
    When hago clic en "Ver completo" en el widget de horóscopo
    Then navego a /horoscopo/aries
    And veo el horóscopo completo con las 3 secciones
    And mi signo aparece pre-seleccionado

  Scenario: Usuario sin fecha de nacimiento configurada
    Given mi perfil no tiene fecha de nacimiento
    When accedo a mi dashboard
    Then veo el widget de horóscopo con mensaje "Configura tu fecha de nacimiento"
    And veo un botón "Configurar" que lleva a mi perfil
    And NO veo ningún horóscopo específico

  Scenario: Navegar a otros signos siendo usuario registrado
    Given estoy viendo mi horóscopo de Aries
    When hago clic en el selector de signos
    And selecciono "Leo"
    Then veo el horóscopo de Leo
    And mi signo (Aries) aparece destacado en el selector
```

---

### HU-HOR-003: Generación automática de horóscopos (Sistema)

```gherkin
Feature: Generación automática diaria de horóscopos
  Como sistema automatizado
  Quiero generar horóscopos para los 12 signos cada día a las 06:00 UTC
  Para que estén disponibles cuando los usuarios accedan a la aplicación

  Background:
    Given es un nuevo día y son las 06:00 UTC
    And el sistema de cron jobs está activo
    And los providers de IA (Groq y Gemini) están configurados

  Scenario: Generación exitosa con Groq (provider principal)
    When el cron job de horóscopos se ejecuta
    Then el sistema genera horóscopos para los 12 signos secuencialmente
    And cada generación usa Groq como provider principal
    And hay un delay de 5-10 segundos entre cada signo
    And todos los horóscopos se guardan en la base de datos
    And el log indica "12 horóscopos generados exitosamente"

  Scenario: Fallback a Gemini cuando Groq falla
    Given Groq está temporalmente no disponible
    When el cron job intenta generar el horóscopo de "Tauro"
    And la llamada a Groq falla con timeout
    Then el sistema espera 5 segundos
    And intenta generar con Gemini 1.5 Flash
    And el horóscopo se genera exitosamente
    And el campo aiProvider del registro indica "gemini"

  Scenario: Fallo total de un signo (ambos providers fallan)
    Given Groq y Gemini están no disponibles
    When el cron job intenta generar el horóscopo de "Géminis"
    Then el sistema registra el error en los logs
    And continúa con el siguiente signo (Cáncer)
    And al finalizar, el log indica "11 exitosos, 1 fallido"

  Scenario: Evitar duplicados si ya existe horóscopo del día
    Given ya existe un horóscopo de "Aries" para hoy
    When el cron job se ejecuta (por reinicio o manual)
    Then el sistema detecta que ya existe
    And salta la generación de Aries
    And continúa con los signos que falten
```

---

## 2. ÉPICA 1: INFRAESTRUCTURA BASE

---

### TASK-100: Agregar campo birthDate a la entidad User

**Módulo:** `src/modules/users/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** Ninguna

---

#### 📋 Descripción

Agregar el campo `birthDate` (fecha de nacimiento) a la entidad User para poder calcular el signo zodiacal del usuario y personalizar su experiencia de horóscopo.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

- `src/modules/users/entities/user.entity.ts` → Agregar columna birthDate
- `src/modules/users/dto/create-user.dto.ts` → Agregar campo opcional
- `src/modules/users/dto/update-user.dto.ts` → Agregar campo opcional

**Archivos a crear:**

- `src/database/migrations/XXXX-AddBirthDateToUser.ts` → Migración

**Patrones a seguir:**

- Referencia: Campos existentes en `user.entity.ts` como `profilePicture`

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Agregar columna `birthDate` a la entidad User:

  ```typescript
  @ApiProperty({
    example: '1990-05-15',
    description: 'Fecha de nacimiento del usuario (formato: YYYY-MM-DD)',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;
  ```

- [ ] Actualizar `CreateUserDto` con campo opcional:

  ```typescript
  @ApiProperty({
    example: '1990-05-15',
    description: 'Fecha de nacimiento (formato: YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' })
  @Type(() => Date)
  birthDate?: Date;
  ```

- [ ] Actualizar `UpdateUserDto` con el mismo campo opcional

- [ ] Crear migración:

  ```bash
  npm run migration:generate -- -n AddBirthDateToUser
  ```

- [ ] Ejecutar migración en desarrollo:
  ```bash
  npm run migration:run
  ```

##### Testing

- [ ] Test unitario: Usuario se crea correctamente sin birthDate
- [ ] Test unitario: Usuario se crea correctamente con birthDate válido
- [ ] Test unitario: Validación falla con formato de fecha inválido
- [ ] Test e2e: Registro con y sin birthDate
- [ ] Test e2e: Actualización de perfil con birthDate

---

#### 🎯 Criterios de Aceptación

- [ ] La migración se ejecuta sin errores
- [ ] Usuarios existentes mantienen `birthDate: null`
- [ ] Nuevos usuarios pueden registrarse con o sin birthDate
- [ ] El formato de fecha es validado correctamente (YYYY-MM-DD)
- [ ] Tests pasan con >80% coverage del cambio

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El campo DEBE ser `nullable: true` para no romper usuarios existentes
> - Usar `@IsDateString()` en lugar de `@IsDate()` para mejor validación
> - Agregar `@Type(() => Date)` de class-transformer
> - NO agregar validación de edad mínima en esta tarea

---

### TASK-101: Crear helper para calcular signo zodiacal

**Módulo:** `src/common/utils/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-100

---

#### 📋 Descripción

Crear una función utilitaria que calcule el signo zodiacal occidental basado en una fecha de nacimiento.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/common/utils/zodiac.utils.ts` → Funciones de cálculo
- `src/common/utils/zodiac.utils.spec.ts` → Tests unitarios

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear enum `ZodiacSign`:

  ```typescript
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
  ```

- [ ] Crear función `getZodiacSign(birthDate: Date): ZodiacSign`

- [ ] Crear función `getZodiacSignInfo(sign: ZodiacSign): ZodiacSignInfo`

- [ ] Implementar rangos de fechas correctos:

  ```typescript
  const ZODIAC_RANGES = {
    [ZodiacSign.ARIES]: { start: [3, 21], end: [4, 19] },
    [ZodiacSign.TAURUS]: { start: [4, 20], end: [5, 20] },
    [ZodiacSign.GEMINI]: { start: [5, 21], end: [6, 20] },
    [ZodiacSign.CANCER]: { start: [6, 21], end: [7, 22] },
    [ZodiacSign.LEO]: { start: [7, 23], end: [8, 22] },
    [ZodiacSign.VIRGO]: { start: [8, 23], end: [9, 22] },
    [ZodiacSign.LIBRA]: { start: [9, 23], end: [10, 22] },
    [ZodiacSign.SCORPIO]: { start: [10, 23], end: [11, 21] },
    [ZodiacSign.SAGITTARIUS]: { start: [11, 22], end: [12, 21] },
    [ZodiacSign.CAPRICORN]: { start: [12, 22], end: [1, 19] },
    [ZodiacSign.AQUARIUS]: { start: [1, 20], end: [2, 18] },
    [ZodiacSign.PISCES]: { start: [2, 19], end: [3, 20] },
  };
  ```

- [ ] Crear interface `ZodiacSignInfo`:

  ```typescript
  export interface ZodiacSignInfo {
    sign: ZodiacSign;
    nameEs: string;
    nameEn: string;
    symbol: string; // "♈", "♉", etc.
    element: "fire" | "earth" | "air" | "water";
    quality: "cardinal" | "fixed" | "mutable";
    rulingPlanet: string;
  }
  ```

- [ ] Exportar desde `src/common/utils/index.ts`

##### Testing

- [ ] Test: Fecha 25 de marzo → Aries
- [ ] Test: Fecha 21 de marzo (inicio Aries) → Aries
- [ ] Test: Fecha 19 de abril (fin Aries) → Aries
- [ ] Test: Fecha 20 de abril → Tauro
- [ ] Test: Fecha 1 de enero → Capricornio (cruce de año)
- [ ] Test: Fecha 31 de diciembre → Capricornio
- [ ] Test: Todos los 12 signos con fechas de ejemplo

---

#### 🎯 Criterios de Aceptación

- [ ] Todos los 12 signos calculan correctamente
- [ ] Capricornio (cruce de año) funciona correctamente
- [ ] Las funciones son puras y no tienen side effects
- [ ] Coverage >90% del archivo

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Prestar especial atención a Capricornio que cruza el año (22 dic - 19 ene)
> - La fecha de entrada puede ser Date o string ISO, manejar ambos casos
> - Los símbolos zodiacales son caracteres Unicode estándar

---

### ✅ TASK-102: Configurar Gemini Provider como fallback [COMPLETADA]

**Módulo:** `src/modules/ai/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** Ninguna  
**Completada:** 17 Enero 2026  
**Commit:** `d8b0523` - feat(ai): Add Gemini 1.5 Flash provider as fallback

---

#### 📋 Descripción

Agregar Google Gemini 1.5 Flash como provider de IA para usar como fallback cuando Groq no esté disponible.

---

#### 🏗️ Contexto Técnico

**Archivos a modificar:**

- `src/modules/ai/domain/interfaces/ai-provider.interface.ts` → Agregar GEMINI al enum
- `src/modules/ai/ai.module.ts` → Registrar GeminiProvider
- `src/modules/ai/application/services/ai-provider.service.ts` → Agregar al array
- `.env.example` → Agregar GEMINI_API_KEY

**Archivos a crear:**

- `src/modules/ai/infrastructure/providers/gemini.provider.ts`
- `src/modules/ai/infrastructure/providers/gemini.provider.spec.ts`

**Dependencias npm:**

- `@google/generative-ai@^0.21.0`

---

#### ✅ Tareas Específicas

##### Backend

- [x] Instalar SDK
- [x] Agregar `GEMINI` al enum `AIProviderType`
- [x] Crear `gemini.provider.ts` implementando `IAIProvider`
- [x] Convertir formato de mensajes OpenAI → Gemini
- [x] Registrar en `ai.module.ts`
- [x] Actualizar `AIProviderService` con circuit breaker para Gemini
- [x] Agregar `GEMINI_API_KEY` a `.env.example`

##### Testing

- [x] Test: Provider se inicializa con API key
- [x] Test: Provider retorna `isAvailable: false` sin API key
- [x] Test: Conversión de mensajes funciona
- [x] Test: Errores se manejan correctamente

---

#### 🎯 Criterios de Aceptación

- [x] Gemini provider implementa `IAIProvider`
- [x] Circuit breaker configurado
- [x] Conversión de formato funciona
- [x] Tests pasan con >80% coverage (97.14% alcanzado)

---

#### 📊 Resultados

**Coverage:** 97.14% (Statements), 87.03% (Branches), 100% (Functions)  
**Tests:** 20 tests pasados  
**Prioridad:** Groq → Gemini → DeepSeek → OpenAI  
**Límites Free Tier:** 15 RPM, 1M TPM, 1500 RPD

# Backend: Entidad, Servicio y Módulo

---

### ✅ TASK-103: Crear entidad DailyHoroscope y migración [COMPLETADA]

**Módulo:** `src/modules/horoscope/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 0.5 días  
**Estado:** ✅ COMPLETADA  
**Fecha:** 17/01/2026  
**Commit:** `04340d5` - feat(horoscope): TASK-103 - Crear entidad DailyHoroscope y migración  
**Rama:** `feature/TASK-103-crear-entidad-daily-horoscope`

---

#### 📋 Descripción

Crear la entidad `DailyHoroscope` para almacenar los horóscopos diarios generados por IA.

---

#### 🏗️ Implementación Realizada

**Archivos creados:**

- ✅ `src/modules/horoscope/entities/zodiac-sign.enum.ts` - Enum con los 12 signos del zodiaco
- ✅ `src/modules/horoscope/entities/daily-horoscope.entity.ts` - Entidad con índices y JSONB
- ✅ `src/database/migrations/1770900000000-CreateDailyHoroscopes.ts` - Migración con enum y tabla
- ✅ `src/modules/horoscope/entities/daily-horoscope.entity.spec.ts` - 12 tests unitarios
- ✅ `test/integration/daily-horoscope.integration.spec.ts` - 9 tests de integración

**Configuración:**

- ✅ `test/integration.config.ts` - Agregadas rutas de migraciones
- ✅ `test/setup-integration-db.ts` - Variable INTEGRATION_TESTING

**Estructura del módulo:**

```
src/modules/horoscope/
└── entities/
    ├── zodiac-sign.enum.ts          ✅
    ├── daily-horoscope.entity.ts    ✅
    └── daily-horoscope.entity.spec.ts ✅
```

---

#### ✅ Tareas Completadas

##### Backend

- [x] Crear estructura de carpetas del módulo horoscope
- [x] Crear enum ZodiacSign con 12 signos
- [x] Crear entidad `DailyHoroscope` con:
  - Índice único en (zodiacSign, horoscopeDate)
  - Índice en horoscopeDate
  - JSONB para áreas (amor, bienestar, dinero)
  - Campos opcionales (luckyNumber, luckyColor, luckyTime)
  - Metadatos de IA (provider, model, tokens, tiempo)
  - Contador de visualizaciones
  - Mapeo explícito de columnas camelCase → snake_case
- [x] Crear migración 1770900000000-CreateDailyHoroscopes
- [x] Ejecutar migración en BD principal y de integración

##### Testing

- [x] 12 tests unitarios: creación, JSONB, fechas, metadata, lucky elements
- [x] 9 tests de integración: persistencia, índice único, consultas por fecha
- [x] Configurar IntegrationDataSource con migraciones
- [x] Variable INTEGRATION_TESTING para tests

---

#### 🎯 Criterios de Aceptación (Todos Cumplidos)

- [x] Migración ejecutada sin errores
- [x] Índice único funciona correctamente (validado en tests de integración)
- [x] JSONB permite consultas y actualizaciones (validado con 21 tests)
- [x] Tests: ✅ 21/21 pasando (12 unitarios + 9 integración)

---

#### 📎 Notas Técnicas

- El índice único (zodiacSign, horoscopeDate) previene duplicados eficientemente
- JSONB permite almacenar estructuras flexibles con consultas eficientes
- Mapeo explícito de nombres de columnas evita problemas con camelCase/snake_case
- Tests de integración validan la funcionalidad completa con BD real

  ```typescript
  @Entity("daily_horoscopes")
  @Index("idx_horoscope_sign_date", ["zodiacSign", "horoscopeDate"], { unique: true })
  @Index("idx_horoscope_date", ["horoscopeDate"])
  export class DailyHoroscope {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: ZodiacSign })
    zodiacSign: ZodiacSign;

    @Column({ type: "date" })
    horoscopeDate: Date;

    @Column({ type: "text" })
    generalContent: string;

    @Column({ type: "jsonb" })
    areas: {
      love: { content: string; score: number };
      wellness: { content: string; score: number }; // Bienestar: energía, descanso, estrés, meditación, autocuidado
      money: { content: string; score: number };
    };

    @Column({ type: "smallint", nullable: true })
    luckyNumber: number | null;

    @Column({ type: "varchar", length: 50, nullable: true })
    luckyColor: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    luckyTime: string | null;

    @Column({ type: "varchar", length: 50, nullable: true })
    aiProvider: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    aiModel: string | null;
  ```

---

### ✅ TASK-104: Crear módulo Horoscope y servicio de generación [COMPLETADA]

**Módulo:** `src/modules/horoscope/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-102, TASK-103  
**Completada:** 17 Enero 2026  
**Commit:** `[pendiente]` - feat(horoscope): TASK-104 - Crear módulo Horoscope y servicio de generación  
**Rama:** `feature/TASK-104-modulo-horoscope-generacion`

---

#### 📋 Descripción

Crear el módulo de horóscopo con el servicio principal de generación que usa IA.

---

#### 🏗️ Implementación Realizada

**Archivos creados:**

```
src/modules/horoscope/
├── horoscope.module.ts                                    ✅
├── application/
│   ├── dto/
│   │   ├── horoscope-response.dto.ts                     ✅
│   │   └── horoscope-ai-response.interface.ts            ✅
│   ├── services/
│   │   ├── horoscope-generation.service.ts               ✅
│   │   └── horoscope-generation.service.spec.ts          ✅
│   └── prompts/
│       └── horoscope.prompts.ts                          ✅
```

**Archivos modificados:**

- ✅ `src/app.module.ts` - Registro del HoroscopeModule

**Características implementadas:**

- ✅ Servicio de generación con AI fallback automático (Groq → Gemini → DeepSeek → OpenAI)
- ✅ Prevención de duplicados por fecha y signo
- ✅ Parsing robusto de respuestas JSON de IA con type guards
- ✅ Prompts especializados para generar horóscopos con tone positivo y realista
- ✅ Instrucciones específicas para área "wellness" (sin diagnósticos médicos)
- ✅ Incremento atómico de viewCount
- ✅ Cleanup automático de horóscopos antiguos >30 días
- ✅ Tracking completo de metadatos de IA (provider, model, tokens, tiempo)

---

#### ✅ Tareas Completadas

##### Backend

- [x] Crear `horoscope.module.ts` con importación de DailyHoroscope y AIModule
- [x] Crear `horoscope.prompts.ts` con prompts de sistema y usuario
- [x] Crear `HoroscopeGenerationService` con TDD (14 tests unitarios pasando)
- [x] Crear DTOs de respuesta con documentación Swagger
- [x] Crear interface para respuesta de IA
- [x] Registrar módulo en `app.module.ts`

##### Testing

- [x] 14 tests unitarios: generación, parsing, queries, incremento, cleanup
- [x] Coverage del servicio: 100% (Functions), 94.87% (Statements), 93.33% (Branches)
- [x] Validación de type guards para parsing seguro
- [x] Tests de manejo de errores

---

#### 🎯 Criterios de Aceptación (Todos Cumplidos)

- [x] Servicio genera horóscopos correctamente
- [x] No genera duplicados (verifica existencia primero)
- [x] Tracking de métricas funciona (tokens, tiempo, provider)
- [x] Tests unitarios: ✅ 14/14 pasando
- [x] Coverage >80% (alcanzado: >90%)
- [x] Lint y build sin errores

---

#### 📎 Notas Técnicas

- Temperatura configurada a 0.8 para variedad en las generaciones
- MaxTokens: 1000 (suficiente para 3 áreas + elementos de la suerte)
- El servicio usa `AIProviderService` que maneja fallback automáticamente
- Type guards previenen errores de parsing con validación estricta
- El incremento de viewCount es atómico usando query builder
- Prompt incluye restricciones específicas para "wellness" (sin diagnósticos médicos)

---

### TASK-105: Crear endpoints de Horóscopo

**Módulo:** `src/modules/horoscope/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-102, TASK-103

---

#### 📋 Descripción

Crear el módulo de horóscopo con el servicio principal de generación que usa IA.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
src/modules/horoscope/
├── horoscope.module.ts
├── application/
│   ├── dto/
│   │   ├── horoscope-response.dto.ts
│   │   └── generate-horoscope.dto.ts
│   ├── services/
│   │   ├── horoscope-generation.service.ts
│   │   └── horoscope-generation.service.spec.ts
│   └── prompts/
│       └── horoscope.prompts.ts
```

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `horoscope.module.ts`:

  ```typescript
  @Module({
    imports: [TypeOrmModule.forFeature([DailyHoroscope]), AIModule],
    providers: [HoroscopeGenerationService],
    controllers: [],
    exports: [HoroscopeGenerationService],
  })
  export class HoroscopeModule {}
  ```

- [ ] Crear `horoscope.prompts.ts`:

  ```typescript
  export const HOROSCOPE_SYSTEM_PROMPT = `
  Eres un astrólogo experto con décadas de experiencia.
  Tu tarea es generar horóscopos diarios precisos e inspiradores.
  
  REGLAS:
  1. Sé específico pero no predictivo de eventos concretos
  2. Mantén un tono positivo pero realista
  3. Incluye consejos prácticos
  4. Adapta el contenido al signo específico
  
  IMPORTANTE SOBRE BIENESTAR (wellness):
  - NO hagas diagnósticos físicos ni menciones enfermedades
  - Enfócate en: niveles de energía, descanso, manejo del estrés,
    meditación, autocuidado, equilibrio emocional y vitalidad
  - Usa términos como: "energía vital", "armonía interior",
    "momento de pausa", "autocuidado", "equilibrio"
  
  FORMATO DE RESPUESTA (JSON estricto):
  {
    "generalContent": "Resumen general (2-3 oraciones)",
    "areas": {
      "love": { "content": "...", "score": 7 },
      "wellness": { "content": "...", "score": 8 },
      "money": { "content": "...", "score": 6 }
    },
    "luckyNumber": 7,
    "luckyColor": "Verde esmeralda",
    "luckyTime": "Media mañana"
  }
  `;

  export const HOROSCOPE_USER_PROMPT = (sign: string, date: string, signInfo: ZodiacSignInfo) => `
  Genera el horóscopo para ${signInfo.nameEs} (${sign}) para el día ${date}.
  
  Información del signo:
  - Elemento: ${signInfo.element}
  - Cualidad: ${signInfo.quality}
  - Planeta regente: ${signInfo.rulingPlanet}
  
  Recuerda: Para "wellness" (bienestar), habla de energía, descanso, estrés, 
  meditación y autocuidado. NO menciones diagnósticos médicos ni enfermedades.
  
  Responde SOLO con el JSON, sin texto adicional.
  `;
  ```

- [ ] Crear `HoroscopeGenerationService`:

  ````typescript
  @Injectable()
  export class HoroscopeGenerationService {
    private readonly logger = new Logger(HoroscopeGenerationService.name);

    constructor(
      @InjectRepository(DailyHoroscope)
      private readonly horoscopeRepository: Repository<DailyHoroscope>,
      private readonly aiProviderService: AIProviderService,
    ) {}

    async generateForSign(sign: ZodiacSign, date: Date = new Date()): Promise<DailyHoroscope> {
      // 1. Verificar si ya existe
      const existing = await this.findBySignAndDate(sign, date);
      if (existing) {
        this.logger.log(`Horóscopo ya existe para ${sign}`);
        return existing;
      }

      // 2. Obtener info del signo
      const signInfo = getZodiacSignInfo(sign);
      const dateStr = date.toISOString().split("T")[0];

      // 3. Construir mensajes
      const messages: AIMessage[] = [
        { role: "system", content: HOROSCOPE_SYSTEM_PROMPT },
        { role: "user", content: HOROSCOPE_USER_PROMPT(sign, dateStr, signInfo) },
      ];

      // 4. Generar con IA
      const startTime = Date.now();
      const aiResponse = await this.aiProviderService.generateCompletion(messages, null, null, {
        temperature: 0.8,
        maxTokens: 1000,
      });

      // 5. Parsear respuesta
      const horoscopeData = this.parseAIResponse(aiResponse.content);

      // 6. Guardar
      const horoscope = this.horoscopeRepository.create({
        zodiacSign: sign,
        horoscopeDate: date,
        generalContent: horoscopeData.generalContent,
        areas: horoscopeData.areas,
        luckyNumber: horoscopeData.luckyNumber,
        luckyColor: horoscopeData.luckyColor,
        luckyTime: horoscopeData.luckyTime,
        aiProvider: aiResponse.provider,
        aiModel: aiResponse.model,
        tokensUsed: aiResponse.tokensUsed.total,
        generationTimeMs: Date.now() - startTime,
      });

      return this.horoscopeRepository.save(horoscope);
    }

    async findBySignAndDate(sign: ZodiacSign, date: Date): Promise<DailyHoroscope | null> {
      const dateStr = date.toISOString().split("T")[0];
      return this.horoscopeRepository.findOne({
        where: {
          zodiacSign: sign,
          horoscopeDate: Raw((alias) => `${alias} = :date`, { date: dateStr }),
        },
      });
    }

    async findAllByDate(date: Date): Promise<DailyHoroscope[]> {
      const dateStr = date.toISOString().split("T")[0];
      return this.horoscopeRepository.find({
        where: {
          horoscopeDate: Raw((alias) => `${alias} = :date`, { date: dateStr }),
        },
        order: { zodiacSign: "ASC" },
      });
    }

    async incrementViewCount(id: number): Promise<void> {
      await this.horoscopeRepository
        .createQueryBuilder()
        .update()
        .set({ viewCount: () => "viewCount + 1" })
        .where("id = :id", { id })
        .execute();
    }

    private parseAIResponse(content: string): HoroscopeAIResponse {
      try {
        const cleanContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return JSON.parse(cleanContent);
      } catch (error) {
        this.logger.error("Error parsing AI response:", error);
        throw new InternalServerErrorException("Error al procesar IA");
      }
    }

    async cleanupOldHoroscopes(retentionDays: number = 30): Promise<number> {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.horoscopeRepository.delete({
        horoscopeDate: LessThan(cutoffDate),
      });

      return result.affected || 0;
    }
  }
  ````

- [ ] Crear DTOs de respuesta:

  ```typescript
  export class HoroscopeAreaDto {
    @ApiProperty({ example: "Hoy es un buen día para el amor..." })
    content: string;

    @ApiProperty({ example: 8, minimum: 1, maximum: 10 })
    score: number;
  }

  export class HoroscopeResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ enum: ZodiacSign })
    zodiacSign: ZodiacSign;

    @ApiProperty({ example: "2026-01-16" })
    horoscopeDate: string;

    @ApiProperty()
    generalContent: string;

    @ApiProperty()
    areas: {
      love: HoroscopeAreaDto;
      wellness: HoroscopeAreaDto; // Bienestar: energía, descanso, estrés, meditación, autocuidado
      money: HoroscopeAreaDto;
    };

    @ApiProperty({ nullable: true })
    luckyNumber: number | null;

    @ApiProperty({ nullable: true })
    luckyColor: string | null;

    @ApiProperty({ nullable: true })
    luckyTime: string | null;
  }
  ```

- [ ] Registrar módulo en `app.module.ts`

##### Testing

- [ ] Test: Genera horóscopo con mock de IA
- [ ] Test: Retorna existente si ya hay horóscopo
- [ ] Test: Parsea JSON correctamente
- [ ] Test: Maneja errores de parsing
- [ ] Test: Incrementa viewCount

---

#### 🎯 Criterios de Aceptación

- [ ] Servicio genera horóscopos correctamente
- [ ] No genera duplicados
- [ ] Tracking de métricas funciona
- [ ] Tests >80% coverage

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - El prompt debe pedir JSON estricto
> - Usar `temperature: 0.8` para variedad
> - Siempre usar `AIProviderService`, no providers directamente
> - NO crear cron job aquí (es TASK-106)

# Backend: Endpoints y Cron Job

---

### TASK-105: Crear endpoints de Horóscopo

**Módulo:** `src/modules/horoscope/infrastructure/controllers/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-104

---

#### 📋 Descripción

Implementar endpoints REST para consultar horóscopos diarios.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/horoscope/infrastructure/controllers/horoscope.controller.ts`
- `src/modules/horoscope/infrastructure/controllers/horoscope.controller.spec.ts`

**Endpoints:**

| Método | Ruta                     | Descripción                       | Auth |
| ------ | ------------------------ | --------------------------------- | ---- |
| GET    | `/horoscope/today`       | Todos los horóscopos de hoy       | No   |
| GET    | `/horoscope/today/:sign` | Horóscopo de un signo hoy         | No   |
| GET    | `/horoscope/:date`       | Todos los horóscopos de una fecha | No   |
| GET    | `/horoscope/:date/:sign` | Horóscopo específico              | No   |
| GET    | `/horoscope/my-sign`     | Horóscopo del usuario             | Sí   |

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `HoroscopeController`:

  ```typescript
  @ApiTags("Horoscope")
  @Controller("horoscope")
  export class HoroscopeController {
    constructor(private readonly horoscopeService: HoroscopeGenerationService) {}

    @Get("today")
    @ApiOperation({ summary: "Obtener todos los horóscopos de hoy" })
    @ApiResponse({ status: 200, type: [HoroscopeResponseDto] })
    async getTodayAll(): Promise<HoroscopeResponseDto[]> {
      const horoscopes = await this.horoscopeService.findAllByDate(new Date());
      return horoscopes.map(this.toResponseDto);
    }

    @Get("today/:sign")
    @ApiOperation({ summary: "Obtener horóscopo de un signo para hoy" })
    @ApiParam({ name: "sign", enum: ZodiacSign })
    @ApiResponse({ status: 200, type: HoroscopeResponseDto })
    @ApiResponse({ status: 404, description: "No disponible" })
    async getTodayBySign(
      @Param("sign", new ParseEnumPipe(ZodiacSign)) sign: ZodiacSign,
    ): Promise<HoroscopeResponseDto> {
      const horoscope = await this.horoscopeService.findBySignAndDate(sign, new Date());

      if (!horoscope) {
        throw new NotFoundException(`Horóscopo de ${sign} no disponible`);
      }

      this.horoscopeService.incrementViewCount(horoscope.id).catch(() => {});
      return this.toResponseDto(horoscope);
    }

    @Get("my-sign")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Obtener horóscopo de mi signo" })
    @ApiResponse({ status: 200, type: HoroscopeResponseDto })
    @ApiResponse({ status: 400, description: "Sin fecha de nacimiento" })
    async getMySignHoroscope(@CurrentUser() user: User): Promise<HoroscopeResponseDto> {
      if (!user.birthDate) {
        throw new BadRequestException("Configura tu fecha de nacimiento para ver tu horóscopo");
      }

      const sign = getZodiacSign(user.birthDate);
      const horoscope = await this.horoscopeService.findBySignAndDate(sign, new Date());

      if (!horoscope) {
        throw new NotFoundException(`Horóscopo de ${sign} no disponible`);
      }

      this.horoscopeService.incrementViewCount(horoscope.id).catch(() => {});
      return this.toResponseDto(horoscope);
    }

    @Get(":date")
    @ApiOperation({ summary: "Obtener horóscopos de una fecha" })
    @ApiParam({ name: "date", example: "2026-01-16" })
    async getByDate(@Param("date") dateStr: string): Promise<HoroscopeResponseDto[]> {
      const date = this.parseDate(dateStr);
      const horoscopes = await this.horoscopeService.findAllByDate(date);
      return horoscopes.map(this.toResponseDto);
    }

    @Get(":date/:sign")
    @ApiOperation({ summary: "Obtener horóscopo específico" })
    async getByDateAndSign(
      @Param("date") dateStr: string,
      @Param("sign", new ParseEnumPipe(ZodiacSign)) sign: ZodiacSign,
    ): Promise<HoroscopeResponseDto> {
      const date = this.parseDate(dateStr);
      const horoscope = await this.horoscopeService.findBySignAndDate(sign, date);

      if (!horoscope) {
        throw new NotFoundException(`Horóscopo no disponible`);
      }

      return this.toResponseDto(horoscope);
    }

    private parseDate(dateStr: string): Date {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestException("Formato inválido. Usar YYYY-MM-DD");
      }
      return date;
    }

    private toResponseDto(horoscope: DailyHoroscope): HoroscopeResponseDto {
      return {
        id: horoscope.id,
        zodiacSign: horoscope.zodiacSign,
        horoscopeDate: horoscope.horoscopeDate.toISOString().split("T")[0],
        generalContent: horoscope.generalContent,
        areas: horoscope.areas,
        luckyNumber: horoscope.luckyNumber,
        luckyColor: horoscope.luckyColor,
        luckyTime: horoscope.luckyTime,
      };
    }
  }
  ```

- [ ] Agregar controller al módulo

- [ ] Documentar con Swagger

##### Testing

- [ ] Test e2e: GET /horoscope/today retorna array
- [ ] Test e2e: GET /horoscope/today/aries retorna horóscopo
- [ ] Test e2e: GET /horoscope/today/invalid retorna 400
- [ ] Test e2e: GET /horoscope/my-sign sin auth retorna 401
- [ ] Test e2e: GET /horoscope/my-sign sin birthDate retorna 400
- [ ] Test e2e: 404 cuando no hay horóscopo

---

#### 🎯 Criterios de Aceptación

- [ ] Todos los endpoints funcionan
- [ ] Validación de enum funciona
- [ ] Endpoint /my-sign requiere auth
- [ ] Documentación Swagger completa
- [ ] Tests e2e cubren todos los casos

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Usar `ParseEnumPipe` para validar signos
> - El incremento de viewCount es fire-and-forget
> - Usar el decorador `@CurrentUser()` existente
> - NO crear endpoint de generación manual aquí

---

### TASK-106: Crear Cron Job de generación diaria

**Módulo:** `src/modules/horoscope/application/services/`  
**Prioridad:** 🔴 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-104

---

#### 📋 Descripción

Implementar el cron job que genera horóscopos diarios de forma **SECUENCIAL** con delays para respetar límites de rate de Gemini (15 RPM).

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `src/modules/horoscope/application/services/horoscope-cron.service.ts`
- `src/modules/horoscope/application/services/horoscope-cron.service.spec.ts`

**Configuración crítica:**

- Horario: 06:00 UTC
- Ejecución: SECUENCIAL (no paralela)
- Delay entre signos: 6 segundos
- Objetivo: Nunca superar 15 RPM de Gemini

---

#### ✅ Tareas Específicas

##### Backend

- [ ] Crear `HoroscopeCronService`:

  ```typescript
  @Injectable()
  export class HoroscopeCronService {
    private readonly logger = new Logger(HoroscopeCronService.name);
    private readonly DELAY_BETWEEN_SIGNS_MS = 6000;

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

    constructor(private readonly horoscopeService: HoroscopeGenerationService) {}

    /**
     * Genera horóscopos diarios - 06:00 UTC
     *
     * LÓGICA SECUENCIAL:
     * - Un signo a la vez
     * - 6 segundos entre generaciones
     * - Total: ~72 segundos para 12 signos
     */
    @Cron("0 0 6 * * *", {
      name: "daily-horoscope-generation",
      timeZone: "UTC",
    })
    async generateDailyHoroscopes(): Promise<void> {
      const startTime = Date.now();
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];

      this.logger.log(`=== INICIO: Horóscopos para ${dateStr} ===`);

      const results: GenerationResult[] = [];

      for (let i = 0; i < this.ZODIAC_ORDER.length; i++) {
        const sign = this.ZODIAC_ORDER[i];

        if (i > 0) {
          this.logger.debug(`Esperando ${this.DELAY_BETWEEN_SIGNS_MS}ms...`);
          await this.delay(this.DELAY_BETWEEN_SIGNS_MS);
        }

        const result = await this.generateSingleHoroscope(sign, today, i + 1);
        results.push(result);
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      const totalTime = Date.now() - startTime;

      this.logger.log(`=== FIN: ${successful}/12 exitosos ===`);
      this.logger.log(`Tiempo total: ${(totalTime / 1000).toFixed(1)}s`);

      results.filter((r) => !r.success).forEach((r) => this.logger.error(`FALLO ${r.sign}: ${r.error}`));

      if (failed > 0) {
        this.logger.warn(`⚠️ ${failed} horóscopos fallaron`);
      }
    }

    private async generateSingleHoroscope(sign: ZodiacSign, date: Date, index: number): Promise<GenerationResult> {
      const signName = getZodiacSignInfo(sign).nameEs;

      try {
        this.logger.log(`[${index}/12] Generando ${signName}...`);

        const startTime = Date.now();
        const horoscope = await this.horoscopeService.generateForSign(sign, date);
        const duration = Date.now() - startTime;

        this.logger.log(`[${index}/12] ✓ ${signName} (${duration}ms, ${horoscope.aiProvider})`);

        return { sign, success: true, duration, provider: horoscope.aiProvider };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`[${index}/12] ✗ ${signName}: ${errorMessage}`);
        return { sign, success: false, error: errorMessage };
      }
    }

    /**
     * Limpia horóscopos >30 días - Semanal
     */
    @Cron(CronExpression.EVERY_WEEK, {
      name: "horoscope-cleanup",
      timeZone: "UTC",
    })
    async cleanupOldHoroscopes(): Promise<void> {
      this.logger.log("Limpiando horóscopos antiguos...");

      try {
        const deletedCount = await this.horoscopeService.cleanupOldHoroscopes(30);
        this.logger.log(`Eliminados: ${deletedCount}`);
      } catch (error) {
        this.logger.error("Error en limpieza:", error);
      }
    }

    /**
     * Método manual para testing
     */
    async generateNow(): Promise<void> {
      this.logger.warn("Generación manual iniciada...");
      await this.generateDailyHoroscopes();
    }

    private delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  interface GenerationResult {
    sign: ZodiacSign;
    success: boolean;
    duration?: number;
    provider?: string;
    error?: string;
  }
  ```

- [ ] Registrar servicio en módulo:

  ```typescript
  providers: [
    HoroscopeGenerationService,
    HoroscopeCronService,
  ],
  ```

- [ ] Crear constantes configurables:
  ```typescript
  export const HOROSCOPE_CRON_CONFIG = {
    DELAY_BETWEEN_SIGNS_MS: 6000,
    RETENTION_DAYS: 30,
    GENERATION_SCHEDULE: "0 0 6 * * *",
  };
  ```

##### Testing

- [ ] Test: Genera 12 horóscopos en orden
- [ ] Test: Delay se ejecuta entre cada signo
- [ ] Test: Continúa si un signo falla
- [ ] Test: generateNow() funciona
- [ ] Test: Limpieza elimina horóscopos >30 días

---

#### 🎯 Criterios de Aceptación

- [ ] Cron job se registra (06:00 UTC)
- [ ] Generación es SECUENCIAL
- [ ] Delay de 6 segundos funciona
- [ ] Si falla un signo, continúa
- [ ] Logs detallados
- [ ] Limpieza semanal funciona

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - La generación DEBE ser secuencial, NO usar Promise.all()
> - El delay de 6 segundos es crítico (Gemini = 15 RPM)
> - Usar @Cron con timezone 'UTC' explícito
> - NO bloquear la app si el cron falla
> - El método generateNow() es para testing manual

# Frontend: Types, API Client y Hooks

---

### TASK-107: Crear tipos TypeScript y API client para Horóscopo

**Módulo:** `frontend/src/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-105 (endpoints backend)

---

#### 📋 Descripción

Crear los tipos TypeScript, endpoints y funciones de API para horóscopo.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/types/horoscope.types.ts`
- `frontend/src/lib/api/horoscope-api.ts`
- `frontend/src/lib/utils/zodiac.ts`
- `frontend/src/hooks/api/useHoroscope.ts`

**Archivos a modificar:**

- `frontend/src/lib/api/endpoints.ts`
- `frontend/src/types/index.ts`

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `horoscope.types.ts`:

  ```typescript
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

  export interface HoroscopeArea {
    content: string;
    score: number;
  }

  export interface HoroscopeAreas {
    love: HoroscopeArea;
    wellness: HoroscopeArea; // Bienestar: energía, descanso, estrés, meditación, autocuidado
    money: HoroscopeArea;
  }

  export interface DailyHoroscope {
    id: number;
    zodiacSign: ZodiacSign;
    horoscopeDate: string;
    generalContent: string;
    areas: HoroscopeAreas;
    luckyNumber: number | null;
    luckyColor: string | null;
    luckyTime: string | null;
  }

  export interface ZodiacSignInfo {
    sign: ZodiacSign;
    nameEs: string;
    nameEn: string;
    symbol: string;
    element: "fire" | "earth" | "air" | "water";
  }
  ```

- [ ] Agregar endpoints en `endpoints.ts`:

  ```typescript
  export const API_ENDPOINTS = {
    // ...existentes

    HOROSCOPE: {
      TODAY_ALL: "/horoscope/today",
      TODAY_SIGN: (sign: string) => `/horoscope/today/${sign}`,
      MY_SIGN: "/horoscope/my-sign",
      BY_DATE: (date: string) => `/horoscope/${date}`,
      BY_DATE_SIGN: (date: string, sign: string) => `/horoscope/${date}/${sign}`,
    },
  } as const;
  ```

- [ ] Crear `horoscope-api.ts`:

  ```typescript
  import { apiClient } from "./axios-config";
  import { API_ENDPOINTS } from "./endpoints";
  import type { DailyHoroscope, ZodiacSign } from "@/types/horoscope.types";

  export async function getTodayAllHoroscopes(): Promise<DailyHoroscope[]> {
    const response = await apiClient.get<DailyHoroscope[]>(API_ENDPOINTS.HOROSCOPE.TODAY_ALL);
    return response.data;
  }

  export async function getTodayHoroscope(sign: ZodiacSign): Promise<DailyHoroscope> {
    const response = await apiClient.get<DailyHoroscope>(API_ENDPOINTS.HOROSCOPE.TODAY_SIGN(sign));
    return response.data;
  }

  export async function getMySignHoroscope(): Promise<DailyHoroscope> {
    const response = await apiClient.get<DailyHoroscope>(API_ENDPOINTS.HOROSCOPE.MY_SIGN);
    return response.data;
  }

  export async function getHoroscopeByDate(date: string): Promise<DailyHoroscope[]> {
    const response = await apiClient.get<DailyHoroscope[]>(API_ENDPOINTS.HOROSCOPE.BY_DATE(date));
    return response.data;
  }

  export async function getHoroscopeByDateAndSign(date: string, sign: ZodiacSign): Promise<DailyHoroscope> {
    const response = await apiClient.get<DailyHoroscope>(API_ENDPOINTS.HOROSCOPE.BY_DATE_SIGN(date, sign));
    return response.data;
  }
  ```

- [ ] Crear `lib/utils/zodiac.ts`:

  ```typescript
  import { ZodiacSign, ZodiacSignInfo } from "@/types/horoscope.types";

  export const ZODIAC_SIGNS_INFO: Record<ZodiacSign, ZodiacSignInfo> = {
    [ZodiacSign.ARIES]: {
      sign: ZodiacSign.ARIES,
      nameEs: "Aries",
      nameEn: "Aries",
      symbol: "♈",
      element: "fire",
    },
    [ZodiacSign.TAURUS]: {
      sign: ZodiacSign.TAURUS,
      nameEs: "Tauro",
      nameEn: "Taurus",
      symbol: "♉",
      element: "earth",
    },
    [ZodiacSign.GEMINI]: {
      sign: ZodiacSign.GEMINI,
      nameEs: "Géminis",
      nameEn: "Gemini",
      symbol: "♊",
      element: "air",
    },
    [ZodiacSign.CANCER]: {
      sign: ZodiacSign.CANCER,
      nameEs: "Cáncer",
      nameEn: "Cancer",
      symbol: "♋",
      element: "water",
    },
    [ZodiacSign.LEO]: {
      sign: ZodiacSign.LEO,
      nameEs: "Leo",
      nameEn: "Leo",
      symbol: "♌",
      element: "fire",
    },
    [ZodiacSign.VIRGO]: {
      sign: ZodiacSign.VIRGO,
      nameEs: "Virgo",
      nameEn: "Virgo",
      symbol: "♍",
      element: "earth",
    },
    [ZodiacSign.LIBRA]: {
      sign: ZodiacSign.LIBRA,
      nameEs: "Libra",
      nameEn: "Libra",
      symbol: "♎",
      element: "air",
    },
    [ZodiacSign.SCORPIO]: {
      sign: ZodiacSign.SCORPIO,
      nameEs: "Escorpio",
      nameEn: "Scorpio",
      symbol: "♏",
      element: "water",
    },
    [ZodiacSign.SAGITTARIUS]: {
      sign: ZodiacSign.SAGITTARIUS,
      nameEs: "Sagitario",
      nameEn: "Sagittarius",
      symbol: "♐",
      element: "fire",
    },
    [ZodiacSign.CAPRICORN]: {
      sign: ZodiacSign.CAPRICORN,
      nameEs: "Capricornio",
      nameEn: "Capricorn",
      symbol: "♑",
      element: "earth",
    },
    [ZodiacSign.AQUARIUS]: {
      sign: ZodiacSign.AQUARIUS,
      nameEs: "Acuario",
      nameEn: "Aquarius",
      symbol: "♒",
      element: "air",
    },
    [ZodiacSign.PISCES]: {
      sign: ZodiacSign.PISCES,
      nameEs: "Piscis",
      nameEn: "Pisces",
      symbol: "♓",
      element: "water",
    },
  };

  const ZODIAC_RANGES = [
    { sign: ZodiacSign.CAPRICORN, start: [12, 22], end: [1, 19] },
    { sign: ZodiacSign.AQUARIUS, start: [1, 20], end: [2, 18] },
    { sign: ZodiacSign.PISCES, start: [2, 19], end: [3, 20] },
    { sign: ZodiacSign.ARIES, start: [3, 21], end: [4, 19] },
    { sign: ZodiacSign.TAURUS, start: [4, 20], end: [5, 20] },
    { sign: ZodiacSign.GEMINI, start: [5, 21], end: [6, 20] },
    { sign: ZodiacSign.CANCER, start: [6, 21], end: [7, 22] },
    { sign: ZodiacSign.LEO, start: [7, 23], end: [8, 22] },
    { sign: ZodiacSign.VIRGO, start: [8, 23], end: [9, 22] },
    { sign: ZodiacSign.LIBRA, start: [9, 23], end: [10, 22] },
    { sign: ZodiacSign.SCORPIO, start: [10, 23], end: [11, 21] },
    { sign: ZodiacSign.SAGITTARIUS, start: [11, 22], end: [12, 21] },
  ];

  export function getZodiacSignFromDate(birthDate: Date): ZodiacSign {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    for (const range of ZODIAC_RANGES) {
      const [startMonth, startDay] = range.start;
      const [endMonth, endDay] = range.end;

      // Caso especial: Capricornio cruza el año
      if (startMonth > endMonth) {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return range.sign;
        }
      } else {
        if (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)
        ) {
          return range.sign;
        }
      }
    }

    return ZodiacSign.CAPRICORN; // Default
  }

  export function getZodiacSignInfo(sign: ZodiacSign): ZodiacSignInfo {
    return ZODIAC_SIGNS_INFO[sign];
  }
  ```

- [ ] Crear `useHoroscope.ts`:

  ```typescript
  "use client";

  import { useQuery } from "@tanstack/react-query";
  import { getTodayAllHoroscopes, getTodayHoroscope, getMySignHoroscope } from "@/lib/api/horoscope-api";
  import type { ZodiacSign } from "@/types/horoscope.types";

  export const horoscopeQueryKeys = {
    all: ["horoscope"] as const,
    todayAll: () => [...horoscopeQueryKeys.all, "today", "all"] as const,
    todaySign: (sign: ZodiacSign) => [...horoscopeQueryKeys.all, "today", sign] as const,
    mySign: () => [...horoscopeQueryKeys.all, "my-sign"] as const,
  } as const;

  export function useTodayAllHoroscopes() {
    return useQuery({
      queryKey: horoscopeQueryKeys.todayAll(),
      queryFn: getTodayAllHoroscopes,
      staleTime: 1000 * 60 * 60, // 1 hora
    });
  }

  export function useTodayHoroscope(sign: ZodiacSign | null) {
    return useQuery({
      queryKey: horoscopeQueryKeys.todaySign(sign!),
      queryFn: () => getTodayHoroscope(sign!),
      enabled: !!sign,
      staleTime: 1000 * 60 * 60,
    });
  }

  export function useMySignHoroscope() {
    return useQuery({
      queryKey: horoscopeQueryKeys.mySign(),
      queryFn: getMySignHoroscope,
      staleTime: 1000 * 60 * 60,
      retry: false,
    });
  }
  ```

- [ ] Exportar desde `types/index.ts`

##### Testing

- [ ] Test: Tipos se exportan correctamente
- [ ] Test: API functions hacen llamadas correctas
- [ ] Test: getZodiacSignFromDate calcula correctamente
- [ ] Test: Hooks retornan datos esperados

---

#### 🎯 Criterios de Aceptación

- [ ] Tipos completos y documentados
- [ ] API functions cubren todos los endpoints
- [ ] Helper de signos funciona (incluido Capricornio)
- [ ] Hooks con staleTime de 1 hora

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Capricornio cruza el año, requiere lógica especial
> - staleTime de 1 hora porque el horóscopo no cambia en el día
> - retry: false en useMySignHoroscope (puede fallar por falta de birthDate)

# Frontend: Componentes UI

---

### TASK-108: Crear componentes UI de Horóscopo

**Módulo:** `frontend/src/components/features/horoscope/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-107

---

#### 📋 Descripción

Crear los componentes de UI para mostrar horóscopos: selector de signos, tarjetas, vista detallada y widget para dashboard.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

```
frontend/src/components/features/horoscope/
├── index.ts
├── ZodiacSignSelector.tsx
├── ZodiacSignCard.tsx
├── HoroscopeDetail.tsx
├── HoroscopeAreaCard.tsx
├── HoroscopeWidget.tsx
├── HoroscopeSkeleton.tsx
└── __tests__/
    └── (tests)
```

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Crear `ZodiacSignCard.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
  import type { ZodiacSign, ZodiacSignInfo } from "@/types/horoscope.types";

  interface ZodiacSignCardProps {
    signInfo: ZodiacSignInfo;
    isSelected?: boolean;
    isUserSign?: boolean;
    onClick?: (sign: ZodiacSign) => void;
    className?: string;
  }

  export function ZodiacSignCard({
    signInfo,
    isSelected = false,
    isUserSign = false,
    onClick,
    className,
  }: ZodiacSignCardProps) {
    return (
      <Card
        data-testid={`zodiac-card-${signInfo.sign}`}
        className={cn(
          "cursor-pointer p-4 text-center transition-all",
          "hover:shadow-md hover:scale-105",
          isSelected && "ring-2 ring-primary",
          isUserSign && "border-accent border-2",
          className,
        )}
        onClick={() => onClick?.(signInfo.sign)}
      >
        <span className="text-4xl" role="img" aria-label={signInfo.nameEs}>
          {signInfo.symbol}
        </span>
        <p className="mt-2 font-serif text-lg">{signInfo.nameEs}</p>
        {isUserSign && <span className="text-xs text-muted-foreground">Tu signo</span>}
      </Card>
    );
  }
  ```

- [ ] Crear `ZodiacSignSelector.tsx`:

  ```tsx
  "use client";

  import { ZodiacSignCard } from "./ZodiacSignCard";
  import { ZODIAC_SIGNS_INFO } from "@/lib/utils/zodiac";
  import { cn } from "@/lib/utils";
  import type { ZodiacSign } from "@/types/horoscope.types";

  interface ZodiacSignSelectorProps {
    selectedSign?: ZodiacSign | null;
    userSign?: ZodiacSign | null;
    onSelect: (sign: ZodiacSign) => void;
    className?: string;
  }

  export function ZodiacSignSelector({ selectedSign, userSign, onSelect, className }: ZodiacSignSelectorProps) {
    const signs = Object.values(ZODIAC_SIGNS_INFO);

    return (
      <div
        data-testid="zodiac-selector"
        className={cn("grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6", className)}
      >
        {signs.map((signInfo) => (
          <ZodiacSignCard
            key={signInfo.sign}
            signInfo={signInfo}
            isSelected={selectedSign === signInfo.sign}
            isUserSign={userSign === signInfo.sign}
            onClick={onSelect}
          />
        ))}
      </div>
    );
  }
  ```

- [ ] Crear `HoroscopeAreaCard.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Heart, Sparkles, Wallet } from "lucide-react";
  import { cn } from "@/lib/utils";
  import type { HoroscopeArea } from "@/types/horoscope.types";

  interface HoroscopeAreaCardProps {
    area: "love" | "wellness" | "money";
    data: HoroscopeArea;
    className?: string;
  }

  // Bienestar: En lugar de diagnósticos físicos, la IA habla de niveles de energía,
  // descanso, estrés, meditación y autocuidado.
  const AREA_CONFIG = {
    love: {
      title: "Amor",
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
    },
    wellness: {
      title: "Bienestar",
      icon: Sparkles,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    money: {
      title: "Dinero",
      icon: Wallet,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
    },
  };

  export function HoroscopeAreaCard({ area, data, className }: HoroscopeAreaCardProps) {
    const config = AREA_CONFIG[area];
    const Icon = config.icon;

    // Renderizar score como puntos
    const renderScore = (score: number) => {
      return (
        <div className="flex gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={cn("w-2 h-2 rounded-full", i < score ? config.color.replace("text-", "bg-") : "bg-gray-200")}
            />
          ))}
        </div>
      );
    };

    return (
      <Card data-testid={`horoscope-area-${area}`} className={cn("p-4", config.bgColor, className)}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className={cn("h-5 w-5", config.color)} />
          <h3 className="font-serif text-lg">{config.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{data.content}</p>

        <div className="flex items-center justify-between">
          {renderScore(data.score)}
          <span className="text-sm font-medium">{data.score}/10</span>
        </div>
      </Card>
    );
  }
  ```

- [ ] Crear `HoroscopeDetail.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { HoroscopeAreaCard } from "./HoroscopeAreaCard";
  import { ZODIAC_SIGNS_INFO } from "@/lib/utils/zodiac";
  import { cn } from "@/lib/utils";
  import type { DailyHoroscope } from "@/types/horoscope.types";

  interface HoroscopeDetailProps {
    horoscope: DailyHoroscope;
    className?: string;
  }

  export function HoroscopeDetail({ horoscope, className }: HoroscopeDetailProps) {
    const signInfo = ZODIAC_SIGNS_INFO[horoscope.zodiacSign];

    return (
      <div data-testid="horoscope-detail" className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="text-center">
          <span className="text-6xl">{signInfo.symbol}</span>
          <h1 className="mt-2 font-serif text-3xl">{signInfo.nameEs}</h1>
          <Badge variant="secondary" className="mt-2">
            {horoscope.horoscopeDate}
          </Badge>
        </div>

        {/* General Content */}
        <Card className="p-6">
          <p className="text-lg leading-relaxed">{horoscope.generalContent}</p>
        </Card>

        {/* Areas */}
        <div className="grid gap-4 md:grid-cols-3">
          <HoroscopeAreaCard area="love" data={horoscope.areas.love} />
          <HoroscopeAreaCard area="wellness" data={horoscope.areas.wellness} />
          <HoroscopeAreaCard area="money" data={horoscope.areas.money} />
        </div>

        {/* Lucky Elements */}
        {(horoscope.luckyNumber || horoscope.luckyColor || horoscope.luckyTime) && (
          <Card className="p-4">
            <h3 className="font-serif text-lg mb-3">Tu Suerte Hoy</h3>
            <div className="flex flex-wrap gap-6">
              {horoscope.luckyNumber && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{horoscope.luckyNumber}</p>
                  <p className="text-xs text-muted-foreground">Número</p>
                </div>
              )}
              {horoscope.luckyColor && (
                <div className="text-center">
                  <p className="text-lg font-medium">{horoscope.luckyColor}</p>
                  <p className="text-xs text-muted-foreground">Color</p>
                </div>
              )}
              {horoscope.luckyTime && (
                <div className="text-center">
                  <p className="text-lg font-medium">{horoscope.luckyTime}</p>
                  <p className="text-xs text-muted-foreground">Mejor momento</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }
  ```

- [ ] Crear `HoroscopeWidget.tsx`:

  ```tsx
  "use client";

  import Link from "next/link";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Skeleton } from "@/components/ui/skeleton";
  import { useMySignHoroscope } from "@/hooks/api/useHoroscope";
  import { useAuthStore } from "@/stores/authStore";
  import { getZodiacSignFromDate, ZODIAC_SIGNS_INFO } from "@/lib/utils/zodiac";
  import { ArrowRight, Settings } from "lucide-react";

  export function HoroscopeWidget() {
    const { user } = useAuthStore();
    const { data: horoscope, isLoading, error } = useMySignHoroscope();

    // Usuario sin birthDate
    if (!user?.birthDate) {
      return (
        <Card className="p-6">
          <h2 className="font-serif text-xl mb-2">Tu Horóscopo</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Configura tu fecha de nacimiento para ver tu horóscopo personalizado
          </p>
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

    if (error || !horoscope) {
      return (
        <Card className="p-6">
          <h2 className="font-serif text-xl mb-2">Tu Horóscopo</h2>
          <p className="text-muted-foreground text-sm">No disponible en este momento</p>
        </Card>
      );
    }

    const signInfo = ZODIAC_SIGNS_INFO[horoscope.zodiacSign];

    return (
      <Card data-testid="horoscope-widget" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{signInfo.symbol}</span>
            <h2 className="font-serif text-xl">{signInfo.nameEs}</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/horoscopo/${horoscope.zodiacSign}`}>
              Ver más
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="text-sm line-clamp-3 text-muted-foreground">{horoscope.generalContent}</p>

        <div className="mt-4 flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="text-rose-500">❤️</span>
            {horoscope.areas.love.score}/10
          </span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-500">✨</span>
            {horoscope.areas.wellness.score}/10
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500">💰</span>
            {horoscope.areas.money.score}/10
          </span>
        </div>
      </Card>
    );
  }
  ```

- [ ] Crear `HoroscopeSkeleton.tsx`:

  ```tsx
  "use client";

  import { Card } from "@/components/ui/card";
  import { Skeleton } from "@/components/ui/skeleton";

  interface HoroscopeSkeletonProps {
    variant?: "grid" | "detail";
  }

  export function HoroscopeSkeleton({ variant = "grid" }: HoroscopeSkeletonProps) {
    if (variant === "detail") {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-32 mx-auto mt-2" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      );
    }

    // Grid skeleton (12 cards)
    return (
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto mt-2" />
          </Card>
        ))}
      </div>
    );
  }
  ```

- [ ] Crear `index.ts`:
  ```typescript
  export { ZodiacSignSelector } from "./ZodiacSignSelector";
  export { ZodiacSignCard } from "./ZodiacSignCard";
  export { HoroscopeDetail } from "./HoroscopeDetail";
  export { HoroscopeAreaCard } from "./HoroscopeAreaCard";
  export { HoroscopeWidget } from "./HoroscopeWidget";
  export { HoroscopeSkeleton } from "./HoroscopeSkeleton";
  ```

##### Testing

- [ ] Test: ZodiacSignSelector renderiza 12 signos
- [ ] Test: Click en tarjeta llama onSelect
- [ ] Test: HoroscopeDetail muestra todas las áreas
- [ ] Test: HoroscopeWidget muestra CTA si no hay birthDate
- [ ] Test: Loading states funcionan

---

#### 🎯 Criterios de Aceptación

- [ ] Componentes siguen design system
- [ ] Accesibles (aria-labels, roles)
- [ ] Loading y error states
- [ ] Responsive en móvil y desktop
- [ ] Tests cubren casos principales

---

#### 📎 Notas para el Agente IA

> **IMPORTANTE:**
>
> - Usar componentes de `@/components/ui/` (shadcn)
> - Usar `cn()` para clases condicionales
> - data-testid para facilitar testing
> - Los scores se muestran como puntos visuales (1-10)

# Frontend: Páginas de Horóscopo

---

### TASK-109: Crear página de Horóscopo y agregar al Header

**Módulo:** `frontend/src/app/horoscopo/`  
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 día  
**Dependencias:** TASK-108

---

#### 📋 Descripción

Crear la página principal de horóscopo con selector de signos y vista detallada.

---

#### 🏗️ Contexto Técnico

**Archivos a crear:**

- `frontend/src/app/horoscopo/page.tsx`
- `frontend/src/app/horoscopo/[sign]/page.tsx`

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
    HOROSCOPO: "/horoscopo",
    HOROSCOPO_SIGN: (sign: string) => `/horoscopo/${sign}`,
  } as const;
  ```

- [ ] Crear `app/horoscopo/page.tsx`:

  ```tsx
  "use client";

  import { useRouter } from "next/navigation";
  import { ZodiacSignSelector, HoroscopeSkeleton } from "@/components/features/horoscope";
  import { useTodayAllHoroscopes } from "@/hooks/api/useHoroscope";
  import { useAuthStore } from "@/stores/authStore";
  import { getZodiacSignFromDate } from "@/lib/utils/zodiac";
  import { ROUTES } from "@/lib/constants/routes";
  import type { ZodiacSign } from "@/types/horoscope.types";

  export default function HoroscopoPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { isLoading } = useTodayAllHoroscopes();

    const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

    const handleSignSelect = (sign: ZodiacSign) => {
      router.push(ROUTES.HOROSCOPO_SIGN(sign));
    };

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-2">Horóscopo Diario</h1>
          <p className="text-muted-foreground">Selecciona tu signo para ver las predicciones</p>
        </div>

        {!isAuthenticated && (
          <div className="bg-muted/50 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              <a href="/registro" className="text-primary hover:underline">
                Regístrate
              </a>{" "}
              para ver tu horóscopo automáticamente
            </p>
          </div>
        )}

        {isAuthenticated && !userSign && (
          <div className="bg-accent/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm">
              <a href="/perfil" className="text-primary hover:underline">
                Configura tu fecha de nacimiento
              </a>
            </p>
          </div>
        )}

        {isLoading ? (
          <HoroscopeSkeleton variant="grid" />
        ) : (
          <ZodiacSignSelector userSign={userSign} onSelect={handleSignSelect} />
        )}
      </div>
    );
  }
  ```

- [ ] Crear `app/horoscopo/[sign]/page.tsx`:

  ```tsx
  "use client";

  import { useParams, useRouter } from "next/navigation";
  import { ArrowLeft } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { HoroscopeDetail, HoroscopeSkeleton, ZodiacSignSelector } from "@/components/features/horoscope";
  import { useTodayHoroscope } from "@/hooks/api/useHoroscope";
  import { useAuthStore } from "@/stores/authStore";
  import { getZodiacSignFromDate, ZODIAC_SIGNS_INFO } from "@/lib/utils/zodiac";
  import { ROUTES } from "@/lib/constants/routes";
  import { ZodiacSign } from "@/types/horoscope.types";

  export default function HoroscopeSignPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const sign = params.sign as ZodiacSign;
    const { data, isLoading, error } = useTodayHoroscope(sign);

    if (!ZODIAC_SIGNS_INFO[sign]) {
      return (
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl mb-4">Signo no válido</h1>
          <Button onClick={() => router.push(ROUTES.HOROSCOPO)}>Ver todos los signos</Button>
        </div>
      );
    }

    const userSign = user?.birthDate ? getZodiacSignFromDate(new Date(user.birthDate)) : null;

    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.HOROSCOPO)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Todos los signos
        </Button>

        <div className="mb-8 overflow-x-auto pb-2">
          <ZodiacSignSelector
            selectedSign={sign}
            userSign={userSign}
            onSelect={(s) => router.push(ROUTES.HOROSCOPO_SIGN(s))}
            className="!grid-cols-6 lg:!grid-cols-12"
          />
        </div>

        {isLoading ? (
          <HoroscopeSkeleton variant="detail" />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Horóscopo no disponible</p>
          </div>
        ) : data ? (
          <HoroscopeDetail horoscope={data} />
        ) : null}
      </div>
    );
  }
  ```

- [ ] Actualizar `Header.tsx` - agregar link:
  ```tsx
  const navigationItems = [
    { href: "/carta-del-dia", label: "Carta del Día" },
    { href: "/horoscopo", label: "Horóscopo" },
    { href: "/ritual", label: "Lectura", requiresAuth: true },
  ];
  ```

##### Testing

- [ ] Test: Página muestra 12 signos
- [ ] Test: Click navega a página de signo
- [ ] Test: Página de signo muestra detalle
- [ ] Test: Signo inválido muestra error

---

#### 🎯 Criterios de Aceptación

- [ ] /horoscopo muestra selector de signos
- [ ] /horoscopo/[sign] muestra detalle
- [ ] Navegación entre signos funciona
- [ ] Link visible en header
- [ ] Responsive en móvil y desktop

# Dashboard Widget y Esquema de Datos

---

### TASK-110: Agregar widget de Horóscopo al Dashboard

**Módulo:** `frontend/src/components/features/dashboard/`  
**Prioridad:** 🟢 BAJA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-108, TASK-109

---

#### 📋 Descripción

Integrar el widget de horóscopo en el dashboard del usuario autenticado.

---

#### ✅ Tareas Específicas

##### Frontend

- [ ] Importar `HoroscopeWidget` en `UserDashboard.tsx`:

  ```tsx
  import { HoroscopeWidget } from "@/components/features/horoscope";

  // En el layout del dashboard:
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <DailyCardWidget />
    <HoroscopeWidget />
    {/* Otros widgets */}
  </div>;
  ```

- [ ] Verificar que el widget maneje:
  - Usuario sin birthDate → CTA para configurar
  - Horóscopo no disponible → mensaje de error
  - Loading → skeleton

##### Testing

- [ ] Test: Dashboard muestra widget
- [ ] Test: Widget muestra signo correcto
- [ ] Test: CTA funciona si no hay birthDate

---

#### 🎯 Criterios de Aceptación

- [ ] Widget visible en dashboard
- [ ] Muestra signo y resumen
- [ ] CTA funciona para configurar birthDate

---

## ESQUEMA DE DATOS

### Nueva Tabla: `daily_horoscopes`

```sql
CREATE TYPE zodiac_sign_enum AS ENUM (
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
);

CREATE TABLE daily_horoscopes (
  id SERIAL PRIMARY KEY,
  zodiac_sign zodiac_sign_enum NOT NULL,
  horoscope_date DATE NOT NULL,
  general_content TEXT NOT NULL,
  areas JSONB NOT NULL,
  lucky_number SMALLINT,
  lucky_color VARCHAR(50),
  lucky_time VARCHAR(100),
  ai_provider VARCHAR(50),
  ai_model VARCHAR(100),
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_sign_date UNIQUE (zodiac_sign, horoscope_date)
);

CREATE INDEX idx_horoscope_date ON daily_horoscopes(horoscope_date);
```

### Modificación: Tabla `users`

```sql
ALTER TABLE users ADD COLUMN birth_date DATE NULL;
```

### Tamaño Estimado

| Período | Registros | Tamaño  |
| ------- | --------- | ------- |
| 1 día   | 12        | ~24 KB  |
| 1 mes   | 360       | ~720 KB |
| 1 año   | 4,380     | ~9 MB   |

**Retención:** 30 días

---

## DEPENDENCIAS Y RIESGOS

### Dependencias npm (Backend)

```json
{
  "@google/generative-ai": "^0.21.0"
}
```

### Variables de Entorno

```bash
GEMINI_API_KEY=your-gemini-api-key
```

### Riesgos

| Riesgo                | Prob. | Impacto | Mitigación            |
| --------------------- | ----- | ------- | --------------------- |
| Groq no disponible    | Media | Alto    | Gemini fallback       |
| Gemini rate limit     | Baja  | Medio   | Delay 6s entre signos |
| JSON parsing falla    | Media | Medio   | Validación + retry    |
| Usuario sin birthDate | Alta  | Bajo    | CTA amigable          |

### Orden de Implementación

```
Semana 1:
├── TASK-100: birthDate en User (0.5d)
├── TASK-101: Helper zodiacal (0.5d)
├── TASK-102: Gemini Provider (1d)
└── TASK-103: Entidad DailyHoroscope (0.5d)

Semana 2:
├── TASK-104: Servicio generación (1.5d)
├── TASK-105: Endpoints (1d)
└── TASK-106: Cron Job (1d)

Semana 3:
├── TASK-107: Types y API (0.5d)
├── TASK-108: Componentes UI (1.5d)
├── TASK-109: Páginas (1d)
└── TASK-110: Widget (0.5d)
```

**Total:** 8-10 días

---

## CHECKLIST DE COMPLETITUD

### Backend

- [ ] TASK-100: Campo birthDate
- [ ] TASK-101: Helper zodiacal
- [x] TASK-102: Gemini Provider ✅ (17/01/2026)
- [ ] TASK-103: Entidad DailyHoroscope
- [ ] TASK-104: Servicio generación
- [ ] TASK-105: Endpoints
- [ ] TASK-106: Cron job

### Frontend

- [ ] TASK-107: Types y hooks
- [ ] TASK-108: Componentes UI
- [ ] TASK-109: Páginas
- [ ] TASK-110: Widget dashboard

### Infraestructura

- [ ] Migración ejecutada
- [ ] GEMINI_API_KEY configurada
- [ ] Tests >80% coverage

---

**Fin del Módulo Horóscopo Occidental**
