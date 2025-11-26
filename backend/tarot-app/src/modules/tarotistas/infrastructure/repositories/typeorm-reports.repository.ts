import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IReportsRepository,
  TarotistaReport,
  PlatformReport,
} from '../../domain/interfaces/reports-repository.interface';
import {
  ExportReportDto,
  ReportFormat,
  MetricsPeriod,
} from '../../application/dto';
import { TarotistaRevenueMetrics } from '../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../entities/tarotista.entity';
import * as PDFDocument from 'pdfkit';

/**
 * TypeORM implementation of IReportsRepository
 * Handles report generation (CSV, PDF)
 */
@Injectable()
export class TypeOrmReportsRepository implements IReportsRepository {
  constructor(
    @InjectRepository(TarotistaRevenueMetrics)
    private readonly revenueRepo: Repository<TarotistaRevenueMetrics>,
    @InjectRepository(Tarotista)
    private readonly tarotistaRepo: Repository<Tarotista>,
  ) {}

  async generateReport(
    dto: ExportReportDto,
  ): Promise<{ filename: string; content: string; mimeType: string }> {
    // Validate tarotista if specified
    if (dto.tarotistaId) {
      const tarotista = await this.tarotistaRepo.findOne({
        where: { id: dto.tarotistaId },
      });
      if (!tarotista) {
        throw new NotFoundException(
          `Tarotista with ID ${dto.tarotistaId} not found`,
        );
      }
    }

    // Calculate period
    const { start, end } = this.calculatePeriodDates(
      dto.period,
      dto.startDate,
      dto.endDate,
    );

    // Get revenue data
    const queryBuilder = this.revenueRepo
      .createQueryBuilder('revenue')
      .leftJoinAndSelect('revenue.user', 'user')
      .where('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .orderBy('revenue.calculationDate', 'DESC');

    if (dto.tarotistaId) {
      queryBuilder.andWhere('revenue.tarotistaId = :tarotistaId', {
        tarotistaId: dto.tarotistaId,
      });
    }

    const revenueData = await queryBuilder.getMany();

    // Generate report based on format
    if (dto.format === ReportFormat.PDF) {
      return await this.generatePdfReport(revenueData, dto);
    } else {
      return this.generateCsvReport(revenueData, dto);
    }
  }

  /**
   * Generate CSV report
   */
  private generateCsvReport(
    data: TarotistaRevenueMetrics[],
    dto: ExportReportDto,
  ): { filename: string; content: string; mimeType: string } {
    // CSV header
    const headers = [
      'Fecha',
      'ID Lectura',
      'ID Usuario',
      'Email',
      'Suscripción',
      'Revenue Tarotista',
      'Comisión Plataforma',
      'Total',
    ];

    const rows = [headers.join(',')];

    // Add data rows
    data.forEach((revenue) => {
      const row = [
        new Date(revenue.calculationDate).toISOString(),
        revenue.readingId?.toString() || 'N/A',
        revenue.userId.toString(),
        this.escapeCsvField(revenue.user?.email || 'N/A'),
        revenue.subscriptionType,
        Number(revenue.revenueShareUsd).toFixed(2),
        Number(revenue.platformFeeUsd).toFixed(2),
        Number(revenue.totalRevenueUsd).toFixed(2),
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    const content = Buffer.from(csvContent, 'utf-8').toString('base64');
    const filename = this.generateFilename(dto, 'csv');

    return { filename, content, mimeType: 'text/csv' };
  }

  /**
   * Generate PDF report
   */
  private async generatePdfReport(
    data: TarotistaRevenueMetrics[],
    dto: ExportReportDto,
  ): Promise<{ filename: string; content: string; mimeType: string }> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Title
    doc.fontSize(18).text('Reporte de Revenue', { align: 'center' });
    doc.moveDown();

    // Period information
    const { start, end } = this.calculatePeriodDates(
      dto.period,
      dto.startDate,
      dto.endDate,
    );
    doc
      .fontSize(12)
      .text(
        `Período: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      );
    doc.moveDown();

    // Totals
    const totalRevenue = data.reduce(
      (sum, r) => sum + Number(r.totalRevenueUsd),
      0,
    );
    const totalShare = data.reduce(
      (sum, r) => sum + Number(r.revenueShareUsd),
      0,
    );
    const totalFee = data.reduce((sum, r) => sum + Number(r.platformFeeUsd), 0);

    doc.fontSize(14).text('Resumen:', { underline: true });
    doc.fontSize(12).text(`Total Lecturas: ${data.length}`);
    doc.text(`Revenue Total: $${totalRevenue.toFixed(2)}`);
    doc.text(`Revenue Tarotistas: $${totalShare.toFixed(2)}`);
    doc.text(`Comisión Plataforma: $${totalFee.toFixed(2)}`);
    doc.moveDown();

    // Data table
    doc.fontSize(12).text('Detalle:', { underline: true });
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    doc.fontSize(10);

    data.forEach((revenue, index) => {
      const y = tableTop + index * 60;

      if (y > 700) {
        doc.addPage();
      }

      doc.text(`Lectura #${revenue.readingId}`, 50, y);
      doc.text(
        `Fecha: ${new Date(revenue.calculationDate).toLocaleDateString()}`,
        50,
        y + 15,
      );
      doc.text(`Usuario: ${revenue.user?.email || 'N/A'}`, 50, y + 30);
      doc.text(
        `Revenue: $${Number(revenue.totalRevenueUsd).toFixed(2)}`,
        50,
        y + 45,
      );
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const content = pdfBuffer.toString('base64');
        const filename = this.generateFilename(dto, 'pdf');

        resolve({ filename, content, mimeType: 'application/pdf' });
      });
    });
  }

  /**
   * Escape CSV field
   */
  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Generate filename
   */
  private generateFilename(dto: ExportReportDto, extension: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const tarotistaId = dto.tarotistaId ? `_T${dto.tarotistaId}` : '_PLATFORM';
    return `revenue_report${tarotistaId}_${timestamp}.${extension}`;
  }

  /**
   * Calculate period dates
   */
  private calculatePeriodDates(
    period?: MetricsPeriod,
    startDate?: string,
    endDate?: string,
  ): { start: Date; end: Date } {
    const now = new Date();

    if (period === MetricsPeriod.CUSTOM) {
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required for CUSTOM period');
      }
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    let start: Date;
    let end: Date = new Date(now);

    switch (period) {
      case MetricsPeriod.DAY:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case MetricsPeriod.WEEK:
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case MetricsPeriod.YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      case MetricsPeriod.MONTH:
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        break;
    }

    return { start, end };
  }

  // Placeholder implementations for old interface methods
  generateTarotistaReport(): Promise<TarotistaReport> {
    throw new Error('Not implemented - use generateReport() instead');
  }

  generatePlatformReport(): Promise<PlatformReport> {
    throw new Error('Not implemented - use generateReport() instead');
  }

  exportToCSV(): Promise<string> {
    throw new Error('Not implemented - use generateReport() instead');
  }

  exportToPDF(): Promise<Buffer> {
    throw new Error('Not implemented - use generateReport() instead');
  }
}
