import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredefinedQuestionsService } from './predefined-questions.service';
import { PredefinedQuestionsController } from './predefined-questions.controller';
import { PredefinedQuestion } from './entities/predefined-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PredefinedQuestion])],
  controllers: [PredefinedQuestionsController],
  providers: [PredefinedQuestionsService],
  exports: [PredefinedQuestionsService],
})
export class PredefinedQuestionsModule {}
