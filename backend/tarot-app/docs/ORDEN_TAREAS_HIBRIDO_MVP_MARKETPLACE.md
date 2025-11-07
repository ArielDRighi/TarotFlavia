# 🎯 ORDEN DE TAREAS HÍBRIDO: MVP + PREPARACIÓN MARKETPLACE

**Proyecto:** TarotFlavia - Web Single-Tarotist con Infraestructura Marketplace  
**Estrategia:** Lanzar MVP para Flavia mientras se prepara código para marketplace futuro  
**Fecha:** Noviembre 2025

---

## ✅ TAREAS COMPLETADAS (TASK-001 a TASK-025)

- ✅ TASK-001 a TASK-012: Auth, Users, Readings básico
- ✅ TASK-013: Sistema de suscripciones (FREE/PREMIUM)
- ✅ TASK-014 a TASK-025: Spreads, interpretaciones, categorías, IA

**Estado actual:** ~30 días de desarrollo completados

---

## 🔄 TAREAS PENDIENTES - ORDEN RECOMENDADO

### **FASE 1: FUNDAMENTOS + INFRAESTRUCTURA MARKETPLACE (17.5 días)**

_Preparar base técnica para marketplace sin activar funcionalidades_

#### Semana 1-2: Seguridad y Abstracción (4 días)

**1. TASK-048: Validación y Sanitización de Inputs** (1 día) ⭐⭐⭐

- **Por qué ahora:** Seguridad crítica antes de cualquier feature
- **Qué hace:** Validar todos los inputs, prevenir inyecciones
- **Impacto:** Protege toda la aplicación

**2. TASK-061: AI Provider Abstraction** (3 días) ⭐⭐⭐

- **Por qué ahora:** Base para que cada tarotista tenga su proveedor IA
- **Qué hace:** Abstrae OpenAI/Anthropic en interfaz común
- **Para MVP:** Flavia usa OpenAI por defecto
- **Para futuro:** Otros tarotistas eligen su proveedor

#### Semana 2-3: Schema Multi-Tarotista (7.5 días)

**3. TASK-064: Crear Schema Multi-Tarotista** (2 días) ⭐⭐⭐

- **Por qué ahora:** Cambio estructural en BD, mejor hacerlo temprano
- **Qué hace:** Crea tabla `tarotistas`, `tarotista_configs`, `card_meanings`
- **Para MVP:** Solo existe Flavia en tabla tarotistas
- **Para futuro:** Listos para agregar más tarotistas

**4. TASK-065: Migrar Flavia a Tabla Tarotistas** (2 días) ⭐⭐⭐

- **Por qué ahora:** Migra datos de Flavia al nuevo schema
- **Qué hace:** Flavia pasa de ser "hardcoded" a registro en BD
- **Para MVP:** Transparente para usuarios, Flavia sigue siendo única
- **Para futuro:** Mismo código funciona para múltiples tarotistas

**5. TASK-065-a: Migración de Datos Históricos** (1 día) ⭐⭐

- **Por qué ahora:** Migra lecturas/cache existentes al nuevo schema
- **Qué hace:** Asigna `tarotistaId` a datos sin él, migra roles
- **Para MVP:** Backward compatibility garantizada
- **Para futuro:** Datos limpios para marketplace

**6. TASK-069: Sistema de Roles (CONSUMER, TAROTIST, ADMIN)** (2.5 días) ⭐⭐⭐

- **Por qué ahora:** Reemplaza `isAdmin` por sistema de roles extensible
- **Qué hace:** Crea roles, guards, decoradores `@Roles()`
- **Para MVP:** Admin puede gestionar Flavia
- **Para futuro:** Listos para rol TAROTIST cuando se active marketplace

#### Semana 3: Core Services Personalizados (2.5 días)

**7. TASK-066: Sistema de Significados Personalizados** (2.5 días) ⭐⭐⭐

- **Por qué ahora:** Permite que cada tarotista tenga interpretaciones únicas
- **Qué hace:** `CardMeaningService` con herencia de significados
- **Para MVP:** Flavia puede tener significados personalizados (opcional)
- **Para futuro:** Cada tarotista personaliza sus cartas

---

### **FASE 2: REFACTORIZACIÓN CORE (5.5 días)**

_Refactorizar servicios para soportar multi-tarotista internamente_

#### Semana 4: Servicios Dinámicos (5.5 días)

**8. TASK-067: PromptBuilderService + Refactorizar InterpretationsService** (5 días) ⭐⭐⭐

- **Por qué ahora:** Cambia prompts de hardcoded a dinámicos por tarotista
- **Qué hace:** Crea servicio de construcción de prompts, refactoriza interpretaciones
- **Para MVP:** Prompts de Flavia desde BD (más fácil de ajustar)
- **Para futuro:** Cada tarotista tiene sus propios prompts

**9. TASK-067-a: Sistema de Invalidación de Cache por Tarotista** (0.5 días) ⭐⭐

- **Por qué ahora:** Cache segregado por tarotista para evitar conflictos
- **Qué hace:** Invalida cache automáticamente al cambiar config
- **Para MVP:** Cache de Flavia más robusto
- **Para futuro:** Cache aislado por tarotista

---

### **FASE 3: FEATURES MVP FLAVIA (8 días)**

_Completar funcionalidades necesarias para lanzar web de Flavia_

#### Semana 5: Admin y Gestión (5 días)

**10. TASK-027: Crear Dashboard Admin** (2 días) ⭐⭐⭐

- **Qué hace:** Panel con métricas, usuarios activos, lecturas recientes
- **Para MVP:** Admin puede monitorear el negocio de Flavia
- **Endpoints:** `GET /admin/dashboard/metrics`

**11. TASK-028: Endpoints Gestión de Usuarios** (2 días) ⭐⭐

- **Qué hace:** Admin puede listar, buscar, modificar usuarios
- **Para MVP:** Soporte a usuarios de Flavia
- **Endpoints:** `GET /admin/users`, `PATCH /admin/users/:id`

**12. TASK-030: Health Checks Completos** (1 día) ⭐⭐⭐

- **Qué hace:** Monitoreo de BD, IA, cache, servicios externos
- **Para MVP:** Detectar problemas antes que usuarios
- **Endpoints:** `GET /health`, `GET /health/detailed`

#### Semana 5-6: UX y Notificaciones (3 días)

**13. TASK-024: Email Templates Profesionales** (2 días) ⭐⭐

- **Qué hace:** Templates HTML para bienvenida, lecturas, recuperación
- **Para MVP:** Emails branded de TarotFlavia
- **Tecnología:** Handlebars + Nodemailer

**14. TASK-029: Logs Estructurados** (1 día) ⭐⭐

- **Qué hace:** Logging JSON con Winston, niveles, contexto
- **Para MVP:** Debugging y troubleshooting más fácil
- **Formato:** JSON estructurado con correlationId

---

### **FASE 4: FEATURES OPCIONALES MVP (8 días)**

_Features que mejoran UX pero no son críticas para lanzar_

#### Semana 6-7: Features Engagement (4 días)

**15. TASK-062: Lectura Diaria "Carta del Día"** (2 días) ⭐⭐

- **Qué hace:** Endpoint para carta diaria gratuita, una por día
- **Para MVP:** Feature de engagement para traer usuarios
- **Endpoints:** `GET /readings/daily-card`
- **Nota:** Prioridad reducida, puede posponerse

**16. TASK-063: Sistema de Calendario/Scheduling** (2 días) ⭐⭐

- **Qué hace:** Tarotista puede definir disponibilidad, usuarios reservan
- **Para MVP:** Feature aspiracional (puede posponerse)
- **Endpoints:** `GET /tarotistas/:id/availability`

#### Semana 7: UX Improvements (4 días)

**17. TASK-026: Export PDF de Lecturas** (2 días) ⭐⭐

- **Qué hace:** Usuarios descargan lecturas en PDF
- **Para MVP:** Nice-to-have (puede posponerse)
- **Tecnología:** Puppeteer o PDFKit

**18. TASK-022: Pregunta Personalizada Avanzada** (1 día) ⭐⭐

- **Nota:** Si no está en TASK-001-025, implementar ahora
- **Qué hace:** Usuario puede hacer pregunta libre al tarot

**19. TASK-031-041: Oráculo, Rituales, Servicios** (6 días total) ⭐

- **Nota:** Features adicionales NO críticas para MVP
- **Recomendación:** Posponer para Post-MVP
- **Razón:** Marketplace es más prioritario que estos módulos

---

### **FASE 5: TESTING Y CALIDAD (5 días)**

_Garantizar que todo funciona antes del lanzamiento_

#### Semana 8: Tests E2E Critical (5 días)

**20. TASK-074-a: Actualizar Tests Existentes** (2.5 días) ⭐⭐⭐

- **Qué hace:** Actualiza tests para nuevo schema multi-tarotista
- **Para MVP:** Todos los tests E2E existentes pasan
- **Cobertura:** Auth, readings, suscripciones, admin

**21. TASK-074-b: Tests Nuevos Funcionalidades** (2.5 días) ⭐⭐⭐

- **Qué hace:** Tests para features nuevas (roles, cache, admin)
- **Para MVP:** Coverage >= 80% en paths críticos
- **Incluye:** Tests de backward compatibility

---

### **FASE 6: PERFORMANCE Y SEGURIDAD (8 días)**

_Optimizar antes del lanzamiento_

#### Semana 9: Performance (4 días)

**22. TASK-042: Índices de Base de Datos** (1 día) ⭐⭐⭐

- **Qué hace:** Índices en queries frecuentes
- **Para MVP:** Queries rápidas desde día 1

**23. TASK-043: Query Optimization** (2 días) ⭐⭐

- **Qué hace:** Optimiza N+1 queries, eager loading
- **Para MVP:** Performance óptima

**24. TASK-045: Compresión HTTP** (1 día) ⭐⭐

- **Qué hace:** Compresión gzip de responses
- **Para MVP:** Carga más rápida para usuarios

#### Semana 9-10: Seguridad (4 días)

**25. TASK-047: Rate Limiting Avanzado** (1.5 días) ⭐⭐⭐

- **Qué hace:** Protección contra abuse, límites por endpoint
- **Para MVP:** Previene ataques DDoS

**26. TASK-049: Validación Strict y Logs Seguridad** (1 día) ⭐⭐

- **Qué hace:** Validación estricta, logs de intentos maliciosos
- **Para MVP:** Detección temprana de problemas

**27. TASK-051: Sanitización de Outputs** (1.5 días) ⭐⭐

- **Qué hace:** Previene XSS en respuestas
- **Para MVP:** Seguridad frontend

---

### **FASE 7: DOCUMENTACIÓN Y POLISH (6 días)**

_Preparar para lanzamiento_

#### Semana 10-11: Docs y Deployment (6 días)

**28. TASK-057: Swagger/OpenAPI Completo** (2 días) ⭐⭐

- **Qué hace:** Documentación API completa, ejemplos, schemas
- **Para MVP:** Frontend puede consumir API fácilmente

**29. TASK-059: Documentación Técnica** (2 días) ⭐⭐

- **Qué hace:** README, guías de deployment, arquitectura
- **Para MVP:** Equipo puede mantener y desplegar

**30. TASK-058: Scripts de Desarrollo** (1 día) ⭐

- **Qué hace:** Scripts para seeders, backups, deployment
- **Para MVP:** Operaciones más fáciles

**31. TASK-060: Documentación Usuario** (1 día) ⭐

- **Qué hace:** Guías para usuarios finales (opcional)
- **Para MVP:** Nice-to-have

---

## 🚀 LANZAMIENTO MVP - WEB DE FLAVIA

**Estado después de estas tareas:**

- ✅ Web completa para Flavia
- ✅ Usuarios pueden registrarse, suscribirse (FREE/PREMIUM)
- ✅ Sistema de lecturas completo con IA
- ✅ Panel admin funcional
- ✅ Código **preparado internamente** para marketplace
- ✅ **Marketplace NO visible** para usuarios (activación futura)

---

## 📋 POST-MVP: ACTIVAR MARKETPLACE (cuando decidas)

Cuando quieras activar marketplace, solo necesitas:

### **FASE 8: ACTIVACIÓN MARKETPLACE (11 días)**

**32. TASK-070: Módulo Gestión de Tarotistas** (5 días)

- Admin puede crear/aprobar/gestionar tarotistas
- CRUD completo de tarotistas

**33. TASK-071: Sistema Suscripciones a Tarotistas** (4 días)

- Usuarios pueden suscribirse a tarotista favorito
- FREE: 1 tarotista, PREMIUM: múltiples

**34. TASK-072: Endpoints Públicos Marketplace** (2 días)

- `GET /tarotistas` - Lista tarotistas activos
- `GET /tarotistas/:id` - Perfil público
- Frontend puede mostrar marketplace

### **FASE 9: MONETIZACIÓN (4 días)**

**35. TASK-073: Revenue Sharing y Métricas** (4 días)

- Tracking de lecturas por tarotista
- Cálculo de ganancias (80/20 split)
- Dashboards de revenue

---

## 📊 RESUMEN TIMELINE

| Fase                                   | Duración  | Estado         |
| -------------------------------------- | --------- | -------------- |
| ✅ TASK-001 a TASK-025                 | 30 días   | **COMPLETADO** |
| 🔄 FASE 1: Infraestructura Marketplace | 17.5 días | **PENDIENTE**  |
| 🔄 FASE 2: Refactorización Core        | 5.5 días  | **PENDIENTE**  |
| 🔄 FASE 3: Features MVP                | 8 días    | **PENDIENTE**  |
| ⚙️ FASE 4: Features Opcionales         | 8 días    | **OPCIONAL**   |
| 🔄 FASE 5: Testing                     | 5 días    | **PENDIENTE**  |
| 🔄 FASE 6: Performance + Seguridad     | 8 días    | **PENDIENTE**  |
| 🔄 FASE 7: Docs + Polish               | 6 días    | **PENDIENTE**  |
| 🚀 **LANZAMIENTO MVP FLAVIA**          | -         | -              |
| 🔮 FASE 8: Activar Marketplace         | 11 días   | **POST-MVP**   |
| 💰 FASE 9: Revenue Sharing             | 4 días    | **POST-MVP**   |

**Total para MVP:** ~58 días (desde tareas ya completadas)  
**Total para Marketplace activo:** +15 días (cuando decidas activarlo)  
**GRAN TOTAL:** ~88 días de desarrollo

---

## 🎯 VENTAJAS DE ESTE ENFOQUE

### ✅ **Para el MVP (Flavia):**

- Lanzas rápido con funcionalidad completa
- Código más robusto y escalable desde día 1
- Fácil de mantener y ajustar
- Flavia puede personalizar significados de cartas
- Admin tiene herramientas completas

### ✅ **Para el Futuro (Marketplace):**

- Código ya preparado internamente
- Solo necesitas "activar" features marketplace
- No requiere refactorización masiva después
- Migración suave sin downtime
- Datos ya en estructura correcta

### ✅ **Técnicamente:**

- Schema de BD escalable desde inicio
- Servicios desacoplados y reutilizables
- Tests cubren ambos escenarios
- Backward compatibility garantizada
- Cache, roles, y permisos listos

---

## 📋 ANÁLISIS DE DUPLICADOS Y CONSOLIDACIÓN

### 🔄 **TAREAS CONSOLIDADAS:**

| Tarea Original              | Nueva Tarea               | Razón                                                |
| --------------------------- | ------------------------- | ---------------------------------------------------- |
| TASK-026 (RBAC)             | TASK-069 (Sistema Roles)  | TASK-069 es más completo con CONSUMER/TAROTIST/ADMIN |
| TASK-029 (Dashboard Stats)  | TASK-027 + TASK-073       | Métricas en dashboard admin + revenue tracking       |
| TASK-028 (Gestión Usuarios) | TASK-070                  | Gestión de tarotistas incluye gestión de usuarios    |
| TASK-044 (Redis Cache)      | TASK-055 (Caché Agresivo) | TASK-055 implementa caché multi-nivel más eficiente  |

### ❌ **TAREAS ELIMINADAS (NO PRIORITARIAS PARA MVP):**

#### **FASE 2 - POST MVP (~40 días):**

- **TASK-031-037:** Módulo Oráculo (3 días) + Módulo Rituales (10 días) + Recomendaciones (2 días)
- **TASK-038-041:** Servicios Pagos (3 días) + Solicitudes (4 días) + Email Transaccional (5 días)
- **TASK-052-053:** Prometheus Metrics (3 días) + Distributed Tracing (4 días)

**Razón:** El MVP_FINAL_ANALYSIS indica explícitamente que estas features son FASE 2.

#### **OPCIONAL - PUEDE POSPONERSE:**

- **TASK-030:** Audit Log (útil pero no bloqueante para lanzamiento)
- **TASK-050:** IP Whitelisting (seguridad avanzada, rate limiting básico es suficiente)
- **TASK-058:** Scripts de Desarrollo (consolidado en TASK-060 Docs Técnicas)
- **TASK-062-063:** Carta del Día + Scheduling (engagement, pero no crítico)

**🎉 RESULTADO:** ~50 días de trabajo eliminado sin impactar funcionalidad MVP core.

---

## 🚦 PRÓXIMOS PASOS INMEDIATOS

### **ESTA SEMANA:**

1. ✅ Revisar y validar este plan
2. 🔄 Comenzar TASK-048 (Validación inputs)
3. 🔄 Comenzar TASK-061 (AI Provider Abstraction)

### **PRÓXIMAS 2 SEMANAS:**

- Completar FASE 1 (Infraestructura Marketplace)
- El código estará preparado para marketplace sin activarlo

### **SIGUIENTE MES:**

- Completar FASES 2-7
- Lanzar MVP de Flavia

### **FUTURO (cuando decidas):**

- Activar marketplace en producción
- Abrir registro para nuevos tarotistas

---

## 📝 NOTAS IMPORTANTES

1. **Marketplace es INTERNO:** Los usuarios del MVP de Flavia NO ven que hay infraestructura marketplace. Para ellos, es solo "TarotFlavia - Flavia".

2. **Flexibilidad:** Puedes posponer FASE 4 (features opcionales) si quieres lanzar más rápido.

3. **Activación gradual:** Cuando actives marketplace, puedes hacerlo gradualmente:

   - Primero: Solo invitar tarotistas beta
   - Luego: Abrir registro público
   - Finalmente: Activar revenue sharing

4. **Sin presión:** No necesitas activar marketplace si funciona bien solo con Flavia. El código está preparado para cuando decidas escalar.

---

**¿Alguna duda sobre este orden o quieres ajustar alguna fase?**
