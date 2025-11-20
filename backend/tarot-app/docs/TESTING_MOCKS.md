# Testing Mocks - External Services

## 📖 Guía Completa de Mocking para Servicios Externos

Este documento describe cómo mockear servicios externos en tests para asegurar que:

- ✅ No se llaman APIs reales durante los tests
- ✅ Los tests son rápidos y predecibles
- ✅ No se consumen cuotas de APIs de pago
- ✅ Los tests pueden ejecutarse offline

---

## 🎯 Servicios Externos Mockeados

### 1. OpenAI API (AI Provider)

**Ubicación del mock:** `src/modules/ai/infrastructure/providers/openai.provider.spec.ts`

**Cómo mockear:**

```typescript
import OpenAI from 'openai';

// Mock OpenAI SDK at the top of the file
jest.mock('openai');

describe('OpenAIProvider', () => {
  let mockOpenAIClient: {
    chat: {
      completions: {
        create: jest.Mock;
      };
    };
  };

  beforeEach(() => {
    // Create mock OpenAI client
    mockOpenAIClient = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    // Mock OpenAI constructor
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => {
      return mockOpenAIClient as unknown as OpenAI;
    });
  });

  it('should call OpenAI API with correct parameters', async () => {
    // Setup mock response
    mockOpenAIClient.chat.completions.create.mockResolvedValue({
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4o-mini',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Mock interpretation',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    });

    // Execute test
    const result = await provider.generateCompletion(messages);

    // Verify
    expect(result.content).toBe('Mock interpretation');
    expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledTimes(1);
  });
});
```

**⚠️ IMPORTANTE:**

- ✅ Siempre usar `jest.mock('openai')` al principio del archivo
- ✅ NO usar API keys reales en tests
- ✅ Mockear tanto éxitos como errores (401, 429, 500, etc.)
- ✅ Incluir `usage` metadata en responses mockeadas

---

### 2. Groq API (AI Provider)

**Ubicación:** Similar a OpenAI, usar el mismo patrón

**Cómo mockear:**

```typescript
import Groq from 'groq-sdk';

jest.mock('groq-sdk');

describe('GroqProvider', () => {
  let mockGroqClient: {
    chat: {
      completions: {
        create: jest.Mock;
      };
    };
  };

  beforeEach(() => {
    mockGroqClient = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    (Groq as jest.MockedClass<typeof Groq>).mockImplementation(() => {
      return mockGroqClient as unknown as Groq;
    });
  });
});
```

---

### 3. DeepSeek API (AI Provider)

**Ubicación:** Similar a OpenAI/Groq

**Nota:** DeepSeek usa OpenAI SDK compatible, usar mismo patrón de mocking que OpenAI.

---

### 4. Email Service (MailerService)

**Ubicación del mock:** `src/modules/email/email.service.spec.ts`

**Cómo mockear:**

```typescript
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    mailerService = module.get<MailerService>(MailerService);
  });

  it('should send email successfully', async () => {
    // Setup mock
    mockMailerService.sendMail.mockResolvedValue({ messageId: 'test-id' });

    // Execute
    await service.sendWelcomeEmail('user@test.com', { name: 'Test User' });

    // Verify
    expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'user@test.com',
      subject: expect.any(String),
      template: expect.any(String),
      context: expect.objectContaining({
        name: 'Test User',
      }),
    });
  });

  it('should handle email sending errors', async () => {
    // Setup mock error
    mockMailerService.sendMail.mockRejectedValue(new Error('SMTP error'));

    // Execute and verify
    await expect(
      service.sendWelcomeEmail('user@test.com', { name: 'Test' }),
    ).rejects.toThrow('SMTP error');
  });
});
```

**⚠️ IMPORTANTE:**

- ✅ NO enviar emails reales durante tests
- ✅ Mockear tanto éxitos como errores (SMTP failures)
- ✅ Verificar que se llama con los parámetros correctos

---

### 5. Payment Gateway (si existe)

**Nota:** Actualmente no implementado, pero si se agrega Stripe/PayPal:

```typescript
import Stripe from 'stripe';

jest.mock('stripe');

describe('PaymentService', () => {
  let mockStripeClient: {
    paymentIntents: {
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    mockStripeClient = {
      paymentIntents: {
        create: jest.fn(),
      },
    };

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => {
      return mockStripeClient as unknown as Stripe;
    });
  });

  it('should create payment intent', async () => {
    mockStripeClient.paymentIntents.create.mockResolvedValue({
      id: 'pi_123',
      amount: 1000,
      currency: 'usd',
      status: 'requires_payment_method',
    });

    const result = await service.createPaymentIntent(10);
    expect(result.id).toBe('pi_123');
  });
});
```

---

## 📋 Checklist para Crear Nuevos Mocks

Cuando agregues un nuevo servicio externo:

1. **[ ] Identificar el servicio externo**

   - API de terceros (OpenAI, Stripe, etc.)
   - Servicio de email
   - Base de datos externa
   - Servicio de archivos (S3, etc.)

2. **[ ] Crear mock en unit tests**

   - Usar `jest.mock('package-name')` al inicio
   - Crear mock object con métodos necesarios
   - Mockear constructor si es necesario

3. **[ ] Mockear en @nestjs/testing**

   - Usar `{ provide: Service, useValue: mockService }` en TestingModule
   - Implementar todos los métodos usados en el código

4. **[ ] Testear escenarios de éxito**

   - Response exitoso típico
   - Response con datos mínimos
   - Response con datos completos

5. **[ ] Testear escenarios de error**

   - Errores HTTP (401, 429, 500, etc.)
   - Timeouts
   - Network errors
   - Datos inválidos

6. **[ ] Verificar no se llaman servicios reales**

   - NO usar API keys reales en tests
   - NO hacer requests HTTP reales
   - Tests deben pasar offline

7. **[ ] Documentar en este archivo**
   - Agregar sección para el nuevo servicio
   - Incluir ejemplos de código
   - Documentar casos edge importantes

---

## 🚫 Qué NO Hacer

### ❌ NUNCA usar API keys reales en tests

```typescript
// ❌ MAL - Llama API real
const apiKey = process.env.OPENAI_API_KEY;
const client = new OpenAI({ apiKey });

// ✅ BIEN - Mock
jest.mock('openai');
const mockClient = { chat: { completions: { create: jest.fn() } } };
```

### ❌ NUNCA hacer requests HTTP reales en unit tests

```typescript
// ❌ MAL - Request real
const response = await axios.post('https://api.openai.com/v1/chat/completions');

// ✅ BIEN - Mock axios
jest.mock('axios');
mockAxios.post.mockResolvedValue({ data: { result: 'mocked' } });
```

### ❌ NUNCA enviar emails reales en tests

```typescript
// ❌ MAL - Email real
await mailerService.sendMail({ to: 'real@email.com', ... });

// ✅ BIEN - Mock mailer
const mockMailer = { sendMail: jest.fn() };
```

### ❌ NUNCA depender de servicios externos para que tests pasen

```typescript
// ❌ MAL - Falla si OpenAI está down
test('should generate interpretation', async () => {
  const result = await openAIProvider.generate(messages); // Real API call
  expect(result).toBeDefined();
});

// ✅ BIEN - Siempre pasa
test('should generate interpretation', async () => {
  mockOpenAI.chat.completions.create.mockResolvedValue({ ... });
  const result = await openAIProvider.generate(messages);
  expect(result).toBeDefined();
});
```

---

## 🔍 Verificar que Mocks Están Funcionando

### Comando para verificar no se usan API keys reales:

```bash
# Buscar usos de API keys en tests
grep -r "process.env.OPENAI_API_KEY" test/ src/**/*.spec.ts

# No debería encontrar nada (o solo en setup mockeado)
```

### Comando para verificar tests pasan offline:

```bash
# Desconectar wifi/network y ejecutar tests
npm test

# Todos los tests deben pasar sin conexión a internet
```

### Verificar que no se hacen requests HTTP:

```bash
# Buscar fetch/axios/http en tests
grep -r "fetch\|axios\|http.get\|http.post" src/**/*.spec.ts

# Solo debería aparecer en mocks, no en código real de tests
```

---

## 📊 Estado Actual de Mocking

### ✅ Servicios Completamente Mockeados:

1. **OpenAI API** - `openai.provider.spec.ts` (31 tests)

   - ✅ Constructor mocking
   - ✅ Success scenarios
   - ✅ Error scenarios (401, 429, 500, timeout)
   - ✅ Usage metadata
   - ✅ isAvailable check

2. **AIProviderService** - `ai-provider.service.spec.ts` (23 tests)

   - ✅ Fallback logic (Groq → DeepSeek → OpenAI)
   - ✅ Circuit breaker
   - ✅ Retry logic
   - ✅ Cost calculation

3. **EmailService** - `email.service.spec.ts`

   - ✅ MailerService mocked
   - ✅ ConfigService mocked
   - ✅ No emails reales enviados

4. **InterpretationsService** - `interpretations.service.spec.ts`
   - ✅ AI providers mockeados
   - ✅ Cache mockeado
   - ✅ No llamadas reales a AI

### ⚠️ Servicios Parcialmente Mockeados:

Ninguno - Todos los servicios externos están completamente mockeados.

### ❌ Servicios Sin Mockear:

Ninguno - No hay servicios externos sin mockear.

---

## 🎓 Ejemplos Adicionales

### Mock de servicio con múltiples métodos:

```typescript
const mockComplexService = {
  method1: jest.fn(),
  method2: jest.fn(),
  method3: jest.fn(),
};

beforeEach(() => {
  // Setup default behaviors
  mockComplexService.method1.mockResolvedValue('default1');
  mockComplexService.method2.mockResolvedValue('default2');
  mockComplexService.method3.mockResolvedValue('default3');
});

it('should override default behavior', async () => {
  // Override for this specific test
  mockComplexService.method1.mockResolvedValue('custom');

  const result = await service.doSomething();
  expect(result).toBe('custom');
});
```

### Mock de servicio con callbacks:

```typescript
const mockServiceWithCallback = {
  subscribe: jest.fn((callback: (data: any) => void) => {
    // Simulate async callback
    setTimeout(() => callback({ event: 'test' }), 0);
    return { unsubscribe: jest.fn() };
  }),
};
```

### Mock de módulo completo:

```typescript
// __mocks__/external-sdk.ts
export class ExternalSDK {
  constructor(apiKey: string) {}
  async call() {
    return { mocked: true };
  }
}

// test.spec.ts
jest.mock('external-sdk');
```

---

## 📚 Referencias

- [Jest Mocking Documentation](https://jestjs.io/docs/mock-functions)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🔄 Mantener Este Documento Actualizado

Cuando agregues un nuevo servicio externo:

1. Agregar sección en "Servicios Externos Mockeados"
2. Incluir ejemplo de código
3. Actualizar "Estado Actual de Mocking"
4. Documentar casos edge importantes
5. Agregar a checklist si es patrón nuevo
