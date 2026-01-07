# 🎯 Backlog GAPs Identificados - Frontend

**Proyecto:** Auguria - Correcciones Post-Audit
**Fecha de creación:** 2026-01-07
**Origen:** Validación técnica USER_STORIES_AUDIT.md

---

## 📊 CONTEXTO

Este backlog contiene tareas derivadas de la auditoría técnica realizada contra el modelo de negocio definido. Los GAPs fueron identificados en la validación del código vs la visión del producto.

**Documento de referencia:** [USER_STORIES_AUDIT.md](USER_STORIES_AUDIT.md)

---

## 🏆 PRIORIZACIÓN

- **P0 - CRÍTICO:** Bloqueantes para monetización o lanzamiento
- **P1 - IMPORTANTE:** Mejoran experiencia o diferenciación, requeridos post-MVP
- **P2 - MEJORA:** Nice-to-have, no bloqueantes

---

## 📦 Epic GAP-1: Shuffle Aleatorio del Mazo

> **Origen:** GAP-6 en USER_STORIES_AUDIT.md
> **Problema:** Las 78 cartas se muestran siempre en el mismo orden, permitiendo selección intencional
> **Objetivo:** Implementar mezcla aleatoria del mazo para autenticidad de la selección

---

### **TASK-GAP-001: Implementar algoritmo de shuffle aleatorio en selección de cartas**

**Prioridad:** 🟡 P1 - IMPORTANTE
**Estimación:** 2 horas
**Dependencias:** Ninguna
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-001-shuffle-deck`

#### 📋 Descripción

Implementar algoritmo Fisher-Yates para mezclar aleatoriamente las 78 cartas del mazo en cada selección de tirada, garantizando que el usuario no pueda predecir posiciones de cartas específicas.

#### ✅ Tareas específicas

- [ ] Crear función helper `shuffleArray<T>` usando Fisher-Yates en `src/lib/utils/array.ts`
- [ ] Escribir tests unitarios para `shuffleArray`:
  - Verifica que el array resultante contiene los mismos elementos
  - Verifica que el orden es diferente al original
  - Verifica distribución aleatoria (no determinista)
- [ ] Modificar `ReadingExperience.tsx`:
  - Crear `shuffledDeck` usando `useMemo` con dependencia en `spreadId`
  - Mapear sobre `shuffledDeck` en lugar de `Array.from({ length: DECK_SIZE })`
  - Mantener el mapeo correcto entre índice de display y cardId real
- [ ] Escribir tests de integración para `ReadingExperience`:
  - Verificar que las cartas se renderizan en orden diferente entre renders
  - Verificar que la selección funciona correctamente con mazo mezclado
  - Verificar que `handleReveal` envía los cardIds correctos al backend
- [ ] Actualizar documentación en código sobre el shuffle

#### 🎯 Criterios de aceptación

- ✅ El mazo visual se mezcla aleatoriamente en cada carga de `/ritual/lectura`
- ✅ El usuario no puede predecir la posición de cartas específicas
- ✅ La selección de cartas funciona correctamente tras el shuffle
- ✅ Los cardIds enviados al backend son correctos (1-78)
- ✅ El shuffle ocurre solo cuando cambia el `spreadId` (no en cada render)
- ✅ Tests unitarios y de integración pasan con 100% coverage

#### 📝 Notas técnicas

- **Archivo afectado:** `src/components/features/readings/ReadingExperience.tsx:516`
- **Estado actual:** Array estático `Array.from({ length: 78 })` sin shuffle
- **Impacto UX:** Mejora la percepción de autenticidad de la lectura

#### 🔗 Referencias

- Algoritmo Fisher-Yates: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
- GAP-6 en USER_STORIES_AUDIT.md

---

## 📦 Epic GAP-2: Límite de Historial para usuarios FREE

> **Origen:** GAP-1 en USER_STORIES_AUDIT.md
> **Problema:** No hay diferenciación clara de historial entre FREE y PREMIUM
> **Objetivo:** Implementar límite de historial para FREE como diferenciador de PREMIUM

---

### **TASK-GAP-002: Agregar indicador visual de límite de historial para usuarios FREE**

**Prioridad:** 🟡 P1 - IMPORTANTE
**Estimación:** 3 horas
**Dependencias:** Backend debe implementar límite (TASK-GAP-101)
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-002-history-limit-ui`

#### 📋 Descripción

Agregar indicadores visuales en la UI del historial que muestren a usuarios FREE cuántas lecturas pueden ver y el beneficio de PREMIUM (historial ilimitado).

#### ✅ Tareas específicas

- [ ] Crear componente `HistoryLimitBanner` en `src/components/features/readings/`:
  - Muestra mensaje "Viendo tus últimas X lecturas"
  - Incluye badge con plan actual (FREE)
  - Muestra CTA "Upgrade a PREMIUM para historial completo"
  - Debe ser visualmente sutil pero claro
- [ ] Modificar `ReadingsHistory.tsx`:
  - Detectar plan del usuario desde `useAuthStore`
  - Mostrar `HistoryLimitBanner` solo para usuarios FREE
  - Agregar lógica para deshabilitar paginación más allá del límite
- [ ] Agregar tooltip o mensaje cuando FREE intenta ver lecturas antiguas:
  - Modal explicativo: "Las lecturas más antiguas están disponibles en PREMIUM"
  - Botón "Ver planes"
- [ ] Escribir tests para `HistoryLimitBanner`:
  - Se muestra solo para usuarios FREE
  - No se muestra para PREMIUM
  - El CTA navega correctamente a /perfil (planes)
- [ ] Escribir tests de integración para `ReadingsHistory`:
  - Verificar que FREE ve el banner
  - Verificar que PREMIUM NO ve el banner
  - Verificar comportamiento de paginación limitada

#### 🎯 Criterios de aceptación

- ✅ Usuarios FREE ven claramente que su historial está limitado
- ✅ El mensaje explica el beneficio de PREMIUM
- ✅ El CTA de upgrade es visible pero no intrusivo
- ✅ Usuarios PREMIUM no ven ningún límite ni banner
- ✅ Tests pasan con 100% coverage

#### 📝 Notas técnicas

- **Archivos afectados:**
  - `src/components/features/readings/ReadingsHistory.tsx`
  - Nuevo: `src/components/features/readings/HistoryLimitBanner.tsx`
- **Estado actual:** No hay diferenciación visual entre FREE y PREMIUM en historial
- **Impacto negocio:** Mejora propuesta de valor de PREMIUM

#### 🔗 Referencias

- GAP-1 en USER_STORIES_AUDIT.md
- Requiere: Backend TASK-GAP-101 (límite de historial)

---

## 📦 Epic GAP-3: Integración de Mercado Pago

> **Origen:** GAP-4 en USER_STORIES_AUDIT.md
> **Problema:** Sin pasarela de pago = CERO revenue
> **Objetivo:** Implementar flujo completo de upgrade FREE → PREMIUM con Mercado Pago

---

### **TASK-GAP-003: Investigación y diseño de integración Mercado Pago**

**Prioridad:** 🔴 P0 - CRÍTICO
**Estimación:** 4 horas
**Dependencias:** Ninguna
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `research/GAP-003-mercadopago-integration`

#### 📋 Descripción

Investigar documentación oficial de Mercado Pago para suscripciones recurrentes, analizar SDK disponibles y diseñar flujo de integración frontend-backend.

#### ✅ Tareas específicas

- [ ] Investigar Mercado Pago Subscriptions API:
  - Documentación oficial: https://www.mercadopago.com.ar/developers/
  - Diferencias entre Checkout Pro, Checkout API y Subscriptions
  - Requisitos de autenticación (access token, public key)
  - Webhooks para notificaciones de pago
- [ ] Evaluar SDK oficial:
  - Mercado Pago SDK para React: `@mercadopago/sdk-react`
  - Alternativas: integración directa con API REST
  - Recomendación: ¿SDK o custom?
- [ ] Diseñar flujo de usuario:
  - User click "Upgrade a PREMIUM" → Modal/Page de planes
  - Selección de plan (mensual/anual)
  - Redirect a Mercado Pago Checkout o Modal integrado
  - Callback tras pago exitoso → Actualización de plan en backend
  - Manejo de errores y cancelación
- [ ] Diseñar arquitectura técnica:
  - ¿Dónde se genera el preference_id? (backend)
  - ¿Cómo se maneja el callback de Mercado Pago? (webhook backend + polling frontend)
  - ¿Dónde se almacena el estado de suscripción? (backend DB)
  - ¿Cómo se sincroniza el plan del usuario? (refetch tras pago)
- [ ] Documentar decisiones en `docs/MERCADOPAGO_INTEGRATION_PLAN.md`:
  - Arquitectura propuesta
  - Flujo de datos
  - Endpoints necesarios (backend)
  - Componentes frontend a crear
  - Manejo de estados (pending, approved, rejected)
  - Testing plan

#### 🎯 Criterios de aceptación

- ✅ Documento de diseño completo y revisado
- ✅ Decisión clara sobre SDK vs API directa
- ✅ Flujo de usuario documentado con diagramas
- ✅ Arquitectura técnica aprobada
- ✅ Listado de tareas específicas de implementación

#### 📝 Notas técnicas

- **Documentación MP:** https://www.mercadopago.com.ar/developers/es/docs
- **SDK React:** https://github.com/mercadopago/sdk-react
- **Webhook docs:** https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/webhook-notifications

#### 🔗 Referencias

- GAP-4 en USER_STORIES_AUDIT.md
- Requiere: Coordinación con backend (TASK-GAP-102)

---

### **TASK-GAP-004: Implementar UI de selección de planes y flow de pago**

**Prioridad:** 🔴 P0 - CRÍTICO
**Estimación:** 8 horas
**Dependencias:** TASK-GAP-003, TASK-GAP-102 (backend)
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-004-payment-flow`

#### 📋 Descripción

Implementar página/modal de selección de planes y flujo completo de pago con Mercado Pago, incluyendo estados de carga, éxito y error.

#### ✅ Tareas específicas

- [ ] Crear componente `PricingPlans` en `src/components/features/subscription/`:
  - Cards visuales para FREE vs PREMIUM
  - Comparación de features (tabla o bullet points)
  - Precio destacado con toggle mensual/anual (si aplica)
  - Botón CTA "Elegir PREMIUM"
- [ ] Crear página `/planes` o modificar modal `UpgradeModal`:
  - Renderizar `PricingPlans`
  - Manejar selección de plan
  - Integrar SDK de Mercado Pago o botón de pago
- [ ] Implementar `useMercadoPago` hook personalizado:
  - Inicializar SDK con public key
  - Crear preference de pago (llamada a backend)
  - Abrir checkout (modal o redirect)
  - Manejar callbacks (success, failure, pending)
- [ ] Crear estados de pago en `PaymentStatusPage`:
  - `/pago/exito` - Pago aprobado
  - `/pago/pendiente` - Pago pendiente
  - `/pago/error` - Pago rechazado
  - Cada uno con mensaje claro y CTA apropiado
- [ ] Implementar sincronización de plan tras pago:
  - Polling al backend para verificar actualización de plan
  - Refetch de `user` en `useAuthStore`
  - Redirect a dashboard con mensaje de éxito
- [ ] Escribir tests para todos los componentes:
  - `PricingPlans` renderiza correctamente
  - `useMercadoPago` maneja estados correctamente
  - Flujo completo mock (sin llamadas reales a MP)
  - Manejo de errores

#### 🎯 Criterios de aceptación

- ✅ Usuario FREE puede ver comparación clara de planes
- ✅ Al clickear "Upgrade", se abre flujo de pago de Mercado Pago
- ✅ Tras pago exitoso, el plan se actualiza en menos de 10 segundos
- ✅ El usuario ve confirmación visual del upgrade
- ✅ Manejo correcto de errores (pago rechazado, timeout, etc.)
- ✅ Tests E2E simulan flujo completo de upgrade

#### 📝 Notas técnicas

- **Componentes a crear:**
  - `PricingPlans.tsx`
  - `PaymentButton.tsx`
  - `PaymentStatusPage.tsx` (success, pending, error)
- **Hook custom:** `useMercadoPago.ts`
- **Integración:** Depende de backend endpoints `/subscriptions/create-preference` y `/subscriptions/status`

#### 🔗 Referencias

- GAP-4 en USER_STORIES_AUDIT.md
- Diseño de TASK-GAP-003

---

## 📦 Epic GAP-4: Validación de Límites de Tiradas

> **Origen:** GAP-2 en USER_STORIES_AUDIT.md
> **Problema:** No hay evidencia clara de límite 1 FREE / 3 PREMIUM en frontend
> **Objetivo:** Validar y mejorar visualización de límites de tiradas

---

### **TASK-GAP-005: Agregar indicador visual de límites de tiradas consumidos**

**Prioridad:** 🔴 P0 - CRÍTICO (validación)
**Estimación:** 3 horas
**Dependencias:** Validar que backend envía límites correctamente
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `feature/GAP-005-reading-limits-ui`

#### 📋 Descripción

Agregar indicadores visuales claros que muestren a los usuarios cuántas tiradas les quedan disponibles por día, diferenciando FREE (1/día) y PREMIUM (3/día).

#### ✅ Tareas específicas

- [ ] Crear componente `ReadingLimitIndicator` en `src/components/features/readings/`:
  - Badge o chip que muestra "X de Y lecturas disponibles hoy"
  - Cambia de color según proximidad al límite (verde → amarillo → rojo)
  - Incluye ícono de información con tooltip explicativo
- [ ] Integrar `ReadingLimitIndicator` en páginas clave:
  - `/ritual` - Dashboard principal
  - `/ritual/tirada` - Selección de spread
  - Header de la app (visible siempre para usuarios autenticados)
- [ ] Modificar `SpreadSelector` para mostrar límite antes de seleccionar:
  - Mensaje: "Te quedan X lecturas disponibles hoy"
  - Si límite alcanzado, mostrar `ReadingLimitReached` inmediatamente
- [ ] Crear test E2E que valide límites:
  - FREE hace 1 lectura → límite alcanzado
  - Intenta hacer segunda lectura → modal de upgrade
  - PREMIUM hace 3 lecturas → límite alcanzado
  - Intenta hacer cuarta lectura → notificación suave
- [ ] Validar con backend que los límites se calculan correctamente:
  - Endpoint `/me` debe devolver `dailyReadingsCount` y `dailyReadingsLimit`
  - Verificar que resetea a medianoche

#### 🎯 Criterios de aceptación

- ✅ Usuario siempre sabe cuántas lecturas le quedan
- ✅ El indicador es visible pero no intrusivo
- ✅ FREE ve claramente que tiene 1 lectura/día
- ✅ PREMIUM ve claramente que tiene 3 lecturas/día
- ✅ El límite se resetea correctamente cada día
- ✅ Tests E2E validan comportamiento de límites

#### 📝 Notas técnicas

- **Componentes a crear/modificar:**
  - Nuevo: `ReadingLimitIndicator.tsx`
  - Modificar: `SpreadSelector.tsx`, `Header.tsx`
- **Estado actual:** Lógica existe en SpreadSelector línea 176-184 pero no es visual
- **Validación:** Confirmar con dueño del producto que límites funcionan

#### 🔗 Referencias

- GAP-2 en USER_STORIES_AUDIT.md
- Validación del dueño: Límites funcionan correctamente

---

---

## 📦 Epic GAP-5: Mejoras de UX en Límites

> **Origen:** Validación manual US-1.1 en USER_STORIES_AUDIT.md
> **Problema:** Usuario puede interactuar con carta antes de ver modal de límite alcanzado
> **Objetivo:** Mostrar modal inmediatamente al detectar límite alcanzado

---

### **TASK-GAP-006: Mostrar modal de límite inmediatamente al cargar carta del día**

**Prioridad:** 🟡 P1 - IMPORTANTE (UX)
**Estimación:** 2 horas
**Dependencias:** Ninguna
**Estado:** ⏳ PENDIENTE
**Branch sugerida:** `fix/GAP-006-daily-card-limit-immediate`

#### 📋 Descripción

Cuando un usuario anónimo (o FREE) ya consumió su límite de carta del día, el modal de "Límite Alcanzado" debe aparecer **inmediatamente** al cargar la página `/carta-del-dia`, sin permitir que el usuario vea o interactúe con la carta boca abajo.

#### ✅ Tareas específicas

- [ ] Modificar `DailyCardExperience.tsx`:
  - El componente detecta límite alcanzado en el `useEffect` inicial o mediante el fetch
  - Si `isAnonymousLimitReached` es true ANTES de render, mostrar `AnonymousLimitReached` inmediatamente
  - NO renderizar la carta boca abajo si el límite está alcanzado
- [ ] Revisar lógica de detección de límite:
  - Actualmente detecta límite tras intentar `createDailyReading` (líneas 132-174)
  - DEBE detectar límite ANTES, en el `useDailyReadingToday` para anónimos
  - Si el backend retorna 403/409, NO mostrar carta, mostrar modal directamente
- [ ] Modificar flujo en `DailyCardExperience.tsx`:
  ```
  Estado actual:
  - Render carta boca abajo
  - Usuario click
  - POST a backend
  - Backend retorna 403
  - Mostrar modal ❌

  Estado esperado:
  - Detectar límite alcanzado (localStorage + backend check si es necesario)
  - SI límite alcanzado → Mostrar modal inmediatamente ✅
  - SI límite disponible → Mostrar carta boca abajo
  ```
- [ ] Verificar persistencia del límite:
  - Confirmar que `sessionStorage.setItem('tarot_daily_card_consumed', ...)` (línea 161)
  - Al cargar componente, verificar primero si existe esta key
  - Si existe Y es del día actual → Límite alcanzado, mostrar modal
- [ ] Escribir tests de integración:
  - Usuario anónimo con límite consumido carga `/carta-del-dia`
  - Verificar que modal aparece inmediatamente
  - Verificar que NO se renderiza `TarotCard` clickeable
  - Usuario anónimo sin límite consumido carga `/carta-del-dia`
  - Verificar que SÍ se renderiza carta boca abajo

#### 🎯 Criterios de aceptación

- ✅ Usuario con límite alcanzado ve modal INMEDIATAMENTE al cargar la página
- ✅ NO puede ver ni interactuar con la carta boca abajo
- ✅ Usuario sin límite consumido ve la carta normalmente
- ✅ El flujo es más fluido y menos frustrante
- ✅ Tests de integración pasan con 100% coverage

#### 📝 Notas técnicas

- **Archivo afectado:** `src/components/features/daily-reading/DailyCardExperience.tsx`
- **Líneas relevantes:** 109-116 (detección anónimo), 132-174 (handleRevealCard)
- **Estado actual:** Modal aparece DESPUÉS del click
- **Estado esperado:** Modal aparece ANTES de mostrar carta
- **Validado por:** Usuario (screenshot + descripción)

#### 🔗 Referencias

- Validación manual US-1.1 (Usuario Anónimo)
- Screenshot: Modal "Ya viste tu carta del día"

---

## 📋 RESUMEN DE PRIORIDADES

### 🔴 P0 - CRÍTICO (Bloqueantes para monetización)
1. **TASK-GAP-003:** Investigación Mercado Pago
2. **TASK-GAP-004:** Implementar flow de pago
3. **TASK-GAP-005:** Validar límites de tiradas visuales

### 🟡 P1 - IMPORTANTE (Post-MVP)
4. **TASK-GAP-001:** Shuffle aleatorio del mazo
5. **TASK-GAP-002:** Indicador de límite de historial
6. **TASK-GAP-006:** Modal de límite inmediato en carta del día

### Tareas restantes
- Ver backend backlog (GAPS_BACKLOG_BACKEND.md)
- Definir precio PREMIUM (decisión de negocio, no técnica)

---

## 📝 NOTAS FINALES

- **Mercado Pago** es el único bloqueante crítico para monetización
- **Shuffle de mazo** mejora percepción de autenticidad (importante UX)
- **Límites visuales** mejoran transparencia y conversión
- **Historial limitado** refuerza propuesta de valor PREMIUM

**Última actualización:** 2026-01-07
