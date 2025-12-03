# Template: package.json Scripts Post-Setup

> Este archivo documenta los scripts que se configurarán en package.json después de inicializar Next.js.

## Scripts a Agregar/Modificar

Después de ejecutar `npx create-next-app@latest`, modificar `package.json`:

```json
{
  "name": "tarot-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "quality": "npm run lint && npm run type-check && npm run format && npm run build && npm run test"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.292.0",
    "sonner": "^1.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "14.0.4",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitest/ui": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

## Configuraciones Adicionales Necesarias

### 1. Vitest Config (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "*.config.*", "src/types/", "**/*.d.ts"],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 2. Test Setup (`tests/setup.ts`)

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock de Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));
```

### 3. Prettier Config (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 4. ESLint Config (`.eslintrc.json`)

Extender el generado por Next.js:

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 5. TypeScript Config (`tsconfig.json`)

Asegurar que tiene:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Orden de Configuración (Checklist)

Después de `npx create-next-app@latest`:

- [ ] Modificar `package.json` con scripts completos
- [ ] Instalar dependencias adicionales
- [ ] Crear `vitest.config.ts`
- [ ] Crear `tests/setup.ts`
- [ ] Configurar `.prettierrc`
- [ ] Extender `.eslintrc.json`
- [ ] Verificar `tsconfig.json`
- [ ] Copiar `.env.example` a `.env.local`
- [ ] Ejecutar `npm install`
- [ ] Verificar: `npm run quality`

## Verificación Post-Setup

```bash
# Debe pasar todo:
npm run lint        # ✅ Sin errores
npm run type-check  # ✅ Sin errores
npm run format      # ✅ Formatea código
npm run build       # ✅ Build exitoso
npm test            # ✅ Tests pasan (aunque no haya tests todavía)
npm run dev         # ✅ Abre en localhost:3001
```

Si todo pasa, el setup está completo y puedes comenzar con TAREA 0.2 del backlog.
