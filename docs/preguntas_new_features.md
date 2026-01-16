# Preguntas sobre Nuevas Funcionalidades

**Fecha:** 16 de enero de 2026

---

## Sesión de Preguntas y Respuestas

---

### Pregunta 1: Estructura actual del módulo de IA

**Objetivo:** Entender la arquitectura actual del módulo de IA para planificar la integración de nuevos providers (Gemini) y funcionalidades (Horóscopo).

#### 1. Estructura de carpetas de `src/modules/ai/`

```
src/modules/ai/
├── ai.module.ts                  # Módulo principal
├── application/
│   ├── dto/                      # Data Transfer Objects
│   ├── prompts/                  # Prompts y plantillas
│   └── services/
│       ├── ai-provider.service.ts        # ⭐ Orquestador principal
│       ├── ai-provider.service.spec.ts
│       └── prompt-builder.service.ts     # Constructor de prompts
├── domain/
│   ├── interfaces/
│   │   └── ai-provider.interface.ts      # ⭐ Interface de providers
│   └── value-objects/
└── infrastructure/
    ├── errors/
    │   └── circuit-breaker.utils.ts      # ⭐ Circuit breaker
    ├── http/
    └── providers/
        ├── groq.provider.ts               # Provider Groq (primario)
        ├── deepseek.provider.ts           # Provider DeepSeek (secundario)
        ├── openai.provider.ts             # Provider OpenAI (fallback)
        └── openai.provider.spec.ts
```

---

#### 2. Módulo Principal (`ai.module.ts`)

```typescript
@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([TarotistaConfig, TarotCard, TarotistaCardMeaning, Tarotista]),
    AIUsageModule, // Para tracking de uso y costos
  ],
  providers: [
    AIProviderService, // Orquestador principal
    PromptBuilderService, // Constructor de prompts
    GroqProvider, // Primary provider
    DeepSeekProvider, // Secondary provider
    OpenAIProvider, // Fallback provider
  ],
  exports: [AIProviderService, PromptBuilderService],
})
export class AIModule {}
```

**Características:**

- ✅ Feature-based architecture
- ✅ Inyección de dependencias vía NestJS
- ✅ Integración con AIUsageModule para tracking
- ✅ TypeORM para acceso a configuraciones de tarotistas

---

#### 3. Interface de AI Provider (`ai-provider.interface.ts`)

```typescript
export enum AIProviderType {
  GROQ = "groq",
  DEEPSEEK = "deepseek",
  OPENAI = "openai",
  // 🆕 GEMINI = 'gemini'  <- A AGREGAR
}

export interface AIProviderConfig {
  provider: AIProviderType;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProviderType;
  model: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  durationMs: number;
  fromCache?: boolean;
}

export interface IAIProvider {
  generateCompletion(messages: AIMessage[], config: Partial<AIProviderConfig>): Promise<AIResponse>;

  isAvailable(): Promise<boolean>;

  getProviderType(): AIProviderType;
}
```

**Puntos clave:**

- ✅ **Interface clara** para implementar nuevos providers
- ✅ Tipado fuerte con TypeScript
- ✅ Soporte para configuración flexible (temperature, maxTokens, etc.)
- ✅ Tracking de tokens y duración
- 🆕 **Para Gemini:** Solo necesitamos implementar `IAIProvider`

---

#### 4. Servicio Orquestador (`ai-provider.service.ts`)

**Responsabilidades:**

1. **Manejo de fallback automático** entre providers
2. **Circuit breaker** para cada provider
3. **Retry con backoff exponencial**
4. **Logging de uso** con AIUsageService
5. **Tracking de costos** con AIQuotaService

**Orden de prioridad actual:**

```typescript
this.providers = [
  this.groqProvider, // Primary: Free and fast
  this.deepseekProvider, // Secondary: Low cost
  this.openaiProvider, // Tertiary: Fallback
];
```

**Circuit breakers configurados:**

```typescript
// Configuración por defecto
private readonly CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;
private readonly CIRCUIT_BREAKER_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos
```

**Método principal:**

```typescript
async generateCompletion(
  messages: AIMessage[],
  userId?: number | null,
  readingId?: number | null,
  config?: Partial<AIProviderConfig>,
): Promise<AIResponse>
```

**Flujo de ejecución:**

1. Itera sobre providers en orden de prioridad
2. Verifica circuit breaker antes de intentar
3. Ejecuta con retry (max 3 intentos)
4. En caso de éxito: registra uso, cierra circuit breaker, retorna respuesta
5. En caso de fallo: registra error, abre circuit breaker, intenta siguiente provider
6. Si todos fallan: lanza error con resumen de todos los fallos

---

#### 5. Circuit Breaker (`circuit-breaker.utils.ts`)

**Estados:**

- `CLOSED`: Normal, permite ejecuciones
- `OPEN`: Bloqueado por fallos consecutivos
- `HALF_OPEN`: Probando recuperación (requiere 3 éxitos consecutivos)

**Configuración:**

```typescript
constructor(
  private readonly provider: AIProviderType,
  private readonly failureThreshold: number,  // 5 fallos consecutivos
  private readonly timeoutMs: number,         // 5 minutos
)
```

**Lógica:**

- Después de 5 fallos consecutivos → `OPEN` (5 minutos bloqueado)
- Después de timeout → `HALF_OPEN` (permite 1 intento)
- Después de 3 éxitos en `HALF_OPEN` → `CLOSED`

---

#### 6. Ejemplo de Provider Existente (`groq.provider.ts`)

```typescript
@Injectable()
export class GroqProvider implements IAIProvider {
  private client: Groq | null = null;
  private readonly DEFAULT_MODEL = "llama-3.1-70b-versatile";
  private readonly DEFAULT_TEMPERATURE = 0.6;
  private readonly TIMEOUT = 10000; // 10s

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("GROQ_API_KEY");
    if (apiKey && apiKey.startsWith("gsk_")) {
      this.client = new Groq({ apiKey });
    }
  }

  async generateCompletion(messages: AIMessage[], config: Partial<AIProviderConfig>): Promise<AIResponse> {
    // Validación de cliente
    // Configuración de parámetros
    // Llamada a API con race condition (timeout)
    // Parsing de respuesta
    // Manejo de errores con AIProviderException
  }

  async isAvailable(): Promise<boolean> {
    return this.client !== null;
  }

  getProviderType(): AIProviderType {
    return AIProviderType.GROQ;
  }
}
```

---

### 📋 Conclusiones para Integrar Gemini

#### ✅ Lo que necesitamos hacer:

1. **Agregar `GEMINI` al enum `AIProviderType`**
   - Archivo: `domain/interfaces/ai-provider.interface.ts`

2. **Crear `gemini.provider.ts`** siguiendo el patrón de Groq
   - Ubicación: `infrastructure/providers/gemini.provider.ts`
   - Implementar `IAIProvider` interface
   - Usar SDK de Google Generative AI
   - Configurar timeout, modelo, temperatura por defecto

3. **Registrar en `ai.module.ts`**
   - Importar `GeminiProvider`
   - Agregarlo a `providers` array

4. **Actualizar `AIProviderService`**
   - Inyectar `GeminiProvider` en constructor
   - Agregarlo al array `this.providers` (decidir posición en prioridad)
   - Crear circuit breaker para Gemini

5. **Actualizar enum `AIProvider`** en `ai-usage-log.entity.ts`
   - Para tracking de uso y costos

6. **Configurar costos** en `AIUsageService`
   - Agregar pricing de Gemini Flash 2.0

#### 🎯 Posición sugerida en fallback:

```typescript
this.providers = [
  this.groqProvider, // Primary: Free and fast
  this.geminiProvider, // 🆕 Secondary: Free tier (Gemini Flash 2.0)
  this.deepseekProvider, // Tertiary: Low cost
  this.openaiProvider, // Fallback: Most reliable
];
```

#### 🔧 Configuración requerida:

- Variable de entorno: `GEMINI_API_KEY`
- Modelo sugerido: `gemini-2.0-flash-exp` (gratis, 1M TPM, 10 RPM)

---

### Pregunta 2: Estructura de la entidad User y DTOs de registro

**Objetivo:** Ver la estructura actual del usuario para planificar el campo de fecha de nacimiento (`birthDate`).

#### 1. Entidad User (`user.entity.ts`)

**Campos principales existentes:**

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profilePicture: string;

  // 🆕 FALTA: birthDate (a agregar)

  // Roles y permisos
  @Column({ default: false })
  isAdmin: boolean;

  @Column({
    type: "enum",
    enum: UserRole,
    array: true,
    default: [UserRole.CONSUMER],
  })
  roles: UserRole[];

  // Plan y suscripción
  @Column({
    type: "enum",
    enum: UserPlan,
    default: UserPlan.FREE,
  })
  plan: UserPlan;

  @Column({ nullable: true })
  planStartedAt: Date;

  @Column({ nullable: true })
  planExpiresAt: Date;

  @Column({
    type: "enum",
    enum: SubscriptionStatus,
    nullable: true,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ nullable: true })
  stripeCustomerId: string;

  // AI Usage tracking
  @Column({ name: "ai_requests_used_month", type: "int", default: 0 })
  aiRequestsUsedMonth: number;

  @Column({
    name: "ai_cost_usd_month",
    type: "decimal",
    precision: 10,
    scale: 6,
    default: 0,
  })
  aiCostUsdMonth: number;

  @Column({ name: "ai_tokens_used_month", type: "int", default: 0 })
  aiTokensUsedMonth: number;

  @Column({
    name: "ai_provider_used",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  aiProviderUsed: string | null;

  @Column({ name: "quota_warning_sent", type: "boolean", default: false })
  quotaWarningSent: boolean;

  @Column({ name: "ai_usage_reset_at", type: "timestamp", nullable: true })
  aiUsageResetAt: Date | null;

  // Activity tracking
  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date | null;

  // Ban management
  @Column({ type: "timestamp", nullable: true })
  bannedAt: Date | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  banReason: string | null;

  // Timestamps automáticos
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => TarotReading, (reading) => reading.user)
  readings: TarotReading[];
}
```

**Enums relacionados:**

```typescript
export enum UserPlan {
  ANONYMOUS = "anonymous",
  FREE = "free",
  PREMIUM = "premium",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum UserRole {
  CONSUMER = "consumer",
  TAROTIST = "tarotist",
  ADMIN = "admin",
}
```

**Métodos útiles:**

```typescript
// Plan management
isPremium(): boolean;
hasPlanExpired(): boolean;

// Role management
hasRole(role: UserRole): boolean;
hasAnyRole(...roles: UserRole[]): boolean;
hasAllRoles(...roles: UserRole[]): boolean;
isConsumer(): boolean;
isTarotist(): boolean;
isAdminRole(): boolean;
get isAdminUser(): boolean;

// Ban management
isBanned(): boolean;
ban(reason?: string): void;
unban(): void;
```

---

#### 2. DTO de Registro (`create-user.dto.ts`)

```typescript
export class CreateUserDto {
  @ApiProperty({
    example: "usuario@ejemplo.com",
    description: "Email del usuario",
  })
  @IsEmail({}, { message: "Please provide a valid email" })
  @SanitizeEmail()
  email: string;

  @ApiProperty({
    example: "Juan Pérez",
    description: "Nombre completo del usuario",
  })
  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(255, { message: "Name must not exceed 255 characters" })
  @SanitizeHtml()
  name: string;

  @ApiProperty({
    example: "password123",
    description: "Contraseña del usuario (mínimo 6 caracteres)",
  })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(128, { message: "Password must not exceed 128 characters" })
  @Trim()
  password: string;

  // 🆕 FALTA: birthDate (a agregar - OPCIONAL)
}
```

**Decoradores de sanitización:**

- `@SanitizeEmail()` - Limpia y normaliza emails
- `@SanitizeHtml()` - Previene XSS en campos de texto
- `@Trim()` - Elimina espacios al inicio y final

---

#### 3. DTO de Actualización (`update-user.dto.ts`)

```typescript
export class UpdateUserDto {
  @ApiProperty({
    example: "nuevo@ejemplo.com",
    description: "Nuevo email del usuario",
    required: false,
  })
  @IsEmail({}, { message: "Por favor proporcione un email válido" })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: "Nuevo Nombre",
    description: "Nuevo nombre del usuario",
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "nuevaPassword123",
    description: "Nueva contraseña (mínimo 6 caracteres)",
    required: false,
  })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: "https://example.com/profile.jpg",
    description: "URL de la foto de perfil",
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    example: "2024-01-15T10:30:00Z",
    description: "Fecha y hora del último login",
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastLogin?: Date;

  // 🆕 FALTA: birthDate (a agregar - OPCIONAL)
}
```

---

#### 4. Endpoint de Registro (`auth.controller.ts`)

```typescript
@Post('register')
@RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 }) // 3 registros/hora por IP
@Throttle({ default: { limit: 3, ttl: 3600000 } })
@ApiOperation({
  summary: 'Registrar nuevo usuario',
  description: 'Crea una nueva cuenta de usuario en el sistema. Por defecto, los usuarios se crean con plan FREE.',
})
@ApiBody({
  type: CreateUserDto,
  examples: {
    ejemplo1: {
      summary: 'Registro de usuario básico',
      value: {
        email: 'usuario@ejemplo.com',
        name: 'Juan Pérez',
        password: 'MiPassword123!',
      },
    },
  },
})
async register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];
  return this.authService.register(createUserDto, ipAddress, userAgent);
}
```

**Características:**

- ✅ Rate limiting agresivo: **3 registros por hora por IP**
- ✅ Throttling con `@nestjs/throttler`
- ✅ Documentación con Swagger
- ✅ Tracking de IP y User-Agent

**Respuesta exitosa:**

```json
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "plan": "free",
    "isAdmin": false
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": true
}
```

---

### 📋 Plan para Agregar `birthDate`

#### ✅ Cambios necesarios:

##### 1. **Entidad User** (`user.entity.ts`)

```typescript
@ApiProperty({
  example: '1990-05-15',
  description: 'Fecha de nacimiento del usuario (formato: YYYY-MM-DD)',
  nullable: true,
})
@Column({ type: 'date', nullable: true })
birthDate: Date | null;
```

**Posición sugerida:** Después de `profilePicture` (antes de la sección de roles)

**Decisiones de diseño:**

- ✅ **`nullable: true`** - No es obligatorio (usuarios existentes no lo tienen)
- ✅ **Tipo `date`** - Solo fecha, sin hora
- ✅ **No exponer edad directamente** - Se calcula en frontend/backend según necesidad

##### 2. **CreateUserDto** (`create-user.dto.ts`)

```typescript
@ApiProperty({
  example: '1990-05-15',
  description: 'Fecha de nacimiento (formato: YYYY-MM-DD)',
  required: false,
})
@IsOptional()
@IsDateString({}, { message: 'Birth date must be a valid date (YYYY-MM-DD)' })
@Type(() => Date)
birthDate?: Date;
```

**Validaciones:**

- ✅ **Opcional** - No bloquea registro de usuarios que no quieran proporcionarla
- ✅ **`@IsDateString()`** - Valida formato ISO 8601
- ✅ **`@Type(() => Date)`** - Transforma string a Date

##### 3. **UpdateUserDto** (`update-user.dto.ts`)

```typescript
@ApiProperty({
  example: '1990-05-15',
  description: 'Fecha de nacimiento (formato: YYYY-MM-DD)',
  required: false,
})
@IsOptional()
@IsDateString({}, { message: 'Birth date must be a valid date (YYYY-MM-DD)' })
@Type(() => Date)
birthDate?: Date;
```

##### 4. **Migración de Base de Datos**

```typescript
// XXXXXXXXXXXX-AddBirthDateToUser.ts
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBirthDateToUser1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "birthDate",
        type: "date",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("user", "birthDate");
  }
}
```

##### 5. **Consideraciones Frontend**

Para el horóscopo necesitaremos:

```typescript
// Función helper para calcular signo zodiacal
function getZodiacSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Tauro';
  // ... resto de signos
}

// En el perfil o settings
<DatePicker
  label="Fecha de nacimiento"
  value={user.birthDate}
  onChange={(date) => updateProfile({ birthDate: date })}
  optional={true}
  helperText="Necesario para tu horóscopo personalizado"
/>;
```

---

#### 🎯 Estrategia de Implementación:

1. **Fase 1: Backend**
   - ✅ Crear migración de base de datos
   - ✅ Actualizar entidad User
   - ✅ Actualizar DTOs (CreateUserDto, UpdateUserDto)
   - ✅ Ejecutar migración en desarrollo
   - ✅ Tests: verificar que registro/update funciona con y sin birthDate

2. **Fase 2: Frontend**
   - ✅ Actualizar tipo `User` en TypeScript
   - ✅ Agregar campo opcional en formulario de registro
   - ✅ Agregar campo editable en perfil de usuario
   - ✅ Crear helper para calcular signo zodiacal
   - ✅ Mostrar aviso si no tiene birthDate configurada (para horóscopo)

3. **Fase 3: Feature Horóscopo**
   - ✅ Validar que usuario tenga birthDate antes de generar horóscopo
   - ✅ Usar birthDate para personalizar lectura astrológica
   - ✅ Sugerir configurar birthDate si falta

---

#### ⚠️ Consideraciones Importantes:

1. **Privacidad:**
   - El campo es opcional
   - Solo visible para el usuario (no público)
   - Considerar GDPR/CCPA si hay usuarios EU/California

2. **Validación:**
   - Aceptar fechas en el pasado (hasta ~120 años atrás)
   - No aceptar fechas futuras
   - Validar que sea mayor de edad si aplica (opcional según región)

3. **Retrocompatibilidad:**
   - Usuarios existentes tendrán `birthDate: null`
   - No forzar a completarlo
   - Mostrar prompt suave en UI si accede a horóscopo sin fecha

4. **Testing:**
   - ✅ Usuario nuevo **con** birthDate
   - ✅ Usuario nuevo **sin** birthDate
   - ✅ Usuario existente actualiza birthDate
   - ✅ Validación de formatos inválidos
   - ✅ Edge cases: fecha futura, fecha muy antigua

---

### Pregunta 3: Configuración actual de Cron Jobs

**Objetivo:** Entender cómo están configurados los jobs programados actualmente para agregar el job de horóscopo diario.

#### 1. Configuración Global

**ScheduleModule activado en `app.module.ts`:**

```typescript
@Module({
  imports: [
    // ... otros imports
    ScheduleModule.forRoot(), // ✅ Ya está configurado globalmente
    // ... otros módulos
  ],
})
export class AppModule {}
```

**Package instalado:**

```json
{
  "dependencies": {
    "@nestjs/schedule": "^6.0.1"
  }
}
```

✅ **El sistema ya tiene scheduling configurado y listo para usar**

---

#### 2. Cron Jobs Existentes

El proyecto tiene **6 servicios con cron jobs** activos:

| Servicio                       | Cron Expression                      | Frecuencia       | Descripción                                        |
| ------------------------------ | ------------------------------------ | ---------------- | -------------------------------------------------- |
| **TokenCleanupService**        | `EVERY_DAY_AT_3AM`                   | Diario 3:00 AM   | Limpia tokens expirados (refresh + password reset) |
| **CacheCleanupService** (1)    | `EVERY_DAY_AT_3AM`                   | Diario 3:00 AM   | Limpia cachés de interpretaciones expirados        |
| **CacheCleanupService** (2)    | `EVERY_WEEK`                         | Semanal          | Limpia cachés poco usados                          |
| **CacheCleanupService** (3)    | `EVERY_6_HOURS`                      | Cada 6 horas     | Log de estadísticas del caché                      |
| **ReadingsCleanupService**     | `EVERY_DAY_AT_4AM`                   | Diario 4:00 AM   | Limpieza de lecturas según política de retención   |
| **DailyReadingCleanupService** | `EVERY_DAY_AT_5AM`                   | Diario 5:00 AM   | Limpieza de lecturas diarias antiguas              |
| **UsageLimitsResetService**    | `EVERY_DAY_AT_MIDNIGHT`              | Diario 00:00 UTC | Elimina registros de límites antiguos (>7 días)    |
| **AIQuotaService**             | `EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT` | Mensual          | Reset de cuotas de IA mensuales                    |
| **AIProviderCostService**      | `EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT` | Mensual          | Actualización de precios de providers              |

---

#### 3. Ejemplo de Implementación: TokenCleanupService

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    // Inyección de dependencias
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRepository
  ) {}

  /**
   * Limpieza automática de tokens expirados
   * Se ejecuta diariamente a las 3:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup() {
    this.logger.log("Starting token cleanup task...");

    try {
      // Limpiar refresh tokens expirados
      const deletedRefreshTokens = await this.refreshTokenRepository.deleteExpiredTokens();
      this.logger.log(`Deleted ${deletedRefreshTokens} expired refresh tokens`);

      // Limpiar password reset tokens expirados
      const deletedPasswordResetTokens = await this.passwordResetRepository.deleteExpiredTokens();
      this.logger.log(`Deleted ${deletedPasswordResetTokens} expired password reset tokens`);

      this.logger.log("Token cleanup completed successfully");
    } catch (error) {
      this.logger.error("Error during token cleanup:", error);
    }
  }

  /**
   * Método manual para ejecutar limpieza bajo demanda
   */
  async cleanupNow(): Promise<{
    deletedRefreshTokens: number;
    deletedPasswordResetTokens: number;
  }> {
    // Implementación para ejecución manual
  }
}
```

**Características clave:**

- ✅ Decorador `@Cron()` con expresión predefinida
- ✅ Logger específico del servicio
- ✅ Try-catch para no romper la app en caso de error
- ✅ Logs detallados de inicio, progreso y completado
- ✅ Método manual opcional para testing/debug

---

#### 4. Ejemplo Avanzado: CacheCleanupService (Múltiples Jobs)

```typescript
import { Injectable, Logger } from "@nestjs/service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class CacheCleanupService {
  private readonly logger = new Logger(CacheCleanupService.name);

  constructor(private readonly cacheService: InterpretationCacheService) {}

  /**
   * Ejecuta limpieza de cachés expirados diariamente a las 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanExpiredCache() {
    this.logger.log("Starting expired cache cleanup...");

    try {
      const deletedCount = await this.cacheService.cleanExpiredCache();
      this.logger.log(`Expired cache cleanup completed. Deleted ${deletedCount} entries.`);
    } catch (error) {
      this.logger.error("Error during expired cache cleanup:", error);
    }
  }

  /**
   * Ejecuta limpieza de cachés poco usados cada domingo a las 4 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanUnusedCache() {
    this.logger.log("Starting unused cache cleanup...");

    try {
      const deletedCount = await this.cacheService.cleanUnusedCache();
      this.logger.log(`Unused cache cleanup completed. Deleted ${deletedCount} entries.`);
    } catch (error) {
      this.logger.error("Error during unused cache cleanup:", error);
    }
  }

  /**
   * Log de estadísticas del caché cada 6 horas
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async logCacheStats() {
    try {
      const stats = await this.cacheService.getCacheStats();
      this.logger.log(
        `Cache stats - Total: ${stats.total}, Expired: ${stats.expired}, Avg Hits: ${stats.avgHits.toFixed(2)}`
      );
    } catch (error) {
      this.logger.error("Error logging cache stats:", error);
    }
  }
}
```

**Características:**

- ✅ **Múltiples cron jobs** en un mismo servicio
- ✅ Diferentes frecuencias según la tarea
- ✅ Logs específicos para cada job

---

#### 5. Ejemplo con Opciones: UsageLimitsResetService

```typescript
@Injectable()
export class UsageLimitsResetService {
  private readonly logger = new Logger(UsageLimitsResetService.name);

  constructor(
    @InjectRepository(UsageLimit)
    private readonly usageLimitRepository: Repository<UsageLimit>
  ) {}

  /**
   * Cron job que runs every day at midnight UTC.
   * Deletes usage limit records older than USAGE_RETENTION_DAYS (7 days).
   *
   * @cron EVERY_DAY_AT_MIDNIGHT (0 0 * * *)
   * @timezone UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: "daily-usage-limits-reset", // ✅ Nombre identificador
    timeZone: "UTC", // ✅ Timezone específico
  })
  async handleDailyReset(): Promise<void> {
    this.logger.log("Daily usage limits reset job started");

    try {
      const cutoffDateStr = getDateDaysAgoUTCString(USAGE_RETENTION_DAYS);

      const deleteResult = await this.usageLimitRepository.delete({
        date: LessThan(cutoffDateStr),
      });

      const deletedCount = deleteResult.affected || 0;
      this.logger.log(`Deleted ${deletedCount} usage limit records older than ${USAGE_RETENTION_DAYS} days`);
    } catch (error) {
      this.logger.error("Error during daily usage limits reset", error instanceof Error ? error.stack : String(error));
      // ⚠️ Don't throw - we don't want to stop the app if cleanup fails
    }
  }

  /**
   * Gets statistics about records that would be deleted.
   * Useful for monitoring and debugging.
   */
  async getRetentionStats(): Promise<{
    recordsToDelete: number;
    retentionDays: number;
  }> {
    // Helper method para debugging
  }
}
```

**Opciones del decorador `@Cron`:**

```typescript
@Cron(expression, {
  name: string,           // Identificador único del job
  timeZone: string,       // Timezone (ej: 'UTC', 'America/New_York')
  disabled: boolean,      // Deshabilitar temporalmente
})
```

---

#### 6. CronExpressions Disponibles

```typescript
import { CronExpression } from '@nestjs/schedule';

// Expresiones más comunes
CronExpression.EVERY_SECOND           // "* * * * * *"
CronExpression.EVERY_5_SECONDS        // "*/5 * * * * *"
CronExpression.EVERY_10_SECONDS       // "*/10 * * * * *"
CronExpression.EVERY_30_SECONDS       // "*/30 * * * * *"
CronExpression.EVERY_MINUTE           // "0 * * * * *"
CronExpression.EVERY_5_MINUTES        // "0 */5 * * * *"
CronExpression.EVERY_10_MINUTES       // "0 */10 * * * *"
CronExpression.EVERY_30_MINUTES       // "0 */30 * * * *"
CronExpression.EVERY_HOUR             // "0 0 * * * *"
CronExpression.EVERY_6_HOURS          // "0 0 */6 * * *"
CronExpression.EVERY_12_HOURS         // "0 0 */12 * * *"
CronExpression.EVERY_DAY_AT_MIDNIGHT  // "0 0 0 * * *"
CronExpression.EVERY_DAY_AT_1AM       // "0 0 1 * * *"
CronExpression.EVERY_DAY_AT_2AM       // "0 0 2 * * *"
CronExpression.EVERY_DAY_AT_3AM       // "0 0 3 * * *"
CronExpression.EVERY_DAY_AT_4AM       // "0 0 4 * * *"
CronExpression.EVERY_DAY_AT_5AM       // "0 0 5 * * *"
CronExpression.EVERY_DAY_AT_NOON      // "0 0 12 * * *"
CronExpression.EVERY_WEEK             // "0 0 0 * * 0" (Domingo)
CronExpression.EVERY_MONTH            // "0 0 0 1 * *"
CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT  // "0 0 0 1 * *"
CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON      // "0 0 12 1 * *"

// Expresión personalizada
@Cron('0 0 6 * * *')  // Diario a las 6 AM
@Cron('0 30 8 * * 1-5')  // Lunes a Viernes a las 8:30 AM
```

---

#### 7. Horarios Actuales Ocupados

**Timeline de ejecución diaria:**

```
00:00 UTC  ├─ UsageLimitsResetService (limpieza de límites antiguos)
00:00 UTC  ├─ AIQuotaService (reset mensual de cuotas)
00:00 UTC  └─ AIProviderCostService (actualización precios)
           │
03:00 AM   ├─ TokenCleanupService (limpia tokens expirados)
03:00 AM   └─ CacheCleanupService (limpia cachés expirados)
           │
04:00 AM   └─ ReadingsCleanupService (limpieza de lecturas)
           │
05:00 AM   └─ DailyReadingCleanupService (limpieza lecturas diarias)
           │
06:00 AM   🆕 HORÓSCOPO DIARIO (slot sugerido)
           │
Cada 6h    └─ CacheCleanupService (stats logging)
           │
Semanal    └─ CacheCleanupService (limpieza cachés poco usados)
```

---

### 📋 Plan para Agregar Horóscopo Diario

#### ✅ Estructura sugerida:

```
src/modules/
└── horoscope/
    ├── horoscope.module.ts
    ├── entities/
    │   └── daily-horoscope.entity.ts
    ├── application/
    │   ├── services/
    │   │   ├── horoscope-generation.service.ts  # Lógica de generación
    │   │   └── horoscope-cron.service.ts        # ⭐ Cron job
    │   └── dto/
    │       └── create-horoscope.dto.ts
    └── infrastructure/
        └── repositories/
            └── horoscope.repository.ts
```

#### ✅ Implementación del Cron Job:

```typescript
// horoscope-cron.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { HoroscopeGenerationService } from "./horoscope-generation.service";

@Injectable()
export class HoroscopeCronService {
  private readonly logger = new Logger(HoroscopeCronService.name);

  constructor(private readonly horoscopeService: HoroscopeGenerationService) {}

  /**
   * Genera horóscopos diarios para todos los signos
   * Se ejecuta todos los días a las 6:00 AM UTC
   *
   * 📅 Horario elegido: 6 AM UTC
   * - Para usuarios en España (UTC+1): 7 AM hora local
   * - Para usuarios en México (UTC-6): 12 AM (medianoche) hora local
   * - Para usuarios en Argentina (UTC-3): 3 AM hora local
   *
   * ⏰ Después de todos los jobs de limpieza (3-5 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_NOON, {
    // Cambiar a '0 0 6 * * *'
    name: "daily-horoscope-generation",
    timeZone: "UTC",
  })
  async generateDailyHoroscopes() {
    this.logger.log("Starting daily horoscope generation...");

    try {
      const zodiacSigns = [
        "Aries",
        "Tauro",
        "Géminis",
        "Cáncer",
        "Leo",
        "Virgo",
        "Libra",
        "Escorpio",
        "Sagitario",
        "Capricornio",
        "Acuario",
        "Piscis",
      ];

      const results = await Promise.allSettled(zodiacSigns.map((sign) => this.horoscopeService.generateForSign(sign)));

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      this.logger.log(`Daily horoscope generation completed: ${successful} successful, ${failed} failed`);

      // Log errors si hay
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          this.logger.error(`Failed to generate horoscope for ${zodiacSigns[index]}:`, result.reason);
        }
      });
    } catch (error) {
      this.logger.error("Error during daily horoscope generation:", error);
      // No throw - no queremos que crashee la app
    }
  }

  /**
   * Limpia horóscopos antiguos (>30 días)
   * Se ejecuta semanalmente los domingos a las 2 AM
   */
  @Cron(CronExpression.EVERY_WEEK, {
    name: "horoscope-cleanup",
    timeZone: "UTC",
  })
  async cleanupOldHoroscopes() {
    this.logger.log("Starting old horoscope cleanup...");

    try {
      const deletedCount = await this.horoscopeService.cleanupOldHoroscopes(30);
      this.logger.log(`Deleted ${deletedCount} old horoscopes (>30 days)`);
    } catch (error) {
      this.logger.error("Error during horoscope cleanup:", error);
    }
  }

  /**
   * Método manual para testing/debug
   */
  async generateNow(): Promise<void> {
    await this.generateDailyHoroscopes();
  }
}
```

#### ✅ Registrar en el módulo:

```typescript
// horoscope.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DailyHoroscope } from "./entities/daily-horoscope.entity";
import { HoroscopeGenerationService } from "./application/services/horoscope-generation.service";
import { HoroscopeCronService } from "./application/services/horoscope-cron.service";
import { AIModule } from "../ai/ai.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyHoroscope]),
    AIModule, // Para usar AIProviderService
  ],
  providers: [
    HoroscopeGenerationService,
    HoroscopeCronService, // ✅ Registrar el servicio de cron
  ],
  exports: [HoroscopeGenerationService],
})
export class HoroscopeModule {}
```

#### ✅ Agregar al AppModule:

```typescript
// app.module.ts
@Module({
  imports: [
    // ... otros imports
    HoroscopeModule, // ✅ Agregar módulo
    // ... resto
  ],
})
export class AppModule {}
```

---

#### 🎯 Consideraciones Importantes:

1. **Horario:**
   - ✅ **6 AM UTC** recomendado (después de jobs de limpieza)
   - Alternativa: **12 AM UTC** (medianoche) si se prefiere generación nocturna

2. **Resiliencia:**
   - ✅ `Promise.allSettled()` para no fallar si un signo falla
   - ✅ Try-catch global para no crashear la app
   - ✅ Logs detallados de éxitos y fallos

3. **Performance:**
   - ✅ Generar 12 horóscopos en paralelo (1-2 min total)
   - ✅ Cachear resultados en base de datos
   - ✅ No bloquear otros procesos

4. **Testing:**
   - ✅ Método `generateNow()` para testing manual
   - ✅ Variables de entorno para deshabilitar en tests:
     ```typescript
     @Cron(expression, {
       disabled: process.env.NODE_ENV === 'test',
     })
     ```

5. **Monitoreo:**
   - ✅ Logs claros con timestamps
   - ✅ Conteo de éxitos/fallos
   - ✅ Considerar integrar con servicio de alertas (ej: Sentry)

---

### Pregunta 4: Estructura de la base de datos actual

**Objetivo:** Entender el esquema actual de la base de datos para diseñar las nuevas tablas (horóscopo diario) sin conflictos y con relaciones correctas.

#### 1. Overview de la Base de Datos

**Tecnología:**

- **DBMS:** PostgreSQL 16 (Docker, puerto 5435)
- **ORM:** TypeORM 0.3.x
- **Total de Entidades:** **30 tablas**
- **Convenciones:** snake_case para tablas y columnas, PK con nombre `id` autoincremental

**Configuración TypeORM (`src/config/typeorm.ts`):**

```typescript
export default registerAs("database", () => ({
  type: "postgres",
  host: process.env.TAROT_DB_HOST || "localhost",
  port: parseInt(process.env.TAROT_DB_PORT || "5435", 10),
  username: process.env.TAROT_DB_USER || "tarot_user",
  password: process.env.TAROT_DB_PASSWORD,
  database: process.env.TAROT_DB_NAME || "tarot_db",
  synchronize: false, // ✅ DESACTIVADO - Usamos migraciones
  autoLoadEntities: true,
  logging: process.env.NODE_ENV === "development",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  migrationsTableName: "migrations",
  migrationsRun: true, // Auto-ejecutar migraciones al iniciar

  // Connection pooling (producción)
  extra: {
    max: 25, // Máximo de conexiones en el pool
    min: 5, // Mínimo de conexiones mantenidas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  },
}));
```

---

#### 2. Resumen de Tablas por Módulo

| Módulo             | Tablas                                                                                                                           | Descripción                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Usuarios**       | `users`, `tarotistas`, `tarotista_config`, `tarotista_applications`                                                              | Gestión de usuarios y tarotistas              |
| **Autenticación**  | `refresh_tokens`, `password_reset_tokens`                                                                                        | Tokens JWT y recuperación de contraseña       |
| **Tarot Core**     | `tarot_card`, `tarot_spread`, `tarot_deck`, `tarot_reading`, `tarot_interpretation`, `daily_readings`, `tarotista_card_meanings` | Cartas, tiradas, lecturas e interpretaciones  |
| **Catálogo**       | `reading_category`, `predefined_questions`                                                                                       | Categorías y preguntas predefinidas           |
| **Reviews & Subs** | `tarotista_reviews`, `user_tarotista_subscriptions`, `tarotista_revenue_metrics`                                                 | Reseñas, suscripciones y métricas de ingresos |
| **Scheduling**     | `sessions`, `tarotist_availability`, `tarotist_exceptions`                                                                       | Sesiones en vivo y disponibilidad             |
| **AI & Cache**     | `ai_usage_logs`, `ai_provider_usage`, `cached_interpretations`, `cache_metrics`                                                  | Logs de IA y cachés de interpretaciones       |
| **Sistema**        | `usage_limits`, `anonymous_usage`, `security_events`, `audit_logs`, `plans`                                                      | Límites de uso, seguridad y auditoría         |

**Total:** 30 entidades

---

#### 3. Entidades Relevantes para Horóscopo Diario

##### 3.1. **users** (Base para usuario)

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: "date", nullable: true })
  birthDate: Date | null; // 🆕 A AGREGAR para horóscopo

  @Column({ type: "enum", enum: UserPlan, default: UserPlan.FREE })
  plan: UserPlan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => TarotReading, (reading) => reading.user)
  readings: TarotReading[];

  // 🆕 A AGREGAR
  @OneToMany(() => DailyHoroscope, (horoscope) => horoscope.user)
  horoscopes: DailyHoroscope[];
}
```

**Campos clave:**

- `id` - PRIMARY KEY
- `email` - UNIQUE
- `birthDate` - **A AGREGAR** (nullable Date)
- `plan` - Enum: FREE, PREMIUM

---

##### 3.2. **tarotistas** (Tarotistas que generan horóscopos)

```typescript
@Entity("tarotistas")
export class Tarotista {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @Column({ length: 100 })
  display_name: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0.0 })
  rating_promedio: number;

  @Column({ type: "integer", default: 0 })
  total_readings: number;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => TarotReading, (reading) => reading.tarotista)
  readings: TarotReading[];

  // 🆕 A AGREGAR
  @OneToMany(() => DailyHoroscope, (horoscope) => horoscope.tarotista)
  horoscopes: DailyHoroscope[];
}
```

**Campos clave:**

- `id` - PRIMARY KEY
- `user_id` - FOREIGN KEY → users(id)
- `display_name` - Nombre público
- `is_active` - Para filtrar tarotistas activos

---

##### 3.3. **daily_readings** (Carta del día - Modelo existente)

```typescript
@Entity("daily_readings")
export class DailyReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  tarotista_id: number;

  @Column()
  card_id: number;

  @Column({ type: "enum", enum: Orientation })
  orientation: "upright" | "reversed";

  @Column({ type: "text" })
  interpretation: string;

  @Column({ type: "date" })
  reading_date: Date;

  @Column({ type: "boolean", default: false })
  was_regenerated: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Tarotista)
  @JoinColumn({ name: "tarotista_id" })
  tarotista: Tarotista;

  @ManyToOne(() => TarotCard)
  @JoinColumn({ name: "card_id" })
  card: TarotCard;
}
```

**Índice único:**

```sql
CREATE UNIQUE INDEX idx_daily_readings_unique
  ON daily_readings(user_id, reading_date, tarotista_id);
```

---

#### 4. Diseño Propuesto: Tabla `daily_horoscopes`

##### 4.1. Estructura de la Entidad

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Tarotista } from "../../tarotistas/entities/tarotista.entity";

export enum ZodiacSign {
  ARIES = "aries",
  TAURUS = "taurus",
  GEMINI = "gemini",
  CANCER = "cancer",
  LEO = "leo",
  VIRGO = "virgo",
  LIBRA = "libra",
  SCORPIO = "scorpio",
  SAGITTARIUS = "sagittarius",
  CAPRICORN = "capricorn",
  AQUARIUS = "aquarius",
  PISCES = "pisces",
}

@Entity("daily_horoscopes")
@Index("idx_horoscope_sign_date", ["zodiacSign", "horoscopeDate"], { unique: true })
@Index("idx_horoscope_tarotista_date", ["tarotistaId", "horoscopeDate"])
@Index("idx_horoscope_date", ["horoscopeDate"])
export class DailyHoroscope {
  @ApiProperty({ example: 1, description: "ID único del horóscopo" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "aries",
    description: "Signo zodiacal",
    enum: ZodiacSign,
  })
  @Column({
    type: "enum",
    enum: ZodiacSign,
  })
  zodiacSign: ZodiacSign;

  @ApiProperty({ example: "2026-01-16", description: "Fecha del horóscopo" })
  @Column({ type: "date" })
  horoscopeDate: Date;

  @ApiProperty({ example: 1, description: "ID del tarotista que generó" })
  @Column({ nullable: true })
  tarotistaId: number | null;

  @ApiProperty({
    example: "Hoy es un día de nuevas oportunidades...",
    description: "Contenido del horóscopo",
  })
  @Column({ type: "text" })
  content: string;

  @ApiProperty({
    example: "love",
    description: "Área de enfoque del día",
    enum: ["love", "work", "health", "finance", "general"],
  })
  @Column({ type: "varchar", length: 20, nullable: true })
  focusArea: string | null;

  @ApiProperty({ example: 8, description: "Puntuación del día (1-10)" })
  @Column({ type: "smallint", nullable: true })
  luckyScore: number | null;

  @ApiProperty({ example: "Verde", description: "Color de la suerte" })
  @Column({ type: "varchar", length: 50, nullable: true })
  luckyColor: string | null;

  @ApiProperty({ example: 7, description: "Número de la suerte" })
  @Column({ type: "smallint", nullable: true })
  luckyNumber: number | null;

  @ApiProperty({
    example: { love: 9, work: 7, health: 8 },
    description: "Métricas detalladas por área",
  })
  @Column({ type: "jsonb", nullable: true })
  metrics: {
    love?: number;
    work?: number;
    health?: number;
    finance?: number;
  } | null;

  @ApiProperty({ example: "groq", description: "Proveedor de IA usado" })
  @Column({ type: "varchar", length: 50, nullable: true })
  aiProvider: string | null;

  @ApiProperty({ example: "llama-3.1-70b-versatile", description: "Modelo de IA" })
  @Column({ type: "varchar", length: 100, nullable: true })
  aiModel: string | null;

  @ApiProperty({ example: 1500, description: "Tokens usados en generación" })
  @Column({ type: "integer", default: 0 })
  tokensUsed: number;

  @ApiProperty({ example: 0, description: "Veces que se visualizó" })
  @Column({ type: "integer", default: 0 })
  viewCount: number;

  @ApiProperty({ example: "2026-01-16T06:00:00Z", description: "Fecha de creación" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: "2026-01-16T06:00:00Z", description: "Última actualización" })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Tarotista, (tarotista) => tarotista.horoscopes, { nullable: true })
  @JoinColumn({ name: "tarotistaId" })
  tarotista: Tarotista | null;
}
```

---

##### 4.2. Migración para Crear la Tabla

```typescript
// src/migrations/XXXXXXXXXXXX-CreateDailyHoroscopes.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateDailyHoroscopes1737000000000 implements MigrationInterface {
  name = "CreateDailyHoroscopes1737000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum de signos zodiacales
    await queryRunner.query(`
      CREATE TYPE "zodiac_sign_enum" AS ENUM (
        'aries', 'taurus', 'gemini', 'cancer',
        'leo', 'virgo', 'libra', 'scorpio',
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
      );
    `);

    // Crear tabla
    await queryRunner.createTable(
      new Table({
        name: "daily_horoscopes",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "zodiacSign",
            type: "zodiac_sign_enum",
          },
          {
            name: "horoscopeDate",
            type: "date",
          },
          {
            name: "tarotistaId",
            type: "integer",
            isNullable: true,
          },
          {
            name: "content",
            type: "text",
          },
          {
            name: "focusArea",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "luckyScore",
            type: "smallint",
            isNullable: true,
          },
          {
            name: "luckyColor",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "luckyNumber",
            type: "smallint",
            isNullable: true,
          },
          {
            name: "metrics",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "aiProvider",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "aiModel",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "tokensUsed",
            type: "integer",
            default: 0,
          },
          {
            name: "viewCount",
            type: "integer",
            default: 0,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Crear índice único (signo + fecha)
    await queryRunner.createIndex(
      "daily_horoscopes",
      new TableIndex({
        name: "idx_horoscope_sign_date",
        columnNames: ["zodiacSign", "horoscopeDate"],
        isUnique: true,
      })
    );

    // Crear índice para búsqueda por fecha
    await queryRunner.createIndex(
      "daily_horoscopes",
      new TableIndex({
        name: "idx_horoscope_date",
        columnNames: ["horoscopeDate"],
      })
    );

    // Crear índice para tarotista + fecha
    await queryRunner.createIndex(
      "daily_horoscopes",
      new TableIndex({
        name: "idx_horoscope_tarotista_date",
        columnNames: ["tarotistaId", "horoscopeDate"],
      })
    );

    // Crear foreign key con tarotistas
    await queryRunner.createForeignKey(
      "daily_horoscopes",
      new TableForeignKey({
        columnNames: ["tarotistaId"],
        referencedTableName: "tarotistas",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    const table = await queryRunner.getTable("daily_horoscopes");
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf("tarotistaId") !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey("daily_horoscopes", foreignKey);
    }

    // Eliminar índices
    await queryRunner.dropIndex("daily_horoscopes", "idx_horoscope_tarotista_date");
    await queryRunner.dropIndex("daily_horoscopes", "idx_horoscope_date");
    await queryRunner.dropIndex("daily_horoscopes", "idx_horoscope_sign_date");

    // Eliminar tabla
    await queryRunner.dropTable("daily_horoscopes");

    // Eliminar enum
    await queryRunner.query(`DROP TYPE "zodiac_sign_enum";`);
  }
}
```

---

##### 4.3. Diagrama ER de la Nueva Tabla

```
┌─────────────────────────────────────────────────────────────────┐
│                   MÓDULO DE HORÓSCOPO DIARIO                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐                   ┌──────────────────────┐ │
│  │  tarotistas    │                   │  daily_horoscopes    │ │
│  │                │ 1               * │                      │ │
│  │ - id ────────────────────────────────> tarotistaId        │ │
│  │ - user_id      │                   │ - id                 │ │
│  │ - display_name │                   │ - zodiacSign (ENUM)  │ │
│  │ - is_active    │                   │ - horoscopeDate      │ │
│  │ - rating       │                   │ - content (TEXT)     │ │
│  └────────────────┘                   │ - focusArea          │ │
│                                        │ - luckyScore (1-10)  │ │
│  ┌────────────────┐                   │ - luckyColor         │ │
│  │     users      │                   │ - luckyNumber        │ │
│  │                │                   │ - metrics (JSONB)    │ │
│  │ - id           │                   │ - aiProvider         │ │
│  │ - email        │                   │ - aiModel            │ │
│  │ - birthDate ◄─────(para calcular   │ - tokensUsed         │ │
│  │ - plan         │    signo zodiacal)│ - viewCount          │ │
│  └────────────────┘                   │ - createdAt          │ │
│                                        └──────────────────────┘ │
│                                                                 │
│  UNIQUE INDEX: (zodiacSign, horoscopeDate)                     │
│  INDEX: (horoscopeDate)                                        │
│  INDEX: (tarotistaId, horoscopeDate)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 5. Relaciones con Tablas Existentes

##### 5.1. **Con `tarotistas`**

```typescript
// En DailyHoroscope
@ManyToOne(() => Tarotista, tarotista => tarotista.horoscopes, { nullable: true })
@JoinColumn({ name: 'tarotistaId' })
tarotista: Tarotista | null;

// En Tarotista (agregar)
@OneToMany(() => DailyHoroscope, horoscope => horoscope.tarotista)
horoscopes: DailyHoroscope[];
```

**Foreign Key:** `tarotistaId` → `tarotistas(id)` con `ON DELETE SET NULL`

---

##### 5.2. **Con `users`** (Indirecto vía birthDate)

No hay relación directa en la tabla `daily_horoscopes` con `users`, ya que:

- Los horóscopos son **generales por signo** (no personalizados por usuario)
- Se calcula el signo zodiacal del usuario usando `user.birthDate`
- El frontend hace el matching: `getUserZodiacSign(user.birthDate)` → query horóscopo del día

**Ventaja:**

- ✅ 1 horóscopo por signo/día (12 registros diarios)
- ✅ Escalable: No importa cuántos usuarios haya
- ✅ Cacheable: Todos los usuarios de Aries ven el mismo horóscopo

---

##### 5.3. **Con `ai_usage_logs`** (Tracking de costos)

Cuando se genera un horóscopo, se registra en `ai_usage_logs`:

```typescript
await this.aiUsageService.createLog({
  userId: null, // No asociado a usuario específico
  readingId: null,
  provider: AIProvider.GROQ,
  modelUsed: "llama-3.1-70b-versatile",
  promptTokens: response.tokensUsed.prompt,
  completionTokens: response.tokensUsed.completion,
  totalTokens: response.tokensUsed.total,
  costUsd: calculatedCost,
  durationMs: response.durationMs,
  status: AIUsageStatus.SUCCESS,
  errorMessage: null,
  fallbackUsed: false,
});
```

---

#### 6. Índices y Performance

##### 6.1. Índices Creados

```sql
-- Índice único: Previene duplicados (1 horóscopo por signo/día)
CREATE UNIQUE INDEX idx_horoscope_sign_date
  ON daily_horoscopes(zodiacSign, horoscopeDate);

-- Índice de búsqueda: Query por fecha
CREATE INDEX idx_horoscope_date
  ON daily_horoscopes(horoscopeDate);

-- Índice de tarotista: Horóscopos de un tarotista específico
CREATE INDEX idx_horoscope_tarotista_date
  ON daily_horoscopes(tarotistaId, horoscopeDate);
```

---

##### 6.2. Queries Optimizadas

**Query 1: Obtener horóscopo de hoy para un signo**

```typescript
const horoscope = await horoscopeRepo.findOne({
  where: {
    zodiacSign: ZodiacSign.ARIES,
    horoscopeDate: today,
  },
  relations: ["tarotista"],
});
```

**Explicación:** Usa `idx_horoscope_sign_date` (índice único) → **O(1) lookup**

---

**Query 2: Obtener todos los horóscopos de hoy**

```typescript
const horoscopes = await horoscopeRepo.find({
  where: {
    horoscopeDate: today,
  },
  order: {
    zodiacSign: "ASC",
  },
});
```

**Explicación:** Usa `idx_horoscope_date` → **Scan rápido** (solo 12 registros)

---

**Query 3: Incrementar viewCount**

```typescript
await horoscopeRepo
  .createQueryBuilder()
  .update()
  .set({ viewCount: () => "viewCount + 1" })
  .where("id = :id", { id: horoscopeId })
  .execute();
```

**Explicación:** Actualización atómica sin race conditions

---

#### 7. Limpieza de Datos Antiguos (Cron Job)

```typescript
// En HoroscopeCronService
@Cron(CronExpression.EVERY_WEEK, {
  name: 'horoscope-cleanup',
  timeZone: 'UTC',
})
async cleanupOldHoroscopes() {
  this.logger.log('Starting old horoscope cleanup...');

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleteResult = await this.horoscopeRepo.delete({
      horoscopeDate: LessThan(thirtyDaysAgo),
    });

    const deletedCount = deleteResult.affected || 0;
    this.logger.log(`Deleted ${deletedCount} old horoscopes (>30 days)`);
  } catch (error) {
    this.logger.error('Error during horoscope cleanup:', error);
  }
}
```

**Política de retención:** 30 días (suficiente para históricos y análisis)

---

#### 8. Estimación de Crecimiento de Datos

**Registros diarios:**

- 12 signos × 1 horóscopo/día = **12 registros/día**

**Retención de 30 días:**

- 12 registros/día × 30 días = **360 registros**

**Tamaño estimado:**

- Registro promedio: ~2 KB (con content y metadata)
- 360 registros × 2 KB = **~720 KB**

✅ **Escalabilidad:** Excelente. Incluso con 1 año de datos (4,380 registros) = ~8.7 MB

---

### 📋 Conclusiones para Integración de Horóscopo

#### ✅ Estado actual de la base de datos:

1. **30 entidades** bien estructuradas con TypeORM
2. **Migraciones activadas** (`synchronize: false`, `migrationsRun: true`)
3. **Connection pooling** configurado para producción
4. **Índices optimizados** en tablas clave
5. **Backup automatizado** (Render hace backups diarios)

#### ✅ Cambios necesarios:

1. **Agregar `birthDate` a `users`**
   - Migración: `AddBirthDateToUser`
   - Columna: `type: 'date', nullable: true`

2. **Crear tabla `daily_horoscopes`**
   - Migración: `CreateDailyHoroscopes`
   - Enum: `ZodiacSign` (12 signos)
   - Índices: sign+date (unique), date, tarotista+date
   - FK: `tarotistaId` → `tarotistas(id)` ON DELETE SET NULL

3. **Actualizar entidades existentes**
   - `User`: Agregar relación `@OneToMany(() => DailyHoroscope)`
   - `Tarotista`: Agregar relación `@OneToMany(() => DailyHoroscope)`

4. **Agregar cron job de limpieza**
   - Semanal: Eliminar horóscopos > 30 días

---

#### 🎯 Ventajas del diseño propuesto:

1. **Escalable:** Solo 12 registros/día independiente de usuarios
2. **Performante:** Índice único sign+date = O(1) lookup
3. **Cacheable:** Un horóscopo sirve para todos los usuarios del mismo signo
4. **Auditado:** Tracking de AI provider, modelo, tokens, costos
5. **Flexible:** JSONB metrics permite agregar métricas sin migración
6. **Limpio:** Auto-cleanup semanal evita crecimiento infinito

---

### Pregunta 5: Sistema de caché actual

**Objetivo:** Entender el sistema de caché para optimizar el almacenamiento de horóscopos diarios, que son candidatos perfectos para caché ya que se generan una vez al día.

#### 1. Estructura del Módulo de Caché

```
src/modules/cache/
├── cache.module.ts                 # ⭐ Módulo principal
├── application/
│   ├── constants/
│   │   └── cache-strategy.constants.ts  # Configuración de estrategias
│   ├── dto/
│   │   └── cache-analytics.dto.ts
│   └── services/
│       ├── interpretation-cache.service.ts    # ⭐ Servicio principal
│       ├── cache-cleanup.service.ts          # Limpieza automática
│       ├── cache-strategy.service.ts         # Estrategias avanzadas
│       ├── cache-analytics.service.ts        # Análisis y métricas
│       └── cache-warming.service.ts          # Pre-generación de caché
├── domain/
│   ├── entities/
│   └── interfaces/
└── infrastructure/
    ├── controllers/
    │   └── cache-admin.controller.ts         # Admin endpoints
    ├── entities/
    │   ├── cached-interpretation.entity.ts   # ⭐ Tabla de caché
    │   └── cache-metrics.entity.ts           # Métricas históricas
    └── repositories/
```

---

#### 2. Entidades del Sistema de Caché

##### 2.1. **cached_interpretations** (Caché de Interpretaciones)

```typescript
@Entity("cached_interpretations")
@Index(["tarotista_id", "spread_id", "question_hash"])
@Index(["tarotista_id", "created_at"])
export class CachedInterpretation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 255 })
  @Index()
  cache_key: string; // Hash SHA-256 único

  @Column({ type: "int", nullable: true })
  @Index()
  tarotista_id: number | null;

  @Column({ type: "int", nullable: true })
  spread_id: number | null;

  @Column({ type: "jsonb" })
  card_combination: {
    card_id: string;
    position: number;
    is_reversed: boolean;
  }[];

  @Column({ length: 64 })
  question_hash: string; // Hash SHA-256 de la pregunta

  @Column({ type: "text" })
  interpretation_text: string; // Interpretación completa

  @Column({ type: "int", default: 0 })
  hit_count: number; // Contador de usos

  @Column({ type: "timestamp", nullable: true })
  last_used_at: Date; // Última vez que se usó

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Column({ type: "timestamp" })
  expires_at: Date; // TTL dinámico
}
```

**Características clave:**

- ✅ **Cache key único:** Hash SHA-256 de (cartas + spread + pregunta)
- ✅ **JSONB para card_combination:** Flexible y performante
- ✅ **TTL dinámico:** `expires_at` ajustable según popularidad
- ✅ **Tracking de uso:** `hit_count` + `last_used_at` para analytics
- ✅ **Índices optimizados:** Para búsquedas rápidas

---

##### 2.2. **cache_metrics** (Métricas Históricas)

```typescript
@Entity("cache_metrics")
@Index(["metric_date", "metric_hour"])
export class CacheMetric {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "date" })
  @Index()
  metric_date: Date;

  @Column({ type: "int" })
  metric_hour: number; // Hora del día (0-23)

  @Column({ type: "int", default: 0 })
  total_requests: number;

  @Column({ type: "int", default: 0 })
  cache_hits: number;

  @Column({ type: "int", default: 0 })
  cache_misses: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  hit_rate_percentage: number;

  @Column({ type: "int", default: 0, nullable: true })
  avg_cache_response_time_ms: number | null;

  @Column({ type: "int", default: 0, nullable: true })
  avg_ai_response_time_ms: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}
```

**Uso:** Tracking hourly de hit rate y performance para análisis

---

#### 3. Servicio Principal: `InterpretationCacheService`

##### 3.1. Funcionalidades Core

```typescript
@Injectable()
export class InterpretationCacheService {
  private readonly MEMORY_CACHE_TTL = 3600000; // 1 hora en milisegundos
  private readonly DB_CACHE_TTL_DAYS = 30;

  constructor(
    @InjectRepository(CachedInterpretation)
    private readonly cacheRepository: Repository<CachedInterpretation>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache // In-memory cache (Redis/Memory)
  ) {}

  /**
   * Genera cache key único basado en cartas + spread + pregunta
   */
  generateCacheKey(cardCombination: CardCombination[], spreadId: string | null, questionHash: string): string {
    // Ordenar cartas por posición para consistencia
    const sortedCards = [...cardCombination].sort((a, b) => a.position - b.position);

    const cardsString = sortedCards.map((card) => `${card.card_id}-${card.position}-${card.is_reversed}`).join("|");

    const dataString = `${spreadId || "no-spread"}:${cardsString}:${questionHash}`;

    // Hash SHA-256
    return createHash("sha256").update(dataString).digest("hex");
  }

  /**
   * Genera hash de pregunta normalizada
   */
  generateQuestionHash(category: string, questionText: string): string {
    const normalizedCategory = category.toLowerCase().trim();
    const normalizedQuestion = questionText.toLowerCase().trim().replace(/\s+/g, " ");

    const dataString = `${normalizedCategory}:${normalizedQuestion}`;

    return createHash("sha256").update(dataString).digest("hex");
  }

  /**
   * Busca en caché (2 niveles: in-memory → DB)
   */
  async getFromCache(cacheKey: string): Promise<CachedInterpretation | null> {
    // 1. Buscar en caché in-memory (Redis/Memory)
    const memoryCache = await this.cacheManager.get<CachedInterpretation>(cacheKey);
    if (memoryCache) {
      return memoryCache;
    }

    // 2. Buscar en base de datos
    const dbCache = await this.cacheRepository.findOne({
      where: { cache_key: cacheKey },
    });

    if (!dbCache || dbCache.expires_at < new Date()) {
      return null; // No existe o expirado
    }

    // Actualizar hit_count y last_used_at
    await this.cacheRepository.update(
      { id: dbCache.id },
      {
        hit_count: dbCache.hit_count + 1,
        last_used_at: new Date(),
      }
    );

    // Guardar en caché in-memory para próximas consultas
    await this.cacheManager.set(cacheKey, dbCache, this.MEMORY_CACHE_TTL);

    return dbCache;
  }

  /**
   * Guarda en ambos cachés (in-memory + DB)
   */
  async saveToCache(
    cacheKey: string,
    spreadId: number | null,
    cardCombination: CardCombination[],
    questionHash: string,
    interpretation: string,
    tarotistaId?: number
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.DB_CACHE_TTL_DAYS);

    const cacheEntry = this.cacheRepository.create({
      cache_key: cacheKey,
      tarotista_id: tarotistaId || null,
      spread_id: spreadId,
      card_combination: cardCombination,
      question_hash: questionHash,
      interpretation_text: interpretation,
      hit_count: 0,
      expires_at: expiresAt,
    });

    const saved = await this.cacheRepository.save(cacheEntry);

    // Guardar también en in-memory
    await this.cacheManager.set(cacheKey, saved, this.MEMORY_CACHE_TTL);
  }
}
```

---

##### 3.2. Limpieza Automática

```typescript
/**
 * Elimina cachés expirados de la base de datos
 */
async cleanExpiredCache(): Promise<number> {
  const result = await this.cacheRepository
    .createQueryBuilder()
    .delete()
    .from(CachedInterpretation)
    .where('expires_at < :now', { now: new Date() })
    .execute();

  return result.affected || 0;
}

/**
 * Elimina cachés poco usados después de 7 días
 */
async cleanUnusedCache(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  const result = await this.cacheRepository
    .createQueryBuilder()
    .delete()
    .from(CachedInterpretation)
    .where('hit_count < :minHits', { minHits: 2 })
    .andWhere('created_at < :cutoffDate', { cutoffDate })
    .execute();

  return result.affected || 0;
}
```

**Cron Jobs (en `CacheCleanupService`):**

- `EVERY_DAY_AT_3AM` - Limpia cachés expirados
- `EVERY_WEEK` - Limpia cachés poco usados
- `EVERY_6_HOURS` - Log de estadísticas

---

##### 3.3. Invalidación Inteligente

```typescript
/**
 * Invalida todo el caché de un tarotista
 * Se dispara cuando cambia su configuración
 */
async invalidateTarotistaCache(tarotistaId: number): Promise<number> {
  const result = await this.cacheRepository
    .createQueryBuilder()
    .delete()
    .from(CachedInterpretation)
    .where('tarotista_id = :tarotistaId', { tarotistaId })
    .execute();

  return result.affected || 0;
}

/**
 * Event listener: Se ejecuta automáticamente cuando cambia config
 */
@OnEvent('tarotista.config.updated')
async handleTarotistaConfigUpdated(payload: {
  tarotistaId: number;
  previousConfig: TarotistaConfig;
  newConfig: TarotistaConfig;
}): Promise<void> {
  await this.invalidateTarotistaCache(payload.tarotistaId);
}
```

**Eventos que disparan invalidación:**

- `tarotista.config.updated` - Cambio en configuración de IA
- `tarotista.meanings.updated` - Cambio en significados personalizados de cartas

---

#### 4. Estrategias Avanzadas: `CacheStrategyService`

##### 4.1. TTL Dinámico Basado en Popularidad

```typescript
// Constantes de TTL (en días)
export const DYNAMIC_TTL = {
  HIGH_POPULARITY: 90,    // hit_count > 10
  MEDIUM_POPULARITY: 30,  // hit_count 3-10
  LOW_POPULARITY: 7,      // hit_count < 3
};

/**
 * Calcula TTL dinámico según popularidad
 */
calculateDynamicTTL(hitCount: number): number {
  if (hitCount >= 10) return 90;  // 3 meses
  if (hitCount >= 3) return 30;   // 1 mes
  return 7;                        // 1 semana
}

/**
 * Actualiza TTLs de todas las entradas según popularidad
 */
async updateDynamicTTLs(): Promise<number> {
  const allCaches = await this.cacheRepository.find();
  let updatedCount = 0;

  for (const cache of allCaches) {
    const newTTLDays = this.calculateDynamicTTL(cache.hit_count);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + newTTLDays);

    // Solo actualizar si TTL cambió significativamente
    await this.cacheRepository.update(
      { id: cache.id },
      { expires_at: newExpiresAt },
    );
    updatedCount++;
  }

  return updatedCount;
}
```

**Ventaja:** Cachés populares viven más tiempo, ahorrando más costos de AI

---

##### 4.2. Fuzzy Matching de Preguntas

```typescript
export const FUZZY_MATCHING = {
  MIN_SIMILARITY: 0.8,  // 80% de similitud
  STOP_WORDS: ['el', 'la', 'de', 'en', 'a', 'para', ...],
};

/**
 * Normaliza pregunta removiendo stop words
 */
private normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => !FUZZY_MATCHING.STOP_WORDS.includes(word))
    .join(' ');
}

/**
 * Calcula similitud entre dos preguntas usando Levenshtein distance
 * Retorna valor entre 0 (diferente) y 1 (idéntico)
 */
calculateQuestionSimilarity(question1: string, question2: string): number {
  const normalized1 = this.normalizeQuestion(question1);
  const normalized2 = this.normalizeQuestion(question2);

  const distance = levenshtein.get(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  return 1 - (distance / maxLength);
}

/**
 * Busca caché con fuzzy matching
 * Si encuentra pregunta similar (>80%) con mismas cartas, retorna ese caché
 */
async findSimilarCachedInterpretation(
  cardCombination: CardCombination[],
  spreadId: number | null,
): Promise<CachedInterpretation | null> {
  // Buscar cachés con misma combinación de cartas
  const potentialMatches = await this.cacheRepository
    .createQueryBuilder('cache')
    .where('spread_id = :spreadId', { spreadId })
    .andWhere('expires_at > :now', { now: new Date() })
    .getMany();

  // Encontrar el match más similar
  // (implementación completa en el servicio)
}
```

**Ventaja:** Preguntas similares reutilizan caché ("¿encontraré amor?" ≈ "¿hallaré el amor?")

---

#### 5. Cache Warming: Pre-generación Inteligente

```typescript
@Injectable()
export class CacheWarmingService {
  /**
   * Pre-genera caché para las N combinaciones más populares
   */
  async warmCache(topN: number = 100): Promise<WarmingResult> {
    const topCombinations = await this.getTopCachedCombinations(topN);

    // Procesar en batches para no saturar AI provider
    const BATCH_SIZE = 5;
    const BATCH_DELAY_MS = 10000; // 10s entre batches

    for (let i = 0; i < topCombinations.length; i += BATCH_SIZE) {
      const batch = topCombinations.slice(i, i + BATCH_SIZE);

      // Procesar batch en paralelo
      await Promise.allSettled(batch.map((combo) => this.warmSingleCombination(combo)));

      // Delay entre batches
      await this.delay(BATCH_DELAY_MS);
    }
  }
}
```

**Uso:** Admin puede pre-generar cachés de combinaciones populares durante horas de bajo tráfico

---

#### 6. Uso Actual en Interpretaciones

##### 6.1. Flujo de Generación con Caché

```typescript
// En InterpretationsService
async generateInterpretation(
  cards: TarotCard[],
  positions: { cardId: number; position: string; isReversed: boolean }[],
  question?: string,
  spread?: TarotSpread,
  category?: string,
  userId?: number,
  readingId?: number,
  tarotistaId?: number,
): Promise<InterpretationResult> {
  // 1. Generar cache key
  const questionHash = this.cacheService.generateQuestionHash(
    category || 'General',
    question || 'Pregunta general',
  );

  const cardCombination = cards.map((card, index) => ({
    card_id: card.id.toString(),
    position: index,
    is_reversed: positions[index]?.isReversed || false,
  }));

  const cacheKey = this.cacheService.generateCacheKey(
    cardCombination,
    spread?.id?.toString() || null,
    questionHash,
  );

  // 2. Buscar en caché
  const cachedResult = await this.cacheService.getFromCache(cacheKey);
  if (cachedResult) {
    this.logger.log('Cache HIT! Returning cached interpretation');

    return {
      interpretation: cachedResult.interpretation_text,
      fromCache: true,
      cacheHitRate: (this.cacheHits / this.totalRequests) * 100,
    };
  }

  // 3. Cache MISS - Generar con AI
  this.logger.log('Cache MISS. Generating new interpretation...');

  const { systemPrompt, userPrompt } = await this.promptBuilder.buildPrompts(
    selectedCards,
    question,
    spreadInfo,
    categoryName,
    tarotistaId,
  );

  const aiResponse = await this.aiProviderService.generateCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    userId,
    readingId,
    aiConfig,
  );

  // 4. Guardar en caché para futuras consultas
  await this.cacheService.saveToCache(
    cacheKey,
    spread?.id || null,
    cardCombination,
    questionHash,
    aiResponse.content,
    tarotistaId,
  );

  return {
    interpretation: aiResponse.content,
    fromCache: false,
  };
}
```

---

##### 6.2. Métricas de Performance

```typescript
// Tracking en memoria
private cacheHits = 0;
private totalRequests = 0;

// Hit rate típico: 40-60% en producción
const cacheHitRate = (this.cacheHits / this.totalRequests) * 100;
```

**Resultados típicos:**

- ✅ **Hit rate:** 40-60% en producción
- ✅ **Ahorro de costos:** ~$0.02-0.05 por lectura cacheada
- ✅ **Latencia:** <50ms (caché) vs ~2-5s (AI)

---

#### 7. Configuración del Módulo

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([CachedInterpretation, CacheMetric]), forwardRef(() => InterpretationsModule)],
  controllers: [CacheAdminController],
  providers: [
    InterpretationCacheService, // ⭐ Servicio principal
    CacheCleanupService, // Limpieza automática
    CacheStrategyService, // Estrategias avanzadas
    CacheAnalyticsService, // Análisis de métricas
    CacheWarmingService, // Pre-generación
  ],
  exports: [
    InterpretationCacheService, // ✅ Exportado para uso en otros módulos
    CacheCleanupService,
    CacheStrategyService,
    CacheAnalyticsService,
    CacheWarmingService,
  ],
})
export class CacheModule {}
```

**Importado por:**

- `InterpretationsModule` - Para cachear lecturas de tarot
- `HoroscopeModule` 🆕 - Para cachear horóscopos diarios (a implementar)

---

### 📋 Plan para Integrar Caché de Horóscopos

#### ✅ Ventajas del sistema de caché existente:

1. **Arquitectura sólida:**
   - 2 niveles (in-memory + DB)
   - TTL dinámico basado en popularidad
   - Limpieza automática con cron jobs

2. **Optimizado para casos de uso similares:**
   - Horóscopos diarios son como interpretaciones
   - 1 generación por día = perfecto para caché de 24h
   - 12 signos = solo 12 cachés por día

3. **Invalidación inteligente:**
   - Events para cambios de configuración
   - Invalidación selectiva por tarotista

---

#### ✅ Estrategia propuesta para horóscopos:

##### Opción 1: Reutilizar `InterpretationCacheService` (Recomendado)

**Ventajas:**

- ✅ No duplicar código
- ✅ Reutilizar limpieza automática
- ✅ Reutilizar métricas y analytics

**Implementación:**

```typescript
// En HoroscopeGenerationService
async generateDailyHoroscope(
  zodiacSign: ZodiacSign,
  date: Date,
): Promise<string> {
  // 1. Generar cache key único
  const cacheKey = this.generateHoroscopeCacheKey(zodiacSign, date);

  // 2. Buscar en caché
  const cached = await this.cacheService.getFromCache(cacheKey);
  if (cached) {
    return cached.interpretation_text;
  }

  // 3. Generar con AI
  const horoscope = await this.aiProvider.generateCompletion(messages);

  // 4. Guardar en caché (TTL: 24 horas)
  await this.cacheService.saveToCache(
    cacheKey,
    null,  // No hay spread para horóscopos
    [{ card_id: zodiacSign, position: 0, is_reversed: false }],
    this.generateQuestionHash('horoscope', date.toISOString()),
    horoscope.content,
  );

  return horoscope.content;
}

private generateHoroscopeCacheKey(sign: ZodiacSign, date: Date): string {
  const dateStr = date.toISOString().split('T')[0];  // YYYY-MM-DD
  return createHash('sha256')
    .update(`horoscope:${sign}:${dateStr}`)
    .digest('hex');
}
```

---

##### Opción 2: Crear `HoroscopeCacheService` dedicado

**Ventajas:**

- ✅ Separación de concerns
- ✅ TTL y estrategias específicas para horóscopos
- ✅ Métricas dedicadas

**Estructura:**

```
src/modules/horoscope/
├── horoscope.module.ts
├── application/
│   ├── services/
│   │   ├── horoscope-generation.service.ts
│   │   └── horoscope-cache.service.ts       # 🆕 Servicio dedicado
│   └── constants/
│       └── horoscope-cache.constants.ts
├── entities/
│   ├── daily-horoscope.entity.ts            # DB persistente
│   └── cached-horoscope.entity.ts           # 🆕 Caché separado
└── infrastructure/
    └── repositories/
```

**Consideración:** Solo si necesitas estrategias muy diferentes a interpretaciones

---

#### ✅ Configuración recomendada para horóscopos:

```typescript
export const HOROSCOPE_CACHE_CONFIG = {
  // TTL fijo de 24 horas (no dinámico como interpretaciones)
  TTL_HOURS: 24,

  // Todos los horóscopos se generan a las 6 AM
  GENERATION_TIME: "06:00:00",

  // No usar fuzzy matching (no hay preguntas)
  USE_FUZZY_MATCHING: false,

  // Pre-generar todos los signos diariamente
  ENABLE_WARMING: true,
  WARMING_TIME: "05:30:00", // 30 min antes de generación
};
```

---

#### ✅ Flujo completo con caché:

```
05:30 AM UTC  → Cache warming inicia (pre-carga IDs de tarotistas activos)
              │
06:00 AM UTC  → Cron job: HoroscopeCronService.generateDailyHoroscopes()
              │
              ├─ Para cada signo (Aries...Piscis):
              │  ├─ generateHoroscopeCacheKey(sign, today)
              │  ├─ Buscar en caché ❌ (primera vez del día)
              │  ├─ Generar con AI ✅
              │  ├─ Guardar en cached_interpretations (TTL: 24h)
              │  └─ Guardar en daily_horoscopes (DB persistente)
              │
              └─ Total: 12 registros en caché + 12 en DB

Usuario consulta → GET /api/horoscope/today?sign=aries
              │
              ├─ generateHoroscopeCacheKey('aries', today)
              ├─ Buscar en caché ✅ HIT!
              └─ Retornar en <50ms (sin llamar AI)

03:00 AM UTC  → Limpieza automática (horóscopos de ayer expirados)
```

---

#### ✅ Ventajas del diseño propuesto:

1. **Costo cero después de generación:**
   - 1 generación/signo/día = 12 AI calls/día
   - Consultas ilimitadas de usuarios = 0 AI calls

2. **Ultra-rápido:**
   - Caché in-memory: <10ms
   - Caché DB: <50ms
   - vs AI: 2-5 segundos

3. **Escalable:**
   - 1M usuarios consultando = 0 costo adicional
   - Presión en DB mínima (índice en cache_key)

4. **Auto-limpieza:**
   - Cron job elimina horóscopos expirados
   - No crece infinitamente

5. **Monitoreable:**
   - Métricas en `cache_metrics`
   - Hit rate esperado: ~99.9% (casi todo es caché)

---

### Pregunta 6: Estructura del Frontend actual

**Objetivo:** Entender la estructura del frontend para planificar los nuevos componentes y mantener consistencia con la arquitectura existente.

#### 1. Estructura de Carpetas de `frontend/src/`

```
frontend/src/
├── app/                           # ⭐ Next.js 14 App Router (solo rutas y layouts)
│   ├── layout.tsx                # Layout raíz con providers y Header/Footer
│   ├── page.tsx                  # Home dual (LandingPage vs UserDashboard)
│   ├── globals.css               # Estilos globales + Tailwind
│   │
│   ├── login/                    # Rutas de autenticación
│   ├── registro/
│   ├── recuperar-password/
│   │
│   ├── carta-del-dia/            # Carta del día (público + autenticado)
│   ├── ritual/                   # Flujo de lectura (autenticado)
│   │   ├── page.tsx              # Selector de categoría
│   │   ├── preguntas/            # Selector de pregunta
│   │   └── tirada/               # Tirada de cartas
│   │       └── lectura/          # Interpretación final
│   │
│   ├── historial/                # Historial de lecturas
│   │   ├── page.tsx              # Lista de lecturas
│   │   └── [id]/                 # Detalle de lectura
│   │
│   ├── compartida/               # Vista pública de lectura compartida
│   ├── perfil/                   # Perfil de usuario
│   ├── explorar/                 # Marketplace de tarotistas
│   ├── sesiones/                 # Sesiones con tarotistas
│   ├── tarotistas/               # Perfil público de tarotista
│   └── admin/                    # Panel de administración
│
├── components/                   # ⭐ Componentes React
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Componentes de layout
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   └── features/                 # ⭐ Componentes de negocio por dominio
│       ├── home/                 # Landing page
│       │   ├── LandingPage.tsx
│       │   ├── HeroSection.tsx
│       │   └── PlanComparison.tsx
│       │
│       ├── dashboard/            # Dashboard de usuario
│       │   └── UserDashboard.tsx
│       │
│       ├── readings/             # Lecturas de tarot
│       │   ├── ReadingCard.tsx
│       │   ├── ReadingDetail.tsx
│       │   ├── ReadingExperience.tsx
│       │   ├── RitualPageContent.tsx
│       │   ├── CategorySelector.tsx
│       │   ├── QuestionSelector.tsx
│       │   ├── SpreadSelector.tsx
│       │   ├── TarotCard.tsx
│       │   └── ...
│       │
│       ├── daily-reading/        # Carta del día
│       │   ├── DailyCardExperience.tsx
│       │   ├── DailyReadingCard.tsx
│       │   └── DailyReadingHistoryList.tsx
│       │
│       ├── auth/                 # Autenticación
│       │   ├── LoginForm.tsx
│       │   └── RegisterForm.tsx
│       │
│       ├── profile/              # Perfil de usuario
│       ├── marketplace/          # Marketplace de tarotistas
│       ├── admin/                # Panel de administración
│       └── ...
│
├── hooks/                        # ⭐ Custom hooks
│   ├── useAuth.ts               # Hook de autenticación
│   ├── useRequireAuth.ts        # HOC para rutas protegidas
│   │
│   ├── api/                     # ⭐ TanStack Query hooks
│   │   ├── useReadings.ts       # Queries y mutations para lecturas
│   │   ├── useDailyReading.ts   # Queries para carta del día
│   │   ├── useUser.ts           # Queries para usuario
│   │   ├── useUserCapabilities.ts # Queries para capacidades (límites)
│   │   ├── useTarotistas.ts     # Queries para tarotistas
│   │   └── ...
│   │
│   ├── queries/                 # Deprecated (migrado a hooks/api/)
│   │
│   └── utils/                   # Utility hooks
│       └── useToast.ts          # Toast notifications
│
├── lib/                         # ⭐ Librerías y utilidades
│   ├── api/                     # ⭐ API client y endpoints
│   │   ├── axios-config.ts      # Axios instance con interceptors
│   │   ├── endpoints.ts         # ⭐ Endpoints centralizados
│   │   ├── readings-api.ts      # API functions para lecturas
│   │   ├── daily-reading-api.ts # API functions para carta del día
│   │   ├── user-api.ts          # API functions para usuario
│   │   └── ...
│   │
│   ├── providers/               # React Context Providers
│   │   ├── react-query-provider.tsx  # TanStack Query provider
│   │   └── auth-provider.tsx         # Auth context provider
│   │
│   ├── utils/                   # Utility functions
│   │   ├── cn.ts               # clsx + tailwind-merge
│   │   ├── date.ts             # Date formatting
│   │   ├── format.ts           # Text formatting
│   │   └── fingerprint.ts      # Anonymous user fingerprint
│   │
│   ├── validations/             # Zod schemas
│   │   ├── auth.schemas.ts
│   │   ├── reading.schemas.ts
│   │   └── ...
│   │
│   ├── constants/               # Constantes
│   │   └── routes.ts           # Rutas de la aplicación
│   │
│   └── metadata/                # SEO metadata
│       └── seo.ts
│
├── stores/                      # ⭐ Zustand stores
│   └── authStore.ts            # Global auth state
│
├── types/                       # ⭐ TypeScript types
│   ├── index.ts                # Exportaciones principales
│   ├── auth.types.ts
│   ├── reading.types.ts
│   ├── user.types.ts
│   ├── api.types.ts
│   └── ...
│
├── styles/                      # Estilos adicionales
│
└── test/                        # Utilities de testing
    └── test-utils.tsx           # Setup de React Testing Library
```

---

#### 2. Archivo de Rutas: `app/` (App Router)

##### 2.1. Layout Raíz (`app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import { ReactQueryProvider, AuthProvider } from "@/lib/providers";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { defaultMetadata } from "@/lib/metadata/seo";
import "./globals.css";

/**
 * Cormorant Garamond - Serif font for headings
 * Design Token: font-serif
 */
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Lato - Sans-serif font for body text
 * Design Token: font-sans
 */
const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${cormorantGaramond.variable} ${lato.variable} bg-bg-main min-h-screen antialiased`}>
        <ReactQueryProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

**Características:**

- ✅ **Fuentes personalizadas:** Cormorant Garamond (serif) + Lato (sans)
- ✅ **Providers anidados:** ReactQuery → Auth → Layout
- ✅ **Toaster global:** Para notificaciones
- ✅ **Header/Footer persistentes:** En todas las páginas

---

##### 2.2. Home Page Dual (`app/page.tsx`)

```tsx
"use client";

import { LandingPage } from "@/components/features/home";
import { UserDashboard } from "@/components/features/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";

/**
 * Home Page with Dual Logic
 *
 * Behavior:
 * - Shows loading skeleton while checking auth (prevents FOUC)
 * - Shows LandingPage for unauthenticated users
 * - Shows UserDashboard for authenticated users (all plans)
 */
export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading skeleton while validating auth (prevent FOUC)
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Show LandingPage for unauthenticated users
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  // Show UserDashboard for authenticated users
  return <UserDashboard />;
}
```

**Patrón dual:**

- 🔓 **No autenticado:** Landing page con hero, beneficios, CTA
- 🔒 **Autenticado:** Dashboard con acciones rápidas, estadísticas

---

##### 2.3. Página Protegida (`app/ritual/page.tsx`)

```tsx
"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { RitualPageContent } from "@/components/features/readings/RitualPageContent";

/**
 * Ritual Page - Category Selector
 *
 * Protected page where users select a category before proceeding to questions.
 *
 * AUTHENTICATION REQUIRED:
 * - Redirects to /registro with message=register-for-readings if not authenticated
 */
export default function RitualPage() {
  useRequireAuth({
    redirectTo: "/registro",
    redirectQuery: { message: "register-for-readings" },
  });

  return <RitualPageContent />;
}
```

**Características:**

- ✅ **`useRequireAuth`:** HOC para proteger rutas
- ✅ **Redirect con query params:** Para mostrar mensajes contextuales
- ✅ **Separación:** Page solo protección, lógica en component

---

#### 3. Ejemplo de Componente Feature: `ReadingCard.tsx`

````tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { Eye, Layers } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Reading, ReadingCard as ReadingCardType } from "@/types/reading.types";

/**
 * ReadingCard Component Props
 */
export interface ReadingCardProps {
  /** Reading data */
  reading: Reading;
  /** Optional cards array for thumbnail display */
  cards?: ReadingCardType[];
  /** Callback when view button is clicked */
  onView: (id: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ReadingCard Component
 *
 * Displays a compact reading summary card for the history view.
 * Redesigned following UI/UX best practices for wellness apps:
 * - Proximity principle: related content grouped together
 * - Minimalist aesthetic with soft shadows
 * - Compact layout optimized for scanning
 *
 * Layout (single-row compact):
 * - Thumbnail (40x56px): Card image or placeholder icon
 * - Content: Question (1-line) + meta row (date + spread badge)
 * - Actions: View and delete buttons (32x32px)
 *
 * Features:
 * - Compact card height (~62px) for efficient list viewing
 * - Question truncated to 1 line for consistency
 * - Date and spread badge grouped on same line
 * - Smaller action buttons for cleaner appearance
 * - Subtle hover shadow (no scale) for peaceful feel
 *
 * @example
 * ```tsx
 * <ReadingCard
 *   reading={reading}
 *   onView={(id) => router.push(`/lecturas/${id}`)}
 * />
 * ```
 */
export function ReadingCard({ reading, cards, onView, className }: ReadingCardProps) {
  // Prefer cardPreviews from reading, fallback to cards prop
  const cardPreview = reading.cardPreviews?.[0] || cards?.[0];
  const hasCardThumbnail = cardPreview?.imageUrl;

  const formattedDate = React.useMemo(() => formatDateShort(reading.createdAt), [reading.createdAt]);

  const handleViewClick = React.useCallback(() => {
    onView(reading.id);
  }, [onView, reading.id]);

  return (
    <Card
      data-testid="reading-card"
      className={cn(
        "flex flex-row items-center gap-3",
        "bg-card shadow-sm p-3",
        "transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {/* Thumbnail - Compact */}
      <div className="bg-muted flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {hasCardThumbnail && cardPreview?.imageUrl ? (
          <Image
            data-testid="card-thumbnail"
            src={cardPreview.imageUrl}
            alt={`Carta ${cardPreview.name}`}
            width={40}
            height={56}
            className="h-full w-full object-cover"
          />
        ) : (
          <Layers data-testid="card-placeholder-icon" className="text-muted-foreground h-5 w-5" />
        )}
      </div>

      {/* Content - Question/Cards + Meta grouped together */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {reading.question ? (
          <p className="text-text-primary line-clamp-1 text-sm font-medium">{reading.question}</p>
        ) : (
          <p className="text-text-primary line-clamp-1 text-sm font-medium">
            {reading.cardPreviews?.map((c) => c.name).join(", ") || "Lectura de tarot"}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">{formattedDate}</span>
          {reading.spreadName && (
            <Badge data-testid="spread-badge" variant="secondary" className="px-1.5 py-0 text-xs">
              {reading.spreadName}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions - View only */}
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleViewClick} aria-label="Ver lectura">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
````

**Patrón de componente feature:**

- ✅ **`'use client'`** en componentes interactivos
- ✅ **Props interface documentada** con JSDoc
- ✅ **Componente documentado** con propósito y ejemplos
- ✅ **Imports organizados:** React → Third-party → Internal → Types
- ✅ **Composición:** Usa componentes de `ui/` (Card, Badge, Button)
- ✅ **Utilities:** `cn()` para clases condicionales, `formatDateShort()` para fechas
- ✅ **Callbacks memoizados:** `useCallback` para optimización
- ✅ **Data-testid:** Para testing

---

#### 4. Configuración de Stores en Zustand

##### 4.1. Auth Store (`stores/authStore.ts`)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "@/hooks/utils/useToast";
import { apiClient } from "@/lib/api/axios-config";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getGlobalQueryClient } from "@/lib/providers/react-query-provider";
import type { AuthUser, AuthStore, LoginResponse, RegisterCredentials, RegisterResponse } from "@/types";

/**
 * Zustand store for authentication state
 * Manages user session, authentication status, and auth actions
 *
 * Features:
 * - Login/logout with API integration
 * - Token management in localStorage
 * - Session verification with checkAuth
 * - Persistence of user and isAuthenticated state
 * - Proper hydration handling to prevent stale auth state
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      // Hydration setter
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // Actions
      setUser: (user: AuthUser | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      login: async (email: string, password: string) => {
        try {
          const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });

          const { access_token, refresh_token, user } = response.data;

          // Store tokens in localStorage (SSR safety check)
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
          }

          // Update store state
          get().setUser(user);

          toast.success("Bienvenido");
        } catch (error) {
          // Extract error details for specific messaging
          const axiosError = error as {
            response?: { status?: number; data?: { message?: string } };
          };
          const isUnauthorized = axiosError.response?.status === 401;

          // Only show toast for non-401 errors
          if (!isUnauthorized) {
            toast.error("Error al iniciar sesión");
          }

          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, credentials);
          return response.data;
        } catch (error) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          const message = axiosError.response?.data?.message || "Error al crear la cuenta";
          toast.error(message);
          throw new Error(message);
        }
      },

      logout: () => {
        // Clear tokens from localStorage (SSR safety check)
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }

        // Clear ALL React Query cache to prevent stale data contamination
        // between different user sessions (especially PREMIUM → FREE transitions)
        if (typeof window !== "undefined") {
          const queryClient = getGlobalQueryClient();
          queryClient.clear();
        }

        // Clear user state
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        try {
          // SSR safety check
          const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

          if (!token) {
            set({ isLoading: false });
            return;
          }

          const response = await apiClient.get<AuthUser>("/users/profile");
          get().setUser(response.data);
        } catch {
          // Clear invalid tokens (SSR safety check)
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          get().setUser(null);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when hydration is complete
        state?.setHasHydrated(true);
      },
    }
  )
);
```

**Características:**

- ✅ **Persist middleware:** Guarda user + isAuthenticated en localStorage
- ✅ **SSR safety checks:** `typeof window !== 'undefined'`
- ✅ **Token management:** JWT en localStorage
- ✅ **Hydration tracking:** `_hasHydrated` para prevenir FOUC
- ✅ **Query cache invalidation:** Limpia cache en logout
- ✅ **Error handling:** Toast messages contextuales

---

##### 4.2. Uso del Store en Componentes

```tsx
"use client";

import { useAuthStore } from "@/stores/authStore";

export function MyComponent() {
  // Extraer solo lo necesario (evita re-renders innecesarios)
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  if (isLoading) return <Skeleton />;

  if (!isAuthenticated) {
    return <LoginButton onClick={() => login(email, password)} />;
  }

  return (
    <div>
      <p>Bienvenido, {user?.name}</p>
      <LogoutButton onClick={logout} />
    </div>
  );
}
```

---

#### 5. API Client y Endpoints

##### 5.1. Endpoints Centralizados (`lib/api/endpoints.ts`)

```typescript
/**
 * API Endpoints
 *
 * Centralización de todas las rutas de API del backend
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },

  // Categories
  CATEGORIES: {
    BASE: "/categories",
  },

  // Spreads (Tiradas)
  SPREADS: {
    BASE: "/spreads",
    BY_ID: (id: number) => `/spreads/${id}`,
    MY_AVAILABLE: "/spreads/my-available",
  },

  // Readings
  READINGS: {
    BASE: "/readings",
    BY_ID: (id: number) => `/readings/${id}`,
    TRASH: "/readings/trash",
    RESTORE: (id: number) => `/readings/${id}/restore`,
    REGENERATE: (id: number) => `/readings/${id}/regenerate`,
    SHARE: (id: number) => `/readings/${id}/share`,
  },

  // Daily Reading (Carta del Día)
  DAILY_READING: {
    BASE: "/daily-reading",
    TODAY: "/daily-reading/today",
    PUBLIC: "/public/daily-reading", // POST - Anonymous users with fingerprint
    HISTORY: "/daily-reading/history",
    REGENERATE: "/daily-reading/regenerate",
  },

  // Users
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    PASSWORD: "/users/me/password",
    CAPABILITIES: "/users/capabilities",
  },

  // Admin
  ADMIN: {
    DASHBOARD_STATS: "/admin/dashboard/stats",
    USERS: "/admin/users",
    USER_BY_ID: (id: number) => `/admin/users/${id}`,
    // ...más endpoints de admin
  },

  // 🆕 HOROSCOPE (a implementar)
  HOROSCOPE: {
    TODAY: (sign: string) => `/horoscope/today?sign=${sign}`,
    BY_DATE: (sign: string, date: string) => `/horoscope/${date}?sign=${sign}`,
    HISTORY: "/horoscope/history",
  },
} as const;
```

**Ventajas:**

- ✅ **Type-safe:** `as const` + TypeScript
- ✅ **Centralizado:** Un solo lugar para cambiar URLs
- ✅ **Funciones para IDs:** Evita concatenación de strings
- ✅ **Organizado por dominio:** AUTH, READINGS, DAILY_READING, etc.

---

##### 5.2. TanStack Query Hooks (`hooks/api/useReadings.ts`)

```typescript
/**
 * TanStack Query hooks for readings API
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/utils/useToast";
import { getMyReadings, getReadingById, createReading, deleteReading } from "@/lib/api/readings-api";

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const readingQueryKeys = {
  all: ["readings"] as const,
  lists: () => [...readingQueryKeys.all, "list"] as const,
  list: (page: number, limit: number) => [...readingQueryKeys.lists(), { page, limit }] as const,
  details: () => [...readingQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...readingQueryKeys.details(), id] as const,
} as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch paginated readings
 */
export function useMyReadings(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: readingQueryKeys.list(page, limit),
    queryFn: () => getMyReadings(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single reading by ID
 */
export function useReadingById(id: number) {
  return useQuery({
    queryKey: readingQueryKeys.detail(id),
    queryFn: () => getReadingById(id),
    enabled: id > 0, // Only fetch if valid ID
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a new reading
 */
export function useCreateReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReading,
    onSuccess: () => {
      // Invalidate readings list to refetch
      queryClient.invalidateQueries({ queryKey: readingQueryKeys.lists() });
      toast.success("Lectura creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear lectura");
    },
  });
}
```

**Patrón:**

1. **Query Keys:** Constantes tipadas para cache keys
2. **Queries:** `useQuery` para fetch de datos
3. **Mutations:** `useMutation` para crear/actualizar/eliminar
4. **Cache Invalidation:** `queryClient.invalidateQueries()` después de mutaciones
5. **Toast Notifications:** Feedback al usuario

---

#### 6. Convenciones y Buenas Prácticas

##### 6.1. Nomenclatura de Archivos

```
✅ CORRECTO:
- ReadingCard.tsx         (PascalCase para componentes)
- useReadings.ts          (camelCase con prefijo 'use' para hooks)
- authStore.ts            (camelCase con sufijo 'Store' para stores)
- reading.types.ts        (kebab-case para types)
- readings-api.ts         (kebab-case para API functions)
- ReadingCard.test.tsx    (mismo nombre + .test para tests)

❌ INCORRECTO:
- reading-card.tsx        (kebab-case para componentes)
- UseReadings.ts          (PascalCase para hooks)
- auth_store.ts           (snake_case)
```

---

##### 6.2. Estructura de Imports

```tsx
// 1. React y Next.js
import * as React from "react";
import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { useQuery, useMutation } from "@tanstack/react-query";
import { Eye, Trash2 } from "lucide-react";

// 3. Internal - Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Internal - Hooks
import { useAuth } from "@/hooks/useAuth";
import { useReadings } from "@/hooks/api/useReadings";

// 5. Internal - Utilities
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";

// 6. Internal - Types
import type { Reading } from "@/types/reading.types";
```

---

##### 6.3. TypeScript Path Alias

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
    },
  },
}
```

**Uso:**

```tsx
// ✅ Con alias
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// ❌ Sin alias (evitar)
import { Button } from "../../../components/ui/button";
```

---

#### 7. Flujo de Datos en Frontend

```
Usuario interactúa
      ↓
Componente UI (features/)
      ↓
Custom Hook (hooks/api/)
      ↓
TanStack Query (useQuery/useMutation)
      ↓
API Function (lib/api/*-api.ts)
      ↓
Axios Client (lib/api/axios-config.ts)
      ↓
Backend API (con JWT en headers)
      ↓
Response
      ↓
TanStack Query Cache
      ↓
Componente UI actualiza (re-render)
      ↓
Toast Notification (éxito/error)
```

---

### 📋 Plan para Integrar Horóscopo en Frontend

#### ✅ Pasos para agregar nueva feature:

##### 1. **Crear tipos TypeScript**

```typescript
// types/horoscope.types.ts
export interface DailyHoroscope {
  id: number;
  zodiacSign: ZodiacSign;
  date: string;
  content: string;
  summary: string;
  luckyNumber?: number;
  luckyColor?: string;
  createdAt: string;
}

export enum ZodiacSign {
  ARIES = "aries",
  TAURUS = "taurus",
  // ...12 signos
}

export interface HoroscopeResponse {
  horoscope: DailyHoroscope;
  fromCache: boolean;
}
```

---

##### 2. **Agregar endpoints en `lib/api/endpoints.ts`**

```typescript
export const API_ENDPOINTS = {
  // ...existentes

  HOROSCOPE: {
    TODAY: (sign: string) => `/horoscope/today?sign=${sign}`,
    BY_DATE: (sign: string, date: string) => `/horoscope/${date}?sign=${sign}`,
    HISTORY: "/horoscope/history",
  },
} as const;
```

---

##### 3. **Crear API functions en `lib/api/horoscope-api.ts`**

```typescript
import { apiClient } from "./axios-config";
import { API_ENDPOINTS } from "./endpoints";
import type { DailyHoroscope, HoroscopeResponse, ZodiacSign } from "@/types/horoscope.types";

export async function getTodayHoroscope(sign: ZodiacSign): Promise<HoroscopeResponse> {
  const response = await apiClient.get<HoroscopeResponse>(API_ENDPOINTS.HOROSCOPE.TODAY(sign));
  return response.data;
}

export async function getHoroscopeByDate(sign: ZodiacSign, date: string): Promise<HoroscopeResponse> {
  const response = await apiClient.get<HoroscopeResponse>(API_ENDPOINTS.HOROSCOPE.BY_DATE(sign, date));
  return response.data;
}
```

---

##### 4. **Crear TanStack Query hook en `hooks/api/useHoroscope.ts`**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { getTodayHoroscope, getHoroscopeByDate } from "@/lib/api/horoscope-api";
import type { ZodiacSign } from "@/types/horoscope.types";

export const horoscopeQueryKeys = {
  all: ["horoscope"] as const,
  today: (sign: ZodiacSign) => [...horoscopeQueryKeys.all, "today", sign] as const,
  byDate: (sign: ZodiacSign, date: string) => [...horoscopeQueryKeys.all, date, sign] as const,
} as const;

export function useTodayHoroscope(sign: ZodiacSign) {
  return useQuery({
    queryKey: horoscopeQueryKeys.today(sign),
    queryFn: () => getTodayHoroscope(sign),
    staleTime: 1000 * 60 * 60, // 1 hora (horoscope doesn't change during day)
    enabled: !!sign, // Only fetch if sign is provided
  });
}
```

---

##### 5. **Crear componente feature en `components/features/horoscope/`**

```tsx
// components/features/horoscope/HoroscopeCard.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodayHoroscope } from "@/hooks/api/useHoroscope";
import { formatDate } from "@/lib/utils/date";
import type { ZodiacSign } from "@/types/horoscope.types";

interface HoroscopeCardProps {
  sign: ZodiacSign;
}

export function HoroscopeCard({ sign }: HoroscopeCardProps) {
  const { data, isLoading, error } = useTodayHoroscope(sign);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error) return <ErrorMessage />;
  if (!data) return null;

  const { horoscope, fromCache } = data;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif">{sign}</h2>
        <Badge variant="secondary">{formatDate(horoscope.date)}</Badge>
      </div>

      <p className="text-lg mb-4">{horoscope.summary}</p>
      <p className="text-muted-foreground">{horoscope.content}</p>

      {horoscope.luckyNumber && (
        <div className="mt-4">
          <p className="text-sm">Número de la suerte: {horoscope.luckyNumber}</p>
        </div>
      )}
    </Card>
  );
}
```

---

##### 6. **Crear página en `app/horoscopo/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { HoroscopeCard } from "@/components/features/horoscope/HoroscopeCard";
import { ZodiacSignSelector } from "@/components/features/horoscope/ZodiacSignSelector";
import type { ZodiacSign } from "@/types/horoscope.types";

export default function HoroscopoPage() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-serif mb-8">Tu Horóscopo Diario</h1>

      <ZodiacSignSelector value={selectedSign} onChange={setSelectedSign} />

      {selectedSign && (
        <div className="mt-8">
          <HoroscopeCard sign={selectedSign} />
        </div>
      )}
    </div>
  );
}
```

---

##### 7. **Agregar ruta en `lib/constants/routes.ts`**

```typescript
export const ROUTES = {
  // ...existentes

  HOROSCOPO: "/horoscopo",
  HOROSCOPO_SIGN: (sign: string) => `/horoscopo/${sign}`,
} as const;
```

---

#### ✅ Resumen del flujo:

```
1. User selecciona signo zodiacal
     ↓
2. ZodiacSignSelector llama onChange(sign)
     ↓
3. HoroscopeCard renderiza con el sign
     ↓
4. useTodayHoroscope(sign) hace query
     ↓
5. getTodayHoroscope(sign) llama API
     ↓
6. Backend busca en caché → HIT (99.9%)
     ↓
7. Response <50ms con horóscopo del día
     ↓
8. TanStack Query cachea 1 hora
     ↓
9. HoroscopeCard muestra contenido
```

---
