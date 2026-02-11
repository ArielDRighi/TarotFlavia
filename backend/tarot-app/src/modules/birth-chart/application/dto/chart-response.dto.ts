import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '../../../tarot/readings/dto/paginated-readings-response.dto';

/**
 * DTO para la posición de un planeta en la carta
 * Incluye: posición en signo, grado, casa y estado retrógrado
 */
export class PlanetPositionDto {
  @ApiProperty({
    example: 'sun',
    description: 'Identificador del planeta (formato lowercase)',
  })
  planet: string;

  @ApiProperty({ example: 'leo', description: 'Signo zodiacal (lowercase)' })
  sign: string;

  @ApiProperty({ example: 'Leo', description: 'Nombre del signo en español' })
  signName: string;

  @ApiProperty({
    example: 15.5,
    description: 'Grado dentro del signo (0-30)',
  })
  signDegree: number;

  @ApiProperty({
    example: "15° 30' Leo",
    description: 'Posición formateada para mostrar al usuario',
  })
  formattedPosition: string;

  @ApiProperty({ example: 5, description: 'Número de casa astrológica (1-12)' })
  house: number;

  @ApiProperty({
    example: false,
    description: 'Indica si el planeta está retrógrado',
  })
  isRetrograde: boolean;
}

/**
 * DTO para la cúspide de una casa astrológica
 * Define el inicio de cada casa en la carta
 */
export class HouseCuspDto {
  @ApiProperty({ example: 1, description: 'Número de casa (1-12)' })
  house: number;

  @ApiProperty({ example: 'virgo', description: 'Signo zodiacal (lowercase)' })
  sign: string;

  @ApiProperty({ example: 'Virgo', description: 'Nombre del signo en español' })
  signName: string;

  @ApiProperty({
    example: 12.25,
    description: 'Grado dentro del signo (0-30)',
  })
  signDegree: number;

  @ApiProperty({
    example: "12° 15' Virgo",
    description: 'Posición formateada para mostrar al usuario',
  })
  formattedPosition: string;
}

/**
 * DTO para un aspecto entre dos planetas
 * Representa relaciones angulares significativas
 */
export class ChartAspectDto {
  @ApiProperty({ example: 'sun', description: 'Primer planeta (lowercase)' })
  planet1: string;

  @ApiProperty({ example: 'Sol', description: 'Nombre del primer planeta' })
  planet1Name: string;

  @ApiProperty({ example: 'moon', description: 'Segundo planeta (lowercase)' })
  planet2: string;

  @ApiProperty({ example: 'Luna', description: 'Nombre del segundo planeta' })
  planet2Name: string;

  @ApiProperty({
    example: 'trine',
    description:
      'Tipo de aspecto (conjunction, opposition, square, trine, sextile)',
  })
  aspectType: string;

  @ApiProperty({
    example: 'Trígono',
    description: 'Nombre del aspecto en español',
  })
  aspectName: string;

  @ApiProperty({ example: '△', description: 'Símbolo visual del aspecto' })
  aspectSymbol: string;

  @ApiProperty({
    example: 2.5,
    description: 'Orbe: desviación del ángulo exacto en grados',
  })
  orb: number;

  @ApiProperty({
    example: true,
    description: 'Indica si el aspecto está aplicándose (planetas acercándose)',
  })
  isApplying: boolean;
}

/**
 * DTO para distribución de elementos y modalidades
 * Agrupa planetas por elemento (fuego, tierra, aire, agua) y modalidad (cardinal, fijo, mutable)
 */
export class ChartDistributionDto {
  @ApiProperty({
    example: [
      { name: 'Fuego', count: 3, percentage: 27 },
      { name: 'Tierra', count: 4, percentage: 36 },
      { name: 'Aire', count: 2, percentage: 18 },
      { name: 'Agua', count: 2, percentage: 18 },
    ],
    description: 'Distribución de planetas por elemento',
  })
  elements: Array<{ name: string; count: number; percentage: number }>;

  @ApiProperty({
    example: [
      { name: 'Cardinal', count: 4, percentage: 36 },
      { name: 'Fijo', count: 3, percentage: 27 },
      { name: 'Mutable', count: 4, percentage: 36 },
    ],
    description: 'Distribución de planetas por modalidad',
  })
  modalities: Array<{ name: string; count: number; percentage: number }>;
}

/**
 * DTO de respuesta básica de carta astral
 * Disponible para: Usuarios ANÓNIMOS
 * Incluye: gráfico SVG, posiciones de planetas, casas, aspectos y Big Three
 */
export class BasicChartResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si el cálculo fue exitoso',
  })
  success: boolean;

  @ApiProperty({
    example: {
      planets: [],
      houses: [],
      aspects: [],
    },
    description:
      'Datos para renderizar el gráfico de la carta astral (formato SVG)',
  })
  chartSvgData: {
    planets: any[];
    houses: any[];
    aspects: any[];
  };

  @ApiProperty({
    type: [PlanetPositionDto],
    description: 'Posiciones de todos los planetas',
  })
  planets: PlanetPositionDto[];

  @ApiProperty({
    type: [HouseCuspDto],
    description: 'Cúspides de las 12 casas astrológicas',
  })
  houses: HouseCuspDto[];

  @ApiProperty({
    type: [ChartAspectDto],
    description: 'Aspectos principales entre planetas',
  })
  aspects: ChartAspectDto[];

  @ApiProperty({
    example: {
      sun: {
        sign: 'leo',
        signName: 'Leo',
        interpretation: 'El Sol en Leo representa...',
      },
      moon: {
        sign: 'scorpio',
        signName: 'Escorpio',
        interpretation: 'La Luna en Escorpio indica...',
      },
      ascendant: {
        sign: 'virgo',
        signName: 'Virgo',
        interpretation: 'Ascendente en Virgo muestra...',
      },
    },
    description: 'Los "Big Three": Sol, Luna y Ascendente con interpretaciones',
  })
  bigThree: {
    sun: {
      sign: string;
      signName: string;
      interpretation: string;
    };
    moon: {
      sign: string;
      signName: string;
      interpretation: string;
    };
    ascendant: {
      sign: string;
      signName: string;
      interpretation: string;
    };
  };

  @ApiProperty({
    example: 125,
    description: 'Tiempo de cálculo en milisegundos',
  })
  calculationTimeMs: number;
}

/**
 * DTO de respuesta completa de carta astral
 * Disponible para: Usuarios FREE (registrados)
 * Hereda de BasicChartResponseDto y agrega:
 * - Distribución de elementos y modalidades
 * - Interpretaciones detalladas
 * - Capacidad de descargar PDF
 */
export class FullChartResponseDto extends BasicChartResponseDto {
  @ApiProperty({
    type: ChartDistributionDto,
    description:
      'Distribución de planetas por elemento (fuego, tierra, aire, agua) y modalidad (cardinal, fijo, mutable)',
  })
  distribution: ChartDistributionDto;

  @ApiProperty({
    example: {
      planets: [
        {
          planet: 'sun',
          planetName: 'Sol',
          intro: 'El Sol representa la esencia vital...',
          inSign: 'En Leo, el Sol brilla con máxima expresión...',
          inHouse: 'En Casa 5, enfoca la creatividad...',
          aspects: [
            {
              withPlanet: 'moon',
              withPlanetName: 'Luna',
              aspectType: 'trine',
              aspectName: 'Trígono',
              interpretation: 'Armonía entre voluntad y emociones',
            },
          ],
        },
      ],
    },
    description: 'Interpretaciones detalladas de cada planeta',
  })
  interpretations: {
    planets: Array<{
      planet: string;
      planetName: string;
      intro: string;
      inSign: string;
      inHouse: string;
      aspects: Array<{
        withPlanet: string;
        withPlanetName: string;
        aspectType: string;
        aspectName: string;
        interpretation: string;
      }>;
    }>;
  };

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario puede descargar el PDF de la carta',
  })
  canDownloadPdf: boolean;
}

/**
 * DTO de respuesta premium de carta astral
 * Disponible para: Usuarios PREMIUM
 * Hereda de FullChartResponseDto y agrega:
 * - ID de la carta guardada
 * - Síntesis de IA personalizada
 * - Acceso al historial de cartas
 */
export class PremiumChartResponseDto extends FullChartResponseDto {
  @ApiProperty({
    example: 1,
    description:
      'ID de la carta guardada en base de datos (solo si fue guardada)',
    required: false,
  })
  savedChartId?: number;

  @ApiProperty({
    example: {
      content: 'Síntesis personalizada generada por IA...',
      generatedAt: '2026-02-10T12:00:00Z',
      provider: 'groq-llama3.1-70b',
    },
    description: 'Síntesis personalizada generada por IA',
  })
  aiSynthesis: {
    content: string;
    generatedAt: string;
    provider: string;
  };

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario puede acceder al historial de cartas',
  })
  canAccessHistory: boolean;
}

/**
 * DTO para un resumen de carta guardada
 * Usado en listados de historial de cartas
 */
export class SavedChartSummaryDto {
  @ApiProperty({ example: 1, description: 'ID único de la carta guardada' })
  id: number;

  @ApiProperty({ example: 'Mi carta natal', description: 'Nombre de la carta' })
  name: string;

  @ApiProperty({
    example: '1990-05-15',
    description: 'Fecha de nacimiento',
  })
  birthDate: string;

  @ApiProperty({ example: 'Leo', description: 'Signo solar' })
  sunSign: string;

  @ApiProperty({ example: 'Escorpio', description: 'Signo lunar' })
  moonSign: string;

  @ApiProperty({ example: 'Virgo', description: 'Signo ascendente' })
  ascendantSign: string;

  @ApiProperty({
    example: '2026-02-06T12:00:00Z',
    description: 'Fecha de creación',
  })
  createdAt: string;
}

/**
 * DTO para respuesta de historial de cartas
 * Incluye paginación consistente con PaginationMeta
 */
export class ChartHistoryResponseDto {
  @ApiProperty({
    type: [SavedChartSummaryDto],
    description: 'Lista de cartas guardadas',
  })
  data: SavedChartSummaryDto[];

  @ApiProperty({
    type: PaginationMeta,
    description: 'Metadata de paginación',
  })
  meta: PaginationMeta;
}
