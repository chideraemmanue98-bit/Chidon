import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { FreelanceProfile } from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Convert File to base64 string
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Default/Initial Freelance profile creator
export async function ensureFreelanceProfile(uid: string, email: string, displayName?: string): Promise<FreelanceProfile | undefined> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const username = email.split('@')[0];
    const defaultProfile: FreelanceProfile = {
      uid,
      email,
      username: snap.exists() && snap.data().username ? snap.data().username : username,
      fullName: snap.exists() && snap.data().fullName ? snap.data().fullName : (displayName || username),
      avatarURL: snap.exists() && snap.data().avatarURL ? snap.data().avatarURL : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      coverURL: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=60',
      bio: 'Freelance specialist and consultant.',
      skills: ['React', 'TypeScript', 'TailwindCSS'],
      languages: ['English'],
      education: [],
      certifications: [],
      portfolio: [],
      role: 'buyer', // 'buyer' or 'seller'
      isVerified: false,
      totalOrders: 0,
      rating: 5,
      responseTime: '1 hour',
      onTimeDelivery: 100,
      earnings: 0,
      createdAt: snap.exists() && snap.data().createdAt ? snap.data().createdAt : serverTimestamp()
    };

    if (!snap.exists() || !snap.data().role) {
      await setDoc(userRef, defaultProfile, { merge: true });
      return defaultProfile;
    } else {
      return { ...defaultProfile, ...snap.data() } as FreelanceProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}
