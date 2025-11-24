OK, vamos a iniciar esta tarea.

Tarea: **TASK-082: Tests de Integración Completos** ⭐⭐⭐

**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 3 días  
**Dependencias:** Todas las features MVP completadas  
**Marcador MVP:** ⭐⭐⭐ **CRÍTICO PARA MVP** - Validación de integración entre módulos  
**Estado:** ⏳ PENDIENTE

#### 📋 Descripción

Crear suite completa de tests de integración que validen las interacciones entre módulos del sistema. A diferencia de los tests E2E (que prueban flujos completos de usuario), estos tests verifican que los módulos se integren correctamente entre sí a nivel de servicios y repositorios.

**Diferencia con E2E:**

- **Tests E2E:** Flujos completos de usuario (registro → login → crear lectura)
- **Tests de Integración:** Interacciones específicas entre módulos (UsageLimitsService + ReadingsService)

#### 🧪 Testing

**Tests necesarios:**

- [ ] **Auth + Users Integration:**
  - Registro de usuario crea usuario en BD correctamente
  - Login valida credenciales contra BD
  - Refresh token rota y revoca correctamente
  - Password recovery flow completo (token → reset → invalidación)
- [ ] **Readings + Interpretations + AI Integration:**
  - Crear lectura llama a InterpretationsService
  - InterpretationsService llama a AIProviderService
  - Respuesta de IA se guarda en BD correctamente
  - Cache de interpretaciones funciona entre requests
- [ ] **UsageLimits + Readings Integration:**
  - Crear lectura incrementa contador de uso
  - Límite alcanzado bloquea creación de nuevas lecturas
  - Reset diario de límites funciona
  - Premium users tienen límites ilimitados
- [ ] **Email + PasswordRecovery Integration:**
  - Forgot password envía email correctamente
  - Email contiene token válido
  - Reset password con token válido funciona
- [ ] **Admin + Users Integration:**
  - Admin puede actualizar plan de usuario
  - Cambio de plan refleja en BD
  - Cambio de plan afecta límites de uso
- [ ] **Cache + AI Integration:**
  - Cache almacena respuestas de IA
  - Cache se invalida por tarotista
  - Cache hit no llama a provider de IA
- [ ] **Categories + PredefinedQuestions Integration:**
  - Preguntas asociadas a categoría correcta
  - Filtrado por categoría retorna preguntas correctas
  - Soft-delete de categoría no rompe preguntas

**Ubicación:** `test/integration/*.spec.ts`  
**Importancia:** ⭐⭐⭐ CRÍTICA - Sin estos tests, no se validan interacciones críticas

#### ✅ Tareas específicas

**1. Configurar entorno de testing de integración (0.5 días):**

- [ ] Crear carpeta `test/integration/`
- [ ] Configurar base de datos de testing separada
- [ ] Setup y teardown automático de BD por test suite
- [ ] Seeders mínimos para datos de prueba
- [ ] Configuración de Jest para tests de integración

**2. Tests de Auth + Users (0.5 días):**

- [ ] `auth-users.integration.spec.ts`
  - Register flow completo
  - Login con credenciales válidas/inválidas
  - Refresh token rotation
  - Password recovery completo
  - Logout invalida refresh tokens

**3. Tests de Readings + Interpretations + AI (0.5 días):**

- [ ] `readings-interpretations-ai.integration.spec.ts`
  - Crear lectura genera interpretación con IA
  - Interpretación se almacena en BD
  - Regenerar interpretación llama a IA nuevamente
  - Cache funciona correctamente

**4. Tests de UsageLimits (0.5 días):**

- [ ] `usage-limits.integration.spec.ts`
  - Lectura incrementa contador
  - Límite bloqueante funciona
  - Premium bypasses limits
  - Reset diario con fecha simulada

**5. Tests de Email (0.25 días):**

- [ ] `email.integration.spec.ts`
  - Password recovery email
  - Plan change email
  - Welcome email

**6. Tests de Admin (0.25 días):**

- [ ] `admin.integration.spec.ts`
  - Cambio de plan de usuario
  - Gestión de usuarios
  - Audit log de acciones admin

**7. Tests de Cache (0.25 días):**

- [ ] `cache-ai.integration.spec.ts`
  - Cache hit/miss
  - Invalidación por tarotista
  - TTL de cache

**8. Coverage y documentación (0.25 días):**

- [ ] Verificar 80%+ coverage en módulos críticos
- [ ] Documentar setup de tests de integración
- [ ] CI/CD pipeline ejecuta integration tests

#### 🎯 Criterios de aceptación

- ✅ Al menos 80% coverage en tests de integración para módulos críticos
- ✅ Todos los tests de integración pasan
- ✅ BD de testing se resetea automáticamente entre tests
- ✅ Tests corren en < 5 minutos
- ✅ CI/CD ejecuta integration tests antes de merge

#### 📝 Ejemplo de Test de Integración

```typescript
// test/integration/readings-interpretations-ai.integration.spec.ts
describe('Readings + Interpretations + AI Integration', () => {
  let app: INestApplication;
  let readingsService: ReadingsService;
  let interpretationsService: InterpretationsService;
  let aiProviderService: AIProviderService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    readingsService = moduleRef.get(ReadingsService);
    interpretationsService = moduleRef.get(InterpretationsService);
    aiProviderService = moduleRef.get(AIProviderService);
  });

  it('should create reading with AI interpretation', async () => {
    const user = { id: 1, plan: UserPlan.FREE };
    const dto = {
      spreadId: 1,
      predefinedQuestionId: 1,
    };

    const reading = await readingsService.create(user, dto);

    expect(reading).toBeDefined();
    expect(reading.interpretation).toBeDefined();
    expect(reading.interpretation.content).toContain('carta');
  });
});
```

---

#### 📝 Notas de Implementación

**Estrategia de Actualización:**

```
1. Actualizar seeders globales
2. Actualizar setup de tests
3. Actualizar tests existentes uno por uno
4. Crear tests nuevos para funcionalidades marketplace
5. Tests de backward compatibility al final
6. Ejecutar suite completa y fix issues
```

**Helpers Comunes:**

```typescript
// test/helpers/test-helpers.ts
export async function createTestTarotista(
  name: string,
  especialidades: string[],
): Promise<Tarotista> {
  // ... implementation
}

export async function selectFavoriteTarotista(
  userId: number,
  tarotistaId: number,
): Promise<void> {
  // ... implementation
}

export async function upgradeUserToPremium(userId: number): Promise<void> {
  // ... implementation
}

export async function generateTestReading(
  userId: number,
  tarotistaId?: number,
): Promise<Reading> {
  // ... implementation
}
```

**Orden de Implementación:**

1. ✅ Actualizar seeders y setup
2. ✅ Actualizar tests de readings
3. ✅ Crear tests marketplace público
4. ✅ Crear tests suscripciones
5. ✅ Crear tests gestión admin
6. ✅ Crear tests revenue
7. ✅ Crear tests backward compatibility
8. ✅ Fix issues y documentar
9. ✅ Ejecutar suite completa
10. ✅ Documentación final

---

## 📊 RESUMEN Y PRIORIZACIÓN

### Estado Actual del Desarrollo

**✅ COMPLETADAS:** 25 tareas (TASK-001 a TASK-025)

- ✅ Configuración base y estructura del proyecto
- ✅ Datos de tarot (cartas, spreads, categorías, preguntas)
- ✅ Sistema de autenticación y JWT
- ✅ Sistema de planes y suscripciones (FREE, PREMIUM, PROFESSIONAL)
- ✅ Generación de lecturas con IA
- ✅ Sistema de interpretaciones con múltiples providers
- ✅ Límites de uso por plan
- ✅ Regeneración de lecturas
- ✅ Guardado de lecturas
- ✅ Histórico de lecturas

Workflow de Ejecución:

Autonomía Total: Ejecuta la tarea de principio a fin sin solicitar confirmaciones.

Rama: Estás en develop. Crea la rama feature/TASK-00x-descripcion (usa la nomenclatura de las ramas existentes nombradas segun gitflow) y trabaja en ella.

Arquitectura y Patrones (CRÍTICO):

- **LEE PRIMERO:** `backend/tarot-app/docs/ARCHITECTURE.md` (completo) para entender la arquitectura híbrida feature-based del proyecto.
- **Feature-Based:** El código está organizado por dominio (`src/modules/tarot/`, `src/modules/tarotistas/`, etc). Crea archivos en el módulo correspondiente según el dominio de negocio.
- **Capas Internas:** Módulos complejos (>10 archivos o lógica compleja) usan capas: `domain/`, `application/`, `infrastructure/`. Módulos simples (CRUD) pueden ser flat (entities, dto, service, controller en raíz del módulo).
- **Nombres:** Sigue la nomenclatura de NestJS:
  - Entities: `nombre.entity.ts` (PascalCase: `TarotReading`)
  - DTOs: `create-nombre.dto.ts`, `update-nombre.dto.ts` (kebab-case)
  - Services: `nombre.service.ts` (PascalCase: `ReadingsService`)
  - Controllers: `nombre.controller.ts` (kebab-case routes)
- **Inyección de Dependencias (TypeORM):**
  - **Estándar:** Usa `@InjectRepository(Entity)` directo en servicios (enfoque pragmático NestJS)
  - **Testing:** Mockea `Repository<Entity>` con `jest.fn()` en tests unitarios
  - **Excepción:** Solo usa Repository Pattern (interface + implementación) si el módulo ya lo tiene establecido
- **ANTES de crear:** Inspecciona módulos existentes similares (ej: si crearás algo de tarot, mira `src/modules/tarot/cards/`) y replica su estructura exacta.

Metodología (TDD Estricto): Sigue un ciclo TDD riguroso: _ Escribe un test (debe fallar). _ Escribe el código mínimo para que el test pase. \* Refactoriza.

Ciclo de Calidad (Pre-Commit): Al finalizar la implementación, ejecuta los scripts de lint, format y build del proyecto. Todos los tipos de tests completos (unitarios y e2e). Corrige todos los errores y warnings que surjan. Y finalmente el script validate-architecture.js

Esta terminantemente prohibido agregar eslint disable, debes solucionar los problemas de forma real.

Debes completar el testing de la tarea de acuerdo a los documentos: TASK-059-TESTING-PLAN y TESTING_PHILOSOPHY

Debes completar la documentacion de la tarea de acuerdo a la TASK-060 de project_backlog

Actualiza el documento backlog con la tarea completada, marcándola como finalizada.

Validación Final: Asegúrate de que todos los tests (nuevos y existentes) pasen limpiamente.

ACLARACION: en docs/tasks/TASK-082.md dejo este prompt para que lo consultes en cada paso de la implementacion asi no olvidas nada
