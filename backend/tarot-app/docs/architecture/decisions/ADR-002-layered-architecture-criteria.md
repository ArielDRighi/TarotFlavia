# ADR-002: Criterio para Aplicar Arquitectura por Capas

**Fecha:** 2025-11-11  
**Estado:** Aceptado  
**Contexto:** TASK-ARCH-006 - Evaluación de módulos para arquitectura limpia híbrida  
**Relacionado con:** ADR-001 (Arquitectura Feature-Based con Capas Internas)

---

## Contexto

En el contexto de la refactorización arquitectural (PLAN_REFACTORIZACION.md), se busca aplicar separación de capas (domain/application/infrastructure) de forma **selectiva y pragmática**, evitando over-engineering en módulos simples.

Después de completar TASK-ARCH-001 (cache), TASK-ARCH-002 (ai) y TASK-ARCH-003 (readings), es necesario evaluar los módulos restantes:

- `interpretations`
- `spreads`
- `cards`
- `tarotistas`

---

## Decisión

### Criterio Cuantitativo

Aplicar arquitectura por capas (domain/application/infrastructure) **SOLO SI** se cumple al menos uno de estos criterios:

1. **Complejidad por volumen:**

   - Módulo tiene **>10 archivos .ts** (excluyendo specs)
   - Módulo tiene **>1000 líneas de código** total

2. **Complejidad por lógica:**

   - Lógica de negocio compleja (reglas de validación, cálculos, workflows)
   - Múltiples responsabilidades bien diferenciadas
   - Necesidad de CQRS o patrones avanzados

3. **Criticidad para negocio:**
   - Módulo **crítico para marketplace** con expansión planificada
   - Módulo con **alta tasa de cambio** esperada

### Criterio Cualitativo

**NO aplicar capas SI:**

- Módulo es simple CRUD
- <5 archivos .ts
- <500 líneas de código total
- Sin lógica de negocio compleja
- Baja probabilidad de cambios

---

## Análisis de Módulos (TASK-ARCH-006)

### ✅ Módulos CON Capas (Completados)

| Módulo       | Archivos | Líneas | Razón                                               |
| ------------ | -------- | ------ | --------------------------------------------------- |
| **cache**    | 12       | ~1200  | Lógica compleja de invalidación + multi-provider    |
| **ai**       | 15       | ~1500  | Abstracción multi-provider + retry + error handling |
| **readings** | 18+      | ~2000  | CQRS + eventos + validaciones complejas             |

### ❌ Módulos SIN Capas (Evaluados - MANTENER FLAT)

#### 1. **interpretations**

- **Archivos:** 5
- **Líneas:** 595
- **Decisión:** ❌ **NO aplicar capas**
- **Razón:** Simplificado después de extraer cache (TASK-ARCH-001) y AI (TASK-ARCH-002). Quedó como orquestador simple.
- **Estructura actual:** Flat (service, controller, module, entity, dto)

#### 2. **spreads**

- **Archivos:** 6
- **Líneas:** 472
- **Decisión:** ❌ **NO aplicar capas**
- **Razón:** CRUD simple, sin lógica de negocio compleja. Gestión de configuración de tiradas.
- **Estructura actual:** Flat

#### 3. **cards**

- **Archivos:** 7
- **Líneas:** 939
- **Decisión:** ❌ **NO aplicar capas**
- **Razón:** Catálogo de cartas, mayormente consultas. No supera 1000 líneas ni 10 archivos.
- **Estructura actual:** Flat

#### 4. **tarotistas** ⚠️

- **Archivos:** 8
- **Líneas:** 996
- **Decisión:** ❌ **NO aplicar capas (por ahora)**
- **Razón:**
  - **No cumple criterio cuantitativo** (<10 archivos, <1000 líneas)
  - Service pequeño (101 líneas)
  - **PERO**: Crítico para marketplace, tiene entidades complejas (reviews, revenue, subscriptions)
- **Estrategia:**
  - Mantener flat **por ahora** (principio YAGNI)
  - **Refactorizar cuando se agreguen:** bookings, payments, analytics, ratings avanzados
  - Ya preparado con 6 entities para expansión futura
- **Trigger para refactor:** Cuando supere 10 archivos o agregue lógica de negocio compleja

---

## Consecuencias

### Positivas

1. **Consistencia arquitectural:** Módulos complejos (cache, ai, readings) tienen capas explícitas
2. **Pragmatismo:** Módulos simples (interpretations, spreads, cards) mantienen simplicidad
3. **Escalabilidad preparada:** Tarotistas listo para expansión sin over-engineering actual
4. **Documentación clara:** Criterio explícito para futuras decisiones

### Negativas

1. **Convivencia de estilos:** Algunos módulos con capas, otros flat (mitigado por criterio claro)
2. **Decisión subjetiva en casos límite:** Tarotistas requirió juicio (mitigado por documentación)

---

## Implementación

### Estado Actual (Post TASK-ARCH-006)

```
src/modules/
├── tarot/
│   ├── cache/              ✅ CON CAPAS (TASK-ARCH-001)
│   ├── ai/                 ✅ CON CAPAS (TASK-ARCH-002)
│   ├── readings/           ✅ CON CAPAS (TASK-ARCH-003)
│   ├── interpretations/    ❌ FLAT (simplificado)
│   ├── spreads/            ❌ FLAT (CRUD simple)
│   └── cards/              ❌ FLAT (catálogo)
└── tarotistas/             ❌ FLAT (preparado para expansión)
```

### Próximos Pasos

- **Monitorear tarotistas:** Si se agregan bookings/payments → aplicar capas
- **Monitorear cards:** Si se agregan personalizaciones complejas → aplicar capas
- **Reevaluar en 6 meses:** Verificar si módulos flat crecieron

---

## Alternativas Consideradas

1. **Aplicar capas a todos los módulos**

   - ✅ Pro: Consistencia absoluta
   - ❌ Contra: Over-engineering, dificulta desarrollo rápido en módulos simples

2. **No aplicar capas a ninguno (todo flat)**

   - ✅ Pro: Simplicidad máxima
   - ❌ Contra: No escala, dificulta testing en módulos complejos

3. **Criterio pragmático (ELEGIDO)**
   - ✅ Pro: Balance perfecto, escalable, evita over-engineering
   - ✅ Pro: Decisión documentada y repetible
   - ⚠️ Contra: Requiere criterio en casos límite

---

## Referencias

- [PLAN_REFACTORIZACION.md](../../PLAN_REFACTORIZACION.md) - TASK-ARCH-006
- [ADR-001](./ADR-001-adopt-feature-based-modules.md) - Arquitectura Feature-Based
- [ARQUITECTURA_ANALISIS.md](../../ARQUITECTURA_ANALISIS.md)

---

## Revisiones

- **2025-11-11:** Creación inicial (TASK-ARCH-006)
- **Próxima revisión:** 2026-05-11 (6 meses) - Evaluar si módulos flat necesitan capas
