# 🔮 Flujo de Lectura de Tarot con IA

## Resumen Conceptual

El sistema de lecturas de tarot combina **3 fuentes de datos** para generar interpretaciones con IA:

1. **Cartas del Tarot** (78 cartas con significados) → TASK-004
2. **Spreads/Tiradas** (estructura posicional) → TASK-006
3. **Pregunta del Usuario** (contexto y categoría) → Input del usuario

---

## ¿Cómo funcionan los Spreads?

Los **spreads** NO son interpretaciones, son **estructuras** que definen:

- Cuántas cartas se usan
- Qué significa cada posición
- Cómo se relacionan entre sí

### Ejemplo: Tirada de 3 Cartas

```json
{
  "name": "Tirada de 3 Cartas",
  "card_count": 3,
  "positions": [
    {
      "position": 1,
      "name": "Pasado",
      "description": "Eventos o influencias que llevaron a la situación actual",
      "interpretation_focus": "contexto histórico"
    },
    {
      "position": 2,
      "name": "Presente",
      "description": "La situación o energía actual",
      "interpretation_focus": "estado actual"
    },
    {
      "position": 3,
      "name": "Futuro",
      "description": "Tendencia o posible resultado",
      "interpretation_focus": "proyección"
    }
  ]
}
```

---

## Flujo Completo de una Lectura

### 1. Usuario solicita lectura

```javascript
POST /readings
{
  "spreadId": 2,  // Tirada de 3 cartas
  "question": "¿Cómo va mi relación?",
  "categoryId": 1  // Amor
}
```

### 2. Backend selecciona cartas aleatorias

```javascript
// El sistema baraja y selecciona 3 cartas al azar
const selectedCards = [
  {
    card: 'El Loco',
    position: 1,
    isReversed: false,
    meaning_upright: 'Nuevos comienzos, espontaneidad, libertad',
    meaning_reversed: 'Imprudencia, caos, miedo al cambio',
  },
  {
    card: 'Los Enamorados',
    position: 2,
    isReversed: true, // Salió invertida
    meaning_upright: 'Amor, unión, elecciones importantes',
    meaning_reversed:
      'Desalineación, conflicto de valores, elecciones difíciles',
  },
  {
    card: 'La Torre',
    position: 3,
    isReversed: false,
    meaning_upright: 'Cambios abruptos, revelaciones, destrucción necesaria',
    meaning_reversed: 'Evitar el cambio, catástrofe inminente',
  },
];
```

### 3. Backend construye el prompt para OpenAI

```javascript
const systemPrompt = `
Eres una tarotista experta con 20 años de experiencia. 
Tu trabajo es interpretar lecturas de tarot con empatía, 
claridad y un toque místico pero accesible.
`;

const userPrompt = `
LECTURA DE TAROT

Pregunta del consultante: "¿Cómo va mi relación?"
Categoría: Amor
Spread utilizado: Tirada de 3 Cartas (Pasado-Presente-Futuro)

CARTAS OBTENIDAS:

Posición 1: PASADO (Contexto histórico)
├─ Carta: El Loco (derecha)
└─ Significado: Nuevos comienzos, espontaneidad, libertad

Posición 2: PRESENTE (Situación actual)
├─ Carta: Los Enamorados (INVERTIDA)
└─ Significado: Desalineación, conflicto de valores, elecciones difíciles

Posición 3: FUTURO (Tendencia)
├─ Carta: La Torre (derecha)
└─ Significado: Cambios abruptos, revelaciones, destrucción necesaria

INSTRUCCIONES:
Proporciona una interpretación coherente que:
1. Integre el significado de cada carta CON su posición específica
2. Analice el flujo temporal (pasado → presente → futuro)
3. Responda directamente a la pregunta del usuario
4. Ofrezca consejos prácticos y empáticos

Estructura tu respuesta en:
- Visión general (2 párrafos)
- Análisis por posición (1 párrafo por carta)
- Relaciones entre cartas (1 párrafo)
- Consejos (2-3 puntos)
- Conclusión (1 párrafo)

Límite: 600 tokens máximo.
`;
```

### 4. OpenAI genera la interpretación

La IA lee el prompt y entiende:

- **El Loco en PASADO** → La relación comenzó con espontaneidad
- **Los Enamorados invertida en PRESENTE** → Ahora hay conflicto de valores
- **La Torre en FUTURO** → Se avecina un cambio importante

Y genera una interpretación coherente que conecta estos elementos.

### 5. Backend guarda la lectura

```javascript
{
  "id": 123,
  "userId": 456,
  "spreadId": 2,
  "categoryId": 1,
  "question": "¿Cómo va mi relación?",
  "cards": [
    { "cardId": 0, "position": 1, "isReversed": false },
    { "cardId": 6, "position": 2, "isReversed": true },
    { "cardId": 16, "position": 3, "isReversed": false }
  ],
  "interpretation": {
    "text": "Tu relación comenzó con una energía de libertad...",
    "aiModel": "gpt-4",
    "tokensUsed": 542
  }
}
```

---

## ¿Por qué necesitamos seeds de Spreads?

**Respuesta corta:** Para que la IA sepa qué significa cada posición.

**Sin spreads:**

```
Tienes 3 cartas: El Loco, Los Enamorados, La Torre.
→ La IA solo puede describir 3 cartas sin contexto posicional
```

**Con spreads:**

```
Posición PASADO: El Loco → La IA entiende que esto representa el origen
Posición PRESENTE: Los Enamorados → La IA entiende que es el estado actual
Posición FUTURO: La Torre → La IA entiende que es la tendencia
→ La IA puede crear una narrativa temporal coherente
```

---

## Seeds Necesarios vs Innecesarios

### ✅ Seeds NECESARIOS:

1. **Cartas (78)** → Significados base de cada carta
2. **Spreads (3-4)** → Estructura de tiradas más comunes
3. **Categorías (6)** → Clasificación de preguntas

### ❌ Seeds INNECESARIOS:

- ~~Interpretaciones pre-escritas~~ → La IA las genera dinámicamente
- ~~Combinaciones de cartas~~ → La IA las analiza según el contexto
- ~~Respuestas predefinidas~~ → Cada lectura es única

---

## Resumen

```
SEEDS (Datos estáticos)
├─ 78 Cartas con significados
├─ 3-4 Spreads con posiciones
└─ 6 Categorías

       ↓

USUARIO hace pregunta
       ↓

BACKEND selecciona cartas aleatorias
       ↓

BACKEND construye prompt = Spread + Cartas + Pregunta
       ↓

OPENAI genera interpretación única
       ↓

BACKEND guarda lectura completa
```

**Conclusión:** Los spreads son ESENCIALES porque dan contexto posicional, pero NO son interpretaciones fijas. La IA crea la interpretación combinando:

- Estructura del spread (posiciones)
- Significados de las cartas (base de datos)
- Pregunta del usuario (contexto)

Cada lectura es **única** aunque uses el mismo spread múltiples veces.
