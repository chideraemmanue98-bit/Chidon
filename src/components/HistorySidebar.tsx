import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Clock, 
  Check, 
  Loader2, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { ChatHistoryMessage } from '../hooks/useChatHistory';
import { cn } from '../lib/utils';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatHistoryMessage[];
  loading: boolean;
  onSelect: (msg: ChatHistoryMessage) => void;
  onWrapUp: (msg: ChatHistoryMessage) => Promise<void>;
  onDelete: (msgId: string) => Promise<void>;
}

export default function HistorySidebar({
  isOpen,
  onClose,
  messages,
  loading,
  onSelect,
  onWrapUp,
  onDelete
}: HistorySidebarProps) {
  const [wrappingIds, setWrappingIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleWrapUpClick = async (e: React.MouseEvent, msg: ChatHistoryMessage) => {
    e.stopPropagation();
    if (wrappingIds.includes(msg.id)) return;
    setWrappingIds(prev => [...prev, msg.id]);
    try {
      await onWrapUp(msg);
    } catch (err) {
      console.error(err);
    } finally {
      setWrappingIds(prev => prev.filter(id => id !== msg.id));
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (deletingIds.includes(msgId)) return;
    setDeletingIds(prev => [...prev, msgId]);
    try {
      await onDelete(msgId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== msgId));
    }
  };

  // Helper to calculate days remaining
  const getDaysRemaining = (expireAt: any) => {
    if (!expireAt) return 7;
    const expiryDate = typeof expireAt.toDate === 'function' ? expireAt.toDate() : new Date(expireAt);
    const diffTime = expiryDate.getTime() - Date.now();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return diffDays;
  };

  const getFormattedDate = (createdAt: any) => {
    if (!createdAt) return '';
    const date = typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-40 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-base)] shadow-2xl z-50 flex flex-col text-left"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-base)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-brand" />
                  <span>Feature Intelligence Logs</span>
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono tracking-wider mt-0.5 uppercase">7-Day Auto Delete Enabled</p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-[var(--border-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                  <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">Querying history logs...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 px-4 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-base)] flex items-center justify-center mx-auto text-slate-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">No History Found</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] max-w-[240px] mx-auto mt-1 leading-relaxed">
                      Generations are auto-saved here. Perform your first run to establish persistent state.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const daysRemaining = getDaysRemaining(msg.expireAt);
                  const isWrapping = wrappingIds.includes(msg.id);
                  const isDeleting = deletingIds.includes(msg.id);

                  return (
                    <div
                      key={msg.id}
                      onClick={() => onSelect(msg)}
                      className={cn(
                        "group p-5 bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] hover:border-brand/30 rounded-2xl transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col space-y-4"
                      )}
                    >
                      {/* Expire Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)]">
                          {getFormattedDate(msg.createdAt)}
                        </span>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                          daysRemaining <= 2
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          Expires in {daysRemaining}d
                        </span>
                      </div>

                      {/* Prompt */}
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2">
                          {msg.prompt}
                        </h4>
                      </div>

                      {/* Wrapped up Summary if present */}
                      {msg.wrappedUp && (
                        <div className="p-3 bg-brand/5 border border-brand/10 rounded-xl space-y-1.5 text-left text-xs text-[var(--text-secondary)]">
                          <span className="text-[9px] font-mono font-bold text-brand uppercase tracking-wider block">✓ Bullet Wrap-Up Summary</span>
                          <ul className="list-disc list-inside space-y-1">
                            {msg.wrappedUp.split('\n').filter(l => l.trim()).slice(0, 3).map((bullet, idx) => (
                              <li key={idx} className="line-clamp-2">
                                {bullet.replace(/^-\s*/, '').replace(/^\*\s*/, '')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-base)] gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelect(msg); }}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-[var(--border-base)] hover:border-[var(--text-primary)] rounded-lg text-[10px] uppercase tracking-wider font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink size={12} />
                          <span>Load</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {!msg.wrappedUp && (
                            <button
                              onClick={(e) => handleWrapUpClick(e, msg)}
                              disabled={isWrapping || isDeleting}
                              className="px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                            >
                              {isWrapping ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Zap size={11} />
                              )}
                              <span>Wrap Up</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDeleteClick(e, msg.id)}
                            disabled={isWrapping || isDeleting}
                            className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-slate-400 border border-[var(--border-base)] rounded-lg hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-40"
                            title="Delete permanently"
                          >
                            {isDeleting ? (
                              <Loader2 size={12} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with subscription info */}
            <div className="p-6 border-t border-[var(--border-base)] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Account Node</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-emerald-500 font-mono uppercase tracking-wider">Subscription Active</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
