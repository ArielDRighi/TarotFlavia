# 📝 MVP Features Breakdown - TarotFlavia

> **Documento de Análisis de Features**  
> Fecha: 18 Diciembre 2025  
> Versión: 1.0  
> **Propósito:** Desglose detallado de features del MVP_STRATEGY_SUMMARY para análisis de implementación

---

## 📚 Índice de Features

### CORE FEATURES (MVP)

1. [Sistema de Tiers de Usuario](#f001-sistema-de-tiers-de-usuario)
2. [Control de Límites por Tier](#f002-control-de-límites-por-tier)
3. [Tracking de Usuarios Anónimos](#f003-tracking-de-usuarios-anónimos)
4. [Sistema de Tiradas para Usuarios Anónimos](#f004-sistema-de-tiradas-para-usuarios-anónimos)
5. [Sistema de Tiradas para Usuarios Free](#f005-sistema-de-tiradas-para-usuarios-free)
6. [Sistema de Tiradas para Usuarios Premium](#f006-sistema-de-tiradas-para-usuarios-premium)
7. [Información Estática de Cartas](#f007-información-estática-de-cartas)
8. [Historial Limitado (Free)](#f008-historial-limitado-free)
9. [Historial Ilimitado (Premium)](#f009-historial-ilimitado-premium)
10. [Sistema de Compartir Lecturas](#f010-sistema-de-compartir-lecturas)
11. [Sistema de Categorías (Premium Only)](#f011-sistema-de-categorías-premium-only)
12. [Sistema de Preguntas (Premium Only)](#f012-sistema-de-preguntas-premium-only)
13. [Interpretación IA (Premium Only)](#f013-interpretación-ia-premium-only)
14. [Tarotista por Defecto (Flavia)](#f014-tarotista-por-defecto-flavia)
15. [Home Page Dual (Landing + Dashboard)](#f015-home-page-dual-landing--dashboard)
16. [Sistema de Monetización con Google Ads](#f016-sistema-de-monetización-con-google-ads)
17. [Sistema de Registro y Autenticación](#f017-sistema-de-registro-y-autenticación)
18. [Sistema de Conversión (Funnels)](#f018-sistema-de-conversión-funnels)
19. [Sistema de Trial Premium (7 días)](#f019-sistema-de-trial-premium-7-días)
20. [Estadísticas Avanzadas (Premium)](#f020-estadísticas-avanzadas-premium)

### POST-MVP FEATURES

21. [Marketplace de Tarotistas](#f021-marketplace-de-tarotistas-post-mvp)
22. [Sistema de Rating de Tarotistas](#f022-sistema-de-rating-de-tarotistas-post-mvp)
23. [Selector de Tarotistas](#f023-selector-de-tarotistas-post-mvp)
24. [Rankings por Categoría](#f024-rankings-por-categoría-post-mvp)
25. [Badges de Tarotistas](#f025-badges-de-tarotistas-post-mvp)

---

## 🎯 CORE FEATURES (MVP)

---

### F001: Sistema de Tiers de Usuario

**Descripción:** Sistema de diferenciación de usuarios en 3 niveles (Anónimo, Free, Premium) con capacidades distintas.

**Alcance:**

- Tier 1: Usuario Anónimo (sin registro, sin autenticación)
- Tier 2: Usuario Free Registrado (autenticado, plan gratuito)
- Tier 3: Usuario Premium (autenticado, plan de pago)

**Lógica de Negocio:**

- Identificación automática del tier del usuario
- Permisos y restricciones basadas en tier
- Redirección a upgrade cuando se intenta acceder a features premium

**Entidades Afectadas:**

- `User` (campo `subscriptionPlan`: 'free' | 'premium')
- Middleware de autorización por tier
- Guards para proteger endpoints

**Dependencias:**

- F017: Sistema de Registro y Autenticación
- F003: Tracking de Usuarios Anónimos

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **EXISTE** sistema de planes: `free`, `premium`, `professional`
- ⚠️ **REQUIERE ADAPTACIÓN:** Antes `premium` = acceso a 1 tarotista, `professional` = acceso a todos. Ahora: eliminar `professional`, ajustar lógica.
- ✅ Existe **Admin Dashboard** para gestionar contenido de cada plan
- 🔧 **ACCIÓN:** Migrar de 3 planes a 2 planes (free, premium)

**Status:** ⚠️ EXISTE - REQUIERE MODIFICACIÓN

---

### F002: Control de Límites por Tier

**Descripción:** Sistema de control de cuotas y límites diarios/mensuales por tier de usuario.

**Alcance:**

- **Anónimo:** 1 carta/día (tracking por IP/cookie)
- **Free:** 1 tirada de 1 carta/día + 1 tirada de 3 cartas/día
- **Premium:** 3 tiradas completas/día (cualquier tipo)

**Lógica de Negocio:**

- Contador de tiradas por usuario/día
- Reset automático diario (00:00 UTC)
- Validación previa a crear nueva lectura
- Mensajes de error específicos cuando se alcanza límite

**Entidades Afectadas:**

- `Reading` (conteo de lecturas por día)
- Cache/Redis para tracking de límites
- Sistema de rate limiting

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F003: Tracking de Usuarios Anónimos

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **EXISTE** sistema de control de límites
- ⚠️ **REQUIERE ADAPTACIÓN:** Los límites van a cambiar según nuevos planes (free vs premium)
- 🔧 **ACCIÓN:** Ajustar límites diarios según nueva estrategia MVP

**Status:** ⚠️ EXISTE - REQUIERE MODIFICACIÓN

---

### F003: Tracking de Usuarios Anónimos

**Descripción:** Sistema de identificación y tracking de usuarios no autenticados para aplicar límites sin registro.

**Alcance:**

- Generación de identificador único por sesión anónima
- Tracking por IP + fingerprint del navegador
- Persistencia de identificador en cookie
- Contador de acciones (tiradas del día)

**Lógica de Negocio:**

- Generar UUID en primera visita
- Almacenar en cookie persistente (7 días)
- Backend valida límites usando cookie/IP
- Mostrar CTA de registro al alcanzar límite

**Entidades Afectadas:**

- Nueva tabla `AnonymousSession` o usar Redis
- Middleware de tracking
- Cookie `tarot_anon_id`

**Dependencias:**

- Ninguna (feature base)

**Status:** ⚠️ A VERIFICAR

---

### F004: Sistema de Tiradas para Usuarios Anónimos

**Descripción:** Funcionalidad limitada de tirada de 1 carta aleatoria sin contexto para usuarios sin registro.

**Alcance:**

- Solo tirada de 1 carta
- Selección aleatoria de carta
- Sin categoría ni pregunta
- Mostrar información estática de la carta
- Sin historial ni guardar
- 1 tirada por día máximo

**Lógica de Negocio:**

- Endpoint público (sin autenticación)
- Validar límite diario por tracking anónimo
- Retornar solo datos de carta estática (sin IA)
- Mostrar CTA de registro prominente

**Endpoints:**

- `POST /api/readings/anonymous` (nuevo)

**Dependencias:**

- F003: Tracking de Usuarios Anónimos
- F007: Información Estática de Cartas

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ⚠️ **CAMBIO DE LÓGICA:** Antes las tiradas anónimas podían usar IA. Ahora solo muestran descripción estática de DB.
- 🔧 **ACCIÓN:** Asegurar que endpoint anónimo NO llame a IA, solo retorne info estática de cartas

**Status:** ⚠️ REQUIERE VERIFICACIÓN Y AJUSTE

---

### F005: Sistema de Tiradas para Usuarios Free

**Descripción:** Tiradas de 1 y 3 cartas sin interpretación IA para usuarios registrados gratuitos.

**Alcance:**

- Tirada de 1 carta aleatoria (1/día)
- Tirada de 3 cartas (1/día)
- Sin categoría ni pregunta
- Información estática completa de cartas
- Guardar en historial (límite 10)
- Mostrar upsell a Premium

**Lógica de Negocio:**

- Endpoint protegido (requiere autenticación)
- Validar plan del usuario (`free`)
- Validar límites diarios
- Guardar lectura en DB (soft delete automático si >10)
- Retornar solo datos estáticos (sin llamar a IA)

**Endpoints:**

- `POST /api/readings` (modificar para soportar tier free)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F002: Control de Límites por Tier
- F007: Información Estática de Cartas
- F008: Historial Limitado

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ⚠️ **CAMBIO CRÍTICO:** Antes usuarios FREE obtenían interpretación IA. **Ahora NO**.
- ✅ Solo mostrar descripción estática de cartas desde DB
- 🔧 **ACCIÓN:** Modificar endpoint para plan FREE → NO llamar a IA, solo retornar data estática

**Status:** ⚠️ REQUIERE MODIFICACIÓN CRÍTICA

---

### F006: Sistema de Tiradas para Usuarios Premium

**Descripción:** Acceso completo a todas las tiradas con interpretación IA personalizada.

**Alcance:**

- Todas las tiradas: 1, 3, 5 cartas, Cruz Celta
- Selección de categoría
- Pregunta predefinida o personalizada
- Interpretación IA completa
- Historial ilimitado
- 3 tiradas/día
- Sin publicidad

**Lógica de Negocio:**

- Endpoint protegido (requiere autenticación + premium)
- Validar plan del usuario (`premium`)
- Validar límites diarios (3 tiradas)
- Procesar con IA usando tarotista por defecto (Flavia)
- Guardar en historial sin límite

**Endpoints:**

- `POST /api/readings` (lógica existente)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F002: Control de Límites por Tier
- F011: Sistema de Categorías
- F012: Sistema de Preguntas
- F013: Interpretación IA
- F014: Tarotista por Defecto

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **SIN CAMBIOS** según feedback
- 🔍 **ACCIÓN:** Verificar que funciona correctamente

**Status:** ✅ PROBABLEMENTE OK - VERIFICAR

---

### F007: Información Estática de Cartas

**Descripción:** Catálogo de información base de cada carta del tarot para usuarios no-premium.

**Alcance:**

- Nombre de carta
- Número/Arcano
- Imagen
- Palabras clave generales
- Significado general (derecho/invertido)
- Elemento asociado
- Sin interpretación contextual ni personalizada

**Lógica de Negocio:**

- Endpoint público para obtener info de carta
- Datos estáticos de DB (no IA)
- Mismo contenido para todos los usuarios
- Puede incluir significado por categoría general

**Endpoints:**

- `GET /api/cards` (existente)
- `GET /api/cards/:id` (existente)

**Dependencias:**

- Ninguna (feature base)

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **CRÍTICO PARA MVP:** Esta info estática es lo que se mostrará a usuarios FREE y ANÓNIMOS (sin IA)
- 🔍 **ACCIÓN:** Verificar que todas las cartas tienen descripciones completas en DB

**Status:** ✅ EXISTENTE - VERIFICAR CONTENIDO

---

### F008: Historial Limitado (Free)

**Descripción:** Sistema de historial de lecturas con límite de 10 para usuarios free.

**Alcance:**

- Guardar últimas 10 lecturas
- Auto-eliminación de lecturas antiguas (FIFO)
- Ver lecturas pasadas (solo datos estáticos)
- No regenerar interpretación
- Paginación

**Lógica de Negocio:**

- Al crear lectura #11, hacer soft delete de la más antigua
- Query de historial filtra por `plan = 'free'` y `deletedAt IS NULL`
- Ordenar por fecha descendente
- Límite de 10 en query

**Endpoints:**

- `GET /api/readings` (modificar para aplicar límite si free)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F005: Sistema de Tiradas para Usuarios Free

**Status:** ⚠️ A VERIFICAR

---

### F009: Historial Ilimitado (Premium)

**Descripción:** Acceso completo al historial de lecturas sin límite de cantidad.

**Alcance:**

- Guardar todas las lecturas
- Ver lecturas pasadas con interpretación IA
- Regenerar interpretación
- Compartir lecturas
- Paginación

**Lógica de Negocio:**

- Query de historial sin límite de cantidad
- Ordenar por fecha descendente
- Incluir metadata completa (categoría, pregunta, tarotista)

**Endpoints:**

- `GET /api/readings` (lógica existente)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F006: Sistema de Tiradas para Usuarios Premium

**Status:** ✅ PROBABLEMENTE EXISTENTE

---

### F010: Sistema de Compartir Lecturas

**Descripción:** Funcionalidad de compartir lecturas mediante enlace público único.

**Alcance:**

- Generar enlace público único por lectura
- Página pública de visualización de lectura compartida
- Disponible para usuarios Free y Premium
- Mostrar publicidad en lecturas compartidas (monetización viral)

**Lógica de Negocio:**

- Generar UUID único al compartir
- Endpoint público sin autenticación
- Mostrar información completa de la lectura
- No permitir acciones (solo lectura)
- Incluir CTA de registro/upgrade

**Endpoints:**

- `POST /api/readings/:id/share` (probablemente existe)
- `GET /api/readings/shared/:shareToken` (nuevo)

**Dependencias:**

- F005: Sistema de Tiradas para Usuarios Free
- F006: Sistema de Tiradas para Usuarios Premium
- F016: Sistema de Monetización con Google Ads (para página pública)

**Status:** ⚠️ A VERIFICAR

---

### F011: Sistema de Categorías (Premium Only)

**Descripción:** Selección de categoría de lectura para contextualizar la interpretación IA.

**Alcance:**

- Catálogo de categorías: Amor, Trabajo, Salud, Dinero, Espiritual, General
- Solo disponible para usuarios Premium
- Endpoint protegido por tier
- Mostrar en formulario de nueva lectura solo si Premium

**Lógica de Negocio:**

- Validar que usuario sea Premium antes de permitir selección
- Categoría se usa como contexto para prompt de IA
- Si Free/Anónimo intenta enviar categoría, retornar error 403

**Endpoints:**

- `GET /api/categories` (existente)
- `POST /api/readings` (validar tier antes de aceptar categoryId)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F006: Sistema de Tiradas para Usuarios Premium
- F013: Interpretación IA

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **YA EXISTE** según feedback
- 🔍 **ACCIÓN:** Verificar validación de tier (solo Premium puede usar)

**Status:** ✅ EXISTE - VERIFICAR VALIDACIONES

---

### F012: Sistema de Preguntas (Premium Only)

**Descripción:** Sistema de preguntas predefinidas y personalizadas para usuarios Premium.

**Alcance:**

- Catálogo de preguntas predefinidas por categoría
- Input para pregunta personalizada
- Solo disponible para Premium
- Pregunta se incluye en prompt de IA

**Lógica de Negocio:**

- Validar tier Premium
- Permitir pregunta predefinida O personalizada (no ambas)
- Validación de longitud de pregunta personalizada (max 200 chars)
- Pregunta se usa como contexto para interpretación

**Endpoints:**

- `GET /api/predefined-questions` (existente)
- `POST /api/readings` (validar tier antes de aceptar pregunta)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F006: Sistema de Tiradas para Usuarios Premium
- F011: Sistema de Categorías
- F013: Interpretación IA

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **YA EXISTE** según feedback
- 🔍 **ACCIÓN:** Verificar validación de tier (solo Premium puede usar)

**Status:** ✅ EXISTE - VERIFICAR VALIDACIONES

---

### F013: Interpretación IA (Premium Only)

**Descripción:** Generación de interpretación personalizada mediante IA usando contexto de categoría y pregunta.

**Alcance:**

- Solo para usuarios Premium
- Usa Groq Llama 3.1 70B (principal)
- Fallback a OpenAI GPT-4 / DeepSeek
- Interpretación basada en:
  - Cartas seleccionadas
  - Categoría elegida
  - Pregunta (predefinida o personalizada)
  - Personalidad del tarotista (Flavia)

**Lógica de Negocio:**

- Validar tier Premium
- Construir prompt con contexto completo
- Llamar a proveedor de IA
- Guardar interpretación en DB
- Permitir regeneración (consume cuota)

**Endpoints:**

- `POST /api/readings` (lógica existente)
- `POST /api/readings/:id/regenerate` (existente)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F006: Sistema de Tiradas para Usuarios Premium
- F011: Sistema de Categorías
- F012: Sistema de Preguntas
- F014: Tarotista por Defecto

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **YA EXISTE** según feedback
- ⚠️ **CRÍTICO:** Asegurar que FREE/ANÓNIMO **NO** llamen a IA (ahorro de costos)
- 🔍 **ACCIÓN:** Verificar validación estricta de tier antes de llamar IA

**Status:** ✅ EXISTE - VERIFICAR VALIDACIONES CRÍTICAS

---

### F014: Tarotista por Defecto (Flavia)

**Descripción:** Uso forzado de un único tarotista (Flavia) en fase MVP, sin selector de tarotista.

**Alcance:**

- Todas las lecturas usan `tarotistaId: 1` (Flavia)
- No mostrar selector en frontend
- Sistema preparado para múltiples tarotistas (post-MVP)
- Branding menciona "Interpretaciones de Flavia"

**Lógica de Negocio:**

- Backend asigna automáticamente `tarotistaId: 1` al crear lectura
- Endpoint de tarotistas retorna solo Flavia (o filtrar en frontend)
- Prompts de IA usan configuración de Flavia

**Endpoints:**

- `POST /api/readings` (asignar tarotistaId: 1 por defecto)
- `GET /api/tarotistas` (retornar solo Flavia o marcar como default)

**Dependencias:**

- F013: Interpretación IA

**Status:** ⚠️ A VERIFICAR

---

### F015: Home Page Dual (Landing + Dashboard)

**Descripción:** Página principal que adapta contenido según estado de autenticación del usuario.

**Alcance:**

- **Versión A (No autenticado):** Landing page con propuesta de valor, prueba sin registro, CTAs
- **Versión B (Autenticado):** Dashboard personalizado con accesos rápidos, saludo, stats

**Contenido Landing Page:**

- Hero section con propuesta de valor
- Sección "Prueba sin registro" (CTA a tirada anónima)
- Beneficios de Premium listados
- Sección educativa "¿Qué es el Tarot?"
- CTAs a registro/login
- CTA a suscripción Premium

**Contenido Dashboard:**

- Saludo personalizado con badge de plan (Free/Premium)
- Accesos rápidos: Nueva Lectura, Historial, Carta del Día
- Sección educativa rotativa "Sabías que..."
- Estadísticas (solo Premium)
- Upsell suave a Premium (solo Free)

**Lógica de Negocio:**

- Detectar estado de autenticación en frontend
- Renderizar componente condicional
- Personalizar mensajes según plan

**Rutas:**

- `/` - Home (renderiza Landing o Dashboard)
- `/dashboard` - Alias al Dashboard (redirige a `/` si no autenticado)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F017: Sistema de Registro y Autenticación

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ❌ **NO EXISTE** - Solo hay un mock provisorio
- 🔧 **ACCIÓN:** Desarrollar desde cero Landing Page + Dashboard dual

**Status:** ❌ A DESARROLLAR DESDE CERO

---

### F016: Sistema de Monetización con Google Ads

**Descripción:** Integración de Google AdSense para monetizar usuarios Free mediante publicidad no intrusiva.

**Alcance:**

- Mostrar anuncios solo a usuarios Free y Anónimos
- Ubicaciones estratégicas:
  - Resultado de tirada (banner después de cartas)
  - Historial (cada 5 lecturas)
  - Dashboard Free (banner lateral/inferior)
  - Página compartida pública
- Máximo 2 ad units por página
- Categorías permitidas: Espiritualidad, Bienestar, Autoayuda

**Lógica de Negocio:**

- Componente React condicional: `{user.plan !== 'premium' && <AdBanner />}`
- Lazy loading de scripts de ads
- Tracking de impresiones y clicks (Google Analytics)
- GDPR/CCPA compliance (consent banner)

**Dependencias Técnicas:**

- Google AdSense account (aprobación)
- Google Tag Manager setup
- Política de privacidad actualizada
- Consent banner (cookies de terceros)

**Endpoints:**

- Ninguno (solo frontend)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F005: Sistema de Tiradas para Usuarios Free
- F010: Sistema de Compartir Lecturas (para página pública)

**Status:** ⚠️ A DESARROLLAR (nueva integración)

---

### F017: Sistema de Registro y Autenticación

**Descripción:** Sistema de creación de cuenta, login, logout y gestión de sesión.

**Alcance:**

- Registro de nuevo usuario (email + password)
- Login (email + password)
- Logout
- Refresh token
- Validación de email (opcional MVP)
- Recovery de password (opcional MVP)

**Lógica de Negocio:**

- Crear usuario con plan `free` por defecto
- Generar JWT access token + refresh token
- Guardar refresh token en DB
- Middleware de autenticación en endpoints protegidos

**Endpoints:**

- `POST /api/auth/register` (existente)
- `POST /api/auth/login` (existente)
- `POST /api/auth/logout` (existente)
- `POST /api/auth/refresh` (existente)

**Dependencias:**

- Ninguna (feature base)

**📋 ESTADO ACTUAL (Feedback Usuario):**

- ✅ **EXISTE** sistema de auth completo
- 🔍 **ACCIÓN:** No requiere cambios

**Status:** ✅ EXISTENTE - OK

---

### F018: Sistema de Conversión (Funnels)

**Descripción:** Estrategia de conversión progresiva Anónimo → Free → Premium con CTAs estratégicos.

**Alcance:**

- **CTA Anónimo → Free:**
  - Después de tirada anónima
  - Al alcanzar límite diario
  - Modal suave "Registrarse para desbloquear más"
- **CTA Free → Premium:**
  - Después de 2-3 tiradas free
  - En resultado de tirada (sección aspiracional)
  - En historial ("Desbloquea interpretaciones")
  - Banner en dashboard

**Lógica de Negocio:**

- Tracking de interacciones del usuario
- Mostrar CTA basado en comportamiento
- A/B testing de mensajes (post-MVP)

**Ubicaciones en Frontend:**

- Modal post-tirada
- Banner en dashboard
- Sección en resultado de lectura
- Tooltip en botones deshabilitados

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F004: Sistema de Tiradas para Usuarios Anónimos
- F005: Sistema de Tiradas para Usuarios Free

**Status:** ⚠️ A DESARROLLAR (nueva feature UX)

---

### ~~F019: Sistema de Trial Premium (7 días)~~ ❌ ELIMINADA

**Descripción:** ~~Período de prueba gratuito de 7 días de plan Premium para incentivar conversión.~~

**📋 DECISIÓN:**

- ❌ **NO SE IMPLEMENTARÁ** según feedback usuario
- Esta feature fue descartada de la estrategia MVP
- La conversión se hará mediante otros mecanismos (F018: Funnels)

**Status:** ❌ ELIMINADA DEL SCOPE

---

### F020: Estadísticas Avanzadas (Premium)

**Descripción:** Dashboard de estadísticas de uso y patrones de lecturas para usuarios Premium.

**Alcance:**

- Total de lecturas realizadas
- Categorías más consultadas
- Tiradas favoritas
- Cartas más frecuentes
- Evolución mensual
- Insights personalizados (opcional)

**Lógica de Negocio:**

- Solo visible para usuarios Premium
- Queries agregadas sobre tabla `Reading`
- Cache de estadísticas (recalcular cada 24h)
- Gráficos visuales (Chart.js o similar)

**Endpoints:**

- `GET /api/users/me/statistics` (nuevo, solo Premium)

**Dependencias:**

- F001: Sistema de Tiers de Usuario
- F006: Sistema de Tiradas para Usuarios Premium

**Status:** ⚠️ A DESARROLLAR (nueva feature)

---

## 🔮 POST-MVP FEATURES

---

### F021: Marketplace de Tarotistas (Post-MVP)

**Descripción:** Plataforma para que usuarios seleccionen entre múltiples tarotistas con perfiles y especialidades.

**Alcance:**

- Listado de tarotistas disponibles
- Filtros por categoría de especialidad
- Perfil público de cada tarotista
- Sistema de onboarding para nuevos tarotistas
- Revenue share con tarotistas

**Status:** 🔮 POST-MVP

---

### F022: Sistema de Rating de Tarotistas (Post-MVP)

**Descripción:** Sistema de calificación de tarotistas por usuarios Premium después de cada lectura.

**Alcance:**

- Rating 1-5 estrellas por categorías:
  - Precisión
  - Empatía
  - Claridad
  - Conexión
  - Recomendación general
- Solo usuarios Premium pueden calificar
- Solo después de lectura completada

**Entidades:**

- `TarotistaRating` (nueva tabla)
  - userId
  - tarotistaId
  - readingId
  - categoryId (opcional, específico por área)
  - precisionRating
  - empathyRating
  - clarityRating
  - connectionRating
  - overallRating
  - comment (opcional)

**Status:** 🔮 POST-MVP

---

### F023: Selector de Tarotistas (Post-MVP)

**Descripción:** Interfaz para que usuarios Premium elijan su tarotista preferido.

**Alcance:**

- Dropdown/modal de selección en formulario de nueva lectura
- Vista previa de perfil de tarotista
- Indicador de rating y especialidades
- Guardar tarotista favorito

**Status:** 🔮 POST-MVP

---

### F024: Rankings por Categoría (Post-MVP)

**Descripción:** Listados de "Top Tarotistas" por categoría basados en ratings.

**Alcance:**

- Vista "Top en Amor"
- Vista "Top en Trabajo"
- Vista "Top en Salud"
- Algoritmo de ranking ponderado (rating + cantidad de sesiones)

**Status:** 🔮 POST-MVP

---

### F025: Badges de Tarotistas (Post-MVP)

**Descripción:** Sistema de insignias y reconocimientos para tarotistas destacados.

**Alcance:**

- Badge "Top en [Categoría]"
- Badge "Más Valorado"
- Badge "Favorito de la Comunidad"
- Mostrar en perfil y listado

**Status:** 🔮 POST-MVP

---

## 📊 Resumen de Status

### Por Estado (Actualizado con Feedback Usuario)

| Status                            | Cantidad | Features                             |
| --------------------------------- | -------- | ------------------------------------ |
| ✅ EXISTENTE - OK                 | 2        | F017 (Auth), F007 (Cartas estáticas) |
| ✅ EXISTE - VERIFICAR             | 4        | F006, F011, F012, F013               |
| ⚠️ EXISTE - REQUIERE MODIFICACIÓN | 3        | F001, F002, F005                     |
| ⚠️ REQUIERE VERIFICACIÓN          | 5        | F003, F004, F008, F010, F014         |
| ⚠️ A DESARROLLAR                  | 5        | F015, F016, F018, F020, F009         |
| ❌ ELIMINADA                      | 1        | F019 (Trial - descartado)            |
| 🔮 POST-MVP                       | 5        | F021-F025                            |
| **TOTAL MVP**                     | **19**   | (F019 eliminada del scope)           |
| **TOTAL POST-MVP**                | **5**    | -                                    |
| **TOTAL GENERAL**                 | **24**   | -                                    |

### Por Prioridad MVP (Actualizada)

| Prioridad | Features                     | Justificación                                        | Acción                 |
| --------- | ---------------------------- | ---------------------------------------------------- | ---------------------- |
| 🔴 P0     | F001, F002, F017             | Core del sistema de tiers + Auth                     | Modificar planes       |
| 🟠 P1     | F004, F005, F006, F007, F013 | Tiradas por tier (FREE sin IA = crítico para costos) | Ajustar lógica de IA   |
| 🟡 P2     | F008, F009, F011, F012, F014 | Features complementarias                             | Verificar validaciones |
| 🟢 P3     | F003, F010, F015, F018       | UX, conversión, tracking anónimos                    | Desarrollar/verificar  |
| ⚪ P4     | F016, F020                   | Monetización ads, estadísticas premium               | Desarrollar            |

### Análisis de Riesgo

#### 🔥 CRÍTICO (Impacto en Costos)

- **F005:** FREE sin IA (antes usaba IA → ahora NO) - **Ahorro de costos crítico**
- **F004:** Anónimos sin IA - **Debe validarse**
- **F013:** Asegurar validación estricta de tier antes de llamar IA

#### ⚠️ IMPORTANTE (Impacto en Funcionalidad)

- **F001:** Migración de 3 planes a 2 planes (eliminar `professional`)
- **F002:** Ajuste de límites diarios según nueva estrategia
- **F015:** Home page dual (marketing + retención)

#### 🔧 MODERADO (Mejoras y Validaciones)

- **F003, F008, F010, F014:** Verificar funcionamiento correcto
- **F011, F012:** Validar que solo Premium puede acceder

---

## 🎯 Próximos Pasos (Actualizados)

1. **Análisis de Código Existente:**
   - Verificar implementación actual de cada feature marcada como "A VERIFICAR"
   - Identificar gaps y modificaciones necesarias
   - Determinar si código existente cumple con nuevas reglas de negocio

2. **Creación de Backlog Técnico:**
   - Desglosar cada feature en tareas de backend y frontend
   - Estimar esfuerzo de desarrollo
   - Priorizar según dependencias y valor de negocio

3. **Definición de Acceptance Criteria:**
   - Para cada feature nueva o modificada
   - Casos de prueba específicos
   - Validación de reglas de negocio

4. **Plan de Implementación:**
   - Roadmap por sprints
   - Secuencia de desarrollo para evitar bloqueos
   - Plan de testing y QA

---

**Documento generado:** 18 Diciembre 2025  
**Autor:** GitHub Copilot  
**Versión:** 1.0
