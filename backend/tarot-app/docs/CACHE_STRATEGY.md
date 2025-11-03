# Caché de Interpretaciones - Estrategia y Plan de Migración

## Estado Actual: Caché In-Memory (MVP)

La implementación actual utiliza `@nestjs/cache-manager` con caché en memoria, que es suficiente para el MVP por las siguientes razones:

- ✅ **Simplicidad**: No requiere infraestructura adicional
- ✅ **Costo cero**: No hay costos de hosting para Redis
- ✅ **Rendimiento**: Muy rápido para una sola instancia
- ✅ **Configuración mínima**: Funciona out-of-the-box

### Estrategia Dual Actual

1. **Caché In-Memory** (TTL: 1 hora)

   - Datos estáticos: cartas, spreads, categorías
   - Interpretaciones frecuentes
   - Máximo 200 items

2. **Caché en Base de Datos** (TTL: 30 días)
   - Interpretaciones completas persistentes
   - Reutilización entre instancias (si se escala)
   - Análisis de uso (hit_count, last_used_at)

## Cuándo Migrar a Redis

### Indicadores para Considerar Redis:

#### 1. **Escalamiento Horizontal** ⚠️ CRÍTICO

- **Problema**: Con múltiples instancias del backend, cada una tiene su propio caché in-memory
- **Resultado**: Duplicación innecesaria de llamadas a OpenAI
- **Solución**: Redis como caché compartido entre instancias
- **Umbral**: Cuando tengas más de 1 instancia del backend

#### 2. **Consumo Excesivo de RAM** ⚠️ IMPORTANTE

- **Problema**: El caché in-memory consume memoria del proceso Node.js
- **Síntomas**:
  - RAM usage > 512MB para caché
  - OOM (Out of Memory) errors
  - Degradación de performance general
- **Solución**: Redis gestiona su propia memoria independientemente
- **Umbral**: Cuando el caché supere ~500MB

#### 3. **Tasa de Evicción Alta** 📊 MODERADO

- **Problema**: Con límite de 200 items, las interpretaciones se eliminan prematuramente
- **Síntomas**:
  - Cache hit rate < 40%
  - Interpretaciones populares siendo evictadas
- **Solución**: Redis permite mayor capacidad de caché
- **Umbral**: Hit rate < 40% sostenido

#### 4. **Persistencia de Caché entre Reinicios** 🔄 NICE-TO-HAVE

- **Problema**: Reiniciar el servidor elimina todo el caché in-memory
- **Impacto**: Primera hora post-reinicio tiene muchos cache misses
- **Solución**: Redis con persistencia RDB/AOF
- **Umbral**: Si los reinicios son frecuentes (CI/CD, scaling, etc.)

## Plan de Migración a Redis

### Fase 1: Preparación

```typescript
// 1. Instalar dependencias
npm install cache-manager-redis-store redis

// 2. Agregar variables de entorno
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password (opcional)
REDIS_TTL=3600 // 1 hora en segundos
```

### Fase 2: Configuración

```typescript
// app.module.ts
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.REDIS_TTL, 10),
      max: 1000, // Más capacidad con Redis
    }),
    // ... otros imports
  ],
})
export class AppModule {}
```

### Fase 3: Docker Compose (Desarrollo)

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

### Fase 4: Testing

1. **Probar conexión**:

```bash
redis-cli ping
# Debe responder: PONG
```

2. **Verificar keys**:

```bash
redis-cli keys "*"
```

3. **Monitorear en tiempo real**:

```bash
redis-cli monitor
```

### Fase 5: Producción

**Opciones de hosting:**

1. **AWS ElastiCache** (Recomendado para AWS)

   - Managed Redis
   - Backup automático
   - Alta disponibilidad
   - Costo: ~$15/mes (cache.t3.micro)

2. **Redis Cloud** (Multi-cloud)

   - Free tier: 30MB
   - Paid: desde $5/mes
   - Global replication

3. **DigitalOcean Managed Redis**

   - Desde $15/mes
   - Backups automáticos

4. **Self-hosted** (En tu VPS)
   - Costo: Solo el VPS
   - Requiere mantenimiento manual

## Estrategia de Invalidación de Caché

### 1. **Invalidación por Tiempo (TTL)**

Ya implementado:

- In-memory: 1 hora
- Database: 30 días

### 2. **Invalidación por Eventos** (Futuro)

```typescript
// Cuando se actualice significado de una carta
@Injectable()
export class CardsService {
  async updateCard(id: number, updateDto: UpdateCardDto) {
    await this.cardsRepository.update(id, updateDto);

    // Invalidar cachés que contengan esta carta
    await this.cacheService.invalidateCacheByCardId(id);
  }
}
```

### 3. **Invalidación Selectiva**

```typescript
// InterpretationCacheService
async invalidateCacheByCardId(cardId: string): Promise<void> {
  // Buscar todos los cachés que contengan esta carta
  const affectedCaches = await this.cacheRepository
    .createQueryBuilder('cache')
    .where("cache.card_combination @> :card", {
      card: JSON.stringify([{ card_id: cardId }])
    })
    .getMany();

  // Eliminar de ambos cachés
  for (const cache of affectedCaches) {
    await this.cacheManager.del(cache.cache_key);
    await this.cacheRepository.delete(cache.id);
  }
}
```

### 4. **Invalidación por Categoría**

```typescript
async invalidateCacheByCategory(category: string): Promise<void> {
  // Limpiar cachés de una categoría específica
  await this.cacheRepository
    .createQueryBuilder()
    .delete()
    .where("question_hash LIKE :pattern", {
      pattern: `%${category}%`
    })
    .execute();
}
```

## Monitoreo y Métricas

### KPIs Actuales

```typescript
// Disponibles en GET /interpretations/admin/cache/stats
{
  "database": {
    "total": 150,           // Total de interpretaciones cacheadas
    "expired": 5,           // Cachés expirados (para limpieza)
    "avgHits": 3.2         // Promedio de reutilizaciones
  },
  "hitRate": {
    "percentage": 65.5,    // % de requests servidas desde caché
    "description": "65.50% of requests served from cache"
  }
}
```

### Métricas a Agregar con Redis

```typescript
// redis-cli info stats
{
  "keyspace_hits": 1000,     // Aciertos de caché
  "keyspace_misses": 200,    // Fallos de caché
  "evicted_keys": 50,        // Keys eliminadas por falta de memoria
  "expired_keys": 120,       // Keys expiradas naturalmente
  "memory_used": "45MB"      // Memoria consumida
}
```

## Estrategia de Rollback

Si Redis falla o hay problemas:

```typescript
// app.module.ts - Fallback a in-memory
CacheModule.register({
  isGlobal: true,
  store: process.env.USE_REDIS === 'true' ? redisStore : 'memory',
  // ... configuración
});
```

## Recomendaciones

### Para MVP (Actual) ✅

- Mantener caché in-memory + DB
- Monitorear hit rate
- Optimizar TTLs según uso real
- No invertir en Redis aún

### Para Escalamiento (Futuro) 🚀

- Implementar Redis cuando:
  - Escales a 2+ instancias, O
  - Hit rate < 40%, O
  - RAM usage > 500MB para caché
- Usar Redis Cloud para empezar (free tier)
- Migrar a managed service en producción

### Optimizaciones Adicionales 💡

1. **Caché de prompts**: Cachear prompts generados por spread/categoría
2. **Partial cache**: Cachear significados de cartas individuales
3. **Cache warming**: Pre-poblar caché con combinaciones comunes
4. **Compression**: Comprimir interpretaciones largas antes de cachear

## Conclusión

**No necesitas Redis para MVP**, pero cuando escales horizontalmente o notes degradación de performance, esta documentación te guiará en la migración. El sistema actual de doble caché (in-memory + DB) es robusto y suficiente para etapas tempranas.
