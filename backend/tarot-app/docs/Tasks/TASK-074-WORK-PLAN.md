# TASK-074: Plan de Trabajo - Actualizar Tests E2E Multi-Tarotista

## Estado Actual del Proyecto

### Tests E2E Existentes: 41 archivos

**Tests que YA tienen soporte multi-tarotista:** ✅

- `admin-tarotistas.e2e-spec.ts` - Gestión admin de tarotistas (37 tests)
- `tarotistas-public.e2e-spec.ts` - API pública de tarotistas
- `subscriptions.e2e-spec.ts` - Suscripciones a tarotistas
- `revenue-sharing-metrics.e2e-spec.ts` - Revenue sharing
- `cache-invalidation-flow.e2e-spec.ts` - Cache por tarotista

**Tests que NECESITAN actualización:** ⚠️

- `app.e2e-spec.ts` - Health checks (bajo riesgo)
- `auth-integration.e2e-spec.ts` - Auth flow (actualizar para roles tarotist)
- `reading-creation-integration.e2e-spec.ts` - **CRÍTICO:** Crear lecturas con tarotistaId
- `mvp-complete.e2e-spec.ts` - **CRÍTICO:** Journey completo
- `free-user-edge-cases.e2e-spec.ts` - **CRÍTICO:** Validar límites con tarotistas
- `premium-user-edge-cases.e2e-spec.ts` - Regeneración con tarotistas
- `readings-hybrid.e2e-spec.ts` - Lecturas con múltiples tarotistas
- `readings-pagination.e2e-spec.ts` - Filtrar por tarotistaId
- `readings-share.e2e-spec.ts` - Compartir lecturas (incluir tarotista)
- `reading-regeneration.e2e-spec.ts` - Regenerar con tarotistaId
- `daily-reading.e2e-spec.ts` - Daily readings por tarotista
- `predefined-questions.e2e-spec.ts` - Asociar preguntas a tarotista?
- `performance-critical-endpoints.e2e-spec.ts` - Performance con tarotistas
- `performance-database-queries.e2e-spec.ts` - Queries con tarotista JOIN

## TASK-074-a: Actualizar Tests Existentes

### Prioridad 1 - CRÍTICOS (Deben funcionar con backward compatibility)

#### 1. `reading-creation-integration.e2e-spec.ts`

**Estado:** ⚠️ REQUIERE ACTUALIZACIÓN
**Cambios necesarios:**

- ✅ Verificar que lecturas usan `tarotistaId` (Flavia por defecto)
- ✅ Crear lecturas con `tarotistaId` explícito
- ✅ Validar que `tarotistaId` se guarda correctamente en DB
- ✅ Test de múltiples tarotistas generando lecturas
- ✅ Verificar cache incluye `tarotistaId` en key

**Criterios de éxito:**

- Lecturas sin `tarotistaId` usan Flavia (backward compatibility)
- Lecturas con `tarotistaId` usan el tarotista especificado
- Cache funciona correctamente con múltiples tarotistas
- No rompe tests existentes

---

#### 2. `mvp-complete.e2e-spec.ts`

**Estado:** ⚠️ REQUIERE ACTUALIZACIÓN
**Cambios necesarios:**

- Verificar journey FREE user con Flavia (default)
- Verificar journey PREMIUM user puede elegir tarotista
- Test de suscripción a tarotista específico
- Validar que interpretaciones reflejan estilo del tarotista

**Criterios de éxito:**

- MVP funciona con Flavia (single tarotist mode)
- MVP funciona con múltiples tarotistas (marketplace mode)

---

#### 3. `free-user-edge-cases.e2e-spec.ts`

**Estado:** ⚠️ REQUIERE ACTUALIZACIÓN
**Cambios necesarios:**

- Verificar límites de uso con Flavia (default)
- Test de límites de uso con tarotista personalizado
- Concurrent requests con múltiples tarotistas
- Validar que límites son por usuario, no por tarotista

**Criterios de éxito:**

- Límites funcionan independiente del tarotista
- No se pueden bypassear límites cambiando tarotista

---

#### 4. `premium-user-edge-cases.e2e-spec.ts`

**Estado:** ⚠️ REQUIERE ACTUALIZACIÓN
**Cambios necesarios:**

- Regeneración con mismo tarotista
- Regeneración cambiando tarotista (nueva interpretación)
- Custom questions con tarotista específico
- Downgrade preserva historial de todos los tarotistas

**Criterios de éxito:**

- Regeneración con mismo tarotista usa misma config IA
- Cambio de tarotista genera nueva interpretación
- Historial preserva `tarotistaId` correctamente

---

#### 5. `reading-regeneration.e2e-spec.ts`

**Estado:** ⚠️ REQUIERE ACTUALIZACIÓN
**Cambios necesarios:**

- Regenerar con mismo `tarotistaId` (misma interpretación)
- Regenerar con diferente `tarotistaId` (nueva interpretación)
- Validar límite de regeneraciones es global, no por tarotista

**Criterios de éxito:**

- Regeneración preserva `tarotistaId` original por defecto
- Opción de cambiar tarotista funciona correctamente

---

### Prioridad 2 - MEDIA (Importante pero no crítico)

#### 6. `readings-hybrid.e2e-spec.ts`

**Cambios:** Validar que funciona con múltiples tarotistas mezclados

#### 7. `readings-pagination.e2e-spec.ts`

**Cambios:** Agregar filtro por `tarotistaId`

#### 8. `readings-share.e2e-spec.ts`

**Cambios:** Lecturas compartidas muestran nombre del tarotista

#### 9. `daily-reading.e2e-spec.ts`

**Cambios:** Daily reading puede ser de tarotista específico

#### 10. `performance-critical-endpoints.e2e-spec.ts`

**Cambios:** Performance tests con múltiples tarotistas

---

### Prioridad 3 - BAJA (Nice to have)

#### 11. `auth-integration.e2e-spec.ts`

**Cambios:** Test de registro con rol `tarotist`

#### 12. `admin-user-edge-cases.e2e-spec.ts`

**Cambios:** Admin puede gestionar tarotistas

#### 13. `predefined-questions.e2e-spec.ts`

**Cambios:** Preguntas pueden ser específicas de tarotista (futuro)

---

## TASK-074-b: Crear Nuevos Tests E2E Marketplace

### Tests Nuevos a Crear

#### 1. `tarotista-subscriptions.e2e-spec.ts` ✅ YA EXISTE (`subscriptions.e2e-spec.ts`)

**Estado:** ✅ COMPLETO
**Tests:**

- Subscribe to tarotista
- Unsubscribe from tarotista
- List user subscriptions
- Subscription limits

---

#### 2. `tarotista-management-admin.e2e-spec.ts` ✅ YA EXISTE (`admin-tarotistas.e2e-spec.ts`)

**Estado:** ✅ COMPLETO (37 tests)
**Tests:**

- CRUD tarotistas
- Activate/deactivate
- Update config
- Set custom meanings
- Review applications

---

#### 3. `tarotista-marketplace-public.e2e-spec.ts` ✅ YA EXISTE (`tarotistas-public.e2e-spec.ts`)

**Estado:** ✅ COMPLETO
**Tests:**

- List tarotistas públicos
- Filter by especialidades
- Search by nombre
- Get tarotista profile

---

#### 4. `multi-tarotist-readings.e2e-spec.ts` ⚠️ CREAR

**Estado:** ⚠️ NO EXISTE
**Tests:**

- Create reading with Flavia (default)
- Create reading with Luna
- Create reading with Sol
- Verify interpretations differ by tarotista
- Verify cache keys include tarotistaId
- List readings filtered by tarotista
- Verify tarotista-specific meanings apply

**Estimación:** 10-12 tests, 400 líneas

---

#### 5. `backward-compatibility.e2e-spec.ts` ⚠️ CREAR

**Estado:** ⚠️ NO EXISTE
**Tests:**

- Reading without tarotistaId uses Flavia
- Old readings (null tarotistaId) display correctly
- Cache migrated correctly
- Admin can assign Flavia to orphan readings
- Regenerate old reading uses Flavia by default
- Statistics include readings with/without tarotista

**Estimación:** 8-10 tests, 350 líneas

---

#### 6. `tarotista-applications.e2e-spec.ts` ⚠️ CREAR (o expandir `admin-tarotistas.e2e-spec.ts`)

**Estado:** ⚠️ PARCIAL (algunos tests existen)
**Tests faltantes:**

- User applies to be tarotista
- Admin reviews application
- Admin approves application → user gets tarotist role
- Admin rejects application with reason
- User cannot apply twice
- View pending applications
- View application history

**Estimación:** 8-10 tests, 350 líneas

---

#### 7. `custom-meanings.e2e-spec.ts` ⚠️ CREAR

**Estado:** ⚠️ NO EXISTE
**Tests:**

- Tarotista sets custom meaning for card
- Reading with custom meaning uses it
- Reading without custom meaning uses default
- Admin can view custom meanings
- Custom meaning overrides default in interpretation
- Delete custom meaning reverts to default

**Estimación:** 8-10 tests, 350 líneas

---

#### 8. `roles-and-permissions.e2e-spec.ts` ⚠️ CREAR

**Estado:** ⚠️ NO EXISTE
**Tests:**

- User with `consumer` role cannot access tarotista endpoints
- User with `tarotist` role can manage own profile
- User with `tarotist` role cannot manage other tarotistas
- User with `admin` role can manage all tarotistas
- User can have multiple roles (consumer + tarotist)
- Removing `tarotist` role deactivates tarotista profile

**Estimación:** 8-10 tests, 350 líneas

---

#### 9. `tarotista-revenue.e2e-spec.ts` ✅ YA EXISTE (`revenue-sharing-metrics.e2e-spec.ts`)

**Estado:** ✅ COMPLETO
**Tests:**

- Calculate revenue for tarotista
- Revenue sharing metrics
- Track interpretations by tarotista

---

#### 10. `cache-multi-tarotista.e2e-spec.ts` ✅ PARCIAL (`cache-invalidation-flow.e2e-spec.ts`)

**Estado:** ✅ PARCIAL
**Tests existentes:**

- Invalidate tarotista cache
- Invalidate card meanings cache

**Tests faltantes:**

- Cache key includes tarotistaId
- Different tarotistas get different cache
- Invalidating Flavia doesn't affect Luna
- Invalidating all caches works

**Estimación:** 4-6 tests adicionales, 200 líneas

---

## Resumen de Trabajo

### TASK-074-a: Actualizar Tests Existentes

- **Archivos a actualizar:** ~13 archivos
- **Estimación:** 2-3 días
- **Tests nuevos estimados:** ~50-60 tests adicionales
- **Líneas de código:** ~2000 líneas

### TASK-074-b: Crear Tests Nuevos

- **Archivos a crear:** ~4 archivos nuevos
- **Archivos a expandir:** ~2 archivos existentes
- **Estimación:** 2-3 días
- **Tests nuevos estimados:** ~40-50 tests
- **Líneas de código:** ~1500 líneas

### Total TASK-074

- **Duración total:** 4-6 días (según estimación de 5 días en TASK-074.md)
- **Tests totales nuevos:** ~90-110 tests
- **Líneas de código totales:** ~3500 líneas

---

## Estrategia de Implementación

### Fase 1: Actualizar Tests Críticos (Día 1-2)

1. `reading-creation-integration.e2e-spec.ts`
2. `mvp-complete.e2e-spec.ts`
3. `free-user-edge-cases.e2e-spec.ts`
4. `premium-user-edge-cases.e2e-spec.ts`
5. `reading-regeneration.e2e-spec.ts`

### Fase 2: Crear Tests Nuevos Esenciales (Día 3-4)

1. `multi-tarotist-readings.e2e-spec.ts`
2. `backward-compatibility.e2e-spec.ts`
3. `custom-meanings.e2e-spec.ts`

### Fase 3: Tests Complementarios (Día 4-5)

1. `tarotista-applications.e2e-spec.ts` (expandir existente)
2. `roles-and-permissions.e2e-spec.ts`
3. Actualizar tests de media prioridad

### Fase 4: Ciclo de Calidad (Día 5)

1. Ejecutar todos los tests (unit + E2E)
2. Lint y format
3. Validate architecture
4. Corregir errores
5. Documentar findings

---

## Criterios de Aceptación Global

### Backward Compatibility ✅

- Lecturas sin `tarotistaId` usan Flavia (ID 1)
- Old readings siguen funcionando
- Cache migrado correctamente
- No se rompen tests existentes

### Funcionalidad Multi-Tarotista ✅

- Lecturas con diferentes tarotistas funcionan
- Cache separado por tarotista
- Interpretaciones reflejan estilo del tarotista
- Custom meanings aplicados correctamente

### Performance ✅

- Crear lectura <15s (con IA)
- Listar lecturas <500ms
- Cache hit rate >70%
- No N+1 queries

### Testing ✅

- Todos los tests pasan (unit + E2E)
- 0 errores de eslint
- 0 warnings de TypeScript
- Coverage >80% en módulos críticos

---

## Notas Importantes

### Tests que NO necesitan actualización

- `health.e2e-spec.ts` - Health checks
- `app.e2e-spec.ts` - Basic endpoints
- `email.e2e-spec.ts` - Email service
- `database-infrastructure.e2e-spec.ts` - DB infrastructure
- `security-events.e2e-spec.ts` - Security
- `error-scenarios.e2e-spec.ts` - Error handling

### Tests ya completos para marketplace

- `admin-tarotistas.e2e-spec.ts` - 37 tests ✅
- `tarotistas-public.e2e-spec.ts` - Completo ✅
- `subscriptions.e2e-spec.ts` - Completo ✅
- `revenue-sharing-metrics.e2e-spec.ts` - Completo ✅

---

**Última actualización:** 2025-11-24  
**Estado:** 🟡 EN PROGRESO - TASK-074-a iniciado
