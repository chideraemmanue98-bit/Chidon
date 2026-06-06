import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, User, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import AutoTranslate from './AutoTranslate';

interface EarnChatProps {
  user: any;
  activePartnerId: string | null;
  activePartnerEmail: string | null;
}

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  text: string;
  createdAt: any;
}

export const EarnChat: React.FC<EarnChatProps> = ({ user, activePartnerId, activePartnerEmail }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activePartner, setActivePartner] = useState<{ id: string; email: string } | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync prop changes with active selected chat partner
  useEffect(() => {
    if (activePartnerId && activePartnerEmail) {
      setActivePartner({ id: activePartnerId, email: activePartnerEmail });
    }
  }, [activePartnerId, activePartnerEmail]);

  // Realtime subscription to the message collection
  useEffect(() => {
    if (!user) return;

    // Subscribing index-free to avoid composite query index creation errors, filtering securely client-side.
    const q = query(collection(db, 'earn_messages'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.senderId === user.uid || data.recipientId === user.uid) {
          list.push({ id: docSnap.id, ...data } as ChatMessage);
        }
      });

      // Sort ascending by time
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (Number(a.createdAt) || 0);
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (Number(b.createdAt) || 0);
        return timeA - timeB;
      });

      setMessages(list);
    }, (err) => {
      console.error("error loading chats:", err);
    });

    return () => unsub();
  }, [user]);

  // Group messages to build conversations list
  const getConversations = () => {
    const map: Record<string, { id: string; email: string; lastText: string; lastTime: any }> = {};

    messages.forEach((msg) => {
      const partnerId = msg.senderId === user.uid ? msg.recipientId : msg.senderId;
      const partnerEmail = msg.senderId === user.uid ? msg.recipientName : msg.senderName;
      
      const timeMs = msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : (Number(msg.createdAt) || Date.now());

      if (!map[partnerId] || timeMs > map[partnerId].lastTime) {
        map[partnerId] = {
          id: partnerId,
          email: partnerEmail,
          lastText: msg.text,
          lastTime: timeMs,
        };
      }
    });

    // Ensure currently selected partner is present in contacts even if no message history yet
    if (activePartner && !map[activePartner.id]) {
      map[activePartner.id] = {
        id: activePartner.id,
        email: activePartner.email,
        lastText: t('chats.no_messages', 'No conversation started yet...'),
        lastTime: Date.now() + 10000,
      };
    }

    return Object.values(map).sort((a, b) => b.lastTime - a.lastTime);
  };

  const conversations = getConversations();

  // Scroll to bottom whenever messages list or active partner changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activePartner]);

  // Filter messages for active discussion channel
  const currentPartnerMessages = activePartner
    ? messages.filter((m) =>
        (m.senderId === user.uid && m.recipientId === activePartner.id) ||
        (m.senderId === activePartner.id && m.recipientId === user.uid)
      )
    : [];

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !user || !activePartner) return;

    setSending(true);
    setInputText('');

    try {
      // ChatId is standard sorted format to query easily
      const chatId = [user.uid, activePartner.id].sort().join('_');

      await addDoc(collection(db, 'earn_messages'), {
        chatId,
        senderId: user.uid,
        senderName: user.email || 'Anonymous',
        recipientId: activePartner.id,
        recipientName: activePartner.email,
        text: textToSend,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error committing message:", err);
    } finally {
      setSending(false);
    }
  };

  // Quick Reply Options
  const quickReplies = [
    t('quick_replies.interested', 'Interested! Let us discuss details.'),
    t('quick_replies.budget', 'Is the budget firm on this contract?'),
    t('quick_replies.working', 'I am working on it right now.'),
    t('quick_replies.proof', 'I have uploaded the delivery logs.'),
    t('quick_replies.accepted', 'Perfect, thank you! Payout released.')
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 border border-white/5 bg-[#0F172A]/70 rounded-3xl overflow-hidden min-h-[550px] shadow-[0_0_50px_rgba(34,211,238,0.03)] backdrop-blur-md">
      {/* LEFT: Conversation List */}
      <div className="md:col-span-1 border-r border-white/5 bg-slate-950/40 p-4 space-y-4">
        <div className="pb-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono font-black text-[#22D3EE] tracking-widest uppercase flex items-center gap-1.5">
            <MessageSquare size={13} className="text-[#22D3EE]" />
            <AutoTranslate>{t('chats.conversations', 'CHAT ROOMS')}</AutoTranslate>
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-slate-400">
            {conversations.length} Active
          </span>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs font-mono flex flex-col items-center gap-3">
            <User size={24} className="opacity-30" />
            <AutoTranslate>{t('chats.empty_list', 'No active messages.')}</AutoTranslate>
            <p className="text-[10px] text-slate-600 max-w-[150px] leading-relaxed mx-auto">
              {t('chats.instructions', 'Click "Chat" on any Service offer or Open Gig list to launch chat.')}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {conversations.map((contact) => {
              const isSelected = activePartner?.id === contact.id;
              const displayEmail = contact.email.split('@')[0];
              return (
                <button
                  key={contact.id}
                  onClick={() => setActivePartner({ id: contact.id, email: contact.email })}
                  className={cn(
                    "w-full p-3.5 rounded-2xl flex items-center justify-between transition-all outline-none text-left border cursor-pointer",
                    isSelected
                      ? "bg-slate-900 border-[#22D3EE]/20 shadow-md"
                      : "bg-[#0A0F1D]/40 border-transparent hover:bg-slate-900/40"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none",
                      isSelected
                        ? "bg-gradient-to-tr from-[#22D3EE] to-[#A78BFA] text-slate-950"
                        : "bg-slate-800 text-slate-300"
                    )}>
                      {displayEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate space-y-0.5">
                      <span className={cn(
                        "text-xs font-bold block",
                        isSelected ? "text-white" : "text-slate-300"
                      )}>
                        @{displayEmail}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[150px]">
                        {contact.lastText}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={12} className={cn(
                    isSelected ? "text-[#22D3EE]" : "text-slate-600"
                  )} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: Active Discussion Window */}
      <div className="md:col-span-2 flex flex-col justify-between bg-slate-950/20 min-h-[500px]">
        {activePartner ? (
          <>
            {/* Active Discussion Title Bar */}
            <div className="p-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/25 flex items-center justify-center text-[#22D3EE]">
                  <User size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white uppercase sm:text-sm">
                    @{activePartner.email.split('@')[0]}
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">
                    ID: {activePartner.id.substring(0, 10)}... (SECURE LINK)
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold tracking-widest text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-2.5 py-1 rounded">
                <Sparkles size={10} className="animate-spin" /> LIVE LEDGER FEED
              </span>
            </div>

            {/* Chats Messages Feed */}
            <div 
              ref={scrollRef}
              className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px] custom-scrollbar"
            >
              {currentPartnerMessages.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <Clock size={20} className="mx-auto text-slate-600 opacity-40 animate-pulse" />
                  <p className="text-xs font-mono font-bold text-slate-400">
                    <AutoTranslate>{t('chats.log_empty', 'START GIG NEGOTIATION')}</AutoTranslate>
                  </p>
                  <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {t('chats.log_empty_desc', 'State your timeline, technical delivery conditions, or revision rules securely down below.')}
                  </p>
                </div>
              ) : (
                currentPartnerMessages.map((msg) => {
                  const isMe = msg.senderId === user.uid;
                  return (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%] rounded-2xl p-4.5 space-y-1 my-1 break-words",
                        isMe 
                          ? "ml-auto bg-gradient-to-tr from-cyan-950/80 via-[#0B0F1E] to-cyan-900/30 border border-cyan-500/20 text-slate-100 rounded-tr-none"
                          : "mr-auto bg-[#1E293B]/70 border border-white/5 text-slate-200 rounded-tl-none"
                      )}
                    >
                      <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">
                        {isMe ? t('chats.me', 'YOU') : `@${msg.senderName.split('@')[0]}`}
                      </span>
                      <p className="text-xs whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input & Quick Reply Controls Footer */}
            <div className="p-4 border-t border-white/5 bg-slate-950/40 space-y-3">
              {/* Quick Reply Row */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSendMessage(undefined, reply)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-[#22D3EE]/10 hover:text-[#22D3EE] border border-white/5 rounded-xl text-[9px] font-mono transition-all uppercase tracking-tight font-extrabold cursor-pointer"
                  >
                    + {reply}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('chats.placeholder', 'Write a message...')}
                  className="flex-1 text-xs bg-[#070A13] border border-white/10 rounded-xl p-3.5 outline-none focus:border-[#22D3EE] text-slate-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-3.5 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#070A13] rounded-xl font-bold transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer"
                  title="Send Message"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-10 text-slate-500 font-mono space-y-3 select-none">
            <MessageSquare size={36} className="text-[#22D3EE]/30 animate-pulse" />
            <h5 className="text-xs uppercase font-extrabold tracking-widest text-[#22D3EE]">
              <AutoTranslate>{t('chats.select_session', 'SELECT INTERACTION THREAD')}</AutoTranslate>
            </h5>
            <p className="text-[10px] text-slate-600 max-w-sm leading-relaxed">
              {t('chats.select_session_desc', 'Open a peer channel on the left to start real-time messaging, review contracts, and build delivery timeline protocols.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarnChat;
