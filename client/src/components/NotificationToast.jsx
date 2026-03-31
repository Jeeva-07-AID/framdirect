import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff } from 'lucide-react';
import { subscribe, dismiss, clearAll } from '../services/notificationService';

const COLOR_MAP = {
  emerald: {
    border: 'border-emerald-500/40',
    glow:   'shadow-emerald-500/10',
    badge:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    dot:    'bg-emerald-500',
    bar:    'bg-emerald-500',
  },
  blue: {
    border: 'border-blue-500/40',
    glow:   'shadow-blue-500/10',
    badge:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dot:    'bg-blue-500',
    bar:    'bg-blue-500',
  },
  amber: {
    border: 'border-amber-500/40',
    glow:   'shadow-amber-500/10',
    badge:  'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dot:    'bg-amber-500',
    bar:    'bg-amber-500',
  },
  rose: {
    border: 'border-rose-500/40',
    glow:   'shadow-rose-500/10',
    badge:  'bg-rose-500/20 text-rose-400 border-rose-500/30',
    dot:    'bg-rose-500',
    bar:    'bg-rose-500',
  },
  purple: {
    border: 'border-purple-500/40',
    glow:   'shadow-purple-500/10',
    badge:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dot:    'bg-purple-500',
    bar:    'bg-purple-500',
  },
  cyan: {
    border: 'border-cyan-500/40',
    glow:   'shadow-cyan-500/10',
    badge:  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    dot:    'bg-cyan-500',
    bar:    'bg-cyan-500',
  },
};

const SingleToast = ({ notif, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const colors = COLOR_MAP[notif.color] || COLOR_MAP.blue;

  useEffect(() => {
    const duration = notif.duration || 5000;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          onDismiss(notif.id);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [notif.id, notif.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.85, transition: { duration: 0.2 } }}
      className={`relative w-full bg-slate-900/95 backdrop-blur-xl border ${colors.border} rounded-2xl shadow-2xl ${colors.glow} overflow-hidden`}
      style={{ maxWidth: '380px' }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800">
        <motion.div
          className={`h-full ${colors.bar} origin-left`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="p-4 pt-5">
        <div className="flex items-start gap-3">
          {/* Icon circle */}
          <div className={`w-9 h-9 rounded-xl ${colors.badge} border flex items-center justify-center text-base flex-shrink-0`}>
            {notif.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${colors.badge.split(' ')[1]}`}>
                {notif.label}
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-tight">{notif.title}</p>
            {notif.message && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={() => onDismiss(notif.id)}
            className="p-1 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const unsub = subscribe(setNotifications);
    return unsub;
  }, []);

  const handleDismiss = useCallback((id) => {
    dismiss(id);
  }, []);

  // Show only last 4 at a time
  const visible = notifications.slice(0, 4);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none"
      style={{ width: '380px' }}
    >
      {/* Mute toggle — only show when there are notifications */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setIsMuted(m => !m)}
            className="pointer-events-auto self-end flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-all"
          >
            {isMuted ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
            {notifications.length} alert{notifications.length > 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {!isMuted && visible.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <SingleToast notif={n} onDismiss={handleDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
