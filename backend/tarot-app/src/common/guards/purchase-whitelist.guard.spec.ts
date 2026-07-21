import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PurchaseWhitelistGuard } from './purchase-whitelist.guard';

/**
 * Gatea las COMPRAS (suscripción premium y servicios holísticos) durante la etapa
 * de prueba: solo los emails de `PURCHASE_WHITELIST` pueden comprar. El registro
 * queda abierto a todos — este guard NO se aplica al registro.
 */
describe('PurchaseWhitelistGuard', () => {
  let guard: PurchaseWhitelistGuard;
  let configService: { get: jest.Mock };

  const contextWithEmail = (email?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user: email ? { email } : undefined }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    configService = { get: jest.fn() };
    guard = new PurchaseWhitelistGuard(
      configService as unknown as ConfigService,
    );
  });

  describe('cuando PURCHASE_WHITELIST NO está seteada (producción abierta)', () => {
    it('permite comprar a cualquiera', () => {
      configService.get.mockReturnValue(undefined);

      expect(guard.canActivate(contextWithEmail('cualquiera@gmail.com'))).toBe(
        true,
      );
    });

    it('trata el string vacío como abierto', () => {
      configService.get.mockReturnValue('');

      expect(guard.canActivate(contextWithEmail('cualquiera@gmail.com'))).toBe(
        true,
      );
    });
  });

  describe('cuando PURCHASE_WHITELIST está seteada (etapa de prueba)', () => {
    beforeEach(() => {
      configService.get.mockReturnValue(
        'arieldavidrighi@gmail.com, florzenavilla@gmail.com',
      );
    });

    it('permite comprar a un email de la lista', () => {
      expect(
        guard.canActivate(contextWithEmail('florzenavilla@gmail.com')),
      ).toBe(true);
    });

    it('es case-insensitive y tolera espacios', () => {
      expect(
        guard.canActivate(contextWithEmail('  ARIELDAVIDRIGHI@gmail.com ')),
      ).toBe(true);
    });

    it('bloquea a un email que no está en la lista', () => {
      expect(() =>
        guard.canActivate(contextWithEmail('desconocido@gmail.com')),
      ).toThrow(ForbiddenException);
    });

    it('bloquea si no hay usuario autenticado', () => {
      expect(() => guard.canActivate(contextWithEmail(undefined))).toThrow(
        ForbiddenException,
      );
    });
  });
});
