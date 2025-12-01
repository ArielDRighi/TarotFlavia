# Configurar Proveedor de IA (Groq/DeepSeek) y Verificación

> **TASK-004** | Estado: ✅ COMPLETADO | Prioridad: 🔴 CRÍTICA | Branch: `feature/TASK-004`

## 📋 Resumen

Configuración de proveedor de IA gratuito (Groq) como principal con OpenAI como fallback opcional. Health checks para verificar conectividad al arrancar.

## ✅ Verificación de Implementación

| Requisito                    | Estado | Implementación                            |
| ---------------------------- | ------ | ----------------------------------------- |
| Groq como provider principal | ✅     | GROQ*API_KEY requerido, validación `gsk*` |
| GROQ_MODEL configurable      | ✅     | Default: `llama-3.3-70b-versatile`        |
| DeepSeek opcional            | ✅     | DEEPSEEK_API_KEY opcional                 |
| OpenAI fallback opcional     | ✅     | OPENAI_API_KEY opcional con `sk-`         |
| AIHealthService              | ✅     | 324 líneas con checks por provider        |
| Endpoint `/health/ai`        | ✅     | Con schema Swagger documentado            |
| Timeouts configurados        | ✅     | Groq: 10s, DeepSeek: 15s, OpenAI: 30s     |
| Documentación completa       | ✅     | AI_PROVIDERS.md (456 líneas)              |
| Tests unitarios              | ✅     | \*.spec.ts para service y controller      |
| Logging por proveedor        | ✅     | Logger en AIHealthService                 |
| Circuit breakers             | ✅     | Integrado con AIProviderService           |

## 📁 Archivos Implementados

```
src/modules/
├── ai/
│   ├── ai.module.ts
│   ├── application/
│   │   └── services/
│   │       └── ai-provider.service.ts    # Servicio principal IA
│   ├── domain/
│   └── infrastructure/
└── health/
    ├── health.module.ts
    ├── health.controller.ts
    ├── ai-health.service.ts              # Health checks IA
    ├── ai-health.service.spec.ts
    ├── ai-health.controller.ts           # Endpoint /health/ai
    └── ai-health.controller.spec.ts

docs/
└── AI_PROVIDERS.md                       # Guía completa (456 líneas)
```

## 💰 Estrategia de Costos

| Etapa                    | Provider | Costo       | Límites        |
| ------------------------ | -------- | ----------- | -------------- |
| **MVP (0-100 usuarios)** | Groq     | $0/mes      | 14,400 req/día |
| **Growth (100-1000)**    | DeepSeek | ~$0.80/1000 | Pay-as-you-go  |
| **Scale (1000+)**        | Mix      | Variable    | Según feature  |

## 🔗 Endpoint `/health/ai`

```json
GET /health/ai

{
  "primary": {
    "provider": "groq",
    "configured": true,
    "status": "ok",
    "model": "llama-3.3-70b-versatile",
    "responseTime": 150,
    "rateLimits": {
      "limit": 14400,
      "remaining": null
    }
  },
  "fallback": [
    {
      "provider": "deepseek",
      "configured": false,
      "status": "not_configured"
    },
    {
      "provider": "openai",
      "configured": true,
      "status": "ok",
      "model": "gpt-4o-mini"
    }
  ],
  "circuitBreakers": { ... },
  "timestamp": "2025-11-29T..."
}
```

## 🧪 Tests de Integración

### Tests Unitarios Existentes

| Archivo                        | Estado | Cobertura           |
| ------------------------------ | ------ | ------------------- |
| `ai-health.service.spec.ts`    | ✅     | Checks de providers |
| `ai-health.controller.spec.ts` | ✅     | Endpoint /health/ai |

### Tests E2E Existentes/Faltantes

| Test                        | Estado       | Descripción                |
| --------------------------- | ------------ | -------------------------- |
| GET /health/ai retorna 200  | ⚠️ Verificar | En test/health.e2e-spec.ts |
| Fallback cuando Groq falla  | ⚠️ Manual    | Mockear Groq error         |
| App arranca solo con Groq   | ✅           | OPENAI_API_KEY opcional    |
| Logs correctos por provider | ✅           | Logger implementado        |

### Script de Test Recomendado

```bash
#!/bin/bash
# test-ai-providers.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🤖 Verificando proveedores de IA..."

# 1. Check health endpoint
response=$(curl -s "$BASE_URL/health/ai")
echo "$response" | jq .

# 2. Verificar Groq configurado
echo "$response" | jq -e '.primary.status == "ok"' && echo "✅ Groq OK" || echo "❌ Groq Error"

# 3. Verificar endpoint responde
http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health/ai")
[ "$http_code" -eq 200 ] && echo "✅ Endpoint responde 200" || echo "❌ Error HTTP $http_code"

echo "🤖 Verificación completada"
```

## 📝 Variables de Entorno

```bash
# Requerido
GROQ_API_KEY=gsk_xxxxx...
GROQ_MODEL=llama-3.3-70b-versatile

# Opcional (DeepSeek)
DEEPSEEK_API_KEY=sk-xxxxx...
DEEPSEEK_MODEL=deepseek-chat

# Opcional (OpenAI Fallback)
OPENAI_API_KEY=sk-xxxxx...
OPENAI_MODEL=gpt-4o-mini
```

## 🔗 Referencias

- [AI_PROVIDERS.md](../AI_PROVIDERS.md) - Guía completa de proveedores
- [ai-health.service.ts](../../src/modules/health/ai-health.service.ts) - Servicio health
