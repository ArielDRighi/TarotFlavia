/**
 * Device detection utilities
 */

/**
 * Detect if user is on a mobile device
 * Only use Web Share API on actual mobile devices where it shows useful apps (WhatsApp, etc.)
 * On desktop Windows, the share dialog only shows Microsoft Store apps which is not useful
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for touch capability + small screen (mobile/tablet)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  // Also check user agent for mobile keywords
  // NOTE: This regex is intentionally limited to well-known mobile devices.
  // While it may not detect new/emerging devices, it's sufficient for our use case
  // (showing Web Share API only on proven mobile platforms with useful share targets).
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(navigator.userAgent);

  return isMobileUA || (hasTouch && isSmallScreen);
}

/**
 * Check if Web Share API should be used
 * Returns true only on mobile devices where native share shows useful apps
 */
export function shouldUseNativeShare(): boolean {
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
  return hasNativeShare && isMobileDevice();
}
