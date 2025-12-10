# TarotFlavia - Plan de Negocios: Costos de IA y Estrategia de Pricing

> 📊 **Documento de Análisis Financiero**  
> Fecha: 9 de Diciembre 2025  
> Versión: 1.0

---

## 📋 Resumen Ejecutivo

Este documento presenta el análisis de costos de inteligencia artificial para Tarot, incluyendo la estrategia de precios y el punto de equilibrio para sostener usuarios gratuitos con usuarios premium.

### Propuesta de Planes

| Plan        | Precio     | Lecturas Incluidas                        |
| ----------- | ---------- | ----------------------------------------- |
| **Free**    | $0/mes     | 1 tirada personal/día + Tirada del Día    |
| **Premium** | $4 USD/mes | 3 tiradas personales/día + Tirada del Día |

---

## 🎴 Definición de Productos

### Tirada del Día (Gratuita para todos)

- Una carta diaria con mensaje general
- Disponible para TODOS los usuarios (free y premium)
- Costo de IA: mínimo (se puede cachear para todos los usuarios)
- **Costo estimado: ~$0** (se genera una vez y se muestra a todos)

### Tiradas Personales (Consumo de IA)

- Tiradas de 1, 3, 5 o más cartas
- Interpretación personalizada basada en la pregunta del usuario
- **Cada tirada consume tokens de IA**

---

## 💰 Análisis de Costos de IA

### Parámetros Base

- **Tokens por lectura:** ~3,500 tokens (1,000 input + 2,500 output)
- **Días por mes:** 30

### Proveedor Recomendado: DeepSeek V3

| Concepto | Precio            |
| -------- | ----------------- |
| Input    | $0.07 / 1M tokens |
| Output   | $0.27 / 1M tokens |

_Nota: GPT-4o-mini cuesta aproximadamente el doble. DeepSeek ofrece calidad similar a menor costo._

---

## 📊 Escenario: 1,000 Usuarios Free

### Cálculo de Consumo

```
Usuarios Free:        1,000
Tiradas/día/usuario:  1
Días/mes:             30
Total lecturas/mes:   1,000 × 1 × 30 = 30,000 lecturas
```

### Cálculo de Tokens

```
Tokens por lectura:   3,500 (1,000 input + 2,500 output)
Total tokens/mes:     30,000 × 3,500 = 105,000,000 tokens (105M)

Desglose:
- Input tokens:       30,000 × 1,000 = 30M tokens
- Output tokens:      30,000 × 2,500 = 75M tokens
```

### Costo Mensual de IA (DeepSeek V3)

```
Input:   30M tokens × $0.00007  = $2.10
Output:  75M tokens × $0.00027  = $20.25
─────────────────────────────────────────
Total:                           $22.35 USD/mes
```

### Costo con Impuestos Argentina

Los servicios digitales internacionales en Argentina tienen los siguientes impuestos:

- **IVA Digital:** 21%
- **Impuesto PAIS:** 30% (sobre servicios digitales)
- **Percepción Ganancias:** 45%

**Factor total aproximado: 1.96x** (el costo se duplica aproximadamente)

```
Costo base:           $22.35 USD
Con impuestos AR:     $22.35 × 1.96 = $43.81 USD/mes
```

> ⚠️ **Nota:** Si se factura desde una empresa argentina con cuenta en el exterior, algunos impuestos pueden no aplicar. Consultar con contador.

---

## 💎 Análisis de Usuarios Premium

### Consumo por Usuario Premium

```
Tiradas/día/usuario:  3
Días/mes:             30
Lecturas/mes:         3 × 30 = 90 lecturas

Tokens/mes:           90 × 3,500 = 315,000 tokens

Costo por usuario premium/mes (DeepSeek):
- Input:   90K × $0.00007 = $0.0063
- Output:  225K × $0.00027 = $0.0608
- Total:   $0.067 USD/mes por usuario premium
- Con impuestos AR: $0.13 USD/mes
```

### Ingreso por Usuario Premium

```
Precio suscripción:   $4.00 USD/mes
Comisiones pago:      -15% (MercadoPago/Stripe ~3-4% + IVA)
Neto:                 $3.40 USD/mes

Costo IA por premium: -$0.13 USD/mes
─────────────────────────────────────
Ganancia neta:        $3.27 USD/mes por usuario premium
```

---

## ⚖️ Punto de Equilibrio (Break-Even)

### ¿Cuántos premium necesito para 1,000 free?

```
Costo mensual 1,000 free:    $43.81 USD (con impuestos)
Ganancia por premium:         $3.27 USD

Premium necesarios:          $43.81 ÷ $3.27 = 13.4 usuarios

Redondeando: 14 usuarios premium
```

### Tabla de Break-Even por Cantidad de Usuarios Free

| Usuarios Free | Costo IA/mes | Premium Necesarios |
| ------------- | ------------ | ------------------ |
| 500           | $21.90       | 7                  |
| 1,000         | $43.81       | 14                 |
| 2,000         | $87.62       | 27                 |
| 5,000         | $219.05      | 67                 |
| 10,000        | $438.10      | 134                |

---

## 📈 Proyección de Rentabilidad

### Escenario Conservador (1% conversión)

```
Usuarios totales:     1,000
Conversión a premium: 1% = 10 usuarios
Ingresos premium:     10 × $3.40 = $34.00 USD
Costo IA free:        $43.81 USD
─────────────────────────────────────────────
Resultado:            -$9.81 USD/mes (pérdida)
```

### Escenario Moderado (3% conversión)

```
Usuarios totales:     1,000
Conversión a premium: 3% = 30 usuarios
Ingresos premium:     30 × $3.40 = $102.00 USD
Costo IA free:        $43.81 USD
─────────────────────────────────────────────
Resultado:            +$58.19 USD/mes (ganancia)
```

### Escenario Optimista (5% conversión)

```
Usuarios totales:     1,000
Conversión a premium: 5% = 50 usuarios
Ingresos premium:     50 × $3.40 = $170.00 USD
Costo IA free:        $43.81 USD
─────────────────────────────────────────────
Resultado:            +$126.19 USD/mes (ganancia)
```

---

## 💵 Análisis del Precio de $4 USD/mes

### Comparación con Mercado

| Plataforma             | Precio        | Oferta                     |
| ---------------------- | ------------- | -------------------------- |
| Co-Star (astrología)   | $2.99/mes     | Lecturas premium           |
| Sanctuary (astrología) | $4.99/mes     | Lecturas ilimitadas        |
| Tarot.com              | $6.99/mes     | Lecturas premium           |
| Pattern (astrología)   | $9.99/mes     | Premium completo           |
| **TarotFlavia**        | **$4.00/mes** | **3 tiradas/día + diaria** |

### Evaluación

✅ **$4 USD/mes es un precio competitivo y adecuado:**

- **Margen saludable:** $3.27 de ganancia por usuario (81.75% margen)
- **Punto de entrada bajo:** Accesible para mercado latinoamericano
- **Valor percibido:** 90 lecturas personalizadas/mes = $0.044 por lectura
- **Competitivo:** Por debajo de la mayoría de apps de nicho similar

### Recomendación de Precios Alternativos

| Opción        | Precio            | Pros                | Contras |
| ------------- | ----------------- | ------------------- | ------- |
| $2.99/mes     | Más conversiones  | Margen bajo ($2.40) |
| **$4.00/mes** | **Balance ideal** | **Recomendado**     |
| $4.99/mes     | Mayor margen      | Menor conversión    |
| $6.99/mes     | Premium percibido | Barrera de entrada  |

**Veredicto: $4 USD/mes es correcto ✅**

---

## 🎯 Resumen de Límites por Plan

### Plan Free ($0/mes)

| Característica     | Límite      |
| ------------------ | ----------- |
| Tirada del Día     | ✅ Incluida |
| Tiradas personales | 1/día       |
| Tipos de tirada    | 1-3 cartas  |
| Historial          | Últimas 10  |
| Guardar favoritos  | ❌ No       |

### Plan Premium ($4 USD/mes)

| Característica           | Límite              |
| ------------------------ | ------------------- |
| Tirada del Día           | ✅ Incluida         |
| Tiradas personales       | 3/día               |
| Tipos de tirada          | Todas (1-10 cartas) |
| Historial                | Ilimitado           |
| Guardar favoritos        | ✅ Sí               |
| Regenerar interpretación | ✅ Sí               |
| Sin publicidad           | ✅ Sí               |

---

## 📋 Conclusiones y Recomendaciones

### 1. Viabilidad Financiera

✅ El modelo es **financieramente viable** con solo **1.4% de conversión** a premium.

### 2. Precio Adecuado

✅ **$4 USD/mes** ofrece un balance óptimo entre accesibilidad y margen.

### 3. Escalabilidad

✅ Los costos de IA **escalan linealmente** y el modelo se mantiene rentable incluso a gran escala.

### 4. Riesgo Bajo

✅ Con DeepSeek V3, el costo por usuario free es de solo **$0.044 USD/mes**, lo que minimiza el riesgo de usuarios free que nunca convierten.

### 5. Métricas Clave a Monitorear

- **Tasa de conversión:** Objetivo mínimo 1.4%
- **Retención premium:** Objetivo >70% mes a mes
- **Costo por lectura:** Actual $0.0015 USD (sin impuestos)

---

## 📊 Tabla Resumen Final

| Métrica                      | Valor                                            |
| ---------------------------- | ------------------------------------------------ |
| **Costo IA por lectura**     | $0.00074 USD                                     |
| **Costo IA 1,000 free/mes**  | $22.35 USD (sin imp.) / $43.81 USD (con imp. AR) |
| **Ganancia por premium**     | $3.27 USD/mes                                    |
| **Break-even 1,000 free**    | 14 usuarios premium                              |
| **Conversión mínima viable** | 1.4%                                             |
| **Precio recomendado**       | $4 USD/mes ✅                                    |

---

**Documento preparado para:** Propietario de TarotFlavia  
**Fecha:** 9 de Diciembre 2025  
**Autor:** Equipo de Desarrollo TarotFlavia

---

_Los cálculos están basados en precios de DeepSeek V3 a diciembre 2025. Los impuestos argentinos pueden variar según la estructura legal de facturación._
