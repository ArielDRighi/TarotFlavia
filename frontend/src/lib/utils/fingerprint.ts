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
 * @returns {string} A unique fingerprint string
 */
export function generateSessionFingerprint(): string {
  const userAgent = navigator.userAgent;
  const timestamp = Date.now();

  // Combine user agent with timestamp for uniqueness
  // Using base64 encoding for a consistent string format
  const rawFingerprint = `${userAgent}-${timestamp}`;

  // Use btoa for simple encoding (works in all browsers)
  // In production, could use crypto.subtle.digest for SHA-256 hash
  const fingerprint = btoa(rawFingerprint)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return fingerprint;
}

/**
 * Get session fingerprint from storage or generate new one
 * Ensures the same fingerprint is used throughout the session
 *
 * @returns {string} The session fingerprint
 */
export function getSessionFingerprint(): string {
  try {
    // Try to get existing fingerprint from sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      return stored;
    }

    // Generate new fingerprint if not found
    const newFingerprint = generateSessionFingerprint();
    sessionStorage.setItem(STORAGE_KEY, newFingerprint);

    return newFingerprint;
  } catch {
    // If sessionStorage fails (private mode, etc.), generate without storing
    return generateSessionFingerprint();
  }
}
