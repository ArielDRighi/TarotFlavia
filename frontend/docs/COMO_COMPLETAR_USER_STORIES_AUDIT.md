# Cómo Completar el User Stories Audit

## Objetivo
Este documento te guía paso a paso para completar el [USER_STORIES_AUDIT.md](USER_STORIES_AUDIT.md) y recuperar el control sobre la alineación negocio-código.

---

## Paso 1: Completa la Tabla Resumen (30-45 minutos)

### Qué hacer
Abre [USER_STORIES_AUDIT.md](USER_STORIES_AUDIT.md) y ve a la "Tabla Resumen: Matriz de Features por Nivel de Usuario".

### Para cada feature, responde:

1. **¿Existe actualmente?**
   - Si existe → marca ✅
   - Si NO existe → marca ❌
   - Si no estás seguro → deja ❓

2. **¿Qué puede hacer cada nivel de usuario?**
   - **ANÓNIMO**: ¿Sin registrarse?
   - **FREE**: ¿Con qué límites?
   - **PREMIUM**: ¿Acceso completo?
   - **ADMIN**: ¿Tiene herramientas especiales?

### Ejemplo de cómo completar:

**ANTES:**
```
| **Lecturas de Tarot** | ❓ | ✅ Limitado | ✅ Ilimitado | N/A | ⚠️ | ¿Límites específicos? |
```

**DESPUÉS (ejemplo):**
```
| **Lecturas de Tarot** | ❌ No | ✅ 5/día | ✅ Ilimitado | N/A | ✅ | Límites correctos |
```

**O si descubres algo inesperado:**
```
| **Lecturas de Tarot** | ✅ 2/día | ✅ 5/día | ✅ Ilimitado | N/A | ⚠️ | ¿Quiero que anónimos tengan 2? |
```

---

## Paso 2: Responde las Preguntas Críticas (1 hora)

### Sobre Usuarios Anónimos

Abre la sección "Preguntas Críticas para Responder" y responde:

#### ¿Los usuarios anónimos pueden usar la app actualmente?
**Mi respuesta:**
- [ ] Sí, pueden hacer [describe qué]
- [ ] No, deben registrarse obligatoriamente
- [ ] No sé, necesito revisarlo

#### ¿Qué features DEBERÍAN tener según tu visión?
**Mi visión ideal:**
```
Anónimos deberían poder:
- [✅/❌] Ver 1 carta diaria de prueba
- [✅/❌] Hacer 1 lectura completa
- [✅/❌] Solo ver landing page y registrarse
```

#### ¿Cuál es el límite que los motiva a registrarse?
**Mi estrategia:**
```
El límite ideal para convertir anónimos → FREE es:
- [Describe tu estrategia de conversión]
```

---

### Sobre Usuarios FREE

#### ¿3 cartas diarias es el límite correcto?
**Mi respuesta:**
- [ ] Sí, 3 está bien porque [razón de negocio]
- [ ] No, debería ser [X] porque [razón]
- [ ] No sé, necesito analizar conversión a PREMIUM

#### ¿Hay diferencia entre "carta diaria" y "lectura completa"?
**Mi respuesta:**
```
En mi visión:
- Carta Diaria = [describe qué es]
- Lectura Completa = [describe qué es]
- ¿Son lo mismo? [Sí/No]
```

#### ¿Qué spreads pueden usar usuarios FREE?
**Mi respuesta:**
```
FREE debería tener acceso a:
- [✅/❌] Spread simple (1 carta)
- [✅/❌] Spread de 3 cartas
- [✅/❌] Cruz Celta (10 cartas)
- [✅/❌] Todos los spreads (con límite de cantidad)
```

#### ¿Tienen historial? ¿Cuántas lecturas guardadas?
**Mi respuesta:**
```
FREE debería poder ver:
- [✅/❌] Última lectura solamente
- [✅/❌] Últimas 5 lecturas
- [✅/❌] Últimas 10 lecturas
- [✅/❌] Historial completo (sin límite)
```

---

### Sobre Usuarios PREMIUM

#### ¿Qué obtienen más allá de "ilimitado"?
**Mi propuesta de valor PREMIUM:**
```
PREMIUM incluye:
1. [✅/❌] Lecturas ilimitadas
2. [✅/❌] Spreads exclusivos avanzados
3. [✅/❌] Interpretaciones más profundas
4. [✅/❌] Historial completo sin límite
5. [✅/❌] Export de lecturas (PDF, imagen)
6. [✅/❌] Sin ads (si hay ads para FREE)
7. [✅/❌] Prioridad en soporte
8. [Otro:_________________]
```

#### ¿Hay spreads o features exclusivos?
**Mi respuesta:**
```
Features exclusivos de PREMIUM:
- [Lista específica de lo que SOLO premium puede hacer]
```

#### ¿Cuál es el precio mensual?
**Mi respuesta:**
```
Precio: $_____ USD/mes (o la moneda que uses)
¿Hay plan anual? [Sí/No] → $_____ USD/año
¿Hay trial gratuito? [Sí/No] → ___ días
```

#### ¿Vale la pena? (honestamente)
**Mi análisis:**
```
Si yo fuera usuario FREE, ¿pagaría $X por PREMIUM?
- [Sí/No]
- ¿Por qué?: [Tu análisis honesto]
- Si la respuesta es "No", ¿qué falta para que valga la pena?
```

---

### Sobre Admin

#### ¿Qué necesitas monitorear del negocio?
**Mi respuesta:**
```
Como dueño del negocio, necesito ver:
- [ ] Total de usuarios (FREE vs PREMIUM)
- [ ] Ingresos mensuales (MRR)
- [ ] Tasa de conversión FREE → PREMIUM
- [ ] Lecturas realizadas por día/semana
- [ ] Usuarios activos diarios/mensuales (DAU/MAU)
- [ ] Churn rate (usuarios que cancelan)
- [ ] Spreads más populares
- [ ] [Otro:_________________]
```

#### ¿Qué configuraciones necesitas cambiar sin deploy?
**Mi respuesta:**
```
Necesito poder cambiar desde admin:
- [ ] Límites de lecturas FREE (ej: cambiar de 3 a 5)
- [ ] Precio de suscripción PREMIUM
- [ ] Activar/desactivar features (feature flags)
- [ ] Texto de modales de upgrade
- [ ] Mensajes de bienvenida
- [ ] [Otro:_________________]
```

#### ¿Necesitas gestionar contenido (cartas, interpretaciones)?
**Mi respuesta:**
```
¿Las interpretaciones de cartas son:
- [ ] Estáticas (hardcoded en el código) → No necesito CMS
- [ ] Configurables (necesito editarlas sin código) → SÍ necesito CMS

Si necesito CMS, quiero poder:
- [ ] Editar interpretaciones de cartas
- [ ] Agregar nuevos spreads
- [ ] Modificar descripciones
- [ ] [Otro:_________________]
```

---

## Paso 3: Identifica Gaps entre Realidad y Visión

### Cómo hacerlo

Una vez completados los pasos 1 y 2, compara:

**REALIDAD (lo que está implementado)** vs **VISIÓN (lo que quieres)**

### Formato para documentar gaps:

```markdown
- [ ] **GAP-1**: [Título corto del problema]
  - **Descripción**: [Explica qué falta o qué está mal]
  - **Impacto Negocio**: 🔴 Alto / 🟡 Medio / 🟢 Bajo
  - **Esfuerzo Técnico**: 🔴 Alto / 🟡 Medio / 🟢 Bajo
  - **Prioridad**: P0 (Crítico) / P1 (Importante) / P2 (Mejora)
  - **Acción**: Refactor / Nueva feature / Documentar decisión
```

### Ejemplo de Gap Real:

```markdown
- [ ] **GAP-1**: Usuarios FREE tienen límite de 3 cartas pero debería ser 5
  - **Descripción**: Actualmente FREE tiene 3 cartas/día pero según mi análisis de conversión, 5 cartas sería más apropiado para el funnel
  - **Impacto Negocio**: 🟡 Medio (afecta conversión FREE → PREMIUM)
  - **Esfuerzo Técnico**: 🟢 Bajo (cambiar constante en código)
  - **Prioridad**: P1 (Importante)
  - **Acción**: Refactor (cambiar límite hardcoded)
```

```markdown
- [ ] **GAP-2**: PREMIUM no tiene features exclusivos, solo "ilimitado"
  - **Descripción**: La propuesta de valor de PREMIUM es débil. Solo quita límites pero no agrega nada especial. Necesitamos spreads exclusivos o interpretaciones premium.
  - **Impacto Negocio**: 🔴 Alto (afecta justificación del precio)
  - **Esfuerzo Técnico**: 🟡 Medio (crear spreads + lógica de permisos)
  - **Prioridad**: P0 (Crítico)
  - **Acción**: Nueva feature (crear 2-3 spreads exclusivos PREMIUM)
```

---

## Paso 4: Prioriza con la Matriz de Impacto-Esfuerzo

Una vez tengas todos los gaps, ordénalos usando esta matriz:

```
         │ Esfuerzo Bajo │ Esfuerzo Medio │ Esfuerzo Alto │
─────────┼───────────────┼────────────────┼───────────────┤
Impacto  │   🟢 DO IT    │   🟡 PLANEAR   │  🔴 EVALUAR   │
Alto     │   (P0)        │   (P0/P1)      │  (P1/P2)      │
─────────┼───────────────┼────────────────┼───────────────┤
Impacto  │   🟢 RÁPIDO   │   🟡 CONSIDERAR│  🔴 EVITAR    │
Medio    │   (P1)        │   (P1/P2)      │  (P2/P3)      │
─────────┼───────────────┼────────────────┼───────────────┤
Impacto  │   🟢 NICE2HAVE│   🔴 EVITAR    │  🔴 NO HACER  │
Bajo     │   (P2)        │   (P3)         │  (P3)         │
```

### Decisión de priorización:

- **P0 (Crítico)**: Hacer AHORA (próximo sprint)
- **P1 (Importante)**: Hacer pronto (1-2 sprints)
- **P2 (Mejora)**: Backlog (cuando haya tiempo)
- **P3 (Nice-to-have)**: Considerar solo si sobra tiempo

---

## Paso 5: Comparte con Claude para Plan de Acción

Una vez completado, usa este prompt:

```
He completado el USER_STORIES_AUDIT.md con mis respuestas.

Identifiqué estos gaps:
1. [GAP-1: Descripción corta]
2. [GAP-2: Descripción corta]
3. [GAP-3: Descripción corta]
...

¿Puedes ayudarme a:
1. Validar si mis prioridades tienen sentido
2. Convertir los P0 y P1 en tasks técnicos
3. Crear un plan de implementación siguiendo TDD
```

---

## Tips para Completar el Audit

### ✅ Hacer:
- Ser brutalmente honesto sobre lo que falta
- Pensar como usuario, no como developer
- Validar si la propuesta de valor PREMIUM justifica el precio
- Priorizar según impacto en el negocio, no en "lo que es más fácil"

### ❌ Evitar:
- Justificar features mal implementados ("está bien así")
- Agregar features porque "están cool" sin pensar en el negocio
- Priorizar por esfuerzo técnico ignorando impacto
- Asumir que los usuarios entienden lo que hiciste sin explicación

---

## Ejemplo de Sesión Completa

### Antes de empezar (5 minutos)
```
Tengo 2 horas para hacer esto.
Voy a dividir:
- 30 min: Tabla resumen
- 60 min: Preguntas críticas
- 30 min: Identificar gaps
```

### Durante el trabajo
```
[Voy completando el documento en USER_STORIES_AUDIT.md]
[Anoto gaps que descubro en la sección correspondiente]
```

### Al terminar (próxima sesión con Claude)
```
Prompt: "He completado el audit. Revisemos juntos los gaps y prioricemos."
```

---

## Resultado Esperado

Al final de este proceso tendrás:

1. ✅ Visión clara de lo que HAY vs lo que QUIERES
2. ✅ Lista priorizada de gaps (P0, P1, P2)
3. ✅ Documentación del modelo de negocio (ANÓNIMO/FREE/PREMIUM)
4. ✅ Base para decisiones futuras de producto
5. ✅ Plan de acción para alinear código con negocio

---

**¿Listo para empezar?** Abre [USER_STORIES_AUDIT.md](USER_STORIES_AUDIT.md) y empieza por la Tabla Resumen. Tómate tu tiempo. Este trabajo te ahorrará semanas de desarrollo en la dirección equivocada.
