# Security Documentation

## Overview

This document outlines the comprehensive security strategy implemented in the Tarot application to protect against common web vulnerabilities and ensure data confidentiality, integrity, and availability.

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

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `OPENAI_API_KEY`
- Any other sensitive credentials

**Use:**

- `.env` files (gitignored)
- Environment variable injection in deployment platform
- Secret management services (AWS Secrets Manager, Azure Key Vault)

### Production Checklist

Before deploying to production:

- [ ] All dependencies updated
- [ ] `npm audit` passes with no high/critical issues
- [ ] JWT secrets are long and random (64+ characters)
- [ ] CORS is restricted to frontend domain
- [ ] HTTPS is enforced (HSTS enabled)
- [ ] Database has strong password
- [ ] Rate limiting is configured
- [ ] Audit logging is enabled
- [ ] Security headers are enabled (Helmet)
- [ ] Error messages don't leak sensitive info

## Incident Response

### Security Incident Steps

1. **Identify:** Detect the security incident
2. **Contain:** Isolate affected systems
3. **Investigate:** Analyze audit logs and security events
4. **Remediate:** Fix vulnerability, update code
5. **Notify:** Inform affected users if data breach
6. **Document:** Document incident and lessons learned

### Emergency Contacts

- Security Lead: [TBD]
- DevOps Lead: [TBD]
- Legal/Compliance: [TBD]

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

1. **Always sanitize user inputs:** Use DTOs with validation
2. **Always sanitize outputs:** Use OutputSanitizerService for AI responses
3. **Use parameterized queries:** Never concatenate SQL
4. **Validate all inputs:** Never trust client-side validation alone
5. **Use HTTPS:** Even in development when testing authentication
6. **Log security events:** Use AuditLogService for sensitive actions
7. **Follow principle of least privilege:** Users should only access what they need

### Code Review Checklist

- [ ] All user inputs are validated
- [ ] SQL queries use TypeORM (no raw SQL)
- [ ] Passwords are hashed with bcrypt
- [ ] Sensitive data is not logged
- [ ] Authorization guards are in place
- [ ] Error messages don't leak sensitive info
- [ ] New dependencies are from trusted sources

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

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/security-best-practices)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0  
**Next Review:** April 27, 2025
