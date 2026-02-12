import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BirthChartHistoryService } from './birth-chart-history.service';
import { BirthChart } from '../../entities/birth-chart.entity';
import { ChartPdfService } from './chart-pdf.service';
import { ChartInterpretationService } from './chart-interpretation.service';
import { ChartCalculationService } from './chart-calculation.service';
import { ChartAISynthesisService } from './chart-ai-synthesis.service';

describe('BirthChartHistoryService', () => {
  let service: BirthChartHistoryService;

  const chartRepositoryMock = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const chartPdfServiceMock = {
    generatePDF: jest.fn(),
  };

  const chartInterpretationServiceMock = {
    generateFullInterpretation: jest.fn(),
  };

  const chartCalculationServiceMock = {
    calculateChart: jest.fn(),
  };

  const chartAiSynthesisServiceMock = {
    generateSynthesis: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthChartHistoryService,
        {
          provide: getRepositoryToken(BirthChart),
          useValue: chartRepositoryMock,
        },
        { provide: ChartPdfService, useValue: chartPdfServiceMock },
        {
          provide: ChartInterpretationService,
          useValue: chartInterpretationServiceMock,
        },
        {
          provide: ChartCalculationService,
          useValue: chartCalculationServiceMock,
        },
        {
          provide: ChartAISynthesisService,
          useValue: chartAiSynthesisServiceMock,
        },
      ],
    }).compile();

    service = module.get(BirthChartHistoryService);
    jest.clearAllMocks();
  });

  it('should return paginated chart history', async () => {
    const createdAt = new Date('2026-02-12T00:00:00Z');
    const chart: Partial<BirthChart> = {
      id: 1,
      name: 'Mi carta',
      birthDate: new Date('1990-05-15T00:00:00Z'),
      sunSign: 'leo',
      moonSign: 'aries',
      ascendantSign: 'virgo',
      createdAt,
    };

    chartRepositoryMock.findAndCount.mockResolvedValue([[chart], 1]);

    const result = await service.getUserCharts(1, 1, 10);

    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalItems).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('should detect duplicate chart', async () => {
    chartRepositoryMock.findOne.mockResolvedValue({ id: 10 });

    const exists = await service.checkDuplicate(
      1,
      '1990-05-15',
      '14:30',
      -34.6,
      -58.3,
    );

    expect(exists).toBe(true);
  });
});
