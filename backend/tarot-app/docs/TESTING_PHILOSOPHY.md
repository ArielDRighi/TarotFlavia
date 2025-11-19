# Filosofía de Testing - OBLIGATORIO LEER ANTES DE CREAR TESTS

## REGLA DE ORO - NUNCA ROMPER ESTA REGLA

**ABSOLUTAMENTE TODOS LOS TESTS DE LA APLICACIÓN DEBEN BUSCAR ERRORES REALES Y CORREGIRLOS, NUNCA FALSEAR UN TEST PARA QUE PASE EXITOSAMENTE**

## Proceso Obligatorio para Crear Tests

### 1. INVESTIGAR PRIMERO - NO ASUMIR NADA

Antes de escribir cualquier test:

1. **Leer el código de producción completo**
   - Controller: ¿Qué endpoints existen? ¿Qué guards tienen?
   - Service: ¿Qué lógica de negocio implementa?
   - Repository: ¿Cómo interactúa con la BD?
   - DTOs: ¿Qué validaciones existen?
   - Entities: ¿Qué relaciones hay? ¿Qué constraints?

2. **Ejecutar el código manualmente** (si es posible)
   - Usar Postman/curl para probar endpoints
   - Verificar respuestas reales
   - Inspeccionar base de datos

3. **Identificar edge cases y vulnerabilidades**
   - ¿Qué pasa con inputs inválidos?
   - ¿Hay problemas de seguridad?
   - ¿Funciona la validación?
   - ¿Se manejan correctamente los errores?

### 2. ESCRIBIR TESTS QUE BUSQUEN BUGS

**NO escribir tests asumiendo que el código funciona correctamente**

**SÍ escribir tests que:**
- Verifiquen comportamiento esperado según los requisitos de negocio
- Prueben edge cases (null, undefined, strings vacíos, números negativos, etc.)
- Busquen vulnerabilidades de seguridad
- Verifiquen que las validaciones funcionan
- Prueben el manejo de errores

### 3. CUANDO UN TEST FALLA

**NUNCA hacer:**
- ❌ Cambiar el test para que pase sin investigar
- ❌ Asumir que el código está correcto y el test está mal
- ❌ Usar `.skip()` sin documentar el bug encontrado
- ❌ Cambiar expectations para que coincidan con output incorrecto

**SIEMPRE hacer:**
- ✅ Investigar POR QUÉ falla el test
- ✅ Determinar si es un bug REAL en el código de producción
- ✅ Si es bug real: CORREGIR el código de producción
- ✅ Si el test está mal: CORREGIR el test con evidencia
- ✅ Documentar el bug encontrado en el commit message

### 4. EJEMPLOS DE BUGS REALES ENCONTRADOS

#### Bug #1: Cards array vacío en readings
**Test escribió:** `expect(response.body.cards).toHaveLength(3)`
**Resultado:** `cards: []` (array vacío)
**Acción CORRECTA:** Investigar use-case → Encontrar que `CreateReadingUseCase` no agregaba cards al reading
**Acción INCORRECTA:** Cambiar a `expect(response.body.cards).toHaveLength(0)`

#### Bug #2: Spread/Deck inválido retorna 500 en lugar de 404
**Test escribió:** `expect(404)` para deck inválido
**Resultado:** Error 500 Internal Server Error
**Acción CORRECTA:** Agregar validación en use-case para devolver 404
**Acción INCORRECTA:** Cambiar test a `expect(500)`

#### Bug #3: Email case-sensitivity permite duplicados
**Test escribió:** Registrar `test@example.com` y `Test@Example.com`
**Resultado esperado:** Segundo registro debe fallar con 409
**Resultado real:** Ambos registros exitosos (BUG)
**Acción CORRECTA:** Normalizar email a lowercase en UsersService
**Acción INCORRECTA:** Aceptar que emails son case-sensitive

### 5. TIPOS DE TESTS REQUERIDOS

#### Integration Tests (E2E)
- Usan base de datos REAL
- Prueban flujo completo de endpoints
- Verifican relaciones entre módulos
- Buscan bugs de integración

#### Unit Tests
- Mockean dependencias
- Prueban lógica aislada
- Verifican edge cases
- Alcanzan >80% coverage

#### Performance Tests
- Verifican tiempos de respuesta
- Buscan N+1 queries
- Verifican caching

### 6. CHECKLIST ANTES DE CREAR TESTS

- [ ] Leí TODO el código relacionado (controller, service, repository, DTOs, entities)
- [ ] Identifiqué guards, validaciones y constraints
- [ ] Probé los endpoints manualmente (si aplica)
- [ ] Identifiqué edge cases y vulnerabilidades
- [ ] Escribí tests que BUSCAN bugs, no que asumen corrección
- [ ] Cuando un test falló, investigué el código de producción
- [ ] Si encontré bugs, los CORREGÍ en producción
- [ ] Documenté bugs encontrados en commit message

### 7. RED FLAGS - SEÑALES DE TESTS FALSOS

- Test pasa en primer intento sin investigar código → SOSPECHOSO
- Todos los tests pasan sin encontrar ningún bug → SOSPECHOSO
- Cambié expectations para que coincidan con output → MAL
- Usé `.skip()` sin documentar bug claramente → MAL
- No leí código de producción antes de escribir test → MAL

### 8. FILOSOFÍA DE "TEST-DRIVEN BUG HUNTING"

Los tests NO son para validar que el código funciona.
Los tests SON para ENCONTRAR dónde NO funciona y CORREGIRLO.

**Mentalidad correcta:**
- "Este endpoint DEBERÍA hacer X según requisitos. ¿Realmente lo hace?"
- "¿Qué pasa si envío datos inválidos? ¿Se maneja correctamente?"
- "¿Hay validaciones de seguridad? ¿Funcionan?"

**Mentalidad incorrecta:**
- "Asumo que funciona, voy a escribir test que pase"
- "El test falla, debo estar escribiendo mal el test"
- "El código está bien, solo ajusto el test"

## CONSECUENCIAS DE FALSEAR TESTS

- Bugs en producción no detectados
- Falsa sensación de seguridad
- Coverage inflado sin valor real
- Deuda técnica acumulada
- Pérdida de confianza en test suite

## BENEFICIOS DE BUSCAR BUGS REALES

- Código más robusto y confiable
- Bugs encontrados antes de producción
- Documentación viva de comportamiento esperado
- Confianza real en el test suite
- Menos bugs reportados por usuarios

---

**RECUERDA: Un test que pasa sin encontrar bugs es un test que NO hizo su trabajo correctamente.**

**OBJETIVO: Encontrar y corregir TODOS los bugs antes de que lleguen a producción.**
