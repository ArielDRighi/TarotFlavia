OK, vamos a iniciar esta tarea.

Tarea: TASK-073: Implementar Sistema de Revenue Sharing y Métricas ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 4 días  
**Tags:** mvp, marketplace, revenue-sharing, analytics, business-metrics, monetization  
**Dependencias:** TASK-064 (Schema), TASK-071 (Subscriptions), TASK-072 (Public Endpoints)  
**Estado:** 🟡 NO INICIADA  
**Contexto Informe:** Sección 9 - Revenue Sharing y Métricas

---

#### 📋 Descripción

Implementar el sistema completo de **revenue sharing** (reparto de ingresos) y **analytics** para el marketplace. Este sistema es crítico para:

1. **Calcular ingresos por tarotista** basado en lecturas generadas
2. **Aplicar comisiones configurables** por la plataforma
3. **Generar reportes financieros** mensuales por tarotista
4. **Dashboard de métricas** para tarotistas y admin
5. **Tracking detallado** de uso y performance

El informe especifica:

> "Sistema de revenue sharing: trackear qué tarotista generó cada lectura. Aplicar comisión configurable a la plataforma (ej: 70% tarotista, 30% plataforma). Dashboard con métricas por tarotista: ingresos, lecturas, rating."

**Modelo de Negocio:**

- Plataforma cobra **comisión sobre suscripciones** de usuarios que usan cada tarotista
- Comisión configurable: default 70/30 (70% tarotista, 30% plataforma)
- Pago mensual a tarotistas basado en sus lecturas generadas
- Métricas en tiempo real para decisiones estratégicas

**Funcionalidades Clave:**

- Cálculo automático de ingresos por lectura
- Dashboard admin: ver ingresos totales y por tarotista
- Dashboard tarotista: ver sus propias métricas
- Reportes exportables (CSV/PDF)
- Configuración de comisiones por tarotista (negociaciones especiales)

---

#### 🧪 Testing

**Unit Tests:**

- [ ] Test cálculo de ingresos por lectura según plan de usuario
- [ ] Test aplicación de comisión: 70/30 default
- [ ] Test comisión custom por tarotista
- [ ] Test agregación de métricas mensuales
- [ ] Test cálculo de payouts pendientes

**Integration Tests:**

- [ ] Test generación de lectura incrementa contadores
- [ ] Test dashboard muestra métricas correctas
- [ ] Test exportación de reportes con datos reales
- [ ] Test cambio de comisión se refleja en cálculos futuros

**E2E Tests:**

- [ ] Test flujo completo: lectura generada → ingresos calculados → dashboard actualizado
- [ ] Test admin ve métricas de todos los tarotistas
- [ ] Test tarotista solo ve sus propias métricas
- [ ] Test exportar reporte mensual con lecturas y earnings

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

ACLARACION: en docs/tasks/TASK-073.md dejo este prompt para que lo consultes en cada paso de la implementacion asi no olvidas nada
