/**
 * Advanced Test Fixtures - Edge Cases & Complex Scenarios
 *
 * Este archivo contiene fixtures para casos edge, escenarios complejos
 * y situaciones menos comunes que requieren pruebas específicas.
 *
 * Úsalo cuando necesites probar:
 * - Validaciones de límites
 * - Condiciones de error
 * - Datos malformados
 * - Situaciones extremas
 */

import { UserPlan } from '../../src/modules/users/entities/user.entity';

/**
 * Usuarios con casos edge
 */
export const EDGE_CASE_USERS = {
  // Usuario con email extremadamente largo (límite de validación)
  longEmail: {
    id: 100,
    email: 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com', // ~105 caracteres
    password: 'Test1234!',
    name: 'Long Email User',
    isAdmin: false,
    plan: UserPlan.FREE,
  },

  // Usuario con nombre muy corto
  shortName: {
    id: 101,
    email: 'short@test.com',
    password: 'Test1234!',
    name: 'A', // Nombre de 1 carácter
    isAdmin: false,
    plan: UserPlan.FREE,
  },

  // Usuario con nombre muy largo
  longName: {
    id: 102,
    email: 'longname@test.com',
    password: 'Test1234!',
    name: 'A'.repeat(100), // Nombre de 100 caracteres
    isAdmin: false,
    plan: UserPlan.FREE,
  },

  // Usuario recién creado sin último login
  neverLoggedIn: {
    id: 103,
    email: 'neverlogin@test.com',
    password: 'Test1234!',
    name: 'Never Logged In User',
    isAdmin: false,
    plan: UserPlan.FREE,
    lastLogin: null,
  },

  // Usuario con último login hace mucho tiempo (cuenta inactiva)
  inactiveUser: {
    id: 104,
    email: 'inactive@test.com',
    password: 'Test1234!',
    name: 'Inactive User',
    isAdmin: false,
    plan: UserPlan.PREMIUM,
    lastLogin: new Date('2020-01-01T00:00:00Z'), // 5 años atrás
  },

  // Usuario baneado con razón muy larga
  bannedLongReason: {
    id: 105,
    email: 'bannedlong@test.com',
    password: 'Test1234!',
    name: 'Banned User Long Reason',
    isAdmin: false,
    plan: UserPlan.FREE,
    isBannedFlag: true,
    banReason: 'Reason '.repeat(50), // ~350 caracteres
  },

  // Usuario baneado sin razón
  bannedNoReason: {
    id: 106,
    email: 'bannednoreason@test.com',
    password: 'Test1234!',
    name: 'Banned User No Reason',
    isAdmin: false,
    plan: UserPlan.FREE,
    isBannedFlag: true,
    banReason: null,
  },

  // Usuario premium recién actualizado (posible edge case en límites)
  newPremium: {
    id: 107,
    email: 'newpremium@test.com',
    password: 'Test1234!',
    name: 'New Premium User',
    isAdmin: false,
    plan: UserPlan.PREMIUM,
    lastLogin: new Date(), // Recién logueado
  },

  // Usuario admin sin permisos especiales (edge case de roles)
  adminWithoutPerms: {
    id: 108,
    email: 'adminlimited@test.com',
    password: 'Test1234!',
    name: 'Limited Admin',
    isAdmin: true,
    plan: UserPlan.FREE, // Admin pero plan free (posible edge case)
  },

  // Email con caracteres especiales permitidos
  specialCharsEmail: {
    id: 109,
    email: 'user+test.name_123@test-domain.com',
    password: 'Test1234!',
    name: 'Special Chars User',
    isAdmin: false,
    plan: UserPlan.FREE,
  },
};

/**
 * Lecturas con casos edge
 */
export const EDGE_CASE_READINGS = {
  // Lectura con pregunta extremadamente larga
  longQuestion: {
    id: 200,
    userId: 3,
    spreadId: 1,
    question: 'Q'.repeat(500), // Pregunta de 500 caracteres
    customQuestion: 'Q'.repeat(500),
    cardPositions: [
      { cardId: 1, position: 'Past', isReversed: false },
      { cardId: 2, position: 'Present', isReversed: false },
      { cardId: 3, position: 'Future', isReversed: false },
    ],
  },

  // Lectura con pregunta muy corta (1 carácter)
  shortQuestion: {
    id: 201,
    userId: 3,
    spreadId: 1,
    question: '?',
    customQuestion: '?',
    cardPositions: [{ cardId: 1, position: 'Past', isReversed: false }],
  },

  // Lectura sin interpretación generada (fallo de AI)
  noInterpretation: {
    id: 202,
    userId: 3,
    spreadId: 1,
    question: 'What is my future?',
    interpretation: null,
    tarotistaId: null,
    cardPositions: [
      { cardId: 1, position: 'Past', isReversed: false },
      { cardId: 2, position: 'Present', isReversed: false },
      { cardId: 3, position: 'Future', isReversed: false },
    ],
  },

  // Lectura con todas las cartas invertidas
  allReversed: {
    id: 203,
    userId: 3,
    spreadId: 1,
    question: 'Guidance needed',
    cardPositions: [
      { cardId: 1, position: 'Past', isReversed: true },
      { cardId: 2, position: 'Present', isReversed: true },
      { cardId: 3, position: 'Future', isReversed: true },
    ],
  },

  // Lectura compartida con token muy largo
  longShareToken: {
    id: 204,
    userId: 2,
    spreadId: 1,
    question: 'Career guidance',
    isPublic: true,
    sharedToken: 'a'.repeat(100), // Token de 100 caracteres
    cardPositions: [{ cardId: 1, position: 'Past', isReversed: false }],
  },

  // Lectura con máximas regeneraciones permitidas
  maxRegenerations: {
    id: 205,
    userId: 2,
    spreadId: 1,
    question: 'Should I change jobs?',
    regenerationCount: 5, // Máximo permitido
    cardPositions: [
      { cardId: 1, position: 'Past', isReversed: false },
      { cardId: 2, position: 'Present', isReversed: false },
      { cardId: 3, position: 'Future', isReversed: false },
    ],
  },

  // Lectura con máximas vistas
  highViewCount: {
    id: 206,
    userId: 2,
    spreadId: 1,
    question: 'Popular reading',
    isPublic: true,
    sharedToken: 'popular-token',
    viewCount: 9999,
    cardPositions: [{ cardId: 1, position: 'Past', isReversed: false }],
  },

  // Lectura soft-deleted hace poco (posible restauración)
  recentlyDeleted: {
    id: 207,
    userId: 3,
    spreadId: 1,
    question: 'Deleted reading',
    deletedAt: new Date(Date.now() - 60000), // Eliminada hace 1 minuto
    cardPositions: [{ cardId: 1, position: 'Past', isReversed: false }],
  },

  // Lectura soft-deleted hace mucho tiempo
  oldDeleted: {
    id: 208,
    userId: 3,
    spreadId: 1,
    question: 'Old deleted reading',
    deletedAt: new Date('2020-01-01T00:00:00Z'), // Eliminada hace años
    cardPositions: [{ cardId: 1, position: 'Past', isReversed: false }],
  },

  // Lectura con spread de 10 cartas (Celtic Cross completo)
  celticCrossFull: {
    id: 209,
    userId: 2,
    spreadId: 3,
    question: 'Deep life analysis',
    cardPositions: [
      { cardId: 1, position: 'Present', isReversed: false },
      { cardId: 2, position: 'Challenge', isReversed: true },
      { cardId: 3, position: 'Past', isReversed: false },
      { cardId: 4, position: 'Future', isReversed: false },
      { cardId: 5, position: 'Above', isReversed: true },
      { cardId: 6, position: 'Below', isReversed: false },
      { cardId: 7, position: 'Advice', isReversed: false },
      { cardId: 8, position: 'External', isReversed: true },
      { cardId: 9, position: 'Hopes', isReversed: false },
      { cardId: 10, position: 'Outcome', isReversed: false },
    ],
  },

  // Lectura con interpretación extremadamente larga
  longInterpretation: {
    id: 210,
    userId: 2,
    spreadId: 1,
    question: 'Detailed reading',
    interpretation: '# Interpretation\n\n' + 'Long text. '.repeat(500), // ~5KB
    cardPositions: [{ cardId: 1, position: 'Past', isReversed: false }],
  },
};

/**
 * Spreads con casos edge
 */
export const EDGE_CASE_SPREADS = {
  // Spread con máximo número de cartas
  maxCards: {
    id: 300,
    name: 'Maximum Card Spread',
    description: 'Spread with maximum allowed cards',
    cardCount: 78, // Baraja completa
    difficulty: 'advanced' as const,
    isBeginnerFriendly: false,
    whenToUse: 'Extremely detailed readings',
    positions: Array.from({ length: 78 }, (_, i) => ({
      name: `Position ${i + 1}`,
      description: `Card position ${i + 1}`,
    })),
  },

  // Spread con nombre muy largo
  longName: {
    id: 301,
    name: 'N'.repeat(100), // Nombre de 100 caracteres
    description: 'Spread with very long name',
    cardCount: 3,
    difficulty: 'beginner' as const,
    isBeginnerFriendly: true,
    whenToUse: 'Testing edge cases',
    positions: [
      { name: 'Past', description: 'Past influences' },
      { name: 'Present', description: 'Current situation' },
      { name: 'Future', description: 'Future outcome' },
    ],
  },

  // Spread con descripción muy larga
  longDescription: {
    id: 302,
    name: 'Long Description Spread',
    description: 'D'.repeat(500), // Descripción de 500 caracteres
    cardCount: 3,
    difficulty: 'intermediate' as const,
    isBeginnerFriendly: false,
    whenToUse: 'Testing',
    positions: [
      { name: 'Past', description: 'Past influences' },
      { name: 'Present', description: 'Current situation' },
      { name: 'Future', description: 'Future outcome' },
    ],
  },

  // Spread sin whenToUse (campo opcional)
  noWhenToUse: {
    id: 303,
    name: 'No When To Use',
    description: 'Spread without whenToUse field',
    cardCount: 1,
    difficulty: 'beginner' as const,
    isBeginnerFriendly: true,
    whenToUse: '', // Campo vacío
    positions: [{ name: 'Answer', description: 'The answer' }],
  },
};

/**
 * Cartas con casos edge
 */
export const EDGE_CASE_CARDS = {
  // Carta con keywords muy largos
  longKeywords: {
    id: 400,
    name: 'Long Keywords Card',
    number: 0,
    category: 'arcanos_mayores',
    meaningUpright: 'Upright meaning',
    meaningReversed: 'Reversed meaning',
    keywords: 'keyword,'.repeat(50), // ~450 caracteres
    description: 'Card with very long keywords',
  },

  // Carta con significados muy largos
  longMeanings: {
    id: 401,
    name: 'Long Meanings Card',
    number: 1,
    category: 'arcanos_mayores',
    meaningUpright: 'M'.repeat(500), // 500 caracteres
    meaningReversed: 'M'.repeat(500), // 500 caracteres
    keywords: 'test',
    description: 'Card with very long meanings',
  },

  // Carta con descripción muy corta
  shortDescription: {
    id: 402,
    name: 'Short Description Card',
    number: 2,
    category: 'arcanos_menores',
    meaningUpright: 'Upright',
    meaningReversed: 'Reversed',
    keywords: 'test',
    description: 'A', // Descripción de 1 carácter
  },

  // Carta con nombre muy corto
  shortName: {
    id: 403,
    name: 'X',
    number: 3,
    category: 'arcanos_menores',
    meaningUpright: 'Upright meaning',
    meaningReversed: 'Reversed meaning',
    keywords: 'short',
    description: 'Card with single letter name',
  },

  // Carta con número máximo
  maxNumber: {
    id: 404,
    name: 'Max Number Card',
    number: 77, // Última carta (0-77 = 78 cartas)
    category: 'arcanos_menores',
    meaningUpright: 'Upright',
    meaningReversed: 'Reversed',
    keywords: 'max',
    description: 'Card with maximum number',
  },
};

/**
 * Respuestas de AI con casos edge
 */
export const EDGE_CASE_AI_RESPONSES = {
  // Respuesta muy corta (posible error)
  tooShort: {
    content: 'Short.',
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    tokensUsed: {
      prompt: 100,
      completion: 2,
      total: 102,
    },
    durationMs: 100,
  },

  // Respuesta extremadamente larga (máximo permitido)
  veryLong: {
    content: '# Interpretation\n\n' + 'Very long interpretation. '.repeat(1000), // ~26KB
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    tokensUsed: {
      prompt: 200,
      completion: 5000,
      total: 5200,
    },
    durationMs: 10000,
  },

  // Respuesta con caracteres especiales y emojis
  specialChars: {
    content: `## 🔮 Interpretación Especial

Esta lectura contiene: ñáéíóú, símbolos especiales ©®™, 
emojis 🌟✨🎴, y caracteres no-ASCII: 中文, العربية, עברית

### Símbolos: ♠️♥️♣️♦️

### Más contenido con "comillas", 'apóstrofes', y —guiones largos—.`,
    provider: 'openai',
    model: 'gpt-4o-mini',
    tokensUsed: {
      prompt: 150,
      completion: 120,
      total: 270,
    },
    durationMs: 2000,
  },

  // Respuesta con HTML malicioso (debe sanitizarse)
  maliciousHTML: {
    content: `<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
## Interpretación

<a href="javascript:alert('XSS')">Click aquí</a>

Contenido normal después del HTML malicioso.`,
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    tokensUsed: {
      prompt: 100,
      completion: 50,
      total: 150,
    },
    durationMs: 800,
  },

  // Respuesta con formato Markdown inválido
  invalidMarkdown: {
    content: `# Heading without closing

## Unclosed **bold

List without proper format:
- Item 1
Item 2 (missing -)
- Item 3

[Link without URL]

![Image without src]`,
    provider: 'deepseek',
    model: 'deepseek-chat',
    tokensUsed: {
      prompt: 100,
      completion: 80,
      total: 180,
    },
    durationMs: 1200,
  },

  // Respuesta vacía (error crítico)
  empty: {
    content: '',
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    tokensUsed: {
      prompt: 100,
      completion: 0,
      total: 100,
    },
    durationMs: 50,
  },

  // Respuesta con solo espacios en blanco
  whitespaceOnly: {
    content: '   \n\n   \t\t   \n   ',
    provider: 'openai',
    model: 'gpt-4o-mini',
    tokensUsed: {
      prompt: 100,
      completion: 1,
      total: 101,
    },
    durationMs: 100,
  },
};

/**
 * Límites de uso - casos edge
 */
export const EDGE_CASE_USAGE = {
  // Usuario en el límite exacto (free: 5 lecturas)
  atFreeLimit: {
    userId: 3,
    dailyReadings: 5,
    dailyInterpretations: 5,
    plan: UserPlan.FREE,
  },

  // Usuario excediendo límite por 1
  justOverLimit: {
    userId: 3,
    dailyReadings: 6,
    dailyInterpretations: 6,
    plan: UserPlan.FREE,
  },

  // Usuario muy por encima del límite (abuso potencial)
  wayOverLimit: {
    userId: 3,
    dailyReadings: 1000,
    dailyInterpretations: 1000,
    plan: UserPlan.FREE,
  },

  // Premium sin usar nada (límites ilimitados pero 0 uso)
  premiumNoUsage: {
    userId: 2,
    dailyReadings: 0,
    dailyInterpretations: 0,
    plan: UserPlan.PREMIUM,
  },

  // Premium con uso extremo
  premiumHeavyUsage: {
    userId: 2,
    dailyReadings: 100,
    dailyInterpretations: 100,
    plan: UserPlan.PREMIUM,
  },
};

/**
 * Datos de request - casos edge
 */
export const EDGE_CASE_REQUESTS = {
  // IP muy larga (IPv6)
  ipv6: {
    ipAddress: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    userAgent: 'Mozilla/5.0 (Test Browser)',
  },

  // User agent muy largo
  longUserAgent: {
    ipAddress: '127.0.0.1',
    userAgent: 'UA'.repeat(200), // ~400 caracteres
  },

  // User agent vacío
  emptyUserAgent: {
    ipAddress: '127.0.0.1',
    userAgent: '',
  },

  // IP localhost variations
  localhostVariations: [
    { ipAddress: '127.0.0.1', userAgent: 'Test' },
    { ipAddress: '::1', userAgent: 'Test' }, // IPv6 localhost
    { ipAddress: '0.0.0.0', userAgent: 'Test' },
  ],
};

/**
 * Fechas - casos edge
 */
export const EDGE_CASE_DATES = {
  // Fecha muy antigua (límite de base de datos)
  veryOld: new Date('1970-01-01T00:00:00Z'),

  // Fecha futura
  future: new Date('2099-12-31T23:59:59Z'),

  // Medianoche exacta
  midnight: new Date('2025-11-20T00:00:00Z'),

  // 1 milisegundo antes de medianoche
  beforeMidnight: new Date('2025-11-19T23:59:59.999Z'),

  // Cambio de año
  newYear: new Date('2026-01-01T00:00:00Z'),

  // Leap year (año bisiesto)
  leapDay: new Date('2024-02-29T12:00:00Z'),
};

/**
 * Tokens JWT - casos edge
 */
export const EDGE_CASE_JWT_TOKENS = {
  // Token con claims mínimos
  minimal: {
    sub: 1,
    email: 'minimal@test.com',
  },

  // Token con claims extras no usados
  extraClaims: {
    sub: 1,
    email: 'extra@test.com',
    isAdmin: false,
    plan: UserPlan.FREE,
    customField1: 'unused',
    customField2: 123,
    customField3: { nested: 'object' },
  },

  // Token cerca de expirar
  nearExpiry: {
    sub: 1,
    email: 'expiring@test.com',
    isAdmin: false,
    plan: UserPlan.FREE,
    exp: Math.floor(Date.now() / 1000) + 60, // Expira en 1 minuto
  },

  // Token recién emitido
  fresh: {
    sub: 1,
    email: 'fresh@test.com',
    isAdmin: false,
    plan: UserPlan.FREE,
    iat: Math.floor(Date.now() / 1000), // Emitido ahora
  },
};
