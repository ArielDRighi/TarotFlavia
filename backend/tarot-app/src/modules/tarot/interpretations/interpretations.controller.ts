import { Controller, Post, Body, UseGuards, Delete, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { InterpretationsService } from './interpretations.service';
import { InterpretationCacheService } from '../../cache/application/services/interpretation-cache.service';
import { GenerateInterpretationDto } from './dto/generate-interpretation.dto';

@ApiTags('Interpretaciones')
@Controller('interpretations')
export class InterpretationsController {
  constructor(
    private readonly interpretationsService: InterpretationsService,
    private readonly cacheService: InterpretationCacheService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generar interpretación para un conjunto de cartas',
    description:
      'Genera una interpretación basada en las cartas seleccionadas y sus posiciones',
  })
  @ApiBody({ type: GenerateInterpretationDto })
  @ApiResponse({
    status: 200,
    description: 'Interpretación generada con éxito',
  })
  generateInterpretation(@Body() generateDto: GenerateInterpretationDto) {
    // For now, return a placeholder response
    // The full implementation would fetch cards and generate interpretation
    return {
      interpretation:
        'Interpretation generation requires integration with cards service',
      cardIds: generateDto.cardIds,
      positions: generateDto.positions,
      question: generateDto.question,
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/cache')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Limpiar caché de interpretaciones (Admin)',
    description:
      'Elimina todas las interpretaciones cacheadas en memoria y base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Caché limpiado exitosamente',
  })
  async clearCache() {
    await this.cacheService.clearAllCaches();
    return {
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/cache/stats')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estadísticas del caché (Admin)',
    description: 'Retorna métricas sobre el uso del caché de interpretaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del caché',
  })
  async getCacheStats() {
    const dbStats = await this.cacheService.getCacheStats();
    const hitRate = this.interpretationsService.getCacheHitRate();

    return {
      database: dbStats,
      hitRate: {
        percentage: hitRate,
        description: `${Number.isFinite(hitRate) ? hitRate.toFixed(2) : '0.00'}% of requests served from cache`,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
