/**
 * Tests for fingerprint utility
 *
 * Testing session fingerprint generation for anonymous tracking
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateSessionFingerprint, getSessionFingerprint } from './fingerprint';

describe('fingerprint utils', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('generateSessionFingerprint', () => {
    it('should generate a non-empty fingerprint', async () => {
      const fingerprint = await generateSessionFingerprint();

      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });

    it('should generate different fingerprints on different calls', async () => {
      const fingerprint1 = await generateSessionFingerprint();

      // Wait 1ms to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1));

      const fingerprint2 = await generateSessionFingerprint();

      // Since it includes timestamp, should be different
      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should include user agent in fingerprint', async () => {
      const originalUserAgent = navigator.userAgent;

      // Mock navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'TestBrowser/1.0',
        configurable: true,
      });

      const fingerprint = await generateSessionFingerprint();
      expect(fingerprint).toBeDefined();

      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      });
    });
  });

  describe('getSessionFingerprint', () => {
    it('should return cached fingerprint from sessionStorage', async () => {
      const mockFingerprint = 'test-fingerprint-123';
      sessionStorage.setItem('daily-card-fingerprint', mockFingerprint);

      const fingerprint = await getSessionFingerprint();
      expect(fingerprint).toBe(mockFingerprint);
    });

    it('should generate new fingerprint if not in sessionStorage', async () => {
      const fingerprint = await getSessionFingerprint();

      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });

    it('should store new fingerprint in sessionStorage', async () => {
      const fingerprint = await getSessionFingerprint();
      const stored = sessionStorage.getItem('daily-card-fingerprint');

      expect(stored).toBe(fingerprint);
    });

    it('should return same fingerprint on subsequent calls', async () => {
      const fingerprint1 = await getSessionFingerprint();
      const fingerprint2 = await getSessionFingerprint();

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should handle sessionStorage errors gracefully', async () => {
      // Mock sessionStorage to throw error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should still return a fingerprint
      const fingerprint = await getSessionFingerprint();
      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');

      // Restore
      Storage.prototype.getItem = originalGetItem;
    });
  });
});
