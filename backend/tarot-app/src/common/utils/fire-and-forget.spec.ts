import { Logger } from '@nestjs/common';
import { fireAndForget } from './fire-and-forget';

describe('fireAndForget (T-DEPLOY-004)', () => {
  let logger: Logger;
  let warn: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger('Prueba');
    warn = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  const siguienteTick = () => new Promise((resolve) => setImmediate(resolve));

  it('no devuelve nada: no hay forma de esperarlo por accidente', () => {
    const resultado: void = fireAndForget(
      Promise.resolve(),
      logger,
      'No se pudo hacer algo',
    );

    expect(resultado).toBeUndefined();
  });

  it('no propaga el rechazo', async () => {
    expect(() =>
      fireAndForget(
        Promise.reject(new Error('Query read timeout')),
        logger,
        'No se pudo hacer algo',
      ),
    ).not.toThrow();

    await siguienteTick();
  });

  it('loguea el contexto y el mensaje del error', async () => {
    fireAndForget(
      Promise.reject(new Error('Query read timeout')),
      logger,
      'No se pudo incrementar el contador de la carta 5',
    );
    await siguienteTick();

    expect(warn).toHaveBeenCalledWith(
      'No se pudo incrementar el contador de la carta 5: Query read timeout',
    );
  });

  /**
   * Un `throw` de algo que no es `Error` es raro pero pasa (una librería que
   * tira un string, un `reject(undefined)`). El log tiene que salir igual: si
   * se rompiera acá, el fallo volvería a ser invisible, que es justo lo que
   * este helper viene a evitar.
   */
  const rechazarCon = (valor: unknown): Promise<never> => {
    // El rechazo se dispara a través de un alias y no llamando a `reject`
    // directo: `prefer-promise-reject-errors` sólo acepta `Error` ahí, y lo que
    // este test necesita probar es justamente el caso contrario. La alternativa
    // era un `eslint-disable`, que el proyecto prohíbe.
    let rechazar!: (razon: unknown) => void;
    const promesa = new Promise<never>((_resolve, reject) => {
      rechazar = reject;
    });
    rechazar(valor);
    return promesa;
  };

  it.each<[string, unknown, string]>([
    ['un string', 'algo salió mal', 'algo salió mal'],
    ['undefined', undefined, 'undefined'],
    ['un objeto', { code: 42 }, '[object Object]'],
  ])('loguea igual cuando el rechazo es %s', async (_caso, valor, esperado) => {
    fireAndForget(rechazarCon(valor), logger, 'Falló');
    await siguienteTick();

    expect(warn).toHaveBeenCalledWith(`Falló: ${esperado}`);
  });

  it('no loguea nada cuando la operación sale bien', async () => {
    fireAndForget(Promise.resolve(), logger, 'No se pudo hacer algo');
    await siguienteTick();

    expect(warn).not.toHaveBeenCalled();
  });

  /**
   * Lo que justifica que el helper exista: la respuesta no espera a la
   * operación. Si `fireAndForget` awaiteara adentro, este test tardaría 50ms.
   */
  it('devuelve antes de que la operación termine', async () => {
    let termino = false;
    const lenta = new Promise<void>((resolve) =>
      setTimeout(() => {
        termino = true;
        resolve();
      }, 50),
    );

    fireAndForget(lenta, logger, 'No se pudo hacer algo');

    expect(termino).toBe(false);
    await lenta;
  });
});
