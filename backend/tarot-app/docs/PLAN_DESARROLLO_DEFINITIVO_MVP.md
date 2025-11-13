# 🎯 PLAN DE DESARROLLO DEFINITIVO - MVP TAROTFLAVIA

**Proyecto:** TarotFlavia - Sistema de Lectura de Tarot con IA  
**Estrategia:** MVP Single-Tarotist (Flavia) con infraestructura preparada para Marketplace futuro  
**Fecha de Creación:** 12 de Noviembre 2025  
**Estado:** En desarrollo activo

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Tareas Completadas (30 tareas - ~35 días)

#### Epic 0-1: Configuración Base (7 tareas)

- ✅ **TASK-000**: Docker PostgreSQL Setup
- ✅ **TASK-001**: Refactorizar a Arquitectura Modular
- ✅ **TASK-002**: Sistema de Migraciones TypeORM
- ✅ **TASK-003**: Validación Variables de Entorno
- ✅ **TASK-004**: Configurar Proveedores IA (Groq/DeepSeek/OpenAI)
- ✅ **TASK-005**: Seeders 78 Cartas del Tarot
- ✅ **TASK-005-a**: Seeders Mazos (Rider-Waite)

#### Epic 2-3: Datos Base y Categorías (3 tareas)

- ✅ **TASK-006**: Seeders Spreads Predefinidos
- ✅ **TASK-007**: Entidad y Módulo Categorías
- ✅ **TASK-008**: Seeders Categorías con Iconos
- ✅ **TASK-009**: Entidad Preguntas Predefinidas
- ✅ **TASK-010**: Seeders Preguntas por Categoría

#### Epic 4: Sistema de Planes y Límites (2 tareas)

- ✅ **TASK-011**: Ampliar User con Sistema de Planes
- ✅ **TASK-012**: Entidad y Módulo Usage Limits
- ✅ **TASK-012-a**: Guard y Decorator @CheckUsageLimit

#### Epic 5: Lecturas y Diferenciación Free/Premium (3 tareas)

- ✅ **TASK-013**: Modificar Sistema de Lecturas (Predefinidas vs Custom)
- ✅ **TASK-014**: Rate Limiting Global
- ✅ **TASK-016**: Servicio de Email con Nodemailer
- ✅ **TASK-017**: Módulo Recuperación de Contraseña

#### Epic 6: Optimización IA (1 tarea)

- ✅ **TASK-018**: Optimizar Prompts para Llama/Mixtral

#### Epic 7: Logging y Testing (1 tarea)

- ✅ **TASK-019**: Sistema de Logging Uso de IA

#### Epic 8-9: Features Avanzadas (7 tareas)

- ✅ **TASK-020**: Regeneración de Interpretaciones
- ✅ **TASK-021**: Guardado de Lecturas Favoritas
- ✅ **TASK-022**: Histórico de Lecturas con Paginación
- ✅ **TASK-023**: Endpoints Paginación y Filtros
- ✅ **TASK-024**: Soft Delete en Lecturas
- ✅ **TASK-025**: Sistema de Compartir Lecturas

#### Epic 10-13: Admin y Seguridad (6 tareas)

- ✅ **TASK-026**: Export PDF de Lecturas
- ✅ **TASK-027**: Dashboard Admin Básico
- ✅ **TASK-028**: Gestión Usuarios Admin
- ✅ **TASK-030**: Audit Log (Registro de Auditoría)
- ✅ **TASK-042**: Índices de BD Optimizados

**Total Completadas: 34 tareas (~38 días de desarrollo)**

---

## 🔄 TAREAS PENDIENTES PARA MVP (25 tareas - ~40.5 días)

### 🔴 FASE 1: FUNDAMENTOS CRÍTICOS (7.5 días)

#### Seguridad y Core (5 días)

**1. TASK-048: Validación y Sanitización de Inputs** (1 día) ⭐⭐⭐

- **Prioridad:** CRÍTICA - Seguridad fundamental
- **Qué hace:**
  - Validar todos los inputs con class-validator
  - Sanitizar strings para prevenir inyecciones
  - Validación estricta de DTOs
  - WhiteList y ForbidNonWhitelisted global
- **Dependencias:** Ninguna
- **Tests:** Validación de DTOs, prevención de inyecciones

**2. TASK-051: Sanitización de Outputs** (1.5 días) ⭐⭐

- **Qué hace:**
  - Prevenir XSS en respuestas
  - Escapar HTML en interpretaciones de IA
  - Content Security Policy headers
- **Dependencias:** Ninguna
- **Tests:** Prevención XSS, headers correctos

**3. TASK-047: Rate Limiting Avanzado** (1.5 días) ⭐⭐⭐

- **Qué hace:**
  - Protección DDoS avanzada
  - Límites específicos por endpoint crítico
  - Diferenciación premium vs free
- **Dependencias:** TASK-014 (ya completada)
- **Tests:** Límites respetados, diferenciación planes

**4. TASK-075: Logging Estructurado con Winston** (1 día) ⭐⭐

- **Qué hace:**
  - Logs JSON estructurados
  - CorrelationId para tracing
  - Rotación de archivos
  - Niveles apropiados (debug, info, warn, error)
- **Dependencias:** Ninguna
- **Tests:** Formato JSON, correlationId, rotación

**5. TASK-043: Connection Pooling Optimizado** (1 día) ⭐⭐

- **Qué hace:**
  - Optimizar pool de conexiones de TypeORM
  - Configurar poolSize, timeouts
  - Health check de conexiones
  - Retry strategy para conexiones fallidas
- **Dependencias:** TASK-002 (completada)
- **Tests:** Pool maneja concurrencia, no hay timeouts

**6. TASK-045: Query Optimization (N+1, Eager Loading)** (1.5 días) ⭐⭐⭐

- **Qué hace:**
  - Eliminar N+1 query problems
  - Implementar eager loading estratégico
  - Usar QueryBuilder con leftJoinAndSelect
  - DTO projection para optimizar payloads
  - Paginación eficiente
- **Dependencias:** Ninguna
- **Tests:** No hay N+1 queries, performance mejorada
- **Importancia:** CRÍTICA para performance en producción

---

### 🟡 FASE 2: ADMIN Y MONITOREO (4 días)

#### Dashboard y Health Checks (4 días)

**5. TASK-029: Dashboard de Estadísticas Admin** (2 días) ⭐⭐

- **Qué hace:**
  - Endpoint `/admin/dashboard/stats` con métricas clave
  - Usuarios activos, lecturas por día, costos IA
  - Distribución por categorías y spreads
  - Caché de 15 minutos
- **Dependencias:** TASK-027 (completada)
- **Tests:** Métricas correctas, caché funciona

**6. TASK-030: Health Checks Completos** (2 días) ⭐⭐⭐

- **Qué hace:**
  - Verificar DB, IA providers, Redis (si existe)
  - Endpoints `/health`, `/health/ready`, `/health/live`
  - Formato estándar para Kubernetes
  - Graceful degradation
- **Dependencias:** TASK-004 (completada)
- **Tests:** Health checks funcionan, timeouts correctos

---

### 🔵 FASE 3: FEATURES OPCIONALES MVP (6 días)

#### Engagement y UX (6 días)

**7. TASK-062: Lectura Diaria "Carta del Día"** (2 días) ⭐⭐

- **Qué hace:**
  - Endpoint `/readings/daily-card` gratuito
  - Una carta por día por usuario
  - Interpretación breve con IA
  - Feature de engagement
- **Dependencias:** TASK-012 (completada)
- **Tests:** Límite diario, interpretación correcta
- **Nota:** Puede posponerse si hay presión de tiempo

**8. TASK-063: Sistema de Calendario/Scheduling** (2 días) ⭐⭐

- **Qué hace:**
  - Tarotista define disponibilidad
  - Usuarios reservan sesiones
  - Notificaciones por email
- **Dependencias:** TASK-016 (completada)
- **Tests:** Reservas funcionan, no hay conflictos
- **Nota:** Puede posponerse para post-MVP

**9. TASK-049: Logging y Monitoreo de Seguridad** (2 días) ⭐⭐

- **Qué hace:**
  - Loggear eventos de seguridad
  - Failed logins, cambios de roles, admin actions
  - Tabla `security_events` en BD
  - Alertas automáticas para eventos críticos
- **Dependencias:** TASK-075
- **Tests:** Eventos se loggean, alertas funcionan

---

### 🧪 FASE 4: TESTING Y CALIDAD (12 días)

#### Suite Completa de Tests (12 días)

**10. TASK-054: Tests de Integración Completos** (3 días) ⭐⭐⭐

- **Qué hace:**
  - Tests de integración para todos los módulos
  - Auth flow completo, readings, admin
  - Caché, email, usage limits
- **Dependencias:** Todas las features completadas
- **Tests:** 80%+ coverage en integración

**11. TASK-055: Tests de Performance** (2 días) ⭐⭐

- **Qué hace:**
  - Benchmarks de endpoints críticos
  - Load testing (100+ usuarios concurrentes)
  - Identificar bottlenecks
  - Artillery.io o k6
- **Dependencias:** TASK-042, TASK-043 (completadas)
- **Tests:** Performance aceptable bajo carga

**12. TASK-056: Tests de Seguridad** (2 días) ⭐⭐

- **Qué hace:**
  - Tests de penetración básicos
  - SQL injection, XSS, CSRF
  - Rate limiting, auth bypass
  - OWASP Top 10 coverage
- **Dependencias:** TASK-048, TASK-051
- **Tests:** Vulnerabilidades conocidas cubiertas

**13. TASK-057: E2E Coverage 80%+** (5 días) ⭐⭐⭐

- **Qué hace:**
  - Suite E2E completa de critical paths
  - User journeys completos
  - Happy paths y error cases
  - CI/CD integration
- **Dependencias:** Todas las features MVP
- **Tests:** 80%+ coverage E2E

---

### 📚 FASE 5: DOCUMENTACIÓN (6 días)

#### Docs para Launch (6 días)

**14. TASK-059: Documentación API Completa** (4 días) ⭐⭐

- **Qué hace:**
  - Swagger/OpenAPI completo
  - Ejemplos de requests/responses
  - Authentication docs
  - Error codes y handling
  - Rate limits documentados
- **Dependencias:** Todas las features
- **Entregables:** Swagger UI completo

**15. TASK-060: README y Guías de Deploy** (2 días) ⭐⭐

- **Qué hace:**
  - README completo del proyecto
  - Guía de instalación local
  - Guía de deploy a producción
  - Variables de entorno documentadas
  - Troubleshooting común
  - Arquitectura documentada
- **Dependencias:** Proyecto completo
- **Entregables:** Docs completas, diagramas

---

## 🚀 LANZAMIENTO MVP - CRITERIOS DE ÉXITO

### Must-Have (Bloqueantes para Launch):

- ✅ **Auth & Users:** Sistema completo de registro, login, recuperación
- ✅ **Planes:** FREE y PREMIUM funcionando con límites
- ✅ **Lecturas:** Sistema completo con spreads, interpretaciones IA
- ✅ **Categorías:** Sistema de categorías y preguntas predefinidas
- ✅ **Admin:** Dashboard básico, gestión de usuarios
- ✅ **Seguridad:** Validación inputs, sanitización outputs, rate limiting
- ✅ **Email:** Notificaciones funcionando
- ✅ **Logs:** Sistema de logging estructurado
- ✅ **Performance:** Query optimization, connection pooling, índices BD
- ✅ **Health:** Health checks para monitoreo
- ✅ **Tests:** 80%+ coverage E2E en critical paths
- ✅ **Docs:** API documentada, README completo

### Should-Have (Importantes pero no bloqueantes):

- ⭐ **Carta del Día:** Feature de engagement
- ⭐ **Scheduling:** Sistema de reservas
- ⭐ **Security Logging:** Monitoreo avanzado de seguridad

### Nice-to-Have (Post-MVP):

- 🟢 Módulo Oráculo
- 🟢 Módulo Rituales
- 🟢 Spreads personalizados
- 🟢 Lecturas con voz
- 🟢 WebSockets tiempo real

---

## 📅 TIMELINE MVP

### Resumen de Tiempos

| Fase                               | Duración      | Prioridad |
| ---------------------------------- | ------------- | --------- |
| ✅ **Completado**                  | 38 días       | -         |
| 🔴 **FASE 1: Fundamentos**         | 7.5 días      | CRÍTICA   |
| 🟡 **FASE 2: Admin**               | 4 días        | ALTA      |
| 🔵 **FASE 3: Features Opcionales** | 6 días        | MEDIA     |
| 🧪 **FASE 4: Testing**             | 12 días       | CRÍTICA   |
| 📚 **FASE 5: Documentación**       | 6 días        | ALTA      |
| **TOTAL PENDIENTE MVP**            | **35.5 días** | -         |
| **GRAN TOTAL**                     | **73.5 días** | -         |

### Calendario Estimado (1 desarrollador)

- **Día 1-8:** FASE 1 - Fundamentos críticos (seguridad + performance)
- **Día 9-12:** FASE 2 - Admin y monitoreo
- **Día 13-18:** FASE 3 - Features opcionales (o skip si hay presión)
- **Día 19-30:** FASE 4 - Testing exhaustivo
- **Día 31-36:** FASE 5 - Documentación completa
- **Día 37:** 🚀 **LAUNCH MVP**

### Con 2 Desarrolladores (Paralelización)

- **Semana 1-2:** FASE 1-2 + inicio FASE 4
- **Semana 3:** FASE 3 + continuar FASE 4
- **Semana 4:** Completar FASE 4 + FASE 5
- **Día 21-24:** 🚀 **LAUNCH MVP**

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### Esta Semana (Prioridad Máxima):

1. **TASK-048**: Validación y Sanitización de Inputs (1 día)
2. **TASK-051**: Sanitización de Outputs (1.5 días)
3. **TASK-047**: Rate Limiting Avanzado (1.5 días)
4. **TASK-075**: Logging Estructurado (1 día)
5. **TASK-043**: Connection Pooling (1 día)
6. **TASK-045**: Query Optimization - N+1 queries (1.5 días)

**Total: 7.5 días** - Fundamentos críticos de seguridad y performance

### Próximas 2 Semanas:

5. **TASK-029**: Dashboard Estadísticas (2 días)
6. **TASK-030**: Health Checks (2 días)
7. Decidir si implementar FASE 3 o saltar a testing

### Mes Actual:

- Completar FASE 1-2 (fundamentos + admin)
- Iniciar FASE 4 (testing)
- Objetivo: tener 80% del MVP funcional

---

## 📋 POST-MVP: PREPARACIÓN MARKETPLACE (Futuro)

### Cuando se decida activar Marketplace (estimado: 30-40 días adicionales)

Las siguientes tareas están **pendientes** pero NO son necesarias para el MVP single-tarotist:

#### Infraestructura Marketplace:

- **TASK-061**: AI Provider Abstraction (3 días)
- **TASK-064**: Schema Multi-Tarotista (2 días)
- **TASK-065**: Migrar Flavia a Tabla Tarotistas (2 días)
- **TASK-065-a**: Migración Datos Históricos (1 día)
- **TASK-066**: Sistema Significados Personalizados (2.5 días)
- **TASK-067**: PromptBuilderService Dinámico (5 días)
- **TASK-067-a**: Cache por Tarotista (0.5 días)
- **TASK-069**: Sistema de Roles (CONSUMER/TAROTIST/ADMIN) (2.5 días)

#### Gestión Marketplace:

- **TASK-070**: Módulo Gestión Tarotistas (5 días)
- **TASK-071**: Suscripciones a Tarotistas (4 días)
- **TASK-072**: Endpoints Públicos Marketplace (2 días)
- **TASK-073**: Revenue Sharing (4 días)
- **TASK-074**: Tests E2E Multi-Tarotista (5 días)

**Total Marketplace:** ~38.5 días adicionales

---

## 📊 MÉTRICAS DE ÉXITO MVP

### Técnicas:

- ✅ 80%+ test coverage en critical paths
- ✅ <500ms response time promedio
- ✅ 0 vulnerabilidades críticas/altas
- ✅ 99%+ uptime en producción
- ✅ Logs estructurados en todos los módulos

### Negocio (Primeros 30 días):

- 🎯 100+ usuarios registrados
- 🎯 50+ lecturas generadas
- 🎯 10+ conversiones a premium
- 🎯 <5% tasa de error en lecturas
- 🎯 95%+ satisfacción usuarios (NPS)

---

## 📝 NOTAS IMPORTANTES

### Decisiones de Arquitectura:

1. **Single-Tarotist MVP:** El sistema funciona solo con Flavia inicialmente
2. **Infraestructura Preparada:** El código está estructurado para soportar marketplace en el futuro sin refactorización masiva
3. **Modular:** Cada módulo es independiente y testeable
4. **Tests Primero:** TDD estricto en todas las features nuevas

### Flexibilidad del Plan:

- **FASE 3 (Features Opcionales)** puede omitirse si hay presión de tiempo
- **Carta del Día** y **Scheduling** son nice-to-have
- Enfocarse en FASE 1, 2, 4, 5 para MVP mínimo viable

### Riesgos Identificados:

1. **Testing exhaustivo toma tiempo:** 12 días dedicados, no reducir
2. **Documentación crítica:** Sin docs, no se puede mantener/escalar
3. **Seguridad no negociable:** FASE 1 debe completarse al 100%

---

## 🚦 RECOMENDACIÓN FINAL

### Ruta Rápida (MVP Mínimo - 29.5 días):

1. ✅ FASE 1: Fundamentos (7.5 días) - **OBLIGATORIO**
2. ✅ FASE 2: Admin (4 días) - **OBLIGATORIO**
3. ❌ FASE 3: Skip features opcionales
4. ✅ FASE 4: Testing (12 días) - **OBLIGATORIO**
5. ✅ FASE 5: Docs (6 días) - **OBLIGATORIO**

**Total: 29.5 días → Launch más rápido**

### Ruta Completa (MVP Robusto - 35.5 días):

1-5. Todas las fases incluidas

**Total: 35.5 días → Launch con más features**

---

**Última Actualización:** 12 de Noviembre 2025  
**Próxima Revisión:** Al completar FASE 1

---

## 📞 CONTACTO Y SOPORTE

Para dudas sobre este plan de desarrollo, contactar al tech lead del proyecto.

**Repositorio:** https://github.com/ArielDRighi/TarotFlavia  
**Branch Actual:** feature/TASK-030-audit-log  
**Documentación:** `/backend/tarot-app/docs/`
