import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PredefinedQuestionsService } from './predefined-questions.service';
import { CreatePredefinedQuestionDto } from './dto/create-predefined-question.dto';
import { UpdatePredefinedQuestionDto } from './dto/update-predefined-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Preguntas Predefinidas')
@Controller('predefined-questions')
export class PredefinedQuestionsController {
  constructor(
    private readonly predefinedQuestionsService: PredefinedQuestionsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar preguntas predefinidas',
    description:
      'Retorna todas las preguntas predefinidas, opcionalmente filtradas por categoría',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'ID de la categoría para filtrar preguntas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de preguntas predefinidas retornada exitosamente',
  })
  findAll(
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
  ) {
    if (categoryId) {
      return this.predefinedQuestionsService.findByCategoryId(categoryId);
    }
    return this.predefinedQuestionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener pregunta predefinida por ID',
    description: 'Retorna una pregunta predefinida específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Pregunta predefinida encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta predefinida no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.predefinedQuestionsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear pregunta predefinida',
    description: 'Crea una nueva pregunta predefinida (solo administradores)',
  })
  @ApiResponse({
    status: 201,
    description: 'Pregunta predefinida creada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - solo administradores',
  })
  create(@Body() createPredefinedQuestionDto: CreatePredefinedQuestionDto) {
    return this.predefinedQuestionsService.create(createPredefinedQuestionDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar pregunta predefinida',
    description:
      'Actualiza una pregunta predefinida existente (solo administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pregunta predefinida actualizada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - solo administradores',
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta predefinida no encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updatePredefinedQuestionDto: UpdatePredefinedQuestionDto,
  ) {
    return this.predefinedQuestionsService.update(
      +id,
      updatePredefinedQuestionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar pregunta predefinida',
    description:
      'Elimina (soft-delete) una pregunta predefinida (solo administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pregunta predefinida eliminada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - solo administradores',
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta predefinida no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.predefinedQuestionsService.remove(+id);
  }
}
