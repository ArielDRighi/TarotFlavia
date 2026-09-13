#!/usr/bin/env node
// @ts-check

/**
 * Post-proceso de iconos de marca - Auguria (T-UI-12, Fase 0)
 *
 * Toma los PNG que salen de Gemini (Nano Banana) —line-art dorado sobre fondo
 * blanco puro, 1024×1024— y los deja listos para `<BrandIcon>`:
 *
 *   1. Blanco → alfa (color-to-alpha): el fondo queda transparente y el brillo
 *      dorado conserva su suavidad sobre cualquier fondo.
 *   2. Trazo engrosado (~5 px sobre 2048) y dorado un 15 % más profundo: la
 *      línea del modelo es fina y a 48–72 px se lavaba (`--stroke`, `--tone`).
 *   3. Recorte al contenido y re-centrado, con margen del 8 % (configurable).
 *   4. Exporta WebP cuadrado de 512 px con alfa a `public/images/icons/<familia>/<slug>.webp`.
 *      Un solo tamaño a propósito: `next/image` ya genera las variantes de
 *      16–384 px (`imageSizes` en `next.config.ts`). El halo lleva color fijo
 *      (el dorado mediano del trazo) y alfa cuantizado: sin eso, el ruido del
 *      degradé duplica el peso.
 *   5. Escribe una hoja de contacto (`<in>/icons-contact-sheet.html`) con cada
 *      icono a 32/64/128 px sobre fondo claro y cósmico, para descartar los que
 *      no leen bien chicos, y avisa si alguno pasa los 48 KB (el máster; lo
 *      servido a 48–128 px pesa 1,5–6 KB).
 *
 * Entrada: `<in>/<familia>/<slug>.(png|jpg|jpeg|webp)`. La familia y el slug
 * tienen que coincidir con `src/lib/constants/brand-icons.ts`; el test de ese
 * registro verifica que cada familia presente en `public/` esté completa.
 *
 * Uso:
 *   node scripts/process-brand-icons.mjs                     # brand-icons-raw/ → public/images/icons/
 *   node scripts/process-brand-icons.mjs --family zodiac     # una sola familia
 *   node scripts/process-brand-icons.mjs --margin 0.1 --size 512 --max-kb 15
 *
 * Exit code 0 si procesó al menos un asset; 1 si no encontró ninguno o falló.
 */

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

// =============================================================================
// CONSTANTES
// =============================================================================

export const DEFAULTS = Object.freeze({
  /** Carpeta (gitignored) donde se descargan los PNG de Nano Banana. */
  inDir: 'brand-icons-raw',
  outDir: 'public/images/icons',
  /** Lado del WebP final. */
  size: 512,
  /** Margen alrededor del sujeto, como fracción del lado. */
  margin: 0.08,
  /**
   * Engrosado del trazo sólido, como fracción del lado de la imagen de entrada
   * (0,0025 × 2048 = 5 px). El modelo dibuja líneas de ~8 px sobre 2048: a
   * 48–72 px quedan en medio píxel y el antialiasing las lava. Se dilata la
   * máscara del trazo antes de reducir; a 0 se desactiva.
   */
  stroke: 0.0025,
  /**
   * Factor sobre el RGB del trazo (1 = tal cual). 0,85 acerca el dorado del
   * modelo (#CE9739 típico) al dorado profundo de la marca (#B7791F) y sube el
   * contraste sobre tarjeta crema/blanca sin cambiar el matiz.
   */
  tone: 0.85,
  /**
   * Peso máximo aconsejado para el máster de 512 px. Un halo ancho y suave es
   * un degradé de alfa grande y eso pesa 30–45 KB por más que se comprima; lo
   * que viaja al navegador es lo que sirve `next/image` (48–128 px → 1,5–6 KB).
   */
  maxBytes: 48 * 1024,
});

const RAW_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const CONTACT_SHEET_NAME = 'icons-contact-sheet.html';

/** Fondo cósmico de la línea de diseño, para probar los iconos sobre ilustración. */
const COSMIC_BACKGROUND = 'linear-gradient(160deg, #2D1B69, #1A0A2E)';

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * Píxeles con esta "distancia al blanco" o menos se consideran fondo: el blanco
 * de un JPEG es 248–255 y sin piso cada píxel del lienzo quedaría con alfa 1–7
 * (velo sobre cósmico + hasta 8× de peso). Mismo umbral que usa `trim`.
 */
const NOISE_FLOOR = 8;

/**
 * Píxeles con esta "distancia al blanco" o más son trazo sólido: conservan su
 * color y quedan opacos. Sin esto el dorado de marca (#D69E2E, alfa 82 %) se
 * compone ~18 % más oscuro y marrón sobre el fondo cósmico; con el color
 * original y opaco, sobre blanco da lo mismo y sobre violeta es el dorado real.
 * Sólo el brillo suave (por debajo) se des-premultiplica.
 */
const SOLID_ALPHA = Math.round(0.75 * 255);

/**
 * Paso de cuantización del alfa del halo. Un degradé con 256 niveles es ruido
 * para el codificador; con 32 niveles se ve igual y pesa bastante menos.
 */
const ALPHA_STEP = 8;

/** Parámetros WebP: probados a ojo sobre tarjeta y sobre cósmico a 128/400/512 px. */
const WEBP_OPTIONS = { quality: 75, alphaQuality: 60, effort: 6 };

const AYUDA = `
Post-proceso de iconos de marca (T-UI-12)

  node scripts/process-brand-icons.mjs [opciones]

Opciones:
  --in <dir>       Carpeta de entrada <in>/<familia>/<slug>.png   (default: ${DEFAULTS.inDir})
  --out <dir>      Carpeta de salida <out>/<familia>/<slug>.webp  (default: ${DEFAULTS.outDir})
  --family <slug>  Procesar sólo esa familia (zodiac, chinese, moon…)
  --size <px>      Lado del WebP final                            (default: ${DEFAULTS.size})
  --margin <0-1>   Margen alrededor del sujeto                    (default: ${DEFAULTS.margin})
  --stroke <0-0.02> Engrosado del trazo, fracción del lado        (default: ${DEFAULTS.stroke})
  --tone <0.5-1>   Factor de oscurecido del dorado                (default: ${DEFAULTS.tone})
  --max-kb <n>     Aviso si un asset pesa más                     (default: ${DEFAULTS.maxBytes / 1024})
  --help           Esta ayuda
`;

// =============================================================================
// PROCESAMIENTO DE PÍXELES
// =============================================================================

/**
 * Color mediano de los píxeles de trazo sólido (los que `whiteToAlpha` deja
 * opacos): el dorado real que usó el modelo en ese asset. `undefined` si la
 * imagen no tiene trazo sólido.
 *
 * @param {Buffer} data RGBA, 4 bytes por píxel.
 * @returns {[number, number, number] | undefined}
 */
export function solidColor(data) {
  /** @type {number[][]} */
  const channels = [[], [], []];
  for (let i = 0; i < data.length; i += 4) {
    if (255 - Math.min(data[i], data[i + 1], data[i + 2]) >= SOLID_ALPHA) {
      channels[0].push(data[i]);
      channels[1].push(data[i + 1]);
      channels[2].push(data[i + 2]);
    }
  }
  if (channels[0].length === 0) return undefined;
  const median = (/** @type {number[]} */ values) =>
    values.sort((a, b) => a - b)[values.length >> 1];
  return [median(channels[0]), median(channels[1]), median(channels[2])];
}

/**
 * Dilata el trazo sólido (píxeles opacos) `radius` px en cada dirección,
 * in-place: los píxeles nuevos toman `color` y alfa 255. Máximo separable en
 * ventana de (2·radius + 1): dos pasadas lineales sobre la máscara.
 *
 * @param {Buffer} data RGBA, 4 bytes por píxel. Se modifica y se devuelve.
 * @param {number} width
 * @param {number} height
 * @param {number} radius Píxeles; 0 no hace nada.
 * @param {[number, number, number]} color RGB para los píxeles agregados.
 * @returns {Buffer}
 */
export function growStrokes(data, width, height, radius, color) {
  if (radius <= 0) return data;
  const n = width * height;
  const mask = new Uint8Array(n);
  for (let p = 0; p < n; p += 1) mask[p] = data[p * 4 + 3] === 255 ? 1 : 0;

  const horizontal = new Uint8Array(n);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      let hit = 0;
      for (let k = Math.max(0, x - radius); k <= Math.min(width - 1, x + radius) && !hit; k += 1) {
        hit = mask[row + k];
      }
      horizontal[row + x] = hit;
    }
  }
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const p = y * width + x;
      if (mask[p]) continue;
      let hit = 0;
      for (let k = Math.max(0, y - radius); k <= Math.min(height - 1, y + radius) && !hit; k += 1) {
        hit = horizontal[k * width + x];
      }
      if (hit) {
        data[p * 4] = color[0];
        data[p * 4 + 1] = color[1];
        data[p * 4 + 2] = color[2];
        data[p * 4 + 3] = 255;
      }
    }
  }
  return data;
}

/**
 * Color-to-alpha para blanco, in-place sobre un buffer RGBA.
 *
 * Para cada píxel, el alfa nuevo es "cuánto se aleja del blanco"
 * (`255 - min(r,g,b)`), como "Color a alfa" de GIMP, con tres ajustes:
 *  - por debajo de `NOISE_FLOOR` es fondo → transparente (tolera JPEG);
 *  - desde `SOLID_ALPHA` es trazo → color original y opaco (dorado fiel sobre
 *    cualquier fondo);
 *  - en el medio (el brillo suave) el color se des-premultiplica para que,
 *    compuesto sobre blanco, devuelva el original. Si se pasa `glowColor`, el
 *    halo toma ese color fijo y el alfa se cuantiza a `ALPHA_STEP`: un halo es
 *    "dorado fundido sobre blanco", así que su color des-premultiplicado
 *    debería ser constante; lo que lo varía es el ruido, que des-premultiplicar
 *    con alfa bajo amplifica hasta duplicar el peso del WebP.
 *  - `tone` multiplica el RGB del trazo sólido (1 = sin cambio): sube el
 *    contraste del dorado sobre fondo claro conservando el matiz.
 *
 * @param {Buffer} data RGBA, 4 bytes por píxel. Se modifica y se devuelve.
 * @param {{ glowColor?: [number, number, number], tone?: number }} [options]
 * @returns {Buffer}
 */
export function whiteToAlpha(data, { glowColor, tone = 1 } = {}) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const prevAlpha = data[i + 3];

    const alpha = 255 - Math.min(r, g, b);
    if (alpha <= NOISE_FLOOR || prevAlpha === 0) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }

    if (alpha >= SOLID_ALPHA) {
      if (tone !== 1) {
        data[i] = clampByte(r * tone);
        data[i + 1] = clampByte(g * tone);
        data[i + 2] = clampByte(b * tone);
      }
      data[i + 3] = prevAlpha;
      continue;
    }

    if (glowColor) {
      data[i] = glowColor[0];
      data[i + 1] = glowColor[1];
      data[i + 2] = glowColor[2];
      data[i + 3] = clampByte((Math.round(alpha / ALPHA_STEP) * ALPHA_STEP * prevAlpha) / 255);
      continue;
    }

    // c' = 255 - (255 - c) * 255 / alpha, acotado a [0, 255]
    data[i] = clampByte(255 - ((255 - r) * 255) / alpha);
    data[i + 1] = clampByte(255 - ((255 - g) * 255) / alpha);
    data[i + 2] = clampByte(255 - ((255 - b) * 255) / alpha);
    data[i + 3] = clampByte((alpha * prevAlpha) / 255);
  }
  return data;
}

/** @param {number} n */
function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/**
 * Procesa un asset crudo (buffer o ruta) y devuelve el WebP final.
 *
 * @param {Buffer | string} input
 * @param {{ size?: number, margin?: number, stroke?: number, tone?: number }} [options]
 * @returns {Promise<Buffer>}
 */
export async function processIcon(
  input,
  {
    size = DEFAULTS.size,
    margin = DEFAULTS.margin,
    stroke = DEFAULTS.stroke,
    tone = DEFAULTS.tone,
  } = {}
) {
  // 1. Blanco → alfa sobre los píxeles crudos; el halo y el engrosado toman el
  //    dorado del trazo ya entonado.
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const gold = solidColor(data);
  const toned = gold
    ? /** @type {[number, number, number]} */ (gold.map((c) => clampByte(c * tone)))
    : undefined;
  const rgba = whiteToAlpha(data, { glowColor: toned, tone });
  if (toned) {
    growStrokes(
      rgba,
      info.width,
      info.height,
      Math.round(Math.max(info.width, info.height) * stroke),
      toned
    );
  }

  // 2. Recorte al contenido (todo lo que no sea transparente).
  const trimmed = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
  const { data: cropped, info: croppedInfo } = await sharp(trimmed)
    .trim({ background: TRANSPARENT, threshold: 8 })
    .toBuffer({ resolveWithObject: true });

  // 3. Lienzo cuadrado con margen, sujeto centrado, escala al tamaño final.
  const side = Math.max(croppedInfo.width, croppedInfo.height);
  const marginPx = Math.round(side * margin);
  const canvas = side + marginPx * 2;

  return sharp({
    create: { width: canvas, height: canvas, channels: 4, background: TRANSPARENT },
  })
    .composite([{ input: cropped, gravity: 'centre' }])
    .png()
    .toBuffer()
    .then((buf) =>
      sharp(buf)
        .resize(size, size, { fit: 'contain', background: TRANSPARENT })
        .webp(WEBP_OPTIONS)
        .toBuffer()
    );
}

// =============================================================================
// ENTRADA / SALIDA
// =============================================================================

/**
 * Lista los assets crudos como `{ family, slug, file }`.
 *
 * @param {string} inDir
 * @param {{ family?: string }} [options]
 * @returns {Promise<Array<{ family: string, slug: string, file: string }>>}
 */
export async function listRawIcons(inDir, { family } = {}) {
  /** @type {Array<{ family: string, slug: string, file: string }>} */
  const icons = [];
  let families;
  try {
    families = await readdir(inDir, { withFileTypes: true });
  } catch {
    return icons;
  }

  for (const dir of families) {
    if (!dir.isDirectory() || (family && dir.name !== family)) continue;
    const files = await readdir(path.join(inDir, dir.name), { withFileTypes: true });
    for (const f of files) {
      const ext = path.extname(f.name).toLowerCase();
      if (!f.isFile() || !RAW_EXTENSIONS.has(ext)) continue;
      icons.push({
        family: dir.name,
        slug: path.basename(f.name, path.extname(f.name)),
        file: path.join(inDir, dir.name, f.name),
      });
    }
  }

  return icons.sort((a, b) => `${a.family}/${a.slug}`.localeCompare(`${b.family}/${b.slug}`));
}

/**
 * Hoja de contacto: cada icono a 32/64/128 px sobre fondo claro y cósmico.
 *
 * @param {Array<{ family: string, slug: string, src: string, bytes: number }>} icons
 * @param {{ maxBytes?: number }} [options]
 * @returns {string}
 */
export function renderContactSheet(icons, { maxBytes = DEFAULTS.maxBytes } = {}) {
  const rows = icons
    .map(({ family, slug, src, bytes }) => {
      const kb = `${Math.round(bytes / 1024)} KB`;
      const heavy = bytes > maxBytes ? ' <strong class="heavy">pesado</strong>' : '';
      const imgs = [32, 64, 128]
        .map((w) => `<img src="${src}" width="${w}" height="${w}" alt="${family}/${slug} ${w}px">`)
        .join('');
      return `<tr>
  <th>${family}/${slug}<br><small>${kb}${heavy}</small></th>
  <td class="light">${imgs}</td>
  <td class="cosmic">${imgs}</td>
</tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Iconos de marca — hoja de contacto</title>
<style>
  body { font: 14px system-ui, sans-serif; margin: 24px; background: #F9F7F2; color: #2D1B69; }
  table { border-collapse: collapse; }
  th, td { padding: 12px 16px; border: 1px solid #ddd; vertical-align: middle; }
  th { text-align: left; font-weight: 600; }
  td img { margin-right: 16px; vertical-align: middle; }
  td.light { background: #FFFFFF; }
  td.cosmic { background: ${COSMIC_BACKGROUND}; }
  .heavy { color: #b91c1c; }
</style>
</head>
<body>
<h1>Iconos de marca (${icons.length})</h1>
<p>Descartar los que no lean bien a 32 px. Límite aconsejado: ${Math.round(maxBytes / 1024)} KB.</p>
<table>
<thead><tr><th>Asset</th><th>Sobre tarjeta</th><th>Sobre cósmico</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>
`;
}

// =============================================================================
// CLI
// =============================================================================

/**
 * @param {string[]} argv
 */
export function parseArgs(argv = []) {
  /** @type {{ inDir: string, outDir: string, size: number, margin: number, stroke: number, tone: number, maxBytes: number, family: string | undefined, help: boolean }} */
  const opciones = {
    inDir: DEFAULTS.inDir,
    outDir: DEFAULTS.outDir,
    size: DEFAULTS.size,
    margin: DEFAULTS.margin,
    stroke: DEFAULTS.stroke,
    tone: DEFAULTS.tone,
    maxBytes: DEFAULTS.maxBytes,
    family: undefined,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (argv[i] === undefined) throw new Error(`Falta el valor de ${arg}`);
      return argv[i];
    };

    switch (arg) {
      case '--in':
        opciones.inDir = next();
        break;
      case '--out':
        opciones.outDir = next();
        break;
      case '--family':
        opciones.family = next();
        break;
      case '--size': {
        const size = Number(next());
        if (!Number.isInteger(size) || size <= 0) throw new Error('--size debe ser un entero > 0');
        opciones.size = size;
        break;
      }
      case '--margin': {
        const margin = Number(next());
        if (!Number.isFinite(margin) || margin < 0 || margin >= 0.5) {
          throw new Error('--margin debe estar entre 0 y 0.5');
        }
        opciones.margin = margin;
        break;
      }
      case '--stroke': {
        const stroke = Number(next());
        if (!Number.isFinite(stroke) || stroke < 0 || stroke > 0.02) {
          throw new Error('--stroke debe estar entre 0 y 0.02');
        }
        opciones.stroke = stroke;
        break;
      }
      case '--tone': {
        const tone = Number(next());
        if (!Number.isFinite(tone) || tone < 0.5 || tone > 1) {
          throw new Error('--tone debe estar entre 0.5 y 1');
        }
        opciones.tone = tone;
        break;
      }
      case '--max-kb': {
        const kb = Number(next());
        if (!Number.isFinite(kb) || kb <= 0) throw new Error('--max-kb debe ser un número > 0');
        opciones.maxBytes = kb * 1024;
        break;
      }
      case '--help':
      case '-h':
        opciones.help = true;
        break;
      default:
        throw new Error(`Opción desconocida: ${arg}`);
    }
  }

  return opciones;
}

/**
 * @param {{ inDir: string, outDir: string, size: number, margin: number, stroke?: number, tone?: number, maxBytes?: number, family?: string }} opciones
 * @param {{ log?: (msg: string) => void }} [deps]
 */
export async function run(opciones, { log = console.log } = {}) {
  const {
    inDir,
    outDir,
    size,
    margin,
    stroke = DEFAULTS.stroke,
    tone = DEFAULTS.tone,
    family,
    maxBytes = DEFAULTS.maxBytes,
  } = opciones;
  const icons = await listRawIcons(inDir, { family });

  if (icons.length === 0) {
    log(`❌ No hay assets en ${inDir}/<familia>/<slug>.png${family ? ` (familia ${family})` : ''}`);
    return { processed: [], warnings: [], exitCode: 1 };
  }

  /** @type {Array<{ family: string, slug: string, src: string, bytes: number }>} */
  const processed = [];
  /** @type {string[]} */
  const warnings = [];

  for (const icon of icons) {
    const webp = await processIcon(icon.file, { size, margin, stroke, tone });
    const outFile = path.join(outDir, icon.family, `${icon.slug}.webp`);
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, webp);
    const { size: bytes } = await stat(outFile);

    const id = `${icon.family}/${icon.slug}`;
    processed.push({
      family: icon.family,
      slug: icon.slug,
      src: path.relative(inDir, outFile).split(path.sep).join('/'),
      bytes,
    });
    if (bytes > maxBytes) {
      warnings.push(
        `${id}: ${Math.round(bytes / 1024)} KB supera los ${Math.round(maxBytes / 1024)} KB`
      );
    }
    log(`✔ ${id} → ${outFile} (${Math.round(bytes / 1024)} KB)`);
  }

  const sheet = path.join(inDir, CONTACT_SHEET_NAME);
  await writeFile(sheet, renderContactSheet(processed, { maxBytes }));
  log(`\n${processed.length} iconos procesados. Hoja de contacto: ${sheet}`);
  for (const w of warnings) log(`⚠ ${w}`);

  return { processed, warnings, exitCode: 0 };
}

async function main() {
  try {
    const opciones = parseArgs(process.argv.slice(2));

    if (opciones.help) {
      console.log(AYUDA);
      return;
    }

    const { exitCode } = await run(opciones);
    process.exitCode = exitCode;
  } catch (error) {
    console.error(`\n❌ ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
