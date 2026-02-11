import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  HttpStatus,
  Logger,
  Inject,
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
import { OptionalJwtAuthGuard } from '../../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CheckUsageLimitGuard } from '../../../usage-limits/guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from '../../../usage-limits/interceptors/increment-usage.interceptor';
import { CheckUsageLimit } from '../../../usage-limits/decorators/check-usage-limit.decorator';
import { AllowAnonymous } from '../../../usage-limits/decorators/allow-anonymous.decorator';
import { UsageFeature } from '../../../usage-limits/entities/usage-limit.entity';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UserPlan } from '../../../users/entities/user.entity';
import { GenerateChartDto } from '../../application/dto/generate-chart.dto';
import { BasicChartResponseDto } from '../../application/dto/chart-response.dto';
import { FullChartResponseDto } from '../../application/dto/chart-response.dto';
import { PremiumChartResponseDto } from '../../application/dto/chart-response.dto';
import { GeocodePlaceDto } from '../../application/dto/geocode-place.dto';
import { GeocodeSearchResponseDto } from '../../application/dto/geocode-response.dto';

/**
 * Controlador REST para Carta Astral
 *
 * Endpoints:
 * - POST /birth-chart/generate - Generar carta (todos los planes)
 * - POST /birth-chart/generate/anonymous - Generar carta anónima
 * - POST /birth-chart/pdf - Descargar PDF (Free & Premium)
 * - GET /birth-chart/geocode - Buscar lugar de nacimiento
 * - GET /birth-chart/usage - Consultar límites de uso
 * - POST /birth-chart/synthesis - Generar síntesis IA (Premium)
 *
 * T-CA-018: Controlador Principal de Carta Astral
 */
@ApiTags('Birth Chart')
@Controller('birth-chart')
export class BirthChartController {
  private readonly logger = new Logger(BirthChartController.name);

  constructor(
    @Inject('BirthChartFacadeService')
    private readonly birthChartFacade: any,
    @Inject('GeocodeService')
    private readonly geocodeService: any,
  ) {}

  // ===========================================================================
  // GENERACIÓN DE CARTA
  // ===========================================================================

  /**
   * POST /birth-chart/generate
   * Genera una carta astral sin guardarla
   * Disponible para: Anónimos (1 lifetime), Free (3/mes), Premium (5/mes)
   */
  @Post('generate')
  @UseGuards(OptionalJwtAuthGuard, CheckUsageLimitGuard)
  @CheckUsageLimit(UsageFeature.BIRTH_CHART)
  @AllowAnonymous()
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
    type: PremiumChartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 429, description: 'Límite de uso alcanzado' })
  async generateChart(
    @Body() dto: GenerateChartDto,
    @CurrentUser() user: any | null,
    fingerprint?: string,
  ): Promise<
    BasicChartResponseDto | FullChartResponseDto | PremiumChartResponseDto
  > {
    this.logger.log(
      `Generating chart for ${user?.email || 'anonymous'} (${fingerprint})`,
    );

    // Determinar plan del usuario
    const plan = user?.plan || UserPlan.ANONYMOUS;

    // Generar carta según plan
    const result = await this.birthChartFacade.generateChart(
      dto,
      plan,
      user?.id || null,
    );

    return result;
  }

  /**
   * POST /birth-chart/generate/anonymous
   * Endpoint específico para usuarios anónimos (con fingerprint)
   */
  @Post('generate/anonymous')
  @UseGuards(CheckUsageLimitGuard)
  @CheckUsageLimit(UsageFeature.BIRTH_CHART)
  @AllowAnonymous()
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
    fingerprint: string,
  ): Promise<BasicChartResponseDto> {
    this.logger.log(
      `Generating anonymous chart for fingerprint: ${fingerprint}`,
    );

    return this.birthChartFacade.generateChart(
      dto,
      UserPlan.ANONYMOUS,
      null,
      fingerprint,
    );
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
    @CurrentUser() user: any,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Generating PDF for user ${user.email}`);

    const isPremium = user.plan === UserPlan.PREMIUM;
    const pdfResult = await this.birthChartFacade.generatePdf(
      dto,
      user,
      isPremium,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${pdfResult.filename}"`,
    );

    res.status(HttpStatus.OK).send(pdfResult.buffer);
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
    return this.geocodeService.searchPlaces(dto.query);
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
  async getUsage(@CurrentUser() user: any | null, fingerprint: string) {
    return this.birthChartFacade.getUsageStatus(user, fingerprint);
  }

  // ===========================================================================
  // SÍNTESIS IA (Premium only)
  // ===========================================================================

  /**
   * POST /birth-chart/synthesis
   * Genera síntesis IA para una carta existente (Premium)
   * Útil si la síntesis falló inicialmente o se quiere regenerar
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
        generatedAt: '2026-02-06T12:00:00Z',
        provider: 'groq',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Requiere plan Premium' })
  async generateSynthesis(
    @Body() dto: GenerateChartDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Generating AI synthesis for user ${user.email}`);

    return this.birthChartFacade.generateSynthesisOnly(dto, user.id);
  }
}
