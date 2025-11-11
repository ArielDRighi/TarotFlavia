import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class AIRequestDto {
  @ApiProperty({ description: 'Prompt to send to AI' })
  @IsString()
  prompt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}
