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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { TarotCard } from './entities/tarot-card.entity';

@ApiTags('Cartas')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cartas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las cartas',
    type: [TarotCard],
  })
  async getAllCards() {
    return this.cardsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una carta específica' })
  @ApiParam({ name: 'id', description: 'ID de la carta' })
  @ApiResponse({
    status: 200,
    description: 'Carta encontrada',
    type: TarotCard,
  })
  @ApiResponse({ status: 404, description: 'Carta no encontrada' })
  async getCardById(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.findById(id);
  }

  @Get('deck/:deckId')
  @ApiOperation({ summary: 'Obtener todas las cartas de un mazo específico' })
  @ApiParam({ name: 'deckId', description: 'ID del mazo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cartas del mazo',
    type: [TarotCard],
  })
  @ApiResponse({ status: 404, description: 'Mazo no encontrado' })
  async getCardsByDeck(@Param('deckId', ParseIntPipe) deckId: number) {
    return this.cardsService.findByDeck(deckId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva carta (solo admin)' })
  @ApiResponse({
    status: 201,
    description: 'Carta creada con éxito',
    type: TarotCard,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async createCard(
    @Request() req: { user: { isAdmin: boolean } },
    @Body() createCardDto: CreateCardDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Solo administradores pueden crear cartas');
    }
    return this.cardsService.create(createCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una carta (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID de la carta a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Carta actualizada con éxito',
    type: TarotCard,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async updateCard(
    @Request() req: { user: { isAdmin: boolean } },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden actualizar cartas',
      );
    }
    return this.cardsService.update(id, updateCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una carta (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID de la carta a eliminar' })
  @ApiResponse({ status: 200, description: 'Carta eliminada con éxito' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async removeCard(
    @Request() req: { user: { isAdmin: boolean } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar cartas',
      );
    }
    await this.cardsService.remove(id);
    return { message: 'Carta eliminada con éxito' };
  }
}
