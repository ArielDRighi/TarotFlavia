/**
 * Prompts para generar interpretaciones numerológicas personalizadas con IA
 *
 * Este módulo contiene el prompt del sistema y la función para construir
 * el prompt del usuario basado en los números calculados.
 */

const MASTER_NUMBERS = [11, 22, 33];

/**
 * Prompt del sistema que define el rol y reglas para la IA
 */
export const NUMEROLOGY_SYSTEM_PROMPT = `Eres un numerólogo experto con décadas de experiencia en interpretación de perfiles numerológicos.
Tu tarea es crear una interpretación personalizada y profunda basada en la combinación única de números del consultante.

REGLAS:
- Escribe en español, con un tono cálido pero profesional
- Relaciona los diferentes números entre sí, mostrando cómo se complementan o desafían
- Sé específico y evita generalidades vagas
- Incluye consejos prácticos basados en los números
- La interpretación debe ser de 400-600 palabras
- Usa formato markdown con encabezados para organizar la respuesta
- NO inventes números ni datos que no se te proporcionaron`;

/**
 * Verifica si un número es maestro
 */
function isMasterNumber(num: number | null): boolean {
  if (num === null) return false;
  return MASTER_NUMBERS.includes(num);
}

/**
 * Interfaz para los datos necesarios para construir el prompt del usuario
 */
export interface NumerologyPromptData {
  lifePath: number;
  birthdayNumber: number;
  expressionNumber: number | null;
  soulUrge: number | null;
  personality: number | null;
  personalYear: number;
  fullName: string | null;
}

/**
 * Construye el prompt del usuario con los números calculados
 * Incluye instrucciones detalladas sobre la estructura de la respuesta
 */
export function buildNumerologyUserPrompt(data: NumerologyPromptData): string {
  const hasNameNumbers = data.expressionNumber !== null;
  const currentYear = new Date().getFullYear();

  let prompt = `Genera una interpretación numerológica personalizada para el siguiente perfil:

## NÚMEROS DEL CONSULTANTE

### Desde la fecha de nacimiento:
- **Camino de Vida:** ${data.lifePath}${isMasterNumber(data.lifePath) ? ' (Número Maestro)' : ''}
- **Número del Día:** ${data.birthdayNumber}${isMasterNumber(data.birthdayNumber) ? ' (Número Maestro)' : ''}
- **Año Personal ${currentYear}:** ${data.personalYear}
`;

  if (hasNameNumbers && data.fullName) {
    prompt += `
### Desde el nombre (${data.fullName}):
- **Expresión/Destino:** ${data.expressionNumber}${isMasterNumber(data.expressionNumber) ? ' (Número Maestro)' : ''}
- **Número del Alma:** ${data.soulUrge}${isMasterNumber(data.soulUrge) ? ' (Número Maestro)' : ''}
- **Personalidad:** ${data.personality}${isMasterNumber(data.personality) ? ' (Número Maestro)' : ''}
`;
  } else {
    prompt += `
### Sin números de nombre disponibles
(Solo se proporcionó fecha de nacimiento)
`;
  }

  prompt += `
## ESTRUCTURA DE LA RESPUESTA

Organiza tu interpretación así:

### 🌟 Tu Esencia Numerológica
(Resumen de quién eres según tus números principales)

### 🛤️ Tu Camino de Vida (${data.lifePath})
(Propósito, lecciones de vida, dirección)
`;

  if (hasNameNumbers) {
    prompt += `
### 💫 Tu Potencial y Deseos Internos
(Cómo se relacionan Expresión, Alma y Personalidad)
`;
  }

  prompt += `
### 📅 Tu Ciclo Actual (Año Personal ${data.personalYear})
(Qué energías predominan este año, qué cultivar)

### 💡 Consejos Prácticos
(3-4 recomendaciones específicas basadas en tus números)`;

  return prompt;
}
