import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import { ChartData } from '../../entities/birth-chart.entity';
import {
  FullChartInterpretation,
  PlanetInterpretation,
} from './chart-interpretation.service';
import {
  PlanetMetadata,
  ZodiacSignMetadata,
  AspectTypeMetadata,
  Planet,
  ZodiacSign,
  AspectType,
} from '../../domain/enums';

/**
 * Input para la generación de PDF
 */
export interface PDFGenerationInput {
  chartData: ChartData;
  interpretation: FullChartInterpretation;
  aiSynthesis?: string;
  userName: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  generatedAt: Date;
  isPremium: boolean;
}

/**
 * Resultado de la generación de PDF
 */
export interface PDFGenerationResult {
  buffer: Buffer;
  filename: string;
  pageCount: number;
}

// ── Design tokens ──────────────────────────────────────────────

const COLORS = {
  coverBg: '#1A0B2E',
  coverBgLower: '#2D1B4E',
  textOnDark: '#EDE9FE',
  textGold: '#D4A017',
  goldLine: '#F59E0B',

  pageBg: '#FFFFFF',
  cardBg: '#F5F3FF',
  tableRowAlt: '#FAF8FF',

  textPrimary: '#1F1135',
  textSecondary: '#6B7280',

  accentViolet: '#8B5CF6',
  accentLightViolet: '#C084FC',

  elementFire: '#EF4444',
  elementEarth: '#22C55E',
  elementAir: '#FBBF24',
  elementWater: '#3B82F6',

  aspectHarmonious: '#10B981',
  aspectChallenging: '#EF4444',
  aspectNeutral: '#8B5CF6',

  lineLight: '#E5E7EB',
  lineMedium: '#D1D5DB',
} as const;

const ELEMENT_COLORS: Record<string, string> = {
  Fuego: COLORS.elementFire,
  Tierra: COLORS.elementEarth,
  Aire: COLORS.elementAir,
  Agua: COLORS.elementWater,
};

const MARGIN = 50;
const CONTENT_WIDTH = 495;

// ── Font paths (DejaVu Sans – Unicode astrological symbols) ──
const FONTS_DIR = path.join(__dirname, '../../assets/fonts');
const FONT_REGULAR = path.join(FONTS_DIR, 'DejaVuSans.ttf');
const FONT_BOLD = path.join(FONTS_DIR, 'DejaVuSans-Bold.ttf');

// ── PDFKit instance type (InstanceType is the correct annotation for instances
//    created via `new PDFDocument(...)` — `typeof PDFDocument` is the constructor) ──
type PDFDocInstance = InstanceType<typeof PDFDocument>;

// ────────────────────────────────────────────────────────────────

/**
 * Servicio de generación de PDFs de cartas astrales
 *
 * Genera PDFs profesionales con diseño editorial:
 * - Portada con fondo oscuro y Big Three
 * - Tabla de posiciones planetarias con filas alternadas
 * - Tabla de cúspides de casas en 2 columnas
 * - Barras de distribución (elementos, modalidades, polaridad)
 * - Grilla de aspectos (aspectario) coloreada por naturaleza
 * - Resumen de aspectos
 * - Interpretaciones Big Three y planetas con boxes estilizados
 * - Síntesis IA (solo Premium)
 * - Disclaimer
 */
@Injectable()
export class ChartPdfService {
  private readonly logger = new Logger(ChartPdfService.name);

  async generatePDF(input: PDFGenerationInput): Promise<PDFGenerationResult> {
    this.validateInput(input);
    this.logger.log(`Generating PDF for ${input.userName}`);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          info: {
            Title: `Carta Astral - ${input.userName}`,
            Author: 'Auguria',
            Subject: 'Carta Astral Natal',
            Creator: 'Auguria - Plataforma de Servicios Místicos',
          },
        });

        doc.registerFont('MainFont', FONT_REGULAR);
        doc.registerFont('MainFont-Bold', FONT_BOLD);

        const chunks: Buffer[] = [];
        let currentPageNum = 1; // Cover page = 1, no header

        // Automatically number every page added after the cover
        doc.on('pageAdded', () => {
          currentPageNum++;
          this.renderPageHeader(doc, currentPageNum);
        });

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          resolve({
            buffer: Buffer.concat(chunks),
            filename: this.generateFilename(input.userName),
            pageCount: currentPageNum,
          });
        });
        doc.on('error', reject);

        // === PAGE 1: COVER ===
        this.renderCoverPage(doc, input);

        // === PAGE 2: POSITIONS & DISTRIBUTION ===
        this.addInteriorPage(doc);
        this.renderPositionsPage(doc, input);

        // === PAGE 3: ASPECT GRID ===
        this.addInteriorPage(doc);
        this.renderAspectGridPage(doc, input);

        // === PAGES: BIG THREE (flowing layout) ===
        const bigThreeEntries: {
          title: string;
          sign: string;
          text: string;
        }[] = [
          {
            title: '\u2609 SOL',
            sign: input.interpretation.bigThree.sun.signName,
            text: input.interpretation.bigThree.sun.interpretation,
          },
          {
            title: '\u263D LUNA',
            sign: input.interpretation.bigThree.moon.signName,
            text: input.interpretation.bigThree.moon.interpretation,
          },
          {
            title: '\u2191 ASCENDENTE',
            sign: input.interpretation.bigThree.ascendant.signName,
            text: input.interpretation.bigThree.ascendant.interpretation,
          },
        ];

        this.addInteriorPage(doc);
        let flowY = this.renderSectionTitle(
          doc,
          'INTERPRETACIONES: BIG THREE',
          MARGIN + 5,
        );

        for (const entry of bigThreeEntries) {
          flowY = this.renderBigThreeEntry(
            doc,
            entry.title,
            entry.sign,
            entry.text,
            flowY,
          );
        }

        // === PAGES: PLANETS (flowing layout) ===
        this.addInteriorPage(doc);
        flowY = this.renderSectionTitle(
          doc,
          'INTERPRETACIONES: PLANETAS',
          MARGIN + 5,
        );

        for (const planet of input.interpretation.planets) {
          flowY = this.renderPlanetPage(doc, planet, flowY);
        }

        // === PAGE: AI SYNTHESIS (Premium) ===
        if (input.isPremium && input.aiSynthesis) {
          this.addInteriorPage(doc);
          this.renderSynthesisPage(doc, input.aiSynthesis, MARGIN + 5);
        }

        // === PAGE: DISCLAIMER ===
        this.addInteriorPage(doc);
        this.renderDisclaimerPage(doc);

        doc.end();
      } catch (error) {
        this.logger.error('Error generating PDF:', error);
        reject(
          error instanceof Error
            ? error
            : new Error('Unknown error generating PDF'),
        );
      }
    });
  }

  // ── Validation ─────────────────────────────────────────────

  private validateInput(input: PDFGenerationInput): void {
    if (
      !input.userName ||
      typeof input.userName !== 'string' ||
      input.userName.trim().length === 0
    ) {
      throw new Error('userName is required for PDF generation');
    }
    if (input.birthDate == null) {
      throw new Error('birthDate is required for PDF generation');
    }
    if (input.birthTime == null) {
      throw new Error('birthTime is required for PDF generation');
    }
    if (
      !input.birthPlace ||
      (typeof input.birthPlace === 'string' &&
        input.birthPlace.trim().length === 0)
    ) {
      throw new Error('birthPlace is required for PDF generation');
    }
    if (input.generatedAt == null) {
      throw new Error('generatedAt is required for PDF generation');
    }
    if (!input.interpretation) {
      throw new Error('interpretation is required for PDF generation');
    }
    if (!input.interpretation.bigThree) {
      throw new Error('interpretation.bigThree is required for PDF generation');
    }
    if (
      !input.interpretation.planets ||
      !Array.isArray(input.interpretation.planets)
    ) {
      throw new Error(
        'interpretation.planets is required and must be an array for PDF generation',
      );
    }
    if (!input.chartData) {
      throw new Error('chartData is required for PDF generation');
    }
  }

  // ── Helpers ────────────────────────────────────────────────

  private generateFilename(userName: string): string {
    const sanitizedName = userName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const safeName = sanitizedName || 'usuario';
    return `carta-astral-${safeName}-${Date.now()}.pdf`;
  }

  private addInteriorPage(doc: PDFDocInstance): void {
    doc.addPage(); // pageAdded event fires and renders the header automatically
  }

  private renderPageHeader(doc: PDFDocInstance, pageNumber: number): void {
    const w = doc.page.width;
    doc
      .moveTo(MARGIN, 35)
      .lineTo(w - MARGIN, 35)
      .lineWidth(0.5)
      .stroke(COLORS.lineLight);

    doc
      .fontSize(8)
      .font('MainFont')
      .fillColor(COLORS.textSecondary)
      .text(String(pageNumber), w - MARGIN - 20, 22, {
        width: 20,
        align: 'right',
      });
  }

  private renderSectionTitle(
    doc: PDFDocInstance,
    title: string,
    y: number,
  ): number {
    doc
      .fontSize(16)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text(title, MARGIN, y);

    const textWidth = doc.widthOfString(title);
    const lineStart = MARGIN + textWidth + 10;
    const lineEnd = doc.page.width - MARGIN;

    if (lineStart < lineEnd - 20) {
      doc
        .moveTo(lineStart, y + 10)
        .lineTo(lineEnd, y + 10)
        .lineWidth(0.5)
        .stroke(COLORS.lineMedium);
    }

    return y + 30;
  }

  private renderContentBox(
    doc: PDFDocInstance,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: { accentColor?: string; bgColor?: string; radius?: number },
  ): void {
    const bg = options?.bgColor || COLORS.cardBg;
    const radius = options?.radius || 4;

    doc.roundedRect(x, y, width, height, radius).fill(bg);

    if (options?.accentColor) {
      doc.rect(x, y + radius, 4, height - radius * 2).fill(options.accentColor);
      doc.circle(x + 2, y + radius, 2).fill(options.accentColor);
      doc.circle(x + 2, y + height - radius, 2).fill(options.accentColor);
    }
  }

  private renderBar(
    doc: PDFDocInstance,
    x: number,
    y: number,
    maxWidth: number,
    percentage: number,
    color: string,
    label: string,
    value: string,
  ): number {
    const barHeight = 14;
    const labelWidth = 70;
    const valueWidth = 60;
    const barX = x + labelWidth;
    const barMaxW = maxWidth - labelWidth - valueWidth - 10;
    const barW = Math.max(2, (percentage / 100) * barMaxW);

    doc
      .fontSize(9)
      .font('MainFont')
      .fillColor(COLORS.textPrimary)
      .text(label, x, y + 1, { width: labelWidth });

    doc.roundedRect(barX, y, barMaxW, barHeight, 3).fill(COLORS.lineLight);

    if (barW > 0) {
      doc.roundedRect(barX, y, barW, barHeight, 3).fill(color);
    }

    doc
      .fontSize(9)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text(value, barX + barMaxW + 8, y + 1, { width: valueWidth });

    return y + barHeight + 6;
  }

  private checkPageBreak(
    doc: PDFDocInstance,
    currentY: number,
    requiredSpace: number,
  ): number {
    if (currentY + requiredSpace > doc.page.height - MARGIN) {
      doc.addPage(); // pageAdded event fires and renders the header automatically
      return MARGIN + 10;
    }
    return currentY;
  }

  private renderDiamondDecoration(
    doc: PDFDocInstance,
    cx: number,
    y: number,
    lineLen: number,
    color: string,
  ): void {
    doc
      .moveTo(cx - lineLen, y)
      .lineTo(cx - 6, y)
      .lineWidth(0.8)
      .stroke(color);
    doc
      .moveTo(cx + 6, y)
      .lineTo(cx + lineLen, y)
      .lineWidth(0.8)
      .stroke(color);
    doc
      .save()
      .moveTo(cx, y - 5)
      .lineTo(cx + 5, y)
      .lineTo(cx, y + 5)
      .lineTo(cx - 5, y)
      .closePath()
      .fill(color);
    doc.restore();
  }

  // ── Page 1: Cover ──────────────────────────────────────────

  private renderCoverPage(
    doc: PDFDocInstance,
    input: PDFGenerationInput,
  ): void {
    const { userName, birthDate, birthTime, birthPlace, generatedAt } = input;
    const { bigThree } = input.interpretation;
    const w = doc.page.width;
    const h = doc.page.height;

    // Single dark background with subtle gradient at bottom
    doc.rect(0, 0, w, h).fill(COLORS.coverBg);
    const gradientBands = 20;
    const gradientStart = h * 0.7;
    const bandHeight = (h - gradientStart) / gradientBands;
    for (let i = 0; i < gradientBands; i++) {
      const t = i / gradientBands;
      const r = Math.round(0x1a + (0x2d - 0x1a) * t);
      const g = Math.round(0x0b + (0x1b - 0x0b) * t);
      const b = Math.round(0x2e + (0x4e - 0x2e) * t);
      const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      doc
        .rect(0, gradientStart + i * bandHeight, w, bandHeight + 1)
        .fill(color);
    }

    this.renderDiamondDecoration(doc, w / 2, 140, 80, COLORS.goldLine);

    doc
      .fontSize(32)
      .font('MainFont-Bold')
      .fillColor(COLORS.textOnDark)
      .text('CARTA ASTRAL', MARGIN, 170, {
        align: 'center',
        characterSpacing: 4,
      });

    doc
      .fontSize(26)
      .font('MainFont-Bold')
      .fillColor(COLORS.textGold)
      .text(userName.toUpperCase(), MARGIN, 225, { align: 'center' });

    const sepY = 268;
    doc
      .moveTo(w / 2 - 60, sepY)
      .lineTo(w / 2 + 60, sepY)
      .lineWidth(0.8)
      .stroke(COLORS.goldLine);

    const birthDateStr = birthDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc
      .fontSize(13)
      .font('MainFont')
      .fillColor(COLORS.textOnDark)
      .text(`Nacimiento: ${birthDateStr}`, MARGIN, 290, { align: 'center' })
      .text(`Hora: ${birthTime}`, MARGIN, 310, { align: 'center' })
      .text(`Lugar: ${birthPlace}`, MARGIN, 330, { align: 'center' });

    const boxW = 280;
    const boxH = 130;
    const boxX = (w - boxW) / 2;
    const boxY = 390;

    doc.save();
    doc.opacity(0.15);
    doc.roundedRect(boxX, boxY, boxW, boxH, 8).fill('#FFFFFF');
    doc.restore();

    doc.save();
    doc.opacity(0.4);
    doc.roundedRect(boxX, boxY, boxW, boxH, 8).lineWidth(1).stroke('#FFFFFF');
    doc.restore();

    doc
      .fontSize(13)
      .font('MainFont-Bold')
      .fillColor(COLORS.textOnDark)
      .text('TU BIG THREE', MARGIN, boxY + 15, { align: 'center' });

    const sunName =
      ZodiacSignMetadata[bigThree.sun.sign]?.name || bigThree.sun.sign;
    const moonName =
      ZodiacSignMetadata[bigThree.moon.sign]?.name || bigThree.moon.sign;
    const ascName =
      ZodiacSignMetadata[bigThree.ascendant.sign]?.name ||
      bigThree.ascendant.sign;

    doc
      .fontSize(13)
      .font('MainFont')
      .fillColor(COLORS.textOnDark)
      .text(`\u2609  Sol en ${sunName}`, MARGIN, boxY + 45, {
        align: 'center',
      })
      .text(`\u263D  Luna en ${moonName}`, MARGIN, boxY + 70, {
        align: 'center',
      })
      .text(`\u2191  Ascendente en ${ascName}`, MARGIN, boxY + 95, {
        align: 'center',
      });

    doc
      .fontSize(9)
      .font('MainFont')
      .fillColor(COLORS.textSecondary)
      .text(
        `Generado por Auguria el ${generatedAt.toLocaleDateString('es-ES')}`,
        MARGIN,
        h - 60,
        { align: 'center', lineBreak: false },
      );
  }

  // ── Chart Wheel (cover element) ────────────────────────────

  private renderChartWheel(
    doc: PDFDocInstance,
    cx: number,
    cy: number,
    radius: number,
    chartData: ChartData,
  ): void {
    const houses = chartData.houses || [];
    const planets = chartData.planets || [];
    if (houses.length === 0) return;

    const outerR = radius;
    const ringInnerR = radius * 0.78;
    const planetR = radius * 0.63;
    const houseR = radius * 0.5;
    const centerR = radius * 0.06;
    const ascLon = houses[0].longitude;

    const toRad = (lon: number): number =>
      ((180 + lon - ascLon) * Math.PI) / 180;
    const xAt = (a: number, r: number) => cx + r * Math.cos(a);
    const yAt = (a: number, r: number) => cy - r * Math.sin(a);
    const fmt = (n: number) => n.toFixed(2);

    const RING: Record<string, string> = {
      fire: '#F59E0B',
      earth: '#22C55E',
      air: '#38BDF8',
      water: '#0891B2',
    };

    const SIGNS: ZodiacSign[] = [
      ZodiacSign.ARIES,
      ZodiacSign.TAURUS,
      ZodiacSign.GEMINI,
      ZodiacSign.CANCER,
      ZodiacSign.LEO,
      ZodiacSign.VIRGO,
      ZodiacSign.LIBRA,
      ZodiacSign.SCORPIO,
      ZodiacSign.SAGITTARIUS,
      ZodiacSign.CAPRICORN,
      ZodiacSign.AQUARIUS,
      ZodiacSign.PISCES,
    ];

    // Subtle golden glow behind the wheel
    doc.save();
    doc.opacity(0.15);
    doc.circle(cx, cy, outerR + 6).fill(COLORS.goldLine);
    doc.restore();

    // White backdrop
    doc.circle(cx, cy, outerR + 1).fill('#FFFFFF');

    // ── Zodiac ring segments ──
    for (let i = 0; i < 12; i++) {
      const meta = ZodiacSignMetadata[SIGNS[i]];
      if (!meta) continue;
      const color = RING[meta.element] || '#9CA3AF';
      const a1 = toRad(i * 30);
      const a2 = toRad(i * 30 + 30);

      const ox1 = fmt(xAt(a1, outerR)),
        oy1 = fmt(yAt(a1, outerR));
      const ox2 = fmt(xAt(a2, outerR)),
        oy2 = fmt(yAt(a2, outerR));
      const ix2 = fmt(xAt(a2, ringInnerR)),
        iy2 = fmt(yAt(a2, ringInnerR));
      const ix1 = fmt(xAt(a1, ringInnerR)),
        iy1 = fmt(yAt(a1, ringInnerR));

      doc
        .path(
          `M ${ox1} ${oy1} A ${fmt(outerR)} ${fmt(outerR)} 0 0 0 ${ox2} ${oy2} ` +
            `L ${ix2} ${iy2} A ${fmt(ringInnerR)} ${fmt(ringInnerR)} 0 0 1 ${ix1} ${iy1} Z`,
        )
        .fill(color);

      // Zodiac symbol at segment midpoint
      const mid = toRad(i * 30 + 15);
      const sR = (outerR + ringInnerR) / 2;
      doc
        .fontSize(Math.max(7, radius * 0.12))
        .font('MainFont-Bold')
        .fillColor('#FFFFFF')
        .text(meta.symbol, xAt(mid, sR) - 6, yAt(mid, sR) - 5, {
          width: 12,
          align: 'center',
          lineBreak: false,
        });
    }

    // Segment divider lines
    for (let i = 0; i < 12; i++) {
      const a = toRad(i * 30);
      doc
        .moveTo(xAt(a, ringInnerR), yAt(a, ringInnerR))
        .lineTo(xAt(a, outerR), yAt(a, outerR))
        .lineWidth(0.5)
        .stroke('#FFFFFF');
    }

    // Inner white fill (cleans up ring inner edge)
    doc.circle(cx, cy, ringInnerR).fill('#FFFFFF');

    // House boundary circle
    doc.circle(cx, cy, houseR).lineWidth(0.4).stroke(COLORS.lineMedium);

    // House cusp lines
    for (let i = 0; i < houses.length; i++) {
      const a = toRad(houses[i].longitude);
      const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
      doc
        .moveTo(xAt(a, centerR), yAt(a, centerR))
        .lineTo(xAt(a, ringInnerR), yAt(a, ringInnerR))
        .lineWidth(isAngular ? 1 : 0.3)
        .stroke(isAngular ? COLORS.textPrimary : COLORS.lineLight);
    }

    // House numbers
    doc
      .fontSize(Math.max(6, radius * 0.09))
      .font('MainFont')
      .fillColor(COLORS.textSecondary);
    for (let i = 0; i < houses.length; i++) {
      const next = houses[(i + 1) % houses.length];
      if (!next) continue;
      const cur = houses[i].longitude;
      const nxt = next.longitude;
      let mid = (cur + nxt) / 2;
      if (nxt < cur) mid = ((cur + nxt + 360) / 2) % 360;
      const a = toRad(mid);
      const nR = houseR * 0.55;
      doc.text(String(i + 1), xAt(a, nR) - 6, yAt(a, nR) - 4, {
        width: 12,
        align: 'center',
        lineBreak: false,
      });
    }

    // Planet symbols
    doc
      .fontSize(Math.max(7, radius * 0.11))
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary);
    for (const p of planets) {
      const meta = PlanetMetadata[p.planet as Planet];
      if (!meta) continue;
      const a = toRad(p.longitude);
      doc.text(meta.symbol, xAt(a, planetR) - 6, yAt(a, planetR) - 5, {
        width: 12,
        align: 'center',
        lineBreak: false,
      });
    }

    // Center dot
    doc.circle(cx, cy, centerR).fill('#FFFFFF');
    doc.circle(cx, cy, centerR).lineWidth(0.3).stroke(COLORS.lineMedium);

    // Cardinal point labels (outside ring, on dark cover background)
    const lblR = outerR + 14;
    const cardinals: { text: string; lon: number }[] = [
      { text: 'As', lon: ascLon },
      { text: 'Ds', lon: (ascLon + 180) % 360 },
    ];
    if (houses.length >= 10)
      cardinals.push({ text: 'Mc', lon: houses[9].longitude });
    if (houses.length >= 4)
      cardinals.push({ text: 'Ic', lon: houses[3].longitude });

    doc
      .fontSize(Math.max(7, radius * 0.11))
      .font('MainFont-Bold')
      .fillColor(COLORS.textOnDark);
    for (const c of cardinals) {
      const a = toRad(c.lon);
      doc.text(c.text, xAt(a, lblR) - 8, yAt(a, lblR) - 5, {
        width: 16,
        align: 'center',
        lineBreak: false,
      });
    }
  }

  // ── Page 2: Positions & Distribution ───────────────────────

  private renderPositionsPage(
    doc: PDFDocInstance,
    input: PDFGenerationInput,
  ): void {
    let y = this.renderSectionTitle(doc, 'POSICIONES PLANETARIAS', MARGIN + 5);

    const cols = {
      symbol: 55,
      name: 120,
      sign: 220,
      house: 330,
      degree: 400,
      retro: 470,
    };

    doc.fontSize(9).font('MainFont-Bold').fillColor(COLORS.textSecondary);
    doc.text('', cols.symbol, y);
    doc.text('Planeta', cols.name, y);
    doc.text('Signo', cols.sign, y);
    doc.text('Casa', cols.house, y);
    doc.text('Grado', cols.degree, y);
    doc.text('Ret.', cols.retro, y);

    y += 16;
    doc
      .moveTo(MARGIN, y)
      .lineTo(doc.page.width - MARGIN, y)
      .lineWidth(0.5)
      .stroke(COLORS.lineMedium);
    y += 4;

    const planets = input.chartData.planets || [];
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      const planetMeta = PlanetMetadata[p.planet as Planet];
      const signMeta = ZodiacSignMetadata[p.sign as ZodiacSign];
      const rowH = 22;

      if (i % 2 === 0) {
        doc.rect(MARGIN, y, CONTENT_WIDTH, rowH).fill(COLORS.tableRowAlt);
      }

      doc.fontSize(12).font('MainFont').fillColor(COLORS.accentViolet);
      doc.text(planetMeta?.symbol || '', cols.symbol, y + 4, { width: 20 });

      doc.fontSize(10).font('MainFont').fillColor(COLORS.textPrimary);
      doc.text(planetMeta?.name || p.planet, cols.name, y + 5);
      doc.text(signMeta?.name || p.sign, cols.sign, y + 5);
      doc.text(String(p.house || '-'), cols.house, y + 5);
      doc.text(`${p.signDegree.toFixed(1)}\u00B0`, cols.degree, y + 5);
      doc
        .fontSize(10)
        .fillColor(
          p.isRetrograde ? COLORS.aspectChallenging : COLORS.textSecondary,
        )
        .text(p.isRetrograde ? '\u211E' : '', cols.retro, y + 5);

      y += rowH;
    }

    y += 20;
    y = this.renderSectionTitle(doc, 'C\u00DASPIDES DE CASAS', y);

    const houses = input.chartData.houses || [];
    if (houses.length > 0) {
      const colWidth = CONTENT_WIDTH / 2 - 10;
      const leftX = MARGIN;
      const rightX = MARGIN + colWidth + 20;

      doc.fontSize(9).font('MainFont-Bold').fillColor(COLORS.textSecondary);
      doc
        .text('Casa', leftX, y)
        .text('Signo', leftX + 50, y)
        .text('Grado', leftX + 130, y);
      doc
        .text('Casa', rightX, y)
        .text('Signo', rightX + 50, y)
        .text('Grado', rightX + 130, y);
      y += 14;

      doc.fontSize(9).font('MainFont').fillColor(COLORS.textPrimary);

      const romanNumerals = [
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
        'VII',
        'VIII',
        'IX',
        'X',
        'XI',
        'XII',
      ];
      for (let i = 0; i < Math.min(6, houses.length); i++) {
        const left = houses[i];
        const right = houses[i + 6];
        const leftSign =
          ZodiacSignMetadata[left?.sign as ZodiacSign]?.name ||
          left?.sign ||
          '';
        const rightSign = right
          ? ZodiacSignMetadata[right.sign as ZodiacSign]?.name || right.sign
          : '';

        doc.text(romanNumerals[i], leftX, y);
        doc.text(leftSign, leftX + 50, y);
        doc.text(
          left ? `${left.signDegree.toFixed(1)}\u00B0` : '',
          leftX + 130,
          y,
        );

        if (right) {
          doc.text(romanNumerals[i + 6], rightX, y);
          doc.text(rightSign, rightX + 50, y);
          doc.text(`${right.signDegree.toFixed(1)}\u00B0`, rightX + 130, y);
        }
        y += 16;
      }
    }

    y += 15;
    const distStartY = y; // anchor for right-column wheel
    y = this.renderSectionTitle(doc, 'DISTRIBUCI\u00D3N', y);

    doc
      .fontSize(10)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text('Elementos', MARGIN, y);
    y += 18;

    for (const el of input.interpretation.distribution.elements) {
      const color = ELEMENT_COLORS[el.name] || COLORS.accentViolet;
      y = this.renderBar(
        doc,
        MARGIN,
        y,
        CONTENT_WIDTH / 2,
        el.percentage,
        color,
        el.name,
        `${el.count} (${el.percentage.toFixed(0)}%)`,
      );
    }

    y += 8;
    doc
      .fontSize(10)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text('Modalidades', MARGIN, y);
    y += 18;

    const modalityColors = ['#8B5CF6', '#A78BFA', '#C4B5FD'];
    const modalities = input.interpretation.distribution.modalities || [];
    for (let i = 0; i < modalities.length; i++) {
      const mod = modalities[i];
      y = this.renderBar(
        doc,
        MARGIN,
        y,
        CONTENT_WIDTH / 2,
        mod.percentage,
        modalityColors[i] || COLORS.accentViolet,
        mod.name,
        `${mod.count} (${mod.percentage.toFixed(0)}%)`,
      );
    }

    const dist = input.chartData.distribution;
    if (dist?.polarity) {
      const total =
        (dist.polarity.masculine || 0) + (dist.polarity.feminine || 0);
      if (total > 0) {
        y += 8;
        doc
          .fontSize(10)
          .font('MainFont-Bold')
          .fillColor(COLORS.textPrimary)
          .text('Polaridad', MARGIN, y);
        y += 18;

        const mascPct = (dist.polarity.masculine / total) * 100;
        const femPct = (dist.polarity.feminine / total) * 100;

        y = this.renderBar(
          doc,
          MARGIN,
          y,
          CONTENT_WIDTH / 2,
          mascPct,
          '#6366F1',
          'Masculino',
          `${dist.polarity.masculine} (${mascPct.toFixed(0)}%)`,
        );
        y = this.renderBar(
          doc,
          MARGIN,
          y,
          CONTENT_WIDTH / 2,
          femPct,
          '#EC4899',
          'Femenino',
          `${dist.polarity.feminine} (${femPct.toFixed(0)}%)`,
        );
      }
    }

    // Chart wheel in the right half of the distribution section
    const pageBottom = doc.page.height - MARGIN;
    const availableHeight = pageBottom - distStartY;
    const wheelRadius = Math.min(100, Math.floor(availableHeight / 2) - 15);
    const wheelCX = MARGIN + Math.round((CONTENT_WIDTH * 3) / 4);
    const wheelCY = Math.round(distStartY + availableHeight / 2);
    if (wheelRadius > 30) {
      this.renderChartWheel(
        doc,
        wheelCX,
        wheelCY,
        wheelRadius,
        input.chartData,
      );
    }
  }

  // ── Page 3: Aspect Grid ────────────────────────────────────

  private renderAspectGridPage(
    doc: PDFDocInstance,
    input: PDFGenerationInput,
  ): void {
    let y = this.renderSectionTitle(doc, 'ASPECTARIO', MARGIN + 5);

    const aspects = input.chartData.aspects || [];
    const planetOrder = [
      Planet.SUN,
      Planet.MOON,
      Planet.MERCURY,
      Planet.VENUS,
      Planet.MARS,
      Planet.JUPITER,
      Planet.SATURN,
      Planet.URANUS,
      Planet.NEPTUNE,
      Planet.PLUTO,
    ];
    const n = planetOrder.length;
    const cellSize = 38;
    const headerSize = 30;
    const gridX = MARGIN + headerSize;
    const gridY = y + 20;

    for (let col = 0; col < n; col++) {
      const meta = PlanetMetadata[planetOrder[col]];
      doc
        .fontSize(10)
        .font('MainFont')
        .fillColor(COLORS.accentViolet)
        .text(meta?.symbol || '', gridX + col * cellSize + 2, gridY - 16, {
          width: cellSize - 4,
          align: 'center',
          lineBreak: false,
        });
    }

    const aspectMap = new Map<string, { type: AspectType; orb: number }>();
    for (const a of aspects) {
      const key1 = `${a.planet1}:${a.planet2}`;
      const key2 = `${a.planet2}:${a.planet1}`;
      const entry = { type: a.aspectType as AspectType, orb: a.orb };
      aspectMap.set(key1, entry);
      aspectMap.set(key2, entry);
    }

    for (let row = 0; row < n; row++) {
      const rowY = gridY + row * cellSize;
      const meta = PlanetMetadata[planetOrder[row]];

      doc
        .fontSize(11)
        .font('MainFont')
        .fillColor(COLORS.accentViolet)
        .text(meta?.symbol || '', MARGIN, rowY + 10, {
          width: headerSize - 4,
          align: 'center',
        });

      for (let col = 0; col < n; col++) {
        const cellX = gridX + col * cellSize;

        doc
          .rect(cellX, rowY, cellSize, cellSize)
          .lineWidth(0.5)
          .stroke(COLORS.lineLight);

        if (row === col) {
          doc.rect(cellX, rowY, cellSize, cellSize).fill(COLORS.lineLight);
          continue;
        }

        if (col > row) continue;

        const key = `${planetOrder[row]}:${planetOrder[col]}`;
        const aspect = aspectMap.get(key);

        if (aspect) {
          const aspectMeta = AspectTypeMetadata[aspect.type];
          if (aspectMeta) {
            let cellColor: string = COLORS.cardBg;
            if (aspectMeta.nature === 'harmonious') cellColor = '#DCFCE7';
            else if (aspectMeta.nature === 'challenging') cellColor = '#FEE2E2';
            else cellColor = '#EDE9FE';

            doc
              .rect(cellX + 0.5, rowY + 0.5, cellSize - 1, cellSize - 1)
              .fill(cellColor);

            doc
              .fontSize(13)
              .font('MainFont')
              .fillColor(
                aspectMeta.nature === 'harmonious'
                  ? COLORS.aspectHarmonious
                  : aspectMeta.nature === 'challenging'
                    ? COLORS.aspectChallenging
                    : COLORS.aspectNeutral,
              )
              .text(aspectMeta.symbol, cellX + 2, rowY + 8, {
                width: cellSize - 4,
                align: 'center',
              });
          }
        }
      }
    }

    y = gridY + n * cellSize + 20;

    const legendItems = [
      {
        symbol: '\u260C',
        name: 'Conjunci\u00F3n',
        color: COLORS.aspectNeutral,
      },
      {
        symbol: '\u260D',
        name: 'Oposici\u00F3n',
        color: COLORS.aspectChallenging,
      },
      {
        symbol: '\u25A1',
        name: 'Cuadratura',
        color: COLORS.aspectChallenging,
      },
      {
        symbol: '\u25B3',
        name: 'Tr\u00EDgono',
        color: COLORS.aspectHarmonious,
      },
      { symbol: '\u26B9', name: 'Sextil', color: COLORS.aspectHarmonious },
    ];

    let lx = MARGIN;
    for (const item of legendItems) {
      doc
        .fontSize(10)
        .font('MainFont')
        .fillColor(item.color)
        .text(item.symbol, lx, y, { lineBreak: false });
      doc
        .fontSize(8)
        .font('MainFont')
        .fillColor(COLORS.textSecondary)
        .text(item.name, lx + 14, y + 1, { lineBreak: false });
      lx += 95;
    }

    y += 25;

    const summary = input.interpretation.aspectSummary;
    if (summary) {
      y = this.renderSectionTitle(doc, 'RESUMEN DE ASPECTOS', y);

      const boxW = 260;
      const boxH = 100;
      this.renderContentBox(doc, MARGIN, y, boxW, boxH, {
        accentColor: COLORS.accentViolet,
      });

      const bx = MARGIN + 16;
      let by = y + 12;

      doc.fontSize(10).font('MainFont').fillColor(COLORS.textPrimary);
      doc.text(`Total de aspectos: ${summary.total}`, bx, by);
      by += 18;

      doc.fontSize(9).font('MainFont');
      doc
        .fillColor(COLORS.aspectHarmonious)
        .text(`\u25CF Arm\u00F3nicos: ${summary.harmonious}`, bx, by);
      by += 15;
      doc
        .fillColor(COLORS.aspectChallenging)
        .text(`\u25CF Desafiantes: ${summary.challenging}`, bx, by);
      by += 15;

      const neutralCount =
        summary.total - summary.harmonious - summary.challenging;
      doc
        .fillColor(COLORS.aspectNeutral)
        .text(`\u25CF Neutrales: ${neutralCount}`, bx, by);
      by += 18;

      if (summary.strongest) {
        doc
          .fontSize(8)
          .font('MainFont')
          .fillColor(COLORS.textSecondary)
          .text(
            `Aspecto m\u00E1s fuerte: ${summary.strongest.planet1} ${summary.strongest.aspectSymbol} ${summary.strongest.planet2} (orbe ${summary.strongest.orb.toFixed(1)}\u00B0)`,
            bx,
            by,
          );
      }
    }
  }

  // ── Big Three Entries (flowing) ─────────────────────────────

  private renderBigThreeEntry(
    doc: PDFDocInstance,
    title: string,
    signName: string,
    interpretation: string,
    startY: number,
  ): number {
    const boxH = 50;

    // Estimate total height: box + text
    doc.fontSize(11);
    const textHeight = doc.heightOfString(interpretation, {
      width: CONTENT_WIDTH,
    });
    const totalNeeded = boxH + 15 + textHeight + 25;

    let y = this.checkPageBreak(doc, startY, Math.min(totalNeeded, 200));

    this.renderContentBox(doc, MARGIN, y, CONTENT_WIDTH, boxH, {
      accentColor: COLORS.accentViolet,
    });

    doc
      .fontSize(18)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text(title, MARGIN + 16, y + 10);

    doc
      .fontSize(12)
      .font('MainFont')
      .fillColor(COLORS.accentViolet)
      .text(`en ${signName}`, MARGIN + 16, y + 32);

    y += boxH + 12;

    doc
      .fontSize(11)
      .font('MainFont')
      .fillColor(COLORS.textPrimary)
      .text(interpretation, MARGIN, y, {
        width: CONTENT_WIDTH,
        align: 'justify',
        lineGap: 3,
      });

    return doc.y + 20;
  }

  // ── Planet Entries (flowing) ──────────────────────────────

  private renderPlanetPage(
    doc: PDFDocInstance,
    planet: PlanetInterpretation,
    startY: number,
  ): number {
    const boxH = 50;

    // Check if we need a page break for the header box
    let y = this.checkPageBreak(doc, startY, boxH + 60);

    const retroLabel = planet.isRetrograde ? ' (\u211E Retr\u00F3grado)' : '';
    this.renderContentBox(doc, MARGIN, y, CONTENT_WIDTH, boxH, {
      accentColor: COLORS.accentViolet,
    });

    doc
      .fontSize(16)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text(
        `${planet.planetSymbol} ${planet.planetName.toUpperCase()}`,
        MARGIN + 16,
        y + 8,
      );

    doc
      .fontSize(11)
      .font('MainFont')
      .fillColor(COLORS.accentViolet)
      .text(
        `en ${planet.signName} - Casa ${planet.house}${retroLabel}`,
        MARGIN + 16,
        y + 30,
      );

    y += boxH + 12;

    if (planet.intro) {
      doc.fontSize(11).font('MainFont');
      const introHeight = doc.heightOfString(planet.intro, {
        width: CONTENT_WIDTH - 30,
        lineGap: 3,
      });
      const blockH = introHeight + 20;

      y = this.checkPageBreak(doc, y, blockH);

      this.renderContentBox(doc, MARGIN, y, CONTENT_WIDTH, blockH, {
        accentColor: COLORS.goldLine,
        bgColor: '#FFFBEB',
      });

      doc
        .fontSize(11)
        .font('MainFont')
        .fillColor(COLORS.textPrimary)
        .text(planet.intro, MARGIN + 16, y + 10, {
          width: CONTENT_WIDTH - 30,
          align: 'justify',
          lineGap: 3,
        });

      y += blockH + 12;
    }

    if (planet.inSign) {
      y = this.checkPageBreak(doc, y, 80);
      y = this.renderSectionTitle(doc, `En ${planet.signName}`, y);

      doc
        .fontSize(11)
        .font('MainFont')
        .fillColor(COLORS.textPrimary)
        .text(planet.inSign, MARGIN, y, {
          width: CONTENT_WIDTH,
          align: 'justify',
          lineGap: 3,
        });

      y = doc.y + 15;
    }

    if (planet.inHouse) {
      y = this.checkPageBreak(doc, y, 80);
      y = this.renderSectionTitle(doc, `En Casa ${planet.house}`, y);

      doc
        .fontSize(11)
        .font('MainFont')
        .fillColor(COLORS.textPrimary)
        .text(planet.inHouse, MARGIN, y, {
          width: CONTENT_WIDTH,
          align: 'justify',
          lineGap: 3,
        });

      y = doc.y + 15;
    }

    if (planet.aspects && planet.aspects.length > 0) {
      y = this.checkPageBreak(doc, y, 50);
      y = this.renderSectionTitle(doc, 'Aspectos', y);

      for (const aspect of planet.aspects) {
        y = this.checkPageBreak(doc, y, 60);

        const nature =
          AspectTypeMetadata[aspect.aspectType]?.nature || 'neutral';
        const badgeColor =
          nature === 'harmonious'
            ? COLORS.aspectHarmonious
            : nature === 'challenging'
              ? COLORS.aspectChallenging
              : COLORS.aspectNeutral;

        doc.circle(MARGIN + 4, y + 5, 4).fill(badgeColor);

        doc
          .fontSize(10)
          .font('MainFont-Bold')
          .fillColor(COLORS.textPrimary)
          .text(
            `${aspect.aspectSymbol} ${aspect.aspectName} con ${aspect.planet2}`,
            MARGIN + 14,
            y,
          );

        y += 16;

        if (aspect.interpretation) {
          doc
            .fontSize(10)
            .font('MainFont')
            .fillColor(COLORS.textPrimary)
            .text(aspect.interpretation, MARGIN + 14, y, {
              width: CONTENT_WIDTH - 14,
              align: 'justify',
              lineGap: 2,
            });

          y = doc.y + 10;
        }
      }
    }

    return y + 10;
  }

  // ── Synthesis Page ─────────────────────────────────────────

  private renderSynthesisPage(
    doc: PDFDocInstance,
    aiSynthesis: string,
    startY: number,
  ): void {
    const boxH = 55;
    this.renderContentBox(doc, MARGIN, startY, CONTENT_WIDTH, boxH, {
      accentColor: COLORS.accentViolet,
    });

    doc
      .fontSize(18)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text('\u2726  S\u00CDNTESIS PERSONALIZADA', MARGIN + 16, startY + 9);

    doc
      .fontSize(9)
      .font('MainFont')
      .fillColor(COLORS.textSecondary)
      .text(
        'An\u00E1lisis personalizado exclusivo para usuarios Premium',
        MARGIN + 16,
        startY + 33,
      );

    let y = startY + boxH + 20;

    // Split by paragraph breaks and apply overflow protection for each paragraph
    const paragraphs = aiSynthesis.split(/\n\n+/).filter(Boolean);
    for (const para of paragraphs) {
      const estimatedH = doc.heightOfString(para, {
        width: CONTENT_WIDTH,
        lineGap: 5,
      });
      y = this.checkPageBreak(doc, y, estimatedH + 15);
      doc
        .fontSize(11)
        .font('MainFont')
        .fillColor(COLORS.textPrimary)
        .text(para, MARGIN, y, {
          width: CONTENT_WIDTH,
          align: 'justify',
          lineGap: 5,
        });
      y = doc.y + 12;
    }
  }

  // ── Disclaimer Page ────────────────────────────────────────

  private renderDisclaimerPage(doc: PDFDocInstance): void {
    const w = doc.page.width;
    const cx = w / 2;
    const startY = 250;

    this.renderDiamondDecoration(doc, cx, startY, 50, COLORS.lineMedium);

    doc
      .fontSize(14)
      .font('MainFont-Bold')
      .fillColor(COLORS.textPrimary)
      .text('AVISO IMPORTANTE', MARGIN, startY + 20, { align: 'center' });

    const disclaimer =
      'Este documento contiene una interpretaci\u00F3n astrol\u00F3gica basada en las posiciones planetarias al momento de tu nacimiento. La astrolog\u00EDa es una herramienta de autoconocimiento y reflexi\u00F3n, no una ciencia exacta.\n\nLas interpretaciones aqu\u00ED presentadas son de car\u00E1cter general y pueden no aplicarse completamente a cada individuo. Te recomendamos utilizar esta informaci\u00F3n como una gu\u00EDa para el autoconocimiento y el crecimiento personal, no como verdades absolutas.\n\nAuguria no se hace responsable de las decisiones tomadas bas\u00E1ndose en la informaci\u00F3n contenida en este documento. Para cuestiones importantes de salud, finanzas o relaciones, consulta siempre con profesionales calificados en esas \u00E1reas.\n\nEste documento es generado autom\u00E1ticamente por el sistema de Auguria y est\u00E1 destinado \u00FAnicamente para uso personal. Queda prohibida su reproducci\u00F3n total o parcial sin autorizaci\u00F3n.';

    doc
      .fontSize(9)
      .font('MainFont')
      .fillColor(COLORS.textSecondary)
      .text(disclaimer, MARGIN + 40, startY + 55, {
        width: CONTENT_WIDTH - 80,
        align: 'center',
        lineGap: 4,
      });

    doc
      .fontSize(9)
      .font('MainFont-Bold')
      .fillColor(COLORS.textSecondary)
      .text(
        `\u00A9 ${new Date().getFullYear()} Auguria - Todos los derechos reservados.`,
        MARGIN,
        doc.y + 30,
        { align: 'center' },
      );
  }
}
