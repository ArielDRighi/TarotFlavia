# Developer Testing Workflows

## 🚀 Quick Start para Desarrolladores

Esta guía describe los workflows de testing optimizados para desarrollo diario.

---

## ⚡ Comandos Esenciales

### Durante Desarrollo (Watch Mode)

```bash
# Watch mode para unit tests (recomendado durante desarrollo)
npm run test:watch

# Watch mode para E2E tests
npm run test:e2e:watch
```

**Watch mode:**

- ✅ Re-ejecuta tests automáticamente cuando guardas archivos
- ✅ Solo corre tests relacionados a archivos modificados
- ✅ Interfaz interactiva para filtrar tests
- ✅ Muy rápido (solo corre lo necesario)

### Antes de Commit

```bash
# Ejecutar todos los tests (unit + E2E)
npm test && npm run test:e2e

# O más rápido (solo unit tests)
npm test
```

**Tiempo esperado:**

- Unit tests: ~90 segundos
- E2E tests: ~2-3 minutos
- Total: ~4-5 minutos

### Debug de Tests

```bash
# Debug con Chrome DevTools
npm run test:debug

# Luego abrir: chrome://inspect
# Click en "inspect" para el proceso de Node
```

---

## 📋 Workflows por Escenario

### Workflow 1: Desarrollando Nueva Feature

**Escenario:** Estás creando un nuevo endpoint o use case.

```bash
# 1. Crear test primero (TDD)
touch src/modules/feature/feature.service.spec.ts

# 2. Activar watch mode
npm run test:watch

# 3. Presionar 'p' en watch mode
# 4. Escribir: feature.service
# 5. Solo correrá ese archivo de test

# 6. Desarrollar iterativamente:
#    - Escribir test que falla (RED)
#    - Implementar código (GREEN)
#    - Refactorizar (REFACTOR)
#    - Repetir
```

**Tips:**

- Watch mode detecta cambios automáticamente
- Presiona `o` para correr solo tests de archivos modificados
- Presiona `a` para correr todos los tests
- Presiona `q` para salir

### Workflow 2: Fixing Bug

**Escenario:** Encontraste un bug en producción.

```bash
# 1. Crear test que reproduce el bug
# El test debe FALLAR (confirma el bug)

# 2. Ejecutar solo ese test
npm run test:watch
# Presionar 'p' → escribir nombre del archivo

# 3. Implementar fix

# 4. Verificar que el test pasa
# Watch mode lo detecta automáticamente

# 5. Ejecutar todos los tests antes de commit
npm test
```

### Workflow 3: Refactoring

**Escenario:** Vas a refactorizar código existente.

```bash
# 1. Asegurar que tests actuales pasan
npm test

# 2. Activar watch mode
npm run test:watch

# 3. Refactorizar código
# Watch mode alertará inmediatamente si rompes algo

# 4. Verificar coverage no bajó
npm run test:cov:summary

# 5. Si todo OK, commit
git commit -m "refactor: improve service logic"
```

### Workflow 4: Code Review

**Escenario:** Estás revisando un PR.

```bash
# 1. Checkout del branch
git checkout feature-branch

# 2. Ejecutar todos los tests
npm test && npm run test:e2e

# 3. Verificar coverage
npm run test:cov:summary

# 4. Revisar reportes HTML
npm run test:cov:html
# Abrir coverage/index.html

# 5. Buscar archivos sin tests
# Revisar cobertura de nuevos archivos
```

### Workflow 5: Pre-Push

**Escenario:** Antes de hacer push al repositorio.

```bash
# 1. Ejecutar linter
npm run lint

# 2. Ejecutar todos los tests con coverage
npm run test:cov:summary

# 3. Verificar E2E tests
npm run test:e2e

# 4. Si todo OK, push
git push origin feature-branch
```

---

## 🎯 Jest Watch Mode - Comandos Interactivos

Cuando ejecutas `npm run test:watch`, tienes estos comandos disponibles:

### Comandos de Filtrado

```
› Press f to run only failed tests.
› Press o to only run tests related to changed files.
› Press p to filter by a filename regex pattern.
› Press t to filter by a test name regex pattern.
› Press a to run all tests.
```

### Comandos de Utilidad

```
› Press q to quit watch mode.
› Press Enter to trigger a test run.
```

### Ejemplos de Uso

**Filtrar por nombre de archivo:**

```
Press p
Pattern: auth.service
# Solo corre auth.service.spec.ts
```

**Filtrar por nombre de test:**

```
Press t
Pattern: should create user
# Solo corre tests que contengan "should create user"
```

**Solo tests que fallaron:**

```
Press f
# Re-ejecuta solo los tests rojos
```

---

## 🐛 Debug Workflows

### Debug con VS Code

**Configuración:** Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasenameNoExtension}",
        "--runInBand",
        "--no-cache",
        "--watchAll=false"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "windows": {
        "program": "${workspaceFolder}/node_modules/jest/bin/jest"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug All",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache", "--watchAll=false"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

**Uso:**

1. Abrir archivo de test en VS Code
2. Poner breakpoint (click en número de línea)
3. Presionar F5 o "Debug Current File"
4. Navegar con F10 (step over), F11 (step into)

### Debug con Chrome DevTools

```bash
# 1. Ejecutar
npm run test:debug

# 2. Abrir Chrome → chrome://inspect

# 3. Click "inspect" en el proceso de Node

# 4. Usar DevTools:
#    - Sources tab para ver código
#    - Console para evaluar expresiones
#    - Breakpoints en código
```

### Debug de Test Específico

```bash
# Debug solo un archivo
node --inspect-brk ./node_modules/.bin/jest --runInBand src/path/to/test.spec.ts

# Debug test específico por nombre
node --inspect-brk ./node_modules/.bin/jest --runInBand -t "should create user"
```

---

## ⚡ Optimización de Velocidad

### Tests Lentos Actual

**Tiempos medidos:**

- Unit tests: ~90 segundos (110 suites, 1,482 tests)
- E2E tests: ~2-3 minutos
- **Total: ~4-5 minutos**

**Objetivo:** Mantener unit tests bajo 2 minutos.

### Tips para Tests Rápidos

#### 1. Usar `--bail` para fallar rápido

```bash
# Detener al primer test que falla
npx jest --bail

# O configurar en package.json
"test:fast": "jest --bail --maxWorkers=50%"
```

#### 2. Paralelización

```bash
# Usar más workers (por defecto: número de CPUs - 1)
npx jest --maxWorkers=4

# O porcentaje de CPUs
npx jest --maxWorkers=50%
```

**Nota:** Ya está configurado por defecto en Jest.

#### 3. Solo archivos modificados

```bash
# Watch mode automáticamente hace esto
npm run test:watch
# Presionar 'o' → only changed files
```

#### 4. Cache de Jest

```bash
# Jest cachea automáticamente
# Si hay problemas, limpiar cache:
npx jest --clearCache
```

#### 5. Skip tests lentos durante desarrollo

```typescript
// Marcar test como skip temporalmente
it.skip('slow integration test', async () => {
  // ...
});

// O solo este test
it.only('fast test I'm working on', () => {
  // ...
});
```

**⚠️ IMPORTANTE:** Nunca commitear `.skip` o `.only`.

---

## 📊 Monitoring de Performance

### Ver tests más lentos

```bash
# Ejecutar con reporter verbose
npx jest --verbose

# Buscar tests que toman >5 segundos
npx jest --verbose 2>&1 | grep -E '\([5-9]\.[0-9]+ s\)'
```

### Timeout de tests

```typescript
// Aumentar timeout para test específico
it('slow test', async () => {
  // ...
}, 10000); // 10 segundos

// Configurar timeout global en jest.config
{
  "testTimeout": 5000 // 5 segundos por defecto
}
```

**Actual:** 5000ms por defecto (configurado en Jest).

---

## 🔄 CI/CD Workflows

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:cov

      - name: Run E2E tests
        run: npm run test:e2e:cov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info,./coverage-e2e/lcov.info
```

### Pre-commit Hook (Husky)

```bash
# Instalar husky
npm install --save-dev husky

# Configurar pre-commit
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

**Recomendación:** Solo lint + unit tests en pre-commit (E2E tests en CI).

---

## 📝 Checklist para Desarrolladores

### Antes de Empezar a Codear

- [ ] Pull últimos cambios: `git pull origin main`
- [ ] Instalar dependencias: `npm install`
- [ ] Verificar tests pasan: `npm test`
- [ ] Activar watch mode: `npm run test:watch`

### Durante Desarrollo

- [ ] Tests en watch mode corriendo
- [ ] Escribir test antes de código (TDD)
- [ ] Verificar test falla primero (RED)
- [ ] Implementar código mínimo (GREEN)
- [ ] Refactorizar si necesario (REFACTOR)
- [ ] Repetir ciclo

### Antes de Commit

- [ ] Todos los tests pasan: `npm test`
- [ ] Sin errores de linter: `npm run lint`
- [ ] Coverage no bajó: `npm run test:cov:summary`
- [ ] No hay `.only` o `.skip` en tests
- [ ] Commit message descriptivo

### Antes de Push

- [ ] Tests E2E pasan: `npm run test:e2e`
- [ ] Branch actualizado: `git pull --rebase origin main`
- [ ] Conflictos resueltos (si hay)
- [ ] Push: `git push origin feature-branch`

### Antes de Merge

- [ ] PR aprobado por reviewer
- [ ] CI/CD verde (todos los checks pasan)
- [ ] Coverage ≥ thresholds
- [ ] No hay conflictos con main
- [ ] Squash commits si es necesario

---

## 🛠️ Troubleshooting

### Tests no se re-ejecutan en watch mode

**Problema:** Watch mode no detecta cambios.

**Solución:**

```bash
# 1. Salir de watch mode (q)
# 2. Limpiar cache
npx jest --clearCache
# 3. Re-iniciar watch mode
npm run test:watch
```

### "Worker process failed to exit"

**Problema:** Tests no terminan, timeout.

**Solución:**

```typescript
// Cerrar conexiones en afterAll
afterAll(async () => {
  await app.close();
  await dataSource.destroy();
});
```

### Tests lentos después de agregar muchos

**Problema:** Tests ahora toman >5 minutos.

**Solución:**

```bash
# 1. Identificar tests lentos
npx jest --verbose 2>&1 | grep -E '\([5-9]\.[0-9]+ s\)'

# 2. Optimizar o marcar como skip temporalmente
it.skip('very slow integration test', () => {
  // Mover a E2E tests
});

# 3. Considerar dividir test suite
```

### "Cannot find module" en tests

**Problema:** Imports no resuelven correctamente.

**Solución:**

```bash
# Verificar tsconfig paths
# Verificar moduleNameMapper en jest config

# En package.json:
{
  "jest": {
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

---

## 📚 Recursos Adicionales

- [TESTING_PHILOSOPHY.md](./TESTING_PHILOSOPHY.md) - Filosofía de testing
- [TESTING.md](./TESTING.md) - Guía completa de testing
- [FIXTURES_GUIDE.md](./FIXTURES_GUIDE.md) - Uso de fixtures y factories
- [TESTING_MOCKS.md](./TESTING_MOCKS.md) - Mocking de servicios externos
- [COVERAGE.md](./COVERAGE.md) - Coverage configuration y mejora

---

## 🎓 Best Practices

### DO ✅

- ✅ Usar watch mode durante desarrollo
- ✅ Ejecutar todos los tests antes de commit
- ✅ Escribir tests antes de código (TDD)
- ✅ Mantener tests rápidos (<100ms por test unit)
- ✅ Usar descriptive test names
- ✅ Limpiar recursos en afterEach/afterAll
- ✅ Mockear servicios externos

### DON'T ❌

- ❌ Commitear `.only` o `.skip`
- ❌ Pushear sin correr tests
- ❌ Ignorar tests rojos
- ❌ Escribir tests sin `expect()`
- ❌ Dejar console.log en tests
- ❌ Tests que dependen de orden de ejecución
- ❌ Compartir estado entre tests

---

**Última actualización:** 2025-11-20  
**Tiempo promedio de tests:** Unit: ~90s | E2E: ~2-3min | Total: ~4-5min
