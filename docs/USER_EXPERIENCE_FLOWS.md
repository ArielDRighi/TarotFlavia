# Experiencias de Usuario - Plataforma de Tarot

> **Documento generado:** 31 de Diciembre de 2025
> **Propósito:** Documentar la experiencia exacta de interacción de los tres tipos de usuarios con la plataforma

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Los Tres Tipos de Usuarios](#los-tres-tipos-de-usuarios)
3. [Arquitectura de Autenticación y Permisos](#arquitectura-de-autenticación-y-permisos)
4. [Experiencia: Usuario Anónimo (ANONYMOUS)](#experiencia-usuario-anónimo-anonymous)
5. [Experiencia: Usuario Registrado Gratuito (FREE)](#experiencia-usuario-registrado-gratuito-free)
6. [Experiencia: Usuario Premium (PREMIUM)](#experiencia-usuario-premium-premium)
7. [Sistema de Conversión (Funnels)](#sistema-de-conversión-funnels)
8. [Comparativa de Características](#comparativa-de-características)
9. [Rutas y Navegación](#rutas-y-navegación)
10. [Archivos de Referencia](#archivos-de-referencia)

---

## Resumen Ejecutivo

La plataforma de Tarot implementa un sistema de **tres tiers de usuario** diseñado para maximizar la conversión a través de un funnel claro: **ANONYMOUS → FREE → PREMIUM**.

### Los Tres Tipos
- **ANONYMOUS** (No registrado): Acceso mínimo para "probar" la plataforma (1 lectura/día, sin IA)
- **FREE** (Registrado sin pagar): Experiencia completa pero limitada (2 lecturas/día, sin IA, historial guardado)
- **PREMIUM** (Suscriptor pagado - $9.99/mes): Experiencia completa con IA, preguntas personalizadas, lecturas ilimitadas

### Estrategia de Conversión
El sistema de CTAs (TASK-018) está implementado para convertir usuarios en puntos estratégicos:
1. **Post primera lectura anónima** → RegisterCTAModal
2. **Al alcanzar límite diario** → LimitReachedModal
3. **Al intentar usar features premium** → UpgradeModal
4. **En resultados de lectura sin IA** → UpgradeBanner

---

## Los Tres Tipos de Usuarios

### 1. ANONYMOUS (Usuario Anónimo)

**Definición Técnica:**
- Plan: `UserPlan.ANONYMOUS`
- No tiene cuenta en la base de datos
- No tiene tokens JWT
- Ubicación: [backend/tarot-app/src/modules/users/entities/user.entity.ts:15](d:\Personal\tarot\backend\tarot-app\src\modules\users\entities\user.entity.ts#L15)

**Límites y Restricciones:**
```typescript
{
  dailyReadingsLimit: 1,        // Solo 1 Carta del Día por día
  aiQuotaMonthly: 0,            // SIN acceso a interpretaciones con IA
  maxCardsPerSpread: 1,         // Solo Carta del Día (1 carta)
  allowCustomQuestions: false,  // NO puede hacer preguntas personalizadas
  allowSharing: false,          // NO puede compartir lecturas
  hasHistory: false             // NO se guarda historial
}
```

**Propósito del Negocio:**
- Atraer usuarios para "probar" la plataforma sin fricción
- Mostrar el valor básico del producto
- Convertir a registro (FREE) después de la primera experiencia

---

### 2. FREE (Usuario Registrado Gratuito)

**Definición Técnica:**
- Plan: `UserPlan.FREE`
- Tiene cuenta en base de datos
- Autenticado con JWT tokens
- Ubicación: [backend/tarot-app/src/modules/users/entities/user.entity.ts:16](d:\Personal\tarot\backend\tarot-app\src\modules\users\entities\user.entity.ts#L16)

**Límites y Restricciones:**
```typescript
{
  dailyReadingsLimit: 2,        // 1 Carta del Día + 1 tirada de 3 cartas
  aiQuotaMonthly: 0,            // SIN acceso a IA (sin interpretaciones inteligentes)
  maxCardsPerSpread: 3,         // Máximo 3 cartas por tirada
  allowCustomQuestions: false,  // NO puede escribir preguntas personalizadas
  allowSharing: true,           // SÍ puede compartir lecturas (con token)
  hasHistory: true,             // SÍ guarda historial de lecturas
  tarotistCooldown: 30          // 30 días entre cambios de tarotista favorito
}
```

**Propósito del Negocio:**
- Crear engagement y retención con historial guardado
- Mostrar el valor completo de las tiradas (sin IA)
- Convertir a PREMIUM cuando alcancen límites o quieran interpretaciones inteligentes

---

### 3. PREMIUM (Usuario Suscriptor Pagado)

**Definición Técnica:**
- Plan: `UserPlan.PREMIUM`
- Tiene suscripción activa en Stripe
- Autenticado con JWT tokens
- Ubicación: [backend/tarot-app/src/modules/users/entities/user.entity.ts:17](d:\Personal\tarot\backend\tarot-app\src\modules\users\entities\user.entity.ts#L17)

**Límites y Restricciones:**
```typescript
{
  dailyReadingsLimit: 3,        // En realidad ILIMITADAS (3 es nominal)
  aiQuotaMonthly: -1,           // ILIMITADO (-1 = sin límite)
  maxCardsPerSpread: 10,        // Hasta 10 cartas por tirada
  allowCustomQuestions: true,   // SÍ puede escribir preguntas personalizadas
  allowSharing: true,           // SÍ puede compartir lecturas
  hasHistory: true,             // SÍ guarda historial
  tarotistCooldown: 0,          // Sin cooldown (cambios ilimitados de tarotista)
  advancedStats: true           // Acceso a estadísticas avanzadas
}
```

**Modos de Suscripción a Tarotistas:**
- `PREMIUM_INDIVIDUAL`: Elige un tarotista específico (siempre el mismo)
- `PREMIUM_ALL_ACCESS`: Tarotista aleatorio de los disponibles (evita repetir el último)

**Precio:** $9.99/mes (facturado por Stripe)

**Propósito del Negocio:**
- Monetización principal de la plataforma
- Ofrecer experiencia completa sin restricciones
- Interpretaciones con IA de alta calidad

---

## Arquitectura de Autenticación y Permisos

### Sistema de Guards (Backend)

El backend utiliza 4 guards principales para proteger rutas:

#### 1. JwtAuthGuard
**Ubicación:** [backend/tarot-app/src/modules/auth/infrastructure/guards/jwt-auth.guard.ts](d:\Personal\tarot\backend\tarot-app\src\modules\auth\infrastructure\guards\jwt-auth.guard.ts)

```typescript
// Verifica token JWT válido
// Inyecta objeto `user` en request si autenticado
// Bloquea acceso si token inválido o expirado
```

**Rutas protegidas:** Todas las rutas que requieren autenticación

---

#### 2. RolesGuard
**Ubicación:** [backend/tarot-app/src/common/guards/roles.guard.ts](d:\Personal\tarot\backend\tarot-app\src\common\guards\roles.guard.ts)

```typescript
// Verifica que el usuario tenga AL MENOS uno de los roles requeridos
// Usado con decorador: @Roles(UserRole.ADMIN, UserRole.TAROTIST)
// Lógica OR: usuario con 'admin' pasa si se requiere 'admin' O 'tarotist'
```

**Roles disponibles:**
- `CONSUMER`: Usuario que consume lecturas (default)
- `TAROTIST`: Usuario que ofrece lecturas
- `ADMIN`: Administrador del sistema

---

#### 3. CheckUsageLimitGuard
**Ubicación:** [backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.ts](d:\Personal\tarot\backend\tarot-app\src\modules\usage-limits\guards\check-usage-limit.guard.ts)

```typescript
// Valida límites diarios de lecturas
// Bloquea si usuario alcanzó su cuota diaria
// Mensaje: "Has alcanzado tu límite diario para esta función.
//           Tu cuota se restablecerá a medianoche (00:00 UTC)"
```

**Límites por plan:**
- ANONYMOUS: 1 lectura/día
- FREE: 2 lecturas/día
- PREMIUM: 3 lecturas/día (en realidad ilimitadas)

**Reset automático:** Cada día a las 00:00 UTC

---

#### 4. AIQuotaGuard
**Ubicación:** [backend/tarot-app/src/modules/ai-usage/](d:\Personal\tarot\backend\tarot-app\src\modules\ai-usage/)

```typescript
// Verifica cuota mensual de IA
// Bloquea si se alcanza hardLimit (100% para FREE, ∞ para PREMIUM)
// Envía warning al alcanzar softLimit (80% para FREE)
```

**Cuotas mensuales:**
```typescript
AI_MONTHLY_QUOTAS = {
  ANONYMOUS: {
    maxRequests: 0,        // SIN IA
    softLimit: 0,
    hardLimit: 0,
  },
  FREE: {
    maxRequests: 100,      // ~3 lecturas/día promedio
    softLimit: 80,         // Warning al 80%
    hardLimit: 100,        // Bloqueo al 100%
  },
  PREMIUM: {
    maxRequests: -1,       // ILIMITADO
    softLimit: -1,
    hardLimit: Number.MAX_SAFE_INTEGER,
  },
}
```

**Reset automático:** Primer día del mes a las 00:00 UTC (Cron Job)

---

### Sistema de Autenticación (Frontend)

#### Auth Store (Zustand)
**Ubicación:** [frontend/src/stores/authStore.ts](d:\Personal\tarot\frontend\src\stores\authStore.ts)

```typescript
interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;

  // Métodos
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): void;
  checkAuth(): Promise<void>;
  refreshAccessToken(): Promise<void>;
}
```

**Persistencia:** localStorage con middleware `persist`

**Flujo de autenticación:**
1. Usuario hace login/register → Recibe tokens JWT
2. Tokens se guardan en localStorage y Zustand store
3. Cada request incluye `Authorization: Bearer {access_token}`
4. Si access_token expira → refresh_token se usa automáticamente
5. Si refresh_token expira → logout automático

---

#### Hook useRequireAuth
**Uso:** Protege páginas que requieren autenticación

```typescript
// En componentes de página
const user = useRequireAuth();

// Si no autenticado → redirect a /login
```

---

## Experiencia: Usuario Anónimo (ANONYMOUS)

### Journey Completo: Primera Visita → Primera Lectura

---

### 1. Llegada a la Plataforma

**URL:** `/` (Home)

**Componente:** [frontend/src/components/features/home/LandingPage.tsx](d:\Personal\tarot\frontend\src\components\features\home\LandingPage.tsx)

**Lo que ve el usuario:**

#### A) HeroSection
- **Título:** "Descubre tu destino con Tarot personalizado"
- **Descripción:** Texto explicativo sobre la plataforma
- **Imagen:** Hero visual atractivo
- **CTAs:**
  - **Botón primario (púrpura):** "Comenzar Gratis" → `/registro`
  - **Botón secundario (outline):** "Probar sin registro" → `/carta-del-dia`

#### B) TryWithoutRegisterSection
- **Badge:** "Sin compromiso"
- **Título:** "Prueba sin compromiso"
- **Descripción:** "1 carta aleatoria sin necesidad de registrarte"
- **Ícono:** Cartas de tarot ilustradas
- **CTA:** "Carta del Día Gratis" → `/carta-del-dia`

#### C) PremiumBenefitsSection
- **Título:** "Desbloquea todo el potencial del Tarot"
- **Precio:** "$9.99/mes"
- **Grid de beneficios (5 ítems):**
  1. ✨ Interpretaciones con IA personalizadas
  2. 🃏 Todas las tiradas disponibles
  3. 💬 Preguntas personalizadas
  4. 📊 Estadísticas avanzadas
  5. 🚫 Sin publicidad
- **CTA:** "Actualizar a Premium" → `/registro`

#### D) WhatIsTarotSection
- Contenido educativo sobre qué es el tarot
- Explicación de cómo funciona

---

### 2. Click en "Probar sin registro"

**URL:** `/carta-del-dia`

**Componente:** [frontend/src/components/features/daily-reading/DailyCardExperience.tsx](d:\Personal\tarot\frontend\src\components\features\daily-reading\DailyCardExperience.tsx)

**Estado inicial:** `unrevealed` (carta sin revelar)

**Lo que ve:**
- **Título:** "Tu Carta del Día"
- **Texto:** "Conecta con tu energía y toca la carta para descubrir el mensaje que el universo tiene para ti hoy..."
- **Carta:** Reverso de carta de tarot con animación sutil (bounce)
- **Instrucción:** "Haz clic en la carta para revelarla"

**Experiencia interactiva:**
1. Usuario mueve el mouse sobre la carta → Efecto hover (escala, sombra)
2. Usuario hace clic → Animación de volteo
3. Estado cambia a `loading`

---

### 3. Revelando la Carta

**Estado:** `loading`

**Lo que ve:**
- Spinner o animación de carga
- Texto: "Consultando las energías..."

**Backend:**
```typescript
// POST /daily-reading/anonymous
// Crea lectura temporal (sin guardar en DB si es anónimo)
// Selecciona 1 carta aleatoria del mazo (78 cartas)
// Determina si sale invertida (50% de probabilidad)
// Genera interpretación BÁSICA (sin IA, texto predefinido)
```

**Tiempo de carga:** ~1-2 segundos

---

### 4. Resultado de la Carta

**Estado:** `revealed`

**Lo que ve:**

#### Carta Revelada
- **Imagen:** Carta face-up con animación fade-in + scale
- **Nombre:** Ej. "El Loco" o "La Emperatriz"
- **Badge (si aplica):** "(Invertida)" en color distintivo

#### Interpretación
- **Caja con fondo suave**
- **Título:** Nombre de la carta
- **Texto:** Interpretación genérica (NO personalizada, NO con IA)
- **Nota:** Interpretación breve (1-2 párrafos)

**Ejemplo de interpretación (sin IA):**
```
El Loco

Representa nuevos comienzos, espontaneidad y libertad.
Es momento de confiar en tu intuición y dar el salto
hacia lo desconocido. No temas a los cambios que se avecinan.
```

#### Botones de Acción
- **"Compartir mensaje"** (outline, secundario)
  - Click → Copia texto a clipboard
  - Toast: "Mensaje copiado al portapapeles"
  - **NOTA:** El botón aparece pero no funciona plenamente (no puede guardar/generar link único)

- **"Ver historial"** (outline, secundario) - **DESHABILITADO**
  - Aparece grayed out
  - Tooltip: "Regístrate para guardar tu historial"

---

### 5. Post-Lectura: Modal de Conversión

**Modal automático:** `RegisterCTAModal`

**Ubicación:** [frontend/src/components/features/conversion/RegisterCTAModal.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\RegisterCTAModal.tsx)

**Trigger:** Se muestra 2 segundos después de revelar la carta

**Lo que ve:**

#### Encabezado
- **Ícono:** ✨ Sparkles
- **Título:** "¿Te gustó tu lectura?"
- **Subtítulo:** "Regístrate gratis para desbloquear más"

#### Grid de Beneficios (3 columnas)
1. **📜 Historial de Lecturas**
   - "Guarda todas tus lecturas y consulta su evolución"

2. **📅 2 Lecturas Diarias**
   - "El doble de lecturas cada día (vs 1 sin registro)"

3. **🎴 Todas las Tiradas**
   - "Accede a todas las tiradas de tarot disponibles"

#### CTAs
- **Botón primario (gradiente púrpura-rosa):** "Registrarme Gratis"
  - Click → Redirección a `/registro`
  - Tracking: `trackCTAClicked('daily-card-post-reading', 'register')`

- **Botón secundario (ghost):** "No, gracias"
  - Click → Cierra modal
  - Tracking: `trackCTAClicked('daily-card-post-reading', 'dismiss')`
  - Incrementa contador de dismissals en localStorage

#### Comportamiento de Dismissal
```typescript
// Si usuario rechaza 3+ veces → no mostrar más el modal
if (dismissalCount >= 3) {
  // No mostrar RegisterCTAModal
  // Pero sí mostrar banner sutil en navegación
}
```

---

### 6. Si el usuario NO se registra

**Límite alcanzado:** 1 lectura/día

**Próximo intento de lectura:**

**Modal:** `LimitReachedModal`

**Ubicación:** [frontend/src/components/features/conversion/LimitReachedModal.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\LimitReachedModal.tsx)

**Lo que ve:**

#### Encabezado
- **Ícono:** 🔒 Lock
- **Título:** "Has alcanzado tu límite diario"
- **Subtítulo:** "Como usuario sin registro, solo puedes hacer 1 lectura por día"

#### Información
- **Texto:** "Tu cuota se restablecerá mañana a las 00:00 UTC"
- **Countdown (opcional):** Tiempo restante hasta reset

#### Beneficios de Registro
- **Badge FREE:** "Gratis"
- **2 Lecturas Diarias** (vs 1 actual)
- **Historial Guardado**

#### Beneficios Premium
- **Badge PREMIUM:** "$9.99/mes"
- **3+ Lecturas Diarias**
- **Interpretaciones con IA**

#### CTAs
- **Botón primario:** "Registrarme Gratis"
  - → `/registro`

- **Botón secundario:** "Actualizar a Premium"
  - → `/registro?plan=premium`

- **Link:** "Volver mañana"
  - Cierra modal

---

### Resumen: Restricciones del Usuario Anónimo

❌ **NO puede:**
- Hacer más de 1 lectura por día
- Ver historial de lecturas pasadas
- Acceder al ritual completo (categorías, preguntas, spreads múltiples)
- Obtener interpretaciones con IA
- Compartir lecturas con link único
- Hacer preguntas personalizadas
- Ver estadísticas

✅ **SÍ puede:**
- Hacer 1 Carta del Día por día
- Ver interpretación básica (sin IA)
- Copiar texto al portapapeles
- Registrarse gratis en cualquier momento

---

## Experiencia: Usuario Registrado Gratuito (FREE)

### Journey Completo: Registro → Primera Lectura Completa

---

### 1. Proceso de Registro

**URL:** `/registro`

**Componente:** [frontend/src/components/auth/RegisterForm.tsx](d:\Personal\tarot\frontend\src\components\auth\RegisterForm.tsx)

**Formulario:**

#### Campos
1. **Nombre completo**
   - Input text
   - Requerido
   - Min 2 caracteres

2. **Email**
   - Input email
   - Validación de formato
   - Único (no puede estar registrado)

3. **Contraseña**
   - Input password con toggle show/hide
   - Min 8 caracteres
   - Debe contener: 1 mayúscula, 1 minúscula, 1 número
   - Validación con Zod schema

4. **Confirmar contraseña**
   - Debe coincidir con contraseña

#### Validaciones visuales
- Icono ✓ verde si campo válido
- Icono ✗ rojo + mensaje de error si inválido
- Validación en tiempo real (onBlur)

#### CTAs
- **Botón primario:** "Crear Cuenta Gratis"
  - Disabled mientras formulario inválido
  - Loading spinner durante registro

- **Link:** "¿Ya tienes cuenta? Inicia sesión"
  - → `/login`

#### Backend
```typescript
// POST /auth/register
{
  name: string;
  email: string;
  password: string; // Se hashea con bcrypt
}

// Respuesta
{
  user: {
    id: number;
    name: string;
    email: string;
    plan: 'free';
    roles: ['consumer'];
  },
  access_token: string;  // JWT válido por 15min
  refresh_token: string; // JWT válido por 7 días
}
```

#### Post-Registro
1. Tokens guardados en localStorage
2. User guardado en Zustand store
3. Redirección automática a `/` (UserDashboard)

---

### 2. Primera Vista: Dashboard de Usuario

**URL:** `/`

**Componente:** [frontend/src/components/features/dashboard/UserDashboard.tsx](d:\Personal\tarot\frontend\src\components\features\dashboard\UserDashboard.tsx)

**Header de Navegación:** (ahora visible y diferente)

#### Navbar
- **Logo:** "Tarot" → `/`
- **Navegación:**
  - "Nueva Lectura" → `/ritual`
  - "Explorar" (deshabilitado - próximamente)
  - "Mis Sesiones" (deshabilitado - próximamente)
- **User Menu (Avatar con dropdown):**
  - Foto de perfil (inicial del nombre)
  - Email del usuario
  - **Opciones:**
    - Mi Perfil → `/perfil`
    - Mis Lecturas → `/historial`
    - Configuración → `/configuracion`
    - ➖ Separador
    - Cerrar Sesión

---

#### A) WelcomeHeader
- **Saludo:** "¡Bienvenido de nuevo, [Nombre]!"
- **Badge del plan:** 🆓 "Plan Gratuito" (pill badge)
- **Subtítulo:** "Tienes 2 lecturas disponibles hoy"

---

#### B) QuickActions (3 tarjetas en grid)

**1. Nueva Lectura** (tarjeta destacada, gradiente)
- **Ícono:** 🌟 Sparkles
- **Título:** "Nueva Lectura"
- **Descripción:** "Comienza una nueva consulta al tarot"
- **CTA:** "Comenzar" → `/ritual`

**2. Historial de Lecturas**
- **Ícono:** 📜 Scroll
- **Título:** "Historial"
- **Descripción:** "Revisa tus lecturas anteriores"
- **CTA:** "Ver Historial" → `/historial`

**3. Carta del Día**
- **Ícono:** ☀️ Sun
- **Título:** "Carta del Día"
- **Descripción:** "Tu carta de energía diaria"
- **Badge:** "Disponible" (si no la hizo hoy) o "Completada" (si ya la hizo)
- **CTA:** "Revelar" → `/carta-del-dia`

---

#### C) DidYouKnowSection
- **Título:** "¿Sabías que...?"
- **Dato curioso:** Información interesante sobre tarot (rota aleatoriamente)
- **Ícono:** 💡 Lightbulb

---

#### D) UpgradeBanner (Solo para FREE, no PREMIUM)
**Componente:** [frontend/src/components/features/conversion/UpgradeBanner.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\UpgradeBanner.tsx)

- **Diseño:** Banner horizontal con gradiente
- **Título:** "Desbloquea interpretaciones con IA"
- **Lista de beneficios:**
  - ✨ 3+ lecturas diarias
  - 🤖 Interpretaciones personalizadas con IA
  - 💬 Preguntas personalizadas
  - 📊 Estadísticas avanzadas
- **CTA:** "Actualizar a Premium - $9.99/mes" → Stripe Checkout

---

### 3. Iniciando una Nueva Lectura

**Click en "Nueva Lectura"**

**URL:** `/ritual`

**Componente:** [frontend/src/app/ritual/page.tsx](d:\Personal\tarot\frontend\src\app\ritual\page.tsx)

**Breadcrumb:** Ritual

---

#### Paso 1: Selección de Categoría

**Lo que ve:**

- **Título:** "Elige tu camino"
- **Subtítulo:** "Selecciona el área de tu vida sobre la que deseas consultar"

**Grid de 6 categorías** (2 columnas en mobile, 3 en desktop)

Cada tarjeta muestra:
- **Ícono temático** (grande, colorido)
- **Título de categoría**
- **Descripción breve**
- **Efecto hover:** Escala, sombra, gradiente sutil

**Categorías disponibles:**

1. **❤️ Amor y Relaciones**
   - "Consultas sobre amor, relaciones y conexiones"

2. **💼 Carrera y Trabajo**
   - "Decisiones profesionales y laborales"

3. **💰 Dinero y Finanzas**
   - "Situación económica y oportunidades"

4. **🧘 Salud y Bienestar**
   - "Bienestar físico, mental y emocional"

5. **✨ Crecimiento Espiritual**
   - "Evolución personal y espiritual"

6. **🌍 Consulta General**
   - "Visión general de tu situación actual"

**Click en categoría** → `/ritual/preguntas?categoryId={id}`

---

#### Paso 2: Selección de Pregunta

**URL:** `/ritual/preguntas?categoryId=1` (ejemplo: Amor)

**Componente:** [frontend/src/components/features/readings/QuestionSelector.tsx](d:\Personal\tarot\frontend\src\components\features\readings\QuestionSelector.tsx)

**Breadcrumb:** Ritual > Amor y Relaciones > Pregunta

**Lo que ve:**

---

##### Sección 1: Preguntas Predefinidas

- **Título:** "Selecciona una pregunta"
- **Subtítulo:** "Elige la pregunta que más resuene contigo"

**Lista de preguntas** (8-12 por categoría)

Cada pregunta tiene:
- **Radio button** (seleccionable)
- **Texto de la pregunta**
- **Efecto hover:** Fondo sutil

**Ejemplos de preguntas (categoría Amor):**
- "¿Qué debo saber sobre mi relación actual?"
- "¿Qué me depara el futuro en el amor?"
- "¿Cómo puedo mejorar mi vida amorosa?"
- "¿Qué bloqueos tengo para encontrar el amor?"

**Estado:**
- 1 pregunta seleccionada → Radio marcado
- Botón "Continuar con esta pregunta" → Habilitado

---

##### Divisor
- **Línea horizontal con texto:** "O escribe tu propia pregunta"

---

##### Sección 2: Pregunta Personalizada (🔒 PREMIUM ONLY)

**Lo que ve el usuario FREE:**

- **Título:** "Pregunta Personalizada" + **Badge 🔒 Premium**
- **Textarea:**
  - Placeholder: "Escribe tu pregunta..."
  - **DESHABILITADO** (background gris, cursor not-allowed)
  - Max length: 500 caracteres (contador visible)

- **Overlay sutil:** Blur muy leve

**Interacción:**
1. Usuario hace clic en textarea deshabilitado
2. Se muestra **UpgradeModal**

**UpgradeModal:**
```
Título: "Función Premium"
Mensaje: "Las preguntas personalizadas están disponibles
         solo para usuarios Premium"

Beneficios:
  ✨ Preguntas ilimitadas personalizadas
  🤖 Interpretaciones con IA
  🎴 3+ lecturas diarias

CTAs:
  [Actualizar a Premium - $9.99/mes]
  [Tal vez después]
```

**Acción disponible:**
- Seleccionar pregunta predefinida → Click "Continuar"
- → `/ritual/tirada?categoryId=1&questionId={id}`

---

#### Paso 3: Selección de Tipo de Tirada (Spread)

**URL:** `/ritual/tirada?categoryId=1&questionId=23`

**Componente:** [frontend/src/components/features/readings/SpreadSelector.tsx](d:\Personal\tarot\frontend\src\components\features\readings\SpreadSelector.tsx)

**Breadcrumb:** Ritual > Amor y Relaciones > Pregunta > Tipo de Tirada

**Lo que ve:**

- **Título:** "Elige el tipo de tirada"
- **Subtítulo:** "Cada tirada ofrece un nivel diferente de profundidad"

**Grid de 4 spreads** (2 columnas)

---

##### Spread 1: Carta Única
- **Icono:** 1️⃣
- **Nombre:** "Carta Única"
- **Descripción:** "Respuesta directa y concisa"
- **Dificultad:** Badge "Principiante" (verde)
- **Cartas:** 1 carta
- **Tiempo estimado:** ~2 minutos
- **CTA:** "Seleccionar"

##### Spread 2: Pasado, Presente, Futuro
- **Icono:** 3️⃣
- **Nombre:** "Pasado, Presente, Futuro"
- **Descripción:** "Visión temporal de tu situación"
- **Dificultad:** Badge "Intermedio" (amarillo)
- **Cartas:** 3 cartas
- **Tiempo estimado:** ~5 minutos
- **CTA:** "Seleccionar"

##### Spread 3: Cruz Celta (🔒 PREMIUM)
- **Icono:** 🔟
- **Nombre:** "Cruz Celta"
- **Descripción:** "Análisis profundo y detallado"
- **Dificultad:** Badge "Avanzado" (naranja)
- **Cartas:** 10 cartas
- **Tiempo estimado:** ~15 minutos
- **Badge:** 🔒 Premium
- **Overlay:** Tarjeta con blur sutil
- **CTA:** "Actualizar a Premium" (en lugar de "Seleccionar")

##### Spread 4: Herradura (🔒 PREMIUM)
- Similar a Cruz Celta
- 7 cartas
- Premium only

---

**Verificación de Límite Diario:**

Antes de proceder, el sistema verifica:

```typescript
// Usuario FREE: 2 lecturas/día
const usageToday = await checkDailyUsage(userId);

if (usageToday >= 2) {
  // Mostrar LimitReachedModal
}
```

**Si límite alcanzado:**

**Modal:** `LimitReachedModal`

```
Título: "Has alcanzado tu límite diario"
Subtítulo: "Como usuario FREE, tienes 2 lecturas por día"

Info: "Tu cuota se restablecerá mañana a las 00:00 UTC"
Countdown: "Tiempo restante: 8h 32m 15s"

Beneficios Premium:
  💎 3+ lecturas diarias
  🤖 Interpretaciones con IA
  ✨ Preguntas personalizadas

CTAs:
  [Actualizar a Premium - $9.99/mes]
  [Volver mañana]
```

**Si límite NO alcanzado:**

- Click en "Seleccionar" (spread Pasado-Presente-Futuro)
- → `/ritual/lectura?spreadId=2&questionId=23`

---

#### Paso 4: Experiencia de Lectura (Selección de Cartas)

**URL:** `/ritual/lectura?spreadId=2&questionId=23`

**Componente:** [frontend/src/components/features/readings/ReadingExperience.tsx](d:\Personal\tarot\frontend\src\components\features\readings\ReadingExperience.tsx)

**Breadcrumb:** Ritual > Amor y Relaciones > Lectura

---

##### Estado 1: Selección de Cartas (`selecting`)

**Lo que ve:**

- **Header:**
  - **Pregunta seleccionada:** "¿Qué debo saber sobre mi relación actual?"
  - **Tipo de tirada:** "Pasado, Presente, Futuro"
  - **Contador:** "0 de 3 cartas seleccionadas"

- **Instrucción:**
  - "Respira profundo, concéntrate en tu pregunta, y elige 3 cartas que te llamen"

- **Grid de cartas:**
  - **78 cartas** boca abajo (reverso idéntico)
  - **Layout:** 12 columnas en desktop, 6 en tablet, 3 en mobile
  - **Diseño:** Reverso con pattern místico consistente
  - **Animación hover:** Escala suave, glow sutil

**Interacción:**

1. Usuario mueve cursor sobre carta → Hover effect
2. Usuario hace clic en carta → Carta se "levanta" (scale + ring púrpura)
3. Contador actualiza: "1 de 3 cartas seleccionadas"
4. Si hace clic en carta ya seleccionada → Deselecciona
5. Si intenta seleccionar más de 3 → No permite (botón deshabilitado)

**Botón de acción:**
- **"Revelar mi Destino"**
  - Disabled mientras `selectedCards.length < 3`
  - Enabled cuando `selectedCards.length === 3`
  - Animación pulse sutil cuando está enabled

---

##### Estado 2: Generando Lectura (`loading`)

**Trigger:** Click en "Revelar mi Destino"

**Lo que ve:**

- **Pantalla de carga** (fullscreen overlay)
- **Animación:** Ícono Sparkles rotando
- **Progress bar** animada (0% → 100% en ~3 segundos)

**Mensajes rotatorios** (cambian cada 2 segundos):
1. "Consultando con el universo..." (0-2s)
2. "Alineando energías..." (2-4s)
3. "Descifrando el mensaje cósmico..." (4-6s)
4. "Preparando tu lectura..." (6s+)

**Backend:**

```typescript
// POST /readings/create
{
  spreadId: 2,
  questionId: 23,
  selectedCardIds: [12, 45, 67],
  userId: 123
}

// Proceso backend:
1. Validar límite diario (CHECK)
2. Registrar uso diario (+1)
3. Determinar orientaciones (upright/reversed) aleatoriamente
4. Generar posiciones (Pasado, Presente, Futuro)
5. Crear registro en DB
6. Generar interpretación:
   - Usuario FREE → Interpretación template (SIN IA)
   - Usuario PREMIUM → Llamada a OpenAI GPT-4
7. Guardar lectura con interpretación

// Respuesta:
{
  id: 456,
  question: "¿Qué debo saber sobre mi relación actual?",
  spread: {
    id: 2,
    name: "Pasado, Presente, Futuro"
  },
  cards: [
    {
      id: 12,
      name: "El Loco",
      imageUrl: "/cards/00-el-loco.jpg",
      isReversed: false,
      position: "Pasado"
    },
    {
      id: 45,
      name: "Tres de Copas",
      imageUrl: "/cards/03-copas-03.jpg",
      isReversed: true,
      position: "Presente"
    },
    {
      id: 67,
      name: "Los Enamorados",
      imageUrl: "/cards/06-enamorados.jpg",
      isReversed: false,
      position: "Futuro"
    }
  ],
  interpretation: "..." // Texto largo
  createdAt: "2025-12-31T14:30:00Z"
}
```

**Tiempo de procesamiento:** ~3-5 segundos

---

##### Estado 3: Resultado de la Lectura (`result`)

**Lo que ve:**

---

###### Sección 1: Cartas Reveladas

**Animación de entrada:** Cartas aparecen una por una con stagger (0.2s delay cada una)

**Layout:** 3 columnas (responsive a 1 columna en mobile)

**Carta 1 - Pasado:**
- **Imagen:** El Loco (upright)
- **Nombre:** "El Loco"
- **Posición:** "Pasado"
- **Estado:** Normal

**Carta 2 - Presente:**
- **Imagen:** Tres de Copas (invertida - rotada 180°)
- **Nombre:** "Tres de Copas"
- **Posición:** "Presente"
- **Badge:** "(Invertida)" en rojo

**Carta 3 - Futuro:**
- **Imagen:** Los Enamorados (upright)
- **Nombre:** "Los Enamorados"
- **Posición:** "Futuro"
- **Estado:** Normal

---

###### Sección 2: Interpretación (SIN IA - Usuario FREE)

**Caja de interpretación:**
- **Background:** Fondo sutil con borde
- **Título:** "Tu lectura del Tarot"
- **Contenido:** Markdown renderizado

**Ejemplo de interpretación (template, sin IA):**

```markdown
**Pasado: El Loco**

Tu pasado reciente estuvo marcado por nuevos comienzos y
decisiones espontáneas. Tomaste un riesgo en tu relación
que cambió su dinámica.

**Presente: Tres de Copas (Invertida)**

Actualmente enfrentas desarmonía o distanciamiento en tu
círculo cercano. La comunicación puede estar bloqueada,
y celebraciones o reuniones no fluyen naturalmente.

**Futuro: Los Enamorados**

Se avecina una decisión importante en tu relación.
Tendrás que elegir entre caminos diferentes, pero esta
elección te llevará hacia la claridad y el amor verdadero.
```

**Nota visible:**
- "💡 Esta es una interpretación basada en significados tradicionales"

---

###### Sección 3: Banner de Actualización (Usuario FREE)

**Componente:** `UpgradeBanner`

**Diseño:**
- Background con gradiente púrpura-rosa
- Borde con glow sutil

**Contenido:**
```
🤖 Desbloquea Interpretaciones Personalizadas con IA

Con Premium obtienes:
  ✨ Análisis profundo adaptado a tu pregunta
  💬 Contexto personalizado según tu situación
  🔮 Conexiones únicas entre las cartas
  ♾️  Regenerar interpretaciones ilimitadas

[Actualizar a Premium - $9.99/mes]
```

---

###### Sección 4: Botones de Acción

**3 botones horizontales:**

1. **"Regenerar Interpretación"** (outline, secundario)
   - **Icono:** 🔄 Refresh
   - **Estado:** Disabled (con tooltip)
   - **Tooltip:** "Regenerar interpretaciones requiere Premium"
   - **Click (si FREE):** Muestra UpgradeModal

2. **"Compartir"** (outline, secundario)
   - **Icono:** 🔗 Share
   - **Click:** Genera token único y copia link
   - **Toast:** "Link copiado: https://tarot.app/compartida/abc123"
   - **Funcionalidad:**
     ```typescript
     // POST /readings/{id}/share
     // Genera token único
     // Devuelve: { shareUrl: "https://..." }
     ```

3. **"Nueva Lectura"** (primary, gradiente)
   - **Icono:** ✨ Sparkles
   - **Click:** Navega a `/ritual`
   - **Verifica límite antes:** Si ya hizo 2/2 → LimitReachedModal

---

### 4. Carta del Día (Usuario FREE)

**URL:** `/carta-del-dia`

**Diferencia vs ANONYMOUS:**

- **Guarda en historial** (registro en DB)
- **Cuenta como 1 de las 2 lecturas diarias**
- **Puede compartir** (genera token)
- **NO puede regenerar** (requiere Premium)

**Experiencia:**

Igual que ANONYMOUS hasta revelar, pero después:

#### Botones de Acción (FREE)

1. **"Compartir mensaje"** (funcional)
   - Genera token → `/compartida/{token}`
   - Copia link al portapapeles

2. **"Ver historial"** (habilitado)
   - → `/historial`
   - Muestra todas las lecturas pasadas

3. **"Regenerar"** (deshabilitado con tooltip)
   - **Tooltip:** "Regenerar requiere Premium"
   - **Click:** UpgradeModal

---

### 5. Historial de Lecturas

**URL:** `/historial`

**Componente:** [frontend/src/components/features/readings/ReadingsHistory.tsx](d:\Personal\tarot\frontend\src\components\features\readings\ReadingsHistory.tsx)

**Requiere:** Autenticación (`useRequireAuth()`)

---

#### Header
- **Título:** "Mis Lecturas"
- **Subtítulo:** "Revive tus consultas anteriores al tarot"

#### Filtros (barra horizontal)

**Dropdown de ordenamiento:**
- Más recientes (default)
- Más antiguas
- Esta semana
- Este mes

**Buscador:**
- Placeholder: "Buscar por pregunta..."
- Búsqueda case-insensitive en texto de pregunta

---

#### Listado de Lecturas

**Layout:** Grid de tarjetas (1 columna en mobile, 2 en tablet, 3 en desktop)

**Cada ReadingCard muestra:**

```
┌─────────────────────────────────────┐
│ 🃏 Pasado, Presente, Futuro         │
│                                     │
│ "¿Qué debo saber sobre mi           │
│  relación actual?"                  │
│                                     │
│ 📅 31 de Diciembre, 2025            │
│ 🕐 14:30                            │
│                                     │
│ Miniatura de 3 cartas (pequeñas)    │
│                                     │
│ [Ver Detalle]  [Eliminar]          │
└─────────────────────────────────────┘
```

**Interacciones:**

1. **Click en tarjeta completa** → `/historial/{id}`
2. **Click en "Ver Detalle"** → `/historial/{id}`
3. **Click en "Eliminar"** → Confirmación → DELETE `/readings/{id}`

---

#### Paginación

- **Items por página:** 10
- **Controles:** Anterior | 1 2 3 ... 10 | Siguiente
- **Info:** "Mostrando 1-10 de 47 lecturas"

---

#### Estados Especiales

**Loading:**
- Skeleton cards (3-6 placeholders con shimmer)

**Empty (sin lecturas):**
```
🌟

"Tu destino aún no ha sido revelado"

"Aún no tienes lecturas guardadas.
Comienza tu primera consulta al tarot."

[Nueva Lectura]
```

**No results (búsqueda sin coincidencias):**
```
🔍

"No se encontraron lecturas"

"Intenta con otros términos de búsqueda"

[Limpiar búsqueda]
```

---

### 6. Detalle de Lectura Individual

**URL:** `/historial/456`

**Componente:** ReadingDetail

**Lo que ve:**

- **Breadcrumb:** Historial > Lectura del 31 Dic 2025
- **Pregunta:** Título grande
- **Metadata:**
  - Fecha y hora
  - Tipo de tirada
  - Categoría
- **Cartas reveladascon interpretación completa**
- **Botones:**
  - Compartir (genera/copia link)
  - Eliminar (con confirmación)
  - Volver al historial

---

### 7. Perfil de Usuario

**URL:** `/perfil`

**Componente:** [frontend/src/app/perfil/page.tsx](d:\Personal\tarot\frontend\src\app\perfil\page.tsx)

---

#### ProfileHeader

- **Avatar:** Inicial del nombre (background gradiente)
- **Nombre:** Usuario FREE
- **Email:** user@example.com
- **Badge:** 🆓 "Plan Gratuito"

---

#### Tabs (3 pestañas)

##### Tab 1: Cuenta

**Sección: Información Personal**
- Nombre (editable)
- Email (editable, requiere re-autenticación)
- Botón "Guardar Cambios"

**Sección: Seguridad**
- Cambiar contraseña
  - Contraseña actual
  - Nueva contraseña
  - Confirmar nueva contraseña
- Botón "Actualizar Contraseña"

**Sección: Avatar**
- Upload de imagen (próximamente)
- O selección de inicial con color

---

##### Tab 2: Suscripción

**Información del Plan:**
```
Plan Actual: 🆓 Gratuito
Lecturas hoy: 1 / 2 utilizadas
Próximo reset: Mañana a las 00:00 UTC

Límites:
  📖 Lecturas diarias: 2
  🤖 IA: No disponible
  💬 Preguntas personalizadas: No
  🎴 Spreads avanzados: No
```

**CTA de Upgrade:**
```
┌────────────────────────────────────────┐
│  Desbloquea todo el poder del Tarot    │
│                                        │
│  Premium - $9.99/mes                   │
│                                        │
│  ✅ 3+ lecturas diarias                │
│  ✅ Interpretaciones con IA            │
│  ✅ Preguntas personalizadas           │
│  ✅ Todos los spreads                  │
│  ✅ Estadísticas avanzadas             │
│                                        │
│  [Actualizar a Premium]                │
└────────────────────────────────────────┘
```

**Historial de pagos:** (vacío para FREE)

---

##### Tab 3: Ajustes

**Notificaciones:**
- ☑️ Recordatorio de Carta del Día (email)
- ☐ Notificaciones de nuevas features
- ☐ Newsletter mensual

**Privacidad:**
- ☑️ Guardar historial de lecturas
- ☐ Permitir uso anónimo de datos para mejorar IA

**Zona Peligrosa:**
- **Eliminar cuenta**
  - Botón rojo
  - Confirmación doble
  - Elimina todos los datos

---

### Resumen: Restricciones del Usuario FREE

❌ **NO puede:**
- Usar interpretaciones con IA
- Escribir preguntas personalizadas
- Hacer más de 2 lecturas por día
- Acceder a spreads avanzados (Cruz Celta, Herradura)
- Regenerar interpretaciones
- Ver estadísticas avanzadas

✅ **SÍ puede:**
- Hacer 2 lecturas completas por día
- Acceder a todas las categorías
- Seleccionar preguntas predefinidas
- Usar spreads básicos (1 carta, 3 cartas)
- Guardar historial completo
- Compartir lecturas con link único
- Cambiar tarotista favorito (1 vez cada 30 días)

---

## Experiencia: Usuario Premium (PREMIUM)

### Journey Completo: Upgrade → Experiencia Sin Restricciones

---

### 1. Proceso de Actualización a Premium

**Punto de entrada:** Cualquier CTA de upgrade

#### Opciones de Upgrade:

**A) Desde Dashboard:**
- Click en UpgradeBanner
- → Stripe Checkout

**B) Desde Modal de límite alcanzado:**
- Click en "Actualizar a Premium"
- → Stripe Checkout

**C) Desde Perfil:**
- Tab "Suscripción"
- Click en "Actualizar a Premium"
- → Stripe Checkout

---

#### Flujo de Pago (Stripe Checkout)

**Página externa:** Stripe Checkout hosted

**Información solicitada:**
1. Email (pre-filled si está logged in)
2. Tarjeta de crédito/débito
3. Nombre del titular
4. País y código postal

**Suscripción:**
- **Precio:** $9.99 USD/mes
- **Recurrente:** Mensual (auto-renovación)
- **Primer cobro:** Inmediato
- **Próximos cobros:** Cada 30 días

**Métodos de pago aceptados:**
- Visa, Mastercard, Amex
- Apple Pay, Google Pay
- Banktransfer (según país)

---

#### Post-Pago

**Webhook de Stripe → Backend:**

```typescript
// POST /webhooks/stripe
// Event: checkout.session.completed

// Backend actualiza:
{
  plan: 'premium',
  subscriptionStatus: 'active',
  planStartedAt: new Date(),
  planExpiresAt: new Date(+30 días),
  stripeCustomerId: 'cus_...',
  stripeSubscriptionId: 'sub_...'
}
```

**Frontend:**
1. Stripe redirige a `/perfil?success=true`
2. authStore.checkAuth() → actualiza user con plan premium
3. Toast de éxito: "¡Bienvenido a Premium! 🎉"
4. Redirección automática a `/` (Dashboard)

---

### 2. Dashboard de Usuario Premium

**URL:** `/`

**Componente:** UserDashboard (versión Premium)

---

#### Diferencias visuales vs FREE:

##### A) WelcomeHeader
- **Badge del plan:** 💎 "Premium" (gradiente dorado)
- **Subtítulo:** "Lecturas ilimitadas disponibles" (sin contador restrictivo)

##### B) QuickActions
- **Todas las tarjetas habilitadas** (sin badges de lock)

##### C) UpgradeBanner
- **NO SE MUESTRA** (solo para FREE)

##### D) StatsSection (NUEVO - solo Premium)

**Componente:** [frontend/src/components/features/dashboard/StatsSection.tsx](d:\Personal\tarot\frontend\src\components\features\dashboard\StatsSection.tsx)

**Título:** "Tus Estadísticas"

**Grid de 4 métricas:**

```
┌─────────────────────┬─────────────────────┐
│  📊 Total Lecturas  │  📅 Este Mes        │
│     47              │     12              │
└─────────────────────┴─────────────────────┘
┌─────────────────────┬─────────────────────┐
│  🔥 Racha Actual    │  ⭐ Carta Favorita  │
│     7 días          │  El Loco            │
└─────────────────────┴─────────────────────┘
```

**Gráfico de uso:**
- Línea temporal de lecturas por día (últimos 30 días)
- Chart.js o Recharts

---

### 3. Nueva Lectura con Features Premium

**URL:** `/ritual` → `/ritual/preguntas?categoryId=1`

**Componente:** QuestionSelector (versión Premium)

---

#### Diferencia Clave: Preguntas Personalizadas DESBLOQUEADAS

##### Sección 2: Pregunta Personalizada (✅ DESBLOQUEADA)

**Lo que ve:**

- **Título:** "Pregunta Personalizada" + **Badge ✨ Premium** (dorado)
- **Textarea:**
  - **HABILITADA** (fondo blanco, cursor text)
  - Placeholder: "Escribe tu pregunta personalizada... Sé específico para obtener una interpretación más precisa."
  - Max length: 500 caracteres
  - **Contador:** "450 caracteres restantes"
  - Validación en tiempo real

**Ejemplos de preguntas personalizadas:**
- "¿Debo aceptar la oferta de trabajo en Madrid o quedarme en mi ciudad actual?"
- "¿Qué aspectos de mi personalidad están bloqueando mi crecimiento espiritual?"
- "¿Cómo puedo mejorar la relación con mi hermana después de nuestra discusión?"

**Botón:** "Usar mi pregunta"
- Enabled cuando `customQuestion.length > 10`
- Click → `/ritual/tirada?categoryId=1&customQuestion={encoded}`

---

### 4. Selección de Spread (Todos Desbloqueados)

**URL:** `/ritual/tirada?categoryId=1&customQuestion=...`

**Componente:** SpreadSelector (versión Premium)

---

#### Todos los Spreads Disponibles:

##### 1. Carta Única ✅
- Sin cambios

##### 2. Pasado, Presente, Futuro ✅
- Sin cambios

##### 3. Cruz Celta ✅ (AHORA DESBLOQUEADO)
- **Badge 🔒 Premium** → **Removido**
- **Overlay blur** → **Removido**
- **CTA:** "Seleccionar" (habilitado)
- **10 cartas** con posiciones:
  1. Situación actual
  2. Desafío inmediato
  3. Pasado reciente
  4. Futuro cercano
  5. Corona (objetivo consciente)
  6. Base (fundamento inconsciente)
  7. Consejo
  8. Influencias externas
  9. Esperanzas y miedos
  10. Resultado final

##### 4. Herradura ✅ (AHORA DESBLOQUEADO)
- **7 cartas** con posiciones:
  1. Pasado
  2. Presente
  3. Influencias ocultas
  4. Obstáculos
  5. Actitudes de otros
  6. Acción sugerida
  7. Posible resultado

---

#### Sin Límite Diario Estricto

**Verificación:**
```typescript
// Usuario PREMIUM: límite nominal de 3, pero en realidad ilimitado
const usageToday = await checkDailyUsage(userId);

if (user.plan === 'premium') {
  // No mostrar LimitReachedModal
  // Permitir lecturas sin restricción real
}
```

**Comportamiento:**
- Puede hacer 3, 5, 10+ lecturas en un día
- No se muestra modal de límite alcanzado
- Tracking para estadísticas, pero sin bloqueo

---

### 5. Experiencia de Lectura con IA

**URL:** `/ritual/lectura?spreadId=3&customQuestion=...`

**Componente:** ReadingExperience (versión Premium)

---

#### Selección de Cartas (Cruz Celta - 10 cartas)

**Diferencias:**
- Contador: "0 de 10 cartas seleccionadas"
- Instrucción: "Elige 10 cartas para tu Cruz Celta"
- Botón habilitado al seleccionar 10 cartas

---

#### Generación de Interpretación CON IA

**Backend:**

```typescript
// POST /readings/create
{
  spreadId: 3,              // Cruz Celta
  customQuestion: "¿Debo aceptar la oferta de trabajo...?",
  selectedCardIds: [1, 5, 12, 18, 23, 34, 42, 56, 61, 72],
  userId: 123
}

// Proceso backend para PREMIUM:
1. Validar cuota de IA (ilimitada para Premium)
2. Registrar uso de IA (+1 request, tracking solo)
3. Determinar orientaciones
4. Crear registro en DB

5. LLAMADA A IA (OpenAI GPT-4):

   Prompt enviado a IA:
   ─────────────────────────
   System: "Eres un tarotista experto con 20 años de experiencia.
            Proporciona interpretaciones profundas, personalizadas
            y empáticas basadas en las cartas seleccionadas."

   User: "
   Pregunta del consultante: '¿Debo aceptar la oferta de trabajo
   en Madrid o quedarme en mi ciudad actual?'

   Spread: Cruz Celta (10 posiciones)

   Cartas seleccionadas:
   1. Situación actual: El Mago (upright)
   2. Desafío inmediato: Cinco de Pentáculos (reversed)
   3. Pasado reciente: Dos de Copas (upright)
   4. Futuro cercano: As de Espadas (upright)
   5. Corona: El Carro (upright)
   6. Base: Cuatro de Copas (reversed)
   7. Consejo: La Estrella (upright)
   8. Influencias externas: Rey de Pentáculos (upright)
   9. Esperanzas y miedos: La Torre (reversed)
   10. Resultado: Diez de Copas (upright)

   Por favor proporciona:
   1. Análisis individual de cada carta en su posición
   2. Conexiones entre las cartas
   3. Respuesta clara a la pregunta del consultante
   4. Consejo final personalizado

   Formato: Markdown, tono empático y profesional.
   "
   ─────────────────────────

6. IA genera respuesta (~1000-1500 palabras)
7. Guardar lectura con interpretación IA

// Respuesta (simplificada):
{
  id: 789,
  cards: [...], // 10 cartas con metadata
  interpretation: "## Situación Actual: El Mago\n\nEstás en un momento...",
  aiGenerated: true,
  aiModel: "gpt-4",
  aiTokensUsed: 1247,
  createdAt: "2025-12-31T15:00:00Z"
}
```

**Tiempo de procesamiento:** ~8-12 segundos (IA es más lenta)

**Loading mejorado:**
- Mensajes rotatorios específicos para IA:
  1. "Consultando con el universo..." (0-3s)
  2. "La inteligencia artificial está analizando tus cartas..." (3-6s)
  3. "Generando interpretación personalizada..." (6-9s)
  4. "Casi listo..." (9s+)

---

#### Resultado con Interpretación IA

**Diferencias vs FREE:**

##### Sección 1: Cartas Reveladas
- **10 cartas** en layout especial (Cruz Celta tiene forma específica)
- Cada carta muestra posición y nombre

##### Sección 2: Interpretación CON IA (⭐ PREMIUM)

**Caja de interpretación:**
- **Badge:** ✨ "Interpretación generada con IA"
- **Título:** "Tu lectura personalizada"
- **Contenido:** Markdown extenso y detallado

**Ejemplo de interpretación IA:**

```markdown
## 🌟 Visión General

Las cartas revelan un momento crucial de decisión en tu vida,
donde la energía del Mago en tu situación actual indica que
posees TODOS los recursos necesarios para tomar esta decisión
con confianza. La presencia del Diez de Copas como resultado
final es extremadamente prometedora.

## 🔮 Análisis Detallado

### Situación Actual: El Mago (Upright)

Estás en una posición de poder y manifestación. Has desarrollado
las habilidades, la confianza y los recursos para crear tu
propia realidad. Esta carta sugiere que AMBAS opciones son
viables, porque tienes la capacidad de triunfar en cualquiera.

[... continúa con las otras 9 cartas ...]

## 🎯 Respuesta a tu Pregunta

Basándome en la lectura completa, las cartas indican que
**la oferta en Madrid representa una evolución natural de tu
camino**. El As de Espadas en tu futuro cercano simboliza
claridad mental y nuevas oportunidades que solo surgirán al
dar este paso.

Sin embargo, la Torre invertida en tus esperanzas y miedos
revela que temes el cambio. Es importante reconocer que este
miedo es natural, pero no debería ser tu guía.

## 💎 Consejo Final

La Estrella como carta de consejo es clara: ten fe en el
proceso. Este cambio no es una ruptura, sino una expansión.
El Diez de Copas como resultado final sugiere que esta
decisión te llevará hacia una realización emocional y
profesional profunda.

**Recomendación:** Acepta la oferta, pero tómate tiempo para
prepararte emocionalmente. El Carro en tu corona indica que
el control y la dirección son importantes para ti, así que
planifica la transición cuidadosamente.

## 🌙 Reflexión

Recuerda que el tarot no predice un futuro fijo, sino que
ilumina las energías presentes. Tu libre albedrío siempre
prevalece. Esta lectura sugiere que tienes el poder de
hacer que cualquier elección funcione, pero el camino hacia
Madrid parece alinearse más con tu crecimiento en este momento.

Confía en ti mismo. 🌟
```

**Diferencias clave vs interpretación template (FREE):**
- ✅ Análisis profundo de cada carta en su posición específica
- ✅ Conexiones entre cartas (narrativa coherente)
- ✅ Respuesta DIRECTA a la pregunta personalizada
- ✅ Tono empático y personalizado
- ✅ Consejo final adaptado a la situación
- ✅ Extensión: 1000-1500 palabras (vs 200-300 del template)

---

##### Sección 3: NO HAY UpgradeBanner

- **Removido completamente** (solo para FREE)

---

##### Sección 4: Botones de Acción (Premium)

**3 botones:**

1. **"Regenerar Interpretación"** (outline, secundario) ✅ HABILITADO
   - **Icono:** 🔄 Refresh
   - **Click:**
     1. Confirmación: "¿Regenerar interpretación? Se creará una nueva lectura personalizada basada en las mismas cartas."
     2. Si confirma → Nueva llamada a IA con mismo spread/cartas
     3. Actualiza interpretación en DB
     4. Muestra nueva interpretación con fade-in
   - **Límite:** Ilimitado (puede regenerar 10+ veces)
   - **Tracking de uso de IA:** +1 request cada regeneración

2. **"Compartir"** (outline, secundario)
   - Igual que FREE (genera token y copia link)

3. **"Nueva Lectura"** (primary, gradiente)
   - Igual que FREE pero sin verificación de límite estricta

---

### 6. Carta del Día (Usuario Premium)

**URL:** `/carta-del-dia`

**Diferencias vs FREE:**

#### Interpretación con IA

**Prompt a IA:**
```
"Genera una interpretación de la Carta del Día para el consultante.

Carta: {cardName} ({orientation})

Proporciona:
1. Mensaje energético del día
2. Áreas de la vida afectadas
3. Consejo práctico para hoy
4. Afirmación positiva

Tono: Inspirador, empático, práctico.
Extensión: 150-200 palabras.
"
```

#### Botón de Regeneración HABILITADO

1. **Click en "Regenerar"**
2. **Modal de confirmación:**
   ```
   "¿Regenerar tu Carta del Día?"

   "Esto creará una nueva interpretación personalizada
   basada en la misma carta. Tu interpretación anterior
   se guardará en el historial."

   [Regenerar]  [Cancelar]
   ```
3. Si confirma → Nueva llamada a IA
4. Actualiza interpretación

---

### 7. Historial (Usuario Premium)

**URL:** `/historial`

**Diferencias vs FREE:**

#### Filtros Adicionales

**Dropdown extra:**
- Filtrar por tipo de spread
  - Todos
  - Carta Única
  - Pasado, Presente, Futuro
  - Cruz Celta
  - Herradura

**Toggle:**
- ☑️ Solo con IA
- ☐ Solo sin IA

#### Indicador de IA en Cards

**Badge en cada ReadingCard:**
- ✨ "Con IA" (si `aiGenerated: true`)
- 📝 "Template" (si `aiGenerated: false`)

---

### 8. Perfil (Usuario Premium)

**URL:** `/perfil`

---

#### Tab 2: Suscripción (versión Premium)

**Información del Plan:**
```
Plan Actual: 💎 Premium
Estado: ✅ Activo
Lecturas hoy: 7 (sin límite)
Próxima facturación: 31 de Enero, 2026

Beneficios Activos:
  ✅ Lecturas ilimitadas
  ✅ Interpretaciones con IA
  ✅ Preguntas personalizadas
  ✅ Todos los spreads
  ✅ Estadísticas avanzadas
  ✅ Sin publicidad
```

**Gestión de Suscripción:**
```
Método de pago: Visa •••• 4242
Próximo cobro: $9.99 USD el 31 Ene 2026

[Actualizar método de pago]  [Cancelar suscripción]
```

**Historial de Pagos:**
```
┌────────────┬──────────┬────────┬──────────┐
│ Fecha      │ Monto    │ Estado │ Recibo   │
├────────────┼──────────┼────────┼──────────┤
│ 31 Dic '25 │ $9.99    │ ✅ Pagado │ [PDF]  │
│ 1 Dic '25  │ $9.99    │ ✅ Pagado │ [PDF]  │
│ 1 Nov '25  │ $9.99    │ ✅ Pagado │ [PDF]  │
└────────────┴──────────┴────────┴──────────┘
```

**Cancelación:**
```
[Cancelar suscripción]

Modal de confirmación:
"¿Estás seguro de que quieres cancelar?"

Perderás:
  ❌ Interpretaciones con IA
  ❌ Preguntas personalizadas
  ❌ Lecturas ilimitadas
  ❌ Spreads avanzados

Tu suscripción seguirá activa hasta: 31 Ene 2026
Después volverás al plan FREE.

[Mantener Premium]  [Confirmar cancelación]
```

---

### 9. Estadísticas Avanzadas (Exclusivo Premium)

**Acceso desde:** Dashboard > StatsSection > "Ver más estadísticas"

**URL:** `/estadisticas`

**Componente:** AdvancedStats (solo Premium)

---

#### Métricas Detalladas

**Grid de KPIs:**
```
┌────────────────────┬────────────────────┬────────────────────┐
│ 📊 Total Lecturas  │ 🤖 Con IA          │ 📝 Sin IA          │
│    127             │    98 (77%)        │    29 (23%)        │
└────────────────────┴────────────────────┴────────────────────┘

┌────────────────────┬────────────────────┬────────────────────┐
│ 📅 Este Mes        │ 🔥 Racha Actual    │ ⏱️ Promedio/Día    │
│    32              │    15 días         │    2.3 lecturas    │
└────────────────────┴────────────────────┴────────────────────┘
```

---

#### Gráficos

**1. Lecturas por Día (últimos 30 días)**
- Line chart
- Eje X: Fechas
- Eje Y: Número de lecturas
- Tooltip con detalle al hover

**2. Distribución por Tipo de Spread**
- Pie chart
- Segmentos: Carta Única (20%), PPF (45%), Cruz Celta (25%), Herradura (10%)

**3. Distribución por Categoría**
- Bar chart horizontal
- Amor: 35%, Carrera: 25%, Espiritual: 20%, General: 15%, Finanzas: 5%

**4. Cartas Más Frecuentes (Top 10)**
- Table con imagen miniatura + nombre + veces aparecida

---

#### Insights Personalizados (IA)

**Sección especial:**
```
✨ Tus Patrones Energéticos

Basándonos en tus últimas 50 lecturas, hemos detectado:

🌙 Temas Recurrentes:
  - Consultastfrecuentemente sobre decisiones profesionales
  - Buscas claridad en relaciones interpersonales
  - Tu energía espiritual ha aumentado en las últimas semanas

🃏 Cartas Guía:
  - El Mago aparece 8 veces (6.3% vs 1.3% esperado)
  - Esto sugiere que estás en un periodo de manifestación activa

📈 Evolución:
  - Tu uso de spreads complejos aumentó 40% este mes
  - Profundizas más en tus consultas (señal de crecimiento)

💡 Recomendación:
  Considera hacer una Cruz Celta sobre "¿Qué necesito integrar
  de mis experiencias recientes?" para cerrar ciclos.
```

---

### 10. Cambio de Tarotista (Sin Cooldown)

**Ubicación:** `/perfil` > Tab "Preferencias" (nuevo)

**Sección: Tarotista Favorito**

**Usuario FREE:**
```
Tarotista actual: Sofía Luminosa
Estilo: Empático y detallado

Último cambio: Hace 15 días
Próximo cambio disponible: En 15 días

[Cambiar tarotista] (disabled)
```

**Usuario PREMIUM:**
```
Tarotista actual: Sofía Luminosa
Estilo: Empático y detallado

Sin límites de cambio ✨

[Cambiar tarotista] (enabled)

Modal al hacer click:
─────────────────────────
Elige tu Tarotista

○ Sofía Luminosa (actual)
  Empático, detallado, enfoque psicológico

○ Marco Estelar
  Directo, práctico, enfoque tradicional

○ Luna Velasco
  Intuitivo, espiritual, enfoque místico

○ Aleatorio (All-Access)
  Cada lectura con un tarotista diferente

[Guardar cambio]
─────────────────────────
```

**Backend:**
```typescript
// PUT /subscriptions/tarotist
{
  tarotistId: 3,  // O null para aleatorio
  subscriptionMode: 'PREMIUM_INDIVIDUAL' | 'PREMIUM_ALL_ACCESS'
}

// Sin cooldown check para Premium
```

---

### Resumen: Ventajas Exclusivas Premium

✅ **SÍ puede (vs FREE):**
- **Interpretaciones con IA personalizadas** (ilimitadas)
- **Preguntas personalizadas** (sin límite de caracteres razonable)
- **Lecturas ilimitadas** (sin límite diario estricto)
- **Todos los spreads** (Cruz Celta, Herradura, futuros)
- **Regenerar interpretaciones** (ilimitadamente)
- **Estadísticas avanzadas** (gráficos, insights IA)
- **Cambiar tarotista favorito** (sin cooldown de 30 días)
- **Sin publicidad** (experiencia premium)

📊 **Tracking y métricas:**
- Todo se registra para estadísticas
- No hay bloqueos por límites

💰 **Valor recibido:**
- $9.99/mes
- Si hace 10 lecturas/mes con IA → ~$1/lectura
- GPT-4 API cuesta ~$0.30-0.50 por interpretación completa
- Valor justo y escalable

---

## Sistema de Conversión (Funnels)

### Estrategia de Conversión en 3 Etapas

El sistema implementa CTAs (Call-to-Actions) estratégicos en puntos clave del journey para convertir usuarios a través del funnel:

```
ANONYMOUS → FREE → PREMIUM
```

**Objetivo:** Maximizar conversión sin ser intrusivo

---

### 1. Conversión: ANONYMOUS → FREE

#### A) RegisterCTAModal

**Ubicación:** [frontend/src/components/features/conversion/RegisterCTAModal.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\RegisterCTAModal.tsx)

**Trigger:** Después de revelar Carta del Día (usuario anónimo)

**Delay:** 2 segundos post-revelación

**Diseño:**
- Modal centrado con backdrop
- Gradiente púrpura-rosa en bordes
- Iconos illustrativos (History, Calendar, Grid)

**Mensaje:**
```
✨ ¿Te gustó tu lectura?

Regístrate gratis para desbloquear más

┌─────────────────────────────────────────┐
│ 📜 Historial de Lecturas                │
│    Guarda y revisa tus consultas        │
│                                         │
│ 📅 2 Lecturas Diarias                   │
│    El doble que sin registro            │
│                                         │
│ 🎴 Todas las Tiradas                    │
│    Accede a todos los spreads básicos   │
└─────────────────────────────────────────┘

[Registrarme Gratis]  [No, gracias]
```

**Tracking:**
```typescript
// Al mostrar modal
trackCTAShown('daily-card-post-reading', 'free');

// Si hace click en "Registrarme"
trackCTAClicked('daily-card-post-reading', 'register');
// → redirect a /registro

// Si hace click en "No, gracias"
trackCTAClicked('daily-card-post-reading', 'dismiss');
dismissCTA('daily-card-post-reading'); // +1 dismissal count
```

**Lógica de dismissals:**
```typescript
// Si usuario rechaza 3+ veces
if (getDismissalCount('daily-card-post-reading') >= 3) {
  // No mostrar más este modal
  // Pero sí mostrar banner sutil en header
}
```

---

#### B) TryWithoutRegisterSection (en Landing)

**Ubicación:** [frontend/src/components/features/home/TryWithoutRegisterSection.tsx](d:\Personal\tarot\frontend\src\components\features\home\TryWithoutRegisterSection.tsx)

**Trigger:** Siempre visible en Home para usuarios no autenticados

**Diseño:**
- Sección destacada con fondo sutil
- Ícono de cartas illustrado
- Badge "Sin compromiso"

**Mensaje:**
```
🎴 Prueba sin compromiso

1 carta aleatoria sin necesidad de registrarte

[Carta del Día Gratis →]
```

**Objetivo:** Reducir fricción inicial, atraer usuarios a probar

---

### 2. Conversión: FREE → PREMIUM

#### A) LimitReachedModal

**Ubicación:** [frontend/src/components/features/conversion/LimitReachedModal.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\LimitReachedModal.tsx)

**Trigger:** Cuando usuario FREE intenta hacer 3ª lectura del día

**Diseño:**
- Modal centrado
- Ícono de lock prominente
- Comparativa de planes

**Mensaje:**
```
🔒 Has alcanzado tu límite diario

Como usuario FREE, tienes 2 lecturas por día
Tu cuota se restablecerá mañana a las 00:00 UTC

┌─────────────────────────────────────────┐
│ Plan FREE (actual)                      │
│ ✓ 2 lecturas/día                        │
│ ✗ Sin interpretaciones IA               │
│                                         │
│ Plan PREMIUM                            │
│ ✓ 3+ lecturas/día (ilimitadas)         │
│ ✓ Interpretaciones con IA              │
│ ✓ Preguntas personalizadas              │
│ ✓ Todos los spreads                     │
│                                         │
│ Solo $9.99/mes                          │
└─────────────────────────────────────────┘

[Actualizar a Premium]  [Volver mañana]
```

**Tracking:**
```typescript
trackModalOpen('limit-reached');
trackUpgradeIntent('limit-reached-free');
```

---

#### B) UpgradeBanner (en resultados de lectura)

**Ubicación:** [frontend/src/components/features/conversion/UpgradeBanner.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\UpgradeBanner.tsx)

**Trigger:** Después de ver resultado de lectura (usuario FREE)

**Posición:** Entre interpretación y botones de acción

**Diseño:**
- Banner horizontal con gradiente
- Borde con glow dorado
- Lista de beneficios compacta

**Mensaje:**
```
🤖 Desbloquea Interpretaciones Personalizadas con IA

✨ Análisis profundo adaptado a tu pregunta
💬 Contexto personalizado según tu situación
🔮 Conexiones únicas entre las cartas
♾️  Regenerar interpretaciones ilimitadas

[Actualizar a Premium - $9.99/mes →]
```

**Tracking:**
```typescript
trackCTAShown('reading-result', 'premium');

// Al hacer click
trackUpgradeIntent('reading-result-banner');
```

---

#### C) UpgradeModal (al intentar usar feature Premium)

**Ubicación:** Usado en múltiples componentes

**Triggers:**
1. Click en textarea de pregunta personalizada (usuario FREE)
2. Click en spread bloqueado (Cruz Celta, Herradura)
3. Click en botón "Regenerar interpretación"
4. Click en "Ver estadísticas avanzadas"

**Diseño:**
- Modal modal con backdrop oscuro
- Ícono de feature bloqueada
- Comparativa de beneficios

**Mensaje (ejemplo: preguntas personalizadas):**
```
✨ Función Premium

Las preguntas personalizadas están disponibles
solo para usuarios Premium

Con Premium también obtienes:
  🤖 Interpretaciones con IA ilimitadas
  🎴 Todos los spreads (Cruz Celta, Herradura)
  📊 Estadísticas avanzadas
  🔄 Regenerar interpretaciones

Desbloquea todo por solo $9.99/mes

[Actualizar a Premium]  [Tal vez después]
```

**Tracking:**
```typescript
// Varía según el trigger
trackUpgradeIntent('custom-question-blocked');
trackUpgradeIntent('advanced-spread-blocked');
trackUpgradeIntent('regenerate-blocked');
```

---

#### D) PremiumPreview (contenido con blur)

**Ubicación:** [frontend/src/components/features/conversion/PremiumPreview.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\PremiumPreview.tsx)

**Uso:** Wrapper para mostrar preview de contenido premium bloqueado

**Ejemplo de implementación:**
```tsx
<PremiumPreview
  onUpgrade={openUpgradeModal}
  message="Interpretación con IA disponible para Premium"
>
  <AIInterpretation content={interpretation} />
</PremiumPreview>
```

**Renderizado:**
- Contenido hijo renderizado con blur (filter: blur(8px))
- Overlay semi-transparente
- Ícono lock centrado
- Texto del mensaje
- Botón CTA "Actualizar a Premium"

---

### 3. Hook de Tracking: useConversionTracking

**Ubicación:** [frontend/src/hooks/utils/useConversionTracking.ts](d:\Personal\tarot\frontend\src\hooks/utils\useConversionTracking.ts)

**Propósito:** Centralizar tracking de eventos de conversión

**Métodos:**

#### trackCTAShown(location, plan)
```typescript
trackCTAShown('daily-card-post-reading', 'free');
// Guarda en localStorage:
// { event: 'cta_shown', location, plan, timestamp }
```

#### trackCTAClicked(location, action)
```typescript
trackCTAClicked('reading-result-banner', 'upgrade');
// Guarda: { event: 'cta_clicked', location, action, timestamp }
```

#### trackModalOpen(modalName)
```typescript
trackModalOpen('limit-reached');
// Guarda: { event: 'modal_open', modal: modalName, timestamp }
```

#### trackUpgradeIntent(source)
```typescript
trackUpgradeIntent('custom-question-blocked');
// Guarda: { event: 'upgrade_intent', source, timestamp }
```

#### dismissCTA(location)
```typescript
dismissCTA('daily-card-post-reading');
// Incrementa contador de dismissals para ese location
// Guarda: { dismissals: { [location]: count } }
```

#### wasCTADismissed(location, threshold = 3)
```typescript
if (wasCTADismissed('daily-card-post-reading')) {
  // No mostrar modal
}
// Verifica si dismissals >= threshold
```

#### getDismissalCount(location)
```typescript
const count = getDismissalCount('daily-card-post-reading');
// Devuelve número de veces que usuario rechazó CTA
```

**Almacenamiento:** localStorage (key: `conversion_tracking`)

**Estructura de datos:**
```json
{
  "events": [
    {
      "event": "cta_shown",
      "location": "daily-card-post-reading",
      "plan": "free",
      "timestamp": "2025-12-31T14:30:00Z"
    },
    {
      "event": "cta_clicked",
      "location": "reading-result-banner",
      "action": "dismiss",
      "timestamp": "2025-12-31T14:35:00Z"
    }
  ],
  "dismissals": {
    "daily-card-post-reading": 2,
    "reading-result-banner": 1
  }
}
```

**Integración futura:**
- Google Analytics 4
- Mixpanel
- Amplitude

**Ejemplo de integración GA4:**
```typescript
trackUpgradeIntent(source) {
  // localStorage
  this.saveEvent({ event: 'upgrade_intent', source });

  // GA4
  if (window.gtag) {
    window.gtag('event', 'upgrade_intent', {
      source: source,
      user_plan: getCurrentUserPlan(),
    });
  }
}
```

---

### 4. Métricas de Conversión (para análisis)

#### Funnel Principal:
```
100 Visitantes anónimos
  ↓ (Carta del Día)
  ↓ (RegisterCTAModal)
 30 Registrados FREE (30% conversión)
  ↓ (Uso regular, límites)
  ↓ (LimitReachedModal, UpgradeBanner)
  6 Upgrade a PREMIUM (20% conversión FREE→PREMIUM)

Conversión total: 6% (visitante → Premium)
```

#### KPIs a monitorear:
1. **Tasa de registro post-Carta del Día:** CTR del RegisterCTAModal
2. **Tasa de upgrade en límite alcanzado:** CTR del LimitReachedModal
3. **Tasa de upgrade en resultado de lectura:** CTR del UpgradeBanner
4. **Engagement con features bloqueadas:** Clicks en features premium
5. **Dismissal rate:** % de usuarios que rechazan CTAs repetidamente

---

## Comparativa de Características

### Tabla Completa: ANONYMOUS vs FREE vs PREMIUM

| Característica | ANONYMOUS | FREE | PREMIUM |
|---|---|---|---|
| **Autenticación** | ❌ No requiere cuenta | ✅ Requiere registro | ✅ Requiere registro + pago |
| **Precio** | $0 | $0 | $9.99/mes |
| **Lecturas diarias** | 1 (solo Carta del Día) | 2 (Carta + 1 tirada) | 3+ (ilimitadas) |
| **Historial guardado** | ❌ No | ✅ Sí | ✅ Sí |
| **Interpretaciones con IA** | ❌ No | ❌ No | ✅ Sí (ilimitadas) |
| **Preguntas personalizadas** | ❌ No | ❌ No | ✅ Sí |
| **Categorías disponibles** | ❌ No (solo Carta del Día) | ✅ Todas las 6 | ✅ Todas las 6 |
| **Preguntas predefinidas** | ❌ No | ✅ Sí | ✅ Sí |
| **Spread: Carta Única** | ❌ No | ✅ Sí | ✅ Sí |
| **Spread: PPF (3 cartas)** | ❌ No | ✅ Sí | ✅ Sí |
| **Spread: Cruz Celta (10)** | ❌ No | ❌ No | ✅ Sí |
| **Spread: Herradura (7)** | ❌ No | ❌ No | ✅ Sí |
| **Regenerar interpretación** | ❌ No | ❌ No | ✅ Sí (ilimitado) |
| **Compartir lecturas** | ❌ No | ✅ Sí (con token) | ✅ Sí (con token) |
| **Estadísticas avanzadas** | ❌ No | ❌ No | ✅ Sí |
| **Cambiar tarotista** | ❌ N/A | ✅ Cada 30 días | ✅ Sin límite |
| **Cuota IA mensual** | 0 (sin acceso) | 0 (sin acceso) | ∞ (ilimitada) |
| **Publicidad** | ✅ Potencialmente | ✅ Potencialmente | ❌ Sin publicidad |
| **Soporte** | ❌ No | Email (48h) | Email prioritario (24h) |

---

### Progresión de Valor

```
ANONYMOUS → FREE → PREMIUM
   $0        $0      $9.99/mes
    ↓         ↓         ↓
 Probar → Descubrir → Dominar
   1        2-6        10+
lectura   lecturas   lecturas
 básica   básicas    con IA
```

**Propuesta de valor escalada:**
1. **ANONYMOUS:** "Prueba gratis, sin fricción"
2. **FREE:** "Descubre el poder del tarot, guarda tu evolución"
3. **PREMIUM:** "Domina tu destino con sabiduría artificial"

---

## Rutas y Navegación

### Mapa Completo de Rutas

#### Rutas Públicas (sin autenticación requerida)

```
/                           → LandingPage (ANONYMOUS) | UserDashboard (AUTH)
/login                      → LoginForm
/registro                   → RegisterForm
/recuperar-password         → ForgotPasswordForm
/carta-del-dia              → DailyCardExperience (permite ambos)
/compartida/[token]         → SharedReadingView (pública con token válido)
```

---

#### Rutas Protegidas (requieren autenticación)

```
/ritual                     → RitualPage (selector de categorías)
/ritual/preguntas           → QuestionSelector (requiere ?categoryId)
/ritual/tirada              → SpreadSelector (requiere ?categoryId&questionId|customQuestion)
/ritual/lectura             → ReadingExperience (requiere ?spreadId&questionId|customQuestion)

/historial                  → ReadingsHistory (lista paginada)
/historial/[id]             → ReadingDetail (detalle de lectura individual)

/perfil                     → PerfilPage (tabs: Cuenta, Suscripción, Ajustes)
/configuracion              → ConfiguracionPage

/estadisticas               → AdvancedStats (solo PREMIUM)
```

---

#### Rutas de Administración (requieren rol ADMIN)

```
/admin                      → AdminDashboard
/admin/usuarios             → UserManagement
/admin/tarotistas           → TarotistManagement
/admin/planes               → PlanConfig
/admin/metricas             → SystemMetrics
/admin/seguridad            → SecuritySettings
/admin/cache                → CacheManagement
/admin/ai-usage             → AIUsageMonitoring
/admin/audit                → AuditLogs
```

**Guard:** [frontend/src/app/admin/layout.tsx](d:\Personal\tarot\frontend\src\app\admin\layout.tsx)

```typescript
if (!user || !user.roles.includes('admin')) {
  router.push('/perfil');
}
```

---

### Navegación Principal (Header)

#### Para Usuarios No Autenticados

```
┌─────────────────────────────────────────────────┐
│ TAROT           [Iniciar Sesión] [Registrarse] │
└─────────────────────────────────────────────────┘
```

---

#### Para Usuarios Autenticados

```
┌──────────────────────────────────────────────────────────────────┐
│ TAROT    Nueva Lectura    Explorar⚠️    Mis Sesiones⚠️      [👤] │
└──────────────────────────────────────────────────────────────────┘
                                                               ↓
                                                         ┌─────────────────┐
                                                         │ Mi Perfil       │
                                                         │ Mis Lecturas    │
                                                         │ Configuración   │
                                                         │ ─────────────── │
                                                         │ Cerrar Sesión   │
                                                         └─────────────────┘
```

**⚠️ Deshabilitados:** Explorar y Mis Sesiones (próximamente)

---

### Breadcrumbs

**Ejemplos de breadcrumbs en páginas internas:**

```
Ritual
Ritual > Amor y Relaciones
Ritual > Amor y Relaciones > Pregunta
Ritual > Amor y Relaciones > Tipo de Tirada
Ritual > Amor y Relaciones > Lectura

Historial
Historial > Lectura del 31 Dic 2025

Perfil > Suscripción
```

---

### Redirecciones Automáticas

#### Post-Login
```typescript
// Si viene de URL con ?redirect
redirect('/ritual');

// Si no, dependiendo del plan:
if (user.plan === 'premium') {
  redirect('/'); // Dashboard con stats
} else {
  redirect('/'); // Dashboard básico
}
```

#### Post-Registro
```typescript
// Siempre a dashboard
redirect('/');
```

#### Post-Upgrade a Premium
```typescript
// Stripe redirige a
redirect('/perfil?success=true');

// Frontend detecta ?success=true
showToast('¡Bienvenido a Premium! 🎉');
redirect('/'); // Dashboard
```

#### Si no autenticado (intenta acceder ruta protegida)
```typescript
redirect(`/login?redirect=${currentPath}`);
```

#### Si no es admin (intenta acceder /admin)
```typescript
redirect('/perfil');
```

---

## Archivos de Referencia

### Backend (NestJS + TypeORM)

#### Entidades
- [backend/tarot-app/src/modules/users/entities/user.entity.ts](d:\Personal\tarot\backend\tarot-app\src\modules\users\entities\user.entity.ts) - Modelo User completo
- [backend/tarot-app/src/common/enums/user-role.enum.ts](d:\Personal\tarot\backend\tarot-app\src\common\enums\user-role.enum.ts) - Roles (CONSUMER, TAROTIST, ADMIN)

#### Guards
- [backend/tarot-app/src/modules/auth/infrastructure/guards/jwt-auth.guard.ts](d:\Personal\tarot\backend\tarot-app\src\modules\auth\infrastructure\guards\jwt-auth.guard.ts) - Autenticación JWT
- [backend/tarot-app/src/common/guards/roles.guard.ts](d:\Personal\tarot\backend\tarot-app\src\common\guards\roles.guard.ts) - Verificación de roles
- [backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.ts](d:\Personal\tarot\backend\tarot-app\src\modules\usage-limits\guards\check-usage-limit.guard.ts) - Límites diarios

#### Servicios
- [backend/tarot-app/src/modules/ai-usage/ai-quota.service.ts](d:\Personal\tarot\backend\tarot-app\src\modules\ai-usage\ai-quota.service.ts) - Gestión de cuotas IA
- [backend/tarot-app/src/modules/subscriptions/subscriptions.service.ts](d:\Personal\tarot\backend\tarot-app\src\modules\subscriptions\subscriptions.service.ts) - Suscripciones a tarotistas

#### Constantes
- [backend/tarot-app/src/modules/ai-usage/constants/ai-usage.constants.ts](d:\Personal\tarot\backend\tarot-app\src\modules\ai-usage\constants\ai-usage.constants.ts) - Cuotas mensuales IA

---

### Frontend (Next.js 14 + React + TypeScript)

#### Stores
- [frontend/src/stores/authStore.ts](d:\Personal\tarot\frontend\src\stores\authStore.ts) - Zustand store de autenticación

#### Types
- [frontend/src/types/user.types.ts](d:\Personal\tarot\frontend\src\types\user.types.ts) - Tipos de usuario (User, UserPlan)
- [frontend/src/types/subscription.types.ts](d:\Personal\tarot\frontend\src\types\subscription.types.ts) - Tipos de suscripción
- [frontend/src/types/admin.types.ts](d:\Personal\tarot\frontend\src\types\admin.types.ts) - Tipos admin (PlanConfig)

#### Componentes de Autenticación
- [frontend/src/components/auth/LoginForm.tsx](d:\Personal\tarot\frontend\src\components\auth\LoginForm.tsx) - Formulario login
- [frontend/src/components/auth/RegisterForm.tsx](d:\Personal\tarot\frontend\src\components\auth\RegisterForm.tsx) - Formulario registro

#### Componentes de Layout
- [frontend/src/components/layout/Header.tsx](d:\Personal\tarot\frontend\src\components\layout\Header.tsx) - Navbar principal
- [frontend/src/components/layout/UserMenu.tsx](d:\Personal\tarot\frontend\src\components\layout\UserMenu.tsx) - Menú de usuario

#### Componentes de Home
- [frontend/src/components/features/home/LandingPage.tsx](d:\Personal\tarot\frontend\src\components\features\home\LandingPage.tsx) - Landing para ANONYMOUS
- [frontend/src/components/features/home/TryWithoutRegisterSection.tsx](d:\Personal\tarot\frontend\src\components\features\home\TryWithoutRegisterSection.tsx) - CTA carta gratis

#### Componentes de Dashboard
- [frontend/src/components/features/dashboard/UserDashboard.tsx](d:\Personal\tarot\frontend\src\components\features\dashboard\UserDashboard.tsx) - Dashboard autenticado
- [frontend/src/components/features/dashboard/WelcomeHeader.tsx](d:\Personal\tarot\frontend\src\components\features\dashboard\WelcomeHeader.tsx) - Header con saludo
- [frontend/src/components/features/dashboard/QuickActions.tsx](d:\Personal\tarot\frontend\src\components\features\dashboard\QuickActions.tsx) - Acciones rápidas
- [frontend/src/components/features/dashboard/StatsSection.tsx](d:\Personal\tarot\frontend\src\components\features\dashboard\StatsSection.tsx) - Estadísticas (Premium)

#### Componentes de Lecturas
- [frontend/src/components/features/readings/QuestionSelector.tsx](d:\Personal\tarot\frontend\src\components\features\readings\QuestionSelector.tsx) - Selector de preguntas
- [frontend/src/components/features/readings/SpreadSelector.tsx](d:\Personal\tarot\frontend\src\components\features\readings\SpreadSelector.tsx) - Selector de spreads
- [frontend/src/components/features/readings/ReadingExperience.tsx](d:\Personal\tarot\frontend\src\components\features\readings\ReadingExperience.tsx) - Experiencia completa de lectura
- [frontend/src/components/features/readings/ReadingsHistory.tsx](d:\Personal\tarot\frontend\src\components\features\readings\ReadingsHistory.tsx) - Historial

#### Componentes de Conversión (TASK-018)
- [frontend/src/components/features/conversion/RegisterCTAModal.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\RegisterCTAModal.tsx) - Modal ANONYMOUS→FREE
- [frontend/src/components/features/conversion/LimitReachedModal.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\LimitReachedModal.tsx) - Modal límite alcanzado
- [frontend/src/components/features/conversion/PremiumPreview.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\PremiumPreview.tsx) - Wrapper blur premium
- [frontend/src/components/features/conversion/UpgradeBanner.tsx](d:\Personal\tarot\frontend\src\components\features\conversion\UpgradeBanner.tsx) - Banner de upgrade

#### Hooks
- [frontend/src/hooks/utils/useConversionTracking.ts](d:\Personal\tarot\frontend\src\hooks\utils\useConversionTracking.ts) - Tracking de conversión
- [frontend/src/hooks/utils/useUserPlanFeatures.ts](d:\Personal\tarot\frontend\src\hooks\utils\useUserPlanFeatures.ts) - Features por plan

#### Páginas (App Router)
- [frontend/src/app/page.tsx](d:\Personal\tarot\frontend\src\app\page.tsx) - Home (dual: Landing | Dashboard)
- [frontend/src/app/ritual/page.tsx](d:\Personal\tarot\frontend\src\app\ritual\page.tsx) - Selector de categorías
- [frontend/src/app/perfil/page.tsx](d:\Personal\tarot\frontend\src\app\perfil\page.tsx) - Perfil con tabs
- [frontend/src/app/admin/layout.tsx](d:\Personal\tarot\frontend\src\app\admin\layout.tsx) - Guard del admin panel

---

### Documentación
- [docs/TECHNICAL_BACKLOG.md](d:\Personal\tarot\docs\TECHNICAL_BACKLOG.md) - Backlog técnico completo
  - **Línea 2043:** TASK-018 (Sistema de CTAs de conversión) - COMPLETADA

---

## Próximos Pasos y Recomendaciones

### 1. Testing con Playwright (opcional)

Si deseas implementar testing end-to-end con Playwright para verificar los journeys de usuario, podrías:

**Instalar Playwright MCP:**
```bash
npm install -g @modelcontextprotocol/server-playwright
```

**Casos de test sugeridos:**
1. **ANONYMOUS Journey:**
   - Visitar home → Click "Probar sin registro" → Revelar carta → Ver RegisterCTAModal

2. **FREE Journey:**
   - Registro → Dashboard → Nueva lectura completa → Verificar límite 2/2 → LimitReachedModal

3. **PREMIUM Journey:**
   - Upgrade → Nueva lectura con pregunta personalizada → Spread Cruz Celta → Ver interpretación IA

---

### 2. Optimizaciones Detectadas

#### Inconsistencias de rutas:
- **UserMenu** hace referencia a `/lecturas` pero la app usa `/historial`
- **QuickActions** hace referencia a `/ritual/tirada` pero debería ser `/ritual`

**Recomendación:** Actualizar links en:
- [frontend/src/components/layout/UserMenu.tsx:45](d:\Personal\tarot\frontend\src\components\layout\UserMenu.tsx#L45)
- [frontend/src/components/features/dashboard/QuickActions.tsx:23](d:\Personal\tarot\frontend\src\components\features\dashboard\QuickActions.tsx#L23)

---

### 3. Features Pendientes

Según TODOs encontrados en el código:

1. **Mobile Navigation Panel** (Header - TASK 2.3)
2. **Link "Explorar"** (requiere soporte multi-tarotista)
3. **Link "Mis Sesiones"** (feature no implementada)
4. **Upload de avatar** (Perfil - Tab Cuenta)

---

### 4. Métricas a Implementar

Integrar `useConversionTracking` con plataforma de analytics:

**Google Analytics 4:**
```typescript
// En cada método del hook
window.gtag('event', 'upgrade_intent', {
  source: source,
  user_plan: user.plan,
  timestamp: new Date().toISOString()
});
```

**Eventos clave a trackear:**
- `cta_shown` - CTA mostrado
- `cta_clicked` - CTA clickeado
- `upgrade_intent` - Intención de upgrade
- `registration_started` - Inicio de registro
- `registration_completed` - Registro exitoso
- `upgrade_started` - Inicio de checkout Stripe
- `upgrade_completed` - Suscripción exitosa
- `reading_completed` - Lectura completada
- `limit_reached` - Límite diario alcanzado

---

## Conclusión

Este documento proporciona un mapeo completo y exhaustivo de las experiencias de los **tres tipos de usuarios** (ANONYMOUS, FREE, PREMIUM) interactuando con la plataforma de Tarot.

**Puntos clave:**
- ✅ Sistema de 3 tiers claro y escalable
- ✅ Funnel de conversión bien diseñado (TASK-018)
- ✅ Guards y permisos robustos
- ✅ Experiencias diferenciadas que incentivan upgrade
- ✅ Tracking preparado para analytics

**Arquitectura sólida** para escalar el negocio a través de conversiones orgánicas y valor percibido en cada tier.

---

**Fecha de generación:** 31 de Diciembre de 2025
**Versión:** 1.0
**Estado del proyecto:** TASK-018 completada, sistema de conversión activo
