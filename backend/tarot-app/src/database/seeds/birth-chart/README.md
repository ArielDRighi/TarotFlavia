# Seed Data - Módulo Carta Astral

Este directorio contiene los datos de interpretaciones astrológicas para poblar la tabla `birth_chart_interpretations`.

## Archivos

| Archivo                  | Contenido                      | Registros |
| ------------------------ | ------------------------------ | --------- |
| 01-planet-intros.md      | Introducciones de cada planeta | 10        |
| 02-planets-in-signs.md   | Planetas en signos zodiacales  | 120       |
| 03-planets-in-houses.md  | Planetas en casas astrológicas | 120       |
| 04-ascendant-in-signs.md | Ascendente en signos           | 12        |
| 05-aspects.md            | Aspectos entre planetas        | 225       |
| 06-sign-descriptions.md  | Descripciones de signos (UI)   | 12        |

## Formato de Datos

Cada archivo contiene un bloque JSON con el formato requerido para el seeder.

## Instrucciones para Crear Seeders

1. Leer cada archivo .md de este directorio
2. Extraer el JSON de cada archivo
3. Crear/actualizar el seeder en `src/modules/birth-chart/infrastructure/seeders/`
4. El seeder debe usar upsert para evitar duplicados (clave: `targetKey`)

## Estructura de la Tabla

```sql
CREATE TABLE birth_chart_interpretations (
  id SERIAL PRIMARY KEY,
  interpretation_type VARCHAR(50) NOT NULL,  -- 'planet_intro', 'planet_in_sign', etc.
  target_key VARCHAR(100) NOT NULL UNIQUE,   -- 'planet_in_sign:sun:aries'
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
