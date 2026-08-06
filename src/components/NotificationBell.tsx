import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Coins, MessageSquare, Sparkles, Info, Check, Trash2, ExternalLink 
} from 'lucide-react';
import { useNotifications, NotificationItem } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationBellProps {
  onNavigateToNotifications: () => void;
  onNavigateToMessages?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  onNavigateToNotifications,
  onNavigateToMessages
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      if (seconds < 10) return 'Just now';
      if (seconds < 60) return `${seconds}s ago`;
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recent';
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return <Coins size={14} className="text-amber-400" />; // Gold
      case 'message':
        return <MessageSquare size={14} className="text-blue-400" />; // Blue
      case 'ai_result':
        return <Sparkles size={14} className="text-purple-400" />; // Purple/Orange
      case 'system':
      default:
        return <Info size={14} className="text-slate-400" />; // Gray
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    await markAsRead(item.id);
    setIsOpen(false);
    
    if (item.link) {
      if (item.link === '/messages' && onNavigateToMessages) {
        onNavigateToMessages();
      } else {
        // Handle other route/link navigation
        window.location.hash = item.link; // or navigate
      }
    } else {
      onNavigateToNotifications();
    }
  };

  const handleBellClick = (e: React.MouseEvent) => {
    // Mobile Check: If screen is mobile size (< 768px), navigate directly to page as per UX specifications
    if (window.innerWidth < 768) {
      onNavigateToNotifications();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} id="notification-bell-container">
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
        title="Notifications"
        id="notification-bell-btn"
      >
        <Bell size={16} className={unreadCount > 0 ? "animate-bounce" : ""} />
        
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-mono font-bold text-white ring-2 ring-slate-950"
            id="notification-badge"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Animated Dropdown (Desktop only) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2.5 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left"
            id="notification-bell-dropdown"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-950">
              <span className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={14} className="text-indigo-400" /> Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none p-0"
                  id="mark-all-read-btn"
                >
                  <Check size={10} /> Mark all read
                </button>
              )}
            </div>

            {/* List: Last 10 notifications as requested */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-900/60 custom-scrollbar bg-slate-950">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-[11px]" id="no-notifications-fallback">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 10).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-900/40 transition-all group relative cursor-pointer ${
                      !item.isRead ? 'bg-indigo-500/5' : ''
                    }`}
                    id={`dropdown-notification-item-${item.id}`}
                  >
                    {/* Icon */}
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-850 mt-0.5 shrink-0 flex items-center justify-center">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-[11px] leading-tight text-white line-clamp-1 ${!item.isRead ? 'font-bold' : 'font-medium'}`}>
                          {item.title}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                        {item.body}
                      </p>
                      
                      {item.link && (
                        <span className="text-[8px] font-mono text-indigo-400 hover:underline flex items-center gap-0.5 mt-1.5">
                          <ExternalLink size={8} /> Click to view
                        </span>
                      )}
                    </div>

                    {/* Unread dot / Delete button */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-1">
                      {!item.isRead ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
                      ) : (
                        <span className="w-1.5 h-1.5 mt-1" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition-all mt-auto cursor-pointer bg-transparent border-none"
                        title="Delete notification"
                        id={`delete-btn-${item.id}`}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToNotifications();
              }}
              className="w-full py-3 bg-slate-900/80 hover:bg-slate-900 border-t border-slate-850 text-[10px] font-mono font-bold text-center text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider cursor-pointer border-none"
              id="view-all-notifications-footer"
            >
              View All Notifications ({notifications.length})
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default NotificationBell;
