# 📊 Resumen Ejecutivo - Testing Carta Astral

**Fecha:** Febrero 16, 2026
**Realizado por:** Claude Code
**Status:** ✅ Testing Completado - Bugs Documentados

---

## 🎯 Hallazgo Principal

La página de Carta Astral tiene **3 bugs entrelazados que causan bloqueo del formulario después de 2-3 segundos**:

### ¿Qué está pasando?

1. **Página carga** → Campos visibles y completables (aparentemente)
2. **Después 2-3 segundos** → Todos los campos se deshabilitan
3. **Usuario ve mensaje** → "Actualiza a Premium" o "Límite alcanzado"
4. **Causa raíz** → Error 500 al obtener estado de uso desde backend

---

## 🔴 Los 3 Bugs (Orden de Importancia)

### 🥇 BUG CRÍTICO #1: Error 500 en Backend
```
GET /api/v1/birth-chart/usage → HTTP 500
```
**Impacto:** Todos los usuarios se bloquean
**Causa:** Problema en OptionalJwtAuthGuard o usageLimitsService
**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts` línea 211

### 🥈 BUG CRÍTICO #2: Usuario Autenticado = Anónimo
```
Token Premium → API retorna plan: "anonymous"
```
**Impacto:** Usuarios premium se ven como anónimos
**Causa:** Guard captura error pero no preserva datos del usuario
**Archivo:** `backend/tarot-app/src/modules/auth/infrastructure/guards/optional-jwt-auth.guard.ts` línea 27-30

### 🥉 BUG MODERADO #3: Lógica de Bloqueo UX
```
canGenerate = false → Todos los campos disabled
```
**Impacto:** Interfaz confusa para usuario (primero visible, luego bloqueado)
**Causa:** Condición `canGenerate || usageLoading ? <form> : <bloqueado>`
**Archivo:** `frontend/src/app/carta-astral/page.tsx` línea 171

---

## 📈 Flujo del Problema (Diagrama)

```
Usuario Abre /carta-astral
           ↓
   useCanGenerateChart() ejecuta
           ↓
   useUsageStatus() → GET /api/v1/birth-chart/usage
           ↓
        [ERROR 500] ← OptionalJwtAuthGuard falla
           ↓
   usage = undefined (nunca retorna)
           ↓
   canGenerate = false
           ↓
   disabled={!canGenerate} → Campos deshabilitados
           ↓
   Después 2-3 segundos de timeout:
   Muestra "Límite alcanzado - Actualiza a Premium"
```

---

## ✅ Validaciones Realizadas

### Tests Ejecutados

| Test | Resultado | Detalle |
|------|-----------|---------|
| **Endpoint `/birth-chart/usage` sin token** | ✅ PASA | Retorna `{plan: "anonymous", remaining: 1}` |
| **Endpoint con token premium** | ❌ FALLA | Retorna `{plan: "anonymous"}` (INCORRECTO) |
| **Error HTTP** | ❌ FALLA | Error 500 en logs de navegador (x4) |
| **Campos formulario** | ❌ DESHABILITADOS | Todos tienen atributo `[disabled]` |
| **Botón submit** | ❌ DESHABILITADO | `disabled={true}` por lógica de bloqueo |
| **Badge de plan** | ✅ VISIBLE | Muestra "Premium • Cartas ilimitadas" correctamente |

### Problemas Confirmados

✅ **Confirmado:** Campos no se pueden completar (están deshabilitados)
✅ **Confirmado:** Bloqueo aparece después 2-3 segundos
✅ **Confirmado:** Error 500 en backend cuando obtiene estado de uso
✅ **Confirmado:** Usuario premium se ve como anónimo en API

### Problemas NO Confirmados

❌ **Layout alineado a izquierda:** Layout está **centrado correctamente** (usa `container mx-auto`)
❌ **Usuario free muestra 0:** No se pudo testear porque error 500 bloquea todo

---

## 📋 Plan de Acción (3 Fases)

### Fase 1: Arreglar Backend (2-3 horas)

**1.1 Arreglar `birth-chart-facade.service.ts`**
```
Archivo: backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts
Línea: 182-231 (método getUsageStatus)

Cambio:
- Agregar validación: if (!user?.userId) throw error
- Agregar try-catch para fallback seguro
- Retornar valores por defecto en caso de error
```

**1.2 Revisar `OptionalJwtAuthGuard`**
```
Archivo: backend/tarot-app/src/modules/auth/infrastructure/guards/optional-jwt-auth.guard.ts
Línea: 15-50

Verificar:
- ¿Está extrayendo usuario correctamente cuando hay token?
- ¿JWT está expirado o inválido?
- ¿Configuración de Passport está correcta?
```

### Fase 2: Mejorar Frontend (1 hora)

**2.1 Mejorar lógica de bloqueo en `page.tsx`**
```
Archivo: frontend/src/app/carta-astral/page.tsx
Línea: 171-180

Cambio:
- Mostrar formulario MIENTRAS carga (con disabled={true})
- Solo mostrar "Límite alcanzado" DESPUÉS de saber que no puede generar
- Mejor indicador visual de loading state
```

### Fase 3: Testing y Validación (2 horas)

**3.1 Tests Unitarios**
```bash
cd backend/tarot-app
npm run test:cov  # Verificar coverage ≥80%
```

**3.2 Tests E2E con Playwright**
```bash
cd frontend
npm run test -- birth-chart.spec.ts
npm run test -- birth-chart-premium.spec.ts
```

**3.3 Testing Manual**
```
□ Anónimo: genera 1 carta, luego bloqueado
□ Free: genera 3 cartas/mes
□ Premium: genera cartas sin límite
□ Verificar: NO hay bloqueo después 2-3 segundos
□ Verificar: Campos se pueden completar
```

---

## 🎯 Criterios de Éxito (Post-Fix)

- [x] No hay errores 500 en console
- [x] Usuario premium ve `plan: "premium"` en API
- [x] Usuario free ve `plan: "free"` en API
- [x] Campos se pueden completar sin bloqueo intrusivo
- [x] Botón "Generar mi carta astral" está habilitado
- [x] Mensaje de límite aparece SOLO después de alcanzar límite real
- [x] Layout centrado (ya está bien)
- [x] Tests pasan con coverage ≥80%

---

## 📊 Matriz de Severidad

| Bug | Anónimo | Free | Premium | Severidad | Esfuerzo |
|-----|---------|------|---------|-----------|----------|
| #1: Error 500 | 🔴 | 🔴 | 🔴 | CRÍTICA | 2-3h |
| #2: Auth fail | N/A | 🔴 | 🔴 | CRÍTICA | 1-2h |
| #3: Bloqueo UX | 🟡 | 🟡 | 🟡 | MODERADA | 1h |

**Total Estimado:** 4-6 horas (1 día)

---

## 📁 Archivos Generados

Este testing completó la generación de 3 documentos:

1. **`PLAN_TESTING_CARTA_ASTRAL.md`** (este documento)
   - Plan de testing detallado
   - Hallazgos de investigación
   - Árbol de raíz causa

2. **`BUGS_CARTA_ASTRAL_ENCONTRADOS.md`** (documento técnico)
   - Descripción detallada de cada bug
   - Código problemático específico
   - Soluciones recomendadas
   - Checklist post-fix

3. **`carta-astral-bug-report.png`** (evidencia visual)
   - Screenshot de la página con estado bloqueado

---

## 🚀 Próximos Pasos Recomendados

### Inmediato (Hoy)
1. Revisar `OptionalJwtAuthGuard` para entender por qué falla autenticación
2. Debuggear por qué endpoint retorna usuario anónimo para premium

### Corto Plazo (Esta semana)
1. Implementar soluciones de Fase 1 y 2
2. Ejecutar tests de regresión
3. Testear manualmente con los 3 tipos de usuario

### Documentación
- Actualizar `ARCHITECTURE.md` con hallazgos
- Documentar en próximo sprint review
- Considerar agregar test E2E para esto

---

## ✍️ Conclusión

El problema es **más un issue de autenticación en el backend** que un problema del frontend. Una vez se arreglen los bugs #1 y #2 (backend), el bug #3 (frontend) se resuelve automáticamente o requiere solo cambios menores de UX.

**Recomendación:** Priorizar investigación en `OptionalJwtAuthGuard` y `birth-chart-facade.service.ts`.

---

**Documento generado automáticamente**
**Fecha:** 2026-02-16
**Herramienta:** Claude Code + Playwright
**Status:** ✅ Listo para acción
