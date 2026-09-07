import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer, 
  setLogLevel,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

setLogLevel('silent');

export const app = initializeApp(firebaseConfig);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalAutoDetectLongPolling: true,
  } as any, (firebaseConfig as any).firestoreDatabaseId);
} catch (cacheErr) {
  console.warn("Firestore persistent local cache failed to initialize (usually due to iframe/private browsing sandbox storage restrictions). Falling back to memory cache:", cacheErr);
  firestoreInstance = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
  } as any, (firebaseConfig as any).firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'feedback', 'connection'));
    console.log("Firestore connection test: success");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection test: Operating in offline cache mode (Please check your Firebase configuration if this is unexpected).");
    } else {
      console.warn("Firestore connection test completed (potential offline mode or rules fallback):", error);
    }
  }
}
testConnection();
