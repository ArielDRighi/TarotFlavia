import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { PremiumGuard } from '../../../auth/infrastructure/guards/premium.guard';
import {
  ChartHistoryResponseDto,
  CreateBirthChartDto,
  PremiumChartResponseDto,
  SavedChartSummaryDto,
} from '../../application/dto';
import { UserPlan } from '../../../users/entities/user.entity';

interface UserFromToken {
  userId: number;
  email: string;
  plan: UserPlan;
}

interface DuplicateChartSummary {
  id: number;
  name: string;
}

interface IBirthChartHistoryService {
  getUserCharts(
    userId: number,
    page: number,
    limit: number,
  ): Promise<ChartHistoryResponseDto>;
  getChartById(
    chartId: number,
    userId: number,
  ): Promise<PremiumChartResponseDto | null>;
  checkDuplicate(
    userId: number,
    birthDate: string,
    birthTime: string,
    latitude: number,
    longitude: number,
  ): Promise<boolean>;
  saveChart(
    userId: number,
    dto: CreateBirthChartDto,
  ): Promise<SavedChartSummaryDto>;
  renameChart(
    chartId: number,
    userId: number,
    newName: string,
  ): Promise<boolean>;
  deleteChart(chartId: number, userId: number): Promise<boolean>;
  findDuplicate(
    userId: number,
    birthDate: string,
    birthTime: string,
    latitude: number,
    longitude: number,
  ): Promise<DuplicateChartSummary | null>;
  generatePdfFromSaved(
    chartId: number,
    userId: number,
  ): Promise<{ buffer: Buffer; filename: string } | null>;
}

@ApiTags('Birth Chart History')
@Controller('birth-chart/history')
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class BirthChartHistoryController {
  private readonly logger = new Logger(BirthChartHistoryController.name);

  constructor(
    @Inject('BirthChartHistoryService')
    private readonly historyService: IBirthChartHistoryService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar cartas guardadas',
    description:
      'Obtiene el historial de cartas astrales guardadas del usuario Premium.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, type: ChartHistoryResponseDto })
  @ApiResponse({ status: 403, description: 'Requiere plan Premium' })
  getHistory(
    @CurrentUser() user: UserFromToken,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<ChartHistoryResponseDto> {
    this.ensurePremium(user);
    this.logger.log(`Fetching chart history for user ${user.userId}`);

    return this.historyService.getUserCharts(user.userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener carta guardada',
    description: 'Obtiene el detalle completo de una carta del historial.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: PremiumChartResponseDto })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async getChart(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromToken,
  ): Promise<PremiumChartResponseDto> {
    this.ensurePremium(user);
    this.logger.log(`Fetching chart ${id} for user ${user.userId}`);

    const chart = await this.historyService.getChartById(id, user.userId);

    if (!chart) {
      throw new NotFoundException('Carta no encontrada');
    }

    return chart;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Guardar carta en historial',
    description: 'Guarda una carta astral en el historial del usuario Premium.',
  })
  @ApiResponse({ status: 201, type: SavedChartSummaryDto })
  @ApiResponse({ status: 409, description: 'Carta duplicada' })
  async saveChart(
    @Body() dto: CreateBirthChartDto,
    @CurrentUser() user: UserFromToken,
  ): Promise<SavedChartSummaryDto> {
    this.ensurePremium(user);
    this.logger.log(`Saving chart for user ${user.userId}`);

    const exists = await this.historyService.checkDuplicate(
      user.userId,
      dto.birthDate,
      dto.birthTime,
      dto.latitude,
      dto.longitude,
    );

    if (exists) {
      throw new ConflictException(
        'Ya existe una carta guardada con estos datos de nacimiento',
      );
    }

    return this.historyService.saveChart(user.userId, dto);
  }

  @Post(':id/name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renombrar carta',
    description: 'Actualiza el nombre identificador de una carta guardada.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    schema: { example: { id: 1, name: 'Carta de mamá' } },
  })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async renameChart(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name: string,
    @CurrentUser() user: UserFromToken,
  ): Promise<{ id: number; name: string }> {
    this.ensurePremium(user);
    this.logger.log(`Renaming chart ${id} for user ${user.userId}`);

    const updated = await this.historyService.renameChart(
      id,
      user.userId,
      name,
    );

    if (!updated) {
      throw new NotFoundException('Carta no encontrada');
    }

    return { id, name };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar carta del historial',
    description: 'Elimina una carta guardada del historial.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Carta eliminada' })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async deleteChart(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromToken,
  ): Promise<void> {
    this.ensurePremium(user);
    this.logger.log(`Deleting chart ${id} for user ${user.userId}`);

    const deleted = await this.historyService.deleteChart(id, user.userId);

    if (!deleted) {
      throw new NotFoundException('Carta no encontrada');
    }
  }

  @Post('check-duplicate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar carta duplicada',
    description:
      'Verifica si ya existe una carta guardada con los mismos datos de nacimiento.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        exists: true,
        existingChart: { id: 1, name: 'Mi carta natal' },
      },
    },
  })
  async checkDuplicate(
    @Body() dto: CreateBirthChartDto,
    @CurrentUser() user: UserFromToken,
  ): Promise<{ exists: boolean; existingChart: DuplicateChartSummary | null }> {
    this.ensurePremium(user);

    const existing = await this.historyService.findDuplicate(
      user.userId,
      dto.birthDate,
      dto.birthTime,
      dto.latitude,
      dto.longitude,
    );

    return {
      exists: !!existing,
      existingChart: existing ? { id: existing.id, name: existing.name } : null,
    };
  }

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Descargar PDF de carta guardada',
    description:
      'Descarga el PDF de una carta del historial sin consumir límite de generación.',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, content: { 'application/pdf': {} } })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async downloadSavedChartPdf(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserFromToken,
    @Res() res: Response,
  ): Promise<void> {
    this.ensurePremium(user);
    this.logger.log(`Downloading PDF for saved chart ${id}`);

    const pdfResult = await this.historyService.generatePdfFromSaved(
      id,
      user.userId,
    );

    if (!pdfResult) {
      throw new NotFoundException('Carta no encontrada');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${pdfResult.filename}"`,
    );
    res.send(pdfResult.buffer);
  }

  private ensurePremium(user: UserFromToken): void {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'El historial de cartas está disponible solo para usuarios Premium',
      );
    }
  }
}
