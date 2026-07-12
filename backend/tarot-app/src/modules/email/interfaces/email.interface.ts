export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

export interface WelcomeEmailData {
  userName: string;
  email: string;
}

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
}

export interface PlanChangeData {
  userName: string;
  oldPlan: string;
  newPlan: string;
  changeDate: string;
}

export interface QuotaWarningData {
  userName: string;
  plan: string;
  quotaLimit: number;
  requestsUsed: number;
  requestsRemaining: number;
  percentageUsed: number;
  resetDate: string;
  frontendUrl: string;
}

export interface QuotaLimitReachedData {
  userName: string;
  plan: string;
  quotaLimit: number;
  requestsUsed: number;
  resetDate: string;
  frontendUrl: string;
}

export interface ProviderCostWarningData {
  provider: string;
  currentCost: number;
  monthlyLimit: number;
  percentageUsed: number;
}

export interface ProviderCostLimitReachedData {
  provider: string;
  currentCost: number;
  monthlyLimit: number;
}

export interface HolisticServiceConfirmationData {
  userName: string;
  serviceName: string;
  amountArs: number;
  whatsappNumber: string;
  whatsappNumberForLink: string;
  bookingUrl: string;
}
