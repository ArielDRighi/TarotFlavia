# Modelo de Negocio - Tarot App (DEFINIDO)

**Fecha de definición:** 2026-01-07
**Fuente:** Conversación con el dueño del producto

---

## Resumen Ejecutivo

Este documento refleja el **modelo de negocio real** según la visión del dueño del producto. Usar este documento como fuente de verdad para decisiones de implementación.

---

## Planes de Usuario

### 1. Usuario ANÓNIMO (Sin Registro)

**Objetivo:** Trial para conversión a FREE

#### Acceso

- ✅ **Carta del Día**: 1/día
  - Carta aleatoria
  - Descripción desde DB (sin IA)
  - Al alcanzar límite → Modal CTA "Regístrate gratis"

- ❌ **Tiradas de Tarot**: NO acceso

#### Límites

- 1 carta del día por día
- Si reingresa tras consumir límite → Modal inmediato

#### CTA Principal

"Regístrate gratis para obtener 1 tirada de tarot diaria adicional + historial"

---

### 2. Usuario FREE (Autenticado)

**Objetivo:** Freemium para conversión a PREMIUM

#### Acceso

**Carta del Día:**

- ✅ 1/día
- Carta aleatoria
- Descripción desde DB (sin IA)
- Al alcanzar límite → Modal CTA "Upgrade a PREMIUM"
- Debe almacenarse el resultado para lugo poder consultarlo en el historial (solo en el historial, no debe volver a mostrarse el resultado al volver a entrar a la carta del día)

**Tiradas de Tarot:**

- ✅ 1/día
- Spreads disponibles: **Solo 1 carta o 3 cartas**
- Usuario selecciona cartas del mazo completo (no aleatorio)
- Descripción desde DB (sin IA)
- ❌ NO puede seleccionar categorías ni hacer preguntas
- Al alcanzar límite → Modal CTA "Upgrade a PREMIUM"

**Historial:**

- ✅ Limitado (definir límite exacto)
- Puede ver resultados pasados
- Puede compartir resultados

#### Límites

- 1 carta del día + 1 tirada de tarot (límites independientes)
- Si reingresa tras consumir ambos límites → Modal inmediato

#### CTA Principal

"Upgrade a PREMIUM para interpretaciones con IA, más tiradas y spreads exclusivos"

---

### 3. Usuario PREMIUM (Suscripción Paga)

**Objetivo:** Experiencia completa con IA

#### Acceso

**Carta del Día:**

- ✅ 1/día
- Carta aleatoria
- Descripción desde DB + **Interpretación completa generada con IA**
- Al alcanzar límite → Notificación informativa (sin CTA)
- Debe almacenarse el resultado para lugo poder consultarlo en el historial (solo en el historial, no debe volver a mostrarse el resultado al volver a entrar a la carta del día)

**Tiradas de Tarot:**

- ✅ 3/día
- Spreads disponibles: **1 carta, 3 cartas, 5 cartas, Cruz Celta**
- Usuario selecciona cartas del mazo completo
- Descripción desde DB + **Interpretación completa generada con IA**
- ✅ SÍ puede seleccionar categorías y hacer preguntas específicas
- La IA contextualiza según pregunta/categoría
- Al alcanzar límite → Notificación informativa (sin CTA)

**Historial:**

- ✅ Completo (sin límite de tiempo/cantidad)
- Puede filtrar y buscar
- Todas las interpretaciones IA guardadas
- Puede compartir con IA incluida

#### Límites

- 1 carta del día + 3 tiradas de tarot (límites independientes)
- Si reingresa tras consumir límites → Notificación suave

#### Features Exclusivos

1. **Interpretaciones con IA** (en todas las tiradas)
2. **Spreads avanzados** (5 cartas y Cruz Celta)
3. **Categorías y preguntas personalizadas**
4. **Historial completo** con búsqueda/filtros

---

## Diferencias Clave

### Carta del Día vs Tiradas de Tarot

| Característica | Carta del Día            | Tiradas de Tarot                   |
| -------------- | ------------------------ | ---------------------------------- |
| **Propósito**  | Energías rápidas del día | Lectura profunda sobre inquietudes |
| **Selección**  | Aleatoria                | Usuario selecciona del mazo        |
| **Cantidad**   | 1 carta                  | 1, 3, 5, o 10 cartas (Cruz Celta)  |
| **Velocidad**  | Rápida                   | Más elaborada                      |
| **Límites**    | Separados                | Separados                          |

**IMPORTANTE:** Son 2 features distintas con límites independientes.

---

## Interpretaciones con IA

### Sin IA (ANÓNIMO/FREE)

- Solo descripción de carta desde DB
- Texto estático predefinido
- Rápido y sin costo de API

### Con IA (PREMIUM)

- Descripción de carta + interpretación generada por IA
- Contextualizada según pregunta/categoría del usuario
- Personalizada para cada lectura
- Mayor profundidad y valor percibido

**Modelo de IA a usar:** ❓ (VALIDAR: ¿OpenAI, Claude, otro?)

---

## Modelo de Conversión (Funnel)

```
ANÓNIMO (1 carta del día gratis)
    ↓ Modal CTA
FREE (1 carta del día + 1 tirada)
    ↓ Modal CTA
PREMIUM (1 carta del día + 3 tiradas, TODO con IA)
```

### Estrategia de Límites

Los límites están diseñados para:

1. **ANÓNIMO → FREE**: Mostrar valor sin fricciones
2. **FREE → PREMIUM**: Generar necesidad de más tiradas + IA

**Punto clave:** La propuesta de valor de PREMIUM debe ser clara:

- No solo "más cantidad" (3 vs 1)
- Sino "mejor calidad" (IA + spreads avanzados)

---

## Historial

### FREE

- **Límite:** ❓ (VALIDAR: ¿10 últimas? ¿último mes?)
- Puede ver resultados sin IA
- Puede compartir
- Indicación de que PREMIUM tiene más

### PREMIUM

- **Límite:** Ilimitado
- Puede ver todos los resultados con IA
- Filtros y búsqueda
- Puede compartir con IA incluida

---

## Compartir Resultados

### FREE

- Comparte resultado con descripción de DB
- Sin interpretación IA
- **Formato:** ❓ (VALIDAR: ¿imagen, link, PDF?)

### PREMIUM

- Comparte resultado con interpretación IA completa
- Más atractivo visualmente
- **Formato:** ❓ (VALIDAR: ¿imagen, link, PDF?)

**Oportunidad:** Incluir branding de la app para marketing orgánico

---

## Spreads Disponibles por Plan

| Spread       | Cartas | ANÓNIMO | FREE | PREMIUM |
| ------------ | ------ | ------- | ---- | ------- |
| Simple       | 1      | ❌      | ✅   | ✅      |
| Tres Cartas  | 3      | ❌      | ✅   | ✅      |
| Cinco Cartas | 5      | ❌      | ❌   | ✅      |
| Cruz Celta   | 10     | ❌      | ❌   | ✅      |

**Spreads exclusivos PREMIUM:** 5 cartas y Cruz Celta

---

## Preguntas Pendientes de Validar

### Implementación

- [ ] ¿El límite de tiradas de tarot está implementado?
- [ ] ¿Los spreads de 5 cartas y Cruz Celta existen?
- [ ] ¿La integración de IA funciona?
- [ ] ¿Qué modelo de IA se usa?
- [ ] ¿El historial limitado para FREE existe?
- [ ] ¿La funcionalidad de compartir existe?

### Negocio

- [ ] ¿Cuál es el precio exacto de PREMIUM?
- [ ] ¿Hay trial period para PREMIUM?
- [ ] ¿El límite de historial FREE es el correcto?
- [ ] ¿El formato de compartir es efectivo?
- [ ] ¿Los modales de conversión funcionan bien?

### Administración

- [ ] ¿Los límites son configurables desde admin o hardcoded?
- [ ] ¿Existe panel de analytics para ver conversión?
- [ ] ¿Se puede modificar el precio sin deploy?

---

## Reglas de Oro

1. **Carta del Día ≠ Tiradas de Tarot** (features separadas)
2. **IA = PREMIUM ONLY** (diferenciador clave)
3. **Límites independientes** (1 carta día + N tiradas)
4. **Modales al límite:**
   - ANÓNIMO → "Regístrate"
   - FREE → "Upgrade"
   - PREMIUM → Notificación suave
5. **Si reingresa tras límite → Modal inmediato** (no permitir re-intentos)

---

## Notas Importantes

- Este documento es la **fuente de verdad** del modelo de negocio
- Cualquier desviación entre código y este documento = GAP a resolver
- Actualizar este documento si el modelo de negocio cambia
- Usar como referencia para PRs y decisiones de implementación

---

## Próximos Pasos

1. Validar qué está implementado vs este modelo
2. Identificar gaps críticos
3. Priorizar correcciones según impacto en conversión
4. Implementar ajustes necesarios
