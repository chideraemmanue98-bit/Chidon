export interface SubscriptionData {
  status: "trialing" | "active" | "canceled" | "past_due";
  package: "basic" | "pro" | "enterprise";
  currentPeriodEnd: any;
}

export interface UserAccessData {
  hasAccess: boolean;
  isTrialing: boolean;
  trialEndsIn: string; // e.g. "5h 23m"
  package: string;
  loading: boolean;
  trialEndsAt: Date | null;
  status: string;
}

export function useAccess() {
  const checkAccess = () => true;

  return {
    hasAccess: true,
    isTrialing: false,
    trialEndsIn: '',
    package: 'enterprise',
    loading: false,
    trialEndsAt: null,
    status: 'active',
    checkAccess
  };
}
