# QA Testing Tracker - TarotFlavia MVP

> 📋 **Propósito:** Documento para trackear bugs, issues y mejoras encontradas durante las pruebas de integración del MVP.

**Rama de Testing:** `qa/integration-testing`  
**Fecha de Inicio:** 16 Diciembre 2025  
**Estado:** 🟡 En Proceso

---

## 📚 DATOS DE TESTING (Información de Seeds)

### 👤 Usuarios de Prueba

**IMPORTANTE:** Todos usan la misma contraseña: `Test123456!`

| Usuario                | Email                    | Contraseña                  | Plan    | Rol              | Propósito                            |
| ---------------------- | ------------------------ | --------------------------- | ------- | ---------------- | ------------------------------------ |
| **Free User**          | `free@test.com`          | `Test123456!`               | FREE    | Consumer         | Testing con límites de plan gratuito |
| **Premium User**       | `premium@test.com`       | `Test123456!`               | PREMIUM | Consumer         | Testing con acceso completo premium  |
| **Admin User**         | `admin@test.com`         | `Test123456!`               | PREMIUM | Admin + Consumer | Testing panel admin                  |
| **Flavia (Tarotista)** | `flavia@tarotflavia.com` | `FlaviaSecurePassword2024!` | PREMIUM | Tarotist + Admin | Cuenta principal tarotista           |

### 📂 Categorías Disponibles

1. **Amor y Relaciones** (`amor-relaciones`) - ❤️ Color: #FF6B9D
2. **Carrera y Trabajo** (`carrera-trabajo`) - 💼 Color: #4A90E2
3. **Dinero y Finanzas** (`dinero-finanzas`) - 💰 Color: #F5A623
4. **Salud y Bienestar** (`salud-bienestar`) - 🏥 Color: #7ED321
5. **Crecimiento Espiritual** (`crecimiento-espiritual`) - ✨ Color: #9013FE
6. **Consulta General** (`consulta-general`) - 🔮 Color: #BD10E0

### 🃏 Tipos de Tiradas (Spreads)

| Nombre                 | Cartas | Dificultad   | Principiante | Cuándo Usar                                   |
| ---------------------- | ------ | ------------ | ------------ | --------------------------------------------- |
| **Tirada de 1 Carta**  | 1      | Beginner     | ✅           | Respuestas rápidas, carta del día             |
| **Tirada de 3 Cartas** | 3      | Beginner     | ✅           | Pasado-Presente-Futuro, panorama general      |
| **Tirada de 5 Cartas** | 5      | Intermediate | ❌           | Análisis profundo con obstáculos y recursos   |
| **Cruz Celta**         | 10     | Advanced     | ❌           | Análisis completo y profundo de una situación |

### 🎴 Mazo de Tarot

- **Total de cartas:** 78 cartas
- **Arcanos Mayores:** 22 cartas (0-21)
- **Arcanos Menores:** 56 cartas (4 palos × 14 cartas)
  - Copas (14 cartas)
  - Espadas (14 cartas)
  - Bastos (14 cartas)
  - Oros (14 cartas)

### 🌐 URLs de Testing

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

---

## 🎯 Objetivos de Testing

- [ ] Verificar flujo completo de registro/login
- [ ] Probar creación de lecturas con todas las categorías
- [ ] Validar navegación entre páginas
- [ ] Confirmar responsive design (mobile/tablet/desktop)
- [ ] Verificar manejo de errores y mensajes al usuario
- [ ] Probar funcionalidad de papelera y restauración
- [ ] Validar regeneración de interpretaciones
- [ ] Confirmar funcionamiento de compartir lecturas
- [ ] Probar edición de perfil de usuario

---

## 🐛 Issues Reportados

### 🔴 Críticos (Bloquean funcionalidad principal)

> Issues que impiden el uso básico de la aplicación

#### #C001 - Validación de contraseñas en registro NO funciona

- **Módulo:** Auth / RegisterForm
- **Descripción:** El formulario de registro permite crear usuarios incluso cuando el campo "Contraseña" y "Confirmar Contraseña" tienen valores diferentes. La validación de Zod está configurada correctamente (`registerSchema` tiene `.refine()` que compara ambos campos), pero no se está ejecutando o está siendo bypasseada. Esto es un problema de seguridad crítico ya que permite registro con contraseñas no confirmadas.
- **Pasos para reproducir:**
  1. Ir a la página de registro
  2. Llenar nombre y email válidos
  3. En campo "Contraseña" ingresar: `Password123!`
  4. En campo "Confirmar Contraseña" ingresar DIFERENTE: `DifferentPass456!`
  5. Click en "Crear Cuenta"
  6. **Resultado actual:** El usuario se crea exitosamente sin mostrar error
- **Resultado esperado:** Debería mostrar error "Las contraseñas no coinciden" en el campo "Confirmar Contraseña" y NO permitir el submit del formulario hasta que ambas contraseñas sean idénticas.
- **Screenshot/Error:** N/A
- **Código afectado:**
  - `frontend/src/lib/validations/auth.schemas.ts` (líneas 18-32) - Schema parece correcto
  - `frontend/src/components/features/auth/RegisterForm.tsx` - Uso del resolver
- **Posible causa:**
  - El `zodResolver` no está procesando el `.refine()` correctamente
  - Puede ser un problema de versión de `@hookform/resolvers/zod`
  - El formulario podría estar bypasseando la validación de alguna forma
- **Estado:** 🔴 Abierto
- **Fix:**

---

### 🟠 Altos (Afectan UX significativamente)

> Issues que degradan la experiencia pero permiten uso básico

#### #A001 - Falta botón "Registrarse" visible en navegación principal

- **Módulo:** Auth / Navigation
- **Descripción:** En la página principal (sin autenticar), solo aparece el botón "Iniciar Sesión" en el navbar. No existe un botón visible de "Registrarse" o "Crear Cuenta". Los usuarios nuevos deben hacer click en "Iniciar Sesión" y luego descubrir el link de registro dentro del modal de login. Esto genera fricción innecesaria y no sigue el estándar de la industria.
- **Pasos para reproducir:**
  1. Abrir http://localhost:3001 sin estar autenticado
  2. Observar el navbar superior
  3. Solo se ve el botón "Iniciar Sesión"
  4. No hay forma obvia de registrarse sin primero clickear "Iniciar Sesión"
- **Resultado esperado:** Debería existir un botón "Registrarse" o "Crear Cuenta" visible junto al botón "Iniciar Sesión" para facilitar la adquisición de nuevos usuarios. Opciones:
  - **Opción A (Recomendada):** Dos botones separados: [Iniciar Sesión] [Registrarse]
  - **Opción B:** Botón principal "Crear Cuenta" + link secundario "Iniciar Sesión"
  - **Opción C:** Botón único que abre modal con tabs [Login | Registro]
- **Estado:** 🔴 Abierto
- **Fix:**

---

#### #A002 - Login fallido no muestra mensaje de error al usuario

- **Módulo:** Auth / LoginForm
- **Descripción:** Cuando el usuario intenta iniciar sesión con credenciales incorrectas (email válido pero contraseña incorrecta), el backend retorna correctamente un error 401 "Credenciales inválidas", pero el frontend NO muestra ningún mensaje de error al usuario. El modal simplemente se limpia y resetea, dejando al usuario sin feedback de qué salió mal. Esto genera confusión y mala experiencia de usuario.
- **Pasos para reproducir:**
  1. Ir a página de login
  2. Ingresar email válido: `free@test.com`
  3. Ingresar contraseña INCORRECTA: `WRONG`
  4. Click "Iniciar Sesión"
  5. **Resultado actual:** El modal se resetea/limpia sin mostrar error. El usuario no sabe qué pasó.
  6. En consola del navegador (Network tab) se ve el 401 del backend
- **Resultado esperado:** Debe mostrarse un mensaje de error claro al usuario, por ejemplo:
  - Toast notification: "Email o contraseña incorrectos"
  - O mensaje inline debajo del formulario: "Las credenciales ingresadas no son válidas"
- **Código afectado:**
  - `frontend/src/stores/authStore.ts` - Método `login()` (línea ~40)
  - `frontend/src/components/features/auth/LoginForm.tsx` - Manejo de errores
- **Posible causa:**
  - El `toast.error()` en el catch del authStore no se está ejecutando
  - El error se está tragando silenciosamente
  - Hay un problema con el manejo de errores de axios
- **Estado:** 🔴 Abierto
- **Fix:**

---

#### #A003 - Funcionalidad "Cambiar Contraseña" no funciona (backend no implementado)

- **Módulo:** Profile / Password Change
- **Descripción:** En la página de perfil (`/perfil`), existe una opción visible para "Cambiar Contraseña". Al intentar usarla, el sistema muestra el mensaje de error: "Error al actualizar contraseña. Funcionalidad no disponible en backend." Esto indica que el feature está parcialmente implementado en el frontend pero falta la implementación en el backend, o el endpoint no existe/no está conectado correctamente.
- **Pasos para reproducir:**
  1. Iniciar sesión con un usuario válido (ej: `free@test.com` / `Test123456!`)
  2. Navegar a la página de perfil: http://localhost:3001/perfil
  3. Buscar la opción "Cambiar Contraseña"
  4. Intentar cambiar la contraseña (ingresar contraseña actual, nueva contraseña, confirmar)
  5. Click en "Guardar" o "Actualizar"
  6. **Resultado actual:** Error: "Funcionalidad no disponible en backend"
- **Resultado esperado:** La contraseña debería actualizarse exitosamente en la base de datos, y el usuario debería recibir confirmación. Si la funcionalidad no está lista, NO debería mostrarse en la UI.
- **Impacto:**
  - Usuario no puede cambiar su contraseña
  - Mala experiencia: el botón existe pero no funciona
  - Si un usuario olvida/compromete su password, no tiene forma de cambiarlo desde la app
- **Código afectado:**
  - Frontend: Componente de cambio de contraseña en `/perfil`
  - Backend: Endpoint `PATCH /users/me/password` (probablemente faltante o con error)
- **Posible causa:**
  - Endpoint no implementado en backend
  - Endpoint implementado pero con error
  - Ruta incorrecta en frontend
  - Falta validación o lógica de negocio en backend
- **Estado:** 🔴 Abierto
- **Fix:**

---

#### #A004 - "Lecturas restantes hoy" muestra "NaN" en Estadísticas de Uso

- **Módulo:** Profile / SubscriptionTab / Estadísticas de Uso
- **Descripción:** En la pestaña "Suscripción" del perfil, la sección "Estadísticas de Uso" muestra literalmente "NaN" en el campo "Lecturas restantes hoy: NaN". Esto indica un error en el cálculo de lecturas restantes, probablemente debido a datos faltantes o una operación matemática inválida. El error en consola confirma: "Received NaN for the `children` attribute".
- **Pasos para reproducir:**
  1. Iniciar sesión con un usuario válido (ej: `free@test.com`)
  2. Navegar a `/perfil`
  3. Click en la pestaña "Suscripción"
  4. Observar la sección "Estadísticas de Uso"
  5. **Resultado actual:**
     - "Lecturas realizadas hoy: /" (parece vacío o con valor faltante)
     - "Lecturas restantes hoy: NaN" (muestra literalmente "NaN")
- **Resultado esperado:** Debería mostrar valores numéricos válidos, por ejemplo:
  - "Lecturas realizadas hoy: 0"
  - "Lecturas restantes hoy: 5" (según el plan del usuario)
- **Impacto:**
  - Usuario no sabe cuántas lecturas puede hacer
  - Mala experiencia visual
  - Error en consola (mala práctica)
  - Información crítica del plan no disponible
- **Screenshot:** Imagen adjunta muestra "Lecturas restantes hoy: NaN"
- **Código afectado:**
  - `frontend/src/components/features/profile/SubscriptionTab.tsx`
  - Cálculo de lecturas restantes (probablemente: `planLimit - lecturesUsed`)
- **Posible causa:**
  - `planLimit` o `lecturesUsed` es `undefined` o `null`
  - Operación matemática con valores no numéricos (ej: `undefined - 0 = NaN`)
  - Falta validación/fallback para datos faltantes
  - Backend no está enviando el límite de lecturas del plan
  - Frontend no está manejando correctamente el caso de datos incompletos
- **Estado:** 🔴 Abierto
- **Fix:**

---

### 🟡 Medios (Mejoras de UX/UI)

> Issues menores que mejoran la experiencia

#### #M001 - Mensaje de error "Email already registered" en inglés (falta localización)

- **Módulo:** Auth / Register / Localización
- **Descripción:** Al intentar registrar un usuario con un email que ya existe en el sistema, el mensaje de error se muestra en inglés: "Email already registered", mientras que el resto de la aplicación está en español. Esto rompe la consistencia del idioma y genera confusión en usuarios hispanohablantes.
- **Pasos para reproducir:**
  1. Crear un usuario con email `test@example.com`
  2. Cerrar sesión
  3. Intentar registrar otro usuario con el mismo email `test@example.com`
  4. Click en "Crear Cuenta"
  5. **Resultado actual:** Mensaje en inglés: "Email already registered"
- **Resultado esperado:** Mensaje en español: "El email ya está registrado" o "Este email ya está en uso"
- **Impacto:**
  - Inconsistencia de idioma en la app
  - Puede confundir a usuarios que no hablan inglés
  - Rompe la experiencia localizada
- **Código afectado:**
  - Backend: `backend/tarot-app/src/modules/auth/.../register.use-case.ts` o controller
  - O Frontend: `frontend/src/stores/authStore.ts` método `register()`
- **Posible causa:**
  - El mensaje viene del backend en inglés
  - Falta traducción/mapeo en frontend
  - No hay sistema de i18n implementado
- **Estado:** 🔴 Abierto
- **Fix:**

---

#### #A005 - NO existe botón/enlace para crear lectura de cartas (funcionalidad principal)

- **Módulo:** Navigation / Home / UX
- **Descripción:** **CRÍTICO PARA MVP:** La funcionalidad principal de la aplicación es crear lecturas de tarot, pero NO existe ningún botón, enlace o call-to-action visible que permita al usuario acceder a esta funcionalidad. Después de iniciar sesión, el usuario llega al Home que está muy básico y no tiene forma de crear una lectura. El header solo muestra "Explorar" (tarotistas) y "Mis sesiones", pero NO hay "Nueva Lectura", "Crear Lectura" o similar.
- **Pasos para reproducir:**
  1. Iniciar sesión con cualquier usuario
  2. Llegar al Home/Dashboard
  3. Buscar en toda la UI un botón para crear lectura
  4. Revisar el header/navbar
  5. **Resultado actual:** NO existe forma visible de acceder a crear lectura
- **Resultado esperado:** Debe existir un botón prominente, fácil de encontrar para crear lecturas. Opciones:
  - Botón principal en Home: "Crear Nueva Lectura" o "Consultar el Tarot"
  - Opción en navbar: "Nueva Lectura" o "Tirada"
  - CTA (Call To Action) destacado en el centro del Home
- **Impacto:**
  - **BLOQUEANTE PARA MVP:** La funcionalidad principal no es accesible
  - Usuario no puede usar la app para su propósito principal
  - Pésima experiencia de usuario
  - El MVP no puede lanzarse sin esto
- **Código afectado:**
  - `frontend/src/app/page.tsx` (Home)
  - Layout/Header navigation
- **Estado:** 🔴 Abierto
- **Fix:**

---

#### #A006 - "Explorar" tarotistas visible en MVP (debe ocultarse - solo un tarotista)

- **Módulo:** Navigation / Marketplace
- **Descripción:** El MVP está diseñado para trabajar con UN SOLO tarotista predeterminado (Flavia), pero en el header existe una opción "Explorar" que lleva a una página de tarotistas mockeados. Esta funcionalidad de marketplace es para fases posteriores y NO debe estar visible en el MVP, ya que confunde al usuario y muestra datos falsos/mockeados.
- **Pasos para reproducir:**
  1. Iniciar sesión
  2. Observar el header/navbar
  3. Click en "Explorar"
  4. **Resultado actual:** Muestra página de tarotistas (probablemente mockeados)
- **Resultado esperado:** La opción "Explorar" NO debe estar visible en el MVP. Opciones:
  - Ocultar completamente el enlace del navbar
  - Deshabilitar la ruta `/explorar` o `/tarotistas`
  - O redirigir automáticamente a Home si alguien intenta acceder
- **Impacto:**
  - Confunde al usuario sobre el propósito del MVP
  - Muestra contenido que no está listo (mockeado)
  - Rompe la experiencia de "un tarotista predeterminado"
- **Código afectado:**
  - Layout/Header navigation
  - Rutas de la app
- **Estado:** 🔴 Abierto
- **Fix:**

---

#### #A007 - "Mis Sesiones" sin funcionalidad real (página vacía sin datos)

- **Módulo:** Sessions / Navigation
- **Descripción:** El header tiene una opción "Mis sesiones" que lleva a una página que muestra información de sesiones pero sin datos reales. Esto sugiere que la funcionalidad de sesiones programadas no está implementada o no es funcional en el MVP actual.
- **Pasos para reproducir:**
  1. Iniciar sesión
  2. Click en "Mis sesiones" en el header
  3. **Resultado actual:** Página vacía o con mensaje de "sin datos"
- **Resultado esperado:** Si la funcionalidad de sesiones no está lista para MVP:
  - Ocultar el enlace "Mis sesiones" del navbar
  - O mostrar un mensaje apropiado: "Funcionalidad próximamente"
  - Si ESTÁ lista: Debe mostrar las sesiones del usuario o estado vacío apropiado
- **Impacto:**
  - Confunde al usuario
  - Enlace que no lleva a nada funcional
  - Mala experiencia de usuario
- **Código afectado:**
  - Layout/Header navigation
  - Página de sesiones
- **Estado:** 🔴 Abierto
- **Fix:**

---

### 🟢 Bajos (Nice to have)

> Mejoras opcionales, optimizaciones

#### #B001 - [Título del Issue]

- **Módulo:**
- **Descripción:**
- **Estado:** 🔴 Abierto
- **Fix:**

---

## 📊 Estadísticas de Testing

| Prioridad  | Total | Abiertos | En Progreso | Resueltos |
| ---------- | ----- | -------- | ----------- | --------- |
| 🔴 Crítico | 1     | 1        | 0           | 0         |
| 🟠 Alto    | 7     | 7        | 0           | 0         |
| 🟡 Medio   | 1     | 1        | 0           | 0         |
| 🟢 Bajo    | 0     | 0        | 0           | 0         |
| **TOTAL**  | **9** | **9**    | **0**       | **0**     |

---

## ✅ Funcionalidades Verificadas

| Funcionalidad               | Estado        | Notas |
| --------------------------- | ------------- | ----- |
| Registro de usuario         | ⬜ No probado |       |
| Login                       | ⬜ No probado |       |
| Logout                      | ⬜ No probado |       |
| Crear lectura (Cruz Celta)  | ⬜ No probado |       |
| Crear lectura (Tres Cartas) | ⬜ No probado |       |
| Crear lectura (Una Carta)   | ⬜ No probado |       |
| Ver historial de lecturas   | ⬜ No probado |       |
| Ver detalle de lectura      | ⬜ No probado |       |
| Eliminar lectura            | ⬜ No probado |       |
| Restaurar lectura           | ⬜ No probado |       |
| Regenerar interpretación    | ⬜ No probado |       |
| Compartir lectura           | ⬜ No probado |       |
| Editar perfil               | ⬜ No probado |       |
| Cambiar contraseña          | ⬜ No probado |       |
| Responsive Mobile           | ⬜ No probado |       |
| Responsive Tablet           | ⬜ No probado |       |
| Manejo de errores           | ⬜ No probado |       |
| Loading states              | ⬜ No probado |       |

**Leyenda:**  
⬜ No probado | 🟡 En prueba | ✅ Verificado | ❌ Falla detectada

---

## 🔄 Workflow de Reporte

### 1. Encontrar Issue

Al probar la aplicación, documenta cualquier comportamiento inesperado.

### 2. Reportar en este Documento

- Asigna ID secuencial según prioridad (C001, A001, M001, B001)
- Completa todos los campos
- Marca como 🔴 Abierto

### 3. Priorizar

Determina prioridad según impacto:

- **🔴 Crítico:** Rompe funcionalidad, bloquea testing
- **🟠 Alto:** UX degradada, pero funciona
- **🟡 Medio:** Mejoras visuales/mensajes
- **🟢 Bajo:** Optimizaciones

### 4. Fix Issue

- Cambia estado a 🟡 En Progreso
- Crea commit descriptivo: `fix(module): descripción del fix (#ID)`
- Actualiza campo "Fix" con hash del commit

### 5. Verificar Fix

- Cambia estado a 🟢 Resuelto
- Actualiza estadísticas
- Re-testea funcionalidad

### 6. Actualizar Estadísticas

Mantén la tabla de estadísticas actualizada después de cada sesión de testing.

---

## 📝 Notas de Testing

### Sesión 1 - 16 Diciembre 2025

**Preparación:**

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 3001
- [ ] Base de datos PostgreSQL activa
- [ ] Variables de entorno configuradas

**Checklist de Inicio:**

- [ ] Verificar que el backend responde (`GET /api/health`)
- [ ] Verificar que el frontend carga correctamente
- [ ] Limpiar localStorage/cookies para testing fresco
- [ ] Preparar usuario de prueba

**Hallazgos:**
_(Se irán agregando durante el testing)_

---

### Sesión 2 - [Fecha]

**Hallazgos:**
_(Por agregar)_

---

## 🚀 Criterios de Aceptación para Merge

Antes de hacer merge de `qa/integration-testing` a `main`:

- [ ] Todos los issues 🔴 Críticos resueltos
- [ ] Al menos 90% de issues 🟠 Altos resueltos
- [ ] Todas las funcionalidades principales verificadas (✅)
- [ ] Testing en Chrome, Firefox, Safari
- [ ] Testing responsive (mobile/tablet)
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs del backend

---

## 🔗 Referencias

- [Frontend Architecture](./ARCHITECTURE.md)
- [Backend API Documentation](../../backend/tarot-app/docs/API_DOCUMENTATION.md)
- [Frontend Backlog](./FRONTEND_BACKLOG.md)

---

**Última actualización:** 16 Diciembre 2025
