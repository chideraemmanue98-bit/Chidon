import React, { useState } from 'react';
import { 
  Bell, Coins, MessageSquare, Zap, Info, Check, Trash2, ChevronLeft, 
  Shield, Inbox, Calendar, ExternalLink, X, HelpCircle, AlertCircle
} from 'lucide-react';
import { useNotifications, NotificationItem } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsPageProps {
  onBack: () => void;
  onNavigateToMessages?: () => void;
}

type TabType = 'all' | 'unread' | 'system' | 'message' | 'credit';

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

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return <Coins size={18} className="text-amber-600" />;
      case 'message':
        return <MessageSquare size={18} className="text-blue-600" />;
      case 'ai_result':
        return <Zap size={18} className="text-emerald-600" />;
      case 'system':
      default:
        return <Info size={18} className="text-slate-600" />;
    }
  };

  const getNotificationColorClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return 'border-amber-200 bg-amber-50';
      case 'message':
        return 'border-blue-200 bg-blue-50';
      case 'ai_result':
        return 'border-emerald-200 bg-emerald-50';
      case 'system':
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(item => !item.isRead);
      case 'system':
        return notifications.filter(item => item.type === 'system');
      case 'message':
        return notifications.filter(item => item.type === 'message');
      case 'credit':
        return notifications.filter(item => item.type === 'credit');
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
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Recent';
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    // Set to view details modal
    setSelectedNotification(item);
  };

  const handleNavigateFromLink = (link: string) => {
    if (!link) return;
    setSelectedNotification(null);
    if (link === '/messages' && onNavigateToMessages) {
      onNavigateToMessages();
    } else {
      window.location.hash = link;
    }
  };

  return (
    <div id="notifications-page-main" className="min-h-screen w-full bg-slate-50/70 py-10 px-4 md:px-8 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-mono text-xs font-black uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
            id="back-to-dashboard-btn"
          >
            <ChevronLeft size={16} /> Back to dashboard
          </button>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                id="page-mark-all-read-btn"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => clearAllNotifications()}
                className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                id="page-clear-all-btn"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Brand Section */}
        <div className="space-y-2">
          <span className="text-indigo-600 font-mono text-[10px] uppercase tracking-[0.4em] font-black block">ChidonIQ Core Engine</span>
          <h2 className="text-3xl font-display font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Bell size={28} className="text-indigo-600" /> Notifications Feed
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
            Real-time logs for system events, credit bonuses, transaction updates, and automated platform recommendations.
          </p>
        </div>

        {/* Tabs Selection Container */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl" id="notifications-tabs-container">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'system', label: '🛡️ System' },
            { id: 'message', label: '💬 Messages' },
            { id: 'credit', label: '🪙 Credits' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer border-none ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-md font-extrabold border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
              id={`tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Notifications Feed - Pure White Background and Deep Black Text */}
        <div className="space-y-4" id="notifications-feed-list">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-16 text-center bg-white border border-slate-200/80 rounded-3xl flex flex-col items-center justify-center space-y-4 shadow-sm"
                id="empty-state-card"
              >
                <div className="p-4 bg-slate-50 rounded-full">
                  <Inbox size={32} className="text-slate-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Your Inbox is Clean</h4>
                  <p className="text-xs text-slate-500 font-mono">No notifications fit this category filter.</p>
                </div>
              </motion.div>
            ) : (
              filteredNotifications.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-5 rounded-3xl border transition-all flex items-start gap-5 bg-white shadow-sm hover:shadow-md hover:border-slate-300 ${
                    !item.isRead 
                      ? 'border-l-4 border-l-indigo-600 border-slate-200' 
                      : 'border-slate-200'
                  }`}
                  id={`page-notification-item-${item.id}`}
                >
                  {/* Visual Icon Accent (colored lightly, elegant border) */}
                  <div className={`p-3.5 rounded-2xl border shrink-0 flex items-center justify-center ${getNotificationColorClass(item.type)}`}>
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Info and Content Block (Black Deep Text on White Card) */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-left">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="text-[9px] font-mono font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 shrink-0">
                        #{notifications.length - notifications.indexOf(item)}
                      </span>
                      <h3 className={`text-sm leading-tight text-slate-900 ${!item.isRead ? 'font-black' : 'font-bold'}`}>
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-mono font-black uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    
                    {/* Deep Black Text Notification Body */}
                    <p className="text-xs text-slate-800 font-medium leading-relaxed max-w-2xl">
                      {item.body}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {formatNotificationTime(item.createdAt)}
                      </span>
                      
                      {/* Fixed working View Details button triggers full details modal overlay */}
                      <button 
                        onClick={() => handleItemClick(item)}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-bold cursor-pointer bg-transparent border-none p-0"
                      >
                        <ExternalLink size={10} /> View details
                      </button>
                    </div>
                  </div>

                  {/* Right Side Controls */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="p-2 text-indigo-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer bg-transparent border-none"
                        title="Mark as read"
                        id={`mark-read-btn-${item.id}`}
                      >
                        <Check size={14} className="stroke-[3]" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer bg-transparent border-none"
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

      {/* DETAILED NOTIFICATION MODAL (Overlays with White Page and Deep Black Text) */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-900"
              id="notification-detail-modal"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${getNotificationColorClass(selectedNotification.type)}`}>
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">
                    {selectedNotification.type} Notification
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content body */}
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-black tracking-tight text-slate-950 leading-tight">
                  {selectedNotification.title}
                </h3>
                
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-900 font-semibold leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.body}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} /> {formatNotificationTime(selectedNotification.createdAt)}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    ID: {selectedNotification.id.slice(0, 10)}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer bg-white"
                >
                  Close Window
                </button>
                {selectedNotification.link && (
                  <button
                    onClick={() => handleNavigateFromLink(selectedNotification.link)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10 border-none"
                  >
                    Take Action <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default NotificationsPage;
