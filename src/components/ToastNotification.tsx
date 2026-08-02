import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, MessageSquare, Cpu, Info } from 'lucide-react';
import { useNotifications, NotificationItem } from '../hooks/useNotifications';

export const ToastNotification: React.FC = () => {
  const { notifications } = useNotifications();
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only trigger a toast for unread notifications and if it is a NEW notification ID
      if (!latest.read && latest.id !== lastNotificationId) {
        // Double check if it is very recent (e.g., within past minute or so) to prevent stale initial-load triggers
        setActiveToast(latest);
        setLastNotificationId(latest.id);

        // Auto close after 5 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, lastNotificationId]);

  if (!activeToast) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'credit':
        return <Coins size={14} className="text-cyan-400" />;
      case 'message':
        return <MessageSquare size={14} className="text-purple-400" />;
      case 'ai':
        return <Cpu size={14} className="text-amber-400" />;
      case 'system':
      default:
        return <Info size={14} className="text-emerald-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full" id="realtime-toast-notification">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-start gap-3 backdrop-blur-md"
        >
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            {getIcon(activeToast.type)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-xs font-black text-white uppercase font-mono tracking-wider">
              {activeToast.title}
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
              {activeToast.message}
            </p>
          </div>
          <button 
            onClick={() => setActiveToast(null)}
            className="text-slate-500 hover:text-white shrink-0 p-1 rounded-lg cursor-pointer"
          >
            <X size={12} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default ToastNotification;
