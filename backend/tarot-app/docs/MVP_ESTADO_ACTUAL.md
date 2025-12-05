# 🎯 Estado del MVP - TarotFlavia

**Última actualización:** 2 de Diciembre, 2025  
**Proyecto:** TarotFlavia - Plataforma de Lecturas de Tarot con IA  
**Estado general:** Backend ~95% completado | Frontend 0%

---

## 📊 Resumen Ejecutivo

### Métricas del Backend

| Métrica                   | Valor        |
| ------------------------- | ------------ |
| **Módulos NestJS**        | 27           |
| **Entidades (tablas DB)** | 29           |
| **Controllers**           | 34           |
| **Rutas base API**        | 32           |
| **Tests unitarios**       | 147 archivos |
| **Tests E2E/Integración** | 72 archivos  |
| **Tareas completadas**    | 55+          |

### Stack Tecnológico

- **Framework:** NestJS 10.x (Node.js + TypeScript)
- **Base de datos:** PostgreSQL 16 (Docker, puerto 5435)
- **ORM:** TypeORM 0.3.x
- **IA Principal:** Groq (Llama 3.1 70B Versatile)
- **IA Fallback:** OpenAI GPT-4 Turbo → DeepSeek Chat
- **Autenticación:** JWT + Refresh Tokens
- **Testing:** Jest (TDD)
- **Documentación API:** Swagger/OpenAPI (http://localhost:3000/api/docs)

---

## ✅ Funcionalidades Implementadas (MVP Ready)

### 1. 🔐 Sistema de Autenticación

- ✅ Registro de usuarios con validación
- ✅ Login con JWT tokens
- ✅ Refresh tokens para sesiones persistentes
- ✅ Recuperación de contraseña por email
- ✅ Guards de autenticación y autorización
- ✅ Sistema de roles (Consumer, Tarotist, Admin)

### 2. 👤 Gestión de Usuarios

- ✅ Perfiles de usuario completos
- ✅ Sistema de planes (Guest, Free, Premium, Professional)
- ✅ Gestión de suscripciones
- ✅ Tracking de uso de IA por usuario
- ✅ Panel de administración de usuarios

### 3. 🃏 Sistema de Tarot Completo

- ✅ **78 cartas** del Rider-Waite con significados completos
- ✅ **Mazos** configurables (Rider-Waite como default)
- ✅ **4 tipos de tiradas (spreads):**
  - 1 carta (respuesta rápida) - `beginner`
  - 3 cartas (pasado-presente-futuro) - `beginner`
  - 5 cartas (análisis profundo) - `intermediate`
  - 10 cartas (Cruz Céltica) - `advanced`
- ✅ Posiciones con significados y `interpretation_focus`
- ✅ Cartas derechas (`upright`) e invertidas (`reversed`)
- ✅ Keywords, descripción, whenToUse por spread

### 4. 📖 Lecturas de Tarot

- ✅ Creación de lecturas con selección aleatoria de cartas
- ✅ **Sistema híbrido de preguntas:**
  - **Free:** Preguntas predefinidas por categoría
  - **Premium:** Preguntas personalizadas libres
- ✅ Historial de lecturas por usuario
- ✅ Soft-delete de lecturas
- ✅ Compartir lecturas públicamente (token único)
- ✅ Contador de visualizaciones

### 5. 🤖 Interpretaciones con IA

- ✅ Generación de interpretaciones personalizadas
- ✅ **Multi-provider:** Groq → OpenAI → DeepSeek (fallback)
- ✅ Prompts optimizados para tarot
- ✅ Caché de interpretaciones
- ✅ Regeneración de interpretaciones (Premium)
- ✅ Logging de uso y costos de IA

### 6. 📂 Categorías y Preguntas

- ✅ **6 categorías de consulta:**
  - ❤️ Amor y Relaciones
  - 💼 Carrera y Trabajo
  - 💰 Dinero y Finanzas
  - 🏥 Salud y Bienestar
  - ✨ Crecimiento Espiritual
  - 🌟 Consulta General
- ✅ **43 preguntas predefinidas** distribuidas por categoría
- ✅ Iconos, colores y orden por categoría
- ✅ Toggle active/inactive por categoría y pregunta

### 7. 📊 Sistema de Límites de Uso

- ✅ Límites diarios por plan:
  - **Free:** 3 lecturas/día
  - **Premium:** 50 lecturas/día
  - **Professional:** Ilimitado
- ✅ Guard y Decorator `@CheckUsageLimit`
- ✅ Reset automático diario

### 8. 🛡️ Rate Limiting y Seguridad

- ✅ Rate limiting global (100 req/min)
- ✅ Límites específicos por endpoint
- ✅ Bloqueo automático de IPs abusivas
- ✅ IP Whitelist para admins
- ✅ Headers X-RateLimit-\* en respuestas
- ✅ Logging de eventos de seguridad
- ✅ Auditoría de acciones admin

### 9. 🔮 Carta del Día

- ✅ Generación diaria por usuario
- ✅ Una carta por día por tarotista seleccionado
- ✅ Interpretación personalizada con IA
- ✅ Historial de cartas diarias
- ✅ Regeneración disponible (Premium only)

### 10. 👩‍🔮 Sistema de Tarotistas (Marketplace)

- ✅ Perfiles de tarotistas completos
- ✅ Especialidades e idiomas
- ✅ Sistema de reviews y ratings
- ✅ Configuración personalizada de IA
- ✅ Significados de cartas personalizados
- ✅ Métricas de revenue
- ✅ Aplicaciones para ser tarotista
- ✅ Gestión admin de tarotistas

### 11. 📅 Sistema de Scheduling

- ✅ **Disponibilidad de tarotistas:**
  - Disponibilidad semanal por día (lunes-domingo)
  - Horarios de inicio y fin configurables
  - Excepciones para días específicos (vacaciones, bloqueos)
- ✅ **Gestión de sesiones:**
  - Reserva con duración: 30, 60 o 90 minutos
  - Estados: `pending`, `confirmed`, `completed`, `cancelled`, `no_show`
  - Cancelación con mínimo 24 horas de anticipación
  - Confirmación por parte del tarotista
- ✅ Integración con Google Meet (link generado automáticamente)
- ✅ Validación de conflictos de horarios

### 12. 💳 Suscripciones

- ✅ Gestión de suscripciones a tarotistas
- ✅ Estados de suscripción
- ✅ Preparado para Stripe (pendiente integración)

### 13. 📧 Sistema de Email

- ✅ Configuración Nodemailer
- ✅ Templates de email
- ✅ Recuperación de contraseña
- ✅ Notificaciones

### 14. 🏥 Health Checks

- ✅ Health check general
- ✅ Health check de IA providers
- ✅ Monitoreo de disponibilidad

### 15. 📈 Panel de Administración

- ✅ Dashboard con métricas
- ✅ Gestión de usuarios (ban, roles, planes)
- ✅ Gestión de lecturas
- ✅ Gestión de tarotistas
- ✅ Logs de auditoría
- ✅ Eventos de seguridad
- ✅ Gestión de rate limits
- ✅ Gestión de caché
- ✅ Uso de IA y costos

---

## 📡 Endpoints API Completos

> **Base URL:** `http://localhost:3000/api`  
> **Documentación Swagger:** `http://localhost:3000/api/docs`

### 🔐 Autenticación (`/auth`)

| Método | Endpoint                | Descripción                   | Auth |
| ------ | ----------------------- | ----------------------------- | ---- |
| POST   | `/auth/register`        | Registro de usuario           | ❌   |
| POST   | `/auth/login`           | Login (retorna JWT + refresh) | ❌   |
| POST   | `/auth/refresh`         | Renovar access token          | ❌   |
| POST   | `/auth/logout`          | Cerrar sesión actual          | ✅   |
| POST   | `/auth/logout-all`      | Cerrar todas las sesiones     | ✅   |
| POST   | `/auth/forgot-password` | Solicitar reset de password   | ❌   |
| POST   | `/auth/reset-password`  | Resetear password con token   | ❌   |

### 👤 Usuarios (`/users`)

| Método | Endpoint                    | Descripción             | Auth     |
| ------ | --------------------------- | ----------------------- | -------- |
| GET    | `/users/profile`            | Obtener mi perfil       | ✅       |
| PATCH  | `/users/profile`            | Actualizar mi perfil    | ✅       |
| GET    | `/users`                    | Listar usuarios (admin) | 🔒 Admin |
| GET    | `/users/:id`                | Ver usuario específico  | ✅       |
| DELETE | `/users/:id`                | Eliminar usuario        | 🔒 Admin |
| PATCH  | `/users/:id/plan`           | Cambiar plan de usuario | 🔒 Admin |
| POST   | `/users/:id/roles/tarotist` | Asignar rol tarotista   | 🔒 Admin |
| POST   | `/users/:id/roles/admin`    | Asignar rol admin       | 🔒 Admin |
| DELETE | `/users/:id/roles/:role`    | Quitar rol              | 🔒 Admin |

### 🃏 Cartas (`/cards`)

| Método | Endpoint              | Descripción                  | Auth     |
| ------ | --------------------- | ---------------------------- | -------- |
| GET    | `/cards`              | Listar todas las cartas (78) | ❌       |
| GET    | `/cards/:id`          | Ver carta específica         | ❌       |
| GET    | `/cards/deck/:deckId` | Cartas de un mazo            | ❌       |
| POST   | `/cards`              | Crear carta                  | 🔒 Admin |
| PATCH  | `/cards/:id`          | Actualizar carta             | 🔒 Admin |
| DELETE | `/cards/:id`          | Eliminar carta               | 🔒 Admin |

### 🎴 Mazos (`/decks`)

| Método | Endpoint         | Descripción              | Auth     |
| ------ | ---------------- | ------------------------ | -------- |
| GET    | `/decks`         | Listar mazos disponibles | ❌       |
| GET    | `/decks/default` | Obtener mazo por defecto | ❌       |
| GET    | `/decks/:id`     | Ver mazo específico      | ❌       |
| POST   | `/decks`         | Crear mazo               | 🔒 Admin |
| PATCH  | `/decks/:id`     | Actualizar mazo          | 🔒 Admin |
| DELETE | `/decks/:id`     | Eliminar mazo            | 🔒 Admin |

### 📋 Tiradas (`/spreads`)

| Método | Endpoint       | Descripción              | Auth     |
| ------ | -------------- | ------------------------ | -------- |
| GET    | `/spreads`     | Listar tiradas (4 tipos) | ❌       |
| GET    | `/spreads/:id` | Ver tirada específica    | ❌       |
| POST   | `/spreads`     | Crear tirada             | 🔒 Admin |
| PATCH  | `/spreads/:id` | Actualizar tirada        | 🔒 Admin |
| DELETE | `/spreads/:id` | Eliminar tirada          | 🔒 Admin |

### 📂 Categorías (`/categories`)

| Método | Endpoint                        | Descripción           | Auth     |
| ------ | ------------------------------- | --------------------- | -------- |
| GET    | `/categories`                   | Listar categorías (6) | ❌       |
| GET    | `/categories/slug/:slug`        | Buscar por slug       | ❌       |
| GET    | `/categories/:id`               | Ver categoría         | ❌       |
| POST   | `/categories`                   | Crear categoría       | 🔒 Admin |
| PATCH  | `/categories/:id`               | Actualizar categoría  | 🔒 Admin |
| DELETE | `/categories/:id`               | Eliminar categoría    | 🔒 Admin |
| PATCH  | `/categories/:id/toggle-active` | Activar/desactivar    | 🔒 Admin |

### ❓ Preguntas Predefinidas (`/predefined-questions`)

| Método | Endpoint                    | Descripción                 | Auth     |
| ------ | --------------------------- | --------------------------- | -------- |
| GET    | `/predefined-questions`     | Listar preguntas (43 total) | ❌       |
| GET    | `/predefined-questions/:id` | Ver pregunta                | ❌       |
| POST   | `/predefined-questions`     | Crear pregunta              | 🔒 Admin |
| PATCH  | `/predefined-questions/:id` | Actualizar pregunta         | 🔒 Admin |
| DELETE | `/predefined-questions/:id` | Eliminar pregunta           | 🔒 Admin |

### 📖 Lecturas (`/readings`)

| Método | Endpoint                   | Descripción                        | Auth         |
| ------ | -------------------------- | ---------------------------------- | ------------ |
| POST   | `/readings`                | Crear nueva lectura                | ✅ + Límites |
| GET    | `/readings`                | Historial de mis lecturas          | ✅           |
| GET    | `/readings/trash`          | Lecturas eliminadas (papelera)     | ✅           |
| GET    | `/readings/:id`            | Ver lectura específica             | ✅           |
| POST   | `/readings/:id/regenerate` | Regenerar interpretación (Premium) | ✅ Premium   |
| DELETE | `/readings/:id`            | Eliminar lectura (soft delete)     | ✅           |
| POST   | `/readings/:id/restore`    | Restaurar lectura                  | ✅           |
| POST   | `/readings/:id/share`      | Generar link compartido            | ✅           |
| DELETE | `/readings/:id/unshare`    | Quitar link compartido             | ✅           |

### 🔗 Lecturas Compartidas

| Método | Endpoint                     | Descripción               | Auth |
| ------ | ---------------------------- | ------------------------- | ---- |
| GET    | `/shared/:token`             | Ver lectura compartida    | ❌   |
| POST   | `/readings/:id/share/email`  | Compartir por email       | ✅   |
| POST   | `/readings/:id/share/social` | Links para redes sociales | ✅   |

### 🧠 Interpretaciones (`/interpretations`)

| Método | Endpoint                             | Descripción               | Auth         |
| ------ | ------------------------------------ | ------------------------- | ------------ |
| POST   | `/interpretations/generate`          | Generar interpretación IA | ✅ + AIQuota |
| DELETE | `/interpretations/admin/cache`       | Limpiar caché             | 🔒 Admin     |
| GET    | `/interpretations/admin/cache/stats` | Estadísticas caché        | 🔒 Admin     |

### 🌅 Lectura Diaria (`/daily-reading`)

| Método | Endpoint                    | Descripción                 | Auth       |
| ------ | --------------------------- | --------------------------- | ---------- |
| POST   | `/daily-reading`            | Obtener/crear carta del día | ✅         |
| GET    | `/daily-reading/today`      | Ver carta del día actual    | ✅         |
| GET    | `/daily-reading/history`    | Historial de cartas diarias | ✅         |
| POST   | `/daily-reading/regenerate` | Regenerar (Premium)         | ✅ Premium |

### 💳 Suscripciones (`/subscriptions`)

| Método | Endpoint                           | Descripción                   | Auth       |
| ------ | ---------------------------------- | ----------------------------- | ---------- |
| POST   | `/subscriptions/set-favorite`      | Establecer tarotista favorito | ✅         |
| GET    | `/subscriptions/my-subscription`   | Ver mi suscripción            | ✅         |
| POST   | `/subscriptions/enable-all-access` | Activar all-access (Premium+) | ✅ Premium |

### 👩‍🔮 Tarotistas Públicos (`/tarotistas`)

| Método | Endpoint          | Descripción               | Auth |
| ------ | ----------------- | ------------------------- | ---- |
| GET    | `/tarotistas`     | Listar tarotistas activos | ❌   |
| GET    | `/tarotistas/:id` | Ver perfil público        | ❌   |

### 📊 Métricas de Tarotistas (`/tarotistas/metrics`)

| Método | Endpoint                        | Descripción                     | Auth        |
| ------ | ------------------------------- | ------------------------------- | ----------- |
| GET    | `/tarotistas/metrics/tarotista` | Métricas del tarotista logueado | ✅ Tarotist |
| GET    | `/tarotistas/metrics/platform`  | Métricas de plataforma          | 🔒 Admin    |

### 📈 Reportes (`/tarotistas/reports`)

| Método | Endpoint                     | Descripción      | Auth     |
| ------ | ---------------------------- | ---------------- | -------- |
| POST   | `/tarotistas/reports/export` | Exportar reporte | 🔒 Admin |

### 📅 Scheduling - Usuario (`/scheduling`)

| Método | Endpoint                             | Descripción               | Auth |
| ------ | ------------------------------------ | ------------------------- | ---- |
| GET    | `/scheduling/available-slots`        | Obtener slots disponibles | ✅   |
| POST   | `/scheduling/book`                   | Reservar sesión           | ✅   |
| GET    | `/scheduling/my-sessions`            | Mis sesiones reservadas   | ✅   |
| GET    | `/scheduling/my-sessions/:id`        | Detalle de sesión         | ✅   |
| POST   | `/scheduling/my-sessions/:id/cancel` | Cancelar sesión           | ✅   |

### 📅 Scheduling - Tarotista (`/tarotist/scheduling`)

| Método | Endpoint                                           | Descripción                 | Auth        |
| ------ | -------------------------------------------------- | --------------------------- | ----------- |
| GET    | `/tarotist/scheduling/availability/weekly`         | Mi disponibilidad semanal   | ✅ Tarotist |
| POST   | `/tarotist/scheduling/availability/weekly`         | Establecer disponibilidad   | ✅ Tarotist |
| DELETE | `/tarotist/scheduling/availability/weekly/:id`     | Eliminar disponibilidad     | ✅ Tarotist |
| GET    | `/tarotist/scheduling/availability/exceptions`     | Listar excepciones          | ✅ Tarotist |
| POST   | `/tarotist/scheduling/availability/exceptions`     | Agregar excepción           | ✅ Tarotist |
| DELETE | `/tarotist/scheduling/availability/exceptions/:id` | Eliminar excepción          | ✅ Tarotist |
| GET    | `/tarotist/scheduling/sessions`                    | Mis sesiones como tarotista | ✅ Tarotist |
| GET    | `/tarotist/scheduling/sessions/:id`                | Detalle de sesión           | ✅ Tarotist |
| POST   | `/tarotist/scheduling/sessions/:id/confirm`        | Confirmar sesión            | ✅ Tarotist |
| POST   | `/tarotist/scheduling/sessions/:id/complete`       | Marcar completada           | ✅ Tarotist |
| POST   | `/tarotist/scheduling/sessions/:id/cancel`         | Cancelar sesión             | ✅ Tarotist |

---

## 🔒 Endpoints de Administración

### 👥 Admin - Usuarios (`/admin/users`)

| Método | Endpoint                          | Descripción               |
| ------ | --------------------------------- | ------------------------- |
| GET    | `/admin/users`                    | Listar todos los usuarios |
| GET    | `/admin/users/:id`                | Ver usuario específico    |
| POST   | `/admin/users/:id/ban`            | Banear usuario            |
| POST   | `/admin/users/:id/unban`          | Desbanear usuario         |
| PATCH  | `/admin/users/:id/plan`           | Cambiar plan              |
| POST   | `/admin/users/:id/roles/tarotist` | Asignar rol tarotista     |
| POST   | `/admin/users/:id/roles/admin`    | Asignar rol admin         |
| DELETE | `/admin/users/:id/roles/:role`    | Quitar rol                |
| DELETE | `/admin/users/:id`                | Eliminar usuario          |

### 📖 Admin - Lecturas (`/admin/readings`)

| Método | Endpoint          | Descripción               |
| ------ | ----------------- | ------------------------- |
| GET    | `/admin/readings` | Listar todas las lecturas |

### 👩‍🔮 Admin - Tarotistas (`/admin/tarotistas`)

| Método | Endpoint                                     | Descripción                |
| ------ | -------------------------------------------- | -------------------------- |
| POST   | `/admin/tarotistas`                          | Crear tarotista            |
| GET    | `/admin/tarotistas`                          | Listar tarotistas          |
| PUT    | `/admin/tarotistas/:id`                      | Actualizar tarotista       |
| PUT    | `/admin/tarotistas/:id/deactivate`           | Desactivar                 |
| PUT    | `/admin/tarotistas/:id/reactivate`           | Reactivar                  |
| GET    | `/admin/tarotistas/:id/config`               | Ver configuración IA       |
| PUT    | `/admin/tarotistas/:id/config`               | Actualizar config IA       |
| POST   | `/admin/tarotistas/:id/config/reset`         | Reset a defaults           |
| POST   | `/admin/tarotistas/:id/meanings`             | Agregar significado custom |
| GET    | `/admin/tarotistas/:id/meanings`             | Listar significados custom |
| DELETE | `/admin/tarotistas/:id/meanings/:meaningId`  | Eliminar significado       |
| POST   | `/admin/tarotistas/:id/meanings/bulk`        | Bulk create significados   |
| GET    | `/admin/tarotistas/applications`             | Listar aplicaciones        |
| POST   | `/admin/tarotistas/applications/:id/approve` | Aprobar aplicación         |
| POST   | `/admin/tarotistas/applications/:id/reject`  | Rechazar aplicación        |

### 📊 Admin - Dashboard (`/admin/dashboard`)

| Método | Endpoint                   | Descripción             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/admin/dashboard/metrics` | Métricas principales    |
| GET    | `/admin/dashboard/stats`   | Estadísticas detalladas |
| GET    | `/admin/dashboard/charts`  | Datos para gráficos     |

### 🗄️ Admin - Caché (`/admin/cache`)

| Método | Endpoint                                  | Descripción                    |
| ------ | ----------------------------------------- | ------------------------------ |
| DELETE | `/admin/cache/tarotistas/:id`             | Limpiar caché de tarotista     |
| DELETE | `/admin/cache/tarotistas/:id/meanings`    | Limpiar significados cacheados |
| DELETE | `/admin/cache/global`                     | Limpiar todo el caché          |
| GET    | `/admin/cache/stats`                      | Estadísticas del caché         |
| GET    | `/admin/cache/analytics`                  | Análisis de uso del caché      |
| GET    | `/admin/cache/analytics/top-combinations` | Combinaciones más cacheadas    |
| GET    | `/admin/cache/analytics/historical`       | Datos históricos               |
| POST   | `/admin/cache/warm`                       | Precalentar caché              |
| GET    | `/admin/cache/warm/status`                | Estado del warm-up             |
| POST   | `/admin/cache/warm/stop`                  | Detener warm-up                |

### 📈 Admin - Uso de IA (`/admin/ai-usage`)

| Método | Endpoint          | Descripción               |
| ------ | ----------------- | ------------------------- |
| GET    | `/admin/ai-usage` | Estadísticas de uso de IA |

### 🚦 Admin - Rate Limits (`/admin/rate-limits`)

| Método | Endpoint                        | Descripción                   |
| ------ | ------------------------------- | ----------------------------- |
| GET    | `/admin/rate-limits/violations` | Ver violaciones de rate limit |

### 🌐 Admin - IP Whitelist (`/admin/ip-whitelist`)

| Método | Endpoint              | Descripción             |
| ------ | --------------------- | ----------------------- |
| GET    | `/admin/ip-whitelist` | Listar IPs en whitelist |
| POST   | `/admin/ip-whitelist` | Agregar IP              |
| DELETE | `/admin/ip-whitelist` | Eliminar IP             |

### 🔐 Admin - Eventos de Seguridad (`/admin/security/events`)

| Método | Endpoint                 | Descripción                 |
| ------ | ------------------------ | --------------------------- |
| GET    | `/admin/security/events` | Listar eventos de seguridad |

### 📝 Admin - Audit Logs (`/admin/audit-logs`)

| Método | Endpoint            | Descripción              |
| ------ | ------------------- | ------------------------ |
| GET    | `/admin/audit-logs` | Listar logs de auditoría |

### ⚙️ Admin - Configuración de Planes (`/plan-config`)

| Método | Endpoint                 | Descripción             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/plan-config`           | Listar todos los planes |
| GET    | `/plan-config/:planType` | Ver plan específico     |
| POST   | `/plan-config`           | Crear plan              |
| PUT    | `/plan-config/:planType` | Actualizar plan         |
| DELETE | `/plan-config/:planType` | Eliminar plan           |

---

## 🔧 Endpoints de Sistema

### 🏥 Health (`/health`)

| Método | Endpoint           | Descripción              | Auth |
| ------ | ------------------ | ------------------------ | ---- |
| GET    | `/health`          | Health check básico      | ❌   |
| GET    | `/health/ready`    | Readiness probe (K8s)    | ❌   |
| GET    | `/health/live`     | Liveness probe (K8s)     | ❌   |
| GET    | `/health/details`  | Detalles completos       | ❌   |
| GET    | `/health/database` | Estado de la DB          | ❌   |
| GET    | `/health/ai`       | Estado de proveedores IA | ❌   |

### 📊 Uso de IA del Usuario (`/usage`)

| Método | Endpoint    | Descripción             | Auth |
| ------ | ----------- | ----------------------- | ---- |
| GET    | `/usage/ai` | Mi cuota de IA restante | ✅   |

### 🚦 Rate Limit del Usuario (`/rate-limit`)

| Método | Endpoint             | Descripción             | Auth |
| ------ | -------------------- | ----------------------- | ---- |
| GET    | `/rate-limit/status` | Mi estado de rate limit | ✅   |

---

## 🗄️ Modelo de Datos (29 Entidades)

### Core del Tarot

| Entidad               | Tabla                  | Descripción                     |
| --------------------- | ---------------------- | ------------------------------- |
| `User`                | `user`                 | Usuarios con planes y roles     |
| `TarotCard`           | `tarot_card`           | 78 cartas del tarot Rider-Waite |
| `TarotDeck`           | `tarot_deck`           | Mazos de cartas                 |
| `TarotSpread`         | `tarot_spread`         | 4 tipos de tiradas              |
| `TarotReading`        | `tarot_reading`        | Lecturas realizadas             |
| `TarotInterpretation` | `tarot_interpretation` | Interpretaciones generadas      |
| `ReadingCategory`     | `reading_category`     | 6 categorías de consulta        |
| `PredefinedQuestion`  | `predefined_question`  | 43 preguntas predefinidas       |
| `DailyReading`        | `daily_reading`        | Carta del día por usuario       |

### Tarotistas

| Entidad                     | Tabla                         | Descripción                       |
| --------------------------- | ----------------------------- | --------------------------------- |
| `Tarotista`                 | `tarotista`                   | Perfil de tarotista               |
| `TarotistaConfig`           | `tarotista_config`            | Configuración de IA personalizada |
| `TarotistaCardMeaning`      | `tarotista_card_meaning`      | Significados personalizados       |
| `TarotistaReview`           | `tarotista_review`            | Reviews de usuarios               |
| `TarotistaRevenueMetrics`   | `tarotista_revenue_metrics`   | Métricas de ingresos              |
| `TarotistaApplication`      | `tarotista_application`       | Solicitudes para ser tarotista    |
| `UserTarotistaSubscription` | `user_tarotista_subscription` | Suscripciones a tarotistas        |

### Scheduling

| Entidad                | Tabla                   | Descripción            |
| ---------------------- | ----------------------- | ---------------------- |
| `Session`              | `session`               | Sesiones reservadas    |
| `TarotistAvailability` | `tarotist_availability` | Disponibilidad semanal |
| `TarotistException`    | `tarotist_exception`    | Excepciones de horario |

### Autenticación y Seguridad

| Entidad              | Tabla                  | Descripción                 |
| -------------------- | ---------------------- | --------------------------- |
| `RefreshToken`       | `refresh_token`        | Tokens de refresh JWT       |
| `PasswordResetToken` | `password_reset_token` | Tokens de reset de password |
| `SecurityEvent`      | `security_event`       | Eventos de seguridad        |
| `AuditLog`           | `audit_log`            | Logs de auditoría admin     |

### Sistema y Caché

| Entidad                | Tabla                   | Descripción                |
| ---------------------- | ----------------------- | -------------------------- |
| `Plan`                 | `plan`                  | Configuración de planes    |
| `UsageLimit`           | `usage_limit`           | Límites de uso por usuario |
| `CachedInterpretation` | `cached_interpretation` | Caché de interpretaciones  |
| `CacheMetrics`         | `cache_metrics`         | Métricas del caché         |
| `AiUsageLog`           | `ai_usage_log`          | Logs de uso de IA          |
| `AiProviderUsage`      | `ai_provider_usage`     | Uso por proveedor de IA    |

---

## ❌ Pendiente para MVP Completo

### Backend (Minor)

- [ ] Integración con Stripe para pagos reales
- [ ] Webhook de Stripe para confirmación de pagos
- [ ] Notificaciones push (opcional)
- [ ] Sistema de Oráculo (consultas abiertas - opcional)

### Frontend (0% - Prioridad Alta)

- [ ] Setup Next.js 14 + React 18 + TailwindCSS
- [ ] Sistema de diseño (componentes base)
- [ ] Páginas de autenticación (login, register, forgot-password)
- [ ] Dashboard de usuario
- [ ] Selector de categorías y preguntas predefinidas
- [ ] Vista de lectura con animación de cartas
- [ ] Vista de interpretación (markdown renderizado)
- [ ] Historial de lecturas con paginación
- [ ] Carta del día con historial
- [ ] Perfil de usuario (edición, cambio de plan)
- [ ] Exploración de tarotistas (marketplace)
- [ ] Reserva de sesiones (calendario)
- [ ] Panel de administración (dashboard, usuarios, tarotistas)
- [ ] Responsive design (mobile-first)
- [ ] PWA (Progressive Web App)

---

## 🎨 Información para Frontend

### Autenticación

```typescript
// Login response
{
  access_token: string;     // JWT - expira en 15 minutos
  refresh_token: string;    // Para renovar - expira en 7 días
  user: {
    id: number;
    email: string;
    name: string;
    roles: ('consumer' | 'tarotist' | 'admin')[];
    plan: 'guest' | 'free' | 'premium' | 'professional';
  }
}

// Headers requeridos para endpoints protegidos
Authorization: Bearer <access_token>
```

### Límites por Plan

| Plan         | Lecturas/día | Preguntas Custom | Regeneración | All-Access |
| ------------ | ------------ | ---------------- | ------------ | ---------- |
| GUEST        | 3            | ❌               | ❌           | ❌         |
| FREE         | 3            | ❌               | ❌           | ❌         |
| PREMIUM      | 50           | ✅               | ✅           | ✅         |
| PROFESSIONAL | ∞            | ✅               | ✅           | ✅         |

### Roles y Permisos

| Rol        | Permisos                                                             |
| ---------- | -------------------------------------------------------------------- |
| `consumer` | Crear lecturas, ver historial, reservar sesiones                     |
| `tarotist` | + Gestionar disponibilidad, confirmar sesiones, ver métricas propias |
| `admin`    | + Panel admin completo, gestión de usuarios/tarotistas/sistema       |

### Códigos de Error Comunes

| Código | Significado                     | Acción sugerida                              |
| ------ | ------------------------------- | -------------------------------------------- |
| 401    | Token inválido/expirado         | Llamar a `/auth/refresh` o redirigir a login |
| 403    | Sin permisos / Límite alcanzado | Mostrar upgrade a Premium                    |
| 404    | Recurso no encontrado           | Mostrar mensaje de error                     |
| 429    | Rate limit excedido             | Mostrar "Intenta de nuevo en X segundos"     |

---

## 🚀 Próximos Pasos para Lanzamiento

1. **Desarrollar Frontend** (~4-6 semanas)
   - Setup inicial y sistema de diseño (1 semana)
   - Autenticación y dashboard (1 semana)
   - Flujo de lecturas completo (1-2 semanas)
   - Marketplace de tarotistas (1 semana)
   - Panel admin (1 semana)
2. **Integrar Stripe** para pagos (~1 semana)
3. **Testing E2E completo** (~1 semana)
4. **Deploy a producción** (Render/Railway/Vercel)
5. **Configurar dominio y SSL**
6. **Monitoring y alertas** (Sentry, LogRocket)

---

## 📚 Documentación Relacionada

| Documento              | Descripción                                 |
| ---------------------- | ------------------------------------------- |
| `ARCHITECTURE.md`      | Arquitectura del sistema y módulos          |
| `API_DOCUMENTATION.md` | Documentación detallada de API con ejemplos |
| `DATABASE.md`          | Esquema completo de base de datos con ER    |
| `SECURITY.md`          | Sistema de seguridad y autenticación        |
| `DEPLOYMENT.md`        | Guía de deployment                          |
| `TESTING.md`           | Estrategia de testing                       |
| `CACHE_STRATEGY.md`    | Sistema de caché de interpretaciones        |
| `AI_PROVIDERS.md`      | Configuración de proveedores de IA          |

---

## 🔧 Comandos Útiles para Desarrollo

```bash
# Instalar dependencias
cd backend/tarot-app && npm install

# Iniciar base de datos (Docker)
docker-compose up -d

# Ejecutar seeders (datos iniciales)
npm run seed

# Iniciar servidor de desarrollo
npm run start:dev

# Ejecutar tests
npm run test           # Tests unitarios
npm run test:e2e       # Tests E2E
npm run test:cov       # Coverage

# Ver documentación Swagger
# Abrir: http://localhost:3000/api/docs
```

---

**Versión:** 1.0.0  
**Última actualización:** 2 de Diciembre, 2025  
**Estado:** Backend ~95% completado | Frontend 0%
