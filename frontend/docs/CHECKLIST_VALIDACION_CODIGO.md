# Checklist de Validación - Código vs Modelo de Negocio

**Objetivo:** Verificar qué del modelo de negocio definido está implementado correctamente.

**Instrucción:** Marca ✅ cuando valides que funciona, ❌ si no existe/no funciona, ⚠️ si está parcial.

---

## 1. Usuario ANÓNIMO

### Carta del Día
- [ ] Puede acceder a la carta del día sin registro
- [ ] El límite es exactamente 1/día
- [ ] El límite se persiste entre sesiones (¿localStorage? ¿cookies?)
- [ ] Al consumir el límite, aparece modal con CTA "Regístrate"
- [ ] Si reingresa tras límite, el modal aparece inmediatamente
- [ ] La carta es aleatoria del mazo
- [ ] Se muestra solo descripción de DB (sin IA)

### Bloqueos
- [ ] NO puede acceder a tiradas de tarot (bloqueado en UI)
- [ ] NO puede acceder a historial
- [ ] NO puede compartir resultados

**Archivos a revisar:**
- `src/pages/DailyCard/`
- `src/hooks/useDailyCardLimit.ts`
- `src/components/DailyCardLimitModal.tsx`
- `src/contexts/auth/` (validar permisos anónimos)

---

## 2. Usuario FREE

### Carta del Día
- [ ] Límite de 1/día funciona correctamente
- [ ] Al consumir límite, aparece modal con CTA "Upgrade a PREMIUM"
- [ ] Si reingresa tras límite, modal aparece inmediatamente
- [ ] La carta se guarda en historial
- [ ] Se muestra solo descripción de DB (sin IA)

### Tiradas de Tarot
- [ ] Puede acceder a tiradas de tarot
- [ ] Límite de 1 tirada/día funciona correctamente
- [ ] Límites son independientes (1 carta día + 1 tirada)
- [ ] Spreads disponibles: SOLO 1 carta y 3 cartas
- [ ] Spreads de 5 cartas y Cruz Celta están bloqueados/ocultos
- [ ] Usuario selecciona cartas del mazo (no aleatorio)
- [ ] NO puede seleccionar categorías (bloqueado en UI)
- [ ] NO puede hacer preguntas específicas (bloqueado en UI)
- [ ] Se muestra solo descripción de DB (sin IA)
- [ ] Al consumir límite, aparece modal con CTA "Upgrade a PREMIUM"
- [ ] Las tiradas se guardan en historial

### Historial
- [ ] Existe página/sección de historial
- [ ] Se guardan cartas del día
- [ ] Se guardan tiradas de tarot
- [ ] Tiene límite (¿cuántas lecturas? ¿tiempo?)
- [ ] Muestra indicación de que PREMIUM tiene más

### Compartir
- [ ] Existe botón/opción de compartir
- [ ] Funciona desde página de resultado
- [ ] Funciona desde historial
- [ ] ¿Formato? (imagen/link/PDF/texto)
- [ ] NO incluye interpretación IA (solo descripción DB)

**Archivos a revisar:**
- `src/pages/Reading/ReadingPage.tsx`
- `src/pages/Reading/ReadingFlow/`
- `src/hooks/` (buscar hook de límite de tiradas)
- `src/pages/History/` o similar
- `src/components/ShareButton.tsx` o similar

---

## 3. Usuario PREMIUM

### Carta del Día
- [ ] Límite de 1/día funciona correctamente
- [ ] Al consumir límite, aparece notificación suave (sin CTA upgrade)
- [ ] La carta se guarda en historial completo
- [ ] Se muestra descripción + **interpretación IA**
- [ ] La interpretación IA es de buena calidad

### Tiradas de Tarot
- [ ] Límite de 3 tiradas/día funciona correctamente
- [ ] Límites son independientes (1 carta día + 3 tiradas)
- [ ] Spreads disponibles: 1, 3, 5, Cruz Celta
- [ ] Spread de 5 cartas funciona correctamente
- [ ] Spread de Cruz Celta (10 cartas) funciona correctamente
- [ ] Usuario selecciona cartas del mazo
- [ ] SÍ puede seleccionar categorías
- [ ] SÍ puede hacer preguntas específicas
- [ ] Se muestra descripción + **interpretación IA**
- [ ] La IA contextualiza según pregunta/categoría
- [ ] La interpretación IA es de buena calidad
- [ ] Las tiradas se guardan en historial completo

### Historial
- [ ] Existe página/sección de historial
- [ ] Se guardan TODAS las cartas del día (sin límite)
- [ ] Se guardan TODAS las tiradas de tarot (sin límite)
- [ ] Incluye interpretaciones IA guardadas
- [ ] Tiene filtros (por fecha, tipo, etc.)
- [ ] Tiene búsqueda

### Compartir
- [ ] Existe botón/opción de compartir
- [ ] Funciona desde página de resultado
- [ ] Funciona desde historial
- [ ] ¿Formato? (imagen/link/PDF/texto)
- [ ] SÍ incluye interpretación IA
- [ ] Se ve visualmente mejor que FREE

### Integración IA
- [ ] La integración de IA funciona
- [ ] ¿Qué modelo se usa? _________________
- [ ] ¿Qué servicio? (OpenAI/Claude/otro) _________________
- [ ] ¿El costo de API es sostenible?
- [ ] ¿Hay manejo de errores de API?
- [ ] ¿Hay rate limiting?
- [ ] ¿Hay fallback si IA falla?

**Archivos a revisar:**
- `src/pages/Reading/ReadingPage.tsx`
- `src/pages/Reading/ReadingFlow/`
- `src/services/ai/` o `src/api/` (integración IA)
- `src/pages/History/`
- `src/contexts/subscription/SubscriptionProvider.tsx`

---

## 4. Sistema de Límites

### Implementación Técnica
- [ ] ¿Los límites se guardan en backend o frontend?
- [ ] ¿Se validan en backend (seguro)?
- [ ] ¿Se pueden burlar desde DevTools?
- [ ] ¿Los límites se resetean correctamente a medianoche?
- [ ] ¿Qué timezone se usa para reseteo?
- [ ] ¿Hay logs de uso de límites?

### Modales
- [ ] Modal ANÓNIMO tiene CTA a registro
- [ ] Modal FREE tiene CTA a PREMIUM
- [ ] Modal PREMIUM es solo notificación
- [ ] Los textos de los modales son claros
- [ ] Los modales explican el beneficio del upgrade
- [ ] Si usuario reingresa tras límite, modal aparece inmediato

**Archivos a revisar:**
- `src/hooks/useDailyCardLimit.ts`
- `src/hooks/useReadingLimit.ts` (si existe)
- `src/components/DailyCardLimitModal.tsx`
- `src/components/ReadingLimitModal.tsx` (si existe)
- `backend/` (validar lógica de límites)

---

## 5. Sistema de Suscripciones

### Flujo de Pago
- [ ] Existe flujo para upgrade a PREMIUM
- [ ] ¿Qué gateway de pago? _________________
- [ ] ¿El precio es? $________ / mes
- [ ] ¿Hay precio anual? $________ / año
- [ ] ¿Hay trial gratuito? _____ días
- [ ] El pago funciona correctamente
- [ ] El upgrade es inmediato tras pago exitoso
- [ ] Hay confirmación visual del upgrade
- [ ] Hay email de confirmación

### Gestión de Suscripción
- [ ] Usuario puede ver su plan actual
- [ ] Usuario puede ver fecha de renovación
- [ ] Usuario puede cancelar suscripción
- [ ] Usuario puede actualizar método de pago
- [ ] ¿Qué pasa al cancelar? (acceso hasta fin de periodo/inmediato)

**Archivos a revisar:**
- `src/contexts/subscription/SubscriptionProvider.tsx`
- `src/components/UpgradeModal.tsx`
- `src/pages/Subscription/` o `src/pages/Billing/`
- `backend/subscriptions/` o similar

---

## 6. Spreads

### Implementación
- [ ] Spread de 1 carta existe
- [ ] Spread de 3 cartas existe
- [ ] Spread de 5 cartas existe
- [ ] Spread de Cruz Celta (10 cartas) existe
- [ ] Los spreads se renderizan correctamente
- [ ] Las posiciones de cartas tienen significado
- [ ] ¿Los significados de posición cambian por spread?

### Restricciones por Plan
- [ ] ANÓNIMO: No ve spreads (no acceso a tiradas)
- [ ] FREE: Solo ve 1 y 3 cartas
- [ ] PREMIUM: Ve todos (1, 3, 5, Cruz Celta)
- [ ] Los spreads bloqueados no son seleccionables en FREE

**Archivos a revisar:**
- `src/pages/Reading/ReadingFlow/SpreadSelection.tsx` (o similar)
- `src/components/Spread/` (si existe)
- `src/types/spreads.ts` (si existe)

---

## 7. Categorías y Preguntas

### Implementación
- [ ] Existe UI para seleccionar categorías
- [ ] Existe UI para hacer preguntas específicas
- [ ] ¿Qué categorías hay? _________________
- [ ] Las categorías están bloqueadas para FREE
- [ ] Las categorías están disponibles para PREMIUM
- [ ] La IA usa la categoría/pregunta en la interpretación

**Archivos a revisar:**
- `src/pages/Reading/ReadingFlow/CategorySelection.tsx` (o similar)
- `src/pages/Reading/ReadingFlow/QuestionInput.tsx` (o similar)

---

## 8. Panel de Admin

### Acceso
- [ ] Existe panel de administración
- [ ] Solo usuarios con rol ADMIN pueden acceder
- [ ] ¿Cómo se asignan roles ADMIN? _________________
- [ ] El acceso está protegido en backend

### Configuración
- [ ] Puede modificar límites de planes (¿o hardcoded?)
- [ ] Puede modificar precio de PREMIUM (¿o hardcoded?)
- [ ] Puede ver usuarios y sus planes
- [ ] Puede modificar suscripción de un usuario (para soporte)
- [ ] Puede ver estadísticas de uso
- [ ] Puede exportar datos

### Analytics
- [ ] Existe dashboard de métricas
- [ ] Muestra total usuarios (ANÓNIMO/FREE/PREMIUM)
- [ ] Muestra conversión FREE → PREMIUM
- [ ] Muestra ingresos (MRR)
- [ ] Muestra uso de lecturas/día
- [ ] Muestra churn rate

**Archivos a revisar:**
- `src/pages/Admin/` o `src/pages/Dashboard/`
- `src/contexts/auth/` (roles)
- `backend/admin/` (si existe)

---

## 9. UX y Comunicación

### Claridad
- [ ] Los usuarios entienden qué plan tienen
- [ ] Los usuarios entienden sus límites
- [ ] Los usuarios entienden qué ganan con upgrade
- [ ] La diferencia entre "carta del día" y "tiradas" es clara
- [ ] El branding PREMIUM es visible en la UI

### Modales y CTAs
- [ ] Los modales tienen copy claro y convincente
- [ ] Los botones de CTA son visibles
- [ ] No hay friction en el flujo de upgrade
- [ ] Los precios son transparentes (no sorpresas)

**Revisión manual:**
- Usar la app como ANÓNIMO
- Usar la app como FREE
- Usar la app como PREMIUM
- ¿La experiencia refleja la visión del negocio?

---

## 10. Gaps Críticos Identificados

### Durante Validación, Documentar:

```markdown
- [ ] **GAP-X**: [Descripción del problema]
  - **Estado actual**: [Qué pasa ahora]
  - **Estado esperado**: [Qué debería pasar]
  - **Impacto**: 🔴 Alto / 🟡 Medio / 🟢 Bajo
  - **Archivo relacionado**: [path/to/file.tsx]
```

---

## Cómo Usar Este Checklist

### Opción 1: Manual
1. Crea usuarios de prueba (anónimo, free, premium)
2. Prueba cada funcionalidad
3. Marca ✅/❌/⚠️ según corresponda

### Opción 2: Con Claude
Usa este prompt:
```
Lee el checklist en CHECKLIST_VALIDACION_CODIGO.md y ayúdame a validar
cada punto buscando en el código. Empecemos por la sección 1 (Usuario ANÓNIMO).
```

### Opción 3: Combinado (Recomendado)
1. Claude busca en el código y documenta hallazgos
2. Tú validas manualmente la experiencia de usuario
3. Comparan resultados y documentan gaps

---

## Resultado Esperado

Al completar este checklist tendrás:
- ✅ Lista clara de qué funciona
- ❌ Lista clara de qué NO funciona
- ⚠️ Lista clara de qué funciona parcialmente
- 📋 Lista priorizada de gaps a resolver

---

**Próximo paso:** Iniciar validación y documentar gaps en [USER_STORIES_AUDIT.md](USER_STORIES_AUDIT.md)
