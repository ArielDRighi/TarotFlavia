import { Logger } from '@nestjs/common';
import {
  DEFAULT_TRUST_PROXY_HOPS,
  configureTrustProxy,
  resolveTrustProxyHops,
} from './trust-proxy.config';

describe('trust-proxy.config (T-PROD-014)', () => {
  describe('resolveTrustProxyHops', () => {
    it.each([undefined, null, ''])(
      'sin valor (%p) usa el default de Railway (1 salto)',
      (rawValue) => {
        expect(resolveTrustProxyHops(rawValue as undefined)).toBe(
          DEFAULT_TRUST_PROXY_HOPS,
        );
        expect(DEFAULT_TRUST_PROXY_HOPS).toBe(1);
      },
    );

    it.each([
      ['0', 0], // sin proxy delante (dev)
      ['1', 1], // Railway
      ['2', 2], // un CDN delante de Railway
      [3, 3],
    ])('acepta %p y lo resuelve a %i saltos', (rawValue, expected) => {
      expect(resolveTrustProxyHops(rawValue)).toBe(expected);
    });

    it.each(['-1', '1.5', 'dos', 'true'])(
      'rechaza %p: un valor inválido dejaría el rate limiting mal calibrado sin que nadie se entere',
      (rawValue) => {
        expect(() => resolveTrustProxyHops(rawValue)).toThrow(
          /TRUST_PROXY_HOPS/,
        );
      },
    );
  });

  describe('configureTrustProxy', () => {
    it('aplica el valor a Express: sin `trust proxy`, request.ip es la IP del proxy y el límite se cuenta para todos juntos', () => {
      const set = jest.fn();

      const hops = configureTrustProxy({ set }, '2');

      expect(set).toHaveBeenCalledWith('trust proxy', 2);
      expect(hops).toBe(2);
    });

    it('deja el valor en el log del arranque: es el primer número a mirar si el rate limiting se comporta raro en producción', () => {
      const set = jest.fn();
      const logger = { log: jest.fn() } as unknown as Logger;

      configureTrustProxy({ set }, '1', logger);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('trust proxy = 1'),
      );
    });
  });
});
