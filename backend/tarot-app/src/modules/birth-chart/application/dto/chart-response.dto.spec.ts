import { plainToInstance } from 'class-transformer';
import {
  PlanetPositionDto,
  HouseCuspDto,
  ChartAspectDto,
  ChartDistributionDto,
  BasicChartResponseDto,
  FullChartResponseDto,
  PremiumChartResponseDto,
  SavedChartSummaryDto,
  ChartHistoryResponseDto,
} from './chart-response.dto';

describe('Chart Response DTOs', () => {
  describe('PlanetPositionDto', () => {
    it('should create a valid PlanetPositionDto', () => {
      const input = {
        planet: 'sun',
        sign: 'leo',
        signName: 'Leo',
        signDegree: 15.5,
        formattedPosition: "15° 30' Leo",
        house: 5,
        isRetrograde: false,
      };

      const dto = plainToInstance(PlanetPositionDto, input);

      expect(dto).toBeDefined();
      expect(dto.planet).toBe('sun');
      expect(dto.sign).toBe('leo');
      expect(dto.signName).toBe('Leo');
      expect(dto.signDegree).toBe(15.5);
      expect(dto.formattedPosition).toBe("15° 30' Leo");
      expect(dto.house).toBe(5);
      expect(dto.isRetrograde).toBe(false);
    });

    it('should handle retrograde planets', () => {
      const input = {
        planet: 'mercury',
        sign: 'virgo',
        signName: 'Virgo',
        signDegree: 20.0,
        formattedPosition: "20° 00' Virgo ℞",
        house: 8,
        isRetrograde: true,
      };

      const dto = plainToInstance(PlanetPositionDto, input);

      expect(dto.isRetrograde).toBe(true);
    });
  });

  describe('HouseCuspDto', () => {
    it('should create a valid HouseCuspDto', () => {
      const input = {
        house: 1,
        sign: 'virgo',
        signName: 'Virgo',
        signDegree: 12.25,
        formattedPosition: "12° 15' Virgo",
      };

      const dto = plainToInstance(HouseCuspDto, input);

      expect(dto).toBeDefined();
      expect(dto.house).toBe(1);
      expect(dto.sign).toBe('virgo');
      expect(dto.signName).toBe('Virgo');
      expect(dto.signDegree).toBe(12.25);
      expect(dto.formattedPosition).toBe("12° 15' Virgo");
    });

    it('should handle all 12 houses', () => {
      for (let i = 1; i <= 12; i++) {
        const input = {
          house: i,
          sign: 'leo',
          signName: 'Leo',
          signDegree: 0,
          formattedPosition: "0° 00' Leo",
        };

        const dto = plainToInstance(HouseCuspDto, input);

        expect(dto.house).toBe(i);
      }
    });
  });

  describe('ChartAspectDto', () => {
    it('should create a valid ChartAspectDto', () => {
      const input = {
        planet1: 'sun',
        planet1Name: 'Sol',
        planet2: 'moon',
        planet2Name: 'Luna',
        aspectType: 'trine',
        aspectName: 'Trígono',
        aspectSymbol: '△',
        orb: 2.5,
        isApplying: true,
      };

      const dto = plainToInstance(ChartAspectDto, input);

      expect(dto).toBeDefined();
      expect(dto.planet1).toBe('sun');
      expect(dto.planet1Name).toBe('Sol');
      expect(dto.planet2).toBe('moon');
      expect(dto.planet2Name).toBe('Luna');
      expect(dto.aspectType).toBe('trine');
      expect(dto.aspectName).toBe('Trígono');
      expect(dto.aspectSymbol).toBe('△');
      expect(dto.orb).toBe(2.5);
      expect(dto.isApplying).toBe(true);
    });

    it('should handle separating aspects', () => {
      const input = {
        planet1: 'venus',
        planet1Name: 'Venus',
        planet2: 'mars',
        planet2Name: 'Marte',
        aspectType: 'square',
        aspectName: 'Cuadratura',
        aspectSymbol: '□',
        orb: 1.2,
        isApplying: false,
      };

      const dto = plainToInstance(ChartAspectDto, input);

      expect(dto.isApplying).toBe(false);
    });
  });

  describe('ChartDistributionDto', () => {
    it('should create a valid ChartDistributionDto', () => {
      const input = {
        elements: [
          { name: 'Fuego', count: 3, percentage: 27 },
          { name: 'Tierra', count: 4, percentage: 36 },
          { name: 'Aire', count: 2, percentage: 18 },
          { name: 'Agua', count: 2, percentage: 18 },
        ],
        modalities: [
          { name: 'Cardinal', count: 4, percentage: 36 },
          { name: 'Fijo', count: 3, percentage: 27 },
          { name: 'Mutable', count: 4, percentage: 36 },
        ],
      };

      const dto = plainToInstance(ChartDistributionDto, input);

      expect(dto).toBeDefined();
      expect(dto.elements).toHaveLength(4);
      expect(dto.modalities).toHaveLength(3);
      expect(dto.elements[0].name).toBe('Fuego');
      expect(dto.modalities[0].name).toBe('Cardinal');
    });

    it('should sum percentages to approximately 100', () => {
      const input = {
        elements: [
          { name: 'Fuego', count: 3, percentage: 30 },
          { name: 'Tierra', count: 3, percentage: 30 },
          { name: 'Aire', count: 2, percentage: 20 },
          { name: 'Agua', count: 2, percentage: 20 },
        ],
        modalities: [
          { name: 'Cardinal', count: 4, percentage: 40 },
          { name: 'Fijo', count: 3, percentage: 30 },
          { name: 'Mutable', count: 3, percentage: 30 },
        ],
      };

      const dto = plainToInstance(ChartDistributionDto, input);

      const elementTotal = dto.elements.reduce(
        (sum, e) => sum + e.percentage,
        0,
      );
      const modalityTotal = dto.modalities.reduce(
        (sum, m) => sum + m.percentage,
        0,
      );

      expect(elementTotal).toBe(100);
      expect(modalityTotal).toBe(100);
    });
  });

  describe('BasicChartResponseDto', () => {
    it('should create a valid BasicChartResponseDto', () => {
      const input = {
        success: true,
        chartSvgData: {
          planets: [],
          houses: [],
          aspects: [],
        },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: {
            sign: 'leo',
            signName: 'Leo',
            interpretation: 'Interpretación del Sol',
          },
          moon: {
            sign: 'scorpio',
            signName: 'Escorpio',
            interpretation: 'Interpretación de la Luna',
          },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'Interpretación del Ascendente',
          },
        },
        calculationTimeMs: 125,
      };

      const dto = plainToInstance(BasicChartResponseDto, input);

      expect(dto).toBeDefined();
      expect(dto.success).toBe(true);
      expect(dto.bigThree.sun.sign).toBe('leo');
      expect(dto.bigThree.moon.sign).toBe('scorpio');
      expect(dto.bigThree.ascendant.sign).toBe('virgo');
      expect(dto.calculationTimeMs).toBe(125);
    });
  });

  describe('FullChartResponseDto', () => {
    it('should extend BasicChartResponseDto', () => {
      const input = {
        success: true,
        chartSvgData: {
          planets: [],
          houses: [],
          aspects: [],
        },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: 'leo', signName: 'Leo', interpretation: 'Interp' },
          moon: {
            sign: 'scorpio',
            signName: 'Escorpio',
            interpretation: 'Interp',
          },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'Interp',
          },
        },
        calculationTimeMs: 125,
        distribution: {
          elements: [],
          modalities: [],
        },
        interpretations: {
          planets: [],
        },
        canDownloadPdf: true,
      };

      const dto = plainToInstance(FullChartResponseDto, input);

      expect(dto).toBeDefined();
      expect(dto.success).toBe(true);
      expect(dto.distribution).toBeDefined();
      expect(dto.interpretations).toBeDefined();
      expect(dto.canDownloadPdf).toBe(true);
    });
  });

  describe('PremiumChartResponseDto', () => {
    it('should extend FullChartResponseDto', () => {
      const input = {
        success: true,
        chartSvgData: {
          planets: [],
          houses: [],
          aspects: [],
        },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: 'leo', signName: 'Leo', interpretation: 'Interp' },
          moon: {
            sign: 'scorpio',
            signName: 'Escorpio',
            interpretation: 'Interp',
          },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'Interp',
          },
        },
        calculationTimeMs: 125,
        distribution: {
          elements: [],
          modalities: [],
        },
        interpretations: {
          planets: [],
        },
        canDownloadPdf: true,
        savedChartId: 1,
        aiSynthesis: {
          content: 'Síntesis generada por IA',
          generatedAt: '2026-02-06T12:00:00Z',
          provider: 'groq',
        },
        canAccessHistory: true,
      };

      const dto = plainToInstance(PremiumChartResponseDto, input);

      expect(dto).toBeDefined();
      expect(dto.savedChartId).toBe(1);
      expect(dto.aiSynthesis).toBeDefined();
      expect(dto.aiSynthesis.content).toBe('Síntesis generada por IA');
      expect(dto.canAccessHistory).toBe(true);
    });

    it('should allow savedChartId to be optional', () => {
      const input = {
        success: true,
        chartSvgData: {
          planets: [],
          houses: [],
          aspects: [],
        },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: 'leo', signName: 'Leo', interpretation: 'Interp' },
          moon: {
            sign: 'scorpio',
            signName: 'Escorpio',
            interpretation: 'Interp',
          },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'Interp',
          },
        },
        calculationTimeMs: 125,
        distribution: {
          elements: [],
          modalities: [],
        },
        interpretations: {
          planets: [],
        },
        canDownloadPdf: true,
        aiSynthesis: {
          content: 'Síntesis',
          generatedAt: '2026-02-06T12:00:00Z',
          provider: 'groq',
        },
        canAccessHistory: true,
      };

      const dto = plainToInstance(PremiumChartResponseDto, input);

      expect(dto.savedChartId).toBeUndefined();
    });
  });

  describe('SavedChartSummaryDto', () => {
    it('should create a valid SavedChartSummaryDto', () => {
      const input = {
        id: 1,
        name: 'Mi carta natal',
        birthDate: '1990-05-15',
        sunSign: 'Leo',
        moonSign: 'Escorpio',
        ascendantSign: 'Virgo',
        createdAt: '2026-02-06T12:00:00Z',
      };

      const dto = plainToInstance(SavedChartSummaryDto, input);

      expect(dto).toBeDefined();
      expect(dto.id).toBe(1);
      expect(dto.name).toBe('Mi carta natal');
      expect(dto.birthDate).toBe('1990-05-15');
      expect(dto.sunSign).toBe('Leo');
      expect(dto.moonSign).toBe('Escorpio');
      expect(dto.ascendantSign).toBe('Virgo');
      expect(dto.createdAt).toBe('2026-02-06T12:00:00Z');
    });
  });

  describe('ChartHistoryResponseDto', () => {
    it('should create a valid ChartHistoryResponseDto', () => {
      const input = {
        charts: [
          {
            id: 1,
            name: 'Carta 1',
            birthDate: '1990-05-15',
            sunSign: 'Leo',
            moonSign: 'Escorpio',
            ascendantSign: 'Virgo',
            createdAt: '2026-02-06T12:00:00Z',
          },
          {
            id: 2,
            name: 'Carta 2',
            birthDate: '1985-03-20',
            sunSign: 'Aries',
            moonSign: 'Géminis',
            ascendantSign: 'Libra',
            createdAt: '2026-02-05T10:00:00Z',
          },
        ],
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      const dto = plainToInstance(ChartHistoryResponseDto, input);

      expect(dto).toBeDefined();
      expect(dto.charts).toHaveLength(2);
      expect(dto.total).toBe(5);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
      expect(dto.totalPages).toBe(1);
    });

    it('should handle empty chart list', () => {
      const input = {
        charts: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      const dto = plainToInstance(ChartHistoryResponseDto, input);

      expect(dto.charts).toHaveLength(0);
      expect(dto.total).toBe(0);
    });
  });
});
