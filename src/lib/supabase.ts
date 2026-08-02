import { createClient } from '@supabase/supabase-js';
import { db, auth } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Define the Fluent Adapter for Firestore
class FirestoreSupabaseAdapter {
  protected tableName: string;
  protected queryConstraints: any[];

  constructor(tableName: string) {
    this.tableName = tableName;
    this.queryConstraints = [];
  }

  from(tableName: string) {
    return new FirestoreSupabaseAdapter(tableName);
  }

  select(fields?: string) {
    return this;
  }

  order(field: string, options?: { ascending: boolean }) {
    const isAsc = options?.ascending !== false;
    this.queryConstraints.push(orderBy(field, isAsc ? 'asc' : 'desc'));
    return this;
  }

  eq(field: string, value: any) {
    this.queryConstraints.push(where(field, '==', value));
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const collRef = collection(db, this.tableName);
      let q = query(collRef, ...this.queryConstraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      const result = { data, error: null };
      return onfulfilled ? onfulfilled(result) : result;
    } catch (err: any) {
      console.warn(`Firestore adapter fallback read warning for ${this.tableName}:`, err);
      const result = { data: [], error: null };
      return onfulfilled ? onfulfilled(result) : result;
    }
  }

  async upsert(payloads: any[]) {
    try {
      for (const payload of payloads) {
        const id = payload.id;
        if (id) {
          const docRef = doc(db, this.tableName, id);
          await setDoc(docRef, { ...payload, updated_at: serverTimestamp() }, { merge: true });
        } else {
          await addDoc(collection(db, this.tableName), { ...payload, created_at: serverTimestamp() });
        }
      }
      return { error: null };
    } catch (err: any) {
      console.error(`Firestore adapter upsert error for ${this.tableName}:`, err);
      return { error: err };
    }
  }

  async insert(payloads: any[]) {
    try {
      for (const payload of payloads) {
        const id = payload.id;
        if (id) {
          const docRef = doc(db, this.tableName, id);
          await setDoc(docRef, { ...payload, created_at: serverTimestamp() }, { merge: true });
        } else {
          await addDoc(collection(db, this.tableName), { ...payload, created_at: serverTimestamp() });
        }
      }
      return { error: null };
    } catch (err: any) {
      console.error(`Firestore adapter insert error for ${this.tableName}:`, err);
      return { error: err };
    }
  }

  update(fields: any) {
    return {
      eq: async (idName: string, idVal: string) => {
        try {
          if (idName === 'id') {
            const docRef = doc(db, this.tableName, idVal);
            await setDoc(docRef, { ...fields, updated_at: serverTimestamp() }, { merge: true });
          } else {
            const collRef = collection(db, this.tableName);
            const q = query(collRef, where(idName, '==', idVal));
            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(docSnap => 
              setDoc(docSnap.ref, { ...fields, updated_at: serverTimestamp() }, { merge: true })
            );
            await Promise.all(promises);
          }
          return { error: null };
        } catch (err: any) {
          console.error(`Firestore adapter update error for ${this.tableName}:`, err);
          return { error: err };
        }
      }
    };
  }

  delete() {
    return {
      eq: async (idName: string, idVal: string) => {
        try {
          if (idName === 'id') {
            const docRef = doc(db, this.tableName, idVal);
            await deleteDoc(docRef);
          } else {
            const collRef = collection(db, this.tableName);
            const q = query(collRef, where(idName, '==', idVal));
            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
            await Promise.all(promises);
          }
          return { error: null };
        } catch (err: any) {
          console.error(`Firestore adapter delete error for ${this.tableName}:`, err);
          return { error: err };
        }
      }
    };
  }
}

// Define the Fluent Auth Adapter for Firebase Auth
class FirebaseAuthSupabaseAdapter {
  constructor() {}

  async getSession() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return {
        data: {
          session: {
            user: {
              id: currentUser.uid,
              email: currentUser.email || '',
              user_metadata: {
                full_name: currentUser.displayName || currentUser.email?.split('@')[0]
              }
            }
          }
        }
      };
    }
    return { data: { session: null } };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        callback('SIGNED_IN', {
          user: {
            id: user.uid,
            email: user.email || '',
            user_metadata: {
              full_name: user.displayName || user.email?.split('@')[0]
            }
          }
        });
      } else {
        callback('SIGNED_OUT', null);
      }
    });

    return {
      data: {
        subscription: {
          unsubscribe
        }
      }
    };
  }

  async signInWithPassword({ email, password }: any) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return {
        data: {
          user: {
            id: user.uid,
            email: user.email || '',
            user_metadata: {
              full_name: user.displayName || user.email?.split('@')[0]
            }
          },
          session: {}
        },
        error: null
      };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  }

  async signUp({ email, password, options }: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const fullName = options?.data?.full_name || email.split('@')[0];
      await updateProfile(user, { displayName: fullName });
      return {
        data: {
          user: {
            id: user.uid,
            email: user.email || '',
            user_metadata: {
              full_name: fullName
            }
          },
          session: {}
        },
        error: null
      };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  }

  async resetPasswordForEmail(email: string, options?: any) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }

  async signOut() {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }
}

class FullSupabaseFirebaseAdapter extends FirestoreSupabaseAdapter {
  public auth: FirebaseAuthSupabaseAdapter;

  constructor() {
    super('');
    this.auth = new FirebaseAuthSupabaseAdapter();
  }
}

class ResilientSupabaseClient {
  private realClient: any;
  private fallbackClient: any;
  private useFallback: boolean = false;

  constructor(realClient: any) {
    this.realClient = realClient;
    this.fallbackClient = new FullSupabaseFirebaseAdapter();
  }

  get auth() {
    if (this.useFallback) {
      return this.fallbackClient.auth;
    }
    return this.realClient.auth;
  }

  from(tableName: string) {
    if (this.useFallback) {
      return this.fallbackClient.from(tableName);
    }

    const realBuilder = this.realClient.from(tableName);
    const fallbackBuilder = this.fallbackClient.from(tableName);

    return createResilientBuilder(realBuilder, fallbackBuilder, () => {
      console.warn("ResilientSupabaseClient: Switching to Firestore fallback due to query error");
      this.useFallback = true;
    });
  }
}

function createResilientBuilder(realBuilder: any, fallbackBuilder: any, onFallback: () => void): any {
  return new Proxy(realBuilder, {
    get(target, prop, receiver) {
      if (prop === 'then') {
        return async (onfulfilled?: any, onrejected?: any) => {
          try {
            const result = await realBuilder;
            if (result && result.error) {
              throw result.error;
            }
            return onfulfilled ? onfulfilled(result) : result;
          } catch (err) {
            console.warn("Supabase query failed, falling back to Firestore adapter:", err);
            onFallback();
            const fallbackResult = await fallbackBuilder;
            return onfulfilled ? onfulfilled(fallbackResult) : fallbackResult;
          }
        };
      }

      const val = Reflect.get(target, prop, receiver);
      if (typeof val === 'function') {
        return (...args: any[]) => {
          let nextReal: any;
          let nextFallback = fallbackBuilder;
          
          try {
            nextReal = val.apply(target, args);
          } catch (err) {
            console.warn("Real builder call failed immediately, falling back:", err);
            onFallback();
            return fallbackBuilder[prop](...args);
          }

          if (fallbackBuilder && typeof fallbackBuilder[prop] === 'function') {
            try {
              nextFallback = fallbackBuilder[prop](...args);
            } catch (fallbackErr) {
              console.error("Fallback builder call failed:", fallbackErr);
            }
          }

          if (['upsert', 'insert', 'update', 'delete'].includes(prop as string)) {
            if (nextReal && typeof nextReal.then === 'function') {
              return (async () => {
                try {
                  const res = await nextReal;
                  if (res && res.error) {
                    throw res.error;
                  }
                  return res;
                } catch (err) {
                  console.warn(`Supabase ${String(prop)} failed, falling back:`, err);
                  onFallback();
                  return nextFallback;
                }
              })();
            } else if (nextReal) {
              return new Proxy(nextReal, {
                get(t, p, r) {
                  const originalFunc = Reflect.get(t, p, r);
                  if (typeof originalFunc === 'function') {
                    return (...a: any[]) => {
                      const resReal = originalFunc.apply(t, a);
                      const resFallback = nextFallback[p](...a);
                      if (resReal && typeof resReal.then === 'function') {
                        return (async () => {
                          try {
                            const res = await resReal;
                            if (res && res.error) {
                              throw res.error;
                            }
                            return res;
                          } catch (err) {
                            console.warn(`Supabase ${String(prop)}.${String(p)} failed, falling back:`, err);
                            onFallback();
                            return resFallback;
                          }
                        })();
                      }
                      return resReal;
                    };
                  }
                  return originalFunc;
                }
              });
            }
          }

          return createResilientBuilder(nextReal, nextFallback, onFallback);
        };
      }
      return val;
    }
  });
}

let cachedSupabase: any = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('sync_supabase_url') || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sync_supabase_key') || '';
  
  if (!url || !key) {
    return new FullSupabaseFirebaseAdapter() as any;
  }

  if (cachedSupabase && url === cachedUrl && key === cachedKey) {
    return cachedSupabase;
  }

  try {
    const rawClient = createClient(url, key);
    cachedSupabase = new ResilientSupabaseClient(rawClient);
    cachedUrl = url;
    cachedKey = key;
    return cachedSupabase;
  } catch (err) {
    console.error("Supabase Client Initialization Error, falling back to Firebase adapter:", err);
    return new FullSupabaseFirebaseAdapter() as any;
  }
}
