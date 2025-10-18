import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    usersServiceMock = {
      create: jest
        .fn()
        .mockImplementation((dto) =>
          Promise.resolve({
            id: 1,
            email: dto.email,
            name: dto.name,
            isAdmin: false,
          }),
        ),
      findByEmail: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('signed-token'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return auth response with token', async () => {
      const dto = { email: 'a@a.com', name: 'Test', password: 'secret' } as any;
      const res = await service.register(dto);

      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('user');
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res.user).toMatchObject({ email: dto.email, name: dto.name });
    });
  });

  describe('validateUser', () => {
    it('should return user (without password) when credentials are valid', async () => {
      const plain = 'mypassword';
      const salt = await bcrypt.genSalt();
      const hashed = await bcrypt.hash(plain, salt);

      const storedUser = {
        id: 2,
        email: 'u@u.com',
        password: hashed,
        name: 'U',
      } as any;
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(storedUser.email, plain);
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        storedUser.email,
      );
      expect(result).toBeDefined();
      expect((result as any).password).toBeUndefined();
      expect((result as any).email).toEqual(storedUser.email);
    });

    it('should return null when credentials are invalid', async () => {
      const storedUser = {
        id: 2,
        email: 'u2@u.com',
        password: 'wronghash',
      } as any;
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(
        storedUser.email,
        'notmatching',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response with token', async () => {
      const user = { id: 3, email: 'x@x.com', name: 'X', isAdmin: true } as any;
      const res = await service.login(user);

      expect(jwtServiceMock.sign).toHaveBeenCalled();
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res.user).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    });
  });
});
