# Uso de Spreads en Prompts de IA

## Descripción General

Los **spreads** (tipos de tiradas) definen la ESTRUCTURA de una lectura de tarot. Cada spread especifica:

- Cuántas cartas se utilizan
- Qué significa cada posición en la tirada
- El enfoque interpretativo de cada carta según su ubicación

La IA utiliza esta estructura + los significados de las cartas que salen en cada posición para generar interpretaciones coherentes y contextualizadas.

## Flujo de Interpretación

```
┌─────────────────┐
│ SPREAD          │ ──┐
│ (estructura)    │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │    ┌──────────────────────┐
│ CARTAS          │   ├───►│  PROMPT A OPENAI     │
│ (significados)  │   │    │  (contexto completo) │
└─────────────────┘   │    └──────────────────────┘
                      │             │
┌─────────────────┐   │             ▼
│ PREGUNTA USER   │ ──┘    ┌──────────────────────┐
│ (contexto)      │        │  INTERPRETACIÓN      │
└─────────────────┘        │  PERSONALIZADA       │
                           └──────────────────────┘
```

## Estructura del Prompt

### Ejemplo: Tirada de 3 Cartas

**Spread utilizado**: Tirada de 3 Cartas (Pasado-Presente-Futuro)

**Pregunta del usuario**: "¿Cómo va mi relación?" (Categoría: Amor)

**Cartas que salieron**:

```json
{
  "positions": [
    {
      "position": 1,
      "positionName": "Pasado",
      "positionDescription": "Eventos o influencias pasadas que llevaron a la situación actual",
      "interpretationFocus": "contexto histórico y causas",
      "card": {
        "name": "El Loco",
        "orientation": "upright",
        "meaningUpright": "Nuevos comienzos, espontaneidad, libertad, fe en el futuro"
      }
    },
    {
      "position": 2,
      "positionName": "Presente",
      "positionDescription": "La situación o energía actual",
      "interpretationFocus": "estado actual y circunstancias presentes",
      "card": {
        "name": "Los Enamorados",
        "orientation": "reversed",
        "meaningReversed": "Desalineación, conflicto de valores, desequilibrio en la relación"
      }
    },
    {
      "position": 3,
      "positionName": "Futuro",
      "positionDescription": "La tendencia o dirección probable",
      "interpretationFocus": "tendencia futura y resultado probable",
      "card": {
        "name": "La Torre",
        "orientation": "upright",
        "meaningUpright": "Cambios abruptos, revelaciones, destrucción necesaria para reconstrucción"
      }
    }
  ]
}
```

### Prompt Template Completo

```
SYSTEM:
Eres una tarotista experta con 20 años de experiencia. Tu estilo es empático, místico pero accesible, sin tecnicismos excesivos. Proporcionas lecturas que integran sabiduría tradicional del tarot con perspectivas psicológicas modernas.

USER:
**Pregunta**: "¿Cómo va mi relación?"
**Categoría**: Amor
**Spread**: Tirada de 3 Cartas

**Descripción del Spread**:
Una de las tiradas más populares y versátiles del tarot. Ofrece una visión temporal completa que conecta el pasado con el presente y proyecta hacia el futuro. Perfecta para entender el flujo de una situación.

**Cartas y Posiciones**:

**Posición 1 - PASADO** (contexto histórico y causas):
- Descripción de posición: "Eventos o influencias pasadas que llevaron a la situación actual"
- Carta: El Loco (derecha)
- Significado: Nuevos comienzos, espontaneidad, libertad, fe en el futuro

**Posición 2 - PRESENTE** (estado actual y circunstancias presentes):
- Descripción de posición: "La situación o energía actual"
- Carta: Los Enamorados (invertida)
- Significado invertido: Desalineación, conflicto de valores, desequilibrio en la relación

**Posición 3 - FUTURO** (tendencia futura y resultado probable):
- Descripción de posición: "La tendencia o dirección probable hacia donde se dirige la situación"
- Carta: La Torre (derecha)
- Significado: Cambios abruptos, revelaciones, destrucción necesaria para reconstrucción

**Instrucciones**:
Interpreta estas cartas considerando:
1. El significado de cada carta según su posición en el spread
2. El enfoque interpretativo específico de cada posición
3. La relación entre las cartas y el flujo temporal/energético
4. La pregunta y categoría del usuario

**Estructura de respuesta esperada**:
1. **Interpretación general** (2-3 párrafos): Integra todas las posiciones en una narrativa coherente
2. **Análisis posicional** (1 párrafo por carta): Explica cada carta en su posición específica
3. **Relaciones entre cartas** (1-2 párrafos): El flujo y conexiones entre pasado-presente-futuro
4. **Consejos prácticos** (lista de 2-3 puntos accionables)
5. **Conclusión final** (1 párrafo)

Límite de respuesta: 600 tokens máximo.
```

## Configuración por Tipo de Spread

### Tirada de 1 Carta

- **Tokens máximo**: 400
- **Estructura de respuesta**: Respuesta directa + Explicación (2 párrafos) + Consejo (1 párrafo)
- **Enfoque**: Mensaje central y directo

### Tirada de 3 Cartas

- **Tokens máximo**: 600
- **Estructura de respuesta**: Interpretación general + Análisis posicional + Relaciones + Consejos + Conclusión
- **Enfoque**: Flujo temporal (pasado-presente-futuro)

### Tirada de 5 Cartas

- **Tokens máximo**: 800
- **Estructura de respuesta**: Similar a 3 cartas pero con análisis más profundo de obstáculos y recursos
- **Enfoque**: Análisis completo de situación + desafíos + resultado

### Cruz Céltica (10 Cartas)

- **Tokens máximo**: 800
- **Estructura de respuesta**: Interpretación exhaustiva con múltiples dimensiones
- **Enfoque**: Visión 360° (consciente/inconsciente, interno/externo, esperanzas/miedos)

## Validaciones

Antes de enviar el prompt a OpenAI, el backend valida:

1. ✅ El número de cartas seleccionadas coincide con `cardCount` del spread
2. ✅ Cada carta tiene una posición válida (1 a cardCount)
3. ✅ Todas las posiciones están ocupadas (no hay gaps)
4. ✅ El spread existe y está activo en la base de datos

## Ejemplo de Código

```typescript
// En InterpretationsService

async generateInterpretation(
  question: string,
  category: string,
  spreadId: number,
  selectedCards: SelectedCard[]
): Promise<string> {
  // 1. Obtener el spread de la base de datos
  const spread = await this.spreadsService.findOne(spreadId);

  // 2. Validar que cardCount coincida
  if (selectedCards.length !== spread.cardCount) {
    throw new BadRequestException('Invalid number of cards for this spread');
  }

  // 3. Construir el prompt
  const prompt = this.buildPrompt(question, category, spread, selectedCards);

  // 4. Llamar a OpenAI
  const interpretation = await this.openAIService.complete(prompt, {
    maxTokens: this.getMaxTokens(spread.cardCount),
  });

  return interpretation;
}

private buildPrompt(
  question: string,
  category: string,
  spread: TarotSpread,
  cards: SelectedCard[]
): string {
  let prompt = `**Pregunta**: "${question}"\n`;
  prompt += `**Categoría**: ${category}\n`;
  prompt += `**Spread**: ${spread.name}\n\n`;
  prompt += `**Descripción del Spread**: ${spread.description}\n\n`;
  prompt += `**Cartas y Posiciones**:\n\n`;

  cards.forEach((selectedCard, index) => {
    const position = spread.positions[index];
    const card = selectedCard.card;
    const meaning = selectedCard.isReversed
      ? card.meaningReversed
      : card.meaningUpright;

    prompt += `**Posición ${position.position} - ${position.name.toUpperCase()}** `;
    prompt += `(${position.interpretation_focus}):\n`;
    prompt += `- Descripción de posición: "${position.description}"\n`;
    prompt += `- Carta: ${card.name} (${selectedCard.isReversed ? 'invertida' : 'derecha'})\n`;
    prompt += `- Significado: ${meaning}\n\n`;
  });

  prompt += this.getInstructions(spread.cardCount);

  return prompt;
}
```

## Beneficios de este Enfoque

1. **Coherencia**: Todas las interpretaciones siguen la misma estructura
2. **Contexto Rico**: La IA recibe información detallada sobre qué significa cada posición
3. **Flexibilidad**: Fácil agregar nuevos spreads sin cambiar código
4. **Calidad**: Los prompts bien estructurados generan mejores interpretaciones
5. **Escalabilidad**: El mismo sistema funciona para spreads de 1 a 10+ cartas
6. **Trazabilidad**: Cada interpretación está vinculada a un spread específico

## Futuras Mejoras

- [ ] Agregar ejemplos de interpretaciones exitosas al prompt (few-shot learning)
- [ ] Implementar variaciones de tono según la categoría (amor vs trabajo)
- [ ] Crear templates específicos por tipo de pregunta
- [ ] Agregar contexto de cartas adyacentes para lecturas más complejas
- [ ] Implementar sistema de feedback para mejorar prompts iterativamente
