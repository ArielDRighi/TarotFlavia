import { mkdtemp, mkdir, rm, writeFile, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import {
  DEFAULTS,
  parseArgs,
  whiteToAlpha,
  listRawIcons,
  processIcon,
  renderContactSheet,
  run,
} from './process-brand-icons.mjs';

// =============================================================================
// HELPERS DE TEST
// =============================================================================

const GOLD = { r: 214, g: 158, b: 46 };

/**
 * PNG sintético "como sale de Nano Banana": fondo blanco puro y un cuadrado
 * dorado DESCENTRADO (arriba a la izquierda), para verificar el recorte.
 */
async function goldSquareOnWhite({ size = 200, square = 60, offset = 20 } = {}) {
  const subject = await sharp({
    create: { width: square, height: square, channels: 3, background: GOLD },
  })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 3, background: '#ffffff' },
  })
    .composite([{ input: subject, left: offset, top: offset }])
    .png()
    .toBuffer();
}

/** Lee un píxel RGBA de una imagen. */
async function pixelAt(buffer, x, y) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
}

// =============================================================================
// whiteToAlpha
// =============================================================================

describe('whiteToAlpha (color-to-alpha para blanco)', () => {
  it('vuelve transparente el blanco puro', () => {
    const px = whiteToAlpha(Buffer.from([255, 255, 255, 255]));
    expect(px[3]).toBe(0);
  });

  it('deja intacto el negro opaco', () => {
    const px = whiteToAlpha(Buffer.from([0, 0, 0, 255]));
    expect([...px]).toEqual([0, 0, 0, 255]);
  });

  it('al dorado le da alfa parcial y un color que compuesto sobre blanco devuelve el original', () => {
    const px = whiteToAlpha(Buffer.from([GOLD.r, GOLD.g, GOLD.b, 255]));
    const a = px[3] / 255;
    expect(px[3]).toBe(255 - Math.min(GOLD.r, GOLD.g, GOLD.b));
    // composición "source over" sobre blanco
    const over = (c) => Math.round(c * a + 255 * (1 - a));
    expect(over(px[0])).toBeCloseTo(GOLD.r, -0.5);
    expect(over(px[1])).toBeCloseTo(GOLD.g, -0.5);
    expect(over(px[2])).toBeCloseTo(GOLD.b, -0.5);
  });

  it('respeta el alfa previo (multiplica, no lo pisa)', () => {
    const px = whiteToAlpha(Buffer.from([0, 0, 0, 128]));
    expect(px[3]).toBe(128);
    const transparent = whiteToAlpha(Buffer.from([0, 0, 0, 0]));
    expect(transparent[3]).toBe(0);
  });

  it('procesa varios píxeles en el mismo buffer', () => {
    const px = whiteToAlpha(Buffer.from([255, 255, 255, 255, 0, 0, 0, 255]));
    expect(px[3]).toBe(0);
    expect(px[7]).toBe(255);
  });
});

// =============================================================================
// processIcon
// =============================================================================

describe('processIcon', () => {
  it('quita el fondo blanco, recorta al sujeto, lo centra con margen y exporta WebP cuadrado', async () => {
    const input = await goldSquareOnWhite();
    const out = await processIcon(input, { size: 64, margin: 0.1 });

    const meta = await sharp(out).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(64);
    expect(meta.height).toBe(64);
    expect(meta.hasAlpha).toBe(true);

    // Esquinas: el margen es transparente.
    expect((await pixelAt(out, 0, 0)).a).toBe(0);
    expect((await pixelAt(out, 63, 63)).a).toBe(0);

    // Centro: el cuadrado (que en el original estaba descentrado) ahora está en el medio.
    const center = await pixelAt(out, 32, 32);
    expect(center.a).toBeGreaterThan(150);

    // Y llega hasta cerca del borde menos el margen: ~10 % de 64 ≈ 6 px.
    expect((await pixelAt(out, 8, 32)).a).toBeGreaterThan(150);
    // (WebP con alfa con pérdida: tolera un residuo mínimo en el margen.)
    expect((await pixelAt(out, 3, 32)).a).toBeLessThan(16);
  });

  it('usa el tamaño y margen por defecto', async () => {
    const input = await goldSquareOnWhite({ size: 64, square: 32, offset: 0 });
    const out = await processIcon(input);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(DEFAULTS.size);
    expect(meta.height).toBe(DEFAULTS.size);
  });
});

// =============================================================================
// listRawIcons + parseArgs + renderContactSheet
// =============================================================================

describe('listRawIcons', () => {
  let dir;

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'brand-icons-'));
    await mkdir(path.join(dir, 'zodiac'), { recursive: true });
    await mkdir(path.join(dir, 'chinese'), { recursive: true });
    await writeFile(path.join(dir, 'zodiac', 'aries.png'), '');
    await writeFile(path.join(dir, 'zodiac', 'taurus.PNG'), '');
    await writeFile(path.join(dir, 'zodiac', 'notas.txt'), '');
    await writeFile(path.join(dir, 'chinese', 'dragon.jpeg'), '');
    await writeFile(path.join(dir, 'suelto.png'), '');
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('lista <familia>/<slug>.<png|jpg|jpeg|webp> e ignora el resto', async () => {
    const icons = await listRawIcons(dir);
    expect(icons.map((i) => `${i.family}/${i.slug}`).sort()).toEqual([
      'chinese/dragon',
      'zodiac/aries',
      'zodiac/taurus',
    ]);
    expect(icons.find((i) => i.slug === 'aries').file).toBe(path.join(dir, 'zodiac', 'aries.png'));
  });

  it('filtra por familia', async () => {
    const icons = await listRawIcons(dir, { family: 'chinese' });
    expect(icons.map((i) => i.slug)).toEqual(['dragon']);
  });

  it('devuelve vacío si el directorio no existe', async () => {
    expect(await listRawIcons(path.join(dir, 'no-existe'))).toEqual([]);
  });
});

describe('parseArgs', () => {
  it('aplica los valores por defecto', () => {
    const o = parseArgs([]);
    expect(o).toMatchObject({
      inDir: DEFAULTS.inDir,
      outDir: DEFAULTS.outDir,
      size: DEFAULTS.size,
      margin: DEFAULTS.margin,
      maxBytes: DEFAULTS.maxBytes,
      family: undefined,
      help: false,
    });
  });

  it('lee --in, --out, --size, --margin, --family, --max-kb y --help', () => {
    const o = parseArgs([
      '--in',
      'raw',
      '--out',
      'out',
      '--size',
      '256',
      '--margin',
      '0.1',
      '--family',
      'moon',
      '--max-kb',
      '20',
      '--help',
    ]);
    expect(o).toMatchObject({
      inDir: 'raw',
      outDir: 'out',
      size: 256,
      margin: 0.1,
      family: 'moon',
      maxBytes: 20 * 1024,
      help: true,
    });
  });

  it('rechaza valores inválidos', () => {
    expect(() => parseArgs(['--size', 'grande'])).toThrow(/--size/);
    expect(() => parseArgs(['--margin', '2'])).toThrow(/--margin/);
    expect(() => parseArgs(['--desconocido'])).toThrow(/--desconocido/);
  });
});

describe('renderContactSheet', () => {
  it('muestra cada icono a 32/64/128 px sobre fondo claro y cósmico, con su peso', () => {
    const html = renderContactSheet([
      {
        family: 'zodiac',
        slug: 'aries',
        src: '../public/images/icons/zodiac/aries.webp',
        bytes: 9000,
      },
    ]);
    expect(html).toContain('zodiac/aries.webp');
    expect(html).toContain('aries');
    expect(html).toContain('9 KB');
    expect(html).toMatch(/width="32"/);
    expect(html).toMatch(/width="64"/);
    expect(html).toMatch(/width="128"/);
    expect(html).toContain('#2D1B69');
  });

  it('marca los que superan el límite de peso', () => {
    const html = renderContactSheet(
      [{ family: 'moon', slug: 'full_moon', src: 'x.webp', bytes: 40 * 1024 }],
      { maxBytes: 15 * 1024 }
    );
    expect(html).toContain('pesado');
  });
});

// =============================================================================
// run (punta a punta sobre un directorio temporal)
// =============================================================================

describe('run', () => {
  let root;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'brand-icons-run-'));
    await mkdir(path.join(root, 'raw', 'zodiac'), { recursive: true });
    await writeFile(path.join(root, 'raw', 'zodiac', 'aries.png'), await goldSquareOnWhite());
    await writeFile(
      path.join(root, 'raw', 'zodiac', 'taurus.png'),
      await goldSquareOnWhite({ offset: 100 })
    );
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('procesa cada asset a <out>/<familia>/<slug>.webp y escribe la hoja de contacto', async () => {
    const logs = [];
    const result = await run(
      { inDir: path.join(root, 'raw'), outDir: path.join(root, 'out'), size: 64, margin: 0.08 },
      { log: (m) => logs.push(m) }
    );

    expect(result.exitCode).toBe(0);
    expect(result.processed).toHaveLength(2);
    expect((await readdir(path.join(root, 'out', 'zodiac'))).sort()).toEqual([
      'aries.webp',
      'taurus.webp',
    ]);
    const sheet = await readFile(path.join(root, 'raw', 'icons-contact-sheet.html'), 'utf8');
    expect(sheet).toContain('zodiac/aries.webp');
    expect(logs.join('\n')).toContain('zodiac/aries');
  });

  it('avisa (sin fallar) cuando un asset supera el peso máximo', async () => {
    const result = await run(
      {
        inDir: path.join(root, 'raw'),
        outDir: path.join(root, 'out'),
        size: 64,
        margin: 0.08,
        maxBytes: 10,
      },
      { log: () => {} }
    );
    expect(result.exitCode).toBe(0);
    expect(result.warnings.length).toBe(2);
    expect(result.warnings[0]).toMatch(/zodiac\/aries/);
  });

  it('falla con exit code 1 si no hay assets en el directorio de entrada', async () => {
    const result = await run(
      { inDir: path.join(root, 'vacio'), outDir: path.join(root, 'out'), size: 64, margin: 0.08 },
      { log: () => {} }
    );
    expect(result.exitCode).toBe(1);
  });
});
