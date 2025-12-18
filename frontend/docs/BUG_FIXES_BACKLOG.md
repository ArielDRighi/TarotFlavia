# 🐛 Bug Fixes Backlog - TarotFlavia MVP

> 📋 **Propósito:** Backlog de correcciones de bugs encontrados durante QA manual (rama `qa/integration-testing`).

**Fecha de Creación:** 17 Diciembre 2025  
**Origen:** QA Testing Manual - Fase Auth/Perfil/Navegación  
**Total de Bugs:** 9 (1 Crítico, 7 Altos, 1 Medio)

---

## 📊 Resumen Ejecutivo

### Bugs por Prioridad

| Prioridad  | Cantidad | IDs        |
| ---------- | -------- | ---------- |
| 🔴 Crítico | 1        | #C001      |
| 🟠 Alto    | 7        | #A001-A007 |
| 🟡 Medio   | 1        | #M001      |
| **TOTAL**  | **9**    | -          |

### Distribución Backend vs Frontend

| Área         | Cantidad   | Estimación Total |
| ------------ | ---------- | ---------------- |
| **Backend**  | 2 bugs     | ~2-3 horas       |
| **Frontend** | 6 bugs     | ~4-5 horas       |
| **Ambos**    | 1 bug      | ~1 hora          |
| **TOTAL**    | **9 bugs** | **~7-9 horas**   |

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

**Orden de implementación:** 7. **#A004** - Fix NaN en lecturas restantes (Frontend + validación) 8. **#A001** - Agregar botón "Registrarse" en navbar (Frontend) 9. **#M001** - Traducir mensaje "Email already registered" (Backend)

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

### ✅ BUG FIX 2.3: Ocultar "Explorar" tarotistas en MVP (#A006)

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Navigation  
**Estimación:** 15-20 min  
**Dependencias:** Ninguna

#### Descripción del Bug

La opción "Explorar" está visible en el navbar pero el MVP solo debe trabajar con un tarotista (Flavia). Muestra contenido mockeado que confunde al usuario.

#### Tareas de Corrección

**TAREA 2.3.1: Ocultar link "Explorar" del navbar** (Frontend)

- **Archivo:** `frontend/src/components/layout/Header.tsx` o navbar component
- **Acción:**
  - Comentar o eliminar el link "Explorar"
  - O agregar feature flag para MVP: `if (!isMVP) { <Link>Explorar</Link> }`
- **Criterios de aceptación:**
  - [ ] Link "Explorar" NO visible en navbar
  - [ ] Acceso directo a `/explorar` redirige a Home (opcional)

**Estimación:** 15-20 min

---

### ✅ BUG FIX 2.4: Ocultar "Mis Sesiones" sin funcionalidad (#A007)

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Navigation  
**Estimación:** 15-20 min  
**Dependencias:** Ninguna

#### Descripción del Bug

La opción "Mis Sesiones" lleva a una página vacía sin datos. Si no está funcional, no debe mostrarse.

#### Tareas de Corrección

**TAREA 2.4.1: Evaluar estado de funcionalidad de sesiones** (Análisis)

- **Acción:**
  - Revisar si backend tiene endpoints de sesiones
  - Revisar si hay datos de sesiones en BD
  - Decidir: ¿Ocultar o implementar estado vacío apropiado?

**TAREA 2.4.2: Ocultar "Mis Sesiones" del navbar** (Frontend)

- **Archivo:** `frontend/src/components/layout/Header.tsx` o navbar component
- **Acción:**
  - Comentar o eliminar el link "Mis Sesiones"
  - O mostrar con badge "Próximamente" (disabled)
- **Criterios de aceptación:**
  - [ ] Link NO visible o claramente marcado como "próximamente"

**Estimación:** 15-20 min

---

## 📝 FASE 3: POLISH & MEJORAS

---

### ✅ BUG FIX 3.1: Fix NaN en "Lecturas restantes hoy" (#A004)

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Profile  
**Estimación:** 30-45 min  
**Dependencias:** Ninguna

#### Descripción del Bug

La sección "Estadísticas de Uso" en pestaña Suscripción muestra "Lecturas restantes hoy: NaN" y "Lecturas realizadas hoy: /".

#### Tareas de Corrección

**TAREA 3.1.1: Investigar origen de datos** (Frontend)

- **Archivo:** `frontend/src/components/features/profile/SubscriptionTab.tsx`
- **Acción:**
  - Identificar de dónde vienen `planLimit` y `lecturesUsed`
  - Verificar respuesta de API `/users/me`
  - Revisar si backend envía estos datos

**TAREA 3.1.2: Agregar validación y fallbacks** (Frontend)

- **Archivo:** `frontend/src/components/features/profile/SubscriptionTab.tsx`
- **Acción:**
  ```typescript
  const lecturesRemaining = useMemo(() => {
    const limit = user?.planLimit ?? 0;
    const used = user?.lecturesUsedToday ?? 0;
    const remaining = limit - used;
    return remaining >= 0 ? remaining : 0;
  }, [user]);
  ```
- **Criterios de aceptación:**
  - [ ] Nunca muestra "NaN"
  - [ ] Muestra "0" si datos no disponibles
  - [ ] Muestra valores correctos si datos existen
  - [ ] Sin errores en consola

**TAREA 3.1.3: Verificar backend envía datos correctos** (Backend - opcional)

- **Acción:**
  - Si backend NO envía `planLimit` y `lecturesUsedToday`, agregarlos a respuesta de `/users/me`
- **Criterios de aceptación:**
  - [ ] Response incluye campos necesarios

**Estimación:** 30-45 min

---

### ✅ BUG FIX 3.2: Agregar botón "Registrarse" en navbar (#A001)

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Navigation  
**Estimación:** 30 min  
**Dependencias:** Ninguna

#### Descripción del Bug

Solo existe botón "Iniciar Sesión" en navbar. No hay forma obvia de registrarse para usuarios nuevos.

#### Tareas de Corrección

**TAREA 3.2.1: Agregar botón "Registrarse"** (Frontend)

- **Archivo:** `frontend/src/components/layout/Header.tsx` o navbar
- **Acción:**
  - Agregar botón "Registrarse" junto a "Iniciar Sesión"
  - Estilo: Botón primario (más destacado que "Iniciar Sesión")
  - Link a `/registro`
- **Criterios de aceptación:**
  - [ ] Botón visible en navbar (solo cuando NO autenticado)
  - [ ] Estilo diferenciado (primary vs secondary)
  - [ ] Responsive mobile/desktop

**Estimación:** 30 min

---

### ✅ BUG FIX 3.3: Traducir mensaje "Email already registered" (#M001)

**Prioridad:** 🟡 MEDIO  
**Área:** Backend (o Frontend)  
**Estimación:** 15-20 min  
**Dependencias:** Ninguna

#### Descripción del Bug

Mensaje de error al registrar email duplicado aparece en inglés: "Email already registered".

#### Tareas de Corrección

**TAREA 3.3.1: Localizar origen del mensaje** (Análisis)

- **Acción:**
  - Verificar si viene de backend o frontend
  - Buscar en código: `grep -r "Email already registered"`

**TAREA 3.3.2: Traducir mensaje** (Backend o Frontend)

- **Opción A - Backend:**
  - **Archivo:** `backend/tarot-app/src/modules/auth/.../register.use-case.ts`
  - Cambiar mensaje a: "El email ya está registrado"
- **Opción B - Frontend:**
  - **Archivo:** `frontend/src/stores/authStore.ts`
  - Mapear error en español:
    ```typescript
    const message =
      error.response?.data?.message === 'Email already registered'
        ? 'El email ya está registrado'
        : error.response?.data?.message || 'Error al crear la cuenta';
    ```

- **Criterios de aceptación:**
  - [ ] Mensaje en español
  - [ ] Consistente con resto de la app

**Estimación:** 15-20 min

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
