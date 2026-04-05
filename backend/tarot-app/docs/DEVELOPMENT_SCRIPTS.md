# 🛠️ Development Scripts Guide

Esta guía documenta todos los scripts de desarrollo disponibles en el proyecto, facilitando tareas comunes de desarrollo, testing y debugging.

## 📋 Índice

- [Scripts de Base de Datos](#scripts-de-base-de-datos)
- [Scripts de Seeders](#scripts-de-seeders)
- [Scripts de Testing](#scripts-de-testing)
- [Scripts de Utilidades](#scripts-de-utilidades)
- [CLI de Administración](#cli-de-administración)
- [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)

---

## 🗄️ Scripts de Base de Datos

### Reset Completo de Base de Datos

```bash
npm run db:reset
```

**¿Qué hace?**

1. Elimina la base de datos de desarrollo
2. Crea una nueva base de datos limpia
3. Ejecuta todas las migraciones
4. Ejecuta todos los seeders

**Cuándo usarlo:**

- Necesitas empezar desde cero
- Hay problemas con el estado de la DB
- Después de cambios importantes en el esquema

**⚠️ Advertencia:** Este comando pedirá confirmación antes de ejecutarse.

---

### Scripts de Desarrollo (Windows/Linux)

#### Linux/Mac

```bash
npm run db:dev:clean    # Limpiar DB de desarrollo
npm run db:dev:reset    # Reset completo (clean + migrate + seed)
```

#### Windows

```bash
npm run db:dev:clean:win    # Limpiar DB de desarrollo (PowerShell)
npm run db:dev:reset:win    # Reset completo (PowerShell)
```

---

### Scripts de E2E Testing

#### Linux/Mac

```bash
npm run db:e2e:clean    # Limpiar DB de E2E
npm run db:e2e:reset    # Reset completo de E2E DB
npm run db:e2e:migrate  # Solo migraciones en E2E DB
```

#### Windows

```bash
npm run db:e2e:clean:win    # Limpiar DB de E2E (PowerShell)
npm run db:e2e:reset:win    # Reset completo de E2E DB (PowerShell)
```

---

## 🌱 Scripts de Seeders

### Seedear Todo

```bash
npm run seed            # Comando estándar (usa seed-data.ts)
npm run db:seed:all     # Con verificación de dependencias
```

**Diferencias:**

- `npm run seed`: Script original, rápido
- `npm run db:seed:all`: Muestra progreso detallado y verifica dependencias entre seeders

---

### Seeders Específicos

#### Solo Cartas de Tarot

```bash
npm run db:seed:cards
```

**Seedea:**

- Mazos de tarot (Tarot Decks)
- Cartas de tarot (78 cartas del Rider-Waite)

**Útil para:** Testing de selección de cartas, spreads, etc.

---

#### Solo Usuarios de Prueba

```bash
npm run db:seed:users
```

**Crea:**

- admin@test.com (ADMIN)
- premium@test.com (PREMIUM)
- free@test.com (FREE)

**Muestra las credenciales al finalizar.**

**Útil para:** Testing de autenticación, permisos, planes de usuario.

---

## 🧪 Scripts de Testing

### Testing Local (Setup + Tests + Cleanup)

```bash
npm run test:e2e:local
```

**¿Qué hace?**

1. Resetea la base de datos de E2E
2. Ejecuta todos los tests E2E
3. Limpia la base de datos de E2E

**Ventajas:**

- Todo automatizado
- No deja residuos
- Ideal para CI/CD

---

### Testing Manual

```bash
# 1. Preparar
npm run db:e2e:reset

# 2. Ejecutar tests
npm run test:e2e

# 3. Limpiar (opcional)
npm run db:e2e:clean
```

---

### Testing con Coverage

```bash
npm run test:cov          # Unit tests con cobertura
npm run test:e2e:cov      # E2E tests con cobertura
```

---

## 🔧 Scripts de Utilidades

### Generar Lectura de Prueba

```bash
# Básico (usa free@test.com por defecto)
npm run generate:reading

# Con usuario específico
npm run generate:reading -- --email=premium@test.com

# Con ID de usuario
npm run generate:reading -- --userId=1

# Con tirada específica
npm run generate:reading -- --spreadId=2

# Con pregunta personalizada
npm run generate:reading -- --question="¿Qué me depara el futuro?" --customQuestion=true

# Combinado
npm run generate:reading -- --email=premium@test.com --spreadId=3 --question="Mi pregunta"
```

**¿Qué hace?**

- Genera una lectura completa con cartas aleatorias
- Crea interpretación usando IA
- Muestra resumen de la lectura creada
- **Sin necesidad de hacer HTTP requests**

**Útil para:**

- Testing de interpretaciones de IA
- Debugging de costos
- Generar datos de prueba
- Validar configuración de AI providers

**Ejemplo de output:**

```
🔮 Generating test reading...

👤 User: premium@test.com (Premium Test User)
   Roles: consumer
   Plan: premium

🃏 Spread: Tres Cartas (3 cards)
   Lectura simple y directa...

📋 Selected cards:
   1. El Mago (Upright) - Pasado
   2. La Luna (Reversed) - Presente
   3. El Sol (Upright) - Futuro

❓ Question: ¿Qué me depara el futuro en el amor?

⏳ Creating reading with AI interpretation...

✅ Reading created successfully!

📊 Reading Details:
   ID: 42
   Created: 2025-11-19T10:30:00.000Z
   Question: ¿Qué me depara el futuro en el amor?
   Cards: 3
   Has Interpretation: Yes

🤖 AI Interpretation (preview):
   Content: En el ámbito del amor, las cartas revelan...

✨ Done!
```

---

### Ver Logs de OpenAI

```bash
# Últimas 50 llamadas (por defecto)
npm run logs:openai

# Especificar límite
npm run logs:openai -- --limit=100
```

**¿Qué muestra?**

- Usuario que hizo la llamada
- Provider usado (groq, openai, deepseek)
- Número de requests
- Tokens consumidos
- Costo acumulado en USD
- Fecha de último reset
- **Totales y promedios**

**Ejemplo de output:**

```
📊 Fetching last 50 AI usage records...

🤖 AI Usage Summary (Top 3 users)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. User: Premium Test User (premium@test.com)
   User ID: 2
   Provider: groq
   Requests: 25
   Tokens: 45,230
   Cost: $0.0000 USD
   Last Reset: 2025-11-01T00:00:00.000Z

2. User: Admin Test User (admin@test.com)
   User ID: 3
   Provider: openai
   Requests: 15
   Tokens: 28,500
   Cost: $0.0428 USD
   Last Reset: Never

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Totals:
   Total Requests: 40
   Total Tokens: 73,730
   Total Cost: $0.0428 USD
   Avg Cost per Request: $0.001070 USD
   Avg Tokens per Request: 1,843

✨ Done!
```

**Útil para:**

- Monitorear costos de IA
- Debugging de uso excesivo
- Análisis de patrones por usuario
- Validar que los límites funcionan

---

### Ver Estadísticas de Caché

```bash
npm run stats:cache
```

**¿Qué muestra?**

- Hit rate (% de aciertos)
- Total de hits y misses
- Número de claves en caché
- Memoria utilizada
- Items más cacheados
- **Recomendaciones de optimización**

**Ejemplo de output (estado actual - no implementado):**

```
📊 Cache statistics feature is not fully implemented yet.

🗄️  Basic Information:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Note:
   The current cache implementation (in-memory) does not expose detailed metrics.
   Consider implementing Redis with metrics support for production.

📋 Available cache-related commands:
   npm run cli cache:clear  - Clear all cache

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Done!
```

> **🚧 Estado:** Esta funcionalidad está pendiente de implementación completa. La implementación actual de caché en memoria no expone métricas detalladas. Considera migrar a Redis para soporte de métricas en producción.

**Útil para:**

- Optimización de rendimiento
- Debugging de caché
- Validar estrategia de invalidación
- Identificar items que consumen más memoria

---

## 🎛️ CLI de Administración

### Ver Ayuda

```bash
npm run cli help
```

---

### Crear Usuario

```bash
npm run cli user:create -- --email=test@test.com --name="Test User" --password=test123
```

**Parámetros:**

- `--email`: Email del usuario (requerido)
- `--name`: Nombre completo (requerido)
- `--password`: Contraseña (requerido)

**Output:**

```
✅ User created successfully!
   ID: 5
   Email: test@test.com
   Name: Test User
```

---

### Promover Usuario

```bash
npm run cli user:promote -- --email=test@test.com --role=admin
```

**Parámetros:**

- `--email`: Email del usuario (requerido)
- `--role`: Rol a agregar (requerido)

**Roles disponibles:**

- `consumer` - Usuario consumidor (por defecto)
- `tarotista` - Tarotista (puede dar lecturas)
- `admin` - Administrador (acceso total)

**Output:**

```
ℹ️  Note: Direct role assignment is not implemented in CLI.
   Current roles: consumer
   To add role 'admin', update the database directly or use the admin panel.
```

> **⚠️ Limitación Actual:** Este comando solo **verifica** los roles del usuario. La asignación directa de roles no está implementada porque `UpdateUserDto` no incluye el campo `roles`. Para cambiar roles de usuario, utiliza el panel de administración o actualiza la base de datos directamente.

---

### Limpiar Caché

```bash
npm run cli cache:clear
```

**¿Qué hace?**
Elimina todas las entradas del caché en memoria.

**Output:**

```
🗑️  Clearing cache...
✅ Cache cleared successfully!
```

**Útil para:**

- Forzar regeneración de interpretaciones
- Debugging de caché obsoleto
- Testing de lógica de cache miss

---

### Probar Configuración de OpenAI

```bash
npm run cli openai:test
```

**¿Qué hace?**
Verifica que las variables de entorno de OpenAI estén configuradas correctamente.

**Output:**

```
🧪 Testing OpenAI connection...
✅ OpenAI API Key is configured
   Key: sk-proj-ab...
   Model: gpt-4o-mini

💡 To test actual API connection, generate a reading:
   npm run generate:reading
```

**Útil para:**

- Validar configuración inicial
- Debugging de problemas de IA
- Verificar variables de entorno

---

## 🔄 Flujos de Trabajo Comunes

### Setup Inicial (Primera Vez)

```bash
# 1. Copiar configuración
cp .env.example.local .env

# 2. Editar .env con tus credenciales
# (Especialmente GROQ_API_KEY o OPENAI_API_KEY)

# 3. Levantar base de datos
docker-compose up -d tarot-postgres

# 4. Ejecutar migraciones
npm run migration:run

# 5. Seedear datos
npm run db:seed:all

# 6. Verificar que funciona
npm run generate:reading
npm run logs:openai
```

---

### Desarrollo Diario

```bash
# Empezar con DB limpia
npm run db:reset

# Generar datos de prueba
npm run generate:reading -- --email=premium@test.com
npm run generate:reading -- --email=free@test.com

# Ver estadísticas
npm run logs:openai
npm run stats:cache
```

---

### Debugging de IA

```bash
# 1. Probar configuración
npm run cli openai:test

# 2. Generar lectura de prueba
npm run generate:reading

# 3. Ver logs de uso
npm run logs:openai

# 4. Si hay problemas, limpiar caché
npm run cli cache:clear

# 5. Intentar de nuevo
npm run generate:reading
```

---

### Antes de Hacer PR

```bash
# 1. Asegurar DB limpia
npm run db:reset

# 2. Ejecutar linter
npm run lint

# 3. Ejecutar tests unitarios
npm run test:cov

# 4. Ejecutar tests E2E
npm run test:e2e:local

# 5. Validar arquitectura
node scripts/validate-architecture.js

# 6. Build
npm run build
```

---

### Testing de Features Nuevas

```bash
# 1. Crear usuario de prueba
npm run cli user:create -- --email=feature@test.com --name="Feature Test" --password=test123

# 2. Promover si necesita permisos especiales
npm run cli user:promote -- --email=feature@test.com --role=tarotista

# 3. Generar lecturas de prueba
npm run generate:reading -- --email=feature@test.com --spreadId=1
npm run generate:reading -- --email=feature@test.com --spreadId=2

# 4. Revisar logs
npm run logs:openai
npm run stats:cache

# 5. Limpiar si necesitas
npm run db:reset
```

---

## 🐛 Scripts SQL de Debug

Scripts SQL para consultas directas a la base de datos durante desarrollo. Ubicados en `scripts/debug/`:

| Script | Propósito |
|--------|-----------|
| `reset-limits-anonymous.sql` | Resetear límites de usuarios anónimos |
| `reset-limits-free.sql` | Resetear límites de usuarios FREE |
| `reset-limits-premium.sql` | Resetear límites de usuarios PREMIUM |
| `reset-all-limits.sql` | Resetear límites de todos los usuarios |
| `reset-test-users-limits.sql` | Resetear límites de usuarios de prueba |
| `clean-test-user.sql` | Limpiar datos de un usuario de prueba |
| `check-birth-chart.sql` | Verificar datos de carta natal |
| `verify-cards-content.sql` | Verificar contenido de cartas |

**Cómo ejecutar:**

```bash
docker exec tarot-postgres-db psql -U tarotflavia_user -d tarot_db -f scripts/debug/reset-limits-free.sql
```

> Estos scripts son para uso local únicamente. No ejecutar en producción.

---

## 📚 Documentación Relacionada

- [SEEDERS_GUIDE.md](./SEEDERS_GUIDE.md) - Guía detallada de seeders
- [E2E_SCRIPTS_GUIDE.md](./E2E_SCRIPTS_GUIDE.md) - Guía de scripts de testing E2E
- [README-DOCKER.md](./README-DOCKER.md) - Configuración de Docker
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del proyecto

---

## 🐛 Troubleshooting

### Error: "Database connection refused"

**Solución:**

```bash
# Verificar que Docker está corriendo
docker ps

# Si no está el contenedor, levantarlo
docker-compose up -d tarot-postgres
```

---

### Error: "GROQ_API_KEY not found"

**Solución:**

```bash
# 1. Verificar .env
cat .env | grep GROQ_API_KEY

# 2. Si no existe, agregar
echo "GROQ_API_KEY=tu_key_aqui" >> .env

# 3. Probar configuración
npm run cli openai:test
```

---

### Error: "Cannot find module..."

**Solución:**

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

---

### Scripts no ejecutan en Windows

**Solución:**
Usar las versiones específicas de Windows:

```bash
npm run db:dev:reset:win    # En lugar de db:dev:reset
npm run db:e2e:reset:win    # En lugar de db:e2e:reset
```

---

**Última actualización:** Abril 2026  
**Mantenido por:** Equipo Auguria
