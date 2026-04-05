# ADR: Estrategia de Deployment para Staging

**Fecha:** 2026-03-31
**Estado:** ✅ Aceptado — Railway seleccionado como plataforma de staging
**Contexto:** Seleccionar plataforma de hosting para staging (y futura producción) de Auguria

---

## Contexto

Auguria es un monorepo con:
- **Backend:** NestJS 11 (API REST, puerto 3000)
- **Frontend:** Next.js 16 con App Router (puerto 3001)
- **Base de datos:** PostgreSQL 16
- **Servicios externos:** Groq/Gemini (AI), MercadoPago (pagos con sandbox), SMTP (email), TimeZoneDB
- **Cron jobs:** ~10 tareas programadas (limpieza tokens, reset quotas, horoscopos, reconciliacion suscripciones)
- **Cache:** In-memory (sin Redis por ahora)

### Requisitos del staging

| Requisito | Detalle |
|-----------|---------|
| Usuarios | 4 testers |
| Disponibilidad | 24/7 |
| Acceso | Privado (no público) |
| MercadoPago | Modo sandbox activo |
| Webhooks MP | Necesita URL publica para recibir notificaciones |
| CI/CD | Deploy automático desde `main` |
| Experiencia DevOps | Mínima — se prioriza simplicidad |
| Evolución | Este staging sera base para producción |

### Dependencias de infraestructura

| Componente | Requerido | Notas |
|------------|-----------|-------|
| PostgreSQL 16 | Si | ~29 tablas, migraciónes TypeORM |
| Node.js 20 | Si | Backend + Frontend |
| Dominio custom + SSL | Si | Ya tienen dominio propio |
| Cron/Scheduler | Si | NestJS @nestjs/schedule (se ejecuta dentro del proceso) |
| Redis | No | Cache in-memory por ahora |
| File Storage (S3) | No | Imagenes por URL externa |
| Workers/Queues | No | Todo sincrono por ahora |

---

## Opciónes Evaluadas

### Opción A: Railway (RECOMENDADA)

**Railway** es un PaaS que permite desplegar servicios desde GitHub con deploy automático, sin configuración de servidores.

| Componente | Especificacion | Costo estimado |
|------------|---------------|----------------|
| Plan Pro (base) | Incluye $20 credito de uso | $20/mes |
| Backend (NestJS) | ~0.5 vCPU, 512MB RAM | ~$5-7/mes |
| Frontend (Next.js) | ~0.25 vCPU, 256MB RAM | ~$3-5/mes |
| PostgreSQL 16 | Managed, 1GB storage | ~$5-8/mes |
| **Total estimado** | | **$20-25/mes** (cubierto mayormente por el credito) |

**Pros:**
- Deploy desde GitHub en un click (conectas repo y listo)
- PostgreSQL managed incluido (backup, monitoring)
- Variables de entorno fáciles de configurar por UI
- Dominio custom + SSL automático
- Deploy automático al hacer push a `main`
- Logs en tiempo real desde el dashboard
- Los cron jobs de NestJS funcionan directamente (corren dentro del proceso)
- URL publica para webhooks de MercadoPago
- Escala fácilmente a producción sin migrar

**Contras:**
- No tiene restricción de acceso nativa (necesitas implementar proteccion a nivel app o usar un middleware)
- Si el consumo crece, los costos suben (pay-per-use)

**Restriccion de acceso para staging:**
- Opción 1: Variable de entorno `STAGING_PASSWORD` + middleware en NestJS/Next.js que pida password
- Opción 2: El frontend ya tiene autenticación — no registrar usuarios públicos (solo crear 4 cuentas manualmente via seed/API)
- Opción 3: Cloudflare Access (gratis hasta 50 usuarios) como proxy delante de Railway

**Setup estimado:** 1-2 horas

---

### Opción B: Render

**Render** es un PaaS similar a Railway con pricing fijo por servicio.

| Componente | Especificacion | Costo estimado |
|------------|---------------|----------------|
| Plan Professional | Fee por usuario | $19/mes |
| Backend (NestJS) | Starter 512MB | $7/mes |
| Frontend (Next.js) | Starter 512MB | $7/mes |
| PostgreSQL | Basic 256MB, 1GB storage | $7/mes |
| **Total estimado** | | **$33-40/mes** |

**Pros:**
- Interfaz muy intuitiva, similar a Railway
- Pricing predecible (fijo, no por uso)
- PostgreSQL managed incluido
- Deploy automático desde GitHub
- Dominio custom + SSL automático

**Contras:**
- Mas caro que Railway para este caso de uso
- Free PostgreSQL expira a los 30 dias (hay que pagar)
- Cold starts en el plan gratuito (no aplica al pago, pero algo a tener en cuenta)
- Fee por usuario ($19/mes) encarece vs Railway

**Setup estimado:** 1-2 horas

---

### Opción C: Vercel (frontend) + Railway (backend + DB)

**Arquitectura hibrida:** frontend en Vercel (optimizado para Next.js) y backend en Railway.

| Componente | Plataforma | Costo estimado |
|------------|-----------|----------------|
| Frontend (Next.js) | Vercel Pro | $20/mes/seat |
| Backend (NestJS) | Railway Pro | $20/mes (con credito) |
| PostgreSQL | Railway | incluido en credito |
| **Total estimado** | | **$25-35/mes** |

**Pros:**
- Vercel es la plataforma nativa de Next.js — maximo rendimiento
- Edge functions, ISR, image optimization optimizados
- Railway maneja bien el backend + DB

**Contras:**
- Dos plataformas separadas = mas complejidad operativa
- Vercel Hobby es solo para uso no comercial (necesitas Pro)
- Vercel Pro es $20/seat — se encarece con mas miembros
- CORS y networking entre plataformas requiere configuración adicional
- Mayor superficie de debugging cuando algo falla

**Setup estimado:** 2-3 horas

---

### Opción D: Coolify en Hetzner VPS

**Coolify** es un PaaS open-source auto-hosteado que instalas en tu propio VPS.

| Componente | Especificacion | Costo estimado |
|------------|---------------|----------------|
| Hetzner CX22 | 2 vCPU, 4GB RAM, 40GB SSD | ~€3.79/mes (~$4.15) |
| Coolify | Self-hosted (gratis) | $0 |
| PostgreSQL | Docker en el VPS | $0 (incluido en VPS) |
| Dominio + SSL | Let's Encrypt via Coolify | $0 |
| **Total estimado** | | **~$4-5/mes** |

**Pros:**
- Costo extremadamente bajo (~$4-5/mes para todo)
- Control total sobre la infraestructura
- Sin limites de uso — todo corre en tu VPS
- Coolify tiene UI similar a Railway/Render
- Deploy automático desde GitHub
- SSL automático via Let's Encrypt
- Un solo servidor = networking simple

**Contras:**
- Tu sos responsable de backups, updates, seguridad del servidor
- Si el VPS se cae, todo se cae (no hay redundancia)
- PostgreSQL sin managed backups (hay que configurar pg_dump + cron manualmente)
- 4GB RAM puede quedar justo con NestJS + Next.js + PostgreSQL corriendo juntos
- Requiere mas setup inicial (~3-4 horas) y conocimiento basico de SSH/Docker
- Debugging mas dificil sin soporte del proveedor
- Para escalar a producción, probablemente necesites migrar a un VPS mas grande o a un PaaS

**Setup estimado:** 3-4 horas

---

### Opción E: DigitalOcean App Platform

| Componente | Especificacion | Costo estimado |
|------------|---------------|----------------|
| Backend (NestJS) | Basic 512MB | $5/mes |
| Frontend (Next.js) | Basic 512MB | $5/mes |
| PostgreSQL Dev | 512MB, 10GB | $7/mes |
| **Total estimado** | | **$17-20/mes** |

**Pros:**
- Pricing claro y predecible
- Buena documentacion
- PostgreSQL managed con backups
- Deploy automático desde GitHub

**Contras:**
- Interfaz menos moderna que Railway/Render
- Menor ecosistema de templates/plugins
- Dev database tiene limitaciones (sin connection pooling, sin replicas)
- App Platform es menos flexible que Railway para monorepos

**Setup estimado:** 2-3 horas

---

### Opción F: Fly.io

| Componente | Especificacion | Costo estimado |
|------------|---------------|----------------|
| Backend (NestJS) | shared-1x, 256MB | ~$2/mes |
| Frontend (Next.js) | shared-1x, 256MB | ~$2/mes |
| PostgreSQL (Fly Postgres) | Single node, 1GB | ~$4/mes |
| IPv4 dedicada | Por app | $4/mes (2 apps) |
| **Total estimado** | | **$12-15/mes** |

**Pros:**
- Muy economico
- Deploy global (edge)
- Buena performance

**Contras:**
- Fly Postgres es self-managed (tu responsabilidad)
- Managed Postgres empieza en $38/mes (caro)
- CLI-first (menos UI amigable)
- Configuración mas compleja (fly.toml, etc.)
- Curva de aprendizaje mas alta que Railway/Render
- No ideal para poca experiencia DevOps

**Setup estimado:** 3-4 horas

---

## Matriz Comparativa

| Criterio (peso) | Railway | Render | Vercel+Railway | Coolify+Hetzner | DigitalOcean | Fly.io |
|---|---|---|---|---|---|---|
| **Costo/mes** | ~$20-25 | ~$33-40 | ~$25-35 | ~$4-5 | ~$17-20 | ~$12-15 |
| **Facilidad setup** (alta) | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ |
| **Facilidad operacion** (alta) | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ |
| **DB managed** (alta) | ★★★★★ | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ |
| **CI/CD nativo** (alta) | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **Escalabilidad a prod** (media) | ★★★★★ | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| **Soporte monorepo** (media) | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |
| **Restriccion acceso** (baja) | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★★☆☆ |

---

## Decisión: Railway (Opción A)

### Justificación

1. **Mínima fricción:** Railway esta disenado para devs con poca experiencia DevOps. Conectas GitHub, configuras variables de entorno, y tenes deploy automático.

2. **Todo en un lugar:** Backend, frontend y PostgreSQL en la misma plataforma. Sin networking entre servicios distintos.

3. **Costo razónable:** ~$20-25/mes, donde el credito de $20 del plan Pro cubre la mayor parte del uso. Para staging con 4 usuarios, el consumo sera bajo.

4. **Path a producción claro:** Cuando esten listos para producción, solo necesitan crear un nuevo environment en Railway (o escalar los recursos del existente). No hay migración.

5. **Webhooks de MercadoPago:** Railway genera URLs publicas automáticamente, lo que permite recibir webhooks de MP en modo sandbox sin configuración adicional.

6. **Cron jobs:** Los scheduled tasks de `@nestjs/schedule` corren dentro del proceso NestJS — no se necesita infraestructura adicional.

### Por que no las otras

| Opción | Razón de descarte |
|--------|-------------------|
| **Render** | Mas caro ($33-40/mes) por funcionalidad similar. Fee por usuario encarece. |
| **Vercel + Railway** | Dos plataformas = complejidad innecesaria. El frontend no necesita edge/ISR por ahora. |
| **Coolify + Hetzner** | Muy barato pero requiere mantener servidor, backups manuales, y mas conocimiento DevOps. Riesgo para poca experiencia. |
| **DigitalOcean** | Viable pero App Platform es menos pulido que Railway para monorepos. |
| **Fly.io** | CLI-first, PostgreSQL self-managed, curva de aprendizaje alta. No ideal para el perfil del equipo. |

---

## Plan de Implementacion

### Fase 1: Setup inicial (~2 horas)

1. **Crear cuenta Railway** en [railway.com](https://railway.com) (plan Pro, $20/mes)
2. **Conectar repositorio GitHub** (ArielDRighi/tarot)
3. **Crear proyecto** con 3 servicios:
   - Servicio 1: PostgreSQL (un click desde template)
   - Servicio 2: Backend NestJS (apuntar a `backend/tarot-app/`, branch `main`)
   - Servicio 3: Frontend Next.js (apuntar a `frontend/`, branch `main`)

### Fase 2: Configuración (~1 hora)

4. **Variables de entorno del backend:**
   ```
   NODE_ENV=staging
   PORT=3000
   
   # Database (Railway auto-genera estas con el plugin PostgreSQL)
   TAROT_DB_HOST=${{Postgres.PGHOST}}
   TAROT_DB_PORT=${{Postgres.PGPORT}}
   TAROT_DB_USER=${{Postgres.PGUSER}}
   TAROT_DB_PASSWORD=${{Postgres.PGPASSWORD}}
   TAROT_DB_NAME=${{Postgres.PGDATABASE}}
   
   # Auth
   JWT_SECRET=<generar con openssl rand -hex 32>
   
   # AI (requerido)
   GROQ_API_KEY=<tu key>
   GEMINI_API_KEY=<tu key>
   
   # MercadoPago Sandbox
   MP_ACCESS_TOKEN=<test access token de MP>
   MP_WEBHOOK_SECRET=<webhook secret de MP>
   MP_PREAPPROVAL_PLAN_ID=<plan ID sandbox>
   
   # URLs
   BACKEND_URL=https://backend-staging.tudominio.com
   FRONTEND_URL=https://staging.tudominio.com
   CORS_ORIGINS=https://staging.tudominio.com
   
   # Email (opciónal — usar Mailtrap para staging)
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_USER=<mailtrap user>
   SMTP_PASS=<mailtrap pass>
   EMAIL_FROM=noreply@auguria.com
   ```

5. **Variables de entorno del frontend:**
   ```
   NEXT_PUBLIC_API_URL=https://backend-staging.tudominio.com/api
   NEXT_PUBLIC_APP_ENV=staging
   NEXT_PUBLIC_APP_URL=https://staging.tudominio.com
   ```

6. **Dominio custom:**
   - Configurar `staging.tudominio.com` → frontend
   - Configurar `backend-staging.tudominio.com` → backend
   - Railway genera certificados SSL automáticamente

### Fase 3: CI/CD

7. **Deploy automático:** Railway detecta pushes a `main` y redespliega automáticamente. No necesitas GitHub Actions adicionales para el deploy.

### Fase 4: Restriccion de acceso

8. **Opción recomendada — Cloudflare Access (gratis):**
   - Mover DNS a Cloudflare (gratis)
   - Crear Access Policy: solo permitir los 4 emails del equipo
   - Cualquier persona que acceda vera una pantalla de login de Cloudflare antes de llegar a la app
   - No requiere cambios en el codigo

### Fase 5: Seed y testing

9. Ejecutar migraciónes: `npm run migration:run`
10. Crear 4 cuentas de usuario para el equipo
11. Configurar webhook de MP sandbox apuntando a `https://backend-staging.tudominio.com/api/payments/webhook`
12. Testear flujo completo: registro → login → lectura tarot → suscripcion premium → pago MP sandbox

---

## Costos Proyectados

| Fase | Servicio | Costo/mes |
|------|----------|-----------|
| **Staging (ahora)** | Railway Pro | ~$20-25 |
| **Staging + Cloudflare** | Railway Pro + Cloudflare Free | ~$20-25 |
| **Producción (futuro)** | Railway Pro (mas recursos) | ~$30-60 (estimado) |

### Costos fijos externos (no dependen de la plataforma)

| Servicio | Costo | Notas |
|----------|-------|-------|
| Dominio | ~$10-15/ano | Ya lo tienen |
| Groq API | Gratis | Free tier: 14,400 req/dia |
| Gemini API | Gratis | Free tier: 1,500 req/dia |
| MercadoPago | Gratis (sandbox) | En producción: comision por transaccion |
| Mailtrap | Gratis | Free tier: 500 emails/mes |
| Cloudflare | Gratis | Free tier: 50 usuarios Access |

---

## Escalabilidad a Largo Plazo

Railway es la opción correcta para staging y producción inicial, pero **no es ideal para alta escala (millones de visitas/mes)**. Sus limitaciones principales a gran escala son:

- **Sin auto-scaling horizontal** — se puede escalar verticalmente (mas CPU/RAM) pero no lanzar multiples instancias automáticamente segun demanda
- **Sin load balancer nativo** entre multiples instancias del mismo servicio
- **Costos se disparan** — el modelo pay-per-use se vuelve caro vs infraestructura dedicada
- **Sin CDN integrado** — se necesitaria Cloudflare u otro CDN de todas formas
- **Sin Redis managed** — necesario para cache distribuido y sesiones al escalar horizontalmente

### Path de crecimiento recomendado

| Fase | Escala | Plataforma | Costo estimado |
|------|--------|-----------|----------------|
| Staging | 4 usuarios | Railway | ~$20-25/mes |
| Producción inicial | 1K-50K visitas/mes | Railway | ~$30-60/mes |
| Crecimiento | 50K-500K visitas/mes | AWS/GCP con containers | ~$100-300/mes |
| Alta escala | 1M+ visitas/mes | AWS ECS/EKS o GCP Cloud Run | ~$300-1000+/mes |

### Por que no es un problema empezar con Railway

La migración futura no es traumatica porque:
1. La app ya es containerizable (NestJS + Next.js estandar)
2. La base de datos se migra con `pg_dump`/`pg_restore`
3. Las variables de entorno son las mismas en cualquier plataforma
4. Solo cambia el hosting, no el codigo

Optimizar para millones de visitas hoy seria over-engineering. Cuando el trafico lo justifique, migrar a AWS/GCP con ayuda de alguien con experiencia DevOps es una decision natural y el esfuerzo es moderado (~1-2 dias de trabajo).

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| Costo Railway crece inesperadamente | Baja | Configurar alertas de billing. Con 4 usuarios el consumo sera minimo. |
| PostgreSQL sin backups automáticos en Railway | Baja | Railway incluye backups diarios en el plan Pro. |
| Caida del servicio | Baja | Railway tiene 99.9% uptime SLA en Pro. Para staging es aceptable. |
| Cold starts | Media | Railway mantiene servicios activos en plan pago (no hay cold starts). |

---

## Fuentes

- [Railway Pricing](https://railway.com/pricing)
- [Railway Docs - Plans](https://docs.railway.com/pricing/plans)
- [Render Pricing](https://render.com/pricing)
- [Render PostgreSQL Plans](https://render.com/docs/postgresql-refresh)
- [Vercel Pricing](https://vercel.com/pricing)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [DigitalOcean App Platform Pricing](https://www.digitalocean.com/pricing/app-platform)
- [Coolify](https://coolify.io/pricing)
- [Hetzner Cloud](https://www.hetzner.com/cloud)
- [Railway Pricing Breakdown 2026](https://servercompass.app/blog/railway-pricing-what-youll-actually-pay)
- [Coolify + Hetzner Guide](https://medium.com/@kapildevkhatik2/escaping-paas-pricing-deploying-a-next-js-full-stack-app-on-hetzner-with-coolify-0e1024931c23)
