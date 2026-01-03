/**
 * Fingerprint utility for anonymous session tracking
 *
 * Generates and manages unique fingerprints for anonymous users
 * to track daily card access without authentication.
 */

const STORAGE_KEY = 'daily-card-fingerprint';

/**
 * Internal: Generate a stable browser fingerprint + session timestamp
 * This creates a unique identifier per browser session that persists for the session.
 * Uses stable browser characteristics (User Agent) combined with a timestamp that's
 * generated only once per session (via getSessionFingerprint).
 *
 * NOTE: This function is internal. Use getSessionFingerprint() instead, which ensures
 * the same fingerprint is used throughout the session by caching in sessionStorage.
 *
 * Uses Web Crypto API for SHA-256 hashing when available, falls back to simple hash.
 *
 * @param timestampSeed - Timestamp to mix into fingerprint (for per-session uniqueness)
 * @returns {Promise<string>} A unique hexadecimal fingerprint string
 */
async function generateFingerprintWithSeed(timestampSeed: number): Promise<string> {
  const userAgent = navigator.userAgent;

  // Combine user agent with timestamp seed for uniqueness
  const rawFingerprint = `${userAgent}-${timestampSeed}`;

  try {
    // Use Web Crypto API for SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(rawFingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return hexHash; // Returns 64-char hex string
  } catch {
    // Fallback: simple hash function if crypto.subtle is not available
    let hash = 0;
    for (let i = 0; i < rawFingerprint.length; i++) {
      const char = rawFingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to hex and pad to ensure minimum 32 chars
    const hexHash = Math.abs(hash).toString(16).padStart(32, '0');
    return hexHash + timestampSeed.toString(16).padStart(12, '0'); // ~44 chars total
  }
}

/**
 * Get session fingerprint from storage or generate new one
 * Ensures the same fingerprint is used throughout the session.
 *
 * This is the PUBLIC API - always use this function instead of calling
 * generateFingerprintWithSeed directly.
 *
 * @returns {Promise<string>} The session fingerprint
 */
export async function getSessionFingerprint(): Promise<string> {
  try {
    // Try to get existing fingerprint from sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      return stored;
    }

    // Generate new fingerprint with current timestamp (only once per session)
    const newFingerprint = await generateFingerprintWithSeed(Date.now());
    sessionStorage.setItem(STORAGE_KEY, newFingerprint);

    return newFingerprint;
  } catch {
    // If sessionStorage fails (private mode, etc.), generate without storing
    // This means each call will generate a different fingerprint in private mode
    return generateFingerprintWithSeed(Date.now());
  }
}
