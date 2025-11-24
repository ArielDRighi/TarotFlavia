OK, vamos a iniciar esta tarea.

Tarea: ### 🔴 TASK-074: Actualizar Tests E2E para Contexto Multi-Tarotista ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 5 días (2.5 días TASK-074-a + 2.5 días TASK-074-b)  
**Tags:** mvp, marketplace, testing, e2e, quality-assurance, backward-compatibility  
**Dependencias:** TASK-066 a TASK-073 (todas las tareas de marketplace - nota: después de renumeración será TASK-066 a TASK-072)  
**Estado:** 🟡 NO INICIADA  
**Contexto Informe:** Sección 10 - Testing y Calidad

**Nota:** Esta tarea se divide en dos sub-tareas secuenciales:

- **TASK-074-a**: Actualizar Tests Existentes (2.5 días)
- **TASK-074-b**: Crear Tests Nuevos Marketplace (2.5 días)

---

#### 📋 Descripción

Actualizar **todos los tests E2E existentes** para funcionar con el nuevo contexto multi-tarotista y crear **nuevos tests** que validen específicamente las funcionalidades del marketplace. Este task es crítico para:

1. **Garantizar backward compatibility** con sistema single-tarotist (Flavia)
2. **Validar funcionamiento multi-tarotista** con 2+ tarotistas
3. **Actualizar tests existentes** que asumen Flavia hardcodeada
4. **Crear tests nuevos** para suscripciones, revenue sharing, etc.
5. **Test de regresión** completo del sistema

El informe especifica:

> "Tests E2E deben validar que el sistema funciona tanto con un solo tarotista (Flavia) como con múltiples tarotistas. Backward compatibility es crítica."

**Alcance:**

- Actualizar ~20 archivos de tests E2E existentes
- Crear ~10 archivos de tests E2E nuevos para marketplace
- Test fixtures con múltiples tarotistas
- Seeders de testing actualizados
- Validación de que tests existentes siguen pasando

---

#### 🧪 Testing

**Tests a Actualizar (Existentes):**

- [ ] `app.e2e-spec.ts` - Health checks
- [ ] `auth.e2e-spec.ts` - Login, registro, JWT
- [ ] `readings.e2e-spec.ts` - Generación de lecturas
- [ ] `interpretations.e2e-spec.ts` - Interpretaciones de IA
- [ ] `subscriptions.e2e-spec.ts` - Planes FREE/PREMIUM
- [ ] `usage-limits.e2e-spec.ts` - Límites por plan
- [ ] `admin.e2e-spec.ts` - Endpoints admin
- [ ] Todos los demás tests que generan lecturas

**Tests Nuevos a Crear:**

- [ ] `tarotistas-marketplace.e2e-spec.ts` - Marketplace público
- [ ] `tarotista-subscriptions.e2e-spec.ts` - Suscripciones a tarotistas
- [ ] `tarotista-management.e2e-spec.ts` - Admin gestión tarotistas
- [ ] `tarotista-revenue.e2e-spec.ts` - Revenue sharing
- [ ] `multi-tarotist-readings.e2e-spec.ts` - Lecturas con múltiples tarotistas
- [ ] `backward-compatibility.e2e-spec.ts` - Tests específicos de compatibilidad
- [ ] `tarotista-applications.e2e-spec.ts` - Aplicaciones de tarotistas
- [ ] `custom-meanings.e2e-spec.ts` - Significados personalizados
- [ ] `roles-and-permissions.e2e-spec.ts` - Sistema de roles

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

ACLARACION: en docs/tasks/TASK-074.md dejo este prompt para que lo consultes en cada paso de la implementacion asi no olvidas nada.
MUY POSIBLEMENTE se hayan agregado tests que no figuran en este documento, debes analizar el proyecto para detectarlos y tenerlos encuenta
