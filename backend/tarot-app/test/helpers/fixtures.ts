/**
 * Test Fixtures - Datos comunes de prueba
 *
 * Fixtures reutilizables para mantener consistencia en los datos de prueba.
 * Usar estos en lugar de crear datos manualmente en cada test.
 */

export const MOCK_USERS = {
  admin: {
    id: 1,
    email: 'admin@test.com',
    password: 'Admin1234!',
    name: 'Admin User',
    isAdmin: true,
    plan: 'free' as const,
  },
  premiumUser: {
    id: 2,
    email: 'premium@test.com',
    password: 'Premium1234!',
    name: 'Premium User',
    isAdmin: false,
    plan: 'premium' as const,
  },
  freeUser: {
    id: 3,
    email: 'free@test.com',
    password: 'Free1234!',
    name: 'Free User',
    isAdmin: false,
    plan: 'free' as const,
  },
  bannedUser: {
    id: 4,
    email: 'banned@test.com',
    password: 'Banned1234!',
    name: 'Banned User',
    isAdmin: false,
    plan: 'free' as const,
    isBannedFlag: true,
    banReason: 'Test ban',
  },
};

export const MOCK_CARDS = {
  theFool: {
    id: 1,
    name: 'The Fool',
    number: 0,
    category: 'arcanos_mayores',
    meaningUpright: 'New beginnings, innocence, spontaneity',
    meaningReversed: 'Recklessness, fear of commitment',
    keywords: 'beginning,freedom,adventure',
    description:
      'The Fool represents new beginnings and taking a leap of faith',
  },
  theMagician: {
    id: 2,
    name: 'The Magician',
    number: 1,
    category: 'arcanos_mayores',
    meaningUpright: 'Manifestation, resourcefulness, power',
    meaningReversed: 'Manipulation, poor planning',
    keywords: 'manifestation,power,skill',
    description: 'The Magician represents the power to manifest your desires',
  },
  theHighPriestess: {
    id: 3,
    name: 'The High Priestess',
    number: 2,
    category: 'arcanos_mayores',
    meaningUpright: 'Intuition, sacred knowledge, divine feminine',
    meaningReversed: 'Secrets, disconnected from intuition',
    keywords: 'intuition,mystery,wisdom',
    description: 'The High Priestess represents intuition and inner wisdom',
  },
};

export const MOCK_SPREADS = {
  threeCard: {
    id: 1,
    name: 'Three Card Spread',
    description: 'Past, Present, Future',
    cardCount: 3,
    difficulty: 'beginner' as const,
    isBeginnerFriendly: true,
    whenToUse: 'General guidance and quick answers',
    positions: [
      { name: 'Past', description: 'Past influences' },
      { name: 'Present', description: 'Current situation' },
      { name: 'Future', description: 'Future outcome' },
    ],
  },
  singleCard: {
    id: 2,
    name: 'Single Card',
    description: 'One card for quick guidance',
    cardCount: 1,
    difficulty: 'beginner' as const,
    isBeginnerFriendly: true,
    whenToUse: 'Daily guidance or simple yes/no questions',
    positions: [{ name: 'Answer', description: 'The answer to your question' }],
  },
  celticCross: {
    id: 3,
    name: 'Celtic Cross',
    description: 'Comprehensive 10-card spread',
    cardCount: 10,
    difficulty: 'advanced' as const,
    isBeginnerFriendly: false,
    whenToUse: 'Deep insight into complex situations',
    positions: [
      { name: 'Present', description: 'Current situation' },
      { name: 'Challenge', description: 'Immediate challenge' },
      { name: 'Past', description: 'Past influences' },
      { name: 'Future', description: 'Future influences' },
      { name: 'Above', description: 'Conscious goal' },
      { name: 'Below', description: 'Unconscious influences' },
      { name: 'Advice', description: 'Advice' },
      { name: 'External', description: 'External influences' },
      { name: 'Hopes', description: 'Hopes and fears' },
      { name: 'Outcome', description: 'Final outcome' },
    ],
  },
};

export const MOCK_READINGS = {
  basicReading: {
    id: 1,
    userId: 3,
    spreadId: 1,
    question: 'What should I focus on today?',
    category: 'General',
    isShared: false,
    shareToken: null,
    cardPositions: [
      { cardId: 1, position: 'Past', isReversed: false },
      { cardId: 2, position: 'Present', isReversed: false },
      { cardId: 3, position: 'Future', isReversed: true },
    ],
  },
  sharedReading: {
    id: 2,
    userId: 2,
    spreadId: 1,
    question: 'Career guidance',
    category: 'Career',
    isShared: true,
    shareToken: 'test-share-token-123',
    cardPositions: [
      { cardId: 1, position: 'Past', isReversed: false },
      { cardId: 2, position: 'Present', isReversed: false },
      { cardId: 3, position: 'Future', isReversed: false },
    ],
  },
};

export const MOCK_JWT_PAYLOAD = {
  admin: {
    email: 'admin@test.com',
    sub: 1,
    isAdmin: true,
    roles: ['admin', 'user'],
    plan: 'free',
  },
  premiumUser: {
    email: 'premium@test.com',
    sub: 2,
    isAdmin: false,
    roles: ['user'],
    plan: 'premium',
  },
  freeUser: {
    email: 'free@test.com',
    sub: 3,
    isAdmin: false,
    roles: ['user'],
    plan: 'free',
  },
};

export const MOCK_AI_RESPONSE = {
  content: `## 📖 Visión General de la Lectura

Esta lectura muestra un momento de transición importante en tu vida.

## 🎴 Análisis Detallado por Posición

### Past: The Fool
En el pasado, iniciaste un nuevo camino con inocencia y esperanza.

### Present: The Magician
Ahora tienes el poder y las herramientas para manifestar tus deseos.

### Future: The High Priestess (Reversed)
En el futuro, podrías necesitar reconectar con tu intuición.

## 🔮 Conexiones y Flujo Energético

Las cartas muestran una progresión desde la inocencia hacia el dominio personal.

## 💡 Consejos Prácticos

- Confía en tu capacidad para crear tu realidad
- Escucha tu intuición interior
- Mantén el equilibrio entre acción e introspección

## ✨ Conclusión

Esta lectura te invita a usar tu poder personal mientras mantienes conexión con tu sabiduría interior.`,
  provider: 'groq',
  model: 'llama-3.1-70b-versatile',
  tokensUsed: {
    prompt: 150,
    completion: 200,
    total: 350,
  },
  durationMs: 1500,
};

export const MOCK_USAGE_LIMITS = {
  free: {
    readings: 5,
    interpretations: 5,
  },
  premium: {
    readings: -1, // unlimited
    interpretations: -1, // unlimited
  },
};

/**
 * Fechas estándar para pruebas
 */
export const MOCK_DATES = {
  now: new Date('2025-11-19T10:00:00Z'),
  yesterday: new Date('2025-11-18T10:00:00Z'),
  tomorrow: new Date('2025-11-20T10:00:00Z'),
  lastWeek: new Date('2025-11-12T10:00:00Z'),
  nextWeek: new Date('2025-11-26T10:00:00Z'),
};

/**
 * IP addresses y user agents para pruebas
 */
export const MOCK_REQUEST_DATA = {
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0 (Test Browser)',
};
