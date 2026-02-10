import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { ChartData } from '../../entities/birth-chart.entity';
import {
  FullChartInterpretation,
  PlanetInterpretation,
  BigThreeInterpretation,
} from './chart-interpretation.service';
import {
  PlanetMetadata,
  ZodiacSignMetadata,
  Planet,
  ZodiacSign,
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

/**
 * Servicio de generación de PDFs de cartas astrales
 *
 * Genera PDFs profesionales con:
 * - Portada personalizada
 * - Gráfico de la carta (si está disponible)
 * - Tablas de posiciones
 * - Interpretaciones según plan (Big Three para todos, completo para Free/Premium)
 * - Síntesis IA (solo Premium)
 * - Disclaimer
 *
 * @example
 * const result = await service.generatePDF({
 *   chartData,
 *   interpretation,
 *   userName: 'Juan Pérez',
 *   birthDate: new Date('1990-05-15'),
 *   birthTime: '14:30:00',
 *   birthPlace: 'Buenos Aires, Argentina',
 *   generatedAt: new Date(),
 *   isPremium: false
 * });
 */
@Injectable()
export class ChartPdfService {
  private readonly logger = new Logger(ChartPdfService.name);

  // Configuración de estilos
  private readonly COLORS = {
    primary: '#2D1B4E', // Morado oscuro
    secondary: '#8B5CF6', // Violeta
    accent: '#F59E0B', // Dorado
    text: '#1F2937', // Gris oscuro
    muted: '#6B7280', // Gris
    background: '#FAFAFA', // Gris claro
  };

  private readonly FONTS = {
    title: 'Helvetica-Bold',
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    symbol: 'Helvetica',
  };

  /**
   * Genera el PDF completo de la carta astral
   */
  async generatePDF(input: PDFGenerationInput): Promise<PDFGenerationResult> {
    const {
      userName,
      birthDate,
      birthTime,
      birthPlace,
      generatedAt,
      interpretation,
      chartData,
    } = input;

    // Validación de campos requeridos para evitar errores en tiempo de ejecución
    if (
      !userName ||
      typeof userName !== 'string' ||
      userName.trim().length === 0
    ) {
      throw new Error('userName is required for PDF generation');
    }

    if (birthDate == null) {
      throw new Error('birthDate is required for PDF generation');
    }

    if (birthTime == null) {
      throw new Error('birthTime is required for PDF generation');
    }

    if (
      !birthPlace ||
      (typeof birthPlace === 'string' && birthPlace.trim().length === 0)
    ) {
      throw new Error('birthPlace is required for PDF generation');
    }

    if (generatedAt == null) {
      throw new Error('generatedAt is required for PDF generation');
    }

    if (!interpretation) {
      throw new Error('interpretation is required for PDF generation');
    }

    if (!interpretation.bigThree) {
      throw new Error('interpretation.bigThree is required for PDF generation');
    }

    if (!interpretation.planets || !Array.isArray(interpretation.planets)) {
      throw new Error(
        'interpretation.planets is required and must be an array for PDF generation',
      );
    }

    if (!chartData) {
      throw new Error('chartData is required for PDF generation');
    }

    this.logger.log(`Generating PDF for ${userName}`);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Carta Astral - ${userName}`,
            Author: 'Auguria',
            Subject: 'Carta Astral Natal',
            Creator: 'Auguria - Plataforma de Servicios Místicos',
          },
        });

        const chunks: Buffer[] = [];
        let pageCount = 0;

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const filename = this.generateFilename(userName);

          resolve({
            buffer,
            filename,
            pageCount,
          });
        });
        doc.on('error', reject);

        // === PÁGINA 1: PORTADA ===
        pageCount++;
        this.renderCoverPage(doc, input);

        // === PÁGINA 2: GRÁFICO Y TABLAS ===
        doc.addPage();
        pageCount++;
        this.renderChartPage(doc, input);

        // === PÁGINA 3+: BIG THREE ===
        doc.addPage();
        pageCount++;
        const bigThreePages = this.renderBigThreePage(
          doc,
          input.interpretation.bigThree,
        );
        pageCount += bigThreePages;

        // === PÁGINAS DE PLANETAS (Free y Premium) ===
        for (const planet of input.interpretation.planets) {
          doc.addPage();
          pageCount++;
          this.renderPlanetPage(doc, planet);
        }

        // === PÁGINA DE SÍNTESIS IA (Solo Premium) ===
        if (input.isPremium && input.aiSynthesis) {
          doc.addPage();
          pageCount++;
          this.renderSynthesisPage(doc, input.aiSynthesis);
        }

        // === PÁGINA FINAL: DISCLAIMER ===
        doc.addPage();
        pageCount++;
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

  /**
   * Genera el nombre del archivo PDF
   */
  private generateFilename(userName: string): string {
    const sanitizedName = userName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/final

    // Fallback en caso de que el nombre sanitizado quede vacío (por ejemplo, solo caracteres especiales)
    const safeName = sanitizedName || 'usuario';

    const timestamp = Date.now();
    return `carta-astral-${safeName}-${timestamp}.pdf`;
  }

  /**
   * Renderiza la página de portada
   */
  private renderCoverPage(
    doc: typeof PDFDocument,
    input: PDFGenerationInput,
  ): void {
    const { userName, birthDate, birthTime, birthPlace, generatedAt } = input;
    const { bigThree } = input.interpretation;

    // Fondo decorativo
    doc
      .rect(0, 0, doc.page.width, doc.page.height)
      .fill(this.COLORS.background);

    // Logo/Título
    doc
      .fontSize(36)
      .font(this.FONTS.title)
      .fillColor(this.COLORS.primary)
      .text('CARTA ASTRAL', 50, 150, { align: 'center' });

    // Nombre
    doc
      .fontSize(28)
      .fillColor(this.COLORS.secondary)
      .text(userName.toUpperCase(), 50, 220, { align: 'center' });

    // Datos de nacimiento
    doc.fontSize(14).font(this.FONTS.body).fillColor(this.COLORS.text);

    const birthDateStr = birthDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.text(`Nacimiento: ${birthDateStr}`, 50, 320, { align: 'center' });
    doc.text(`Hora: ${birthTime}`, 50, 340, { align: 'center' });
    doc.text(`Lugar: ${birthPlace}`, 50, 360, { align: 'center' });

    // Big Three destacado
    doc.moveDown(3);
    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text('TU BIG THREE', 50, 440, { align: 'center' });

    doc.fontSize(14).font(this.FONTS.body).fillColor(this.COLORS.text);

    const sunName =
      ZodiacSignMetadata[bigThree.sun.sign]?.name || bigThree.sun.sign;
    const moonName =
      ZodiacSignMetadata[bigThree.moon.sign]?.name || bigThree.moon.sign;
    const ascName =
      ZodiacSignMetadata[bigThree.ascendant.sign]?.name ||
      bigThree.ascendant.sign;

    doc.text(`☉ Sol en ${sunName}`, 50, 480, { align: 'center' });
    doc.text(`☽ Luna en ${moonName}`, 50, 500, { align: 'center' });
    doc.text(`↑ Ascendente en ${ascName}`, 50, 520, { align: 'center' });

    // Footer
    doc
      .fontSize(10)
      .fillColor(this.COLORS.muted)
      .text(
        `Generado por Auguria el ${generatedAt.toLocaleDateString('es-ES')}`,
        50,
        doc.page.height - 80,
        {
          align: 'center',
        },
      );
  }

  /**
   * Renderiza la página con gráfico y tablas
   */
  private renderChartPage(
    doc: typeof PDFDocument,
    input: PDFGenerationInput,
  ): void {
    doc
      .fontSize(20)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text('POSICIONES PLANETARIAS', 50, 50);

    // Tabla de planetas
    let y = 100;
    doc.fontSize(12).font(this.FONTS.body).fillColor(this.COLORS.text);

    doc
      .font(this.FONTS.heading)
      .text('Planeta', 60, y)
      .text('Signo', 180, y)
      .text('Casa', 280, y)
      .text('Grado', 350, y);

    y += 20;
    doc.moveTo(50, y).lineTo(545, y).stroke(this.COLORS.muted);
    y += 10;

    // Listar planetas
    for (const planet of input.chartData.planets || []) {
      const planetName =
        PlanetMetadata[planet.planet as Planet]?.name || planet.planet;
      const signName =
        ZodiacSignMetadata[planet.sign as ZodiacSign]?.name || planet.sign;

      doc.font(this.FONTS.body);
      doc.text(planetName, 60, y);
      doc.text(signName, 180, y);
      doc.text(planet.house?.toString() || '-', 280, y);
      doc.text(`${planet.signDegree.toFixed(1)}°`, 350, y);

      y += 20;

      if (y > 700) {
        // Nueva página si es necesario
        doc.addPage();
        y = 50;
      }
    }

    // Distribución de elementos
    y += 30;
    if (y > 650) {
      doc.addPage();
      y = 50;
    }

    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text('DISTRIBUCIÓN DE ELEMENTOS', 50, y);

    y += 30;
    doc.fontSize(12).font(this.FONTS.body).fillColor(this.COLORS.text);

    for (const element of input.interpretation.distribution.elements) {
      doc.text(
        `${element.name}: ${element.count} (${element.percentage.toFixed(1)}%)`,
        60,
        y,
      );
      y += 20;
    }
  }

  /**
   * Renderiza la página del Big Three
   * @returns Número de páginas adicionales creadas (además de la inicial)
   */
  private renderBigThreePage(
    doc: typeof PDFDocument,
    bigThree: BigThreeInterpretation,
  ): number {
    doc
      .fontSize(20)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text('TU BIG THREE', 50, 50);

    let additionalPages = 0;
    const y = 100;

    // Sol
    this.renderBigThreeSection(
      doc,
      '☉ SOL',
      bigThree.sun.signName,
      bigThree.sun.interpretation,
      y,
    );

    doc.addPage();
    additionalPages++;

    // Luna
    this.renderBigThreeSection(
      doc,
      '☽ LUNA',
      bigThree.moon.signName,
      bigThree.moon.interpretation,
      50,
    );

    doc.addPage();
    additionalPages++;

    // Ascendente
    this.renderBigThreeSection(
      doc,
      '↑ ASCENDENTE',
      bigThree.ascendant.signName,
      bigThree.ascendant.interpretation,
      50,
    );

    return additionalPages;
  }

  /**
   * Renderiza una sección del Big Three
   */
  private renderBigThreeSection(
    doc: typeof PDFDocument,
    title: string,
    signName: string,
    interpretation: string,
    y: number,
  ): void {
    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.secondary)
      .text(title, 50, y);

    y += 30;

    doc
      .fontSize(14)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.text)
      .text(`en ${signName}`, 50, y);

    y += 30;

    doc
      .fontSize(12)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.text)
      .text(interpretation, 50, y, {
        width: 495,
        align: 'justify',
      });
  }

  /**
   * Renderiza una página de planeta
   */
  private renderPlanetPage(
    doc: typeof PDFDocument,
    planet: PlanetInterpretation,
  ): void {
    let y = 50;

    // Título del planeta
    doc
      .fontSize(20)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text(`${planet.planetSymbol} ${planet.planetName.toUpperCase()}`, 50, y);

    y += 40;

    doc
      .fontSize(14)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.secondary)
      .text(
        `en ${planet.signName} - Casa ${planet.house}${planet.isRetrograde ? ' (Retrógrado)' : ''}`,
        50,
        y,
      );

    y += 40;

    // Introducción
    if (planet.intro) {
      doc
        .fontSize(12)
        .font(this.FONTS.body)
        .fillColor(this.COLORS.text)
        .text(planet.intro, 50, y, {
          width: 495,
          align: 'justify',
        });

      const currentY = doc.y;
      y = currentY + 20;
    }

    // En signo
    if (planet.inSign) {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      doc
        .fontSize(14)
        .font(this.FONTS.heading)
        .fillColor(this.COLORS.secondary)
        .text(`En ${planet.signName}`, 50, y);

      y += 25;

      doc
        .fontSize(12)
        .font(this.FONTS.body)
        .fillColor(this.COLORS.text)
        .text(planet.inSign, 50, y, {
          width: 495,
          align: 'justify',
        });

      const currentY = doc.y;
      y = currentY + 20;
    }

    // En casa
    if (planet.inHouse) {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      doc
        .fontSize(14)
        .font(this.FONTS.heading)
        .fillColor(this.COLORS.secondary)
        .text(`En Casa ${planet.house}`, 50, y);

      y += 25;

      doc
        .fontSize(12)
        .font(this.FONTS.body)
        .fillColor(this.COLORS.text)
        .text(planet.inHouse, 50, y, {
          width: 495,
          align: 'justify',
        });

      const currentY = doc.y;
      y = currentY + 20;
    }

    // Aspectos
    if (planet.aspects && planet.aspects.length > 0) {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      doc
        .fontSize(14)
        .font(this.FONTS.heading)
        .fillColor(this.COLORS.secondary)
        .text('Aspectos', 50, y);

      y += 25;

      for (const aspect of planet.aspects) {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc
          .fontSize(11)
          .font(this.FONTS.heading)
          .fillColor(this.COLORS.text)
          .text(
            `${aspect.aspectSymbol} ${aspect.aspectName} con ${aspect.planet2}`,
            60,
            y,
          );

        y += 20;

        if (aspect.interpretation) {
          doc
            .fontSize(11)
            .font(this.FONTS.body)
            .fillColor(this.COLORS.text)
            .text(aspect.interpretation, 60, y, {
              width: 485,
              align: 'justify',
            });

          const currentY = doc.y;
          y = currentY + 15;
        }
      }
    }
  }

  /**
   * Renderiza la página de síntesis IA
   */
  private renderSynthesisPage(
    doc: typeof PDFDocument,
    aiSynthesis: string,
  ): void {
    doc
      .fontSize(20)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text('SÍNTESIS PERSONALIZADA', 50, 50);

    doc
      .fontSize(10)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.muted)
      .text('Análisis generado por Inteligencia Artificial', 50, 80, {
        align: 'center',
      });

    doc
      .fontSize(12)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.text)
      .text(aiSynthesis, 50, 120, {
        width: 495,
        align: 'justify',
      });
  }

  /**
   * Renderiza la página de disclaimer
   */
  private renderDisclaimerPage(doc: typeof PDFDocument): void {
    doc
      .fontSize(16)
      .font(this.FONTS.heading)
      .fillColor(this.COLORS.primary)
      .text('AVISO IMPORTANTE', 50, 50);

    const disclaimer = `Este documento contiene una interpretación astrológica basada en las posiciones planetarias al momento de tu nacimiento. La astrología es una herramienta de autoconocimiento y reflexión, no una ciencia exacta.

Las interpretaciones aquí presentadas son de carácter general y pueden no aplicarse completamente a cada individuo. Te recomendamos utilizar esta información como una guía para el autoconocimiento y el crecimiento personal, no como verdades absolutas.

Auguria no se hace responsable de las decisiones tomadas basándose en la información contenida en este documento. Para cuestiones importantes de salud, finanzas o relaciones, consulta siempre con profesionales calificados en esas áreas.

Este documento es generado automáticamente por el sistema de Auguria y está destinado únicamente para uso personal. Queda prohibida su reproducción total o parcial sin autorización.

© ${new Date().getFullYear()} Auguria - Todos los derechos reservados.`;

    doc
      .fontSize(10)
      .font(this.FONTS.body)
      .fillColor(this.COLORS.text)
      .text(disclaimer, 50, 100, {
        width: 495,
        align: 'justify',
      });
  }
}
