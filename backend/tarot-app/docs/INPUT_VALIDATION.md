# Input Validation, Sanitization, and Output Security Documentation

## Overview

This document describes the comprehensive input validation, sanitization, and output security strategy implemented across the application to prevent security vulnerabilities such as SQL Injection, XSS (Cross-Site Scripting), and other injection attacks.

**Defense-in-depth strategy:**

- **Input Sanitization** (TASK-048): Clean data entering the system
- **Output Sanitization** (TASK-048-a): Clean data leaving the system (especially AI-generated content)
- **Security Headers** (TASK-048-a): HTTP headers to protect client browsers

## Global Configuration

### ValidationPipe Configuration

The application uses NestJS's `ValidationPipe` with the following security-focused settings in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove properties not in DTO
    forbidNonWhitelisted: true, // Throw error if extra properties exist
    transform: true, // Auto-transform payloads to DTO instances
  }),
);
```

**Security Benefits:**

- **whitelist**: Prevents injection of unexpected properties
- **forbidNonWhitelisted**: Explicit errors for malicious attempts
- **transform**: Ensures type safety and automatic type conversion

## Custom Validators

### 1. IsSecureUrl

**Location:** `src/common/validators/is-secure-url.validator.ts`

**Purpose:** Validates URLs to prevent malicious protocols like `javascript:`, `data:`, etc.

**Usage:**

```typescript
@IsSecureUrl(true, { message: 'URL must be secure (HTTPS preferred)' })
imageUrl: string;
```

**Features:**

- Only allows HTTP and HTTPS protocols
- Blocks dangerous protocols: `javascript:`, `data:`, `vbscript:`, `file:`, `about:`
- Optionally enforces HTTPS

### 2. MaxJsonDepth

**Location:** `src/common/validators/max-json-depth.validator.ts`

**Purpose:** Prevents DoS attacks with deeply nested JSON objects.

**Usage:**

```typescript
@MaxJsonDepth(5, { message: 'Structure cannot exceed 5 nesting levels' })
positions: SpreadPositionDto[];
```

**Features:**

- Recursively calculates nesting depth
- Default maximum depth: 10 levels
- Configurable per field

## Custom Decorators

### Sanitization Decorators

**Location:** `src/common/decorators/sanitize.decorator.ts`

#### SanitizeHtml()

Removes malicious HTML and JavaScript from string inputs.

**What it removes:**

- `<script>` tags and content
- `<style>` tags and content
- Event handlers (onclick, onerror, onload, etc.)
- `javascript:` and `data:` protocols
- All HTML tags (unless whitelist provided)

**Usage:**

```typescript
@SanitizeHtml()
@Trim()
name: string;
```

#### SanitizeEmail()

Sanitizes email addresses to prevent injection.

**Features:**

- Converts to lowercase
- Removes HTML tags
- Removes whitespace
- Trims extra spaces

**Usage:**

```typescript
@SanitizeEmail()
email: string;
```

#### Trim()

Removes whitespace from both ends of strings.

```typescript
@Trim()
password: string;
```

#### NormalizeWhitespace()

Removes extra whitespace (multiple spaces, tabs, newlines) and converts to single spaces.

```typescript
@NormalizeWhitespace()
description: string;
```

#### ToLowerCase()

Converts strings to lowercase.

```typescript
@ToLowerCase()
slug: string;
```

## Validation Rules by Entity

### User Entity

| Field    | Validations                    | Sanitization             |
| -------- | ------------------------------ | ------------------------ |
| email    | @IsEmail(), @IsNotEmpty()      | @SanitizeEmail()         |
| name     | @IsString(), @MaxLength(255)   | @SanitizeHtml(), @Trim() |
| password | @MinLength(6), @MaxLength(128) | @Trim()                  |

### Tarot Card Entity

| Field           | Validations                   | Sanitization             |
| --------------- | ----------------------------- | ------------------------ |
| name            | @IsString(), @MaxLength(100)  | @SanitizeHtml(), @Trim() |
| imageUrl        | @IsUrl(), @IsSecureUrl()      | @Trim()                  |
| meaningUpright  | @IsString(), @MaxLength(1000) | @SanitizeHtml(), @Trim() |
| meaningReversed | @IsString(), @MaxLength(1000) | @SanitizeHtml(), @Trim() |
| description     | @IsString(), @MaxLength(2000) | @SanitizeHtml(), @Trim() |
| keywords        | @IsString(), @MaxLength(500)  | @SanitizeHtml(), @Trim() |

### Reading Entity

| Field          | Validations                      | Sanitization             |
| -------------- | -------------------------------- | ------------------------ |
| customQuestion | @MinLength(10), @MaxLength(500)  | @SanitizeHtml(), @Trim() |
| cardIds        | @IsArray(), @IsInt({each: true}) | -                        |

### Spread Entity

| Field       | Validations                         | Sanitization             |
| ----------- | ----------------------------------- | ------------------------ |
| name        | @IsString(), @MaxLength(100)        | @SanitizeHtml(), @Trim() |
| description | @IsString(), @MaxLength(1000)       | @SanitizeHtml(), @Trim() |
| positions   | @ValidateNested(), @MaxJsonDepth(5) | Nested sanitization      |
| imageUrl    | @IsUrl(), @IsSecureUrl()            | @Trim()                  |

### Email Entity

| Field    | Validations                  | Sanitization             |
| -------- | ---------------------------- | ------------------------ |
| to       | @IsEmail()                   | @SanitizeEmail()         |
| subject  | @IsString(), @MaxLength(200) | @SanitizeHtml(), @Trim() |
| template | @IsString(), @MaxLength(50)  | @Trim()                  |

## Security Testing

### E2E Security Tests

**Location:** `test/input-validation-security.e2e-spec.ts`

**Test Coverage:**

1. **SQL Injection Protection**

   - Malicious SQL in email fields
   - SQL injection in search parameters

2. **XSS Protection**

   - Script tags in name fields
   - Event handlers in custom questions
   - Image tags with onerror handlers

3. **Input Validation**

   - String length limits
   - Email format validation
   - URL format validation
   - Type coercion and transformation

4. **Whitelist Protection**

   - Non-whitelisted properties are stripped
   - Explicit errors for forbidden properties

5. **JSON Depth Protection**

   - Deeply nested objects are rejected
   - Prevents DoS attacks

6. **Password Security**
   - Minimum length requirements
   - Maximum length limits

## Best Practices

### When Creating New DTOs

1. **Always add validations:**

   ```typescript
   @IsString()
   @IsNotEmpty()
   @MaxLength(X)
   ```

2. **Sanitize text inputs:**

   ```typescript
   @SanitizeHtml()
   @Trim()
   ```

3. **Sanitize email inputs:**

   ```typescript
   @SanitizeEmail()
   ```

4. **Validate URLs:**

   ```typescript
   @IsUrl()
   @IsSecureUrl()
   ```

5. **Validate nested objects:**
   ```typescript
   @ValidateNested()
   @MaxJsonDepth(5)
   ```

### Common Patterns

#### Text Input (User-facing)

```typescript
@IsString()
@IsNotEmpty()
@MaxLength(500)
@SanitizeHtml()
@Trim()
description: string;
```

#### Email Input

```typescript
@IsEmail()
@IsNotEmpty()
@SanitizeEmail()
email: string;
```

#### Password Input

```typescript
@IsString()
@MinLength(6)
@MaxLength(128)
@Trim()
password: string;
```

#### URL Input

```typescript
@IsUrl()
@IsSecureUrl(true)
@IsOptional()
@Trim()
imageUrl?: string;
```

#### Numeric Input

```typescript
@IsInt()
@Min(0)
@Max(100)
value: number;
```

## Attack Prevention Summary

| Attack Type        | Prevention Method                                |
| ------------------ | ------------------------------------------------ |
| SQL Injection      | TypeORM parameterized queries + input validation |
| XSS                | SanitizeHtml decorator removes scripts           |
| Command Injection  | Input validation and sanitization                |
| Path Traversal     | URL validation, no file path inputs              |
| DoS (Deep Objects) | MaxJsonDepth validator                           |
| Mass Assignment    | whitelist: true, forbidNonWhitelisted: true      |
| Email Injection    | SanitizeEmail decorator                          |

## Error Messages

All validation errors return structured responses:

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "name must not exceed 255 characters",
    "password must be at least 6 characters long"
  ],
  "error": "Bad Request"
}
```

## Maintenance

### Adding New Validators

1. Create validator in `src/common/validators/`
2. Follow NestJS validator pattern
3. Add comprehensive tests
4. Document usage in this file

### Adding New Sanitizers

1. Create decorator in `src/common/decorators/`
2. Use `@Transform()` from class-transformer
3. Add comprehensive tests
4. Document usage in this file

## Output Sanitization (TASK-048-a)

### Overview

While input sanitization prevents malicious data from entering the system, output sanitization ensures that any data leaving the system (especially AI-generated content) is safe for display in client browsers.

### OutputSanitizerService

**Location:** `src/common/services/output-sanitizer.service.ts`

**Purpose:** Sanitize AI-generated responses before sending them to clients to prevent XSS attacks.

**Features:**

- Removes all HTML tags and scripts
- Escapes HTML entities (`<`, `>`, `&`, `"`, `'`)
- Removes dangerous protocols (javascript:, data:, vbscript:)
- Logs potential XSS attempts for security monitoring
- Handles edge cases (null, undefined, empty strings)
- Performant with large texts (AI interpretations)

**Usage:**

```typescript
@Injectable()
export class InterpretationsService {
  constructor(private readonly outputSanitizer: OutputSanitizerService) {}

  async generateInterpretation(...): Promise<string> {
    const rawInterpretation = await this.aiProvider.generate(...);

    // Sanitize AI output before storing/returning
    const sanitizedInterpretation =
      this.outputSanitizer.sanitizeAiResponse(rawInterpretation);

    return sanitizedInterpretation;
  }
}
```

**Why Output Sanitization is Critical:**

1. **AI Model Manipulation:** If an attacker manipulates prompts, the AI might generate malicious content
2. **Third-Party Data:** AI models are trained on internet data that may contain XSS payloads
3. **Defense in Depth:** Even if input sanitization fails, output sanitization is a last line of defense
4. **Cached Content:** Sanitized outputs are cached, preventing repeated exposure to vulnerabilities

### Where Output Sanitization is Applied

1. **AI-Generated Interpretations:**
   - `InterpretationsService.generateInterpretation()`
   - `InterpretationsService` fallback responses
2. **Future:** Any service that generates or fetches content from external sources

### Output Sanitization vs Input Sanitization

| Aspect              | Input Sanitization                   | Output Sanitization                      |
| ------------------- | ------------------------------------ | ---------------------------------------- |
| **When**            | Data enters system (DTOs)            | Data leaves system (responses)           |
| **Purpose**         | Prevent DB pollution, code injection | Prevent XSS in browser                   |
| **Target**          | User inputs                          | AI outputs, external data                |
| **Implementation**  | Decorators on DTOs                   | Service method calls                     |
| **Example**         | `@SanitizeHtml() name: string`       | `sanitizer.sanitizeAiResponse(response)` |
| **Fallback if nil** | Rejects request                      | Returns safe string                      |

## Testing

Run security tests:

```bash
# Input validation tests
npm run test:e2e -- input-validation-security.e2e-spec.ts

# Output sanitization tests (TASK-048-a)
npm run test:e2e -- output-sanitization.e2e-spec.ts

# Unit tests for output sanitizer
npm test -- output-sanitizer.service.spec.ts
```

## References

- [NestJS Validation Documentation](https://docs.nestjs.com/techniques/validation)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
