import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    usersServiceMock = {
      create: jest.fn().mockImplementation((dto: CreateUserDto) =>
        Promise.resolve({
          id: 1,
          email: dto.email,
          name: dto.name,
          isAdmin: false,
        } as User),
      ),
      findByEmail: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

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
      const dto: CreateUserDto = {
        email: 'a@a.com',
        name: 'Test',
        password: 'secret',
      };
      const res = await service.register(dto);

      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('user');
      expect(res).toHaveProperty('access_token', 'signed-token');
      if (res.user && 'email' in res.user && 'name' in res.user) {
        expect(res.user.email).toEqual(dto.email);
        expect(res.user.name).toEqual(dto.name);
      }
    });
  });

  describe('validateUser', () => {
    it('should return user (without password) when credentials are valid', async () => {
      const plain = 'mypassword';
      const salt = await bcrypt.genSalt();
      const hashed = await bcrypt.hash(plain, salt);

      const storedUser: Partial<User> = {
        id: 2,
        email: 'u@u.com',
        password: hashed,
        name: 'U',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(storedUser.email!, plain);
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        storedUser.email,
      );
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect('password' in result).toBe(false);
        expect(result.email).toEqual(storedUser.email);
      }
    });

    it('should return null when credentials are invalid', async () => {
      const storedUser: Partial<User> = {
        id: 2,
        email: 'u2@u.com',
        password: 'wronghash',
        name: 'U2',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(storedUser);

      const result = await service.validateUser(
        storedUser.email!,
        'notmatching',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response with token', () => {
      const user: Partial<User> = {
        id: 3,
        email: 'x@x.com',
        name: 'X',
        isAdmin: true,
      };
      const res = service.login(user);

      expect(jwtServiceMock.sign).toHaveBeenCalled();
      expect(res).toHaveProperty('access_token', 'signed-token');
      if (
        res.user &&
        'id' in res.user &&
        'email' in res.user &&
        'name' in res.user
      ) {
        expect(res.user.id).toEqual(user.id);
        expect(res.user.email).toEqual(user.email);
        expect(res.user.name).toEqual(user.name);
      }
    });
  });
});
