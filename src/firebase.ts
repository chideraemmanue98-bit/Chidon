import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-d6d64897-8afb-45e3-ab92-6b0119ed38b4';

const missingFirebaseVariables = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingFirebaseVariables.length > 0) {
  console.warn(`Firebase configuration is incomplete: ${missingFirebaseVariables.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
} as any, firestoreDatabaseId || undefined);
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
