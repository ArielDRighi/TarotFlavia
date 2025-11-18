import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIQuotaService, QuotaInfo } from './ai-quota.service';
import { SkipQuotaCheck } from './skip-quota-check.decorator';

@ApiTags('AI Usage')
@Controller('usage')
export class AIQuotaController {
  constructor(private readonly aiQuotaService: AIQuotaService) {}

  @Get('/ai')
  @UseGuards(JwtAuthGuard)
  @SkipQuotaCheck() // Este endpoint no consume cuota
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    description: 'Información de cuota de IA del usuario',
    schema: {
      type: 'object',
      properties: {
        quotaLimit: {
          type: 'number',
          description:
            'Límite de requests mensuales (-1 para ilimitado en PREMIUM)',
        },
        requestsUsed: {
          type: 'number',
          description: 'Requests usados este mes',
        },
        requestsRemaining: {
          type: 'number',
          description: 'Requests restantes (-1 para ilimitado en PREMIUM)',
        },
        percentageUsed: {
          type: 'number',
          description: 'Porcentaje de cuota usado (0-100)',
        },
        resetDate: {
          type: 'string',
          format: 'date-time',
          description: 'Fecha en que se resetea la cuota',
        },
        warningTriggered: {
          type: 'boolean',
          description: 'Si se envió advertencia de cuota al 80%',
        },
        plan: {
          type: 'string',
          enum: ['free', 'premium'],
          description: 'Plan del usuario',
        },
        tokensUsed: {
          type: 'number',
          description: 'Tokens de IA usados este mes',
        },
        costEstimated: {
          type: 'number',
          description: 'Costo estimado en USD este mes',
        },
        providerPrimarilyUsed: {
          type: 'string',
          nullable: true,
          description: 'Proveedor de IA usado mayoritariamente',
        },
      },
    },
  })
  async getMyAIUsage(
    @Req() req: Request & { user: { userId: number } },
  ): Promise<QuotaInfo> {
    return this.aiQuotaService.getRemainingQuota(req.user.userId);
  }
}
