import { useState, useEffect } from 'react';
import { 
  collection, doc, onSnapshot, query, orderBy, 
  setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface NotificationItem {
  id: string;
  type: "credit" | "message" | "ai" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  link?: string;
}

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
      const q = query(itemsRef, orderBy('createdAt', 'desc'));

      const unsubscribeSnap = onSnapshot(q, (snap) => {
        const fetched: NotificationItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            type: data.type || 'system',
            title: data.title || '',
            message: data.message || '',
            read: !!data.read,
            createdAt: data.createdAt,
            link: data.link,
          });
        });
        setNotifications(fetched);
        setLoading(false);
      }, (err) => {
        console.error("Error loading notifications:", err);
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
      await updateDoc(docRef, { read: true });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!userId || notifications.length === 0) return;
    try {
      const unread = notifications.filter(n => !n.read);
      if (unread.length === 0) return;

      const batch = writeBatch(db);
      unread.forEach((n) => {
        const docRef = doc(db, 'notifications', userId, 'items', n.id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'notifications', userId, 'items', notificationId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting notification:", err);
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
      console.error("Error clearing all notifications:", err);
    }
  };

  const triggerNotification = async (targetUid: string, notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    try {
      const itemsRef = collection(db, 'notifications', targetUid, 'items');
      const newDocRef = doc(itemsRef);
      await setDoc(newDocRef, {
        id: newDocRef.id,
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error triggering notification:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    triggerNotification,
  };
}
