# Workflow: Feedback de Pull Request - Backend

> 📋 **Propósito:** Proceso para analizar y aplicar feedback de PRs en backend.
> 🤖 **Uso:** Aplicar automáticamente cuando se recibe feedback de PR de backend.
> 📅 **Last Updated:** January 17, 2026

---

## 🎯 Trigger Automático

**Cuando el usuario diga:**
- "Tengo feedback del PR de backend TASK-XXX"
- "Feedback del PR backend"
- Comparta comentarios de revisión de PR de backend

**El agente debe aplicar este workflow automáticamente.**

---

## 📋 Template de Solicitud

```
Tengo el siguiente feedback del PR para la rama feature/TASK-XXX.

Feedback Recibido: [Pega aquí el feedback completo del revisor]
```

---

## 🔍 Proceso de Análisis (Senior Developer Mindset)

### Fase 1: Lectura Obligatoria de Contexto

**Antes de responder, leer documentación relevante:**

Si el PR involucra límites, capabilities o planes de usuario:
1. `frontend/docs/MODELO_NEGOCIO_DEFINIDO.md` - Reglas de negocio (fuente de verdad)
2. `frontend/docs/REFACTOR_LIMITS_SYSTEM.md` - Arquitectura de capabilities

Si involucra otros módulos:
1. `backend/tarot-app/docs/ARCHITECTURE.md` - Patrones de arquitectura
2. `backend/tarot-app/docs/API_DOCUMENTATION.md` - Contratos de API
3. `.github/copilot-instructions.md` - Reglas de contratos
4. Código existente del módulo afectado

### Fase 2: Análisis Crítico del Feedback

Para cada punto del feedback, preguntarse:

**✅ ¿Es técnicamente correcto?**
- ¿Sigue los patrones establecidos del proyecto?
- ¿Mejora la arquitectura limpia?
- ¿Respeta los contratos de API?

**✅ ¿Mejora la calidad del código?**
- ¿Reduce complejidad?
- ¿Mejora legibilidad?
- ¿Incrementa testabilidad?

**✅ ¿Sigue la arquitectura definida?**
- ¿Respeta la separación de capas (domain/application/infrastructure)?
- ¿Usa el patrón orchestrator correctamente?
- ¿No inyecta repositories en controllers?

**⚠️ Red Flags (requieren pushback):**
- Sugerencias que rompen contratos establecidos
- Cambios que violan Clean Architecture
- Propuestas que degradan cobertura de tests
- Modificaciones que introducen acoplamiento

### Fase 3: Clasificación del Feedback

Clasifica cada comentario en una de estas categorías:

**✅ APLICAR** - Feedback válido que mejora el código
- El cambio sigue los patrones del proyecto
- Mejora objetivamente la calidad
- No rompe contratos ni arquitectura
- **Acción:** Implementar inmediatamente

**⚠️ DISCUTIR** - No estás de acuerdo con el cambio
- El revisor puede haber malinterpretado el contexto
- Tu solución es preferible por razones técnicas
- El cambio violaría algún patrón establecido
- **Acción:** Preparar respuesta técnica con argumentos

**ℹ️ ACLARAR** - Necesitas más contexto
- El comentario es ambiguo
- No está claro qué cambio específico se solicita
- Requiere entender mejor la intención del revisor
- **Acción:** Pedir clarificación en el PR

---

## 🛠️ Implementación de Correcciones

### Para Feedback ✅ APLICAR:

1. **Implementar cambios solicitados**
   - Seguir patrones existentes del proyecto
   - Mantener consistencia con código circundante

2. **Actualizar tests si afectan lógica**
   - Si el cambio modifica comportamiento → actualizar tests existentes
   - Si agrega nueva funcionalidad → crear nuevos tests
   - Mantener coverage ≥ 80%

3. **Seguir TDD si hay cambios de lógica:**
   ```bash
   # 1. Actualizar/crear tests (deben fallar si hay cambio de lógica)
   npm run test -- path/to/affected.spec.ts
   
   # 2. Implementar cambio
   
   # 3. Verificar que tests pasen
   npm run test -- path/to/affected.spec.ts
   ```

4. **Ejecutar ciclo completo de validación:**
   ```bash
   # Desde backend/tarot-app/
   npm run lint                    # Lint + autofix
   npm run test:cov                # Todos los tests + coverage ≥ 80%
   npm run build                   # Build TypeScript
   npm run validate-architecture   # Validar arquitectura limpia
   ```

### Para Feedback ⚠️ DISCUTIR:

Preparar respuesta técnica y educada:

```markdown
@[reviewer] Gracias por el feedback. Sobre [punto específico]:

**Contexto:**
[Explica por qué implementaste la solución de esa manera]

**Razón Técnica:**
[Justificación basada en:
- Patrones del proyecto (referencia a docs)
- Contratos de API establecidos
- Principios de Clean Architecture
- Rendimiento/Escalabilidad
]

**Alternativas Consideradas:**
[Otras opciones que evaluaste y por qué las descartaste]

**Propuesta:**
[Mantener como está / Proponer alternativa mejor]

**Referencias:**
- `backend/tarot-app/docs/ARCHITECTURE.md` - [sección específica]
- `.github/copilot-instructions.md` - [regla específica]
- Código existente: `path/to/similar-pattern.ts`
```

**Ejemplos de argumentos válidos para pushback:**

1. **Contrato de API establecido:**
   ```
   Este endpoint ya está en producción y es consumido por el frontend.
   Cambiar el formato rompería el contrato existente documentado en
   `API_DOCUMENTATION.md` línea X.
   ```

2. **Patrón arquitectónico:**
   ```
   La arquitectura del proyecto usa el patrón Orchestrator para coordinar
   use cases. Inyectar el repositorio directamente en el controller violaría
   esta separación de responsabilidades (ver ARCHITECTURE.md, sección "Orchestrator Pattern").
   ```

3. **Consistencia del proyecto:**
   ```
   Todos los módulos existentes usan este mismo patrón (readings, users, spreads).
   Cambiar solo este módulo introduciría inconsistencia. Si es necesario refactorizar,
   debería ser en todos los módulos simultáneamente.
   ```

### Para Feedback ℹ️ ACLARAR:

```markdown
@[reviewer] Gracias por la revisión. ¿Podrías aclarar [punto específico]?

**Mi entendimiento actual:**
[Explica cómo interpretaste el comentario]

**Dudas:**
- ¿Te refieres a [opción A] o [opción B]?
- ¿Esto aplica solo a [caso X] o también a [caso Y]?
- ¿Hay algún ejemplo existente en el proyecto que deba seguir?

Esto me ayudará a implementar el cambio correctamente.
```

---

## 📝 Estrategia de Commits

**REGLA CRÍTICA:** NUNCA uses `--amend` para correcciones de PR.

### ✅ CORRECTO: Nuevo commit

```bash
git add .
git commit -m "fix: apply PR feedback - [descripción breve]"
git push
```

**Ejemplos de mensajes:**
```bash
git commit -m "fix: apply PR feedback - extract validation logic to use case"
git commit -m "fix: apply PR feedback - improve error handling in orchestrator"
git commit -m "fix: apply PR feedback - add missing test cases for edge conditions"
```

### ❌ INCORRECTO: Amend

```bash
# NO HACER ESTO
git commit --amend
git push --force
```

**¿Por qué no amend?**
- Complica el historial del PR
- Requiere force push (peligroso)
- Los revisores pierden contexto de los cambios
- Dificulta el seguimiento de correcciones

---

## ✅ Checklist de Validación

Antes de pushear las correcciones:

- [ ] Todos los puntos del feedback clasificados (✅/⚠️/ℹ️)
- [ ] Cambios ✅ APLICAR implementados
- [ ] Tests actualizados/creados si hay cambios de lógica
- [ ] Tests pasan: `npm run test:cov` (coverage ≥ 80%)
- [ ] Lint sin errores: `npm run lint`
- [ ] Build exitoso: `npm run build`
- [ ] Arquitectura validada: `npm run validate-architecture`
- [ ] Commit creado (NO amend): `git commit -m "fix: apply PR feedback - ..."`
- [ ] Push realizado: `git push`
- [ ] Respuestas preparadas para feedback ⚠️ DISCUTIR y ℹ️ ACLARAR
- [ ] Comentarios agregados en el PR explicando decisiones

---

## 🎯 Resumen del Proceso

```
1. Leer contexto (docs relevantes)
        ↓
2. Analizar críticamente cada punto
        ↓
3. Clasificar: ✅ APLICAR / ⚠️ DISCUTIR / ℹ️ ACLARAR
        ↓
4. Implementar cambios ✅ APLICAR
        ↓
5. Actualizar tests si es necesario
        ↓
6. Ejecutar validaciones (lint, test, build, validate-architecture)
        ↓
7. Crear NUEVO commit (NO amend)
        ↓
8. Push
        ↓
9. Responder en PR (agradecer + justificar ⚠️ / aclarar ℹ️)
```

---

## 📚 Documentos de Referencia

- `backend/tarot-app/docs/ARCHITECTURE.md` - Patrones de arquitectura
- `backend/tarot-app/docs/API_DOCUMENTATION.md` - Contratos de API
- `backend/tarot-app/docs/TESTING.md` - Estrategia de testing
- `.github/copilot-instructions.md` - Reglas de contratos
- `frontend/docs/MODELO_NEGOCIO_DEFINIDO.md` - Reglas de negocio
- `frontend/docs/REFACTOR_LIMITS_SYSTEM.md` - Sistema de capabilities
- `docs/WORKFLOW_BACKEND.md` - Workflow de desarrollo original

---

**End of Workflow** - Aplicar con criterio senior y pensamiento crítico.
