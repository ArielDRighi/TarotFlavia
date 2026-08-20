# Workflow de Desarrollo Backend - Auguria

> 📋 **Propósito:** Workflow TDD completo para tareas de backend NestJS.
> 🤖 **Uso:** Este documento debe ser aplicado automáticamente cuando se inicia una tarea de backend.
> 📅 **Last Updated:** January 17, 2026

---

## 🎯 Trigger Automático

**Cuando el usuario diga:**
- "Iniciar TASK-XXX del backend"
- "Empezar tarea backend TASK-XXX"
- Cualquier variación similar

**El agente debe aplicar este workflow automáticamente SIN pedir confirmación.**

---

## 📋 Workflow Completo

### Fase 0: Preparación

1. **Leer el backlog correspondiente** para entender el contexto completo de la tarea
2. **Crear rama de feature** siguiendo convención: `feature/TASK-XXX-descripcion-corta`
3. **Crear lista de tareas (TodoWrite)** con todos los pasos necesarios

### Fase 1: Análisis y Diseño (RED)

**Objetivo:** Entender qué se debe hacer antes de escribir código.

1. **Leer documentación relevante:**
   - `backend/tarot-app/docs/ARCHITECTURE.md` - Patrones y estructura
   - `backend/tarot-app/docs/API_DOCUMENTATION.md` - Contratos existentes
   - `.github/copilot-instructions.md` - Reglas de contrato

2. **Analizar código existente:**
   - Buscar módulos similares para seguir patrones establecidos
   - Identificar dependencias (entities, DTOs, repositories, services)
   - Revisar estructura de carpetas del módulo afectado

3. **Diseñar la solución:**
   - Definir qué clases/archivos se necesitan crear/modificar
   - Identificar dependencias entre componentes
   - Planificar estructura de tests

4. **Escribir tests PRIMERO (TDD - Red Phase):**
   ```bash
   # Los tests deben FALLAR porque no hay implementación aún
   npm run test -- path/to/new-feature.spec.ts
   ```
   - Tests unitarios para casos de éxito
   - Tests para casos de error (validaciones, excepciones)
   - Tests para edge cases

### Fase 2: Implementación (GREEN)

**Objetivo:** Hacer que los tests pasen con la implementación mínima.

5. **Implementar siguiendo Clean Architecture:**
   ```
   src/modules/nombre-modulo/
   ├── domain/
   │   ├── entities/           # Entidades TypeORM
   │   └── interfaces/         # Interfaces de repositorios
   ├── application/
   │   ├── use-cases/          # Casos de uso (lógica de negocio)
   │   ├── dto/                # DTOs de entrada/salida
   │   └── orchestrators/      # Orquestadores (coordinan use cases)
   └── infrastructure/
       ├── controllers/        # Controladores (REST endpoints)
       ├── repositories/       # Implementaciones de repositorios
       └── module.ts           # Módulo NestJS
   ```

6. **Patrones obligatorios:**
   - **Controllers:** Solo reciben requests, validan con DTOs, delegan a orchestrators
   - **Orchestrators:** Coordinan use cases, NUNCA inyectan repositories
   - **Use Cases:** Lógica de negocio compleja
   - **Repositories:** Acceso a datos con interfaces (`@Inject('IRepositoryName')`)

7. **Convenciones:**
   - Decoradores Swagger (`@ApiTags`, `@ApiOperation`)
   - Texto user-facing en **español**
   - IDs siempre **numéricos** (nunca strings)
   - Paginación: `{ data: [], meta: { page, limit, totalItems, totalPages } }`

8. **Ejecutar tests:**
   ```bash
   npm run test -- path/to/new-feature.spec.ts
   # Deben PASAR TODOS los tests
   ```

### Fase 3: Refactorización (REFACTOR)

**Objetivo:** Mejorar código sin cambiar comportamiento.

9. **Refactorizar:**
   - Eliminar código duplicado
   - Mejorar nombres de variables/funciones
   - Optimizar imports (orden: framework → third-party → swagger → internal → common)
   - Aplicar principios SOLID

10. **Ejecutar tests nuevamente:**
    ```bash
    npm run test -- path/to/new-feature.spec.ts
    # Deben seguir pasando después de refactorizar
    ```

### Fase 4: Validación de Calidad

**Objetivo:** Garantizar que el código cumple estándares del proyecto.

11. **Ejecutar suite completa de validaciones:**
    ```bash
    # Desde backend/tarot-app/
    npm run lint                    # Lint + autofix
    npm run test:cov                # Coverage ≥ 80%
    npm run build                   # Compilación TypeScript
    npm run validate-architecture   # Validación de arquitectura limpia
    ```

12. **Verificar reglas críticas:**
    - ✅ No hay `any` types sin justificación
    - ✅ Coverage ≥ 80%
    - ✅ Todos los tests pasan
    - ✅ Build exitoso
    - ✅ Arquitectura limpia validada
    - ✅ IDs son numéricos
    - ✅ Endpoints centralizados
    - ✅ Texto user-facing en español

### Fase 5: Documentación y Commit

13. **Actualizar documentación:**
    - Actualizar `API_DOCUMENTATION.md` si hay nuevos endpoints
    - Marcar tarea como completada en el backlog correspondiente
    - Agregar notas técnicas relevantes en el backlog

14. **Crear commit siguiendo convenciones:**
    ```bash
    # Convención: tipo(scope): descripción
    # Tipos: feat, fix, refactor, test, docs, chore
    
    git add .
    git commit -m "feat(modulo): descripción en español de la feature"
    
    # Ejemplo:
    # git commit -m "feat(horoscope): add daily horoscope generation service"
    ```

15. **Push y crear PR:**
    ```bash
    git push -u origin feature/TASK-XXX-descripcion
    
    # IMPORTANTE: PR SIEMPRE apunta a develop (NUNCA a main)
    gh pr create --base develop --title "..." --body "..."
    
    # Crear PR con:
    # - Base: develop (CRÍTICO)
    # - Título descriptivo
    # - Resumen de cambios (bullet points)
    # - Referencia a la tarea (TASK-XXX)
    # - Checklist de validaciones completadas
    ```

---

## 🔍 Checklist Final

Antes de crear el PR, verificar:

- [ ] Tests escritos ANTES de implementación (TDD)
- [ ] Todos los tests pasan (`npm run test:cov`)
- [ ] Coverage ≥ 80%
- [ ] Lint sin errores (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Arquitectura validada (`npm run validate-architecture`)
- [ ] IDs numéricos (no strings)
- [ ] Endpoints siguen contrato establecido
- [ ] Paginación usa formato correcto
- [ ] Texto user-facing en español
- [ ] Documentación actualizada
- [ ] Backlog actualizado con estado de tarea
- [ ] Commit message sigue convención
- [ ] PR creado con descripción completa

---

## 🗄️ Migraciones — Dos Reglas que No Se Negocian

> Ambas nacen de casos reales del proyecto. Ver
> [`BACKLOG_DEUDA_TECNICA_2026_08.md`](./BACKLOG_DEUDA_TECNICA_2026_08.md) para el detalle medido.

### Regla A: NUNCA commitear el output de `migration:generate` sin leerlo entero

`migration:generate` compara los **decoradores de las entidades** contra la **base real** y escribe
el SQL para que la base se parezca a las entidades. Como en este repo las migraciones se escribieron
a mano con SQL que dice más de lo que dicen los decoradores (`TIMESTAMPTZ`, `ON DELETE CASCADE`,
nombres legibles de FKs), el generador arrastra **drift preexistente** que no tiene nada que ver con
tu tarea.

Medido el 19-ago-2026: agregar 7 columnas a una tabla generó **83 sentencias** (eran 91 antes de que
T-DEUDA-003 resincronizara la base local).

Y no son inocuas. Para "corregir" el tipo de una columna, el generador no convierte: **borra y
recrea**.

```sql
-- ⚠️ Esto NO cambia el tipo: pierde todos los datos de la columna
ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN "created_at";
ALTER TABLE "encyclopedia_tarot_cards" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now();
```

**Procedimiento obligatorio:**

1. Generar la migración.
2. **Leer el archivo completo**, línea por línea.
3. Borrar toda sentencia que no sea de tu tarea.
4. Dejar escrito en el header del archivo qué se podó y por qué.
5. Verificar `up` y `down` contra una base con datos reales antes del PR.

### Regla B: una migración mergeada es INMUTABLE

TypeORM **nunca re-ejecuta** una migración ya registrada en la tabla `migrations`. Si editás un
archivo que ya corrió en alguna base, esa base **jamás** recibe el cambio, y queda divergiendo en
silencio de una base nueva —que sí ejecuta la versión final—.

Pasó en `1776900000000-AuthTimestampsToTimestamptz.ts`: nació con 9 columnas, el feedback del PR le
agregó 4 más editando el mismo archivo, y la base de desarrollo —que ya había corrido la primera
versión— se quedó con 4 columnas sin convertir. (Resincronizada a mano en T-DEUDA-003 el 19-ago-2026;
**producción nunca estuvo afectada**, porque los dos commits entraron juntos en el mismo PR — pero eso
fue suerte, no diseño.)

**Si a una migración ya mergeada le falta algo, va en una migración NUEVA.** Sin excepciones, ni
siquiera "todavía no se deployó" (alguien ya la corrió en local).

---

## ⚠️ Reglas Críticas

1. **TDD NO ES OPCIONAL** - Tests primero, implementación después
2. **NO inyectar repositories en controllers** - Usar orchestrators
3. **NO modificar contratos de API** sin aprobación explícita
4. **NO usar `any`** - TypeScript estricto
5. **NO saltarse validación de arquitectura** - Debe pasar siempre
6. **NO usar inglés** en texto user-facing
7. **NO crear PR** sin pasar todas las validaciones
8. **NO commitear el output de `migration:generate` sin leerlo** - Ver Regla A arriba
9. **NO editar una migración ya mergeada** - Lo que falta va en una nueva. Ver Regla B arriba

---

## 📚 Documentos de Referencia

- `docs/BACKLOG_DEUDA_TECNICA_2026_08.md` - Drift entre entidades y esquema (por qué existen las reglas de migraciones)
- `backend/tarot-app/docs/ARCHITECTURE.md` - Patrones de arquitectura
- `backend/tarot-app/docs/API_DOCUMENTATION.md` - Contratos de API
- `backend/tarot-app/docs/TESTING.md` - Estrategia de testing
- `.github/copilot-instructions.md` - Reglas de contratos
- `AGENTS.md` - Guía para agentes IA

---

**End of Workflow** - Aplicar este proceso en TODAS las tareas de backend.
