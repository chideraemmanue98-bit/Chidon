import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getAllNotesLocal, saveNoteLocal } from '../lib/idb';
import toast from 'react-hot-toast';

export function useOfflineSync(userId: string | null) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Run initial sync on load if online
    if (navigator.onLine && userId) {
      syncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  const syncQueue = async () => {
    if (!userId || !navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    try {
      const localRecords = await getAllNotesLocal();
      const unsyncedRecords = localRecords.filter(r => r.isUnsynced === true);

      if (unsyncedRecords.length === 0) {
        setIsSyncing(false);
        return;
      }

      toast.loading('Syncing offline drafts to cloud...', { id: 'offline-sync-status' });
      let syncedCount = 0;

      for (const record of unsyncedRecords) {
        try {
          if (record.syncType === 'draft') {
            await addDoc(collection(db, 'drafts'), {
              featureId: record.featureId,
              content: record.content,
              userId: userId,
              createdAt: serverTimestamp(),
              title: record.title
            });
          } else if (record.syncType === 'note') {
            await addDoc(collection(db, 'notes'), {
              title: record.title,
              content: record.content,
              userId: userId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              isPinned: record.isPinned || false
            });
          }

          // Mark as synced locally
          const updatedRecord = { ...record };
          delete updatedRecord.isUnsynced;
          await saveNoteLocal(updatedRecord);
          syncedCount++;
        } catch (err) {
          console.error(`Failed to sync record ${record.id}:`, err);
        }
      }

      if (syncedCount > 0) {
        toast.success(`Successfully synced ${syncedCount} offline record(s) to cloud!`, {
          id: 'offline-sync-status',
          icon: '📡'
        });
      } else {
        toast.dismiss('offline-sync-status');
      }
    } catch (err) {
      console.error('Error during offline sync queue execution:', err);
      toast.error('Offline sync failed to complete.', { id: 'offline-sync-status' });
    } finally {
      setIsSyncing(false);
    }
  };

  return { isOnline, isSyncing, syncQueue };
}
