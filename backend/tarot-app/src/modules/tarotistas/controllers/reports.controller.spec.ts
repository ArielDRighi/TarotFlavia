import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../services/reports.service';
import { ExportReportDto, ReportFormat } from '../dto/report-export.dto';
import { MetricsPeriod } from '../dto/metrics-query.dto';
import { NotFoundException } from '@nestjs/common';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: ReportsService;

  const mockCsvReport = {
    filename: 'report-tarotista-1-2025-01.csv',
    content: Buffer.from(
      'tarotistaId,nombrePublico,totalReadings\n1,Flavia,150',
    ).toString('base64'),
    format: ReportFormat.CSV,
  };

  const mockPdfReport = {
    filename: 'report-platform-2025-01.pdf',
    content: Buffer.from('%PDF-1.3\n...').toString('base64'),
    format: ReportFormat.PDF,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            generateReport: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  describe('exportReport', () => {
    it('should generate CSV report for a tarotista', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        period: MetricsPeriod.MONTH,
        format: ReportFormat.CSV,
      };

      jest
        .spyOn(reportsService, 'generateReport')
        .mockResolvedValue(mockCsvReport);

      const result = await controller.exportReport(dto);

      expect(result).toEqual(mockCsvReport);
      expect(reportsService.generateReport).toHaveBeenCalledWith(dto);
    });

    it('should generate PDF report for a tarotista', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        period: MetricsPeriod.MONTH,
        format: ReportFormat.PDF,
      };

      jest
        .spyOn(reportsService, 'generateReport')
        .mockResolvedValue(mockPdfReport);

      const result = await controller.exportReport(dto);

      expect(result).toEqual(mockPdfReport);
      expect(reportsService.generateReport).toHaveBeenCalledWith(dto);
    });

    it('should generate platform-wide report (admin)', async () => {
      const dto: ExportReportDto = {
        period: MetricsPeriod.YEAR,
        format: ReportFormat.CSV,
      };

      jest
        .spyOn(reportsService, 'generateReport')
        .mockResolvedValue(mockCsvReport);

      const result = await controller.exportReport(dto);

      expect(result).toEqual(mockCsvReport);
      expect(reportsService.generateReport).toHaveBeenCalledWith(dto);
    });

    it('should throw NotFoundException for invalid tarotista', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 999,
        period: MetricsPeriod.MONTH,
        format: ReportFormat.CSV,
      };

      jest
        .spyOn(reportsService, 'generateReport')
        .mockRejectedValue(
          new NotFoundException('Tarotista with ID 999 not found'),
        );

      await expect(controller.exportReport(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle CUSTOM period', async () => {
      const dto: ExportReportDto = {
        tarotistaId: 1,
        period: MetricsPeriod.CUSTOM,
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
        format: ReportFormat.PDF,
      };

      jest
        .spyOn(reportsService, 'generateReport')
        .mockResolvedValue(mockPdfReport);

      const result = await controller.exportReport(dto);

      expect(result).toEqual(mockPdfReport);
    });
  });
});
