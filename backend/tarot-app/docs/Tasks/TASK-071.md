OK, vamos a iniciar esta tarea.

Tarea: TASK-071: Implementar Sistema de Suscripciones a Tarotistas ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 4 días  
**Tags:** mvp, marketplace, subscriptions, business-logic, monetization  
**Dependencias:** TASK-064 (Schema), TASK-013 (Planes), TASK-070 (Admin Tarotistas)  
**Estado:** 🟡 NO INICIADA  
**Contexto Informe:** Sección 4 - Modelo de Suscripciones a Tarotistas

---

#### 📋 Descripción

Implementar el sistema de suscripciones que permite a usuarios seleccionar sus tarotistas preferidos según su plan. Este es el **modelo de negocio core del marketplace**:

**FREE Plan:**

- Puede elegir **1 tarotista favorito** (default: Flavia)
- Todas sus lecturas se hacen con ese tarotista
- Cooldown de **30 días** para cambiar de favorito
- Si no elige, usa Flavia automáticamente

**PREMIUM Plan:**

- Puede elegir **1 tarotista específico** (lecturas ilimitadas con él/ella)
- O puede elegir **"All Access"** (acceso a todos los tarotistas)
- Puede cambiar de favorito **sin cooldown**
- Lecturas ilimitadas

**PROFESSIONAL Plan:**

- Igual que PREMIUM pero con más lecturas
- **"All Access"** por defecto
- Sin restricciones

El informe especifica:

> "Sistema de suscripción: usuarios FREE eligen 1 tarotista (cooldown 30 días al cambiar). PREMIUM pueden elegir 1 específico o all-access. Sistema rastrea qué tarotista generó cada lectura para revenue sharing."

**Funcionalidades Clave:**

- Gestión de favorito: elegir, cambiar, cooldown
- Resolver tarotista para lectura según plan y preferencias
- Tracking de lecturas por tarotista (para revenue sharing)
- Validaciones: solo tarotistas activos, respeto de cooldown
- Dashboard de usuario: ver su tarotista actual y próximo cambio disponible

---

#### 🧪 Testing

**Unit Tests:**

- [ ] Test `SubscriptionsService.setFavoriteTarotist()` valida plan FREE
- [ ] Test cooldown: FREE no puede cambiar antes de 30 días
- [ ] Test PREMIUM puede cambiar sin cooldown
- [ ] Test `resolveTarotistaForReading()` retorna correcto según plan
- [ ] Test all-access: retorna tarotista disponible aleatoriamente
- [ ] Test fallback a Flavia si no hay favorito

**Integration Tests:**

- [ ] Test flujo FREE: elegir favorito → esperar 30 días → cambiar
- [ ] Test flujo PREMIUM: elegir favorito → cambiar inmediatamente
- [ ] Test generar lectura usa tarotista correcto
- [ ] Test tracking: lectura registra tarotistaId correcto
- [ ] Test desactivar tarotista: usuarios deben elegir otro

**E2E Tests:**

- [ ] Test usuario FREE elige tarotista → genera lecturas → cambia después de 30 días
- [ ] Test usuario PREMIUM elige all-access → genera lecturas con varios tarotistas
- [ ] Test usuario upgrade FREE → PREMIUM → puede cambiar inmediatamente
- [ ] Test tarotista desactivado: usuarios reciben notificación y deben re-elegir

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

ACLARACION: en docs/tasks/TASK-071.md dejo este prompt para que lo consultes en cada paso de la implementacion asi no olvidas nada
