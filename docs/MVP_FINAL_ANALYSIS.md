# 🎯 Análisis MVP Final - TarotFlavia

**Fecha:** 29 de Octubre, 2025  
**Proyecto:** TarotFlavia - Aplicación de Lecturas de Tarot con IA  
**Core Function:** Tiradas de Tarot (NO incluye Oráculo por ahora)

---

## 📊 Estado Actual del Desarrollo

### ✅ COMPLETADO (Tasks del Backlog)

| Task           | Descripción                 | Estado        | %    |
| -------------- | --------------------------- | ------------- | ---- |
| **TASK-000**   | Docker PostgreSQL Setup     | ✅ COMPLETADO | 100% |
| **TASK-001**   | Refactorización Modular     | ✅ COMPLETADO | 100% |
| **TASK-005**   | Seeder 78 Cartas            | ✅ COMPLETADO | 100% |
| **TASK-005-a** | Seeder Deck Rider-Waite     | ✅ COMPLETADO | 100% |
| **TASK-006**   | Seeder Spreads Predefinidos | ✅ COMPLETADO | 100% |
| **TASK-007**   | Módulo Categorías           | ✅ COMPLETADO | 100% |

**Total Completado:** 6 tasks críticas | **103 tests pasando**

---

## 🎯 DEFINICIÓN DEL MVP

### Core Function: TIRADAS DE TAROT

El MVP se centra **exclusivamente** en ofrecer lecturas de tarot profesionales con IA.

**¿Qué incluye el MVP?**

- ✅ Registro y autenticación de usuarios
- ✅ Selección de categorías (Amor, Trabajo, Dinero, etc.)
- ✅ Sistema híbrido de preguntas (predefinidas para free, libres para premium)
- ✅ Tiradas de tarot con spreads predefinidos
- ✅ Interpretaciones generadas por IA (OpenAI)
- ✅ Historial de lecturas
- ✅ Sistema de planes (Free vs Premium)

**¿Qué NO incluye el MVP?**

- ❌ Módulo de Oráculo (Fase 2)
- ❌ Rituales y Amuletos (Fase 2)
- ❌ Servicios pagos personalizados (Fase 2)
- ❌ Sistema de pagos integrado (Fase 2)

---

## 🔴 TAREAS CRÍTICAS PARA MVP

### Epic 1: Estabilización de Base (URGENTE)

#### **TASK-002: Migrar a Sistema de Migraciones** 🔴 CRÍTICA

**Prioridad:** MÁXIMA  
**Estimación:** 3 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA MVP**

**¿Por qué es crítico?**

- Actualmente usa `synchronize: true` (PELIGROSO en producción)
- Puede causar pérdida de datos
- Obligatorio antes de deploy

**Tareas específicas:**

- [ ] Desactivar `synchronize: true`
- [ ] Generar migración inicial `InitialSchema`
- [ ] Crear scripts npm para migraciones
- [ ] Documentar proceso de migraciones

**Criterios de aceptación:**

- Sistema arranca sin `synchronize: true`
- Migración inicial refleja todas las tablas
- Scripts de migración funcionan correctamente

---

#### **TASK-003: Validación de Variables de Entorno** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 2 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA MVP**

**¿Por qué es crítico?**

- Previene errores en producción
- Valida configuración antes de arrancar
- Documenta variables necesarias

**Tareas específicas:**

- [ ] Crear clase `EnvironmentVariables` con validaciones
- [ ] Validar variables de DB, JWT, OpenAI
- [ ] Crear `.env.example` completo
- [ ] Implementar mensajes de error descriptivos

**Criterios de aceptación:**

- App no arranca si faltan variables críticas
- Mensajes de error claros
- Documentación completa de variables

---

#### **TASK-004: Configurar y Verificar OpenAI API** 🔴 CRÍTICA

**Prioridad:** MÁXIMA  
**Estimación:** 0.5 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA MVP**

**¿Por qué es crítico?**

- Sin OpenAI NO hay interpretaciones
- Es el valor principal del producto
- Solo requiere configuración

**Tareas específicas:**

- [ ] Documentar obtención de API Key
- [ ] Agregar `OPENAI_API_KEY` con validación
- [ ] Crear health check de conectividad
- [ ] Implementar endpoint `/health/openai`

**Criterios de aceptación:**

- API key válida configurada
- Health check funciona
- Logs claros para troubleshooting

---

### Epic 2: Sistema de Categorías y Preguntas (CORE MVP)

#### **TASK-008: Seeders de Categorías** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 1 día  
**Marcador MVP:** ⭐ **NECESARIO PARA MVP**

**Estado:** ✅ Módulo creado, ⚠️ Falta seeder

**Tareas específicas:**

- [ ] Crear seeder con 6 categorías:
  - ❤️ Amor y Relaciones (`#FF6B9D`)
  - 💼 Carrera y Trabajo (`#4A90E2`)
  - 💰 Dinero y Finanzas (`#F5A623`)
  - 🏥 Salud y Bienestar (`#7ED321`)
  - ✨ Crecimiento Espiritual (`#9013FE`)
  - 🌟 Consulta General (`#50E3C2`)
- [ ] Descripciones atractivas para cada categoría
- [ ] Seeder idempotente

**Criterios de aceptación:**

- 6 categorías en DB después del seed
- Cada una con icono, color y descripción
- Seeder puede ejecutarse múltiples veces

---

#### **TASK-009: Entidad y Módulo de Preguntas Predefinidas** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 3 días  
**Marcador MVP:** ⭐ **NECESARIO PARA MVP**

**¿Por qué es crítico?**

- Diferenciador clave free vs premium
- Mejora UX para usuarios gratuitos
- Controla calidad de preguntas

**Tareas específicas:**

- [ ] Crear entidad `PredefinedQuestion`
- [ ] Crear módulo `PredefinedQuestionsModule`
- [ ] Endpoint `GET /predefined-questions?categoryId=X`
- [ ] DTOs con validaciones
- [ ] Endpoints CRUD protegidos para admin

**Criterios de aceptación:**

- Entidad migrada correctamente
- Usuarios listan preguntas por categoría
- Solo admins modifican preguntas

---

#### **TASK-010: Seeders de Preguntas Predefinidas** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 2 días  
**Marcador MVP:** ⭐ **NECESARIO PARA MVP**

**Tareas específicas:**

- [ ] 5-8 preguntas por categoría (30-48 total)
- [ ] Preguntas bien formuladas y útiles
- [ ] Ordenadas por generalidad
- [ ] Seeder idempotente

**Ejemplos necesarios:**

```
Amor:
- "¿Cómo mejorar mi relación actual?"
- "¿Encontraré el amor pronto?"
- "¿Qué debo saber sobre mi vida amorosa?"

Trabajo:
- "¿Cómo mejorar mi situación laboral?"
- "¿Es buen momento para cambiar de trabajo?"
- "¿Qué oportunidades profesionales vienen?"

Dinero:
- "¿Cómo mejorar mis finanzas?"
- "¿Es buen momento para invertir?"
```

**Criterios de aceptación:**

- Mínimo 5 preguntas por categoría
- Asociadas correctamente a categorías
- Preguntas coherentes para tarot

---

### Epic 3: Sistema de Planes y Límites (DIFERENCIADOR)

#### **TASK-011: Ampliar User Entity con Planes** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 2 días  
**Marcador MVP:** ⭐ **NECESARIO PARA MVP**

**¿Por qué es crítico?**

- Base del modelo de negocio
- Diferencia free vs premium
- Necesario antes de lanzamiento público

**Tareas específicas:**

- [ ] Migración con nuevos campos:
  - `plan` (enum: 'free', 'premium')
  - `plan_started_at`, `plan_expires_at`
  - `subscription_status`
- [ ] Métodos `isPremium()`, `hasPlanExpired()`
- [ ] Incluir plan en JWT payload

**Criterios de aceptación:**

- Campos migrados correctamente
- Métodos de verificación funcionan
- JWT incluye información de plan

---

#### **TASK-012: Sistema de Límites de Uso** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 3 días  
**Marcador MVP:** ⭐ **NECESARIO PARA MVP**

**Tareas específicas:**

- [ ] Crear entidad `UsageLimit`
- [ ] Módulo `UsageLimitsModule`
- [ ] Métodos: `checkLimit()`, `incrementUsage()`, `getRemainingUsage()`
- [ ] Constantes de límites:
  - FREE_DAILY_READINGS: 3
  - PREMIUM_DAILY_READINGS: unlimited
- [ ] Reset automático diario
- [ ] Tarea cron para limpieza

**Criterios de aceptación:**

- Sistema trackea uso por usuario
- Límites se respetan según plan
- Contadores se resetean diariamente

---

#### **TASK-013: Modificar Sistema de Lecturas (Híbrido)** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 3 días  
**Marcador MVP:** ⭐ **NECESARIO PARA MVP**

**¿Por qué es crítico?**

- Implementa el modelo de negocio
- FREE: solo preguntas predefinidas
- PREMIUM: preguntas libres

**Tareas específicas:**

- [ ] Modificar `CreateReadingDto`:
  - `predefined_question_id` (opcional)
  - `custom_question` (opcional)
- [ ] Guard `@RequiresPremiumForCustomQuestion()`
- [ ] Actualizar `TarotReading` entity
- [ ] Validación de plan en endpoint
- [ ] Tests para ambos flujos

**Criterios de aceptación:**

- FREE solo puede usar preguntas predefinidas
- PREMIUM puede usar ambos tipos
- Errores claros y útiles

---

### Epic 4: Seguridad y Producción (OBLIGATORIO)

#### **TASK-014: Rate Limiting Global** 🟡 ALTA

**Prioridad:** ALTA  
**Estimación:** 1 día  
**Marcador MVP:** ⭐ **RECOMENDADO PARA MVP**

**Tareas específicas:**

- [ ] Instalar `@nestjs/throttler`
- [ ] Límites globales y específicos
- [ ] Diferentes límites free vs premium

**Criterios de aceptación:**

- Endpoints protegidos contra spam
- Límites apropiados por tipo
- Feedback claro al usuario

---

#### **TASK-018: Optimizar Prompts de OpenAI** 🟡 ALTA

**Prioridad:** ALTA  
**Estimación:** 3 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA CALIDAD**

**¿Por qué es crítico?**

- Define la calidad de las interpretaciones
- Es el valor diferenciador del producto
- Impacta directamente UX

**Tareas específicas:**

- [ ] Investigar mejores prácticas de prompt engineering
- [ ] System prompt: definir rol de tarotista experta
- [ ] User prompt template que incluya:
  - Pregunta y categoría
  - Spread con descripción de posiciones
  - Cartas con significados
- [ ] Instrucciones para respuesta estructurada
- [ ] Límites de tokens por tipo de tirada

**Criterios de aceptación:**

- Prompts integran spread + cartas + pregunta
- Tono apropiado para tarot
- Respuestas dentro de límite de tokens
- Documentación completa del prompt

---

#### **TASK-019: Logging de Uso de OpenAI** 🟡 ALTA

**Prioridad:** ALTA  
**Estimación:** 2 días  
**Marcador MVP:** ⭐ **NECESARIO PARA MONITOREO**

**Tareas específicas:**

- [ ] Crear entidad `OpenAIUsageLog`
- [ ] Registrar todas las llamadas
- [ ] Calcular costos estimados
- [ ] Endpoint admin de estadísticas

**Criterios de aceptación:**

- Todas las llamadas registradas
- Costos calculados con precisión
- Dashboard de estadísticas funcional

---

### Epic 5: Frontend MVP (CRÍTICO)

#### **FRONTEND-001: Setup y Autenticación** 🔴 CRÍTICA

**Prioridad:** MÁXIMA  
**Estimación:** 3 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA MVP**

**Tecnología recomendada:** Next.js 14+ con App Router

**Tareas específicas:**

- [ ] Setup Next.js + TailwindCSS
- [ ] Páginas: Login, Register
- [ ] Integración con backend auth
- [ ] Manejo de JWT en cliente
- [ ] Rutas protegidas

---

#### **FRONTEND-002: Dashboard y Navegación** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 3 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA MVP**

**Tareas específicas:**

- [ ] Dashboard principal
- [ ] Navegación entre secciones
- [ ] Indicador de plan (free/premium)
- [ ] Contador de lecturas restantes

---

#### **FRONTEND-003: Selector de Categorías y Preguntas** 🔴 CRÍTICA

**Prioridad:** ALTA  
**Estimación:** 4 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA MVP**

**Tareas específicas:**

- [ ] Grid visual de 6 categorías
- [ ] Integración con backend categorías
- [ ] Selector de preguntas predefinidas (FREE)
- [ ] Input de texto libre (PREMIUM)
- [ ] Validación según plan

---

#### **FRONTEND-004: Vista de Lectura/Tirada** 🔴 CRÍTICA

**Prioridad:** MÁXIMA  
**Estimación:** 5 días  
**Marcador MVP:** ⭐ **CRÍTICO PARA MVP**

**Tareas específicas:**

- [ ] Selección de spread
- [ ] Animación de barajado
- [ ] Display de cartas seleccionadas
- [ ] Indicador de carga durante IA
- [ ] Vista de interpretación generada
- [ ] Opción de guardar/compartir

---

#### **FRONTEND-005: Historial de Lecturas** 🟡 ALTA

**Prioridad:** ALTA  
**Estimación:** 2 días  
**Marcador MVP:** ⭐ **RECOMENDADO PARA MVP**

**Tareas específicas:**

- [ ] Lista paginada de lecturas
- [ ] Filtros por categoría/fecha
- [ ] Modal de detalle de lectura
- [ ] Diferentes vistas free vs premium

---

## 📊 RESUMEN DE TAREAS MVP

### Tareas COMPLETADAS ✅

- TASK-000: Docker PostgreSQL ✅
- TASK-001: Refactorización Modular ✅
- TASK-005: Seeder 78 Cartas ✅
- TASK-005-a: Seeder Deck ✅
- TASK-006: Seeder Spreads ✅
- TASK-007: Módulo Categorías ✅

**Total completado:** 6 tasks | 103 tests pasando

### Tareas PENDIENTES CRÍTICAS 🔴

**Backend (16 tasks):**

1. TASK-002: Migraciones ⭐
2. TASK-003: Validación Env ⭐
3. TASK-004: OpenAI Config ⭐
4. TASK-008: Seeder Categorías ⭐
5. TASK-009: Módulo Preguntas ⭐
6. TASK-010: Seeder Preguntas ⭐
7. TASK-011: Planes en User ⭐
8. TASK-012: Sistema Límites ⭐
9. TASK-013: Lecturas Híbridas ⭐
10. TASK-014: Rate Limiting ⭐
11. TASK-018: Optimizar Prompts ⭐
12. TASK-019: Logging OpenAI ⭐

**Frontend (5 components):**

1. Setup + Auth ⭐
2. Dashboard ⭐
3. Categorías + Preguntas ⭐
4. Lectura/Tirada ⭐
5. Historial ⭐

**Total pendiente MVP:** 17 tasks críticas

---

## ⏱️ ESTIMACIÓN TEMPORAL MVP

### Backend Pendiente

- Epic 1 (Estabilización): **5.5 días**
- Epic 2 (Categorías/Preguntas): **6 días**
- Epic 3 (Planes/Límites): **8 días**
- Epic 4 (Seguridad): **6 días**

**Subtotal Backend:** ~25 días (~5 semanas)

### Frontend Completo

- Setup + Auth: **3 días**
- Dashboard: **3 días**
- Categorías: **4 días**
- Lectura: **5 días**
- Historial: **2 días**

**Subtotal Frontend:** ~17 días (~3.5 semanas)

### **TOTAL MVP: 42 días (~8.5 semanas)**

Con 1 dev full-time: **2 meses**  
Con 2 devs (1 backend + 1 frontend): **5-6 semanas**

---

## 🎯 CRITERIOS DE ÉXITO MVP

### Funcionales

- ✅ Usuario se registra y loguea
- ✅ Usuario FREE selecciona categoría
- ✅ Usuario FREE elige pregunta predefinida
- ✅ Usuario PREMIUM escribe pregunta libre
- ✅ Sistema selecciona cartas según spread
- ✅ IA genera interpretación coherente
- ✅ Usuario ve historial de lecturas
- ✅ Límites de uso se respetan (3/día free)

### Técnicos

- ✅ Migraciones de BD funcionando
- ✅ OpenAI respondiendo <10s
- ✅ API protegida con rate limiting
- ✅ 0 errores críticos en producción
- ✅ Tests e2e pasando

### Negocio

- 🎯 10+ usuarios primera semana
- 🎯 70% completan primera lectura
- 🎯 Costo por lectura <$0.002

---

## 🚫 EXPLÍCITAMENTE FUERA DEL MVP

Las siguientes funcionalidades están en **Fase 2** (post-MVP):

### Epic 6: Módulo de Oráculo

- TASK-031: Entidades Oráculo
- TASK-032: Servicio de Respuestas
- TASK-033: Endpoints Oráculo

### Epic 7: Módulo de Rituales

- TASK-034: Entidades Rituales
- TASK-035: Seeders Rituales
- TASK-036: CRUD Rituales
- TASK-037: Recomendaciones

### Epic 8: Administración Avanzada

- TASK-026: RBAC Mejorado
- TASK-028: Gestión Usuarios Admin
- TASK-029: Dashboard Estadísticas
- TASK-030: Audit Log

### Otras Features Fase 2

- Sistema de pagos (Stripe)
- Email transaccional completo
- Caché avanzado con Redis
- Regeneración de interpretaciones
- Sistema de compartir público
- Módulo de servicios pagos

---

## 📋 PRÓXIMOS PASOS INMEDIATOS

### Semana 1 (Backend Core)

1. ✅ TASK-002: Implementar migraciones
2. ✅ TASK-003: Validar variables entorno
3. ✅ TASK-004: Activar OpenAI API
4. ✅ TASK-008: Seedear categorías

### Semana 2 (Preguntas + Planes)

5. ✅ TASK-009: Módulo preguntas
6. ✅ TASK-010: Seedear preguntas
7. ✅ TASK-011: Planes en User
8. ✅ TASK-012: Sistema límites

### Semana 3 (Sistema Híbrido)

9. ✅ TASK-013: Lecturas híbridas
10. ✅ TASK-014: Rate limiting
11. ✅ TASK-018: Optimizar prompts
12. ✅ TASK-019: Logging OpenAI

### Semana 4-6 (Frontend MVP)

13. ✅ Setup Next.js + Auth
14. ✅ Dashboard + Navegación
15. ✅ Categorías + Preguntas
16. ✅ Vista de Lectura
17. ✅ Historial

### Semana 7-8 (Testing + Deploy)

18. ✅ Tests E2E completos
19. ✅ Corrección de bugs
20. ✅ Deploy producción

---

## 💡 RECOMENDACIONES FINALES

### Priorización

1. **Backend primero:** Completa TASK-002 a TASK-013
2. **Frontend paralelo:** Puede iniciar después de TASK-004
3. **Testing continuo:** No esperar al final

### Tecnología

- **Backend:** NestJS (ya implementado) ✅
- **Frontend:** Next.js 14+ con App Router
- **Styling:** TailwindCSS + shadcn/ui
- **Deploy:** Vercel (frontend) + Railway/Render (backend)

### Costos Estimados MVP

- OpenAI: ~$10-30/mes (100-1000 lecturas)
- Hosting: ~$20-40/mes
- **Total:** ~$30-70/mes

---

**Conclusión:** El MVP está **bien definido** y **alcanzable** en 8-10 semanas. La arquitectura modular implementada (TASK-001) facilita el desarrollo incremental. El foco en tiradas de tarot como core function es correcto para validar el producto antes de agregar Oráculo y Rituales.
