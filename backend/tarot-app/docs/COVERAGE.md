# Test Coverage Configuration

## 📊 Coverage Metrics Actual

**Estado actual del proyecto (Noviembre 2025):**

```
Statements   : 73.8%  (4261/5773)
Branches     : 58.3%  (821/1408)
Functions    : 66.28% (580/875)
Lines        : 73.62% (3994/5425)
```

**Tests totales:** 1,482 tests pasando (110 suites)

---

## 🎯 Coverage Thresholds

### Global Thresholds (Jest Config)

Configurados en `package.json`:

```json
"coverageThreshold": {
  "global": {
    "lines": 70,
    "branches": 55,
    "functions": 65,
    "statements": 70
  }
}
```

**Criterios:**
- ✅ **Statements:** 70% mínimo (actual: 73.8%)
- ✅ **Branches:** 55% mínimo (actual: 58.3%)
- ✅ **Functions:** 65% mínimo (actual: 66.28%)
- ✅ **Lines:** 70% mínimo (actual: 73.62%)

**Nota:** Los thresholds están configurados **ligeramente por debajo** del coverage actual para permitir pequeñas fluctuaciones sin romper CI. Se recomienda **nunca bajar** de estos valores.

---

## 📝 Scripts de Coverage

### Unit Tests Coverage

```bash
# Coverage completo con reporte HTML
npm run test:cov

# Coverage con solo resumen en consola
npm run test:cov:summary

# Coverage y abrir reporte HTML (macOS/Linux)
npm run test:cov:html
```

### E2E Tests Coverage

```bash
# Coverage de tests E2E
npm run test:e2e:cov

# Coverage E2E y abrir reporte HTML
npm run test:e2e:cov:html
```

### Coverage Combinado

```bash
# Ejecutar unit + E2E coverage
npm run test:all:cov

# Alias de test:cov
npm run test:coverage
```

---

## 📂 Reportes Generados

### Unit Tests

- **Directorio:** `coverage/`
- **Reportes:**
  - `index.html` - Reporte interactivo HTML
  - `lcov.info` - Reporte LCOV (para CI/CD)
  - `coverage-final.json` - Datos JSON completos
  - `clover.xml` - Formato Clover XML

### E2E Tests

- **Directorio:** `coverage-e2e/`
- **Reportes:** Mismo formato que unit tests

---

## 🔍 Qué se Incluye en Coverage

### ✅ Incluido

```typescript
collectCoverageFrom: [
  "src/**/*.ts",          // Todo el código fuente
]
```

### ❌ Excluido

```typescript
collectCoverageFrom: [
  // Archivos de test
  "!src/**/*.spec.ts",
  "!src/**/*.e2e-spec.ts",
  
  // Archivos de infraestructura
  "!src/**/index.ts",
  "!src/main.ts",
  
  // Configuración
  "!src/config/**",
  
  // Base de datos
  "!src/database/migrations/**",
  "!src/database/seeds/**",
]
```

**Razón:** Los archivos excluidos son:
- Tests (no tiene sentido medir coverage de tests)
- Entry points (main.ts, index.ts)
- Configuración (archivos de config)
- Migraciones y seeds (datos, no lógica)

---

## 📈 Interpretación de Métricas

### Statements Coverage (73.8%)

**Qué mide:** Porcentaje de declaraciones ejecutadas.

```typescript
// Ejemplo
function example() {
  const x = 1;        // ✅ Statement 1
  const y = 2;        // ✅ Statement 2
  return x + y;       // ✅ Statement 3
}
// Si el test llama example(), statements = 100%
```

**Meta:** ≥70% (actual: 73.8% ✅)

### Branches Coverage (58.3%)

**Qué mide:** Porcentaje de ramas condicionales ejecutadas.

```typescript
// Ejemplo
function isAdult(age: number) {
  if (age >= 18) {     // Branch 1: true
    return true;
  } else {             // Branch 2: false
    return false;
  }
}

// Para 100% branches coverage necesitas:
// - Test con age >= 18 (cubre branch true)
// - Test con age < 18 (cubre branch false)
```

**Meta:** ≥55% (actual: 58.3% ✅)

**Nota:** Branches es la métrica más difícil de alcanzar (requiere tests para todos los if/else/switch/ternary).

### Functions Coverage (66.28%)

**Qué mide:** Porcentaje de funciones llamadas al menos una vez.

```typescript
// Ejemplo
class UserService {
  create() { }        // ✅ Llamada en tests
  update() { }        // ✅ Llamada en tests
  delete() { }        // ❌ Nunca llamada
  restore() { }       // ❌ Nunca llamada
}
// Functions coverage = 50% (2/4)
```

**Meta:** ≥65% (actual: 66.28% ✅)

### Lines Coverage (73.62%)

**Qué mide:** Porcentaje de líneas de código ejecutadas.

```typescript
// Ejemplo
function calculate(x: number, y: number) {
  const sum = x + y;         // ✅ Line 1
  const product = x * y;     // ❌ Line 2 (nunca ejecutada)
  const division = x / y;    // ❌ Line 3 (nunca ejecutada)
  return sum;                // ✅ Line 4
}
// Lines coverage = 50% (2/4)
```

**Meta:** ≥70% (actual: 73.62% ✅)

---

## 🚀 Mejorar Coverage

### Prioridades para Aumentar Coverage

1. **Branches (58.3% → 65%)**
   - Agregar tests para else clauses
   - Probar todos los casos de switch
   - Cubrir operadores ternarios

2. **Functions (66.28% → 75%)**
   - Identificar funciones sin tests
   - Agregar tests para métodos edge

3. **Lines/Statements (73% → 80%)**
   - Cubrir bloques de código no ejecutados
   - Agregar tests para error handling

### Comandos Útiles

#### Ver coverage detallado por archivo

```bash
npm run test:cov
# Abrir coverage/index.html en navegador
# Navegar a archivos específicos para ver líneas no cubiertas
```

#### Identificar archivos con bajo coverage

```bash
npm run test:cov 2>&1 | grep -A 20 "File.*%"
```

#### Coverage de un archivo específico

```bash
npx jest --coverage --collectCoverageFrom="src/path/to/file.ts" path/to/test.spec.ts
```

---

## ⚠️ Advertencias y Limitaciones

### Coverage NO Garantiza Calidad

```typescript
// ❌ 100% coverage pero test inútil
it('should create user', async () => {
  await service.createUser(userData);
  // Sin expect() - no verifica nada
});

// ✅ Coverage útil
it('should create user', async () => {
  const user = await service.createUser(userData);
  expect(user.id).toBeDefined();
  expect(user.email).toBe(userData.email);
});
```

**Importante:**
- Coverage mide **qué código se ejecuta**, no **qué se verifica**
- Tests sin `expect()` aumentan coverage pero no encuentran bugs
- Priorizar **calidad** sobre **cantidad**

### Mutación de Coverage vs Testing Real

```typescript
// Coverage 100% pero bug no detectado
function divide(a: number, b: number) {
  return a / b;  // Bug: división por 0 no manejada
}

it('should divide', () => {
  expect(divide(10, 2)).toBe(5);  // ✅ Pasa pero no cubre edge case
});

// Test completo
it('should throw on division by zero', () => {
  expect(() => divide(10, 0)).toThrow();  // 🔍 Encuentra el bug
});
```

### Coverage en Archivos Generados

- **Módulos NestJS (.module.ts):** Coverage bajo es normal (solo metadata)
- **DTOs simples:** Coverage bajo aceptable si son solo declaraciones
- **Entities:** Coverage puede ser bajo (TypeORM metadata)

---

## 📊 Coverage en CI/CD

### GitHub Actions

```yaml
- name: Run tests with coverage
  run: npm run test:cov

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
```

### Gitlab CI

```yaml
test:
  script:
    - npm run test:cov
  coverage: '/Lines\s+:\s+([\d.]+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

---

## 🎯 Roadmap de Coverage

### Corto Plazo (1-2 meses)

- [ ] Branches: 58% → 65% (+7%)
- [ ] Functions: 66% → 70% (+4%)
- [ ] Mantener Statements/Lines ≥73%

### Mediano Plazo (3-6 meses)

- [ ] Branches: 65% → 70% (+5%)
- [ ] Functions: 70% → 75% (+5%)
- [ ] Statements/Lines: 73% → 80% (+7%)

### Largo Plazo (6-12 meses)

- [ ] Todas las métricas ≥80%
- [ ] Archivos críticos ≥90%
- [ ] Mutation testing implementado

---

## 📚 Referencias

- [Jest Coverage Configuration](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [Istanbul Coverage Documentation](https://istanbul.js.org/)
- [Testing Best Practices](../TESTING_PHILOSOPHY.md)
- [Mutation Testing](https://stryker-mutator.io/)

---

## 🔧 Troubleshooting

### Coverage no genera reportes

```bash
# Limpiar coverage anterior
rm -rf coverage coverage-e2e

# Ejecutar de nuevo
npm run test:cov
```

### "Coverage threshold not met"

**Causa:** Coverage bajó por debajo de thresholds configurados.

**Solución:**
1. Revisar `package.json` → `coverageThreshold`
2. Agregar tests para código no cubierto
3. Si es aceptable, ajustar thresholds (documentar razón)

### Coverage muy lento

```bash
# Usar solo summary (más rápido)
npm run test:cov:summary

# Coverage de archivos específicos
npx jest --coverage --testPathPattern="specific-test"
```

### Worker process failed (timeout)

**Causa:** Tests con leaks de memoria o timers.

**Solución:**
```bash
# Detectar handles abiertos
npx jest --detectOpenHandles

# Aumentar timeout
npx jest --testTimeout=10000
```

---

**Última actualización:** 2025-11-20  
**Coverage actual:** 73.8% statements | 58.3% branches | 66.28% functions | 73.62% lines
