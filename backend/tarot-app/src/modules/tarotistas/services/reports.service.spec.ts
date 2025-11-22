import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { TarotistaRevenueMetrics } from '../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../entities/tarotista.entity';
import { ExportReportDto, ReportFormat } from '../dto/report-export.dto';
import { MetricsPeriod } from '../dto/metrics-query.dto';
import { NotFoundException } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let _revenueMetricsRepository: Repository<TarotistaRevenueMetrics>;
  let tarotistaRepository: Repository<Tarotista>;

  const mockTarotista: Partial<Tarotista> = {
    id: 1,
    nombrePublico: 'Flavia',
  };

  const mockRevenueData = [
    {
      id: 1,
      calculationDate: new Date('2025-01-15T10:30:00Z'),
      readingId: 123,
      userId: 45,
      tarotistaId: 1,
      totalRevenueUsd: 50.0,
      revenueShareUsd: 35.0,
      platformFeeUsd: 15.0,
      commissionRate: 0.3,
      subscriptionType: 'premium_individual',
      user: {
        email: 'usuario@ejemplo.com',
      },
    },
    {
      id: 2,
      calculationDate: new Date('2025-01-20T15:45:00Z'),
      readingId: 124,
      userId: 46,
      tarotistaId: 1,
      totalRevenueUsd: 60.0,
      revenueShareUsd: 42.0,
      platformFeeUsd: 18.0,
      commissionRate: 0.3,
      subscriptionType: 'premium_family',
      user: {
        email: 'usuario2@ejemplo.com',
      },
    },
  ];

  // Shared QueryBuilder mock
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(TarotistaRevenueMetrics),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Tarotista),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    _revenueMetricsRepository = module.get<Repository<TarotistaRevenueMetrics>>(
      getRepositoryToken(TarotistaRevenueMetrics),
    );
    tarotistaRepository = module.get<Repository<Tarotista>>(
      getRepositoryToken(Tarotista),
    );

    // Reset mocks
    jest.clearAllMocks();
    mockQueryBuilder.getMany.mockReset();
  });

  describe('generateReport', () => {
    it('should generate CSV report for tarotista with MONTH period', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        format: ReportFormat.CSV,
        period: MetricsPeriod.MONTH,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getMany.mockResolvedValue(mockRevenueData);

      const result = await service.generateReport(dto);

      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.content).toContain(
        'Fecha,ID Lectura,ID Usuario,Email,Suscripción',
      );
      expect(result.content).toContain('usuario@ejemplo.com');
      expect(result.content).toContain('usuario2@ejemplo.com');
      expect(result.content).toContain('50.00');
      expect(result.content).toContain('60.00');
      expect(result.filename).toMatch(
        /revenue-report-tarotista-1-\d{4}-\d{2}-\d{2}\.csv/,
      );
    });

    it('should throw NotFoundException if tarotista does not exist', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 999,
        format: ReportFormat.CSV,
        period: MetricsPeriod.MONTH,
      };

      jest.spyOn(tarotistaRepository, 'findOne').mockResolvedValue(null);

      await expect(service.generateReport(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.generateReport(dto)).rejects.toThrow(
        'Tarotista with ID 999 not found',
      );
    });

    it('should generate report for all tarotistas when tarotistaId is not provided (admin)', async () => {
      const dto: ExportReportDto = {
        format: ReportFormat.CSV,
        period: MetricsPeriod.MONTH,
      };

      mockQueryBuilder.getMany.mockResolvedValue(mockRevenueData);

      const result = await service.generateReport(dto);

      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.content).toContain(
        'Fecha,ID Lectura,ID Usuario,Email,Suscripción',
      );
      expect(result.filename).toMatch(
        /revenue-report-platform-\d{4}-\d{2}-\d{2}\.csv/,
      );
    });

    it('should handle empty data gracefully', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        format: ReportFormat.CSV,
        period: MetricsPeriod.WEEK,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.generateReport(dto);

      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.content).toContain(
        'Fecha,ID Lectura,ID Usuario,Email,Suscripción',
      );
      // Only header line when no data
      expect(result.content.split('\n').length).toBe(1);
    });

    it('should generate report with CUSTOM period', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        format: ReportFormat.CSV,
        period: MetricsPeriod.CUSTOM,
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getMany.mockResolvedValue(mockRevenueData);

      const result = await service.generateReport(dto);

      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.content).toContain('usuario@ejemplo.com');
    });

    it('should generate PDF report for tarotista', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        format: ReportFormat.PDF,
        period: MetricsPeriod.MONTH,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getMany.mockResolvedValue(mockRevenueData);

      const result = await service.generateReport(dto);

      expect(result.format).toBe(ReportFormat.PDF);
      // PDF content is base64 encoded, decode it to check
      const pdfContent = Buffer.from(result.content, 'base64').toString();
      expect(pdfContent).toContain('%PDF');
      expect(result.filename).toMatch(
        /revenue-report-tarotista-1-\d{4}-\d{2}-\d{2}\.pdf/,
      );
    });

    it('should handle DAY period correctly', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        format: ReportFormat.CSV,
        period: MetricsPeriod.DAY,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getMany.mockResolvedValue(mockRevenueData);

      const result = await service.generateReport(dto);

      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.content).toContain('usuario@ejemplo.com');
    });

    it('should handle YEAR period correctly', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        format: ReportFormat.CSV,
        period: MetricsPeriod.YEAR,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      mockQueryBuilder.getMany.mockResolvedValue(mockRevenueData);

      const result = await service.generateReport(dto);

      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.content).toContain('usuario@ejemplo.com');
    });
  });
});
