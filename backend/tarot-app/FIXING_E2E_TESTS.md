# 🔧 Plan de Corrección de Tests E2E - TASK-023-a

## Estado Actual

- ✅ 4 suites pasando: `email`, `rate-limiting`, `ai-health`, `app`
- ❌ 4 suites fallando: `predefined-questions`, `readings-hybrid`, `password-recovery`, `mvp-complete`

## Cambios Completados Previos

- ✅ Base de datos de producción migrada de `tarotflavia_db` → `tarot_db`
- ✅ Base de datos E2E configurada: `tarot_e2e` en puerto 5436
- ✅ GlobalSetup ejecuta seeders correctamente (categories, decks, cards, spreads, questions, users)
- ✅ GlobalTeardown NO limpia datos (mantiene seeders para reutilización)
- ✅ Tests unitarios: 487 pasando

---

## 📋 TAREAS DE CORRECCIÓN (Ejecutar en orden)

### ✅ TAREA 0: Preparación

**Status:** COMPLETADO

- [x] Backup de `tarotflavia_db`
- [x] Crear `tarot_db` y restaurar backup
- [x] Actualizar `.env` para usar `tarot_db`
- [x] Eliminar `tarotflavia_db`
- [x] Configurar variables E2E en `.env`

---

### 🔴 TAREA 1: Corregir `predefined-questions.e2e-spec.ts`

**Status:** PENDIENTE

**Problema Identificado:**

- El test hace seeding duplicado (ya se hizo en globalSetup)
- El `afterEach` borra TODAS las preguntas, afectando otros tests
- No usa los datos seeded del globalSetup

**Plan de Corrección:**

1. ✅ Eliminar llamadas a seeders en `beforeAll` (ya hecho)
2. ✅ Eliminar/comentar `afterEach` que borra preguntas (ya hecho)
3. ⏳ Modificar tests para NO crear preguntas en cada test
4. ⏳ Usar las preguntas seeded para tests de lectura
5. ⏳ Solo crear preguntas temporales cuando se prueba CREATE/UPDATE/DELETE
6. ⏳ Limpiar SOLO las preguntas creadas por el test (no las seeded)

**Tests Específicos a Corregir:**

- `should return all active questions` → Usar preguntas seeded
- `should filter questions by categoryId` → Usar preguntas seeded
- `should return a question by id` → Usar pregunta seeded
- `should create a new question when admin` → OK (crea nueva)
- `should update a question when admin` → Crear temporal, actualizar, eliminar
- `should soft delete a question when admin` → Crear temporal, eliminar

**Criterio de Éxito:**

- [ ] Suite `predefined-questions` pasa completamente
- [ ] No afecta a otros tests (email, rate-limiting, ai-health, app siguen pasando)
- [ ] Lint: sin errores
- [ ] Format: sin cambios
- [ ] Build: exitoso
- [ ] Tests unitarios: 487 pasando
- [ ] Tests E2E: 5 suites pasando (las 4 anteriores + esta)

---

### 🔴 TAREA 2: Corregir `readings-hybrid.e2e-spec.ts`

**Status:** PENDIENTE

**Problema Identificado:**

- Crea usuarios nuevos con timestamps en lugar de usar los seeded
- Hace seeding duplicado de datos
- Problemas de autenticación con usuarios creados dinámicamente

**Plan de Corrección:**

1. ✅ Eliminar seeding duplicado en `beforeAll` (ya hecho)
2. ⏳ Usar usuarios seeded (`free@test.com`, `premium@test.com`) en lugar de crear nuevos
3. ⏳ Obtener tokens de autenticación mediante login de usuarios seeded
4. ⏳ Simplificar el flujo del test para usar datos existentes

**Criterio de Éxito:**

- [ ] Suite `readings-hybrid` pasa completamente
- [ ] No afecta a otros tests
- [ ] Lint: sin errores
- [ ] Format: sin cambios
- [ ] Build: exitoso
- [ ] Tests unitarios: 487 pasando
- [ ] Tests E2E: 6 suites pasando

---

### 🔴 TAREA 3: Corregir `password-recovery.e2e-spec.ts`

**Status:** PENDIENTE

**Problema Identificado:**

- Aún no analizado en detalle
- Probablemente relacionado con usuarios o configuración de email

**Plan de Corrección:**

1. ⏳ Analizar errores específicos del test
2. ⏳ Identificar causa raíz
3. ⏳ Aplicar correcciones necesarias
4. ⏳ Verificar que usa datos E2E correctamente

**Criterio de Éxito:**

- [ ] Suite `password-recovery` pasa completamente
- [ ] No afecta a otros tests
- [ ] Lint: sin errores
- [ ] Format: sin cambios
- [ ] Build: exitoso
- [ ] Tests unitarios: 487 pasando
- [ ] Tests E2E: 7 suites pasando

---

### 🔴 TAREA 4: Corregir `mvp-complete.e2e-spec.ts`

**Status:** PENDIENTE

**Problema Identificado:**

- Crea usuarios nuevos con timestamps
- Intenta actualizar plan a PREMIUM con UPDATE directo en BD
- El login devuelve plan FREE aunque se hizo UPDATE a PREMIUM
- Posible problema de transacciones o conexiones de BD diferentes

**Plan de Corrección:**

1. ✅ Eliminar seeding duplicado en `beforeAll` (ya hecho)
2. ✅ Cambiar a usar usuarios seeded (ya intentado, falló)
3. ⏳ Investigar por qué el UPDATE de plan no se refleja en login
4. ⏳ Verificar si hay problema de caché o transacciones
5. ⏳ Alternativa: Usar usuarios seeded directamente sin UPDATE
6. ⏳ Simplificar el flujo de autenticación

**Tests Específicos Problemáticos:**

- `Usuario puede hacer login y recibir JWT` → Expected: premium, Received: free
- `Lista preguntas predefinidas por categoría` → Expected: >= 1, Received: 0
- `Usuario FREE crea lectura con pregunta predefinida` → 500 Internal Server Error
- Todos los tests de usuario PREMIUM fallan con 401 Unauthorized

**Criterio de Éxito:**

- [ ] Suite `mvp-complete` pasa completamente (14 tests)
- [ ] No afecta a otros tests
- [ ] Lint: sin errores
- [ ] Format: sin cambios
- [ ] Build: exitoso
- [ ] Tests unitarios: 487 pasando
- [ ] Tests E2E: 8 suites pasando (TODOS)

---

## 🎯 Objetivo Final

- **Tests E2E:** 8/8 suites pasando (59 tests)
- **Tests Unitarios:** 487/487 pasando
- **Lint:** Sin errores
- **Format:** Sin cambios
- **Build:** Exitoso

---

## 📝 Notas Importantes

- **NO ejecutar tests fallidos** mientras se trabaja en otros
- **Ejecutar solo el test que se está corrigiendo** + los que ya pasan
- **Commit después de cada tarea completada**
- **Resetear DB E2E antes de cada ejecución:** `bash scripts/manage-e2e-db.sh reset`

---

## 🔄 Workflow por Tarea

```bash
# 1. Resetear DB E2E
bash scripts/manage-e2e-db.sh reset

# 2. Trabajar en la corrección del test

# 3. Ejecutar SOLO el test que se corrige
npm run test:e2e -- --testPathPattern=<nombre-del-test>

# 4. Si pasa, ejecutar todos los tests que deberían pasar
npm run test:e2e -- --testPathPattern="(email|rate-limiting|ai-health|app|<test-corregido>)"

# 5. Ejecutar lint
npm run lint

# 6. Ejecutar format
npm run format

# 7. Ejecutar build
npm run build

# 8. Ejecutar tests unitarios
npm run test

# 9. Si TODO pasa, hacer commit
git add .
git commit -m "fix(e2e): corregir suite <nombre-del-test>"
```

---

## 📊 Progreso

- [ ] TAREA 1: predefined-questions
- [ ] TAREA 2: readings-hybrid
- [ ] TAREA 3: password-recovery
- [ ] TAREA 4: mvp-complete

**Última actualización:** 2025-11-04 16:10
