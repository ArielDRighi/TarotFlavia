# Guía de Deployment - Módulo Carta Astral

## Requisitos Previos

### Sistema Operativo
- **Recomendado:** Ubuntu 22.04 LTS o superior
- **Alternativas:** Debian 11+, CentOS 8+, macOS (solo desarrollo)

### Software Requerido

| Software      | Versión Mínima | Versión Recomendada | Notas                        |
| ------------- | -------------- | ------------------- | ---------------------------- |
| Node.js       | 20.x           | 20.11.0+            | LTS recomendado              |
| npm           | 10.x           | 10.2.0+             | Incluido con Node.js         |
| PostgreSQL    | 14.x           | 16.x                | Con extensión JSONB          |
| Redis         | 6.x            | 7.x                 | Opcional pero recomendado    |

### Dependencias Externas

#### Swiss Ephemeris (CRÍTICO)

Swiss Ephemeris es **obligatorio** para los cálculos astronómicos.

**Instalación en Linux:**

```bash
# Crear directorio para archivos de efemérides
sudo mkdir -p /usr/share/sweph
cd /usr/share/sweph

# Descargar archivos requeridos
sudo wget https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1  # Planetas
sudo wget https://www.astro.com/ftp/swisseph/ephe/semo_18.se1  # Luna
sudo wget https://www.astro.com/ftp/swisseph/ephe/seas_18.se1  # Asteroides (opcional)

# Dar permisos de lectura
sudo chmod 644 /usr/share/sweph/*.se1
```

**Instalación en macOS:**

```bash
# Crear directorio
mkdir -p /usr/local/share/sweph
cd /usr/local/share/sweph

# Descargar archivos
curl -O https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
curl -O https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
curl -O https://www.astro.com/ftp/swisseph/ephe/seas_18.se1
```

**Instalación en Docker:**

```dockerfile
FROM node:20-alpine

# Instalar dependencias para Swiss Ephemeris
RUN apk add --no-cache curl

# Descargar archivos de efemérides
RUN mkdir -p /usr/share/sweph && \
    cd /usr/share/sweph && \
    curl -O https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1 && \
    curl -O https://www.astro.com/ftp/swisseph/ephe/semo_18.se1 && \
    curl -O https://www.astro.com/ftp/swisseph/ephe/seas_18.se1 && \
    chmod 644 *.se1
```

#### APIs Externas

| Servicio       | Requerido   | URL Base                           | Límites                |
| -------------- | ----------- | ---------------------------------- | ---------------------- |
| Nominatim      | Opcional    | https://nominatim.openstreetmap.org| 1 req/s (gratuito)     |
| Groq API       | Opcional    | https://api.groq.com               | 30 req/min (gratuito)  |
| TimeZoneDB     | Opcional    | https://api.timezonedb.com         | 1 req/s (plan free)    |

---

## Variables de Entorno

### Archivo `.env` (Backend)

Crear archivo `backend/tarot-app/.env` con las siguientes variables:

```bash
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://user:password@localhost:5432/auguria_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=auguria_user
DATABASE_PASSWORD=secure_password_here
DATABASE_NAME=auguria_db
DATABASE_SSL=false  # true en producción

# ============================================================================
# REDIS (OPCIONAL - Cache)
# ============================================================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Dejar vacío si no tiene password
REDIS_DB=0
REDIS_TTL=86400  # 24 horas en segundos

# ============================================================================
# SWISS EPHEMERIS
# ============================================================================
SWEPH_PATH=/usr/share/sweph  # Ruta a archivos de efemérides

# ============================================================================
# GEOCODING (OPCIONAL)
# ============================================================================
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_EMAIL=your-email@example.com  # REQUERIDO por TOS de Nominatim

# ============================================================================
# AI PROVIDER (OPCIONAL - Premium)
# ============================================================================
GROQ_API_KEY=your_groq_api_key_here  # Para síntesis IA Premium
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=2000
GROQ_TEMPERATURE=0.7

# Fallback AI providers (opcionales)
OPENAI_API_KEY=your_openai_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here

# ============================================================================
# APLICACIÓN
# ============================================================================
NODE_ENV=production  # development | production | test
PORT=3000
API_PREFIX=api/v1

# ============================================================================
# JWT & AUTH
# ============================================================================
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars
JWT_EXPIRATION=7d

# ============================================================================
# CORS
# ============================================================================
CORS_ORIGIN=https://auguria.com  # Frontend URL
CORS_CREDENTIALS=true

# ============================================================================
# RATE LIMITING
# ============================================================================
THROTTLE_TTL=60000  # 1 minuto
THROTTLE_LIMIT=10   # 10 requests por minuto

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL=info  # debug | info | warn | error
LOG_FILE_PATH=./logs/birth-chart.log

# ============================================================================
# MONITORING (OPCIONAL)
# ============================================================================
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project-id
```

---

## Deployment Manual (Servidor Linux)

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y curl git build-essential

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar v10.x.x

# Instalar PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt update
sudo apt install -y postgresql-16

# Instalar Redis (opcional)
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2
```

### 2. Configuración de Base de Datos

```bash
# Crear usuario y base de datos
sudo -u postgres psql

# Dentro de psql:
CREATE USER auguria_user WITH ENCRYPTED PASSWORD 'secure_password_here';
CREATE DATABASE auguria_db OWNER auguria_user;
GRANT ALL PRIVILEGES ON DATABASE auguria_db TO auguria_user;
\q

# Verificar conexión
psql -U auguria_user -d auguria_db -h localhost
```

### 3. Clonar y Configurar Aplicación

```bash
# Clonar repositorio
cd /var/www
sudo git clone https://github.com/auguria/api.git auguria-api
cd auguria-api/backend/tarot-app

# Crear usuario para la app
sudo useradd -r -s /bin/bash auguria
sudo chown -R auguria:auguria /var/www/auguria-api

# Cambiar a usuario auguria
sudo su - auguria

# Volver al directorio
cd /var/www/auguria-api/backend/tarot-app

# Instalar dependencias
npm ci --only=production

# Copiar y configurar .env
cp .env.example .env
nano .env  # Editar con valores correctos

# Ejecutar migraciones
npm run migration:run

# Ejecutar seeders (interpretaciones)
npm run db:seed:interpretations

# Build de producción
npm run build
```

### 4. Instalar Swiss Ephemeris

```bash
# Ya realizado en "Requisitos Previos" pero verificar:
ls -la /usr/share/sweph

# Debe mostrar:
# -rw-r--r-- sepl_18.se1
# -rw-r--r-- semo_18.se1
# -rw-r--r-- seas_18.se1
```

### 5. Configurar PM2

```bash
# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'auguria-api',
      script: './dist/main.js',
      instances: 'max',  // Usa todos los cores disponibles
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js

# Verificar que está corriendo
pm2 status
pm2 logs auguria-api

# Guardar configuración para auto-inicio
pm2 save
pm2 startup systemd

# Copiar el comando que PM2 imprime y ejecutarlo con sudo
# Ejemplo:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u auguria --hp /home/auguria
```

### 6. Configurar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/auguria-api

# Contenido:
server {
    listen 80;
    server_name api.auguria.com;

    # Redirigir a HTTPS (después de configurar SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.auguria.com;

    # SSL (usar Certbot para Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.auguria.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.auguria.com/privkey.pem;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy a Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
    }

    # Logs
    access_log /var/log/nginx/auguria-api-access.log;
    error_log /var/log/nginx/auguria-api-error.log;
}

# Activar sitio
sudo ln -s /etc/nginx/sites-available/auguria-api /etc/nginx/sites-enabled/

# Test de configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 7. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d api.auguria.com

# Renovación automática (ya configurado por defecto)
sudo certbot renew --dry-run
```

### 8. Configurar Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Denegar acceso directo al puerto 3000 desde exterior
sudo ufw deny 3000/tcp

# Verificar reglas
sudo ufw status
```

---

## Deployment con Docker

### Dockerfile (Backend)

```dockerfile
# backend/tarot-app/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# ============================================================================
# Production Stage
# ============================================================================
FROM node:20-alpine

WORKDIR /app

# Instalar curl para healthcheck y descargar efemérides
RUN apk add --no-cache curl

# Copiar archivos de producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Crear directorio para Swiss Ephemeris
RUN mkdir -p /usr/share/sweph && \
    cd /usr/share/sweph && \
    curl -O https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1 && \
    curl -O https://www.astro.com/ftp/swisseph/ephe/semo_18.se1 && \
    curl -O https://www.astro.com/ftp/swisseph/ephe/seas_18.se1 && \
    chmod 644 *.se1

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### docker-compose.yml

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: auguria-postgres
    environment:
      POSTGRES_USER: auguria_user
      POSTGRES_PASSWORD: secure_password_here
      POSTGRES_DB: auguria_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    networks:
      - auguria-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U auguria_user']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: auguria-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'
    networks:
      - auguria-network
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend/tarot-app
      dockerfile: Dockerfile
    container_name: auguria-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://auguria_user:secure_password_here@postgres:5432/auguria_db
      REDIS_HOST: redis
      REDIS_PORT: 6379
      SWEPH_PATH: /usr/share/sweph
      PORT: 3000
      # ... resto de variables de .env
    ports:
      - '3000:3000'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - auguria-network
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

networks:
  auguria-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### Comandos Docker

```bash
# Build y start
docker-compose up -d --build

# Ver logs
docker-compose logs -f backend

# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Ejecutar seeders
docker-compose exec backend npm run db:seed:interpretations

# Detener
docker-compose down

# Eliminar todo (incluye volúmenes)
docker-compose down -v
```

---

## Deployment en Kubernetes

### Deployment YAML

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auguria-backend
  namespace: auguria
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auguria-backend
  template:
    metadata:
      labels:
        app: auguria-backend
    spec:
      containers:
        - name: backend
          image: auguria/backend:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: auguria-secrets
                  key: database-url
            - name: REDIS_HOST
              value: 'redis-service'
            - name: SWEPH_PATH
              value: '/usr/share/sweph'
          resources:
            requests:
              memory: '512Mi'
              cpu: '500m'
            limits:
              memory: '1Gi'
              cpu: '1000m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
```

---

## Monitoreo y Logging

### Prometheus Metrics

El módulo expone métricas en `/metrics`:

```
birth_chart_calculations_total
birth_chart_calculation_duration_seconds
birth_chart_cache_hit_ratio
birth_chart_ai_synthesis_errors_total
birth_chart_pdf_generation_duration_seconds
```

### Logs

Logs estructurados en formato JSON:

```bash
# Ver logs en tiempo real
pm2 logs auguria-api

# O con tail
tail -f logs/birth-chart.log

# Buscar errores
grep "ERROR" logs/birth-chart.log | tail -n 50
```

### Sentry (Opcional)

Configurar `SENTRY_DSN` en `.env` para tracking de errores en producción.

---

## Checklist de Deployment

- [ ] PostgreSQL 16+ instalado y configurado
- [ ] Redis instalado (opcional pero recomendado)
- [ ] Swiss Ephemeris descargado en `/usr/share/sweph`
- [ ] Variables de entorno configuradas en `.env`
- [ ] Migraciones ejecutadas (`npm run migration:run`)
- [ ] Seeders ejecutados (`npm run db:seed:interpretations`)
- [ ] Build de producción exitoso (`npm run build`)
- [ ] PM2 configurado con auto-restart
- [ ] Nginx configurado como reverse proxy
- [ ] SSL configurado con Let's Encrypt
- [ ] Firewall configurado (UFW)
- [ ] Monitoreo configurado (Prometheus/Grafana)
- [ ] Logs configurados y rotando
- [ ] Backups automáticos de BD configurados
- [ ] Healthchecks funcionando

---

## Rollback

En caso de problemas en producción:

```bash
# Rollback con PM2
pm2 stop auguria-api

# Volver a versión anterior
cd /var/www/auguria-api
git checkout <commit_hash_anterior>
npm ci
npm run build
npm run migration:revert  # Si hay cambios en BD
pm2 start auguria-api
```

---

**Última actualización:** 15 de febrero de 2026  
**Versión del módulo:** 1.0.0  
**Mantenedor:** Equipo Auguria
