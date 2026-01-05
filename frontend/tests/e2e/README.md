# Tests E2E - Playwright

Tests end-to-end para la aplicación de Tarot usando Playwright.

## 📦 Instalación

Si aún no tienes Playwright configurado:

```bash
npm install -D @playwright/test
npx playwright install
```

## 🚀 Ejecutar Tests

```bash
# Todos los tests
npx playwright test

# Tests específicos
npx playwright test auth.spec.ts
npx playwright test reading-free.spec.ts
npx playwright test reading-premium.spec.ts
npx playwright test daily-card.spec.ts
npx playwright test plan-restrictions.spec.ts

# Modo UI (interactivo)
npx playwright test --ui

# Con navegador visible
npx playwright test --headed

# Modo debug
npx playwright test --debug

# Solo un test específico
npx playwright test -g "FREE user should NOT see categories"
```

## 📁 Estructura de Tests

```
tests/e2e/
├── README.md                     # Este archivo
├── auth.spec.ts                  # Tests de login y redirección
├── reading-free.spec.ts          # Flujo completo usuario FREE
├── reading-premium.spec.ts       # Flujo completo usuario PREMIUM
├── daily-card.spec.ts            # Carta del día (todos los usuarios)
└── plan-restrictions.spec.ts     # Verificación de restricciones por plan
```

## 🧪 Cobertura de Tests

### `auth.spec.ts` - Autenticación

- ✅ Login FREE redirige a home (/)
- ✅ Login PREMIUM redirige a home (/)
- ✅ Error con credenciales inválidas
- ✅ Estado de loading durante login
- ✅ Logout funciona correctamente

### `reading-free.spec.ts` - Usuario FREE

- ✅ FREE NO ve categorías (redirige automáticamente)
- ✅ FREE solo ve tiradas de 1-3 cartas
- ✅ FREE puede crear lectura de 1 carta
- ✅ FREE puede crear lectura de 3 cartas
- ✅ No puede seleccionar más cartas del límite
- ✅ Puede deseleccionar y reseleccionar cartas
- ✅ Botón submit deshabilitado hasta completar selección
- ✅ Resultado muestra cartas sin IA

### `reading-premium.spec.ts` - Usuario PREMIUM

- ✅ PREMIUM ve categorías
- ✅ PREMIUM puede seleccionar categoría
- ✅ PREMIUM puede usar pregunta predefinida
- ✅ PREMIUM puede escribir pregunta personalizada
- ✅ PREMIUM ve todas las tiradas (incluyendo avanzadas)
- ✅ PREMIUM SIEMPRE obtiene interpretación IA (automática)
- ✅ Loading state durante generación de IA
- ✅ Flujo completo: categoría → pregunta → tirada → cartas → IA
- ✅ Parámetros de URL se mantienen en navegación

### `daily-card.spec.ts` - Carta del Día

- ✅ Usuario ANÓNIMO puede obtener carta
- ✅ Usuario FREE puede obtener carta
- ✅ Usuario PREMIUM puede obtener carta
- ✅ Muestra imagen y detalles de carta
- ✅ Toast de éxito al revelar carta
- ✅ No puede obtener segunda carta el mismo día
- ✅ Animación de flip funciona
- ✅ Click en carta revelada no hace nada

### `plan-restrictions.spec.ts` - Restricciones

- ✅ FREE no puede escribir pregunta personalizada
- ✅ FREE no ve spreads avanzados
- ✅ FREE no tiene interpretación IA
- ✅ FREE ve badges "Premium" en features bloqueadas
- ✅ FREE no puede bypassear restricciones con URL directa
- ✅ PREMIUM puede escribir preguntas personalizadas
- ✅ PREMIUM ve todos los spreads
- ✅ PREMIUM SIEMPRE tiene IA automática
- ✅ Comparación de spreads FREE vs PREMIUM
- ✅ Comparación de IA en resultados
- ✅ Backend rechaza custom question de FREE (403)
- ✅ Backend NO genera IA para FREE

## ⚙️ Configuración

Crea `playwright.config.ts` en la raíz del proyecto frontend:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📝 Convenciones

### Selectores

- Preferir `data-testid` para elementos clave
- Usar roles de ARIA cuando sea posible
- Evitar selectores CSS frágiles

### Estructura de Tests

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup común
  });

  test('should do something', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Timeouts

- Tests normales: 30s (default)
- Tests con IA: 35s (timeout explícito)
- Carta del día: animación 1-1.5s

## 🔑 Usuarios de Test

```typescript
// Usuario FREE
Email: free@test.com
Password: Test123456!
Plan: FREE (2 lecturas/mes, sin IA)

// Usuario PREMIUM
Email: premium@test.com
Password: Test123456!
Plan: PREMIUM (4 lecturas/mes, IA siempre activa)

// Usuario ADMIN
Email: admin@test.com
Password: Test123456!
Plan: PREMIUM + Admin
```

## 🐛 Debugging

```bash
# Ver trace de test fallido
npx playwright show-report

# Modo debug paso a paso
npx playwright test --debug

# Inspector de Playwright
npx playwright codegen http://localhost:3001
```

## 📊 Reporte

Después de correr los tests, ver reporte HTML:

```bash
npx playwright show-report
```

## ⚠️ Requisitos Previos

1. **Backend corriendo** en `http://localhost:4000` (o el puerto configurado)
2. **Frontend corriendo** en `http://localhost:3001`
3. **Base de datos seeded** con usuarios de test
4. **Spreads seeded** correctamente

## 🚨 Tests que Fallarán Actualmente

Estos tests están escritos con el **flujo esperado** (correcto), pero fallarán hasta que se implementen las correcciones:

- ✅ `auth.spec.ts` → Login ahora redirige correctamente a / (FIXED)
- ❌ `reading-free.spec.ts` → FREE ve categorías (no debería)
- ❌ `reading-free.spec.ts` → Página /ritual/tirada no existe
- ❌ `reading-premium.spec.ts` → Página /ritual/lectura no existe o incompleta
- ❌ `plan-restrictions.spec.ts` → Restricciones no implementadas

## ✅ Tests que Deberían Pasar

- ✅ `daily-card.spec.ts` → La carta del día funciona correctamente
- ✅ Algunos tests de auth básicos

## 🔄 Después de Implementar Correcciones

Una vez implementadas las 7 tareas del documento `FLUJO_LECTURA_CORRECTO.md`, ejecutar:

```bash
# Todos los tests
npx playwright test

# Verificar que todos pasan
npx playwright test --reporter=list
```

## 📖 Documentación

- [Documentación de Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Flujo correcto esperado](../../FLUJO_LECTURA_CORRECTO.md)
