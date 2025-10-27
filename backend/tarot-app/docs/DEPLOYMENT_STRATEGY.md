# 🚀 Estrategia de Deployment - TarotFlavia

## Stack Tecnológico Recomendado

### Para MVP (0-5,000 usuarios)

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React/Vite)                      │
│  Deploy: Vercel/Netlify                     │
│  Costo: $0 (Free Tier)                      │
└─────────────────────────────────────────────┘
                    ↓ API calls
┌─────────────────────────────────────────────┐
│  BACKEND (NestJS)                           │
│  Deploy: Render/Railway                     │
│  Costo: $7-10/mes (Starter Plan)            │
│                                             │
│  Caché: In-Memory (incluido, $0)           │
│  ❌ NO usar Redis aún                       │
└─────────────────────────────────────────────┘
                    ↓ queries
┌─────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                      │
│  Deploy: Render/Railway                     │
│  Costo: $7-10/mes (256MB-1GB)              │
└─────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────┐
│  OPENAI API                                 │
│  Costo: ~$5-20/mes (según uso)             │
│  Estimación: $0.15 por 1M tokens input     │
└─────────────────────────────────────────────┘

TOTAL MVP: $20-40/mes
```

---

## Opciones de Deployment por Servicio

### 1️⃣ Frontend (React + Vite)

| Proveedor            | Free Tier          | Paid    | Features                             |
| -------------------- | ------------------ | ------- | ------------------------------------ |
| **Vercel** ⭐        | ✅ 100GB bandwidth | $20/mes | Auto-deploy, Preview URLs, Analytics |
| **Netlify**          | ✅ 100GB bandwidth | $19/mes | Similar a Vercel                     |
| **Cloudflare Pages** | ✅ Unlimited       | $20/mes | CDN global, muy rápido               |
| **GitHub Pages**     | ✅ Gratis siempre  | -       | Solo sitios estáticos                |

**Recomendación:** **Vercel** - Mejor integración con frameworks modernos, deploy automático desde GitHub.

---

### 2️⃣ Backend (NestJS)

| Proveedor                     | Free Tier              | Starter            | Features                           |
| ----------------------------- | ---------------------- | ------------------ | ---------------------------------- |
| **Render** ⭐                 | ✅ 750h/mes            | $7/mes (512MB RAM) | Auto-deploy, HTTPS gratis          |
| **Railway**                   | ❌ $5 crédito inicial  | $5-10/mes          | Muy fácil setup, buen DX           |
| **Fly.io**                    | ✅ 3 VMs gratis        | $1.94/mes (256MB)  | Deploy global, muy económico       |
| **Heroku**                    | ❌ Ya no hay free tier | $7/mes             | Clásico pero más caro              |
| **DigitalOcean App Platform** | ❌                     | $12/mes            | Más robusto, para producción seria |

**Recomendación para MVP:** **Render** - Balance perfecto entre precio, facilidad y features.

**Configuración Render:**

```yaml
# render.yaml
services:
  - type: web
    name: tarot-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: tarot-db
          property: connectionString
      - key: OPENAI_API_KEY
        sync: false # Set manually in dashboard
```

---

### 3️⃣ Base de Datos (PostgreSQL)

| Proveedor       | Free Tier | Starter | RAM/Storage | Notas                                    |
| --------------- | --------- | ------- | ----------- | ---------------------------------------- |
| **Supabase** ⭐ | ✅ 500MB  | $25/mes | 8GB         | Incluye Auth, Storage, APIs gratis       |
| **Neon**        | ✅ 512MB  | $19/mes | 3GB         | Serverless, excelente para startups      |
| **Render**      | ❌        | $7/mes  | 256MB-1GB   | Mismo proveedor que backend (simplifica) |
| **Railway**     | ❌        | $5/mes  | 1GB         | Integrado con backend                    |
| **ElephantSQL** | ✅ 20MB   | $5/mes  | 1GB         | Especializado en PostgreSQL              |

**Recomendación para MVP:** **Render PostgreSQL** - Todo en un solo proveedor simplifica billing y networking.

**Alternativa Pro:** **Supabase** - Si quieres features extra (auth, storage) gratis.

---

### 4️⃣ Caché (Redis) - OPCIONAL ⚠️

| Proveedor       | Free Tier           | Starter        | Cuándo usar               |
| --------------- | ------------------- | -------------- | ------------------------- |
| **Upstash** ⭐  | ✅ 10K requests/día | $0.20 per 100K | Serverless, pay-as-you-go |
| **Redis Cloud** | ✅ 30MB             | $5/mes (1GB)   | Más tradicional           |
| **Railway**     | ❌                  | $5/mes         | Si ya usas Railway        |
| **Render**      | ❌                  | $7/mes         | Si ya usas Render         |

**Para MVP:** ❌ **NO uses Redis**

- Usa caché in-memory de NestJS (gratis, incluido)
- Redis solo cuando tengas >2 instancias del backend
- Ahorra $5-7/mes inicialmente

---

## 💰 Comparativa de Costos Mensual

### Opción 1: MVP Económico (Recomendado)

```
Frontend:     Vercel Free         $0
Backend:      Render Starter      $7
Database:     Render PostgreSQL   $7
OpenAI:       Uso moderado        $10 (estimado)
────────────────────────────────────
TOTAL:                            $24/mes
```

**Ideal para:** Lanzamiento MVP, primeros 1000 usuarios

---

### Opción 2: MVP con Supabase (Features Extra)

```
Frontend:     Vercel Free         $0
Backend:      Render Starter      $7
Database:     Supabase Free       $0 (hasta 500MB)
  ↑ Incluye: Auth, Storage, APIs
OpenAI:       Uso moderado        $10
────────────────────────────────────
TOTAL:                            $17/mes
```

**Ideal para:** Si necesitas storage de imágenes, auth de terceros, etc.

---

### Opción 3: Escalado (5,000-50,000 usuarios)

```
Frontend:     Vercel Pro          $20
Backend:      Render Pro (2 instancias) $28
Database:     Render PostgreSQL   $20 (1GB)
Redis:        Upstash Free/Paid   $0-10
OpenAI:       Uso alto            $50-100
────────────────────────────────────
TOTAL:                            $118-178/mes
```

**Ideal para:** Después de validar el producto, con tráfico real

---

## 🎯 Plan de Deployment Recomendado

### FASE 1: MVP (Mes 1-3)

**Stack:**

- Frontend: Vercel (Free)
- Backend: Render Starter ($7)
- Database: Render PostgreSQL ($7)
- Caché: In-Memory (incluido)
- Total: **~$24/mes**

**Limitaciones aceptables:**

- 1 instancia de backend (suficiente para 500-1000 usuarios)
- Caché in-memory (se reinicia con el servidor, no es problema para MVP)
- Sin Redis (ahorro de $5-10/mes)

---

### FASE 2: Crecimiento (Mes 4-6)

**Cuando tengas:**

- > 1000 usuarios activos
- > 100 lecturas diarias
- Ingresos de suscripciones

**Upgrade:**

- Backend: Render Standard ($25) - 1GB RAM
- Database: Render Standard ($20) - 1GB
- Mantener caché in-memory aún
- Total: **~$55/mes**

---

### FASE 3: Escalado (Mes 7+)

**Cuando tengas:**

- > 5000 usuarios
- Necesidad de 2+ instancias de backend
- Alta concurrencia

**Upgrade:**

- Backend: 2-3 instancias ($25 x 2-3)
- Database: Upgrade a 2GB ($50)
- **AHORA SÍ agregar Redis** ($5-10)
- Total: **~$110-160/mes**

---

## 🔧 Variables de Entorno por Ambiente

### Development (.env.development)

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=tarot_user
DATABASE_PASSWORD=tarot_password
DATABASE_NAME=tarot_dev

# Cache (in-memory, sin Redis)
CACHE_STORE=memory
CACHE_TTL=3600

# OpenAI
OPENAI_API_KEY=sk-test-xxx  # Test key

# Environment
NODE_ENV=development
PORT=3000
```

### Production (.env.production - en Render Dashboard)

```bash
# Database (auto-inyectada por Render)
DATABASE_URL=${DATABASE_URL}  # Render lo provee

# Cache
CACHE_STORE=memory  # MVP sin Redis
CACHE_TTL=3600

# OpenAI
OPENAI_API_KEY=sk-prod-xxx  # Production key

# Security
JWT_SECRET=${RANDOM_SECRET}
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=${RANDOM_SECRET_2}
REFRESH_TOKEN_EXPIRES_IN=7d

# Email (si implementas TASK-016)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=${RESEND_API_KEY}
EMAIL_FROM=noreply@tarotflavia.com

# Environment
NODE_ENV=production
PORT=10000  # Puerto de Render
```

---

## 📊 Monitoreo de Costos

### OpenAI (Principal gasto variable)

**Estimación por lectura:**

```
Prompt típico: ~500 tokens input
Respuesta: ~600 tokens output

Costo por lectura:
- Input:  500 tokens × $0.15 / 1M = $0.000075
- Output: 600 tokens × $0.60 / 1M = $0.00036
TOTAL: ~$0.00044 por lectura

100 lecturas/día = $0.044/día = $1.32/mes
1000 lecturas/día = $0.44/día = $13.2/mes
```

**Configurar alertas:**

```javascript
// En TASK-019: Logging de OpenAI
if (dailyCost > 5) {
  // $5/día = $150/mes
  sendEmailToAdmin('⚠️ Alto uso de OpenAI');
}
```

---

## ✅ Checklist Pre-Deploy

### Backend (NestJS)

- [ ] Configurar todas las variables de entorno en Render
- [ ] Desactivar `synchronize: true` en TypeORM (TASK-001)
- [ ] Ejecutar migraciones en producción
- [ ] Ejecutar seeders (cartas, spreads, categorías)
- [ ] Configurar CORS para permitir tu dominio de frontend
- [ ] Habilitar rate limiting (TASK-014)
- [ ] Configurar logging de OpenAI (TASK-019)
- [ ] Probar health checks: `/health`, `/health/ready`
- [ ] Configurar SSL (Render lo hace automático)

### Frontend (React)

- [ ] Configurar variable `VITE_API_URL` apuntando a backend en Render
- [ ] Build de producción optimizado
- [ ] Configurar redirects en Vercel para SPA routing
- [ ] Implementar error boundary
- [ ] Configurar Analytics (opcional)

### Base de Datos

- [ ] Backup automático configurado (Render lo hace)
- [ ] Índices creados (TASK-042)
- [ ] Connection pooling configurado (TASK-043)

---

## 🚨 Troubleshooting Común

### "Mi backend no conecta a la DB"

**Solución:**

```bash
# Verifica que DATABASE_URL esté configurada
# En Render, debe verse así:
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# NO uses variables separadas (HOST, PORT, etc.) en producción
# Usa la URL completa que provee Render
```

### "OpenAI devuelve error 429"

**Causa:** Rate limit excedido o saldo insuficiente

**Solución:**

1. Verifica saldo en OpenAI dashboard
2. Implementa caché de interpretaciones (TASK-020)
3. Reduce el número de llamadas con el caché

### "El caché in-memory se pierde"

**Causa:** El servidor se reinició (normal en free tiers)

**Solución para MVP:** Esto es aceptable
**Solución escalada:** Implementar Redis (TASK-044)

---

## 🎯 Conclusión

**Para tu MVP, el stack recomendado es:**

```
✅ Frontend: Vercel (Free)
✅ Backend: Render Starter ($7)
✅ Database: Render PostgreSQL ($7)
✅ Caché: In-Memory (Free, NO Redis)
✅ OpenAI: Pay-as-you-go (~$10-20)

TOTAL: $24-34/mes
```

**Redis NO es necesario hasta:**

- Tengas >5000 usuarios concurrentes
- Necesites 2+ instancias de backend
- El caché in-memory cause problemas

**Ahorro inicial:** $5-10/mes (Redis) + complejidad reducida

**Plan de migración a Redis:** Documentado en TASK-044, implementar solo cuando sea necesario.
