# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Admin Tarotista Management Module** (TASK-070)
  - Complete CRUD operations for tarotistas (create, list, update, deactivate, reactivate)
  - Advanced filtering and pagination (search, isActive, sortBy, sortOrder)
  - Individual AI configuration per tarotista (prompts, temperature, model, provider)
  - Custom card meanings system for personalized interpretations
  - Bulk import of custom meanings
  - Tarotista application workflow (apply → pending → approve/reject)
  - Admin notes and review tracking for applications
  - 15 admin endpoints with role-based access control
  - Database migrations: tarotista_config, tarotista_card_meanings, tarotista_applications
  - Comprehensive test suite: 17 unit tests + 20 E2E tests (100% passing)
- Comprehensive technical documentation suite
- API documentation with detailed endpoint specifications
- Database documentation with ER diagrams and migration guides
- Development environment setup guide
- Deployment guides for Render, Railway, and DigitalOcean
- Security best practices and vulnerability reporting process

### Fixed

- **TarotistasAdminService bug** (TASK-070): Wrong relation name 'config' → 'configs' causing 500 errors in filtered queries

---

## [0.1.0] - 2025-11-20

### Added

#### Core Features

- **Authentication System** (TASK-001)

  - JWT-based authentication with access and refresh tokens
  - Email/password registration and login
  - Password hashing with bcrypt (10 salt rounds)
  - Role-based access control (RBAC): CONSUMER, TAROTIST, ADMIN
  - Token refresh mechanism (7-day expiry for refresh tokens)

- **Tarot Reading System** (TASK-002, TASK-003)

  - Multiple spread types: Single Card, Three Card, Celtic Cross, etc.
  - 78 Rider-Waite tarot cards catalog with full descriptions
  - Card positioning with upright/reversed interpretations
  - Reading history with soft deletes
  - Reading sharing via public tokens
  - Reading regeneration (premium feature)
  - Category-based questions (Love, Career, Spirituality, etc.)
  - Predefined and custom questions (premium)

- **AI Integration** (TASK-004, TASK-041)

  - Multi-provider AI support: OpenAI GPT-4 Turbo, Anthropic Claude 3.5 Sonnet
  - Tarotista personality profiles (Flavia, Solange, Celestina, etc.)
  - Context-aware interpretations based on card positions
  - Circuit breaker pattern for API resilience
  - Retry logic with exponential backoff
  - AI cost tracking per user and request

- **Daily Readings** (TASK-005)

  - Automated daily card draw for users
  - One card per day per tarotista
  - Regeneration allowed for premium users
  - Historical daily reading tracking

- **Usage Limits & Plans** (TASK-006, TASK-007)
  - Free plan: 3 readings/day, predefined questions only
  - Premium plan: Unlimited readings, custom questions, regeneration
  - Per-tarotista usage limits
  - Daily limit reset mechanism
  - Stripe integration preparation (structure in place)

#### Admin Features

- **User Management** (TASK-008, TASK-030)

  - View all users with pagination and filters
  - Ban/unban users with reason tracking
  - User statistics and activity metrics
  - Role assignment (promote to admin, tarotist)
  - Audit logging for all admin actions

- **Tarotista Management** (TASK-009)

  - Tarotista profile creation and configuration
  - Custom AI prompts per tarotista
  - Tarotista activation/deactivation
  - Subscription management

- **Content Management** (TASK-010)
  - Category management (CRUD operations)
  - Predefined questions management
  - Tarot deck management
  - Card catalog administration

#### Technical Infrastructure

- **Database** (TASK-011)

  - PostgreSQL 15+ with TypeORM 0.3.x
  - Migration system with TypeORM CLI
  - Seed scripts for cards, users, categories
  - Connection pooling configuration
  - Soft delete support
  - Indexes for performance optimization

- **Caching** (TASK-012, TASK-042)

  - In-memory cache for readings (30-minute TTL)
  - AI interpretation caching (1-hour TTL)
  - Cache invalidation on updates/deletes
  - Redis preparation (structure in place)
  - Cache interceptors for automatic caching

- **Security** (TASK-048, INPUT_VALIDATION)

  - Helmet.js security headers (CSP, HSTS, XSS protection)
  - Input validation with class-validator
  - Output sanitization for AI-generated content
  - SQL injection protection via parameterized queries
  - XSS protection via input/output sanitization
  - CORS configuration
  - Custom validators: @IsSecureUrl, @MaxJsonDepth
  - Custom sanitizers: @SanitizeHtml, @SanitizeEmail

- **Logging & Monitoring** (TASK-013, TASK-030)

  - Winston logger with file and console transports
  - Request/response logging
  - Error logging with stack traces
  - Audit logs for sensitive operations
  - AI request logging with cost tracking
  - Performance metrics

- **Testing** (E2E_TESTING_GUIDE)
  - Jest unit tests with >70% coverage target
  - E2E tests for critical flows
  - Authentication flow testing
  - Reading creation and interpretation testing
  - Admin actions testing
  - Security testing (XSS, SQL injection attempts)
  - Fixtures and seeders for tests

#### API Endpoints

- **Authentication**: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
- **Users**: `/users/me`, `/users/:id` (admin)
- **Readings**: `/readings` (CRUD), `/readings/:id/regenerate`, `/readings/shared/:token`
- **Daily Readings**: `/daily-readings/today`, `/daily-readings/history`
- **Categories**: `/categories` (CRUD)
- **Tarotistas**: `/tarotistas` (CRUD, admin)
- **Decks**: `/decks` (CRUD, admin)
- **Cards**: `/cards` (GET)
- **Spreads**: `/spreads` (GET)
- **Admin**: `/admin/users`, `/admin/users/:id/ban`, `/admin/stats`

### Changed

- Migrated from monolithic structure to feature-based modules
- Improved error handling with global exception filters
- Enhanced validation with custom decorators
- Optimized database queries with proper indexing
- Refactored AI provider system to support multiple providers

### Deprecated

- `User.isAdmin` field (replaced by `roles` array) - will be removed in v1.0.0

### Security

- Implemented comprehensive input validation across all endpoints
- Added output sanitization for AI-generated content
- Configured security headers via Helmet.js
- Enabled CORS with configurable origins
- Added audit logging for admin actions
- Implemented circuit breaker for external API calls

### Fixed

- Race conditions in daily reading generation
- Memory leaks in cache service
- Improper error handling in AI providers
- Missing indexes on frequently queried columns
- E2E test flakiness with sequential execution

---

## Version History

| Version        | Release Date | Description                            |
| -------------- | ------------ | -------------------------------------- |
| **0.1.0**      | 2025-11-20   | Initial MVP release with core features |
| **Unreleased** | -            | Technical documentation suite          |

---

## Upgrade Guide

### From 0.0.x to 0.1.0

This is the initial release, no upgrade path needed.

**Database Migrations:**

```bash
# Run all migrations
npm run migration:run

# Seed initial data
npm run db:seed:all
```

**Environment Variables:**

New required environment variables:

```bash
# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# AI Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key (optional)

# Database
DATABASE_URL=postgresql://user:password@localhost:5435/tarot_db

# CORS
CORS_ORIGIN=http://localhost:3001
```

---

## Contributing

See [CONTRIBUTING.md](backend/tarot-app/CONTRIBUTING.md) for guidelines on how to contribute to this project.

When adding entries to the changelog:

1. **Group changes** under: Added, Changed, Deprecated, Removed, Fixed, Security
2. **Link to tasks**: Reference task IDs (e.g., TASK-001)
3. **Be specific**: Describe what changed and why
4. **User-focused**: Write for users/developers, not just team members

---

## Links

- **Repository**: [GitHub](https://github.com/ArielDRighi/TarotFlavia)
- **Documentation**: [README.md](README.md)
- **API Documentation**: [API_DOCUMENTATION.md](backend/tarot-app/docs/API_DOCUMENTATION.md)
- **Deployment Guide**: [DEPLOYMENT.md](backend/tarot-app/docs/DEPLOYMENT.md)
- **Security Policy**: [SECURITY.md](backend/tarot-app/docs/SECURITY.md)

---

**Maintained by**: Development Team  
**Last Updated**: November 2025
