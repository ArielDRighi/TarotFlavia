import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { SpreadsService } from './spreads.service';
import { CreateSpreadDto } from './dto/create-spread.dto';
import { UpdateSpreadDto } from './dto/update-spread.dto';
import { TarotSpread } from './entities/tarot-spread.entity';

@ApiTags('Tiradas')
@Controller('spreads')
export class SpreadsController {
  constructor(private readonly spreadsService: SpreadsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tiradas disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiradas',
    type: [TarotSpread],
  })
  async getAllSpreads() {
    return this.spreadsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tirada específica' })
  @ApiParam({ name: 'id', description: 'ID de la tirada' })
  @ApiResponse({
    status: 200,
    description: 'Tirada encontrada',
    type: TarotSpread,
  })
  @ApiResponse({ status: 404, description: 'Tirada no encontrada' })
  async getSpreadById(@Param('id', ParseIntPipe) id: number) {
    return this.spreadsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear una nueva tirada (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tirada creada con éxito',
    type: TarotSpread,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async createSpread(
    @Request() req: { user: { userId?: number; isAdmin?: boolean } },
    @Body() createSpreadDto: CreateSpreadDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Solo administradores pueden crear tiradas');
    }
    return this.spreadsService.create(createSpreadDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar una tirada (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID de la tirada a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Tirada actualizada con éxito',
    type: TarotSpread,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  @ApiResponse({ status: 404, description: 'Tirada no encontrada' })
  async updateSpread(
    @Request() req: { user: { userId?: number; isAdmin?: boolean } },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpreadDto: UpdateSpreadDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden actualizar tiradas',
      );
    }
    return this.spreadsService.update(id, updateSpreadDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar una tirada (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID de la tirada a eliminar' })
  @ApiResponse({ status: 200, description: 'Tirada eliminada con éxito' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  @ApiResponse({ status: 404, description: 'Tirada no encontrada' })
  async removeSpread(
    @Request() req: { user: { userId?: number; isAdmin?: boolean } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar tiradas',
      );
    }
    await this.spreadsService.remove(id);
    return { message: 'Tirada eliminada con éxito' };
  }
}
