# Plan de Testing Integral - Página de Carta Astral

**Fecha:** Febrero 2026
**Creado por:** Claude Code
**Estado:** En Ejecución

---

## 🎯 Objetivos

Validar funcionamiento correcto de la página de Carta Astral para los 3 tipos de usuarios:
1. ✅ Usuario Anónimo (1 carta gratis de por vida)
2. ✅ Usuario Free (3 cartas/mes)
3. ✅ Usuario Premium (cartas ilimitadas)

---

## 📋 Aspectos a Testear

### 1. **Estética y Layout**
- [ ] Contenedor debe estar **centrado** (usar `container mx-auto`)
- [ ] Badge de plan debe estar **visible y centrado**
- [ ] Campos del formulario deben estar **completables y accesibles**
- [ ] No debe haber overlays/overlaps bloqueando campos
- [ ] Layout responsive en mobile

### 2. **Funcionalidad de Formulario**
- [ ] Campo "Nombre" - escribir y validar
- [ ] Campo "Fecha de nacimiento" - seleccionar fecha
- [ ] Campo "Hora de nacimiento" - seleccionar hora
- [ ] Campo "Lugar de nacimiento" - autocomplete funcionando
- [ ] Botón submit habilitado cuando formulario es válido
- [ ] Botón submit deshabilitado cuando formulario es inválido

### 3. **Plan Anónimo**
- [ ] Badge muestra "1 carta gratis"
- [ ] Genera carta correctamente
- [ ] Después de generar 1 carta, no puede generar más
- [ ] Mensaje de limite aparece: "Actualiza a Premium"
- [ ] Botón "Crear cuenta gratis" es visible
- [ ] No hay bloqueo después de 2-3 segundos (BUG REPORTADO)

### 4. **Plan Free**
- [ ] Badge muestra "Quedan X cartas este mes"
- [ ] Si remaining === 0: badge muestra 0 usos
- [ ] **BUG**: Debería mostrar "∞" o "ilimitadas" para free después de upgrade
- [ ] Formulario se bloquea cuando remaining === 0
- [ ] Mensaje de upgrade a Premium aparece
- [ ] No hay bloqueo después de 2-3 segundos (BUG REPORTADO)

### 5. **Plan Premium**
- [ ] Badge muestra "Premium • Cartas ilimitadas"
- [ ] Campo `remaining` debería ser `null` o `Infinity`
- [ ] Formulario NUNCA se bloquea
- [ ] Puede generar múltiples cartas sin límite
- [ ] Guarda cartas en historial
- [ ] No hay bloqueo después de 2-3 segundos (BUG REPORTADO)

### 6. **Integración con Backend**
- [ ] Request POST `/api/birth-chart/generate` se envía correctamente
- [ ] Response contiene datos de carta (planets, aspects, etc.)
- [ ] Manejo correcto de errores (429 Rate Limit)
- [ ] Redirección a `/carta-astral/resultado` funciona

### 7. **Límites de Uso (useCanGenerateChart)**
- [ ] Hook retorna `canGenerate: boolean`
- [ ] Hook retorna `remaining: number`
- [ ] Hook retorna `message: string`
- [ ] Lógica de validación es correcta según plan

---

## 🧪 Escenarios de Test por Plan

### **Escenario A: Usuario Anónimo**
```
1. Acceso sin autenticación
2. Badge muestra "1 carta gratis"
3. Llenar formulario con datos válidos
4. Generar primera carta → Éxito
5. Badge/mensaje cambia a "Límite alcanzado"
6. Intentar generar segunda carta → Bloqueado
7. Link "Crear cuenta gratis" visible
```

### **Escenario B: Usuario Free con Cartas Disponibles**
```
1. Login con usuario free (3 cartas/mes)
2. Badge muestra "Quedan 3 cartas este mes"
3. Llenar formulario
4. Generar 3 cartas → Todas éxito
5. Después de 3ª: Badge muestra "Quedan 0 cartas"
6. 4ª intento → Bloqueado
7. Link "Ver planes Premium" visible
```

### **Escenario C: Usuario Premium**
```
1. Login con usuario premium
2. Badge muestra "Premium • Cartas ilimitadas"
3. Generar 5+ cartas sin límite
4. Formulario SIEMPRE disponible
5. Cada carta se guarda en historial
6. NO hay bloqueo intrusivo después de 2-3 segundos
```

---

## 🐛 Bugs Identificados por Usuario

| # | Bug | Severidad | Impacto | Estado |
|---|-----|-----------|---------|--------|
| 1 | Alineación izquierda (no centrado) | Media | UX pobre | Pendiente |
| 2 | Campos no se pueden llenar | CRÍTICA | Funcional bloqueado | Pendiente |
| 3 | Free user muestra 0 en lugar de ∞ | Baja | Confusión usuario | Pendiente |
| 4 | Bloqueo después 2-3 segundos | CRÍTICA | UX completamente roto | **← INVESTIGAR PRIMERO** |

---

## ✅ Checklist de Validación

### Setup
- [ ] Ambiente dev corriendo (`npm run dev`)
- [ ] Backend accesible en `http://localhost:3000`
- [ ] Frontend accesible en `http://localhost:3001`
- [ ] Test accounts disponibles (anónimo, free, premium)

### Ejecución Tests Playwright
- [ ] `npm run test -- birth-chart.spec.ts` pasa
- [ ] `npm run test -- birth-chart-premium.spec.ts` pasa
- [ ] Cobertura ≥ 80%

### Validación Manual con Playwright MCP
- [ ] Testear anónimo
- [ ] Testear free (con cartas disponibles)
- [ ] Testear free (sin cartas disponibles)
- [ ] Testear premium
- [ ] Verificar NO hay bloqueo intrusivo

### Correcciones de Bugs
- [ ] Centro container correctamente (CSS)
- [ ] Remover bloqueo después 2-3 segundos (lógica)
- [ ] Arreglar display de remaining para free (lógica)

---

## 📊 Resultados

### Tests Existentes
- `frontend/tests/e2e/birth-chart/birth-chart.spec.ts`
- `frontend/tests/e2e/birth-chart/birth-chart-premium.spec.ts`

### Nuevos Tests a Crear (si es necesario)
- Test para bloqueo intrusivo (verificar que NO ocurra)
- Test para layout/centrado
- Test para display de remaining=0

---

## 🔍 Hallazgos de Investigación

### ✅ Problemas Identificados

**1. CRÍTICO: Error 500 en `/api/v1/birth-chart/usage`**
- **Estado:** CONFIRMADO - Errores de API en console
- **Causa Probables:**
  - OptionalJwtAuthGuard no extrae usuario autenticado correctamente
  - Token expirado o inválido
  - Problema en `usageLimitsService.getUsageByPeriod()` cuando usuario es NULL
- **Impacto:** Cuando falla, `useCanGenerateChart()` retorna `canGenerate: false`, bloqueando formulario
- **Flujo:**
  1. Página carga → ejecuta `useUsageStatus()`
  2. Query a `/birth-chart/usage` falla con 500
  3. `canGenerate = false` (porque `usage = undefined`)
  4. Campos se deshabilitan después 2-3 segundos (cuando query timeout)
  5. Usuario ve "Límite alcanzado" o "Actualiza a Premium"

**2. CONFIRMADO: Endpoint retorna usuario ANÓNIMO para usuarios PREMIUM**
- **Test:** `curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/birth-chart/usage`
- **Resultado:** `{"plan":"anonymous",...}` (aunque token es de usuario premium)
- **Causa Probable:**
  - OptionalJwtAuthGuard catch block retorna `true` pero user es NULL
  - `handleRequest` retorna NULL para usuarios autenticados también
  - O JWT está expirado/inválido
- **Impacto:** CRÍTICO - todos los usuarios autenticados se ven como anónimos

**3. CONFIRMADO: Campos deshabilitados por lógica de bloqueo**
- **Ubicación:** `page.tsx` línea 171
- **Condición:** `{canGenerate || usageLoading ? <form> : <bloqueado>}`
- **Problema:** Cuando `canGenerate = false`, muestra estado bloqueado
- **CSS:** Campos tienen atributo `[disabled]` por prop `disabled={!canGenerate || usageLoading}`

### 🎯 Árbol de Raíz

```
Usuario ve campos deshabilitados
    ↓
disabled={!canGenerate || usageLoading}
    ↓
canGenerate = false
    ↓
usage?.remaining > 0 es FALSE
    ↓
usage es NULL o remaining === 0
    ↓
useUsageStatus query falla o retorna error
    ↓
GET /api/v1/birth-chart/usage devuelve 500 o retorna plan:anonymous
    ↓
[RAÍZ 1] OptionalJwtAuthGuard no autentica usuario autenticado
[RAÍZ 2] JWT token expirado o inválido
[RAÍZ 3] usageLimitsService.getUsageByPeriod() falla en línea 211
```

### 📋 Archivos Afectados

| Archivo | Problema | Línea |
|---------|----------|-------|
| `frontend/src/app/carta-astral/page.tsx` | Lógica de bloqueo por `canGenerate=false` | 171-180 |
| `frontend/src/hooks/api/useBirthChart.ts` | Hook retorna `canGenerate=false` cuando `usage=undefined` | 192 |
| `backend/.../birth-chart-facade.service.ts` | Llama a `getUsageByPeriod()` que puede fallar | 211 |
| `backend/.../usage-limits.service.ts` | `getUsageByPeriod()` puede fallar si user no existe | 98-131 |
| `backend/.../optional-jwt-auth.guard.ts` | Guard puede retornar user=null incluso con token válido | 27-30 |

---

## ✅ Próximos Pasos (Plan de Acción)

1. **[URGENTE] Debuggear OptionalJwtAuthGuard**
   - Verificar si está extrayendo usuario correctamente
   - Revisar configuración JWT en módulo
   - Test con token válido vs expirado

2. **Revisar usageLimitsService.getUsageByPeriod()**
   - Añadir error handling para caso cuando user es NULL
   - Validar que la query SQL es correcta

3. **Testear en browser (Playwright)**
   - Anónimo: debe permitir 1 carta
   - Free: debe permitir 3 cartas/mes
   - Premium: debe permitir cartas ilimitadas
   - Verificar que NO hay bloqueo después 2-3 segundos

4. **Arreglar CSS si es necesario**
   - Verificar centrado (usa `container mx-auto`)
   - Revisar si hay overlays bloqueando campos

5. **Ejecutar tests de regresión**
   - `npm run test -- birth-chart.spec.ts`
   - Verificar coverage ≥ 80%
