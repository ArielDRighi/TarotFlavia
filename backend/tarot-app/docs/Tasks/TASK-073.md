OK, vamos a iniciar esta tarea.

Tarea: TASK-073: Implementar Sistema de Revenue Sharing y Métricas ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 4 días  
**Tags:** mvp, marketplace, revenue-sharing, analytics, business-metrics, monetization  
**Dependencias:** TASK-064 (Schema), TASK-071 (Subscriptions), TASK-072 (Public Endpoints)  
**Estado:** ✅ COMPLETADA  
**Contexto Informe:** Sección 9 - Revenue Sharing y Métricas
**Fecha Finalización:** 2025-11-22

---

#### ✅ Resultado Final

**Implementación completada exitosamente con:**

- ✅ 1671 unit tests passing
- ✅ 20 E2E tests passing (revenue-sharing-metrics.e2e-spec.ts)
- ✅ 7 bugs de producción encontrados y corregidos mediante E2E testing
- ✅ Lint clean
- ✅ Build successful

**Bugs Críticos Descubiertos por Tests E2E:**

1. **BUG #1**: SQL Double DISTINCT syntax error
2. **BUG #2-3**: Date conversion errors (TypeORM QueryBuilder returns strings)
3. **BUG #4**: HTTP status code mismatch (201 vs 200)
4. **BUG #5**: PostgreSQL case-sensitive ORDER BY column
5. **BUG #6**: Missing base64 encoding in CSV exports
6. **BUG #7**: Test design flaw contradicting DTO defaults

Ver sección "🐛 Bugs Encontrados" al final para detalles técnicos.

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

**Unit Tests:** ✅ COMPLETADO

- [x] Test cálculo de ingresos por lectura según plan de usuario
- [x] Test aplicación de comisión: 70/30 default
- [x] Test comisión custom por tarotista
- [x] Test agregación de métricas mensuales
- [x] Test cálculo de payouts pendientes

**Integration Tests:** ✅ COMPLETADO

- [x] Test generación de lectura incrementa contadores
- [x] Test dashboard muestra métricas correctas
- [x] Test exportación de reportes con datos reales
- [x] Test cambio de comisión se refleja en cálculos futuros

**E2E Tests:** ✅ COMPLETADO (20/20 passing)

- [x] Test flujo completo: lectura generada → ingresos calculados → dashboard actualizado
- [x] Test admin ve métricas de todos los tarotistas
- [x] Test tarotista solo ve sus propias métricas
- [x] Test exportar reporte mensual con lecturas y earnings

---

#### 🐛 Bugs Encontrados y Corregidos

Los tests E2E revelaron **7 bugs críticos** en el código de producción (filosofía: tests encuentran bugs reales):

**BUG #1: SQL Syntax Error - Double DISTINCT**

- **Archivo**: `metrics.service.ts:106, 112`
- **Error**: `SELECT DISTINCT DISTINCT` causaba PostgreSQL syntax error
- **Causa**: Combinación incorrecta de `.distinct(true)` + `.select('DISTINCT ...')`
- **Fix**: Remover "DISTINCT" de `.select()`, mantener solo `.distinct(true)`

**BUG #2: Date Conversion - CSV Reports**

- **Archivo**: `reports.service.ts:92`
- **Error**: `revenue.calculationDate.toISOString is not a function`
- **Causa**: TypeORM QueryBuilder retorna fechas como strings, no Date objects
- **Fix**: `new Date(revenue.calculationDate).toISOString()`

**BUG #3: Date Conversion - PDF Reports**

- **Archivo**: `reports.service.ts:167`
- **Error**: `revenue.calculationDate.toLocaleString is not a function`
- **Causa**: Mismo root cause que BUG #2
- **Fix**: `new Date(revenue.calculationDate).toLocaleString()`

**BUG #4: HTTP Status Code Mismatch**

- **Archivo**: `reports.controller.ts`
- **Error**: POST retornaba 201 pero API docs especificaban 200
- **Fix**: Agregar `@HttpCode(200)` decorator

**BUG #5: SQL Case Sensitivity - ORDER BY**

- **Archivo**: `metrics.service.ts:157`
- **Error**: `column "totalrevenue" does not exist`
- **Causa**: Alias `"totalRevenue"` (quoted) pero ORDER BY usaba `totalRevenue` (unquoted)
- **Fix**: `.orderBy('"totalRevenue"', 'DESC')`

**BUG #6: Missing Base64 Encoding - CSV**

- **Archivo**: `reports.service.ts:106`
- **Error**: CSV retornaba texto plano mientras PDF usaba base64
- **Causa**: Inconsistencia entre formatos de export
- **Fix**: `Buffer.from(csvContent, 'utf-8').toString('base64')`

**BUG #7: Test Design Flaw**

- **Archivo**: `revenue-sharing-metrics.e2e-spec.ts:368`
- **Error**: Test esperaba 400 cuando DTO tiene default value
- **Causa**: Test contradecía comportamiento correcto del DTO
- **Fix**: Cambiar test para verificar uso del default, no error

---

#### Workflow de Ejecución:

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
