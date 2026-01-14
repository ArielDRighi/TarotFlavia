/**
 * Re-export utilities from utils/ folder
 * This file exists for shadcn/ui compatibility and as the main entry point
 * The actual implementations with tests are in utils/*.ts
 */
export { cn } from './utils/cn';
export { formatDate, formatRelativeTime, formatPrice, truncateText } from './utils/format';
export { getSessionFingerprint } from './utils/fingerprint';
export {
  parseDateString,
  formatDateFull,
  formatDateFullWithYear,
  formatDateShort,
  formatDateCompact,
  formatDateLocalized,
} from './utils/date';
