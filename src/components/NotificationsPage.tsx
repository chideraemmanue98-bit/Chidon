import React, { useState } from 'react';
import { 
  Bell, Coins, MessageSquare, Cpu, Info, Check, Trash2, ChevronLeft, 
  Shield, Inbox, Eye, Calendar, ExternalLink 
} from 'lucide-react';
import { useNotifications, NotificationItem } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsPageProps {
  onBack: () => void;
  onNavigateToMessages?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ 
  onBack,
  onNavigateToMessages
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications 
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'credit' | 'message' | 'ai' | 'system'>('all');

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return <Coins size={16} className="text-cyan-400" />;
      case 'message':
        return <MessageSquare size={16} className="text-purple-400" />;
      case 'ai':
        return <Cpu size={16} className="text-amber-400" />;
      case 'system':
      default:
        return <Info size={16} className="text-emerald-400" />;
    }
  };

  const getNotificationColorClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return 'border-cyan-500/20 bg-cyan-500/5';
      case 'message':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'ai':
        return 'border-amber-500/20 bg-amber-500/5';
      case 'system':
      default:
        return 'border-emerald-500/20 bg-emerald-500/5';
    }
  };

  const filteredNotifications = notifications.filter(
    (item) => activeFilter === 'all' || item.type === activeFilter
  );

  const formatNotificationTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Recent';
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      markAsRead(item.id);
    }
    if (item.link === '/messages' && onNavigateToMessages) {
      onNavigateToMessages();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-850">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all font-mono text-xs font-black uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to dashboard
        </button>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => clearAllNotifications()}
              className="px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Main Brand Section */}
      <div className="space-y-2">
        <span className="text-indigo-400 font-mono text-[10px] uppercase tracking-[0.4em] font-black">ChidonIQ Sovereign Hub</span>
        <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Bell size={28} className="text-indigo-500" /> Notifications
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Real-time notification records mapping credit topups, deal client messages, automated optimization insights, and secure transactions.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950 border border-slate-850 rounded-2xl">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'credit', label: 'Credits' },
          { id: 'message', label: 'Messages' },
          { id: 'ai', label: 'AI Results' },
          { id: 'system', label: 'System Updates' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${
              activeFilter === filter.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Notifications feed list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center bg-slate-950/40 border border-slate-850 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-3"
            >
              <Inbox size={32} className="text-slate-600" />
              <div className="text-slate-500 font-mono text-xs">
                No notifications match your current filters.
              </div>
            </motion.div>
          ) : (
            filteredNotifications.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-3xl border border-slate-800 bg-slate-950/60 transition-all flex items-start gap-4 group hover:border-slate-700 hover:bg-slate-950 ${
                  !item.read ? 'border-indigo-500/20' : ''
                }`}
              >
                {/* Visual Icon Accent */}
                <div className={`p-3 rounded-2xl border shrink-0 ${getNotificationColorClass(item.type)}`}>
                  {getNotificationIcon(item.type)}
                </div>

                {/* Info and Content */}
                <div className="flex-1 min-w-0 space-y-1.5" onClick={() => handleItemClick(item)}>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className={`text-sm leading-tight text-white ${!item.read ? 'font-black' : 'font-bold'}`}>
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[8px] font-mono font-black uppercase">
                        Unread
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatNotificationTime(item.createdAt)}
                    </span>
                    {item.link && (
                      <button 
                        onClick={() => handleItemClick(item)}
                        className="text-indigo-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        <ExternalLink size={10} /> View details
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete/Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Info security notice */}
      <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center gap-3 text-[10px] font-mono text-slate-500">
        <Shield size={16} className="text-indigo-400 shrink-0" />
        <span>Sovereign Notification audit records are protected in Firestore secure collections. They are only retrievable inside your isolated node.</span>
      </div>
    </div>
  );
};
