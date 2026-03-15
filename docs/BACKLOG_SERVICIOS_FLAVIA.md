# MÓDULO: SERVICIOS HOLÍSTICOS DE FLAVIA - BACKLOG DE DESARROLLO

## PARTE A: HISTORIAS DE USUARIO

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Módulo:** Servicios Holísticos de Flavia
**Versión:** 1.0
**Fecha:** 10 de marzo de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## CONTEXTO

Auguria es un marketplace de tarotistas. En el MVP actual, Flavia es la única tarotista activa. Se necesita una nueva sección pública donde los usuarios puedan ver y contratar los servicios presenciales/holísticos de Flavia:

1. **Trabajo con el Árbol Genealógico** — Sanación de linaje familiar
2. **Péndulo Hebreo** — Sanación energética con letras hebreas
3. **Limpiezas Energéticas** — Limpieza de espacios, armonizaciones, apertura de caminos

**Características clave:**

- Las sesiones son vía **WhatsApp** (sin cámara, no Google Meet)
- Cada servicio tiene un **precio configurable en ARS** desde admin
- Pago por **Mercado Pago** (link externo configurable; integración real será el próximo módulo)
- Se reutiliza el **sistema de calendario/scheduling existente** para reservar turnos
- **Flujo**: Ver catálogo → Pagar → Reservar turno → Recibir datos de WhatsApp
- Los datos de contacto (WhatsApp) y la reserva de turno se habilitan **solo después del pago aprobado**
- Aprobación de pago **manual por admin** (temporal hasta integración Mercado Pago con webhooks/IPN)
- Email de confirmación post-pago usando EmailService existente (con templates placeholder)

---

## DECISIONES DE ARQUITECTURA

| Decisión                            | Elección                                                           | Razón                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Nuevo módulo vs extender scheduling | **Nuevo módulo `holistic-services`** + integración con scheduling  | El catálogo es un dominio diferente a la agenda                                             |
| Estructura del módulo backend       | **Arquitectura layered** (domain/application/infrastructure)       | Tiene lógica de negocio real                                                                |
| Almacenamiento de precios           | **Campo `price_ars` en entity `HolisticService`**                  | Admin-configurable, no hardcoded                                                            |
| Nuevo enum FAMILY_TREE              | **Agregar a SessionType**                                          | El Árbol Genealógico no existe como tipo de sesión                                          |
| WhatsApp vs Google Meet             | **Campo `whatsapp_number` en sessions** + campo en HolisticService | Sesiones por WhatsApp, no video                                                             |
| Moneda                              | **ARS** (pesos argentinos)                                         | Mercado Pago en Argentina                                                                   |
| Visibilidad                         | **Pública para todos**                                             | Visitantes ven catálogo y precios; login solo para pagar/reservar                           |
| Flujo de pago                       | **Pago primero → Reserva después**                                 | WhatsApp y booking solo se habilitan post-pago aprobado                                     |
| Calendario pre-pago                 | **Solo lectura**                                                   | Usuario puede ver disponibilidad pero NO reservar hasta pagar                               |
| Mercado Pago                        | **Aprobación manual (temporal)**                                   | La integración real de MP será el próximo módulo; por ahora admin aprueba pagos manualmente |
| Próximo módulo                      | **Integración Mercado Pago**                                       | Webhooks (IPN) reemplazarán la aprobación manual sin cambios de arquitectura                |
| Email post-pago                     | **Template con placeholders**                                      | Se usa EmailService existente; aún sin dominio de mail comprado                             |
| Flavia tarotistaId                  | **Verificar en DB** (probablemente id=1)                           | Confirmar antes de seed; hacer configurable como fallback                                   |
| Orden de implementación             | **Backend completo → Frontend**                                    | PRs más limpios y ordenados                                                                 |

---

## ÍNDICE DE HISTORIAS DE USUARIO

| ID      | Historia                               | Prioridad | Requiere Auth         |
| ------- | -------------------------------------- | --------- | --------------------- |
| HUS-001 | Ver catálogo de servicios holísticos   | Must      | No                    |
| HUS-002 | Ver detalle de un servicio             | Must      | No                    |
| HUS-003 | Pagar un servicio                      | Must      | Sí                    |
| HUS-004 | Reservar turno tras pago aprobado      | Must      | Sí (+ pago)           |
| HUS-005 | Ver confirmación con datos de contacto | Must      | Sí (+ pago + reserva) |
| HUS-006 | Email de confirmación post-pago        | Should    | Sí                    |
| HUS-007 | Administrar servicios holísticos       | Must      | Admin                 |
| HUS-008 | Gestionar disponibilidad desde admin   | Should    | Admin                 |

---

## DETALLE DE HISTORIAS DE USUARIO

### HUS-001: Ver Catálogo de Servicios Holísticos

**Como** visitante/usuario de Auguria
**Quiero** ver los servicios holísticos disponibles
**Para** conocer qué ofrece Flavia, sus precios y decidir si contrato alguno

#### Criterios de Aceptación:

1. **Dado** que estoy en la página `/servicios`
   **Cuando** la página carga
   **Entonces** veo los 3 servicios holísticos activos como cards

2. **Dado** que veo la lista de servicios
   **Cuando** observo cada card
   **Entonces** veo: nombre del servicio, descripción corta, precio en ARS, duración estimada y botón "Ver más"

3. **Dado** que estoy en cualquier dispositivo
   **Cuando** veo el catálogo
   **Entonces** la grilla es responsive: 1 columna en mobile, 3 columnas en desktop

4. **Dado** que estoy en cualquier página de la aplicación
   **Cuando** miro el Header de navegación
   **Entonces** veo un link "Servicios" que lleva a `/servicios` (visible para todos, sin requerir autenticación)

5. **Dado** que no estoy autenticado
   **Cuando** accedo a `/servicios`
   **Entonces** puedo ver el catálogo completo con precios sin necesidad de login

#### Notas Técnicas:

- Endpoint público `GET /holistic-services` retorna servicios activos ordenados por `display_order`
- Componentes: `ServiciosPage` (contenedor) + `ServiceCard` (card individual)
- Link en Header visible para todos (no dentro del bloque `{user && ...}`)
- Reutilizar componentes UI existentes: `Card`, `Button`, `cn()`

#### Estimación: 5 puntos

---

### HUS-002: Ver Detalle de un Servicio

**Como** visitante/usuario
**Quiero** ver la información completa de un servicio holístico
**Para** entender en profundidad de qué se trata y decidir si lo contrato

#### Criterios de Aceptación:

1. **Dado** que hice clic en "Ver más" de un servicio
   **Cuando** llego a la página `/servicios/[slug]`
   **Entonces** veo: nombre completo (h1), descripción larga formateada, precio en ARS, duración y modalidad (WhatsApp)

2. **Dado** que estoy en el detalle de un servicio
   **Cuando** miro la sección de disponibilidad
   **Entonces** veo un calendario con los slots disponibles de Flavia en **modo solo lectura** (no puedo reservar)

3. **Dado** que veo el calendario en modo solo lectura
   **Cuando** observo debajo del calendario
   **Entonces** veo un disclaimer: _"Las fechas disponibles son al momento de la consulta. Una vez realizado el pago, la fecha que observaste libre podría ya estar ocupada."_

4. **Dado** que estoy en el detalle
   **Cuando** busco datos de contacto de Flavia
   **Entonces** NO veo el número de WhatsApp (se revela solo después del pago aprobado)

5. **Dado** que estoy en el detalle
   **Cuando** quiero contratar
   **Entonces** veo un botón "Contratar servicio" que lleva a la página de pago

#### Notas Técnicas:

- Endpoint público `GET /holistic-services/:slug` retorna detalle sin `whatsappNumber`
- Reutilizar `BookingCalendar` existente con prop `readOnly={true}` (nueva prop a agregar)
- Componente: `ServiceDetailPage`
- Hook: `useHolisticServiceDetail(slug)`

#### Estimación: 5 puntos

---

### HUS-003: Pagar un Servicio

**Como** usuario autenticado
**Quiero** pagar el servicio que elegí
**Para** poder luego reservar mi turno con Flavia

#### Criterios de Aceptación:

1. **Dado** que estoy en la página de pago `/servicios/[slug]/pago`
   **Cuando** no estoy autenticado
   **Entonces** se me redirige al login con retorno a esta página

2. **Dado** que estoy autenticado y en la página de pago
   **Cuando** veo el resumen
   **Entonces** veo: nombre del servicio, precio en ARS, duración, y botón "Pagar con Mercado Pago"

3. **Dado** que hago clic en "Pagar con Mercado Pago"
   **Cuando** el sistema procesa
   **Entonces** se crea un registro de compra (`service_purchase`) con estado PENDING y se abre el link de Mercado Pago en nueva pestaña

4. **Dado** que completé el pago en Mercado Pago
   **Cuando** vuelvo a la plataforma
   **Entonces** veo un mensaje: _"Tu pago está siendo verificado. Una vez confirmado, te habilitaremos la reserva de turno y recibirás un email con todos los datos."_

5. **Dado** que mi pago aún no fue aprobado
   **Cuando** accedo a "Mis Servicios"
   **Entonces** veo mi compra con estado "Pendiente de aprobación"

#### Notas Técnicas:

- Endpoint autenticado `POST /holistic-services/purchases` crea compra con status PENDING
- El link de Mercado Pago es un campo configurable en `HolisticService` (`mercado_pago_link`), NO una integración real
- La aprobación es manual por admin (temporal); será reemplazada por webhooks MP en el próximo módulo
- Tabla `service_purchases` con: userId, holisticServiceId, paymentStatus, amountArs, paymentReference
- Componente: `ServicePaymentPage`

#### Estimación: 5 puntos

---

### HUS-004: Reservar Turno tras Pago Aprobado

**Como** usuario con pago aprobado
**Quiero** elegir fecha y horario para mi servicio
**Para** agendar mi sesión con Flavia

#### Criterios de Aceptación:

1. **Dado** que mi pago fue aprobado
   **Cuando** accedo a la página de reserva `/servicios/reservar/[purchaseId]`
   **Entonces** veo el `BookingCalendar` en modo interactivo con los slots disponibles de Flavia

2. **Dado** que mi pago NO fue aprobado
   **Cuando** intento acceder a la página de reserva
   **Entonces** veo un mensaje: _"Tu pago aún está siendo verificado. Te notificaremos cuando puedas reservar tu turno."_

3. **Dado** que estoy reservando y elijo una fecha y horario
   **Cuando** confirmo la reserva
   **Entonces** se crea una sesión con el tipo de sesión del servicio, la duración preconfigurada, y el WhatsApp de Flavia

4. **Dado** que se creó la sesión
   **Cuando** veo la confirmación
   **Entonces** la sesión NO tiene Google Meet link; en su lugar tiene el número de WhatsApp de Flavia

5. **Dado** que intento reservar sin tener un pago aprobado
   **Cuando** el backend procesa la solicitud
   **Entonces** retorna error 403: "Se requiere pago aprobado para reservar"

6. **Dado** que la reserva fue exitosa
   **Cuando** se vincula a mi compra
   **Entonces** el campo `session_id` de mi `service_purchase` se actualiza con la sesión creada

#### Notas Técnicas:

- El `BookSessionUseCase` debe validar que exista una compra con `paymentStatus === PAID` para servicios holísticos
- Al crear sesión holística: poblar `whatsappNumber` desde el servicio, NO generar Google Meet link
- Reutilizar `BookingCalendar` con props pre-configurados: `tarotistaId`, `durationMinutes`, `sessionType` fijos
- Endpoint `POST /scheduling/book` ya existe; se modifica para soportar servicios holísticos
- Componente: `ServiceBookingPage`

#### Estimación: 8 puntos

---

### HUS-005: Ver Confirmación con Datos de Contacto

**Como** usuario con reserva confirmada
**Quiero** ver los datos de contacto de WhatsApp de Flavia
**Para** saber cómo conectarme el día de mi sesión

#### Criterios de Aceptación:

1. **Dado** que mi reserva fue confirmada
   **Cuando** veo la pantalla de confirmación
   **Entonces** veo: nombre del servicio, fecha, hora, duración y el número de WhatsApp de Flavia

2. **Dado** que veo el WhatsApp de Flavia
   **Cuando** hago clic en el número
   **Entonces** se abre WhatsApp directamente con un link `wa.me/[número]`

3. **Dado** que accedo al detalle de mi compra en "Mis Servicios"
   **Cuando** el pago está aprobado y la sesión reservada
   **Entonces** veo todos los datos de contacto y la información de la sesión

4. **Dado** que mi pago NO está aprobado
   **Cuando** consulto el detalle de mi compra
   **Entonces** NO veo el WhatsApp de Flavia (el campo no se incluye en la respuesta de API)

#### Notas Técnicas:

- `SessionResponseDto` agrega campo `whatsappNumber?: string`
- El backend SOLO incluye `whatsappNumber` en la respuesta cuando `paymentStatus === PAID`
- `PurchaseResponseDto` incluye `whatsappNumber` solo si `paymentStatus === PAID`
- Componente de confirmación reutilizable dentro de `ServiceBookingPage`

#### Estimación: 3 puntos

---

### HUS-006: Email de Confirmación Post-Pago

**Como** usuario que pagó un servicio
**Quiero** recibir un email con todos los datos de mi sesión
**Para** tener la información a mano y no depender solo de la web

#### Criterios de Aceptación:

1. **Dado** que un admin aprobó mi pago
   **Cuando** el sistema procesa la aprobación
   **Entonces** se envía un email a mi dirección registrada

2. **Dado** que recibo el email
   **Cuando** lo abro
   **Entonces** incluye: nombre del servicio, precio pagado, WhatsApp de Flavia, y un link para reservar turno

3. **Dado** que el servicio de email no tiene SMTP configurado
   **Cuando** se intenta enviar
   **Entonces** el email se loguea a consola (modo test con `jsonTransport`) sin fallar

4. **Dado** que el email usa un template
   **Cuando** se renderiza
   **Entonces** tiene placeholders para branding (logo, colores, dominio) que se completarán cuando se compre el dominio de mail

#### Notas Técnicas:

- Nuevo template Handlebars: `holistic-service-confirmation.hbs`
- Nuevo método: `EmailService.sendHolisticServiceConfirmation(to, data)`
- Nueva interface: `HolisticServiceConfirmationData` con: userName, serviceName, amountArs, whatsappNumber, bookingUrl
- El email se dispara desde `ApprovePaymentUseCase`
- En modo test (sin SMTP), `jsonTransport: true` loguea el email a consola

#### Estimación: 3 puntos

---

### HUS-007: Administrar Servicios Holísticos

**Como** administrador
**Quiero** editar precios, descripciones y datos de los servicios, y aprobar pagos pendientes
**Para** mantener el catálogo actualizado y gestionar las compras de usuarios

#### Criterios de Aceptación:

1. **Dado** que estoy en el panel admin
   **Cuando** navego al sidebar
   **Entonces** veo un item "Servicios" en la sección GESTIÓN que lleva a `/admin/servicios`

2. **Dado** que estoy en `/admin/servicios` tab "Servicios"
   **Cuando** veo la lista
   **Entonces** veo una tabla con: Nombre, Precio ARS, Duración, Tipo Sesión, Activo, y botón "Editar"

3. **Dado** que hago clic en "Editar" de un servicio
   **Cuando** se abre el modal de edición
   **Entonces** puedo modificar: nombre, descripciones (corta/larga), precio ARS, link Mercado Pago, WhatsApp, duración, estado activo

4. **Dado** que guardo los cambios
   **Cuando** la mutación es exitosa
   **Entonces** los cambios se reflejan inmediatamente en la página pública `/servicios`

5. **Dado** que estoy en `/admin/servicios` tab "Pagos Pendientes"
   **Cuando** veo la tabla
   **Entonces** veo: usuario, servicio, monto ARS, fecha de compra, y botón "Aprobar pago"

6. **Dado** que apruebo un pago
   **Cuando** la operación es exitosa
   **Entonces** el estado cambia a PAID, se envía email al usuario, y el pago desaparece de la lista de pendientes

#### Notas Técnicas:

- Endpoints admin protegidos con `JwtAuthGuard + RolesGuard + @Roles(ADMIN)`
- CRUD: `GET/POST/PATCH/DELETE /admin/holistic-services`
- Pagos: `GET /admin/holistic-services/payments` + `PATCH /admin/holistic-services/payments/:id/approve`
- Componentes: `HolisticServicesManagement` (con tabs), `EditHolisticServiceModal`, `PendingPaymentsTable`
- Modal usa React Hook Form + Zod validation

#### Estimación: 8 puntos

---

### HUS-008: Gestionar Disponibilidad desde Admin

**Como** administrador
**Quiero** gestionar la disponibilidad de Flavia para los servicios holísticos
**Para** que los usuarios vean horarios correctos al reservar

#### Criterios de Aceptación:

1. **Dado** que Flavia tiene disponibilidad configurada en el módulo scheduling
   **Cuando** un usuario ve el calendario en la página de servicios
   **Entonces** ve los mismos slots que el sistema de scheduling ya gestiona

2. **Dado** que un admin modifica la disponibilidad de Flavia
   **Cuando** los cambios se guardan
   **Entonces** aplican a todos sus servicios holísticos automáticamente

#### Notas Técnicas:

- **No requiere desarrollo nuevo** — se reutiliza completamente el módulo scheduling existente
- La disponibilidad de Flavia es la misma para tarot y servicios holísticos
- El `BookingCalendar` usa `useAvailableSlots(tarotistaId)` que ya existe

#### Estimación: 0 puntos (sin desarrollo)

---

## RESUMEN DE ESTIMACIÓN

| Historia  | Puntos        |
| --------- | ------------- |
| HUS-001   | 5             |
| HUS-002   | 5             |
| HUS-003   | 5             |
| HUS-004   | 8             |
| HUS-005   | 3             |
| HUS-006   | 3             |
| HUS-007   | 8             |
| HUS-008   | 0             |
| **TOTAL** | **37 puntos** |

---

## MATRIZ DE FUNCIONALIDADES POR ROL

| Funcionalidad                           | Visitante (sin auth) | Usuario autenticado | Usuario con pago aprobado | Admin |
| --------------------------------------- | -------------------- | ------------------- | ------------------------- | ----- |
| Ver catálogo de servicios               | ✅                   | ✅                  | ✅                        | ✅    |
| Ver detalle de servicio                 | ✅                   | ✅                  | ✅                        | ✅    |
| Ver calendario (solo lectura)           | ✅                   | ✅                  | ✅                        | ✅    |
| Iniciar pago (crear compra)             | ❌ (→ login)         | ✅                  | ✅                        | ✅    |
| Reservar turno (calendario interactivo) | ❌                   | ❌                  | ✅                        | ❌    |
| Ver WhatsApp de Flavia                  | ❌                   | ❌                  | ✅                        | ✅    |
| Recibir email de confirmación           | ❌                   | ❌                  | ✅                        | ❌    |
| Ver "Mis Servicios" (compras)           | ❌                   | ✅                  | ✅                        | ❌    |
| Editar servicios (CRUD)                 | ❌                   | ❌                  | ❌                        | ✅    |
| Aprobar pagos                           | ❌                   | ❌                  | ❌                        | ✅    |

---

## FLUJO DE USUARIO COMPLETO

```
Visitante/Usuario                        Admin
      │                                    │
      ▼                                    │
  /servicios (catálogo)                    │
      │                                    │
      ▼                                    │
  /servicios/[slug] (detalle)              │
  - Calendario READ-ONLY                   │
  - Disclaimer fechas                      │
  - Botón "Contratar"                      │
      │                                    │
      ▼                                    │
  /servicios/[slug]/pago                   │
  - Requiere login                         │
  - Crea purchase PENDING                  │
  - Abre link MP en nueva pestaña          │
      │                                    │
      │  ← Usuario paga en MP →            │
      │                                    │
      ▼                                    ▼
  /mis-servicios                   /admin/servicios
  - Ve compra "Pendiente"         - Tab "Pagos Pendientes"
  - Espera aprobación             - Botón "Aprobar pago"
      │                                    │
      │  ← Admin aprueba pago →            │
      │  ← Se envía email →                │
      │                                    │
      ▼                                    │
  /servicios/reservar/[purchaseId]         │
  - Calendario INTERACTIVO                 │
  - Elige fecha y hora                     │
  - Confirma reserva                       │
      │                                    │
      ▼                                    │
  Confirmación                             │
  - WhatsApp de Flavia (wa.me/...)         │
  - Datos de la sesión                     │
  - Link a "Mis Servicios"                 │
```

---

## SERVICIOS — CONTENIDO PARA SEED

### 1. Trabajo con el Árbol Genealógico

**Slug**: `arbol-genealogico`
**Tipo de sesión**: `FAMILY_TREE`
**Duración**: 60 minutos

**Descripción corta:**
¿Qué heredamos del árbol familiar? (y qué hacer con ello)

**Descripción larga:**
¿Qué hereda tu alma de tu árbol familiar? Nuestra alma hereda más de lo que imaginamos, además de rasgos, color de piel, enfermedades también emociones, lealtades y destinos no vividos.

Cada uno de nosotros somos la continuación de nuestro árbol, y por ello viven las historias no resultas de quienes vinieron antes. Sanar no es romper con la familia, es liberar tu línea y tu propósito.

Atrás de cada síntoma, miedo o bloqueo, puede haber un antepasado no reconocido, una historia de dolor, exilio, silencio o pérdida que tu alma intenta integrar.

Al mirar tu árbol con amor y conciencia, dejás de cargar su peso: comenzás a recibir su fuerza. Ahí nace el verdadero poder del linaje.

**Te ayudo a:**

- Identificar lealtades invisibles y cargas heredadas.
- Detectar repeticiones, secretos y dinámicas ocultas.
- Entre muchas otras para poder integrar una nueva mirada y empezar un verdadero camino de sanación.

---

### 2. Péndulo Hebreo

**Slug**: `pendulo-hebreo`
**Tipo de sesión**: `HEBREW_PENDULUM`
**Duración**: 60 minutos

**Descripción corta:**
Sanación y transformación energética con letras hebreas

**Descripción larga:**
Tiene por objeto tratar, sanar y transformar la energía, en todos los niveles y manifestaciones, llevando armonía y sanación allí donde son necesarias.

No se sabe a ciencia cierta el origen del Péndulo Hebreo. Fuentes indican que fue transmitido en Europa por los soldados templarios, quienes incorporaron este conocimiento de los más destacados kabalistas hebreos mientras cohabitaron en los tiempos de las Cruzadas.

Las letras hebreas son lo más importante de este método. El idioma hebreo es extremadamente potente. En la Torá está escrito que hasta el famoso incidente de la Torre de Babel, toda la humanidad hablaba el mismo idioma: el hebreo bíblico, el lenguaje de la creación. En el libro del Génesis, que narra la forma en que Dios creó el mundo: Dios dijo: "Sea la luz, y fue la Luz". Estas palabras contenían la Energía Divina que creó la luz. Todo lo que existe fue creado por la energía contenida en esas palabras hebreas.

---

### 3. Limpiezas Energéticas

**Slug**: `limpiezas-energeticas`
**Tipo de sesión**: `ENERGY_CLEANING`
**Duración**: 60 minutos

**Descripción corta:**
Armonización de espacios, personas y caminos

**Descripción larga:**
De espacios físicos tanto laborales como del hogar, armonizaciones energéticas de personas, de espacios, canalizaciones de energías estancadas, aperturas de caminos, limpiezas de negocios y emprendimientos.

---

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** `T-SF-B0X` = Backend, `T-SF-F0X` = Frontend
> **Siguiente TASK global disponible:** TASK-083 (si se necesita vincular al project_backlog.md)

### Índice de Tareas Técnicas

| ID       | Tarea                                                          | Tipo     | Prioridad  | Estimación |
| -------- | -------------------------------------------------------------- | -------- | ---------- | ---------- |
| T-SF-B01 | Capa de dominio: Enums, Entidades, Migración y Repositorios    | Backend  | ✅ Completada | 3 días     |
| T-SF-B02 | Capa de aplicación: DTOs, Use Cases y Orchestrator             | Backend  | ✅ Completada | 3 días     |
| T-SF-B03 | Capa de infraestructura: Controllers, Módulo y Endpoints REST  | Backend  | ✅ Completada | 3 días     |
| T-SF-B04 | Email de confirmación, Seed Data y Tests E2E                   | Backend  | ✅ Completada | 2 días     |
| T-SF-F01 | Foundation: Types, API functions, Hooks y Rutas                | Frontend | ✅ Completada | 2 días     |
| T-SF-F02 | Páginas públicas: Catálogo y Detalle de Servicio               | Frontend | ✅ Completada | 3 días     |
| T-SF-F03 | Flujo autenticado: Pago, Reserva, Confirmación y Mis Servicios | Frontend | ✅ Completada | 3 días     |
| T-SF-F04 | Panel Admin: Gestión de Servicios y Aprobación de Pagos        | Frontend | ✅ Completada | 3 días     |

**Estimación total:** ~22 días de desarrollo (incluye TDD + ciclos de calidad)

---

## TAREAS DE BACKEND

---

### T-SF-B01: Capa de Dominio — Enums, Entidades, Migración y Repositorios

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 días
**Dependencias:** Ninguna (es la base de todo el módulo)
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-001, HUS-002, HUS-003, HUS-004, HUS-007 (parcial — capa de datos)

#### 📋 Descripción

Crear toda la capa de dominio y persistencia del módulo `holistic-services`. Incluye los enums necesarios, las dos entidades principales (`HolisticService` y `ServicePurchase`), la migración de base de datos, y los repositorios (interfaces + implementaciones TypeORM). Esta tarea establece los cimientos sobre los que se construye toda la funcionalidad.

#### ✅ Tareas específicas

**Enums:**

- [x] Agregar valor `FAMILY_TREE = 'family_tree'` al enum `SessionType` existente en `scheduling/domain/enums/session-type.enum.ts`
- [x] Crear enum `PurchaseStatus` con valores: `PENDING`, `PAID`, `CANCELLED`, `REFUNDED`

**Entidad HolisticService:**

- [x] Crear entidad con campos: `id`, `name`, `slug` (unique), `shortDescription`, `longDescription`, `priceArs` (decimal), `durationMinutes`, `sessionType` (SessionType enum), `whatsappNumber`, `mercadoPagoLink`, `imageUrl` (nullable), `displayOrder`, `isActive`, `createdAt`, `updatedAt`
- [x] Índices en `slug` (unique) y `displayOrder`
- [x] Relación OneToMany con `ServicePurchase`

**Entidad ServicePurchase:**

- [x] Crear entidad con campos: `id`, `userId` (FK User), `holisticServiceId` (FK HolisticService), `sessionId` (FK Session, nullable — se asigna post-reserva), `paymentStatus` (PurchaseStatus enum), `amountArs` (decimal), `paymentReference` (nullable — para referencia de Mercado Pago), `paidAt` (nullable), `approvedByAdminId` (nullable), `createdAt`, `updatedAt`
- [x] Índices compuestos en `(userId, paymentStatus)` y `(holisticServiceId, paymentStatus)`
- [x] Relaciones ManyToOne con User, HolisticService y Session

**Migración:**

- [x] Crear migración que genere las tablas `holistic_services` y `service_purchases`
- [x] Agregar valor `family_tree` al tipo enum `session_type` en PostgreSQL (ALTER TYPE)
- [x] Agregar valor `cancelled` al tipo enum `payment_status` si no existe
- [x] Foreign keys con ON DELETE apropiado (CASCADE para user, RESTRICT para servicio)

**Repositorios:**

- [x] Crear interfaces `IHolisticServiceRepository` e `IServicePurchaseRepository` con los métodos necesarios (findAll, findBySlug, findById, save, findByUserId, findPendingPayments, etc.)
- [x] Crear tokens de inyección para DI de NestJS
- [x] Crear implementaciones TypeORM de ambos repositorios
- [x] Tests unitarios de repositorios con mocks de TypeORM

#### 🎯 Criterios de aceptación

- El enum `SessionType` incluye `FAMILY_TREE` y no rompe funcionalidad existente del módulo scheduling
- Ambas entidades se crean correctamente con la migración
- La migración es reversible (down method implementado)
- Los repositorios implementan las interfaces y tienen tests unitarios
- `npm run build` compila sin errores
- Coverage ≥ 80% en los archivos nuevos
- `validate-architecture.js` pasa sin errores

---

### T-SF-B02: Capa de Aplicación — DTOs, Use Cases y Orchestrator

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 días
**Dependencias:** T-SF-B01
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

**DTOs de Servicios:**

- [x] `HolisticServiceResponseDto` — respuesta pública del servicio (sin `whatsappNumber` ni `mercadoPagoLink`)
- [x] `HolisticServiceDetailResponseDto` — detalle público con descripción larga (sin datos sensibles)
- [x] `HolisticServiceAdminResponseDto` — respuesta completa para admin (incluye todos los campos)
- [x] `CreateHolisticServiceDto` — para admin, con validaciones class-validator
- [x] `UpdateHolisticServiceDto` — PartialType del create

**DTOs de Compras:**

- [x] `CreatePurchaseDto` — solo `holisticServiceId` (el resto se infiere del auth)
- [x] `PurchaseResponseDto` — respuesta de compra (incluye `whatsappNumber` SOLO si `paymentStatus === PAID`)
- [x] `ApprovePurchaseDto` — para admin, con `paymentReference` opcional
- [x] `PurchaseListResponseDto` — para listado con paginación

**Use Cases de Servicios:**

- [x] `GetAllActiveServicesUseCase` — retorna servicios activos ordenados por `displayOrder`
- [x] `GetServiceBySlugUseCase` — retorna detalle por slug, valida que esté activo
- [x] `AdminCreateServiceUseCase` — crea servicio (solo admin)
- [x] `AdminUpdateServiceUseCase` — actualiza servicio (solo admin)

**Use Cases de Compras:**

- [x] `CreatePurchaseUseCase` — crea compra con status PENDING, valida que servicio esté activo, valida que usuario no tenga compra PENDING del mismo servicio
- [x] `ApprovePurchaseUseCase` — cambia status a PAID, registra admin que aprobó y fecha de pago, dispara envío de email (delega en EmailService)
- [x] `GetUserPurchasesUseCase` — retorna compras del usuario autenticado con datos del servicio
- [x] `GetPendingPaymentsUseCase` — retorna compras PENDING (solo admin)
- [x] `CancelPurchaseUseCase` — cancela compra PENDING (usuario propio o admin)

**Orchestrator:**

- [x] `HolisticServicesOrchestratorService` que coordina los use cases
- [x] Cada método del orchestrator delega en el use case correspondiente
- [x] Tests unitarios del orchestrator con mocks de use cases

#### 🎯 Criterios de aceptación

- Todos los DTOs tienen validaciones class-validator apropiadas
- Los DTOs de respuesta excluyen datos sensibles (whatsappNumber solo con pago aprobado)
- Cada use case tiene tests unitarios con casos happy path y error
- El orchestrator coordina sin lógica de negocio propia
- CreatePurchaseUseCase previene compras duplicadas PENDING del mismo servicio por el mismo usuario
- ApprovePurchaseUseCase cambia status correctamente y llama a EmailService
- Coverage ≥ 80%
- No se usa `any` ni `eslint-disable` en ningún archivo

---

 ### T-SF-B03: Capa de Infraestructura — Controllers, Módulo y Endpoints REST

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 días
**Dependencias:** T-SF-B02
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-001, HUS-002, HUS-003, HUS-004, HUS-005, HUS-007

#### 📋 Descripción

Crear los controllers REST, registrar el módulo `HolisticServicesModule` en el AppModule, e integrar con el módulo scheduling existente para la validación de reservas post-pago. Los controllers delegan toda la lógica al orchestrator. Incluye documentación Swagger completa en español.

#### ✅ Tareas específicas

**Controller Público (sin auth):**

- [x] `GET /holistic-services` — Listar servicios activos (público)
- [x] `GET /holistic-services/:slug` — Detalle de servicio por slug (público)

**Controller Autenticado (requiere JWT):**

- [x] `POST /holistic-services/purchases` — Crear compra (usuario autenticado)
- [x] `GET /holistic-services/purchases/my` — Listar compras del usuario
- [x] `GET /holistic-services/purchases/:id` — Detalle de compra del usuario (valida ownership)
- [x] `PATCH /holistic-services/purchases/:id/cancel` — Cancelar compra PENDING

**Controller Admin (requiere JWT + RolesGuard):**

- [x] `GET /admin/holistic-services` — Listar todos los servicios (incluye inactivos)
- [x] `POST /admin/holistic-services` — Crear servicio
- [x] `PATCH /admin/holistic-services/:id` — Actualizar servicio
- [x] `GET /admin/holistic-services/payments` — Listar pagos pendientes
- [x] `PATCH /admin/holistic-services/payments/:id/approve` — Aprobar pago

**Módulo:**

- [x] Crear `HolisticServicesModule` con todos los providers (repos, use cases, orchestrator, controllers)
- [x] Importar módulos necesarios: TypeOrmModule, UsersModule, EmailModule, SchedulingModule
- [x] Registrar en AppModule
- [x] Exportar lo necesario para que otros módulos puedan consumir

**Integración con Scheduling:**

- [x] Modificar `BookSessionUseCase` (o crear guard/interceptor) para validar que al reservar una sesión de tipo holístico (FAMILY_TREE, ENERGY_CLEANING, HEBREW_PENDULUM), exista una `ServicePurchase` con `paymentStatus === PAID` y sin `sessionId` asignado
- [x] Al confirmar la reserva, actualizar el `sessionId` en la `ServicePurchase` correspondiente
- [x] Para sesiones holísticas: usar `whatsappNumber` del servicio en lugar de generar Google Meet link

**Documentación Swagger:**

- [x] Decoradores `@ApiTags`, `@ApiOperation`, `@ApiResponse` en todos los endpoints
- [x] Descripciones en español
- [x] Ejemplos de request/response

#### 🎯 Criterios de aceptación

- [x] Todos los endpoints públicos funcionan sin autenticación
- [x] Endpoints de compras requieren JWT y validan ownership
- [x] Endpoints admin requieren rol ADMIN
- [x] La reserva de sesiones holísticas exige pago aprobado (403 si no hay pago)
- [x] Las sesiones holísticas NO generan Google Meet link, usan WhatsApp
- [x] El `sessionId` se vincula correctamente a la compra tras la reserva
- [x] Swagger documenta todos los endpoints
- [x] Tests unitarios de controllers con mocks del orchestrator
- [x] Coverage ≥ 80%

---

### T-SF-B04: Email de Confirmación, Seed Data y Tests E2E

**Prioridad:** 🟡 ALTA
**Estimación:** 2 días
**Dependencias:** T-SF-B03
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-006, HUS-001 (seed data)

#### 📋 Descripción

Completar el módulo backend con el template de email de confirmación post-pago, los datos de seed para los 3 servicios de Flavia, y una suite de tests E2E que valide los flujos principales end-to-end.

#### ✅ Tareas específicas

**Email de Confirmación:**

- [x] Crear template Handlebars `holistic-service-confirmation.hbs` con: nombre del usuario, nombre del servicio, monto pagado, WhatsApp de Flavia, link para reservar turno, placeholders de branding
- [x] Agregar método `sendHolisticServiceConfirmation(to, data)` al `EmailService` existente
- [x] Crear interface `HolisticServiceConfirmationData` con los campos necesarios
- [x] En modo test (sin SMTP), el email se loguea a consola con `jsonTransport`

**Seed Data:**

- [x] Crear script/servicio de seed que inserte los 3 servicios holísticos definidos en la sección "SERVICIOS — CONTENIDO PARA SEED" de este documento
- [x] El seed debe ser idempotente (no duplicar si ya existen, usando slug como clave)
- [x] Verificar el `tarotistaId` de Flavia antes de insertar (consultar DB)
- [x] Los precios se dejan en 0 o un valor placeholder (admin los configura después)

**Tests E2E:**

- [x] Test: GET /holistic-services retorna los 3 servicios activos
- [x] Test: GET /holistic-services/:slug retorna detalle sin whatsappNumber
- [x] Test: POST /holistic-services/purchases requiere autenticación (401)
- [x] Test: POST /holistic-services/purchases crea compra PENDING (201)
- [x] Test: POST /holistic-services/purchases previene duplicados PENDING (409/400)
- [x] Test: PATCH /admin/.../approve cambia status a PAID (requiere admin)
- [x] Test: Reserva de sesión holística sin pago aprobado falla (403)
- [x] Test: Endpoints admin requieren rol admin (403 para usuario normal)

#### 🎯 Criterios de aceptación

- [x] El email de confirmación se envía al aprobar un pago (o se loguea en modo test)
- [x] El template tiene diseño profesional y responsivo, consistente con templates existentes
- [x] El seed crea los 3 servicios correctamente y es re-ejecutable
- [x] Los tests E2E cubren los flujos críticos: catálogo público, compra, aprobación admin, restricción de reserva sin pago
- [x] Todos los tests E2E pasan consistentemente
- [x] Suite completa (unitarios + E2E) pasa sin errores
- [x] Build exitoso

---

## TAREAS DE FRONTEND

---

### T-SF-F01: Foundation — Types, API Functions, Hooks y Rutas

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 2 días
**Dependencias:** T-SF-B03 (endpoints backend deben existir)
**Estado:** ✅ COMPLETADA
**Cubre HUS:** Todas (infraestructura base del frontend)

#### 📋 Descripción

Crear toda la infraestructura frontend necesaria antes de construir las páginas: tipos TypeScript que mapean los contratos del backend, funciones API centralizadas, hooks de TanStack Query para data fetching, y la estructura de rutas en el App Router.

#### ✅ Tareas específicas

**TypeScript Types:**

- [x] Crear `types/holistic-service.types.ts` con interfaces: `HolisticService`, `HolisticServiceDetail`, `HolisticServiceAdmin`
- [x] Crear `types/service-purchase.types.ts` con interfaces: `ServicePurchase`, `PurchaseStatus`, `CreatePurchasePayload`
- [x] Exportar desde `types/index.ts`
- [x] Los IDs son numéricos (number), los precios son number, las fechas son string ISO

**API Endpoints y Functions:**

- [x] Agregar sección `HOLISTIC_SERVICES` en `lib/api/endpoints.ts` con todos los endpoints (públicos, autenticados, admin)
- [x] Crear `lib/api/holistic-services-api.ts` con funciones: `getHolisticServices()`, `getHolisticServiceBySlug(slug)`, `createPurchase(data)`, `getMyPurchases()`, `getPurchaseDetail(id)`, `cancelPurchase(id)`
- [x] Crear `lib/api/admin-holistic-services-api.ts` con funciones admin: `getAdminServices()`, `createService(data)`, `updateService(id, data)`, `getPendingPayments()`, `approvePayment(id, data)`

**TanStack Query Hooks:**

- [x] Crear `hooks/api/useHolisticServices.ts` con hooks: `useHolisticServices()`, `useHolisticServiceDetail(slug)`, `useMyPurchases()`, `usePurchaseDetail(id)`
- [x] Crear `hooks/api/useHolisticServiceMutations.ts` con mutations: `useCreatePurchase()`, `useCancelPurchase()`
- [x] Crear `hooks/api/useAdminHolisticServices.ts` con hooks admin: `useAdminHolisticServices()`, `usePendingPayments()`, `useUpdateService()`, `useApprovePayment()`, `useCreateService()`
- [x] Invalidación de queries apropiada después de mutations

**Rutas (App Router):**

- [x] Crear estructura: `app/servicios/page.tsx`, `app/servicios/[slug]/page.tsx`, `app/servicios/[slug]/pago/page.tsx`, `app/servicios/reservar/[purchaseId]/page.tsx`
- [x] Crear `app/mis-servicios/page.tsx`
- [x] Las páginas de pago y reserva deben requerir autenticación (redirección a login si no autenticado)

**Zod Validations:**

- [x] Crear `lib/validations/holistic-service.schema.ts` para validaciones de forms admin (create/edit service)
- [x] Crear `lib/validations/purchase.schema.ts` para validaciones de compra

#### 🎯 Criterios de aceptación

- [x] Los tipos TypeScript reflejan exactamente los contratos del backend (IDs numéricos, paginación con meta estándar)
- [x] Los endpoints usan `API_ENDPOINTS.HOLISTIC_SERVICES.xxx` (centralizados, no hardcoded)
- [x] Los hooks manejan loading, error y data states correctamente
- [x] Las rutas existen y renderizan componentes placeholder
- [x] Los schemas Zod validan los forms correctamente
- [x] Tests para hooks y API functions (61 tests, todos pasando)
- [x] `npm run type-check` pasa sin errores
- [x] `npm run build` compila sin errores

---

### T-SF-F02: Páginas Públicas — Catálogo y Detalle de Servicio

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 días
**Dependencias:** T-SF-F01
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-001, HUS-002

#### 📋 Descripción

Construir las páginas públicas del catálogo de servicios: la grilla de servicios y la página de detalle con calendario en modo solo lectura. Incluye el link "Servicios" en el Header de navegación visible para todos los usuarios. Responsive, accesible, con estados de carga y error.

#### ✅ Tareas específicas

**Página de Catálogo (`/servicios`):**

- [x] Componente `ServiciosPage` que consume `useHolisticServices()` hook
- [x] Componente `ServiceCard` con: nombre, descripción corta, precio formateado en ARS, duración, botón "Ver más"
- [x] Grilla responsive: 1 columna mobile, 2 tablet, 3 desktop
- [x] Skeleton loading mientras carga
- [x] Estado vacío si no hay servicios activos
- [x] Estado de error con retry

**Página de Detalle (`/servicios/[slug]`):**

- [x] Componente `ServiceDetailPage` que consume `useHolisticServiceDetail(slug)`
- [x] Secciones: nombre (h1), descripción larga formateada con markdown/HTML, precio, duración, modalidad (WhatsApp)
- [x] `BookingCalendar` en modo `readOnly` (nueva prop a agregar al componente existente)
- [x] Disclaimer debajo del calendario: _"Las fechas disponibles son al momento de la consulta. Una vez realizado el pago, la fecha que observaste libre podría ya estar ocupada."_
- [x] El número de WhatsApp NO se muestra en el detalle público
- [x] Botón "Contratar servicio" que navega a la página de pago
- [x] Manejo de slug no encontrado (404)

**Navegación:**

- [x] Agregar link "Servicios" en el Header principal, visible para todos los usuarios (autenticados y no autenticados)
- [x] El link activo se destaca cuando estamos en `/servicios/*`

**BookingCalendar - Prop readOnly:**

- [x] Agregar prop `readOnly?: boolean` al componente `BookingCalendar` existente
- [x] Cuando `readOnly={true}`: se muestran slots disponibles pero no se puede seleccionar ni reservar, se oculta el botón de confirmar reserva
- [x] No romper la funcionalidad existente del calendario cuando `readOnly` es `false` o no se pasa

#### 🎯 Criterios de aceptación

- Visitantes sin login pueden ver catálogo y detalle completos (excepto WhatsApp)
- La grilla es responsive en los 3 breakpoints
- El calendario muestra slots reales de disponibilidad de Flavia en modo solo lectura
- El disclaimer de disponibilidad es visible debajo del calendario
- El botón "Contratar servicio" navega correctamente a `/servicios/[slug]/pago`
- El link "Servicios" aparece en el Header para todos
- Tests de renderizado para `ServiceCard`, `ServiciosPage`, `ServiceDetailPage`
- `data-testid` en los componentes principales para facilitar testing
- Build exitoso

---

### T-SF-F03: Flujo Autenticado — Pago, Reserva, Confirmación y Mis Servicios

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 3 días
**Dependencias:** T-SF-F02
**Estado:** ✅ COMPLETADA
**Cubre HUS:** HUS-003, HUS-004, HUS-005

#### 📋 Descripción

Implementar el flujo completo post-detalle: página de pago con resumen y link a Mercado Pago, página de reserva post-pago con calendario interactivo, vista de confirmación con datos de WhatsApp, y la página "Mis Servicios" donde el usuario ve sus compras y sus estados.

#### ✅ Tareas específicas

**Página de Pago (`/servicios/[slug]/pago`):**

- [x] Redirección a login si no autenticado (con retorno a esta página después del login)
- [x] Resumen del servicio: nombre, precio en ARS formateado (ej: $15.000), duración
- [x] Botón "Pagar con Mercado Pago" que: crea la compra vía `useCreatePurchase()`, abre el link de Mercado Pago en nueva pestaña (`window.open`)
- [x] Mensaje post-clic: _"Tu pago está siendo verificado. Una vez confirmado, te habilitaremos la reserva de turno y recibirás un email con todos los datos."_
- [x] Manejo de error si la creación de compra falla (ej: compra duplicada)

**Página de Reserva (`/servicios/reservar/[purchaseId]`):**

- [x] Validar que la compra existe, pertenece al usuario, y tiene `paymentStatus === PAID`
- [x] Si pago NO aprobado: mensaje _"Tu pago aún está siendo verificado. Te notificaremos cuando puedas reservar tu turno."_
- [x] Si pago aprobado: `BookingCalendar` en modo interactivo con props pre-configurados del servicio (`tarotistaId` de Flavia, `durationMinutes` del servicio, `sessionType` del servicio)
- [x] Al confirmar reserva: llamar al endpoint de booking existente y luego vincular la sesión a la compra
- [x] Tras reserva exitosa: mostrar confirmación

**Vista de Confirmación:**

- [x] Nombre del servicio, fecha, hora, duración
- [x] Número de WhatsApp de Flavia con link clickeable `wa.me/[número]`
- [x] Botón para ir a "Mis Servicios"

**Página Mis Servicios (`/mis-servicios`):**

- [x] Lista de compras del usuario usando `useMyPurchases()`
- [x] Cada card muestra: nombre del servicio, fecha de compra, monto ARS, estado con badge de color (PENDING=amber, PAID=verde, CANCELLED=rojo)
- [x] Si `PAID` y sin reserva: botón "Reservar Turno" que navega a `/servicios/reservar/:purchaseId`
- [x] Si `PAID` y con reserva: mostrar datos de la sesión (fecha, hora, WhatsApp)
- [x] Estado vacío: ilustración + "No tenés servicios contratados" + link al catálogo
- [x] Skeleton loading

#### 🎯 Criterios de aceptación

- [x] El flujo completo funciona: detalle → pago → esperar aprobación → reservar → confirmación
- [x] La página de pago redirige a login si no autenticado y retorna después
- [x] El link de Mercado Pago se abre en nueva pestaña
- [x] La reserva solo se habilita con pago aprobado
- [x] La confirmación muestra el WhatsApp como link clickeable `wa.me/`
- [x] "Mis Servicios" refleja correctamente el estado de cada compra
- [x] Tests de componentes con mocks de hooks
- [x] Texto user-facing en español
- [x] Build exitoso

---

### T-SF-F04: Panel Admin — Gestión de Servicios y Aprobación de Pagos

**Prioridad:** 🟡 ALTA
**Estimación:** 3 días
**Dependencias:** T-SF-F01
**Estado:** ✅ COMPLETADA

#### 📋 Descripción

Crear la sección de administración de servicios holísticos dentro del panel admin existente. Incluye la tabla de servicios con edición, la tabla de pagos pendientes con aprobación, y el menú de navegación en el sidebar del admin. Usa los patrones ya establecidos en el admin existente (tablas con filtros, modales de edición, React Hook Form + Zod).

#### ✅ Tareas específicas

**Navegación Admin:**

- [x] Agregar item "Servicios" en el sidebar del admin, dentro de la sección GESTIÓN
- [x] Ruta: `/admin/servicios`

**Tab "Servicios" (CRUD):**

- [x] Tabla con columnas: Nombre, Precio ARS, Duración, Activo (badge), acciones (Editar)
- [x] Modal de edición con React Hook Form + Zod: campos para nombre, descripción corta, descripción larga, precio ARS, link Mercado Pago, WhatsApp, duración en minutos, estado activo, orden de visualización
- [x] Modal de creación de nuevo servicio (reutilizar formulario del modal de edición)
- [x] Validaciones Zod: precio > 0, duración > 0, WhatsApp formato válido, slug auto-generado desde nombre
- [x] Toast de éxito/error al guardar

**Tab "Pagos Pendientes":**

- [x] Tabla con columnas: Usuario (userId), Servicio, Monto ARS, Fecha de compra, Acciones
- [x] Botón "Aprobar pago" con confirmación (dialog: "¿Confirmar aprobación del pago de $X de [usuario] para [servicio]?")
- [x] Campo opcional para `paymentReference` al aprobar
- [x] Al aprobar: el pago desaparece de la tabla (invalidar query), toast de éxito
- [x] Indicador de cantidad de pagos pendientes en el tab (badge con número)

**Componentes:**

- [x] `HolisticServicesManagement` — contenedor con tabs
- [x] `ServicesTable` + `EditServiceModal`
- [x] `PendingPaymentsTable` + `ApprovePaymentDialog`
- [x] Reutilizar componentes UI existentes del admin (tablas, modales, badges, toasts)

#### 🎯 Criterios de aceptación

- [x] El admin puede ver, crear y editar servicios holísticos
- [x] Los cambios de admin se reflejan inmediatamente en la página pública `/servicios`
- [x] El admin puede aprobar pagos pendientes y estos desaparecen de la lista
- [x] La aprobación dispara el email de confirmación (validar desde backend)
- [x] Los formularios validan correctamente con Zod antes de enviar
- [x] El sidebar del admin incluye el nuevo item "Servicios"
- [x] Tests de componentes admin con mocks
- [x] Texto en español
- [x] Build exitoso

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
FASE 1 — Backend (secuencial):
  T-SF-B01 → T-SF-B02 → T-SF-B03 → T-SF-B04

FASE 2 — Frontend (F01 primero, luego F02-F04 pueden solaparse parcialmente):
  T-SF-F01 → T-SF-F02 ─┐
                        ├→ T-SF-F03
  T-SF-F01 → T-SF-F04 ─┘
```

> **Nota:** El backend debe completarse primero para que los endpoints estén disponibles para el frontend. T-SF-F04 (admin) puede desarrollarse en paralelo con T-SF-F02/F03 ya que son páginas independientes.

---

## DIAGRAMA DE DEPENDENCIAS

```
T-SF-B01 (Domain)
    │
    ▼
T-SF-B02 (Application)
    │
    ▼
T-SF-B03 (Infrastructure)
    │
    ├──── T-SF-B04 (Email, Seed, E2E)
    │
    ▼
T-SF-F01 (Foundation Frontend)
    │
    ├──── T-SF-F02 (Páginas Públicas)
    │         │
    │         ▼
    │     T-SF-F03 (Flujo Autenticado)
    │
    └──── T-SF-F04 (Admin Panel)
```

---

**FIN DE PARTE B — TAREAS TÉCNICAS**

---

## PARTE C: MEJORAS PENDIENTES (detectadas en testing E2E)

> Identificadas durante validación Playwright del módulo completo (14/03/2026)
> **Convención de IDs:** `T-SF-M0X` = Mejora (fullstack)

### Índice de Mejoras

| ID       | Tarea                                                          | Tipo      | Prioridad | Estimación |
| -------- | -------------------------------------------------------------- | --------- | --------- | ---------- |
| T-SF-M01 | Calendario de disponibilidad: rediseño a cuadrícula mensual    | Frontend  | ✅ COMPLETADA | 2 días     |
| T-SF-M02 | Endpoint de disponibilidad público + preview funcional         | Fullstack | 🔴 Alta   | 2 días     |
| T-SF-M03 | Admin: gestión de disponibilidad/agenda de la tarotista        | Fullstack | ✅ COMPLETADA | 4 días     |

**Estimación total:** ~8 días de desarrollo (incluye TDD + ciclos de calidad)

---

### T-SF-M01: Calendario de Disponibilidad — Rediseño a Cuadrícula Mensual

**Prioridad:** 🔴 ALTA
**Estimación:** 2 días
**Dependencias:** Ninguna (refactor visual independiente)
**Estado:** ✅ COMPLETADA
**Contexto:** El componente `BookingCalendar` actual muestra las fechas como una línea horizontal de botones con scroll. Esto no es estándar UX — todos los calendarios de reserva del mercado (Calendly, Google Calendar, etc.) usan una cuadrícula mensual.

#### 📋 Descripción

Rediseñar el componente `BookingCalendar` para que presente los días en un grid de calendario mensual (7 columnas lun-dom, filas por semana) con navegación por mes. El componente se usa tanto en la página pública de detalle de servicio (readOnly) como en la página de reserva post-pago (interactivo).

#### ✅ Tareas específicas

**Componente BookingCalendar:**

- [x] Reemplazar la fila horizontal de botones por un grid de 7 columnas (Lun, Mar, Mié, Jue, Vie, Sáb, Dom)
- [x] Agregar navegación por mes (flechas ← →) con nombre del mes y año como header
- [x] Marcar visualmente el día actual (today)
- [x] Deshabilitar días pasados (no seleccionables)
- [x] Colorear días con disponibilidad vs días sin horarios disponibles (si el endpoint está público — ver T-SF-M02)
- [x] Mantener el comportamiento de selección de fecha → carga de horarios
- [x] Responsive: en mobile el grid se adapta sin scroll horizontal

**Tests:**

- [x] Tests unitarios del componente con grid mensual
- [x] Test de navegación entre meses
- [x] Test de que días pasados no son seleccionables
- [x] Test responsive (viewport pequeño)

#### 🎯 Criterios de aceptación

- [x] El calendario muestra un grid mensual con días de la semana como headers
- [x] Se puede navegar entre meses con flechas
- [x] Días pasados están deshabilitados
- [x] El diseño es responsive y no requiere scroll horizontal
- [x] Los tests existentes del BookingCalendar se actualizan y pasan
- [x] `npm run build`, `npm run type-check`, `npm run lint:fix` pasan sin errores

#### 📁 Archivos involucrados

- `frontend/src/components/features/marketplace/BookingCalendar.tsx` — refactor completo del layout
- `frontend/src/components/features/marketplace/BookingCalendar.test.tsx` — actualizar tests

---

### T-SF-M02: Endpoint de Disponibilidad Público + Preview Funcional

**Prioridad:** 🔴 ALTA
**Estimación:** 2 días
**Dependencias:** T-SF-M01 (ideal hacer juntas, pero no bloqueante)
**Estado:** ✅ COMPLETADA

**Contexto:** El endpoint `GET /scheduling/available-slots` requiere autenticación (devuelve 401 sin token). Sin embargo, el flujo de usuario requiere que pueda ver las fechas y horarios disponibles ANTES de pagar. Solo la acción de **agendar/reservar** un turno debe estar bloqueada hasta tener un pago aprobado.

#### 📋 Descripción

Hacer que la consulta de disponibilidad sea pública para que el calendario en la página de detalle del servicio muestre los horarios reales de la tarotista. El usuario puede explorar la disponibilidad libremente; la restricción es solo al momento de confirmar la reserva.

#### ✅ Tareas específicas

**Backend:**

- [x] Crear endpoint público `GET /holistic-services/:slug/availability` que retorne slots disponibles para una fecha dada (sin requerir auth)
  - Query params: `date` (YYYY-MM-DD)
  - Retorna: `{ date: string, slots: { time: string, available: boolean }[] }`
  - Internamente consulta el scheduling del tarotista asociado al servicio
- [x] Alternativa: hacer público el endpoint existente `GET /scheduling/available-slots` (evaluar impacto de seguridad) → se optó por nuevo endpoint en holistic-services
- [x] Tests unitarios del nuevo endpoint/cambio
- [x] Tests de integración para verificar acceso sin auth

**Frontend:**

- [x] Actualizar el hook `useAvailableSlots` para usar el nuevo endpoint público cuando se usa desde la página de detalle → se creó `useHolisticServiceAvailability` en `useHolisticServices.ts`
- [x] En `ServiceDetailPage`, el `BookingCalendar` en modo `readOnly` muestra los slots reales
  - Los botones de horario se ven pero no son clickeables (visualización solo)
  - Colores: verde/disponible, gris/ocupado
- [x] En la página de reserva post-pago, el calendario permite seleccionar horarios (modo interactivo)
- [x] Tests del componente con datos reales mockeados

#### 🎯 Criterios de aceptación

- [x] Un visitante no autenticado en `/servicios/arbol-genealogico` puede seleccionar una fecha y ver los horarios disponibles
- [x] Los horarios se muestran como preview (no clickeables en modo readOnly)
- [x] No se puede reservar sin autenticación + pago aprobado
- [x] El endpoint no expone información sensible (solo time + available)
- [x] Coverage ≥ 80% en archivos modificados
- [x] Ciclo de calidad completo pasa (backend + frontend)

#### 📁 Archivos involucrados

**Backend:**
- `backend/tarot-app/src/modules/holistic-services/application/use-cases/get-service-availability.use-case.ts` ← CREADO
- `backend/tarot-app/src/modules/holistic-services/application/use-cases/get-service-availability.use-case.spec.ts` ← CREADO
- `backend/tarot-app/src/modules/holistic-services/infrastructure/controllers/holistic-services-public.controller.ts` ← MODIFICADO
- `backend/tarot-app/src/modules/holistic-services/holistic-services.module.ts` ← MODIFICADO
- `backend/tarot-app/src/modules/scheduling/scheduling.module.ts` ← MODIFICADO

**Frontend:**
- `frontend/src/types/holistic-service.types.ts` ← nuevos tipos `ServiceAvailabilitySlot`, `ServiceAvailabilityResponse`
- `frontend/src/lib/api/endpoints.ts` ← nuevo endpoint `HOLISTIC_SERVICES.AVAILABILITY`
- `frontend/src/lib/api/holistic-services-api.ts` ← nueva función `getHolisticServiceAvailability`
- `frontend/src/hooks/api/useHolisticServices.ts` ← nuevo hook `useHolisticServiceAvailability`
- `frontend/src/components/features/marketplace/BookingCalendar.tsx` ← prop `serviceSlug`, estilos verde/gris
- `frontend/src/components/features/holistic-services/ServiceDetailPage.tsx` ← pasa `serviceSlug={slug}`

---

### T-SF-M03: Admin — Gestión de Disponibilidad/Agenda de la Tarotista

**Prioridad:** 🔴 ALTA
**Estimación:** 4 días
**Dependencias:** T-SF-M02 (el sistema de disponibilidad debe estar público para validar)
**Estado:** ✅ COMPLETADA
**Contexto:** Actualmente no existe forma de que la tarotista (Flavia) configure su agenda desde el admin. No puede indicar en qué días y horarios está disponible, ni bloquear fechas. Sin esto, el calendario público no refleja disponibilidad real.

#### 📋 Descripción

Crear un panel de gestión de agenda en el admin donde la tarotista pueda configurar su disponibilidad semanal (horarios recurrentes) y bloquear fechas específicas (vacaciones, ausencias). Esta configuración alimenta el sistema de scheduling existente y se refleja en el calendario público.

#### ✅ Tareas específicas

**Backend — Modelo de datos:**

- [x] Crear entidad `TarotistaAvailability` con campos: `id`, `tarotistaId` (FK), `dayOfWeek` (0-6), `startTime` (HH:mm), `endTime` (HH:mm), `isActive`, `createdAt`, `updatedAt`
- [x] Crear entidad `TarotistaBlockedDate` con campos: `id`, `tarotistaId` (FK), `date` (DATE), `reason` (nullable), `createdAt`
- [x] Migración para crear ambas tablas
- [x] Repositorios con interfaces + implementaciones TypeORM

**Backend — Endpoints admin:**

- [x] `GET /admin/tarotistas/:id/availability` — retorna configuración semanal
- [x] `PUT /admin/tarotistas/:id/availability` — actualiza horarios semanales (bulk upsert)
- [x] `GET /admin/tarotistas/:id/blocked-dates` — retorna fechas bloqueadas
- [x] `POST /admin/tarotistas/:id/blocked-dates` — bloquear fecha
- [x] `DELETE /admin/tarotistas/:id/blocked-dates/:dateId` — desbloquear fecha
- [x] Integrar con el sistema de scheduling para que `available-slots` consulte estos datos

**Backend — Tests:**

- [x] Tests unitarios de use cases
- [x] Tests de integración de los endpoints

**Frontend — Panel de agenda:**

- [x] Nueva pestaña "Agenda" en `/admin/servicios` o nueva ruta `/admin/agenda`
- [x] Vista de horarios semanales: grid de 7 días con franjas horarias editables
- [x] Vista de fechas bloqueadas: lista con botón de agregar/eliminar
- [x] Formulario para agregar bloqueo: fecha picker + razón opcional
- [x] Hooks TanStack Query para los endpoints de disponibilidad

**Frontend — Tests:**

- [x] Tests de componentes del panel de agenda
- [x] Tests de hooks API

#### 🎯 Criterios de aceptación

- Desde el admin, la tarotista puede configurar su horario semanal (ej: lunes a viernes de 9:00 a 18:00)
- Puede bloquear fechas específicas (ej: "15/04/2026 — Vacaciones")
- Las fechas bloqueadas NO aparecen como disponibles en el calendario público
- Los horarios fuera del rango configurado NO aparecen como disponibles
- Los cambios se reflejan inmediatamente en el calendario público
- Coverage ≥ 80% en archivos nuevos
- Ciclo de calidad completo pasa (backend + frontend)

#### 📁 Archivos involucrados

**Backend:**
- `backend/tarot-app/src/modules/scheduling/domain/entities/` — nuevas entidades
- `backend/tarot-app/src/modules/scheduling/domain/interfaces/` — nuevos repositorios
- `backend/tarot-app/src/modules/scheduling/infrastructure/repositories/` — implementaciones
- `backend/tarot-app/src/modules/scheduling/infrastructure/controllers/` — endpoints admin
- `backend/tarot-app/src/modules/scheduling/application/use-cases/` — nuevos use cases
- `backend/tarot-app/src/database/migrations/` — nueva migración

**Frontend:**
- `frontend/src/components/features/admin/` — componentes de gestión de agenda
- `frontend/src/hooks/api/` — hooks para endpoints de disponibilidad
- `frontend/src/lib/api/` — funciones API
- `frontend/src/app/admin/` — ruta del panel de agenda

---

**FIN DE PARTE C — MEJORAS PENDIENTES**
