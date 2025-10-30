import { PartialType } from '@nestjs/swagger';
import { CreatePredefinedQuestionDto } from './create-predefined-question.dto';

export class UpdatePredefinedQuestionDto extends PartialType(
  CreatePredefinedQuestionDto,
) {}
