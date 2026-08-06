import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNotifications, NotificationItem } from '../hooks/useNotifications';
import { Coins, MessageSquare, Sparkles, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { notifications } = useNotifications();
  const [lastId, setLastId] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only show toast if it is unread, has a valid ID, and is not the one we just toasted
      if (!latest.isRead && latest.id !== lastId) {
        setLastId(latest.id);

        // Display beautiful custom slide-in toast
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-slate-950 border ${getBorderColor(latest.type)} rounded-2xl p-4 shadow-2xl flex items-start gap-3 backdrop-blur-md pointer-events-auto`}
              onClick={() => {
                toast.dismiss(t.id);
                if (latest.link) {
                  // Direct clean routing
                  window.location.hash = latest.link;
                }
              }}
              style={{ cursor: 'pointer' }}
              id={`toast-item-${latest.id}`}
            >
              {/* Type specific color icon block */}
              <div className={`p-2 rounded-xl border ${getIconBorderColor(latest.type)} shrink-0 flex items-center justify-center`}>
                {getIcon(latest.type)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className={`text-xs font-black uppercase font-mono tracking-wider ${getTextColor(latest.type)}`}>
                  {latest.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1 line-clamp-2">
                  {latest.body}
                </p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toast.dismiss(t.id);
                }}
                className="text-slate-500 hover:text-white shrink-0 p-1 rounded-lg cursor-pointer bg-transparent border-none"
                id={`toast-close-${latest.id}`}
              >
                <X size={12} />
              </button>
            </div>
          ),
          {
            duration: 4000, // 4 seconds as requested
            position: 'bottom-right'
          }
        );
      }
    }
  }, [notifications, lastId]);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return <Coins size={14} className="text-amber-400" />; // gold
      case 'message':
        return <MessageSquare size={14} className="text-blue-400" />; // blue
      case 'ai_result':
        return <Sparkles size={14} className="text-emerald-400" />; // success = green
      case 'system':
      default:
        return <Info size={14} className="text-slate-400" />; // gray
    }
  };

  const getBorderColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit': return 'border-amber-500/30';
      case 'message': return 'border-blue-500/30';
      case 'ai_result': return 'border-emerald-500/30';
      case 'system':
      default: return 'border-slate-800';
    }
  };

  const getIconBorderColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit': return 'border-amber-500/20 bg-amber-500/5';
      case 'message': return 'border-blue-500/20 bg-blue-500/5';
      case 'ai_result': return 'border-emerald-500/20 bg-emerald-500/5';
      case 'system':
      default: return 'border-slate-800 bg-slate-900';
    }
  };

  const getTextColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit': return 'text-amber-400';
      case 'message': return 'text-blue-400';
      case 'ai_result': return 'text-emerald-400';
      case 'system':
      default: return 'text-slate-200';
    }
  };

  return <Toaster position="bottom-right" reverseOrder={false} />;
};

export default ToastNotification;
