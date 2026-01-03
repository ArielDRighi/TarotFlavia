/**
 * Fingerprint utility for anonymous session tracking
 *
 * Generates and manages unique fingerprints for anonymous users
 * to track daily card access without authentication.
 */

const STORAGE_KEY = 'daily-card-fingerprint';

/**
 * Generate a session fingerprint based on User Agent + timestamp
 * This creates a unique identifier per session that is reasonably difficult to bypass
 * while maintaining simplicity.
 *
 * Uses Web Crypto API for SHA-256 hashing when available, falls back to simple hash.
 *
 * @returns {Promise<string>} A unique hexadecimal fingerprint string
 */
export async function generateSessionFingerprint(): Promise<string> {
  const userAgent = navigator.userAgent;
  const timestamp = Date.now();

  // Combine user agent with timestamp for uniqueness
  const rawFingerprint = `${userAgent}-${timestamp}`;

  try {
    // Use Web Crypto API for SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(rawFingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return hexHash; // Returns 64-char hex string
  } catch (error) {
    // Fallback: simple hash function if crypto.subtle is not available
    // This generates a hex string of ~40 characters
    let hash = 0;
    for (let i = 0; i < rawFingerprint.length; i++) {
      const char = rawFingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to hex and pad to ensure minimum 32 chars
    const hexHash = Math.abs(hash).toString(16).padStart(32, '0');
    return hexHash + timestamp.toString(16).padStart(12, '0'); // ~44 chars total
  }
}

/**
 * Get session fingerprint from storage or generate new one
 * Ensures the same fingerprint is used throughout the session
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

    // Generate new fingerprint if not found
    const newFingerprint = await generateSessionFingerprint();
    sessionStorage.setItem(STORAGE_KEY, newFingerprint);

    return newFingerprint;
  } catch {
    // If sessionStorage fails (private mode, etc.), generate without storing
    return generateSessionFingerprint();
  }
}
