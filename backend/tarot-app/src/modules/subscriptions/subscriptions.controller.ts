import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  SubscriptionsService,
  SubscriptionInfo,
} from './subscriptions.service';
import { SetFavoriteTarotistaDto } from './dto/set-favorite-tarotista.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTarotistaSubscription } from '../tarotistas/entities/user-tarotista-subscription.entity';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('set-favorite')
  @ApiOperation({
    summary: 'Establecer tarotista favorito',
    description:
      'Permite a un usuario elegir su tarotista favorito. FREE: cooldown de 30 días. PREMIUM: sin cooldown.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarotista favorito establecido correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Cooldown activo o tarotista inactivo',
  })
  @ApiResponse({ status: 404, description: 'Tarotista no encontrado' })
  async setFavoriteTarotista(
    @Request() req: { user: { id: number } },
    @Body() dto: SetFavoriteTarotistaDto,
  ) {
    const subscription = await this.subscriptionsService.setFavoriteTarotista(
      req.user.id,
      dto.tarotistaId,
    );

    return {
      message: 'Tarotista favorito establecido correctamente',
      subscription,
    };
  }

  @Get('my-subscription')
  @ApiOperation({
    summary: 'Obtener mi suscripción actual',
    description:
      'Retorna información de la suscripción del usuario: tipo, tarotista, cooldown, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de suscripción',
  })
  async getMySubscription(
    @Request() req: { user: { id: number } },
  ): Promise<SubscriptionInfo | null> {
    return this.subscriptionsService.getSubscriptionInfo(req.user.id);
  }

  @Post('enable-all-access')
  @ApiOperation({
    summary: 'Activar modo all-access',
    description:
      'Permite a usuarios PREMIUM activar el acceso a todos los tarotistas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Modo all-access activado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo usuarios PREMIUM pueden activar all-access',
  })
  async enableAllAccess(@Request() req: { user: { id: number } }): Promise<{
    message: string;
    subscription: UserTarotistaSubscription;
  }> {
    const subscription = await this.subscriptionsService.enableAllAccessMode(
      req.user.id,
    );

    return {
      message: 'Modo all-access activado correctamente',
      subscription,
    };
  }
}
