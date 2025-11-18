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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReadingCategory } from './entities/reading-category.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Si es true, solo devuelve categorías activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías',
    type: [ReadingCategory],
  })
  findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<ReadingCategory[]> {
    return this.categoriesService.findAll(activeOnly === 'true');
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener una categoría por slug' })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: ReadingCategory,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findBySlug(@Param('slug') slug: string): Promise<ReadingCategory> {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: ReadingCategory,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findOne(@Param('id') id: string): Promise<ReadingCategory> {
    return this.categoriesService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear una nueva categoría (solo admins)' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: ReadingCategory,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere admin)' })
  @ApiResponse({ status: 409, description: 'El slug ya existe' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ReadingCategory> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar una categoría (solo admins)' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
    type: ReadingCategory,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere admin)' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 409, description: 'El slug ya existe' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ReadingCategory> {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar una categoría (solo admins)' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere admin)' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(+id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Activar/Desactivar una categoría (solo admins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la categoría actualizado',
    type: ReadingCategory,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere admin)' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  toggleActive(@Param('id') id: string): Promise<ReadingCategory> {
    return this.categoriesService.toggleActive(+id);
  }
}
