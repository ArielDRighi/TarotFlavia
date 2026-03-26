import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoService } from './infrastructure/services/mercadopago.service';
import { WebhookController } from './infrastructure/controllers/webhook.controller';
import { HolisticServicesModule } from '../holistic-services/holistic-services.module';

@Module({
  imports: [ConfigModule, forwardRef(() => HolisticServicesModule)],
  controllers: [WebhookController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class PaymentsModule {}
