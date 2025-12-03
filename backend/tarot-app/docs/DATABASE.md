# 🗄️ Database Documentation - TarotFlavia

## Tabla de Contenidos

- [Overview](#overview)
- [Diagrama ER](#diagrama-er)
- [Tablas Principales](#tablas-principales)
  - [users](#users)
  - [tarot_reading](#tarot_reading)
  - [tarot_interpretation](#tarot_interpretation)
  - [tarot_card](#tarot_card)
  - [tarot_spread](#tarot_spread)
  - [tarot_deck](#tarot_deck)
  - [reading_category](#reading_category)
  - [predefined_questions](#predefined_questions)
  - [tarotistas](#tarotistas)
  - [tarotista_config](#tarotista_config)
  - [tarotista_card_meanings](#tarotista_card_meanings)
  - [tarotista_applications](#tarotista_applications)
  - [tarotista_reviews](#tarotista_reviews) ⭐ NUEVO
  - [tarotista_revenue_metrics](#tarotista_revenue_metrics) ⭐ NUEVO
  - [user_tarotista_subscriptions](#user_tarotista_subscriptions) ⭐ NUEVO
  - [daily_readings](#daily_readings)
  - [usage_limit](#usage_limit)
  - [audit_logs](#audit_logs)
- [Tablas de Autenticación](#tablas-de-autenticación) ⭐ NUEVO
  - [refresh_tokens](#refresh_tokens)
  - [password_reset_tokens](#password_reset_tokens)
- [Tablas de Scheduling](#tablas-de-scheduling) ⭐ NUEVO
  - [sessions](#sessions)
  - [tarotist_availability](#tarotist_availability)
  - [tarotist_exceptions](#tarotist_exceptions)
- [Tablas de Monitoreo](#tablas-de-monitoreo) ⭐ NUEVO
  - [ai_usage_logs](#ai_usage_logs)
  - [security_events](#security_events)
  - [cached_interpretations](#cached_interpretations)
- [Relaciones](#relaciones)
- [Índices y Performance](#índices-y-performance)
- [Migraciones](#migraciones)
- [Seeders](#seeders)
- [Connection Pooling](#connection-pooling)
- [Backup y Restore](#backup-y-restore)

---

## Overview

### Tecnología

- **DBMS**: PostgreSQL 16 (Docker, puerto 5435)
- **ORM**: TypeORM 0.3.x
- **Connection Pooling**: Configurado en production
- **Migraciones**: TypeORM CLI
- **Seeds**: Scripts TypeScript personalizados
- **Total de Entidades**: 29 tablas

### Convenciones de Nomenclatura

- **Tablas**: snake_case (ej: `tarot_readings`, `user_tarotista_subscriptions`)
- **Columnas**: snake_case (ej: `user_id`, `created_at`)
- **Primary Keys**: `id` (auto-incremental)
- **Foreign Keys**: `{tabla}_id` (ej: `user_id`, `spread_id`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at` (soft deletes)
- **Índices**: `idx_{tabla}_{columnas}` (ej: `idx_tarot_reading_user_id`)

---

## Diagrama ER

### Diagrama Simplificado

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MÓDULO DE USUARIOS                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐        ┌───────────────────┐        ┌──────────────────┐  │
│  │      users      │────────│    tarotistas     │────────│ tarotista_config │  │
│  │                 │ 1    1 │                   │ 1    * │                  │  │
│  │ - id            │        │ - id              │        │ - id             │  │
│  │ - email         │        │ - user_id (FK)    │        │ - tarotista_id   │  │
│  │ - password      │        │ - display_name    │        │ - system_prompt  │  │
│  │ - name          │        │ - bio             │        │ - temperature    │  │
│  │ - roles[]       │        │ - specialties[]   │        │ - max_tokens     │  │
│  │ - plan          │        │ - rating_promedio │        │ - version        │  │
│  │ - lastLogin     │        │ - precio_sesion   │        └──────────────────┘  │
│  │ - aiTokensUsed  │        │ - is_featured     │                              │
│  └─────────────────┘        │ - verification    │                              │
│           │                 └───────────────────┘                              │
│           │                         │                                          │
│           │ 1                       │ 1                                        │
│           │                         │                                          │
│           ▼ *                       ▼ *                                        │
│  ┌─────────────────┐        ┌───────────────────┐        ┌──────────────────┐  │
│  │ refresh_tokens  │        │ tarotista_reviews │        │ user_tarotista_  │  │
│  │                 │        │                   │        │   subscription   │  │
│  │ - id            │        │ - id              │        │ - id             │  │
│  │ - user_id (FK)  │        │ - tarotista_id    │        │ - user_id (FK)   │  │
│  │ - token_hash    │        │ - user_id (FK)    │        │ - tarotista_id   │  │
│  │ - expires_at    │        │ - rating          │        │ - type           │  │
│  │ - revoked       │        │ - comment         │        │ - status         │  │
│  └─────────────────┘        │ - moderationStatus│        │ - expires_at     │  │
│                             └───────────────────┘        └──────────────────┘  │
│                                                                                 │
│  ┌─────────────────┐                                                           │
│  │password_reset_  │                                                           │
│  │     tokens      │                                                           │
│  │ - id            │                                                           │
│  │ - user_id (FK)  │                                                           │
│  │ - token_hash    │                                                           │
│  │ - expires_at    │                                                           │
│  └─────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MÓDULO DE LECTURAS TAROT                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐        ┌───────────────────┐        ┌──────────────────┐  │
│  │  tarot_reading  │────────│tarot_interpretation│───────│ tarot_card       │  │
│  │                 │ 1    1 │                   │        │                  │  │
│  │ - id            │        │ - id              │        │ - id             │  │
│  │ - user_id (FK)  │        │ - reading_id (FK) │        │ - name           │  │
│  │ - spread_id(FK) │        │ - interpretation  │        │ - arcana_type    │  │
│  │ - tarotista_id  │        │ - ai_provider     │        │ - number         │  │
│  │ - question      │        │ - model           │        │ - suit           │  │
│  │ - cards (JSONB) │        │ - tokens_used     │        │ - meaning_*      │  │
│  │ - created_at    │        │ - cached          │        │ - keywords[]     │  │
│  └─────────────────┘        └───────────────────┘        └──────────────────┘  │
│           │                                                      │             │
│           │                                                      │             │
│           ▼ 1                                                    ▼ 1           │
│  ┌─────────────────┐        ┌───────────────────┐        ┌──────────────────┐  │
│  │  tarot_spread   │        │ reading_category  │────────│predefined_question│ │
│  │                 │        │                   │ 1    * │                  │  │
│  │ - id            │        │ - id              │        │ - id             │  │
│  │ - name          │        │ - name            │        │ - category_id    │  │
│  │ - card_count    │        │ - slug            │        │ - question       │  │
│  │ - positions[]   │        │ - description     │        │ - usage_count    │  │
│  │ - description   │        │ - color           │        │ - is_active      │  │
│  └─────────────────┘        └───────────────────┘        └──────────────────┘  │
│                                                                                 │
│  ┌─────────────────┐        ┌───────────────────┐                              │
│  │ daily_readings  │        │tarotista_card_    │                              │
│  │                 │        │    meanings       │                              │
│  │ - id            │        │ - id              │                              │
│  │ - user_id (FK)  │        │ - tarotista_id    │                              │
│  │ - tarotista_id  │        │ - card_id (FK)    │                              │
│  │ - card_id (FK)  │        │ - custom_meaning_*│                              │
│  │ - reading_date  │        │ - private_notes   │                              │
│  │ - interpretation│        └───────────────────┘                              │
│  └─────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MÓDULO DE SCHEDULING                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐        ┌───────────────────┐        ┌──────────────────┐  │
│  │    sessions     │        │tarotist_availability│      │tarotist_exceptions│ │
│  │                 │        │                   │        │                  │  │
│  │ - id            │        │ - id              │        │ - id             │  │
│  │ - tarotista_id  │        │ - tarotista_id    │        │ - tarotista_id   │  │
│  │ - consumer_id   │        │ - day_of_week     │        │ - date           │  │
│  │ - scheduled_at  │        │ - start_time      │        │ - is_available   │  │
│  │ - duration_min  │        │ - end_time        │        │ - start_time     │  │
│  │ - status        │        │ - is_active       │        │ - end_time       │  │
│  │ - price_usd     │        └───────────────────┘        │ - reason         │  │
│  │ - payment_status│                                     └──────────────────┘  │
│  │ - notes         │                                                           │
│  └─────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                       MÓDULOS DE SISTEMA Y MONITOREO                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐        ┌───────────────────┐        ┌──────────────────┐  │
│  │  ai_usage_logs  │        │  security_events  │        │  usage_limits    │  │
│  │                 │        │                   │        │                  │  │
│  │ - id            │        │ - id              │        │ - id             │  │
│  │ - user_id (FK)  │        │ - event_type      │        │ - user_id (FK)   │  │
│  │ - provider      │        │ - severity        │        │ - feature        │  │
│  │ - model         │        │ - user_id (FK)    │        │ - used_today     │  │
│  │ - tokens_in     │        │ - ip_address      │        │ - limit_per_day  │  │
│  │ - tokens_out    │        │ - user_agent      │        │ - last_reset     │  │
│  │ - cost_usd      │        │ - details (JSONB) │        └──────────────────┘  │
│  │ - status        │        │ - timestamp       │                              │
│  │ - latency_ms    │        └───────────────────┘                              │
│  └─────────────────┘                                                           │
│                                                                                 │
│  ┌─────────────────┐        ┌───────────────────┐                              │
│  │cached_interpre- │        │tarotista_revenue_ │                              │
│  │   tations       │        │    metrics        │                              │
│  │ - id            │        │ - id              │                              │
│  │ - cache_key     │        │ - tarotista_id    │                              │
│  │ - interpretation│        │ - period_start    │                              │
│  │ - hit_count     │        │ - gross_amount    │                              │
│  │ - expires_at    │        │ - net_amount      │                              │
│  │ - provider      │        │ - transaction_type│                              │
│  └─────────────────┘        └───────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Resumen de Tablas (29 Total)

| Módulo            | Tablas                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **Usuarios**      | users, tarotistas, tarotista_config, tarotista_reviews, user_tarotista_subscriptions, tarotista_applications |
| **Autenticación** | refresh_tokens, password_reset_tokens                                                                        |
| **Tarot Core**    | tarot_card, tarot_spread, tarot_reading, tarot_interpretation, daily_readings, tarotista_card_meanings       |
| **Catálogo**      | reading_category, predefined_question                                                                        |
| **Scheduling**    | sessions, tarotist_availability, tarotist_exceptions                                                         |
| **AI & Cache**    | ai_usage_logs, cached_interpretations                                                                        |
| **Sistema**       | usage_limits, security_events, tarotista_revenue_metrics                                                     |

---

## Tablas Principales

### users

Almacena información de los usuarios del sistema.

| Columna                  | Tipo          | Constraints          | Descripción                               |
| ------------------------ | ------------- | -------------------- | ----------------------------------------- |
| `id`                     | INTEGER       | PRIMARY KEY          | ID único autoincrementable                |
| `email`                  | VARCHAR       | UNIQUE, NOT NULL     | Email único del usuario                   |
| `password`               | VARCHAR       | NOT NULL             | Hash bcrypt de la contraseña              |
| `name`                   | VARCHAR       | NOT NULL             | Nombre completo                           |
| `profile_picture`        | VARCHAR       | NULLABLE             | URL de la foto de perfil                  |
| `is_admin`               | BOOLEAN       | DEFAULT false        | **Deprecated:** Usar `roles`              |
| `roles`                  | VARCHAR[]     | DEFAULT ['CONSUMER'] | Array de roles: CONSUMER, TAROTIST, ADMIN |
| `plan`                   | ENUM          | DEFAULT 'free'       | Plan del usuario: free, premium           |
| `subscription_status`    | ENUM          | NULLABLE             | Estado: active, cancelled, expired        |
| `stripe_customer_id`     | VARCHAR       | NULLABLE             | ID del cliente en Stripe                  |
| `ai_requests_used_month` | INTEGER       | DEFAULT 0            | Requests de IA usados este mes            |
| `ai_cost_usd_month`      | DECIMAL(10,2) | DEFAULT 0            | Costo acumulado de IA este mes            |
| `created_at`             | TIMESTAMP     | NOT NULL             | Fecha de creación                         |
| `updated_at`             | TIMESTAMP     | NOT NULL             | Fecha de última actualización             |
| `ai_tokens_used_month`   | INTEGER       | DEFAULT 0            | Tokens de IA usados este mes              |
| `ai_provider_used`       | VARCHAR(50)   | NULLABLE             | Proveedor de IA predominante (groq, etc.) |
| `quota_warning_sent`     | BOOLEAN       | DEFAULT false        | Si se envió advertencia de cuota          |
| `ai_usage_reset_at`      | TIMESTAMP     | NULLABLE             | Fecha del último reset de uso de IA       |
| `plan_started_at`        | TIMESTAMP     | NULLABLE             | Fecha de inicio del plan actual           |
| `plan_expires_at`        | TIMESTAMP     | NULLABLE             | Fecha de expiración del plan              |
| `last_login`             | TIMESTAMP     | NULLABLE             | Fecha de último inicio de sesión          |
| `banned_at`              | TIMESTAMP     | NULLABLE             | Fecha en que el usuario fue baneado       |
| `ban_reason`             | VARCHAR(500)  | NULLABLE             | Razón del baneo del usuario               |

**Enums:**

```typescript
// UserRole
enum UserRole {
  CONSUMER = 'consumer',
  TAROTIST = 'tarotist',
  ADMIN = 'admin',
}

// UserPlan
enum UserPlan {
  GUEST = 'guest',
  FREE = 'free',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
}

// SubscriptionStatus
enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}
```

**Relaciones:**

- `readings` → `tarot_reading` (1:N)
- `daily_readings` → `daily_readings` (1:N)
- `usage_limits` → `usage_limit` (1:N)
- `tarotista` → `tarotistas` (1:1)
- `refreshTokens` → `refresh_tokens` (1:N)
- `subscriptions` → `user_tarotista_subscriptions` (1:N)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_banned_at ON users(banned_at);
```

**Métodos de la Entidad:**

- `isPremium()`: Verifica si el usuario tiene plan premium activo
- `hasPlanExpired()`: Verifica si el plan ha expirado
- `hasRole(role)`: Verifica si tiene un rol específico
- `isBanned()`: Verifica si está baneado
- `ban(reason?)`: Banea al usuario
- `unban()`: Desbanea al usuario

---

### tarot_reading

Almacena las lecturas de tarot generadas por los usuarios.

| Columna                  | Tipo         | Constraints                       | Descripción                             |
| ------------------------ | ------------ | --------------------------------- | --------------------------------------- |
| `id`                     | INTEGER      | PRIMARY KEY                       | ID único autoincrementable              |
| `user_id`                | INTEGER      | FK users, NOT NULL                | Usuario que creó la lectura             |
| `spread_id`              | INTEGER      | FK tarot_spread                   | Tipo de tirada utilizada                |
| `deck_id`                | INTEGER      | FK tarot_deck                     | Mazo de cartas utilizado                |
| `tarotista_id`           | INTEGER      | FK tarotistas, NULLABLE           | Tarotista que interpretó                |
| `category_id`            | INTEGER      | FK reading_category, NULLABLE     | Categoría de la pregunta                |
| `predefined_question_id` | INTEGER      | FK predefined_questions, NULLABLE | Pregunta predefinida                    |
| `custom_question`        | VARCHAR(500) | NULLABLE                          | Pregunta personalizada (premium)        |
| `question_type`          | VARCHAR(20)  | NULLABLE                          | Tipo: 'predefined' o 'custom'           |
| `card_positions`         | JSONB        | NOT NULL                          | Posiciones y orientación de cartas      |
| `interpretation`         | TEXT         | NULLABLE                          | Interpretación generada (deprecated)    |
| `regeneration_count`     | INTEGER      | DEFAULT 0                         | Veces que se regeneró la interpretación |
| `shared_token`           | VARCHAR(12)  | UNIQUE, NULLABLE                  | Token para compartir públicamente       |
| `is_public`              | BOOLEAN      | DEFAULT false                     | Si la lectura es pública                |
| `view_count`             | INTEGER      | DEFAULT 0                         | Número de vistas (lecturas compartidas) |
| `created_at`             | TIMESTAMP    | NOT NULL                          | Fecha de creación                       |
| `updated_at`             | TIMESTAMP    | NOT NULL                          | Fecha de última actualización           |
| `deleted_at`             | TIMESTAMP    | NULLABLE                          | Soft delete timestamp                   |

**Estructura de `card_positions` (JSONB):**

```json
[
  {
    "cardId": 1,
    "position": "pasado",
    "isReversed": false
  },
  {
    "cardId": 15,
    "position": "presente",
    "isReversed": true
  }
]
```

**Relaciones:**

- `user` ← `users` (N:1)
- `spread` ← `tarot_spread` (N:1)
- `deck` ← `tarot_deck` (N:1)
- `tarotista` ← `tarotistas` (N:1)
- `category` ← `reading_category` (N:1)
- `predefinedQuestion` ← `predefined_questions` (N:1)
- `cards` ← `tarot_card` (N:M) - Tabla join: `tarot_reading_cards_tarot_card`
- `interpretations` → `tarot_interpretation` (1:N)

**Índices:**

```sql
CREATE INDEX idx_tarot_reading_user_id ON tarot_reading(user_id);
CREATE INDEX idx_tarot_reading_tarotista_id ON tarot_reading(tarotista_id);
CREATE INDEX idx_tarot_reading_created_at ON tarot_reading(created_at DESC);
CREATE INDEX idx_tarot_reading_deleted_at ON tarot_reading(deleted_at);
CREATE UNIQUE INDEX idx_tarot_reading_shared_token ON tarot_reading(shared_token) WHERE shared_token IS NOT NULL;
```

---

### tarot_interpretation

Almacena las interpretaciones generadas por IA para cada lectura.

| Columna              | Tipo          | Constraints                | Descripción                                      |
| -------------------- | ------------- | -------------------------- | ------------------------------------------------ |
| `id`                 | INTEGER       | PRIMARY KEY                | ID único autoincrementable                       |
| `reading_id`         | INTEGER       | FK tarot_reading, NOT NULL | Lectura asociada                                 |
| `interpretation`     | TEXT          | NOT NULL                   | Interpretación completa generada                 |
| `ai_provider`        | VARCHAR(50)   | NOT NULL                   | Proveedor: 'groq', 'openai', 'deepseek'          |
| `model`              | VARCHAR(100)  | NOT NULL                   | Modelo: 'llama-3.1-70b-versatile', 'gpt-4-turbo' |
| `prompt_tokens`      | INTEGER       | DEFAULT 0                  | Tokens usados en el prompt                       |
| `completion_tokens`  | INTEGER       | DEFAULT 0                  | Tokens usados en la respuesta                    |
| `cost_usd`           | DECIMAL(10,4) | DEFAULT 0                  | Costo estimado en USD                            |
| `generation_time_ms` | INTEGER       | NULLABLE                   | Tiempo de generación en ms                       |
| `created_at`         | TIMESTAMP     | NOT NULL                   | Fecha de creación                                |

**Relaciones:**

- `reading` ← `tarot_reading` (N:1)

**Índices:**

```sql
CREATE INDEX idx_tarot_interpretation_reading_id ON tarot_interpretation(reading_id);
CREATE INDEX idx_tarot_interpretation_ai_provider ON tarot_interpretation(ai_provider);
CREATE INDEX idx_tarot_interpretation_created_at ON tarot_interpretation(created_at DESC);
```

---

### tarot_card

Catálogo de las 78 cartas del tarot Rider-Waite.

| Columna       | Tipo      | Constraints   | Descripción                                   |
| ------------- | --------- | ------------- | --------------------------------------------- |
| `id`          | INTEGER   | PRIMARY KEY   | ID único autoincrementable                    |
| `name`        | VARCHAR   | NOT NULL      | Nombre de la carta (ej: "El Mago")            |
| `arcana`      | ENUM      | NOT NULL      | 'major' (arcanos mayores) o 'minor' (menores) |
| `number`      | INTEGER   | NOT NULL      | Número de la carta (0-21 major, 1-14 minor)   |
| `suit`        | ENUM      | NULLABLE      | Palo: 'cups', 'wands', 'swords', 'pentacles'  |
| `description` | TEXT      | NOT NULL      | Descripción detallada                         |
| `keywords`    | TEXT      | NOT NULL      | Palabras clave separadas por comas            |
| `deck_id`     | INTEGER   | FK tarot_deck | Mazo al que pertenece                         |
| `created_at`  | TIMESTAMP | NOT NULL      | Fecha de creación                             |
| `updated_at`  | TIMESTAMP | NOT NULL      | Fecha de última actualización                 |

**Relaciones:**

- `deck` ← `tarot_deck` (N:1)
- `readings` ← `tarot_reading` (N:M) - Tabla join

**Índices:**

```sql
CREATE INDEX idx_tarot_card_arcana ON tarot_card(arcana);
CREATE INDEX idx_tarot_card_suit ON tarot_card(suit);
CREATE INDEX idx_tarot_card_deck_id ON tarot_card(deck_id);
```

---

### tarot_spread

Configuración de las diferentes tiradas de tarot disponibles.

| Columna       | Tipo      | Constraints | Descripción                            |
| ------------- | --------- | ----------- | -------------------------------------- |
| `id`          | INTEGER   | PRIMARY KEY | ID único autoincrementable             |
| `name`        | VARCHAR   | NOT NULL    | Nombre de la tirada (ej: "Cruz Celta") |
| `description` | TEXT      | NOT NULL    | Descripción detallada                  |
| `card_count`  | INTEGER   | NOT NULL    | Número de cartas (ej: 3, 10)           |
| `positions`   | JSONB     | NOT NULL    | Definición de posiciones               |
| `difficulty`  | ENUM      | NOT NULL    | 'beginner', 'intermediate', 'advanced' |
| `when_to_use` | TEXT      | NOT NULL    | Cuándo usar esta tirada                |
| `created_at`  | TIMESTAMP | NOT NULL    | Fecha de creación                      |
| `updated_at`  | TIMESTAMP | NOT NULL    | Fecha de última actualización          |

**Estructura de `positions` (JSONB):**

```json
[
  {
    "name": "Pasado",
    "description": "Eventos que influyeron en la situación actual"
  },
  {
    "name": "Presente",
    "description": "Tu situación actual"
  },
  {
    "name": "Futuro",
    "description": "Lo que viene"
  }
]
```

**Relaciones:**

- `readings` → `tarot_reading` (1:N)

**Índices:**

```sql
CREATE INDEX idx_tarot_spread_difficulty ON tarot_spread(difficulty);
```

---

### tarot_deck

Mazos de tarot disponibles.

| Columna       | Tipo      | Constraints  | Descripción                         |
| ------------- | --------- | ------------ | ----------------------------------- |
| `id`          | INTEGER   | PRIMARY KEY  | ID único autoincrementable          |
| `name`        | VARCHAR   | NOT NULL     | Nombre del mazo (ej: "Rider-Waite") |
| `description` | TEXT      | NOT NULL     | Descripción del mazo                |
| `is_active`   | BOOLEAN   | DEFAULT true | Si el mazo está disponible          |
| `created_at`  | TIMESTAMP | NOT NULL     | Fecha de creación                   |
| `updated_at`  | TIMESTAMP | NOT NULL     | Fecha de última actualización       |

**Relaciones:**

- `cards` → `tarot_card` (1:N)
- `readings` → `tarot_reading` (1:N)

---

### reading_category

Categorías de preguntas para organizar lecturas.

| Columna       | Tipo       | Constraints      | Descripción                            |
| ------------- | ---------- | ---------------- | -------------------------------------- |
| `id`          | INTEGER    | PRIMARY KEY      | ID único autoincrementable             |
| `name`        | VARCHAR    | UNIQUE, NOT NULL | Nombre (ej: "Amor y Relaciones")       |
| `slug`        | VARCHAR    | UNIQUE, NOT NULL | Slug para URLs (ej: "amor-relaciones") |
| `description` | TEXT       | NOT NULL         | Descripción de la categoría            |
| `icon`        | VARCHAR    | NOT NULL         | Icono o emoji (ej: "❤️")               |
| `color`       | VARCHAR(7) | NOT NULL         | Color hex (ej: "#FF6B9D")              |
| `is_active`   | BOOLEAN    | DEFAULT true     | Si está activa                         |
| `created_at`  | TIMESTAMP  | NOT NULL         | Fecha de creación                      |
| `updated_at`  | TIMESTAMP  | NOT NULL         | Fecha de última actualización          |

**Relaciones:**

- `predefinedQuestions` → `predefined_questions` (1:N)
- `readings` → `tarot_reading` (1:N)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_reading_category_slug ON reading_category(slug);
CREATE INDEX idx_reading_category_is_active ON reading_category(is_active);
```

---

### predefined_questions

Preguntas predefinidas por categoría.

| Columna       | Tipo      | Constraints                   | Descripción                   |
| ------------- | --------- | ----------------------------- | ----------------------------- |
| `id`          | INTEGER   | PRIMARY KEY                   | ID único autoincrementable    |
| `category_id` | INTEGER   | FK reading_category, NOT NULL | Categoría                     |
| `question`    | TEXT      | NOT NULL                      | Texto de la pregunta          |
| `is_active`   | BOOLEAN   | DEFAULT true                  | Si está activa                |
| `usage_count` | INTEGER   | DEFAULT 0                     | Veces que se ha usado         |
| `created_at`  | TIMESTAMP | NOT NULL                      | Fecha de creación             |
| `updated_at`  | TIMESTAMP | NOT NULL                      | Fecha de última actualización |

**Relaciones:**

- `category` ← `reading_category` (N:1)
- `readings` → `tarot_reading` (1:N)

**Índices:**

```sql
CREATE INDEX idx_predefined_questions_category_id ON predefined_questions(category_id);
CREATE INDEX idx_predefined_questions_is_active ON predefined_questions(is_active);
CREATE INDEX idx_predefined_questions_usage_count ON predefined_questions(usage_count DESC);
```

---

### tarotistas

Información de los tarotistas profesionales. Soporte completo para marketplace con sesiones en vivo.

| Columna                      | Tipo          | Constraints                | Descripción                             |
| ---------------------------- | ------------- | -------------------------- | --------------------------------------- |
| `id`                         | INTEGER       | PRIMARY KEY                | ID único autoincrementable              |
| `user_id`                    | INTEGER       | FK users, UNIQUE, NOT NULL | Usuario asociado                        |
| `display_name`               | VARCHAR(100)  | NOT NULL                   | Nombre público (max 100 caracteres)     |
| `bio`                        | TEXT          | NULLABLE                   | Biografía                               |
| `specialties`                | VARCHAR[]     | DEFAULT []                 | Especialidades                          |
| `is_active`                  | BOOLEAN       | DEFAULT true               | Si está activo                          |
| `ai_config`                  | JSONB         | NOT NULL                   | Configuración de IA personalizada       |
| `profile_image_url`          | VARCHAR(500)  | NULLABLE                   | URL de imagen de perfil                 |
| `banner_image_url`           | VARCHAR(500)  | NULLABLE                   | URL de imagen banner                    |
| `precio_sesion_usd`          | DECIMAL(10,2) | NULLABLE                   | Precio por sesión en USD                |
| `duracion_sesion_minutos`    | INTEGER       | DEFAULT 30                 | Duración estándar de sesión en minutos  |
| `rating_promedio`            | DECIMAL(3,2)  | DEFAULT 0.00               | Rating promedio (0.00-5.00)             |
| `total_reviews`              | INTEGER       | DEFAULT 0                  | Total de reseñas recibidas              |
| `total_readings`             | INTEGER       | DEFAULT 0                  | Total de lecturas realizadas            |
| `total_sessions`             | INTEGER       | DEFAULT 0                  | Total de sesiones realizadas            |
| `comision_porcentaje`        | DECIMAL(5,2)  | DEFAULT 20.00              | Porcentaje de comisión de la plataforma |
| `is_featured`                | BOOLEAN       | DEFAULT false              | Si está destacado en el marketplace     |
| `is_accepting_new_clients`   | BOOLEAN       | DEFAULT true               | Si acepta nuevos clientes               |
| `years_experience`           | INTEGER       | NULLABLE                   | Años de experiencia                     |
| `languages`                  | VARCHAR[]     | DEFAULT ['es']             | Idiomas que maneja                      |
| `certifications`             | VARCHAR[]     | DEFAULT []                 | Certificaciones o títulos               |
| `social_links`               | JSONB         | DEFAULT {}                 | Links a redes sociales                  |
| `verification_status`        | VARCHAR(20)   | DEFAULT 'PENDING'          | Estado: PENDING, VERIFIED, REJECTED     |
| `verified_at`                | TIMESTAMP     | NULLABLE                   | Fecha de verificación                   |
| `total_earnings_usd`         | DECIMAL(12,2) | DEFAULT 0.00               | Ganancias totales acumuladas            |
| `current_month_earnings_usd` | DECIMAL(12,2) | DEFAULT 0.00               | Ganancias del mes actual                |
| `payout_method`              | VARCHAR(50)   | NULLABLE                   | Método de pago preferido                |
| `payout_details`             | JSONB         | NULLABLE                   | Detalles de pago (cuenta, etc.)         |
| `created_at`                 | TIMESTAMP     | NOT NULL                   | Fecha de creación                       |
| `updated_at`                 | TIMESTAMP     | NOT NULL                   | Fecha de última actualización           |

**Estructura de `ai_config` (JSONB):**

```json
{
  "provider": "groq",
  "model": "llama-3.1-70b-versatile",
  "systemPrompt": "Eres Flavia, una tarotista profesional...",
  "temperature": 0.7
}
```

**Estructura de `social_links` (JSONB):**

```json
{
  "instagram": "https://instagram.com/tarotista",
  "youtube": "https://youtube.com/channel/xxx",
  "website": "https://mistarot.com"
}
```

**Valores de `verification_status`:**

- `PENDING` - Pendiente de verificación
- `VERIFIED` - Verificado por la plataforma
- `REJECTED` - Rechazado (no cumple requisitos)

**Relaciones:**

- `user` ← `users` (1:1)
- `readings` → `tarot_reading` (1:N)
- `dailyReadings` → `daily_readings` (1:N)
- `reviews` → `tarotista_reviews` (1:N)
- `sessions` → `sessions` (1:N)
- `availability` → `tarotist_availability` (1:N)
- `exceptions` → `tarotist_exceptions` (1:N)
- `revenueMetrics` → `tarotista_revenue_metrics` (1:N)
- `config` → `tarotista_config` (1:1)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_tarotistas_user_id ON tarotistas(user_id);
CREATE INDEX idx_tarotistas_is_active ON tarotistas(is_active);
CREATE INDEX idx_tarotistas_is_featured ON tarotistas(is_featured);
CREATE INDEX idx_tarotistas_rating ON tarotistas(rating_promedio);
CREATE INDEX idx_tarotistas_verification ON tarotistas(verification_status);
CREATE INDEX idx_tarotistas_accepting ON tarotistas(is_accepting_new_clients);
```

---

### tarotista_config

Configuración personalizada de IA para cada tarotista. Permite múltiples versiones de configuración.

| Columna                   | Tipo         | Constraints             | Descripción                              |
| ------------------------- | ------------ | ----------------------- | ---------------------------------------- |
| `id`                      | INTEGER      | PRIMARY KEY             | ID único autoincrementable               |
| `tarotista_id`            | INTEGER      | FK tarotistas, NOT NULL | Tarotista asociado                       |
| `system_prompt`           | TEXT         | NOT NULL                | Prompt del sistema personalizado         |
| `temperature`             | DECIMAL(3,2) | DEFAULT 0.7, CHECK 0-2  | Creatividad del modelo (0.0-2.0)         |
| `max_tokens`              | INTEGER      | DEFAULT 1000            | Máximo de tokens por respuesta           |
| `top_p`                   | DECIMAL(3,2) | DEFAULT 0.9, CHECK 0-1  | Nucleus sampling (0.0-1.0)               |
| `custom_keywords`         | JSONB        | NULLABLE                | Keywords personalizados ["energía", ...] |
| `additional_instructions` | TEXT         | NULLABLE                | Instrucciones adicionales para la IA     |
| `style_config`            | JSONB        | NULLABLE                | Configuración de estilo adicional        |
| `version`                 | INTEGER      | DEFAULT 1               | Versión de la configuración              |
| `is_active`               | BOOLEAN      | DEFAULT true            | Si la configuración está activa          |
| `created_at`              | TIMESTAMP    | NOT NULL                | Fecha de creación                        |
| `updated_at`              | TIMESTAMP    | NOT NULL                | Fecha de última actualización            |

**Estructura de `style_config` (JSONB):**

```json
{
  "tone": "mystical",
  "language": "formal",
  "verbosity": "detailed"
}
```

**Constraints CHECK:**

```sql
CHECK ("temperature" >= 0 AND "temperature" <= 2)
CHECK ("top_p" >= 0 AND "top_p" <= 1)
```

**Relaciones:**

- `tarotista` ← `tarotistas` (N:1) - Un tarotista puede tener múltiples configuraciones

**Índices:**

```sql
CREATE INDEX idx_tarotista_config_tarotista_id ON tarotista_config(tarotista_id);
CREATE INDEX idx_tarotista_config_is_active ON tarotista_config(is_active);
CREATE INDEX idx_tarotista_config_version ON tarotista_config(version);
```

---

### tarotista_card_meanings

Significados personalizados de cartas por tarotista.

| Columna                   | Tipo      | Constraints             | Descripción                           |
| ------------------------- | --------- | ----------------------- | ------------------------------------- |
| `id`                      | INTEGER   | PRIMARY KEY             | ID único autoincrementable            |
| `tarotista_id`            | INTEGER   | FK tarotistas, NOT NULL | Tarotista que personalizó             |
| `card_id`                 | INTEGER   | FK tarot_card, NOT NULL | Carta del tarot                       |
| `custom_meaning_upright`  | TEXT      | NULLABLE                | Significado personalizado (normal)    |
| `custom_meaning_reversed` | TEXT      | NULLABLE                | Significado personalizado (invertida) |
| `custom_keywords`         | TEXT      | NULLABLE                | Palabras clave personalizadas         |
| `custom_description`      | TEXT      | NULLABLE                | Descripción personalizada de la carta |
| `private_notes`           | TEXT      | NULLABLE                | Notas privadas del tarotista          |
| `created_at`              | TIMESTAMP | NOT NULL                | Fecha de creación                     |
| `updated_at`              | TIMESTAMP | NOT NULL                | Fecha de última actualización         |

**Relaciones:**

- `tarotista` ← `tarotistas` (N:1)
- `card` ← `tarot_card` (N:1)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_tarotista_card_meanings_unique ON tarotista_card_meanings(tarotista_id, card_id);
CREATE INDEX idx_tarotista_card_meanings_tarotista ON tarotista_card_meanings(tarotista_id);
CREATE INDEX idx_tarotista_card_meanings_card ON tarotista_card_meanings(card_id);
```

---

### tarotista_applications

Aplicaciones de usuarios que quieren convertirse en tarotistas.

| Columna               | Tipo         | Constraints                 | Descripción                         |
| --------------------- | ------------ | --------------------------- | ----------------------------------- |
| `id`                  | INTEGER      | PRIMARY KEY                 | ID único autoincrementable          |
| `user_id`             | INTEGER      | FK users, NOT NULL          | Usuario que aplica                  |
| `nombre_publico`      | VARCHAR(100) | NOT NULL                    | Nombre público propuesto            |
| `biografia`           | TEXT         | NOT NULL                    | Biografía del aspirante             |
| `especialidades`      | TEXT[]       | DEFAULT []                  | Especialidades declaradas           |
| `motivacion`          | TEXT         | NOT NULL                    | Motivación para ser tarotista       |
| `experiencia`         | TEXT         | NOT NULL                    | Experiencia previa con tarot        |
| `status`              | ENUM         | NOT NULL, DEFAULT 'pending' | Estado: pending, approved, rejected |
| `admin_notes`         | TEXT         | NULLABLE                    | Notas del admin que revisó          |
| `reviewed_by_user_id` | INTEGER      | FK users, NULLABLE          | Admin que revisó la aplicación      |
| `reviewed_at`         | TIMESTAMP    | NULLABLE                    | Fecha de revisión                   |
| `created_at`          | TIMESTAMP    | NOT NULL                    | Fecha de aplicación                 |
| `updated_at`          | TIMESTAMP    | NOT NULL                    | Fecha de última actualización       |

**Relaciones:**

- `user` ← `users` (N:1)
- `reviewedBy` ← `users` (N:1)

**Índices:**

```sql
CREATE INDEX idx_application_user ON tarotista_applications(user_id);
CREATE INDEX idx_application_status ON tarotista_applications(status);
```

---

### tarotista_reviews

Reviews y calificaciones de tarotistas por usuarios.

| Columna                | Tipo      | Constraints                | Descripción                      |
| ---------------------- | --------- | -------------------------- | -------------------------------- |
| `id`                   | INTEGER   | PRIMARY KEY                | ID único autoincrementable       |
| `tarotista_id`         | INTEGER   | FK tarotistas, NOT NULL    | Tarotista que recibe el review   |
| `user_id`              | INTEGER   | FK users, NOT NULL         | Usuario que deja el review       |
| `reading_id`           | INTEGER   | FK tarot_reading, NULLABLE | Lectura relacionada (opcional)   |
| `rating`               | INTEGER   | NOT NULL, CHECK 1-5        | Rating del 1 al 5                |
| `comment`              | TEXT      | NULLABLE                   | Comentario del usuario           |
| `is_approved`          | BOOLEAN   | DEFAULT false              | Si fue aprobado por moderación   |
| `is_hidden`            | BOOLEAN   | DEFAULT false              | Si está oculto                   |
| `moderation_notes`     | TEXT      | NULLABLE                   | Notas internas de moderación     |
| `tarotist_response`    | TEXT      | NULLABLE                   | Respuesta del tarotista          |
| `tarotist_response_at` | TIMESTAMP | NULLABLE                   | Fecha de respuesta del tarotista |
| `created_at`           | TIMESTAMP | NOT NULL                   | Fecha de creación                |
| `updated_at`           | TIMESTAMP | NOT NULL                   | Fecha de última actualización    |

**Relaciones:**

- `tarotista` ← `tarotistas` (N:1)
- `user` ← `users` (N:1)
- `reading` ← `tarot_reading` (N:1)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_review_user_tarotista ON tarotista_reviews(user_id, tarotista_id);
CREATE INDEX idx_review_tarotista ON tarotista_reviews(tarotista_id);
CREATE INDEX idx_review_is_approved ON tarotista_reviews(is_approved);
```

---

### tarotista_revenue_metrics

Métricas de ingresos por tarotista.

| Columna             | Tipo          | Constraints                | Descripción                             |
| ------------------- | ------------- | -------------------------- | --------------------------------------- |
| `id`                | INTEGER       | PRIMARY KEY                | ID único autoincrementable              |
| `tarotista_id`      | INTEGER       | FK tarotistas, NOT NULL    | Tarotista                               |
| `user_id`           | INTEGER       | FK users, NOT NULL         | Usuario que generó el ingreso           |
| `reading_id`        | INTEGER       | FK tarot_reading, NULLABLE | Lectura relacionada                     |
| `subscription_type` | ENUM          | NOT NULL                   | Tipo: favorite, premium_individual, etc |
| `revenue_share_usd` | DECIMAL(10,2) | NOT NULL                   | Ingreso del tarotista (post-comisión)   |
| `platform_fee_usd`  | DECIMAL(10,2) | NOT NULL                   | Comisión de la plataforma               |
| `total_revenue_usd` | DECIMAL(10,2) | NOT NULL                   | Ingreso total                           |
| `calculation_date`  | DATE          | NOT NULL                   | Fecha de cálculo                        |
| `period_start`      | DATE          | NOT NULL                   | Inicio del período                      |
| `period_end`        | DATE          | NOT NULL                   | Fin del período                         |
| `metadata`          | JSONB         | NULLABLE                   | Metadata adicional                      |
| `created_at`        | TIMESTAMP     | NOT NULL                   | Fecha de creación                       |

**Check Constraints:**

```sql
CHECK ("revenue_share_usd" + "platform_fee_usd" = "total_revenue_usd")
```

**Índices:**

```sql
CREATE INDEX idx_revenue_tarotista_date ON tarotista_revenue_metrics(tarotista_id, calculation_date);
CREATE INDEX idx_revenue_period ON tarotista_revenue_metrics(tarotista_id, period_start, period_end);
```

---

### user_tarotista_subscriptions

Suscripciones de usuarios a tarotistas específicos.

| Columna                  | Tipo         | Constraints             | Descripción                           |
| ------------------------ | ------------ | ----------------------- | ------------------------------------- |
| `id`                     | INTEGER      | PRIMARY KEY             | ID único autoincrementable            |
| `user_id`                | INTEGER      | FK users, NOT NULL      | Usuario suscrito                      |
| `tarotista_id`           | INTEGER      | FK tarotistas, NULLABLE | Tarotista (null para all-access)      |
| `subscription_type`      | ENUM         | NOT NULL                | Tipo de suscripción                   |
| `status`                 | ENUM         | DEFAULT 'active'        | Estado de la suscripción              |
| `started_at`             | TIMESTAMP    | DEFAULT NOW()           | Fecha de inicio                       |
| `expires_at`             | TIMESTAMP    | NULLABLE                | Fecha de expiración                   |
| `cancelled_at`           | TIMESTAMP    | NULLABLE                | Fecha de cancelación                  |
| `can_change_at`          | TIMESTAMP    | NULLABLE                | Fecha permitida para cambiar favorito |
| `change_count`           | INTEGER      | DEFAULT 0               | Veces que cambió de favorito          |
| `stripe_subscription_id` | VARCHAR(255) | NULLABLE                | ID de suscripción en Stripe           |
| `created_at`             | TIMESTAMP    | NOT NULL                | Fecha de creación                     |
| `updated_at`             | TIMESTAMP    | NOT NULL                | Fecha de última actualización         |

**Enums:**

```typescript
// SubscriptionType
enum SubscriptionType {
  FAVORITE = 'favorite', // FREE: 1 tarotista favorito
  PREMIUM_INDIVIDUAL = 'premium_individual', // PREMIUM: 1 específico
  PREMIUM_ALL_ACCESS = 'premium_all_access', // PREMIUM: todos
}
```

**Relaciones:**

- `user` ← `users` (N:1)
- `tarotista` ← `tarotistas` (N:1)

---

### daily_readings

Carta del día generada diariamente para cada usuario.

| Columna           | Tipo      | Constraints             | Descripción                      |
| ----------------- | --------- | ----------------------- | -------------------------------- |
| `id`              | INTEGER   | PRIMARY KEY             | ID único autoincrementable       |
| `user_id`         | INTEGER   | FK users, NOT NULL      | Usuario                          |
| `tarotista_id`    | INTEGER   | FK tarotistas, NOT NULL | Tarotista                        |
| `card_id`         | INTEGER   | FK tarot_card, NOT NULL | Carta seleccionada               |
| `orientation`     | ENUM      | NOT NULL                | 'upright' o 'reversed'           |
| `interpretation`  | TEXT      | NOT NULL                | Interpretación generada          |
| `reading_date`    | DATE      | NOT NULL                | Fecha de la lectura (solo fecha) |
| `was_regenerated` | BOOLEAN   | DEFAULT false           | Si fue regenerada (premium)      |
| `created_at`      | TIMESTAMP | NOT NULL                | Fecha de creación                |
| `updated_at`      | TIMESTAMP | NOT NULL                | Fecha de última actualización    |

**Relaciones:**

- `user` ← `users` (N:1)
- `tarotista` ← `tarotistas` (N:1)
- `card` ← `tarot_card` (N:1)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_daily_readings_unique ON daily_readings(user_id, reading_date, tarotista_id);
CREATE INDEX idx_daily_readings_user_date ON daily_readings(user_id, reading_date);
```

---

### usage_limit

Seguimiento de límites de uso por usuario y plan.

| Columna           | Tipo      | Constraints             | Descripción                           |
| ----------------- | --------- | ----------------------- | ------------------------------------- |
| `id`              | INTEGER   | PRIMARY KEY             | ID único autoincrementable            |
| `user_id`         | INTEGER   | FK users, NOT NULL      | Usuario                               |
| `feature`         | ENUM      | NOT NULL                | 'tarot_reading', 'oracle_query', etc. |
| `used_today`      | INTEGER   | DEFAULT 0               | Usos hoy                              |
| `limit_per_day`   | INTEGER   | NOT NULL                | Límite diario                         |
| `last_reset_date` | DATE      | NOT NULL                | Última vez que se reseteó             |
| `tarotista_id`    | INTEGER   | FK tarotistas, NULLABLE | Tarotista específico (opcional)       |
| `created_at`      | TIMESTAMP | NOT NULL                | Fecha de creación                     |
| `updated_at`      | TIMESTAMP | NOT NULL                | Fecha de última actualización         |

**Relaciones:**

- `user` ← `users` (N:1)
- `tarotista` ← `tarotistas` (N:1)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_usage_limit_unique
  ON usage_limit(user_id, feature, COALESCE(tarotista_id, 0));
CREATE INDEX idx_usage_limit_user_id ON usage_limit(user_id);
```

---

### audit_logs

Logs de auditoría para acciones críticas del sistema.

| Columna          | Tipo         | Constraints        | Descripción                    |
| ---------------- | ------------ | ------------------ | ------------------------------ |
| `id`             | UUID         | PRIMARY KEY        | ID único UUID                  |
| `user_id`        | INTEGER      | FK users, NULLABLE | Usuario que realizó la acción  |
| `target_user_id` | INTEGER      | FK users, NULLABLE | Usuario afectado por la acción |
| `action`         | ENUM         | NOT NULL           | Acción (AuditAction enum)      |
| `entity_type`    | VARCHAR(100) | NOT NULL           | Tipo de entidad afectada       |
| `entity_id`      | VARCHAR(255) | NOT NULL           | ID de la entidad afectada      |
| `old_value`      | JSONB        | NULLABLE           | Valor anterior                 |
| `new_value`      | JSONB        | NOT NULL           | Valor nuevo                    |
| `ip_address`     | VARCHAR(45)  | NULLABLE           | IP del usuario                 |
| `user_agent`     | TEXT         | NULLABLE           | User agent del navegador       |
| `created_at`     | TIMESTAMP    | NOT NULL           | Fecha de creación              |

**Enum AuditAction:**

```typescript
enum AuditAction {
  USER_CREATED = 'user_created',
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  USER_DELETED = 'user_deleted',
  ROLE_ADDED = 'role_added',
  ROLE_REMOVED = 'role_removed',
  PLAN_CHANGED = 'plan_changed',
  READING_DELETED = 'reading_deleted',
  READING_RESTORED = 'reading_restored',
  CARD_MODIFIED = 'card_modified',
  SPREAD_MODIFIED = 'spread_modified',
  CONFIG_CHANGED = 'config_changed',
}
```

**Índices:**

```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, created_at);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_user_id, created_at);
```

---

## Tablas de Autenticación

### refresh_tokens

Tokens de refresco para autenticación JWT.

| Columna      | Tipo         | Constraints        | Descripción                    |
| ------------ | ------------ | ------------------ | ------------------------------ |
| `id`         | UUID         | PRIMARY KEY        | ID único UUID                  |
| `user_id`    | INTEGER      | FK users, NOT NULL | Usuario propietario del token  |
| `token`      | VARCHAR(500) | NOT NULL           | Token de refresh               |
| `token_hash` | VARCHAR(64)  | NOT NULL           | Hash del token para validación |
| `expires_at` | TIMESTAMP    | NOT NULL           | Fecha de expiración            |
| `created_at` | TIMESTAMP    | NOT NULL           | Fecha de creación              |
| `revoked_at` | TIMESTAMP    | NULLABLE           | Fecha de revocación            |
| `ip_address` | VARCHAR(45)  | NULLABLE           | IP desde donde se creó         |
| `user_agent` | VARCHAR(500) | NULLABLE           | User agent del navegador       |

**Métodos:**

- `isExpired()`: Verifica si el token ha expirado
- `isRevoked()`: Verifica si fue revocado
- `isValid()`: Verifica si es válido (no expirado ni revocado)
- `revoke()`: Revoca el token

**Índices:**

```sql
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id, token);
CREATE INDEX idx_refresh_token_hash ON refresh_tokens(token_hash);
```

---

### password_reset_tokens

Tokens para recuperación de contraseña.

| Columna      | Tipo        | Constraints        | Descripción                   |
| ------------ | ----------- | ------------------ | ----------------------------- |
| `id`         | UUID        | PRIMARY KEY        | ID único UUID                 |
| `user_id`    | INTEGER     | FK users, NOT NULL | Usuario que solicitó el reset |
| `token`      | VARCHAR(64) | NOT NULL           | Token hasheado                |
| `expires_at` | TIMESTAMP   | NOT NULL           | Fecha de expiración           |
| `used_at`    | TIMESTAMP   | NULLABLE           | Fecha en que se usó           |
| `created_at` | TIMESTAMP   | NOT NULL           | Fecha de creación             |

---

## Tablas de Scheduling

### sessions

Sesiones programadas entre usuarios y tarotistas.

| Columna               | Tipo          | Constraints             | Descripción                |
| --------------------- | ------------- | ----------------------- | -------------------------- |
| `id`                  | INTEGER       | PRIMARY KEY             | ID único autoincrementable |
| `tarotista_id`        | INTEGER       | FK tarotistas, NOT NULL | Tarotista de la sesión     |
| `user_id`             | INTEGER       | FK users, NOT NULL      | Usuario que reservó        |
| `session_date`        | DATE          | NOT NULL                | Fecha de la sesión         |
| `session_time`        | TIME          | NOT NULL                | Hora de inicio (HH:MM)     |
| `duration_minutes`    | INTEGER       | NOT NULL                | Duración en minutos        |
| `session_type`        | ENUM          | NOT NULL                | Tipo de sesión             |
| `status`              | ENUM          | DEFAULT 'pending'       | Estado de la sesión        |
| `price_usd`           | DECIMAL(10,2) | NOT NULL                | Precio en USD              |
| `payment_status`      | ENUM          | DEFAULT 'pending'       | Estado del pago            |
| `google_meet_link`    | VARCHAR(255)  | NOT NULL                | Link de Google Meet        |
| `user_email`          | VARCHAR(255)  | NOT NULL                | Email del usuario          |
| `user_notes`          | TEXT          | NULLABLE                | Notas del usuario          |
| `tarotist_notes`      | TEXT          | NULLABLE                | Notas del tarotista        |
| `cancelled_at`        | TIMESTAMP     | NULLABLE                | Fecha de cancelación       |
| `cancellation_reason` | TEXT          | NULLABLE                | Razón de cancelación       |
| `confirmed_at`        | TIMESTAMP     | NULLABLE                | Fecha de confirmación      |
| `completed_at`        | TIMESTAMP     | NULLABLE                | Fecha de completado        |
| `created_at`          | TIMESTAMP     | NOT NULL                | Fecha de creación          |
| `updated_at`          | TIMESTAMP     | NOT NULL                | Fecha de actualización     |

**Enums:**

```typescript
enum SessionType {
  VIDEO_CALL = 'video_call',
  PHONE_CALL = 'phone_call',
  CHAT = 'chat',
}

enum SessionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}
```

**Índices:**

```sql
CREATE INDEX idx_session_tarotista_date ON sessions(tarotista_id, session_date, session_time);
CREATE INDEX idx_session_user_date ON sessions(user_id, session_date);
CREATE INDEX idx_session_status ON sessions(status);
```

---

### tarotist_availability

Disponibilidad semanal de los tarotistas.

| Columna        | Tipo      | Constraints             | Descripción                    |
| -------------- | --------- | ----------------------- | ------------------------------ |
| `id`           | INTEGER   | PRIMARY KEY             | ID único autoincrementable     |
| `tarotista_id` | INTEGER   | FK tarotistas, NOT NULL | Tarotista                      |
| `day_of_week`  | INTEGER   | NOT NULL                | Día (0=Dom, 1=Lun, ..., 6=Sab) |
| `start_time`   | TIME      | NOT NULL                | Hora de inicio (HH:MM)         |
| `end_time`     | TIME      | NOT NULL                | Hora de fin (HH:MM)            |
| `is_active`    | BOOLEAN   | DEFAULT true            | Si este bloque está activo     |
| `created_at`   | TIMESTAMP | NOT NULL                | Fecha de creación              |
| `updated_at`   | TIMESTAMP | NOT NULL                | Fecha de actualización         |

**Índices:**

```sql
CREATE INDEX idx_availability_tarotista_day ON tarotist_availability(tarotista_id, day_of_week);
```

---

### tarotist_exceptions

Excepciones de disponibilidad (vacaciones, horarios especiales).

| Columna          | Tipo      | Constraints             | Descripción                   |
| ---------------- | --------- | ----------------------- | ----------------------------- |
| `id`             | INTEGER   | PRIMARY KEY             | ID único autoincrementable    |
| `tarotista_id`   | INTEGER   | FK tarotistas, NOT NULL | Tarotista                     |
| `exception_date` | DATE      | NOT NULL                | Fecha de la excepción         |
| `exception_type` | ENUM      | NOT NULL                | Tipo: blocked, custom_hours   |
| `start_time`     | TIME      | NULLABLE                | Hora inicio (si custom_hours) |
| `end_time`       | TIME      | NULLABLE                | Hora fin (si custom_hours)    |
| `reason`         | TEXT      | NULLABLE                | Razón de la excepción         |
| `created_at`     | TIMESTAMP | NOT NULL                | Fecha de creación             |

**Índices:**

```sql
CREATE UNIQUE INDEX idx_exception_tarotista_date ON tarotist_exceptions(tarotista_id, exception_date);
```

---

## Tablas de Monitoreo

### ai_usage_logs

Logs de uso de proveedores de IA.

| Columna             | Tipo          | Constraints            | Descripción                        |
| ------------------- | ------------- | ---------------------- | ---------------------------------- |
| `id`                | UUID          | PRIMARY KEY            | ID único UUID                      |
| `user_id`           | INTEGER       | FK users, NULLABLE     | Usuario que hizo la petición       |
| `reading_id`        | INTEGER       | FK tarot_reading, NULL | Lectura relacionada                |
| `tarotista_id`      | INTEGER       | NULLABLE               | Tarotista asociado                 |
| `provider`          | ENUM          | NOT NULL               | Proveedor: groq, openai, deepseek  |
| `model_used`        | VARCHAR(100)  | NOT NULL               | Modelo usado (llama-3.1-70b, etc.) |
| `prompt_tokens`     | INTEGER       | DEFAULT 0              | Tokens del prompt                  |
| `completion_tokens` | INTEGER       | DEFAULT 0              | Tokens de la respuesta             |
| `total_tokens`      | INTEGER       | DEFAULT 0              | Total de tokens                    |
| `cost_usd`          | DECIMAL(10,6) | DEFAULT 0              | Costo en USD                       |
| `duration_ms`       | INTEGER       | DEFAULT 0              | Duración en milisegundos           |
| `status`            | ENUM          | DEFAULT 'success'      | Estado: success, error, cached     |
| `error_message`     | TEXT          | NULLABLE               | Mensaje de error si falló          |
| `fallback_used`     | BOOLEAN       | DEFAULT false          | Si se usó fallback                 |
| `created_at`        | TIMESTAMP     | NOT NULL               | Fecha de creación                  |

**Enums:**

```typescript
enum AIProvider {
  GROQ = 'groq',
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

enum AIUsageStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  CACHED = 'cached',
}
```

**Índices:**

```sql
CREATE INDEX idx_ai_usage_user ON ai_usage_logs(user_id, created_at);
CREATE INDEX idx_ai_usage_provider ON ai_usage_logs(provider, created_at);
```

---

### security_events

Eventos de seguridad del sistema.

| Columna      | Tipo        | Constraints        | Descripción                            |
| ------------ | ----------- | ------------------ | -------------------------------------- |
| `id`         | UUID        | PRIMARY KEY        | ID único UUID                          |
| `event_type` | ENUM        | NOT NULL           | Tipo de evento de seguridad            |
| `user_id`    | INTEGER     | FK users, NULLABLE | Usuario relacionado                    |
| `ip_address` | VARCHAR(45) | NULLABLE           | IP del evento                          |
| `user_agent` | TEXT        | NULLABLE           | User agent                             |
| `severity`   | ENUM        | NOT NULL           | Severidad: low, medium, high, critical |
| `details`    | JSONB       | NULLABLE           | Detalles adicionales                   |
| `created_at` | TIMESTAMP   | NOT NULL           | Fecha de creación                      |

**Índices:**

```sql
CREATE INDEX idx_security_user ON security_events(user_id, created_at);
CREATE INDEX idx_security_type ON security_events(event_type, created_at);
CREATE INDEX idx_security_severity ON security_events(severity, created_at);
CREATE INDEX idx_security_ip ON security_events(ip_address, created_at);
```

---

### cached_interpretations

Caché de interpretaciones generadas por IA.

| Columna               | Tipo         | Constraints      | Descripción                    |
| --------------------- | ------------ | ---------------- | ------------------------------ |
| `id`                  | UUID         | PRIMARY KEY      | ID único UUID                  |
| `cache_key`           | VARCHAR(255) | UNIQUE, NOT NULL | Clave única del caché          |
| `tarotista_id`        | INTEGER      | NULLABLE         | Tarotista asociado             |
| `spread_id`           | INTEGER      | NULLABLE         | Tipo de tirada                 |
| `card_combination`    | JSONB        | NOT NULL         | Combinación de cartas cacheada |
| `question_hash`       | VARCHAR(64)  | NOT NULL         | Hash de la pregunta            |
| `interpretation_text` | TEXT         | NOT NULL         | Interpretación cacheada        |
| `hit_count`           | INTEGER      | DEFAULT 0        | Veces que se usó el caché      |
| `last_used_at`        | TIMESTAMP    | NULLABLE         | Última vez que se usó          |
| `created_at`          | TIMESTAMP    | NOT NULL         | Fecha de creación              |
| `expires_at`          | TIMESTAMP    | NOT NULL         | Fecha de expiración            |

**Estructura de `card_combination` (JSONB):**

```json
[
  { "card_id": "1", "position": 0, "is_reversed": false },
  { "card_id": "15", "position": 1, "is_reversed": true }
]
```

**Índices:**

```sql
CREATE INDEX idx_cache_key ON cached_interpretations(cache_key);
CREATE INDEX idx_cache_tarotista_spread ON cached_interpretations(tarotista_id, spread_id, question_hash);
CREATE INDEX idx_cache_tarotista_created ON cached_interpretations(tarotista_id, created_at);
```

---

## Relaciones

### User - TarotReading (1:N)

Un usuario puede tener muchas lecturas:

```typescript
// User entity
@OneToMany(() => TarotReading, (reading) => reading.user)
readings: TarotReading[];

// TarotReading entity
@ManyToOne(() => User)
@JoinColumn({ name: 'user_id' })
user: User;
```

### TarotReading - TarotCard (N:M)

Una lectura tiene múltiples cartas, una carta puede estar en múltiples lecturas:

```typescript
// TarotReading entity
@ManyToMany(() => TarotCard, (card) => card.readings)
@JoinTable()
cards: TarotCard[];

// TarotCard entity
@ManyToMany(() => TarotReading, (reading) => reading.cards)
readings: TarotReading[];
```

**Tabla join automática:** `tarot_reading_cards_tarot_card`

### TarotReading - TarotInterpretation (1:N)

Una lectura puede tener múltiples interpretaciones (historial):

```typescript
// TarotReading entity
@OneToMany(() => TarotInterpretation, (interpretation) => interpretation.reading)
interpretations: TarotInterpretation[];

// TarotInterpretation entity
@ManyToOne(() => TarotReading)
@JoinColumn({ name: 'reading_id' })
reading: TarotReading;
```

---

## Índices y Performance

### Índices Críticos

Los siguientes índices son críticos para performance:

```sql
-- Búsquedas por usuario (más común)
CREATE INDEX idx_tarot_reading_user_id ON tarot_reading(user_id);
CREATE INDEX idx_usage_limit_user_id ON usage_limit(user_id);

-- Ordenamiento por fecha (listados)
CREATE INDEX idx_tarot_reading_created_at ON tarot_reading(created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Soft deletes
CREATE INDEX idx_tarot_reading_deleted_at ON tarot_reading(deleted_at);

-- Lecturas compartidas
CREATE UNIQUE INDEX idx_tarot_reading_shared_token
  ON tarot_reading(shared_token)
  WHERE shared_token IS NOT NULL;

-- Daily readings (unique constraint)
CREATE UNIQUE INDEX idx_daily_readings_unique
  ON daily_readings(user_id, reading_date, tarotista_id);

-- Full-text search (futuro)
-- CREATE INDEX idx_tarot_card_keywords_gin
--   ON tarot_card USING GIN(to_tsvector('english', keywords));
```

### Query Optimization Tips

**❌ No optimizado:**

```typescript
// Carga todas las relaciones siempre (N+1 queries)
const readings = await readingRepo.find({
  relations: ['user', 'cards', 'deck', 'interpretations'],
});
```

**✅ Optimizado:**

```typescript
// Solo carga lo necesario
const readings = await readingRepo
  .createQueryBuilder('reading')
  .leftJoinAndSelect('reading.deck', 'deck')
  .where('reading.userId = :userId', { userId })
  .orderBy('reading.createdAt', 'DESC')
  .take(10)
  .getMany();
```

---

## Migraciones

### Estrategia de Migraciones

TypeORM genera migraciones automáticamente basándose en cambios en entities:

```bash
# 1. Hacer cambios en entity
# Ejemplo: Agregar columna `email_verified` a User

# 2. Generar migración
npm run migration:generate -- -n AddEmailVerifiedToUser

# 3. Revisar archivo generado
# src/database/migrations/1699999999-AddEmailVerifiedToUser.ts

# 4. Ejecutar migración
npm run migration:run

# 5. Si algo sale mal, revertir
npm run migration:revert
```

### Estructura de Migración

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerifiedToUser1699999999 implements MigrationInterface {
  name = 'AddEmailVerifiedToUser1699999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_users_email_verified" 
      ON "users" ("email_verified")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "idx_users_email_verified"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "email_verified"
    `);
  }
}
```

### Best Practices de Migraciones

✅ **DO:**

- Siempre incluir `up` Y `down` (rollback)
- Testear migraciones en desarrollo primero
- Hacer backup antes de migración en producción
- Una migración por cambio lógico
- Nombrar descriptivamente: `AddEmailVerifiedToUser`, no `Migration1`

❌ **DON'T:**

- Editar migraciones ya ejecutadas en producción
- Mezclar múltiples cambios no relacionados
- Olvidar agregar índices en `down()`
- Usar `synchronize: true` en producción (peligroso)

### Ver Estado de Migraciones

```bash
# Ver migraciones ejecutadas
npm run migration:show

# Output:
# [X] AddEmailVerifiedToUser1699999999
# [X] CreateTarotReadingTable1699999998
# [ ] AddStripeCustomerId1700000000  # Pendiente
```

---

## Seeders

### Seeders Disponibles

#### 1. Seed de Cartas (78 cartas Rider-Waite)

```bash
npm run db:seed:cards
```

Crea las 78 cartas del tarot:

- 22 Arcanos Mayores (0-21)
- 56 Arcanos Menores (14 por palo: copas, bastos, espadas, oros)

#### 2. Seed de Usuarios

```bash
npm run db:seed:users
```

Crea usuarios de prueba:

```typescript
{
  email: 'admin@example.com',
  password: 'admin123', // Hash bcrypt
  name: 'Admin User',
  roles: [UserRole.ADMIN],
  plan: UserPlan.PREMIUM,
}
```

#### 3. Seed Completo

```bash
npm run db:seed:all
```

Ejecuta todos los seeders en orden.

### Crear Seeder Personalizado

```typescript
// scripts/seed-custom.ts
import { AppDataSource } from '../src/config/data-source';
import { ReadingCategory } from '../src/modules/categories/entities/reading-category.entity';

async function seedCategories() {
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(ReadingCategory);

  const categories = [
    {
      name: 'Amor y Relaciones',
      slug: 'amor-relaciones',
      description: 'Preguntas sobre relaciones románticas',
      color: '#FF6B9D',
      icon: '❤️',
    },
    {
      name: 'Trabajo y Carrera',
      slug: 'trabajo-carrera',
      description: 'Preguntas sobre vida profesional',
      color: '#4A90E2',
      icon: '💼',
    },
  ];

  await categoryRepo.save(categories);

  console.log('✅ Categories seeded');
  await AppDataSource.destroy();
}

seedCategories();
```

Ejecutar:

```bash
ts-node -r tsconfig-paths/register scripts/seed-custom.ts
```

---

## Connection Pooling

### Configuración en Producción

En `src/config/database.config.ts`:

```typescript
export default registerAs('database', () => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // NUNCA true en producción
  logging: process.env.NODE_ENV === 'development',

  // Connection Pooling
  extra: {
    max: 25, // Máximo de conexiones en el pool
    min: 5, // Mínimo de conexiones mantenidas
    idleTimeoutMillis: 30000, // 30s timeout para conexiones idle
    connectionTimeoutMillis: 30000, // 30s timeout para adquirir conexión
  },
}));
```

### Monitoreo de Conexiones

```sql
-- Ver conexiones activas
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'tarot_db';

-- Ver detalles de conexiones
SELECT
  pid,
  usename,
  application_name,
  state,
  query
FROM pg_stat_activity
WHERE datname = 'tarot_db';

-- Terminar conexión específica
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = 12345;
```

---

## Backup y Restore

### Backup Manual

```bash
# Backup completo
pg_dump -h localhost -p 5435 -U tarot_user tarot_db > backup_$(date +%Y%m%d).sql

# Backup solo schema
pg_dump -h localhost -p 5435 -U tarot_user --schema-only tarot_db > schema_backup.sql

# Backup solo datos
pg_dump -h localhost -p 5435 -U tarot_user --data-only tarot_db > data_backup.sql

# Backup de tabla específica
pg_dump -h localhost -p 5435 -U tarot_user -t tarot_reading tarot_db > readings_backup.sql
```

### Restore

```bash
# Restore completo
psql -h localhost -p 5435 -U tarot_user tarot_db < backup_20251120.sql

# Restore con drop/create
psql -h localhost -p 5435 -U postgres -c "DROP DATABASE tarot_db;"
psql -h localhost -p 5435 -U postgres -c "CREATE DATABASE tarot_db OWNER tarot_user;"
psql -h localhost -p 5435 -U tarot_user tarot_db < backup_20251120.sql
```

### Backup Automatizado

Crear script `scripts/backup-db.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="tarot_backup_${DATE}.sql"

# Crear backup
pg_dump -h localhost -p 5435 -U tarot_user tarot_db > "${BACKUP_DIR}/${FILENAME}"

# Comprimir
gzip "${BACKUP_DIR}/${FILENAME}"

# Mantener solo últimos 7 días
find ${BACKUP_DIR} -name "tarot_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completado: ${FILENAME}.gz"
```

Agregar a crontab (diario a las 2 AM):

```bash
0 2 * * * /path/to/scripts/backup-db.sh
```

### Backup en Render

Render hace backups automáticos diarios (plan Starter o superior):

- Retención: 7 días
- Restauración: Desde dashboard → Database → Backups → Restore

---

## Troubleshooting

### Error: "too many connections"

**Solución:**

```sql
-- Ver límite de conexiones
SHOW max_connections;

-- Aumentar límite (requiere restart)
ALTER SYSTEM SET max_connections = 200;

-- O ajustar pool size en app
extra: { max: 10 }  // Reducir de 25 a 10
```

### Query Lenta

**Investigar:**

```sql
-- Habilitar query logging
ALTER DATABASE tarot_db SET log_min_duration_statement = 1000; -- 1s

-- Ver queries lentas
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Migración Falló

**Rollback:**

```bash
# Revertir última migración
npm run migration:revert

# Ver qué migraciones están ejecutadas
npm run migration:show
```

---

**Versión**: 1.1.0  
**Última actualización**: Diciembre 2025  
**PostgreSQL Version**: 16  
**TypeORM Version**: 0.3.x  
**Relacionado**: [DATABASE_POOLING.md](./DATABASE_POOLING.md), [ARCHITECTURE.md](./ARCHITECTURE.md)
