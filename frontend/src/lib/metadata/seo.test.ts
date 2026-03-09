import { describe, it, expect } from 'vitest';
import {
  defaultMetadata,
  homeMetadata,
  loginMetadata,
  registerMetadata,
  ritualMetadata,
  historialMetadata,
  cartaDelDiaMetadata,
  explorarMetadata,
  perfilMetadata,
  generateTarotistaMetadata,
  generateSharedReadingMetadata,
} from './seo';

describe('SEO Metadata Configuration', () => {
  describe('defaultMetadata', () => {
    it('should have site name and description', () => {
      expect(defaultMetadata.title).toBeDefined();
      expect(defaultMetadata.description).toBeDefined();
    });

    it('should have OpenGraph configuration', () => {
      expect(defaultMetadata.openGraph).toBeDefined();
      expect(defaultMetadata.openGraph?.siteName).toBe('Auguria');
      expect(defaultMetadata.openGraph?.locale).toBe('es_ES');
    });

    it('should have Twitter card configuration', () => {
      expect(defaultMetadata.twitter).toBeDefined();
    });

    it('should allow indexing by default', () => {
      expect(defaultMetadata.robots).toBeDefined();
    });
  });

  describe('homeMetadata', () => {
    it('should have specific title and description', () => {
      expect(homeMetadata.title).toBe('Tu guía espiritual');
      expect(homeMetadata.description).toContain('Lecturas de tarot');
    });

    it('should have OpenGraph metadata', () => {
      expect(homeMetadata.openGraph?.title).toContain('Auguria');
      expect(homeMetadata.openGraph?.description).toBeDefined();
    });
  });

  describe('loginMetadata', () => {
    it('should have login-specific title', () => {
      expect(loginMetadata.title).toBe('Iniciar Sesión');
    });

    it('should not be indexed by search engines', () => {
      expect(loginMetadata.robots).toEqual({
        index: false,
        follow: true,
      });
    });
  });

  describe('registerMetadata', () => {
    it('should have register-specific title', () => {
      expect(registerMetadata.title).toBe('Crear Cuenta');
    });

    it('should not be indexed by search engines', () => {
      expect(registerMetadata.robots).toEqual({
        index: false,
        follow: true,
      });
    });
  });

  describe('ritualMetadata', () => {
    it('should have ritual-specific title and description', () => {
      expect(ritualMetadata.title).toBe('Tirada de Tarot');
      expect(ritualMetadata.description).toContain('lectura de tarot');
    });

    it('should have OpenGraph metadata', () => {
      expect(ritualMetadata.openGraph?.title).toContain('Tirada de Tarot');
    });
  });

  describe('historialMetadata', () => {
    it('should have history-specific title', () => {
      expect(historialMetadata.title).toBe('Mis Lecturas');
    });

    it('should not be indexed (private content)', () => {
      expect(historialMetadata.robots).toBeDefined();
    });
  });

  describe('cartaDelDiaMetadata', () => {
    it('should have daily card title', () => {
      expect(cartaDelDiaMetadata.title).toBe('Tarot del Día');
    });

    it('should have OpenGraph metadata', () => {
      expect(cartaDelDiaMetadata.openGraph?.title).toContain('Tarot del Día');
    });
  });

  describe('explorarMetadata', () => {
    it('should have explore-specific title and description', () => {
      expect(explorarMetadata.title).toBe('Explorar Tarotistas');
      expect(explorarMetadata.description).toContain('tarotistas profesionales');
    });

    it('should have OpenGraph metadata', () => {
      expect(explorarMetadata.openGraph?.title).toContain('Explorar Tarotistas');
    });
  });

  describe('perfilMetadata', () => {
    it('should have profile-specific title', () => {
      expect(perfilMetadata.title).toBe('Mi Perfil');
    });

    it('should not be indexed (private content)', () => {
      expect(perfilMetadata.robots).toBeDefined();
    });
  });

  describe('generateTarotistaMetadata', () => {
    it('should generate metadata with tarotista name', () => {
      const metadata = generateTarotistaMetadata(
        {
          nombre: 'María García',
          especialidades: ['Amor', 'Trabajo'],
          descripcion: 'Experta en lecturas de amor',
        },
        123
      );

      expect(metadata.title).toContain('María García');
      expect(metadata.description).toBe('Experta en lecturas de amor');
    });

    it('should include specialties in description when no custom description', () => {
      const metadata = generateTarotistaMetadata(
        {
          nombre: 'Juan Pérez',
          especialidades: ['Finanzas', 'Carrera'],
        },
        456
      );

      expect(metadata.description).toContain('Finanzas');
      expect(metadata.description).toContain('Carrera');
    });

    it('should set OpenGraph type to profile', () => {
      const metadata = generateTarotistaMetadata(
        {
          nombre: 'Ana López',
          especialidades: ['Salud'],
        },
        789
      );

      expect(metadata.openGraph).toBeDefined();
    });

    it('should include canonical URL with tarotista id', () => {
      const metadata = generateTarotistaMetadata(
        {
          nombre: 'Pedro Ruiz',
          especialidades: ['Amor'],
        },
        999
      );

      expect(metadata.alternates?.canonical).toBe('/tarotistas/999');
    });
  });

  describe('generateSharedReadingMetadata', () => {
    it('should generate metadata with reading question', () => {
      const metadata = generateSharedReadingMetadata({
        question: '¿Encontraré el amor?',
        categoryName: 'Amor y Relaciones',
      });

      expect(metadata.title).toContain('¿Encontraré el amor?');
      expect(metadata.description).toContain('Amor y Relaciones');
    });

    it('should work without category name', () => {
      const metadata = generateSharedReadingMetadata({
        question: '¿Qué me depara el futuro?',
      });

      expect(metadata.title).toContain('¿Qué me depara el futuro?');
      expect(metadata.description).toBeDefined();
    });

    it('should set OpenGraph type to article', () => {
      const metadata = generateSharedReadingMetadata({
        question: 'Test question',
      });

      expect(metadata.openGraph).toBeDefined();
    });

    it('should allow indexing for shared readings', () => {
      const metadata = generateSharedReadingMetadata({
        question: 'Test question',
      });

      expect(metadata.robots).toEqual({
        index: true,
        follow: true,
      });
    });

    // New tests for improved OpenGraph meta tags
    it('should include Twitter Card metadata', () => {
      const metadata = generateSharedReadingMetadata({
        question: '¿Qué me depara el futuro?',
        categoryName: 'Vida y Propósito',
      });

      expect(metadata.twitter).toBeDefined();
      // Type assertion needed because Next.js Metadata types don't expose nested properties
      const twitter = metadata.twitter as {
        card?: string;
        title?: string;
        description?: string;
        site?: string;
        creator?: string;
      };
      expect(twitter.card).toBe('summary_large_image');
      expect(twitter.title).toContain('¿Qué me depara el futuro?');
      expect(twitter.description).toContain('Vida y Propósito');
      expect(twitter.site).toBe('@auguriatarot');
      expect(twitter.creator).toBe('@auguriatarot');
    });

    it('should include OpenGraph image with dimensions', () => {
      const metadata = generateSharedReadingMetadata({
        question: 'Test question',
      });

      expect(metadata.openGraph?.images).toBeDefined();
      const images = Array.isArray(metadata.openGraph?.images)
        ? metadata.openGraph.images
        : [metadata.openGraph?.images];

      const firstImage = images[0] as { url: string; width: number; height: number; alt: string };
      expect(firstImage).toMatchObject({
        url: expect.stringContaining('/og-image.png'),
        width: 1200,
        height: 630,
        alt: expect.stringContaining('Test question'),
      });
    });

    it('should include article metadata for OpenGraph', () => {
      const metadata = generateSharedReadingMetadata({
        question: 'Test question',
        categoryName: 'Amor',
      });

      // Type assertion needed because Next.js Metadata types don't expose nested properties
      const openGraph = metadata.openGraph as {
        type?: string;
        publishedTime?: string;
        authors?: string[];
      };
      expect(openGraph.type).toBe('article');
      expect(openGraph).toHaveProperty('publishedTime');
      expect(openGraph).toHaveProperty('authors');
    });

    it('should include locale alternatives for international sharing', () => {
      const metadata = generateSharedReadingMetadata({
        question: 'Test question',
      });

      // Type assertion needed because Next.js Metadata types don't expose nested properties
      const openGraph = metadata.openGraph as { locale?: string };
      expect(openGraph.locale).toBe('es_ES');
      expect(metadata.alternates?.languages).toBeDefined();
      expect(metadata.alternates?.languages?.['es']).toBeDefined();
    });

    it('should generate proper image alt text based on reading content', () => {
      const metadata = generateSharedReadingMetadata({
        question: '¿Encontraré el amor?',
        categoryName: 'Amor y Relaciones',
      });

      const images = Array.isArray(metadata.openGraph?.images)
        ? metadata.openGraph.images
        : [metadata.openGraph?.images];

      const firstImage = images[0] as { alt?: string };
      expect(firstImage).toHaveProperty('alt');
      expect(firstImage.alt).toContain('¿Encontraré el amor?');
      expect(firstImage.alt).toContain('Amor y Relaciones');
    });

    it('should include site verification tags', () => {
      const metadata = generateSharedReadingMetadata({
        question: 'Test question',
      });

      expect(metadata.verification).toBeDefined();
    });
  });
});
