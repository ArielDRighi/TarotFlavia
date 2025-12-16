# 📋 Resumen de Estrategia MVP - TarotFlavia

> **Documento de Análisis y Planificación**  
> Fecha: 16 Diciembre 2025  
> Versión: 1.0  
> **Propósito:** Base para creación de historias de usuario y tareas técnicas

---

## 🎯 ESTRATEGIA MVP - GENERAL

### 1. Modelo Freemium de 3 Tiers

**Contexto:** Sistema de diferenciación clara entre usuarios anónimos, registrados gratuitos y premium para maximizar conversión sin generar costos operativos en tier gratuito.

**Tiers definidos:**

#### **TIER 1: Usuario Anónimo (Sin Registro)**

- Solo 1 carta aleatoria/día
- Información estática básica de la carta
- Sin contexto de lectura (sin categorías ni preguntas)
- Sin historial ni compartir
- Límite: 1 carta/día (tracking por IP/cookie)

#### **TIER 2: Usuario FREE Registrado**

- Tirada de 1 carta aleatoria/día
- Tirada de 3 cartas (1/día)
- Información estática completa de todas las cartas
- Historial limitado (últimas 10 lecturas)
- Compartir lecturas
- **CON publicidad** (Google Ads en resultados, historial, dashboard)
- **SIN categorías ni preguntas** (sin IA, no tiene sentido)
- **SIN interpretación IA**

#### **TIER 3: Usuario PREMIUM**

- Todas las tiradas (1, 3, 5 cartas, Cruz Celta)
- **Categorías** (Amor, Trabajo, Salud, etc.)
- **Preguntas predefinidas y personalizadas**
- **Interpretación IA completa y personalizada**
- **SIN publicidad** (experiencia premium limpia)
- Historial ilimitado
- Compartir lecturas
- 3 tiradas completas/día
- Estadísticas avanzadas

**Impacto:** Costo $0 para tiers gratuitos, conversión clara al mostrar valor de IA. Ingresos adicionales por publicidad en tier free.

---

### 2. Eliminación de Costos IA en Tier Free

**Contexto:** Usuarios free y anónimos NO utilizan IA, solo ven información estática de cartas del catálogo existente.

**Beneficios:**

- Ahorro de ~$52.57 USD/mes por cada 1,000 usuarios free (con impuestos AR)
- Usuarios experimentan ritual completo (selección, visualización)
- Ven exactamente qué se están "perdiendo" (interpretación IA)
- Contenido educativo sobre tarot sin costos

**Impacto:** Eliminación 100% de costos operativos en tier gratuito.

---

### 3. Categorías y Preguntas Solo para Premium

**Contexto:** Las categorías y preguntas son parte del contexto que la IA usa para interpretación. Sin IA, no tienen propósito.

**Decisión:**

- Anónimos: 1 carta aleatoria sin contexto
- Free: Tiradas aleatorias sin pregunta ni categoría
- Premium: Selección de categoría + pregunta (predefinida o personalizada)

**Impacto:** Simplifica UX de free y hace más clara la propuesta de valor premium.

---

### 4. Tarotista por Defecto: Flavia

**Contexto:** En fase MVP, solo existe una tarotista (Flavia). Todo el contenido premium se genera basado en su configuración de personalidad IA.

**Implementación MVP:**

- Todas las lecturas usan `tarotistaId: 1` (Flavia)
- No se muestra selector de tarotista en frontend
- Branding menciona "Interpretaciones de Flavia"
- Sistema ya preparado para múltiples tarotistas (post-MVP)

**Arquitectura existente:**

- `Tarotista` entity (perfil público)
- `TarotistaConfig` entity (system prompt, temperatura, tono)
- `TarotistaCardMeaning` entity (significados personalizados de cartas)

**Post-MVP:** Marketplace de tarotistas con onboarding automatizado.

---

### 5. Home Page Dual (Landing + Dashboard)

**Contexto:** La home page debe servir dos propósitos: adquisición de usuarios nuevos y acceso rápido para usuarios existentes.

**Diseño propuesto:**

#### **Versión A: Usuario NO Autenticado (Landing Page)**

- Hero section con propuesta de valor
- Sección "Prueba sin registro" (Carta del Día + Tirada 3 Cartas)
- Beneficios de Premium listados
- Sección educativa "¿Qué es el Tarot?"
- CTAs a registro/login
- CTA a suscripción Premium

#### **Versión B: Usuario Autenticado (Dashboard)**

- Saludo personalizado con badge de plan (Free/Premium)
- Accesos rápidos: Nueva Lectura, Historial, Carta del Día, Explorar Tarotistas
- Sección educativa "Sabías que..." (rotativa)
- Estadísticas de actividad (solo Premium)
- Sin upsells molestos para Premium

**Impacto:** Mejora conversión inicial y retención de usuarios activos.

---

### 6. Diferenciadores Free vs Anónimo (Sin Costo)

**Contexto:** Necesitamos incentivar registro sin generar costos adicionales.

**Diferenciadores seleccionados:**

| Diferenciador               | Costo                   | Valor para Usuario              | Beneficio para Negocio        |
| --------------------------- | ----------------------- | ------------------------------- | ----------------------------- |
| **Tiradas de 3 cartas**     | $0 (misma lógica que 1) | Alto - experiencia completa     | Mayor engagement              |
| **Historial (10 lecturas)** | Mínimo (espacio DB)     | Alto - revisar lecturas pasadas | Datos de analytics, retención |
| **Compartir lecturas**      | $0 (solo enlaces)       | Medio-Alto                      | Marketing viral               |

**Impacto:** Incrementa conversión anónimo → free sin afectar costos.

---

### 7. Funnel de Conversión Definido

**Flujo propuesto:**

```
ANÓNIMO ($0 costo)
   │ Ve 1 carta aleatoria
   │ Quiere más contexto/opciones
   ▼
[CTA: REGISTRARSE GRATIS]
   │
   ▼
FREE REGISTRADO ($0 costo)
   │ Tiradas de 3 cartas
   │ Ve historial creciendo
   │ Comparte con amigos
   │ Ve info completa de cartas
   │ Quiere "el mensaje profundo"
   │
   ▼
[CTA: PROBAR PREMIUM 7 DÍAS]
   │
   ▼
PREMIUM ($0.14/mes costo, $4.99/mes ingreso)
   │ Interpretaciones IA personalizadas
   │ Preguntas específicas
   │ Todas las tiradas
   │
   ▼
[RETENCIÓN]
```

**Puntos de conversión:**

- Después de 2-3 tiradas free: Popup suave "¿Quieres el mensaje completo?"
- En resultado de tirada free: Sección aspiracional con beneficios Premium
- En historial: "Desbloquea interpretaciones de tus lecturas anteriores"

---

### 8. Monetización con Google Ads para Usuarios Free

**Contexto:** Generar ingresos adicionales de usuarios free mediante publicidad no intrusiva, creando un incentivo adicional para upgrade a Premium (experiencia sin ads).

**Estrategia de implementación:**

**Ubicaciones de anuncios:**

- **Resultado de tirada free:** Banner después de mostrar las cartas, antes del upsell
- **Historial:** Banner entre la lista de lecturas (cada 5 items)
- **Dashboard free:** Banner lateral o inferior (no intrusivo)
- **Página compartida pública:** Banner al final (monetización de tráfico viral)

**Tipos de anuncios:**

- Google AdSense Display Ads
- Formato: Responsive (adapta a mobile/desktop)
- Categorías permitidas: Espiritualidad, Bienestar, Autoayuda
- Categorías bloqueadas: Gambling, contenido adulto

**Política de experiencia:**

- **NO mostrar ads en:** Flujo de ritual (no interrumpir experiencia)
- **NO mostrar ads a:** Usuarios premium
- **Máximo:** 2 ad units por página
- **Diseño:** Claramente identificados como "Publicidad"

**Proyección de ingresos:**

```
Supuestos conservadores:
- 1,000 usuarios free activos/mes
- 3 page views promedio/sesión
- 2 sesiones/mes por usuario
- Total: 6,000 page views/mes
- CPM promedio: $2 USD (nicho espiritual)
- Ingreso estimado: $12 USD/mes

Con 10,000 usuarios: ~$120 USD/mes
```

**Diferenciador Premium:**

- Beneficio claro: "Sin publicidad" como feature destacado
- Valor percibido: Experiencia premium y fluida
- CTA en ads: "Elimina los anuncios - Upgrade a Premium"

**Implementación técnica:**

- Google AdSense account
- Script de Google Tag Manager
- Componente React condicional (solo render si `user.plan !== 'premium'`)
- Lazy loading de scripts de ads (no afectar performance)

**Compliance:**

- Política de privacidad actualizada (uso de cookies de terceros)
- GDPR/CCPA compliance (consent banner si aplica)
- Términos y condiciones actualizados

**Impacto:** Ingresos pasivos adicionales + incentivo extra para conversión Premium.

---

## 🔮 POST-MVP: MARKETPLACE DE TAROTISTAS

### Sistema de Rating por Categorías

**Contexto:** Cuando existan múltiples tarotistas en la plataforma, los usuarios premium podrán evaluar su experiencia mediante un sistema de rating por estrellas en categorías específicas. Esto permitirá mostrar estadísticamente los mejores tarotistas para cada área (Amor, Trabajo, Salud, etc.).

---

### 33. Sistema de Evaluación de Tarotistas (Post-MVP)

**Objetivo:** Permitir a usuarios premium calificar tarotistas en categorías específicas para generar rankings estadísticos y mejorar la selección de tarotistas en el marketplace.

#### **UX Flow:**

**Después de una lectura premium:**

1. Usuario completa lectura con un tarotista
2. Se muestra modal/card: "¿Cómo fue tu experiencia con {Tarotista}?"
3. Usuario puede calificar 1-5 categorías (mínimo 1)
4. Rating se guarda y contribuye a estadísticas del tarotista

**En el marketplace:**

1. Vista de "Top Tarotistas" por categoría
2. Filtros: Amor, Trabajo, Salud, Espiritual
3. Ranking basado en promedio de ratings
4. Badges de "Top en Amor", "Top en Trabajo", etc.

**En perfil de tarotista:**

1. Rating general destacado
2. Breakdown por categoría
3. Detalles de cada aspecto evaluado
4. Número total de calificaciones

---

#### **Impacto en el Negocio:**

**Beneficios:**

- ✅ **Mejora la calidad:** Tarotistas con mejor rating reciben más clientes
- ✅ **Transparencia:** Usuarios toman decisiones informadas
- ✅ **Especialización:** Descubrir mejores tarotistas por área
- ✅ **Engagement:** Incentiva a usuarios a probar distintos tarotistas
- ✅ **Retención:** Sistema de reputación crea comunidad

**Métricas a monitorear:**

- Promedio de ratings por tarotista
- Distribución de ratings (evitar sesgos)
- Correlación rating vs número de sesiones
- Tasa de respuesta (% usuarios que califican)
