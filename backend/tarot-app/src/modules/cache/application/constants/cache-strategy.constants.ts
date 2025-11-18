/**
 * Constantes para la estrategia agresiva de caché
 */

/**
 * Niveles de caché multi-nivel
 */
export enum CacheLevel {
  /**
   * Nivel 1: Caché exacto - combinación exacta de cartas + pregunta
   */
  EXACT = 'exact',

  /**
   * Nivel 2: Caché de cartas - mismas cartas sin considerar pregunta
   */
  CARDS = 'cards',

  /**
   * Nivel 3: Caché de significados - significados base de cartas individuales
   */
  MEANINGS = 'meanings',
}

/**
 * TTLs dinámicos basados en popularidad (en días)
 */
export const DYNAMIC_TTL = {
  /**
   * Interpretaciones muy populares (hit_count > 10): 90 días
   */
  HIGH_POPULARITY: 90,

  /**
   * Interpretaciones medias (hit_count 3-10): 30 días
   */
  MEDIUM_POPULARITY: 30,

  /**
   * Interpretaciones poco usadas (hit_count < 3): 7 días
   */
  LOW_POPULARITY: 7,
};

/**
 * Umbrales de popularidad para TTL dinámico
 */
export const POPULARITY_THRESHOLD = {
  HIGH: 10,
  MEDIUM: 3,
};

/**
 * Configuración de fuzzy matching
 */
export const FUZZY_MATCHING = {
  /**
   * Similitud mínima para considerar dos preguntas como similares (0-1)
   * 0.8 = 80% de similitud
   */
  MIN_SIMILARITY: 0.8,

  /**
   * Palabras a ignorar en normalización de preguntas (artículos, preposiciones comunes)
   */
  STOP_WORDS: [
    'el',
    'la',
    'los',
    'las',
    'un',
    'una',
    'unos',
    'unas',
    'de',
    'del',
    'al',
    'en',
    'por',
    'para',
    'con',
    'sin',
    'a',
    'o',
    'y',
    'e',
    'u',
    'que',
    'cual',
    'mi',
    'tu',
    'su',
    'me',
    'te',
    'se',
  ],
};

/**
 * Configuración de cache warming
 */
export const CACHE_WARMING = {
  /**
   * Top N combinaciones de cartas más comunes a pre-generar
   */
  TOP_COMBINATIONS: 100,

  /**
   * Batch size para generación en background
   */
  BATCH_SIZE: 10,

  /**
   * Delay entre batches (ms) para no saturar IA
   */
  BATCH_DELAY_MS: 5000,
};

/**
 * Configuración de analytics
 */
export const CACHE_ANALYTICS = {
  /**
   * Ventana de tiempo para cálculo de hit rate (horas)
   */
  HIT_RATE_WINDOW_HOURS: 24,

  /**
   * Costo estimado por interpretación con OpenAI GPT-4 (USD)
   */
  OPENAI_COST_PER_INTERPRETATION: 0.0045,

  /**
   * Costo estimado por interpretación con DeepSeek (USD)
   */
  DEEPSEEK_COST_PER_INTERPRETATION: 0.0008,

  /**
   * Costo estimado por interpretación con Groq (USD)
   */
  GROQ_COST_PER_INTERPRETATION: 0.0,

  /**
   * Rate limit diario de Groq
   */
  GROQ_DAILY_RATE_LIMIT: 14400,

  /**
   * Tiempo de respuesta estimado de caché in-memory (ms)
   */
  ESTIMATED_CACHE_RESPONSE_TIME_MS: 50,

  /**
   * Tiempo de respuesta estimado promedio de AI provider (ms)
   */
  ESTIMATED_AI_RESPONSE_TIME_MS: 1500,
};
