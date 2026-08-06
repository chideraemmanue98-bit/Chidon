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

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
    handleFirestoreError(err, OperationType.WRITE, `notifications/${userId}/items`);
  }
};

// Global standalone sendNotification helper alias
export const sendNotification = triggerNotification;

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setNotifications([]);
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.uid);
      const itemsRef = collection(db, 'notifications', user.uid, 'items');
      // orderBy createdAt desc, limit 50 as requested
      const q = query(itemsRef, orderBy('createdAt', 'desc'), limit(50));

      let isInitialLoad = true;
      const unsubscribeSnap = onSnapshot(q, (snap) => {
        const fetched: NotificationItem[] = [];
        let hasNewUnread = false;

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          // Support mapping both standard schema body/isRead and legacy read/message fields
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

        // Play ding sound only on new incoming unread notifications (ignoring initial load items)
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
        setNotifications(fetched);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `notifications/${user.uid}/items`);
        setLoading(false);
      });

      return () => unsubscribeSnap();
    });

    return () => unsubscribeAuth();
  }, []);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'notifications', userId, 'items', notificationId);
      await updateDoc(docRef, { 
        isRead: true,
        read: true // backup for legacy support
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${userId}/items/${notificationId}`);
    }
  };

  const markAllAsRead = async () => {
    if (!userId || notifications.length === 0) return;
    try {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length === 0) return;

      const batch = writeBatch(db);
      unread.forEach((n) => {
        const docRef = doc(db, 'notifications', userId, 'items', n.id);
        batch.update(docRef, { 
          isRead: true,
          read: true // legacy compatibility
        });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${userId}/items`);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'notifications', userId, 'items', notificationId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notifications/${userId}/items/${notificationId}`);
    }
  };

  const clearAllNotifications = async () => {
    if (!userId || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        const docRef = doc(db, 'notifications', userId, 'items', n.id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notifications/${userId}/items`);
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
