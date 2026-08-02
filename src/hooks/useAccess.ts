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
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<UserAccessData>({
    hasAccess: false,
    isTrialing: false,
    trialEndsIn: '',
    package: 'basic',
    loading: true,
    trialEndsAt: null,
    status: 'trialing',
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setAccess({
          hasAccess: false,
          isTrialing: false,
          trialEndsIn: '',
          package: 'basic',
          loading: false,
          trialEndsAt: null,
          status: 'trialing',
        });
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeDoc = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const now = new Date();
          
          let trialEndAt: Date | null = null;
          if (data.trialEndAt) {
            trialEndAt = data.trialEndAt instanceof Timestamp ? data.trialEndAt.toDate() : new Date(data.trialEndAt);
          } else if (data.createdAt) {
            const created = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
            trialEndAt = new Date(created.getTime() + 24 * 60 * 60 * 1000);
          }

          const subscription: SubscriptionData = data.subscription || {
            status: "trialing",
            package: "pro",
            currentPeriodEnd: trialEndAt ? Timestamp.fromDate(trialEndAt) : null
          };

          const status = subscription.status;
          const pkg = subscription.package || 'pro';

          let hasAccess = false;
          let isTrialing = false;
          let trialEndsIn = '';

          if (status === "active") {
            hasAccess = true;
          } else if (status === "trialing" && trialEndAt && now < trialEndAt) {
            hasAccess = true;
            isTrialing = true;
            
            const diffMs = trialEndAt.getTime() - now.getTime();
            const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
            const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
            trialEndsIn = `${diffHours}h ${diffMins}m`;
          }

          setAccess({
            hasAccess,
            isTrialing,
            trialEndsIn,
            package: pkg,
            loading: false,
            trialEndsAt: trialEndAt,
            status,
          });
        } else {
          // If Firestore is still loading or document doesn't exist yet
          const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
          setAccess({
            hasAccess: true,
            isTrialing: true,
            trialEndsIn: '24h 00m',
            package: 'pro',
            loading: false,
            trialEndsAt: tomorrow,
            status: 'trialing',
          });
        }
        setLoading(false);
      }, (err) => {
        console.error("Error fetching user access:", err);
        setLoading(false);
      });

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  const checkAccess = () => {
    return access.hasAccess;
  };

  return { ...access, checkAccess };
}
