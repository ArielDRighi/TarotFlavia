import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserPlan } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: Partial<UsersService>;
  let jwtServiceMock: Partial<JwtService>;
  let refreshTokenServiceMock: Partial<RefreshTokenService>;

  beforeEach(async () => {
    // Map to store created users for findById
    const userStore = new Map<number, User>();

    usersServiceMock = {
      create: jest.fn().mockImplementation((dto: CreateUserDto) => {
        const user = {
          id: userStore.size + 1,
          email: dto.email,
          name: dto.name,
          password: 'hashed_password',
          isAdmin: false,
          plan: UserPlan.FREE,
        } as User;
        userStore.set(user.id, user);
        return Promise.resolve(user);
      }),
      findByEmail: jest.fn(),
      findById: jest.fn().mockImplementation((id: number) => {
        const user = userStore.get(id);
        if (user) {
          return Promise.resolve(user);
        }
        // Fallback for users not in store (like in login tests)
        return Promise.resolve({
          id,
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password',
          isAdmin: false,
          plan: UserPlan.FREE,
        } as User);
      }),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    refreshTokenServiceMock = {
      createRefreshToken: jest.fn().mockResolvedValue({
        token: 'refresh-token-12345',
        refreshToken: { id: 'uuid-123' },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: RefreshTokenService, useValue: refreshTokenServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return auth response with tokens', async () => {
      const dto: CreateUserDto = {
        email: 'a@a.com',
        name: 'Test',
        password: 'secret',
      };
      const ipAddress = '127.0.0.1';
      const userAgent = 'test-agent';
      const res = await service.register(dto, ipAddress, userAgent);

      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalled();
      expect(res).toHaveProperty('user');
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res).toHaveProperty('refresh_token', 'refresh-token-12345');
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
    it('should return auth response with tokens', async () => {
      const user: Partial<User> = {
        id: 3,
        email: 'x@x.com',
        name: 'X',
        isAdmin: true,
      };

      // Mock findById to return the complete user
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce({
        ...user,
        password: 'hashed_password',
        plan: UserPlan.FREE,
      } as User);

      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      const res = await service.login(user, ipAddress, userAgent);

      expect(jwtServiceMock.sign).toHaveBeenCalled();
      expect(refreshTokenServiceMock.createRefreshToken).toHaveBeenCalled();
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res).toHaveProperty('refresh_token', 'refresh-token-12345');
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

    it('should include plan information in JWT payload', async () => {
      const user: Partial<User> = {
        id: 4,
        email: 'premium@example.com',
        name: 'Premium User',
        isAdmin: false,
        plan: UserPlan.PREMIUM,
      };

      // Mock findById to return the complete user
      (usersServiceMock.findById as jest.Mock).mockResolvedValueOnce({
        ...user,
        password: 'hashed_password',
      } as User);

      const ipAddress = '10.0.0.1';
      const userAgent = 'Chrome';

      await service.login(user, ipAddress, userAgent);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: user.email,
          sub: user.id,
          isAdmin: user.isAdmin,
          plan: user.plan,
        }),
      );
    });
  });
});
