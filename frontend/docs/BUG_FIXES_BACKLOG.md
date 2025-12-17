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

### ✅ BUG FIX 2.1: Mensaje de error en login fallido (#A002) - **COMPLETADO**

**Prioridad:** 🟠 ALTO  
**Área:** Frontend - Auth  
**Estimación:** 20-30 min  
**Tiempo Real:** 25 min  
**Dependencias:** Ninguna  
**Branch:** `fix/A002-login-error-message`  
**Commit:** Pendiente

#### Descripción del Bug

Cuando el login falla (credenciales incorrectas), el modal se resetea sin mostrar ningún mensaje de error al usuario.

#### Tareas de Corrección

**TAREA 2.1.1: Verificar que toast.error se ejecuta** (Frontend)

- **Archivo:** `frontend/src/stores/authStore.ts`
- **Acción:**
  - Revisar método `login()` línea ~40
  - Confirmar que el `catch` está ejecutándose
  - Verificar que `toast.error()` se llama correctamente
- **Criterios de aceptación:**
  - [x] Toast se muestra en caso de error 401

**TAREA 2.1.2: Mejorar manejo de errores en LoginForm** (Frontend)

- **Archivo:** `frontend/src/components/features/auth/LoginForm.tsx`
- **Acción:**
  - Agregar estado local para mostrar error inline si toast falla
  - Capturar error del authStore y mostrarlo en UI
- **Criterios de aceptación:**
  - [x] Login fallido muestra toast: "Email o contraseña incorrectos"
  - [x] Si toast no funciona, mostrar mensaje inline en formulario
  - [x] Test manual: login con password incorrecto → ver mensaje de error

**Estimación:** 20-30 min  
**Tiempo Real:** 25 min

---

### ✅ BUG FIX 2.2: Funcionalidad "Cambiar Contraseña" (#A003)

**Prioridad:** 🟠 ALTO  
**Área:** Backend + Frontend  
**Estimación:** 1.5-2 horas  
**Dependencias:** Ninguna

#### Descripción del Bug

La opción "Cambiar Contraseña" existe en UI pero retorna error "Funcionalidad no disponible en backend".

#### Tareas de Corrección

**BACKEND:**

**TAREA 2.2.1: Verificar si endpoint existe** (Backend)

- **Acción:**
  - Buscar endpoint `PATCH /api/v1/users/me/password`
  - Revisar `backend/tarot-app/src/modules/users/users.controller.ts`
- **Resultado esperado:**
  - [ ] Confirmar si endpoint existe o hay que crearlo

**TAREA 2.2.2: Implementar/corregir endpoint change password** (Backend)

- **Archivo:** `backend/tarot-app/src/modules/users/users.controller.ts`
- **Acción:** Si no existe, implementar:
  ```typescript
  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    // 1. Validar contraseña actual con bcrypt
    // 2. Validar nueva contraseña vs confirmación
    // 3. Hashear nueva contraseña
    // 4. Actualizar en BD
    // 5. Opcional: invalidar tokens anteriores
  }
  ```
- **DTO:** Crear `UpdatePasswordDto`:

  ```typescript
  export class UpdatePasswordDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    newPassword: string;

    @IsString()
    confirmPassword: string;
  }
  ```

- **Criterios de aceptación:**
  - [ ] Endpoint retorna 200 con password correcta
  - [ ] Retorna 401 si currentPassword es incorrecta
  - [ ] Retorna 400 si newPassword no coincide con confirmPassword
  - [ ] Password se actualiza en BD (hasheada)
  - [ ] Test manual con Postman/curl

**FRONTEND:**

**TAREA 2.2.3: Conectar frontend con endpoint** (Frontend)

- **Archivo:** `frontend/src/components/features/profile/PasswordChangeForm.tsx` o similar
- **Acción:**
  - Actualizar API call para usar endpoint correcto
  - Manejar respuestas de error apropiadamente
  - Mostrar confirmación exitosa
- **Criterios de aceptación:**
  - [ ] Formulario envía datos al endpoint correcto
  - [ ] Muestra error si contraseña actual es incorrecta
  - [ ] Muestra confirmación al cambiar exitosamente
  - [ ] Test manual: cambiar password → logout → login con nueva password

**Estimación:** 1.5-2 horas

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
