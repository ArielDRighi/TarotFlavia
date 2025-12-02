# 🎨 Requerimientos UX/UI - TarotFlavia

**Última actualización:** 2 de Diciembre, 2025  
**Versión:** 1.0.0  
**Proyecto:** TarotFlavia - Plataforma de Lecturas de Tarot con IA

---

## 📋 Índice

1. [Visión General del Producto](#-visión-general-del-producto)
2. [Usuarios y Roles](#-usuarios-y-roles)
3. [Flujos de Usuario](#-flujos-de-usuario)
4. [Pantallas Necesarias](#-pantallas-necesarias)
5. [Componentes Reutilizables](#-componentes-reutilizables)
6. [Estados de UI](#-estados-de-ui)
7. [Copywriting y Mensajes](#-copywriting-y-mensajes)
8. [Reglas de Negocio Visuales](#-reglas-de-negocio-visuales)
9. [Responsive Design](#-responsive-design)
10. [Accesibilidad](#-accesibilidad)
11. [Paleta de Colores Sugerida](#-paleta-de-colores-sugerida)

---

## 🌟 Visión General del Producto

### Concepto
TarotFlavia es una plataforma web de lecturas de tarot personalizadas con inteligencia artificial. Combina la experiencia tradicional del tarot con tecnología moderna para ofrecer interpretaciones profundas y significativas.

### Propuesta de Valor
- **Lecturas personalizadas** con IA avanzada
- **Múltiples tarotistas virtuales** con estilos únicos
- **Sistema de suscripciones** para acceso a más funcionalidades
- **Marketplace de tarotistas** para sesiones en vivo
- **Experiencia visual inmersiva** con animaciones de cartas

### Tono y Personalidad
- **Místico pero accesible**: Evitar lenguaje excesivamente esotérico
- **Cálido y empático**: Como un amigo sabio
- **Profesional pero cercano**: Inspirar confianza
- **Respetuoso y positivo**: Sin predicciones negativas absolutas

---

## 👤 Usuarios y Roles

### Tipos de Usuario

#### 1. Usuario No Registrado (Guest)
- Puede explorar tarotistas
- Puede ver información de spreads/tiradas
- **CTA principal**: Registrarse para primera lectura gratis

#### 2. Usuario FREE
- 3 lecturas diarias con preguntas predefinidas
- Acceso a carta del día
- Un tarotista favorito (cambio mensual)
- Historial de lecturas limitado

#### 3. Usuario PREMIUM ($9.99/mes)
- 50 lecturas diarias
- Preguntas personalizadas libres
- Regeneración de interpretaciones
- Acceso a todos los tarotistas (all-access)
- Historial completo
- Reserva de sesiones

#### 4. Usuario PROFESSIONAL ($29.99/mes)
- Lecturas ilimitadas
- Todas las features Premium
- Prioridad en sesiones
- Descuentos en sesiones en vivo

#### 5. Tarotista
- Dashboard de métricas
- Gestión de disponibilidad
- Confirmación de sesiones
- Personalización de significados de cartas

#### 6. Administrador
- Panel completo de gestión
- Métricas de plataforma
- Gestión de usuarios y tarotistas

### Tabla de Permisos Visual

| Funcionalidad | Guest | FREE | Premium | Professional | Tarotista | Admin |
|---------------|:-----:|:----:|:-------:|:------------:|:---------:|:-----:|
| Ver tarotistas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Registrarse | ✅ | - | - | - | - | - |
| Crear lectura | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Preguntas custom | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Carta del día | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Historial completo | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Regenerar interpretación | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Reservar sesiones | ❌ | ✅ | ✅ | ✅ | - | ✅ |
| Gestionar disponibilidad | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Panel admin | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Flujos de Usuario

### Flujo 1: Registro y Primera Lectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Landing Page  │────▶│    Registro     │────▶│  Verificación   │
│   (CTA visible) │     │  (Email, Pass)  │     │   (Opcional)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Onboarding    │────▶│ Seleccionar     │────▶│   Dashboard     │
│  (Bienvenida)   │     │   Tarotista     │     │   Principal     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Pantallas involucradas:**
1. Landing Page con CTA "Empieza Gratis"
2. Formulario de Registro
3. Pantalla de Bienvenida/Onboarding
4. Selector de Tarotista Favorito (FREE) o explorar todos
5. Dashboard con acceso a primera lectura

---

### Flujo 2: Crear una Lectura (Usuario FREE)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Dashboard    │────▶│   Seleccionar   │────▶│   Seleccionar   │
│  ("Nueva Lect") │     │    Categoría    │     │    Pregunta     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Seleccionar   │────▶│   Animación     │────▶│  Interpretación │
│     Tirada      │     │  Cartas (UX)    │     │    Completa     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │ Guardar/Compart │
                                                │  (Acciones)     │
                                                └─────────────────┘
```

**Estados de UI por paso:**

| Paso | Loading | Empty | Success | Error |
|------|---------|-------|---------|-------|
| Categorías | Skeleton | "Sin categorías" | Lista 6 cats | "Error cargando" |
| Preguntas | Skeleton | "Sin preguntas" | Lista preguntas | "Error cargando" |
| Tiradas | Skeleton | - | Lista 4 tiradas | "Error cargando" |
| Animación | Progress bar | - | Cartas reveladas | "Error generando" |
| Interpretación | Skeleton texto | - | Texto completo | Retry button |

---

### Flujo 3: Crear una Lectura (Usuario PREMIUM)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Dashboard    │────▶│  Elegir Tipo    │────▶│   Seleccionar   │
│  ("Nueva Lect") │     │   de Pregunta   │     │    Tarotista    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
        ┌───────────────┐               ┌───────────────┐
        │  Predefinida  │               │    Custom     │
        │ (Categoría)   │               │   (Textarea)  │
        └───────────────┘               └───────────────┘
                │                               │
                └───────────────┬───────────────┘
                                ▼
                        [Continúa como Flujo 2]
```

**Diferencias visuales PREMIUM:**
- Badge "PREMIUM" visible
- Toggle "Pregunta personalizada"
- Selector de tarotista expandido
- Botón "Regenerar" disponible en interpretación

---

### Flujo 4: Carta del Día

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Dashboard    │────▶│  Animación      │────▶│   Carta +       │
│ ("Carta Día")   │     │  Revelación     │     │ Interpretación  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Estados:**
- **Primera visita del día**: Animación completa de revelación
- **Ya vista hoy**: Muestra directamente la carta del día
- **Premium**: Botón "Regenerar" visible

---

### Flujo 5: Explorar y Seleccionar Tarotista

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Marketplace   │────▶│  Lista/Grid     │────▶│    Perfil       │
│   (Tarotistas)  │     │  Tarotistas     │     │   Detallado     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                        ┌───────────────────────────────┤
                        ▼                               ▼
                ┌───────────────┐               ┌───────────────┐
                │   Marcar      │               │   Reservar    │
                │  Favorito     │               │    Sesión     │
                └───────────────┘               └───────────────┘
```

**Filtros disponibles:**
- Búsqueda por nombre
- Filtro por especialidad (Amor, Trabajo, Salud, etc.)
- Ordenar por: Rating, Lecturas, Nombre

---

### Flujo 6: Reservar Sesión con Tarotista

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Perfil       │────▶│   Calendario    │────▶│   Seleccionar   │
│   Tarotista     │     │  Disponibilidad │     │   Duración      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Agregar      │────▶│   Confirmar     │────▶│   Confirmación  │
│     Notas       │     │    Reserva      │     │  (+ Link Meet)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Duraciones disponibles:** 30, 60, 90 minutos

**Tipos de sesión:**
- 🔮 Lectura de Tarot
- ✨ Limpieza Energética
- 🔯 Péndulo Hebreo
- 💬 Consulta General

---

### Flujo 7: Ver Historial de Lecturas

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Dashboard    │────▶│    Historial    │────▶│    Detalle      │
│  ("Historial")  │     │   (Paginado)    │     │    Lectura      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                        ┌───────────────┼───────────────┐
                                        ▼               ▼               ▼
                                ┌───────────┐   ┌───────────┐   ┌───────────┐
                                │ Compartir │   │ Regenerar │   │ Eliminar  │
                                └───────────┘   └───────────┘   └───────────┘
```

**Filtros del historial:**
- Por tipo de tirada
- Por fecha
- Por categoría
- Incluir eliminadas (papelera)

---

### Flujo 8: Login y Recuperación de Contraseña

```
┌─────────────────┐                     ┌─────────────────┐
│     Login       │────────────────────▶│    Dashboard    │
│  (Email+Pass)   │    [Success]        │                 │
└─────────────────┘                     └─────────────────┘
        │
        │ [¿Olvidaste contraseña?]
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Forgot Pass    │────▶│  Revisar Email  │────▶│  Reset Pass     │
│  (Solo email)   │     │  (Instrucción)  │     │  (Nueva pass)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📱 Pantallas Necesarias

### Públicas (Sin Auth)

| # | Pantalla | Descripción | Prioridad |
|---|----------|-------------|-----------|
| 1 | **Landing Page** | Presentación, CTA registro, testimonios | 🔴 Alta |
| 2 | **Login** | Formulario de acceso | 🔴 Alta |
| 3 | **Registro** | Formulario de registro | 🔴 Alta |
| 4 | **Forgot Password** | Solicitud de reset | 🔴 Alta |
| 5 | **Reset Password** | Nueva contraseña | 🔴 Alta |
| 6 | **Lectura Compartida** | Vista pública de lectura | 🟡 Media |
| 7 | **Explorar Tarotistas** | Lista pública | 🟡 Media |

### Usuario Autenticado

| # | Pantalla | Descripción | Prioridad |
|---|----------|-------------|-----------|
| 8 | **Dashboard** | Home del usuario | 🔴 Alta |
| 9 | **Nueva Lectura - Categorías** | Selector de categorías | 🔴 Alta |
| 10 | **Nueva Lectura - Preguntas** | Selector de pregunta | 🔴 Alta |
| 11 | **Nueva Lectura - Tiradas** | Selector de spread | 🔴 Alta |
| 12 | **Nueva Lectura - Animación** | Revelación de cartas | 🔴 Alta |
| 13 | **Nueva Lectura - Resultado** | Interpretación completa | 🔴 Alta |
| 14 | **Carta del Día** | Daily reading | 🔴 Alta |
| 15 | **Historial** | Lista de lecturas pasadas | 🔴 Alta |
| 16 | **Detalle de Lectura** | Lectura individual | 🔴 Alta |
| 17 | **Perfil/Configuración** | Datos del usuario | 🟡 Media |
| 18 | **Mis Sesiones** | Reservas con tarotistas | 🟡 Media |
| 19 | **Detalle Tarotista** | Perfil + reservar | 🟡 Media |
| 20 | **Calendario Reserva** | Selección de fecha/hora | 🟡 Media |
| 21 | **Upgrade Plan** | Comparativa de planes | 🟡 Media |

### Panel Tarotista

| # | Pantalla | Descripción | Prioridad |
|---|----------|-------------|-----------|
| 22 | **Dashboard Tarotista** | Métricas propias | 🟢 Baja |
| 23 | **Mi Disponibilidad** | Gestión de horarios | 🟢 Baja |
| 24 | **Mis Sesiones** | Confirmar/completar | 🟢 Baja |
| 25 | **Excepciones** | Días bloqueados | 🟢 Baja |

### Panel Admin

| # | Pantalla | Descripción | Prioridad |
|---|----------|-------------|-----------|
| 26 | **Dashboard Admin** | Métricas plataforma | 🟢 Baja |
| 27 | **Gestión Usuarios** | CRUD usuarios | 🟢 Baja |
| 28 | **Gestión Tarotistas** | CRUD tarotistas | 🟢 Baja |
| 29 | **Logs de Auditoría** | Historial acciones | 🟢 Baja |
| 30 | **Configuración Caché** | Admin técnico | 🟢 Baja |

---

## 🧩 Componentes Reutilizables

### Navegación
- **Navbar** (logo, nav links, user menu, CTA upgrade)
- **Sidebar** (para admin/tarotista)
- **Bottom Nav** (móvil)
- **Breadcrumbs**

### Cards
- **TarotCard** (carta individual con animación flip)
- **TarotistaCard** (avatar, nombre, rating, especialidades)
- **ReadingCard** (resumen de lectura para historial)
- **CategoryCard** (icono, nombre, color, descripción)
- **SpreadCard** (nombre, descripción, dificultad, # cartas)
- **SessionCard** (fecha, hora, estado, tarotista)
- **PlanCard** (precio, features, CTA)

### Formularios
- **Input** (text, email, password con toggle)
- **Textarea** (con contador de caracteres)
- **Select** (custom styled)
- **Checkbox/Radio**
- **DatePicker**
- **TimePicker**
- **SearchInput** (con icono y clear)

### Feedback
- **Toast/Notification** (success, error, warning, info)
- **Modal** (confirmación, información)
- **Skeleton** (loading placeholder)
- **EmptyState** (ilustración + mensaje + CTA)
- **ErrorState** (ilustración + mensaje + retry)
- **ProgressBar** (para carga de interpretación)

### Badges y Tags
- **PlanBadge** (FREE, PREMIUM, PROFESSIONAL)
- **RoleBadge** (Admin, Tarotista)
- **StatusBadge** (sesión: pending, confirmed, completed, cancelled)
- **DifficultyBadge** (beginner, intermediate, advanced)
- **CategoryTag** (con color e icono)
- **SpecialtyTag** (especialidades de tarotistas)

### Específicos de Tarot
- **SpreadLayout** (visualización de la tirada con posiciones)
- **CardRevealAnimation** (animación de revelación)
- **InterpretationBlock** (texto con formato markdown)
- **QuestionSelector** (lista de preguntas por categoría)
- **TarotistaSelector** (grid o carousel)

---

## 🔄 Estados de UI

### Por Componente

#### Lista de Lecturas (Historial)
```
┌─────────────────────────────────────────────────────┐
│  LOADING          │  Skeleton cards (3-5)          │
├───────────────────┼─────────────────────────────────┤
│  EMPTY            │  "No tienes lecturas aún"      │
│                   │  [Ilustración]                  │
│                   │  [CTA: Hacer mi primera lect]  │
├───────────────────┼─────────────────────────────────┤
│  SUCCESS          │  Lista de ReadingCards         │
│                   │  + Paginación                  │
├───────────────────┼─────────────────────────────────┤
│  ERROR            │  "Error al cargar lecturas"    │
│                   │  [Botón: Reintentar]           │
└───────────────────┴─────────────────────────────────┘
```

#### Generación de Interpretación
```
┌─────────────────────────────────────────────────────┐
│  LOADING          │  "Consultando los astros..."   │
│                   │  [Progress bar animado]         │
│                   │  [Mensajes rotativos]           │
├───────────────────┼─────────────────────────────────┤
│  SUCCESS          │  Interpretación completa        │
│                   │  [Acciones: Guardar, Compartir]│
├───────────────────┼─────────────────────────────────┤
│  ERROR            │  "No pudimos generar..."       │
│                   │  [Botón: Reintentar]           │
│                   │  [Contactar soporte]           │
└───────────────────┴─────────────────────────────────┘
```

#### Reserva de Sesión
```
┌─────────────────────────────────────────────────────┐
│  LOADING          │  Skeleton calendario           │
├───────────────────┼─────────────────────────────────┤
│  NO_AVAILABILITY  │  "Sin disponibilidad"          │
│                   │  "en las próximas 2 semanas"   │
│                   │  [Ver otros tarotistas]        │
├───────────────────┼─────────────────────────────────┤
│  SUCCESS          │  Calendario con slots          │
├───────────────────┼─────────────────────────────────┤
│  BOOKING          │  "Reservando..."               │
├───────────────────┼─────────────────────────────────┤
│  BOOKED           │  "¡Reserva confirmada!"        │
│                   │  [Detalles + Link Meet]        │
├───────────────────┼─────────────────────────────────┤
│  ERROR            │  "Error al reservar"           │
│                   │  [Reintentar]                  │
└───────────────────┴─────────────────────────────────┘
```

### Estados de Sesión (Badges)

| Estado | Color | Texto | Acción disponible |
|--------|-------|-------|-------------------|
| `pending` | 🟡 Amarillo | "Pendiente" | Cancelar |
| `confirmed` | 🟢 Verde | "Confirmada" | Cancelar (>24h), Ver link |
| `completed` | 🔵 Azul | "Completada" | Dejar review |
| `cancelled_by_user` | 🔴 Rojo | "Cancelada" | - |
| `cancelled_by_tarotist` | 🟠 Naranja | "Cancelada por tarotista" | - |

---

## 💬 Copywriting y Mensajes

### Mensajes de Bienvenida

```
🌟 Onboarding (primera vez):
"¡Bienvenido/a a TarotFlavia! 
Las cartas te esperan para revelarte los secretos del universo.
Tu primera lectura es gratis."

📅 Carta del día (primera del día):
"Buenos días, [Nombre]. 
El universo tiene un mensaje especial para ti hoy."

🔮 Antes de lectura:
"Respira profundo, enfócate en tu pregunta 
y permite que las cartas te guíen."
```

### Mensajes de Loading (Rotativos durante generación)

```
"Consultando con el universo..."
"Las cartas revelan sus secretos..."
"Interpretando las energías..."
"Conectando con tu guía espiritual..."
"El tarot habla..."
"Descifrando los mensajes ocultos..."
"Alineando las energías cósmicas..."
```

### Mensajes de Error

| Código | Mensaje Técnico | Mensaje Usuario |
|--------|-----------------|-----------------|
| 401 | Unauthorized | "Tu sesión ha expirado. Por favor, inicia sesión de nuevo." |
| 403 (límite) | Forbidden | "Has alcanzado tu límite diario de lecturas. ¡Vuélve mañana o mejora a Premium!" |
| 403 (premium) | Forbidden | "Las preguntas personalizadas son exclusivas para usuarios Premium." |
| 404 | Not Found | "Esta lectura no existe o ha sido eliminada." |
| 429 | Too Many Requests | "Demasiadas solicitudes. Espera unos segundos antes de continuar." |
| 500 | Internal Error | "Algo salió mal. Nuestro equipo ya está trabajando en ello." |

### Mensajes de Éxito

```
✅ Lectura guardada:
"Tu lectura ha sido guardada en tu historial."

✅ Lectura compartida:
"¡Listo! Copia el link para compartir tu lectura."

✅ Sesión reservada:
"¡Sesión reservada! Recibirás un email con los detalles."

✅ Plan actualizado:
"¡Bienvenido/a a Premium! Disfruta de todas las funcionalidades."
```

### Textos de Categorías

| Categoría | Icono | Color | Descripción corta |
|-----------|-------|-------|-------------------|
| Amor y Relaciones | ❤️ | #FF6B9D | Consultas sobre amor, pareja y vínculos |
| Carrera y Trabajo | 💼 | #4A90E2 | Guía profesional y oportunidades |
| Dinero y Finanzas | 💰 | #F5A623 | Abundancia y decisiones económicas |
| Salud y Bienestar | 🏥 | #7ED321 | Equilibrio físico y emocional |
| Crecimiento Espiritual | ✨ | #9013FE | Autoconocimiento y propósito |
| Consulta General | 🌟 | #50E3C2 | Visión amplia de tu vida |

### Descripciones de Tiradas

| Tirada | Cartas | Descripción UI |
|--------|--------|----------------|
| **1 Carta** | 1 | Respuesta directa y rápida. Ideal para el día a día. |
| **3 Cartas** | 3 | Pasado, Presente y Futuro. Entiende el flujo de tu situación. |
| **5 Cartas** | 5 | Análisis profundo con obstáculos y resultado. |
| **Cruz Céltica** | 10 | La lectura más completa. Para momentos importantes. |

---

## 📏 Reglas de Negocio Visuales

### Según Plan del Usuario

#### Usuario FREE
- ❌ NO mostrar opción de pregunta personalizada
- ❌ NO mostrar botón "Regenerar interpretación"
- ✅ Mostrar banner "Upgrade a Premium" sutil
- ✅ Mostrar contador de lecturas restantes: "2/3 lecturas hoy"
- ✅ Mostrar "Tarotista favorito" con indicador de cambio mensual

#### Usuario PREMIUM/PROFESSIONAL
- ✅ Mostrar toggle "Pregunta personalizada"
- ✅ Mostrar botón "Regenerar" en interpretaciones
- ✅ Mostrar badge "PREMIUM" en navbar
- ✅ Mostrar selector completo de tarotistas
- ❌ NO mostrar banners de upgrade

### Según Estado de Sesión

| Estado | Botones visibles | Color card |
|--------|------------------|------------|
| pending | [Cancelar] | Fondo amarillo suave |
| confirmed | [Cancelar]*, [Ver Meet] | Fondo verde suave |
| completed | [Dejar Review] | Normal |
| cancelled | - | Opacidad reducida |

*Solo si faltan >24h para la sesión

### Límites de Texto

| Campo | Mín | Máx | Contador visible |
|-------|-----|-----|------------------|
| Pregunta personalizada | 10 | 500 | Sí, desde 400 |
| Notas de sesión | 0 | 500 | Sí, desde 400 |
| Review de tarotista | 10 | 1000 | Sí, desde 800 |
| Nombre de usuario | 1 | 255 | No |
| Contraseña | 6 | 128 | No |

---

## 📱 Responsive Design

### Breakpoints Sugeridos

| Breakpoint | Ancho | Dispositivo |
|------------|-------|-------------|
| `xs` | 0-479px | Móvil pequeño |
| `sm` | 480-767px | Móvil grande |
| `md` | 768-1023px | Tablet |
| `lg` | 1024-1279px | Laptop |
| `xl` | 1280px+ | Desktop |

### Adaptaciones por Breakpoint

#### Móvil (xs, sm)
- Navbar colapsada en hamburger menu
- Bottom navigation fija
- Cards a ancho completo
- Spread de cartas vertical
- Modales a pantalla completa

#### Tablet (md)
- Sidebar colapsable
- Grid de 2 columnas para cards
- Spread de cartas ajustado

#### Desktop (lg, xl)
- Sidebar visible
- Grid de 3-4 columnas
- Spread de cartas horizontal
- Tooltips en hover

### Puntos Críticos de UX Móvil

1. **Animación de cartas**: Simplificar en móvil (menos partículas)
2. **Texto de interpretación**: Fuente legible (mín 16px)
3. **Botones**: Área táctil mínima 44x44px
4. **Formularios**: Inputs grandes, teclado apropiado
5. **Calendario**: Vista mensual scrolleable

---

## ♿ Accesibilidad

### Requisitos WCAG 2.1 AA

#### Contraste
- Texto normal: Ratio mínimo 4.5:1
- Texto grande (>18px): Ratio mínimo 3:1
- Elementos interactivos: Indicador de focus visible

#### Navegación por Teclado
- Todos los elementos interactivos accesibles con Tab
- Focus visible y claro
- Skip links al contenido principal
- Escape para cerrar modales

#### Lectores de Pantalla
- Alt text en todas las imágenes de cartas
- Aria-labels en botones con solo iconos
- Aria-live para notificaciones
- Headings jerárquicos (h1 > h2 > h3)

#### Formularios
- Labels asociados a inputs
- Mensajes de error vinculados
- Instrucciones claras antes del campo
- Indicador de campo requerido

### Textos Alternativos para Cartas

```
Ejemplo para "El Mago":
alt="Carta El Mago - Arcano Mayor número 1. 
Un hombre con una varita señalando al cielo y a la tierra, 
representando el poder de manifestación."

Si está invertida:
alt="Carta El Mago invertida - Arcano Mayor número 1."
```

---

## 🎨 Paleta de Colores Sugerida

### Colores Principales

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Primary** | #6B46C1 | CTAs, links activos, acentos |
| **Primary Dark** | #553C9A | Hover states |
| **Primary Light** | #9F7AEA | Backgrounds sutiles |
| **Secondary** | #F6AD55 | Destacados, badges premium |
| **Background** | #1A1A2E | Fondo principal (dark mode) |
| **Surface** | #16213E | Cards, modales |
| **Text Primary** | #FFFFFF | Texto principal |
| **Text Secondary** | #A0AEC0 | Texto secundario |

### Colores Semánticos

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Success** | #48BB78 | Confirmaciones, completado |
| **Warning** | #ECC94B | Advertencias, pendiente |
| **Error** | #F56565 | Errores, cancelado |
| **Info** | #4299E1 | Información |

### Colores de Categorías (del backend)

| Categoría | Hex |
|-----------|-----|
| Amor | #FF6B9D |
| Trabajo | #4A90E2 |
| Dinero | #F5A623 |
| Salud | #7ED321 |
| Espiritual | #9013FE |
| General | #50E3C2 |

### Tema Sugerido

**Recomendación**: Dark mode como predeterminado para evocar misticismo.

```css
/* Variables CSS sugeridas */
:root {
  --color-primary: #6B46C1;
  --color-secondary: #F6AD55;
  --color-background: #1A1A2E;
  --color-surface: #16213E;
  --color-text: #FFFFFF;
  --color-text-muted: #A0AEC0;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
}
```

---

## 📎 Anexos

### Preguntas Predefinidas por Categoría

#### ❤️ Amor y Relaciones (8)
1. ¿Qué debo saber sobre mi vida amorosa en este momento?
2. ¿Cómo puedo mejorar mi relación de pareja actual?
3. ¿Qué energías rodean mi búsqueda del amor?
4. ¿Esta persona es adecuada para mí en este momento?
5. ¿Cómo puedo superar una ruptura o desencuentro amoroso?
6. ¿Qué aspectos debo trabajar en mí para atraer el amor?
7. ¿Cuál es el mayor desafío en mi relación actual?
8. ¿Qué lección debo aprender de mis experiencias amorosas?

#### 💼 Carrera y Trabajo (8)
1. ¿Qué oportunidades laborales se presentan para mí?
2. ¿Es este el momento adecuado para cambiar de trabajo?
3. ¿Cómo puedo desarrollar mi carrera profesional?
4. ¿Qué energías rodean mi situación laboral actual?
5. ¿Debo emprender un nuevo proyecto o negocio?
6. ¿Qué habilidades debo desarrollar para crecer profesionalmente?
7. ¿Cómo mejorar mi relación con compañeros y superiores?
8. ¿Qué me impide avanzar en mi carrera?

*(Ver archivo completo de preguntas en el backend)*

---

## 📝 Notas para el Diseñador

1. **Priorizar el flujo de lectura**: Es el core del producto
2. **Las animaciones son importantes**: Crean la experiencia mística
3. **Dark mode preferido**: Evoca el ambiente esotérico
4. **Accesibilidad no negociable**: Importante para SEO y usuarios
5. **Mobile-first**: La mayoría de consultas de tarot son impulsivas (móvil)
6. **Onboarding suave**: No abrumar al usuario nuevo
7. **CTAs de upgrade sutiles**: No ser agresivo con la monetización

---

**Documento preparado por:** Análisis de Backend TarotFlavia  
**Para:** Equipo de Diseño UX/UI  
**Fecha:** 2 de Diciembre, 2025
