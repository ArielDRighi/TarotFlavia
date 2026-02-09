import { DataSource } from 'typeorm';
import { BirthChartInterpretation } from '../../modules/birth-chart/entities/birth-chart-interpretation.entity';
import {
  InterpretationCategory,
  Planet,
  ZodiacSign,
  AspectType,
} from '../../modules/birth-chart/domain/enums';

/**
 * Seed Birth Chart Interpretations
 * This seeder populates the database with ~490 astrological interpretation texts
 * for the Birth Chart feature.
 *
 * Distribution:
 * - Planet Intros: 10 texts (one per planet)
 * - Ascendants: 12 texts (one per zodiac sign)
 * - Planets in Signs: 120 texts (10 planets × 12 signs)
 * - Planets in Houses: 120 texts (10 planets × 12 houses)
 * - Aspects: ~225 texts (~45 pairs × 5 aspect types) - PLACEHOLDER
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Placeholder texts for now (will be replaced with AI-generated content)
 * - Spanish language for user-facing content
 */
export async function seedBirthChartInterpretations(
  dataSource: DataSource,
): Promise<void> {
  console.log('🌟 Starting Birth Chart Interpretations seeding process...');

  const interpretationRepository = dataSource.getRepository(
    BirthChartInterpretation,
  );

  // Check if already seeded (idempotency)
  const existingCount = await interpretationRepository.count();
  if (existingCount > 0) {
    console.log(
      `✅ Birth Chart interpretations already seeded (${existingCount} found). Skipping...`,
    );
    return;
  }

  // Collect all interpretations
  const interpretations: Partial<BirthChartInterpretation>[] = [];

  // Define stable constant arrays for iteration (avoid enum pitfalls)
  const PLANETS: Planet[] = [
    Planet.SUN,
    Planet.MOON,
    Planet.MERCURY,
    Planet.VENUS,
    Planet.MARS,
    Planet.JUPITER,
    Planet.SATURN,
    Planet.URANUS,
    Planet.NEPTUNE,
    Planet.PLUTO,
  ];

  const ZODIAC_SIGNS: ZodiacSign[] = [
    ZodiacSign.ARIES,
    ZodiacSign.TAURUS,
    ZodiacSign.GEMINI,
    ZodiacSign.CANCER,
    ZodiacSign.LEO,
    ZodiacSign.VIRGO,
    ZodiacSign.LIBRA,
    ZodiacSign.SCORPIO,
    ZodiacSign.SAGITTARIUS,
    ZodiacSign.CAPRICORN,
    ZodiacSign.AQUARIUS,
    ZodiacSign.PISCES,
  ];

  const ASPECT_TYPES: AspectType[] = [
    AspectType.CONJUNCTION,
    AspectType.OPPOSITION,
    AspectType.SQUARE,
    AspectType.TRINE,
    AspectType.SEXTILE,
  ];

  // ==============================================================================
  // 1. PLANET INTROS (10)
  // ==============================================================================
  console.log('📝 Generating Planet Intros (10)...');

  const planetIntros = PLANETS.map((planet) => ({
    category: InterpretationCategory.PLANET_INTRO,
    planet,
    sign: null,
    house: null,
    aspectType: null,
    planet2: null,
    content: getPlanetIntroText(planet),
    summary: null,
    isActive: true,
  }));

  interpretations.push(...planetIntros);

  // ==============================================================================
  // 2. ASCENDANTS (12)
  // ==============================================================================
  console.log('📝 Generating Ascendants (12)...');

  const ascendants = ZODIAC_SIGNS.map((sign) => ({
    category: InterpretationCategory.ASCENDANT,
    planet: null,
    sign,
    house: null,
    aspectType: null,
    planet2: null,
    content: getAscendantText(sign),
    summary: null,
    isActive: true,
  }));

  interpretations.push(...ascendants);

  // ==============================================================================
  // 3. PLANETS IN SIGNS (120)
  // ==============================================================================
  console.log('📝 Generating Planets in Signs (120)...');

  const planetsInSigns: Partial<BirthChartInterpretation>[] = [];
  PLANETS.forEach((planet) => {
    ZODIAC_SIGNS.forEach((sign) => {
      planetsInSigns.push({
        category: InterpretationCategory.PLANET_IN_SIGN,
        planet,
        sign,
        house: null,
        aspectType: null,
        planet2: null,
        content: getPlanetInSignText(planet, sign),
        summary: null,
        isActive: true,
      });
    });
  });

  interpretations.push(...planetsInSigns);

  // ==============================================================================
  // 4. PLANETS IN HOUSES (120)
  // ==============================================================================
  console.log('📝 Generating Planets in Houses (120)...');

  const planetsInHouses: Partial<BirthChartInterpretation>[] = [];
  PLANETS.forEach((planet) => {
    for (let house = 1; house <= 12; house++) {
      planetsInHouses.push({
        category: InterpretationCategory.PLANET_IN_HOUSE,
        planet,
        sign: null,
        house,
        aspectType: null,
        planet2: null,
        content: getPlanetInHouseText(planet, house),
        summary: null,
        isActive: true,
      });
    }
  });

  interpretations.push(...planetsInHouses);

  // ==============================================================================
  // 5. ASPECTS (PLACEHOLDER - ~20 for testing)
  // ==============================================================================
  console.log('📝 Generating Sample Aspects (20 placeholders)...');

  const aspects: Partial<BirthChartInterpretation>[] = [];
  const otherPlanets = PLANETS.filter((planet) => planet !== Planet.SUN);

  // Generate some sample aspects (not all combinations yet)
  // Sun aspects with other planets
  for (let i = 0; i < Math.min(4, otherPlanets.length); i++) {
    const planet2 = otherPlanets[i];
    ASPECT_TYPES.forEach((aspectType) => {
      aspects.push({
        category: InterpretationCategory.ASPECT,
        planet: Planet.SUN,
        planet2,
        aspectType,
        sign: null,
        house: null,
        content: getAspectText(Planet.SUN, planet2, aspectType),
        summary: null,
        isActive: true,
      });
    });
  }

  interpretations.push(...aspects);

  // ==============================================================================
  // INSERT ALL INTERPRETATIONS
  // ==============================================================================
  console.log(
    `💾 Inserting ${interpretations.length} birth chart interpretations...`,
  );

  const interpretationEntities = interpretations.map((data) =>
    interpretationRepository.create(data),
  );

  await interpretationRepository.save(interpretationEntities, { chunk: 50 });

  console.log(
    `✅ Successfully seeded ${interpretations.length} birth chart interpretations`,
  );
  console.log(`   • Planet Intros: ${planetIntros.length}`);
  console.log(`   • Ascendants: ${ascendants.length}`);
  console.log(`   • Planets in Signs: ${planetsInSigns.length}`);
  console.log(`   • Planets in Houses: ${planetsInHouses.length}`);
  console.log(`   • Sample Aspects: ${aspects.length} (placeholders)`);
  console.log(
    `\n🎉 Birth Chart interpretations seeding completed successfully!`,
  );
}

// ==============================================================================
// HELPER FUNCTIONS - PLACEHOLDER TEXTS
// ==============================================================================

function getPlanetIntroText(planet: Planet): string {
  const texts: Record<Planet, string> = {
    [Planet.SUN]:
      'El Sol representa tu esencia, tu identidad central y la fuerza vital que te impulsa. Es el astro que ilumina quién eres realmente, más allá de las máscaras sociales. En tu carta natal, el Sol indica dónde brillas con luz propia y qué te hace sentir verdaderamente vivo.',
    [Planet.MOON]:
      'La Luna simboliza tus emociones, instintos y mundo interior. Representa cómo respondes emocionalmente, qué necesitas para sentirte seguro y cómo nutres a otros. Es tu lado más íntimo, el que muestras solo a quienes más confías.',
    [Planet.MERCURY]:
      'Mercurio rige tu mente, comunicación y forma de procesar información. Indica cómo piensas, aprendes, te comunicas y te relacionas con ideas. Es el mensajero que conecta tu mundo interior con el exterior.',
    [Planet.VENUS]:
      'Venus representa el amor, la belleza y lo que valoras. Muestra cómo amas, qué te atrae, cómo das y recibes afecto, y qué consideras placentero. Es el planeta del arte, las relaciones y la armonía.',
    [Planet.MARS]:
      'Marte simboliza tu energía, deseos, impulsos y cómo actúas. Representa tu fuerza de voluntad, tu coraje, tu manera de luchar por lo que quieres y cómo manejas el conflicto. Es tu guerrero interior.',
    [Planet.JUPITER]:
      'Júpiter es el planeta de la expansión, la abundancia y la sabiduría. Representa tu fe, optimismo, búsqueda de significado y dónde encuentras suerte y crecimiento. Es tu maestro interior y tu conexión con lo trascendente.',
    [Planet.SATURN]:
      'Saturno simboliza estructura, disciplina, límites y responsabilidad. Representa tus miedos, karmas, lecciones de vida y dónde debes madurar. Es tu maestro exigente que te enseña a través de los desafíos.',
    [Planet.URANUS]:
      'Urano representa la innovación, la originalidad y el cambio súbito. Indica dónde eres único, rebelde, visionario. Es el planeta de las revoluciones personales, la libertad y el despertar de conciencia.',
    [Planet.NEPTUNE]:
      'Neptuno simboliza la espiritualidad, la imaginación y la conexión con lo divino. Representa tus sueños, tu mundo místico, tu sensibilidad psíquica y también tus ilusiones. Es el portal hacia lo invisible.',
    [Planet.PLUTO]:
      'Plutón representa la transformación profunda, el poder y la regeneración. Indica dónde experimentas muerte y renacimiento, crisis transformadoras y dónde descubres tu poder oculto. Es el alquimista de tu carta.',
  };

  return texts[planet];
}

function getAscendantText(sign: ZodiacSign): string {
  const texts: Record<ZodiacSign, string> = {
    [ZodiacSign.ARIES]:
      'Con Ascendente en Aries, proyectas una imagen de valentía, iniciativa y liderazgo. Tiendes a abordar la vida con entusiasmo y directamente. Tu primera impresión es de alguien activo, independiente y algo impulsivo.',
    [ZodiacSign.TAURUS]:
      'Con Ascendente en Tauro, proyectas una imagen de calma, estabilidad y sensualidad. Tiendes a abordar la vida con paciencia y practicidad. Tu primera impresión es de alguien confiable, centrado y amante del confort.',
    [ZodiacSign.GEMINI]:
      'Con Ascendente en Géminis, proyectas una imagen de curiosidad, agilidad mental y comunicación. Tiendes a abordar la vida con versatilidad y humor. Tu primera impresión es de alguien ingenioso, social y siempre interesado.',
    [ZodiacSign.CANCER]:
      'Con Ascendente en Cáncer, proyectas una imagen de sensibilidad, protección y empatía. Tiendes a abordar la vida con cautela emocional. Tu primera impresión es de alguien cálido, intuitivo y algo reservado inicialmente.',
    [ZodiacSign.LEO]:
      'Con Ascendente en Leo, proyectas una imagen de confianza, carisma y generosidad. Tiendes a abordar la vida con entusiasmo dramático. Tu primera impresión es de alguien radiante, creativo y naturalmente magnético.',
    [ZodiacSign.VIRGO]:
      'Con Ascendente en Virgo, proyectas una imagen de organización, análisis y servicio. Tiendes a abordar la vida con atención al detalle. Tu primera impresión es de alguien metódico, humilde y eficiente.',
    [ZodiacSign.LIBRA]:
      'Con Ascendente en Libra, proyectas una imagen de equilibrio, diplomacia y encanto. Tiendes a abordar la vida buscando armonía. Tu primera impresión es de alguien amable, estético y socialmente refinado.',
    [ZodiacSign.SCORPIO]:
      'Con Ascendente en Escorpio, proyectas una imagen de intensidad, misterio y magnetismo. Tiendes a abordar la vida con profundidad. Tu primera impresión es de alguien poderoso, penetrante y algo enigmático.',
    [ZodiacSign.SAGITTARIUS]:
      'Con Ascendente en Sagitario, proyectas una imagen de optimismo, aventura y franqueza. Tiendes a abordar la vida con filosofía y humor. Tu primera impresión es de alguien expansivo, honesto y amante de la libertad.',
    [ZodiacSign.CAPRICORN]:
      'Con Ascendente en Capricornio, proyectas una imagen de seriedad, ambición y responsabilidad. Tiendes a abordar la vida con estrategia. Tu primera impresión es de alguien maduro, profesional y algo reservado.',
    [ZodiacSign.AQUARIUS]:
      'Con Ascendente en Acuario, proyectas una imagen de originalidad, independencia y humanitarismo. Tiendes a abordar la vida con innovación. Tu primera impresión es de alguien único, progresista y algo distante.',
    [ZodiacSign.PISCES]:
      'Con Ascendente en Piscis, proyectas una imagen de compasión, creatividad y sensibilidad espiritual. Tiendes a abordar la vida con intuición. Tu primera impresión es de alguien soñador, empático y algo etéreo.',
  };

  return texts[sign];
}

function getPlanetInSignText(planet: Planet, sign: ZodiacSign): string {
  // Placeholder: Generate a generic text combining planet and sign
  return `[PLACEHOLDER] ${getPlanetName(planet)} en ${getSignName(sign)} crea una combinación única de energías. Esta posición influye en cómo se manifiesta ${getPlanetName(planet)} en tu vida, teñido por las cualidades de ${getSignName(sign)}. Es una mezcla de ${getPlanetKeyword(planet)} con ${getSignKeyword(sign)}.`;
}

function getPlanetInHouseText(planet: Planet, house: number): string {
  // Placeholder: Generate a generic text combining planet and house
  return `[PLACEHOLDER] ${getPlanetName(planet)} en Casa ${house} indica que las energías de ${getPlanetName(planet)} se expresan principalmente en el área de vida relacionada con la Casa ${house}. Esta posición muestra dónde y cómo se manifiesta ${getPlanetKeyword(planet)} en tu experiencia cotidiana.`;
}

function getAspectText(
  planet1: Planet,
  planet2: Planet,
  aspectType: AspectType,
): string {
  // Placeholder: Generate a generic text for aspects
  return `[PLACEHOLDER] ${getPlanetName(planet1)} en ${getAspectName(aspectType)} con ${getPlanetName(planet2)} crea una dinámica ${getAspectQuality(aspectType)} entre estas dos energías planetarias. Esta configuración influye en cómo interactúan ${getPlanetKeyword(planet1)} y ${getPlanetKeyword(planet2)} en tu carta natal.`;
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

function getPlanetName(planet: Planet): string {
  const names: Record<Planet, string> = {
    [Planet.SUN]: 'El Sol',
    [Planet.MOON]: 'La Luna',
    [Planet.MERCURY]: 'Mercurio',
    [Planet.VENUS]: 'Venus',
    [Planet.MARS]: 'Marte',
    [Planet.JUPITER]: 'Júpiter',
    [Planet.SATURN]: 'Saturno',
    [Planet.URANUS]: 'Urano',
    [Planet.NEPTUNE]: 'Neptuno',
    [Planet.PLUTO]: 'Plutón',
  };
  return names[planet];
}

function getSignName(sign: ZodiacSign): string {
  const names: Record<ZodiacSign, string> = {
    [ZodiacSign.ARIES]: 'Aries',
    [ZodiacSign.TAURUS]: 'Tauro',
    [ZodiacSign.GEMINI]: 'Géminis',
    [ZodiacSign.CANCER]: 'Cáncer',
    [ZodiacSign.LEO]: 'Leo',
    [ZodiacSign.VIRGO]: 'Virgo',
    [ZodiacSign.LIBRA]: 'Libra',
    [ZodiacSign.SCORPIO]: 'Escorpio',
    [ZodiacSign.SAGITTARIUS]: 'Sagitario',
    [ZodiacSign.CAPRICORN]: 'Capricornio',
    [ZodiacSign.AQUARIUS]: 'Acuario',
    [ZodiacSign.PISCES]: 'Piscis',
  };
  return names[sign];
}

function getPlanetKeyword(planet: Planet): string {
  const keywords: Record<Planet, string> = {
    [Planet.SUN]: 'identidad y vitalidad',
    [Planet.MOON]: 'emociones e instintos',
    [Planet.MERCURY]: 'comunicación y mente',
    [Planet.VENUS]: 'amor y valores',
    [Planet.MARS]: 'acción y deseo',
    [Planet.JUPITER]: 'expansión y sabiduría',
    [Planet.SATURN]: 'estructura y disciplina',
    [Planet.URANUS]: 'innovación y cambio',
    [Planet.NEPTUNE]: 'espiritualidad e imaginación',
    [Planet.PLUTO]: 'transformación y poder',
  };
  return keywords[planet];
}

function getSignKeyword(sign: ZodiacSign): string {
  const keywords: Record<ZodiacSign, string> = {
    [ZodiacSign.ARIES]: 'valentía e iniciativa',
    [ZodiacSign.TAURUS]: 'estabilidad y sensualidad',
    [ZodiacSign.GEMINI]: 'curiosidad y versatilidad',
    [ZodiacSign.CANCER]: 'sensibilidad y protección',
    [ZodiacSign.LEO]: 'confianza y creatividad',
    [ZodiacSign.VIRGO]: 'análisis y servicio',
    [ZodiacSign.LIBRA]: 'equilibrio y armonía',
    [ZodiacSign.SCORPIO]: 'intensidad y profundidad',
    [ZodiacSign.SAGITTARIUS]: 'aventura y filosofía',
    [ZodiacSign.CAPRICORN]: 'ambición y responsabilidad',
    [ZodiacSign.AQUARIUS]: 'originalidad e independencia',
    [ZodiacSign.PISCES]: 'compasión y espiritualidad',
  };
  return keywords[sign];
}

function getAspectName(aspectType: AspectType): string {
  const names: Record<AspectType, string> = {
    [AspectType.CONJUNCTION]: 'conjunción',
    [AspectType.OPPOSITION]: 'oposición',
    [AspectType.SQUARE]: 'cuadratura',
    [AspectType.TRINE]: 'trígono',
    [AspectType.SEXTILE]: 'sextil',
  };
  return names[aspectType];
}

function getAspectQuality(aspectType: AspectType): string {
  const qualities: Record<AspectType, string> = {
    [AspectType.CONJUNCTION]: 'fusionante',
    [AspectType.OPPOSITION]: 'polarizante',
    [AspectType.SQUARE]: 'desafiante',
    [AspectType.TRINE]: 'armoniosa',
    [AspectType.SEXTILE]: 'oportunista',
  };
  return qualities[aspectType];
}
