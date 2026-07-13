import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { CustomThrottlerGuard } from '../../../../common/guards/custom-throttler.guard';
import { configureTrustProxy } from '../../../../config/trust-proxy.config';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { SendContactMessageUseCase } from '../../application/use-cases/send-contact-message.use-case';
import { ContactController } from './contact.controller';

describe('ContactController (T-PROD-014)', () => {
  const validBody = {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    subject: 'Consulta por una lectura',
    message: 'Hola, quería saber cómo reservar una sesión.',
  };

  const mockUseCase = {
    execute: jest.fn(),
  };

  describe('delegación', () => {
    let controller: ContactController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [ContactController],
        providers: [
          { provide: SendContactMessageUseCase, useValue: mockUseCase },
        ],
      }).compile();

      controller = module.get<ContactController>(ContactController);
      jest.clearAllMocks();
    });

    it('delega en el use case y devuelve su respuesta', async () => {
      mockUseCase.execute.mockResolvedValue({ message: 'Mensaje enviado' });

      const result = await controller.sendMessage(validBody);

      expect(mockUseCase.execute).toHaveBeenCalledWith(validBody);
      expect(result).toEqual({ message: 'Mensaje enviado' });
    });

    it('es un endpoint público: exigir JWT dejaría el formulario inservible para un visitante', () => {
      // Se miran los guards del método Y los de la clase: un @UseGuards a nivel de clase
      // no escribe metadata en el handler, así que mirar solo el método dejaría pasar
      // justamente la forma más natural de cerrarle el formulario a un visitante.
      const handlerGuards = (Reflect.getMetadata(
        '__guards__',
        ContactController.prototype.sendMessage,
      ) ?? []) as unknown[];
      const classGuards = (Reflect.getMetadata(
        '__guards__',
        ContactController,
      ) ?? []) as unknown[];

      expect([...handlerGuards, ...classGuards]).not.toContain(JwtAuthGuard);
    });
  });

  describe('endpoint HTTP', () => {
    let app: NestExpressApplication;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          // Sin storage propio el @Throttle del controller no se aplica: el rate limit
          // es lo único que separa a este endpoint público de un buzón de spam.
          ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        ],
        controllers: [ContactController],
        providers: [
          { provide: SendContactMessageUseCase, useValue: mockUseCase },
          // El guard REAL de la app, no el base: es el que resuelve la IP del tracker,
          // y ahí vivía el bypass del X-Forwarded-For (T-PROD-014).
          { provide: APP_GUARD, useClass: CustomThrottlerGuard },
        ],
      }).compile();

      app = module.createNestApplication<NestExpressApplication>();
      // Mismo trust proxy que en producción (Railway = 1 salto), ver main.ts.
      configureTrustProxy(app, '1');
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();

      jest.clearAllMocks();
      mockUseCase.execute.mockResolvedValue({ message: 'Mensaje enviado' });
    });

    afterEach(async () => {
      await app.close();
    });

    it('acepta un mensaje válido (200)', async () => {
      await request(app.getHttpServer())
        .post('/contact')
        .send(validBody)
        .expect(200);

      expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['name corto', { ...validBody, name: 'A' }],
      ['email inválido', { ...validBody, email: 'no-es-un-email' }],
      ['subject corto', { ...validBody, subject: 'Hi' }],
      ['message corto', { ...validBody, message: 'corto' }],
      [
        'message de más de 2000 caracteres',
        {
          ...validBody,
          message: 'a'.repeat(2001),
        },
      ],
      [
        'subject con salto de línea (inyección de cabeceras)',
        {
          ...validBody,
          subject: 'Hola\nBcc: victima@example.com',
        },
      ],
    ])('rechaza con 400: %s', async (_caso, body) => {
      await request(app.getHttpServer())
        .post('/contact')
        .send(body)
        .expect(400);

      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it('responde 429 pasado el límite: el endpoint es público y sin él sería un buzón de spam abierto', async () => {
      const server = app.getHttpServer();

      // El límite del endpoint es 3/hora (@Throttle en el controller).
      await request(server).post('/contact').send(validBody).expect(200);
      await request(server).post('/contact').send(validBody).expect(200);
      await request(server).post('/contact').send(validBody).expect(200);

      await request(server).post('/contact').send(validBody).expect(429);

      expect(mockUseCase.execute).toHaveBeenCalledTimes(3);
    });

    it('rotar el X-Forwarded-For NO regala cuota nueva: el primer valor del header lo escribe el cliente, y confiar en él hacía decorativo el límite de todos los endpoints públicos', async () => {
      const server = app.getHttpServer();

      // El proxy confiable (1 salto) agrega la IP real al final; lo de adelante lo inventó
      // el cliente y va rotando en cada request para simular ser una IP distinta.
      const spoofed = (i: number) => `10.0.0.${i}, 203.0.113.7`;

      await request(server)
        .post('/contact')
        .set('X-Forwarded-For', spoofed(1))
        .send(validBody)
        .expect(200);
      await request(server)
        .post('/contact')
        .set('X-Forwarded-For', spoofed(2))
        .send(validBody)
        .expect(200);
      await request(server)
        .post('/contact')
        .set('X-Forwarded-For', spoofed(3))
        .send(validBody)
        .expect(200);

      // Con el bug, este cuarto request (IP "nueva") pasaba: era un mail-bomb ilimitado.
      await request(server)
        .post('/contact')
        .set('X-Forwarded-For', spoofed(4))
        .send(validBody)
        .expect(429);

      expect(mockUseCase.execute).toHaveBeenCalledTimes(3);
    });
  });
});
