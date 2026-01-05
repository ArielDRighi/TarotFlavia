# Resumen de Exploración E2E - Aplicación Tarot

**Fecha:** 2026-01-05
**Explorador:** Claude Code con Playwright MCP
**Usuario explorado:** FREE (`free@test.com`)

---

## 📊 Resumen Ejecutivo

Se realizó exploración E2E del flujo de creación de lectura para usuario FREE, detectando **4 errores críticos** en el flujo de la aplicación. Se creó documentación completa y suite de tests E2E con el flujo esperado correcto.

### ✅ Lo que funciona
- Login y autenticación
- Carta del Día (funciona perfectamente)
- Navegación básica

### ❌ Lo que NO funciona
- Redirección post-login incorrecta (va a /perfil en lugar de /)
- Usuario FREE ve categorías y preguntas (no debería)
- Páginas de selección de tiradas y cartas no existen o están incompletas
- Flujo completo de creación de lectura está roto

---

## 📸 Screenshots Capturados

Durante la exploración se capturaron 9 screenshots documentando el flujo:

1. `01-landing-page.png` - Landing page inicial
2. `02-login-page.png` - Formulario de login
3. `03-perfil-free-user.png` - ❌ Perfil (no debería redirigir aquí)
4. `04-ritual-categorias.png` - ❌ Categorías (FREE no debería ver esto)
5. `05-preguntas-predefinidas.png` - ❌ Preguntas (FREE no debería ver esto)
6. `06-seleccion-tirada-free.png` - Tiradas disponibles (UI correcto)
7. `07-error-tirada-no-encontrada.png` - ❌ Error "Tirada no encontrada"
8. `08-carta-del-dia.png` - ✅ Carta boca abajo (funciona)
9. `09-carta-revelada.png` - ✅ Carta revelada con info (funciona)

---

## 🐛 Errores Detectados

### **Error #1: Redirección Incorrecta Post-Login** 🔴 ALTA
**Archivo:** `frontend/src/components/features/auth/LoginForm.tsx:60`

```typescript
// ❌ ACTUAL
router.push('/perfil');

// ✅ ESPERADO
router.push('/');
```

**Impacto:** Todos los usuarios son llevados al perfil en lugar del home.

---

### **Error #2: Usuario FREE Ve Categorías** 🔴 ALTA
**Archivo:** `frontend/src/app/ritual/page.tsx`

**Problema:** Todos los usuarios ven la selección de categorías, sin distinción por plan.

**Solución:** Agregar verificación de plan y redirigir FREE automáticamente a `/ritual/tirada`.

```typescript
useEffect(() => {
  if (user && user.plan === 'FREE') {
    router.push('/ritual/tirada');
  }
}, [user, router]);
```

---

### **Error #3: Página `/ritual/tirada` No Existe** 🔴 ALTA
**Archivo faltante:** `frontend/src/app/ritual/tirada/page.tsx`

**Necesario:** Crear página de selección de spreads (tiradas) que:
- Filtre spreads según plan (FREE: 1-3 cartas, PREMIUM: todos)
- No requiera categoryId/questionId para FREE
- Mantenga categoryId/questionId para PREMIUM

---

### **Error #4: Página de Selección de Cartas Incompleta** 🟠 MEDIA
**Archivo:** `frontend/src/app/ritual/lectura/page.tsx`

**Necesario:**
- Mostrar 78 cartas boca abajo
- Permitir seleccionar N cartas según spread
- Contador de progreso
- Validación de límite de selección
- Para PREMIUM: IA siempre activa (sin checkbox)

---

## 📋 Flujos Correctos Documentados

### **Usuario FREE**
```
1. Login → Redirige a /
2. Click "Nueva Lectura" → Auto-redirige a /ritual/tirada
3. Seleccionar tirada (1 o 3 cartas)
4. Ver 78 cartas boca abajo
5. Seleccionar N cartas
6. Click "Crear Lectura"
7. Ver resultado con cartas (SIN IA)
```

### **Usuario PREMIUM**
```
1. Login → Redirige a /
2. Click "Nueva Lectura" → Ve categorías
3. Seleccionar categoría
4. Seleccionar pregunta (predefinida O personalizada)
5. Seleccionar tirada (todas disponibles)
6. Ver 78 cartas boca abajo
7. Seleccionar N cartas
8. Click "Crear Lectura"
9. Ver resultado con cartas + INTERPRETACIÓN IA (SIEMPRE)
```

**ACLARACIÓN IMPORTANTE:** PREMIUM siempre tiene interpretación IA automáticamente. No hay checkbox "Incluir interpretación IA". La IA se genera siempre para usuarios PREMIUM.

---

## 📄 Documentación Creada

### **1. FLUJO_LECTURA_CORRECTO.md** (1,360 líneas)
Documento maestro con:
- ✅ Flujo detallado por tipo de usuario (ANÓNIMO, FREE, PREMIUM)
- ✅ Errores detectados con prioridad y soluciones
- ✅ 7 tareas de implementación con criterios de aceptación
- ✅ Orden de implementación recomendado (4 sprints, 10-13 horas)
- ✅ Checklist de validación final

### **2. Tests E2E - 5 archivos** (950+ líneas total)

#### `frontend/tests/e2e/auth.spec.ts` (120 líneas)
- Login FREE redirige a home
- Login PREMIUM redirige a home
- Error con credenciales inválidas
- Estado de loading
- Logout funcional

#### `frontend/tests/e2e/reading-free.spec.ts` (260 líneas)
- FREE NO ve categorías
- FREE solo ve tiradas de 1-3 cartas
- Crear lectura de 1 carta
- Crear lectura de 3 cartas
- Validación de límite de selección
- Resultado sin IA

#### `frontend/tests/e2e/reading-premium.spec.ts` (250 líneas)
- PREMIUM ve categorías
- Usar pregunta predefinida
- Escribir pregunta personalizada
- Ver todos los spreads
- IA SIEMPRE activa automáticamente
- Flujo completo con IA

#### `frontend/tests/e2e/daily-card.spec.ts` (220 líneas)
- Usuario ANÓNIMO obtiene carta
- Usuario FREE obtiene carta
- Usuario PREMIUM obtiene carta
- Animación de flip
- Límite 1 carta por día
- Toast de éxito

#### `frontend/tests/e2e/plan-restrictions.spec.ts` (360 líneas)
- FREE no puede pregunta personalizada
- FREE no ve spreads avanzados
- FREE no tiene IA
- PREMIUM tiene todo desbloqueado
- Comparación FREE vs PREMIUM
- Validación backend

### **3. README.md para tests E2E**
Guía completa para ejecutar y mantener los tests.

---

## 🎯 7 Tareas de Implementación

### **Sprint 1: Quick Wins** (1 hora)
- ✅ **TAREA 1:** Fix login redirection (2 min)
- ✅ **TAREA 5:** Verificar seeders de spreads (15 min)
- ✅ **TAREA 2:** Redirección FREE a tiradas (15 min)
- ✅ Test Suite 1 completo

### **Sprint 2: Selección de Tiradas** (3-4 horas)
- ✅ **TAREA 6:** Crear hook useSpreads (30 min)
- ✅ **TAREA 3:** Crear página /ritual/tirada (2-3 horas)
- ✅ Test Suite 2 básico

### **Sprint 3: Selección de Cartas** (4-5 horas)
- ✅ **TAREA 7:** Crear hook useCards (20 min)
- ✅ **TAREA 4:** Página de selección de cartas (3-4 horas)
- ✅ Test Suite 2 completo
- ✅ Test Suite 3 completo

### **Sprint 4: Tests Finales** (2-3 horas)
- ✅ Test Suite 4: Carta del día
- ✅ Test Suite 5: Restricciones
- ✅ Integración y ajustes

**Tiempo total estimado: 10-13 horas**

---

## 🔑 Usuarios de Test

```bash
# FREE
Email: free@test.com
Password: Test123456!
Plan: FREE
- 2 lecturas/mes
- Solo tiradas 1-3 cartas
- Sin IA

# PREMIUM
Email: premium@test.com
Password: Test123456!
Plan: PREMIUM
- 4 lecturas/mes
- Todas las tiradas
- IA siempre activa (100 interpretaciones/mes)

# ADMIN
Email: admin@test.com
Password: Test123456!
Plan: PREMIUM + Admin
```

---

## 🚀 Próximos Pasos

### **Inmediato**
1. Revisar documento `FLUJO_LECTURA_CORRECTO.md`
2. Priorizar las 7 tareas según urgencia
3. Comenzar con Sprint 1 (Quick Wins - 1 hora)

### **Desarrollo**
1. Implementar correcciones según tareas
2. Ejecutar tests E2E después de cada corrección
3. Verificar que tests pasan progresivamente

### **Testing**
```bash
# Instalar Playwright
npm install -D @playwright/test
npx playwright install

# Ejecutar tests (fallarán hasta implementar correcciones)
npx playwright test

# Ver qué falla específicamente
npx playwright test --reporter=list
```

---

## 📊 Estado Actual de Tests

### ✅ Deberían Pasar Ahora
- Carta del día (todos los tests)
- Login básico

### ❌ Fallarán Hasta Correcciones
- Login redirection (espera / pero va a /perfil)
- Todo el flujo de creación de lectura (páginas no existen)
- Restricciones por plan (no implementadas)

---

## 🔍 Hallazgos Importantes

### **Corrección Crítica sobre IA**
**Inicial (incorrecto):** Se pensaba que PREMIUM tenía checkbox opcional "Incluir interpretación IA"

**Correcto:** PREMIUM **SIEMPRE** tiene interpretación IA automáticamente. No hay checkbox. La IA se genera en cada lectura PREMIUM y descuenta de la cuota mensual (100 interpretaciones/mes).

### **Flujo FREE vs PREMIUM**
La diferencia clave:
- **FREE:** Sin categoría → Sin pregunta → Tiradas simples → Sin IA
- **PREMIUM:** Con categoría → Con pregunta → Todas las tiradas → IA siempre

### **Carta del Día**
Es un feature separado que funciona para TODOS (anónimo, FREE, PREMIUM) y nunca incluye IA, ni siquiera para PREMIUM.

---

## 📖 Archivos Relevantes

```
d:\Personal\tarot\
├── FLUJO_LECTURA_CORRECTO.md        # Documento maestro
├── RESUMEN_EXPLORACION_E2E.md       # Este archivo
└── frontend\
    └── tests\
        └── e2e\
            ├── README.md             # Guía de tests
            ├── auth.spec.ts          # Tests autenticación
            ├── reading-free.spec.ts  # Tests FREE
            ├── reading-premium.spec.ts # Tests PREMIUM
            ├── daily-card.spec.ts    # Tests carta del día
            └── plan-restrictions.spec.ts # Tests restricciones
```

---

## ✅ Checklist de Validación Post-Correcciones

Después de implementar las 7 tareas, verificar:

### **Funcionalidad**
- [ ] Usuario FREE no ve categorías al ir a Nueva Lectura
- [ ] Usuario FREE es redirigido automáticamente a `/ritual/tirada`
- [ ] Usuario FREE solo ve spreads de 1-3 cartas
- [ ] Usuario PREMIUM ve categorías normalmente
- [ ] Usuario PREMIUM puede usar pregunta personalizada
- [ ] Usuario PREMIUM ve todas las tiradas
- [ ] Selección de cartas funciona (boca abajo, click, límite)
- [ ] Creación de lectura funciona para ambos planes
- [ ] Resultado muestra cartas correctamente
- [ ] FREE no tiene interpretación IA
- [ ] PREMIUM tiene interpretación IA SIEMPRE
- [ ] Carta del día funciona para todos
- [ ] Límite de 1 carta del día por día se respeta

### **Tests E2E**
- [ ] Todos los tests de `auth.spec.ts` pasan
- [ ] Todos los tests de `reading-free.spec.ts` pasan
- [ ] Todos los tests de `reading-premium.spec.ts` pasan
- [ ] Todos los tests de `daily-card.spec.ts` pasan
- [ ] Todos los tests de `plan-restrictions.spec.ts` pasan

### **Backend**
- [ ] Spreads están seeded correctamente
- [ ] Endpoint acepta requests sin categoryId/questionId (para FREE)
- [ ] Validaciones de plan funcionan
- [ ] Límites mensuales se respetan
- [ ] Cuota IA se descuenta correctamente para PREMIUM

---

**Exploración completada el:** 2026-01-05
**Total de errores detectados:** 4 críticos
**Total de tests E2E creados:** 50+ tests en 5 archivos
**Documentación generada:** 3 archivos (2,500+ líneas)
**Tiempo estimado de correcciones:** 10-13 horas
