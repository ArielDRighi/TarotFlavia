import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import type { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes';
import type { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import * as crypto from 'crypto';

export interface CreatePreferenceParams {
  purchaseId: number;
  serviceName: string;
  amountArs: number;
  userEmail: string;
  notificationUrl: string;
  backUrls: {
    success: string;
    pending: string;
    failure: string;
  };
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN') ?? '';
    this.client = new MercadoPagoConfig({ accessToken });
  }

  /**
   * Creates a Checkout Pro preference and returns the preferenceId + init_point.
   */
  async createPreference(
    params: CreatePreferenceParams,
  ): Promise<{ preferenceId: string; initPoint: string }> {
    const preferenceClient = new Preference(this.client);

    const body: PreferenceRequest = {
      items: [
        {
          id: String(params.purchaseId),
          title: params.serviceName,
          quantity: 1,
          unit_price: params.amountArs,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: params.userEmail,
      },
      back_urls: params.backUrls,
      notification_url: params.notificationUrl,
      external_reference: String(params.purchaseId),
    };

    const response: PreferenceResponse = await preferenceClient.create({
      body,
    });

    if (!response.id || !response.init_point) {
      throw new Error(
        `Mercado Pago devolvió una preferencia sin ID o init_point (purchaseId: ${params.purchaseId})`,
      );
    }

    this.logger.log(
      `Preferencia MP creada: ${response.id} para compra ${params.purchaseId}`,
    );

    return {
      preferenceId: response.id,
      initPoint: response.init_point,
    };
  }

  /**
   * Retrieves a payment by its MP payment ID.
   */
  async getPayment(paymentId: string | number): Promise<PaymentResponse> {
    const paymentClient = new Payment(this.client);
    return paymentClient.get({ id: paymentId });
  }

  /**
   * Validates the x-signature header from a Mercado Pago webhook request.
   *
   * MP sends: x-signature: ts=<timestamp>,v1=<hmac>
   * The signed template is: id:<payment_id>;request-id:<x-request-id>;ts:<ts>;
   *
   * @param xSignature  The raw "x-signature" header value
   * @param xRequestId  The "x-request-id" header value
   * @param paymentId   The payment ID from the webhook body
   * @returns true if the signature is valid
   */
  validateSignature(
    xSignature: string,
    xRequestId: string,
    paymentId: string,
  ): boolean {
    const secret = this.configService.get<string>('MP_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn(
        'MP_WEBHOOK_SECRET no configurado — omitiendo validación de firma',
      );
      return true; // En desarrollo puede no estar configurado
    }

    try {
      // Parse ts and v1 from "ts=<timestamp>,v1=<hmac>"
      const parts = xSignature.split(',');
      let ts = '';
      let v1 = '';
      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'v1') v1 = value;
      }

      if (!ts || !v1) {
        this.logger.warn('Firma MP mal formada: falta ts o v1');
        return false;
      }

      const signedTemplate = `id:${paymentId};request-id:${xRequestId};ts:${ts};`;
      const expectedHmac = crypto
        .createHmac('sha256', secret)
        .update(signedTemplate)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(v1, 'hex'),
        Buffer.from(expectedHmac, 'hex'),
      );
    } catch (error) {
      this.logger.error(
        'Error al validar firma de webhook MP',
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
