import React, { useState } from 'react';
import { 
  Bell, Coins, MessageSquare, Sparkles, Info, Check, Trash2, ChevronLeft, 
  Shield, Inbox, Calendar, ExternalLink 
} from 'lucide-react';
import { useNotifications, NotificationItem } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsPageProps {
  onBack: () => void;
  onNavigateToMessages?: () => void;
}

type TabType = 'all' | 'unread' | 'credit' | 'message';

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

  // Exactly requested tabs: All | Unread | Credits | Messages
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return <Coins size={16} className="text-amber-400" />; // gold
      case 'message':
        return <MessageSquare size={16} className="text-blue-400" />; // blue
      case 'ai_result':
        return <Sparkles size={16} className="text-emerald-400" />; // green (success)
      case 'system':
      default:
        return <Info size={16} className="text-slate-400" />; // gray
    }
  };

  const getNotificationColorClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return 'border-amber-500/20 bg-amber-500/5';
      case 'message':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'ai_result':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'system':
      default:
        return 'border-slate-800 bg-slate-900/50';
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(item => !item.isRead);
      case 'credit':
        return notifications.filter(item => item.type === 'credit');
      case 'message':
        return notifications.filter(item => item.type === 'message');
      case 'all':
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  const formatNotificationTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Recent';
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    if (item.link) {
      if (item.link === '/messages' && onNavigateToMessages) {
        onNavigateToMessages();
      } else {
        window.location.hash = item.link;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-left animate-in fade-in slide-in-from-bottom-8 duration-700" id="notifications-page-main">
      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-850">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all font-mono text-xs font-black uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
          id="back-to-dashboard-btn"
        >
          <ChevronLeft size={16} /> Back to dashboard
        </button>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-3.5 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              id="page-mark-all-read-btn"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => clearAllNotifications()}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              id="page-clear-all-btn"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Brand Section */}
      <div className="space-y-2">
        <span className="text-indigo-400 font-mono text-[10px] uppercase tracking-[0.4em] font-black">ChidonIQ Sovereign Hub</span>
        <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Bell size={28} className="text-indigo-500" /> Notifications
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Real-time logs for system updates, earned credits, deal messages, and automated workspace insights.
        </p>
      </div>

      {/* Tabs list (Exactly: All | Unread | Credits | Messages) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950 border border-slate-850 rounded-2xl" id="notifications-tabs-container">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'credit', label: 'Credits' },
          { id: 'message', label: 'Messages' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer border-none ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
            id={`tab-btn-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3" id="notifications-feed-list">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center bg-slate-950/40 border border-slate-850 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-3"
              id="empty-state-card"
            >
              <Inbox size={32} className="text-slate-600 animate-pulse" />
              <div className="text-slate-500 font-mono text-xs">
                No notifications yet.
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
                  !item.isRead ? 'border-indigo-500/20 bg-indigo-500/5' : ''
                }`}
                id={`page-notification-item-${item.id}`}
              >
                {/* Visual Icon Accent */}
                <div className={`p-3 rounded-2xl border shrink-0 flex items-center justify-center ${getNotificationColorClass(item.type)}`}>
                  {getNotificationIcon(item.type)}
                </div>

                {/* Info and Content */}
                <div className="flex-1 min-w-0 space-y-1.5 cursor-pointer text-left" onClick={() => handleItemClick(item)}>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[9px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/15 shrink-0">
                      #{notifications.length - notifications.indexOf(item)}
                    </span>
                    <h3 className={`text-sm leading-tight text-white ${!item.isRead ? 'font-black' : 'font-bold'}`}>
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 text-[8px] font-mono font-black uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {item.body}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatNotificationTime(item.createdAt)}
                    </span>
                    {item.link && (
                      <button 
                        onClick={() => handleItemClick(item)}
                        className="text-indigo-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer bg-transparent border-none p-0"
                      >
                        <ExternalLink size={10} /> View details
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete/Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer bg-transparent border-none"
                      title="Mark as read"
                      id={`mark-read-btn-${item.id}`}
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer bg-transparent border-none"
                    title="Delete notification"
                    id={`delete-btn-${item.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>


    </div>
  );
};
export default NotificationsPage;
