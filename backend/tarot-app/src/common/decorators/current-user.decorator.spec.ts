import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should be a function (param decorator factory)', () => {
    expect(typeof CurrentUser).toBe('function');
  });

  it('should return a ParameterDecorator when called', () => {
    const decorator = CurrentUser();

    // createParamDecorator devuelve una función decoradora
    expect(typeof decorator).toBe('function');
  });

  // La funcionalidad real se prueba en tests E2E/integración
  // donde el decorador se usa en el contexto completo de NestJS
});
