# 🌱 Database Seeders Guide

Este documento describe todos los seeders disponibles en el proyecto, qué datos inyectan, a qué base de datos y cómo ejecutarlos.

## 📋 Índice

- [Comando Principal](#comando-principal)
- [Seeders Disponibles](#seeders-disponibles)
  - [1. Flavia User](#1-flavia-user)
  - [2. Flavia Tarotista](#2-flavia-tarotista)
  - [3. Flavia IA Config](#3-flavia-ia-config)
  - [4. Test Users](#4-test-users)
  - [5. Reading Categories](#5-reading-categories)
  - [6. Predefined Questions](#6-predefined-questions)
  - [7. Tarot Decks](#7-tarot-decks)
  - [8. Tarot Cards](#8-tarot-cards)
  - [9. Tarot Spreads](#9-tarot-spreads)
- [Orden de Ejecución](#orden-de-ejecución)
- [Idempotencia](#idempotencia)

---

## 🚀 Comandos Principales

### Ejecutar Todos los Seeders (Completo)

```bash
npm run seed
```

**¿Qué hace?**
Ejecuta el script `src/database/seeds/seed-data.ts` que corre todos los seeders en el orden correcto.

**Base de datos afectada:**
La base de datos configurada en las variables de entorno (`.env`):

- **Development**: `tarot_db` en puerto `5435`
- **E2E Testing**: `tarot_test_db` en puerto `5436`

**Nota:** Asegúrate de estar apuntando a la base de datos correcta verificando tu archivo `.env`.

---

### Ejecutar Seeders Específicos

#### Todos los Seeders con Verificación de Dependencias

```bash
npm run db:seed:all
```

**¿Qué hace?**
Ejecuta `scripts/db-seed-all.ts` que corre todos los seeders con verificación explícita de dependencias y reporta el progreso detallado.

**Ventajas:**

- ✅ Verificación de dependencias entre seeders
- ✅ Mensajes de progreso detallados
- ✅ Resumen al finalizar
- ✅ Manejo de errores mejorado

#### Solo Cartas de Tarot

```bash
npm run db:seed:cards
```

**¿Qué hace?**
Ejecuta `scripts/db-seed-cards.ts` que seedea únicamente:

- Mazos de tarot (Tarot Decks)
- Cartas de tarot (Tarot Cards)

**Útil para:** Testing de funcionalidad de cartas sin necesitar todo el sistema.

#### Solo Usuarios de Prueba

```bash
npm run db:seed:users
```

**¿Qué hace?**
Ejecuta `scripts/db-seed-users.ts` que crea únicamente los 3 usuarios de prueba:

- free@test.com (FREE user)
- premium@test.com (PREMIUM user)
- admin@test.com (ADMIN user)

**Útil para:** Testing de autenticación y permisos.

**Muestra las credenciales al finalizar:**

```
🔑 Test User Credentials:
  Admin:   admin@test.com   / admin123
  Premium: premium@test.com / premium123
  Free:    free@test.com    / free123
```

---

## 📚 Seeders Disponibles

### 1. Flavia User

**Archivo:** `src/database/seeds/flavia-user.seeder.ts`

**¿Qué hace?**
Crea el usuario principal "Flavia" (la tarotista oficial del sistema).

**Datos inyectados:**

```javascript
{
  email: 'flavia@tarotflavia.com',
  name: 'Flavia - Tarotista Espiritual',
  password: 'FlaviaSecurePassword2024!' (hasheado),
  roles: ['consumer', 'tarotist'],
  plan: 'premium',
  isAdmin: false,
  subscriptionStatus: 'active'
}
```

**Tabla afectada:** `users`

**Idempotente:** ✅ Sí (no crea duplicados si ya existe)

---

### 2. Flavia Tarotista

**Archivo:** `src/database/seeds/flavia-tarotista.seeder.ts`

**¿Qué hace?**
Crea el perfil de tarotista para Flavia (información pública visible a los usuarios).

**Datos inyectados:**

```javascript
{
  userId: [ID de Flavia user],
  nombrePublico: 'Flavia - Guía Espiritual',
  bio: 'Tarotista profesional con más de 10 años de experiencia...',
  fotoPerfil: 'https://...',
  especialidades: ['Amor', 'Trabajo', 'Espiritual'],
  isActive: true,
  isVerified: true
}
```

**Tabla afectada:** `tarotistas`

**Dependencia:** Requiere que exista el usuario Flavia.

**Idempotente:** ✅ Sí

---

### 3. Flavia IA Config

**Archivo:** `src/database/seeds/flavia-ia-config.seeder.ts`

**¿Qué hace?**
Configura los parámetros de IA para las lecturas de Flavia.

**Datos inyectados:**

```javascript
{
  tarotistaId: [ID de Flavia tarotista],
  provider: 'groq',
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: 'Eres Flavia, una tarotista profesional...',
  responseStyle: 'empathetic',
  language: 'es'
}
```

**Tabla afectada:** `tarotista_configs`

**Dependencia:** Requiere que exista el perfil tarotista de Flavia.

**Idempotente:** ✅ Sí

---

### 4. Test Users

**Archivo:** `src/database/seeds/users.seeder.ts`

**¿Qué hace?**
Crea 3 usuarios de prueba con diferentes niveles de acceso.

**Datos inyectados:**

#### 👤 Usuario FREE

```javascript
{
  email: 'free@test.com',
  password: 'Test123456!',
  name: 'Free Test User',
  plan: 'free',
  roles: ['consumer'],
  isAdmin: false
}
```

#### 💎 Usuario PREMIUM

```javascript
{
  email: 'premium@test.com',
  password: 'Test123456!',
  name: 'Premium Test User',
  plan: 'premium',
  roles: ['consumer'],
  isAdmin: false
}
```

#### 👑 Usuario ADMIN

```javascript
{
  email: 'admin@test.com',
  password: 'Test123456!',
  name: 'Admin Test User',
  plan: 'premium',
  roles: ['consumer', 'admin'],
  isAdmin: true
}
```

**Tabla afectada:** `users`

**Idempotente:** ✅ Sí (actualiza passwords si ya existen)

**⚠️ IMPORTANTE:** Estos usuarios son SOLO para desarrollo/testing. Eliminar en producción.

---

### 5. Reading Categories

**Archivo:** `src/database/seeds/reading-categories.seeder.ts`

**¿Qué hace?**
Crea las 6 categorías predefinidas de lecturas de tarot.

**Datos inyectados:**

| Orden | Nombre                 | Slug                   | Icon | Color   |
| ----- | ---------------------- | ---------------------- | ---- | ------- |
| 1     | Amor y Relaciones      | amor-relaciones        | ❤️   | #FF6B9D |
| 2     | Carrera y Trabajo      | carrera-trabajo        | 💼   | #4A90E2 |
| 3     | Dinero y Finanzas      | dinero-finanzas        | 💰   | #F5A623 |
| 4     | Salud y Bienestar      | salud-bienestar        | 🏥   | #7ED321 |
| 5     | Crecimiento Espiritual | crecimiento-espiritual | ✨   | #9013FE |
| 6     | Consulta General       | consulta-general       | 🌟   | #50E3C2 |

**Tabla afectada:** `reading_categories`

**Idempotente:** ✅ Sí

---

### 6. Predefined Questions

**Archivo:** `src/database/seeds/predefined-questions.seeder.ts`

**¿Qué hace?**
Crea 42 preguntas predefinidas distribuidas en las 6 categorías.

**Distribución de preguntas:**

- Amor y Relaciones: 8 preguntas
- Carrera y Trabajo: 8 preguntas
- Dinero y Finanzas: 7 preguntas
- Salud y Bienestar: 6 preguntas
- Crecimiento Espiritual: 7 preguntas
- Consulta General: 6 preguntas

**Tabla afectada:** `predefined_questions`

**Dependencia:** Requiere que existan las categorías.

**Idempotente:** ✅ Sí

**Ejemplo de preguntas:**

```
- "¿Qué me depara el amor en este momento?"
- "¿Qué debo saber sobre mi situación laboral actual?"
- "¿Cómo puedo mejorar mi situación financiera?"
```

---

### 7. Tarot Decks

**Archivo:** `src/database/seeds/tarot-decks.seeder.ts`

**¿Qué hace?**
Crea el mazo Rider-Waite (el único soportado actualmente).

**Datos inyectados:**

```javascript
{
  name: 'Rider-Waite',
  description: 'El mazo de tarot más icónico y utilizado...',
  cardCount: 78,
  isActive: true,
  isDefault: true,
  artist: 'Pamela Colman Smith',
  yearCreated: 1909,
  tradition: 'Western',
  publisher: 'Rider & Company'
}
```

**Tabla afectada:** `tarot_decks`

**Idempotente:** ✅ Sí

---

### 8. Tarot Cards

**Archivo:** `src/database/seeds/tarot-cards.seeder.ts`

**¿Qué hace?**
Crea las 78 cartas del tarot Rider-Waite completo.

**Datos inyectados:**

- 22 Arcanos Mayores (El Loco, El Mago, La Sacerdotisa, etc.)
- 56 Arcanos Menores:
  - 14 Bastos (As-10, Sota, Caballero, Reina, Rey)
  - 14 Copas
  - 14 Espadas
  - 14 Oros

**Cada carta incluye:**

```javascript
{
  name: 'El Mago',
  arcana: 'major', // o 'minor'
  number: 1,
  suit: null, // o 'wands', 'cups', 'swords', 'pentacles'
  uprightMeaning: '...',
  reversedMeaning: '...',
  keywords: ['poder', 'manifestación', 'acción'],
  imageUrl: '...'
}
```

**Tabla afectada:** `tarot_cards`

**Dependencia:** Requiere que exista el deck Rider-Waite.

**Idempotente:** ✅ Sí

---

### 9. Tarot Spreads

**Archivo:** `src/database/seeds/tarot-spreads.seeder.ts`

**¿Qué hace?**
Crea 4 tiradas de tarot predefinidas.

**Datos inyectados:**

| Nombre                | Cartas | Dificultad | Para Principiantes |
| --------------------- | ------ | ---------- | ------------------ |
| Una Carta             | 1      | Fácil      | ✅ Sí              |
| Tres Cartas           | 3      | Fácil      | ✅ Sí              |
| Cruz Celta            | 10     | Avanzada   | ❌ No              |
| Herradura de 7 Cartas | 7      | Intermedia | ❌ No              |

**Cada spread incluye:**

```javascript
{
  name: 'Tres Cartas',
  description: 'Lectura simple y directa...',
  cardCount: 3,
  positions: [
    { position: 1, name: 'Pasado', description: '...' },
    { position: 2, name: 'Presente', description: '...' },
    { position: 3, name: 'Futuro', description: '...' }
  ],
  difficulty: 'easy',
  isBeginnerFriendly: true,
  whenToUse: 'Ideal para consultas rápidas...'
}
```

**Tabla afectada:** `tarot_spreads`

**Idempotente:** ✅ Sí

---

## 🔄 Orden de Ejecución

El script `seed-data.ts` ejecuta los seeders en el siguiente orden para respetar las dependencias:

```
1. Flavia User           ─────┐
                              ├──> 2. Flavia Tarotista ──> 3. Flavia IA Config
                              │
4. Reading Categories ────────┤
                              │
5. Tarot Decks ──────────────┼──> 6. Tarot Cards
                              │
7. Tarot Spreads ─────────────┤
                              │
8. Predefined Questions ──────┘

9. Test Users (independiente)
```

---

## 🔁 Idempotencia

**Todos los seeders son idempotentes**, lo que significa que puedes ejecutar `npm run seed` múltiples veces sin:

- Duplicar datos
- Generar errores
- Corromper la base de datos

**¿Cómo funciona?**
Cada seeder verifica si los datos ya existen antes de insertarlos:

```typescript
const existingData = await repository.count();
if (existingData > 0) {
  console.log('✅ Data already seeded. Skipping...');
  return;
}
```

---

## 🎯 Uso Común

### Seedear DB de Desarrollo

```bash
# Opción 1: Comando estándar
npm run seed

# Opción 2: Con verificación de dependencias
npm run db:seed:all

# Opción 3: Solo lo que necesitas
npm run db:seed:cards  # Solo cartas
npm run db:seed:users  # Solo usuarios de prueba
```

### Reset Completo de Base de Datos

```bash
# Opción rápida: Un solo comando
npm run db:reset

# O paso a paso:
npm run db:dev:clean      # Limpiar DB
npm run migration:run     # Ejecutar migraciones
npm run db:seed:all       # Ejecutar seeders
```

**Nota:** `npm run db:reset` es un alias de `npm run db:dev:reset` que hace todo automáticamente.

### Seedear DB de E2E Testing

```bash
# Reset completo de E2E database
npm run db:e2e:reset

# O paso a paso:
npm run db:e2e:clean      # Limpiar E2E DB
npm run db:e2e:migrate    # Ejecutar migraciones
npm run seed              # Ejecutar seeders
```

---

## 📞 Credenciales de Testing

Después de ejecutar los seeders, tendrás acceso a:

### 👤 Usuario FREE

- **Email:** free@test.com
- **Password:** Test123456!

### 💎 Usuario PREMIUM

- **Email:** premium@test.com
- **Password:** Test123456!

### 👑 Usuario ADMIN

- **Email:** admin@test.com
- **Password:** Test123456!

### 🌟 Flavia (Tarotista Principal)

- **Email:** flavia@tarotflavia.com
- **Password:** FlaviaSecurePassword2024!

---

## 🐛 Troubleshooting

### Error: "Cannot seed X: Y does not exist"

**Solución:** Ejecuta el seeder completo `npm run seed` que respeta el orden de dependencias.

### Error: "Duplicate key value violates unique constraint"

**Solución:** Los seeders deberían ser idempotentes. Si ves este error, puede ser un bug en el seeder específico.

### No veo datos después de ejecutar seeders

**Solución:** Verifica que estás conectado a la base de datos correcta:

```bash
psql -h localhost -p 5435 -U tarotflavia_user -d tarot_db
\dt  # Listar tablas
SELECT * FROM users;  # Verificar usuarios
```

---

## 📝 Notas Adicionales

- Los seeders se ejecutan contra la base de datos configurada en `.env`
- Para ambiente de producción, se recomienda **NO ejecutar** los seeders de test users
- El seeder de Flavia es **crítico** para el funcionamiento del marketplace
- Todos los passwords están hasheados con bcrypt (salt rounds: 10)

---

## 🛠️ Scripts de Desarrollo Adicionales

### Generar Lectura de Prueba

```bash
# Con usuario por defecto (free@test.com)
npm run generate:reading

# Con usuario específico
npm run generate:reading -- --email=premium@test.com

# Con usuario y tirada específica
npm run generate:reading -- --userId=1 --spreadId=2

# Con pregunta personalizada
npm run generate:reading -- --question="¿Qué me depara el futuro?" --customQuestion=true
```

**¿Qué hace?**
Genera una lectura de tarot completa con interpretación de IA sin hacer requests HTTP.

**Útil para:**

- Testing de la funcionalidad de lecturas
- Testing de integración con IA
- Debugging de interpretaciones
- Generar datos de prueba rápidamente

### Ver Logs de OpenAI

```bash
# Ver últimas 50 llamadas (por defecto)
npm run logs:openai

# Ver más llamadas
npm run logs:openai -- --limit=100
```

**¿Qué hace?**
Muestra un resumen de uso de IA por usuario con:

- Número de requests
- Tokens utilizados
- Costos acumulados
- Provider utilizado
- Fecha de último reset

**Útil para:**

- Debugging de costos de IA
- Monitoreo de uso por usuario
- Análisis de patrones de consumo

### Ver Estadísticas de Caché

```bash
npm run stats:cache
```

**¿Qué hace?**
Muestra estadísticas detalladas del sistema de caché:

- Hit rate (porcentaje de aciertos)
- Total de hits y misses
- Tamaño de caché
- Items más cacheados
- Recomendaciones de optimización

**Útil para:**

- Optimización de rendimiento
- Debugging de caché
- Validar estrategia de invalidación

### CLI de Administración

```bash
# Ver ayuda
npm run cli help

# Crear usuario
npm run cli user:create -- --email=test@test.com --name="Test User" --password=test123

# Promover usuario a rol específico
npm run cli user:promote -- --email=test@test.com --role=admin

# Limpiar caché
npm run cli cache:clear

# Probar configuración de OpenAI
npm run cli openai:test
```

**¿Qué hace?**
Proporciona comandos de línea para tareas administrativas comunes sin necesidad de hacer requests HTTP.

**Útil para:**

- Gestión de usuarios en desarrollo
- Debugging de configuración
- Tareas de mantenimiento
- Testing de funcionalidad sin UI

---

## 📊 Flujo de Trabajo Recomendado

### Setup Inicial (Primera Vez)

```bash
# 1. Configurar entorno
cp .env.example.local .env
# Editar .env con tus credenciales

# 2. Levantar base de datos
docker-compose up -d tarot-postgres

# 3. Ejecutar migraciones
npm run migration:run

# 4. Seedear datos
npm run db:seed:all

# 5. Verificar que todo funciona
npm run generate:reading
npm run logs:openai
```

### Desarrollo Diario

```bash
# Resetear DB cuando necesites empezar limpio
npm run db:reset

# O solo actualizar seeders específicos
npm run db:seed:users    # Recrear usuarios de test
npm run db:seed:cards    # Actualizar cartas
```

### Testing

```bash
# Setup completo para E2E tests
npm run test:e2e:local   # Hace todo: setup + tests + cleanup

# O manual
npm run db:e2e:reset     # Preparar E2E DB
npm run test:e2e         # Ejecutar tests
npm run db:e2e:clean     # Limpiar
```

---

**Última actualización:** Noviembre 2025  
**Mantenido por:** Equipo TarotFlavia
