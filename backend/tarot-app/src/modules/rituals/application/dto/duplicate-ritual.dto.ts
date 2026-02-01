import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class DuplicateRitualDto {
  @ApiProperty({
    example: 'ritual-luna-nueva-copia',
    description: 'Slug único para el ritual duplicado',
  })
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  newSlug: string;
}
