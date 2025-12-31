import { describe, it, expect } from 'vitest';
import { Metadata } from 'next';

/**
 * Metadata Tests for Page Components
 *
 * These tests verify that each page exports the correct metadata configuration.
 * We don't test the actual React components, only that metadata is properly exported.
 */

describe('Page Metadata Exports', () => {
  describe('Static Pages', () => {
    // HomePage is now a 'use client' component with dual logic (TASK-017)
    // Metadata is handled in root layout.tsx instead
    // it('home page should export homeMetadata', async () => {
    //   const homePage = await import('@/app/page');
    //   expect(homePage.metadata).toBeDefined();
    //   expect((homePage.metadata as Metadata).title).toBe('Tu guía espiritual');
    // });

    it('login page should export loginMetadata', async () => {
      const loginPage = await import('@/app/login/page');
      expect(loginPage.metadata).toBeDefined();
      expect((loginPage.metadata as Metadata).title).toBe('Iniciar Sesión');
      expect((loginPage.metadata as Metadata).robots).toEqual({
        index: false,
        follow: true,
      });
    });

    it('register page should export registerMetadata', async () => {
      const registerPage = await import('@/app/registro/page');
      expect(registerPage.metadata).toBeDefined();
      expect((registerPage.metadata as Metadata).title).toBe('Crear Cuenta');
      expect((registerPage.metadata as Metadata).robots).toEqual({
        index: false,
        follow: true,
      });
    });
  });

  describe('Layout Metadata', () => {
    it('ritual layout should export ritualMetadata', async () => {
      const ritualLayout = await import('@/app/ritual/layout');
      expect(ritualLayout.metadata).toBeDefined();
      expect((ritualLayout.metadata as Metadata).title).toBe('Nueva Lectura de Tarot');
    });

    it('historial layout should export historialMetadata', async () => {
      const historialLayout = await import('@/app/historial/layout');
      expect(historialLayout.metadata).toBeDefined();
      expect((historialLayout.metadata as Metadata).title).toBe('Mis Lecturas');
      expect((historialLayout.metadata as Metadata).robots).toEqual({
        index: false,
        follow: true,
      });
    });

    it('carta-del-dia layout should export cartaDelDiaMetadata', async () => {
      const cartaDelDiaLayout = await import('@/app/carta-del-dia/layout');
      expect(cartaDelDiaLayout.metadata).toBeDefined();
      expect((cartaDelDiaLayout.metadata as Metadata).title).toBe('Carta del Día');
    });

    it('explorar layout should export explorarMetadata', async () => {
      const explorarLayout = await import('@/app/explorar/layout');
      expect(explorarLayout.metadata).toBeDefined();
      expect((explorarLayout.metadata as Metadata).title).toBe('Explorar Tarotistas');
    });

    it('perfil layout should export perfilMetadata', async () => {
      const perfilLayout = await import('@/app/perfil/layout');
      expect(perfilLayout.metadata).toBeDefined();
      expect((perfilLayout.metadata as Metadata).title).toBe('Mi Perfil');
      expect((perfilLayout.metadata as Metadata).robots).toEqual({
        index: false,
        follow: true,
      });
    });
  });

  describe('Dynamic Pages', () => {
    it('tarotista profile page should export generateMetadata function', async () => {
      const tarotistaPage = await import('@/app/tarotistas/[id]/page');
      expect(tarotistaPage.generateMetadata).toBeDefined();
      expect(typeof tarotistaPage.generateMetadata).toBe('function');
    });

    it('shared reading page should export generateMetadata function', async () => {
      const sharedPage = await import('@/app/compartida/[token]/page');
      expect(sharedPage.generateMetadata).toBeDefined();
      expect(typeof sharedPage.generateMetadata).toBe('function');
    }, 30000); // Timeout aumentado para imports lentos
  });
});
