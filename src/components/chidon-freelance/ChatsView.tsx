import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, MessageSquare, Download, Upload, User, 
  Clock, Shield, RefreshCw, Layers, CheckCircle2, AlertTriangle, Bell
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Message, FreelanceProfile, Notification } from './types';
import { handleFirestoreError, OperationType, convertFileToBase64 } from './utils';

interface ChatsViewProps {
  profile: FreelanceProfile;
  initialSellerContact?: { sellerId: string; sellerName: string } | null;
}

interface ChatContact {
  chatId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  timestamp: any;
}

export const ChatsView: React.FC<ChatsViewProps> = ({ profile, initialSellerContact }) => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeChat, setActiveChat] = useState<ChatContact | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messageFile, setMessageFile] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(true);

  // Sync Notifications
  useEffect(() => {
    setNotifsLoading(true);
    const colRef = collection(db, 'notifications');
    const q = query(
      colRef, 
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[];
      setNotifications(list);
      setNotifsLoading(false);
    }, (err) => {
      console.warn("Notifications listener:", err);
      setNotifsLoading(false);
    });
    return () => unsub();
  }, [profile.uid]);

  // Handle Initial Seller Contact Navigation
  useEffect(() => {
    if (initialSellerContact) {
      const { sellerId, sellerName } = initialSellerContact;
      if (sellerId === profile.uid) return; // Cannot chat with yourself

      const customChatId = [profile.uid, sellerId].sort().join('_');
      const newContact: ChatContact = {
        chatId: customChatId,
        partnerId: sellerId,
        partnerName: sellerName,
        partnerAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${sellerName}`,
        lastMessage: 'Starting initial communication...',
        timestamp: new Date()
      };

      setActiveChat(newContact);
      // Pre-add to contacts list if not present
      setContacts(prev => {
        if (prev.some(c => c.chatId === customChatId)) return prev;
        return [newContact, ...prev];
      });
    }
  }, [initialSellerContact, profile.uid]);

  // Load unique chat partners / threads from Firestore messages
  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, 'messages');
    
    // Listen to messages where the user was either sender or recipient (embedded in chatId sort)
    const unsub = onSnapshot(colRef, async (snap) => {
      const allMsgs = snap.docs.map(d => d.data()) as Message[];
      
      // Filter out messages related to specific order timeline workspaces, keep pure user-to-user DMs
      const dmMessages = allMsgs.filter(m => m.chatId && !m.chatId.startsWith('order_'));

      // Group by chatId to locate conversation partners
      const uniqueChatsMap = new Map<string, Message>();
      dmMessages.forEach(m => {
        const existing = uniqueChatsMap.get(m.chatId);
        if (!existing || (m.createdAt && m.createdAt.toMillis && m.createdAt.toMillis() > existing.createdAt?.toMillis())) {
          uniqueChatsMap.set(m.chatId, m);
        }
      });

      const chatsList: ChatContact[] = [];
      for (const [chatId, lastMsg] of uniqueChatsMap.entries()) {
        const uids = chatId.split('_');
        if (!uids.includes(profile.uid)) continue; // Not involved in this chat

        const partnerId = uids.find(id => id !== profile.uid) || '';
        
        // Simple partner name formatting
        const partnerName = lastMsg.senderId === partnerId ? lastMsg.senderName : (chatId.replace(profile.uid, '').replace('_', ''));
        
        chatsList.push({
          chatId,
          partnerId,
          partnerName: partnerName || 'Support Agent',
          partnerAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${partnerName || 'Support'}`,
          lastMessage: lastMsg.content,
          timestamp: lastMsg.createdAt
        });
      }

      setContacts(chatsList);
      setLoading(false);
    }, (err) => {
      console.warn("Chats loader error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [profile.uid]);

  // Stream messages for the active conversation
  useEffect(() => {
    if (!activeChat) return;

    setMessages([]);
    const colRef = collection(db, 'messages');
    const q = query(
      colRef, 
      where('chatId', '==', activeChat.chatId),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
      setMessages(list);
    }, (err) => {
      console.warn("Message streamer:", err);
    });

    return () => unsub();
  }, [activeChat?.chatId]);

  // Send Direct Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || (!messageInput.trim() && !messageFile)) return;
    setSending(true);

    try {
      const msgData = {
        chatId: activeChat.chatId,
        senderId: profile.uid,
        senderName: profile.fullName || profile.username,
        content: messageInput.trim() || 'Shared attachment document.',
        fileUrl: messageFile || undefined,
        fileName: messageFile ? 'attachment.png' : undefined,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'messages'), msgData);
      setMessageInput('');
      setMessageFile('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const b64 = await convertFileToBase64(e.target.files[0]);
      setMessageFile(b64);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left pb-12">
      
      {/* Left Column: Direct Chats Threads & Inbox */}
      <div className="space-y-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MessageSquare size={15} className="text-brand" /> Direct Messages inbox
          </h3>

          <div className="space-y-2">
            {contacts.map((c) => (
              <button
                key={c.chatId}
                onClick={() => setActiveChat(c)}
                className={`w-full p-4 rounded-2xl border text-left cursor-pointer flex items-center gap-3 transition-all ${activeChat?.chatId === c.chatId ? 'bg-brand/10 border-brand' : 'bg-slate-950 border-slate-850 hover:bg-slate-950'}`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center font-extrabold text-[10px] text-slate-300 shrink-0">
                  {c.partnerName ? c.partnerName.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 leading-normal overflow-hidden">
                  <div className="text-xs font-black text-white truncate">@{c.partnerName}</div>
                  <p className="text-[10px] text-slate-500 truncate">{c.lastMessage}</p>
                </div>
              </button>
            ))}

            {contacts.length === 0 && !loading && (
              <div className="text-center py-10 text-xs text-slate-600 font-mono italic bg-slate-950/40 rounded-2xl border border-dashed border-slate-850">
                Inbox is quiet. Contact experts directly on their service pages.
              </div>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Bell size={15} className="text-brand" /> Network Notifications
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div key={n.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-xs space-y-1">
                <div className="font-bold text-white flex justify-between items-center">
                  <span>{n.title}</span>
                  <span className="text-[8px] font-mono text-slate-500">#{n.type}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
              </div>
            ))}

            {notifications.length === 0 && !notifsLoading && (
              <div className="text-center py-6 text-xs text-slate-600 font-mono italic">No system logs.</div>
            )}
          </div>
        </div>

      </div>

      {/* Right 2 Columns: Live Chat Canvas */}
      <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-[500px] shadow-xl relative overflow-hidden">
        {activeChat ? (
          <>
            {/* Header Partner Info bar */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center font-extrabold text-[10px] text-slate-300 shrink-0">
                {activeChat.partnerName ? activeChat.partnerName.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="text-xs font-black text-white">@{activeChat.partnerName}</h4>
                <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  ● Verified Contact Line
                </span>
              </div>
            </div>

            {/* Conversation Messages Grid */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              {messages.map((m) => {
                const self = m.senderId === profile.uid;
                return (
                  <div key={m.id} className={`flex flex-col ${self ? 'items-end' : 'items-start'} space-y-1`}>
                    <span className="text-[8px] font-mono text-slate-500">@{m.senderName}</span>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs leading-normal ${self ? 'bg-brand text-white rounded-tr-none' : 'bg-slate-950 text-slate-200 border border-slate-850 rounded-tl-none'}`}>
                      {m.content}
                      {m.fileUrl && (
                        <div className="mt-2 pt-2 border-t border-slate-800/20 flex justify-between items-center gap-4">
                          <span className="text-[9px] font-mono opacity-80 truncate">doc_attachment.png</span>
                          <a href={m.fileUrl} download="attached.png" className="text-white hover:opacity-80">
                            <Download size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <div className="text-center py-20 text-xs text-slate-600 font-mono italic">No communication logs recorded. Send a greeting...</div>
              )}
            </div>

            {/* Form controls */}
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Draft messaging updates..."
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-700 outline-none focus:border-brand"
                />

                <label className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-500 hover:text-white cursor-pointer flex items-center justify-center">
                  <Upload size={14} />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <button
                  type="submit"
                  disabled={sending}
                  className="p-3.5 bg-brand text-white rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </div>

              {messageFile && (
                <div className="text-[9px] font-mono text-emerald-400 pl-1">✓ Attachment loaded. Press send to deliver.</div>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <MessageSquare size={36} className="text-slate-800" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Workspace Chat Sandbox</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Select a dialogue thread from your inbox to coordinate freelance specs and assets.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
