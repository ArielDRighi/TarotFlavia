import {
  IsString,
  IsNotEmpty,
  IsPort,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  // =============================================================================
  // DATABASE CONFIGURATION
  // =============================================================================

  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST: string;

  @IsPort()
  @Transform(({ value }) => String(value))
  POSTGRES_PORT: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;

  // =============================================================================
  // JWT CONFIGURATION
  // =============================================================================

  @IsString()
  @IsNotEmpty()
  @MinLength(32, {
    message: 'JWT_SECRET must be at least 32 characters long for security',
  })
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string;

  // =============================================================================
  // REFRESH TOKEN CONFIGURATION
  // =============================================================================

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? Number(value) : 7))
  REFRESH_TOKEN_EXPIRY_DAYS: number = 7;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? Number(value) : 30))
  REFRESH_TOKEN_RETENTION_DAYS: number = 30;

  // =============================================================================
  // AI PROVIDERS CONFIGURATION
  // =============================================================================

  // Groq (Primary - Free)
  @IsString()
  @IsNotEmpty()
  @Matches(/^gsk_/, {
    message: 'GROQ_API_KEY must start with "gsk_"',
  })
  GROQ_API_KEY: string;

  @IsOptional()
  @IsString()
  GROQ_MODEL: string = 'llama-3.3-70b-versatile';

  // DeepSeek (Growth - Low Cost)
  @IsString()
  @IsOptional()
  DEEPSEEK_API_KEY?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : 'deepseek-chat'))
  DEEPSEEK_MODEL: string = 'deepseek-chat';

  // OpenAI (Fallback/Premium - Optional)
  @IsString()
  @IsOptional()
  @Matches(/^sk-/, {
    message: 'OPENAI_API_KEY must start with "sk-"',
  })
  OPENAI_API_KEY?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : 'gpt-4o-mini'))
  OPENAI_MODEL: string = 'gpt-4o-mini';

  // =============================================================================
  // APPLICATION CONFIGURATION (Optional with Defaults)
  // =============================================================================

  @IsEnum(Environment)
  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : 'development'))
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? Number(value) : 3000))
  PORT: number = 3000;

  // =============================================================================
  // CORS CONFIGURATION
  // =============================================================================

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : 'http://localhost:3000'))
  CORS_ORIGINS: string = 'http://localhost:3000';

  // =============================================================================
  // RATE LIMITING CONFIGURATION
  // =============================================================================

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? Number(value) : 60))
  RATE_LIMIT_TTL: number = 60;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? Number(value) : 100))
  RATE_LIMIT_MAX: number = 100;
}
