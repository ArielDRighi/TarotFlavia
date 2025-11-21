OK, vamos a iniciar esta tarea.

Tarea: TASK-072: Crear Endpoints Públicos de Tarotistas ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 2 días  
**Tags:** mvp, marketplace, public-api, frontend-ready, discovery  
**Dependencias:** TASK-064 (Schema), TASK-070 (Admin Tarotistas)  
**Estado:** 🟡 NO INICIADA  
**Contexto Informe:** Sección 5 - Descubrimiento de Tarotistas

---

#### 📋 Descripción

Crear endpoints públicos (sin autenticación requerida) para que el frontend del marketplace pueda:

1. **Listar todos los tarotistas activos** con paginación
2. **Ver perfil público detallado** de cada tarotista
3. **Filtrar por especialidades** (amor, trabajo, salud, etc.)
4. **Ordenar por popularidad, rating, o alfabético**
5. **Buscar por nombre o biografía**
6. **Ver estadísticas públicas**: total de lecturas, rating promedio

El informe especifica:

> "Endpoints públicos para listar tarotistas disponibles, ver perfiles, filtrar por especialidad, ordenar por rating. Frontend usa estos endpoints para la página de marketplace."

**Casos de Uso:**

- Usuario visitante explora tarotistas antes de registrarse
- Usuario registrado FREE busca tarotista para seleccionar como favorito
- Usuario PREMIUM explora opciones antes de elegir favorito o all-access
- Landing page muestra "Nuestros Tarotistas" con cards

**Datos Públicos vs Privados:**

- ✅ Público: nombre, foto, biografía, especialidades, rating, total lecturas
- ❌ Privado: configuración de IA, significados personalizados, ingresos, email

---

#### 🧪 Testing

**Unit Tests:**

- [ ] Test `TarotistasService.getAllPublic()` retorna solo activos
- [ ] Test filtros: especialidad, búsqueda, ordenamiento
- [ ] Test paginación: page, pageSize
- [ ] Test `getTarotistaPublicProfile()` no expone datos sensibles

**Integration Tests:**

- [ ] Test endpoint `/tarotistas` retorna lista paginada
- [ ] Test endpoint `/tarotistas/:id` retorna perfil completo
- [ ] Test filtro por especialidad: `/tarotistas?especialidad=amor`
- [ ] Test ordenamiento: `/tarotistas?orderBy=rating&order=DESC`
- [ ] Test búsqueda: `/tarotistas?search=luna`

**E2E Tests:**

- [ ] Test usuario visitante puede ver lista sin autenticación
- [ ] Test usuario registrado puede ver perfiles
- [ ] Test tarotista inactivo NO aparece en lista pública
- [ ] Test búsqueda retorna resultados relevantes

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
