# Workflow: Feedback de Pull Request - Frontend

> 📋 **Propósito:** Proceso para analizar y aplicar feedback de PRs en frontend.
> 🤖 **Uso:** Aplicar automáticamente cuando se recibe feedback de PR de frontend.
> 📅 **Last Updated:** January 17, 2026

---

## 🎯 Trigger Automático

**Cuando el usuario diga:**
- "Tengo feedback del PR de frontend TASK-XXX"
- "Feedback del PR frontend"
- Comparta comentarios de revisión de PR de frontend

**El agente debe aplicar este workflow automáticamente.**

---

## 📋 Template de Solicitud

```
Tengo el siguiente feedback del PR para la rama feature/TASK-X.Y.

Feedback Recibido: [Pega aquí el feedback completo del revisor]
```

---

## 🔍 Proceso de Análisis (Senior Developer Mindset)

### Fase 1: Lectura Obligatoria de Contexto

**Antes de responder, leer documentación relevante:**

Si el PR involucra límites, capabilities o planes de usuario:
1. `frontend/docs/MODELO_NEGOCIO_DEFINIDO.md` - Reglas de negocio (fuente de verdad)
2. `frontend/docs/REFACTOR_LIMITS_SYSTEM.md` - Arquitectura de capabilities

Si involucra otros features:
1. `frontend/docs/ARCHITECTURE.md` - Arquitectura feature-based
2. `frontend/docs/AI_DEVELOPMENT_GUIDE.md` - Guía de desarrollo
3. `frontend/docs/DESIGN_HAND-OFF.md` - Design tokens y UI
4. `.github/copilot-instructions.md` - Reglas de contratos
5. Código existente del feature afectado

### Fase 2: Análisis Crítico del Feedback

Para cada punto del feedback, preguntarse:

**✅ ¿Es técnicamente correcto?**
- ¿Sigue los patrones establecidos del proyecto?
- ¿Respeta la arquitectura feature-based?
- ¿Cumple con las convenciones de Next.js App Router?

**✅ ¿Mejora la calidad del código?**
- ¿Reduce complejidad del componente?
- ¿Mejora legibilidad y mantenibilidad?
- ¿Optimiza performance (memoization, lazy loading)?

**✅ ¿Sigue la arquitectura definida?**
- ¿No pone lógica en `app/`? (solo rutas/layouts)
- ¿Usa hooks correctamente? (data fetching, side effects)
- ¿Separa concerns? (UI, lógica, API)

**⚠️ Red Flags (requieren pushback):**
- Sugerencias que rompen contratos con backend
- Cambios que violan separación de concerns
- Propuestas que degradan cobertura de tests
- Modificaciones que introducen complejidad innecesaria

### Fase 3: Clasificación del Feedback

Clasifica cada comentario en una de estas categorías:

**✅ APLICAR** - Feedback válido que mejora el código
- El cambio sigue los patrones del proyecto
- Mejora objetivamente UX o performance
- No rompe contratos ni arquitectura
- **Acción:** Implementar inmediatamente

**⚠️ DISCUTIR** - No estás de acuerdo con el cambio
- El revisor puede haber malinterpretado el contexto
- Tu solución es preferible por razones técnicas o de UX
- El cambio violaría algún patrón establecido
- **Acción:** Preparar respuesta técnica con argumentos

**ℹ️ ACLARAR** - Necesitas más contexto
- El comentario es ambiguo
- No está claro qué cambio específico se solicita
- Requiere entender mejor la intención o los requisitos de diseño
- **Acción:** Pedir clarificación en el PR

---

## 🛠️ Implementación de Correcciones

### Para Feedback ✅ APLICAR:

1. **Implementar cambios solicitados**
   - Seguir patrones existentes del proyecto
   - Mantener consistencia con otros componentes/features

2. **Actualizar tests si afectan lógica**
   - Si el cambio modifica comportamiento → actualizar tests existentes
   - Si agrega nueva funcionalidad → crear nuevos tests
   - Mantener coverage ≥ 80%

3. **Seguir TDD si hay cambios de lógica:**
   ```bash
   # 1. Actualizar/crear tests (deben fallar si hay cambio de lógica)
   npm run test -- src/path/to/component.test.tsx
   
   # 2. Implementar cambio
   
   # 3. Verificar que tests pasen
   npm run test -- src/path/to/component.test.tsx
   ```

4. **Ejecutar ciclo completo de validación:**
   ```bash
   # Desde frontend/
   npm run lint                # Lint
   npm run lint:fix            # Lint + autofix
   npm run type-check          # TypeScript validation
   npm run test:run            # Todos los tests
   npm run test:coverage       # Coverage ≥ 80%
   npm run build               # Build production
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
- Contratos con backend (API_ENDPOINTS)
- Requisitos de UX/diseño (DESIGN_HAND-OFF.md)
- Performance/Optimización (React best practices)
- Limitaciones de Next.js App Router
]

**Alternativas Consideradas:**
[Otras opciones que evaluaste y por qué las descartaste]

**Propuesta:**
[Mantener como está / Proponer alternativa mejor]

**Referencias:**
- `frontend/docs/ARCHITECTURE.md` - [sección específica]
- `frontend/docs/DESIGN_HAND-OFF.md` - [token/patrón específico]
- `.github/copilot-instructions.md` - [regla específica]
- Código existente: `src/path/to/similar-pattern.tsx`
```

**Ejemplos de argumentos válidos para pushback:**

1. **Contrato con Backend:**
   ```
   El formato de paginación que uso ({ data, meta: { page, limit, totalItems, totalPages } })
   es el que retorna el backend según `.github/copilot-instructions.md` línea 60-72.
   Cambiar a otro formato requeriría modificar el backend y rompería otros features
   que ya consumen esta API.
   ```

2. **Patrón Arquitectónico:**
   ```
   Mantuve la lógica fuera de `app/page.tsx` siguiendo la arquitectura feature-based
   documentada en `ARCHITECTURE.md`. Los page components solo deben orquestar componentes
   y pasar props, mientras que la lógica vive en `components/features/` y hooks en `hooks/`.
   ```

3. **Consistencia del Proyecto:**
   ```
   Todos los features existentes (readings, spreads, profile) usan este mismo patrón
   de hooks + API functions. Cambiar solo este feature introduciría inconsistencia.
   Si es necesario refactorizar, debería aplicarse a todos los features.
   ```

4. **Performance/UX:**
   ```
   Implementé el debounce en el input de búsqueda para reducir llamadas a la API.
   Sin esto, cada keystroke dispararía una request, degradando performance y
   consumiendo cuota de plan del usuario innecesariamente.
   ```

5. **Limitaciones de Next.js:**
   ```
   Uso 'use client' porque este componente necesita useState/useEffect para interactividad.
   Next.js App Router requiere marcar explícitamente client components cuando usan React hooks.
   (Ver: https://nextjs.org/docs/app/building-your-application/rendering/client-components)
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
- ¿Esto está definido en el design system (DESIGN_HAND-OFF.md)?

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
git commit -m "fix: apply PR feedback - extract search logic to custom hook"
git commit -m "fix: apply PR feedback - improve error handling in loading states"
git commit -m "fix: apply PR feedback - add missing accessibility attributes"
git commit -m "fix: apply PR feedback - optimize re-renders with useMemo"
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
- [ ] Tests pasan: `npm run test:run` (coverage ≥ 80%)
- [ ] Lint sin errores: `npm run lint`
- [ ] Type-check sin errores: `npm run type-check`
- [ ] Build exitoso: `npm run build`
- [ ] No hay lógica en `app/` (solo rutas/layouts)
- [ ] `'use client'` en client components
- [ ] Texto user-facing en español
- [ ] Commit creado (NO amend): `git commit -m "fix: apply PR feedback - ..."`
- [ ] Push realizado: `git push`
- [ ] Respuestas preparadas para feedback ⚠️ DISCUTIR y ℹ️ ACLARAR
- [ ] Comentarios agregados en el PR explicando decisiones

---

## 🎯 Resumen del Proceso

```
1. Leer contexto (docs relevantes + design system)
        ↓
2. Analizar críticamente cada punto
        ↓
3. Clasificar: ✅ APLICAR / ⚠️ DISCUTIR / ℹ️ ACLARAR
        ↓
4. Implementar cambios ✅ APLICAR
        ↓
5. Actualizar tests si es necesario (mantener TDD)
        ↓
6. Ejecutar validaciones (lint, type-check, test, build)
        ↓
7. Crear NUEVO commit (NO amend)
        ↓
8. Push
        ↓
9. Responder en PR (agradecer + justificar ⚠️ / aclarar ℹ️)
```

---

## 📚 Documentos de Referencia

- `frontend/docs/ARCHITECTURE.md` - Arquitectura feature-based
- `frontend/docs/AI_DEVELOPMENT_GUIDE.md` - Guía de desarrollo TDD
- `frontend/docs/DESIGN_HAND-OFF.md` - Design tokens y UI
- `frontend/docs/MODELO_NEGOCIO_DEFINIDO.md` - Reglas de negocio
- `frontend/docs/REFACTOR_LIMITS_SYSTEM.md` - Sistema de capabilities
- `.github/copilot-instructions.md` - Reglas de contratos con backend
- `docs/WORKFLOW_FRONTEND.md` - Workflow de desarrollo original

---

## 🎨 Consideraciones Específicas de Frontend

### Accesibilidad
- Verificar atributos ARIA si el feedback los menciona
- Asegurar navegación por teclado
- Contrasten colores según WCAG 2.1

### Performance
- Memoization (`useMemo`, `useCallback`) solo cuando sea necesario
- Code splitting con `dynamic()` para componentes pesados
- Optimización de imágenes con `next/image`

### Responsive Design
- Verificar breakpoints según `DESIGN_HAND-OFF.md`
- Probar en mobile/tablet/desktop
- Usar utility classes de Tailwind correctamente

### Estado y Data Fetching
- Preferir React Query (TanStack Query) para server state
- Zustand solo para global client state
- No mezclar ambos para el mismo dato

---

**End of Workflow** - Aplicar con criterio senior, UX-first y pensamiento crítico.
