import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CreateBirthChartDto } from '../../application/dto/generate-chart.dto';
import { BirthChartHistoryController } from './birth-chart-history.controller';
import { UserPlan } from '../../../users/entities/user.entity';

describe('BirthChartHistoryController', () => {
  let controller: BirthChartHistoryController;
  let mockHistoryService: Record<string, jest.Mock>;

  const premiumUser = {
    userId: 10,
    email: 'premium@test.com',
    plan: UserPlan.PREMIUM,
  };

  const freeUser = {
    userId: 11,
    email: 'free@test.com',
    plan: UserPlan.FREE,
  };

  const createDto: CreateBirthChartDto = {
    name: 'María García',
    chartName: 'Mi carta natal',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'Buenos Aires, Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  beforeEach(async () => {
    mockHistoryService = {
      getUserCharts: jest.fn(),
      getChartById: jest.fn(),
      checkDuplicate: jest.fn(),
      saveChart: jest.fn(),
      renameChart: jest.fn(),
      deleteChart: jest.fn(),
      findDuplicate: jest.fn(),
      generatePdfFromSaved: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BirthChartHistoryController],
      providers: [
        {
          provide: 'BirthChartHistoryService',
          useValue: mockHistoryService,
        },
      ],
    }).compile();

    controller = module.get<BirthChartHistoryController>(
      BirthChartHistoryController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /birth-chart/history', () => {
    it('should list history with explicit pagination', async () => {
      const response = {
        data: [
          {
            id: 1,
            name: 'Carta 1',
            birthDate: '1990-05-15',
            sunSign: 'Leo',
            moonSign: 'Escorpio',
            ascendantSign: 'Virgo',
            createdAt: '2026-02-11T10:00:00.000Z',
          },
        ],
        meta: { page: 2, limit: 5, totalItems: 7, totalPages: 2 },
      };

      mockHistoryService.getUserCharts.mockResolvedValue(response);

      const result = await controller.getHistory(premiumUser, 2, 5);

      expect(mockHistoryService.getUserCharts).toHaveBeenCalledWith(
        premiumUser.userId,
        2,
        5,
      );
      expect(result).toEqual(response);
    });

    it('should use default page and limit', async () => {
      mockHistoryService.getUserCharts.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
      });

      await controller.getHistory(
        premiumUser,
        undefined as unknown as number,
        undefined as unknown as number,
      );

      expect(mockHistoryService.getUserCharts).toHaveBeenCalledWith(
        premiumUser.userId,
        1,
        10,
      );
    });

    it('should reject non-premium user', () => {
      expect(() => controller.getHistory(freeUser, 1, 10)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('GET /birth-chart/history/:id', () => {
    it('should return chart detail', async () => {
      const premiumChart = {
        success: true,
        chartSvgData: { planets: [], houses: [], aspects: [] },
        planets: [],
        houses: [],
        aspects: [],
        bigThree: {
          sun: { sign: 'leo', signName: 'Leo', interpretation: 'x' },
          moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'x' },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'x',
          },
        },
        calculationTimeMs: 100,
        distribution: { elements: [], modalities: [] },
        interpretations: { planets: [] },
        canDownloadPdf: true,
        aiSynthesis: {
          content: 'Síntesis IA',
          generatedAt: '2026-02-10T12:00:00.000Z',
          provider: 'groq',
        },
        canAccessHistory: true,
      };

      mockHistoryService.getChartById.mockResolvedValue(premiumChart);

      const result = await controller.getChart(1, premiumUser);

      expect(mockHistoryService.getChartById).toHaveBeenCalledWith(
        1,
        premiumUser.userId,
      );
      expect(result).toEqual(premiumChart);
    });

    it('should throw not found when chart does not exist', async () => {
      mockHistoryService.getChartById.mockResolvedValue(null);

      await expect(controller.getChart(999, premiumUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('POST /birth-chart/history', () => {
    it('should save chart when no duplicate exists', async () => {
      mockHistoryService.checkDuplicate.mockResolvedValue(false);
      const savedSummary = {
        id: 1,
        name: 'Mi carta natal',
        birthDate: '1990-05-15',
        sunSign: 'Leo',
        moonSign: 'Escorpio',
        ascendantSign: 'Virgo',
        createdAt: '2026-02-11T10:00:00.000Z',
      };
      mockHistoryService.saveChart.mockResolvedValue(savedSummary);

      const result = await controller.saveChart(createDto, premiumUser);

      expect(mockHistoryService.checkDuplicate).toHaveBeenCalledWith(
        premiumUser.userId,
        createDto.birthDate,
        createDto.birthTime,
        createDto.latitude,
        createDto.longitude,
      );
      expect(mockHistoryService.saveChart).toHaveBeenCalledWith(
        premiumUser.userId,
        createDto,
      );
      expect(result).toEqual(savedSummary);
    });

    it('should throw conflict when duplicate exists', async () => {
      mockHistoryService.checkDuplicate.mockResolvedValue(true);

      await expect(
        controller.saveChart(createDto, premiumUser),
      ).rejects.toThrow(ConflictException);

      expect(mockHistoryService.saveChart).not.toHaveBeenCalled();
    });
  });

  describe('POST /birth-chart/history/:id/name', () => {
    it('should rename chart and return id and name', async () => {
      mockHistoryService.renameChart.mockResolvedValue(true);

      const result = await controller.renameChart(
        4,
        'Carta de mamá',
        premiumUser,
      );

      expect(mockHistoryService.renameChart).toHaveBeenCalledWith(
        4,
        premiumUser.userId,
        'Carta de mamá',
      );
      expect(result).toEqual({ id: 4, name: 'Carta de mamá' });
    });

    it('should throw not found when rename target does not exist', async () => {
      mockHistoryService.renameChart.mockResolvedValue(false);

      await expect(
        controller.renameChart(999, 'Carta inexistente', premiumUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /birth-chart/history/:id', () => {
    it('should delete chart when it exists', async () => {
      mockHistoryService.deleteChart.mockResolvedValue(true);

      await expect(
        controller.deleteChart(7, premiumUser),
      ).resolves.toBeUndefined();

      expect(mockHistoryService.deleteChart).toHaveBeenCalledWith(
        7,
        premiumUser.userId,
      );
    });

    it('should throw not found when delete target does not exist', async () => {
      mockHistoryService.deleteChart.mockResolvedValue(false);

      await expect(controller.deleteChart(999, premiumUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('POST /birth-chart/history/check-duplicate', () => {
    it('should return existing chart summary when duplicate is found', async () => {
      mockHistoryService.findDuplicate.mockResolvedValue({
        id: 5,
        name: 'Carta base',
      });

      const result = await controller.checkDuplicate(createDto, premiumUser);

      expect(result).toEqual({
        exists: true,
        existingChart: { id: 5, name: 'Carta base' },
      });
    });

    it('should return exists false when duplicate is not found', async () => {
      mockHistoryService.findDuplicate.mockResolvedValue(null);

      const result = await controller.checkDuplicate(createDto, premiumUser);

      expect(result).toEqual({ exists: false, existingChart: null });
    });
  });

  describe('GET /birth-chart/history/:id/pdf', () => {
    it('should set PDF headers and send buffer', async () => {
      const mockResponse: Partial<Response> = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      const pdfBuffer = Buffer.from('pdf-content');
      mockHistoryService.generatePdfFromSaved.mockResolvedValue({
        buffer: pdfBuffer,
        filename: 'carta-astral-maria.pdf',
      });

      await controller.downloadSavedChartPdf(
        12,
        premiumUser,
        mockResponse as Response,
      );

      expect(mockHistoryService.generatePdfFromSaved).toHaveBeenCalledWith(
        12,
        premiumUser.userId,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="carta-astral-maria.pdf"',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(pdfBuffer);
    });

    it('should throw not found when saved chart does not exist', async () => {
      const mockResponse: Partial<Response> = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      mockHistoryService.generatePdfFromSaved.mockResolvedValue(null);

      await expect(
        controller.downloadSavedChartPdf(
          999,
          premiumUser,
          mockResponse as Response,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
