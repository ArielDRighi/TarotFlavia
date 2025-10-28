# 🎯 FASE 1: MVP - CRÍTICO PARA LANZAMIENTO

---

## 🧪 Metodología de Desarrollo

> **TDD (Test-Driven Development)** - A partir de TASK-001, todo el desarrollo seguirá el ciclo Red-Green-Refactor:
>
> 1. ✍️ **RED**: Escribir el test que falla primero
> 2. ✅ **GREEN**: Escribir el código mínimo para que el test pase
> 3. 🔄 **REFACTOR**: Mejorar el código manteniendo los tests verdes
>
> **Reglas:**
>
> - No se escribe código de producción sin un test que falle primero
> - Los tests deben ser claros, concisos y enfocados en un solo comportamiento
> - El coverage mínimo debe ser del 80% para código nuevo
> - Cada commit debe tener tests pasando (CI/CD verde)

---

## 📦 Epic 0: Setup de Entorno de Desarrollo

> **Objetivo:** Configurar entorno de desarrollo local con Docker para base de datos PostgreSQL

---

### **TASK-000: Configurar PostgreSQL con Docker para Desarrollo** ✅

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 0.5 días  
**Dependencias:** Ninguna  
**Estado:** ✅ COMPLETADO  
**Branch:** `feature/TASK-000-docker-postgresql-setup`  
**Commit:** `1d7c956`

#### 📋 Descripción

Crear configuración de Docker Compose para levantar PostgreSQL localmente y facilitar el desarrollo sin instalaciones manuales.

#### ✅ Tareas específicas

- [x] Crear archivo `docker-compose.yml` en backend/tarot-app con:
  - Servicio PostgreSQL 16-alpine (última versión estable)
  - Puerto: 5435 (evita conflictos con otros proyectos: 5432, 5433, 5434)
  - Nombre de base de datos: `tarotflavia_db`
  - Usuario/password configurables vía variables de entorno
  - Volumen persistente con nombre descriptivo (`tarotflavia-postgres-data`)
  - Healthcheck configurado
  - Labels para identificación del proyecto
  - Red dedicada (`tarotflavia-network`)
- [x] Crear archivo `.env.example` con variables necesarias (prefijo TAROTFLAVIA\_):
  - `TAROTFLAVIA_DB_USER=tarotflavia_user`
  - `TAROTFLAVIA_DB_PASSWORD=tarotflavia_secure_password_2024`
  - `TAROTFLAVIA_DB_NAME=tarotflavia_db`
  - `TAROTFLAVIA_DB_PORT=5435`
  - Variables de pgAdmin
  - Variables de conexión para NestJS
- [x] Agregar pgAdmin 4 como servicio opcional con profile 'tools':
  - Puerto: 5050
  - Credenciales configurables
  - Depende de PostgreSQL healthy
- [x] Crear script de inicialización automática:
  - Extensión `uuid-ossp` para generación de UUIDs
  - Extensión `pg_trgm` para búsquedas de texto
  - Permisos correctos
- [x] Documentar en `README-DOCKER.md`:
  - Prerequisitos (Docker instalado)
  - Configuración paso a paso
  - Comandos útiles (start, stop, logs, backup, restore)
  - Conexión desde NestJS con TypeORM
  - Troubleshooting detallado
  - Mantenimiento y seguridad
- [x] Actualizar `.gitignore` para excluir:
  - Archivos .env
  - Datos de PostgreSQL
  - Configuración de pgAdmin
  - Backups (excepto init scripts)

#### 🎯 Criterios de aceptación

- ✅ La base de datos se levanta con `docker-compose up -d tarotflavia-postgres`
- ✅ Todos los recursos Docker tienen prefijo 'tarotflavia' para evitar confusión
- ✅ Puerto 5435 evita conflictos con otros proyectos
- ✅ Los datos persisten entre reinicios del contenedor
- ✅ README-DOCKER.md tiene instrucciones completas y troubleshooting
- ✅ Extensiones uuid-ossp y pg_trgm instaladas automáticamente
- ✅ pgAdmin disponible opcionalmente con `docker-compose --profile tools up -d`

#### 📝 Notas de implementación

- PostgreSQL 16.10 corriendo en puerto 5435
- Container: `tarotflavia-postgres-db`
- Volume: `tarotflavia-postgres-data`
- Network: `tarotflavia-network`
- Healthcheck: verificando cada 10s
- Inicialización exitosa confirmada: "TarotFlavia database initialized successfully!"

---

## 📦 Epic 1: Configuración y Estabilización de Base

> **Objetivo:** Establecer fundamentos técnicos sólidos y configuración esencial para producción

---

### **TASK-001: Refactorizar Módulo Tarot a Arquitectura Modular** ✅

**Prioridad:** 🟡 ALTA  
**Estimación:** 2-3 días  
**Dependencias:** TASK-000  
**Estado:** ✅ COMPLETADO  
**Branch:** `feature/TASK-001-modular-refactoring`

#### 📋 Descripción

Refactorizar el módulo `TarotModule` monolítico actual en múltiples módulos independientes siguiendo el principio de Single Responsibility. Actualmente todos los servicios y controllers conviven en un solo módulo, lo que dificulta el testing, escalabilidad y mantenimiento. Esta refactorización debe hacerse ANTES de las migraciones para evitar modificar rutas después.

**Arquitectura Actual (Monolítica):**

```
src/tarot/
├── tarot.module.ts          # ❌ Un módulo con 6 controllers + 4 services
├── card.controller.ts       # 136 líneas
├── card.service.ts          # 94 líneas
├── deck.controller.ts       # 124 líneas
├── deck.service.ts          # 209 líneas
├── interpretation.controller.ts  # 163 líneas
├── interpretation.service.ts     # 224 líneas
├── reading.controller.ts    # 120 líneas
├── share.controller.ts      # 71 líneas
├── tarot.controller.ts      # 96 líneas
├── tarot.service.ts         # 226 líneas
├── dto/                     # ❌ DTOs mezclados de todos los módulos
└── entities/                # ❌ Entidades mezcladas
```

**Arquitectura Objetivo (Modular):**

```
src/
├── cards/
│   ├── cards.module.ts
│   ├── cards.controller.ts
│   ├── cards.service.ts
│   ├── dto/
│   └── entities/
│       └── tarot-card.entity.ts
├── decks/
│   ├── decks.module.ts
│   ├── decks.controller.ts
│   ├── decks.service.ts
│   ├── dto/
│   └── entities/
│       └── tarot-deck.entity.ts
├── spreads/
│   ├── spreads.module.ts
│   ├── spreads.controller.ts
│   ├── spreads.service.ts
│   ├── dto/
│   └── entities/
│       └── tarot-spread.entity.ts
├── readings/
│   ├── readings.module.ts
│   ├── readings.controller.ts
│   ├── readings.service.ts
│   ├── share.controller.ts      # Sub-feature de readings
│   ├── dto/
│   └── entities/
│       └── tarot-reading.entity.ts
├── interpretations/
│   ├── interpretations.module.ts
│   ├── interpretations.controller.ts
│   ├── interpretations.service.ts
│   ├── dto/
│   └── entities/
│       └── tarot-interpretation.entity.ts
└── tarot/
    ├── tarot.module.ts          # ✅ Módulo orquestador (importa submódulos)
    └── tarot.controller.ts      # ✅ Solo endpoints generales si son necesarios
```

#### ✅ Tareas específicas

**Fase 1: Crear estructura de módulos**

- [x] Crear módulo `CardsModule` con su estructura de carpetas
  - Mover `card.controller.ts` → `cards/cards.controller.ts`
  - Mover `card.service.ts` → `cards/cards.service.ts`
  - Mover `tarot-card.entity.ts` → `cards/entities/`
  - Mover DTOs relacionados: `create-card.dto.ts`, `update-card.dto.ts`
  - Crear `cards/cards.module.ts` con imports necesarios
- [x] Crear módulo `DecksModule` con su estructura
  - Mover `deck.controller.ts` → `decks/decks.controller.ts`
  - Mover `deck.service.ts` → `decks/decks.service.ts`
  - Mover `tarot-deck.entity.ts` → `decks/entities/`
  - Mover DTOs: `create-deck.dto.ts`, `update-deck.dto.ts`, `shuffle-deck.dto.ts`
  - Crear `decks/decks.module.ts` con `forwardRef` a CardsModule si necesario
- [x] Crear módulo `SpreadsModule` con su estructura
  - Mover `tarot-spread.entity.ts` → `spreads/entities/`
  - Crear `spreads.controller.ts` (actualmente en tarot.controller)
  - Crear `spreads.service.ts` (extraer lógica de tarot.service)
  - Mover DTO: `create-spread.dto.ts`
  - Crear `spreads/spreads.module.ts`
- [x] Crear módulo `ReadingsModule` con su estructura
  - Mover `reading.controller.ts` → `readings/readings.controller.ts`
  - Mover `share.controller.ts` → `readings/share.controller.ts`
  - Extraer `readings.service.ts` desde `tarot.service.ts`
  - Mover `tarot-reading.entity.ts` → `readings/entities/`
  - Mover DTOs: `create-reading.dto.ts`, `random-cards.dto.ts`
  - Crear `readings/readings.module.ts`
- [x] Crear módulo `InterpretationsModule` con su estructura
  - Mover `interpretation.controller.ts` → `interpretations/interpretations.controller.ts`
  - Mover `interpretation.service.ts` → `interpretations/interpretations.service.ts`
  - Mover `tarot-interpretation.entity.ts` → `interpretations/entities/`
  - Mover DTO: `generate-interpretation.dto.ts`
  - Crear `interpretations/interpretations.module.ts`

**Fase 2: Actualizar imports y dependencias**

- [x] Actualizar todos los imports en controllers para reflejar nuevas rutas
- [x] Actualizar todos los imports en services para reflejar nuevas rutas
- [x] Configurar `forwardRef()` donde haya dependencias circulares
- [x] Actualizar `app.module.ts` para importar nuevos módulos
- [x] Eliminar o reducir `TarotModule` a orquestador simple
- [x] Actualizar exports de módulos según dependencias

**Fase 3: Actualizar tests**

- [x] Mover `card.controller.spec.ts` → `cards/cards.controller.spec.ts`
- [x] Mover `card.service.spec.ts` → `cards/cards.service.spec.ts`
- [x] Crear tests para cada nuevo módulo con mocks apropiados
- [x] Actualizar imports en todos los archivos de test
- [x] Verificar que todos los tests pasen con la nueva estructura

**Fase 4: Actualizar configuración de TypeORM**

- [x] Actualizar rutas de entities en `typeorm.ts`:
  - `entities: [__dirname + '/../**/*.entity{.ts,.js}']` debe encontrar las nuevas rutas
- [x] Verificar que TypeORM carga correctamente todas las entidades
- [x] Probar conexión a base de datos con nueva estructura

**Fase 5: Documentación y validación**

- [x] Actualizar documentación de arquitectura
- [x] Crear diagrama de dependencias entre módulos
- [x] Documentar cómo agregar nuevos módulos siguiendo el patrón
- [x] Ejecutar `npm run lint` y corregir warnings
- [x] Ejecutar `npm run format` para formatear código
- [x] Ejecutar `npm run build` y verificar que compila sin errores
- [x] Ejecutar `npm test` y verificar que todos los tests pasan
- [x] Verificar que la aplicación arranca correctamente con `npm run start:dev`

#### 🎯 Criterios de aceptación

- ✅ Cada dominio (cards, decks, spreads, readings, interpretations) tiene su propio módulo
- ✅ Cada módulo es independiente y puede testearse de forma aislada
- ✅ Las entidades están ubicadas dentro de sus módulos respectivos
- ✅ Los DTOs están organizados por módulo
- ✅ No hay imports directos entre módulos (solo a través de exports del módulo)
- ✅ Todos los tests pasan (ejecutar `npm test`)
- ✅ El proyecto compila sin errores (`npm run build`)
- ✅ Lint pasa sin warnings (`npm run lint`)
- ✅ La aplicación arranca correctamente y responde a requests
- ✅ TypeORM carga todas las entidades correctamente
- ✅ No hay dependencias circulares sin resolver

#### 📝 Notas importantes

- **Por qué ANTES de migraciones:** TASK-002 (migraciones) capturará las rutas actuales de las entidades. Si refactorizamos después, habrá que modificar las migraciones.
- **Dependencias circulares:** Usar `forwardRef()` de NestJS cuando sea necesario (ej: DecksModule necesita CardsModule y viceversa)
- **Testing:** Cada módulo debe tener sus propios mocks, no depender de otros módulos reales
- **Rutas API:** Mantener las mismas rutas públicas (ej: `/tarot/cards` funciona igual, solo cambia la organización interna)

#### 🚨 Posibles problemas

1. **Dependencias circulares**: DecksModule y CardsModule pueden necesitarse mutuamente → Usar `forwardRef()`
2. **ReadingsModule complejo**: Depende de Cards, Decks, Spreads, Interpretations → Inyectar solo lo necesario
3. **InterpretationsModule**: Necesita acceso a OpenAI y cache → Importar HttpModule y CacheModule
4. **Tests rotos**: Todos los imports cambiarán → Actualizar uno por uno

#### ✅ Resumen de Implementación (Completado)

**Estructura final creada:**

```
src/
├── cards/
│   ├── cards.module.ts
│   ├── cards.controller.ts (+ .spec.ts)
│   ├── cards.service.ts (+ .spec.ts)
│   ├── dto/
│   │   ├── create-card.dto.ts
│   │   └── update-card.dto.ts
│   └── entities/
│       └── tarot-card.entity.ts
├── decks/
│   ├── decks.module.ts
│   ├── decks.controller.ts (+ .spec.ts)
│   ├── decks.service.ts (+ .spec.ts)
│   ├── dto/
│   │   ├── create-deck.dto.ts
│   │   ├── update-deck.dto.ts
│   │   └── shuffle-deck.dto.ts
│   └── entities/
│       └── tarot-deck.entity.ts
├── spreads/
│   ├── spreads.module.ts
│   ├── spreads.controller.ts (+ .spec.ts)
│   ├── spreads.service.ts (+ .spec.ts)
│   ├── dto/
│   │   └── create-spread.dto.ts
│   └── entities/
│       └── tarot-spread.entity.ts
├── readings/
│   ├── readings.module.ts
│   ├── readings.controller.ts (+ .spec.ts)
│   ├── readings.service.ts (+ .spec.ts)
│   ├── share.controller.ts
│   ├── dto/
│   │   ├── create-reading.dto.ts
│   │   └── random-cards.dto.ts
│   └── entities/
│       └── tarot-reading.entity.ts
├── interpretations/
│   ├── interpretations.module.ts
│   ├── interpretations.controller.ts
│   ├── interpretations.service.ts (+ .spec.ts)
│   ├── dto/
│   │   └── generate-interpretation.dto.ts
│   └── entities/
│       └── tarot-interpretation.entity.ts
└── tarot/
    └── tarot.module.ts  # Módulo orquestador
```

**Resultados:**

- ✅ 5 módulos independientes creados (Cards, Decks, Spreads, Readings, Interpretations)
- ✅ TarotModule refactorizado como orquestador que importa todos los submódulos
- ✅ AppModule actualizado con todos los nuevos módulos
- ✅ Todas las entidades movidas a sus respectivos módulos
- ✅ Todos los DTOs organizados por módulo
- ✅ Tests unitarios creados siguiendo TDD para nuevos módulos
- ✅ 103 tests pasando exitosamente
- ✅ Build exitoso sin errores de compilación
- ✅ Aplicación arranca correctamente
- ✅ TypeORM carga todas las entidades desde las nuevas ubicaciones

**Metodología TDD aplicada:**

1. ✅ Tests escritos primero para ReadingsService y ReadingsController
2. ✅ Implementación mínima para pasar tests
3. ✅ Tests escritos para InterpretationsService
4. ✅ Refactorización y limpieza de código
5. ✅ Verificación final con suite completa de tests

---

### **TASK-002: Migrar de synchronize: true a Sistema de Migraciones**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 3 días  
**Dependencias:** TASK-001

#### 📋 Descripción

Reemplazar el modo `synchronize: true` de TypeORM (que sincroniza automáticamente el esquema) por un sistema robusto de migraciones. Esto es crítico para producción ya que `synchronize` puede causar pérdida de datos.

#### ✅ Tareas específicas

- [ ] Desactivar `synchronize: true` en la configuración de TypeORM
- [ ] Configurar correctamente las rutas de migraciones en ormconfig o el módulo de configuración
- [ ] Generar migración inicial (`InitialSchema`) que capture el estado actual de todas las entidades existentes:
  - `users`
  - `tarot_cards`
  - `tarot_decks`
  - `tarot_spreads`
  - `tarot_readings`
  - `reading_cards`
  - `tarot_interpretations`
- [ ] Crear scripts npm para gestión de migraciones:
  - `migration:generate`
  - `migration:run`
  - `migration:revert`
  - `migration:show`
- [ ] Documentar el proceso de creación y ejecución de migraciones para el equipo
- [ ] Configurar estrategia de rollback para migraciones fallidas
- [ ] Establecer convención de nombres para migraciones (timestamp + descripción)

#### 🎯 Criterios de aceptación

- ✓ El sistema debe arrancar sin `synchronize: true`
- ✓ Todas las tablas existentes deben estar reflejadas en migraciones
- ✓ Los comandos de migración funcionan correctamente en desarrollo

---

### **TASK-003: Implementar Validación Robusta de Variables de Entorno**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 2 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Implementar validación estricta de todas las variables de entorno necesarias usando `@nestjs/config` con `class-validator` y `class-transformer`. Esto previene que la aplicación arranque con configuración incompleta o inválida.

#### ✅ Tareas específicas

- [ ] Crear clase `EnvironmentVariables` con decoradores de validación para todas las variables requeridas
- [ ] Validar variables de base de datos:
  - `POSTGRES_HOST`
  - `POSTGRES_PORT`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DB`
- [ ] Validar variables de JWT:
  - `JWT_SECRET` (min 32 caracteres)
  - `JWT_EXPIRES_IN`
- [ ] Validar variables de OpenAI:
  - `OPENAI_API_KEY` (formato `sk-...`)
- [ ] Validar variables opcionales con valores por defecto:
  - `NODE_ENV`
  - `PORT`
  - `RATE_LIMIT_TTL`
  - `RATE_LIMIT_MAX`
- [ ] Configurar `ConfigModule` con `validationSchema` usando Joi o class-validator
- [ ] Crear archivo `.env.example` completo y actualizado con todas las variables documentadas
- [ ] Implementar mensajes de error descriptivos cuando falta o es inválida una variable
- [ ] Agregar validación de formato para URLs de `CORS_ORIGINS`

#### 🎯 Criterios de aceptación

- ✓ La aplicación no debe arrancar si faltan variables críticas
- ✓ Los mensajes de error deben indicar claramente qué variable falta o es inválida
- ✓ Existe documentación clara de todas las variables necesarias

---

### **TASK-004: Configurar API Key de OpenAI y Verificación de Conectividad**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 0.5 días  
**Dependencias:** TASK-003
**Dependencias:** TASK-003

#### 📋 Descripción

Configurar la API Key de OpenAI en las variables de entorno y crear un mecanismo de health check que verifique la conectividad con OpenAI al arrancar la aplicación.

#### ✅ Tareas específicas

- [ ] Documentar proceso de obtención de API Key en OpenAI Platform
- [ ] Agregar `OPENAI_API_KEY` a las variables de entorno con validación de formato
- [ ] Configurar `OPENAI_MODEL` como variable opcional (default: `gpt-4o-mini`)
- [ ] Crear servicio `OpenAIHealthService` que verifique la validez de la API key al startup
- [ ] Implementar endpoint `/health/openai` que retorne el estado de conectividad con OpenAI
- [ ] Configurar timeout apropiado para las llamadas a OpenAI API (30 segundos recomendado)
- [ ] Implementar logging específico para errores de OpenAI:
  - Rate limits
  - Invalid key
  - Network errors
- [ ] Agregar manejo de diferentes códigos de error de OpenAI:
  - `401` - Invalid API Key
  - `429` - Rate Limit Exceeded
  - `500` - OpenAI Server Error
- [ ] Documentar costos estimados y configuración de límites de uso en OpenAI

#### 🎯 Criterios de aceptación

- ✓ La aplicación verifica la API key al arrancar
- ✓ El health check retorna el estado correcto de conectividad
- ✓ Existen logs claros para troubleshooting de problemas con OpenAI

---

## 📚 Epic 2: Sistema de Datos Base de Tarot

> **Objetivo:** Establecer la base de datos completa de cartas, mazos y tiradas

---

### **TASK-005: Crear Seeders para las 78 Cartas del Tarot Estándar** ✅

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 3 días  
**Dependencias:** TASK-002  
**Estado:** ✅ COMPLETADO  
**Branch:** `feature/TASK-005-tarot-cards-seeder`  
**Commit:** `1f4a09f`  
**Fecha de Finalización:** 28 de Octubre 2025

#### 📋 Descripción

Crear seeders completos para las 78 cartas del Tarot de Rider-Waite con toda su información: nombres, significados (derecho e invertido), palabras clave, arcanos y palos.

#### ✅ Tareas específicas

- [x] Investigar y recopilar información completa de las **22 cartas de Arcanos Mayores**:
  - Nombre
  - Número
  - Significado derecho
  - Significado invertido
  - Palabras clave
  - Descripción
- [x] Recopilar información completa de los **56 Arcanos Menores** organizados por palos:
  - ♥ Copas
  - ⚔ Espadas
  - 🌿 Bastos
  - 🪙 Oros
- [x] Crear archivo de seeder TypeORM para la entidad `tarot_cards`
- [x] Estructurar los datos en formato JSON o TypeScript para fácil mantenimiento
- [x] Incluir URLs de Wikipedia para imágenes de cartas
- [x] Validar que cada carta tenga todos los campos obligatorios completos
- [x] Implementar verificación antes de seedear (no duplicar si ya existen cartas)
- [x] Documentar la fuente de los significados utilizados para referencia futura

#### 🎯 Criterios de aceptación

- ✅ Existen exactamente 78 cartas en la base de datos tras ejecutar el seed
- ✅ Cada carta tiene nombre, significados (derecho/invertido), keywords y descripción
- ✅ Los seeders son idempotentes (pueden ejecutarse múltiples veces sin duplicar)

#### ✅ Resumen de Implementación (Completado)

**Archivos creados:**

- `backend/tarot-app/docs/cards.md` (857 líneas) - Documentación completa de las 78 cartas
- `backend/tarot-app/src/database/seeds/data/tarot-cards.data.ts` (1104 líneas) - Datos estructurados
- `backend/tarot-app/src/database/seeds/tarot-cards.seeder.ts` (96 líneas) - Seeder principal
- `backend/tarot-app/src/database/seeds/tarot-cards.seeder.spec.ts` (315 líneas) - 15 tests unitarios

**Características implementadas:**

- ✅ 78 cartas completas: 22 Arcanos Mayores + 56 Arcanos Menores (14×4 palos)
- ✅ Seeder idempotente con validaciones de integridad
- ✅ Logging detallado con distribución de cartas por categoría
- ✅ Todos los campos requeridos: name, number, category, imageUrl, meaningUpright, meaningReversed, description, keywords
- ✅ 15 tests unitarios con 100% de cobertura
- ✅ 147 tests totales pasando (incluye 132 existentes + 15 nuevos)
- ✅ Metodología TDD Red-Green-Refactor aplicada
- ✅ Código formateado con Prettier y linted con ESLint

**Metodología TDD aplicada:**

1. ✅ Tests escritos primero (RED phase)
2. ✅ Implementación mínima para pasar tests (GREEN phase)
3. ✅ Refactorización y optimización (REFACTOR phase)
4. ✅ Verificación con suite completa de tests

---

### **TASK-005-a: Crear Seeders para Mazos (Decks) Predeterminados**

**Prioridad:** 🟡 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-004

#### 📋 Descripción

Crear seeder para al menos un mazo predeterminado (Rider-Waite) que agrupe las 78 cartas creadas. Preparar la estructura para futuros mazos adicionales.

#### ✅ Tareas específicas

- [ ] Crear seeder para entidad `tarot_decks` con el mazo "Rider-Waite Classic"
- [ ] Establecer este mazo como `is_default: true`
- [ ] Documentar la estructura para agregar mazos adicionales en el futuro (ej: Marsella, Thoth)
- [ ] Crear relación entre el mazo y las 78 cartas existentes (tabla intermedia si es necesario)
- [ ] Agregar descripción completa del mazo con información histórica
- [ ] Incluir metadata del mazo: año de creación, artista, tradición
- [ ] Implementar validación que asegure que siempre exista al menos un mazo default
- [ ] Crear endpoint `GET /decks/default` que retorne el mazo predeterminado

#### 🎯 Criterios de aceptación

- ✓ Existe un mazo "Rider-Waite Classic" marcado como default
- ✓ El mazo está correctamente vinculado a las 78 cartas
- ✓ El sistema puede manejar múltiples mazos (aunque solo exista uno)

---

### **TASK-005-a: Crear Seeders para Mazos (Decks) Predeterminados** ✅

**Prioridad:** 🟡 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-005  
**Estado:** ✅ COMPLETADO  
**Branch:** `feature/TASK-005-a-deck-seeder`  
**Commit:** Pending merge

#### 📋 Descripción

Crear seeder para al menos un mazo predeterminado (Rider-Waite) que agrupe las 78 cartas creadas. Preparar la estructura para futuros mazos adicionales.

#### ✅ Tareas específicas

- [x] Crear seeder para entidad `tarot_decks` con el mazo "Rider-Waite Classic"
- [x] Establecer este mazo como `is_default: true`
- [x] Documentar la estructura para agregar mazos adicionales en el futuro (ej: Marsella, Thoth)
- [x] Crear relación entre el mazo y las 78 cartas existentes (tabla intermedia si es necesario)
- [x] Agregar descripción completa del mazo con información histórica
- [x] Incluir metadata del mazo: año de creación, artista, tradición
- [x] Implementar validación que asegure que siempre exista al menos un mazo default
- [x] Crear endpoint `GET /decks/default` que retorne el mazo predeterminado

#### 🎯 Criterios de aceptación

- ✅ Existe un mazo "Rider-Waite Classic" marcado como default
- ✅ El mazo está correctamente vinculado a las 78 cartas
- ✅ El sistema puede manejar múltiples mazos (aunque solo exista uno)

#### ✅ Resumen de Implementación (Completado)

**Archivos creados/modificados:**

- `src/decks/entities/tarot-deck.entity.ts` - Added `isDefault`, `artist`, `yearCreated`, `tradition`, `publisher` fields
- `src/database/seeds/data/tarot-decks.data.ts` (106 líneas) - Datos estructurados del mazo Rider-Waite
- `src/database/seeds/tarot-decks.seeder.ts` (67 líneas) - Seeder principal
- `src/database/seeds/tarot-decks.seeder.spec.ts` (236 líneas) - 12 tests unitarios
- `src/decks/decks.service.ts` - Added `findDefaultDeck()` method
- `src/decks/decks.controller.ts` - Added `GET /decks/default` endpoint
- `src/seed-data.ts` - Integrated deck seeder before cards seeder

**Características implementadas:**

- ✅ Seeder idempotente con validaciones de integridad
- ✅ Mazo Rider-Waite con metadata histórica completa:
  - Artista: Pamela Colman Smith
  - Año: 1909
  - Tradición: Hermética / Orden del Amanecer Dorado
  - Editorial: Rider & Company
- ✅ Validación que solo permite un mazo default
- ✅ Endpoint público `GET /decks/default` funcional
- ✅ Documentación para agregar futuros mazos (Marsella, Thoth, etc.)
- ✅ 12 tests unitarios con 100% de cobertura
- ✅ 161 tests totales pasando (incluye 149 existentes + 12 nuevos)
- ✅ Metodología TDD Red-Green-Refactor aplicada
- ✅ Código formateado con Prettier y linted con ESLint

**Metodología TDD aplicada:**

1. ✅ Tests escritos primero para seeder (RED phase)
2. ✅ Implementación mínima para pasar tests (GREEN phase)
3. ✅ Tests escritos para endpoint GET /decks/default (RED phase)
4. ✅ Implementación del service y controller (GREEN phase)
5. ✅ Refactorización y limpieza de código (REFACTOR phase)
6. ✅ Verificación final con suite completa de tests

---

### **TASK-006: Crear Seeders para Tipos de Tiradas (Spreads) Predefinidos** 🚧

**Prioridad:** 🟡 ALTA  
**Estimación:** 1.5 días  
**Dependencias:** TASK-002  
**Estado:** 🚧 EN PROGRESO  
**Branch:** `feature/TASK-006-spreads-seeder`  
**Inicio:** 28 de Octubre 2025

#### 📋 Descripción

Crear seeders para tipos de tiradas predefinidas (1 carta, 3 cartas, Cruz Céltica) con sus posiciones y significados específicos. Los spreads definen la ESTRUCTURA de la lectura (cuántas cartas, qué significa cada posición), mientras que la IA interpreta las cartas que salen en cada posición.

**Ejemplo:** En una tirada de 3 cartas, las posiciones son:

1. Pasado (contexto)
2. Presente (situación actual)
3. Futuro (tendencia)

La IA recibirá: "En la posición PASADO salió la carta X, en PRESENTE la Y, en FUTURO la Z" y generará una interpretación coherente basada en esos significados posicionales.

#### ✅ Tareas específicas

- [ ] Crear seeder para `tarot_spreads` con **3-4 spreads esenciales**:
  - **Tirada de 1 carta** (respuesta rápida/del día)
  - **Tirada de 3 cartas** (pasado-presente-futuro)
  - **Tirada de 5 cartas** (situación-obstáculos-pasado-futuro-resultado)
  - **Cruz Céltica de 10 cartas** (spread completo tradicional)
- [ ] Definir estructura JSON para campo `positions` con significado de cada posición:
  ```json
  {
    "positions": [
      {
        "position": 1,
        "name": "Pasado",
        "description": "Eventos o influencias que llevaron a la situación actual",
        "interpretation_focus": "contexto histórico"
      },
      {
        "position": 2,
        "name": "Presente",
        "description": "La situación o energía actual",
        "interpretation_focus": "estado actual"
      }
    ]
  }
  ```
- [ ] Agregar descripción de cuándo usar cada spread:
  - 1 carta: respuestas rápidas, orientación diaria
  - 3 cartas: panorama general simple
  - 5 cartas: análisis profundo de situación
  - 10 cartas: lectura completa y detallada
- [ ] Incluir campo `difficulty` (beginner/intermediate/advanced)
- [ ] Marcar spreads con `is_beginner_friendly: true/false`
- [ ] Implementar validación: `card_count` debe coincidir con longitud de `positions`
- [ ] Documentar cómo la IA usará esta información en prompts

#### 🎯 Criterios de aceptación

- ✓ Existen 3-4 spreads básicos en la base de datos (suficiente para MVP)
- ✓ Cada spread tiene definidas todas sus posiciones con nombre y descripción
- ✓ La estructura JSON es consistente y lista para consumo por IA
- ✓ Está documentado cómo los spreads se usan en el prompt de OpenAI

---

## 🏷️ Epic 3: Sistema de Categorías y Preguntas Predefinidas

> **Objetivo:** Implementar sistema de categorías y preguntas predefinidas para usuarios free

---

### **TASK-007: Implementar Entidad y Módulo de Categorías de Lectura**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 2 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Crear la entidad `ReadingCategory` con sus 6 categorías principales (Amor, Trabajo, Dinero, Salud, Espiritual, General) y el módulo completo para su gestión.

#### ✅ Tareas específicas

- [ ] Crear entidad `ReadingCategory` con campos:
  - `id`, `name`, `slug`, `description`, `icon`, `color`, `order`
- [ ] Crear módulo `CategoriesModule` con su controlador y servicio
- [ ] Implementar endpoints CRUD básicos: `GET`, `POST`, `PUT`, `DELETE`
- [ ] Crear DTOs:
  - `CreateCategoryDto` con validaciones
  - `UpdateCategoryDto` con validaciones
- [ ] Implementar endpoint `GET /categories` que retorne todas las categorías ordenadas
- [ ] Agregar campo `is_active` para habilitar/deshabilitar categorías sin eliminarlas
- [ ] Implementar validación de unicidad en `slug`
- [ ] Crear guards que solo permitan a admins crear/modificar categorías
- [ ] Agregar relación con `tarot_readings` (foreign key `category_id`)
- [ ] Documentar con Swagger todos los endpoints

#### 🎯 Criterios de aceptación

- ✓ La entidad `Category` está correctamente definida y migrada
- ✓ Los endpoints CRUD funcionan correctamente
- ✓ Solo administradores pueden modificar categorías

---

### **TASK-008: Crear Seeders de Categorías con Iconos y Descripciones**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 día  
**Dependencias:** TASK-007

#### 📋 Descripción

Crear seeder con las 6 categorías predefinidas incluyendo iconos (emoji o referencias a iconos), colores y descripciones atractivas para usuarios.

#### ✅ Tareas específicas

- [ ] Crear seeder para las 6 categorías:
  - **❤️ Amor y Relaciones** (`#FF6B9D`)
  - **💼 Carrera y Trabajo** (`#4A90E2`)
  - **💰 Dinero y Finanzas** (`#F5A623`)
  - **🏥 Salud y Bienestar** (`#7ED321`)
  - **✨ Crecimiento Espiritual** (`#9013FE`)
  - **🌟 Consulta General** (`#50E3C2`)
- [ ] Escribir descripciones atractivas para cada categoría (1-2 oraciones)
- [ ] Asignar orden de visualización apropiado (`order: 1-6`)
- [ ] Implementar validación que evite duplicar categorías en múltiples ejecuciones
- [ ] Todas las categorías deben iniciarse como `is_active: true`

#### 🎯 Criterios de aceptación

- ✓ Existen exactamente 6 categorías después del seed
- ✓ Cada categoría tiene icono, color y descripción completa
- ✓ El seeder es idempotente

---

### **TASK-009: Implementar Entidad y Módulo de Preguntas Predefinidas**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 3 días  
**Dependencias:** TASK-007

#### 📋 Descripción

Crear la entidad `PredefinedQuestion` y su módulo completo para gestionar preguntas que usuarios free podrán seleccionar.

#### ✅ Tareas específicas

- [ ] Crear entidad `PredefinedQuestion` con campos:
  - `id`, `category_id` (FK), `question_text`, `order`, `is_active`, `created_at`, `updated_at`
- [ ] Crear relación Many-to-One con `ReadingCategory`
- [ ] Crear módulo `PredefinedQuestionsModule` con controlador y servicio
- [ ] Implementar endpoint `GET /predefined-questions?categoryId=X` que filtre por categoría
- [ ] Implementar endpoint `GET /predefined-questions/:id` para obtener pregunta específica
- [ ] Crear DTOs:
  - `CreatePredefinedQuestionDto` con validación de longitud (max 200 caracteres)
  - `UpdatePredefinedQuestionDto` con validación de longitud (max 200 caracteres)
- [ ] Implementar endpoints `POST`, `PUT`, `DELETE` protegidos para admin
- [ ] Agregar campo `usage_count` para trackear popularidad de preguntas
- [ ] Implementar soft-delete para preguntas (no eliminar físicamente)
- [ ] Agregar índice en `category_id` para optimizar queries
- [ ] Documentar endpoints con Swagger

#### 🎯 Criterios de aceptación

- ✓ La entidad está correctamente migrada con sus relaciones
- ✓ Usuarios pueden listar preguntas filtradas por categoría
- ✓ Solo admins pueden modificar preguntas

---

### **TASK-010: Crear Seeders de Preguntas Predefinidas por Categoría**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 2 días  
**Dependencias:** TASK-008, TASK-009

#### 📋 Descripción

Crear seeders con al menos 5-8 preguntas bien formuladas para cada una de las 6 categorías (total: 30-48 preguntas).

#### ✅ Tareas específicas

- [ ] Investigar y formular preguntas comunes de tarot para cada categoría
- [ ] Crear seeder con preguntas para "❤️ Amor y Relaciones":
  - "¿Cómo mejorar mi relación actual?"
  - "¿Encontraré el amor pronto?"
  - "¿Qué debo saber sobre mi vida amorosa?"
  - "¿Esta persona es adecuada para mí?"
  - "¿Cómo superar una ruptura?"
  - _Etc._ (mínimo 5)
- [ ] Crear preguntas similares para las otras 5 categorías
- [ ] Asegurar que las preguntas estén bien formuladas y sean abiertas (no sí/no)
- [ ] Ordenar preguntas de más generales a más específicas dentro de cada categoría
- [ ] Todas las preguntas deben iniciarse con `is_active: true`
- [ ] Implementar verificación de duplicados antes de insertar
- [ ] Documentar la lógica de formulación de preguntas para mantener consistencia

#### 🎯 Criterios de aceptación

- ✓ Existen al menos 5 preguntas por cada categoría (30 total mínimo)
- ✓ Las preguntas están correctamente asociadas a sus categorías
- ✓ Las preguntas son coherentes y útiles para lecturas de tarot

---

## 💎 Epic 4: Sistema de Planes y Límites de Uso

> **Objetivo:** Diferenciar usuarios FREE vs PREMIUM con límites y capacidades distintas

---

### **TASK-011: Ampliar Entidad User con Sistema de Planes**

**Prioridad:** 🟡 ALTA  
**Estimación:** 2 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Modificar la entidad `User` para incluir sistema completo de planes (free/premium) con campos relacionados a suscripción y límites.

#### ✅ Tareas específicas

- [ ] Crear migración que agregue campos a tabla `users`:
  - `plan` (enum: `'free'`, `'premium'`, default: `'free'`)
  - `plan_started_at` (timestamp, nullable)
  - `plan_expires_at` (timestamp, nullable)
  - `subscription_status` (enum: `'active'`, `'cancelled'`, `'expired'`, nullable)
  - `stripe_customer_id` (string, nullable, para futura integración)
- [ ] Actualizar entidad `User` con estos nuevos campos
- [ ] Implementar método `isPremium()` en la entidad que verifique si el plan es premium y está activo
- [ ] Implementar método `hasPlanExpired()` que verifique la fecha de expiración
- [ ] Crear DTO `UpdateUserPlanDto` para cambios de plan por admin
- [ ] Actualizar servicios de autenticación para incluir información de plan en JWT payload
- [ ] Crear índice en campo `plan` para queries eficientes

#### 🎯 Criterios de aceptación

- ✓ Los campos nuevos están correctamente migrados
- ✓ Los métodos de verificación de plan funcionan correctamente
- ✓ El token JWT incluye información del plan del usuario

---

### **TASK-012: Implementar Entidad y Módulo de Límites de Uso (Usage Limits)**

**Prioridad:** 🟡 ALTA  
**Estimación:** 3 días  
**Dependencias:** TASK-011

#### 📋 Descripción

Crear sistema completo de tracking de límites de uso para usuarios free (lecturas por día, regeneraciones, etc.).

#### ✅ Tareas específicas

- [ ] Crear entidad `UsageLimit` con campos:
  - `id`, `user_id` (FK), `feature` (enum), `count`, `date`, `created_at`
- [ ] Enum `feature` debe incluir:
  - `'tarot_reading'`
  - `'oracle_query'`
  - `'interpretation_regeneration'`
- [ ] Crear índice compuesto único en `(user_id, feature, date)`
- [ ] Crear módulo `UsageLimitsModule` con servicio `UsageLimitsService`
- [ ] Implementar método `checkLimit(userId, feature)` que verifique si el usuario puede usar una feature
- [ ] Implementar método `incrementUsage(userId, feature)` que incremente el contador
- [ ] Implementar método `getRemainingUsage(userId, feature)` que retorne cuántos usos quedan
- [ ] Crear constantes configurables para límites:
  - `FREE_DAILY_READINGS: 3`
  - `PREMIUM_DAILY_READINGS: unlimited (-1)`
  - `FREE_REGENERATIONS: 0`
  - `PREMIUM_REGENERATIONS: unlimited`
- [ ] Implementar reset automático diario (los contadores se resetean a medianoche)
- [ ] Crear tarea cron que limpie registros antiguos (más de 7 días)

#### 🎯 Criterios de aceptación

- ✓ El sistema trackea correctamente el uso de features por usuario
- ✓ Los límites se respetan según el plan (free/premium)
- ✓ Los contadores se resetean apropiadamente cada día

---

### **TASK-013: Modificar Sistema de Lecturas para Preguntas Predefinidas vs Libres**

**Prioridad:** � CRÍTICA  
**Estimación:** 3 días  
**Dependencias:** TASK-009, TASK-011

#### 📋 Descripción

Adaptar el flujo de creación de lecturas para que usuarios free solo puedan usar preguntas predefinidas y usuarios premium escriban libremente.

#### ✅ Tareas específicas

- [ ] Modificar `CreateReadingDto` para incluir:
  - `predefined_question_id` (opcional)
  - `custom_question` (opcional)
  - Validación: usuarios free DEBEN usar `predefined_question_id`
  - Validación: usuarios premium PUEDEN usar cualquiera de los dos
- [ ] Crear guard `@RequiresPremiumForCustomQuestion()` que valide el tipo de pregunta
- [ ] Actualizar entidad `TarotReading` para incluir ambos campos:
  - `predefined_question_id` (FK nullable)
  - `custom_question` (string nullable)
- [ ] Modificar `TarotService.createReading()` para manejar ambos tipos de preguntas
- [ ] Agregar relación con `PredefinedQuestion` en la entidad
- [ ] Actualizar endpoint `POST /tarot/reading` con validación de plan
- [ ] Implementar mensajes de error claros cuando usuario free intenta pregunta custom
- [ ] Agregar campo `question_type` (`'predefined'` | `'custom'`) para analytics
- [ ] Actualizar tests unitarios y e2e para ambos flujos

#### 🎯 Criterios de aceptación

- ✓ Usuarios free solo pueden crear lecturas con preguntas predefinidas
- ✓ Usuarios premium pueden usar ambos tipos de preguntas
- ✓ Los errores de validación son claros y útiles

---

### **TASK-014: Implementar Rate Limiting Global**

**Prioridad:** 🟡 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-002

#### 📋 Descripción

Implementar rate limiting global para proteger la API de abuso y ataques DDoS usando `@nestjs/throttler`.

#### ✅ Tareas específicas

- [ ] Instalar dependencia `@nestjs/throttler`
- [ ] Configurar `ThrottlerModule` a nivel global en `AppModule`
- [ ] Establecer límites por defecto:
  - **Global**: 100 requests/minuto por IP
  - **Auth endpoints** (`/auth/*`): 5 requests/minuto
  - **Lecturas** (`/tarot/reading`): 10 requests/minuto
- [ ] Configurar diferentes límites para usuarios premium vs free
- [ ] Implementar custom storage si se requiere (Redis para producción)
- [ ] Crear decorador `@SkipThrottle()` para endpoints públicos específicos
- [ ] Personalizar mensajes de error cuando se excede rate limit
- [ ] Agregar headers de respuesta con información de límites (`X-RateLimit-*`)
- [ ] Documentar límites en Swagger y README

#### 🎯 Criterios de aceptación

- ✓ Los endpoints están protegidos contra spam y abuso
- ✓ Los límites son apropiados para cada tipo de endpoint
- ✓ Los usuarios reciben feedback claro sobre límites

---

### **TASK-015: Implementar Sistema de Refresh Tokens**

**Prioridad:** 🟡 ALTA  
**Estimación:** 3 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Implementar refresh tokens para mejorar seguridad y UX. Los access tokens serán de corta duración y se renovarán con refresh tokens.

#### ✅ Tareas específicas

- [ ] Crear entidad `RefreshToken` con campos:
  - `id`, `user_id` (FK), `token` (hashed), `expires_at`, `created_at`, `revoked_at`, `ip_address`, `user_agent`
- [ ] Generar refresh token aleatorio y seguro (usar `crypto.randomBytes`)
- [ ] Almacenar hash del refresh token en DB (no el token en texto plano)
- [ ] Configurar access token con duración corta (15 minutos)
- [ ] Configurar refresh token con duración larga (7 días)
- [ ] Implementar endpoint `POST /auth/refresh` que reciba refresh token y retorne nuevo access token
- [ ] Validar que el refresh token no esté expirado ni revocado
- [ ] Implementar rotación de refresh tokens (generar nuevo refresh token en cada renovación)
- [ ] Revocar el refresh token viejo automáticamente al generar uno nuevo
- [ ] Implementar endpoint `POST /auth/logout` que revoque el refresh token actual
- [ ] Implementar endpoint `POST /auth/logout-all` que revoque todos los refresh tokens del usuario
- [ ] Agregar índice en `user_id` y `token` para búsquedas eficientes
- [ ] Implementar tarea cron que elimine refresh tokens expirados (más de 30 días)

#### 🎯 Criterios de aceptación

- ✓ Los access tokens tienen duración corta (15 min)
- ✓ El sistema renueva access tokens usando refresh tokens correctamente
- ✓ Los refresh tokens se revocan apropiadamente en logout

---

### **TASK-016: Implementar Servicio de Email (Básico con Nodemailer)**

**Prioridad:** � MEDIA  
**Estimación:** 2 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Implementar servicio básico de email usando Nodemailer para enviar lecturas compartidas, notificaciones de cambio de plan, y recuperación de contraseña.

#### ✅ Tareas específicas

- [ ] Instalar dependencias: `nodemailer`, `@nestjs-modules/mailer`
- [ ] Crear módulo `EmailModule` con servicio `EmailService`
- [ ] Configurar Nodemailer con variables de entorno:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - `EMAIL_FROM` (email del remitente)
- [ ] Crear templates básicos en HTML/Handlebars:
  - Template de lectura compartida
  - Template de bienvenida
  - Template de cambio de plan
  - Template de recuperación de contraseña
- [ ] Implementar método `sendSharedReading(to, readingData)`
- [ ] Implementar método `sendWelcomeEmail(to, userName)`
- [ ] Implementar método `sendPasswordResetEmail(to, resetToken)`
- [ ] Agregar queue para emails (opcional pero recomendado con Bull)
- [ ] Implementar manejo de errores y reintentos
- [ ] Agregar logging de emails enviados
- [ ] Configurar rate limiting específico para envío de emails (5 por minuto)

#### 🎯 Criterios de aceptación

- ✓ Los emails se envían correctamente
- ✓ Los templates son atractivos y profesionales
- ✓ Existe manejo robusto de errores

---

### **TASK-017: Implementar Módulo de Recuperación de Contraseña**

**Prioridad:** � ALTA  
**Estimación:** 3 días  
**Dependencias:** TASK-002, TASK-016

#### 📋 Descripción

Crear flujo completo de recuperación de contraseña con tokens seguros y expiración temporal.

#### ✅ Tareas específicas

- [ ] Crear entidad `PasswordResetToken` con campos:
  - `id`, `user_id` (FK), `token` (hashed), `expires_at`, `used_at`, `created_at`
- [ ] Implementar endpoint `POST /auth/forgot-password` que reciba email
- [ ] Generar token aleatorio seguro de 32 bytes
- [ ] Almacenar hash del token en DB con expiración de 1 hora
- [ ] Enviar email con link de reset (formato: `/reset-password?token=XXX`)
- [ ] Implementar endpoint `POST /auth/reset-password` que reciba token y nueva contraseña
- [ ] Validar que el token exista, no esté usado y no esté expirado
- [ ] Validar fortaleza de la nueva contraseña (min 8 caracteres, mayúsculas, números)
- [ ] Actualizar contraseña del usuario y marcar token como usado
- [ ] Invalidar todos los refresh tokens del usuario por seguridad
- [ ] Enviar email de confirmación de cambio de contraseña
- [ ] Implementar tarea cron que elimine tokens expirados (más de 7 días)
- [ ] Por ahora, loggear el link de reset en consola (hasta implementar email real)

#### 🎯 Criterios de aceptación

- ✓ El flujo de reset funciona completamente
- ✓ Los tokens son seguros y tienen expiración
- ✓ Se invalidan sesiones previas tras el cambio de contraseña

---

## 🤖 Epic 6: Optimización de Interpretaciones con IA

> **Objetivo:** Optimizar prompts y monitorear uso de OpenAI para interpretaciones de calidad

---

### **TASK-018: Optimizar Prompts de OpenAI para Tarot**

**Prioridad:** 🟡 ALTA  
**Estimación:** 3 días  
**Dependencias:** TASK-003, TASK-004, TASK-006

#### 📋 Descripción

Refinar y optimizar los system prompts y user prompts enviados a OpenAI para obtener interpretaciones de alta calidad, coherentes y en el tono adecuado. **IMPORTANTE:** Los spreads (TASK-006) proporcionan la estructura posicional, las cartas (TASK-004) dan los significados, y la IA combina ambos para crear la interpretación final.

#### ✅ Tareas específicas

- [ ] Investigar mejores prácticas de prompt engineering para interpretaciones místicas
- [ ] Crear prompt de sistema (system message) que defina el rol del asistente:
  - "Eres una tarotista experta con 20 años de experiencia..."
  - Definir tono: empático, místico pero accesible, sin tecnicismos excesivos
  - Definir estructura de respuesta esperada
- [ ] Crear template de prompt de usuario que incluya:

  - **Pregunta del usuario** y **categoría** (amor, trabajo, etc.)
  - **Spread utilizado** con descripción de cada posición (desde TASK-006)
  - **Cartas que salieron** en cada posición con:
    - Nombre de la carta (desde seeder TASK-004)
    - Significado general (upright/reversed desde TASK-004)
    - Posición en el spread (ej: "Carta en posición PASADO")
  - Ejemplo de estructura:

    ```
    Spread: Tirada de 3 cartas
    Pregunta: "¿Cómo va mi relación?" (Categoría: Amor)

    Posición 1 (PASADO - Contexto histórico):
    - Carta: El Loco (derecha)
    - Significado general: Nuevos comienzos, espontaneidad, libertad

    Posición 2 (PRESENTE - Situación actual):
    - Carta: Los Enamorados (invertida)
    - Significado general invertido: Desalineación, conflicto de valores

    Posición 3 (FUTURO - Tendencia):
    - Carta: La Torre (derecha)
    - Significado general: Cambios abruptos, revelaciones

    Instrucciones: Interpreta estas cartas considerando sus posiciones y la pregunta del usuario.
    ```

- [ ] Implementar instrucciones específicas para respuesta estructurada:
  - Interpretación general (2-3 párrafos) integrando todas las posiciones
  - Análisis posicional (1 párrafo por carta en su posición específica)
  - Relaciones entre cartas y el flujo temporal/energético (1-2 párrafos)
  - Consejos prácticos (lista de 2-3 puntos accionables)
  - Conclusión final (1 párrafo)
- [ ] Limitar tokens de respuesta para control de costos:
  - 1 carta: max 400 tokens
  - 3 cartas: max 600 tokens
  - 5+ cartas: max 800 tokens
- [ ] Implementar fallback a respuesta predeterminada si OpenAI falla
- [ ] Agregar timeout de 30 segundos para llamadas a OpenAI
- [ ] Documentar con ejemplos cómo se construye el prompt desde las 3 fuentes de datos:
  1. Spread (estructura posicional)
  2. Cartas (significados)
  3. Pregunta/categoría del usuario

#### 🎯 Criterios de aceptación

- ✓ Las interpretaciones integran correctamente spread + cartas + pregunta
- ✓ El prompt incluye significado posicional de cada carta
- ✓ El tono es apropiado para una aplicación de tarot
- ✓ Las respuestas no exceden el límite de tokens configurado
- ✓ Está documentado cómo se construye el prompt completo

---

### **TASK-019: Implementar Sistema de Logging de Uso de OpenAI**

**Prioridad:** 🟡 ALTA  
**Estimación:** 2 días  
**Dependencias:** TASK-003

#### 📋 Descripción

Crear sistema robusto de logging que trackee todas las llamadas a OpenAI para monitorear costos, rendimiento y debugging.

#### ✅ Tareas específicas

- [ ] Crear entidad `OpenAIUsageLog` con campos:
  - `id`, `user_id` (FK nullable), `reading_id` (FK nullable)
  - `model_used`, `prompt_tokens`, `completion_tokens`, `total_tokens`
  - `cost_usd`, `duration_ms`, `status` (`'success'`, `'error'`)
  - `error_message`, `created_at`
- [ ] Interceptar todas las llamadas al servicio de OpenAI
- [ ] Registrar cada llamada con su información completa antes y después de la ejecución
- [ ] Calcular costo estimado basándose en el pricing de OpenAI:
  - GPT-4o-mini input: $0.15/1M tokens
  - GPT-4o-mini output: $0.60/1M tokens
- [ ] Medir tiempo de respuesta de OpenAI en milisegundos
- [ ] Loggear errores con stack trace completo para debugging
- [ ] Crear endpoint `GET /admin/openai-usage` que retorne estadísticas:
  - Total de llamadas por día/semana/mes
  - Tokens consumidos totales
  - Costo estimado acumulado
  - Tiempo promedio de respuesta
  - Promedio de tokens por interpretación
  - Tasa de errores
- [ ] Implementar alertas cuando el costo diario supere un threshold configurable
- [ ] Agregar índices en `created_at` y `user_id` para queries de reportes

#### 🎯 Criterios de aceptación

- ✓ Todas las llamadas a OpenAI se registran correctamente
- ✓ Los costos se calculan con precisión
- ✓ Los administradores pueden consultar estadísticas de uso

---

### **TASK-020: Implementar Caché de Interpretaciones Similares**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 3 días  
**Dependencias:** TASK-003

#### 📋 Descripción

Implementar sistema de caché IN-MEMORY (usando `@nestjs/cache-manager`) que reutilice interpretaciones cuando las combinaciones de cartas y preguntas sean similares, reduciendo costos de OpenAI. **NO requiere Redis para MVP** - usar caché en memoria es suficiente.

#### ✅ Tareas específicas

- [ ] **Configurar caché in-memory de NestJS:**
  ```typescript
  CacheModule.register({
    ttl: 86400, // 24 horas en segundos
    max: 200, // máximo 200 interpretaciones en caché
  });
  ```
- [ ] Crear entidad `CachedInterpretation` con campos:
  - `id`, `cache_key` (unique), `spread_id`, `card_combination` (jsonb)
  - `question_hash` (hash de la pregunta), `interpretation_text`
  - `hit_count`, `last_used_at`, `created_at`, `expires_at`
- [ ] Generar `cache_key` determinístico basado en:
  - IDs de cartas ordenados
  - Posiciones de las cartas
  - Estado (derecha/invertida) de cada carta
  - Spread utilizado
  - Hash de la pregunta (categoría + pregunta normalizada)
- [ ] Implementar **estrategia dual de caché**:
  1. **Caché in-memory** (rápido, para interpretaciones frecuentes):
     - Guardar en `@nestjs/cache-manager` con TTL de 1 hora
     - Ideal para cartas/spreads/categorías (datos estáticos)
  2. **Caché en base de datos** (persistente, para interpretaciones completas):
     - Guardar en `CachedInterpretation` con TTL de 30 días
     - Para reutilizar interpretaciones de IA
- [ ] Implementar lógica de búsqueda en caché ANTES de llamar a OpenAI:
  - Si existe caché válido (no expirado): retornar interpretación cacheada
  - Si no existe: generar con OpenAI y almacenar en ambos cachés
- [ ] Configurar expiración:
  - Caché in-memory: 1 hora (auto-limpieza)
  - Caché DB: 30 días
- [ ] Incrementar `hit_count` cada vez que se usa una interpretación cacheada
- [ ] Actualizar `last_used_at` en cada hit
- [ ] Crear endpoint `DELETE /admin/cache/clear` para limpiar ambos cachés
- [ ] Implementar tarea cron que limpie cachés expirados de DB (más de 30 días)
- [ ] **Documentar plan de migración a Redis** (opcional, para escalabilidad futura):
  - Cuando tener múltiples instancias del backend
  - Cuando el caché in-memory consuma mucha RAM
  - Ver TASK-044 para implementación completa

#### 🎯 Criterios de aceptación

- ✓ El caché in-memory funciona para datos estáticos (cartas, spreads)
- ✓ El caché DB funciona para interpretaciones de IA
- ✓ Se reduce significativamente el número de llamadas a OpenAI
- ✓ El caché se invalida apropiadamente cuando expira
- ✓ Está documentado cuándo migrar a Redis (no necesario para MVP)
- [ ] Implementar tarea cron que elimine caché expirado y poco usado (hit_count < 2 después de 7 días)
- [ ] Agregar flag `from_cache: boolean` en la respuesta de interpretación para transparencia
- [ ] Implementar índice en `cache_key` para búsquedas ultra-rápidas
- [ ] Calcular y loggear tasa de cache hit rate para optimización
- [ ] Documentar estrategia de invalidación de caché si se actualizan significados de cartas

#### 🎯 Criterios de aceptación

- ✓ El sistema busca en caché antes de llamar a OpenAI
- ✓ El cache hit rate es rastreable y medible
- ✓ Los costos de OpenAI se reducen significativamente con caché activo

---

## 🎨 Epic 7: Mejoras en Módulo de Lecturas

> **Objetivo:** Pulir experiencia de lecturas con features avanzadas

---

### **TASK-021: Implementar Manejo Robusto de Errores de OpenAI**

**Prioridad:** 🟡 ALTA  
**Estimación:** 2 días  
**Dependencias:** TASK-003

#### 📋 Descripción

Implementar sistema completo de manejo de errores para diferentes escenarios de fallo de OpenAI con fallbacks apropiados.

#### ✅ Tareas específicas

- [ ] Crear enum `OpenAIErrorType` con tipos:
  - `RATE_LIMIT`, `INVALID_KEY`, `TIMEOUT`, `CONTEXT_LENGTH`, `SERVER_ERROR`, `NETWORK_ERROR`
- [ ] Implementar manejo específico para cada código de error de OpenAI:
  - **401** (Invalid API Key): Error crítico, notificar a admin
  - **429** (Rate Limit): Implementar retry con exponential backoff (3 intentos)
  - **500/502/503** (Server Error): Retry hasta 2 veces
  - **Timeout**: Retry 1 vez con timeout extendido
- [ ] Crear clase custom `OpenAIException` que extienda `HttpException`
- [ ] Implementar mensajes de error user-friendly para cada tipo:
  - "El servicio de interpretación está temporalmente ocupado, intenta en unos minutos"
  - "Estamos experimentando dificultades técnicas, por favor intenta más tarde"
- [ ] Implementar sistema de fallback con interpretaciones genéricas si OpenAI falla completamente:
  - Usar significados base de las cartas de la DB
  - Combinar significados con template genérico
  - Marcar interpretación como `is_fallback: true`
- [ ] Loggear todos los errores con contexto completo (user_id, reading_id, error type)
- [ ] Implementar circuit breaker pattern: si OpenAI falla 5 veces consecutivas, usar fallback automáticamente por 5 minutos
- [ ] Crear notificaciones automáticas a admin cuando el circuit breaker se active
- [ ] Agregar métricas de tasa de error en endpoint de estadísticas

#### 🎯 Criterios de aceptación

- ✓ El sistema maneja gracefully todos los tipos de error de OpenAI
- ✓ Los usuarios reciben mensajes claros cuando hay problemas
- ✓ Existe fallback funcional cuando OpenAI no está disponible

---

### **TASK-022: Implementar Endpoint de Regeneración de Interpretación**

**Prioridad:** � MEDIA  
**Estimación:** 2 días  
**Dependencias:** TASK-012, TASK-018

#### 📋 Descripción

Crear endpoint que permita a usuarios premium regenerar la interpretación de una lectura existente (mismas cartas, nueva interpretación).

#### ✅ Tareas específicas

- [ ] Crear endpoint `POST /readings/:id/regenerate`
- [ ] Aplicar guard `@CheckUsageLimit('interpretation_regeneration')`
- [ ] Verificar que el usuario sea premium (users free no pueden regenerar)
- [ ] Verificar que la lectura pertenezca al usuario autenticado
- [ ] Mantener las mismas cartas, posiciones y estado (derecha/invertida)
- [ ] Generar nueva interpretación llamando a OpenAI con prompt ligeramente modificado:
  - Agregar instrucción "Proporciona una perspectiva alternativa..."
- [ ] Crear nueva entrada en tabla `tarot_interpretations` vinculada a la misma lectura
- [ ] Retornar la nueva interpretación manteniendo acceso a las anteriores
- [ ] Actualizar campo `updated_at` de la lectura
- [ ] Agregar campo `regeneration_count` en `TarotReading` para trackear cuántas veces se regeneró
- [ ] Limitar regeneraciones a máximo 3 por lectura (incluso para premium) para prevenir abuso
- [ ] Retornar error 429 si se excede el límite de regeneraciones de la lectura
- [ ] NO usar caché para regeneraciones (siempre generar interpretación nueva)

#### 🎯 Criterios de aceptación

- ✓ Usuarios premium pueden regenerar interpretaciones
- ✓ Se mantiene historial de todas las interpretaciones generadas
- ✓ Existe límite razonable de regeneraciones por lectura

---

### **TASK-023: Implementar Endpoint de Historial de Lecturas con Paginación**

**Prioridad:** 🟡 ALTA  
**Estimación:** 2 días  
**Dependencias:** Ninguna

#### 📋 Descripción

Mejorar el endpoint de historial de lecturas con paginación eficiente, filtros y ordenamiento para manejar usuarios con muchas lecturas.

#### ✅ Tareas específicas

- [ ] Modificar endpoint `GET /readings` para incluir paginación con query params:
  - `page` (default: 1)
  - `limit` (default: 10, max: 50)
  - `sortBy` (options: `'created_at'`, `'updated_at'`, default: `'created_at'`)
  - `sortOrder` (options: `'ASC'`, `'DESC'`, default: `'DESC'`)
- [ ] Implementar filtros opcionales:
  - `categoryId`: filtrar por categoría
  - `spreadId`: filtrar por tipo de tirada
  - `dateFrom` y `dateTo`: filtrar por rango de fechas
- [ ] Usar TypeORM pagination con `skip` y `take`
- [ ] Retornar metadata de paginación en la respuesta:

```typescript
{
  data: [...lecturas],
  meta: {
    page, limit, totalItems, totalPages, hasNextPage, hasPreviousPage
  }
}
```

- [ ] Implementar eager loading de relaciones necesarias (cards, spread, interpretations)
      Optimizar query con select específico (no traer campos innecesarios)
      Para usuarios free: limitar historial a últimas 10 lecturas
      Para usuarios premium: acceso ilimitado al historial
- [ ] Agregar índice compuesto en `(user_id, created_at)` para optimizar queries
- [ ] Implementar caché de 5 minutos para lista de historial (usar interceptor)

#### 🎯 Criterios de aceptación

- ✓ El endpoint retorna lecturas paginadas correctamente
- ✓ Los filtros funcionan y son combinables
- ✓ La performance es buena incluso con miles de lecturas

---

### **TASK-024: Implementar Soft Delete en Lecturas**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 2 días  
**Dependencias:** Ninguna

#### 📋 Descripción

Implementar eliminación lógica (soft delete) de lecturas para permitir que usuarios "eliminen" lecturas sin perder datos permanentemente.

#### ✅ Tareas específicas

- [ ] Agregar campo `deleted_at` (timestamp nullable) a entidad `TarotReading`
- [ ] Configurar TypeORM con `@DeleteDateColumn()` para soft delete automático
- [ ] Implementar endpoint `DELETE /readings/:id` que haga soft delete
- [ ] Verificar que la lectura pertenezca al usuario autenticado antes de eliminar
- [ ] Por defecto, excluir lecturas eliminadas de todos los queries:
  - Usar global scope en repositorio
  - O aplicar filtro `where: { deleted_at: IsNull() }` en queries
- [ ] Crear endpoint `GET /readings/trash` para que usuarios vean lecturas eliminadas (últimos 30 días)
- [ ] Implementar endpoint `POST /readings/:id/restore` para restaurar lecturas eliminadas
- [ ] Crear tarea cron que elimine permanentemente (hard delete) lecturas soft-deleted hace más de 30 días
- [ ] Para admin: endpoint `GET /admin/readings?includeDeleted=true` que muestre todas las lecturas
- [ ] Agregar índice en `deleted_at` para optimizar queries de lecturas activas

#### 🎯 Criterios de aceptación

- ✓ Las lecturas "eliminadas" no se muestran pero no se pierden
- ✓ Los usuarios pueden restaurar lecturas eliminadas dentro de 30 días
- ✓ El hard delete automático funciona correctamente

---

### **TASK-025: Implementar Sistema de Compartir Lecturas (Preparación)**

**Prioridad:** 🟢 BAJA  
**Estimación:** 3 días  
**Dependencias:** TASK-011

#### 📋 Descripción

Preparar backend para sistema de compartir lecturas mediante tokens únicos, permitiendo que usuarios premium compartan sus lecturas públicamente.

#### ✅ Tareas específicas

- [ ] Agregar campo `shared_token` (string unique nullable) a entidad `TarotReading`
- [ ] Agregar campo `is_public` (boolean default false) a entidad `TarotReading`
- [ ] Implementar endpoint `POST /readings/:id/share` (solo premium):
  - Generar token único seguro (8-12 caracteres alfanuméricos)
  - Marcar lectura como `is_public: true`
  - Retornar URL completa: `https://app.com/shared/{token}`
- [ ] Implementar endpoint `DELETE /readings/:id/unshare`:
  - Remover token y marcar `is_public: false`
- [ ] Implementar endpoint público `GET /shared/:token`:
  - No requiere autenticación
  - Retorna lectura completa sin información del usuario (solo nombre/alias si se configura)
  - Incrementar contador `view_count` cada vez que se accede
- [ ] Agregar campo `view_count` (integer default 0) para trackear visualizaciones
- [ ] Validar que solo usuarios premium puedan compartir
- [ ] Verificar que el token sea único antes de guardarlo (retry si colisión)
- [ ] Crear índice único en `shared_token` para búsquedas rápidas
- [ ] Implementar rate limiting especial para endpoint público (100 requests/15min por IP)

#### 🎯 Criterios de aceptación

- ✓ Usuarios premium pueden generar enlaces de compartir
- ✓ El endpoint público funciona sin autenticación
- ✓ Se trackean las visualizaciones de lecturas compartidas

---

## 👨‍💼 Epic 8: Módulo de Administración

> **Objetivo:** Implementar panel administrativo con control de acceso granular

---

### **TASK-026: Implementar RBAC (Role-Based Access Control) Mejorado**

**Prioridad:** 🟡 ALTA  
**Estimación:** 3 días  
**Dependencias:** Ninguna

#### 📋 Descripción

Expandir sistema de roles para incluir diferentes niveles de permisos administrativos y crear guards reutilizables.

#### ✅ Tareas específicas

- [ ] Modificar enum `role` en entidad `User` para incluir:
  - `'user'` (usuario regular)
  - `'moderator'` (moderador con permisos limitados)
  - `'admin'` (administrador completo)
  - `'superadmin'` (acceso total al sistema)
- [ ] Crear tabla `permissions` con permisos granulares:
  - `manage_users`, `manage_cards`, `manage_readings`, `manage_content`, `view_analytics`, etc.
- [ ] Crear tabla intermedia `role_permissions` para asignar permisos a roles
- [ ] Implementar decorador `@Roles(...roles)` mejorado que acepte múltiples roles
- [ ] Crear guard `RolesGuard` que verifique el rol del usuario
- [ ] Implementar decorador `@RequiresPermission(permission)` para permisos específicos
- [ ] Crear guard `PermissionsGuard` que verifique permisos granulares
- [ ] Seedear permisos por defecto y asignarlos a cada rol:
  - **User:** sin permisos administrativos
  - **Moderator:** `view_analytics`, `manage_content` (rituales)
  - **Admin:** todos excepto `manage_admins`
  - **Superadmin:** todos los permisos
- [ ] Implementar método `hasPermission(permission)` en entidad `User`
- [ ] Aplicar guards a todos los endpoints administrativos existentes
- [ ] Documentar matriz de roles y permisos

#### 🎯 Criterios de aceptación

- ✓ Existen múltiples roles con diferentes niveles de acceso
- ✓ Los guards protegen correctamente los endpoints según rol/permiso
- ✓ El sistema es extensible para agregar nuevos permisos

---

### **TASK-028: Crear Endpoints de Gestión de Usuarios para Admin**

**Prioridad:** 🟡 ALTA  
**Estimación:** 3 días  
**Dependencias:** TASK-027

#### 📋 Descripción

Implementar panel completo de administración de usuarios con búsqueda, filtros y acciones administrativas.

#### ✅ Tareas específicas

- [ ] Crear módulo `AdminUsersModule` con controlador dedicado `/admin/users`
- [ ] Implementar endpoint `GET /admin/users` con paginación, búsqueda y filtros:
  - **Search:** buscar por email, nombre
  - **Filtros:** por rol, plan, estado (activo/verificado), fecha de registro
  - **Ordenamiento:** por `created_at`, `last_login`, `total_readings`
- [ ] Implementar endpoint `GET /admin/users/:id` que retorne información detallada:
  - Información básica del usuario
  - Estadísticas: total de lecturas, fecha última lectura, uso de OpenAI
  - Plan actual y fechas de suscripción
  - Historial de cambios de rol
- [ ] Implementar endpoint `PATCH /admin/users/:id/role` para cambiar rol de usuario
- [ ] Implementar endpoint `PATCH /admin/users/:id/plan` para cambiar plan (free/premium)
- [ ] Implementar endpoint `POST /admin/users/:id/ban` para suspender usuario:
  - Agregar campo `banned_at` y `ban_reason` a `User` entity
  - Usuario baneado no puede hacer login
- [ ] Implementar endpoint `POST /admin/users/:id/unban` para reactivar usuario
- [ ] Implementar endpoint `DELETE /admin/users/:id` para eliminación lógica de usuarios
- [ ] Crear DTO `UpdateUserRoleDto`, `UpdateUserPlanDto`, `BanUserDto` con validaciones
- [ ] Agregar logging de todas las acciones administrativas (audit log)
- [ ] Proteger todos los endpoints con `@Roles('admin', 'superadmin')`
- [ ] Implementar índices en campos de búsqueda frecuente

#### 🎯 Criterios de aceptación

- ✓ Los admins pueden buscar, filtrar y gestionar usuarios
- ✓ Todas las acciones administrativas quedan registradas
- ✓ Los endpoints están protegidos con roles apropiados

---

### **TASK-029: Crear Dashboard de Estadísticas para Admin**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 4 días  
**Dependencias:** TASK-019, TASK-027

#### 📋 Descripción

Implementar endpoint que retorne métricas y estadísticas clave de la aplicación para panel de administración.

#### ✅ Tareas específicas

- [ ] Crear endpoint `GET /admin/dashboard/stats` que retorne:
  - **Usuarios:**
    - Total de usuarios registrados
    - Usuarios activos (con al menos 1 lectura en últimos 30 días)
    - Nuevos registros por día/semana/mes
    - Distribución por plan (free/premium)
    - Tasa de conversión a premium
  - **Lecturas:**
    - Total de lecturas realizadas
    - Lecturas por día/semana/mes
    - Promedio de lecturas por usuario
    - Distribución por categoría
    - Distribución por tipo de spread
  - **Cartas:**
    - Cartas más consultadas (top 10)
    - Distribución arcanos mayores vs menores
    - Ratio de cartas derechas vs invertidas
  - **OpenAI:**
    - Total de interpretaciones generadas
    - Tokens consumidos (total y promedio)
    - Costo acumulado estimado
    - Tiempo promedio de generación
    - Tasa de errores
    - Cache hit rate
  - **Preguntas:**
    - Preguntas predefinidas más usadas
    - Distribución de preguntas custom vs predefinidas
- [ ] Implementar endpoint `GET /admin/dashboard/charts` con datos para gráficos:
  - Registros de usuarios por día (últimos 30 días)
  - Lecturas por día (últimos 30 días)
  - Costos de OpenAI por día (últimos 30 días)
- [ ] Implementar caché de 15 minutos para estadísticas (datos no necesitan ser real-time)
- [ ] Optimizar queries usando agregaciones de base de datos (`COUNT`, `SUM`, `AVG`)
- [ ] Proteger endpoint con `@Roles('admin', 'moderator', 'superadmin')`
- [ ] Agregar índices en campos utilizados para agregaciones

#### 🎯 Criterios de aceptación

- ✓ El endpoint retorna todas las métricas clave de forma eficiente
- ✓ Las estadísticas son precisas y actualizadas
- ✓ La performance es buena incluso con mucha data

---

### **TASK-030: Implementar Audit Log (Registro de Auditoría)**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 3 días  
**Dependencias:** TASK-027

#### 📋 Descripción

Crear sistema de audit log que registre todas las acciones administrativas y cambios críticos en el sistema.

#### ✅ Tareas específicas

- [ ] Crear entidad `AuditLog` con campos:
  - `id`, `user_id` (FK, quien realizó la acción), `target_user_id` (FK nullable, sobre quién)
  - `action` (enum: `'user_created'`, `'user_banned'`, `'role_changed'`, `'plan_changed'`, `'reading_deleted'`, etc.)
  - `entity_type` (`'User'`, `'Reading'`, `'Card'`, etc.)
  - `entity_id` (ID de la entidad afectada)
  - `old_value` (jsonb, estado anterior)
  - `new_value` (jsonb, nuevo estado)
  - `ip_address`, `user_agent`
  - `created_at`
- [ ] Crear servicio `AuditLogService` con método `log(action, userId, details)`
- [ ] Implementar interceptor `AuditInterceptor` que capture automáticamente cambios en endpoints admin
- [ ] Registrar acciones críticas:
  - Cambios de rol de usuario
  - Cambios de plan
  - Baneos/desbaneos
  - Eliminación de lecturas
  - Modificación de cartas/spreads
  - Cambios en configuración del sistema
- [ ] Crear endpoint `GET /admin/audit-logs` con paginación y filtros:
  - Por usuario (quien hizo la acción)
  - Por tipo de acción
  - Por entidad afectada
  - Por rango de fechas
- [ ] Implementar índices en `user_id`, `action`, `entity_type`, `created_at`
- [ ] Crear tarea cron que archive logs antiguos (más de 90 días) a tabla separada

#### 🎯 Criterios de aceptación

- ✓ Todas las acciones administrativas se registran automáticamente
- ✓ El audit log es consultable y filtrable
- ✓ Los datos históricos se archivan apropiadamente

---

## � Epic 9: Módulo de Oráculo

> **Objetivo:** Implementar módulo de consultas al oráculo como alternativa simplificada al tarot, con diferentes métodos de consulta.

---

### **TASK-031: Diseñar e Implementar Entidades del Módulo Oráculo**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 2 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Crear las entidades y migraciones necesarias para el módulo de consultas al oráculo, diferenciándolo del sistema de lecturas de tarot.

#### ✅ Tareas específicas

- [ ] Crear entidad `OracleQuery` con campos:
  - `id`, `user_id` (FK), `category_id` (FK nullable a `ReadingCategory`)
  - `question` (text, requerido)
  - `answer` (text, generado por IA)
  - `oracle_method` (enum: `'pendulum'`, `'single_card'`, `'pure_ai'`, default: `'pure_ai'`)
  - `card_id` (FK nullable a `TarotCard`, si se usa `single_card`)
  - `is_card_reversed` (boolean, si aplica)
  - `ai_model_used`, `tokens_used`
  - `created_at`, `updated_at`
- [ ] Crear migración para la tabla con índices apropiados (`user_id`, `created_at`)
- [ ] Establecer relaciones con `User` y `ReadingCategory`
- [ ] Agregar constraint que valide: si `oracle_method = 'single_card'`, `card_id` debe estar presente
- [ ] Documentar diferencias conceptuales entre lectura de tarot y consulta de oráculo

#### 🎯 Criterios de aceptación

- ✓ La entidad está correctamente migrada con sus relaciones
- ✓ Los constraints de validación funcionan
- ✓ La estructura soporta diferentes métodos de oráculo

---

### **TASK-032: Implementar Servicio de Generación de Respuestas de Oráculo**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 3 días  
**Dependencias:** TASK-031, TASK-018

#### 📋 Descripción

Crear servicio que genere respuestas del oráculo usando OpenAI con prompts específicos, diferenciándolo de las interpretaciones de tarot.

#### ✅ Tareas específicas

- [ ] Crear módulo `OracleModule` con servicio `OracleService`
- [ ] Implementar método `generateOracleAnswer(query, method, cardId?)`:
  - **Para método `'pure_ai'`:** respuesta directa basada solo en la pregunta
  - **Para método `'single_card'`:** seleccionar carta aleatoria y basar respuesta en su significado
  - **Para método `'pendulum'`:** simular respuesta de péndulo con explicación
- [ ] Crear prompts específicos para oráculo (diferentes a tarot):
  - Tono más directo y conciso
  - Respuestas enfocadas en sí/no/tal vez con explicación
  - Estructura: Respuesta directa + Explicación (2 párrafos) + Consejo (1 párrafo)
- [ ] Configurar límite de tokens menor que tarot (max 400 tokens)
- [ ] Implementar selección aleatoria de carta si `method = 'single_card'`
- [ ] Integrar con sistema de logging de OpenAI (TASK-019)
- [ ] Validar que la pregunta tenga mínimo 10 caracteres
- [ ] Implementar fallback si OpenAI falla (respuesta genérica basada en carta si aplica)

#### 🎯 Criterios de aceptación

- ✓ El servicio genera respuestas coherentes del oráculo
- ✓ Los diferentes métodos funcionan correctamente
- ✓ Las respuestas tienen estructura y tono apropiados

---

### **TASK-033: Crear Endpoints del Módulo Oráculo**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 2 días  
**Dependencias:** TASK-032, TASK-012

#### 📋 Descripción

Implementar endpoints REST para consultas de oráculo con validaciones y límites de uso.

#### ✅ Tareas específicas

- [ ] Crear `OracleController` con endpoints:
  - `POST /oracle/query`: crear nueva consulta
  - `GET /oracle/queries`: listar consultas del usuario (paginado)
  - `GET /oracle/queries/:id`: obtener consulta específica
- [ ] Crear DTO `CreateOracleQueryDto` con validaciones:
  - `question` (string, required, min 10, max 500 caracteres)
  - `categoryId` (number, optional)
  - `method` (enum, optional, default `'pure_ai'`)
- [ ] Aplicar `@CheckUsageLimit('oracle_query')` al endpoint de creación
- [ ] Verificar que usuarios premium puedan hacer consultas ilimitadas
- [ ] Usuarios free: limitar a 3 consultas diarias (usar sistema de TASK-012)
- [ ] Implementar relación con categorías existentes (reutilizar de tarot)
- [ ] Retornar respuesta completa incluyendo carta usada si aplica
- [ ] Agregar endpoints de paginación y filtros similares a lecturas (TASK-024)
- [ ] Documentar endpoints con Swagger
- [ ] Implementar tests de integración

#### 🎯 Criterios de aceptación

- ✓ Los endpoints funcionan correctamente con validaciones
- ✓ Los límites de uso se respetan según el plan
- ✓ La documentación está completa

Epic 10: Módulo de Rituales y Amuletos---

## 🎨 Epic 10: Módulo de Rituales

> **Objetivo:** Implementar catálogo completo de rituales esotéricos con sistema de favoritos, búsqueda avanzada y recomendaciones personalizadas.

---

### **TASK-034: Diseñar e Implementar Entidades del Módulo Rituales**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 2 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Crear estructura completa de base de datos para gestión de rituales, amuletos y contenido esotérico.

#### ✅ Tareas específicas

- [ ] Crear entidad `Ritual` con campos:
  - `id`, `title`, `slug` (unique), `description` (text)
  - `category` (enum: `'love'`, `'money'`, `'protection'`, `'health'`, `'spiritual'`, `'cleansing'`)
  - `difficulty` (enum: `'beginner'`, `'intermediate'`, `'advanced'`)
  - `duration_minutes` (integer, tiempo estimado)
  - `best_time` (string, ej: "Luna llena", "Amanecer")
  - `steps` (jsonb array de objetos con `step_number` y `instruction`)
  - `materials` (jsonb array de strings)
  - `warnings` (text, precauciones importantes)
  - `image_url`, `is_active`
  - `view_count` (integer, contador de visualizaciones)
  - `created_at`, `updated_at`
- [ ] Crear entidad `UserFavoriteRitual` con campos:
  - `id`, `user_id` (FK), `ritual_id` (FK), `created_at`
  - Unique constraint en `(user_id, ritual_id)`
- [ ] Crear migración con índices:
  - Índice en `category` para filtros
  - Índice en `slug` para búsquedas
  - Índice en `is_active`
  - Índice compuesto en `(user_id, ritual_id)` para favoritos

#### 🎯 Criterios de aceptación

- ✓ Las entidades están correctamente migradas
- ✓ Las relaciones funcionan apropiadamente
- ✓ La estructura soporta contenido rico (pasos, materiales)

---

### **TASK-035: Crear Seeders de Rituales Iniciales**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 3 días  
**Dependencias:** TASK-034

#### 📋 Descripción

Crear seeder con al menos 20 rituales diversos y bien documentados para poblar la aplicación.

#### ✅ Tareas específicas

- [ ] Investigar y recopilar rituales tradicionales seguros y apropiados
- [ ] Crear seeder con mínimo 20 rituales distribuidos en categorías:
  - **Amor:** 5 rituales (atraer amor, fortalecer relación, etc.)
  - **Dinero:** 4 rituales (prosperidad, abundancia, etc.)
  - **Protección:** 4 rituales (protección personal, del hogar, etc.)
  - **Salud:** 3 rituales (bienestar, energía, etc.)
  - **Espiritual:** 2 rituales (meditación, conexión)
  - **Limpieza:** 2 rituales (limpieza energética, etc.)
- [ ] Cada ritual debe incluir:
  - Título atractivo y descriptivo
  - Descripción clara (2-3 párrafos)
  - Lista completa de materiales necesarios
  - Pasos detallados y numerados (mínimo 5 pasos)
  - Mejor momento para realizarlo
  - Warnings si aplica (ej: "No usar fuego cerca de materiales inflamables")
  - Nivel de dificultad apropiado
  - Duración estimada realista
- [ ] Generar slugs SEO-friendly automáticamente
- [ ] Incluir URLs placeholder para imágenes
- [ ] Marcar todos como `is_active: true`
- [ ] Implementar idempotencia en el seeder

#### 🎯 Criterios de aceptación

- ✓ Existen al menos 20 rituales después del seed
- ✓ Los rituales están bien distribuidos por categorías
- ✓ El contenido es de calidad y útil para usuarios

---

### **TASK-036: Implementar Módulo de Rituales con CRUD Completo**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 3 días  
**Dependencias:** TASK-034

#### 📋 Descripción

Crear módulo completo de rituales con endpoints públicos para usuarios y administrativos para gestión de contenido.

#### ✅ Tareas específicas

- [ ] Crear `RitualsModule` con controlador, servicio y repositorio
- [ ] Endpoints públicos:
  - `GET /rituals`: listar rituales con paginación, filtros y búsqueda
    - **Filtros:** `category`, `difficulty`, `duration` (min-max)
    - **Search:** por título, descripción, materiales
    - **Sort:** por `view_count`, `created_at`, `title`
  - `GET /rituals/:slug`: obtener ritual específico por slug
    - Incrementar `view_count` automáticamente
    - Incluir campo `is_favorite` si usuario está autenticado
  - `GET /rituals/category/:category`: listar por categoría específica
- [ ] Endpoints de favoritos (requieren auth):
  - `POST /rituals/:id/favorite`: agregar ritual a favoritos
  - `DELETE /rituals/:id/favorite`: remover de favoritos
  - `GET /rituals/my-favorites`: listar favoritos del usuario
- [ ] Endpoints administrativos:
  - `POST /admin/rituals`: crear nuevo ritual (solo admin)
  - `PATCH /admin/rituals/:id`: actualizar ritual
  - `DELETE /admin/rituals/:id`: soft delete (marcar `is_active = false`)
- [ ] Crear DTOs con validaciones:
  - `CreateRitualDto`: todos los campos requeridos con validación de formato
  - `UpdateRitualDto`: campos opcionales
  - Validar que `steps` sea array con mínimo 3 pasos
  - Validar que `materials` sea array con mínimo 1 elemento
- [ ] Implementar búsqueda full-text usando operadores `ILIKE` de PostgreSQL
- [ ] Implementar caché de 1 hora para listados públicos
- [ ] Proteger endpoints admin con `@Roles('admin', 'moderator')`
- [ ] Documentar todos los endpoints con Swagger

#### 🎯 Criterios de aceptación

- ✓ Los endpoints públicos funcionan sin autenticación
- ✓ Los usuarios pueden gestionar sus favoritos
- ✓ Los admins pueden crear y editar rituales
- ✓ La búsqueda y filtros funcionan correctamente

---

### **TASK-037: Implementar Sistema de Recomendación de Rituales**

**Prioridad:** 🟢 BAJA  
**Estimación:** 3 días  
**Dependencias:** TASK-036

#### 📋 Descripción

Crear sistema básico de recomendación que sugiera rituales basados en las lecturas previas del usuario.

#### ✅ Tareas específicas

- [ ] Crear endpoint `GET /rituals/recommended` (requiere auth)
- [ ] Analizar últimas 5 lecturas del usuario para identificar temas recurrentes:
  - Mapear categorías de lecturas a categorías de rituales
  - Identificar cartas frecuentes y sus significados
  - Ejemplo: si usuario tiene muchas consultas de "amor", recomendar rituales de amor
- [ ] Implementar scoring simple:
  - Rituals de la categoría más consultada: +10 puntos
  - Rituals con dificultad `'beginner'` para usuarios nuevos: +5 puntos
  - Rituals populares (alto `view_count`): +3 puntos
  - Rituals no vistos por el usuario: +2 puntos
- [ ] Retornar top 5 rituales recomendados ordenados por score
- [ ] Incluir campo `recommendation_reason` explicando por qué se recomienda
- [ ] Implementar caché de 24 horas por usuario para recomendaciones
- [ ] Si usuario no tiene lecturas, recomendar rituales para principiantes más populares
- [ ] Documentar algoritmo de recomendación para futuras mejoras

#### 🎯 Criterios de aceptación

- ✓ El sistema genera recomendaciones coherentes
- ✓ Las recomendaciones se basan en actividad del usuario
- ✓ Existe fallback para usuarios nuevos

---

## 🎨 Epic 11: Módulo de Servicios Pagos

> **Objetivo:** Implementar sistema de solicitudes de servicios personalizados con gestión de estados, notificaciones y flujo completo admin-cliente.

---

### **TASK-038: Diseñar e Implementar Entidades de Solicitudes de Servicio**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 2 días  
**Dependencias:** TASK-002

#### 📋 Descripción

Crear estructura de base de datos para gestionar solicitudes de servicios personales pagos (limpiezas energéticas, péndulo hebreo, etc.).

#### ✅ Tareas específicas

- [ ] Crear entidad `ServiceRequest` con campos:
  - `id`, `user_id` (FK nullable, puede ser anónimo)
  - `service_type` (enum: `'energy_cleaning'`, `'hebrew_pendulum'`, `'personal_reading'`, `'other'`)
  - `contact_name`, `contact_email`, `contact_phone`
  - `message` (text, detalles de la solicitud)
  - `preferred_date` (date, nullable)
  - `preferred_time` (string, nullable, ej: "Mañana", "Tarde")
  - `status` (enum: `'pending'`, `'contacted'`, `'confirmed'`, `'completed'`, `'cancelled'`)
  - `admin_notes` (text, notas internas)
  - `price_quoted` (decimal, nullable)
  - `payment_status` (enum: `'pending'`, `'paid'`, `'refunded'`, nullable)
  - `created_at`, `updated_at`, `contacted_at`, `completed_at`
- [ ] Crear entidad `ServiceType` (opcional, para gestionar servicios dinámicamente):
  - `id`, `name`, `slug`, `description`, `base_price`, `duration_minutes`
  - `is_active`, `requires_in_person` (boolean)
- [ ] Crear migración con índices en `status`, `created_at`, `service_type`
- [ ] Agregar constraint de email válido
- [ ] Documentar workflow de estados (pending → contacted → confirmed → completed)

#### 🎯 Criterios de aceptación

- ✓ Las entidades están correctamente migradas
- ✓ La estructura soporta el flujo completo de solicitud-confirmación
- ✓ Los estados están bien definidos

---

### **TASK-039: Implementar Endpoints de Solicitudes de Servicio**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 3 días  
**Dependencias:** TASK-038

#### 📋 Descripción

Crear endpoints para que usuarios soliciten servicios y admins gestionen las solicitudes.

#### ✅ Tareas específicas

- [ ] Crear `ServiceRequestsModule` con controlador y servicio
- [ ] Endpoints públicos:
  - `POST /service-requests`: crear nueva solicitud (no requiere auth)
    - Si usuario está autenticado, vincular con `user_id`
    - Si no, crear como anónimo pero requerir email de contacto
  - `GET /service-requests/:id/status`: consultar estado por ID (enviar por email)
- [ ] Endpoints de usuario autenticado:
  - `GET /my-service-requests`: listar solicitudes propias
  - `PATCH /service-requests/:id/cancel`: cancelar solicitud propia
- [ ] Endpoints administrativos:
  - `GET /admin/service-requests`: listar todas con filtros:
    - Por `status`, `service_type`, fecha
    - Ordenar por `created_at`, `status`
  - `GET /admin/service-requests/:id`: ver detalles completos
  - `PATCH /admin/service-requests/:id/status`: cambiar estado
  - `PATCH /admin/service-requests/:id/notes`: agregar notas internas
  - `PATCH /admin/service-requests/:id/quote`: agregar cotización
- [ ] Crear DTOs con validaciones:
  - `CreateServiceRequestDto`: validar email, teléfono, message mínimo 20 caracteres
  - `UpdateServiceRequestStatusDto`: validar transiciones de estado válidas
- [ ] Implementar validación de transiciones de estado:
  - `pending → contacted → confirmed → completed` (flujo normal)
  - Cualquier estado → `cancelled` (permitir cancelación)
  - No permitir retrocesos (ej: `completed → pending`)
- [ ] Implementar rate limiting: máximo 3 solicitudes por hora por IP
- [ ] Proteger endpoints admin con `@Roles('admin', 'moderator')`
- [ ] Documentar con Swagger

#### 🎯 Criterios de aceptación

- ✓ Los usuarios pueden enviar solicitudes fácilmente
- ✓ Los admins pueden gestionar solicitudes eficientemente
- ✓ Las transiciones de estado son lógicas y validadas

---

### **TASK-040: Implementar Sistema de Notificaciones por Email (Preparación)**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 4 días  
**Dependencias:** TASK-039

#### 📋 Descripción

Preparar infraestructura de emails transaccionales usando servicio externo (Resend/SendGrid) para notificaciones de solicitudes de servicio.

#### ✅ Tareas específicas

- [ ] Investigar y seleccionar proveedor de email (recomendado: Resend por simplicidad)
- [ ] Instalar dependencia correspondiente (ej: `npm install resend`)
- [ ] Agregar variables de entorno:
  - `EMAIL_PROVIDER` (resend/sendgrid)
  - `EMAIL_API_KEY`
  - `EMAIL_FROM_ADDRESS` (ej: noreply@tarotapp.com)
  - `EMAIL_FROM_NAME` (ej: "Tarot Flavia")
- [ ] Crear módulo `EmailModule` con servicio `EmailService`
- [ ] Implementar métodos base:
  - `sendEmail(to, subject, html, text?)`
  - `sendTemplateEmail(to, template, variables)`
- [ ] Crear templates HTML para emails transaccionales:
  - `service-request-confirmation.html`: confirmación al usuario
  - `service-request-admin-notification.html`: notificación a admin
  - `service-request-status-update.html`: cambio de estado
- [ ] Implementar sistema de plantillas usando handlebars o similar
- [ ] Crear cola de emails con retry logic (usar Bull/BullMQ opcional):
  - Si el envío falla, reintentar 3 veces con delay exponencial
  - Loggear todos los envíos exitosos y fallidos
- [ ] Implementar endpoint de prueba `POST /admin/email/test` para verificar configuración
- [ ] Crear tabla `email_logs` para trackear envíos:
  - `id`, `recipient`, `subject`, `status`, `provider_response`, `attempts`, `sent_at`
- [ ] Manejar errores gracefully: si email falla, no bloquear el flujo principal
- [ ] Documentar proceso de configuración de API key

#### 🎯 Criterios de aceptación

- ✓ El servicio de email está configurado y funcional
- ✓ Los templates son atractivos y profesionales
- ✓ Los errores de envío no afectan la funcionalidad principal

---

### **TASK-041: Integrar Notificaciones Email con Flujo de Solicitudes**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 2 días  
**Dependencias:** TASK-040

#### 📋 Descripción

Integrar sistema de emails con el flujo de solicitudes de servicio para notificar automáticamente.

#### ✅ Tareas específicas

- [ ] Implementar evento `ServiceRequestCreated`:
  - Enviar email de confirmación al usuario con detalles de su solicitud
  - Incluir número de referencia único
  - Enviar email de notificación al admin con detalles completos
- [ ] Implementar evento `ServiceRequestStatusChanged`:
  - Notificar al usuario cuando status cambia a `'contacted'`, `'confirmed'`, `'completed'`
  - Incluir notas relevantes del admin si aplica
  - Para `'completed'`: agradecer y solicitar feedback (link futuro)
- [ ] Configurar emails para cada tipo de servicio con información específica
- [ ] Incluir en emails de confirmación:
  - Qué esperar a continuación
  - Tiempo estimado de respuesta (ej: "Te contactaremos en 24-48 horas")
  - Link para consultar estado de solicitud
- [ ] Personalizar emails con nombre del usuario si está disponible
- [ ] Implementar flag `email_notifications_enabled` en `User` para opt-out
- [ ] Agregar unsubscribe link en footer de todos los emails
- [ ] Loggear todos los intentos de envío en audit log
- [ ] Crear configuración para habilitar/deshabilitar emails en desarrollo

#### 🎯 Criterios de aceptación

- ✓ Los usuarios reciben confirmación inmediata de su solicitud
- ✓ Los admins son notificados de nuevas solicitudes
- ✓ Los cambios de estado se comunican apropiadamente

---

## 🎨 Epic 12: Optimización y Performance

> **Objetivo:** Optimizar queries, configurar índices estratégicos, implementar pooling y caché para soportar alta concurrencia y mejorar tiempos de respuesta.

---

### **TASK-042: Implementar Índices de Base de Datos Adicionales**

**Prioridad:** 🟡 ALTA  
**Estimación:** 2 días  
**Dependencias:** Todas las entidades creadas

#### 📋 Descripción

Analizar queries frecuentes y agregar índices estratégicos para optimizar performance de la base de datos.

#### ✅ Tareas específicas

- [ ] Analizar slow query log de PostgreSQL para identificar queries problemáticas
- [ ] Crear migración de índices adicionales:
  - **Índices simples:**
    - `users(email)` (si no existe)
    - `users(plan, is_verified)`
    - `tarot_readings(shared_token)` (unique)
    - `tarot_cards(arcana, suit)`
    - `rituals(category, is_active)`
    - `service_requests(status, created_at)`
  - **Índices compuestos:**
    - `tarot_readings(user_id, created_at DESC)`
    - `usage_limits(user_id, feature, date)` (unique)
    - `oracle_queries(user_id, created_at DESC)`
    - `user_favorite_rituals(user_id, ritual_id)` (unique)
    - `cached_interpretations(cache_key)` (unique)
  - **Índices parciales** para queries específicos:
    - `tarot_readings WHERE deleted_at IS NULL`
    - `service_requests WHERE status = 'pending'`
  - **Índices GIN** para búsqueda full-text:
    - `rituals` en campos `title` y `description`
    - `tarot_cards` en `keywords` (si es array)
- [ ] Documentar el propósito de cada índice agregado
- [ ] Ejecutar `EXPLAIN ANALYZE` en queries críticos antes y después
- [ ] Medir mejora de performance en queries frecuentes

#### 🎯 Criterios de aceptación

- ✓ Los queries críticos muestran mejora medible en performance
- ✓ Los índices no impactan negativamente en operaciones de escritura
- ✓ Existe documentación de índices y su propósito

---

### **TASK-043: Implementar Connection Pooling Optimizado**

**Prioridad:** 🟡 ALTA  
**Estimación:** 1 día  
**Dependencias:** TASK-002

#### 📋 Descripción

Optimizar configuración de connection pooling de TypeORM para manejar carga concurrente eficientemente.

#### ✅ Tareas específicas

- [ ] Agregar configuración explícita de pool en TypeORM:
  - `poolSize`: 10 (para desarrollo), 25-50 (para producción)
  - `maxQueryExecutionTime`: 5000ms (loggear queries lentas)
  - `connectionTimeoutMillis`: 30000
- [ ] Agregar variables de entorno para configuración dinámica:
  - `DB_POOL_SIZE`
  - `DB_MAX_QUERY_TIME`
  - `DB_CONNECTION_TIMEOUT`
- [ ] Implementar health check de conexiones:
  - Endpoint `/health/database` que verifique pool status
  - Retornar métricas: conexiones activas, idle, waiting
- [ ] Configurar estrategia de retry para conexiones fallidas:
  - 3 intentos de reconexión con delay exponencial
  - Alert si las reconexiones fallan consistentemente
- [ ] Implementar logging de uso del pool para monitoreo:
  - Advertir si el pool se acerca a capacidad máxima
  - Sugerir aumento de pool size si es necesario
- [ ] Documentar configuración recomendada según carga esperada
- [ ] Crear tests de carga para validar comportamiento bajo concurrencia

#### 🎯 Criterios de aceptación

- ✓ El pool maneja conexiones concurrentes eficientemente
- ✓ No hay timeout errors bajo carga normal
- ✓ Las métricas de pool son monitoreables

---

### **TASK-044: Implementar Caché Global con Redis (Opcional)**

**Prioridad:** 🟢 BAJA  
**Estimación:** 4 días  
**Dependencias:** TASK-020

#### 📋 Descripción

**⚠️ NO NECESARIO PARA MVP** - Migrar sistema de caché de in-memory a Redis para soportar múltiples instancias del backend y mejorar persistencia. Solo implementar cuando:

- Necesites escalar horizontalmente (2+ instancias del backend)
- Tengas >5,000 usuarios concurrentes
- El caché in-memory consuma demasiada RAM

**Para MVP:** Usar caché in-memory de `@nestjs/cache-manager` (TASK-020) es suficiente y no genera costos extra.

#### 💰 Costos de Redis en producción

| Proveedor       | Plan    | Costo/mes | RAM                      |
| --------------- | ------- | --------- | ------------------------ |
| **Upstash**     | Free    | $0        | 256MB + 10K requests/día |
| **Redis Cloud** | Free    | $0        | 30MB                     |
| **Railway**     | Starter | $5-10     | 256MB-1GB                |
| **Render**      | Starter | $7        | 256MB                    |

**Recomendación:** Empezar con tier gratuito de Upstash o Redis Cloud si decides implementar.

#### ✅ Tareas específicas

- [ ] **Evaluar si realmente necesitas Redis:**
  - ¿Tienes >2 instancias del backend?
  - ¿El caché in-memory está causando problemas de RAM?
  - ¿Necesitas compartir caché entre servidores?
  - Si la respuesta es NO a todas, **NO implementes esto aún**
- [ ] Instalar dependencias: `npm install @nestjs/cache-manager cache-manager-redis-store redis`
- [ ] Agregar variables de entorno:
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_PASSWORD` (opcional)
  - `REDIS_DB` (default: 0)
  - `CACHE_STORE` (enum: 'memory' | 'redis') - para poder cambiar fácilmente
- [ ] Configurar `CacheModule` con Redis store condicional:

  ```typescript
  CacheModule.registerAsync({
    useFactory: (configService: ConfigService) => {
      const store = configService.get('CACHE_STORE');

      if (store === 'redis') {
        return {
          store: redisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          ttl: 3600,
        };
      }

      // Fallback a in-memory
      return { ttl: 3600, max: 200 };
    },
  });
  ```

- [ ] Migrar caché de interpretaciones a Redis (TASK-020)
- [ ] Implementar caché para:
  - Lista de cartas (TTL: 24 horas, raramente cambia)
  - Lista de spreads (TTL: 24 horas)
  - Lista de categorías (TTL: 24 horas)
  - Rituales populares (TTL: 1 hora)
  - Dashboard stats (TTL: 15 minutos)
- [ ] Implementar cache warming al iniciar la aplicación:
  - Pre-cargar datos estáticos frecuentemente accedidos
- [ ] Crear servicio wrapper `CacheService` para abstraer Redis:
  - Métodos: `get`, `set`, `delete`, `clear`, `getOrSet`
  - **IMPORTANTE:** Implementar fallback a DB si Redis falla (no romper la app)
- [ ] Implementar cache invalidation strategy:
  - Invalidar cache cuando se actualiza contenido
  - Usar tags/patterns para invalidación masiva
- [ ] Crear endpoint admin `/admin/cache/clear` para limpiar cache manualmente
- [ ] Implementar health check de Redis en `/health/redis`
- [ ] Documentar keys de caché y sus TTLs
- [ ] **Configurar alertas** si Redis falla (email a admin)

#### 🎯 Criterios de aceptación

- ✓ El sistema funciona con `CACHE_STORE=memory` (fallback)
- ✓ El sistema funciona con `CACHE_STORE=redis` cuando está configurado
- ✓ Redis está configurado y funcional
- ✓ El caché mejora significativamente la performance
- ✓ **CRÍTICO:** El sistema funciona incluso si Redis falla (degraded mode, vuelve a in-memory)
- ✓ Está documentado el costo mensual de Redis en producción

---

#### 📝 Nota de Implementación

**Para MVP (0-5000 usuarios):**

```bash
# .env
CACHE_STORE=memory  # Sin Redis, gratis
```

**Para Producción escalada (>5000 usuarios, múltiples instancias):**

```bash
# .env
CACHE_STORE=redis
REDIS_HOST=your-redis-url.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

**Stack de costos recomendado:**

- Sin Redis: Frontend ($0) + Backend ($10) + DB ($10) = **$20/mes**
- Con Redis: Frontend ($0) + Backend ($10) + DB ($10) + Redis ($0-7) = **$20-27/mes**

---

### **TASK-045: Implementar Lazy Loading y Eager Loading Estratégico**

**Prioridad:** 🟡 ALTA  
**Estimación:** 2 días  
**Dependencias:** Ninguna

#### 📋 Descripción

Optimizar carga de relaciones en TypeORM para evitar N+1 queries y mejorar performance de endpoints.

#### ✅ Tareas específicas

- [ ] Auditar todos los endpoints que cargan entidades con relaciones
- [ ] Identificar casos de N+1 query problem:
  - Usar logging de queries de TypeORM en desarrollo
  - Detectar múltiples queries individuales para relaciones
- [ ] Implementar eager loading donde sea apropiado:
  - `tarot_readings` → eager load `reading_cards.card`
  - `service_requests` → eager load `user` (si existe)
  - `oracle_queries` → eager load `card` (si existe)
- [ ] Configurar `@ManyToOne` y `@OneToMany` con `eager: true/false` explícitamente
- [ ] Usar QueryBuilder con `leftJoinAndSelect` para queries específicos:
  - Ejemplo: cargar lecturas con sus cartas e interpretaciones en una query
- [ ] Implementar DTO projection para endpoints que no necesitan relaciones completas:
  - Seleccionar solo campos necesarios con `.select()`
  - Reducir payload de respuestas
- [ ] Implementar paginación con `take` y `skip` en lugar de cargar todo y filtrar
- [ ] Agregar `@Transform()` en DTOs para lazy-load relaciones bajo demanda si es necesario
- [ ] Documentar estrategia de carga para cada entidad
- [ ] Medir reducción de queries con `EXPLAIN ANALYZE`

#### 🎯 Criterios de aceptación

- ✓ No existen problemas de N+1 queries en endpoints críticos
- ✓ Los payloads de respuesta son optimizados
- ✓ La performance de listados mejora significativamente

---

### **TASK-046: Implementar Compresión de Respuestas HTTP**

**Prioridad:** 🟢 MEDIA  
**Estimación:** 0.5 días  
**Dependencias:** Ninguna

#### 📋 Descripción

Configurar compresión gzip/brotli en respuestas HTTP para reducir bandwidth y mejorar tiempos de carga.

#### ✅ Tareas específicas

- [ ] Instalar middleware de compresión: `npm install compression`
- [ ] Configurar en `main.ts`:
  - Habilitar compression middleware
  - Configurar threshold mínimo: 1kb (no comprimir respuestas muy pequeñas)
  - Configurar nivel de compresión: 6 (balance entre CPU y tamaño)
- [ ] Configurar tipos MIME a comprimir:
  - `application/json`
  - `text/html`, `text/css`, `text/javascript`
  - `application/javascript`
- [ ] Excluir de compresión:
  - Imágenes (ya están comprimidas)
  - Videos
  - Archivos ya comprimidos
- [ ] Agregar header `Vary: Accept-Encoding` para caché correcto
- [ ] Implementar feature flag para habilitar/deshabilitar en diferentes entornos
- [ ] Medir reducción de tamaño de payload en endpoints grandes:
  - Listados de lecturas con muchos items
  - Dashboard con estadísticas
- [ ] Documentar configuración y beneficios esperados

#### 🎯 Criterios de aceptación

- ✓ Las respuestas JSON grandes se comprimen correctamente
- ✓ El tamaño de payload se reduce significativamente
- ✓ No hay impacto negativo en performance del servidor

---

## 🎨 Epic 13: Seguridad Avanzada

> **Objetivo:** Implementar medidas de seguridad avanzadas incluyendo headers HTTP seguros, validación exhaustiva, logging de seguridad y control de IPs.

---

### **TASK-047: Implementar Helmet para Headers de Seguridad**

**Prioridad:** 🟡 ALTA  
**Estimación:** 1 día  
**Dependencias:** Ninguna

#### 📋 Descripción

Configurar Helmet middleware para establecer headers HTTP de seguridad que protejan contra ataques comunes.

#### ✅ Tareas específicas

- [ ] Instalar helmet: `npm install helmet`
- [ ] Configurar en `main.ts` con opciones apropiadas:
  - **Content Security Policy (CSP):** configurar para permitir recursos necesarios
  - **X-Frame-Options:** DENY (prevenir clickjacking)
  - **X-Content-Type-Options:** nosniff
  - **Strict-Transport-Security:** max-age=31536000
  - **X-XSS-Protection:** 1; mode=block
  - **Referrer-Policy:** strict-origin-when-cross-origin
- [ ] Configurar CSP específicamente para permitir:
  - API calls al mismo dominio
  - Recursos de CDN si se usan
  - OpenAI API
- [ ] Deshabilitar headers que puedan causar problemas:
  - Ajustar según necesidades de frontend
- [ ] Implementar configuración diferente para development vs production
- [ ] Agregar variables de entorno para configuración dinámica si es necesario
- [ ] Documentar cada header configurado y su propósito
- [ ] Testear que no se rompan funcionalidades existentes

#### 🎯 Criterios de aceptación

- ✓ Los headers de seguridad están correctamente configurados
- ✓ La aplicación pasa security audits básicos
- ✓ No hay impacto negativo en funcionalidad

---

### **TASK-048: Implementar Validación y Sanitización de Inputs**

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 3 días  
**Dependencias:** Ninguna

#### 📋 Descripción

Auditar y reforzar validación/sanitización de todos los inputs de usuario para prevenir inyecciones y XSS.

#### ✅ Tareas específicas

- [ ] Auditar todos los DTOs existentes y agregar validaciones faltantes:
  - Usar decoradores de class-validator extensivamente
  - `@IsString()`, `@IsEmail()`, `@IsInt()`, `@Min()`, `@Max()`, etc.
  - `@Length(min, max)` para strings
  - `@Matches(regex)` para formatos específicos
- [ ] Implementar sanitización de inputs HTML:
  - Instalar: `npm install class-sanitizer`
  - Aplicar `@Trim()` a todos los string inputs
  - Para campos de texto libre, sanitizar HTML peligroso
  - Permitir solo tags seguros si se acepta HTML (usar whitelist)
- [ ] Implementar validación de URLs en campos `image_url`:
  - Verificar que sean URLs válidas
  - Preferiblemente HTTPS
  - De dominios confiables si es posible
- [ ] Validar profundidad de objetos JSON anidados (prevenir DoS):
  - Limitar profundidad en campos jsonb como `steps` y `positions`
- [ ] Implementar rate limiting específico para endpoints de input pesado:
  - Formularios de servicios pagos
  - Creación de lecturas
- [ ] Crear pipe global de validación con whitelist:
  - `whitelist: true` (remover propiedades no definidas en DTO)
  - `forbidNonWhitelisted: true` (rechazar si hay props extras)
  - `transform: true` (auto-transformar tipos)
- [ ] Implementar validación de tamaño de archivos si se agregan uploads:
  - Max 5MB por archivo
  - Validar tipos MIME
- [ ] Documentar reglas de validación por entidad
- [ ] Crear tests que intenten inyecciones SQL, XSS, etc.

#### 🎯 Criterios de aceptación

- ✓ Todos los inputs están validados y sanitizados
- ✓ No es posible inyectar código malicioso
- ✓ Los errores de validación son claros y útiles

---

### **TASK-049: Implementar Logging y Monitoreo de Seguridad**

**Prioridad:** 🟡 ALTA  
**Estimación:** 3 días  
**Dependencias:** TASK-030

#### 📋 Descripción

Crear sistema de logging enfocado en eventos de seguridad y comportamiento sospechoso.

#### ✅ Tareas específicas

- [ ] Configurar Winston logger con múltiples transports:
  - Console (para desarrollo)
  - File (`security.log` para producción)
  - Opcional: External service (Datadog, Logtail, etc.)
- [ ] Implementar logging de eventos de seguridad:
  - Failed login attempts (especialmente múltiples del mismo IP)
  - Account lockouts (si se implementa)
  - Password changes
  - Role/permission changes
  - Access to admin endpoints
  - Rate limit violations
  - Suspicious patterns (ej: muchos requests de diferentes IPs con mismo user-agent)
- [ ] Crear servicio `SecurityEventService`:
  - Método `logSecurityEvent(type, userId, details, severity)`
  - Severities: `'low'`, `'medium'`, `'high'`, `'critical'`
- [ ] Implementar detección de comportamiento sospechoso:
  - Múltiples intentos de login fallidos: incrementar delay, eventual lockout temporal
  - Requests desde IPs de países inesperados (opcional, puede ser problemático)
  - Cambios rápidos de configuración de cuenta
- [ ] Crear tabla `security_events` para almacenar eventos:
  - `id`, `event_type`, `user_id`, `ip_address`, `user_agent`, `severity`, `details` (jsonb), `created_at`
- [ ] Implementar alertas automáticas para eventos críticos:
  - Enviar email a admin cuando `severity = 'critical'`
  - Múltiples failed logins del mismo usuario
- [ ] Crear endpoint admin `/admin/security/events` para revisar logs
- [ ] Implementar filtros por:
  - Event type, severity, user, date range
- [ ] Agregar índices en `security_events(created_at, severity, event_type)`
- [ ] Implementar retención de logs: archivar eventos mayores a 90 días

#### 🎯 Criterios de aceptación

- ✓ Los eventos de seguridad se loggean consistentemente
- ✓ Los admins pueden revisar security logs fácilmente
- ✓ Se generan alertas para eventos críticos

---

### **TASK-050: Implementar IP Whitelisting/Blacklisting**

**Prioridad:** 🟢 BAJA  
**Estimación:** 2 días  
**Dependencias:** TASK-049

#### 📋 Descripción

Crear sistema de gestión de IPs para bloquear IPs maliciosas y permitir IPs confiables.

#### ✅ Tareas específicas

- [ ] Crear entidad `IPRestriction` con campos:
  - `id`, `ip_address` (CIDR notation support: 192.168.1.0/24)
  - `type` (enum: `'whitelist'`, `'blacklist'`)
  - `reason` (text)
  - `created_by` (FK a User, admin que lo creó)
  - `expires_at` (nullable, para bloqueos temporales)
  - `is_active`, `created_at`, `updated_at`
- [ ] Implementar guard `IPRestrictionGuard`:
  - Extraer IP real del request (considerar proxies con `X-Forwarded-For`)
  - Verificar si IP está en blacklist
  - Si está blacklisted y activa, retornar 403 Forbidden
  - Opcional: verificar whitelist para endpoints super sensibles
- [ ] Crear endpoints admin para gestión:
  - `GET /admin/ip-restrictions`: listar con filtros
  - `POST /admin/ip-restrictions`: agregar IP a black/whitelist
  - `DELETE /admin/ip-restrictions/:id`: remover restricción
- [ ] Implementar auto-blacklist temporal:
  - Después de X intentos de login fallidos desde misma IP: blacklist 1 hora
  - Después de Y rate limit violations: blacklist 15 minutos
- [ ] Aplicar guard globalmente o en endpoints críticos según configuración
- [ ] Implementar tarea cron que limpie restricciones expiradas
- [ ] Agregar soporte para ranges de IP (CIDR notation)
- [ ] Loggear todas las restricciones aplicadas
- [ ] Crear documentación para admins sobre uso del sistema

#### 🎯 Criterios de aceptación

- ✓ Las IPs blacklisted son bloqueadas efectivamente
- ✓ Los admins pueden gestionar restricciones fácilmente
- ✓ El auto-blacklist funciona para comportamiento abusivo

---

## 🎯 FASE 3: MEJORAS Y ESCALABILIDAD

## 🎨 Epic 14: Mejoras de Monitoreo y Observabilidad

> **Objetivo:** Implementar health checks completos y sistema de monitoreo para garantizar observabilidad total del sistema en producción.

---

### **TASK-051: Implementar Health Checks Completos**

**Prioridad:** 🟡 ALTA  
**Estimación:** 2 días  
**Dependencias:** TASK-003, TASK-043

#### 📋 Descripción

Crear sistema robusto de health checks que verifique todos los componentes críticos del sistema.

#### ✅ Tareas específicas

- [ ] Instalar `@nestjs/terminus`: `npm install @nestjs/terminus`
- [ ] Crear módulo `HealthModule` con controller `/health`
- [ ] Implementar health checks para cada componente:
  - **Database:** verificar conectividad y query simple
  - **OpenAI:** verificar API key válida y conectividad
  - **Redis:** (si se implementa) verificar conexión
  - **Disk space:** verificar espacio disponible
  - **Memory:** verificar uso de memoria
- [ ] Crear endpoints específicos:
  - `GET /health`: health check general (liveness probe)
  - `GET /health/ready`: readiness check (todos los servicios listos)
  - `GET /health/live`: liveness check (app está viva)
  - `GET /health/details`: detalles de todos los componentes (solo admin)
- [ ] Configurar tiempos apropiados para cada check:
  - Database: timeout 5s
  - OpenAI: timeout 10s
  - Otros: timeout 3s
- [ ] Implementar respuestas estándar JSON con status de cada componente
- [ ] Documentar health checks para equipos de DevOps/SRE

#### 🎯 Criterios de aceptación

- ✓ Los health checks funcionan correctamente
- ✓ Los endpoints son compatibles con Kubernetes probes
- ✓ Los componentes fallidos son identificables

---

## 📝 Notas Finales

> **Nota del autor:** El backlog termina aquí. Las tareas están organizadas en 14 épicas distribuidas en 3 fases: MVP (Fase 1), Funcionalidades Adicionales (Fase 2) y Mejoras y Escalabilidad (Fase 3). Este documento está pensado para ser un roadmap completo del proyecto TarotFlavia backend.
