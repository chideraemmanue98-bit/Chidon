import { useState, useEffect, useRef } from 'react';
import { 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  Send, 
  Image as ImageIcon, 
  ArrowLeft, 
  Eye, 
  Ban, 
  Flag, 
  User, 
  Loader2, 
  CheckCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { Chat, Message } from '../../hooks/useChat';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  chatId: string;
  onBackToList?: () => void;
  onViewPost: (postId: string) => void;
  chat: Chat;
  sendMessage: (chatId: string, text: string, file?: File | null) => Promise<void>;
  toggleBlockUser: (chatId: string, userId: string, isBlocked: boolean) => Promise<void>;
  reportUser: (chatId: string, userId: string) => Promise<void>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  onBackToList,
  onViewPost,
  chat,
  sendMessage,
  toggleBlockUser,
  reportUser
}) => {
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get other user's info
  const otherUserId = chat.participants.find(uid => uid !== currentUser?.uid) || '';
  const otherUserName = chat.participantNames?.[otherUserId] || 'Chidon Operator';
  const otherUserPhoto = chat.participantPhotos?.[otherUserId];

  // Check block status
  const isMeBlockedByOther = chat.blockedUsers?.includes(currentUser?.uid || '');
  const isOtherBlockedByMe = chat.blockedUsers?.includes(otherUserId);
  const isBlocked = isMeBlockedByOther || isOtherBlockedByMe;

  // Real-time listener for messages in the active chat
  useEffect(() => {
    if (!chatId) return;

    setLoadingMessages(true);
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          senderId: data.senderId,
          text: data.text || '',
          image: data.image,
          createdAt: data.createdAt
        });
      });
      setMessages(msgs);
      setLoadingMessages(false);
      
      // Scroll to bottom on load/update
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }, (error) => {
      console.error('[ChatWindow] Error fetching messages:', error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // File selection handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview('');
  };

  // Submit Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;
    if (!inputText.trim() && !selectedFile) return;

    setSending(true);
    setSendError('');

    try {
      await sendMessage(chatId, inputText, selectedFile);
      setInputText('');
      clearFileSelection();
    } catch (err: any) {
      console.error('[ChatWindow] Error sending message:', err);
      setSendError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getMessageTime = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/10 border border-[var(--border-base)] rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="p-4 bg-[var(--bg-app)] border-b border-[var(--border-base)] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button on mobile */}
          {onBackToList && (
            <button 
              onClick={onBackToList}
              className="md:hidden p-1.5 text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {/* User Photo */}
          {otherUserPhoto ? (
            <img 
              src={otherUserPhoto} 
              alt={otherUserName} 
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-[var(--border-base)]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/10">
              <User size={16} />
            </div>
          )}

          {/* User Name & Post Context */}
          <div className="text-left min-w-0">
            <h4 className="text-xs font-bold text-[var(--text-primary)] truncate leading-tight">
              {otherUserName}
            </h4>
            {chat.postTitle && (
              <p className="text-[10px] text-brand font-medium truncate mt-0.5">
                Re: {chat.postTitle} ({chat.postPrice})
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* View Post */}
          {chat.postId && (
            <button
              onClick={() => onViewPost(chat.postId!)}
              className="p-2 text-brand hover:bg-brand/10 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer border border-brand/15 bg-brand/5 shadow-xs"
              title="View original post"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">View Post</span>
            </button>
          )}

          {/* Block User */}
          <button
            onClick={() => toggleBlockUser(chatId, otherUserId, !!isOtherBlockedByMe)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isOtherBlockedByMe 
                ? 'text-emerald-500 hover:bg-emerald-500/10' 
                : 'text-amber-500 hover:bg-amber-500/10'
            }`}
            title={isOtherBlockedByMe ? 'Unblock user' : 'Block user'}
          >
            <Ban size={14} />
          </button>

          {/* Report User */}
          <button
            onClick={() => {
              if (confirm('Report this operator for suspicious activity or spam?')) {
                reportUser(chatId, currentUser?.uid || '');
                alert('User has been reported to Chidon Intelligence admins.');
              }
            }}
            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Report scam/spam"
          >
            <Flag size={14} />
          </button>
        </div>
      </div>

      {/* MESSAGES DISPLAY PANEL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
        {loadingMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] py-12 gap-2">
            <Loader2 className="animate-spin text-brand" size={24} />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">Synchronizing connection...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[var(--text-secondary)]">
            <p className="text-xs font-medium">No messages yet. Send a message to start negotiating.</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.senderId === 'system') {
              return (
                <div key={msg.id} className="mx-auto max-w-sm py-1.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800/40 border border-[var(--border-base)]/40 text-center select-none">
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
                    📢 {msg.text}
                  </p>
                </div>
              );
            }

            const isMe = msg.senderId === currentUser?.uid;

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[80%] ${
                  isMe ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                {/* Bubble Container */}
                <div className={`p-3.5 rounded-2xl text-left border ${
                  isMe 
                    ? 'bg-brand text-white border-brand/10 rounded-tr-none' 
                    : 'bg-[var(--bg-app)] text-[var(--text-primary)] border-[var(--border-base)] rounded-tl-none shadow-xs'
                }`}>
                  {/* Shared Image */}
                  {msg.image && (
                    <div className="rounded-lg overflow-hidden mb-2 max-w-full border border-black/5 bg-black/5">
                      <img 
                        src={msg.image} 
                        alt="Sent attachment" 
                        referrerPolicy="no-referrer"
                        className="max-h-60 w-full object-contain"
                      />
                    </div>
                  )}

                  {/* Text Message */}
                  {msg.text && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap select-text">
                      {msg.text}
                    </p>
                  )}

                  {/* Footer (Time & Check) */}
                  <div className={`flex items-center gap-1.5 mt-1.5 justify-end text-[9px] font-mono select-none ${
                    isMe ? 'text-white/70' : 'text-[var(--text-secondary)]/80'
                  }`}>
                    <span>{getMessageTime(msg.createdAt)}</span>
                    {isMe && <CheckCheck size={11} className="opacity-90" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* BLOCKED WARNING */}
      {isBlocked && (
        <div className="p-3 bg-amber-500/10 border-t border-b border-amber-500/20 flex items-center justify-center gap-2 text-xs text-amber-500 font-bold select-none select-none">
          <AlertTriangle size={14} />
          {isOtherBlockedByMe 
            ? 'You have blocked this operator. Unblock to resume communications.' 
            : 'This chat is archived or currently unavailable.'}
        </div>
      )}

      {/* INPUT FORM PANEL */}
      <form onSubmit={handleSend} className="p-4 bg-[var(--bg-app)] border-t border-[var(--border-base)] space-y-3 shrink-0">
        {/* Error notification if any */}
        {sendError && (
          <p className="text-[11px] font-semibold text-rose-500 text-left">
            ⚠️ {sendError}
          </p>
        )}

        {/* Selected Image Attachment Preview */}
        {filePreview && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/20 border border-[var(--border-base)] max-w-xs relative text-left">
            <img 
              src={filePreview} 
              alt="Attachment preview" 
              className="w-12 h-12 rounded-lg object-cover border border-black/5"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold block truncate text-[var(--text-primary)]">
                {selectedFile?.name}
              </span>
              <span className="text-[9px] font-medium text-[var(--text-secondary)] block">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
              </span>
            </div>
            <button 
              type="button"
              onClick={clearFileSelection}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Core Inputs Row */}
        <div className="flex items-center gap-2">
          {/* File input / ImageIcon trigger */}
          <div className="relative shrink-0">
            <label 
              className={`p-2.5 flex items-center justify-center rounded-xl border border-[var(--border-base)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] ${
                isBlocked ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={isBlocked || sending}
                className="hidden" 
              />
              <ImageIcon size={16} />
            </label>
          </div>

          {/* Text Input */}
          <input 
            type="text" 
            placeholder={isBlocked ? 'Communications blocked' : 'Type your deal offer or message...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isBlocked || sending}
            className="flex-1 py-2.5 px-4 bg-[var(--bg-app)] text-xs text-[var(--text-primary)] border border-[var(--border-base)] rounded-xl outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all placeholder:text-[var(--text-secondary)]/70"
          />

          {/* Submit Send Button */}
          <button
            type="submit"
            disabled={isBlocked || sending || (!inputText.trim() && !selectedFile)}
            className={`p-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer ${
              isBlocked || sending || (!inputText.trim() && !selectedFile)
                ? 'opacity-45 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95'
            }`}
          >
            {sending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
