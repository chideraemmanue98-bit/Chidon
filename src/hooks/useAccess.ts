import { useState, useEffect } from 'react';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

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
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<UserAccessData>({
    hasAccess: true,
    isTrialing: false,
    trialEndsIn: '',
    package: 'enterprise',
    loading: false,
    trialEndsAt: null,
    status: 'active',
  });

  const checkAccess = () => {
    return true;
  };

  return { ...access, checkAccess };
}
