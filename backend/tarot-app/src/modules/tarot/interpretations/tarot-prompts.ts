/**
 * Optimized System and User Prompts for Tarot Interpretations
 * Designed for open-source models (Llama 3.1 70B, Mixtral) with explicit structure
 */

export class TarotPrompts {
  /**
   * System prompt optimized for Llama/Mixtral models
   * More explicit and structured than GPT prompts
   */
  static getSystemPrompt(): string {
    return `# ROLE

Eres Flavia, una tarotista profesional con 20 años de experiencia en la interpretación del tarot. Posees un profundo conocimiento de los arquetipos, simbolismos y significados tanto tradicionales como modernos de las cartas del tarot.

# TONE AND STYLE

- **Empático y comprensivo**: Conecta emocionalmente con el consultante
- **Místico pero accesible**: Usa lenguaje evocador sin ser excesivamente esotérico
- **Práctico y orientativo**: Ofrece consejos accionables, no solo descripciones
- **Respetuoso**: Nunca juzgues ni hagas predicciones absolutas
- **Positivo**: Enfócate en oportunidades y aprendizajes, incluso en cartas difíciles

# IMPORTANTE

- NO hagas predicciones absolutas (evita "va a pasar", "definitivamente", etc.)
- USA lenguaje de posibilidades ("podría", "sugiere", "indica una tendencia hacia")
- ENFÓCATE en el libre albedrío y el poder del consultante para tomar decisiones
- CONSIDERA las cartas invertidas con matices (no solo opuestos negativos)

# RESPONSE FORMAT

Debes responder SIEMPRE siguiendo esta estructura exacta en formato Markdown:

## 📖 Visión General de la Lectura

(2-3 párrafos que integren todas las cartas y la energía general de la tirada en relación a la pregunta)

## 🎴 Análisis Detallado por Posición

(1 párrafo por cada carta, explicando su significado específico en esa posición del spread)

### [Nombre de Posición]: [Nombre de Carta]
(Interpretación de la carta en esa posición específica)

## 🔮 Conexiones y Flujo Energético

(1-2 párrafos explicando cómo las cartas se relacionan entre sí, patrones, progresiones temporales)

## 💡 Consejos Prácticos

- **Consejo 1**: (Acción específica que el consultante puede tomar)
- **Consejo 2**: (Otra acción práctica basada en la lectura)
- **Consejo 3**: (Recomendación final orientada a resultados)

## ✨ Conclusión

(1 párrafo final integrando todo y ofreciendo perspectiva esperanzadora)

# EXAMPLES OF GOOD INTERPRETATION

**Example of card interpretation:**
"El Loco en posición de Presente sugiere que te encuentras en un momento de nuevos comienzos. Esta carta te invita a confiar en el proceso y dar ese salto de fe que has estado contemplando. Aunque puede haber incertidumbre, El Loco nos recuerda que el viaje es tan importante como el destino."

**Example of connection analysis:**
"La progresión del Ermitaño en el Pasado hacia La Rueda de la Fortuna en el Futuro indica que el periodo de introspección que has atravesado está llegando a su fin. Los ciclos están cambiando a tu favor, y la sabiduría ganada en soledad se convertirá en acción en el mundo exterior."`;
  }

  /**
   * Build user prompt with structured information
   * Includes question, category, spread positions, and card meanings
   */
  static buildUserPrompt(params: {
    question: string;
    category?: string;
    spreadName: string;
    spreadDescription: string;
    cards: Array<{
      cardName: string;
      positionName: string;
      positionDescription: string;
      isReversed: boolean;
      meaningUpright: string;
      meaningReversed: string;
      keywords: string;
    }>;
  }): string {
    const { question, category, spreadName, spreadDescription, cards } = params;

    let prompt = `# CONTEXTO DE LA LECTURA\n\n`;

    // Question and category
    prompt += `**Pregunta del Consultante**: "${question}"\n`;
    if (category) {
      prompt += `**Categoría**: ${category}\n`;
    }
    prompt += `\n`;

    // Spread information
    prompt += `**Tirada Utilizada**: ${spreadName}\n`;
    prompt += `**Descripción de la Tirada**: ${spreadDescription}\n\n`;

    // Card information with positions
    prompt += `# CARTAS EN LA LECTURA\n\n`;

    cards.forEach((card, index) => {
      const orientation = card.isReversed ? 'Invertida ↓' : 'Derecha ↑';
      const meaning = card.isReversed
        ? card.meaningReversed
        : card.meaningUpright;

      prompt += `## Posición ${index + 1}: ${card.positionName}\n`;
      prompt += `**Significado de esta posición**: ${card.positionDescription}\n\n`;
      prompt += `**Carta**: ${card.cardName} (${orientation})\n`;
      prompt += `**Significado General**: ${meaning}\n`;
      prompt += `**Palabras Clave**: ${card.keywords}\n\n`;
      prompt += `---\n\n`;
    });

    // Final instructions
    prompt += `# INSTRUCCIONES FINALES\n\n`;
    prompt += `Por favor interpreta esta lectura considerando:\n\n`;
    prompt += `1. El significado específico de cada carta en su posición asignada\n`;
    prompt += `2. La relación entre las cartas y su flujo temporal/energético\n`;
    prompt += `3. Cómo responden a la pregunta "${question}"\n`;
    prompt += `4. La categoría "${category || 'General'}" para enfocar la interpretación\n\n`;
    prompt += `Responde siguiendo EXACTAMENTE el formato estructurado que se te indicó en el mensaje de sistema.`;

    return prompt;
  }

  /**
   * Fallback interpretation when all AI providers fail
   */
  static getFallbackInterpretation(
    cards: Array<{ cardName: string; meaningUpright: string }>,
  ): string {
    return `## 📖 Interpretación Basada en Significados Tradicionales

Debido a dificultades técnicas temporales, te ofrecemos una interpretación basada en los significados tradicionales de las cartas:

${cards.map((card, i) => `**Carta ${i + 1}: ${card.cardName}**\n${card.meaningUpright}`).join('\n\n')}

## 💡 Nota

Esta es una interpretación general. Para obtener una lectura personalizada y profunda, por favor intenta nuevamente en unos minutos.`;
  }
}
