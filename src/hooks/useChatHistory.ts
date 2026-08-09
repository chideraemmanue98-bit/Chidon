import { useState } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';

export interface ChatHistoryMessage {
  id: string;
  feature: string;
  prompt: string;
  result: string;
  wrappedUp: string | null;
  createdAt: Timestamp;
  expireAt: Timestamp;
  creditsUsed: number;
}

export function useChatHistory(userId: string | null) {
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const { i18n } = useTranslation();

  // Load history in real-time and auto-delete items older than 7 days
  const subscribeToHistory = (featureId: string) => {
    if (!userId) return () => {};
    setLoadingHistory(true);
    
    const messagesRef = collection(db, 'chats', userId, 'features', featureId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatHistoryMessage[] = [];
      const expiredDocIds: string[] = [];
      const nowMs = Date.now();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Use either saved expireAt or calculate a default of 7 days from creation
        let expireAt = data.expireAt;
        if (!expireAt) {
          const createdAt = data.createdAt || Timestamp.now();
          expireAt = Timestamp.fromMillis(createdAt.toMillis() + 7 * 24 * 60 * 60 * 1000);
        }

        if (expireAt.toMillis() <= nowMs) {
          expiredDocIds.push(docSnap.id);
        } else {
          msgs.push({
            id: docSnap.id,
            feature: data.feature || featureId,
            prompt: data.prompt || '',
            result: data.result || '',
            wrappedUp: data.wrappedUp || null,
            createdAt: data.createdAt || Timestamp.now(),
            expireAt: expireAt,
            creditsUsed: data.creditsUsed || 0,
          });
        }
      });

      // Execute background delete for all expired records
      if (expiredDocIds.length > 0) {
        expiredDocIds.forEach((msgId) => {
          const msgDocRef = doc(db, 'chats', userId, 'features', featureId, 'messages', msgId);
          deleteDoc(msgDocRef).catch((err) => {
            console.error("Auto-deletion of expired chat item failed:", msgId, err);
          });
        });
      }

      setMessages(msgs);
      setLoadingHistory(false);
    }, (error) => {
      console.error("Error fetching chat history real-time:", error);
      setLoadingHistory(false);
    });

    return unsubscribe;
  };

  const saveMessage = async (
    featureId: string, 
    prompt: string, 
    result: string, 
    creditsUsed: number = 1
  ) => {
    if (!userId) return null;
    try {
      const messagesRef = collection(db, 'chats', userId, 'features', featureId, 'messages');
      const now = new Date();
      const createdAt = Timestamp.fromDate(now);
      const expireAt = Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

      const docPayload = {
        feature: featureId,
        prompt,
        result,
        wrappedUp: null,
        createdAt,
        expireAt,
        creditsUsed
      };

      const docRef = await addDoc(messagesRef, docPayload);
      return docRef.id;
    } catch (err) {
      console.error("Error saving message to history:", err);
      return null;
    }
  };

  const wrapUpMessage = async (
    featureId: string,
    messageId: string,
    resultText: string
  ) => {
    if (!userId) return false;

    try {
      // Generate summary using backend proxy
      const lang = i18n.language || 'en';
      const promptText = `Summarize the following AI-generated result into exactly 3 concise, high-impact bullet points. Output ONLY the 3 bullets and nothing else. No intro, no outro, no markdown bolding of prefixes if it competes with clean lists. Keep it clear. Output in the user's active language.\n\nAI RESULT TO SUMMARIZE:\n${resultText}`;
      
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptText, language: lang }),
      });

      if (!res.ok) {
        throw new Error("AI Summary Service unavailable");
      }

      const data = await res.json();
      const summaryText = data.text;
      if (!summaryText) {
        throw new Error("AI Summary failed to generate");
      }

      // Update document in Firestore without credit updates
      const msgDocRef = doc(db, 'chats', userId, 'features', featureId, 'messages', messageId);
      await updateDoc(msgDocRef, {
        wrappedUp: summaryText
      });

      return true;
    } catch (err) {
      console.error("Error during wrap-up:", err);
      throw err;
    }
  };

  const deleteMessage = async (featureId: string, messageId: string) => {
    if (!userId) return false;
    try {
      const msgDocRef = doc(db, 'chats', userId, 'features', featureId, 'messages', messageId);
      await deleteDoc(msgDocRef);
      return true;
    } catch (err) {
      console.error("Error deleting message:", err);
      return false;
    }
  };

  return {
    messages,
    loadingHistory,
    subscribeToHistory,
    saveMessage,
    wrapUpMessage,
    deleteMessage
  };
}
