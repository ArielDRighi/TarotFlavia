# Database Connection Pooling - Tarot Backend

## 📋 Resumen

Este documento describe la configuración de connection pooling optimizado para PostgreSQL en la aplicación Tarot, implementado para manejar carga concurrente eficientemente y prevenir problemas de timeout bajo tráfico alto.

**Implementado en:** TASK-043  
**Fecha:** Noviembre 2025  
**Tecnología:** TypeORM + node-postgres (pg)

---

## 🎯 Objetivos

1. ✅ **Optimizar concurrencia**: Manejar múltiples conexiones simultáneas eficientemente
2. ✅ **Prevenir timeouts**: Evitar errores de conexión bajo carga alta
3. ✅ **Monitoreo activo**: Métricas en tiempo real del estado del pool
4. ✅ **Auto-recuperación**: Retry automático con backoff exponencial
5. ✅ **Alertas proactivas**: Warnings cuando el pool se acerca a capacidad máxima

---

## ⚙️ Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```bash
# Database Connection Pooling Configuration
# Desarrollo: 10, Producción: 25-50 (ajustar según carga)
DB_POOL_SIZE=10

# Tiempo máximo de ejecución de query antes de loggear warning (ms)
DB_MAX_QUERY_TIME=5000

# Timeout para obtener conexión del pool (ms)
DB_CONNECTION_TIMEOUT=30000
```

### Valores por Defecto

Si no se especifican, el sistema usa:

| Variable                | Desarrollo | Producción | Rango Válido  |
| ----------------------- | ---------- | ---------- | ------------- |
| `DB_POOL_SIZE`          | 10         | 25         | 1-100         |
| `DB_MAX_QUERY_TIME`     | 5000ms     | 5000ms     | 1000-60000ms  |
| `DB_CONNECTION_TIMEOUT` | 30000ms    | 30000ms    | 5000-120000ms |

---

## 📊 Configuración del Pool

### Configuración Actual (typeorm.ts)

```typescript
extra: {
  // Tamaño del pool
  max: 10,              // Máximo de conexiones
  min: 3,               // Mínimo de conexiones (25% de max)

  // Timeouts
  connectionTimeoutMillis: 30000,  // 30 segundos
  idleTimeoutMillis: 30000,        // Cerrar conexiones idle después de 30s
  statement_timeout: 30000,        // Timeout para statements SQL
  query_timeout: 5000,             // Timeout para queries individuales

  // Retry
  connectionRetryAttempts: 3,      // 3 intentos de reconexión
  connectionRetryDelay: 1000,      // Delay inicial: 1s, luego backoff exponencial

  // Metadata
  application_name: 'tarot-app',   // Identificación en PostgreSQL
}
```

---

## 📈 Recomendaciones por Carga

### 🟢 Desarrollo Local (< 10 usuarios concurrentes)

```bash
DB_POOL_SIZE=10
DB_MAX_QUERY_TIME=5000
DB_CONNECTION_TIMEOUT=30000
```

**Justificación:**

- Pool pequeño para ahorrar recursos locales
- Suficiente para testing y desarrollo
- Fácil debugging con pocas conexiones

---

### 🟡 Staging / QA (10-50 usuarios concurrentes)

```bash
DB_POOL_SIZE=20
DB_MAX_QUERY_TIME=5000
DB_CONNECTION_TIMEOUT=30000
```

**Justificación:**

- Simula carga moderada de producción
- Permite testing de concurrencia
- Balance entre recursos y realismo

---

### 🔴 Producción Pequeña (50-200 usuarios concurrentes)

```bash
DB_POOL_SIZE=25
DB_MAX_QUERY_TIME=5000
DB_CONNECTION_TIMEOUT=30000
```

**Justificación:**

- Carga base para MVP en producción
- Suficiente para usuarios iniciales
- Buen balance costo/performance

---

### 🔴 Producción Media (200-500 usuarios concurrentes)

```bash
DB_POOL_SIZE=40
DB_MAX_QUERY_TIME=5000
DB_CONNECTION_TIMEOUT=30000
```

**Justificación:**

- Soporte para crecimiento moderado
- Maneja picos de tráfico sin degradación
- Recomendado para primeros meses post-lanzamiento

---

### ⚡ Producción Alta (500-1000+ usuarios concurrentes)

```bash
DB_POOL_SIZE=50
DB_MAX_QUERY_TIME=3000
DB_CONNECTION_TIMEOUT=20000
```

**Justificación:**

- Máximo rendimiento para tráfico alto
- Queries más rápidos (3s timeout)
- Conexiones más agresivas (20s timeout)
- **⚠️ Requiere:** PostgreSQL con `max_connections >= 100` configurado

---

## 🔍 Monitoreo

### Endpoint de Métricas

```bash
GET /health/database
```

**Respuesta ejemplo:**

```json
{
  "status": "up",
  "metrics": {
    "active": 5,
    "idle": 2,
    "waiting": 0,
    "max": 10,
    "min": 2,
    "total": 7,
    "utilizationPercent": 70,
    "timestamp": "2025-11-14T10:30:00.000Z"
  }
}
```

### Interpretación de Métricas

| Métrica              | Descripción                         | Valor Saludable     |
| -------------------- | ----------------------------------- | ------------------- |
| `active`             | Conexiones ejecutando queries       | < 80% de max        |
| `idle`               | Conexiones disponibles en el pool   | > 20% de total      |
| `waiting`            | Requests esperando conexión         | 0                   |
| `total`              | Total de conexiones (active + idle) | min <= total <= max |
| `utilizationPercent` | % de uso del pool                   | < 80%               |

### Alertas Automáticas

El sistema loggea warnings automáticamente cuando:

```
Pool utilization is high: 90% (9/10 connections)
Consider increasing DB_POOL_SIZE from 10 to 15 for better performance
```

**Trigger:** `utilizationPercent > 80%`

---

## 🚨 Troubleshooting

### Problema 1: "Connection Timeout"

**Síntomas:**

```
Error: Connection timeout
at Connection.connect (/node_modules/pg/lib/connection.js)
```

**Causas posibles:**

1. Pool size muy pequeño
2. Queries lentos bloqueando conexiones
3. Red lenta o PostgreSQL sobrecargado

**Solución:**

```bash
# 1. Aumentar pool size
DB_POOL_SIZE=25  # Era 10

# 2. Aumentar timeout (temporal)
DB_CONNECTION_TIMEOUT=60000  # 60 segundos

# 3. Revisar queries lentos
GET /health/database
# Si "active" es alto constantemente, optimizar queries
```

---

### Problema 2: "Too many connections" en PostgreSQL

**Síntomas:**

```
FATAL: remaining connection slots are reserved for non-replication superuser connections
```

**Causas:**

- `DB_POOL_SIZE` \* número de instancias > `max_connections` de PostgreSQL

**Solución:**

```sql
-- En PostgreSQL, aumentar max_connections
ALTER SYSTEM SET max_connections = 100;
SELECT pg_reload_conf();
```

O reducir pool size:

```bash
DB_POOL_SIZE=10  # Era 50
```

**Fórmula:**

```
max_connections (PostgreSQL) >= DB_POOL_SIZE * número_instancias + 10 (buffer)
```

Ejemplo:

- 3 instancias de backend
- `DB_POOL_SIZE=25`
- `max_connections` mínimo: 25 \* 3 + 10 = **85**

---

### Problema 3: Alta utilización constante (>80%)

**Síntomas:**

```json
{
  "utilizationPercent": 90,
  "warning": "High pool utilization..."
}
```

**Causas:**

1. Tráfico real alto (buena señal de crecimiento)
2. Queries lentos no liberando conexiones
3. Connection leaks (conexiones no cerradas)

**Diagnóstico:**

```bash
# 1. Revisar queries lentos en logs
grep "Query is slow" logs/app.log

# 2. Verificar queries activos en PostgreSQL
SELECT pid, query_start, state, query
FROM pg_stat_activity
WHERE application_name = 'tarot-app'
ORDER BY query_start;

# 3. Buscar conexiones idle hace tiempo
SELECT pid, state_change, state
FROM pg_stat_activity
WHERE application_name = 'tarot-app'
  AND state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes';
```

**Solución:**

```bash
# Opción A: Aumentar pool (si hay recursos)
DB_POOL_SIZE=40  # Era 25

# Opción B: Optimizar queries lentos
# Ver logs de "Query is slow" y optimizar con índices

# Opción C: Reducir idleTimeoutMillis (cerrar idle connections más rápido)
# Modificar en typeorm.ts:
idleTimeoutMillis: 10000,  # 10 segundos (era 30)
```

---

## 📚 Mejores Prácticas

### ✅ DO (Hacer)

1. **Monitorear regularmente** el endpoint `/health/database`
2. **Empezar conservador** (pool pequeño) y escalar según métricas
3. **Usar índices** en queries frecuentes para reducir tiempo de ejecución
4. **Configurar alertas** en producción para `utilizationPercent > 80%`
5. **Revisar logs** de queries lentos semanalmente
6. **Testear carga** antes de subir pool size en producción

### ❌ DON'T (No hacer)

1. ❌ **No aumentar pool indefinidamente** - hay límites de PostgreSQL
2. ❌ **No ignorar warnings** de alta utilización
3. ❌ **No olvidar `max_connections`** de PostgreSQL al escalar
4. ❌ **No usar pool size > 50** sin medir impacto
5. ❌ **No dejar queries sin timeout** - usar `statement_timeout`
6. ❌ **No hacer queries pesados en endpoints síncronos** - usar jobs/background tasks

---

## 🔧 Testing de Carga

### Herramientas Recomendadas

1. **Apache Bench** (simple)

```bash
ab -n 1000 -c 50 http://localhost:3000/health/database
```

2. **Artillery** (avanzado)

```bash
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/readings
```

3. **K6** (profesional)

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50, // 50 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:3000/api/readings');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

```bash
k6 run load-test.js
```

### Interpretación de Resultados

Monitorear durante el test:

```bash
# Terminal 1: Correr load test
k6 run load-test.js

# Terminal 2: Monitorear métricas
watch -n 1 'curl -s http://localhost:3000/health/database | jq'
```

**Indicadores de éxito:**

- ✅ `utilizationPercent` < 80% durante el test
- ✅ `waiting` = 0 (no hay requests en cola)
- ✅ Response time < 500ms
- ✅ Error rate < 1%

**Señales de problemas:**

- 🔴 `utilizationPercent` > 90%
- 🔴 `waiting` > 0 (requests esperando conexión)
- 🔴 Response time > 2000ms
- 🔴 Error rate > 5%

**Acción:** Si aparecen señales de problemas, aumentar `DB_POOL_SIZE` en incrementos de 5-10 hasta que las métricas mejoren.

---

## 📖 Referencias

### TypeORM

- [Connection Options](https://typeorm.io/data-source-options)
- [Connection Pooling](https://github.com/typeorm/typeorm/blob/master/docs/connection-options.md#postgres--cockroachdb-connection-options)

### node-postgres (pg)

- [Connection Pooling](https://node-postgres.com/features/pooling)
- [Pool Configuration](https://node-postgres.com/api/pool)

### PostgreSQL

- [max_connections](https://www.postgresql.org/docs/current/runtime-config-connection.html#GUC-MAX-CONNECTIONS)
- [Connection Management](https://wiki.postgresql.org/wiki/Number_Of_Database_Connections)

---

## 🎓 Conceptos Clave

### ¿Qué es Connection Pooling?

En lugar de abrir/cerrar una conexión para cada request (lento), el pool mantiene conexiones abiertas y reutilizables:

```
Request 1 → Pool → Conexión A (idle) → PostgreSQL
Request 2 → Pool → Conexión B (idle) → PostgreSQL
Request 3 → Pool → Conexión A (reused) → PostgreSQL
```

**Beneficios:**

- ⚡ **Más rápido:** No overhead de conexión/desconexión
- 🎯 **Eficiente:** Reutiliza conexiones existentes
- 🛡️ **Controlado:** Limita conexiones totales a PostgreSQL

### ¿Por qué Retry con Backoff Exponencial?

Cuando una conexión falla, reintenta con delays crecientes:

```
Intento 1: Falla → Espera 1s
Intento 2: Falla → Espera 2s (2^1)
Intento 3: Falla → Espera 4s (2^2)
Error final
```

**Ventajas:**

- 🔄 **Auto-recuperación:** Se recupera de fallos transitorios
- ⏱️ **No agresivo:** No sobrecarga DB con reintentos inmediatos
- 📊 **Balanceado:** Da tiempo a que PostgreSQL se recupere

---

## 🚀 Roadmap Futuro

### Fase 2 (Post-MVP)

- [ ] Integrar con APM (Datadog, New Relic)
- [ ] Dashboard Grafana con métricas en tiempo real
- [ ] Auto-scaling de pool basado en load
- [ ] Alertas automáticas vía email/Slack

### Fase 3 (Escala Enterprise)

- [ ] Read replicas para queries pesados
- [ ] Sharding por tarotista_id
- [ ] PgBouncer para pool externo
- [ ] Connection pooling por región geográfica

---

## 📞 Soporte

**Problemas de performance?**

1. Revisar métricas en `/health/database`
2. Consultar sección "Troubleshooting"
3. Crear issue en GitHub con:
   - Métricas actuales
   - Configuración de pool
   - Logs relevantes

**Contacto:** Ver `CONTRIBUTING.md`

---

**Última actualización:** Noviembre 2025  
**Autor:** TASK-043  
**Versión:** 1.0.0
