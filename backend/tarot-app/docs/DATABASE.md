# 🗄️ Database Documentation - TarotFlavia

## Tabla de Contenidos

- [Overview](#overview)
- [Diagrama ER](#diagrama-er)
- [Tablas Principales](#tablas-principales)
- [Relaciones](#relaciones)
- [Índices y Performance](#índices-y-performance)
- [Migraciones](#migraciones)
- [Seeders](#seeders)
- [Connection Pooling](#connection-pooling)
- [Backup y Restore](#backup-y-restore)

---

## Overview

### Tecnología

- **DBMS**: PostgreSQL 15+
- **ORM**: TypeORM 0.3.x
- **Connection Pooling**: Configurado en production
- **Migraciones**: TypeORM CLI
- **Seeds**: Scripts TypeScript personalizados

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
┌─────────────┐        ┌──────────────────┐        ┌─────────────┐
│    User     │────────│  TarotReading    │────────│  TarotCard  │
│             │ 1    * │                  │ *    * │             │
│ - id        │        │ - id             │        │ - id        │
│ - email     │        │ - userId         │        │ - name      │
│ - password  │        │ - spreadId       │        │ - arcana    │
│ - name      │        │ - tarotistaId    │        │ - number    │
│ - roles[]   │        │ - questionType   │        │ - suit      │
│ - plan      │        │ - interpretation │        └─────────────┘
└─────────────┘        │ - cards (JSONB)  │
      │                │ - createdAt      │        ┌─────────────┐
      │                └──────────────────┘────────│ TarotSpread │
      │                        │                   │             │
      │                        │ 1                 │ - id        │
      │                        │                   │ - name      │
      │                        │                   │ - cardCount │
      │                        │ *                 │ - positions │
      │                ┌──────────────────┐        └─────────────┘
      │                │ Tarot            │
      │                │ Interpretation   │        ┌─────────────┐
      │                │                  │        │ Tarotista   │
      └────────────────│ - id             │        │             │
                       │ - readingId      │        │ - id        │
                       │ - interpretation │◄───────│ - userId    │
                       │ - aiProvider     │        │ - config    │
                       │ - model          │        │ - active    │
                       └──────────────────┘        └─────────────┘

┌─────────────────┐        ┌──────────────────────┐
│ ReadingCategory │        │ PredefinedQuestion   │
│                 │        │                      │
│ - id            │        │ - id                 │
│ - name          │────────│ - categoryId         │
│ - slug          │ 1    * │ - question           │
│ - description   │        │ - isActive           │
│ - color         │        │ - usageCount         │
└─────────────────┘        └──────────────────────┘

┌──────────────────┐        ┌────────────────────┐
│ DailyReading     │        │ UsageLimit         │
│                  │        │                    │
│ - id             │        │ - id               │
│ - userId         │        │ - userId           │
│ - tarotistaId    │        │ - feature          │
│ - cardId         │        │ - usedToday        │
│ - readingDate    │        │ - limitPerDay      │
│ - interpretation │        │ - lastResetDate    │
└──────────────────┘        └────────────────────┘
```

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

**Relaciones:**

- `readings` → `tarot_reading` (1:N)
- `daily_readings` → `daily_readings` (1:N)
- `usage_limits` → `usage_limit` (1:N)
- `tarotista` → `tarotistas` (1:1)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_plan ON users(plan);
```

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

| Columna              | Tipo          | Constraints                | Descripción                                |
| -------------------- | ------------- | -------------------------- | ------------------------------------------ |
| `id`                 | INTEGER       | PRIMARY KEY                | ID único autoincrementable                 |
| `reading_id`         | INTEGER       | FK tarot_reading, NOT NULL | Lectura asociada                           |
| `interpretation`     | TEXT          | NOT NULL                   | Interpretación completa generada           |
| `ai_provider`        | VARCHAR(50)   | NOT NULL                   | Proveedor: 'openai', 'anthropic', 'groq'   |
| `model`              | VARCHAR(100)  | NOT NULL                   | Modelo: 'gpt-4-turbo', 'claude-3-5-sonnet' |
| `prompt_tokens`      | INTEGER       | DEFAULT 0                  | Tokens usados en el prompt                 |
| `completion_tokens`  | INTEGER       | DEFAULT 0                  | Tokens usados en la respuesta              |
| `cost_usd`           | DECIMAL(10,4) | DEFAULT 0                  | Costo estimado en USD                      |
| `generation_time_ms` | INTEGER       | NULLABLE                   | Tiempo de generación en ms                 |
| `created_at`         | TIMESTAMP     | NOT NULL                   | Fecha de creación                          |

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

Información de los tarotistas profesionales.

| Columna        | Tipo      | Constraints                | Descripción                       |
| -------------- | --------- | -------------------------- | --------------------------------- |
| `id`           | INTEGER   | PRIMARY KEY                | ID único autoincrementable        |
| `user_id`      | INTEGER   | FK users, UNIQUE, NOT NULL | Usuario asociado                  |
| `display_name` | VARCHAR   | NOT NULL                   | Nombre público                    |
| `bio`          | TEXT      | NULLABLE                   | Biografía                         |
| `specialties`  | VARCHAR[] | DEFAULT []                 | Especialidades                    |
| `is_active`    | BOOLEAN   | DEFAULT true               | Si está activo                    |
| `ai_config`    | JSONB     | NOT NULL                   | Configuración de IA personalizada |
| `created_at`   | TIMESTAMP | NOT NULL                   | Fecha de creación                 |
| `updated_at`   | TIMESTAMP | NOT NULL                   | Fecha de última actualización     |

**Estructura de `ai_config` (JSONB):**

```json
{
  "provider": "openai",
  "model": "gpt-4-turbo",
  "systemPrompt": "Eres Flavia, una tarotista profesional...",
  "temperature": 0.7
}
```

**Relaciones:**

- `user` ← `users` (1:1)
- `readings` → `tarot_reading` (1:N)
- `dailyReadings` → `daily_readings` (1:N)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_tarotistas_user_id ON tarotistas(user_id);
CREATE INDEX idx_tarotistas_is_active ON tarotistas(is_active);
```

---

### tarotista_config

Configuración personalizada de IA para cada tarotista.

| Columna         | Tipo         | Constraints                    | Descripción                           |
| --------------- | ------------ | ------------------------------ | ------------------------------------- |
| `id`            | INTEGER      | PRIMARY KEY                    | ID único autoincrementable            |
| `tarotista_id`  | INTEGER      | FK tarotistas, UNIQUE NOT NULL | Tarotista asociado                    |
| `system_prompt` | TEXT         | NOT NULL                       | Prompt del sistema personalizado      |
| `temperature`   | DECIMAL(3,2) | DEFAULT 0.7                    | Creatividad del modelo (0.0-2.0)      |
| `max_tokens`    | INTEGER      | DEFAULT 500                    | Máximo de tokens por respuesta        |
| `top_p`         | DECIMAL(3,2) | DEFAULT 0.9                    | Nucleus sampling (0.0-1.0)            |
| `provider`      | VARCHAR(50)  | DEFAULT 'openai'               | Proveedor de IA (openai, anthropic)   |
| `model`         | VARCHAR(100) | NULLABLE                       | Modelo específico (gpt-4-turbo, etc.) |
| `style_config`  | JSONB        | NULLABLE                       | Configuración de estilo adicional     |
| `is_active`     | BOOLEAN      | DEFAULT true                   | Si la configuración está activa       |
| `created_at`    | TIMESTAMP    | NOT NULL                       | Fecha de creación                     |
| `updated_at`    | TIMESTAMP    | NOT NULL                       | Fecha de última actualización         |

**Relaciones:**

- `tarotista` ← `tarotistas` (1:1)

**Índices:**

```sql
CREATE UNIQUE INDEX idx_tarotista_config_tarotista_id ON tarotista_config(tarotista_id);
CREATE INDEX idx_tarotista_config_is_active ON tarotista_config(is_active);
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

Logs de auditoría para acciones críticas.

| Columna       | Tipo      | Constraints        | Descripción                                |
| ------------- | --------- | ------------------ | ------------------------------------------ |
| `id`          | INTEGER   | PRIMARY KEY        | ID único autoincrementable                 |
| `user_id`     | INTEGER   | FK users, NULLABLE | Usuario que realizó la acción              |
| `action`      | VARCHAR   | NOT NULL           | Acción: 'user.ban', 'reading.delete', etc. |
| `entity_type` | VARCHAR   | NULLABLE           | Tipo de entidad afectada                   |
| `entity_id`   | VARCHAR   | NULLABLE           | ID de la entidad afectada                  |
| `details`     | JSONB     | NULLABLE           | Detalles adicionales                       |
| `ip_address`  | VARCHAR   | NULLABLE           | IP del usuario                             |
| `user_agent`  | TEXT      | NULLABLE           | User agent del navegador                   |
| `created_at`  | TIMESTAMP | NOT NULL           | Fecha de creación                          |

**Índices:**

```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
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

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025  
**PostgreSQL Version**: 15+  
**TypeORM Version**: 0.3.x
