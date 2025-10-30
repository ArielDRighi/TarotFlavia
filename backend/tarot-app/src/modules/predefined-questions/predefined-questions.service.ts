import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredefinedQuestion } from './entities/predefined-question.entity';
import { CreatePredefinedQuestionDto } from './dto/create-predefined-question.dto';
import { UpdatePredefinedQuestionDto } from './dto/update-predefined-question.dto';

@Injectable()
export class PredefinedQuestionsService {
  constructor(
    @InjectRepository(PredefinedQuestion)
    private readonly predefinedQuestionRepository: Repository<PredefinedQuestion>,
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
