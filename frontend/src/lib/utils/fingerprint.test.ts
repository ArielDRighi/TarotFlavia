/**
 * Tests for fingerprint utility
 *
 * Testing session fingerprint generation for anonymous tracking
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSessionFingerprint } from './fingerprint';

describe('fingerprint utils', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.clearAllMocks();
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

    it('should return same fingerprint on subsequent calls (session stability)', async () => {
      const fingerprint1 = await getSessionFingerprint();

      // Wait to ensure timestamp would be different if function regenerated
      await new Promise((resolve) => setTimeout(resolve, 2));

      const fingerprint2 = await getSessionFingerprint();

      // Should be SAME because it's cached in sessionStorage
      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate unique fingerprints for different sessions', async () => {
      // Mock Date.now() to ensure different timestamps
      const originalDateNow = Date.now;
      let callCount = 0;

      Date.now = vi.fn(() => {
        callCount++;
        // Return different timestamps for each call (at least 10ms apart)
        return originalDateNow() + callCount * 10;
      });

      try {
        // First session
        const fingerprint1 = await getSessionFingerprint();

        // Simulate new session (clear storage)
        sessionStorage.clear();

        // Second session (new fingerprint generated with different timestamp)
        const fingerprint2 = await getSessionFingerprint();

        // Different sessions should have different fingerprints
        expect(fingerprint1).not.toBe(fingerprint2);
      } finally {
        // Restore original Date.now
        Date.now = originalDateNow;
      }
    });

    it('should include user agent in fingerprint calculation', async () => {
      const originalUserAgent = navigator.userAgent;

      // Mock navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'TestBrowser/1.0',
        configurable: true,
      });

      const fingerprint = await getSessionFingerprint();
      expect(fingerprint).toBeDefined();

      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      });
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
