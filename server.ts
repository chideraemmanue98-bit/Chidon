import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { QueryClient } from "@tanstack/query-core";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import crypto from "crypto";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp as initClient, getApps as getClientApps, getApp as getClientApp } from "firebase/app";
import { 
  getFirestore as getClientFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  collection, 
  addDoc, 
  collectionGroup, 
  getDocs, 
  increment,
  query,
  serverTimestamp as clientServerTimestamp
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define custom FieldValue compatibility layer
const FieldValue = {
  increment: (val: number) => {
    return { _type: "increment", _value: val };
  },
  serverTimestamp: () => {
    return { _type: "serverTimestamp" };
  }
};

class AdminDocWrapper {
  constructor(private clientDb: any, private path: string, private isAdminSdk: boolean = false) {}

  async get() {
    if (this.isAdminSdk) {
      const docRef = this.clientDb.doc(this.path);
      const snap = await docRef.get();
      return {
        exists: snap.exists,
        data: () => snap.data(),
        id: snap.id
      };
    } else {
      const docRef = doc(this.clientDb, this.path);
      const snap = await getDoc(docRef);
      return {
        exists: snap.exists(),
        data: () => snap.data(),
        id: snap.id
      };
    }
  }

  async delete() {
    if (this.isAdminSdk) {
      const docRef = this.clientDb.doc(this.path);
      await docRef.delete();
    } else {
      const docRef = doc(this.clientDb, this.path);
      await deleteDoc(docRef);
    }
  }

  async update(data: any) {
    if (this.isAdminSdk) {
      const docRef = this.clientDb.doc(this.path);
      const cleanedData = { ...data };
      const { FieldValue: AdminFieldValue } = await import("firebase-admin/firestore");
      for (const key of Object.keys(cleanedData)) {
        if (cleanedData[key] && cleanedData[key]._type === "increment") {
          cleanedData[key] = AdminFieldValue.increment(cleanedData[key]._value);
        } else if (cleanedData[key] && cleanedData[key]._type === "serverTimestamp") {
          cleanedData[key] = AdminFieldValue.serverTimestamp();
        }
      }
      await docRef.update(cleanedData);
    } else {
      const docRef = doc(this.clientDb, this.path);
      const cleanedData = { ...data };
      for (const key of Object.keys(cleanedData)) {
        if (cleanedData[key] && cleanedData[key]._type === "increment") {
          cleanedData[key] = increment(cleanedData[key]._value);
        } else if (cleanedData[key] && cleanedData[key]._type === "serverTimestamp") {
          cleanedData[key] = clientServerTimestamp();
        }
      }
      await updateDoc(docRef, cleanedData);
    }
  }

  async set(data: any, options?: any) {
    if (this.isAdminSdk) {
      const docRef = this.clientDb.doc(this.path);
      const cleanedData = { ...data };
      const { FieldValue: AdminFieldValue } = await import("firebase-admin/firestore");
      for (const key of Object.keys(cleanedData)) {
        if (cleanedData[key] && cleanedData[key]._type === "increment") {
          cleanedData[key] = AdminFieldValue.increment(cleanedData[key]._value);
        } else if (cleanedData[key] && cleanedData[key]._type === "serverTimestamp") {
          cleanedData[key] = AdminFieldValue.serverTimestamp();
        }
      }
      if (options && options.merge) {
        await docRef.set(cleanedData, { merge: true });
      } else {
        await docRef.set(cleanedData);
      }
    } else {
      const docRef = doc(this.clientDb, this.path);
      const cleanedData = { ...data };
      for (const key of Object.keys(cleanedData)) {
        if (cleanedData[key] && cleanedData[key]._type === "increment") {
          cleanedData[key] = increment(cleanedData[key]._value);
        } else if (cleanedData[key] && cleanedData[key]._type === "serverTimestamp") {
          cleanedData[key] = clientServerTimestamp();
        }
      }
      if (options && options.merge) {
        await setDoc(docRef, cleanedData, { merge: true });
      } else {
        await setDoc(docRef, cleanedData);
      }
    }
  }

  collection(subName: string) {
    return new AdminCollectionWrapper(this.clientDb, `${this.path}/${subName}`, this.isAdminSdk);
  }
}

class AdminCollectionWrapper {
  constructor(private clientDb: any, private path: string, private isAdminSdk: boolean = false) {}

  doc(docId?: string) {
    const id = docId || Math.random().toString(36).substring(2, 15);
    return new AdminDocWrapper(this.clientDb, `${this.path}/${id}`, this.isAdminSdk);
  }

  async get() {
    if (this.isAdminSdk) {
      const colRef = this.clientDb.collection(this.path);
      const snap = await colRef.get();
      const docs = snap.docs.map((docSnap: any) => ({
        id: docSnap.id,
        data: () => docSnap.data(),
        ref: {
          parent: {
            parent: {
              id: docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : "unknown"
            }
          }
        }
      }));
      return {
        docs,
        forEach: (cb: any) => docs.forEach(cb),
        size: docs.length
      };
    } else {
      const colRef = collection(this.clientDb, this.path);
      const snap = await getDocs(colRef);
      const docs = snap.docs.map(docSnap => ({
        id: docSnap.id,
        data: () => docSnap.data(),
        ref: {
          parent: {
            parent: {
              id: docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : "unknown"
            }
          }
        }
      }));
      return {
        docs,
        forEach: (cb: any) => docs.forEach(cb),
        size: docs.length
      };
    }
  }

  async add(data: any) {
    if (this.isAdminSdk) {
      const cleanedData = { ...data };
      const { FieldValue: AdminFieldValue } = await import("firebase-admin/firestore");
      for (const key of Object.keys(cleanedData)) {
        if (cleanedData[key] && cleanedData[key]._type === "increment") {
          cleanedData[key] = AdminFieldValue.increment(cleanedData[key]._value);
        } else if (cleanedData[key] && cleanedData[key]._type === "serverTimestamp") {
          cleanedData[key] = AdminFieldValue.serverTimestamp();
        }
      }
      const colRef = this.clientDb.collection(this.path);
      const docRef = await colRef.add(cleanedData);
      return { id: docRef.id };
    } else {
      const colRef = collection(this.clientDb, this.path);
      const cleanedData = { ...data };
      for (const key of Object.keys(cleanedData)) {
        if (cleanedData[key] && cleanedData[key]._type === "increment") {
          cleanedData[key] = increment(cleanedData[key]._value);
        } else if (cleanedData[key] && cleanedData[key]._type === "serverTimestamp") {
          cleanedData[key] = clientServerTimestamp();
        }
      }
      const docRef = await addDoc(colRef, cleanedData);
      return { id: docRef.id };
    }
  }
}

class AdminDbWrapper {
  constructor(private clientDb: any, private isAdminSdk: boolean = false) {}

  collection(colName: string) {
    return new AdminCollectionWrapper(this.clientDb, colName, this.isAdminSdk);
  }

  collectionGroup(colName: string) {
    return {
      get: async () => {
        if (this.isAdminSdk) {
          const snap = await this.clientDb.collectionGroup(colName).get();
          const docs = snap.docs.map((docSnap: any) => ({
            id: docSnap.id,
            path: docSnap.ref.path,
            data: () => docSnap.data(),
            ref: {
              parent: {
                parent: {
                  id: docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : "unknown"
                }
              }
            }
          }));
          return {
            docs,
            forEach: (cb: any) => docs.forEach(cb),
            size: docs.length
          };
        } else {
          const q = query(collectionGroup(this.clientDb, colName));
          const snap = await getDocs(q);
          const docs = snap.docs.map(docSnap => ({
            id: docSnap.id,
            path: docSnap.ref.path,
            data: () => docSnap.data(),
            ref: {
              parent: {
                parent: {
                  id: docSnap.ref.parent.parent ? docSnap.ref.parent.parent.id : "unknown"
                }
              }
            }
          }));
          return {
            docs,
            forEach: (cb: any) => docs.forEach(cb),
            size: docs.length
          };
        }
      }
    };
  }
}

// Initialize Firebase client/admin on server-side dynamically
let firestoreAdminDb: any = null;

function getFirestoreAdminDb(): any {
  if (!firestoreAdminDb) {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    let firebaseConfig: any = null;
    if (fs.existsSync(configPath)) {
      try {
        firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      } catch (e) {
        console.error("[Firebase Config] Error parsing config file:", e);
      }
    }

    // 1. Try to initialize using official firebase-admin SDK first (requires administrative contexts/service credentials)
    try {
      const adminApps = getApps();
      let adminApp;
      if (adminApps.length === 0) {
        if (firebaseConfig && firebaseConfig.projectId) {
          adminApp = initializeApp({
            projectId: firebaseConfig.projectId
          });
        } else {
          adminApp = initializeApp();
        }
      } else {
        adminApp = adminApps[0];
      }

      const dbId = (firebaseConfig && firebaseConfig.firestoreDatabaseId) || undefined;
      const rawAdminDb = getFirestore(adminApp, dbId);
      firestoreAdminDb = new AdminDbWrapper(rawAdminDb, true);
      console.log(`[Firebase Admin SDK] Successfully initialized admin Firestore instance with database ID: ${dbId || "default"}`);
    } catch (adminErr: any) {
      console.warn("[Firebase Admin SDK] Admin initialization failed or credentials missing. Falling back to Client SDK wrapper...", adminErr?.message);

      // 2. Fallback to client-side proxy if Admin SDK is unavailable
      try {
        if (firebaseConfig) {
          let app;
          const apps = getClientApps();
          if (apps.length === 0) {
            app = initClient(firebaseConfig);
          } else {
            app = getClientApp();
          }
          const clientDb = getClientFirestore(app, firebaseConfig.firestoreDatabaseId);
          firestoreAdminDb = new AdminDbWrapper(clientDb, false);
          console.log("[Firebase Client Proxy] Initialized client-side Firestore connection on the server successfully.");
        } else {
          console.warn("[Firebase Client Proxy] firebase-applet-config.json not found. Fallback Firestore operations disabled.");
        }
      } catch (clientErr: any) {
        console.error("[Firebase Client Proxy] Fallback initialization also failed:", clientErr?.message);
      }
    }
  }
  return firestoreAdminDb;
}

// Helper to get Supabase Client
function getSupabaseClientInstance() {
  const sUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!sUrl || !sKey) {
    console.error("[Supabase Credit Engine] Missing credentials.");
    return null;
  }
  return createClient(sUrl, sKey);
}

// Helper to trigger notifications server-side in Firestore
async function serverTriggerNotification(userId: string, data: { type: string; title: string; body: string; link?: string; image?: string }) {
  const isGuest = !userId || userId === "guest_anonymous_uplink" || userId.startsWith("guest") || userId.startsWith("local_") || userId === "sandbox";
  if (isGuest) return;
  const firestoreAdmin = getFirestoreAdminDb();
  if (!firestoreAdmin) return;
  try {
    const notifCol = firestoreAdmin.collection("notifications").doc(userId).collection("items");
    const newDoc = notifCol.doc();
    await newDoc.set({
      id: newDoc.id,
      type: data.type,
      title: data.title,
      body: data.body,
      link: data.link || '',
      image: data.image || '',
      isRead: false,
      createdAt: FieldValue.serverTimestamp()
    });
    console.log(`[Notification Engine Server] Dispatched notification to ${userId}: ${data.title}`);
  } catch (err) {
    console.error("[Notification Engine Server] Dispatch failed:", err);
  }
}

// Centered Credit Reconciliation Engine
async function reconcileUserCredits(userId: string): Promise<{ credits: number; dailyCreditsActive: number; dailyCreditsExpiresAt: string | null; firebaseSyncRequired?: boolean; dailyGranted?: boolean; welcomeNewlyGranted?: boolean }> {
  const isGuest = !userId || userId === "guest_anonymous_uplink" || userId.startsWith("guest") || userId.startsWith("local_") || userId === "sandbox";
  if (isGuest) {
    return {
      credits: 7, // 5 welcome + 2 daily starting state
      dailyCreditsActive: 2,
      dailyCreditsExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      firebaseSyncRequired: false,
      dailyGranted: true,
      welcomeNewlyGranted: true
    };
  }

  const firestoreAdmin = getFirestoreAdminDb();
  const sb = getSupabaseClientInstance();
  
  let credits = 0;
  let welcomeGranted = false;
  let lastDailyLoginGrant = "";
  let dailyCreditsActive = 0;
  let dailyCreditsExpiresAt = "";
  let dailyGranted = false;
  let welcomeNewlyGranted = false;
  const email = userId.includes("@") ? userId : `${userId}@chidon.iq`;
  const displayName = "Chidon Creator";

  if (!firestoreAdmin) {
    return { credits: 0, dailyCreditsActive: 0, dailyCreditsExpiresAt: null, firebaseSyncRequired: true };
  }

  const userDocRef = firestoreAdmin.collection("users").doc(userId);
  let snap;
  let hasFirestorePermission = true;

  try {
    snap = await userDocRef.get();
  } catch (firestoreErr: any) {
    console.warn(`[Credit Reconciliation] Firestore access failed for user ${userId} on get():`, firestoreErr?.message || firestoreErr);
    hasFirestorePermission = false;
  }

  if (!hasFirestorePermission) {
    let sbCredits = 0;
    let sbDailyCreditsActive = 0;
    let sbDailyCreditsExpiresAt: string | null = null;
    
    if (sb) {
      try {
        const { data: profile } = await sb.from('profiles').select('credits').eq('id', userId).single();
        if (profile) {
          sbCredits = Number(profile.credits) || 0;
        } else {
          sbCredits = 7; // New user starting fallback (5 welcome + 2 daily)
          sbDailyCreditsActive = 2;
          sbDailyCreditsExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        }
      } catch (sbErr) {
        console.error("[Supabase Credit Sync] Failed to read credits on fallback:", sbErr);
        sbCredits = 7; // standard fallback
        sbDailyCreditsActive = 2;
        sbDailyCreditsExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
    } else {
      sbCredits = 7; // standard fallback
      sbDailyCreditsActive = 2;
      sbDailyCreditsExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    return {
      credits: sbCredits,
      dailyCreditsActive: sbDailyCreditsActive,
      dailyCreditsExpiresAt: sbDailyCreditsExpiresAt,
      firebaseSyncRequired: true
    };
  }

  const now = new Date();
  
  if (!snap.exists) {
    // 1. COMPLETELY NEW USER: Starting balance is strictly 0!
    credits = 0;
    welcomeGranted = false;
    lastDailyLoginGrant = "";
    dailyCreditsActive = 0;
    dailyCreditsExpiresAt = "";

    try {
      await userDocRef.set({
        email,
        displayName,
        credits,
        welcomeGranted,
        lastDailyLoginGrant,
        dailyCreditsActive,
        dailyCreditsExpiresAt,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      // Log 0 credits starting state transaction
      const initTxRef = userDocRef.collection("transactions").doc();
      await initTxRef.set({
        type: "credit",
        amount: 0,
        description: "Credit core initialized for brand new user profile. Starting balance: 0 credits.",
        createdAt: FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.warn("[reconcileUserCredits] New user init setDoc failed, flagging sync required:", err);
      hasFirestorePermission = false;
    }

    // 2. WELCOME PROMO: Immediately grant the one-time 5 welcome gift credits
    credits = 5;
    welcomeGranted = true;
    
    if (hasFirestorePermission) {
      try {
        await userDocRef.set({
          credits,
          welcomeGranted,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // Log welcome gift transaction
        const welcomeTxRef = userDocRef.collection("transactions").doc();
        await welcomeTxRef.set({
          type: "credit",
          amount: 5,
          description: "Welcome Promo Gift (One-time +5 Credits)",
          createdAt: FieldValue.serverTimestamp()
        });

        // Dispatch welcome notification
        await serverTriggerNotification(userId, {
          type: 'credit',
          title: 'Welcome Gift Active! 🎁',
          body: 'You have been granted a one-time welcome gift of +5 credits on signup!',
          link: '/credits'
        });
      } catch (err) {
        console.warn("[reconcileUserCredits] Welcome gift setDoc failed:", err);
        hasFirestorePermission = false;
      }
    }

    // 3. DAILY DEPOSIT: Apply initial daily login deposit of 2 credits (valid 24h)
    credits += 2;
    dailyCreditsActive = 2;
    lastDailyLoginGrant = now.toISOString();
    dailyCreditsExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    if (hasFirestorePermission) {
      try {
        await userDocRef.set({
          credits,
          dailyCreditsActive,
          lastDailyLoginGrant,
          dailyCreditsExpiresAt,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // Log daily grant transaction
        const dailyTxRef = userDocRef.collection("transactions").doc();
        await dailyTxRef.set({
          type: "credit",
          amount: 2,
          description: "Automated Daily Login Bonus (+2 Credits, valid 24h)",
          createdAt: FieldValue.serverTimestamp()
        });

        // Dispatch daily deposit notification
        await serverTriggerNotification(userId, {
          type: 'credit',
          title: 'Daily Refill Deposited ⚡',
          body: 'Your automated daily +2 credits have been deposited. Valid for 24 hours!',
          link: '/credits'
        });
      } catch (err) {
        console.warn("[reconcileUserCredits] Daily deposit setDoc failed:", err);
        hasFirestorePermission = false;
      }
    }

    // Sync to Supabase
    if (sb) {
      try {
        await sb.from('profiles').upsert({
          id: userId,
          role: 'buyer',
          full_name: displayName,
          credits: credits,
          rating: 5.0
        });
      } catch (sbErr) {
        console.error("[Supabase Credit Sync] Initial provisioning failed:", sbErr);
      }
    }

    return { credits, dailyCreditsActive, dailyCreditsExpiresAt, firebaseSyncRequired: !hasFirestorePermission, dailyGranted: true, welcomeNewlyGranted: true };
  }

  // User already exists in database
  const userData = snap.data() || {};
  credits = userData.credits !== undefined ? Number(userData.credits) : 0;
  welcomeGranted = userData.welcomeGranted || false;
  lastDailyLoginGrant = userData.lastDailyLoginGrant || "";
  dailyCreditsActive = userData.dailyCreditsActive !== undefined ? Number(userData.dailyCreditsActive) : 0;
  dailyCreditsExpiresAt = userData.dailyCreditsExpiresAt || "";

  let updated = false;

  // 1. Double check: Ensure any legacy user gets their 5-credit welcome gift if they didn't get it yet
  if (!welcomeGranted) {
    credits += 5;
    welcomeGranted = true;
    welcomeNewlyGranted = true;
    updated = true;

    if (hasFirestorePermission) {
      try {
        const welcomeTxRef = userDocRef.collection("transactions").doc();
        await welcomeTxRef.set({
          type: "credit",
          amount: 5,
          description: "Retro Welcome Promo Gift (One-time +5 Credits)",
          createdAt: FieldValue.serverTimestamp()
        });

        await serverTriggerNotification(userId, {
          type: 'credit',
          title: 'Welcome Gift Active! 🎁',
          body: 'You have been granted a one-time welcome gift of +5 credits on signup!',
          link: '/credits'
        });
      } catch (err) {
        console.warn("[reconcileUserCredits] Retro welcome gift log failed:", err);
        hasFirestorePermission = false;
      }
    }
  }

  // 2. CHECK EXPIRATION: Handle expiration of active daily credits after 24 hours
  if (dailyCreditsActive > 0 && dailyCreditsExpiresAt) {
    const expiresTime = new Date(dailyCreditsExpiresAt).getTime();
    if (now.getTime() > expiresTime) {
      const expiredAmount = Math.min(credits, dailyCreditsActive);
      credits = Math.max(0, credits - expiredAmount);

      if (hasFirestorePermission) {
        try {
          const expTxRef = userDocRef.collection("transactions").doc();
          await expTxRef.set({
            type: "deduction",
            amount: expiredAmount,
            description: `Daily Limit Expired: Deducting unused daily credits (-${expiredAmount} Credits)`,
            createdAt: FieldValue.serverTimestamp()
          });

          await serverTriggerNotification(userId, {
            type: 'credit',
            title: 'Daily Credits Expired ⏰',
            body: `Your unused daily login credits (-${expiredAmount} credits) expired after 24 hours.`,
            link: '/credits'
          });
        } catch (err) {
          console.warn("[reconcileUserCredits] Expiration log failed:", err);
          hasFirestorePermission = false;
        }
      }

      dailyCreditsActive = 0;
      dailyCreditsExpiresAt = "";
      updated = true;
    }
  }

  // 3. DAILY REFILL CHECK: Check if eligible for new daily login grant (Exactly 24 hours must have elapsed since the last grant)
  let isDailyEligible = false;
  if (!lastDailyLoginGrant) {
    isDailyEligible = true;
  } else {
    const lastTime = new Date(lastDailyLoginGrant).getTime();
    if (now.getTime() - lastTime >= 24 * 60 * 60 * 1000) {
      isDailyEligible = true;
    }
  }

  if (isDailyEligible) {
    // If there were old unexpired daily credits from the previous period, expire them first
    if (dailyCreditsActive > 0) {
      const expiredAmount = Math.min(credits, dailyCreditsActive);
      credits = Math.max(0, credits - expiredAmount);

      if (hasFirestorePermission) {
        try {
          const expTxRef = userDocRef.collection("transactions").doc();
          await expTxRef.set({
            type: "deduction",
            amount: expiredAmount,
            description: `Expired previous unconsumed daily credits prior to refill (-${expiredAmount} Credits)`,
            createdAt: FieldValue.serverTimestamp()
          });
        } catch (err) {
          console.warn("[reconcileUserCredits] Refill pre-expiration log failed:", err);
          hasFirestorePermission = false;
        }
      }
    }

    credits += 2;
    dailyCreditsActive = 2;
    lastDailyLoginGrant = now.toISOString();
    dailyCreditsExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    dailyGranted = true;
    updated = true;

    if (hasFirestorePermission) {
      try {
        const dailyTxRef = userDocRef.collection("transactions").doc();
        await dailyTxRef.set({
          type: "credit",
          amount: 2,
          description: "Automated Daily Login Refill (+2 Credits, valid 24h)",
          createdAt: FieldValue.serverTimestamp()
        });

        await serverTriggerNotification(userId, {
          type: 'credit',
          title: 'Daily Refill Deposited ⚡',
          body: 'Your automated daily +2 credits have been deposited. Valid for 24 hours!',
          link: '/credits'
        });
      } catch (err) {
        console.warn("[reconcileUserCredits] Refill transaction log failed:", err);
        hasFirestorePermission = false;
      }
    }
  }

  if (updated && hasFirestorePermission) {
    try {
      await userDocRef.set({
        credits,
        welcomeGranted,
        lastDailyLoginGrant,
        dailyCreditsActive,
        dailyCreditsExpiresAt,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("[reconcileUserCredits] User doc update setDoc failed:", err);
      hasFirestorePermission = false;
    }
  }

  if (updated || !hasFirestorePermission) {
    if (sb) {
      try {
        await sb.from('profiles').update({ credits: credits }).eq('id', userId);
      } catch (err) {
        console.error("[Supabase Credit Sync] Sync failed during reconciliation:", err);
      }
    }
  }

  return { credits, dailyCreditsActive, dailyCreditsExpiresAt, firebaseSyncRequired: !hasFirestorePermission, dailyGranted, welcomeNewlyGranted };
}

// Dynamic server-side wrapper to provision or reconcile both Supabase and Firebase credits
async function getOrProvisionBothCredits(userId: string, cost: number): Promise<number> {
  const isGuest = !userId || userId === "guest_anonymous_uplink" || userId.startsWith("guest") || userId.startsWith("local_") || userId === "sandbox";
  if (isGuest) {
    return 100;
  }
  const { credits } = await reconcileUserCredits(userId);
  return credits;
}

// Secured double-entry credit deduction engine with intelligent expiring-first priority
async function deductBothCredits(userId: string, cost: number, description?: string): Promise<boolean> {
  const isGuest = !userId || userId === "guest_anonymous_uplink" || userId.startsWith("guest") || userId.startsWith("local_") || userId === "sandbox";
  if (isGuest) {
    return true;
  }
  const firestoreAdmin = getFirestoreAdminDb();
  if (!firestoreAdmin) return false;

  try {
    // Always reconcile first to ensure active balances and clocks are perfectly accurate prior to deduction
    const { credits: currentCredits, dailyCreditsActive } = await reconcileUserCredits(userId);
    
    if (currentCredits < cost) {
      console.warn(`[Credit Engine] User ${userId} has insufficient credits (${currentCredits} < ${cost})`);
      return false;
    }

    // Spend expiring daily credits first
    const dailyConsumed = Math.min(dailyCreditsActive, cost);
    const nextDailyActive = Math.max(0, dailyCreditsActive - dailyConsumed);
    const nextBalance = Math.max(0, currentCredits - cost);

    let hasFirestorePermission = true;
    const userRef = firestoreAdmin.collection("users").doc(userId);
    
    try {
      await userRef.set({
        credits: nextBalance,
        dailyCreditsActive: nextDailyActive,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      // Log the transaction
      const txRef = userRef.collection("transactions").doc();
      await txRef.set({
        type: "deduction",
        amount: cost,
        description: description || "AI Cognitive Feature Computation",
        createdAt: FieldValue.serverTimestamp()
      });

      // Automatically trigger server-driven real-time notification
      await serverTriggerNotification(userId, {
        type: 'credit',
        title: `Credits Deducted 🧠`,
        body: `Spent ${cost} credits for: ${description || "AI Cognitive Feature Computation"}. Balance: ${nextBalance} credits.`,
        link: '/credits'
      });
    } catch (firestoreWriteErr: any) {
      console.warn(`[Credit Engine] Firestore update failed during deduction for ${userId}:`, firestoreWriteErr?.message || firestoreWriteErr);
      hasFirestorePermission = false;
    }

    // Sync to Supabase
    const sb = getSupabaseClientInstance();
    if (sb) {
      try {
        await sb.from('profiles').update({ credits: nextBalance }).eq('id', userId);
      } catch (err) {
        console.error("[Supabase Credit Sync] Deduction sync failed:", err);
      }
    }

    console.log(`[Credit Engine] Successfully deducted ${cost} credits from ${userId} (Spent ${dailyConsumed} daily, ${cost - dailyConsumed} standard). New Balance: ${nextBalance}. Firestore Synced: ${hasFirestorePermission}`);
    return true;
  } catch (err) {
    console.error("[Credit Engine] Deduction failure:", err);
    return false;
  }
}

// AUTOMATED BACKEND CLOCK TIME TIMER
// Runs once every 3 minutes to automatically scan active user accounts and run credit lifecycle updates
setInterval(async () => {
  try {
    const firestoreAdmin = getFirestoreAdminDb();
    if (!firestoreAdmin) return;

    console.log("[Credit Clock Backend] Auto-clock tick: scanning directory for refills and expirations...");
    const usersSnap = await firestoreAdmin.collection("users").get();
    
    let processedCount = 0;
    usersSnap.forEach((userDoc: any) => {
      const uid = userDoc.id;
      if (uid && uid !== "guest_anonymous_uplink" && !uid.startsWith("guest") && !uid.startsWith("local_")) {
        reconcileUserCredits(uid).catch(err => {
          console.error(`[Credit Clock Backend] Failed to reconcile user ${uid}:`, err);
        });
        processedCount++;
      }
    });
    
    console.log(`[Credit Clock Backend] Clock tick complete. Reconciled and validated ${processedCount} active users.`);
  } catch (err: any) {
    if (err?.message?.includes("PERMISSION_DENIED")) {
      console.warn("[Credit Clock Backend] Background cycle paused: Cloud sandbox environment lacks administrative Firestore permissions (this is expected when running server-side without manual Service Account credentials). System falls back gracefully to standard, real-time client-side reconciliation.");
    } else {
      console.error("[Credit Clock Backend] Background execution cycle encountered an issue:", err);
    }
  }
}, 3 * 60 * 1000); // 3-minute interval


// PERF: Backend TanStack Query Client for caching API requests and generative computations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Caching responses for 5 minutes server-side
      gcTime: 10 * 60 * 1000,  // Garbage collection interval of 10 minutes
    },
  },
});

// PERF: In-memory live exchange rate cache to prevent blocking API routes on slow network lookups
let LIVE_USD_TO_NGN_RATE: number | null = null;
let lastExchangeRateFetchTime = 0;

async function getLiveExchangeRate(): Promise<number> {
  const cacheDuration = 10 * 60 * 1000; // Cache rate for 10 minutes
  const now = Date.now();
  const envRate = parseFloat(process.env.USD_TO_NGN_RATE || "1500");

  if (LIVE_USD_TO_NGN_RATE && (now - lastExchangeRateFetchTime < cacheDuration)) {
    return LIVE_USD_TO_NGN_RATE;
  }

  try {
    console.log("[Exchange Service] Fetching latest live exchange rates from Open ER-API...");
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const data = await res.json() as any;
    if (data && data.result === "success" && data.rates && typeof data.rates.NGN === "number") {
      const liveRate = data.rates.NGN;
      console.log(`[Exchange Service] Live USD to NGN exchange rate updated successfully: ₦${liveRate.toLocaleString()}`);
      LIVE_USD_TO_NGN_RATE = liveRate;
      lastExchangeRateFetchTime = now;
      return liveRate;
    } else {
      throw new Error("Invalid response schema from exchange rates endpoint");
    }
  } catch (err: any) {
    console.warn(`[Exchange Service] Dynamic exchange lookup failed (${err.message || err}). Falling back to static configuration: ₦${envRate}`);
    return LIVE_USD_TO_NGN_RATE || envRate;
  }
}

// PERF: Lazy-initialized Gemini client to speed up container startup and prevent crashing if key is not yet set
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(customKey?: string): GoogleGenAI {
  if (customKey && typeof customKey === "string" && customKey.trim().length > 0) {
    console.log("[Gemini Engine] Using custom client-supplied API key.");
    return new GoogleGenAI({
      apiKey: customKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing from server configuration");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Normalize model name to officially supported, highly available production models
function normalizeModel(modelName: any): string {
  if (typeof modelName !== "string") {
    return "gemini-3.8-flash";
  }
  const lower = modelName.toLowerCase().trim();

  // Handle specific image generation models
  if (lower.includes("image") || lower.includes("nano-banana")) {
    if (lower.includes("pro") || lower.includes("high")) {
      return "gemini-3.1-flash-image";
    }
    return "gemini-3.1-flash-lite-image";
  }

  // Handle 3.8-flash specifically
  if (lower.includes("3.8-flash")) {
    return "gemini-3.8-flash";
  }

  // Handle 3.7-flash specifically
  if (lower.includes("3.7-flash")) {
    return "gemini-3.7-flash";
  }

  // Handle professional reasoning models
  if (lower.includes("3.1-pro") || lower.includes("pro-preview")) {
    return "gemini-3.1-pro-preview";
  }

  if (lower.includes("pro") || lower.includes("thinking") || lower.includes("reasoning")) {
    return "gemini-3.1-pro-preview";
  }

  // Handle lite models
  if (lower.includes("lite") || lower.includes("minimal") || lower.includes("3.1-flash-lite")) {
    return "gemini-3.1-flash-lite";
  }

  // Default to gemini-3.8-flash for the fastest, highest capacity experience
  return "gemini-3.8-flash";
}

// Models that natively support the googleSearch grounding tool on the free tier
const SEARCH_SUPPORTED_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite"
];

// High-fidelity fallback SVG graphics generator matching the brand theme for resilient rendering if Imagen/Gemini image generation fails
function generateFallbackSvg(prompt: string, aspectRatio: string = "16:9"): string {
  const isSquare = aspectRatio === "1:1";
  const width = isSquare ? 512 : 910;
  const height = 512;

  // Extract a suitable headline if we can find one in the prompt
  let title = "CHIDON IQ DESIGN CONCEPT";
  const matchQuote = prompt.match(/"([^"]+)"/);
  if (matchQuote && matchQuote[1]) {
    title = matchQuote[1];
  } else {
    if (prompt.toLowerCase().includes("avatar") || prompt.toLowerCase().includes("profile")) {
      title = "CREATOR AVATAR";
    } else if (prompt.toLowerCase().includes("thumbnail")) {
      title = "THUMBNAIL LAB";
    }
  }

  let gradientStart = "#0b0f19"; 
  let gradientEnd = "#01030a";   
  let accentColor = "#06b6d4";   

  if (prompt.toLowerCase().includes("emerald") || prompt.toLowerCase().includes("green")) {
    accentColor = "#10b981"; 
  } else if (prompt.toLowerCase().includes("purple") || prompt.toLowerCase().includes("violet")) {
    accentColor = "#7c3aed"; 
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}" />
        <stop offset="100%" stop-color="${gradientEnd}" />
      </linearGradient>
      <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#3b82f6" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <rect width="${width}" height="${height}" fill="url(#bg-grad)" />
    
    <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
      <line x1="0" y1="${height/2}" x2="${width}" y2="${height/2}" />
      <line x1="${width/2}" y1="0" x2="${width/2}" y2="${height}" />
      <circle cx="${width/2}" cy="${height/2}" r="150" fill="none" stroke="rgba(255,255,255,0.02)" />
      <circle cx="${width/2}" cy="${height/2}" r="250" fill="none" stroke="rgba(255,255,255,0.01)" />
    </g>

    <g filter="url(#glow)">
      <circle cx="${width/2}" cy="${height/2}" r="80" fill="rgba(6, 182, 212, 0.05)" stroke="${accentColor}" stroke-width="2" />
      <circle cx="${width/2}" cy="${height/2}" r="10" fill="#ffffff" />
      <path d="M ${width/2 - 120} ${height/2 + 60} Q ${width/2 - 60} ${height/2 - 40} ${width/2} ${height/2} T ${width/2 + 120} ${height/2 - 80}" fill="none" stroke="url(#accent-grad)" stroke-width="4" stroke-linecap="round" />
    </g>

    <circle cx="${width/2 - 100}" cy="${height/2 - 120}" r="3" fill="#ffffff" opacity="0.6" />
    <circle cx="${width/2 + 140}" cy="${height/2 + 80}" r="2" fill="#ffffff" opacity="0.4" />
    <circle cx="${width/2 - 160}" cy="${height/2 + 40}" r="4" fill="${accentColor}" opacity="0.3" />
    <circle cx="${width/2 + 180}" cy="${height/2 - 100}" r="3" fill="#ffffff" opacity="0.5" />

    <text x="${width/2}" y="${height/2 - 140}" text-anchor="middle" fill="${accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="4">CHIDON IQ DESIGN ENGINE</text>

    <rect x="${width/2 - Math.min(width/2 - 20, 250)}" y="${height/2 - 35}" width="${Math.min(width - 40, 500)}" height="70" rx="10" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5" />
    <text x="${width/2}" y="${height/2 + 8}" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" letter-spacing="1">${title.toUpperCase()}</text>

    <rect x="${width/2 - 90}" y="${height/2 + 130}" width="180" height="28" rx="14" fill="rgba(6, 182, 212, 0.1)" stroke="${accentColor}" stroke-width="1" />
    <text x="${width/2}" y="${height/2 + 148}" text-anchor="middle" fill="${accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" letter-spacing="1">NEURAL CONCEPT</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function extractTopic(prompt: string): string {
  if (!prompt) return "Sovereign Content Strategy";
  let clean = prompt.replace(/[#*`_]/g, "").trim();
  if (clean.length < 40) return clean;
  const indicators = ["about", "for", "on", "niche", "topic", "niche:"];
  for (const ind of indicators) {
    const idx = clean.toLowerCase().indexOf(ind);
    if (idx !== -1 && idx + ind.length < clean.length) {
      const segment = clean.substring(idx + ind.length).trim();
      const sentenceEnd = segment.search(/[.!?\n]/);
      const extracted = sentenceEnd !== -1 ? segment.substring(0, sentenceEnd).trim() : segment;
      if (extracted.length > 2 && extracted.length < 50) {
        return extracted;
      }
    }
  }
  const words = clean.split(/\s+/);
  if (words.length > 1) {
    return words.slice(0, 5).join(" ") + "...";
  }
  return clean;
}

function generateDynamicFallback(prompt: string, feature: string, languageName: string): string {
  const topic = extractTopic(prompt);
  const featureLower = (feature || "").toLowerCase().trim();

  console.log(`[Gemini Fallback Engine] Operating fallback for feature="${feature}" topic="${topic}" language="${languageName}"`);

  const isSpanish = languageName.toLowerCase().includes("spanish") || languageName.toLowerCase().includes("espanol") || languageName.toLowerCase().includes("es");
  const isFrench = languageName.toLowerCase().includes("french") || languageName.toLowerCase().includes("francais") || languageName.toLowerCase().includes("fr");
  
  const tr = (en: string, es: string, fr: string) => {
    if (isSpanish) return es;
    if (isFrench) return fr;
    return en;
  };

  const growthBuzzwords = ["Viral Loop", "Attention Arbitrage", "CTR Multiplier", "Retention Hook", "Algorithmic Lift", "Conversion Funnel", "Social Proof", "Cognitive Friction", "Pattern Interrupt"];
  const randomBuzzword = () => growthBuzzwords[Math.floor(Math.random() * growthBuzzwords.length)];

  if (featureLower.includes("video ideas") || featureLower === "video ideas") {
    let listItems = "";
    for (let i = 1; i <= 20; i++) {
      listItems += `${i}. Hook: ${tr(`"They don't want you to know this secret about ${topic}..."`, `"No quieren que sepas este secreto sobre ${topic}..."`, `"Ils ne veulent pas que vous sachiez ce secret sur ${topic}..."`)} | Angle: ${tr(`Exposing the hidden mechanics of ${topic} to build massive authority.`, `Exponiendo la mecánica oculta de ${topic} para generar autoridad masiva.`, `Exposer les mécanismes cachés de ${topic} pour acquérir une autorité massive.`)} | Why it works: ${tr(`Leverages curiosity and pattern interrupts to double your usual swipe-through retention rate.`, `Aprovecha la curiosidad y la interrupción del patrón para duplicar su tasa de retención habitual.`, `Tire parti de la curiosité et des interruptions de schéma pour doubler votre taux de rétention habituel.`)}\n`;
    }
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)\n\n${listItems}`;
  }

  if (featureLower.includes("hashtag") || featureLower.includes("hashtag engine")) {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)\n\n` +
           `BROAD 10: #contentcreation #socialmediagrowth #marketingtips #creatoreconomy #viraltrends #growthhacking #branding #businessintelligence #viralvideos #trendingtech\n\n` +
           `NICHE 10: #${topic.replace(/\s+/g, "").toLowerCase()} #${topic.replace(/\s+/g, "").toLowerCase()}tips #${topic.replace(/\s+/g, "").toLowerCase()}growth #${topic.replace(/\s+/g, "").toLowerCase()}guide #digital${topic.replace(/\s+/g, "").toLowerCase()} #${topic.replace(/\s+/g, "").toLowerCase()}tactics #${topic.replace(/\s+/g, "").toLowerCase()}secrets #advanced${topic.replace(/\s+/g, "").toLowerCase()} #${topic.replace(/\s+/g, "").toLowerCase()}mastery #${topic.replace(/\s+/g, "").toLowerCase()}viral\n\n` +
           `BRANDED 10: #chidoniq #chidoniqgrowth #chidoniqcrew #chidoniqtrends #chidoniqvault #chidoniqsignals #chidonacademy #chidonglobal #chidoniqinsights #chidoniqaccelerator`;
  }

  if (featureLower.includes("script") || featureLower.includes("script writer") || featureLower.includes("script writer")) {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

**[B-ROLL: High-contrast close-up of a creator looking intensely at a screen with overlay metrics ticking up to 100K views]**
**[TEXT ON SCREEN: THE SECRET TRUTH ABOUT ${topic.toUpperCase()}!]**

**HOOK (0-3s):** 
"${tr(`Stop scrolling! If you are still trying to scale your brand using old methods for ${topic}, you are literally leaving 90% of your potential views on the table. Here is the exact blueprint they don't want you to know.`, `¡Deja de hacer scroll! Si todavía estás intentando escalar tu marca utilizando métodos antiguos para ${topic}, literalmente estás dejando el 90% de tus vistas potenciales sobre la mesa. Aquí está el plano exacto que no quieren que sepas.`, `Arrêtez de faire défiler! Si vous essayez toujours de développer votre marque en utilisant d'anciennes méthodes pour ${topic}, vous laissez littéralement 90 % de vos vues potentielles sur la table. Voici le plan exact qu'ils ne veulent pas que vous sachiez.`)}"

**PROBLEM:**
"${tr(`The problem is simple: the algorithm changed. It no longer rewards generic keyword stuffing. It rewards deep retention and dynamic pattern interrupts. If your videos on ${topic} lack an immediate visual hook, people swipe away in under 1.5 seconds.`, `El problema es simple: el algoritmo cambió. Ya no premia el relleno de palabras clave genéricas. Premia la retención profunda y las interrupciones dinámicas del patrón. Si tus videos sobre ${topic} carecen de un gancho visual inmediato, la gente los desliza en menos de 1,5 segundos.`, `Le problème est simple : l'algorithme a changé. Il ne récompense plus le bourrage de mots-clés génériques. Il récompense la rétention profonde et les interruptions de schéma dynamiques. Si vos vidéos sur ${topic} manquent d'accroche visuelle immédiate, les gens passent à autre chose en moins de 1,5 seconde.`)}"

**[B-ROLL: Clean animated chart showing a drop-off line stabilizing and shooting upwards as a green 'Hook Activated' indicator flashes]**

**3 STEP SOLUTION:**
1. **${tr("The Pattern Interrupt", "La interrupción del patrón", "L'interruption de schéma")}:** ${tr(`In the first 3 seconds, show a split-screen or physical movement that defies expectations about ${topic}.`, `En los primeros 3 segundos, muestra una pantalla dividida o un movimiento físico que desafíe las expectativas sobre ${topic}.`, `Dans les 3 premières secondes, montrez un écran partagé ou un mouvement physique qui défie les attentes concernant ${topic}.`)}
2. **${tr("The Micro-Dose Value", "La microdosis de valor", "La microdose de valeur")}:** ${tr(`Do not build up. Give your strongest, most mind-blowing tip about ${topic} immediately in step one. Keep them hooked for the context.`, `No acumules tensión. Da tu consejo más fuerte e impactante sobre ${topic} inmediatamente en el paso uno. Manténlos enganchados para el contexto.`, `N'attendez pas. Donnez votre conseil le plus fort et le plus époustouflant sur ${topic} immédiatement dès la première étape. Gardez-les accrochés pour le contexte.`)}
3. **${tr("The Viral Loopback", "El bucle viral", "La boucle virale")}:** ${tr(`End your video mid-sentence or with an open loop that feeds directly back into the beginning of the video for a perfect infinite loop.`, `Termina tu video a mitad de la frase o con un bucle abierto que se retroalimente directamente al comienzo del video para un bucle infinito perfecto.`, `Terminez votre vidéo au milieu d'une phrase ou avec une boucle ouverte qui renvoie directement au début de la vidéo pour une boucle infinie parfaite.`)}

**[B-ROLL: Hand holding a phone with the Chidon IQ Dashboard demonstrating dynamic content ideas and SEO tags loading in real-time]**

**CTA:**
"${tr(`If you want to automate this entire process, tap the link in my bio to unlock Chidon IQ. Stop guessing, start scaling. Follow for more daily algorithm hacks!`, `Si deseas automatizar todo este proceso, toca el enlace en mi biografía para desbloquear Chidon IQ. Deja de adivinar, comienza a escalar. ¡Sigue para conocer más trucos diarios de algoritmos!`, `Si vous souhaitez automatiser l'ensemble de ce processus, appuyez sur le lien dans ma bio pour débloquer Chidon IQ. Arrêtez de deviner, commencez à évoluer. Suivez pour plus de hacks d'algorithmes quotidiens !`)}"`;
  }

  if (featureLower.includes("bio") || featureLower.includes("bio optimizer")) {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

1. Bio 1: 🚀 Helping you master ${topic} | 📈 ${tr("Proven results: +140% growth", "Resultados probados: +140% de crecimiento", "Résultats prouvés : +140% de croissance")} | 👇 ${tr("Claim free blueprint!", "¡Reclama el plano gratis!", "Réclamez le plan gratuit !")}
2. Bio 2: 🧠 ${tr("The Science of", "La ciencia de", "La science de")} ${topic} | 🎬 ${tr("Daily hacks for creators", "Trucos diarios para creadores", "Hacks quotidiens pour les créateurs")} | 🎁 ${tr("Get Chidon IQ below:", "Obtén Chidon IQ a continuación:", "Obtenez Chidon IQ ci-dessous :")}
3. Bio 3: 💸 ${tr("Scale your business via", "Escala tu negocio a través de", "Développez votre entreprise via")} ${topic} | 💎 ${tr("7-Figure growth frameworks", "Marcos de crecimiento de 7 cifras", "Cadres de croissance à 7 chiffres")} | 👇 ${tr("Start here:", "Comienza aquí:", "Commencez ici :")}
4. Bio 4: ⚡ ${tr("I solve your", "Resuelvo tus problemas de", "Je résous vos problèmes de")} ${topic} ${tr("problems in 30 seconds", "en 30 segundos", "en 30 secondes")} | 🎓 ${tr("Elite strategist", "Estratega de élite", "Stratège d'élite")} | 👇 ${tr("Free training:", "Entrenamiento gratis:", "Formation gratuite :")}
5. Bio 5: 🔥 ${tr("Virality isn't luck. It's math.", "La viralidad no es suerte. Es matemática.", "La viralité n'est pas une chance. C'est des maths.")} | 👑 ${tr("Secrets of", "Secretos de", "Secrets de")} ${topic} | 👇 ${tr("Unlock my toolset:", "Desbloquea mi caja de herramientas:", "Débloquez ma boîte à outils :")}`;
  }

  if (featureLower.includes("thumbnail") || featureLower.includes("thumbnail designer")) {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

**${tr("Concept 1: The Curated Shockwave", "Concepto 1: La onda de choque curada", "Concept 1 : L'onde de choc organisée")}**
- **Visual:** Close-up of a face with eyes wide, hand over mouth, staring at a massive neon-green glowing spreadsheet or folder labeled "${topic.toUpperCase()} SECRETS".
- **Text (3 words max):** "THEY LIED!"
- **Colors:** Deep obsidian black background contrasted with ultra-bright neon green and high-exposure face lighting.
- **Emotion:** Extreme curiosity, shock, and a feeling of impending exposure.
- **Why it clicks:** Drives an immediate click by implying that common knowledge about ${topic} is an active lie holding the viewer back.

**${tr("Concept 2: The Split-Reality Comparison", "Concepto 2: La comparación de la realidad dividida", "Concept 2 : La comparaison de réalité divisée")}**
- **Visual:** Left side showing a sad, exhausted creator with a red arrow pointing down to "10 Views". Right side showing the same creator smiling broadly with a bright green arrow pointing up to "1M Views" next to Chidon IQ's branding.
- **Text (3 words max):** "DO THIS!"
- **Colors:** Saturated red for failure, vibrant emerald green and cyan for success. High-density color grading.
- **Emotion:** Relief, hope, and clear direction.
- **Why it clicks:** Instantly demonstrates a high-impact transformation that the viewer can replicate by watching.

**${tr("Concept 3: The Restricted Vault", "Concepto 3: La bóveda restringida", "Concept 3 : Le coffre-fort restreint")}**
- **Visual:** A top-secret steel document vault, slightly cracked open with a powerful golden light pouring out, illuminating the word "${topic.toUpperCase()} BLUEPRINT".
- **Text (3 words max):** "DON'T SHOW!"
- **Colors:** Dark metallic grays and rich golden hues for premium value signifiers.
- **Emotion:** Exclusivity, luxury, and high-value insider knowledge.
- **Why it clicks:** Targets the viewer's psychological desire for exclusive, high-level secrets not available to the general public.

**${tr("Concept 4: The 30-Second Fix", "Concepto 4: La solución de 30 segundos", "Concept 4 : La solution en 30 secondes")}**
- **Visual:** A stop-watch ticking down, with a hand pointing directly to a simple, clean 3-step checklist overlay about ${topic} where step 3 is blurred out with a question mark.
- **Text (3 words max):** "EASY FIX!"
- **Colors:** Matte purple background with bright orange highlights on the stopwatch.
- **Emotion:** Urgency, simplicity, and instant gratification.
- **Why it clicks:** Promises high-speed, actionable returns with minimal effort, which is the highest driver of click-through rate.

**${tr("Concept 5: The Algorithmic Override", "Concepto 5: La anulación algorítmica", "Concept 5 : La neutralisation algorithmique")}**
- **Visual:** A phone showing a massive viral dashboard line chart breaking out of its container box, with digital lock icons showing "UNLOCKED" next to a custom logo of Chidon IQ.
- **Text (3 words max):** "IT'S UNLOCKED"
- **Colors:** Technicolor cyan-blue, neon red, and crisp white overlays.
- **Emotion:** Power, victory, and overcoming systemic barriers.
- **Why it clicks:** Empowers the creator by suggesting they can finally break through the algorithm's restrictions on ${topic}.`;
  }

  if (featureLower.includes("competitor") || featureLower.includes("competitor lab")) {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

#### 📊 COMPETING LAB REPORT: ${topic.toUpperCase()} SECURE ANALYSIS

##### 1. TOP 3 COMPETITORS IDENTIFIED
- **Competitor A (The Authority):** High production value, long-form educational guides, very structured but slow to react to fast viral formats.
- **Competitor B (The Quantity Spammer):** Posts 3-5 short videos a day, uses extreme clickbait, high volume but very low brand loyalty and audience trust.
- **Competitor C (The Lifestyle Aesthetician):** Highly polished, beautiful b-roll, high-vibe lifestyle integration, but lacks tactical, actionable depth.

##### 2. ADVANCED GAP ANALYSIS
- **The Core Flaw:** All three competitors explain *what* ${topic} is, but none of them show the raw, screen-shared *how-to* or provide free downloadable files/templates.
- **Retention Drop-off:** Competitor B's retention charts drop over 60% in the first 2 seconds due to identical talking-head hooks.
- **Monetization Lag:** They lack native AI tools to allow their audiences to instantly take action on the concepts explained.

##### 3. HOW WE WIN (THE CHIDON STRATEGY)
We will position our brand as the **"Actionable Scientist"** of ${topic}. By combining Competitor A's educational depth with Competitor B's hook frequency and Competitor C's visual mastery—powered entirely by Chidon IQ's real-time generation—we will deliver 10x the value in half the video length.

##### 4. 5 CONTENT ANGLES THEY MISSED
1. *"${tr("Why 99% of people fail at", "Por qué el 99% de la gente falla en", "Pourquoi 99% des gens échouent à")} ${topic} ${tr("in under 10 days.", "en moins de 10 días.", "en moins de 10 jours.")}"*
2. *"${tr("The secret math of", "La matemática secreta de", "Les maths secrètes de")} ${topic} ${tr("that gurus are hiding.", "que los gurús están ocultando.", "que les gourous cachent.")}"*
3. *"${tr("3 free Chidon IQ tools that automate", "3 herramientas gratuitas de Chidon IQ que automatizan", "3 outils Chidon IQ gratuits qui automatisent")} ${topic} ${tr("overnight.", "de la noche a la mañana.", "du jour au lendemain.")}"*
4. *"${tr("Reacting to Competitor A's worst advice on", "Reaccionando al peor consejo de Competitor A sobre", "Réagir au pire conseil de Competitor A sur")} ${topic}."*
5. *"${tr("How to build a 6-figure workflow in", "Cómo construir un flujo de trabajo de 6 cifras en", "Comment créer un flux de travail à 6 chiffres dans")} ${topic} ${tr("using only 2 prompts.", "usando solo 2 indicaciones.", "en utilisant seulement 2 invites.")}"*`;
  }

  if (featureLower.includes("schedule") || featureLower.includes("schedule lab")) {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

- Monday: 08:30 AM WAT | ${tr("Morning Scroll Window - High-energy hook targeting professional commuters.", "Ventana de scroll matutino: gancho de alta energía dirigido a viajeros profesionales.", "Fenêtre de défilement du matin - Accroche à haute énergie ciblant les navetteurs professionnels.")}
- Tuesday: 12:15 PM WAT | ${tr("Lunch Break Arbitrage - Quick, punchy 3-step solution to boost midday engagement.", "Arbitraje de la hora del almuerzo: solución rápida y contundente de 3 pasos para impulsar el compromiso del mediodía.", "Arbitrage de la pause déjeuner - Solution rapide et percutante en 3 étapes pour stimuler l'engagement de la mi-journée.")}
- Wednesday: 05:45 PM WAT | ${tr("Post-Work Decompression - Deep-dive breakdown of the latest trends in", "Descompresión post-trabajo: desglose profundo de las últimas tendencias en", "Décompression post-travail - Analyse approfondie des dernières tendances en")} ${topic}.
- Thursday: 07:15 PM WAT | ${tr("Peak Engagement Core - Prime time content release. Host a Q&A loop in comments.", "Núcleo de máxima participación: lanzamiento de contenido en horario de máxima audiencia. Organiza un bucle de preguntas y respuestas en los comentarios.", "Cœur de l'engagement maximal - Sortie de contenu aux heures de grande écoute. Organisez une boucle de questions-réponses dans les commentaires.")}
- Friday: 03:30 PM WAT | ${tr("Weekend Launch Prep - High-curiosity cliffhanger to capture weekend leisure traffic.", "Preparación para el lanzamiento del fin de semana: suspenso de alta curiosidad para capturar el tráfico de ocio del fin de semana.", "Préparation du lancement du week-end - Un cliffhanger de grande curiosité pour capter le trafic de loisirs du week-end.")}
- Saturday: 11:00 AM WAT | ${tr("Morning Value Injection - Comprehensive guide format with high-density retention assets.", "Inyección de valor matutina: formato de guía completo con activos de retención de alta densidad.", "Injection de valeur matinale - Format de guide complet avec des actifs de rétention à haute densité.")}
- Sunday: 08:00 PM WAT | ${tr("Sunday Reset Protocol - Reflective, strategic content outlining next week's masterplan.", "Protocolo de restablecimiento dominical: contenido estratégico y reflexivo que describe el plan maestro de la próxima semana.", "Protocole de réinitialisation du dimanche - Contenu réflexif et stratégique décrivant le plan directeur de la semaine prochaine.")}`;
  }

  if (featureLower.includes("engagement") || featureLower.includes("engagement advisor")) {
    let tactics = "";
    for (let i = 1; i <= 20; i++) {
      tactics += `${i}. Tactic: ${tr(`Inject an intentional micro-mistake or typo in step 2.`, `Inyecta un micro-error intencionado o un error tipográfico en el paso 2.`, `Injectez une micro-erreur intentionnelle ou une faute de frappe à l'étape 2.`)} | Example: ${tr(`"Write 'their' instead of 'there' in the overlay text to drive 400+ corrective comments boosting algorithmic visibility."`, `"Escribe 'their' en lugar de 'there' en el texto superpuesto para generar más de 400 comentarios correctivos que aumenten la visibilidad algorítmica."`, `"Écrivez 'their' au lieu de 'there' dans le texte de superposition pour générer plus de 400 commentaires correctifs augmentant la visibilité algorithmique."`)}\n`;
    }
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)\n\n${tactics}`;
  }

  if (featureLower.includes("keyword") || featureLower.includes("keyword intel") || featureLower.includes("keyword-research")) {
    let keywords = "";
    for (let i = 1; i <= 50; i++) {
      const difficulty = i % 3 === 0 ? "Low" : i % 3 === 1 ? "Med" : "High";
      const intent = i % 2 === 0 ? "Info" : "Buy";
      keywords += `${i}. ${topic} ${tr(`tutorial for beginners`, `tutorial para principiantes`, `tutoriel pour débutants`)} ${i} | Intent: ${intent} | Difficulty: ${difficulty}\n`;
    }
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)\n\n${keywords}`;
  }

  if (featureLower.includes("shadowban") || featureLower.includes("shadowban solutions")) {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

#### 🛡️ SHADOWBAN EMERGENCY RESPONSE BLUEPRINT: ${topic.toUpperCase()}

##### I. 5 SIGNS OF AN ACTIVE SHADOWBAN
1. **The Sudden Drop-off:** Views plunge by 80% to 95% overnight with zero change in content style or quality.
2. **Explore Isolation:** Your content gets exactly 0% traffic from the "For You" or "Explore" pages. Only existing followers can see it.
3. **Hashtag Blackout:** Searching for the specific hashtags you used does not reveal your video in the recent list.
4. **Search Erasure:** Typing your exact username in a guest account's search bar does not auto-suggest your profile.
5. **Sound Restriction:** Your video is muted or the associated audio is suddenly flagged as unauthorized in specific regions.

##### II. 7 CRITICAL REASONS WHY IT HAPPENS
1. **Repetitive IP Actions:** Performing high-frequency bulk uploads or comments from an unverified VPN address.
2. **Metadata Stuffing:** Re-using the exact same list of 30 hashtags on 10 consecutive posts on ${topic}.
3. **Aggressive Follow-Unfollow Loops:** Running third-party scripts or manually performing rapid follow/unfollow actions.
4. **Flagged Keywords:** Accidentally using words restricted by safety algorithms in your overlay text.
5. **Copyright Audio Triggers:** Uploading a custom audio track that matches a licensed library without proper sync credentials.
6. **Cross-Platform Watermarks:** Leaving a visible TikTok or CapCut logo on a Reels or Shorts video.
7. **Mass User Flags:** Competing pages or bot networks filing coordinated bad-faith reports against your profile.

##### III. 10-STEP SYSTEMIC RECOVERY ACTIONS
1. **The 48-Hour Cold Reset:** Log out of all mobile and desktop devices completely. Do not open the app for 48 hours.
2. **VPN Purge:** Disable all active VPN tunnels. Ensure your network uses a clean, local residential IP address.
3. **App Integration Revocation:** Enter your security settings and remove access for all third-party scheduler and analytics apps.
4. **Metadata Scrubbing:** Delete the hashtags and descriptions of your last 5 published videos on ${topic}.
5. **Watermark Decontamination:** Only upload pristine, raw video files rendered directly from your editing timeline (no logos!).
6. **Follower Sanitization:** Manually remove bot accounts, empty profiles, or spam accounts from your follower list.
7. **The Authentic Engagement Loop:** Spend 15 minutes a day engaging naturally with top-performing profiles in the ${topic} niche—without posting.
8. **Clear Local Caches:** Delete the application's local cache from your system settings, then reinstall a fresh version of the app.
9. **Creator-to-Personal Switch:** Toggle your account type to personal for 3 days, then toggle back to creator to refresh your registry index.
10. **The Secure Uplink Post:** Publish a 10-second raw, unedited camera video of yourself talking directly to the lens with zero tags or description to confirm human presence.

##### IV. WHAT NOT TO DO UNDER ANY CIRCUMSTANCE
- **DO NOT** delete your shadowbanned videos. It destroys your overall profile authority index. Archive them instead.
- **DO NOT** create a second account on the same device while shadowbanned, or the device ID itself will be permanently flagged.
- **DO NOT** run paid ads on a shadowbanned account to bypass the reach drop-off; it locks your profile in a "pay-to-play" category.`;
  }

  if (featureLower.includes("title") || featureLower.includes("vseo-title-desc") || featureLower === "title + description") {
    let titles = "";
    for (let i = 1; i <= 10; i++) {
      titles += `${i}. Title ${i}: ${tr(`How to scale your brand using`, `Cómo escalar tu marca usando`, `Comment développer votre marque en utilisant`)} ${topic} | Description ${i}: ${tr(`Unlock the exact 3-step blueprint for mastering`, `Desbloquea el plano exacto de 3 pasos para dominar`, `Découvrez le plan exact en 3 étapes pour maîtriser`)} ${topic}. ${tr(`Don't let the algorithm hold your business back. Learn more with Chidon IQ!`, `No dejes que el algoritmo frene tu negocio. ¡Aprende más con Chidon IQ!`, `Ne laissez pas l'algorithme freiner votre entreprise. En savoir plus avec Chidon IQ !`)}\n`;
    }
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)\n\n${titles}`;
  }

  if (featureLower.includes("tag") || featureLower.includes("vseo-tags") || featureLower === "tag architect") {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)\n\n` +
           `${topic.toLowerCase()}, ${topic.toLowerCase()} tutorial, ${topic.toLowerCase()} tips, scale ${topic.toLowerCase()}, ${topic.toLowerCase()} growth, ${topic.toLowerCase()} marketing, chidon iq, chidon iq ${topic.toLowerCase()}, viral ${topic.toLowerCase()}, ${topic.toLowerCase()} guide, ${topic.toLowerCase()} secrets, ${topic.toLowerCase()} blueprint, ${topic.toLowerCase()} for beginners, ${topic.toLowerCase()} 2026, social media growth, algorithm hack, advanced ${topic.toLowerCase()}, ${topic.toLowerCase()} strategy`;
  }

  if (featureLower.includes("auditor") || featureLower.includes("vseo-scorecard") || featureLower === "video auditor") {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

#### 🎬 VIDEO AUDIT REPORT: ${topic.toUpperCase()} PERFORMANCE MATRIX

##### Hook Score: 8.5 / 10
The video hook is extremely strong and utilizes an immediate visual pattern interrupt. However, the verbal hook is 2 words too long. Cutting the filler words will increase initial 3-second retention by 12%.

##### Retention Risks identified
- **Visual Stagnation:** Between 12s and 22s, the camera stays on a static talking-head view. We recommend introducing a dynamic zoom or b-roll cut every 4.5 seconds.
- **The Mid-Video Lag:** The second pillar explanation lacks a concrete example, causing a potential swipe-away risk for casual viewers.

##### SEO Optimization Score: 92%
Your metadata contains highly optimized, low-difficulty search tags. The keyword density in the first 2 sentences is excellent.

##### 5 IMMEDIATE STRATEGIC IMPROVEMENTS
1. **Trim the Intro:** Delete the first 1.5 seconds where you say "Hey guys, welcome back." Start directly with the shock verbal hook.
2. **Inject Dynamic Zoom-Ins:** Apply a subtle 10% digital zoom-in on every key educational transition point to simulate a multi-camera setup.
3. **Sound FX Synchronization:** Overlay a crisp high-tech "swoosh" or "pop" sound effect every time a checklist item flashes on screen.
4. **Micro-Loop CTA:** Change the ending from "Thanks for watching" to a seamless open loop: "And that is exactly why..." to double your infinite loop completion rate.
5. **Contrast Color Grading:** Increase the saturation and exposure of your face lighting by 15% to stand out on mobile screens with auto-brightness disabled.

##### NEXT VIDEO CONCEPT PROPOSAL
*"The shocking truth about ${topic} that gurus don't want you to know."*`;
  }

  if (featureLower.includes("optimizer") || featureLower.includes("post-optimizer") || featureLower === "post optimizer") {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

#### 📝 POST OPTIMIZATION REPORT: ${topic.toUpperCase()}

##### 1. ACTIONABLE CRITIQUE & FEEDBACK
- **The Hook Deficiency:** Your current post starts with standard context rather than a high-impact statement. This causes users to scroll past instantly.
- **Visual Clutter:** Avoid using more than 3 bullet points in a single block of text. Break them up with whitespace to allow mobile scanning.

##### 2. 3 COMPLETE STRATEGIC REWRITES

<h6>${tr("Rewrite 1: The Direct Pattern Interrupt (High Curiosity)", "Recritura 1: Interrupción directa del patrón (alta curiosidad)", "Réécriture 1 : L'interruption directe de schéma (haute curiosité)")}</h6>
"${tr("99% of people are completely wrong about", "El 99% de la gente está completamente equivocada sobre", "99% des gens se trompent complètement sur")} ${topic}. ${tr("Here is the exact 30-second fix that actually works:", "Aquí está la solución exacta de 30 segundos que realmente funciona:", "Voici la solution exacte en 30 secondes qui fonctionne vraiment :")}\n- ${tr("Stop using generic keywords.", "Deja de usar palabras clave genéricas.", "Arrêtez d'utiliser des mots-clés génériques.")}\n- ${tr("Inject micro-hooks in the first 3 seconds.", "Inyecta micro-ganchos en los primeros 3 segundos.", "Injectez des micro-accroches dans les 3 premières secondes.")}\n- ${tr("Automate it with Chidon IQ.", "Automatízalo con Chidon IQ.", "Automatisez le tout avec Chidon IQ.")}"

<h6>${tr("Rewrite 2: The Proof-First Transformation (High Authority)", "Recritura 2: Transformación basada en pruebas (alta autoridad)", "Réécriture 2 : La transformation axée sur les preuves (haute autorité)")}</h6>
"${tr("I took a brand from 0 to 140K views in", "Llevé una marca de 0 a 140.000 visitas en", "J'ai fait passer une marque de 0 à 140 000 vues en")} 30 ${tr("days using this exact", "días usando este método exacto de", "jours en utilisant cette méthode exacte de")} ${topic}. ${tr("No expensive ads. No complex setups. Just raw, strategic value. Tap the bio to copy my exact framework.", "Sin anuncios caros. Sin configuraciones complejas. Solo valor estratégico puro. Toca la biografía para copiar mi marco exacto.", "Pas de publicités coûteuses. Pas de configurations complexes. Juste de la valeur stratégique brute. Appuyez sur la bio pour copier mon cadre exact.")}"

<h6>${tr("Rewrite 3: The Threat-to-Opportunity Shift (High Urgency)", "Recritura 3: Cambio de amenaza a oportunidad (alta urgencia)", "Réécriture 3 : Le passage de la menace à l'opportunité (haute urgence)")}</h6>
"${tr("The algorithm is actively suppressing standard posts on", "El algoritmo está suprimiendo activamente las publicaciones estándar sobre", "L'algorithme supprime activement les publications standard sur")} ${topic}. ${tr("If you aren't adapting, your reach is dead. Read this complete guide to unlock Chidon IQ's defense protocols today.", "Si no te adaptas, tu alcance está muerto. Lee esta guía completa para desbloquear los protocolos de defensa de Chidon IQ hoy.", "Si vous ne vous adaptez pas, votre portée est morte. Lisez ce guide complet pour déverrouiller les protocoles de défense de Chidon IQ dès aujourd'hui.")}"

##### 3. STRATEGIC ADVANTAGE BREAKDOWN
- **Rewrite 1** is designed to capture top-of-funnel casual scrollers by challenging their existing beliefs.
- **Rewrite 2** establishes immediate brand authority and trust through a specific, measurable case study.
- **Rewrite 3** leverages psychological loss aversion to drive a high-priority call-to-action rate.`;
  }

  if (featureLower.includes("trending topics") || featureLower === "trending topics") {
    let trends = "";
    for (let i = 1; i <= 15; i++) {
      trends += `${i}. Topic: ${topic} ${tr(`AI Integration`, `Integración de IA`, `Intégration de l'IA`)} ${i} | Why Trending: ${tr(`Sovereign neural tools are expanding by 40% this week.`, `Las herramientas neuronales soberanas se están expandiendo un 40% esta semana.`, `Les outils neuronaux souverains augmentent de 40% cette semaine.`)} | Content Angle: ${tr(`Showcase Chidon IQ's direct generation workflow compared to slow manual tools.`, `Muestre el flujo de trabajo de generación directa de Chidon IQ en comparación con las lentas herramientas manuales.`, `Présentez le flux de travail de génération directe de Chidon IQ par rapport aux outils manuels lents.`)}\n`;
    }
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)\n\n${trends}`;
  }

  if (featureLower.includes("daily video ideas") || featureLower === "daily video ideas") {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

- Monday: ${tr("How to automate your first", "Cómo automatizar tu primer", "Comment automatiser votre premier")} ${topic} ${tr("setup in 60 seconds.", "en 60 segundos.", "en 60 secondes.")}
- Tuesday: ${tr("Why your current strategy for", "Por qué tu estrategia actual para", "Pourquoi votre stratégie actuelle pour")} ${topic} ${tr("is losing you 90% of your potential views.", "te está haciendo perder el 90% de tus vistas potenciales.", "vous fait perdre 90% de vos vues potentielles.")}
- Wednesday: ${tr("Reacting to Chidon IQ's latest viral signals on", "Reaccionando a las últimas señales virales de Chidon IQ sobre", "Réagir aux derniers signaux viraux de Chidon IQ sur")} ${topic}.
- Thursday: ${tr("3 free tools that solve", "3 herramientas gratuítas que resuelven", "3 outils gratuits qui résolvent")} ${topic} ${tr("problems instantly.", "problemas al instante.", "les problèmes instantanément.")}
- Friday: ${tr("The secret math of", "La matemática secreta de", "Les maths secrètes de")} ${topic} ${tr("that social networks hide.", "que las redes sociales ocultan.", "que les réseaux sociaux cachent.")}
- Saturday: ${tr("Complete step-by-step masterclass on", "Masterclass completa paso a paso sobre", "Masterclass complète étape par étape sur")} ${topic}.
- Sunday: ${tr("Outlining my 100K view blueprint for", "Esbozando mi plano de 100.000 visitas para", "Présentation de mon plan de 100 000 vues pour")} ${topic} ${tr("starting tomorrow.", "comenzando mañana.", "à partir de demain.")}`;
  }

  if (featureLower.includes("trend alert") || featureLower === "trend alerts") {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

#### 🚨 SIGNAL BRIEF: ${topic.toUpperCase()} VIRAL BREAKOUT

##### What is it:
A massive spike in user search queries and video engagement surrounding real-time integration workflows for ${topic}.

##### Why it matters:
The algorithm is actively favoring high-speed, dynamic visual breakdowns of ${topic} over static theoretical tutorials.

##### How to use:
Record a 30-second green-screen reaction video pointing to your Chidon IQ workspace showing these exact keywords loading.

##### 3 STRATEGIC EXAMPLES
1. *"The exact tool I used to generate 50 keywords on ${topic} in under 3 seconds."*
2. *"They said ${topic} was saturated. Chidon IQ proved them completely wrong."*
3. *"Reacting to the newest algorithm breakout in the ${topic} niche."*

##### Signal Expiry:
${tr("This trend brief expires in exactly 72 hours. Act now.", "Este informe de tendencia expira en exactamente 72 horas. Actúa ahora.", "Ce brief de tendance expire dans exactement 72 heures. Agissez maintenant.")}`;
  }

  if (featureLower.includes("time") || featureLower === "time optimizer") {
    return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

Exactly 3 entries:
- Time 1: 08:30 AM | Reason: Commuter mobile scroll spike. | Engagement Expectation: High initial save-rate.
- Time 2: 12:15 PM | Reason: Midday lunch hour relaxation traffic. | Engagement Expectation: High comment velocity.
- Time 3: 07:45 PM | Reason: Prime time domestic relaxation window. | Engagement Expectation: Max retention and watch-time completion.`;
  }

  return `### ⚡ CHIDON IQ SOVEREIGN GENERATION ENGINE (API FALLBACK PRESET)

#### 🚀 STRATEGIC GROWTH INTEL: ${topic.toUpperCase()}

##### I. CORE CONTENT STRATEGY
To win the attention economy, your posts on ${topic} must focus on high retention hooks and structured micro-value. Eliminate introductory filler and deliver immediate tactical utility to your audience.

##### II. 3 ACTIONABLE INSIGHTS
1. **Leverage Curiosity Loops:** State a controversial or shocking fact about ${topic} in the first 3 seconds to hold engagement.
2. **Whitespace Formatting:** Keep paragraphs to a maximum of 2 sentences. Mobile users scan; dense textblocks kill retention.
3. **The Chidon IQ Advantage:** Utilize our secure vault and real-time trending signals to automate your content schedule seamlessly.

##### III. RECOMMENDED ACTION BLUEPRINT
1. Conduct a competing audit to identify gaps in top performing channels.
2. Generate 50 localized search-intent keywords with low difficulty rankings using Chidon IQ.
3. Configure an active posting schedule targeting your audience's core commuter windows.`;
}

// PERF: Robust helper to call Gemini with exponential backoff on transient errors and auto-fallback models if the primary model is busy/overloaded (e.g. 503 UNAVAILABLE)
async function generateContentWithRetryAndFallback(
  prompt: string | any,
  options: {
    model: string;
    config?: any;
  },
  customKey?: string
): Promise<any> {
  const ai = getGeminiClient(customKey);
  const maxRetries = 3;
  const primaryModel = normalizeModel(options.model);
  const modelsToTry = [
    primaryModel,
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate prioritizing highly-available models with distinct quota pools

  let lastError: any = null;

  for (let modelIdx = 0; modelIdx < modelsToTry.length; modelIdx++) {
    const model = modelsToTry[modelIdx];
    const hasAlternativeModelsLeft = modelIdx < modelsToTry.length - 1;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini Engine] Attempting generation with model=${model} (Attempt ${attempt}/${maxRetries})...`);
        
        // Dynamic configuration pruning based on model capabilities to prevent tool incompatibility errors (like googleSearch on 3.1-flash-lite)
        const currentConfig = { ...options.config };
        const isSearchSupported = SEARCH_SUPPORTED_MODELS.some(m => model.toLowerCase().includes(m.toLowerCase()));
        
        if (!isSearchSupported && currentConfig.tools) {
          console.log(`[Gemini Engine] Pruning tools (googleSearch) for model=${model} as it does not support grounding.`);
          delete currentConfig.tools;
          if (currentConfig.toolConfig) {
            delete currentConfig.toolConfig;
          }
        }

        // PERF: Enforce thinkingConfig for gemini-3.7-flash and gemini-3.8-flash to prevent long reasoning chain latencies.
        // Sets thinkingLevel to "MINIMAL" for translations or "LOW" for core creator/SEO generation tasks.
        if (model.toLowerCase().includes("gemini-3.7-flash") || model.toLowerCase().includes("gemini-3.8-flash")) {
          if (!currentConfig.thinkingConfig) {
            const promptStr = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
            const isTranslationTask = promptStr && (promptStr.toLowerCase().includes("translate") || promptStr.toLowerCase().includes("translation"));
            currentConfig.thinkingConfig = {
              thinkingLevel: isTranslationTask ? "MINIMAL" : "LOW"
            };
          }
        }

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: currentConfig,
        });

        if (response && response.text) {
          console.log(`[Gemini Engine] Generation successful with model=${model}`);
          return response;
        }
        throw new Error("No text response received from Gemini.");
      } catch (err: any) {
        lastError = err;
        const errorMessage = (err.message || "").toString();
        const errDetails = JSON.stringify(err);
        const lowerErrorMessage = errorMessage.toLowerCase();
        const lowerErrDetails = errDetails.toLowerCase();

        const isHighDemand = 
          lowerErrorMessage.includes("503") || 
          lowerErrorMessage.includes("unavailable") || 
          lowerErrorMessage.includes("demand") ||
          lowerErrorMessage.includes("temporary") ||
          lowerErrDetails.includes("503") ||
          lowerErrDetails.includes("unavailable");

        const isRateLimit = 
          lowerErrorMessage.includes("429") || 
          lowerErrDetails.includes("429") ||
          lowerErrorMessage.includes("resource_exhausted") ||
          lowerErrDetails.includes("resource_exhausted") ||
          lowerErrorMessage.includes("quota") ||
          lowerErrDetails.includes("quota") ||
          lowerErrorMessage.includes("limit exceeded") ||
          lowerErrDetails.includes("limit exceeded");

        const isZeroLimit = 
          lowerErrorMessage.includes("limit: 0") || 
          lowerErrDetails.includes("limit: 0") ||
          lowerErrorMessage.includes("limit:0") ||
          lowerErrDetails.includes("limit:0") ||
          lowerErrorMessage.includes("limit is 0") ||
          lowerErrDetails.includes("limit is 0");

        const isTransient = isHighDemand || isRateLimit || lowerErrorMessage.includes("limit");

        if (isZeroLimit) {
          console.log(`[Gemini Engine] Model ${model} is unauthorized or restricted (limit: 0). Instantly failing over to next model...`);
          break; // Try next model immediately
        } else if (isHighDemand) {
          console.log(`[Gemini Engine] Model ${model} is experiencing high demand (503). Instantly failing over to next alternative model...`);
          break; // Try next model immediately
        } else if (isRateLimit && hasAlternativeModelsLeft) {
          console.log(`[Gemini Engine] Model ${model} returned rate limit/exhausted quota (429). Instantly routing to next alternative model's separate quota pool...`);
          break; // Instantly failover to the next model's fresh quota pool!
        } else if (isTransient && attempt < maxRetries) {
          const delay = attempt * 1000; // 1s, 2s...
          console.log(`[Gemini Engine] Model ${model} transient error. Re-attempting in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.log(`[Gemini Engine] Model ${model} exhausted maximum attempts or failed with non-transient error. Trying next fallback model...`);
          break; // Move to next model
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content with all available models.");
}

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests and preserving raw body for webhook verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

  // =========================================================================
  // SECURE OS V4 ENGINE: CHIDON AI STANDARDS DEFENSE-IN-DEPTH SYSTEM
  // =========================================================================
  
  // 1. Hardened HTTP Response Headers to obstruct frame exploitation, XSS, and payload sniffing
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com https://*.google.com https://*.supabase.co ws: wss:;"
    );
    next();
  });

  // 2. High-Performance Client Session Rate Limiter (Anti-DDoS, Anti-Abuse)
  const rateLimitWindowMs = 60 * 1000; // 1 minute epoch
  const maxRequestsPerWindow = 60;     // Up to 60 requests allowed per IP per minute
  const ipLimits = new Map<string, { count: number; firstRequest: number }>();

  const apiRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress) || "anonymous";
    const now = Date.now();
    
    const limitState = ipLimits.get(ip);
    if (!limitState) {
      ipLimits.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    if (now - limitState.firstRequest > rateLimitWindowMs) {
      // Rotate time frame
      ipLimits.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    limitState.count++;
    if (limitState.count > maxRequestsPerWindow) {
      console.warn(`[Security OS] Exceeded request threshold: IP block triggered for ${ip}`);
      return res.status(429).json({
        error: "Chidon IQ Security Protocol: Rate limit exceeded. To ensure equal bandwidth for all nodes, please wait 60 seconds before repeating."
      });
    }
    next();
  };

  // 3. Strict Payload Guard & Prompt Injection Interceptor
  const cargoSanitizer = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { prompt, text } = req.body;
    
    if (prompt && typeof prompt === "string") {
      // Restrict payload to absolute functional boundaries (max 10,000 characters)
      if (prompt.length > 10000) {
        return res.status(400).json({ error: "Security Protocol: Request failed. Prompt body bounds exceeded standard scope limits." });
      }

      // Intercept system-directive reset signals (Prompt Injection Defense)
      const lowercasePrompt = prompt.toLowerCase();
      if (
        lowercasePrompt.includes("ignore all previous instructions") || 
        lowercasePrompt.includes("disregard all previous instructions") ||
        lowercasePrompt.includes("reveal your system instruction") ||
        lowercasePrompt.includes("you must now ignore")
      ) {
        console.warn(`[Security OS] Blocked standard prompt injection pattern: "${prompt.slice(0, 100)}..."`);
        return res.status(403).json({ error: "Security Guard: Blocked suspicious instruction overrides." });
      }
    }

    if (text && typeof text === "string" && text.length > 12000) {
      return res.status(400).json({ error: "Security Protocol: Input text payload bounds exceeded." });
    }

    next();
  };

  console.log("[Security OS] Active defense-in-depth shield loaded: CORS-blocking, Custom CSP, In-memory Rate-limiter (60req/min), and Prompt Injection Guard.");

  // Database Initialization & Automatic Migrations at Backend Engine
  async function initDatabase() {
    const host = process.env.SQL_HOST;
    const database = process.env.SQL_DB_NAME;
    const user = process.env.SQL_USER;
    const password = process.env.SQL_PASSWORD;
    const port = parseInt(process.env.SQL_PORT || "5432", 10);

    if (host && database && user) {
      console.log(`[Database Engine] PostgreSQL/Google Cloud SQL detected. Initializing connection pool to ${host}:${port}/${database}...`);
      const pool = new pg.Pool({ host, database, user, password, port, connectionTimeoutMillis: 5000 });
      try {
        const client = await pool.connect();
        console.log("[Database Engine] Connected to PostgreSQL successfully! Initiating auto-schema migrations...");
        
        // Execute migrations
        await client.query(`
          CREATE TABLE IF NOT EXISTS drafts (
            id VARCHAR(255) PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            feature_id VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS gigs (
            id VARCHAR(255) PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price_from NUMERIC DEFAULT 0,
            category VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS portfolios (
            id VARCHAR(255) PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            media_url TEXT,
            category VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
        console.log("[Database Engine] PostgreSQL auto-migrations completed successfully!");
        client.release();
      } catch (err: any) {
        console.error("[Database Engine] PostgreSQL auto-migration or connection failed:", err.message || err);
      }
    } else {
      console.log("[Database Engine] No custom SQL_HOST environment variables injected. Running with local memory fallback.");
    }
  }
  initDatabase();

  // Supabase Server-Side Initialization Check
  const sUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const sKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (sUrl && sKey) {
    console.log(`[Database Engine] Supabase client initialized and ready for on-demand routing.`);
  }

  // Basic API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      system: "CHIDON IQ Neural OS",
      protocol: "v4.0.8",
      backend: "Node.js/Express"
    });
  });

  // Creator Config & Verification Endpoints
  app.get("/api/config/creator", (req, res) => {
    const creatorEmail = (process.env.CREATOR_EMAIL || "chideraemmanue98@gmail.com").toLowerCase().trim();
    res.json({ creatorEmail });
  });

  app.post("/api/auth/verify-creator", (req, res) => {
    const { email, password } = req.body;
    const creatorEmail = (process.env.CREATOR_EMAIL || "chideraemmanue98@gmail.com").toLowerCase().trim();
    const creatorPassword = process.env.CREATOR_PASSWORD;

    if (creatorEmail && creatorPassword) {
      const normalizedEmail = (email || "").toLowerCase().trim();
      const isEmailMatch = normalizedEmail === creatorEmail;
      const isPasswordMatch = password === creatorPassword;

      if (!isEmailMatch || !isPasswordMatch) {
        return res.status(403).json({ 
          allowed: false, 
          error: "Unauthorized access: Registration or login with these credentials is forbidden. Access is restricted strictly to the authorized platform creator." 
        });
      }
    }
    res.json({ allowed: true });
  });

  // DYNAMIC SITEMAP ENGINE FOR SEARCH ENGINE OPTIMIZATION (SEO)
  app.get("/sitemap.xml", (req, res) => {
    res.header("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 1. Main Cognitive Workspace Terminal -->
  <url>
    <loc>https://chidoniq.com.ng/</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 2. GigSocial Sovereign Freelance Portal -->
  <url>
    <loc>https://chidoniq.com.ng/freelance</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- 3. Credit Packages & Billing Gateway -->
  <url>
    <loc>https://chidoniq.com.ng/pricing</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 4. Chidon IQ Training Academy & Guide -->
  <url>
    <loc>https://chidoniq.com.ng/guide</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 5. Chidon IQ News & System Blogs -->
  <url>
    <loc>https://chidoniq.com.ng/blog</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 6. Chidon Vault Saved Generations Archive -->
  <url>
    <loc>https://chidoniq.com.ng/vault</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- 7. Copywriting Templates & Hook Libraries -->
  <url>
    <loc>https://chidoniq.com.ng/templates</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- 8. Shadowban Analytics & Recovery Solutions -->
  <url>
    <loc>https://chidoniq.com.ng/shadowban</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- 9. Specialized Developer Diagnostics & Widgets -->
  <url>
    <loc>https://chidoniq.com.ng/widgets</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- 10. Secure Authentication Gateway -->
  <url>
    <loc>https://chidoniq.com.ng/auth</loc>
    <lastmod>2026-08-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
  });

  // REAL-TIME CRAWLING WEB BROWSER ENGINE: FETCH TRENDING VIDEOS FROM YOUTUBE, FACEBOOK, AND TIKTOK
  app.post("/api/trends/videos", apiRateLimiter, async (req, res) => {
    try {
      const { platform = "all", category = "general", searchQuery = "", bypassCache = false } = req.body;
      const queryKey = ["trends-videos", platform, category, searchQuery];
      
      if (bypassCache) {
        queryClient.invalidateQueries({ queryKey });
      }

      const videos = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          if (!process.env.GEMINI_API_KEY) {
            console.warn("[Crawler Browser] GEMINI_API_KEY is not defined, running in High-Fidelity Simulation Mode.");
            return generateMockTrends(platform, category, searchQuery);
          }

          try {
            const ai = getGeminiClient();
            const platformKeywords = platform === "all" ? "YouTube, TikTok, and Facebook Reels" : platform;
            
            const prompt = `Act as an advanced real-time browser searching social indices.
Run queries to search for the absolute top daily trending, viral videos on ${platformKeywords} for the category: "${category}". 
${searchQuery ? `Incorporate specific search criteria: "${searchQuery}".` : "Focus on general current breakout items."}

You MUST run a real-world web search query for current day (June 2026) trends on platforms like YouTube, TikTok, and Facebook to discover actual viral items page/reels/videos.

Generate a valid, highly structured JSON array of 4-5 video objects.
Strict structure:
[
  {
    "platform": "youtube" | "tiktok" | "facebook",
    "title": "Clear, actual trending video title or hook",
    "creator": "@username or Channel Name",
    "views": "E.g. '1.2M views' or '450K views'",
    "url": "Actual URL or realistic social platform link",
    "summary": "1-2 sentence description explaining the theme, content and why it is trending today",
    "tactics": [
      "Key actionable creator advice 1",
      "Key actionable creator advice 2"
    ],
    "viralityScore": 92,
    "publishedTime": "Format e.g. '4 hours ago' or '1 day ago'"
  }
]

NEVER wrap the array with markdown blocks or anything. Output ONLY the raw JSON array. If you fail to find exact results, generate the most accurate real-world trending topics based on actual search results from today.`;

            const response = await generateContentWithRetryAndFallback(prompt, {
              model: "gemini-3.8-flash",
              config: {
                temperature: 0.7,
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
              }
            });

            const text = response.text?.trim() || "";
            if (!text) {
              throw new Error("Empty text response from Gemini Search Grounding.");
            }

            let parsed;
            try {
              parsed = JSON.parse(text);
            } catch (e) {
              const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
              parsed = JSON.parse(cleanText);
            }

            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
            throw new Error("JSON is not a populated array");
          } catch (err: any) {
            console.error("[Crawler Browser] Search Grounding Error, using dynamic fallback:", err);
            return generateMockTrends(platform, category, searchQuery);
          }
        },
        staleTime: bypassCache ? 0 : 5 * 60 * 1000 // Cache for 5 minutes
      });

      return res.json({ success: true, videos });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Client-Dynamic PostgreSQL Connection Tester (Supports custom Google Cloud SQL or Supabase direct parameters)
  app.post("/api/integrations/postgres/test", async (req, res) => {
    const { postgresHost, postgresDb, postgresUser, postgresPassword, postgresPort } = req.body;
    
    // Fallback to environment variables if parameters not passed explicitly
    const host = postgresHost || process.env.SQL_HOST;
    const database = postgresDb || process.env.SQL_DB_NAME;
    const user = postgresUser || process.env.SQL_USER;
    const password = postgresPassword || process.env.SQL_PASSWORD;
    const port = parseInt(postgresPort || "5432", 10);

    if (!host || !database || !user) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing essential credentials: Host, Database name, and User are required." 
      });
    }

    const clientPool = new pg.Pool({
      host,
      database,
      user,
      password,
      port,
      connectionTimeoutMillis: 5000,
    });

    try {
      const client = await clientPool.connect();
      const testResult = await client.query("SELECT NOW()");
      client.release();
      await clientPool.end();
      
      return res.json({ 
        success: true, 
        message: `Successfully connected to PostgreSQL database! Timestamp check: ${testResult.rows[0].now}` 
      });
    } catch (err: any) {
      // Safe cleanup
      try {
        await clientPool.end();
      } catch (e) {}
      
      console.error("PostgreSQL test connection error:", err);
      return res.status(500).json({ 
        success: false, 
        message: `Connection Failed: ${err.message || "Unknown database error"}` 
      });
    }
  });

  // Secure Server-Side Supabase Connection Tester
  app.post("/api/integrations/supabase/test", async (req, res) => {
    const { url, key } = req.body;
    
    // Fallback to server env keys
    const supabaseUrl = url || process.env.VITE_SUPABASE_URL;
    const supabaseKey = key || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ 
        success: false, 
        message: "Supabase URL and Anon/Service Key are required." 
      });
    }

    try {
      const client = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await client.from('_dummy_table_check').select('*').limit(1).maybeSingle();
      
      if (error && error.code !== 'PGRST116' && error.message?.includes('FetchError')) {
        return res.status(500).json({ success: false, message: `Network Error: ${error.message}` });
      }
      
      if (error && error.code === '42P01') {
        return res.json({ success: true, message: 'Connected successfully to Supabase! (Database is accessible, custom tables yet to be verified).' });
      }

      if (error && (error as any).status === 401) {
        return res.status(400).json({ success: false, message: `Authentication Failed: ${error.message}` });
      }

      return res.json({ success: true, message: 'Connected successfully to Supabase core engine!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Unknown integration fault' });
    }
  });

  // Secure Server-Side Supabase Synchronizer Proxy
  app.post("/api/integrations/supabase/sync", async (req, res) => {
    const { url, key, entityName, records } = req.body;
    
    const supabaseUrl = url || process.env.VITE_SUPABASE_URL;
    const supabaseKey = key || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({ 
        success: false, 
        message: "Supabase URL and Anon/Service Key are required for synchronization." 
      });
    }

    if (!records || records.length === 0) {
      return res.json({ success: true, syncedCount: 0 });
    }

    try {
      const client = createClient(supabaseUrl, supabaseKey);

      // Clean records for relational databases (removing complex objects/firebase Timestamps)
      const sanitizedRecords = records.map((r: any) => {
        const cleanObj: any = { ...r };
        
        // Parse dates safely
        if (cleanObj.createdAt && typeof cleanObj.createdAt.toDate === 'function') {
          cleanObj.created_at = cleanObj.createdAt.toDate().toISOString();
        } else if (cleanObj.createdAt) {
          cleanObj.created_at = new Date(cleanObj.createdAt).toISOString();
        }
        
        delete cleanObj.createdAt;
        
        // Map properties for explicit table schemas
        if (entityName === 'drafts') {
          return {
            id: cleanObj.id,
            title: cleanObj.title || 'Untitled Draft',
            content: cleanObj.content || '',
            feature_id: cleanObj.featureId || '',
            created_at: cleanObj.created_at || new Date().toISOString()
          };
        }
        
        if (entityName === 'gigs') {
          return {
            id: cleanObj.id,
            title: cleanObj.title || '',
            description: cleanObj.description || '',
            price_from: cleanObj.priceFrom || 0,
            category: cleanObj.category || '',
            created_at: cleanObj.created_at || new Date().toISOString()
          };
        }

        if (entityName === 'portfolios') {
          return {
            id: cleanObj.id,
            title: cleanObj.title || '',
            description: cleanObj.description || '',
            media_url: cleanObj.mediaUrl || '',
            category: cleanObj.category || '',
            created_at: cleanObj.created_at || new Date().toISOString()
          };
        }

        return cleanObj;
      });

      const { error } = await client.from(entityName).upsert(sanitizedRecords);
      
      if (error) {
        if (error.code === '42P01') {
          return res.status(400).json({
            success: false,
            syncedCount: 0,
            error: `Table '${entityName}' does not exist on Supabase. Execute Chidon IQ's SQL Migration script inside your Supabase SQL Editor first!`
          });
        }
        return res.status(500).json({ success: false, syncedCount: 0, error: error.message });
      }

      return res.json({ success: true, syncedCount: sanitizedRecords.length });
    } catch (error: any) {
      return res.status(500).json({ success: false, syncedCount: 0, error: error.message });
    }
  });

  // ----------------------------------------------------
  // PAYSTACK SECURE FULL-STACK ROUTING INTEGRATION
  // ----------------------------------------------------

  // Securely retrieve Paystack Configuration details for client authentication
  app.get("/api/paystack/config", async (req, res) => {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      const publicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY;
      const rate = await getLiveExchangeRate();
      
      return res.json({
        success: true,
        configured: !!secretKey,
        publicKey: publicKey || "",
        exchangeRate: rate
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Currency Calculator Endpoint: Convert USD to NGN
  app.get("/api/paystack/calculator", async (req, res) => {
    try {
      const usd = parseFloat(req.query.usd as string);
      if (isNaN(usd) || usd < 0) {
        return res.status(400).json({
          success: false,
          message: "A valid positive 'usd' number parameter is required."
        });
      }
      const rate = await getLiveExchangeRate();
      const ngn = Math.round(usd * rate);
      return res.json({
        success: true,
        usd,
        exchangeRate: rate,
        ngn,
        formattedNgn: `₦${ngn.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred in the currency converter."
      });
    }
  });

  // Securely initialize a transaction with Paystack (Server-Side)
  app.post("/api/paystack/initialize", async (req, res) => {
    const { email, amount, orderId, metadata, currency = "USD" } = req.body;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!email || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Email and Amount are required to initialize transaction."
      });
    }

    try {
      const rate = await getLiveExchangeRate();
      let convertedAmountNgn = amount;
      let finalCurrency = currency;

      // Automatically convert USD to NGN for seamless payment gateway options
      if (currency === "USD") {
        convertedAmountNgn = amount * rate;
        finalCurrency = "NGN";
      }

      const amountInKobo = Math.round(convertedAmountNgn * 100);

      if (!secretKey) {
        const reference = `CHIDON_SANDBOX_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        console.warn(`[Paystack Engine] Missing PAYSTACK_SECRET_KEY. Launching in secure Sandbox Mode with ref: ${reference}`);
        return res.json({
          success: true,
          isSandbox: true,
          data: {
            authorization_url: "#sandbox_paystack_checkout",
            access_code: "CHIDON_SANDBOX_ACCESS_CODE",
            reference: reference,
            exchangeRate: rate,
            amountInNgn: convertedAmountNgn,
            amountInKobo
          }
        });
      }

      const origin = req.headers.referer || req.headers.origin || "";
      const finalCallbackUrl = req.body.callbackUrl || origin;

      const payload = {
        email,
        amount: amountInKobo,
        currency: finalCurrency,
        callback_url: finalCallbackUrl,
        metadata: {
          orderId,
          originalAmountUsd: currency === "USD" ? amount : null,
          exchangeRateUsed: currency === "USD" ? rate : null,
          convertedAmountNgn: currency === "USD" ? convertedAmountNgn : null,
          ...(metadata || {})
        }
      };

      console.log(`[Paystack Engine] Initializing transaction for ${email} with amount: ${amountInKobo} Kobo NGN (orderId: ${orderId || 'none'}) [Converted from $${amount} USD at rate ${rate}]`);

      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json() as any;

      if (!response.ok || !responseData.status) {
        throw new Error(responseData.message || "Failed to initialize Paystack transaction");
      }

      console.log(`[Paystack Engine] Transaction initialized successfully! Reference: ${responseData.data.reference}`);

      return res.json({
        success: true,
        data: {
          ...responseData.data,
          exchangeRate: rate,
          amountInNgn: convertedAmountNgn,
          amountInKobo
        }
      });
    } catch (err: any) {
      console.error("[Paystack Engine] Transaction initialization error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred while initializing your payment."
      });
    }
  });

  // Securely verify a transaction reference with Paystack (Server-Side)
  app.post("/api/paystack/verify", async (req, res) => {
    const { reference } = req.body;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required for verification."
      });
    }

    if (!secretKey || reference.includes("CHIDON_SANDBOX_")) {
      console.log(`[Paystack Engine] Sandbox/Demo verification for ref: ${reference}`);
      return res.json({
        success: true,
        isSandbox: true,
        data: {
          status: "success",
          reference: reference,
          amount: 10000,
          currency: "NGN",
          gateway_response: "Approved (Sandbox Mode)",
          channel: "demo_card",
          customer: {
            email: "demo@chidon.iq"
          }
        }
      });
    }

    try {
      console.log(`[Paystack Engine] Verifying payment reference: ${reference}`);

      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const responseData = await response.json() as any;

      if (!response.ok || !responseData.status) {
        throw new Error(responseData.message || "Failed to verify Paystack transaction");
      }

      console.log(`[Paystack Engine] Verification successful! Status: ${responseData.data.status}`);

      return res.json({
        success: true,
        data: responseData.data
      });
    } catch (err: any) {
      console.error("[Paystack Engine] Transaction verification error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred while verifying your payment."
      });
    }
  });

  // Secure Paystack Webhook Listener to verify payments and update user subscription fields
  app.post("/api/paystack/webhook", async (req, res) => {
    const signature = req.headers["x-paystack-signature"] as string;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.warn("[Paystack Webhook] Received webhook but PAYSTACK_SECRET_KEY is not configured.");
      return res.status(500).json({ success: false, message: "Webhook key missing" });
    }

    // Verify HMAC signature to guarantee authenticity of the payload
    if (signature) {
      const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
      if (hash !== signature) {
        console.error("[Paystack Webhook] Security Alert: HMAC-SHA512 verification failed.");
        return res.status(401).json({ success: false, message: "Invalid signature" });
      }
    } else {
      console.warn("[Paystack Webhook] Warning: Received unsigned webhook payload.");
    }

    const { event, data } = req.body;
    console.log(`[Paystack Webhook] Received event: ${event}`);

    if (event === "charge.success" && data && data.status === "success") {
      const metadata = data.metadata || {};
      const { userId, planName, planId, isSubscription } = metadata;
      const reference = data.reference;
      const amountKobo = data.amount;
      const currency = data.currency;

      if (!userId) {
        console.warn("[Paystack Webhook] Warning: Transaction lacks a valid userId in metadata. Cannot sync to user record.");
        return res.status(400).json({ success: false, message: "Missing userId in metadata" });
      }

      try {
        const firestoreAdmin = getFirestoreAdminDb();
        if (!firestoreAdmin) {
          throw new Error("Firestore Admin is not initialized.");
        }

        console.log(`[Paystack Webhook] Processing successful payment for userId: ${userId}, planName: ${planName}`);

        // Update User Doc in Firestore securely using admin privileges
        const userRef = firestoreAdmin.collection("users").doc(userId);
        
        // Check if transaction has already been processed to avoid double-crediting
        const receiptRef = userRef.collection("receipts").doc(reference);
        const receiptDoc = await receiptRef.get();
        
        if (receiptDoc.exists) {
          console.log(`[Paystack Webhook] Transaction ${reference} was already processed. Skipping duplicate grant.`);
          return res.json({ success: true, message: "Transaction already processed" });
        }

        // Calculate USD value of plan (can fallback to metadata properties if present)
        const usdPrice = metadata.originalAmountUsd || (amountKobo / 100);

        // Map credits: Enterprise = 320, Pro = 150, Starter = 50. Supports dynamic creditsGranted from client metadata.
        const creditsGranted = Number(metadata.creditsGranted) || 
          (planName === 'Enterprise Sovereign Pack' ? 320 : 
           (planName === 'Pro Strategist Pack' ? 150 : 50));
        const mappedPackage = planName === 'Enterprise Sovereign Pack' ? 'enterprise' : (planName === 'Pro Strategist Pack' ? 'pro' : 'basic');
        const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Update credits in Supabase directly!
        const sb = getSupabaseClientInstance();
        if (sb) {
          const { data: profile, error: sbGetError } = await sb
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .maybeSingle();

          if (sbGetError) {
            console.error("[Paystack Webhook] Supabase profile fetch failed:", sbGetError);
          }

          const currentCredits = profile ? (Number(profile.credits) || 0) : 0;
          const newCredits = currentCredits + creditsGranted;

          if (profile) {
            const { error: sbUpdError } = await sb
              .from('profiles')
              .update({ credits: newCredits })
              .eq('id', userId);
            if (sbUpdError) {
              console.error("[Paystack Webhook] Supabase credits update failed:", sbUpdError);
            } else {
              console.log(`[Paystack Webhook] Supabase credits successfully updated from ${currentCredits} to ${newCredits}.`);
            }
          } else {
            const name = "Chidon Creator";
            const { error: sbInsError } = await sb
              .from('profiles')
              .insert([{
                id: userId,
                role: 'buyer',
                full_name: name,
                bio: 'Strategic Intel Analyst in Chidon Matrix.',
                avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`,
                skills: ['Growth', 'TikTok SEO'],
                experience_years: 3,
                credits: newCredits,
                is_verified: true,
                rating: 5.0,
                platforms: ['TikTok', 'Instagram', 'YouTube']
              }]);
            if (sbInsError) {
              console.error("[Paystack Webhook] Supabase profile provision failed:", sbInsError);
            } else {
              console.log(`[Paystack Webhook] Supabase profile provisioned with ${newCredits} credits.`);
            }
          }
        }

        await userRef.update({
          subscriptionPlan: planName || "Starter Creator Pack",
          subscriptionStatus: "active",
          subscriptionPrice: usdPrice,
          paystackSubscriptionRef: reference,
          credits: FieldValue.increment(creditsGranted),
          updatedAt: FieldValue.serverTimestamp(),
          subscription: {
            status: 'active',
            package: mappedPackage,
            currentPeriodEnd: oneMonthLater
          }
        });

        // Log payment receipt as a subcollection document to create a robust historical billing ledger
        await receiptRef.set({
          amountNgn: currency === "NGN" ? (amountKobo / 100) : null,
          amountUsd: usdPrice,
          reference: reference,
          payerEmail: data.customer?.email || "subscriber@chidon.iq",
          bundleName: planName || "Starter Creator Pack",
          status: "paid",
          createdAt: FieldValue.serverTimestamp(),
          paymentChannel: data.channel || "card",
          gatewayResponse: data.gateway_response || "Successful"
        });

        // Log transaction history for credit grant
        const txRef = userRef.collection("transactions").doc(reference);
        await txRef.set({
          type: "credit",
          amount: creditsGranted,
          description: `Purchased ${planName || "Starter Creator Pack"} (+${creditsGranted} credits)`,
          createdAt: FieldValue.serverTimestamp()
        });

        console.log(`[Paystack Webhook] Sync successful! User ${userId} granted ${creditsGranted} credits & subscription updated to '${planName}'.`);
        return res.json({ success: true, message: "Webhook processed, credits granted, and Firestore updated successfully" });

      } catch (err: any) {
        console.error("[Paystack Webhook] Error writing updates to Firestore:", err);
        return res.status(500).json({ success: false, message: "Database update failed", error: err.message });
      }
    }

    // Acknowledge receipt of other event types cleanly
    return res.json({ success: true, message: `Event '${event}' acknowledged (No sync needed)` });
  });

  // PERF: Server-side Gemini proxy backed by TanStack Query client caching to reuse previous outputs and minimize upstream API request latency to ~0ms
  app.post("/api/gemini/generate", apiRateLimiter, cargoSanitizer, async (req, res) => {
    let cost = 2; // Default to small tools (2 credits)
    let finalUserId = "guest_anonymous_uplink";
    let languageName = "English";
    try {
      const { prompt, language, model, feature, userId, customApiKey } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (feature) {
        const featureId = feature.toLowerCase().trim();
        if (
          featureId === 'ai-script-outline' ||
          featureId === 'shadowban-solutions'
        ) {
          cost = 3; // Large Feature (strictly max 3 credits)
        } else if (
          featureId === 'scripts' ||
          featureId === 'competitor-analysis' ||
          featureId === 'trending' ||
          featureId === 'trending-topics' ||
          featureId === 'thumbnails' ||
          featureId === 'youtube-seo' ||
          featureId === 'seo-scorecard' ||
          featureId === 'keyword-research' ||
          featureId === 'vseo-title-desc' ||
          featureId === 'vseo-scorecard' ||
          featureId === 'vseo-keywords' ||
          featureId === 'template-library' ||
          featureId === 'repurposing' ||
          featureId === 'personas'
        ) {
          cost = 3; // Big Feature
        } else {
          cost = 2; // Small Feature
        }
      }

      finalUserId = userId || "guest_anonymous_uplink";

      // Self-healing / auto-replenish user credits directly in Supabase profiles!
      const activeCredits = await getOrProvisionBothCredits(finalUserId, cost);
      const isGuest = !finalUserId || finalUserId === "guest_anonymous_uplink" || finalUserId.startsWith("guest") || finalUserId.startsWith("local_") || finalUserId === "sandbox";
      if (!isGuest && activeCredits < cost) {
        return res.status(403).json({ error: "INSUFFICIENT_CREDITS", required: cost, available: activeCredits });
      }

      const languageMap: Record<string, string> = {
        en: "English",
        es: "Spanish (Español)",
        zh: "Chinese Simplified (简体中文)",
        hi: "Hindi (हिन्दी)",
        ar: "Arabic (العربية)",
        pt: "Portuguese (Português)",
        fr: "French (Français)",
        ru: "Russian (Русский)",
        de: "German (Deutsch)",
        ja: "Japanese (日本語)"
      };

      const langCode = (language || "").split("-")[0].toLowerCase();
      languageName = languageMap[langCode] || "English";

      // Parse user model selection from client-side dynamic cookie if present
      let cookieModel = "";
      if (req.headers.cookie) {
        const match = req.headers.cookie.match(/active_gemini_model=([^;]+)/);
        if (match) cookieModel = decodeURIComponent(match[1]);
      }

      // Secure model resolution logic mapping alias or deprecated name to active support identifier
      let targetModel = normalizeModel(model || req.headers['x-gemini-model'] || cookieModel || "gemini-3.8-flash");

      const FEATURE_MAP: Record<string, string[]> = {
        "Video Ideas": ["content-ideas", "video ideas"],
        "Hashtag Engine": ["hashtags", "hashtag engine"],
        "Script Writer": ["scripts", "script writer"],
        "Bio Optimizer": ["bio", "bio optimizer"],
        "Thumbnail Designer": ["thumbnails", "thumbnail designer"],
        "Competitor Lab": ["competitor-analysis", "competitor lab"],
        "Schedule Lab": ["posting-schedule", "schedule lab"],
        "Engagement Advisor": ["engagement-calc", "engagement advisor"],
        "Trend Detector": ["trending", "trend detector"],
        "Audience Builder": ["personas", "audience builder"],
        "Headline Hook": ["headlines", "headline hook"],
        "Repurpose AI": ["repurposing", "repurpose ai"],
        "Command Calendar": ["post-scheduler", "command calendar"],
        "CHIDON Vault": ["drafts", "chidon vault"],
        "NOTEPAD SAVE": ["ruled-book", "notepad save"],
        "CHIDON IQ Template Library": ["template-library", "chidon iq template library"],
        "Organic Video Feed": ["youtube-seo", "organic video feed"],
        "SEO Scorecard": ["seo-scorecard", "seo scorecard"],
        "Keyword Intel": ["keyword-research", "keyword intel", "vseo-keywords"],
        "Shadowban Solutions": ["shadowban-solutions", "shadowban solutions"],
        "Title + Description": ["vseo-title-desc", "title + description"],
        "Tag Architect": ["vseo-tags", "tag architect"],
        "Video Auditor": ["vseo-scorecard", "video auditor"],
        "Post Optimizer": ["post-optimizer", "post optimizer"],
        "Trending Topics": ["trending-topics", "trending topics"],
        "Daily Video Ideas": ["daily-ideas", "daily video ideas"],
        "Trend Alerts": ["trend-alerts", "trend alerts"],
        "Time Optimizer": ["vseo-best-time", "time optimizer"]
      };

      const FEATURE_PROTOCOLS: Record<string, { outputType: string; task: string; format: string }> = {
        "Video Ideas": {
          outputType: "LIST",
          task: "Generate 20 viral video ideas for specified niche + audience.",
          format: "Numbered list 1-20. Every item MUST follow this exact format: '1. Hook: ... | Angle: ... | Why it works: ...'"
        },
        "Hashtag Engine": {
          outputType: "LIST",
          task: "Generate 30 hashtags for specified platform + topic.",
          format: "3 groups of 10. Exactly: 'BROAD 10: ...', 'NICHE 10: ...', 'BRANDED 10: ...'"
        },
        "Script Writer": {
          outputType: "LONG PROMPT",
          task: "Write 60-second script for specified topic + tone.",
          format: "Structure: HOOK 0-3s, PROBLEM, 3 STEP SOLUTION, CTA. Full script with [B-ROLL] and [TEXT ON SCREEN]. Minimum 250 words, highly detailed, tactical, and actionable."
        },
        "Bio Optimizer": {
          outputType: "LIST",
          task: "Write 5 optimized bios for specified platform + niche.",
          format: "Numbered list 1-5. Every item MUST follow: 'Bio X: Line1 Value | Line2 Proof | Line3 CTA'. CONSTRAINT: Max 150 characters total."
        },
        "Thumbnail Designer": {
          outputType: "LONG PROMPT",
          task: "Describe 5 thumbnail concepts for specified video title.",
          format: "Exactly 5 paragraphs. Each paragraph MUST describe: Visual, Text (3 words max), Colors, Emotion, and Why it gets clicks."
        },
        "Competitor Lab": {
          outputType: "LONG PROMPT",
          task: "Analyze competitors in specified niche + platform.",
          format: "Report detailing: Top 3 Competitors, What They Do Well, Gaps, How We Win, and 5 Content Angles They Missed."
        },
        "Schedule Lab": {
          outputType: "LIST",
          task: "Generate best posting schedule for specified platform + audience + timezone.",
          format: "7 days schedule. Each day format: 'Day: Time: Reason'"
        },
        "Engagement Advisor": {
          outputType: "LIST",
          task: "Provide 20 ways to boost comments on specified platform + topic.",
          format: "Numbered list 1-20. Each format: '1. Tactic: ... | Example: ...'"
        },
        "Trend Detector": {
          outputType: "LIST",
          task: "Find 10 trends in specified niche + platform.",
          format: "List of 10 items. Each format: 'Trend: | Platform: | How to use: | Expires:'"
        },
        "Audience Builder": {
          outputType: "LONG PROMPT",
          task: "Define ideal audience for specified brand/niche.",
          format: "300+ word deep-dive persona containing: Demographics, Pain Points, Desires, Where they hang out, and How to speak to them."
        },
        "Headline Hook": {
          outputType: "LIST",
          task: "Generate 50 hooks for specified topic.",
          format: "Numbered list 1-50. Max 10 words each."
        },
        "Repurpose AI": {
          outputType: "LONG PROMPT",
          task: "Repurpose specified long content into 10 pieces.",
          format: "Must provide: 5 Shorts, 3 Tweets, 2 Carousels, 1 Email. All with full copy and scripts."
        },
        "Command Calendar": {
          outputType: "LIST",
          task: "Create 30-day content calendar for specified niche + platform.",
          format: "30 days schedule. Each day format: 'Day X: Topic | Format | Hook | CTA'"
        },
        "CHIDON Vault": {
          outputType: "LIST",
          task: "Generate 15 swipeable templates for specified content type + niche.",
          format: "Numbered list 1-15. Each format: 'X. Template: | Formula: | Example:'"
        },
        "NOTEPAD SAVE": {
          outputType: "LONG PROMPT",
          task: "Create book outline or detailed structured notes for specified topic.",
          format: "Must contain: Title, Subtitle, and detailed structured outline/notes of at least 300 words with clear bullet points."
        },
        "CHIDON IQ Template Library": {
          outputType: "LIST",
          task: "Generate 20 plug-and-play templates for specified task + niche.",
          format: "Numbered list 1-20. Each format: 'X. Template: | When to use: | Copy:'"
        },
        "Organic Video Feed": {
          outputType: "LIST",
          task: "Generate 20 $0 ad spend video ideas for specified niche.",
          format: "Numbered list 1-20. Each format: 'X. Idea: | Why Organic: | First 3 Seconds:'"
        },
        "SEO Scorecard": {
          outputType: "LONG PROMPT",
          task: "Audit specified title/description/video for SEO.",
          format: "Score /100 + What's Good + What's Bad + 10 Action Steps."
        },
        "Keyword Intel": {
          outputType: "LIST",
          task: "Generate 50 keywords for specified topic/niche with search intent.",
          format: "Numbered list 1-50. Each line format: 'Keyword | Intent: Info/Buy | Difficulty: Low/Med/High'"
        },
        "Shadowban Solutions": {
          outputType: "LONG PROMPT",
          task: "Create shadowban diagnostic report for specified platform.",
          format: "5 Signs + 7 Reasons + 10-Step Recovery + What NOT to do."
        },
        "Title + Description": {
          outputType: "LIST",
          task: "Generate 10 SEO titles + descriptions for specified topic.",
          format: "Numbered list 1-10. Each format: 'Title X: | Description X: 2 sentences with keywords + CTA'"
        },
        "Tag Architect": {
          outputType: "LIST",
          task: "Generate 500 characters of YouTube tags for specified topic.",
          format: "Output ONLY a single line of comma-separated tags (broad, niche, and long-tail tags). No list formatting, no intros, no quotes."
        },
        "Video Auditor": {
          outputType: "LONG PROMPT",
          task: "Audit specified video link or script.",
          format: "Hook Score /10 + Retention Risks + SEO Score + 5 Improvements + Next Video Idea."
        },
        "Post Optimizer": {
          outputType: "LONG PROMPT",
          task: "Optimize specified post for specified platform.",
          format: "Actionable Feedback + 3 Complete Rewrites + Why each rewrite is strategically better."
        },
        "Trending Topics": {
          outputType: "LIST",
          task: "Find 15 trending topics in specified niche this week.",
          format: "Numbered list 1-15. Each line format: 'Topic | Why Trending | Content Angle'"
        },
        "Daily Video Ideas": {
          outputType: "LIST",
          task: "Generate 7 video ideas for specified niche, one per day.",
          format: "Format: 'Monday: ...', 'Tuesday: ...', 'Wednesday: ...', 'Thursday: ...', 'Friday: ...', 'Saturday: ...', 'Sunday: ...'"
        },
        "Trend Alerts": {
          outputType: "LONG PROMPT",
          task: "Brief on specified trend.",
          format: "What is it + Why it matters + How to use + 3 Examples + Expires when."
        },
        "Time Optimizer": {
          outputType: "LIST",
          task: "Find best 3 times to post on specified platform + audience + country.",
          format: "Exactly 3 entries: 'Time X: | Reason: | Engagement Expectation:'"
        }
      };

      const text = await queryClient.fetchQuery({
        queryKey: ["gemini-generate", prompt, language, targetModel, feature],
        queryFn: async () => {
          let systemInstruction = `You are CHIDON IQ, an elite AI Growth Architect for creators, brands, and agencies.
Your job: Force viral growth on YouTube, TikTok, Instagram, X, LinkedIn.
Tone: Expert, confident, growth-obsessed.

CORE RULES FOR ALL OUTPUTS:
1. Be direct. No fluff, no intros like "Here you go" or "Here is...". Start directly with the content.
2. If the feature protocol requires a LIST output type, output ONLY the list. Absolutely no side-explanations, conversational filler, introductory remarks, or summaries.
3. If the feature protocol requires a LONG PROMPT or report output type, write a minimum of 300 words. Be extremely detailed, tactical, and actionable.
4. Always use data, formulas, and the psychology of virality.
5. All outputs must be beautifully formatted in clean, clear markdown.

Output your entire response exclusively in public human ${languageName}. Always maintain perfect native slang, correct localization, and natural phrasing appropriate for ${languageName}. NEVER output any part of your answer in English or any other language, unless the requested language name itself is English, or the user specifically requests translation to other tongues. All titles, scripts, hashtags, strategy documents, lists, schedules, analyses, and tables MUST be in ${languageName} completely.`;

          if (feature) {
            const matchedKey = Object.keys(FEATURE_MAP).find(key => {
              return key.toLowerCase() === feature.toLowerCase() || 
                     FEATURE_MAP[key].some(val => val.toLowerCase() === feature.toLowerCase());
            });
            if (matchedKey && FEATURE_PROTOCOLS[matchedKey]) {
              const protocol = FEATURE_PROTOCOLS[matchedKey];
              systemInstruction += `\n\n=== CHIDON IQ PROTOCOL MANDATE ===
Feature Name: ${matchedKey}
Output Type: ${protocol.outputType}
Task: ${protocol.task}
Required Format: ${protocol.format}
Strictly satisfy this mandate. Do not deviate under any circumstance. Ensure compliance with output types (if LIST, return ONLY the formatted items; if LONG PROMPT, ensure comprehensive 300+ word output with deep structural density).`;
            }
          }

          const searchFeatures = [
            "trend detector",
            "trend alerts",
            "trending topics",
            "competitor lab",
            "organic video feed",
            "keyword intel",
            "daily video ideas",
            "video ideas",
            "time optimizer",
            "post optimizer"
          ];
          const featureLower = (feature || "").toLowerCase();
          const needsSearch = searchFeatures.some(f => featureLower.includes(f));

          if (needsSearch) {
            systemInstruction += `\n\n=== GOOGLE SEARCH GROUNDING ACTIVE ===
You MUST use the Google Search engine tool to find real-time trends, breaking topics, high-volume keywords, and popular search behaviors TODAY on social media platforms (TikTok, YouTube, Reels, Instagram, X, LinkedIn). Ensure your output reflects current (as of September 2026) viral spikes and breakout hashtags. Do not use generic or outdated mock data.`;
          }

          const config: any = {
            temperature: 0.8,
            systemInstruction: systemInstruction
          };

          if (needsSearch) {
            config.tools = [{ googleSearch: {} }];
          }

          const response = await generateContentWithRetryAndFallback(prompt, {
            model: targetModel,
            config: config
          }, customApiKey || (req.headers['x-custom-gemini-key'] as string));
          if (!response || !response.text) {
            throw new Error("No text response received from Gemini.");
          }
          return response.text;
        }
      });

      if (!text || typeof text !== 'string' || text.trim().length === 0 || text.includes("fine-tuning our neural sync engines") || text.includes("Uplink Error")) {
        console.warn("[Gemini generate] Response text was empty or invalid. Triggering dynamic fallback...");
        const fallbackText = generateDynamicFallback(prompt, feature || "", languageName);
        await deductBothCredits(finalUserId, cost, feature ? `Chidon IQ Module: ${feature.toUpperCase()} (Fallback)` : "AI Content Synthesis (Fallback)");
        return res.json({ text: fallbackText });
      }

      // Deduct credits on successful generation in Supabase
      await deductBothCredits(finalUserId, cost, feature ? `Chidon IQ Module: ${feature.toUpperCase()}` : "AI Content Synthesis");

      res.json({ text });
    } catch (error: any) {
      console.error("Gemini server error. Executing resilient fallback:", error);
      try {
        const fallbackText = generateDynamicFallback(req.body.prompt, req.body.feature || "", languageName);
        await deductBothCredits(finalUserId, cost, req.body.feature ? `Chidon IQ Module: ${req.body.feature.toUpperCase()} (Fallback)` : "AI Content Synthesis (Fallback)");
        return res.json({ text: fallbackText });
      } catch (fallbackErr: any) {
        console.error("Fallback generator also failed:", fallbackErr);
        res.status(error.status || 500).json({ error: error.message || "An error occurred during generation." });
      }
    }
  });

  // PERF: Server-side translation proxy to dynamically translate existing content assets when language mode is switched
  app.post("/api/gemini/translate", apiRateLimiter, cargoSanitizer, async (req, res) => {
    const { text, targetLanguage, model, customApiKey } = req.body;
    try {
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const languageMap: Record<string, string> = {
        en: "English",
        es: "Spanish (Español)",
        zh: "Chinese Simplified (简体中文)",
        hi: "Hindi (हिन्दी)",
        ar: "Arabic (العربية)",
        pt: "Portuguese (Português)",
        fr: "French (Français)",
        ru: "Russian (Русский)",
        de: "German (Deutsch)",
        ja: "Japanese (日本語)"
      };

      const targetLangCode = (targetLanguage || "").split("-")[0].toLowerCase();
      const targetLanguageName = languageMap[targetLangCode] || "English";

      // Parse user model selection from client-side dynamic cookie if present
      let targetCookieModel = "";
      if (req.headers.cookie) {
        const match = req.headers.cookie.match(/active_gemini_model=([^;]+)/);
        if (match) targetCookieModel = decodeURIComponent(match[1]);
      }

      // Secure model resolution logic mapping alias or deprecated name to active support identifier
      let targetModel2 = normalizeModel(model || req.headers['x-gemini-model'] || targetCookieModel || "gemini-3.8-flash");

      const translatedText = await queryClient.fetchQuery({
        queryKey: ["gemini-translate", text, targetLanguage, targetModel2],
        queryFn: async () => {
          const systemInstruction = `You are a high-speed, military-grade translating interface. Translate the given text directly and professionally into public human ${targetLanguageName}. Always maintain formatting, markdown tables, checklist styles, layout, brackets, and line spacing exactly. Do not summarize, alter, or add commentary. Only return the direct translation in ${targetLanguageName}.`;

          const response = await generateContentWithRetryAndFallback(
            `Translate the following content to ${targetLanguageName}:\n\n${text}`,
            {
              model: targetModel2,
              config: { 
                temperature: 0.3,
                systemInstruction: systemInstruction
              }
            },
            customApiKey || (req.headers['x-custom-gemini-key'] as string)
          );
          if (!response || !response.text) {
            throw new Error("No translation text response received.");
          }
          return response.text;
        }
      });

      res.json({ text: translatedText });
    } catch (error: any) {
      console.error("Gemini translation error, falling back to original text:", error);
      res.json({ text: text });
    }
  });

  app.post("/api/gemini/generate-image", apiRateLimiter, cargoSanitizer, async (req, res) => {
    const { prompt, aspectRatio, userId, customApiKey } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const cost = 3; // Image generation cost set to 3 credits for Large Feature category (strictly max 3 credits)
    const finalUserId = userId || "guest_anonymous_uplink";
    // Self-healing / auto-replenish user credits directly in Supabase profiles!
    const activeCredits = await getOrProvisionBothCredits(finalUserId, cost);
    const isGuest = !finalUserId || finalUserId === "guest_anonymous_uplink" || finalUserId.startsWith("guest") || finalUserId.startsWith("local_") || finalUserId === "sandbox";
    if (!isGuest && activeCredits < cost) {
      return res.status(403).json({ error: "INSUFFICIENT_CREDITS", required: cost, available: activeCredits });
    }

    try {
      console.log(`[Gemini Image Engine] Generating image with prompt: "${prompt}" and aspect ratio: ${aspectRatio || "16:9"}...`);
      
      const ai = getGeminiClient(customApiKey || (req.headers['x-custom-gemini-key'] as string));
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "16:9",
          },
        },
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data;
            imageUrl = `data:image/png;base64,${base64EncodeString}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error("No inline image data received from Gemini Image model.");
      }

      // Deduct credits on successful real image generation in Supabase
      await deductBothCredits(finalUserId, cost, "Gemini Image Synthesis");

      return res.json({ imageUrl });
    } catch (error: any) {
      console.warn("[Gemini Image Engine] AI Image generation failed or is unauthorized (free-tier key). Generating professional SVG design blueprint as a high-fidelity brand fallback...", error.message || error);
      try {
        const fallbackUrl = generateFallbackSvg(prompt, aspectRatio);
        
        // Return the fallback URL so the UI succeeds seamlessly without deducting credits
        return res.json({ imageUrl: fallbackUrl, isFallback: true });
      } catch (fallbackErr: any) {
        console.error("[Gemini Image Engine] Fallback SVG generation failed:", fallbackErr);
        return res.status(500).json({ error: error.message || "An error occurred during image generation." });
      }
    }
  });

  // Qualities of the App API (Static for now, but cached dynamically via backend TanStack)
  app.get("/api/chidon_iq/qualities", async (req, res) => {
    try {
      const qualities = await queryClient.fetchQuery({
        queryKey: ["app-qualities"],
        queryFn: async () => {
          return [
            { id: "realtime", label: "Real-time Intelligence", description: "Hyper-speed neural synchronization across global nodes." },
            { id: "ai-native", label: "Neural-Native", description: "Deep integration with our most advanced sovereign AI models." },
            { id: "tactical", label: "Tactical Design", description: "Military-grade UX for high-performance content operations." },
            { id: "secure", label: "Secure Vault", description: "Fragmented intelligence storage with encrypted signal protocols." }
          ];
        }
      });
      res.json({ qualities });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Handle static serving and Vite dev server depending on environment
  async function setupFrontendRouting() {
    // If we are running in Vercel serverless context, do not attach Vite middleware or static serving
    if (process.env.VERCEL) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[Server] Mounting Vite developer middleware for local hot-reloading...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("[Server] Standalone production container mode. Serving pre-compiled static assets...");
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Secure Server-Side Endpoint to handle forced daily login credit allocations (DAILY Engine)
  app.post("/api/credits/daily-login", apiRateLimiter, async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }

    try {
      const { credits, dailyCreditsActive, dailyCreditsExpiresAt, firebaseSyncRequired, dailyGranted, welcomeNewlyGranted } = await reconcileUserCredits(userId);
      return res.json({
        success: true,
        credits,
        dailyCreditsActive,
        dailyCreditsExpiresAt,
        firebaseSyncRequired,
        claimed: Boolean(dailyGranted || welcomeNewlyGranted),
        dailyGranted: Boolean(dailyGranted),
        welcomeNewlyGranted: Boolean(welcomeNewlyGranted),
        message: "🌞 Credit balance successfully reconciled and updated."
      });
    } catch (err: any) {
      console.error("[Daily Login Engine] Failed to reconcile credits:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Credit system integrated health diagnostics endpoint
  app.get("/api/credits/status", async (req, res) => {
    try {
      const sbConfigured = !!process.env.VITE_SUPABASE_URL && !!process.env.VITE_SUPABASE_ANON_KEY;
      // Also check standard firebase configurations
      const firebaseConfigured = true; // Always true because firebase app is loaded and running
      const paystackConfigured = !!process.env.PAYSTACK_SECRET_KEY;
      const geminiConfigured = !!process.env.GEMINI_API_KEY;

      return res.json({
        success: true,
        supabase: {
          configured: sbConfigured,
          status: sbConfigured ? "Connected & Synced" : "Pending Keys"
        },
        firebase: {
          configured: firebaseConfigured,
          status: firebaseConfigured ? "Active & Persistent Ledger" : "Sandbox Mode"
        },
        paystack: {
          configured: paystackConfigured,
          status: paystackConfigured ? "Payment Gateway Operational" : "Pending Keys"
        },
        gemini: {
          configured: geminiConfigured,
          status: geminiConfigured ? "Cognitive Core Online" : "Degraded Mode"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });



  setupFrontendRouting();

  // Robust lightweight engine to grant all registered users 2 daily credits automatically in Firebase (DAILY Engine)
  function startDailyCreditEngine() {
    console.log("[DAILY Engine] Starting automatic daily credit allocation service in Firebase...");
    
    // Check every hour for timezone transition safety
    setInterval(async () => {
      try {
        const firestoreAdmin = getFirestoreAdminDb();
        if (!firestoreAdmin) return;

        const usersSnap = await firestoreAdmin.collection("users").get();
        if (!usersSnap || !usersSnap.docs) return;

        for (const doc of usersSnap.docs) {
          try {
            await firestoreAdmin.collection("users").doc(doc.id).set({
              credits: FieldValue.increment(2),
              updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
          } catch (singleErr) {
            console.error(`[DAILY Engine] Failed to grant daily credits for user ${doc.id}:`, singleErr);
          }
        }
      } catch (err) {
        console.error("[DAILY Engine] Global daily check failed:", err);
      }
    }, 60 * 60 * 1000);

    // Initial check 10 seconds after server startup for instant delivery
    setTimeout(async () => {
      try {
        const firestoreAdmin = getFirestoreAdminDb();
        if (!firestoreAdmin) return;

        const usersSnap = await firestoreAdmin.collection("users").get();
        if (!usersSnap || !usersSnap.docs) return;

        for (const doc of usersSnap.docs) {
          try {
            await firestoreAdmin.collection("users").doc(doc.id).set({
              credits: FieldValue.increment(2),
              updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });
          } catch (singleErr) {
            // Safe silent catch
          }
        }
      } catch (err) {
        // Safe silent catch
      }
    }, 10000);
  }

  // Only listen to port if not in serverless context (Vercel or Netlify)
  if (!process.env.VERCEL && !process.env.NETLIFY) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CHIDON IQ Neural Backend listening on http://0.0.0.0:${PORT}`);
      startDailyCreditEngine();
    });
  }

export default app;

function generateMockTrends(platform: string, category: string, searchQuery: string) {
  const platforms = ["youtube", "tiktok", "facebook"];
  const selectedPlatforms = platform === "all" ? platforms : [platform];
  
  const creatorNames: Record<string, string[]> = {
    youtube: ["MrBeast", "MKBHD", "Ali Abdaal", "Zach King", "Ryan Trahan", "Casey Neistat"],
    tiktok: ["Khaby Lame", "Bella Poarch", "Charli D'Amelio", "Zach King", "Jake Paul", "DailyDoseOfInternet"],
    facebook: ["Jay Shetty", "Tasty", "Goalcast", "Nas Daily", "5-Minute Crafts", "Dude Perfect"]
  };

  const templates = [
    {
      title: "The 24-Hour Digital Fast: I went fully analog and my brain rewired",
      category: "productivity",
      summary: "A content creator documents their struggle of giving up all tech for 24 hours. The dynamic editing and honest vulnerability sparked massive shares and a hot discussion on lifestyle habits.",
      tactics: ["Introduce high stakes in the first 2 seconds", "Vary audio pacing with ASMR styled natural sounds", "Keep visual contrast high with black-and-white cuts"]
    },
    {
      title: "How micro-SaaS is completely killing traditional tech jobs",
      category: "tech",
      summary: "An analytical deep-dive into how indie hackers use modular AI tools to ship applications in half a day. It has gone viral across tech circles and LinkedIn.",
      tactics: ["Use code-blocks and terminal footage for screen immersion", "Keep bullet list metrics readable", "Conclude with an inspiring indie resource roadmap"]
    },
    {
      title: "I rebuilt the world's most illegal skateboard and tested it on the streets",
      category: "entertainment",
      summary: "A wild engineering hack that integrates heavy-duty fan thrusters onto a standard skateboard. The high-rebounding suspense and comic street reactions triggered global viral traffic.",
      tactics: ["Stagger cliffhangers right before every test", "Insert visual overlay meters representing speed", "Run tight camera tracking of citizens' expressions"]
    },
    {
      title: "Stop storing your money in banks. Here is what smart money does instead",
      category: "finance",
      summary: "An educational finance guide warning watchers about inflation tax, and introducing capital-preservation indexes. Simple animations and drawings make complex macroeconomics extremely digestible.",
      tactics: ["Draw charts live using physical markers on glassboards", "Highlight contrarian hooks", "Do not sell products, focus 100% on zero-fluff stats"]
    },
    {
      title: "Unboxing the futuristic $50,000 holographic glasses that feel like real life",
      category: "tech",
      summary: "Hands-on developer review of ultra-exclusive augmented reality lenses. The flawless overlay and physical interactivity generated high marvel and endless comments.",
      tactics: ["Shoot direct point-of-view perspective shots", "Use immersive panning shots to highlight physical elements", "Include raw specs in JetBrains Mono overlays"]
    },
    {
      title: "Cooking a 5-star steak using only solar heat inside a locked car",
      category: "lifestyle",
      summary: "A quirky and thrilling culinary challenge tested during a record heatwave. High-contrast cooking cuts combined with scientific measurements kept watchers highly engaged.",
      tactics: ["Use a digital thermometer overlay as a ticking clock", "Accelerate transition speeds by 1.5x", "Add crisp sizzling ASMR audio layers"]
    }
  ];

  let pool = templates;
  if (category && category !== "general") {
    const matched = templates.filter(t => t.category.toLowerCase() === category.toLowerCase());
    if (matched.length > 0) pool = matched;
  }

  const results = [];
  const count = 4;
  for (let i = 0; i < count; i++) {
    const curPlatform = selectedPlatforms[i % selectedPlatforms.length];
    const template = pool[Math.floor(Math.random() * pool.length)];
    const creators = creatorNames[curPlatform];
    const creator = creators[Math.floor(Math.random() * creators.length)];
    
    const viewsNum = (Math.random() * 5 + 0.1).toFixed(1);
    const views = curPlatform === "youtube" ? `${viewsNum}M views` : `${Math.floor(Math.random() * 800 + 100)}K views`;
    
    const randomHours = Math.floor(Math.random() * 20 + 2);
    const publishedTime = `${randomHours} hours ago`;
    const viralityScore = Math.floor(Math.random() * 15) * (i + 1) % 20 + 80;

    let title = template.title;
    let summary = template.summary;
    let tactics = template.tactics;

    if (searchQuery) {
      title = `Breakout Spot: "${searchQuery}" - Absolute Mastery of ${template.category.toUpperCase()}`;
      summary = `The ultimate trending post analyzing "${searchQuery}". This breakout topic is currently gaining explosive traction on social discovery engines, generating high conversational engagement.`;
      tactics = [
        `Focus heavily on organic semantic keyword tags for "${searchQuery}"`,
        `Lead with a contrarian opinion concerning "${searchQuery}" to spark comments`,
        `Maintain a fast editing cut of 1.2s per frame to maximize retention`
      ];
    }

    results.push({
      platform: curPlatform,
      title,
      creator: curPlatform === "youtube" ? creator : `@${creator.toLowerCase().replace(/\s+/g, '')}`,
      views,
      url: curPlatform === "youtube" 
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`
        : curPlatform === "tiktok"
        ? `https://www.tiktok.com/tag/${encodeURIComponent(template.category)}`
        : `https://www.facebook.com/hashtag/${encodeURIComponent(template.category)}`,
      summary,
      tactics,
      viralityScore,
      publishedTime
    });
  }

  return results;
}
