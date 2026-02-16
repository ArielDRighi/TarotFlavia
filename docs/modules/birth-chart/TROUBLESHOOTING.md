# Troubleshooting - Módulo Birth Chart

> **Actualizado:** Febrero 2026  
> **Versión del Módulo:** 1.0.0

Esta guía contiene soluciones a problemas comunes al trabajar con el módulo Birth Chart de Auguria.

---

## 📑 Índice

1. [Problemas de Swiss Ephemeris](#problemas-de-swiss-ephemeris)
2. [Errores de Cálculo de Carta](#errores-de-cálculo-de-carta)
3. [Problemas de Geocoding](#problemas-de-geocoding)
4. [Errores de Síntesis IA](#errores-de-síntesis-ia)
5. [Problemas de Límites de Uso](#problemas-de-límites-de-uso)
6. [Errores de Generación de PDF](#errores-de-generación-de-pdf)
7. [Problemas de Caché](#problemas-de-caché)
8. [Performance Issues](#performance-issues)
9. [Errores de Base de Datos](#errores-de-base-de-datos)
10. [Testing Issues](#testing-issues)

---

## 1. Problemas de Swiss Ephemeris

### ❌ Error: "Swiss Ephemeris data files not found"

**Síntomas:**
```
Error: Swiss Ephemeris data files not found at /usr/share/ephe
ChartCalculationService: Failed to calculate planetary positions
```

**Causa:** Los archivos de efemérides de Swiss Ephemeris no están instalados o no se encuentran en la ruta esperada.

**Solución:**

```bash
# Linux/Mac
sudo mkdir -p /usr/share/ephe
cd /usr/share/ephe
sudo wget ftp://ftp.astro.com/pub/swisseph/ephe/*.se1

# O usar script automatizado
cd backend/tarot-app
sudo node scripts/install-ephemeris.js

# Verificar instalación
ls -lh /usr/share/ephe/*.se1
```

**Docker:**
```dockerfile
# Asegurar en Dockerfile que los archivos se copian
COPY --from=ephemeris-installer /usr/share/ephe /usr/share/ephe
RUN chmod -R 644 /usr/share/ephe/*.se1
```

**Windows:**
```powershell
# Crear directorio
mkdir C:\sweph\ephe
# Descargar archivos manualmente desde ftp://ftp.astro.com/pub/swisseph/ephe/
# Configurar variable de entorno
setx SE_EPHE_PATH "C:\sweph\ephe"
```

---

### ❌ Error: "Cannot load swisseph native bindings"

**Síntomas:**
```
Error: Cannot find module 'swisseph/build/Release/swisseph.node'
```

**Causa:** El módulo nativo `swisseph` no se compiló correctamente.

**Solución:**

```bash
# Reinstalar swisseph con rebuild
cd backend/tarot-app
npm rebuild swisseph

# Si falla, instalar dependencias de compilación
# Ubuntu/Debian
sudo apt-get install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3

# Mac
xcode-select --install

# Reinstalar después
npm install swisseph --build-from-source
```

**Docker (Alpine):**
```dockerfile
# Usar imagen con compilador
FROM node:20-alpine
RUN apk add --no-cache python3 make g++
```

---

### ⚠️ Warning: "Using low precision ephemeris files"

**Síntomas:** Logs muestran advertencias sobre precisión baja.

**Causa:** Solo se instalaron archivos `.se1` (precisión estándar), no `.eph` (alta precisión).

**Impacto:** Para la mayoría de usuarios, los archivos `.se1` son suficientes (precisión ~0.1°). Solo usuarios avanzados necesitan `.eph`.

**Solución (opcional):**
```bash
# Descargar archivos de alta precisión (warning: ~200MB+)
cd /usr/share/ephe
sudo wget ftp://ftp.astro.com/pub/swisseph/ephe/planets/*.eph
```

---

## 2. Errores de Cálculo de Carta

### ❌ Error: "Invalid date provided"

**Síntomas:**
```json
{
  "statusCode": 400,
  "message": "La fecha proporcionada no es válida",
  "error": "Bad Request"
}
```

**Causa:** La fecha enviada no es válida o está fuera del rango soportado (1800-2300).

**Solución:**
```typescript
// ✅ Formato correcto
{
  "birthDate": "1990-05-15T14:30:00.000Z",  // ISO 8601
  "timezone": "America/Mexico_City"
}

// ❌ INCORRECTO
{
  "birthDate": "15/05/1990",  // Formato no soportado
  "birthDate": "1500-01-01",  // Fuera de rango
}
```

**Validación del lado del cliente:**
```typescript
// Frontend validation
const MIN_YEAR = 1800;
const MAX_YEAR = 2300;

function validateBirthDate(date: Date): boolean {
  const year = date.getFullYear();
  return year >= MIN_YEAR && year <= MAX_YEAR;
}
```

---

### ❌ Error: "Invalid timezone"

**Síntomas:**
```json
{
  "statusCode": 400,
  "message": "La zona horaria 'US/Pacific' no es válida"
}
```

**Causa:** El timezone no sigue el formato IANA (tz database).

**Solución:**
```typescript
// ✅ CORRECTO - Formato IANA
"America/Los_Angeles"
"Europe/Madrid"
"Asia/Tokyo"
"America/Mexico_City"

// ❌ INCORRECTO
"US/Pacific"  // Deprecado
"PST"         // Abreviación
"GMT-8"       // Offset manual
"UTC-05:00"   // ISO offset
```

**Lista completa:** https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

---

### ❌ Error: "Planetary positions calculation failed"

**Síntomas:**
```
ChartCalculationService: Error calculating positions for planet PLUTO
```

**Causa:** Archivo de efemérides para ese planeta/período no está disponible.

**Solución:**
1. Verificar que los archivos `.se1` están completos
2. Verificar permisos de lectura (`chmod 644 /usr/share/ephe/*.se1`)
3. Para fechas extremas (antes 1800 o después 2300), informar al usuario que no está soportado

---

## 3. Problemas de Geocoding

### ❌ Error: "Location geocoding failed"

**Síntomas:**
```json
{
  "statusCode": 500,
  "message": "No se pudo obtener las coordenadas para la ubicación proporcionada"
}
```

**Causa 1:** El servicio Nominatim (OpenStreetMap) está caído o bloqueando requests.

**Solución:**
```bash
# Verificar conectividad
curl "https://nominatim.openstreetmap.org/search?q=Madrid&format=json"

# Si falla, configurar instancia propia de Nominatim (recomendado para producción)
docker run -d \
  -p 8080:8080 \
  --name nominatim \
  mediagis/nominatim:4.2
  
# Actualizar .env
NOMINATIM_API_URL=http://localhost:8080/search
```

**Causa 2:** Rate limiting de Nominatim (1 request/segundo para uso público).

**Solución:**
```typescript
// Backend ya implementa retry con backoff exponencial
// Si el problema persiste, implementar cola de requests

// En producción, usar instancia dedicada o servicio pago:
// - Mapbox Geocoding API
// - Google Maps Geocoding API
// - LocationIQ
```

---

### ⚠️ Warning: "Geocoding cache miss"

**Síntomas:** Logs muestran muchos "cache miss" para geocoding.

**Causa:** La ubicación no está en caché de Redis.

**Impacto:** Primera request para una ubicación puede tardar 1-2 segundos extra.

**Solución (precarga de caché):**
```bash
# Script para precargar ciudades comunes
cd backend/tarot-app
node scripts/precache-locations.js

# O manualmente via Redis
redis-cli SET "geocode:Madrid,Spain" '{"lat":40.4168,"lon":-3.7038,"display_name":"Madrid, Spain"}'
redis-cli EXPIRE "geocode:Madrid,Spain" 2592000  # 30 días
```

---

## 4. Errores de Síntesis IA

### ❌ Error: "AI synthesis failed - quota exceeded"

**Síntomas:**
```json
{
  "statusCode": 429,
  "message": "Has alcanzado tu límite diario de síntesis IA (2/día)"
}
```

**Causa:** Usuario Premium excedió su límite de 2 síntesis IA por día (UTC).

**Solución:**

**Para el usuario:**
- Esperar hasta la medianoche UTC para que se reinicie el contador
- Generar cartas sin síntesis IA (Free tier)

**Para administradores (ajustar límites):**
```typescript
// backend/tarot-app/src/modules/birth-chart/domain/enums/birth-chart-limits.ts
export const BirthChartLimits = {
  PREMIUM: {
    aiSynthesisPerDay: 5,  // Cambiar de 2 a 5
  },
};
```

**Verificar límites:**
```bash
# Redis
redis-cli GET "birth-chart:ai-synthesis:user:123:2026-02-16"
# Retorna "2" si ya usó 2 síntesis hoy
```

---

### ❌ Error: "Groq API error: Rate limit exceeded"

**Síntomas:**
```
ChartAISynthesisService: Groq API returned 429
Error: Rate limit exceeded for model mixtral-8x7b-32768
```

**Causa:** El API key de Groq alcanzó su límite de requests por minuto (RPM).

**Solución:**

**Corto plazo:**
```typescript
// El servicio ya implementa retry con backoff exponencial (max 3 intentos)
// Si falla después de 3 reintentos, retornar error al usuario

// Verificar en dashboard de Groq: https://console.groq.com/usage
```

**Largo plazo (producción):**
```bash
# 1. Upgrade plan de Groq para mayor RPM
# 2. Implementar cola de requests con Bull
npm install bull @nestjs/bull

# 3. Configurar worker para procesar síntesis de forma asíncrona
# backend/tarot-app/src/modules/birth-chart/infrastructure/queues/ai-synthesis.queue.ts
```

---

### ❌ Error: "AI synthesis timeout"

**Síntomas:**
```
ChartAISynthesisService: Timeout after 30000ms
```

**Causa:** La API de Groq tardó más de 30 segundos en responder.

**Solución:**

**Verificar latencia de Groq:**
```bash
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mixtral-8x7b-32768","messages":[{"role":"user","content":"test"}]}' \
  -w "\nTime: %{time_total}s\n"
```

**Ajustar timeout si necesario:**
```typescript
// backend/tarot-app/src/modules/birth-chart/application/services/chart-ai-synthesis.service.ts
const GROQ_TIMEOUT_MS = 60000; // Aumentar de 30s a 60s
```

---

### ⚠️ "AI synthesis fallback to cached interpretation"

**Síntomas:** Usuario Premium recibe interpretaciones genéricas en lugar de síntesis IA.

**Causa:** La síntesis IA falló (error de Groq, timeout, etc.) y el sistema hizo fallback a interpretaciones precargadas.

**Impacto:** Usuario sigue recibiendo una respuesta útil, pero no personalizada.

**Solución:**
```typescript
// Monitorear logs para ver tasa de fallback
// Si >10% de síntesis fallan, investigar:
// 1. Estabilidad de Groq API
// 2. Timeouts
// 3. Formato de prompts (si Groq rechaza por contenido)
```

---

## 5. Problemas de Límites de Uso

### ❌ Error: "Anonymous user exceeded chart generation limit"

**Síntomas:**
```json
{
  "statusCode": 403,
  "message": "Has alcanzado el límite de generación para usuarios anónimos (1 lifetime)"
}
```

**Causa:** Usuario sin cuenta generó su carta única permitida.

**Solución:**

**Para el usuario:**
- Crear cuenta Free (sin límite de generaciones)
- El frontend debe mostrar CTA para registro

**Tracking de límite:**
```typescript
// Backend usa IP + User-Agent para rastrear anónimos
const anonKey = `birth-chart:anon:${ip}:${userAgent}`;
// Redis: SET birth-chart:anon:192.168.1.1:Mozilla... "1" EX 31536000 (1 año)
```

**Limpiar caché de anónimos (admin):**
```bash
# Redis - eliminar todas las claves de anónimos
redis-cli KEYS "birth-chart:anon:*" | xargs redis-cli DEL
```

---

### ❌ Error: "Chart history not available for anonymous users"

**Síntomas:**
```json
{
  "statusCode": 403,
  "message": "El historial de cartas no está disponible para usuarios anónimos"
}
```

**Causa:** Usuario sin cuenta intentó acceder al endpoint `/api/birth-chart/history`.

**Solución:**
- Solo usuarios autenticados (Free/Premium) pueden ver historial
- Frontend debe ocultar sección de historial para anónimos
- Mostrar CTA para registro

---

### ❌ Error: "Feature only available for Premium users"

**Síntomas:**
```json
{
  "statusCode": 403,
  "message": "Esta funcionalidad solo está disponible para usuarios Premium"
}
```

**Causa:** Usuario Free/Anonymous solicitó síntesis IA en el parámetro `includeAISynthesis=true`.

**Solución:**

**Frontend:**
```typescript
// Validar plan antes de request
if (user.plan !== 'PREMIUM' && includeAISynthesis) {
  // Mostrar modal de upgrade
  showUpgradeModal();
  return;
}
```

**Backend:**
```typescript
// Guard ya implementado: PremiumFeatureGuard
@UseGuards(JwtAuthGuard, PremiumFeatureGuard)
@Get('/:id/ai-synthesis')
```

---

## 6. Errores de Generación de PDF

### ❌ Error: "PDF generation failed"

**Síntomas:**
```json
{
  "statusCode": 500,
  "message": "Error al generar el PDF de la carta astral"
}
```

**Causa 1:** Dependencias de Puppeteer no instaladas.

**Solución (Linux):**
```bash
# Ubuntu/Debian
sudo apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils

# CentOS/RHEL
sudo yum install -y chromium liberation-fonts
```

**Docker:**
```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

---

**Causa 2:** Timeout al renderizar PDF (cartas con mucho contenido).

**Solución:**
```typescript
// backend/tarot-app/src/modules/birth-chart/application/services/chart-pdf.service.ts
const PDF_TIMEOUT_MS = 60000; // Aumentar de 30s a 60s

await page.goto(url, { 
  waitUntil: 'networkidle0',
  timeout: PDF_TIMEOUT_MS 
});
```

---

### ⚠️ "PDF generation slow (>10s)"

**Síntomas:** Logs muestran que generar PDFs tarda más de 10 segundos.

**Causa:** Puppeteer lanza nueva instancia de Chromium por cada request.

**Solución (pool de instancias):**
```typescript
// Implementar pool de browsers de Puppeteer
import genericPool from 'generic-pool';

const browserPool = genericPool.createPool({
  create: () => puppeteer.launch({ headless: true }),
  destroy: (browser) => browser.close(),
}, { min: 2, max: 10 });

// Usar del pool
const browser = await browserPool.acquire();
// ... generar PDF
await browserPool.release(browser);
```

---

## 7. Problemas de Caché

### ⚠️ "High cache miss rate"

**Síntomas:** Logs muestran `cache:miss` frecuente, performance degradado.

**Causa:** Caché de Redis no está funcionando o se expiran claves muy rápido.

**Diagnóstico:**
```bash
# Verificar Redis
redis-cli PING
# Debe retornar "PONG"

# Ver estadísticas de caché
redis-cli INFO stats | grep keyspace

# Ver claves actuales
redis-cli KEYS "birth-chart:*"
```

**Solución:**
```bash
# Si Redis no responde
sudo systemctl restart redis

# Verificar conexión desde backend
cd backend/tarot-app
npm run test -- src/modules/birth-chart/infrastructure/cache/chart-cache.service.spec.ts
```

---

### ❌ "Redis connection refused"

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
ChartCacheService: Failed to connect to Redis
```

**Causa:** Redis no está corriendo o configuración incorrecta.

**Solución:**
```bash
# Verificar si Redis está corriendo
sudo systemctl status redis

# Iniciar si está detenido
sudo systemctl start redis

# Verificar variables de entorno
echo $REDIS_HOST  # Debe ser "localhost" o IP correcta
echo $REDIS_PORT  # Debe ser 6379 (default)

# Probar conexión manual
redis-cli -h $REDIS_HOST -p $REDIS_PORT PING
```

**Docker Compose:**
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
```

---

### 🧹 "Manual cache cleanup"

**Escenario:** Necesitas limpiar caché manualmente (por ejemplo, después de actualizar interpretaciones).

**Solución:**
```bash
# Limpiar solo caché de interpretaciones
redis-cli KEYS "birth-chart:interpretation:*" | xargs redis-cli DEL

# Limpiar solo caché de síntesis IA
redis-cli KEYS "birth-chart:ai-synthesis:*" | xargs redis-cli DEL

# Limpiar todo el caché de birth-chart (⚠️ usar con precaución)
redis-cli KEYS "birth-chart:*" | xargs redis-cli DEL

# Verificar
redis-cli DBSIZE
```

---

## 8. Performance Issues

### 🐌 "Chart generation taking >5 seconds"

**Síntomas:** Generación de cartas es lenta, usuarios reportan timeouts.

**Diagnóstico:**
```bash
# Backend logs con timing
cd backend/tarot-app
npm run start:dev

# Buscar en logs:
# "ChartCalculationService: Calculated chart in XXXms"
# "ChartInterpretationService: Loaded interpretations in XXXms"
# "ChartAISynthesisService: Generated synthesis in XXXms"
```

**Causas comunes:**

1. **Caché no funcionando** → Ver sección anterior
2. **Geocoding lento** → Usar caché o instancia propia de Nominatim
3. **Síntesis IA lenta (Groq)** → Normal (~3-5s), considerar procesamiento asíncrono
4. **Swiss Ephemeris IO** → Asegurar que archivos `.se1` están en SSD

**Solución (procesamiento asíncrono para Premium):**
```typescript
// Implementar generación en background para síntesis IA
@Post('/')
async create(@Body() dto: CreateBirthChartDto) {
  if (dto.includeAISynthesis) {
    // Retornar respuesta inmediata con status "processing"
    const job = await this.queue.add('ai-synthesis', { chartId });
    return { status: 'processing', jobId: job.id };
  }
  // Generación síncrona para Free (sin IA)
  return this.facade.generateChart(dto);
}
```

---

### 📊 "High memory usage"

**Síntomas:** Backend consume mucha memoria (>1GB), OOM en producción.

**Causa:** Swiss Ephemeris carga archivos en memoria, Puppeteer usa ~100-200MB por instancia.

**Solución:**
```bash
# Monitorear memoria
pm2 monit

# Limitar memoria de Node.js
node --max-old-space-size=2048 dist/main.js

# Docker
docker run -m 2g auguria-backend  # Limitar a 2GB
```

**Optimizaciones:**
```typescript
// 1. Implementar pool de browsers de Puppeteer (max 5 instancias)
// 2. Liberar memoria después de cálculos pesados
global.gc?.();  // Requiere --expose-gc flag
```

---

### 🚀 "Scaling horizontally"

**Escenario:** Un servidor no es suficiente, necesitas múltiples instancias.

**Consideraciones:**

1. **Sesiones de usuario:** Usar JWT stateless (ya implementado ✅)
2. **Caché compartido:** Redis centralizado (ya implementado ✅)
3. **Rate limiting:** Usar Redis para contador compartido (ya implementado ✅)
4. **File storage (PDFs):** Usar S3/MinIO en lugar de filesystem local

**Arquitectura recomendada:**
```
                    Load Balancer (Nginx)
                            |
        ┌───────────────────┼───────────────────┐
        |                   |                   |
    Backend 1           Backend 2           Backend 3
        |                   |                   |
        └───────────────────┴───────────────────┘
                            |
        ┌───────────────────┴───────────────────┐
        |                   |                   |
    Redis (cache)   PostgreSQL (data)      S3 (PDFs)
```

---

## 9. Errores de Base de Datos

### ❌ "Cannot save chart to database"

**Síntomas:**
```
TypeORM QueryFailedError: duplicate key value violates unique constraint
```

**Causa:** Intento de guardar carta duplicada (misma fecha/lugar/usuario).

**Solución:**
```typescript
// Backend ya maneja duplicados con UPSERT
// Si el error persiste, verificar índices únicos:

// PostgreSQL
SELECT * FROM pg_indexes WHERE tablename = 'birth_charts';

// Debería existir:
// UNIQUE INDEX idx_unique_birth_chart ON birth_charts(user_id, birth_date, latitude, longitude)
```

---

### ❌ "Database connection timeout"

**Síntomas:**
```
Error: Connection timeout to PostgreSQL
Cannot execute query: no connection available
```

**Causa:** Pool de conexiones agotado o DB no responde.

**Solución:**
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Verificar conexiones activas
psql -U postgres -d auguria -c "SELECT count(*) FROM pg_stat_activity;"

# Aumentar pool size si necesario
# backend/tarot-app/src/database/database.module.ts
TypeOrmModule.forRoot({
  poolSize: 20,  // Aumentar de 10 a 20
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
  },
})
```

---

### 🗑️ "Cleanup old anonymous charts"

**Escenario:** Base de datos crece mucho con cartas de usuarios anónimos.

**Solución (job de limpieza):**
```sql
-- Eliminar cartas anónimas de hace más de 30 días
DELETE FROM birth_charts
WHERE user_id IS NULL
  AND created_at < NOW() - INTERVAL '30 days';

-- O marcar como "expired" en lugar de eliminar
UPDATE birth_charts
SET is_active = false
WHERE user_id IS NULL
  AND created_at < NOW() - INTERVAL '30 days';
```

**Implementar como cron job:**
```typescript
// backend/tarot-app/src/modules/birth-chart/infrastructure/jobs/cleanup-old-charts.job.ts
@Cron('0 2 * * *')  // Cada día a las 2 AM
async cleanupOldAnonymousCharts() {
  await this.repository.delete({
    user: IsNull(),
    createdAt: LessThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  });
}
```

---

## 10. Testing Issues

### ❌ "Tests failing with Swiss Ephemeris errors"

**Síntomas:**
```
ChartCalculationService › should calculate planetary positions
Error: Swiss Ephemeris data files not found
```

**Causa:** Tests unitarios intentan usar Swiss Ephemeris real en lugar de mocks.

**Solución:**
```typescript
// ✅ CORRECTO - Mockear SwissEphemeris en tests unitarios
const mockSwisseph = {
  calc_ut: jest.fn().mockReturnValue({
    longitude: 45.123,
    latitude: 0.0,
  }),
  get_ayanamsa_ut: jest.fn().mockReturnValue(24.123),
};

beforeEach(() => {
  jest.mock('swisseph', () => mockSwisseph);
});
```

**Para tests de integración (requieren archivos reales):**
```bash
# Instalar ephemeris en CI/CD
# .github/workflows/test.yml
- name: Install Swiss Ephemeris
  run: |
    sudo mkdir -p /usr/share/ephe
    sudo wget -q ftp://ftp.astro.com/pub/swisseph/ephe/*.se1 -P /usr/share/ephe
```

---

### ❌ "E2E tests failing: 'Location geocoding failed'"

**Síntomas:**
```
BirthChartController (e2e) › POST /birth-chart
Error: Location geocoding failed
```

**Causa:** Tests E2E intentan hacer requests reales a Nominatim, que puede estar caído o rate-limiting.

**Solución:**
```typescript
// ✅ CORRECTO - Mockear servicio de geocoding en E2E
beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(GeocodeService)
    .useValue({
      geocode: jest.fn().mockResolvedValue({
        lat: 40.4168,
        lon: -3.7038,
        displayName: 'Madrid, Spain',
      }),
    })
    .compile();
});
```

---

### ⏱️ "Tests timing out"

**Síntomas:**
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Causa:** Tests que involucran IA o PDF generation toman más de 5 segundos.

**Solución:**
```typescript
// Aumentar timeout para tests específicos
describe('ChartAISynthesisService', () => {
  it('should generate AI synthesis', async () => {
    // ...
  }, 30000);  // 30 segundos timeout
});

// O globalmente en jest.config.js
module.exports = {
  testTimeout: 10000,  // 10 segundos default
};
```

---

### 📊 "Low test coverage"

**Síntomas:**
```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
All files |   65.2  |   58.3   |   70.1  |   64.8
```

**Causa:** Faltan tests para casos edge o servicios complejos.

**Solución:**
```bash
# Ver archivo con menor coverage
npm run test:cov

# Enfocarse en archivos críticos:
# 1. chart-calculation.service.ts (cálculos astronómicos)
# 2. chart-interpretation.service.ts (interpretaciones)
# 3. birth-chart-orchestrator.service.ts (orquestación)

# Escribir tests para:
# - Casos edge (fechas límite, coordenadas extremas)
# - Manejo de errores
# - Diferentes planes de usuario
# - Rate limiting
```

---

## 🆘 Cuando Todo Falla

Si después de seguir esta guía el problema persiste:

### 1. **Verificar logs completos**
```bash
# Backend
cd backend/tarot-app
npm run start:dev | tee -a debug.log

# Logs de sistema
sudo journalctl -u auguria-backend -f
```

### 2. **Verificar estado de servicios**
```bash
# PostgreSQL
sudo systemctl status postgresql
psql -U postgres -d auguria -c "SELECT version();"

# Redis
sudo systemctl status redis
redis-cli PING

# Nginx (si aplica)
sudo systemctl status nginx
sudo nginx -t
```

### 3. **Modo debug**
```bash
# Backend con logs verbose
cd backend/tarot-app
LOG_LEVEL=debug npm run start:dev

# O en .env
LOG_LEVEL=debug
```

### 4. **Health checks**
```bash
# Backend health
curl http://localhost:3000/health

# Debería retornar:
# {"status":"ok","info":{"database":{"status":"up"},"redis":{"status":"up"}}}
```

### 5. **Reportar issue**

Si nada funciona, recopilar la siguiente información antes de reportar:

```bash
# Información del sistema
cat > system-info.txt <<EOF
OS: $(uname -a)
Node: $(node --version)
NPM: $(npm --version)
PostgreSQL: $(psql --version)
Redis: $(redis-cli --version)
EOF

# Logs recientes (últimos 100 líneas)
tail -n 100 backend/tarot-app/logs/app.log > recent-logs.txt

# Variables de entorno (SIN secretos)
env | grep -E "^(NODE_ENV|DATABASE_|REDIS_|PORT)" > env-vars.txt

# Crear issue en GitHub con estos archivos
```

---

## 📞 Contacto y Soporte

- **Documentación:** `/docs/modules/birth-chart/`
- **GitHub Issues:** [Repositorio del proyecto]
- **Slack/Discord:** [Canal de soporte]

---

**Última actualización:** Febrero 2026  
**Mantenido por:** Equipo de Auguria
