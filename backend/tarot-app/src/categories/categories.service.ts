import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ReadingCategory } from './entities/reading-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ReadingCategory)
    private readonly categoryRepository: Repository<ReadingCategory>,
  ) {}

  async findAll(activeOnly = false): Promise<ReadingCategory[]> {
    const options: FindManyOptions<ReadingCategory> = {
      order: { order: 'ASC' },
    };

    if (activeOnly) {
      options.where = { isActive: true };
    }

    return this.categoryRepository.find(options);
  }

  async findOne(id: number): Promise<ReadingCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<ReadingCategory> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
    });
    if (!category) {
      throw new NotFoundException(`Categoría con slug "${slug}" no encontrada`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<ReadingCategory> {
    // Verificar que el slug no exista
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Ya existe una categoría con el slug "${createCategoryDto.slug}"`,
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ReadingCategory> {
    const category = await this.findOne(id);

    // Si se está actualizando el slug, verificar que no exista
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException(
          `Ya existe una categoría con el slug "${updateCategoryDto.slug}"`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verifica que existe
    await this.categoryRepository.delete(id);
  }

  async toggleActive(id: number): Promise<ReadingCategory> {
    const category = await this.findOne(id);
    category.isActive = !category.isActive;
    return this.categoryRepository.save(category);
  }
}
