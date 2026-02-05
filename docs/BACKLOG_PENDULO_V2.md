# BACKLOG AUGURIA 2.0 - PÉNDULO DIGITAL V2

**Fecha de creación:** 18 de enero de 2026
**Última actualización:** 4 de febrero de 2026
**Módulo:** Péndulo Digital
**Prioridad Global:** MEDIA
**Estimación Total:** 4-5 días

---

## OVERVIEW DEL MÓDULO

El Péndulo Digital es una herramienta interactiva que simula la experiencia de usar un péndulo físico para obtener respuestas a preguntas de sí/no. Utiliza animaciones fluidas y física realista para crear una experiencia inmersiva.

### Características principales:

| Característica | Descripción |
|----------------|-------------|
| Animación realista | Péndulo con física de oscilación natural |
| Respuestas Sí/No/Quizás | Tres posibles direcciones de movimiento |
| Diseño único | Cristal de cuarzo (hardcodeado) |
| Interpretaciones predefinidas | Frases místicas desde base de datos |
| Límites por plan | Anónimo: 1 total, Free: 3/mes, Premium: 1/día |
| Historial | Solo para usuarios Premium |
| Disclaimer obligatorio | Aceptación requerida ANTES DE CADA consulta |

### Mecánica del péndulo:

- **Sí:** Oscilación vertical (adelante-atrás)
- **No:** Oscilación horizontal (izquierda-derecha)
- **Quizás/Incierto:** Movimiento circular

### Diferenciación por rol:

| Funcionalidad | Anónimo | Free | Premium |
|---------------|---------|------|---------|
| Consultar péndulo | ✅ | ✅ | ✅ |
| Disclaimer obligatorio (cada consulta) | ✅ | ✅ | ✅ |
| Input de texto (pregunta escrita) | ❌ | ❌ | ✅ |
| Historial de consultas | ❌ | ❌ | ✅ |
| Interpretación incluida | ✅ | ✅ | ✅ |
| Límite | 1 total | 3/mes | 1/día |

---

## INVESTIGACIÓN: SISTEMAS DE LÍMITES EXISTENTES A REUTILIZAR

> Esta sección documenta la infraestructura existente que se reutilizará para los límites del péndulo.

### Componentes Backend Reutilizables

| Componente | Archivo | Acción |
|-----------|---------|--------|
| `AnonymousTrackingService` | `modules/usage-limits/services/anonymous-tracking.service.ts` | Extender con `canAccessLifetime()` |
| `CheckUsageLimitGuard` | `modules/usage-limits/guards/check-usage-limit.guard.ts` | Reutilizar, agregar lógica mensual |
| `IncrementUsageInterceptor` | `modules/usage-limits/interceptors/increment-usage.interceptor.ts` | Reutilizar sin cambios |
| `@CheckUsageLimit` decorator | `modules/usage-limits/decorators/check-usage-limit.decorator.ts` | Reutilizar sin cambios |
| `UsageFeature` enum | `modules/usage-limits/enums/usage-feature.enum.ts` | Agregar `PENDULUM_QUERY` |
| `Plan` entity | `modules/plan-config/entities/plan.entity.ts` | Agregar campos de péndulo |
| `PlanConfigService` | `modules/plan-config/plan-config.service.ts` | Agregar `getPendulumLimit()` |
| Tabla `usage_limit` | Ya existe | Reutilizar sin cambios de esquema |
| Tabla `anonymous_usage` | Ya existe | Reutilizar sin cambios de esquema |

### Componentes Frontend Reutilizables

| Componente | Archivo | Acción |
|-----------|---------|--------|
| `useUserCapabilities` | `hooks/api/useUserCapabilities.ts` | Agregar sección `pendulum` |
| `UserCapabilitiesDto` | Backend DTO | Agregar campos de péndulo |
| `getSessionFingerprint` | `lib/utils/fingerprint.ts` | Reutilizar sin cambios |

### Esquema de Fingerprinting (Anónimos)

```typescript
// Backend: Generación del fingerprint
generateFingerprint(ip: string, userAgent: string): string {
  const data = `${ip}|${userAgent}`;
  return createHash('sha256').update(data).digest('hex');
}
```

### Adaptaciones Requeridas

1. **Lifetime para anónimos:** Modificar query para ignorar fecha, solo validar `fingerprint + feature`
2. **Período mensual para Free:** Query con `date >= firstDayOfMonth`
3. **Nuevos campos en `plans`:** `pendulum_daily_limit`, `pendulum_monthly_limit`

---

## 1. HISTORIAS DE USUARIO

### HU-PEN-001: Consultar el péndulo (Todos los usuarios)

```gherkin
Feature: Consultar el péndulo digital
  Como usuario de Auguria
  Quiero usar el péndulo digital para obtener respuestas
  Para recibir guía en decisiones simples

  Background:
    Given soy un usuario en Auguria (anónimo, free o premium)

  Scenario: Ver página del péndulo
    When navego a la sección "Péndulo"
    Then veo:
      - Péndulo animado en reposo (leve balanceo)
      - Diseño de cristal de cuarzo
      - Botón "Consultar al Péndulo"
      - Breve explicación de cómo funciona
      - Indicador de consultas restantes
    And NO veo campo de texto para pregunta (no soy premium)

  Scenario: Hacer consulta (anónimo/free)
    Given estoy en la página del péndulo
    And tengo consultas disponibles
    When hago clic en "Consultar al Péndulo"
    Then veo el modal de disclaimer obligatorio
    When acepto el disclaimer
    Then veo mensaje "Formula tu pregunta mentalmente"
    And el péndulo comienza a moverse de forma aleatoria
    And después de 3-5 segundos se estabiliza en una dirección
    And veo la respuesta (Sí/No/Quizás) con animación
    And veo una interpretación mística predefinida

  Scenario: Nueva consulta
    Given acabo de recibir una respuesta
    When hago clic en "Nueva consulta"
    Then el péndulo vuelve a posición de reposo
    And puedo hacer otra consulta (si tengo disponibles)

  Scenario: Límite alcanzado (anónimo)
    Given soy usuario anónimo
    And ya usé mi única consulta de por vida
    When intento consultar el péndulo
    Then veo mensaje "Ya has usado tu consulta gratuita"
    And veo CTA para registrarse
    And el botón "Consultar" está deshabilitado

  Scenario: Límite alcanzado (free)
    Given soy usuario free
    And ya usé mis 3 consultas del mes
    When intento consultar el péndulo
    Then veo mensaje "Has alcanzado el límite mensual"
    And veo cuándo se resetea (día 1 del próximo mes)
    And veo CTA para upgrade a Premium
```

---

### HU-PEN-002: Consultar con pregunta escrita (Solo Premium)

```gherkin
Feature: Escribir pregunta específica
  Como usuario Premium
  Quiero escribir mi pregunta al péndulo
  Para obtener una respuesta más personalizada

  Background:
    Given soy un usuario Premium autenticado

  Scenario: Ver campo de pregunta
    Given estoy en la página del péndulo
    Then veo un campo de texto con placeholder "Escribe tu pregunta (opcional)..."
    And el campo es opcional

  Scenario: Consultar con pregunta escrita
    Given estoy en la página del péndulo
    When escribo "¿Debo aceptar este trabajo?"
    And hago clic en "Consultar al Péndulo"
    Then el péndulo responde normalmente
    And mi pregunta se guarda en el historial

  Scenario: Consultar sin pregunta
    Given estoy en la página del péndulo
    When dejo el campo de pregunta vacío
    And hago clic en "Consultar al Péndulo"
    Then veo mensaje "Formula tu pregunta mentalmente"
    And el péndulo responde normalmente
    And se guarda en historial como "Pregunta mental"

  Scenario: Pregunta con contenido prohibido
    Given estoy en la página del péndulo
    When escribo "¿Tengo cáncer?"
    And hago clic en "Consultar al Péndulo"
    Then veo mensaje de advertencia:
      - "Esta pregunta toca temas sensibles"
      - "Te recomendamos consultar con un profesional de salud"
    And NO se ejecuta la consulta
    And NO se consume mi consulta del día
    And puedo modificar mi pregunta o continuar mentalmente

  Scenario: Límite diario alcanzado
    Given ya usé mi consulta del día
    When intento hacer otra consulta
    Then veo mensaje "Has alcanzado tu límite diario"
    And veo cuándo se resetea (mañana a medianoche UTC)
    And el botón "Consultar" está deshabilitado
```

---

### HU-PEN-003: Historial de consultas (Solo Premium)

```gherkin
Feature: Ver historial de consultas
  Como usuario Premium
  Quiero ver mis consultas anteriores
  Para reflexionar sobre las respuestas recibidas

  Background:
    Given soy un usuario Premium autenticado

  Scenario: Guardar consulta automáticamente
    Given hago una consulta al péndulo
    When recibo la respuesta
    Then la consulta se guarda automáticamente con:
      | Campo | Ejemplo |
      | Pregunta | ¿Debo aceptar este trabajo? |
      | Respuesta | Sí |
      | Interpretación | El universo señala... |
      | Fecha | 18 de enero 2026, 15:30 |
      | Fase lunar | Luna Creciente |

  Scenario: Ver historial
    When accedo a "Mi Historial" desde la página del péndulo
    Then veo mis últimas consultas
    And cada entrada muestra pregunta, respuesta, interpretación y fecha
    And puedo filtrar por respuesta (Sí/No/Quizás)

  Scenario: Eliminar consulta del historial
    Given estoy viendo mi historial
    When elimino una consulta
    Then desaparece de la lista
    And no se puede recuperar

  Scenario: Ver estadísticas
    When accedo a mis estadísticas
    Then veo:
      - Total de consultas realizadas
      - Cantidad de Sí / No / Quizás
      - Porcentajes
```

---

### HU-PEN-004: Disclaimer obligatorio (cada consulta)

```gherkin
Feature: Mostrar disclaimer legal antes de cada consulta
  Como sistema
  Quiero mostrar un aviso legal antes de CADA consulta al péndulo
  Para proteger a los usuarios y asegurar que siempre lean la advertencia

  Scenario: Hacer clic en consultar
    Given estoy en la página del péndulo
    And tengo consultas disponibles
    When hago clic en "Consultar al Péndulo"
    Then veo un modal de disclaimer que dice:
      """
      Aviso Importante

      El Péndulo Digital es una herramienta de entretenimiento
      basada en tradiciones espirituales ancestrales.

      - No sustituye el consejo de profesionales de salud,
        legales o financieros
      - Las respuestas son generadas aleatoriamente
      - No debe usarse para tomar decisiones importantes

      Al continuar, confirmas que entiendes que esto es
      solo para entretenimiento.
      """
    And veo botón "Entiendo y Acepto"
    And veo botón "Cancelar"
    And la consulta NO se ejecuta todavía

  Scenario: Aceptar disclaimer
    Given veo el modal de disclaimer
    When hago clic en "Entiendo y Acepto"
    Then el modal se cierra
    And la consulta al péndulo se ejecuta
    And veo la animación del péndulo

  Scenario: Cancelar disclaimer
    Given veo el modal de disclaimer
    When hago clic en "Cancelar"
    Then el modal se cierra
    And la consulta NO se ejecuta
    And NO se consume mi límite de consultas
    And permanezco en la página del péndulo

  Scenario: Segunda consulta en la misma sesión
    Given acabo de completar una consulta
    And hago clic en "Nueva consulta"
    When hago clic en "Consultar al Péndulo"
    Then veo el modal de disclaimer NUEVAMENTE
    And debo aceptar para continuar
```

---

## 2. REGLAS DE NEGOCIO

### Generación de Respuestas

| Respuesta | Probabilidad | Movimiento |
|-----------|--------------|------------|
| Sí | 40% | Vertical (adelante-atrás) |
| No | 40% | Horizontal (izquierda-derecha) |
| Quizás | 20% | Circular |

### Límites por Plan

| Plan | Límite | Período | Configurable Admin |
|------|--------|---------|-------------------|
| Anónimo | 1 | Lifetime (total) | No |
| Free | 3 | Mensual (resetea día 1) | Sí |
| Premium | 1 | Diario (resetea medianoche UTC) | Sí |

### Contenido Prohibido (Solo aplica a Premium con preguntas escritas)

**Categorías bloqueadas:**
- Salud: enfermedad, cáncer, muerte, suicidio, diagnóstico, tratamiento, medicamento
- Legal: juicio, demanda, cárcel, arresto, sentencia
- Financiero: inversión, criptomoneda, bitcoin, apuesta, lotería, casino
- Violencia: matar, herir, dañar, venganza

**Comportamiento:** Bloqueo preventivo, NO consume consulta, muestra recomendación profesional.

### Interpretaciones Predefinidas

- 30 frases en total (10 por tipo de respuesta)
- Almacenadas en tabla `pendulum_interpretations`
- Selección aleatoria según tipo de respuesta
- Texto genérico y místico (no específico a la pregunta)

---

## 3. TAREAS BACKEND

### TASK-500: Crear entidades del Péndulo

**Estado:** ✅ COMPLETADA

**Módulo:** `src/modules/pendulum/entities/`
**Prioridad:** ALTA
**Estimación:** 0.5 días
**Dependencias:** Ninguna

#### Descripción

Crear las entidades TypeORM para el módulo péndulo.

#### Archivos a crear

**1. `pendulum.enums.ts`**

```typescript
export enum PendulumResponse {
  YES = 'yes',
  NO = 'no',
  MAYBE = 'maybe',
}

export enum PendulumMovement {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  CIRCULAR = 'circular',
}
```

**2. `pendulum-interpretation.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PendulumResponse } from '../enums/pendulum.enums';

@Entity('pendulum_interpretations')
export class PendulumInterpretation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PendulumResponse })
  responseType: PendulumResponse;

  @Column({ type: 'text' })
  text: string;

  @Column({ default: true })
  isActive: boolean;
}
```

**3. `pendulum-query.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { PendulumResponse } from '../enums/pendulum.enums';

@Entity('pendulum_queries')
export class PendulumQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  question: string | null;

  @Column({ type: 'enum', enum: PendulumResponse })
  response: PendulumResponse;

  @Column({ type: 'text' })
  interpretation: string;

  @Column({ length: 50 })
  lunarPhase: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### Testing

- [x] Test: Entidades se crean correctamente
- [x] Test: Relaciones funcionan
- [x] Test: Enums tienen valores correctos

**Resultado:** ✅ 30 tests pasando, 100% coverage del módulo péndulo

---

### TASK-501: Crear migración y seeder

**Estado:** ✅ COMPLETADA

**Módulo:** `src/database/migrations/` y `src/database/seeders/`
**Prioridad:** ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-500

#### Descripción

Crear migración para las tablas y seeder con interpretaciones predefinidas.

#### Migración

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePendulumTables1705600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabla de interpretaciones
    await queryRunner.createTable(
      new Table({
        name: 'pendulum_interpretations',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'responseType', type: 'enum', enum: ['yes', 'no', 'maybe'] },
          { name: 'text', type: 'text' },
          { name: 'isActive', type: 'boolean', default: true },
        ],
      }),
    );

    // Tabla de consultas
    await queryRunner.createTable(
      new Table({
        name: 'pendulum_queries',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'userId', type: 'int' },
          { name: 'question', type: 'text', isNullable: true },
          { name: 'response', type: 'enum', enum: ['yes', 'no', 'maybe'] },
          { name: 'interpretation', type: 'text' },
          { name: 'lunarPhase', type: 'varchar', length: '50' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'pendulum_queries',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Índices
    await queryRunner.query(`CREATE INDEX idx_pendulum_queries_user ON pendulum_queries(userId)`);
    await queryRunner.query(`CREATE INDEX idx_pendulum_queries_created ON pendulum_queries(createdAt)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pendulum_queries');
    await queryRunner.dropTable('pendulum_interpretations');
  }
}
```

#### Seeder de Interpretaciones

```typescript
const interpretations = [
  // YES (10)
  { responseType: 'yes', text: 'El universo afirma tu camino. La energía fluye a tu favor.' },
  { responseType: 'yes', text: 'Las fuerzas cósmicas se alinean positivamente. Confía en tu intuición.' },
  { responseType: 'yes', text: 'La respuesta es clara como el cristal. El momento es propicio.' },
  { responseType: 'yes', text: 'Los astros sonríen ante tu pregunta. Adelante con confianza.' },
  { responseType: 'yes', text: 'La luz guía tu sendero. Esta es la dirección correcta.' },
  { responseType: 'yes', text: 'El péndulo confirma lo que tu corazón ya sabía.' },
  { responseType: 'yes', text: 'Las vibraciones son armoniosas. El sí resuena en el éter.' },
  { responseType: 'yes', text: 'Tu energía atrae lo positivo. La respuesta está clara.' },
  { responseType: 'yes', text: 'El cosmos conspira a tu favor en este momento.' },
  { responseType: 'yes', text: 'La sabiduría ancestral confirma: es tiempo de avanzar.' },

  // NO (10)
  { responseType: 'no', text: 'El universo sugiere pausa. Hay otras direcciones por explorar.' },
  { responseType: 'no', text: 'Las energías indican resistencia. Quizás no sea el momento.' },
  { responseType: 'no', text: 'El péndulo señala cautela. Reflexiona antes de actuar.' },
  { responseType: 'no', text: 'Los vientos cósmicos soplan en otra dirección por ahora.' },
  { responseType: 'no', text: 'La respuesta requiere paciencia. Este no es el camino indicado.' },
  { responseType: 'no', text: 'Las fuerzas sutiles aconsejan esperar. Hay lecciones por aprender.' },
  { responseType: 'no', text: 'El cosmos protege tu camino desviándote de esta ruta.' },
  { responseType: 'no', text: 'La energía universal sugiere reconsiderar tus opciones.' },
  { responseType: 'no', text: 'El no de hoy puede ser el sí de mañana. Todo tiene su tiempo.' },
  { responseType: 'no', text: 'La sabiduría del péndulo aconseja otro rumbo.' },

  // MAYBE (10)
  { responseType: 'maybe', text: 'Las energías están en equilibrio. El momento requiere más claridad.' },
  { responseType: 'maybe', text: 'El universo guarda silencio por ahora. La respuesta vendrá.' },
  { responseType: 'maybe', text: 'El péndulo danza entre mundos. Hay factores aún por revelarse.' },
  { responseType: 'maybe', text: 'Las fuerzas cósmicas deliberan. Ten paciencia.' },
  { responseType: 'maybe', text: 'Ni sí ni no. El misterio se mantiene por una razón.' },
  { responseType: 'maybe', text: 'El cosmos sugiere esperar más información antes de decidir.' },
  { responseType: 'maybe', text: 'Las energías fluctúan. La respuesta se cristalizará con el tiempo.' },
  { responseType: 'maybe', text: 'El péndulo refleja tu propia incertidumbre. Medita más.' },
  { responseType: 'maybe', text: 'Hay variables ocultas en juego. El tiempo revelará la verdad.' },
  { responseType: 'maybe', text: 'El universo te invita a la reflexión profunda antes de actuar.' },
];
```

#### Testing

- [x] Test: Migración crea tablas correctamente
- [x] Test: Seeder inserta 30 interpretaciones
- [x] Test: Foreign key funciona correctamente

#### Resultados

✅ **Archivos creados:**
- `backend/tarot-app/src/database/migrations/1771700000000-CreatePendulumTables.ts`
- `backend/tarot-app/src/database/seeds/pendulum-interpretations.seeder.ts`

✅ **Cambios realizados:**
- Actualizado `scripts/db-seed-all.ts` para incluir el seeder del péndulo
- Migración ejecutada exitosamente
- Seeder integrado al proceso de seeding completo

✅ **Validaciones:**
- Lint sin errores
- Build exitoso
- Migración aplicada correctamente

**Fecha de completación:** 4 de febrero de 2026

---

### TASK-502: Extender sistema de límites existente

**Estado:** ✅ COMPLETADA

**Módulo:** `src/modules/usage-limits/` y `src/modules/plan-config/`
**Prioridad:** ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-500

#### Descripción

Extender el sistema de límites existente para soportar el péndulo con períodos lifetime y mensual.

#### Archivos a modificar

**1. Agregar enum value en `usage-feature.enum.ts`:**

```typescript
export enum UsageFeature {
  DAILY_CARD = 'daily_card',
  TAROT_READING = 'tarot_reading',
  ORACLE_QUERY = 'oracle_query',
  INTERPRETATION_REGENERATION = 'interpretation_regeneration',
  PENDULUM_QUERY = 'pendulum_query', // NUEVO
}
```

**2. Agregar campos en `plan.entity.ts`:**

```typescript
@Column({ type: 'int', default: 1 })
pendulumDailyLimit: number; // Para Premium

@Column({ type: 'int', default: 3 })
pendulumMonthlyLimit: number; // Para Free
```

**3. Agregar migración para campos de plan:**

```typescript
export class AddPendulumLimitsToPlan1705600100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('plans', new TableColumn({
      name: 'pendulumDailyLimit',
      type: 'int',
      default: 1,
    }));
    await queryRunner.addColumn('plans', new TableColumn({
      name: 'pendulumMonthlyLimit',
      type: 'int',
      default: 3,
    }));
  }
}
```

**4. Agregar método en `anonymous-tracking.service.ts`:**

```typescript
/**
 * Verifica si un usuario anónimo puede acceder a una feature de por vida (sin límite diario)
 */
async canAccessLifetime(fingerprint: string, feature: UsageFeature): Promise<boolean> {
  const existingUsage = await this.anonymousUsageRepository.findOne({
    where: { fingerprint, feature },
  });
  return !existingUsage; // true si nunca ha usado la feature
}

/**
 * Registra uso lifetime (sin fecha específica)
 */
async recordLifetimeUsage(fingerprint: string, ip: string, feature: UsageFeature): Promise<void> {
  const usage = this.anonymousUsageRepository.create({
    fingerprint,
    ip,
    feature,
    date: '1970-01-01', // Fecha fija para lifetime
  });
  await this.anonymousUsageRepository.save(usage);
}
```

**5. Agregar método en `plan-config.service.ts`:**

```typescript
getPendulumLimit(planType: UserPlan): { limit: number; period: 'daily' | 'monthly' | 'lifetime' } {
  const plan = this.getPlan(planType);

  if (planType === UserPlan.ANONYMOUS) {
    return { limit: 1, period: 'lifetime' };
  }

  if (planType === UserPlan.FREE) {
    return { limit: plan?.pendulumMonthlyLimit ?? 3, period: 'monthly' };
  }

  // Premium
  return { limit: plan?.pendulumDailyLimit ?? 1, period: 'daily' };
}
```

**6. Extender lógica en `check-usage-limit.guard.ts` para período mensual:**

```typescript
// En el método que valida límites, agregar caso para PENDULUM_QUERY
if (feature === UsageFeature.PENDULUM_QUERY) {
  const { limit, period } = this.planConfigService.getPendulumLimit(userPlan);

  if (period === 'lifetime' && !userId) {
    // Usuario anónimo - verificar lifetime
    return this.anonymousTrackingService.canAccessLifetime(fingerprint, feature);
  }

  if (period === 'monthly') {
    // Usuario free - verificar mes actual
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const count = await this.usageLimitRepository.count({
      where: {
        userId,
        feature,
        date: MoreThanOrEqual(firstDayOfMonth.toISOString().split('T')[0]),
      },
    });

    return count < limit;
  }

  // Premium - verificar diario (lógica existente)
  return this.checkDailyLimit(userId, feature, limit);
}
```

**7. Agregar campos a `UserCapabilitiesDto`:**

```typescript
pendulum: {
  used: number;
  limit: number;
  canUse: boolean;
  resetAt: string | null; // null para lifetime
  period: 'daily' | 'monthly' | 'lifetime';
};
```

#### Testing

- [x] Test: `canAccessLifetime` retorna true si nunca usó
- [x] Test: `canAccessLifetime` retorna false después de usar
- [x] Test: Límite mensual funciona correctamente
- [x] Test: Límite diario funciona para premium
- [x] Test: `UserCapabilitiesDto` incluye campos de péndulo

---

### TASK-503: Crear servicios del Péndulo

**Estado:** ✅ COMPLETADA

**Módulo:** `src/modules/pendulum/application/services/`
**Prioridad:** ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-500, TASK-501, TASK-502

#### Descripción

Implementar servicios para la lógica de negocio del péndulo.

#### Archivos a crear

**1. `pendulum-interpretation.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumInterpretation } from '../entities/pendulum-interpretation.entity';
import { PendulumResponse } from '../enums/pendulum.enums';

@Injectable()
export class PendulumInterpretationService {
  constructor(
    @InjectRepository(PendulumInterpretation)
    private readonly repository: Repository<PendulumInterpretation>,
  ) {}

  /**
   * Obtiene una interpretación aleatoria para el tipo de respuesta
   */
  async getRandomInterpretation(responseType: PendulumResponse): Promise<string> {
    const interpretations = await this.repository.find({
      where: { responseType, isActive: true },
    });

    if (interpretations.length === 0) {
      return this.getFallbackInterpretation(responseType);
    }

    const randomIndex = Math.floor(Math.random() * interpretations.length);
    return interpretations[randomIndex].text;
  }

  private getFallbackInterpretation(responseType: PendulumResponse): string {
    switch (responseType) {
      case PendulumResponse.YES:
        return 'El universo afirma tu camino.';
      case PendulumResponse.NO:
        return 'El universo sugiere otra dirección.';
      case PendulumResponse.MAYBE:
        return 'El universo guarda silencio por ahora.';
    }
  }
}
```

**2. `pendulum-content-validator.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class PendulumContentValidatorService {
  private readonly blockedTerms: string[] = [
    // Salud
    'enfermedad', 'cáncer', 'cancer', 'muerte', 'morir', 'suicidio', 'suicidar',
    'diagnóstico', 'diagnostico', 'tratamiento', 'medicamento', 'medicina',
    'tumor', 'terminal', 'aborto',
    // Legal
    'juicio', 'demanda', 'cárcel', 'carcel', 'arresto', 'sentencia', 'abogado',
    'prisión', 'prision', 'delito', 'crimen',
    // Financiero
    'inversión', 'inversion', 'criptomoneda', 'bitcoin', 'crypto', 'apuesta',
    'apostar', 'lotería', 'loteria', 'casino', 'trading',
    // Violencia
    'matar', 'herir', 'dañar', 'danar', 'venganza', 'violencia', 'golpear',
  ];

  /**
   * Valida si una pregunta contiene contenido prohibido
   * @returns { isValid: boolean, blockedCategory?: string }
   */
  validateQuestion(question: string): { isValid: boolean; blockedCategory?: string } {
    if (!question) return { isValid: true };

    const normalizedQuestion = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    for (const term of this.blockedTerms) {
      const normalizedTerm = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedQuestion.includes(normalizedTerm)) {
        return {
          isValid: false,
          blockedCategory: this.getCategoryForTerm(term),
        };
      }
    }

    return { isValid: true };
  }

  private getCategoryForTerm(term: string): string {
    const healthTerms = ['enfermedad', 'cáncer', 'cancer', 'muerte', 'morir', 'suicidio', 'diagnóstico', 'tratamiento', 'medicamento', 'tumor', 'terminal', 'aborto'];
    const legalTerms = ['juicio', 'demanda', 'cárcel', 'carcel', 'arresto', 'sentencia', 'abogado', 'prisión', 'delito', 'crimen'];
    const financialTerms = ['inversión', 'criptomoneda', 'bitcoin', 'crypto', 'apuesta', 'lotería', 'casino', 'trading'];

    if (healthTerms.some(t => term.includes(t))) return 'salud';
    if (legalTerms.some(t => term.includes(t))) return 'legal';
    if (financialTerms.some(t => term.includes(t))) return 'financiero';
    return 'contenido sensible';
  }
}
```

**3. `pendulum.service.ts`**

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumQuery } from '../entities/pendulum-query.entity';
import { PendulumResponse, PendulumMovement } from '../enums/pendulum.enums';
import { PendulumInterpretationService } from './pendulum-interpretation.service';
import { PendulumContentValidatorService } from './pendulum-content-validator.service';
import { LunarPhaseService } from '@/modules/rituals/application/services/lunar-phase.service';

export interface PendulumQueryDto {
  question?: string;
}

export interface PendulumQueryResponseDto {
  response: PendulumResponse;
  movement: PendulumMovement;
  responseText: string;
  interpretation: string;
  queryId: number | null;
  lunarPhase: string;
  lunarPhaseName: string;
}

@Injectable()
export class PendulumService {
  constructor(
    @InjectRepository(PendulumQuery)
    private readonly queryRepository: Repository<PendulumQuery>,
    private readonly interpretationService: PendulumInterpretationService,
    private readonly contentValidator: PendulumContentValidatorService,
    private readonly lunarService: LunarPhaseService,
  ) {}

  /**
   * Consultar el péndulo
   */
  async query(dto: PendulumQueryDto, userId?: number): Promise<PendulumQueryResponseDto> {
    // Validar contenido si hay pregunta (solo premium puede escribir)
    if (dto.question && userId) {
      const validation = this.contentValidator.validateQuestion(dto.question);
      if (!validation.isValid) {
        throw new BadRequestException({
          code: 'BLOCKED_CONTENT',
          category: validation.blockedCategory,
          message: `Tu pregunta contiene temas de ${validation.blockedCategory}. Te recomendamos consultar con un profesional.`,
        });
      }
    }

    // Generar respuesta
    const response = this.generateResponse();
    const movement = this.getMovementForResponse(response);
    const responseText = this.getResponseText(response);

    // Obtener fase lunar
    const lunarInfo = this.lunarService.getCurrentPhase();

    // Obtener interpretación aleatoria
    const interpretation = await this.interpretationService.getRandomInterpretation(response);

    // Guardar en historial si está autenticado Y es premium
    let queryId: number | null = null;
    if (userId) {
      const savedQuery = await this.saveQuery(userId, dto, response, interpretation, lunarInfo.phase);
      queryId = savedQuery.id;
    }

    return {
      response,
      movement,
      responseText,
      interpretation,
      queryId,
      lunarPhase: lunarInfo.phase,
      lunarPhaseName: lunarInfo.phaseName,
    };
  }

  private generateResponse(): PendulumResponse {
    const random = Math.random() * 100;
    if (random < 40) return PendulumResponse.YES;
    if (random < 80) return PendulumResponse.NO;
    return PendulumResponse.MAYBE;
  }

  private getMovementForResponse(response: PendulumResponse): PendulumMovement {
    switch (response) {
      case PendulumResponse.YES: return PendulumMovement.VERTICAL;
      case PendulumResponse.NO: return PendulumMovement.HORIZONTAL;
      case PendulumResponse.MAYBE: return PendulumMovement.CIRCULAR;
    }
  }

  private getResponseText(response: PendulumResponse): string {
    switch (response) {
      case PendulumResponse.YES: return 'Sí';
      case PendulumResponse.NO: return 'No';
      case PendulumResponse.MAYBE: return 'Quizás';
    }
  }

  private async saveQuery(
    userId: number,
    dto: PendulumQueryDto,
    response: PendulumResponse,
    interpretation: string,
    lunarPhase: string,
  ): Promise<PendulumQuery> {
    const query = this.queryRepository.create({
      userId,
      question: dto.question || null,
      response,
      interpretation,
      lunarPhase,
    });
    return this.queryRepository.save(query);
  }
}
```

**4. `pendulum-history.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumQuery } from '../entities/pendulum-query.entity';
import { PendulumResponse } from '../enums/pendulum.enums';

@Injectable()
export class PendulumHistoryService {
  constructor(
    @InjectRepository(PendulumQuery)
    private readonly repository: Repository<PendulumQuery>,
  ) {}

  async getUserHistory(
    userId: number,
    limit: number = 20,
    filterResponse?: PendulumResponse,
  ): Promise<PendulumQuery[]> {
    const query = this.repository
      .createQueryBuilder('query')
      .where('query.userId = :userId', { userId })
      .orderBy('query.createdAt', 'DESC')
      .take(limit);

    if (filterResponse) {
      query.andWhere('query.response = :response', { response: filterResponse });
    }

    return query.getMany();
  }

  async getUserStats(userId: number): Promise<{
    total: number;
    yesCount: number;
    noCount: number;
    maybeCount: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('query')
      .select('query.response', 'response')
      .addSelect('COUNT(*)', 'count')
      .where('query.userId = :userId', { userId })
      .groupBy('query.response')
      .getRawMany();

    const stats = { total: 0, yesCount: 0, noCount: 0, maybeCount: 0 };

    for (const row of result) {
      const count = parseInt(row.count, 10);
      stats.total += count;
      if (row.response === 'yes') stats.yesCount = count;
      if (row.response === 'no') stats.noCount = count;
      if (row.response === 'maybe') stats.maybeCount = count;
    }

    return stats;
  }

  async deleteQuery(userId: number, queryId: number): Promise<boolean> {
    const result = await this.repository.delete({ id: queryId, userId });
    return (result.affected ?? 0) > 0;
  }
}
```

#### Testing

- [x] Test: `generateResponse` respeta probabilidades
- [x] Test: `validateQuestion` detecta términos prohibidos
- [x] Test: Interpretación se obtiene correctamente
- [x] Test: Historial filtra por usuario y respuesta
- [x] Test: Stats calculan correctamente

#### Resultados

✅ **Archivos creados:**
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum.service.ts`
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum.service.spec.ts`
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum-interpretation.service.ts`
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum-interpretation.service.spec.ts`
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum-content-validator.service.ts`
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum-content-validator.service.spec.ts`
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum-history.service.ts`
- `backend/tarot-app/src/modules/pendulum/application/services/pendulum-history.service.spec.ts`

✅ **Servicios implementados:**
1. **PendulumInterpretationService:** Obtiene interpretaciones aleatorias desde la base de datos según tipo de respuesta (yes/no/maybe)
2. **PendulumContentValidatorService:** Valida preguntas escritas y bloquea contenido sensible (salud, legal, financiero, violencia)
3. **PendulumService:** Servicio principal que genera respuestas aleatorias (40% YES, 40% NO, 20% MAYBE), valida contenido, guarda historial e integra fase lunar
4. **PendulumHistoryService:** Gestiona el historial de consultas del usuario (obtener, filtrar, eliminar, estadísticas) - solo Premium

✅ **Tests:**
- 78 tests pasando en total (10 + 34 + 18 + 16)
- Coverage 100% en los 4 servicios
- Tests incluyen: generación aleatoria, validación de contenido, obtención de interpretaciones, gestión de historial, cálculo de estadísticas

✅ **Validaciones:**
- Lint sin errores
- Build exitoso
- Validador de arquitectura OK (módulo pendulum: 8 archivos, 667 líneas - estructura plana permitida)
- Formato Prettier aplicado

**Fecha de completación:** 4 de febrero de 2026

---

### TASK-504: Crear endpoints del Péndulo

**Estado:** ✅ COMPLETADA

**Módulo:** `src/modules/pendulum/infrastructure/controllers/`
**Prioridad:** ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-502, TASK-503

#### Descripción

Implementar endpoints REST para el péndulo digital.

#### Endpoints

| Método | Ruta | Descripción | Auth | Guard |
|--------|------|-------------|------|-------|
| POST | `/pendulum/query` | Consultar el péndulo | Opcional | CheckUsageLimit |
| GET | `/pendulum/history` | Mi historial (Premium) | Requerido | JwtAuth |
| GET | `/pendulum/history/stats` | Mis estadísticas (Premium) | Requerido | JwtAuth |
| DELETE | `/pendulum/history/:id` | Eliminar consulta (Premium) | Requerido | JwtAuth |

#### Archivo: `pendulum.controller.ts`

```typescript
import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, ParseIntPipe, HttpCode, HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '@/common/guards/optional-auth.guard';
import { CheckUsageLimitGuard } from '@/modules/usage-limits/guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from '@/modules/usage-limits/interceptors/increment-usage.interceptor';
import { CheckUsageLimit } from '@/modules/usage-limits/decorators/check-usage-limit.decorator';
import { AllowAnonymous } from '@/modules/usage-limits/decorators/allow-anonymous.decorator';
import { UsageFeature } from '@/modules/usage-limits/enums/usage-feature.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { PendulumService, PendulumQueryDto, PendulumQueryResponseDto } from '../application/services/pendulum.service';
import { PendulumHistoryService } from '../application/services/pendulum-history.service';
import { PendulumResponse } from '../enums/pendulum.enums';
import { UserPlan } from '@/modules/users/enums/user-plan.enum';

@ApiTags('Pendulum')
@Controller('pendulum')
export class PendulumController {
  constructor(
    private readonly pendulumService: PendulumService,
    private readonly historyService: PendulumHistoryService,
  ) {}

  @Post('query')
  @UseGuards(OptionalAuthGuard, CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @CheckUsageLimit(UsageFeature.PENDULUM_QUERY)
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar el péndulo' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Respuesta del péndulo' })
  @ApiResponse({ status: 400, description: 'Contenido bloqueado' })
  @ApiResponse({ status: 429, description: 'Límite alcanzado' })
  async query(
    @Body() dto: PendulumQueryDto,
    @CurrentUser() user?: User,
  ): Promise<PendulumQueryResponseDto> {
    // Solo premium puede escribir preguntas
    if (dto.question && (!user || user.plan !== UserPlan.PREMIUM)) {
      dto.question = undefined;
    }

    // Solo guardar historial para premium
    const userId = user?.plan === UserPlan.PREMIUM ? user.id : undefined;

    return this.pendulumService.query(dto, userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi historial de consultas (Premium)' })
  async getHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
    @Query('response') response?: PendulumResponse,
  ) {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException('El historial solo está disponible para usuarios Premium');
    }
    return this.historyService.getUserHistory(user.id, limit, response);
  }

  @Get('history/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis estadísticas (Premium)' })
  async getStats(@CurrentUser() user: User) {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException('Las estadísticas solo están disponibles para usuarios Premium');
    }
    return this.historyService.getUserStats(user.id);
  }

  @Delete('history/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar consulta del historial (Premium)' })
  async deleteQuery(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) queryId: number,
  ): Promise<void> {
    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException('El historial solo está disponible para usuarios Premium');
    }
    await this.historyService.deleteQuery(user.id, queryId);
  }
}
```

#### Archivo: `pendulum.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendulumQuery } from './entities/pendulum-query.entity';
import { PendulumInterpretation } from './entities/pendulum-interpretation.entity';
import { PendulumService } from './application/services/pendulum.service';
import { PendulumHistoryService } from './application/services/pendulum-history.service';
import { PendulumInterpretationService } from './application/services/pendulum-interpretation.service';
import { PendulumContentValidatorService } from './application/services/pendulum-content-validator.service';
import { PendulumController } from './infrastructure/controllers/pendulum.controller';
import { RitualsModule } from '@/modules/rituals/rituals.module';
import { UsageLimitsModule } from '@/modules/usage-limits/usage-limits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendulumQuery, PendulumInterpretation]),
    RitualsModule,
    UsageLimitsModule,
  ],
  providers: [
    PendulumService,
    PendulumHistoryService,
    PendulumInterpretationService,
    PendulumContentValidatorService,
  ],
  controllers: [PendulumController],
  exports: [PendulumService],
})
export class PendulumModule {}
```

#### Testing

- [x] Test: POST /query funciona para anónimos
- [x] Test: POST /query funciona para autenticados (free y premium)
- [x] Test: POST /query strips question from non-premium users
- [x] Test: POST /query retorna 400 cuando contenido bloqueado
- [x] Test: GET /history solo permite Premium
- [x] Test: GET /history permite filtrar por tipo de respuesta
- [x] Test: GET /history/stats solo permite Premium
- [x] Test: DELETE /history/:id solo permite Premium
- [x] Test: Todos los unit tests del controller pasan (12/12)

#### Resultados

✅ **Archivos creados:**
- `backend/tarot-app/src/modules/pendulum/infrastructure/controllers/pendulum.controller.ts`
- `backend/tarot-app/src/modules/pendulum/infrastructure/controllers/pendulum.controller.spec.ts`
- `backend/tarot-app/src/modules/pendulum/application/dto/pendulum-query.dto.ts`
- `backend/tarot-app/src/modules/pendulum/application/dto/pendulum-query-response.dto.ts`
- `backend/tarot-app/src/modules/pendulum/application/dto/pendulum-history-item.dto.ts`
- `backend/tarot-app/src/modules/pendulum/application/dto/pendulum-stats.dto.ts`
- `backend/tarot-app/src/modules/pendulum/pendulum.module.ts`

✅ **Cambios realizados:**
- PendulumModule registrado en `app.module.ts` (con forwardRef a UsersModule)
- Controller implementa 4 endpoints con autenticación y validación correctas
- DTOs creados con validaciones de Swagger y class-validator
- Guards aplicados: OptionalJwtAuthGuard, CheckUsageLimitGuard, JwtAuthGuard
- Interceptor IncrementUsageInterceptor configurado
- Mapeo de entidades a DTOs en getHistory (transforma Date a ISO string)

✅ **Validaciones:**
- Lint sin errores
- Format aplicado
- Build exitoso (TypeScript compilation OK)
- Validador de arquitectura OK
- Tests del controller: 12/12 passing ✅

**Fecha de completación:** 4 de febrero de 2026

---

## 4. TAREAS FRONTEND

### TASK-505: Crear tipos TypeScript y API

**Estado:** ✅ COMPLETADA

**Módulo:** `frontend/src/types/` y `frontend/src/lib/api/`
**Prioridad:** ALTA
**Estimación:** 0.25 días
**Dependencias:** TASK-504

#### Archivos a crear

**1. `types/pendulum.types.ts`**

```typescript
export type PendulumResponse = 'yes' | 'no' | 'maybe';

export type PendulumMovement = 'vertical' | 'horizontal' | 'circular';

export interface PendulumQueryRequest {
  question?: string;
}

export interface PendulumQueryResponse {
  response: PendulumResponse;
  movement: PendulumMovement;
  responseText: string;
  interpretation: string;
  queryId: number | null;
  lunarPhase: string;
  lunarPhaseName: string;
}

export interface PendulumHistoryItem {
  id: number;
  question: string | null;
  response: PendulumResponse;
  interpretation: string;
  lunarPhase: string;
  createdAt: string;
}

export interface PendulumStats {
  total: number;
  yesCount: number;
  noCount: number;
  maybeCount: number;
}

export interface PendulumCapabilities {
  used: number;
  limit: number;
  canUse: boolean;
  resetAt: string | null;
  period: 'daily' | 'monthly' | 'lifetime';
}

// Helpers
export const PENDULUM_RESPONSE_CONFIG = {
  yes: { color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Sí' },
  no: { color: 'text-red-500', bgColor: 'bg-red-500/10', label: 'No' },
  maybe: { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Quizás' },
} as const;
```

**2. `lib/api/pendulum-api.ts`**

```typescript
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
  PendulumQueryRequest,
  PendulumQueryResponse,
  PendulumHistoryItem,
  PendulumStats,
  PendulumResponse,
} from '@/types/pendulum.types';

export async function queryPendulum(request: PendulumQueryRequest): Promise<PendulumQueryResponse> {
  const response = await apiClient.post<PendulumQueryResponse>(
    API_ENDPOINTS.PENDULUM.QUERY,
    request
  );
  return response.data;
}

export async function getPendulumHistory(
  limit?: number,
  filterResponse?: PendulumResponse,
): Promise<PendulumHistoryItem[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (filterResponse) params.append('response', filterResponse);

  const response = await apiClient.get<PendulumHistoryItem[]>(
    `${API_ENDPOINTS.PENDULUM.HISTORY}?${params.toString()}`
  );
  return response.data;
}

export async function getPendulumStats(): Promise<PendulumStats> {
  const response = await apiClient.get<PendulumStats>(API_ENDPOINTS.PENDULUM.STATS);
  return response.data;
}

export async function deletePendulumQuery(queryId: number): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.PENDULUM.HISTORY}/${queryId}`);
}
```

**3. Agregar a `lib/constants/api-endpoints.ts`:**

```typescript
PENDULUM: {
  QUERY: '/pendulum/query',
  HISTORY: '/pendulum/history',
  STATS: '/pendulum/history/stats',
},
```

#### Resultados

✅ **Archivos creados:**
- `frontend/src/types/pendulum.types.ts` - Tipos TypeScript completos con interfaces, tipos literales y helpers de configuración
- `frontend/src/lib/api/pendulum-api.ts` - Funciones de API para consultas, historial, estadísticas y eliminación

✅ **Archivos modificados:**
- `frontend/src/lib/api/endpoints.ts` - Agregados endpoints del péndulo (QUERY, HISTORY, STATS)
- `frontend/src/types/index.ts` - Exportados tipos y configuraciones del péndulo

✅ **Tipos implementados:**
- `PendulumResponse`, `PendulumMovement`, `PendulumPeriod` - Tipos literales
- `PendulumQueryRequest`, `PendulumQueryResponse` - Request/Response de consulta
- `PendulumHistoryItem`, `PendulumStats`, `PendulumCapabilities` - Datos históricos y capacidades
- `PENDULUM_RESPONSE_CONFIG`, `PENDULUM_MOVEMENT_CONFIG` - Helpers con colores y etiquetas

✅ **Validaciones:**
- Format sin cambios
- Lint sin errores
- Type-check sin errores
- Build exitoso
- Validador de arquitectura OK

✅ **Tests agregados (PR #332 - Feedback):**
- `frontend/src/lib/api/pendulum-api.test.ts` - 13 tests passing
  - `queryPendulum()` - Tests para consultas con/sin pregunta, diferentes respuestas y movimientos
  - `getPendulumHistory()` - Tests para historial completo, filtrado por límite y tipo de respuesta
  - `getPendulumStats()` - Tests para estadísticas y distribución de respuestas
  - `deletePendulumQuery()` - Tests para eliminación de consultas por ID
- Coverage completo de todas las funciones de API
- Patrón consistente con otros tests de API del proyecto

**Fecha de completación:** 4 de febrero de 2026

---

### TASK-506: Crear hooks del Péndulo

**Estado:** ✅ COMPLETADA

**Módulo:** `frontend/src/hooks/api/`
**Prioridad:** ALTA
**Estimación:** 0.25 días
**Dependencias:** TASK-505

#### Archivo: `usePendulum.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  queryPendulum,
  getPendulumHistory,
  getPendulumStats,
  deletePendulumQuery,
} from '@/lib/api/pendulum-api';
import type { PendulumQueryRequest, PendulumResponse } from '@/types/pendulum.types';
import { useUserCapabilities } from './useUserCapabilities';

export const pendulumKeys = {
  all: ['pendulum'] as const,
  history: (limit?: number, filter?: PendulumResponse) =>
    [...pendulumKeys.all, 'history', { limit, filter }] as const,
  stats: () => [...pendulumKeys.all, 'stats'] as const,
};

export function usePendulumQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PendulumQueryRequest) => queryPendulum(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendulumKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user', 'capabilities'] });
    },
  });
}

export function usePendulumHistory(limit?: number, filter?: PendulumResponse) {
  return useQuery({
    queryKey: pendulumKeys.history(limit, filter),
    queryFn: () => getPendulumHistory(limit, filter),
  });
}

export function usePendulumStats() {
  return useQuery({
    queryKey: pendulumKeys.stats(),
    queryFn: getPendulumStats,
  });
}

export function useDeletePendulumQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queryId: number) => deletePendulumQuery(queryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendulumKeys.all });
    },
  });
}

export function usePendulumCapabilities() {
  const { data: capabilities } = useUserCapabilities();
  return capabilities?.pendulum ?? null;
}
```

#### Resultados

✅ **Archivos creados:**
- `frontend/src/hooks/api/usePendulum.ts` - Hooks de TanStack Query para el péndulo
- `frontend/src/hooks/api/usePendulum.test.ts` - Tests completos (12 tests passing)

✅ **Archivos modificados:**
- `frontend/src/types/capabilities.types.ts` - Agregado `PendulumFeatureLimit` interface y campo `pendulum` en `UserCapabilities`
- `frontend/src/types/index.ts` - Exportado `PendulumFeatureLimit`
- `frontend/src/test/factories/capabilities.factory.ts` - Agregados mocks para péndulo en todos los factories

✅ **Hooks implementados:**
- `usePendulumQuery()` - Mutation para consultar el péndulo con invalidación de capabilities
- `usePendulumHistory()` - Query para historial con filtros opcionales (límite y tipo de respuesta)
- `usePendulumStats()` - Query para estadísticas del usuario
- `useDeletePendulumQuery()` - Mutation para eliminar consulta del historial
- `usePendulumCapabilities()` - Helper para obtener capacidades del péndulo desde UserCapabilities
- `pendulumKeys` - Query keys centralizados

✅ **Tests:**
- 12 tests pasando (100% coverage)
- Tests incluyen: query keys correctos, mutations con invalidaciones, queries con filtros, manejo de capabilities

✅ **Validaciones:**
- Format sin cambios
- Lint sin errores
- Type-check sin errores ✅ (arreglados 8 errores en factories/mocks)
- Build exitoso
- Test suite completo: 1263 tests passing
- Validador de arquitectura OK

**Fecha de completación:** 4 de febrero de 2026

---

### TASK-507: Crear componentes del Péndulo

**Estado:** ✅ COMPLETADA

**Módulo:** `frontend/src/components/features/pendulum/`
**Prioridad:** ALTA
**Estimación:** 1 día
**Dependencias:** TASK-506

#### Componentes a crear

**1. `Pendulum.tsx` - Animación principal**

```typescript
'use client';

import { cn } from '@/lib/utils';
import type { PendulumMovement } from '@/types/pendulum.types';

interface PendulumProps {
  movement: PendulumMovement | 'idle' | 'searching';
  isGlowing?: boolean;
  className?: string;
}

export function Pendulum({ movement, isGlowing, className }: PendulumProps) {
  const getAnimationClass = () => {
    switch (movement) {
      case 'idle': return 'animate-pendulum-idle';
      case 'searching': return 'animate-pendulum-search';
      case 'vertical': return 'animate-pendulum-vertical';
      case 'horizontal': return 'animate-pendulum-horizontal';
      case 'circular': return 'animate-pendulum-circular';
      default: return 'animate-pendulum-idle';
    }
  };

  return (
    <div className={cn('relative h-[250px] w-full flex justify-center', className)}>
      {/* Soporte */}
      <div className="absolute top-0 w-16 h-3 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-b-lg shadow-md" />

      {/* Cadena + Péndulo */}
      <div
        className={cn(
          'absolute top-3 origin-top',
          getAnimationClass(),
        )}
      >
        {/* Cadena */}
        <div className="w-0.5 h-32 bg-gradient-to-b from-zinc-400 to-zinc-500 mx-auto" />

        {/* Cristal de cuarzo */}
        <div
          className={cn(
            'w-8 h-12 mx-auto -mt-1',
            'bg-gradient-to-b from-white/90 via-purple-100/80 to-purple-200/70',
            'rounded-b-full shadow-lg',
            'border border-white/50',
            isGlowing && 'animate-pulse shadow-purple-400/50 shadow-xl',
          )}
          style={{
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 50% 100%, 0% 30%)',
          }}
        />
      </div>
    </div>
  );
}
```

**2. `PendulumDisclaimer.tsx` - Modal de disclaimer (antes de cada consulta)**

```typescript
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface PendulumDisclaimerProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * Modal de disclaimer que se muestra ANTES DE CADA CONSULTA al péndulo.
 * El usuario debe aceptar cada vez que quiera consultar.
 */
export function PendulumDisclaimer({ open, onAccept, onCancel }: PendulumDisclaimerProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Aviso Importante</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3 pt-2">
            <p>
              El Péndulo Digital es una herramienta de <strong>entretenimiento</strong> basada
              en tradiciones espirituales ancestrales.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>No sustituye el consejo de profesionales de salud, legales o financieros</li>
              <li>Las respuestas son generadas aleatoriamente</li>
              <li>No debe usarse para tomar decisiones importantes</li>
            </ul>
            <p className="text-sm">
              Al continuar, confirmas que entiendes que esto es solo para entretenimiento.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAccept} className="w-full sm:w-auto">
            Entiendo y Acepto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**3. `PendulumLimitBanner.tsx` - Indicador de límites**

```typescript
'use client';

import { usePendulumCapabilities } from '@/hooks/api/usePendulum';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function PendulumLimitBanner() {
  const capabilities = usePendulumCapabilities();

  if (!capabilities) return null;

  const { used, limit, canUse, resetAt, period } = capabilities;
  const remaining = limit - used;

  if (canUse && remaining > 0) {
    return (
      <div className="text-sm text-muted-foreground text-center">
        {period === 'lifetime' ? (
          <span>Tienes <strong>1 consulta gratuita</strong> disponible</span>
        ) : (
          <span>
            <strong>{remaining}</strong> de {limit} consultas disponibles
            {period === 'monthly' ? ' este mes' : ' hoy'}
          </span>
        )}
      </div>
    );
  }

  // Límite alcanzado
  return (
    <Alert variant="warning" className="mb-4">
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {period === 'lifetime' ? (
            'Ya usaste tu consulta gratuita'
          ) : period === 'monthly' ? (
            `Límite mensual alcanzado. Se reinicia el día 1.`
          ) : (
            `Límite diario alcanzado. ${resetAt ? `Se reinicia ${new Date(resetAt).toLocaleTimeString()}` : ''}`
          )}
        </span>
        {period !== 'daily' && (
          <Button size="sm" variant="outline" asChild>
            <Link href="/premium">
              <Sparkles className="h-3 w-3 mr-1" />
              {period === 'lifetime' ? 'Registrarse' : 'Upgrade'}
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

**4. `PendulumResponse.tsx` - Mostrar respuesta**

```typescript
'use client';

import { cn } from '@/lib/utils';
import type { PendulumQueryResponse } from '@/types/pendulum.types';
import { PENDULUM_RESPONSE_CONFIG } from '@/types/pendulum.types';
import { Card } from '@/components/ui/card';
import { Moon } from 'lucide-react';

interface PendulumResponseDisplayProps {
  response: PendulumQueryResponse;
  className?: string;
}

export function PendulumResponseDisplay({ response, className }: PendulumResponseDisplayProps) {
  const config = PENDULUM_RESPONSE_CONFIG[response.response];

  return (
    <Card className={cn('p-6 text-center space-y-4', className)}>
      {/* Respuesta principal */}
      <div className={cn('text-5xl font-serif', config.color)}>
        {response.responseText}
      </div>

      {/* Interpretación */}
      <p className="text-muted-foreground italic text-lg">
        "{response.interpretation}"
      </p>

      {/* Fase lunar */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Moon className="h-4 w-4" />
        <span>{response.lunarPhaseName}</span>
      </div>
    </Card>
  );
}
```

**5. `PendulumBlockedContent.tsx` - Alerta de contenido bloqueado**

```typescript
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { ShieldAlert } from 'lucide-react';

interface PendulumBlockedContentProps {
  open: boolean;
  category: string;
  onClose: () => void;
}

const CATEGORY_MESSAGES: Record<string, { title: string; recommendation: string }> = {
  salud: {
    title: 'Tema de Salud Detectado',
    recommendation: 'Te recomendamos consultar con un profesional de la salud.',
  },
  legal: {
    title: 'Tema Legal Detectado',
    recommendation: 'Te recomendamos consultar con un abogado o profesional legal.',
  },
  financiero: {
    title: 'Tema Financiero Detectado',
    recommendation: 'Te recomendamos consultar con un asesor financiero profesional.',
  },
  default: {
    title: 'Contenido Sensible Detectado',
    recommendation: 'Te recomendamos consultar con un profesional apropiado.',
  },
};

export function PendulumBlockedContent({ open, category, onClose }: PendulumBlockedContentProps) {
  const message = CATEGORY_MESSAGES[category] || CATEGORY_MESSAGES.default;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>{message.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tu pregunta toca temas sensibles que no podemos abordar a través del péndulo.
            </p>
            <p className="font-medium">
              {message.recommendation}
            </p>
            <p className="text-sm">
              No se ha consumido tu consulta. Puedes modificar tu pregunta o continuar con una pregunta mental.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**6. `index.ts` - Exports**

```typescript
export { Pendulum } from './Pendulum';
export { PendulumDisclaimer } from './PendulumDisclaimer';
export { PendulumLimitBanner } from './PendulumLimitBanner';
export { PendulumResponseDisplay } from './PendulumResponse';
export { PendulumBlockedContent } from './PendulumBlockedContent';
```

#### Testing

- [x] Test: Pendulum renderiza correctamente con diferentes movements (idle, searching, vertical, horizontal, circular)
- [x] Test: Pendulum muestra efecto glowing cuando isGlowing=true
- [x] Test: PendulumDisclaimer se abre y cierra correctamente
- [x] Test: PendulumDisclaimer muestra texto de entretenimiento y disclaimer points
- [x] Test: PendulumDisclaimer llama onAccept y onCancel según botón clickeado
- [x] Test: PendulumLimitBanner muestra consultas restantes (lifetime, monthly, daily)
- [x] Test: PendulumLimitBanner muestra mensaje de límite alcanzado con CTA correcto
- [x] Test: PendulumResponse muestra respuesta, interpretación y fase lunar
- [x] Test: PendulumResponse aplica color correcto según tipo de respuesta
- [x] Test: PendulumBlockedContent muestra mensajes por categoría (health, legal, financial)
- [x] Test: PendulumBlockedContent llama onClose cuando se cierra
- [x] Todos los 39 tests passing ✅

#### Resultados

✅ **Archivos creados:**
- `frontend/src/components/features/pendulum/Pendulum.tsx`
- `frontend/src/components/features/pendulum/Pendulum.test.tsx`
- `frontend/src/components/features/pendulum/PendulumDisclaimer.tsx`
- `frontend/src/components/features/pendulum/PendulumDisclaimer.test.tsx`
- `frontend/src/components/features/pendulum/PendulumLimitBanner.tsx`
- `frontend/src/components/features/pendulum/PendulumLimitBanner.test.tsx`
- `frontend/src/components/features/pendulum/PendulumResponse.tsx`
- `frontend/src/components/features/pendulum/PendulumResponse.test.tsx`
- `frontend/src/components/features/pendulum/PendulumBlockedContent.tsx`
- `frontend/src/components/features/pendulum/PendulumBlockedContent.test.tsx`
- `frontend/src/components/features/pendulum/index.ts`

✅ **Validaciones:**
- Lint sin errores (npm run lint:fix)
- Format aplicado (npm run format)
- Type-check exitoso (npm run type-check)
- Build exitoso (npm run build)
- Validador de arquitectura OK (node scripts/validate-architecture.js)
- Tests: 39/39 passing ✅

✅ **Cobertura de tests:**
- Pendulum.test.tsx: 9 tests
- PendulumDisclaimer.test.tsx: 7 tests
- PendulumLimitBanner.test.tsx: 8 tests  
- PendulumResponse.test.tsx: 7 tests
- PendulumBlockedContent.test.tsx: 8 tests

**Fecha de completación:** 4 de febrero de 2026

---

### TASK-508: Crear página del Péndulo

**Estado:** ✅ COMPLETADA

**Módulo:** `frontend/src/app/pendulo/`
**Prioridad:** ALTA
**Estimación:** 0.5 días
**Dependencias:** TASK-507

#### Archivo: `page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Pendulum,
  PendulumDisclaimer,
  PendulumLimitBanner,
  PendulumResponseDisplay,
  PendulumBlockedContent,
} from '@/components/features/pendulum';
import { usePendulumQuery, usePendulumCapabilities } from '@/hooks/api/usePendulum';
import { useAuthStore } from '@/stores/authStore';
import type { PendulumMovement, PendulumQueryResponse } from '@/types/pendulum.types';
import { UserPlan } from '@/types/user.types';

export default function PenduloPage() {
  const { user } = useAuthStore();
  const capabilities = usePendulumCapabilities();
  const { mutateAsync: queryPendulum, isPending } = usePendulumQuery();

  // Estado para mostrar el disclaimer ANTES de cada consulta
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [question, setQuestion] = useState('');
  const [movement, setMovement] = useState<PendulumMovement | 'idle' | 'searching'>('idle');
  const [response, setResponse] = useState<PendulumQueryResponse | null>(null);
  const [blockedContent, setBlockedContent] = useState<{ open: boolean; category: string }>({
    open: false,
    category: '',
  });

  const isPremium = user?.plan === UserPlan.PREMIUM;
  const canUse = capabilities?.canUse ?? true;

  // Cuando el usuario hace clic en "Consultar", mostramos el disclaimer
  const handleConsultClick = () => {
    if (!canUse) return;
    setShowDisclaimer(true);
  };

  // Cuando el usuario acepta el disclaimer, ejecutamos la consulta
  const handleDisclaimerAccept = async () => {
    setShowDisclaimer(false);
    await executeQuery();
  };

  // Cuando el usuario cancela el disclaimer
  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false);
  };

  // Ejecutar la consulta al péndulo
  const executeQuery = async () => {
    setResponse(null);
    setMovement('searching');

    try {
      const result = await queryPendulum({ question: isPremium ? question : undefined });

      // Mostrar animación de respuesta
      setTimeout(() => {
        setMovement(result.movement);
        setTimeout(() => {
          setResponse(result);
        }, 2000);
      }, 3000);
    } catch (error: any) {
      setMovement('idle');

      if (error.response?.data?.code === 'BLOCKED_CONTENT') {
        setBlockedContent({
          open: true,
          category: error.response.data.category,
        });
      }
    }
  };

  const handleReset = () => {
    setResponse(null);
    setQuestion('');
    setMovement('idle');
  };

  return (
    <>
      {/* Modal de disclaimer - aparece CADA VEZ antes de consultar */}
      <PendulumDisclaimer
        open={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onCancel={handleDisclaimerCancel}
      />

      <div className="container mx-auto py-8 px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-2">Péndulo Digital</h1>
          <p className="text-muted-foreground">
            Formula tu pregunta y deja que el péndulo te guíe
          </p>
        </div>

        {/* Límites */}
        <PendulumLimitBanner />

        {/* Área del péndulo */}
        <Card className="p-6 mb-6">
          <div className="flex justify-end mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Cómo usar el péndulo</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                  <p>
                    El péndulo es una herramienta de adivinación que responde preguntas
                    de sí o no mediante el movimiento.
                  </p>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Movimientos:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Vertical:</strong> Sí</li>
                      <li><strong>Horizontal:</strong> No</li>
                      <li><strong>Circular:</strong> Quizás</li>
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Péndulo animado */}
          <Pendulum
            movement={movement}
            isGlowing={!!response}
          />

          {/* Respuesta */}
          {response && (
            <PendulumResponseDisplay response={response} className="mt-6" />
          )}
        </Card>

        {/* Controles */}
        {!response ? (
          <Card className="p-6">
            {/* Input de pregunta (solo Premium) */}
            {isPremium && (
              <div className="mb-4">
                <Input
                  placeholder="Escribe tu pregunta (opcional)..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isPending || !canUse}
                />
              </div>
            )}

            {!isPremium && (
              <p className="text-sm text-muted-foreground text-center mb-4">
                Formula tu pregunta mentalmente antes de consultar
              </p>
            )}

            <Button
              onClick={handleConsultClick}
              disabled={isPending || !canUse}
              className="w-full"
              size="lg"
            >
              {isPending ? 'Consultando...' : 'Consultar al Péndulo'}
            </Button>
          </Card>
        ) : (
          <Button onClick={handleReset} variant="outline" className="w-full">
            Nueva consulta
          </Button>
        )}
      </div>

      {/* Modal de contenido bloqueado */}
      <PendulumBlockedContent
        open={blockedContent.open}
        category={blockedContent.category}
        onClose={() => setBlockedContent({ open: false, category: '' })}
      />
    </>
  );
}
```

#### Resultados

✅ **Archivos creados:**
- `frontend/src/app/pendulo/page.tsx` - Página del péndulo
- `frontend/src/app/pendulo/page.test.tsx` - Tests comprehensivos (26 tests)

✅ **Validaciones:**
- Format sin errores
- Lint sin errores
- Type-check exitoso
- 26/26 tests pasando
- Build exitoso
- Architecture validation completa (con warnings menores)

✅ **Funcionalidades implementadas:**
- Disclaimer obligatorio antes de cada consulta
- Input de pregunta solo para usuarios Premium
- Animación del péndulo (idle, searching, vertical, horizontal, circular)
- Display de respuesta con interpretación
- Botón "Nueva consulta" para reset
- Modal de contenido bloqueado
- Banner de límites de uso
- Integración con sistema de capacidades

**Fecha de completación:** 4 de febrero de 2026

---

### TASK-509: Crear animaciones CSS

**Estado:** ✅ COMPLETADA

**Módulo:** `frontend/src/app/globals.css`
**Prioridad:** MEDIA
**Estimación:** 0.25 días
**Dependencias:** TASK-507

#### Descripción

Agregar animaciones CSS para el péndulo digital al archivo de estilos globales.

#### Animaciones implementadas

```css
@keyframes pendulum-idle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes pendulum-search {
  0% { transform: rotate(-15deg); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
  100% { transform: rotate(-15deg); }
}

@keyframes pendulum-vertical {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(0deg) translateY(20px); }
}

@keyframes pendulum-horizontal {
  0%, 100% { transform: rotate(-25deg); }
  50% { transform: rotate(25deg); }
}

@keyframes pendulum-circular {
  0% { transform: rotate(0deg) translateX(10px); }
  25% { transform: rotate(90deg) translateX(10px); }
  50% { transform: rotate(180deg) translateX(10px); }
  75% { transform: rotate(270deg) translateX(10px); }
  100% { transform: rotate(360deg) translateX(10px); }
}

.animate-pendulum-idle {
  animation: pendulum-idle 3s ease-in-out infinite;
}

.animate-pendulum-search {
  animation: pendulum-search 0.5s ease-in-out infinite;
}

.animate-pendulum-vertical {
  animation: pendulum-vertical 1s ease-in-out infinite;
}

.animate-pendulum-horizontal {
  animation: pendulum-horizontal 1s ease-in-out infinite;
}

.animate-pendulum-circular {
  animation: pendulum-circular 2s linear infinite;
}
```

#### Resultados

✅ **Archivo modificado:**
- `frontend/src/app/globals.css` - Agregadas 5 keyframes y 5 clases de animación

✅ **Animaciones implementadas:**
- `animate-pendulum-idle` - Balanceo suave en reposo (±3deg, 3s)
- `animate-pendulum-search` - Movimiento errático buscando respuesta (±15deg, 0.5s)
- `animate-pendulum-vertical` - Respuesta SÍ (adelante-atrás, 1s)
- `animate-pendulum-horizontal` - Respuesta NO (izquierda-derecha, 1s)
- `animate-pendulum-circular` - Respuesta QUIZÁS (circular, 2s)

✅ **Validaciones:**
- Format sin cambios
- Lint sin errores
- Type-check sin errores
- Tests: 2952/2952 pasando
- Build exitoso
- Validador de arquitectura OK

**Fecha de completación:** 4 de febrero de 2026

---

## 5. RESUMEN DE TAREAS

| ID | Tarea | Estimación | Dependencias |
|----|-------|------------|--------------|
| TASK-500 | Crear entidades del Péndulo | 0.5 días | - |
| TASK-501 | Crear migración y seeder | 0.5 días | TASK-500 |
| TASK-502 | Extender sistema de límites | 0.5 días | TASK-500 |
| TASK-503 | Crear servicios del Péndulo | 0.5 días | TASK-500, 501, 502 |
| TASK-504 | Crear endpoints del Péndulo | 0.5 días | TASK-502, 503 |
| TASK-505 | Crear tipos TypeScript y API | 0.25 días | TASK-504 |
| TASK-506 | Crear hooks del Péndulo | 0.25 días | TASK-505 |
| TASK-507 | Crear componentes del Péndulo | 1 día | TASK-506 |
| TASK-508 | Crear página del Péndulo | 0.5 días | TASK-507 |
| TASK-509 | Crear animaciones CSS | 0.25 días | TASK-507 |

**Total estimado:** 4.75 días

---

## 6. ORDEN DE IMPLEMENTACIÓN

```
FASE 1: Backend Base (1.5 días)
├── TASK-500: Entidades
├── TASK-501: Migración y seeder
└── TASK-502: Sistema de límites

FASE 2: Backend Servicios (1 día)
├── TASK-503: Servicios
└── TASK-504: Endpoints

FASE 3: Frontend (2.25 días)
├── TASK-505: Types y API
├── TASK-506: Hooks
├── TASK-507: Componentes
├── TASK-508: Página
└── TASK-509: Animaciones
```

---

## 7. CHECKLIST DE COMPLETITUD

### Backend
- [ ] Entidades creadas y funcionando
- [ ] Migración ejecutada
- [ ] Seeder con 30 interpretaciones
- [ ] Sistema de límites extendido (lifetime, mensual, diario)
- [ ] Servicios con tests
- [ ] Endpoints funcionando y documentados en Swagger
- [ ] Validación de contenido prohibido
- [ ] Integración con UsageLimitsModule

### Frontend
- [ ] Tipos TypeScript completos
- [ ] API functions
- [ ] Hooks con React Query
- [ ] Componente Pendulum con animaciones
- [ ] Modal de disclaimer
- [ ] Banner de límites
- [ ] Display de respuesta con interpretación
- [ ] Modal de contenido bloqueado
- [ ] Página principal funcional
- [ ] Animaciones CSS

### Testing
- [ ] Tests unitarios backend (servicios)
- [ ] Tests de integración backend (endpoints)
- [ ] Tests de componentes frontend
- [ ] Test E2E flujo completo

---

## 8. HALLAZGOS DE TESTING (5 de febrero de 2026)

### 🔍 Testing Realizado por: AI Senior Tester
**Fecha:** 5 de febrero de 2026  
**Servidores:** Backend (localhost:3000), Frontend (localhost:3001)  
**Usuarios de prueba creados:**
- Admin: admin@test.com (ID: 4, Plan: PREMIUM)
- Free: tester.free@test.com (ID: 126, Plan: FREE)
- Premium: tester.premium@test.com (ID: 127, Plan: PREMIUM)
- Anónimo: Sin autenticación (fingerprint-based)

---

### ✅ FUNCIONALIDADES OPERATIVAS

#### TASK-500 & TASK-501: Entidades y Migraciones
- ✅ Tablas creadas correctamente (`pendulum_queries`, `pendulum_interpretations`)
- ✅ Endpoint responde y retorna interpretaciones

#### TASK-504: Endpoints Básicos
- ✅ `POST /api/v1/pendulum/query` funciona para usuarios anónimos
- ✅ `POST /api/v1/pendulum/query` funciona para usuarios FREE
- ✅ `POST /api/v1/pendulum/query` funciona para usuarios PREMIUM
- ✅ Respuestas aleatorias (yes/no/maybe) se generan correctamente
- ✅ Interpretaciones se obtienen de la base de datos
- ✅ Fase lunar se incluye en la respuesta
- ✅ Usuarios FREE no pueden enviar preguntas escritas (se ignoran correctamente)

---

### 🐛 PROBLEMAS CRÍTICOS ENCONTRADOS

#### **PROBLEMA #1: Historial NO se guarda para usuarios Premium**
**Severidad:** 🔴 CRÍTICA  
**Estado:** 🚨 BLOQUEANTE PARA RELEASE  
**Módulo:** Backend - `PendulumService` / `PendulumController`

**Descripción:**
A pesar de que el código está implementado correctamente, las consultas de usuarios Premium NO se están guardando en la base de datos.

**Evidencia:**
```bash
# Test realizado:
curl -X POST http://localhost:3000/api/v1/pendulum/query \
  -H "Authorization: Bearer [PREMIUM_TOKEN]" \
  -d '{"question":"¿Funciona el péndulo?"}'

# Respuesta recibida:
{
  "response": "yes",
  "queryId": null,  # ❌ DEBERÍA SER UN NÚMERO
  ...
}

# Verificación de historial:
curl -X GET http://localhost:3000/api/v1/pendulum/history \
  -H "Authorization: Bearer [PREMIUM_TOKEN]"

# Respuesta:
[]  # ❌ DEBERÍA TENER AL MENOS 1 REGISTRO
```

**Comportamiento Esperado:**
- Usuario Premium hace consulta → `queryId` retorna número válido
- Usuario Premium accede a `/pendulum/history` → Retorna array con sus consultas
- Cada consulta debe incluir: id, question, response, interpretation, lunarPhase, createdAt

**Comportamiento Actual:**
- `queryId` siempre retorna `null`
- El historial siempre retorna array vacío `[]`

**Análisis Técnico:**
El código en `PendulumService.query()` (líneas 87-97) parece correcto:
```typescript
if (userId) {
  const savedQuery = await this.saveQuery(...);
  queryId = savedQuery.id;
}
```

**Posibles Causas:**
1. La transacción de guardado no se está committeando
2. Error silencioso en `queryRepository.save()` que no se está propagando
3. El `userId` no está llegando correctamente al servicio
4. Problema con la relación de foreign key con la tabla `users`

**Impacto:**
- ❌ Usuarios Premium NO pueden ver su historial
- ❌ Función principal del plan Premium inutilizable
- ❌ No se pueden probar estadísticas ni eliminación de consultas
- ❌ Mala experiencia de usuario para clientes de pago

**Tareas de Corrección Sugeridas:**
1. Agregar logging en `PendulumService.saveQuery()` para ver si se está llamando
2. Verificar que `userId` llega correctamente desde el controller
3. Verificar que la relación con `User` entity está bien configurada
4. Agregar try-catch específico en `saveQuery()` para capturar errores
5. Verificar permisos de BD y constraints de la tabla `pendulum_queries`

---

#### **PROBLEMA #2: Límite lifetime de usuarios anónimos NO funciona**
**Severidad:** 🔴 CRÍTICA  
**Estado:** 🚨 BLOQUEANTE PARA RELEASE  
**Módulo:** Backend - `CheckUsageLimitGuard` / `AnonymousTrackingService`

**Descripción:**
Los usuarios anónimos pueden hacer consultas ilimitadas sin restricción, cuando según los requisitos deberían tener **solo 1 consulta de por vida** (lifetime).

**Evidencia:**
```bash
# Test realizado (sin token de autenticación):
# Primera consulta:
curl -X POST http://localhost:3000/api/v1/pendulum/query -d '{}'
# Respuesta: 200 OK ✅

# Segunda consulta (debería fallar):
curl -X POST http://localhost:3000/api/v1/pendulum/query -d '{}'
# Respuesta: 200 OK ❌ (DEBERÍA SER 403 FORBIDDEN)

# Tercera consulta:
curl -X POST http://localhost:3000/api/v1/pendulum/query -d '{}'
# Respuesta: 200 OK ❌
```

**Comportamiento Esperado:**
- Usuario anónimo hace 1ra consulta → 200 OK
- Usuario anónimo hace 2da consulta → 403 Forbidden con mensaje de límite alcanzado

**Comportamiento Actual:**
- Usuario anónimo puede hacer infinitas consultas sin restricción

**Análisis Técnico:**
Según el diseño en TASK-502, se implementó:
- `AnonymousTrackingService.canAccessLifetime()` - Para validar 1 uso de por vida
- `CheckUsageLimitGuard` - Debería aplicar lógica de período lifetime

**Posibles Causas:**
1. El fingerprint no se está generando o no es consistente entre requests
2. La lógica de `period: 'lifetime'` en el guard no está implementada correctamente
3. El guard no está validando anónimos correctamente
4. El decorador `@AllowAnonymous()` está bypasseando la validación de límites

**Impacto:**
- ❌ Usuarios anónimos tienen acceso ilimitado (no incentiva registro)
- ❌ No se cumple el modelo de negocio (1 consulta gratis)
- ❌ Riesgo de abuso del sistema sin autenticación
- ❌ Carga innecesaria en el backend y BD

**Tareas de Corrección Sugeridas:**
1. Verificar que `generateFingerprint()` está funcionando correctamente
2. Agregar logging en `CheckUsageLimitGuard` para ver si se valida período lifetime
3. Verificar que `AllowAnonymous` decorator no está bypasseando todo
4. Testear manualmente la tabla `anonymous_usage` para ver si se están guardando registros
5. Revisar la integración entre `CheckUsageLimitGuard` y `AnonymousTrackingService`

---

### ⚠️ FUNCIONALIDADES NO TESTEADAS (Bloqueadas)

#### **Validación de Contenido Prohibido**
**Estado:** ⏸️ NO TESTEADO  
**Razón:** Usuarios Premium alcanzaron límite diario (1 consulta/día)  
**Test Pendiente:**
```bash
# Debería bloquear:
curl -X POST /api/v1/pendulum/query \
  -H "Authorization: Bearer [PREMIUM_TOKEN]" \
  -d '{"question":"¿Tengo cáncer?"}'

# Respuesta esperada: 400 Bad Request con mensaje de contenido bloqueado
```

**Palabras a testear:**
- Salud: cáncer, enfermedad, muerte, suicidio, diagnóstico
- Legal: juicio, cárcel, demanda, arresto
- Financiero: inversión, bitcoin, lotería, casino
- Violencia: matar, herir, venganza

#### **Endpoint GET /pendulum/history/stats**
**Estado:** ⏸️ NO TESTEADO  
**Razón:** Historial vacío (Problema #1)

#### **Endpoint DELETE /pendulum/history/:id**
**Estado:** ⏸️ NO TESTEADO  
**Razón:** Historial vacío (Problema #1)

#### **Límite mensual de usuarios FREE**
**Estado:** ⏸️ PARCIALMENTE TESTEADO  
**Razón:** Se hizo 1 consulta exitosa, falta testear el límite de 3/mes

---

### 📊 RESUMEN DE COBERTURA DE TESTING

| Componente | Estado | Cobertura | Problemas Encontrados |
|------------|--------|-----------|----------------------|
| **Backend Endpoints** | 🟡 Parcial | 60% | Problema #1, #2 |
| POST /pendulum/query | ✅ Funciona | 100% | - |
| GET /pendulum/history | 🐛 Bug crítico | 0% | Problema #1 |
| GET /pendulum/history/stats | ⏸️ No testeado | 0% | Bloqueado por #1 |
| DELETE /pendulum/history/:id | ⏸️ No testeado | 0% | Bloqueado por #1 |
| **Sistema de Límites** | 🔴 Fallas críticas | 33% | Problema #2 |
| Límite lifetime anónimos | 🐛 Bug crítico | 0% | Problema #2 |
| Límite mensual FREE | 🟡 Parcial | 50% | - |
| Límite diario Premium | ✅ Funciona | 100% | - |
| **Validaciones** | ⏸️ No testeado | 0% | Bloqueado por límites |
| Contenido prohibido | ⏸️ Bloqueado | 0% | - |
| **Frontend Componentes** | 🟡 Parcial | 90% | Problema #3, #4 |
| Componentes UI | ✅ Implementados | 100% | - |
| CTAs y Links | 🐛 Link roto | 50% | Problema #3 |
| Botón Info | 🐛 Faltante | 0% | Problema #4 |
| Tests Unitarios | ✅ Pasando | 100% | 64/64 tests ✅ |

---

### 🎯 ACCIONES REQUERIDAS ANTES DE RELEASE

#### Prioridad 1 - BLOQUEANTES 🚨
1. **FIX PROBLEMA #1:** Implementar guardado correcto de historial Premium (Backend)
2. **FIX PROBLEMA #2:** Implementar límite lifetime para anónimos (Backend)
3. **FIX PROBLEMA #3:** Corregir CTA de Upgrade/Registrarse que apunta a /premium (404) (Frontend)
4. **TESTEAR:** Validación de contenido prohibido (Backend)
5. **TESTEAR:** Endpoints de historial (stats, delete) (Backend)

#### Prioridad 2 - IMPORTANTES ⚠️
6. **IMPLEMENTAR PROBLEMA #4:** Agregar botón de Info con Sheet explicativo (Frontend)
7. **TESTEAR:** Límite mensual completo de FREE (3 consultas) (Backend)
8. **TESTEAR:** Frontend completo con Playwright después de fixes (E2E)
9. **VERIFICAR:** Seeder de 30 interpretaciones (contar registros en BD) (Backend)

#### Prioridad 3 - MEJORAS 💡
10. Agregar endpoint admin para resetear límites de testing
11. Mejorar mensajes de error cuando se alcanza límite
12. Agregar logging más detallado en guards y servicios
13. Considerar crear página /premium o /planes dedicada

---

### 🐛 PROBLEMAS ADICIONALES ENCONTRADOS EN FRONTEND

#### **PROBLEMA #3: CTA de "Upgrade" y "Registrarse" apunta a ruta inexistente** 🔴
**Severidad:** 🔴 ALTA  
**Estado:** 🚨 BLOQUEA UX  
**Módulo:** Frontend - `PendulumLimitBanner.tsx`

**Descripción:**
Los botones de llamado a la acción (CTA) cuando el usuario alcanza su límite apuntan a `/premium`, una ruta que **NO EXISTE** en la aplicación.

**Ubicación:**
- Archivo: `frontend/src/components/features/pendulum/PendulumLimitBanner.tsx`
- Línea: 48

**Código problemático:**
```tsx
<Link href="/premium">
  <Sparkles className="mr-1 h-3 w-3" />
  {period === 'lifetime' ? 'Registrarse' : 'Upgrade'}
</Link>
```

**Evidencia:**
```bash
# Rutas disponibles en la app (no existe /premium):
frontend/src/app/admin
frontend/src/app/carta-del-dia
frontend/src/app/explorar
frontend/src/app/login
frontend/src/app/registro
# ... etc (NO HAY /premium)
```

**Comportamiento Actual:**
1. Usuario anónimo alcanza su 1 consulta gratis
2. Ve banner con botón "Registrarse"
3. Hace clic → **404 Not Found**

**Impacto:**
- ❌ Usuario frustrado cuando intenta registrarse/upgrade
- ❌ Pérdida de conversiones (anónimo → registrado, free → premium)
- ❌ Experiencia de usuario rota en flujo crítico de monetización

**Solución Requerida:**

**Opción 1 - Crear página /premium:**
```bash
mkdir frontend/src/app/premium
# Crear page.tsx con info de planes y beneficios
```

**Opción 2 - Redirigir a rutas existentes (RECOMENDADO):**
```tsx
// Para usuarios anónimos (lifetime):
<Link href="/registro">Registrarse</Link>

// Para usuarios FREE (monthly):
<Link href="/perfil">Upgrade a Premium</Link>
// O si existe:
<Link href="/planes">Upgrade a Premium</Link>
```

**Tareas de Corrección:**
1. Decidir flujo de upgrade (¿página dedicada o modal?)
2. Actualizar href en `PendulumLimitBanner.tsx`
3. Testear ambos CTAs (lifetime y monthly)
4. Verificar que no haya otros links rotos en el módulo

---

#### **PROBLEMA #4: Falta botón de "Cómo usar el péndulo" (Info)** 🟡
**Severidad:** 🟡 MEDIA  
**Estado:** ⚠️ FUNCIONALIDAD FALTANTE  
**Módulo:** Frontend - `PendulumConsultation.tsx`

**Descripción:**
Según el backlog (TASK-508), debería existir un botón de Info con un Sheet lateral que explique cómo usar el péndulo y los movimientos. Este componente **NO ESTÁ IMPLEMENTADO**.

**Especificación Original (TASK-508):**
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <Info className="h-4 w-4" />
    </Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Cómo usar el péndulo</SheetTitle>
    </SheetHeader>
    <div className="mt-4 space-y-4 text-sm text-muted-foreground">
      <p>El péndulo es una herramienta de adivinación...</p>
      <div>
        <h4 className="font-medium text-foreground mb-1">Movimientos:</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Vertical:</strong> Sí</li>
          <li><strong>Horizontal:</strong> No</li>
          <li><strong>Circular:</strong> Quizás</li>
        </ul>
      </div>
    </div>
  </SheetContent>
</Sheet>
```

**Código Actual:**
El componente `PendulumConsultation.tsx` NO incluye este Sheet. Solo tiene:
- Header con título
- Límites banner
- Péndulo animado
- Controles de consulta

**Impacto:**
- ⚠️ Usuario nuevo no entiende qué significa cada movimiento
- ⚠️ Falta contexto educativo sobre la herramienta
- ⚠️ Posible confusión sobre cómo interpretar resultados

**Solución Requerida:**
1. Agregar botón de Info en la esquina superior derecha del Card del péndulo
2. Implementar Sheet con explicación de movimientos
3. Incluir breve descripción de la herramienta
4. Testear apertura/cierre del Sheet

**Prioridad:** Media (UX mejorable pero no bloqueante)

---

### 📝 TESTING FRONTEND (Revisión de Código)

Dado que los problemas del backend bloquearon el testing E2E completo, se realizó una **revisión exhaustiva del código del frontend** para validar la implementación:

#### ✅ Componentes Verificados (TASK-507)

**1. `Pendulum.tsx` - Animación del péndulo**
- ✅ Implementado correctamente con 5 estados de movimiento: idle, searching, vertical, horizontal, circular
- ✅ Efecto de brillo (glowing) cuando hay respuesta
- ✅ Clase CSS aplicada según el estado: `animate-pendulum-{movement}`
- ✅ Diseño del cristal de cuarzo con gradientes y clipPath

**2. `PendulumDisclaimer.tsx` - Modal de disclaimer**
- ✅ AlertDialog de shadcn/ui correctamente implementado
- ✅ Muestra advertencia con ícono de AlertTriangle
- ✅ Texto de entretenimiento y disclaimers listados
- ✅ Botones "Cancelar" y "Entiendo y Acepto"
- ✅ Callbacks `onAccept` y `onCancel` implementados

**3. `PendulumLimitBanner.tsx` - Indicador de límites**
- ✅ Integrado con `usePendulumCapabilities()`
- ✅ Muestra consultas restantes según período (lifetime/monthly/daily)
- ✅ Alert cuando límite alcanzado con mensaje específico por plan
- ✅ CTA de "Registrarse" (anónimos) o "Upgrade" (free)

**4. `PendulumResponseDisplay.tsx` - Display de respuesta**
- ✅ Card con respuesta en texto grande (Sí/No/Quizás)
- ✅ Colores dinámicos según tipo de respuesta (config centralizado)
- ✅ Interpretación en texto itálico
- ✅ Ícono de luna con nombre de fase lunar

**5. `PendulumBlockedContent.tsx` - Modal de contenido bloqueado**
- ✅ AlertDialog con categorías específicas (salud, legal, financiero)
- ✅ Mensajes personalizados por categoría con recomendaciones profesionales
- ✅ Indica que no se consumió la consulta
- ✅ Opción de modificar pregunta

#### ✅ Página Principal (TASK-508)

**`PendulumConsultation.tsx`**
- ✅ Estructura correcta con todos los componentes
- ✅ Estado manejado con useState para: showDisclaimer, question, movement, response, blockedContent
- ✅ useRef para prevenir memory leaks en timeouts
- ✅ Integración con `usePendulumQuery()` y `usePendulumCapabilities()`
- ✅ Lógica de disclaimer ANTES de cada consulta (correcto)
- ✅ Input de pregunta solo visible para Premium
- ✅ Manejo de error con `isAxiosError` para contenido bloqueado
- ✅ Animaciones temporales (3s searching + 2s showing result)
- ✅ Botón "Nueva consulta" para resetear estado

#### ✅ Hooks y API (TASK-505 & TASK-506)

**Hooks:**
- ✅ `usePendulumQuery()` - Mutation con invalidación de capabilities
- ✅ `usePendulumHistory()` - Query con filtros opcionales
- ✅ `usePendulumStats()` - Query para estadísticas
- ✅ `useDeletePendulumQuery()` - Mutation para eliminar
- ✅ `usePendulumCapabilities()` - Helper para obtener capacidades

**API Functions:**
- ✅ `queryPendulum()` - POST con pregunta opcional
- ✅ `getPendulumHistory()` - GET con query params
- ✅ `getPendulumStats()` - GET estadísticas
- ✅ `deletePendulumQuery()` - DELETE por ID

**Tipos:**
- ✅ Interfaces completas: `PendulumQueryRequest`, `PendulumQueryResponse`, `PendulumHistoryItem`, `PendulumStats`, `PendulumCapabilities`
- ✅ Tipos literales: `PendulumResponse`, `PendulumMovement`, `PendulumPeriod`
- ✅ Helpers con configuración: `PENDULUM_RESPONSE_CONFIG`, `PENDULUM_MOVEMENT_CONFIG`

#### ✅ Animaciones CSS (TASK-509)

**`globals.css`**
- ✅ 5 keyframes implementados:
  - `pendulum-idle`: Balanceo suave (±3deg, 3s)
  - `pendulum-search`: Movimiento errático (±15deg, 0.5s)
  - `pendulum-vertical`: Sí - adelante-atrás (translateY, 1s)
  - `pendulum-horizontal`: No - izquierda-derecha (±25deg, 1s)
  - `pendulum-circular`: Quizás - circular (360deg + translateX, 2s)
- ✅ Clases utilitarias `.animate-pendulum-{type}` creadas

#### 🟡 Limitaciones del Testing Frontend

**Por qué no se pudo testear con Playwright:**
1. **Problema #1 (Historial)** bloquea testing de historial Premium
2. **Problema #2 (Límites anónimos)** impide validar flujo completo de anónimos
3. Usuarios Premium/Free alcanzaron límite diario, no se pueden crear más consultas

**Testing que NO se pudo realizar:**
- ❌ Flujo E2E completo de usuario anónimo (1 consulta y bloqueo)
- ❌ Flujo E2E de usuario FREE (3 consultas mensuales)
- ❌ Flujo E2E de usuario Premium con historial
- ❌ Validar visualmente las animaciones del péndulo
- ❌ Confirmar que el disclaimer aparece CADA VEZ antes de consultar
- ❌ Validar modal de contenido bloqueado con pregunta real

**Confianza del Frontend:**
- ✅ **ALTA** - El código está bien estructurado y sigue todos los patrones del proyecto
- ✅ Tests unitarios pasando (39/39 componentes, 12/12 hooks, 13/13 API)
- ✅ TypeScript sin errores
- ✅ Build exitoso
- ⚠️ **PENDIENTE** - Testing E2E visual con Playwright cuando se resuelvan bugs del backend

---

### 📝 NOTAS ADICIONALES

**Herramientas Utilizadas:**
- cURL para testing de API REST
- Tokens JWT de usuarios reales
- Testing manual de límites y validaciones
- Revisión exhaustiva de código del frontend

**Limitaciones del Testing:**
- No se pudo acceder directamente a la base de datos para verificar registros
- No se pudo resetear límites de uso entre tests
- Testing E2E del frontend bloqueado por bugs críticos del backend

**Recomendaciones:**
1. **URGENTE:** Crear endpoint de admin temporal para limpiar/resetear límites durante desarrollo
2. Agregar más logging en guards y servicios para debugging
3. Considerar implementar flag de "modo testing" que bypass ciertos límites
4. Agregar tests de integración E2E que cubran estos flujos completos
5. Una vez resueltos Problema #1 y #2, ejecutar suite completa de testing E2E con Playwright

---

---

## 9. HALLAZGOS DE TESTING E2E (5 de febrero de 2026 - Segunda Revisión)

### 🔍 Testing Realizado por: Claude Code (Playwright MCP)
**Fecha:** 5 de febrero de 2026
**Herramientas:** Playwright MCP, cURL, PostgreSQL direct queries
**Método:** Testing E2E automatizado + validación directa de API y base de datos

---

### ✅ FUNCIONALIDADES VERIFICADAS COMO OPERATIVAS

1. **Navegación y UI del Péndulo**
   - ✅ Página `/pendulo` carga correctamente
   - ✅ Header con navegación funciona
   - ✅ Disclaimer modal aparece ANTES de cada consulta
   - ✅ Animación del péndulo funciona (idle → searching → respuesta)
   - ✅ Respuestas se muestran correctamente (Sí/No/Quizás)
   - ✅ Interpretaciones se obtienen de la base de datos
   - ✅ Fase lunar se incluye en la respuesta
   - ✅ Botón "Nueva consulta" resetea el estado

2. **Diferenciación por Plan**
   - ✅ Usuarios anónimos NO ven input de pregunta
   - ✅ Usuarios Premium VEN input de pregunta
   - ✅ Banner de límites muestra información correcta por plan

3. **Sistema de Límites (parcial)**
   - ✅ `usage_limit` table se actualiza correctamente
   - ✅ Límite diario de Premium se aplica después de 1 consulta

---

### 🐛 PROBLEMAS CRÍTICOS CONFIRMADOS Y NUEVOS

#### **PROBLEMA #1: Historial NO se guarda para usuarios Premium**
**Severidad:** 🔴 CRÍTICA (BLOQUEANTE)
**Estado:** ✅ CAUSA RAÍZ IDENTIFICADA
**Archivos afectados:** `pendulum.controller.ts`

**Causa Raíz Identificada:**
El controller usa `user.id` pero el JwtStrategy devuelve `user.userId`:

```typescript
// JwtStrategy devuelve:
return {
  userId: payload.sub,  // ← Propiedad es 'userId'
  plan: payload.plan,
  ...
}

// Controller usa incorrectamente:
const userId = user?.plan === UserPlan.PREMIUM ? user.id : undefined;
//                                               ^^^^^^^ ERROR!
// Debería ser:
const userId = user?.plan === UserPlan.PREMIUM ? user.userId : undefined;
```

**Evidencia:**
```bash
# Tabla pendulum_queries vacía después de consultas:
SELECT * FROM pendulum_queries;
# Resultado: 0 rows

# Pero usage_limit sí se incrementa:
SELECT * FROM usage_limit WHERE feature = 'pendulum_query';
# user_id=4, count=1
```

**Solución:**
Cambiar `user.id` a `user.userId` en `pendulum.controller.ts` (líneas 105, 155, 174, 200, 229)

---

#### **PROBLEMA #2: Límite lifetime de anónimos NO funciona**
**Severidad:** 🔴 CRÍTICA (BLOQUEANTE)
**Estado:** ✅ CAUSA RAÍZ IDENTIFICADA
**Archivos afectados:** `check-usage-limit.guard.ts`, `anonymous-tracking.service.ts`

**Causa Raíz Identificada:**
El método `checkAnonymousUserLimit()` siempre usa `DAILY_CARD` hardcodeado:

```typescript
// check-usage-limit.guard.ts línea 226-237
private async checkAnonymousUserLimit(request: Request): Promise<boolean> {
  const canAccess = await this.anonymousTrackingService.canAccess(request);
  // ...
}

// anonymous-tracking.service.ts línea 33-41
async canAccess(req: Request): Promise<boolean> {
  return this.canAccessByIpAndUserAgent(
    ip,
    userAgent,
    UsageFeature.DAILY_CARD,  // ← HARDCODEADO! Debería ser dinámico
  );
}
```

**Evidencia:**
```bash
# Usuarios anónimos pueden hacer múltiples consultas:
# Primera consulta: 200 OK ✅
# Segunda consulta: 200 OK ❌ (debería ser 403)
# Tercera consulta: 200 OK ❌

# Tabla anonymous_usage NO tiene registros de pendulum_query:
SELECT * FROM anonymous_usage WHERE feature = 'pendulum_query';
# 0 rows
```

**Solución:**
1. Modificar `checkAnonymousUserLimit()` para recibir la feature como parámetro
2. Agregar lógica específica para `PENDULUM_QUERY` con `canAccessLifetime()`
3. Usar `recordLifetimeUsage()` para registrar el uso

---

#### **PROBLEMA #3: CTA Upgrade/Registrarse apunta a /premium (404)**
**Severidad:** 🟠 ALTA
**Estado:** ✅ CONFIRMADO
**Archivos afectados:** `PendulumLimitBanner.tsx`

**Código problemático (línea 48):**
```tsx
<Link href="/premium">  // ← Ruta no existe
  {period === 'lifetime' ? 'Registrarse' : 'Upgrade'}
</Link>
```

**Solución:**
```tsx
<Link href={period === 'lifetime' ? '/registro' : '/perfil'}>
  {period === 'lifetime' ? 'Registrarse' : 'Upgrade'}
</Link>
```

---

#### **PROBLEMA #4: Falta botón de Info con Sheet explicativo**
**Severidad:** 🟡 MEDIA
**Estado:** ✅ CONFIRMADO
**Archivos afectados:** `PendulumConsultation.tsx`

El diseño original (TASK-508) especificaba un Sheet con información sobre cómo usar el péndulo y el significado de los movimientos. Este componente NO está implementado.

**Solución:**
Agregar el Sheet component según la especificación de TASK-508.

---

#### **PROBLEMA #5: Validación de contenido bloqueado NO funciona** 🆕
**Severidad:** 🔴 CRÍTICA
**Estado:** ✅ CAUSA RAÍZ IDENTIFICADA (Misma que #1)
**Archivos afectados:** `pendulum.controller.ts`

**Causa Raíz:**
Mismo problema que #1: `user.id` es `undefined`, por lo que la condición `dto.question && userId` siempre es false:

```typescript
// pendulum.service.ts línea 63-72
if (dto.question && userId) {  // userId es undefined!
  const validation = this.contentValidator.validateQuestion(dto.question);
  // Esta validación NUNCA se ejecuta
}
```

**Evidencia:**
```bash
curl -X POST /api/v1/pendulum/query \
  -H "Authorization: Bearer [PREMIUM_TOKEN]" \
  -d '{"question":"¿Tengo cáncer?"}'
# Respuesta: 200 OK con respuesta normal
# Esperado: 400 Bad Request con BLOCKED_CONTENT
```

**Solución:**
Misma que #1 - cambiar `user.id` a `user.userId` en el controller.

---

### 📊 RESUMEN DE COBERTURA DE TESTING E2E

| Componente | Estado | Problemas |
|------------|--------|-----------|
| UI/UX Página Péndulo | ✅ Funciona | #4 (Info faltante) |
| Animaciones CSS | ✅ Funciona | - |
| Disclaimer Modal | ✅ Funciona | - |
| Consulta API | ✅ Funciona | - |
| Límites Premium (diario) | ✅ Funciona | - |
| Límites Anónimos (lifetime) | 🔴 NO funciona | #2 |
| Límites FREE (mensual) | ⏸️ No testeado | - |
| Historial Premium | 🔴 NO funciona | #1 |
| Validación Contenido | 🔴 NO funciona | #5 |
| CTA Upgrade/Registro | 🔴 Link roto | #3 |

---

### 🎯 TAREAS DE CORRECCIÓN REQUERIDAS

#### TASK-510: Fix userId en PendulumController ✅
**Estado:** ✅ COMPLETADA (2026-02-05)
**Prioridad:** 🔴 CRÍTICA
**Estimación:** 0.25 días
**Archivos:** `backend/tarot-app/src/modules/pendulum/infrastructure/controllers/pendulum.controller.ts`

**Cambios aplicados:**
```typescript
// Línea 105 - query endpoint
const userId = user?.plan === UserPlan.PREMIUM ? user.userId : undefined;

// Línea 169 - getHistory call
const history = await this.historyService.getUserHistory(user.userId, limit, response);

// Línea 205 - getStats endpoint
return this.historyService.getUserStats(user.userId);

// Línea 233 - deleteQuery endpoint
await this.historyService.deleteQuery(user.userId, queryId);
```

**Cambios adicionales:**
- Actualizado tipo de parámetro `user` de `User` a `{ userId: number; plan: UserPlan }` en todos los métodos
- Actualizado todos los mocks en `pendulum.controller.spec.ts` para usar estructura JWT correcta
- Removido import innecesario de `User` entity

**Tests:** ✅ 15/15 pasando
**Build:** ✅ Exitoso
**Validación arquitectura:** ✅ Pasando

**Resuelve:** Problemas #1 (Historial Premium) y #5 (Validación contenido bloqueado)

---

#### TASK-511: Fix límite lifetime para anónimos

**Estado:** ✅ COMPLETADA

**Prioridad:** 🔴 CRÍTICA
**Estimación:** 0.5 días
**Archivos:**
- `backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.ts`
- `backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.spec.ts`
- `backend/tarot-app/src/modules/usage-limits/services/anonymous-tracking.service.ts`

**Cambios realizados:**
1. ✅ Modificado `checkAnonymousUserLimit()` para recibir `feature` como parámetro
2. ✅ Agregado método `checkPendulumLifetimeLimit()` específico para `PENDULUM_QUERY`
3. ✅ Implementado uso de `canAccessLifetime()` y `recordLifetimeUsage()` para límite de 1 consulta total
4. ✅ Agregados 4 tests específicos para validar el comportamiento de límite lifetime
5. ✅ Mensaje de error personalizado: "Ya has usado tu consulta gratuita del Péndulo. Regístrate para obtener más consultas."

**Tests:**
- 21/21 tests pasando en `check-usage-limit.guard.spec.ts`
- 84/84 tests pasando en todo el módulo `usage-limits`
- Coverage 100% en las líneas modificadas

**Validaciones:**
- ✅ Format sin errores
- ✅ Lint sin errores
- ✅ Build exitoso
- ✅ Validador de arquitectura OK

**Resuelve:** Problema #2

**Fecha de completación:** 5 de febrero de 2026

---

#### 🔍 Hallazgo Adicional Durante Testing E2E de TASK-511

**Fecha del hallazgo:** 5 de febrero de 2026  
**Detectado por:** Testing manual con cURL  
**Estado:** 🚨 REQUIERE INVESTIGACIÓN

Durante el testing E2E del fix de TASK-511, se realizaron pruebas con distintos tipos de usuarios para validar que el límite lifetime de anónimos funcionara correctamente. En ese proceso, se descubrió un **problema adicional con usuarios PREMIUM**.

##### Contexto del Testing

Se ejecutaron las siguientes pruebas en localhost:3000:

1. ✅ **Usuario anónimo (fingerprint nuevo) - Primera consulta:** 200 OK - PASA
2. ✅ **Usuario anónimo (mismo fingerprint) - Segunda consulta:** 403 Forbidden - PASA (mensaje correcto)
3. ✅ **Usuario FREE autenticado (ID: 2):** 200 OK - PASA
4. ❌ **Usuario PREMIUM autenticado (ID: 3):** 403 Forbidden - **INESPERADO**

##### Descripción del Problema

**Usuario afectado:**
- Email: `premium@test.com`
- UserID: `3`
- Plan: `PREMIUM`
- Límite esperado: 1 consulta por día

**Comportamiento observado:**

```bash
# Request:
curl -X POST http://localhost:3000/api/v1/pendulum/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{}'

# Response:
{
  "message": "Has alcanzado tu límite diario para esta función. Tu límite se restablecerá mañana.",
  "error": "Forbidden",
  "statusCode": 403
}
```

**Comportamiento esperado:**
- Primera consulta del día debería retornar 200 OK con respuesta del péndulo
- Solo la segunda consulta en el mismo día debería recibir 403

##### Posibles Causas

1. **Consultas previas en la BD:** El usuario Premium ya pudo haber hecho una consulta hoy y alcanzó su límite de 1/día
2. **Problema en la lógica del guard:** El `CheckUsageLimitGuard` puede estar validando incorrectamente el límite diario para `PENDULUM_QUERY`
3. **Problema de configuración del plan:** El campo `pendulumDailyLimit` en la tabla `plans` podría no estar configurado correctamente
4. **Bug preexistente:** El problema puede haber existido ANTES del fix de TASK-511 y no estar relacionado con los cambios realizados

##### Análisis Preliminar

**Archivos relevantes a revisar:**
- `backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.ts` (línea 105-117: `checkAuthenticatedUserLimit()`)
- `backend/tarot-app/src/modules/plan-config/entities/plan.entity.ts` (campo `pendulumDailyLimit`)
- Tabla `usage_limit` en PostgreSQL (verificar registros para userId=3 y feature=PENDULUM_QUERY)

**Queries de verificación recomendadas:**

```sql
-- Verificar consultas previas del usuario Premium hoy
SELECT * FROM pendulum_queries 
WHERE "userId" = 3 
AND "createdAt" >= CURRENT_DATE;

-- Verificar registros de límites de uso hoy
SELECT * FROM usage_limit 
WHERE "userId" = 3 
AND feature = 'pendulum_query' 
AND date >= CURRENT_DATE;

-- Verificar configuración del plan PREMIUM
SELECT "planType", "pendulumDailyLimit" 
FROM plans 
WHERE "planType" = 'premium';
```

##### Impacto

- ⚠️ **Severidad:** MEDIA (si es un problema preexistente) o ALTA (si fue introducido por el fix de TASK-511)
- ⚠️ **Alcance:** Solo usuarios PREMIUM
- ⚠️ **Urgencia:** ALTA - Requiere investigación inmediata para determinar si está relacionado con el fix de TASK-511

##### Acciones Requeridas

**CRÍTICO:** Antes de mergear el PR #340 (TASK-511), se debe:

1. **Verificar datos en BD** usando las queries de verificación de arriba
2. **Determinar causa raíz:**
   - Si el usuario ya hizo una consulta hoy → Problema es solo de testing (resetear datos)
   - Si el plan no está configurado → Corregir configuración del plan
   - Si la lógica del guard está mal → Crear TASK-514 para fix separado
3. **Aislar el problema:** Confirmar que NO fue introducido por los cambios de TASK-511
4. **Documentar hallazgo:** Si es un bug separado, crear un nuevo issue/task

##### Estado Actual

**Decisión pendiente:** ¿Es este problema relacionado con TASK-511 o es un issue preexistente y separado?

**Bloqueo para PR #340:** Requiere validación adicional antes de aprobar el merge.

---

#### TASK-512: Fix CTA de Upgrade/Registrarse
**Prioridad:** 🟠 ALTA
**Estimación:** 0.1 días
**Archivos:** `frontend/src/components/features/pendulum/PendulumLimitBanner.tsx`

**Cambio requerido:**
```tsx
<Link href={period === 'lifetime' ? '/registro' : '/perfil'}>
```

**Resuelve:** Problema #3

---

#### TASK-513: Agregar Sheet de información
**Prioridad:** 🟡 MEDIA
**Estimación:** 0.25 días
**Archivos:** `frontend/src/components/features/pendulum/PendulumConsultation.tsx`

**Descripción:** Implementar el Sheet con información sobre cómo usar el péndulo según especificación de TASK-508.

**Resuelve:** Problema #4

---

### 📝 NOTAS FINALES DEL TESTING

**Método de Testing:**
- Playwright MCP para testing E2E del frontend
- cURL para testing directo de API
- PostgreSQL queries para verificación de datos
- Revisión de código fuente para identificación de causa raíz

**Limitaciones:**
- Testing de límite mensual FREE no completado (requiere esperar al cambio de mes o modificar datos)
- No se verificó visualmente el funcionamiento de las animaciones CSS (solo estructura HTML)

**Recomendaciones:**
1. Implementar endpoint admin para reset de límites durante desarrollo/testing
2. Agregar logging más detallado en guards y servicios
3. Considerar crear tests de integración E2E automatizados para estos flujos

---

**FIN DEL BACKLOG V2**
