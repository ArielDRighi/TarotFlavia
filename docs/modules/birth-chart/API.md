# API Reference - Módulo Carta Astral

## Base URL

```
https://api.auguria.com/api/v1/birth-chart
```

**Desarrollo:** `http://localhost:3000/api/v1/birth-chart`

## Autenticación

La mayoría de endpoints soportan uso anónimo con fingerprint device. Endpoints Premium requieren JWT Bearer token.

### Headers Comunes

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>  // Opcional para endpoints públicos
X-Device-Fingerprint: <fingerprint>  // Para tracking de anónimos
```

## Endpoints

### 1. Generar Carta Astral

Genera una carta astral completa basada en datos de nacimiento.

```http
POST /birth-chart/generate
```

**Autenticación:** Opcional (JWT)  
**Rate Limit:** 10 req/min por IP, 100 req/hora por usuario

#### Request Body

```json
{
  "name": "María García",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Buenos Aires, Argentina",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "timezone": "America/Argentina/Buenos_Aires"
}
```

**Campos:**
- `name` (string, required): Nombre completo, 2-100 caracteres
- `birthDate` (string, required): Fecha en formato `YYYY-MM-DD`, rango 1800-2400
- `birthTime` (string, required): Hora en formato `HH:mm` (24h)
- `birthPlace` (string, required): Lugar de nacimiento (descriptivo)
- `latitude` (number, required): Latitud, rango -90 a 90
- `longitude` (number, required): Longitud, rango -180 a 180
- `timezone` (string, required): Zona horaria IANA (ej: `America/New_York`)

#### Response (200 OK - Anónimo)

```json
{
  "success": true,
  "message": "Carta astral generada exitosamente",
  "plan": "anonymous",
  "chartSvgData": {
    "planets": [
      {
        "planet": "sun",
        "longitude": 24.5,
        "sign": "taurus",
        "signDegree": 24.5
      }
    ],
    "houses": [...],
    "aspects": [...]
  },
  "planets": [
    {
      "planet": "sun",
      "planetName": "Sol",
      "sign": "taurus",
      "signName": "Tauro",
      "signDegree": 24.5,
      "formattedPosition": "24° 30' Tauro",
      "house": 9,
      "isRetrograde": false
    },
    {
      "planet": "moon",
      "planetName": "Luna",
      "sign": "scorpio",
      "signName": "Escorpio",
      "signDegree": 12.3,
      "formattedPosition": "12° 18' Escorpio",
      "house": 3,
      "isRetrograde": false
    }
    // ... 8 planetas más
  ],
  "houses": [
    {
      "house": 1,
      "longitude": 170.5,
      "sign": "virgo",
      "signName": "Virgo",
      "signDegree": 20.5,
      "formattedPosition": "20° 30' Virgo"
    }
    // ... 11 casas más
  ],
  "aspects": [
    {
      "planet1": "sun",
      "planet1Name": "Sol",
      "planet2": "jupiter",
      "planet2Name": "Júpiter",
      "aspectType": "trine",
      "aspectName": "Trígono",
      "angle": 120,
      "orb": 2.5,
      "isApplying": true,
      "nature": "harmonious"
    }
    // ... más aspectos
  ],
  "bigThree": {
    "sun": {
      "planet": "sun",
      "sign": "taurus",
      "signName": "Tauro",
      "interpretation": "El Sol en Tauro representa una personalidad estable..."
    },
    "moon": {
      "planet": "moon",
      "sign": "scorpio",
      "signName": "Escorpio",
      "interpretation": "La Luna en Escorpio indica emociones intensas..."
    },
    "ascendant": {
      "sign": "virgo",
      "signName": "Virgo",
      "interpretation": "El Ascendente en Virgo proyecta una imagen meticulosa..."
    }
  },
  "calculationTimeMs": 125,
  "canDownloadPdf": false,
  "canAccessHistory": false,
  "limitations": {
    "fullInterpretations": false,
    "aiSynthesis": false,
    "saveToHistory": false,
    "upgradeMessage": "Regístrate gratis para acceder a interpretaciones completas y descargar tu carta en PDF."
  }
}
```

#### Response (200 OK - Free)

```json
{
  "success": true,
  "message": "Carta astral generada exitosamente",
  "plan": "free",
  // ... todos los campos de Anonymous +
  "distribution": {
    "elements": {
      "fire": 3,
      "earth": 4,
      "air": 2,
      "water": 1
    },
    "modalities": {
      "cardinal": 2,
      "fixed": 5,
      "mutable": 3
    },
    "polarity": {
      "masculine": 5,
      "feminine": 5
    }
  },
  "interpretations": {
    "planets": [
      {
        "planet": "sun",
        "planetName": "Sol",
        "intro": "El Sol representa tu identidad esencial...",
        "inSign": {
          "sign": "taurus",
          "signName": "Tauro",
          "content": "El Sol en Tauro te otorga estabilidad...",
          "summary": "Personalidad estable y práctica"
        },
        "inHouse": {
          "house": 9,
          "houseName": "Casa IX",
          "content": "El Sol en la Casa 9 indica una búsqueda de significado...",
          "summary": "Búsqueda de sabiduría y expansión"
        },
        "aspects": [
          {
            "aspectType": "trine",
            "aspectName": "Trígono",
            "planet2": "jupiter",
            "planet2Name": "Júpiter",
            "content": "El trígono Sol-Júpiter es uno de los aspectos más afortunados...",
            "summary": "Optimismo y expansión natural"
          }
        ]
      }
      // ... interpretaciones para todos los planetas
    ]
  },
  "canDownloadPdf": true,
  "canAccessHistory": false,
  "limitations": {
    "fullInterpretations": true,
    "aiSynthesis": false,
    "saveToHistory": false,
    "upgradeMessage": "Actualiza a Premium para obtener síntesis personalizada con IA y guardar tus cartas."
  }
}
```

#### Response (200 OK - Premium)

```json
{
  "success": true,
  "message": "Carta astral generada y guardada exitosamente",
  "plan": "premium",
  // ... todos los campos de Free +
  "savedChartId": 123,
  "aiSynthesis": {
    "content": "Tu carta astral revela una personalidad compleja y fascinante. Con el Sol en Tauro en la Casa 9, buscas estabilidad a través del conocimiento y la exploración filosófica. La Luna en Escorpio añade profundidad emocional e intensidad a tus relaciones...\n\nEl trígono entre el Sol y Júpiter amplifica tu optimismo natural y tu capacidad para ver el lado positivo de las situaciones. Sin embargo, la oposición Luna-Marte sugiere que debes trabajar en manejar tus reacciones emocionales impulsivas...\n\nTu Ascendente en Virgo proyecta una imagen de persona práctica y meticulosa, aunque internamente eres mucho más emocional e intensa de lo que aparentas...",
    "generatedAt": "2026-02-15T12:00:00Z",
    "provider": "groq",
    "model": "llama-3.1-70b-versatile"
  },
  "canDownloadPdf": true,
  "canAccessHistory": true,
  "limitations": {
    "fullInterpretations": true,
    "aiSynthesis": true,
    "saveToHistory": true
  }
}
```

#### Response (429 Too Many Requests)

```json
{
  "statusCode": 429,
  "error": "Usage Limit Exceeded",
  "message": "Has alcanzado el límite de generación de cartas astrales.",
  "details": {
    "usageType": "birth_chart_generation",
    "period": "lifetime",
    "used": 1,
    "limit": 1,
    "remaining": 0,
    "resetsAt": null,
    "upgradeMessage": "Regístrate gratis para obtener generaciones ilimitadas."
  }
}
```

#### Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "birthDate",
      "error": "birthDate must be a valid date string (YYYY-MM-DD)"
    },
    {
      "field": "latitude",
      "error": "latitude must be between -90 and 90"
    }
  ]
}
```

---

### 2. Descargar PDF de Carta

Genera y descarga un PDF profesional de la carta astral.

```http
POST /birth-chart/pdf
```

**Autenticación:** Requerida (JWT)  
**Plan mínimo:** Free  
**Rate Limit:** 5 req/min por usuario

#### Request Body

```json
{
  "name": "María García",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Buenos Aires, Argentina",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "timezone": "America/Argentina/Buenos_Aires"
}
```

#### Response (200 OK)

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="carta-astral-maria-garcia-1990-05-15.pdf"

<binary PDF data>
```

**Contenido del PDF:**
1. Portada con datos de nacimiento y Big Three
2. Gráfico SVG de la rueda zodiacal
3. Tabla de posiciones planetarias
4. Tabla de casas
5. Tabla de aspectos
6. Interpretación del Big Three (todos los planes)
7. Interpretaciones completas por planeta (Free/Premium)
8. Síntesis IA (solo Premium, si existe)
9. Disclaimer legal

**Tamaño aproximado:** 2-5 MB, 10-20 páginas

#### Response (403 Forbidden)

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "La descarga de PDF requiere plan Free o superior.",
  "upgradeUrl": "/pricing"
}
```

---

### 3. Buscar Lugares (Geocoding)

Busca lugares para autocompletar el formulario de nacimiento.

```http
GET /birth-chart/geocode?query={query}
```

**Autenticación:** No requerida  
**Rate Limit:** 30 req/min por IP

#### Query Parameters

- `query` (string, required): Texto de búsqueda, mínimo 3 caracteres

#### Request Example

```http
GET /birth-chart/geocode?query=Buenos%20Aires
```

#### Response (200 OK)

```json
{
  "success": true,
  "results": [
    {
      "placeId": "osm_relation_1224652",
      "displayName": "Buenos Aires, Argentina",
      "city": "Buenos Aires",
      "state": null,
      "country": "Argentina",
      "countryCode": "AR",
      "latitude": -34.6037232,
      "longitude": -58.3815931,
      "timezone": "America/Argentina/Buenos_Aires",
      "importance": 0.89
    },
    {
      "placeId": "osm_relation_3849777",
      "displayName": "Buenos Aires, Provincia de Buenos Aires, Argentina",
      "city": "Buenos Aires",
      "state": "Provincia de Buenos Aires",
      "country": "Argentina",
      "countryCode": "AR",
      "latitude": -34.6136996,
      "longitude": -58.3772316,
      "timezone": "America/Argentina/Buenos_Aires",
      "importance": 0.75
    }
  ],
  "count": 2,
  "cacheHit": true
}
```

#### Response (400 Bad Request)

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Query parameter must be at least 3 characters long"
}
```

---

### 4. Consultar Estado de Uso

Obtiene información sobre los límites de uso del usuario o anónimo.

```http
GET /birth-chart/usage
```

**Autenticación:** Opcional (JWT)  
**Rate Limit:** 60 req/min

#### Response (200 OK - Anónimo)

```json
{
  "success": true,
  "plan": "anonymous",
  "feature": "birth_chart_generation",
  "period": "lifetime",
  "used": 0,
  "limit": 1,
  "remaining": 1,
  "canGenerate": true,
  "resetsAt": null,
  "limitations": {
    "fullInterpretations": false,
    "aiSynthesis": false,
    "downloadPdf": false,
    "saveToHistory": false
  },
  "upgradeMessage": "Regístrate gratis para generaciones ilimitadas y más funciones."
}
```

#### Response (200 OK - Free)

```json
{
  "success": true,
  "plan": "free",
  "feature": "birth_chart_generation",
  "period": "unlimited",
  "used": 15,
  "limit": null,
  "remaining": null,
  "canGenerate": true,
  "resetsAt": null,
  "limitations": {
    "fullInterpretations": true,
    "aiSynthesis": false,
    "downloadPdf": true,
    "saveToHistory": false
  },
  "upgradeMessage": "Actualiza a Premium para síntesis IA personalizada e historial."
}
```

#### Response (200 OK - Premium)

```json
{
  "success": true,
  "plan": "premium",
  "features": {
    "generation": {
      "feature": "birth_chart_generation",
      "period": "unlimited",
      "used": 42,
      "limit": null,
      "remaining": null,
      "canGenerate": true
    },
    "aiSynthesis": {
      "feature": "birth_chart_ai_synthesis",
      "period": "daily",
      "used": 1,
      "limit": 2,
      "remaining": 1,
      "canGenerate": true,
      "resetsAt": "2026-02-16T00:00:00Z"
    }
  },
  "limitations": {
    "fullInterpretations": true,
    "aiSynthesis": true,
    "downloadPdf": true,
    "saveToHistory": true
  }
}
```

---

### 5. Obtener Historial de Cartas

Obtiene el historial de cartas guardadas del usuario (paginado).

```http
GET /birth-chart/history?page={page}&limit={limit}
```

**Autenticación:** Requerida (JWT)  
**Plan mínimo:** Premium  
**Rate Limit:** 60 req/min

#### Query Parameters

- `page` (number, optional): Número de página, default 1
- `limit` (number, optional): Items por página, default 10, máx 50

#### Request Example

```http
GET /birth-chart/history?page=1&limit=10
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Mi carta natal",
      "birthDate": "1990-05-15",
      "birthPlace": "Buenos Aires, Argentina",
      "sunSign": "taurus",
      "sunSignName": "Tauro",
      "moonSign": "scorpio",
      "moonSignName": "Escorpio",
      "ascendantSign": "virgo",
      "ascendantSignName": "Virgo",
      "hasAiSynthesis": true,
      "createdAt": "2026-02-10T12:00:00Z",
      "updatedAt": "2026-02-10T12:00:00Z"
    },
    {
      "id": 124,
      "name": "Carta de mi hijo",
      "birthDate": "2020-03-15",
      "birthPlace": "Madrid, España",
      "sunSign": "pisces",
      "sunSignName": "Piscis",
      "moonSign": "cancer",
      "moonSignName": "Cáncer",
      "ascendantSign": "leo",
      "ascendantSignName": "Leo",
      "hasAiSynthesis": false,
      "createdAt": "2026-02-12T15:30:00Z",
      "updatedAt": "2026-02-12T15:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2
  }
}
```

#### Response (403 Forbidden)

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "El historial de cartas requiere plan Premium.",
  "upgradeUrl": "/pricing"
}
```

---

### 6. Obtener Detalle de Carta Guardada

Obtiene el detalle completo de una carta del historial.

```http
GET /birth-chart/history/:id
```

**Autenticación:** Requerida (JWT)  
**Plan mínimo:** Premium  
**Rate Limit:** 60 req/min

#### Path Parameters

- `id` (number, required): ID de la carta guardada

#### Request Example

```http
GET /birth-chart/history/123
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

Retorna el mismo formato que `POST /birth-chart/generate` (respuesta Premium completa).

#### Response (404 Not Found)

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Carta astral no encontrada o no pertenece al usuario"
}
```

---

### 7. Eliminar Carta del Historial

Elimina una carta del historial del usuario.

```http
DELETE /birth-chart/history/:id
```

**Autenticación:** Requerida (JWT)  
**Plan mínimo:** Premium  
**Rate Limit:** 30 req/min

#### Path Parameters

- `id` (number, required): ID de la carta a eliminar

#### Request Example

```http
DELETE /birth-chart/history/123
Authorization: Bearer <jwt_token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Carta astral eliminada exitosamente",
  "deletedId": 123
}
```

#### Response (404 Not Found)

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Carta astral no encontrada o no pertenece al usuario"
}
```

---

### 8. Generar Síntesis IA

Genera una síntesis IA para una carta existente (acción manual, no automática).

```http
POST /birth-chart/synthesis
```

**Autenticación:** Requerida (JWT)  
**Plan mínimo:** Premium  
**Rate Limit:** 2 req/día (UTC)

#### Request Body

```json
{
  "chartId": 123
}
```

**Campos:**
- `chartId` (number, required): ID de la carta guardada

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Síntesis IA generada exitosamente",
  "aiSynthesis": {
    "content": "Tu carta astral revela una personalidad compleja y fascinante...",
    "generatedAt": "2026-02-15T12:00:00Z",
    "provider": "groq",
    "model": "llama-3.1-70b-versatile"
  },
  "usage": {
    "feature": "birth_chart_ai_synthesis",
    "period": "daily",
    "used": 2,
    "limit": 2,
    "remaining": 0,
    "resetsAt": "2026-02-16T00:00:00Z"
  }
}
```

#### Response (429 Too Many Requests)

```json
{
  "statusCode": 429,
  "error": "Usage Limit Exceeded",
  "message": "Has alcanzado el límite de 2 síntesis IA por día.",
  "details": {
    "usageType": "birth_chart_ai_synthesis",
    "period": "daily",
    "used": 2,
    "limit": 2,
    "remaining": 0,
    "resetsAt": "2026-02-16T00:00:00Z"
  }
}
```

---

## Códigos de Estado HTTP

| Código | Descripción                                    |
| ------ | ---------------------------------------------- |
| 200    | OK - Solicitud exitosa                         |
| 201    | Created - Recurso creado exitosamente          |
| 400    | Bad Request - Error de validación              |
| 401    | Unauthorized - Token inválido o expirado       |
| 403    | Forbidden - Acceso denegado (plan insuficiente)|
| 404    | Not Found - Recurso no encontrado              |
| 429    | Too Many Requests - Límite de uso alcanzado    |
| 500    | Internal Server Error - Error del servidor     |
| 503    | Service Unavailable - Servicio temporalmente no disponible |

## Manejo de Errores

Todos los errores siguen el siguiente formato:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Descripción del error en español",
  "details": {
    // Información adicional específica del error
  }
}
```

## Rate Limiting

Los límites de tasa se aplican por IP (anónimos) o por usuario (autenticados):

| Endpoint              | Límite              |
| --------------------- | ------------------- |
| POST /generate        | 10/min, 100/hora    |
| POST /pdf             | 5/min               |
| GET /geocode          | 30/min              |
| GET /usage            | 60/min              |
| GET /history          | 60/min              |
| DELETE /history/:id   | 30/min              |
| POST /synthesis       | 2/día (UTC)         |

Cuando se excede el límite, el servidor retorna:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1644933600
Retry-After: 60

{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Has excedido el límite de solicitudes. Intenta nuevamente en 60 segundos."
}
```

## Versionamiento

La API usa versionamiento por URL:

- **Versión actual:** `v1`
- **Base URL:** `/api/v1/birth-chart`

Cuando se lance una nueva versión mayor, la anterior se mantendrá por al menos 6 meses.

## Ejemplos de Uso

### Ejemplo 1: Flujo completo de usuario anónimo

```bash
# 1. Buscar lugar de nacimiento
curl -X GET "https://api.auguria.com/api/v1/birth-chart/geocode?query=Madrid" \
  -H "Content-Type: application/json"

# 2. Generar carta (primer uso)
curl -X POST "https://api.auguria.com/api/v1/birth-chart/generate" \
  -H "Content-Type: application/json" \
  -H "X-Device-Fingerprint: abc123xyz" \
  -d '{
    "name": "Juan Pérez",
    "birthDate": "1985-07-20",
    "birthTime": "10:30",
    "birthPlace": "Madrid, España",
    "latitude": 40.4168,
    "longitude": -3.7038,
    "timezone": "Europe/Madrid"
  }'

# 3. Intentar generar otra carta (falla por límite)
curl -X POST "https://api.auguria.com/api/v1/birth-chart/generate" \
  -H "Content-Type: application/json" \
  -H "X-Device-Fingerprint: abc123xyz" \
  -d '{...}'
# → 429 Too Many Requests
```

### Ejemplo 2: Usuario Premium con síntesis IA

```bash
# 1. Generar carta (se guarda automáticamente)
curl -X POST "https://api.auguria.com/api/v1/birth-chart/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "Mi carta natal",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Buenos Aires, Argentina",
    "latitude": -34.6037,
    "longitude": -58.3816,
    "timezone": "America/Argentina/Buenos_Aires"
  }'
# → Respuesta incluye savedChartId: 123

# 2. Ver historial
curl -X GET "https://api.auguria.com/api/v1/birth-chart/history?page=1&limit=10" \
  -H "Authorization: Bearer <jwt_token>"

# 3. Obtener detalle de carta guardada
curl -X GET "https://api.auguria.com/api/v1/birth-chart/history/123" \
  -H "Authorization: Bearer <jwt_token>"

# 4. Generar síntesis IA (si no se generó automáticamente)
curl -X POST "https://api.auguria.com/api/v1/birth-chart/synthesis" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{"chartId": 123}'

# 5. Descargar PDF
curl -X POST "https://api.auguria.com/api/v1/birth-chart/pdf" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "Mi carta natal",
    "birthDate": "1990-05-15",
    ...
  }' \
  --output mi-carta-astral.pdf
```

## Swagger/OpenAPI

La documentación interactiva de Swagger está disponible en:

**Desarrollo:** `http://localhost:3000/api/docs`  
**Producción:** `https://api.auguria.com/api/docs`

Desde allí puedes probar todos los endpoints directamente en el navegador.

## Soporte

Para reportar bugs o solicitar ayuda:
- **Email:** support@auguria.com
- **GitHub Issues:** https://github.com/auguria/api/issues
- **Documentación:** https://docs.auguria.com

---

**Última actualización:** 15 de febrero de 2026  
**Versión de API:** v1.0.0  
**Mantenedor:** Equipo Auguria
