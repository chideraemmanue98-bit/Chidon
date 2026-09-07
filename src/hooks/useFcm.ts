import { useEffect, useState } from 'react';
import { getMessaging, onMessage, isSupported } from 'firebase/messaging';
import { app } from '../firebase';
import { playDingSound } from './useNotifications';
import toast from 'react-hot-toast';

export function useFcm() {
  const [fcmSupported, setFcmSupported] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // Check support and permissions
  useEffect(() => {
    isSupported().then((supported) => {
      setFcmSupported(supported);
      if (supported && "Notification" in window) {
        setPermissionStatus(Notification.permission);
      }
    }).catch(() => {
      setFcmSupported(false);
    });
  }, []);

  // Request browser notification permissions
  const requestPushPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported in this browser.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === 'granted';
    } catch (err) {
      console.error("Failed to request notification permission:", err);
      return false;
    }
  };

  // Setup the standard client-side FCM messaging listener
  useEffect(() => {
    if (fcmSupported === null || !fcmSupported) return;

    let unsubscribe: (() => void) | null = null;
    try {
      const messaging = getMessaging(app);
      unsubscribe = onMessage(messaging, (payload) => {
        console.log("FCM message received in foreground: ", payload);
        
        const title = payload.notification?.title || "System Message";
        const body = payload.notification?.body || "";
        
        // Trigger both standard toast AND a browser push notification
        playDingSound();
        toast.success(`📢 ${title}: ${body}`, { duration: 5000 });
        
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: "/favicon.ico",
            badge: "/favicon.ico"
          });
        }
      });
    } catch (err) {
      console.warn("FCM Listener failed to bind (expected in iframe previews without valid SW registrations):", err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fcmSupported]);

  // Client-side push notification trigger (used when daily 2-credit refresh is applied)
  const sendPushNotification = async (title: string, body: string) => {
    // Attempt to request permission if not already granted
    let granted = Notification.permission === 'granted';
    if (!granted && Notification.permission === 'default') {
      granted = await requestPushPermission();
    }

    // Trigger local push notification (FCM client-side simulator + browser notifier)
    if (granted && "Notification" in window) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, {
            body: body,
            icon: "/favicon.ico",
            badge: "/favicon.ico"
          });
        } else {
          new Notification(title, {
            body: body,
            icon: "/favicon.ico",
            badge: "/favicon.ico"
          });
        }
      } catch (e) {
        new Notification(title, {
          body: body,
          icon: "/favicon.ico"
        });
      }
    } else {
      console.warn("Notifications denied or not supported. Push message skipped.");
    }

    // Simultaneously trigger local chime & toast
    playDingSound();
  };

  return {
    fcmSupported,
    permissionStatus,
    requestPushPermission,
    sendPushNotification
  };
}
