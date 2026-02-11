import { ExportReportDto } from '../../application/dto/report-export.dto';

/**
 * Type for CSV export data rows
 */
export type CSVDataRow = Record<string, string | number | boolean | null>;

/**
 * Type for PDF template data
 */
export type PDFTemplateData = Record<string, unknown>;

/**
 * Interface for Reports repository operations
 * Handles report generation and export
 */
export interface IReportsRepository {
  // Main report endpoint
  generateReport(dto: ExportReportDto): Promise<{
    filename: string;
    content: string;
    mimeType: string;
  }>;

  // Report generation
  generateTarotistaReport(
    tarotistaId: number,
    startDate: Date,
    endDate: Date,
    options?: ReportOptions,
  ): Promise<TarotistaReport>;

  generatePlatformReport(
    startDate: Date,
    endDate: Date,
    options?: ReportOptions,
  ): Promise<PlatformReport>;

  // Export
  exportToCSV(data: CSVDataRow[], columns: string[]): Promise<string>;
  exportToPDF(data: PDFTemplateData, template: string): Promise<Buffer>;
}

export interface ReportOptions {
  includeCharts?: boolean;
  includeDetails?: boolean;
  groupBy?: 'day' | 'week' | 'month';
  format?: 'json' | 'csv' | 'pdf';
}

export interface TarotistaReport {
  tarotistaId: number;
  nombrePublico: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalReadings: number;
    totalRevenue: number;
    averageRating: number;
    newSubscribers: number;
  };
  trends: {
    readingsGrowth: number;
    revenueGrowth: number;
    ratingChange: number;
  };
  topSpreads: Array<{
    spreadId: number;
    spreadName: string;
    count: number;
  }>;
  recentReviews: Array<{
    rating: number;
    comment: string;
    date: Date;
  }>;
}

export interface PlatformReport {
  period: {
    start: Date;
    end: Date;
  };
  overview: {
    totalTarotistas: number;
    activeTarotistas: number;
    totalReadings: number;
    totalRevenue: number;
  };
  topTarotistas: Array<{
    tarotistaId: number;
    nombrePublico: string;
    totalReadings: number;
    revenue: number;
    rating: number;
  }>;
  trends: {
    newTarotistas: number;
    readingsGrowth: number;
    revenueGrowth: number;
  };
}
