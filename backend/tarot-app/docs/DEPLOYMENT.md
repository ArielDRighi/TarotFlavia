# 🚀 Deployment Guide - TarotFlavia

## Tabla de Contenidos

- [Overview](#overview)
- [Requisitos de Deployment](#requisitos-de-deployment)
- [Opciones de Hosting](#opciones-de-hosting)
- [Deployment en Render (Recomendado MVP)](#deployment-en-render-recomendado-mvp)
- [Deployment en Railway](#deployment-en-railway)
- [Deployment en DigitalOcean](#deployment-en-digitalocean)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Variables de Entorno para Producción](#variables-de-entorno-para-producción)
- [CI/CD con GitHub Actions](#cicd-con-github-actions)
- [Rollback Strategy](#rollback-strategy)
- [Monitoreo y Alertas](#monitoreo-y-alertas)
- [Troubleshooting](#troubleshooting)

---

## Overview

Esta guía cubre el deployment completo de TarotFlavia. El proyecto incluye Dockerfiles listos para producción — el método recomendado es **Docker + VPS** o cualquier plataforma que soporte contenedores.

### Stack de Deployment

```
┌─────────────────────────────────────────────┐
│  FRONTEND (Next.js)                         │
│  Deploy: Docker (VPS) o Vercel              │
│  Puerto: 3001                               │
└─────────────────────────────────────────────┘
                    ↓ API calls
┌─────────────────────────────────────────────┐
│  BACKEND (NestJS)                           │
│  Deploy: Docker (VPS) o Render/Railway      │
│  Puerto: 3000                               │
│  Caché: In-Memory (sin Redis por ahora)     │
└─────────────────────────────────────────────┘
                    ↓ queries
┌─────────────────────────────────────────────┐
│  DATABASE (PostgreSQL 16)                   │
│  Deploy: Docker (VPS) o managed             │
│  Costo: $7-15/mes (256MB-1GB)              │
└─────────────────────────────────────────────┘

TOTAL estimado: $20-40/mes
```

---

## 🐳 Deployment con Docker (Recomendado)

El proyecto incluye `Dockerfile` para backend y frontend en sus respectivas carpetas.

### Variables de Entorno Requeridas (Producción)

```bash
# Backend (.env)
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/tarot_db
JWT_SECRET=<secreto-seguro>
JWT_REFRESH_SECRET=<secreto-seguro>
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://api.tudominio.com
GROQ_API_KEY=<tu-key>
MP_ACCESS_TOKEN=<mercadopago-token>
MP_WEBHOOK_SECRET=<webhook-secret>
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>
EMAIL_FROM=noreply@tudominio.com

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api/v1
NEXT_PUBLIC_APP_URL=https://tudominio.com
NEXT_PUBLIC_APP_ENV=production
```

### Build y Deploy Manual

```bash
# Backend
cd backend/tarot-app
docker build -t auguria-backend .
docker run -p 3000:3000 --env-file .env auguria-backend

# Frontend
cd frontend
docker build -t auguria-frontend .
docker run -p 3001:3001 --env-file .env.local auguria-frontend
```

---

## Requisitos de Deployment

### Mínimos (MVP)

- **Node.js**: v18.x o superior
- **PostgreSQL**: 15+ (256MB RAM mínimo)
- **RAM**: 512MB mínimo para el backend
- **Storage**: 1GB mínimo
- **Bandwidth**: 100GB/mes

### Recomendados (Producción)

- **Node.js**: v20.x LTS
- **PostgreSQL**: 15+ (1GB RAM mínimo)
- **RAM**: 1GB para el backend
- **Storage**: 5GB
- **Bandwidth**: 500GB/mes
- **CDN**: Para assets estáticos

---

## Opciones de Hosting

### Comparativa de Proveedores

| Proveedor        | Free Tier       | Starter   | Pros                                   | Contras                             |
| ---------------- | --------------- | --------- | -------------------------------------- | ----------------------------------- |
| **Render** ⭐    | ✅ 750h/mes     | $7/mes    | Fácil setup, HTTPS gratis, auto-deploy | Sleep después de inactividad (free) |
| **Railway**      | ❌ $5 crédito   | $5-10/mes | Excelente DX, rápido                   | Sin free tier permanente            |
| **Fly.io**       | ✅ 3 VMs gratis | $1.94/mes | Deploy global, económico               | Configuración más compleja          |
| **Heroku**       | ❌ No free tier | $7/mes    | Clásico, maduro                        | Más caro que alternativas           |
| **DigitalOcean** | ❌              | $12/mes   | Robusto, escalable                     | Requiere más configuración          |

**Recomendación para MVP:** **Render** - Balance perfecto entre precio, facilidad y features.

---

## Deployment en Render (Recomendado MVP)

### 1. Crear Cuenta en Render

1. Ir a https://render.com
2. Sign up con GitHub
3. Autorizar acceso al repositorio TarotFlavia

### 2. Crear Base de Datos PostgreSQL

1. En dashboard de Render, click "New +" → "PostgreSQL"
2. Configurar:
   ```
   Name: tarot-db
   Database: tarot_db
   User: tarot_user
   Region: Oregon (US West) o Frankfurt (EU Central)
   Plan: Starter ($7/mo) - 256MB RAM
   ```
3. Click "Create Database"
4. Esperar ~2 minutos a que se provisione
5. Copiar el **Internal Database URL** (se usará en el backend)

### 3. Crear Web Service (Backend)

#### Opción A: Desde Dashboard

1. Click "New +" → "Web Service"
2. Conectar repositorio GitHub `ArielDRighi/TarotFlavia`
3. Configurar:
   ```
   Name: tarot-backend
   Region: Mismo que la DB (Oregon o Frankfurt)
   Branch: main
   Root Directory: backend/tarot-app
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   Plan: Starter ($7/mo) - 512MB RAM
   ```

#### Opción B: Usando render.yaml (Recomendado)

Crear `render.yaml` en la raíz del proyecto:

```yaml
services:
  # Backend NestJS
  - type: web
    name: tarot-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: cd backend/tarot-app && npm install && npm run build
    startCommand: cd backend/tarot-app && npm run start:prod
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: tarot-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: OPENAI_API_KEY
        sync: false # Set manually in dashboard
      - key: ANTHROPIC_API_KEY
        sync: false

databases:
  - name: tarot-db
    databaseName: tarot_db
    user: tarot_user
    region: oregon
    plan: starter
```

Commit y push, Render detectará y desplegará automáticamente.

### 4. Configurar Variables de Entorno

En el dashboard de Render (Web Service → Environment):

```bash
# Base de datos (auto-inyectada si usas fromDatabase)
DATABASE_URL=<Internal Database URL from Render>

# JWT Secrets (generar con: openssl rand -base64 64)
JWT_SECRET=<tu-secret-seguro-64-caracteres>
JWT_REFRESH_SECRET=<tu-secret-seguro-64-caracteres>

# OpenAI (requerido para lecturas IA)
OPENAI_API_KEY=sk-proj-your-openai-key-here

# Anthropic (opcional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# CORS (dominio del frontend)
CORS_ORIGIN=https://tarotflavia.com

# Environment
NODE_ENV=production
PORT=10000

# Cache
CACHE_STORE=memory
CACHE_TTL=3600

# Email (si implementaste TASK-016)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_your_resend_key
EMAIL_FROM=noreply@tarotflavia.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Logging
LOG_LEVEL=info
```

### 5. Ejecutar Migraciones

Después del primer deploy:

```bash
# Opción A: Desde Render Shell
# En dashboard → Shell tab
npm run migration:run
npm run db:seed:cards

# Opción B: Localmente apuntando a Render DB
# Copiar External Database URL de Render
DATABASE_URL=<External Database URL> npm run migration:run
DATABASE_URL=<External Database URL> npm run db:seed:cards
```

### 6. Verificar Deployment

```bash
# Health check
curl https://tarot-backend.onrender.com/health

# Debe retornar:
{
  "status": "ok",
  "info": {
    "database": {"status": "up"},
    "memory_heap": {"status": "up"},
    "ai_providers": {"status": "up"}
  }
}
```

### 7. Configurar Dominio Personalizado (Opcional)

1. En Render dashboard → Settings → Custom Domain
2. Agregar: `api.tarotflavia.com`
3. Configurar DNS:
   ```
   Type: CNAME
   Name: api
   Value: tarot-backend.onrender.com
   ```
4. Esperar propagación DNS (~10-30 min)
5. Render configurará HTTPS automáticamente

---

## Deployment en Railway

### 1. Crear Proyecto

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init
```

### 2. Agregar PostgreSQL

```bash
railway add postgresql
```

Railway proveerá automáticamente `DATABASE_URL`.

### 3. Configurar Variables de Entorno

```bash
# Desde CLI
railway variables set JWT_SECRET=<tu-secret>
railway variables set OPENAI_API_KEY=<tu-key>

# O desde dashboard: https://railway.app
```

### 4. Deploy

```bash
# Deploy
railway up

# Ver logs
railway logs
```

### 5. Configurar Dominio

```bash
railway domain
```

---

## Deployment en DigitalOcean

### Usando App Platform

1. Crear cuenta en DigitalOcean
2. App Platform → Create App → GitHub
3. Seleccionar repo `TarotFlavia`
4. Configurar:
   ```
   Name: tarot-backend
   Source Directory: backend/tarot-app
   Build Command: npm run build
   Run Command: npm run start:prod
   HTTP Port: 3000
   ```
5. Agregar PostgreSQL Managed Database ($15/mo)
6. Configurar variables de entorno
7. Deploy

### Usando Droplet (VPS)

```bash
# 1. Crear Droplet Ubuntu 22.04
# 2. SSH al servidor
ssh root@your-droplet-ip

# 3. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Instalar PostgreSQL 15
sudo apt install postgresql postgresql-contrib

# 5. Configurar PostgreSQL
sudo -u postgres psql
CREATE USER tarot_user WITH PASSWORD 'secure_password';
CREATE DATABASE tarot_db OWNER tarot_user;
\q

# 6. Clonar repositorio
git clone https://github.com/ArielDRighi/TarotFlavia.git
cd TarotFlavia/backend/tarot-app

# 7. Instalar dependencias
npm install

# 8. Configurar .env
cp .env.example .env
nano .env  # Editar con valores de producción

# 9. Build
npm run build

# 10. Ejecutar migraciones
npm run migration:run
npm run db:seed:cards

# 11. Instalar PM2 (process manager)
npm install -g pm2

# 12. Iniciar con PM2
pm2 start dist/main.js --name tarot-backend
pm2 startup  # Auto-start on boot
pm2 save

# 13. Configurar Nginx como reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/tarot-backend
```

Configuración Nginx:

```nginx
server {
    listen 80;
    server_name api.tarotflavia.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/tarot-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 14. Configurar SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.tarotflavia.com
```

---

## Configuración de Base de Datos

### PostgreSQL en Render

Render provee PostgreSQL managed con backups automáticos.

**Conexión:**

```bash
# Internal URL (desde el backend en Render)
DATABASE_URL=postgresql://tarot_user:password@dpg-xyz.oregon-postgres.render.com/tarot_db

# External URL (desde tu máquina local)
DATABASE_URL=postgresql://tarot_user:password@dpg-xyz.oregon-postgres.render.com:5432/tarot_db
```

### PostgreSQL en Railway

Railway provee PostgreSQL automáticamente:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Variable mágica de Railway
```

### Configuración de Connection Pool

En producción, configurar pooling en `backend/tarot-app/src/config/database.config.ts`:

```typescript
export default registerAs('database', () => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NUNCA true en producción
  logging: process.env.NODE_ENV === 'development',

  // Connection pooling
  extra: {
    max: 25, // Máximo de conexiones
    min: 5, // Mínimo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  },
}));
```

---

## Variables de Entorno para Producción

### Variables Esenciales

```bash
# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=production
PORT=10000  # Puerto interno (Render usa 10000)

# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# ========================================
# JWT AUTHENTICATION
# ========================================
# Generar con: openssl rand -base64 64
JWT_SECRET=tu-secret-super-seguro-minimo-64-caracteres-produccion
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro-minimo-64-caracteres
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ========================================
# AI PROVIDERS
# ========================================
# OpenAI (requerido)
OPENAI_API_KEY=sk-proj-your-production-openai-key
OPENAI_MODEL=gpt-4-turbo

# Anthropic (opcional, fallback)
ANTHROPIC_API_KEY=sk-ant-your-production-anthropic-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# ========================================
# CORS
# ========================================
CORS_ORIGIN=https://tarotflavia.com,https://www.tarotflavia.com

# ========================================
# CACHE
# ========================================
CACHE_STORE=memory  # Cambiar a 'redis' cuando escales
CACHE_TTL=3600
# Redis (futuro)
# REDIS_HOST=redis-server.com
# REDIS_PORT=6379
# REDIS_PASSWORD=redis-password

# ========================================
# EMAIL (si implementaste TASK-016)
# ========================================
EMAIL_PROVIDER=resend  # o sendgrid
EMAIL_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@tarotflavia.com
EMAIL_REPLY_TO=soporte@tarotflavia.com

# ========================================
# RATE LIMITING
# ========================================
THROTTLE_TTL=60      # 60 segundos
THROTTLE_LIMIT=10    # 10 requests por minuto

# ========================================
# LOGGING
# ========================================
LOG_LEVEL=info       # info, warn, error (no debug en prod)
LOG_DIR=logs

# ========================================
# MONITORING (opcional)
# ========================================
# SENTRY_DSN=https://your-sentry-dsn
# DATADOG_API_KEY=your-datadog-key
```

### Generar Secrets Seguros

```bash
# JWT Secret (64 caracteres base64)
openssl rand -base64 64

# UUID v4 (alternativa)
node -e "console.log(require('crypto').randomUUID())"
```

### Validar Variables de Entorno

Crear `backend/tarot-app/scripts/validate-env.ts`:

```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENAI_API_KEY',
  'CORS_ORIGIN',
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((key) => console.error(`  - ${key}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

Ejecutar antes de deploy:

```bash
npm run validate:env
```

---

## CI/CD con GitHub Actions

### Workflow Completo

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/tarot-app/package-lock.json

      - name: Install dependencies
        working-directory: backend/tarot-app
        run: npm ci

      - name: Run linter
        working-directory: backend/tarot-app
        run: npm run lint

      - name: Run unit tests
        working-directory: backend/tarot-app
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db

      - name: Run E2E tests
        working-directory: backend/tarot-app
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/tarot-app/coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST https://api.render.com/deploy/${{ secrets.RENDER_DEPLOY_HOOK }}

      - name: Slack Notification
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_MESSAGE: '🚀 Deployed to production successfully!'
```

### Secrets de GitHub

Agregar en Settings → Secrets and variables → Actions:

```
RENDER_DEPLOY_HOOK: https://api.render.com/deploy/srv-xxx?key=yyy
SLACK_WEBHOOK: https://hooks.slack.com/services/xxx/yyy/zzz
```

---

## Rollback Strategy

### Rollback en Render

1. Dashboard → Service → Events
2. Click en el deploy anterior exitoso
3. Click "Redeploy"

### Rollback en Railway

```bash
railway rollback
```

### Rollback Manual (Git)

```bash
# 1. Identificar commit bueno
git log --oneline

# 2. Revertir a ese commit
git revert <commit-hash>

# 3. Push (triggerea nuevo deploy)
git push origin main
```

### Database Rollback

**Si hiciste migración que rompió algo:**

```bash
# Conectar a DB de producción
DATABASE_URL=<production-url> npm run migration:revert

# O desde Render Shell
npm run migration:revert
```

**⚠️ IMPORTANTE:** Siempre testear migraciones en staging primero.

---

## Monitoreo y Alertas

### Health Checks

Configurar health checks en Render/Railway:

```
Path: /health
Expected Status: 200
Interval: 30s
Timeout: 10s
Unhealthy Threshold: 3 failures
```

### Logs

#### Ver Logs en Tiempo Real

**Render:**

```bash
# Desde dashboard → Logs tab
# O usar Render CLI
render logs
```

**Railway:**

```bash
railway logs --follow
```

#### Logging con Winston

Ya configurado en `src/common/services/logger.service.ts`:

```typescript
// Los logs se guardan en:
logs/
  app-YYYY-MM-DD.log      # Info general
  error-YYYY-MM-DD.log    # Solo errores
```

### Monitoreo de Costos IA

Implementado en `src/modules/ai-usage/ai-usage.service.ts`:

```typescript
// Configurar alertas cuando costo diario > $5
if (dailyAICost > 5) {
  logger.warn('⚠️ High AI usage detected', { cost: dailyAICost });
  // Enviar email a admin
}
```

### Uptime Monitoring

Usar servicios externos:

- **UptimeRobot** (Free): https://uptimerobot.com
- **Pingdom** (Paid): https://www.pingdom.com
- **Better Uptime** (Free tier): https://betteruptime.com

Configurar:

```
URL to monitor: https://api.tarotflavia.com/health
Interval: 5 minutes
Alert via: Email, Slack
```

### Error Tracking

#### Opción 1: Sentry

```bash
npm install @sentry/node

# En main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Opción 2: LogRocket

```bash
npm install logrocket
```

---

## Troubleshooting

### El backend no inicia

**Síntomas:**

```
Error: Cannot connect to database
```

**Solución:**

1. Verificar `DATABASE_URL` correcta
2. Verificar que DB esté corriendo
3. Verificar firewall/networking

### Migrations fallan

**Error:**

```
QueryFailedError: relation "users" already exists
```

**Solución:**

```bash
# Ver estado de migraciones
npm run migration:show

# Si hay duplicadas, revertir
npm run migration:revert

# Luego correr de nuevo
npm run migration:run
```

### 502 Bad Gateway

**Causas:**

- Backend crasheó
- Build falló
- Health check fallando

**Solución:**

1. Ver logs: `render logs` o en dashboard
2. Verificar que build completó
3. Verificar health check pasa

### OpenAI 429 Rate Limit

**Error:**

```
Error: Rate limit reached for default-gpt-4
```

**Solución:**

1. Verificar saldo en OpenAI dashboard
2. Aumentar rate limits en OpenAI
3. Implementar fallback a Claude
4. Verificar caché está funcionando

### Memory Leaks

**Síntomas:**

- App se hace lenta con el tiempo
- Crashes por OOM (Out of Memory)

**Solución:**

```bash
# 1. Aumentar RAM en Render/Railway
# 2. Verificar conexiones de DB se cierran:
npm run test:e2e  # Verificar afterAll() cierra conexiones

# 3. Usar herramientas de profiling
node --inspect dist/main.js
```

---

## Checklist Pre-Deploy

### Antes del Primer Deploy

- [ ] Todas las variables de entorno configuradas
- [ ] JWT secrets generados (64+ caracteres)
- [ ] `synchronize: false` en TypeORM config
- [ ] CORS configurado con dominio del frontend
- [ ] OpenAI API key configurada (production key)
- [ ] Database backup configurado
- [ ] Health checks funcionando
- [ ] Logs configurados (Winston)
- [ ] Rate limiting habilitado

### Antes de Cada Deploy

- [ ] Tests pasan (`npm test && npm run test:e2e`)
- [ ] Linter pasa (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Migraciones probadas en staging
- [ ] Cambios revisados en PR
- [ ] Changelog actualizado

### Después del Deploy

- [ ] Health check verde
- [ ] Smoke tests manuales
- [ ] Logs sin errores críticos
- [ ] Métricas normales (CPU, RAM, DB)
- [ ] Notificar al equipo

---

## Scaling

### Cuando Escalar

Escalar cuando:

- > 5000 usuarios activos
- > 100 lecturas/hora
- CPU > 80% sostenido
- RAM > 80% sostenido
- Response time > 1 segundo

### Vertical Scaling

**Render:**

```
Starter ($7) → Standard ($25) → Pro ($85)
512MB      → 1GB          → 2GB
```

**Railway:**

```
Ajustar RAM y CPU en dashboard
```

### Horizontal Scaling

**Requisitos:**

1. Agregar Redis para caché compartido
2. Configurar load balancer
3. Database connection pooling ajustado

**Render:**

```
Dashboard → Scaling → Instances: 2+
```

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025  
**Próxima revisión**: Cada 3 meses o al escalar
