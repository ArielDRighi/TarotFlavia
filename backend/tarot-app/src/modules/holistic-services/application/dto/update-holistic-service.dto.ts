import { PartialType } from '@nestjs/swagger';
import { CreateHolisticServiceDto } from './create-holistic-service.dto';

export class UpdateHolisticServiceDto extends PartialType(
  CreateHolisticServiceDto,
) {}
