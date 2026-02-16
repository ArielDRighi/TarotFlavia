# Módulo de Carta Astral

## Descripción

El módulo de Carta Astral permite a los usuarios generar su carta natal astrológica basada en sus datos de nacimiento (fecha, hora y lugar). Incluye cálculos astronómicos precisos usando Swiss Ephemeris, interpretaciones personalizadas basadas en ~490 textos preconfigurados, y síntesis con IA para usuarios Premium.

## Características

- 🌟 **Cálculo de posiciones planetarias** con Swiss Ephemeris (precisión de minutos de arco)
- 🏠 **Cálculo de casas astrológicas** usando sistema Placidus
- 📐 **Detección de aspectos** entre planetas (conjunción, oposición, cuadratura, trígono, sextil)
- 🔮 **Interpretaciones predefinidas** por planeta/signo/casa (~490 textos)
- 🤖 **Síntesis personalizada con IA** (solo Premium) - conexión de elementos de la carta
- 📄 **Generación de PDF** profesional con gráfico SVG y todas las interpretaciones
- 💾 **Historial de cartas guardadas** (solo Premium)
- 🌍 **Geocoding inteligente** con autocompletado de lugares
- ⚡ **Caché multinivel** para optimizar performance

## Planes y Límites

| Feature                    | Anónimo         | Free             | Premium                   |
| -------------------------- | --------------- | ---------------- | ------------------------- |
| Generación de carta        | ✅ (1 lifetime) | ✅ (ilimitado)   | ✅ (ilimitado)            |
| Big Three interpretado     | ✅              | ✅               | ✅                        |
| Interpretaciones completas | ❌              | ✅               | ✅                        |
| Descarga PDF               | ❌              | ✅               | ✅                        |
| Síntesis IA personalizada  | ❌              | ❌ (CTA Premium) | ✅ (2/día, acción manual) |
| Guardar en historial       | ❌              | ❌               | ✅                        |
| Ver historial              | ❌              | ❌               | ✅                        |

**Notas:**
- **Anónimo:** 1 generación lifetime total (tracking por fingerprint)
- **Free:** Generación ilimitada, interpretaciones completas, PDF
- **Premium:** Todo lo de Free + síntesis IA (2/día UTC) + historial persistente

## Inicio Rápido

### Backend

```bash
# Navegar al backend
cd backend/tarot-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y configurar:
# - DATABASE_URL (PostgreSQL)
# - SWEPH_PATH (ruta a archivos de efemérides)
# - GROQ_API_KEY (para síntesis IA)
# - NOMINATIM_EMAIL (para geocoding)

# Ejecutar migraciones
npm run migration:run

# Ejecutar seeders (interpretaciones estáticas)
npm run db:seed:interpretations

# Iniciar servidor de desarrollo
npm run start:dev
```

**API disponible en:** `http://localhost:3000/api/v1/birth-chart`

### Frontend

```bash
# Navegar al frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**App disponible en:** `http://localhost:3001`

## Endpoints Principales

| Método | Endpoint                      | Descripción                             | Auth           |
| ------ | ----------------------------- | --------------------------------------- | -------------- |
| POST   | `/birth-chart/generate`       | Genera carta astral                     | Opcional (JWT) |
| POST   | `/birth-chart/pdf`            | Descarga PDF de carta                   | JWT (Free+)    |
| GET    | `/birth-chart/geocode`        | Busca lugares para autocompletar        | Público        |
| GET    | `/birth-chart/usage`          | Consulta estado de límites de uso       | Opcional (JWT) |
| GET    | `/birth-chart/history`        | Obtiene historial de cartas (paginado)  | JWT (Premium)  |
| GET    | `/birth-chart/history/:id`    | Obtiene detalle de carta guardada       | JWT (Premium)  |
| DELETE | `/birth-chart/history/:id`    | Elimina carta del historial             | JWT (Premium)  |
| POST   | `/birth-chart/synthesis`      | Genera síntesis IA para carta existente | JWT (Premium)  |

Ver [API.md](./API.md) para documentación completa de endpoints con ejemplos.

## Arquitectura

El módulo sigue Clean Architecture con 3 capas principales:

```
src/modules/birth-chart/
├── domain/                 # Lógica de negocio pura
│   ├── enums/             # Enums (Planet, ZodiacSign, AspectType, etc.)
│   └── interfaces/        # Contratos de repositorios
├── application/           # Casos de uso, orquestación
│   ├── services/          # 12 servicios especializados
│   └── dto/               # Data Transfer Objects
├── infrastructure/        # Detalles técnicos
│   ├── controllers/       # 2 controladores REST
│   ├── repositories/      # Implementación TypeORM
│   ├── ephemeris/         # Wrapper de Swiss Ephemeris
│   ├── cache/             # Estrategia de caché Redis
│   └── seeders/           # Seeder de interpretaciones
└── entities/              # Entidades TypeORM (BirthChart, Interpretation)
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos de arquitectura y flujos.

## Servicios Clave

### ChartCalculationService
Orquesta el cálculo astronómico completo:
- Calcula posiciones planetarias (lon, lat, velocidad)
- Calcula cúspides de casas (sistema Placidus)
- Detecta aspectos entre planetas (con orbes configurables)
- Calcula distribución por elementos/modalidades/polaridad

### ChartInterpretationService
Genera interpretaciones textuales:
- Busca interpretaciones en BD (~490 textos)
- Estructura "Big Three" (Sol, Luna, Ascendente)
- Construye interpretaciones completas por planeta
- Maneja fallbacks para datos faltantes

### ChartAISynthesisService
Genera síntesis personalizada con IA:
- Construye prompt con datos estructurados de la carta
- Llama a AIProviderService (Groq Llama 3.1 70B)
- Valida y estructura respuesta
- Cachea síntesis por 7 días

### BirthChartFacadeService
Fachada principal que coordina todo el flujo:
- Verifica caché antes de calcular
- Coordina cálculo + interpretación + síntesis IA
- Guarda en BD (solo Premium)
- Retorna respuesta diferenciada por plan

### ChartPdfService
Genera PDF profesional:
- Incluye portada con datos de nacimiento
- Gráfico SVG de la rueda zodiacal
- Tablas de posiciones, casas y aspectos
- Interpretaciones completas formateadas
- Síntesis IA (solo Premium)

## Dependencias Externas

| Servicio       | Uso                         | Fallback/Requerido |
| -------------- | --------------------------- | ------------------ |
| Swiss Ephemeris| Cálculos astronómicos       | ❌ Crítico (required) |
| Nominatim      | Geocoding de lugares        | ✅ Entrada manual  |
| TimeZoneDB     | Detección de timezone       | ✅ Estimación por longitud |
| Groq API       | Síntesis IA (Premium)       | ✅ Texto genérico  |
| Redis          | Caché (opcional)            | ✅ Sin caché       |

## Consideraciones de Performance

- **Cálculos de efemérides:** Cacheados 24h (key: `birth-chart:calc:{birthDate}:{birthTime}:{lat}:{lon}`)
- **Síntesis IA:** Cacheada 7 días (key: `birth-chart:ai-synthesis:{chartHash}`)
- **Interpretaciones:** Cacheadas 30 días (key: `birth-chart:interpretations:{category}:{key}`)
- **Geocoding:** Cacheado agresivamente (key: `geocode:{query}`)
- **Batch queries:** Interpretaciones cargadas en batch para reducir queries a DB

**Tiempo promedio de generación:**
- Sin caché: 800-1200ms
- Con caché: 50-150ms
- Síntesis IA: +2000-3000ms (solo Premium, acción manual)

## Testing

```bash
# Unit tests (servicios individuales)
npm run test -- birth-chart

# Tests de integración (flujo completo)
npm run test:integration -- birth-chart

# Coverage
npm run test:cov
```

**Cobertura actual:**
- Unit tests: >90%
- Integration tests: 100% endpoints críticos

## Troubleshooting

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para problemas comunes y soluciones.

## Deployment

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guía de despliegue en producción.

## Roadmap

### Fase 2 (Futuro)
- [ ] Soporte para múltiples sistemas de casas (Koch, Equal, etc.)
- [ ] Cálculo de aspectos menores (semisextil, quincuncio, etc.)
- [ ] Tránsitos planetarios actuales
- [ ] Progresiones secundarias
- [ ] Revolución solar
- [ ] Sinastría (compatibilidad entre cartas)
- [ ] Export en formatos adicionales (JSON, CSV)

## Referencias

- **Swiss Ephemeris:** https://www.astro.com/swisseph/
- **Astrología tradicional:** Referencia primaria para interpretaciones
- **AI Provider (Groq):** https://groq.com/

---

**Última actualización:** 15 de febrero de 2026  
**Versión del módulo:** 1.0.0  
**Mantenedor:** Equipo Auguria
