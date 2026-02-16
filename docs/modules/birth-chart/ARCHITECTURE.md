# Arquitectura del Módulo de Carta Astral

## Visión General

El módulo de Carta Astral implementa **Clean Architecture** con separación clara de responsabilidades en 3 capas principales: Domain, Application e Infrastructure. Esta arquitectura permite alta cohesión, bajo acoplamiento y facilita el testing y mantenimiento.

## Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                             │
│   Controllers (REST API) │ DTOs │ Guards │ Interceptors                 │
│   - BirthChartController                                                 │
│   - BirthChartHistoryController                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                          APPLICATION LAYER                               │
│   Services │ Use Cases │ Orchestration                                   │
│   - BirthChartFacadeService (orquestador principal)                     │
│   - ChartCalculationService (cálculos astronómicos)                     │
│   - ChartInterpretationService (interpretaciones)                       │
│   - ChartAISynthesisService (síntesis IA)                               │
│   - ChartCacheService (caché Redis)                                     │
│   - ChartPdfService (generación PDF)                                    │
│   - BirthChartHistoryService (historial Premium)                        │
│   - GeocodeService (búsqueda lugares)                                   │
│   - GeocodeCacheService (caché geocoding)                               │
│   - PlanetPositionService (transformación posiciones)                   │
│   - HouseCuspService (transformación casas)                             │
│   - AspectCalculationService (cálculo aspectos)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                            DOMAIN LAYER                                  │
│   Entities │ Enums │ Interfaces │ Value Objects                          │
│   - BirthChart (entidad principal)                                       │
│   - BirthChartInterpretation (interpretaciones)                         │
│   - Planet, ZodiacSign, AspectType, House (enums)                       │
│   - IBirthChartInterpretationRepository (interface)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE LAYER                              │
│   Repositories │ External APIs │ Wrappers                               │
│   - BirthChartInterpretationRepository (TypeORM)                        │
│   - EphemerisWrapper (Swiss Ephemeris)                                  │
│   - Nominatim API (geocoding)                                           │
│   - Redis (caché)                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Estructura de Directorios

```
src/modules/birth-chart/
├── birth-chart.module.ts          # Módulo NestJS (configuración DI)
├── domain/                        # Capa de negocio pura
│   ├── enums/                     # Enumeraciones del dominio
│   │   ├── planet.enum.ts         # 10 planetas + metadata
│   │   ├── zodiac-sign.enum.ts    # 12 signos + metadata
│   │   ├── aspect-type.enum.ts    # 5 aspectos mayores + metadata
│   │   ├── house.enum.ts          # 12 casas + metadata
│   │   └── interpretation-category.enum.ts  # Categorías de interpretación
│   └── interfaces/                # Contratos
│       └── birth-chart-interpretation-repository.interface.ts
├── application/                   # Lógica de aplicación
│   ├── dto/                       # Data Transfer Objects
│   │   ├── generate-chart.dto.ts       # Input para generar carta
│   │   ├── chart-response.dto.ts       # Output diferenciado por plan
│   │   ├── geocode-place.dto.ts        # Input para geocoding
│   │   └── geocode-response.dto.ts     # Output de geocoding
│   └── services/                  # Servicios de aplicación (12 servicios)
│       ├── birth-chart-facade.service.ts      # Orquestador principal
│       ├── chart-calculation.service.ts       # Cálculos astronómicos
│       ├── chart-interpretation.service.ts    # Interpretaciones
│       ├── chart-ai-synthesis.service.ts      # Síntesis IA
│       ├── chart-cache.service.ts             # Caché Redis
│       ├── chart-pdf.service.ts               # Generación PDF
│       ├── birth-chart-history.service.ts     # Historial Premium
│       ├── geocode.service.ts                 # Geocoding
│       ├── geocode-cache.service.ts           # Caché geocoding
│       ├── planet-position.service.ts         # Transformación planetas
│       ├── house-cusp.service.ts              # Transformación casas
│       └── aspect-calculation.service.ts      # Cálculo aspectos
├── infrastructure/                # Detalles técnicos
│   ├── controllers/               # REST endpoints
│   │   ├── birth-chart.controller.ts          # Endpoints generales
│   │   └── birth-chart-history.controller.ts  # Endpoints historial
│   ├── repositories/              # Implementaciones TypeORM
│   │   └── birth-chart-interpretation.repository.ts
│   ├── ephemeris/                 # Wrapper Swiss Ephemeris
│   │   └── ephemeris.wrapper.ts
│   ├── cache/                     # Redis cache strategies
│   └── seeders/                   # Seeders de datos
│       └── birth-chart-interpretations.seeder.ts  # ~490 interpretaciones
└── entities/                      # Entidades TypeORM
    ├── birth-chart.entity.ts               # Carta astral guardada
    └── birth-chart-interpretation.entity.ts # Interpretaciones estáticas
```

## Flujo de Generación de Carta

### Diagrama de Secuencia

```
Usuario → Controller → Facade → Services → Ephemeris/DB → Response

1. POST /birth-chart/generate
   ↓
2. BirthChartController.generate()
   │
   ├─ OptionalJwtAuthGuard (identifica usuario/anónimo)
   ├─ CheckUsageLimitGuard (verifica límites según plan)
   └─ IncrementUsageInterceptor (incrementa contador post-response)
   ↓
3. BirthChartFacadeService.generateChart()
   │
   ├─ ChartCacheService.get() → Si existe: retorna cacheado ✅
   │  └─ Key: birth-chart:calc:{birthDate}:{birthTime}:{lat}:{lon}
   │
   ├─ ChartCalculationService.calculateChart()
   │  │
   │  ├─ EphemerisWrapper.calculatePlanetPositions()
   │  │  └─ Swiss Ephemeris (cálculo astronómico)
   │  │
   │  ├─ EphemerisWrapper.calculateHouses()
   │  │  └─ Sistema Placidus
   │  │
   │  ├─ PlanetPositionService.transform()
   │  │  └─ Raw data → Domain objects
   │  │
   │  ├─ HouseCuspService.transform()
   │  │  └─ Raw data → Domain objects
   │  │
   │  ├─ AspectCalculationService.calculate()
   │  │  └─ Detecta aspectos con orbes
   │  │
   │  └─ Calcula distribución (elementos/modalidades)
   │
   ├─ ChartInterpretationService.generateInterpretation()
   │  │
   │  ├─ Si plan === ANONYMOUS:
   │  │  └─ Solo Big Three (Sol, Luna, Ascendente)
   │  │
   │  └─ Si plan === FREE o PREMIUM:
   │     └─ Interpretaciones completas (~490 textos)
   │
   ├─ ChartAISynthesisService.generateSynthesis() [Solo PREMIUM]
   │  │
   │  ├─ Construye prompt con datos de la carta
   │  ├─ AIProviderService.generateCompletion() (Groq Llama 3.1 70B)
   │  ├─ Valida respuesta
   │  └─ Cachea síntesis (7 días)
   │
   ├─ BirthChartRepository.save() [Solo PREMIUM]
   │  └─ Guarda en BD para historial
   │
   ├─ ChartCacheService.set()
   │  └─ Cachea resultado (24h)
   │
   └─ Retorna respuesta según plan:
      ├─ ANONYMOUS: BasicChartResponseDto (gráfico + Big Three)
      ├─ FREE: FullChartResponseDto (+ interpretaciones completas + PDF)
      └─ PREMIUM: PremiumChartResponseDto (+ síntesis IA + historial)
```

### Ejemplo de Flujo Completo (Usuario Premium)

```typescript
// 1. Request HTTP
POST /api/v1/birth-chart/generate
Body: {
  name: "María García",
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthPlace: "Buenos Aires, Argentina",
  latitude: -34.6037,
  longitude: -58.3816,
  timezone: "America/Argentina/Buenos_Aires"
}

// 2. Controller valida guards/interceptors
@UseGuards(OptionalJwtAuthGuard, CheckUsageLimitGuard)
@UseInterceptors(IncrementUsageInterceptor)

// 3. Facade coordina servicios
const chart = await this.chartCalculation.calculateChart(dto);
const interpretations = await this.chartInterpretation.generate(chart, plan);
const aiSynthesis = await this.chartAISynthesis.generate(chart); // Solo Premium
const savedChart = await this.birthChartRepo.save({...}); // Solo Premium

// 4. Response según plan
return {
  success: true,
  chartSvgData: {...},
  planets: [...],
  houses: [...],
  aspects: [...],
  bigThree: {...},
  distribution: {...},
  interpretations: {...},
  aiSynthesis: {...},        // ← Solo Premium
  savedChartId: 123,         // ← Solo Premium
  canAccessHistory: true,    // ← Solo Premium
  calculationTimeMs: 850
}
```

## Componentes Clave

### 1. BirthChartFacadeService

**Responsabilidad:** Orquestador principal que coordina todo el flujo de generación.

**Métodos principales:**
```typescript
generateChart(dto, plan, userId, fingerprint): Promise<ChartResponseDto>
generatePdf(dto, user, isPremium): Promise<{buffer, filename}>
generateSynthesisOnly(dto, userId): Promise<SynthesisDto>
getUsageStatus(user, fingerprint): Promise<UsageStatusDto>
```

**Flujo interno:**
1. Verifica caché
2. Calcula carta (si no está cacheada)
3. Genera interpretaciones según plan
4. Genera síntesis IA (Premium)
5. Guarda en BD (Premium)
6. Retorna respuesta diferenciada por plan

### 2. ChartCalculationService

**Responsabilidad:** Cálculos astronómicos usando Swiss Ephemeris.

**Métodos principales:**
```typescript
calculateChart(dto): Promise<CalculatedChart>
calculatePlanetPositions(julianDay, lat, lon): Promise<PlanetPosition[]>
calculateHouses(julianDay, lat, lon, system): Promise<HouseCusp[]>
calculateDistribution(planets): ChartDistribution
```

**Detalles técnicos:**
- Usa `EphemerisWrapper` para interactuar con Swiss Ephemeris
- Calcula Julian Day desde fecha/hora
- Sistema de casas: Placidus (configurable)
- Precisión: minutos de arco
- Rango soportado: 1800-2400

### 3. ChartInterpretationService

**Responsabilidad:** Genera interpretaciones textuales desde BD.

**Métodos principales:**
```typescript
generateInterpretation(chart, plan): Promise<InterpretationDto>
getBigThree(chart): Promise<BigThreeDto>
getFullInterpretations(chart): Promise<FullInterpretationDto>
```

**Estructura de interpretaciones:**
- **PLANET_INTRO:** Introducción del planeta (10 textos)
- **ASCENDANT:** Ascendente en signo (12 textos)
- **PLANET_IN_SIGN:** Planeta en signo (120 textos = 10 × 12)
- **PLANET_IN_HOUSE:** Planeta en casa (120 textos = 10 × 12)
- **ASPECT:** Aspectos entre planetas (~225 textos = ~45 pares × 5 tipos)

**Total:** ~490 interpretaciones precargadas en BD.

### 4. ChartAISynthesisService

**Responsabilidad:** Genera síntesis personalizada con IA (solo Premium).

**Métodos principales:**
```typescript
generateSynthesis(chart, userId): Promise<AISynthesisDto>
constructPrompt(chart): string
validateResponse(response): boolean
```

**Flujo interno:**
1. Construye prompt estructurado con datos de la carta
2. Llama a `AIProviderService.generateCompletion()`
3. Provider principal: Groq (Llama 3.1 70B)
4. Fallback: OpenAI GPT-4 → DeepSeek
5. Valida respuesta (3-5 párrafos, personalizada)
6. Cachea resultado (7 días)

**Ejemplo de prompt:**
```
Eres un astrólogo experto. Genera una síntesis personalizada para esta carta astral:

Sol en Tauro (Casa 9)
Luna en Escorpio (Casa 3)
Ascendente en Virgo

Aspectos principales:
- Sol trígono Júpiter
- Luna oposición Marte
- Venus conjunción Mercurio

Genera una síntesis de 3-5 párrafos que conecte estos elementos...
```

### 5. ChartCacheService

**Responsabilidad:** Gestión de caché multinivel con Redis.

**Estrategia de caché:**
```typescript
// Cálculos astronómicos (24h)
birth-chart:calc:{birthDate}:{birthTime}:{lat}:{lon}

// Síntesis IA (7 días)
birth-chart:ai-synthesis:{chartHash}

// Interpretaciones (30 días)
birth-chart:interpretations:{category}:{key}

// Geocoding (90 días)
geocode:{query}
```

**Métodos principales:**
```typescript
get(key): Promise<T | null>
set(key, value, ttl): Promise<void>
invalidate(key): Promise<void>
```

### 6. ChartPdfService

**Responsabilidad:** Genera PDF profesional con todas las interpretaciones.

**Estructura del PDF:**
1. **Portada:** Datos de nacimiento, Big Three
2. **Gráfico:** Rueda zodiacal SVG con planetas, casas y aspectos
3. **Tablas:** Posiciones planetarias, casas, aspectos
4. **Interpretaciones:** Big Three (todos los planes) + Completas (Free/Premium)
5. **Síntesis IA:** Solo Premium (si existe)
6. **Disclaimer:** Texto legal al final

**Tamaño aproximado:** 10-20 páginas según plan.

### 7. EphemerisWrapper

**Responsabilidad:** Wrapper sobre Swiss Ephemeris (librería nativa).

**Métodos principales:**
```typescript
calculateJulianDay(date, time, timezone): number
getPlanetPosition(julianDay, planet): {lon, lat, speed}
getHouseCusps(julianDay, lat, lon, system): number[]
```

**Configuración:**
- Path de efemérides: `SWEPH_PATH` env var
- Archivos requeridos: `sepl_18.se1`, `semo_18.se1`, etc.
- Descarga: https://www.astro.com/ftp/swisseph/

### 8. GeocodeService

**Responsabilidad:** Búsqueda y geocoding de lugares con Nominatim.

**Métodos principales:**
```typescript
searchPlaces(query): Promise<GeocodeSearchResponseDto>
getCoordinates(placeId): Promise<{lat, lon, timezone}>
```

**Integración:**
- API: Nominatim (OpenStreetMap)
- Caché agresivo (90 días)
- Rate limiting: 1 req/s
- Fallback: Entrada manual de coordenadas

## Dependencias Externas

### Swiss Ephemeris (Crítico)

```typescript
// Instalación
npm install sweph

// Configuración
SWEPH_PATH=/usr/share/sweph

// Uso
const wrapper = new EphemerisWrapper(configService);
const planets = await wrapper.calculatePlanetPositions(julianDay, lat, lon);
```

**Archivos requeridos:**
- `sepl_18.se1` (planetas)
- `semo_18.se1` (Luna)
- `seas_18.se1` (asteroides)

### Nominatim API (Opcional)

```typescript
// Configuración
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_EMAIL=your@email.com  // Requerido por TOS

// Uso
const geocodeService = new GeocodeService(httpService, geocodeCacheService);
const results = await geocodeService.searchPlaces('Buenos Aires');
```

**Límites:**
- 1 request/segundo
- User-Agent obligatorio
- Email de contacto requerido

### Groq API (Opcional - Solo Premium)

```typescript
// Configuración
GROQ_API_KEY=your_api_key

// Uso a través de AIProviderService
const aiService = new ChartAISynthesisService(aiProviderService, cacheService);
const synthesis = await aiService.generateSynthesis(chart, userId);
```

**Límites:**
- Llama 3.1 70B (30 tokens/s)
- Máx 8000 tokens/request
- Rate limit: 30 req/min

### Redis (Opcional)

```typescript
// Configuración
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional

// Uso
const cacheService = new ChartCacheService(redisService);
await cacheService.set('key', value, 86400); // 24h TTL
```

**Fallback:** Si Redis no está disponible, la app funciona sin caché (degradación graceful).

## Consideraciones de Performance

### Optimizaciones Implementadas

1. **Caché multinivel:**
   - L1: Cálculos astronómicos (24h)
   - L2: Interpretaciones (30 días)
   - L3: Síntesis IA (7 días)
   - L4: Geocoding (90 días)

2. **Batch queries:**
   - Interpretaciones cargadas en batch (1 query vs ~490)
   - Reducción de queries DB en 99%

3. **Lazy loading:**
   - Síntesis IA solo bajo demanda (acción manual)
   - PDF generado solo cuando se solicita

4. **Compresión:**
   - chartData almacenado como JSONB (comprimido)
   - Redis con compresión LZ4

### Benchmarks

| Operación                  | Sin caché | Con caché | Nota                    |
| -------------------------- | --------- | --------- | ----------------------- |
| Cálculo astronómico        | ~500ms    | ~20ms     | Swiss Ephemeris nativo  |
| Búsqueda interpretaciones  | ~200ms    | ~10ms     | Batch query optimizado  |
| Síntesis IA                | ~2500ms   | ~15ms     | Solo Premium, on-demand |
| Generación PDF             | ~800ms    | N/A       | Siempre fresh           |
| **Total (Free, sin caché)**| **~800ms**| **~50ms** |                         |
| **Total (Premium + IA)**   | **~3300ms**| **~2515ms**| IA no cacheada 1ra vez |

## Testing

### Estrategia de Testing

```
__tests__/
├── integration/
│   └── birth-chart-api.integration.spec.ts  # Flujo E2E completo
└── unit/
    ├── services/                             # Tests unitarios por servicio
    ├── controllers/                          # Tests de controllers
    └── repositories/                         # Tests de repositorios
```

### Cobertura

| Componente              | Cobertura | Tests |
| ----------------------- | --------- | ----- |
| ChartCalculationService | 95%       | 24    |
| ChartInterpretationService | 92%    | 18    |
| ChartAISynthesisService | 88%       | 12    |
| BirthChartFacadeService | 90%       | 16    |
| Controllers             | 100%      | 28    |
| Repositories            | 95%       | 10    |
| **Total**               | **92%**   | **108**|

### Ejemplo de Test

```typescript
describe('ChartCalculationService', () => {
  let service: ChartCalculationService;
  let ephemerisWrapper: EphemerisWrapper;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChartCalculationService,
        { provide: EphemerisWrapper, useValue: mockEphemerisWrapper },
      ],
    }).compile();

    service = module.get(ChartCalculationService);
    ephemerisWrapper = module.get(EphemerisWrapper);
  });

  it('should calculate planet positions correctly', async () => {
    const dto: GenerateChartDto = {
      birthDate: '1990-05-15',
      birthTime: '14:30',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
    };

    const result = await service.calculateChart(dto);

    expect(result.planets).toHaveLength(10);
    expect(result.houses).toHaveLength(12);
    expect(result.ascendant).toBeDefined();
  });
});
```

## Seguridad

### Validaciones Implementadas

1. **Input sanitization:**
   - DTOs con decoradores `class-validator`
   - Validación de fechas (rango 1800-2400)
   - Validación de coordenadas (lat: -90/90, lon: -180/180)

2. **Rate limiting:**
   - Throttling por IP: 10 req/min
   - Throttling por usuario: 100 req/hora

3. **Autenticación:**
   - JWT opcional (permite anónimos)
   - Fingerprint para tracking de anónimos
   - Guards para Premium-only features

4. **Autorización:**
   - Plan-based access control
   - Usage limits por plan
   - Historial solo accesible por owner

### Ejemplo de Validación

```typescript
export class GenerateChartDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  birthDate: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  birthTime: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  @IsTimeZone()
  timezone: string;
}
```

## Escalabilidad

### Estrategias para Escalar

1. **Horizontal scaling:**
   - Servicios stateless (caché en Redis centralizado)
   - Load balancer compatible

2. **Caching distribuido:**
   - Redis Cluster para alta disponibilidad
   - Caché warming para interpretaciones comunes

3. **Database optimization:**
   - Índices optimizados en interpretaciones
   - Particionamiento de BirthChart por userId

4. **Async processing:**
   - Síntesis IA procesada en background (futuro)
   - PDF generado en background con queue (futuro)

### Monitoreo

Métricas clave a trackear:

```typescript
// Prometheus metrics
birth_chart_calculations_total          // Total cartas generadas
birth_chart_calculation_duration_seconds // Latencia p50, p95, p99
birth_chart_cache_hit_ratio             // Efectividad del caché
birth_chart_ai_synthesis_errors_total   // Fallos de IA
birth_chart_pdf_generation_duration_seconds // Latencia PDF
```

## Referencias

- **Clean Architecture:** Robert C. Martin
- **Swiss Ephemeris:** https://www.astro.com/swisseph/
- **NestJS Best Practices:** https://docs.nestjs.com/
- **TypeORM:** https://typeorm.io/

---

**Última actualización:** 15 de febrero de 2026  
**Versión del módulo:** 1.0.0  
**Mantenedor:** Equipo Auguria
