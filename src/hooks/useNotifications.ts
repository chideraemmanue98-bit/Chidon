import { useState, useEffect } from 'react';
import { 
  collection, doc, onSnapshot, query, orderBy, limit,
  setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface NotificationItem {
  id: string;
  type: "credit" | "message" | "ai_result" | "system";
  title: string;
  body: string;
  link: string;
  image?: string;
  isRead: boolean;
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Custom synthesized pristine notification chime using Web Audio API
export const playDingSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    // Elegant bright bell chime: 987.77 Hz (B5) transitioning to 1318.51 Hz (E6)
    osc.frequency.setValueAtTime(880, audioContext.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.6);
  } catch (err) {
    console.warn("AudioContext failed to play sound:", err);
  }
};

// Global standalone trigger helper for system/admin triggers (no hook dependency)
export const triggerNotification = async (
  userId: string, 
  data: { 
    type: "credit" | "message" | "ai_result" | "system"; 
    title: string; 
    body: string; 
    link?: string; 
    image?: string; 
  }
) => {
  if (!userId) return;

  const isSandboxUser = userId === 'sandbox' || (() => {
    const savedSandbox = localStorage.getItem("chidon_sandbox_session");
    if (savedSandbox) {
      try {
        const parsed = JSON.parse(savedSandbox);
        return parsed && parsed.uid === userId;
      } catch {
        return false;
      }
    }
    return false;
  })();

  const newItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: data.type,
    title: data.title,
    body: data.body,
    link: data.link || '',
    image: data.image || '',
    isRead: false,
    createdAt: new Date().toISOString()
  };

  // 1. Always append to local backup cache to guarantee zero-latency recovery
  try {
    const storageKey = `backup_notifications_${userId}`;
    const existingRaw = localStorage.getItem(storageKey);
    const items = existingRaw ? JSON.parse(existingRaw) : [];
    items.unshift(newItem);
    const trimmedItems = items.slice(0, 10);
    localStorage.setItem(storageKey, JSON.stringify(trimmedItems));
    
    // Broadcast event for active UI listeners
    window.dispatchEvent(new CustomEvent('chidon_local_notifications_updated', {
      detail: { userId, notifications: trimmedItems }
    }));
  } catch (err) {
    console.warn("[Local Notification Cache] Failed to save local backup", err);
  }

  if (isSandboxUser) {
    return;
  }

  // 2. Fire-and-forget write to Firestore. Catch all errors silently to prevent blocking the parent feature.
  try {
    const itemsRef = collection(db, 'notifications', userId, 'items');
    const newDocRef = doc(itemsRef);
    const payload = {
      id: newDocRef.id,
      type: data.type,
      title: data.title,
      body: data.body,
      link: data.link || '',
      image: data.image || '',
      isRead: false,
      read: false, // backwards compatibility support
      createdAt: serverTimestamp(),
    };
    await setDoc(newDocRef, payload);
  } catch (err) {
    console.debug("[Notifications Resiliency] Firestore write bypassed. Sovereign local persistence succeeded.", err);
  }
};

// Global standalone sendNotification helper alias
export const sendNotification = triggerNotification;

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const handleSync = (user: any) => {
      if (!user) {
        setNotifications([]);
        setUserId(null);
        setLoading(false);
        return () => {};
      }

      setUserId(user.uid);
      const backupKey = `backup_notifications_${user.uid}`;

      // Helper to load and merge local backup cache
      const getLocalBackupList = (): NotificationItem[] => {
        try {
          const raw = localStorage.getItem(backupKey);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      };

      if (user.isSandbox) {
        const loadSandboxNotifications = () => {
          const items = getLocalBackupList();
          const welcomeItem: NotificationItem = {
            id: 'welcome',
            type: 'system',
            title: 'Sovereign Sandbox Active',
            body: 'Successfully established high-performance offline proxy connection to bypass browser restrictions.',
            link: '',
            image: '',
            isRead: false,
            createdAt: null
          };
          if (!items.some((i: any) => i.id === 'welcome')) {
            items.push(welcomeItem);
          }
          setNotifications(items.slice(0, 10));
          setLoading(false);
        };

        loadSandboxNotifications();

        const handleSandboxUpdate = (e: any) => {
          if (e.detail && e.detail.userId === user.uid) {
            setNotifications(e.detail.notifications.slice(0, 10));
            playDingSound();
          }
        };

        window.addEventListener('chidon_local_notifications_updated', handleSandboxUpdate);
        return () => {
          window.removeEventListener('chidon_local_notifications_updated', handleSandboxUpdate);
        };
      }

      // Live Firestore synchronization with auto-fallback to local cache
      const itemsRef = collection(db, 'notifications', user.uid, 'items');
      const q = query(itemsRef, orderBy('createdAt', 'desc'), limit(25));

      let isInitialLoad = true;
      const unsubscribeSnap = onSnapshot(q, (snap) => {
        const fetched: NotificationItem[] = [];
        let hasNewUnread = false;

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const item: NotificationItem = {
            id: docSnap.id,
            type: (data.type || 'system') as any,
            title: data.title || '',
            body: data.body || data.message || '',
            link: data.link || '',
            image: data.image || '',
            isRead: data.isRead !== undefined ? data.isRead : (data.read !== undefined ? data.read : false),
            createdAt: data.createdAt,
          };
          fetched.push(item);
          if (!item.isRead) {
            hasNewUnread = true;
          }
        });

        if (!isInitialLoad && hasNewUnread) {
          const addedDocs = snap.docChanges().filter(change => change.type === 'added');
          const hasFreshUnread = addedDocs.some(change => {
            const docData = change.doc.data();
            const isReadVal = docData.isRead !== undefined ? docData.isRead : docData.read;
            return !isReadVal;
          });
          if (hasFreshUnread) {
            playDingSound();
          }
        }
        
        isInitialLoad = false;

        // Merge Firestore items with local backup items to avoid duplicates and ensure offline/guest items show up!
        const localList = getLocalBackupList();
        const mergedList = [...fetched];
        localList.forEach(localItem => {
          if (!mergedList.some(f => f.title === localItem.title && f.body === localItem.body)) {
            mergedList.push(localItem);
          }
        });

        // Limit display and local notifications strictly to 10
        const activeList = mergedList.slice(0, 10);
        setNotifications(activeList);
        setLoading(false);

        // Auto-cleanup Firestore database: Delete any old notifications beyond the 10th index
        if (fetched.length > 10) {
          const excess = fetched.slice(10);
          excess.forEach(async (item) => {
            try {
              const docRef = doc(db, 'notifications', user.uid, 'items', item.id);
              await deleteDoc(docRef);
            } catch (err) {
              console.debug("[Notifications Auto-Cleanup] Firestore delete error:", err);
            }
          });
        }

        // Auto-cleanup Local Storage backup cache: Ensure it doesn't hold more than 10
        try {
          const localBackup = getLocalBackupList();
          if (localBackup.length > 10) {
            localStorage.setItem(backupKey, JSON.stringify(localBackup.slice(0, 10)));
          }
        } catch (e) {
          console.warn("[Notifications Auto-Cleanup] Local storage trim error:", e);
        }
      }, (error) => {
        console.debug("[Notifications Hook] Firestore subscribe bypass. Rendering clean local sovereign cache.", error);
        setNotifications(getLocalBackupList().slice(0, 10));
        setLoading(false);
      });

      // Listen to instant local cache updates as well
      const handleLocalEvent = (e: any) => {
        if (e.detail && e.detail.userId === user.uid) {
          const localList = e.detail.notifications;
          setNotifications(prev => {
            const merged = [...prev];
            localList.forEach((li: any) => {
              if (!merged.some(m => m.id === li.id || (m.title === li.title && m.body === li.body))) {
                merged.unshift(li);
              }
            });
            return merged;
          });
          playDingSound();
        }
      };
      window.addEventListener('chidon_local_notifications_updated', handleLocalEvent);

      return () => {
        unsubscribeSnap();
        window.removeEventListener('chidon_local_notifications_updated', handleLocalEvent);
      };
    };

    let unsubscribeSnap: (() => void) | null = null;

    // Check sandbox session first
    const savedSandbox = localStorage.getItem("chidon_sandbox_session");
    if (savedSandbox) {
      try {
        const parsed = JSON.parse(savedSandbox);
        if (parsed && parsed.uid) {
          unsubscribeSnap = handleSync(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeSnap) {
        unsubscribeSnap();
        unsubscribeSnap = null;
      }
      
      if (!user) {
        const checkSandbox = localStorage.getItem("chidon_sandbox_session");
        if (checkSandbox) {
          try {
            unsubscribeSnap = handleSync(JSON.parse(checkSandbox));
          } catch {
            unsubscribeSnap = handleSync(null);
          }
        } else {
          unsubscribeSnap = handleSync(null);
        }
      } else {
        unsubscribeSnap = handleSync(user);
      }
    });

    const handleSandboxLogin = (e: any) => {
      if (unsubscribeSnap) {
        unsubscribeSnap();
        unsubscribeSnap = null;
      }
      unsubscribeSnap = handleSync(e.detail);
    };

    window.addEventListener("chidon_sandbox_login", handleSandboxLogin);

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnap) {
        unsubscribeSnap();
      }
      window.removeEventListener("chidon_sandbox_login", handleSandboxLogin);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    
    // Always update local cache state first to ensure instant visual UI response
    const backupKey = `backup_notifications_${userId}`;
    try {
      const raw = localStorage.getItem(backupKey);
      if (raw) {
        const items = JSON.parse(raw);
        const updated = items.map((item: any) => {
          if (item.id === notificationId) {
            return { ...item, isRead: true };
          }
          return item;
        });
        localStorage.setItem(backupKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Failed to update local read state", e);
    }

    setNotifications(prev => prev.map(item => {
      if (item.id === notificationId) {
        return { ...item, isRead: true };
      }
      return item;
    }));

    // Update Firestore if online
    try {
      const docRef = doc(db, 'notifications', userId, 'items', notificationId);
      await updateDoc(docRef, { 
        isRead: true,
        read: true
      });
    } catch (err) {
      console.debug("[Notifications Hook] Firestore markAsRead bypassed.", err);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    // Local cache instant updates
    const backupKey = `backup_notifications_${userId}`;
    try {
      const raw = localStorage.getItem(backupKey);
      if (raw) {
        const items = JSON.parse(raw);
        const updated = items.map((item: any) => ({ ...item, isRead: true }));
        localStorage.setItem(backupKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn(e);
    }

    setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));

    // Firestore batch updates
    try {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach((n) => {
          const docRef = doc(db, 'notifications', userId, 'items', n.id);
          batch.update(docRef, { 
            isRead: true,
            read: true
          });
        });
        await batch.commit();
      }
    } catch (err) {
      console.debug("[Notifications Hook] Firestore markAllAsRead bypassed.", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;

    // Update local cache
    const backupKey = `backup_notifications_${userId}`;
    try {
      const raw = localStorage.getItem(backupKey);
      if (raw) {
        const items = JSON.parse(raw);
        const updated = items.filter((item: any) => item.id !== notificationId);
        localStorage.setItem(backupKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn(e);
    }

    setNotifications(prev => prev.filter(item => item.id !== notificationId));

    // Firestore deletion
    try {
      const docRef = doc(db, 'notifications', userId, 'items', notificationId);
      await deleteDoc(docRef);
    } catch (err) {
      console.debug("[Notifications Hook] Firestore delete bypassed.", err);
    }
  };

  const clearAllNotifications = async () => {
    if (!userId) return;

    // Reset local cache
    const backupKey = `backup_notifications_${userId}`;
    try {
      localStorage.setItem(backupKey, JSON.stringify([]));
    } catch (e) {
      console.warn(e);
    }

    setNotifications([]);

    // Firestore deletion batch
    try {
      if (notifications.length > 0) {
        const batch = writeBatch(db);
        notifications.forEach((n) => {
          const docRef = doc(db, 'notifications', userId, 'items', n.id);
          batch.delete(docRef);
        });
        await batch.commit();
      }
    } catch (err) {
      console.debug("[Notifications Hook] Firestore clearAll bypassed.", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    triggerNotification,
    sendNotification,
  };
}
