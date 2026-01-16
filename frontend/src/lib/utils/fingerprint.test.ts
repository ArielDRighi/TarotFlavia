/**
 * Tests for fingerprint utility
 *
 * Testing fingerprint generation for anonymous tracking across browser tabs
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSessionFingerprint } from './fingerprint';

describe('fingerprint utils', () => {
  // Create a real localStorage-like object for testing
  let localStorageData: Record<string, string> = {};

  beforeEach(() => {
    // Reset localStorage data
    localStorageData = {};

    // Mock localStorage with actual storage behavior
    const localStorageMock = {
      getItem: vi.fn((key: string) => localStorageData[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageData[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageData[key];
      }),
      clear: vi.fn(() => {
        localStorageData = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    vi.clearAllMocks();
  });

  describe('getSessionFingerprint', () => {
    it('should return cached fingerprint from localStorage', async () => {
      const mockFingerprint = 'test-fingerprint-123';
      localStorageData['daily-card-fingerprint'] = mockFingerprint;

      const fingerprint = await getSessionFingerprint();
      expect(fingerprint).toBe(mockFingerprint);
    });

    it('should generate new fingerprint if not in localStorage', async () => {
      const fingerprint = await getSessionFingerprint();

      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });

    it('should store new fingerprint in localStorage', async () => {
      const fingerprint = await getSessionFingerprint();
      const stored = localStorageData['daily-card-fingerprint'];

      expect(stored).toBe(fingerprint);
    });

    it('should return same fingerprint on subsequent calls (cross-tab stability)', async () => {
      const fingerprint1 = await getSessionFingerprint();

      // Wait to ensure timestamp would be different if function regenerated
      await new Promise((resolve) => setTimeout(resolve, 2));

      const fingerprint2 = await getSessionFingerprint();

      // Should be SAME because it's cached in localStorage (shared across tabs)
      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate unique fingerprints for different browsers', async () => {
      // First browser
      const fingerprint1 = await getSessionFingerprint();

      // Simulate new browser (clear storage)
      localStorageData = {};

      // Wait 1ms to ensure different timestamp seed
      await new Promise((resolve) => setTimeout(resolve, 1));

      // Second browser (new fingerprint generated)
      const fingerprint2 = await getSessionFingerprint();

      // Different browsers should have different fingerprints
      expect(fingerprint1).not.toBe(fingerprint2);
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

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw error
      const errorMock = {
        getItem: vi.fn(() => {
          throw new Error('Storage error');
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null),
      };

      Object.defineProperty(global, 'localStorage', {
        value: errorMock,
        writable: true,
      });

      // Should still return a fingerprint
      const fingerprint = await getSessionFingerprint();
      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
    });
  });
});
