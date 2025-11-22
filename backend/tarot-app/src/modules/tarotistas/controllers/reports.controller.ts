import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { ExportReportDto } from '../dto/report-export.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Tarotistas - Reports')
@Controller('tarotistas/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('export')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Export revenue report in CSV or PDF format' })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', example: 'report-tarotista-1-2025-01.csv' },
        content: { type: 'string', description: 'Base64 encoded file content' },
        mimeType: { type: 'string', example: 'text/csv' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tarotista not found',
  })
  async exportReport(@Body() dto: ExportReportDto) {
    return this.reportsService.generateReport(dto);
  }
}
