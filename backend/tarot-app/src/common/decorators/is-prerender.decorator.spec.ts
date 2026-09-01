import { ExecutionContext } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import {
  IsPrerender,
  PRERENDER_HEADER,
  resolveIsPrerender,
} from './is-prerender.decorator';

function contextoCon(headers: IncomingHttpHeaders): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('resolveIsPrerender (T-DEPLOY-002)', () => {
  it('es false cuando no viene el header — el caso de una persona', () => {
    expect(resolveIsPrerender(contextoCon({}))).toBe(false);
  });

  it('es true cuando el build manda el header', () => {
    expect(resolveIsPrerender(contextoCon({ [PRERENDER_HEADER]: '1' }))).toBe(
      true,
    );
  });

  /**
   * Express baja los nombres de header a minúsculas antes de guardarlos, así
   * que el axios del frontend puede mandarlo como quiera. Se deja escrito
   * porque es la clase de supuesto que se rompe callado.
   */
  it('no depende de cómo el cliente capitalice el header', () => {
    const headers: IncomingHttpHeaders = {};
    headers['X-Prerender'.toLowerCase()] = '1';

    expect(resolveIsPrerender(contextoCon(headers))).toBe(true);
  });

  it('devuelve un boolean, no el valor del header', () => {
    const resultado = resolveIsPrerender(
      contextoCon({ [PRERENDER_HEADER]: 'lo-que-sea' }),
    );

    expect(resultado).toBe(true);
    expect(typeof resultado).toBe('boolean');
  });

  /**
   * Un header presente pero vacío es un cliente que se equivocó, no un build.
   * Se cuenta la vista: ante la duda, el default es contar.
   */
  it('es false con el header vacío', () => {
    expect(resolveIsPrerender(contextoCon({ [PRERENDER_HEADER]: '' }))).toBe(
      false,
    );
  });

  it('expone el decorador que envuelve al resolver', () => {
    expect(typeof IsPrerender).toBe('function');
    expect(typeof IsPrerender()).toBe('function');
  });
});
