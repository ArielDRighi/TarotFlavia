'use client';

import { useEffect, useState } from 'react';
import { getLocalDateString } from '@/lib/utils/date';

/**
 * Returns the visitor's LOCAL calendar date as 'YYYY-MM-DD' and re-renders the
 * consumer automatically when the local midnight is crossed.
 *
 * Used to roll daily content (e.g. the western horoscope) at the visitor's local
 * midnight instead of the UTC boundary (which falls at 21:00 in UTC-3). Because
 * the returned string is meant to be part of a React Query key, the state update
 * at midnight changes the key and triggers a fresh fetch for the new day without
 * a manual page refresh.
 *
 * @returns Local calendar date, e.g. '2026-07-25'
 */
export function useLocalToday(): string {
  const [today, setToday] = useState<string>(() => getLocalDateString());

  useEffect(() => {
    const now = new Date();
    // Next local midnight + 2s margin so we're safely into the new day.
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      setToday(getLocalDateString());
    }, msUntilMidnight);

    return () => clearTimeout(timer);
    // Re-run after each rollover to schedule the following midnight.
  }, [today]);

  return today;
}
