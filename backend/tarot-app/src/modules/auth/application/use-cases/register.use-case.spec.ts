import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUseCase } from './register.use-case';
import { UsersService } from '../../../users/users.service';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { CreateUserDto } from '../../../users/application/dto/create-user.dto';
import { User } from '../../../users/entities/user.entity';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: Record<string, jest.Mock>;
  let configServiceGet: jest.Mock;

  const mockUser = {
    id: 1,
    email: 'newuser@example.com',
    password: 'hashedPassword',
    name: 'New User',
    isAdmin: false,
    plan: 'free',
    roles: ['user'],
  } as unknown as User;

  const createUserDto: CreateUserDto = {
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    name: 'New User',
  };

  beforeEach(async () => {
    configServiceGet = jest.fn().mockReturnValue(undefined); // no whitelist by default

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            getTarotistaByUserId: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('access_token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: configServiceGet,
          },
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: {
            createRefreshToken: jest.fn().mockResolvedValue({
              token: 'refresh_token',
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY);
  });

  describe('execute', () => {
    it('should successfully register user and return tokens', async () => {
      usersService.create.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(
        createUserDto,
        '127.0.0.1',
        'Mozilla',
      );

      expect(result).toBeDefined();
      expect(result.access_token).toBe('access_token');
      expect(result.refresh_token).toBe('refresh_token');
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.id).toBe(1);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw UnauthorizedException when user creation fails', async () => {
      usersService.create.mockResolvedValue({ id: 1 } as unknown as User);
      usersService.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(createUserDto, '127.0.0.1', 'Mozilla'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should generate JWT with correct payload', async () => {
      usersService.create.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      await useCase.execute(createUserDto, '127.0.0.1', 'Mozilla');

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        isAdmin: mockUser.isAdmin,
        roles: mockUser.roles,
        plan: mockUser.plan,
      });
    });

    it('should create refresh token with correct parameters', async () => {
      usersService.create.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      await useCase.execute(createUserDto, '192.168.1.1', 'Chrome');

      expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalledWith(
        mockUser,
        '192.168.1.1',
        'Chrome',
      );
    });

    it('should return isNewUser: true for new registration', async () => {
      usersService.create.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(
        createUserDto,
        '127.0.0.1',
        'Mozilla',
      );

      expect(result.isNewUser).toBe(true);
    });

    describe('registration whitelist', () => {
      it('should allow registration when REGISTRATION_WHITELIST is not set', async () => {
        configServiceGet.mockReturnValue(undefined);
        usersService.create.mockResolvedValue(mockUser);
        usersService.findById.mockResolvedValue(mockUser);

        const result = await useCase.execute(
          createUserDto,
          '127.0.0.1',
          'Mozilla',
        );

        expect(result.user.email).toBe('newuser@example.com');
      });

      it('should allow registration when email is in whitelist', async () => {
        configServiceGet.mockReturnValue(
          'newuser@example.com,other@example.com',
        );
        usersService.create.mockResolvedValue(mockUser);
        usersService.findById.mockResolvedValue(mockUser);

        const result = await useCase.execute(
          createUserDto,
          '127.0.0.1',
          'Mozilla',
        );

        expect(result.user.email).toBe('newuser@example.com');
      });

      it('should allow registration case-insensitively when email is in whitelist', async () => {
        configServiceGet.mockReturnValue(
          'NEWUSER@EXAMPLE.COM,other@example.com',
        );
        usersService.create.mockResolvedValue(mockUser);
        usersService.findById.mockResolvedValue(mockUser);

        const result = await useCase.execute(
          createUserDto,
          '127.0.0.1',
          'Mozilla',
        );

        expect(result.user.email).toBe('newuser@example.com');
      });

      it('should throw ForbiddenException when email is NOT in whitelist', async () => {
        configServiceGet.mockReturnValue(
          'allowed@example.com,other@example.com',
        );

        await expect(
          useCase.execute(createUserDto, '127.0.0.1', 'Mozilla'),
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException with descriptive message when blocked', async () => {
        configServiceGet.mockReturnValue('allowed@example.com');

        await expect(
          useCase.execute(createUserDto, '127.0.0.1', 'Mozilla'),
        ).rejects.toThrow(
          'El registro está restringido. Si creés que deberías tener acceso, contactá al administrador.',
        );
      });

      it('should not call usersService.create when email is blocked by whitelist', async () => {
        configServiceGet.mockReturnValue('allowed@example.com');

        await expect(
          useCase.execute(createUserDto, '127.0.0.1', 'Mozilla'),
        ).rejects.toThrow(ForbiddenException);

        expect(usersService.create).not.toHaveBeenCalled();
      });
    });
  });
});
