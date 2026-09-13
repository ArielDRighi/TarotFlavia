import { mkdtemp, mkdir, rm, writeFile, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import {
  DEFAULTS,
  parseArgs,
  whiteToAlpha,
  solidColor,
  growStrokes,
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
  it('vuelve transparente el blanco puro (y limpia el RGB)', () => {
    const px = whiteToAlpha(Buffer.from([255, 255, 255, 255]));
    expect([...px]).toEqual([0, 0, 0, 0]);
  });

  it('trata como fondo el "casi blanco" de un JPEG (piso de ruido)', () => {
    const px = whiteToAlpha(Buffer.from([250, 248, 251, 255]));
    expect(px[3]).toBe(0);
  });

  it('deja intacto el negro opaco', () => {
    const px = whiteToAlpha(Buffer.from([0, 0, 0, 255]));
    expect([...px]).toEqual([0, 0, 0, 255]);
  });

  it('el dorado de marca es trazo sólido: conserva su color y queda opaco (fiel sobre cósmico)', () => {
    const px = whiteToAlpha(Buffer.from([GOLD.r, GOLD.g, GOLD.b, 255]));
    expect([...px]).toEqual([GOLD.r, GOLD.g, GOLD.b, 255]);
  });

  it('al brillo suave le da alfa parcial y un color que compuesto sobre blanco devuelve el original', () => {
    const glow = { r: 240, g: 225, b: 190 };
    const px = whiteToAlpha(Buffer.from([glow.r, glow.g, glow.b, 255]));
    const a = px[3] / 255;
    expect(px[3]).toBe(255 - Math.min(glow.r, glow.g, glow.b));
    expect(px[3]).toBeLessThan(Math.round(0.75 * 255));
    // composición "source over" sobre blanco
    const over = (c) => Math.round(c * a + 255 * (1 - a));
    expect(over(px[0])).toBeCloseTo(glow.r, -0.5);
    expect(over(px[1])).toBeCloseTo(glow.g, -0.5);
    expect(over(px[2])).toBeCloseTo(glow.b, -0.5);
  });

  it('respeta el alfa previo (multiplica, no lo pisa)', () => {
    const px = whiteToAlpha(Buffer.from([0, 0, 0, 128]));
    expect(px[3]).toBe(128);
    const transparent = whiteToAlpha(Buffer.from([0, 0, 0, 0]));
    expect(transparent[3]).toBe(0);
  });

  it('con glowColor, el halo toma ese color fijo y el alfa se cuantiza de a 8', () => {
    const glow = { r: 240, g: 225, b: 190 }; // distancia al blanco = 65 → 64
    const px = whiteToAlpha(Buffer.from([glow.r, glow.g, glow.b, 255]), {
      glowColor: [GOLD.r, GOLD.g, GOLD.b],
    });
    expect([...px]).toEqual([GOLD.r, GOLD.g, GOLD.b, 64]);
    // el trazo sólido y el fondo no cambian con glowColor
    expect([
      ...whiteToAlpha(Buffer.from([GOLD.r, GOLD.g, GOLD.b, 255]), { glowColor: [0, 0, 0] }),
    ]).toEqual([GOLD.r, GOLD.g, GOLD.b, 255]);
    expect(whiteToAlpha(Buffer.from([255, 255, 255, 255]), { glowColor: [0, 0, 0] })[3]).toBe(0);
  });

  it('procesa varios píxeles en el mismo buffer', () => {
    const px = whiteToAlpha(Buffer.from([255, 255, 255, 255, 0, 0, 0, 255]));
    expect(px[3]).toBe(0);
    expect(px[7]).toBe(255);
  });
});

describe('whiteToAlpha con tone', () => {
  it('oscurece el trazo sólido por el factor, sin tocar el halo ni el fondo', () => {
    const px = whiteToAlpha(Buffer.from([200, 150, 50, 255]), { tone: 0.5 });
    expect([...px]).toEqual([100, 75, 25, 255]);
    const glow = whiteToAlpha(Buffer.from([240, 225, 190, 255]), {
      tone: 0.5,
      glowColor: [1, 2, 3],
    });
    expect([...glow.subarray(0, 3)]).toEqual([1, 2, 3]);
  });
});

describe('growStrokes (engrosado del trazo)', () => {
  const gold = [180, 120, 30];

  it('con radio 1, un píxel opaco se vuelve un bloque 3×3 del color dado', () => {
    // 5×5 transparente con el centro opaco
    const data = Buffer.alloc(5 * 5 * 4, 0);
    data.set([9, 9, 9, 255], (2 * 5 + 2) * 4);
    growStrokes(data, 5, 5, 1, gold);
    let opaque = 0;
    for (let p = 0; p < 25; p += 1) if (data[p * 4 + 3] === 255) opaque += 1;
    expect(opaque).toBe(9);
    // el original conserva su color; el vecino toma el dorado
    expect([...data.subarray((2 * 5 + 2) * 4, (2 * 5 + 2) * 4 + 4)]).toEqual([9, 9, 9, 255]);
    expect([...data.subarray((1 * 5 + 2) * 4, (1 * 5 + 2) * 4 + 4)]).toEqual([...gold, 255]);
    // la esquina (distancia 2) sigue transparente
    expect(data[3]).toBe(0);
  });

  it('no dilata píxeles semitransparentes (halo) ni hace nada con radio 0', () => {
    const data = Buffer.alloc(3 * 3 * 4, 0);
    data.set([9, 9, 9, 128], (1 * 3 + 1) * 4);
    growStrokes(data, 3, 3, 1, gold);
    expect(data[3]).toBe(0);
    const solid = Buffer.from([9, 9, 9, 255, 0, 0, 0, 0]);
    growStrokes(solid, 2, 1, 0, gold);
    expect(solid[7]).toBe(0);
  });
});

describe('solidColor', () => {
  it('devuelve la mediana RGB de los píxeles de trazo sólido', () => {
    const px = Buffer.from([
      ...[GOLD.r, GOLD.g, GOLD.b, 255],
      ...[GOLD.r + 4, GOLD.g - 2, GOLD.b + 1, 255],
      ...[GOLD.r - 3, GOLD.g + 5, GOLD.b - 2, 255],
      ...[255, 255, 255, 255], // fondo: no cuenta
      ...[240, 225, 190, 255], // halo: no cuenta
    ]);
    expect(solidColor(px)).toEqual([GOLD.r, GOLD.g, GOLD.b]);
  });

  it('devuelve undefined si no hay trazo sólido', () => {
    expect(solidColor(Buffer.from([255, 255, 255, 255, 240, 225, 190, 255]))).toBeUndefined();
  });
});

// =============================================================================
// processIcon
// =============================================================================

describe('processIcon', () => {
  it('quita el fondo blanco, recorta al sujeto, lo centra con margen y exporta WebP cuadrado', async () => {
    const input = await goldSquareOnWhite();
    const out = await processIcon(input, { size: 64, margin: 0.1, tone: 1, stroke: 0 });

    const meta = await sharp(out).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(64);
    expect(meta.height).toBe(64);
    expect(meta.hasAlpha).toBe(true);

    // Esquinas: el margen es transparente.
    expect((await pixelAt(out, 0, 0)).a).toBe(0);
    expect((await pixelAt(out, 63, 63)).a).toBe(0);

    // Centro: el cuadrado (que en el original estaba descentrado) ahora está en el medio,
    // opaco y con el dorado original (tone 1 en este test; tolerancia por la compresión WebP).
    const center = await pixelAt(out, 32, 32);
    expect(center.a).toBeGreaterThan(250);
    expect(Math.abs(center.r - GOLD.r)).toBeLessThan(8);
    expect(Math.abs(center.g - GOLD.g)).toBeLessThan(8);
    expect(Math.abs(center.b - GOLD.b)).toBeLessThan(8);

    // Y llega hasta cerca del borde menos el margen: ~10 % de 64 ≈ 6 px.
    expect((await pixelAt(out, 8, 32)).a).toBeGreaterThan(150);
    // (WebP con alfa con pérdida: tolera un residuo mínimo en el margen.)
    expect((await pixelAt(out, 3, 32)).a).toBeLessThan(16);
  });

  it('con tone y stroke por defecto, el trazo sale más oscuro y más ancho', async () => {
    const input = await goldSquareOnWhite({ size: 200, square: 20, offset: 90 });
    const plain = await processIcon(input, { size: 200, margin: 0, tone: 1, stroke: 0 });
    const boosted = await processIcon(input, { size: 200, margin: 0 });

    // Más oscuro: el centro del cuadrado baja de valor en los tres canales.
    const c0 = await pixelAt(plain, 100, 100);
    const c1 = await pixelAt(boosted, 100, 100);
    expect(c1.r).toBeLessThan(c0.r - 10);
    expect(c1.g).toBeLessThan(c0.g - 10);
    // Más ancho: el cuadrado dilatado ocupa más del lienzo (el recorte es al contenido,
    // así que se compara el peso relativo de píxeles opacos).
    const opaqueRatio = async (buf) => {
      const { data } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 250) n += 1;
      return n / (data.length / 4);
    };
    expect(await opaqueRatio(boosted)).toBeGreaterThanOrEqual(await opaqueRatio(plain));
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
      stroke: DEFAULTS.stroke,
      tone: DEFAULTS.tone,
      maxBytes: DEFAULTS.maxBytes,
      family: undefined,
      help: false,
    });
  });

  it('lee --stroke y --tone y rechaza valores fuera de rango', () => {
    expect(parseArgs(['--stroke', '0', '--tone', '1'])).toMatchObject({ stroke: 0, tone: 1 });
    expect(() => parseArgs(['--stroke', '0.5'])).toThrow(/--stroke/);
    expect(() => parseArgs(['--tone', '0.2'])).toThrow(/--tone/);
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
