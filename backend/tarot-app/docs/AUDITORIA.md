Prompt para Claude Sonnet - Auditoría y Documentación de Tareas
Actúa como arquitecto de software senior especializado en auditoría de código y documentación técnica.
CONTEXTO
Estoy desarrollando una aplicación web y necesito realizar una auditoría completa del backlog de tareas, validando que cada implementación cumpla al 100% con su especificación, documentando exhaustivamente lo implementado y creando scripts de testing cuando corresponda.
PROCESO DE TRABAJO

1. LECTURA DEL BACKLOG

Lee el archivo project_backlog.md completamente
Identifica todas las tareas en orden secuencial
IMPORTANTE: Procesa UNA tarea a la vez, en el orden en que aparecen

2. AUDITORÍA DE IMPLEMENTACIÓN (por tarea)
   Para la tarea actual:
   a) Análisis de la especificación:

Lee detenidamente la descripción completa de la tarea
Identifica todos los requisitos técnicos especificados
Identifica archivos, endpoints, funciones, clases mencionadas

b) Verificación de implementación:

Busca en el código fuente todos los archivos relacionados
Verifica que CADA requisito especificado esté implementado
Identifica discrepancias entre lo especificado y lo implementado
Reporta si falta alguna funcionalidad

c) Resultado de auditoría:

✅ COMPLETA: 100% implementado según especificación
⚠️ PARCIAL: Implementado pero con diferencias o funcionalidad faltante
❌ INCOMPLETA: No implementado o significativamente diferente

3. DOCUMENTACIÓN TÉCNICA
   A. Verificar documentación existente

Busca en /docs/tasks/ si existe documentación para esta tarea
Si existe: revisa completitud y precisión
Si no existe o está incompleta: créala/actualizala

B. Estructura de la documentación
La documentación NO debe ser un informe de cumplimiento, sino una documentación técnica completa de lo implementado:
Ejemplo: Si la tarea era "Crear módulo de usuarios", documenta:
markdown# [TASK-XXX] - Módulo de Usuarios

## Descripción

[Breve descripción de qué implementa este módulo]

## Arquitectura Implementada

### Estructura de Archivos

```
src/
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   ├── dto/
│   └── entities/
```

### Capas y Responsabilidades

- **Controller:** [Descripción]
- **Service:** [Descripción]
- **Repository:** [Descripción]

## Endpoints

### 1. GET /users/profile

**Descripción:** Obtiene el perfil del usuario autenticado

**Autenticación:** Requerida (Bearer Token)

**Autorización:** Usuario autenticado

**Respuesta exitosa (200):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "free",
  "roles": ["consumer"]
}
```

**Errores:**

- `401 Unauthorized`: Token inválido o ausente

**Uso:**

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer {token}"
```

### 2. PATCH /users/profile

[Similar detalle para cada endpoint...]

## Entidades y Modelos

### User Entity

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  // ... documentar todos los campos
}
```

## DTOs

### UpdateUserDto

[Documentar DTOs utilizados]

## Validaciones

- Email debe ser único
- Password mínimo 8 caracteres
- [Todas las validaciones implementadas]

## Casos de Uso

### Usuario actualiza su perfil

1. Usuario autenticado envía PATCH /users/profile
2. Sistema valida datos
3. Sistema actualiza información
4. Retorna usuario actualizado

## Consideraciones de Seguridad

- Passwords hasheados con bcrypt
- JWT para autenticación
- [Otras medidas implementadas]

## Dependencias

- @nestjs/jwt
- bcrypt
- [Listar dependencias relevantes]

4. SCRIPTS DE TESTING
   SOLO si la tarea involucra creación/modificación de endpoints:
   a) Verificar si existe script de testing

Busca en la raíz o carpeta /scripts/ archivos como test-{modulo}-endpoints.sh

b) Crear/actualizar script siguiendo el formato del ejemplo:

Usa el archivo test-users-endpoints.sh que te proporcioné como PLANTILLA EXACTA
Mantén la misma estructura de funciones auxiliares
Mantén el mismo formato de colores y headers
Mantén el mismo sistema de contadores
Adapta las variables y tests al módulo específico

c) Estructura del script:
bash #!/bin/bash

# Header con información de la tarea

# Variables de configuración

# Funciones auxiliares (copiar del template)

# Setup de autenticación

# Tests organizados por secciones

# Resumen final

```

d) **Cobertura de tests:**
   - Test para CADA endpoint documentado
   - Test de casos exitosos (200, 201)
   - Test de errores de autenticación (401)
   - Test de errores de autorización (403)
   - Test de validaciones (400)
   - Test de recursos no encontrados (404)
   - Test de edge cases específicos del módulo

## OUTPUT ESPERADO

Para cada tarea procesada, genera:

### 1. Resumen de Auditoría
```

═══════════════════════════════════════════════════════════
AUDITORÍA: [TASK-XXX] - Nombre de la Tarea
═══════════════════════════════════════════════════════════

ESTADO: ✅ COMPLETA / ⚠️ PARCIAL / ❌ INCOMPLETA

REQUISITOS ESPECIFICADOS:
✅ Requisito 1: Implementado
✅ Requisito 2: Implementado
⚠️ Requisito 3: Implementado con diferencias
❌ Requisito 4: No implementado

ARCHIVOS IMPLEMENTADOS:

- src/module/file1.ts
- src/module/file2.ts

OBSERVACIONES:

- [Cualquier nota relevante]

```

### 2. Documentación
- Archivo creado/actualizado en `/docs/tasks/TASK-XXX-nombre-descriptivo.md`
- Contenido técnico completo siguiendo la estructura especificada

### 3. Script de Testing (si aplica)
- Archivo creado/actualizado: `test-{modulo}-endpoints.sh`
- Formato idéntico al template proporcionado
- Tests exhaustivos para todos los endpoints

## REGLAS IMPORTANTES

1. **UNA TAREA A LA VEZ:** No proceses múltiples tareas simultáneamente
2. **ORDEN SECUENCIAL:** Sigue el orden del backlog estrictamente
3. **NO INVENTAR:** Solo documenta lo que está realmente implementado
4. **FORMATO CONSISTENTE:** Usa siempre la misma estructura de documentación
5. **SCRIPTS UNIFORMES:** Todos los scripts deben seguir el mismo formato del template
6. **COMPLETITUD:** No omitas endpoints, validaciones o funcionalidades
7. **PRECISIÓN TÉCNICA:** Nombres exactos de archivos, clases, métodos, rutas
8. **EJEMPLOS REALES:** Usa ejemplos de requests/responses basados en la implementación real

## INICIO

Comienza diciendo:
```

Iniciando auditoría del backlog...
Leyendo project_backlog.md...

Procesando TAREA 1/X: [TASK-XXX] - Nombre de la Tarea
Luego procede con la auditoría, documentación y scripts según corresponda.
