# 🔄 Flavia Migration Documentation

## 📋 Overview

This document describes the migration process that transforms the Tarot Flavia application from a single-tarotista system to a multi-tarotista marketplace architecture, while maintaining **100% backward compatibility**.

The migration involves:

1. Creating Flavia as a user with TAROTIST and ADMIN roles
2. Creating Flavia's tarotista profile with her professional data
3. Creating Flavia's IA configuration with existing prompts
4. Assigning all existing readings to Flavia's profile
5. Updating reading counters

## 🎯 Objectives

- ✅ **Backward Compatibility**: System works exactly as before
- ✅ **Zero Downtime**: Migration can be executed without service interruption
- ✅ **Data Integrity**: All existing readings are preserved and assigned to Flavia
- ✅ **Idempotency**: Seeders and migrations can be run multiple times safely

## 📦 Components

### 1. Flavia User Seeder (`flavia-user.seeder.ts`)

Creates or finds the Flavia user account with:

- Email: `flavia@tarotflavia.com`
- Roles: `TAROTIST` + `ADMIN`
- Plan: `PREMIUM`
- Password: Securely hashed with bcrypt

### 2. Flavia Tarotista Seeder (`flavia-tarotista.seeder.ts`)

Creates Flavia's tarotista profile with:

- 20 years of experience
- Specializations: Amor, Trabajo, Espiritual
- Languages: Spanish
- Featured tarotista
- Active and accepting new clients

### 3. Flavia IA Config Seeder (`flavia-ia-config.seeder.ts`)

Creates Flavia's IA configuration with:

- System prompt extracted from current `tarot-prompts.ts`
- Temperature: 0.7
- Max tokens: 1000
- Style configuration preserving current tone and approach

### 4. Migration: MigrateReadingsToFlavia

Assigns all existing readings to Flavia's tarotista profile:

- Updates `tarot_reading.tarotista_id` for all NULL values
- Updates Flavia's `total_lecturas` counter
- Provides rollback capability

## 🚀 Execution Order (Development)

```bash
# 1. Reset database (drops and recreates)
npm run db:reset

# 2. Run migrations (includes MigrateReadingsToFlavia)
npm run migration:run

# 3. Run seeders (includes Flavia seeders)
npm run seed
```

## 🔍 Verification Queries

After running the migration, verify that everything is correct:

### Check Flavia User Exists

```sql
SELECT id, email, name, roles, plan, "isAdmin"
FROM "user"
WHERE email = 'flavia@tarotflavia.com';
```

**Expected result:**

- ✓ 1 row returned
- ✓ roles contains ['tarotist', 'admin']
- ✓ plan is 'premium'
- ✓ isAdmin is true

### Check Flavia Tarotista Profile

```sql
SELECT
  t.id,
  t.user_id,
  t.nombre_publico,
  t.años_experiencia,
  t.is_featured,
  t.is_active,
  t.total_lecturas
FROM tarotistas t
INNER JOIN "user" u ON u.id = t.user_id
WHERE u.email = 'flavia@tarotflavia.com';
```

**Expected result:**

- ✓ 1 row returned
- ✓ nombre_publico is 'Flavia'
- ✓ años_experiencia is 20
- ✓ is_featured is true
- ✓ is_active is true
- ✓ total_lecturas matches count of readings

### Check Flavia IA Configuration

```sql
SELECT
  tc.id,
  tc.tarotista_id,
  tc.version,
  tc.is_active,
  tc.temperature,
  tc.max_tokens
FROM tarotista_config tc
INNER JOIN tarotistas t ON t.id = tc.tarotista_id
INNER JOIN "user" u ON u.id = t.user_id
WHERE u.email = 'flavia@tarotflavia.com'
  AND tc.is_active = true;
```

**Expected result:**

- ✓ 1 row returned
- ✓ version is 1
- ✓ is_active is true
- ✓ temperature is 0.7
- ✓ max_tokens is 1000

### Check All Readings Are Assigned to Flavia

```sql
-- Count readings without tarotista_id (should be 0)
SELECT COUNT(*) as orphan_readings
FROM tarot_reading
WHERE tarotista_id IS NULL;

-- Count readings assigned to Flavia
SELECT COUNT(*) as flavia_readings
FROM tarot_reading tr
INNER JOIN tarotistas t ON t.id = tr.tarotista_id
INNER JOIN "user" u ON u.id = t.user_id
WHERE u.email = 'flavia@tarotflavia.com';

-- Verify total_lecturas counter matches
SELECT
  t.total_lecturas as counter_value,
  COUNT(tr.id) as actual_readings,
  (t.total_lecturas = COUNT(tr.id)) as counter_is_correct
FROM tarotistas t
INNER JOIN "user" u ON u.id = t.user_id
LEFT JOIN tarot_reading tr ON tr.tarotista_id = t.id
WHERE u.email = 'flavia@tarotflavia.com'
GROUP BY t.id, t.total_lecturas;
```

**Expected results:**

- ✓ orphan_readings = 0
- ✓ flavia_readings = total number of readings in DB
- ✓ counter_is_correct = true

## 🔄 Rollback Plan

If something goes wrong, you can rollback the changes:

```bash
# Rollback migration (sets tarotista_id to NULL)
npm run migration:revert
```

**Note**: Seeders are idempotent, so rolling back migrations and re-running seeders will restore the correct state.

## 🏭 Production Deployment

### Step 1: Backup Database

```bash
pg_dump -h localhost -U tarotflavia_user -d tarotflavia_db > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Migrations

```bash
npm run migration:run
```

### Step 3: Run Seeders

```bash
npm run seed
```

### Step 4: Verify Migration

Run all verification queries listed above.

### Step 5: Monitor Application

- Check application logs for errors
- Verify new readings are created correctly
- Test interpretation generation

### In Case of Failure

1. Stop application
2. Restore database from backup:
   ```bash
   psql -h localhost -U tarotflavia_user -d tarotflavia_db < backup_pre_migration_TIMESTAMP.sql
   ```
3. Investigate issue
4. Fix and retry

## ✅ Success Criteria

Migration is successful when:

1. ✓ Flavia user exists with correct roles
2. ✓ Flavia tarotista profile exists
3. ✓ Flavia IA config exists and is active
4. ✓ All readings have `tarotista_id` assigned to Flavia
5. ✓ `total_lecturas` counter is accurate
6. ✓ Application starts without errors
7. ✓ Existing tests pass
8. ✓ New readings are created successfully
9. ✓ Interpretations are generated correctly

## 📝 Notes

- **Idempotency**: All seeders check if data already exists before creating
- **Backward Compatibility**: Flavia has `isAdmin = true` for existing guards
- **Data Integrity**: Migration only updates NULL `tarotista_id` values
- **Future-Ready**: System prepared for multiple tarotistas

## 🔗 Related Documentation

- [TASK-064: Create Multi-Tarotist Database Schema](./project_backlog.md#task-064)
- [TASK-065: Migrate Flavia to Tarotistas Table](./project_backlog.md#task-065)
- [INFORME_TRASPASO_A_MARKETPLACE.md](./INFORME_TRASPASO_A_MARKETPLACE.md)

---

**Last Updated**: 2025-01-09  
**Migration Version**: 1762725922094-MigrateReadingsToFlavia
