import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn().mockImplementation((dto) =>
        Promise.resolve({
          user: { id: 1, email: dto.email },
          access_token: 't',
        }),
      ),
      validateUser: jest.fn().mockResolvedValue({ id: 2, email: 'a@a.com' }),
      login: jest.fn().mockResolvedValue({
        user: { id: 2, email: 'a@a.com' },
        access_token: 'tok',
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto = { email: 'new@e.com', name: 'New', password: 'pass' } as any;
      const res = await controller.register(dto);
      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('access_token');
      expect(res.user.email).toEqual(dto.email);
    });
  });

  describe('login', () => {
    it('should return 401 when credentials are invalid', async () => {
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue(null);
      const dto = { email: 'b@b.com', password: 'p' } as any;
      await expect(controller.login(dto)).rejects.toThrow();
    });

    it('should return token when credentials are valid', async () => {
      (authServiceMock.validateUser as jest.Mock).mockResolvedValue({
        id: 2,
        email: 'b@b.com',
      });
      (authServiceMock.login as jest.Mock).mockResolvedValue({
        user: { id: 2, email: 'b@b.com' },
        access_token: 'tok',
      });

      const dto = { email: 'b@b.com', password: 'p' } as any;
      const res = await controller.login(dto);
      expect(authServiceMock.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(authServiceMock.login).toHaveBeenCalled();
      expect(res).toHaveProperty('access_token', 'tok');
    });
  });
});
