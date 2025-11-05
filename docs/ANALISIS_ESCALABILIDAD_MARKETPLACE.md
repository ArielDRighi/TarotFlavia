# ANÁLISIS DE ARQUITECTURA PARA ESCALABILIDAD A MARKETPLACE

**Fecha:** 5 de Noviembre, 2025  
**Proyecto:** TarotFlavia  
**Objetivo:** Convertir aplicación single-tarotista en plataforma marketplace multi-tarotista

---

## TABLA DE CONTENIDOS

1. [Estado Actual y Red Flags](#1-estado-actual-y-red-flags)
2. [Schema de Base de Datos Propuesto](#2-schema-de-base-de-datos-propuesto)
3. [Refactorización Mínima Crítica](#3-refactorización-mínima-crítica)
4. [Sistema de Prompts Dinámicos](#4-sistema-de-prompts-dinámicos)
5. [Roles y Revenue Sharing](#5-roles-y-revenue-sharing)
6. [Plan de Migración y Priorización](#6-plan-de-migración-y-priorización)
7. [Código de Ejemplo](#7-código-de-ejemplo)

---

# 1. ESTADO ACTUAL Y RED FLAGS

## 1.1 RESUMEN DE ARQUITECTURA ACTUAL

### Tecnologías Core

- **Backend:** NestJS + TypeORM + PostgreSQL
- **IA:** Groq (Llama 3.1 70B) como principal, OpenAI/DeepSeek como fallback
- **Autenticación:** JWT + Refresh Tokens
- **Cache:** Sistema de interpretaciones cacheadas
- **Rate Limiting:** @nestjs/throttler con límites diferenciados free/premium

### Módulos Implementados (Arquitectura Modular)

```
src/modules/
├── auth/           ✅ Login, registro, JWT, refresh tokens, password reset
├── users/          ✅ Gestión de usuarios con planes (free/premium)
├── categories/     ✅ 6 categorías de lecturas (Amor, Trabajo, etc.)
├── predefined-questions/  ✅ 42 preguntas predefinidas para usuarios free
├── usage-limits/   ✅ Control de límites diarios (3 lecturas free, ∞ premium)
├── ai-usage/       ✅ Logging de uso de IA y costos
├── email/          ✅ Sistema de emails transaccionales
└── tarot/
    ├── cards/      ✅ 78 cartas del Rider-Waite con significados
    ├── decks/      ✅ Mazo Rider-Waite
    ├── spreads/    ✅ 4 tipos de tiradas (1, 3, 5, 10 cartas)
    ├── readings/   ✅ Lecturas con soft-delete, compartir, regenerar
    └── interpretations/  ✅ Generación con IA + cache
```

### Base de Datos - Tablas Existentes

**USUARIOS Y AUTENTICACIÓN:**

- `user` - Usuarios con campos: id, email, password, name, plan (free/premium), subscription_status, stripe_customer_id
- `refresh_tokens` - Tokens de refresh para sesiones
- `password_reset_tokens` - Tokens de recuperación de contraseña

**CONTENIDO DE TAROT (COMPARTIDO):**

- `tarot_deck` - Mazos de tarot (actualmente solo Rider-Waite)
- `tarot_card` - 78 cartas con significados derecho/invertido
- `tarot_spread` - Definición de tiradas (1, 3, 5, 10 cartas) con posiciones
- `reading_category` - 6 categorías (Amor, Trabajo, Dinero, Salud, Espiritual, General)
- `predefined_question` - 42 preguntas predefinidas vinculadas a categorías

**LECTURAS Y INTERPRETACIONES:**

- `tarot_reading` - Lecturas de usuarios con campos: user_id, deck_id, category_id, card_positions (jsonb), interpretation (text), predefined_question_id, custom_question, question_type, shared_token, is_public, view_count, regeneration_count
- `tarot_interpretation` - Historial de interpretaciones (para regeneraciones)
- `cached_interpretations` - Cache de interpretaciones por combinación de cartas

**CONTROL Y MÉTRICAS:**

- `usage_limit` - Control de límites diarios por feature (tarot_reading, oracle_query, interpretation_regeneration)
- `ai_usage_logs` - Logging detallado de uso de IA: provider (groq/openai/deepseek), tokens, costo, duración, status

---

## 1.2 🚨 RED FLAGS - CAMBIOS CRÍTICOS NECESARIOS AHORA

### 🔴 CRÍTICO #1: Prompts Hardcodeados con Identidad Única

**Ubicación:** `src/modules/tarot/interpretations/tarot-prompts.ts`

**Problema:**

```typescript
static getSystemPrompt(): string {
  return `# ROLE
Eres Flavia, una tarotista profesional con 20 años de experiencia...`;
}
```

**Impacto:**

- ❌ Todos los tarotistas generarían interpretaciones con la misma "voz" y personalidad
- ❌ No hay diferenciación entre tarotistas
- ❌ Imposible que cada tarotista tenga su estilo único

**Acción requerida:**

- Convertir `TarotPrompts` en clase inyectable que reciba `tarotista_id`
- Cargar configuración de prompts desde DB: `tarotista_config.system_prompt`
- Parámetros configurables: nombre, experiencia, tono, estilo, palabras_clave

---

### 🔴 CRÍTICO #2: Significados de Cartas Globales

**Ubicación:** `tarot_card` table y seeders

**Problema:**

- Todas las cartas tienen significados FIJOS para todos los tarotistas
- No existe tabla `cartas_personalizadas` o `tarotista_card_meanings`
- Los 78 significados son idénticos sin importar quién hace la lectura

**Impacto:**

- ❌ **No hay diferenciación real** entre tarotistas (punto central del marketplace)
- ❌ Tarotista con 30 años de experiencia vs principiante = misma interpretación
- ❌ Imposible que tarotistas ofrezcan su "escuela" o enfoque único

**Solución:**

- Opción A (Recomendada): Tabla `tarotista_card_interpretation` que permite override
- Opción B: Campo jsonb `custom_meanings` en tabla `tarotistas`
- Fallback: Si tarotista no tiene significado personalizado, usar el global

---

### 🔴 CRÍTICO #3: No Existe Concepto de "Tarotista" en el Schema

**Problema:**

- La tabla `user` solo tiene roles implícitos (isAdmin boolean)
- No existe tabla `tarotista` con perfil, bio, especialidades
- No hay FK `tarotista_id` en `tarot_reading`

**Impacto:**

- ❌ Imposible vincular lecturas a tarotistas específicos
- ❌ No se puede trackear uso por tarotista para revenue sharing
- ❌ No hay perfil público de tarotistas para que usuarios elijan

**Estructura actual:**

```
user (id, email, password, plan)
  ↓ 1:N
tarot_reading (user_id, interpretation)
```

**Estructura necesaria:**

```
tarotista (id, user_id, nombre_publico, bio, especialidades)
  ↓ 1:N
tarot_reading (user_id, tarotista_id, interpretation)
```

---

### 🟡 IMPORTANTE #4: Sistema de Usuarios No Soporta Múltiples Roles

**Ubicación:** `src/modules/users/entities/user.entity.ts`

**Problema:**

```typescript
export class User {
  @Column({ default: false })
  isAdmin: boolean; // ❌ Solo admin vs no-admin

  @Column({ type: "enum", enum: UserPlan })
  plan: UserPlan; // free/premium (del lado consumidor)
}
```

**Impacto:**

- ❌ Un usuario no puede ser CONSUMIDOR y TAROTISTA simultáneamente
- ❌ No hay role-based access control (RBAC) apropiado
- ❌ Guards actuales solo verifican `isAdmin` y `plan`

**Solución necesaria:**

```typescript
export enum UserRole {
  CONSUMER = "consumer", // Usuario final que consume lecturas
  TAROTIST = "tarotist", // Proveedor que ofrece servicios
  ADMIN = "admin", // Admin de plataforma
}

export class User {
  @Column({ type: "enum", enum: UserRole, array: true })
  roles: UserRole[]; // ✅ Un usuario puede tener múltiples roles
}
```

---

### 🟡 IMPORTANTE #5: Límites de Uso No Consideran Tarotista

**Ubicación:** `src/modules/usage-limits/`

**Problema:**

```typescript
// Usuario FREE: 3 lecturas diarias
// Usuario PREMIUM: lecturas ilimitadas

// ¿Pero qué pasa con el modelo de negocio propuesto?
// - Usuario FREE: 3 lecturas con 1 tarotista (cambia 1 vez/mes)
// - Usuario PREMIUM individual: ilimitadas con 1 tarotista
// - Usuario PREMIUM all-access: ilimitadas con todos
```

**Impacto:**

- ❌ `usage_limit` no trackea `tarotista_id`
- ❌ No se puede limitar "lecturas con tarotista X"
- ❌ No hay concepto de "tarotista favorito" del usuario

**Solución:**

```sql
-- Agregar a usage_limit
ALTER TABLE usage_limit ADD COLUMN tarotista_id INTEGER REFERENCES tarotista(id);

-- Nuevo composite index
CREATE UNIQUE INDEX idx_usage_limit_user_feature_tarotist_date
ON usage_limit(user_id, feature, tarotista_id, date);
```

---

### 🟡 IMPORTANTE #6: No Existe Tracking de Métricas para Revenue Sharing

**Problema:**

- No hay tabla `metricas_uso_tarotista` o `tarotista_analytics`
- El sistema de `ai_usage_logs` no vincula a tarotista_id
- Imposible calcular: "Este mes, tarotista X generó Y interpretaciones para Z usuarios"

**Impacto:**

- ❌ No se puede calcular el split 70/30 proporcional
- ❌ No hay dashboard para tarotistas de sus ingresos
- ❌ No se puede generar reportes de uso

**Datos necesarios para revenue sharing:**

```sql
CREATE TABLE tarotista_revenue_metrics (
  id SERIAL PRIMARY KEY,
  tarotista_id INTEGER REFERENCES tarotista(id),
  user_id INTEGER REFERENCES user(id),
  reading_id INTEGER REFERENCES tarot_reading(id),
  subscription_type VARCHAR(50), -- 'premium_individual' | 'premium_all_access' | 'free'
  revenue_share_usd DECIMAL(10, 4), -- Cuánto se le atribuye al tarotista
  calculation_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 🟢 OPCIONAL #7: Spreads y Decks Son Globales (Esto está CORRECTO)

**Análisis:**

- ✅ Los spreads (tiradas) son estructuras estándar del tarot
- ✅ Los decks (mazos) son creados por la plataforma, no por tarotistas
- ✅ NO necesitan vincularse a tarotistas específicos

**Confirmación:** Este diseño es apropiado para el modelo de negocio descrito.

---

## 1.3 ANÁLISIS DE DEPENDENCIAS

### ¿Qué Lógica Asume Una Sola Tarotista?

**ReadingsService (`readings.service.ts`):**

```typescript
async create(user: User, dto: CreateReadingDto) {
  // ❌ No recibe tarotista_id
  // ❌ No valida que el usuario tenga acceso a ese tarotista
  // ❌ No verifica límites por tarotista

  const result = await this.interpretationsService.generateInterpretation(
    cards, positions, question, spread, category, user.id, reading.id
  );
  // ❌ generateInterpretation no recibe tarotista_id
  // ❌ Usa prompts globales hardcodeados
}
```

**InterpretationsService (`interpretations.service.ts`):**

```typescript
async generateInterpretation(...) {
  const systemPrompt = TarotPrompts.getSystemPrompt();
  // ❌ Siempre retorna "Eres Flavia..."
  // ❌ No personaliza por tarotista

  const userPrompt = TarotPrompts.buildUserPrompt({
    cards: cardDetails,
    spread: spread.name
  });
  // ❌ Usa significados globales de las cartas
  // ❌ No inyecta interpretaciones personalizadas del tarotista
}
```

**Cache de Interpretaciones:**

```typescript
generateCacheKey(cardCombination, spreadId, questionHash) {
  // ❌ No incluye tarotista_id en la cache key
  // Resultado: Tarotista A y B comparten el mismo cache
  // Problema: interpretaciones idénticas para ambos
}
```

**Endpoints Afectados:**

- `POST /tarot/readings` - No acepta `tarotista_id` en el body
- `POST /tarot/readings/:id/regenerate` - No considera tarotista
- `GET /tarot/readings` - No filtra por tarotista

---

## 1.4 FLUJO ACTUAL vs FLUJO NECESARIO

### Flujo Actual (Single Tarotista)

```
1. Usuario crea lectura
   └─> POST /readings { question, spreadId, cardIds }

2. Sistema genera interpretación
   └─> Usa prompts hardcodeados "Flavia"
   └─> Usa significados globales de cartas
   └─> Retorna texto generado

3. Interpretación se guarda
   └─> tarot_reading.interpretation (text)
   └─> Sin referencia a tarotista
```

### Flujo Necesario (Marketplace)

```
1. Usuario selecciona tarotista
   └─> GET /tarotistas { especialidad, idioma, rating }
   └─> Usuario guarda tarotista_favorito_id

2. Usuario crea lectura
   └─> POST /readings {
         question,
         spreadId,
         cardIds,
         tarotistaId  // ← NUEVO
       }
   └─> Validación: usuario tiene acceso a ese tarotista?
       • Free: solo tarotista favorito
       • Premium individual: solo tarotista contratado
       • Premium all-access: cualquiera

3. Sistema carga configuración del tarotista
   └─> SELECT * FROM tarotista_config WHERE tarotista_id = X
   └─> Obtiene: system_prompt, style, keywords, temperature

4. Sistema carga interpretaciones personalizadas
   └─> SELECT * FROM tarotista_card_meanings
       WHERE tarotista_id = X AND card_id IN (...)
   └─> Fallback a significados globales si no existen

5. Genera interpretación personalizada
   └─> Inyecta prompt configurado del tarotista
   └─> Usa significados personalizados del tarotista
   └─> Cache key incluye tarotista_id

6. Tracking de métricas
   └─> INSERT INTO tarotista_revenue_metrics (
         tarotista_id, user_id, reading_id, revenue_share
       )
```

---

## 1.5 PROMPTS Y CONFIGURACIÓN DE IA

### Ubicación Actual

**Archivo:** `src/modules/tarot/interpretations/tarot-prompts.ts`

**Problema:** Clase estática con prompts hardcodeados

```typescript
export class TarotPrompts {
  static getSystemPrompt(): string {
    return `# ROLE
Eres Flavia, una tarotista profesional con 20 años de experiencia...

# TONE AND STYLE
- Empático y comprensivo
- Místico pero accesible
- Práctico y orientativo
...`;
  }
}
```

**¿Es configurable?** ❌ NO
**¿Puede cambiar por tarotista?** ❌ NO
**¿Está versionado?** ❌ NO

### Estructura de Prompts Actual

**System Prompt (175 líneas):**

- Define rol: "Eres Flavia..."
- Define tono y estilo
- Define formato de respuesta (Markdown con secciones específicas)
- Incluye ejemplos de interpretaciones

**User Prompt (dinámico):**

- Pregunta del usuario
- Categoría de la lectura
- Spread utilizado con descripción de posiciones
- Cartas seleccionadas con:
  - Nombre de carta
  - Posición en el spread
  - Orientación (derecha/invertida)
  - Significado general (desde `tarot_card.meaningUpright/Reversed`)
  - Keywords

**Problema crítico:**

> El user prompt usa `card.meaningUpright` y `card.meaningReversed` de la tabla global `tarot_card`. No hay forma de inyectar interpretaciones personalizadas del tarotista.

---

## 1.6 SISTEMA DE CACHE

### Implementación Actual

**Servicio:** `InterpretationCacheService`
**Tabla:** `cached_interpretations`

```typescript
generateCacheKey(
  cardCombination: Array<{card_id, position, is_reversed}>,
  spreadId: string,
  questionHash: string
): string {
  // Genera hash MD5 de: cards + spread + question
  // ❌ NO incluye tarotista_id
}
```

**Problema:**
Si 2 tarotistas diferentes interpretan:

- Mismas cartas
- Mismo spread
- Misma pregunta

→ El sistema retorna la interpretación cacheada del primero
→ El segundo tarotista NO genera su propia interpretación única

**Solución:**

```typescript
generateCacheKey(
  cardCombination,
  spreadId,
  questionHash,
  tarotistaId  // ← AGREGAR
): string {
  return md5(`${cards}-${spread}-${question}-${tarotistaId}`);
}
```

---

## 1.7 CONFIGURACIÓN DE RUTAS Y ENDPOINTS

### Endpoints Actuales

```
# Lecturas
POST   /tarot/readings           - Crear lectura
GET    /tarot/readings           - Listar lecturas del usuario
GET    /tarot/readings/:id       - Ver lectura específica
POST   /tarot/readings/:id/regenerate - Regenerar interpretación (premium)
POST   /tarot/readings/:id/share - Compartir lectura
DELETE /tarot/readings/:id       - Soft delete

# Cartas y Spreads (compartidos)
GET    /tarot/cards              - Listar las 78 cartas
GET    /tarot/spreads            - Listar tipos de tiradas
```

### Endpoints Necesarios para Marketplace

```
# Tarotistas (NUEVOS)
GET    /tarotistas               - Listar tarotistas disponibles
GET    /tarotistas/:id           - Perfil público de tarotista
GET    /tarotistas/:id/reviews   - Reviews del tarotista

# Suscripciones usuario-tarotista (NUEVOS)
POST   /users/me/favorite-tarotist     - Establecer tarotista favorito (free)
GET    /users/me/subscriptions         - Mis suscripciones activas
POST   /subscriptions                  - Suscribirse a tarotista (premium individual)
DELETE /subscriptions/:id              - Cancelar suscripción

# Lecturas (MODIFICAR)
POST   /tarot/readings { tarotistaId } - ← AGREGAR campo
GET    /tarot/readings?tarotistaId=X   - ← AGREGAR filtro

# Dashboard tarotista (NUEVOS)
GET    /tarotist/dashboard/stats       - Estadísticas y métricas
GET    /tarotist/dashboard/revenue     - Revenue sharing details
PUT    /tarotist/config                - Actualizar configuración de IA
PUT    /tarotist/card-meanings/:cardId - Personalizar significado de carta
```

---

---

# 2. SCHEMA DE BASE DE DATOS PROPUESTO

## 2.1 DIAGRAMA DE RELACIONES

```
┌─────────────────┐
│     user        │
│  (existente)    │
│─────────────────│
│ id              │
│ email           │
│ password        │
│ roles[]         │◄──────┐
│ plan            │       │
└─────────────────┘       │
         │                │
         │ 1:1            │
         ▼                │
┌─────────────────┐       │
│   tarotista     │       │
│    (NUEVA)      │       │
│─────────────────│       │
│ id              │       │
│ user_id  ───────┘       │
│ nombre_publico  │       │
│ bio             │       │
│ especialidades  │       │
│ idiomas         │       │
│ años_experiencia│       │
│ precio_sesion   │       │
│ is_active       │       │
│ comision_pct    │       │
└─────────────────┘       │
         │                │
         │ 1:N            │
         ▼                │
┌─────────────────────────┴──┐
│  tarotista_config          │
│        (NUEVA)             │
│────────────────────────────│
│ id                         │
│ tarotista_id               │
│ system_prompt     (text)   │
│ style_tone        (jsonb)  │
│ temperature       (float)  │
│ max_tokens        (int)    │
│ keywords          (jsonb)  │
│ version           (int)    │
└────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────┐
│ tarotista_card_meaning      │
│         (NUEVA)             │
│─────────────────────────────│
│ id                          │
│ tarotista_id                │
│ card_id ─────────► tarot_card
│ custom_meaning_upright      │
│ custom_meaning_reversed     │
│ custom_keywords             │
│ custom_description          │
└─────────────────────────────┘

┌─────────────────┐
│     user        │
└─────────────────┘
         │
         │ N:M (con metadata)
         ▼
┌──────────────────────────────┐
│ user_tarotista_subscription  │
│          (NUEVA)             │
│──────────────────────────────│
│ id                           │
│ user_id                      │
│ tarotista_id                 │
│ subscription_type (enum)     │
│   - favorite (free)          │
│   - premium_individual       │
│   - premium_all_access       │
│ status (enum)                │
│   - active                   │
│   - cancelled                │
│   - expired                  │
│ started_at                   │
│ expires_at                   │
│ can_change_at (fecha)        │
└──────────────────────────────┘

┌─────────────────┐
│ tarot_reading   │
│  (MODIFICAR)    │
│─────────────────│
│ id              │
│ user_id         │
│ tarotista_id ◄──┴─── AGREGAR
│ deck_id         │
│ category_id     │
│ card_positions  │
│ interpretation  │
│ ...             │
└─────────────────┘
         │
         │
         ▼
┌──────────────────────────────┐
│ tarotista_revenue_metrics    │
│          (NUEVA)             │
│──────────────────────────────│
│ id                           │
│ tarotista_id                 │
│ user_id                      │
│ reading_id                   │
│ subscription_type            │
│ revenue_share_usd            │
│ calculation_date             │
│ period_start                 │
│ period_end                   │
└──────────────────────────────┘

┌─────────────────┐
│ usage_limit     │
│  (MODIFICAR)    │
│─────────────────│
│ id              │
│ user_id         │
│ feature         │
│ tarotista_id ◄──┴─── AGREGAR
│ count           │
│ date            │
└─────────────────┘
```

---

## 2.2 SQL COMPLETO DE NUEVAS TABLAS

### Tabla: `tarotista`

```sql
-- Perfil público de tarotistas que ofrecen servicios en la plataforma
CREATE TABLE tarotista (
  id SERIAL PRIMARY KEY,

  -- Relación con usuario (1:1)
  user_id INTEGER NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,

  -- Información pública del perfil
  nombre_publico VARCHAR(100) NOT NULL,
  bio TEXT,
  foto_perfil_url VARCHAR(500),

  -- Especialidades y experiencia
  especialidades TEXT[], -- ['amor', 'trabajo', 'espiritual']
  idiomas VARCHAR(10)[], -- ['es', 'en', 'pt']
  años_experiencia INTEGER DEFAULT 0,

  -- Servicios ofrecidos
  ofrece_sesiones_virtuales BOOLEAN DEFAULT false,
  precio_sesion_usd DECIMAL(10, 2),
  duracion_sesion_minutos INTEGER,

  -- Estado y visibilidad
  is_active BOOLEAN DEFAULT true,
  is_accepting_new_clients BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Para destacar en homepage

  -- Comisión (puede variar por tarotista)
  comision_porcentaje DECIMAL(5, 2) DEFAULT 30.00, -- Plataforma se queda con este %

  -- Estadísticas (calculadas periódicamente)
  total_lecturas INTEGER DEFAULT 0,
  rating_promedio DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Índices
  CONSTRAINT chk_comision_rango CHECK (comision_porcentaje BETWEEN 0 AND 100),
  CONSTRAINT chk_rating_rango CHECK (rating_promedio BETWEEN 0 AND 5)
);

-- Índices para búsqueda y filtrado
CREATE INDEX idx_tarotista_active ON tarotista(is_active);
CREATE INDEX idx_tarotista_featured ON tarotista(is_featured);
CREATE INDEX idx_tarotista_especialidades ON tarotista USING GIN(especialidades);
CREATE INDEX idx_tarotista_rating ON tarotista(rating_promedio DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_tarotista_updated_at
  BEFORE UPDATE ON tarotista
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Tabla: `tarotista_config`

```sql
-- Configuración de IA personalizada por tarotista
CREATE TABLE tarotista_config (
  id SERIAL PRIMARY KEY,
  tarotista_id INTEGER NOT NULL REFERENCES tarotista(id) ON DELETE CASCADE,

  -- System Prompt personalizado (reemplaza "Eres Flavia...")
  system_prompt TEXT NOT NULL,

  -- Configuración de estilo y tono (JSONB para flexibilidad)
  style_config JSONB DEFAULT '{
    "tone": "empático y comprensivo",
    "mysticism_level": "medio",
    "formality": "informal-amigable",
    "language_style": "moderno accesible"
  }'::jsonb,

  -- Parámetros de modelo de IA
  temperature DECIMAL(3, 2) DEFAULT 0.70,
  max_tokens INTEGER DEFAULT 1000,
  top_p DECIMAL(3, 2) DEFAULT 1.00,

  -- Palabras clave y conceptos únicos del tarotista
  custom_keywords JSONB DEFAULT '[]'::jsonb,

  -- Instrucciones adicionales específicas
  additional_instructions TEXT,

  -- Versionado de configuración
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_temperature CHECK (temperature BETWEEN 0 AND 2),
  CONSTRAINT chk_top_p CHECK (top_p BETWEEN 0 AND 1)
);

-- Índices
CREATE INDEX idx_tarotista_config_tarotista ON tarotista_config(tarotista_id);
CREATE INDEX idx_tarotista_config_active ON tarotista_config(tarotista_id, is_active);

-- Un tarotista puede tener múltiples versiones, pero solo una activa
CREATE UNIQUE INDEX idx_tarotista_config_active_unique
  ON tarotista_config(tarotista_id)
  WHERE is_active = true;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_tarotista_config_updated_at
  BEFORE UPDATE ON tarotista_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Tabla: `tarotista_card_meaning`

```sql
-- Interpretaciones personalizadas de cartas por tarotista
-- Permite que cada tarotista defina sus propios significados
CREATE TABLE tarotista_card_meaning (
  id SERIAL PRIMARY KEY,

  tarotista_id INTEGER NOT NULL REFERENCES tarotista(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES tarot_card(id) ON DELETE CASCADE,

  -- Significados personalizados (pueden override los globales)
  custom_meaning_upright TEXT,
  custom_meaning_reversed TEXT,
  custom_keywords TEXT,
  custom_description TEXT,

  -- Notas privadas del tarotista (no se muestran al usuario final)
  private_notes TEXT,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Un tarotista solo puede tener una interpretación por carta
  CONSTRAINT uq_tarotista_card UNIQUE(tarotista_id, card_id)
);

-- Índices
CREATE INDEX idx_tarotista_card_meaning_tarotista ON tarotista_card_meaning(tarotista_id);
CREATE INDEX idx_tarotista_card_meaning_card ON tarotista_card_meaning(card_id);

-- Trigger para updated_at
CREATE TRIGGER update_tarotista_card_meaning_updated_at
  BEFORE UPDATE ON tarotista_card_meaning
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE tarotista_card_meaning IS
  'Permite que cada tarotista personalice los significados de las 78 cartas.
   Si no existe registro, se usa el significado global de tarot_card.';
```

---

### Tabla: `user_tarotista_subscription`

```sql
-- Relación entre usuarios y tarotistas (gestiona el modelo de negocio)
CREATE TYPE subscription_type_enum AS ENUM (
  'favorite',              -- Usuario FREE: 1 tarotista favorito
  'premium_individual',    -- Usuario PREMIUM: 1 tarotista específico
  'premium_all_access'     -- Usuario PREMIUM: todos los tarotistas
);

CREATE TYPE subscription_status_enum AS ENUM (
  'active',
  'cancelled',
  'expired'
);

CREATE TABLE user_tarotista_subscription (
  id SERIAL PRIMARY KEY,

  -- Relaciones
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  tarotista_id INTEGER REFERENCES tarotista(id) ON DELETE SET NULL,

  -- Tipo de suscripción
  subscription_type subscription_type_enum NOT NULL,
  status subscription_status_enum NOT NULL DEFAULT 'active',

  -- Fechas de vigencia
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  -- Control de cambios (para usuarios free)
  can_change_at TIMESTAMP, -- Próxima fecha en que puede cambiar de tarotista
  change_count INTEGER DEFAULT 0, -- Veces que ha cambiado este mes

  -- Stripe (para gestionar pagos)
  stripe_subscription_id VARCHAR(255),

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_tarotista_sub_user ON user_tarotista_subscription(user_id);
CREATE INDEX idx_user_tarotista_sub_tarotista ON user_tarotista_subscription(tarotista_id);
CREATE INDEX idx_user_tarotista_sub_status ON user_tarotista_subscription(status);
CREATE INDEX idx_user_tarotista_sub_active ON user_tarotista_subscription(user_id, status)
  WHERE status = 'active';

-- Restricciones de negocio
-- Un usuario FREE solo puede tener 1 tarotista favorito activo
CREATE UNIQUE INDEX idx_user_single_favorite
  ON user_tarotista_subscription(user_id)
  WHERE subscription_type = 'favorite' AND status = 'active';

-- Un usuario PREMIUM individual solo puede tener 1 suscripción activa a la vez
CREATE UNIQUE INDEX idx_user_single_premium_individual
  ON user_tarotista_subscription(user_id)
  WHERE subscription_type = 'premium_individual' AND status = 'active';

-- Un usuario PREMIUM all-access solo puede tener 1 suscripción all-access activa
CREATE UNIQUE INDEX idx_user_single_premium_all_access
  ON user_tarotista_subscription(user_id)
  WHERE subscription_type = 'premium_all_access' AND status = 'active';

-- Trigger
CREATE TRIGGER update_user_tarotista_subscription_updated_at
  BEFORE UPDATE ON user_tarotista_subscription
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_tarotista_subscription IS
  'Gestiona las relaciones entre usuarios y tarotistas según el modelo de negocio:
   - FREE: 1 tarotista favorito (cambio 1 vez/mes)
   - PREMIUM individual: 1 tarotista específico contratado
   - PREMIUM all-access: acceso a todos los tarotistas';
```

---

### Tabla: `tarotista_revenue_metrics`

```sql
-- Métricas de uso por tarotista para cálculo de revenue sharing
CREATE TABLE tarotista_revenue_metrics (
  id SERIAL PRIMARY KEY,

  -- Relaciones
  tarotista_id INTEGER NOT NULL REFERENCES tarotista(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  reading_id INTEGER REFERENCES tarot_reading(id) ON DELETE SET NULL,

  -- Tipo de uso que generó revenue
  subscription_type subscription_type_enum NOT NULL,

  -- Ingresos atribuibles
  revenue_share_usd DECIMAL(10, 4) NOT NULL,
  platform_fee_usd DECIMAL(10, 4) NOT NULL,
  total_revenue_usd DECIMAL(10, 4) NOT NULL,

  -- Período de cálculo
  calculation_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metadata adicional (JSONB para flexibilidad)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para reportes y analytics
CREATE INDEX idx_revenue_tarotista ON tarotista_revenue_metrics(tarotista_id);
CREATE INDEX idx_revenue_user ON tarotista_revenue_metrics(user_id);
CREATE INDEX idx_revenue_date ON tarotista_revenue_metrics(calculation_date);
CREATE INDEX idx_revenue_period ON tarotista_revenue_metrics(period_start, period_end);
CREATE INDEX idx_revenue_tarotista_period
  ON tarotista_revenue_metrics(tarotista_id, period_start, period_end);

-- Constraint: revenue_share + platform_fee = total_revenue
ALTER TABLE tarotista_revenue_metrics
  ADD CONSTRAINT chk_revenue_sum
  CHECK (revenue_share_usd + platform_fee_usd = total_revenue_usd);

COMMENT ON TABLE tarotista_revenue_metrics IS
  'Tracking detallado de uso por tarotista para calcular revenue sharing.
   Se crea un registro por cada lectura/interacción que genera revenue.
   Permite generar reportes mensuales para pagos a tarotistas.';
```

---

### Tabla: `tarotista_review`

```sql
-- Reviews y ratings de usuarios hacia tarotistas
CREATE TABLE tarotista_review (
  id SERIAL PRIMARY KEY,

  -- Relaciones
  tarotista_id INTEGER NOT NULL REFERENCES tarotista(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reading_id INTEGER REFERENCES tarot_reading(id) ON DELETE SET NULL,

  -- Rating y comentario
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,

  -- Moderación
  is_approved BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  moderation_notes TEXT,

  -- Respuesta del tarotista
  tarotist_response TEXT,
  tarotist_response_at TIMESTAMP,

  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Un usuario solo puede dejar 1 review por tarotista
  CONSTRAINT uq_user_tarotista_review UNIQUE(user_id, tarotista_id)
);

-- Índices
CREATE INDEX idx_review_tarotista ON tarotista_review(tarotista_id);
CREATE INDEX idx_review_user ON tarotista_review(user_id);
CREATE INDEX idx_review_rating ON tarotista_review(tarotista_id, rating);
CREATE INDEX idx_review_approved ON tarotista_review(tarotista_id, is_approved)
  WHERE is_approved = true AND is_hidden = false;

-- Trigger
CREATE TRIGGER update_tarotista_review_updated_at
  BEFORE UPDATE ON tarotista_review
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 2.3 MODIFICACIONES A TABLAS EXISTENTES

### Modificar: `user` - Agregar sistema de roles

```sql
-- Crear enum de roles
CREATE TYPE user_role_enum AS ENUM ('consumer', 'tarotist', 'admin');

-- Agregar columna de roles (array para permitir múltiples roles)
ALTER TABLE "user"
  ADD COLUMN roles user_role_enum[] DEFAULT ARRAY['consumer']::user_role_enum[];

-- Migrar isAdmin existente
UPDATE "user"
  SET roles = ARRAY['admin']::user_role_enum[]
  WHERE "isAdmin" = true;

-- Índice para búsquedas por rol
CREATE INDEX idx_user_roles ON "user" USING GIN(roles);

-- Podemos mantener isAdmin por compatibilidad, pero deprecarlo
-- ALTER TABLE "user" DROP COLUMN "isAdmin"; -- (hacer después de migrar guards)
```

---

### Modificar: `tarot_reading` - Agregar tarotista_id

```sql
-- Agregar FK a tarotista
ALTER TABLE tarot_reading
  ADD COLUMN tarotista_id INTEGER REFERENCES tarotista(id) ON DELETE SET NULL;

-- Índice para búsquedas por tarotista
CREATE INDEX idx_reading_tarotista ON tarot_reading(tarotista_id);

-- Índice compuesto para filtrado por usuario + tarotista
CREATE INDEX idx_reading_user_tarotista ON tarot_reading(user_id, tarotista_id);

COMMENT ON COLUMN tarot_reading.tarotista_id IS
  'Tarotista que realizó esta lectura. Permite trackear uso por tarotista.';
```

---

### Modificar: `usage_limit` - Agregar tarotista_id

```sql
-- Agregar FK a tarotista (nullable para límites globales)
ALTER TABLE usage_limit
  ADD COLUMN tarotista_id INTEGER REFERENCES tarotista(id) ON DELETE CASCADE;

-- Eliminar índice único anterior
DROP INDEX IF EXISTS idx_usage_limit_user_feature_date;

-- Crear nuevo índice único que incluya tarotista_id
CREATE UNIQUE INDEX idx_usage_limit_user_feature_tarotist_date
  ON usage_limit(user_id, feature, COALESCE(tarotista_id, 0), date);

-- Índice para búsquedas por tarotista
CREATE INDEX idx_usage_limit_tarotista ON usage_limit(tarotista_id);

COMMENT ON COLUMN usage_limit.tarotista_id IS
  'Permite limitar uso por tarotista específico.
   NULL = límite global (ej: free user sin tarotista asignado)';
```

---

### Modificar: `ai_usage_logs` - Agregar tarotista_id

```sql
-- Agregar FK a tarotista para tracking de costos
ALTER TABLE ai_usage_logs
  ADD COLUMN tarotista_id INTEGER REFERENCES tarotista(id) ON DELETE SET NULL;

-- Índice para analytics por tarotista
CREATE INDEX idx_ai_usage_tarotista ON ai_usage_logs(tarotista_id);
CREATE INDEX idx_ai_usage_tarotista_date ON ai_usage_logs(tarotista_id, created_at);

COMMENT ON COLUMN ai_usage_logs.tarotista_id IS
  'Atribuye el uso de IA a un tarotista específico.
   Útil para calcular costos por tarotista.';
```

---

### Modificar: `cached_interpretations` - Agregar tarotista_id

```sql
-- Agregar FK a tarotista para separar cache por tarotista
ALTER TABLE cached_interpretations
  ADD COLUMN tarotista_id INTEGER REFERENCES tarotista(id) ON DELETE CASCADE;

-- El cache_key debe incluir tarotista para evitar compartir interpretaciones
-- Nota: Revisar lógica de generación de cache_key en InterpretationCacheService

-- Índice para búsquedas
CREATE INDEX idx_cached_interpretation_tarotista
  ON cached_interpretations(tarotista_id);

COMMENT ON COLUMN cached_interpretations.tarotista_id IS
  'Separa el cache por tarotista. Dos tarotistas con las mismas cartas
   tendrán interpretaciones diferentes en cache.';
```

---

## 2.4 FUNCIONES Y TRIGGERS AUXILIARES

### Función: update_updated_at_column()

```sql
-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Función: calculate_tarotist_rating()

```sql
-- Recalcula el rating promedio de un tarotista
CREATE OR REPLACE FUNCTION calculate_tarotist_rating(p_tarotista_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE tarotista
  SET
    rating_promedio = (
      SELECT COALESCE(AVG(rating), 0)
      FROM tarotista_review
      WHERE tarotista_id = p_tarotista_id
        AND is_approved = true
        AND is_hidden = false
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM tarotista_review
      WHERE tarotista_id = p_tarotista_id
        AND is_approved = true
        AND is_hidden = false
    )
  WHERE id = p_tarotista_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular rating cuando se aprueba/actualiza un review
CREATE TRIGGER recalculate_rating_after_review
  AFTER INSERT OR UPDATE ON tarotista_review
  FOR EACH ROW
  EXECUTE FUNCTION calculate_tarotist_rating(NEW.tarotista_id);
```

---

### Función: increment_tarotist_reading_count()

```sql
-- Incrementa el contador de lecturas del tarotista
CREATE OR REPLACE FUNCTION increment_tarotist_reading_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tarotista_id IS NOT NULL THEN
    UPDATE tarotista
    SET total_lecturas = total_lecturas + 1
    WHERE id = NEW.tarotista_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger en tarot_reading
CREATE TRIGGER increment_tarotist_count_after_reading
  AFTER INSERT ON tarot_reading
  FOR EACH ROW
  EXECUTE FUNCTION increment_tarotist_reading_count();
```

---

## 2.5 DATOS DE EJEMPLO (SEEDERS)

### Seeder: Tarotista de Migración (Flavia Original)

```sql
-- Crear usuario para Flavia (la tarotista actual)
INSERT INTO "user" (email, password, name, roles, plan, "isAdmin")
VALUES (
  'flavia@tarotflavia.com',
  -- password hasheado (cambiar en producción)
  '$2b$10$...',
  'Flavia - Tarotista',
  ARRAY['tarotist', 'admin']::user_role_enum[],
  'premium',
  true
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Crear perfil de tarotista para Flavia
INSERT INTO tarotista (
  user_id,
  nombre_publico,
  bio,
  especialidades,
  idiomas,
  años_experiencia,
  is_featured,
  comision_porcentaje
)
VALUES (
  (SELECT id FROM "user" WHERE email = 'flavia@tarotflavia.com'),
  'Flavia',
  'Tarotista profesional con 20 años de experiencia en la interpretación del tarot. Especializada en lecturas de amor, trabajo y crecimiento espiritual.',
  ARRAY['amor', 'trabajo', 'espiritual'],
  ARRAY['es'],
  20,
  true,
  30.00
)
RETURNING id;

-- Crear configuración de IA para Flavia (migrar prompts actuales)
INSERT INTO tarotista_config (
  tarotista_id,
  system_prompt,
  style_config,
  temperature,
  max_tokens
)
VALUES (
  (SELECT id FROM tarotista WHERE nombre_publico = 'Flavia'),
  '# ROLE
Eres Flavia, una tarotista profesional con 20 años de experiencia en la interpretación del tarot...
[COPIAR PROMPT ACTUAL COMPLETO]',
  '{
    "tone": "empático y comprensivo",
    "mysticism_level": "medio",
    "formality": "informal-amigable",
    "language_style": "moderno accesible"
  }'::jsonb,
  0.70,
  1000
);
```

---

### Script: Migrar Lecturas Existentes

```sql
-- Asignar todas las lecturas existentes a Flavia (la tarotista original)
UPDATE tarot_reading
SET tarotista_id = (SELECT id FROM tarotista WHERE nombre_publico = 'Flavia')
WHERE tarotista_id IS NULL;
```

---

---

# 3. REFACTORIZACIÓN MÍNIMA CRÍTICA

## 3.1 CAMBIOS QUE DEBEN HACERSE **AHORA**

Estos cambios son necesarios para evitar una refactorización masiva futura. Hacerlos ahora (con pocas funcionalidades) es 10x más barato que hacerlos cuando el proyecto haya crecido.

---

## 3.2 🔴 CRÍTICO #1: Abstraer TarotPrompts a Servicio Inyectable

### ❌ Problema Actual

```typescript
// src/modules/tarot/interpretations/tarot-prompts.ts
export class TarotPrompts {
  static getSystemPrompt(): string {
    return `Eres Flavia, una tarotista...`; // ← HARDCODED
  }

  static buildUserPrompt(params): string {
    // Usa card.meaningUpright directamente (global)
    // No permite inyectar custom meanings
  }
}
```

### ✅ Solución: Servicio Inyectable con Contexto

```typescript
// src/modules/tarot/interpretations/services/prompt-builder.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TarotCard } from "../../cards/entities/tarot-card.entity";
import { TarotistaConfig } from "../../../tarotistas/entities/tarotista-config.entity";
import { TarotistaCardMeaning } from "../../../tarotistas/entities/tarotista-card-meaning.entity";

export interface PromptContext {
  tarotistaId: number;
  question: string;
  category?: string;
  spreadName: string;
  spreadDescription: string;
  cards: Array<{
    card: TarotCard;
    positionName: string;
    positionDescription: string;
    isReversed: boolean;
  }>;
}

@Injectable()
export class PromptBuilderService {
  constructor(
    @InjectRepository(TarotistaConfig)
    private configRepository: Repository<TarotistaConfig>,

    @InjectRepository(TarotistaCardMeaning)
    private cardMeaningRepository: Repository<TarotistaCardMeaning>
  ) {}

  /**
   * Obtiene el system prompt personalizado del tarotista
   * Si no existe, usa un template por defecto
   */
  async getSystemPrompt(tarotistaId: number): Promise<string> {
    const config = await this.configRepository.findOne({
      where: { tarotistaId, isActive: true },
      order: { version: "DESC" },
    });

    if (!config) {
      return this.getDefaultSystemPrompt();
    }

    return config.systemPrompt;
  }

  /**
   * Construye el user prompt inyectando significados personalizados
   */
  async buildUserPrompt(context: PromptContext): Promise<string> {
    const { tarotistaId, question, category, spreadName, spreadDescription, cards } = context;

    // Obtener significados personalizados del tarotista para estas cartas
    const cardIds = cards.map((c) => c.card.id);
    const customMeanings = await this.cardMeaningRepository.find({
      where: { tarotistaId, cardId: In(cardIds) },
    });

    // Crear map para acceso rápido
    const customMeaningsMap = new Map(customMeanings.map((cm) => [cm.cardId, cm]));

    let prompt = `# CONTEXTO DE LA LECTURA\n\n`;
    prompt += `**Pregunta del Consultante**: "${question}"\n`;
    if (category) {
      prompt += `**Categoría**: ${category}\n`;
    }
    prompt += `\n**Tirada Utilizada**: ${spreadName}\n`;
    prompt += `**Descripción de la Tirada**: ${spreadDescription}\n\n`;
    prompt += `# CARTAS EN LA LECTURA\n\n`;

    cards.forEach((cardInfo, index) => {
      const { card, positionName, positionDescription, isReversed } = cardInfo;

      // CLAVE: Usar significado custom si existe, sino usar global
      const customMeaning = customMeaningsMap.get(card.id);
      const meaning = isReversed
        ? customMeaning?.customMeaningReversed || card.meaningReversed
        : customMeaning?.customMeaningUpright || card.meaningUpright;

      const keywords = customMeaning?.customKeywords || card.keywords;

      prompt += `## Posición ${index + 1}: ${positionName}\n`;
      prompt += `**Significado de esta posición**: ${positionDescription}\n\n`;
      prompt += `**Carta**: ${card.name} (${isReversed ? "Invertida ↓" : "Derecha ↑"})\n`;
      prompt += `**Significado**: ${meaning}\n`;
      prompt += `**Palabras Clave**: ${keywords}\n\n`;
      prompt += `---\n\n`;
    });

    prompt += `# INSTRUCCIONES FINALES\n\n`;
    prompt += `Interpreta considerando el significado de cada carta en su posición.\n`;
    prompt += `Responde siguiendo el formato estructurado especificado.`;

    return prompt;
  }

  /**
   * Template por defecto si el tarotista no tiene configuración
   */
  private getDefaultSystemPrompt(): string {
    return `# ROLE
Eres un tarotista profesional con experiencia en interpretación del tarot.

# TONE AND STYLE
- Empático y comprensivo
- Práctico y orientativo
- Respetuoso

# RESPONSE FORMAT
Responde con estructura clara en Markdown...`;
  }
}
```

### 📋 Pasos de Implementación

1. **Crear el servicio** `PromptBuilderService`
2. **Modificar** `InterpretationsService` para inyectar `PromptBuilderService`
3. **Actualizar** método `generateInterpretation()` para recibir `tarotistaId`
4. **Deprecar** clase estática `TarotPrompts` (mantenerla como fallback temporalmente)
5. **Tests**: Verificar que usa custom meanings cuando existen

---

## 3.3 🔴 CRÍTICO #2: Modificar InterpretationsService para Contexto de Tarotista

### ❌ Problema Actual

```typescript
// interpretations.service.ts
async generateInterpretation(
  cards: TarotCard[],
  positions: CardPosition[],
  question?: string,
  spread?: TarotSpread,
  category?: string,
  userId?: number,
  readingId?: number,
): Promise<InterpretationResult> {
  // ❌ No recibe tarotistaId
  // ❌ Usa prompts estáticos
}
```

### ✅ Solución: Agregar tarotistaId como Parámetro

```typescript
// interpretations.service.ts
import { PromptBuilderService } from './services/prompt-builder.service';

@Injectable()
export class InterpretationsService {
  constructor(
    // ... otros repositorios
    private promptBuilder: PromptBuilderService,
    private aiProviderService: AIProviderService,
    private cacheService: InterpretationCacheService,
  ) {}

  async generateInterpretation(
    cards: TarotCard[],
    positions: CardPosition[],
    tarotistaId: number, // ← AGREGAR ESTE PARÁMETRO
    question?: string,
    spread?: TarotSpread,
    category?: string,
    userId?: number,
    readingId?: number,
  ): Promise<InterpretationResult> {
    this.totalRequests++;

    // Preparar contexto
    const cardDetails = cards.map((card) => {
      const position = positions.find((p) => p.cardId === card.id);
      const positionInfo = spread?.positions?.find(
        (p) => p.name === position?.position,
      );

      return {
        card,
        positionName: position?.position || 'Sin posición',
        positionDescription: positionInfo?.description || '',
        isReversed: position?.isReversed || false,
      };
    });

    // CAMBIO: Generar cache key que incluya tarotistaId
    const cacheKey = this.cacheService.generateCacheKey(
      cards.map(c => ({ card_id: c.id, ... })),
      spread?.id?.toString(),
      questionHash,
      tarotistaId.toString() // ← INCLUIR EN CACHE KEY
    );

    // Buscar en cache
    const cachedResult = await this.cacheService.getFromCache(cacheKey);
    if (cachedResult) {
      return { interpretation: cachedResult, fromCache: true };
    }

    // CAMBIO: Usar PromptBuilder en lugar de TarotPrompts estático
    const systemPrompt = await this.promptBuilder.getSystemPrompt(tarotistaId);
    const userPrompt = await this.promptBuilder.buildUserPrompt({
      tarotistaId,
      question: question || 'Pregunta general',
      category,
      spreadName: spread?.name || 'Tirada personalizada',
      spreadDescription: spread?.description || '',
      cards: cardDetails,
    });

    // Llamar a IA con prompts personalizados
    const interpretation = await this.aiProviderService.generateText({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      userId,
      readingId,
      tarotistaId, // ← PASAR PARA LOGGING
    });

    // Guardar en cache
    await this.cacheService.saveToCache(cacheKey, interpretation);

    return { interpretation, fromCache: false };
  }
}
```

---

## 3.4 🔴 CRÍTICO #3: Modificar ReadingsService para Recibir tarotistaId

### ❌ Problema Actual

```typescript
// readings.service.ts
async create(user: User, dto: CreateReadingDto): Promise<TarotReading> {
  // ❌ No valida acceso a tarotista
  // ❌ No recibe tarotistaId

  const result = await this.interpretationsService.generateInterpretation(
    cards,
    dto.cardPositions,
    question,
    spread,
    category,
    user.id,
    savedReading.id,
  );
}
```

### ✅ Solución: Validar Acceso y Pasar Contexto

```typescript
// readings/dto/create-reading.dto.ts
export class CreateReadingDto {
  // ... campos existentes

  @ApiProperty({
    description: "ID del tarotista que realizará la lectura",
    example: 1,
  })
  @IsInt()
  @IsPositive()
  tarotistaId: number; // ← AGREGAR
}
```

```typescript
// readings.service.ts
import { TarotistAccessService } from "../../tarotistas/services/tarotist-access.service";

@Injectable()
export class ReadingsService {
  constructor(
    // ... otros servicios
    private tarotistAccessService: TarotistAccessService,
    private interpretationsService: InterpretationsService
  ) {}

  async create(user: User, dto: CreateReadingDto): Promise<TarotReading> {
    // VALIDACIÓN: ¿El usuario tiene acceso a este tarotista?
    const hasAccess = await this.tarotistAccessService.validateAccess(user.id, dto.tarotistaId);

    if (!hasAccess) {
      throw new ForbiddenException(
        "No tienes acceso a este tarotista. " +
          (user.plan === UserPlan.FREE
            ? "Configura tu tarotista favorito en tu perfil."
            : "Suscríbete a este tarotista para acceder a sus servicios.")
      );
    }

    // Crear lectura con tarotistaId
    const reading = this.readingsRepository.create({
      ...dto,
      user,
      tarotista: { id: dto.tarotistaId } as any,
      deck: { id: dto.deckId } as any,
      interpretation: null,
    });

    const savedReading = await this.readingsRepository.save(reading);

    if (dto.generateInterpretation) {
      const cards = await this.cardsService.findByIds(dto.cardIds);
      const spread = await this.spreadsService.findById(dto.spreadId);

      // CAMBIO: Pasar tarotistaId a generateInterpretation
      const result = await this.interpretationsService.generateInterpretation(
        cards,
        dto.cardPositions,
        dto.tarotistaId, // ← AGREGAR
        question,
        spread,
        category,
        user.id,
        savedReading.id
      );

      savedReading.interpretation = result.interpretation;
      await this.readingsRepository.save(savedReading);
    }

    return savedReading;
  }
}
```

---

## 3.5 🔴 CRÍTICO #4: Crear Servicio de Validación de Acceso a Tarotistas

```typescript
// src/modules/tarotistas/services/tarotist-access.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserPlan } from "../../users/entities/user.entity";
import { UserTarotistaSubscription, SubscriptionType } from "../entities/user-tarotista-subscription.entity";

@Injectable()
export class TarotistAccessService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserTarotistaSubscription)
    private subscriptionRepository: Repository<UserTarotistaSubscription>
  ) {}

  /**
   * Valida si un usuario tiene acceso a un tarotista específico
   * según su plan y suscripciones activas
   */
  async validateAccess(userId: number, tarotistaId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return false;
    }

    // Buscar suscripciones activas del usuario
    const activeSub = await this.subscriptionRepository.findOne({
      where: {
        userId,
        status: "active",
      },
      order: { createdAt: "DESC" },
    });

    if (!activeSub) {
      // Usuario sin suscripción = no tiene acceso
      return false;
    }

    // Validar según tipo de suscripción
    switch (activeSub.subscriptionType) {
      case SubscriptionType.FAVORITE:
        // FREE: solo puede usar su tarotista favorito
        return activeSub.tarotistaId === tarotistaId;

      case SubscriptionType.PREMIUM_INDIVIDUAL:
        // PREMIUM individual: solo puede usar el tarotista contratado
        return activeSub.tarotistaId === tarotistaId;

      case SubscriptionType.PREMIUM_ALL_ACCESS:
        // PREMIUM all-access: puede usar cualquier tarotista
        return true;

      default:
        return false;
    }
  }

  /**
   * Obtiene el tarotista asignado/favorito del usuario
   */
  async getUserTarotist(userId: number): Promise<number | null> {
    const activeSub = await this.subscriptionRepository.findOne({
      where: { userId, status: "active" },
      order: { createdAt: "DESC" },
    });

    return activeSub?.tarotistaId || null;
  }

  /**
   * Verifica si el usuario puede cambiar de tarotista (solo FREE)
   */
  async canChangeTarotist(userId: number): Promise<boolean> {
    const activeSub = await this.subscriptionRepository.findOne({
      where: {
        userId,
        subscriptionType: SubscriptionType.FAVORITE,
        status: "active",
      },
    });

    if (!activeSub) {
      return true; // Puede elegir su primer favorito
    }

    // Verificar si puede_change_at ya pasó
    if (!activeSub.canChangeAt) {
      return false;
    }

    return new Date() >= activeSub.canChangeAt;
  }
}
```

---

## 3.6 🟡 IMPORTANTE: Crear Middleware de Contexto de Tarotista (Opcional)

Este middleware es opcional pero muy útil para inyectar automáticamente el contexto del tarotista en todas las requests.

```typescript
// src/common/middleware/tarotist-context.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TarotistAccessService } from "../../modules/tarotistas/services/tarotist-access.service";

// Extender Request para incluir tarotistId
declare global {
  namespace Express {
    interface Request {
      tarotistaId?: number;
    }
  }
}

@Injectable()
export class TarotistContextMiddleware implements NestMiddleware {
  constructor(private tarotistAccessService: TarotistAccessService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Solo aplicar si hay usuario autenticado
    if (req.user && req.user.userId) {
      try {
        // Obtener el tarotista asignado del usuario
        const tarotistaId = await this.tarotistAccessService.getUserTarotist(req.user.userId);

        if (tarotistaId) {
          req.tarotistaId = tarotistaId;
        }
      } catch (error) {
        // No bloquear request si falla
        console.error("Error loading tarotist context:", error);
      }
    }

    next();
  }
}
```

```typescript
// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TarotistContextMiddleware).exclude("/auth/(.*)", "/health/(.*)").forRoutes("*");
  }
}
```

**Beneficio:** Los controladores pueden acceder a `req.tarotistaId` automáticamente sin tener que buscarlo en cada endpoint.

---

## 3.7 🟡 IMPORTANTE: Actualizar Guards para Roles

### Crear Guard de Roles Flexible

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../modules/users/entities/user.entity";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

### Uso en Controladores

```typescript
// tarotistas/tarotistas.controller.ts
@Controller('tarotistas')
export class TarotistasController {
  // Endpoint público - cualquiera puede ver tarotistas
  @Get()
  async findAll() { ... }

  // Solo tarotistas pueden editar su perfil
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TAROTIST)
  @Patch(':id')
  async updateProfile() { ... }

  // Solo admins pueden desactivar tarotistas
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deactivate() { ... }
}
```

---

## 3.8 🟢 OPCIONAL: Decorator @CurrentTarotist()

```typescript
// src/common/decorators/current-tarotist.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentTarotist = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.tarotistaId;
});
```

**Uso:**

```typescript
@Post()
async createReading(
  @Request() req,
  @CurrentTarotist() tarotistaId: number, // ← Inyección automática
  @Body() dto: CreateReadingDto,
) {
  // tarotistaId ya está disponible
}
```

---

## 3.9 CHECKLIST DE REFACTORIZACIÓN MÍNIMA

### 🔴 CRÍTICO (Hacer ANTES de continuar con features)

- [ ] **1. Crear PromptBuilderService** (2-3 días)

  - [ ] Servicio inyectable que reemplaza TarotPrompts estático
  - [ ] Método `getSystemPrompt(tarotistaId)`
  - [ ] Método `buildUserPrompt(context)` con custom meanings
  - [ ] Tests unitarios completos

- [ ] **2. Refactorizar InterpretationsService** (1-2 días)

  - [ ] Agregar parámetro `tarotistaId` a `generateInterpretation()`
  - [ ] Inyectar `PromptBuilderService`
  - [ ] Actualizar cache key para incluir `tarotistaId`
  - [ ] Actualizar tests

- [ ] **3. Refactorizar ReadingsService** (1-2 días)

  - [ ] Agregar `tarotistaId` a `CreateReadingDto`
  - [ ] Validar acceso con `TarotistAccessService`
  - [ ] Pasar `tarotistaId` a `generateInterpretation()`
  - [ ] Actualizar tests E2E

- [ ] **4. Crear TarotistAccessService** (2 días)

  - [ ] Método `validateAccess(userId, tarotistaId)`
  - [ ] Método `getUserTarotist(userId)`
  - [ ] Método `canChangeTarotist(userId)`
  - [ ] Tests con diferentes planes (free/premium)

- [ ] **5. Actualizar Cache Key Generation** (0.5 días)
  - [ ] Modificar `InterpretationCacheService.generateCacheKey()`
  - [ ] Incluir `tarotistaId` en hash
  - [ ] Invalidar cache antiguo (opcional)

### 🟡 IMPORTANTE (Hacer antes de lanzar marketplace)

- [ ] **6. Crear RolesGuard** (1 día)

  - [ ] Guard flexible que valide array de roles
  - [ ] Decorator `@Roles()`
  - [ ] Tests

- [ ] **7. Migrar isAdmin a roles[]** (0.5 días)

  - [ ] Script de migración SQL
  - [ ] Actualizar AdminGuard para usar roles
  - [ ] Deprecar campo `isAdmin`

- [ ] **8. TarotistContextMiddleware** (1 día - Opcional)
  - [ ] Middleware que inyecta `req.tarotistaId`
  - [ ] Aplicar globalmente excepto rutas públicas
  - [ ] Tests

### 🟢 OPCIONAL (Mejoras de DX)

- [ ] **9. Decorator @CurrentTarotist()** (0.5 días)
  - [ ] Decorator para inyectar tarotistaId en params
  - [ ] Documentación de uso

---

**Estimación Total Refactorización Crítica:** **8-11 días**
**Estimación con Mejoras Importantes:** **10-14 días**

---

---

# 4. SISTEMA DE PROMPTS DINÁMICOS

## 4.1 ESTRUCTURA DE PROMPTS POR TAROTISTA

### Template Base con Variables

```typescript
// Ejemplo de system_prompt almacenado en tarotista_config
const promptTemplate = `
# ROLE
Eres {{nombre_tarotista}}, una tarotista profesional con {{años_experiencia}} años de experiencia.

Tu especialidad: {{especialidades}}
Tu enfoque: {{enfoque_unico}}

# TONE AND STYLE
- Tono: {{tone}}
- Nivel místico: {{mysticism_level}}
- Formalidad: {{formality}}

# RESPONSE FORMAT
{{formato_respuesta}}

# KEYWORDS PERSONALIZADAS
{{custom_keywords}}
`;
```

### Versionado de Prompts

**Tabla:** `tarotista_config` con campo `version`

```sql
-- El tarotista puede tener múltiples versiones de su configuración
SELECT * FROM tarotista_config
WHERE tarotista_id = 1
ORDER BY version DESC;

-- version=1: Configuración inicial
-- version=2: Ajuste después de feedback
-- version=3: Optimización después de 100 lecturas
```

**Ventajas:**

- Permite A/B testing de prompts
- Historial de cambios
- Rollback si una versión no funciona bien

### Sistema de Templates

```typescript
// src/modules/tarotistas/templates/prompt-templates.ts
export const PROMPT_TEMPLATES = {
  empathetic: {
    tone: "cálido y comprensivo",
    style: "conversacional",
    keywords: ["sentir", "comprender", "abrazar", "acompañar"],
  },
  mystical: {
    tone: "místico y profundo",
    style: "evocador",
    keywords: ["energía", "cosmos", "destino", "universo"],
  },
  practical: {
    tone: "directo y práctico",
    style: "orientado a soluciones",
    keywords: ["acción", "pasos", "plan", "estrategia"],
  },
};
```

---

## 4.2 GENERACIÓN DINÁMICA DE PROMPTS

### Servicio de Renderizado

```typescript
// prompt-renderer.service.ts
import Handlebars from "handlebars";

@Injectable()
export class PromptRendererService {
  /**
   * Renderiza un template con variables del tarotista
   */
  renderSystemPrompt(template: string, tarotista: Tarotista, config: TarotistaConfig): string {
    const compiled = Handlebars.compile(template);

    return compiled({
      nombre_tarotista: tarotista.nombrePublico,
      años_experiencia: tarotista.añosExperiencia,
      especialidades: tarotista.especialidades.join(", "),
      enfoque_unico: config.styleConfig["unique_approach"] || "",
      tone: config.styleConfig["tone"],
      mysticism_level: config.styleConfig["mysticism_level"],
      formality: config.styleConfig["formality"],
      custom_keywords: config.customKeywords.join(", "),
    });
  }
}
```

---

## 4.3 CACHE INTELIGENTE POR TAROTISTA

### Problema del Cache Actual

```typescript
// ❌ Cache compartido entre tarotistas
cacheKey = md5(cards + spread + question);
// Tarotista A y B con mismas cartas = misma interpretación
```

### Solución: Cache Segregado

```typescript
// ✅ Cache único por tarotista
cacheKey = md5(cards + spread + question + tarotistaId);

// Estructura en DB:
// cached_interpretations
// - cache_key: "abc123-tarotista1"
// - tarotista_id: 1
// - interpretation: "..."
// - hit_count: 42
```

### Estrategia de Invalidación

```typescript
@Injectable()
export class InterpretationCacheService {
  /**
   * Invalida cache cuando el tarotista actualiza su configuración
   */
  async invalidateTarotistCache(tarotistaId: number): Promise<void> {
    await this.cacheRepository.delete({ tarotistaId });
    this.logger.log(`Cache invalidated for tarotist ${tarotistaId}`);
  }

  /**
   * Invalida cache cuando se actualizan significados de cartas
   */
  async invalidateTarotistCardCache(tarotistaId: number, cardId: number): Promise<void> {
    // Invalidar solo interpretaciones que usan esa carta
    const entries = await this.cacheRepository.find({
      where: { tarotistaId },
    });

    for (const entry of entries) {
      const cardIds = this.extractCardIds(entry.cacheKey);
      if (cardIds.includes(cardId)) {
        await this.cacheRepository.delete(entry.id);
      }
    }
  }
}
```

---

# 5. ROLES Y REVENUE SHARING

## 5.1 SISTEMA DE ROLES (RBAC)

### Migración de isAdmin a Roles

```sql
-- 1. Crear enum
CREATE TYPE user_role_enum AS ENUM ('consumer', 'tarotist', 'admin');

-- 2. Agregar columna
ALTER TABLE "user" ADD COLUMN roles user_role_enum[] DEFAULT ARRAY['consumer']::user_role_enum[];

-- 3. Migrar datos
UPDATE "user" SET roles = ARRAY['admin']::user_role_enum[] WHERE "isAdmin" = true;
UPDATE "user" SET roles = ARRAY['consumer']::user_role_enum[] WHERE "isAdmin" = false;

-- 4. Usuario que también es tarotista
UPDATE "user"
SET roles = array_append(roles, 'tarotist'::user_role_enum)
WHERE id IN (SELECT user_id FROM tarotista);
```

### Guards Actualizados

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.some(role => user.roles?.includes(role));
  }
}

// Uso en controladores:
@Roles(UserRole.TAROTIST, UserRole.ADMIN)
@Patch('config')
async updateConfig() { ... }
```

---

## 5.2 MÉTRICAS DE TRACKING

### Tabla: tarotista_revenue_metrics

```typescript
@Injectable()
export class RevenueMetricsService {
  /**
   * Registra uso cuando se crea una lectura
   */
  async trackReading(
    tarotistaId: number,
    userId: number,
    readingId: number,
    subscription: UserTarotistaSubscription
  ): Promise<void> {
    // Calcular revenue share según tipo
    const revenueShare = this.calculateShare(subscription);

    await this.metricsRepository.save({
      tarotistaId,
      userId,
      readingId,
      subscriptionType: subscription.subscriptionType,
      revenueShareUsd: revenueShare.tarotist,
      platformFeeUsd: revenueShare.platform,
      totalRevenueUsd: revenueShare.total,
      calculationDate: new Date(),
      periodStart: startOfMonth(new Date()),
      periodEnd: endOfMonth(new Date()),
    });
  }
}
```

---

## 5.3 CÁLCULO DE COMISIONES

### Modelo de Revenue Sharing

```typescript
interface RevenueShare {
  tarotist: number; // 70%
  platform: number; // 30%
  total: number;
}

@Injectable()
export class RevenueCalculatorService {
  /**
   * Calcula splits según modelo de negocio
   */
  calculateShare(subscription: UserTarotistaSubscription): RevenueShare {
    let monthlyRevenue: number;

    switch (subscription.subscriptionType) {
      case SubscriptionType.PREMIUM_INDIVIDUAL:
        // $15-20/mes → 70% tarotista, 30% plataforma
        monthlyRevenue = 15.0;
        break;

      case SubscriptionType.PREMIUM_ALL_ACCESS:
        // $40-50/mes → split proporcional por uso
        // Este se calcula al final del mes según % de lecturas
        monthlyRevenue = this.calculateProportionalShare(subscription);
        break;

      case SubscriptionType.FAVORITE:
        // FREE users no generan revenue directo
        monthlyRevenue = 0;
        break;
    }

    const platformFee = monthlyRevenue * 0.3;
    const tarotistShare = monthlyRevenue * 0.7;

    return {
      tarotist: tarotistShare,
      platform: platformFee,
      total: monthlyRevenue,
    };
  }

  /**
   * Para all-access: calcular proporción de uso
   */
  private calculateProportionalShare(subscription: UserTarotistaSubscription): number {
    // Query: ¿Cuántas lecturas hizo este usuario este mes?
    // ¿Qué % fueron con este tarotista?
    // Asignar ese % del $40-50
    // Ejemplo:
    // Usuario hizo 20 lecturas en el mes
    // 10 con Tarotista A (50%)
    // 8 con Tarotista B (40%)
    // 2 con Tarotista C (10%)
    //
    // Total subscription = $40
    // Tarotista A recibe: $40 * 0.50 * 0.70 = $14
    // Tarotista B recibe: $40 * 0.40 * 0.70 = $11.20
    // Tarotista C recibe: $40 * 0.10 * 0.70 = $2.80
    // Plataforma: $40 * 0.30 = $12
  }
}
```

---

# 6. PLAN DE MIGRACIÓN Y PRIORIZACIÓN

## 6.1 FASES DE IMPLEMENTACIÓN

### 🔴 FASE 1: FUNDAMENTOS (3-4 semanas) - CRÍTICO

**Objetivo:** Sentar bases sin romper funcionalidad actual

| Tarea                                                   | Días        | Prioridad | Bloqueante |
| ------------------------------------------------------- | ----------- | --------- | ---------- |
| Crear tablas nuevas (tarotista, tarotista_config, etc.) | 2           | 🔴        | Sí         |
| Modificar tablas existentes (agregar tarotista_id)      | 1           | 🔴        | Sí         |
| Migrar Flavia a tabla tarotistas                        | 1           | 🔴        | Sí         |
| Crear PromptBuilderService                              | 3           | 🔴        | Sí         |
| Refactorizar InterpretationsService                     | 2           | 🔴        | Sí         |
| Refactorizar ReadingsService                            | 2           | 🔴        | Sí         |
| Crear TarotistAccessService                             | 2           | 🔴        | Sí         |
| Actualizar cache key con tarotistaId                    | 1           | 🔴        | Sí         |
| Tests completos de refactorización                      | 3           | 🔴        | Sí         |
| **TOTAL FASE 1**                                        | **17 días** |           |            |

**Resultado:** Sistema funciona igual que antes, pero internamente ya usa tarotistas.

---

### 🟡 FASE 2: FUNCIONALIDADES MARKETPLACE (4-5 semanas) - IMPORTANTE

| Tarea                                           | Días        | Prioridad | Bloqueante |
| ----------------------------------------------- | ----------- | --------- | ---------- |
| CRUD de Tarotistas (admin)                      | 3           | 🟡        | No         |
| Perfil público de tarotistas                    | 2           | 🟡        | No         |
| Sistema de suscripciones usuario-tarotista      | 5           | 🟡        | No         |
| Validación de acceso por plan                   | 2           | 🟡        | No         |
| Selector de tarotista en frontend               | 3           | 🟡        | No         |
| Configuración de prompts (dashboard tarotista)  | 4           | 🟡        | No         |
| Personalización de cartas (dashboard tarotista) | 3           | 🟡        | No         |
| Sistema de reviews y ratings                    | 3           | 🟡        | No         |
| **TOTAL FASE 2**                                | **25 días** |           |            |

---

### 🟢 FASE 3: REVENUE SHARING Y ANALYTICS (2-3 semanas) - OPCIONAL

| Tarea                                               | Días        | Prioridad | Bloqueante |
| --------------------------------------------------- | ----------- | --------- | ---------- |
| RevenueMetricsService                               | 3           | 🟢        | No         |
| Dashboard de analytics para tarotistas              | 4           | 🟢        | No         |
| Cálculo automático mensual de comisiones            | 3           | 🟢        | No         |
| Reportes para admin                                 | 2           | 🟢        | No         |
| Integración con Stripe Connect (pagos a tarotistas) | 5           | 🟢        | No         |
| **TOTAL FASE 3**                                    | **17 días** |           |            |

---

## 6.2 ESTRATEGIA DE MIGRACIÓN SIN DOWNTIME

### Paso 1: Migración de Schema (Transparente)

```sql
BEGIN;

-- Crear todas las tablas nuevas
CREATE TABLE tarotista (...);
CREATE TABLE tarotista_config (...);
-- ... etc

-- Modificar tablas existentes (agregar columnas)
ALTER TABLE tarot_reading ADD COLUMN tarotista_id INTEGER;
ALTER TABLE usage_limit ADD COLUMN tarotista_id INTEGER;

-- Migrar Flavia
INSERT INTO tarotista (...) VALUES (...);
UPDATE tarot_reading SET tarotista_id = (SELECT id FROM tarotista WHERE nombre_publico = 'Flavia');

COMMIT;
```

**Resultado:** Schema listo, app sigue funcionando (columnas nuevas son nullable).

---

### Paso 2: Refactorización de Código (Sin Deploy)

- Crear nuevos servicios en paralelo a los existentes
- Tests locales completos
- No deploy hasta que todo funcione

---

### Paso 3: Deploy con Feature Flag

```typescript
// config
const ENABLE_MULTI_TAROTIST = process.env.ENABLE_MULTI_TAROTIST === "true";

// En código
if (ENABLE_MULTI_TAROTIST) {
  // Usar nueva lógica con tarotistas
} else {
  // Usar lógica antigua (fallback)
}
```

**Ventaja:** Rollback instantáneo si algo falla.

---

### Paso 4: Migración Gradual de Usuarios

1. **Semana 1:** Solo admin puede ver múltiples tarotistas
2. **Semana 2:** Usuarios premium pueden explorar
3. **Semana 3:** Usuarios free pueden elegir favorito
4. **Semana 4:** Remover feature flag, sistema 100% multi-tarotista

---

## 6.3 CHECKLIST FINAL DE IMPLEMENTACIÓN

### 🔴 CRÍTICO - HACER AHORA

- [ ] Crear schema completo (tablas + migraciones)
- [ ] Refactorizar servicios core (Interpretations, Readings)
- [ ] Abstraer prompts a servicio inyectable
- [ ] Separar cache por tarotista
- [ ] Tests E2E completos
- [ ] Migrar Flavia a tabla tarotistas

**Estimación:** 3-4 semanas  
**Riesgo si NO se hace:** Refactorización masiva futura (10x más costosa)

---

### 🟡 IMPORTANTE - HACER ANTES DE LANZAR MARKETPLACE

- [ ] CRUD de tarotistas
- [ ] Sistema de suscripciones
- [ ] Perfiles públicos
- [ ] Dashboard para tarotistas
- [ ] Sistema de roles (RBAC)

**Estimación:** 4-5 semanas  
**Riesgo si NO se hace:** Marketplace no funcional

---

### 🟢 OPCIONAL - OPTIMIZACIONES FUTURAS

- [ ] Revenue sharing automático
- [ ] A/B testing de prompts
- [ ] Analytics avanzados
- [ ] Integración Stripe Connect
- [ ] Sistema de reviews

**Estimación:** 2-3 semanas  
**Riesgo si NO se hace:** Ninguno (son mejoras)

---

# 7. CÓDIGO DE EJEMPLO

## 7.1 TarotistContext Middleware

```typescript
// src/common/middleware/tarotist-context.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class TarotistContextMiddleware implements NestMiddleware {
  constructor(private tarotistAccessService: TarotistAccessService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.user?.userId) {
      const tarotistaId = await this.tarotistAccessService.getUserTarotist(req.user.userId);

      if (tarotistaId) {
        req.tarotistaId = tarotistaId;
      }
    }
    next();
  }
}
```

---

## 7.2 PromptBuilder Service

```typescript
// src/modules/tarot/interpretations/services/prompt-builder.service.ts
@Injectable()
export class PromptBuilderService {
  constructor(
    @InjectRepository(TarotistaConfig)
    private configRepo: Repository<TarotistaConfig>,
    @InjectRepository(TarotistaCardMeaning)
    private cardMeaningRepo: Repository<TarotistaCardMeaning>
  ) {}

  async getSystemPrompt(tarotistaId: number): Promise<string> {
    const config = await this.configRepo.findOne({
      where: { tarotistaId, isActive: true },
    });

    return config?.systemPrompt || this.getDefaultPrompt();
  }

  async buildUserPrompt(context: PromptContext): Promise<string> {
    const customMeanings = await this.getCustomMeanings(
      context.tarotistaId,
      context.cards.map((c) => c.card.id)
    );

    return this.renderPrompt(context, customMeanings);
  }

  private async getCustomMeanings(tarotistaId: number, cardIds: number[]): Promise<Map<number, TarotistaCardMeaning>> {
    const meanings = await this.cardMeaningRepo.find({
      where: { tarotistaId, cardId: In(cardIds) },
    });

    return new Map(meanings.map((m) => [m.cardId, m]));
  }
}
```

---

## 7.3 MetricsTracker Service

```typescript
// src/modules/tarotistas/services/metrics-tracker.service.ts
@Injectable()
export class MetricsTrackerService {
  constructor(
    @InjectRepository(TarotistaRevenueMetrics)
    private metricsRepo: Repository<TarotistaRevenueMetrics>
  ) {}

  async trackReading(tarotistaId: number, userId: number, readingId: number): Promise<void> {
    const subscription = await this.getActiveSubscription(userId);
    const revenue = this.calculateRevenue(subscription);

    await this.metricsRepo.save({
      tarotistaId,
      userId,
      readingId,
      subscriptionType: subscription.subscriptionType,
      revenueShareUsd: revenue.tarotist,
      platformFeeUsd: revenue.platform,
      totalRevenueUsd: revenue.total,
      calculationDate: new Date(),
      periodStart: startOfMonth(new Date()),
      periodEnd: endOfMonth(new Date()),
    });
  }

  async getMonthlyRevenue(tarotistaId: number, year: number, month: number): Promise<number> {
    const result = await this.metricsRepo
      .createQueryBuilder("metrics")
      .select("SUM(metrics.revenue_share_usd)", "total")
      .where("metrics.tarotista_id = :tarotistaId", { tarotistaId })
      .andWhere("EXTRACT(YEAR FROM metrics.calculation_date) = :year", { year })
      .andWhere("EXTRACT(MONTH FROM metrics.calculation_date) = :month", { month })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
```

---

## 7.4 Cache por Tarotista

```typescript
// src/modules/tarot/interpretations/interpretation-cache.service.ts
@Injectable()
export class InterpretationCacheService {
  generateCacheKey(
    cardCombination: CardCombo[],
    spreadId: string,
    questionHash: string,
    tarotistaId: string // ← AGREGAR
  ): string {
    const cardsStr = cardCombination.map((c) => `${c.card_id}:${c.position}:${c.is_reversed}`).join("|");

    const dataToHash = `${cardsStr}-${spreadId}-${questionHash}-${tarotistaId}`;
    return createHash("md5").update(dataToHash).digest("hex");
  }

  async invalidateTarotistCache(tarotistaId: number): Promise<void> {
    await this.cacheRepo.delete({ tarotistaId });
  }
}
```

---

# RESUMEN EJECUTIVO

## ✅ LO QUE ESTÁ BIEN (NO TOCAR)

- ✅ Arquitectura modular bien separada
- ✅ Sistema de planes free/premium funcional
- ✅ Cache de interpretaciones implementado
- ✅ Spreads y decks son compartidos (correcto)
- ✅ Sistema de IA con múltiples providers

---

## 🚨 LO QUE BLOQUEA LA ESCALABILIDAD

1. **Prompts hardcodeados** - Todos los tarotistas usan "Flavia"
2. **Sin tabla `tarotista`** - No existe el concepto de múltiples tarotistas
3. **Significados de cartas globales** - No hay personalización
4. **Cache compartido** - Tarotistas comparten interpretaciones
5. **Sin tracking de uso por tarotista** - Imposible calcular revenue sharing

---

## 🎯 PRIORIZACIÓN

### 🔴 HACER AHORA (3-4 semanas)

Refactorizar servicios core + crear schema base

### 🟡 HACER ANTES DE LANZAR (4-5 semanas)

Funcionalidades de marketplace (perfiles, suscripciones)

### 🟢 OPTIMIZAR DESPUÉS (2-3 semanas)

Revenue sharing automático + analytics

---

## 💰 INVERSIÓN vs COSTO DE NO HACERLO

**Si lo haces AHORA:**

- Inversión: 8-12 semanas de desarrollo
- Riesgo: Bajo (cambios controlados)
- ROI: Sistema escalable desde el inicio

**Si lo haces DESPUÉS:**

- Inversión: 20-30 semanas (3x más)
- Riesgo: Alto (muchos cambios en sistema en producción)
- ROI: Negativo (refactorización masiva + bugs)

---

## 📊 IMPACTO EN MODELO DE NEGOCIO

| Feature                       | Sin Refactor | Con Refactor |
| ----------------------------- | ------------ | ------------ |
| Múltiples tarotistas          | ❌           | ✅           |
| Personalización por tarotista | ❌           | ✅           |
| Revenue sharing               | ❌           | ✅           |
| Suscripciones por tarotista   | ❌           | ✅           |
| Analytics por tarotista       | ❌           | ✅           |
| Escalabilidad                 | ❌           | ✅           |

**Conclusión:** Sin estos cambios, el marketplace NO es viable.

---

**FIN DEL ANÁLISIS**

---
