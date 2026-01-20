# TASK-131: Migración de Datos a 60 Horóscopos Chinos

## 📋 Descripción

Esta tarea migra el sistema de horóscopos chinos de **12 horóscopos genéricos** por año a **60 horóscopos personalizados** por año (12 animales × 5 elementos Wu Xing).

---

## 🚀 Proceso de Migración

### 1. Backup (OBLIGATORIO antes de migración)

```bash
cd backend/tarot-app
npm run backup:chinese-horoscopes
```

**Output esperado:**
```
[Backup] ✓ Backup completado exitosamente
[Backup] Archivo: backups/chinese-horoscopes-backup-2026-01-20T15-30-00-000Z.json
[Backup] Total de registros respaldados: 12
```

El backup se guarda en: `backend/tarot-app/backups/chinese-horoscopes-backup-{timestamp}.json`

---

### 2. Ejecutar Migración

```bash
npm run migration:run
```

**Qué hace:**
- ✅ Cuenta y muestra registros a eliminar
- ✅ Muestra resumen por año
- ✅ Elimina todos los horóscopos genéricos viejos
- ✅ Resetea la secuencia de IDs
- ⚠️ **NO genera** los 60 nuevos automáticamente

---

### 3. Generar 60 Horóscopos Nuevos

**Opción A: Script (Recomendado para desarrollo)**
```bash
ts-node -r tsconfig-paths/register scripts/generate-chinese-horoscopes.ts 2025
```

**Opción B: Endpoint Admin (Recomendado para producción)**
```bash
POST /chinese-horoscope/admin/generate/2025
Authorization: Bearer <admin-token>
```

**Opción C: CLI**
```bash
npm run cli generate-chinese 2025
```

**Tiempo estimado:** ~10 minutos (60 requests con delay de 10s)

---

## 🔄 Proceso de Rollback

### Si necesitas revertir la migración:

**1. Revertir la migración (elimina tabla, NO restaura datos)**
```bash
npm run migration:revert
```

**2. Restaurar datos desde backup (MANUAL)**

El backup contiene un JSON con esta estructura:
```json
{
  "timestamp": "2026-01-20T15:30:00.000Z",
  "totalRecords": 12,
  "databaseName": "tarot_dev",
  "horoscopes": [
    {
      "id": 1,
      "animal": "dragon",
      "element": "earth",
      "year": 2025,
      "general_overview": "...",
      "areas": {...},
      ...
    }
  ]
}
```

**Restauración manual vía SQL:**
```bash
# Conectar a la base de datos
psql -h localhost -U postgres -d tarot_dev

# Copiar e insertar cada registro desde el backup JSON
# (Convertir JSON a INSERT statements)
```

**O usar script de restauración:**
```bash
ts-node -r tsconfig-paths/register scripts/restore-chinese-horoscopes.ts \
  backups/chinese-horoscopes-backup-{timestamp}.json
```

---

## 📁 Archivos Creados/Modificados

### Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| `scripts/backup-chinese-horoscopes.ts` | Script de backup de datos |
| `scripts/generate-chinese-horoscopes.ts` | Script para generar 60 horóscopos |
| `src/database/migrations/1771100000000-MigrateChineseHoroscopesTo60.ts` | Migración de datos |
| `docs/ROLLBACK_CHINESE_HOROSCOPES.md` | Esta documentación |

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `package.json` | Agregado script `backup:chinese-horoscopes` |

---

## ✅ Criterios de Aceptación

- [x] Script de backup funciona y crea archivo JSON
- [x] Migración elimina registros viejos
- [x] Migración resetea secuencia de IDs
- [x] Script de generación crea 60 horóscopos
- [x] Documentación de rollback disponible
- [x] Proceso es idempotente (se puede ejecutar múltiples veces)

---

## 🧪 Testing

### Ambiente de Desarrollo

```bash
# 1. Backup
npm run backup:chinese-horoscopes

# 2. Migración
npm run migration:run

# 3. Verificar tabla vacía
npm run cli query "SELECT COUNT(*) FROM chinese_horoscopes"
# Output esperado: 0

# 4. Generar horóscopos
ts-node -r tsconfig-paths/register scripts/generate-chinese-horoscopes.ts 2025

# 5. Verificar 60 registros
npm run cli query "SELECT COUNT(*) FROM chinese_horoscopes WHERE year = 2025"
# Output esperado: 60
```

### Ambiente de Staging/Producción

⚠️ **IMPORTANTE:** En producción, usar endpoint admin con autenticación:

```bash
# 1. Backup (automático en pre-migration hook)
npm run backup:chinese-horoscopes

# 2. Ejecutar migración en maintenance window
npm run migration:run

# 3. Generar vía API con monitoreo
curl -X POST https://api.auguria.com/chinese-horoscope/admin/generate/2025 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 4. Verificar logs de generación
tail -f logs/horoscope-generation.log
```

---

## 📊 Impacto en Base de Datos

### Antes de la migración (12 horóscopos/año)
```
animal    | element | year | count
----------|---------|------|------
rat       | earth   | 2025 | 1
ox        | earth   | 2025 | 1
...       | ...     | ...  | ...
pig       | earth   | 2025 | 1
TOTAL: 12
```

### Después de la migración (60 horóscopos/año)
```
animal    | element | year | count
----------|---------|------|------
rat       | metal   | 2025 | 1
rat       | water   | 2025 | 1
rat       | wood    | 2025 | 1
rat       | fire    | 2025 | 1
rat       | earth   | 2025 | 1
...       | ...     | ...  | ...
pig       | earth   | 2025 | 1
TOTAL: 60 (12 × 5)
```

---

## ⚠️ Precauciones

1. **NUNCA** ejecutar migración sin backup
2. **VERIFICAR** que el ambiente de IA esté configurado antes de generar
3. **MONITOREAR** rate limits durante generación (puede tomar 10+ minutos)
4. **NO INTERRUMPIR** el proceso de generación (puede dejar datos parciales)
5. **VALIDAR** que existan 60 registros después de generar

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisar logs: `logs/migration-{timestamp}.log`
2. Verificar backup existe: `ls -la backups/`
3. Contactar al equipo de desarrollo con el timestamp del backup

---

**Fecha:** 20 de enero de 2026  
**Autor:** TASK-131 - Sistema de Horóscopos Chinos  
**Versión:** 1.0
