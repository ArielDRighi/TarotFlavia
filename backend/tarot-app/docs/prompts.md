# Creacion de nueva tarea:

OK, vamos a iniciar esta tarea.

Tarea: TASK-00x: [Pega aquí la descripción detallada de la tarea]

Workflow de Ejecución:

Autonomía Total: Ejecuta la tarea de principio a fin sin solicitar confirmaciones.

Rama: Estás en develop. Crea la rama feature/TASK-00x-descripcion (usa la nomenclatura de las ramas existentes nombradas segun gitflow) y trabaja en ella.

**Lectura Obligatoria de Contexto (ANTES de codificar):**

Si la tarea involucra límites, capabilities, planes de usuario o validaciones de uso:

1. `frontend/docs/MODELO_NEGOCIO_DEFINIDO.md` - Reglas de negocio para ANÓNIMO/FREE/PREMIUM
2. `frontend/docs/REFACTOR_LIMITS_SYSTEM.md` - Arquitectura del sistema de capabilities

Arquitectura y Patrones (CRÍTICO):

- **LEE PRIMERO:** `backend/tarot-app/docs/ARCHITECTURE.md` (completo) para entender la arquitectura híbrida feature-based del proyecto.
- **Feature-Based:** El código está organizado por dominio (`src/modules/tarot/`, `src/modules/tarotistas/`, etc). Crea archivos en el módulo correspondiente según el dominio de negocio.
- **Capas Internas:** Módulos complejos (>10 archivos o lógica compleja) usan capas: `domain/`, `application/`, `infrastructure/`. Módulos simples (CRUD) pueden ser flat (entities, dto, service, controller en raíz del módulo).
- **Nombres:** Sigue la nomenclatura de NestJS:
  - Entities: `nombre.entity.ts` (PascalCase: `TarotReading`)
  - DTOs: `create-nombre.dto.ts`, `update-nombre.dto.ts` (kebab-case)
  - Services: `nombre.service.ts` (PascalCase: `ReadingsService`)
  - Controllers: `nombre.controller.ts` (kebab-case routes)
- **Inyección de Dependencias (TypeORM):**
  - **Estándar:** Usa `@InjectRepository(Entity)` directo en servicios (enfoque pragmático NestJS)
  - **Testing:** Mockea `Repository<Entity>` con `jest.fn()` en tests unitarios
  - **Excepción:** Solo usa Repository Pattern (interface + implementación) si el módulo ya lo tiene establecido
- **ANTES de crear:** Inspecciona módulos existentes similares (ej: si crearás algo de tarot, mira `src/modules/tarot/cards/`) y replica su estructura exacta.

Metodología (TDD Estricto): Sigue un ciclo TDD riguroso: _ Escribe un test (debe fallar). _ Escribe el código mínimo para que el test pase. \* Refactoriza.

Ciclo de Calidad (Pre-Commit): Al finalizar la implementación, ejecuta los scripts de lint, format y build del proyecto. Todos los tipos de tests completos (unitarios y e2e). Corrige todos los errores y warnings que surjan. Y finalmente el script validate-architecture.js

Esta terminantemente prohibido agregar eslint disable, debes solucionar los problemas de forma real.

Actualiza el documento backlog con la tarea completada, marcándola como finalizada.

Validación Final: Asegúrate de que todos los tests (nuevos y existentes) pasen limpiamente.

Push y Monitoreo CI:

```bash
git push origin feature/TASK-00x-descripcion

# Monitorear CI en tiempo real
gh run list --branch feature/TASK-00x-descripcion --limit 1
gh run watch <run-id>  # Usar el ID del comando anterior

# Si falla, ver logs específicos:
gh run view <run-id> --job=<job-id> --log | grep "FAIL\|ERROR"
```

Entregable: Proporcióname el diff de cambios y un borrador del mensaje para la Pull Request.

---

# Tarea de Refactorización Arquitectural

OK, vamos a ejecutar esta tarea de refactorización arquitectural.

Tarea: TASK-ARCH-00x: [Pega aquí el número y descripción de la tarea del PLAN_REFACTORIZACION.md]

**Contexto:**

- Esta es una refactorización basada en PLAN_REFACTORIZACION.md
- NUNCA sacrifiques funcionalidad por arquitectura
- Objetivo: Mejorar estructura sin romper nada

**Workflow:**

**1. Preparación:**

- Lee COMPLETO el PLAN_REFACTORIZACION.md (especialmente la task ARCH-00x)
- Verifica precondiciones (sección 3 del plan)
- Ejecuta: `npm run build && npm test && npm run test:cov && npm run test:e2e`
- Documenta coverage ACTUAL (baseline - no puede bajar)
- Crea rama: `feature/TASK-ARCH-00x-descripcion-corta`

**2. Metodología: PRESERVE-VERIFY-REFACTOR**

- **PRESERVE:** Duplica (no muevas). Crea nueva estructura, COPIA archivos, adapta imports
- **VERIFY:** Valida (`npm run build && npm test && npm run test:e2e`). Prueba endpoints críticos
- **REFACTOR:** Solo AHORA elimina código antiguo. Valida de nuevo

**3. Ejecución:**

- Sigue PLAN_REFACTORIZACION.md paso a paso
- Checkpoint cada 3-5 pasos: `npm run build && npm test && npm run lint`
- NUNCA elimines tests existentes - muévelos con el código
- Coverage >= baseline (obligatorio)
- Commits incrementales: `refactor(arch): TASK-ARCH-00x paso X/N - descripción`

**4. Prohibiciones:**
🚫 Cambiar comportamiento funcional
🚫 Eliminar tests
🚫 Usar eslint-disable
🚫 Bajar coverage
🚫 Romper marketplace features

**5. Validación Final (Pre-PR):**

```bash
rm -rf dist/ node_modules/.cache
npm run build && npm run lint && npm run format
npm test && npm run test:cov && npm run test:e2e
madge --circular --extensions ts src/  # Debe ser 0
npm run start:dev  # Probar endpoints manualmente
```

**6. Entregable:**

- Resumen: Task, archivos (movidos/creados/eliminados), coverage (antes→después)
- Diff: `git diff develop --stat`
- Validaciones: Build, tests, coverage, linter, dependencias circulares, app funcional
- Borrador PR con estructura del plan

**Métricas de Éxito (todas obligatorias):**

✅ Lint, format, Build sin errores, todos los tipos de tests (unit + e2e) (por ahora e2e de a uno, ya que existen problemas al ejecutarlos en paralelo)
✅ Coverage >= baseline
✅ 0 dependencias circulares
✅ App funciona
✅ Marketplace OK (si aplica)
✅ Plan ejecutado completo

---

# Pull Request

Tengo el siguiente feedback del PR para la rama feature/TASK-00x.

Feedback Recibido: [Pega aquí el feedback completo del revisor]

**Lectura Obligatoria de Contexto:**

Si el PR involucra límites, capabilities o planes de usuario, lee antes de responder:

1. `frontend/docs/MODELO_NEGOCIO_DEFINIDO.md` - Reglas de negocio (fuente de verdad)
2. `frontend/docs/REFACTOR_LIMITS_SYSTEM.md` - Arquitectura de capabilities

Tu Tarea (Análisis Senior):

Analiza y Valida: Lee críticamente cada punto del feedback.

Aplica Correcciones: Implementa los cambios para todo el feedback que consideres válido y correcto.

Justifica (Pushback): Si no estás de acuerdo con algún comentario (porque el revisor malinterpretó algo, o tu solución es preferible por una razón X), no lo apliques. En su lugar, prepara una respuesta técnica y educada para el PR explicando tu razonamiento.

Calidad y TDD: Si las correcciones implican cambios de lógica, deben reflejarse en los tests (actualizándolos o creando nuevos). Vuelve a pasar el ciclo de lint, format, build y test (todos los tests) para asegurar que todo sigue limpio. Y finalmente el script validate-architecture.js

Estrategia de Commits: Crea un NUEVO commit con las correcciones usando el mensaje: "fix: apply PR feedback - [descripción breve de los cambios]". NUNCA uses --amend para correcciones de PR, ya que complica el historial y requiere force push.

Push y Monitoreo CI:

```bash
git push origin feature/TASK-00x-descripcion

# Monitorear CI en tiempo real
gh run list --branch feature/TASK-00x-descripcion --limit 1
gh run watch <run-id>

# Ver solo errores si falla:
gh run view <run-id> --log | grep -A 10 "FAIL\|ERROR"
```

Entregable: Muéstrame el código actualizado y las respuestas que prepararías para los comentarios del PR (especialmente los que estés rechazando).
