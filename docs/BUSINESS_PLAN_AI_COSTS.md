# Auguria - Plan de Negocios: Costos de IA y Estrategia de Pricing

> 📊 **Documento de Análisis Financiero**  
> Fecha: 9 de Diciembre 2025  
> Versión: 1.0

---

## 📋 Resumen Ejecutivo

Este documento presenta el análisis de costos de inteligencia artificial para Tarot, incluyendo la estrategia de precios y el punto de equilibrio para sostener usuarios gratuitos con usuarios premium.

### Propuesta de Planes

| Plan        | Precio            | Lecturas Incluidas                        |
| ----------- | ----------------- | ----------------------------------------- |
| **Free**    | $0/mes            | 1 tirada personal/día + Tirada del Día    |
| **Premium** | **$4.99 USD/mes** | 3 tiradas personales/día + Tirada del Día |

---

## 🎴 Definición de Productos

### Tirada del Día (Gratuita para todos)

- **Una carta aleatoria diaria** con interpretación personalizada
- Disponible para TODOS los usuarios (free y premium)
- **Cada usuario recibe una carta diferente** (selección aleatoria)
- Interpretación breve generada por IA (~500 tokens output)
- **Costo estimado:** ~$0.00015 USD por usuario/día (con DeepSeek V3)

> 💡 **Nota técnica:** La tirada del día usa una interpretación más corta que las tiradas personales para optimizar costos, pero sigue siendo única para cada usuario.

### Tiradas Personales (Consumo de IA)

- Tiradas de 1, 3, 5 o más cartas
- Interpretación completa y personalizada basada en la pregunta del usuario
- **Cada tirada consume ~3,500 tokens de IA**

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
Usuarios Free:           1,000
─────────────────────────────────────────────────────────────
TIRADAS PERSONALES:
  Tiradas/día/usuario:   1
  Días/mes:              30
  Total lecturas/mes:    1,000 × 1 × 30 = 30,000 lecturas
  Tokens por lectura:    3,500 (1,000 input + 2,500 output)
  Tokens personales:     30,000 × 3,500 = 105M tokens

TIRADA DEL DÍA:
  Tiradas/día/usuario:   1 (todos los usuarios)
  Días/mes:              30
  Total tiradas/mes:     1,000 × 30 = 30,000 tiradas del día
  Tokens por tirada:     700 (200 input + 500 output)
  Tokens tirada día:     30,000 × 700 = 21M tokens

TOTAL TOKENS/MES:        105M + 21M = 126M tokens
```

### Costo Mensual de IA (DeepSeek V3)

```
TIRADAS PERSONALES:
  Input:   30M × $0.00007   = $2.10
  Output:  75M × $0.00027   = $20.25
  Subtotal:                   $22.35

TIRADA DEL DÍA:
  Input:   6M × $0.00007    = $0.42
  Output:  15M × $0.00027   = $4.05
  Subtotal:                   $4.47

─────────────────────────────────────────
TOTAL:                        $26.82 USD/mes
```

### Costo con Impuestos Argentina

Los servicios digitales internacionales en Argentina tienen los siguientes impuestos:

- **IVA Digital:** 21%
- **Impuesto PAIS:** 30% (sobre servicios digitales)
- **Percepción Ganancias:** 45%

**Factor total aproximado: 1.96x** (el costo se duplica aproximadamente)

```
Costo base:           $26.82 USD
Con impuestos AR:     $26.82 × 1.96 = $52.57 USD/mes
```

> ⚠️ **Nota:** Si se factura desde una empresa argentina con cuenta en el exterior, algunos impuestos pueden no aplicar. Consultar con contador.

---

## 💎 Análisis de Usuarios Premium

### Consumo por Usuario Premium

```
TIRADAS PERSONALES:
  Tiradas/día/usuario:  3
  Días/mes:             30
  Lecturas/mes:         3 × 30 = 90 lecturas
  Tokens:               90 × 3,500 = 315,000 tokens

TIRADA DEL DÍA:
  Tiradas/mes:          30
  Tokens:               30 × 700 = 21,000 tokens

TOTAL:                  336,000 tokens/mes

Costo por usuario premium/mes (DeepSeek):
- Input:   96K × $0.00007  = $0.0067
- Output:  240K × $0.00027 = $0.0648
- Total:   $0.072 USD/mes por usuario premium
- Con impuestos AR: $0.14 USD/mes
```

### Ingreso por Usuario Premium

```
Precio suscripción:   $4.99 USD/mes
Comisiones pago:      -15% (MercadoPago/Stripe ~3-4% + IVA)
Neto:                 $4.24 USD/mes

Costo IA por premium: -$0.14 USD/mes
─────────────────────────────────────
Ganancia neta:        $4.10 USD/mes por usuario premium
```

---

## ⚖️ Punto de Equilibrio (Break-Even)

### ¿Cuántos premium necesito para 1,000 free?

```
Costo mensual 1,000 free:    $52.57 USD (con impuestos)
Ganancia por premium:         $4.10 USD

Premium necesarios:          $52.57 ÷ $4.10 = 12.8 usuarios

Redondeando: 13 usuarios premium
```

### Tabla de Break-Even por Cantidad de Usuarios Free

| Usuarios Free | Costo IA/mes | Premium Necesarios |
| ------------- | ------------ | ------------------ |
| 500           | $26.29       | 7                  |
| 1,000         | $52.57       | 13                 |
| 2,000         | $105.14      | 26                 |
| 5,000         | $262.85      | 65                 |
| 10,000        | $525.70      | 129                |

---

## 📈 Proyección de Rentabilidad

### Escenario Conservador (1% conversión)

```
Usuarios totales:     1,000
Conversión a premium: 1% = 10 usuarios
Ingresos premium:     10 × $4.24 = $42.40 USD
Costo IA free:        $52.57 USD
─────────────────────────────────────────────
Resultado:            -$10.17 USD/mes (pérdida)
```

### Escenario Moderado (3% conversión)

```
Usuarios totales:     1,000
Conversión a premium: 3% = 30 usuarios
Ingresos premium:     30 × $4.24 = $127.20 USD
Costo IA free:        $52.57 USD
─────────────────────────────────────────────
Resultado:            +$74.63 USD/mes (ganancia)
```

### Escenario Optimista (5% conversión)

```
Usuarios totales:     1,000
Conversión a premium: 5% = 50 usuarios
Ingresos premium:     50 × $4.24 = $212.00 USD
Costo IA free:        $52.57 USD
─────────────────────────────────────────────
Resultado:            +$159.43 USD/mes (ganancia)
```

---

## 💵 Análisis y Recomendación de Precio Premium

### Comparación con Mercado

| Plataforma             | Precio        | Oferta                     | Mercado Principal |
| ---------------------- | ------------- | -------------------------- | ----------------- |
| Co-Star (astrología)   | $2.99/mes     | Lecturas premium           | USA/Europa        |
| Sanctuary (astrología) | $4.99/mes     | Lecturas ilimitadas        | USA               |
| Tarot.com              | $6.99/mes     | Lecturas premium           | USA/Global        |
| Pattern (astrología)   | $9.99/mes     | Premium completo           | USA               |
| **Auguria**            | **$4.99/mes** | **3 tiradas/día + diaria** | **LATAM**         |

### Análisis de Opciones de Precio

| Precio        | Margen Neto | Break-even (1000 free) | Ventajas                        | Desventajas                   |
| ------------- | ----------- | ---------------------- | ------------------------------- | ----------------------------- |
| $2.99/mes     | $2.40       | 22 usuarios            | Alta conversión esperada        | Margen muy bajo               |
| $3.99/mes     | $3.25       | 17 usuarios            | Accesible LATAM                 | Por debajo del mercado        |
| **$4.99/mes** | **$4.10**   | **13 usuarios**        | **Balance óptimo**              | -                             |
| $5.99/mes     | $4.95       | 11 usuarios            | Buen margen                     | Puede limitar conversiones    |
| $6.99/mes     | $5.80       | 10 usuarios            | Margen alto, percepción premium | Barrera de entrada alta LATAM |

### 🎯 Recomendación: $4.99 USD/mes

**¿Por qué $4.99 y no $4.00?**

1. **Margen competitivo:** $4.10 de ganancia vs $3.27 (+25% más margen)
2. **Punto psicológico:** $4.99 es un precio estándar en suscripciones digitales
3. **Alineado con mercado:** Igual que Sanctuary, por debajo de Tarot.com
4. **Break-even más bajo:** Solo 13 premium (vs 14 con $4.00)
5. **Valor percibido:** 120 lecturas/mes (90 personales + 30 diarias) = $0.041/lectura

### Evaluación Final

✅ **$4.99 USD/mes es el precio recomendado:**

- **Margen saludable:** $4.10 de ganancia por usuario (82.2% margen)
- **Competitivo:** Igual a Sanctuary, menor que Tarot.com y Pattern
- **Accesible LATAM:** ~$5,000 ARS/mes (precio razonable para el mercado)
- **Valor claro:** 4 tiradas diarias (3 personales + 1 del día)
- **Percepción premium:** No es "barato" pero tampoco inalcanzable

### Recomendación de Precios Alternativos

| Escenario         | Precio Recomendado | Cuándo Usar                             |
| ----------------- | ------------------ | --------------------------------------- |
| **Lanzamiento**   | **$4.99/mes**      | Precio estándar, equilibrado            |
| Promoción inicial | $2.99/mes          | Primeros 3 meses para captar usuarios   |
| Plan anual        | $39.99/año         | ~$3.33/mes - incentiva compromiso       |
| Mercado premium   | $6.99/mes          | Si la demanda valida el precio más alto |

**Veredicto: $4.99 USD/mes es el precio recomendado ✅**

---

## 🎯 Resumen de Límites por Plan

### Plan Free ($0/mes)

| Característica     | Límite                                 |
| ------------------ | -------------------------------------- |
| Tirada del Día     | ✅ Incluida (carta aleatoria personal) |
| Tiradas personales | 1/día                                  |
| Tipos de tirada    | 1-3 cartas                             |
| Historial          | Últimas 10                             |
| Guardar favoritos  | ❌ No                                  |

### Plan Premium ($4.99 USD/mes)

| Característica           | Límite                                 |
| ------------------------ | -------------------------------------- |
| Tirada del Día           | ✅ Incluida (carta aleatoria personal) |
| Tiradas personales       | 3/día                                  |
| Tipos de tirada          | Todas (1-10 cartas)                    |
| Historial                | Ilimitado                              |
| Guardar favoritos        | ✅ Sí                                  |
| Regenerar interpretación | ✅ Sí                                  |
| Sin publicidad           | ✅ Sí                                  |

---

## 📋 Conclusiones y Recomendaciones

### 1. Viabilidad Financiera

✅ El modelo es **financieramente viable** con solo **1.3% de conversión** a premium.

### 2. Precio Recomendado

✅ **$4.99 USD/mes** ofrece el mejor balance entre competitividad y margen.

### 3. Escalabilidad

✅ Los costos de IA **escalan linealmente** y el modelo se mantiene rentable incluso a gran escala.

### 4. Riesgo Bajo

✅ Con DeepSeek V3, el costo por usuario free es de solo **$0.053 USD/mes** (incluyendo tirada del día), lo que minimiza el riesgo de usuarios free que nunca convierten.

### 5. Métricas Clave a Monitorear

- **Tasa de conversión:** Objetivo mínimo 1.3%
- **Retención premium:** Objetivo >70% mes a mes
- **Costo por lectura:** Actual $0.00089 USD (sin impuestos)

---

## 📊 Tabla Resumen Final

| Métrica                           | Valor                                            |
| --------------------------------- | ------------------------------------------------ |
| **Costo IA por lectura personal** | $0.00074 USD                                     |
| **Costo IA tirada del día**       | $0.00015 USD                                     |
| **Costo IA 1,000 free/mes**       | $26.82 USD (sin imp.) / $52.57 USD (con imp. AR) |
| **Ganancia por premium**          | $4.10 USD/mes                                    |
| **Break-even 1,000 free**         | 13 usuarios premium                              |
| **Conversión mínima viable**      | 1.3%                                             |
| **Precio recomendado**            | $4.99 USD/mes ✅                                 |

---

**Documento preparado para:** Propietario de Auguria  
**Fecha:** 9 de Diciembre 2025  
**Autor:** Equipo de Desarrollo Auguria

---

_Los cálculos están basados en precios de DeepSeek V3 a diciembre 2025. Los impuestos argentinos pueden variar según la estructura legal de facturación._
