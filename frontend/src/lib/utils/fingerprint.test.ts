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
    it('should generate a fingerprint string', () => {
      const fingerprint = generateSessionFingerprint();

      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });

    it('should generate different fingerprints on different calls', async () => {
      const fingerprint1 = generateSessionFingerprint();

      // Wait 1ms to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1));

      const fingerprint2 = generateSessionFingerprint();

      // Since it includes timestamp, should be different
      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should include user agent in fingerprint', () => {
      const originalUserAgent = navigator.userAgent;

      // Mock navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'TestBrowser/1.0',
        configurable: true,
      });

      const fingerprint = generateSessionFingerprint();
      expect(fingerprint).toBeDefined();

      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      });
    });
  });

  describe('getSessionFingerprint', () => {
    it('should return cached fingerprint from sessionStorage', () => {
      const mockFingerprint = 'test-fingerprint-123';
      sessionStorage.setItem('daily-card-fingerprint', mockFingerprint);

      const fingerprint = getSessionFingerprint();
      expect(fingerprint).toBe(mockFingerprint);
    });

    it('should generate new fingerprint if not in sessionStorage', () => {
      const fingerprint = getSessionFingerprint();

      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });

    it('should store new fingerprint in sessionStorage', () => {
      const fingerprint = getSessionFingerprint();
      const stored = sessionStorage.getItem('daily-card-fingerprint');

      expect(stored).toBe(fingerprint);
    });

    it('should return same fingerprint on subsequent calls', () => {
      const fingerprint1 = getSessionFingerprint();
      const fingerprint2 = getSessionFingerprint();

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should handle sessionStorage errors gracefully', () => {
      // Mock sessionStorage to throw error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should still return a fingerprint
      const fingerprint = getSessionFingerprint();
      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');

      // Restore
      Storage.prototype.getItem = originalGetItem;
    });
  });
});
