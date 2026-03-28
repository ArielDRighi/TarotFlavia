/**
 * Conversion Components and Hooks
 *
 * Componentes y hooks para CTAs de conversión (funnels)
 * que convierten usuarios ANONYMOUS → FREE → PREMIUM
 */

// Components
export { default as RegisterCTAModal } from './RegisterCTAModal';
export { default as LimitReachedModal } from './LimitReachedModal';
export { default as PremiumPreview } from './PremiumPreview';
export { default as PremiumUpgradePrompt } from './PremiumUpgradePrompt';

// Types
export type { RegisterCTAModalProps } from './RegisterCTAModal';
export type { LimitReachedModalProps } from './LimitReachedModal';
export type { PremiumPreviewProps } from './PremiumPreview';
export type {
  PremiumUpgradePromptProps,
  PremiumUpgradeVariant,
  PremiumUpgradeTrigger,
} from './PremiumUpgradePrompt';
