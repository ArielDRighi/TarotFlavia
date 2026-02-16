import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
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
 * for the Birth Chart feature from JSON files.
 *
 * Distribution:
 * - Planet Intros: 10 texts (one per planet)
 * - Ascendants: 12 texts (one per zodiac sign)
 * - Planets in Signs: 120 texts (10 planets × 12 signs)
 * - Planets in Houses: 120 texts (10 planets × 12 houses)
 * - Aspects: 214 texts (all combinations of planets and aspect types)
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Reads data from /database/seeds/birth-chart/*.md files
 * - Spanish language for user-facing content
 */

// ==============================================================================
// TYPE DEFINITIONS
// ==============================================================================

interface PlanetIntroItem {
  planet: string;
  content: string;
}

interface PlanetIntrosData {
  planet_intros: PlanetIntroItem[];
}

interface PlanetInSignItem {
  planet: string;
  sign: string;
  content: string;
}

interface PlanetsInSignsData {
  planet_in_sign: PlanetInSignItem[];
}

interface PlanetInHouseItem {
  planet: string;
  house: number;
  content: string;
}

interface PlanetsInHousesData {
  planet_in_house: PlanetInHouseItem[];
}

interface AscendantInSignItem {
  sign: string;
  content: string;
}

interface AscendantsData {
  ascendant_in_sign: AscendantInSignItem[];
}

interface AspectItem {
  planet1: string;
  planet2: string;
  aspect: string;
  content: string;
}

interface AspectsData {
  aspects: AspectItem[];
}
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

  // Path to seed data files
  const seedsPath = path.join(__dirname, 'birth-chart');

  // ==============================================================================
  // Helper function to read and parse JSON from .md files
  // ==============================================================================
  function readSeedFile<T>(filename: string): T {
    const filePath = path.join(seedsPath, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  }

  // ==============================================================================
  // 1. PLANET INTROS (10)
  // ==============================================================================
  console.log('📝 Loading Planet Intros from 01-planet-intros.md...');

  const planetIntrosData = readSeedFile<PlanetIntrosData>(
    '01-planet-intros.md',
  );
  const planetIntros = planetIntrosData.planet_intros.map((item) => ({
    category: InterpretationCategory.PLANET_INTRO,
    planet: item.planet as Planet,
    sign: null,
    house: null,
    aspectType: null,
    planet2: null,
    content: item.content,
    summary: null,
    isActive: true,
  }));

  interpretations.push(...planetIntros);
  console.log(`   ✓ Loaded ${planetIntros.length} planet intros`);

  // ==============================================================================
  // 2. PLANETS IN SIGNS (120)
  // ==============================================================================
  console.log('📝 Loading Planets in Signs from 02-planets-in-signs.md...');

  const planetsInSignsData = readSeedFile<PlanetsInSignsData>(
    '02-planets-in-signs.md',
  );
  const planetsInSigns = planetsInSignsData.planet_in_sign.map((item) => ({
    category: InterpretationCategory.PLANET_IN_SIGN,
    planet: item.planet as Planet,
    sign: item.sign as ZodiacSign,
    house: null,
    aspectType: null,
    planet2: null,
    content: item.content,
    summary: null,
    isActive: true,
  }));

  interpretations.push(...planetsInSigns);
  console.log(`   ✓ Loaded ${planetsInSigns.length} planets in signs`);

  // ==============================================================================
  // 3. PLANETS IN HOUSES (120)
  // ==============================================================================
  console.log('📝 Loading Planets in Houses from 03-planets-in-houses.md...');

  const planetsInHousesData = readSeedFile<PlanetsInHousesData>(
    '03-planets-in-houses.md',
  );
  const planetsInHouses = planetsInHousesData.planet_in_house.map((item) => ({
    category: InterpretationCategory.PLANET_IN_HOUSE,
    planet: item.planet as Planet,
    sign: null,
    house: item.house,
    aspectType: null,
    planet2: null,
    content: item.content,
    summary: null,
    isActive: true,
  }));

  interpretations.push(...planetsInHouses);
  console.log(`   ✓ Loaded ${planetsInHouses.length} planets in houses`);

  // ==============================================================================
  // 4. ASCENDANTS (12)
  // ==============================================================================
  console.log('📝 Loading Ascendants from 04-ascendant-in-signs.md...');

  const ascendantsData = readSeedFile<AscendantsData>(
    '04-ascendant-in-signs.md',
  );
  const ascendants = ascendantsData.ascendant_in_sign.map((item) => ({
    category: InterpretationCategory.ASCENDANT,
    planet: null,
    sign: item.sign as ZodiacSign,
    house: null,
    aspectType: null,
    planet2: null,
    content: item.content,
    summary: null,
    isActive: true,
  }));

  interpretations.push(...ascendants);
  console.log(`   ✓ Loaded ${ascendants.length} ascendants`);

  // ==============================================================================
  // 5. ASPECTS (214)
  // ==============================================================================
  console.log('📝 Loading Aspects from 05-aspects.md...');

  const aspectsData = readSeedFile<AspectsData>('05-aspects.md');

  // Definir aspectos astronómicamente imposibles (T-CA-051)
  // Estos aspectos no pueden ocurrir debido a las limitaciones de elongación
  const IMPOSSIBLE_ASPECTS: Array<{
    planet1: string;
    planet2: string;
    aspects: string[];
  }> = [
    // Sol-Mercurio (elongación máxima ~28°)
    {
      planet1: 'sun',
      planet2: 'mercury',
      aspects: ['sextile', 'square', 'trine', 'opposition'],
    },
    {
      planet1: 'mercury',
      planet2: 'sun',
      aspects: ['sextile', 'square', 'trine', 'opposition'],
    },
    // Sol-Venus (elongación máxima ~47°)
    {
      planet1: 'sun',
      planet2: 'venus',
      aspects: ['square', 'trine', 'opposition'],
    },
    {
      planet1: 'venus',
      planet2: 'sun',
      aspects: ['square', 'trine', 'opposition'],
    },
    // Mercurio-Venus
    {
      planet1: 'mercury',
      planet2: 'venus',
      aspects: ['trine', 'opposition'],
    },
    {
      planet1: 'venus',
      planet2: 'mercury',
      aspects: ['trine', 'opposition'],
    },
  ];

  // Helper: Verificar si un aspecto es astronómicamente imposible
  function isAspectImpossible(
    planet1: string,
    planet2: string,
    aspectType: string,
  ): boolean {
    return IMPOSSIBLE_ASPECTS.some(
      (impossible) =>
        impossible.planet1 === planet1 &&
        impossible.planet2 === planet2 &&
        impossible.aspects.includes(aspectType),
    );
  }

  // Filtrar aspectos imposibles y mapear a entidades
  const allAspects = aspectsData.aspects.map((item) => ({
    item,
    entity: {
      category: InterpretationCategory.ASPECT,
      planet: item.planet1 as Planet,
      planet2: item.planet2 as Planet,
      aspectType: item.aspect as AspectType,
      sign: null,
      house: null,
      content: item.content,
      summary: null,
      isActive: true,
    },
  }));

  // Separar aspectos válidos de imposibles
  const validAspects = allAspects.filter(
    ({ item }) => !isAspectImpossible(item.planet1, item.planet2, item.aspect),
  );
  const filteredCount = allAspects.length - validAspects.length;

  const aspects = validAspects.map(({ entity }) => entity);

  interpretations.push(...aspects);
  console.log(`   ✓ Loaded ${aspects.length} aspects`);
  if (filteredCount > 0) {
    console.log(
      `   ⚠️  Filtered ${filteredCount} astronomically impossible aspects`,
    );
  }

  // ==============================================================================
  // INSERT ALL INTERPRETATIONS
  // ==============================================================================
  console.log(
    `\n💾 Inserting ${interpretations.length} birth chart interpretations...`,
  );

  const interpretationEntities = interpretations.map((data) =>
    interpretationRepository.create(data),
  );

  await interpretationRepository.save(interpretationEntities, { chunk: 50 });

  console.log(
    `\n✅ Successfully seeded ${interpretations.length} birth chart interpretations:`,
  );
  console.log(`   • Planet Intros: ${planetIntros.length}`);
  console.log(`   • Planets in Signs: ${planetsInSigns.length}`);
  console.log(`   • Planets in Houses: ${planetsInHouses.length}`);
  console.log(`   • Ascendants: ${ascendants.length}`);
  console.log(`   • Aspects: ${aspects.length}`);
  console.log(
    `\n🎉 Birth Chart interpretations seeding completed successfully!`,
  );
}
