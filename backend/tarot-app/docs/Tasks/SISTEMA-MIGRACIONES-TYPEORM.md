# Migrar de synchronize: true a Sistema de Migraciones

> **TASK-002** | Estado: ✅ COMPLETADO | Prioridad: 🔴 CRÍTICA

## 📋 Resumen

Reemplazo del modo `synchronize: true` de TypeORM por un sistema robusto de migraciones, crítico para producción ya que `synchronize` puede causar pérdida de datos.

## ✅ Verificación de Implementación

| Requisito                         | Estado | Implementación                                          |
| --------------------------------- | ------ | ------------------------------------------------------- |
| Desactivar `synchronize: true`    | ✅     | `synchronize: false` en `src/config/typeorm.ts:46`      |
| Rutas de migraciones configuradas | ✅     | `migrations: [__dirname + '/../migrations/*{.ts,.js}']` |
| Migración inicial `InitialSchema` | ✅     | `1761655973524-InitialSchema.ts`                        |
| Script `migration:generate`       | ✅     | `npm run migration:generate`                            |
| Script `migration:run`            | ✅     | `npm run migration:run`                                 |
| Script `migration:revert`         | ✅     | `npm run migration:revert`                              |
| Script `migration:show`           | ✅     | `npm run migration:show`                                |
| Convención nombres (timestamp)    | ✅     | Ejemplo: `1761655973524-InitialSchema.ts`               |
| Tabla migrations                  | ✅     | `migrationsTableName: 'migrations'`                     |

## 📁 Migraciones Creadas

```
src/database/migrations/
├── 1761655973524-InitialSchema.ts              # Esquema inicial completo
├── 1762555582744-CreateMultiTarotistSchema.ts  # Sistema multi-tarotista
├── 1762725922094-MigrateReadingsToFlavia.ts    # Migración lecturas
├── 1762973040894-AddUserBanAndLastLoginFieldsClean.ts
├── 1762989000000-CreateAuditLogTableClean.ts
├── 1763000000000-AddIndexesForAdminDashboard.ts
├── 1763160254267-CreateSchedulingTables.ts
├── 1763378576976-CreateSecurityEventsTable.ts
├── 1763420000000-CreateAIProviderUsageTable.ts
├── 1763688305400-CreateTarotistaApplicationsTable.ts
├── 1764367226428-CreatePlanConfigTable.ts
├── 1764368721422-AddGuestToPlanTypeEnum.ts
├── 1770000000000-CreateDailyReadingTable.ts
├── 1770100000000-AddMonthlyAIQuotaFieldsToUser.ts
├── 1770200000000-CreateCacheMetricsTable.ts
└── 1770300000000-AddGuestToUserPlanEnum.ts
```

## 🚀 Comandos de Uso

```bash
# Generar nueva migración
npm run migration:generate src/database/migrations/NombreMigracion

# Crear migración vacía
npm run migration:create src/database/migrations/NombreMigracion

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show

# Migrar BD E2E
npm run db:e2e:migrate
```

## 📊 Tablas en InitialSchema

La migración inicial captura:

- `user` (con planes y suscripciones)
- `tarot_deck`
- `tarot_card`
- `tarot_spread`
- `tarot_reading`
- `tarot_interpretation`
- `tarot_reading_cards_tarot_card` (relación M:N)
- `reading_category`
- `predefined_question`
- `usage_limit`

## 🧪 Tests de Integración

### Tests Existentes

Las migraciones se validan implícitamente en cada test E2E que usa la BD.

### Tests Necesarios/Faltantes

| Test                           | Estado       | Descripción                 |
| ------------------------------ | ------------ | --------------------------- |
| Migraciones ejecutan sin error | ⚠️ Implícito | Se verifica en setup de E2E |
| Rollback funciona              | ⚠️ Manual    | Ejecutar `migration:revert` |
| Esquema coincide con entidades | ⚠️ Manual    | Verificar que no hay drift  |

### Script de Verificación Recomendado

```bash
#!/bin/bash
# test-migrations.sh

echo "🔄 Verificando sistema de migraciones..."

# 1. Ver estado actual
npm run migration:show

# 2. Verificar que no hay pendientes (en producción)
PENDING=$(npm run migration:show 2>&1 | grep -c "\[ \]")
if [ "$PENDING" -gt 0 ]; then
    echo "⚠️ Hay $PENDING migraciones pendientes"
fi

# 3. Verificar integridad del esquema
npm run build

echo "✅ Verificación completada"
```

## 📝 Configuración Relevante

```typescript
// src/config/typeorm.ts
{
  synchronize: false,                    // DESACTIVADO
  autoLoadEntities: true,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: true,                   // Auto-run en startup (dev)
}
```

## 🔗 Referencias

- [DATABASE.md](../DATABASE.md) - Documentación de base de datos
- [MIGRATIONS.md](../MIGRATIONS.md) - Guía de migraciones (si existe)
