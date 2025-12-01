import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredefinedQuestion } from './entities/predefined-question.entity';
import { CreatePredefinedQuestionDto } from './dto/create-predefined-question.dto';
import { UpdatePredefinedQuestionDto } from './dto/update-predefined-question.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class PredefinedQuestionsService {
  constructor(
    @InjectRepository(PredefinedQuestion)
    private readonly predefinedQuestionRepository: Repository<PredefinedQuestion>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(): Promise<PredefinedQuestion[]> {
    return await this.predefinedQuestionRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findByCategoryId(categoryId: number): Promise<PredefinedQuestion[]> {
    return await this.predefinedQuestionRepository.find({
      where: { categoryId, isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<PredefinedQuestion> {
    const question = await this.predefinedQuestionRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(
        `Pregunta predefinida con ID ${id} no encontrada`,
      );
    }

    return question;
  }

  async create(
    createPredefinedQuestionDto: CreatePredefinedQuestionDto,
  ): Promise<PredefinedQuestion> {
    // Validar que la categoría exista
    try {
      await this.categoriesService.findOne(
        createPredefinedQuestionDto.categoryId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          `La categoría con ID ${createPredefinedQuestionDto.categoryId} no existe`,
        );
      }
      throw error;
    }

    const question = this.predefinedQuestionRepository.create(
      createPredefinedQuestionDto,
    );
    return await this.predefinedQuestionRepository.save(question);
  }

  async update(
    id: number,
    updatePredefinedQuestionDto: UpdatePredefinedQuestionDto,
  ): Promise<PredefinedQuestion> {
    const question = await this.findOne(id);

    // Si se está actualizando la categoría, validar que exista
    if (updatePredefinedQuestionDto.categoryId) {
      try {
        await this.categoriesService.findOne(
          updatePredefinedQuestionDto.categoryId,
        );
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `La categoría con ID ${updatePredefinedQuestionDto.categoryId} no existe`,
          );
        }
        throw error;
      }
    }

    Object.assign(question, updatePredefinedQuestionDto);
    return await this.predefinedQuestionRepository.save(question);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.predefinedQuestionRepository.softDelete(id);
  }

  async incrementUsageCount(id: number): Promise<void> {
    await this.predefinedQuestionRepository.increment({ id }, 'usageCount', 1);
  }
}
