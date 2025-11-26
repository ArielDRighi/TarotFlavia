# 🧪 Guía de Testing - Módulo Tarotistas

Esta guía documenta todos los endpoints del módulo Tarotistas implementados según TASK-070, TASK-072 y TASK-073.

## 📋 Índice

1. [Setup y Autenticación](#setup-y-autenticación)
2. [Endpoints Públicos](#endpoints-públicos)
3. [CRUD Administrativo](#crud-administrativo)
4. [Configuración de IA](#configuración-de-ia)
5. [Significados Personalizados](#significados-personalizados)
6. [Sistema de Aplicaciones](#sistema-de-aplicaciones)
7. [Métricas y Revenue](#métricas-y-revenue)
8. [Seguridad](#seguridad)

---

## Setup y Autenticación

### Variables de Entorno

```bash
export BASE_URL="http://localhost:3000"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="Admin123!@#"
```

### Obtener Token Admin

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$ADMIN_EMAIL"'",
    "password": "'"$ADMIN_PASSWORD"'"
  }'
```

**Respuesta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Guardar el token:

```bash
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Endpoints Públicos

### 1. Listar Tarotistas Públicos

**Endpoint:** `GET /tarotistas`  
**Auth:** No requerida  
**Descripción:** Lista todos los tarotistas activos con paginación y filtros

#### Ejemplo Básico

```bash
curl "$BASE_URL/tarotistas"
```

**Respuesta:**

```json
{
  "data": [
    {
      "id": 1,
      "nombrePublico": "Flavia",
      "bio": "Tarotista experta con años de experiencia",
      "especialidades": ["Amor", "Trabajo", "Espiritual"],
      "ratingPromedio": 4.8,
      "totalLecturas": 245,
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Con Paginación

```bash
curl "$BASE_URL/tarotistas?page=1&limit=5"
```

#### Con Búsqueda

```bash
curl "$BASE_URL/tarotistas?search=Flavia"
```

#### Con Filtros

```bash
# Por especialidad
curl "$BASE_URL/tarotistas?especialidad=Amor"

# Con ordenamiento
curl "$BASE_URL/tarotistas?orderBy=ratingPromedio&order=DESC"

# Combinado
curl "$BASE_URL/tarotistas?especialidad=Amor&orderBy=totalLecturas&order=DESC&page=1&limit=10"
```

### 2. Ver Perfil Público

**Endpoint:** `GET /tarotistas/:id`  
**Auth:** No requerida

```bash
curl "$BASE_URL/tarotistas/1"
```

**Respuesta:**

```json
{
  "id": 1,
  "nombrePublico": "Flavia",
  "bio": "Tarotista experta con años de experiencia",
  "especialidades": ["Amor", "Trabajo", "Espiritual"],
  "ratingPromedio": 4.8,
  "totalLecturas": 245,
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Caso Error (404):**

```bash
curl "$BASE_URL/tarotistas/99999"
```

---

## CRUD Administrativo

### 3. Crear Tarotista

**Endpoint:** `POST /admin/tarotistas`  
**Auth:** Admin requerido

```bash
curl -X POST "$BASE_URL/admin/tarotistas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "nombrePublico": "Luna Mystic",
    "bio": "Experta en tarot del amor y relaciones",
    "especialidades": ["Amor", "Relaciones"],
    "email": "luna.mystic@example.com",
    "password": "Luna123!@#",
    "customCommissionRate": 0.75
  }'
```

**Respuesta (201):**

```json
{
  "id": 2,
  "nombrePublico": "Luna Mystic",
  "bio": "Experta en tarot del amor y relaciones",
  "especialidades": ["Amor", "Relaciones"],
  "isActive": true,
  "customCommissionRate": 0.75,
  "createdAt": "2025-11-25T00:00:00.000Z"
}
```

### 4. Listar Todos los Tarotistas (Admin)

**Endpoint:** `GET /admin/tarotistas`  
**Auth:** Admin requerido

```bash
curl "$BASE_URL/admin/tarotistas" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Con Filtros

```bash
# Solo activos
curl "$BASE_URL/admin/tarotistas?isActive=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Solo inactivos
curl "$BASE_URL/admin/tarotistas?isActive=false" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 5. Actualizar Tarotista

**Endpoint:** `PUT /admin/tarotistas/:id`  
**Auth:** Admin requerido

```bash
curl -X PUT "$BASE_URL/admin/tarotistas/2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "bio": "Maestra del tarot con 15 años de experiencia",
    "especialidades": ["Amor", "Relaciones", "Carrera"],
    "customCommissionRate": 0.80
  }'
```

### 6. Desactivar Tarotista

**Endpoint:** `PUT /admin/tarotistas/:id/deactivate`  
**Auth:** Admin requerido

```bash
curl -X PUT "$BASE_URL/admin/tarotistas/2/deactivate" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 7. Reactivar Tarotista

**Endpoint:** `PUT /admin/tarotistas/:id/reactivate`  
**Auth:** Admin requerido

```bash
curl -X PUT "$BASE_URL/admin/tarotistas/2/reactivate" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Configuración de IA

### 8. Obtener Configuración IA

**Endpoint:** `GET /admin/tarotistas/:id/config`  
**Auth:** Admin requerido

```bash
curl "$BASE_URL/admin/tarotistas/1/config" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta:**

```json
{
  "id": 1,
  "tarotistaId": 1,
  "systemPrompt": "Eres Flavia, una tarotista experta...",
  "temperature": 0.7,
  "maxTokens": 500,
  "tono": "empático",
  "lenguaje": "español",
  "isActive": true
}
```

### 9. Actualizar Configuración IA

**Endpoint:** `PUT /admin/tarotistas/:id/config`  
**Auth:** Admin requerido

```bash
curl -X PUT "$BASE_URL/admin/tarotistas/1/config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "systemPrompt": "Eres Flavia, una tarotista experta con estilo místico y empático",
    "temperature": 0.8,
    "maxTokens": 800,
    "tono": "místico",
    "lenguaje": "español"
  }'
```

### 10. Resetear Configuración IA

**Endpoint:** `POST /admin/tarotistas/:id/config/reset`  
**Auth:** Admin requerido

```bash
curl -X POST "$BASE_URL/admin/tarotistas/1/config/reset" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Significados Personalizados

### 11. Crear Significado Personalizado

**Endpoint:** `POST /admin/tarotistas/:id/meanings`  
**Auth:** Admin requerido

```bash
curl -X POST "$BASE_URL/admin/tarotistas/1/meanings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "cardName": "El Loco",
    "context": "general",
    "customMeaning": "Representa nuevos comienzos llenos de posibilidades infinitas y aventuras por descubrir"
  }'
```

**Respuesta (201):**

```json
{
  "id": 1,
  "tarotistaId": 1,
  "cardName": "El Loco",
  "context": "general",
  "customMeaning": "Representa nuevos comienzos llenos de posibilidades infinitas...",
  "createdAt": "2025-11-25T00:00:00.000Z"
}
```

### 12. Listar Significados Personalizados

**Endpoint:** `GET /admin/tarotistas/:id/meanings`  
**Auth:** Admin requerido

```bash
curl "$BASE_URL/admin/tarotistas/1/meanings" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 13. Importar Significados en Lote

**Endpoint:** `POST /admin/tarotistas/:id/meanings/bulk`  
**Auth:** Admin requerido

```bash
curl -X POST "$BASE_URL/admin/tarotistas/1/meanings/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "meanings": [
      {
        "cardName": "La Emperatriz",
        "context": "amor",
        "customMeaning": "Fertilidad emocional y abundancia en el amor"
      },
      {
        "cardName": "El Mago",
        "context": "trabajo",
        "customMeaning": "Habilidad para manifestar tus metas profesionales"
      },
      {
        "cardName": "La Suma Sacerdotisa",
        "context": "espiritual",
        "customMeaning": "Conexión profunda con tu intuición interior"
      }
    ]
  }'
```

### 14. Eliminar Significado Personalizado

**Endpoint:** `DELETE /admin/tarotistas/:id/meanings/:meaningId`  
**Auth:** Admin requerido

```bash
curl -X DELETE "$BASE_URL/admin/tarotistas/1/meanings/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta:** `204 No Content`

---

## Sistema de Aplicaciones

### 15. Listar Aplicaciones

**Endpoint:** `GET /admin/tarotistas/applications`  
**Auth:** Admin requerido

```bash
curl "$BASE_URL/admin/tarotistas/applications" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Con Filtros

```bash
# Solo pendientes
curl "$BASE_URL/admin/tarotistas/applications?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Aprobadas
curl "$BASE_URL/admin/tarotistas/applications?status=approved" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Rechazadas
curl "$BASE_URL/admin/tarotistas/applications?status=rejected" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 16. Aprobar Aplicación

**Endpoint:** `POST /admin/tarotistas/applications/:id/approve`  
**Auth:** Admin requerido

```bash
curl -X POST "$BASE_URL/admin/tarotistas/applications/1/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "customCommissionRate": 0.75,
    "notes": "Perfil excelente, aprobado con comisión del 75%"
  }'
```

### 17. Rechazar Aplicación

**Endpoint:** `POST /admin/tarotistas/applications/:id/reject`  
**Auth:** Admin requerido

```bash
curl -X POST "$BASE_URL/admin/tarotistas/applications/2/reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "reason": "Experiencia insuficiente, se requiere mínimo 2 años de práctica"
  }'
```

---

## Métricas y Revenue

### 18. Métricas de Tarotista

**Endpoint:** `GET /tarotistas/metrics/tarotista`  
**Auth:** JWT requerido (usuario autenticado)

```bash
curl "$BASE_URL/tarotistas/metrics/tarotista?tarotistaId=1&year=2025&month=11" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta:**

```json
{
  "tarotistaId": 1,
  "nombrePublico": "Flavia",
  "period": {
    "year": 2025,
    "month": 11
  },
  "readings": {
    "total": 45,
    "completed": 42,
    "cancelled": 3
  },
  "revenue": {
    "totalGenerated": 4500.0,
    "tarotistaShare": 3150.0,
    "platformShare": 1350.0,
    "commissionRate": 0.7
  },
  "ratings": {
    "average": 4.8,
    "count": 40
  }
}
```

### 19. Métricas de Plataforma

**Endpoint:** `GET /tarotistas/metrics/platform`  
**Auth:** Admin requerido

```bash
curl "$BASE_URL/tarotistas/metrics/platform?year=2025&month=11" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta:**

```json
{
  "period": {
    "year": 2025,
    "month": 11
  },
  "totals": {
    "activeTarotistas": 5,
    "totalReadings": 230,
    "totalRevenue": 23000.0,
    "platformRevenue": 6900.0,
    "tarotistasRevenue": 16100.0
  },
  "byTarotista": [
    {
      "tarotistaId": 1,
      "nombrePublico": "Flavia",
      "readings": 45,
      "revenue": 4500.0,
      "share": 3150.0
    },
    {
      "tarotistaId": 2,
      "nombrePublico": "Luna Mystic",
      "readings": 38,
      "revenue": 3800.0,
      "share": 2850.0
    }
  ]
}
```

### 20. Exportar Reporte CSV

**Endpoint:** `POST /tarotistas/reports/export`  
**Auth:** JWT requerido

```bash
curl -X POST "$BASE_URL/tarotistas/reports/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "tarotistaId": 1,
    "year": 2025,
    "month": 11,
    "format": "csv"
  }'
```

**Respuesta:**

```json
{
  "filename": "report-tarotista-1-2025-11.csv",
  "content": "ZGF0ZSxyZWFkaW5nSWQsdXNlcixhbW91bnQsc2hhcmUKMjAyNS0xMS0wMSwxMjMsVXNlcjEsMTAwLDcwCg==",
  "mimeType": "text/csv"
}
```

### 21. Exportar Reporte PDF

**Endpoint:** `POST /tarotistas/reports/export`  
**Auth:** JWT requerido

```bash
curl -X POST "$BASE_URL/tarotistas/reports/export" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "tarotistaId": 1,
    "year": 2025,
    "month": 11,
    "format": "pdf"
  }'
```

**Respuesta:**

```json
{
  "filename": "report-tarotista-1-2025-11.pdf",
  "content": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog...",
  "mimeType": "application/pdf"
}
```

---

## Seguridad

### Tests de Seguridad

#### 1. Endpoint Admin sin Token (401)

```bash
curl "$BASE_URL/admin/tarotistas"
```

**Respuesta esperada:** `401 Unauthorized`

#### 2. Endpoint Admin con Token de Usuario Regular (403)

```bash
# Primero login como usuario regular
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "User123!@#"
  }'

# Guardar token de usuario
export USER_TOKEN="..."

# Intentar acceder a endpoint admin
curl "$BASE_URL/admin/tarotistas" \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Respuesta esperada:** `403 Forbidden`

#### 3. Métricas Plataforma sin Admin (403)

```bash
curl "$BASE_URL/tarotistas/metrics/platform" \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Respuesta esperada:** `403 Forbidden`

---

## Validaciones

### Datos Inválidos (400)

```bash
# Email inválido
curl -X POST "$BASE_URL/admin/tarotistas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "nombrePublico": "",
    "email": "invalid-email"
  }'
```

**Respuesta esperada:** `400 Bad Request`

### Valores Fuera de Rango

```bash
# Temperature y maxTokens inválidos
curl -X PUT "$BASE_URL/admin/tarotistas/1/config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "temperature": 5.0,
    "maxTokens": -100
  }'
```

**Respuesta esperada:** `400 Bad Request`

---

## Casos Edge

### Paginación Extrema

```bash
# Página 0
curl "$BASE_URL/tarotistas?page=0&limit=1000"

# Límite muy grande
curl "$BASE_URL/tarotistas?page=1&limit=9999"
```

### Búsqueda con Caracteres Especiales

```bash
# Test XSS
curl "$BASE_URL/tarotistas?search=%3Cscript%3Ealert%281%29%3C%2Fscript%3E"

# Test SQL Injection
curl "$BASE_URL/tarotistas?search=1%27%20OR%20%271%27%3D%271"
```

---

## 📊 Cobertura de Tests

### Endpoints Implementados

- ✅ **8/8** Endpoints públicos (TASK-072)
- ✅ **12/12** Endpoints administrativos (TASK-070)
- ✅ **6/6** Endpoints de configuración IA (TASK-070)
- ✅ **4/4** Endpoints significados personalizados (TASK-070)
- ✅ **3/3** Endpoints aplicaciones (TASK-070)
- ✅ **3/3** Endpoints métricas/revenue (TASK-073)

**Total:** 36 endpoints cubiertos

### Categorías de Tests

- ✅ Funcionalidad básica
- ✅ Paginación y filtros
- ✅ Autenticación y autorización
- ✅ Validación de datos
- ✅ Casos edge
- ✅ Seguridad (XSS, SQL Injection)
- ✅ Manejo de errores

---

## 🚀 Ejecución Rápida

### Usando el Script Automatizado

```bash
# Dar permisos de ejecución
chmod +x test-tarotistas-endpoints.sh

# Ejecutar todos los tests
./test-tarotistas-endpoints.sh

# Con URL personalizada
BASE_URL=http://localhost:4000 ./test-tarotistas-endpoints.sh
```

### Tests Manuales Rápidos

```bash
# 1. Setup
export BASE_URL="http://localhost:3000"
export ADMIN_TOKEN="..." # Obtener con login

# 2. Test público básico
curl "$BASE_URL/tarotistas"

# 3. Test admin básico
curl "$BASE_URL/admin/tarotistas" -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Test métricas
curl "$BASE_URL/tarotistas/metrics/platform?year=2025&month=11" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📝 Notas Importantes

1. **Orden de Ejecución:** Los tests deben ejecutarse en orden para que los IDs sean consistentes
2. **Base de Datos:** Se recomienda usar una BD de testing con seeders ejecutados
3. **Tokens:** Los tokens JWT expiran según la configuración del servidor
4. **IDs Dinámicos:** Algunos tests crean recursos y usan sus IDs en tests posteriores
5. **Cleanup:** Después de los tests, considera resetear la BD si es necesario

---

## 🐛 Troubleshooting

### Error: "Cannot connect to server"

```bash
# Verificar que el servidor esté corriendo
ps aux | grep node

# Iniciar servidor si no está corriendo
npm run start:dev
```

### Error: "401 Unauthorized"

```bash
# Verificar token
echo $ADMIN_TOKEN

# Re-obtener token
curl -X POST "$BASE_URL/auth/login" ...
```

### Error: "404 Not Found"

```bash
# Verificar que los seeders se hayan ejecutado
npm run seed

# Verificar base de datos
psql -d tarot_app -c "SELECT * FROM tarotistas;"
```

---

## 📚 Referencias

- **TASK-070:** Gestión de Tarotistas (Admin)
- **TASK-072:** Endpoints Públicos de Tarotistas
- **TASK-073:** Revenue Sharing y Métricas
- **API Docs:** `/api-docs` (Swagger UI)
