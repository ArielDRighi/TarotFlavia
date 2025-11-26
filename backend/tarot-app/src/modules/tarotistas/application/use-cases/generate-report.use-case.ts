import { Injectable, Inject } from '@nestjs/common';
import { IReportsRepository } from '../../domain/interfaces/reports-repository.interface';
import { ExportReportDto } from '../dto/report-export.dto';

export interface ReportResult {
  filename: string;
  content: string;
  mimeType: string;
}

@Injectable()
export class GenerateReportUseCase {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepository: IReportsRepository,
  ) {}

  async execute(dto: ExportReportDto): Promise<ReportResult> {
    return await this.reportsRepository.generateReport(dto);
  }
}
