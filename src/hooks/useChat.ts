import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  increment,
  FieldValue
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';

export interface Chat {
  id: string;
  participants: string[];
  participantNames?: { [uid: string]: string };
  participantPhotos?: { [uid: string]: string };
  lastMessage?: string;
  lastMessageAt?: any;
  postId?: string;
  postTitle?: string;
  postPrice?: string | number;
  unreadCounts?: { [uid: string]: number };
  blockedUsers?: string[];
  reportedBy?: string[];
  createdAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  image?: string;
  createdAt: any;
}

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);

  // Sync current user's chats
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setChats([]);
      setLoadingChats(false);
      return;
    }

    // Query chats where user is a participant
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        chatList.push({
          id: docSnap.id,
          participants: data.participants || [],
          participantNames: data.participantNames || {},
          participantPhotos: data.participantPhotos || {},
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessageAt,
          postId: data.postId || '',
          postTitle: data.postTitle || '',
          postPrice: data.postPrice || '',
          unreadCounts: data.unreadCounts || {},
          blockedUsers: data.blockedUsers || [],
          reportedBy: data.reportedBy || [],
          createdAt: data.createdAt
        });
      });

      // Sort chats by lastMessageAt descending
      chatList.sort((a, b) => {
        const timeA = a.lastMessageAt?.seconds || 0;
        const timeB = b.lastMessageAt?.seconds || 0;
        return timeB - timeA;
      });

      setChats(chatList);
      setLoadingChats(false);
    }, (error) => {
      console.error('[useChat] Error fetching chats:', error);
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if chat exists or create one, returning the chatId
  const startChat = async (
    otherUserId: string, 
    otherUserName: string, 
    otherUserPhoto: string, 
    postId: string,
    postTitle: string,
    postPrice: string | number
  ): Promise<string> => {
    const myUser = auth.currentUser;
    if (!myUser) throw new Error('You must be logged in to start a chat.');
    if (myUser.uid === otherUserId) throw new Error('You cannot start a chat with yourself.');

    // Step 1: Check if chat already exists between these participants for this specific post
    // Alternatively: Check if a chat exists between these participants generally
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', myUser.uid)
    );

    const snapshot = await getDocs(q);
    let existingChatId: string | null = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const parts = data.participants || [];
      // If it has both participants and belongs to the same post
      if (parts.includes(otherUserId) && data.postId === postId) {
        existingChatId = docSnap.id;
      }
    });

    if (existingChatId) {
      return existingChatId;
    }

    // Step 2: Create a new chat document
    const myName = myUser.displayName || myUser.email?.split('@')[0] || 'User';
    const myPhoto = myUser.photoURL || '';

    const newChatRef = doc(collection(db, 'chats'));
    const chatId = newChatRef.id;

    const chatPayload: Omit<Chat, 'id'> = {
      participants: [myUser.uid, otherUserId],
      participantNames: {
        [myUser.uid]: myName,
        [otherUserId]: otherUserName || 'Seller'
      },
      participantPhotos: {
        [myUser.uid]: myPhoto,
        [otherUserId]: otherUserPhoto || ''
      },
      postId,
      postTitle,
      postPrice,
      lastMessage: `System: You are now connected with ${otherUserName || 'Seller'}`,
      lastMessageAt: serverTimestamp(),
      unreadCounts: {
        [myUser.uid]: 0,
        [otherUserId]: 0
      },
      blockedUsers: [],
      reportedBy: [],
      createdAt: serverTimestamp()
    };

    await setDoc(newChatRef, chatPayload);

    // Create the initial system/welcome message
    const welcomeMsgRef = doc(collection(db, `chats/${chatId}/messages`));
    await setDoc(welcomeMsgRef, {
      senderId: 'system',
      text: `You are now connected with ${otherUserName || 'Seller'} regarding "${postTitle}". Avoid sharing sensitive personal information outside the platform.`,
      createdAt: serverTimestamp()
    });

    return chatId;
  };

  // Send a message
  const sendMessage = async (
    chatId: string, 
    text: string, 
    imageFile?: File | null
  ): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be logged in to send a message.');

    // Read chat state to check if blocked
    const chatRef = doc(db, 'chats', chatId);
    
    let imageUrl = '';
    if (imageFile) {
      try {
        const fileRef = ref(storage, `chats/${chatId}/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      } catch (uploadErr) {
        console.error('[useChat] Image upload failed:', uploadErr);
        throw new Error('Image upload failed. Please try again.');
      }
    }

    if (!text.trim() && !imageUrl) return;

    // Add message to subcollection
    const messageRef = doc(collection(db, `chats/${chatId}/messages`));
    await setDoc(messageRef, {
      senderId: user.uid,
      text: text.trim(),
      ...(imageUrl && { image: imageUrl }),
      createdAt: serverTimestamp()
    });

    // Update parent chat document (lastMessage, lastMessageAt, unreadCounts)
    const chatSnap = chats.find(c => c.id === chatId);
    const otherUserId = chatSnap?.participants.find(id => id !== user.uid);

    const updatePayload: any = {
      lastMessage: imageUrl ? 'Sent an image' : text,
      lastMessageAt: serverTimestamp()
    };

    if (otherUserId) {
      // Increment unread count for other user
      updatePayload[`unreadCounts.${otherUserId}`] = increment(1);
    }

    await updateDoc(chatRef, updatePayload);
  };

  // Mark chat as read
  const markAsRead = async (chatId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCounts.${user.uid}`]: 0
    });
  };

  // Block/Unblock user in chat
  const toggleBlockUser = async (chatId: string, userIdToBlock: string, isCurrentlyBlocked: boolean) => {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = chats.find(c => c.id === chatId);
    if (!chatSnap) return;

    const currentBlocked = chatSnap.blockedUsers || [];
    let updatedBlocked: string[];

    if (isCurrentlyBlocked) {
      updatedBlocked = currentBlocked.filter(id => id !== userIdToBlock);
    } else {
      updatedBlocked = [...currentBlocked, userIdToBlock];
    }

    await updateDoc(chatRef, {
      blockedUsers: updatedBlocked
    });
  };

  // Report user in chat
  const reportUser = async (chatId: string, reporterId: string) => {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = chats.find(c => c.id === chatId);
    if (!chatSnap) return;

    const currentReports = chatSnap.reportedBy || [];
    if (!currentReports.includes(reporterId)) {
      await updateDoc(chatRef, {
        reportedBy: [...currentReports, reporterId]
      });
    }
  };

  return {
    chats,
    loadingChats,
    startChat,
    sendMessage,
    markAsRead,
    toggleBlockUser,
    reportUser
  };
};
