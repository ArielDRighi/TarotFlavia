import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TarotistasOrchestratorService } from '../../application/services/tarotistas-orchestrator.service';
import { ExportReportDto } from '../../application/dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Tarotistas - Reports')
@Controller('tarotistas/reports')
export class ReportsController {
  constructor(private readonly orchestrator: TarotistasOrchestratorService) {}

  @Post('export')
  @HttpCode(200)
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
    return this.orchestrator.generateReport(dto);
  }
}
