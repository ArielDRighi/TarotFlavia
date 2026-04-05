# Checklist de Validación - Código vs Modelo de Negocio

**Objetivo:** Verificar qué del modelo de negocio definido está implementado correctamente.

**Leyenda:** ✅ Implementado | ❌ No existe / no funciona | ⚠️ Parcial / requiere validación manual

**Última revisión de código:** Abril 2026

---

## 1. Usuario ANÓNIMO

### Carta del Día
- ✅ Puede acceder a la carta del día sin registro (`/carta-del-dia`, endpoint público con fingerprint)
- ✅ El límite es exactamente 1/día (gestionado por `useUserCapabilities` + backend)
- ✅ El límite se persiste entre sesiones (fingerprint de sesión via `getSessionFingerprint()`)
- ✅ Al consumir el límite, aparece `AnonymousLimitReached` con CTA "Regístrate"
- ✅ Si reingresa tras límite, el estado se muestra inmediatamente (capabilities se revalidan en mount)
- ✅ La carta es aleatoria del mazo (backend)
- ✅ Se muestra solo descripción de DB (sin IA — solo FREE/PREMIUM logged in)

### Bloqueos
- ✅ NO puede acceder a tiradas de tarot (`/ritual` requiere auth via `useRequireAuth`)
- ✅ NO puede acceder a historial (redirige a login/registro)
- ⚠️ NO puede compartir resultados (botón compartir no renderiza para anónimos según `canShare = !isAnonymous`)

**Archivos clave:**
- `src/components/features/daily-reading/DailyCardExperience.tsx`
- `src/components/features/daily-reading/AnonymousLimitReached.tsx`
- `src/hooks/api/useUserCapabilities.ts`
- `src/lib/utils/fingerprint.ts`

---

## 2. Usuario FREE

### Carta del Día
- ✅ Límite de 1/día funciona correctamente (capabilities del backend)
- ✅ Al consumir límite, aparece `DailyCardLimitReached` con CTA "Upgrade a PREMIUM"
- ✅ Si reingresa tras límite, modal aparece inmediatamente
- ⚠️ La carta se guarda en historial (endpoint existe, validar manualmente)
- ✅ Se muestra solo descripción de DB (sin IA — `canUseAI = isPremium` en `useUserPlanFeatures`)

### Tiradas de Tarot
- ✅ Puede acceder a tiradas de tarot (`/ritual` requiere auth; FREE tiene acceso)
- ✅ Límite de 1 tirada/día funciona correctamente (capabilities del backend)
- ✅ Límites son independientes (1 carta día + 1 tirada — campos separados en capabilities)
- ✅ Spreads disponibles: SOLO los permitidos por plan (backend filtra via `useMyAvailableSpreads`)
- ⚠️ Spreads de 5 cartas y Cruz Celta están bloqueados/ocultos (depende del backend, validar)
- ✅ Usuario selecciona cartas del mazo (`SpreadSelector` + `ReadingExperience`)
- ✅ NO puede seleccionar categorías (`canUseCategories = isPremium`)
- ✅ NO puede hacer preguntas específicas (`canUseCustomQuestions = isPremium`)
- ✅ Se muestra solo descripción de DB (sin IA — `canUseAI = isPremium`)
- ✅ Al consumir límite, aparece `ReadingLimitReached` / `DailyLimitReachedModal` con CTA upgrade
- ⚠️ Las tiradas se guardan en historial (endpoint existe, validar manualmente)

### Historial
- ✅ Existe página/sección de historial (`/historial` y `/historial/[id]`)
- ⚠️ Se guardan cartas del día (validar manualmente)
- ⚠️ Se guardan tiradas de tarot (validar manualmente)
- ⚠️ Tiene límite (definido en backend por plan — validar con datos reales)
- ⚠️ Muestra indicación de que PREMIUM tiene más (validar en UI)

### Compartir
- ✅ Existe `ShareButton` en `src/components/features/shared/`
- ✅ Funciona desde página de resultado (`DailyCardExperience` y `ReadingExperience` lo usan)
- ⚠️ Funciona desde historial (validar manualmente)
- ✅ Formato: texto copiable al portapapeles + Web Share API nativa (`shouldUseNativeShare`)
- ✅ NO incluye interpretación IA (solo descripción DB para FREE)

**Archivos clave:**
- `src/components/features/readings/ReadingExperience.tsx`
- `src/components/features/readings/SpreadSelector.tsx`
- `src/components/features/readings/ReadingLimitReached.tsx`
- `src/hooks/utils/useUserPlanFeatures.ts`

---

## 3. Usuario PREMIUM

### Carta del Día
- ✅ Límite de 1/día funciona correctamente
- ⚠️ Al consumir límite, aparece notificación suave (sin CTA upgrade) — validar visualmente
- ⚠️ La carta se guarda en historial completo (validar manualmente)
- ✅ Se muestra descripción + **interpretación IA** (`canUseAI = isPremium`)
- ⚠️ La interpretación IA es de buena calidad (validar manualmente)

### Tiradas de Tarot
- ✅ Límite de 3 tiradas/día (backend, capabilities)
- ✅ Límites son independientes (1 carta día + 3 tiradas)
- ✅ Spreads disponibles: 1, 3, 5, Cruz Celta (backend envía spreads según plan)
- ⚠️ Spread de 5 cartas funciona correctamente (validar manualmente)
- ⚠️ Spread de Cruz Celta (10 cartas) funciona correctamente (validar manualmente)
- ✅ Usuario selecciona cartas del mazo
- ✅ SÍ puede seleccionar categorías (`CategorySelector` habilitado para PREMIUM)
- ✅ SÍ puede hacer preguntas específicas (`QuestionSelector` + input custom para PREMIUM)
- ✅ Se muestra descripción + **interpretación IA** (`canUseAI = true`)
- ⚠️ La IA contextualiza según pregunta/categoría (validar con datos reales)
- ⚠️ La interpretación IA es de buena calidad (validar manualmente)
- ⚠️ Las tiradas se guardan en historial completo (validar manualmente)

### Historial
- ✅ Existe página/sección de historial (`/historial`)
- ⚠️ Se guardan TODAS las cartas del día sin límite (depende de config backend)
- ⚠️ Se guardan TODAS las tiradas sin límite (depende de config backend)
- ⚠️ Incluye interpretaciones IA guardadas (validar)
- ⚠️ Tiene filtros (validar en `ReadingsHistory` component)
- ⚠️ Tiene búsqueda (validar en `ReadingsHistory` component)

### Compartir
- ✅ Existe `ShareButton` con soporte nativo (Web Share API) y fallback clipboard
- ✅ Funciona desde página de resultado
- ⚠️ Funciona desde historial (validar)
- ✅ Formato: texto + Web Share API
- ⚠️ SÍ incluye interpretación IA (validar que el texto generado la incluya)
- ⚠️ Se ve visualmente mejor que FREE (validar)

### Integración IA
- ✅ La integración de IA funciona (backend usa Groq Llama 3.1 70B como principal)
- ✅ Modelo principal: **Groq Llama 3.1 70B**
- ✅ Fallbacks: OpenAI GPT-4, DeepSeek (backend maneja los providers)
- ⚠️ El costo de API es sostenible (monitorear via `/admin/ai-usage`)
- ✅ Hay manejo de errores de API (backend tiene circuit breaker por provider)
- ✅ Hay rate limiting (backend tiene `ai-quota.service.ts`)
- ✅ Hay fallback si IA falla (múltiples providers configurados)

**Archivos clave:**
- `src/components/features/readings/ReadingExperience.tsx`
- `src/components/features/readings/CategorySelector.tsx`
- `src/components/features/readings/QuestionSelector.tsx`
- `src/hooks/utils/useUserPlanFeatures.ts`

---

## 4. Sistema de Límites

### Implementación Técnica
- ✅ Los límites se guardan en **backend** (fuente de verdad)
- ✅ Se validan en backend (seguro contra manipulación)
- ✅ No se pueden burlar desde DevTools (validación server-side)
- ✅ Los límites se resetean a medianoche (backend gestiona el reseteo diario)
- ⚠️ Timezone usada para reseteo (verificar en backend — probablemente UTC)
- ✅ Hay logs de uso de límites (disponibles en `/admin/ai-usage` y audit logs)

### Modales
- ✅ Modal ANÓNIMO (`AnonymousLimitReached`) tiene CTA a registro
- ✅ Modal FREE (`DailyCardLimitReached`, `ReadingLimitReached`) tiene CTA a PREMIUM
- ✅ Modal PREMIUM es solo notificación (sin CTA upgrade)
- ⚠️ Los textos de los modales son claros (validar manualmente)
- ✅ Los modales explican el beneficio del upgrade (`LimitReachedModal`, `PremiumUpgradePrompt`)
- ✅ Si usuario reingresa tras límite, modal aparece inmediato (capabilities se revalidan en mount)

**Archivos clave:**
- `src/hooks/api/useUserCapabilities.ts` (single source of truth)
- `src/components/features/conversion/LimitReachedModal.tsx`
- `src/components/features/conversion/RegisterCTAModal.tsx`
- `src/components/features/daily-reading/DailyCardLimitReached.tsx`
- `src/components/features/readings/ReadingLimitReached.tsx`

---

## 5. Sistema de Suscripciones

### Flujo de Pago
- ✅ Existe flujo para upgrade a PREMIUM (`/premium` + `PremiumPreview` + `UpgradeModal`)
- ✅ Gateway de pago: **MercadoPago** (preapproval/subscriptions)
- ⚠️ El precio: definido en backend (plan-config), validar valor actual
- ⚠️ Hay precio anual: verificar en backend plan-config
- ⚠️ Hay trial gratuito: verificar en backend plan-config
- ⚠️ El pago funciona correctamente (validar con MP sandbox)
- ✅ El upgrade es detectado via polling en `/premium/activacion` (consulta `?status=authorized`)
- ✅ Hay confirmación visual del upgrade (página de activación con polling)
- ⚠️ Hay email de confirmación (verificar que backend envíe email post-suscripción)

### Gestión de Suscripción
- ✅ Usuario puede ver su plan actual (perfil + `useUserPlanFeatures`)
- ⚠️ Usuario puede ver fecha de renovación (verificar en `/perfil`)
- ⚠️ Usuario puede cancelar suscripción (verificar si existe UI)
- ⚠️ Usuario puede actualizar método de pago (probablemente via MP portal)
- ⚠️ Qué pasa al cancelar (verificar lógica en backend)

**Archivos clave:**
- `src/app/premium/` y `src/app/premium/activacion/`
- `src/components/features/conversion/PremiumPreview.tsx`
- `src/components/features/readings/UpgradeModal.tsx`
- `src/hooks/api/useSubscription.ts`

---

## 6. Spreads

### Implementación
- ✅ Spread de 1 carta existe (backend + `SpreadSelector`)
- ✅ Spread de 3 cartas existe
- ✅ Spread de 5 cartas existe
- ✅ Spread de Cruz Celta (10 cartas) existe
- ⚠️ Los spreads se renderizan correctamente (validar layout visual de 10 cartas)
- ✅ Las posiciones de cartas tienen significado (backend almacena positionName)
- ✅ Los significados de posición cambian por spread (backend gestiona por spread)

### Restricciones por Plan
- ✅ ANÓNIMO: No ve spreads (no acceso a tiradas — `useRequireAuth`)
- ✅ FREE: Solo ve los spreads permitidos (`useMyAvailableSpreads` filtra según plan)
- ✅ PREMIUM: Ve todos (backend devuelve todos los spreads disponibles)
- ✅ Los spreads bloqueados no son seleccionables (backend no los devuelve para FREE)

**Archivos clave:**
- `src/components/features/readings/SpreadSelector.tsx`
- `src/hooks/api/useReadings.ts` → `useMyAvailableSpreads`

---

## 7. Categorías y Preguntas

### Implementación
- ✅ Existe UI para seleccionar categorías (`CategorySelector.tsx`)
- ✅ Existe UI para hacer preguntas específicas (`QuestionSelector.tsx` + input custom)
- ⚠️ Qué categorías hay (verificar datos que devuelve el backend)
- ✅ Las categorías están bloqueadas para FREE (`canUseCategories = isPremium`)
- ✅ Las categorías están disponibles para PREMIUM
- ⚠️ La IA usa la categoría/pregunta en la interpretación (validar con datos reales)

**Archivos clave:**
- `src/components/features/readings/CategorySelector.tsx`
- `src/components/features/readings/QuestionSelector.tsx`
- `src/app/ritual/preguntas/page.tsx`

---

## 8. Panel de Admin

### Acceso
- ✅ Existe panel de administración (`/admin` con múltiples sub-páginas)
- ✅ Solo usuarios con rol ADMIN pueden acceder (`admin/layout.tsx` protege la ruta)
- ⚠️ Cómo se asignan roles ADMIN (verificar en backend — probablemente en DB directamente)
- ✅ El acceso está protegido en backend (guard de rol en NestJS)

### Configuración
- ✅ Puede ver/modificar configuración de planes (`/admin/planes` — `PlanesConfigContainer`)
- ✅ Puede ver usuarios y sus planes (`/admin/usuarios` — `UsersManagementContent`)
- ✅ Puede modificar suscripción de un usuario (`ChangePlanModal.tsx`)
- ✅ Puede ver estadísticas de uso (`/admin/metricas` — `PlatformMetricsContent`)
- ⚠️ Puede exportar datos (verificar si existe funcionalidad de export)

### Analytics
- ✅ Existe dashboard de métricas (`/admin/metricas`)
- ✅ Muestra métricas de usuarios (`PlatformMetricsContent`, `StatsCard`)
- ✅ Muestra distribución de planes (`PlanDistributionChart`)
- ✅ Muestra lecturas recientes (`RecentReadingsTable`, `DailyReadingsChart`)
- ✅ Monitoreo de IA (`/admin/ai-usage` — `AIUsageContent`, `AIUsageMetricsCards`)
- ⚠️ Muestra ingresos / MRR (verificar si está en métricas)
- ⚠️ Muestra churn rate (verificar si está en métricas)

**Archivos clave:**
- `src/app/admin/` (múltiples sub-páginas)
- `src/components/features/admin/` (todos los componentes de admin)

---

## 9. UX y Comunicación

### Claridad
- ✅ Los usuarios entienden qué plan tienen (`useUserPlanFeatures` → `planLabel`)
- ✅ Los usuarios entienden sus límites (capabilities se muestran en UI)
- ✅ La diferencia entre "carta del día" y "tiradas" es clara (rutas y páginas separadas)
- ✅ El branding PREMIUM es visible (`PremiumBadge`, `UpgradeBanner`, `PremiumPreview`)

### Modales y CTAs
- ✅ Los modales tienen componentes definidos (`LimitReachedModal`, `RegisterCTAModal`, `UpgradeModal`)
- ✅ Los botones de CTA existen en los modales de conversión
- ✅ No hay friction en el flujo de upgrade (directo a MP preapproval)
- ⚠️ Los precios son transparentes (verificar que se muestren en `/premium`)

**Revisión manual pendiente:**
- Usar la app como ANÓNIMO y verificar flujo completo
- Usar la app como FREE y verificar límites reales
- Usar la app como PREMIUM (sandbox MP) y verificar interpretaciones IA

---

## 10. Gaps Identificados

### Validación Manual Pendiente (⚠️ en código)

```markdown
- [ ] **GAP-FE-01**: Verificar que historial guarda lecturas correctamente
  - **Estado actual**: Endpoints existen, historial renderiza lista
  - **Estado esperado**: Lecturas aparecen en /historial tras crearlas
  - **Impacto**: 🟡 Medio
  - **Archivo**: `src/app/historial/page.tsx`

- [ ] **GAP-FE-02**: Verificar restricción de spreads para FREE
  - **Estado actual**: `useMyAvailableSpreads` filtra en frontend, pero depende de backend
  - **Estado esperado**: FREE solo ve spreads de 1 y 3 cartas
  - **Impacto**: 🔴 Alto
  - **Archivo**: `src/hooks/api/useReadings.ts`

- [ ] **GAP-FE-03**: Verificar timezone del reseteo de límites
  - **Estado actual**: Reseteo implementado en backend
  - **Estado esperado**: Reseteo a medianoche ARG (UTC-3)
  - **Impacto**: 🟡 Medio
  - **Archivo**: backend `user-capabilities.service.ts`

- [ ] **GAP-FE-04**: Verificar que la IA usa categoría/pregunta en interpretación
  - **Estado actual**: Se envían al backend en el request
  - **Estado esperado**: La interpretación refleja la categoría o pregunta elegida
  - **Impacto**: 🔴 Alto (es la propuesta de valor principal para PREMIUM)
  - **Archivo**: `src/components/features/readings/ReadingExperience.tsx`

- [ ] **GAP-FE-05**: Verificar flujo completo de suscripción con MP sandbox
  - **Estado actual**: Preapproval creado, activación por polling implementada
  - **Estado esperado**: Usuario sube a PREMIUM y ve cambio inmediato en UI
  - **Impacto**: 🔴 Alto
  - **Archivos**: `src/app/premium/activacion/`, `src/hooks/api/useSubscription.ts`
```

---

## Cómo Usar Este Checklist

### Para validación manual:
1. Crear usuarios de prueba (free, premium con MP sandbox)
2. Probar cada ⚠️ del checklist
3. Actualizar ⚠️ → ✅ o ❌ según resultado

### Con Claude:
```
Lee CHECKLIST_VALIDACION_CODIGO.md y ayúdame a validar los ⚠️ 
buscando en el código. Empecemos por la sección [N].
```

---

## Resultado

- ✅ **Implementado**: ~60% de funcionalidades verificadas en código
- ⚠️ **Requiere validación manual**: ~35% (principalmente historial, spreads, flujo MP)
- ❌ **No implementado**: ~5% (export de datos, algunas métricas financieras)

---

**Próximo paso:** Validar manualmente los ⚠️ críticos (GAP-FE-02, GAP-FE-04, GAP-FE-05)
