# Copilot Code Review Instructions - TarotFlavia

## 🎯 Contexto del Proyecto

TarotFlavia es un **monorepo**:

- `backend/tarot-app/` - NestJS API (puerto 3000)
- `frontend/` - Next.js App (puerto 3001)

---

## ⚠️ CONTRATOS CRÍTICOS DEL BACKEND (NO SUGERIR CAMBIOS)

### IDs son NUMÉRICOS

```json
// ✅ CORRECTO
{ "id": 123, "userId": 1, "spreadId": 2 }

// ❌ INCORRECTO - NO sugerir strings/UUIDs
{ "id": "123", "userId": "uuid-here" }
```

### Paginación del Backend

```json
// ✅ CORRECTO - Formato real
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}

// ❌ INCORRECTO - Estos campos NO existen
{ "meta": { "pageSize": 10, "hasNextPage": true } }
```

---

## 📏 Reglas de Review

### ✅ SUGERIR

- Usar `API_ENDPOINTS` en lugar de strings hardcodeados
- Tests para nueva funcionalidad (TDD)
- Separation of Concerns (app/ solo rutas, hooks/ para lógica)
- Coverage ≥ 80%
- Sin `any` ni `@ts-ignore`

### ❌ NO SUGERIR (Falsos Positivos)

1. **Cambiar IDs de `number` a `string`** - Backend usa numéricos
2. **Agregar `hasNextPage`/`pageSize` a PaginationMeta** - No existen en backend
3. **Usar `PaginatedResponse<T>` genérico** si no coincide con respuesta real
4. **Cambiar tipos que reflejan contratos del backend**

---

## 🔍 Cuando Dudar

Verificar estos documentos antes de sugerir cambios de tipos:

- `backend/tarot-app/docs/API_DOCUMENTATION.md` - Contratos de API
- `backend/tarot-app/docs/ARCHITECTURE.md` - Arquitectura backend
- `frontend/docs/ARCHITECTURE.md` - Arquitectura frontend

---

## 📚 Stack

**Backend:** NestJS, TypeORM, PostgreSQL, Jest

**Frontend:** Next.js 14, TanStack Query, Zustand, Vitest, Tailwind, shadcn/ui

---

## 🎯 Prioridades

1. 🔴 **Crítico:** Rompe contrato con backend
2. 🟠 **Importante:** No sigue arquitectura, falta testing
3. 🟡 **Mejora:** Optimización, refactoring
4. 🟢 **Nitpick:** Estilo menor
