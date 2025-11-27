import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../users/users.service';
import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/repository.tokens';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(
    createUserDto: CreateUserDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{
    user: {
      id: number;
      email: string;
      name: string;
      isAdmin: boolean;
      plan: string;
    };
    access_token: string;
    refresh_token: string;
  }> {
    const createdUser = await this.usersService.create(createUserDto);

    // Fetch complete user data including password for refresh token generation
    const user = await this.usersService.findById(createdUser.id);
    if (!user) {
      throw new UnauthorizedException('User creation failed');
    }

    // Generate tokens
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
      roles: user.roles,
      plan: user.plan,
    };

    const { token: refreshToken } =
      await this.refreshTokenRepository.createRefreshToken(
        user,
        ipAddress,
        userAgent,
      );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        plan: user.plan,
      },
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }
}
