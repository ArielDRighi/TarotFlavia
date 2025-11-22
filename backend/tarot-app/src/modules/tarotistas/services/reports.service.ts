import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotistaRevenueMetrics } from '../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../entities/tarotista.entity';
import { ExportReportDto, ReportFormat } from '../dto/report-export.dto';
import { MetricsPeriod } from '../dto/metrics-query.dto';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TarotistaRevenueMetrics)
    private readonly revenueMetricsRepository: Repository<TarotistaRevenueMetrics>,
    @InjectRepository(Tarotista)
    private readonly tarotistaRepository: Repository<Tarotista>,
  ) {}

  /**
   * Genera reporte de revenue en el formato solicitado
   */
  async generateReport(
    dto: ExportReportDto,
  ): Promise<{ format: ReportFormat; content: string; filename: string }> {
    // Validar tarotista si se especifica
    if (dto.tarotistaId) {
      const tarotista = await this.tarotistaRepository.findOne({
        where: { id: dto.tarotistaId },
      });
      if (!tarotista) {
        throw new NotFoundException(
          `Tarotista with ID ${dto.tarotistaId} not found`,
        );
      }
    }

    // Calcular período
    const { start, end } = this.calculatePeriodDates(
      dto.period,
      dto.startDate,
      dto.endDate,
    );

    // Obtener datos de revenue
    const queryBuilder = this.revenueMetricsRepository
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

    // Generar reporte según formato
    if (dto.format === ReportFormat.PDF) {
      return await this.generatePdfReport(revenueData, dto);
    } else {
      return this.generateCsvReport(revenueData, dto);
    }
  }

  /**
   * Genera reporte en formato CSV
   */
  private generateCsvReport(
    data: TarotistaRevenueMetrics[],
    dto: ExportReportDto,
  ): { format: ReportFormat; content: string; filename: string } {
    // Header CSV
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

    // Agregar filas de datos
    data.forEach((revenue) => {
      const row = [
        revenue.calculationDate.toISOString(),
        revenue.readingId?.toString() || 'N/A',
        revenue.userId.toString(),
        revenue.user?.email || 'N/A',
        revenue.subscriptionType,
        revenue.revenueShareUsd.toFixed(2),
        revenue.platformFeeUsd.toFixed(2),
        revenue.totalRevenueUsd.toFixed(2),
      ];
      rows.push(row.join(','));
    });

    const content = rows.join('\n');
    const filename = this.generateFilename(dto, 'csv');

    return { format: ReportFormat.CSV, content, filename };
  }

  /**
   * Genera reporte en formato PDF
   */
  private async generatePdfReport(
    data: TarotistaRevenueMetrics[],
    dto: ExportReportDto,
  ): Promise<{ format: ReportFormat; content: string; filename: string }> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Título
    doc.fontSize(18).text('Reporte de Revenue', { align: 'center' });
    doc.moveDown();

    // Información del período
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

    // Totales
    const totalRevenue = data.reduce((sum, r) => sum + r.totalRevenueUsd, 0);
    const totalShare = data.reduce((sum, r) => sum + r.revenueShareUsd, 0);
    const totalFee = data.reduce((sum, r) => sum + r.platformFeeUsd, 0);

    doc.fontSize(14).text('Resumen:', { underline: true });
    doc.fontSize(11).text(`Total Transacciones: ${data.length}`);
    doc.text(`Revenue Tarotista: $${totalShare.toFixed(2)}`);
    doc.text(`Comisión Plataforma: $${totalFee.toFixed(2)}`);
    doc.text(`Total Bruto: $${totalRevenue.toFixed(2)}`);
    doc.moveDown();

    // Tabla de datos
    if (data.length > 0) {
      doc.fontSize(12).text('Detalle de Transacciones:', { underline: true });
      doc.moveDown(0.5);

      data.forEach((revenue, index) => {
        if (index > 0 && index % 10 === 0) {
          doc.addPage();
        }

        doc.fontSize(10);
        doc.text(`${index + 1}. ${revenue.calculationDate.toLocaleString()}`);
        doc.text(
          `   Usuario: ${revenue.user?.email || 'N/A'} (ID: ${revenue.userId})`,
        );
        doc.text(`   Lectura ID: ${revenue.readingId || 'N/A'}`);
        doc.text(
          `   Revenue: $${revenue.revenueShareUsd.toFixed(2)} | Comisión: $${revenue.platformFeeUsd.toFixed(2)} | Total: $${revenue.totalRevenueUsd.toFixed(2)}`,
        );
        doc.moveDown(0.3);
      });
    }

    doc.end();

    // Esperar a que el PDF termine de generarse
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const content = pdfBuffer.toString('base64');
        const filename = this.generateFilename(dto, 'pdf');
        resolve({ format: ReportFormat.PDF, content, filename });
      });
    });
  }

  /**
   * Genera nombre de archivo para el reporte
   */
  private generateFilename(dto: ExportReportDto, extension: string): string {
    const date = new Date().toISOString().split('T')[0];
    const scope = dto.tarotistaId ? `tarotista-${dto.tarotistaId}` : 'platform';
    return `revenue-report-${scope}-${date}.${extension}`;
  }

  /**
   * Calcula fechas de inicio y fin según el período
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
}
