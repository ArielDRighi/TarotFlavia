# 🚀 Quick Start - Testing Endpoints Tarotistas

## Inicio Rápido (5 minutos)

### 1️⃣ Preparación

```bash
# Terminal 1: Iniciar servidor
cd backend/tarot-app
npm run start:dev

# Esperar a que el servidor esté listo
# Verás: "Application is running on: http://localhost:3000"
```

### 2️⃣ Ejecutar Tests Automáticos

```bash
# Terminal 2: Ejecutar script de tests
cd backend/tarot-app
./test-tarotistas-endpoints.sh
```

El script te pedirá confirmación antes de empezar. Presiona ENTER para continuar.

### 3️⃣ Ver Resultados

El script ejecutará **32+ tests** automáticamente y mostrará:

- ✅ Tests exitosos en verde
- ❌ Tests fallidos en rojo
- 📊 Reporte final con estadísticas

---

## Ejecución Manual (Testing Individual)

### Paso 1: Obtener Token Admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!@#"
  }'
```

Copia el `access_token` de la respuesta.

### Paso 2: Guardar Token

```bash
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Paso 3: Probar Endpoints

#### Endpoint Público (sin autenticación)

```bash
# Listar tarotistas
curl http://localhost:3000/tarotistas

# Ver perfil de Flavia (ID 1)
curl http://localhost:3000/tarotistas/1
```

#### Endpoint Admin (con autenticación)

```bash
# Listar todos los tarotistas (admin)
curl http://localhost:3000/admin/tarotistas \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Ver configuración IA de Flavia
curl http://localhost:3000/admin/tarotistas/1/config \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Crear Nuevo Tarotista

```bash
curl -X POST http://localhost:3000/admin/tarotistas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "nombrePublico": "Luna Mystic",
    "bio": "Tarotista especializada en amor",
    "especialidades": ["Amor", "Relaciones"],
    "email": "luna@example.com",
    "password": "Luna123!@#"
  }'
```

#### Ver Métricas

```bash
# Métricas de plataforma (solo admin)
curl "http://localhost:3000/tarotistas/metrics/platform?year=2025&month=11" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Métricas de tarotista específico
curl "http://localhost:3000/tarotistas/metrics/tarotista?tarotistaId=1&year=2025&month=11" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📂 Archivos de Referencia

- **Script Completo:** `test-tarotistas-endpoints.sh`
- **Documentación Detallada:** `docs/TAROTISTAS_ENDPOINTS_TESTING.md`
- **API Swagger:** http://localhost:3000/api-docs

---

## ⚡ Tests Rápidos (Copy & Paste)

### Test 1: Endpoints Públicos ✅

```bash
curl http://localhost:3000/tarotistas
curl http://localhost:3000/tarotistas/1
curl "http://localhost:3000/tarotistas?search=Flavia"
```

### Test 2: Admin CRUD ✅

```bash
export ADMIN_TOKEN="..." # Obtener primero

curl http://localhost:3000/admin/tarotistas \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl http://localhost:3000/admin/tarotistas/1/config \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test 3: Seguridad ✅

```bash
# Debe retornar 401
curl http://localhost:3000/admin/tarotistas

# Debe retornar 404
curl http://localhost:3000/tarotistas/99999
```

---

## 🎯 Checklist de Tests Manuales

- [ ] ✅ GET /tarotistas (público)
- [ ] ✅ GET /tarotistas/:id (público)
- [ ] ✅ GET /admin/tarotistas (admin)
- [ ] ✅ POST /admin/tarotistas (crear)
- [ ] ✅ PUT /admin/tarotistas/:id (actualizar)
- [ ] ✅ PUT /admin/tarotistas/:id/deactivate
- [ ] ✅ PUT /admin/tarotistas/:id/reactivate
- [ ] ✅ GET /admin/tarotistas/:id/config
- [ ] ✅ PUT /admin/tarotistas/:id/config
- [ ] ✅ POST /admin/tarotistas/:id/config/reset
- [ ] ✅ POST /admin/tarotistas/:id/meanings
- [ ] ✅ GET /admin/tarotistas/:id/meanings
- [ ] ✅ DELETE /admin/tarotistas/:id/meanings/:id
- [ ] ✅ POST /admin/tarotistas/:id/meanings/bulk
- [ ] ✅ GET /admin/tarotistas/applications
- [ ] ✅ GET /tarotistas/metrics/tarotista
- [ ] ✅ GET /tarotistas/metrics/platform
- [ ] ✅ POST /tarotistas/reports/export

---

## 🐛 Troubleshooting

**Error: "ECONNREFUSED"**
→ El servidor no está corriendo. Inicia con `npm run start:dev`

**Error: "401 Unauthorized"**
→ Token inválido o expirado. Vuelve a hacer login

**Error: "404 Not Found"**
→ Verifica que los seeders se hayan ejecutado: `npm run seed`

**Error: "jq: command not found"**
→ Instala jq: `sudo apt-get install jq` (Linux) o `brew install jq` (Mac)

---

## 📊 Reporte de Cobertura

El script automático probará:

- ✅ 8 endpoints públicos
- ✅ 12 endpoints administrativos
- ✅ 6 endpoints de configuración IA
- ✅ 4 endpoints de significados
- ✅ 3 endpoints de métricas
- ✅ Tests de seguridad (401, 403, 404)
- ✅ Tests de validación (400)

**Total: 32+ tests**

---

## 📚 Documentación Completa

Para ver todos los endpoints con ejemplos detallados:

```bash
cat docs/TAROTISTAS_ENDPOINTS_TESTING.md
```

O visita la documentación Swagger en:

```
http://localhost:3000/api-docs
```
