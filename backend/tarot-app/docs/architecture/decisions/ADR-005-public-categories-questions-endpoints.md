# ADR-005: Endpoints Públicos para Categorías y Preguntas Predefinidas

**Estado:** ✅ Aceptado  
**Fecha:** 2025-12-29  
**Decisor(es):** Equipo de Desarrollo  
**Tags:** #api #seguridad #marketing #mvp

---

## Contexto

En TarotFlavia, las **categorías** y **preguntas predefinidas** son features exclusivas del plan **PREMIUM**. Sin embargo, para propósitos de marketing y conversión, necesitamos decidir si estos endpoints deben ser:

- **Opción A:** Públicos (sin autenticación) para mostrar ejemplos en landing page
- **Opción B:** Privados (requieren JWT) solo para usuarios autenticados

La validación de que el usuario puede **usar** estas categorías/preguntas se hace en el endpoint `POST /readings` mediante el guard `RequiresPremiumForCategoryGuard`.

---

## Decisión

**Elegimos Opción A: Endpoints Públicos**

### Endpoints Afectados

#### Públicos (sin `@UseGuards(JwtAuthGuard)`)

- `GET /categories` - Listar todas las categorías
- `GET /categories/:id` - Obtener categoría por ID
- `GET /categories/slug/:slug` - Obtener categoría por slug
- `GET /predefined-questions` - Listar preguntas (con filtro opcional por `categoryId`)
- `GET /predefined-questions/:id` - Obtener pregunta específica

#### Protegidos (requieren `@UseGuards(JwtAuthGuard, AdminGuard)`)

- `POST /categories` - Crear categoría (admin)
- `PATCH /categories/:id` - Actualizar categoría (admin)
- `DELETE /categories/:id` - Eliminar categoría (admin)
- `PATCH /categories/:id/toggle-active` - Activar/desactivar (admin)
- `POST /predefined-questions` - Crear pregunta (admin)
- `PATCH /predefined-questions/:id` - Actualizar pregunta (admin)
- `DELETE /predefined-questions/:id` - Eliminar pregunta (admin)

---

## Justificación

### ✅ Ventajas de Opción A (Público)

1. **Marketing y Conversión:**
   - Landing page puede mostrar categorías sin forzar registro
   - Visitantes ven ejemplos de preguntas reales
   - Reduce fricción: "ver antes de comprar"

2. **SEO:**
   - Categorías indexables por Google
   - URLs amigables: `/categories/slug/amor`
   - Mejora discoverability

3. **Separación de Concerns:**
   - Lectura de datos: pública
   - Uso de features: validado en `create-reading`
   - Gestión (CRUD): solo admins

4. **Experiencia de Usuario:**
   - Usuarios FREE pueden explorar sin barreras
   - Mensaje claro: "¿Te gusta? Upgrade a PREMIUM"

### ⚠️ Desventajas Consideradas

1. **Scraping:** Competencia puede copiar catálogo
   - **Mitigación:** Rate limiting + catálogo no diferenciador
2. **Sin métricas de usuarios:** Visitantes anónimos no trackean interés
   - **Mitigación:** Analytics frontend (Google Analytics)

---

## Validación de Seguridad

### ¿Dónde se valida el plan PREMIUM?

**En `POST /readings`:**

```typescript
@Post()
@UseGuards(JwtAuthGuard, RequiresPremiumForCategoryGuard)
async create(@Body() createReadingDto: CreateReadingDto) {
  // Si createReadingDto.categoryId está presente:
  // → Guard valida que user.plan === 'PREMIUM'
  // → Si no es PREMIUM, lanza 403 Forbidden
}
```

**Guard:** `RequiresPremiumForCategoryGuard`

- Intercepta request antes del handler
- Verifica `categoryId` en DTO
- Valida `user.plan === UserPlan.PREMIUM`
- Bloquea ejecución si no cumple

### ¿Por qué es seguro hacer GET públicos?

- **Lectura != Uso:** Ver categorías no consume recursos IA
- **Validación al usar:** El backend bloquea creación de readings con categoría si no es PREMIUM
- **Modelo freemium:** Mostrar features premium es estándar (Netflix, Spotify)

---

## Casos de Uso

### 1. Landing Page (Visitante Anónimo)

```typescript
// Frontend sin token
fetch('/api/categories')
  .then((res) => res.json())
  .then((categories) => {
    categories.forEach((cat) => {
      // Mostrar cards: "Amor", "Trabajo", etc.
      // CTA: "Empieza tu lectura premium"
    });
  });
```

### 2. Selector de Categorías (Usuario FREE)

```typescript
// Frontend con token FREE
const categories = await getCategorias(); // 200 OK
const selected = categories[0];

// Intenta crear reading con categoría
const reading = await createReading({
  categoryId: selected.id, // ❌ Backend lanza 403
  question: '...',
});
// Mensaje: "Upgrade a PREMIUM para usar categorías"
```

### 3. Usuario PREMIUM

```typescript
// Frontend con token PREMIUM
const categories = await getCategorias(); // 200 OK
const reading = await createReading({
  categoryId: 1, // ✅ Backend permite
  question: '...',
});
```

---

## Alternativas Consideradas

### Opción B: Endpoints Privados

**Pros:**

- Control total de acceso
- Métricas de usuarios logueados
- Menos riesgo de scraping

**Cons:**

- Landing page requiere login → fricción
- No SEO-friendly
- Usuarios FREE ven paywall antes de explorar
- Contradice modelo freemium

**Decisión:** Rechazada por menor conversión esperada.

---

## Implementación

### Tests de Integración

```typescript
describe('Public Access', () => {
  it('should allow public GET /categories', async () => {
    await request(app.getHttpServer()).get('/categories').expect(200); // Sin token
  });

  it('should allow public GET /predefined-questions', async () => {
    await request(app.getHttpServer()).get('/predefined-questions').expect(200); // Sin token
  });

  it('should deny POST /categories without admin', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Test' })
      .expect(401); // Sin token → 401
  });
});
```

### Documentación Swagger

```typescript
@Get()
@ApiOperation({
  summary: 'Obtener todas las categorías (público)',
  description: 'Endpoint público para landing page y marketing. No requiere autenticación.',
})
@ApiResponse({ status: 200, type: [ReadingCategory] })
findAll() { ... }
```

---

## Métricas de Éxito

1. **Conversión:** % visitantes landing → registro → PREMIUM
2. **SEO:** Posicionamiento de `/categories/slug/*`
3. **Performance:** Tráfico a endpoints públicos sin degradación

---

## Referencias

- [TASK-012: Endpoints Públicos](../../../docs/TECHNICAL_BACKLOG.md#TASK-012)
- [RequiresPremiumForCategoryGuard](../../src/modules/tarot/readings/application/guards/requires-premium-for-category.guard.ts)
- [Integration Tests](../../test/integration/categories-questions.integration.spec.ts)

---

## Cambios Futuros

- **Rate Limiting:** Implementar throttling por IP (500 req/min)
- **Cache:** Redis para categorías (TTL 1 hora)
- **Analytics:** Trackear endpoints más consultados

---

**Última actualización:** 2025-12-29
