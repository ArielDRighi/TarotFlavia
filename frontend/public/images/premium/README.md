# Assets del Circuito Premium (T-PREM-004)

Set de imágenes de marca para el circuito premium, coherente con el canon visual
(violeta/índigo + dorado, atmósfera etérea, `no text`). Generadas con los prompts de
`docs/BACKLOG_PREMIUM_REDISENO_2026_07.md` → **PREM-004** y optimizadas a **WebP**
(calidad ~80, sin metadata) según `frontend/docs/IMAGE_OPTIMIZATION.md`.

## Inventario

| Archivo | Ratio | Dimensiones | Uso previsto | `alt` en español |
|---------|-------|-------------|--------------|------------------|
| `premium-hero.webp` | 21:9 | 1920×815 | Banda de bienvenida / cabecera de `/premium` (T-PREM-002) | `Llave dorada abriendo una carta de tarot con geometría sagrada, bajo un cielo nocturno violeta con luna creciente y estrellas` |
| `premium-crown.webp` | 1:1 | 1080×1080 | Acento de la sección de garantía / "Sin compromiso" (T-PREM-002) | `Corona dorada flotando sobre una mano de polvo de estrellas, en un cielo nocturno violeta con luna creciente` |
| `premium-activacion.webp` | 16:9 | 1600×893 | Estado de éxito de la activación premium (T-PREM-003) | `Mandala dorado de luz floreciendo entre estrellas, en un cielo nocturno violeta con luna creciente` |

> Si una imagen se usa de forma puramente decorativa (junto a texto que ya comunica lo mismo),
> preferir `alt=""` + `aria-hidden="true"` en lugar del `alt` descriptivo de la tabla.

## Fallback a gradiente (obligatorio)

Estas imágenes son **decorativas**: la banda mística debe seguir siendo legible y de marca
aunque el asset no cargue. Los consumidores (T-PREM-002/003) deben garantizar un **gradiente
violeta/índigo de fondo** por debajo de la imagen, de modo que un fallo de carga degrade con
elegancia al gradiente sin romper el contraste del texto superpuesto. Reutilizar el patrón del
canon (`DashboardHero` / `ArticleHero`), que ya monta la imagen sobre un fondo con gradiente.

## Regeneración

Ver los prompts exactos y la fórmula del canon en
`docs/BACKLOG_PREMIUM_REDISENO_2026_07.md` (sección PREM-004). Optimización:

```bash
# calidad ~80, sin metadata; ancho máximo alineado al canon (~1920 para banda 21:9)
magick origen.png -resize 1920x -strip -quality 80 -define webp:method=6 premium-hero.webp
```
