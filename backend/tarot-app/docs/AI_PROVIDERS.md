# AI Provider Configuration Guide

## 📋 Resumen

La aplicación soporta varios proveedores de IA con fallback automático. El
reparto **no** es por escala de usuarios sino **por feature**, y está fijado en
el código con el parámetro `primaryProvider` de `AIProviderService.generateCompletion`:

| Feature                                   | Primario     | Dónde se decide                                    |
| ----------------------------------------- | ------------ | -------------------------------------------------- |
| Horóscopo diario (occidental)             | **Groq**     | `horoscope-generation.service.ts`                   |
| Horóscopo chino                           | **Groq**     | `chinese-horoscope.service.ts`                      |
| Tarot (tiradas y carta del día)           | **DeepSeek** | `interpretations.service.ts`                        |
| Numerología                               | **DeepSeek** | `numerology.service.ts`                             |
| Carta astral                              | **DeepSeek** | `chart-ai-synthesis.service.ts`                     |

**El motivo del reparto:** los horóscopos son 12 generaciones por día, fijas y
predecibles, que entran cómodas en el tier gratuito de Groq. El tarot y las
features premium son a demanda, necesitan respuestas más largas y no pueden
depender de una cuota gratuita que se agota — por eso van a DeepSeek, que se
paga por uso.

Si el primario falla, `getOrderedProviders` prueba los demás proveedores
**configurados** en su orden por defecto. Un proveedor sin API key no se
registra: no es fallback, sencillamente no existe.

⚠️ **Esto último causó una caída completa** el 26-ago-2026: en producción solo
estaba `GROQ_API_KEY`, así que cuando Groq decomisionó el modelo no había a qué
caer. Ver el runbook más abajo.
## 🔑 Getting API Keys

### Groq (requerido)

1. Entrá a [console.groq.com](https://console.groq.com)
2. Registrate gratis (no pide tarjeta)
3. Andá a la sección API Keys
4. Creá la key y copiala (arranca con `gsk_`)

**Límites del tier gratuito** (leídos de los headers `x-ratelimit-*` el
26-ago-2026, **por modelo**):

- 1.000 requests por día
- 8.000 tokens por minuto ← es el que manda en la generación de horóscopos
- Respuestas de ~2s con `reasoning_effort: 'low'`

⚠️ La documentación de Groq y las versiones viejas de este archivo hablaban de
14.400 requests/día y 30 RPM. Ya no aplica: verificá siempre contra los headers.

**Modelos disponibles en la cuenta** (26-ago-2026): `openai/gpt-oss-120b`,
`openai/gpt-oss-20b`, `groq/compound`, `groq/compound-mini` (se decomisiona el
21-09-2026), `qwen/qwen3.6-27b`, `qwen/qwen3.8-27b`. **Ningún Llama.**

### DeepSeek (requerido)

1. Entrá a [platform.deepseek.com](https://platform.deepseek.com)
2. Creá la cuenta
3. Generá la key en API Keys
4. Cargá saldo (pago por uso)

**Precios** ([doc oficial](https://api-docs.deepseek.com/quick_start/pricing)):

- Entrada (cache miss): $0,22 / 1M off-peak — $0,44 en pico
- Salida: $0,66 / 1M off-peak — $1,32 en pico
- Horario pico: 01:00-04:00 y 06:00-10:00 UTC, de lunes a viernes

Consultá el saldo con `curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" https://api.deepseek.com/user/balance`.

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

## ⚙️ Variables de Entorno

### Groq (requerido — horóscopos)

```bash
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=openai/gpt-oss-120b  # default; verificá que siga en el catálogo
```

### DeepSeek (requerido — tarot, numerología, carta astral)

```bash
DEEPSEEK_API_KEY=sk-your_deepseek_key_here
DEEPSEEK_MODEL=deepseek-v4-flash  # default
```

Sin `DEEPSEEK_API_KEY` el provider no se registra y esas features caen a Groq,
consumiendo su cuota gratuita (que está dimensionada solo para los horóscopos).

### OpenAI (opcional — fallback)

```bash
OPENAI_API_KEY=sk_your_openai_key_here
OPENAI_MODEL=gpt-4o-mini
```

## 📊 Costos (medidos el 26-ago-2026)

| Proveedor    | Costo por interpretación | Base de la medición                              |
| ------------ | ------------------------ | ------------------------------------------------ |
| **Groq**     | **$0** (tier gratuito)   | 1.345 tokens por horóscopo, dentro de la cuota    |
| **DeepSeek** | **~$0,0008** off-peak    | Tirada real de 3 cartas: 164 in / 1.250 out       |
| **OpenAI**   | no configurado           | —                                                 |

DeepSeek cobra el doble en horario pico (01:00-04:00 y 06:00-10:00 UTC, de lunes
a viernes), o sea ~$0,0016 por tirada. Con un saldo de USD 2 alcanza para unas
2.300 tiradas off-peak.

⚠️ El costo se dispara si se deja el modo pensante encendido: la misma tirada
pasa a 2.498 tokens de salida (1.395 de ellos de razonamiento, facturados como
salida), o sea ~$0,0017 — el doble. Por eso el provider manda
`thinking: { type: 'disabled' }`.

## 🔄 Qué Hacer Cuando un Proveedor Decomisiona un Modelo

Pasó el 26-ago-2026 y dejó producción sin IA: Groq retiró toda la familia Llama
y `llama-3.3-70b-versatile` empezó a devolver 404 `model_not_found`. Como Groq
era el único proveedor configurado en producción, se cayeron los horóscopos
diarios Y las tiradas de tarot al mismo tiempo.

**Runbook:**

1. **Confirmar el diagnóstico** en el health de producción — el bloque `ai`
   muestra el modelo y el error crudo del proveedor:

   ```bash
   curl -s https://api.auguriatarot.com/api/v1/health | jq .info.ai
   ```

2. **Pedirle a la API qué modelos habilita la cuenta** (no confiar en la doc del
   proveedor, que lista modelos que tu key puede no tener):

   ```bash
   curl -s -H "Authorization: Bearer $GROQ_API_KEY" \
     https://api.groq.com/openai/v1/models | jq -r '.data[].id'

   curl -s -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
     https://api.deepseek.com/models | jq -r '.data[].id'
   ```

3. **Probar el candidato con el prompt real** antes de adoptarlo: verificar que
   el JSON siga parseando, que el español rioplatense se mantenga y medir
   tokens y latencia. Los modelos de razonamiento (gpt-oss, deepseek-v4)
   cambian ambos números de forma drástica.

4. **Leer los límites de los headers de la respuesta**, no de la documentación:

   ```bash
   curl -s -D - -o /dev/null -X POST https://api.groq.com/openai/v1/chat/completions \
     -H "Authorization: Bearer $GROQ_API_KEY" -H "Content-Type: application/json" \
     -d '{"model":"openai/gpt-oss-120b","max_tokens":10,"messages":[{"role":"user","content":"hola"}]}' \
     | grep -i x-ratelimit
   ```

   El reset es proporcional a lo consumido, así que sirve para deducir la
   ventana: 3 requests con `reset-requests: 4m19.2s` ⇒ 3/1000 × 86400s ⇒ el
   límite es de 1.000 requests **por día**.

5. **Cambiar la variable de entorno en Railway y reiniciar.** El backfill de
   `onApplicationBootstrap` regenera los horóscopos del día en curso al
   arrancar, así que no hace falta esperar al cron de la madrugada.

6. **Actualizar el default en el código** (`env.validation.ts` y el
   `DEFAULT_MODEL` del provider) para que un entorno sin la variable no vuelva
   a apuntar a un modelo muerto.

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
    "model": "openai/gpt-oss-120b",
    "responseTime": 150,
    "rateLimits": {
      "remaining": 997,
      "limit": 1000,
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

- **Groq:** 10s — con `reasoning_effort: 'low'` responde en ~2s.
- **DeepSeek:** 25s — medido 14–17,6s por tirada con el modo pensante apagado.
  El techo NO lo fija el provider sino el axios del frontend, que aborta a los
  30s: un timeout más largo solo consigue que el backend siga generando una
  lectura que el usuario ya vio fallar (y que igual se le descontó del límite
  diario). Con el modo pensante encendido la generación trepa a 18–32s y no
  entra en ese presupuesto.
- **OpenAI:** 30s (puede ser más lento en horario pico).

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

**Last Updated:** December 2025  
**Maintained By:** Development Team
