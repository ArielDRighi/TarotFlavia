# 📡 API Documentation - TarotFlavia

## Tabla de Contenidos

- [Overview](#overview)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Rate Limiting](#rate-limiting)
- [Endpoints Principales](#endpoints-principales)
  - [Autenticación](#autenticación)
  - [Usuarios](#usuarios)
  - [Lecturas de Tarot](#lecturas-de-tarot)
  - [Cartas](#cartas)
  - [Tiradas (Spreads)](#tiradas-spreads)
  - [Categorías](#categorías)
  - [Preguntas Predefinidas](#preguntas-predefinidas)
  - [Lectura Diaria](#lectura-diaria)
  - [Admin](#admin)
- [Error Handling](#error-handling)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Swagger UI](#swagger-ui)

---

## Overview

La API de TarotFlavia es una API RESTful construida con NestJS que proporciona:

- **Generación de lecturas de tarot con IA** (OpenAI GPT-4, Anthropic Claude)
- **Sistema completo de usuarios** con roles y permisos
- **78 cartas del tarot Rider-Waite** con interpretaciones detalladas
- **5+ tipos de tiradas** (Cruz Celta, Tres Cartas, etc.)
- **Caché inteligente** para optimizar costos de IA
- **Rate limiting** por usuario y plan
- **Seguridad robusta** con JWT, validación de inputs y sanitización

### Base URL

```
Development:  http://localhost:3000/api
Production:   https://api.tarotflavia.com/api
```

### Content Type

Todos los endpoints aceptan y retornan JSON:

```
Content-Type: application/json
```

---

## Autenticación y Autorización

### Tipos de Autenticación

#### 1. JWT Bearer Token

La mayoría de los endpoints requieren autenticación JWT:

```http
Authorization: Bearer <token>
```

**Obtener Token:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Usuario Ejemplo",
    "roles": ["CONSUMER"]
  }
}
```

#### 2. Refresh Token

Los tokens de acceso expiran en 15 minutos. Usar el refresh token para obtener uno nuevo:

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Roles

| Rol        | Descripción           | Permisos                                    |
| ---------- | --------------------- | ------------------------------------------- |
| `CONSUMER` | Usuario estándar      | Crear lecturas (con límites), ver su perfil |
| `TAROTIST` | Tarotista profesional | Configurar prompts, ver estadísticas        |
| `ADMIN`    | Administrador         | Acceso total, gestión de usuarios           |

### Guards

La API utiliza varios guards para protección:

- **JwtAuthGuard**: Verifica token JWT válido
- **RolesGuard**: Verifica roles del usuario
- **AdminGuard**: Solo administradores
- **AIQuotaGuard**: Verifica límites de uso de IA

---

## Rate Limiting

### Límites por Plan

| Plan        | Lecturas/Día | Preguntas Personalizadas | AI Queries/Día |
| ----------- | ------------ | ------------------------ | -------------- |
| **Free**    | 3            | ❌ No                    | 3              |
| **Premium** | ∞ Ilimitadas | ✅ Sí                    | ∞ Ilimitadas   |

### Rate Limiting por Endpoint

Algunos endpoints tienen límites adicionales:

```
POST /api/readings
- Free users: 10 requests/minuto
- Premium users: 50 requests/minuto

POST /api/auth/login
- Todos: 5 intentos/hora por IP
```

### Response Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1699999999
```

### Error de Rate Limit

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

---

## Endpoints Principales

### Autenticación

#### 📝 Registro

```http
POST /api/auth/register
```

**Body:**

```json
{
  "email": "nuevo@example.com",
  "password": "Password123!",
  "name": "Nombre Usuario"
}
```

**Response: `201 Created`**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "nuevo@example.com",
    "name": "Nombre Usuario",
    "roles": ["CONSUMER"],
    "createdAt": "2025-11-20T10:00:00.000Z"
  }
}
```

#### 🔐 Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

**Response: `200 OK`**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Usuario Ejemplo",
    "roles": ["CONSUMER"]
  }
}
```

#### 🔄 Refresh Token

```http
POST /api/auth/refresh
```

**Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 🚪 Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### 🔑 Olvidé mi Contraseña

```http
POST /api/auth/forgot-password
```

**Body:**

```json
{
  "email": "usuario@example.com"
}
```

---

### Usuarios

#### 👤 Obtener Perfil Actual

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response: `200 OK`**

```json
{
  "id": 1,
  "email": "usuario@example.com",
  "name": "Usuario Ejemplo",
  "roles": ["CONSUMER"],
  "plan": "free",
  "readingsToday": 2,
  "maxReadingsPerDay": 3,
  "createdAt": "2025-11-20T10:00:00.000Z"
}
```

#### ✏️ Actualizar Perfil

```http
PATCH /api/users/me
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo_email@example.com"
}
```

#### 🔒 Cambiar Contraseña

```http
PATCH /api/users/me/password
Authorization: Bearer <token>
```

**Body:**

```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

---

### Lecturas de Tarot

#### ✨ Crear Lectura

```http
POST /api/readings
Authorization: Bearer <token>
```

**Body (con pregunta predefinida):**

```json
{
  "spreadId": 1,
  "predefinedQuestionId": 5,
  "tarotistaId": 1
}
```

**Body (con pregunta personalizada - Premium):**

```json
{
  "spreadId": 2,
  "customQuestion": "¿Qué me depara el futuro en mi carrera?",
  "tarotistaId": 1
}
```

**Response: `201 Created`**

```json
{
  "id": 123,
  "userId": 1,
  "spreadId": 1,
  "tarotistaId": 1,
  "question": "¿Qué me depara el futuro amoroso?",
  "cards": [
    {
      "id": 1,
      "name": "El Mago",
      "arcana": "major",
      "number": 1,
      "suit": null,
      "orientation": "upright",
      "position": 1,
      "positionName": "Presente"
    },
    {
      "id": 15,
      "name": "El Diablo",
      "arcana": "major",
      "number": 15,
      "suit": null,
      "orientation": "reversed",
      "position": 2,
      "positionName": "Obstáculo"
    }
  ],
  "interpretation": {
    "id": 456,
    "generalInterpretation": "Tu lectura muestra...",
    "cardInterpretations": [
      {
        "cardId": 1,
        "interpretation": "El Mago en posición derecha indica..."
      },
      {
        "cardId": 15,
        "interpretation": "El Diablo invertido sugiere..."
      }
    ],
    "aiProvider": "openai",
    "model": "gpt-4-turbo"
  },
  "createdAt": "2025-11-20T10:30:00.000Z"
}
```

**Errores comunes:**

- `403 Forbidden`: Límite de lecturas diarias alcanzado (free users)
- `403 Forbidden`: Usuario free intenta usar pregunta personalizada
- `400 Bad Request`: Spread inválido o pregunta mal formateada

#### 📚 Listar Mis Lecturas

```http
GET /api/readings?page=1&limit=10&includeDeleted=false
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Número de página (default: 1)
- `limit`: Lecturas por página (default: 10, max: 100)
- `includeDeleted`: Incluir lecturas eliminadas (default: false)
- `spreadId`: Filtrar por tipo de tirada
- `sortBy`: Ordenar por (`createdAt`, `updatedAt`)
- `sortOrder`: Orden (`ASC`, `DESC`)

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": 123,
      "spreadId": 1,
      "spreadName": "Tres Cartas",
      "question": "¿Qué me depara el futuro amoroso?",
      "createdAt": "2025-11-20T10:30:00.000Z",
      "cardsCount": 3
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

#### 🔍 Obtener Lectura por ID

```http
GET /api/readings/:id
Authorization: Bearer <token>
```

**Response: `200 OK`** (igual que crear lectura)

#### 🔄 Regenerar Interpretación

```http
POST /api/readings/:id/regenerate
Authorization: Bearer <token>
```

**Body:**

```json
{
  "aiProvider": "anthropic" // Opcional: cambiar provider
}
```

#### 🗑️ Eliminar Lectura (Soft Delete)

```http
DELETE /api/readings/:id
Authorization: Bearer <token>
```

#### ♻️ Restaurar Lectura

```http
POST /api/readings/:id/restore
Authorization: Bearer <token>
```

#### 🔗 Compartir Lectura (Public Link)

```http
GET /api/shared/:shareToken
```

**No requiere autenticación**

**Response: `200 OK`**

```json
{
  "id": 123,
  "question": "¿Qué me depara el futuro?",
  "cards": [...],
  "interpretation": {...},
  "createdAt": "2025-11-20T10:30:00.000Z"
}
```

---

### Cartas

#### 🃏 Listar Todas las Cartas

```http
GET /api/cards
```

**No requiere autenticación**

**Response: `200 OK`**

```json
[
  {
    "id": 1,
    "name": "El Mago",
    "arcana": "major",
    "number": 1,
    "suit": null,
    "keywords": ["poder", "manifestación", "voluntad"],
    "description": "El Mago representa el poder de la manifestación...",
    "uprightMeaning": "Habilidad, concentración, poder...",
    "reversedMeaning": "Manipulación, mala dirección...",
    "imageUrl": "/images/cards/el-mago.jpg"
  },
  {
    "id": 15,
    "name": "As de Copas",
    "arcana": "minor",
    "number": 1,
    "suit": "cups",
    "keywords": ["amor", "emoción", "intuición"],
    "description": "El As de Copas representa...",
    "uprightMeaning": "Amor nuevo, felicidad emocional...",
    "reversedMeaning": "Rechazo emocional, vacío..."
  }
]
```

#### 🔍 Obtener Carta por ID

```http
GET /api/cards/:id
```

#### 🎴 Cartas por Mazo

```http
GET /api/cards/deck/:deckId
```

---

### Tiradas (Spreads)

#### 📋 Listar Tiradas Disponibles

```http
GET /api/spreads
```

**No requiere autenticación**

**Response: `200 OK`**

```json
[
  {
    "id": 1,
    "name": "Tres Cartas",
    "slug": "tres-cartas",
    "description": "Pasado, Presente, Futuro",
    "cardsCount": 3,
    "positions": [
      { "position": 1, "name": "Pasado", "description": "Lo que dejaste atrás" },
      { "position": 2, "name": "Presente", "description": "Tu situación actual" },
      { "position": 3, "name": "Futuro", "description": "Lo que viene" }
    ],
    "difficulty": "beginner",
    "imageUrl": "/images/spreads/tres-cartas.jpg"
  },
  {
    "id": 2,
    "name": "Cruz Celta",
    "slug": "cruz-celta",
    "description": "La tirada más completa y detallada",
    "cardsCount": 10,
    "positions": [...],
    "difficulty": "advanced"
  }
]
```

#### 🔍 Obtener Tirada por ID

```http
GET /api/spreads/:id
```

---

### Categorías

#### 📂 Listar Categorías

```http
GET /api/categories?activeOnly=true
```

**Query Parameters:**

- `activeOnly`: Solo categorías activas (default: false)

**Response: `200 OK`**

```json
[
  {
    "id": 1,
    "name": "Amor",
    "slug": "amor",
    "description": "Preguntas sobre relaciones románticas",
    "color": "#FF6B9D",
    "icon": "heart",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Trabajo",
    "slug": "trabajo",
    "description": "Preguntas sobre carrera profesional",
    "color": "#4A90E2",
    "icon": "briefcase",
    "isActive": true
  }
]
```

---

### Preguntas Predefinidas

#### ❓ Listar Preguntas Predefinidas

```http
GET /api/predefined-questions?categoryId=1&activeOnly=true
```

**Query Parameters:**

- `categoryId`: Filtrar por categoría
- `activeOnly`: Solo preguntas activas

**Response: `200 OK`**

```json
[
  {
    "id": 1,
    "question": "¿Qué me depara el futuro en el amor?",
    "categoryId": 1,
    "categoryName": "Amor",
    "isActive": true,
    "usageCount": 523
  },
  {
    "id": 2,
    "question": "¿Encontraré el amor verdadero pronto?",
    "categoryId": 1,
    "categoryName": "Amor",
    "isActive": true,
    "usageCount": 412
  }
]
```

---

### Lectura Diaria

#### 🌅 Obtener Carta del Día

```http
GET /api/daily-reading/today?tarotistaId=1
Authorization: Bearer <token>
```

**Query Parameters:**

- `tarotistaId`: ID del tarotista (default: 1 - Flavia)

**Response: `200 OK`**

```json
{
  "date": "2025-11-20",
  "card": {
    "id": 42,
    "name": "El Sol",
    "arcana": "major",
    "number": 19,
    "orientation": "upright",
    "imageUrl": "/images/cards/el-sol.jpg"
  },
  "interpretation": {
    "message": "Hoy el Sol ilumina tu camino...",
    "advice": "Mantén una actitud positiva y disfruta...",
    "warning": "No dejes que el exceso de confianza..."
  },
  "alreadyViewed": false
}
```

#### 📅 Historial de Cartas Diarias

```http
GET /api/daily-reading/history?limit=7
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit`: Número de días (default: 7, max: 30)

---

### Admin

Todos los endpoints de admin requieren rol `ADMIN`.

#### 👥 Gestión de Usuarios

```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page`, `limit`: Paginación
- `role`: Filtrar por rol
- `search`: Buscar por nombre o email
- `banned`: Solo usuarios baneados

#### 🔮 Gestión de Tarotistas

##### Crear Tarotista

```http
POST /api/admin/tarotistas
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": 123,
  "nombrePublico": "Luna Mística",
  "biografia": "Tarotista profesional con 10 años de experiencia",
  "especialidades": ["amor", "trabajo", "espiritual"],
  "fotoPerfil": "https://example.com/photo.jpg",
  "systemPromptIdentity": "Eres Luna Mística, una tarotista espiritual...",
  "systemPromptGuidelines": "Siempre proporciona lecturas empáticas..."
}
```

**Response: `201 Created`**

```json
{
  "id": 5,
  "userId": 123,
  "nombrePublico": "Luna Mística",
  "bio": "Tarotista profesional con 10 años de experiencia",
  "especialidades": ["amor", "trabajo", "espiritual"],
  "fotoPerfil": "https://example.com/photo.jpg",
  "isActive": true,
  "createdAt": "2025-11-20T10:00:00Z",
  "updatedAt": "2025-11-20T10:00:00Z"
}
```

##### Listar Tarotistas

```http
GET /api/admin/tarotistas?page=1&limit=20&search=Luna&isActive=true
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 20)
- `search`: Buscar por nombre público
- `isActive`: Filtrar por estado activo (true/false)
- `sortBy`: Campo para ordenar (default: 'createdAt')
- `sortOrder`: Orden (ASC/DESC, default: 'DESC')

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": 5,
      "userId": 123,
      "nombrePublico": "Luna Mística",
      "bio": "Tarotista profesional",
      "especialidades": ["amor", "trabajo"],
      "isActive": true
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

##### Actualizar Tarotista

```http
PUT /api/admin/tarotistas/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "nombrePublico": "Luna Mística - Actualizado",
  "especialidades": ["amor", "trabajo", "espiritual", "salud"]
}
```

##### Desactivar/Reactivar Tarotista

```http
PUT /api/admin/tarotistas/:id/deactivate
Authorization: Bearer <admin_token>
```

```http
PUT /api/admin/tarotistas/:id/reactivate
Authorization: Bearer <admin_token>
```

##### Configuración de Tarotista

```http
GET /api/admin/tarotistas/:id/config
Authorization: Bearer <admin_token>
```

```http
PUT /api/admin/tarotistas/:id/config
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "systemPrompt": "Eres una tarotista empática...",
  "temperature": 0.8,
  "maxTokens": 600,
  "topP": 0.95,
  "provider": "openai",
  "model": "gpt-4-turbo"
}
```

```http
POST /api/admin/tarotistas/:id/config/reset
Authorization: Bearer <admin_token>
```

##### Significados Personalizados de Cartas

```http
POST /api/admin/tarotistas/:id/custom-meanings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "cardId": 1,
  "customMeaningUpright": "En el contexto espiritual...",
  "customMeaningReversed": "Cuando está invertida...",
  "customKeywords": "poder, manifestación, acción",
  "customDescription": "El Mago representa...",
  "privateNotes": "Nota personal del tarotista"
}
```

```http
GET /api/admin/tarotistas/:id/custom-meanings
Authorization: Bearer <admin_token>
```

```http
DELETE /api/admin/tarotistas/:id/custom-meanings/:meaningId
Authorization: Bearer <admin_token>
```

```http
POST /api/admin/tarotistas/:id/custom-meanings/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

[
  { "cardId": 1, "customMeaningUpright": "..." },
  { "cardId": 2, "customMeaningUpright": "..." }
]
```

##### Gestión de Aplicaciones de Tarotistas

```http
GET /api/admin/tarotistas/applications?page=1&limit=20
Authorization: Bearer <admin_token>
```

**Response: `200 OK`**

```json
{
  "data": [
    {
      "id": 10,
      "userId": 456,
      "nombrePublico": "Estrella del Norte",
      "biografia": "Aspirante a tarotista",
      "especialidades": ["amor", "trabajo"],
      "motivacion": "Quiero ayudar a las personas",
      "experiencia": "5 años practicando tarot",
      "status": "pending",
      "adminNotes": null,
      "reviewedByUserId": null,
      "reviewedAt": null,
      "createdAt": "2025-11-15T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

```http
POST /api/admin/tarotistas/applications/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "adminNotes": "Excelente perfil, aprobado para comenzar"
}
```

```http
POST /api/admin/tarotistas/applications/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "adminNotes": "No cumple con los requisitos mínimos de experiencia"
}
```

#### 📊 Dashboard de Métricas

```http
GET /api/admin/dashboard/metrics
Authorization: Bearer <admin_token>
```

**Response: `200 OK`**

```json
{
  "users": {
    "total": 1523,
    "active": 987,
    "premium": 145,
    "new_this_month": 89
  },
  "readings": {
    "total": 5234,
    "today": 156,
    "this_month": 2341
  },
  "ai": {
    "openai_calls": 3421,
    "anthropic_calls": 1813,
    "total_cost": 125.45
  },
  "cache": {
    "hit_rate": 0.78,
    "total_entries": 2456
  }
}
```

#### 🗄️ Gestión de Caché

```http
GET /api/admin/cache/analytics
Authorization: Bearer <admin_token>
```

```http
DELETE /api/admin/cache/interpretations/:id
Authorization: Bearer <admin_token>
```

```http
POST /api/admin/cache/warm
Authorization: Bearer <admin_token>
```

#### 📝 Audit Logs

```http
GET /api/admin/audit-logs?action=user.ban&userId=5
Authorization: Bearer <admin_token>
```

---

## Error Handling

### Formato de Errores

Todos los errores siguen este formato estándar:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    }
  ]
}
```

### Códigos de Estado HTTP

| Código | Significado           | Descripción                               |
| ------ | --------------------- | ----------------------------------------- |
| `200`  | OK                    | Petición exitosa                          |
| `201`  | Created               | Recurso creado exitosamente               |
| `204`  | No Content            | Petición exitosa sin contenido            |
| `400`  | Bad Request           | Validación fallida o parámetros inválidos |
| `401`  | Unauthorized          | Token inválido o expirado                 |
| `403`  | Forbidden             | Sin permisos para esta acción             |
| `404`  | Not Found             | Recurso no encontrado                     |
| `409`  | Conflict              | Conflicto (ej: email ya existe)           |
| `429`  | Too Many Requests     | Rate limit excedido                       |
| `500`  | Internal Server Error | Error del servidor                        |
| `503`  | Service Unavailable   | Servicio temporalmente no disponible      |

### Errores Comunes

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Causas:**

- Token JWT ausente
- Token expirado
- Token inválido

**Solución:** Hacer login nuevamente o usar refresh token.

#### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Límite de lecturas diarias alcanzado. Upgrade a Premium para lecturas ilimitadas.",
  "error": "Forbidden"
}
```

**Causas:**

- Límite de lecturas alcanzado (free users)
- Usuario free intenta usar pregunta personalizada
- Sin permisos de admin

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "spreadId",
      "message": "spreadId must be a positive number"
    }
  ]
}
```

**Causas:**

- Validación de DTOs fallida
- Parámetros inválidos

#### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

**Causas:**

- Rate limit excedido

**Solución:** Esperar antes de hacer más requests.

---

## Ejemplos de Uso

### Flujo Completo: Crear una Lectura

#### 1. Registrarse

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Password123!",
    "name": "Usuario Ejemplo"
  }'
```

#### 2. Obtener Tiradas Disponibles

```bash
curl http://localhost:3000/api/spreads
```

#### 3. Obtener Preguntas Predefinidas

```bash
curl http://localhost:3000/api/predefined-questions?categoryId=1
```

#### 4. Crear Lectura

```bash
curl -X POST http://localhost:3000/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "spreadId": 1,
    "predefinedQuestionId": 5,
    "tarotistaId": 1
  }'
```

#### 5. Ver Mis Lecturas

```bash
curl http://localhost:3000/api/readings?page=1&limit=10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Ejemplo: Regenerar Interpretación con Claude

```bash
curl -X POST http://localhost:3000/api/readings/123/regenerate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "aiProvider": "anthropic"
  }'
```

### Ejemplo: Admin - Ver Dashboard

```bash
curl http://localhost:3000/api/admin/dashboard/metrics \
  -H "Authorization: Bearer <admin_token>"
```

---

## Swagger UI

### Acceso

Cuando el servidor esté corriendo, acceder a la documentación interactiva:

```
http://localhost:3000/api/docs
```

### Features de Swagger UI

- **Probar endpoints directamente** desde el navegador
- **Ver schemas de DTOs** con validaciones
- **Autenticación JWT** integrada (botón "Authorize")
- **Ejemplos de requests/responses** para cada endpoint
- **Filtrar por tags** (Auth, Readings, Admin, etc.)

### Autenticación en Swagger

1. Hacer login en `/api/auth/login` (o usar Swagger)
2. Copiar el `access_token`
3. Click en botón "Authorize" (arriba a la derecha)
4. Pegar token en el campo `Value`
5. Click "Authorize"

Ahora todos los endpoints protegidos se pueden probar con tu token.

### Tags Organizados

Los endpoints están organizados en tags:

- **Auth**: Autenticación y registro
- **Usuarios**: Gestión de perfil de usuario
- **Lecturas de Tarot**: CRUD de lecturas
- **Cartas**: Catálogo de cartas
- **Tiradas (Spreads)**: Configuración de tiradas
- **Categorías**: Categorías de preguntas
- **Preguntas Predefinidas**: Preguntas por categoría
- **Daily Card**: Carta del día
- **Admin - Usuarios**: Gestión de usuarios (admin)
- **Admin - Dashboard**: Métricas y estadísticas
- **Admin - Cache**: Gestión de caché
- **Admin - Audit Logs**: Logs de auditoría
- **health**: Health checks del sistema

---

## Versioning

Actualmente la API está en **v1** (implícito en la ruta base `/api`).

Futuras versiones usarán versionado en la URL:

```
/api/v2/readings
```

---

## Pagination

Los endpoints que retornan listas soportan paginación:

**Query Parameters:**

- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10, max: 100)

**Response:**

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 156,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Sorting

Algunos endpoints soportan ordenamiento:

**Query Parameters:**

- `sortBy`: Campo por el cual ordenar (`createdAt`, `name`, etc.)
- `sortOrder`: Orden (`ASC` o `DESC`)

**Ejemplo:**

```
GET /api/readings?sortBy=createdAt&sortOrder=DESC
```

---

## Filtering

Endpoints de listado soportan filtros específicos:

**Lecturas:**

- `spreadId`: Filtrar por tipo de tirada
- `includeDeleted`: Incluir lecturas eliminadas

**Usuarios (Admin):**

- `role`: Filtrar por rol
- `banned`: Solo usuarios baneados
- `search`: Buscar por nombre o email

---

## CORS

La API permite CORS para el frontend:

```
Access-Control-Allow-Origin: https://tarotflavia.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

En desarrollo, CORS está habilitado para `*`.

---

## Security Headers

La API incluye headers de seguridad (Helmet.js):

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
```

Ver [SECURITY.md](./SECURITY.md) para más detalles.

---

## OpenAPI Specification

Descargar el spec OpenAPI en JSON:

```
GET http://localhost:3000/api/docs-json
```

Esto permite generar clientes automáticamente en cualquier lenguaje.

---

## Contact & Support

Para preguntas sobre la API:

- **Email**: soporte@tarotflavia.com (TBD - configurar antes de producción)
- **GitHub Issues**: https://github.com/ArielDRighi/TarotFlavia/issues
- **Documentación**: Ver carpeta `docs/`

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025  
**OpenAPI Version**: 3.0.0
