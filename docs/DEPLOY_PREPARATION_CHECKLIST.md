# Preparacion del Proyecto para Deploy

**Fecha:** 2026-03-31
**Estado:** Pendiente
**Objetivo:** Limpiar, organizar y preparar el monorepo Auguria para deploy en staging (Railway)

---

## Resumen Ejecutivo

El proyecto esta funcionalmente listo pero tiene deuda tecnica acumulada: archivos temporales, documentos obsoletos, falta de Dockerfiles, y configuraciones hardcodeadas para localhost. Este documento lista **todo lo que hay que hacer** organizado por prioridad.

---

## P0 — CRITICO (bloquea deploy)

### 1. Crear Dockerfiles de produccion

No existen Dockerfiles para ninguno de los dos servicios. Railway puede buildear sin ellos (usa Nixpacks), pero tener Dockerfiles propios da control y reproducibilidad.

**Archivos a crear:**

- [ ] `backend/tarot-app/Dockerfile`
- [ ] `frontend/Dockerfile`
- [ ] `.dockerignore` (raiz, para excluir node_modules, .git, docs, tests)

### 2. Verificar que .env NO este en el historial de git

El `.env` del backend contiene API keys reales (Groq, Gemini, MercadoPago, JWT secret). Aunque esta en `.gitignore`, si alguna vez fue commiteado, las keys estan expuestas en el historial.

- [ ] Verificar: `git log --all --full-history -- backend/tarot-app/.env`
- [ ] Si aparece en el historial: regenerar TODAS las API keys y secrets
- [ ] Considerar usar `git filter-repo` para limpiar el historial (operacion destructiva, hacer backup antes)

**Keys a regenerar si fueron expuestas:**
- `JWT_SECRET`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `TIMEZONEDB_API_KEY`
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`
- `TAROT_DB_PASSWORD`

### 3. Eliminar fallbacks a localhost en codigo de produccion

Multiples archivos tienen `localhost` como fallback cuando falta una variable de entorno. En produccion esto causa errores silenciosos.

**Backend — archivos afectados:**

- [ ] `backend/tarot-app/src/config/env.validation.ts` — CORS_ORIGINS y FRONTEND_URL defaultean a localhost
- [ ] `backend/tarot-app/src/modules/ai-usage/ai-quota.service.ts` — fallback a localhost:3000
- [ ] `backend/tarot-app/src/modules/email/email.service.ts` — URL de reset password con localhost
- [ ] `backend/tarot-app/src/modules/holistic-services/application/use-cases/create-purchase.use-case.ts` — multiples localhost
- [ ] `backend/tarot-app/src/modules/holistic-services/application/use-cases/process-mercadopago-webhook.use-case.ts` — localhost fallback
- [ ] `backend/tarot-app/src/main.ts` (linea ~112) — Swagger server URL hardcodeada

**Accion:** Cambiar los defaults de localhost por variables de entorno requeridas. Si la variable no existe en produccion, el servicio debe fallar al arrancar con un error claro, no usar localhost silenciosamente.

**Frontend — archivos afectados:**

- [ ] `frontend/.env.example` — desactualizado (falta `/v1` en API URL)

---

## P1 — ALTO (necesario antes de staging)

### 4. Eliminar archivos temporales y de debug del repositorio

**Raiz del proyecto — 17 archivos de analisis/planning a eliminar:**

Estos son documentos one-shot creados durante desarrollo que no aportan valor en el repo:

- [ ] `ANALISIS_ANY_TYPESCRIPT.md`
- [ ] `ANALISIS_BACKEND_VS_FRONTEND.md`
- [ ] `ANALISIS_BUGS_LIMITES.md`
- [ ] `ANALISIS_LIMITES_PROBLEMA.md`
- [ ] `BUGFIX_DAILY_LIMITS.md`
- [ ] `CAMBIOS_LECTURA_FREE_IMPACT.md`
- [ ] `FLUJO_LECTURA_CORRECTO.md` (53KB)
- [ ] `PLAN_BUG_CACHE_SESSION.md`
- [ ] `PLAN_IMPLEMENTACION_LIMITES.md`
- [ ] `PLAN_REMEDIACION_ANY.md` (39KB)
- [ ] `PR_FEEDBACK_RESPONSE_A003.md`
- [ ] `PR_FEEDBACK_RESPONSE_BUGFIX_DAILY_LIMITS.md`
- [ ] `REMOVAL_DELETE_FUNCTIONALITY.md`
- [ ] `RESUMEN_EXPLORACION_E2E.md`
- [ ] `TASK-REFACTOR-011-COMPLETED.md`
- [ ] `TASK-T-CA-052-PDF-QUALITY-ANALYSIS.md`
- [ ] `TASK-T-CA-052-REMEDIATION.md`

**Backend — archivos a eliminar:**

- [ ] `backend/tarot-app/backup_before_task002_20251220_120428.sql` — backup SQL viejo
- [ ] `backend/tarot-app/backup_before_task002_20251220_131923.sql` — backup SQL viejo
- [ ] `backend/tarot-app/reset-pendulum-usage.sql` — script one-time
- [ ] `backend/tarot-app/update-ritual-images.sql` — script one-time
- [ ] `backend/tarot-app/server.pid` — archivo de proceso (agregar a .gitignore)
- [ ] `backend/tarot-app/test-output.log` (563KB) — output de tests
- [ ] `backend/tarot-app/test-results.txt` (419KB) — output de tests
- [ ] `backend/tarot-app/eslint-any-report.txt` — reporte temporal
- [ ] `backend/tarot-app/HALLAZGOS_VALIDACION_T-CA-001-013.md` — doc temporal

**Frontend — archivos a eliminar:**

- [ ] `frontend/test-output.txt` (356KB) — output de tests
- [ ] `frontend/tsconfig.tsbuildinfo` (587KB) — cache de build (ya en .gitignore pero trackeado)

**Frontend — assets innecesarios:**

- [ ] `frontend/public/vercel.svg` — boilerplate de Next.js, no se usa
- [ ] `frontend/public/next.svg` — boilerplate de Next.js, no se usa

### 5. Eliminar dependencias no usadas del frontend

- [ ] `baseline-browser-mapping` — no se usa en ningun archivo
- [ ] `tw-animate-css` — no se usa en ningun archivo

```bash
cd frontend && npm uninstall baseline-browser-mapping tw-animate-css
```

### 6. Limpiar docs/ — eliminar duplicados y documentos obsoletos

**Eliminar:**

- [ ] `docs/BACKLOG_CARTA_ASTRAL_BKP.md` (568KB) — backup explicito, reemplazado por V2
- [ ] `docs/BUSINESS_PLAN_AI_COSTS.pdf` (3.8MB) — duplicado del .md
- [ ] `docs/preguntas_new_features.md` — Q&A historico, ya implementado

**Mover a `docs/archive/` (backlogs completados):**

- [ ] `docs/BACKLOG_CARTA_ASTRAL.md` (586KB) — mayormente completado, reemplazado por V2
- [ ] `docs/BACKLOG_HOROSCOPO_CHINO.md` — marcado como completado
- [ ] `docs/BACKLOG_PREMIUM_SUBSCRIPTIONS.md` — 22/22 tareas completadas

### 7. Actualizar .gitignore

Agregar entradas faltantes:

- [ ] `server.pid`
- [ ] `test-output.*`
- [ ] `eslint-any-report.txt`
- [ ] `*.sql` en backend (backups sueltos)

---

## P2 — MEDIO (recomendado antes de produccion)

### 8. Limpiar console.log/console.error del frontend

14 instancias en 11 archivos. Reemplazar con logging condicional o servicio de error tracking.

**Archivos afectados:**

- [ ] `frontend/src/components/features/readings/UpgradeModal.tsx:89`
- [ ] `frontend/src/components/features/readings/UpgradeBanner.tsx`
- [ ] `frontend/src/components/features/readings/ReadingExperience.tsx:445`
- [ ] `frontend/src/components/features/readings/ReadingsHistory.tsx:171`
- [ ] `frontend/src/components/features/birth-chart/AISynthesis/AISynthesis.tsx:65`
- [ ] `frontend/src/components/features/birth-chart/ChartResultPageContent/ChartResultPageContent.tsx:92`
- [ ] `frontend/src/components/features/contact/ContactForm.tsx:59,69`
- [ ] `frontend/src/lib/utils/chinese-zodiac.ts:227`

### 9. Resolver TODOs criticos del frontend

Paginas con contenido placeholder que no deberian estar en produccion:

- [ ] `frontend/src/app/privacidad/page.tsx` — "TODO: Reemplazar con contenido legal real"
- [ ] `frontend/src/app/terminos/page.tsx` — "TODO: Reemplazar con contenido legal real"
- [ ] `frontend/src/app/contacto/page.tsx` — "TODO: Implementar envio real de correo"

### 10. Organizar scripts SQL del backend

Mover scripts de debug/test a subcarpeta:

- [ ] `backend/tarot-app/scripts/reset-limits-*.sql` → `scripts/debug/`
- [ ] `backend/tarot-app/scripts/reset-test-users-limits.sql` → `scripts/debug/`
- [ ] `backend/tarot-app/scripts/check-birth-chart.sql` → `scripts/debug/`
- [ ] `backend/tarot-app/scripts/clean-test-user.sql` → `scripts/debug/`
- [ ] `backend/tarot-app/scripts/verify-cards-content.sql` → `scripts/debug/`

### 11. Actualizar .env.example del frontend

El archivo actual esta desactualizado:

```
# Actual (incorrecto):
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Correcto:
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

### 12. Actualizar GitHub Actions

- [ ] `architecture-validation.yml` usa `actions/checkout@v3` y `actions/setup-node@v3` — actualizar a v4

---

## P3 — BAJO (nice to have)

### 13. Agregar archivo LICENSE

No existe archivo de licencia en el repositorio. Si el proyecto va a ser publico o si se trabaja con terceros, es necesario.

- [ ] Crear `LICENSE` (MIT, Apache 2.0, o propietario segun corresponda)

### 14. Considerar error tracking

Para produccion, reemplazar console.error con un servicio como Sentry:

- [ ] Evaluar Sentry free tier (5K events/mes gratis)
- [ ] Agregar `NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_DSN` a .env.example

### 15. Documentar proceso de deploy

- [ ] Agregar seccion de deployment al README.md
- [ ] Documentar variables de entorno requeridas para produccion

### 16. Seguridad de tokens en frontend

Los tokens JWT se guardan en `localStorage` (vulnerable a XSS). Para produccion considerar migrar a `httpOnly cookies` (requiere cambios en backend).

- [ ] Evaluar migracion a httpOnly cookies

---

## Resumen de Impacto

| Accion | Archivos afectados | Espacio liberado | Tiempo estimado |
|--------|-------------------|-----------------|-----------------|
| Eliminar docs raiz | 17 archivos | ~430KB | 15 min |
| Eliminar archivos temp backend | 9 archivos | ~1MB | 15 min |
| Eliminar archivos temp frontend | 4 archivos | ~950KB | 10 min |
| Limpiar docs/ | 6 archivos | ~5MB | 15 min |
| Crear Dockerfiles | 3 archivos nuevos | — | 1-2 horas |
| Eliminar localhost fallbacks | ~6 archivos | — | 1 hora |
| Limpiar console.logs | 11 archivos | — | 30 min |
| Resto de tareas | varios | — | 2-3 horas |
| **TOTAL** | | **~7.4MB liberados** | **~6-8 horas** |

---

## Orden de Ejecucion Sugerido

1. **Verificar historial de .env** y regenerar keys si es necesario
2. **Eliminar todos los archivos innecesarios** (una sola branch de limpieza)
3. **Actualizar .gitignore** para prevenir futuros archivos basura
4. **Eliminar localhost fallbacks** del codigo
5. **Crear Dockerfiles** de produccion
6. **Limpiar console.logs** y resolver TODOs criticos
7. **Desplegar en Railway** siguiendo el ADR
