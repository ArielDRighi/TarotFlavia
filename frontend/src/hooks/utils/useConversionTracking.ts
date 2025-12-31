'use client';

import { useCallback } from 'react';

/**
 * CTA Location Types
 */
export type CTALocation =
  | 'post_reading'
  | 'limit_reached'
  | 'history_page'
  | 'dashboard'
  | 'reading_result';

/**
 * CTA Action Types
 */
export type CTAAction = 'upgrade' | 'register' | 'dismiss';

/**
 * Maximum number of times a user can dismiss a CTA before it stops showing.
 * 
 * UX Decision: 3 strikes balances visibility with avoiding user annoyance.
 * This prevents CTA fatigue while giving users multiple opportunities to engage.
 * 
 * If per-location thresholds are needed in the future, this can be refactored
 * into a configuration map: Record<CTALocation, number>
 */
const MAX_DISMISSAL_COUNT = 3;

/**
 * Helper to safely check if localStorage is available
 * Handles SSR and environments where localStorage might be undefined
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Return type for useConversionTracking hook
 */
export interface UseConversionTrackingReturn {
  /** Track when a CTA is shown */
  trackCTAShown: (location: CTALocation, plan: string) => void;
  /** Track when a CTA is clicked */
  trackCTAClicked: (location: CTALocation, action: CTAAction) => void;
  /** Track when a modal is opened */
  trackModalOpen: (modalName: string) => void;
  /** Track upgrade intent */
  trackUpgradeIntent: (source: string) => void;
  /** Dismiss a CTA (increment count) */
  dismissCTA: (location: CTALocation) => void;
  /** Check if CTA was dismissed 3+ times */
  wasCTADismissed: (location: CTALocation) => boolean;
  /** Get dismissal count */
  getDismissalCount: (location: CTALocation) => number;
}

/**
 * useConversionTracking Hook
 *
 * Custom hook para tracking de eventos de conversión (CTAs, modales, upgrades).
 * Usa localStorage para persistir contadores de dismissals y prevenir spam.
 *
 * En producción, estos eventos pueden integrarse con:
 * - Google Analytics 4
 * - Mixpanel
 * - Amplitude
 * - Meta Pixel
 *
 * @example
 * ```tsx
 * const tracking = useConversionTracking();
 *
 * // Track CTA shown
 * tracking.trackCTAShown('post_reading', 'free');
 *
 * // Track CTA clicked
 * tracking.trackCTAClicked('post_reading', 'upgrade');
 *
 * // Check if user dismissed CTA too many times
 * if (!tracking.wasCTADismissed('post_reading')) {
 *   setShowModal(true);
 * }
 * ```
 */
export default function useConversionTracking(): UseConversionTrackingReturn {
  /**
   * Track CTA shown event
   * 
   * @param location - Where the CTA was shown
   * @param _plan - User plan (reserved for future Google Analytics integration)
   */
  const trackCTAShown = useCallback((location: CTALocation, _plan: string) => {
    if (!isLocalStorageAvailable()) return;

    const timestamp = new Date().toISOString();
    localStorage.setItem(`cta_shown_${location}`, timestamp);

    // Integration point for analytics
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', 'cta_shown', { location, plan: _plan });
    }
  }, []);

  /**
   * Track CTA clicked event
   * 
   * @param location - Where the CTA was clicked
   * @param _action - Action taken (reserved for future Google Analytics integration)
   */
  const trackCTAClicked = useCallback((location: CTALocation, _action: CTAAction) => {
    if (!isLocalStorageAvailable()) return;

    const timestamp = new Date().toISOString();
    localStorage.setItem(`cta_clicked_${location}`, timestamp);

    // Integration point for analytics
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', 'cta_clicked', { location, action: _action });
    }
  }, []);

  /**
   * Track modal open event
   */
  const trackModalOpen = useCallback((modalName: string) => {
    if (!isLocalStorageAvailable()) return;

    const timestamp = new Date().toISOString();
    localStorage.setItem(`modal_open_${modalName}`, timestamp);

    // Integration point for analytics
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', 'modal_open', { modal_name: modalName });
    }
  }, []);

  /**
   * Track upgrade intent (user clicked upgrade button)
   */
  const trackUpgradeIntent = useCallback((source: string) => {
    if (!isLocalStorageAvailable()) return;

    const timestamp = new Date().toISOString();
    localStorage.setItem(`upgrade_intent_${source}`, timestamp);

    // Integration point for analytics
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', 'upgrade_intent', { source });
    }
  }, []);

  /**
   * Dismiss CTA (increment dismissal count)
   */
  const dismissCTA = useCallback((location: CTALocation) => {
    if (!isLocalStorageAvailable()) return;

    const key = `cta_dismissed_${location}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(current + 1));
  }, []);

  /**
   * Check if CTA was dismissed MAX_DISMISSAL_COUNT or more times
   */
  const wasCTADismissed = useCallback((location: CTALocation): boolean => {
    if (!isLocalStorageAvailable()) return false;

    const key = `cta_dismissed_${location}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    return count >= MAX_DISMISSAL_COUNT;
  }, []);

  /**
   * Get dismissal count for a CTA
   */
  const getDismissalCount = useCallback((location: CTALocation): number => {
    if (!isLocalStorageAvailable()) return 0;

    const key = `cta_dismissed_${location}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  }, []);

  return {
    trackCTAShown,
    trackCTAClicked,
    trackModalOpen,
    trackUpgradeIntent,
    dismissCTA,
    wasCTADismissed,
    getDismissalCount,
  };
}
