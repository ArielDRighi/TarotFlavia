# 🐛 Bug Fixes Backlog - Auguria MVP

> 📋 **Propósito:** Backlog de correcciones de bugs encontrados durante QA manual (rama `qa/integration-testing`).

**Fecha de Creación:** 17 Diciembre 2025  
**Origen:** QA Testing Manual - Fase Auth/Perfil/Navegación  
**Total de Bugs:** 10 (1 Crítico, 8 Altos, 1 Medio)

---

## 📊 Resumen Ejecutivo

### Bugs por Prioridad

| Prioridad  | Cantidad | IDs        |
| ---------- | -------- | ---------- |
| 🔴 Crítico | 1        | #C001      |
| 🟠 Alto    | 8        | #A001-A008 |
| 🟡 Medio   | 1        | #M001      |
| **TOTAL**  | **10**   | -          |

### Distribución Backend vs Frontend

| Área         | Cantidad    | Estimación Total |
| ------------ | ----------- | ---------------- |
| **Backend**  | 2 bugs      | ~2-3 horas       |
| **Frontend** | 7 bugs      | ~5-6 horas       |
| **Ambos**    | 1 bug       | ~1 hora          |
| **TOTAL**    | **10 bugs** | **~8-10 horas**  |

---

## 🎯 Estrategia de Corrección

### Fase 1: Blockers Críticos (Prioridad Máxima)

Bugs que impiden el uso básico del MVP.

**Orden de implementación:**

1. **#A005** - Agregar navegación a crear lectura (Frontend) - **BLOQUEANTE**
2. **#C001** - Validación de confirmación de password (Frontend)

**Estimación Fase 1:** 1.5-2 horas

---

### Fase 2: UX Critical (Alta Prioridad)

Bugs que degradan significativamente la experiencia pero permiten uso básico.

**Orden de implementación:** 3. **#A002** - Mensaje de error en login fallido (Frontend) 4. **#A003** - Cambiar contraseña (Backend + Frontend) 5. **#A006** - Ocultar "Explorar" tarotistas en MVP (Frontend) 6. **#A007** - Ocultar "Mis Sesiones" sin funcionalidad (Frontend)

**Estimación Fase 2:** 3-4 horas

---

### Fase 3: Polish & Mejoras (Media/Baja Prioridad)

Mejoras de UX y localización.

**Orden de implementación:** 7. **#A004** - Fix NaN en lecturas restantes (Frontend + Backend) ✅ 8. **#A008** - Cache no se actualiza al crear lectura (Frontend) ✅ 9. **#A001** - Agregar botón "Registrarse" en navbar (Frontend) 10. **#M001** - Traducir mensaje "Email already registered" (Backend)

**Estimación Fase 3:** 2-3 horas

---

## 📝 FASE 1: BLOCKERS CRÍTICOS

---

### ✅ BUG FIX 1.1: Agregar navegación para crear lectura (#A005) - **COMPLETADO**

**Prioridad:** 🔴 CRÍTICA - BLOQUEANTE  
**Área:** Frontend - Navigation/Home  
**Estimación:** 45-60 min  
**Tiempo Real:** 45 min  
**Dependencias:** Ninguna  
**Branch:** `fix/A005-add-reading-navigation`  
**Commit:** `d0a6b54`

#### Descripción del Bug

No existe ningún botón, enlace o call-to-action visible que permita al usuario crear una lectura de tarot (la funcionalidad principal del MVP). El usuario llega al Home después de login y no puede hacer nada.

#### Tareas de Corrección

**TAREA 1.1.1: Agregar botón CTA en Home** (Frontend)

- **Archivo:** `frontend/src/app/page.tsx`
- **Acción:**
  - Agregar botón principal "Crear Nueva Lectura" o "Consultar el Tarot"
  - Estilo destacado (primary button, grande, centrado)
  - Usar componente `Button` de shadcn/ui
  - Link a `/ritual/tirada`
- **Criterios de aceptación:**
  - [x] Botón visible inmediatamente después de login
  - [x] Click redirige a `/ritual/tirada`
  - [x] Estilo consistente con design system
  - [x] Responsive (mobile/desktop)

**TAREA 1.1.2: Agregar opción en navbar** (Frontend)

- **Archivo:** `frontend/src/components/layout/Header.tsx` o similar
- **Acción:**
  - Agregar link "Nueva Lectura" en el navbar
  - Posición: Entre logo y "Explorar" (o reemplazar "Explorar")
  - Icono: 🎴 o similar
- **Criterios de aceptación:**
  - [x] Link visible en navbar autenticado
  - [x] Funciona en mobile y desktop
  - [x] Texto "Nueva Lectura" en desktop

**Estimación:** 45-60 min

---

### ✅ BUG FIX 1.2: Validación de confirmación de password en registro (#C001)

**Prioridad:** 🔴 CRÍTICA  
**Área:** Frontend - Auth  
**Estimación:** 45-60 min  
**Dependencias:** Ninguna

#### Descripción del Bug

El formulario de registro NO valida que los campos "Contraseña" y "Confirmar Contraseña" coincidan. Permite crear usuarios con contraseñas no confirmadas, violando seguridad básica.

#### Análisis Técnico

El schema Zod está correcto con `.refine()`, pero la validación no se ejecuta. Posibles causas:

- Problema con `zodResolver` y `.refine()`
- Versión de `@hookform/resolvers/zod` incompatible
- React Hook Form no está procesando la validación customizada

#### Tareas de Corrección

**TAREA 1.2.1: Diagnosticar problema con zodResolver** (Frontend)

- **Archivo:** `frontend/src/lib/validations/auth.schemas.ts`
- **Acción:**
  1. Verificar versión de `@hookform/resolvers/zod` en package.json
  2. Revisar sintaxis del `.refine()` en `registerSchema`
  3. Agregar logs temporales para debug
- **Criterios de aceptación:**
  - [ ] Identificar causa exacta del fallo

**TAREA 1.2.2: Corregir validación de passwords** (Frontend)

- **Archivo:** `frontend/src/lib/validations/auth.schemas.ts`
- **Acción:** Implementar una de estas soluciones:

  **Opción A: Usar superRefine en lugar de refine**

  ```typescript
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
      });
    }
  });
  ```

  **Opción B: Validación manual en el componente**
  - Agregar validación custom en `RegisterForm.tsx`
  - Usar `setError()` de react-hook-form

- **Criterios de aceptación:**
  - [ ] Submit con passwords diferentes muestra error
  - [ ] Mensaje aparece bajo campo "Confirmar Contraseña"
  - [ ] Submit bloqueado hasta que passwords coincidan
  - [ ] Test manual: intentar registrar con passwords diferentes → debe fallar

**TAREA 1.2.3: Agregar test unitario** (Frontend)

- **Archivo:** `frontend/src/lib/validations/auth.schemas.test.ts` (crear si no existe)
- **Acción:**
  ```typescript
  describe('registerSchema', () => {
    it('should reject when passwords do not match', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPass456!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });
  });
  ```
- **Criterios de aceptación:**
  - [ ] Test pasa correctamente
  - [ ] Coverage ≥80%

**Estimación:** 45-60 min

---

## 📝 FASE 2: UX CRITICAL

---

### ✅ BUG FIX 2.1: Mensaje de error en login fallido (#A002) - **COMPLETADO ✅**

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Auth  
**Estimación:** 20-30 min  
**Tiempo Real:** 2.5 horas (debugging + fixes complejos)  
**Dependencias:** Ninguna  
**Branch:** `fix/A002-login-error-message`  
**Commits:** `dbb42f4`, `abf0c31`, `deceffc`, `9b15d89`, `45e1492`, `ea01ee4`, `aabe7ae`, `f2c982b`

#### Descripción del Bug

Cuando el login falla (credenciales incorrectas), el modal se resetea sin mostrar ningún mensaje de error al usuario.

#### Problema Real Identificado

Durante el debugging se descubrió que el problema NO era solo mostrar el mensaje, sino que:

1. **El interceptor de Axios intentaba refrescar el token** cuando `/auth/login` fallaba con 401
2. Como no había refresh_token válido, esto fallaba y ejecutaba `window.location.href = '/login'`
3. Esto causaba **recarga completa de página**, limpiando formulario y logs de consola
4. El mensaje de error SÍ se mostraba, pero desaparecía instantáneamente por la recarga

#### Solución Implementada

**1. Fix del Interceptor (Root Cause):**

- Modificado `axios-config.ts` para **excluir rutas `/auth/*` del refresh automático de token**
- Ahora errores 401 en login se manejan correctamente sin intentar refresh

**2. Mejoras de UX:**

- **Eliminado toast para errores 401**: Solo mensaje inline persiste (más claro)
- **Mensaje descriptivo**: "Email o contraseña incorrectos. Por favor, verifica tus credenciales e intenta nuevamente."
- **Campos NO se resetean**: Los valores permanecen para facilitar corrección
- **Estilo mejorado**: `p-4`, `rounded-lg`, `font-medium` para mejor legibilidad
- **Accesibilidad**: `aria-live="polite"` y `role="alert"`

**3. Prevención de navegación:**

- `useRef(hasNavigated)` para trackear estado de navegación
- `useEffect` que previene unmounting mientras hay error
- Delay de 100ms antes de navegación exitosa para asegurar estado

#### Tareas de Corrección

**TAREA 2.1.1: Verificar que toast.error se ejecuta** (Frontend)

- **Archivo:** `frontend/src/stores/authStore.ts`
- **Acción:**
  - Revisar método `login()` línea ~40
  - Confirmar que el `catch` está ejecutándose
  - Verificar que `toast.error()` se llama correctamente
- **Criterios de aceptación:**
  - [x] Toast se muestra solo para errores de red/servidor (NO para 401)
  - [x] Errores 401 se manejan con mensaje inline únicamente

**TAREA 2.1.2: Mejorar manejo de errores en LoginForm** (Frontend)

- **Archivo:** `frontend/src/components/features/auth/LoginForm.tsx`
- **Acción:**
  - Agregar estado local para mostrar error inline si toast falla
  - Capturar error del authStore y mostrarlo en UI
  - Asegurar que formulario NO se resetea
- **Criterios de aceptación:**
  - [x] Login fallido muestra mensaje inline descriptivo
  - [x] Mensaje persiste hasta nuevo intento de login
  - [x] Campos mantienen sus valores después de error
  - [x] Estilo consistente con otros mensajes de error
  - [x] Accesibilidad: `role="alert"` y `aria-live="polite"`
  - [x] Test manual: login con password incorrecto → ver mensaje de error legible

**TAREA 2.1.3: Fix axios interceptor** (Frontend) - **CRÍTICO**

- **Archivo:** `frontend/src/lib/api/axios-config.ts`
- **Acción:**
  - Agregar check `isAuthEndpoint` para excluir `/auth/*` del refresh de token
  - Prevenir `window.location.href = '/login'` en errores de login
- **Criterios de aceptación:**
  - [x] Errores 401 en `/auth/login` NO intentan refresh de token
  - [x] Página NO se recarga al fallar login
  - [x] Formulario mantiene estado después de error 401

**Tests Agregados:**

- ✅ Verificar mensaje de error se muestra
- ✅ Verificar mensaje se limpia en nuevo intento
- ✅ Verificar campos NO se resetean después de error
- ✅ Verificar atributo aria-live para accesibilidad
- ✅ 21/21 tests pasando

**Estimación:** 20-30 min  
**Tiempo Real:** 2.5 horas (debugging complejo del interceptor)

---

### ✅ BUG FIX 2.2: Funcionalidad "Cambiar Contraseña" (#A003) - **COMPLETADO ✅**

**Prioridad:** 🟠 ALTO  
**Área:** Backend + Frontend  
**Estimación:** 1.5-2 horas  
**Tiempo Real:** 1 hora 15 min  
**Dependencias:** Ninguna  
**Branch:** `fix/A003-password-change`  
**Commits Backend:** `b472b1e` (implementación), `42b26e3` (tests)  
**Commits Frontend:** `cdf7fb1`

#### Descripción del Bug

La opción "Cambiar Contraseña" existe en UI pero retorna error "Funcionalidad no disponible en backend".

#### Solución Implementada

**BACKEND:**

1. **Creado DTO UpdatePasswordDto** con validaciones:
   - `currentPassword`: String requerido
   - `newPassword`: String con mínimo 8 caracteres
2. **Implementado UpdatePasswordUseCase**:
   - Verifica que el usuario existe
   - Valida contraseña actual con bcrypt
   - Hashea nueva contraseña
   - Actualiza en base de datos
3. **Agregado endpoint PATCH /users/me/password**:
   - Protegido con JwtAuthGuard
   - Retorna 200 con mensaje de éxito
   - Retorna 400 si contraseña actual incorrecta
   - Retorna 404 si usuario no encontrado
4. **Integrado en UsersOrchestratorService** y módulo

**FRONTEND:**

1. **Actualizado API_ENDPOINTS**:
   - Agregado `PASSWORD: '/users/me/password'`
2. **Mejorado updatePassword en user-api.ts**:
   - Usa endpoint correcto
   - Manejo específico de error 400 (contraseña incorrecta)
   - Tipo `unknown` en lugar de `any` para cumplir lint

3. **El formulario ya existía** en AccountTab.tsx y estaba correctamente implementado

#### Tareas de Corrección

**BACKEND:**

**TAREA 2.2.1: Verificar si endpoint existe** (Backend)

- **Acción:**
  - Buscar endpoint `PATCH /api/v1/users/me/password`
  - Revisar `backend/tarot-app/src/modules/users/users.controller.ts`
- **Resultado esperado:**
  - [x] Confirmado: endpoint NO existía, se implementó

**TAREA 2.2.2: Implementar/corregir endpoint change password** (Backend)

- **Archivo:** `backend/tarot-app/src/modules/users/infrastructure/controllers/users.controller.ts`
- **Acción:** Implementado endpoint completo
- **DTO:** Creado `UpdatePasswordDto` en `application/dto/update-password.dto.ts`
- **Use Case:** Creado `UpdatePasswordUseCase` con toda la lógica de validación
- **Criterios de aceptación:**
  - [x] Endpoint retorna 200 con password correcta
  - [x] Retorna 400 si currentPassword es incorrecta
  - [x] Password se actualiza en BD (hasheada)
  - [x] Build exitoso sin errores TypeScript

**FRONTEND:**

**TAREA 2.2.3: Conectar frontend con endpoint** (Frontend)

- **Archivos:**
  - `frontend/src/lib/api/endpoints.ts`
  - `frontend/src/lib/api/user-api.ts`
- **Acción:**
  - Actualizado endpoint a `/users/me/password`
  - Mejorado manejo de errores con `AxiosError` type
  - Corregido tipo `any` → `unknown`
- **Criterios de aceptación:**
  - [x] Formulario envía datos al endpoint correcto
  - [x] Muestra error si contraseña actual es incorrecta
  - [x] Lint sin errores (0 warnings)
  - [x] Type-check exitoso
  - [x] Build exitoso
  - [x] Tests 1530/1530 pasando
  - [x] Coverage 87.63% (>80%)

**Tests Verificados:**

**BACKEND:**

- ✅ Tests creados:
  - 7 tests para UpdatePasswordUseCase (todos los escenarios)
  - 3 tests para UsersController updatePassword endpoint
  - Fix tests UsersOrchestratorService (mock UpdatePasswordUseCase)
- ✅ Todos los tests pasan: 170/170 tests en módulo users
- ✅ Coverage módulo users: **81.57%** (supera 80% requerido)
  - Statements: 81.57% (509/624)
  - Branches: 79.82% (91/114)
  - Functions: 71.42% (75/105)
  - Lines: 81.17% (483/595)
- ✅ Lint: 0 errors, 0 warnings

**FRONTEND:**

- ✅ Tests pasan: 1530/1530
- ✅ Coverage: 87.63% (>80%)
- ✅ Lint: 0 errors, 0 warnings
- ✅ Type-check: sin errores
- ✅ Build: exitoso

**Estimación:** 1.5-2 horas  
**Tiempo Real:** 1 hora

---

### ✅ BUG FIX 2.3: Ocultar "Explorar" tarotistas en MVP (#A006) - **COMPLETADO ✅**

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Navigation  
**Estimación:** 15-20 min  
**Tiempo Real:** 10 min  
**Dependencias:** Ninguna  
**Branch:** `fix/A006-hide-explore-link`  
**Commit:** (pendiente)

#### Descripción del Bug

La opción "Explorar" está visible en el navbar pero el MVP solo debe trabajar con un tarotista (Flavia). Muestra contenido mockeado que confunde al usuario.

#### Solución Implementada

**Enfoque:** Comentar link "Explorar" en Header.tsx con documentación clara para futura reactivación.

**Cambios realizados:**

1. **Header.tsx**: Link "Explorar" comentado con:
   - Comentario explicativo del porqué está oculto en MVP
   - TODO para reactivar cuando haya múltiples tarotistas
   - Código preservado para fácil restauración

2. **Header.test.tsx**: Test actualizado para validar que "Explorar" NO se muestra

#### Tareas de Corrección

**TAREA 2.3.1: Ocultar link "Explorar" del navbar** (Frontend)

- **Archivo:** `frontend/src/components/layout/Header.tsx`
- **Acción:**
  - Comentado link "Explorar" con documentación
  - Preservado código para futura reactivación
- **Criterios de aceptación:**
  - [x] Link "Explorar" NO visible en navbar
  - [x] Test actualizado y pasando
  - [x] Código comentado con explicación clara
  - [x] TODO agregado para futura implementación

**Tests Verificados:**

- ✅ 1530/1530 tests pasando
- ✅ Coverage: 82.74% (>80%)
- ✅ Header.test.tsx: 17/17 tests pasando
- ✅ Test específico verifica que "Explorar" NO se muestra

**Calidad:**

- ✅ Lint: 0 errors, 0 warnings
- ✅ Type-check: sin errores
- ✅ Arquitectura: validación exitosa
- ✅ Build: exitoso

**Estimación:** 15-20 min  
**Tiempo Real:** 10 min

---

### ✅ BUG FIX 2.4: Ocultar "Mis Sesiones" sin funcionalidad (#A007) - **COMPLETADO ✅**

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Navigation  
**Estimación:** 15-20 min  
**Tiempo Real:** 10 min  
**Dependencias:** Ninguna  
**Branch:** `fix/A007-hide-sessions-link`  
**Commit:** (pendiente)

#### Descripción del Bug

La opción "Mis Sesiones" lleva a una página vacía sin datos. Si no está funcional, no debe mostrarse.

#### Análisis Realizado

**Investigación de endpoints de sesiones:**

- Los endpoints de sesiones SÍ existen en el backend: `/tarotist/scheduling/sessions`
- Sin embargo, son **exclusivos para tarotistas** (rol tarotista)
- NO hay endpoints de sesiones para usuarios normales implementados en el MVP
- La funcionalidad de "Mis Sesiones" para usuarios está pendiente de implementación

**Decisión:** Ocultar el link "Mis Sesiones" siguiendo el mismo patrón de "Explorar" (#A006).

#### Tareas de Corrección

**TAREA 2.4.1: Evaluar estado de funcionalidad de sesiones** (Análisis)

- **Acción:**
  - Revisar si backend tiene endpoints de sesiones
  - Revisar si hay datos de sesiones en BD
  - Decidir: ¿Ocultar o implementar estado vacío apropiado?
- **Resultado:**
  - [x] Endpoints existen solo para tarotistas (`/tarotist/scheduling/sessions`)
  - [x] Para usuarios normales NO hay funcionalidad de sesiones
  - [x] Decisión: Ocultar link hasta implementar feature

**TAREA 2.4.2: Ocultar "Mis Sesiones" del navbar** (Frontend)

- **Archivo:** `frontend/src/components/layout/Header.tsx`
- **Acción:**
  - Comentado link "Mis Sesiones" con documentación clara
  - Preservado código para futura reactivación
  - Agregado comentario explicando que endpoints son solo para tarotistas
- **Criterios de aceptación:**
  - [x] Link NO visible en navbar
  - [x] Test actualizado y pasando
  - [x] Código comentado con explicación clara
  - [x] TODO agregado para futura implementación

**Tests Verificados:**

- ✅ 1530/1530 tests pasando
- ✅ Coverage: 82.74% (>80%)
- ✅ Header.test.tsx: 17/17 tests pasando
- ✅ Test específico verifica que "Mis Sesiones" NO se muestra

**Calidad:**

- ✅ Lint: 0 errors, 0 warnings
- ✅ Type-check: sin errores
- ✅ Arquitectura: validación exitosa
- ✅ Build: exitoso

**Estimación:** 15-20 min  
**Tiempo Real:** 10 min

---

## 📝 FASE 3: POLISH & MEJORAS

---

### ✅ BUG FIX 3.1: Fix NaN en "Lecturas restantes hoy" (#A004) - **COMPLETADO ✅**

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Profile  
**Estimación:** 30-45 min  
**Tiempo Real:** 25 min  
**Dependencias:** Ninguna  
**Branch:** `fix/A004-nan-lecturas-restantes`  
**Commit:** `59894d4`

#### Descripción del Bug

La sección "Estadísticas de Uso" en pestaña Suscripción muestra "Lecturas restantes hoy: NaN" y "Lecturas realizadas hoy: /".

#### Análisis de Causa Raíz

**Problema identificado:**

- El backend endpoint `/users/profile` **NO envía** los campos `dailyReadingsCount` y `dailyReadingsLimit`
- El frontend intentaba acceder a estos campos undefined, resultando en `NaN` al hacer operaciones matemáticas
- La entidad `User` en backend no tiene estos campos (son calculados en runtime en el comentario del tipo)

**Decisión de implementación:**

- **Frontend:** Agregar defensive guards y fallbacks a 0
- **Backend:** NO modificado (campos no están implementados en MVP)
- Solución temporal hasta que backend implemente estos campos

#### Solución Implementada

**Cambios en SubscriptionTab.tsx:**

1. **Agregado `useMemo` para valores calculados**:
   - `dailyReadingsCount`: Fallback a 0 si undefined/null/NaN
   - `dailyReadingsLimit`: Fallback a 0 si undefined/null/NaN
   - `lecturesRemaining`: Calculo seguro (limit - count), clamped a 0
   - `progressPercentage`: Evita división por cero

2. **Validaciones defensivas**:

   ```typescript
   const dailyReadingsCount = useMemo(() => {
     const count = profile.dailyReadingsCount;
     return typeof count === 'number' && !isNaN(count) ? count : 0;
   }, [profile.dailyReadingsCount]);
   ```

3. **UI actualizada**:
   - Usa variables calculadas en lugar de acceso directo
   - Nunca muestra "NaN" al usuario
   - Progress bar siempre con porcentaje válido

#### Tareas de Corrección

**TAREA 3.1.1: Investigar origen de datos** (Frontend)

- **Archivo:** `frontend/src/components/features/profile/SubscriptionTab.tsx`
- **Acción:**
  - Identificar de dónde vienen `planLimit` y `lecturesUsed`
  - Verificar respuesta de API `/users/me`
  - Revisar si backend envía estos datos
- **Resultado:**
  - [x] Backend NO envía estos campos
  - [x] Entidad User no tiene estos campos en BD
  - [x] Son campos calculados (documentados en types pero no implementados)

**TAREA 3.1.2: Agregar validación y fallbacks** (Frontend)

- **Archivo:** `frontend/src/components/features/profile/SubscriptionTab.tsx`
- **Acción:**
  - Implementado `useMemo` para valores calculados
  - Defensive guards para undefined/null/NaN
  - Fallback a 0 en todos los casos
- **Criterios de aceptación:**
  - [x] Nunca muestra "NaN"
  - [x] Muestra "0" si datos no disponibles
  - [x] Muestra valores correctos si datos existen
  - [x] Sin errores en consola

**TAREA 3.1.3: Verificar backend envía datos correctos** (Backend - opcional)

- **Acción:**
  - Backend ahora SÍ envía `dailyReadingsCount` y `dailyReadingsLimit`
  - Implementado en endpoint `/users/profile`
  - Integra `UsageLimitsService` y `PlanConfigService`
- **Criterios de aceptación:**
  - [x] Response incluye campos `dailyReadingsCount` y `dailyReadingsLimit`
  - [x] Cálculo correcto: `count = limit - remaining`
  - [x] Maneja planes ilimitados (-1 → 999999)
  - [x] Tests backend: 38/38 pasando

**Implementación Backend (Completada):**

- **Archivo modificado:** `backend/tarot-app/src/modules/users/infrastructure/controllers/users.controller.ts`
- **Cambios:**
  - Inyectado `UsageLimitsService` y `PlanConfigService`
  - Método `getProfile()` ahora calcula y retorna:
    - `dailyReadingsLimit`: Límite según plan del usuario
    - `dailyReadingsCount`: Lecturas realizadas hoy (limit - remaining)
  - Planes ilimitados (premium/professional) retornan 999999 como límite
- **Tests agregados:**
  - Test con plan FREE (lecturas limitadas)
  - Test con plan PREMIUM (lecturas ilimitadas)
  - Test con usuario no encontrado
- **Commit backend:** `3288919`

#### Resultado Final

✅ **Fix completo implementado en backend + frontend:**

1. **Frontend:** Defensive guards previenen NaN (commit `59894d4`)
2. **Backend:** Endpoint `/users/profile` ahora envía datos reales (commit `3288919`)
3. **Usuario verá:**
   - Plan FREE: "Lecturas realizadas hoy: X / 3" (datos reales del backend)
   - Plan PREMIUM: "Lecturas realizadas hoy: X / 999999" (ilimitado)
   - Sin errores NaN ✅

**Estimación:** 30-45 min  
**Tiempo Real:** 25 min (frontend) + 30 min (backend) = **55 min total**

---

### ✅ BUG FIX 3.2: Agregar botón "Registrarse" en navbar (#A001) - **COMPLETADO ✅**

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Navigation  
**Estimación:** 30 min  
**Tiempo Real:** 20 min  
**Dependencias:** Ninguna  
**Branch:** `fix/A001-add-register-button`  
**Commit:** `470e1b5`

#### Descripción del Bug

Solo existe botón "Iniciar Sesión" en navbar. No hay forma obvia de registrarse para usuarios nuevos.

#### Solución Implementada

**Cambios en UserMenu.tsx:**

1. **Agregado botón "Registrarse"** junto a "Iniciar Sesión"
2. **Estilo diferenciado:**
   - `Registrarse`: variant="default" (primario, más destacado)
   - `Iniciar Sesión`: variant="outline" (secundario)
3. **Layout responsive:** Ambos botones en contenedor flex con gap-2
4. **Condicional:** Solo visible cuando user === null (no autenticado)

#### Tareas de Corrección

**TAREA 3.2.1: Agregar botón "Registrarse"** (Frontend)

- **Archivo:** `frontend/src/components/layout/UserMenu.tsx`
- **Acción:**
  - Agregado botón "Registrarse" junto a "Iniciar Sesión"
  - Estilo: Botón primario (más destacado que "Iniciar Sesión")
  - Link a `/registro`
- **Criterios de aceptación:**
  - [x] Botón visible en navbar (solo cuando NO autenticado)
  - [x] Estilo diferenciado (primary vs secondary)
  - [x] Responsive mobile/desktop
  - [x] Tests actualizados (Header.test.tsx y UserMenu.test.tsx)

#### Tests Verificados

**Header.test.tsx:**

- ✅ Test: "should show Registrarse button when not authenticated"
- ✅ Test: "should render Registrarse as primary button (more prominent)"
- ✅ Test: "should NOT show Registrarse button when authenticated"

**UserMenu.test.tsx:**

- ✅ Test: "should render Registrarse button when not authenticated"

**Calidad:**

- ✅ Tests: 1538/1538 pasando
- ✅ Coverage: 82.84% (>80%)
- ✅ Lint: 0 errors, 0 warnings
- ✅ Type-check: sin errores
- ✅ Arquitectura: validación exitosa

**Estimación:** 30 min  
**Tiempo Real:** 20 min

---

### ✅ BUG FIX 3.3: Traducir mensaje "Email already registered" (#M001) - **COMPLETADO ✅**

**Prioridad:** 🟡 MEDIO  
**Área:** Backend  
**Estimación:** 15-20 min  
**Tiempo Real:** 10 min  
**Dependencias:** Ninguna  
**Branch:** `fix/M001-translate-email-registered`  
**Commit:** `01f51cd`

#### Descripción del Bug

Mensaje de error al registrar email duplicado aparece en inglés: "Email already registered".

#### Solución Implementada

**Decisión:** Traducir mensaje en backend (fuente de verdad), beneficiando a todos los clientes.

**Archivos modificados:**

1. **Backend:**
   - `src/modules/users/application/use-cases/create-user.use-case.ts`: Mensaje cambiado a "El email ya está registrado"
   - `src/modules/users/users.service.ts`: Mensaje cambiado a "El email ya está registrado"
   - Tests actualizados en ambos archivos

2. **Frontend:**
   - NO requirió cambios: `authStore.ts` ya tiene mapeo correcto que toma mensaje del backend
   - El toast.error() mostrará automáticamente el mensaje traducido

#### Tareas de Corrección

**TAREA 3.3.1: Localizar origen del mensaje** (Análisis)

- **Acción:**
  - Verificado origen en backend usando `grep -r "Email already registered"`
  - Encontrado en 2 archivos:
    - `create-user.use-case.ts` (línea 32)
    - `users.service.ts` (línea 45)
- **Resultado:**
  - [x] Mensaje originado en backend

**TAREA 3.3.2: Traducir mensaje en backend** (Backend)

- **Archivos:**
  - `backend/tarot-app/src/modules/users/application/use-cases/create-user.use-case.ts`
  - `backend/tarot-app/src/modules/users/users.service.ts`
  - Tests: `create-user.use-case.spec.ts` y `users.service.spec.ts`
- **Acción:**
  - Cambiado mensaje a: "El email ya está registrado"
  - Actualizados tests para usar mensaje en español
- **Criterios de aceptación:**
  - [x] Mensaje en español en backend
  - [x] Consistente con resto de la app
  - [x] Tests backend: 216/216 pasando
  - [x] Tests frontend: 19/19 pasando (authStore)
  - [x] Lint: 0 errors, 0 warnings (backend + frontend)
  - [x] Type-check: sin errores
  - [x] Arquitectura: validación exitosa

**Tests Verificados:**

**Backend:**

- ✅ 216/216 tests pasando en módulo users
- ✅ Tests `CreateUserUseCase` con mensaje en español
- ✅ Tests `UsersService` con mensaje en español
- ✅ Lint: 0 errors, 0 warnings

**Frontend:**

- ✅ 19/19 tests pasando en `authStore.test.ts`
- ✅ El authStore ya maneja correctamente mensajes del backend
- ✅ Lint: 0 errors, 0 warnings
- ✅ Type-check: sin errores
- ✅ Arquitectura: validación exitosa

**Resultado:**

- Usuario verá: "El email ya está registrado" en español ✅
- Cambio centralizado en backend beneficia a todos los clientes ✅

**Estimación:** 15-20 min  
**Tiempo Real:** 10 min

---

### ✅ BUG FIX 3.4: Cache no se actualiza al crear lectura (#A008) - **COMPLETADO ✅**

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - State Management  
**Estimación:** 30 min  
**Tiempo Real:** 30 min  
**Dependencias:** #A004 (Backend debe enviar dailyReadingsCount)  
**Branch:** `fix/A004-nan-lecturas-restantes` (mismo branch que #A004)  
**Commit Frontend:** `a88f195`  
**Commit Backend:** `4f8ec0d` (fix circular dependency)

#### Descripción del Bug

Después de crear una nueva lectura, el contador de "Lecturas realizadas hoy" en la pestaña "Estadísticas de Uso" no se actualiza automáticamente. El usuario debe refrescar la página manualmente para ver el contador actualizado.

#### Análisis de Causa Raíz

**Problema identificado:**

- `useCreateReading()` solo invalida queries de TanStack Query (`readingQueryKeys.all`)
- Los datos del perfil del usuario (que incluyen `dailyReadingsCount`) están en **Zustand** (`authStore`), no en TanStack Query
- Zustand no se entera de que debe refrescar los datos después de crear una lectura
- El componente `SubscriptionTab` usa `useAuth()` → `authStore.user` (cache estática hasta que llames `checkAuth()`)

**Por qué pasa:**

1. Usuario crea lectura → `useCreateReading.mutate()`
2. Backend guarda lectura y actualiza contador interno
3. Frontend invalida queries de lecturas ✅
4. Frontend NO actualiza `authStore` ❌
5. Componente `SubscriptionTab` muestra datos viejos de `authStore`

#### Solución Implementada

**Cambios en useReadings.ts:**

1. **Importar authStore**:

   ```typescript
   import { useAuthStore } from '@/stores/authStore';
   ```

2. **Modificar `useCreateReading()` para refrescar perfil**:

   ```typescript
   export function useCreateReading() {
     const queryClient = useQueryClient();
     const checkAuth = useAuthStore((state) => state.checkAuth);

     return useMutation({
       mutationFn: (data: CreateReadingDto) => createReading(data),
       onSuccess: async () => {
         queryClient.invalidateQueries({ queryKey: readingQueryKeys.all });
         // Refresh user profile to update daily readings count
         await checkAuth();
         toast.success('Lectura creada exitosamente');
       },
       ...
     });
   }
   ```

3. **Actualizar test en useReadings.test.tsx**:
   - Mock de `useAuthStore` para simular `checkAuth`
   - Verificar que `checkAuth()` se llama después de crear lectura exitosamente
   - Verificar que NO se llama si hay error

#### Tareas de Corrección

**TAREA 3.4.1: Agregar llamada a checkAuth en useCreateReading** (Frontend)

- **Archivo:** `frontend/src/hooks/api/useReadings.ts`
- **Acción:**
  - Importar `useAuthStore`
  - Obtener `checkAuth` del store
  - Llamar `await checkAuth()` en `onSuccess`
- **Criterios de aceptación:**
  - [x] Importa authStore correctamente
  - [x] Llama `checkAuth()` después de crear lectura
  - [x] No bloquea el flujo (usa `await` dentro de `onSuccess`)

**TAREA 3.4.2: Actualizar tests** (Frontend)

- **Archivo:** `frontend/src/hooks/api/useReadings.test.tsx`
- **Acción:**
  - Mock de `useAuthStore`
  - Simular `checkAuth` con `vi.fn()`
  - Verificar que se llama en test exitoso
  - Verificar que NO se llama en test de error
- **Criterios de aceptación:**
  - [x] Mock de `useAuthStore` funciona
  - [x] Test "should create reading successfully" verifica `checkAuth()` llamado
  - [x] Test de error verifica que NO se llama
  - [x] Todos los tests pasan (20/20)

#### Resultado Final

✅ **Fix implementado:**

1. **Frontend:** `useCreateReading()` ahora refresca perfil automáticamente
2. **Usuario verá:** Contador actualizado sin necesidad de refresh manual
3. **Tests:** 20/20 pasando en `useReadings.test.tsx`

**Flujo después del fix:**

1. Usuario crea lectura → `useCreateReading.mutate()`
2. Backend guarda lectura ✅
3. Frontend invalida queries de lecturas ✅
4. Frontend llama `checkAuth()` → refresca datos del usuario ✅
5. `SubscriptionTab` muestra contador actualizado automáticamente ✅

**Estimación:** 30 min  
**Tiempo Real:** 30 min

---

## 📊 Resumen de Estimaciones

### Por Fase

| Fase                    | Bugs       | Estimación    |
| ----------------------- | ---------- | ------------- |
| **Fase 1: Blockers**    | 2 bugs     | 1.5-2 horas   |
| **Fase 2: UX Critical** | 4 bugs     | 3-4 horas     |
| **Fase 3: Polish**      | 3 bugs     | 2-3 horas     |
| **TOTAL**               | **9 bugs** | **7-9 horas** |

### Por Área

| Área               | Bugs  | Tareas        | Estimación    |
| ------------------ | ----- | ------------- | ------------- |
| Frontend Only      | 6     | 12 tareas     | 4-5 horas     |
| Backend Only       | 1     | 2 tareas      | 1 hora        |
| Backend + Frontend | 2     | 5 tareas      | 2-3 horas     |
| **TOTAL**          | **9** | **19 tareas** | **7-9 horas** |

---

## ✅ Criterios de Aceptación Global

Antes de dar por terminado el backlog de fixes:

- [ ] Todos los bugs 🔴 Críticos corregidos
- [ ] Al menos 90% de bugs 🟠 Altos corregidos
- [ ] Tests manuales de regresión pasados
- [ ] Sin errores en consola del navegador
- [ ] Sin warnings de React
- [ ] Build de producción exitoso (sin errors)
- [ ] Coverage de tests ≥80%

---

## 🔄 Workflow de Implementación

### Para cada bug:

1. **Crear branch:** `fix/A005-add-reading-navigation`
2. **Implementar fix** siguiendo tareas del backlog
3. **Testing manual** según criterios de aceptación
4. **Commit:** `fix(navigation): add button to create reading (#A005)`
5. **Merge** a `qa/integration-testing`
6. **Actualizar** este documento marcando como ✅ COMPLETADO
7. **Re-test** en QA_TESTING_TRACKER.md

---

## 📝 Notas Finales

- Este backlog se ejecutará **desde la rama `qa/integration-testing`**
- Cada fix debe probarse manualmente antes de marcar como completo
- Actualizar estadísticas en QA_TESTING_TRACKER.md al resolver cada bug
- Considerar agregar tests automatizados para evitar regresiones

---

**Última actualización:** 17 Diciembre 2025
