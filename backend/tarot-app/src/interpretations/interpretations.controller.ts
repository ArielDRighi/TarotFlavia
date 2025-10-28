import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterpretationsService } from './interpretations.service';
import { GenerateInterpretationDto } from './dto/generate-interpretation.dto';

@ApiTags('Interpretaciones')
@Controller('interpretations')
export class InterpretationsController {
  constructor(
    private readonly interpretationsService: InterpretationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generar interpretación para un conjunto de cartas',
    description:
      'Genera una interpretación basada en las cartas seleccionadas y sus posiciones',
  })
  @ApiBody({ type: GenerateInterpretationDto })
  @ApiResponse({
    status: 200,
    description: 'Interpretación generada con éxito',
  })
  generateInterpretation(@Body() generateDto: GenerateInterpretationDto) {
    // For now, return a placeholder response
    // The full implementation would fetch cards and generate interpretation
    return {
      interpretation:
        'Interpretation generation requires integration with cards service',
      cardIds: generateDto.cardIds,
      positions: generateDto.positions,
      question: generateDto.question,
    };
  }
}
