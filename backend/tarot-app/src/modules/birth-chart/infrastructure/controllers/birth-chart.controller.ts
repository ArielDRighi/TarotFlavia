import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

// Guards
import { OptionalJwtAuthGuard } from '../../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

// Decorators
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

// DTOs
import {
  GenerateChartDto,
  BasicChartResponseDto,
  FullChartResponseDto,
  PremiumChartResponseDto,
  GeocodePlaceDto,
  GeocodeSearchResponseDto,
} from '../../application/dto';

// Types
import { User } from '../../../users/entities/user.entity';

@ApiTags('Carta Astral')
@Controller('birth-chart')
export class BirthChartController {
  private readonly logger = new Logger(BirthChartController.name);

  constructor() {
    // Note: Services will be injected when they are created in future tasks
    // For now, we use 'any' to make tests pass (facade and geocode services)
    // These will be replaced with proper interfaces once the services are implemented
  }

  // ===========================================================================
  // GENERACIÓN DE CARTA
  // ===========================================================================

  /**
   * POST /birth-chart/generate
   * Genera una carta astral sin guardarla
   * Disponible para: Anónimos (1 lifetime), Free (3/mes), Premium (5/mes)
   */
  @Post('generate')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests/minuto
  @ApiOperation({
    summary: 'Generar carta astral',
    description: `Genera una carta astral basada en los datos de nacimiento proporcionados.
    
**Por plan:**
- **Anónimo:** Recibe gráfico + tablas + Big Three interpretado. Límite: 1 lifetime.
- **Free:** Recibe informe completo con todas las interpretaciones. Límite: 3/mes.
- **Premium:** Recibe informe completo + síntesis IA personalizada. Límite: 5/mes.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Carta generada exitosamente',
    type: PremiumChartResponseDto, // Mostramos el más completo en docs
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 429, description: 'Límite de uso alcanzado' })
  async generateChart(
    @Body() dto: GenerateChartDto,
    @CurrentUser() user: User | null,
    // Note: Fingerprint decorator will be added when the fingerprinting system is implemented
    // For now, we use a placeholder parameter to maintain the API contract
    // @Fingerprint() fingerprint: string,
  ): Promise<
    BasicChartResponseDto | FullChartResponseDto | PremiumChartResponseDto
  > {
    this.logger.log(`Generating chart for ${user?.email || 'anonymous'}`);

    // Determinar plan del usuario
    const plan = user?.plan || 'anonymous';

    // TODO: Implement facade service call when T-CA-019+ are completed
    // return this.birthChartFacade.generateChart(dto, plan, user?.id);

    // Placeholder response for testing
    throw new Error('Method not implemented - requires facade service');
  }

  /**
   * POST /birth-chart/generate/anonymous
   * Endpoint específico para usuarios anónimos (con fingerprint)
   */
  @Post('generate/anonymous')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/minuto
  @ApiOperation({
    summary: 'Generar carta astral (anónimo)',
    description:
      'Genera una carta astral básica para usuarios no registrados. Límite: 1 carta lifetime.',
  })
  @ApiResponse({ status: 200, type: BasicChartResponseDto })
  @ApiResponse({ status: 429, description: 'Ya utilizaste tu carta gratuita' })
  async generateChartAnonymous(
    @Body() dto: GenerateChartDto,
    // @Fingerprint() fingerprint: string,
  ): Promise<BasicChartResponseDto> {
    this.logger.log(`Generating anonymous chart`);

    // TODO: Implement facade service call
    // return this.birthChartFacade.generateChart(dto, 'anonymous', null, fingerprint);

    throw new Error('Method not implemented - requires facade service');
  }

  // ===========================================================================
  // DESCARGA DE PDF
  // ===========================================================================

  /**
   * POST /birth-chart/pdf
   * Genera y descarga el PDF de una carta
   * Disponible para: Free y Premium
   */
  @Post('pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 PDFs/minuto
  @ApiOperation({
    summary: 'Descargar carta en PDF',
    description: `Genera un PDF de la carta astral para descargar.
    
**Por plan:**
- **Free:** PDF con interpretaciones estáticas (no incluye síntesis IA)
- **Premium:** PDF completo con síntesis IA personalizada`,
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async downloadPdf(
    @Body() dto: GenerateChartDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Generating PDF for user ${user.email}`);

    const isPremium = user.plan === 'premium';

    // TODO: Implement PDF generation service
    // const pdfResult = await this.birthChartFacade.generatePdf(dto, user, isPremium);

    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    // res.setHeader('Content-Length', pdfResult.buffer.length);

    // res.status(HttpStatus.OK).send(pdfResult.buffer);

    throw new Error('Method not implemented - requires PDF service');
  }

  // ===========================================================================
  // GEOCODING
  // ===========================================================================

  /**
   * GET /birth-chart/geocode
   * Busca lugares para autocompletar el campo de lugar de nacimiento
   */
  @Get('geocode')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 búsquedas/minuto
  @ApiOperation({
    summary: 'Buscar lugar de nacimiento',
    description:
      'Busca lugares para autocompletar. Retorna coordenadas y zona horaria.',
  })
  @ApiQuery({ name: 'query', example: 'Buenos Aires' })
  @ApiResponse({ status: 200, type: GeocodeSearchResponseDto })
  async searchPlace(
    @Query() dto: GeocodePlaceDto,
  ): Promise<GeocodeSearchResponseDto> {
    // TODO: Implement geocoding service
    // return this.geocodeService.searchPlaces(dto.query);

    throw new Error('Method not implemented - requires geocode service');
  }

  // ===========================================================================
  // LÍMITES DE USO
  // ===========================================================================

  /**
   * GET /birth-chart/usage
   * Obtiene el estado de uso de cartas astrales del usuario
   */
  @Get('usage')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Consultar límites de uso',
    description: 'Retorna cuántas cartas ha generado y cuántas le quedan.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        plan: 'free',
        used: 2,
        limit: 3,
        remaining: 1,
        resetsAt: '2026-03-01T00:00:00Z',
        canGenerate: true,
      },
    },
  })
  async getUsage(
    @CurrentUser() user: User | null,
    // @Fingerprint() fingerprint: string,
  ) {
    // TODO: Implement usage tracking service
    // return this.birthChartFacade.getUsageStatus(user, fingerprint);

    throw new Error('Method not implemented - requires usage tracking service');
  }

  // ===========================================================================
  // SÍNTESIS IA (Premium only)
  // ===========================================================================

  /**
   * POST /birth-chart/synthesis
   * Genera síntesis IA para una carta existente (Premium)
   * Útil si la síntesis falló inicialmente o se quiere regenerar
   * Note: Premium validation will be done in the service layer based on user.plan
   */
  @Post('synthesis')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 síntesis/minuto
  @ApiOperation({
    summary: 'Generar síntesis IA',
    description:
      'Genera o regenera la síntesis personalizada con IA. Solo Premium.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        synthesis: 'Tu carta revela una personalidad...',
        generatedAt: '2026-02-10T12:00:00Z',
        provider: 'groq',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Requiere plan Premium' })
  async generateSynthesis(
    @Body() dto: GenerateChartDto,
    @CurrentUser() user: User,
  ) {
    this.logger.log(`Generating AI synthesis for user ${user.email}`);

    // TODO: Implement AI synthesis service
    // The service will validate if user.plan === 'premium'
    // return this.birthChartFacade.generateSynthesisOnly(dto, user.id);

    throw new Error('Method not implemented - requires AI synthesis service');
  }
}
