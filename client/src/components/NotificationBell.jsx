import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { subscribe, dismiss, clearAll } from '../services/notificationService';

const COLOR_MAP = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  rose:    'text-rose-400 bg-rose-500/10 border-rose-500/20',
  purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  cyan:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  slate:   'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const unsub = subscribe(setNotifications);
    return unsub;
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const unreadCount = notifications.length;

  const formatTime = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-rose-500/30"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
            className="absolute right-0 top-12 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[9px] font-black text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              <AnimatePresence>
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center px-4"
                  >
                    <CheckCheck className="w-8 h-8 text-slate-700 mb-3" />
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">All clear</p>
                    <p className="text-[10px] text-slate-700 mt-1">No new notifications</p>
                  </motion.div>
                ) : (
                  notifications.map(n => {
                    const colorClass = COLOR_MAP[n.color] || COLOR_MAP.slate;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                      >
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm shrink-0 mt-0.5 ${colorClass}`}>
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
                          {n.message && (
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          )}
                          <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest">
                            {formatTime(n.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="p-1 rounded-lg text-slate-700 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
