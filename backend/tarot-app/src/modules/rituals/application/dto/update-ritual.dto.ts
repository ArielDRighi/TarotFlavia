import { PartialType, OmitType } from '@nestjs/swagger';
import {
  CreateRitualDto,
  CreateRitualStepDto,
  CreateRitualMaterialDto,
} from './create-ritual.dto';

// Permite actualizar cualquier campo excepto slug (que es identificador único)
export class UpdateRitualDto extends PartialType(
  OmitType(CreateRitualDto, ['slug'] as const),
) {}

export class UpdateRitualStepDto extends PartialType(CreateRitualStepDto) {}

export class UpdateRitualMaterialDto extends PartialType(
  CreateRitualMaterialDto,
) {}
