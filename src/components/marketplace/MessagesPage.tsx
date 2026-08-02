import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  Clock, 
  Loader2, 
  AlertTriangle, 
  MessageCircle, 
  ArrowLeft 
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { Chat, useChat } from '../../hooks/useChat';
import { ChatWindow } from './ChatWindow';
import { formatDistanceToNow } from 'date-fns';

interface MessagesPageProps {
  activeChatId: string | null;
  onSelectChatId: (chatId: string | null) => void;
  onViewPost: (postId: string) => void;
  chatTools: ReturnType<typeof useChat>;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  activeChatId,
  onSelectChatId,
  onViewPost,
  chatTools
}) => {
  const currentUser = auth.currentUser;
  const { chats, loadingChats, sendMessage, markAsRead, toggleBlockUser, reportUser } = chatTools;

  // Selected Chat State
  const activeChat = chats.find(c => c.id === activeChatId);

  // Automatically mark as read when selecting/changing active chat
  useEffect(() => {
    if (activeChatId) {
      markAsRead(activeChatId);
    }
  }, [activeChatId, chats]);

  const getLastMessageTime = (chat: Chat) => {
    if (!chat.lastMessageAt) return '';
    try {
      const date = chat.lastMessageAt.toDate ? chat.lastMessageAt.toDate() : new Date(chat.lastMessageAt);
      return formatDistanceToNow(date, { addSuffix: false })
        .replace('about', '')
        .replace('less than a minute ago', 'now')
        .replace('minutes', 'm')
        .replace('minute', 'm')
        .replace('hours', 'h')
        .replace('hour', 'h')
        .replace('days', 'd')
        .replace('day', 'd')
        .trim();
    } catch {
      return '';
    }
  };

  if (!currentUser) {
    return (
      <div className="py-20 text-center border border-[var(--border-base)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/5 max-w-md mx-auto p-8 space-y-4 text-left">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full w-fit">
          <AlertTriangle size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Authorization Required</h4>
          <p className="text-xs text-[var(--text-secondary)]">
            You must be signed in with a valid Chidon user account to read or write deal negotiations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[75vh] min-h-[500px] flex gap-4 text-left">
      
      {/* LEFT CHATS LIST COLUMN */}
      <div className={`w-full md:w-80 lg:w-96 shrink-0 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl flex flex-col overflow-hidden ${
        activeChatId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-[var(--border-base)] shrink-0 flex items-center gap-2">
          <MessageCircle className="text-brand" size={18} />
          <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)]">
            My Deal Chats
          </h3>
        </div>

        {/* Chats History List container */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-base)]/40 p-2 space-y-1">
          {loadingChats ? (
            <div className="py-12 flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2">
              <Loader2 className="animate-spin text-brand" size={20} />
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Syncing channels...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-secondary)] px-4 space-y-2">
              <MessageSquare className="mx-auto text-[var(--text-secondary)]/40" size={24} />
              <p className="text-xs font-semibold">No active negotiations</p>
              <p className="text-[10px] leading-relaxed text-[var(--text-secondary)]/80 max-w-xs mx-auto">
                Select an ad listing from the marketplace and initiate a chat to start negotiating a transaction.
              </p>
            </div>
          ) : (
            chats.map(chat => {
              const otherId = chat.participants.find(uid => uid !== currentUser.uid) || '';
              const otherName = chat.participantNames?.[otherId] || 'Chidon Operator';
              const otherPhoto = chat.participantPhotos?.[otherId];
              const isActive = chat.id === activeChatId;
              const unreadCount = chat.unreadCounts?.[currentUser.uid] || 0;

              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChatId(chat.id)}
                  className={`w-full flex gap-3 p-3 rounded-xl transition-all border text-left cursor-pointer items-start ${
                    isActive 
                      ? 'bg-brand/10 text-brand border-brand/20 shadow-xs' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/20 text-[var(--text-secondary)] border-transparent'
                  }`}
                >
                  {/* User Photo */}
                  {otherPhoto ? (
                    <img 
                      src={otherPhoto} 
                      alt={otherName} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-[var(--border-base)] mt-0.5 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/10 mt-0.5 shrink-0">
                      <User size={18} />
                    </div>
                  )}

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-baseline justify-between gap-1.5">
                      <h4 className={`text-xs font-bold truncate ${
                        isActive ? 'text-brand' : 'text-[var(--text-primary)]'
                      }`}>
                        {otherName}
                      </h4>
                      <span className="text-[9px] font-mono text-[var(--text-secondary)]/80 shrink-0">
                        {getLastMessageTime(chat)}
                      </span>
                    </div>

                    {chat.postTitle && (
                      <p className="text-[10px] font-bold text-brand truncate">
                        🏷️ {chat.postTitle}
                      </p>
                    )}

                    <p className={`text-[11px] truncate ${
                      unreadCount > 0 
                        ? 'font-bold text-[var(--text-primary)]' 
                        : 'text-[var(--text-secondary)]/80'
                    }`}>
                      {chat.lastMessage}
                    </p>
                  </div>

                  {/* Unread Counter Badge */}
                  {unreadCount > 0 && (
                    <span className="shrink-0 min-w-5 h-5 px-1 bg-brand text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow-sm select-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT ACTIVE CHAT PANEL */}
      <div className={`flex-1 h-full ${
        activeChatId ? 'flex' : 'hidden md:flex'
      }`}>
        {activeChatId && activeChat ? (
          <ChatWindow
            chatId={activeChatId}
            onBackToList={() => onSelectChatId(null)}
            onViewPost={onViewPost}
            chat={activeChat}
            sendMessage={sendMessage}
            toggleBlockUser={toggleBlockUser}
            reportUser={reportUser}
          />
        ) : (
          <div className="flex-grow bg-[var(--bg-app)] border border-[var(--border-base)] rounded-2xl flex flex-col items-center justify-center text-center p-8 text-[var(--text-secondary)]">
            <div className="p-4 bg-brand/5 border border-brand/10 text-brand rounded-2xl mb-3">
              <MessageCircle size={28} />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Select a Conversation</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm">
              Click any active developer discussion panel on the left list, or initiate contact on a post in the directory to start a secure chat.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
