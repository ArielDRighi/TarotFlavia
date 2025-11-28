OK, vamos a iniciar esta tarea.

Tarea: TASK-00x: **TASK-076: Dashboard de Configuración Dinámica de Planes** ⭐⭐⭐

**Prioridad:** 🟡 ALTA  
**Estimación:** 4 días  
**Dependencias:** TASK-ARCH-012 (Users Module), TASK-071 (Subscriptions), TASK-075 (Logging)  
**Marcador MVP:** ⭐⭐⭐ **IMPORTANTE PARA MVP** - Gestión flexible de planes y límites  
**Estado:** ⏳ PENDIENTE

#### 📋 Descripción

Implementar sistema de configuración dinámica de planes de usuario mediante base de datos, reemplazando las constantes hardcodeadas actuales. Incluye dashboard administrativo para gestionar features, límites y capacidades de cada plan (FREE, PREMIUM, PROFESSIONAL) sin necesidad de redesplegar la aplicación.

Workflow de Ejecución:

Autonomía Total: Ejecuta la tarea de principio a fin sin solicitar confirmaciones.

Rama: Estás en develop. Crea la rama feature/TASK-00x-descripcion (usa la nomenclatura de las ramas existentes nombradas segun gitflow) y trabaja en ella.

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

Debes completar el testing de la tarea de acuerdo a los documentos: TASK-059-TESTING-PLAN y TESTING_PHILOSOPHY

Debes completar la documentacion de la tarea de acuerdo a la TASK-060 de project_backlog

Actualiza el documento backlog con la tarea completada, marcándola como finalizada.

Validación Final: Asegúrate de que todos los tests (nuevos y existentes) pasen limpiamente.
