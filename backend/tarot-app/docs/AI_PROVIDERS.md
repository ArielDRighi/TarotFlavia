# AI Provider Configuration Guide

## 📋 Overview

This application supports multiple AI providers with a cost-optimized strategy:

- **Groq** (Primary - Free): Ultra-fast inference with Llama models
- **DeepSeek** (Growth - Low Cost): Cost-effective alternative at scale
- **OpenAI** (Fallback/Premium - Optional): Highest quality for premium features

## 🎯 Provider Strategy by Scale

### MVP Stage (0-100 users)

**Use:** Groq exclusively  
**Cost:** $0/month  
**Reason:** Free tier covers all needs, excellent quality with Llama 3.3 70B

### Growth Stage (100-1,000 users)

**Use:** DeepSeek as primary, Groq as fallback  
**Cost:** ~$0.80 per 1,000 interpretations  
**Reason:** Very affordable scaling, maintains quality

### Scale Stage (1,000+ users)

**Use:** Mix of DeepSeek and OpenAI based on features  
**Cost:** Varies by usage mix  
**Reason:** Optimize cost vs quality per feature

## 🔑 Getting API Keys

### Groq (Required for MVP)

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free (no credit card required)
3. Navigate to API Keys section
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)

**Limits:**

- 14,400 requests per day (free tier)
- 30 requests per minute
- Ultra-fast response times (<1s typically)

### DeepSeek (Optional - For Growth)

1. Visit [platform.deepseek.com](https://platform.deepseek.com)
2. Create account
3. Go to API Keys
4. Generate new key
5. Add credits to account (pay-as-you-go)

**Pricing:**

- ~$0.0008 per tarot interpretation
- ~$0.14 per 1M input tokens
- ~$0.28 per 1M output tokens

### OpenAI (Optional - For Premium/Fallback)

1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Navigate to API Keys
4. Create new secret key
5. Copy the key (starts with `sk-`)

**Pricing (GPT-4o-mini):**

- ~$0.0045 per tarot interpretation
- $0.150 per 1M input tokens
- $0.600 per 1M output tokens

## ⚙️ Environment Variables

### Required (Groq)

```bash
# Groq Configuration (Primary Provider - FREE)
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile  # Default, can be changed
```

### Optional (DeepSeek)

```bash
# DeepSeek Configuration (Growth Provider - LOW COST)
DEEPSEEK_API_KEY=sk_your_deepseek_key_here
DEEPSEEK_MODEL=deepseek-chat  # Default
```

### Optional (OpenAI)

```bash
# OpenAI Configuration (Fallback/Premium - OPTIONAL)
OPENAI_API_KEY=sk_your_openai_key_here
OPENAI_MODEL=gpt-4o-mini  # Default for cost efficiency
```

## 📊 Cost Comparison

| Provider     | Cost per 1K Interpretations | Quality    | Speed      | Best For          |
| ------------ | --------------------------- | ---------- | ---------- | ----------------- |
| **Groq**     | **$0** (free tier)          | ⭐⭐⭐⭐   | ⚡⚡⚡⚡⚡ | MVP, Testing      |
| **DeepSeek** | **$0.80**                   | ⭐⭐⭐⭐   | ⚡⚡⚡⚡   | Growth, Scale     |
| **OpenAI**   | **$4.50**                   | ⭐⭐⭐⭐⭐ | ⚡⚡⚡     | Premium, Fallback |

### Example Cost Scenarios

**Scenario 1: 100 users, 10 readings/month each (1,000 readings)**

- Groq: $0 ✅
- DeepSeek: $0.80
- OpenAI: $4.50

**Scenario 2: 1,000 users, 10 readings/month each (10,000 readings)**

- Groq: $0 (but limited to 14,400/day) ⚠️
- DeepSeek: $8.00 ✅
- OpenAI: $45.00

**Scenario 3: 5,000 users, 10 readings/month each (50,000 readings)**

- Groq: Not viable (rate limits) ❌
- DeepSeek: $40.00 ✅
- OpenAI: $225.00

## 🔄 Migration Strategy

### Phase 1: MVP (Launch - 100 users)

```bash
# .env
GROQ_API_KEY=gsk_xxx  # Only Groq needed
GROQ_MODEL=llama-3.3-70b-versatile
```

**Action:** None needed, stay on free tier

### Phase 2: Early Growth (100-500 users)

```bash
# .env
GROQ_API_KEY=gsk_xxx  # Keep as fallback
GROQ_MODEL=llama-3.3-70b-versatile

DEEPSEEK_API_KEY=sk_xxx  # Add DeepSeek
DEEPSEEK_MODEL=deepseek-chat
```

**Action:**

1. Get DeepSeek API key
2. Add environment variables
3. Deploy update
4. Monitor costs (~$4-8/month)

### Phase 3: Scale (500+ users)

```bash
# .env - All providers configured
GROQ_API_KEY=gsk_xxx
DEEPSEEK_API_KEY=sk_xxx
OPENAI_API_KEY=sk_xxx  # Optional for premium features
```

**Action:**

1. Implement feature-based routing:
   - Free users → DeepSeek
   - Premium users → OpenAI
   - Fallback → Groq
2. Monitor costs and quality metrics
3. Adjust strategy based on data

## 🏥 Health Checks

### Check All Providers

```bash
curl http://localhost:3000/health/ai
```

**Response:**

```json
{
  "primary": {
    "provider": "groq",
    "configured": true,
    "status": "ok",
    "model": "llama-3.3-70b-versatile",
    "responseTime": 150,
    "rateLimits": {
      "remaining": 14350,
      "limit": 14400,
      "reset": "2024-01-15T00:00:00Z"
    }
  },
  "fallback": [
    {
      "provider": "openai",
      "configured": true,
      "status": "ok",
      "model": "gpt-4o-mini",
      "responseTime": 450
    }
  ],
  "timestamp": "2024-01-14T10:30:00Z"
}
```

## 🚨 Error Handling

### Common Errors

**Invalid API Key Format**

```json
{
  "provider": "groq",
  "configured": false,
  "status": "error",
  "error": "Invalid API key format (must start with gsk_)"
}
```

**Rate Limit Exceeded**

```json
{
  "provider": "groq",
  "status": "error",
  "error": "Rate limit exceeded (too many requests)"
}
```

**Provider Timeout**

```json
{
  "provider": "groq",
  "status": "error",
  "error": "Request timeout (groq took too long to respond)"
}
```

## ⚡ Performance Guidelines

### Timeouts by Provider

- **Groq:** 10s (ultra-fast, rarely needs more)
- **DeepSeek:** 15s (fast, but slightly slower)
- **OpenAI:** 30s (can be slower at peak times)

### Best Practices

1. **Always configure Groq** - It's free and fast
2. **Monitor costs** - Check DeepSeek usage weekly
3. **Use fallbacks** - Configure at least one backup provider
4. **Test health endpoint** - Check `/health/ai` before going live
5. **Log everything** - Monitor which provider is used per request

## 📈 Monitoring

### Key Metrics to Track

1. **Requests per provider**

   - Count how many requests each provider handles
   - Identify primary usage patterns

2. **Success rates**

   - Track failures by provider
   - Implement alerts for high failure rates

3. **Response times**

   - Monitor latency by provider
   - Set SLAs based on provider capabilities

4. **Costs**
   - Calculate actual cost per interpretation
   - Compare against projections
   - Set budget alerts

### Example Logging

```typescript
// Service automatically logs:
// ✅ "Groq health check passed (150ms)"
// ❌ "OpenAI health check failed: Rate limit exceeded"
// ⚠️ "Fallback activated: Groq → OpenAI"
```

## 🔐 Security

### API Key Storage

- **Never commit API keys** to version control
- Use `.env` files (gitignored)
- Rotate keys regularly
- Use different keys for dev/staging/prod

### Key Rotation

```bash
# 1. Generate new key in provider console
# 2. Update .env file
# 3. Restart application
# 4. Verify with health check
# 5. Delete old key from provider
```

## 📊 Cuotas Mensuales por Plan

### Límites de Uso

El sistema implementa cuotas mensuales para prevenir abuso y optimizar costos:

| Plan    | Cuota Mensual          | Advertencia | Acción al Límite                |
| ------- | ---------------------- | ----------- | ------------------------------- |
| FREE    | 100 interpretaciones\* | 80% (80)    | Bloqueo + Email de notificación |
| PREMIUM | Ilimitado              | N/A         | Sin restricciones               |

_\* Configurable vía variables de entorno (ver `.env.example`)_

### Variables de Entorno

```bash
# AI Quota Configuration (Optional - Has Defaults)
AI_QUOTA_FREE_MONTHLY=100        # FREE plan: Max AI requests per month
AI_QUOTA_PREMIUM_MONTHLY=-1      # PREMIUM plan: -1 = unlimited
```

### Integración del Sistema de Cuotas

#### AIQuotaGuard

Aplicado automáticamente a endpoints que consumen IA:

```typescript
@UseGuards(JwtAuthGuard, AIQuotaGuard, CheckUsageLimitGuard)
@Post(':id/regenerate')
async regenerate(@Param('id') readingId: string, @Req() req: any) {
  // El guard valida cuota ANTES de permitir acceso
  // Si cuota excedida: 403 Forbidden con mensaje informativo
}
```

Endpoints protegidos:

- `POST /readings/:id/regenerate` - Regenerar lectura
- `POST /daily-reading/regenerate` - Regenerar carta del día
- `POST /interpretations/generate` - Generar interpretación IA

#### Tracking de Uso

El tracking se realiza automáticamente en `AIProviderService` después de cada llamada exitosa:

```typescript
// En AIProviderService.complete()
if (userId) {
  await this.aiQuotaService.trackMonthlyUsage(
    userId,
    1, // 1 request
    response.tokensUsed.total,
    costUsd,
    response.provider,
  );
}
```

#### Notificaciones por Email

El sistema envía emails automáticos en dos escenarios:

**1. Advertencia al 80% (quota-warning-80.hbs)**

- Envío: Una vez al alcanzar 80% de uso
- Contenido: Uso actual, restante, fecha de renovación
- CTA: Botón de upgrade a Premium

**2. Límite alcanzado al 100% (quota-limit-reached.hbs)**

- Envío: Al alcanzar 100% de uso
- Contenido: Cuota agotada, fecha de renovación
- CTA: Botón de upgrade a Premium

#### Reset Mensual

Las cuotas se resetean automáticamente el día 1 de cada mes a las 00:00 vía cron job:

```typescript
@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
async resetMonthlyQuotas(): Promise<void> {
  // Resetea contadores de todos los usuarios
  // aiRequestsUsedMonth = 0
  // aiTokensUsedMonth = 0
  // aiCostUsdMonth = 0
  // quotaWarningSent = false
}
```

### Consultar Cuota de Usuario

Endpoint para verificar cuota actual:

```bash
# GET /ai-quota/me
# Requiere autenticación JWT
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/ai-quota/me
```

Respuesta:

```json
{
  "quotaLimit": 100,
  "requestsUsed": 45,
  "requestsRemaining": 55,
  "percentageUsed": 45,
  "resetDate": "2025-02-01T00:00:00.000Z",
  "warningTriggered": false,
  "plan": "FREE",
  "tokensUsed": 123456,
  "costEstimated": 0.045,
  "providerPrimarilyUsed": "groq"
}
```

## 📞 Support

### Groq

- Docs: [console.groq.com/docs](https://console.groq.com/docs)
- Discord: [groq.com/discord](https://groq.com/discord)

### DeepSeek

- Docs: [platform.deepseek.com/docs](https://platform.deepseek.com/docs)
- Support: support@deepseek.com

### OpenAI

- Docs: [platform.openai.com/docs](https://platform.openai.com/docs)
- Support: [help.openai.com](https://help.openai.com)

---

**Last Updated:** October 2025  
**Maintained By:** Development Team
