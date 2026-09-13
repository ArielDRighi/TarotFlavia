# 🎨 Design Hand-off: Auguria

**Última actualización:** 2 de Diciembre, 2025  
**Versión:** 1.0.0  
**Diseñador:** UX/UI Team  
**Documento relacionado:** [UX_UI_REQUIREMENTS.md](./UX_UI_REQUIREMENTS.md)

---

## 📋 Índice

1. [Design Tokens](#-1-design-tokens)
2. [Componentes Core](#-2-componentes-core)
3. [Pantallas - Prioridad Alta](#-3-pantallas---prioridad-alta)
4. [Pantallas - Prioridad Media](#-4-pantallas---prioridad-media)
5. [UI Kit - Componentes Reutilizables](#-5-ui-kit---componentes-reutilizables)
6. [Iconografía](#-6-iconografía)
7. [Checklist de Implementación](#-7-checklist-de-implementación)

---

## 🎨 1. Design Tokens

> **Instrucción para IA:** Configura el archivo `tailwind.config.js` con un tema único (Light). No configures dark mode.

### Colores Base

| Token          | Valor     | Uso                                       |
| -------------- | --------- | ----------------------------------------- |
| `bg-main`      | `#F9F7F2` | Crema Papiro - Fondo de todas las páginas |
| `surface`      | `#FFFFFF` | Blanco Puro - Tarjetas, Modales, Sidebar  |
| `text-primary` | `#2D3748` | Gris Grafito - Títulos y párrafos         |
| `text-muted`   | `#718096` | Gris Suave - Fechas y subtítulos          |

### Colores de Marca

| Token            | Valor     | Uso                                                |
| ---------------- | --------- | -------------------------------------------------- |
| `primary`        | `#805AD5` | Lavanda Místico - Botones principales, enlaces     |
| `secondary`      | `#D69E2E` | Dorado Mate - Bordes, iconos especiales, estrellas |
| `accent-success` | `#48BB78` | Verde - Confirmaciones                             |

### Tipografía

| Tipo     | Familia      | Recomendación                         |
| -------- | ------------ | ------------------------------------- |
| Headings | `font-serif` | Cormorant Garamond o Playfair Display |
| Body     | `font-sans`  | Lato o Inter                          |

### Estilos Globales

| Propiedad    | Valor                                                    |
| ------------ | -------------------------------------------------------- |
| Bordes       | `rounded-xl` (12px) o `rounded-2xl` (16px) para tarjetas |
| Sombra suave | `0 4px 20px -2px rgba(128, 90, 213, 0.1)`                |

### Configuración Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-main': '#F9F7F2',
        surface: '#FFFFFF',
        'text-primary': '#2D3748',
        'text-muted': '#718096',
        primary: '#805AD5',
        secondary: '#D69E2E',
        'accent-success': '#48BB78',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        sans: ['Lato', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(128, 90, 213, 0.1)',
      },
    },
  },
};
```

---

## 🧱 2. Componentes Core

### A. Layout Principal (App Shell)

- **Header:** Logo centrado (Tipografía Serif). A la derecha: Menú usuario y botón "Mis Sesiones"
- **Background:** Color `bg-main` con textura SVG de "ruido" al 5% de opacidad (efecto papel)
- **Footer:** Simple con enlaces legales

### B. Tarot Card Component

| Estado                   | Descripción                                       | Estilos                                          |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------ |
| **Reverso** (boca abajo) | Imagen del dorso con patrón geométrico dorado     | `hover:transform: translateY(-5px)`, `shadow-lg` |
| **Anverso** (revelada)   | Imagen de la carta (Arcano)                       | Esquinas redondeadas                             |
| **Accesibilidad**        | Propiedad `alt` obligatoria describiendo la carta | -                                                |

### C. Botonera de Acción

| Botón  | Texto            | Estilo                                           |
| ------ | ---------------- | ------------------------------------------------ |
| IA     | "Lectura Ahora"  | Outline con borde dorado y texto dorado          |
| Humano | "Agendar Sesión" | Solid fondo Lavanda (`bg-primary`), texto blanco |

---

## 📱 3. Pantallas - Prioridad ALTA

### 3.1 Login & Registro (Auth Flow)

**Prompt para IA:**

```
Crea una página de Login y Registro centrada.

- Fondo: Color bg-main (#F9F7F2)
- Contenedor: Una tarjeta blanca (bg-white) centrada, con shadow-soft y bordes rounded-2xl

Header:
- Logo centrado arriba
- Título Serif: 'Bienvenido al Oráculo'

Formulario:
- Inputs con fondo gris muy pálido (bg-gray-50), borde suave
- Al enfocar (focus), el borde cambia a color primary (Lavanda)
- Botón principal ancho completo color primary

Footer:
- Enlace discreto '¿Olvidaste tu contraseña?' y 'Crear cuenta nueva'

Feedback:
- Espacio reservado para alertas de error (texto rojo suave) arriba del botón
```

---

### 3.2 Explorar Tarotistas (Marketplace)

**Prompt para IA:**

```
Crea la pantalla Explorar Tarotistas.

Header:
- Título Serif 'Nuestros Guías Espirituales'
- Barra de búsqueda debajo
- Filtros (Chips redondeados: 'Amor', 'Dinero', 'Salud')

Grid:
- CSS Grid responsive: 1 columna en móvil, 3 en desktop

Componente TarotistCard (repetible):
- Fondo blanco, sombra suave
- Imagen: Foto de perfil circular grande con aro dorado (border-secondary)
- Info: Nombre (Serif bold), Estrellas de rating (color dorado), Badges de especialidad (etiquetas pasteles)
- Disponibilidad: Punto verde/gris junto al nombre indicando estado
- Acción: Botón 'Ver Perfil' (Outline Lavanda) y precio/sesión

Empty State:
- Si el filtro no devuelve nada, mostrar ilustración y texto 'No encontramos guías con ese criterio'
```

---

### 3.3 El Ritual (Lectura IA)

**Prompt para IA:**

```
Crea un componente ReadingRoom con 3 estados.

Estado 1 (Input):
- Input text limpio y grande: '¿Qué inquieta tu alma hoy?'
- Grid de cartas boca abajo (dorsos)
- Interacción: Al hacer clic en una carta, se marca con borde lavanda

Estado 2 (Loading):
- Oculta el grid
- Animación suave de pulso
- Textos rotativos: 'Consultando con el universo...', 'Alineando energías...'

Estado 3 (Resultado):
- Carta revelada en grande (centrada)
- Texto de interpretación en markdown, tipografía Sans-Serif gris oscuro
- Botón 'Guardar Lectura' al final
```

---

### 3.4 Historial de Lecturas

**Prompt para IA:**

```
Crea la pantalla Historial de Lecturas.

Layout:
- Lista vertical de tarjetas

Empty State:
- Si no hay lecturas, mostrar icono de carta gris
- Texto: 'Tu destino aún no ha sido revelado. Haz una lectura hoy.'

Componente ReadingItem (tarjeta fila):
- Izquierda: Icono o miniatura de la carta principal revelada
- Centro: Título grande (pregunta realizada), Fecha relativa ('hace 2 días') en gris
- Derecha: Badge del tipo de tirada (ej: 'Cruz Celta') y botón icono 'Ver' (ojo o flecha)

Filtros:
- Dropdown simple arriba a la derecha para filtrar por fecha
```

---

### 3.5 Carta del Día (Daily Card)

**Prompt para IA:**

```
Crea la pantalla Carta del Día con lógica de estado.

Estado 'Bloqueado' (Antes de tirar):
- Dorso de carta con diseño místico centrado en pantalla
- Animación: Carta 'flota' suavemente (bounce o pulse lenta)
- Texto: 'Conecta con tu energía y toca la carta'

Estado 'Revelado' (Después de tirar):
- Imagen de la carta (Arcano) grande
- Título de la carta en Serif Grande y color Dorado
- Texto de interpretación debajo (alineado izquierda, legible)
- Botón flotante o fijo abajo: 'Compartir Mensaje'

Restricción:
- Si es usuario Free y ya la vio, mostrar la carta directamente sin animación
```

---

### 3.6 Mi Perfil

**Prompt para IA:**

```
Crea la pantalla de Perfil de Usuario.

Encabezado:
- Tarjeta con fondo gradiente suave Lavanda
- Avatar del usuario y Nombre
- Badge de Plan actual (ej: 'PREMIUM' en dorado)

Menú de Pestañas (Tabs):
- 'Cuenta', 'Suscripción', 'Ajustes'

Sección Suscripción:
- Muestra plan actual y fecha de renovación
- Tabla de comparación visual: Lista de beneficios con 'Checks' verdes
- Botón llamativo: 'Mejorar a Premium'

Botones de Acción:
- 'Cerrar Sesión' (Gris outline)
- 'Eliminar Cuenta' (Texto rojo pequeño al final)
```

---

## 📄 4. Pantallas - Prioridad MEDIA

### 4.1 Home / Perfil Tarotista

**Prompt para IA:**

```
Crea un componente TarotistProfile.

Estilo:
- Fondo color crema (#F9F7F2)
- Tipografía Serif elegante

Estructura:
- Hero Section: Foto circular grande con borde dorado. Nombre debajo y badges de especialidad ('Amor', 'Trabajo') con colores pastel
- Bio: Texto breve inspirador
- Selector de Servicio (Card):
  - Opción A: 'Oráculo Digital'. Icono de carta. Botón: 'Preguntar al Tarot (Gratis)'
  - Opción B: 'Sesión Privada'. Icono de calendario. Botón: 'Ver Disponibilidad'
- Footer: Enlaces legales
- Botones con hover:scale-105
```

---

### 4.2 Calendario de Reservas

**Prompt para IA:**

```
Crea un componente BookingCalendar integrado con el perfil.

Vista:
- Días como 'Píldoras' horizontales (scroll lateral en móvil)

Slots:
- Al tocar un día, mostrar horas disponibles abajo como chips clicables

Estados:
- Día seleccionado: Fondo Dorado, texto blanco
- Día ocupado: Gris claro, no clicable

Confirmación:
- Al elegir hora, mostrar resumen 'Reserva de 30 min' y botón 'Confirmar y Pagar'
- Colores suaves y sombras sutiles
```

---

## 🧩 5. UI Kit - Componentes Reutilizables

### 5.1 Feedback System

#### ToastNotification

```
Crea un componente ToastNotification.

- Posición: Flotante, esquina superior derecha
- Fondo blanco, sombra fuerte
- Borde izquierdo de color según tipo:
  - Verde (Éxito) con icono Check
  - Rojo (Error) con icono X
  - Azul (Info) con icono i
- Animación de entrada: slide-in
```

#### ConfirmationModal

```
Crea un componente ConfirmationModal.

- Overlay: Fondo oscuro semitransparente
- Ventana central blanca con rounded-lg
- Header: Título y botón cerrar (X)
- Footer: Dos botones
  - 'Cancelar' (Gris)
  - 'Confirmar' (Color primario o Rojo si es destructivo)
```

---

### 5.2 Estados de Carga y Error

#### SkeletonCard

```
Crea un componente SkeletonCard.

- Rectángulo gris pulsante (animate-pulse)
- Simula la forma de una tarjeta de tarotista:
  - Círculo para foto
  - Líneas para texto
```

#### ErrorDisplay

```
Crea un componente ErrorDisplay.

- Icono de advertencia grande (color rojo suave)
- Texto: 'Los astros no responden (Error de conexión)'
- Botón: 'Intentar de nuevo'
```

#### EmptyState

```
Crea un componente EmptyState genérico.

Props: icon, title, message, actionButton
- Diseño centrado verticalmente
- Ilustración o icono suave
```

---

### 5.3 Badges

#### PlanBadge

| Plan           | Estilo                                                   |
| -------------- | -------------------------------------------------------- |
| `FREE`         | Fondo gris, texto oscuro                                 |
| `PREMIUM`      | Fondo amarillo pálido, texto dorado oscuro, borde dorado |
| `PROFESSIONAL` | Fondo negro/oscuro                                       |

#### StatusBadge (Sesiones)

| Estado      | Color    |
| ----------- | -------- |
| `PENDING`   | Amarillo |
| `CONFIRMED` | Verde    |
| `COMPLETED` | Azul     |
| `CANCELLED` | Rojo     |

**Prompt para IA:**

```
Crea un componente StatusBadge que reciba una propiedad status o plan.

Planes:
- FREE: Fondo gris, texto oscuro
- PREMIUM: Fondo amarillo pálido, texto dorado oscuro, borde dorado

Sesiones:
- PENDING: Amarillo
- CONFIRMED: Verde
- COMPLETED: Azul
- CANCELLED: Rojo
```

---

### 5.4 SessionCard

```
Crea un componente SessionCard para el listado 'Mis Sesiones'.

- Tarjeta horizontal
- Muestra: Fecha/Hora, Avatar Tarotista, Tipo de sesión
- Incluye StatusBadge según estado (Pending, Confirmed, etc.)
```

---

## 🪄 6. Iconografía

> Regla T-UI-12 (12 de septiembre de 2026). **Ningún emoji del sistema en texto user-facing**:
> se ven distintos en cada SO/navegador y rompen la línea visual. El guardarraíl
> `frontend/src/no-emoji-user-facing.test.ts` lo hace cumplir.

### Línea visual de los iconos de dominio

Line-art en **dorado metálico (`#D69E2E`)** de trazo fino con brillo cálido suave, filigrana
ornamental delicada, algún destello de 4 puntas y polvo de estrellas tenue alrededor del sujeto.
Un solo sujeto centrado, composición simétrica y márgenes generosos (el sujeto ocupa ~70 % del
lienzo). Legible a 48 px: sin detalle diminuto, no más de 3 niveles de detalle. Sin texto ni
números. Es la misma línea que las ilustraciones de `public/images/enciclopedia|premium|dashboard`.

Se generan con Gemini (Nano Banana) sobre **fondo blanco puro** y se post-procesan a **WebP 512×512
con alfa** (`npm run icons:process` en `frontend/`), así el mismo asset sirve sobre tarjeta crema /
blanca y sobre fondo cósmico violeta. Los prompts completos, familia por familia, están en
`docs/BACKLOG_CONSISTENCIA_UI.md` (T-UI-12).

### Regla de decisión (qué va con qué)

| Tipo de icono | Solución | Ejemplos |
| --- | --- | --- |
| **Iconografía de dominio**: signos, animales chinos, elementos, palos, áreas del horóscopo, fases lunares, categorías de rituales, arquetipos numerológicos, hubs | **Asset de marca** en `public/images/icons/<familia>/<slug>.webp` vía `<BrandIcon family name />` (`frontend/src/components/ui/brand-icon.tsx`). Inventario tipado en `frontend/src/lib/constants/brand-icons.ts` | ♈ 🐉 🔥 🌕 ❤️ 👑 🔮 → `zodiac/aries`, `chinese/dragon`, `elements/fire`, `moon/full_moon`, `areas/love`, `numerology/1`, `hubs/tarot` |
| **Iconografía de UI genérica**: acciones, estados, avisos | **`lucide-react`** (ya es la librería del sitio). Listas de beneficios con `<CheckItem>` | ✓ → `Check`, 💡 → `Lightbulb`, 🎉 → `PartyPopper`, ⭐ → `Star`, 🔔 → `Bell`, 🎁 → `Gift`, ⚙️ → `Settings`, ✨ → `Sparkles`, 💎 → `Gem` |
| **Notación astrológica** de la carta natal (`birth-chart.enums.ts`: ☉ ☽ ☿ ♀ ♂ … ☌ ☍ ⚹) | **Se mantiene como texto plano** (`ZODIAC_SIGNS[x].symbol` / `PLANETS[x].symbol`): es notación estándar de la disciplina, no decoración | ☉ ☽ ♃ |
| **Ornamentos tipográficos** sin presentación emoji en Unicode | Se permiten como texto en `text-secondary` | ✦ (separador editorial) |
| **Emojis en encabezados de texto** (`service-intros.data.ts`) | Se quitan del string; si hace falta icono, va como `<BrandIcon>` al lado | "🗂️ Los Arcanos Menores" → "Los Arcanos Menores" |
| **Texto de compartir** (`navigator.share`, WhatsApp) | Puede llevar emojis: no lo renderiza el sitio | 🌟 ✨ en `DailyReadingCard` |
| Panel de admin | Fuera de alcance (solo administradores) | `ChineseHoroscopeAdminPanel`, `AIUsageAlerts` |

### Uso de `<BrandIcon>`

```tsx
<BrandIcon family="zodiac" name="aries" size="lg" />            // role="img", alt "Aries"
<BrandIcon family="chinese" name="dragon" decorative />          // aria-hidden (el texto de al lado ya lo nombra)
<BrandIcon family="areas" name="love" label="Amor y relaciones" size="sm" />
```

Tamaños: `sm` 20 px (≈ `text-xl`), `md` 32 px (≈ `text-2xl`/`3xl`), `lg` 48 px (≈ `text-4xl`/`5xl`),
`xl` 72 px, `2xl` 112 px (encabezado de ficha).

**`frame="medallion"` es el tratamiento por defecto en grillas, encabezados y tarjetas:** disco
lavanda-violeta (`#8B5CF6 → #5B3AA6`) con borde dorado fino y el icono avivado. Un line-art de trazo
fino no lee sobre blanco/crema a estos tamaños; sobre el violeta de marca sí. Diámetros 28/44/64/96/144.
En `sm`/`md` (28–44 px) el medallón es **claro** (`#F5F1FF → #E6DDFB`, dorado sin avivar): a ese tamaño
el disco violeta pesa más que el icono; es el que llevan chips, badges y selectores. Sin medallón
sólo para iconos chicos en línea con texto corrido (filas de puntaje, metadatos de ficha). `priority` sólo above-the-fold; por defecto es lazy. El máster de 512 px pesa
27–48 KB por el halo (degradé de alfa); lo que se sirve a 48–128 px son 1,5–6 KB, que es lo que
cuenta para LCP en `/horoscopo` y `/horoscopo-chino`.

---

## ✅ 7. Checklist de Implementación

### Fase 1: Setup & UI Kit

- [ ] Configurar Tailwind con los Design Tokens del Punto 1
- [ ] Generar componentes de feedback (Toast, Modal)
- [ ] Generar componentes de estado (Skeleton, Error, Empty)
- [ ] Generar Badges (Plan, Status)

### Fase 2: Layout Shell

- [ ] Generar Navbar responsive
- [ ] Generar Footer
- [ ] Aplicar fondo crema con textura

### Fase 3: Pantallas Core

- [ ] Auth Flow (Login, Registro, Recuperar contraseña)
- [ ] Explorar Tarotistas (Marketplace)
- [ ] El Ritual (Lectura IA)
- [ ] Historial de Lecturas
- [ ] Carta del Día
- [ ] Mi Perfil

### Fase 4: Pantallas Secundarias

- [ ] Home / Perfil Tarotista
- [ ] Calendario de Reservas
- [ ] Mis Sesiones (usando SessionCard)

### Fase 5: Integración

- [ ] Conectar componentes a API endpoints
- [ ] Implementar estados de carga reales
- [ ] Testing de flujos completos

---

## 📚 Referencias

- **Requerimientos completos:** [UX_UI_REQUIREMENTS.md](./UX_UI_REQUIREMENTS.md)
- **API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Estado del MVP:** [MVP_ESTADO_ACTUAL.md](./MVP_ESTADO_ACTUAL.md)
