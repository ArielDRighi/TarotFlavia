import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTarotistaDto } from './create-tarotista.dto';

export class UpdateTarotistaDto extends PartialType(CreateTarotistaDto) {
  @ApiProperty({
    description: 'ID del usuario - no puede actualizarse',
    required: false,
    readOnly: true,
  })
  userId?: never;
}
