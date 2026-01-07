# User Stories Audit - Tarot App

## Objetivo
Documentar retroactivamente las historias de usuario basándose en la implementación actual y validar alineación con la visión del negocio.

---

## Estructura de Usuarios

### Niveles de Acceso
1. **ANÓNIMO**: Usuario sin registro
2. **FREE**: Usuario autenticado con cuenta gratuita
3. **PREMIUM**: Usuario con suscripción paga
4. **ADMIN**: Roles administrativos (acceso a configuración y datos del proyecto)

### Diferencias Clave entre Features

#### Carta del Día vs Tiradas de Tarot
- **Carta del Día**: Tirada rápida para obtener energías del día. Una sola carta aleatoria.
- **Tiradas de Tarot**: Lectura clásica más profunda. Usuario selecciona cartas del mazo completo.

#### Interpretaciones
- **Sin IA** (ANÓNIMO/FREE): Solo descripción de carta desde DB
- **Con IA** (PREMIUM): Interpretaciones completas generadas con IA

### Límites por Nivel de Usuario

| Feature | ANÓNIMO | FREE | PREMIUM |
|---------|---------|------|---------|
| **Carta del Día** | 1/día (sin IA) | 1/día (sin IA) | 1/día (con IA) |
| **Tiradas de Tarot** | ❌ No acceso | 1/día (1 o 3 cartas, sin IA) | 3/día (1, 3, 5, Cruz Celta, con IA) |
| **Categorías/Preguntas** | ❌ | ❌ | ✅ |
| **Interpretación IA** | ❌ | ❌ | ✅ |
| **Historial** | ❌ | ✅ Limitado | ✅ Completo |
| **Compartir Resultados** | ❌ | ✅ | ✅ |

---

## Epic 1: Sistema de Lecturas de Tarot

### US-1.1: Carta del Día (Usuario Anónimo)
**Como** usuario anónimo (sin registro)
**Quiero** recibir una carta del día
**Para** probar la aplicación antes de registrarme

#### Criterios de Aceptación
- [x] Puedo acceder a 1 carta del día sin crear cuenta
- [x] La carta es aleatoria del mazo
- [x] Veo la descripción de la carta (sin IA)
- [x] Límite: 1 carta/día
- [x] Al alcanzar el límite, veo modal con CTA para registrarme
- [ ] Si vuelvo al home y reingreso, veo el modal inmediatamente ⚠️ GAP-006
- [x] El modal explica los beneficios de registrarse

#### Estado de Implementación
- **Archivos relacionados**:
  - [DailyCardExperience.tsx](../src/components/features/daily-reading/DailyCardExperience.tsx)
  - [TryWithoutRegisterSection.tsx](../src/components/features/home/TryWithoutRegisterSection.tsx)
  - [AnonymousLimitReached.tsx](../src/components/features/daily-reading/AnonymousLimitReached.tsx)
- **Estado**: ✅ **VALIDADO** (con mejora UX pendiente)
- **Fecha validación**: 2026-01-07
- **Resultados**:
  - ✅ Los anónimos pueden acceder correctamente a `/carta-del-dia`
  - ✅ El límite de 1/día funciona correctamente (backend valida con 403/409)
  - ✅ El modal de conversión es claro y efectivo
  - ✅ Se persiste con sessionStorage (`tarot_daily_card_consumed`) + fingerprint
  - ⚠️ **GAP-006**: Modal debería aparecer inmediatamente, no después del click
- **Ver detalle completo**: Sección "VALIDACIONES MANUALES EN PROGRESO" al final del documento

---

### US-1.2: Carta del Día (Usuario FREE)
**Como** usuario FREE (autenticado)
**Quiero** recibir mi carta del día
**Para** obtener las energías necesarias para encarar el día

#### Criterios de Aceptación
- [ ] Puedo acceder a 1 carta del día
- [ ] La carta es aleatoria del mazo
- [ ] Veo la descripción de la carta (sin IA, desde DB)
- [ ] Límite: 1 carta/día
- [ ] Al alcanzar el límite, veo modal con CTA para PREMIUM
- [ ] Si vuelvo al home y reingreso tras consumir el límite, veo el modal inmediatamente
- [ ] La carta se guarda en mi historial limitado
- [ ] Puedo compartir el resultado

#### Estado de Implementación
- **Archivos relacionados**:
  - [DailyCard/](../src/pages/DailyCard/)
  - [useDailyCardLimit.ts](../src/hooks/useDailyCardLimit.ts)
  - [DailyCardLimitModal.tsx](../src/components/DailyCardLimitModal.tsx)
- **Estado**: ⚠️ **VALIDAR**
- **Validar**:
  - ¿El límite de 1/día funciona correctamente para FREE?
  - ¿Se diferencia el modal FREE del modal ANÓNIMO?
  - ¿El historial guarda las cartas del día?
  - ¿La opción de compartir funciona?

---

### US-1.3: Tiradas de Tarot (Usuario FREE)
**Como** usuario FREE (autenticado)
**Quiero** realizar tiradas de tarot clásicas
**Para** obtener lecturas más profundas sobre mis inquietudes

#### Criterios de Aceptación
- [ ] Puedo realizar 1 tirada de tarot por día
- [ ] Puedo elegir entre tirada de 1 carta o 3 cartas
- [ ] **NO** puedo seleccionar categorías ni preguntas (sin IA)
- [ ] Selecciono las cartas del mazo completo (no aleatorio)
- [ ] Veo descripción de cada carta (sin IA, desde DB)
- [ ] Límite: 1 tirada/día (independiente de la carta del día)
- [ ] Al alcanzar el límite, veo modal con CTA para PREMIUM
- [ ] Si vuelvo al home tras consumir ambos límites (1 carta día + 1 tirada), veo el modal inmediatamente
- [ ] La tirada se guarda en mi historial limitado
- [ ] Puedo compartir el resultado

#### Estado de Implementación
- **Archivos relacionados**:
  - [ReadingPage.tsx](../src/pages/Reading/ReadingPage.tsx)
  - [ReadingFlow/](../src/pages/Reading/ReadingFlow/)
  - ⚠️ **Buscar**: ¿Hook para límite de tiradas?
- **Estado**: ⚠️ **VALIDAR**
- **Validar**:
  - ¿Está implementado el límite de 1 tirada/día?
  - ¿Los spreads disponibles son solo 1 y 3 cartas?
  - ¿Se bloquea la selección de categorías/preguntas?
  - ¿Se diferencia claramente de "carta del día"?
  - ¿El usuario entiende que tiene 2 límites separados? (1 carta día + 1 tirada)

---

### US-1.4: Carta del Día con IA (Usuario PREMIUM)
**Como** usuario PREMIUM
**Quiero** recibir mi carta del día con interpretación de IA
**Para** obtener insights más profundos sobre las energías del día

#### Criterios de Aceptación
- [ ] Puedo acceder a 1 carta del día
- [ ] La carta es aleatoria del mazo
- [ ] Veo la descripción de la carta + **interpretación completa generada por IA**
- [ ] Límite: 1 carta/día
- [ ] Al alcanzar el límite, veo notificación (sin CTA de upgrade)
- [ ] La carta se guarda en mi historial completo
- [ ] Puedo compartir el resultado con la interpretación IA

#### Estado de Implementación
- **Archivos relacionados**:
  - [DailyCard/](../src/pages/DailyCard/)
  - [useDailyCardLimit.ts](../src/hooks/useDailyCardLimit.ts)
  - ⚠️ **Buscar**: Integración IA para interpretaciones
- **Estado**: ⚠️ **VALIDAR**
- **Validar**:
  - ¿La interpretación IA está implementada?
  - ¿Qué modelo de IA se usa? (OpenAI, Claude, otro)
  - ¿La calidad de interpretación es notablemente superior?
  - ¿Se diferencia visualmente la experiencia PREMIUM?

---

### US-1.5: Tiradas de Tarot con IA (Usuario PREMIUM)
**Como** usuario PREMIUM
**Quiero** realizar tiradas de tarot con interpretaciones de IA
**Para** obtener lecturas profundas y personalizadas

#### Criterios de Aceptación
- [ ] Puedo realizar 3 tiradas de tarot por día
- [ ] Puedo elegir entre spreads: 1 carta, 3 cartas, 5 cartas, Cruz Celta
- [ ] **SÍ** puedo seleccionar categorías y hacer preguntas específicas
- [ ] Selecciono las cartas del mazo completo
- [ ] Veo descripción de cada carta + **interpretación completa generada por IA**
- [ ] La IA considera mi pregunta/categoría en la interpretación
- [ ] Límite: 3 tiradas/día (independiente de la carta del día)
- [ ] Al alcanzar el límite, veo notificación informativa (sin CTA)
- [ ] Las tiradas se guardan en mi historial completo
- [ ] Puedo compartir el resultado con interpretación IA

#### Estado de Implementación
- **Archivos relacionados**:
  - [ReadingPage.tsx](../src/pages/Reading/ReadingPage.tsx)
  - [ReadingFlow/](../src/pages/Reading/ReadingFlow/)
  - ⚠️ **Buscar**: Integración IA, límite de 3 tiradas
- **Estado**: ⚠️ **VALIDAR**
- **Validar**:
  - ¿Está implementado el límite de 3 tiradas/día?
  - ¿Todos los spreads (1, 3, 5, Cruz Celta) están disponibles?
  - ¿La selección de categorías/preguntas funciona?
  - ¿La IA genera interpretaciones contextualizadas?
  - ¿El usuario entiende que tiene 2 límites? (1 carta día + 3 tiradas)
  - ¿Cruz Celta (10 cartas) es exclusivo de PREMIUM?

---

### US-1.6: Historial de Lecturas (FREE)
**Como** usuario FREE
**Quiero** ver mis lecturas pasadas en un historial limitado
**Para** revisitar resultados sin perder información importante

#### Criterios de Aceptación
- [ ] Puedo acceder a mi historial desde el menú/navegación
- [ ] Veo mis cartas del día pasadas (limitado)
- [ ] Veo mis tiradas de tarot pasadas (limitado)
- [ ] ¿Límite de historial? (ej: últimas 10 lecturas, último mes, etc.)
- [ ] Puedo abrir una lectura pasada para verla completa
- [ ] Puedo compartir una lectura desde el historial
- [ ] Veo indicación de que PREMIUM tiene historial completo

#### Estado de Implementación
- **Archivos relacionados**:
  - ⚠️ **Buscar**: HistoryPage, ReadingHistory, etc.
- **Estado**: ⚠️ **VALIDAR**
- **Validar**:
  - ¿Existe el historial para FREE?
  - ¿Cuál es el límite específico? (cantidad/tiempo)
  - ¿Qué se muestra: solo resultados o también preguntas/contexto?

---

### US-1.7: Historial de Lecturas (PREMIUM)
**Como** usuario PREMIUM
**Quiero** ver todas mis lecturas pasadas sin límite
**Para** hacer seguimiento completo de mi evolución espiritual

#### Criterios de Aceptación
- [ ] Puedo acceder a mi historial desde el menú/navegación
- [ ] Veo **todas** mis cartas del día pasadas (sin límite)
- [ ] Veo **todas** mis tiradas de tarot pasadas (sin límite)
- [ ] Puedo filtrar por fecha, tipo de lectura, etc.
- [ ] Puedo buscar en mi historial
- [ ] Puedo abrir cualquier lectura pasada con interpretación IA completa
- [ ] Puedo compartir cualquier lectura desde el historial

#### Estado de Implementación
- **Archivos relacionados**:
  - ⚠️ **Buscar**: HistoryPage, ReadingHistory, etc.
- **Estado**: ⚠️ **VALIDAR**
- **Validar**:
  - ¿Existe el historial completo para PREMIUM?
  - ¿Hay funciones de filtrado/búsqueda?
  - ¿Se diferencian visualmente las lecturas con IA vs sin IA?

---

### US-1.8: Compartir Resultados
**Como** usuario (FREE/PREMIUM)
**Quiero** compartir mis lecturas
**Para** consultar con amigos o guardar externamente

#### Criterios de Aceptación
- [ ] Puedo compartir una carta del día
- [ ] Puedo compartir una tirada de tarot
- [ ] ¿Formato de compartir? (imagen, link, texto, PDF)
- [ ] El resultado compartido es visualmente atractivo
- [ ] No se comparte información privada (mi email, etc.)
- [ ] FREE comparte sin interpretación IA
- [ ] PREMIUM comparte con interpretación IA incluida

#### Estado de Implementación
- **Archivos relacionados**:
  - ⚠️ **Buscar**: ShareButton, ShareModal, etc.
- **Estado**: ⚠️ **VALIDAR**
- **Validar**:
  - ¿Existe la funcionalidad de compartir?
  - ¿En qué formato se comparte?
  - ¿Se ve bien en redes sociales?
  - ¿Incluye branding de la app? (marketing orgánico)

---

## Epic 2: Sistema de Acceso y Suscripciones

### US-2.1: Experiencia Usuario Anónimo
**Como** visitante anónimo (sin cuenta)
**Quiero** probar la aplicación sin registrarme
**Para** evaluar si vale la pena crear una cuenta

#### Criterios de Aceptación
- [ ] Puedo acceder a funcionalidad limitada sin registro
- [ ] Veo claramente qué funcionalidad está limitada
- [ ] El call-to-action para registrarme es claro
- [ ] La experiencia me motiva a crear cuenta

#### Estado de Implementación
- **Archivos relacionados**:
  - [AuthContext.tsx](../src/contexts/auth/)
  - [SubscriptionProvider.tsx](../src/contexts/subscription/SubscriptionProvider.tsx)
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas críticas**:
  - ¿Actualmente los usuarios anónimos PUEDEN usar la app?
  - ¿Qué features están disponibles para anónimos?
  - ¿Cuál es el límite de uso para anónimos?
  - ¿Hay un "trial" antes de registrarse?

---

### US-2.2: Registro y Conversión FREE
**Como** usuario anónimo
**Quiero** crear una cuenta gratuita fácilmente
**Para** acceder a más funcionalidad sin pagar

#### Criterios de Aceptación
- [ ] Puedo registrarme con email/contraseña
- [ ] El proceso es rápido (menos de 1 minuto)
- [ ] Veo inmediatamente qué gané al registrarme
- [ ] Entiendo las diferencias entre FREE y PREMIUM

#### Estado de Implementación
- **Archivos relacionados**:
  - [auth/](../src/contexts/auth/)
- **Estado**: ✅ Implementado (asumo)
- **Validar**:
  - ¿Hay OAuth/social login? ¿Debería haberlo?
  - ¿El onboarding explica las limitaciones FREE?
  - ¿Qué ventajas concretas obtiene vs anónimo?

---

### US-2.3: Usuario FREE (Modelo Freemium)
**Como** usuario FREE
**Quiero** usar la app con limitaciones claras y justas
**Para** decidir si vale la pena pagar por PREMIUM

#### Criterios de Aceptación
- [ ] Puedo usar la app con limitaciones claras y justas
- [ ] Veo exactamente qué obtendría con PREMIUM
- [ ] El upgrade es fácil de entender y ejecutar
- [ ] No me siento frustrado por las limitaciones (balance correcto)

#### Estado de Implementación
- **Archivos relacionados**:
  - [subscription/](../src/contexts/subscription/)
  - [UpgradeModal.tsx](../src/components/UpgradeModal.tsx)
  - [DailyCardLimitModal.tsx](../src/components/DailyCardLimitModal.tsx)
- **Estado**: ✅ Implementado
- **Validar**:
  - ¿Las limitaciones FREE son las correctas para el negocio?
  - ¿El mensaje de upgrade es convincente pero no molesto?
  - ¿Cuándo y dónde se muestra el modal de upgrade?

---

### US-2.4: Upgrade a PREMIUM
**Como** usuario FREE
**Quiero** actualizar mi cuenta a PREMIUM fácilmente
**Para** desbloquear todo el potencial de la app

#### Criterios de Aceptación
- [ ] El proceso de pago es claro y seguro
- [ ] Veo exactamente qué ganaré antes de pagar
- [ ] El cambio a PREMIUM es inmediato después del pago
- [ ] Recibo confirmación del upgrade

#### Estado de Implementación
- **Archivos relacionados**:
  - [SubscriptionProvider.tsx](../src/contexts/subscription/SubscriptionProvider.tsx)
  - [UpgradeModal.tsx](../src/components/UpgradeModal.tsx)
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas críticas**:
  - ¿Qué gateway de pago usas? (Stripe, MercadoPago, otro)
  - ¿El flujo de pago está completamente implementado?
  - ¿Hay período de prueba (trial) para PREMIUM?
  - ¿El precio está claramente visible?

---

### US-2.5: Experiencia Usuario PREMIUM
**Como** usuario PREMIUM
**Quiero** una experiencia superior y sin fricciones
**Para** sentir que mi suscripción vale la pena

#### Criterios de Aceptación
- [ ] No tengo límites en ninguna funcionalidad
- [ ] Accedo a features exclusivos (si existen)
- [ ] No veo modales de upgrade ni interrupciones
- [ ] La experiencia es notablemente mejor que FREE
- [ ] Mi estatus PREMIUM es visible en la UI

#### Estado de Implementación
- **Archivos relacionados**:
  - [SubscriptionProvider.tsx](../src/contexts/subscription/SubscriptionProvider.tsx)
- **Estado**: ✅ Implementado
- **Validar**:
  - ¿Hay features exclusivos de PREMIUM más allá de "ilimitado"?
  - ¿El valor percibido justifica el precio mensual?
  - ¿Qué diferencia la experiencia PREMIUM de FREE?
  - ¿Hay badges o indicadores de estatus PREMIUM?

---

## Epic 3: Panel de Administración

### US-3.1: Acceso Admin
**Como** administrador del sistema
**Quiero** acceder a un panel de administración seguro
**Para** gestionar la aplicación y sus datos

#### Criterios de Aceptación
- [ ] Solo usuarios con rol ADMIN pueden acceder
- [ ] El acceso está protegido y auditado
- [ ] Puedo cambiar de vista usuario ↔ admin fácilmente
- [ ] Veo indicación clara de que estoy en modo admin

#### Estado de Implementación
- **Archivos relacionados**:
  - [AuthContext.tsx](../src/contexts/auth/)
  - ⚠️ **Buscar**: ¿Existe AdminPanel o similar?
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas críticas**:
  - ¿Existe actualmente un panel de admin?
  - ¿Cómo se asignan los roles de admin?
  - ¿Hay diferentes niveles de admin? (super-admin, moderador, etc.)

---

### US-3.2: Configuración del Proyecto
**Como** administrador
**Quiero** acceder y modificar la configuración del proyecto
**Para** ajustar parámetros sin tocar el código

#### Criterios de Aceptación
- [ ] Puedo modificar configuraciones generales
- [ ] Puedo cambiar límites de uso (FREE/PREMIUM)
- [ ] Puedo gestionar features flags
- [ ] Los cambios se aplican sin necesidad de deploy
- [ ] Hay validación para evitar configuraciones inválidas

#### Estado de Implementación
- **Archivos relacionados**:
  - ⚠️ **Buscar**: ConfigPanel, SettingsAdmin, etc.
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas críticas**:
  - ¿Qué configuraciones necesitas modificar desde admin?
  - ¿Los límites FREE (ej: 3 cartas/día) son configurables o hardcoded?
  - ¿Hay feature flags implementados?

---

### US-3.3: Gestión de Datos del Proyecto
**Como** administrador
**Quiero** visualizar y gestionar datos clave del proyecto
**Para** monitorear el negocio y resolver problemas

#### Criterios de Aceptación
- [ ] Veo estadísticas de usuarios (FREE vs PREMIUM)
- [ ] Veo métricas de uso (lecturas, daily cards)
- [ ] Puedo buscar usuarios específicos
- [ ] Puedo modificar suscripciones de usuarios (para soporte)
- [ ] Puedo ver logs de errores o actividad

#### Estado de Implementación
- **Archivos relacionados**:
  - ⚠️ **Buscar**: Dashboard, Analytics, UserManagement
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas críticas**:
  - ¿Qué datos necesitas monitorear?
  - ¿Existe analytics implementado?
  - ¿Necesitas exportar datos?
  - ¿Hay herramientas de soporte al usuario?

---

### US-3.4: Gestión de Contenido (Opcional)
**Como** administrador
**Quiero** gestionar el contenido del tarot (cartas, interpretaciones)
**Para** actualizar o agregar nuevo contenido sin desarrolladores

#### Criterios de Aceptación
- [ ] Puedo editar interpretaciones de cartas
- [ ] Puedo agregar/modificar spreads
- [ ] Los cambios se reflejan inmediatamente
- [ ] Hay preview antes de publicar cambios

#### Estado de Implementación
- **Archivos relacionados**:
  - ⚠️ **Buscar**: ContentManagement, CardEditor
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas críticas**:
  - ¿Las interpretaciones son estáticas o configurables?
  - ¿Necesitas CMS para gestionar contenido?
  - ¿Los spreads son fijos o dinámicos?

---

## Epic 4: Otras Funcionalidades (Pendiente de Descubrir)

### US-4.X: Historial de Lecturas
**Como** usuario autenticado (FREE/PREMIUM)
**Quiero** ver mis lecturas pasadas
**Para** revisitar interpretaciones y ver mi evolución

#### Estado de Implementación
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas**:
  - ¿Existe esta funcionalidad?
  - ¿Cuántas lecturas se guardan?
  - ¿FREE tiene límite de historial?

---

### US-4.X: Favoritos / Guardados
**Como** usuario
**Quiero** marcar lecturas o cartas como favoritas
**Para** acceder rápidamente a las más significativas

#### Estado de Implementación
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas**:
  - ¿Existe esta funcionalidad?
  - ¿Es exclusiva de PREMIUM?

---

### US-4.X: Compartir Lecturas
**Como** usuario
**Quiero** compartir mis lecturas
**Para** consultar con amigos o guardar externamente

#### Estado de Implementación
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas**:
  - ¿Existe esta funcionalidad?
  - ¿Se comparte como imagen, link, o texto?

---

### US-4.X: Notificaciones / Recordatorios
**Como** usuario
**Quiero** recibir recordatorios para mi carta diaria
**Para** no olvidar mi ritual matutino

#### Estado de Implementación
- **Estado**: ⚠️ **VALIDAR**
- **Preguntas**:
  - ¿Existe esta funcionalidad?
  - ¿Push notifications, email, o in-app?

---

## Tabla Resumen: Matriz de Features por Nivel de Usuario

### Funcionalidades Principales

| Feature / Funcionalidad | ANÓNIMO | FREE | PREMIUM | Estado | Validar |
|-------------------------|---------|------|---------|--------|---------|
| **Carta del Día** | ✅ 1/día (sin IA) | ✅ 1/día (sin IA) | ✅ 1/día (con IA) | ⚠️ | ¿Implementado correctamente? |
| **Tiradas de Tarot** | ❌ | ✅ 1/día (1 o 3 cartas, sin IA) | ✅ 3/día (1,3,5,Cruz Celta, con IA) | ⚠️ | ¿Spreads y límites OK? |
| **Spreads Disponibles** | N/A | Solo 1 y 3 cartas | 1, 3, 5, Cruz Celta | ⚠️ | ¿Todos implementados? |
| **Categorías/Preguntas** | ❌ | ❌ | ✅ | ⚠️ | ¿Funciona con IA? |
| **Interpretación IA** | ❌ | ❌ | ✅ | ⚠️ | ¿Qué modelo? ¿Calidad? |
| **Historial** | ❌ | ✅ Limitado | ✅ Completo | ⚠️ | ¿Límite FREE? ¿Existe? |
| **Compartir Resultados** | ❌ | ✅ (sin IA) | ✅ (con IA) | ⚠️ | ¿Formato? ¿Existe? |
| **Modal al límite** | CTA Registro | CTA PREMIUM | Notificación | ⚠️ | ¿Textos correctos? |

### Funcionalidades Admin

| Feature / Funcionalidad | ADMIN | Estado | Validar |
|-------------------------|-------|--------|---------|
| **Panel Admin** | ✅ | ⚠️ | ¿Implementado? |
| **Configuración Global** | ✅ | ⚠️ | ¿Qué se configura? |
| **Analytics / Métricas** | ✅ | ⚠️ | ¿Implementado? |
| **Gestión de Contenido (CMS)** | ✅ | ⚠️ | ¿Necesario? |
| **Gestión de Usuarios** | ✅ | ⚠️ | ¿Puede modificar suscripciones? |

**Leyenda:**
- ✅ = Implementado y confirmado
- ❓ = No sé si existe / No sé los límites
- ⚠️ = Necesita validación
- ❌ = No aplica / No debería tener acceso

---

## Siguiente Paso: Sesión de Validación

### Preguntas Clave para Ti (Dueño del Producto)

Por cada User Story, pregúntate:

1. **¿Es esta la experiencia que imaginé?**
2. **¿Falta algo crítico para el negocio?**
3. **¿Hay features implementados que NO quiero?**
4. **¿Las limitaciones FREE/PREMIUM son correctas?**
5. **¿La propuesta de valor de PREMIUM es clara y justifica el precio?**

### Preguntas Críticas para Responder

#### Sobre Usuarios Anónimos
- [ ] ¿La "carta del día" para anónimos funciona correctamente?
- [ ] ¿El límite de 1/día se persiste sin login? (localStorage, cookies, IP)
- [ ] ¿El modal de conversión a FREE es efectivo?
- [ ] ¿Se bloquea correctamente el acceso a tiradas de tarot?

#### Sobre Usuarios FREE
- [x] ✅ Límite correcto: 1 carta del día + 1 tirada de tarot
- [x] ✅ Spreads correctos: Solo 1 y 3 cartas
- [x] ✅ Sin acceso a categorías/preguntas
- [ ] ¿El límite de 1 tirada/día funciona correctamente?
- [ ] ¿El historial limitado existe? ¿Cuál es el límite específico?
- [ ] ¿La opción de compartir funciona? ¿En qué formato?
- [ ] ¿El modal de upgrade a PREMIUM es convincente?

#### Sobre Usuarios PREMIUM
- [x] ✅ Límite correcto: 1 carta del día + 3 tiradas de tarot
- [x] ✅ Spreads exclusivos: 5 cartas y Cruz Celta
- [x] ✅ Feature exclusivo: Interpretaciones con IA
- [x] ✅ Feature exclusivo: Categorías y preguntas personalizadas
- [ ] ¿La integración de IA funciona correctamente?
- [ ] ¿Qué modelo de IA se usa? ¿Claude, OpenAI, otro?
- [ ] ¿La calidad de interpretaciones justifica el precio?
- [ ] ¿Cuál es el precio mensual exacto?
- [ ] ¿Hay trial period para probar PREMIUM?
- [ ] ¿El historial completo funciona? ¿Con filtros/búsqueda?

#### Sobre Admin
- [ ] ¿Qué necesitas monitorear del negocio?
- [ ] ¿Qué configuraciones necesitas cambiar sin deploy?
- [ ] ¿Necesitas gestionar contenido (cartas, interpretaciones)?
- [ ] ¿Qué herramientas de soporte necesitas?

---

## Método de Trabajo Sugerido

### Paso 1: Completa la Tabla Resumen (30 minutos)
Marca con ✅ o ❌ lo que está implementado y cómo funciona actualmente.

### Paso 2: Responde las Preguntas Críticas (1 hora)
Documenta cómo DEBERÍA funcionar según tu visión del negocio.

### Paso 3: Identifica Gaps (conmigo - próxima sesión)
Comparamos "lo que hay" vs "lo que quieres" y priorizamos.

### Paso 4: Plan de Acción
Convertimos los gaps en tasks técnicos:
```
TASK-X.1: Ajustar límites de usuarios FREE según negocio
TASK-X.2: Implementar feature exclusivo para PREMIUM
TASK-X.3: Crear panel básico de admin
```

---

## Gaps Identificados (para completar después de revisión)

### Formato de Gap
```markdown
- [ ] **GAP-X**: [Título corto]
  - **Descripción**: [Qué falta o qué está mal]
  - **Impacto Negocio**: 🔴 Alto / 🟡 Medio / 🟢 Bajo
  - **Esfuerzo Técnico**: 🔴 Alto / 🟡 Medio / 🟢 Bajo
  - **Prioridad**: P0 (Crítico) / P1 (Importante) / P2 (Mejora)
  - **Acción**: Refactor / Nueva feature / Documentar decisión
```

### Lista de Gaps (completar después de validación)

#### HALLAZGOS DE VALIDACIÓN TÉCNICA (2026-01-07)

**Resumen Ejecutivo:**
Se realizó validación técnica del código vs modelo de negocio. La implementación está **mayormente alineada** con la visión del producto.

---

### ✅ IMPLEMENTADO CORRECTAMENTE

#### 1. Integración de IA (Groq)
- **Estado**: ✅ Implementado y funcionando
- **Provider**: Groq (gratuito para testing)
- **Fallback**: DeepSeek → OpenAI (si Groq falla)
- **Ubicación**: [ai-provider.service.ts](../../backend/tarot-app/src/modules/ai/application/services/ai-provider.service.ts:29-54)
- **Arquitectura**: Circuit breaker + retry logic + automatic fallback
- **Validación**: Confirmado por el dueño del producto que funciona bien

#### 2. Spreads Implementados
- **Estado**: ✅ Todos los spreads existen
- **Spreads disponibles**:
  - 1 carta (requiredPlan: ANONYMOUS)
  - 3 cartas (requiredPlan: ANONYMOUS)
  - 5 cartas (requiredPlan: PREMIUM)
  - Cruz Celta/10 cartas (requiredPlan: PREMIUM)
- **Ubicación**: [tarot-spreads.data.ts](../../backend/tarot-app/src/database/seeds/data/tarot-spreads.data.ts:30-146)
- **Validación**: Confirmado en código que los límites por plan están correctos

#### 3. Límites por Plan
- **Estado**: ✅ Implementados correctamente
- **Carta del Día**:
  - ANÓNIMO: 1/día (línea 109-116 en DailyCardExperience.tsx)
  - FREE: 1/día (línea 121-127 en DailyCardExperience.tsx)
  - PREMIUM: Puede regenerar (línea 211-228 en DailyCardExperience.tsx)
- **Tiradas de Tarot**:
  - Backend filtra spreads según plan (SpreadSelector.tsx:161-167)
  - Límite diario validado en SpreadSelector (línea 176-184)
- **Ubicación**: [DailyCardExperience.tsx](../../frontend/src/components/features/daily-reading/DailyCardExperience.tsx)

#### 4. Modales de Conversión
- **Estado**: ✅ Implementados
- **AnonymousLimitReached**: Modal para usuarios anónimos (DailyCardExperience.tsx:232-236)
- **DailyCardLimitReached**: Modal para usuarios FREE (DailyCardExperience.tsx:240-246)
- **LimitReachedModal**: Modal genérico con CTA a PREMIUM (LimitReachedModal.tsx)
- **Mensaje diferenciado**: Anónimo → "Regístrate" | FREE → "Upgrade a PREMIUM"

#### 5. Historial de Lecturas
- **Estado**: ✅ Implementado con filtros
- **Features**:
  - Paginación (10 lecturas por página)
  - Búsqueda por pregunta
  - Filtros: Más recientes, Más antiguas, Esta semana, Este mes
  - Eliminar lectura
- **Ubicación**: [ReadingsHistory.tsx](../../frontend/src/components/features/readings/ReadingsHistory.tsx)
- **Nota**: NO vi diferenciación explícita de límite FREE vs PREMIUM en el código del historial
  - ⚠️ **Requiere validación**: ¿El historial tiene límite diferente para FREE vs PREMIUM?

#### 6. Compartir Resultados
- **Estado**: ✅ Implementado
- **Funcionalidad**: Copia interpretación al portapapeles
- **Formato**: Texto formateado con emoji + nombre de carta + interpretación + branding
- **Ubicación**: DailyCardExperience.tsx:186-198 (handleShare)
- **Ejemplo**: `🌟 Mi Carta del Día: El Loco\n\n[interpretación]\n\n✨ Descubre tu carta en Auguria`

---

### ⚠️ GAPS Y VALIDACIONES PENDIENTES

#### GAP-1: Límite de Historial FREE vs PREMIUM no evidente
- **Descripción**: El código de ReadingsHistory no muestra lógica explícita de límite diferente por plan
- **Estado actual**: Historial con paginación (10/página) para todos
- **Estado esperado**: FREE debería tener límite (ej: últimas 30 lecturas), PREMIUM ilimitado
- **Impacto Negocio**: 🟡 Medio (no es diferenciador claro de PREMIUM)
- **Esfuerzo Técnico**: 🟢 Bajo (agregar filtro en backend por plan)
- **Prioridad**: P1 (Importante)
- **Acción**: Validar si el backend ya limita, o agregar restricción
- **Validación necesaria**: Revisar backend endpoint `/readings` si filtra por plan

#### GAP-2: Límite de Tiradas de Tarot no encontrado explícito
- **Descripción**: No encontré hook o lógica explícita de límite 1 tirada/día (FREE) vs 3 tiradas/día (PREMIUM)
- **Estado actual**: SpreadSelector verifica `dailyReadingsCount` vs `dailyReadingsLimit` (línea 181)
- **Estado esperado**: Límite claro: FREE=1, PREMIUM=3
- **Impacto Negocio**: 🔴 Alto (afecta monetización)
- **Esfuerzo Técnico**: 🟢 Bajo (si ya existe en backend, solo falta frontend)
- **Prioridad**: P0 (Crítico)
- **Acción**: VALIDAR con el dueño del producto
- **Pregunta**: ¿Los límites 1 tirada (FREE) y 3 tiradas (PREMIUM) están funcionando actualmente?

#### GAP-3: Precio de PREMIUM es placeholder
- **Descripción**: Precio actual es $9.99 (placeholder), no está definido final
- **Estado actual**: Placeholder
- **Estado esperado**: Precio definitivo basado en análisis de mercado
- **Impacto Negocio**: 🔴 Alto (afecta conversión y revenue)
- **Esfuerzo Técnico**: 🟢 Bajo (cambiar constante)
- **Prioridad**: P0 (Crítico para lanzamiento)
- **Acción**: Definir precio final antes de lanzamiento público

#### GAP-4: Pasarela de Pago (Mercado Pago) no implementada
- **Descripción**: La conversión FREE → PREMIUM NO funciona porque falta Mercado Pago
- **Estado actual**: No implementado
- **Estado esperado**: Integración completa de Mercado Pago
- **Impacto Negocio**: 🔴 Alto (CERO revenue sin esto)
- **Esfuerzo Técnico**: 🔴 Alto (integración completa de pasarela)
- **Prioridad**: P0 (Crítico - bloqueante para monetización)
- **Acción**: Implementar Mercado Pago como próxima prioridad
- **Componentes afectados**: UpgradeModal, SubscriptionProvider, backend

#### GAP-5: Límite hardcoded en config
- **Descripción**: `DEFAULT_FREE_DAILY_LIMIT: 3` está hardcoded en config.ts
- **Estado actual**: Hardcoded (config.ts:27)
- **Estado esperado**: Configurable desde admin sin deploy
- **Impacto Negocio**: 🟡 Medio (dificulta experimentación con límites)
- **Esfuerzo Técnico**: 🟡 Medio (mover a DB + admin UI)
- **Prioridad**: P2 (Mejora futura)
- **Acción**: Considerar para admin panel v2

#### GAP-6: Mazo NO está mezclado aleatoriamente
- **Descripción**: Las 78 cartas se muestran siempre en el mismo orden visual durante la selección
- **Estado actual**: Mazo estático (ReadingExperience.tsx:516 - Array simple sin shuffle)
- **Estado esperado**: Mazo mezclado aleatoriamente cada vez para que la selección sea verdaderamente aleatoria
- **Impacto Negocio**: 🟡 Medio (afecta percepción de autenticidad de la lectura)
- **Esfuerzo Técnico**: 🟢 Bajo (algoritmo Fisher-Yates shuffle en frontend)
- **Prioridad**: P1 (Importante - mejora experiencia)
- **Acción**: Implementar shuffle del mazo cada vez que se carga la selección
- **Ubicación afectada**: [ReadingExperience.tsx:516](../../frontend/src/components/features/readings/ReadingExperience.tsx#L516)
- **Nota técnica actual**:
  - Las cartas se muestran como `Array.from({ length: 78 })` (siempre 0-77 en orden)
  - Solo la orientación (invertida/normal) es aleatoria (30% chance)
  - El usuario selecciona manualmente qué cartas quiere
  - **Problema**: Si el usuario sabe que la carta 5 es "El Hierofante", puede seleccionarla intencionalmente
- **Solución propuesta**:
  ```typescript
  // Crear mazo mezclado al montar componente
  const shuffledDeck = useMemo(() => {
    const deck = Array.from({ length: DECK_SIZE }, (_, i) => i);
    return shuffleArray(deck); // Fisher-Yates shuffle
  }, [spreadId]); // Re-shuffle cuando cambia spread
  ```

---

### ✅ CONFIRMACIONES DEL DUEÑO DEL PRODUCTO

1. ✅ **IA funciona con Groq**: Confirmado que funciona bien para testing
2. ✅ **Límites funcionan**: ANÓNIMO (1 carta día), FREE (1 carta día + 1 tirada), PREMIUM (1 carta día + 3 tiradas)
3. ✅ **Spreads existen**: 1, 3, 5, Cruz Celta (todos implementados)
4. ✅ **Historial existe**: FREE tiene historial limitado, PREMIUM completo
5. ⚠️ **Precio PREMIUM**: $9.99 es placeholder (aún no definido)
6. ❌ **Mercado Pago**: NO implementado, conversión FREE → PREMIUM no funciona

---

### PRÓXIMOS PASOS RECOMENDADOS

#### P0 - Crítico (Bloqueantes para Lanzamiento)
1. **Implementar Mercado Pago** (sin esto, CERO revenue)
2. **Definir precio PREMIUM** (antes de mostrar público)
3. **Validar límites de tiradas** (confirmar que 1 FREE / 3 PREMIUM funciona)

#### P1 - Importante (Post-Lanzamiento Temprano)
4. **Implementar shuffle de mazo** (autenticidad de selección aleatoria)
5. **Implementar límite de historial FREE** (diferenciador PREMIUM)
6. **Agregar analytics de conversión** (monitorear FREE → PREMIUM)

#### P2 - Mejoras Futuras
6. **Panel admin para configurar límites** (sin deploy)
7. **Mejorar copy de modales de conversión** (A/B testing)

---

### CONCLUSIÓN DE VALIDACIÓN

**Estado General**: 🟢 **BUENO - Implementación sólida**

**Fortalezas**:
- Arquitectura de IA robusta con fallbacks
- Límites por plan bien estructurados
- Spreads correctamente implementados
- UX de conversión (modales) implementada

**Debilidades Críticas**:
- Sin pasarela de pago = Sin revenue
- Precio no definido
- Límites de tiradas requieren validación

**Recomendación**: El producto está técnicamente **listo para MVP** excepto por Mercado Pago. Priorizar esa integración para habilitar monetización.

---

## Notas Adicionales

- Este documento es un **snapshot en el tiempo** (fecha: 2026-01-07)
- Actualizar cada vez que se agreguen features mayores
- Las validaciones van más allá de "funciona técnicamente" → "sirve al negocio"
- **Regla de oro**: Si no está en este documento, no debería estar en el código (y viceversa)

---

## 🧪 VALIDACIONES MANUALES EN PROGRESO

> **Inicio:** 2026-01-07
> **Metodología:** Validación uno por uno de los criterios de aceptación de cada User Story
> **Responsable:** Dueño del producto

---

### ✅ VALIDACIÓN 1: Usuario Anónimo - Carta del Día (US-1.1)

**Fecha:** 2026-01-07
**Ambiente:** localhost:3001
**Usuario:** Anónimo (sin autenticación)

#### 🎯 Criterios Validados

| # | Criterio | Estado | Notas |
|---|----------|--------|-------|
| 1 | Acceso a carta del día sin registro | ✅ PASS | Puede acceder a `/carta-del-dia` |
| 2 | Límite de 1 carta por día | ✅ PASS | Backend responde 403/409 correctamente |
| 3 | Modal de límite alcanzado aparece | ⚠️ PASS con GAP | Modal aparece pero DESPUÉS del click (UX issue) |
| 4 | Copy del modal es claro | ✅ PASS | "Ya viste tu carta del día" + CTA a registro |
| 5 | Persistencia del límite sin auth | ✅ PASS | sessionStorage + fingerprint |

#### 🔍 Hallazgos Técnicos

**Mecanismo de Persistencia:**
```
sessionStorage:
  - tarot_daily_card_consumed: "2026-01-07T14:10:39.780Z"
  - daily-card-fingerprint: "51f88cbf7f6497f246ce5cc07f982c5c338b76584ee52be2d13e02524b2376e9"

localStorage:
  - auth-storage: {"state":{"user":null,"isAuthenticated":false},"version":0}
```

**Flujo Actual:**
1. Usuario carga `/carta-del-dia`
2. Se renderiza carta boca abajo (clickeable)
3. Usuario hace click en la carta
4. POST a `/api/daily-readings` con fingerprint
5. Backend responde 403/409 (límite alcanzado)
6. Se muestra modal `AnonymousLimitReached`

**Problema UX (GAP-006):**
- ❌ El usuario puede **interactuar con la carta** antes de ver el modal
- ❌ Genera expectativa de poder revelarla
- ✅ Debería mostrar modal **inmediatamente** al detectar límite

**Solución Propuesta:**
- Verificar `sessionStorage.getItem('tarot_daily_card_consumed')` al cargar componente
- Si existe Y es del día actual → Mostrar modal inmediatamente
- Si no existe O es de otro día → Mostrar carta boca abajo
- Usar misma lógica que `TryWithoutRegisterSection.checkDailyCardConsumed()` ([TryWithoutRegisterSection.tsx:17-33](../../src/components/features/home/TryWithoutRegisterSection.tsx#L17-L33))

#### 📝 Acciones Tomadas

- [x] Documentado GAP-006 en `GAPS_BACKLOG_FRONTEND.md`
- [x] Creado Epic GAP-5 (Mejoras de UX en Límites)
- [x] Estimación: 2 horas
- [x] Prioridad: P1 - IMPORTANTE (UX)
- [ ] Pendiente implementación

#### ✅ Resultado Final

**Estado:** ✅ **FUNCIONALIDAD VALIDADA** (con mejora UX pendiente)

El límite de 1 carta/día para usuarios anónimos funciona correctamente desde el punto de vista técnico. El backend valida correctamente, la persistencia funciona, y el modal aparece. Sin embargo, existe una mejora UX necesaria (GAP-006) para mostrar el modal inmediatamente sin permitir interacción con la carta.

---

### ⏳ VALIDACIÓN 2: Usuario FREE - Límite de Tiradas (US-1.3)

**Fecha:** Pendiente
**Ambiente:** localhost:3001
**Usuario:** FREE (autenticado)

#### 🎯 Criterios a Validar

- [ ] Usuario FREE puede hacer 1 tirada de tarot por día (1 o 3 cartas)
- [ ] No puede acceder a spreads PREMIUM (5 cartas, Cruz Celta)
- [ ] Modal de conversión aparece al alcanzar límite
- [ ] Modal sugiere upgrade a PREMIUM
- [ ] Límite se resetea a medianoche
- [ ] Contador de tiradas disponibles es visible

---

### ⏳ VALIDACIÓN 3: Usuario PREMIUM - Límite de Tiradas (US-1.4)

**Fecha:** Pendiente
**Ambiente:** localhost:3001
**Usuario:** PREMIUM (autenticado)

#### 🎯 Criterios a Validar

- [ ] Usuario PREMIUM puede hacer 3 tiradas de tarot por día
- [ ] Puede acceder a todos los spreads (1, 3, 5, Cruz Celta)
- [ ] Cada tirada incluye interpretación IA
- [ ] Contador muestra tiradas restantes (ej: "2 de 3 disponibles")
- [ ] Límite se resetea a medianoche
- [ ] Modal aparece al alcanzar 3 tiradas

---

### ⏳ VALIDACIÓN 4: Historial FREE vs PREMIUM (US-1.6 / US-1.7)

**Fecha:** Pendiente
**Ambiente:** localhost:3001

#### 🎯 Criterios a Validar

- [ ] Usuario FREE tiene límite de historial visible
- [ ] Usuario PREMIUM ve historial completo (sin límite)
- [ ] Diferencia visual entre ambos planes
- [ ] Funcionalidad de filtros/búsqueda
- [ ] Puede abrir lecturas pasadas
- [ ] Puede compartir desde historial

---

### ⏳ VALIDACIÓN 5: Funcionalidad de Compartir (US-1.8)

**Fecha:** Pendiente

#### 🎯 Criterios a Validar

- [ ] Botón de compartir está visible
- [ ] Formato de texto es claro y atractivo
- [ ] Incluye branding de Auguria
- [ ] FREE comparte sin interpretación IA
- [ ] PREMIUM comparte con interpretación IA
- [ ] Copia al portapapeles funciona
- [ ] No expone información privada

---

### ⏳ VALIDACIÓN 6: Flujo de Conversión FREE → PREMIUM (US-2.3)

**Fecha:** Pendiente
**Bloqueador:** Mercado Pago no implementado (GAP-003, GAP-004)

#### 🎯 Criterios a Validar

- [ ] Modal de upgrade aparece en momentos clave
- [ ] Precio está claramente visible
- [ ] Beneficios de PREMIUM están listados
- [ ] Flujo de pago funciona (Mercado Pago)
- [ ] Usuario se convierte a PREMIUM exitosamente
- [ ] Acceso a features PREMIUM es inmediato

**Nota:** Esta validación está bloqueada hasta implementar Mercado Pago (tareas GAP-003 y GAP-004).

---

### 📊 Resumen de Validaciones

| Validación | Estado | Resultado | GAPs Encontrados |
|------------|--------|-----------|------------------|
| US-1.1: Anónimo - Carta del Día | ✅ Completada | PASS con mejora | GAP-006 |
| US-1.3: FREE - Tiradas | ⏳ Pendiente | - | - |
| US-1.4: PREMIUM - Tiradas | ⏳ Pendiente | - | - |
| US-1.6/1.7: Historial | ⏳ Pendiente | - | - |
| US-1.8: Compartir | ⏳ Pendiente | - | - |
| US-2.3: Conversión a PREMIUM | 🚫 Bloqueada | - | GAP-003, GAP-004 |

**Total validadas:** 1 / 6
**GAPs encontrados:** 1 (GAP-006)
**Bloqueadores:** 1 (Mercado Pago)
