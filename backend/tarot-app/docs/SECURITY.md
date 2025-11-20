# 🔒 Security Documentation - TarotFlavia

## Overview

This document outlines the comprehensive security strategy implemented in the TarotFlavia application to protect against common web vulnerabilities and ensure data confidentiality, integrity, and availability.

**Security Philosophy:** Defense in depth with multiple layers of protection, secure by default, and continuous security monitoring.

## Security Architecture

### Defense in Depth

The application implements multiple layers of security:

1. **Network Security:** HTTPS, CORS, Security Headers
2. **Authentication:** JWT tokens with secure algorithms
3. **Authorization:** Role-based access control (RBAC)
4. **Input Security:** Validation and sanitization
5. **Output Security:** Sanitization and escaping
6. **Data Security:** Encrypted passwords, secure sessions

## Security Headers (TASK-048-a)

### Helmet Configuration

**Location:** `src/main.ts`

The application uses [Helmet](https://helmetjs.github.io/) to set secure HTTP headers automatically.

**Headers Configured:**

#### 1. Content-Security-Policy (CSP)

```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Swagger UI requires inline styles
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}
```

**Purpose:** Prevents XSS attacks by controlling what resources the browser can load.

**Key Points:**

- Only scripts from the same origin are allowed
- External images are allowed (for card images)
- No frames or embeds allowed (prevents clickjacking)

#### 2. X-Content-Type-Options: nosniff

**Purpose:** Prevents MIME type sniffing, forcing browsers to respect declared content types.

**Protection:** Prevents browsers from executing malicious files disguised as benign types.

#### 3. X-Frame-Options: DENY

**Purpose:** Prevents the application from being embedded in frames/iframes.

**Protection:** Prevents clickjacking attacks.

#### 4. Strict-Transport-Security (HSTS)

```typescript
hsts: {
  maxAge: 31536000,        // 1 year
  includeSubDomains: true,
  preload: true,
}
```

**Purpose:** Forces browsers to only access the application over HTTPS.

**Protection:** Prevents man-in-the-middle attacks and SSL stripping.

#### 5. X-XSS-Protection: 0

**Note:** Modern browsers have deprecated this header in favor of CSP. Set to `0` to disable the legacy filter which had vulnerabilities.

### CORS Configuration

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  exposedHeaders: [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
  ],
});
```

**Production Setup:**

```bash
# .env
CORS_ORIGIN=https://your-frontend-domain.com
```

## Input Security

See [INPUT_VALIDATION.md](./INPUT_VALIDATION.md) for comprehensive input security documentation.

**Summary:**

- Global ValidationPipe with whitelist and forbidNonWhitelisted
- Custom validators: @IsSecureUrl, @MaxJsonDepth
- Custom sanitizers: @SanitizeHtml, @SanitizeEmail
- SQL Injection protection via TypeORM parameterized queries
- XSS protection via input sanitization

## Output Security (TASK-048-a)

### OutputSanitizerService

**Purpose:** Sanitize all AI-generated content before sending to clients.

**Location:** `src/common/services/output-sanitizer.service.ts`

**What it removes:**

- `<script>` tags and content
- `<iframe>`, `<object>`, `<embed>` tags
- Event handlers (onclick, onerror, onload, etc.)
- Dangerous protocols (javascript:, data:, vbscript:)
- All HTML tags (for plain text responses)

**Where it's used:**

- `InterpretationsService.generateInterpretation()`
- All AI provider responses
- Fallback interpretations

**Security Rationale:**

1. **AI Model Manipulation:** Attackers may try to inject malicious prompts
2. **Third-Party Content:** AI models trained on internet data may contain XSS
3. **Defense in Depth:** Last line of defense if input sanitization fails
4. **Cached Content:** Sanitized outputs prevent repeated vulnerabilities

## Authentication & Authorization

### JWT (JSON Web Tokens)

**Implementation:**

- HS256 algorithm (HMAC with SHA-256)
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry
- Secure secret keys (never committed to git)

**Best Practices:**

```bash
# Generate secure JWT secrets
openssl rand -base64 64
```

### Role-Based Access Control (RBAC)

**Roles:**

- `user`: Standard user (default)
- `premium`: Paid subscription user
- `admin`: Administrator

**Guards:**

- `JwtAuthGuard`: Verifies JWT token
- `RolesGuard`: Checks user roles
- `CheckUsageLimitGuard`: Enforces rate limits

**Usage:**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete('users/:id')
async deleteUser(@Param('id') id: number) {
  // Only admins can execute
}
```

## Password Security

### Hashing

- **Algorithm:** bcrypt with 10 salt rounds
- **Storage:** Only hashed passwords are stored
- **Verification:** Constant-time comparison

**Implementation:**

```typescript
import * as bcrypt from 'bcrypt';

// Hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Password Requirements

- Minimum length: 6 characters (configurable)
- Maximum length: 128 characters
- No dictionary validation (implemented in client-side)

## Rate Limiting & DDoS Protection

### Usage Limits

**Location:** `src/modules/usage-limits/`

**Limits by Plan:**

| Plan    | Readings/Day | Oracle Queries/Day |
| ------- | ------------ | ------------------ |
| Free    | 3            | 3                  |
| Premium | Unlimited    | Unlimited          |

### IP-Based Rate Limiting (Future)

**Planned:** Implement IP-based rate limiting using `@nestjs/throttler` for endpoints:

- `/auth/login`: 5 attempts per hour
- `/auth/register`: 3 attempts per hour
- `/readings`: 10 per minute

## Data Security

### Database Security

1. **Parameterized Queries:** TypeORM uses parameterized queries by default
2. **Soft Deletes:** User data is soft-deleted, not permanently removed
3. **Encryption at Rest:** Configure PostgreSQL with encryption (production)

### Sensitive Data Handling

1. **Passwords:** Never logged or exposed in responses
2. **JWT Secrets:** Stored in environment variables
3. **API Keys:** OpenAI keys stored in environment, never in code

## Security Monitoring

### Audit Logging (TASK-030)

**What's Logged:**

- All admin actions (user management, bans, etc.)
- Failed login attempts
- Suspicious activity patterns
- XSS attempts detected by OutputSanitizerService

**Location:** `src/modules/audit/`

**Storage:** `audit_logs` table with:

- Timestamp
- User ID
- Action type
- IP address
- User agent
- Request details

### Security Events (Future - TASK-049)

**Planned:**

- Real-time security event monitoring
- Automatic alerts for critical events
- IP blacklisting for repeated attacks
- Integration with external monitoring tools (Datadog, Sentry)

## Vulnerability Management

### Dependency Scanning

**Tools:**

- `npm audit`: Check for known vulnerabilities
- `npm audit fix`: Automatically fix vulnerabilities

**Run regularly:**

```bash
npm audit
npm audit fix
```

### Code Scanning

**Manual Review:**

- Regularly review authentication code
- Review user input handling
- Review database queries

**Automated (Future):**

- SonarQube or similar static analysis
- Dependency vulnerability scanning in CI/CD

## Deployment Security

### Environment Variables

**Never commit to git:**

- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `POSTGRES_PASSWORD` - Database password
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key (if using Claude)
- `STRIPE_SECRET_KEY` - Stripe secret key (if using payments)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- Any other sensitive credentials

**Best Practices:**

```bash
# Generate secure secrets
openssl rand -base64 64

# Example .env (NEVER commit this file)
JWT_SECRET=your-very-long-random-secret-here-64-chars-minimum
JWT_REFRESH_SECRET=another-different-secret-for-refresh-tokens
POSTGRES_PASSWORD=secure-database-password-here
```

**Storage Options:**

- **Development:** `.env` files (add to `.gitignore`)
- **Production (Render):** Environment variables in dashboard
- **Production (AWS):** AWS Secrets Manager
- **Production (Azure):** Azure Key Vault
- **CI/CD:** GitHub Secrets, GitLab CI/CD Variables

### HTTPS & SSL/TLS

**Production Requirements:**

- HTTPS enforced (no HTTP access)
- TLS 1.2 minimum (TLS 1.3 preferred)
- Valid SSL certificate (Let's Encrypt, Cloudflare)
- HSTS header enabled (see Helmet configuration)

**Render Configuration:**

Render provides automatic HTTPS with Let's Encrypt certificates (no configuration needed).

**Custom Domain SSL:**

```bash
# Render automatically provisions SSL for custom domains
# Just add your domain in Dashboard → Settings → Custom Domain
```

### Production Checklist

Before deploying to production:

- [ ] All dependencies updated (`npm update`)
- [ ] `npm audit` passes with no high/critical issues
- [ ] JWT secrets are long and random (64+ characters)
- [ ] CORS is restricted to frontend domain (`CORS_ORIGIN=https://your-frontend.com`)
- [ ] HTTPS is enforced (HSTS enabled via Helmet)
- [ ] Database has strong password (20+ chars, mixed case, numbers, symbols)
- [ ] Database is not publicly accessible (use VPC/private network)
- [ ] Rate limiting is configured (see RATE_LIMITING.md)
- [ ] Audit logging is enabled (AUDIT_LOG_ENABLED=true)
- [ ] Security headers are enabled (Helmet configured)
- [ ] Error messages don't leak sensitive info (NODE_ENV=production)
- [ ] All environment variables are set correctly
- [ ] Backup strategy is configured (see DATABASE.md)
- [ ] Monitoring is configured (see LOGGING.md)

## Emergency Contacts & Reporting

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

**DO NOT** open a public GitHub issue.

**Email:** security@tarotflavia.com (or repository owner email)

**Include:**

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Your contact information (optional)

**Response Time:**

- Initial acknowledgment: Within 24 hours
- Status update: Within 72 hours
- Fix deployment: Depends on severity (critical within 7 days)

### Security Incident Steps

1. **Identify:** Detect the security incident via logs, monitoring, or user reports
2. **Contain:** Isolate affected systems, revoke compromised tokens, block suspicious IPs
3. **Investigate:** Analyze audit logs, security events, database queries
4. **Remediate:** Fix vulnerability, deploy patch, update dependencies
5. **Notify:** Inform affected users if data breach (GDPR compliance)
6. **Document:** Post-mortem analysis, document lessons learned, update security policies

### Incident Severity Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Data breach, system compromise, RCE | Immediate (< 2 hours) |
| **High** | Authentication bypass, privilege escalation | < 24 hours |
| **Medium** | XSS, CSRF, information disclosure | < 72 hours |
| **Low** | Minor information leak, rate limit bypass | < 1 week |

### Emergency Contacts

- **Security Lead:** [TBD]
- **DevOps Lead:** [TBD]
- **Legal/Compliance:** [TBD]
- **Platform Provider:** Render Support (if using Render)

## Security Testing

### Manual Testing

**XSS Testing:**

```bash
# Test input sanitization
curl -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "<script>alert(1)</script>"}'
```

**SQL Injection Testing:**

```bash
# Test email validation
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin'\'' OR 1=1--", "password": "anything"}'
```

### Automated Testing

**E2E Security Tests:**

```bash
npm run test:e2e -- input-validation-security.e2e-spec.ts
npm run test:e2e -- output-sanitization.e2e-spec.ts
```

**Unit Tests:**

```bash
npm test -- output-sanitizer.service.spec.ts
npm test -- is-secure-url.validator.spec.ts
npm test -- max-json-depth.validator.spec.ts
```

## Security Best Practices for Developers

### When Writing New Code

1. **Always sanitize user inputs:** Use DTOs with validation decorators (`class-validator`)
2. **Always sanitize outputs:** Use `OutputSanitizerService` for all AI-generated responses
3. **Use parameterized queries:** Never concatenate SQL strings (TypeORM handles this)
4. **Validate all inputs:** Never trust client-side validation alone (always validate server-side)
5. **Use HTTPS:** Even in development when testing authentication flows
6. **Log security events:** Use `AuditLogService` for all sensitive actions
7. **Follow principle of least privilege:** Users should only access what they need (use guards and roles)
8. **Never log sensitive data:** Passwords, JWT tokens, credit cards, API keys should never be logged
9. **Use guards consistently:** Always use `@UseGuards(JwtAuthGuard)` for protected routes
10. **Review third-party dependencies:** Check npm audit before adding new packages

### Security Code Examples

**✅ Good - Secure Code:**

```typescript
// DTO with validation
export class CreateReadingDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @SanitizeHtml() // Custom decorator
  question: string;

  @IsInt()
  @Min(1)
  @Max(100)
  spreadId: number;
}

// Controller with guards
@UseGuards(JwtAuthGuard)
@Post('readings')
async createReading(
  @Body() dto: CreateReadingDto,
  @CurrentUser() user: User,
) {
  return this.readingsService.create(dto, user);
}

// Service with sanitization
async generateInterpretation(reading: TarotReading): Promise<string> {
  const rawInterpretation = await this.aiProvider.generate(prompt);
  return this.outputSanitizer.sanitize(rawInterpretation); // Always sanitize AI output
}
```

**❌ Bad - Insecure Code:**

```typescript
// No validation
@Post('readings')
async createReading(@Body() dto: any) { // 'any' type - no validation!
  // Direct use without sanitization
  await this.db.query(`INSERT INTO readings (question) VALUES ('${dto.question}')`); // SQL Injection!
}

// No authentication
@Get('admin/users')
async getAllUsers() { // Anyone can access this!
  return this.usersService.findAll();
}

// Logging sensitive data
this.logger.log(`User ${user.email} logged in with password ${password}`); // NEVER log passwords!
```

### Code Review Checklist

- [ ] All user inputs are validated with DTOs and decorators
- [ ] SQL queries use TypeORM (no raw SQL string concatenation)
- [ ] Passwords are hashed with bcrypt (never stored in plain text)
- [ ] Sensitive data is not logged (passwords, tokens, API keys)
- [ ] Authorization guards are in place (`@UseGuards(JwtAuthGuard, RolesGuard)`)
- [ ] Error messages don't leak sensitive info (use generic messages in production)
- [ ] New dependencies are from trusted sources (check npm, verify maintainer)
- [ ] AI-generated content is sanitized before storing/returning
- [ ] Rate limiting is applied to sensitive endpoints
- [ ] CORS configuration is restrictive (not `*` in production)

## Compliance

### GDPR Compliance (Future)

**Requirements:**

- Right to access: Users can export their data
- Right to deletion: Users can request account deletion
- Data minimization: Only collect necessary data
- Consent: Clear consent for data processing

### OWASP Top 10 Coverage

| OWASP Risk                     | Mitigation                                            |
| ------------------------------ | ----------------------------------------------------- |
| A01: Broken Access Control     | RBAC, Guards, JWT                                     |
| A02: Cryptographic Failures    | bcrypt, HTTPS, secure JWT                             |
| A03: Injection                 | Input validation, parameterized queries, sanitization |
| A04: Insecure Design           | Security by design, defense in depth                  |
| A05: Security Misconfiguration | Helmet, secure defaults, environment variables        |
| A06: Vulnerable Components     | npm audit, dependency updates                         |
| A07: Authentication Failures   | Strong passwords, JWT, rate limiting                  |
| A08: Software Data Integrity   | Code signing, CI/CD validation                        |
| A09: Logging Failures          | Audit logs, security event monitoring                 |
| A10: SSRF                      | URL validation, no user-controlled requests           |

---

**Version:** 2.0.0  
**Last Updated:** November 2025  
**Next Review:** February 2026  
**Maintained by:** Development Team

## Related Documentation

- [INPUT_VALIDATION.md](./INPUT_VALIDATION.md) - Detailed input validation strategy
- [AUDIT_LOG.md](./AUDIT_LOG.md) - Audit logging implementation
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API security considerations
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment security
- [DATABASE.md](./DATABASE.md) - Database security and pooling

## External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/security-best-practices)
- [JWT Best Practices (RFC 8725)](https://tools.ietf.org/html/rfc8725)
- [GDPR Compliance Guide](https://gdpr.eu/)

