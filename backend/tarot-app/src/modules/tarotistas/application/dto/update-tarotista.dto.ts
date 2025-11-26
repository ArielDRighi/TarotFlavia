import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTarotistaDto } from './create-tarotista.dto';

export class UpdateTarotistaDto extends PartialType(
  OmitType(CreateTarotistaDto, ['userId'] as const),
) {}
